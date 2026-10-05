import React from 'react';

const WINDOWS = [
  [33.4, 58.5], [36.4, 58.5], [33.4, 63], [36.4, 63],
  [46, 42], [50.8, 42], [46, 49], [50.8, 49], [46, 56], [50.8, 56],
  [60.4, 54.5], [65, 54.5], [60.4, 60.5], [65, 60.5],
];

export function LogoMark({ size = 40, className = '', label, bare = false, cut = '#10b981' }) {
  const aria = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true, focusable: 'false' };
  const gedung = bare ? cut : '#10b981';

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" {...aria}>
      {!bare && <rect width="100" height="100" rx="22" fill="#10b981" />}
      <path
        d="M50 14 L80 24 V50 C80 68 66 80 50 88 C34 80 20 68 20 50 V24 Z"
        fill="#fff"
        stroke="#fff"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <g fill={gedung}>
        <rect x="31" y="55" width="10" height="13" rx="1.2" />
        <rect x="43" y="37" width="13" height="31" rx="1.2" />
        <rect x="48.7" y="30" width="1.6" height="8" rx="0.8" />
        <rect x="58" y="50" width="11" height="18" rx="1.2" />
        <rect x="60" y="44.5" width="7" height="6" rx="1" />
      </g>
      {size >= 28 && (
        <g fill="#fff">
          {WINDOWS.map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="2.6" height="2.6" rx="0.5" />
          ))}
        </g>
      )}
    </svg>
  );
}
