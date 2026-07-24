import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Client Supabase à privilège élevé (clé service_role) : contourne RLS.
// N'est utilisé QUE par des Server Actions et des Server Components — le
// paquet `server-only` fait échouer la compilation si ce fichier est un
// jour importé, même transitivement, depuis un composant client.
//
// Toutes les tables opérationnelles (participants, reponses, propositions,
// decisions, seminaire_session en écriture) passent par ce client, jamais
// par le client anon exposé au navigateur.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL manquant : impossible de créer le client d'administration."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
