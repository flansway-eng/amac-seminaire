import { getArticles, getArticleById } from '@/lib/actions/articles';
import SwipeableCard from '@/components/swipeable-card';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface RouteParams {
  id: string;
}

export default async function ArticleReaderPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  if (isNaN(id)) {
    redirect('/textes');
  }

  // Fetch individual article
  const article = await getArticleById(id);
  if (!article) {
    redirect('/textes');
  }

  const code = article.texte?.code || 'STATUTS';

  // Fetch all articles of the same corpus to allow swiping
  const allArticles = await getArticles(code);
  
  // Find current index
  const currentIndex = allArticles.findIndex((art) => art.id === article.id);

  return (
    <div className="p-4 space-y-4">
      {/* Top back button */}
      <div>
        <Link
          href={`/textes?tab=${code}`}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-[#E8730C] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour au corpus</span>
        </Link>
      </div>

      {/* Swipeable Reader Card */}
      <SwipeableCard
        article={article}
        allArticles={allArticles}
        currentIndex={currentIndex !== -1 ? currentIndex : 0}
        total={allArticles.length}
        texteCode={code}
      />
    </div>
  );
}
