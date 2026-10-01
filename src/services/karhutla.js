import { apiCache } from '../utils/apiCache.js';
import { calculateFdrs, getNearbyHotspots } from '../utils/karhutla.js';

function tebakPulau(lat, lon) {
  if (lon < 106 && lat > -6) return 'Sumatera';
  if (lon >= 105 && lon <= 116 && lat <= -5.5) return 'Jawa';
  if (lon >= 108 && lon <= 119 && lat > -5) return 'Kalimantan';
  if (lon >= 118 && lon <= 126 && lat > -6) return 'Sulawesi';
  if (lon >= 114 && lon <= 126 && lat <= -6) return 'Bali & Nusa Tenggara';
  if (lon > 126) return 'Maluku & Papua';
  return 'Indonesia';
}

export async function fetchLiveFirmsHotspots(mapKey) {
  if (!mapKey) return null;
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const t = ctrl ? setTimeout(() => ctrl.abort(), 7000) : null;
  try {
    const url = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${mapKey}/VIIRS_SNPP_NRT/IDN/1`;
    const res = await fetch(url, { signal: ctrl ? ctrl.signal : undefined });
    if (!res.ok) return null;
    const teks = await res.text();
    const baris = teks.trim().split('\n');
    if (baris.length <= 1) return null;
    const head = baris[0].split(',').map((h) => h.trim());
    const ci = (n) => head.indexOf(n);
    const iLat = ci('latitude'), iLon = ci('longitude');
    if (iLat < 0 || iLon < 0) return null;
    const iB = ci('bright_ti4'), iC = ci('confidence'), iF = ci('frp'), iS = ci('satellite');
    const hasil = [];
    for (let k = 1; k < baris.length; k++) {
      const kol = baris[k].split(',');
      const la = parseFloat(kol[iLat]); const lo = parseFloat(kol[iLon]);
      if (!Number.isFinite(la) || !Number.isFinite(lo)) continue;
      const mentah = iC >= 0 ? String(kol[iC]).trim() : 'n';
      const tinggi = mentah === 'h' || mentah === 'high';
      hasil.push({
        id: `jk-firms-${k}`, regency: `Hotspot (${la.toFixed(2)}, ${lo.toFixed(2)})`,
        province: 'Terdeteksi Satelit', island: tebakPulau(la, lo), lat: la, lon: lo,
        satellite: (iS >= 0 && kol[iS]) || 'VIIRS SNPP (375m)',
        confidence: tinggi ? 'Tinggi (>85%)' : 'Sedang (70-85%)',
        confidenceLevel: tinggi ? 'HIGH' : 'MODERATE',
        brightnessK: iB >= 0 ? parseFloat(kol[iB]) || 330 : 330,
        frpMw: iF >= 0 ? parseFloat(kol[iF]) || 15 : 15,
        type: 'Deteksi Termal Aktif', source: 'NASA FIRMS NRT Live', detectedAt: 'Live (NRT)',
      });
    }
    return hasil.length ? hasil : null;
  } catch { return null; } finally { if (t) clearTimeout(t); }
}

export function fetchKarhutlaData(lat, lon, weatherData, forceRefresh = false) {
  const la = Number(lat) || 0; const lo = Number(lon) || 0;
  const kunci = `siaga_api_${la.toFixed(2)}_${lo.toFixed(2)}`;
  if (!forceRefresh) {
    const cepat = apiCache.get(kunci) || apiCache.get(`karhutla_${la.toFixed?.(2) || 0}_${lo.toFixed?.(2) || 0}`);
    if (cepat) return cepat;
  }
  const fdrs = calculateFdrs(weatherData);
  const info = getNearbyHotspots(la, lo);
  const hasil = {
    fdrs, nearest: info.nearest, nearbyList: info.nearbyList,
    allHotspots: info.allHotspots, totalInIndo: info.totalInIndo,
    dataSource: 'JagaKota Siaga Api — FIRMS VIIRS/MODIS & SiPongi+',
    lastSync: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    versi: 2,
  };
  apiCache.set(kunci, hasil);
  return hasil;
}
