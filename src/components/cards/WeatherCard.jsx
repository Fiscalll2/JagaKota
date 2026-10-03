import React from 'react';
import { Droplets, Wind, Gauge, MapPin, Footprints } from 'lucide-react';
import { visualCuaca } from '../../utils/weatherIcons.jsx';
import { calculateKotaSiaga } from '../../utils/kotaScore.js';
import { CardSource } from '../common/CardSource';

function jamSingkat(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const b = (n) => String(n).padStart(2, '0');
  const off = d.getTimezoneOffset();
  const tz = off === -420 ? 'WIB' : off === -480 ? 'WITA' : off === -540 ? 'WIT' : 'WIB';
  return `${b(d.getHours())}:${b(d.getMinutes())} ${tz}`;
}

export function WeatherCard({ data, locationName, province, loading }) {
  if (loading) {
    return (
      <section className="border-2 border-slate-200 rounded-2xl bg-white p-5 animate-pulse min-h-[240px] dark:border-slate-800 dark:bg-slate-900">
        <div className="h-4 w-1/2 bg-slate-200 rounded-full mb-4 dark:bg-slate-700" />
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl dark:bg-slate-700" />
          <div className="h-12 w-24 bg-slate-200 rounded-xl dark:bg-slate-700" />
        </div>
        <div className="space-y-2">
          <div className="h-10 bg-slate-200 rounded-xl dark:bg-slate-700" />
          <div className="h-10 bg-slate-200 rounded-xl dark:bg-slate-700" />
          <div className="h-10 bg-slate-200 rounded-xl dark:bg-slate-700" />
        </div>
      </section>
    );
  }

  const current = data?.current || {};
  const visual = visualCuaca(current.weatherCode ?? 0);
  const Ikon = visual.icon;
  const bersih = String(locationName || 'Lokasimu').replace(' (GPS)', '');
  const adaData = current.temp !== undefined && current.temp !== null;

  const siaga = calculateKotaSiaga({
    aqi: 40,
    pm25: 10,
    temp: Number(current.temp) || 29,
    humidity: Number(current.humidity) || 70,
    uvIndex: 3,
  });
  const gerah = (Number(current.feelsLike) || 0) - (Number(current.temp) || 0);
  const rasaBadan = gerah >= 3 ? 'Geranya nampol' : gerah >= 1 ? 'Agak gerah' : 'Adem di badan';
  const saranKeluar = siaga.score >= 75 ? 'Gas Keluar Pagi Ini' : siaga.score >= 50 ? 'Keluar pagi/sore aja' : 'Di rumah dulu, Lur';

  const baris = [
    { ikon: Droplets, nama: 'Kelembapan', nilai: `${current.humidity ?? '--'}%`, cat: Number(current.humidity) >= 85 ? 'Baju susah kering' : 'Masih wajar' },
    { ikon: Wind, nama: 'Kecepatan Angin', nilai: `${current.windSpeed ?? '--'} km/j`, cat: Number(current.windSpeed) >= 20 ? 'Kencang, jemuran awas' : 'Semilir' },
    { ikon: Gauge, nama: 'Tekanan Udara', nilai: `${Math.round(current.pressure || 1012)} hPa`, cat: 'Stabil', hijau: true },
  ];

  const jam = jamSingkat(current.time);

  return (
    <section className="border-2 border-slate-200 rounded-2xl bg-white overflow-hidden flex flex-col dark:border-slate-800 dark:bg-slate-900">
      <div className="px-5 pt-5 pb-4 border-b-2 border-slate-100" style={{ backgroundColor: visual.bg }}>
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.14em] uppercase" style={{ color: visual.color }}>
            <Ikon size={14} strokeWidth={2.5} />
            Cuaca Kampung • {visual.label}
          </p>
          {adaData && (
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-extrabold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Sensor Aktif
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Ikon size={44} style={{ color: visual.color }} strokeWidth={2} className="shrink-0" />
            <span className="font-display-k text-6xl font-black tabular-nums tracking-tighter text-slate-900 leading-none">
              {current.temp ?? '--'}°
            </span>
            <div className="pb-0.5">
              <p className="text-[11px] font-bold text-slate-500 leading-none">Krasanya</p>
              <p className="text-lg font-extrabold text-slate-800 leading-tight">{current.feelsLike ?? '--'}°C</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-white/80 border border-white px-2.5 py-1 text-[11px] font-extrabold text-slate-600">
            {rasaBadan}
          </span>
        </div>
        <p className="mt-2 text-[12px] font-semibold text-slate-500">
          {bersih}{province && province !== bersih ? ` • ${province}` : ''}
        </p>
      </div>

      <div className="p-5 flex flex-col gap-3">
        <div className="rounded-2xl border-2 border-slate-900 bg-slate-900 text-white px-4 py-3 dark:border-slate-700">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-[13px] font-extrabold leading-tight">
              <Footprints size={18} className="shrink-0" />
              {saranKeluar}
            </p>
            <span className="shrink-0 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[11px] font-black text-white">
              {siaga.score}/100
            </span>
          </div>
          <p className="mt-1 text-[11px] font-medium opacity-70">Rasa nyaman {siaga.score}/100 • {visual.label.toLowerCase()} di {bersih}</p>
        </div>

        <ul className="rounded-2xl border-2 border-slate-100 divide-y-2 divide-slate-100 overflow-hidden dark:border-slate-800 dark:divide-slate-800">
          {baris.map((b) => (
            <li key={b.nama} className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-900">
              <span className="w-9 h-9 rounded-xl bg-slate-100 border-2 border-slate-100 flex items-center justify-center shrink-0 dark:bg-slate-800 dark:border-slate-700">
                <b.ikon size={17} className="text-slate-600 dark:text-slate-300" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-500 uppercase leading-none dark:text-slate-400">{b.nama}</p>
                <p className="text-[14px] font-extrabold text-slate-800 dark:text-slate-100">{b.nilai}</p>
              </div>
              {b.hijau ? (
                <span className="ml-auto text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">{b.cat}</span>
              ) : (
                <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">{b.cat}</span>
              )}
            </li>
          ))}
        </ul>

        <CardSource ids={['openmeteo', 'bmkg']} right={jam || null} />
      </div>
    </section>
  );
}
