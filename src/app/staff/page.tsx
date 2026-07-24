import { redirect } from 'next/navigation';
import { lireParticipant } from '@/lib/session';
import StaffForm from '@/components/staff-form';
import { ShieldCheck } from 'lucide-react';

export default async function StaffPage() {
  const participant = await lireParticipant();
  if (!participant) {
    redirect('/rejoindre?suite=/staff');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-slate-900 h-24 flex flex-col justify-end p-6">
          <div className="flex items-center space-x-2 text-white">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-lg font-bold tracking-tight">Accès scribe / BEN</h2>
          </div>
        </div>

        <div className="p-6">
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Réservé aux membres du Bureau Exécutif National et au scribe désigné pour la séance.
            Saisissez le code à 6 chiffres qui vous a été communiqué.
          </p>
          <StaffForm />
        </div>
      </div>
    </div>
  );
}
