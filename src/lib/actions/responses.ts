'use server';

import { createClient } from '@/lib/supabase/server';
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  // Fetch the user's section
  const { data: profile } = await supabase
    .from('profiles')
    .select('section_id')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.section_id) {
    return { success: false, error: "L'utilisateur n'est associé à aucune section" };
  }

  const { error } = await supabase
    .from('reponses')
    .upsert(
      {
        question_id: questionId,
        profile_id: user.id,
        section_id: profile.section_id,
        valeur,
        commentaire,
      },
      {
        onConflict: 'question_id,profile_id',
      }
    );

  if (error) {
    console.error('Error saving response:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getUserResponsesForArticle(articleId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Fetch user responses for questions associated with the article
  const { data, error } = await supabase
    .from('reponses')
    .select(`
      *,
      question:questions(*)
    `)
    .eq('profile_id', user.id)
    .eq('questions.article_id', articleId);

  if (error) {
    console.error('Error fetching user responses:', error);
    return [];
  }

  // Filter out where question was null because of the join filter
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const { error } = await supabase.from('propositions').insert({
    article_id: articleId,
    auteur_id: user.id,
    texte_propose: textePropose,
    expose_motifs: exposeMotifs,
    statut: 'soumise' as PropositionStatut,
    version: 'V0.1',
  });

  if (error) {
    console.error('Error saving proposition:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/textes');
  revalidatePath('/concordance');
  return { success: true };
}

export async function getUserPropositionsForArticle(articleId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('propositions')
    .select('*')
    .eq('article_id', articleId)
    .eq('auteur_id', user.id);

  if (error) {
    console.error('Error fetching propositions:', error);
    return [];
  }

  return data as Proposition[];
}
