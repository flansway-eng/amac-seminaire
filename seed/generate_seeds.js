const fs = require('fs');
const path = require('path');

// 1. STATUTS GENERATOR
function generateStatuts() {
  const articles = [];
  
  // Titres & Chapitres helper
  function getTitreParent(num) {
    if (num <= 5) return "TITRE I - CONSTITUTION - OBJET - DUREE - SIEGE";
    if (num <= 12) return "TITRE II - ACQUISITION ET PERTE DE LA QUALITE DE MEMBRE";
    if (num <= 16) return "TITRE III - DROITS AND DEVOIRS DES MEMBRES"; // Double Titre III
    if (num <= 25) return "TITRE IV - ORGANISATION GENERALE";
    if (num <= 36) return "TITRE V - ADMINISTRATION ET FONCTIONNEMENT";
    if (num <= 39) return "TITRE III - DE LA SECTION"; // Numérotation cassée, insérée dans le Titre V
    if (num <= 43) return "TITRE V - RESSOURCES FINANCIERES"; // Double Titre V
    if (num <= 46) return "TITRE VI - MODIFICATION DES STATUTS ET DISSOLUTION";
    return "TITRE VII - DISPOSITIONS FINALES";
  }

  function getChapitre(num) {
    if (num >= 17 && num <= 21) return "CHAPITRE I - L'ASSEMBLEE GENERALE";
    if (num >= 22 && num <= 23) return "CHAPITRE II - L'ORGANISME DE CONTROLE";
    if (num >= 24 && num <= 36) return "CHAPITRE III - L'ORGANISATION ADMINISTRATIVE";
    return null;
  }

  for (let i = 1; i <= 49; i++) {
    let titre = `Article ${i}`;
    let contenu = `Contenu standard de l'article ${i} des statuts de l'AMAC. Conformément aux dispositions en vigueur, les membres s'engagent à respecter l'objet de l'association et à participer activement à ses activités pour promouvoir la musique afro-cubaine.`;
    
    // Hardcode critical articles with issues
    if (i === 1) {
      titre = "Constitution";
      contenu = "Il est constitué en Côte d'Ivoire entre les personnes qui adhèrent aux présents statuts et conformément aux dispositions de la loi N° 60-315 du 21/09/1960. Une association dénommée « LES AMIS DE LA MUSIQUE AFRO-CUBAINE » En abrégé L'A.M.A.C.";
    } else if (i === 5) {
      titre = "Régime juridique";
      contenu = "L'association est régie par la loi n° 60-315 du 21 septembre 1960 relative aux associations en Côte d'Ivoire.";
    } else if (i === 6) {
      titre = "Moyens d'action";
      contenu = "Les moyens d'action de l'association sont : l'organisation de concerts, de conférences, de séminaires, d'ateliers de danse et de percussion, et toute autre activité culturelle favorisant la musique afro-cubaine.";
    } else if (i === 13) {
      titre = "Perte de la qualité de membre et droit de vote des fondateurs";
      contenu = "La qualité de membre se perd par démission, exclusion ou décès. Les membres fondateurs ne disposent pas du droit de vote lors des assemblées générales ordinaires et extraordinaires de l'AMAC, disposant uniquement d'une voix consultative.";
    } else if (i === 14) {
      titre = "Droits et devoirs";
      contenu = "Chaque membre a le droit de participer aux activités de l'association. Les devoirs des membres s'exercent conformément à l'art. 6 pour la devise et l'identité visuelle de l'association.";
    } else if (i === 21) {
      titre = "Quorum de l'Assemblée Générale";
      contenu = "L'assemblée générale ne peut valablement délibérer que si elle réunit les 2/3 de ses membres. Si ce quorum n'est pas atteint, une nouvelle assemblée est convoquée à un mois d'intervalle et peut délibérer quel que soit le nombre de présents.";
    } else if (i === 22) {
      titre = "Droit de procuration";
      contenu = "Le vote par procuration est autorisé uniquement pour les membres fondateurs empêchés. Nul ne peut être porteur de plus de deux procurations.";
    } else if (i === 23) {
      titre = "Composition et rôle du Comité de Contrôle";
      contenu = "Le Comité de Contrôle est composé principalement de membres fondateurs. Il est chargé de veiller à l'application des statuts, d'organiser les élections et peut s'autosaisir de tout conflit interne ou suspicion de mauvaise gestion.";
    } else if (i === 26) {
      titre = "Composition du Bureau Exécutif National (BEN)";
      contenu = "Le BEN comprend un Président et 9 autres membres nommés directement par le Président seul, y compris un Vice-Président, un Secrétaire Général et un Trésorier Général.";
    } else if (i === 29) {
      titre = "Majorité requise pour les décisions du BEN";
      contenu = "Les décisions du Bureau Exécutif National sont prises à la majorité de 51 % des suffrages exprimés. En cas de partage des voix, celle du Président est prépondérante.";
    } else if (i === 32) {
      titre = "Attributions du Président";
      contenu = "Le Président est le représentant légal de l'association. Il nomme seul les 9 autres membres du BEN et peut déléguer ses pouvoirs au Vice-Président comme prévu à l'article 26 des statuts.";
    } else if (i === 35) {
      titre = "Mandat du Bureau Exécutif";
      contenu = "Le mandat du Bureau Exécutif est calqué sur celui du Président, soit une durée de 5 ans renouvelable. Il comprend également le 1er Vice-Président qui seconde le Président.";
    } else if (i === 37) {
      titre = "Création des Sections";
      contenu = "Il est créé au sein de l'AMAC des sections locales. Chaque section regroupe les membres d'une même localité géographique.";
    } else if (i === 38) {
      titre = "Aire géographique des Sections";
      contenu = "Chaque section exerce ses activités sur l'aire géographique définie à l'article 14 des présents statuts, sous la supervision du responsable de section.";
    } else if (i === 39) {
      titre = "Fonctionnement des Sections";
      contenu = "Le responsable de section est élu par les membres locaux et rend compte de ses activités au Bureau Exécutif National.";
    } else if (i === 44) {
      titre = "Proposition de modification";
      contenu = "Les présents statuts ne peuvent être modifiés que sur proposition des 2/3 du Bureau Exécutif ou de l'Assemblée Générale. L'adoption se fait conformément aux conditions de l'article 20 des statuts.";
    } else if (i === 46) {
      titre = "Révision et vote de modification";
      contenu = "Toute modification des statuts est adoptée à la majorité simple lors de l'assemblée, conformément aux dispositions de l'article 20.";
    } else if (i === 48) {
      titre = "Loi applicable";
      contenu = "Les présents statuts sont régis par la loi n° 60-315 du 20 septembre 1960 relative aux associations en Côte d'Ivoire.";
    }

    articles.push({
      numero: i,
      numero_affiche: `Article ${i}`,
      titre: titre,
      contenu_actuel: contenu,
      titre_parent: getTitreParent(i),
      chapitre: getChapitre(i),
      ordre: i
    });
  }
  return articles;
}

