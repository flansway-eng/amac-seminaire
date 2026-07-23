'use client';

import { useActionState, useState, useEffect } from 'react';
import { signIn, signInMagicLink } from '@/lib/actions/auth';
import { Mail, Lock, Sparkles, Send } from 'lucide-react';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'password' | 'magic'>('password');
  const [origin, setOrigin] = useState('');

  // Get window origin on client mount
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const [pwState, pwAction, pwPending] = useActionState(signIn, null);
  const [magicState, magicAction, magicPending] = useActionState(signInMagicLink, null);

  const error = pwState?.error || magicState?.error;
  const success = magicState?.success ? magicState.message : null;

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header decoration */}
        <div className="bg-gradient-to-tr from-[#128A3E] to-[#E8730C] h-32 flex flex-col justify-end p-6 relative">
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
          <h2 className="text-2xl font-bold text-white tracking-tight">AMAC National</h2>
          <p className="text-white/80 text-xs font-medium tracking-wide">Plateforme de Modernisation des Textes</p>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'password'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Mot de passe
            </button>
            <button
              onClick={() => setActiveTab('magic')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'magic'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Lien magique
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium animate-shake">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl font-medium">
              ✅ {success}
            </div>
          )}

          {/* Forms */}
          {activeTab === 'password' ? (
            <form action={pwAction} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="nom@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E8730C] focus:bg-white transition-all text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E8730C] focus:bg-white transition-all text-gray-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pwPending}
                className="w-full py-3 bg-[#E8730C] hover:bg-[#c66009] active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {pwPending ? (
                  <span>Connexion en cours...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Se connecter</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form action={magicAction} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="nom@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E8730C] focus:bg-white transition-all text-gray-900"
                  />
                </div>
              </div>

              <input type="hidden" name="origin" value={origin} />

              <button
                type="submit"
                disabled={magicPending}
                className="w-full py-3 bg-[#128A3E] hover:bg-[#0d6b2f] active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {magicPending ? (
                  <span>Envoi en cours...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Envoyer le lien magique</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Test credentials info */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 font-medium">
              AMAC Gouvernance 2.0 • Loi 60-315
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
