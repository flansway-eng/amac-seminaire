'use client';

import { Search, Filter } from 'lucide-react';

interface TextesFilterFormProps {
  activeTab: string;
  initialQuery: string;
  initialGravite: string;
}

export default function TextesFilterForm({
  activeTab,
  initialQuery,
  initialGravite,
}: TextesFilterFormProps) {
  return (
    <form method="GET" action="/textes" className="space-y-3">
      <input type="hidden" name="tab" value={activeTab} />
      
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          name="q"
          defaultValue={initialQuery}
          placeholder="Rechercher par article, mot-clé..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs focus:outline-none focus:border-[#E8730C] focus:ring-1 focus:ring-[#E8730C] shadow-sm text-gray-900"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-gray-100">
        <Filter className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          Gravité :
        </span>
        <select
          name="gravite"
          defaultValue={initialGravite}
          onChange={(e) => {
            e.currentTarget.form?.submit();
          }}
          className="bg-transparent text-[10px] font-bold text-gray-700 focus:outline-none flex-1 border-none cursor-pointer"
        >
          <option value="">Tous les enjeux</option>
          <option value="critique">Critique 🔴</option>
          <option value="majeur">Majeur 🟠</option>
          <option value="mineur">Mineur 🟡</option>
          <option value="aucun">Sans enjeu 🟢</option>
        </select>
      </div>
    </form>
  );
}
