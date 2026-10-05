import React from 'react';
import { sumberById } from '../../utils/sources';
import { SourceMark } from './SourceMark';

export function CardSource({ ids = [], right = null }) {
  if (!ids.length) return null;
  return (
    <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-[11px] dark:border-slate-800">
      <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 font-semibold text-slate-400">
        <span className="flex items-center gap-1">
          {ids.map((id) => (
            <SourceMark key={id} id={id} size={16} label={sumberById(id)?.nama} />
          ))}
        </span>
        <span className="shrink-0">Sumber:</span>
        <span className="min-w-0 truncate">
          {ids.map((id, i) => {
            const s = sumberById(id);
            if (!s) return null;
            return (
              <React.Fragment key={id}>
                {i > 0 && <span className="mx-1 text-slate-300 dark:text-slate-600">&</span>}
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${s.nama} — ${s.host}`}
                  className="font-bold text-slate-500 underline decoration-slate-200 underline-offset-2 transition hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300"
                >
                  {s.nama}
                </a>
              </React.Fragment>
            );
          })}
        </span>
      </span>
      {right && <span className="shrink-0 font-mono-k font-semibold text-slate-400">{right}</span>}
    </div>
  );
}
