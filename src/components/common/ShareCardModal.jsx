import React, { useState } from 'react';
import { Share2, ImageDown, ClipboardCopy, Check, X, MapPin, Thermometer, Wind, Flame, Activity } from 'lucide-react';
import { getAqiInfo } from '../../utils/aqi.js';
import { calculateKotaSiaga } from '../../utils/kotaScore.js';
import { getWeatherVisual } from '../../utils/weatherIcons.jsx';
import { formatFullCurrentDate } from '../../utils/format.js';
import { calculateFdrs, getNearbyHotspots, getHazeStatus } from '../../utils/karhutla.js';

export function ShareCardModal({ isOpen, onClose, location, airQualityData, weatherData, latestEarthquake, karhutlaData }) {
  const [tersalin, setTersalin] = useState(false);
  const [sibuk, setSibuk] = useState(false);

  if (!isOpen) return null;

  const namaKota = location?.name || location?.city || 'Indonesia';
  const namaProvinsi = location?.province || 'Indonesia';

  const aqi = Number(airQualityData?.current?.aqi) || 0;
  const pm25 = Number(airQualityData?.current?.pm25 ?? airQualityData?.current?.pm2_5) || 0;
  const suhu = Number(weatherData?.current?.temp ?? weatherData?.current?.temperature ?? 28);
  const lembap = Number(weatherData?.current?.humidity ?? 70);
  const uv = Number(weatherData?.current?.uvIndex ?? 0);
  const kodeCuaca = Number(weatherData?.current?.weatherCode ?? 0);

  const infoAqi = getAqiInfo(aqi);
  const kota = calculateKotaSiaga({ aqi, pm25, temp: suhu, humidity: lembap, uvIndex: uv });
  const visualCuaca = getWeatherVisual(kodeCuaca);
  const tanggalTampil = formatFullCurrentDate(new Date());

  const karhutlaAktif = karhutlaData || (location?.lat
    ? { fdrs: calculateFdrs(weatherData), nearest: getNearbyHotspots(location.lat, location.lon).nearest }
    : null);

  const fdrs = karhutlaAktif?.fdrs || calculateFdrs(weatherData);
  const titikApi = karhutlaAktif?.nearest || (location?.lat ? getNearbyHotspots(location.lat, location.lon).nearest : null);
  const { isHazeActive: asapAktif } = getHazeStatus(titikApi, aqi, pm25);

  const statusAsap = asapAktif ? 'TERPAPAR asap karhutla' : 'bebas asap karhutla';
  const infoApi = titikApi ? `Titik api terdekat ${titikApi.regency} (${titikApi.distanceKm} km)` : 'Nihil titik api terpantau';
  const infoGempa = latestEarthquake ? `Gempa M ${latestEarthquake.magnitude} di ${latestEarthquake.wilayah}. ` : 'Nihil gempa signifikan. ';

  const teksBerbagi = `Laporan JagaKota — ${namaKota}, ${namaProvinsi} (${tanggalTampil})\nSkor KotaSiaga: ${kota.score}/100 — ${kota.label}\nPaparan kretek: ±${kota.paparan} batang/hari (dari PM2.5 ${pm25} ug/m3)\nUdara: AQI ${aqi} (${infoAqi.label}) | Suhu ${suhu}C ${visualCuaca.label || ''} | Lembap ${lembap}%\nAsap: ${statusAsap}. ${infoApi}.\n${infoGempa}Saran warga: ${kota.aksi}\nLihat peta & pantauan: https://jagakota.vercel.app/`;

  function bungkusTeks(ctx, teks, x, y, lebarMaks, tinggiBaris, maksBaris = 2) {
    if (!teks) return y;
    const kata = String(teks).split(' ');
    let baris = '';
    let jumlah = 0;
    let cy = y;
    for (let i = 0; i < kata.length; i++) {
      const uji = baris ? `${baris} ${kata[i]}` : kata[i];
      if (ctx.measureText(uji).width > lebarMaks && i > 0) {
        jumlah += 1;
        if (jumlah >= maksBaris) {
          let potong = baris;
          while (potong.length > 0 && ctx.measureText(`${potong}...`).width > lebarMaks) potong = potong.slice(0, -1);
          ctx.fillText(`${potong}...`, x, cy);
          return cy + tinggiBaris;
        }
        ctx.fillText(baris, x, cy);
        baris = kata[i];
        cy += tinggiBaris;
      } else {
        baris = uji;
      }
    }
    ctx.fillText(baris, x, cy);
    return cy + tinggiBaris;
  }

  function gambarKartu(ctx, x, y, w, h, isi, garis) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 28);
    else ctx.rect(x, y, w, h);
    ctx.fillStyle = isi;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = garis;
    ctx.stroke();
  }

  function gambarHeader(ctx) {
    const grad = ctx.createLinearGradient(0, 0, 1080, 320);
    grad.addColorStop(0, '#064E3B');
    grad.addColorStop(0.55, '#059669');
    grad.addColorStop(1, '#0D9488');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 340);
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.beginPath();
    ctx.arc(940, 60, 170, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(120, 300, 110, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 64px Outfit, sans-serif';
    ctx.fillText('JAGAKOTA', 72, 130);
    ctx.font = '700 27px Outfit, sans-serif';
    ctx.fillStyle = '#D1FAE5';
    ctx.fillText('LAPORAN WARGA SIAGA • STORY 9:16', 74, 180);
    ctx.font = '600 25px Outfit, sans-serif';
    ctx.fillStyle = '#ECFDF5';
    bungkusTeks(ctx, tanggalTampil, 74, 232, 930, 32, 1);
  }

  function gambarBar(ctx, x, y, w, h, persen, warna) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, h / 2);
    else ctx.rect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.fill();
    const isi = Math.max(h, Math.round((w * Math.max(0, Math.min(100, persen))) / 100));
    if (isi > 0) {
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, isi, h, h / 2);
      else ctx.rect(x, y, isi, h);
      ctx.fillStyle = warna;
      ctx.fill();
    }
  }

  function gambarLencana(ctx, teks, x, y) {
    ctx.font = '800 24px Outfit, sans-serif';
    const w = Math.min(860, ctx.measureText(teks).width + 52);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, 58, 29);
    else ctx.rect(x, y, w, 58);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(teks, x + 26, y + 39);
    return w;
  }

  // Urutan gambar BARU: header gelap -> cuaca dulu -> KotaSiaga+bar -> udara -> karhutla -> gempa -> footer
  function buatGambarCerita() {
    return new Promise((selesai) => {
      const kanvas = document.createElement('canvas');
      kanvas.width = 1080;
      kanvas.height = 1920;
      const ctx = kanvas.getContext('2d');

      ctx.fillStyle = '#0B1220';
      ctx.fillRect(0, 0, 1080, 1920);
      gambarHeader(ctx);

      // A. Lokasi pita
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 52px Outfit, sans-serif';
      bungkusTeks(ctx, namaKota, 72, 430, 936, 58, 1);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 28px Outfit, sans-serif';
      bungkusTeks(ctx, namaProvinsi, 72, 492, 936, 34, 1);

      // B. Cuaca duluan (beda urutan dari versi lama)
      gambarKartu(ctx, 72, 540, 936, 250, '#111E33', '#1E3A5F');
      ctx.fillStyle = '#7DD3FC';
      ctx.font = '800 24px Outfit, sans-serif';
      ctx.fillText('CUACA & RASA PANAS', 116, 596);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 88px Outfit, sans-serif';
      ctx.fillText(`${suhu}°C`, 116, 700);
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '700 30px Outfit, sans-serif';
      bungkusTeks(ctx, `${visualCuaca.label || 'Cerah'} • Lembap ${lembap}% • UV ${uv}`, 420, 640, 520, 36, 2);

      // C. Skor KotaSiaga + bar progres + kretek
      gambarKartu(ctx, 72, 820, 936, 380, kota.color || '#059669', kota.color || '#059669');
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '800 26px Outfit, sans-serif';
      ctx.fillText('SKOR KOTASIAGA JAGAKOTA', 116, 884);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 120px Outfit, sans-serif';
      ctx.fillText(String(kota.score), 116, 1010);
      ctx.font = '800 44px Outfit, sans-serif';
      ctx.fillText('/100', 116 + ctx.measureText(String(kota.score)).width + 140, 1010);
      gambarLencana(ctx, kota.label || 'Aman', 116, 1032);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 27px Outfit, sans-serif';
      bungkusTeks(ctx, `Paparan kretek: ±${kota.paparan} batang/hari • ${kota.aksi || ''}`, 116, 1132, 848, 34, 2);
      gambarBar(ctx, 116, 1152, 848, 22, kota.score, '#FFFFFF');

      // D. Udara (AQI + PM)
      gambarKartu(ctx, 72, 1230, 936, 220, '#FFFFFF', '#E2E8F0');
      ctx.fillStyle = infoAqi.color || '#059669';
      ctx.font = '800 24px Outfit, sans-serif';
      ctx.fillText('KUALITAS UDARA (AQI US)', 116, 1286);
      ctx.font = '900 84px Outfit, sans-serif';
      ctx.fillText(String(aqi), 116, 1380);
      ctx.fillStyle = '#0F172A';
      ctx.font = '800 32px Outfit, sans-serif';
      bungkusTeks(ctx, infoAqi.label || 'Segar', 360, 1352, 580, 38, 1);
      ctx.fillStyle = '#64748B';
      ctx.font = '600 25px Outfit, sans-serif';
      ctx.fillText(`PM2.5 ${pm25} µg/m³ • ${infoAqi.advice || ''}`.slice(0, 64), 116, 1416);

      // E. Karhutla
      const garisAsap = asapAktif ? '#DC2626' : '#0E9F6E';
      gambarKartu(ctx, 72, 1478, 936, 190, asapAktif ? '#2A0E0E' : '#0B1F17', garisAsap);
      ctx.fillStyle = asapAktif ? '#FCA5A5' : '#6EE7B7';
      ctx.font = '800 24px Outfit, sans-serif';
      ctx.fillText(asapAktif ? 'AWAS ASAP KARHUTLA' : 'KARHUTLA TERPANTAU AMAN', 116, 1534);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '600 26px Outfit, sans-serif';
      bungkusTeks(ctx, `${statusAsap} — ${infoApi}. FDRS ${fdrs.code || fdrs.level || '-'}`, 116, 1578, 848, 32, 2);

      // F. Gempa / aman
      if (latestEarthquake) {
        gambarKartu(ctx, 72, 1692, 936, 104, '#FFFFFF', '#E2E8F0');
        ctx.fillStyle = '#DC2626';
        ctx.font = '900 40px Outfit, sans-serif';
        ctx.fillText(`M ${latestEarthquake.magnitude}`, 116, 1760);
        ctx.fillStyle = '#0F172A';
        ctx.font = '700 26px Outfit, sans-serif';
        bungkusTeks(ctx, latestEarthquake.wilayah || 'Indonesia', 340, 1740, 600, 32, 1);
      } else {
        gambarKartu(ctx, 72, 1692, 936, 104, '#ECFDF5', '#0E9F6E');
        ctx.fillStyle = '#065F46';
        ctx.font = '700 26px Outfit, sans-serif';
        ctx.fillText('Aman: nihil gempa & nihil titik api kritis.', 116, 1756);
      }

      ctx.textAlign = 'center';
      ctx.fillStyle = '#94A3B8';
      ctx.font = '700 26px Outfit, sans-serif';
      ctx.fillText('jagakota.vercel.app • BMKG • SiPongi+ • NASA', 540, 1862);
      ctx.textAlign = 'left';

      selesai(kanvas.toDataURL('image/png', 0.95));
    });
  }

  async function bagikanGambar() {
    setSibuk(true);
    try {
      const url = await buatGambarCerita();
      const respons = await fetch(url);
      const gumpalan = await respons.blob();
      const namaAman = String(namaKota).toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const berkas = new File([gumpalan], `jagakota-story-${namaAman}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [berkas] })) {
        await navigator.share({ files: [berkas], title: `Laporan JagaKota — ${namaKota}`, text: teksBerbagi });
      } else if (navigator.share) {
        await navigator.share({ title: `Laporan JagaKota — ${namaKota}`, text: teksBerbagi, url: window.location.href });
      } else {
        await unduhGambar();
      }
    } catch (e) {
      if (e?.name !== 'AbortError') {
        console.error(e);
        await unduhGambar();
      }
    } finally {
      setSibuk(false);
    }
  }

  async function unduhGambar() {
    setSibuk(true);
    try {
      const url = await buatGambarCerita();
      const namaAman = String(namaKota).toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const tautan = document.createElement('a');
      tautan.download = `jagakota-story-${namaAman}-${Date.now()}.png`;
      tautan.href = url;
      tautan.click();
    } catch (e) {
      console.error(e);
    } finally {
      setSibuk(false);
    }
  }

  function salinTeks() {
    navigator.clipboard.writeText(teksBerbagi);
    setTersalin(true);
    setTimeout(() => setTersalin(false), 2000);
  }

  const dalamGempa = latestEarthquake?.depth || latestEarthquake?.kedalaman || '-';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 bg-emerald-600 px-5 py-4 text-white">
          <div>
            <h3 className="flex items-center gap-2 text-base font-extrabold">Bagikan Laporan JagaKota</h3>
            <p className="mt-0.5 text-xs font-medium text-emerald-100">Story 9:16 + teks siap tempel ke WA/IG/X</p>
          </div>
          <button onClick={onClose} aria-label="Tutup" className="rounded-full bg-white/15 p-2 transition hover:bg-white/25">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="overflow-hidden rounded-2xl bg-slate-950 text-white ring-1 ring-slate-800">
            <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 px-5 pb-4 pt-5">
              <p className="text-[11px] font-extrabold tracking-widest text-emerald-100">LAPORAN JAGAKOTA • STORY 9:16</p>
              <h4 className="mt-1 flex items-center gap-1.5 text-2xl font-black leading-tight"><MapPin size={20} className="shrink-0" />{namaKota}</h4>
              <p className="mt-0.5 text-xs font-medium text-emerald-100">{namaProvinsi} • {tanggalTampil}</p>
            </div>

            <div className="space-y-3 px-4 py-4">
              <div className="rounded-2xl bg-slate-900 p-4 ring-1 ring-slate-700">
                <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wide text-sky-300">
                  <span className="flex items-center gap-1"><Thermometer size={13} />Cuaca saat ini</span>
                  <span>{lembap}% lembap</span>
                </div>
                <div className="mt-1 flex items-end justify-between gap-2">
                  <span className="text-4xl font-black">{suhu}°C</span>
                  <span className="pb-1 text-right text-sm font-bold text-slate-200">{visualCuaca.label}</span>
                </div>
              </div>

              <div className="rounded-2xl p-4 text-white" style={{ backgroundColor: kota.color }}>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-white/85">Skor KotaSiaga JagaKota</p>
                <div className="mt-1 flex items-end justify-between gap-2">
                  <p className="text-5xl font-black leading-none">{kota.score}<span className="text-lg font-extrabold text-white/80">/100</span></p>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">{kota.label}</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-black/25">
                  <div className="h-full rounded-full bg-white" style={{ width: `${Math.max(0, Math.min(100, kota.score))}%` }} />
                </div>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-white">Paparan kretek: ±{kota.paparan} batang/hari • {kota.aksi}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white p-3 text-slate-900">
                  <p className="flex items-center gap-1 text-[10px] font-extrabold uppercase" style={{ color: infoAqi.color }}><Wind size={12} />Udara</p>
                  <p className="mt-0.5 text-3xl font-black" style={{ color: infoAqi.color }}>{aqi}<span className="ml-1 text-[10px] font-bold text-slate-500">AQI</span></p>
                  <p className="truncate text-xs font-extrabold">{infoAqi.label}</p>
                  <p className="text-[11px] font-medium text-slate-500">PM2.5 {pm25}</p>
                </div>
                <div className={`rounded-2xl p-3 ring-1 ${asapAktif ? 'bg-red-950 text-red-100 ring-red-800' : 'bg-emerald-50 text-emerald-900 ring-emerald-200'}`}>
                  <p className="flex items-center gap-1 text-[10px] font-extrabold uppercase"><Flame size={12} />Karhutla</p>
                  <p className="mt-0.5 text-xs font-extrabold leading-snug">{asapAktif ? 'TERPAPAR ASAP' : 'BEBAS ASAP'}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] font-medium opacity-80">{titikApi ? `${titikApi.regency} • ${titikApi.distanceKm} km` : 'Nihil hotspot'} • FDRS {fdrs.code || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white p-3 text-slate-900">
                <span className="grid h-11 w-14 shrink-0 place-items-center rounded-xl bg-red-50 text-sm font-black text-red-600 ring-1 ring-red-200">{latestEarthquake ? `M ${latestEarthquake.magnitude}` : 'Aman'}</span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-[10px] font-extrabold uppercase text-slate-500"><Activity size={11} />{latestEarthquake ? 'Gempa BMKG' : 'Status siaga'}</p>
                  <p className="truncate text-xs font-bold">{latestEarthquake ? latestEarthquake.wilayah : 'Nihil peringatan kritis'}</p>
                  <p className="truncate text-[11px] text-slate-500">{latestEarthquake ? `Kedalaman ${dalamGempa} • ${latestEarthquake.potensi || 'Waspada'}` : 'BMKG • SiPongi+ • JagaKota'}</p>
                </div>
              </div>

              <p className="pb-1 text-center text-[11px] font-semibold text-slate-400">jagakota.vercel.app • BMKG • SiPongi+ • NASA</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <button onClick={bagikanGambar} disabled={sibuk} className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 disabled:opacity-60">
              <Share2 size={18} />{sibuk ? 'Merangkai gambar...' : 'Bagikan Story + Teks'}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={unduhGambar} disabled={sibuk} className="flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 px-2 py-3 text-xs font-bold text-slate-800 transition hover:bg-slate-200 disabled:opacity-60">
                <ImageDown size={16} />Simpan PNG
              </button>
              <button onClick={salinTeks} className="flex items-center justify-center gap-1.5 rounded-2xl bg-slate-900 px-2 py-3 text-xs font-bold text-white transition hover:bg-slate-700">
                {tersalin ? <Check size={16} /> : <ClipboardCopy size={16} />}{tersalin ? 'Tersalin!' : 'Salin Teks'}
              </button>
            </div>
          </div>
        </div>

        <p className="border-t border-slate-100 bg-slate-50 px-5 py-2.5 text-center text-[11px] font-medium text-slate-500">Berfungsi di HP (Web Share) & laptop (unduh otomatis).</p>
      </div>
    </div>
  );
}

export default ShareCardModal;
