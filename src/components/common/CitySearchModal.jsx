import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, MapPin, ChevronRight, Compass, Star } from 'lucide-react';
import { INDONESIA_CITIES, REGIONS } from '../../utils/cities';
import { fetchWeatherData } from '../../services/weather';
import { fetchAirQualityData } from '../../services/airQuality';
import { triggerHaptic } from '../../utils/haptics';

// Deretan kota andalan JagaKota untuk akses kilat warga.
const KOTA_ANDALAN_JAGA = [
  'Jakarta Pusat',
  'Surabaya',
  'Bandung',
  'Medan',
  'Denpasar',
  'Nusantara (IKN Sepaku)',
  'Makassar',
  'Yogyakarta',
  'Semarang',
  'Palembang',
];

export function CitySearchModal({ isOpen, onClose, onSelectCity, currentCity = {} }) {
  const [kataKunci, setKataKunci] = useState('');
  const [pulauAktif, setPulauAktif] = useState('Semua');
  const kolomCari = useRef(null);

  useEffect(() => {
    if (isOpen) {
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

  // Hangatkan cache cuaca + udara saat kursor menyentuh baris kota.
  const hangatkanKota = (kota) => {
    if (!kota?.lat || !kota?.lon) return;
    fetchWeatherData(kota.lat, kota.lon, false).catch(() => {});
    fetchAirQualityData(kota.lat, kota.lon, false).catch(() => {});
  };

  const pilihKota = (kota) => {
    triggerHaptic(12);
    onSelectCity(kota);
    onClose();
  };

  if (!isOpen) return null;

  const namaAktif = currentCity?.name ? currentCity.name.replace(' (GPS)', '') : '';
  const tampil = daftarKota.slice(0, 80);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian kota JagaKota"
    >
      <div
        className="flex w-full max-w-2xl max-h-[92vh] flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kepala panel: judul + tombol tutup */}
        <div className="border-b-2 border-slate-100 dark:border-slate-800 px-5 pt-5 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white">
                <Compass size={20} strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Jelajahi Kota Indonesia
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
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

          {/* Kolom ketik */}
          <div className="relative mt-4">
            <Search size={17} strokeWidth={2.5} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={kolomCari}
              type="text"
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              placeholder="Ketik nama kota, kabupaten, atau provinsi…"
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

          {/* Andalan kilat */}
          {!kataKunci && pulauAktif === 'Semua' && (
            <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <span className="flex shrink-0 items-center gap-1 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
                <Star size={12} className="text-amber-500" /> Andalan
              </span>
              {KOTA_ANDALAN_JAGA.map((nama) => {
                const objek = INDONESIA_CITIES.find((c) => c.name === nama);
                if (!objek) return null;
                return (
                  <button
                    key={nama}
                    onMouseEnter={() => hangatkanKota(objek)}
                    onTouchStart={() => hangatkanKota(objek)}
                    onClick={() => pilihKota(objek)}
                    className="shrink-0 rounded-full border-2 border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {nama.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          )}

          {/* Penyaring pulau */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
        </div>

        {/* Hasil */}
        <div className="flex-1 overflow-y-auto bg-white px-4 py-3 dark:bg-slate-900">
          <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            {tampil.length} dari {daftarKota.length} wilayah
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
              {tampil.map((kota) => {
                const sedangAktif = namaAktif ? namaAktif === kota.name : false;
                return (
                  <li key={kota.name}>
                    <button
                      onMouseEnter={() => hangatkanKota(kota)}
                      onTouchStart={() => hangatkanKota(kota)}
                      onClick={() => pilihKota(kota)}
                      className={
                        sedangAktif
                          ? 'flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-emerald-500 bg-emerald-50 px-3.5 py-3 text-left dark:bg-emerald-500/10'
                          : 'flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-slate-100 bg-slate-50 px-3.5 py-3 text-left hover:border-emerald-400 dark:border-slate-800 dark:bg-slate-800/60'
                      }
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={
                            sedangAktif
                              ? 'grid size-9 shrink-0 place-items-center rounded-full bg-emerald-500 text-white'
                              : 'grid size-9 shrink-0 place-items-center rounded-full bg-white text-emerald-600 border-2 border-slate-100 dark:border-slate-700 dark:bg-slate-900'
                          }
                        >
                          <MapPin size={16} strokeWidth={2.5} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-extrabold text-slate-900 dark:text-white">
                            {kota.name}
                          </span>
                          <span className="block truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {kota.province} · {kota.region}
                          </span>
                        </span>
                      </span>
                      {sedangAktif ? (
                        <span className="shrink-0 rounded-lg border border-emerald-500 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                          Aktif
                        </span>
                      ) : (
                        <ChevronRight size={16} className="shrink-0 text-slate-300" strokeWidth={2.5} />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
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
