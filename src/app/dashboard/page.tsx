import { createAdminClient } from '@/lib/supabase/admin';
import { lireParticipant } from '@/lib/session';
import { getDashboardSummary, getConsolidatedCorpus } from '@/lib/actions/admin';
import BenDashboard from '@/components/ben-dashboard';
import { redirect } from 'next/navigation';
import { Shield } from 'lucide-react';

export default async function DashboardPage() {
  const participant = await lireParticipant();
  if (!participant) {
    redirect('/rejoindre?suite=/dashboard');
  }

  if (!['admin', 'ben', 'scribe'].includes(participant.role)) {
    redirect('/textes');
  }

  const supabase = createAdminClient();

  // Fetch summary statistics
  const summary = await getDashboardSummary();

  // Fetch pending propositions
  const { data: propositions } = await supabase
    .from('propositions')
    .select(
      `
      *,
      article:articles(*),
      participant:participants(*)
    `
    )
    .eq('statut', 'soumise')
    .order('created_at', { ascending: false });

  // Fetch consolidated texts
  const statutsConsolidated = await getConsolidatedCorpus('STATUTS');
  const riConsolidated = await getConsolidatedCorpus('RI');

  return (
    <div className="p-4 space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-tr from-[#128A3E]/10 to-[#E8730C]/10 border border-orange-100 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="w-5 h-5 text-[#E8730C]" />
          <h2 className="text-base font-bold text-gray-900">Console d'Administration BEN</h2>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Arbitrez les propositions soumises par les sections et supervisez en temps réel le texte consolidé et réordonné de l'AMAC.
        </p>
      </div>

      {/* Main Admin Console */}
      <BenDashboard
        summary={summary}
        propositions={propositions || []}
        statutsConsolidated={statutsConsolidated}
        riConsolidated={riConsolidated}
      />
    </div>
  );
}
