/**
 * Script de re-seed : exécute le SQL de seed.sql directement sur Supabase
 * en utilisant la service_role_key pour contourner RLS.
 * 
 * Usage : node seed/reseed-supabase.js
 */
const fs = require('fs');
const path = require('path');

// Charger .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local');
  process.exit(1);
}

const seedSql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'seed.sql'), 'utf-8');

// Supabase expose un endpoint SQL via le protocole pg-meta
// POST /pg/query  avec le body { query: "..." }
async function runSQL(sql) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;
  
  // Essai 1 : via la fonction RPC exec_sql (si elle existe)
  let res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (res.ok) {
    return { method: 'rpc/exec_sql', status: res.status };
  }

  // Essai 2 : via le pg-meta endpoint (disponible sur hosted Supabase)
  const pgMetaUrl = SUPABASE_URL.replace('.supabase.co', '.supabase.co') + '/pg/query';
  // Actually the correct endpoint is via the management API
  // Let's try the SQL API endpoint  
  const sqlApiUrl = `${SUPABASE_URL}/rest/v1/`;
  
  console.log(`⚠️  La fonction RPC exec_sql n'existe pas. On va créer la fonction et ré-essayer...`);
  
  // Create the function first
  const createFn = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  // We need to use the pg-meta API to create the function
  // Alternative: split SQL into individual statements and use the Supabase client
  return null;
}

// Alternative approach: use @supabase/supabase-js to do the operations
async function reseedWithClient() {
  // Dynamic import for ESM compatibility
  const { createClient } = require('@supabase/supabase-js');
  
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log('🗑️  Suppression des données existantes...');
  
  // Ordre de suppression : enfants → parents (pour respecter les FK)
  const tablesToClear = ['decisions', 'propositions', 'reponses', 'questions', 'enjeux', 'articles', 'textes', 'sections'];
  
  for (const table of tablesToClear) {
    const { error } = await supabase.from(table).delete().neq('id', -99999);
    if (error) {
      console.warn(`  ⚠️  ${table}: ${error.message}`);
    } else {
      console.log(`  ✓ ${table} vidée`);
    }
  }

  // Charger les JSON
  const statuts = JSON.parse(fs.readFileSync(path.join(__dirname, 'statuts.json'), 'utf-8'));
  const ri = JSON.parse(fs.readFileSync(path.join(__dirname, 'reglement_interieur.json'), 'utf-8'));

  // 1. Sections
  console.log('\n📥 Insertion des sections...');
  const sections = [
    { id: 1, nom: 'Abidjan Lagunes', ville: 'Abidjan', responsable: 'M. Koffi Kouadio', actif: true },
    { id: 2, nom: 'Bouaké Vallée', ville: 'Bouaké', responsable: 'Mme Yao Amenan', actif: true },
    { id: 3, nom: 'Yamoussoukro Lacs', ville: 'Yamoussoukro', responsable: "M. N'guessan Konan", actif: true },
    { id: 4, nom: 'San-Pédro Nawa', ville: 'San-Pédro', responsable: 'M. Gnahoré Bailly', actif: true },
    { id: 5, nom: 'Korhogo Poro', ville: 'Korhogo', responsable: 'M. Silué Sékou', actif: true },
    { id: 6, nom: 'Daloa Haut-Sassandra', ville: 'Daloa', responsable: 'Mme Traoré Fatoumata', actif: true },
  ];
  const { error: secErr } = await supabase.from('sections').upsert(sections, { onConflict: 'id' });
  if (secErr) console.error('  ❌ sections:', secErr.message);
  else console.log('  ✓ 6 sections insérées');

  // 2. Textes
  console.log('📥 Insertion des textes...');
  const textes = [
    { id: 1, code: 'STATUTS', titre: "Statuts de l'AMAC - Edition 2013", date_adoption: '2013-12-24' },
    { id: 2, code: 'RI', titre: "Règlement Intérieur de l'AMAC - Edition 2013", date_adoption: '2013-12-24' },
  ];
  const { error: txtErr } = await supabase.from('textes').upsert(textes, { onConflict: 'id' });
  if (txtErr) console.error('  ❌ textes:', txtErr.message);
  else console.log('  ✓ 2 textes insérés');

  // 3. Articles STATUTS
  console.log('📥 Insertion des articles Statuts...');
  const statutsArticles = (statuts.articles || statuts).map((art, idx) => ({
    id: idx + 1,
    texte_id: 1,
    numero: art.numero,
    numero_affiche: art.numero_affiche,
    titre: art.titre,
    contenu_actuel: art.contenu_actuel,
    titre_parent: art.titre_parent,
    chapitre: art.chapitre,
    ordre: art.ordre,
  }));

  const { error: artSErr } = await supabase.from('articles').upsert(statutsArticles, { onConflict: 'id' });
  if (artSErr) console.error('  ❌ articles statuts:', artSErr.message);
  else console.log(`  ✓ ${statutsArticles.length} articles Statuts insérés`);

  // 4. Articles RI
  console.log('📥 Insertion des articles RI...');
  const riArticles = (ri.articles || ri).map((art, idx) => ({
    id: idx + 50,
    texte_id: 2,
    numero: art.numero,
    numero_affiche: art.numero_affiche,
    titre: art.titre,
    contenu_actuel: art.contenu_actuel,
    titre_parent: art.titre_parent,
    chapitre: art.chapitre,
    ordre: art.ordre,
  }));

  const { error: artRErr } = await supabase.from('articles').upsert(riArticles, { onConflict: 'id' });
  if (artRErr) console.error('  ❌ articles RI:', artRErr.message);
  else console.log(`  ✓ ${riArticles.length} articles RI insérés`);

  // 5. Vérification
  console.log('\n🔍 Vérification...');
  const { data: art1, error: verErr } = await supabase
    .from('articles')
    .select('numero, titre, titre_parent, contenu_actuel')
    .eq('texte_id', 1)
    .eq('numero', 1)
    .single();

  if (verErr) {
    console.error('❌ Vérification échouée:', verErr.message);
  } else {
    const ok = art1.contenu_actuel.includes("Côte d'Ivoire") && art1.titre_parent === "TITRE I : DISPOSITIONS GÉNÉRALES";
    console.log(ok 
      ? '✅ Article 1 vérifié : contenu réel + titre_parent correct' 
      : '❌ Article 1 NON conforme !');
    console.log(`   Titre parent: ${art1.titre_parent}`);
    console.log(`   Début: ${art1.contenu_actuel.substring(0, 100)}...`);
  }

  // Count
  const { count: totalArticles } = await supabase.from('articles').select('*', { count: 'exact', head: true });
  console.log(`\n📊 Total articles en base : ${totalArticles}`);
}

reseedWithClient()
  .then(() => {
    console.log('\n🎉 Re-seed terminé !');
    process.exit(0);
  })
  .catch(err => {
    console.error('💥 Erreur fatale:', err);
    process.exit(1);
  });
