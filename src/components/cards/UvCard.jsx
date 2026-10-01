import React from 'react';
import { SunMedium, Umbrella, Glasses, Clock3 } from 'lucide-react';
import { infoUv } from '../../utils/aqi.js';

const TAHAP = [
  { sampai: 2, nama: 'Teduh', saran: 'Gas main' },
  { sampai: 5, nama: 'Anget', saran: 'Topian' },
  { sampai: 7, nama: 'Menyengat', saran: 'Ngiyup' },
  { sampai: 10, nama: 'Membakar', saran: 'Payungan' },
  { sampai: 99, nama: 'Manggang', saran: 'Di rumah' },
];

export function UvCard({ uvIndex, loading }) {
  if (loading) {
    return (
      <section className="border-2 border-slate-200 rounded-2xl bg-white p-5 animate-pulse min-h-[240px]">
        <div className="h-4 w-1/3 bg-slate-200 rounded-full mb-4" />
        <div className="flex gap-4 mb-4">
          <div className="w-20 h-20 bg-slate-200 rounded-full" />
          <div className="flex-1 h-14 bg-slate-200 rounded-xl" />
        </div>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 h-10 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  const info = infoUv(uvIndex);
  const nilai = info.value;
  const idxAktif = TAHAP.findIndex((t) => nilai <= t.sampai);
  const aktif = idxAktif === -1 ? TAHAP.length - 1 : idxAktif;
  const jamAman = nilai <= 2 ? 'Bebas sampai sore' : nilai <= 5 ? 'Aman sebelum jam 10 & sesudah jam 15' : 'Amannya pagi sebelum jam 09';

  return (
    <section className="border-2 border-slate-200 rounded-2xl bg-white p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold tracking-[0.14em] text-slate-500 uppercase">
          Terik Matahari • Pagi–Sore
        </p>
        <Umbrella size={18} className="text-slate-400" />
      </div>

      {/* Lingkar terik + sapaan — bukan angka raksasa + bar lama */}
      <div className="flex items-center gap-4">
        <div
          className="w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center shrink-0 bg-white"
          style={{ borderColor: info.color }}
        >
          <SunMedium size={20} style={{ color: info.color }} />
          <span className="text-2xl font-black tabular-nums leading-none" style={{ color: info.color }}>
            {nilai}
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-black text-slate-900 leading-tight">{info.label}</h3>
          <p className="text-[13px] font-medium text-slate-600 leading-snug">{info.advice}</p>
        </div>
      </div>

      {/* Tangga terik 5 kotak — bukan progress bar tunggal */}
      <div className="grid grid-cols-5 gap-1.5">
        {TAHAP.map((t, i) => {
          const on = i === aktif;
          const lewat = i < aktif;
          return (
            <div
              key={t.nama}
              className={`rounded-xl border-2 px-1 py-2 text-center transition-all ${on ? 'border-slate-900 -translate-y-0.5' : lewat ? 'border-transparent' : 'border-slate-100 bg-slate-50'}`}
              style={on ? { backgroundColor: info.bg } : lewat ? { backgroundColor: `${info.color}22` } : undefined}
            >
              <p className={`text-[11px] font-black leading-tight ${on ? 'text-slate-900' : lewat ? 'text-slate-600' : 'text-slate-400'}`}>
                {t.nama}
              </p>
              <p className="text-[10px] font-semibold text-slate-400">{t.saran}</p>
            </div>
          );
        })}
      </div>

      {/* Jam aman + checklist */}
      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-3">
        <p className="flex items-center gap-1.5 text-[12px] font-extrabold text-slate-700">
          <Clock3 size={14} /> Jam aman versi warga
        </p>
        <p className="text-[13px] font-semibold text-slate-600 mt-0.5">{jamAman}.</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {[
            { ikon: Glasses, teks: 'Kacamata', perlu: nilai >= 3 },
            { ikon: Umbrella, teks: 'Topi/payung', perlu: nilai >= 6 },
            { ikon: SunMedium, teks: 'Sunscreen', perlu: nilai >= 3 },
          ].map((k) => (
            <span
              key={k.teks}
              className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-1 rounded-full border-2 ${k.perlu ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-400'}`}
            >
              <k.ikon size={12} /> {k.teks}{k.perlu ? ' ✓' : ''}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
