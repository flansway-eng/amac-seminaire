-- Seed AMAC Gouvernance 2.0
-- ⚠️  Nettoyage complet (ordre : enfants → parents)
TRUNCATE decisions, propositions, reponses, questions, enjeux, articles, textes, sections CASCADE;
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

-- Articles STATUTS
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (1, 1, 1, 'Article 1er', 'Constitution', 'Il est constitué en Côte d''Ivoire entre les personnes qui adhèrent aux présents statuts et conformément aux dispositions de la loi N° 60-315 du 21/09/1960.
Une association dénommée : « LES AMIS DE LA MUSIQUE AFRO-CUBAINE »
En abrégé L''A.M.A.C.', 'TITRE I : DISPOSITIONS GÉNÉRALES', NULL, 1);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (2, 1, 2, 'Article 2', 'Objet', 'L''Association est apolitique, laïc et à but non lucratif, elle a pour objet d''œuvrer en vue de :
1. Rassembler et réunir des hommes et des femmes épris de musique Afro-Cubaine ;
2. Cultiver l''amitié, le respect, la tolérance et la solidarité entre ses membres ;
3. Faire connaître et apprécier la musique Afro-Cubaine en Côte d''Ivoire et ailleurs ;
4. Faire connaître et apprécier la musique ivoirienne à Cuba et ailleurs.', 'TITRE I : DISPOSITIONS GÉNÉRALES', NULL, 2);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (3, 1, 3, 'Article 3', 'Durée', 'L''Association est constituée pour une durée illimitée.', 'TITRE I : DISPOSITIONS GÉNÉRALES', NULL, 3);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (4, 1, 4, 'Article 4', 'Siège Social', 'Le siège social de l''Association est fixé à Abidjan. Il peut être transféré en cas de besoin en tout lieu du territoire national par simple décision du Bureau Exécutif après consultation obligatoire de l''Assemblée Générale.', 'TITRE I : DISPOSITIONS GÉNÉRALES', NULL, 4);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (5, 1, 5, 'Article 5', 'Affiliation', 'L''Association peut s''affilier à des Unions de Club poursuivant des buts similaires dans les conditions prévues par la loi 60-315 du 21/09/1960.', 'TITRE I : DISPOSITIONS GÉNÉRALES', NULL, 5);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (6, 1, 6, 'Article 6', 'Moyens', 'Les moyens d''action non exhaustifs de l''Association sont entre autres :
- Les voyages d''études ;
- Les manifestations diverses ;
- L''utilisation des NTIC.', 'TITRE I : DISPOSITIONS GÉNÉRALES', NULL, 6);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (7, 1, 7, 'Article 7', 'Membres fondateurs', 'Sont membres fondateurs, les personnes qui :
- ont participé effectivement à la création de l''Association ;
- se sont distinguées par des dons, des démarches ou des aides de toute nature pour la mise en place définitive de l''Association.
La qualité de membre fondateur est une prérogative, elle ne se transmet pas et se perd par démission ou décès.', 'TITRE II : ACQUISITION ET PERTE DE LA QUALITÉ DE MEMBRE', 'Chapitre 1er : Statuts des membres', 7);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (8, 1, 8, 'Article 8', 'Membres Actifs', 'Sont membres actifs les personnes qui :
- ont formulé une demande écrite dans ce sens ;
- ont adhéré aux présents statuts ;
- se sont acquittés d''une part de leur droit d''adhésion et d''autre part de leurs cotisations annuelles.', 'TITRE II : ACQUISITION ET PERTE DE LA QUALITÉ DE MEMBRE', 'Chapitre 1er : Statuts des membres', 8);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (9, 1, 9, 'Article 9', 'Anciens Présidents', 'L''Ancien président est la personne qui a été une fois président d''un bureau exécutif de L''AMAC.
Le conseil des Anciens Présidents est composé de tous les anciens présidents du Bureau Exécutif.
Le conseil des Anciens Présidents est présidé par un Président élu par ses pairs.
Le conseil des Anciens Présidents a un rôle consultatif et de conseil.
Des missions ponctuelles peuvent lui être confiées par le Président du Bureau Exécutif.', 'TITRE II : ACQUISITION ET PERTE DE LA QUALITÉ DE MEMBRE', 'Chapitre 1er : Statuts des membres', 9);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (10, 1, 10, 'Article 10', 'Membres d''honneur', 'Sont membres d''honneur les personnes qui ont rendu des services reconnus à L''A.M.A.C ; ils sont agréés par le Bureau Exécutif.', 'TITRE II : ACQUISITION ET PERTE DE LA QUALITÉ DE MEMBRE', 'Chapitre 1er : Statuts des membres', 10);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (11, 1, 11, 'Article 11', 'Adhésion', 'Peuvent adhérer à L''A.M.A.C. toutes les personnes qui jouissent de leurs droits civiques et qui adhèrent aux présents statuts et règlement intérieur.', 'TITRE II : ACQUISITION ET PERTE DE LA QUALITÉ DE MEMBRE', 'Chapitre 2 : Adhésion et exclusion', 11);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (12, 1, 12, 'Article 12', 'Exclusion', 'La qualité de membre se perd par :
- Démission
- Exclusion
- Décès', 'TITRE II : ACQUISITION ET PERTE DE LA QUALITÉ DE MEMBRE', 'Chapitre 2 : Adhésion et exclusion', 12);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (13, 1, 13, 'Article 13', 'Droits des membres', '1) La qualité de membre actif confère les droits suivants :
- Droit de prendre part aux délibérations de l''assemblée générale ;
- Droit de vote et d''éligibilité ;
- Droit de participer aux manifestations officielles ;
- Droit de bénéficier des avantages accordés aux membres de l''AMAC.
2) La qualité de membre fondateur, de membre du Comité de Contrôle, de past président et de membre d''honneur confère les droits suivants :
1. En dehors du droit de vote et d''éligibilité, tous les autres droits accordés au membre actif.
2. Préséance particulière.
3. Les droits de participation aux manifestations officielles sont laissés à leur appréciation.', 'TITRE III : DROITS ET DEVOIRS DES MEMBRES', 'Chapitre 1er : Droits et Obligations des membres', 13);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (14, 1, 14, 'Article 14', 'Devoirs des membres', '1) Le membre actif a le devoir :
- D''observer la devise et l''idéal de l''Association (voir Art 6 des statuts de l''A.M.A.C) ;
- De s''acquitter de ses différentes cotisations ;
- De participer à toutes les réunions ;
- De respecter les décisions et les délibérations du Bureau Exécutif, du Bureau de section et de l''Assemblée Générale ;
- De présenter sa carte de membre chaque fois que cela est nécessaire.', 'TITRE III : DROITS ET DEVOIRS DES MEMBRES', 'Chapitre 1er : Droits et Obligations des membres', 14);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (15, 1, 15, 'Article 15', 'Les ressources du BUREAU EXÉCUTIF', 'Les ressources du Bureau Exécutif proviennent :
- De la moitié du droit d''adhésion de chaque membre fixé globalement à 10 000 FCFA (5 000 F CFA pour la Section et 5 000 F CFA pour le Bureau Exécutif) ;
- Des cotisations annuelles des membres du Bureau Exécutif qui sont fixées à la moitié de leurs cotisations dans leurs sections d''origine : le rythme du reversement au Bureau Exécutif est la fin de chaque trimestre et cette cotisation annuelle est fixée à 120 000 F CFA/AN soit 10 000 F CFA/MOIS ;
- Des cotisations exceptionnelles décidées au sein du Bureau Exécutif ;
- Des dons et legs provenant de personnes physiques et/ou morales.', 'TITRE IV : RESSOURCES FINANCIÈRES ET BUDGÉTAIRES', NULL, 15);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (16, 1, 16, 'Article 16', 'Année budgétaire', 'L''année budgétaire de l''Association commence le 1er Janvier et se termine le 31 Décembre de l''année civile en cours.', 'TITRE IV : RESSOURCES FINANCIÈRES ET BUDGÉTAIRES', NULL, 16);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (17, 1, 17, 'Article 17', 'Dépôt des fonds', 'BUREAU EXÉCUTIF : Les fonds de l''Association sont déposés (au nom de L''A.M.A.C) par le trésorier général dans un compte en banque ou tout organisme d''épargne agréé par l''État ivoirien.
AMAC-SECTION : Chaque section doit ouvrir un compte bancaire au nom de L''A.M.A.C-SECTION DE XX dans lequel sont déposés tous les fonds de la section.', 'TITRE IV : RESSOURCES FINANCIÈRES ET BUDGÉTAIRES', NULL, 17);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (18, 1, 18, 'Article 18', 'Composition', 'L''Assemblée Générale se compose de tous les membres actifs. Les membres d''honneur participent aux sessions de l''Assemblée Générale et y sont entendus, sauf objection de celle-ci, mais ils ne disposent pas du droit de vote.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 1 : L''Assemblée Générale', 18);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (19, 1, 19, 'Article 19', 'Pouvoirs', 'L''Assemblée Générale est l''organe suprême de l''Association. Ses principales fonctions consistent à :
- Déterminer la politique générale de l''Association ;
- Contrôler la politique financière, examiner et approuver le budget et le règlement financier de l''Association ;
- Fixer le taux des cotisations, mensuelles, annuelles, et le taux du droit d''adhésion ;
- Créer tout organe nécessaire au bon fonctionnement de l''Association ;
- Élire le Président et le Commissaire aux comptes ;
- Mandater, le cas échéant, le liquidateur de l''Association ;
- Déplacer le siège de l''Association ;
- Prendre toutes les mesures propres à la réalisation des objectifs de l''Association.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 1 : L''Assemblée Générale', 19);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (20, 1, 20, 'Article 20', 'Réunions', 'L''Assemblée Générale se réunit en session ordinaire une fois par an sur convocation du Bureau Exécutif.
L''Assemblée Générale Élective se réunit dans un délai de trois mois tout au plus à la fin du mandat du Président. La convocation pour l''assemblée générale élective est adressée aux sections avec l''ordre du jour et doit leur être indiquée deux mois avant la date prévue.
L''Assemblée Générale peut se réunir en session extraordinaire sur convocation du Comité de Contrôle.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 1 : L''Assemblée Générale', 20);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (21, 1, 21, 'Article 21', 'Quorum', 'La présence des 2/3 des membres à jour de leur cotisation à l''Assemblée Générale est obligatoire pour la validité des délibérations.
Si ce quorum n''est pas atteint lors de la première convocation, l''Assemblée Générale sera convoquée à 1 mois d''intervalle.
Lors de la deuxième réunion, elle peut valablement délibérer quel que soit le nombre de membres présents.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 1 : L''Assemblée Générale', 21);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (22, 1, 22, 'Article 22', 'Vote', 'Chaque membre à jour de ses cotisations dispose d''une voie à l''Assemblée Générale.
Le vote par procuration ou par correspondance est autorisé uniquement pour les membres fondateurs empêchés.
Le vote a lieu au scrutin secret. Toutes les décisions de l''Assemblée Générale sont prises à la majorité simple des membres présents et votants.
L''abstention n''est pas considérée comme un vote.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 1 : L''Assemblée Générale', 22);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (23, 1, 23, 'Article 23', 'Composition du Comité de Contrôle', 'Il comprend au plus cinq (5) membres qui sont principalement des membres fondateurs ; si le nombre de membres fondateurs existant est inférieur à cinq (5), ceux-ci coopteront l''effectif complémentaire.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 2 : Le Comité de Contrôle', 23);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (24, 1, 24, 'Article 24', 'Pouvoirs du Comité de Contrôle', '- Il est chargé de l''organisation de l''élection du président du BE et du Commissaire aux comptes.
- Il veille à l''exécution du plan d''activités du BE et du commissaire aux comptes.
- Il peut être saisi par le président du Bureau Exécutif ou par tout Président de section en cas de dysfonctionnement du Bureau Exécutif.
- Il peut s''autosaisir.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 2 : Le Comité de Contrôle', 24);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (25, 1, 25, 'Article 25', 'Mode de fonctionnement du Comité de Contrôle', 'Le Comité de Contrôle se réunit au moins deux (2) fois dans l''année à l''initiative de son président ou à la demande d''au moins trois (3) de ses membres.
Il est dirigé par un président élu par ses pairs et assisté d''un rapporteur.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 2 : Le Comité de Contrôle', 25);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (26, 1, 26, 'Article 26', 'Composition', 'Le Bureau Exécutif comprend au plus dix (10) membres pour les postes ci-après et qui peuvent fusionner ou doubler en raison du nombre final retenu par le Président du BE :
- Un Président ;
- Un Vice-Président ;
- Un Secrétaire Général ;
- Un Trésorier Général ;
- Un délégué aux relations publiques ;
- Un délégué aux affaires culturelles et à l''organisation ;
- Un conseiller.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 3 : Le Bureau Exécutif', 26);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (27, 1, 27, 'Article 27', 'CONDITIONS D''ÉLIGIBILITÉ DU PRÉSIDENT DU BUREAU EXÉCUTIF', '- Être âgé d''au moins trente cinq (35) ans révolus au jour du vote ;
- Jouir de tous ses droits civiques ;
- Être à jour de ses cotisations statutaires au jour du vote ;
- N''avoir encouru aucune sanction disciplinaire de l''Association ;
- Être disponible.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 3 : Le Bureau Exécutif', 27);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (28, 1, 28, 'Article 28', 'MODE OPÉRATOIRE DU SCRUTIN', 'Tout candidat au poste de président du bureau exécutif doit déposer, 1 mois à l''avance :
- Une demande de candidature motivée écrite et son plan sommaire de campagne au Comité de Contrôle.
- Un cautionnement de (50 000 F CFA pour le candidat à la présidence et 30 000 F CFA pour le candidat au commissariat aux comptes) remboursable si le candidat est élu ou s''il obtient au moins 25% des voix des votants.
- En dessous du suffrage de 25%, le candidat non élu perd son cautionnement sans aucun recours.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 3 : Le Bureau Exécutif', 28);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (29, 1, 29, 'Article 29', 'Le déroulement du scrutin', '- Un bureau de séance de cinq membres actifs au plus est mis en place séance tenante par le comité de contrôle (les membres présents du Comité de Contrôle) à l''Assemblée Générale.
- Le vote se fait au bulletin secret.
- Au premier tour, le candidat qui obtient 51% des suffrages exprimés est élu président ou commissaire aux comptes du Bureau Exécutif.
- En cas de reprise du vote tout candidat à la majorité relative est déclaré vainqueur.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 3 : Le Bureau Exécutif', 29);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (30, 1, 30, 'Article 30', 'La composition du nouveau Bureau Exécutif', 'La composition du nouveau Bureau Exécutif est connue 25 jours après le vote de son président.
Au-delà de cette période de 25 jours le Comité de Contrôle rappellera le Président élu à l''ordre ; au cas où celui-ci ne communique pas son bureau dans les quinze (15) jours suivants soit quarante cinq (45) jours après son élection, le Comité de Contrôle se fera le devoir de mettre en place un nouveau président en assemblée générale extraordinaire à convoquer dans les trente (30) jours qui suivent l''interpellation du président déchu.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 3 : Le Bureau Exécutif', 30);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (31, 1, 31, 'Article 31', 'La prise de fonction du nouveau Bureau Exécutif', 'Le nouveau Bureau Exécutif prend officiellement fonction dans les 30 jours qui suivent le vote de son président.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 3 : Le Bureau Exécutif', 31);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (32, 1, 32, 'Article 32', 'Attributions du Bureau Exécutif', 'Les attributions des membres du Bureau Exécutif sont les suivantes :

