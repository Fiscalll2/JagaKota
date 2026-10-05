import { apiCache } from '../utils/apiCache.js';

const FALLBACK_LAT = -6.2;
const FALLBACK_LON = 106.85;
const REQ_TIMEOUT = 7000;

export function calibrateWeatherCode({ weatherCode, precipitation = 0, cloudCover = 55 } = {}) {
  const code = Number(weatherCode ?? 2);
  const hujan = Number(precipitation ?? 0);
  const awan = Number(cloudCover ?? 55);
  const gerimis = (code >= 51 && code <= 57) || code === 61 || code === 80;

  if (hujan < 0.3 && gerimis) {
    if (awan >= 78) return 3;
    if (awan >= 38) return 2;
    return 1;
  }
  if (code === 0 && awan >= 82) return 3;
  if (code === 0 && awan >= 42) return 2;
  return code;
}

function jamTemplate() {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const jam = Array.from({ length: 24 }, (_, i) => `${day}T${String(i).padStart(2, '0')}:00`);
  const hari = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() + i * 86400000);
    return d.toISOString().slice(0, 10);
  });
  return { jam, hari, now };
}

export function getDefaultWeather() {
  const { jam, hari, now } = jamTemplate();
  return {
    current: {
      temp: 30, feelsLike: 33, humidity: 72, precipitation: 0, cloudCover: 45,
      isDay: 1, weatherCode: 2, windSpeed: 9, windDirection: 160,
      uvIndex: 5, pressure: 1009, time: now.toISOString(),
    },
    hourly: {
      time: jam,
      temperature_2m: jam.map(() => 27 + Math.floor(Math.random() * 5)),
      relative_humidity_2m: jam.map(() => 68 + Math.floor(Math.random() * 16)),
      precipitation_probability: jam.map(() => 8),
      precipitation: jam.map(() => 0),
      weather_code: jam.map(() => 2),
      uv_index: jam.map((_, i) => (i >= 6 && i <= 17 ? Math.max(0, 9 - Math.abs(12 - i)) : 0)),
      cloud_cover: jam.map(() => 45),
    },
    daily: {
      time: hari,
      weather_code: [2, 1, 2, 3, 1, 2, 2],
      temperature_2m_max: [33, 32, 33, 31, 32, 33, 32],
      temperature_2m_min: [25, 24, 25, 24, 24, 25, 24],
      uv_index_max: [7, 6, 7, 6, 6, 7, 6],
      precipitation_sum: [0, 0, 1, 2, 0, 1, 0],
      precipitation_probability_max: [15, 20, 30, 45, 15, 25, 20],
      wind_speed_10m_max: [13, 12, 14, 11, 12, 13, 12],
    },
  };
}

function susunUrl(lat, lon) {
  const q = new URLSearchParams({
    latitude: String(lat), longitude: String(lon),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index,cloud_cover,is_day',
    hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,uv_index,cloud_cover',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
    timezone: 'auto', models: 'best_match', forecast_days: '7',
  });
  return `https://api.open-meteo.com/v1/forecast?${q.toString()}`;
}

function rapikanHourly(hourly) {
  if (!hourly?.weather_code) return getDefaultWeather().hourly;
  const kode = hourly.weather_code.map((c, i) => {
    const p = Number(hourly.precipitation?.[i] ?? 0);
    const prob = Number(hourly.precipitation_probability?.[i] ?? 0);
    const aw = Number(hourly.cloud_cover?.[i] ?? 50);
    if ((p < 0.3 || prob < 32) && ((c >= 51 && c <= 57) || c === 61 || c === 80)) {
      if (aw >= 78) return 3;
      if (aw >= 38) return 2;
      return 1;
    }
    return calibrateWeatherCode({ weatherCode: c, precipitation: p, cloudCover: aw });
  });
  return { ...hourly, weather_code: kode };
}

function rapikanDaily(daily) {
  if (!daily?.weather_code) return getDefaultWeather().daily;
  const kode = daily.weather_code.map((c, i) => {
    const total = Number(daily.precipitation_sum?.[i] ?? 0);
    const prob = Number(daily.precipitation_probability_max?.[i] ?? 0);
    const gerimis = (c >= 51 && c <= 57) || c === 61 || c === 80;
    if ((total < 1.0 || prob < 48) && gerimis) {
      if (total < 0.3 && prob < 22) return 1;
      return 2;
    }
    return c;
  });
  return { ...daily, weather_code: kode };
}

export async function fetchWeatherData(lat, lon, forceRefresh = false) {
  const la = Number(lat) || FALLBACK_LAT;
  const lo = Number(lon) || FALLBACK_LON;
  const kunci = `cuaca_${la.toFixed(3)}_${lo.toFixed(3)}`;

  if (!forceRefresh) {
    const cepat = apiCache.get(kunci);
    if (cepat) return cepat;

    const lama = apiCache.get(`weather_${la.toFixed(3)}_${lo.toFixed(3)}`);
    if (lama) { apiCache.set(kunci, lama); return lama; }
  }

  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), REQ_TIMEOUT) : null;
  try {
    const res = await fetch(susunUrl(la, lo), {
      headers: { Accept: 'application/json' },
      signal: ctrl ? ctrl.signal : undefined,
    });
    if (!res.ok) throw new Error(`Cuaca HTTP ${res.status}`);
    const data = await res.json();

    const hujan = Number(data.current?.precipitation ?? 0);
    const awan = Number(data.current?.cloud_cover ?? 55);
    const kodeMentah = Number(data.current?.weather_code ?? 2);
    const kode = calibrateWeatherCode({ weatherCode: kodeMentah, precipitation: hujan, cloudCover: awan });

    const rapi = {
      current: {
        temp: Math.round(data.current?.temperature_2m ?? 30),
        feelsLike: Math.round(data.current?.apparent_temperature ?? 33),
        humidity: data.current?.relative_humidity_2m ?? 72,
        precipitation: hujan, cloudCover: awan, isDay: data.current?.is_day ?? 1,
        weatherCode: kode,
        windSpeed: data.current?.wind_speed_10m ?? 9,
        windDirection: data.current?.wind_direction_10m ?? 160,
        uvIndex: data.current?.uv_index ?? 5,
        pressure: data.current?.surface_pressure ?? 1009,
        time: data.current?.time || new Date().toISOString(),
      },
      hourly: rapikanHourly(data.hourly),
      daily: rapikanDaily(data.daily),
    };
    apiCache.set(kunci, rapi);
    return rapi;
  } catch (e) {
    console.warn('[JagaKota] cuaca fallback:', e?.message || e);
    return apiCache.get(kunci) || getDefaultWeather();
  } finally {
    if (timer) clearTimeout(timer);
  }
}
