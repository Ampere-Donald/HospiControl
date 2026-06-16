# CONTEXTE — Carnet Médical Numérique (MVP)

> **À lire par l'agent de code (Claude Code / Codex).**
> Ce document décrit QUOI construire pour le MVP. Reste strictement dans le périmètre défini en section 3. Tout ce qui est en section 12 est HORS PÉRIMÈTRE pour cette version.
> Nom du projet : *provisoire — « Carnet Médical Numérique »*. Langue de l'interface : français/anglais.

---

## 1. Vision

Remplacer le carnet de santé papier (utilisé au Cameroun) par un **carnet médical numérique partagé**, hébergé dans le cloud. Chaque patient possède un seul carnet, identifié par son **numéro de téléphone**. Tous les hôpitaux qui utilisent la plateforme écrivent dans ce même carnet.

Objectif principal : quand un patient se présente devant un médecin, le médecin retrouve son historique (antécédents, allergies, traitements, consultations) sans avoir à reposer les mêmes questions, même si le patient vient d'un autre hôpital.

## 2. Problème résolu

- Les carnets papier se perdent et l'historique repart de zéro.
- À chaque consultation, le médecin redemande les mêmes informations → perte de temps.
- Quand un patient change d'hôpital, le nouvel hôpital n'a aucune information.

## 3. Périmètre du MVP

### DANS le MVP (à construire)
1. Gestion des hôpitaux (comptes / tenants).
2. Gestion des utilisateurs internes d'un hôpital (médecin, accueil, admin).
3. Création et identification d'un patient par numéro de téléphone (identifiant global unique).
4. Carnet médical du patient : antécédents, allergies, consultations, prescriptions.
5. Interface médecin : lire le carnet + ajouter une consultation.
6. **Partage inter-hôpitaux** basé sur le consentement du patient (cœur de la démo).
7. Gestion du consentement (le patient autorise / révoque l'accès d'un hôpital).

### HORS du MVP (ne pas construire maintenant — voir section 12)
- Intelligence artificielle (résumé, OCR des carnets papier).
- Mode hors-ligne / synchronisation.
- Facturation, paiements (MoMo/CamPay), assurances, pharmacie/stock, labo, imagerie.
- Téléconsultation.
- Standard FHIR/HL7 et échange fédéré entre bases distinctes.

## 4. Architecture (décision clé)

**Modèle centralisé multi-tenant.** Une seule base de données PostgreSQL. Chaque hôpital est un « tenant » (un compte). Les patients sont **globaux** (partagés entre tous les hôpitaux), pas rattachés à un seul hôpital.

- Le partage entre hôpitaux est automatique car tout le monde écrit dans la même base.
- Aucun « partenariat » direct entre hôpitaux n'est nécessaire : leur point commun est la plateforme (comme deux clients d'un même service Mobile Money).
- Touche « carnet détenu par le patient » : l'identité et le consentement tournent autour du patient (identifiant = téléphone ; option QR code à prévoir côté UI plus tard).

## 5. Acteurs et rôles

| Rôle | Description | Droits |
|------|-------------|--------|
| `SUPER_ADMIN` | L'éditeur de la plateforme (toi) | Gère les hôpitaux, supervise tout |
| `ADMIN_HOPITAL` | Administrateur d'un hôpital | Gère les utilisateurs de SON hôpital |
| `MEDECIN` | Médecin d'un hôpital | Lit le carnet, crée des consultations et prescriptions |
| `ACCUEIL` | Personnel d'accueil d'un hôpital | Enregistre / recherche les patients, gère le consentement |
| `PATIENT` | Le patient | (MVP : pas d'app dédiée ; le consentement est saisi par l'accueil au nom du patient) |

## 6. Fonctionnalités du MVP (liste exploitable)

