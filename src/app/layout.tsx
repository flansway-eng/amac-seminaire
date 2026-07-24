import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { lireParticipant } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/header';
import BottomNav from '@/components/bottom-nav';

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
  // Plus de Supabase Auth : la présence d'un participant valide (cookie
  // signé, vérifié par le middleware pour l'accès aux routes, relu ici
  // pour l'affichage) est la seule notion de « connecté ».
  const participant = await lireParticipant();

  let sectionNom: string | null = null;
  if (participant?.sectionId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('sections')
      .select('nom')
      .eq('id', participant.sectionId)
      .maybeSingle();
    sectionNom = data?.nom ?? null;
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
        {participant && (
          <Header
            participant={{
              nom: participant.nom,
              role: participant.role,
              sectionNom,
            }}
          />
        )}

        <main className={`flex-1 overflow-y-auto pb-20 ${participant ? 'pt-2' : ''} w-full md:max-w-md md:mx-auto md:border-x md:bg-white`}>
          {children}
        </main>

        {participant && <BottomNav />}

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
