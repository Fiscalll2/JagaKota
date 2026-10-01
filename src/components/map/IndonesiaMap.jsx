import { useCallback, useEffect, useMemo, useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { INDONESIA_CITIES } from '../../utils/cities';
import { INDONESIA_VOLCANOES, VOLCANO_STATUS_LEVELS } from '../../utils/volcanoes';
import { SATELLITE_HOTSPOTS } from '../../utils/karhutla';
import { translations } from '../../utils/i18n';
import { Activity as IkonGempa, Compass as IkonKompas, Flame as IkonApi, MapPin as IkonPin, Mountain as IkonGunung, ZoomIn as IkonPlus, ZoomOut as IkonMinus } from 'lucide-react';

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

export function IndonesiaMap({ currentLocation, earthquakes, hotspots = SATELLITE_HOTSPOTS, onSelectCity }) {
  const kamus = translations;
  const namaAktif = petikNamaKotaAktif(currentLocation);

  const [lapisKota, setLapisKota] = useState(true);
  const [lapisGunung, setLapisGunung] = useState(true);
  const [lapisApi, setLapisApi] = useState(true);
  const [lapisGempa, setLapisGempa] = useState(true);
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
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '440px', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border-flat)' }}>
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

          {currentLocation?.lat && currentLocation?.lon && (
            <>
              <Circle
                center={[currentLocation.lat, currentLocation.lon]}
                radius={18000}
                pathOptions={{ color: PALET_JAGAKOTA.haloLuar, fillColor: PALET_JAGAKOTA.haloLuar, fillOpacity: 0.14, weight: 1.6, dashArray: '5 5' }}
              />
              <Circle
                center={[currentLocation.lat, currentLocation.lon]}
                radius={5500}
                pathOptions={{ color: PALET_JAGAKOTA.haloDalam, fillColor: PALET_JAGAKOTA.haloDalam, fillOpacity: 0.42, weight: 2 }}
              />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
