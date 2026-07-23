import { describe, it, expect } from 'vitest';
import { consolidateArticles } from '../../src/lib/utils/consolidation';
import { Article, Proposition, Decision } from '../../src/lib/types';

describe('Consolidation & Renumbering Engine', () => {
  it('should apply adopted propositions and renumber articles sequentially', () => {
    // Mock 3 articles with initial numbering 1, 5, 48 (simulating gaps and anomalies)
    const articles: Article[] = [
      {
        id: 1,
        texte_id: 1,
        numero: 1,
        numero_affiche: 'Article 1',
        titre: 'Constitution',
        contenu_actuel: "L'association est régie par la loi du 20/09/1960.",
        titre_parent: 'Titre I',
        chapitre: null,
        ordre: 1,
      },
      {
        id: 2,
        texte_id: 1,
        numero: 5,
        numero_affiche: 'Article 5',
        titre: 'Durée',
        contenu_actuel: "La durée est illimitée.",
        titre_parent: 'Titre I',
        chapitre: null,
        ordre: 2,
      },
      {
        id: 3,
        texte_id: 1,
        numero: 48,
        numero_affiche: 'Article 48',
        titre: 'Loi applicable',
        contenu_actuel: "Voir l'article 5 pour la durée et l'article 1 pour la constitution.",
        titre_parent: 'Titre VII',
        chapitre: null,
        ordre: 3,
      },
    ];

    // Mock an adopted proposition for Article 1 (updating date to 21/09/1960)
    const propositions: Proposition[] = [
      {
        id: 'prop-1',
        article_id: 1,
        auteur_id: 'user-1',
        texte_propose: "L'association est régie par la loi du 21/09/1960.",
        expose_motifs: "Date de loi exacte.",
        statut: 'adoptee',
        version: 'V1.0',
        created_at: new Date().toISOString(),
      },
    ];

    // Mock the decision adopting that proposition
    const decisions: Decision[] = [
      {
        id: 'dec-1',
        article_id: 1,
        proposition_id: 'prop-1',
        decision: 'adopte',
        quorum_atteint: true,
        votes_pour: 40,
        votes_contre: 0,
        abstentions: 0,
        seance: 'Plénière',
        decided_at: new Date().toISOString(),
      },
    ];

    const { consolidated, numberMap } = consolidateArticles(articles, propositions, decisions);

    // Assertions
    expect(consolidated).toHaveLength(3);
    
    // Check renumbering
    expect(consolidated[0].newNumero).toBe(1);
    expect(consolidated[1].newNumero).toBe(2); // ex-Article 5 is now Article 2
    expect(consolidated[2].newNumero).toBe(3); // ex-Article 48 is now Article 3

    // Check mapping
    expect(numberMap[1]).toBe(1);
    expect(numberMap[5]).toBe(2);
    expect(numberMap[48]).toBe(3);

    // Check content update for Article 1 (amended)
    expect(consolidated[0].contenuConsolide).toBe("L'association est régie par la loi du 21/09/1960.");
    expect(consolidated[0].isAmended).toBe(true);

    // Check content for Article 2 (not amended, just renumbered)
    expect(consolidated[1].contenuConsolide).toBe("La durée est illimitée.");
    expect(consolidated[1].isAmended).toBe(false);

    // Check cross-reference auto-updating in Article 3 (ex-Article 48)
    // original: "Voir l'article 5 pour la durée et l'article 1 pour la constitution."
    // 5 -> 2, 1 -> 1
    // expected: "Voir l'article 2 pour la durée et l'article 1 pour la constitution."
    expect(consolidated[2].contenuConsolide).toBe(
      "Voir l'article 2 pour la durée et l'article 1 pour la constitution."
    );
  });
});
