function rancangStatusJaga(level, nama, namaEn, kode, warna, latar, deskripsi, saran) {
  return { level, name: nama, nameEn: namaEn, code: kode, color: warna, bg: latar, description: deskripsi, recommendation: saran };
}

export const VOLCANO_STATUS_LEVELS = {
  1: rancangStatusJaga(1, "Normal", "Normal", "LEVEL I", "#10b981", "rgba(16, 185, 129, 0.15)", "Aktivitas visual dan seismik dasar. Tidak ada indikasi peningkatan ancaman.", "Aktivitas masyarakat dan pendakian aman dalam batas wajar sesuai rekomendasi PVMBG."),
  2: rancangStatusJaga(2, "Waspada", "Advisory", "LEVEL II", "#f59e0b", "rgba(245, 158, 11, 0.15)", "Terjadi peningkatan aktivitas seismik, vulkanik, atau hembusan asap kawah.", "Masyarakat/wisatawan dilarang mendekati kawah dalam radius 1.5 - 3 km."),
  3: rancangStatusJaga(3, "Siaga", "Watch", "LEVEL III", "#f97316", "rgba(249, 115, 22, 0.15)", "Peningkatan intensif aktivitas vulkanik. Erupsi berpotensi mengancam pemukiman terdekat.", "Zona bahaya steril radius 3 - 5 km. Siapkan masker dan tas siaga bencana."),
  4: rancangStatusJaga(4, "Awas", "Warning", "LEVEL IV", "#ef4444", "rgba(239, 68, 68, 0.15)", "Erupsi eksplosif atau awan panas guguran sedang/segera berlangsung.", "Evakuasi total seluruh warga dalam radius 6 - 8 km. Hindari aliran sungai lahar.")
};