// 2. REGLEMENT INTERIEUR GENERATOR
function generateRI() {
  const articles = [];
  
  function getTitreParent(num) {
    if (num <= 4) return "TITRE I - ADHESION - COTISATIONS";
    if (num <= 15) return "TITRE II - DISCIPLINE ET SANCTIONS";
    if (num <= 23) return "TITRE III - DROITS AND DEVOIRS DES MEMBRES";
    if (num <= 34) return "TITRE IV - FONCTIONNEMENT DES ORGANES";
    if (num <= 39) return "TITRE V - DE LA SECTION LOCALE"; // Double Titre V
    if (num <= 43) return "TITRE V - DISPOSITIONS FINANCIERES";
    return "TITRE VII - DISPOSITIONS FINALES";
  }

  function getChapitre(num) {
    if (num >= 24 && num <= 30) return "CHAPITRE I - LE BUREAU EXECUTIF";
    if (num >= 31 && num <= 34) return "CHAPITRE II - LE COMITE DE CONTROLE";
    return null;
  }

  for (let i = 1; i <= 47; i++) {
    let titre = `Article ${i}`;
    let contenu = `Contenu standard de l'article ${i} du règlement intérieur de l'AMAC. Cet article précise les modalités d'application des statuts pour assurer le bon fonctionnement de l'association au quotidien.`;
    
    // Hardcode critical articles with issues
    if (i === 6) {
      titre = "Frais de carte de membre";
      contenu = "Les frais d'acquisition de la carte d'adhérent et le montant de la cotisation mensuelle sont fixés par le Bureau Exécutif National et payables d'avance.";
    } else if (i === 16) {
      titre = "Procédure d'exclusion";
      contenu = "En cas d'exclusion d'un membre pour faute grave, la procédure disciplinaire est régie par l'Article 6 ci-dessus, garantissant le droit de parole du membre.";
    } else if (i === 20) {
      titre = "Scrutins et vote des fondateurs";
      contenu = "Les membres fondateurs ne disposent pas de droit de vote lors des scrutins de l'assemblée, en conformité avec les statuts.";
    } else if (i === 24) {
      titre = "Délégation de vote";
      contenu = "Le vote par procuration est restreint aux membres fondateurs empêchés lors de la réunion de l'assemblée générale.";
    } else if (i === 25) {
      titre = "Composition du Comité de Contrôle";
      contenu = "Le Comité de Contrôle est composé exclusivement de membres fondateurs, afin de garantir l'indépendance de leur mission d'audit.";
    } else if (i === 30) {
      titre = "Intérim de la Présidence";
      contenu = "En cas d'empêchement temporaire du Président, le Vice-Président assure l'intérim de la présidence du Bureau Exécutif comme prévu à l'article 26 des statuts.";
    } else if (i === 44) {
      titre = "Révision du Règlement Intérieur";
      contenu = "Les modifications du règlement intérieur sont adoptées conformément à l'article 20 des statuts de l'association.";
    }

    articles.push({
      numero: i,
      numero_affiche: `Article ${i}`,
      titre: titre,
      contenu_actuel: contenu,
      titre_parent: getTitreParent(i),
      chapitre: getChapitre(i),
      ordre: i
    });
  }
  return articles;
}

// Write the files
const seedDir = path.join(__dirname);
if (!fs.existsSync(seedDir)) {
  fs.mkdirSync(seedDir, { recursive: true });
}

fs.writeFileSync(
  path.join(seedDir, 'statuts.json'),
  JSON.stringify(generateStatuts(), null, 2),
  'utf-8'
);

fs.writeFileSync(
  path.join(seedDir, 'reglement_interieur.json'),
  JSON.stringify(generateRI(), null, 2),
  'utf-8'
);

console.log("Seeds JSON files successfully created!");
