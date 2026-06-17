# Déploiement — HospiControl

Architecture cible : **Railway** héberge la base PostgreSQL + l'API NestJS, **Vercel** héberge le frontend Next.js.

Ordre : Base → API (avec migrations) → Frontend pointant vers l'API.

---

## 1. Base de données + API sur Railway

### a. Base PostgreSQL
1. Créer un projet sur [railway.app](https://railway.app).
2. **+ New → Database → PostgreSQL**. Railway fournit une variable `DATABASE_URL`.

### b. Service API (backend)
1. **+ New → GitHub Repo** → choisir le dépôt, **Root Directory = `backend`**.
2. **Variables** du service :
   | Variable | Valeur |
   |---|---|
   | `DATABASE_URL` | référencer celle du service Postgres (`${{Postgres.DATABASE_URL}}`) |
   | `JWT_SECRET` | une longue chaîne aléatoire (≠ valeur d'exemple) |
   | `JWT_EXPIRES_IN` | `1d` |
   | `FRONTEND_URL` | l'URL Vercel du front (à remplir après l'étape 2) |
   | `PORT` | laissé géré par Railway |
3. **Commandes** (Settings → Deploy) :
   - Build : `npm install && npx prisma generate && npm run build`
   - Start : `npm run start:prod`  *(exécute `prisma migrate deploy` puis lance l'API)*
4. Déployer, puis **générer un domaine public** (Settings → Networking → Generate Domain) → c'est l'URL de l'API.

### c. (Une seule fois) Données de démo
Dans l'onglet **Shell** du service API (ou en local pointant sur la `DATABASE_URL` de prod) :
```bash
npx prisma db seed
```

---

## 2. Frontend sur Vercel
1. Sur [vercel.com](https://vercel.com) : **Add New → Project** → importer le dépôt, **Root Directory = `frontend`** (Next.js détecté automatiquement).
2. **Environment Variable** :
   | Variable | Valeur |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | l'URL publique de l'API Railway (étape 1.b.4) |
3. Déployer → Vercel fournit une URL (ex. `https://hospicontrol.vercel.app`).
4. **Retourner sur Railway** et mettre cette URL dans la variable `FRONTEND_URL` de l'API (pour le CORS), puis redéployer l'API.

---

## 3. Vérification
- Ouvrir l'URL Vercel → page de connexion.
- Se connecter avec un compte de démo (voir [README](README.md)).
- Dérouler le scénario de partage (voir [SCENARIO_DEMO.md](SCENARIO_DEMO.md)).

## Notes
- **CORS** : l'API n'accepte que les origines listées dans `FRONTEND_URL` (séparées par des virgules) ; vide en local = toutes origines.
- **Migrations** : `start:prod` applique automatiquement les migrations au démarrage (`prisma migrate deploy`).
- **Secrets** : ne jamais committer un vrai `.env` ; n'utiliser les identifiants de démo qu'en dev/démo.
- **Journaux** : aucune donnée sensible (token de lien magique, mot de passe, contenu du carnet) n'est écrite dans les logs applicatifs. Le seul `console.log` est le message de démarrage.

---

## 4. Sauvegardes PostgreSQL (Railway)

Les données médicales sont critiques : il faut une sauvegarde régulière et vérifiée.

### a. Sauvegardes managées (recommandé)
- Sur Railway, ouvrir le service **PostgreSQL → onglet *Backups*** et activer les **sauvegardes automatiques** (snapshots quotidiens). C'est l'option la plus simple en production.
- Vérifier périodiquement qu'un **restore** fonctionne (Railway permet de restaurer un snapshot vers une nouvelle base).

### b. Sauvegarde manuelle / planifiée (`pg_dump`)
En complément (ou si l'offre ne couvre pas les backups), exporter régulièrement la base :

```bash
# Récupérer DATABASE_URL depuis Railway (Variables du service Postgres), puis :
pg_dump "$DATABASE_URL" --format=custom --no-owner --file "hospicontrol-$(date +%F).dump"
```

Restauration :

```bash
pg_restore --clean --no-owner --dbname "$DATABASE_URL" hospicontrol-2026-06-17.dump
```

- **Fréquence conseillée** : quotidienne, avec **rétention 7–30 jours**.
- **Stockage** : déposer les dumps chiffrés sur un stockage externe (différent de Railway), jamais dans le dépôt Git.
- **Automatisation** : planifier le `pg_dump` via une tâche cron (machine d'admin, GitHub Actions planifié, ou un service Railway *cron*).
- **Test de restauration** : restaurer un dump sur une base jetable au moins une fois par mois pour garantir que les sauvegardes sont exploitables.
