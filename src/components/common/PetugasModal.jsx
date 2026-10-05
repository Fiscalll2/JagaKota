import React, { useEffect, useRef, useState } from 'react';
import {
  ShieldCheck, X, MapPin, Check, ArrowLeft, Lock, ImageOff, Phone, MessageCircle,
} from 'lucide-react';
import {
  KATEGORI_LAPOR, PETA_KATEGORI_LAPOR, antreanPetugas, hapusLaporan,
  ubahStatus, cekPinPetugas, waktuRelatif, labelStatus, PIN_PETUGAS_DEMO,
  normalisasiTelepon,
} from '../../utils/lapor';

const SARING = [
  { id: 'menunggu', label: 'Menunggu' },
  { id: 'terverifikasi', label: 'Terverifikasi' },
  { id: 'ditolak', label: 'Ditolak' },
  { id: 'semua', label: 'Semua' },
];

const ALASAN_TOLAK = ['Duplikat laporan lain', 'Hoaks / tidak benar', 'Bukan kewenangan', 'Info kurang jelas'];

function cocokSaring(l, saring) {
  if (saring === 'semua') return true;
  if (saring === 'menunggu') return l.status === 'pending';
  if (saring === 'ditolak') return l.status === 'rejected';
  if (saring === 'terverifikasi') return ['verified', 'in_progress', 'resolved'].includes(l.status);
  return true;
}

function Lencana({ status }) {
  const st = labelStatus(status);
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[11px] font-extrabold"
      style={{ backgroundColor: st.bg, color: st.warna }}
    >
      {st.label}
    </span>
  );
}

