# Guide de test A→Z — HospiControl

Ce guide te fait tester **toute l'application comme un vrai utilisateur**, depuis le démarrage jusqu'au scénario complet. Chaque étape indique **ce que tu dois voir** ✅ pour savoir si ça marche.

> Durée : ~15 min pour tout dérouler. Coche les cases au fur et à mesure.

---

## 0. Prérequis (à vérifier une fois)

| Élément | Comment vérifier | Attendu |
|---|---|---|
| Node.js ≥ 20 | `node --version` | v20+ (ici v24) |
| PostgreSQL lancé | `Get-Service postgresql-x64-17` | `Running` |
| Base + dépendances installées | voir §6 si besoin | déjà fait |

Si PostgreSQL n'est pas `Running` : `Start-Service postgresql-x64-17`.

---

## 1. Démarrer le projet (2 terminaux)

**Terminal 1 — API (backend)**
```powershell
cd C:\Users\pc\Documents\Project_Ecole_Darielle\backend
npm run start
```
✅ Tu dois voir : `API HospiControl démarrée sur http://localhost:4000`

**Terminal 2 — Frontend**
```powershell
cd C:\Users\pc\Documents\Project_Ecole_Darielle\frontend
npm run dev
```
✅ Tu dois voir : `Ready in …` et `Local: http://localhost:3000`

**Vérif rapide de l'API** (3ᵉ terminal, optionnel) :
```powershell
Invoke-RestMethod http://localhost:4000
```
✅ Réponse : `status = ok, service = HospiControl API`.

Ouvre ensuite **http://localhost:3000** dans ton navigateur.

---

## 2. Les comptes de test

| Rôle | Email | Mot de passe |
|---|---|---|
| Super Admin | `admin@carnet-medical.cm` | `Admin1234!` |
| Admin Hôpital A | `admin@hopital-a.cm` | `Admin1234!` |
| Médecin Hôpital A | `medecin@hopital-a.cm` | `Medecin1234!` |
| Accueil Hôpital A | `accueil@hopital-a.cm` | `Accueil1234!` |
| Admin Hôpital B | `admin@hopital-b.cm` | `Admin1234!` |
| Médecin Hôpital B | `medecin@hopital-b.cm` | `Medecin1234!` |
| Accueil Hôpital B | `accueil@hopital-b.cm` | `Accueil1234!` |

💡 Sur la page de connexion, les puces **« Accès par rôle »** pré-remplissent les comptes de l'Hôpital A.

---

## 3. Test par rôle (chaque rôle a son monde)

### 3.1 — Connexion & sécurité
- [ ] Sur `/login`, clique la puce **« Médecin »** → les champs se remplissent → **Se connecter**.
  ✅ Tu arrives sur le **Tableau de bord**.
- [ ] Teste un **mauvais mot de passe** (modifie-le) → **Se connecter**.
  ✅ Message rouge **« Identifiants incorrects. »**
- [ ] Une fois connecté, clique **Déconnexion** (en haut à droite).
  ✅ Retour à la page de connexion.

### 3.2 — Super Admin (gestion des hôpitaux)
Connecte-toi avec `admin@carnet-medical.cm` / `Admin1234!`.
- [ ] ✅ Tu atterris sur **Hôpitaux** (et la sidebar montre Hôpitaux / Vue globale / Paramètres).
- [ ] ✅ Tu vois les hôpitaux **A** et **B** (et leur ville, statut, admin), + des cartes de stats en haut.
- [ ] Clique **Nouvel hôpital** → remplis :
  - Nom : `Hôpital Test`, Ville : `Bafoussam`
  - Admin → Nom complet : `Alice Tabi`, Email : `admin@hopital-test.cm`
  - **Suivant** → vérifie le récapitulatif → **Créer l'hôpital**.
  - [ ] ✅ Un écran de succès affiche un **mot de passe temporaire** (ex. `Hopi-XXXX`) → **copie-le**.
