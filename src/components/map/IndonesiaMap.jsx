import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { INDONESIA_CITIES } from '../../utils/cities';
import { laporanPublik, PETA_KATEGORI_LAPOR, KATEGORI_LAPOR, waktuRelatif, escapeHtml, labelStatus } from '../../utils/lapor';
import { INDONESIA_VOLCANOES, VOLCANO_STATUS_LEVELS } from '../../utils/volcanoes';
import { SATELLITE_HOTSPOTS } from '../../utils/karhutla';
import { translations } from '../../utils/i18n';
import { Activity as IkonGempa, Compass as IkonKompas, Flame as IkonApi, MapPin as IkonPin, Mountain as IkonGunung, Users as IkonWarga, ZoomIn as IkonPlus, ZoomOut as IkonMinus, X as IkonTutup } from 'lucide-react';

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

function petikNamaKotaAktif(lokasi) {
  return lokasi?.city || lokasi?.name || lokasi?.kota || '';
}

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

const KUNCI_POS_NAV = 'jagakota-mapnav-pos';
const MARGIN_NAV = 12;
const DIAMETER_FAB = 46;

function bacaPosNav() {
  try {
    const p = JSON.parse(localStorage.getItem(KUNCI_POS_NAV));
    if (p && p.fx >= 0 && p.fx <= 1 && p.fy >= 0 && p.fy <= 1) return p;
  } catch {}
  return { fx: 1, fy: 0 };
}

