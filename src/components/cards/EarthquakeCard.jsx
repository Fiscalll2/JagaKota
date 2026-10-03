import React, { useState } from 'react';
import { Activity, AlertTriangle, ShieldCheck, MapPin, Clock, ChevronDown, ChevronUp, List, Compass } from 'lucide-react';
import { warnaGempa } from '../../utils/aqi';
import { calculateDistance } from '../../utils/geo';
import { tanggalPenuhJaga } from '../../utils/format';

function kategoriKedalaman(teks) {
  const angka = parseFloat(teks);
  if (!Number.isFinite(angka)) return '';
  if (angka <= 70) return 'Dangkal';
  if (angka <= 300) return 'Menengah';
  return 'Dalam';
}

export function EarthquakeCard({ earthquake, recentQuakes = [], onFocusQuake, userLocation, isRefreshing }) {
  const [showList, setShowList] = useState(false);

  if (isRefreshing) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse dark:border-slate-800 dark:bg-slate-900">
        <div className="h-5 w-2/5 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-4 h-14 w-1/3 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="mt-3 h-16 rounded-xl bg-slate-100 dark:bg-slate-800" />
        <p className="mt-3 text-xs font-medium text-slate-400">Lagi intip data BMKG, sabar ya warga...</p>
      </section>
    );
  }

  if (!earthquake) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Activity size={18} strokeWidth={2.5} />
          </span>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Kabar Gempa Terkini</h3>
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Aman terkendali, warga!</p>
          </div>
        </div>
        <p className="mt-3 rounded-xl bg-white/70 p-3 text-sm font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          Alhamdulillah, tidak ada gempa gede yang tercatat BMKG. Tetap waspada tapi jangan panik ya.
        </p>
      </section>
    );
  }

  const magColor = warnaGempa(earthquake.magnitude);
  const isMajor = Number(earthquake.magnitude) >= 5.0;

  const distanceKm = (userLocation?.lat && userLocation?.lon && earthquake.lat && earthquake.lon)
    ? calculateDistance(userLocation.lat, userLocation.lon, earthquake.lat, earthquake.lon)
    : null;

  const waktuPenuh = earthquake.date && earthquake.time
    ? `${earthquake.date} • ${earthquake.time}`
    : tanggalPenuhJaga(new Date());

  const dalamKategori = kategoriKedalaman(earthquake.depth);
  const aman = !isMajor;
  const warnaAman = '#059669';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-5 md:grid-cols-[200px_minmax(0,230px)_minmax(0,1fr)]">
        {/* Kolom 1 — sumber */}
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ backgroundColor: `${magColor}1a`, color: magColor }}>
              <Activity size={14} strokeWidth={2.5} />
            </span>
            BMKG Seismik
          </p>
          <h3 className="mt-1.5 text-lg font-black tracking-tight text-slate-900 dark:text-white">Gempa Terkini</h3>
          <p
            className="mt-1.5 inline-block rounded-lg px-2 py-1 text-[11px] font-extrabold"
            style={{ color: aman ? warnaAman : magColor, backgroundColor: aman ? `${warnaAman}14` : `${magColor}14` }}
          >
            {aman ? 'Kondisi Aman' : 'Waspada Gempa'}
          </p>
          <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <Clock size={12} strokeWidth={2.2} />
            {waktuPenuh}
          </p>
        </div>

        {/* Kolom 2 — angka besar */}
        <div>
          <p className="text-[44px] font-black leading-none tracking-tight" style={{ color: magColor }}>
            {earthquake.magnitude}
            <span className="ml-1 text-base font-bold">M</span>
          </p>
          <p className="mt-1.5 text-[13px] font-semibold text-slate-600 dark:text-slate-300">
            Kedalaman {earthquake.depth}{dalamKategori ? ` (${dalamKategori})` : ''}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[13px] font-extrabold" style={{ color: aman ? warnaAman : magColor }}>
            {aman ? <ShieldCheck size={14} strokeWidth={2.5} /> : <AlertTriangle size={14} strokeWidth={2.5} />}
            {earthquake.potensi || (aman ? 'Tidak berpotensi tsunami' : 'Waspada, cek info tsunami!')}
          </p>
        </div>

        {/* Kolom 3 — lokasi + analisis + aksi */}
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="flex min-w-0 items-start gap-1.5 text-[13px] font-extrabold text-slate-800 dark:text-slate-100">
              <MapPin size={15} strokeWidth={2.5} className="mt-0.5 shrink-0" style={{ color: magColor }} />
              <span>
                {earthquake.wilayah}
                {distanceKm !== null && (
                  <span className="font-semibold text-slate-500 dark:text-slate-400"> ({distanceKm} km darimu)</span>
                )}
              </span>
            </p>
            {recentQuakes.length > 0 && (
              <button
                onClick={() => setShowList(!showList)}
                className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <List size={13} strokeWidth={2.2} />
                {showList ? 'Tutup' : `Riwayat (${Math.min(recentQuakes.length, 5)})`}
                {showList ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            )}
          </div>
          <ul className="mt-2.5 space-y-1.5 text-[13px] font-medium leading-snug text-slate-600 dark:text-slate-300">
            <li className="flex gap-2">
              <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
              {dalamKategori === 'Dangkal'
                ? 'Episenter dangkal — guncangan terasa kuat di sekitar lokasi.'
                : dalamKategori
                  ? `Episenter ${dalamKategori.toLowerCase()} — getaran merambat lebih luas.`
                  : 'Pantau info resmi BMKG untuk perkembangan lanjutan.'}
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
              {aman ? 'Aktivitas warga berjalan aman, lanjut aktivitas!' : 'Tetap tenang, jauhi bangunan retak ya warga.'}
            </li>
          </ul>
          {distanceKm !== null && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Compass size={13} className="text-emerald-600" />
              Jarak ke episenter: <strong className="font-extrabold text-emerald-700 dark:text-emerald-300">{distanceKm} km</strong> dari posisimu
            </p>
          )}
        </div>
      </div>

      {showList && (
        <ul className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
          {recentQuakes.slice(0, 5).map((q, idx) => {
            const color = warnaGempa(q.magnitude);
            const qDist = (userLocation?.lat && userLocation?.lon && q.lat && q.lon)
              ? calculateDistance(userLocation.lat, userLocation.lon, q.lat, q.lon)
              : null;
            return (
              <li key={q.id || idx}>
                <button
                  onClick={() => onFocusQuake && onFocusQuake(q)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-left transition hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <span className="min-w-0 flex-1 truncate text-xs">
                    <strong className="mr-1.5 font-black" style={{ color }}>M {q.magnitude}</strong>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{q.wilayah}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-[11px] font-semibold text-slate-500">
                    {qDist !== null && <span className="font-bold text-emerald-600">{qDist} km</span>}
                    <span>{q.time}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
