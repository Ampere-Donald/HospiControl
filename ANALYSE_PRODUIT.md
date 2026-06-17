# Analyse produit — HospiControl en conditions réelles

> Document de réflexion : « et si HospiControl était réellement utilisé dans les hôpitaux du Cameroun ? » — problèmes identifiés, comparaison avec les systèmes réels (France, Estonie, USA, Afrique), et feuille de route.

---

## 0. La bonne nouvelle : la vision est validée par la réalité

Le problème qu'attaque HospiControl est **réel et documenté**. En Afrique, le frein n°1 n'est pas l'absence de logiciels mais le **manque de continuité** : des systèmes (OpenMRS, KenyaEMR, e-Ubuzima au Rwanda, DHIS2…) qui **ne se parlent pas**, donc des **dossiers fragmentés** → interactions médicamenteuses évitables, diagnostics manqués, examens refaits inutilement. C'est exactement ce que résout « un seul carnet par patient ». ✅

⚠️ **Mais** la solution standard qui émerge (Rwanda, Kenya) n'est pas une base centrale unique : c'est un **Health Information Exchange** avec le standard **HL7 FHIR** pour faire communiquer les systèmes existants. HospiControl est aujourd'hui un **HIE centralisé** — approche valable pour démarrer, mais à terme il faudra **parler FHIR** pour ne pas devenir « un silo de plus ».

---

## 1. 🔴 LE problème majeur : ce n'est pas le patient qui consent

**Ton constat (juste) :** à l'accueil, l'agent clique « Autoriser » et partage le dossier — **sans aucune validation du patient**. Le patient n'a jamais accès à son carnet et ne valide rien. Donc juridiquement, **on ne demande pas le consentement du patient : l'hôpital se l'auto-accorde.** Or toute la promesse (et la loi camerounaise 2024/017, comme le RGPD) repose sur le **consentement du patient**.

**Ce que font les vrais systèmes :**
- **France (Mon espace santé/DMP)** : le **patient** est maître. Hors équipe de soins, un professionnel doit obtenir son **consentement préalable** ; le patient peut **bloquer/débloquer** chaque soignant à tout moment.
- **Estonie** : le patient voit **qui a consulté son dossier** (journal d'accès), peut **bloquer n'importe quel médecin** (même son généraliste) et **signaler** un accès injustifié.

**Solutions proposées (de la plus rapide à la plus aboutie) :**

| # | Solution | Idée | Effort |
|---|---|---|---|
| **A** | **Consentement par SMS/OTP** ⭐ | Au moment de partager, le système envoie un **code à 6 chiffres au téléphone du patient**. Le patient lit le code → l'accueil le saisit → consentement **prouvé** (le patient est présent et d'accord). Tracé : qui, quand, méthode. | Moyen |
| **B** | **Traçabilité du consentement** | Enregistrer chaque évènement (hôpital demandeur, date, agent, méthode : OTP vérifié vs déclaratif). | Faible |
| **C** | **Journal d'accès (audit log)** | Enregistrer **chaque lecture de carnet** (qui, quand, quel hôpital) ; le rendre consultable. (modèle Estonie) | Moyen |
| **D** | **Portail patient** (long terme) | Le patient se connecte (téléphone + OTP), voit son carnet, voit qui y a accédé, **autorise/révoque lui-même**. (modèle France/Estonie) | Élevé |

➡️ **Recommandation soutenance :** implémenter **A (OTP) + B (traçabilité)**. C'est le geste qui transforme « l'hôpital s'auto-autorise » en **vrai consentement du patient**, et ça s'intègre parfaitement à une app déjà basée sur le numéro de téléphone. C'est aussi un **excellent argument de démo** (« regardez, le patient reçoit un SMS et c'est LUI qui valide »).

---

## 2. Réponses à chacun de tes problèmes

