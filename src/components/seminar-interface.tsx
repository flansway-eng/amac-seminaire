'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Article, Question, Reponse, Proposition } from '@/lib/types';
import { updateActiveSeminarArticle, submitSeminarVote, adoptSeminarProposition } from '@/lib/actions/votes';
import { Radio, Loader2, Check, Send, AlertTriangle, Edit, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SeminarInterfaceProps {
  userRole: string;
  userId: string;
  initialActiveArticle: Article | null;
  allQuestionArticles: Article[];
  initialPropositions: Proposition[];
}

export default function SeminarInterface({
  userRole,
  userId,
  initialActiveArticle,
  allQuestionArticles,
  initialPropositions,
}: SeminarInterfaceProps) {
  const router = useRouter();
  const [activeArticle, setActiveArticle] = useState<Article | null>(initialActiveArticle);
  const [propositions, setPropositions] = useState<Proposition[]>(initialPropositions);
  const [userVote, setUserVote] = useState<'A' | 'B' | 'abstention' | null>(null);
  const [loading, setLoading] = useState(false);
  const [isScribeMode, setIsScribeMode] = useState(userRole === 'admin' || userRole === 'ben');

  // Scribe console states
  const [scribeText, setScribeText] = useState('');
  const [selectedPropId, setSelectedPropId] = useState('');
  const [votesPour, setVotesPour] = useState(0);
  const [votesContre, setVotesContre] = useState(0);
  const [votesAbstention, setVotesAbstention] = useState(0);
  const [savingAdoption, setSavingAdoption] = useState(false);

  const supabase = createClient();
  const activeQuestion = activeArticle?.questions?.find((q) => q.type === 'choix_ab');

  const fetchLatestSeminarState = async (articleId: number) => {
    try {
      const { data: article } = await supabase
        .from('articles')
        .select(`
          *,
          texte:textes(*),
          enjeux(*),
          questions(*)
        `)
        .eq('id', articleId)
        .single();

      if (article) {
        setActiveArticle(article as unknown as Article);
        
        // Fetch propositions for this new article
        const { data: props } = await supabase
          .from('propositions')
          .select('*, profile:profiles(*)')
          .eq('article_id', articleId);
        
        setPropositions((props || []) as unknown as Proposition[]);
        
        // Find if user already voted
        const q = (article.questions || []).find((q: any) => q.type === 'choix_ab');
        if (q) {
          const { data: myResp } = await supabase
            .from('reponses')
            .select('valeur')
            .eq('question_id', q.id)
            .eq('profile_id', userId)
            .maybeSingle();

          setUserVote(myResp?.valeur?.reponse || null);
          
          // Count total votes to preset scribe fields
          const { data: allResps } = await supabase
            .from('reponses')
            .select('valeur')
            .eq('question_id', q.id);

          countVotesForScribe(allResps || []);
        } else {
          setUserVote(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const countVotesForScribe = (responses: any[]) => {
    let A = 0;
    let B = 0;
    let abs = 0;
    responses.forEach((r) => {
      const v = r.valeur?.reponse;
      if (v === 'A') A++;
      else if (v === 'B') B++;
      else if (v === 'abstention') abs++;
    });
    setVotesPour(A);
    setVotesContre(B);
    setVotesAbstention(abs);
  };

  useEffect(() => {
    if (activeArticle) {
      fetchLatestSeminarState(activeArticle.id);
    }

    // Subscribe to seminaire_session to sync active article
    const sessionChannel = supabase
      .channel('session-sync')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'seminaire_session', filter: 'id=eq.1' },
        (payload: any) => {
          const newId = payload.new.article_actif_id;
          if (newId) fetchLatestSeminarState(newId);
        }
      )
      .subscribe();

    // Subscribe to reponses to sync voting counts for the scribe
    const responsesChannel = supabase
      .channel('responses-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reponses' },
        () => {
          if (activeArticle) fetchLatestSeminarState(activeArticle.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(responsesChannel);
    };
  }, []);

  const handleVote = async (option: 'A' | 'B' | 'abstention') => {
    if (!activeQuestion) return;
    setUserVote(option);
    const res = await submitSeminarVote(activeQuestion.id, option);
    if (!res.success) {
      alert("Erreur de vote : " + res.error);
    }
  };

  const handleActiveArticleChange = async (articleId: number) => {
    setLoading(true);
    await updateActiveSeminarArticle(articleId);
    setLoading(false);
  };

  const handleLoadProposition = (prop: Proposition) => {
    setSelectedPropId(prop.id);
    setScribeText(prop.texte_propose);
  };

  const handleScribeAdopt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeArticle || !selectedPropId) {
      alert("Veuillez sélectionner une proposition à adopter");
      return;
    }
    setSavingAdoption(true);
    const res = await adoptSeminarProposition(
      activeArticle.id,
      selectedPropId,
      votesPour,
      votesContre,
      votesAbstention,
      scribeText
    );
    setSavingAdoption(false);
    if (res.success) {
      setSelectedPropId('');
      setScribeText('');
      alert("Article adopté et version incrémentée à la V1.0 !");
      router.refresh();
    } else {
      alert("Erreur d'adoption: " + res.error);
    }
  };

  if (!activeArticle) {
    return (
      <div className="p-10 text-center space-y-4">
        <Radio className="w-12 h-12 text-slate-350 animate-pulse mx-auto" />
        <h3 className="font-bold text-slate-800 text-sm">Mode Séminaire Suspendu</h3>
        <p className="text-xs text-slate-500">Aucun article n'est actuellement en cours de discussion.</p>
        
        {isScribeMode && (
          <div className="pt-4 border-t max-w-xs mx-auto">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Choisir un article pour démarrer
            </label>
            <select
              onChange={(e) => handleActiveArticleChange(Number(e.target.value))}
              className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
            >
              <option value="">Sélectionner...</option>
              {allQuestionArticles.map((art) => (
                <option key={art.id} value={art.id}>
                  {art.numero_affiche} : {art.titre}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Scribe / Participant Toggle */}
      {(userRole === 'admin' || userRole === 'ben') && (
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setIsScribeMode(false)}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
              !isScribeMode
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Vue Participant
          </button>
          <button
            onClick={() => setIsScribeMode(true)}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
              isScribeMode
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Console Scribe ✍️
          </button>
        </div>
      )}

      {/* ACTIVE ARTICLE CARD */}
      <div className="bg-white border border-gray-150 p-5 rounded-3xl shadow-sm space-y-3">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
          <span>SÉMINAIRE EN DIRECT</span>
          <span className="text-[#E8730C] font-extrabold uppercase">
            {activeArticle.texte?.code} • {activeArticle.numero_affiche}
          </span>
        </div>

        <h3 className="text-sm font-bold text-slate-800 leading-snug">
          {activeArticle.titre}
        </h3>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide block mb-1">
            Texte de Référence 2013
          </span>
          <p className="text-xs text-slate-600 font-serif leading-relaxed line-clamp-3">
            {activeArticle.contenu_actuel}
          </p>
        </div>
      </div>

      {/* SCRIBE MODE CONSOLE */}
      {isScribeMode ? (
        <div className="space-y-4 bg-white border border-gray-150 p-5 rounded-3xl shadow-sm">
          <h3 className="text-xs font-black text-slate-800 border-b pb-2 flex items-center space-x-1.5">
            <span>Console Scribe & Arbitrage</span>
          </h3>

          {/* Change seminar active article */}
          <div className="space-y-1.5">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Article actif en séance
            </label>
            <select
              value={activeArticle.id}
              onChange={(e) => handleActiveArticleChange(Number(e.target.value))}
              disabled={loading}
              className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold text-slate-800"
            >
              {allQuestionArticles.map((art) => (
                <option key={art.id} value={art.id}>
                  {art.numero_affiche} : {art.titre}
                </option>
              ))}
            </select>
          </div>

          {/* Choose proposition to edit/adopt */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Propositions des délégués ({propositions.length})
            </label>
            {propositions.length === 0 ? (
              <p className="text-[10px] text-gray-400 italic">Aucune proposition soumise pour cet article.</p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {propositions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleLoadProposition(p)}
                    className={`w-full text-left p-2 border text-[10px] rounded-xl flex justify-between items-center transition-all ${
                      selectedPropId === p.id
                        ? 'border-[#E8730C] bg-orange-50/20'
                        : 'border-gray-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-semibold text-slate-700">
                      Par {p.profile?.nom || 'Délégué'} ({p.version})
                    </span>
                    <span className="underline text-slate-500 font-bold shrink-0">Charger</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Adopt/Scribe form */}
          {selectedPropId && (
            <form onSubmit={handleScribeAdopt} className="space-y-4 border-t pt-4 animate-fadeIn">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Édition en direct du texte adopté (Scribe)
                </label>
                <textarea
                  value={scribeText}
                  onChange={(e) => setScribeText(e.target.value)}
                  rows={5}
                  required
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-serif focus:outline-none"
                />
              </div>

              {/* Voting counts (auto populated with real time) */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[8px] font-bold text-slate-400 uppercase">Pour (Oui)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={votesPour}
                    onChange={(e) => setVotesPour(Number(e.target.value))}
                    className="w-full p-2 border rounded-xl text-xs bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-400 uppercase">Contre (Non)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={votesContre}
                    onChange={(e) => setVotesContre(Number(e.target.value))}
                    className="w-full p-2 border rounded-xl text-xs bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-400 uppercase">Abstentions</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={votesAbstention}
                    onChange={(e) => setVotesAbstention(Number(e.target.value))}
                    className="w-full p-2 border rounded-xl text-xs bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingAdoption}
                className="w-full py-2.5 bg-[#128A3E] hover:bg-[#0d6b2f] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5"
              >
                {savingAdoption ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Valider l'Adoption Plénière</span>
              </button>
            </form>
          )}
        </div>
      ) : (
        // PARTICIPANT VOTE BOARD
        <div className="space-y-4">
          <div className="bg-white border border-gray-150 p-5 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-800 flex items-center space-x-1.5">
              <Radio className="w-4 h-4 text-red-500 animate-ping mr-1" />
              <span>Scrutin Actif en Séance</span>
            </h3>

            {activeQuestion ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-700 font-bold leading-snug">
                  {activeQuestion.intitule}
                </p>

                {/* Option A */}
                <button
                  type="button"
                  onClick={() => handleVote('A')}
                  className={`w-full text-left p-3 border text-xs rounded-2xl transition-all relative ${
                    userVote === 'A'
                      ? 'border-[#E8730C] bg-orange-50/20 ring-1 ring-[#E8730C]'
                      : 'border-gray-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold text-[#E8730C] mr-2">A.</span>
                  <span className="text-slate-600 font-medium">{activeQuestion.options.option_a}</span>
                  {userVote === 'A' && <Check className="absolute right-3.5 top-3.5 w-4 h-4 text-[#E8730C]" />}
                </button>

                {/* Option B */}
                <button
                  type="button"
                  onClick={() => handleVote('B')}
                  className={`w-full text-left p-3 border text-xs rounded-2xl transition-all relative ${
                    userVote === 'B'
                      ? 'border-[#E8730C] bg-orange-50/20 ring-1 ring-[#E8730C]'
                      : 'border-gray-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold text-[#128A3E] mr-2">B.</span>
                  <span className="text-slate-600 font-medium">{activeQuestion.options.option_b}</span>
                  {userVote === 'B' && <Check className="absolute right-3.5 top-3.5 w-4 h-4 text-[#E8730C]" />}
                </button>

                {/* Abstention */}
                <button
                  type="button"
                  onClick={() => handleVote('abstention')}
                  className={`w-full text-left p-3 border text-xs rounded-2xl transition-all relative ${
                    userVote === 'abstention'
                      ? 'border-gray-400 bg-slate-100 ring-1 ring-gray-400'
                      : 'border-gray-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold text-gray-500 mr-2">Ø.</span>
                  <span className="text-slate-600 font-semibold">S'abstenir de voter</span>
                  {userVote === 'abstention' && <Check className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-500" />}
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-4">
                Aucun scrutin actif d'options n'est ouvert sur cet article. Écoutez les explications en salle.
              </p>
            )}
          </div>

          {userVote && (
            <div className="bg-green-50/20 border border-green-200/50 p-4 rounded-2xl flex items-center justify-center space-x-2 text-green-700 text-xs font-bold animate-fadeIn">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
              <span>Votre vote a été transmis et est projeté en direct à l'écran !</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
