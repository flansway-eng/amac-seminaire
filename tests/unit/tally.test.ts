import { describe, it, expect } from 'vitest';
import { calculerDoubleDecompte } from '../../src/lib/utils/tally';

describe('Double décompte des suffrages (sections à jour vs total)', () => {
  const sections = [
    { id: 1, a_jour_cotisation: true },
    { id: 2, a_jour_cotisation: true },
    { id: 3, a_jour_cotisation: false }, // section non à jour de cotisation
  ];

  it('exclut les sections non à jour du décompte qui fait foi, mais les compte dans le total indicatif', () => {
    const reponses = [
      { valeur: { reponse: 'A' }, section_id: 1 },
      { valeur: { reponse: 'A' }, section_id: 2 },
      { valeur: { reponse: 'B' }, section_id: 3 }, // section 3 : non à jour
      { valeur: { reponse: 'abstention' }, section_id: 1 },
    ];

    const { sectionsAJour, total } = calculerDoubleDecompte(reponses, sections);

    // Sections à jour uniquement : 2 voix A, 0 B, 1 abstention (section 3 exclue)
    expect(sectionsAJour).toEqual({ A: 2, B: 0, abstention: 1, total: 3 });

    // Total indicatif : toutes les réponses, y compris section 3
    expect(total).toEqual({ A: 2, B: 1, abstention: 1, total: 4 });
  });

  it('une réponse sans section (BEN/observateur) est exclue du décompte qui fait foi', () => {
    const reponses = [
      { valeur: { reponse: 'A' }, section_id: 1 },
      { valeur: { reponse: 'B' }, section_id: null }, // participant BEN sans section
    ];

    const { sectionsAJour, total } = calculerDoubleDecompte(reponses, sections);

    expect(sectionsAJour).toEqual({ A: 1, B: 0, abstention: 0, total: 1 });
    expect(total).toEqual({ A: 1, B: 1, abstention: 0, total: 2 });
  });

  it('un décompte sans aucune réponse renvoie des totaux à zéro', () => {
    const { sectionsAJour, total } = calculerDoubleDecompte([], sections);
    expect(sectionsAJour).toEqual({ A: 0, B: 0, abstention: 0, total: 0 });
    expect(total).toEqual({ A: 0, B: 0, abstention: 0, total: 0 });
  });
});
