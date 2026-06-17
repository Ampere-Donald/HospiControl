# Feuille de route V2 — à implémenter (issu du brainstorming)

Synthèse de tout ce qui a été décidé. Le MVP (Phases 0→6) est fait ; ceci est la **V2** qui corrige les vrais problèmes identifiés en testant l'app.

---

## 🎯 Bloc 1 — Consentement réellement piloté par le patient *(le grand chantier)*
Aujourd'hui l'accueil s'auto-autorise. Objectif : **c'est le patient qui décide.**

- **1.1 — Demande d'accès + notification email.** L'hôpital clique **« Demander l'accès »** (au lieu d'« Autoriser ») → crée une **demande en attente** → **email au patient** avec un **lien magique**. *Email gratuit ; mode **simulé** par défaut (le lien s'affiche à l'écran), vrai envoi branchable plus tard.*
- **1.2 — Espace patient (portail v2).** Le patient se connecte (email + lien magique / mot de passe) et dispose de : **son dossier**, **ses consentements** (autoriser/refuser/révoquer), et **le journal d'accès** (qui a consulté).
- **1.3 — Présentiel en secours.** Si le patient n'a pas d'email : **consentement en présentiel tracé** (l'accueil atteste, c'est journalisé).

**Impact données :** `Patient.email` ; `Consentement.statut` ← ajouter **EN_ATTENTE** (+ REFUSE) ; demande (token, hôpital demandeur, date d'expiration) ; auth patient (rôle PATIENT déjà dans l'enum).

---

## 🚨 Bloc 2 — Accès d'urgence (« bris de glace »)
Pour le patient inconscient qui ne peut pas consentir.
- Bouton **« Accès d'urgence »** (médecin) → **motif obligatoire** → ouvre le carnet → **tracé au journal** + **patient notifié après**.
- *À confirmer : accès toujours possible, ou le patient peut le **bloquer d'avance** (option France).*

---

## 👁️ Bloc 3 — Journal d'accès (traçabilité)
La brique de confiance (modèle Estonie) — remplit aussi la **Vue globale** vide.
- Tracer **chaque lecture de carnet** + **chaque action de consentement** + **chaque accès d'urgence** (qui, quand, quel hôpital, quelle action).
- Visible dans : **l'espace patient** et la **Vue globale** (super admin).

**Impact données :** table `JournalAcces` (acteur, patient, hôpital, action, date).

---

## 🆔 Bloc 4 — Identité patient renforcée
- **Téléphone** = clé de recherche au quotidien (inchangé).
- **CNI** (ou **NIU** optionnel) = pièce d'identité forte, saisie quand disponible → **prouver** l'identité, **éviter les doublons**, **retrouver** si le téléphone a changé.
- **Optionnelle mais recommandée** (n'exclut pas les enfants). Sans CNI : téléphone + nom + **date de naissance** + **tuteur**.

**Impact données :** `Patient.cni` (optionnel) ; lien **tuteur** (pour les mineurs).

---

## 🧩 Bloc 5 — Corrections de cohérence (rôles & écrans) *(rapides, gros impact démo)*
- **Sidebar admin** : retirer *Patients* et *Carnet* (admin = administratif, pas clinique) → **Utilisateurs · Statistiques hôpital · Paramètres**.
- **Sidebar médecin** : retirer *Consentements* ; **Consultations → « Mes consultations »** (vraies données, plus de placeholder).
- **Vue globale** (super admin) : **KPIs réseau** + **journal d'accès**.
- **Paramètres** : **« Mon compte »** (changer son mot de passe) + admin → infos de son hôpital ; **+ forcer le changement de mot de passe à la 1ʳᵉ connexion**.
- **Suppression d'hôpital** : possible **seulement si 0 donnée** ; sinon **désactiver**.
- **Persistance de la recherche patient** : numéro dans l'**URL** (`/patients?tel=…`).

---

## ⏳ Plus tard (noté, hors périmètre immédiat)
- **Mode hors-ligne (PWA)** → dans la **version mobile** de l'app.
- **Interopérabilité FHIR** (communiquer avec OpenMRS / autres systèmes).
- **Hébergement souverain + sécurité renforcée** (prod réelle, loi 2024/017).
- **Modèle économique** : abonnement SaaS mensuel par hôpital (gratuit pour amorcer).

---

## ❓ Micro-décisions à confirmer avant de coder
1. **CNI** : optionnelle recommandée (mon avis) ou **obligatoire pour les adultes** ?
2. **Bris de glace** : toujours disponible, ou **blocable d'avance** par le patient ?
3. **Espace patient v1** : connexion par **lien magique seul** (simple) ou **+ mot de passe** ?

## Ordre de mise en œuvre conseillé
1. **Bloc 5** (corrections rapides — cohérence immédiate, gros effet démo).
2. **Bloc 4** (identité CNI — petite migration, fondation).
3. **Bloc 3** (journal d'accès — fondation de la confiance + remplit la Vue globale).
4. **Bloc 1** (consentement patient + espace patient — *la* fonctionnalité phare).
5. **Bloc 2** (bris de glace — s'appuie sur le journal).
