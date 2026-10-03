import React, { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AppShell } from './components/shell/AppShell';
import { TickerBar } from './components/common/TickerBar';
import { OnboardingIntro } from './components/common/OnboardingIntro';
import { EcoHealthCard } from './components/cards/EcoHealthCard';
import { AqiCard } from './components/cards/AqiCard';
import { KimiaCard } from './components/cards/KimiaCard';
import { WeatherCard } from './components/cards/WeatherCard';
import { EarthquakeCard } from './components/cards/EarthquakeCard';
import { UvCard } from './components/cards/UvCard';
import { VolcanoCard } from './components/cards/VolcanoCard';
import { KarhutlaCard } from './components/cards/KarhutlaCard';
import { AqiChart } from './components/charts/AqiChart';
import { WeatherForecastChart } from './components/charts/WeatherForecastChart';
import { IndonesiaMap } from './components/map/IndonesiaMap';
import { CitySearchModal } from './components/common/CitySearchModal';
import { ShareCardModal } from './components/common/ShareCardModal';
import { EmergencyGuideModal } from './components/common/EmergencyGuideModal';
import { KarhutlaListModal } from './components/common/KarhutlaListModal';
import { LaporModal } from './components/common/LaporModal';
import { DaftarLaporModal } from './components/common/DaftarLaporModal';
import { VolcanoListModal } from './components/common/VolcanoListModal';
import { EmbedWidgetModal } from './components/common/EmbedWidgetModal';
import { Footer } from './components/common/Footer';
import { WidgetEmbedView } from './components/embed/WidgetEmbedView';
import { KOTA_JAGA } from './utils/cities';
import { cariLaporan } from './utils/lapor';
import { useGeolocation } from './hooks/useGeolocation';
import { useDarkMode } from './hooks/useDarkMode';
import { useDataJaga } from './hooks/useDashboardData';
import { getarJaga } from './utils/haptics';
import { i18n } from './utils/i18n';
import { Download, AlertTriangle, X, Loader2, WifiOff, CheckCircle2, MapPin } from 'lucide-react';

function bacaParam(kunci) {
  try {
    return new URLSearchParams(window.location.search).get(kunci);
  } catch {
    return null;
  }
}

function LayarTunggu({ tinggi = '200px', pesan = 'Memuat komponen...' }) {
  return (
    <div className="grid place-items-center gap-2 rounded-xl border-2 font-semibold" style={{
      minHeight: tinggi, backgroundColor: 'var(--bg-card)',
      borderColor: 'var(--border-color, #e5e7eb)', color: 'var(--text-muted, #6b7280)', fontSize: '0.85rem',
    }}>
      <Loader2 size={24} className="animate-spin" color="var(--color-primary, #0d9488)" />
      <span>{pesan}</span>
    </div>
  );
}

function SpandukAwas({ aqi, gempa, kamus }) {
  if (!aqi && !gempa) return null;
  return (
    <div className="alert-banner animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <AlertTriangle size={20} color="var(--color-danger)" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ fontSize: '0.85rem', color: 'var(--color-danger)', display: 'block' }}>
            {aqi ? kamus.alertAqiTitle : kamus.alertQuakeTitle}
          </strong>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600' }}>
            {aqi ? `${kamus.alertAqiDesc} (AQI: ${aqi})` : `Gempa M ${gempa?.magnitude} terjadi di ${gempa?.wilayah}.`}
          </span>
        </div>
      </div>
    </div>
  );
}

