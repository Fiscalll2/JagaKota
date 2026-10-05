import React, { useState, useEffect, useRef } from 'react';
import { Wind, CloudSun, Activity, Flame, Satellite, Users, ShieldCheck } from 'lucide-react';
import { LogoMark } from './LogoMark';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { getAqiInfo } from '../../utils/aqi';

function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const t = Number(target);
    if (!Number.isFinite(t)) {
      setVal(0);
      prev.current = 0;
      return;
    }
    const from = prev.current;
    if (from === t) {
      setVal(t);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = from + (t - from) * eased;
      prev.current = cur;
      setVal(cur);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function LiveValue({ value, suffix = '' }) {
  const animated = useCountUp(value);
  if (value === null || value === undefined) return <span>--</span>;
  return (
    <span>
      {Math.round(animated)}
      {suffix}
    </span>
  );
}

export function OnboardingIntro({ onEnter, live = {} }) {

  const [selected, setSelected] = useState(0);
  const panelRef = useRef(null);

  const aqi = live.aqi ?? null;
  const aqiLabel = aqi !== null ? getAqiInfo(aqi).label : 'Memuat...';
  const quakeText = live.quakeMag !== null && live.quakeMag !== undefined
    ? `M${live.quakeMag} • ${live.quakeWilayah || ''}`.trim()
    : 'Memuat...';
  const fireText = live.hotspotCount !== null && live.hotspotCount !== undefined
    ? `${live.hotspotCount} titik • ${live.fdrs || ''}`.trim()
    : 'Memuat...';

  const FEATURES = [
    {
      icon: Wind, title: 'Kualitas Udara', color: 'var(--color-secondary)',
      value: <LiveValue value={aqi} />, hint: aqiLabel,
      detail: 'Indeks gabungan partikulat & gas (US-AQI). Real-time, ikut refresh tombol sync.'
    },
    {
      icon: CloudSun, title: 'Cuaca 7 Hari', color: 'var(--color-primary)',
      value: <LiveValue value={live.temp ?? null} suffix="°" />, hint: live.uv !== null && live.uv !== undefined ? `UV ${Math.round(live.uv)}` : 'Memuat...',
      detail: 'Suhu, probabilitas hujan & indeks UV harian per kota.'
    },
    {
      icon: Activity, title: 'Gempa & Gunung', color: 'var(--color-accent)',
      value: <span>{live.quakeMag !== null && live.quakeMag !== undefined ? `M${live.quakeMag}` : '--'}</span>,
      hint: (live.quakeWilayah || 'BMKG').slice(0, 26),
      detail: 'Gempa terkini BMKG + gunung api PVMBG terdekat dari lokasimu.'
    },
    {
      icon: Flame, title: 'Karhutla', color: 'var(--color-danger)',
      value: <LiveValue value={live.hotspotCount ?? null} />, hint: live.fdrs ? `Lahan: ${live.fdrs}` : 'Memuat...',
      detail: 'Titik panas satelit NASA FIRMS & KLHK SiPongi+ se-Indonesia.'
    }
  ];

  const handleMove = (e) => {
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return;
    const el = panelRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`;
  };
  const handleLeave = () => {
    if (panelRef.current) panelRef.current.style.transform = '';
  };

  return (
    <div className="intro-overlay" role="dialog" aria-modal="true" aria-label="Selamat datang di JagaKota">
      <div className="intro-blob intro-blob-a" />
      <div className="intro-blob intro-blob-b" />

      <div className="intro-panel" ref={panelRef} onMouseMove={handleMove} onMouseLeave={handleLeave}>
        <div className="intro-rise" style={{ animationDelay: '0ms' }}>
          <Badge variant="default" className="intro-badge px-3.5 py-1.5 text-xs leading-relaxed">
            <Satellite className="size-3.5 shrink-0" /> DATA REAL-TIME
          </Badge>
        </div>

        <div className="intro-brand intro-rise" style={{ animationDelay: '80ms' }}>
          <LogoMark size={56} label="JagaKota" className="intro-logo" />
          <h1>JagaKota</h1>
        </div>

        <p className="intro-subtitle intro-rise" style={{ animationDelay: '160ms' }}>
          Pemantauan Ekologi & Kesiapsiagaan Bencana Real-Time — udara, cuaca, gempa, gunung api & karhutla dalam satu dashboard.
        </p>

        <div className="intro-grid">
          {FEATURES.map((f, i) => (
            <Card
              key={f.title}
              className={`intro-card intro-rise${selected === i ? ' active' : ''}`}
              style={{ animationDelay: `${240 + i * 90}ms` }}
              tabIndex={0}
              role="button"
              aria-pressed={selected === i}
              aria-label={f.title}
              onClick={() => setSelected(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelected(i);
                }
              }}
            >
              <CardContent className="intro-card-body">
                <span className="intro-icon" style={{ backgroundColor: f.color }}>
                  <f.icon size={18} strokeWidth={2.5} />
                </span>
                <span className="intro-card-title">{f.title}</span>
                <span className="intro-live">{f.value}</span>
                <span className="intro-card-desc">{f.hint}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div key={selected} className="intro-detail intro-rise" style={{ animationDelay: '0ms' }}>
          <strong>{FEATURES[selected].title}:</strong> {FEATURES[selected].detail}
        </div>

        <p className="intro-sources intro-rise" style={{ animationDelay: '600ms' }}>
          Sumber resmi: BMKG • PVMBG Magma • KLHK SiPongi+ • NASA FIRMS • Open-Meteo
        </p>

        <div className="intro-actions intro-rise" style={{ animationDelay: '680ms' }}>
          <Button size="lg" onClick={() => onEnter?.('warga')} className="intro-cta px-8 text-base leading-relaxed">
            <Users className="size-5 shrink-0" /> Masuk sebagai Warga
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => onEnter?.('petugas')}
            className="px-6 text-base leading-relaxed"
            title="Buka antrean verifikasi laporan (PIN petugas)"
          >
            <ShieldCheck className="size-5 shrink-0" /> Mode Petugas
          </Button>
        </div>
        <p className="intro-sources intro-rise" style={{ animationDelay: '720ms' }}>
          Warga memantau & melapor • Petugas memverifikasi antrean
        </p>
      </div>
    </div>
  );
}
