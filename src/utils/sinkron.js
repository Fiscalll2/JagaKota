import { laporanBelumSinkron, tandaiTersinkron, gabungCloud, normalisasiTelepon, hapusanTertunda, konfirmasiHapusCloud } from './lapor';
import { dapatKlien } from '../lib/supabase';

const TABEL = 'reports';
const VIEW_PUBLIK = 'reports_publik';
const VIEW_ANTREAN = 'reports_antrean';
const BUCKET = 'report-photos';
const BATAS_DORONG = 20;

function peringat(...args) {
  try {
    console.warn('[sinkron]', ...args);
  } catch {}
}

async function dataUrlKeBlob(dataUrl) {
  const res = await fetch(dataUrl);
  return res.blob();
}

async function siapkanFotoUrl(client, lokal) {
  if (typeof lokal.fotoTerkirim === 'string' && lokal.fotoTerkirim.startsWith('https://')) {
    return lokal.fotoTerkirim;
  }
  try {
    const f = lokal.foto;
    if (typeof f === 'string' && f.startsWith('https://')) return f;
    if (typeof f !== 'string' || !f.startsWith('data:image/')) return null;
    const blob = await dataUrlKeBlob(f);
    const path = `reports/${lokal.kode}/${Date.now()}.jpg`;
    const { error } = await client.storage.from(BUCKET).upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    });
    if (error) {
      peringat('unggah foto gagal:', error.message);
      return null;
    }
    const { data } = client.storage.from(BUCKET).getPublicUrl(path);
    return data?.publicUrl || null;
  } catch (e) {
    peringat('unggah foto gagal:', e?.message || e);
    return null;
  }
}

async function dorongSatu(client, lokal) {
  const foto_url = await siapkanFotoUrl(client, lokal);
  const sekarang = new Date().toISOString();
  const baris = {
    kode: lokal.kode,
    kategori: lokal.kategori,
    lat: Number(lokal.lat),
    lon: Number(lokal.lon),
    kota: String(lokal.kota || ''),
    deskripsi: String(lokal.deskripsi || ''),
    nama: String(lokal.nama || ''),
    telepon: normalisasiTelepon(lokal.telepon),
    foto_url,

    status: lokal.status,
    riwayat: Array.isArray(lokal.riwayat) ? lokal.riwayat : [],
    verified_at: lokal.verifiedAt || lokal.verified_at || null,
    resolved_at: lokal.resolvedAt || lokal.resolved_at || null,
    reject_reason: lokal.rejectReason || lokal.reject_reason || null,
    updated_at: sekarang,
  };

  let statusRemote = null;
  try {
    const cek = await client.from(VIEW_PUBLIK).select('status').eq('kode', baris.kode).maybeSingle();
    if (cek.data && typeof cek.data.status === 'string') statusRemote = cek.data.status;
  } catch {}
  if (!statusRemote) {
    const { error: e1 } = await client.from(TABEL).insert({
      ...baris,
      status: 'pending',
      riwayat: [{ status: 'pending', at: lokal.createdAt }],
    });

    if (e1 && e1.code !== '23505') {
      peringat('sisip pending gagal:', e1.message);
      return { ok: false };
    }
    statusRemote = 'pending';
  }

  if (baris.status !== 'pending' && statusRemote !== baris.status) {
    const { error: e2 } = await client.rpc('moderasi_laporan', {
      p_kode: baris.kode,
      p_status: baris.status,
      p_alasan: baris.reject_reason,
    });
    if (e2) {
      peringat('rpc moderasi gagal:', e2.message);
      return { ok: false };
    }
  } else if (statusRemote !== 'pending' && statusRemote === baris.status) {

    try {
      const patch = { updated_at: sekarang };
      if (baris.foto_url) patch.foto_url = baris.foto_url;
      await client.from(TABEL).update(patch).eq('kode', baris.kode);
    } catch (e) {
      peringat('sinkron field gagal:', e?.message || e);
    }
  }
  return { ok: true, fotoUrl: foto_url };
}

