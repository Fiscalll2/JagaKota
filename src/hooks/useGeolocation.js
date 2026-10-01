import { useCallback, useEffect, useState } from 'react';
import { getCurrentPosition, jarakKm } from '../utils/geo';
import { INDONESIA_CITIES, KOTA_JAGA } from '../utils/cities';

const KUNCI = 'jagakota-lokasi-v2';
const KUNCI_LAMA = 'jagakota_saved_city';

export const DEFAULT_CITY = {
  name: 'Jakarta Pusat', province: 'DKI Jakarta',
  lat: -6.1805, lon: 106.8284, isGps: false, sumber: 'bawaan',
};

const DAFTAR = KOTA_JAGA || INDONESIA_CITIES;

function valid(doc) {
  return doc && typeof doc.name === 'string'
    && Number.isFinite(Number(doc.lat)) && Number.isFinite(Number(doc.lon));
}

function muat() {
  if (typeof window === 'undefined') return DEFAULT_CITY;
  try {
    const baru = window.localStorage.getItem(KUNCI);
    if (baru) { const p = JSON.parse(baru); if (valid(p)) return p; }
    const lama = window.localStorage.getItem(KUNCI_LAMA);
    if (lama) { const p = JSON.parse(lama); if (valid(p)) return { ...p, sumber: 'migrasi-v1' }; }
  } catch (e) { console.warn('[JagaKota] lokasi cache rusak:', e?.message); }
  return DEFAULT_CITY;
}

function kotaTerdekat(lat, lon) {
  let terbaik = DAFTAR[0];
  let skor = Infinity;
  for (const k of DAFTAR) {
    const d = jarakKm ? jarakKm(lat, lon, k.lat, k.lon) : Math.hypot(k.lat - lat, k.lon - lon);
    if (d < skor) { skor = d; terbaik = k; }
  }
  return { kota: terbaik, km: skor };
}

export function useGeolocation() {
  const [location, setLocation] = useState(muat);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try { window?.localStorage?.setItem(KUNCI, JSON.stringify(location)); } catch {}
  }, [location]);

  const requestGpsLocation = useCallback(async () => {
    setGpsLoading(true); setLoading(true); setError(null);
    try {
      const pos = await getCurrentPosition();
      const { kota } = kotaTerdekat(pos.latitude, pos.longitude);
      setLocation({
        name: `${kota.name} (GPS)`, province: kota.province,
        lat: pos.latitude, lon: pos.longitude, isGps: true, sumber: 'gps',
        akurasiM: pos.accuracy ?? null,
      });
    } catch (e) {
      console.warn('[JagaKota] GPS gagal:', e?.message);
      setError(e?.message || 'GPS tidak tersedia. Pilih kota manual.');
    } finally { setGpsLoading(false); setLoading(false); }
  }, []);

  const selectCity = useCallback((kota) => {
    if (!kota) return;
    setLocation({
      name: kota.name, province: kota.province ?? '',
      lat: Number(kota.lat), lon: Number(kota.lon),
      isGps: false, sumber: kota.isGps ? 'gps' : 'manual',
    });
    setError(null);
  }, []);

  return { location, selectCity, requestGpsLocation, gpsLoading, loading, error };
}

export default useGeolocation;
