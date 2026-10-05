# Arsitektur Sistem JagaKota

> JagaKota — dasbor civic real-time: skor KotaSiaga, kualitas udara bahasa warga, cuaca, gempa, gunung api, karhutla, dan panduan darurat 112. SPA offline-first tanpa backend sendiri.

- Frontend: React 19 + Vite 8 + Tailwind 4 + React-Leaflet + Recharts
- Data: `src/hooks/useDashboardData.js` sebagai orkestrator tunggal
- Cache: `src/utils/apiCache.js` (`apiCache` / `jagaStore`) + `public/sw.js`
- Edge: `api/widget.js`, `api/badge.js`, `api/og.jsx` di Vercel Edge Runtime
- Deploy: Vercel static + `vercel.json` headers/CSP/rewrite SPA

## 1. Konteks Sistem (C4 Level 1)

```mermaid
flowchart TB
    U[Pengguna: warga via browser HP/Desktop + PWA] --> JK[JagaKota SPA di Vercel]
    JK --> BMKG[BMKG InaTEWS: autogempa + gempaterkini]
    JK --> OM[Open-Meteo: Forecast + Air Quality]
    JK --> FIRMS[NASA FIRMS VIIRS + KLHK SiPongi konsep]
    JK --> OSM[OpenStreetMap tiles]
    JK --> PVMBG[PVMBG MAGMA: katalog lokal di utils/volcanoes.js]
    JK --> EDGE[Vercel Edge: widget + badge + OG]
    EDGE --> OM
    U --> WA[Share: WhatsApp/IG Story via canvas + OG image + badge SVG]
```

Sumber resmi terdaftar satu pintu di `src/utils/sources.js`: BMKG, PVMBG Magma, NASA FIRMS, KLHK SiPongi+, Open-Meteo.

## 2. Kontainer dan Deployment

```mermaid
flowchart TB
    subgraph Browser[Browser Client - PWA]
        SHELL[AppShell: sidebar + drawer + topbar]
        PAGES[Sections: Ringkasan + Udara + Siaga + Peta + Panduan]
        SW[Service Worker sw.js]
        LS[(localStorage jk: + CacheStorage)]
    end
    subgraph Vercel[Vercel]
        STATIC[Static dist dari vite build]
        EDGE_API[Edge Functions: api/widget.js + api/badge.js + api/og.jsx]
    end
    subgraph Eksternal[API Publik Tanpa Kunci]
        BMKG_API[data.bmkg.go.id]
        OM_FC[api.open-meteo.com]
        OM_AQ[air-quality-api.open-meteo.com]
        OSM_TILES[tile.openstreetmap.org]
        FIRMS_API[firms.modaps.eosdis.nasa.gov - opsional live]
    end
    U2[User] --> STATIC
    STATIC --> SHELL
    SHELL --> PAGES
    PAGES <--> SW
    SW <--> LS
    PAGES --> BMKG_API
    PAGES --> OM_FC
    PAGES --> OM_AQ
    PAGES --> OSM_TILES
    PAGES -.-> FIRMS_API
    U2 --> EDGE_API
    EDGE_API --> OM_FC
    EDGE_API --> OM_AQ
```

Detail deploy:

- `vite.config.js`: `manualChunks` memisah `vendor-leaflet`, `vendor-recharts`, `vendor-icons`, `vendor-react`.
- `vercel.json`: header keamanan `CSP`, `Permissions-Policy`, cache `assets/* immutable 1th`, `api/* max-age 120 s-maxage 600`, `sw.js + manifest` no-cache, rewrite SPA `/(api excluded) -> /index.html`.
- `index.html`: `dns-prefetch + preconnect` ke fonts, Open-Meteo, BMKG, OSM; OG tags menunjuk `/api/og`.
- `public/manifest.webmanifest`: standalone, icons 192/512 + maskable, widget `jagakota-widget -> /api/widget`.
- `public/sw.js`: install precache `/ + index.html + icons + manifest`; fetch: navigasi network-first fallback `index.html`, OSM tiles network-first, BMKG/Open-Meteo network-first, JS/CSS cache-first.

