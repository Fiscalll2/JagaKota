import React from 'react';
import { Wind } from 'lucide-react';
import { getAqiInfo } from '../../utils/aqi';
import { translations } from '../../utils/i18n';

export function AqiCard({ data, loading }) {
  const t = translations;

  if (loading) {
    return (
      <div className="flat-card animate-pulse" style={{ padding: '1.5rem', minHeight: '220px' }}>
        <div style={{ height: '24px', width: '45%', backgroundColor: 'var(--bg-muted)', borderRadius: '4px', marginBottom: '1rem' }} />
        <div style={{ height: '54px', width: '30%', backgroundColor: 'var(--bg-muted)', borderRadius: '6px', marginBottom: '0.85rem' }} />
        <div style={{ height: '10px', backgroundColor: 'var(--bg-muted)', borderRadius: '999px', marginBottom: '1rem' }} />
        <div style={{ height: '60px', backgroundColor: 'var(--bg-muted)', borderRadius: '6px' }} />
      </div>
    );
  }

  

  const current = data?.current || {};
  const aqi = Number(current.aqi) || 0;
  const aqiInfo = getAqiInfo(aqi);

  // Position percentage on standard 0-500 AQI scale
  const needlePercent = Math.min(100, Math.max(0, (aqi / 500) * 100));

  return (
    <div className="flat-card" style={{ padding: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', backgroundColor: aqiInfo.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Wind size={18} strokeWidth={2.5} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>{t.aqiTitle}</h3>
        </div>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: '800',
          padding: '3px 10px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: aqiInfo.color,
          color: '#ffffff'
        }}>
          {aqiInfo.label}
        </span>
      </div>

      {/* Main AQI Numeric Readout */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem', margin: '0.85rem 0 0.5rem 0' }}>
        <div style={{
          fontSize: '3.4rem',
          fontWeight: '800',
          lineHeight: '1',
          color: aqiInfo.color,
          letterSpacing: '-0.04em'
        }}>
          {current.aqi !== undefined && current.aqi !== null ? current.aqi : '--'}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <strong style={{ fontSize: '1.15rem', color: 'var(--text-main)', display: 'block', fontWeight: '800', lineHeight: 1.2 }}>
            {aqiInfo.label}
          </strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', lineHeight: 1.4 }}>
            Indeks gabungan partikulat & gas <span style={{ whiteSpace: 'nowrap' }}>(US-AQI)</span>
          </span>
        </div>
      </div>

      {/* Official 0-500 Continuous Gauge Scale Bar with Needle Position Marker */}
      <div style={{ margin: '1.25rem 0 0.5rem 0' }}>
        <div
          style={{
            height: '10px',
            width: '100%',
            borderRadius: '4px',
            background: 'linear-gradient(to right, #2ea043 0%, #2ea043 10%, #d29922 10%, #d29922 20%, #db6d28 20%, #db6d28 30%, #f85149 30%, #f85149 40%, #a371f7 40%, #a371f7 60%, #8b0000 60%, #8b0000 100%)',
            position: 'relative',
            border: '1px solid rgba(0, 0, 0, 0.1)'
          }}
          title={`Posisi AQI: ${aqi} dari skala 500`}
        >
          {/* Vertical Needle / Pointer Indicator */}
          <div
            style={{
              position: 'absolute',
              top: '-6px',
              left: `${needlePercent}%`,
              width: '4px',
              height: '22px',
              backgroundColor: 'var(--text-main)',
              border: '1px solid #ffffff',
              borderRadius: '2px',
              transform: 'translateX(-50%)',
              transition: 'left 600ms cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}
          />
        </div>

        {/* Scale Ticks: angka pendek saja agar 100-150-200 tidak tabrakan di kartu sempit */}
        <div style={{
          position: 'relative',
          height: '14px',
          fontSize: '0.675rem',
          color: 'var(--text-muted)',
          fontWeight: '600',
          marginTop: '0.45rem'
        }}>
          {[
            { v: 0, label: '0', align: 'left' },
            { v: 50, label: '50', align: 'center' },
            { v: 100, label: '100', align: 'center' },
            { v: 150, label: '150', align: 'center' },
            { v: 200, label: '200', align: 'center' },
            { v: 300, label: '300', align: 'center' },
            { v: 500, label: '500', align: 'right' }
          ].map((tick) => (
            <span
              key={tick.v}
              style={{
                position: 'absolute',
                left: `${(tick.v / 500) * 100}%`,
                transform: tick.align === 'left' ? 'none' : tick.align === 'right' ? 'translateX(-100%)' : 'translateX(-50%)',
                whiteSpace: 'nowrap'
              }}
            >
              {tick.label}
            </span>
          ))}
        </div>
        {/* Keterangan kategori ikut badge di atas (Baik/Sedang/Sensitif/Tidak Sehat/...) agar tidak menumpuk */}
        <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.15rem' }}>
          Skala: 0–50 Baik • 51–100 Sedang • 101–150 Sensitif • 151–200 Tidak Sehat • 201+ Bahaya
        </div>
      </div>

      {/* Advice */}
      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.85rem 0 1.15rem 0', lineHeight: '1.45', fontWeight: '500' }}>
        {aqiInfo.advice}
      </p>

      {/* Pollutant Breakdown Grid: tampilkan 6 penentu AQI agar 183 bisa diverifikasi */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
        <div style={{ padding: '0.5rem 0.35rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-muted)', textAlign: 'center', border: 'var(--border-thick)' }}>
          <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: '700' }}>PM2.5</span>
          <div style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--text-main)' }}>{current.pm25 ?? 0}</div>
        </div>
        <div style={{ padding: '0.5rem 0.35rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-muted)', textAlign: 'center', border: 'var(--border-thick)' }}>
          <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: '700' }}>PM10</span>
          <div style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--text-main)' }}>{current.pm10 ?? 0}</div>
        </div>
        <div style={{ padding: '0.5rem 0.35rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-muted)', textAlign: 'center', border: 'var(--border-thick)' }}>
          <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: '700' }}>O₃</span>
          <div style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--text-main)' }}>{current.o3 ?? 0}</div>
        </div>
        <div style={{ padding: '0.5rem 0.35rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-muted)', textAlign: 'center', border: 'var(--border-thick)' }}>
          <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: '700' }}>NO₂</span>
          <div style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--text-main)' }}>{current.no2 ?? 0}</div>
        </div>
        <div style={{ padding: '0.5rem 0.35rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-muted)', textAlign: 'center', border: 'var(--border-thick)' }}>
          <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: '700' }}>SO₂</span>
          <div style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--text-main)' }}>{current.so2 ?? 0}</div>
        </div>
        <div style={{ padding: '0.5rem 0.35rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-muted)', textAlign: 'center', border: 'var(--border-thick)' }}>
          <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: '700' }}>CO</span>
          <div style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--text-main)' }}>{current.co ?? 0}</div>
        </div>
      </div>

    </div>
  );
}
