import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/session', () => ({
  lireParticipant: vi.fn(),
}));

const upsertMock = vi.fn((_payload: Record<string, unknown>, _options: Record<string, unknown>) =>
  Promise.resolve({ data: null, error: null })
);
const fromMock = vi.fn(() => ({ upsert: upsertMock }));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: fromMock }),
}));

import { lireParticipant } from '@/lib/session';
import { submitSeminarVote } from '@/lib/actions/votes';

const participant = {
  id: 'participant-1',
  nom: 'Délégué Test',
  sectionId: 1,
  role: 'delegue' as const,
  seance: null,
};

describe('Unicité du vote (participant_id, question_id) — upsert au lieu d’un doublon', () => {
  afterEach(() => {
    vi.mocked(lireParticipant).mockReset();
    upsertMock.mockClear();
    fromMock.mockClear();
  });

  it('un revote du même participant sur la même question remplace la réponse au lieu d’en ajouter une', async () => {
    vi.mocked(lireParticipant).mockResolvedValue(participant);

    await submitSeminarVote(42, 'A');

    expect(fromMock).toHaveBeenCalledWith('reponses');
    expect(upsertMock).toHaveBeenCalledTimes(1);

    const [payload, options] = upsertMock.mock.calls[0];
    expect(payload).toMatchObject({
      question_id: 42,
      participant_id: participant.id,
      section_id: participant.sectionId,
    });
    // La contrainte d'unicité porte sur (question_id, participant_id) :
    // un second appel avec le même participant/question doit UPDATE la
    // ligne existante plutôt que d'en insérer une nouvelle.
    expect(options).toMatchObject({ onConflict: 'question_id,participant_id' });
  });
});
