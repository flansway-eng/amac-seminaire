'use client';

import { useState } from 'react';
import { DashboardSummary, preArbitrateProposition, adoptPropositionDirectly } from '@/lib/actions/admin';
import { TypeMajorite } from '@/lib/utils/majorite';
import { Proposition, Article } from '@/lib/types';
import { Check, X, Shield, RefreshCw, Send, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BenDashboardProps {
  summary: DashboardSummary;
  propositions: any[];
  statutsConsolidated: any[];
  riConsolidated: any[];
}

export default function BenDashboard({
  summary,
  propositions,
  statutsConsolidated,
  riConsolidated,
}: BenDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'arbitrages' | 'consolidated'>('arbitrages');
  const [corpusTab, setCorpusTab] = useState<'STATUTS' | 'RI'>('STATUTS');
  
  // Adoption modal state
  const [adoptingProp, setAdoptingProp] = useState<Proposition | null>(null);
  const [votesPour, setVotesPour] = useState<number>(35);
  const [votesContre, setVotesContre] = useState<number>(5);
  const [abstentions, setAbstentions] = useState<number>(2);
  const [quorumAtteint, setQuorumAtteint] = useState(true);
  const [typeMajorite, setTypeMajorite] = useState<TypeMajorite>('absolue');
  const [savingAdoption, setSavingAdoption] = useState(false);
  const [errorAdoption, setErrorAdoption] = useState<string | null>(null);
  const [resultatAdoption, setResultatAdoption] = useState<string | null>(null);

  const handlePreArbitrate = async (propId: string, status: 'pre_arbitree' | 'rejetee') => {
    const res = await preArbitrateProposition(propId, status);
    if (res.success) {
      router.refresh();
    } else {
      alert("Erreur d'arbitrage: " + res.error);
    }
  };

  const handleDirectAdopt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adoptingProp) return;
    setSavingAdoption(true);
    setErrorAdoption(null);

    const res = await adoptPropositionDirectly(
      adoptingProp.article_id,
      adoptingProp.id,
      votesPour,
      votesContre,
      abstentions,
      quorumAtteint,
      typeMajorite
    );

    setSavingAdoption(false);
    if (res.success) {
      const messages: Record<string, string> = {
        adopte: 'Proposition adoptée (V1.0).',
        rejete: "Proposition rejetée : la majorité requise n'a pas été atteinte.",
        reporte: 'Décision reportée : le quorum n\'était pas atteint.',
      };
      setResultatAdoption(messages[res.decision || 'adopte']);
      setAdoptingProp(null);
      router.refresh();
    } else {
      setErrorAdoption(res.error || "Erreur de sauvegarde");
    }
  };

  const activeCorpus = corpusTab === 'STATUTS' ? statutsConsolidated : riConsolidated;
  const completedRate = Math.round((summary.decidedArticlesCount / summary.totalArticles) * 100);

  return (
    <div className="space-y-6">
      {resultatAdoption && (
        <p role="status" aria-live="polite" className="text-xs font-bold text-center text-slate-700 bg-slate-50 border border-gray-200 rounded-2xl p-3">
          {resultatAdoption}
        </p>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 border border-gray-150 rounded-2xl shadow-sm">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Avancement Global</span>
          <p className="text-xl font-black text-[#128A3E] mt-0.5">{completedRate}%</p>
          <span className="text-[8px] text-slate-500 font-medium">
            {summary.decidedArticlesCount} / {summary.totalArticles} fiches votées
          </span>
        </div>

        <div className="bg-white p-4 border border-gray-150 rounded-2xl shadow-sm">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">En attente</span>
          <p className="text-xl font-black text-[#E8730C] mt-0.5">{summary.pendingPropositionsCount}</p>
          <span className="text-[8px] text-slate-500 font-medium">propositions soumises</span>
        </div>

        <div className="bg-white p-4 border border-gray-150 rounded-2xl shadow-sm">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">En souffrance</span>
          <p className="text-xl font-black text-red-600 mt-0.5">{summary.articlesEnSouffranceCount}</p>
          <span className="text-[8px] text-slate-500 font-medium">enjeux sans proposition</span>
        </div>

        <div className="bg-white p-4 border border-gray-150 rounded-2xl shadow-sm">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Réponses</span>
          <p className="text-xl font-black text-blue-600 mt-0.5">{summary.totalAnswered}</p>
          <span className="text-[8px] text-slate-500 font-medium">questions traitées</span>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('arbitrages')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'arbitrages'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Arbitrages ({propositions.length})
        </button>
        <button
          onClick={() => setActiveTab('consolidated')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'consolidated'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Texte Consolidé V1.0
        </button>
      </div>

      {/* ARBITRAGES TAB VIEW */}
      {activeTab === 'arbitrages' && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Propositions en attente d'arbitrage
          </h3>
          
          {propositions.length === 0 ? (
            <div className="text-center py-10 bg-white border border-gray-100 rounded-3xl">
              <p className="text-xs text-gray-400 font-medium">Aucune proposition à arbitrer pour le moment.</p>
            </div>
          ) : (
            propositions.map((prop) => (
              <div key={prop.id} className="bg-white border border-gray-150 p-4 rounded-2xl shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-[#E8730C]">
                      {prop.article?.numero_affiche} {prop.article?.titre ? `- ${prop.article.titre}` : ''}
                    </span>
                    <p className="text-[9px] text-gray-400 font-semibold mt-0.5">
                      Par {prop.participant?.nom || 'Délégué'} • Version {prop.version}
                    </p>
                  </div>
                  <span className="text-[8px] bg-slate-100 px-2 py-0.5 rounded-lg text-slate-500 font-bold uppercase">
                    {prop.article?.texte_id === 1 ? 'Statuts' : 'RI'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                  <span className="text-[9px] font-bold text-gray-400 uppercase block">Texte Proposé</span>
                  <p className="text-xs text-slate-800 font-serif leading-relaxed">
                    {prop.texte_propose}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase block">Motif de réforme</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {prop.expose_motifs}
                  </p>
                </div>

                {/* Arbitrage action bar */}
                <div className="flex space-x-2 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => handlePreArbitrate(prop.id, 'pre_arbitree')}
                    className="flex-1 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Pré-arbitrer</span>
                  </button>

                  <button
                    onClick={() => setAdoptingProp(prop)}
                    className="flex-1 py-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Adopter</span>
                  </button>

                  <button
                    onClick={() => handlePreArbitrate(prop.id, 'rejetee')}
                    className="p-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl transition-all"
                    title="Rejeter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CONSOLIDATED TAB VIEW */}
      {activeTab === 'consolidated' && (
        <div className="space-y-4">
          <div className="flex bg-slate-50 border border-gray-150 p-1 rounded-xl">
            <button
              onClick={() => setCorpusTab('STATUTS')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                corpusTab === 'STATUTS'
                  ? 'bg-[#E8730C] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Statuts V1.0
            </button>
            <button
              onClick={() => setCorpusTab('RI')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                corpusTab === 'RI'
                  ? 'bg-[#E8730C] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Règlement Intérieur V1.0
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Aperçu des articles renumérotés ({activeCorpus.length})
            </h4>

            {activeCorpus.map((art) => (
              <div key={art.id} className="bg-white border border-gray-150 p-4 rounded-2xl shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-[#E8730C]">
                      {art.numeroAffiche}
                    </span>
                    {art.oldNumero !== art.newNumero && (
                      <span className="text-[8px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded-lg">
                        Ex-Article {art.oldNumero}
                      </span>
                    )}
                  </div>
                  
                  {art.isAmended ? (
                    <span className="text-[8px] bg-green-50 text-[#128A3E] border border-green-200 px-2 py-0.5 rounded-lg font-bold uppercase flex items-center space-x-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Amendé V1.0</span>
                    </span>
                  ) : (
                    <span className="text-[8px] bg-slate-50 text-slate-400 border border-gray-100 px-2 py-0.5 rounded-lg font-bold uppercase">
                      Original V0.9
                    </span>
                  )}
                </div>

                <h5 className="text-xs font-bold text-slate-800 leading-snug">
                  {art.titre || 'Sans titre'}
                </h5>

                <p className="text-xs text-slate-600 leading-relaxed font-serif whitespace-pre-wrap">
                  {art.contenuConsolide}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADOPTION DIALOG MODAL */}
      {adoptingProp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleDirectAdopt} className="w-full max-w-sm bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-scaleIn space-y-4 p-6">
            <h3 className="text-sm font-black text-gray-900 border-b pb-2 flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-[#E8730C]" />
              <span>Adoption officielle de l'Article {adoptingProp.article_id}</span>
            </h3>

            <p className="text-[10px] text-slate-500 leading-relaxed">
              Enregistrez les résultats du vote de l'Assemblée Générale pour cet article. Cette action basculera le texte en version amendée officielle V1.0.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Votes POUR (Oui)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={votesPour}
                  onChange={(e) => setVotesPour(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Votes CONTRE (Non)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={votesContre}
                  onChange={(e) => setVotesContre(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Abstentions
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={abstentions}
                  onChange={(e) => setAbstentions(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <label className="flex items-center space-x-2 text-[10px] font-bold text-gray-600 bg-slate-50 border border-gray-200 rounded-xl p-2.5">
                <input
                  type="checkbox"
                  checked={quorumAtteint}
                  onChange={(e) => setQuorumAtteint(e.target.checked)}
                  className="w-3.5 h-3.5"
                />
                <span>Quorum atteint en séance</span>
              </label>

              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Type de majorité requise
                </label>
                <select
                  value={typeMajorite}
                  onChange={(e) => setTypeMajorite(e.target.value as TypeMajorite)}
                  className="w-full p-2 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                >
                  <option value="simple">Majorité simple</option>
                  <option value="absolue">Majorité absolue (50%+1)</option>
                  <option value="qualifiee_2_3">Majorité qualifiée (2/3)</option>
                </select>
              </div>
            </div>

            {errorAdoption && (
              <div className="p-2 bg-red-50 text-red-700 text-[10px] rounded-lg">
                ⚠️ {errorAdoption}
              </div>
            )}

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setAdoptingProp(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={savingAdoption}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1"
              >
                <span>Confirmer l'Adoption</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
