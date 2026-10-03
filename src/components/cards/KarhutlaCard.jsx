import React from 'react';
import { Flame, MapPin, Siren } from 'lucide-react';
import { getHazeStatus } from '../../utils/karhutla.js';
import { hitungJarakKm } from '../../utils/geo.js';

export function KarhutlaCard({ karhutlaData, airQualityData, location, onOpenModal, loading }) {
  if (loading) {
    return (
      <section className="border-2 border-slate-200 rounded-2xl bg-white p-5 animate-pulse min-h-[200px]">
        <div className="h-4 w-1/2 bg-slate-200 rounded-full mb-4" />
        <div className="h-20 bg-slate-200 rounded-2xl mb-3" />
        <div className="h-11 bg-slate-200 rounded-2xl" />
      </section>
    );
  }

  const fdrs = karhutlaData?.fdrs || { code: 'AMAN', label: 'Aman', desc: '-', color: '#10b981', bg: '#ecfdf5' };
  const nearest = karhutlaData?.nearest || null;
  const total = karhutlaData?.allHotspots?.length || 0;

  const aqi = Number(airQualityData?.current?.aqi) || 0;
  const pm25 = Number(airQualityData?.current?.pm25 ?? airQualityData?.current?.pm2_5) || 0;
  const { isHazeActive } = getHazeStatus(nearest, aqi, pm25);

  // Jarak verifikasi mandiri
  const cekJarak = nearest ? hitungJarakKm(location?.lat, location?.lon, nearest.lat, nearest.lon) : 0;
  const jarak = cekJarak > 0 ? cekJarak : nearest?.distanceKm || 0;

  const asap = isHazeActive;
  const rawan = ['TINGGI', 'EKSTREM', 'HIGH', 'EXTREME'].includes(fdrs.code);
  const warnaUtama = asap ? '#dc2626' : fdrs.color;

  return (
    <section className="rounded-2xl border-2 border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-5 md:grid-cols-[200px_minmax(0,230px)_minmax(0,1fr)]">
        {/* Kolom 1 — sumber */}
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ backgroundColor: `${warnaUtama}1a`, color: warnaUtama }}>
              {asap ? <Siren size={14} strokeWidth={2.5} /> : <Flame size={14} strokeWidth={2.5} />}
            </span>
            NASA • SIPONGI+
          </p>
          <h3 className="mt-1.5 text-lg font-black tracking-tight text-slate-900 dark:text-white">Ronda Karhutla</h3>
          <p
            className="mt-1.5 inline-block rounded-lg px-2 py-1 text-[11px] font-extrabold"
            style={{ color: warnaUtama, backgroundColor: `${warnaUtama}14` }}
          >
            {asap ? 'Kena Asap' : fdrs.code}
          </p>
          <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
            {total > 0 ? `${total} titik api terpantau` : 'Nol titik api terpantau'}
          </p>
        </div>

        {/* Kolom 2 — angka besar */}
        <div>
          {nearest ? (
            <>
              <p className="text-[44px] font-black leading-none tracking-tight text-slate-900 dark:text-white">
                {jarak}
                <span className="ml-1 text-base font-bold text-slate-400">km</span>
              </p>
              <p className="mt-1.5 text-[13px] font-semibold text-slate-600 dark:text-slate-300">
                Titik terdekat ({nearest.regency}{nearest.province ? `, ${nearest.province}` : ''})
              </p>
              <p className="mt-0.5 text-[13px] font-extrabold" style={{ color: fdrs.color }}>
                Lahan {location?.name || 'di sini'}: {fdrs.label || fdrs.code}
              </p>
            </>
          ) : (
            <>
              <p className="text-[44px] font-black leading-none tracking-tight text-emerald-600 dark:text-emerald-400">
                Aman
              </p>
              <p className="mt-1.5 text-[13px] font-semibold text-slate-600 dark:text-slate-300">
                Nggak ada titik api dalam 400 km.
              </p>
              <p className="mt-0.5 text-[13px] font-extrabold" style={{ color: fdrs.color }}>
                Lahan {location?.name || 'di sini'}: {fdrs.label || fdrs.code}
              </p>
            </>
          )}
        </div>

        {/* Kolom 3 — lokasi + analisis + aksi */}
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="flex min-w-0 items-start gap-1.5 text-[13px] font-extrabold text-slate-800 dark:text-slate-100">
              <MapPin size={15} strokeWidth={2.5} className="mt-0.5 shrink-0" style={{ color: warnaUtama }} />
              <span>
                {nearest ? `${nearest.regency}, ${nearest.province}` : `Wilayah pantau: se-Indonesia`}
                {nearest && (
                  <span className="font-semibold text-slate-500 dark:text-slate-400"> ({jarak} km darimu)</span>
                )}
              </span>
            </p>
            <button
              onClick={onOpenModal}
              className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-extrabold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              <Flame size={13} />
              Peta Api
            </button>
          </div>
          <ul className="mt-2.5 space-y-1.5 text-[13px] font-medium leading-snug text-slate-600 dark:text-slate-300">
            <li className="flex gap-2">
              <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
              {asap
                ? `Asap dari ${nearest?.regency || 'tetangga'} kebawa angin ke sini. Tutup ventilasi, masker kalau keluar.`
                : rawan
                  ? 'Daun & semak kering banget. Jangan bakar sampah dulu, Lur.'
                  : 'Lahan setempat aman dari api langsung, tapi tetap waspada asap kiriman.'}
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
              {fdrs.desc}
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
