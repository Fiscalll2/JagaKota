import React from 'react';
import { CalendarDays, Droplets, Sun, ArrowUp, ArrowDown } from 'lucide-react';
import { visualCuaca } from '../../utils/weatherIcons';
import { RintikHujan } from '../weather/RintikHujan';
import { tanggalRingkasJaga, tanggalPenuhJaga } from '../../utils/format';

const KODE_HUJAN = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82];
const KODE_DERAS = [63, 65, 66, 67, 81, 82];

export function WeatherForecastChart({ dailyData }) {
  if (!dailyData || !dailyData.time) return null;

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const maxTemps = dailyData.temperature_2m_max?.slice(0, 7) || [];
  const minTemps = dailyData.temperature_2m_min?.slice(0, 7) || [];
  const highestTemp = maxTemps.length ? Math.round(Math.max(...maxTemps)) : 33;
  const lowestTemp = minTemps.length ? Math.round(Math.min(...minTemps)) : 23;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="anim-naik flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <CalendarDays size={18} strokeWidth={2.5} />
          </span>
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">Bekal Seminggu ke Depan</h3>
            <p className="text-[11px] font-medium text-slate-500">Biar nggak salah kostum, warga! • {tanggalPenuhJaga(new Date())}</p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Adem <strong className="text-slate-900 dark:text-white">{lowestTemp}°</strong> – Panas <strong className="text-slate-900 dark:text-white">{highestTemp}°</strong>
        </span>
      </div>

      <div className="mt-4 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 xl:grid xl:grid-cols-7 xl:overflow-visible xl:pb-0">
        {dailyData.time.slice(0, 7).map((dateStr, idx) => {
          const d = new Date(dateStr);
          const hariIni = idx === 0;
          const dayName = hariIni ? 'Hari Ini' : days[d.getDay()];
          const formattedDate = tanggalRingkasJaga(dateStr);
          const maxTemp = Math.round(dailyData.temperature_2m_max?.[idx] ?? 0);
          const minTemp = Math.round(dailyData.temperature_2m_min?.[idx] ?? 0);
          const rainProb = Math.round(dailyData.precipitation_probability_max?.[idx] ?? (dailyData.precipitation_sum?.[idx] > 0 ? 60 : 15));
          const rainSum = (dailyData.precipitation_sum?.[idx] ?? 0).toFixed(1);
          const uvMax = Math.round(dailyData.uv_index_max?.[idx] ?? 6);
          const code = dailyData.weather_code?.[idx] ?? 0;
          const visual = visualCuaca(code);
          const IconComp = visual.icon;
          const hujan = KODE_HUJAN.includes(code);
          const deras = hujan && (KODE_DERAS.includes(code) || rainProb >= 70);
          const goyang = !hujan && (rainProb >= 40 || uvMax >= 8);

          return (
            <article
              key={dateStr}
              style={{ animationDelay: `${idx * 70}ms` }}
              className={`anim-naik shrink-0 snap-start ${hariIni ? 'min-w-[154px]' : 'min-w-[138px]'} xl:min-w-0`}
            >
              <div
                className={`flex h-full min-h-60 flex-col items-center justify-between rounded-xl border p-3 text-center transition ${
                  hariIni
                    ? 'anim-hari-ini border-emerald-500 bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-950/30 xl:z-10 xl:scale-[1.03]'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                }`}
              >
                <div>
                  <p className={`text-sm font-extrabold ${hariIni ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-100'}`}>
                    {hariIni ? 'Hari Ini' : dayName}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{formattedDate}</p>
                </div>

                <span
                  className={`anim-pop my-2 flex items-center justify-center rounded-full border ${hariIni ? 'h-14 w-14' : 'h-12 w-12'}`}
                  style={{ backgroundColor: hariIni ? undefined : visual.bg, borderColor: hariIni ? '#10b981' : `${visual.color}40`, animationDelay: `${idx * 70 + 120}ms` }}
                >
                  {hariIni ? (
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-emerald-600 text-white">
                      {hujan ? (
                        <RintikHujan deras={deras} garis="#ffffff" awan="rgba(255,255,255,0.28)" className="h-10 w-10" />
                      ) : (
                        <IconComp size={26} strokeWidth={2.5} className={goyang ? 'anim-goyang' : ''} />
                      )}
                    </span>
                  ) : hujan ? (
                    <RintikHujan deras={deras} garis={visual.color} awan={visual.bg} className="h-9 w-9" />
                  ) : (
                    <IconComp size={24} color={visual.color} strokeWidth={2.5} className={goyang ? 'anim-goyang' : ''} />
                  )}
                </span>
                <p className={`flex min-h-7 items-center text-xs font-bold ${hariIni ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>{visual.label}</p>

                <div className={`mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-1 ${hariIni ? 'bg-white dark:bg-slate-900' : 'bg-white shadow-sm dark:bg-slate-900'}`}>
                  <span className="flex items-center gap-0.5 font-extrabold text-red-500" title={`Paling panas siang ini: ${maxTemp}°C`}>
                    <ArrowUp size={11} strokeWidth={3} /><span className={hariIni ? 'text-base' : 'text-sm'}>{maxTemp}°</span>
                  </span>
                  <span className="text-xs text-slate-400">/</span>
                  <span className="flex items-center gap-0.5 font-bold text-sky-600" title={`Paling adem malam nanti: ${minTemp}°C`}>
                    <ArrowDown size={11} strokeWidth={3} /><span className={hariIni ? 'text-[15px]' : 'text-[13px]'}>{minTemp}°</span>
                  </span>
                </div>

                <div className="mt-2 flex w-full items-center justify-between border-t border-dashed border-slate-200 pt-1.5 text-[11px] font-bold text-slate-500 dark:border-slate-700">
                  <span className={`flex items-center gap-1 ${rainProb >= 40 ? 'text-sky-600' : ''}`} title={`Peluang hujan ${rainProb}%, curah ${rainSum} mm. ${rainProb >= 40 ? 'Bawa payung ya warga!' : 'Aman, langit bersahabat.'}`}>
                    <Droplets size={11} strokeWidth={2.5} />{rainProb}%
                  </span>
                  <span className={`flex items-center gap-1 ${uvMax >= 8 ? 'text-orange-600' : ''}`} title={`UV maksimum ${uvMax}. ${uvMax >= 8 ? 'Jangan lupa sunscreen!' : 'Santai di luar oke.'}`}>
                    <Sun size={11} strokeWidth={2.5} />UV {uvMax}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p className="anim-naik mt-3 text-[11px] font-medium text-slate-400" style={{ animationDelay: '550ms' }}>
        Tips warga: payung lipat di tas itu penyelamat. Kalau UV 8+, topi + sunscreen wajib hukumnya.
      </p>
    </section>
  );
}
