import { redirect } from 'next/navigation';
import { lireParticipant } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import RejoindreForm from '@/components/rejoindre-form';

interface SearchParams {
  section?: string;
  seance?: string;
  suite?: string;
}

function cheminInterneSur(chemin: string | null | undefined): string | null {
  if (!chemin) return null;
  if (!chemin.startsWith('/') || chemin.startsWith('//')) return null;
  return chemin;
}

export default async function RejoindrePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // Un participant déjà porteur d'un cookie valide n'a rien à saisir.
  const participantExistant = await lireParticipant();
  if (participantExistant) {
    redirect(cheminInterneSur(params.suite) || (params.seance ? '/seminaire' : '/'));
  }

  const supabase = await createClient();
  const { data: sections } = await supabase
    .from('sections')
    .select('id, nom, ville, slug')
    .eq('actif', true)
    .order('nom', { ascending: true });

  const sectionPreselectionneeId = params.section
    ? (sections || []).find((s) => s.slug === params.section)?.id ?? null
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-tr from-[#128A3E] to-[#E8730C] h-32 flex flex-col justify-end p-6 relative">
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
          <h2 className="text-2xl font-bold text-white tracking-tight">AMAC National</h2>
          <p className="text-white/80 text-xs font-medium tracking-wide">Séminaire de toilettage des textes</p>
        </div>

        <div className="p-6">
          <RejoindreForm
            sections={sections || []}
            sectionPreselectionneeId={sectionPreselectionneeId}
            seance={params.seance || ''}
            suite={params.suite || ''}
          />
        </div>
      </div>
    </div>
  );
}
