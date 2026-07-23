import { describe, it, expect } from 'vitest';
import { calculerQuorum, calculerMajorite, calculerResultatAdoption } from '../../src/lib/utils/majorite';

describe('calculerQuorum', () => {
  it("atteint le quorum des 2/3 avec 40 présents sur 60", () => {
    expect(calculerQuorum(40, 60, 2 / 3)).toBe(true);
  });

  it("n'atteint pas le quorum des 2/3 avec 30 présents sur 60", () => {
    expect(calculerQuorum(30, 60, 2 / 3)).toBe(false);
  });

  it('refuse un effectif total nul ou négatif', () => {
    expect(calculerQuorum(10, 0, 0.5)).toBe(false);
  });
});

describe('calculerMajorite', () => {
  it("la majorité absolue exige 50% + 1 des suffrages exprimés, pas 51%", () => {
    // 50 pour, 50 contre : ni 51% ni l'absolue ne sont atteints
    expect(calculerMajorite({ votesPour: 50, votesContre: 50, abstentions: 0 }, 'absolue')).toBe(false);
    // 51 pour, 49 contre : 50%+1 est atteint
    expect(calculerMajorite({ votesPour: 51, votesContre: 49, abstentions: 0 }, 'absolue')).toBe(true);
  });

  it('la majorité qualifiée des 2/3 se calcule sur les suffrages exprimés, pas sur l’effectif total', () => {
    expect(calculerMajorite({ votesPour: 40, votesContre: 20, abstentions: 15 }, 'qualifiee_2_3')).toBe(true);
    expect(calculerMajorite({ votesPour: 39, votesContre: 21, abstentions: 0 }, 'qualifiee_2_3')).toBe(false);
  });

  it('la majorité simple ne compte que les votes exprimés, les abstentions ne comptent pas', () => {
    expect(calculerMajorite({ votesPour: 10, votesContre: 9, abstentions: 100 }, 'simple')).toBe(true);
  });

  it('aucun suffrage exprimé ne peut jamais être une majorité', () => {
    expect(calculerMajorite({ votesPour: 0, votesContre: 0, abstentions: 50 }, 'simple')).toBe(false);
  });
});

describe('calculerResultatAdoption', () => {
  it('un quorum non atteint reporte la décision, même si la majorité serait acquise', () => {
    const resultat = calculerResultatAdoption(
      { votesPour: 100, votesContre: 0, abstentions: 0 },
      false,
      'simple'
    );
    expect(resultat).toBe('reporte');
  });

  it('quorum atteint + majorité acquise => adopté', () => {
    const resultat = calculerResultatAdoption(
      { votesPour: 40, votesContre: 20, abstentions: 0 },
      true,
      'absolue'
    );
    expect(resultat).toBe('adopte');
  });

  it('quorum atteint mais majorité non acquise => rejeté', () => {
    const resultat = calculerResultatAdoption(
      { votesPour: 20, votesContre: 40, abstentions: 0 },
      true,
      'absolue'
    );
    expect(resultat).toBe('rejete');
  });
});
