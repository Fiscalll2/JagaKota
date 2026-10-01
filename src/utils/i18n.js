// JagaKota v2 — kamus bahasa disusun per bagian (builder), bukan satu objek datar.
// Kunci dipertahankan 100% kompatibel; kalimat disuarakan ulang gaya warga.

function bagianAplikasi() {
  return {
    appTagline: 'Jaga Kota Bersama — Pantau, Siaga, Aksi',
    appSubtitle: 'Jaga Kota Bersama — Pantau, Siaga, Aksi',
    appTitle: 'JagaKota',
    appName: 'JagaKota',
    liveBadge: 'DATA REAL-TIME',
    lastUpdated: 'Terakhir diperbarui',
    offlineMode: 'Mode Offline (Menampilkan data cache)',
    loading: 'Memuat data lingkungan...',
    errorLoading: 'Gagal memuat sebagian data. Silakan coba lagi.',
    retry: 'Coba Lagi',
    close: 'Tutup',
    copied: 'Tautan disalin ke papan klip!',
  };
}

function bagianKepala() {
  return {
    selectCity: 'Pilih Kota',
    searchCity: 'Cari kota atau lokasi...',
    useGps: 'Gunakan Lokasi Saat Ini',
    gpsActive: 'Menggunakan GPS',
    gps: 'Lokasi Saya',
    refresh: 'Segarkan Data',
    themeToggle: 'Tema',
    lightMode: 'Terang',
    darkMode: 'Gelap',
    installApp: 'Pasang Aplikasi',
    pwaInstall: 'Pasang Aplikasi',
    notifyEnable: 'Notifikasi',
    notifyActive: 'Aktif',
    share: 'Bagikan',
    emergency: 'Darurat 112',
  };
}

function bagianSiaga() {
  return {
    alertQuakeTitle: 'Peringatan Gempa Terkini',
    alertAqiTitle: 'Peringatan Polusi Udara',
    alertAqiDesc: 'Udara lagi tidak sehat, Lur. Pakai masker kalau keluar rumah.',
    panduanSiaga: 'Panduan Siaga Warga',
    tabSiaga: 'Siaga',
    tabPanduan: 'Panduan',
    tabRingkasan: 'Ringkasan',
    tabUdara: 'Udara',
    tabPeta: 'Peta',
  };
}

function bagianSkor() {
  return {
    ecoScoreTitle: 'SKOR KUALITAS LINGKUNGAN',
    ecoTitle: 'Skor KotaSiaga',
    ecoSubtitle: 'Skor khas JagaKota: udara + panas + UV',
    activitiesTitle: 'Saran Aksi Warga',
    exposure: 'Paparan harian',
    cigsUnit: 'kretek/hari',
    cigsPerDay: 'batang rokok/hari',
    cigsEquivalent: 'Setara menghisap',
    cigsEquiv: 'Perkiraan setara dengan',
    cleanAir: 'Udara Bersih',
  };
}

function bagianUdara() {
  return {
    standardLabel: 'Standar US-EPA & ISPU',
    mainParticulate: 'Partikulat PM2.5',
    aqiSubtitle: 'Indeks udara versi warga (US-AQI)',
    aqiTitle: 'Kualitas Udara',
    aqiGood: 'Baik',
    aqiModerate: 'Sedang',
    aqiUnhealthySensitive: 'Tidak Sehat bagi Kelompok Sensitif',
    aqiUnhealthy: 'Tidak Sehat',
    aqiVeryUnhealthy: 'Sangat Tidak Sehat',
    aqiHazardous: 'Berbahaya',
    dominantPollutant: 'Polutan Utama',
    healthAdvice: 'Saran Kesehatan',
    so2: 'Sulfur Dioksida (SO2)',
    o3: 'Ozon (O3)',
    no2: 'Nitrogen Dioksida (NO2)',
    co: 'Karbon Monoksida (CO)',
    pm10: 'PM10',
    pm25: 'PM2.5',
  };
}

function bagianCuaca() {
  return {
    visibility: 'Jarak Pandang',
    pressure: 'Tekanan Udara',
    windDirection: 'Arah Angin',
    windSpeed: 'Kecepatan Angin',
    humidity: 'Kelembaban Udara',
    feelsLike: 'Terasa Seperti',
    temperature: 'Suhu',
    weatherSubtitle: 'Kondisi atmosfer & kenyamanan termal saat ini',
    weatherTitle: 'Cuaca & Iklim',
  };
}

