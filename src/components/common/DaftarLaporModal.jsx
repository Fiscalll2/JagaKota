import React, { useEffect, useRef, useState } from 'react';
import { Users, X, MapPin, ThumbsUp, Share2, Check, ZoomIn } from 'lucide-react';
import {
  KATEGORI_LAPOR, PETA_KATEGORI_LAPOR, muatLaporan,
  dukungLaporan, sudahDukung, waktuRelatif,
} from '../../utils/lapor';

// Langkah 6: daftar semua laporan warga (filter kategori + urut terbaru/didukung).
// Props: isOpen, onClose, onPilih(lapor) = terbang ke pin, onLaporBaru = buka form.
export function DaftarLaporModal({ isOpen, onClose, onPilih, onLaporBaru }) {
  const [saring, setSaring] = useState('semua');
  const [urut, setUrut] = useState('baru');
  const [daftar, setDaftar] = useState([]);
  const [tersalinId, setTersalinId] = useState(null);
  const [fotoPenuh, setFotoPenuh] = useState(null); // { src, label } atau null
  const timerSalin = useRef(null);

  // Kunci scroll body selama modal terbuka + cegah rantai scroll ke dashboard.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => () => {
    if (timerSalin.current) clearTimeout(timerSalin.current);
  }, []);

  const muatUlang = () => setDaftar(muatLaporan());

  useEffect(() => {
    if (!isOpen) return undefined;
    setSaring('semua');
    setUrut('baru');
    muatUlang();
    window.addEventListener('jagakota:lapor-baru', muatUlang);
    const jagaEsc = (e) => {
      if (e.key !== 'Escape') return;
      // Lightbox foto ditutup dulu sebelum modal.
      setFotoPenuh((f) => {
        if (f) return null;
        onClose();
        return f;
      });
    };
    window.addEventListener('keydown', jagaEsc);
    return () => {
      window.removeEventListener('jagakota:lapor-baru', muatUlang);
      window.removeEventListener('keydown', jagaEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tampil = daftar
    .filter((l) => saring === 'semua' || l.kategori === saring)
    .sort((a, b) => (urut === 'dukung'
      ? (b.dukung || 0) - (a.dukung || 0) || new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(b.createdAt) - new Date(a.createdAt)));

  const dukungDariDaftar = (id) => {
    const hasil = dukungLaporan(id);
    if (hasil.ok) muatUlang();
    else if (hasil.galat?.[0]) window.alert(hasil.galat[0]);
  };

  const bagikan = async (l) => {
    const tautan = `${window.location.origin}${window.location.pathname}?lapor=${encodeURIComponent(l.id)}`;
    try {
      await navigator.clipboard.writeText(tautan);
    } catch {
      // Fallback browser lama / non-HTTPS: textarea sementara + execCommand.
      try {
        const el = document.createElement('textarea');
        el.value = tautan;
        el.readOnly = true;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(el);
        if (!ok) throw new Error('copy gagal');
      } catch {
        window.alert(`Salin manual: ${tautan}`);
        return;
      }
    }
    setTersalinId(l.id);
    if (timerSalin.current) clearTimeout(timerSalin.current);
    timerSalin.current = setTimeout(() => setTersalinId((v) => (v === l.id ? null : v)), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Daftar laporan warga"
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b-2 border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white">
              <Users size={20} strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-slate-900 dark:text-white">
                Laporan Warga ({daftar.length})
              </h3>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                Dari warga, untuk warga • belum verifikasi resmi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup daftar laporan"
            className="grid size-9 shrink-0 place-items-center rounded-xl border-2 border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <X size={17} strokeWidth={2.5} />
          </button>
        </div>

        <div className="border-b-2 border-slate-100 px-4 py-3 sm:px-5 dark:border-slate-800">
          <div className="flex snap-x gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
            {[{ id: 'semua', label: 'Semua' }, ...KATEGORI_LAPOR].map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={(e) => { setSaring(k.id); e.currentTarget.scrollIntoView({ inline: 'center', block: 'nearest' }); }}
                aria-pressed={saring === k.id}
                className={
                  saring === k.id
                    ? 'shrink-0 snap-start rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-extrabold text-white'
                    : 'shrink-0 snap-start rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }
              >
                {k.label}
              </button>
            ))}
          </div>
          <div
            role="group"
            aria-label="Urutkan laporan"
            className="mt-2 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
          >
            {[
              { id: 'baru', label: 'Terbaru' },
              { id: 'dukung', label: 'Paling didukung' },
            ].map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setUrut(o.id)}
                aria-pressed={urut === o.id}
                className={
                  urut === o.id
                    ? 'rounded-lg bg-white py-1.5 text-[11px] font-extrabold text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-300'
                    : 'rounded-lg py-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400'
                }
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 touch-pan-y overflow-y-auto overscroll-contain px-4 py-4 [-webkit-overflow-scrolling:touch] sm:px-5">
          {tampil.length === 0 ? (
            <div className="grid place-items-center gap-2 py-10 text-center">
              <MapPin size={36} className="text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200">
                {daftar.length === 0 ? 'Belum ada laporan di perangkat ini.' : 'Tidak ada laporan kategori ini.'}
              </p>
              <p className="max-w-xs text-xs font-medium text-slate-500 dark:text-slate-400">
                {daftar.length === 0 ? 'Jadi yang pertama melapor di kotamu, Lur!' : 'Coba kategori lain.'}
              </p>
              {daftar.length === 0 && onLaporBaru && (
                <button
                  type="button"
                  onClick={() => { onClose(); onLaporBaru(); }}
                  className="mt-1 rounded-xl bg-emerald-600 px-5 py-2.5 text-[13px] font-extrabold text-white hover:bg-emerald-700"
                >
                  Lapor Sekarang
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-2.5">
              {tampil.map((l) => {
                const kat = PETA_KATEGORI_LAPOR[l.kategori];
                const didukung = sudahDukung(l.id);
                return (
                  <article
                    key={l.id}
                    className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-extrabold text-white"
                        style={{ backgroundColor: kat?.warna || '#6b7280' }}
                      >
                        {kat?.label || l.kategori}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {l.kota ? `${l.kota} • ` : ''}{waktuRelatif(l.createdAt)}
                      </span>
                    </div>
                    <p className="text-[13px] font-medium leading-relaxed text-slate-800 dark:text-slate-100">
                      {l.deskripsi}
                    </p>
                    {l.foto && (
                      <button
                        type="button"
                        onClick={() => setFotoPenuh({ src: l.foto, label: `Foto ${kat?.label || 'laporan'} • ${l.kota || 'Lokasi aktif'}` })}
                        aria-label="Lihat foto ukuran penuh"
                        className="relative mt-2 block w-full"
                      >
                        <img
                          src={l.foto}
                          alt={`Foto ${kat?.label || 'laporan'}`}
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          className="max-h-44 w-full rounded-xl border border-slate-200 object-cover dark:border-slate-700"
                        />
                        <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-slate-950/70 px-2.5 py-1 text-[11px] font-extrabold text-white">
                          <ZoomIn size={12} strokeWidth={2.5} /> Ketuk untuk perbesar
                        </span>
                      </button>
                    )}
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => dukungDariDaftar(l.id)}
                        disabled={didukung}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-extrabold text-white disabled:opacity-60"
                      >
                        <ThumbsUp size={13} strokeWidth={2.5} />
                        {didukung ? 'Didukung' : 'Dukung'} • {l.dukung || 0}
                      </button>
                      <button
                        type="button"
                        onClick={() => bagikan(l)}
                        className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 px-3 py-1.5 text-xs font-extrabold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                      >
                        {tersalinId === l.id
                          ? <><Check size={13} strokeWidth={2.5} /> Tersalin!</>
                          : <><Share2 size={13} strokeWidth={2.5} /> Bagikan</>}
                      </button>
                      {onPilih && (
                        <button
                          type="button"
                          onClick={() => { onClose(); onPilih?.(l); }}
                          className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 px-3 py-1.5 text-xs font-extrabold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                        >
                          <MapPin size={13} strokeWidth={2.5} /> Lihat di Peta
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
        {fotoPenuh && (
          <div
            className="absolute inset-0 z-20 flex flex-col bg-slate-950/95 p-4"
            onClick={() => setFotoPenuh(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Foto ukuran penuh"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="truncate text-xs font-bold text-slate-200">{fotoPenuh.label}</p>
              <button
                type="button"
                onClick={() => setFotoPenuh(null)}
                aria-label="Tutup foto penuh"
                className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-600 text-slate-200"
              >
                <X size={17} strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
              <img
                src={fotoPenuh.src}
                alt={fotoPenuh.label}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="max-h-full max-w-full rounded-xl object-contain"
              />
            </div>
            <p className="mt-2 text-center text-[11px] font-semibold text-slate-400">
              Ketuk di mana saja untuk menutup
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DaftarLaporModal;
