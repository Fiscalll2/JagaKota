import React from 'react';
import { sumberById } from '../../utils/sources';

function Glif({ id }) {
  switch (id) {
    case 'bmkg':
      return <path d="M3 12h3l2-5 3 10 2.5-7 1.5 2H21" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
    case 'magma':
      return (
        <g>
          <path d="M4 19L10 7h4l6 12z" fill="#fff" opacity="0.95" />
          <circle cx="12" cy="5" r="1.6" fill="#fff" opacity="0.7" />
          <path d="M10 19l1.5-5h1L14 19z" fill="#ea580c" />
        </g>
      );
    case 'firms':
      return (
        <g>
          <circle cx="12" cy="12" r="3.2" fill="#fff" />
          <circle cx="12" cy="12" r="1.3" fill="#b45309" />
          <ellipse cx="12" cy="12" rx="9" ry="4.2" fill="none" stroke="#fff" strokeWidth="1.6" opacity="0.8" transform="rotate(-24 12 12)" />
          <circle cx="19.5" cy="7.5" r="1.4" fill="#fff" />
        </g>
      );
    case 'sipongi':
      return (
        <g>
          <path d="M12 3C7 8 6 14 12 21c6-7 5-13 0-18z" fill="#fff" opacity="0.95" />
          <path d="M12 7v11" stroke="#15803d" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      );
    case 'openmeteo':
    default:
      return (
        <g>
          <circle cx="9" cy="9" r="3.4" fill="#fff" opacity="0.9" />
          <path d="M8 20h9.5a3.5 3.5 0 000-7H16a5 5 0 00-9.6 1.6A3 3 0 008 20z" fill="#fff" />
        </g>
      );
  }
}

export function SourceMark({ id = 'openmeteo', size = 24, className = '', label }) {
  const meta = sumberById(id);
  const aria = label || meta?.nama
    ? { role: 'img', 'aria-label': label || meta.nama }
    : { 'aria-hidden': true, focusable: 'false' };
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={{ flexShrink: 0, borderRadius: 7, backgroundColor: meta?.warna || '#64748b' }}
      xmlns="http://www.w3.org/2000/svg"
      {...aria}
    >
      <Glif id={id} />
    </svg>
  );
}
