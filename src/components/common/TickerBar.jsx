import React from 'react';
import { Megaphone, Bell, BellRing, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

function Rangkaian({ items = [], sembunyi = false }) {
  return (
    <span aria-hidden={sembunyi || undefined} className="inline-flex items-center">
      {items.map((teks, i) => (
        <span key={i} className="inline-flex items-center whitespace-nowrap">
          <span className="px-3 text-[12.5px] font-semibold text-[var(--text-main)]">{teks}</span>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" aria-hidden />
        </span>
      ))}
    </span>
  );
}

function Segmen({ label, judul, onClick, disabled, aktif, className = '', children }) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={judul || label}
      className={`relative h-7 max-h-7 min-h-0 w-9 min-w-0 shrink-0 rounded-full p-0 transition-all duration-200 active:scale-90 [&_svg]:size-4 ${className} ${
        aktif
          ? 'bg-emerald-600/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300'
          : 'text-slate-500 hover:bg-[var(--bg-card)] hover:text-slate-800 dark:text-slate-300 dark:hover:text-white'
      }`}
    >
      {children}
    </Button>
  );
}

function Pembatas() {
  return <span aria-hidden className="h-4 w-px shrink-0 bg-[var(--border-flat)]" />;
}

/**
 * TickerBar — pill command bar: badge INFO + running text + dock aksi tersegmentasi.
 * Kabari Warga TIDAK di sini — tetap di sidebar sebagai aksi independen.
 */
export function TickerBar({
  items = [],
  notificationsEnabled,
  onRequestNotification,
  onRefresh,
  isRefreshing,
  isDark,
  onToggleDark,
}) {
  if (!items.length) return null;
  const text = items.join('  •  ');

  return (
    <div
      className="ticker-pill ticker-bar mb-4 flex items-center gap-1.5 rounded-full border-2 border-[var(--border-flat)] bg-[var(--bg-card)] py-1.5 pl-1.5 pr-1.5 sm:gap-2 sm:pl-2 sm:pr-2"
      role="marquee"
      aria-label={text}
    >
      <Badge className="shrink-0 gap-1 rounded-full px-2.5 py-1 text-[11px]">
        <Megaphone size={13} strokeWidth={2.75} />
        INFO
      </Badge>

      <div className="ticker-viewport min-w-0 flex-1">
        <div className="ticker-track">
          <Rangkaian items={items} />
          <Rangkaian items={items} sembunyi />
        </div>
      </div>

      <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
        {/* Dock ticker hanya untuk desktop: di mobile dock pindah ke top bar. */}
        {/* Dock aksi: satu strip menyatu, bukan lingkaran lepas */}
        <div
          role="toolbar"
          aria-label="Aksi cepat"
          className="ticker-btn flex items-center gap-0.5 rounded-full border-2 border-[var(--border-flat)] bg-[var(--bg-muted)]/70 p-1"
        >
          <Segmen
            label={notificationsEnabled ? 'Notifikasi aktif' : 'Nyalakan pengingat cuaca'}
            onClick={onRequestNotification}
            aktif={notificationsEnabled}
            className="seg-bell group"
          >
            {notificationsEnabled ? (
              <>
                <BellRing size={16} strokeWidth={2.5} className="bell-ikon" />
                <span aria-hidden className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </>
            ) : (
              <>
                <Bell size={16} strokeWidth={2.2} className="bell-ikon group-hover:hidden" />
                <BellRing size={16} strokeWidth={2.5} className="bell-ikon hidden group-hover:block" />
              </>
            )}
          </Segmen>
          <Pembatas />
          <Segmen
            label="Muat ulang data kota"
            judul="Tarik data terbaru"
            onClick={onRefresh}
            disabled={isRefreshing}
            aktif={isRefreshing}
          >
            <span aria-hidden className={`orbit-loop ${isRefreshing ? 'orbit-cepat' : ''}`}>
              <span className="orbit-ring" />
              <span className="orbit-spin" />
              <span className="orbit-inti" />
            </span>
          </Segmen>
          <Pembatas />
          {/* Mode gelap disembunyikan di layar sempit (<420px): sudah ada di drawer. */}
          <span className="hidden min-[420px]:contents">
            <Pembatas />
            <Segmen
              label="Ganti mode terang/gelap"
              judul={isDark ? 'Balik ke mode terang' : 'Istirahatkan mata, mode gelap'}
              onClick={onToggleDark}
              aktif={isDark}
            >
              {isDark ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.4} />}
            </Segmen>
          </span>
        </div>
      </div>
    </div>
  );
}