async function tarikMasuk(client) {
  const kosong = { tambah: 0, perbarui: 0 };
  try {
    const hasil = { tambah: 0, perbarui: 0 };
    const { data, error } = await client
      .from(VIEW_PUBLIK)
      .select('kode,kategori,lat,lon,kota,deskripsi,nama,foto_url,status,riwayat,verified_at,resolved_at,reject_reason,updated_at,created_at')
      .in('status', ['verified', 'in_progress', 'resolved'])
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) {
      peringat('tarik gagal:', error.message);
      return kosong;
    }
    const g1 = gabungCloud(data || []);
    hasil.tambah += g1.tambah;
    hasil.perbarui += g1.perbarui;
    try {
      const a = await client
        .from(VIEW_ANTREAN)
        .select('kode,kategori,lat,lon,kota,deskripsi,nama,telepon,foto_url,status,riwayat,verified_at,resolved_at,reject_reason,updated_at,created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!a.error && a.data) {
        const g2 = gabungCloud(a.data);
        hasil.tambah += g2.tambah;
        hasil.perbarui += g2.perbarui;
      } else if (a.error) {
        peringat('tarik antrean gagal:', a.error.message);
      }
    } catch (e) {
      peringat('tarik antrean gagal:', e?.message || e);
    }
    return hasil;
  } catch (e) {
    peringat('tarik gagal:', e?.message || e);
    return kosong;
  }
}

const statusTerakhir = {
  kapan: null,
  ok: null,
  tarikTambah: 0,
  dorong: 0,
  hapus: 0,
};

export function statusSinkron() {
  return { ...statusTerakhir };
}

function catatStatus(ringkas) {
  statusTerakhir.kapan = new Date().toISOString();
  statusTerakhir.ok = !!ringkas?.ok;
  statusTerakhir.tarikTambah = ringkas?.tarik?.tambah || 0;
  statusTerakhir.dorong = ringkas?.dorong || 0;
  statusTerakhir.hapus = ringkas?.hapus || 0;
}

const gagalBeruntun = new Map();
const MAKS_GAGAL = 3;

async function hapusCloud(client, kode) {
  try {
    const { error } = await client.rpc('hapus_laporan', { p_kode: kode });
    if (error) {
      peringat('rpc hapus gagal:', error.message);
      return { ok: false };
    }
    konfirmasiHapusCloud(kode);
    return { ok: true };
  } catch (e) {
    peringat('rpc hapus gagal:', e?.message || e);
    return { ok: false };
  }
}

function segarkanUI() {
  try {
    window.dispatchEvent(new CustomEvent('jagakota:lapor-status', { detail: { sinkron: true } }));
  } catch {}
}

export async function sinkronAwal() {
  const r = await sinkronCloud();
  try {
    const { laporanBelumSinkron, hapusanTertunda } = await import('./lapor');
    if (laporanBelumSinkron().length + hapusanTertunda().length > 0) {
      setTimeout(() => { sinkronCloud().catch(() => {}); }, 10000);
    }
  } catch {}
  return r;
}

export function mulaiPolling(ms = 20000) {
  try {
    if (mulaiPolling._id) return;
    mulaiPolling._id = setInterval(() => {
      sinkronCloud()
        .then((r) => {
          if (r && (r.dorong > 0 || (r.hapus || 0) > 0)) kabariBerubah({ hapus: r.dihapusBaru });
        })
        .catch(() => {});
    }, ms);
  } catch {}
}

export function hentikanPolling() {
  try {
    if (mulaiPolling._id) {
      clearInterval(mulaiPolling._id);
      mulaiPolling._id = null;
    }
  } catch {}
}

let _saluran = null;

export async function mulaiRealtime() {
  try {
    const client = await dapatKlien();
    if (!client || _saluran) return !!_saluran;
    _saluran = client.channel('lapor');
    _saluran.on('broadcast', { event: 'berubah' }, (pesan) => {

      try {
        const daftar = pesan?.payload?.hapus;
        if (Array.isArray(daftar) && daftar.length > 0) {
          import('./lapor').then(({ terapkanHapusRemote }) => {
            if (terapkanHapusRemote(daftar)) {
              try {
                window.dispatchEvent(new CustomEvent('jagakota:lapor-status', { detail: { sinkron: true } }));
              } catch {}
            }
          }).catch(() => {});
        }
      } catch {}
      tarikSaja().catch(() => {});
    });
    await _saluran.subscribe();
    return true;
  } catch {
    return false;
  }
}

