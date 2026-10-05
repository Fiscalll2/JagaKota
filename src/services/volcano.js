import { INDONESIA_VOLCANOES, VOLCANO_STATUS_LEVELS } from '../utils/volcanoes.js';
import { hitungJarakKm } from '../utils/geo.js';
import { apiCache } from '../utils/apiCache.js';

const JATUH_LAT = -6.2088;
const JATUH_LON = 106.8456;

export function getNearbyVolcanoes(lat, lon, maxRadiusKm = 250) {
  const la = Number(lat) || 0; const lo = Number(lon) || 0;
  if (!la || !lo) return { nearest: null, list: [], nearbyList: [], alertCount: 0, allVolcanoes: [] };
  const kunci = `gunung_${la.toFixed(2)}_${lo.toFixed(2)}`;
  const cepat = apiCache.get(kunci) || apiCache.get(`volcano_${(Number(lat) || JATUH_LAT).toFixed(2)}_${(Number(lon) || JATUH_LON).toFixed(2)}`);
  if (cepat) return cepat;

  const berJarak = INDONESIA_VOLCANOES.map((g) => {
    const km = Math.round(hitungJarakKm(la, lo, g.lat, g.lon) * 10) / 10;
    const status = VOLCANO_STATUS_LEVELS[g.statusLevel] || VOLCANO_STATUS_LEVELS[1];
    return {
      ...g, distanceKm: km, status,
      isInsideDangerZone: km <= g.dangerRadiusKm,
      isCautionZone: km <= g.dangerRadiusKm * 4,
      zona: km <= g.dangerRadiusKm ? 'bahaya' : km <= g.dangerRadiusKm * 4 ? 'waspada' : 'aman',
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  const hasil = {
    nearest: berJarak[0] || null,
    list: berJarak.filter((v) => v.distanceKm <= maxRadiusKm),
    nearbyList: berJarak.filter((v) => v.distanceKm <= maxRadiusKm),
    allVolcanoes: berJarak,
    alertCount: INDONESIA_VOLCANOES.filter((v) => v.statusLevel >= 3).length,
    radiusKm: maxRadiusKm, versi: 2,
  };
  apiCache.set(kunci, hasil, 10 * 60 * 1000);
  return hasil;
}

export const getGunungTerdekat = getNearbyVolcanoes;
export default getNearbyVolcanoes;
