# Plan de présentation — HospiControl (soutenance)

> Durée cible : **~15 min** (présentation + démo) puis questions. Garde ce plan sous les yeux : pour chaque partie, **ce que tu dis** (points clés) et **ce que tu montres**.

---

## 0. Phrase d'accroche (15 s) — capte l'attention
> « Au Cameroun, quand un patient change d'hôpital, son histoire médicale repart de **zéro**. Le carnet papier se perd, le médecin repose les mêmes questions, et parfois prescrit un médicament auquel le patient est **allergique**. HospiControl résout ça. »

---

## 1. Le problème (1 min)
**Tu dis :**
- Carnets papier → perdus, illisibles, jamais là au bon moment.
- À chaque hôpital, on **recommence** l'historique → perte de temps, erreurs (interactions médicamenteuses, examens refaits).
- Quand le patient change d'établissement, le nouveau n'a **aucune information**.
- *(Fait fort)* C'est **le frein n°1** documenté de la santé numérique en Afrique : des systèmes qui ne se parlent pas.

**Tu montres :** rien (ou une slide simple « avant : papier fragmenté »).

---

## 2. La vision & le concept clé (1 min)
**Tu dis :**
- **Un seul carnet médical numérique par patient**, partagé, hébergé dans le cloud.
- Identifié par le **numéro de téléphone** (quasi‑universel au Cameroun) → **identité globale**, pas de doublon.
- Tous les hôpitaux affiliés écrivent dans **le même carnet**.
- **Le cœur** : le partage entre hôpitaux est **soumis au consentement du patient** (loi camerounaise 2024/017).

**Tu montres :** la **page de connexion** (logo, identité visuelle pro).

---

## 3. Architecture & rôles (1 min — montre que c'est carré)
**Tu dis :**
- **4 rôles** : Super admin (plateforme), Admin d'hôpital (ses utilisateurs), Médecin (clinique), Accueil (patients & consentement).
- Stack moderne : **NestJS + Prisma + PostgreSQL** (API) et **Next.js + Tailwind** (interface).
- **Sécurité par défaut** : JWT, mots de passe hachés (argon2), accès filtré par rôle ET par hôpital.

**Tu montres :** connecte‑toi et montre que **chaque rôle a sa propre interface** (sidebar différente).

---

## 4. 🎯 LA DÉMO — le scénario qui prouve tout (5–6 min, le moment fort)
> Suis [SCENARIO_DEMO.md](SCENARIO_DEMO.md). Annonce : « Je vais vous montrer un patient suivi à l'Hôpital A, retrouvé à l'Hôpital B. »

**Acte 1 — L'Hôpital A a un dossier.** Médecin A → Patients → `699112233` → carnet : allergie pénicilline + consultation. *« Voilà l'historique de Jean. »*

**Acte 2 — L'Hôpital B le retrouve mais ne voit rien.** Médecin B → cherche le même numéro (autre format) → **le même patient** (identité globale !) → ouvre le carnet → **bandeau ambre : données invisibles**. *« B sait que Jean existe, mais ne voit pas son histoire. »*

**Acte 3 — Le PATIENT consent.** Accueil B → fiche → **« Demander l'accès »** → un **lien est envoyé au patient** (par email). → Ouvre l'**espace patient** → **« Autoriser »**. *« Ce n'est pas l'hôpital qui décide : c'est le patient lui‑même, depuis son téléphone. »*

**Acte 4 — B voit tout.** Médecin B → carnet → **l'historique de l'Hôpital A apparaît** (badge « Partagé »). *« Le médecin a maintenant l'info vitale : l'allergie. »*

**Acte 5 — Révocation immédiate.** Le patient révoque → l'accès disparaît aussitôt.

> 💡 **Insiste ici** : c'est le cœur du projet et la « définition de terminé ».

---

## 5. Maturité produit — ce qui fait la différence (2 min)
> Ici tu montres que tu as pensé au **monde réel**, pas juste à une maquette.