function PanelNavigasi({ labelKota, melompatNusantara, melompatKota }) {
  const peta = useMap();
  const [buka, setBuka] = useState(false);
  const [pos, setPos] = useState(bacaPosNav);
  const wadahRef = useRef(null);
  const seretRef = useRef(null);

  const zonaPeta = useCallback(() => {
    const wadah = wadahRef.current;
    const petaEl = wadah?.closest?.('.leaflet-container');
    if (!wadah || !petaEl) return null;
    const opEl = wadah.offsetParent || petaEl;
    const rPeta = petaEl.getBoundingClientRect();
    const rOp = opEl.getBoundingClientRect();
    return {
      el: petaEl,
      dx: rPeta.left - rOp.left,
      dy: rPeta.top - rOp.top,
      lebar: petaEl.clientWidth || rPeta.width || 400,
      tinggi: petaEl.clientHeight || rPeta.height || 400,
    };
  }, []);
  const [bingkai, setBingkai] = useState({ dx: 0, dy: 0, lebar: 400, tinggi: 400 });

  const selaraskanBingkai = useCallback(() => {
    const z = zonaPeta();
    if (z) setBingkai({ dx: z.dx, dy: z.dy, lebar: z.lebar, tinggi: z.tinggi });
    return z;
  }, [zonaPeta]);

  useMapEvents({
    dragstart: () => setBuka(false),
  });

  useEffect(() => {
    if (!buka) return;
    const tutup = (e) => { if (e.key === 'Escape') setBuka(false); };
    window.addEventListener('keydown', tutup);
    return () => window.removeEventListener('keydown', tutup);
  }, [buka]);

  useEffect(() => {
    const awal = zonaPeta();
    if (!awal) return;
    setBingkai({ dx: awal.dx, dy: awal.dy, lebar: awal.lebar, tinggi: awal.tinggi });
    if (typeof ResizeObserver === 'undefined') return;
    const catat = () => { selaraskanBingkai(); };
    const amati = new ResizeObserver(catat);
    amati.observe(awal.el);
    return () => amati.disconnect();
  }, [zonaPeta, selaraskanBingkai]);

  const terapkanPos = useCallback((fx, fy) => {
    const p = {
      fx: Math.min(1, Math.max(0, fx)),
      fy: Math.min(1, Math.max(0, fy)),
    };
    setPos(p);
    try { localStorage.setItem(KUNCI_POS_NAV, JSON.stringify(p)); } catch {}
  }, []);

  const mulaiSeret = (e) => {
    const zona = selaraskanBingkai() || zonaPeta();
    if (!zona) return;
    e.preventDefault();
    peta.dragging.disable();
    seretRef.current = {
      lebarJalan: Math.max(1, zona.lebar - DIAMETER_FAB - MARGIN_NAV * 2),
      tinggiJalan: Math.max(1, zona.tinggi - DIAMETER_FAB - MARGIN_NAV * 2),
      x0: e.clientX, y0: e.clientY, fx0: pos.fx, fy0: pos.fy, bergerak: false,
    };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };

  const jalanSeret = (e) => {
    const s = seretRef.current;
    if (!s) return;
    const dx = e.clientX - s.x0;
    const dy = e.clientY - s.y0;
    if (!s.bergerak && Math.hypot(dx, dy) < 7) return;
    s.bergerak = true;
    terapkanPos(s.fx0 + dx / s.lebarJalan, s.fy0 + dy / s.tinggiJalan);
  };

  const lepasSeret = () => {
    const s = seretRef.current;
    seretRef.current = null;
    peta.dragging.enable();
    if (s && !s.bergerak) setBuka((v) => !v);
  };

  const lingkaran = {
    width: '42px',
    height: '42px',
    borderRadius: '9999px',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-main)',
    border: '1px solid var(--border-flat)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.16)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };
  const labelPil = {
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-main)',
    border: '1px solid var(--border-flat)',
    borderRadius: '9999px',
    padding: '4px 10px',
    marginRight: '8px',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
  };

  const aksi = [
    { id: 'in', label: 'Perbesar', Ikon: IkonPlus, jalan: () => peta.zoomIn(), tutup: false },
    { id: 'out', label: 'Perkecil', Ikon: IkonMinus, jalan: () => peta.zoomOut(), tutup: false },
    { id: 'kota', label: labelKota ? `Kota: ${labelKota}` : 'Kota aktif', Ikon: IkonPin, jalan: melompatKota, tutup: true, warna: PALET_JAGAKOTA.tombolAksen },
    { id: 'nusantara', label: 'Nusantara', Ikon: IkonKompas, jalan: melompatNusantara, tutup: true },
  ];

  const jalanLebar = Math.max(0, bingkai.lebar - DIAMETER_FAB - MARGIN_NAV * 2);
  const jalanTinggi = Math.max(0, bingkai.tinggi - DIAMETER_FAB - MARGIN_NAV * 2);
  const kiriPx = bingkai.dx + MARGIN_NAV + pos.fx * jalanLebar;
  const atasPx = bingkai.dy + MARGIN_NAV + pos.fy * jalanTinggi;
  const keBawah = atasPx < 260;

  const labelKanan = pos.fx < 0.35;
  const labelGaya = {
    ...labelPil,
    marginRight: labelKanan ? 0 : '8px',
    marginLeft: labelKanan ? '8px' : 0,
  };

  const barisAksi = aksi.map((a, i) => {
    const tombol = (
      <button
        onClick={() => { a.jalan(); if (a.tutup) setBuka(false); }}
        title={a.label}
        aria-label={a.label}
        tabIndex={buka ? 0 : -1}
        style={{ ...lingkaran, color: a.warna || 'var(--text-main)' }}
      >
        <a.Ikon size={17} />
      </button>
    );
    const label = <span style={labelGaya}>{a.label}</span>;
    return (
      <div
        key={a.id}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: labelKanan ? 'flex-start' : 'flex-end',
          opacity: buka ? 1 : 0,
          transform: buka ? 'translateY(0) scale(1)' : `translateY(${keBawah ? '-' : ''}10px) scale(0.85)`,
          transition: 'opacity 160ms ease, transform 160ms ease',
          transitionDelay: buka ? `${i * 35}ms` : '0ms',
          pointerEvents: buka ? 'auto' : 'none',
        }}
      >
        {labelKanan ? (<>{tombol}{label}</>) : (<>{label}{tombol}</>)}
      </div>
    );
  });

  const tombolFab = (
    <button
      type="button"
      onPointerDown={mulaiSeret}
      onPointerMove={jalanSeret}
      onPointerUp={lepasSeret}
      onPointerCancel={lepasSeret}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setBuka((v) => !v); } }}
      title="Geser untuk pindah, ketuk untuk buka navigasi peta"
      aria-label={buka ? 'Tutup navigasi peta' : 'Buka navigasi peta'}
      aria-expanded={buka}
      style={{
        ...lingkaran,
        width: `${DIAMETER_FAB}px`,
        height: `${DIAMETER_FAB}px`,
        backgroundColor: PALET_JAGAKOTA.pinKotaAktif,
        borderColor: PALET_JAGAKOTA.pinKotaAktif,
        color: '#fff',
        boxShadow: '0 6px 18px rgba(13,148,136,0.4)',
        touchAction: 'none',
        cursor: 'grab',
      }}
    >
      <span style={{ display: 'flex', transform: buka ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 180ms ease' }}>
        {buka ? <IkonTutup size={20} /> : <IkonKompas size={20} />}
      </span>
    </button>
  );

  const lapisanAksi = (
    <div
      aria-hidden={!buka}
      style={{
        position: 'absolute',
        ...(keBawah ? { top: `${DIAMETER_FAB + 8}px`, bottom: 'auto' } : { bottom: `${DIAMETER_FAB + 8}px`, top: 'auto' }),
        ...(labelKanan ? { left: 0, right: 'auto' } : { right: 0, left: 'auto' }),
        display: 'flex',
        flexDirection: 'column',
        alignItems: labelKanan ? 'flex-start' : 'flex-end',
        gap: '8px',
      }}
    >
      {barisAksi}
    </div>
  );

  return (
    <div ref={wadahRef} style={{ position: 'absolute', left: `${kiriPx}px`, top: `${atasPx}px`, zIndex: 1000, width: `${DIAMETER_FAB}px`, height: `${DIAMETER_FAB}px` }}>
      {tombolFab}
      {lapisanAksi}
    </div>
  );
}

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