const BARIS_GUNUNG_API = [
  ["merapi", "Gunung Merapi", "D.I. Yogyakarta & Jawa Tengah", "Jawa", -7.5407, 110.4457, 2968, "Stratovolcano", 3, 5, "Aktif (Guguran Lava & Awan Panas)", "Waspadai potensi awan panas guguran ke sektor Barat Daya - Selatan (Kali Bebeng & Krasak)."],
  ["semeru", "Gunung Semeru", "Jawa Timur", "Jawa", -8.108, 112.922, 3676, "Stratovolcano", 3, 5, "Erupsi Berkala (Letusan Abu & Guguran)", "Dilarang beraktivitas di sektor tenggara sepanjang Besuk Kobokan sejauh 13 km dari puncak."],
  ["bromo", "Gunung Bromo", "Jawa Timur", "Jawa", -7.942, 112.953, 2329, "Caldera / Cinder Cone", 2, 1, "Hembusan Kawah Aktif", "Tidak diperbolehkan memasuki kawah dalam radius 1 km dari pusat kawah aktif."],
  ["kelud", "Gunung Kelud", "Jawa Timur", "Jawa", -7.93, 112.308, 1731, "Stratovolcano", 1, 1.5, "2014", "Aktivitas normal. Wisata kubah lava dapat dikunjungi dengan mematuhi batas aman pengelola."],
  ["slamet", "Gunung Slamet", "Jawa Tengah", "Jawa", -7.242, 109.208, 3432, "Stratovolcano", 2, 2, "Hembusan Asap Solfatara", "Hindari aktivitas dalam radius 2 km dari kawah puncak."],
  ["tangkuban-parahu", "Gunung Tangkuban Parahu", "Jawa Barat", "Jawa", -6.77, 107.6, 2084, "Stratovolcano", 1, 0.5, "2019", "Waspadai gas beracun (CO, H2S) saat cuaca mendung/hujan di dasar Kawah Ratu & Upas."],
  ["gede", "Gunung Gede", "Jawa Barat", "Jawa", -6.78, 106.98, 2958, "Stratovolcano", 1, 0.5, "1957", "Status normal. Jalur pendakian diatur berkala oleh Balai Besar TNGGP."],
  ["salak", "Gunung Salak", "Jawa Barat", "Jawa", -6.72, 106.73, 2211, "Stratovolcano", 1, 0.5, "1938", "Waspadai hembusan gas kawah di Kawah Ratu saat mendekati fumarol."],
  ["ciremai", "Gunung Ciremai", "Jawa Barat", "Jawa", -6.89, 108.4, 3078, "Stratovolcano", 1, 0.5, "1951", "Kondisi stabil."],
  ["papandayan", "Gunung Papandayan", "Jawa Barat", "Jawa", -7.32, 107.73, 2665, "Stratovolcano", 1, 0.5, "2002", "Aktivitas kawah fumarol & belerang aktif namun dalam batas normal."],
  ["raung", "Gunung Raung", "Jawa Timur", "Jawa", -8.125, 114.042, 3332, "Stratovolcano", 2, 3, "2022", "Masyarakat dilarang mendekati kawah kaldera dalam radius 3 km."],
  ["ijen", "Gunung Ijen", "Jawa Timur", "Jawa", -8.058, 114.242, 2769, "Stratovolcano / Kawah Asam", 2, 1.5, "2024 (Peningkatan Gas)", "Pengunjung tidak diperbolehkan mendekati dasar kawah atau danau air asam."],
  ["marapi-sumbar", "Gunung Marapi", "Sumatera Barat", "Sumatera", -0.381, 100.473, 2891, "Complex Volcano", 3, 4.5, "Erupsi Eksplosif Abu & Lontaran Batu", "Zona steril 4.5 km dari pusat kawah Verbeek. Waspadai lahar dingin saat hujan di hulu sungai."],
  ["sinabung", "Gunung Sinabung", "Sumatera Utara", "Sumatera", 3.17, 98.392, 2460, "Stratovolcano", 2, 3, "Kubah Lava & Guguran", "Waspadai potensi banjir lahar di sungai yang berhulu di lereng Sinabung."],
  ["anak-krakatau", "Gunung Anak Krakatau", "Lampung (Selat Sunda)", "Sumatera", -6.102, 105.423, 157, "Caldera Island", 3, 5, "Erupsi Strombolian & Lontaran Pijar", "Masyarakat/nelayan dilarang mendekati pulau Anak Krakatau dalam radius 5 km."],
  ["kerinci", "Gunung Kerinci", "Jambi & Sumatera Barat", "Sumatera", -1.697, 101.264, 3805, "Stratovolcano", 2, 3, "Hembusan Asap & Abu", "Hindari radius 3 km dari kawah aktif puncak."],
  ["dempo", "Gunung Dempo", "Sumatera Selatan", "Sumatera", -4.03, 103.13, 3173, "Stratovolcano", 2, 1, "Hembusan Freatik", "Radius 1 km dari kawah aktif dilarang untuk beraktivitas."],
  ["agung", "Gunung Agung", "Bali", "Bali & Nusa Tenggara", -8.343, 115.508, 3142, "Stratovolcano", 1, 1.5, "2019", "Aktivitas normal. Tetap patuhi arahan pemandu saat pendakian."],
  ["batur", "Gunung Batur", "Bali", "Bali & Nusa Tenggara", -8.242, 115.375, 1717, "Caldera Volcano", 1, 1, "2000", "Aman untuk wisata dan pendakian."],
  ["rinjani", "Gunung Rinjani", "Nusa Tenggara Barat", "Bali & Nusa Tenggara", -8.42, 116.47, 3726, "Stratovolcano & Kaldera Segara Anak", 1, 1.5, "2016 (Barujari)", "Aktivitas normal di kawah Gunung Barujari."],
  ["lewotobi", "Gunung Lewotobi Laki-laki", "Nusa Tenggara Timur (Flores Timur)", "Bali & Nusa Tenggara", -8.538, 122.768, 1584, "Stratovolcano", 4, 7, "Erupsi Eksplosif Kolom Abu 5000m+", "STATUS AWAS (LEVEL IV). Zona steril radius 7 km dari pusat kawah. Evakuasi pengungsi ke lokasi aman."],
  ["ile-lewotolok", "Gunung Ile Lewotolok", "Nusa Tenggara Timur (Lembata)", "Bali & Nusa Tenggara", -8.272, 123.505, 1423, "Stratovolcano", 3, 3, "Erupsi Abu & Lontaran Lava Pijar", "Masyarakat dilarang memasuki radius 3 km dari kawah."],
  ["ruang", "Gunung Ruang", "Sulawesi Utara (Kep. Sitaro)", "Sulawesi", 2.298, 125.367, 725, "Stratovolcano Island", 3, 4, "Erupsi Eksplosif Paroksismal 2024", "Zona steril radius 4 km dari kawah puncak. Hindari area pesisir pulau Ruang."],
  ["lokon", "Gunung Lokon", "Sulawesi Utara (Tomohon)", "Sulawesi", 1.358, 124.792, 1580, "Stratovolcano", 2, 1.5, "Hembusan Kawah Tompaluan", "Masyarakat dan wisatawan dilarang mendekati Kawah Tompaluan dalam radius 1.5 km."],
  ["soputan", "Gunung Soputan", "Sulawesi Utara", "Sulawesi", 1.112, 124.737, 1785, "Stratovolcano", 2, 1.5, "2018", "Radius 1.5 km dari kawah steril."],
  ["karangetang", "Gunung Karangetang", "Sulawesi Utara (Kep. Siau)", "Sulawesi", 2.78, 125.4, 1784, "Stratovolcano", 3, 3.5, "Guguran Lava Pijar Berkala", "Waspadai guguran lava ke arah Kali Batuawang & Kahetang."],
  ["ibu", "Gunung Ibu", "Maluku Utara (Halmahera Barat)", "Maluku", 1.488, 127.63, 1325, "Stratovolcano", 3, 4, "Erupsi Harian Kolom Abu 1000 - 3000m", "Dilarang beraktivitas dalam radius 4 km dari kawah aktif dan perluasan sektoral 5 km."],
  ["dukono", "Gunung Dukono", "Maluku Utara (Halmahera Utara)", "Maluku", 1.693, 127.894, 1229, "Complex Volcano", 2, 3, "Erupsi Abu Vulkanik Menerus", "Gunakan masker dan kacamata saat terjadi hujan abu di Tobelo dan sekitarnya."],
  ["gamalama", "Gunung Gamalama", "Maluku Utara (Kota Ternate)", "Maluku", 0.8, 127.33, 1715, "Stratovolcano", 2, 1.5, "Hembusan Asap Kawah", "Radius 1.5 km dari kawah puncak dilarang untuk beraktivitas."]
];