### 2.1 « On doit pouvoir supprimer les hôpitaux créés »
- **Réalité métier :** on ne **supprime quasiment jamais** un hôpital qui détient des données médicales (patients, consultations y sont rattachés ; la loi impose de **conserver** les données de santé des années). Supprimer = orpheliner des dossiers.
- **Reco :** garder **Désactiver** (soft-delete, déjà fait) comme action principale. Ajouter une **vraie suppression UNIQUEMENT si l'hôpital n'a aucune donnée** (0 utilisateur, 0 consultation, 0 patient créé) — pour corriger une erreur de saisie. Sinon, bouton suppression masqué/désactivé avec explication.

### 2.2 « La Vue globale est vide — quoi y mettre ? »
C'est l'écran de **supervision plateforme** du super admin (niveau ministère/éditeur). À y mettre :
- **KPIs réseau** : nb hôpitaux actifs/inactifs, nb patients global, consultations ce mois, consentements actifs.
- **Activité par hôpital** (classement, carte/liste).
- **Le journal d'accès global** (audit — voir §1.C) : qui a accédé à quoi sur la plateforme.
- **Santé du système** (dernières activités, éventuelles alertes).

### 2.3 « Paramètres n'est pas activé »
Minimum utile, par rôle :
- **Tous :** « Mon compte » → changer son mot de passe (lié à la décision en attente : *forcer le changement à la 1ʳᵉ connexion*), voir son profil.
- **Admin hôpital :** modifier les infos de **son** hôpital.
- **Super admin :** réglages plateforme.

### 2.4 « L'admin doit-il accéder au carnet ? Ses écrans Patients/Paramètres sont vides »
- **Principe (HIPAA « minimum nécessaire ») :** l'admin est **administratif, pas clinique**. Il **ne doit PAS** voir les carnets médicaux. → c'est déjà le cas côté API (carnet = médecin), **mais sa sidebar montre à tort « Patients » et « Carnet médical »** → d'où tes écrans vides.
- **Reco :** sidebar admin = **Utilisateurs · Statistiques de l'hôpital · Paramètres** (retirer Patients et Carnet). L'admin gère les **comptes**, pas les dossiers.

### 2.5 « À l'accueil, je vois le patient et j'autorise le partage à sa place » → voir §1 (problème majeur). C'est LE point à corriger avec l'OTP.

### 2.6 « Côté médecin : Patients = utilité floue, Consultations vide, Consentements vide »
- **Patients (médecin)** : c'est la **recherche → ouvrir le carnet**. Utile, mais **redondant** avec la recherche du tableau de bord. → soit le garder comme point d'entrée principal, soit le fusionner.
- **Consultations (médecin)** : aujourd'hui un **placeholder vide**. → en faire **« Mes consultations »** : la liste réelle des consultations du médecin (aujourd'hui / récentes), cliquables vers le carnet.
- **Consentements (médecin)** : le médecin **ne gère pas** le consentement (c'est l'accueil). → le **retirer de la sidebar médecin** ; le médecin voit le statut **dans le carnet** (déjà le cas : bandeau vert/ambre). Sidebar médecin = **Tableau de bord · Patients · Consultations**.

### 2.7 « Je quitte la recherche patient et je perds mes résultats »
- **Cause :** l'état de recherche n'est pas persistant.
- **Reco :** mettre le numéro recherché dans **l'URL** (`/patients?tel=699112233`) → survit à la navigation, partageable, et le « retour » du navigateur remarche. Bonus : afficher les **dernières recherches**.

---

## 3. Ce que les systèmes réels font et qu'HospiControl ne prend pas (encore) en compte

| Concept | Qui le fait | Pourquoi c'est important | Statut HospiControl |
|---|---|---|---|
| **Consentement réellement patient (OTP/portail)** | France, Estonie | Légalité, confiance | ❌ (accueil décide) |
| **Journal d'accès / audit** | Estonie, normes HIE (ATNA) | Le patient voit qui l'a consulté ; preuve en cas d'abus | ❌ |
| **Accès patient à son propre dossier** | France, Estonie | Le patient est propriétaire | ❌ |
| **Bris de glace (urgence)** | HIE/HIPAA | Accès vital si patient inconscient, avec justification + audit | ❌ |
| **Opt-in / opt-out** | HIE | Politique de partage par défaut | Implicite (opt-in) |
| **Interopérabilité FHIR** | Rwanda, Kenya | Communiquer avec les systèmes existants | ❌ |
| **Identité robuste** | France (INS) | Le téléphone change/est partagé → risque de collision | ⚠️ (téléphone seul) |
| **Mode hors-ligne (PWA)** | contexte Afrique | Coupures réseau/électricité | ❌ (hors MVP) |

