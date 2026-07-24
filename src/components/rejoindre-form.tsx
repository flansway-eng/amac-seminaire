'use client';

import { useActionState } from 'react';
import { rejoindreAction } from '@/lib/actions/session';
import { User, ArrowRight } from 'lucide-react';

interface SectionOption {
  id: number;
  nom: string;
  ville: string;
  slug: string;
}

interface RejoindreFormProps {
  sections: SectionOption[];
  sectionPreselectionneeId: number | null;
  seance: string;
  suite: string;
}

export default function RejoindreForm({
  sections,
  sectionPreselectionneeId,
  seance,
  suite,
}: RejoindreFormProps) {
  const [state, formAction, pending] = useActionState(rejoindreAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="seance" value={seance} />
      <input type="hidden" name="suite" value={suite} />

      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          ⚠️ {state.error}
        </div>
      )}

      <div>
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
          Nom et prénoms
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="nom"
            required
            minLength={3}
            autoFocus
            placeholder="Votre nom complet"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E8730C] focus:bg-white transition-all text-gray-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
          Section
        </label>
        <select
          name="section"
          required
          defaultValue={sectionPreselectionneeId ? String(sectionPreselectionneeId) : ''}
          className="w-full px-3 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E8730C] focus:bg-white transition-all text-gray-900"
        >
          <option value="" disabled>
            Choisissez votre section
          </option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.nom} ({section.ville})
            </option>
          ))}
          <option value="BEN">Bureau Exécutif National</option>
          <option value="OBSERVATEUR">Invité / Observateur</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 bg-[#E8730C] hover:bg-[#c66009] active:scale-[0.98] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {pending ? (
          <span>Entrée en cours...</span>
        ) : (
          <>
            <span>Entrer</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
