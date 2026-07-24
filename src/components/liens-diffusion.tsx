'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check } from 'lucide-react';

interface Section {
  id: number;
  nom: string;
  ville: string;
  slug: string;
}

interface LiensDiffusionProps {
  sections: Section[];
  siteUrl: string;
  seance: string;
}

interface LienEntry {
  label: string;
  url: string;
  qrDataUrl: string;
}

export default function LiensDiffusion({ sections, siteUrl, seance }: LiensDiffusionProps) {
  const [liens, setLiens] = useState<LienEntry[]>([]);
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    let annule = false;

    async function genererLiens() {
      const brut: { label: string; url: string }[] = [
        { label: 'Lien général de séance', url: `${siteUrl}/rejoindre?seance=${seance}` },
        ...sections.map((s) => ({
          label: `${s.nom} (${s.ville})`,
          url: `${siteUrl}/rejoindre?section=${s.slug}&seance=${seance}`,
        })),
      ];

      const avecQr = await Promise.all(
        brut.map(async (entry) => ({
          ...entry,
          qrDataUrl: await QRCode.toDataURL(entry.url, { width: 320, margin: 1 }),
        }))
      );

      if (!annule) setLiens(avecQr);
    }

    genererLiens();
    return () => {
      annule = true;
    };
  }, [sections, siteUrl, seance]);

  const copierTousLesLiens = async () => {
    const texte = liens.map((l) => `${l.label} : ${l.url}`).join('\n');
    await navigator.clipboard.writeText(texte);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={copierTousLesLiens}
        className="w-full py-3 bg-[#128A3E] hover:bg-[#0d6b2f] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
      >
        {copie ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        <span>{copie ? 'Copié !' : 'Copier tous les liens (WhatsApp)'}</span>
      </button>

      <div className="space-y-4">
        {liens.map((lien) => (
          <div key={lien.url} className="bg-white border border-gray-150 rounded-2xl shadow-sm p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-800">{lien.label}</h3>
            <p className="text-[10px] text-slate-500 break-all font-mono bg-slate-50 p-2 rounded-lg">
              {lien.url}
            </p>

            {lien.qrDataUrl && (
              <div className="flex flex-col items-center space-y-2">
                <img src={lien.qrDataUrl} alt={`QR code — ${lien.label}`} className="w-40 h-40" />
                <a
                  href={lien.qrDataUrl}
                  download={`amac-qr-${lien.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`}
                  className="text-[10px] font-bold text-[#E8730C] flex items-center space-x-1 hover:underline"
                >
                  <Download className="w-3 h-3" />
                  <span>Télécharger le PNG</span>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
