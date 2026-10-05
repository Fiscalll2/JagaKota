import { jarakKm } from './geo';

export const KUNCI_LAPOR = 'jagakota-lapor-v1';

export const BATAS_LAPOR = {
  jedaMs: 5 * 60 * 1000,
  maksPerHari: 10,
  maksDeskripsi: 280,
  radiusDuplikatM: 100,
  maksFotoBytes: 200 * 1024,
  maksFotoInputBytes: 10 * 1024 * 1024,
};

export const STATUS_LAPOR = {
  pending: { label: 'Menunggu verifikasi', warna: '#b45309', bg: '#fef3c7' },
  verified: { label: 'Terverifikasi', warna: '#059669', bg: '#d1fae5' },
  in_progress: { label: 'Dikerjakan', warna: '#0284c7', bg: '#e0f2fe' },
  resolved: { label: 'Selesai', warna: '#047857', bg: '#d1fae5' },
  rejected: { label: 'Ditolak', warna: '#dc2626', bg: '#fee2e2' },
};

export const STATUS_PUBLIK = ['verified', 'in_progress', 'resolved'];

const TRANSISI_STATUS = {
  pending: ['verified', 'rejected'],
  verified: ['in_progress', 'resolved', 'rejected'],
  in_progress: ['resolved', 'rejected'],
  resolved: [],
  rejected: ['pending'],
};

export const PIN_PETUGAS_DEMO = '1234';

export function cekPinPetugas(pin) {
  return String(pin ?? '').trim() === PIN_PETUGAS_DEMO;
}

export function labelStatus(status) {
  return STATUS_LAPOR[status] || STATUS_LAPOR.pending;
}

export function bisaTransisi(dari, ke) {
  return (TRANSISI_STATUS[dari] || []).includes(ke);
}

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
  const daftar = bacaMentah().filter(entriValid);

  let berubah = false;
  for (const l of daftar) {
    if (!l.kode) {
      l.kode = kodeUnik(daftar);
      berubah = true;
    }
    if (!STATUS_LAPOR[l.status]) {

      const dibuat = l.createdAt;
      l.status = 'verified';
      l.riwayat = [
        { status: 'pending', at: dibuat },
        { status: 'verified', at: dibuat, oleh: 'migrasi' },
      ];
      berubah = true;
    }
    if (!Array.isArray(l.riwayat) || l.riwayat.length === 0) {
      l.riwayat = [{ status: l.status, at: l.createdAt }];
      berubah = true;
    }
    const telp = normalisasiTelepon(l.telepon);
    if ((l.telepon || '') !== telp) {

      l.telepon = telp || String(l.telepon || '').slice(0, 20);
      berubah = true;
    }
  }
  if (berubah) tulisMentah(daftar);
  return daftar;
}

export function seedDemoLokal() {
  try {
    if (localStorage.getItem(KUNCI_LAPOR) != null) return false;
  } catch {
    return false;
  }
  const t0 = '2026-10-04T10:00:00.000Z';
  const t1 = '2026-10-04T12:00:00.000Z';
  const awal = [
    {
      id: 'demo-lokal-1', kode: 'JK-DEMO-L1', kategori: 'banjir',
      lat: -6.2297, lon: 106.8294, kota: 'Jakarta Selatan',
      deskripsi: 'Air setinggi lutut di gang sempit sejak hujan sore',
      nama: 'Warga Tebet', telepon: '', foto: null, dukung: 0,
      status: 'verified',
      riwayat: [{ status: 'pending', at: t0 }, { status: 'verified', at: t1, oleh: 'petugas' }],
      verifiedAt: t1, sumber: 'demo', createdAt: t0, updatedAt: t1, tersinkronPada: null,
    },
    {
      id: 'demo-lokal-2', kode: 'JK-DEMO-L2', kategori: 'jalan',
      lat: 0.5012, lon: 117.1412, kota: 'Samarinda',
      deskripsi: 'Lubang besar di tikungan dekat pasar',
      nama: 'Warga Samarinda', telepon: '', foto: null, dukung: 0,
      status: 'verified',
      riwayat: [{ status: 'pending', at: t0 }, { status: 'verified', at: t1, oleh: 'petugas' }],
      verifiedAt: t1, sumber: 'demo', createdAt: t0, updatedAt: t1, tersinkronPada: null,
    },
    {
      id: 'demo-lokal-3', kode: 'JK-DEMO-L3', kategori: 'sampah',
      lat: -6.9175, lon: 107.6191, kota: 'Bandung',
      deskripsi: 'TPS meluber ke badan jalan sejak kemarin',
      nama: 'Warga Bandung', telepon: '', foto: null, dukung: 0,
      status: 'verified',
      riwayat: [{ status: 'pending', at: t0 }, { status: 'verified', at: t1, oleh: 'petugas' }],
      verifiedAt: t1, sumber: 'demo', createdAt: t0, updatedAt: t1, tersinkronPada: null,
    },
  ];
  return tulisMentah(awal.filter(entriValid));
}

