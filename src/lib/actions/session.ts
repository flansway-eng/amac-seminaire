'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { creerParticipant, effacerParticipant, lireParticipant, elevateParticipantRole } from '@/lib/session';
import { ParticipantRole } from '@/lib/types';

const rejoindreSchema = z.object({
  nom: z.string().trim().min(3, 'Le nom et prénoms doivent faire au moins 3 caractères'),
  section: z.string().min(1, 'Veuillez choisir une section'),
});

// Empêche une redirection ouverte : on ne redirige que vers un chemin
// interne relatif, jamais vers une URL absolue ni un chemin "//".
function cheminInterneSur(chemin: string | null): string | null {
  if (!chemin) return null;
  if (!chemin.startsWith('/') || chemin.startsWith('//')) return null;
  return chemin;
}

export async function rejoindreAction(prevState: any, formData: FormData) {
  const nom = formData.get('nom') as string;
  const section = formData.get('section') as string;
  const seance = (formData.get('seance') as string) || null;
  const suite = (formData.get('suite') as string) || null;

  const result = rejoindreSchema.safeParse({ nom, section });
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message };
  }

  let role: ParticipantRole = 'delegue';
  let sectionId: number | null = null;

  if (section === 'BEN') {
    role = 'ben';
  } else if (section === 'OBSERVATEUR') {
    role = 'observateur';
  } else {
    const parsed = Number(section);
    if (!Number.isInteger(parsed)) {
      return { success: false, error: 'Section invalide' };
    }
    sectionId = parsed;
  }

  try {
    await creerParticipant(result.data.nom, sectionId, role, seance);
  } catch (e: any) {
    return { success: false, error: e.message };
  }

  redirect(cheminInterneSur(suite) || (seance ? '/seminaire' : '/'));
}

export async function quitterAction() {
  await effacerParticipant();
  redirect('/rejoindre');
}

// ==============================================================================
// ÉLÉVATION DE RÔLE (/staff) — 5 tentatives max par cookie, par tranche de
// 10 minutes. Le compteur vit en mémoire du processus serveur : suffisant
// pour un séminaire d'une journée sur une seule instance, pas conçu pour
// résister à un déploiement multi-instance (voir rapport).
// ==============================================================================
const tentativesParParticipant = new Map<string, { compte: number; depuis: number }>();
const FENETRE_MS = 10 * 60 * 1000;
const MAX_TENTATIVES = 5;

export async function staffAction(prevState: any, formData: FormData) {
  const participant = await lireParticipant();
  if (!participant) {
    return { success: false, error: "Vous devez d'abord rejoindre le séminaire via /rejoindre." };
  }

  const maintenant = Date.now();
  const suivi = tentativesParParticipant.get(participant.id);
  if (suivi && maintenant - suivi.depuis < FENETRE_MS && suivi.compte >= MAX_TENTATIVES) {
    const minutesRestantes = Math.ceil((FENETRE_MS - (maintenant - suivi.depuis)) / 60000);
    return {
      success: false,
      error: `Trop de tentatives. Réessayez dans ${minutesRestantes} minute(s).`,
    };
  }

  const code = (formData.get('code') as string) || '';
  const pinScribe = process.env.STAFF_PIN_SCRIBE;
  const pinBen = process.env.STAFF_PIN_BEN;

  let roleObtenu: ParticipantRole | null = null;
  if (pinScribe && code === pinScribe) {
    roleObtenu = 'scribe';
  } else if (pinBen && code === pinBen) {
    roleObtenu = 'ben';
  }

  if (!roleObtenu) {
    const nouveauCompte = suivi && maintenant - suivi.depuis < FENETRE_MS ? suivi.compte + 1 : 1;
    tentativesParParticipant.set(participant.id, { compte: nouveauCompte, depuis: suivi?.depuis ?? maintenant });
    return { success: false, error: 'Code incorrect.' };
  }

  tentativesParParticipant.delete(participant.id);
  await elevateParticipantRole(participant.id, roleObtenu);

  redirect('/');
}
