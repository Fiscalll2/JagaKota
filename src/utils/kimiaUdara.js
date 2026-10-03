// ---------------------------------------------------------------------------
// JagaKota — Analisis Kimiawi Udara: pemecahan 6 polutan per rasio batas aman.
// Pure JS (tanpa React), dipakai card baru "ANALISIS KIMIAWI UDARA".
// Masukan: airQualityData.current dari fetchAirQualityData (Open-Meteo),
//   { pm25|pm2_5, pm10, o3, no2, so2, co, ... } — lihat src/services/airQuality.js
//   dan pemakaian di src/components/cards/AqiCard.jsx.
// ---------------------------------------------------------------------------

/**
 * Batas aman harian per polutan, mengacu pedoman WHO Global Air Quality
 * Guidelines 2021 (nilai 24-jam; O3 memakai acuan 8-jam harian 100 µg/m³
 * karena WHO tidak menetapkan batas 24-jam untuk O3).
 *
 * Satuan mengikuti yang dipakai AqiCard.jsx: PM2.5 & PM10 tampil "µg/m³",
 * gas (O3, NO2, SO2) dan CO tampil mentah tanpa satuan. Secara aktual API
 * Open-Meteo mengembalikan SEMUA polutan ini dalam µg/m³ (CO juga µg/m³,
 * bukan ppm), sehingga perbandingan rasio di bawah ini apel-ke-apel.
 *
 * - PM2.5: 15 µg/m³ (24-jam)
 * - PM10:  45 µg/m³ (24-jam)
 * - O3:    100 µg/m³ (8-jam, dipakai sebagai acuan harian)
 * - NO2:   25 µg/m³ (24-jam)
 * - SO2:   40 µg/m³ (24-jam)
 * - CO:    4000 µg/m³ (24-jam)
 */
export const BATAS_AMAN = {
  pm25: { nama: 'PM2.5', batas: 15, satuan: 'µg/m³', kunci: ['pm25', 'pm2_5'] },
  pm10: { nama: 'PM10', batas: 45, satuan: 'µg/m³', kunci: ['pm10'] },
  o3: { nama: 'O₃', batas: 100, satuan: '', kunci: ['o3', 'ozone'] },
  no2: { nama: 'NO₂', batas: 25, satuan: '', kunci: ['no2', 'nitrogen_dioxide'] },
  so2: { nama: 'SO₂', batas: 40, satuan: '', kunci: ['so2', 'sulphur_dioxide'] },
  co: { nama: 'CO', batas: 4000, satuan: '', kunci: ['co', 'carbon_monoxide'] },
};

const URUTAN = ['pm25', 'pm10', 'o3', 'no2', 'so2', 'co'];

const WARNA = { aman: '#059669', waspada: '#b45309', bahaya: '#dc2626' };

// Saran 1 kalimat gaya warga per polutan per status.
const SARAN = {
  pm25: {
    aman: 'PM2.5 aman, gas aktivitas luar seperti biasa.',
    waspada: 'PM2.5 mulai naik, kurangi nongkrong di pinggir jalan.',
    bahaya: 'PM2.5 lewat batas, pakai masker dan tutup jendela.',
  },
  pm10: {
    aman: 'PM10 aman, debu jalanan masih wajar.',
    waspada: 'PM10 naik, hindari jalan berdebu tanpa masker.',
    bahaya: 'Debu PM10 pekat, pakai masker saat keluar.',
  },
  o3: {
    aman: 'Ozon aman, santai saja di luar.',
    waspada: 'Ozon siang naik, kurangi lari siang bolong.',
    bahaya: 'Ozon tinggi, geser olahraga ke pagi atau sore.',
  },
  no2: {
    aman: 'NO₂ aman, asap knalpot masih wajar.',
    waspada: 'NO₂ naik, hindari macet-macetan terlalu lama.',
    bahaya: 'NO₂ pekat, jauhi asap kendaraan dan pakai masker.',
  },
  so2: {
    aman: 'SO₂ aman, nggak ada bau belerang aneh.',
    waspada: 'SO₂ naik, warga sensitif kurangi keluar.',
    bahaya: 'SO₂ tinggi, tutup ventilasi dan pantau bau menyengat.',
  },
  co: {
    aman: 'CO aman, sirkulasi udara rumah cukup.',
    waspada: 'CO naik, pastikan ventilasi dapur dan parkiran lancar.',
    bahaya: 'CO tinggi, jauhi sumber asap dan ventilasi ruangan.',
  },
};

/** Ambil angka pertama yang valid dari beberapa alias nama field. */
function petikNilai(current, daftarKunci) {
  for (const k of daftarKunci) {
    const v = Number(current?.[k]);
    if (Number.isFinite(v)) return Math.max(0, v);
  }
  return null; // null = data kosong, bukan 0 sungguhan
}

/** Klasifikasi rasio konsentrasi÷batas: <0.5 aman, 0.5–1 waspada, >1 bahaya. */
function statusDariRasio(rasio) {
  if (rasio > 1) return 'bahaya';
  if (rasio >= 0.5) return 'waspada';
  return 'aman';
}

/**
 * Analisis 6 polutan dari snapshot `current` kualitas udara.
 *
 * KENAPA dominan = rasio tertinggi, bukan nilai mentah terbesar:
 * satuan & orde tiap zat beda jauh (CO ratusan µg/m³ vs PM2.5 puluhan).
 * Sortir nilai mentah — seperti `pemicu` di AqiCard.jsx — selalu
 * dimenangkan CO walau CO masih 10% dari batasnya. Normalisasi
 * konsentrasi ÷ batas WHO membuat tiap zat sebanding: yang paling
 * berbahaya = yang paling jauh melewati batasnya.
 *
 * @param {object} [current] snapshot airQualityData.current
 * @returns {{ daftar: Array<{id,nama,nilai,satuan,rasio,persen,status,warna,saran,kosong}>,
 *   dominan: object, catatan: string }}
 *   - `persen` = rasio×100, dicap 0–100 untuk lebar bar.
 *   - Field hilang → nilai fallback 0, status 'aman', flag kosong:true,
 *     dan disebut di `catatan` (tidak dikarang).
 */
export function analisisKimia(current) {
  const sumber = current && typeof current === 'object' ? current : {};
  const kosong = [];

  const daftar = URUTAN.map((id) => {
    const meta = BATAS_AMAN[id];
    const mentah = petikNilai(sumber, meta.kunci);
    const hilang = mentah === null;
    if (hilang) kosong.push(meta.nama);
    const nilai = hilang ? 0 : mentah;
    const rasio = nilai / meta.batas;
    const status = hilang ? 'aman' : statusDariRasio(rasio);
    return {
      id,
      nama: meta.nama,
      nilai,
      satuan: meta.satuan,
      rasio: Math.round(rasio * 100) / 100,
      persen: Math.max(0, Math.min(100, Math.round(rasio * 100))),
      status,
      warna: WARNA[status],
      saran: SARAN[id][status],
      kosong: hilang,
    };
  });

  // Dominan = rasio tertinggi (lihat komentar kenapa di atas).
  const dominan = [...daftar].sort((a, b) => b.rasio - a.rasio)[0];

  const catatan = kosong.length > 0
    ? `Data kosong untuk: ${kosong.join(', ')} (ditampilkan 0, tidak dihitung bahaya).`
    : `Pemicu utama: ${dominan.nama} (${dominan.rasio}× batas aman).`;

  return { daftar, dominan, catatan };
}

export default analisisKimia;
