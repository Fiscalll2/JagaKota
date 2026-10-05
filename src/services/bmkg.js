import { apiCache } from '../utils/apiCache.js';

const SUMBER_AUTO = 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json';
const SUMBER_LIST = 'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json';
const BATAS_WAKTU = 6000;

export function getDefaultEarthquake() {
  return {
    date: '10 Sep 2026', time: '22:00:00 WIB', dateTime: '10 Sep 2026 22:00:00 WIB',
    lat: -6.82, lon: 107.14, magnitude: 3.8, depth: '10 km',
    wilayah: 'Darat 12 km BaratDaya Kab. Cianjur',
    potensi: 'Tidak berpotensi tsunami', dirasakan: 'II-III Cianjur', shakemap: null,
    sumber: 'fallback-jagakota',
  };
}

function rapikanSatu(g) {
  if (!g) return getDefaultEarthquake();
  const [ls, bs] = String(g.Coordinates || '0,0').split(',');
  return {
    date: g.Tanggal || '', time: g.Jam || '',
    dateTime: `${g.Tanggal || ''} ${g.Jam || ''}`.trim(),
    lat: parseFloat(ls) || 0, lon: parseFloat(bs) || 0,
    magnitude: parseFloat(g.Magnitude) || 0,
    depth: g.Kedalaman || '-', wilayah: g.Wilayah || 'Wilayah Indonesia',
    potensi: g.Potensi || 'Tidak berpotensi tsunami', dirasakan: g.Dirasakan || '-',
    shakemap: g.Shakemap ? `https://data.bmkg.go.id/DataMKG/TEWS/${g.Shakemap}` : null,
  };
}

async function ambilJson(url) {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const t = ctrl ? setTimeout(() => ctrl.abort(), BATAS_WAKTU) : null;
  try {
    const r = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: ctrl ? ctrl.signal : undefined,
    });
    if (!r.ok) throw new Error(`BMKG ${r.status}`);
    return await r.json();
  } finally { if (t) clearTimeout(t); }
}

export async function fetchLatestEarthquake(forceRefresh = false) {
  const kunci = 'gempa_terkini';
  if (!forceRefresh) {
    const cepat = apiCache.get(kunci) || apiCache.get('bmkg_autogempa');
    if (cepat) return cepat;
  }
  try {
    const data = await ambilJson(SUMBER_AUTO);
    const hasil = rapikanSatu(data?.Infogempa?.gempa);
    apiCache.set(kunci, hasil);
    return hasil;
  } catch (e) {
    console.warn('[JagaKota] autogempa fallback:', e?.message);
    return apiCache.get(kunci) || getDefaultEarthquake();
  }
}

export async function fetchRecentEarthquakes(forceRefresh = false) {
  const kunci = 'gempa_list';
  if (!forceRefresh) {
    const cepat = apiCache.get(kunci) || apiCache.get('bmkg_gempaterkini');
    if (cepat) return cepat;
  }
  try {
    const data = await ambilJson(SUMBER_LIST);
    const daftar = Array.isArray(data?.Infogempa?.gempa) ? data.Infogempa.gempa : [];
    const rapi = daftar.map((g, i) => ({
      id: `jk-gempa-${i}-${g.Tanggal || ''}-${g.Jam || ''}`,
      ...rapikanSatu(g),
    }));
    apiCache.set(kunci, rapi);
    return rapi;
  } catch (e) {
    console.warn('[JagaKota] gempaterkini fallback:', e?.message);
    return apiCache.get(kunci) || [getDefaultEarthquake()];
  }
}
