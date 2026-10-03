import React from 'react';
import { Mountain, MapPin, ArrowRight } from 'lucide-react';
import { getNearbyVolcanoes } from '../../services/volcano.js';
import { hitungJarakKm } from '../../utils/geo.js';

export function VolcanoCard({ location, onOpenModal, isRefreshing }) {
  if (isRefreshing) {
    return (
      <section className="border-2 border-slate-200 rounded-2xl bg-white p-5 animate-pulse min-h-[240px]">
        <div className="h-4 w-1/2 bg-slate-200 rounded-full mb-4" />
        <div className="h-16 bg-slate-200 rounded-2xl mb-3" />
        <div className="h-11 bg-slate-200 rounded-2xl" />
      </section>
    );
  }

  const { nearest, list } = getNearbyVolcanoes(location?.lat, location?.lon);
  if (!nearest) return null;

  // Verifikasi jarak mandiri pakai util warga (bukan cuma percaya service)
  const cekJarak = hitungJarakKm(location?.lat, location?.lon, nearest.lat, nearest.lon);
  const jarak = Number.isFinite(cekJarak) && cekJarak > 0 ? cekJarak : nearest.distanceKm;
  const waspada = nearest.statusLevel >= 3;
  const zona = nearest.zona || (jarak <= (nearest.dangerRadiusKm || 3) ? 'bahaya' : jarak <= (nearest.dangerRadiusKm || 3) * 4 ? 'waspada' : 'aman');
  const zonaWarna = zona === 'bahaya' ? '#dc2626' : zona === 'waspada' ? '#d97706' : '#059669';
  const tetangga = (list || []).filter((v) => v.id !== nearest.id).slice(0, 2);

  return (
    <section className="rounded-2xl border-2 border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-5 md:grid-cols-[200px_minmax(0,230px)_minmax(0,1fr)]">
        {/* Kolom 1 — sumber */}
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ backgroundColor: `${nearest.status.color}1a`, color: nearest.status.color }}>
              <Mountain size={14} strokeWidth={2.5} />
            </span>
            PVMBG Magma
          </p>
          <h3 className="mt-1.5 text-lg font-black tracking-tight text-slate-900 dark:text-white">Aktivitas Gunung</h3>
          <p
            className="mt-1.5 inline-block rounded-lg px-2 py-1 text-[11px] font-extrabold"
            style={{ color: nearest.status.color, backgroundColor: `${nearest.status.color}14` }}
          >
            {nearest.status.code} ({nearest.status.name})
          </p>
          <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
            {nearest.name} ({nearest.elevation} mdpl)
          </p>
        </div>

        {/* Kolom 2 — angka besar */}
        <div>
          <p className="text-[44px] font-black leading-none tracking-tight text-slate-900 dark:text-white">
            {jarak}
            <span className="ml-1 text-base font-bold text-slate-400">km</span>
          </p>
          <p className="mt-1.5 text-[13px] font-semibold text-slate-600 dark:text-slate-300">
            Jarak dari {location?.name || 'lokasimu'}
          </p>
          <p className="mt-0.5 text-[13px] font-extrabold" style={{ color: zonaWarna }}>
            {zona === 'bahaya' ? 'Di radius bahaya' : zona === 'waspada' ? 'Ikut waspada' : 'Masih aman'}
          </p>
        </div>

        {/* Kolom 3 — lokasi + analisis + aksi */}
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="flex min-w-0 items-start gap-1.5 text-[13px] font-extrabold text-slate-800 dark:text-slate-100">
              <MapPin size={15} strokeWidth={2.5} className="mt-0.5 shrink-0" style={{ color: nearest.status.color }} />
              <span>
                Kawah {nearest.name} • {nearest.province}
                <span className="font-semibold text-slate-500 dark:text-slate-400"> ({jarak} km darimu)</span>
              </span>
            </p>
            <button
              onClick={onOpenModal}
              className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-lg border-2 border-slate-900 bg-white px-2.5 py-1.5 text-xs font-extrabold text-slate-900 transition-colors hover:bg-slate-900 hover:text-white dark:border-slate-100 dark:bg-transparent dark:text-white dark:hover:bg-slate-100 dark:hover:text-slate-900"
            >
              {waspada ? 'Cek — ada yang siaga!' : 'Semua Gunung'}
              <ArrowRight size={13} />
            </button>
          </div>
          <ul className="mt-2.5 space-y-1.5 text-[13px] font-medium leading-snug text-slate-600 dark:text-slate-300">
            <li className="flex gap-2">
              <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
              Radius steril {nearest.dangerRadiusKm} km dari kawah utama {nearest.name}.
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
              {nearest.status.recommendation || nearest.note}
            </li>
          </ul>
          {tetangga.length > 0 && (
            <p className="mt-2 text-[11px] font-semibold text-slate-400">
              Tetangga lain: {tetangga.map((v) => `${v.name} (${v.distanceKm} km)`).join(' • ')}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
