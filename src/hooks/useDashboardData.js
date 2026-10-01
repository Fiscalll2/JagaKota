import { useCallback, useEffect, useRef, useState } from 'react';
import { apiCache } from '../utils/apiCache.js';
import { fetchWeatherData, getDefaultWeather } from '../services/weather';
import { fetchAirQualityData } from '../services/airQuality';
import { fetchLatestEarthquake, fetchRecentEarthquakes } from '../services/bmkg';
import { fetchKarhutlaData } from '../services/karhutla';

const JAKARTA = { lat: -6.1805, lon: 106.8284 };

function kunciCuaca(la, lo) {
  return [`cuaca_${la.toFixed(3)}_${lo.toFixed(3)}`, `weather_${la.toFixed(3)}_${lo.toFixed(3)}`];
}

function kunciUdara(la, lo) {
  return [`udara_${la.toFixed(3)}_${lo.toFixed(3)}`, `aqi_${la.toFixed(3)}_${lo.toFixed(3)}`];
}

function intipCache(daftar) {
  for (const k of daftar) {
    const v = apiCache.get(k);
    if (v) return v;
  }
  return null;
}

function bolehNotifikasi() {
  return typeof window !== 'undefined'
    && 'Notification' in window
    && Notification.permission === 'granted';
}

function kabariPolusi(namaKota, aqi) {
  try {
    new Notification('Peringatan Polusi Udara', {
      body: `AQI di ${namaKota} mencapai ${aqi} (Tidak Sehat).`,
      icon: '/leaf.svg',
    });
  } catch {}
}

/**
 * useDataJaga — seluruh pengambilan data dashboard JagaKota.
 * Dipakai App.jsx; mengembalikan paket data + status + pemicu refresh.
 */
export function useDataJaga(lokasi, { ingatkan = false } = {}) {
  const [cuaca, setCuaca] = useState(null);
  const [udara, setUdara] = useState(null);
  const [gempaTerbaru, setGempaTerbaru] = useState(null);
  const [riwayatGempa, setRiwayatGempa] = useState([]);
  const [karhutla, setKarhutla] = useState(() => fetchKarhutlaData(
    lokasi?.lat || JAKARTA.lat, lokasi?.lon || JAKARTA.lon,
    getDefaultWeather(), false,
  ));
  const [memuat, setMemuat] = useState(true);
  const [menyegarkan, setMenyegarkan] = useState(false);
  const [toastTampil, setToastTampil] = useState(false);
  const [diperbarui, setDiperbarui] = useState(() => new Date());
  const ingatkanRef = useRef(ingatkan);
  ingatkanRef.current = ingatkan;
  const lokasiRef = useRef(lokasi);
  lokasiRef.current = lokasi;
  const timerToast = useRef(null);

  const muatGempa = useCallback(async (paksa = false) => {
    try {
      const [satu, banyak] = await Promise.all([
        fetchLatestEarthquake(paksa),
        fetchRecentEarthquakes(paksa),
      ]);
      if (satu) setGempaTerbaru(satu);
      if (Array.isArray(banyak) && banyak.length > 0) setRiwayatGempa(banyak);
    } catch (e) {
      console.warn('[JagaKota] gempa gagal dimuat:', e?.message || e);
    }
  }, []);

  const terapkanPaket = useCallback((paketCuaca, paketUdara, paksaKarhutla) => {
    const lok = lokasiRef.current || JAKARTA;
    if (paketCuaca) setCuaca(paketCuaca);
    if (paketUdara) setUdara(paketUdara);
    setKarhutla(fetchKarhutlaData(lok.lat, lok.lon, paketCuaca, paksaKarhutla));
    setDiperbarui(new Date());
  }, []);

  const muatKota = useCallback(async (paksa = false) => {
    const lok = lokasiRef.current || JAKARTA;
    const la = Number(lok.lat) || JAKARTA.lat;
    const lo = Number(lok.lon) || JAKARTA.lon;

    if (!paksa) {
      const cuacaCepat = intipCache(kunciCuaca(la, lo));
      const udaraCepat = intipCache(kunciUdara(la, lo));
      if (cuacaCepat && udaraCepat) {
        setCuaca(cuacaCepat);
        setUdara(udaraCepat);
        setKarhutla(fetchKarhutlaData(la, lo, cuacaCepat, false));
        setMemuat(false);
        Promise.all([
          fetchWeatherData(la, lo, true),
          fetchAirQualityData(la, lo, true),
        ]).then(([cu, ud]) => terapkanPaket(cu, ud, true)).catch(() => {});
        return;
      }
    }

    setMemuat(true);
    try {
      const [cu, ud] = await Promise.all([
        fetchWeatherData(la, lo, paksa),
        fetchAirQualityData(la, lo, paksa),
      ]);
      terapkanPaket(cu, ud, paksa);
      if (ingatkanRef.current && bolehNotifikasi() && (ud?.current?.aqi ?? 0) > 150) {
        kabariPolusi(lok.name || 'kotamu', ud.current.aqi);
      }
    } catch (e) {
      console.error('[JagaKota] gagal memuat data kota:', e);
    } finally {
      setMemuat(false);
    }
  }, [terapkanPaket]);

  const segarkanManual = useCallback(async () => {
    if (menyegarkan) return;
    setMenyegarkan(true);
    try {
      await Promise.all([muatGempa(true), muatKota(true)]);
      setToastTampil(true);
      if (timerToast.current) clearTimeout(timerToast.current);
      timerToast.current = setTimeout(() => setToastTampil(false), 2500);
    } finally {
      setMenyegarkan(false);
    }
  }, [menyegarkan, muatGempa, muatKota]);

  useEffect(() => { muatGempa(); }, [muatGempa]);
  useEffect(() => { muatKota(); }, [lokasi?.lat, lokasi?.lon]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (timerToast.current) clearTimeout(timerToast.current); }, []);

  return {
    weatherData: cuaca,
    airQualityData: udara,
    latestEarthquake: gempaTerbaru,
    recentEarthquakes: riwayatGempa,
    karhutlaData: karhutla,
    loading: memuat,
    isRefreshing: menyegarkan,
    showUpdateToast: toastTampil,
    lastUpdated: diperbarui,
    handleManualRefresh: segarkanManual,
    muatUlang: segarkanManual,
  };
}

export default useDataJaga;
