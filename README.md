# AMAC Gouvernance 2.0 — Plateforme de Toilettage des Textes Fondateurs

Plateforme mobile-first de modernisation et de consolidation pour la réforme des statuts (49 articles) et du règlement intérieur (47 articles) de l'AMAC (Les Amis de la Musique Afro-Cubaine), régie par la loi ivoirienne n° 60-315.

---

## 🚀 Installation & Développement Local (Windows / PowerShell)

### 1. Prérequis
- **Node.js** (v18+)
- **pnpm** (gestionnaire de paquets obligatoire)
- Une instance **Supabase** (locale ou hébergée)

### 2. Cloner et Installer les Dépendances
Dans votre terminal PowerShell Windows :
```powershell
# Installer les dépendances
pnpm install

# Approuver les scripts de build requis (sharp, esbuild)
pnpm approve-builds
```

### 3. Configuration des Variables d'Environnement
Créez un fichier `.env.local` à la racine du projet et configurez les clés suivantes :
```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here (uniquement requis pour les scripts hors-site)

# Optionnel : Fonctionnalités IA (Feature Flag)
AI_ENABLED=true
ANTHROPIC_API_KEY=your-anthropic-key-here
```

### 4. Configuration de la Base de Données (Supabase / Postgres)
1. Ouvrez l'éditeur SQL de votre console Supabase ou lancez votre CLI locale.
2. Copiez et exécutez le script DDL d'initialisation des tables et des politiques RLS situé dans :
   `supabase/migrations/20260722000000_init.sql`
3. Exécutez le script d'initialisation secondaire de la session de vote dans :
   `supabase/migrations/20260722000001_seminaire.sql`
4. Chargez les articles originaux de 2013 et les enjeux pré-identifiés en exécutant l'intégralité du fichier de seed dans :
   `supabase/seed.sql`

*Note : Les fichiers de seed originaux ont été générés à l'aide des scripts utilitaires présents dans `seed/generate_seeds.js` et `seed/generate_sql_seed.js`.*

### 5. Démarrer le Serveur de Développement
```powershell
pnpm dev
```
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur. Utilisez le simulateur d'appareils mobiles (F12, écran 380px) pour une expérience mobile-first optimale.

---

## 🧪 Validation & Tests

### Tests Unitaires (Consolidation & Renumérotation)
Vérifie le remplacement automatique des textes de loi, la renumérotation séquentielle et la mise à jour des renvois internes en cascade.
```powershell
pnpm test:unit
```

### Tests E2E (Playwright)
Vérifie le parcours complet de réponse à un questionnaire sur mobile.
```powershell
# Installer les navigateurs Playwright
pnpm exec playwright install

# Exécuter les tests E2E
pnpm test:e2e
```

### Compilation de Production
Valider la conformité stricte TypeScript et Next.js 15 :
```powershell
pnpm build
```

---

## 🛠️ Schéma des 6 Modules Fonctionnels

1. **Lecteur de Textes** : Consultation swipeable article par article avec encart des anomalies juridiques et recherche plein texte Postgres.
2. **Questionnaire de Modernisation** : Options A/B comparées avec échelle d'accord et autosauvegarde en direct (<1s perçue).
3. **Table de Concordance** : Tableau de bord de suivi avec export Word (DOCX) officiel et impression PDF via CSS `@media print`.
4. **Scoreboard** : Classement public en direct des sections (émulation positive, Supabase Realtime).
5. **Mode Séminaire** : Écran de projection et console scribe d'arbitrage en direct.
6. **Dashboard BEN** : Suivi global des avancements et renumérotation logique avec édition finale.

---

## 📦 Procédure de Déploiement

### Déploiement Next.js sur Vercel
1. Connectez votre dépôt Git à votre projet Vercel.
2. Ajoutez les variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `AI_ENABLED`, `ANTHROPIC_API_KEY`).
3. Vercel détectera automatiquement la configuration Next.js et gérera le déploiement.

### Base de Données sur Supabase (Production)
1. Créez un nouveau projet Supabase.
2. Exécutez les fichiers SQL de migration dans le gestionnaire de requêtes (SQL Editor) dans l'ordre :
   - `supabase/migrations/20260722000000_init.sql`
   - `supabase/migrations/20260722000001_seminaire.sql`
   - `supabase/seed.sql`
3. Dans la section *Database -> Realtime*, assurez-vous que les tables `decisions`, `reponses`, `propositions` et `seminaire_session` sont bien cochées pour la réplication en temps réel.
