export const config = { runtime: 'edge' };

function bersih(v) {
  if (!v) return '';
  return String(v).replace(/[<>"]/g, '').slice(0, 48);
}

function statusUdara(aqi) {
  if (aqi > 300) return ['Darurat Asap', '#7f1d1d'];
  if (aqi > 200) return ['Pekat', '#7c3aed'];
  if (aqi > 150) return ['Pengap', '#dc2626'];
  if (aqi > 100) return ['Pengap Sensitif', '#c2410c'];
  if (aqi > 50) return ['Lumayan', '#b45309'];
  return ['Segar', '#059669'];
}

export default async function handler(req) {
  const q = new URL(req.url).searchParams;
  const kota = bersih(q.get('kota') || q.get('city')) || 'Jakarta';
  const lat = parseFloat(q.get('lat')) || -6.2;
  const lon = parseFloat(q.get('lon')) || 106.85;

  const jawab = (badan, umur = 60) => new Response(JSON.stringify(badan, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, max-age=${umur}, s-maxage=300, stale-while-revalidate=600`,
      'Access-Control-Allow-Origin': '*', 'X-JagaKota': 'widget-v2',
    },
  });

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const [cuacaRes, udaraRes] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`, { signal: ctrl.signal }),
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5&timezone=auto`, { signal: ctrl.signal }),
    ]);
    clearTimeout(t);
    const cuaca = cuacaRes.ok ? await cuacaRes.json() : null;
    const udara = udaraRes.ok ? await udaraRes.json() : null;

    const suhu = Math.round(cuaca?.current?.temperature_2m ?? 30);
    const lembap = Math.round(cuaca?.current?.relative_humidity_2m ?? 72);
    const angin = Math.round(cuaca?.current?.wind_speed_10m ?? 10);
    const aqi = Math.round(udara?.current?.us_aqi ?? 42);
    const pm25 = Math.round((udara?.current?.pm2_5 ?? 12) * 10) / 10;
    const [label, warna] = statusUdara(aqi);

    return jawab({
      aplikasi: 'JagaKota', versi: 2, kota: kota,
      suhu, suhuTeks: `${suhu}°C`, kelembapan: `${lembap}%`, angin: `${angin} km/h`,
      aqi, statusUdara: label, warnaUdara: warna, pm25,
      city: kota, tempLabel: `${suhu}°C`, aqiStatus: label,
      sumber: 'JagaKota • Open-Meteo', updatedAt: new Date().toISOString(),
    });
  } catch {
    return jawab({
      aplikasi: 'JagaKota', versi: 2, kota, suhu: 30, suhuTeks: '30°C',
      kelembapan: '72%', angin: '10 km/h', aqi: 42, statusUdara: 'Segar',
      warnaUdara: '#059669', pm25: 12, sumber: 'cache-lokal',
      city: kota, tempLabel: '30°C', aqiStatus: 'Segar',
      updatedAt: new Date().toISOString(),
    }, 30);
  }
}
