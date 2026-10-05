import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { Wind, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { infoUdara } from '../../utils/aqi';
import { tanggalPenuhJaga } from '../../utils/format';

export function AqiChart({ hourlyData }) {
  const [metric, setMetric] = useState('aqi');

  if (!hourlyData || !hourlyData.time || !hourlyData.us_aqi) {
    return (
      <section className="flex min-h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-center text-sm font-semibold text-slate-500">
          Waduh, data tren udara 24 jam belum masuk.
          <span className="mt-1 block text-xs font-medium text-slate-400">Coba segarkan halaman sebentar lagi ya, warga.</span>
        </p>
      </section>
    );
  }

  const chartData = hourlyData.time.slice(0, 24).map((timeStr, index) => {
    const d = new Date(timeStr);
    const hour = `${String(d.getHours()).padStart(2, '0')}:00`;
    const aqiVal = Math.round(hourlyData.us_aqi ? hourlyData.us_aqi[index] : 0);
    const pm25Val = Math.round((hourlyData.pm2_5 ? hourlyData.pm2_5[index] : 0) * 10) / 10;
    const meta = infoUdara(aqiVal);
    const offset = d.getTimezoneOffset();
    const tzName = offset === -420 ? 'WIB' : offset === -480 ? 'WITA' : offset === -540 ? 'WIT' : 'WIB';
    return { time: hour, fullTime: `${hour} ${tzName}`, aqi: aqiVal, pm25: pm25Val, label: meta.label, color: meta.color, advice: meta.advice };
  });

  const aqiValues = chartData.map((d) => d.aqi);
  const avgAqi = Math.round(aqiValues.reduce((a, b) => a + b, 0) / (aqiValues.length || 1));
  const avgInfo = infoUdara(avgAqi);
  const avgPm25 = (chartData.reduce((a, b) => a + b.pm25, 0) / (chartData.length || 1)).toFixed(1);

  let maxItem = chartData[0];
  let minItem = chartData[0];
  chartData.forEach((item) => {
    if (item.aqi > maxItem.aqi) maxItem = item;
    if (item.aqi < minItem.aqi) minItem = item;
  });

  const isAqi = metric === 'aqi';
  const strokeColor = isAqi ? avgInfo.color : '#0284c7';
  const gradientId = isAqi ? 'jagaAqiGradient' : 'jagaPm25Gradient';

  function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="min-w-48 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 dark:border-slate-800">
          <span className="flex items-center gap-1 text-xs font-extrabold text-slate-800 dark:text-slate-100">
            <Clock size={12} /> {data.fullTime}
          </span>
          <span className="rounded px-1.5 py-0.5 text-[11px] font-extrabold" style={{ backgroundColor: `${data.color}22`, color: data.color }}>
            {data.label}
          </span>
        </div>
        <div className="mt-1.5 space-y-1">
          <p className="flex items-baseline justify-between gap-4 text-xs font-semibold text-slate-500">
            Indeks AQI <strong className="text-sm font-black" style={{ color: data.color }}>{data.aqi}</strong>
          </p>
          <p className="flex items-baseline justify-between gap-4 text-xs font-semibold text-slate-500">
            PM2.5 <strong className="text-[13px] font-extrabold text-slate-800 dark:text-slate-100">{data.pm25} µg/m³</strong>
          </p>
        </div>
        <p className="mt-1.5 border-t border-dashed border-slate-200 pt-1.5 text-[11px] leading-snug text-slate-500 dark:border-slate-700">{data.advice}</p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            <Wind size={18} strokeWidth={2.5} />
          </span>
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">Napas Kota 24 Jam Terakhir</h3>
            <p className="text-[11px] font-medium text-slate-500">Kapan udara paling segar buat jogging, warga? • {tanggalPenuhJaga(new Date())}</p>
          </div>
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {[
            { key: 'aqi', label: 'Indeks AQI' },
            { key: 'pm25', label: 'PM2.5' },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`rounded-md px-2.5 py-1 text-xs font-extrabold transition ${metric === m.key ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
          <p className="text-[11px] font-bold text-slate-500">Rata-rata sehari semalam</p>
          <p className="mt-0.5 flex items-baseline gap-1.5">
            <strong className="text-lg font-black" style={{ color: avgInfo.color }}>{isAqi ? avgAqi : avgPm25}</strong>
            <span className="text-xs font-bold" style={{ color: avgInfo.color }}>{isAqi ? `(${avgInfo.label})` : 'µg/m³'}</span>
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
          <p className="flex items-center gap-1 text-[11px] font-bold text-slate-500"><TrendingUp size={12} className="text-red-500" /> Paling pengap</p>
          <p className="mt-0.5 flex items-baseline gap-1.5">
            <strong className="text-lg font-black" style={{ color: maxItem.color }}>{isAqi ? maxItem.aqi : maxItem.pm25}</strong>
            <span className="text-xs font-semibold text-slate-500">jam {maxItem.time}</span>
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
          <p className="flex items-center gap-1 text-[11px] font-bold text-slate-500"><TrendingDown size={12} className="text-emerald-500" /> Paling segar</p>
          <p className="mt-0.5 flex items-baseline gap-1.5">
            <strong className="text-lg font-black" style={{ color: minItem.color }}>{isAqi ? minItem.aqi : minItem.pm25}</strong>
            <span className="text-xs font-semibold text-slate-500">jam {minItem.time}</span>
          </p>
        </div>
      </div>

      <div className="mt-2 h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="jagaAqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.45} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="jagaPm25Gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} interval="preserveStartEnd" />
            <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} domain={[0, 'auto']} />
            {isAqi && <ReferenceLine y={50} stroke="#059669" strokeDasharray="2 2" opacity={0.6} />}
            {isAqi && <ReferenceLine y={100} stroke="#b45309" strokeDasharray="2 2" opacity={0.6} />}
            {isAqi && <ReferenceLine y={150} stroke="#dc2626" strokeDasharray="2 2" opacity={0.6} />}
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey={metric} stroke={strokeColor} strokeWidth={3} fillOpacity={1} fill={`url(#${gradientId})`} name={isAqi ? 'Indeks AQI' : 'PM2.5'} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-800">
        <span className="font-bold">Patokan warga:</span>
        <div className="flex flex-wrap items-center gap-3 font-semibold">
          {[['#059669', 'Segar'], ['#b45309', 'Lumayan'], ['#c2410c', 'Pengap Sensitif'], ['#dc2626', 'Pengap'], ['#7c3aed', 'Pekat+']].map(([c, l]) => (
            <span key={l} className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: c }} />{l}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
