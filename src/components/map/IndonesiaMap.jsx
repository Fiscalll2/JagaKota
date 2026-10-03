import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { INDONESIA_CITIES } from '../../utils/cities';
import { muatLaporan, PETA_KATEGORI_LAPOR, KATEGORI_LAPOR, waktuRelatif, dukungLaporan, flagLaporan, sudahDukung, sudahFlag, escapeHtml } from '../../utils/lapor';
import { INDONESIA_VOLCANOES, VOLCANO_STATUS_LEVELS } from '../../utils/volcanoes';
import { SATELLITE_HOTSPOTS } from '../../utils/karhutla';
import { translations } from '../../utils/i18n';
import { Activity as IkonGempa, Compass as IkonKompas, Flame as IkonApi, MapPin as IkonPin, Mountain as IkonGunung, Users as IkonWarga, ZoomIn as IkonPlus, ZoomOut as IkonMinus } from 'lucide-react';

// -----------------------------------------------------------------------------
// Peta JagaKota — palet teal, radius, dan susunan layer khas sendiri.
// Palet khas JagaKota: tosca pekat + emas kunyit, bukan biru royal.
// Tile OSM dipakai deklaratif via <TileLayer/>, jadi tidak ada fetch manual
// sehingga header khusus X-JagaKota tidak diperlukan di sini.
// -----------------------------------------------------------------------------

const TITIK_TENGAH_NUSANTARA = [-2.5489, 118.0149];

const PALET_JAGAKOTA = {
  pinKota: '#0f766e',
  pinKotaAktif: '#0d9488',
  garisEmas: '#fbbf24',
  haloLuar: '#14b8a6',
  haloDalam: '#0f766e',
  tombolAksen: '#0e7490',
  apiBara: '#c2410c',
  apiMenyala: '#ea580c',
};

// Ubah warna pin kota menjadi tosca JagaKota dengan lidah emas di tengah.
function rakitSvgPin(warnaBadan, warnaTitik, bertanda) {
  const lebar = bertanda ? 28 : 24;
  const tinggi = bertanda ? 36 : 30;
  const tengahX = lebar / 2;
  const raw = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lebar} ${tinggi}" width="${lebar}" height="${tinggi}">
    <ellipse cx="${tengahX}" cy="${tinggi - 3}" rx="6" ry="2.4" fill="#000000" opacity="0.22"/>
    <path d="M${tengahX} 1.5 C ${tengahX - 8} 1.5, 3.5 8.5, 3.5 14.5 C 3.5 21.5, ${tengahX} ${tinggi - 4}, ${tengahX} ${tinggi - 4} C ${tengahX} ${tinggi - 4}, ${lebar - 3.5} 21.5, ${lebar - 3.5} 14.5 C ${lebar - 3.5} 8.5, ${tengahX + 8} 1.5, ${tengahX} 1.5 Z" fill="${warnaBadan}" stroke="#ffffff" stroke-width="${bertanda ? 2.2 : 1.6}"/>
    <circle cx="${tengahX}" cy="14" r="${bertanda ? 4.6 : 3.4}" fill="#ffffff"/>
    <circle cx="${tengahX}" cy="14" r="${bertanda ? 2.4 : 1.7}" fill="${warnaTitik}"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(raw)}`;
}

function rakitSvgApi() {
  const raw = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32">
    <ellipse cx="12" cy="29" rx="6" ry="2.2" fill="#000000" opacity="0.22"/>
    <path d="M12 1.5 C 5.5 1.5, 3 8, 3 13.5 C 3 21, 12 28.5, 12 28.5 C 12 28.5, 21 21, 21 13.5 C 21 8, 18.5 1.5, 12 1.5 Z" fill="${PALET_JAGAKOTA.apiBara}" stroke="#fff7ed" stroke-width="1.6"/>
    <path d="M12 9 C 9.8 12, 9.2 14.5, 12 18.5 C 14.8 14.5, 14.2 12, 12 9 Z" fill="#fef3c7"/>
    <circle cx="12" cy="19.5" r="1.6" fill="#fde68a"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(raw)}`;
}

const penandaKota = L.icon({
  iconUrl: rakitSvgPin(PALET_JAGAKOTA.pinKota, PALET_JAGAKOTA.garisEmas, false),
  iconSize: [24, 30],
  iconAnchor: [12, 29],
  popupAnchor: [0, -26],
});