function kodeUnik(daftar) {
  const ada = new Set((daftar || []).map((l) => l.kode).filter(Boolean));
  const tgl = new Date();
  const p = (n) => String(n).padStart(2, '0');
  const cap = `${tgl.getFullYear()}${p(tgl.getMonth() + 1)}${p(tgl.getDate())}`;
  for (let i = 0; i < 30; i++) {
    const acak = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, 'X');
    const kode = `JK-${cap}-${acak}`;
    if (!ada.has(kode)) return kode;
  }
  return `JK-${cap}-${Date.now().toString(36).toUpperCase()}`;
}

function tulisMentah(daftar) {
  try {
    localStorage.setItem(KUNCI_LAPOR, JSON.stringify(daftar));
    return true;
  } catch {
    return false;
  }
}

export function normalisasiTelepon(mentah) {
  const digits = String(mentah ?? '').replace(/\D/g, '');
  if (!digits) return '';
  const intl = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
  return /^628\d{8,12}$/.test(intl) ? intl : '';
}

export function validasiLaporan({ kategori, lat, lon, deskripsi, telepon = '' }) {
  const galat = [];
  if (!kategori || !PETA_KATEGORI_LAPOR[kategori]) galat.push('Pilih kategori laporan dulu.');
  if (!Number.isFinite(lat) || lat < -11 || lat > 6) galat.push('Lintang lokasi tidak valid.');
  if (!Number.isFinite(lon) || lon < 95 || lon > 141) galat.push('Bujur lokasi tidak valid.');
  const bersih = (deskripsi || '').trim();
  if (bersih.length < 10) galat.push('Ceritakan kejadiannya minimal 10 karakter.');
  if (bersih.length > BATAS_LAPOR.maksDeskripsi) galat.push(`Deskripsi maksimal ${BATAS_LAPOR.maksDeskripsi} karakter.`);
  if (!normalisasiTelepon(telepon)) galat.push('Nomor HP/WA tidak valid (contoh: 0812xxxxxxx).');
  return galat;
}

const BATAS_PANJANG_FOTO = Math.ceil(BATAS_LAPOR.maksFotoBytes * 4 / 3) + 100;

const TIPE_FOTO_OK = ['image/jpeg', 'image/png', 'image/webp'];

function tolakHeic(file) {
  if (!file) return false;
  if (file.type === 'image/heic' || file.type === 'image/heif') return true;
  return /\.hei(c|f)$/i.test(file.name || '');
}

function muatBitmap(file) {

  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => createImageBitmap(file));
  }

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

