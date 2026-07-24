const fs = require('fs');
const path = require('path');

const statutsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'statuts.json'), 'utf8'));
const riData = JSON.parse(fs.readFileSync(path.join(__dirname, 'reglement_interieur.json'), 'utf8'));

let sql = `-- Seed AMAC Gouvernance 2.0
-- Sections
INSERT INTO sections (id, nom, ville, responsable, actif) VALUES
(1, 'Abidjan Lagunes', 'Abidjan', 'M. Koffi Kouadio', true),
(2, 'Bouaké Vallée', 'Bouaké', 'Mme Yao Amenan', true),
(3, 'Yamoussoukro Lacs', 'Yamoussoukro', 'M. N''guessan Konan', true),
(4, 'San-Pédro Nawa', 'San-Pédro', 'M. Gnahoré Bailly', true),
(5, 'Korhogo Poro', 'Korhogo', 'M. Silué Sékou', true),
(6, 'Daloa Haut-Sassandra', 'Daloa', 'Mme Traoré Fatoumata', true);

-- Textes
INSERT INTO textes (id, code, titre, date_adoption) VALUES
(1, 'STATUTS', 'Statuts de l''AMAC - Edition 2013', '2013-12-24'),
(2, 'RI', 'Règlement Intérieur de l''AMAC - Edition 2013', '2013-12-24');

-- Reset Auto-increments
SELECT setval('sections_id_seq', 6);
SELECT setval('textes_id_seq', 2);
`;

