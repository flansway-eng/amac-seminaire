import { createAdminClient } from '@/lib/supabase/admin';
import { lireParticipant } from '@/lib/session';
import { getArticles } from '@/lib/actions/articles';
import { getUserResponsesForArticle } from '@/lib/actions/responses';
import QuestionnaireFlow from '@/components/questionnaire-flow';
import Link from 'next/link';
import { CheckCircle2, Circle, ArrowLeft, Users } from 'lucide-react';
import { redirect } from 'next/navigation';

interface SearchParams {
  article?: string;
}

export default async function MaSectionPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const selectedArticleId = params.article ? Number(params.article) : null;

  const participant = await lireParticipant();
  if (!participant) {
    redirect('/rejoindre?suite=/ma-section');
  }

  const supabase = createAdminClient();

  let sectionName = 'Bureau Exécutif National / Observateur';
  if (participant.sectionId) {
    const { data: section } = await supabase
      .from('sections')
      .select('nom')
      .eq('id', participant.sectionId)
      .maybeSingle();
    sectionName = section?.nom || sectionName;
  }

  // Fetch all articles containing questions
  const { data: rawArticlesWithQuestions } = await supabase.from('questions').select('article_id');

  const articleIdsWithQuestions = Array.from(
    new Set((rawArticlesWithQuestions || []).map((q) => q.article_id))
  );

  // Fetch all full articles
  const allArticles = await getArticles();
  const targetArticles = allArticles.filter((art) => articleIdsWithQuestions.includes(art.id));

  // Fetch all responses of the participant to calculate completion
  const { data: userResponses } = await supabase
    .from('reponses')
    .select('*')
    .eq('participant_id', participant.id);

  // Fetch questions for target articles
  const { data: allQuestions } = await supabase
    .from('questions')
    .select('*')
    .order('ordre', { ascending: true });

  // Map questions to articles
  const articlesMapped = targetArticles.map((art) => {
    const questions = (allQuestions || []).filter((q) => q.article_id === art.id);
    const questionIds = questions.map((q) => q.id);
    const answeredCount = (userResponses || []).filter((r) =>
      questionIds.includes(r.question_id)
    ).length;

    return {
      ...art,
      questions,
      completed: questionIds.length > 0 && answeredCount === questionIds.length,
      answeredCount,
      totalQuestions: questionIds.length,
    };
  });

  const totalArticles = articlesMapped.length;
  const completedArticlesCount = articlesMapped.filter((a) => a.completed).length;
  const completionRate = totalArticles > 0 ? Math.round((completedArticlesCount / totalArticles) * 100) : 0;

  // If an article is selected, render the questionnaire flow
  if (selectedArticleId) {
    let selectedArticle = articlesMapped.find((a) => a.id === selectedArticleId);
    
    if (!selectedArticle) {
      const art = allArticles.find((a) => a.id === selectedArticleId);
      if (art) {
        selectedArticle = {
          ...art,
          questions: [],
          completed: false,
          answeredCount: 0,
          totalQuestions: 0,
        };
      }
    }

    if (selectedArticle) {
      const initialResponses = await getUserResponsesForArticle(selectedArticleId);

      // Define inline server action for complete callback to redirect
      const handleComplete = async () => {
        'use server';
        redirect('/ma-section');
      };

      return (
        <div className="p-4 space-y-4">
          <div>
            <Link
              href="/ma-section"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-[#E8730C] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour au tableau de bord</span>
            </Link>
          </div>

          <div className="bg-slate-50 border border-gray-200 rounded-3xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Article à réformer</span>
              <h3 className="text-sm font-bold text-slate-800">
                {selectedArticle.numero_affiche} {selectedArticle.titre ? `: ${selectedArticle.titre}` : ''}
              </h3>
            </div>
            <span className="text-[10px] bg-orange-100 text-[#E8730C] px-2.5 py-1 rounded-xl font-bold uppercase shrink-0">
              {selectedArticle.texte?.code}
            </span>
          </div>

          <QuestionnaireFlow
            article={selectedArticle}
            questions={selectedArticle.questions || []}
            initialResponses={initialResponses}
            onComplete={handleComplete}
          />
        </div>
      );
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header section card */}
      <div className="bg-gradient-to-tr from-[#128A3E] to-[#E8730C] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

        <div className="flex items-center space-x-2.5 mb-2">
          <Users className="w-5 h-5 opacity-90" />
          <h2 className="text-base font-bold tracking-tight">Ma Section : {sectionName}</h2>
        </div>
        <p className="text-[11px] text-white/80 leading-relaxed mb-5">
          Séminaire National — En tant que délégué, répondez aux questionnaires de modernisation pour faire remonter les voix de votre section.
        </p>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold tracking-wide uppercase">
            <span>Taux de complétion</span>
            <span>{completedArticlesCount} / {totalArticles} Fiches</span>
          </div>
          <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div
              style={{ width: `${completionRate}%` }}
              className="h-full bg-white transition-all duration-500 rounded-full"
            />
          </div>
          <div className="flex justify-between items-center text-[9px] text-white/70 font-semibold pt-0.5">
            <span>Début du séminaire</span>
            <span>{completionRate}% accomplis</span>
          </div>
        </div>
      </div>

      {/* Checklist instructions */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Fiches de Modernisation ({totalArticles})
        </h3>

        <div className="space-y-2.5">
          {articlesMapped.map((art) => (
            <Link
              key={art.id}
              href={`/ma-section?article=${art.id}`}
              className="flex items-center justify-between bg-white hover:bg-slate-50/50 p-4 border border-gray-150 rounded-2xl shadow-sm transition-all active:scale-[0.99] group"
            >
              <div className="flex items-start space-x-3.5 pr-4">
                <div className="mt-0.5 shrink-0">
                  {art.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#128A3E]" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 group-hover:text-[#E8730C] transition-colors" />
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-[#E8730C]">
                      {art.numero_affiche}
                    </span>
                    <span className="text-[8px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded-lg">
                      {art.texte?.code}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 leading-snug mt-0.5">
                    {art.titre || 'Sans titre'}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    {art.completed
                      ? 'Réponses complètes'
                      : `${art.answeredCount} sur ${art.totalQuestions} questions répondues`}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center space-x-1.5">
                <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-xl uppercase border ${
                  art.completed
                    ? 'bg-green-50 text-[#128A3E] border-green-200'
                    : 'bg-orange-50 text-[#E8730C] border-orange-200'
                }`}>
                  {art.completed ? 'Modifier' : 'Traiter'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
