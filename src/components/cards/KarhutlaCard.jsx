import React from 'react';
import { Flame, Wind, ArrowRight, Tractor, Siren } from 'lucide-react';
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
  const { isHazeActive, isVeryNear } = getHazeStatus(nearest, aqi, pm25);

  // Jarak verifikasi mandiri
  const cekJarak = nearest ? hitungJarakKm(location?.lat, location?.lon, nearest.lat, nearest.lon) : 0;
  const jarak = cekJarak > 0 ? cekJarak : nearest?.distanceKm || 0;

  const asap = isHazeActive;
  const rawan = ['TINGGI', 'EKSTREM', 'HIGH', 'EXTREME'].includes(fdrs.code);
  const warnaUtama = asap ? '#dc2626' : fdrs.color;
  const sapaan = asap
    ? 'Asap kiriman nyampe sini, Lur.'
    : isVeryNear || (nearest && jarak <= 50)
      ? 'Api tetangga deket banget.'
      : rawan
        ? 'Lahan kering, gampang nyala.'
        : 'Lahan sekitar lagi adem.';

  return (
    <section className="border-2 border-slate-200 rounded-2xl bg-white overflow-hidden flex flex-col">
      <div className="h-2 w-full" style={{ backgroundColor: warnaUtama }} />

      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.14em] text-slate-500 uppercase flex items-center gap-1.5">
              <Tractor size={13} /> Ronda Asap • Karhutla
            </p>
            <h3 className="text-xl font-black text-slate-900 leading-tight mt-1">{sapaan}</h3>
          </div>
          <span
            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1.5 rounded-xl border-2"
            style={{ color: warnaUtama, borderColor: warnaUtama, backgroundColor: `${warnaUtama}14` }}
          >
            {asap ? <Siren size={13} /> : <Flame size={13} />}
            {asap ? 'Kena asap' : fdrs.code}
          </span>
        </div>

        {/* Panel tumpuk vertikal — bukan grid 2 kolom lama */}
        <div className="flex flex-col gap-2">
          <div className="rounded-2xl border-2 border-slate-100 px-4 py-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Titik api paling deket</p>
            {nearest ? (
              <>
                <p className="text-[15px] font-black text-slate-900 leading-tight">{nearest.regency}</p>
                <p className="text-[12px] font-semibold text-slate-500">{nearest.province} • {nearest.type}</p>
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-extrabold rounded-full bg-slate-900 text-white px-2.5 py-1">
                  <Wind size={12} /> {jarak} km dari {location?.name || 'lokasimu'}
                </p>
              </>
            ) : (
              <p className="text-[13px] font-semibold text-slate-500 mt-1">Nggak ada titik api dalam 400 km. Aman.</p>
            )}
          </div>

          <div className="rounded-2xl border-2 px-4 py-3" style={{ borderColor: fdrs.color, backgroundColor: fdrs.bg || '#f8fafc' }}>
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: fdrs.color }}>
              Lahan di {location?.name || 'sini'}: {fdrs.label || fdrs.code}
            </p>
            <p className="text-[13px] font-medium text-slate-700 leading-snug mt-1">{fdrs.desc}</p>
          </div>
        </div>

        {/* Imbauan + tombol full-width */}
        <p className="text-[12px] font-semibold text-slate-500 leading-snug rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 px-3 py-2">
          {asap
            ? `Asap dari ${nearest?.regency || 'tetangga'} kebawa angin ke sini. Tutup ventilasi, masker N95 kalau keluar.`
            : rawan
              ? 'Daun & semak kering banget. Jangan bakar sampah dulu, Lur.'
              : 'Lahan setempat aman dari api langsung, tapi tetap waspada asap kiriman.'}
        </p>

        <button
          onClick={onOpenModal}
          className="w-full rounded-2xl bg-slate-900 text-white px-4 py-3 text-[13px] font-extrabold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
        >
          Lihat {total} titik api se-Indonesia <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
