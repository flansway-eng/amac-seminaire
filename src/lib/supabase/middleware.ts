import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Chemins accessibles sans session Supabase valide.
const PUBLIC_PATHS = ['/login', '/api/auth'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { pathname } = request.nextUrl;

  // Une erreur d'authentification ne doit jamais laisser passer la requête :
  // en production, on referme l'accès ; en développement, on journalise et on
  // traite la session comme absente (pas de contournement silencieux).
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    user = data.user;
  } catch (err) {
    if (process.env.NODE_ENV === 'production') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('erreur', 'session');
      return NextResponse.redirect(url);
    }
    console.warn('[middleware] session Supabase indisponible en développement :', err);
  }

  // Accès par défaut fermé : toute route hors PUBLIC_PATHS exige une session,
  // quel que soit l'environnement (aucune dérogation "mode hors-ligne" ici —
  // le mode hors-ligne ne concerne que la consultation de contenu mis en
  // cache côté client, jamais le contournement de l'authentification).
  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('erreur', 'session');
    return NextResponse.redirect(url);
  }

  if (user && pathname.startsWith('/login')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
