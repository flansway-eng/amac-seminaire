import { NextResponse, type NextRequest } from 'next/server';
import { verifierHmac } from '@/lib/hmac';

const COOKIE_NAME = 'amac_participant';

// Aucune vérification de session Supabase ici : il n'y a plus de compte,
// plus d'auth.uid(). La seule question posée par le middleware est « ce
// cookie porte-t-il la signature d'un participant qu'on a nous-mêmes créé ? »
// — une vérification de signature à faible coût, sans appel base de
// données (voir src/lib/session.ts pour la lecture complète du participant,
// qui elle interroge `participants`).
async function cookieParticipantValide(request: NextRequest): Promise<boolean> {
  const brut = request.cookies.get(COOKIE_NAME)?.value;
  if (!brut) return false;

  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    console.warn('[middleware] SESSION_SECRET absent : impossible de vérifier la session participant.');
    return false;
  }

  const [participantId, signature] = brut.split('.');
  if (!participantId || !signature) return false;

  return verifierHmac(participantId, signature, secret);
}

// /staff n'est PAS public : il élève le rôle du participant COURANT, donc
// suppose qu'un participant a déjà rejoint via /rejoindre.
const CHEMINS_PUBLICS = ['/rejoindre', '/api'];

function estCheminPublic(pathname: string): boolean {
  return CHEMINS_PUBLICS.some((chemin) => pathname === chemin || pathname.startsWith(`${chemin}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (estCheminPublic(pathname)) {
    return NextResponse.next();
  }

  const valide = await cookieParticipantValide(request);
  if (!valide) {
    const url = request.nextUrl.clone();
    url.pathname = '/rejoindre';
    url.searchParams.set('suite', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Toutes les routes sauf :
     * - _next/static, _next/image (assets Next.js)
     * - favicon.ico, manifest.json, sw.js (PWA)
     * - images statiques
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
