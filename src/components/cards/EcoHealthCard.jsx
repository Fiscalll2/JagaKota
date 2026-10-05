import React from 'react';
import { ShieldCheck, Flag, Wind, Footprints, Baby, DoorOpen } from 'lucide-react';
import { calculateKotaSiaga } from '../../utils/kotaScore';

function SaranChip({ icon: Icon, title, value, color }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border-2 border-[var(--border-flat)] bg-[var(--bg-muted)] px-3 py-2.5">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: color }}
      >
        <Icon size={15} strokeWidth={2.5} />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold text-[var(--text-muted)]">{title}</span>
        <strong className="block truncate text-[13px] font-extrabold text-[var(--text-main)]">{value}</strong>
      </span>
    </div>
  );
}

export function EcoHealthCard({ aqiData, weatherData, loading }) {
  if (loading) {
    return (
      <section className="mb-6 animate-pulse rounded-2xl border-2 border-[var(--border-flat)] bg-[var(--bg-card)] p-5">
        <div className="mb-3 h-5 w-1/3 rounded bg-[var(--bg-muted)]" />
        <div className="mb-3 h-16 rounded-xl bg-[var(--bg-muted)]" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="h-14 rounded-xl bg-[var(--bg-muted)]" />
          <div className="h-14 rounded-xl bg-[var(--bg-muted)]" />
          <div className="h-14 rounded-xl bg-[var(--bg-muted)]" />
          <div className="h-14 rounded-xl bg-[var(--bg-muted)]" />
        </div>
      </section>
    );
  }

  const hasil = calculateKotaSiaga({
    aqi: aqiData?.current?.aqi ?? 0,
    pm25: aqiData?.current?.pm25 ?? 0,
    temp: weatherData?.current?.temp ?? 29,
    humidity: weatherData?.current?.humidity ?? 70,
    uvIndex: weatherData?.current?.uvIndex ?? 0,
    rainProb: weatherData?.daily?.[0]?.rainProb ?? weatherData?.current?.rainProb ?? 0,
  });

  return (
    <section
      className="mb-6 min-w-0 overflow-hidden rounded-2xl border-2 bg-[var(--bg-card)] p-5 sm:p-6"
      style={{ borderColor: hasil.color }}
      aria-label="Skor KotaSiaga JagaKota"
    >
      <div className="flex flex-wrap items-center gap-4">
        <div
          className="flex h-[76px] w-[76px] shrink-0 flex-col items-center justify-center rounded-2xl text-white shadow-sm"
          style={{ backgroundColor: hasil.color }}
        >
          <span className="text-3xl font-black leading-none">{hasil.score}</span>
          <span className="text-[11px] font-bold opacity-90">/100</span>
        </div>

        <div className="min-w-[200px] flex-1">
          <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest" style={{ color: hasil.color }}>
            <ShieldCheck size={14} strokeWidth={2.6} /> KotaSiaga • JagaKota
          </p>
          <h2 className="mt-0.5 text-xl font-black tracking-tight text-[var(--text-main)]">{hasil.label}</h2>
          <p className="mt-0.5 text-[13px] font-medium text-[var(--text-muted)]">{hasil.aksi}</p>
          <div className="mt-2 h-2 w-full max-w-md overflow-hidden rounded-full bg-[var(--bg-muted)]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${hasil.score}%`, backgroundColor: hasil.color }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl bg-[var(--bg-muted)] px-3.5 py-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full text-white" style={{ backgroundColor: hasil.color }}>
            <Flag size={17} strokeWidth={2.5} />
          </span>
          <span>
            <span className="block text-[11px] font-semibold text-[var(--text-muted)]">Paparan hari ini</span>
            <strong className="block text-sm font-extrabold text-[var(--text-main)]">
              {hasil.paparan > 0 ? `≈ ${hasil.paparan} kretek` : 'Udara bersih'}
            </strong>
          </span>
        </div>
      </div>

      <div className="mt-4 border-t-2 border-[var(--border-flat)] pt-4">
        <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-muted)]">
          Saran aksi warga
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <SaranChip icon={Footprints} title="Olahraga" value={hasil.saran.olahraga} color={hasil.color} />
          <SaranChip icon={Wind} title="Masker" value={hasil.saran.masker} color={hasil.color} />
          <SaranChip icon={Baby} title="Anak & Lansia" value={hasil.saran.anakLansia} color={hasil.color} />
          <SaranChip icon={DoorOpen} title="Ventilasi" value={hasil.saran.ventilasi} color={hasil.color} />
        </div>
      </div>
    </section>
  );
}

export default EcoHealthCard;
