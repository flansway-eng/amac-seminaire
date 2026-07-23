'use client';

import { useState, useEffect } from 'react';
import { Article, Question, Reponse } from '@/lib/types';
import { saveResponse, saveProposition } from '@/lib/actions/responses';
import { Check, Loader2, Sparkles, Send, FileText, AlertCircle } from 'lucide-react';

interface QuestionnaireFlowProps {
  article: Article;
  questions: Question[];
  initialResponses: Reponse[];
  onComplete: () => void;
}

export default function QuestionnaireFlow({
  article,
  questions,
  initialResponses,
  onComplete,
}: QuestionnaireFlowProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [responses, setResponses] = useState<Record<number, { value: any; comment: string }>>({});
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Proposition state
  const [showPropForm, setShowPropForm] = useState(false);
  const [textePropose, setTextePropose] = useState(article.contenu_actuel);
  const [exposeMotifs, setExposeMotifs] = useState('');
  const [propSaving, setPropSaving] = useState(false);
  const [propError, setPropError] = useState<string | null>(null);
  const [propSuccess, setPropSuccess] = useState(false);
  
  // AI state
  const [aiLoading, setAiLoading] = useState(false);

  // Initialize responses from DB if exist
  useEffect(() => {
    const initialMap: Record<number, { value: any; comment: string }> = {};
    initialResponses.forEach((resp) => {
      initialMap[resp.question_id] = {
        value: resp.valeur,
        comment: resp.commentaire || '',
      };
    });
    setResponses(initialMap);
  }, [initialResponses]);

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length;

  const handleSave = async (questionId: number, value: any, comment: string) => {
    if (!value) return;
    setSavingStatus('saving');
    
    // Optimistic state update
    setResponses((prev) => ({
      ...prev,
      [questionId]: { value, comment },
    }));

    const res = await saveResponse(questionId, value, comment);
    
    if (res.success) {
      setSavingStatus('saved');
      setTimeout(() => setSavingStatus('idle'), 1000);
    } else {
      setSavingStatus('error');
    }
  };

  const handleOptionSelect = (optionKey: 'A' | 'B') => {
    const currentResp = responses[currentQuestion.id] || { value: {}, comment: '' };
    const newValue = { ...currentResp.value, reponse: optionKey };
    
    // Set default note of 4 if not set yet
    if (!newValue.note) {
      newValue.note = 4;
    }
    
    handleSave(currentQuestion.id, newValue, currentResp.comment);
  };

  const handleRatingChange = (rating: number) => {
    const currentResp = responses[currentQuestion.id] || { value: {}, comment: '' };
    const newValue = { ...currentResp.value, note: rating };
    handleSave(currentQuestion.id, newValue, currentResp.comment);
  };

  const handleCommentBlur = (comment: string) => {
    const currentResp = responses[currentQuestion.id] || { value: {}, comment: '' };
    handleSave(currentQuestion.id, currentResp.value, comment);
  };

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleAIReformulation = async () => {
    setAiLoading(true);
    setPropError(null);
    try {
      // Package the answers to send to the AI
      const qaPackage = questions.map((q) => {
        const resp = responses[q.id];
        const chosen = resp?.value?.reponse || 'N/A';
        const rating = resp?.value?.note || 'N/A';
        return {
          intitule: q.intitule,
          reponseValue: `Option ${chosen} (Niveau d'accord: ${rating}/5)`,
          commentaire: resp?.comment || '',
        };
      });

      const res = await fetch('/api/ai/reformuler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleNum: article.numero,
          articleTitre: article.titre,
          contenuActuel: article.contenu_actuel,
          questionsEtReponses: qaPackage,
        }),
      });

      if (!res.ok) throw new Error("Erreur serveur lors de la reformulation");
      const data = await res.json();
      
      setTextePropose(data.textePropose);
      setExposeMotifs(data.exposeMotifs);
      setShowPropForm(true);
    } catch (e: any) {
      setPropError(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const submitPropositionForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setPropSaving(true);
    setPropError(null);

    const res = await saveProposition(article.id, textePropose, exposeMotifs);
    setPropSaving(false);

    if (res.success) {
      setPropSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    } else {
      setPropError(res.error || "Erreur de sauvegarde");
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-gray-150 shadow-xl overflow-hidden min-h-[50vh] flex flex-col">
      {/* Top autosave indicator */}
      <div className="bg-slate-50 border-b border-gray-100 px-4 py-2 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 uppercase">
          {!isLastQuestion ? `Questionnaire : Article ${article.numero}` : 'Synthèse & Proposition'}
        </span>
        <div className="flex items-center space-x-1">
          {savingStatus === 'saving' && (
            <>
              <Loader2 className="w-3 h-3 text-[#E8730C] animate-spin" />
              <span className="text-[9px] text-[#E8730C] font-semibold">Sauvegarde...</span>
            </>
          )}
          {savingStatus === 'saved' && (
            <>
              <Check className="w-3 h-3 text-[#128A3E]" />
              <span className="text-[9px] text-[#128A3E] font-semibold">Enregistré</span>
            </>
          )}
          {savingStatus === 'error' && (
            <span className="text-[9px] text-red-600 font-semibold">⚠️ Erreur de sauvegarde</span>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        {!isLastQuestion ? (
          // QUESTION STEP
          <div className="space-y-6">
            {/* Progress */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Question {currentStep + 1} sur {questions.length}</span>
              <div className="flex space-x-1">
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-4 h-1.5 rounded-full transition-all ${
                      idx === currentStep
                        ? 'bg-[#E8730C] w-6'
                        : idx < currentStep
                        ? 'bg-[#128A3E]'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Question Text */}
            <h3 className="text-sm font-bold text-slate-800 leading-snug">
              {currentQuestion.intitule}
            </h3>

            {/* Choices Options A/B */}
            {currentQuestion.type === 'choix_ab' && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleOptionSelect('A')}
                  className={`w-full text-left p-4 rounded-2xl border transition-all relative ${
                    responses[currentQuestion.id]?.value?.reponse === 'A'
                      ? 'border-[#E8730C] bg-orange-50/20 ring-1 ring-[#E8730C]'
                      : 'border-gray-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                      responses[currentQuestion.id]?.value?.reponse === 'A'
                        ? 'bg-[#E8730C] text-white border-transparent'
                        : 'bg-slate-100 text-slate-600 border-gray-200'
                    }`}>
                      A
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed pr-6">
                      {currentQuestion.options.option_a}
                    </p>
                  </div>
                  {responses[currentQuestion.id]?.value?.reponse === 'A' && (
                    <Check className="absolute right-4 top-4 w-4 h-4 text-[#E8730C]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleOptionSelect('B')}
                  className={`w-full text-left p-4 rounded-2xl border transition-all relative ${
                    responses[currentQuestion.id]?.value?.reponse === 'B'
                      ? 'border-[#E8730C] bg-orange-50/20 ring-1 ring-[#E8730C]'
                      : 'border-gray-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                      responses[currentQuestion.id]?.value?.reponse === 'B'
                        ? 'bg-[#E8730C] text-white border-transparent'
                        : 'bg-slate-100 text-slate-600 border-gray-200'
                    }`}>
                      B
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed pr-6">
                      {currentQuestion.options.option_b}
                    </p>
                  </div>
                  {responses[currentQuestion.id]?.value?.reponse === 'B' && (
                    <Check className="absolute right-4 top-4 w-4 h-4 text-[#E8730C]" />
                  )}
                </button>
              </div>
            )}

            {/* Slider Agreement rating (only visible if an option A/B has been selected) */}
            {responses[currentQuestion.id]?.value?.reponse && (
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-gray-100 animate-fadeIn">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <span>Votre niveau d'accord</span>
                  <span className="text-[#E8730C] font-extrabold text-xs">
                    {responses[currentQuestion.id]?.value?.note || 4}/5
                  </span>
                </div>
                <div className="flex items-center justify-between px-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleRatingChange(num)}
                      className={`w-9 h-9 rounded-full font-bold text-xs border transition-all flex items-center justify-center ${
                        responses[currentQuestion.id]?.value?.note === num
                          ? 'bg-[#E8730C] text-white border-transparent shadow-md scale-110'
                          : 'bg-white text-slate-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-1">
                  <span>Pas d'accord</span>
                  <span>Neutre</span>
                  <span>Tout à fait d'accord</span>
                </div>
              </div>
            )}

            {/* Motivation Comment */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Commentaire de motivation (Facultatif)
              </label>
              <textarea
                defaultValue={responses[currentQuestion.id]?.comment || ''}
                onBlur={(e) => handleCommentBlur(e.target.value)}
                placeholder="Expliquez brièvement votre choix pour orienter le scribe..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#E8730C] focus:bg-white transition-all text-gray-900"
              />
            </div>
          </div>
        ) : (
          // SUMMARY & PROPOSITION
          <div className="space-y-6">
            <div className="bg-[#128A3E]/5 border border-green-150 rounded-2xl p-4 flex items-start space-x-3">
              <Check className="w-5 h-5 text-[#128A3E] mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Questionnaire terminé</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                  Vos réponses ont été enregistrées avec succès. Vous pouvez maintenant soumettre une proposition de rédaction amendée ou générer une formulation automatique.
                </p>
              </div>
            </div>

            {/* Synthesis list */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Synthèse de vos choix
              </h4>
              {questions.map((q) => {
                const resp = responses[q.id];
                const choice = resp?.value?.reponse;
                const note = resp?.value?.note;
                return (
                  <div key={q.id} className="p-3 bg-slate-50 border border-gray-150 rounded-xl flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-medium line-clamp-1 pr-4">{q.intitule}</span>
                    <span className="font-bold text-[#E8730C] shrink-0 bg-white px-2 py-0.5 rounded-lg border">
                      Option {choice || 'N/A'} ({note || '0'}/5)
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Actions for propositions */}
            {!showPropForm ? (
              <div className="flex flex-col space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleAIReformulation}
                  disabled={aiLoading}
                  className="w-full py-3 bg-[#E8730C] hover:bg-[#c66009] active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Formulation juridique par IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-white" />
                      <span>Proposer une formulation par IA</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowPropForm(true)}
                  className="w-full py-3 bg-white border border-gray-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Rédiger une proposition alternative</span>
                </button>
              </div>
            ) : (
              // PROPOSITION INPUT FORM
              <form onSubmit={submitPropositionForm} className="space-y-4 animate-fadeIn">
                <div className="p-3 bg-orange-50/20 border border-orange-100 rounded-xl flex items-start space-x-2 text-[10px] text-amber-800">
                  <AlertCircle className="w-4 h-4 text-[#E8730C] shrink-0" />
                  <p>
                    Veuillez valider ou modifier le texte proposé ci-dessous pour le soumettre à la plénière du séminaire.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Texte de l'article amendé proposé
                  </label>
                  <textarea
                    value={textePropose}
                    onChange={(e) => setTextePropose(e.target.value)}
                    required
                    rows={6}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-serif focus:outline-none focus:border-[#E8730C] transition-all text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Exposé des motifs de la réforme
                  </label>
                  <textarea
                    value={exposeMotifs}
                    onChange={(e) => setExposeMotifs(e.target.value)}
                    required
                    placeholder="Expliquez pourquoi cette formulation est plus équitable, claire ou conforme à la loi 60-315..."
                    rows={3}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#E8730C] transition-all text-gray-900"
                  />
                </div>

                {propError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-[10px] rounded-lg font-medium">
                    ⚠️ {propError}
                  </div>
                )}

                {propSuccess && (
                  <div className="p-2.5 bg-green-50 border border-green-200 text-green-700 text-[10px] rounded-lg font-medium">
                    ✅ Proposition transmise avec succès !
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPropForm(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={propSaving || propSuccess}
                    className="flex-1 py-2.5 bg-[#128A3E] hover:bg-[#0d6b2f] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1 disabled:opacity-50"
                  >
                    {propSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Soumettre</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Action Buttons Footer (Prev/Next/Terminer) */}
        {!isLastQuestion && (
          <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-30"
            >
              Précédent
            </button>
            
            <button
              type="button"
              onClick={handleNext}
              disabled={!responses[currentQuestion.id]?.value?.reponse}
              className="px-5 py-2.5 bg-[#E8730C] hover:bg-[#c66009] text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 disabled:shadow-none"
            >
              {currentStep === questions.length - 1 ? 'Synthèse' : 'Suivant'}
            </button>
          </div>
        )}

        {isLastQuestion && !showPropForm && (
          <div className="flex justify-center pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onComplete}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
            >
              Terminer la consultation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