---

## 4. « Et si c'était utilisé pour de vrai au Cameroun ? » — les réalités

1. **Réseau & électricité intermittents** → un mode **hors-ligne** (PWA + synchro) devient quasi obligatoire en zone rurale. C'est le frein n°1 documenté en Afrique.
2. **Identité patient** : un numéro de téléphone **change**, est **partagé** (famille), ou la personne en a plusieurs. → prévoir **téléphone + nom/date de naissance** voire un **ID patient + QR code** comme filet (la France utilise un identifiant national, l'INS).
3. **Interopérabilité** : les hôpitaux ont déjà du papier, OpenMRS, ou du propriétaire. Sans **import/export FHIR**, HospiControl reste un îlot.
4. **Confiance & sécurité** : données ultra-sensibles → **audit, chiffrement, hébergement conforme**, et un cadre légal clair (loi 2024/017).
5. **Adoption** : workflow réel à l'accueil/consultation, **formation**, et une vraie valeur perçue (gain de temps) sinon le papier revient.
6. **Urgences** : un patient inconscient ne peut pas consentir → il faut le **bris de glace** (accès d'urgence tracé).

---

## 5. Feuille de route priorisée

**P0 — Crédibilité & cohérence (avant/juste après la soutenance)**
- Consentement **par OTP SMS** + **traçabilité** (le correctif du problème majeur). *(SMS simulé en démo si pas de passerelle.)*
- **Sidebars par rôle corrigées** (admin sans carnet/patients ; médecin sans « consentements » ; « Consultations » = mes consultations).
- **Persistance de la recherche** (numéro dans l'URL).
- **Suppression d'hôpital** conditionnelle (sinon désactiver).

**P1 — Confiance & supervision**
- **Journal d'accès** (audit) + l'exposer dans **Vue globale** et (plus tard) au patient.
- **Paramètres** : « Mon compte » + changement de mot de passe (et forcer à la 1ʳᵉ connexion).
- **Bris de glace** (accès d'urgence tracé).

**P2 — Passage à l'échelle**
- **Portail patient** (le patient voit son dossier + qui y a accédé + gère son consentement).
- **Interopérabilité FHIR** (import/export).
- **Mode hors-ligne (PWA)**.
- **Identité renforcée** (QR / ID patient).

---

## Sources
- [Mon Espace Santé — The Local](https://www.thelocal.fr/20220211/explained-frances-new-digital-health-space-mon-espace-sante) · [CNIL — ENS/DMP Q-R](https://www.cnil.fr/fr/lespace-numerique-de-sante-ens-ou-mon-espace-sante-et-le-dossier-medical-partage-dmp-questions) · [ameli.fr — Mon espace santé](https://www.ameli.fr/medecin/sante-prevention/dmp-et-mon-espace-sante/mon-espace-sante/mon-espace-sante-espace-numerique-patients)
- [Estonie — contrôle personnel des données (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5741780/) · [e-Estonia — digital health](https://e-estonia.com/enter-e-estonia-digital-health/)
- [HIE — patient consent 101](https://www.hcinnovationgroup.com/home/article/13004398/in-or-out-hie-patient-consent-101) · [Break-glass (Yale/HIPAA)](https://hipaa.yale.edu/security/break-glass-procedure-granting-emergency-access-critical-ephi-systems)
- [EHR en Afrique : sans continuité (TechAfrica)](https://techafricanews.com/2026/04/23/health-data-without-continuity-why-electronic-health-records-still-have-not-scaled-across-africa/) · [Interopérabilité & eHealth en Afrique (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12958898/)
- [Accès EHR via OTP/identité (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8832271/) · [Authentication SMS OTP Consent — Orange Developer](https://developer.orange.com/resources/authentication-sms-otp-consent/)
