# Scénario de démonstration — soutenance

Ce script déroule **la fonctionnalité cœur** : un patient suivi à l'**Hôpital A** est retrouvé à l'**Hôpital B**, qui n'accède à son historique **qu'après consentement** — et le perd à la **révocation**.

> Données déjà présentes (via le seed) : le patient **Jean Pierre Nguoa** (tél. `699112233`), créé par l'**Hôpital A**, avec 1 allergie (pénicilline) + 1 consultation. Aucun consentement initial.

## Comptes utilisés
| Rôle | Email | Mot de passe |
|---|---|---|
| Médecin Hôpital A | `medecin@hopital-a.cm` | `Medecin1234!` |
| Médecin Hôpital B | `medecin@hopital-b.cm` | `Medecin1234!` |
| Accueil Hôpital B | `accueil@hopital-b.cm` | `Accueil1234!` |

*(Astuce : sur la page de connexion, les puces « Accès par rôle » pré‑remplissent les comptes de l'Hôpital A.)*

---

## Acte 1 — L'Hôpital A a un dossier complet
1. Se connecter en **Médecin A** (`medecin@hopital-a.cm`).
2. Menu **Patients** → chercher `699112233` → **Ouvrir le dossier** → **Ouvrir le carnet**.
3. Montrer : l'**allergie à la pénicilline** et la **consultation** (avec prescription). *On peut en ajouter une en direct via « Nouvelle consultation ».*
4. Se déconnecter.

## Acte 2 — L'Hôpital B retrouve le patient mais ne voit pas son historique
5. Se connecter en **Médecin B** (`medecin@hopital-b.cm`).
6. Menu **Patients** → chercher `699 11 22 33` (format différent, exprès) → **le même patient est retrouvé** (badge « Patient partagé », origine Hôpital A). → souligner l'**identité globale par téléphone**.
7. **Ouvrir le carnet** → bandeau ambre : *« données de votre hôpital seulement »*. **L'historique de l'Hôpital A est invisible.**
8. Se déconnecter.

## Acte 3 — Le patient consent (saisi par l'accueil de B)
9. Se connecter en **Accueil B** (`accueil@hopital-b.cm`).
10. Menu **Patients** → chercher `699112233` → ouvrir la fiche.
11. Carte **« Consentement inter‑hôpitaux »** → cliquer **Autoriser**. → statut passe à **Autorisé**.
12. Se déconnecter.

## Acte 4 — L'Hôpital B voit désormais tout l'historique
13. Se reconnecter en **Médecin B** → carnet du patient.
14. ✅ **L'allergie et la consultation de l'Hôpital A apparaissent**, avec un badge **« Partagé »** ; bandeau vert *« partage autorisé »*. → **c'est le cœur de la démo.**

## Acte 5 — La révocation retire l'accès immédiatement
15. Se reconnecter en **Accueil B** → fiche patient → **Révoquer**.
16. Médecin B → carnet → **l'historique de l'Hôpital A a de nouveau disparu.**

---

## Ce que la démo prouve
- **Un seul dossier par patient**, identifié par téléphone (normalisé : `+237 699 11 22 33` = `699112233`).
- **Partage soumis au consentement** : l'Hôpital B ne voit l'historique de A qu'avec autorisation, conformément à la loi camerounaise 2024/017.
- **Révocation immédiate** : l'accès est recalculé à chaque lecture.

## Bonus (si le temps le permet)
- **Super admin** (`admin@carnet-medical.cm` / `Admin1234!`) → écran **Hôpitaux** → créer un hôpital + son admin (mot de passe temporaire généré).
- **Admin d'hôpital** → écran **Utilisateurs** → créer un médecin / un agent d'accueil.
