'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Article } from '@/lib/types';
import { SEVERITIES, ENJEU_TYPES, isContenuPlaceholder } from '@/lib/constants/labels';
import { ChevronLeft, ChevronRight, AlertTriangle, Link as LinkIcon, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface SwipeableCardProps {
  article: Article;
  allArticles: Article[];
  currentIndex: number;
  total: number;
  texteCode: string;
}

export default function SwipeableCard({
  article,
  allArticles,
  currentIndex,
  total,
  texteCode,
}: SwipeableCardProps) {
  const router = useRouter();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);

  // Minimum swipe distance in pixels
  const minSwipeDistance = 50;

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevArticle = allArticles[currentIndex - 1];
      router.push(`/textes/${prevArticle.id}`);
    }
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      const nextArticle = allArticles[currentIndex + 1];
      router.push(`/textes/${nextArticle.id}`);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, allArticles]);

  // Touch handlers for swiping
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - touchStart;
    
    // Dampen the drag animation
    if ((currentIndex === 0 && diff > 0) || (currentIndex === total - 1 && diff < 0)) {
      setSwipeOffset(diff * 0.2);
    } else {
      setSwipeOffset(diff);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setSwipeOffset(0);
      return;
    }
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
    setSwipeOffset(0);
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={(e) => {
        setTouchEnd(e.targetTouches[0].clientX);
        onTouchMove(e);
      }}
      onTouchEnd={onTouchEnd}
      style={{
        transform: `translateX(${swipeOffset}px)`,
        transition: swipeOffset === 0 ? 'transform 0.3s ease-out' : 'none',
      }}
      className="w-full bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col min-h-[70vh] relative"
    >
      {/* Top progress bar */}
      <div className="w-full bg-slate-100 h-1.5 flex">
        {allArticles.map((art, idx) => (
          <div
            key={art.id}
            className={`flex-1 h-full transition-all ${
              idx <= currentIndex ? 'bg-[#E8730C]' : 'bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* Header Info */}
      <div className="p-6 pb-4 border-b border-gray-50 bg-slate-50/50">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold text-[#E8730C] uppercase tracking-wider">
            {texteCode === 'STATUTS' ? 'Statuts' : 'Règlement Intérieur'}
          </span>
          <span className="text-[10px] font-semibold text-slate-500">
            Article {currentIndex + 1} / {total}
          </span>
        </div>
        
        {article.titre_parent && (
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight leading-none mb-1">
            {article.titre_parent}
          </p>
        )}
        {article.chapitre && (
          <p className="text-[9px] font-normal text-slate-400 italic leading-none mb-2">
            {article.chapitre}
          </p>
        )}

        <h3 className="text-lg font-bold text-slate-900 leading-tight">
          {article.numero_affiche} {article.titre ? `: ${article.titre}` : ''}
        </h3>
      </div>

      {/* Body Content */}
      <div className="p-6 flex-1 flex flex-col space-y-6 overflow-y-auto">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Texte Actuel (2013)
            </h4>
            {isContenuPlaceholder(article.contenu_actuel) && (
              <span
                role="status"
                className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200"
              >
                ⚠️ Texte provisoire à remplacer
              </span>
            )}
          </div>
          <p className="text-sm text-slate-800 leading-relaxed font-serif whitespace-pre-wrap">
            {article.contenu_actuel}
          </p>
        </div>

        {/* Legal issues (Enjeux) */}
        {article.enjeux && article.enjeux.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Analyse des Enjeux Juridiques</span>
            </h4>
            
            {article.enjeux.map((enjeu) => {
              const severity = SEVERITIES[enjeu.gravite] || SEVERITIES.mineur;
              return (
                <div
                  key={enjeu.id}
                  className={`p-4 rounded-2xl border ${severity.color} space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {ENJEU_TYPES[enjeu.type]}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border bg-white shadow-sm flex items-center space-x-1">
                      <span>{severity.icon}</span>
                      <span>{severity.label}</span>
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {enjeu.description}
                  </p>

                  {enjeu.base_legale && (
                    <div className="text-[10px] text-slate-500 border-t border-gray-200/50 pt-1.5 mt-1">
                      <span className="font-bold">Base légale : </span>
                      <span className="italic">{enjeu.base_legale}</span>
                    </div>
                  )}

                  {enjeu.articles_lies && enjeu.articles_lies.length > 0 && (
                    <div className="text-[9px] text-slate-500 flex items-center space-x-1 pt-1">
                      <LinkIcon className="w-3 h-3 text-slate-400" />
                      <span className="font-semibold">Articles liés : </span>
                      <div className="flex flex-wrap gap-1">
                        {enjeu.articles_lies.map((linkedId) => {
                          // Find article code/number for rendering
                          const matched = allArticles.find(a => a.id === linkedId);
                          if (!matched) return null;
                          return (
                            <Link
                              key={linkedId}
                              href={`/textes/${linkedId}`}
                              className="underline hover:text-[#E8730C]"
                            >
                              {matched.texte?.code === 'STATUTS' ? 'Statuts' : 'RI'} Art. {matched.numero}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="p-4 bg-slate-50 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center space-x-1 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#E8730C] hover:bg-white border border-transparent hover:border-gray-200 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:hover:border-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Précédent</span>
        </button>

        {article.questions && article.questions.length > 0 && (
          <Link
            href={`/ma-section?article=${article.id}`}
            className="flex items-center space-x-1 px-4 py-2 text-xs font-bold text-white bg-[#128A3E] hover:bg-[#0d6b2f] rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span>Moderniser</span>
          </Link>
        )}

        <button
          onClick={handleNext}
          disabled={currentIndex === total - 1}
          className="flex items-center space-x-1 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#E8730C] hover:bg-white border border-transparent hover:border-gray-200 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:hover:border-transparent"
        >
          <span>Suivant</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
