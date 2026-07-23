'use server';

import { createClient } from '@/lib/supabase/server';
import { PropositionStatut, DecisionVote } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { calculerResultatAdoption, TypeMajorite } from '@/lib/utils/majorite';

export async function updateActiveSeminarArticle(articleId: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('seminaire_session')
    .update({
      article_actif_id: articleId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

  if (error) {
    console.error('Error updating active seminar article:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/seminaire');
  revalidatePath('/seminaire/projection');
  return { success: true };
}

export async function submitSeminarVote(questionId: number, vote: 'A' | 'B' | 'abstention') {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Non authentifié" };

  // Fetch section of user
  const { data: profile } = await supabase
    .from('profiles')
    .select('section_id')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.section_id) {
    return { success: false, error: "Section utilisateur introuvable" };
  }

  const { error } = await supabase
    .from('reponses')
    .upsert(
      {
        question_id: questionId,
        profile_id: user.id,
        section_id: profile.section_id,
        valeur: { reponse: vote, note: vote === 'abstention' ? 0 : 5 },
      },
      {
        onConflict: 'question_id,profile_id',
      }
    );

  if (error) {
    console.error('Error saving seminar vote:', error);
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
  const supabase = await createClient();

  const resultatVote = { votesPour, votesContre, abstentions };
  const decision = calculerResultatAdoption(resultatVote, quorumAtteint, typeMajorite);
  const nouveauStatut: PropositionStatut = decision === 'adopte' ? 'adoptee' : 'rejetee';
  const nouvelleVersion = decision === 'adopte' ? 'V1.0' : 'V0.9';

  // If scribe edited the text, we must update the proposition's text before adopting
  if (scribeText && scribeText.trim() !== '') {
    const { error: updateErr } = await supabase
      .from('propositions')
      .update({
        texte_propose: scribeText,
        version: nouvelleVersion,
      })
      .eq('id', propId);

    if (updateErr) {
      console.error('Error updating proposition text by Scribe:', updateErr);
      return { success: false, error: updateErr.message };
    }
  }

  // Update proposition status according to the actual vote outcome
  if (decision !== 'reporte') {
    const { error: propErr } = await supabase
      .from('propositions')
      .update({
        statut: nouveauStatut,
        version: nouvelleVersion,
      })
      .eq('id', propId);

    if (propErr) {
      console.error('Error updating proposition after vote:', propErr);
      return { success: false, error: propErr.message };
    }
  }

  // Insert decision record with the real computed outcome (jamais "adopte" par défaut)
  const { error: decErr } = await supabase
    .from('decisions')
    .insert({
      article_id: articleId,
      proposition_id: propId,
      decision: decision as DecisionVote,
      votes_pour: votesPour,
      votes_contre: votesContre,
      abstentions: abstentions,
      seance: 'Plénière du Séminaire V1.0',
      quorum_atteint: quorumAtteint,
    });

  if (decErr) {
    console.error('Error inserting decision:', decErr);
    return { success: false, error: decErr.message };
  }

  // Advance the active article to the next one automatically if available
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
