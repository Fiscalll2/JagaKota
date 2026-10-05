import React, { useEffect, useState } from 'react';
import { X, Download, Smartphone, Share, Monitor, CheckCircle2, PartyPopper } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

const TAB = [
  { id: 'android', label: 'Android', Ikon: Smartphone },
  { id: 'ios', label: 'iPhone', Ikon: Share },
  { id: 'desktop', label: 'Laptop', Ikon: Monitor },
];

const LANGKAH = {
  android: [
    'Buka JagaKota di Chrome Android.',
    'Ketuk titik tiga ⋮ di kanan atas.',
    'Pilih “Pasang aplikasi” / “Add to Home screen”.',
    'Ketuk Pasang untuk konfirmasi.',
  ],
  ios: [
    'Buka JagaKota di Safari (iPhone tidak mendukung tombol otomatis).',
    'Ketuk tombol Bagikan (kotak + panah ke atas).',
    'Gulir lalu pilih “Add to Home Screen”.',
    'Ketuk Add di kanan atas.',
  ],
  desktop: [
    'Buka JagaKota di Chrome / Edge laptop.',
    'Klik ikon install di address bar (atau ⋮ → Save & share → Install).',
    'Klik Install pada dialog konfirmasi.',
  ],
};

export function InstallGuideModal({ isOpen, onClose, pwa }) {
  const bisaPrompt = pwa?.bisaPrompt ?? false;
  const [tab, setTab] = useState(pwa?.platform || 'android');
  const [berhasil, setBerhasil] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTab(pwa?.platform || 'android');
      setBerhasil(false);
    }
  }, [isOpen, pwa?.platform]);

  useEffect(() => {
    if (!isOpen) return;
    const tutup = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', tutup);
    return () => window.removeEventListener('keydown', tutup);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const terpasang = pwa?.sudahPasang || berhasil;

  const pasangSekarang = async () => {
    const hasil = await pwa?.promptPasang?.();
    if (hasil === 'diterima') setBerhasil(true);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Panduan pasang aplikasi JagaKota"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border-2 border-slate-200 bg-white sm:rounded-3xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b-2 border-slate-100 px-5 pb-4 pt-5 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white">
                <Download size={20} strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Pasang Aplikasi
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  JagaKota di layar utama — cepat & bisa offline
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Tutup panduan pasang"
              className="grid size-9 shrink-0 place-items-center rounded-xl border-2 border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <X size={17} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          {terpasang ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <span className="grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                <PartyPopper size={26} strokeWidth={2.2} />
              </span>
              <p className="text-base font-black text-slate-900 dark:text-white">Sudah terpasang!</p>
              <p className="max-w-xs text-xs font-medium text-slate-500 dark:text-slate-400">
                JagaKota sudah ada di perangkatmu. Buka lewat ikon layar utama biar makin cepat.
              </p>
              <Button onClick={onClose} className="mt-2">
                <CheckCircle2 /> Siap, kembali
              </Button>
            </div>
          ) : (
            <>
              {bisaPrompt && (
                <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50 p-4 text-center dark:border-emerald-700 dark:bg-emerald-950/50">
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Perangkatmu mendukung pasang otomatis
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Satu ketuk, langsung jadi aplikasi.
                  </p>
                  <Button onClick={pasangSekarang} className="mt-3 w-full" size="lg">
                    <Download /> Pasang Sekarang
                  </Button>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between gap-2">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                  {bisaPrompt ? 'Atau cara manual' : 'Cara manual per perangkat'}
                </p>
                <Badge variant="secondary">Gratis • Offline</Badge>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-1.5 rounded-2xl border-2 border-slate-100 bg-slate-50 p-1.5 dark:border-slate-800 dark:bg-slate-800/60" role="tablist" aria-label="Pilih perangkat">
                {TAB.map((t) => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={tab === t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      'flex min-h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-extrabold transition',
                      tab === t.id
                        ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-300'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    )}
                  >
                    <t.Ikon size={15} strokeWidth={2.4} />
                    {t.label}
                  </button>
                ))}
              </div>

              <ol className="mt-3 space-y-2">
                {LANGKAH[tab].map((langkah, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 rounded-xl border-2 border-slate-100 bg-white px-3 py-2.5 text-[13px] font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-[11px] font-black text-white">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{langkah}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
