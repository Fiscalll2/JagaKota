export const config = { runtime: 'edge' };

function amanXml(v) {
  if (v === null || v === undefined) return '';
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').slice(0, 48);
}

function warnaSegar(aqi) {
  if (aqi > 300) return '#7f1d1d';
  if (aqi > 200) return '#7c3aed';
  if (aqi > 150) return '#dc2626';
  if (aqi > 100) return '#ea580c';
  if (aqi > 50) return '#b45309';
  return '#059669';
}

function labelWarga(aqi) {
  if (aqi > 300) return 'Darurat Asap';
  if (aqi > 200) return 'Pekat';
  if (aqi > 150) return 'Pengap';
  if (aqi > 100) return 'Pengap Ringan';
  if (aqi > 50) return 'Lumayan';
  return 'Segar';
}

export default function handler(req) {
  const q = new URL(req.url).searchParams;
  const kota = amanXml(q.get('kota') || q.get('city') || 'Nusantara');
  const aqi = Math.min(999, Math.max(0, parseInt(q.get('aqi') || '42', 10) || 0));
  const suhu = Math.min(60, Math.max(-50, parseInt(q.get('suhu') || q.get('temp') || '30', 10) || 0));

  const warna = warnaSegar(aqi);
  const status = labelWarga(aqi);
  const kiri = '◈ JagaKota';
  const tengah = `${kota} • ${suhu}°C`;
  const kanan = `AQI ${aqi} ${status}`;

  const lk = 92;
  const lt = Math.max(96, Math.round(tengah.length * 7) + 22);
  const lk2 = Math.max(118, Math.round(kanan.length * 7) + 22);
  const total = lk + lt + lk2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="30" viewBox="0 0 ${total} 30"><rect width="${total}" height="30" rx="7" fill="#0f172a"/><rect width="${lk}" height="30" rx="7" fill="#059669"/><text x="12" y="20" font-family="system-ui,sans-serif" font-size="12" font-weight="800" fill="#fff">${kiri}</text><text x="${lk + 12}" y="20" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#e2e8f0">${tengah}</text><rect x="${lk + lt}" width="${lk2}" height="30" rx="7" fill="${warna}"/><text x="${lk + lt + 12}" y="20" font-family="system-ui,sans-serif" font-size="11" font-weight="800" fill="#fff">${kanan}</text></svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
      'X-JagaKota': 'lencana-v2',
    },
  });
}
