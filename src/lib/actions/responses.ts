'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { lireParticipant } from '@/lib/session';
import { Reponse, Proposition, PropositionStatut } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const responseSchema = z.object({
  questionId: z.number(),
  valeur: z.any(),
  commentaire: z.string().nullable(),
});

const propositionSchema = z.object({
  articleId: z.number(),
  textePropose: z.string().min(5, { message: "Le texte proposé doit faire au moins 5 caractères" }),
  exposeMotifs: z.string().min(5, { message: "L'exposé des motifs doit faire au moins 5 caractères" }),
});

export async function saveResponse(
  questionId: number,
  valeur: any,
  commentaire: string | null
) {
  const result = responseSchema.safeParse({ questionId, valeur, commentaire });
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message };
  }

  // L'auteur d'une réponse est toujours celui du cookie, jamais un
  // identifiant transmis par le client.
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
      valeur,
      commentaire,
    },
    {
      onConflict: 'question_id,participant_id',
    }
  );

  if (error) {
    console.error('Erreur en enregistrant la réponse :', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getUserResponsesForArticle(articleId: number) {
  const participant = await lireParticipant();
  if (!participant) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('reponses')
    .select(
      `
      *,
      question:questions(*)
    `
    )
    .eq('participant_id', participant.id)
    .eq('questions.article_id', articleId);

  if (error) {
    console.error('Erreur en récupérant les réponses du participant :', error);
    return [];
  }

  return (data || []).filter((r: any) => r.question !== null) as unknown as Reponse[];
}

export async function saveProposition(
  articleId: number,
  textePropose: string,
  exposeMotifs: string
) {
  const result = propositionSchema.safeParse({ articleId, textePropose, exposeMotifs });
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message };
  }

  const participant = await lireParticipant();
  if (!participant) {
    return { success: false, error: 'Session introuvable — reconnectez-vous via /rejoindre' };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('propositions').insert({
    article_id: articleId,
    participant_id: participant.id,
    texte_propose: textePropose,
    expose_motifs: exposeMotifs,
    statut: 'soumise' as PropositionStatut,
    version: 'V0.1',
  });

  if (error) {
    console.error('Erreur en enregistrant la proposition :', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/textes');
  revalidatePath('/concordance');
  return { success: true };
}

export async function getUserPropositionsForArticle(articleId: number) {
  const participant = await lireParticipant();
  if (!participant) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('propositions')
    .select('*')
    .eq('article_id', articleId)
    .eq('participant_id', participant.id);

  if (error) {
    console.error('Erreur en récupérant les propositions :', error);
    return [];
  }

  return data as Proposition[];
}
