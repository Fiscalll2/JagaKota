import React from 'react';
import { Gauge, Wind } from 'lucide-react';
import { visualCuaca } from '../../utils/weatherIcons';
import { RintikHujan } from '../weather/RintikHujan';

const KODE_HUJAN = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82];
const KODE_DERAS = [63, 65, 66, 67, 81, 82];

function tanggalLokalHariIni() {
  const d = new Date();
  const b = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${b(d.getMonth() + 1)}-${b(d.getDate())}`;
}

function idxJam(times = [], jamTarget) {
  const tgl = tanggalLokalHariIni();
  const pas = times.findIndex((t) => t.slice(0, 10) === tgl && Number(t.slice(11, 13)) === jamTarget);
  if (pas >= 0) return pas;
  let best = -1;
  let beda = 99;
  times.forEach((t, i) => {
    if (t.slice(0, 10) !== tgl) return;
    const dd = Math.abs(Number(t.slice(11, 13)) - jamTarget);
    if (dd < beda) { beda = dd; best = i; }
  });
  if (best >= 0) return best;
  return Math.max(0, Math.min(jamTarget, times.length - 1));
}

const SLOT = [
  { nama: 'Pagi', jam: '07:00', target: 7, aksen: 'emerald' },
  { nama: 'Siang', jam: '12:30', target: 12, aksen: 'amber' },
  { nama: 'Sore', jam: '16:00', target: 16, aksen: 'sky' },
  { nama: 'Malam', jam: '20:00', target: 20, aksen: 'gelap' },
];

const TINT = {
  emerald: 'border-emerald-100 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30',
  amber: 'border-amber-100 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30',
  sky: 'border-sky-100 bg-sky-50/70 dark:border-sky-900 dark:bg-sky-950/30',
};

/**
 * RincianJam — "RINCIAN JAM HARI INI" ala mock: 4 slot waktu dari hourly asli.
 * Sore menonjolkan peluang hujan, Malam kartu gelap + angin terkini.
 */
export function RincianJam({ hourly, current, location }) {
  const times = hourly?.time || [];
  if (!times.length) return null;

  const kepala = tanggalLokalHariIni().split('-').reverse().join('/');
  const subLokasi = [location?.name, location?.province].filter(Boolean).join(' • ');

  return (
    <section className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-[13px] font-black tracking-wide text-slate-900 dark:text-white">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          RINCIAN JAM HARI INI • {kepala}
        </p>
        {subLokasi && (
          <p className="truncate text-[11px] font-semibold text-slate-400">{subLokasi}</p>
        )}
      </div>

      <div className="mt-3 grid flex-1 grid-cols-2 gap-2 xl:grid-cols-4">
        {SLOT.map((s) => {
          const i = idxJam(times, s.target);
          const temp = Math.round(hourly.temperature_2m?.[i] ?? 0);
          const code = hourly.weather_code?.[i] ?? 2;
          const visual = visualCuaca(code);
          const Ikon = visual.icon;
          const hum = Math.round(hourly.relative_humidity_2m?.[i] ?? 0);
          const uv = Math.round(hourly.uv_index?.[i] ?? 0);
          const prob = Math.round(hourly.precipitation_probability?.[i] ?? 0);
          const hujan = KODE_HUJAN.includes(code);
          const deras = hujan && (KODE_DERAS.includes(code) || prob >= 70);
          const gelap = s.aksen === 'gelap';

          return (
            <div
              key={s.nama}
              className={`flex flex-col rounded-2xl border-2 p-3 ${
                gelap
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-950'
                  : `${TINT[s.aksen]} text-slate-900 dark:text-white`
              }`}
            >
              <p className="flex items-center justify-between text-[11px] font-extrabold">
                <span className="flex items-center gap-1">
                  {!gelap && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                  {s.nama}
                </span>
                <span className={`font-mono font-semibold ${gelap ? 'text-slate-300' : 'text-slate-400'}`}>{s.jam}</span>
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  gelap ? 'border-slate-700 bg-slate-800' : 'border-white bg-white/80'
                }`}>
                  {hujan ? (
                    <RintikHujan deras={deras} garis={gelap ? '#7dd3fc' : visual.color} awan={gelap ? 'rgba(125,211,252,0.2)' : visual.bg} className="h-8 w-8" />
                  ) : (
                    <Ikon size={22} style={{ color: gelap ? '#fbbf24' : visual.color }} strokeWidth={2.2} />
                  )}
                </span>
                <div>
                  <p className="text-xl font-black tabular-nums leading-none">{temp}°C</p>
                  <p className={`text-[11px] font-bold ${gelap ? 'text-slate-300' : 'text-slate-500'}`}>{visual.label}</p>
                </div>
              </div>
              <p className={`mt-auto pt-2 text-[11px] font-bold ${gelap ? 'text-slate-300' : 'text-slate-500'}`}>
                {s.nama === 'Sore' ? (
                  <>Peluang: {prob}% • UV {uv}</>
                ) : s.nama === 'Malam' ? (
                  <>Angin: {current?.windSpeed ?? '--'} km/j • UV {uv}</>
                ) : (
                  <>Lembap: {hum}% • UV {uv}{uv >= 8 ? '+' : ''}</>
                )}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-2.5 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Gauge size={13} className="text-emerald-600" />
          Tekanan Barometrik: <strong className="text-slate-800 dark:text-slate-100">{Math.round(current?.pressure || 1011)} hPa</strong>
        </span>
        <span className="flex items-center gap-1">
          <Wind size={13} className="text-sky-600" />
          Angin Permukaan: <strong className="text-slate-800 dark:text-slate-100">{current?.windSpeed ?? '--'} km/j</strong>
        </span>
        <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Model GFS & ECMWF Ensemble
        </span>
      </div>
    </section>
  );
}

export default RincianJam;
