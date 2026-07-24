'use client';

interface ConcordanceFilterFormProps {
  activeTab: string;
  initialGravite: string;
  initialStatut: string;
}

export default function ConcordanceFilterForm({
  activeTab,
  initialGravite,
  initialStatut,
}: ConcordanceFilterFormProps) {
  return (
    <form
      method="GET"
      action="/concordance"
      className="space-y-3 bg-slate-50 p-4 border border-gray-100 rounded-2xl print:hidden"
    >
      <input type="hidden" name="tab" value={activeTab} />

      <div className="grid grid-cols-2 gap-2">
        {/* Gravity Filter */}
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
            Gravité Enjeu
          </label>
          <select
            name="gravite"
            defaultValue={initialGravite}
            onChange={(e) => e.currentTarget.form?.submit()}
            className="w-full bg-white border border-gray-200 p-2 rounded-xl text-[10px] font-bold text-gray-700 focus:outline-none"
          >
            <option value="">Tous les enjeux</option>
            <option value="critique">Critiques 🔴</option>
            <option value="majeur">Majeurs 🟠</option>
            <option value="mineur">Mineurs 🟡</option>
          </select>
        </div>

        {/* Proposition Status Filter */}
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
            Statut Arbitrage
          </label>
          <select
            name="statut"
            defaultValue={initialStatut}
            onChange={(e) => e.currentTarget.form?.submit()}
            className="w-full bg-white border border-gray-200 p-2 rounded-xl text-[10px] font-bold text-gray-700 focus:outline-none"
          >
            <option value="">Tous les statuts</option>
            <option value="soumise">Soumises</option>
            <option value="pre_arbitree">Pré-arbitrées</option>
            <option value="adoptee">Adoptées V1.0 ✅</option>
            <option value="rejetee">Rejetées ❌</option>
          </select>
        </div>
      </div>
    </form>
  );
}
