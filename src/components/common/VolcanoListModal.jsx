import React, { useState, useMemo, useEffect } from 'react';
import { Mountain, X, Search, MapPin } from 'lucide-react';
import { getNearbyVolcanoes } from '../../services/volcano';

const KAWASAN_GUNUNG = ['Semua', 'Jawa', 'Sumatera', 'Bali & Nusa Tenggara', 'Sulawesi', 'Maluku'];
const JENJANG_STATUS = [
  { id: 'ALL', label: 'Semua' },
  { id: 'ALERT', label: 'Siaga/Awas' },
  { id: 'WASPADA', label: 'Waspada' },
  { id: 'NORMAL', label: 'Normal' },
];

export function VolcanoListModal({ isOpen, onClose, userLocation }) {
  const [kata, setKata] = useState('');
  const [kawasan, setKawasan] = useState('Semua');
  const [jenjang, setJenjang] = useState('ALL');

  useEffect(() => {
    if (!isOpen) return undefined;
    setKata('');
    setKawasan('Semua');
    setJenjang('ALL');
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const jagaEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', jagaEsc);
    return () => window.removeEventListener('keydown', jagaEsc);
  }, [isOpen, onClose]);

  const semuaGunung = useMemo(
    () => getNearbyVolcanoes(userLocation?.lat, userLocation?.lon).allVolcanoes || [],
    [userLocation?.lat, userLocation?.lon],
  );

  const hasil = useMemo(() => {
    const q = kata.toLowerCase().trim();
    return semuaGunung.filter((gunung) => {
      const cocokTeks =
        !q ||
        gunung.name.toLowerCase().includes(q) ||
        gunung.province.toLowerCase().includes(q);
      const cocokKawasan = kawasan === 'Semua' || gunung.region === kawasan;
      let cocokJenjang = true;
      if (jenjang === 'ALERT') cocokJenjang = gunung.statusLevel >= 3;
      else if (jenjang === 'WASPADA') cocokJenjang = gunung.statusLevel === 2;
      else if (jenjang === 'NORMAL') cocokJenjang = gunung.statusLevel === 1;
      return cocokTeks && cocokKawasan && cocokJenjang;
    });
  }, [semuaGunung, kata, kawasan, jenjang]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Daftar gunung api Indonesia"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b-2 border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-red-500 text-white">
              <Mountain size={20} strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-slate-900 sm:text-lg dark:text-white">
                Pos Gunung Api Nusantara
              </h3>
              <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Pantauan seismik &amp; visual PVMBG / MAGMA ESDM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup daftar gunung api"
            className="grid size-9 shrink-0 place-items-center rounded-xl border-2 border-slate-200 text-slate-500 hover:bg-white dark:border-slate-700 dark:hover:bg-slate-900"
          >
            <X size={17} strokeWidth={2.5} />
          </button>
        </div>

        <div className="grid gap-2.5 border-b-2 border-slate-100 px-5 py-3.5 dark:border-slate-800">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={kata}
              onChange={(e) => setKata(e.target.value)}
              placeholder="Cari Merapi, Rinjani, atau nama provinsi…"
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-[13px] font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-red-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {KAWASAN_GUNUNG.map((nama) => (
              <button
                key={nama}
                onClick={() => setKawasan(nama)}
                className={
                  kawasan === nama
                    ? 'shrink-0 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-extrabold text-white dark:bg-white dark:text-slate-900'
                    : 'shrink-0 rounded-full border-2 border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                }
              >
                {nama}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {JENJANG_STATUS.map((s) => (
              <button
                key={s.id}
                onClick={() => setJenjang(s.id)}
                className={
                  jenjang === s.id
                    ? 'shrink-0 rounded-lg border-2 border-emerald-500 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : 'shrink-0 rounded-lg border-2 border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid flex-1 gap-2.5 overflow-y-auto px-5 py-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            {hasil.length} gunung terpantau
          </p>
          {hasil.length === 0 ? (
            <p className="py-10 text-center text-sm font-semibold text-slate-500">
              Tidak ada gunung yang cocok dengan saringan.
            </p>
          ) : (
            hasil.map((gunung) => (
              <article
                key={gunung.id}
                className="grid gap-1.5 rounded-2xl border-2 border-slate-100 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {gunung.name}
                    <span className="ml-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {gunung.elevation} mdpl · {gunung.province}
                    </span>
                  </strong>
                  <span
                    className="rounded-lg px-2 py-0.5 text-[11px] font-extrabold text-white"
                    style={{ backgroundColor: gunung.status.color }}
                  >
                    {gunung.status.code} · {gunung.status.name}
                  </span>
                </div>
                <p className="text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                  {gunung.note || gunung.status.description}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} /> {gunung.distanceKm} km dari Anda
                  </span>
                  <span>Zona steril {gunung.dangerRadiusKm} km</span>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="border-t-2 border-slate-100 bg-slate-50 px-5 py-3 text-center text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
          Disusun dari data pengamatan PVMBG Badan Geologi ESDM
        </div>
      </div>
    </div>
  );
}
