import React, { useState } from 'react';
import { Compass, Sun, Moon, ShieldAlert } from 'lucide-react';
import { NAV_ITEMS } from './navigation';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

function BrandMark({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-secondary)] text-white shadow-sm">
        <Compass size={22} strokeWidth={2.5} />
      </div>
      {!compact && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-lg font-extrabold tracking-tight text-[var(--text-main)]">
              JagaKota
            </span>
            <Badge className="hidden sm:inline-flex">Live</Badge>
          </div>
          <p className="truncate text-[11px] font-medium text-[var(--text-muted)]">
            Smart City Monitor
          </p>
        </div>
      )}
    </div>
  );
}

export function AppShell({
  header,
  banners,
  panels,
  footer,
  isDark,
  onToggleDark,
  onOpenEmergency,
  defaultTab = 'ringkasan'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] font-sans text-[var(--text-main)] antialiased">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px]">
        {/* ============ SIDEBAR (desktop) ============ */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r-2 border-[var(--border-flat)] bg-[var(--bg-card)] px-4 py-6 lg:flex">
          <BrandMark />
          <nav className="mt-8 flex flex-col gap-1" aria-label="Navigasi utama">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-bold transition-colors',
                    active
                      ? 'bg-[var(--color-secondary-bg)] text-[var(--color-secondary-hover)] shadow-xs'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-main)]'
                  )}
                >
                  <Icon size={18} strokeWidth={2.4} />
                  {item.label}
                  {active && <span className="ml-auto h-5 w-1 rounded-full bg-[var(--color-secondary)]" />}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto flex flex-col gap-2">
            <Button variant="destructive" size="sm" onClick={onOpenEmergency} className="w-full">
              <ShieldAlert /> Darurat 112
            </Button>
            <Button variant="outline" size="sm" onClick={onToggleDark} className="w-full" aria-label="Ganti tema">
              {isDark ? <Sun /> : <Moon />}
              {isDark ? 'Mode Terang' : 'Mode Gelap'}
            </Button>
          </div>
        </aside>

        {/* ============ MAIN COLUMN ============ */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <div className="sticky top-0 z-40 border-b-2 border-[var(--border-flat)] bg-[var(--bg-card)]/95 px-4 py-3 backdrop-blur lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-secondary)] text-white shadow-sm">
                <Compass size={20} strokeWidth={2.5} />
              </div>
              <span className="text-base font-extrabold tracking-tight text-[var(--text-main)]">
                {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
              </span>
              <Badge className="ml-auto">Live</Badge>
            </div>
          </div>

          <main className="w-full flex-1 px-4 pb-28 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pb-12">
            <div className="mx-auto w-full max-w-[1020px]">
              {header}
              {banners}
              <section key={activeTab} className="animate-[fadeSlideIn_200ms_ease-out]">
                {panels[activeTab]}
              </section>
              {footer}
            </div>
          </main>

          {/* ============ BOTTOM NAV (mobile) ============ */}
          <nav
            aria-label="Navigasi utama"
            className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-[var(--border-flat)] bg-[var(--bg-card)]/97 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
          >
            <div className="grid grid-cols-4">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-[60px] cursor-pointer flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors',
                      active ? 'text-[var(--color-secondary-hover)]' : 'text-[var(--text-muted)]'
                    )}
                  >
                    <Icon size={20} strokeWidth={active ? 2.6 : 2.2} />
                    {item.label}
                    <span
                      className={cn(
                        'h-1 w-8 rounded-full transition-colors',
                        active ? 'bg-[var(--color-secondary)]' : 'bg-transparent'
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
