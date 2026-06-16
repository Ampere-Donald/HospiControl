# PLAN D'IMPLÉMENTATION — Carnet Médical Numérique (MVP)

> **À lire par l'agent de code (Claude Code / Codex) et par le développeur.**
> Ce plan complète `CONTEXTE.md`. Le CONTEXTE décrit *quoi* construire ; ce document décrit *dans quel ordre* et *comment*.
> Travaille **une phase à la fois**, dans l'ordre. Ne commence une phase que lorsque la « Définition de terminé » de la précédente est validée.
> Respecte strictement le périmètre MVP (section 3 du CONTEXTE). Tout ce qui est en section 12 du CONTEXTE est **interdit** dans ce plan.

---

## Principes de développement

1. **Fondations d'abord, fonctionnalités ensuite.** On installe le socle (base de données, auth, rôles) avant toute fonctionnalité métier.
2. **Backend avant frontend** pour chaque fonctionnalité : on expose l'API, on la teste, puis on branche l'écran.
3. **Sécurité par défaut** : chaque endpoint vérifie le rôle ET l'hôpital de l'utilisateur (`hopitalId`).
4. **Une phase = un livrable testable.** À la fin de chaque phase, on doit pouvoir démontrer quelque chose qui marche.
5. **Source de vérité = `CONTEXTE.md`.** En cas de doute sur une règle métier ou un champ, se référer au CONTEXTE, pas inventer.

## Stack et conventions

- **Backend** : NestJS + Prisma + PostgreSQL. Architecture par modules (`auth`, `hopitaux`, `utilisateurs`, `patients`, `carnet`, `consentements`).
- **Frontend** : Next.js (App Router) + Tailwind. Appels API via un client centralisé qui injecte le token JWT.
- **Auth** : JWT (access token). Hachage des mots de passe avec argon2 (ou bcrypt).
- **Base** : une migration Prisma par évolution du schéma. Jamais de modification manuelle de la base.
- **Langue** : tout le contenu visible par l'utilisateur est en français.
- **Commits** : petits et descriptifs (ex. `feat(auth): login + jwt guard`).

---

## PHASE 0 — Initialisation du projet

**Objectif :** avoir un projet qui démarre, connecté à PostgreSQL, avec le schéma de données en place et des données de départ.

**Tâches**
- [ ] Initialiser le backend NestJS et le frontend Next.js (deux dossiers : `/backend`, `/frontend`).
- [ ] Configurer les variables d'environnement (`.env`) : `DATABASE_URL`, `JWT_SECRET`.
- [ ] Installer et initialiser Prisma ; coller le **schéma complet de la section 9 du `CONTEXTE.md`**.
- [ ] Lancer la première migration (`prisma migrate dev`).
- [ ] Écrire un script de seed qui crée : 1 `SUPER_ADMIN`, 2 hôpitaux de démo (« Hôpital A », « Hôpital B »).
- [ ] Configurer Tailwind + un layout de base sur le frontend.

**Définition de terminé :** le serveur backend démarre, la base est connectée, la migration est appliquée, le seed s'exécute sans erreur et crée les 2 hôpitaux + le super admin.

---

## PHASE 1 — Authentification & contrôle d'accès (RBAC)

**Objectif :** un utilisateur peut se connecter, et l'accès est limité selon son rôle et son hôpital.

**Tâches**
- [ ] Module `auth` : endpoint `POST /auth/login` (email + mot de passe → JWT).
- [ ] Hachage et vérification du mot de passe (argon2/bcrypt).
- [ ] Le JWT contient : `userId`, `role`, `hopitalId`.
- [ ] `JwtAuthGuard` (protège les routes) + `RolesGuard` (vérifie le rôle requis).
- [ ] Helper pour filtrer automatiquement par `hopitalId` selon l'utilisateur connecté.
- [ ] Frontend : page de connexion, stockage du token, redirection, routes protégées.

**Définition de terminé :** un utilisateur de démo peut se connecter ; une route protégée refuse l'accès sans token ; un rôle non autorisé reçoit une erreur 403.

---

## PHASE 2 — Gestion des hôpitaux & des utilisateurs

**Objectif :** créer et gérer les hôpitaux (par le super admin) et leurs utilisateurs (par l'admin de l'hôpital).

**Tâches**
- [ ] Module `hopitaux` : CRUD réservé au `SUPER_ADMIN`.
- [ ] Module `utilisateurs` : un `ADMIN_HOPITAL` crée/gère les utilisateurs de **son** hôpital uniquement (médecin, accueil).
- [ ] Empêcher un admin de toucher aux utilisateurs d'un autre hôpital.
- [ ] Frontend : écran super admin (liste + création d'hôpitaux) ; écran admin hôpital (liste + création d'utilisateurs).

**Définition de terminé :** le super admin crée un hôpital ; l'admin de cet hôpital se connecte et crée un médecin et un agent d'accueil rattachés à son hôpital.

---

## PHASE 3 — Patients (identité globale par téléphone)

**Objectif :** rechercher un patient par téléphone et le créer s'il n'existe pas, sans jamais créer de doublon.