## 3. Komponen Frontend

```mermaid
flowchart TB
    MAIN[src/main.jsx: ErrorBoundary + register sw.js] --> APP[src/App.jsx: state kota + modal + banner + toast]
    APP --> SHELL_C[components/shell/AppShell.jsx + navigation.js]
    APP --> HOOK[hooks/useDashboardData.js: useDataJaga]
    APP --> GEO[hooks/useGeolocation.js]
    APP --> PWA_H[hooks/usePwaInstall.js + hooks/useDarkMode.js]
    HOOK --> SVC_W[services/weather.js]
    HOOK --> SVC_AQ[services/airQuality.js]
    HOOK --> SVC_Q[services/bmkg.js]
    HOOK --> SVC_F[services/karhutla.js + services/volcano.js]
    SVC_W --> C1[utils/apiCache.js]
    SVC_AQ --> C1
    SVC_Q --> C1
    SVC_F --> C1
    APP --> SKOR[utils/kotaScore.js: calculateKotaSiaga]
    APP --> CARDS[cards: EcoHealth + Aqi + Weather + Uv + Kimia + Earthquake + Volcano + Karhutla]
    APP --> CHARTS[charts: AqiChart + WeatherForecastChart - Recharts]
    APP --> MAP[map/IndonesiaMap.jsx - Leaflet: kota + gunung + hotspot + lingkaran gempa]
    APP --> MODALS[common: CitySearch + ShareCard + EmergencyGuide + Lapor + DaftarLapor + EmbedWidget + InstallGuide + TickerBar + Footer]
    APP --> EMBED[embed/WidgetEmbedView.jsx: mode ?embed=true]
```

Pemetaan file penting:

| Lapisan | File | Peran |
|---|---|---|
| Orkestrasi | `src/hooks/useDashboardData.js` | `muatKota`, `muatGempa`, `segarkanManual`, fast-path cache lalu revalidate |
| Cuaca | `src/services/weather.js` | fetch Open-Meteo, `calibrateWeatherCode`, fallback `getDefaultWeather` |
| Udara | `src/services/airQuality.js` | fetch Air Quality API, fallback `getDefaultAqi` |
| Gempa | `src/services/bmkg.js` | `autogempa.json` + `gempaterkini.json`, timeout 6s, fallback statis |
| Api darat | `src/services/karhutla.js`, `src/services/volcano.js` | FDRS lokal + hotspot kurasi, radius gunung via `utils/geo.js` |
| Skor | `src/utils/kotaScore.js` | bobot udara 40 / partikel 20 / panas 25 / UV 15 + bonus hujan |
| Kota | `src/utils/cities.js` | tabel kompak `nama|prov|reg` 515 kota + slug + `cariKota` |
| Cache | `src/utils/apiCache.js`, `public/sw.js` | dua lapis: RAM Map + localStorage + CacheStorage |

## 4. Alur Data Runtime (Sequence)

```mermaid
sequenceDiagram
    participant UI as App.jsx + Cards/Map
    participant H as useDataJaga
    participant C as jagaStore apiCache
    participant W as Open-Meteo
    participant B as BMKG
    participant L as Hitung lokal: skor + FDRS + gunung
    UI->>H: lokasi berubah (GPS / pilih kota / ?city=)
    H->>C: get cuaca_{lat}_{lon} + udara_{lat}_{lon} + gempa_terkini
    alt cache hit lengkap
        C-->>H: data cepat
        H->>UI: render instan + setMemuat false
        H->>W: revalidate forceRefresh true background
        W-->>H: data segar
        H->>C: set kunci baru
        H->>UI: update + toast Data Sudah Update
    else cache miss / refresh manual
        H->>W: Promise.all fetchWeatherData + fetchAirQualityData timeout 7s
        H->>B: Promise.all autogempa + gempaterkini timeout 6s
        W-->>H: cuaca + udara atau fallback default
        B-->>H: gempa atau fallback default
        H->>L: calculateKotaSiaga + calculateFdrs + getNearbyVolcanoes + getNearbyHotspots
        H->>C: set TTL per bucket
        H->>UI: render + lastUpdated + statusSinyal footer
    end
    UI->>UI: offline? tampilkan banner Mode Offline dari cache terakhir
```

