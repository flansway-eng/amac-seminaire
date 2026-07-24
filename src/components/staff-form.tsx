'use client';

import { useActionState } from 'react';
import { staffAction } from '@/lib/actions/session';
import { KeyRound } from 'lucide-react';

export default function StaffForm() {
  const [state, formAction, pending] = useActionState(staffAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          ⚠️ {state.error}
        </div>
      )}

      <div>
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
          Code à 6 chiffres
        </label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="code"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            autoFocus
            placeholder="••••••"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm tracking-[0.3em] font-mono focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-gray-900"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
      >
        {pending ? 'Vérification...' : 'Valider'}
      </button>
    </form>
  );
}
