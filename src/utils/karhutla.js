import { hitungJarakKm as ukurJarakDarurat } from './geo.js';

function rakitJenjangFdrs(kode, judul, uraian, warna, latar) {
  return { code: kode, label: judul, desc: uraian, color: warna, bg: latar };
}

export const FDRS_LEVELS = {
  LOW: rakitJenjangFdrs(
    'AMAN',
    'Aman / Rendah',
    'Kondisi tanah & vegetasi basah/lembab. Sangat kecil kemungkinan terjadi kebakaran hutan & lahan.',
    '#10b981',
    '#ecfdf5'
  ),
  MODERATE: rakitJenjangFdrs(
    'SEDANG',
    'Sedang / Waspada',
    'Serasah dan alang-alang mulai mengering. Potensi kebakaran sedang jika ada pemicu api luar ruangan.',
    '#eab308',
    '#fefce8'
  ),
  HIGH: rakitJenjangFdrs(
    'TINGGI',
    'Tinggi / Rawan',
    'Daun kering & semak belukar sangat mudah tersulut api. Api cepat membesar & sulit dipadamkan.',
    '#f97316',
    '#fff7ed'
  ),
  EXTREME: rakitJenjangFdrs(
    'EKSTREM',
    'Sangat Rawan / Ekstrem',
    'Lahan gambut & hutan sangat kering. Bahaya karhutla ekstrem, potensi kabut asap tebal meluas.',
    '#ef4444',
    '#fef2f2'
  ),
};

function petikAngka(sumber, daftarKunci, bawaan) {
  for (const kunci of daftarKunci) {
    const nilai = Number(sumber?.[kunci]);
    if (Number.isFinite(nilai)) return nilai;
  }
  return bawaan;
}

function skorSuhuJaga(suhu) {
  if (suhu >= 35) return 40;
  if (suhu >= 32) return 30;
  if (suhu >= 29) return 15;
  return 5;
}

function skorLembapJaga(lembap) {
  if (lembap <= 45) return 40;
  if (lembap <= 60) return 25;
  if (lembap <= 75) return 10;
  return 0;
}

function skorAnginJaga(angin) {
  if (angin >= 20) return 20;
  if (angin >= 12) return 10;
  return 5;
}

function koreksiHujanJaga(hujan) {
  if (hujan > 5) return -45;
  if (hujan > 1) return -25;
  return 0;
}

export function calculateFdrs(weatherData) {
  const jepret = weatherData?.current;
  if (!jepret) return FDRS_LEVELS.LOW;
  const suhu = petikAngka(jepret, ['temp', 'temperature', 'temperature_2m'], 30);
  const lembap = petikAngka(jepret, ['humidity', 'relative_humidity_2m'], 75);
  const angin = petikAngka(jepret, ['windSpeed', 'wind_speed_10m'], 10);
  const hujan = petikAngka(jepret, ['precipitation', 'precip'], 0);
  const total = skorSuhuJaga(suhu) + skorLembapJaga(lembap) + skorAnginJaga(angin) + koreksiHujanJaga(hujan);
  if (total >= 70) return FDRS_LEVELS.EXTREME;
  if (total >= 50) return FDRS_LEVELS.HIGH;
  if (total >= 30) return FDRS_LEVELS.MODERATE;
  return FDRS_LEVELS.LOW;
}