LE PRÉSIDENT
Le Président est le Chef du Bureau Exécutif dont il nomme tous les autres membres. À ce titre :
- Il est chargé de la mise en application de son Plan d''Activités tel que validé par l''Assemblée Générale.
- Il reçoit le programme d''activités de chaque section, et veille à l''exécution du programme harmonisé.
- Il convoque et préside les A.G et les réunions du Bureau Exécutif. Il veille à l''application des délibérations et des décisions qui y sont prises.
- Il représente l''Association dans tous les actes de la vie civile et il est investi de tous les pouvoirs à cet effet. Ainsi, il a qualité pour ester en justice au nom de l''Association.
- Il est le responsable de l''exécution du budget.

LE VICE-PRÉSIDENT
Il remplace le Président en cas d''empêchement conformément à l''article 26 des statuts.

LE SECRÉTAIRE GÉNÉRAL
Le Secrétaire Général est le responsable administratif de l''Association. À ce titre :
- Il rédige les procès-verbaux des délibérations et des décisions des assemblées générales et des réunions du Bureau Exécutif, il en assure la transcription sur le registre prévu à cet effet.
- Il prépare les réunions du Bureau Exécutif et des assemblées générales.
- Il rédige toutes les correspondances de l''Association et toutes les convocations.
- Il assure la garde des archives de L''A.M.A.C.

