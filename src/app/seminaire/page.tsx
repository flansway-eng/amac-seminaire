import { createAdminClient } from '@/lib/supabase/admin';
import { lireParticipant } from '@/lib/session';
import { getArticles, getArticleById } from '@/lib/actions/articles';
import SeminarInterface from '@/components/seminar-interface';
import { Radio } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function SeminairePage() {
  const participant = await lireParticipant();
  if (!participant) {
    redirect('/rejoindre?suite=/seminaire');
  }

  const supabase = createAdminClient();

  // Fetch active seminar session state
  const { data: session } = await supabase
    .from('seminaire_session')
    .select('article_actif_id')
    .eq('id', 1)
    .single();

  let activeArticle = null;
  let propositions: any[] = [];

  if (session && session.article_actif_id) {
    activeArticle = await getArticleById(session.article_actif_id);

    // Fetch propositions for this active article
    const { data: props } = await supabase
      .from('propositions')
      .select('*, participant:participants(*)')
      .eq('article_id', session.article_actif_id);

    propositions = props || [];
  }

  // Fetch all articles containing questions
  const { data: rawArticlesWithQuestions } = await supabase.from('questions').select('article_id');

  const ids = Array.from(new Set((rawArticlesWithQuestions || []).map((q) => q.article_id)));
  const allArticles = await getArticles();
  const questionArticles = allArticles.filter((art) => ids.includes(art.id));

  return (
    <div className="p-4 space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-tr from-[#128A3E]/10 to-[#E8730C]/10 border border-orange-100 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 mb-2">
          <Radio className="w-5 h-5 text-[#E8730C]" />
          <h2 className="text-base font-bold text-gray-900">Mode Séminaire en Direct</h2>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Votez sur les options d'amendements présentées en séance. Les résultats s'affichent instantanément sur l'écran géant de projection.
        </p>
      </div>

      <SeminarInterface
        userRole={participant.role}
        userId={participant.id}
        initialActiveArticle={activeArticle}
        allQuestionArticles={questionArticles}
        initialPropositions={propositions}
      />
    </div>
  );
}