Kunci cache: `cuaca_{la}_{lo}`, `udara_{la}_{lo}`, `gempa_terkini`, `gempa_list`, `siaga_api_{la}_{lo}`, `gunung_{la}_{lo}` plus alias kompatibel `weather_*`, `aqi_*`, `bmkg_*`, `karhutla_*`, `volcano_*`.

TTL (`src/utils/apiCache.js`): `cuaca 5 mnt`, `udara 5 mnt`, `gempa 2 mnt`, default 10 mnt. Fallback quota darurat buang 15 entri `jk:` tertua saat `localStorage` penuh (bukan LRU murni). Statistik `hit/miss` tersedia di `apiCache.stats`.

## 5. Pipa Skor KotaSiaga

```mermaid
flowchart LR
    A[AQI US] --> SA[scoreAqi]
    P[PM2.5] --> SP[scorePmSpike]
    T[Suhu + Humidity] --> SH[scoreHeat tropis]
    UV[UV index] --> SU[scoreUv]
    SA --> MIX[40 + 20 + 25 + 15 = raw 0-100]
    SP --> MIX
    SH --> MIX
    SU --> MIX
    MIX --> BONUS[+4 jika rainProb >= 60 dan AQI < 100]
    BONUS --> LVL{Level: 0-24 Awas / 25-49 Siaga / 50-74 Waspada / 75-100 Aman}
    LVL --> SARAN[Saran: masker + olahraga + anak-lansia + ventilasi + paparan kretek pm25/12]
```

Implementasi: `src/utils/kotaScore.js:61 calculateKotaSiaga`. Label warga udara: Segar / Lumayan / Pengap / Pekat mengikuti ambang di `api/widget.js` dan `api/badge.js`.

## 6. Edge API dan Integrasi Warga

```mermaid
flowchart LR
    KLIEN[Klien: KWGT + Tasker + iframe + README badge + WA share] --> WID[GET /api/widget?lat=&lon=&kota=]
    KLIEN --> BDG[GET /api/badge?kota=&aqi=&suhu=]
    KLIEN --> OG[GET /api/og?kota=&aqi=&status=&suhu=&cuaca=&gempa=]
    WID --> OMF[fetch Open-Meteo forecast + air-quality 5s timeout]
    OMF --> JSON[JSON: suhu + kelembapan + angin + AQI + statusUdara + warnaUdara + pm25]
    BDG --> SVG[SVG shields: JagaKota + kota-suhu + AQI-status]
    OG --> IMG[ImageResponse 1200x630: brand + kota + kartu AQI + kartu cuaca + bar gempa]
```

- `api/widget.js`: Edge runtime, CORS `*`, cache `max-age 60 s-maxage 300`, fallback JSON statis saat fetch gagal.
- `api/badge.js`: murni sinkron tanpa fetch, escape XML, cache `max-age 60 s-maxage 300`.
- `api/og.jsx`: `@vercel/og`, query params dengan fallback Nusantara/42/Segar/30C.
- Konsumen dalam app: `WidgetEmbedView.jsx` mode `?embed=true&city=`, `EmbedWidgetModal.jsx`, `ShareCardModal.jsx` canvas 9:16, `Footer.jsx` status sinyal per sumber.

## 7. Keputusan Arsitektur dan Batasan

