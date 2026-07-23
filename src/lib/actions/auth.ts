'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { UserRole } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { OFFLINE_MODE } from '@/lib/constants/mode';
import { setDemoRoleOverride } from '@/lib/utils/demo-role';

const loginSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit faire au moins 6 caractères" }),
});

const magicLinkSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide" }),
});

export async function signIn(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const result = loginSchema.safeParse({ email, password });
  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0].message,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: "Identifiants incorrects ou utilisateur non trouvé",
    };
  }

  redirect('/');
}

export async function signInMagicLink(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const origin = formData.get('origin') as string;

  const result = magicLinkSchema.safeParse({ email });
  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0].message,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Lien magique envoyé par email ! Vérifiez votre boîte de réception.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function switchUserRoleAndSection(role: UserRole, sectionId: number) {
  // Simulation de rôle pour démonstration/formation UNIQUEMENT : ceci n'écrit
  // plus jamais dans `profiles`. Le rôle "simulé" ne vit que dans un cookie
  // de session (voir src/lib/utils/demo-role.ts), lu par les pages pour
  // adapter l'aperçu affiché. Le rôle réel en base ne change jamais, donc
  // aucun Server Action ni policy RLS ne peut être influencé par ce cookie :
  // une simulation ne peut jamais se traduire en privilège réel.
  if (!OFFLINE_MODE) {
    return {
      success: false,
      error: "Le changement de rôle n'est disponible qu'en mode démonstration hors-ligne",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  await setDemoRoleOverride(role, sectionId);

  revalidatePath('/');
  return { success: true };
}