export async function kabariBerubah(ekstra = {}) {
  try {
    const client = await dapatKlien();
    if (!client) return;
    if (!_saluran) {
      const ok = await mulaiRealtime();
      if (!ok) return;
    }
    const payload = { at: Date.now() };
    if (Array.isArray(ekstra.hapus) && ekstra.hapus.length > 0) {
      payload.hapus = ekstra.hapus.slice(0, 20);
    }
    await _saluran.send({ type: 'broadcast', event: 'berubah', payload });
  } catch {}
}

let _jalan = null;
function eksklusif(kerja) {
  if (_jalan) return _jalan;
  _jalan = Promise.resolve()
    .then(kerja)
    .finally(() => {
      _jalan = null;
    });
  return _jalan;
}

export function sinkronCloud() {
  return eksklusif(putaran);
}

async function putaran() {
  const ringkas = { ok: false, tarik: { tambah: 0, perbarui: 0 }, dorong: 0, hapus: 0, dihapusBaru: [] };
  try {
    const client = await dapatKlien();
    if (!client) {
      catatStatus(ringkas);
      return ringkas;
    }
    ringkas.tarik = await tarikMasuk(client);
    const antre = laporanBelumSinkron().slice(0, BATAS_DORONG);
    let okCount = 0;
    for (const lokal of antre) {
      if ((gagalBeruntun.get(lokal.kode) || 0) >= MAKS_GAGAL) continue;
      const hasil = await dorongSatu(client, lokal);
      if (!hasil.ok) {
        gagalBeruntun.set(lokal.kode, (gagalBeruntun.get(lokal.kode) || 0) + 1);
        continue;
      }
      gagalBeruntun.delete(lokal.kode);
      const ekstra = {};
      if (typeof hasil.fotoUrl === 'string' && hasil.fotoUrl.startsWith('https://')) {
        ekstra.fotoTerkirim = hasil.fotoUrl;

        if (typeof lokal.foto === 'string' && lokal.foto.startsWith('data:')) {
          ekstra.foto = hasil.fotoUrl;
        }
      }
      if (tandaiTersinkron(lokal.id, ekstra)) okCount++;
    }

    let hapusCount = 0;
    const dihapusBaru = [];
    for (const kode of hapusanTertunda().slice(0, 5)) {
      const kunciGagal = `hapus:${kode}`;
      if ((gagalBeruntun.get(kunciGagal) || 0) >= MAKS_GAGAL) continue;
      const hasil = await hapusCloud(client, kode);
      if (hasil.ok) {
        gagalBeruntun.delete(kunciGagal);
        hapusCount++;
        dihapusBaru.push(kode);
      } else {
        gagalBeruntun.set(kunciGagal, (gagalBeruntun.get(kunciGagal) || 0) + 1);
      }
    }
    ringkas.dorong = okCount;
    ringkas.hapus = hapusCount;
    ringkas.dihapusBaru = dihapusBaru;
    ringkas.ok = true;
    if (ringkas.tarik.tambah + ringkas.tarik.perbarui + okCount + hapusCount > 0) segarkanUI();
  } catch (e) {
    peringat('putaran gagal:', e?.message || e);
  }
  catatStatus(ringkas);
  return ringkas;
}

export function tarikSaja() {
  return eksklusif(async () => {
    try {
      const client = await dapatKlien();
      if (!client) return { tambah: 0, perbarui: 0 };
      const g = await tarikMasuk(client);
      if (g.tambah + g.perbarui > 0) segarkanUI();
      return g;
    } catch (e) {
      peringat('tarik saja gagal:', e?.message || e);
      return { tambah: 0, perbarui: 0 };
    }
  });
}

export function jumlahMacet() {
  let n = 0;
  try {
    for (const [k, v] of gagalBeruntun) {
      if (v >= MAKS_GAGAL && !String(k).startsWith('hapus:')) n++;
    }
  } catch {}
  return n;
}
