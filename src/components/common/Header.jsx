import React from 'react';
import { MapPin, Compass, Search } from 'lucide-react';

/**
 * Header — bar kota khusus mobile (tampil hanya di bawah lg).
 * Di desktop konteks kota + semua aksi sudah ada di sidebar & ticker pill,
 * jadi header ini disembunyikan agar tidak duplikat.
 */
export function Header({
  location,
  onOpenSearch,
  onGpsClick,
  gpsLoading,
}) {
  const displayName = location?.name || 'Jakarta Pusat';
  const displayProvince = (location?.province && location?.province !== displayName)
    ? location.province
    : (displayName.includes('Jakarta') ? 'DKI Jakarta' : (location?.province || 'Indonesia'));

  return (
    <header className="mb-4 lg:hidden">
      <div className="flex min-w-0 flex-1 items-center gap-2">
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
    </header>
  );
}