LE TRÉSORIER GÉNÉRAL
Le Trésorier Général est le responsable principal de la mobilisation des moyens financiers de l''Association, ainsi il est chargé de :
- Recouvrer toutes les cotisations des membres du Bureau Exécutif.
- Veiller au reversement des quotes-parts des droits d''adhésion, des manifestations officielles et cotisations statutaires.
- Il cosigne les retraits de fonds conjointement avec le président et le secrétaire général (2 signatures sur 3 obligatoires lors de l''opération de retrait mais une seule signature lors des dépôts de fonds sous toutes ses formes).
- Tenir les livres comptables conformément aux règles de procédure en vigueur.

LE DÉLÉGUÉ AUX AFFAIRES CULTURELLES ET À L''ORGANISATION
Il est chargé de l''exécution effective des activités culturelles et récréatives, notamment : Soirée, Gala, Réveillon, Conférence, débat, Sorties récréatives, Concert, etc.

LE DÉLÉGUÉ AUX RELATIONS PUBLIQUES
Il est chargé de la promotion de l''image de L''AMAC. À ce titre il assure les relations avec les médias et les sponsors.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 3 : Le Bureau Exécutif', 32);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (33, 1, 33, 'Article 33', 'Réunion', 'Le Bureau Exécutif se réunit une fois par mois sur convocation de son Président.
Le Bureau Exécutif se réunit également d''office à la demande des 2/3 de ses membres.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 3 : Le Bureau Exécutif', 33);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (34, 1, 34, 'Article 34', 'Décisions', 'Les décisions sont prises à la majorité simple des membres présents en tenant compte du quorum maximum à la tenue de la réunion. En cas d''égalité, la voix du Président est prépondérante.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 3 : Le Bureau Exécutif', 34);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (35, 1, 35, 'Article 35', 'Mandat', 'Le mandat du Bureau Exécutif est celui du Président.
Le Président national est élu pour 3 ans. Il est rééligible 1 fois. Il nomme les autres membres du bureau.
En cas d''indisponibilité prolongée du Président rendant impossible l''exercice de son mandat, il est remplacé par le 1er Vice-Président qui termine le mandat.
Le Président peut également être démis par l''Assemblée Générale s''il a eu un comportement portant atteinte à l''honneur et au bon fonctionnement de l''Association.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 3 : Le Bureau Exécutif', 35);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (36, 1, 36, 'Article 36', 'CONDITIONS D''ÉLIGIBILITÉ DU PRÉSIDENT DU BUREAU DE SECTION', 'Tout candidat à un poste de président de section doit justifier de 3 années effectives d''ancienneté dans sa section et être à jour de ses cotisations.
La durée du mandat du président de la section est de 3 ans renouvelable une fois.
Le mode opératoire du scrutin est défini dans le Règlement Intérieur aux présents statuts.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 3 : Le Bureau Exécutif', 36);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (37, 1, 37, 'Article 37', 'LA SECTION DE L''AMAC', 'Une section est un démembrement de l''Association dans une ville, une commune ou un quartier.', 'TITRE III [bis] : DE LA SECTION', NULL, 37);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (38, 1, 38, 'Article 38', 'LA CRÉATION DE LA SECTION DE L''AMAC', 'Une section peut être créée dans l''aire géographique définie à l''article 14 ci-dessus par au moins 10 personnes, jouissant de leurs droits civiques et qui en font la demande écrite officielle au Bureau Exécutif.
En cas d''avis favorable du Bureau Exécutif, un droit d''affiliation à l''AMAC est acquitté auprès du Bureau Exécutif avant le début de toute activité.', 'TITRE III [bis] : DE LA SECTION', NULL, 38);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (39, 1, 39, 'Article 39', 'Fonctionnement de la Section', 'La section créée est sous la tutelle administrative hiérarchique du Bureau Exécutif :
- Elle est régie exclusivement par les Statuts et Règlement Intérieur de l''Association.
- Elle jouit de l''autonomie financière.
- Elle a le devoir de verser chaque année civile, au Bureau Exécutif pour le financement de son fonctionnement, la somme forfaitaire de 40 000 F CFA (quarante mille).
- Elle a le devoir de reverser au Bureau Exécutif 20% du résultat net positif de chaque manifestation officielle à laquelle les autres sections et le BE ont pris part.
- Elle a le devoir de reverser au Bureau Exécutif la moitié du droit d''adhésion de chacun de ses membres pour la confection de sa carte d''affiliation à la Section.
- La Section doit établir au début de chaque année civile un Programme Annuel d''Activités (PAA) communiqué au Bureau Exécutif pour être intégré au programme d''activités annuel de L''AMAC.
- La réalisation de toute activité populaire majeure contenue dans le (PAA) de la section doit être soumise à l''approbation du Bureau Exécutif.
- Un rapport annuel d''activités sera fait à la fin de chaque année, le Bureau Exécutif doit en être destinataire principal pour exercer son droit de tutelle pour l''intégrer à son rapport annuel d''activités.
- Toute activité d''une section qui engage les autres sections ou le Bureau Exécutif, doit être soumise à l''approbation du Bureau Exécutif avant sa mise en œuvre.', 'TITRE III [bis] : DE LA SECTION', NULL, 39);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (40, 1, 40, 'Article 40', 'Élection', 'Le Commissaire aux comptes est élu par l''Assemblée Générale dans les mêmes conditions que le Président du Bureau Exécutif.
Il a la possibilité de s''adjoindre 1 ou 2 commissaires aux comptes suppléants après avis du Comité de Contrôle.
Dans ce cas il doit produire une argumentation motivant et surtout nécessitant cette adjonction ; en aucun cas les absences ou les indisponibilités professionnelles du commissaire aux comptes en chef ne sauraient justifier l''adjonction de suppléants.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 4 : Le Commissariat aux comptes', 40);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (41, 1, 41, 'Article 41', 'Attributions', 'Le commissaire aux comptes est chargé de :
- Contrôler la gestion comptable du Bureau Exécutif.
- Examiner et donner son avis sur la gestion financière du Bureau Exécutif.
- Rendre compte à l''Assemblée Générale par un rapport écrit à la fin de l''exercice annuel et du mandat du Bureau Exécutif sortant.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 4 : Le Commissariat aux comptes', 41);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (42, 1, 42, 'Article 42', 'Composition', 'Le Conseil des Anciens présidents comprend toutes les personnes qui ont été au moins une fois président du Bureau Exécutif de L''AMAC.
Ces anciens présidents sont organisés en un bureau dirigé par un président élu par ses pairs.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 5 : Le Conseil des Anciens présidents', 42);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (43, 1, 43, 'Article 43', 'Pouvoirs', 'Le conseil des Anciens Présidents a un rôle consultatif et de conseil.
Des missions ponctuelles peuvent lui être confiées par le Président du Bureau Exécutif ou le Comité de Contrôle.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 5 : Le Conseil des Anciens présidents', 43);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (44, 1, 44, 'Article 44', 'Réunion', 'Le Conseil des Anciens Présidents se réunit autant de fois que nécessaire à la demande de son président ou d''office à la demande des 2/3 de ses membres.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 5 : Le Conseil des Anciens présidents', 44);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (45, 1, 45, 'Article 45', 'Composition', 'Le Collectif des membres d''honneur comprend toutes les personnes qui ont rendu des services reconnus par le Bureau Exécutif de L''AMAC.
Ils sont agréés par le Bureau Exécutif.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 6 : Le Collectif des Membres d''honneur', 45);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (46, 1, 46, 'Article 46', 'Modifications des statuts et dissolution', 'Les fonctions dans les organes de l''Association ne sont pas rémunérées. Le Bureau Exécutif détermine et est responsable des dépenses de fonctionnement dont il a la charge.

