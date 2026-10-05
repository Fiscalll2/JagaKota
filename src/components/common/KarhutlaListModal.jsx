import React, { useState, useMemo, useEffect } from 'react';
import { Flame, X, Search, Satellite, Thermometer, Zap, MapPin, ExternalLink } from 'lucide-react';
import { SATELLITE_HOTSPOTS } from '../../utils/karhutla';
import { calculateDistance } from '../../utils/geo';

const PULAU_SIAGA = ['Semua', 'Jawa', 'Sumatera', 'Kalimantan', 'Sulawesi', 'Bali & Nusa Tenggara', 'Maluku & Papua'];
const TINGKAT_API = [
  { id: 'ALL', label: 'Semua' },
  { id: 'HIGH', label: 'Tinggi' },
  { id: 'MODERATE', label: 'Sedang' },
];

export function KarhutlaListModal({ isOpen, onClose, userLocation, hotspots = SATELLITE_HOTSPOTS }) {
  const [pencarian, setPencarian] = useState('');
  const [pulau, setPulau] = useState('Semua');
  const [tingkat, setTingkat] = useState('ALL');

  useEffect(() => {
    if (!isOpen) return undefined;
    const jagaEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', jagaEsc);
    return () => window.removeEventListener('keydown', jagaEsc);
  }, [isOpen, onClose]);

  const sumber = useMemo(
    () => (hotspots && hotspots.length > 0 ? hotspots : SATELLITE_HOTSPOTS),
    [hotspots],
  );

  const berJarak = useMemo(() => {
    const adaPosisi = Boolean(userLocation?.lat && userLocation?.lon);
    return sumber
      .map((titik) => ({
        ...titik,
        distanceKm: adaPosisi
          ? Math.round(calculateDistance(userLocation.lat, userLocation.lon, titik.lat, titik.lon) * 10) / 10
          : null,
      }))
      .sort((a, b) => (a.distanceKm ?? 999999) - (b.distanceKm ?? 999999));
  }, [sumber, userLocation]);

  const tersaring = useMemo(() => {
    const q = pencarian.toLowerCase().trim();
    return berJarak.filter((titik) => {
      const cocokTeks =
        !q ||
        titik.regency.toLowerCase().includes(q) ||
        titik.province.toLowerCase().includes(q) ||
        titik.type.toLowerCase().includes(q);
      const cocokPulau = pulau === 'Semua' || titik.island === pulau;
      let cocokTingkat = true;
      if (tingkat === 'HIGH') cocokTingkat = titik.confidence.includes('Tinggi') || titik.confidenceLevel === 'HIGH';
      if (tingkat === 'MODERATE') cocokTingkat = titik.confidence.includes('Sedang') || titik.confidenceLevel === 'MODERATE';
      return cocokTeks && cocokPulau && cocokTingkat;
    });
  }, [berJarak, pencarian, pulau, tingkat]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Daftar titik panas karhutla"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex items-center justify-between gap-3 border-b-2 border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-orange-500 text-white">
              <Flame size={20} strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-slate-900 sm:text-lg dark:text-white">
                Radar Titik Panas Nusantara
              </h3>
              <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                VIIRS · NOAA-20 · MODIS — FIRMS / SiPongi+ KLHK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup daftar karhutla"
            className="grid size-9 shrink-0 place-items-center rounded-xl border-2 border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <X size={17} strokeWidth={2.5} />
          </button>
        </div>

        <div className="grid gap-2.5 border-b-2 border-slate-100 bg-slate-50 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={pencarian}
              onChange={(e) => setPencarian(e.target.value)}
              placeholder="Saring: Bengkalis, gambut, savana, Bromo…"
              className="w-full rounded-xl border-2 border-slate-200 bg-white py-2 pl-9 pr-3 text-[13px] font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-orange-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {PULAU_SIAGA.map((nama) => (
              <button
                key={nama}
                onClick={() => setPulau(nama)}
                className={
                  pulau === nama
                    ? 'shrink-0 rounded-full bg-orange-500 px-3 py-1 text-[11px] font-extrabold text-white'
                    : 'shrink-0 rounded-full border-2 border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                }
              >
                {nama}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1.5">
              {TINGKAT_API.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTingkat(t.id)}
                  className={
                    tingkat === t.id
                      ? 'rounded-lg border-2 border-red-500 bg-red-50 px-2.5 py-0.5 text-[11px] font-extrabold text-red-600 dark:bg-red-500/10 dark:text-red-300'
                      : 'rounded-lg border-2 border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {tersaring.length} dari {sumber.length} titik
            </span>
          </div>
        </div>

        <div className="grid flex-1 gap-2.5 overflow-y-auto px-5 py-4">
          {tersaring.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-extrabold text-slate-800 dark:text-white">Saring tidak cocok.</p>
              <p className="mt-1 text-xs text-slate-500">Longgarkan kata kunci atau pilih pulau “Semua”.</p>
            </div>
          ) : (
            tersaring.map((titik) => {
              const panas = titik.confidence.includes('Tinggi') || titik.confidenceLevel === 'HIGH';
              return (
                <article
                  key={titik.id}
                  className="grid gap-2 rounded-2xl border-2 border-slate-100 bg-white p-3.5 sm:grid-cols-[1fr_auto] sm:items-center dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm font-extrabold text-slate-900 dark:text-white">{titik.regency}</strong>
                      <span
                        className={
                          panas
                            ? 'rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-extrabold text-red-600 dark:bg-red-500/15 dark:text-red-300'
                            : 'rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                        }
                      >
                        {titik.confidence}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {titik.province} ({titik.island}) · <span className="font-bold text-slate-700 dark:text-slate-200">{titik.type}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1"><Satellite size={12} /> {titik.satellite}</span>
                      <span className="inline-flex items-center gap-1"><Thermometer size={12} /> {titik.brightnessK} K</span>
                      <span className="inline-flex items-center gap-1"><Zap size={12} /> {titik.frpMw} MW</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    {titik.distanceKm !== null && (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1 text-sm font-black text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <MapPin size={13} /> {titik.distanceKm} km
                      </span>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-slate-100 bg-slate-50 px-5 py-3 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            NASA FIRMS &amp; SiPongi+
            <a
              href="https://sipongi.gakkum.kehutanan.go.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-extrabold text-emerald-600"
            >
              Portal SiPongi+ <ExternalLink size={11} />
            </a>
          </span>
          <button
            onClick={onClose}
            className="rounded-xl border-2 border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
