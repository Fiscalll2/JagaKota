import React, { useEffect, useState } from 'react';
import {
  Siren, Waves, Wind, TreePine, Construction, Lightbulb, Trash2,
  X, ArrowLeft, ArrowRight, MapPin, Crosshair, Loader2, CheckCircle2, Send, Camera,
} from 'lucide-react';
import {
  KATEGORI_LAPOR, BATAS_LAPOR, tambahLaporan, jumlahLaporan, kompresFoto,
} from '../../utils/lapor';

// Langkah 2: formulir 3 langkah (kategori → lokasi → deskripsi + kirim).
// Foto & tampil di peta menyusul langkah berikutnya.
const IKON_KATEGORI = {
  banjir: Waves,
  asap: Wind,
  pohon: TreePine,
  jalan: Construction,
  lampu: Lightbulb,
  sampah: Trash2,
};

const LANGKAH = [
  { id: 1, label: 'Kategori' },
  { id: 2, label: 'Lokasi' },
  { id: 3, label: 'Cerita' },
];

function validKoordinat(lat, lon) {
  // Wajib tolak string kosong/null dulu: Number('') === 0 lolos rentang!
  if (lat === '' || lat == null || lon === '' || lon == null) return false;
  const la = Number(lat);
  const lo = Number(lon);
  return Number.isFinite(la) && Number.isFinite(lo)
    && la >= -11 && la <= 6 && lo >= 95 && lo <= 141;
}

