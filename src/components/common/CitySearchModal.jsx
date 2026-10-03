import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, MapPin, ChevronRight, LocateFixed, History, Navigation } from 'lucide-react';
import { LogoMark } from './LogoMark';
import { INDONESIA_CITIES, REGIONS } from '../../utils/cities';
import { fetchWeatherData } from '../../services/weather';
import { fetchAirQualityData } from '../../services/airQuality';
import { hitungJarakPresisiKm } from '../../utils/geo';
import { triggerHaptic } from '../../utils/haptics';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const KUNCI_RIWAYAT = 'jagakota-riwayat-cari';
const MAKS_RIWAYAT = 5;
const MAKS_DEKAT = 6;

function bacaRiwayat() {
  try {
    const p = JSON.parse(localStorage.getItem(KUNCI_RIWAYAT));
    return Array.isArray(p) ? p.filter((n) => typeof n === 'string').slice(0, MAKS_RIWAYAT) : [];
  } catch {
    return [];
  }
}

function tulisRiwayat(nama) {
  try {
    const isi = [nama, ...bacaRiwayat().filter((n) => n !== nama)].slice(0, MAKS_RIWAYAT);
    localStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(isi));
  } catch {}
}

function hapusRiwayat() {
  try {
    localStorage.removeItem(KUNCI_RIWAYAT);
  } catch {}
}

function formatJarak(km) {
  if (!Number.isFinite(km)) return '';
  if (km < 1) return `${Math.max(1, Math.round(km * 1000))} m`;
  return `${km.toFixed(km < 10 ? 1 : 0).replace('.', ',')} km`;
}

function akurasiTeks(m) {
  const n = Number(m);
  if (!Number.isFinite(n) || n <= 0) return '';
  return n < 1000 ? `±${Math.round(n)} m` : `±${(n / 1000).toFixed(1).replace('.', ',')} km`;
}

// Sorot bagian nama yang cocok dengan kata kunci.
function NamaSorot({ nama, kata }) {
  const q = kata.trim();
  if (!q) return <>{nama}</>;
  const rendah = nama.toLowerCase();
  const idx = rendah.indexOf(q.toLowerCase());
  if (idx < 0) return <>{nama}</>;
  return (
    <>
      {nama.slice(0, idx)}
      <mark className="rounded bg-amber-200 px-0.5 text-inherit dark:bg-amber-500/40">
        {nama.slice(idx, idx + q.length)}
      </mark>
      {nama.slice(idx + q.length)}
    </>
  );
}

function BarisKota({ kota, aktif, kanan, kataKunci, onPilih, onHangat }) {
  return (
    <li>
      <button
        type="button"
        onMouseEnter={() => onHangat(kota)}
        onTouchStart={() => onHangat(kota)}
        onClick={() => onPilih(kota)}
        className={
          aktif
            ? 'flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-emerald-500 bg-emerald-50 px-3.5 py-3 text-left dark:bg-emerald-500/10'
            : 'flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-slate-100 bg-slate-50 px-3.5 py-3 text-left transition hover:border-emerald-400 dark:border-slate-800 dark:bg-slate-800/60'
        }
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className={
              aktif
                ? 'grid size-9 shrink-0 place-items-center rounded-full bg-emerald-500 text-white'
                : 'grid size-9 shrink-0 place-items-center rounded-full border-2 border-slate-100 bg-white text-emerald-600 dark:border-slate-700 dark:bg-slate-900'
            }
          >
            <MapPin size={16} strokeWidth={2.5} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-extrabold text-slate-900 dark:text-white">
              <NamaSorot nama={kota.name} kata={kataKunci} />
            </span>
            <span className="block truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {kota.province} · {kota.region}
            </span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {kanan}
          {aktif ? (
            <span className="rounded-lg border border-emerald-500 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
              Aktif
            </span>
          ) : (
            <ChevronRight size={16} className="text-slate-300" strokeWidth={2.5} />
          )}
        </span>
      </button>
    </li>
  );
}

function JudulSeksi({ ikon: Ikon, teks, aksi }) {
  return (
    <div className="mb-2 flex items-center justify-between px-1">
      <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
        <Ikon size={13} className="text-emerald-600 dark:text-emerald-400" />
        {teks}
      </p>
      {aksi}
    </div>
  );
}

