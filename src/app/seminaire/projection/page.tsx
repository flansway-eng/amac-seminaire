'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Article, Question, Reponse } from '@/lib/types';
import { Loader2, Radio, Check, Circle } from 'lucide-react';

export default function ProjectionPage() {
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [votes, setVotes] = useState<{ A: number; B: number; abstention: number; total: number }>({
    A: 0,
    B: 0,
    abstention: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchSeminarState = async () => {
    try {
      // Fetch active article ID
      const { data: session } = await supabase
        .from('seminaire_session')
        .select('article_actif_id')
        .eq('id', 1)
        .single();

      if (!session || !session.article_actif_id) return;

      // Fetch article, including text, enjeux, questions
      const { data: article } = await supabase
        .from('articles')
        .select(`
          *,
          texte:textes(*),
          enjeux(*),
          questions(*)
        `)
        .eq('id', session.article_actif_id)
        .single();

      if (!article) return;
      setActiveArticle(article as unknown as Article);

      // Find the first choix_ab question
      const q = (article.questions || []).find((q: any) => q.type === 'choix_ab');
      setQuestion(q || null);

      if (q) {
        // Fetch votes for this question
        const { data: responses } = await supabase
          .from('reponses')
          .select('valeur')
          .eq('question_id', q.id);

        calculateVotes(responses || []);
      }
    } catch (e) {
      console.error('Error fetching projection state:', e);
    } finally {
      setLoading(false);
    }
  };

  const calculateVotes = (responses: any[]) => {
    let A = 0;
    let B = 0;
    let abstention = 0;

    responses.forEach((r) => {
      const rep = r.valeur?.reponse;
      if (rep === 'A') A++;
      else if (rep === 'B') B++;
      else if (rep === 'abstention') abstention++;
    });

    setVotes({
      A,
      B,
      abstention,
      total: A + B + abstention,
    });
  };

  useEffect(() => {
    fetchSeminarState();

    // Subscribe to seminaire_session updates
    const sessionChannel = supabase
      .channel('session-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'seminaire_session', filter: 'id=eq.1' },
        () => {
          fetchSeminarState();
        }
      )
      .subscribe();

    // Subscribe to reponses inserts/updates
    const responsesChannel = supabase
      .channel('responses-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reponses' },
        () => {
          fetchSeminarState(); // reload to recount
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(responsesChannel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8730C]" />
      </div>
    );
  }

  if (!activeArticle) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-2">
        <Radio className="w-12 h-12 text-slate-500 animate-pulse" />
        <h2 className="text-lg font-bold">Séminaire AMAC en sommeil</h2>
        <p className="text-xs text-slate-400">Aucun article actif n'a été défini par le Scribe.</p>
      </div>
    );
  }

  // Calculate percentages
  const pctA = votes.total > 0 ? Math.round((votes.A / votes.total) * 100) : 0;
  const pctB = votes.total > 0 ? Math.round((votes.B / votes.total) * 100) : 0;
  const pctAbs = votes.total > 0 ? Math.round((votes.abstention / votes.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 flex flex-col justify-between font-sans">
      {/* Top Header Block */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#128A3E] to-[#E8730C] flex items-center justify-center text-white font-black text-lg shadow-lg">
            A
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">AMAC Séminaire</h1>
            <span className="text-[10px] text-[#E8730C] font-extrabold tracking-widest uppercase">
              TOILETTAGE DES TEXTES • LOI 60-315
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping mr-1" />
          <span className="text-[11px] font-black text-[#E8730C] uppercase tracking-wider">
            VOTE PLÉNIER EN DIRECT
          </span>
        </div>
      </div>

      {/* Article metadata info */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 mb-8 space-y-2">
        <div className="flex items-center justify-between text-xs text-[#E8730C] font-bold uppercase tracking-wider">
          <span>{activeArticle.texte?.titre}</span>
          <span className="bg-slate-800 px-3 py-1 rounded-xl">
            {activeArticle.numero_affiche}
          </span>
        </div>
        <h2 className="text-xl font-bold">
          {activeArticle.titre || 'Sans titre'}
        </h2>
        <p className="text-xs text-slate-400 font-serif leading-relaxed line-clamp-3">
          Original : "{activeArticle.contenu_actuel}"
        </p>
      </div>

      {/* Options columns A/B */}
      {question ? (
        <div className="grid grid-cols-2 gap-8 flex-1 items-stretch">
          {/* Option A */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[#E8730C] text-white font-bold text-sm flex items-center justify-center shadow">
                  A
                </span>
                <h3 className="font-bold text-sm text-slate-300">OPTION DE RÉFORME A</h3>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {question.options.option_a}
              </p>
            </div>

            {/* Live voting meter */}
            <div className="mt-8 space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-2xl font-black text-[#E8730C]">{pctA}%</span>
                <span className="text-[10px] text-slate-400 font-semibold">{votes.A} voix</span>
              </div>
              <div className="w-full h-4 bg-slate-850 rounded-full overflow-hidden">
                <div
                  style={{ width: `${pctA}%` }}
                  className="h-full bg-gradient-to-r from-orange-600 to-[#E8730C] rounded-full transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Option B */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[#128A3E] text-white font-bold text-sm flex items-center justify-center shadow">
                  B
                </span>
                <h3 className="font-bold text-sm text-slate-300">OPTION DE RÉFORME B</h3>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {question.options.option_b}
              </p>
            </div>

            {/* Live voting meter */}
            <div className="mt-8 space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-2xl font-black text-[#128A3E]">{pctB}%</span>
                <span className="text-[10px] text-slate-400 font-semibold">{votes.B} voix</span>
              </div>
              <div className="w-full h-4 bg-slate-850 rounded-full overflow-hidden">
                <div
                  style={{ width: `${pctB}%` }}
                  className="h-full bg-gradient-to-r from-green-600 to-[#128A3E] rounded-full transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-900/20 border border-slate-800/50 rounded-3xl">
          <p className="text-sm text-slate-400">Aucun scrutin d'options A/B configuré pour cet article.</p>
        </div>
      )}

      {/* Bottom stats details */}
      <div className="mt-8 border-t border-slate-800 pt-6 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
        <div className="flex space-x-6">
          <span>Total Votants : <span className="text-white">{votes.total}</span></span>
          <span>Abstentions : <span className="text-white">{votes.abstention} ({pctAbs}%)</span></span>
        </div>
        <span>AMAC Gouvernance 2.0 • Session plénière</span>
      </div>
    </div>
  );
}