function rakitGunungJaga(baris) {
  const [id, name, province, region, lat, lon, elevation, type, statusLevel, dangerRadiusKm, lastEruption, note] = baris;
  return { id, name, province, region, lat, lon, elevation, type, statusLevel, dangerRadiusKm, lastEruption, note };
}

export const INDONESIA_VOLCANOES = BARIS_GUNUNG_API.map(rakitGunungJaga);

export function slugGunung(gunung) {
  const dasar = gunung?.name || gunung?.id || 'gunung-api';
  return String(dasar).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function cariGunungDariId(idGunung) {
  if (!idGunung) return null;
  return INDONESIA_VOLCANOES.find((gunung) => gunung.id === idGunung) || null;
}

export function cariGunung(kataKunci) {
  const kunci = String(kataKunci || '').toLowerCase().trim();
  if (!kunci) return INDONESIA_VOLCANOES;
  return INDONESIA_VOLCANOES.filter((gunung) => String(gunung.name).toLowerCase().includes(kunci) || String(gunung.province).toLowerCase().includes(kunci));
}

export function zonaGunung(gunung) {
  const level = Number(gunung?.statusLevel) || 1;
  if (level >= 4) return 'evakuasi';
  if (level === 3) return 'siaga';
  if (level === 2) return 'waspada';
  return 'aman';
}

export function statusGunung(gunung) {
  const level = Number(gunung?.statusLevel) || 1;
  return VOLCANO_STATUS_LEVELS[level] || VOLCANO_STATUS_LEVELS[1];
}

export function daftarGunungSiaga() {
  return INDONESIA_VOLCANOES.filter((gunung) => Number(gunung.statusLevel) >= 3);
}

export function filterGunungPerKawasan(namaKawasan) {
  if (!namaKawasan || namaKawasan === 'Semua') return INDONESIA_VOLCANOES;
  return INDONESIA_VOLCANOES.filter((gunung) => gunung.region === namaKawasan);
}

export function ringkasanGunung(daftar = INDONESIA_VOLCANOES) {
  const total = daftar.length;
  const awas = daftar.filter((g) => Number(g.statusLevel) >= 3).length;
  const waspada = daftar.filter((g) => Number(g.statusLevel) === 2).length;
  return { total, awas, waspada, normal: total - awas - waspada };
}

export const gunungSlug = slugGunung;
export const cariGunungApi = cariGunung;
export const zonaVulkan = zonaGunung;
