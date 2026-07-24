import { describe, it, expect } from 'vitest';
import { signerHmac, verifierHmac } from '../../src/lib/hmac';

describe('Signature HMAC du cookie de participant', () => {
  const secret = 'un-secret-de-test-suffisamment-long-32c';

  it('une signature valide est acceptée', async () => {
    const message = 'participant-abc-123';
    const signature = await signerHmac(message, secret);
    expect(await verifierHmac(message, signature, secret)).toBe(true);
  });

  it('un cookie falsifié (message modifié) est rejeté', async () => {
    const signature = await signerHmac('participant-abc-123', secret);
    expect(await verifierHmac('participant-XXX-999', signature, secret)).toBe(false);
  });

  it('une signature falsifiée est rejetée', async () => {
    const message = 'participant-abc-123';
    const signatureValide = await signerHmac(message, secret);
    const signatureFalsifiee = signatureValide.slice(0, -4) + 'abcd';
    expect(await verifierHmac(message, signatureFalsifiee, secret)).toBe(false);
  });

  it('un cookie signé avec un ancien secret est rejeté après rotation de SESSION_SECRET', async () => {
    const message = 'participant-abc-123';
    const signature = await signerHmac(message, 'ancien-secret-32-caracteres-minimum');
    expect(await verifierHmac(message, signature, secret)).toBe(false);
  });

  it('deux secrets différents produisent des signatures différentes pour le même message', async () => {
    const message = 'participant-abc-123';
    const sigA = await signerHmac(message, secret);
    const sigB = await signerHmac(message, 'un-autre-secret-different-32-caracteres');
    expect(sigA).not.toBe(sigB);
  });
});