export function CitySearchModal({
  isOpen,
  onClose,
  onSelectCity,
  currentCity = {},
  onRequestGps,
  gpsLoading = false,
}) {
  const [kataKunci, setKataKunci] = useState('');
  const [pulauAktif, setPulauAktif] = useState('Semua');
  const [riwayat, setRiwayat] = useState([]);
  const kolomCari = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setRiwayat(bacaRiwayat());
      const t = setTimeout(() => kolomCari.current?.focus(), 90);
      return () => clearTimeout(t);
    }
    setKataKunci('');
    setPulauAktif('Semua');
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const tutupEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', tutupEsc);
    return () => window.removeEventListener('keydown', tutupEsc);
  }, [isOpen, onClose]);

  const daftarKota = useMemo(() => {
    const q = kataKunci.toLowerCase().trim();
    return INDONESIA_CITIES.filter((kota) => {
      const cocokPulau =
        pulauAktif === 'Semua' ||
        kota.region === pulauAktif ||
        (pulauAktif === 'Nusantara' && kota.name.includes('Nusantara'));
      if (!cocokPulau) return false;
      if (!q) return true;
      return (
        kota.name.toLowerCase().includes(q) ||
        kota.province.toLowerCase().includes(q) ||
        kota.region.toLowerCase().includes(q)
      );
    });
  }, [kataKunci, pulauAktif]);

  // Kota terdekat dari titik pantau aktif — presisi desimal, tanpa fetch baru.
  const terdekat = useMemo(() => {
    const lat = Number(currentCity?.lat);
    const lon = Number(currentCity?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return [];
    return INDONESIA_CITIES.map((kota) => ({
      kota,
      km: hitungJarakPresisiKm(lat, lon, kota.lat, kota.lon),
    }))
      .filter((r) => Number.isFinite(r.km))
      .sort((a, b) => a.km - b.km)
      .slice(0, MAKS_DEKAT);
  }, [currentCity?.lat, currentCity?.lon]);

  const kotaRiwayat = useMemo(
    () => riwayat.map((nama) => INDONESIA_CITIES.find((k) => k.name === nama)).filter(Boolean),
    [riwayat]
  );

  // Hangatkan cache cuaca + udara saat kursor menyentuh baris kota.
  const hangatkanKota = (kota) => {
    if (!kota?.lat || !kota?.lon) return;
    fetchWeatherData(kota.lat, kota.lon, false).catch(() => {});
    fetchAirQualityData(kota.lat, kota.lon, false).catch(() => {});
  };

  const pilihKota = (kota) => {
    triggerHaptic(12);
    tulisRiwayat(kota.name);
    onSelectCity(kota);
    onClose();
  };

  if (!isOpen) return null;

  const namaAktif = currentCity?.name ? currentCity.name.replace(' (GPS)', '') : '';
  const sedangMencari = kataKunci.trim().length > 0;
  const tampil = daftarKota.slice(0, 80);
  const akurasi = akurasiTeks(currentCity?.akurasiM);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian kota JagaKota"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border-2 border-slate-200 bg-white sm:rounded-3xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kepala: hero GPS + kolom ketik */}
        <div className="border-b-2 border-slate-100 px-5 pb-4 pt-5 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <LogoMark size={40} className="block shrink-0" label="Logo JagaKota" />
              <div className="min-w-0">
                <h3 className="truncate text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Mau pantau mana, Lur?
                </h3>
                <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                  515 kota &amp; kabupaten · 38 provinsi
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Tutup pencarian kota"
              className="grid size-9 shrink-0 place-items-center rounded-xl border-2 border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <X size={17} strokeWidth={2.5} />
            </button>
          </div>

          {/* Hero GPS: titik pantau aktif + aksi lokasi */}
          <div className="mt-4 flex flex-col gap-2.5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-4 text-white sm:flex-row sm:items-center">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/20">
              <LocateFixed size={22} strokeWidth={2.4} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-100">
                Titik pantau aktif
              </p>
              <p className="truncate text-[15px] font-black leading-tight">
                {currentCity?.name || 'Jakarta Pusat'}
                {akurasi && <span className="ml-1.5 text-[11px] font-bold text-emerald-100">{akurasi}</span>}
              </p>
              <p className="truncate text-[11px] font-medium text-emerald-100/90">
                {currentCity?.province || 'DKI Jakarta'}
                {currentCity?.isGps ? ' · dari GPS-mu' : ''}
              </p>
            </div>
            {onRequestGps && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => { triggerHaptic(10); onRequestGps(); }}
                disabled={gpsLoading}
                className="shrink-0 border-white/40 bg-white font-extrabold text-emerald-700 hover:bg-emerald-50"
              >
                <Navigation className={gpsLoading ? 'animate-spin' : ''} />
                {gpsLoading ? 'Mencari…' : 'Pakai lokasiku'}
              </Button>
            )}
          </div>

          {/* Kolom ketik */}
          <div className="relative mt-3">
            <Search size={17} strokeWidth={2.5} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={kolomCari}
              type="text"
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              placeholder="Atau ketik nama kota, kabupaten, provinsi…"
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {kataKunci && (
              <button
                onClick={() => setKataKunci('')}
                aria-label="Bersihkan pencarian"
                className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Hasil */}
        <div className="flex-1 overflow-y-auto bg-white px-4 py-3 dark:bg-slate-900">
          {sedangMencari ? (
            <>
              <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {tampil.length} dari {daftarKota.length} wilayah · “{kataKunci.trim()}”
              </p>
              {daftarKota.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <p className="text-sm font-extrabold text-slate-800 dark:text-white">
                    Tidak ketemu “{kataKunci}”.
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Coba ejaan lain atau ganti penyaring pulau.</p>
                </div>
              ) : (
                <ul className="grid gap-2">
                  {tampil.map((kota) => (
                    <BarisKota
                      key={kota.name}
                      kota={kota}
                      aktif={namaAktif === kota.name}
                      kataKunci={kataKunci}
                      onPilih={pilihKota}
                      onHangat={hangatkanKota}
                    />
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="grid gap-4">
              {kotaRiwayat.length > 0 && (
                <section>
                  <JudulSeksi
                    ikon={History}
                    teks="Terakhir dilihat"
                    aksi={
                      <button
                        onClick={() => { hapusRiwayat(); setRiwayat([]); }}
                        className="text-[11px] font-bold text-slate-400 hover:text-rose-500"
                      >
                        Hapus
                      </button>
                    }
                  />
                  <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {kotaRiwayat.map((kota) => (
                      <button
                        key={kota.name}
                        onMouseEnter={() => hangatkanKota(kota)}
                        onTouchStart={() => hangatkanKota(kota)}
                        onClick={() => pilihKota(kota)}
                        className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <History size={13} className="text-slate-400" />
                        {kota.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {terdekat.length > 0 && (
                <section>
                  <JudulSeksi ikon={LocateFixed} teks="Terdekat darimu" />
                  <ul className="grid gap-2">
                    {terdekat.map(({ kota, km }) => (
                      <BarisKota
                        key={kota.name}
                        kota={kota}
                        aktif={namaAktif === kota.name}
                        kataKunci=""
                        kanan={
                          <Badge variant="secondary" className="gap-1 normal-case">
                            <Navigation size={11} />
                            {formatJarak(km)}
                          </Badge>
                        }
                        onPilih={pilihKota}
                        onHangat={hangatkanKota}
                      />
                    ))}
                  </ul>
                </section>
              )}

              <section>
                <JudulSeksi ikon={MapPin} teks="Semua wilayah" />
                <div className="mb-2 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {REGIONS.map((pulau) => {
                    const aktif = pulauAktif === pulau;
                    return (
                      <button
                        key={pulau}
                        onClick={() => {
                          triggerHaptic(8);
                          setPulauAktif(pulau);
                        }}
                        className={
                          aktif
                            ? 'shrink-0 rounded-full bg-emerald-500 px-3.5 py-1.5 text-xs font-extrabold text-white'
                            : 'shrink-0 rounded-full border-2 border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }
                      >
                        {pulau}
                      </button>
                    );
                  })}
                </div>
                <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  {tampil.length} dari {daftarKota.length} wilayah
                </p>
                <ul className="grid gap-2">
                  {tampil.map((kota) => (
                    <BarisKota
                      key={kota.name}
                      kota={kota}
                      aktif={namaAktif === kota.name}
                      kataKunci=""
                      onPilih={pilihKota}
                      onHangat={hangatkanKota}
                    />
                  ))}
                </ul>
              </section>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t-2 border-slate-100 bg-slate-50 px-5 py-3 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
          <span>ESC untuk menutup</span>
          <span>Sumber: BMKG · 515 wilayah</span>
        </div>
      </div>
    </div>
  );
}

export default CitySearchModal;
