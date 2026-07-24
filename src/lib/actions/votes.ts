'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { lireParticipant } from '@/lib/session';
import { PropositionStatut, DecisionVote } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { calculerResultatAdoption, TypeMajorite } from '@/lib/utils/majorite';

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

export async function updateActiveSeminarArticle(articleId: number) {
  const { participant, erreur } = await exigerParticipantPilotage();
  if (!participant) {
    return { success: false, error: erreur };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('seminaire_session')
    .update({
      article_actif_id: articleId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

  if (error) {
    console.error("Erreur en changeant l'article actif du séminaire :", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/seminaire');
  revalidatePath('/seminaire/projection');
  return { success: true };
}

// Propositions déposées pour un article donné, visibles de tout participant
// pendant la séance (console scribe) : `propositions` n'est plus lisible
// directement par la clé anon, ce passage par Server Action + client
// service_role est donc nécessaire pour ce qui était auparavant une requête
// directe depuis le navigateur.
export async function getPropositionsForArticle(articleId: number) {
  const participant = await lireParticipant();
  if (!participant) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('propositions')
    .select('*, participant:participants(*)')
    .eq('article_id', articleId);

  if (error) {
    console.error('Erreur en récupérant les propositions de la séance :', error);
    return [];
  }

  return data || [];
}

export async function submitSeminarVote(questionId: number, vote: 'A' | 'B' | 'abstention') {
  const participant = await lireParticipant();
  if (!participant) {
    return { success: false, error: 'Session introuvable — reconnectez-vous via /rejoindre' };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('reponses').upsert(
    {
      question_id: questionId,
      participant_id: participant.id,
      section_id: participant.sectionId,
      valeur: { reponse: vote, note: vote === 'abstention' ? 0 : 5 },
    },
    {
      onConflict: 'question_id,participant_id',
    }
  );

  if (error) {
    console.error('Erreur en enregistrant le vote de séance :', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function adoptSeminarProposition(
  articleId: number,
  propId: string,
  votesPour: number,
  votesContre: number,
  abstentions: number,
  quorumAtteint: boolean,
  typeMajorite: TypeMajorite = 'absolue',
  scribeText?: string
) {
  const { participant, erreur } = await exigerParticipantPilotage();
  if (!participant) {
    return { success: false, error: erreur };
  }

  const supabase = createAdminClient();

  const resultatVote = { votesPour, votesContre, abstentions };
  const decision = calculerResultatAdoption(resultatVote, quorumAtteint, typeMajorite);
  const nouveauStatut: PropositionStatut = decision === 'adopte' ? 'adoptee' : 'rejetee';
  const nouvelleVersion = decision === 'adopte' ? 'V1.0' : 'V0.9';

  if (scribeText && scribeText.trim() !== '') {
    const { error: updateErr } = await supabase
      .from('propositions')
      .update({
        texte_propose: scribeText,
        version: nouvelleVersion,
      })
      .eq('id', propId);

    if (updateErr) {
      console.error('Erreur en mettant à jour le texte du scribe :', updateErr);
      return { success: false, error: updateErr.message };
    }
  }

  if (decision !== 'reporte') {
    const { error: propErr } = await supabase
      .from('propositions')
      .update({
        statut: nouveauStatut,
        version: nouvelleVersion,
      })
      .eq('id', propId);

    if (propErr) {
      console.error('Erreur en mettant à jour la proposition après le vote :', propErr);
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
    seance: 'Plénière du Séminaire V1.0',
    quorum_atteint: quorumAtteint,
  });

  if (decErr) {
    console.error('Erreur en enregistrant la décision :', decErr);
    return { success: false, error: decErr.message };
  }

  const { data: nextArticle } = await supabase
    .from('articles')
    .select('id')
    .gt('id', articleId)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (nextArticle) {
    await updateActiveSeminarArticle(nextArticle.id);
  }

  revalidatePath('/seminaire');
  revalidatePath('/seminaire/projection');
  revalidatePath('/concordance');
  return { success: true, decision };
}
