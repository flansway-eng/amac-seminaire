import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Client anon simple, sans session à synchroniser : il n'y a plus de
// Supabase Auth, donc plus de cookies de session à lire/écrire ici.
// N'accède qu'aux tables en lecture seule (articles, enjeux, questions,
// sections, textes) et, pour le Realtime, reponses/seminaire_session —
// voir la migration 20260724000000 pour le détail des policies RLS.
export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
