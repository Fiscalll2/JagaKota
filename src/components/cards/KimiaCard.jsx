import React from 'react';
import { FlaskConical } from 'lucide-react';
import { analisisKimia } from '../../utils/kimiaUdara.js';

/**
 * KimiaCard — "ANALISIS KIMIAWI UDARA": pecahan 6 zat dari Pos Udara.
 * Logika derivasi (batas WHO, rasio, dominan, saran) di src/utils/kimiaUdara.js
 * yang disusun & diverifikasi sub-agent; komponen ini murni presentasi.
 */
export function KimiaCard({ current, loading }) {
  if (loading) {
    return (
      <section className="rounded-2xl border-2 border-slate-200 bg-white p-5 animate-pulse">
        <div className="h-4 w-1/3 bg-slate-200 rounded-full mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  const { daftar, dominan, catatan } = analisisKimia(current);

  return (
    <section className="rounded-2xl border-2 border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
            <FlaskConical size={18} strokeWidth={2.5} />
          </span>
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              Analisis Kimiawi Udara
            </h3>
            <p className="text-[11px] font-medium text-slate-500">
              Pecahan 6 zat dari Pos Udara • dibanding batas aman WHO
            </p>
          </div>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-extrabold"
          style={{ color: dominan.warna, backgroundColor: `${dominan.warna}14` }}
        >
          Pemicu: {dominan.nama} ({dominan.rasio}×)
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {daftar.map((zat) => (
          <div
            key={zat.id}
            className="rounded-xl border-2 border-slate-100 bg-slate-50/60 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/50"
          >
            <div className="flex items-baseline justify-between gap-1">
              <p className="text-[12px] font-black text-slate-800 dark:text-slate-100">{zat.nama}</p>
              <p className="text-[13px] font-extrabold tabular-nums text-slate-900 dark:text-white">
                {zat.nilai}
                {zat.satuan && <span className="ml-0.5 text-[10px] font-semibold text-slate-400">{zat.satuan}</span>}
              </p>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" role="img" aria-label={`${zat.nama} ${zat.persen} persen dari batas aman`}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${zat.persen}%`, backgroundColor: zat.warna }}
              />
            </div>
            <p className="mt-1.5 text-[11px] font-extrabold" style={{ color: zat.warna }}>
              {zat.status === 'aman' ? 'Aman' : zat.status === 'waspada' ? 'Waspada' : 'Bahaya'}
              {zat.kosong && <span className="font-semibold text-slate-400"> • no data</span>}
            </p>
            <p className="mt-0.5 text-[11px] font-medium leading-snug text-slate-500 dark:text-slate-400">
              {zat.saran}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] font-medium text-slate-400">{catatan}</p>
    </section>
  );
}

export default KimiaCard;
