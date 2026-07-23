'use client';

import { useState, useEffect } from 'react';
import { SectionStat, getScoreboardData } from '@/lib/actions/admin';
import { createClient } from '@/lib/supabase/client';
import { Trophy, Award, Zap, Star, MessageSquare, ShieldAlert } from 'lucide-react';

interface SectionScoreboardProps {
  initialStats: SectionStat[];
}

export default function SectionScoreboard({ initialStats }: SectionScoreboardProps) {
  const [stats, setStats] = useState<SectionStat[]>(initialStats);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pulsing, setPulsing] = useState(false);

  const refreshStats = async () => {
    setIsUpdating(true);
    setPulsing(true);
    try {
      const updated = await getScoreboardData();
      setStats(updated);
    } catch (error) {
      console.error('Error refreshing scoreboard:', error);
    } finally {
      setIsUpdating(false);
      setTimeout(() => setPulsing(false), 800);
    }
  };

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reponses',
        },
        () => {
          // Trigger reload on response change
          refreshStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getRankBadge = (index: number) => {
    if (index === 0) return { icon: Trophy, color: 'text-yellow-500 bg-yellow-50 border-yellow-200', label: '1er' };
    if (index === 1) return { icon: Award, color: 'text-slate-400 bg-slate-50 border-slate-200', label: '2e' };
    if (index === 2) return { icon: Award, color: 'text-amber-600 bg-amber-50 border-amber-200', label: '3e' };
    return { icon: Star, color: 'text-gray-400 bg-gray-50 border-gray-150', label: `${index + 1}e` };
  };

  return (
    <div className="space-y-4">
      {/* Live Indicator */}
      <div className="flex items-center justify-between bg-slate-50 border border-gray-150 px-4 py-2.5 rounded-2xl">
        <div className="flex items-center space-x-1.5">
          <Zap className={`w-3.5 h-3.5 text-[#E8730C] ${pulsing ? 'animate-bounce' : 'animate-pulse'}`} />
          <span className="text-[10px] font-bold text-slate-600 tracking-wide uppercase">
            Mises à jour en direct activées
          </span>
        </div>
        {isUpdating && (
          <span className="text-[9px] text-gray-400 font-semibold italic animate-pulse">
            Actualisation...
          </span>
        )}
      </div>

      {/* Leaderboard list */}
      <div className="space-y-3">
        {stats.map((sec, index) => {
          const badge = getRankBadge(index);
          const IconComponent = badge.icon;
          
          return (
            <div
              key={sec.id}
              className={`bg-white border p-4 rounded-2xl shadow-sm transition-all duration-300 flex flex-col space-y-3 relative overflow-hidden ${
                index === 0 ? 'ring-1 ring-yellow-400/50 bg-gradient-to-r from-yellow-50/5 to-transparent' : ''
              }`}
            >
              {/* Leaderboard Rank Block */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs ${badge.color}`}>
                    <IconComponent className="w-3.5 h-3.5 mr-0.5 shrink-0" />
                    <span>{badge.label}</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-none">
                      {sec.nom}
                    </h4>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {sec.ville} • {sec.memberCount} délégué(s)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-[#E8730C]">
                    {sec.completionRate}%
                  </span>
                  <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wide leading-none">
                    Complété
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${sec.completionRate}%` }}
                  className={`h-full transition-all duration-500 rounded-full ${
                    index === 0 ? 'bg-yellow-500' : 'bg-gradient-to-r from-[#128A3E] to-[#E8730C]'
                  }`}
                />
              </div>

              {/* Section quality comment stat */}
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 border-t border-gray-50 pt-2">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3 text-slate-400" />
                  <span>Qualité : </span>
                  <span className="text-[#128A3E]">{sec.qualityScore}% motivé</span>
                </div>
                
                <span className="text-slate-400">
                  {sec.motivatedCount} commentaire(s)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
