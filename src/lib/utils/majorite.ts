// Calculs de quorum et de majorité pour l'adoption des rédactions amendées.
//
// Corrige deux lacunes documentées (enjeux #7 et #8/#10) :
// - le texte actuel autorise une seconde convocation à délibérer sans
//   aucun quorum minimal, ce que `calculerQuorum` ne permet plus de faire
//   sans expliciter un seuil de repli ;
// - "51 % des suffrages exprimés" (art. 29) n'est pas la majorité absolue :
//   `calculerMajorite('absolue', ...)` applique la règle exacte 50 % + 1.

export type TypeMajorite = 'simple' | 'absolue' | 'qualifiee_2_3';

export interface ResultatVote {
  votesPour: number;
  votesContre: number;
  abstentions: number;
}

/**
 * @param presents Nombre de participants présents ou représentés.
 * @param effectifTotal Effectif total convoqué.
 * @param seuil Fraction requise (ex. 2/3 = 0.6666...).
 */
export function calculerQuorum(presents: number, effectifTotal: number, seuil: number): boolean {
  if (effectifTotal <= 0 || presents < 0 || seuil <= 0) return false;
  return presents / effectifTotal >= seuil;
}

export function calculerMajorite(resultat: ResultatVote, type: TypeMajorite): boolean {
  const suffragesExprimes = resultat.votesPour + resultat.votesContre;
  if (suffragesExprimes <= 0) return false;

  switch (type) {
    case 'simple':
      return resultat.votesPour > resultat.votesContre;
    case 'absolue':
      return resultat.votesPour > suffragesExprimes / 2;
    case 'qualifiee_2_3':
      return resultat.votesPour >= (2 / 3) * suffragesExprimes;
    default:
      return false;
  }
}

export function calculerResultatAdoption(
  resultat: ResultatVote,
  quorumAtteint: boolean,
  type: TypeMajorite
): 'adopte' | 'rejete' | 'reporte' {
  if (!quorumAtteint) return 'reporte';
  return calculerMajorite(resultat, type) ? 'adopte' : 'rejete';
}