// Helper to escape SQL single quotes
function esc(str) {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

// Seed Articles (STATUTS: 1 to 49)
const statutsArticles = statutsData.articles || statutsData;
sql += `\n-- Articles STATUTS\n`;
statutsArticles.forEach((art, idx) => {
  const artId = idx + 1; // 1 to 49
  sql += `INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (${artId}, 1, ${art.numero}, ${esc(art.numero_affiche)}, ${esc(art.titre)}, ${esc(art.contenu_actuel)}, ${esc(art.titre_parent)}, ${esc(art.chapitre)}, ${art.ordre});\n`;
});

// Seed Articles (RI: 50 to 96)
const riArticles = riData.articles || riData;
sql += `\n-- Articles RI\n`;
riArticles.forEach((art, idx) => {
  const artId = idx + 50; // 50 to 96
  sql += `INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (${artId}, 2, ${art.numero}, ${esc(art.numero_affiche)}, ${esc(art.titre)}, ${esc(art.contenu_actuel)}, ${esc(art.titre_parent)}, ${esc(art.chapitre)}, ${art.ordre});\n`;
});

sql += `
-- Reset Auto-increments for Articles
SELECT setval('articles_id_seq', 96);
`;

// Enjeux Data Definitions
const enjeux = [
  {
    article_id: 13,
    type: "contradiction",
    gravite: "critique",
    description: "Contradiction vote fondateurs : L'article 13 exclut les membres fondateurs du droit de vote lors des scrutins ordinaires et extraordinaires (voix consultative uniquement), mais l'article 22 autorise le vote par procuration exclusivement pour les fondateurs empêchés.",
    base_legale: "Loi n° 60-315, art. 13 & 22 : Droit d'égalité de vote des adhérents dans les associations.",
    articles_lies: [13, 22, 69, 73]
  },
  {
    article_id: 23,
    type: "risque_gouvernance",
    gravite: "critique",
    description: "Comité de Contrôle juge et partie : Le comité est composé principalement de membres fondateurs (qui n'ont pas le droit de vote par ailleurs). Il est chargé de veiller à l'application des statuts, d'organiser les élections et de s'autosaisir, risquant un conflit d'intérêts électoral majeur.",
    base_legale: "Principe général du droit des contrats et des associations : impartialité des organes de contrôle électoraux.",
    articles_lies: [23, 74]
  },
  {
    article_id: 26,
    type: "risque_gouvernance",
    gravite: "critique",
    description: "Concentration excessive des pouvoirs : Le Président nomme à sa discrétion les 9 autres membres du Bureau Exécutif National (BEN) sans aucune validation de l'Assemblée Générale, et leur mandat est aligné sur le sien.",
    base_legale: "Loi n° 60-315 : Représentativité et reddition des comptes des administrateurs.",
    articles_lies: [26, 32, 35, 73, 79]
  },
  {
    article_id: 37,
    type: "incoherence_numerotation",
    gravite: "majeur",
    description: "Structure cassée : Doublon de \"TITRE III\". De plus, le titre \"De la Section\" (art. 37-39) est malencontreusement inséré au beau milieu du Titre V, cassant la hiérarchie logique. Le RI comporte également deux \"TITRE V\".",
    base_legale: "Insécurité juridique liée à l'impossibilité de citer proprement le texte officiel.",
    articles_lies: [37, 38, 39, 88]
  },
  {
    article_id: 14,
    type: "renvoi_errone",
    gravite: "majeur",
    description: "Renvoi erroné en cascade : L'art. 14 renvoie à \"l'art. 6\" pour la devise (l'art. 6 traite des moyens d'action de l'association, pas de la devise) ; l'art. 32 renvoie à \"l'article 26\" des statuts pour l'intérim, alors que l'art. 26 ne définit que la composition nominative.",
    base_legale: "Clarté normative et sécurité des statuts.",
    articles_lies: [14, 6, 32, 26, 38, 65, 79]
  },
  {
    article_id: 48,
    type: "incoherence_numerotation",
    gravite: "majeur",
    description: "Incohérence de date de la loi de référence : La loi 60-315 est datée du \"21 septembre 1960\" aux articles 1 et 5, mais du \"20 septembre 1960\" à l'article 48.",
    base_legale: "Loi n° 60-315 du 21 septembre 1960 relative aux associations.",
    articles_lies: [1, 5, 48]
  },
  {
    article_id: 21,
    type: "lacune",
    gravite: "majeur",
    description: "Quorum de 2/3 irréaliste en pratique : La règle impose un quorum des 2/3, mais autorise sur seconde convocation à 1 mois à délibérer sans aucun quorum. Cela incite à l'absentéisme stratégique et aux décisions par une minorité lors du second tour.",
    base_legale: "Gouvernance démocratique et représentativité.",
    articles_lies: [21]
  },
  {
    article_id: 46,
    type: "risque_gouvernance",
    gravite: "majeur",
    description: "Régime de modification statutaire sans majorité qualifiée : Les articles 46 Statuts / 44 RI renvoient l'adoption des révisions à un article de fonctionnement général qui n'exige qu'une majorité simple. Une modification des textes fondateurs à la majorité simple fragilise l'association.",
    base_legale: "Loi n° 60-315 : Robustesse des modifications statutaires.",
    articles_lies: [44, 46, 93]
  },
  {
    article_id: 93,
    type: "contradiction",
    gravite: "majeur",
    description: "Doublon abusif Statuts / Règlement Intérieur : Le RI recopie presque mot pour mot les statuts au lieu de préciser les règlements d'application internes, ce qui génère des contradictions à chaque mise à jour unilatérale.",
    base_legale: "Hiérarchie des normes : le RI est inférieur et ne doit pas répéter les statuts.",
    articles_lies: [44, 46, 93]
  },
  {
    article_id: 29,
    type: "modernisation",
    gravite: "mineur",
    description: "Formulation mathématique erronée : La clause \"51 % des suffrages\" est techniquement fausse (la majorité absolue se définit par 50 % + 1 voix des suffrages exprimés).",
    base_legale: "Précision de rédaction législative.",
    articles_lies: [29]
  },
  {
    article_id: 35,
    type: "renvoi_errone",
    gravite: "mineur",
    description: "Incohérence sur la Vice-Présidence : L'article 26 prévoit \"un Vice-Président\", mais l'article 35 fait référence au \"1er Vice-Président\", créant un flou sur le nombre exact de VP.",
    base_legale: "Consistance et clarté des statuts.",
    articles_lies: [26, 35]
  },
  {
    article_id: 55,
    type: "risque_gouvernance",
    gravite: "mineur",
    description: "Cautionnement électoral inéquitable : Exigence de 50 000 FCFA pour la Présidence et 30 000 FCFA pour le Comité de Contrôle, somme conservée par l'AMAC si le candidat obtient moins de 25% des voix. C'est une barrière injuste d'accès aux candidatures.",
    base_legale: "Équité et liberté de candidature au sein des associations.",
    articles_lies: [55]
  },
  {
    article_id: 49,
    type: "lacune",
    gravite: "critique",
    description: "Lacunes de modernisation de la gouvernance 2.0 : Aucune disposition ne prévoit les AG ou votes à distance, le vote électronique, la parité hommes-femmes, l'implication de la diaspora, les droits de la défense disciplinaire ou les archives numériques.",
    base_legale: "Adaptation aux usages numériques et au droit moderne des associations.",
    articles_lies: [49, 96]
  }
];

sql += `\n-- Enjeux\n`;
enjeux.forEach((enj, idx) => {
  const enjId = idx + 1;
  const liesStr = enj.articles_lies && enj.articles_lies.length > 0 
    ? `ARRAY[${enj.articles_lies.join(',')}]` 
    : 'NULL';
  sql += `INSERT INTO enjeux (id, article_id, type, gravite, description, base_legale, articles_lies) VALUES (${enjId}, ${enj.article_id}, '${enj.type}', '${enj.gravite}', ${esc(enj.description)}, ${esc(enj.base_legale)}, ${liesStr});\n`;
});

sql += `
-- Reset Auto-increments for Enjeux
SELECT setval('enjeux_id_seq', 13);
`;

// Questions Definitions
const questions = [
  {
    article_id: 13,
    ordre: 1,
    intitule: "Quelle règle de gouvernance appliquer concernant le droit de vote des membres fondateurs ?",
    type: "choix_ab",
    options: {
      option_a: "Voix consultative uniquement (Option A) : Supprimer la procuration exclusive et restreindre le droit des fondateurs à un rôle de conseil, sans pouvoir de vote lors des scrutins.",
      option_b: "Droit de vote plein et généralisé (Option B) : Accorder aux fondateurs les mêmes droits de vote que tout membre actif, et autoriser le vote par procuration pour tous les membres."
    },
    obligatoire: true
  },
  {
    article_id: 23,
    ordre: 1,
    intitule: "Comment réformer la composition et le rôle du Comité de Contrôle pour éliminer le risque de conflit d'intérêts ?",
    type: "choix_ab",
    options: {
      option_a: "Élection démocratique ouverte (Option A) : Les commissaires aux comptes et membres du comité de contrôle sont élus en AG parmi tous les membres actifs éligibles, sans monopole des fondateurs.",
      option_b: "Comité de sages fondateurs non-organisateur (Option B) : Maintenir la désignation parmi les fondateurs, mais confier l'organisation logistique des élections à une commission électorale indépendante."
    },
    obligatoire: true
  },
  {
    article_id: 26,
    ordre: 1,
    intitule: "Quel mécanisme de contrôle instaurer pour la nomination des membres du Bureau Exécutif National (BEN) ?",
    type: "choix_ab",
    options: {
      option_a: "Validation par l'Assemblée Générale (Option A) : Le Président nomme ses membres mais doit soumettre la liste nominative du BEN à l'approbation de l'AG lors de son élection.",
      option_b: "Pouvoir discrétionnaire du Président (Option B) : Conserver la nomination libre et directe par le Président, mais accorder à l'AG un droit de censure à la majorité qualifiée en cas de manquement."
    },
    obligatoire: true
  },
  {
    article_id: 37,
    ordre: 1,
    intitule: "Souhaitez-vous restructurer et uniformiser le statut des sections locales de l'AMAC ?",
    type: "choix_ab",
    options: {
      option_a: "Titre de Section autonome (Option A) : Créer un Titre de Section distinct à la fin de l'organisation pour clarifier les rôles et renumérotations.",
      option_b: "Intégration au fonctionnement général (Option B) : Insérer les règles des sections sous le même chapitre d'administration pour simplifier la structure."
    },
    obligatoire: true
  },
  {
    article_id: 14,
    ordre: 1,
    intitule: "Comment corriger les renvois erronés dans les textes (ex: devise à l'article 6, intérim du VP à l'article 26) ?",
    type: "choix_ab",
    options: {
      option_a: "Rénovation textuelle explicite (Option A) : Remplacer tous les renvois de numéros par des explications textuelles complètes dans chaque article concerné.",
      option_b: "Correction automatique et renumérotation (Option B) : Valider la correction logique des renvois via une table de concordance dynamique après adoption de la révision."
    },
    obligatoire: true
  },
  {
    article_id: 48,
    ordre: 1,
    intitule: "Quelle date unique de la loi 60-315 doit être retenue dans tous les articles ?",
    type: "choix_ab",
    options: {
      option_a: "21 septembre 1960 uniquement (Option A) : Corriger uniformément à la date légale exacte du 21 septembre 1960.",
      option_b: "Loi n° 60-315 relative aux associations (Option B) : Supprimer la mention des dates dans le corps des articles et ne conserver que le numéro de la loi."
    },
    obligatoire: true
  },
  {
    article_id: 21,
    ordre: 1,
    intitule: "Quel quorum réaliste fixer pour la tenue de l'Assemblée Générale de l'AMAC ?",
    type: "choix_ab",
    options: {
      option_a: "Quorum à la majorité simple (Option A) : Fixer le quorum à 50% + 1 membre à la première convocation, et 25% à la seconde convocation dans un délai de 15 jours.",
      option_b: "Quorum à distance (Option B) : Maintenir le quorum des 2/3 mais autoriser expressément la participation et le vote par visioconférence ou voie électronique."
    },
    obligatoire: true
  },
  {
    article_id: 46,
    ordre: 1,
    intitule: "Quelle majorité doit être exigée pour toute modification future des statuts de l'AMAC ?",
    type: "choix_ab",
    options: {
      option_a: "Majorité qualifiée des 2/3 (Option A) : Exiger le vote positif des deux tiers des membres présents ou représentés en AG.",
      option_b: "Majorité absolue (Option B) : Exiger le vote positif de la moitié plus un de l'ensemble des adhérents de l'association."
    },
    obligatoire: true
  },
  {
    article_id: 93,
    ordre: 1,
    intitule: "Comment structurer le Règlement Intérieur par rapport aux Statuts ?",
    type: "choix_ab",
    options: {
      option_a: "RI Opérationnel (Option A) : Supprimer tous les articles recopiés des statuts dans le RI et y inscrire uniquement les procédures pratiques de gestion.",
      option_b: "Double validation (Option B) : Conserver les textes identiques dans les deux documents avec une clause explicite de primauté des statuts."
    },
    obligatoire: true
  },
  {
    article_id: 29,
    ordre: 1,
    intitule: "Comment reformuler la majorité requise de 51% des voix ?",
    type: "choix_ab",
    options: {
      option_a: "Majorité absolue (Option A) : Modifier par la formule légale \"majorité absolue des suffrages exprimés\".",
      option_b: "Majorité des membres présents (Option B) : Remplacer par \"la moitié plus une des voix des membres présents ou représentés\"."
    },
    obligatoire: true
  },
  {
    article_id: 35,
    ordre: 1,
    intitule: "Quel nombre de Vice-Présidents l'AMAC doit-elle instituer ?",
    type: "choix_ab",
    options: {
      option_a: "Un VP unique (Option A) : Un unique Vice-Président désigné pour seconder et remplacer temporairement le Président.",
      option_b: "Deux VP (Option B) : Établir un 1er VP (Administration/Organisation) et un 2ème VP (Affaires Culturelles et Artistiques)."
    },
    obligatoire: true
  },
  {
    article_id: 55,
    ordre: 1,
    intitule: "Faut-il modifier le régime des cautionnements électoraux des candidats ?",
    type: "choix_ab",
    options: {
      option_a: "Suppression totale (Option A) : Remplacer le cautionnement financier par une obligation de parrainage écrit par au moins 10 membres issus de sections différentes.",
      option_b: "Réduction de cautionnement (Option B) : Ramener la caution à 20 000 FCFA remboursée à partir de 10% des suffrages recueillis."
    },
    obligatoire: true
  },
  {
    article_id: 49,
    ordre: 1,
    intitule: "Quelles fonctionnalités modernes intégrer dans la révision finale des statuts ?",
    type: "choix_ab",
    options: {
      option_a: "Gouvernance numérique globale (Option A) : Inscrire dans les statuts la légitimité du vote électronique, des AG en ligne, et la création de sections virtuelles pour la diaspora.",
      option_b: "Due Process disciplinaire (Option B) : Inscrire un droit à la défense avec convocation écrite, délai de 15 jours pour préparer sa défense et commission d'appel indépendante."
    },
    obligatoire: true
  }
];

sql += `\n-- Questions\n`;
questions.forEach((q, idx) => {
  const qId = idx + 1;
  sql += `INSERT INTO questions (id, article_id, ordre, intitule, type, options, obligatoire) VALUES (${qId}, ${q.article_id}, ${q.ordre}, ${esc(q.intitule)}, '${q.type}', ${esc(JSON.stringify(q.options))}, ${q.obligatoire});\n`;
});

sql += `
-- Reset Auto-increments for Questions
SELECT setval('questions_id_seq', 13);
`;

// Write seed file
const destPath = path.join(__dirname, '..', 'supabase', 'seed.sql');
fs.writeFileSync(destPath, sql, 'utf8');

console.log("SQL seed file successfully generated at: " + destPath);
