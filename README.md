# AMAC Gouvernance 2.0 — Plateforme de Toilettage des Textes Fondateurs

Plateforme mobile-first de modernisation et de consolidation pour la réforme des statuts (49 articles) et du règlement intérieur (47 articles) de l'AMAC (Les Amis de la Musique Afro-Cubaine), régie par la loi ivoirienne n° 60-315.

**Accès sans compte.** Il n'y a ni email, ni mot de passe, ni lien magique : un participant scanne un QR code ou clique un lien de section, saisit son nom, et entre immédiatement (voir `/rejoindre`). Voir « Modèle d'accès » ci-dessous.

---

## 🚀 Installation & Développement Local (Windows / PowerShell)

### 1. Prérequis
- **Node.js** (v18+)
- **pnpm** (gestionnaire de paquets obligatoire)
- Une instance **Supabase** dédiée à l'AMAC (ne jamais partager de projet Supabase avec une autre application — voir l'incident documenté dans l'historique du projet)

### 2. Cloner et Installer les Dépendances
```powershell
pnpm install
```

### 3. Configuration des Variables d'Environnement
Copiez `.env.example` en `.env.local` et renseignez :

```ini
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

SESSION_SECRET=            # 32 caractères aléatoires minimum : openssl rand -base64 32
STAFF_PIN_SCRIBE=          # 6 chiffres, communiqué uniquement au scribe désigné
STAFF_PIN_BEN=             # 6 chiffres, communiqué uniquement au BEN

NEXT_PUBLIC_SITE_URL=http://localhost:3000

AI_ENABLED=false
DEEPSEEK_API_KEY=
```

⚠️ **Next.js ne recharge pas `.env.local` à chaud.** Après toute modification, arrêtez puis relancez `pnpm dev`.

### 4. Configuration de la Base de Données (Supabase / Postgres)
Appliquez les migrations **dans l'ordre exact** via `supabase db push` (ou en collant chaque fichier dans l'éditeur SQL du dashboard, dans cet ordre) :

```powershell
supabase link --project-ref <ref-du-projet>
supabase db push
```

Ordre des migrations (`supabase/migrations/`) :
1. `20260722000000_init.sql` — schéma initial (textes, articles, enjeux, questions)
2. `20260722000001_seminaire.sql` — table `seminaire_session`
3. `20260723000000_profiles_role_lockdown.sql`
4. `20260723000001_add_user_roles.sql`
5. `20260723000002_schema_seminaire_gaps.sql`
6. `20260724000000_participants_sans_auth.sql` — **suppression de Supabase Auth**, table `participants`, nouveau modèle RLS

Puis chargez les données de référence :
```powershell
pnpm seed                 # régénère supabase/seed.sql depuis seed/*.json
supabase db execute -f supabase/seed.sql
```

### 5. Démarrer le Serveur de Développement
```powershell
pnpm dev
```
Ouvrez [http://localhost:3000/rejoindre](http://localhost:3000/rejoindre). Utilisez le simulateur d'appareils mobiles (F12, écran 380px) pour l'expérience mobile-first.

---

## 🔑 Modèle d'accès (sans compte)

- **`/rejoindre`** : écran d'entrée public. Nom + section (ou « Bureau Exécutif National » / « Invité / Observateur ») → un cookie signé (`amac_participant`, HMAC-SHA256, `SESSION_SECRET`) identifie le participant pour 30 jours. Accepte `?section=<slug>` et `?seance=<id>` en paramètres pré-remplis.
- **`/staff`** : élévation de rôle scribe/BEN par code à 6 chiffres (`STAFF_PIN_SCRIBE` / `STAFF_PIN_BEN`), 5 tentatives max / 10 min. Suppose qu'un participant a déjà rejoint.
- **`/ben/liens`** : génère les liens de section + QR codes à projeter/diffuser le jour du séminaire (réservé scribe/BEN/admin).
- **Middleware** (`src/middleware.ts`) : toute route hors `/rejoindre` et `/api` exige un cookie participant valide, sinon redirection vers `/rejoindre?suite=<chemin>`.
- **Écritures** : exclusivement via des Server Actions utilisant `SUPABASE_SERVICE_ROLE_KEY` (`src/lib/supabase/admin.ts`), jamais depuis le navigateur. Chaque action relit le participant depuis son cookie — jamais depuis une valeur transmise par le client.
- **Cotisation (art. 39 des statuts)** : ne bloque personne à l'entrée. Le dépouillement distingue les suffrages des sections à jour (valeur qui fait foi) du total tous suffrages confondus (indicatif) — voir `/seminaire/projection`.

---

## 🧪 Validation & Tests

```powershell
pnpm tsc --noEmit          # TypeScript strict
pnpm test:unit             # Vitest — cookie signé, gardes des Server Actions, décompte cotisation, consolidation
pnpm exec playwright install
pnpm test:e2e              # Playwright — parcours 380px sans compte, vote à deux contextes
pnpm build                 # Build de production
```

---

## 🛠️ Schéma des 6 Modules Fonctionnels

1. **Lecteur de Textes** : Consultation swipeable article par article avec encart des anomalies juridiques et recherche plein texte Postgres.
2. **Questionnaire de Modernisation** : Options A/B comparées avec échelle d'accord et autosauvegarde en direct.
3. **Table de Concordance** : Tableau de bord de suivi avec export Word (DOCX) officiel et impression PDF via CSS `@media print`.
4. **Scoreboard** : Classement public en direct des sections (émulation positive, Supabase Realtime).
5. **Mode Séminaire** : Écran de projection et console scribe d'arbitrage en direct, décompte double (sections à jour / total).
6. **Dashboard BEN** : Suivi global des avancements et renumérotation logique avec édition finale.

---

## 📦 Procédure de Déploiement

1. Créez un projet Supabase **dédié** à l'AMAC.
2. Appliquez les 6 migrations puis le seed, dans l'ordre indiqué en §4.
3. Dans *Database → Realtime*, assurez-vous que `reponses` et `seminaire_session` sont cochées pour la réplication (nécessaire aux abonnements Realtime du mode séminaire et du scoreboard).
4. Configurez les variables d'environnement sur votre hébergeur (Vercel ou autre), y compris `SESSION_SECRET`, `STAFF_PIN_SCRIBE`, `STAFF_PIN_BEN` et `NEXT_PUBLIC_SITE_URL` (URL publique réelle, utilisée par `/ben/liens` pour générer les QR codes).
