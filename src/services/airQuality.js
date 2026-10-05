import { apiCache } from '../utils/apiCache.js';

const JATUH_LAT = -6.2;
const JATUH_LON = 106.85;
const BATAS_WAKTU = 7000;

export function getDefaultAqi() {
  const kini = new Date();
  const hari = kini.toISOString().slice(0, 10);
  const jam = Array.from({ length: 24 }, (_, i) => `${hari}T${String(i).padStart(2, '0')}:00`);
  return {
    current: {
      aqi: 42, pm25: 11.8, pm10: 21.5, co: 265, no2: 8.1, so2: 3.9, o3: 24.2, dust: 7.5,
      time: kini.toISOString(), sumber: 'fallback-jagakota',
    },
    hourly: {
      time: jam,
      us_aqi: jam.map(() => 38 + Math.floor(Math.random() * 14)),
      pm2_5: jam.map(() => 9 + Math.floor(Math.random() * 8)),
      pm10: jam.map(() => 17 + Math.floor(Math.random() * 9)),
      carbon_monoxide: jam.map(() => 240 + Math.floor(Math.random() * 55)),
      ozone: jam.map(() => 19 + Math.floor(Math.random() * 14)),
    },
  };
}

function susunUrlUdara(la, lo) {
  const q = new URLSearchParams({
    latitude: String(la), longitude: String(lo),
    current: 'us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust',
    hourly: 'us_aqi,pm2_5,pm10,carbon_monoxide,ozone',
    timezone: 'auto', forecast_days: '3',
  });
  return `https://air-quality-api.open-meteo.com/v1/air-quality?${q.toString()}`;
}

export async function fetchAirQualityData(lat, lon, forceRefresh = false) {
  const la = Number(lat) || JATUH_LAT;
  const lo = Number(lon) || JATUH_LON;
  const kunci = `udara_${la.toFixed(3)}_${lo.toFixed(3)}`;

  if (!forceRefresh) {
    const cepat = apiCache.get(kunci) || apiCache.get(`aqi_${la.toFixed(3)}_${lo.toFixed(3)}`);
    if (cepat) return cepat;
  }

  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), BATAS_WAKTU) : null;
  try {
    const r = await fetch(susunUrlUdara(la, lo), {
      headers: { Accept: 'application/json' },
      signal: ctrl ? ctrl.signal : undefined,
    });
    if (!r.ok) throw new Error(`Udara HTTP ${r.status}`);
    const d = await r.json();
    const bulat1 = (v, fb) => Math.round((Number(v ?? fb)) * 10) / 10;
    const hasil = {
      current: {
        aqi: Math.round(d.current?.us_aqi ?? 42),
        pm25: bulat1(d.current?.pm2_5, 11.8), pm10: bulat1(d.current?.pm10, 21.5),
        co: Math.round(d.current?.carbon_monoxide ?? 265),
        no2: bulat1(d.current?.nitrogen_dioxide, 8.1), so2: bulat1(d.current?.sulphur_dioxide, 3.9),
        o3: bulat1(d.current?.ozone, 24.2), dust: bulat1(d.current?.dust, 7.5),
        time: d.current?.time || new Date().toISOString(),
      },
      hourly: d.hourly || getDefaultAqi().hourly,
    };
    apiCache.set(kunci, hasil);
    return hasil;
  } catch (e) {
    console.warn('[JagaKota] udara fallback:', e?.message);
    return apiCache.get(kunci) || getDefaultAqi();
  } finally { if (timer) clearTimeout(timer); }
}