- [ ] ✅ Le nouvel hôpital apparaît dans la liste. Teste **Modifier** puis **Désactiver** (l'icône power) → le statut passe à *Inactif*.
- [ ] Déconnecte-toi.

### 3.3 — Admin d'hôpital (gestion des utilisateurs)
Connecte-toi avec l'admin que tu viens de créer (`admin@hopital-test.cm` + le mot de passe temporaire copié) — **ou** `admin@hopital-a.cm` / `Admin1234!`.
- [ ] ✅ Tu atterris sur **Utilisateurs** (sidebar : Utilisateurs / Patients / Carnet médical).
- [ ] ✅ Tu vois la liste des comptes de **ton** hôpital + stats (médecins, accueil, total).
- [ ] Clique **Ajouter utilisateur** → Nom complet : `Pierre Eyenga`, Email : `medecin2@hopital-a.cm`, Rôle : **Médecin**, Mot de passe temporaire : `Test1234!` → **Créer l'utilisateur**.
  - [ ] ✅ Le nouvel utilisateur apparaît dans la liste.
- [ ] Teste **Modifier** (crayon) et **Supprimer** (corbeille) sur un compte créé.
  - [ ] ✅ Tu ne peux pas te supprimer toi-même (pas d'icône corbeille sur ta ligne).
- [ ] Déconnecte-toi.

### 3.4 — Accueil / Médecin (patients)
Connecte-toi en **Accueil A** (`accueil@hopital-a.cm` / `Accueil1234!`).
- [ ] Menu **Patients** → dans la barre, tape `699112233` (ou `+237 699 11 22 33`).
  - [ ] ✅ Sous la barre s'affiche **Clé normalisée : `699112233` ✓ Valide**.
- [ ] Clique **Rechercher**.
  - [ ] ✅ **Patient trouvé** : Jean Pierre Nguoa, badge *Patient partagé*, origine Hôpital A.
- [ ] Cherche un **numéro inexistant** (ex. `655000000`) → **Rechercher**.
  - [ ] ✅ **« Aucun patient trouvé »** → **Créer un patient**.
- [ ] Crée un patient : Téléphone `655 00 00 00`, Prénom `Awa`, Nom `Manga`, Sexe `Féminin`, Groupe `A+`.
  - [ ] ✅ Tu es redirigé vers la **fiche du nouveau patient**.

### 3.5 — Médecin (carnet médical)
Connecte-toi en **Médecin A** (`medecin@hopital-a.cm` / `Medecin1234!`).
- [ ] **Patients** → cherche `699112233` → **Ouvrir le dossier** → **Ouvrir le carnet**.
  - [ ] ✅ Tu vois **1 antécédent** (allergie pénicilline) et **1 consultation** (avec prescription).
- [ ] Clique **Nouvelle consultation** → Motif : `Contrôle tension`, Diagnostic : `Hypertension légère`, ajoute une prescription (Médicament `Amlodipine`, Posologie `5 mg/jour`, Durée `30 jours`) → **Enregistrer**.
  - [ ] ✅ La consultation apparaît **en haut** de la liste.
- [ ] Clique **Ajouter** (section Antécédents) → Type `Chirurgical`, Description `Appendicectomie 2015` → **Enregistrer**.
  - [ ] ✅ L'antécédent apparaît avec son badge de type.

---

## 4. 🎯 LE test clé — partage inter-hôpitaux (le cœur du projet)

But : prouver que **l'Hôpital B ne voit l'historique de l'Hôpital A qu'avec le consentement du patient**.

- [ ] **Médecin B** (`medecin@hopital-b.cm` / `Medecin1234!`) → **Patients** → cherche `699112233` → **Ouvrir le dossier** → **Ouvrir le carnet**.
  - [ ] ✅ Bandeau **ambre** : « données de votre hôpital seulement ». **L'historique de l'Hôpital A est INVISIBLE** (0 consultation).
- [ ] **Accueil B** (`accueil@hopital-b.cm` / `Accueil1234!`) → **Patients** → cherche `699112233` → ouvre la fiche → carte **« Consentement inter-hôpitaux »** → **Autoriser**.
  - [ ] ✅ Le statut passe à **Autorisé**.
- [ ] Reconnecte-toi en **Médecin B** → carnet du patient.
  - [ ] ✅ **L'allergie et les consultations de l'Hôpital A APPARAISSENT**, avec un badge **« Partagé »** et un bandeau **vert**.
- [ ] **Accueil B** → fiche patient → **Révoquer**.
- [ ] **Médecin B** → carnet.
  - [ ] ✅ **L'historique de l'Hôpital A a de nouveau disparu.**

➡️ Si ces 6 cases sont cochées, **la fonctionnalité cœur du projet fonctionne**.

---

## 5. Cas limites à tester (robustesse)

- [ ] **Doublon téléphone** : en Accueil, essaie de créer un patient avec `699112233` (déjà pris, autre format `699-11-22-33`).
  ✅ Refus : « Un patient avec ce numéro existe déjà. »
- [ ] **Accès interdit par rôle** : connecté en **Médecin**, tape manuellement `http://localhost:3000/hopitaux` dans l'URL.
  ✅ Tu es **redirigé** vers ton espace (pas d'accès aux hôpitaux).
- [ ] **Carnet réservé** : un compte **Accueil** n'a pas de bouton « Ouvrir le carnet » (réservé aux médecins).
- [ ] **Session expirée** : (avancé) supprime la clé `hospicontrol_token` dans le localStorage du navigateur (F12 → Application → Local Storage) puis recharge → tu es renvoyé au login.

---

## 6. Annexe — (Ré)installer ou réinitialiser

### Repartir d'une base propre (efface tout + recrée + reseed)
```powershell
cd C:\Users\pc\Documents\Project_Ecole_Darielle\backend
npx prisma migrate reset
```
⚠️ Efface toutes les données et rejoue migrations + seed (recrée les 7 comptes + le patient Jean).

### Juste recharger les données de démo
```powershell
cd C:\Users\pc\Documents\Project_Ecole_Darielle\backend
npx prisma db seed
```

### Réinstaller les dépendances (si besoin)
```powershell
npm install --prefix backend
npm install --prefix frontend
```

### Inspecter la base visuellement
```powershell
cd backend ; npx prisma studio
```
Ouvre une interface web sur http://localhost:5555 pour voir/éditer les tables.

---

## 7. Dépannage (si ça coince)

| Symptôme | Cause probable | Solution |
|---|---|---|
| `Port 4000 is already in use` | Une ancienne instance tourne | Libérer le port : voir ci-dessous |
| La page reste sur le spinner | API non démarrée | Vérifier le Terminal 1 (`npm run start`) |
| « Connexion impossible. Vérifiez que l'API est démarrée » | Backend down ou mauvais port | Relancer le backend |
| Erreurs base de données | PostgreSQL arrêté | `Start-Service postgresql-x64-17` |
| Frontend ne démarre pas (port 3000 pris) | Instance déjà lancée | Libérer le port 3000 |

**Libérer un port** (remplace 4000 par 3000 si besoin) :
```powershell
$p = (Get-NetTCPConnection -LocalPort 4000 -State Listen).OwningProcess
Stop-Process -Id $p -Force
```

> Note : après une modification du **code backend**, il faut **arrêter et relancer** `npm run start` (le mode sans rechargement automatique est plus stable sous Windows).

---

## En résumé
Si tu as déroulé les §3 et §4 sans accroc, **le MVP est pleinement fonctionnel** : authentification par rôle, gestion des hôpitaux et utilisateurs, identité patient globale, carnet médical, et surtout le **partage inter-hôpitaux soumis au consentement**.
