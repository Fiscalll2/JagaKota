import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Menu, X, Sun, Moon, Bell, ShieldCheck, Compass, ChevronRight, Download } from 'lucide-react';
import { LogoMark } from '../common/LogoMark';
import { NAV_ITEMS, SECTION_TARGETS } from './navigation';
import { ModeSwitch } from './ModeSwitch';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

function BrandCivic({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={compact ? 34 : 38} className="block shrink-0" />
      <div className="min-w-0">
        <p className="truncate text-[17px] font-black leading-tight tracking-tight text-[var(--text-main)]">
          JAGAKOTA
        </p>
        <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Civic Guard ID
        </p>
      </div>
    </div>
  );
}

function LocationPill({ location, onOpenSearch, onGpsClick, gpsLoading }) {
  const displayName = location?.name || 'Jakarta Pusat';
  const displayProvince = location?.province && location.province !== displayName
    ? location.province
    : (displayName.includes('Jakarta') ? 'DKI Jakarta' : (location?.province || 'Indonesia'));

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <button
        type="button"
        onClick={onOpenSearch}
        title={`Ganti kota pantauan (saat ini: ${displayName}${displayProvince ? `, ${displayProvince}` : ''})`}
        className="flex min-w-0 min-h-[52px] flex-1 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-left transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-bold text-slate-800 dark:text-slate-100">
            {displayName}
          </span>
          <span className="block truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {displayProvince}
          </span>
        </span>
        <span className="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">
          Aktif
        </span>
        <ChevronRight size={14} className="hidden shrink-0 text-slate-400 min-[420px]:block" />
      </button>
      <button
        type="button"
        onClick={onGpsClick}
        disabled={gpsLoading}
        aria-label="Pakai lokasi saya"
        title="Pakai lokasi saya biar info kotamu akurat"
        className={cn(
          'flex min-h-[52px] w-11 shrink-0 items-center justify-center rounded-xl border-2 transition',
          location?.isGps
            ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
            : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
        )}
      >
        <Compass size={17} strokeWidth={2.2} className={gpsLoading ? 'animate-spin' : ''} />
      </button>
    </div>
  );
}

const SCROLL_ITEMS = NAV_ITEMS.filter((n) => n.target);
const ACTION_ITEMS = NAV_ITEMS.filter((n) => n.action);