const penandaKotaAktif = L.icon({
  iconUrl: rakitSvgPin(PALET_JAGAKOTA.pinKotaAktif, PALET_JAGAKOTA.garisEmas, true),
  iconSize: [28, 36],
  iconAnchor: [14, 35],
  popupAnchor: [0, -32],
});

const penandaApi = L.icon({
  iconUrl: rakitSvgApi(),
  iconSize: [24, 32],
  iconAnchor: [12, 31],
  popupAnchor: [0, -28],
});

// Pin laporan warga: dot kecil 16px via divIcon (CSS di index.css) —
// ringan, bisa dianimasikan, dan beda bentuk dari pin resmi.
function ikonPinLapor(warna, { baru = false, gabung = 0 } = {}) {
  const dalam = gabung > 1
    ? `<span class="jk-gabung" style="--jk-warna:${warna}">${gabung > 9 ? '9+' : gabung}</span>`
    : `<span class="jk-pin"></span>`;
  return L.divIcon({
    html: `<span class="jk-pin-wrap${baru ? ' jk-pin-baru' : ''}" style="--jk-warna:${warna}">${dalam}</span>`,
    className: 'jk-divikosong',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -13],
  });
}

// Kelompokkan laporan per sel piksel peta (anti-tindih): sel ~44px sesuai zoom.
function kelompokkanLaporan(daftar, zoom) {
  const selDeg = (360 / (256 * Math.pow(2, Math.max(zoom, 1)))) * 44;
  const grup = new Map();
  for (const l of daftar) {
    const kunci = `${Math.floor(l.lat / selDeg)}:${Math.floor(l.lon / selDeg)}`;
    if (!grup.has(kunci)) grup.set(kunci, { kunci, items: [] });
    grup.get(kunci).items.push(l);
  }
  return [...grup.values()].map(({ kunci, items }) => ({
    kunci,
    lat: items.reduce((a, b) => a + b.lat, 0) / items.length,
    lon: items.reduce((a, b) => a + b.lon, 0) / items.length,
    items,
  }));
}

// Klasifikasi gempa versi JagaKota: ambang & warna sendiri.
function tentukanWarnaGempa(magnitudo) {
  const m = Number(magnitudo) || 0;
  if (m >= 6.5) return '#b91c1c';
  if (m >= 5.0) return '#c2410c';
  if (m >= 4.0) return '#ca8a04';
  return '#65a30d';
}

function hitungRadiusGempa(magnitudo) {
  const m = Number(magnitudo) || 4;
  return Math.round(m * 11000 + 5000);
}

// Ambil nama kota aktif dari berbagai bentuk objek lokasi.
function petikNamaKotaAktif(lokasi) {
  return lokasi?.city || lokasi?.name || lokasi?.kota || '';
}

// Indeks pencarian cepat nama -> objek kota (lookup alternatif, bukan find berulang).
function bangunIndeksKota(daftar) {
  const peta = new Map();
  for (const kota of daftar) {
    if (kota?.name && !peta.has(kota.name)) peta.set(kota.name, kota);
  }
  return peta;
}

function tulisKoordinat(lat, lon) {
  const a = Number(lat);
  const b = Number(lon);
  if (Number.isNaN(a) || Number.isNaN(b)) return '-';
  return `${a.toFixed(2)}, ${b.toFixed(2)}`;
}

// Sinkronisasi gerakan peta: perbaiki ukuran, dengar zoom, terbang ke bidikan.
function PenyelarasPeta({ bidikan, kabariZoom }) {
  const peta = useMap();

  useEffect(() => {
    peta.invalidateSize();
    const jedaA = setTimeout(() => peta.invalidateSize(), 200);
    const jedaB = setTimeout(() => peta.invalidateSize(), 650);
    const saatUkuranBerubah = () => peta.invalidateSize();
    window.addEventListener('resize', saatUkuranBerubah);
    return () => {
      clearTimeout(jedaA);
      clearTimeout(jedaB);
      window.removeEventListener('resize', saatUkuranBerubah);
    };
  }, [peta]);

  useMapEvents({
    zoomend: () => {
      if (kabariZoom) kabariZoom(peta.getZoom());
    },
  });

  useEffect(() => {
    if (!bidikan) return;
    peta.flyTo(bidikan.pusat, bidikan.tingkat, { duration: 1.4, easeLinearity: 0.2 });
  }, [bidikan, peta]);

  return null;
}