const BARIS_TITIK_API = [
  ["hs-sum-riau-01", "Kabupaten Bengkalis (Kec. Bukit Batu)", "Riau", "Sumatera", 1.4821, 101.9934, "VIIRS SNPP (375m)", "Tinggi (96%)", "HIGH", 358.5, 42.4, "Lahan Gambut Dalam Biosfer Giam Siak Kecil", "KLHK SiPongi+ / NASA FIRMS", "NRT Satelit Terkini"],
  ["hs-sum-riau-02", "Kabupaten Bengkalis (Pulau Rupat Pesisir)", "Riau", "Sumatera", 2.0821, 101.5821, "NOAA-20 VIIRS", "Tinggi (89%)", "HIGH", 344.2, 27.6, "Lahan Gambut Pesisir Selat Melaka", "NASA FIRMS (NOAA-20)", "NRT Satelit Terkini"],
  ["hs-sum-riau-03", "Kabupaten Rokan Hilir (Kec. Tanah Putih)", "Riau", "Sumatera", 1.8312, 100.8241, "NOAA-21 VIIRS", "Sedang (78%)", "MODERATE", 326.2, 14.2, "Perkebunan & Semak Belukar Gambut", "NASA FIRMS (NOAA-21)", "NRT Satelit Terkini"],
  ["hs-sum-riau-04", "Kabupaten Siak (Semenanjung Kampar)", "Riau", "Sumatera", 0.7641, 102.1852, "VIIRS SNPP (375m)", "Tinggi (92%)", "HIGH", 349, 33.5, "Kubah Gambut Kering", "KLHK SiPongi+ / NASA FIRMS", "NRT Satelit Terkini"],
  ["hs-sum-riau-05", "Kabupaten Pelalawan (Kec. Teluk Meranti)", "Riau", "Sumatera", 0.2821, 102.5841, "NOAA-20 VIIRS", "Tinggi (88%)", "HIGH", 341.2, 25.8, "Hutan Rawa Gambut Terbuka", "NASA FIRMS (NOAA-20)", "NRT Satelit Terkini"],
  ["hs-sum-riau-06", "Kota Dumai (Kec. Sungai Sembilan)", "Riau", "Sumatera", 1.7241, 101.3821, "VIIRS SNPP (375m)", "Sedang (82%)", "MODERATE", 330.4, 18.2, "Semak Belukar Gambut Pesisir", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-sum-riau-07", "Kabupaten Indragiri Hilir (Kec. Gaung)", "Riau", "Sumatera", -0.3412, 103.1824, "MODIS Terra", "Sedang (79%)", "MODERATE", 327.6, 16, "Lahan Gambut Kering & Kanal", "NASA FIRMS (MODIS Terra)", "NRT Satelit Terkini"],
  ["hs-sum-riau-08", "Kabupaten Rokan Hulu (Kec. Bonai Darussalam)", "Riau", "Sumatera", 1.1412, 100.5412, "MODIS Aqua", "Sedang (76%)", "MODERATE", 325, 13.7, "Semak Belukar & Lahan Terbuka", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-sum-sumsel-01", "Kabupaten Ogan Komering Ilir (Tulung Selapan)", "Sumatera Selatan", "Sumatera", -3.3821, 105.1245, "VIIRS SNPP (375m)", "Tinggi (93%)", "HIGH", 352.1, 36.8, "Lahan Gambut Dalam Tulung Selapan", "KLHK SiPongi+ / NASA FIRMS", "NRT Satelit Terkini"],
  ["hs-sum-sumsel-02", "Kabupaten Ogan Komering Ilir (Kec. Cengal)", "Sumatera Selatan", "Sumatera", -3.6412, 105.3821, "NOAA-20 VIIRS", "Tinggi (89%)", "HIGH", 343.8, 28.1, "Rawa Gambut & Semak Belukar", "NASA FIRMS (NOAA-20)", "NRT Satelit Terkini"],
  ["hs-sum-sumsel-03", "Kabupaten Musi Banyuasin (Kec. Bayung Lencir)", "Sumatera Selatan", "Sumatera", -2.0412, 103.8124, "VIIRS SNPP (375m)", "Tinggi (87%)", "HIGH", 338.5, 22.4, "Semak Belukar Gambut Perbatasan", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-sum-sumsel-04", "Kabupaten Banyuasin (TN Sembilang Penyangga)", "Sumatera Selatan", "Sumatera", -2.2841, 104.8821, "MODIS Aqua", "Sedang (77%)", "MODERATE", 325.8, 14.5, "Kawasan Hutan Rawa Pesisir", "NASA FIRMS (MODIS Aqua)", "NRT Satelit Terkini"],
  ["hs-sum-sumsel-05", "Kabupaten Muara Enim (Kec. Gelumbang)", "Sumatera Selatan", "Sumatera", -3.2412, 104.4214, "NOAA-21 VIIRS", "Sedang (76%)", "MODERATE", 324.9, 13.8, "Lahan Terbuka & Semak Kering", "NASA FIRMS (NOAA-21)", "NRT Satelit Terkini"],
  ["hs-sum-sumsel-06", "Kabupaten Ogan Ilir (Kec. Indralaya Utara)", "Sumatera Selatan", "Sumatera", -3.1821, 104.6821, "VIIRS SNPP (375m)", "Sedang (81%)", "MODERATE", 329.5, 17.2, "Semak Rawa Gambut Jalur Tol", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-sum-jambi-01", "Kabupaten Muaro Jambi (Kec. Kumpeh Ulu)", "Jambi", "Sumatera", -1.5432, 103.8123, "VIIRS SNPP (375m)", "Sedang (82%)", "MODERATE", 329.4, 18.5, "Lahan Gambut Kumpeh", "KLHK SiPongi+ / NASA FIRMS", "NRT Satelit Terkini"],
  ["hs-sum-jambi-02", "Kabupaten Tanjung Jabung Timur (TN Berbak)", "Jambi", "Sumatera", -1.1821, 103.6214, "NOAA-21 VIIRS", "Sedang (80%)", "MODERATE", 328, 16.2, "Kawasan Pesisir Gambut Berbak", "NASA FIRMS (NOAA-21)", "NRT Satelit Terkini"],
  ["hs-sum-jambi-03", "Kabupaten Tanjung Jabung Barat (Kec. Betara)", "Jambi", "Sumatera", -1.0214, 103.3412, "MODIS Terra", "Sedang (75%)", "MODERATE", 323.5, 12.8, "Perkebunan Gambut & Semak", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-sum-jambi-04", "Kabupaten Sarolangun (Kec. Mandiangin)", "Jambi", "Sumatera", -2.1412, 102.8821, "NOAA-20 VIIRS", "Sedang (74%)", "MODERATE", 323.8, 12.4, "Lahan Terbuka & Semak Kering", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-sum-aceh-01", "Kabupaten Aceh Barat (Meulaboh / Johan Pahlawan)", "Aceh", "Sumatera", 4.1482, 96.1284, "VIIRS SNPP (375m)", "Tinggi (87%)", "HIGH", 338.4, 21.6, "Lahan Gambut Pesisir Barat", "KLHK SiPongi+ / NASA FIRMS", "NRT Satelit Terkini"],
  ["hs-sum-aceh-02", "Kabupaten Nagan Raya (Kawasan Rawa Tripa)", "Aceh", "Sumatera", 3.7821, 96.5412, "NOAA-20 VIIRS", "Sedang (81%)", "MODERATE", 329.8, 17.5, "Kawasan Lindung Gambut Tripa", "NASA FIRMS (NOAA-20)", "NRT Satelit Terkini"],
  ["hs-sum-aceh-03", "Kabupaten Aceh Singkil (Suaka Rawa Singkil)", "Aceh", "Sumatera", 2.3412, 97.8214, "MODIS Aqua", "Sedang (77%)", "MODERATE", 325.2, 13.6, "Kawasan Konservasi Hutan Rawa", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-sum-sumut-01", "Kabupaten Labuhanbatu (Kec. Panai Tengah)", "Sumatera Utara", "Sumatera", 2.1842, 100.0821, "NOAA-20 VIIRS", "Sedang (78%)", "MODERATE", 326, 14.5, "Perkebunan & Semak Belukar", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-sum-sumut-02", "Kabupaten Labuhanbatu Utara (Kec. Kualuh Hilir)", "Sumatera Utara", "Sumatera", 2.4412, 99.9821, "VIIRS SNPP (375m)", "Sedang (79%)", "MODERATE", 327.3, 15.2, "Semak Belukar Rawa Kering", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-sum-sumut-03", "Kabupaten Asahan (Kec. Silau Laut)", "Sumatera Utara", "Sumatera", 3.1214, 99.7821, "MODIS Terra", "Sedang (74%)", "MODERATE", 323, 12, "Semak Pesisir Pantai", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-sum-sumbar-01", "Kabupaten Pesisir Selatan (Pancung Soal)", "Sumatera Barat", "Sumatera", -2.1821, 101.1214, "VIIRS SNPP (375m)", "Sedang (79%)", "MODERATE", 327.8, 15.4, "Gambut Pesisir Lunang Silaut", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-sum-sumbar-02", "Kabupaten Dharmasraya (Kec. Koto Baru)", "Sumatera Barat", "Sumatera", -1.0412, 101.6214, "NOAA-20 VIIRS", "Sedang (75%)", "MODERATE", 324.5, 13, "Perkebunan & Semak Terbuka", "NASA FIRMS (NOAA-20)", "NRT Satelit Terkini"],
  ["hs-sum-bengkulu-01", "Kabupaten Mukomuko (Kec. Ipuh Gambut)", "Bengkulu", "Sumatera", -2.9821, 101.4821, "NOAA-21 VIIRS", "Sedang (76%)", "MODERATE", 325.4, 13.8, "Lahan Gambut Dangkal Pesisir", "NASA FIRMS (NOAA-21)", "NRT Satelit Terkini"],
  ["hs-sum-lampung-01", "Kabupaten Mesuji / Tulang Bawang", "Lampung", "Sumatera", -4.3821, 105.5214, "VIIRS SNPP (375m)", "Sedang (79%)", "MODERATE", 327.4, 15, "Semak Belukar Rawa Mesuji", "NASA FIRMS (VIIRS SNPP)", "NRT Satelit Terkini"],
  ["hs-sum-lampung-02", "Kabupaten Lampung Timur (TN Way Kambas Sabana)", "Lampung", "Sumatera", -5.0412, 105.7821, "MODIS Terra", "Sedang (74%)", "MODERATE", 323.2, 12.1, "Semak & Savana Dataran Rendah", "NASA FIRMS (MODIS)", "NRT Satelit Terkini"],
  ["hs-sum-babel-01", "Kabupaten Bangka Barat (Kec. Muntok)", "Kepulauan Bangka Belitung", "Sumatera", -1.7821, 105.4214, "MODIS Terra", "Sedang (73%)", "MODERATE", 322, 11.8, "Lahan Terbuka & Semak Kering", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-sum-babel-02", "Kabupaten Bangka Selatan (Kec. Toboali)", "Kepulauan Bangka Belitung", "Sumatera", -2.9821, 106.1821, "NOAA-20 VIIRS", "Sedang (76%)", "MODERATE", 325.1, 13.4, "Semak Belukar Pantai", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-sum-kepri-01", "Kabupaten Karimun (Pulau Kundur Gambut)", "Kepulauan Riau", "Sumatera", 0.7412, 103.4412, "VIIRS SNPP (375m)", "Sedang (77%)", "MODERATE", 325.8, 14, "Semak Gambut Dangkal Pulau", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-sum-kepri-02", "Kabupaten Natuna (Pulau Bunguran)", "Kepulauan Riau", "Sumatera", 3.9412, 108.2821, "MODIS Aqua", "Sedang (74%)", "MODERATE", 323, 12, "Semak Perbukitan Kering", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-kal-kalbar-01", "Kabupaten Ketapang (Matan Hilir Selatan)", "Kalimantan Barat", "Kalimantan", -1.8324, 110.1248, "VIIRS SNPP (375m)", "Tinggi (96%)", "HIGH", 360.2, 44.1, "Gambut Dalam & Hutan Produksi", "KLHK SiPongi+ / NASA FIRMS", "NRT Satelit Terkini"],
  ["hs-kal-kalbar-02", "Kabupaten Ketapang (TN Gunung Palung Penyangga)", "Kalimantan Barat", "Kalimantan", -1.2412, 110.1821, "NOAA-21 VIIRS", "Tinggi (90%)", "HIGH", 346.8, 31, "Hutan Rawa Gambut", "NASA FIRMS (NOAA-21)", "NRT Satelit Terkini"],
  ["hs-kal-kalbar-03", "Kabupaten Kubu Raya (Kec. Rasau Jaya)", "Kalimantan Barat", "Kalimantan", -0.2145, 109.3412, "NOAA-20 VIIRS", "Sedang (75%)", "MODERATE", 322.8, 12.6, "Lahan Gambut Terbuka Rasau", "NASA FIRMS (NOAA-20)", "NRT Satelit Terkini"],
  ["hs-kal-kalbar-04", "Kabupaten Kubu Raya (Kec. Sungai Raya)", "Kalimantan Barat", "Kalimantan", -0.1214, 109.4821, "VIIRS SNPP (375m)", "Tinggi (88%)", "HIGH", 340.5, 24.2, "Semak Belukar Gambut", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-kal-kalbar-05", "Kabupaten Sanggau (Kec. Tayan Hilir)", "Kalimantan Barat", "Kalimantan", 0.1241, 110.5821, "VIIRS SNPP (375m)", "Sedang (81%)", "MODERATE", 330.5, 17.8, "Semak Belukar Perbukitan", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-kal-kalbar-06", "Kabupaten Sambas (Kec. Teluk Keramat)", "Kalimantan Barat", "Kalimantan", 1.4412, 109.2812, "MODIS Aqua", "Sedang (77%)", "MODERATE", 326.1, 14, "Lahan Terbuka Semak Belukar", "NASA FIRMS (MODIS)", "NRT Satelit Terkini"],
  ["hs-kal-kalbar-07", "Kabupaten Mempawah (Kec. Sungai Kunyit)", "Kalimantan Barat", "Kalimantan", 0.4412, 108.9821, "NOAA-20 VIIRS", "Sedang (79%)", "MODERATE", 327.9, 15.6, "Gambut Pesisir Kering", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-kal-kalbar-08", "Kabupaten Sintang (Kec. Sepauk)", "Kalimantan Barat", "Kalimantan", 0.0821, 111.9821, "MODIS Terra", "Sedang (76%)", "MODERATE", 324.7, 13.5, "Semak Belukar Terbuka", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-kal-kalbar-09", "Kabupaten Landak (Kec. Mandor)", "Kalimantan Barat", "Kalimantan", 0.3412, 109.3412, "NOAA-21 VIIRS", "Sedang (78%)", "MODERATE", 326.8, 14.8, "Semak Cagar Alam Penyangga", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-kal-kalteng-01", "Kabupaten Pulang Pisau (Sebangau Kuala - Eks PLG)", "Kalimantan Tengah", "Kalimantan", -2.7412, 114.2456, "VIIRS SNPP (375m)", "Tinggi (94%)", "HIGH", 354, 38.3, "Lahan Gambut Dalam Eks-PLG", "KLHK SiPongi+ / NASA FIRMS", "NRT Satelit Terkini"],
  ["hs-kal-kalteng-02", "Kota Palangka Raya (Sebangau / Kalampangan)", "Kalimantan Tengah", "Kalimantan", -2.1894, 113.8821, "MODIS Aqua", "Sedang (80%)", "MODERATE", 331.7, 16.9, "Semak Belukar Gambut Kering", "KLHK SiPongi+ / NASA FIRMS", "NRT Satelit Terkini"],
  ["hs-kal-kalteng-03", "Kabupaten Kotawaringin Timur (Sampit)", "Kalimantan Tengah", "Kalimantan", -2.5312, 112.9512, "VIIRS SNPP (375m)", "Tinggi (90%)", "HIGH", 345.2, 28.6, "Lahan Gambut & Belukar Sampit", "KLHK SiPongi+ / NASA FIRMS", "NRT Satelit Terkini"],
  ["hs-kal-kalteng-04", "Kabupaten Kotawaringin Barat (Kec. Kumai)", "Kalimantan Tengah", "Kalimantan", -2.8821, 111.8214, "NOAA-20 VIIRS", "Tinggi (86%)", "HIGH", 337.8, 21, "Penyangga TN Tanjung Puting", "NASA FIRMS (NOAA-20)", "NRT Satelit Terkini"],
  ["hs-kal-kalteng-05", "Kabupaten Kapuas (Kec. Mantangai Blok B)", "Kalimantan Tengah", "Kalimantan", -2.3412, 114.5412, "NOAA-21 VIIRS", "Tinggi (89%)", "HIGH", 344, 27.5, "Kubah Gambut Kering Eks-PLG", "NASA FIRMS (NOAA-21)", "NRT Satelit Terkini"],
  ["hs-kal-kalteng-06", "Kabupaten Katingan (Kec. Katingan Kuala)", "Kalimantan Tengah", "Kalimantan", -3.0412, 113.3821, "MODIS Terra", "Sedang (78%)", "MODERATE", 326.5, 14.8, "Semak Rawa Gambut", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-kal-kalteng-07", "Kabupaten Seruyan (Danau Sembuluh)", "Kalimantan Tengah", "Kalimantan", -2.8412, 112.5412, "VIIRS SNPP (375m)", "Sedang (82%)", "MODERATE", 330.8, 18, "Semak Danau Gambut Kering", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-kal-kalsel-01", "Kabupaten Banjar / Banjarbaru (Guntung Damar)", "Kalimantan Selatan", "Kalimantan", -3.3145, 114.8912, "VIIRS SNPP (375m)", "Sedang (83%)", "MODERATE", 332.5, 19.4, "Semak & Lahan Gambut Sekitar Bandara", "KLHK SiPongi+ / NASA FIRMS", "NRT Satelit Terkini"],
  ["hs-kal-kalsel-02", "Kabupaten Tanah Laut (Kec. Bati-Bati / Kurau)", "Kalimantan Selatan", "Kalimantan", -3.8142, 114.7812, "NOAA-20 VIIRS", "Sedang (76%)", "MODERATE", 325, 13.5, "Savana Semak Pesisir Kering", "NASA FIRMS (NOAA-20)", "NRT Satelit Terkini"],
  ["hs-kal-kalsel-03", "Kabupaten Barito Kuala (Kec. Anjir Muara)", "Kalimantan Selatan", "Kalimantan", -3.1412, 114.5214, "MODIS Aqua", "Sedang (74%)", "MODERATE", 323, 12, "Lahan Pertanian & Rawa Kering", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-kal-kalsel-04", "Kabupaten Tapin (Kec. Candi Laras Selatan)", "Kalimantan Selatan", "Kalimantan", -2.8821, 115.0821, "VIIRS SNPP (375m)", "Sedang (80%)", "MODERATE", 328.7, 16.3, "Rawa Lebak Dangkal Kering", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-kal-kalsel-05", "Kabupaten Hulu Sungai Selatan (Daha Selatan)", "Kalimantan Selatan", "Kalimantan", -2.6821, 115.1821, "NOAA-21 VIIRS", "Sedang (77%)", "MODERATE", 326.1, 14.2, "Semak Rawa Gambut Lebak", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-kal-kaltim-01", "Kabupaten Kutai Kartanegara (Kec. Muara Kaman)", "Kalimantan Timur", "Kalimantan", -0.4215, 116.9821, "VIIRS SNPP (375m)", "Tinggi (88%)", "HIGH", 339.6, 22, "Area Hutan Tanaman & Semak", "KLHK SiPongi+ / NASA FIRMS", "NRT Satelit Terkini"],
  ["hs-kal-kaltim-02", "Kabupaten Penajam Paser Utara (Sepaku / IKN)", "Kalimantan Timur", "Kalimantan", -0.8841, 116.7412, "VIIRS SNPP (375m)", "Sedang (81%)", "MODERATE", 329.8, 17.2, "Semak Belukar & Hutan Sekunder Penyangga", "KLHK SiPongi+ / NASA FIRMS", "NRT Satelit Terkini"],
  ["hs-kal-kaltim-03", "Kabupaten Berau (Kec. Segah)", "Kalimantan Timur", "Kalimantan", 2.1542, 117.4821, "MODIS Terra", "Sedang (78%)", "MODERATE", 327, 14.8, "Hutan Sekunder & Semak", "NASA FIRMS (MODIS)", "NRT Satelit Terkini"],
  ["hs-kal-kaltim-04", "Kabupaten Paser (Kec. Batu Sopang)", "Kalimantan Timur", "Kalimantan", -1.8821, 115.9821, "NOAA-20 VIIRS", "Sedang (77%)", "MODERATE", 325.8, 13.9, "Perbukitan Semak Belukar", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-kal-kaltara-01", "Kabupaten Bulungan (Kec. Tanjung Palas)", "Kalimantan Utara", "Kalimantan", 2.8841, 117.3412, "NOAA-20 VIIRS", "Sedang (74%)", "MODERATE", 323.8, 12.5, "Semak Belukar Terbuka", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-kal-kaltara-02", "Kabupaten Nunukan (Kec. Sebuku)", "Kalimantan Utara", "Kalimantan", 3.9821, 117.1821, "VIIRS SNPP (375m)", "Sedang (76%)", "MODERATE", 325.2, 13.6, "Hutan Sekunder & Lahan Terbuka", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-jawa-jatim-01", "Kawasan TN Bromo Tengger Semeru (Kaldera Pasir)", "Jawa Timur", "Jawa", -7.9425, 112.953, "VIIRS SNPP (375m)", "Tinggi (94%)", "HIGH", 351.4, 38.2, "Savana & Kaldera Pegunungan", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-jawa-jatim-02", "Lereng Gunung Arjuno - Welirang (Tahura Soerjo)", "Jawa Timur", "Jawa", -7.765, 112.585, "NOAA-20 VIIRS", "Tinggi (89%)", "HIGH", 342.1, 27.4, "Hutan Lindung & Semak Pegunungan", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-jawa-jatim-03", "Kawasan Hutan Gunung Lawu (Cemoro Sewu)", "Jawa Timur", "Jawa", -7.628, 111.192, "VIIRS SNPP (375m)", "Tinggi (88%)", "HIGH", 339.8, 23, "Hutan Pinus & Sabana Lawu", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-jawa-jatim-04", "Taman Nasional Baluran (Savana Bekol & Bama)", "Jawa Timur", "Jawa", -7.838, 114.382, "VIIRS SNPP (375m)", "Tinggi (91%)", "HIGH", 346.5, 31.2, "Savana Tropis Kering Situbondo", "KLHK SiPongi+ / NASA FIRMS", "NRT Satelit Terkini"],
  ["hs-jawa-jatim-05", "Pegunungan Ijen - Merapi (Bondowoso/Banyuwangi)", "Jawa Timur", "Jawa", -8.058, 114.242, "NOAA-20 VIIRS", "Sedang (81%)", "MODERATE", 328.6, 18.2, "Hutan Lindung & Semak", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-jawa-jatim-06", "Lereng Gunung Raung (Kawasan Kalibaru)", "Jawa Timur", "Jawa", -8.1245, 114.045, "NOAA-21 VIIRS", "Sedang (79%)", "MODERATE", 327.2, 16, "Semak Belukar Pegunungan", "NASA FIRMS (NOAA-21)", "NRT Satelit Terkini"],
  ["hs-jawa-jatim-07", "Gunung Panderman - Butak (Kawasan Batu)", "Jawa Timur", "Jawa", -7.9124, 112.4821, "MODIS Aqua", "Sedang (76%)", "MODERATE", 324.8, 13.9, "Semak Kering Pegunungan", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-jawa-jateng-01", "Lereng Pegunungan Merbabu (Kawasan Selo)", "Jawa Tengah", "Jawa", -7.454, 110.439, "MODIS Terra", "Sedang (82%)", "MODERATE", 329.5, 17.5, "Padang Sabana Pegunungan", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-jawa-jateng-02", "Lereng Gunung Sumbing - Sindoro (Kledung)", "Jawa Tengah", "Jawa", -7.384, 110.071, "NOAA-20 VIIRS", "Sedang (79%)", "MODERATE", 326.8, 15.2, "Semak Belukar Pegunungan", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-jawa-jateng-03", "Lereng Gunung Slamet (Kawasan Bambangan)", "Jawa Tengah", "Jawa", -7.2412, 109.2145, "VIIRS SNPP (375m)", "Sedang (80%)", "MODERATE", 328.2, 16.5, "Hutan Pinus & Semak Kering", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-jawa-jateng-04", "Kawasan Pegunungan Muria (Kudus / Pati)", "Jawa Tengah", "Jawa", -6.6214, 110.8821, "MODIS Terra", "Sedang (74%)", "MODERATE", 323, 12.4, "Hutan Lindung Perbukitan", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-jawa-diy-01", "Kawasan Hutan Wanagama & Semak Kering (Gunungkidul)", "D.I. Yogyakarta", "Jawa", -7.9821, 110.5821, "NOAA-20 VIIRS", "Sedang (76%)", "MODERATE", 325.3, 13.5, "Semak Karst Kering Pegunungan Sewu", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-jawa-diy-02", "Kawasan Lereng Selatan Gunung Merapi (Sleman)", "D.I. Yogyakarta", "Jawa", -7.5841, 110.4412, "VIIRS SNPP (375m)", "Sedang (77%)", "MODERATE", 326, 14, "Semak Lereng Vulkanik", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-jawa-jabar-01", "Kawasan TN Gunung Ciremai (Pasir Batang)", "Jawa Barat", "Jawa", -6.892, 108.405, "MODIS Aqua", "Sedang (75%)", "MODERATE", 324, 14.8, "Hutan Lindung Pegunungan", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-jawa-jabar-02", "TN Gunung Gede Pangrango (Surya Kencana)", "Jawa Barat", "Jawa", -6.7821, 106.9821, "VIIRS SNPP (375m)", "Sedang (78%)", "MODERATE", 326.5, 15, "Padang Edelweiss & Sabana", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-jawa-jabar-03", "Kawasan Gunung Papandayan (Tegal Alun Garut)", "Jawa Barat", "Jawa", -7.3182, 107.7284, "NOAA-20 VIIRS", "Sedang (77%)", "MODERATE", 325.4, 14.2, "Semak Belukar Pegunungan", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-jawa-banten-01", "Kawasan TN Ujung Kulon (Pandeglang)", "Banten", "Jawa", -6.7412, 105.3821, "VIIRS SNPP (375m)", "Sedang (74%)", "MODERATE", 323.5, 13, "Semak Belukar Pesisir", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-jawa-banten-02", "TN Gunung Halimun Salak (Kawasan Lebak)", "Banten", "Jawa", -6.6821, 106.4412, "MODIS Terra", "Sedang (73%)", "MODERATE", 322.4, 12, "Hutan Sekunder & Perbukitan", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-jawa-dki-01", "Kawasan Kamal Muara & Semak Pesisir (Jakarta Utara)", "DKI Jakarta", "Jawa", -6.1041, 106.7214, "VIIRS SNPP (375m)", "Sedang (72%)", "MODERATE", 321.8, 11.2, "Lahan Terbuka & Semak Rawa Pesisir", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-nus-bali-01", "Lereng Gunung Agung (Karangasem / Kubu)", "Bali", "Bali & Nusa Tenggara", -8.3421, 115.5124, "NOAA-20 VIIRS", "Sedang (78%)", "MODERATE", 327.5, 15, "Semak Kering Pegunungan", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-nus-bali-02", "Lereng Gunung Batur (Kaldera Kintamani)", "Bali", "Bali & Nusa Tenggara", -8.2412, 115.3821, "VIIRS SNPP (375m)", "Sedang (76%)", "MODERATE", 325.2, 13.7, "Semak & Lahan Kaldera Kering", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-nus-bali-03", "TN Bali Barat (Prapat Agung Buleleng)", "Bali", "Bali & Nusa Tenggara", -8.1412, 114.4821, "MODIS Aqua", "Sedang (75%)", "MODERATE", 324, 12.8, "Hutan Musim Kering & Savana", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-nus-ntb-01", "Kabupaten Bima (Kec. Sape Sabana)", "Nusa Tenggara Barat", "Bali & Nusa Tenggara", -8.5412, 118.7241, "MODIS Terra", "Sedang (74%)", "MODERATE", 323, 12.4, "Semak Belukar Perbukitan", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-nus-ntb-02", "Lereng Gunung Rinjani (Sembalun Lombok Timur)", "Nusa Tenggara Barat", "Bali & Nusa Tenggara", -8.4124, 116.4821, "VIIRS SNPP (375m)", "Sedang (79%)", "MODERATE", 328, 15.8, "Sabana Pegunungan Rinjani", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-nus-ntb-03", "Kawasan Gunung Tambora (Bima / Dompu)", "Nusa Tenggara Barat", "Bali & Nusa Tenggara", -8.2412, 117.9821, "NOAA-21 VIIRS", "Tinggi (86%)", "HIGH", 337.5, 21.3, "Savana Kaldera Kering", "NASA FIRMS (NOAA-21)", "NRT Satelit Terkini"],
  ["hs-nus-ntb-04", "Kabupaten Sumbawa (Kec. Moyo Utara)", "Nusa Tenggara Barat", "Bali & Nusa Tenggara", -8.4412, 117.5821, "NOAA-20 VIIRS", "Sedang (77%)", "MODERATE", 325.9, 14.1, "Padang Rumput & Semak", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-nus-ntt-01", "Kabupaten Sumba Timur (Savana Puru Kambera)", "Nusa Tenggara Timur", "Bali & Nusa Tenggara", -9.8412, 120.2412, "VIIRS SNPP (375m)", "Tinggi (91%)", "HIGH", 348, 30.5, "Padang Savana Kering", "KLHK SiPongi+ / NASA FIRMS", "NRT Satelit Terkini"],
  ["hs-nus-ntt-02", "Kabupaten Timor Tengah Selatan (Amanuban)", "Nusa Tenggara Timur", "Bali & Nusa Tenggara", -9.8821, 124.2812, "NOAA-20 VIIRS", "Sedang (76%)", "MODERATE", 325.2, 13.8, "Padang Rumput Kering", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-nus-ntt-03", "Kabupaten Manggarai Barat (TN Komodo / Rinca)", "Nusa Tenggara Timur", "Bali & Nusa Tenggara", -8.6214, 119.8821, "VIIRS SNPP (375m)", "Sedang (80%)", "MODERATE", 329, 16.5, "Savana Perbukitan Kering", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-nus-ntt-04", "Kabupaten Kupang (Sabana Amfoang)", "Nusa Tenggara Timur", "Bali & Nusa Tenggara", -9.9821, 123.8412, "MODIS Terra", "Sedang (77%)", "MODERATE", 326, 14.5, "Savana Pesisir Tropis", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-nus-ntt-05", "Kabupaten Alor (Sabana Pegunungan Sirung)", "Nusa Tenggara Timur", "Bali & Nusa Tenggara", -8.3412, 124.5412, "NOAA-21 VIIRS", "Sedang (75%)", "MODERATE", 324.2, 13, "Semak Belukar Savana", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-sul-sulsel-01", "Kabupaten Maros / Pangkep (Karst Bantimurung)", "Sulawesi Selatan", "Sulawesi", -4.9821, 119.6412, "NOAA-20 VIIRS", "Sedang (77%)", "MODERATE", 326.4, 14.5, "Kawasan Karst & Semak Kering", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-sul-sulsel-02", "Kabupaten Bone (Kec. Libureng)", "Sulawesi Selatan", "Sulawesi", -4.5412, 120.3124, "VIIRS SNPP (375m)", "Sedang (79%)", "MODERATE", 328, 15.6, "Padang Rumput Kering", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-sul-sulsel-03", "Kabupaten Enrekang (Perbukitan Bambapuang)", "Sulawesi Selatan", "Sulawesi", -3.5412, 119.8214, "MODIS Aqua", "Sedang (75%)", "MODERATE", 324.1, 13.2, "Semak Belukar Perbukitan", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-sul-sulbar-01", "Kabupaten Pasangkayu (Kec. Bambalamotu)", "Sulawesi Barat", "Sulawesi", -1.1821, 119.3821, "NOAA-21 VIIRS", "Sedang (76%)", "MODERATE", 325, 13.8, "Perkebunan & Semak Terbuka", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-sul-sulbar-02", "Kabupaten Mamuju (Kawasan Semak Kalukku)", "Sulawesi Barat", "Sulawesi", -2.5412, 119.2412, "VIIRS SNPP (375m)", "Sedang (78%)", "MODERATE", 326.7, 14.6, "Semak Perbukitan Kering", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-sul-sulteng-01", "Kabupaten Sigi / Donggala (Lembah Palu)", "Sulawesi Tengah", "Sulawesi", -1.0412, 119.8912, "VIIRS SNPP (375m)", "Tinggi (85%)", "HIGH", 336.2, 20.1, "Semak Perbukitan Lembah Kering", "KLHK SiPongi+ / NASA FIRMS", "NRT Satelit Terkini"],
  ["hs-sul-sulteng-02", "Kabupaten Morowali (Kec. Bahodopi Terbuka)", "Sulawesi Tengah", "Sulawesi", -2.8124, 122.1412, "NOAA-20 VIIRS", "Sedang (78%)", "MODERATE", 326.8, 15, "Lahan Terbuka Semak Kering", "NASA FIRMS (NOAA-20)", "NRT Satelit Terkini"],
  ["hs-sul-sulteng-03", "Kabupaten Poso (Kawasan Lembah Bada)", "Sulawesi Tengah", "Sulawesi", -1.8412, 120.3412, "MODIS Terra", "Sedang (76%)", "MODERATE", 324.9, 13.5, "Padang Rumput Lembah", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-sul-sultra-01", "Kabupaten Kolaka (Kec. Wundulako)", "Sulawesi Tenggara", "Sulawesi", -4.0821, 121.5841, "NOAA-20 VIIRS", "Sedang (76%)", "MODERATE", 325.5, 13.8, "Semak Belukar Terbuka", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-sul-sultra-02", "Kabupaten Bombana (Padang Rumput Rumbia)", "Sulawesi Tenggara", "Sulawesi", -4.6412, 121.9821, "VIIRS SNPP (375m)", "Sedang (79%)", "MODERATE", 327.8, 15.7, "Savana Dataran Rendah", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-sul-gorontalo-01", "Kabupaten Pohuwato (Kec. Marisa Terbuka)", "Gorontalo", "Sulawesi", 0.5412, 121.8412, "MODIS Aqua", "Sedang (75%)", "MODERATE", 324, 13, "Lahan Pertanian & Semak Kering", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-sul-gorontalo-02", "Kabupaten Boalemo (Kec. Tilamuta)", "Gorontalo", "Sulawesi", 0.6412, 122.3412, "NOAA-20 VIIRS", "Sedang (74%)", "MODERATE", 323.2, 12.2, "Semak Belukar Perbukitan", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-sul-sulut-01", "Kabupaten Bolaang Mongondow (Lolayan)", "Sulawesi Utara", "Sulawesi", 0.8841, 124.0821, "VIIRS SNPP (375m)", "Sedang (78%)", "MODERATE", 327.2, 14.8, "Hutan Sekunder Pegunungan", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-sul-sulut-02", "Kota Bitung (Cagar Alam Tangkoko Penyangga)", "Sulawesi Utara", "Sulawesi", 1.5412, 125.1412, "NOAA-21 VIIRS", "Sedang (75%)", "MODERATE", 324, 12.6, "Semak Pesisir Kering", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-pap-papsel-01", "Kabupaten Merauke (Savana TN Wasur)", "Papua Selatan", "Maluku & Papua", -8.5412, 140.4821, "VIIRS SNPP (375m)", "Tinggi (95%)", "HIGH", 356.2, 39.4, "Padang Savana Dataran Merauke", "KLHK SiPongi+ / NASA FIRMS", "NRT Satelit Terkini"],
  ["hs-pap-papsel-02", "Kabupaten Merauke (Kec. Okaba / Rawa Kering)", "Papua Selatan", "Maluku & Papua", -7.8241, 139.7821, "NOAA-20 VIIRS", "Tinggi (93%)", "HIGH", 350.4, 32.1, "Savana / Padang Rawa Kering", "KLHK SiPongi+ / NASA FIRMS", "NRT Satelit Terkini"],
  ["hs-pap-papsel-03", "Kabupaten Mappi (Kec. Obaa Hutan Rawa)", "Papua Selatan", "Maluku & Papua", -6.5412, 139.3142, "NOAA-21 VIIRS", "Sedang (80%)", "MODERATE", 330.1, 17, "Hutan Rawa Kering", "NASA FIRMS (NOAA-21)", "NRT Satelit Terkini"],
  ["hs-pap-papsel-04", "Kabupaten Boven Digoel (Kec. Mindiptana)", "Papua Selatan", "Maluku & Papua", -5.8412, 140.3821, "VIIRS SNPP (375m)", "Sedang (78%)", "MODERATE", 327, 14.5, "Lahan Terbuka Gambut", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-pap-papua-01", "Kabupaten Keerom (Kec. Skanto Terbuka)", "Papua", "Maluku & Papua", -2.9821, 140.7821, "MODIS Terra", "Sedang (77%)", "MODERATE", 325.8, 13.9, "Lahan Terbuka Semak Belukar", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-pap-papua-02", "Kabupaten Jayapura (Kawasan Danau Sentani)", "Papua", "Maluku & Papua", -2.6412, 140.5412, "NOAA-20 VIIRS", "Sedang (75%)", "MODERATE", 324.3, 12.8, "Padang Rumput Savana Perbukitan", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-pap-papua-03", "Kabupaten Sarmi (Kec. Sarmi Timur)", "Papua", "Maluku & Papua", -1.8821, 139.3412, "MODIS Aqua", "Sedang (74%)", "MODERATE", 323.5, 12, "Semak Pesisir Pantai Tropis", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-pap-papbar-01", "Kabupaten Teluk Bintuni (Gambut Babo)", "Papua Barat", "Maluku & Papua", -2.1821, 133.2821, "VIIRS SNPP (375m)", "Sedang (78%)", "MODERATE", 326.6, 14.7, "Hutan Rawa Gambut Terbuka", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-pap-papbar-02", "Kabupaten Manokwari (Kec. Prafi)", "Papua Barat", "Maluku & Papua", -0.8841, 133.8821, "NOAA-20 VIIRS", "Sedang (75%)", "MODERATE", 324.1, 12.9, "Semak Belukar Dataran Rendah", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-pap-papbd-01", "Kabupaten Sorong (Kec. Aimas Lahan Terbuka)", "Papua Barat Daya", "Maluku & Papua", -0.9412, 131.3412, "NOAA-21 VIIRS", "Sedang (76%)", "MODERATE", 325.2, 13.4, "Semak Belukar Terbuka", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-pap-papteng-01", "Kabupaten Nabire (Kec. Wanggar Kering)", "Papua Tengah", "Maluku & Papua", -3.3821, 135.4821, "MODIS Terra", "Sedang (75%)", "MODERATE", 324, 12.5, "Lahan Terbuka & Semak Dataran", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-pap-pappeg-01", "Kabupaten Jayawijaya (Lembah Baliem Wamena)", "Papua Pegunungan", "Maluku & Papua", -4.0821, 138.9412, "VIIRS SNPP (375m)", "Sedang (77%)", "MODERATE", 325.8, 13.8, "Padang Rumput Lembah Pegunungan", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-pap-maluku-01", "Kabupaten Kepulauan Aru (Pulau Trangan)", "Maluku", "Maluku & Papua", -6.0412, 134.4821, "NOAA-20 VIIRS", "Sedang (75%)", "MODERATE", 324.5, 13.2, "Semak Belukar Kepulauan & Savana", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-pap-maluku-02", "Kabupaten Buru (Kawasan Savana Kayeli)", "Maluku", "Maluku & Papua", -3.3412, 127.0821, "MODIS Aqua", "Sedang (74%)", "MODERATE", 323.5, 12.6, "Padang Savana Kayu Putih", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-pap-maluku-03", "Kabupaten Seram Bagian Barat (Kairatu)", "Maluku", "Maluku & Papua", -3.3412, 128.3821, "VIIRS SNPP (375m)", "Sedang (76%)", "MODERATE", 325, 13.2, "Semak Perbukitan Tropis", "KLHK SiPongi+", "NRT Satelit Terkini"],
  ["hs-pap-malut-01", "Kabupaten Halmahera Selatan (Kec. Bacan)", "Maluku Utara", "Maluku & Papua", -0.6412, 127.5821, "MODIS Terra", "Sedang (74%)", "MODERATE", 323, 12, "Semak Perbukitan Tropis", "NASA FIRMS / SiPongi+", "NRT Satelit Terkini"],
  ["hs-pap-malut-02", "Kabupaten Halmahera Timur (Kec. Maba)", "Maluku Utara", "Maluku & Papua", 0.7412, 128.2821, "NOAA-20 VIIRS", "Sedang (75%)", "MODERATE", 324.2, 12.8, "Lahan Terbuka & Semak Kering", "KLHK SiPongi+", "NRT Satelit Terkini"]
];

function rakitHotspotJaga(baris) {
  const [id, regency, province, island, lat, lon, satellite, confidence, confidenceLevel, brightnessK, frpMw, type, source, detectedAt] = baris;
  return { id, regency, province, island, lat, lon, satellite, confidence, confidenceLevel, brightnessK, frpMw, type, source, detectedAt };
}

export const SATELLITE_HOTSPOTS = BARIS_TITIK_API.map(rakitHotspotJaga);

export function slugHotspot(hotspot) {
  const dasar = hotspot?.regency || hotspot?.id || 'titik-panas';
  return String(dasar).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function cariHotspotDariId(idHotspot) {
  if (!idHotspot) return null;
  return SATELLITE_HOTSPOTS.find((titik) => titik.id === idHotspot) || null;
}

export function filterHotspotPerPulau(namaPulau) {
  if (!namaPulau || namaPulau === 'Semua') return SATELLITE_HOTSPOTS;
  const kunci = String(namaPulau).toLowerCase();
  return SATELLITE_HOTSPOTS.filter((titik) => String(titik.island || '').toLowerCase() === kunci);
}

export function kelompokHotspotPerPulau(daftar = SATELLITE_HOTSPOTS) {
  const wadah = {};
  for (const titik of daftar) {
    const pulau = titik.island || 'Indonesia';
    if (!wadah[pulau]) wadah[pulau] = [];
    wadah[pulau].push(titik);
  }
  return wadah;
}

export function daftarPulauHotspot() {
  return [...new Set(SATELLITE_HOTSPOTS.map((titik) => titik.island).filter(Boolean))];
}

export function zonaKarhutla(hotspot) {
  if (!hotspot) return 'aman';
  const tinggi = hotspot.confidenceLevel === 'HIGH' || String(hotspot.confidence || '').includes('Tinggi');
  if (tinggi && Number(hotspot.frpMw) >= 25) return 'prioritas';
  if (tinggi) return 'waspada-tinggi';
  return 'waspada';
}

export function ringkasanKarhutla(daftar = SATELLITE_HOTSPOTS) {
  const tinggi = daftar.filter((t) => t.confidenceLevel === 'HIGH').length;
  return { total: daftar.length, tinggi, sedang: daftar.length - tinggi, pulau: daftarPulauHotspot().length };
}

export const hotspotSlug = slugHotspot;
export const cariHotspot = cariHotspotDariId;
export const zonaHotspot = zonaKarhutla;

export function getNearbyHotspots(userLat, userLon, maxRadiusKm = 400) {
  const garisLintang = Number(userLat);
  const garisBujur = Number(userLon);
  if (!garisLintang || !garisBujur) {
    return { nearest: null, nearbyList: [], allHotspots: SATELLITE_HOTSPOTS, totalInIndo: SATELLITE_HOTSPOTS.length };
  }
  const berJarak = SATELLITE_HOTSPOTS.map((titik) => ({
    ...titik,
    distanceKm: Math.round(ukurJarakDarurat(garisLintang, garisBujur, titik.lat, titik.lon) * 10) / 10,
  })).sort((kiri, kanan) => kiri.distanceKm - kanan.distanceKm);
  return {
    nearest: berJarak[0] || null,
    nearbyList: berJarak.filter((titik) => titik.distanceKm <= maxRadiusKm),
    allHotspots: berJarak,
    totalInIndo: SATELLITE_HOTSPOTS.length,
  };
}

export function getHazeStatus(nearestHotspot, aqi = 0, pm25 = 0) {
  const jarak = Number(nearestHotspot?.distanceKm);
  const sangatDekat = Number.isFinite(jarak) && jarak <= 50;
  const cukupDekat = Number.isFinite(jarak) && jarak <= 150;
  const udaraNaik = Number(aqi) >= 60 || Number(pm25) >= 20;
  return {
    isHazeActive: Boolean(sangatDekat || (cukupDekat && udaraNaik)),
    isVeryNear: sangatDekat,
    isNearby: cukupDekat,
    isElevatedAir: udaraNaik,
  };
}
