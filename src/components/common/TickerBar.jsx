import React from 'react';
import { Megaphone, Bell, BellRing, RefreshCw, Sun, Moon, Download } from 'lucide-react';
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

function TombolLingkar({ label, judul, onClick, disabled, aktif, children }) {
  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={judul || label}
      className={`ticker-btn h-8 max-h-8 min-h-0 w-8 min-w-0 shrink-0 rounded-full border-[var(--border-flat)] bg-[var(--bg-card)] p-0 [&_svg]:size-4 ${
        aktif ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-300'
      }`}
    >
      {children}
    </Button>
  );
}

/**
 * TickerBar — pill command bar ala referensi stitch:
 * badge INFO + running text + tombol aksi (install app, notif, refresh, tema, avatar JK).
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
  installApp = null,
}) {
  if (!items.length) return null;
  const text = items.join('  •  ');

  const keAtas = () => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  };

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

      <div className="flex shrink-0 items-center gap-1.5">
        {installApp && (
          <Button
            type="button"
            size="sm"
            onClick={installApp}
            className="ticker-btn hidden min-h-0 items-center rounded-full px-3 py-1.5 text-xs md:inline-flex"
          >
            <Download size={14} strokeWidth={2.5} />
            Buka di aplikasi
          </Button>
        )}
        <TombolLingkar
          label={notificationsEnabled ? 'Notifikasi aktif' : 'Nyalakan pengingat cuaca'}
          onClick={onRequestNotification}
          aktif={notificationsEnabled}
        >
          {notificationsEnabled
            ? <BellRing size={16} strokeWidth={2.5} />
            : <Bell size={16} strokeWidth={2.2} />}
        </TombolLingkar>
        <TombolLingkar
          label="Muat ulang data kota"
          judul="Tarik data terbaru"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw size={15} strokeWidth={2.2} className={isRefreshing ? 'animate-spin' : ''} />
        </TombolLingkar>
        <TombolLingkar
          label="Ganti mode terang/gelap"
          judul={isDark ? 'Balik ke mode terang' : 'Istirahatkan mata, mode gelap'}
          onClick={onToggleDark}
          aktif={isDark}
        >
          {isDark ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.4} />}
        </TombolLingkar>
        <button
          type="button"
          onClick={keAtas}
          title="Kembali ke atas"
          aria-label="Kembali ke atas"
          className="ticker-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-[11px] font-black tracking-tight text-white transition hover:bg-emerald-700"
        >
          JK
        </button>
      </div>
    </div>
  );
}
