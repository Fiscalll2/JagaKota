import { LayoutDashboard, Wind, AlertTriangle, Megaphone, Map as MapIcon } from 'lucide-react';

// JagaKota — navigasi gaya Civic Guard (lihat referensi desain sidebar).
// - `target` : id elemen section di halaman utama (navigasi anchor / scroll).
// - `action` : aksi khusus tanpa section (mis. 'share' membuka modal Kabari Warga).
export const NAV_ITEMS = [
  { id: 'command-center', label: 'Command Center', icon: LayoutDashboard, target: 'seksi-command-center' },
  { id: 'udara', label: 'Kualitas Udara ISPU', icon: Wind, target: 'seksi-udara' },
  { id: 'siaga', label: 'Siaga Bencana & Gempa', icon: AlertTriangle, target: 'seksi-siaga' },
  { id: 'laporan', label: 'Kabari Warga', icon: Megaphone, action: 'share' },
  { id: 'sensor', label: 'Peta Pantauan', icon: MapIcon, target: 'seksi-sensor' },
];

export const NAV_IDS = NAV_ITEMS.map((n) => n.id);
export const SECTION_TARGETS = NAV_ITEMS.filter((n) => n.target).map((n) => n.target);
export default NAV_ITEMS;
