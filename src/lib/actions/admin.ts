'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { lireParticipant } from '@/lib/session';
import { Article, Proposition, Decision, PropositionStatut, DecisionVote } from '@/lib/types';
import { consolidateArticles } from '@/lib/utils/consolidation';
import { calculerResultatAdoption, TypeMajorite } from '@/lib/utils/majorite';
import { revalidatePath } from 'next/cache';

const ROLES_PILOTAGE = ['scribe', 'ben', 'admin'];

async function exigerParticipantPilotage() {
  const participant = await lireParticipant();
  if (!participant) {
    return { participant: null, erreur: 'Session introuvable — reconnectez-vous via /rejoindre' };
  }
  if (!ROLES_PILOTAGE.includes(participant.role)) {
    return { participant: null, erreur: 'Réservé au scribe et au BEN' };
  }
  return { participant, erreur: null };
}

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
    const supabase = createAdminClient();

    const { data: sections, error: secError } = await supabase
      .from('sections')
      .select('*')
      .eq('actif', true);

    if (secError || !sections) {
      console.warn('Erreur en récupérant les sections pour le scoreboard :', secError);
      return [];
    }

    const { data: participants, error: partError } = await supabase
      .from('participants')
      .select('id, section_id');

    if (partError || !participants) {
      console.warn('Erreur en récupérant les participants pour le scoreboard :', partError);
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
      console.warn('Erreur en récupérant les réponses pour le scoreboard :', respError);
      return [];
    }

    const stats: SectionStat[] = sections.map((sec) => {
      const secMembers = participants.filter((p) => p.section_id === sec.id);
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
  } catch (err: any) {
    console.warn('Échec de récupération du scoreboard :', err.message || err);
    return [];
  }
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = createAdminClient();

  const { count: totalArticles } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });

  const { data: responses } = await supabase.from('reponses').select('question_id');
  const uniqueQuestionsAnswered = new Set((responses || []).map((r) => r.question_id)).size;

  const { count: pendingPropositions } = await supabase
    .from('propositions')
    .select('*', { count: 'exact', head: true })
    .eq('statut', 'soumise');

  const { count: decidedArticles } = await supabase
    .from('decisions')
    .select('*', { count: 'exact', head: true });

  const { data: articlesWithEnjeux } = await supabase.from('enjeux').select('article_id');

  const articleIdsWithEnjeux = Array.from(new Set((articlesWithEnjeux || []).map((e) => e.article_id)));

  const { data: propositions } = await supabase.from('propositions').select('article_id');

  const articleIdsWithPropositions = new Set((propositions || []).map((p) => p.article_id));
  const articlesEnSouffrance = articleIdsWithEnjeux.filter((id) => !articleIdsWithPropositions.has(id)).length;

  return {
    totalArticles: totalArticles || 96,
    totalAnswered: uniqueQuestionsAnswered,
    pendingPropositionsCount: pendingPropositions || 0,
    decidedArticlesCount: decidedArticles || 0,
    articlesEnSouffranceCount: articlesEnSouffrance || 0,
  };
}

export async function preArbitrateProposition(propId: string, statut: PropositionStatut) {
  const { participant, erreur } = await exigerParticipantPilotage();
  if (!participant) {
    return { success: false, error: erreur };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('propositions').update({ statut }).eq('id', propId);

  if (error) {
    console.error('Erreur de pré-arbitrage :', error);
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
  const { participant, erreur } = await exigerParticipantPilotage();
  if (!participant) {
    return { success: false, error: erreur };
  }

  const supabase = createAdminClient();

  const decision = calculerResultatAdoption(
    { votesPour, votesContre, abstentions },
    quorumAtteint,
    typeMajorite
  );

  if (decision !== 'reporte') {
    const { error: propErr } = await supabase
      .from('propositions')
      .update({ statut: (decision === 'adopte' ? 'adoptee' : 'rejetee') as PropositionStatut })
      .eq('id', propId);

    if (propErr) {
      return { success: false, error: propErr.message };
    }
  }

  const { error: decErr } = await supabase.from('decisions').insert({
    article_id: articleId,
    proposition_id: propId,
    participant_id: participant.id,
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
  const supabase = createAdminClient();

  const { data: texte } = await supabase.from('textes').select('id').eq('code', texteCode).single();

  if (!texte) return [];

  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('texte_id', texte.id)
    .order('ordre', { ascending: true });

  const { data: propositions } = await supabase.from('propositions').select('*');

  const { data: decisions } = await supabase.from('decisions').select('*');

  if (!articles) return [];

  const { consolidated } = consolidateArticles(
    articles as unknown as Article[],
    (propositions || []) as unknown as Proposition[],
    (decisions || []) as unknown as Decision[]
  );

  return consolidated;
}
