const LEVELS = [
  { max: 24, label: 'Awas — Batasi Keluar', color: '#dc2626', bg: 'rgba(220,38,38,.12)', aksi: 'Pakai masker N95, tutup ventilasi, tunda olahraga.' },
  { max: 49, label: 'Siaga — Kurangi Aktivitas', color: '#ea580c', bg: 'rgba(234,88,12,.12)', aksi: 'Keluar seperlunya, bawa air minum, pantau anak & lansia.' },
  { max: 74, label: 'Waspada — Layak Bersyarat', color: '#d97706', bg: 'rgba(217,119,6,.12)', aksi: 'Jogging pagi/sore saja, sunscreen bila UV tinggi.' },
  { max: 100, label: 'Aman — Kota Terjaga', color: '#059669', bg: 'rgba(5,150,105,.12)', aksi: 'Kondisi ideal. Buka ventilasi, ajak warga bersih-bersih.' },
];

function clampNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function scoreAqi(aqi) {
  const a = Math.max(0, clampNum(aqi));
  if (a <= 25) return 100;
  if (a <= 50) return 95 - (a - 25) * 0.6;
  if (a <= 100) return 80 - (a - 50) * 0.5;
  if (a <= 150) return 55 - (a - 100) * 0.4;
  if (a <= 200) return 35 - (a - 150) * 0.3;
  return Math.max(5, 20 - ((a - 200) / 300) * 20);
}

function scoreHeat(temp, humidity) {
  const t = clampNum(temp, 29);
  const h = clampNum(humidity, 70);

  let s = 100;
  if (t >= 30) s -= (t - 30) * 7 + Math.max(0, h - 65) * 0.35;
  else if (t >= 27) s -= (t - 27) * 3;
  else if (t < 23) s -= (23 - t) * 4;
  if (h >= 85 || h <= 35) s -= 12;
  return Math.max(5, Math.min(100, s));
}

function scoreUv(uv) {
  const u = Math.max(0, clampNum(uv));
  if (u < 3) return 100;
  if (u < 6) return 82;
  if (u < 8) return 60;
  if (u < 11) return 35;
  return 12;
}

function scorePmSpike(pm25) {
  const p = Math.max(0, clampNum(pm25));
  if (p <= 12) return 100;
  if (p <= 35) return 85 - (p - 12) * 0.8;
  if (p <= 75) return 65 - (p - 35) * 0.6;
  return Math.max(5, 40 - ((p - 75) / 100) * 35);
}

export function calculateKotaSiaga(input = {}) {
  const aqi = clampNum(input.aqi);
  const pm25 = clampNum(input.pm25);
  const temp = clampNum(input.temp, 29);
  const humidity = clampNum(input.humidity, 70);
  const uvIndex = clampNum(input.uvIndex);
  const rainProb = clampNum(input.rainProb);

  const parts = {
    udara: scoreAqi(aqi),
    partikel: scorePmSpike(pm25),
    panas: scoreHeat(temp, humidity),
    uv: scoreUv(uvIndex),
  };

  let raw = parts.udara * 0.4 + parts.partikel * 0.2 + parts.panas * 0.25 + parts.uv * 0.15;

  if (rainProb >= 60 && aqi < 100) raw += 4;
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  const level = LEVELS.find((l) => score <= l.max) || LEVELS[LEVELS.length - 1];
  const levelIndex = LEVELS.indexOf(level) + 1;

  const paparan = Math.round((pm25 / 12) * 10) / 10;

  const saran = {
    masker: aqi > 100 || pm25 > 55 ? 'Wajib' : aqi > 50 ? 'Opsional' : 'Tidak perlu',
    olahraga: score >= 75 ? 'Gas pagi ini' : score >= 50 ? 'Pagi/sore saja' : 'Tunda dulu',
    anakLansia: score >= 75 ? 'Aman' : score >= 50 ? 'Batasi 30 mnt' : 'Di dalam rumah',
    ventilasi: aqi <= 60 && score >= 50 ? 'Buka' : 'Tutup + purifier',
  };

  return { score, level: levelIndex, label: level.label, color: level.color, bg: level.bg, aksi: level.aksi, paparan, saran, breakdown: parts };
}

export const calculateEcoHealthScore = (aqi, temp, humidity, uvIndex, pm25) => {
  const r = calculateKotaSiaga({ aqi, temp, humidity, uvIndex, pm25 });
  return { score: r.score, category: r.label, color: r.color, bg: r.bg, cigs: r.paparan, activities: r.saran };
};
