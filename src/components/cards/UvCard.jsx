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

function puncakHariIni(hourly, cadangan) {
  const times = hourly?.time || [];
  const uv = hourly?.uv_index || [];
  if (!times.length || !uv.length) return { jam: '', level: Math.round(cadangan ?? 0) };
  const d = new Date();
  const b = (n) => String(n).padStart(2, '0');
  const tgl = `${d.getFullYear()}-${b(d.getMonth() + 1)}-${b(d.getDate())}`;
  let bi = -1;
  let bv = -1;
  times.forEach((t, i) => {
    if (String(t).slice(0, 10) !== tgl) return;
    const v = Number(uv[i]) || 0;
    if (v > bv) { bv = v; bi = i; }
  });
  if (bi < 0) return { jam: '', level: Math.round(cadangan ?? 0) };
  const off = d.getTimezoneOffset();
  const tz = off === -420 ? 'WIB' : off === -480 ? 'WITA' : off === -540 ? 'WIT' : 'WIB';
  return { jam: `${String(times[bi]).slice(11, 16)} ${tz}`, level: Math.round(bv) };
}

export function UvCard({ uvIndex, hourly, loading }) {
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
  const puncak = puncakHariIni(hourly, nilai);

  // Gauge setengah lingkaran: fraksi dari skala 0–11.
  const fraksi = Math.max(0, Math.min(1, nilai / 11));
  const PANJANG = Math.PI * 50;

  return (
    <section className="border-2 border-slate-200 rounded-2xl bg-white p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.14em] text-slate-500 uppercase">
          <SunMedium size={14} style={{ color: info.color }} />
          Terik Matahari • Pagi–Sore
        </p>
        <Umbrella size={18} className="text-slate-400" />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-28 shrink-0">
          <svg viewBox="0 10 120 70" className="w-full" aria-hidden="true" focusable="false">
            <path d="M10,60 A50,50 0 0 1 110,60" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
            <path
              d="M10,60 A50,50 0 0 1 110,60" fill="none"
              stroke={info.color} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${fraksi * PANJANG} ${PANJANG}`}
            />
          </svg>
          <span className="absolute inset-x-0 bottom-0 flex flex-col items-center">
            <SunMedium size={18} style={{ color: info.color }} />
            <span className="text-2xl font-black tabular-nums leading-none" style={{ color: info.color }}>
              {nilai}
            </span>
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-black text-slate-900 leading-tight">{info.label}</h3>
          <p className="text-[13px] font-medium text-slate-600 leading-snug">{info.advice}</p>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
          Tingkat Rasa di Kulit
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {TAHAP.map((t, i) => {
            const on = i === aktif;
            return (
              <div
                key={t.nama}
                className={`rounded-xl border-2 px-1 py-2 text-center transition-all ${on ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 bg-slate-50'}`}
              >
                <p className={`text-[11px] font-black leading-tight ${on ? 'text-white' : 'text-slate-500'}`}>
                  {t.nama}
                </p>
                <p className={`text-[10px] font-semibold ${on ? 'text-slate-300' : 'text-slate-400'}`}>{t.saran}</p>
              </div>
            );
          })}
        </div>
      </div>

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

      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
        <span>Puncak UV{puncak.jam ? `: ${puncak.jam}` : ' hari ini'} (Est. Lv {puncak.level})</span>
        {nilai <= 2
          ? <span className="font-extrabold text-emerald-600">Aman saat ini</span>
          : <span className="font-extrabold" style={{ color: info.color }}>{info.label}</span>}
      </div>
    </section>
  );
}
