import React from 'react';
import { Wind, Leaf, DoorOpen, ShieldCheck } from 'lucide-react';
import { infoUdara, TINGKAT_UDARA } from '../../utils/aqi.js';

export function AqiCard({ data, loading }) {
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

  const polutan = [
    { nama: 'PM2.5', nilai: current.pm25 ?? current.pm2_5 ?? 0, satuan: 'µg/m³' },
    { nama: 'PM10', nilai: current.pm10 ?? 0, satuan: 'µg/m³' },
    { nama: 'O₃', nilai: current.o3 ?? 0, satuan: '' },
    { nama: 'NO₂', nilai: current.no2 ?? 0, satuan: '' },
    { nama: 'SO₂', nilai: current.so2 ?? 0, satuan: '' },
    { nama: 'CO', nilai: current.co ?? 0, satuan: '' },
  ];
  const pemicu = [...polutan].sort((a, b) => Number(b.nilai) - Number(a.nilai))[0];

  return (
    <section className="border-2 border-slate-200 rounded-2xl bg-white overflow-hidden flex flex-col">
      {/* Pita status atas */}
      <div className="h-2 w-full" style={{ backgroundColor: info.color }} />

      <div className="p-5 flex flex-col gap-4">
        {/* Eyebrow ronda */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold tracking-[0.14em] text-slate-500 uppercase">
            Pos Udara • Ronda Warga
          </p>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-full border-2"
            style={{ color: info.color, borderColor: info.color, backgroundColor: info.bg }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: info.color }} />
            {info.label}
          </span>
        </div>

        {/* Baris utama: kotak angka + sapaan */}
        <div className="flex items-stretch gap-4">
          <div
            className="shrink-0 w-24 rounded-2xl border-2 flex flex-col items-center justify-center py-3"
            style={{ borderColor: info.color, backgroundColor: info.bg }}
          >
            <Wind size={20} style={{ color: info.color }} strokeWidth={2.5} />
            <span className="text-4xl font-black tabular-nums leading-none mt-1" style={{ color: info.color }}>
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
              Pemicu tertinggi: <strong className="text-slate-800">{pemicu.nama} {String(pemicu.nilai)}</strong>
            </p>
          </div>
        </div>

        {/* Tangga warga vertikal — beda dari gauge horizontal lama */}
        <ol className="rounded-2xl border-2 border-slate-100 overflow-hidden divide-y-2 divide-slate-100">
          {TINGKAT_UDARA.map((t, i) => {
            const on = i === idxAktif;
            return (
              <li
                key={t.label}
                className="flex items-center gap-3 px-3 py-1.5"
                style={on ? { backgroundColor: t.bg } : undefined}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0 border-2 border-white"
                  style={{ backgroundColor: t.color, outline: on ? `2px solid ${t.color}` : 'none' }}
                />
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
                    KAMU DI SINI
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        {/* Aksi warga */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-2 flex items-center gap-2">
            <DoorOpen size={16} className="text-slate-500 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Jendela</p>
              <p className="text-[13px] font-extrabold text-slate-800">{aqi <= 60 ? 'Buka aja' : 'Tutup dulu'}</p>
            </div>
          </div>
          <div className="rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-2 flex items-center gap-2">
            <ShieldCheck size={16} className="text-slate-500 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Masker</p>
              <p className="text-[13px] font-extrabold text-slate-800">{aqi > 100 ? 'Wajib' : aqi > 50 ? 'Siapin' : 'Nggak perlu'}</p>
            </div>
          </div>
        </div>

        {/* Rincian penyumbang — list vertikal, bukan grid 3 kolom lama */}
        <details className="rounded-xl border-2 border-dashed border-slate-200 px-3 py-2">
          <summary className="text-[12px] font-extrabold text-slate-600 cursor-pointer flex items-center gap-1.5">
            <Leaf size={14} /> Rincian penyumbang (6 zat)
          </summary>
          <dl className="mt-2 divide-y divide-slate-100">
            {polutan.map((p) => (
              <div key={p.nama} className="flex items-center justify-between py-1">
                <dt className="text-[12px] font-bold text-slate-500">{p.nama}</dt>
                <dd className="text-[13px] font-extrabold text-slate-800 tabular-nums">
                  {p.nilai} <span className="font-semibold text-slate-400 text-[11px]">{p.satuan}</span>
                </dd>
              </div>
            ))}
          </dl>
        </details>
      </div>
    </section>
  );
}
