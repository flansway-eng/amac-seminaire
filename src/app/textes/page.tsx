import { getArticles } from '@/lib/actions/articles';
import { TexteCode } from '@/lib/types';
import { SEVERITIES, isContenuPlaceholder } from '@/lib/constants/labels';
import Link from 'next/link';
import { Search, AlertTriangle, BookOpen, Filter } from 'lucide-react';

interface SearchParams {
  tab?: string;
  q?: string;
  gravite?: string;
}

export default async function TextesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const activeTab = (params.tab as TexteCode) || 'STATUTS';
  const query = params.q || '';
  const filterGravite = params.gravite || '';

  // Fetch articles from Database
  const articles = await getArticles(activeTab, query);

  // Apply local filtering for gravity if needed
  const filteredArticles = articles.filter(art => {
    if (!filterGravite) return true;
    if (filterGravite === 'aucun') return !art.enjeux || art.enjeux.length === 0;
    return art.enjeux && art.enjeux.some(e => e.gravite === filterGravite);
  });

  return (
    <div className="p-4 space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-tr from-[#128A3E]/10 to-[#E8730C]/10 border border-orange-100 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 mb-2">
          <BookOpen className="w-5 h-5 text-[#E8730C]" />
          <h2 className="text-base font-bold text-gray-900">Textes Fondateurs</h2>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Consultez l'ensemble des articles des statuts et du règlement intérieur de l'AMAC. Repérez les enjeux juridiques identifiés pour guider vos amendements.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <Link
          href={`/textes?tab=STATUTS${query ? `&q=${query}` : ''}${
            filterGravite ? `&gravite=${filterGravite}` : ''
          }`}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg text-center transition-all ${
            activeTab === 'STATUTS'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Statuts (49)
        </Link>
        <Link
          href={`/textes?tab=RI${query ? `&q=${query}` : ''}${
            filterGravite ? `&gravite=${filterGravite}` : ''
          }`}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg text-center transition-all ${
            activeTab === 'RI'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Règlement Intérieur (47)
        </Link>
      </div>

      {/* Search & Filters */}
      <form method="GET" action="/textes" className="space-y-3">
        <input type="hidden" name="tab" value={activeTab} />
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
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
            defaultValue={filterGravite}
            onChange={(e) => {
              // Trigger auto submit on change if desired, or let form submit normally
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

      {/* Articles List */}
      <div className="space-y-3">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-10 bg-white border border-gray-100 rounded-3xl">
            <p className="text-xs text-gray-400 font-medium">Aucun article trouvé</p>
          </div>
        ) : (
          filteredArticles.map((art) => {
            const hasEnjeux = art.enjeux && art.enjeux.length > 0;
            const worstEnjeu = hasEnjeux
              ? art.enjeux!.reduce((prev, current) => {
                  const ranks = { critique: 3, majeur: 2, mineur: 1 };
                  return ranks[current.gravite] > ranks[prev.gravite] ? current : prev;
                })
              : null;
              
            const severity = worstEnjeu ? SEVERITIES[worstEnjeu.gravite] : null;

            return (
              <Link
                key={art.id}
                href={`/textes/${art.id}`}
                className="block bg-white hover:bg-slate-50/50 p-4 border border-gray-150 rounded-2xl shadow-sm transition-all active:scale-[0.99] group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#E8730C]">
                      {art.numero_affiche}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 leading-snug group-hover:text-[#E8730C] transition-colors">
                      {art.titre || 'Sans titre'}
                    </h4>
                  </div>

                  {severity && (
                    <span
                      className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase flex items-center space-x-0.5 border ${severity.color}`}
                    >
                      <span>{severity.icon}</span>
                      <span>{severity.label}</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {art.contenu_actuel}
                </p>

                {isContenuPlaceholder(art.contenu_actuel) && (
                  <div className="mt-2 flex items-center space-x-1 text-[9px] text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 w-fit">
                    <span>⚠️</span>
                    <span>Texte provisoire</span>
                  </div>
                )}

                {hasEnjeux && (
                  <div className="mt-2 flex items-center space-x-1 text-[9px] text-amber-600 font-semibold bg-amber-50/50 px-2 py-1 rounded-lg border border-amber-100/50 w-fit">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{art.enjeux!.length} enjeu(x) juridique(s)</span>
                  </div>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
