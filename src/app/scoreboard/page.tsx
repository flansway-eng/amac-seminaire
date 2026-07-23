import { getScoreboardData } from '@/lib/actions/admin';
import SectionScoreboard from '@/components/section-scoreboard';
import { Trophy, Users } from 'lucide-react';

export default async function ScoreboardPage() {
  // Fetch initial stats
  const initialStats = await getScoreboardData();

  return (
    <div className="p-4 space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-tr from-[#128A3E]/10 to-[#E8730C]/10 border border-orange-100 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 mb-2">
          <Trophy className="w-5 h-5 text-[#E8730C]" />
          <h2 className="text-base font-bold text-gray-900">Scoreboard Public</h2>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Suivez en direct la participation et le taux d'avancement des différentes sections régionales. Une saine émulation collective pour moderniser l'AMAC !
        </p>
      </div>

      {/* Leaderboard */}
      <SectionScoreboard initialStats={initialStats} />
    </div>
  );
}