function CivicNav({ activeId, onNavigate }) {
  const containerRef = useRef(null);
  const btnRefs = useRef(new Map());
  const [pil, setPil] = useState({ top: 0, height: 0, tampil: false });

  const ukurPil = useCallback(() => {
    const btn = btnRefs.current.get(activeId);
    if (btn) setPil({ top: btn.offsetTop, height: btn.offsetHeight, tampil: true });
  }, [activeId]);

  useLayoutEffect(() => {
    ukurPil();
  }, [activeId, ukurPil]);

  useEffect(() => {
    window.addEventListener('resize', ukurPil);
    const t = setTimeout(ukurPil, 120);
    return () => {
      window.removeEventListener('resize', ukurPil);
      clearTimeout(t);
    };
  }, [ukurPil]);

  return (
    <nav ref={containerRef} className="relative flex flex-col gap-1.5" aria-label="Navigasi utama">

      <span
        aria-hidden
        className="absolute left-0 right-0 rounded-xl bg-emerald-700 dark:bg-emerald-600"
        style={{
          top: pil.top,
          height: pil.height || 46,
          opacity: pil.tampil ? 1 : 0,
          transition:
            'top 300ms cubic-bezier(0.22, 1, 0.36, 1), height 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms ease-out',
        }}
      />
      {SCROLL_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = activeId === item.id;
        return (
          <button
            key={item.id}
            ref={(el) => {
              if (el) btnRefs.current.set(item.id, el);
              else btnRefs.current.delete(item.id);
            }}
            type="button"
            onClick={() => onNavigate(item)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative z-10 flex min-h-[46px] cursor-pointer items-center gap-2 rounded-xl bg-transparent px-3 text-[13.5px] font-bold transition-colors duration-200',
              active
                ? 'text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
            )}
          >
            <Icon size={18} strokeWidth={active ? 2.5 : 2.1} className="shrink-0" />
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function CivicActions({ onNavigate }) {
  if (!ACTION_ITEMS.length) return null;
  return (
    <div className="border-t-2 border-slate-100 pt-4 dark:border-slate-800">
      <p className="mb-2 px-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
        Aksi Warga
      </p>
      <div className="flex flex-col gap-1.5">
        {ACTION_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item)}
              className="flex min-h-[46px] cursor-pointer items-center gap-2 rounded-xl border-2 border-emerald-600/25 bg-emerald-50 px-3 text-[13.5px] font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-950"
            >
              <Icon size={18} strokeWidth={2.2} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AppShell({
  location,
  onOpenSearch,
  onGpsClick,
  gpsLoading,
  isDark,
  onToggleDark,
  onOpenEmergency,
  onOpenShare,
  onOpenLapor,
  onOpenPetugas,
  peran = 'warga',
  onModeWarga,
  notificationsEnabled,
  onRequestNotification,
  onRefresh,
  isRefreshing,
  children,
  bisaPrompt = false,
  sudahPasang = false,
  onOpenInstall,
}) {
  const [activeId, setActiveId] = useState('command-center');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavigate = (item) => {
    if (item.action === 'share') {
      setDrawerOpen(false);
      onOpenShare?.();
      return;
    }
    if (item.action === 'lapor') {
      setDrawerOpen(false);
      onOpenLapor?.();
      return;
    }
    if (item.action === 'tolong') {
      setDrawerOpen(false);
      onOpenEmergency?.();
      return;
    }
    setActiveId(item.id);
    setDrawerOpen(false);
    if (item.gulirAtas) {

      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    requestAnimationFrame(() => {
      document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  useEffect(() => {
    const targets = SECTION_TARGETS.map((t) => document.getElementById(t)).filter(Boolean);
    if (!targets.length || typeof IntersectionObserver === 'undefined') return;
    const targetToId = new Map(NAV_ITEMS.filter((n) => n.target).map((n) => [n.target, n.id]));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = targetToId.get(entry.target.id);
            if (id) setActiveId(id);
          }
        }
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setDrawerOpen(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const sidebarInner = (
    <>
      <LocationPill
        location={location}
        onOpenSearch={() => { setDrawerOpen(false); onOpenSearch?.(); }}
        onGpsClick={onGpsClick}
        gpsLoading={gpsLoading}
      />

      <ModeSwitch
        peran={peran}
        onPilihWarga={onModeWarga}
        onBukaPetugas={() => { setDrawerOpen(false); onOpenPetugas?.(); }}
      />
      <CivicNav activeId={activeId} onNavigate={handleNavigate} />
      <CivicActions onNavigate={handleNavigate} />

      {!sudahPasang && onOpenInstall && (
        <div className="mt-1 border-t-2 border-slate-100 pt-3 dark:border-slate-800">
          <p className="mb-2 px-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            Aplikasi
          </p>
          <button
            type="button"
            onClick={() => { setDrawerOpen(false); onOpenInstall(); }}
            className="flex min-h-[46px] w-full cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-emerald-600/50 bg-emerald-50/60 px-3 text-[13.5px] font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950"
          >
          <span className="relative shrink-0">
            <Download size={18} strokeWidth={2.2} />
            {bisaPrompt && (
              <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
              </span>
            )}
          </span>
          <span className="truncate">Pasang Aplikasi</span>
          {bisaPrompt && (
            <span className="ml-auto shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
              1 ketuk
            </span>
          )}
          </button>
        </div>
      )}
      <div className="mt-auto flex flex-col gap-2 pt-4">
        <div className="flex items-start gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
          <ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-[10.5px] font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
            Data resmi BMKG • PVMBG • KLHK • NASA. Selalu cek kanal resmi untuk keputusan darurat.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onToggleDark} className="w-full" aria-label="Ganti tema">
          {isDark ? <Sun /> : <Moon />}
          {isDark ? 'Mode Terang' : 'Mode Gelap'}
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] font-sans text-[var(--text-main)] antialiased">

      <div className="flex min-h-screen w-full">

        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r-2 border-[var(--border-flat)] bg-[var(--bg-card)] px-5 py-6 lg:flex">
          <div className="flex h-full min-w-0 flex-col gap-5">
            <BrandCivic />
            {sidebarInner}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">

          <div className="sticky top-0 z-40 bg-[var(--bg-card)]/95 px-4 py-3 backdrop-blur lg:hidden">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Buka menu navigasi"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 text-slate-700 transition hover:border-emerald-500 dark:border-slate-700 dark:text-slate-200"
              >
                <Menu size={19} strokeWidth={2.4} />
              </button>
              <LogoMark size={34} className="block shrink-0" />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-[15px] font-black tracking-tight">JAGAKOTA</p>
                <p className="truncate text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Civic Guard ID
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                Live
              </span>
              <div className="flex shrink-0 items-center gap-1" role="toolbar" aria-label="Aksi cepat">
                <button
                  type="button"
                  onClick={onRequestNotification}
                  aria-label={notificationsEnabled ? 'Notifikasi aktif' : 'Nyalakan pengingat cuaca'}
                  className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition dark:border-slate-700 dark:text-slate-300"
                >
                  <Bell size={15} strokeWidth={2.4} />
                  {notificationsEnabled && (
                    <span aria-hidden className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  aria-label="Muat ulang data kota"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition dark:border-slate-700 dark:text-slate-300"
                >
                  <span aria-hidden className={`orbit-loop ${isRefreshing ? 'orbit-cepat' : ''}`}>
                    <span className="orbit-ring" />
                    <span className="orbit-spin" />
                    <span className="orbit-inti" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onToggleDark}
                  aria-label="Ganti mode terang/gelap"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition dark:border-slate-700 dark:text-slate-300"
                >
                  {isDark ? <Sun size={15} strokeWidth={2.4} /> : <Moon size={15} strokeWidth={2.4} />}
                </button>
              </div>
            </div>
          </div>

          <main className="w-full flex-1 px-4 pb-12 pt-4 sm:px-6 sm:pt-6 lg:px-10">
            <div className="mx-auto w-full max-w-[1100px]">
              {children}
            </div>
          </main>
        </div>
      </div>

      <div
        className={cn(
          'fixed inset-0 z-50 bg-slate-950/60 transition-opacity lg:hidden',
          drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[320px] bg-[var(--bg-card)] p-5 transition-transform duration-200 ease-out lg:hidden',
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi JagaKota"
        aria-hidden={!drawerOpen}
        inert={!drawerOpen}
      >
        <div className="mb-5 flex items-center justify-between">
          <BrandCivic compact />
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Tutup menu navigasi"
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-slate-200 text-slate-600 transition hover:border-emerald-500 dark:border-slate-700 dark:text-slate-300"
          >
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>
        <div className="flex h-[calc(100%-52px)] min-w-0 flex-col gap-5 overflow-y-auto">
          {sidebarInner}
        </div>
      </aside>
    </div>
  );
}