Les modifications des statuts et la dissolution de l''Association sont proposées par :
- Les 2/3 des membres du Bureau Exécutif ou de l''Assemblée Générale.
Elles interviennent dans les conditions fixées par l''article 20 des présents statuts.', 'TITRE VI : DISPOSITIONS STATUTAIRES ET RÉGLEMENTAIRES', NULL, 46);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (47, 1, 47, 'Article 47', 'Liquidation', 'En cas de dissolution, l''Assemblée Générale désigne un commissaire chargé de la liquidation de l''Association.
L''Assemblée Générale décide de l''affectation de l''actif net.', 'TITRE VI : DISPOSITIONS STATUTAIRES ET RÉGLEMENTAIRES', NULL, 47);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (48, 1, 48, 'Article 48', 'Formalités d''usage', 'Le Président, au nom de l''Association, est chargé d''accomplir les formalités prescrites par la loi 60-315 du 20 septembre 1960 notamment les dispositions des articles 7, 8, 10, 36.', 'TITRE VI : DISPOSITIONS STATUTAIRES ET RÉGLEMENTAIRES', NULL, 48);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (49, 1, 49, 'Article 49', 'Règlement intérieur', 'Un règlement intérieur adopté par l''Assemblée Générale de l''AMAC définira les modalités d''application des présents statuts.', 'TITRE VI : DISPOSITIONS STATUTAIRES ET RÉGLEMENTAIRES', NULL, 49);

