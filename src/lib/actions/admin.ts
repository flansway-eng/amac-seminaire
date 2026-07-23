'use server';

import { createClient } from '@/lib/supabase/server';
import { Article, Proposition, Decision, PropositionStatut, DecisionVote } from '@/lib/types';
import { consolidateArticles } from '@/lib/utils/consolidation';
import { calculerResultatAdoption, TypeMajorite } from '@/lib/utils/majorite';
import { revalidatePath } from 'next/cache';

export interface SectionStat {
  id: number;
  nom: string;
  ville: string;
  memberCount: number;
  completionRate: number;
  qualityScore: number;
  motivatedCount: number;
  totalResponses: number;
}

export interface DashboardSummary {
  totalArticles: number;
  totalAnswered: number;
  pendingPropositionsCount: number;
  decidedArticlesCount: number;
  articlesEnSouffranceCount: number; // Articles with enjeux and no propositions
}

export async function getScoreboardData(): Promise<SectionStat[]> {
  try {
    const supabase = await createClient();

    const { data: sections, error: secError } = await supabase
      .from('sections')
      .select('*')
      .eq('actif', true);

    if (secError || !sections) {
      console.warn('Error fetching sections for scoreboard:', secError);
      return [];
    }

    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('id, section_id');

    if (profError || !profiles) {
      console.warn('Error fetching profiles for scoreboard:', profError);
      return [];
    }

    const { count: questionsCount } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });

    const totalQuestions = questionsCount || 13;

    const { data: responses, error: respError } = await supabase
      .from('reponses')
      .select('id, section_id, commentaire');

    if (respError || !responses) {
      console.warn('Error fetching responses for scoreboard:', respError);
      return [];
    }

  const stats: SectionStat[] = sections.map((sec) => {
    const secMembers = profiles.filter((p) => p.section_id === sec.id);
    const memberCount = secMembers.length;

    const expectedResponses = memberCount * totalQuestions;
    const secResponses = responses.filter((r) => r.section_id === sec.id);
    const totalResponses = secResponses.length;

    const completionRate = expectedResponses > 0 
      ? Math.round((totalResponses / expectedResponses) * 100) 
      : 0;

    const motivatedResponses = secResponses.filter(
      (r) => r.commentaire && r.commentaire.trim().length > 5
    );
    const motivatedCount = motivatedResponses.length;

    const qualityScore = totalResponses > 0 
      ? Math.round((motivatedCount / totalResponses) * 100) 
      : 0;

    return {
      id: sec.id,
      nom: sec.nom,
      ville: sec.ville,
      memberCount,
      completionRate: Math.min(completionRate, 100),
      qualityScore,
      motivatedCount,
      totalResponses,
    };
  });

    return stats.sort((a, b) => {
      if (b.completionRate !== a.completionRate) {
        return b.completionRate - a.completionRate;
      }
      return b.qualityScore - a.qualityScore;
    });
  } catch (err) {
    console.warn('Failed to fetch scoreboard data, database offline:', err);
    return [];
  }
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createClient();

  // Total articles
  const { count: totalArticles } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });

  // Answered questions
  const { data: responses } = await supabase
    .from('reponses')
    .select('question_id');
  const uniqueQuestionsAnswered = new Set((responses || []).map(r => r.question_id)).size;

  // Pending propositions
  const { count: pendingPropositions } = await supabase
    .from('propositions')
    .select('*', { count: 'exact', head: true })
    .eq('statut', 'soumise');

  // Decided articles
  const { count: decidedArticles } = await supabase
    .from('decisions')
    .select('*', { count: 'exact', head: true });

  // Articles en souffrance (has enjeux and no propositions)
  const { data: articlesWithEnjeux } = await supabase
    .from('enjeux')
    .select('article_id');
  
  const articleIdsWithEnjeux = Array.from(new Set((articlesWithEnjeux || []).map(e => e.article_id)));
  
  const { data: propositions } = await supabase
    .from('propositions')
    .select('article_id');

  const articleIdsWithPropositions = new Set((propositions || []).map(p => p.article_id));
  const articlesEnSouffrance = articleIdsWithEnjeux.filter(id => !articleIdsWithPropositions.has(id)).length;

  return {
    totalArticles: totalArticles || 96,
    totalAnswered: uniqueQuestionsAnswered,
    pendingPropositionsCount: pendingPropositions || 0,
    decidedArticlesCount: decidedArticles || 0,
    articlesEnSouffranceCount: articlesEnSouffrance || 0,
  };
}

export async function preArbitrateProposition(propId: string, statut: PropositionStatut) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('propositions')
    .update({ statut })
    .eq('id', propId);

  if (error) {
    console.error('Error pre-arbitrating:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/concordance');
  return { success: true };
}

export async function adoptPropositionDirectly(
  articleId: number,
  propId: string,
  votesPour: number,
  votesContre: number,
  abstentions: number,
  quorumAtteint: boolean,
  typeMajorite: TypeMajorite = 'absolue'
) {
  const supabase = await createClient();

  const decision = calculerResultatAdoption(
    { votesPour, votesContre, abstentions },
    quorumAtteint,
    typeMajorite
  );

  // Update proposition status according to the real outcome of the vote
  if (decision !== 'reporte') {
    const { error: propErr } = await supabase
      .from('propositions')
      .update({ statut: (decision === 'adopte' ? 'adoptee' : 'rejetee') as PropositionStatut })
      .eq('id', propId);

    if (propErr) {
      return { success: false, error: propErr.message };
    }
  }

  // Create decision record with the real computed outcome
  const { error: decErr } = await supabase
    .from('decisions')
    .insert({
      article_id: articleId,
      proposition_id: propId,
      decision: decision as DecisionVote,
      votes_pour: votesPour,
      votes_contre: votesContre,
      abstentions: abstentions,
      seance: 'Arbitrage BEN Direct',
      quorum_atteint: quorumAtteint,
    });

  if (decErr) {
    return { success: false, error: decErr.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/concordance');
  revalidatePath('/textes');
  return { success: true, decision };
}

export async function getConsolidatedCorpus(texteCode: 'STATUTS' | 'RI') {
  const supabase = await createClient();

  // Get texte ID
  const { data: texte } = await supabase
    .from('textes')
    .select('id')
    .eq('code', texteCode)
    .single();

  if (!texte) return [];

  // Fetch articles
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('texte_id', texte.id)
    .order('ordre', { ascending: true });

  // Fetch all propositions
  const { data: propositions } = await supabase
    .from('propositions')
    .select('*');

  // Fetch all decisions
  const { data: decisions } = await supabase
    .from('decisions')
    .select('*');

  if (!articles) return [];

  const { consolidated } = consolidateArticles(
    articles as unknown as Article[],
    (propositions || []) as unknown as Proposition[],
    (decisions || []) as unknown as Decision[]
  );

  return consolidated;
}