export async function kompresFoto(file) {
  if (!file) return { ok: false, galat: 'Pilih foto dulu.' };
  if (tolakHeic(file)) {
    return { ok: false, galat: 'Foto HEIC iPhone belum didukung. Pilih JPG/PNG, atau screenshot fotonya.' };
  }
  if (!TIPE_FOTO_OK.includes(file.type)) {
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
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function laporanDaftar() {
  return muatLaporan().filter((l) => l.status !== 'rejected');
}

export function laporanPublik() {
  return muatLaporan().filter((l) => STATUS_PUBLIK.includes(l.status));
}

export function antreanPetugas() {
  const skor = (l) => (l.status === 'pending' ? 0 : 1);
  return muatLaporan().sort(
    (a, b) => skor(a) - skor(b) || new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export function ubahStatus(id, ke, { alasan = '', oleh = 'petugas' } = {}) {
  if (!STATUS_LAPOR[ke]) return { ok: false, galat: ['Status tidak dikenal.'] };
  const daftar = daftarValid();
  const lapor = daftar.find((l) => l.id === id);
  if (!lapor) return { ok: false, galat: ['Laporan tidak ditemukan.'] };
  if (!bisaTransisi(lapor.status, ke)) {
    return { ok: false, galat: [`Tidak bisa ${labelStatus(lapor.status).label} → ${labelStatus(ke).label}.`] };
  }
  if (ke === 'rejected' && String(alasan).trim().length < 3) {
    return { ok: false, galat: ['Tolak laporan wajib disertai alasan.'] };
  }
  const sekarang = new Date().toISOString();
  lapor.status = ke;
  lapor.updatedAt = sekarang;
  if (!Array.isArray(lapor.riwayat)) lapor.riwayat = [];
  lapor.riwayat.push({ status: ke, at: sekarang, ...(alasan ? { alasan: String(alasan).trim() } : {}), ...(oleh ? { oleh } : {}) });
  if (ke === 'verified') lapor.verifiedAt = sekarang;
  if (ke === 'resolved') lapor.resolvedAt = sekarang;
  if (ke === 'rejected') {
    lapor.rejectReason = String(alasan).trim();
  } else {
    delete lapor.rejectReason;
  }
  if (!tulisMentah(daftar)) return { ok: false, galat: ['Gagal menyimpan di perangkat ini.'] };
  try {
    window.dispatchEvent(new CustomEvent('jagakota:lapor-status', { detail: { id, status: ke } }));
  } catch {}
  return { ok: true, laporan: lapor };
}

export function laporanBelumSinkron() {
  return daftarValid().filter((l) => {
    if (!l.tersinkronPada) return true;
    return String(l.tersinkronPada) < String(l.updatedAt || l.createdAt || '');
  });
}

export function tandaiTersinkron(id, ekstra = {}) {
  const daftar = daftarValid();
  const lapor = daftar.find((l) => l.id === id);
  if (!lapor) return false;
  lapor.tersinkronPada = new Date().toISOString();
  if (ekstra && typeof ekstra === 'object') {
    for (const [k, v] of Object.entries(ekstra)) {
      if (v !== undefined) lapor[k] = v;
    }
  }
  return tulisMentah(daftar);
}

export function gabungCloud(baris) {
  if (!Array.isArray(baris) || baris.length === 0) return { tambah: 0, perbarui: 0 };
  const daftar = daftarValid();
  const peta = new Map(daftar.map((l) => [l.kode, l]));
  let tambah = 0;
  let perbarui = 0;
  for (const r of baris) {
    if (!r || typeof r.kode !== 'string' || !PETA_KATEGORI_LAPOR[r.kategori]) continue;
    if (sudahDihapus(r.kode)) continue;
    const lat = Number(r.lat);
    const lon = Number(r.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const dibuat = typeof r.created_at === 'string' ? r.created_at : new Date().toISOString();
    if (!Number.isFinite(new Date(dibuat).getTime())) continue;
    const ada = peta.get(r.kode);
    const fotoHttp = typeof r.foto_url === 'string' && r.foto_url.startsWith('https://') ? r.foto_url : null;
    if (!ada) {
      daftar.push({
        id: `cloud-${r.kode}`,
        kode: r.kode,
        kategori: r.kategori,
        lat,
        lon,
        kota: String(r.kota || '').slice(0, 80),
        deskripsi: String(r.deskripsi || '').slice(0, BATAS_LAPOR.maksDeskripsi),
        nama: String(r.nama || '').slice(0, 40),
        telepon: normalisasiTelepon(r.telepon),
        foto: fotoHttp,
        dukung: Number(r.dukung) || 0,
        flag: 0,
        status: STATUS_LAPOR[r.status] ? r.status : 'verified',
        riwayat: Array.isArray(r.riwayat) && r.riwayat.length ? r.riwayat : [{ status: 'verified', at: dibuat }],
        verified_at: r.verified_at || null,
        resolved_at: r.resolved_at || null,
        reject_reason: r.reject_reason || undefined,
        sumber: 'cloud',
        createdAt: dibuat,
        updatedAt: r.updated_at || dibuat,
        tersinkronPada: new Date().toISOString(),
      });
      tambah++;
      continue;
    }
    const remoteBaru = typeof r.updated_at === 'string' && r.updated_at > String(ada.updatedAt || ada.createdAt || '');
    if (remoteBaru) {
      if (STATUS_LAPOR[r.status]) ada.status = r.status;
      if (Array.isArray(r.riwayat) && r.riwayat.length) ada.riwayat = r.riwayat;
      if (Number.isFinite(Number(r.dukung))) ada.dukung = Number(r.dukung);
      const telpBaru = normalisasiTelepon(r.telepon);
      if (telpBaru) ada.telepon = telpBaru;
      ada.verified_at = r.verified_at || ada.verified_at || null;
      ada.resolved_at = r.resolved_at || ada.resolved_at || null;
      if (r.reject_reason) ada.reject_reason = r.reject_reason;
      else delete ada.reject_reason;

      if (!(typeof ada.foto === 'string' && ada.foto.startsWith('data:')) && fotoHttp) ada.foto = fotoHttp;
      ada.updatedAt = r.updated_at;
      ada.tersinkronPada = new Date().toISOString();
      perbarui++;
    }
  }
  if (tambah + perbarui > 0) tulisMentah(daftar);
  return { tambah, perbarui };
}

export function tambahLaporan({ kategori, lat, lon, kota = '', deskripsi = '', nama = '', telepon = '', foto = null }) {
  const galat = validasiLaporan({ kategori, lat, lon, deskripsi, telepon });
  if (galat.length) return { ok: false, galat };
  if (foto != null && (typeof foto !== 'string' || !foto.startsWith('data:image/') || foto.length > BATAS_PANJANG_FOTO)) {
    return { ok: false, galat: ['Foto tidak valid. Pilih ulang foto lain.'] };
  }

  const daftar = daftarValid();
  const sekarang = Date.now();

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
    return { ok: false, galat: ['Sudah ada laporan sejenis di dekat sini (< 1 jam). Lihat/ikuti laporan itu di daftar atau peta.'] };
  }

  const laporan = {
    id: buatId(),
    kode: kodeUnik(daftar),
    kategori,
    lat,
    lon,
    kota: (kota || '').trim().slice(0, 80),
    deskripsi: deskripsi.trim(),
    nama: (nama || '').trim().slice(0, 40),
    telepon: normalisasiTelepon(telepon),
    foto,
    dukung: 0,
    status: 'pending',
    riwayat: [{ status: 'pending', at: new Date(sekarang).toISOString() }],
    sumber: 'warga',
    createdAt: new Date(sekarang).toISOString(),
    updatedAt: new Date(sekarang).toISOString(),
    tersinkronPada: null,
  };
  daftar.push(laporan);
  if (!tulisMentah(daftar)) return { ok: false, galat: ['Gagal menyimpan di perangkat ini.'], penyimpananPenuh: true };
  return { ok: true, laporan };
}

export function hapusLaporan(id) {
  const daftar = daftarValid();
  const korban = daftar.find((l) => l.id === id);
  const sisa = daftar.filter((l) => l.id !== id);
  if (!tulisMentah(sisa)) return false;

  if (korban?.kode) tandaiHapus(korban.kode, false);
  try {
    window.dispatchEvent(new CustomEvent('jagakota:lapor-status', { detail: { id, hapus: true } }));
  } catch {}
  return true;
}

const KUNCI_HAPUS = 'jagakota-lapor-hapus-v1';

function bacaHapus() {
  try {
    const data = JSON.parse(localStorage.getItem(KUNCI_HAPUS));
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

function tulisHapus(nisan) {
  try {

    const kunci = Object.keys(nisan);
    if (kunci.length > 200) {
      kunci
        .sort((a, b) => String(nisan[a]?.tgl || '') < String(nisan[b]?.tgl || '') ? -1 : 1)
        .slice(0, kunci.length - 200)
        .forEach((k) => { delete nisan[k]; });
    }
    localStorage.setItem(KUNCI_HAPUS, JSON.stringify(nisan));
    return true;
  } catch {
    return false;
  }
}

export function tandaiHapus(kode, cloud = false) {
  if (!kode) return false;
  const nisan = bacaHapus();
  nisan[String(kode)] = { tgl: new Date().toISOString(), cloud: !!cloud };
  return tulisHapus(nisan);
}

export function sudahDihapus(kode) {
  if (!kode) return false;
  return Boolean(bacaHapus()[String(kode)]);
}

export function terapkanHapusRemote(kodes) {
  if (!Array.isArray(kodes) || kodes.length === 0) return false;
  const target = new Set(kodes.map((k) => String(k)));
  const daftar = daftarValid();
  const sisa = daftar.filter((l) => !target.has(String(l.kode || '')));
  if (sisa.length === daftar.length) return false;
  return tulisMentah(sisa);
}

export function konfirmasiHapusCloud(kode) {
  if (!kode) return false;
  const nisan = bacaHapus();
  if (!nisan[String(kode)]) return false;
  nisan[String(kode)] = { tgl: nisan[String(kode)].tgl, cloud: true };
  return tulisHapus(nisan);
}

export function hapusanTertunda() {
  const nisan = bacaHapus();
  return Object.entries(nisan)
    .filter(([, v]) => v && v.cloud !== true)
    .map(([kode]) => kode);
}

export function jumlahLaporan() {
  return laporanPublik().length;
}

export function cariLaporan(id) {
  if (!id) return null;
  return muatLaporan().find((l) => l.id === id) || null;
}

export function cariLaporanKode(kode) {
  if (!kode) return null;
  const k = String(kode).trim().toUpperCase();
  return muatLaporan().find((l) => String(l.kode || '').toUpperCase() === k) || null;
}

export function escapeHtml(teks) {
  return String(teks ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