function bagianUv() {
  return {
    uvExtreme: 'Ekstrem (Sangat Berbahaya)',
    uvVeryHigh: 'Sangat Tinggi (Ekstrem)',
    uvHigh: 'Tinggi (Bahaya)',
    uvModerate: 'Sedang (Waspada)',
    uvLow: 'Rendah (Aman)',
    uvIndex: 'Indeks UV',
    uvSubtitle: 'Indeks Paparan Ultraviolet Global (WHO)',
    uvTitle: 'Radiasi Sinar UV',
    uvAdviceExtreme: 'Jangan keluar saat tengah hari bolong.',
    uvAdviceHigh: 'Pakai sunscreen SPF 30+ dan cari teduhan.',
    uvAdviceMod: 'Pakai topi atau kacamata kalau terik.',
    uvAdviceLow: 'Aman buat aktivitas di luar.',
  };
}

function bagianKarhutla() {
  return {
    viewKarhutlaList: 'Lihat Daftar Karhutla',
    hazeNone: 'Udara Bebas Asap',
    hazeActive: 'Terpapar Kabut Asap',
    hazeStatus: 'Status Kabut Asap',
    fdrsExtreme: 'Ekstrem (Sangat Rawan)',
    fdrsHigh: 'Tinggi (Rawan Terbakar)',
    fdrsModerate: 'Sedang (Waspada)',
    fdrsLow: 'Rendah (Aman)',
    fdrsIndex: 'Tingkat Kerawanan FDRS',
    satelliteSource: 'Sumber Satelit: KLHK SiPongi+ & NASA FIRMS (VIIRS & MODIS)',
    activeHotspots: 'Titik Panas Terdeteksi',
    hotspotsNearby: 'Titik Panas Satelit (400 km)',
    waspadaAlertMsg: 'STATUS WASPADA: Semak & alang-alang mulai mengering. Hindari pembakaran sampah.',
    rawanAlertMsg: 'STATUS RAWAN: Vegetasi di wilayah setempat sangat kering & mudah terbakar.',
    hazeAlertMsg: 'PERINGATAN KABUT ASAP: Udara terpapar asap kiriman dari titik api {regency} ({dist} km). Lahan setempat aman, namun gunakan masker N95 untuk pernapasan!',
    statusSafeMsg: 'Kondisi lahan setempat AMAN dan bebas dari paparan kabut asap karhutla.',
    statusSafeTitle: 'AMAN',
    allHotspotsBtn: 'Lihat Semua Titik Panas',
    fdrsExplExplanation: '*Catatan: Status "Lahan Aman" berarti tanah & vegetasi setempat lembab dan aman dari kebakaran langsung, namun udara tetap dapat terpapar kabut asap kiriman dari titik api tetangga.',
    landConditionTitle: 'Tingkat Kerawanan Kebakaran Lahan (FDRS)',
    noHotspotsNearby: 'Tidak terdeteksi titik panas dalam radius 400 km.',
    nearestHotspotLabel: 'Titik Panas Terdekat',
    landLocalBadge: 'Lahan Setempat',
    hazeCleanBadge: 'Kabut Asap: Bersih / Aman',
    hazeActiveBadge: 'Terdeteksi Paparan Asap',
    karhutlaCardHeader: 'STATUS KARHUTLA & KABUT ASAP',
    karhutlaSubtitle: 'Data FDRS BMKG · KLHK SiPongi+ & NASA FIRMS · Deteksi Kabut Asap Lintas Wilayah',
    karhutlaTitle: 'Indeks Kebakaran Hutan & Lahan (Karhutla)',
  };
}

function bagianGunung() {
  return {
    viewVolcanoList: 'Lihat Semua Gunung Api',
    levelAwas: 'Level IV (Awas)',
    levelSiaga: 'Level III (Siaga)',
    levelWaspada: 'Level II (Waspada)',
    levelNormal: 'Level I (Normal)',
    volcanoStatus: 'Status Erupsi',
    dangerRadius: 'Radius Bahaya',
    nearestVolcano: 'Gunung Api Terdekat',
    activeVolcanoes: 'Gunung Api Aktif',
    volcanoAlertMsg: 'Waspada peningkatan aktivitas vulkanik. Patuhi zona bahaya rekomendasi PVMBG.',
    volcanoNormalMsg: 'Kondisi normal. Tidak ada aktivitas erupsi yang mengancam wilayah ini.',
    volcanoAllBtn: 'Semua Gunung Api',
    volcanoStatusLevel: 'Status',
    volcanoDistance: 'Jarak',
    volcanoSubtitle: 'Data Resmi PVMBG · MAGMA Indonesia',
    volcanoTitle: 'Aktivitas Gunung Api Terdekat',
  };
}

