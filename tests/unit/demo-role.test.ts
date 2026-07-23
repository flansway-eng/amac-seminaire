import { describe, it, expect, afterEach, vi } from 'vitest';

// Simule le magasin de cookies Next.js (next/headers) pour vérifier, sans
// navigateur ni base de données, que la simulation de rôle ne touche jamais
// `profiles` : elle ne fait que lire/écrire ce faux cookie store.
function createFakeCookieStore() {
  const store = new Map<string, string>();
  return {
    get: (name: string) => (store.has(name) ? { name, value: store.get(name)! } : undefined),
    set: (name: string, value: string) => {
      store.set(name, value);
    },
    _store: store,
  };
}

describe('Simulation de rôle (démonstration/formation) isolée de la production', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.doUnmock('next/headers');
  });

  it("n'enregistre rien du tout quand OFFLINE_MODE est faux (hors démonstration)", async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_OFFLINE_SEED', 'false');

    const fakeCookies = createFakeCookieStore();
    vi.doMock('next/headers', () => ({ cookies: async () => fakeCookies }));

    const { setDemoRoleOverride, getDemoRoleOverride } = await import('../../src/lib/utils/demo-role');

    await setDemoRoleOverride('admin', 1);
    expect(fakeCookies._store.size).toBe(0);

    const result = await getDemoRoleOverride();
    expect(result).toBeNull();
  });

  it('enregistre uniquement dans le cookie (jamais en base) quand OFFLINE_MODE est vrai', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_OFFLINE_SEED', 'true');

    const fakeCookies = createFakeCookieStore();
    vi.doMock('next/headers', () => ({ cookies: async () => fakeCookies }));

    const { setDemoRoleOverride, getDemoRoleOverride } = await import('../../src/lib/utils/demo-role');

    await setDemoRoleOverride('ben', 3);

    expect(fakeCookies._store.get('amac_demo_role')).toBe('ben');
    expect(fakeCookies._store.get('amac_demo_section_id')).toBe('3');

    const result = await getDemoRoleOverride();
    expect(result).toEqual({ role: 'ben', sectionId: 3 });
  });

  it('reste false en production même si NEXT_PUBLIC_OFFLINE_SEED vaut "true" (cohérent avec OFFLINE_MODE)', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_OFFLINE_SEED', 'true');

    const fakeCookies = createFakeCookieStore();
    vi.doMock('next/headers', () => ({ cookies: async () => fakeCookies }));

    const { setDemoRoleOverride, getDemoRoleOverride } = await import('../../src/lib/utils/demo-role');

    await setDemoRoleOverride('admin', 1);
    expect(fakeCookies._store.size).toBe(0);
    expect(await getDemoRoleOverride()).toBeNull();
  });
});
