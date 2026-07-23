import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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

  // Get current user session
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch (err) {
    console.warn('Failed to fetch user in middleware, using offline path:', err);
  }

  const isAuthCallback = request.nextUrl.pathname.startsWith('/api/auth');

  if (!user && !isAuthCallback) {
    try {
      // Attempt background login as guest
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'guest@amac.ci',
        password: 'password123',
      });

      if (signInError) {
        // If guest user doesn't exist yet, sign up the guest user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'guest@amac.ci',
          password: 'password123',
          options: {
            data: {
              nom: 'Koffi Délégué',
              role: 'admin',
              section_id: 1,
            },
          },
        });

        if (!signUpError && signUpData.user) {
          user = signUpData.user;
        }
      } else if (signInData.user) {
        user = signInData.user;
      }
    } catch (err) {
      console.warn('Auto login failed:', err);
    }
  }

  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  if (user && isLoginPage) {
    // Redirect to home if logged in and trying to access login page
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
