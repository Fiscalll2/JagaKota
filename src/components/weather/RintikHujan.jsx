import React from 'react';

export function RintikHujan({ deras = false, garis = '#0284C7', awan = '#E0F2FE', className = 'h-9 w-9' }) {
  const tetes = deras
    ? [[12, 10, 23, 28, 1], [17, 15, 23, 29, 2], [22, 20, 23, 28, 3]]
    : [[12, 10, 23, 28, 1], [18, 16, 23, 28, 2]];

  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true" focusable="false">
      <path
        className="awan-napas"
        d="M10 20C7.79 20 6 18.21 6 16C6 14.07 7.37 12.46 9.19 12.09C9.79 8.65 12.78 6 16.4 6C20.32 6 23.53 9.07 23.82 12.95C25.68 13.36 27 15.02 27 17C27 19.21 25.21 21 23 21H10"
        fill={awan}
        stroke={garis}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {tetes.map(([x1, x2, y1, y2, v]) => (
        <line
          key={v}
          className={`tetes-${v}`}
          stroke={garis}
          strokeLinecap="round"
          strokeWidth="2"
          x1={x1}
          x2={x2}
          y1={y1}
          y2={y2}
        />
      ))}
    </svg>
  );
}

export default RintikHujan;
