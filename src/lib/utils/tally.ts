// Double décompte des suffrages (art. 39 des statuts : la participation est
// conditionnée au versement de la cotisation, mais cette condition ne
// bloque personne à l'entrée — elle est appliquée ici, au dépouillement).

export interface ReponseVote {
  valeur: { reponse?: string } | null;
  section_id: number | null;
}

export interface SectionCotisation {
  id: number;
  a_jour_cotisation: boolean;
}

export interface Tally {
  A: number;
  B: number;
  abstention: number;
  total: number;
}

function compterReponses(liste: ReponseVote[]): Tally {
  let A = 0;
  let B = 0;
  let abstention = 0;
  liste.forEach((r) => {
    const rep = r.valeur?.reponse;
    if (rep === 'A') A++;
    else if (rep === 'B') B++;
    else if (rep === 'abstention') abstention++;
  });
  return { A, B, abstention, total: A + B + abstention };
}

export interface DoubleDecompte {
  sectionsAJour: Tally;
  total: Tally;
}

// Une réponse sans section (participant BEN/observateur) n'est jamais
// comptée dans le total "sections à jour" qui fait foi juridiquement,
// mais reste comprise dans le total indicatif tous suffrages confondus.
export function calculerDoubleDecompte(
  reponses: ReponseVote[],
  sections: SectionCotisation[]
): DoubleDecompte {
  const cotisationParSection = new Map(sections.map((s) => [s.id, s.a_jour_cotisation]));

  const reponsesSectionsAJour = reponses.filter(
    (r) => r.section_id != null && cotisationParSection.get(r.section_id) === true
  );

  return {
    sectionsAJour: compterReponses(reponsesSectionsAJour),
    total: compterReponses(reponses),
  };
}
