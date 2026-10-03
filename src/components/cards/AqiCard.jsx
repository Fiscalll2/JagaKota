import React from 'react';
import { Wind, DoorOpen, ShieldCheck } from 'lucide-react';
import { infoUdara, TINGKAT_UDARA } from '../../utils/aqi.js';
import { analisisKimia } from '../../utils/kimiaUdara.js';

function waktuRelatif(waktu) {
  if (!waktu) return '';
  const beda = Date.now() - new Date(waktu).getTime();
  if (!Number.isFinite(beda) || beda < 0) return '';
  const menit = Math.floor(beda / 60000);
  if (menit < 1) return 'baru saja';
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  return `${jam} jam lalu`;
}

export function AqiCard({ data, loading, locationName, updatedAt }) {
  if (loading) {
    return (
      <section className="border-2 border-slate-200 rounded-2xl bg-white p-5 animate-pulse min-h-[240px]">
        <div className="h-4 w-1/3 bg-slate-200 rounded-full mb-4" />
        <div className="flex gap-4 mb-4">
          <div className="w-20 h-20 bg-slate-200 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-2/3 bg-slate-200 rounded" />
            <div className="h-3 w-full bg-slate-200 rounded" />
          </div>
        </div>
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-8 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  const current = data?.current || {};
  const aqi = Math.max(0, Number(current.aqi) || 0);
  const info = infoUdara(aqi);

  const aktif = TINGKAT_UDARA.findIndex((t) => aqi <= t.max);
  const idxAktif = aktif === -1 ? TINGKAT_UDARA.length - 1 : aktif;

  // Pemicu utama versi koreksi-rasio (dipecah lengkap di card Analisis Kimiawi).
  const pemicu = analisisKimia(current).dominan;
  const relatif = waktuRelatif(updatedAt);

  return (
    <section className="border-2 border-slate-200 rounded-2xl bg-white overflow-hidden flex flex-col">
      <div className="h-2 w-full" style={{ backgroundColor: info.color }} />

      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.14em] text-slate-500 uppercase">
            <Wind size={14} style={{ color: info.color }} strokeWidth={2.5} />
            Pos Udara • Ronda Warga
          </p>
          <span
            className="inline-flex items-center text-[11px] font-extrabold px-2.5 py-1 rounded-full"
            style={{ color: info.color, backgroundColor: info.bg }}
          >
            {info.label}
          </span>
        </div>

        <div className="flex items-stretch gap-4">
          <div className="shrink-0 w-24 rounded-2xl border-2 border-slate-200 bg-white flex flex-col items-center justify-center py-3">
            <span className="text-4xl font-black tabular-nums leading-none" style={{ color: info.color }}>
              {current.aqi ?? '--'}
            </span>
            <span className="text-[10px] font-bold text-slate-500 mt-1">US-AQI</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-black text-slate-900 leading-tight">
              Udara lagi {info.label.toLowerCase()}, Lur.
            </h3>
            <p className="text-[13px] font-medium text-slate-600 leading-snug mt-1">
              {info.advice}
            </p>
            <p className="text-[12px] text-slate-500 mt-2">
              Pemicu utama: <strong className="text-slate-800">{pemicu.nama} {String(pemicu.nilai)}</strong>
              <span className="text-slate-400"> ({pemicu.rasio}× batas aman)</span>
            </p>
          </div>
        </div>

        <ol className="rounded-2xl border-2 border-slate-100 overflow-hidden divide-y-2 divide-slate-100">
          {TINGKAT_UDARA.map((t, i) => {
            const on = i === idxAktif;
            return (
              <li
                key={t.label}
                className="flex items-center gap-3 px-3 py-1.5"
                style={on ? { backgroundColor: t.bg } : undefined}
              >
                <span className={`text-[12px] font-extrabold ${on ? 'text-slate-900' : 'text-slate-400'}`}>
                  {t.label}
                </span>
                <span className="ml-auto text-[11px] font-semibold text-slate-400">
                  {i === 0 ? '0–50' : i === 1 ? '51–100' : i === 2 ? '101–150' : i === 3 ? '151–200' : i === 4 ? '201–300' : '300+'}
                </span>
                {on && (
                  <span
                    className="text-[10px] font-black px-1.5 py-0.5 rounded-md text-white"
                    style={{ backgroundColor: t.color }}
                  >
                    POSISI KITA
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-2 flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">
              <DoorOpen size={15} className="text-slate-500" />
            </span>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Sirkulasi Rumah</p>
              <p className="text-[13px] font-extrabold text-slate-800">{aqi <= 60 ? 'Buka Terbatas' : 'Tutup Dulu'}</p>
            </div>
          </div>
          <div className="rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-2 flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">
              <ShieldCheck size={15} className="text-slate-500" />
            </span>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Pelindung Diri</p>
              <p className="text-[13px] font-extrabold text-slate-800">{aqi > 100 ? 'Wajib Masker' : aqi > 50 ? 'Siapin Masker' : 'Nggak Perlu'}</p>
            </div>
          </div>
        </div>

        {locationName && (
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Pos {locationName}</span>
            {relatif && <span className="font-bold text-emerald-600">{relatif}</span>}
          </div>
        )}
      </div>
    </section>
  );
}
