import React from 'react';
import { MapPin, RefreshCw, Compass, Bell, BellRing, Search, CalendarDays, Share2, ShieldAlert, Sun, Moon } from 'lucide-react';
import { tanggalPenuhJaga } from '../../utils/format';
import { LogoMark } from './LogoMark';

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
  onOpenEmergency,
  hideBrand = false,
}) {
  const displayName = location?.name || 'Jakarta Pusat';
  const displayProvince = (location?.province && location?.province !== displayName)
    ? location.province
    : (displayName.includes('Jakarta') ? 'DKI Jakarta' : (location?.province || 'Indonesia'));

  return (
    <header className="mb-6">
      {!hideBrand && (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <LogoMark size={44} className="block shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">JagaKota</h1>
              <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">Live</span>
            </div>
            <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Pantau udara, cuaca & siaga bencana</span>
              <span aria-hidden>•</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300">
                <CalendarDays size={12} strokeWidth={2.5} />
                {tanggalPenuhJaga(lastUpdated || new Date())}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenShare}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
          >
            <Share2 size={16} strokeWidth={2.5} />
            Kabari Warga
          </button>
          <button
            onClick={onOpenEmergency}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-bold text-red-700 transition hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            <ShieldAlert size={16} strokeWidth={2.5} />
            Darurat 112
          </button>
        </div>
      </div>
      )}

      {/* Baris kota + GPS: hanya mobile. Di desktop konteks kota sudah ada di pil lokasi sidebar. */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 lg:mt-0 lg:justify-end">
        <div className="flex min-w-0 flex-1 items-center gap-2 lg:hidden" style={{ flexBasis: 280 }}>
          <button
            onClick={onOpenSearch}
            className="flex min-h-10 flex-1 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900"
          >
            <span className="flex min-w-0 items-center gap-2">
              <MapPin size={16} className="shrink-0 text-emerald-600" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-slate-800 dark:text-slate-100">{displayName}</span>
                <span className="block truncate text-[11px] text-slate-500">{displayProvince}</span>
              </span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <Search size={12} /> Ganti kota
            </span>
          </button>

          <button
            onClick={onGpsClick}
            disabled={gpsLoading}
            aria-label="Pakai lokasi saya"
            title="Pakai lokasi saya biar info kotamu akurat"
            className={`flex min-h-10 min-w-10 items-center justify-center rounded-xl border px-2 shadow-sm transition ${location?.isGps ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
          >
            <Compass size={17} strokeWidth={2.2} className={gpsLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
          <button
            onClick={onRequestNotification}
            aria-label={notificationsEnabled ? 'Notifikasi aktif' : 'Nyalakan pengingat cuaca'}
            title={notificationsEnabled ? 'Siap! Kamu bakal dikabari.' : 'Nyalakan biar nggak ketinggalan info penting'}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${notificationsEnabled ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-300' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'}`}
          >
            {notificationsEnabled ? <BellRing size={16} strokeWidth={2.5} /> : <Bell size={16} strokeWidth={2.2} />}
          </button>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Muat ulang data kota"
            title="Tarik data terbaru"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:text-slate-900 disabled:opacity-60 dark:text-slate-300"
          >
            <RefreshCw size={15} strokeWidth={2.2} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onToggleDark}
            aria-label="Ganti mode terang/gelap"
            title={isDark ? 'Balik ke mode terang' : 'Istirahatkan mata, mode gelap'}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${isDark ? 'bg-slate-900 text-amber-300' : 'bg-white text-slate-700 shadow-sm dark:bg-slate-900 dark:text-amber-300'}`}
          >
            {isDark ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.4} />}
          </button>
        </div>
      </div>
    </header>
  );
}
