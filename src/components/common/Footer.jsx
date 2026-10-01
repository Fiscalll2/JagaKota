import React from 'react';
import { Code2, Globe, Code, Flame, Mountain, HeartHandshake } from 'lucide-react';
import { tanggalPenuhJaga } from '../../utils/format';

export function Footer({ onOpenWidget }) {
  const tahun = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-slate-200 px-2 py-8 text-center dark:border-slate-800">
      <p className="flex items-center justify-center gap-1.5 text-sm font-extrabold text-slate-800 dark:text-slate-100">
        <HeartHandshake size={16} className="text-emerald-600" />
        JagaKota — dijaga bareng warga, buat warga {tahun}
      </p>
      <p className="mx-auto mt-1.5 max-w-2xl text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
        Data cuaca, udara, gempa, dan api dirangkum dari sumber terbuka biar gampang dipantau.
        Terakhir dirender: {tanggalPenuhJaga(new Date())}. Selalu cek kanal resmi untuk keputusan darurat ya.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px]">
        <a href="https://github.com/Fiscalll2" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:underline dark:text-emerald-300">
          <Code2 size={16} strokeWidth={2.5} /> Intip dapur kode
        </a>
        {onOpenWidget && (
          <button onClick={onOpenWidget} className="inline-flex items-center gap-1.5 font-bold text-sky-700 hover:underline dark:text-sky-300">
            <Code size={16} strokeWidth={2.5} /> Pasang widget di web RT/RW
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-bold">
        <a href="https://data.bmkg.go.id" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 dark:text-slate-300">
          <Globe size={14} strokeWidth={2.5} /> BMKG Open Data
        </a>
        <a href="https://magma.esdm.go.id" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 dark:text-slate-300">
          <Mountain size={14} strokeWidth={2.5} /> PVMBG Magma
        </a>
        <a href="https://sipongi.gakkum.kehutanan.go.id" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 dark:text-slate-300">
          <Flame size={14} strokeWidth={2.5} /> KLHK SiPongi+
        </a>
        <a href="https://firms.modaps.eosdis.nasa.gov" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 dark:text-slate-300">
          <Flame size={14} strokeWidth={2.5} /> NASA FIRMS
        </a>
        <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 dark:text-slate-300">
          <Globe size={14} strokeWidth={2.5} /> Open-Meteo
        </a>
      </div>
    </footer>
  );
}
