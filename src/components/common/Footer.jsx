import React from 'react';
import { SUMBER_DATA } from '../../utils/sources';
import { SourceMark } from './SourceMark';

export function Footer({ onOpenWidget }) {
  const tahun = new Date().getFullYear();
  const barisAtas = SUMBER_DATA.slice(0, 3);
  const barisBawah = SUMBER_DATA.slice(3);

  return (
    <footer className="footer-bleed mt-12 border-t border-slate-200 px-4 pb-6 pt-8 text-center dark:border-slate-800">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        Tanggung Jawab Data
      </p>
      <p className="mx-auto mt-2 max-w-md text-[11px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
        Data dirangkum dari sumber terbuka di bawah. Klik logo untuk buka situs resminya.
        Selalu cek kanal resmi untuk keputusan darurat ya.
      </p>

      <div className="mt-3 flex flex-col items-center gap-1.5" aria-label="Sumber data resmi">
        <div className="flex flex-wrap justify-center gap-1.5">
          {barisAtas.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`${s.nama} — ${s.host}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3 text-[11px] font-extrabold text-slate-600 transition hover:-translate-y-px hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
            >
              <SourceMark id={s.id} size={20} label={`Logo ${s.nama}`} />
              {s.nama}
            </a>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {barisBawah.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`${s.nama} — ${s.host}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3 text-[11px] font-extrabold text-slate-600 transition hover:-translate-y-px hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
            >
              <SourceMark id={s.id} size={20} label={`Logo ${s.nama}`} />
              {s.nama}
            </a>
          ))}
        </div>
      </div>

      <p className="mt-4 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
        JagaKota {tahun} — dijaga bareng warga.
        {onOpenWidget && (
          <>
            {' • '}
            <button
              type="button"
              onClick={onOpenWidget}
              className="font-bold text-emerald-700 hover:underline dark:text-emerald-300"
            >
              Pasang widget RT/RW
            </button>
          </>
        )}
      </p>
    </footer>
  );
}
