import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Client anon côté navigateur, sans session à synchroniser (plus de
// Supabase Auth). Utilisé pour les abonnements Realtime (mode séminaire,
// scoreboard) sur les tables en lecture seule pour la clé anon.
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