-- Articles RI
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (50, 2, 1, 'Article 1er', 'Constitution', 'Le présent Règlement intérieur a pour objet de définir les modalités d''application des statuts de « LES AMIS DE LA MUSIQUE AFRO-CUBAINE » en abrégé L''A.M.A.C.

Il est constitué en Côte d''Ivoire entre les personnes qui adhèrent aux présents statuts et conformément aux dispositions de la loi N° 60-315 du 21/09/1960, une association dénommée « LES AMIS DE LA MUSIQUE AFRO-CUBAINE » en abrégé L''A.M.A.C.', 'TITRE I : DISPOSITIONS GÉNÉRALES', NULL, 1);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (51, 2, 2, 'Article 2', 'Objet', 'L''Association est apolitique, laïc et à but non lucratif, elle a pour objet d''œuvrer en vue de :
1. Rassembler et réunir des hommes et des femmes épris de musique Afro-Cubaine ;
2. Cultiver l''amitié, le respect, la tolérance et la solidarité entre ses membres ;
3. Faire connaître et apprécier la musique Afro-Cubaine en Côte d''Ivoire et ailleurs ;
4. Faire connaître et apprécier la musique ivoirienne à Cuba et ailleurs.', 'TITRE I : DISPOSITIONS GÉNÉRALES', NULL, 2);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (52, 2, 3, 'Article 3', 'Durée', 'L''Association est constituée pour une durée illimitée.', 'TITRE I : DISPOSITIONS GÉNÉRALES', NULL, 3);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (53, 2, 4, 'Article 4', 'Siège Social', 'Le siège social de l''Association est fixé à Abidjan. Il peut être transféré en cas de besoin en tout lieu du territoire national par simple décision du Bureau Exécutif après consultation obligatoire de l''Assemblée Générale.', 'TITRE I : DISPOSITIONS GÉNÉRALES', NULL, 4);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (54, 2, 5, 'Article 5', 'Affiliation', 'L''Association peut s''affilier à des Unions de Club poursuivant des buts similaires dans les conditions prévues par la loi 60-315 du 21/09/1960.', 'TITRE I : DISPOSITIONS GÉNÉRALES', NULL, 5);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (55, 2, 6, 'Article 6', 'Moyens', 'Les moyens d''action non exhaustifs de l''Association sont entre autres :
- Les voyages d''études ;
- Les manifestations diverses ;
- L''utilisation des NTIC.', 'TITRE I : DISPOSITIONS GÉNÉRALES', NULL, 6);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (56, 2, 7, 'Article 7', 'Membres fondateurs', 'Sont membres fondateurs, les personnes qui :
- ont participé effectivement à la création de l''Association ;
- se sont distinguées par des dons, des démarches ou des aides de toute nature pour la mise en place définitive de l''Association.
La qualité de membre fondateur est une prérogative, elle ne se transmet pas et se perd par démission ou décès.', 'TITRE II : ACQUISITION ET PERTE DE LA QUALITÉ DE MEMBRE', 'Chapitre 1er : Statuts des membres', 7);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (57, 2, 8, 'Article 8', 'Membres Actifs', 'Sont membres actifs les personnes qui :
- ont formulé une demande écrite dans ce sens ;
- ont adhéré aux présents statuts ;
- se sont acquittés d''une part de leur droit d''adhésion et d''autre part de leurs cotisations annuelles.', 'TITRE II : ACQUISITION ET PERTE DE LA QUALITÉ DE MEMBRE', 'Chapitre 1er : Statuts des membres', 8);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (58, 2, 9, 'Article 9', 'Anciens Présidents', 'L''Ancien président est la personne qui a été une fois président d''un bureau exécutif de L''AMAC.
Le conseil des Anciens Présidents est composé de tous les anciens présidents du Bureau Exécutif.
Le conseil des Anciens Présidents est présidé par un Président élu par ses pairs.
Le conseil des Anciens Présidents a un rôle consultatif et de conseil.
Des missions ponctuelles peuvent lui être confiées par le Président du Bureau Exécutif.', 'TITRE II : ACQUISITION ET PERTE DE LA QUALITÉ DE MEMBRE', 'Chapitre 1er : Statuts des membres', 9);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (59, 2, 10, 'Article 10', 'Membres d''honneur', 'Sont membres d''honneur les personnes qui ont rendu des services reconnus à L''A.M.A.C ; ils sont agréés par le Bureau Exécutif.', 'TITRE II : ACQUISITION ET PERTE DE LA QUALITÉ DE MEMBRE', 'Chapitre 1er : Statuts des membres', 10);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (60, 2, 11, 'Article 11', 'Adhésion', 'Peuvent adhérer à la section, toutes les personnes qui jouissent de leurs droits civiques ayant la majorité réglementaire.
Tout membre de l''AMAC ne doit appartenir qu''à une seule section du territoire national. Un membre actif de section peut être désigné comme membre du Bureau Exécutif.', 'TITRE II : ACQUISITION ET PERTE DE LA QUALITÉ DE MEMBRE', 'Chapitre 2 : Adhésion et Exclusion des membres actifs', 11);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (61, 2, 12, 'Article 12', 'Exclusion', 'La qualité de membre se perd par démission, exclusion ou décès.
Les cas d''exclusion :
- Membre actif n''appartenant pas au Bureau : l''exclusion est proposée par son Bureau de section et la décision est rendue par le Bureau Exécutif.
- Membre appartenant au Bureau de section et/ou au Bureau Exécutif : la proposition est faite par le Bureau de section et/ou le Bureau Exécutif et la décision est rendue par l''Assemblée Générale Annuelle de l''exercice en cours.
Tout membre qui fait l''objet d''une exclusion doit déposer sa carte de membre en cours de validité à sa section.', 'TITRE II : ACQUISITION ET PERTE DE LA QUALITÉ DE MEMBRE', 'Chapitre 2 : Adhésion et Exclusion des membres actifs', 12);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (62, 2, 13, 'Article 13', 'Droits des membres', 'La qualité de membre actif confère les droits suivants :
- Droit de prendre part aux délibérations de l''assemblée générale ;
- Droit de vote et d''éligibilité ;
- Droit de participer aux manifestations officielles ;
- Droit de bénéficier des avantages accordés aux membres de l''AMAC.
La qualité de membre fondateur, de membre du Comité de Contrôle, de past président et de membre d''honneur confère les droits suivants :
1. En dehors du droit de vote et d''éligibilité, tous les autres droits accordés au membre actif.
2. Préséance particulière.
3. Les droits de participation aux manifestations officielles sont laissés à leur appréciation.', 'TITRE III : DROITS ET DEVOIRS DES MEMBRES', 'Chapitre 1er : Droits et Obligations des membres', 13);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (63, 2, 14, 'Article 14', 'Devoirs des membres', 'Le membre actif a le devoir :
- D''observer la devise et l''idéal de l''Association (voir Art. des statuts de l''A.M.A.C) ;
- De s''acquitter de ses différentes cotisations ;
- De participer à toutes les réunions ;
- De respecter les décisions et les délibérations du Bureau Exécutif, du Bureau de section et de l''Assemblée Générale ;
- De présenter sa carte de membre chaque fois que cela est nécessaire.', 'TITRE III : DROITS ET DEVOIRS DES MEMBRES', 'Chapitre 1er : Droits et Obligations des membres', 14);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (64, 2, 15, 'Article 15', 'Sanction de 1er degré', 'L''inobservation des devoirs déterminés à l''article 14 du présent règlement intérieur donne lieu aux sanctions ci-après :
- Avertissement
- Blâme
- Exclusion

L''avertissement et le blâme sont prononcés par le Bureau Exécutif ou le Bureau de section.', 'TITRE III : DROITS ET DEVOIRS DES MEMBRES', 'Chapitre 2 : Sanctions', 15);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (65, 2, 16, 'Article 16', 'Sanction de 2ème degré', 'L''exclusion est du ressort soit du Bureau Exécutif soit de l''Assemblée Générale (voir Article 6 ci-dessus).', 'TITRE III : DROITS ET DEVOIRS DES MEMBRES', 'Chapitre 2 : Sanctions', 16);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (66, 2, 17, 'Article 17', 'Les ressources du BUREAU EXÉCUTIF', 'Les ressources du Bureau Exécutif proviennent :
- De la moitié du droit d''adhésion de chaque membre fixé globalement à 10 000 FCFA (5 000 F CFA pour la Section et 5 000 F CFA pour le Bureau Exécutif) ;
- Des cotisations annuelles des membres du Bureau Exécutif qui sont fixées à la moitié de leurs cotisations dans leurs sections d''origine ; le rythme du reversement au Bureau Exécutif est la fin de chaque trimestre et cette cotisation annuelle est fixée à 120 000 F CFA/AN soit 10 000 F CFA/MOIS ;
- Des cotisations exceptionnelles décidées au sein du Bureau Exécutif ;
- Des dons et legs provenant de personnes physiques et/ou morales.', 'TITRE IV : RESSOURCES FINANCIÈRES ET BUDGÉTAIRES', NULL, 17);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (67, 2, 18, 'Article 18', 'Année budgétaire', 'L''année budgétaire de l''Association commence le 1er Janvier et se termine le 31 Décembre de l''année civile en cours.', 'TITRE IV : RESSOURCES FINANCIÈRES ET BUDGÉTAIRES', NULL, 18);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (68, 2, 19, 'Article 19', 'Dépôt des fonds', 'BUREAU EXÉCUTIF : Les fonds de l''Association sont déposés (au nom de L''A.M.A.C) par le trésorier général dans un compte en banque ou tout organisme d''épargne agréé par l''État ivoirien.
AMAC-SECTION : Chaque section doit ouvrir un compte bancaire au nom de L''A.M.A.C-SECTION DE XX dans lequel sont déposés tous les fonds de la section.', 'TITRE IV : RESSOURCES FINANCIÈRES ET BUDGÉTAIRES', NULL, 19);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (69, 2, 20, 'Article 20', 'Composition', 'L''Assemblée Générale se compose de tous les membres actifs. Les membres fondateurs, les membres d''honneur et les past présidents participent aux sessions de l''Assemblée Générale et y sont entendus.
Les membres fondateurs, les membres d''honneur et les past présidents ne disposent pas du droit de vote et d''éligibilité.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 1er : L''Assemblée Générale', 20);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (70, 2, 21, 'Article 21', 'Attributions', 'L''Assemblée Générale est l''organe suprême de l''Association. Ses principales attributions consistent à :
- Déterminer la politique générale de l''Association ;
- Contrôler la politique financière, examiner et approuver le budget et le règlement financier de l''Association entendu que le président de section s''accorde avec le président du Bureau Exécutif ;
- Fixer les taux des droits d''adhésion et de cotisation ;
- Créer tout organe subsidiaire nécessaire au bon fonctionnement de l''Association ;
- Élire le Président et le Commissaire aux Comptes ;
- Amender les statuts et le règlement intérieur pour les adapter aux réalités du moment ;
- Nommer éventuellement les liquidateurs de l''Association ;
- Délocaliser le siège social de l''Association ;
- Prendre toutes les mesures appropriées à la réalisation des objectifs de l''Association.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 1er : L''Assemblée Générale', 21);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (71, 2, 22, 'Article 22', 'Réunions', 'L''Assemblée Générale se réunit en session ordinaire une fois par an sur convocation du Bureau Exécutif.
L''Assemblée Générale Élective se réunit dans un délai de trois mois tout au plus à la fin du mandat du Président. La convocation pour l''assemblée générale élective est adressée aux sections avec l''ordre du jour et doit leur être indiquée deux mois avant la date prévue.
L''Assemblée Générale peut se réunir en session extraordinaire sur convocation du Comité de Contrôle.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 1er : L''Assemblée Générale', 22);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (72, 2, 23, 'Article 23', 'Quorum', 'La présence des 2/3 des membres à jour de leur cotisation à l''Assemblée Générale est obligatoire pour la validité des délibérations.
Si ce quorum n''est pas atteint lors de la première convocation, l''Assemblée Générale sera convoquée à 1 mois d''intervalle.
Lors de la deuxième réunion, elle peut valablement délibérer quel que soit le nombre de membres présents.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 1er : L''Assemblée Générale', 23);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (73, 2, 24, 'Article 24', 'Vote', 'Chaque membre à jour de ses cotisations dispose d''une voie à l''Assemblée Générale.
Le vote par procuration ou par correspondance est autorisé uniquement pour les membres fondateurs empêchés.
Le vote a lieu au scrutin secret. Toutes les décisions de l''Assemblée Générale sont prises à la majorité simple des membres présents et votants.
L''abstention n''est pas considérée comme un vote.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 1er : L''Assemblée Générale', 24);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (74, 2, 25, 'Article 25', 'Composition du Comité de Contrôle', 'Il est composé d''au plus cinq (5) membres fondateurs ;
Si le nombre de membres fondateurs existant est inférieur à cinq (5), ceux-ci coopteront l''effectif complémentaire.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 2 : Le Comité de Contrôle', 25);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (75, 2, 26, 'Article 26', 'Mission du Comité de Contrôle', '- Il est chargé de l''élection du Président du Bureau Exécutif et du Commissaire aux comptes en Assemblée Générale ;
- Il veille à l''exécution du plan d''activités du Bureau Exécutif et du Commissariat aux comptes ;
- Il peut être saisi par le Président du Bureau Exécutif ou par le Président de section en cas de besoin.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 2 : Le Comité de Contrôle', 26);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (76, 2, 27, 'Article 27', 'Mode de fonctionnement du Comité de Contrôle', 'Le Comité de Contrôle se réunit au moins deux (2) fois dans l''année à l''initiative de son président ou à la demande d''au moins trois (3) de ses membres.
Il est dirigé par un président élu par ses pairs et assisté d''un rapporteur.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 2 : Le Comité de Contrôle', 27);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (77, 2, 28, 'Article 28', 'Composition', 'Le Bureau Exécutif comprend au plus dix (10) membres, tous issus de sections.
La fonction de membre du Bureau de section est incompatible avec celle du membre du Bureau Exécutif. Tout membre de bureau de section promu à un poste au Bureau Exécutif doit au préalable rendre sa démission au bureau de section.
Le Bureau Exécutif doit être constitué au moins de :
- Un Président
- Un Vice-Président
- Un Secrétaire Général
- Un Trésorier Général
- Un Délégué aux relations publiques
- Un Délégué des Affaires Culturelles et de l''organisation
- Un conseiller', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 3 : Le Bureau Exécutif', 28);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (78, 2, 29, 'Article 29', 'CONDITIONS D''ÉLIGIBILITÉ DU PRÉSIDENT DU BUREAU EXÉCUTIF ET DU COMMISSAIRE AUX COMPTES', '- Être âgé d''au moins trente cinq (35) ans révolus au jour du vote ;
- Jouir de tous ses droits civiques ;
- Être à jour de ses cotisations statutaires au jour du vote ;
- N''avoir encouru aucune sanction disciplinaire de l''Association ;
- Être disponible.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 3 : Le Bureau Exécutif', 29);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (79, 2, 30, 'Article 30', 'Attributions du Bureau Exécutif', 'Les attributions des membres du Bureau Exécutif sont les suivantes :

LE PRÉSIDENT
Le Président est le Chef du Bureau Exécutif dont il nomme tous les autres membres. À ce titre :
- Il est chargé de la mise en application de son Plan d''Activités tel que validé par l''Assemblée Générale.
- Il reçoit le programme d''activités de chaque section, et veille à l''exécution du programme harmonisé.
- Il convoque et préside les A.G et les réunions du Bureau Exécutif. Il veille à l''application des délibérations et des décisions qui y sont prises.
- Il représente l''Association dans tous les actes de la vie civile et il est investi de tous les pouvoirs à cet effet. Ainsi, il a qualité pour ester en justice au nom de l''Association.
- Il est le responsable de l''exécution du budget.

LE VICE-PRÉSIDENT
Il remplace le Président en cas d''empêchement conformément à l''article 26 des statuts.

LE SECRÉTAIRE GÉNÉRAL
Le Secrétaire Général est le responsable administratif de l''Association. À ce titre :
- Il rédige les procès-verbaux des délibérations et des décisions des assemblées générales et des réunions du Bureau Exécutif, il en assure la transcription sur le registre prévu à cet effet.
- Il prépare les réunions du Bureau Exécutif et des assemblées générales.
- Il rédige toutes les correspondances de l''Association et toutes les convocations.
- Il assure la garde des archives de L''A.M.A.C.

LE TRÉSORIER GÉNÉRAL
Le Trésorier Général est le responsable principal de la mobilisation des moyens financiers de l''Association, ainsi il est chargé de :
- Recouvrer toutes les cotisations des membres du Bureau Exécutif.
- Veiller au reversement des quotes-parts des droits d''adhésion, des manifestations officielles et cotisations statutaires.
- Il cosigne les retraits de fonds conjointement avec le président et le secrétaire général (2 signatures sur 3 obligatoires lors de l''opération de retrait mais une seule signature lors des dépôts de fonds sous toutes ses formes).
- Tenir les livres comptables conformément aux règles de procédure en vigueur.

LE DÉLÉGUÉ AUX AFFAIRES CULTURELLES ET À L''ORGANISATION
Il est chargé de l''exécution effective des activités culturelles et récréatives, notamment : Soirée, Gala, Réveillon, Conférence, débat, Sorties récréatives, Concert, etc.

LE DÉLÉGUÉ AUX RELATIONS PUBLIQUES
Il est chargé de la promotion de l''image de L''AMAC. À ce titre il assure les relations avec les médias et les sponsors.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 3 : Le Bureau Exécutif', 30);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (80, 2, 31, 'Article 31', 'MODE OPÉRATOIRE DU SCRUTIN', 'Tout candidat au poste de président ou de commissaire aux comptes doit déposer, 1 mois à l''avance :
- Une demande de candidature motivée écrite et son plan sommaire de campagne au Comité de Contrôle.
- Un cautionnement de (50 000 F CFA pour le candidat à la présidence et 30 000 F CFA pour le candidat au commissariat aux comptes) remboursable si le candidat est élu ou s''il obtient au moins 25% des voix des votants.
- En dessous du suffrage de 25%, le candidat non élu perd son cautionnement sans aucun recours.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 3 : Le Bureau Exécutif', 31);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (81, 2, 32, 'Article 32', 'Le déroulement du scrutin', '- Un bureau de séance de cinq membres actifs au plus est mis en place séance tenante par le comité de contrôle (les membres présents du Comité de Contrôle) à l''Assemblée Générale.
- Le vote se fait au bulletin secret.
- Au premier tour, le candidat qui obtient 51% des suffrages exprimés est élu président ou commissaire aux comptes du Bureau Exécutif.
- En cas de reprise du vote tout candidat à la majorité relative est déclaré vainqueur.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 3 : Le Bureau Exécutif', 32);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (82, 2, 33, 'Article 33', 'La composition du nouveau Bureau Exécutif', 'La composition du nouveau Bureau Exécutif est connue 25 jours après le vote de son président.
Au-delà de cette période de 25 jours le Comité de Contrôle rappellera le Président élu à l''ordre ; au cas où celui-ci ne communique pas son bureau dans les quinze (15) jours suivants soit quarante cinq (45) jours après son élection, le Comité de Contrôle se fera le devoir de mettre en place un nouveau président en assemblée générale extraordinaire à convoquer dans les trente (30) jours qui suivent l''interpellation du président déchu.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 3 : Le Bureau Exécutif', 33);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (83, 2, 34, 'Article 34', 'La prise de fonction du nouveau Bureau Exécutif', 'Le nouveau Bureau Exécutif prend officiellement fonction dans les 30 jours qui suivent le vote de son président.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 3 : Le Bureau Exécutif', 34);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (84, 2, 35, 'Article 35', 'LA SECTION DE L''AMAC', 'Une section est un démembrement de l''Association dans une ville, une commune ou un quartier.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 4 : DE LA SECTION', 35);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (85, 2, 36, 'Article 36', 'LA CRÉATION DE LA SECTION DE L''AMAC', 'Une section peut être créée dans l''aire géographique définie à l''article 14 ci-dessus par au moins 10 personnes, jouissant de leurs droits civiques et qui en font la demande écrite officielle au Bureau Exécutif.
En cas d''avis favorable du Bureau Exécutif, un droit d''affiliation à l''AMAC est acquitté auprès du Bureau Exécutif avant le début de toute activité.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 4 : DE LA SECTION', 36);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (86, 2, 37, 'Article 37', 'Fonctionnement de la Section', 'La section créée est sous la tutelle administrative hiérarchique du Bureau Exécutif ;
- Elle est régie exclusivement par les Statuts et Règlement Intérieur de l''Association. Elle jouit de l''autonomie financière.
- Elle a le devoir de verser, chaque année civile, au Bureau Exécutif pour le financement de son fonctionnement, la somme forfaitaire de 40 000 F CFA (quarante mille).
- Elle a le devoir de reverser au Bureau Exécutif 20% du résultat net positif de chaque manifestation officielle à laquelle les autres sections et le BE ont pris part.
- Elle a le devoir de reverser au Bureau Exécutif la moitié du droit d''adhésion de chacun de ses membres pour la confection de sa carte d''affiliation à la Section.
La Section doit établir au début de chaque année civile un Programme Annuel d''Activités (PAA) communiqué au Bureau Exécutif pour être intégré au programme d''activités annuel de L''AMAC.
La réalisation de toute activité populaire majeure contenue dans le (PAA) de la section doit être soumise à l''approbation du Bureau Exécutif.
Un rapport annuel d''activités sera fait à la fin de chaque année, le Bureau Exécutif doit en être destinataire principal pour exercer son droit de tutelle pour l''intégrer à son rapport annuel d''activités.
Toute activité d''une section qui engage les autres sections ou le Bureau Exécutif, doit être soumise à l''approbation du Bureau Exécutif avant sa mise en œuvre.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 4 : DE LA SECTION', 37);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (87, 2, 38, 'Article 38', 'Élection', 'Le Commissaire aux comptes est élu par l''Assemblée Générale dans les mêmes conditions que le Président du Bureau Exécutif.
Il a la possibilité de s''adjoindre 1 ou 2 commissaires aux comptes suppléants après avis du Comité de Contrôle. Dans ce cas il doit produire une argumentation motivant et surtout nécessitant cette adjonction ;
En aucun cas les absences ou les indisponibilités professionnelles du commissaire aux comptes en chef ne sauraient justifier l''adjonction de suppléants.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 5 : Le Commissaire aux comptes', 38);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (88, 2, 39, 'Article 39', 'Attributions', 'Le commissaire aux comptes est chargé de :
- Contrôler la gestion comptable du Bureau Exécutif ;
- Examiner et donner son avis sur la gestion financière du Bureau Exécutif ;
- Rendre compte à l''Assemblée Générale par un rapport écrit à la fin de l''exercice annuel et du mandat du Bureau Exécutif sortant.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 5 : Le Commissaire aux comptes', 39);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (89, 2, 40, 'Article 40', 'Composition', 'Le Conseil des Anciens présidents comprend toutes les personnes qui ont été au moins une fois président du Bureau Exécutif de L''AMAC.
Ces anciens présidents sont organisés en un bureau dirigé par un président élu par ses pairs.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 6 : Le Conseil des Anciens présidents', 40);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (90, 2, 41, 'Article 41', 'Pouvoirs', 'Le conseil des Anciens Présidents a un rôle consultatif et de conseil.
Des missions ponctuelles peuvent lui être confiées par le Président du Bureau Exécutif ou le Comité de Contrôle.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 6 : Le Conseil des Anciens présidents', 41);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (91, 2, 42, 'Article 42', 'Réunion', 'Le Conseil des Anciens Présidents se réunit autant de fois que nécessaire à la demande de son président ou d''office à la demande des 2/3 de ses membres.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 6 : Le Conseil des Anciens présidents', 42);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (92, 2, 43, 'Article 43', 'Composition', 'Le Collectif des membres d''honneur comprend toutes les personnes qui ont rendu des services reconnus par le Bureau Exécutif de L''AMAC.
Ils sont agréés par le Bureau Exécutif.', 'TITRE V : ADMINISTRATION ET FONCTIONNEMENT', 'Chapitre 7 : Le Collectif des Membres d''honneur', 43);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (93, 2, 44, 'Article 44', 'Modifications du Règlement Intérieur et dissolution', 'Les fonctions de chaque membre dans les organes de l''Association ne sont pas rémunérées. Le Bureau Exécutif détermine et est responsable des dépenses de fonctionnement dont il a la charge.

Les modifications des statuts, du Règlement Intérieur et la dissolution de l''Association sont proposées par :
- Les 2/3 des membres du Bureau Exécutif ou de l''Assemblée Générale.
Elles interviennent dans les conditions fixées par l''article 20 des statuts et du règlement intérieur.', 'TITRE V [bis] : DISPOSITIONS RÉGLEMENTAIRES', NULL, 44);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (94, 2, 45, 'Article 45', 'Liquidation', 'En cas de dissolution, l''Assemblée Générale désigne un commissaire chargé de la liquidation de l''Association.
L''Assemblée Générale décide de l''affectation de l''actif net.', 'TITRE V [bis] : DISPOSITIONS RÉGLEMENTAIRES', NULL, 45);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (95, 2, 46, 'Article 46', 'Formalités d''usage', 'Le Président, au nom de l''Association, est chargé d''accomplir les formalités prescrites par la loi 60-315 du 20 septembre 1960 notamment les dispositions des articles 7, 8, 10, 36.', 'TITRE V [bis] : DISPOSITIONS RÉGLEMENTAIRES', NULL, 46);
INSERT INTO articles (id, texte_id, numero, numero_affiche, titre, contenu_actuel, titre_parent, chapitre, ordre) VALUES (96, 2, 47, 'Article 47', 'Adoption du Règlement Intérieur', 'Le présent règlement intérieur adopté en Assemblée Générale de l''AMAC sera communiqué et diffusé à tous les Organes statutaires de l''association qui en feront une large diffusion à tous leurs membres respectifs.', 'TITRE V [bis] : DISPOSITIONS RÉGLEMENTAIRES', NULL, 47);

-- Reset Auto-increments for Articles
SELECT setval('articles_id_seq', 96);

-- Enjeux
INSERT INTO enjeux (id, article_id, type, gravite, description, base_legale, articles_lies) VALUES (1, 13, 'contradiction', 'critique', 'Contradiction vote fondateurs : L''article 13 exclut les membres fondateurs du droit de vote lors des scrutins ordinaires et extraordinaires (voix consultative uniquement), mais l''article 22 autorise le vote par procuration exclusivement pour les fondateurs empêchés.', 'Loi n° 60-315, art. 13 & 22 : Droit d''égalité de vote des adhérents dans les associations.', ARRAY[13,22,69,73]);
INSERT INTO enjeux (id, article_id, type, gravite, description, base_legale, articles_lies) VALUES (2, 23, 'risque_gouvernance', 'critique', 'Comité de Contrôle juge et partie : Le comité est composé principalement de membres fondateurs (qui n''ont pas le droit de vote par ailleurs). Il est chargé de veiller à l''application des statuts, d''organiser les élections et de s''autosaisir, risquant un conflit d''intérêts électoral majeur.', 'Principe général du droit des contrats et des associations : impartialité des organes de contrôle électoraux.', ARRAY[23,74]);
INSERT INTO enjeux (id, article_id, type, gravite, description, base_legale, articles_lies) VALUES (3, 26, 'risque_gouvernance', 'critique', 'Concentration excessive des pouvoirs : Le Président nomme à sa discrétion les 9 autres membres du Bureau Exécutif National (BEN) sans aucune validation de l''Assemblée Générale, et leur mandat est aligné sur le sien.', 'Loi n° 60-315 : Représentativité et reddition des comptes des administrateurs.', ARRAY[26,32,35,73,79]);
INSERT INTO enjeux (id, article_id, type, gravite, description, base_legale, articles_lies) VALUES (4, 37, 'incoherence_numerotation', 'majeur', 'Structure cassée : Doublon de "TITRE III". De plus, le titre "De la Section" (art. 37-39) est malencontreusement inséré au beau milieu du Titre V, cassant la hiérarchie logique. Le RI comporte également deux "TITRE V".', 'Insécurité juridique liée à l''impossibilité de citer proprement le texte officiel.', ARRAY[37,38,39,88]);
INSERT INTO enjeux (id, article_id, type, gravite, description, base_legale, articles_lies) VALUES (5, 14, 'renvoi_errone', 'majeur', 'Renvoi erroné en cascade : L''art. 14 renvoie à "l''art. 6" pour la devise (l''art. 6 traite des moyens d''action de l''association, pas de la devise) ; l''art. 32 renvoie à "l''article 26" des statuts pour l''intérim, alors que l''art. 26 ne définit que la composition nominative.', 'Clarté normative et sécurité des statuts.', ARRAY[14,6,32,26,38,65,79]);
INSERT INTO enjeux (id, article_id, type, gravite, description, base_legale, articles_lies) VALUES (6, 48, 'incoherence_numerotation', 'majeur', 'Incohérence de date de la loi de référence : La loi 60-315 est datée du "21 septembre 1960" aux articles 1 et 5, mais du "20 septembre 1960" à l''article 48.', 'Loi n° 60-315 du 21 septembre 1960 relative aux associations.', ARRAY[1,5,48]);
INSERT INTO enjeux (id, article_id, type, gravite, description, base_legale, articles_lies) VALUES (7, 21, 'lacune', 'majeur', 'Quorum de 2/3 irréaliste en pratique : La règle impose un quorum des 2/3, mais autorise sur seconde convocation à 1 mois à délibérer sans aucun quorum. Cela incite à l''absentéisme stratégique et aux décisions par une minorité lors du second tour.', 'Gouvernance démocratique et représentativité.', ARRAY[21]);
INSERT INTO enjeux (id, article_id, type, gravite, description, base_legale, articles_lies) VALUES (8, 46, 'risque_gouvernance', 'majeur', 'Régime de modification statutaire sans majorité qualifiée : Les articles 46 Statuts / 44 RI renvoient l''adoption des révisions à un article de fonctionnement général qui n''exige qu''une majorité simple. Une modification des textes fondateurs à la majorité simple fragilise l''association.', 'Loi n° 60-315 : Robustesse des modifications statutaires.', ARRAY[44,46,93]);
INSERT INTO enjeux (id, article_id, type, gravite, description, base_legale, articles_lies) VALUES (9, 93, 'contradiction', 'majeur', 'Doublon abusif Statuts / Règlement Intérieur : Le RI recopie presque mot pour mot les statuts au lieu de préciser les règlements d''application internes, ce qui génère des contradictions à chaque mise à jour unilatérale.', 'Hiérarchie des normes : le RI est inférieur et ne doit pas répéter les statuts.', ARRAY[44,46,93]);
INSERT INTO enjeux (id, article_id, type, gravite, description, base_legale, articles_lies) VALUES (10, 29, 'modernisation', 'mineur', 'Formulation mathématique erronée : La clause "51 % des suffrages" est techniquement fausse (la majorité absolue se définit par 50 % + 1 voix des suffrages exprimés).', 'Précision de rédaction législative.', ARRAY[29]);
INSERT INTO enjeux (id, article_id, type, gravite, description, base_legale, articles_lies) VALUES (11, 35, 'renvoi_errone', 'mineur', 'Incohérence sur la Vice-Présidence : L''article 26 prévoit "un Vice-Président", mais l''article 35 fait référence au "1er Vice-Président", créant un flou sur le nombre exact de VP.', 'Consistance et clarté des statuts.', ARRAY[26,35]);
INSERT INTO enjeux (id, article_id, type, gravite, description, base_legale, articles_lies) VALUES (12, 55, 'risque_gouvernance', 'mineur', 'Cautionnement électoral inéquitable : Exigence de 50 000 FCFA pour la Présidence et 30 000 FCFA pour le Comité de Contrôle, somme conservée par l''AMAC si le candidat obtient moins de 25% des voix. C''est une barrière injuste d''accès aux candidatures.', 'Équité et liberté de candidature au sein des associations.', ARRAY[55]);
INSERT INTO enjeux (id, article_id, type, gravite, description, base_legale, articles_lies) VALUES (13, 49, 'lacune', 'critique', 'Lacunes de modernisation de la gouvernance 2.0 : Aucune disposition ne prévoit les AG ou votes à distance, le vote électronique, la parité hommes-femmes, l''implication de la diaspora, les droits de la défense disciplinaire ou les archives numériques.', 'Adaptation aux usages numériques et au droit moderne des associations.', ARRAY[49,96]);

-- Reset Auto-increments for Enjeux
SELECT setval('enjeux_id_seq', 13);

-- Questions
INSERT INTO questions (id, article_id, ordre, intitule, type, options, obligatoire) VALUES (1, 13, 1, 'Quelle règle de gouvernance appliquer concernant le droit de vote des membres fondateurs ?', 'choix_ab', '{"option_a":"Voix consultative uniquement (Option A) : Supprimer la procuration exclusive et restreindre le droit des fondateurs à un rôle de conseil, sans pouvoir de vote lors des scrutins.","option_b":"Droit de vote plein et généralisé (Option B) : Accorder aux fondateurs les mêmes droits de vote que tout membre actif, et autoriser le vote par procuration pour tous les membres."}', true);
INSERT INTO questions (id, article_id, ordre, intitule, type, options, obligatoire) VALUES (2, 23, 1, 'Comment réformer la composition et le rôle du Comité de Contrôle pour éliminer le risque de conflit d''intérêts ?', 'choix_ab', '{"option_a":"Élection démocratique ouverte (Option A) : Les commissaires aux comptes et membres du comité de contrôle sont élus en AG parmi tous les membres actifs éligibles, sans monopole des fondateurs.","option_b":"Comité de sages fondateurs non-organisateur (Option B) : Maintenir la désignation parmi les fondateurs, mais confier l''organisation logistique des élections à une commission électorale indépendante."}', true);
INSERT INTO questions (id, article_id, ordre, intitule, type, options, obligatoire) VALUES (3, 26, 1, 'Quel mécanisme de contrôle instaurer pour la nomination des membres du Bureau Exécutif National (BEN) ?', 'choix_ab', '{"option_a":"Validation par l''Assemblée Générale (Option A) : Le Président nomme ses membres mais doit soumettre la liste nominative du BEN à l''approbation de l''AG lors de son élection.","option_b":"Pouvoir discrétionnaire du Président (Option B) : Conserver la nomination libre et directe par le Président, mais accorder à l''AG un droit de censure à la majorité qualifiée en cas de manquement."}', true);
INSERT INTO questions (id, article_id, ordre, intitule, type, options, obligatoire) VALUES (4, 37, 1, 'Souhaitez-vous restructurer et uniformiser le statut des sections locales de l''AMAC ?', 'choix_ab', '{"option_a":"Titre de Section autonome (Option A) : Créer un Titre de Section distinct à la fin de l''organisation pour clarifier les rôles et renumérotations.","option_b":"Intégration au fonctionnement général (Option B) : Insérer les règles des sections sous le même chapitre d''administration pour simplifier la structure."}', true);
INSERT INTO questions (id, article_id, ordre, intitule, type, options, obligatoire) VALUES (5, 14, 1, 'Comment corriger les renvois erronés dans les textes (ex: devise à l''article 6, intérim du VP à l''article 26) ?', 'choix_ab', '{"option_a":"Rénovation textuelle explicite (Option A) : Remplacer tous les renvois de numéros par des explications textuelles complètes dans chaque article concerné.","option_b":"Correction automatique et renumérotation (Option B) : Valider la correction logique des renvois via une table de concordance dynamique après adoption de la révision."}', true);
INSERT INTO questions (id, article_id, ordre, intitule, type, options, obligatoire) VALUES (6, 48, 1, 'Quelle date unique de la loi 60-315 doit être retenue dans tous les articles ?', 'choix_ab', '{"option_a":"21 septembre 1960 uniquement (Option A) : Corriger uniformément à la date légale exacte du 21 septembre 1960.","option_b":"Loi n° 60-315 relative aux associations (Option B) : Supprimer la mention des dates dans le corps des articles et ne conserver que le numéro de la loi."}', true);
INSERT INTO questions (id, article_id, ordre, intitule, type, options, obligatoire) VALUES (7, 21, 1, 'Quel quorum réaliste fixer pour la tenue de l''Assemblée Générale de l''AMAC ?', 'choix_ab', '{"option_a":"Quorum à la majorité simple (Option A) : Fixer le quorum à 50% + 1 membre à la première convocation, et 25% à la seconde convocation dans un délai de 15 jours.","option_b":"Quorum à distance (Option B) : Maintenir le quorum des 2/3 mais autoriser expressément la participation et le vote par visioconférence ou voie électronique."}', true);
INSERT INTO questions (id, article_id, ordre, intitule, type, options, obligatoire) VALUES (8, 46, 1, 'Quelle majorité doit être exigée pour toute modification future des statuts de l''AMAC ?', 'choix_ab', '{"option_a":"Majorité qualifiée des 2/3 (Option A) : Exiger le vote positif des deux tiers des membres présents ou représentés en AG.","option_b":"Majorité absolue (Option B) : Exiger le vote positif de la moitié plus un de l''ensemble des adhérents de l''association."}', true);
INSERT INTO questions (id, article_id, ordre, intitule, type, options, obligatoire) VALUES (9, 93, 1, 'Comment structurer le Règlement Intérieur par rapport aux Statuts ?', 'choix_ab', '{"option_a":"RI Opérationnel (Option A) : Supprimer tous les articles recopiés des statuts dans le RI et y inscrire uniquement les procédures pratiques de gestion.","option_b":"Double validation (Option B) : Conserver les textes identiques dans les deux documents avec une clause explicite de primauté des statuts."}', true);
INSERT INTO questions (id, article_id, ordre, intitule, type, options, obligatoire) VALUES (10, 29, 1, 'Comment reformuler la majorité requise de 51% des voix ?', 'choix_ab', '{"option_a":"Majorité absolue (Option A) : Modifier par la formule légale \"majorité absolue des suffrages exprimés\".","option_b":"Majorité des membres présents (Option B) : Remplacer par \"la moitié plus une des voix des membres présents ou représentés\"."}', true);
INSERT INTO questions (id, article_id, ordre, intitule, type, options, obligatoire) VALUES (11, 35, 1, 'Quel nombre de Vice-Présidents l''AMAC doit-elle instituer ?', 'choix_ab', '{"option_a":"Un VP unique (Option A) : Un unique Vice-Président désigné pour seconder et remplacer temporairement le Président.","option_b":"Deux VP (Option B) : Établir un 1er VP (Administration/Organisation) et un 2ème VP (Affaires Culturelles et Artistiques)."}', true);
INSERT INTO questions (id, article_id, ordre, intitule, type, options, obligatoire) VALUES (12, 55, 1, 'Faut-il modifier le régime des cautionnements électoraux des candidats ?', 'choix_ab', '{"option_a":"Suppression totale (Option A) : Remplacer le cautionnement financier par une obligation de parrainage écrit par au moins 10 membres issus de sections différentes.","option_b":"Réduction de cautionnement (Option B) : Ramener la caution à 20 000 FCFA remboursée à partir de 10% des suffrages recueillis."}', true);
INSERT INTO questions (id, article_id, ordre, intitule, type, options, obligatoire) VALUES (13, 49, 1, 'Quelles fonctionnalités modernes intégrer dans la révision finale des statuts ?', 'choix_ab', '{"option_a":"Gouvernance numérique globale (Option A) : Inscrire dans les statuts la légitimité du vote électronique, des AG en ligne, et la création de sections virtuelles pour la diaspora.","option_b":"Due Process disciplinaire (Option B) : Inscrire un droit à la défense avec convocation écrite, délai de 15 jours pour préparer sa défense et commission d''appel indépendante."}', true);

-- Reset Auto-increments for Questions
SELECT setval('questions_id_seq', 13);
