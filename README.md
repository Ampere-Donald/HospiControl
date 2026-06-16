# HospiControl — Carnet Médical Numérique

Plateforme de carnet médical numérique partagé, pensée pour le contexte camerounais. Chaque patient possède **un seul carnet**, identifié par son **numéro de téléphone**, accessible par tous les hôpitaux affiliés à la plateforme — sous réserve de son consentement.

## Sommaire

- [Vision](#vision)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Technologies utilisées](#technologies-utilisées)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Configuration des variables d'environnement](#configuration-des-variables-denvironnement)
- [Lancer le projet](#lancer-le-projet)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Scénario de démonstration](#scénario-de-démonstration)
- [Documentation complémentaire](#documentation-complémentaire)

## Vision

Remplacer le carnet de santé papier par un carnet numérique centralisé : quand un patient se présente devant un médecin — même dans un hôpital qu'il n'a jamais visité — le médecin retrouve instantanément son historique (antécédents, allergies, consultations, prescriptions), sous réserve du consentement du patient pour le partage inter-hôpitaux.

## Fonctionnalités principales

- **Authentification & RBAC** : JWT, rôles `SUPER_ADMIN`, `ADMIN_HOPITAL`, `MEDECIN`, `ACCUEIL`.
- **Gestion des hôpitaux** (tenants) par le super administrateur.
- **Gestion des utilisateurs** d'un hôpital par son administrateur.
- **Identité patient globale** : recherche/création par numéro de téléphone, sans doublon.
- **Carnet médical** : antécédents, consultations, prescriptions.
- **Consentement inter-hôpitaux** : un hôpital ne voit l'historique créé par un autre hôpital que si le patient a autorisé le partage ; la révocation retire l'accès immédiatement.

> Hors périmètre du MVP : IA, mode hors-ligne, app patient dédiée, paiements, facturation, FHIR/HL7. Voir [CONTEXTE.md](CONTEXTE.md) section 12.

## Technologies utilisées

| Couche | Stack |
|---|---|
| Backend | [NestJS](https://nestjs.com/), [Prisma](https://www.prisma.io/), PostgreSQL |
| Frontend | [Next.js](https://nextjs.org/) (App Router), TypeScript, Tailwind CSS |
| Auth | JWT (`@nestjs/jwt`, `passport-jwt`), hachage `argon2` |
| Déploiement | Railway (API + PostgreSQL), Vercel (frontend) |

## Structure du projet

```
HospiControl/
├── backend/                 # API NestJS
│   ├── prisma/
│   │   ├── schema.prisma    # modèle de données (hôpitaux, utilisateurs, patients, carnet, consentements)
│   │   └── seed.ts          # données de démo (2 hôpitaux + comptes)
│   ├── src/                 # modules NestJS (auth, hopitaux, utilisateurs, patients, carnet, consentements)
│   ├── .env.example
│   └── package.json
├── frontend/                 # Application Next.js
│   ├── app/
│   ├── .env.local.example
│   └── package.json
├── CONTEXTE.md               # périmètre fonctionnel du MVP (source de vérité métier)
├── GUIDE_TECHNIQUE.md        # guide d'implémentation détaillé (API, logique métier, déploiement)
├── PLAN_IMPLEMENTATION.md    # plan de développement par phases
└── README.md
```

## Installation

### Prérequis

- Node.js ≥ 20
- PostgreSQL (local, ou une instance cloud type Railway)
- npm

### Cloner le dépôt

```bash
git clone https://github.com/Ampere-Donald/HospiControl.git
cd HospiControl
```

### Installer les dépendances

```bash
cd backend && npm install
cd ../frontend && npm install
```

## Configuration des variables d'environnement

Chaque application possède son propre fichier d'exemple à copier et compléter avec vos propres valeurs **(ne jamais committer le fichier final)**.

### Backend — `backend/.env`

```bash
cd backend
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL, ex. `postgresql://user:password@localhost:5432/carnet_medical?schema=public` |
| `JWT_SECRET` | Chaîne aléatoire longue utilisée pour signer les JWT — **à générer vous-même**, ne jamais réutiliser la valeur d'exemple |
| `JWT_EXPIRES_IN` | Durée de validité du token, ex. `1d` |
| `PORT` | Port d'écoute de l'API, ex. `4000` |

### Frontend — `frontend/.env.local`

```bash
cd frontend
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL de base de l'API backend, ex. `http://localhost:4000` |

## Lancer le projet

### 1. Base de données (backend)

```bash
cd backend
npx prisma migrate dev --name init   # crée les tables
npx prisma generate                  # génère le client Prisma
npx prisma db seed                   # insère les données de démo
```

### 2. Démarrer l'API

```bash
cd backend
npm run start:dev    # http://localhost:4000
```

### 3. Démarrer le frontend

```bash
cd frontend
npm run dev           # http://localhost:3000
```

## Comptes de démonstration

Créés par `npx prisma db seed` (voir [backend/prisma/seed.ts](backend/prisma/seed.ts)) :

| Rôle | Email | Mot de passe |
|---|---|---|
| Super Admin | `admin@carnet-medical.cm` | `Admin1234!` |
| Admin Hôpital A | `admin@hopital-a.cm` | `Admin1234!` |
| Médecin Hôpital A | `medecin@hopital-a.cm` | `Medecin1234!` |
| Accueil Hôpital A | `accueil@hopital-a.cm` | `Accueil1234!` |
| Admin Hôpital B | `admin@hopital-b.cm` | `Admin1234!` |
| Médecin Hôpital B | `medecin@hopital-b.cm` | `Medecin1234!` |
| Accueil Hôpital B | `accueil@hopital-b.cm` | `Accueil1234!` |

> ⚠️ Ces identifiants sont destinés **uniquement** à l'environnement de développement/démonstration. Ne jamais les réutiliser en production.

## Scénario de démonstration

Le parcours qui valide la fonctionnalité cœur du projet (partage inter-hôpitaux soumis au consentement) :

1. Connexion en `MEDECIN` de l'**Hôpital A** → création du patient « Jean » (téléphone `699000000`) + antécédents + consultation.
2. Connexion en `ACCUEIL`/`MEDECIN` de l'**Hôpital B** → recherche du téléphone `699000000` → Jean est retrouvé.
3. Avant consentement : le carnet ne montre que les éventuelles données propres à l'Hôpital B.
4. L'accueil de l'Hôpital B enregistre le consentement du patient → l'historique de l'Hôpital A apparaît.
5. Révocation du consentement → l'accès à l'historique de l'Hôpital A disparaît à nouveau.

Détail complet : [GUIDE_TECHNIQUE.md](GUIDE_TECHNIQUE.md) section 10.

## Documentation complémentaire

- [CONTEXTE.md](CONTEXTE.md) — périmètre fonctionnel, modèle de données, règles métier.
- [GUIDE_TECHNIQUE.md](GUIDE_TECHNIQUE.md) — liste des API, logique de consentement, déploiement.
- [PLAN_IMPLEMENTATION.md](PLAN_IMPLEMENTATION.md) — plan de développement par phases.

## Licence

Projet non encore sous licence publique — usage interne / académique.
