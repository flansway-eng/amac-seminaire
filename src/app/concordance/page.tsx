import { createAdminClient } from '@/lib/supabase/admin';
import { getArticles } from '@/lib/actions/articles';
import { TexteCode } from '@/lib/types';
import { SEVERITIES, ENJEU_TYPES, PROPOSITION_STATUS } from '@/lib/constants/labels';
import Link from 'next/link';
import { FileText, Download, Printer, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import ConcordanceFilterForm from '@/components/concordance-filter-form';

interface SearchParams {
  tab?: string;
  gravite?: string;
  statut?: string;
}

export default async function ConcordancePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const activeTab = (params.tab as TexteCode) || 'STATUTS';
  const filterGravite = params.gravite || '';
  const filterStatut = params.statut || '';

  const supabase = createAdminClient();

  // Query textes table
  const { data: texteData } = await supabase
    .from('textes')
    .select('id, titre')
    .eq('code', activeTab)
    .single();

  if (!texteData) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-red-600 font-medium">Corpus introuvable.</p>
      </div>
    );
  }

  // Fetch articles, joined with enjeux, propositions and decisions
  const { data: articles } = await supabase
    .from('articles')
    .select(`
      *,
      enjeux(*),
      propositions(*, participant:participants(*)),
      decisions(*, proposition:propositions(*))
    `)
    .eq('texte_id', texteData.id)
    .order('ordre', { ascending: true });

  const typedArticles = (articles || []) as any[];

  // Filter local logic for gravity & status
  let filteredArticles = typedArticles;
  if (filterGravite) {
    filteredArticles = typedArticles.filter(art =>
      art.enjeux && art.enjeux.some((e: any) => e.gravite === filterGravite)
    );
  }
  if (filterStatut) {
    filteredArticles = filteredArticles.filter(art =>
      art.propositions && art.propositions.some((p: any) => p.statut === filterStatut)
    );
  }

  // Generate word download link URL
  const wordExportUrl = `/api/export/docx?tab=${activeTab}${
    filterGravite ? `&gravite=${filterGravite}` : ''
  }${filterStatut ? `&statut=${filterStatut}` : ''}`;

  return (
    <div className="p-4 space-y-6">
      {/* Printable Heading (hidden on screen, visible in print) */}
      <div className="hidden print:block text-center space-y-2 border-b pb-4 mb-6">
        <h1 className="text-xl font-bold text-[#128A3E]">LES AMIS DE LA MUSIQUE AFRO-CUBAINE (AMAC)</h1>
        <p className="text-[10px] text-gray-500 uppercase">Association ivoirienne régie par la loi n° 60-315 du 21 septembre 1960</p>
        <p className="text-xs font-bold text-[#E8730C]">REF : REF/PR/Amac_National</p>
        <h2 className="text-base font-bold uppercase mt-4">Table de Concordance — {texteData.titre}</h2>
      </div>

      {/* Screen Intro (hidden on print) */}
      <div className="bg-gradient-to-tr from-[#128A3E]/10 to-[#E8730C]/10 border border-orange-100 rounded-3xl p-5 shadow-sm print:hidden">
        <div className="flex items-center space-x-2 mb-2">
          <FileText className="w-5 h-5 text-[#E8730C]" />
          <h2 className="text-base font-bold text-gray-900">Table de Concordance</h2>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Le livrable central du séminaire. Comparez l'état actuel des textes de 2013 avec les enjeux soulevés, les propositions de modernisation et les votes d'adoption.
        </p>
      </div>

      {/* Navigation Tabs (hidden on print) */}
      <div className="flex bg-slate-100 p-1 rounded-xl print:hidden">
        <Link
          href={`/concordance?tab=STATUTS${
            filterGravite ? `&gravite=${filterGravite}` : ''
          }${filterStatut ? `&statut=${filterStatut}` : ''}`}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg text-center transition-all ${
            activeTab === 'STATUTS'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Statuts
        </Link>
        <Link
          href={`/concordance?tab=RI${
            filterGravite ? `&gravite=${filterGravite}` : ''
          }${filterStatut ? `&statut=${filterStatut}` : ''}`}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg text-center transition-all ${
            activeTab === 'RI'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Règlement Intérieur
        </Link>
      </div>

      {/* Filters Form (hidden on print) */}
      <ConcordanceFilterForm
        activeTab={activeTab}
        initialGravite={filterGravite}
        initialStatut={filterStatut}
      />

      {/* Document Action Buttons (hidden on print) */}
      <div className="flex space-x-2 print:hidden">
        <a
          href={wordExportUrl}
          className="flex-1 py-3 bg-[#E8730C] hover:bg-[#c66009] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>Exporter DOCX</span>
        </a>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') window.print();
          }}
          className="flex-1 py-3 bg-[#128A3E] hover:bg-[#0d6b2f] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 active:scale-[0.98]"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimer PDF</span>
        </button>
      </div>

      {/* Accordance Table (Responsive cards on mobile, table in print) */}
      <div className="space-y-4">
        {/* Mobile View: Cards (hidden on print) */}
        <div className="space-y-3 print:hidden">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-10 bg-white border border-gray-100 rounded-3xl">
              <p className="text-xs text-gray-400 font-medium">Aucun enregistrement</p>
            </div>
          ) : (
            filteredArticles.map((art) => {
              const hasEnjeux = art.enjeux && art.enjeux.length > 0;
              const latestDecision = art.decisions && art.decisions.length > 0 ? art.decisions[0] : null;
              const adoptedProp = latestDecision && latestDecision.decision === 'adopte'
                ? art.propositions.find((p: any) => p.id === latestDecision.proposition_id)
                : null;

              return (
                <div key={art.id} className="bg-white border border-gray-150 p-4 rounded-2xl shadow-sm space-y-4">
                  {/* Article Label */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#E8730C]">{art.numero_affiche}</span>
                    <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded-lg text-slate-500 font-bold">
                      {adoptedProp ? 'Version V1.0 Adoptée' : 'Version V0.9 Amendable'}
                    </span>
                  </div>

                  {/* Problem / Enjeux */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Problème identifié
                    </h4>
                    {hasEnjeux ? (
                      art.enjeux.map((e: any) => (
                        <p key={e.id} className="text-xs text-slate-700 bg-red-50/30 border border-red-100/50 p-2.5 rounded-xl mt-1 leading-relaxed">
                          <span className="font-bold text-[9px] text-[#E8730C] uppercase block mb-0.5">
                            {ENJEU_TYPES[e.type as keyof typeof ENJEU_TYPES]} ({e.gravite})
                          </span>
                          {e.description}
                        </p>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">Aucun enjeu majeur identifié.</p>
                    )}
                  </div>

                  {/* Proposed Redaction */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Proposition de Rédaction V1.0
                    </h4>
                    {adoptedProp ? (
                      <div className="bg-green-50/20 border border-green-100 p-2.5 rounded-xl">
                        <p className="text-xs text-slate-800 font-serif leading-relaxed">
                          {adoptedProp.texte_propose}
                        </p>
                        <p className="text-[9px] text-green-700 font-medium italic mt-2 border-t pt-1">
                          Motif : {adoptedProp.expose_motifs}
                        </p>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic space-y-1">
                        {art.propositions && art.propositions.length > 0 ? (
                          art.propositions.map((p: any) => (
                            <div key={p.id} className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="font-semibold block text-[9px] text-slate-600">
                                Version {p.version} soumise par {p.participant?.nom || 'Membre'}
                              </span>
                              <p className="line-clamp-2 mt-0.5">{p.texte_propose}</p>
                            </div>
                          ))
                        ) : (
                          <span>Aucune proposition de texte validée pour le moment.</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Decision */}
                  <div className="border-t pt-3 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Arbitrage / Séminaire
                    </span>
                    {latestDecision ? (
                      <div className="flex items-center space-x-1 font-bold text-[#128A3E]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Adopté ({latestDecision.votes_pour} pour)</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 font-semibold text-amber-600">
                        <Clock className="w-3.5 h-3.5" />
                        <span>En attente de vote</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Print/Desktop View (Visible in print, hidden on screen by default unless large device) */}
        <div className="hidden print:block w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-gray-300">
                <th className="p-2 border font-bold text-slate-700 w-1/12">Article</th>
                <th className="p-2 border font-bold text-slate-700 w-3/12">Problème Identifié</th>
                <th className="p-2 border font-bold text-slate-700 w-5/12">Proposition de Rédaction V1.0</th>
                <th className="p-2 border font-bold text-slate-700 w-3/12">Décision & Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((art) => {
                const hasEnjeux = art.enjeux && art.enjeux.length > 0;
                const latestDecision = art.decisions && art.decisions.length > 0 ? art.decisions[0] : null;
                const adoptedProp = latestDecision && latestDecision.decision === 'adopte'
                  ? art.propositions.find((p: any) => p.id === latestDecision.proposition_id)
                  : null;

                const problemCells = hasEnjeux
                  ? art.enjeux.map((e: any) => `[${ENJEU_TYPES[e.type as keyof typeof ENJEU_TYPES]}] ${e.description}`).join('\n\n')
                  : 'Aucun enjeu majeur.';

                const proposalCells = adoptedProp
                  ? adoptedProp.texte_propose
                  : (art.propositions && art.propositions.length > 0
                      ? art.propositions.map((p: any) => `[${p.version}] : ${p.texte_propose}`).join('\n\n')
                      : 'Aucune proposition.');

                return (
                  <tr key={art.id} className="border-b border-gray-200 align-top">
                    <td className="p-2 border font-bold text-[#E8730C]">
                      {art.numero_affiche}
                      <span className="block font-normal text-slate-600 text-[10px]">{art.titre}</span>
                    </td>
                    <td className="p-2 border whitespace-pre-wrap leading-relaxed text-slate-700">
                      {problemCells}
                    </td>
                    <td className="p-2 border whitespace-pre-wrap font-serif leading-relaxed text-slate-800">
                      {proposalCells}
                    </td>
                    <td className="p-2 border whitespace-pre-wrap leading-relaxed">
                      {latestDecision ? (
                        <div>
                          <p className="font-bold text-green-700">ADOPTÉE (V1.0)</p>
                          <p className="text-[10px] text-gray-500">Votes : {latestDecision.votes_pour} pour, {latestDecision.votes_contre} contre.</p>
                        </div>
                      ) : (
                        <p className="italic text-gray-500">En attente de vote plénier.</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
