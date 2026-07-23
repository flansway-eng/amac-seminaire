import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/header';
import BottomNav from '@/components/bottom-nav';
import { getDemoRoleOverride } from '@/lib/utils/demo-role';
import { SECTIONS } from '@/lib/constants/labels';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AMAC Gouvernance 2.0",
  description: "Plateforme de Réforme et de Modernisation des Textes Fondateurs de l'AMAC",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#E8730C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  // Le middleware a déjà fermé l'accès si la session est invalide ; ici on ne
  // fait que lire le profil pour l'affichage. Aucun repli fictif : si le
  // profil est introuvable, l'utilisateur reste anonyme côté interface.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    console.warn('Impossible de récupérer la session utilisateur :', err);
  }

  let profile: {
    nom: string;
    role: string;
    section_id: number | null;
    section_nom: string;
    estSimule: boolean;
  } | null = null;

  if (user) {
    try {
      const { data: rawProfile } = await supabase
        .from('profiles')
        .select('nom, role, section_id, sections(nom)')
        .eq('id', user.id)
        .maybeSingle();

      if (rawProfile) {
        profile = {
          nom: rawProfile.nom,
          role: rawProfile.role,
          section_id: rawProfile.section_id,
          section_nom: (rawProfile.sections as any)?.nom || '—',
          estSimule: false,
        };
      }
    } catch (e) {
      console.warn('Impossible de récupérer le profil depuis Supabase :', e);
    }

    // Simulation de rôle (démonstration/formation) : n'affecte que
    // l'affichage, jamais les droits réels — voir src/lib/utils/demo-role.ts.
    const demoOverride = await getDemoRoleOverride();
    if (demoOverride && profile) {
      profile = {
        ...profile,
        role: demoOverride.role,
        section_id: demoOverride.sectionId,
        section_nom: SECTIONS[demoOverride.sectionId as keyof typeof SECTIONS] || profile.section_nom,
        estSimule: true,
      };
    }
  }

  return (
    <html lang="fr" className="h-full bg-slate-50">
      <head>
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full text-slate-900 bg-slate-50 flex flex-col`}
      >
        {user && <Header userProfile={profile} />}
        
        <main className={`flex-1 overflow-y-auto pb-20 ${user ? 'pt-2' : ''} w-full md:max-w-md md:mx-auto md:border-x md:bg-white`}>
          {children}
        </main>

        {user && <BottomNav />}

        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
