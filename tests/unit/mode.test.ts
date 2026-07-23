import { describe, it, expect, afterEach, vi } from 'vitest';

describe('OFFLINE_MODE (verrou de production)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("reste à false en production même si NEXT_PUBLIC_OFFLINE_SEED='true'", async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_OFFLINE_SEED', 'true');

    const { OFFLINE_MODE } = await import('../../src/lib/constants/mode');
    expect(OFFLINE_MODE).toBe(false);
  });

  it("est à true en développement quand NEXT_PUBLIC_OFFLINE_SEED='true'", async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_OFFLINE_SEED', 'true');

    const { OFFLINE_MODE } = await import('../../src/lib/constants/mode');
    expect(OFFLINE_MODE).toBe(true);
  });

  it('reste à false en développement quand la variable est absente', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_OFFLINE_SEED', '');

    const { OFFLINE_MODE } = await import('../../src/lib/constants/mode');
    expect(OFFLINE_MODE).toBe(false);
  });
});
