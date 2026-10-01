import React, { useState, useEffect } from 'react';
import { ShieldAlert, PhoneCall, Wind, Waves, X, Activity, TriangleAlert } from 'lucide-react';

// Hotline resmi yang dirangkum tim JagaKota dari kanal pemerintah.
const KONTAK_DARURAT_JAGA = [
  { nomor: '112', instansi: 'Panggilan Darurat Nasional', guna: 'Terpadu bebas pulsa: polisi, ambulans, damkar, bencana', warna: '#ef4444', latar: '#fef2f2' },
  { nomor: '115', instansi: 'BASARNAS', guna: 'Pencarian, pertolongan & evakuasi bencana', warna: '#f97316', latar: '#fff7ed' },
  { nomor: '119', instansi: 'Ambulans & PSC Kemenkes', guna: 'Gawat darurat medis & ambulans rumah sakit', warna: '#10b981', latar: '#ecfdf5' },
  { nomor: '113', instansi: 'Pemadam Kebakaran', guna: 'Kebakaran, reruntuhan & penyelamatan bahaya', warna: '#dc2626', latar: '#fef2f2' },
  { nomor: '110', instansi: 'Kepolisian RI', guna: 'Keamanan & ketertiban masyarakat', warna: '#3b82f6', latar: '#eff6ff' },
  { nomor: '123', instansi: 'PLN Gangguan', guna: 'Kabel putus, korsleting & padam pascabencana', warna: '#f59e0b', latar: '#fffbeb' },
];

const TAB_PANDUAN_JAGA = [
  { id: 'kontak', label: 'Kontak', Ikon: PhoneCall },
  { id: 'gempa', label: 'Gempa', Ikon: Activity },
  { id: 'polusi', label: 'Udara', Ikon: Wind },
  { id: 'tsunami', label: 'Tsunami & UV', Ikon: Waves },
];

function BlokPanduan({ judul, aksen, anak, children }) {
  const isi = anak ?? children;
  return (
    <section className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
      <h4 className="mb-2 text-sm font-extrabold" style={{ color: aksen }}>{judul}</h4>
      <div className="text-[13px] font-medium leading-relaxed text-slate-700 dark:text-slate-200">{isi}</div>
    </section>
  );
}

