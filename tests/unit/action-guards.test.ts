import { describe, it, expect, vi, afterEach } from 'vitest';

// 'server-only' lève une erreur par défaut dès qu'il est importé hors du
// bundler Next.js (qui, lui, résout la condition "react-server"). Sous
// Vitest, on neutralise ce marqueur pour pouvoir charger les modules
// serveur qui l'importent (src/lib/supabase/admin.ts).
vi.mock('server-only', () => ({}));

// lireParticipant() est mocké : on teste ici la garde des Server Actions
// (rejet sans participant, rejet par rôle), pas l'accès réel à la base.
vi.mock('@/lib/session', () => ({
  lireParticipant: vi.fn(),
}));

import { lireParticipant } from '@/lib/session';
import { updateActiveSeminarArticle, adoptSeminarProposition } from '@/lib/actions/votes';
import { preArbitrateProposition, adoptPropositionDirectly } from '@/lib/actions/admin';

const participantDelegue = {
  id: 'participant-delegue',
  nom: 'Délégué Test',
  sectionId: 1,
  role: 'delegue' as const,
  seance: null,
};

describe('Garde des Server Actions de pilotage (scribe/ben/admin uniquement)', () => {
  afterEach(() => {
    vi.mocked(lireParticipant).mockReset();
  });

  it('rejette sans cookie participant valide', async () => {
    vi.mocked(lireParticipant).mockResolvedValue(null);

    const res = await updateActiveSeminarArticle(1);
    expect(res.success).toBe(false);
  });

  it("un participant de rôle 'delegue' ne peut pas changer l'article actif de la séance", async () => {
    vi.mocked(lireParticipant).mockResolvedValue(participantDelegue);

    const res = await updateActiveSeminarArticle(1);
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/scribe/i);
  });

  it("un participant de rôle 'delegue' ne peut pas adopter une proposition (écrire dans decisions)", async () => {
    vi.mocked(lireParticipant).mockResolvedValue(participantDelegue);

    const res = await adoptSeminarProposition(1, 'prop-1', 10, 2, 1, true, 'absolue');
    expect(res.success).toBe(false);
  });

  it("un participant de rôle 'delegue' ne peut pas pré-arbitrer une proposition", async () => {
    vi.mocked(lireParticipant).mockResolvedValue(participantDelegue);

    const res = await preArbitrateProposition('prop-1', 'pre_arbitree');
    expect(res.success).toBe(false);
  });

  it("un participant de rôle 'delegue' ne peut pas adopter directement depuis le tableau de bord BEN", async () => {
    vi.mocked(lireParticipant).mockResolvedValue(participantDelegue);

    const res = await adoptPropositionDirectly(1, 'prop-1', 10, 2, 1, true, 'absolue');
    expect(res.success).toBe(false);
  });
});