export function PetugasModal({ isOpen, onClose, onPilih, onMasukPetugas }) {
  const [boleh, setBoleh] = useState(false);
  const [pin, setPin] = useState('');
  const [pinSalah, setPinSalah] = useState(false);
  const [saring, setSaring] = useState('menunggu');
  const [daftar, setDaftar] = useState([]);
  const [fokus, setFokus] = useState(null);
  const [modeTolak, setModeTolak] = useState(false);
  const [modeHapus, setModeHapus] = useState(false);
  const [alasan, setAlasan] = useState(ALASAN_TOLAK[0]);
  const [galat, setGalat] = useState('');

  const muatUlang = () => {
    const semua = antreanPetugas();
    setDaftar(semua);
    setFokus((f) => (f ? semua.find((l) => l.id === f.id) || null : null));
  };

  const tutupRef = useRef(onClose);
  tutupRef.current = onClose;
  const pilihRef = useRef(onPilih);
  pilihRef.current = onPilih;
  const masukRef = useRef(onMasukPetugas);
  masukRef.current = onMasukPetugas;

  useEffect(() => {
    if (!isOpen) return undefined;

    setBoleh(false);
    setPin('');
    setPinSalah(false);
    setSaring('menunggu');
    setFokus(null);
    setModeTolak(false);
    setModeHapus(false);
    setGalat('');
    muatUlang();
    window.addEventListener('jagakota:lapor-baru', muatUlang);
    window.addEventListener('jagakota:lapor-status', muatUlang);
    const jagaEsc = (e) => { if (e.key === 'Escape') tutupRef.current?.(); };
    window.addEventListener('keydown', jagaEsc);
    return () => {
      window.removeEventListener('jagakota:lapor-baru', muatUlang);
      window.removeEventListener('jagakota:lapor-status', muatUlang);
      window.removeEventListener('keydown', jagaEsc);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  if (!isOpen) return null;

  const masuk = () => {
    if (cekPinPetugas(pin)) {
      setBoleh(true);
      setPinSalah(false);
      setGalat('');
      masukRef.current?.();
    } else {
      setPinSalah(true);
    }
  };

  const aksi = (ke, alasanPakai = '') => {
    if (!fokus) return;
    setGalat('');
    const hasil = ubahStatus(fokus.id, ke, { alasan: alasanPakai });
    if (!hasil.ok) {
      setGalat(hasil.galat[0] || 'Gagal mengubah status.');
      return;
    }
    setModeTolak(false);
    muatUlang();
  };

  const hapusPermanen = () => {
    if (!fokus) return;
    setGalat('');
    if (!hapusLaporan(fokus.id)) {
      setGalat('Gagal menghapus di perangkat ini.');
      return;
    }
    setModeHapus(false);
    setFokus(null);
    muatUlang();
  };

  const tampil = daftar.filter((l) => cocokSaring(l, saring));
  const jumlahTunggu = daftar.filter((l) => l.status === 'pending').length;

  const telpFokus = fokus ? normalisasiTelepon(fokus.telepon) : '';
  const telpTampil = telpFokus ? `+${telpFokus}` : String(fokus?.telepon || '');

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-6 backdrop-blur-sm"
      onClick={() => tutupRef.current?.()}
      role="dialog"
      aria-modal="true"
      aria-label="Mode petugas verifikasi laporan"
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b-2 border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <ShieldCheck size={20} strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-slate-900 dark:text-white">
                Mode Petugas {jumlahTunggu > 0 && `(${jumlahTunggu} antre)`}
              </h3>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                Verifikasi laporan sebelum tampil di peta
              </p>
            </div>
          </div>
          <button
            onClick={() => tutupRef.current?.()}
            aria-label="Tutup mode petugas"
            className="grid size-9 shrink-0 place-items-center rounded-xl border-2 border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <X size={17} strokeWidth={2.5} />
          </button>
        </div>

        {!boleh ? (
          <div className="grid place-items-center gap-3 px-6 py-10 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <Lock size={22} strokeWidth={2.5} />
            </span>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">Area khusus petugas</p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Masukkan PIN demo untuk membuka antrean verifikasi.
              </p>
            </div>
            <div className="flex w-full max-w-xs items-center gap-2">
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setPinSalah(false); }}
                onKeyDown={(e) => { if (e.key === 'Enter') masuk(); }}
                placeholder="PIN"
                aria-label="PIN petugas"
                className={`w-full rounded-xl border-2 bg-slate-50 px-4 py-2.5 text-center text-lg font-black tracking-[0.4em] text-slate-900 outline-none dark:bg-slate-800 dark:text-white ${pinSalah ? 'border-red-500' : 'border-slate-200 focus:border-emerald-500 dark:border-slate-700'}`}
              />
              <button
                type="button"
                onClick={masuk}
                className="shrink-0 rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-extrabold text-white dark:bg-white dark:text-slate-900"
              >
                Buka
              </button>
            </div>
            {pinSalah && (
              <p className="text-xs font-bold text-red-600 dark:text-red-400">PIN salah. Coba lagi.</p>
            )}
            <p className="text-[11px] font-semibold text-slate-400">
              Demo lokal — PIN: {PIN_PETUGAS_DEMO} (ganti auth beneran di produksi)
            </p>
          </div>
        ) : !fokus ? (
          <>
            <div className="border-b-2 border-slate-100 px-4 py-3 dark:border-slate-800">
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {SARING.map((s) => {
                  const aktif = saring === s.id;
                  const n = s.id === 'semua' ? daftar.length : daftar.filter((l) => cocokSaring(l, s.id)).length;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSaring(s.id)}
                      aria-pressed={aktif}
                      className={
                        aktif
                          ? 'shrink-0 rounded-full bg-slate-900 px-3.5 py-1.5 text-[11px] font-extrabold text-white dark:bg-white dark:text-slate-900'
                          : 'shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-[11px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }
                    >
                      {s.label} • {n}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              {tampil.length === 0 ? (
                <div className="grid place-items-center gap-2 py-10 text-center">
                  <Check size={36} className="text-emerald-500" />
                  <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200">
                    {saring === 'menunggu' ? 'Antrean kosong. Kerja bagus!' : 'Tidak ada laporan di sini.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-2.5">
                  {tampil.map((l) => {
                    const kat = PETA_KATEGORI_LAPOR[l.kategori] || {};
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => { setFokus(l); setModeTolak(false); setGalat(''); }}
                        className="flex items-center gap-3 rounded-2xl border-2 border-slate-100 bg-slate-50 p-3 text-left hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/50"
                      >
                        {l.foto ? (
                          <img src={l.foto} alt="" loading="lazy" className="size-14 shrink-0 rounded-xl border border-slate-200 object-cover dark:border-slate-700" />
                        ) : (
                          <span className="grid size-14 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-300 dark:border-slate-700 dark:bg-slate-900">
                            <ImageOff size={20} />
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="mb-1 flex flex-wrap items-center gap-1.5">
                            <Lencana status={l.status} />
                            {l.kode && (
                              <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                {l.kode}
                              </span>
                            )}
                          </span>
                          <span className="block truncate text-[13px] font-extrabold text-slate-800 dark:text-slate-100">
                            {kat.label || l.kategori} — {l.deskripsi}
                          </span>
                          <span className="block truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {l.kota ? `${l.kota} • ` : ''}{waktuRelatif(l.createdAt)}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <button
              type="button"
              onClick={() => { setFokus(null); setModeTolak(false); setGalat(''); }}
              className="mb-3 flex items-center gap-1.5 text-[12px] font-extrabold text-slate-500 hover:text-slate-800 dark:text-slate-400"
            >
              <ArrowLeft size={14} strokeWidth={2.5} /> Kembali ke antrean
            </button>
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <Lencana status={fokus.status} />
              {fokus.kode && (
                <span className="rounded bg-slate-200 px-2 py-0.5 font-mono text-[11px] font-extrabold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {fokus.kode}
                </span>
              )}
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              {(PETA_KATEGORI_LAPOR[fokus.kategori] || {}).label || fokus.kategori}
            </h4>
            <p className="mt-1 text-[13px] font-medium leading-relaxed text-slate-700 dark:text-slate-200">
              {fokus.deskripsi}
            </p>
            <p className="mt-1 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
              {[fokus.kota, fokus.nama ? `oleh ${fokus.nama}` : '', waktuRelatif(fokus.createdAt)].filter(Boolean).join(' • ')}
            </p>
            <p className="font-mono text-[11px] font-semibold text-slate-400">
              {Number(fokus.lat).toFixed(5)}, {Number(fokus.lon).toFixed(5)}
            </p>
            {telpTampil ? (
              <div className="mt-3 rounded-2xl border-2 border-emerald-600/30 bg-emerald-50/60 p-3 dark:border-emerald-500/30 dark:bg-emerald-950/40">
                <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  <Phone size={13} strokeWidth={2.5} /> Kontak pelapor (rahasia)
                </p>
                <p className="mt-1 font-mono text-[15px] font-black tracking-wide text-slate-900 dark:text-white">
                  {telpTampil}
                </p>
                {fokus.nama && (
                  <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                    {fokus.nama}
                  </p>
                )}
                {telpFokus && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <a
                    href={`tel:+${telpFokus}`}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-[12px] font-extrabold text-white hover:bg-emerald-700"
                  >
                    <Phone size={14} strokeWidth={2.5} /> Telepon
                  </a>
                  <a
                    href={`https://wa.me/${telpFokus}?text=${encodeURIComponent(`Halo, saya petugas JagaKota. Terkait laporan ${fokus.kode || ''} (${(PETA_KATEGORI_LAPOR[fokus.kategori] || {}).label || fokus.kategori}), boleh konfirmasi kejadiannya?`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-600 px-3 py-2 text-[12px] font-extrabold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300"
                  >
                    <MessageCircle size={14} strokeWidth={2.5} /> Chat WA
                  </a>
                </div>
                )}
                <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                  Hubungi dulu untuk verifikasi — baru Setujui bila benar.
                </p>
              </div>
            ) : (
              <p className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-[12px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                Tanpa nomor kontak (laporan lama) — verifikasi manual bila perlu.
              </p>
            )}
            {fokus.foto && (
              <img
                src={fokus.foto}
                alt="Foto laporan"
                className="mt-3 max-h-64 w-full rounded-2xl border-2 border-slate-100 object-cover dark:border-slate-800"
              />
            )}
            {fokus.status === 'rejected' && fokus.rejectReason && (
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                Alasan penolakan: {fokus.rejectReason}
              </p>
            )}
            {Array.isArray(fokus.riwayat) && fokus.riwayat.length > 0 && (
              <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
                <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
                  Jejak status
                </p>
                <ol className="grid gap-1.5">
                  {fokus.riwayat.map((r, i) => (
                    <li key={i} className="flex items-center gap-2 text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                      {labelStatus(r.status).label}
                      <span className="text-slate-400">• {waktuRelatif(r.at)}</span>
                      {r.alasan && <span className="text-slate-400">• {r.alasan}</span>}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {galat && (
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-[12px] font-bold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {galat}
              </p>
            )}
            <div className="mt-3 grid gap-2">
              {fokus.status === 'pending' && !modeTolak && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => aksi('verified')}
                    className="rounded-xl bg-emerald-600 px-4 py-2.5 text-[13px] font-extrabold text-white hover:bg-emerald-700"
                  >
                    Setujui
                  </button>
                  <button
                    type="button"
                    onClick={() => { setModeTolak(true); setGalat(''); }}
                    className="rounded-xl border-2 border-red-200 px-4 py-2.5 text-[13px] font-extrabold text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400"
                  >
                    Tolak
                  </button>
                </div>
              )}
              {fokus.status === 'pending' && modeTolak && (
                <div className="grid gap-2 rounded-2xl border-2 border-red-200 bg-red-50/50 p-3 dark:border-red-900 dark:bg-red-950/20">
                  <label className="text-[12px] font-extrabold text-slate-700 dark:text-slate-200" htmlFor="alasan-tolak">
                    Alasan penolakan (wajib)
                  </label>
                  <select
                    id="alasan-tolak"
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-[13px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {ALASAN_TOLAK.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setModeTolak(false)}
                      className="rounded-xl border-2 border-slate-200 px-4 py-2 text-[12px] font-extrabold text-slate-500 dark:border-slate-700 dark:text-slate-300"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => aksi('rejected', alasan)}
                      className="rounded-xl bg-red-600 px-4 py-2 text-[12px] font-extrabold text-white hover:bg-red-700"
                    >
                      Konfirmasi Tolak
                    </button>
                  </div>
                </div>
              )}
              {fokus.status === 'rejected' && (
                <button
                  type="button"
                  onClick={() => aksi('pending')}
                  className="rounded-xl border-2 border-slate-200 px-4 py-2.5 text-[13px] font-extrabold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Antrekan ulang (banding)
                </button>
              )}
              {!modeHapus ? (
                <button
                  type="button"
                  onClick={() => { setModeHapus(true); setGalat(''); }}
                  className="rounded-xl border-2 border-dashed border-slate-300 px-4 py-2 text-[12px] font-extrabold text-slate-400 hover:border-red-400 hover:text-red-500 dark:border-slate-700 dark:text-slate-500"
                >
                  Hapus permanen…
                </button>
              ) : (
                <div className="grid gap-2 rounded-2xl border-2 border-red-600 bg-red-50/60 p-3 dark:border-red-500 dark:bg-red-950/30">
                  <p className="text-[12px] font-extrabold text-red-700 dark:text-red-300">
                    Hapus laporan {fokus.kode || ''} selamanya? Hilang dari antrean, daftar, peta, dan cloud.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setModeHapus(false)}
                      className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-[12px] font-extrabold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={hapusPermanen}
                      className="rounded-xl bg-red-600 px-4 py-2 text-[12px] font-extrabold text-white hover:bg-red-700"
                    >
                      Ya, hapus
                    </button>
                  </div>
                </div>
              )}
              {onPilih && (
                <button
                  type="button"
                  onClick={() => { tutupRef.current?.(); pilihRef.current?.(fokus); }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-slate-200 px-4 py-2.5 text-[13px] font-extrabold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  <MapPin size={14} strokeWidth={2.5} /> Lihat di Peta
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PetugasModal;
