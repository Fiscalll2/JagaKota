import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function AlertPolusi({ aqi = 0, pm25 = 0 }) {
  if (!aqi || aqi <= 150) return null;
  const kretek = pm25 > 0 ? (pm25 / 12).toFixed(1) : null;

  return (
    <section className="cockpit-panel relative overflow-hidden rounded-2xl border border-rose-600 bg-gradient-to-br from-rose-500 to-red-600 p-4 text-white">
      <div className="pointer-events-none absolute -bottom-6 -right-4 text-white opacity-10" aria-hidden>
        <AlertTriangle size={128} strokeWidth={1.5} />
      </div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
          <AlertTriangle size={14} className="animate-pulse" />
          Peringatan Polusi Udara
        </span>
        <span className="rounded-md border border-rose-400/30 bg-rose-900/60 px-2 py-0.5 text-xs font-black text-rose-100">
          (AQI: {aqi})
        </span>
      </div>
      <h2 className="text-sm font-bold leading-snug text-white">
        Udara lagi tidak sehat, Lur. Pakai masker kalau keluar rumah.
      </h2>
      {kretek && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-md">
          <div className="text-[11px] text-rose-100">Paparan hari ini</div>
          <div className="text-xs font-extrabold text-amber-300">≈ {kretek} kretek</div>
        </div>
      )}
    </section>
  );
}
