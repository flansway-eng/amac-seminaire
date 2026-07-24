import { createClient } from '@/lib/supabase/server';
import { lireParticipant } from '@/lib/session';
import { redirect } from 'next/navigation';
import LiensDiffusion from '@/components/liens-diffusion';
import { Link2 } from 'lucide-react';

const SEANCE_DEFAUT = 'seminaire-2026-08-01';

export default async function LiensPage() {
  const participant = await lireParticipant();
  if (!participant) {
    redirect('/rejoindre?suite=/ben/liens');
  }

  if (!['admin', 'ben', 'scribe'].includes(participant.role)) {
    redirect('/textes');
  }

  const supabase = await createClient();
  const { data: sections } = await supabase
    .from('sections')
    .select('id, nom, ville, slug')
    .eq('actif', true)
    .order('nom', { ascending: true });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <div className="p-4 space-y-6">
      <div className="bg-gradient-to-tr from-[#128A3E]/10 to-[#E8730C]/10 border border-orange-100 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 mb-2">
          <Link2 className="w-5 h-5 text-[#E8730C]" />
          <h2 className="text-base font-bold text-gray-900">Liens de diffusion du séminaire</h2>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Un lien et un QR code par section, plus un lien général de séance. Aucun compte, aucun mot
          de passe : un participant qui scanne ou clique entre directement.
        </p>
      </div>

      <LiensDiffusion sections={sections || []} siteUrl={siteUrl} seance={SEANCE_DEFAUT} />
    </div>
  );
}
