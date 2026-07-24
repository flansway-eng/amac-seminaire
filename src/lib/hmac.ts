// Signature HMAC-SHA256 via l'API Web Crypto (crypto.subtle), disponible à
// l'identique dans le runtime Node.js des Server Actions et dans le runtime
// Edge du middleware — contrairement au module `node:crypto`, qui n'est pas
// disponible dans le middleware. Une seule implémentation, utilisable des
// deux côtés, pour signer et vérifier le cookie de session participant.

async function importerCle(secret: string): Promise<CryptoKey> {
  const donneesCle = new TextEncoder().encode(secret);
  return crypto.subtle.importKey('raw', donneesCle, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

function versBase64Url(buffer: ArrayBuffer): string {
  const octets = new Uint8Array(buffer);
  let binaire = '';
  octets.forEach((o) => {
    binaire += String.fromCharCode(o);
  });
  return btoa(binaire).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function signerHmac(message: string, secret: string): Promise<string> {
  const cle = await importerCle(secret);
  const signature = await crypto.subtle.sign('HMAC', cle, new TextEncoder().encode(message));
  return versBase64Url(signature);
}

// Comparaison à temps constant : la sortie HMAC-SHA256 encodée en
// base64url a une longueur fixe connue, mais on compare tout de même
// caractère par caractère plutôt que via `===` pour éviter une sortie
// anticipée sur la première différence.
export async function verifierHmac(message: string, signature: string, secret: string): Promise<boolean> {
  const attendue = await signerHmac(message, secret);
  if (attendue.length !== signature.length) return false;

  let diff = 0;
  for (let i = 0; i < attendue.length; i++) {
    diff |= attendue.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}
