// JagaKota — geolokasi: presisi Haversine + bearing + slug.

const RAD = Math.PI / 180;
const BUMI_KM = 6371.0088;

function keAngka(v, jaga = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : jaga;
}

function bacaPos(geo, opsi) {
  return new Promise((selesai, gagal) => {
    geo.getCurrentPosition(
      (pos) => selesai({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        ketelitianM: pos.coords.accuracy,
      }),
      (galat) => gagal(galat),
      opsi,
    );
  });
}

function pesanGalat(galat) {
  // Kode Geolocation API: 1 = izin ditolak, 2 = posisi tak tersedia, 3 = timeout.
  if (!galat || typeof galat.code !== 'number') {
    return galat?.message || 'GPS tidak tersedia. Pilih kota manual.';
  }
  if (galat.code === 1) {
    const aman = typeof window !== 'undefined' && (window.isSecureContext || ['localhost', '127.0.0.1'].includes(window.location?.hostname));
    return aman
      ? 'Izin lokasi ditolak. Ketuk ikon gembok di address bar → izinkan Lokasi, lalu coba lagi.'
      : 'Browser memblokir lokasi di koneksi tak aman (HTTP). Buka versi HTTPS atau pilih kota manual.';
  }
  if (galat.code === 2) return 'Sinyal lokasi tidak ketemu (dalam ruangan / GPS mati). Nyalakan GPS atau pilih kota manual.';
  return 'Mencari sinyal lokasi kelamaan. Coba lagi di tempat terbuka atau pilih kota manual.';
}

export function getCurrentPosition(pilihan = {}) {
  const { timeout = 12000, akurasiTinggi = true } = pilihan;
  const geo = navigator?.geolocation;
  if (!geo) return Promise.reject(new Error('Peramban tidak mendukung geolokasi.'));
  // Tahap 1: paksa posisi segar (tanpa cache basi) akurasi tinggi.
  return bacaPos(geo, { timeout, enableHighAccuracy: akurasiTinggi, maximumAge: 0 }).catch((galat) => {
    // Izin ditolak / tak didukung → jangan buang waktu retry.
    if (galat?.code === 1 || !akurasiTinggi) throw new Error(pesanGalat(galat));
    // Tahap 2: fallback hemat (WiFi/IP) — lebih cepatwalau kurang presisi.
    return bacaPos(geo, { timeout: 8000, enableHighAccuracy: false, maximumAge: 0 }).catch(() => {
      throw new Error(pesanGalat(galat));
    });
  });
}

export function hitungJarakKm(garis1, bujur1, garis2, bujur2) {
  const a1 = keAngka(garis1);
  const b1 = keAngka(bujur1);
  const a2 = keAngka(garis2);
  const b2 = keAngka(bujur2);
  if (![a1, b1, a2, b2].every(Number.isFinite)) return 0;
  const dLat = (a2 - a1) * RAD;
  const dLon = (b2 - b1) * RAD;
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(a1 * RAD) * Math.cos(a2 * RAD) * Math.sin(dLon / 2) ** 2;
  return Math.round(BUMI_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

export function hitungBearingDeg(garis1, bujur1, garis2, bujur2) {
  const a1 = keAngka(garis1) * RAD;
  const a2 = keAngka(garis2) * RAD;
  const dLon = (keAngka(bujur2) - keAngka(bujur1)) * RAD;
  const y = Math.sin(dLon) * Math.cos(a2);
  const x = Math.cos(a1) * Math.sin(a2) - Math.sin(a1) * Math.cos(a2) * Math.cos(dLon);
  return Math.round(((Math.atan2(y, x) / RAD) + 360) % 360);
}

const ARAH = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'];
export function arahMataAngin(derajat) {
  const d = ((keAngka(derajat) % 360) + 360) % 360;
  return ARAH[Math.round(d / 45) % 8];
}

export const calculateDistance = hitungJarakKm;
export const jarakKm = hitungJarakKm;
export const haversineKm = hitungJarakKm;

/**
 * Jarak presisi (desimal, tanpa pembulatan) khusus untuk MEMILIH kota terdekat.
 * hitungJarakKm membulatkan ke km bulat sehingga kota-kota tetangga <0,5 km
 * seri dan pemenang jadi arbitrer (kota pertama di daftar).
 */
export function hitungJarakPresisiKm(garis1, bujur1, garis2, bujur2) {
  const a1 = keAngka(garis1, NaN);
  const b1 = keAngka(bujur1, NaN);
  const a2 = keAngka(garis2, NaN);
  const b2 = keAngka(bujur2, NaN);
  if (![a1, b1, a2, b2].every(Number.isFinite)) return Infinity;
  const dLat = (a2 - a1) * RAD;
  const dLon = (b2 - b1) * RAD;
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(a1 * RAD) * Math.cos(a2 * RAD) * Math.sin(dLon / 2) ** 2;
  return BUMI_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function slugKota(nama = '') {
  return String(nama ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default hitungJarakKm;
