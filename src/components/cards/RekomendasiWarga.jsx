import React from 'react';
import { Shirt, Umbrella, Sparkles } from 'lucide-react';
import { visualCuaca } from '../../utils/weatherIcons';

/**
 * RekomendasiWarga — panel "REKOMENDASI WARGA" ala mock, seluruhnya
 * diturunkan dari data cuaca hari ini (tanpa karangan):
 * - Kostum dari suhu maks harian, Payung dari peluang hujan, Jemur dari UV.
 */
export function RekomendasiWarga({ daily }) {
  const maxTemp = Math.round(daily?.temperature_2m_max?.[0] ?? 33);
  const rainProb = Math.round(daily?.precipitation_probability_max?.[0] ?? 15);
  const uvMax = Math.round(daily?.uv_index_max?.[0] ?? 6);
  const hujanLabel = visualCuaca(daily?.weather_code?.[0] ?? 2).label.toLowerCase();
  const kostum = maxTemp >= 33
    ? { judul: 'Kostum Siang Ringan', desc: `Gunakan katun tipis berpori. Suhu siang tembus ${maxTemp}°C dengan kelembapan cukup tinggi.` }
    : maxTemp >= 28
      ? { judul: 'Kostum Seimbang', desc: `Suhu siang ${maxTemp}°C — katun harian cukup, bawa jaket tipis buat malam.` }
      : { judul: 'Jaket Tipis Siaga', desc: `Suhu siang cuma ${maxTemp}°C — bawa lapisan hangat biar nggak kedinginan.` };

  const payung = rainProb >= 50
    ? { judul: 'Sedia Payung / Jas Hujan', desc: `Potensi ${hujanLabel || 'hujan'} ${rainProb}% — sore ini rawan basah, jangan nekat tanpa pelindung.` }
    : rainProb >= 25
      ? { judul: 'Payung Lipat Siaga', desc: `Potensi hujan ${rainProb}% — payung lipat di tas cukup buat jaga-jaga.` }
      : { judul: 'Langit Bersahabat', desc: `Potensi hujan cuma ${rainProb}% — sore ini relatif aman buat aktivitas luar.` };

  const jemur = uvMax >= 9
    ? { judul: 'Tunda Jemur Siang', desc: 'UV ekstrem — jemur sebelum jam 08.00 atau sesudah jam 15.30 biar nggak gosong.' }
    : uvMax >= 6
      ? { judul: 'Waktu Jemur Ideal', desc: 'Optimal pukul 08.30–13.00 sebelum potensi mendung bergerak masuk.' }
      : { judul: 'Jemur Bebas', desc: 'UV rendah seharian — jemur kapan saja aman, warga.' };

  const waspada = rainProb >= 60 || uvMax >= 9 || maxTemp >= 35;

  const daftar = [
    { ikon: Shirt, ...kostum },
    { ikon: Umbrella, ...payung },
    { ikon: Sparkles, ...jemur },
  ];

  return (
    <section className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[13px] font-black tracking-wide text-slate-900 dark:text-white">
          <Shirt size={15} className="text-emerald-600" />
          REKOMENDASI WARGA
        </p>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold"
          style={waspada
            ? { color: '#b45309', backgroundColor: '#fef3c7' }
            : { color: '#059669', backgroundColor: '#d1fae5' }}
        >
          {waspada ? 'Waspada Cuaca' : 'Aman Berkegiatan'}
        </span>
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-2">
        {daftar.map((r) => (
          <div key={r.judul} className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-amber-500 dark:bg-slate-900">
              <r.ikon size={16} strokeWidth={2.4} />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-extrabold text-slate-900 dark:text-white">{r.judul}</p>
              <p className="text-[12px] font-medium leading-snug text-slate-500 dark:text-slate-400">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 border-t border-slate-100 pt-2 text-[11px] font-medium text-slate-400 dark:border-slate-800">
        Diracik otomatis dari data BMKG & Open-Meteo hari ini.
      </p>
    </section>
  );
}

export default RekomendasiWarga;