1. **Authentification** des utilisateurs internes (email + mot de passe), avec rôle et hôpital de rattachement.
2. **CRUD Hôpital** (réservé `SUPER_ADMIN`).
3. **CRUD Utilisateur** dans un hôpital (réservé `ADMIN_HOPITAL` pour son hôpital).
4. **Recherche patient par numéro de téléphone.** Si le patient existe déjà (créé par un autre hôpital), on le retrouve ; sinon on le crée.
5. **Fiche patient** : informations de base (nom, prénom, date de naissance, sexe, groupe sanguin, adresse).
6. **Antécédents & allergies** : ajouter / lister les antécédents (médical, chirurgical, familial, allergie).
7. **Consultations** : un médecin crée une consultation (motif, diagnostic, notes) rattachée à son hôpital.
8. **Prescriptions** : ajouter des médicaments (nom, posologie, durée) à une consultation.
9. **Consentement** : un hôpital demande l'accès au carnet complet d'un patient ; le patient (via l'accueil) autorise ou révoque.
10. **Vue carnet complet** : selon les règles de la section 7.

## 7. Règles métier critiques

1. **Identité unique** : un patient = un numéro de téléphone unique dans toute la base. Pas de doublon. Un seul carnet par patient quel que soit le nombre d'hôpitaux.
2. **Écriture** : un hôpital ne peut créer des consultations / prescriptions / antécédents que pour lui-même (champ `hopitalId` = l'hôpital de l'utilisateur connecté).
3. **Lecture de ses propres données** : un hôpital voit TOUJOURS les données qu'il a lui-même créées pour un patient.
4. **Lecture des données des AUTRES hôpitaux** : un hôpital ne voit l'historique créé par d'autres hôpitaux QUE si un consentement `AUTORISE` existe entre ce patient et cet hôpital.
5. **Consentement révocable** : si le statut passe à `REVOQUE`, l'hôpital reperd l'accès à l'historique des autres hôpitaux (mais garde ses propres données).
6. **Données sensibles** : les données de santé sont sensibles (loi camerounaise 2024/017). Le consentement est obligatoire avant tout partage. Prévoir une trace (date) de chaque consentement.

## 8. Parcours clé (scénario de démonstration)

C'est LE flux qui prouve le concept — il doit fonctionner de bout en bout :

1. **Hôpital A** crée le patient « Jean » (téléphone `699...`), saisit ses antécédents et une consultation.
2. Plus tard, **Hôpital B** recherche le téléphone `699...` → retrouve « Jean » (déjà existant).
3. Hôpital B demande le consentement → l'accueil enregistre l'autorisation du patient.
4. Hôpital B voit alors **tout l'historique créé par l'Hôpital A** (antécédents + consultation).
5. Hôpital B ajoute sa propre consultation → elle s'ajoute au même carnet.

## 9. Modèle de données (schéma Prisma, orienté MVP)

```prisma
enum Role {
  SUPER_ADMIN
  ADMIN_HOPITAL
  MEDECIN
  ACCUEIL
}

enum Sexe {
  M
  F
}

enum TypeAntecedent {
  MEDICAL
  CHIRURGICAL
  FAMILIAL
  ALLERGIE
}

enum StatutConsentement {
  AUTORISE
  REVOQUE
}

model Hopital {
  id           String        @id @default(cuid())
  nom          String
  ville        String
  type         String?       // public, clinique privée, etc.
  telephone    String?
  actif        Boolean       @default(true)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  utilisateurs Utilisateur[]
  consultations Consultation[]
  consentements Consentement[]
  antecedents  Antecedent[]  // antécédents saisis par cet hôpital
}

model Utilisateur {
  id            String   @id @default(cuid())
  nom           String
  prenom        String
  email         String   @unique
  telephone     String?
  motDePasseHash String
  role          Role
  hopitalId     String?  // null pour SUPER_ADMIN
  hopital       Hopital? @relation(fields: [hopitalId], references: [id])
  createdAt     DateTime @default(now())
  consultations Consultation[] // consultations créées par ce médecin
}

model Patient {
  id            String        @id @default(cuid())
  telephone     String        @unique // IDENTIFIANT GLOBAL
  nom           String
  prenom        String
  dateNaissance DateTime?
  sexe          Sexe?
  groupeSanguin String?
  adresse       String?
  createdAt     DateTime      @default(now())
  antecedents   Antecedent[]
  consultations Consultation[]
  consentements Consentement[]
}

model Consentement {
  id              String             @id @default(cuid())
  patientId       String
  patient         Patient            @relation(fields: [patientId], references: [id])
  hopitalId       String
  hopital         Hopital            @relation(fields: [hopitalId], references: [id])
  statut          StatutConsentement @default(AUTORISE)
  dateModification DateTime          @default(now())

  @@unique([patientId, hopitalId])
}

model Antecedent {
  id               String         @id @default(cuid())
  patientId        String
  patient          Patient        @relation(fields: [patientId], references: [id])
  type             TypeAntecedent
  description      String
  date             DateTime?
  hopitalCreateurId String
  hopitalCreateur   Hopital       @relation(fields: [hopitalCreateurId], references: [id])
  createdAt        DateTime       @default(now())
}

model Consultation {
  id           String         @id @default(cuid())
  patientId    String
  patient      Patient        @relation(fields: [patientId], references: [id])
  hopitalId    String         // hôpital qui a créé la consultation
  hopital      Hopital        @relation(fields: [hopitalId], references: [id])
  medecinId    String
  medecin      Utilisateur    @relation(fields: [medecinId], references: [id])
  date         DateTime       @default(now())
  motif        String
  diagnostic   String?
  notes        String?
  prescriptions Prescription[]
  createdAt    DateTime       @default(now())
}

model Prescription {
  id             String       @id @default(cuid())
  consultationId String
  consultation   Consultation @relation(fields: [consultationId], references: [id])
  medicament     String
  posologie      String
  duree          String?
  createdAt      DateTime     @default(now())
}
```

## 10. Stack technique

- **Backend** : NestJS + Prisma + PostgreSQL.
- **Frontend** : React / Next.js (interface web pour les hôpitaux).
- **Auth** : JWT, contrôle d'accès basé sur le rôle (RBAC) + filtrage par `hopitalId`.
- **Déploiement** : Railway (PostgreSQL + API) / Vercel (front), cohérent avec les habitudes existantes.

## 11. Contraintes & conformité

- **Loi camerounaise 2024/017** sur la protection des données : données de santé = sensibles → consentement obligatoire avant partage inter-hôpitaux ; tracer les consentements.
- **Contexte local** : numéro de téléphone comme identifiant (quasi-universel), interface en français simple, budgets serrés (rester léger).
- **Sécurité minimale MVP** : mots de passe hachés (bcrypt/argon2), pas de données sensibles en clair dans les logs.

## 12. Hors-périmètre — phases futures (NE PAS coder maintenant)

- **IA** : résumé automatique de l'historique pour le médecin ; OCR pour numériser les anciens carnets papier ; alertes interactions médicamenteuses.
- **Mode hors-ligne (PWA)** avec synchronisation (coupures réseau/électricité).
- **App patient** dédiée + QR code de consentement.
- **Paiements** via Mobile Money / CamPay (commission).
- **Modules** : facturation, assurances, pharmacie/stock, laboratoire, imagerie, téléconsultation.
- **Interopérabilité standardisée** FHIR/HL7 (recommandée par le Plan National de Santé Numérique 2026-2030 pour plus tard).

## 13. Modèle économique (contexte — non codé dans le MVP)

- Revenu principal : **abonnement mensuel par hôpital** (SaaS).
- Stratégie d'amorçage : **gratuit / essai au départ** pour remplir le réseau (effet réseau), puis passage au payant une fois les hôpitaux accrochés.
- Le MVP ne facture pas, mais l'architecture multi-tenant (un hôpital = un compte) prépare déjà la facturation future.
- À éviter : monétiser la vente de données de santé (risque légal).
