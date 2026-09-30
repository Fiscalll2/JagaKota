import React from 'react';
import { Flame, Compass, ChevronRight, AlertTriangle, ShieldCheck, Wind } from 'lucide-react';
import { getHazeStatus } from '../../utils/karhutla.js';
import { translations } from '../../utils/i18n.js';

export function KarhutlaCard({ karhutlaData, airQualityData, location, onOpenModal, loading }) {
  const t = translations;

  if (loading && (!karhutlaData || !karhutlaData.fdrs)) {
    return (
      <div className="flat-card animate-pulse mb-6 min-h-[180px] p-6">
        <div className="mb-4 h-6 w-[40%] rounded bg-[var(--bg-muted)]" />
        <div className="h-[70px] rounded-lg bg-[var(--bg-muted)]" />
      </div>
    );
  }

  const fdrs = karhutlaData.fdrs;
  const nearest = karhutlaData.nearest;
  const totalInIndo = karhutlaData.allHotspots?.length || 0;

  const aqi = airQualityData?.current?.aqi || 0;
  const pm25 = airQualityData?.current?.pm25 || airQualityData?.current?.pm2_5 || 0;

  // Evaluasi Status Kabut Asap Terkini
  const { isHazeActive, isVeryNear } = getHazeStatus(nearest, aqi, pm25);

  const isHighRisk = fdrs.code === 'TINGGI' || fdrs.code === 'EKSTREM' || fdrs.code === 'HIGH' || fdrs.code === 'EXTREME';
  const isModerateRisk = fdrs.code === 'SEDANG' || fdrs.code === 'MODERATE';

  let statusBannerBg = 'var(--bg-subtle)';
  let statusBorder = 'var(--border-flat)';
  let statusTextColor = 'var(--text-main)';
  let statusIcon = <ShieldCheck size={16} color="var(--color-primary)" />;
  let statusMessage = nearest && nearest.distanceKm <= 50
    ? `Terdeteksi titik kebakaran lahan sangat dekat (${nearest.distanceKm} km dari ${nearest.regency}). Risiko asap pekat tinggi.`
    : (t.statusSafeMsg || `Kondisi lahan di ${location.name} terpantau AMAN dan bebas dari paparan kabut asap karhutla.`);

  if (isHazeActive) {
    statusBannerBg = 'var(--color-danger-bg)';
    statusBorder = 'var(--color-danger)';
    statusTextColor = 'var(--color-danger)';
    statusIcon = <Wind size={16} color="var(--color-danger)" />;
    statusMessage = `PERINGATAN KABUT ASAP: Udara terpapar asap kiriman dari titik api ${nearest?.regency || 'wilayah sekitar'} (${nearest?.distanceKm || 0} km). Lahan setempat aman dari api, namun gunakan masker N95 untuk pernapasan!`;
  } else if (isHighRisk) {
    statusBannerBg = 'var(--color-danger-bg)';
    statusBorder = 'var(--color-danger)';
    statusTextColor = 'var(--color-danger)';
    statusIcon = <AlertTriangle size={16} color="var(--color-danger)" />;
    statusMessage = `STATUS RAWAN: Vegetasi di wilayah ${location.name} sangat kering & mudah terbakar akibat suhu panas.`;
  } else if (isModerateRisk) {
    statusBannerBg = 'var(--color-warning-bg)';
    statusBorder = 'var(--color-warning)';
    statusTextColor = '#b45309';
    statusIcon = <AlertTriangle size={16} color="#b45309" />;
    statusMessage = `STATUS WASPADA: Semak & alang-alang mulai mengering. Hindari pembakaran sampah di ${location.name}.`;
  }

  return (
    <div className="flat-card mb-6 p-6">
      
      {/* Header */}
      <div className="mb-[0.85rem] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-[0.55rem]">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-full)] text-white"
            style={{ backgroundColor: isHazeActive ? '#ef4444' : fdrs.color }}
          >
            <Flame size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="m-0 text-[1.05rem] font-extrabold text-[var(--text-main)]">
              {t.karhutlaTitle}
            </h3>
            <span className="text-[0.725rem] font-semibold text-[var(--text-muted)]">
              {t.karhutlaSubtitle}
            </span>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          {isHazeActive ? (
            <span className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[#dc2626] bg-[rgba(239,68,68,0.15)] px-2.5 py-1 text-[0.725rem] font-extrabold text-[#dc2626]">
              <Wind size={12} strokeWidth={2.5} />
              <span>{t.hazeActiveBadge}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.12)] px-2.5 py-1 text-[0.725rem] font-extrabold text-[#059669]">
              <span>{t.hazeCleanBadge}</span>
            </span>
          )}

          <div
            className="inline-flex items-center gap-[5px] rounded-[var(--radius-sm)] px-3 py-1 text-xs font-extrabold text-white"
            style={{ backgroundColor: fdrs.color }}
          >
            <Flame size={13} strokeWidth={2.5} />
            <span>{t.landLocalBadge}: {fdrs.code}</span>
          </div>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="mx-0 my-3 grid gap-4 rounded-[var(--radius-md)] border-2 border-[var(--border-flat)] bg-[var(--bg-muted)] px-[1.15rem] py-4 sm:grid-cols-2">
        {/* Left: Nearest Hotspot */}
        <div>
          <span className="text-[0.7rem] font-extrabold tracking-[0.04em] text-[var(--text-muted)] uppercase">
            {t.nearestHotspotLabel}
          </span>
          {nearest ? (
            <div className="mt-1">
              <strong className="block text-[1.15rem] font-extrabold text-[var(--text-main)]">
                {nearest.regency}
              </strong>
              <span className="mt-[0.1rem] block text-[0.775rem] font-semibold text-[var(--text-muted)]">
                {nearest.province} · {nearest.type}
              </span>
              <div className="mt-[0.45rem] flex items-center gap-[0.4rem]">
                <Compass size={16} color="var(--color-primary)" />
                <span className="text-[0.85rem] font-bold text-[var(--text-main)]">
                  Jarak: <span className={isVeryNear ? 'text-[var(--color-danger)]' : 'text-[var(--color-primary)]'}>{nearest.distanceKm} km</span> dari {location.name}
                </span>
              </div>
            </div>
          ) : (
            <p className="mx-0 mt-[0.35rem] mb-0 text-[0.85rem] font-semibold text-[var(--text-muted)]">
              {t.noHotspotsNearby}
            </p>
          )}
        </div>

        {/* Right: FDRS Condition */}
        <div>
          <span className="text-[0.7rem] font-extrabold tracking-[0.04em] text-[var(--text-muted)] uppercase">
            {t.landConditionTitle} ({location.name})
          </span>
          <p className="mx-0 mt-1 mb-0 text-[0.8rem] leading-[1.4] font-semibold text-[var(--text-main)]">
            {fdrs.desc}
          </p>
          <span className="mt-[0.35rem] block text-[0.7rem] font-medium text-[var(--text-muted)]">
            {t.fdrsExplExplanation}
          </span>
        </div>
      </div>

      {/* Safety Evaluation Status Strip */}
      <div
        className="flex flex-wrap items-center justify-between gap-[0.65rem] rounded-[var(--radius-sm)] border-[1.5px] px-4 py-3 text-[0.775rem] font-semibold"
        style={{ backgroundColor: statusBannerBg, borderColor: statusBorder, color: statusTextColor }}
      >
        <div className="flex flex-[1_1_300px] items-center gap-2">
          {statusIcon}
          <span className="leading-[1.4]">{statusMessage}</span>
        </div>

        <button
          onClick={onOpenModal}
          className="flat-btn-primary gap-[0.3rem] px-2.5 py-1 text-[0.725rem] whitespace-nowrap"
        >
          <span>{t.allHotspotsBtn} ({totalInIndo})</span>
          <ChevronRight size={14} />
        </button>
      </div>

    </div>
  );
}