**Tu dis :**
- **Le consentement est vraiment celui du patient** (espace patient + lien magique). *Je me suis inspiré de la France (« Mon espace santé ») et de l'Estonie, où le patient contrôle son dossier.*
- **Journal d'accès** : chaque consultation du carnet est **tracée** — le super admin (et demain le patient) voit **qui a accédé, quand**. (modèle Estonie → confiance).
- **Accès d'urgence (« bris de glace »)** : si le patient est **inconscient**, le médecin peut forcer l'accès **avec un motif obligatoire**, et c'est **tracé**. *Sauver une vie sans trahir la confidentialité.*
- **Identité renforcée** : téléphone + **CNI** pour éviter les doublons.

**Tu montres :** la **Vue globale** (super admin) avec le **journal d'accès** qui se remplit, et le bouton **Accès d'urgence** sur un carnet.

---

## 6. Les défis & comment je les ai résolus (1 min — montre la réflexion)
**Tu dis :**
- *Défi : et si le patient n'a pas d'email ?* → repli **consentement en présentiel** attesté par l'accueil.
- *Défi : le SMS coûte de l'argent.* → j'utilise **l'email (gratuit)** + une architecture où le canal est **interchangeable** (SMS/QR plus tard).
- *Défi : sécurité des données sensibles.* → hachage, JWT, cloisonnement par rôle, traçabilité, conformité à la loi 2024/017.

---

## 7. Perspectives (1 min — montre la vision long terme)
**Tu dis :**
- **Mode hors‑ligne (PWA / app mobile)** pour les zones à réseau/électricité intermittents.
- **Interopérabilité FHIR** pour dialoguer avec les systèmes existants (OpenMRS…).
- **Portail patient complet** + notifications.
- **Modèle économique** : abonnement mensuel par hôpital (SaaS), gratuit au démarrage pour amorcer le réseau.

---

## 8. Conclusion (30 s)
> « HospiControl, c'est **un seul carnet pour chaque patient, partagé entre les hôpitaux, mais contrôlé par le patient**. On remplace le papier perdu par une mémoire médicale continue — et on le fait dans le respect de la vie privée. Merci. »

---

## 🛡️ Préparation aux questions du jury
| Question probable | Ta réponse courte |
|---|---|
| **Et la confidentialité / sécurité ?** | Mots de passe hachés (argon2), JWT, accès filtré par rôle et hôpital, **journal d'accès**, consentement obligatoire, conforme loi 2024/017. |
| **Comment le patient consent‑il vraiment ?** | Il reçoit un lien sur son email et **autorise lui‑même** depuis son espace. Sans email : présentiel attesté. Évolutif vers SMS/QR. |
| **Un patient inconscient ?** | **Accès d'urgence** : le médecin force l'accès avec motif obligatoire, **tracé** et notifié. |
| **Et les doublons / le téléphone qui change ?** | Téléphone **normalisé** comme clé + **CNI** en pièce d'identité forte ; on retrouve par CNI. |
| **Et sans internet ?** | Limite assumée du MVP → perspective : **mode hors‑ligne (PWA)** + synchro. |
| **Différence avec un dossier existant (OpenMRS, papier) ?** | Le **partage inter‑hôpitaux soumis au consentement** + l'**identité globale**, ce que les silos actuels n'offrent pas. |
| **Comment ça gagne de l'argent ?** | **SaaS** : abonnement par hôpital, gratuit au début (effet réseau). |
| **C'est quoi la techno ?** | NestJS/Prisma/PostgreSQL + Next.js ; déployable sur Railway + Vercel. |

---

## ✅ Checklist avant de passer
- [ ] Les **2 serveurs tournent** (API `:4000`, front `:3000`) — teste la démo **une fois** avant.
- [ ] Données de démo prêtes (patient **Jean**, comptes A & B).
- [ ] Onglets/fenêtres ouverts à l'avance pour enchaîner vite (médecin A, médecin B, accueil B, espace patient).
- [ ] Parle **lentement**, montre l'écran, **pointe** ce qui change (les badges, le bandeau).
- [ ] Garde **le moment fort** (Acte 3–4 : le patient autorise) pour la fin de la démo.

> 🎤 Conseil : ne lis pas — **raconte une histoire** (« Jean tombe malade à Douala alors qu'il est suivi à Yaoundé… »). Le jury retient les histoires, pas les fonctionnalités.
