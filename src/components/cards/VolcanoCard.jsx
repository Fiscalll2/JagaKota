import React from 'react';
import { Flame, Compass, ArrowRight, Mountain, TriangleAlert } from 'lucide-react';
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
    <section className="border-2 border-slate-200 rounded-2xl bg-white overflow-hidden flex flex-col">
      {/* Aksen kiri via pita atas */}
      <div className="h-2 w-full" style={{ backgroundColor: nearest.status.color }} />

      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.14em] text-slate-500 uppercase flex items-center gap-1.5">
              <Mountain size={13} /> Pos Gunung Api
            </p>
            <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">{nearest.name}</h3>
            <p className="text-[12px] font-semibold text-slate-500">
              {nearest.province} • {nearest.elevation} mdpl • {nearest.type}
            </p>
          </div>
          <span
            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1.5 rounded-xl text-white"
            style={{ backgroundColor: nearest.status.color }}
          >
            <Flame size={13} /> {nearest.status.code}
          </span>
        </div>

        {/* Kotak jarak verifikasi — 2 kolom sempit, bukan box horizontal lama */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border-2 border-slate-900 px-3 py-2.5">
            <p className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase"><Compass size={12} /> Jarak darimu</p>
            <p className="text-2xl font-black tabular-nums text-slate-900 leading-tight">{jarak}<span className="text-sm font-bold text-slate-400"> km</span></p>
            <p className="text-[10px] font-semibold text-slate-400">diukur ulang • hitungJarakKm</p>
          </div>
          <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 px-3 py-2.5">
            <p className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase"><TriangleAlert size={12} /> Zona kamu</p>
            <p className="text-lg font-black leading-tight" style={{ color: zonaWarna }}>
              {zona === 'bahaya' ? 'Di radius bahaya' : zona === 'waspada' ? 'Ikut waspada' : 'Masih aman'}
            </p>
            <p className="text-[11px] font-semibold text-slate-500">Steril {nearest.dangerRadiusKm} km dari kawah</p>
          </div>
        </div>

        {/* Anjuran PVMBG sebagai kutipan */}
        <blockquote
          className="rounded-2xl border-l-8 px-4 py-3 text-[13px] font-medium leading-snug"
          style={{ borderColor: nearest.status.color, backgroundColor: nearest.status.bg || '#f8fafc' }}
        >
          <span className="font-extrabold block text-[12px] uppercase tracking-wide opacity-70">
            Kata PVMBG ({nearest.status.name})
          </span>
          {nearest.status.recommendation || nearest.note}
        </blockquote>

        {tetangga.length > 0 && (
          <p className="text-[12px] font-semibold text-slate-500">
            Tetangga lain: {tetangga.map((v) => `${v.name} (${v.distanceKm} km)`).join(' • ')}
          </p>
        )}

        {/* Tombol full-width di bawah — bukan tombol kecil kanan lama */}
        <button
          onClick={onOpenModal}
          className="w-full rounded-2xl border-2 border-slate-900 bg-white px-4 py-3 text-[13px] font-extrabold text-slate-900 flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-colors"
        >
          {waspada ? 'Cek daftar gunung — ada yang siaga!' : 'Lihat semua gunung di Indonesia'}
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
