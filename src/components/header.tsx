'use client';

import { quitterAction } from '@/lib/actions/session';
import { LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  participant?: {
    nom: string;
    role: string;
    sectionNom: string | null;
  } | null;
}

export default function Header({ participant }: HeaderProps) {
  const isAuthorized = participant && ['admin', 'ben', 'scribe'].includes(participant.role);

  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm px-4 flex items-center justify-between md:max-w-md md:mx-auto md:border-x">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#128A3E] to-[#E8730C] flex items-center justify-center text-white font-bold text-sm shadow-md animate-pulse">
          A
        </div>
        <div>
          <h1 className="font-bold text-sm text-gray-900 tracking-tight leading-none">AMAC</h1>
          <span className="text-[9px] text-[#E8730C] font-bold tracking-wider">ZÉRO FRICTION</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {participant && (
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-gray-500 leading-none mb-0.5 flex items-center space-x-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping inline-block mr-0.5" />
              <span>{participant.nom}</span>
            </span>

            <div className="bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                {participant.role}
                {participant.sectionNom ? ` · ${participant.sectionNom}` : ''}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-0.5">
          {isAuthorized && (
            <Link
              href="/dashboard"
              className="p-1.5 text-gray-600 hover:text-[#128A3E] hover:bg-gray-50 rounded-lg transition-colors"
              title="Tableau de bord BEN"
            >
              <LayoutDashboard className="w-4 h-4" />
            </Link>
          )}

          <button
            onClick={() => quitterAction()}
            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Ce n'est pas moi"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
