// JagaKota — taksonomi udara v2 (ambang + bahasa khas warga)
export const TINGKAT_UDARA = [
  { max: 50, label: 'Segar', color: '#059669', bg: 'rgba(5,150,105,.12)', advice: 'Udara segar. Gas keluar, buka jendela.' },
  { max: 100, label: 'Lumayan', color: '#b45309', bg: 'rgba(180,83,9,.12)', advice: 'Masih oke. Yang sensitif kurangi lari siang.' },
  { max: 150, label: 'Pengap Sensitif', color: '#c2410c', bg: 'rgba(194,65,12,.12)', advice: 'Anak, lansia, penderita asma pakai masker.' },
  { max: 200, label: 'Pengap', color: '#dc2626', bg: 'rgba(220,38,38,.12)', advice: 'Semua warga disarankan bermasker di luar.' },
  { max: 300, label: 'Pekat', color: '#7c3aed', bg: 'rgba(124,58,237,.12)', advice: 'Hindari keluar. Nyalakan purifier.' },
  { max: 500, label: 'Darurat Asap', color: '#7f1d1d', bg: 'rgba(127,29,29,.16)', advice: 'Darurat! Tetap di dalam ruangan.' },
];

export const AQI_LEVELS = TINGKAT_UDARA;

function cariTingkat(nilai, daftar) {
  const aman = Math.max(0, Number(nilai) || 0);
  for (const t of daftar) if (aman <= t.max) return { ...t };
  return { ...daftar[daftar.length - 1] };
}

export function infoUdara(aqi) {
  const t = cariTingkat(aqi, TINGKAT_UDARA);
  return { label: t.label, color: t.color, bg: t.bg, advice: t.advice };
}

export const getAqiInfo = infoUdara;

const UV_V2 = [
  { max: 2, label: 'Teduh (Aman)', color: '#059669', advice: 'Aman. Nikmati pagi.' },
  { max: 5, label: 'Menyengat Ringan', color: '#ca8a04', advice: 'Pakai sunscreen SPF30+ bila lama di luar.' },
  { max: 7, label: 'Menyengat', color: '#ea580c', advice: 'Hindari 10.00–15.00, cari teduh.' },
  { max: 10, label: 'Membakar', color: '#dc2626', advice: 'Topi + payung + sunscreen wajib.' },
  { max: 99, label: 'Ekstrem Membakar', color: '#7c3aed', advice: 'Jangan kontak langsung!' },
];

export function infoUv(uv) {
  const v = Math.max(0, Math.round(Number(uv) || 0));
  const t = cariTingkat(v, UV_V2);
  return { value: v, label: t.label, color: t.color, advice: t.advice };
}

export const getUvInfo = infoUv;

export function warnaGempa(mag) {
  const m = parseFloat(mag) || 0;
  if (m < 4.5) return '#059669';
  if (m < 5.5) return '#d97706';
  if (m < 6.5) return '#ea580c';
  return '#dc2626';
}

export const getEarthquakeColor = warnaGempa;
export default infoUdara;
