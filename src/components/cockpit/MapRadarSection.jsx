import React from 'react';
import { Zap, Mountain, Flame, Building2 } from 'lucide-react';

/**
 * MapRadarSection — pembungkus gelap ala "PETA PANTAUAN NUSANTARA" di ui_ux_redesign.
 * PENTING: peta di dalamnya TETAP IndonesiaMap asli (Leaflet + OSM), hanya posisinya
 * dipindah ke dalam panel radar gelap ini. Komponen ini tidak menyentuh logika peta.
 *
 * Props:
 * - locationName: string "lon • lat" untuk badge RADAR-LIVE
 * - counts: { quake, volcano, hotspot, city }
 * - onOpenQuake / onOpenVolcano / onOpenHotspot / onOpenCity: callback opsional
 * - children: <IndonesiaMap .../> asli dari App.jsx
 */
export function MapRadarSection({
  coordsLabel = '',
  counts = {},
  onOpenQuake,
  onOpenVolcano,
  onOpenHotspot,
  onOpenCity,
  children,
}) {
  const quake = counts.quake ?? 0;
  const volcano = counts.volcano ?? 0;
  const hotspot = counts.hotspot ?? 0;
  const city = counts.city ?? 0;

  return (
    <section className="cockpit-panel relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-5 text-white">
      <div className="relative z-10 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
            <span className="radar-beacon h-2 w-2 rounded-full bg-emerald-400" />
            Peta Pantauan Nusantara
          </div>
          <h3 className="mt-0.5 text-base font-extrabold text-white">Radar Monitoring Lingkungan</h3>
          <p className="text-xs text-slate-400">
            Stasiun pantau kualitas udara, gempa bumi BMKG &amp; sebaran titik api satelit.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-emerald-700/60 bg-emerald-950/80 px-2.5 py-1 font-mono text-[10px] text-emerald-300">
            RADAR-LIVE • {coordsLabel || '—'}
          </span>
        </div>
      </div>

      {/* Bingkai peta asli — Leaflet tetap hidup di sini */}
      <div className="radar-frame relative z-10 mt-4 overflow-hidden rounded-xl border border-slate-800">
        {children}
      </div>

      <div className="relative z-10 flex flex-wrap items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-[10px] backdrop-blur-sm">
        <span className="flex items-center gap-1.5 text-slate-300"><span className="h-2 w-2 rounded-full bg-rose-500" /> Gempa</span>
        <span className="flex items-center gap-1.5 text-slate-300"><span className="h-2 w-2 rotate-45 rounded-sm bg-amber-400" /> Gunung</span>
        <span className="flex items-center gap-1.5 text-slate-300"><span className="h-2 w-2 rounded-full bg-orange-500" /> Titik Api</span>
        <span className="flex items-center gap-1.5 text-slate-300"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Stasiun Udara</span>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
        <button
          type="button"
          onClick={onOpenQuake}
          className="inline-flex items-center justify-between rounded-xl border border-rose-900/60 bg-slate-900 px-3 py-2 text-xs font-bold text-rose-300 transition hover:bg-slate-800"
        >
          <span className="flex items-center gap-1.5"><Zap size={14} className="text-rose-400" /> Gempa</span>
          <span className="rounded border border-rose-800/40 bg-rose-950 px-1.5 py-0.5 text-[10px] text-rose-200">{quake}</span>
        </button>
        <button
          type="button"
          onClick={onOpenVolcano}
          className="inline-flex items-center justify-between rounded-xl border border-amber-900/60 bg-slate-900 px-3 py-2 text-xs font-bold text-amber-300 transition hover:bg-slate-800"
        >
          <span className="flex items-center gap-1.5"><Mountain size={14} className="text-amber-400" /> Gunung</span>
          <span className="rounded border border-amber-800/40 bg-amber-950 px-1.5 py-0.5 text-[10px] text-amber-200">{volcano}</span>
        </button>
        <button
          type="button"
          onClick={onOpenHotspot}
          className="inline-flex items-center justify-between rounded-xl border border-orange-900/60 bg-slate-900 px-3 py-2 text-xs font-bold text-orange-300 transition hover:bg-slate-800"
        >
          <span className="flex items-center gap-1.5"><Flame size={14} className="text-orange-400" /> Api</span>
          <span className="rounded border border-orange-800/40 bg-orange-950 px-1.5 py-0.5 text-[10px] text-orange-200">{hotspot}</span>
        </button>
        <button
          type="button"
          onClick={onOpenCity}
          className="inline-flex items-center justify-between rounded-xl border border-teal-900/60 bg-slate-900 px-3 py-2 text-xs font-bold text-teal-300 transition hover:bg-slate-800"
        >
          <span className="flex items-center gap-1.5"><Building2 size={14} className="text-teal-400" /> Kota</span>
          <span className="rounded border border-teal-800/40 bg-teal-950 px-1.5 py-0.5 text-[10px] text-teal-200">{city}</span>
        </button>
      </div>
    </section>
  );
}
