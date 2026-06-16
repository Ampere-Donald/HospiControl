# GUIDE TECHNIQUE — Carnet Médical Numérique (MVP)

> **Complément à `CONTEXTE.md` (le quoi) et `PLAN_IMPLEMENTATION.md` (l'ordre des phases).**
> Ce document explique **comment faire chaque chose** : installation, migrations, liste complète des API, logique métier, frontend, déploiement.
> Toutes les commandes sont données pour un environnement Node + PostgreSQL. Adapte `npm`/`pnpm`/`yarn` selon ton habitude.

---

## 1. Prérequis & installation

### Outils requis
- Node.js ≥ 20
- PostgreSQL (local ou Railway)
- npm (ou pnpm/yarn)

### Création des deux projets

```bash
# À la racine du dépôt
mkdir carnet-medical && cd carnet-medical

# --- Backend (NestJS) ---
npm i -g @nestjs/cli
nest new backend        # choisir npm

# --- Frontend (Next.js) ---
npx create-next-app@latest frontend   # TypeScript: oui, Tailwind: oui, App Router: oui
```

### Dépendances backend à installer

```bash
cd backend
npm install prisma @prisma/client
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install argon2
npm install class-validator class-transformer
npm install -D @types/passport-jwt
npx prisma init   # crée /prisma/schema.prisma + .env
```

### Structure de dossiers cible (backend)

```
backend/
├── prisma/
│   ├── schema.prisma        # le schéma de la section 9 du CONTEXTE
│   ├── seed.ts              # données de départ
│   └── migrations/          # généré par Prisma
└── src/
    ├── auth/                # login, JWT, guards
    ├── hopitaux/
    ├── utilisateurs/
    ├── patients/
    ├── carnet/              # antécédents, consultations, prescriptions
    ├── consentements/
    ├── prisma/              # PrismaService (client partagé)
    └── common/              # decorators, guards, helpers
```

---

## 2. Configuration (.env)

**backend/.env**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/carnet_medical?schema=public"
JWT_SECRET="mets_ici_une_longue_chaine_aleatoire"
JWT_EXPIRES_IN="1d"
PORT=4000
```

**frontend/.env.local**
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

---

## 3. Base de données & migrations (Prisma)

### Comment fonctionnent les migrations
Le cycle Prisma est toujours le même :
1. Tu écris/modifies le **schéma** (`prisma/schema.prisma`).
2. Tu lances une **migration** : Prisma compare le schéma à la base et génère le SQL nécessaire.
3. Tu régénères le **client** Prisma pour avoir les types à jour dans le code.

### Première migration (Phase 0)
Après avoir collé le schéma complet (section 9 du CONTEXTE) dans `schema.prisma` :

```bash
npx prisma migrate dev --name init   # crée la base + applique le SQL
npx prisma generate                  # génère le client typé
```

### Ajouter un champ plus tard (exemple)
Tu modifies le schéma (ex. ajouter `email` au patient), puis :

```bash
npx prisma migrate dev --name add_email_patient
```
Prisma crée un nouveau fichier de migration et l'applique. **Ne modifie jamais la base à la main.**

### Commandes utiles
```bash
npx prisma studio          # interface visuelle pour inspecter la base
npx prisma migrate reset   # DEV UNIQUEMENT : efface tout et rejoue les migrations + seed
npx prisma migrate deploy  # PRODUCTION : applique les migrations existantes sans en créer
```

### Configurer le seed
Dans `backend/package.json` :
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```
Lancement : `npx prisma db seed`
Le seed crée : 1 `SUPER_ADMIN`, « Hôpital A », « Hôpital B » (+ en Phase 6, le patient de démo « Jean »).

---

## 4. Architecture backend (modules NestJS)

Chaque module suit la même structure :
```
module/
├── module.controller.ts   # routes (reçoit la requête HTTP)
├── module.service.ts       # logique métier + accès Prisma
├── dto/                     # validation des entrées (class-validator)
└── module.module.ts
```

Règle d'or : **le controller ne contient pas de logique**, il appelle le service. Le service fait le travail (vérifications + Prisma).

---

## 5. Authentification & sécurité — comment faire

### Flux de connexion
1. `POST /auth/login` reçoit `{ email, motDePasse }`.
2. Le service récupère l'utilisateur par email, vérifie le mot de passe avec `argon2.verify`.
3. Si OK, il signe un JWT contenant `{ sub: userId, role, hopitalId }`.
4. Le frontend stocke ce token et l'envoie dans l'en-tête `Authorization: Bearer <token>` à chaque requête.

### Contenu du JWT (payload)
```ts
{ sub: user.id, role: user.role, hopitalId: user.hopitalId }
```

### Le guard d'authentification
Un `JwtAuthGuard` (basé sur passport-jwt) protège les routes : il décode le token et attache `req.user`.

### Le contrôle de rôle (RBAC)
Un décorateur `@Roles(...)` + un `RolesGuard` :
```ts
// common/roles.decorator.ts
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

// usage dans un controller
@Roles('SUPER_ADMIN')
@Post()
creerHopital(...) { ... }
```
Le `RolesGuard` lit les rôles requis et les compare à `req.user.role`. Sinon → 403.

### Le filtrage par hôpital (multi-tenant)
**Règle essentielle** : sauf le `SUPER_ADMIN`, chaque utilisateur ne manipule que les données de SON hôpital. Dans chaque service, on récupère `hopitalId` depuis `req.user` (jamais depuis le body, pour éviter la triche) et on filtre les requêtes Prisma avec.

Exemple pour lister les utilisateurs :
```ts
this.prisma.utilisateur.findMany({ where: { hopitalId: user.hopitalId } });
```

### Hachage des mots de passe
À la création d'un utilisateur : `motDePasseHash = await argon2.hash(motDePasse)`.
Jamais stocker le mot de passe en clair, jamais le renvoyer dans une réponse API.

---

## 6. Liste complète des API

Convention : toutes les routes (sauf `login`) exigent un JWT valide. La colonne **Rôles** indique qui a le droit.

### Module `auth`
| Méthode | Route | Rôles | Body | Réponse |
|---|---|---|---|---|
| POST | `/auth/login` | public | `{ email, motDePasse }` | `{ accessToken, user }` |
| GET | `/auth/me` | tous | — | utilisateur connecté |

### Module `hopitaux`
| Méthode | Route | Rôles | Body | Réponse |
|---|---|---|---|---|
| POST | `/hopitaux` | SUPER_ADMIN | `{ nom, ville, type?, telephone? }` | hôpital créé |
| GET | `/hopitaux` | SUPER_ADMIN | — | liste des hôpitaux |
| GET | `/hopitaux/:id` | SUPER_ADMIN | — | un hôpital |
| PATCH | `/hopitaux/:id` | SUPER_ADMIN | champs à modifier | hôpital mis à jour |
| PATCH | `/hopitaux/:id/desactiver` | SUPER_ADMIN | — | `actif = false` |

### Module `utilisateurs`
| Méthode | Route | Rôles | Body | Réponse |
|---|---|---|---|---|
| POST | `/utilisateurs` | ADMIN_HOPITAL | `{ nom, prenom, email, telephone?, motDePasse, role }` | utilisateur créé (sans le hash) |
| GET | `/utilisateurs` | ADMIN_HOPITAL | — | utilisateurs de son hôpital |
| GET | `/utilisateurs/:id` | ADMIN_HOPITAL | — | un utilisateur de son hôpital |
| PATCH | `/utilisateurs/:id` | ADMIN_HOPITAL | champs à modifier | mis à jour |
| DELETE | `/utilisateurs/:id` | ADMIN_HOPITAL | — | suppression / désactivation |

> Note : `hopitalId` n'est jamais dans le body — il est pris depuis le token de l'admin connecté.

### Module `patients`
| Méthode | Route | Rôles | Body | Réponse |
|---|---|---|---|---|
| GET | `/patients/recherche?telephone=...` | MEDECIN, ACCUEIL, ADMIN_HOPITAL | — | patient trouvé ou `null` |
| POST | `/patients` | MEDECIN, ACCUEIL | `{ telephone, nom, prenom, dateNaissance?, sexe?, groupeSanguin?, adresse? }` | patient créé (refus si téléphone existe) |
| GET | `/patients/:id` | MEDECIN, ACCUEIL, ADMIN_HOPITAL | — | infos de base du patient |
| PATCH | `/patients/:id` | MEDECIN, ACCUEIL | champs à modifier | patient mis à jour |
| GET | `/patients/:id/carnet` | MEDECIN | — | **carnet filtré par consentement** (voir section 7) |

### Module `carnet` — antécédents
| Méthode | Route | Rôles | Body | Réponse |
|---|---|---|---|---|
| POST | `/patients/:id/antecedents` | MEDECIN | `{ type, description, date? }` | antécédent créé (`hopitalCreateurId` = token) |
| GET | `/patients/:id/antecedents` | MEDECIN | — | antécédents filtrés par consentement |

### Module `carnet` — consultations & prescriptions
| Méthode | Route | Rôles | Body | Réponse |
|---|---|---|---|---|
| POST | `/patients/:id/consultations` | MEDECIN | `{ motif, diagnostic?, notes?, prescriptions?: [{ medicament, posologie, duree? }] }` | consultation créée (`hopitalId` + `medecinId` = token) |
| GET | `/patients/:id/consultations` | MEDECIN | — | consultations filtrées par consentement |
| GET | `/consultations/:id` | MEDECIN | — | détail d'une consultation + prescriptions |
| POST | `/consultations/:id/prescriptions` | MEDECIN | `{ medicament, posologie, duree? }` | prescription ajoutée |

### Module `consentements`
| Méthode | Route | Rôles | Body | Réponse |
|---|---|---|---|---|
| GET | `/patients/:id/consentement` | ACCUEIL, ADMIN_HOPITAL, MEDECIN | — | statut du consentement pour l'hôpital connecté |
| POST | `/patients/:id/consentement` | ACCUEIL, ADMIN_HOPITAL | — | crée/active `AUTORISE` pour l'hôpital connecté |
| PATCH | `/patients/:id/consentement/revoquer` | ACCUEIL, ADMIN_HOPITAL | — | passe le statut à `REVOQUE` |

---

## 7. La logique critique : lecture du carnet avec consentement

C'est **le cœur du projet** et l'endroit où tu dois être le plus rigoureux. Règle (section 7 du CONTEXTE) :
- un hôpital voit **toujours** les données qu'il a créées ;
- il voit les données des **autres** hôpitaux **uniquement** si un consentement `AUTORISE` existe pour ce patient et cet hôpital.

### Algorithme (pseudo-code du service)
```ts
async getCarnet(patientId: string, user: UtilisateurConnecté) {
  const hopitalCourant = user.hopitalId;

  // 1. Le partage des données externes est-il autorisé ?
  const consentement = await prisma.consentement.findUnique({
    where: { patientId_hopitalId: { patientId, hopitalId: hopitalCourant } },
  });
  const partageAutorise = consentement?.statut === 'AUTORISE';

  // 2. Construire le filtre de lecture
  const filtreConsult = partageAutorise
    ? { patientId }                                  // tout
    : { patientId, hopitalId: hopitalCourant };      // seulement le sien

  const filtreAntec = partageAutorise
    ? { patientId }
    : { patientId, hopitalCreateurId: hopitalCourant };

  const consultations = await prisma.consultation.findMany({
    where: filtreConsult,
    include: { prescriptions: true, hopital: true, medecin: true },
    orderBy: { date: 'desc' },
  });
  const antecedents = await prisma.antecedent.findMany({ where: filtreAntec });

  // 3. Marquer l'origine pour l'affichage (« mes données » vs « partagées »)
  const marquer = (item, idHopital) => ({
    ...item,
    estPropreHopital: idHopital === hopitalCourant,
  });

  return {
    consultations: consultations.map((c) => marquer(c, c.hopitalId)),
    antecedents: antecedents.map((a) => marquer(a, a.hopitalCreateurId)),
    partageAutorise,
  };
}
```

### Points de vigilance
- **Ne jamais** se fier au `hopitalId` envoyé par le client : toujours celui du token.
- La **révocation** doit avoir un effet immédiat : comme le filtre est recalculé à chaque lecture, passer le statut à `REVOQUE` retire automatiquement l'accès aux données externes.
- C'est la **fonction à couvrir par des tests unitaires** en priorité (cas : pas de consentement, autorisé, révoqué).

---

## 8. Frontend (Next.js) — comment faire

### Client API centralisé
Crée un fichier `lib/api.ts` qui :
- lit le token (stocké en mémoire / cookie httpOnly de préférence) ;
- ajoute `Authorization: Bearer <token>` à chaque requête ;
- pointe vers `process.env.NEXT_PUBLIC_API_URL`.

### Flux d'authentification
1. Page `/login` → appelle `POST /auth/login` → stocke le token.
2. Un wrapper de route protégée redirige vers `/login` si pas de token.
3. `GET /auth/me` au chargement pour récupérer le rôle et adapter le menu.

### Écrans clés (mappés aux API)
| Écran | API utilisées | Rôle |
|---|---|---|
| Connexion | `POST /auth/login` | tous |
| Tableau de bord super admin | `GET/POST /hopitaux` | SUPER_ADMIN |
| Gestion utilisateurs | `GET/POST /utilisateurs` | ADMIN_HOPITAL |
| Recherche / création patient | `GET /patients/recherche`, `POST /patients` | ACCUEIL, MEDECIN |
| Carnet du patient | `GET /patients/:id/carnet` | MEDECIN |
| Nouvelle consultation | `POST /patients/:id/consultations` | MEDECIN |
| Gestion du consentement | `GET/POST/PATCH /patients/:id/consentement` | ACCUEIL |

Dans la vue carnet, utilise le champ `estPropreHopital` renvoyé par l'API pour afficher un badge « Données de votre hôpital » vs « Données partagées ».

---

## 9. Déploiement

### Base de données + API (Railway)
1. Créer un projet Railway, ajouter un service **PostgreSQL** → copier l'`DATABASE_URL` fournie.
2. Déployer le backend (repo connecté). Mettre `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN` dans les variables Railway.
3. Commande de build : `npm run build`. Commande de démarrage : appliquer les migrations puis lancer :
   ```bash
   npx prisma migrate deploy && node dist/main.js
   ```
4. (Une seule fois) lancer le seed en production si besoin de données de démo.

### Frontend (Vercel)
1. Importer le repo `frontend` sur Vercel.
2. Variable d'environnement : `NEXT_PUBLIC_API_URL` = l'URL publique de l'API Railway.
3. Déploiement automatique à chaque push.

### Ordre des opérations
Base → migrations (`migrate deploy`) → API en ligne → frontend pointant vers l'API.

---

## 10. Valider le scénario de démo (test de bout en bout)

À faire une fois tout déployé, dans cet ordre exact :

1. Se connecter en `MEDECIN` de l'**Hôpital A**.
2. `POST /patients` → créer « Jean » (téléphone `699000000`).
3. `POST /patients/:id/antecedents` + `POST /patients/:id/consultations` → remplir son carnet.
4. Se déconnecter, se connecter en `MEDECIN`/`ACCUEIL` de l'**Hôpital B**.
5. `GET /patients/recherche?telephone=699000000` → Jean est retrouvé.
6. `GET /patients/:id/carnet` **avant** consentement → seules les (éventuelles) données de B apparaissent, pas celles de A.
7. `POST /patients/:id/consentement` (par l'accueil de B) → autorisation.
8. `GET /patients/:id/carnet` **après** consentement → les données de l'Hôpital A apparaissent.
9. `PATCH /patients/:id/consentement/revoquer` → les données de A disparaissent à nouveau.

Si ces 9 étapes passent, le MVP est fonctionnel et démontrable. ✅