export function EmergencyGuideModal({ isOpen, onClose }) {
  const [tabAktif, setTabAktif] = useState('kontak');

  useEffect(() => {
    if (!isOpen) return undefined;
    const jagaEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', jagaEsc);
    return () => window.removeEventListener('keydown', jagaEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Panduan tanggap bencana"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kepala */}
        <div className="flex items-center justify-between gap-3 border-b-2 border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-red-500 text-white">
              <ShieldAlert size={20} strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-slate-900 dark:text-white">
                Siaga Bencana JagaKota
              </h3>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                Hotline resmi + langkah selamat BNPB · BMKG · Kemenkes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup panduan darurat"
            className="grid size-9 shrink-0 place-items-center rounded-xl border-2 border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <X size={17} strokeWidth={2.5} />
          </button>
        </div>

        {/* Pindah tab */}
        <div className="flex gap-2 overflow-x-auto border-b-2 border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TAB_PANDUAN_JAGA.map(({ id, label, Ikon }) => {
            const aktif = tabAktif === id;
            return (
              <button
                key={id}
                onClick={() => setTabAktif(id)}
                className={
                  aktif
                    ? 'flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-extrabold text-white dark:bg-white dark:text-slate-900'
                    : 'flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                }
              >
                <Ikon size={14} strokeWidth={2.5} />
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {tabAktif === 'kontak' && (
            <div className="grid gap-2.5">
              <div className="flex items-start gap-2 rounded-2xl border-2 border-red-200 bg-red-50 px-3.5 py-3 text-xs font-bold leading-relaxed text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                <TriangleAlert size={15} className="mt-0.5 shrink-0" />
                <span>Nomor 112 bebas pulsa dari semua operator, bahkan saat layar ponsel terkunci.</span>
              </div>
              {KONTAK_DARURAT_JAGA.map((k) => (
                <div
                  key={k.nomor}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-slate-100 bg-slate-50 px-3.5 py-3 dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-xl text-base font-black text-white"
                      style={{ backgroundColor: k.warna }}
                    >
                      {k.nomor}
                    </span>
                    <div className="min-w-0">
                      <strong className="block text-sm font-extrabold text-slate-900 dark:text-white">{k.instansi}</strong>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">{k.guna}</span>
                    </div>
                  </div>
                  <a
                    href={`tel:${k.nomor}`}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold text-white"
                    style={{ backgroundColor: k.warna }}
                  >
                    <PhoneCall size={13} strokeWidth={2.5} /> Telepon
                  </a>
                </div>
              ))}
            </div>
          )}

          {tabAktif === 'gempa' && (
            <div className="grid gap-3">
              <BlokPanduan judul="1. Saat guncangan: merunduk, lindungi, bertahan" aksen="#d97706">
                <ul className="list-disc space-y-1 pl-5">
                  <li><strong>Merunduk</strong> sebelum guncangan menjatuhkan tubuh.</li>
                  <li><strong>Lindungi kepala</strong> di bawah meja kokoh, tas, atau lengan.</li>
                  <li><strong>Bertahan</strong> pegang kaki meja sampai reda.</li>
                  <li>Menjauh dari kaca, cermin, dan lemari tinggi.</li>
                </ul>
              </BlokPanduan>
              <BlokPanduan judul="2. Di gedung bertingkat" aksen="#dc2626">
                <ul className="list-disc space-y-1 pl-5">
                  <li><strong>Jangan naik lift</strong>, pakai tangga darurat.</li>
                  <li>Keluar tertib agar tidak menumpuk di pintu.</li>
                </ul>
              </BlokPanduan>
              <BlokPanduan judul="3. Setelah reda" aksen="#059669">
                <ul className="list-disc space-y-1 pl-5">
                  <li>Matikan kompor dan listrik utama cegah kebakaran.</li>
                  <li>Berkumpul di lapangan terbuka jauh dari tiang &amp; tembok retak.</li>
                  <li>Pantau gempa susulan resmi BMKG lewat JagaKota.</li>
                </ul>
              </BlokPanduan>
            </div>
          )}

          {tabAktif === 'polusi' && (
            <div className="grid gap-3">
              <BlokPanduan judul="Saat udara tidak sehat (AQI > 150)" aksen="#dc2626">
                <ul className="list-disc space-y-1 pl-5">
                  <li><strong>Masker N95/KN95/KF94</strong> di luar ruangan; masker kain tipis tak menyaring PM2.5.</li>
                  <li>Tutup jendela dan ventilasi kamar.</li>
                  <li>Nyalakan penyaring udara HEPA bila ada.</li>
                  <li>Tunda lari atau sepedaan di jalan raya jam sibuk.</li>
                  <li>Anak, lansia, dan penderita asma di dalam ruangan dulu.</li>
                </ul>
              </BlokPanduan>
            </div>
          )}

          {tabAktif === 'tsunami' && (
            <div className="grid gap-3">
              <BlokPanduan judul="Ancaman tsunami ala BMKG: 20-20-20" aksen="#2563eb">
                <ul className="list-disc space-y-1 pl-5">
                  <li>Gempa <strong>lebih dari 20 detik</strong> di pantai berarti punya ±<strong>20 menit</strong> menuju titik <strong>20 meter</strong> di atas laut.</li>
                  <li>Air laut surut tiba-tiba = <strong>segera menjauh</strong> ke bukit atau gedung evakuasi.</li>
                </ul>
              </BlokPanduan>
              <BlokPanduan judul="Radiasi UV ekstrem (8+)" aksen="#d97706">
                <ul className="list-disc space-y-1 pl-5">
                  <li>Oles tabir surya SPF 30+ tiap 2 jam.</li>
                  <li>Topi lebar, lengan panjang, kacamata anti-UV.</li>
                  <li>Hindari matahari langsung pukul 10.00–15.00 WIB.</li>
                </ul>
              </BlokPanduan>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-0.5 border-t-2 border-slate-100 bg-slate-50 px-5 py-3 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
          <span className="truncate">Rujukan: BNPB · BMKG · Kemenkes RI</span>
          <span className="shrink-0 font-extrabold text-red-500">Darurat: 112</span>
        </div>
      </div>
    </div>
  );
}

export default EmergencyGuideModal;
