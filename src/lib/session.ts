import 'server-only';
import { cookies } from 'next/headers';
import { signerHmac, verifierHmac } from '@/lib/hmac';
import { createAdminClient } from '@/lib/supabase/admin';
import { ParticipantRole } from '@/lib/types';

// Session de participant sans compte : un cookie signé (HMAC SHA-256)
// contient uniquement l'identifiant du participant. Le reste (nom, rôle,
// section) est toujours relu depuis `participants` via le client
// service_role — jamais fait confiance à un cookie pour autre chose que
// l'identité, et jamais fait confiance à une valeur transmise par le client
// pour l'auteur d'une écriture.

const COOKIE_NAME = 'amac_participant';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

export interface Participant {
  id: string;
  nom: string;
  sectionId: number | null;
  role: ParticipantRole;
  seance: string | null;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET absent ou trop court (32 caractères minimum requis) : impossible de signer la session participant."
    );
  }
  return secret;
}

async function construireValeurCookie(participantId: string): Promise<string> {
  const signature = await signerHmac(participantId, getSecret());
  return `${participantId}.${signature}`;
}

// Un cookie dont la signature ne correspond pas (falsifié, ou signé avec un
// ancien SESSION_SECRET) est traité comme absent.
async function verifierValeurCookie(valeur: string): Promise<string | null> {
  const [participantId, signature] = valeur.split('.');
  if (!participantId || !signature) return null;

  const valide = await verifierHmac(participantId, signature, getSecret());
  return valide ? participantId : null;
}

export async function poserCookieParticipant(participantId: string): Promise<void> {
  const cookieStore = await cookies();
  const valeur = await construireValeurCookie(participantId);
  cookieStore.set(COOKIE_NAME, valeur, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function lireParticipant(): Promise<Participant | null> {
  const cookieStore = await cookies();
  const brut = cookieStore.get(COOKIE_NAME)?.value;
  if (!brut) return null;

  const participantId = await verifierValeurCookie(brut);
  if (!participantId) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('participants')
    .select('id, nom, section_id, role, seance')
    .eq('id', participantId)
    .maybeSingle();

  if (error || !data) return null;

  // Trace de dernière activité, sans bloquer la réponse.
  void supabase
    .from('participants')
    .update({ vu_le: new Date().toISOString() })
    .eq('id', participantId)
    .then(() => {});

  return {
    id: data.id,
    nom: data.nom,
    sectionId: data.section_id,
    role: data.role as ParticipantRole,
    seance: data.seance,
  };
}

export async function creerParticipant(
  nom: string,
  sectionId: number | null,
  role: ParticipantRole = 'delegue',
  seance: string | null = null
): Promise<Participant> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('participants')
    .insert({ nom, section_id: sectionId, role, seance })
    .select('id, nom, section_id, role, seance')
    .single();

  if (error || !data) {
    throw new Error("Impossible de créer le participant : " + (error?.message || 'réponse vide de la base'));
  }

  await poserCookieParticipant(data.id);

  return {
    id: data.id,
    nom: data.nom,
    sectionId: data.section_id,
    role: data.role as ParticipantRole,
    seance: data.seance,
  };
}

export async function effacerParticipant(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Utilisé uniquement par la route /staff après vérification du code PIN :
// élève le rôle du participant courant et réémet le cookie (même
// identifiant, donc même signature de cookie — seul le rôle en base change).
export async function elevateParticipantRole(
  participantId: string,
  role: ParticipantRole
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('participants').update({ role }).eq('id', participantId);
  if (error) {
    throw new Error("Impossible de mettre à jour le rôle : " + error.message);
  }
  await poserCookieParticipant(participantId);
}