function PembukaPopupLapor({ lapor }) {
  const peta = useMap();

  useEffect(() => {
    if (!lapor || !Number.isFinite(lapor.lat) || !Number.isFinite(lapor.lon)) return;
    const kat = PETA_KATEGORI_LAPOR[lapor.kategori] || {};

    const fotoOk = typeof lapor.foto === 'string' && (/^data:image\/(jpeg|png|webp);base64,/.test(lapor.foto) || lapor.foto.startsWith('https://'));
    const foto = fotoOk
      ? `<a href="${lapor.foto}" target="_blank" rel="noreferrer" title="Buka foto ukuran penuh di tab baru"><img src="${lapor.foto}" alt="" style="width:100%;max-height:160px;object-fit:cover;border-radius:8px;margin-top:6px" /></a>`
      : '';
    const badge = labelStatus(lapor.status);
    const html = `
      <div style="padding:6px;text-align:center;font-family:'Plus Jakarta Sans',sans-serif">
        <span style="display:inline-block;padding:3px 8px;border-radius:9999px;background:${escapeHtml(kat.warna || '#6b7280')};color:#fff;font-size:11px;font-weight:800">${escapeHtml(kat.label || lapor.kategori)}</span>
        <span style="display:inline-block;margin-left:4px;padding:3px 8px;border-radius:9999px;background:${badge.bg};color:${badge.warna};font-size:11px;font-weight:800">${escapeHtml(badge.label.toUpperCase())}</span>
        ${lapor.kode ? `<span style="display:inline-block;margin-left:4px;padding:3px 8px;border-radius:9999px;background:#f1f5f9;color:#475569;font-size:11px;font-weight:800;font-family:monospace">${escapeHtml(lapor.kode)}</span>` : ''}
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
  const [laporan, setLaporan] = useState(() => laporanPublik());
  const [pinBaruId, setPinBaruId] = useState(null);
  const timerPinBaru = useRef(null);
  const [angkaZoom, setAngkaZoom] = useState(8);

  const [bidikPeta, setBidikPeta] = useState(() => ({
    pusat: [currentLocation?.lat || TITIK_TENGAH_NUSANTARA[0], currentLocation?.lon || TITIK_TENGAH_NUSANTARA[1]],
    tingkat: 8,
  }));

  const indeksKota = useMemo(() => bangunIndeksKota(INDONESIA_CITIES), []);

  useEffect(() => {
    if (currentLocation?.lat && currentLocation?.lon) {
      setBidikPeta({ pusat: [currentLocation.lat, currentLocation.lon], tingkat: 10 });
    }
  }, [currentLocation?.lat, currentLocation?.lon]);

  useEffect(() => {
    const muatUlang = (e) => {
      const daftar = laporanPublik();
      setLaporan(daftar);

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
    window.addEventListener('jagakota:lapor-status', muatUlang);
    return () => {
      window.removeEventListener('jagakota:lapor-baru', muatUlang);
      window.removeEventListener('jagakota:lapor-status', muatUlang);
      if (timerPinBaru.current) clearTimeout(timerPinBaru.current);
    };
  }, []);

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

  const kotaTerpampang = useMemo(() => {
    if (angkaZoom > 6) return INDONESIA_CITIES;
    const rintisan = INDONESIA_CITIES.slice(0, 60);
    const sedangAktif = indeksKota.get(namaAktif);
    if (sedangAktif && !rintisan.some((k) => k.name === namaAktif)) return [...rintisan, sedangAktif];
    return rintisan;
  }, [angkaZoom, namaAktif, indeksKota]);

  const jumlahGempa = Array.isArray(earthquakes) ? earthquakes.length : 0;
  const jumlahApi = Array.isArray(hotspots) ? hotspots.length : 0;

  const laporanDasar = useMemo(() => (
    saringKategori === 'semua'
      ? laporan
      : laporan.filter((l) => l.kategori === saringKategori)
  ).slice(0, 200), [laporan, saringKategori]);

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

          {lapisLapor &&
            grupTampil.map((grup, gi) => {
              if (grup.items.length === 1) {
                const lapor = grup.items[0];
                if (!Number.isFinite(lapor?.lat) || !Number.isFinite(lapor?.lon)) return null;
                const kat = PETA_KATEGORI_LAPOR[lapor.kategori];
                if (!kat) return null;

                const fotoOk = typeof lapor.foto === 'string' && (/^data:image\/(jpeg|png|webp);base64,/.test(lapor.foto) || lapor.foto.startsWith('https://'));
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
                      <span style={{ display: 'inline-block', marginLeft: '4px', padding: '3px 8px', borderRadius: '9999px', backgroundColor: labelStatus(lapor.status).bg, color: labelStatus(lapor.status).warna, fontSize: '0.68rem', fontWeight: '800' }}>
                        {labelStatus(lapor.status).label.toUpperCase()}
                      </span>
                      {lapor.kode && (
                        <span style={{ display: 'inline-block', marginLeft: '4px', padding: '3px 8px', borderRadius: '9999px', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.68rem', fontWeight: '800', fontFamily: 'monospace' }}>
                          {lapor.kode}
                        </span>
                      )}
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#111827', fontWeight: '600' }}>{lapor.deskripsi}</p>
                      {fotoOk && lapor.foto && (
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
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.68rem', color: '#94a3b8' }}>
                        Terverifikasi petugas • sengketa? Hubungi kanal resmi.
                      </p>
                    </div>
                  </Popup>
                </Marker>
                );
              }

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
