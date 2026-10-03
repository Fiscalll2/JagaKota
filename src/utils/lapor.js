// JagaKota — fondasi data "Lapor Warga" (langkah 1).
// Penyimpanan lokal-first (localStorage). Skema backend-ready: field yang sama
// bisa langsung di-POST ke /api/lapor nanti tanpa mengubah UI.
// Foto & seed demo menyusul di langkah berikutnya (sengaja belum ada).
import { jarakKm } from './geo';

export const KUNCI_LAPOR = 'jagakota-lapor-v1';

// Batas anti-spam sisi klien (longgar, cukup untuk demo).
export const BATAS_LAPOR = {
  jedaMs: 5 * 60 * 1000, // 1 laporan per 5 menit
  maksPerHari: 10,
  maksDeskripsi: 280,
  radiusDuplikatM: 100, // kategori sama dalam radius ini < 1 jam = duplikat
  maksFotoBytes: 200 * 1024, // dataURL JPEG hasil kompres
  maksFotoInputBytes: 10 * 1024 * 1024,
  ambangFlagSembunyi: 3, // laporan disembunyikan saat flag mencapai ini
};

// Jejak voting per browser (satu suara per laporan).
const KUNCI_DUKUNG = 'jagakota-lapor-dukung-v1';
const KUNCI_FLAG = 'jagakota-lapor-flag-v1';

function bacaIdSet(kunci) {
  try {
    const data = JSON.parse(localStorage.getItem(kunci));
    if (data == null) return new Set();
    if (!Array.isArray(data)) throw new Error('format voter rusak');
    return new Set(data);
  } catch {
    try {
      localStorage.removeItem(kunci); // korup → reset sekali, izinkan lagi
      return new Set();
    } catch {
      return null; // storage mati total → fail closed oleh pemanggil
    }
  }
}

function tulisIdSet(kunci, set) {
  try {
    localStorage.setItem(kunci, JSON.stringify([...set]));
    return true;
  } catch {
    return false;
  }
}

export function sudahDukung(id) {
  return bacaIdSet(KUNCI_DUKUNG)?.has(id) ?? true;
}

export function sudahFlag(id) {
  return bacaIdSet(KUNCI_FLAG)?.has(id) ?? true;
}

// +1 dukungan. Satu browser satu suara. Tanpa login — cukup untuk demo,
// produksi wajib pindah ke voter-ID + rate-limit sisi server.
export function dukungLaporan(id) {
  const daftar = daftarValid();
  const lapor = daftar.find((l) => l.id === id);
  if (!lapor) return { ok: false, galat: ['Laporan tidak ditemukan.'] };
  const voted = bacaIdSet(KUNCI_DUKUNG);
  if (voted == null) return { ok: false, galat: ['Gagal menyimpan di perangkat ini.'] };
  if (voted.has(id)) return { ok: false, galat: ['Sudah kamu dukung.'] };
  voted.add(id);
  if (!tulisIdSet(KUNCI_DUKUNG, voted)) {
    return { ok: false, galat: ['Gagal menyimpan di perangkat ini.'] };
  }
  lapor.dukung = (lapor.dukung || 0) + 1;
  if (!tulisMentah(daftar)) {
    voted.delete(id); // rollback suara agar tidak +1 diam-diam
    try { tulisIdSet(KUNCI_DUKUNG, voted); } catch {}
    return { ok: false, galat: ['Gagal menyimpan di perangkat ini.'] };
  }
  return { ok: true, dukung: lapor.dukung };
}

// +1 flag hoaks. Satu browser satu flag; tembus ambang = sembunyi lokal.
export function flagLaporan(id) {
  const daftar = daftarValid();
  const lapor = daftar.find((l) => l.id === id);
  if (!lapor) return { ok: false, galat: ['Laporan tidak ditemukan.'] };
  const flagged = bacaIdSet(KUNCI_FLAG);
  if (flagged == null) return { ok: false, galat: ['Gagal menyimpan di perangkat ini.'] };
  if (flagged.has(id)) return { ok: false, galat: ['Sudah kamu laporkan.'] };
  flagged.add(id);
  if (!tulisIdSet(KUNCI_FLAG, flagged)) {
    return { ok: false, galat: ['Gagal menyimpan di perangkat ini.'] };
  }
  lapor.flag = (lapor.flag || 0) + 1;
  if (!tulisMentah(daftar)) {
    flagged.delete(id); // rollback agar tidak hilang diam-diam
    try { tulisIdSet(KUNCI_FLAG, flagged); } catch {}
    return { ok: false, galat: ['Gagal menyimpan di perangkat ini.'] };
  }
  const sembunyi = lapor.flag >= BATAS_LAPOR.ambangFlagSembunyi;
  return { ok: true, flag: lapor.flag, sembunyi };
}

