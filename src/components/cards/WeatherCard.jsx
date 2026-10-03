import React from 'react';
import { Droplets, Wind, Gauge, MapPin, Footprints } from 'lucide-react';
import { visualCuaca } from '../../utils/weatherIcons.jsx';
import { calculateKotaSiaga } from '../../utils/kotaScore.js';

export function WeatherCard({ data, locationName, loading }) {
  if (loading) {
    return (
      <section className="border-2 border-slate-200 rounded-2xl bg-white p-5 animate-pulse min-h-[240px]">
        <div className="h-4 w-1/2 bg-slate-200 rounded-full mb-4" />
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl" />
          <div className="h-12 w-24 bg-slate-200 rounded-xl" />
        </div>
        <div className="space-y-2">
          <div className="h-10 bg-slate-200 rounded-xl" />
          <div className="h-10 bg-slate-200 rounded-xl" />
          <div className="h-10 bg-slate-200 rounded-xl" />
        </div>
      </section>
    );
  }

  const current = data?.current || {};
  const visual = visualCuaca(current.weatherCode ?? 0);
  const Ikon = visual.icon;
  const bersih = String(locationName || 'Lokasimu').replace(' (GPS)', '');

  const siaga = calculateKotaSiaga({
    aqi: 40,
    pm25: 10,
    temp: Number(current.temp) || 29,
    humidity: Number(current.humidity) || 70,
    uvIndex: 3,
  });
  const gerah = (Number(current.feelsLike) || 0) - (Number(current.temp) || 0);
  const rasaBadan = gerah >= 3 ? 'Geranya nampol' : gerah >= 1 ? 'Agak gerah' : 'Adem di badan';
  const saranKeluar = siaga.score >= 75 ? 'Gas keluar pagi ini' : siaga.score >= 50 ? 'Keluar pagi/sore aja' : 'Di rumah dulu, Lur';

  const baris = [
    { ikon: Droplets, nama: 'Lembapnya', nilai: `${current.humidity ?? '--'}%`, cat: Number(current.humidity) >= 85 ? 'Baju susah kering' : 'Masih wajar' },
    { ikon: Wind, nama: 'Anginnya', nilai: `${current.windSpeed ?? '--'} km/j`, cat: Number(current.windSpeed) >= 20 ? 'Kencang, jemuran awas' : 'Semilir' },
    { ikon: Gauge, nama: 'Tekanan', nilai: `${Math.round(current.pressure || 1012)} hPa`, cat: 'Stabil' },
  ];

  return (
    <section className="border-2 border-slate-200 rounded-2xl bg-white overflow-hidden flex flex-col">
      {/* Hero pita cuaca */}
      <div className="px-5 pt-5 pb-4 border-b-2 border-slate-100" style={{ backgroundColor: visual.bg }}>
        <p className="text-[11px] font-extrabold tracking-[0.14em] uppercase" style={{ color: visual.color }}>
          Cuaca Kampung • {visual.label}
        </p>
        <div className="flex items-center gap-4 mt-2">
          <div className="w-20 h-20 rounded-2xl border-2 border-white bg-white flex items-center justify-center shrink-0">
            <Ikon size={40} style={{ color: visual.color }} strokeWidth={2.2} />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-6xl font-black tabular-nums tracking-tighter text-slate-900 leading-none">
              {current.temp ?? '--'}°
            </span>
            <div className="pb-1">
              <p className="text-[11px] font-bold text-slate-500 leading-none">krasanya</p>
              <p className="text-lg font-extrabold text-slate-800 leading-tight">{current.feelsLike ?? '--'}°C</p>
            </div>
          </div>
        </div>
        <p className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold text-slate-600 bg-white/80 border border-white rounded-full px-2.5 py-1">
          <MapPin size={13} /> {bersih} • {rasaBadan}
        </p>
      </div>

      <div className="p-5 flex flex-col gap-3">
        {/* Saran keluar model ajakan */}
        <div className="rounded-2xl border-2 border-slate-900 bg-slate-900 text-white px-4 py-3 flex items-center gap-3">
          <Footprints size={20} className="shrink-0" />
          <div>
            <p className="text-[13px] font-extrabold leading-tight">{saranKeluar}</p>
            <p className="text-[11px] font-medium opacity-70">Skor rasa nyaman {siaga.score}/100 • {visual.label.toLowerCase()} di {bersih}</p>
          </div>
        </div>

        {/* Metrik sebagai daftar bertumpuk — bukan grid 3 kolom lama */}
        <ul className="rounded-2xl border-2 border-slate-100 divide-y-2 divide-slate-100 overflow-hidden">
          {baris.map((b) => (
            <li key={b.nama} className="flex items-center gap-3 px-4 py-2.5 bg-white">
              <span className="w-9 h-9 rounded-xl bg-slate-100 border-2 border-slate-100 flex items-center justify-center shrink-0">
                <b.ikon size={17} className="text-slate-600" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-500 uppercase leading-none">{b.nama}</p>
                <p className="text-[14px] font-extrabold text-slate-800">{b.nilai}</p>
              </div>
              <span className="ml-auto text-[11px] font-semibold text-slate-400 text-right max-w-[110px]">{b.cat}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
