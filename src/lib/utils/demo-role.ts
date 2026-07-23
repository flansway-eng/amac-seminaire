import { cookies } from 'next/headers';
import { UserRole } from '@/lib/types';
import { OFFLINE_MODE } from '@/lib/constants/mode';

// Simulation de rôle pour la démonstration/formation : n'écrit jamais dans
// `profiles`. La valeur n'existe que dans un cookie de session, lu ici pour
// l'affichage et pour décider quelles vues montrer en aperçu. Elle ne peut
// jamais élargir ce qu'un Server Action ou une policy RLS autorise
// réellement : ceux-ci s'appuient uniquement sur `auth.uid()` et le rôle
// stocké en base, jamais sur ce cookie.
const ROLE_COOKIE = 'amac_demo_role';
const SECTION_COOKIE = 'amac_demo_section_id';

export interface DemoRoleOverride {
  role: UserRole;
  sectionId: number;
}

export async function getDemoRoleOverride(): Promise<DemoRoleOverride | null> {
  if (!OFFLINE_MODE) return null;

  const cookieStore = await cookies();
  const role = cookieStore.get(ROLE_COOKIE)?.value as UserRole | undefined;
  const sectionIdRaw = cookieStore.get(SECTION_COOKIE)?.value;

  if (!role || !sectionIdRaw) return null;

  const sectionId = Number(sectionIdRaw);
  if (Number.isNaN(sectionId)) return null;

  return { role, sectionId };
}

export async function setDemoRoleOverride(role: UserRole, sectionId: number): Promise<void> {
  if (!OFFLINE_MODE) return;

  const cookieStore = await cookies();
  const options = { path: '/', maxAge: 60 * 60 * 8 }; // 8h : la durée d'une session de démonstration
  cookieStore.set(ROLE_COOKIE, role, options);
  cookieStore.set(SECTION_COOKIE, String(sectionId), options);
}