1. Tanpa backend sendiri: semua fetch langsung dari browser ke API publik agar bebas kunci dan murah di hosting statis. Konsekuensi: bergantung pada CORS dan rate-limit pihak ketiga.
2. Offline-first dua lapis: `jagaStore` untuk data JSON + SW `CacheStorage` untuk shell dan tiles. Data basi tetap ditampilkan jujur dengan label offline/fallback.
3. Satu hook data untuk semua layar menghindari waterfall dan duplikasi request antar kartu.
4. Komputasi berat dibuat lokal dan sinkron: skor, FDRS, jarak gunung, hotspot kurasi. Hanya FIRMS live yang opsional dan butuh `MAP_KEY`.
5. Kegagalan diisolasi per sumber: `statusSinyal` cuaca/udara/gempa/karhutla di footer; tiap service punya `getDefault*` + `try/catch` + `AbortController`.
6. Batasan diketahui: katalog gunung dan hotspot adalah kurasi statis + radius haversine, bukan streaming PVMBG/FIRMS penuh; notifikasi Web hanya polusi AQI > 150; peta butuh jaringan untuk tiles OSM.

## 8. Pipa Lapor Warga (local-first + sinkron opsional)

Lapor Warga jalan 100% lokal secara default. Cloud Supabase hanya aktif bila `VITE_LAPOR_CLOUD=true`.

```mermaid
sequenceDiagram
    participant W as Warga: LaporModal
    participant L as lapor.js + localStorage
    participant P as Petugas: PetugasModal PIN 1234
    participant M as Peta: IndonesiaMap
    W->>L: tambahLaporan kategori + bbox ID + deskripsi + telepon + foto
    L->>L: validasi + anti-spam 5mnt + kuota 10/hari + dedup 100m/1jam
    L->>W: status pending + event lapor-baru
    P->>L: antreanPetugas + cekPinPetugas
    P->>L: ubahStatus pending ke verified/rejected
    L->>M: laporanPublik verified/in_progress/resolved
    M->>M: pin peta + cluster + deep-link ?lapor=kode
```

```mermaid
sequenceDiagram
    participant A as App.jsx boot/event
    participant S as sinkron.js putaran
    participant C as Supabase reports + storage
    A->>S: sinkronAwal + event lapor-baru/status + visible/online + polling 20dt
    S->>C: tarikMasuk reports_publik 200 + reports_antrean 100
    S->>C: dorong max 20 via insert pending / rpc moderasi_laporan
    S->>C: upload foto report-photos/reports/kode/ts.jpg max 5MB
    S->>C: hapus max 5 via rpc hapus_laporan
    C-->>S: gabungCloud last-write-wins + tandaiTersinkron
    S->>A: event lapor-status sinkron:true + broadcast berubah ke peer
```

Detail implementasi:

| Bagian | File | Peran |
|---|---|---|
| Store lokal | `src/utils/lapor.js` | `jagakota-lapor-v1`, kode `JK-YYYYMMDD-XXXX`, foto JPEG ≤200KB, rate-limit + dedup |
| Sinkron | `src/utils/sinkron.js` | dorong/tarik/foto/hapus, realtime broadcast + polling, serial eksklusif |
| Gate cloud | `src/lib/supabase.js` | aktif hanya `VITE_LAPOR_CLOUD=true` + URL + anon key, lazy import |
| Skema | `supabase/schema.sql` | tabel `reports`, view `reports_publik` tanpa telepon + `reports_antrean` khusus pending, RPC `moderasi_laporan`/`hapus_laporan`, bucket `report-photos` 5MB, RLS demo |
| UI | `LaporModal/DaftarLaporModal/PetugasModal.jsx` | 3 langkah + daftar + antrean PIN, deep-link `?lapor=` |
| Peta | `src/components/map/IndonesiaMap.jsx` | pin publik + cluster + terbang ke laporan |

Batasan jujur: PIN `1234` demo di klien, mode petugas flag lokal, RLS demo — bukan auth produksi.