export function App() {
  const kamus = i18n.id;
  const { isDark, toggleDarkMode } = useDarkMode();
  const { location, selectCity, requestGpsLocation, gpsLoading, error: gpsError } = useGeolocation();
  const [bolehIngatkan, setBolehIngatkan] = useState(false);
  const {
    weatherData, airQualityData, latestEarthquake, recentEarthquakes, karhutlaData,
    loading, isRefreshing, showUpdateToast, lastUpdated, handleManualRefresh,
  } = useDataJaga(location, { ingatkan: bolehIngatkan });

  const modeSemat = typeof window !== 'undefined' && bacaParam('embed') === 'true';
  const paramKota = typeof window !== 'undefined' ? bacaParam('city') : null;

  useEffect(() => {
    if (!paramKota) return;
    const q = paramKota.toLowerCase();
    const cocok = KOTA_JAGA.find((k) => k.slug === q || k.name.toLowerCase() === q);
    if (cocok && (cocok.lat !== location.lat || cocok.lon !== location.lon)) selectCity(cocok);
  }, [paramKota]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setGpsTutup(false); }, [gpsError]);

  const [cariBuka, setCariBuka] = useState(false);
  const [gpsTutup, setGpsTutup] = useState(false);
  const [bagikanBuka, setBagikanBuka] = useState(false);
  const [daruratBuka, setDaruratBuka] = useState(false);
  const [gunungBuka, setGunungBuka] = useState(false);
  const [apiBuka, setApiBuka] = useState(false);
  const [laporBuka, setLaporBuka] = useState(false);
  const [daftarBuka, setDaftarBuka] = useState(false);
  const [sorotAwal, setSorotAwal] = useState(null);

  // Deep-link ?lapor=id: sorot pin laporannya (sekali saat dibuka).
  useEffect(() => {
    const id = bacaParam('lapor');
    if (!id) return;
    const cocok = cariLaporan(id);
    if (cocok) setSorotAwal(cocok);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('lapor');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    } catch {}
  }, []);

  const terbangKeLaporan = (lapor) => {
    if (!Number.isFinite(lapor?.lat) || !Number.isFinite(lapor?.lon)) return;
    try {
      window.dispatchEvent(new CustomEvent('jagakota:terbang-lapor', {
        detail: { lat: lapor.lat, lon: lapor.lon },
      }));
    } catch {}
  };
  const [widgetBuka, setWidgetBuka] = useState(false);

  const [pintaPasang, setPintaPasang] = useState(null);
  const [spandukPwa, setSpandukPwa] = useState(true);
  const [introTampil, setIntroTampil] = useState(true);
  const [daring, setDaring] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const nyala = () => setDaring(true);
    const mati = () => setDaring(false);
    window.addEventListener('online', nyala);
    window.addEventListener('offline', mati);
    return () => {
      window.removeEventListener('online', nyala);
      window.removeEventListener('offline', mati);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const labelAqi = airQualityData?.current?.aqi ? `AQI ${airQualityData.current.aqi}` : 'Real-Time';
    document.title = `JagaKota: ${location.name} • ${labelAqi} & Cuaca BMKG`;
    document.querySelector('meta[name="description"]')?.setAttribute('content',
      `Pantauan kualitas udara (${labelAqi}), suhu ${weatherData?.current?.temp || 29}°C, gempa BMKG & karhutla di ${location.name}, ${location.province}.`);
  }, [location.name, location.province, airQualityData?.current?.aqi, weatherData?.current?.temp]);

  useEffect(() => {
    const tadahPinta = (e) => {
      e.preventDefault();
      setPintaPasang(e);
    };
    window.addEventListener('beforeinstallprompt', tadahPinta);
    if ('serviceWorker' in navigator) {
      if (import.meta.env.PROD) {
        navigator.serviceWorker.register('/sw.js').catch((e) => console.log('SW error:', e));
      } else {
        navigator.serviceWorker.getRegistrations().then((ds) => { for (const d of ds) d.unregister(); });
      }
    }
    if ('Notification' in window && Notification.permission === 'granted') setBolehIngatkan(true);
    return () => window.removeEventListener('beforeinstallprompt', tadahPinta);
  }, []);

  const pasangPwa = async () => {
    if (!pintaPasang) return;
    pintaPasang.prompt();
    const { outcome } = await pintaPasang.userChoice;
    if (outcome === 'accepted') setPintaPasang(null);
  };

  const mintaNotifikasi = async () => {
    if (!('Notification' in window)) {
      alert('Browser ini tidak mendukung notifikasi Web.');
      return;
    }
    if ((await Notification.requestPermission()) === 'granted') {
      setBolehIngatkan(true);
      try {
        new Notification('JagaKota Aktif', {
          body: 'Notifikasi peringatan gempa, gunung api & kualitas udara berhasil diaktifkan.',
          icon: '/icon-192.png',
        });
      } catch {}
    }
  };

  const [sentuhAwal, setSentuhAwal] = useState(0);
  const [menarik, setMenarik] = useState(false);
  const gestur = {
    onTouchStart: (e) => { if (window.scrollY === 0 && e.touches.length === 1) setSentuhAwal(e.touches[0].clientY); },
    onTouchMove: (e) => { if (sentuhAwal > 0 && window.scrollY === 0 && e.touches[0].clientY - sentuhAwal > 70) setMenarik(true); },
    onTouchEnd: () => {
      if (menarik) {
        getarJaga(20);
        handleManualRefresh();
      }
      setSentuhAwal(0);
      setMenarik(false);
    },
  };

  const fokusGempa = (g) => {
    if (g?.lat && g?.lon) {
      selectCity({ name: `Lokasi Gempa (${g.magnitude} SR)`, province: g.wilayah, lat: g.lat, lon: g.lon });
    }
  };

  const nilaiAqi = airQualityData?.current?.aqi || 0;
  const awasAqi = nilaiAqi > 150;
  const awasGempa = (latestEarthquake?.magnitude || 0) >= 5.5;
  const sibuk = loading || isRefreshing;

  // Status sinyal tiap sumber untuk footer (jujur saat data gagal dimuat).
  const statusSinyal = {
    cuaca: loading ? 'memuat' : weatherData?.current ? 'ok' : 'terganggu',
    udara: loading ? 'memuat' : airQualityData?.current ? 'ok' : 'terganggu',
    gempa: loading ? 'memuat' : latestEarthquake ? 'ok' : 'terganggu',
    karhutla: loading ? 'memuat' : karhutlaData ? 'ok' : 'terganggu',
  };

  const itemTicker = [
    // Lokasi sengaja tidak diulang di sini: sudah tampil di pil lokasi sidebar + bar kota (mobile).
    airQualityData?.current ? `Kualitas Udara AQI ${airQualityData.current.aqi}` : null,
    weatherData?.current ? `Suhu ${weatherData.current.temp}°C` : null,
    weatherData?.current ? `UV Indeks ${weatherData.current.uvIndex}` : null,
    latestEarthquake ? `Gempa M${latestEarthquake.magnitude} di ${latestEarthquake.wilayah}` : null,
    karhutlaData?.fdrs ? `Karhutla: ${karhutlaData.fdrs.code}` : null,
    !daring ? 'Mode Offline: menampilkan data cache lokal' : 'Data Real-Time BMKG • Open-Meteo • PVMBG • NASA FIRMS',
  ].filter(Boolean);

  if (modeSemat) {
    return (
      <WidgetEmbedView location={location} weatherData={weatherData}
        airQualityData={airQualityData} loading={loading} onRefresh={handleManualRefresh} />
    );
  }

  return (
    <AppShell
      location={location}
      onOpenSearch={() => setCariBuka(true)}
      onGpsClick={requestGpsLocation}
      gpsLoading={gpsLoading}
      isDark={isDark}
      onToggleDark={toggleDarkMode}
      onOpenEmergency={() => setDaruratBuka(true)}
      onOpenShare={() => setBagikanBuka(true)}
      onOpenLapor={() => setLaporBuka(true)}
      notificationsEnabled={bolehIngatkan}
      onRequestNotification={mintaNotifikasi}
      onRefresh={handleManualRefresh}
      isRefreshing={isRefreshing}
    >
    <div {...gestur}>
      {!modeSemat && introTampil && (
        <OnboardingIntro onEnter={() => setIntroTampil(false)} live={{
          aqi: airQualityData?.current?.aqi ?? null, temp: weatherData?.current?.temp ?? null,
          uv: weatherData?.current?.uvIndex ?? null, quakeMag: latestEarthquake?.magnitude ?? null,
          quakeWilayah: latestEarthquake?.wilayah ?? null,
          hotspotCount: karhutlaData?.allHotspots?.length ?? null, fdrs: karhutlaData?.fdrs?.code ?? null,
        }} />
      )}
      <TickerBar items={itemTicker}
        notificationsEnabled={bolehIngatkan} onRequestNotification={mintaNotifikasi}
        onRefresh={handleManualRefresh} isRefreshing={isRefreshing}
        isDark={isDark} onToggleDark={toggleDarkMode}
        installApp={pintaPasang ? pasangPwa : null} />

      {cariBuka && <CitySearchModal isOpen={cariBuka} onClose={() => setCariBuka(false)} onSelectCity={selectCity} currentCity={location} />}
      {bagikanBuka && <ShareCardModal isOpen={bagikanBuka} onClose={() => setBagikanBuka(false)} location={location} airQualityData={airQualityData} weatherData={weatherData} latestEarthquake={latestEarthquake} karhutlaData={karhutlaData} />}
      {daruratBuka && <EmergencyGuideModal isOpen={daruratBuka} onClose={() => setDaruratBuka(false)} />}
      {widgetBuka && <EmbedWidgetModal isOpen={widgetBuka} onClose={() => setWidgetBuka(false)} location={location} airQualityData={airQualityData} weatherData={weatherData} />}
      {apiBuka && <KarhutlaListModal isOpen={apiBuka} onClose={() => setApiBuka(false)} userLocation={location} hotspots={karhutlaData?.allHotspots || []} />}
      {laporBuka && <LaporModal isOpen={laporBuka} onClose={() => setLaporBuka(false)} location={location} onRefreshGps={requestGpsLocation} gpsLoading={gpsLoading} />}
      {daftarBuka && <DaftarLaporModal isOpen={daftarBuka} onClose={() => setDaftarBuka(false)} onPilih={terbangKeLaporan} onLaporBaru={() => setLaporBuka(true)} />}
      {gunungBuka && <VolcanoListModal isOpen={gunungBuka} onClose={() => setGunungBuka(false)} userLocation={location} />}

      {pintaPasang && spandukPwa && (
        <div className="pwa-banner animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Download size={18} color="var(--color-primary)" />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
              Pasang aplikasi JagaKota di layar utama HP Anda untuk akses instan & offline.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={pasangPwa} className="flat-btn-primary" style={{ minHeight: '36px', padding: '6px 14px', fontSize: '0.8rem' }}>
              {kamus.pwaInstall || 'Pasang Aplikasi'}
            </button>
            <button onClick={() => setSpandukPwa(false)} aria-label="Tutup" className="flat-btn-secondary" style={{ minHeight: '36px', padding: '6px 10px' }}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {!daring && (
        <div style={{
          backgroundColor: '#92400e', color: '#fef3c7', padding: '0.55rem 1rem',
          borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '700',
        }}>
          <WifiOff size={16} />
          <span>Mode Offline: Menampilkan data cache lokal terakhir.</span>
        </div>
      )}

      {gpsError && !gpsTutup && (
        <div className="animate-fade-in" role="alert" style={{
          backgroundColor: 'var(--color-danger-bg)', border: '2px solid var(--color-danger)',
          color: 'var(--text-main)', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)',
          marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem',
        }}>
          <AlertTriangle size={18} color="var(--color-danger)" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontWeight: '600' }}>{gpsError}</span>
          <button
            onClick={() => { setGpsTutup(true); setCariBuka(true); }}
            className="flat-btn-primary" style={{ minHeight: '34px', padding: '4px 12px', fontSize: '0.75rem', flexShrink: 0 }}
          >
            Pilih manual
          </button>
          <button onClick={() => setGpsTutup(true)} aria-label="Tutup peringatan GPS" className="flat-btn-secondary" style={{ minHeight: '34px', padding: '4px 8px', flexShrink: 0 }}>
            <X size={15} />
          </button>
        </div>
      )}

      {location?.isGps && (location?.akurasiM ?? 0) > 20000 && (
        <div className="animate-fade-in" role="status" style={{
          backgroundColor: 'var(--color-accent-bg)', border: '2px solid var(--color-accent)',
          color: 'var(--text-main)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)',
          marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem',
        }}>
          <MapPin size={18} color="var(--color-accent-hover)" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontWeight: '600' }}>
            Lokasi GPS kira-kira (±{(location.akurasiM / 1000).toFixed(0)} km, kemungkinan dari IP/VPN) — peta bisa meleset.
            Pilih kota manual biar pas.
          </span>
          <button
            onClick={() => setCariBuka(true)}
            className="flat-btn-primary" style={{ minHeight: '34px', padding: '4px 12px', fontSize: '0.75rem', flexShrink: 0 }}
          >
            Pilih manual
          </button>
        </div>
      )}

      <SpandukAwas aqi={awasAqi ? nilaiAqi : 0} gempa={!awasAqi && awasGempa ? latestEarthquake : null} kamus={kamus} />

      <div id="seksi-command-center" className="section-anchor">
        <EcoHealthCard aqiData={airQualityData} weatherData={weatherData} loading={sibuk} />
      </div>

      <div id="seksi-udara" className="section-anchor">
      <div className="grid gap-4 lg:grid-cols-2" style={{ marginBottom: '1.5rem' }}>
        <AqiCard data={airQualityData} loading={sibuk} locationName={location.name} updatedAt={lastUpdated} />
        <WeatherCard data={weatherData} locationName={location.name} province={location.province} loading={sibuk} />
        <UvCard uvIndex={weatherData?.current?.uvIndex || 0} hourly={weatherData?.hourly} loading={sibuk} />
        <KimiaCard current={airQualityData?.current} locationName={location.name} province={location.province} loading={sibuk} />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <React.Suspense fallback={<LayarTunggu height="260px" pesan="Memuat Grafik Tren AQI..." />}>
          <AqiChart hourlyData={airQualityData?.hourly} />
        </React.Suspense>
      </div>
      </div>

      <div id="seksi-siaga" className="section-anchor">
      <div className="flex flex-col gap-4" style={{ marginBottom: '1.5rem' }}>
        <EarthquakeCard earthquake={latestEarthquake} recentQuakes={recentEarthquakes}
          onFocusQuake={fokusGempa} userLocation={location} isRefreshing={isRefreshing} />
        <VolcanoCard location={location} onOpenModal={() => setGunungBuka(true)} isRefreshing={isRefreshing} />
        <KarhutlaCard karhutlaData={karhutlaData} airQualityData={airQualityData} location={location}
          onOpenModal={() => setApiBuka(true)} loading={sibuk} />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <React.Suspense fallback={<LayarTunggu height="260px" pesan="Memuat Prakiraan Cuaca 7 Hari..." />}>
          <WeatherForecastChart dailyData={weatherData?.daily} />
        </React.Suspense>
      </div>
      </div>

      <div id="seksi-sensor" className="section-anchor">
      <div style={{ marginBottom: '1.5rem' }}>
        <React.Suspense fallback={<LayarTunggu height="360px" pesan="Memuat Peta Interaktif Indonesia..." />}>
          <IndonesiaMap currentLocation={location} earthquakes={recentEarthquakes}
            hotspots={karhutlaData?.allHotspots || []} onSelectCity={selectCity} onOpenDaftar={() => setDaftarBuka(true)} sorotAwal={sorotAwal} />
        </React.Suspense>
      </div>
      </div>

      <Footer status={statusSinyal} onOpenWidget={() => setWidgetBuka(true)} onOpenShare={() => setBagikanBuka(true)} />

      {showUpdateToast && (
        <div className="animate-fade-in" role="status" style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 99999, display: 'flex', alignItems: 'center', gap: '0.5rem',
          backgroundColor: 'var(--color-secondary)', color: '#ffffff', padding: '0.65rem 1.1rem',
          borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '700',
        }}>
          <CheckCircle2 size={17} strokeWidth={2.5} />
          <span>Data Sudah Update</span>
        </div>
      )}

      <Analytics />
    </div>
    </AppShell>
  );
}

export default App;