// 6 kategori laporan. `warna` dipakai pin peta; ikon dipetakan di LaporModal
// (lucide-react) agar utils ini tetap bebas-UI.
export const KATEGORI_LAPOR = [
  { id: 'banjir', label: 'Banjir / Genangan', warna: '#0284c7', contoh: 'Air setinggi lutut di Jl. Merdeka' },
  { id: 'asap', label: 'Asap / Kabut / Bau', warna: '#6b7280', contoh: 'Bau asap menyengat sejak subuh' },
  { id: 'pohon', label: 'Pohon Tumbang', warna: '#15803d', contoh: 'Pohon menutup separuh jalan' },
  { id: 'jalan', label: 'Jalan Rusak / Lubang', warna: '#ea580c', contoh: 'Lubang besar di tikungan' },
  { id: 'lampu', label: 'Lampu Mati / Faskes Rusak', warna: '#ca8a04', contoh: 'Gang gelap total 2 malam' },
  { id: 'sampah', label: 'Sampah Menumpuk', warna: '#92400e', contoh: 'TPS meluber ke jalan' },
];

export const PETA_KATEGORI_LAPOR = Object.fromEntries(KATEGORI_LAPOR.map((k) => [k.id, k]));

function buatId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return `lapor-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function bacaMentah() {
  try {
    const mentah = localStorage.getItem(KUNCI_LAPOR);
    if (!mentah) return [];
    const data = JSON.parse(mentah);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function entriValid(l) {
  return l && l.id && PETA_KATEGORI_LAPOR[l.kategori]
    && Number.isFinite(new Date(l.createdAt).getTime())
    && Number.isFinite(Number(l.lat)) && Number.isFinite(Number(l.lon))
    && Number(l.lat) >= -11 && Number(l.lat) <= 6
    && Number(l.lon) >= 95 && Number(l.lon) <= 141;
}

function daftarValid() {
  return bacaMentah().filter(entriValid);
}

function tulisMentah(daftar) {
  try {
    localStorage.setItem(KUNCI_LAPOR, JSON.stringify(daftar));
    return true;
  } catch {
    return false;
  }
}

// Validasi satu laporan. Kembalikan array pesan galat (kosong = valid).
export function validasiLaporan({ kategori, lat, lon, deskripsi }) {
  const galat = [];
  if (!kategori || !PETA_KATEGORI_LAPOR[kategori]) galat.push('Pilih kategori laporan dulu.');
  if (!Number.isFinite(lat) || lat < -11 || lat > 6) galat.push('Lintang lokasi tidak valid.');
  if (!Number.isFinite(lon) || lon < 95 || lon > 141) galat.push('Bujur lokasi tidak valid.');
  const bersih = (deskripsi || '').trim();
  if (bersih.length < 10) galat.push('Ceritakan kejadiannya minimal 10 karakter.');
  if (bersih.length > BATAS_LAPOR.maksDeskripsi) galat.push(`Deskripsi maksimal ${BATAS_LAPOR.maksDeskripsi} karakter.`);
  return galat;
}

// Overhead base64 (+33%) + prefix dataURL: batas string = bytes * 4/3 + margin.
const BATAS_PANJANG_FOTO = Math.ceil(BATAS_LAPOR.maksFotoBytes * 4 / 3) + 100;

// Tipe yang aman digambar ke canvas (tolak SVG: bisa menyimpan markup asing).
const TIPE_FOTO_OK = ['image/jpeg', 'image/png', 'image/webp'];

function muatBitmap(file) {
  if (typeof createImageBitmap === 'function') return createImageBitmap(file);
  // Fallback browser lama: Image + object URL.
  return new Promise((resolve, tolak) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      tolak(new Error('gagal'));
    };
    img.src = url;
  });
}

// Kompres foto sisi klien jadi dataURL JPEG kecil (cocok untuk localStorage).
// Kembalikan { ok, dataUrl } atau { ok: false, galat }.
export async function kompresFoto(file) {
  if (!file || !TIPE_FOTO_OK.includes(file.type)) {
    return { ok: false, galat: 'Foto harus JPG, PNG, atau WebP.' };
  }
  if (file.size > BATAS_LAPOR.maksFotoInputBytes) {
    return { ok: false, galat: 'Foto maksimal 10 MB.' };
  }
  try {
    const bitmap = await muatBitmap(file);
    const asliW = bitmap.width || 800;
    const asliH = bitmap.height || 600;
    try {
      // Turunkan dimensi bertahap sampai cukup kecil.
      for (const sisiMax of [800, 600, 480]) {
        const potong = Math.min(1, sisiMax / Math.max(asliW, asliH));
        const kanvas = document.createElement('canvas');
        kanvas.width = Math.max(1, Math.round(asliW * potong));
        kanvas.height = Math.max(1, Math.round(asliH * potong));
        kanvas.getContext('2d').drawImage(bitmap, 0, 0, kanvas.width, kanvas.height);
        for (const kualitas of [0.72, 0.55, 0.4, 0.28]) {
          const url = kanvas.toDataURL('image/jpeg', kualitas);
          if (url.length <= BATAS_PANJANG_FOTO) return { ok: true, dataUrl: url };
        }
      }
    } finally {
      if (bitmap.close) bitmap.close();
    }
    return { ok: false, galat: 'Foto tidak bisa dikecilkan di bawah 200 KB.' };
  } catch {
    return { ok: false, galat: 'Gagal membaca foto di perangkat ini.' };
  }
}

export function muatLaporan() {
  return daftarValid()
    .filter((l) => (l.flag || 0) < BATAS_LAPOR.ambangFlagSembunyi)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function tambahLaporan({ kategori, lat, lon, kota = '', deskripsi = '', nama = '', foto = null }) {
  const galat = validasiLaporan({ kategori, lat, lon, deskripsi });
  if (galat.length) return { ok: false, galat };
  if (foto != null && (typeof foto !== 'string' || !foto.startsWith('data:image/') || foto.length > BATAS_PANJANG_FOTO)) {
    return { ok: false, galat: ['Foto tidak valid. Pilih ulang foto lain.'] };
  }

  const daftar = daftarValid();
  const sekarang = Date.now();

  // Rate-limit sederhana: jeda antar laporan + kuota harian per browser.
  const terakhir = daftar
    .map((l) => new Date(l.createdAt).getTime())
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => b - a)[0];
  if (terakhir && sekarang - terakhir < BATAS_LAPOR.jedaMs) {
    const sisa = Math.ceil((BATAS_LAPOR.jedaMs - (sekarang - terakhir)) / 60000);
    return { ok: false, galat: [`Santai dulu, Lur. Kirim lagi ~${sisa} menit.`] };
  }
  const awalHari = new Date();
  awalHari.setHours(0, 0, 0, 0);
  if (daftar.filter((l) => new Date(l.createdAt) >= awalHari).length >= BATAS_LAPOR.maksPerHari) {
    return { ok: false, galat: ['Kuota harian (10 laporan) habis. Lanjut besok ya.'] };
  }

  // Tolak duplikat: kategori sama dalam radius 100 m < 1 jam.
  const sejam = 60 * 60 * 1000;
  const mirip = daftar.find((l) => {
    if (l.kategori !== kategori) return false;
    if (sekarang - new Date(l.createdAt).getTime() > sejam) return false;
    try {
      return jarakKm(lat, lon, l.lat, l.lon) * 1000 <= BATAS_LAPOR.radiusDuplikatM;
    } catch {
      return false;
    }
  });
  if (mirip) {
    return { ok: false, galat: ['Sudah ada laporan sejenis di dekat sini (< 1 jam). Dukung laporan itu saja — fitur dukung menyusul.'] };
  }

  const laporan = {
    id: buatId(),
    kategori,
    lat,
    lon,
    kota: (kota || '').trim(),
    deskripsi: deskripsi.trim(),
    nama: (nama || '').trim(),
    foto, // dataURL JPEG kecil atau null
    dukung: 0, // langkah berikutnya (upvote)
    status: 'warga', // 'warga' = belum verifikasi; permanen sampai ada moderasi
    sumber: 'warga',
    createdAt: new Date(sekarang).toISOString(),
  };
  daftar.push(laporan);
  if (!tulisMentah(daftar)) return { ok: false, galat: ['Gagal menyimpan di perangkat ini.'], penyimpananPenuh: true };
  return { ok: true, laporan };
}

export function hapusLaporan(id) {
  const sisa = bacaMentah().filter((l) => l.id !== id);
  return tulisMentah(sisa);
}

export function jumlahLaporan() {
  return muatLaporan().length; // samakan dengan hitungan pil peta (yang tersembunyi flag tidak dihitung)
}

// Cari satu laporan tampil (yang disembunyikan flag = tidak ketemu).
export function cariLaporan(id) {
  if (!id) return null;
  return muatLaporan().find((l) => l.id === id) || null;
}

// Escape untuk sisipan HTML string (popup Leaflet programatik).
export function escapeHtml(teks) {
  return String(teks ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Waktu relatif kasual versi warga: "baru saja", "5 mnt lalu", "2 jam lalu".
export function waktuRelatif(iso) {
  const lalu = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(lalu) || lalu < 0) return 'baru saja';
  const menit = Math.floor(lalu / 60000);
  if (menit < 1) return 'baru saja';
  if (menit < 60) return `${menit} mnt lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 7) return `${hari} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}
