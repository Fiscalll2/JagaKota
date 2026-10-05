import React, { useRef } from 'react';
import { Users, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ModeSwitch({ peran = 'warga', onPilihWarga, onBukaPetugas }) {
  const isPetugas = peran === 'petugas';
  const wargaRef = useRef(null);
  const petugasRef = useRef(null);

  const pilih = (target) => {
    if (target === 'warga') {
      if (!isPetugas) return;
      onPilihWarga?.();
    } else {
      if (isPetugas) return;
      onBukaPetugas?.();
    }
  };

  const onGroupKey = (e) => {
    const next = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 'petugas'
      : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? 'warga'
      : null;
    if (!next) return;
    e.preventDefault();

    const sudahAktif = (next === 'petugas') === isPetugas;
    if (!sudahAktif) {
      (next === 'warga' ? wargaRef : petugasRef).current?.focus();
    }
    pilih(next);
  };

  const opsi = 'relative z-10 flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[12px] font-extrabold transition-all duration-200 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1';

  return (
    <div className="w-full min-w-0 max-w-[280px]">
      <div
        role="radiogroup"
        aria-label="Mode peran"
        onKeyDown={onGroupKey}
        className="relative grid min-w-0 grid-cols-2 gap-0 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
      >

        <span
          aria-hidden
          className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm ring-1 ring-slate-200 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-slate-950 dark:ring-slate-700"
          style={{ transform: isPetugas ? 'translateX(100%)' : 'translateX(0)' }}
        />
        <button
          ref={wargaRef}
          type="button"
          role="radio"
          aria-checked={!isPetugas}
          tabIndex={!isPetugas ? 0 : -1}
          onClick={() => pilih('warga')}
          title="Mode warga: pantau & lapor"
          className={cn(opsi, !isPetugas ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400')}
        >
          <Users size={15} strokeWidth={2.4} className={cn('shrink-0 transition-all duration-300', !isPetugas && 'scale-110 text-emerald-600 dark:text-emerald-400')} />
          <span className="min-w-0 truncate">Warga</span>
          {!isPetugas && <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />}
        </button>
        <button
          ref={petugasRef}
          type="button"
          role="radio"
          aria-checked={isPetugas}
          tabIndex={isPetugas ? 0 : -1}
          onClick={() => pilih('petugas')}
          title="Mode petugas: verifikasi antrean (PIN)"
          className={cn(opsi, isPetugas ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400')}
        >
          <ShieldCheck size={15} strokeWidth={2.4} className={cn('shrink-0 transition-all duration-300', isPetugas && 'scale-110 text-amber-500')} />
          <span className="min-w-0 truncate">Petugas</span>
          <span className="shrink-0 rounded bg-amber-100 px-1 py-px text-[9px] font-black uppercase tracking-wider text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            PIN
          </span>
        </button>
      </div>
      <p className="mt-1.5 min-w-0 truncate px-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
        {isPetugas ? 'Memverifikasi antrean laporan' : 'Pantau & lapor • Petugas via PIN'}
      </p>
    </div>
  );
}

export default ModeSwitch;
