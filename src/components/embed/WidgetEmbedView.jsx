import React from 'react';
import { ExternalLink, Wind, Droplets } from 'lucide-react';
import { getAqiInfo } from '../../utils/aqi';

// Kartu mungil JagaKota untuk mode sematan iframe (?embed=true).
// Sengaja ringan: Tailwind + sedikit gaya injeksi agar tetap rapi di situs luar.
export function WidgetEmbedView({ location, weatherData, airQualityData, ...sisa }) {
  void sisa;
  const namaKota = location?.name || 'DKI Jakarta';
  const angkaAqi = airQualityData?.current?.aqi || 42;
  const statusAqi = getAqiInfo(angkaAqi);
  const suhu = Math.round(weatherData?.current?.temperature || weatherData?.current?.temperature_2m || 30);
  const infoCuaca = weatherData?.current?.weatherCodeInfo?.label || 'Cerah Berawan';
  const lembap = weatherData?.current?.relative_humidity_2m || 75;
  const angin = Math.round(weatherData?.current?.wind_speed_10m || 12);

  const tautanApp =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?city=${encodeURIComponent(namaKota)}`
      : `https://jagakota.vercel.app/?city=${encodeURIComponent(namaKota)}`;

  return (
    <div className="flex h-screen w-screen flex-col justify-between gap-2 overflow-hidden bg-white p-3 font-sans text-slate-900 select-none dark:bg-slate-900 dark:text-white">
      {/* Baris atas: merek + lencana AQI */}
      <div className="flex items-center justify-between gap-2">
        <a href={tautanApp} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-1.5">
          <span className="size-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
          <span className="text-[13px] font-black tracking-tight">JagaKota</span>
          <span className="truncate text-xs font-semibold text-slate-500">· {namaKota}</span>
        </a>
        <span
          className="inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-extrabold"
          style={{ backgroundColor: statusAqi.bg, color: statusAqi.color, borderColor: `${statusAqi.color}33` }}
        >
          AQI {angkaAqi} ({statusAqi.label})
        </span>
      </div>

      {/* Baris tengah: suhu + kelembapan/angin */}
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200/70 bg-slate-50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="flex min-w-0 items-baseline gap-1.5">
          <span className="text-2xl font-black leading-none">{suhu}°C</span>
          <span className="max-w-[130px] truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
            {infoCuaca}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-[11px] font-bold text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Droplets size={12} className="text-sky-600" /> {lembap}%
          </span>
          <span className="inline-flex items-center gap-1">
            <Wind size={12} className="text-emerald-500" /> {angin} km/h
          </span>
        </div>
      </div>

      {/* Baris bawah: sumber + tautan penuh */}
      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
        <span>Data: BMKG &amp; Open-Meteo</span>
        <a
          href={tautanApp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold text-emerald-600"
        >
          Pantauan lengkap <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}
