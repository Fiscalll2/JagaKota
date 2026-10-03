import React from 'react';
import { FlaskConical } from 'lucide-react';
import { analisisKimia } from '../../utils/kimiaUdara.js';

const NAMA_PANJANG = {
  pm25: { judul: 'Debu Sangat Halus (PM2.5)', mini: ['PM2.5', 'PARTIKEL'], desc: 'Partikel halus, masuk pernapasan.' },
  pm10: { judul: 'Debu Kasar (PM10)', mini: ['PM10', 'PARTIKEL'], desc: 'Debu jalan & aktivitas konstruksi.' },
  o3: { judul: 'Ozon (O₃)', mini: ['OZON', 'O3'], desc: 'Ozon permukaan, naik saat terik.' },
  no2: { judul: 'Nitrogen Dioksida (NO₂)', mini: ['NITROGEN', 'NO2'], desc: 'Gas knalpot & pembakaran.' },
  so2: { judul: 'Sulfur Dioksida (SO₂)', mini: ['SO2', 'SULFUR'], desc: 'Gas belerang, berbau saat tinggi.' },
  co: { judul: 'Karbon Monoksida (CO)', mini: ['CO', 'MONOKSIDA'], desc: 'Gas pembakaran tak sempurna.' },
};

const LABEL_STATUS = { aman: 'Aman', waspada: 'Waspada', bahaya: 'Bahaya' };

/**
 * KimiaCard — "ANALISIS KIMIAWI UDARA" ala foto 2: 3 baris teratas (peringkat
 * rasio) + 3 kotak mini. Logika tetap dari src/utils/kimiaUdara.js.
 */
export function KimiaCard({ current, locationName, province, loading }) {
  if (loading) {
    return (
      <section className="rounded-2xl border-2 border-slate-200 bg-white p-5 animate-pulse">
        <div className="h-4 w-1/3 bg-slate-200 rounded-full mb-4" />
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  const { daftar } = analisisKimia(current);
  const peringkat = [...daftar].sort((a, b) => b.rasio - a.rasio);
  const baris = peringkat.slice(0, 3);
  const mini = peringkat.slice(3, 6);
  const sensorAktif = daftar.filter((z) => !z.kosong).length;
  const kota = locationName || 'Kotamu';

  return (
    <section className="rounded-2xl border-2 border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400">
          <FlaskConical size={14} strokeWidth={2.5} />
          Analisis Kimiawi Udara
        </p>
        <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {sensorAktif} Sensor Aktif
        </span>
      </div>

      <h3 className="font-display-k mt-2 text-lg font-black tracking-tight text-slate-900 dark:text-white">
        Rincian Penyumbang Emisi {kota}
      </h3>
      <p className="text-[12px] font-medium text-slate-500">
        Data telemetri real-time dari stasiun pemantau ISPU{province && province !== kota ? ` ${province}` : ''}.
      </p>

      <div className="mt-3 divide-y divide-slate-100 rounded-2xl border-2 border-slate-100 dark:divide-slate-800 dark:border-slate-800">
        {baris.map((z) => {
          const meta = NAMA_PANJANG[z.id] || { judul: z.nama, desc: '' };
          return (
            <div key={z.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-black text-slate-900 dark:text-white">{meta.judul}</p>
                <p className="text-[12px] font-medium text-slate-500">{meta.desc}</p>
              </div>
              <p className="font-display-k shrink-0 text-[15px] font-black tabular-nums text-slate-900 dark:text-white">
                {z.nilai}
                {z.satuan && <span className="ml-1 text-[11px] font-bold text-slate-400">{z.satuan}</span>}
              </p>
              <span
                className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-extrabold"
                style={{ color: z.warna, backgroundColor: `${z.warna}14` }}
              >
                {LABEL_STATUS[z.status]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        {mini.map((z) => {
          const meta = NAMA_PANJANG[z.id] || { mini: [z.nama, ''] };
          return (
            <div key={z.id} className="rounded-xl border-2 border-slate-100 bg-slate-50/60 px-3 py-2.5 text-center dark:border-slate-800 dark:bg-slate-800/50">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                {meta.mini[0]} <span className="text-slate-400">({meta.mini[1]})</span>
              </p>
              <p className="font-display-k mt-0.5 text-[15px] font-black tabular-nums text-slate-900 dark:text-white">
                {z.nilai}
                {z.satuan && <span className="ml-0.5 text-[10px] font-bold text-slate-400">{z.satuan}</span>}
              </p>
              <p className="text-[11px] font-extrabold" style={{ color: z.warna }}>
                {LABEL_STATUS[z.status]}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default KimiaCard;
