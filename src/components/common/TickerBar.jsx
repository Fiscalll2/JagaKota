import React from 'react';
import { Megaphone } from 'lucide-react';

export function TickerBar({ items = [] }) {
  if (!items.length) return null;
  const text = items.join('  •  ');
  return (
    <div
      className="ticker-bar"
      role="marquee"
      aria-label={text}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        backgroundColor: 'var(--color-secondary)',
        color: '#ffffff',
        borderRadius: 'var(--radius-md)',
        padding: '0.45rem 0.85rem',
        marginBottom: '1rem',
        overflow: 'hidden',
        fontSize: '0.8rem',
        fontWeight: '600'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0, fontWeight: '800' }}>
        <Megaphone size={15} strokeWidth={2.5} />
        <span>INFO</span>
      </div>
      <div className="ticker-viewport" style={{ overflow: 'hidden', flex: 1, whiteSpace: 'nowrap' }}>
        <div className="ticker-track">
          <span style={{ paddingRight: '3rem' }}>{text}</span>
          <span style={{ paddingRight: '3rem' }}>{text}</span>
        </div>
      </div>
    </div>
  );
}
