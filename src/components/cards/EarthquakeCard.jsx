import React, { useState } from 'react';
import { Activity, AlertTriangle, ShieldCheck, MapPin, Clock, ChevronDown, ChevronUp, List, Compass } from 'lucide-react';
import { warnaGempa } from '../../utils/aqi';
import { calculateDistance } from '../../utils/geo';
import { tanggalPenuhJaga } from '../../utils/format';

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

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full text-white" style={{ backgroundColor: magColor }}>
            <Activity size={18} strokeWidth={2.5} />
          </span>
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">Kabar Gempa Terkini</h3>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Info langsung dari BMKG buat warga</p>
          </div>
        </div>
        <span className="rounded-lg px-2.5 py-1 text-xs font-black text-white" style={{ backgroundColor: magColor }}>
          M {earthquake.magnitude}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <p className="text-5xl font-black tracking-tighter" style={{ color: magColor }}>
          {earthquake.magnitude}
          <span className="ml-1 text-lg font-bold">M</span>
        </p>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Clock size={13} strokeWidth={2.2} />
            <span className="truncate">{waktuPenuh}</span>
          </p>
          <p className="mt-1 text-sm font-extrabold text-slate-800 dark:text-slate-100">
            Kedalaman: {earthquake.depth}
          </p>
          <p className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${isMajor ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}`}>
            {isMajor ? <AlertTriangle size={12} strokeWidth={2.5} /> : <ShieldCheck size={12} strokeWidth={2.5} />}
            {earthquake.potensi || (isMajor ? 'Waspada, cek info tsunami!' : 'Tidak berpotensi tsunami')}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
        <p className="flex items-start gap-2 text-[13px] font-semibold text-slate-800 dark:text-slate-100">
          <MapPin size={16} strokeWidth={2.5} className="mt-0.5 shrink-0" style={{ color: magColor }} />
          <span>{earthquake.wilayah}</span>
        </p>
        {distanceKm !== null && (
          <p className="ml-6 mt-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Compass size={13} className="text-emerald-600" />
            Jarak ke episenter: <strong className="font-extrabold text-emerald-700 dark:text-emerald-300">{distanceKm} km</strong> dari posisimu
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-slate-400">
          {isMajor ? 'Tetap tenang, jauhi bangunan retak ya warga.' : 'Guncangan kecil, aman. Lanjut aktivitas!'}
        </p>
        {recentQuakes.length > 0 && (
          <button
            onClick={() => setShowList(!showList)}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <List size={13} strokeWidth={2.2} />
            {showList ? 'Tutup' : `Riwayat (${Math.min(recentQuakes.length, 5)})`}
            {showList ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}
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
