import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Globe, Code2 } from 'lucide-react';
import { LogoMark } from './LogoMark';
import { getAqiInfo } from '../../utils/aqi';

export function EmbedWidgetModal({ isOpen, onClose, location, airQualityData, weatherData }) {
  const [salinan, setSalinan] = useState(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    setSalinan(null);
    const jagaEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', jagaEsc);
    return () => window.removeEventListener('keydown', jagaEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const namaKota = location?.name || location?.city || 'Jakarta';
  const nilaiAqi = airQualityData?.current?.aqi || 42;
  const infoAqi = getAqiInfo(nilaiAqi);
  const suhu = Math.round(weatherData?.current?.temperature || weatherData?.current?.temperature_2m || 30);
  const cuaca = weatherData?.current?.weatherCodeInfo?.label || 'Cerah Berawan';

  const asal = typeof window !== 'undefined' ? window.location.origin : 'https://jagakota.vercel.app/';
  const tautanBingkai = `${asal}/?embed=true&city=${encodeURIComponent(namaKota)}`;
  const kodeBingkai = `<iframe src="${tautanBingkai}" width="340" height="190" frameborder="0" style="border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1);" title="JagaKota Live Widget - ${namaKota}"></iframe>`;
  const tautanLencana = `${asal}/api/badge?city=${encodeURIComponent(namaKota)}&aqi=${nilaiAqi}&status=${encodeURIComponent(infoAqi.label)}&temp=${suhu}`;
  const kodeMarkdown = `[![JagaKota AQI & Cuaca ${namaKota}](${tautanLencana})](${asal})`;

  const salinTeks = async (teks, jenis) => {
    try {
      await navigator.clipboard.writeText(teks);
    } catch {
      const area = document.createElement('textarea');
      area.value = teks;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }
    setSalinan(jenis);
    setTimeout(() => setSalinan(null), 2200);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Pasang widget JagaKota"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white p-5 sm:p-6 dark:bg-slate-900 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex items-start justify-between gap-3 border-b-2 border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              <Globe size={19} strokeWidth={2.5} />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Widget Web JagaKota</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kartu udara &amp; cuaca live untuk situs, blog, atau README GitHub
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup panel widget"
            className="grid size-9 shrink-0 place-items-center rounded-xl border-2 border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <X size={17} />
          </button>
        </div>

        <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Live · {namaKota}
          </p>
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-2">
              <strong className="flex min-w-0 items-center gap-1.5 truncate text-sm font-extrabold text-slate-900 dark:text-white">
                <LogoMark size={18} className="shrink-0" /> JagaKota · {namaKota}
              </strong>
              <span
                className="shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-extrabold"
                style={{ backgroundColor: infoAqi.bg, color: infoAqi.color }}
              >
                AQI {nilaiAqi} ({infoAqi.label})
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
              <span className="flex min-w-0 items-baseline gap-2">
                <b className="text-lg font-black text-slate-900 dark:text-white">{suhu}°C</b>
                <i className="truncate text-xs font-medium not-italic text-slate-500 dark:text-slate-400">{cuaca}</i>
              </span>
              <span className="shrink-0 text-[11px] font-semibold text-slate-400">BMKG · Open-Meteo</span>
            </div>
          </div>

          <p className="mt-3 text-center text-[11px] font-bold text-slate-400">Lencana Markdown / SVG</p>
          <div className="mt-1.5 flex justify-center">
            <div className="inline-flex max-w-full items-stretch overflow-hidden rounded-lg text-xs font-extrabold">
              <span className="inline-flex shrink-0 items-center gap-1 bg-emerald-500 px-2.5 py-1.5 text-white">
                <LogoMark size={14} className="shrink-0" /> JagaKota
              </span>
              <span className="inline-flex max-w-[170px] items-center truncate bg-slate-800 px-2.5 py-1.5 text-slate-100">
                {namaKota} ({suhu}°C)
              </span>
              <span
                className="inline-flex shrink-0 items-center px-2.5 py-1.5 text-white"
                style={{ backgroundColor: infoAqi.color || '#ef4444' }}
              >
                AQI {nilaiAqi} · {infoAqi.label}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-100">
              <Code2 size={14} className="text-emerald-600" /> 1. Iframe HTML web &amp; blog
            </label>
            <button
              onClick={() => salinTeks(kodeBingkai, 'bingkai')}
              className="inline-flex items-center gap-1 rounded-lg border-2 border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
            >
              {salinan === 'bingkai' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              {salinan === 'bingkai' ? 'Tersalin!' : 'Salin'}
            </button>
          </div>
          <textarea
            readOnly
            value={kodeBingkai}
            rows={2}
            className="w-full resize-none rounded-xl border-2 border-slate-200 bg-slate-50 p-2 font-mono text-[11px] leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-100">
              <Globe size={14} className="text-sky-500" /> 2. Markdown README &amp; Notion
            </label>
            <button
              onClick={() => salinTeks(kodeMarkdown, 'markdown')}
              className="inline-flex items-center gap-1 rounded-lg border-2 border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
            >
              {salinan === 'markdown' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              {salinan === 'markdown' ? 'Tersalin!' : 'Salin'}
            </button>
          </div>
          <input
            readOnly
            value={kodeMarkdown}
            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 p-2 font-mono text-[11px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center justify-between border-t-2 border-slate-100 pt-3.5 text-[11px] font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span>Gratis &amp; terbuka: BMKG · PVMBG · NASA · SiPongi+</span>
          <button
            onClick={onClose}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-extrabold text-white hover:bg-emerald-600"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