export function LaporModal({ isOpen, onClose, location, onRefreshGps, gpsLoading }) {
  const [langkah, setLangkah] = useState(1);
  const [kategori, setKategori] = useState('');
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [manual, setManual] = useState(false);
  const [deskripsi, setDeskripsi] = useState('');
  const [nama, setNama] = useState('');
  const [galat, setGalat] = useState([]);
  const [terkirim, setTerkirim] = useState(null);
  const [total, setTotal] = useState(0);
  const [foto, setFoto] = useState(null);
  const [fotoStatus, setFotoStatus] = useState('');
  const [catatanFoto, setCatatanFoto] = useState('');
  // Nama kota di-snapshot saat modal dibuka: refresh GPS dari sidebar
  // saat modal terbuka tidak boleh mengubah kota laporan ini.
  const [kotaAwal, setKotaAwal] = useState('');

  // Kunci scroll body selama modal terbuka + cegah rantai scroll ke dashboard.
  // (Komponen di-unmount saat ditutup, jadi efek mount ini pas.)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Reset tiap dibuka; ikuti lokasi aktif kecuali user sudah edit manual.
  useEffect(() => {
    if (!isOpen) return;
    setLangkah(1);
    setKategori('');
    setManual(false);
    setDeskripsi('');
    setNama('');
    setGalat([]);
    setTerkirim(null);
    setFoto(null);
    setFotoStatus('');
    setCatatanFoto('');
    setLat(location?.lat ?? null);
    setLon(location?.lon ?? null);
    setKotaAwal(location?.name || '');
    setTotal(jumlahLaporan());
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen || manual) return;
    if (Number.isFinite(location?.lat) && Number.isFinite(location?.lon)) {
      setLat(location.lat);
      setLon(location.lon);
    }
  }, [isOpen, manual, location?.lat, location?.lon]);

  if (!isOpen) return null;

  const katAktif = KATEGORI_LAPOR.find((k) => k.id === kategori);
  const latNum = Number(lat);
  const lonNum = Number(lon);
  const lokasiOk = validKoordinat(latNum, lonNum);

  const maju = () => {
    setGalat([]);
    if (langkah === 1 && !kategori) {
      setGalat(['Pilih salah satu kategori dulu, Lur.']);
      return;
    }
    if (langkah === 2 && !lokasiOk) {
      setGalat(['Lokasi belum valid. Segarkan GPS atau isi manual (wilayah Indonesia).']);
      return;
    }
    setLangkah((l) => Math.min(3, l + 1));
  };

  const kirim = () => {
    const payload = {
      kategori,
      lat: latNum,
      lon: lonNum,
      kota: kotaAwal,
      deskripsi,
      nama,
      foto,
    };
    let hasil = tambahLaporan(payload);
    // Memori perangkat penuh tapi ada foto: coba lagi tanpa foto.
    // Retry HANYA untuk kasus ini — galat lain (rate-limit, duplikat) tidak boleh bypass.
    if (!hasil.ok && hasil.penyimpananPenuh && foto) {
      const ulang = tambahLaporan({ ...payload, foto: null });
      if (ulang.ok) {
        hasil = ulang;
        setCatatanFoto('Memori perangkat penuh, jadi fotonya tidak ikut tersimpan.');
      }
    }
    if (!hasil.ok) {
      setGalat(hasil.galat);
      return;
    }
    setTerkirim(hasil.laporan);
    setTotal(jumlahLaporan());
    try {
      window.dispatchEvent(new CustomEvent('jagakota:lapor-baru', { detail: { id: hasil.laporan.id } }));
    } catch {}
  };

  const pilihFoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || fotoStatus) return;
    setFotoStatus('Mengompres foto...');
    setGalat([]);
    const hasil = await kompresFoto(file);
    if (!hasil.ok) {
      setFoto(null);
      setFotoStatus('');
      setGalat([hasil.galat]);
      return;
    }
    setFoto(hasil.dataUrl);
    setFotoStatus('');
  };

  const ubahManual = (setter) => (e) => {
    setManual(true);
    const v = e.target.value;
    setter(v === '' ? '' : Number(v));
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Lapor warga"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b-2 border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white">
              <Siren size={20} strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-slate-900 dark:text-white">
                Lapor Warga
              </h3>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {terkirim ? 'Laporanmu tersimpan!' : `Langkah ${langkah} dari 3: ${LANGKAH[langkah - 1].label}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup lapor warga"
            className="grid size-9 shrink-0 place-items-center rounded-xl border-2 border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <X size={17} strokeWidth={2.5} />
          </button>
        </div>

        {!terkirim && (
          <div className="flex gap-1.5 px-5 pt-4">
            {LANGKAH.map((l) => (
              <span
                key={l.id}
                className={
                  l.id < langkah
                    ? 'h-1.5 flex-1 rounded-full bg-emerald-600'
                    : l.id === langkah
                      ? 'h-1.5 flex-1 rounded-full bg-emerald-400'
                      : 'h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-700'
                }
              />
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {galat.length > 0 && (
            <div className="mb-3 rounded-2xl border-2 border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-bold leading-relaxed text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {galat.map((g, i) => <p key={i}>• {g}</p>)}
            </div>
          )}

          {!terkirim && langkah === 1 && (
            <div className="grid grid-cols-2 gap-2">
              {KATEGORI_LAPOR.map((k) => {
                const Ikon = IKON_KATEGORI[k.id] || Siren;
                const aktif = kategori === k.id;
                return (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => { setKategori(k.id); setGalat([]); }}
                    aria-pressed={aktif}
                    className={
                      aktif
                        ? 'flex items-center gap-2.5 rounded-2xl border-2 px-3 py-2.5 text-left border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60'
                        : 'flex items-center gap-2.5 rounded-2xl border-2 px-3 py-2.5 text-left border-slate-100 bg-slate-50 hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-800/50'
                    }
                  >
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-xl text-white"
                      style={{ backgroundColor: k.warna }}
                    >
                      <Ikon size={17} strokeWidth={2.5} />
                    </span>
                    <span className="min-w-0">
                      <strong className="block truncate text-[13px] font-extrabold text-slate-800 dark:text-slate-100">
                        {k.label}
                      </strong>
                      <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {k.contoh}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {!terkirim && langkah === 2 && (
            <div className="grid gap-3">
              <div className="flex items-start gap-2.5 rounded-2xl border-2 border-slate-100 bg-slate-50 px-3.5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                <MapPin size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                <div className="min-w-0 text-[13px] font-bold text-slate-700 dark:text-slate-200">
                  <p className="truncate">{location?.name || 'Lokasi aktif'}{location?.province ? ` • ${location.province}` : ''}</p>
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {lokasiOk ? `${latNum.toFixed(5)}, ${lonNum.toFixed(5)}` : '—'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setManual(false); onRefreshGps?.(); }}
                disabled={gpsLoading}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-600/40 bg-emerald-50 px-3 py-2.5 text-[13px] font-extrabold text-emerald-700 disabled:opacity-60 dark:bg-emerald-950/60 dark:text-emerald-300"
              >
                {gpsLoading
                  ? <Loader2 size={16} className="animate-spin" />
                  : <Crosshair size={16} strokeWidth={2.5} />}
                {gpsLoading ? 'Mencari sinyal GPS...' : 'Pakai lokasi saya (GPS)'}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Lintang (lat)
                  <input
                    type="number" step="any" value={lat ?? ''}
                    onChange={ubahManual(setLat)}
                    placeholder="-6.2"
                    className="mt-1 w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 font-mono text-[13px] text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Bujur (lon)
                  <input
                    type="number" step="any" value={lon ?? ''}
                    onChange={ubahManual(setLon)}
                    placeholder="106.8"
                    className="mt-1 w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 font-mono text-[13px] text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                GPS ditolak / tidak akurat? Isi manual angka di atas (wilayah Indonesia).
              </p>
            </div>
          )}

          {!terkirim && langkah === 3 && (
            <div className="grid gap-3">
              <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 px-3.5 py-3 text-[13px] dark:border-slate-800 dark:bg-slate-800/50">
                <p className="font-extrabold text-slate-800 dark:text-slate-100">
                  {katAktif?.label} • {location?.name || 'Lokasi aktif'}
                </p>
                <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {lokasiOk ? `${latNum.toFixed(5)}, ${lonNum.toFixed(5)}` : '—'}
                </p>
              </div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                Ceritakan kejadiannya (min. 10 karakter)
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  rows={4}
                  maxLength={BATAS_LAPOR.maksDeskripsi}
                  placeholder="Contoh: Air setinggi lutut di gang sempit sejak hujan jam 5 sore..."
                  className="mt-1 w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </label>
              <p className="text-right text-[11px] font-bold text-slate-400">
                {deskripsi.trim().length}/{BATAS_LAPOR.maksDeskripsi}
              </p>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                Nama samaran (opsional)
                <input
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  maxLength={30}
                  placeholder="mis. Warga Tebet"
                  className="mt-1 w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </label>
              <div>
                <span className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Foto bukti (opsional, maks 10 MB)
                </span>
                {foto ? (
                  <div className="relative mt-1">
                    <img
                      src={foto}
                      alt="Pratinjau foto laporan"
                      className="max-h-44 w-full rounded-xl border-2 border-slate-200 object-cover dark:border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setFoto(null)}
                      aria-label="Hapus foto"
                      className="absolute right-2 top-2 grid size-8 place-items-center rounded-xl bg-slate-950/70 text-white"
                    >
                      <X size={15} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-[13px] font-extrabold text-slate-500 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                    {fotoStatus ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} strokeWidth={2.5} />}
                    {fotoStatus || 'Pilih foto dari galeri'}
                    <input type="file" accept="image/*" onChange={pilihFoto} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          )}

          {terkirim && (
            <div className="grid place-items-center gap-2 py-6 text-center">
              <CheckCircle2 size={52} strokeWidth={2.2} className="text-emerald-600" />
              <p className="text-base font-black text-slate-900 dark:text-white">
                Laporanmu tersimpan di perangkat ini!
              </p>
              <p className="max-w-xs text-[13px] font-medium text-slate-500 dark:text-slate-400">
                {katAktif?.label || terkirim.kategori} • {terkirim.kota || 'Lokasi aktif'} •
                total {total} laporan. Lihat pin warna-warni laporanmu di Peta Pantauan.
              </p>
              {catatanFoto && (
                <p className="max-w-xs text-xs font-bold text-amber-600 dark:text-amber-400">
                  {catatanFoto}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t-2 border-slate-100 px-5 py-3 dark:border-slate-800">
          {!terkirim ? (
            <>
              {langkah > 1 && (
                <button
                  type="button"
                  onClick={() => { setGalat([]); setLangkah((l) => l - 1); }}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 px-4 py-2.5 text-[13px] font-extrabold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  <ArrowLeft size={15} strokeWidth={2.5} /> Kembali
                </button>
              )}
              {langkah < 3 ? (
                <button
                  type="button"
                  onClick={maju}
                  className="ml-auto flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-[13px] font-extrabold text-white hover:bg-emerald-700"
                >
                  Lanjut <ArrowRight size={15} strokeWidth={2.5} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={kirim}
                  className="ml-auto flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-[13px] font-extrabold text-white hover:bg-emerald-700"
                >
                  <Send size={15} strokeWidth={2.5} /> Kirim Laporan
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="ml-auto rounded-xl bg-emerald-600 px-5 py-2.5 text-[13px] font-extrabold text-white hover:bg-emerald-700"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LaporModal;