function bagianGempa() {
  return {
    closeQuakesBtn: 'Tutup Riwayat',
    recentQuakesBtn: 'Riwayat Gempa',
    tsunamiAlert: 'Potensi Tsunami',
    noTsunami: 'Tidak Berpotensi Tsunami',
    tidakPotensiTsunami: 'Tidak Berpotensi Tsunami',
    potensiTsunami: 'Berpotensi Tsunami',
    quakeDistance: 'Jarak dari lokasi Anda',
    feltQuakes: 'Gempa Dirasakan Terbaru',
    tsunamiPotential: 'Potensi Tsunami',
    epicenter: 'Pusat Gempa',
    depth: 'Kedalaman',
    magnitude: 'Magnitudo',
    latestQuake: 'Gempa Terkini',
    quakeTitle: 'Aktivitas Seismik & Gempa BMKG',
  };
}

function bagianGrafik() {
  return {
    tomorrow: 'Besok',
    today: 'Hari Ini',
    rainProb: 'Peluang Hujan',
    clean24h: 'Waktu Terbersih',
    peak24h: 'Puncak Tertinggi',
    avg24h: 'Rata-rata 24 Jam',
    metricPm25: 'Partikel PM2.5',
    metricAqi: 'Indeks AQI',
    chartTempTitle: 'Tren Suhu 24 Jam',
    chartAqiTitle: 'Tren Kualitas Udara 24 Jam',
    forecast7Subtitle: 'Proyeksi cuaca mingguan & potensi hujan',
    forecast7Title: 'Prakiraan Cuaca 7 Hari',
    aqiTrendSubtitle: 'Riwayat fluktuasi per jam (ISPU & US-EPA)',
    aqiTrend: 'Tren Kualitas Udara (24 Jam)',
  };
}

function bagianPeta() {
  return {
    legend: 'Legenda Peta',
    mapSubtitle: 'Stasiun pantau kualitas udara, gempa bumi BMKG & sebaran titik api satelit',
    mapTitle: 'Peta Pantauan Nusantara',
  };
}

function bagianBerbagi() {
  return {
    shareStoryText: 'Bagikan ringkasan visual kualitas udara, cuaca, gempa, dan karhutla terkini.',
    shareSupportHint: 'Mendukung WhatsApp Status, Instagram Stories, Twitter/X, & aplikasi lainnya',
    copiedBtn: 'Tersalin!',
    copyTextBtn: 'Salin Teks',
    downloadPngBtn: 'Unduh PNG',
    shareBtn: 'Bagikan Gambar',
    shareModalSubtitle: 'Format Story HD (9:16) untuk WhatsApp & Instagram',
    shareModalTitle: 'Bagikan Kondisi Lingkungan',
    shareCard: 'Bagikan Kartu Kondisi',
  };
}

function bagianKaki() {
  return {
    aboutApp: 'Tentang Aplikasi',
    emergencyGuide: 'Panduan Darurat',
    repoLink: 'GitHub Repository',
    embedWidget: 'Pasang Widget',
    treatCoffee: 'Traktir Kopi',
    footerSources: 'Sumber Data Resmi: BMKG (Meteorologi, Klimatologi & Geofisika), PVMBG / Magma Indonesia (Aktivitas Gunung Api), KLHK SiPongi+ & NASA FIRMS (Satelit Titik Panas Karhutla), serta Open-Meteo / Copernicus Atmosphere (Kualitas Udara ISPU & AQI).',
    footerTitle: 'JagaKota: Pemantauan Ekologi & Kesiapsiagaan Bencana Real-Time',
  };
}

const dictionaryId = {
  ...bagianKaki(),
  ...bagianBerbagi(),
  ...bagianPeta(),
  ...bagianGrafik(),
  ...bagianGempa(),
  ...bagianGunung(),
  ...bagianKarhutla(),
  ...bagianUv(),
  ...bagianCuaca(),
  ...bagianUdara(),
  ...bagianSkor(),
  ...bagianSiaga(),
  ...bagianKepala(),
  ...bagianAplikasi(),
};

export const translations = dictionaryId;
translations.id = translations;
translations.en = translations;

export const i18n = translations;
export const kamusJaga = translations;
export const T2 = translations;
export default translations;
