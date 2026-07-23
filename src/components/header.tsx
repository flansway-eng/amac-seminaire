'use client';

import { signOut, switchUserRoleAndSection } from '@/lib/actions/auth';
import { LogOut, LayoutDashboard, Settings } from 'lucide-react';
import Link from 'next/link';
import { UserRole } from '@/lib/types';

interface HeaderProps {
  userProfile?: {
    nom: string;
    role: string;
    section_id?: number | null;
    section_nom?: string;
  } | null;
}

export default function Header({ userProfile }: HeaderProps) {
  const isAuthorized = userProfile && ['admin', 'ben', 'comite_controle'].includes(userProfile.role);

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
        {userProfile && (
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-gray-500 leading-none mb-0.5 flex items-center space-x-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping inline-block mr-0.5" />
              <span>{userProfile.nom}</span>
            </span>
            
            <div className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5 transition-colors shadow-sm">
              {/* Role Select */}
              <select
                value={userProfile.role}
                onChange={async (e) => {
                  const newRole = e.target.value as UserRole;
                  await switchUserRoleAndSection(newRole, userProfile.section_id || 1);
                }}
                className="bg-transparent border-none text-[9px] font-bold uppercase tracking-wider text-slate-800 focus:outline-none cursor-pointer"
                title="Changer de rôle"
              >
                <option value="membre">Membre</option>
                <option value="responsable_section">Resp. Section</option>
                <option value="ben">BEN</option>
                <option value="admin">Admin</option>
              </select>

              <span className="text-gray-300 text-[10px] font-light">|</span>

              {/* Section Select */}
              <select
                value={userProfile.section_id || 1}
                onChange={async (e) => {
                  const newSectionId = parseInt(e.target.value);
                  await switchUserRoleAndSection(userProfile.role as UserRole, newSectionId);
                }}
                className="bg-transparent border-none text-[9px] font-bold text-[#E8730C] focus:outline-none cursor-pointer"
                title="Changer de section"
              >
                <option value="1">Abidjan</option>
                <option value="2">Bouaké</option>
                <option value="3">Yakro</option>
                <option value="4">S.Pédro</option>
                <option value="5">Korhogo</option>
                <option value="6">Daloa</option>
              </select>
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
            onClick={() => signOut()}
            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Se déconnecter / Reset"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
