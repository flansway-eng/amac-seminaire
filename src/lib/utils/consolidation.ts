import { Article, Proposition, Decision } from '@/lib/types';

interface ConsolidatedArticle {
  id: number;
  oldNumero: number;
  newNumero: number;
  numeroAffiche: string;
  titre: string | null;
  contenuConsolide: string;
  titreParent: string | null;
  chapitre: string | null;
  isAmended: boolean;
}

/**
 * Consolidates a list of articles by replacing contents with adopted propositions and renumbering them.
 */
export function consolidateArticles(
  articles: Article[],
  propositions: Proposition[],
  decisions: Decision[]
): {
  consolidated: ConsolidatedArticle[];
  numberMap: Record<number, number>; // maps oldNumero -> newNumero
} {
  // 1. Sort articles by their initial order to preserve structural layout
  const sortedArticles = [...articles].sort((a, b) => a.ordre - b.ordre);

  // 2. Map of old numbers to help cross-reference updating
  const numberMap: Record<number, number> = {};
  
  // 3. First pass: Apply adopted text amendments and build renumbering map
  let currentNum = 1;
  const initialPass = sortedArticles.map((art) => {
    // Find if there is an adopted decision for this article
    const decision = decisions.find(
      (d) => d.article_id === art.id && d.decision === 'adopte'
    );
    
    // Find the corresponding adopted proposition text
    const adoptedProp = decision 
      ? propositions.find((p) => p.id === decision.proposition_id)
      : null;

    const isAmended = !!adoptedProp;
    const contenuConsolide = adoptedProp ? adoptedProp.texte_propose : art.contenu_actuel;

    // Renumbering logic: map old to new sequential number
    const oldNumero = art.numero;
    const newNumero = currentNum;
    numberMap[oldNumero] = newNumero;

    currentNum++;

    return {
      id: art.id,
      oldNumero,
      newNumero,
      numeroAffiche: `Article ${newNumero}`,
      titre: art.titre,
      contenuConsolide,
      titreParent: art.titre_parent,
      chapitre: art.chapitre,
      isAmended,
    };
  });

  // 4. Second pass: Automatically update cross-references in the text!
  // e.g. "article 14" -> "article 12"
  const finalConsolidated = initialPass.map((art) => {
    let text = art.contenuConsolide;

    // Scan and replace occurrences of "article [X]" or "art. [X]"
    // using regex matching
    const regex = /(article|art\.)\s+(\d+)/gi;
    text = text.replace(regex, (match, prefix, numStr) => {
      const oldNum = parseInt(numStr, 10);
      const newNum = numberMap[oldNum];
      if (newNum !== undefined && newNum !== oldNum) {
        return `${prefix} ${newNum}`;
      }
      return match;
    });

    return {
      ...art,
      contenuConsolide: text,
    };
  });

  return {
    consolidated: finalConsolidated,
    numberMap,
  };
}
