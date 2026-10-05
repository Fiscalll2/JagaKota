const HARI_PANJANG = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN_PANJANG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function zonaLokal(d) {
  const off = d.getTimezoneOffset();
  if (off === -420) return 'WIB';
  if (off === -480) return 'WITA';
  if (off === -540) return 'WIT';
  return 'WIB';
}

function dua(n) { return String(n).padStart(2, '0'); }

export function tanggalPenuhJaga(masukan = new Date()) {
  const d = masukan instanceof Date ? masukan : new Date(masukan);
  if (Number.isNaN(d.getTime())) return '-';
  try {
    const f = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(d);
    return `${f} ${zonaLokal(d)}`;
  } catch {
    return `${HARI_PANJANG[d.getDay()]}, ${d.getDate()} ${BULAN_PANJANG[d.getMonth()]} ${d.getFullYear()} • ${dua(d.getHours())}.${dua(d.getMinutes())} ${zonaLokal(d)}`;
  }
}

export const formatFullCurrentDate = tanggalPenuhJaga;

export function tanggalRingkasJaga(str) {
  if (!str) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(str));
  } catch { return String(str); }
}

export const formatShortDate = tanggalRingkasJaga;
export default tanggalPenuhJaga;