**Tâches**
- [ ] Endpoint `GET /patients/recherche?telephone=...` → retourne le patient existant ou « non trouvé ».
- [ ] Endpoint `POST /patients` → crée un patient (téléphone **unique** global). Rejeter si le téléphone existe déjà.
- [ ] Endpoint `GET /patients/:id` → fiche patient (infos de base).
- [ ] Frontend : barre de recherche par téléphone ; formulaire de création ; page profil patient (nom, prénom, date de naissance, sexe, groupe sanguin, adresse).

**Définition de terminé :** une recherche par téléphone retrouve un patient déjà créé par un autre hôpital ; tenter de créer un patient avec un téléphone existant est refusé proprement.

---

## PHASE 4 — Carnet médical (antécédents, consultations, prescriptions)

**Objectif :** un médecin lit le carnet d'un patient et y ajoute consultations, prescriptions et antécédents — pour son propre hôpital.

**Tâches**
- [ ] Module `carnet` : endpoints antécédents (créer / lister par patient), avec `type` (médical, chirurgical, familial, allergie) et `hopitalCreateurId`.
- [ ] Consultations : `POST /consultations` (motif, diagnostic, notes), automatiquement rattachées au `hopitalId` et au `medecinId` de l'utilisateur connecté.
- [ ] Prescriptions : ajout de médicaments (nom, posologie, durée) à une consultation.
- [ ] Endpoint `GET /patients/:id/carnet` → renvoie antécédents + consultations + prescriptions (filtré par les règles de la Phase 5).
- [ ] Frontend : vue « carnet du patient » (historique chronologique) ; formulaire « nouvelle consultation » (médecin) ; ajout d'antécédent.

**Définition de terminé :** un médecin de l'Hôpital A crée une consultation avec une prescription pour un patient ; elle apparaît dans le carnet de ce patient.

---

## PHASE 5 — Consentement & partage inter-hôpitaux (LE CŒUR DU PROJET)

**Objectif :** appliquer la règle de partage — un hôpital voit toujours ses propres données, mais ne voit l'historique des autres hôpitaux **que si le patient l'a autorisé**.

**Tâches**
- [ ] Module `consentements` : `POST` (demander/enregistrer autorisation), `PATCH` (révoquer), `GET` (statut pour un patient + hôpital).
- [ ] Contrainte d'unicité `(patientId, hopitalId)` et trace de la date (`dateModification`).
- [ ] **Logique de lecture du carnet** (à appliquer dans `GET /patients/:id/carnet`) :
  - inclure systématiquement les données dont `hopitalId` / `hopitalCreateurId` = hôpital de l'utilisateur connecté ;
  - inclure les données des **autres** hôpitaux **uniquement** s'il existe un consentement `AUTORISE` pour ce patient et cet hôpital.
- [ ] Gérer la révocation : statut `REVOQUE` → l'hôpital reperd l'accès aux données des autres (mais garde les siennes).
- [ ] Frontend : écran de gestion du consentement (autoriser / révoquer, saisi par l'accueil) ; dans le carnet, distinguer visuellement « données de cet hôpital » et « données partagées ».

**Définition de terminé :** le **scénario de démonstration complet (section 8 du `CONTEXTE.md`)** fonctionne de bout en bout — l'Hôpital B ne voit l'historique de l'Hôpital A qu'après consentement, et la révocation retire bien l'accès.

---

## PHASE 6 — Finitions & préparation de la soutenance

**Objectif :** un MVP propre, démontrable, avec un jeu de données de démo prêt.

**Tâches**
- [ ] Enrichir le seed avec un scénario complet : patient « Jean » (téléphone de démo) + antécédents + 1 consultation créés par l'Hôpital A.
- [ ] Validations de formulaire et messages d'erreur clairs en français.
- [ ] Soigner l'UI (lisible, simple, cohérente).
- [ ] Écrire un `README` : installation, lancement, comptes de démo, déroulé du scénario.
- [ ] Déploiement de démo (Railway pour la base + API, Vercel pour le front).
- [ ] Répétition du parcours de démonstration de A à B.

**Définition de terminé :** on peut dérouler le scénario complet sur l'environnement de démo, sans bug bloquant, prêt à présenter au jury.

---

## Stratégie de test (légère, adaptée au MVP)

- **Validation par phase** : après chaque phase, vérifier manuellement la « Définition de terminé ».
- **Test end-to-end prioritaire** : le scénario de la section 8 du CONTEXTE (patient qui passe de A à B avec consentement) doit toujours marcher — c'est le test qui compte le plus.
- **Tests unitaires** : se concentrer sur la logique de lecture du carnet (Phase 5), car c'est la règle métier la plus critique.

## Ordre recommandé des prompts à donner à l'agent

1. « Lis `CONTEXTE.md` et `PLAN_IMPLEMENTATION.md`. Exécute uniquement la **Phase 0**. »
2. À chaque fois, valider la phase, faire un commit, puis : « Passe à la **Phase N+1**, sans déborder du périmètre. »
3. Ne jamais demander plusieurs phases d'un coup : une phase = un échange = un livrable vérifiable.

## Périmètre — rappel des interdits (NE PAS faire dans ce MVP)

IA / résumé / OCR · mode hors-ligne · app patient dédiée · paiements MoMo · facturation · assurances · pharmacie/stock · laboratoire · imagerie · téléconsultation · FHIR/HL7. → tout cela est en **phase future** (section 12 du CONTEXTE).