// Panel tombol melayang di kanan atas peta.
function PanelNavigasi({ labelKota, melompatNusantara, melompatKota }) {
  const peta = useMap();
  const bingkai = {
    position: 'absolute',
    top: '14px',
    right: '14px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };
  const tombolKecil = {
    width: '38px',
    height: '38px',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-main)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  const tombolTeks = {
    padding: '7px 11px',
    minHeight: '38px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-flat)',
    boxShadow: '0 6px 16px rgba(13, 148, 136, 0.14)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.74rem',
    fontWeight: '800',
  };
  return (
    <div style={bingkai}>
      <div style={{ display: 'flex', flexDirection: 'column', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-flat)', boxShadow: '0 6px 16px rgba(0,0,0,0.14)' }}>
        <button onClick={() => peta.zoomIn()} title="Perbesar peta" aria-label="Perbesar peta" style={{ ...tombolKecil, borderBottom: '1px solid var(--border-flat)' }}>
          <IkonPlus size={17} />
        </button>
        <button onClick={() => peta.zoomOut()} title="Perkecil peta" aria-label="Perkecil peta" style={tombolKecil}>
          <IkonMinus size={17} />
        </button>
      </div>
      <button onClick={melompatKota} title={`Terbang ke ${labelKota || 'kota aktif'}`} aria-label="Terbang ke kota aktif" style={{ ...tombolTeks, color: PALET_JAGAKOTA.tombolAksen }}>
        <IkonPin size={14} />
        <span>Kota</span>
      </button>
      <button onClick={melompatNusantara} title="Lihat seluruh Nusantara" aria-label="Lihat seluruh Nusantara" style={{ ...tombolTeks, color: 'var(--text-main)' }}>
        <IkonKompas size={14} />
        <span>Nusantara</span>
      </button>
    </div>
  );
}

// Saklar satu lapis peta (tombol pil).
function PilLapisan({ menyala, warnaMenyala, Simbol, teks, ketuk }) {
  return (
    <button
      onClick={ketuk}
      aria-pressed={menyala}
      style={{
        padding: '6px 11px',
        minHeight: '34px',
        borderRadius: '9999px',
        backgroundColor: menyala ? `${warnaMenyala}26` : 'var(--bg-muted)',
        color: menyala ? warnaMenyala : 'var(--text-muted)',
        border: `1px solid ${menyala ? warnaMenyala : 'var(--border-flat)'}`,
        cursor: 'pointer',
        fontWeight: '800',
        fontSize: '0.73rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
      }}
    >
      <Simbol size={14} strokeWidth={2.4} />
      <span>{teks}</span>
    </button>
  );
}

const gayaPopup = { padding: '6px', textAlign: 'center', fontFamily: 'Plus Jakarta Sans, sans-serif' };
const gayaTombolPopup = (warna) => ({
  padding: '7px 12px',
  borderRadius: '8px',
  backgroundColor: warna,
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.76rem',
  fontWeight: '800',
  width: '100%',
});

// Popup programatik untuk deep-link ?lapor=id: HTML string (escape manual!)
// karena konten Leaflet di luar render React.
function PembukaPopupLapor({ lapor }) {
  const peta = useMap();

  useEffect(() => {
    if (!lapor || !Number.isFinite(lapor.lat) || !Number.isFinite(lapor.lon)) return;
    const kat = PETA_KATEGORI_LAPOR[lapor.kategori] || {};
    // Hanya dataURL gambar yang diizinkan (jangan render skema lain dari storage).
    const fotoOk = typeof lapor.foto === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(lapor.foto);
    const foto = fotoOk
      ? `<a href="${lapor.foto}" target="_blank" rel="noreferrer" title="Buka foto ukuran penuh di tab baru"><img src="${lapor.foto}" alt="" style="width:100%;max-height:160px;object-fit:cover;border-radius:8px;margin-top:6px" /></a>`
      : '';
    const html = `
      <div style="padding:6px;text-align:center;font-family:'Plus Jakarta Sans',sans-serif">
        <span style="display:inline-block;padding:3px 8px;border-radius:9999px;background:${escapeHtml(kat.warna || '#6b7280')};color:#fff;font-size:11px;font-weight:800">${escapeHtml(kat.label || lapor.kategori)}</span>
        <span style="display:inline-block;margin-left:4px;padding:3px 8px;border-radius:9999px;background:#fef3c7;color:#92400e;font-size:11px;font-weight:800">WARGA • belum verifikasi</span>
        <p style="margin:6px 0 0 0;font-size:13px;color:#111827;font-weight:600">${escapeHtml(lapor.deskripsi)}</p>
        ${foto}
        <p style="margin:3px 0 0 0;font-size:11px;color:#6b7280">${escapeHtml(lapor.kota ? `${lapor.kota} • ` : '')}${escapeHtml(waktuRelatif(lapor.createdAt))}</p>
      </div>`;
    L.popup({ maxWidth: 260 }).setLatLng([lapor.lat, lapor.lon]).setContent(html).openOn(peta);
    peta.flyTo([lapor.lat, lapor.lon], 14, { duration: 1.4, easeLinearity: 0.2 });
  }, [lapor, peta]);

  return null;
}

export function IndonesiaMap({ currentLocation, earthquakes, hotspots = SATELLITE_HOTSPOTS, onSelectCity, onOpenDaftar, sorotAwal }) {
  const kamus = translations;
  const namaAktif = petikNamaKotaAktif(currentLocation);

  const [lapisKota, setLapisKota] = useState(true);
  const [lapisGunung, setLapisGunung] = useState(true);
  const [lapisApi, setLapisApi] = useState(true);
  const [lapisGempa, setLapisGempa] = useState(true);
  const [lapisLapor, setLapisLapor] = useState(true);
  const [saringKategori, setSaringKategori] = useState('semua');
  const [laporan, setLaporan] = useState(() => muatLaporan());
  const [pinBaruId, setPinBaruId] = useState(null);
  const timerPinBaru = useRef(null);
  const [angkaZoom, setAngkaZoom] = useState(8);

  const [bidikPeta, setBidikPeta] = useState(() => ({
    pusat: [currentLocation?.lat || TITIK_TENGAH_NUSANTARA[0], currentLocation?.lon || TITIK_TENGAH_NUSANTARA[1]],
    tingkat: 8,
  }));

  const indeksKota = useMemo(() => bangunIndeksKota(INDONESIA_CITIES), []);

  // Ikuti lokasi baru dari induk: arahkan bidikan tanpa me-remount peta.
  useEffect(() => {
    if (currentLocation?.lat && currentLocation?.lon) {
      setBidikPeta({ pusat: [currentLocation.lat, currentLocation.lon], tingkat: 10 });
    }
  }, [currentLocation?.lat, currentLocation?.lon]);

  // Muat ulang pin warga saat ada laporan baru (event dari LaporModal).
  // Pin terbaru dapat animasi pop sekali (~4 detik).
  useEffect(() => {
    const muatUlang = (e) => {
      const daftar = muatLaporan();
      setLaporan(daftar);
      // detail event bisa tak terbaca lintas-compartment (evaluasi otomasi) → fallback terbaru.
      let idBaru = null;
      try {
        idBaru = e?.detail?.id || null;
      } catch {
        idBaru = null;
      }
      setPinBaruId(idBaru || daftar[0]?.id || null);
      if (timerPinBaru.current) clearTimeout(timerPinBaru.current);
      timerPinBaru.current = setTimeout(() => setPinBaruId(null), 4000);
    };
    window.addEventListener('jagakota:lapor-baru', muatUlang);
    return () => {
      window.removeEventListener('jagakota:lapor-baru', muatUlang);
      if (timerPinBaru.current) clearTimeout(timerPinBaru.current);
    };
  }, []);

  // Terbang ke pin dari DaftarLaporModal (event dari App).
  useEffect(() => {
    const terbang = (e) => {
      const { lat, lon } = e.detail || {};
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        setBidikPeta({ pusat: [lat, lon], tingkat: 13 });
      }
    };
    window.addEventListener('jagakota:terbang-lapor', terbang);
    return () => window.removeEventListener('jagakota:terbang-lapor', terbang);
  }, []);

  const lompatNusantara = useCallback(() => {
    setBidikPeta({ pusat: [...TITIK_TENGAH_NUSANTARA], tingkat: 5 });
  }, []);

  const lompatKotaAktif = useCallback(() => {
    if (currentLocation?.lat && currentLocation?.lon) {
      setBidikPeta({ pusat: [currentLocation.lat, currentLocation.lon], tingkat: 12 });
    }
  }, [currentLocation?.lat, currentLocation?.lon]);

  const pilihKotaLaluTerbang = useCallback(
    (kota) => {
      if (onSelectCity) onSelectCity(kota);
      setBidikPeta({ pusat: [kota.lat, kota.lon], tingkat: 12 });
    },
    [onSelectCity]
  );

  const arahKeTitikApi = useCallback((titik) => {
    setBidikPeta({ pusat: [titik.lat, titik.lon], tingkat: 11 });
  }, []);

  const dukung = useCallback((id) => {
    const hasil = dukungLaporan(id);
    if (hasil.ok) setLaporan(muatLaporan());
    else if (hasil.galat?.[0]) window.alert(hasil.galat[0]);
  }, []);

  const laporkanHoaks = useCallback((id) => {
    if (!window.confirm('Laporkan ini sebagai hoaks / tidak pantas?')) return;
    const hasil = flagLaporan(id);
    if (hasil.ok) setLaporan(muatLaporan());
    else if (hasil.galat?.[0]) window.alert(hasil.galat[0]);
  }, []);

  // Saring kota saat zoom jauh: tampilkan 60 hub + kota aktif via lookup Map.
  const kotaTerpampang = useMemo(() => {
    if (angkaZoom > 6) return INDONESIA_CITIES;
    const rintisan = INDONESIA_CITIES.slice(0, 60);
    const sedangAktif = indeksKota.get(namaAktif);
    if (sedangAktif && !rintisan.some((k) => k.name === namaAktif)) return [...rintisan, sedangAktif];
    return rintisan;
  }, [angkaZoom, namaAktif, indeksKota]);

  const jumlahGempa = Array.isArray(earthquakes) ? earthquakes.length : 0;
  const jumlahApi = Array.isArray(hotspots) ? hotspots.length : 0;
  // Dasar tampil (cap 200 terbaru) — memo agar grup tidak dihitung ulang tiap render.
  const laporanDasar = useMemo(() => (
    saringKategori === 'semua'
      ? laporan
      : laporan.filter((l) => l.kategori === saringKategori)
  ).slice(0, 200), [laporan, saringKategori]); // cap performa: 200 terbaru (muatLaporan sudah terurut)

  // Grup anti-tindih per zoom; zoom nasional (<=5) hanya tampilkan grup berisi >1.
  const grupLapor = useMemo(
    () => kelompokkanLaporan(laporanDasar, angkaZoom),
    [laporanDasar, angkaZoom]
  );
  const grupTampil = angkaZoom > 5
    ? grupLapor
    : grupLapor.filter((g) => g.items.length > 1 || g.items.some((i) => i.id === pinBaruId));

  return (
    <div className="flat-card" style={{ padding: '1.4rem', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h3 style={{ fontSize: '1.08rem', fontWeight: '800', margin: 0, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>{kamus.mapTitle}</h3>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: '3px 0 0 0', fontWeight: '500' }}>{kamus.mapSubtitle}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <PilLapisan menyala={lapisGempa} warnaMenyala="#b91c1c" Simbol={IkonGempa} teks={`Gempa (${jumlahGempa})`} ketuk={() => setLapisGempa((v) => !v)} />
          <PilLapisan menyala={lapisGunung} warnaMenyala="#c2410c" Simbol={IkonGunung} teks={`Gunung Api (${INDONESIA_VOLCANOES.length})`} ketuk={() => setLapisGunung((v) => !v)} />
          <PilLapisan menyala={lapisApi} warnaMenyala={PALET_JAGAKOTA.apiBara} Simbol={IkonApi} teks={`Titik Panas (${jumlahApi})`} ketuk={() => setLapisApi((v) => !v)} />
          <PilLapisan menyala={lapisKota} warnaMenyala={PALET_JAGAKOTA.pinKota} Simbol={IkonPin} teks={`Kota (${kotaTerpampang.length})`} ketuk={() => setLapisKota((v) => !v)} />
          <PilLapisan menyala={lapisLapor} warnaMenyala="#059669" Simbol={IkonWarga} teks={saringKategori === 'semua' ? `Lapor Warga (${laporan.length})` : `Lapor Warga (${laporanDasar.length}/${laporan.length})`} ketuk={() => { if (lapisLapor) setSaringKategori('semua'); setLapisLapor((v) => !v); }} />
        </div>
      </div>
      {lapisLapor && (
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginBottom: '0.8rem', paddingBottom: '2px' }}>
          {[{ id: 'semua', label: 'Semua' }, ...KATEGORI_LAPOR].map((k) => {
            const aktif = saringKategori === k.id;
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => setSaringKategori(k.id)}
                aria-pressed={aktif}
                style={{
                  flexShrink: 0,
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  backgroundColor: aktif ? '#059669' : 'var(--bg-muted)',
                  color: aktif ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--border-flat)',
                }}
              >
                {k.label}
              </button>
            );
          })}
          {onOpenDaftar && (
            <button
              type="button"
              onClick={onOpenDaftar}
              style={{
                flexShrink: 0,
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '0.7rem',
                fontWeight: '800',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-card)',
                color: '#059669',
                border: '1px dashed #059669',
              }}
            >
              ☰ Daftar Laporan
            </button>
          )}
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 0, isolation: 'isolate', width: '100%', height: '440px', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border-flat)' }}>
        <MapContainer
          key="jagakota-nusantara"
          center={bidikPeta.pusat}
          zoom={8}
          minZoom={4}
          maxZoom={19}
          scrollWheelZoom
          doubleClickZoom
          touchZoom
          zoomControl={false}
          preferCanvas
          style={{ width: '100%', height: '100%' }}
        >
          <PenyelarasPeta bidikan={bidikPeta} kabariZoom={setAngkaZoom} />
          <PanelNavigasi labelKota={namaAktif} melompatNusantara={lompatNusantara} melompatKota={lompatKotaAktif} />
          {sorotAwal && <PembukaPopupLapor lapor={sorotAwal} />}

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            subdomains={['a', 'b', 'c']}
            maxZoom={19}
          />

          {/* URUTAN LAPIS DIBALIK: gempa dulu, lalu gunung, titik api, kota, halo lokasi terakhir */}
          {lapisGempa &&
            Array.isArray(earthquakes) &&
            earthquakes.map((gempa, urut) => {
              if (!gempa?.lat || !gempa?.lon) return null;
              const warna = tentukanWarnaGempa(gempa.magnitude);
              return (
                <Circle
                  key={gempa.id || `g-${urut}`}
                  center={[gempa.lat, gempa.lon]}
                  radius={hitungRadiusGempa(gempa.magnitude)}
                  pathOptions={{ color: warna, fillColor: warna, fillOpacity: 0.38, weight: 1.6, dashArray: '6 3' }}
                >
                  <Popup>
                    <div style={gayaPopup}>
                      <span style={{ fontWeight: '800', color: warna, fontSize: '0.95rem', display: 'block' }}>Gempa M {gempa.magnitude}</span>
                      <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#111827', fontWeight: '600' }}>{gempa.wilayah}</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.7rem', color: '#6b7280' }}>
                        {gempa.date} {gempa.time} • Dalam {gempa.depth}
                      </p>
                      {gempa.potensi && (
                        <span style={{ display: 'inline-block', marginTop: '5px', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '6px', backgroundColor: '#fef2f2', color: '#b91c1c', fontWeight: '700' }}>
                          {gempa.potensi}
                        </span>
                      )}
                    </div>
                  </Popup>
                </Circle>
              );
            })}

          {lapisGunung &&
            INDONESIA_VOLCANOES.map((gunung) => {
              const jenjang = VOLCANO_STATUS_LEVELS[gunung.statusLevel] || VOLCANO_STATUS_LEVELS[1];
              return (
                <Circle
                  key={gunung.id}
                  center={[gunung.lat, gunung.lon]}
                  radius={(gunung.dangerRadiusKm || 3) * 1000 + 800}
                  pathOptions={{ color: jenjang.color, fillColor: jenjang.color, fillOpacity: 0.32, weight: 1.6, dashArray: '8 4' }}
                >
                  <Popup>
                    <div style={{ padding: '5px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <IkonGunung size={16} color={jenjang.color} />
                        <strong style={{ fontSize: '0.95rem', color: '#111827' }}>{gunung.name}</strong>
                      </div>
                      <span style={{ display: 'inline-block', margin: '5px 0', padding: '3px 8px', borderRadius: '9999px', backgroundColor: jenjang.color, color: '#fff', fontSize: '0.7rem', fontWeight: '800' }}>
                        {jenjang.code} • {jenjang.name}
                      </span>
                      <p style={{ margin: '2px 0', fontSize: '0.75rem', color: '#4b5563', fontWeight: '600' }}>
                        {gunung.elevation} mdpl • {gunung.province}
                      </p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.7rem', color: '#6b7280' }}>Zona steril ±{gunung.dangerRadiusKm} km</p>
                    </div>
                  </Popup>
                </Circle>
              );
            })}

          {lapisApi &&
            Array.isArray(hotspots) &&
            hotspots.map((titik) => {
              if (!titik?.lat || !titik?.lon) return null;
              return (
                <Circle
                  key={titik.id}
                  center={[titik.lat, titik.lon]}
                  radius={12500}
                  pathOptions={{ color: PALET_JAGAKOTA.apiMenyala, fillColor: PALET_JAGAKOTA.apiBara, fillOpacity: 0.3, weight: 1.4 }}
                >
                  <Marker position={[titik.lat, titik.lon]} icon={penandaApi}>
                    <Popup>
                      <div style={gayaPopup}>
                        <span style={{ fontSize: '0.93rem', fontWeight: '800', color: '#111827' }}>{titik.regency}</span>
                        <span style={{ display: 'inline-block', margin: '5px 0', padding: '3px 8px', borderRadius: '9999px', backgroundColor: '#ffedd5', color: PALET_JAGAKOTA.apiBara, fontSize: '0.7rem', fontWeight: '800' }}>
                          {titik.satellite} • {titik.confidence}
                        </span>
                        <p style={{ margin: '2px 0', fontSize: '0.75rem', color: '#4b5563', fontWeight: '600' }}>
                          {titik.province} • {titik.type}
                        </p>
                        <p style={{ margin: '2px 0 7px 0', fontSize: '0.7rem', color: '#6b7280' }}>
                          {titik.brightnessK} K • {titik.frpMw} MW
                        </p>
                        <button onClick={() => arahKeTitikApi(titik)} style={gayaTombolPopup(PALET_JAGAKOTA.apiBara)}>
                          Dekati Titik Ini
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                </Circle>
              );
            })}

          {lapisKota &&
            kotaTerpampang.map((kota) => {
              const sedangDipilih = kota.name === namaAktif;
              return (
                <Marker
                  key={kota.name}
                  position={[kota.lat, kota.lon]}
                  icon={sedangDipilih ? penandaKotaAktif : penandaKota}
                  eventHandlers={{ click: () => pilihKotaLaluTerbang(kota) }}
                >
                  <Popup>
                    <div style={gayaPopup}>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>{kota.name}</strong>
                      <p style={{ margin: '3px 0 0 0', fontSize: '0.75rem', color: '#475569' }}>{kota.province}</p>
                      <p style={{ margin: '2px 0 7px 0', fontSize: '0.7rem', color: '#94a3b8' }}>{tulisKoordinat(kota.lat, kota.lon)}</p>
                      <button onClick={() => pilihKotaLaluTerbang(kota)} style={gayaTombolPopup(PALET_JAGAKOTA.pinKota)}>
                        Pantau Kota Ini
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* LAPOR WARGA: pin kecil per laporan; yang bertumpuk digabung 1 pin + daftar. */}
          {lapisLapor &&
            grupTampil.map((grup, gi) => {
              if (grup.items.length === 1) {
                const lapor = grup.items[0];
                if (!Number.isFinite(lapor?.lat) || !Number.isFinite(lapor?.lon)) return null;
                const kat = PETA_KATEGORI_LAPOR[lapor.kategori];
                if (!kat) return null;
                return (
                <Marker
                  key={lapor.id}
                  position={[lapor.lat, lapor.lon]}
                  icon={ikonPinLapor(kat.warna, { baru: lapor.id === pinBaruId })}
                >
                  <Popup>
                    <div style={gayaPopup}>
                      <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '9999px', backgroundColor: kat.warna, color: '#fff', fontSize: '0.7rem', fontWeight: '800' }}>
                        {kat.label}
                      </span>
                      <span style={{ display: 'inline-block', marginLeft: '4px', padding: '3px 8px', borderRadius: '9999px', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.68rem', fontWeight: '800' }}>
                        WARGA • belum verifikasi
                      </span>
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#111827', fontWeight: '600' }}>{lapor.deskripsi}</p>
                      {lapor.foto && (
                        <a
                          href={lapor.foto}
                          target="_blank"
                          rel="noreferrer"
                          title="Buka foto ukuran penuh di tab baru"
                        >
                          <img
                            src={lapor.foto}
                            alt={`Foto ${kat.label}`}
                            loading="lazy"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px', marginTop: '6px' }}
                          />
                        </a>
                      )}
                      <p title={new Date(lapor.createdAt).toLocaleString('id-ID')} style={{ margin: '3px 0 0 0', fontSize: '0.7rem', color: '#6b7280' }}>
                        {lapor.kota ? `${lapor.kota} • ` : ''}{waktuRelatif(lapor.createdAt)}
                        {lapor.nama ? ` • oleh ${lapor.nama}` : ''}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                        <button
                          onClick={() => dukung(lapor.id)}
                          disabled={sudahDukung(lapor.id)}
                          style={{ ...gayaTombolPopup('#059669'), width: 'auto', flex: 1, opacity: sudahDukung(lapor.id) ? 0.6 : 1 }}
                        >
                          👍 {sudahDukung(lapor.id) ? 'Didukung' : 'Dukung'} • {lapor.dukung || 0}
                        </button>
                        <button
                          onClick={() => laporkanHoaks(lapor.id)}
                          disabled={sudahFlag(lapor.id)}
                          title="Laporkan sebagai hoaks"
                          style={{ ...gayaTombolPopup('#b45309'), width: 'auto', opacity: sudahFlag(lapor.id) ? 0.6 : 1 }}
                        >
                          {sudahFlag(lapor.id) ? '🚩 Dilaporkan' : '🚩 Hoaks?'}
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
                );
              }
              // Grup: satu pin angka berisi daftar maksimal 5 laporan.
              const kat0 = PETA_KATEGORI_LAPOR[grup.items[0].kategori] || {};
              const n = grup.items.length;
              return (
                <Marker
                  key={`grup-${grup.kunci}-${grup.items[0].id}`}
                  position={[grup.lat, grup.lon]}
                  icon={ikonPinLapor(kat0.warna || '#059669', { gabung: n, baru: grup.items.some((i) => i.id === pinBaruId) })}
                >
                  <Popup>
                    <div style={{ ...gayaPopup, textAlign: 'left', minWidth: '210px', maxWidth: '250px' }}>
                      <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                        {n} laporan warga di sini
                      </strong>
                      {grup.items.slice(0, 5).map((l) => {
                        const k = PETA_KATEGORI_LAPOR[l.kategori] || {};
                        return (
                          <div key={l.id} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '6px' }}>
                            <span style={{ flexShrink: 0, width: '10px', height: '10px', borderRadius: '9999px', backgroundColor: k.warna || '#6b7280', marginTop: '3px' }} />
                            <div style={{ minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: '800', color: '#111827' }}>
                                {k.label || l.kategori} • {waktuRelatif(l.createdAt)}
                              </p>
                              <p style={{ margin: 0, fontSize: '0.72rem', color: '#4b5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                                {l.deskripsi}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {n > 5 && (
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.7rem', color: '#6b7280' }}>
                          +{n - 5} lainnya — buka Daftar Laporan.
                        </p>
                      )}
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.68rem', color: '#94a3b8' }}>
                        Perbesar peta untuk memisahkan pin.
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {currentLocation?.lat && currentLocation?.lon && (
            <>
              <Circle
                center={[currentLocation.lat, currentLocation.lon]}
                radius={18000}
                pathOptions={{ color: PALET_JAGAKOTA.haloLuar, fillColor: PALET_JAGAKOTA.haloLuar, fillOpacity: 0.14, weight: 1.6, dashArray: '5 5' }}
                interactive={false}
              />
              <Circle
                center={[currentLocation.lat, currentLocation.lon]}
                radius={5500}
                pathOptions={{ color: PALET_JAGAKOTA.haloDalam, fillColor: PALET_JAGAKOTA.haloDalam, fillOpacity: 0.42, weight: 2 }}
                interactive={false}
              />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
