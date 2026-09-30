import React from "react";
import {
	Sun,
	Moon,
	MapPin,
	RefreshCw,
	Compass,
	Bell,
	BellRing,
	Search,
	Calendar,
	Share2,
	ShieldAlert,
} from "lucide-react";
import { formatFullCurrentDate } from "../../utils/format";
import { i18n } from "../../utils/i18n";

export function Header({
  location,
  onOpenSearch,
  onGpsClick,
  gpsLoading,
  isDark,
  onToggleDark,
  onRefresh,
  isRefreshing,
  lastUpdated,
  notificationsEnabled,
  onRequestNotification,
  onOpenShare,
  onOpenEmergency
}) {
	const t = i18n.id;

	const displayName = location?.name || "Jakarta Pusat";
	const displayProvince =
		location?.province && location?.province !== displayName
			? location.province
			: displayName.includes("Jakarta")
				? "DKI Jakarta"
				: location?.province || "Indonesia";

	return (
		<header className="mb-7">
			{/* Top Bar: Brand & Primary Action Badges */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				{/* Brand & Subtitle */}
				<div className="flex items-center gap-[0.85rem]">
					<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-(--text-inverse)">
						<Compass size={24} strokeWidth={2.5} />
					</div>
					<div>
						<div className="flex items-center gap-[0.6rem]">
							<h1 className="m-0 text-[1.4rem] font-black tracking-[-0.03em] text-(--text-main)">
								{t.appName}
							</h1>
							<span className="rounded-sm bg-secondary px-1.5 py-0.5 text-[0.65rem] font-black tracking-[0.04em] text-(--text-inverse) uppercase">
								{t.liveBadge}
							</span>
						</div>
						<div className="mt-0.5 flex flex-wrap items-center gap-[0.4rem]">
							<span className="text-[0.8rem] font-medium text-(--text-muted)">
								{t.appSubtitle}
							</span>
							<span className="text-xs text-(--text-muted)">
								•
							</span>
							<div className="inline-flex items-center gap-[0.3rem] text-xs font-bold text-primary">
								<Calendar size={12} strokeWidth={2.5} />
								<span>
									{formatFullCurrentDate(lastUpdated)}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Priority Actions: Share & Emergency */}
				<div className="flex flex-wrap items-center gap-2">
					<button
						onClick={onOpenShare}
						aria-label="Bagikan Laporan"
						className="flat-btn-secondary min-h-9.5 border-primary bg-(--color-primary-bg) px-[0.95rem] py-2 font-bold text-primary"
					>
						<Share2 size={16} strokeWidth={2.5} />
						<span>{t.share || "Bagikan"}</span>
					</button>

					<button
						onClick={onOpenEmergency}
						aria-label="Kontak Darurat & Tanggap Bencana"
						className="flat-btn-secondary min-h-9.5 border-danger bg-(--color-danger-bg) px-[0.95rem] py-2 font-bold text-danger"
					>
						<ShieldAlert size={16} strokeWidth={2.5} />
						<span>{t.emergency || "Darurat 112"}</span>
					</button>
				</div>
			</div>

			{/* Bottom Bar: Search & Compact Utility Toolbar */}
			<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
				{/* City Search Bar with integrated GPS trigger */}
				<div className="flex min-w-0 flex-[1_1_280px] items-center gap-2">
					<button
						onClick={onOpenSearch}
						className="flat-btn-secondary min-h-10 flex-1 justify-between bg-(--bg-card) px-[0.9rem] py-[0.6rem]"
					>
						<div className="flex min-w-0 items-center gap-2">
							<MapPin
								size={16}
								color="var(--color-secondary)"
								className="shrink-0"
							/>
							<div className="min-w-0 text-left">
								<span className="block truncate text-sm font-bold whitespace-nowrap text-(--text-main)">
									{displayName}
								</span>
								<span className="block truncate text-[0.7rem] whitespace-nowrap text-(--text-muted)">
									{displayProvince}
								</span>
							</div>
						</div>
						<div className="flex items-center gap-[0.3rem] rounded-sm border-2 border-(--border-flat) bg-(--bg-muted) px-1.75 py-0.5 text-[0.725rem] text-(--text-muted)">
							<Search size={12} />
							<span>{t.searchCity}</span>
						</div>
					</button>

					<button
						onClick={onGpsClick}
						disabled={gpsLoading}
						aria-label={t.gps}
						title={t.gps}
						className={`flat-btn-secondary min-h-10 min-w-10 shrink-0 p-0 ${location?.isGps ? "active" : ""}`}
					>
						<Compass
							size={17}
							strokeWidth={2.2}
							className={gpsLoading ? "animate-spin" : ""}
						/>
					</button>
				</div>

				{/* Compact Utility Icons Toolbar */}
				<div className="flex items-center gap-[0.4rem] rounded-md border-2 border-(--border-flat) bg-(--bg-muted) p-0.75">
					{/* Notification */}
					<button
						onClick={onRequestNotification}
						aria-label={
							notificationsEnabled
								? t.notifyActive
								: t.notifyEnable
						}
						title={
							notificationsEnabled
								? t.notifyActive
								: t.notifyEnable
						}
						className={
							notificationsEnabled
								? "flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm border border-secondary bg-(--color-secondary-bg) text-secondary transition-transform"
								: "flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent text-(--text-main) transition-transform"
						}
					>
						{notificationsEnabled ? (
							<BellRing size={16} strokeWidth={2.5} />
						) : (
							<Bell size={16} strokeWidth={2.2} />
						)}
					</button>

					{/* Refresh */}
					<button
						onClick={onRefresh}
						aria-label={t.refresh}
						title={t.refresh}
						className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent text-(--text-main)"
					>
						<RefreshCw size={15} strokeWidth={2.2} />
					</button>

        {/* Compact Utility Icons Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'var(--bg-muted)',
          padding: '3px',
          borderRadius: 'var(--radius-md)',
          border: 'var(--border-thick)'
        }}>
          
          {/* Notification */}
          <button
            onClick={onRequestNotification}
            aria-label={notificationsEnabled ? t.notifyActive : t.notifyEnable}
            title={notificationsEnabled ? t.notifyActive : t.notifyEnable}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              border: notificationsEnabled ? '1px solid var(--color-secondary)' : 'none',
              backgroundColor: notificationsEnabled ? 'var(--color-secondary-bg)' : 'transparent',
              color: notificationsEnabled ? 'var(--color-secondary)' : 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform var(--anim-fast)'
            }}
          >
            {notificationsEnabled ? <BellRing size={16} strokeWidth={2.5} /> : <Bell size={16} strokeWidth={2.2} />}
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label={t.refresh}
            title={t.refresh}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-main)',
              cursor: isRefreshing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isRefreshing ? 0.6 : 1
            }}
          >
            <RefreshCw size={15} strokeWidth={2.2} className={isRefreshing ? 'animate-spin' : ''} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDark}
            aria-label={t.themeToggle}
            title={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
            style={{
              height: '36px',
              padding: '0 10px',
              borderRadius: 'var(--radius-sm)',
              border: isDark ? '1px solid var(--color-accent)' : '1px solid var(--color-primary)',
              backgroundColor: isDark ? 'var(--color-accent-bg)' : 'var(--color-primary-bg)',
              color: isDark ? 'var(--color-accent)' : 'var(--color-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: '800'
            }}
          >
            {isDark ? (
              <>
                <Sun size={15} strokeWidth={2.5} />
                <span>Terang</span>
              </>
            ) : (
              <>
                <Moon size={15} strokeWidth={2.5} />
                <span>Gelap</span>
              </>
            )}
          </button>

        </div>

      </div>

    </header>
  );
}
