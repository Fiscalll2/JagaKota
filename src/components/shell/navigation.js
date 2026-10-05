import { LayoutDashboard, Wind, AlertTriangle, Megaphone, Siren, LifeBuoy, Map as MapIcon } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'command-center', label: 'Command Center', icon: LayoutDashboard, target: 'seksi-command-center', gulirAtas: true },
  { id: 'udara', label: 'Kualitas Udara ISPU', icon: Wind, target: 'seksi-udara' },
  { id: 'siaga', label: 'Siaga Bencana & Gempa', icon: AlertTriangle, target: 'seksi-siaga' },
  { id: 'laporan', label: 'Kabari Warga', icon: Megaphone, action: 'share' },
  { id: 'lapor', label: 'Lapor Warga', icon: Siren, action: 'lapor' },
  { id: 'tolong', label: 'Minta Tolong', icon: LifeBuoy, action: 'tolong' },
  { id: 'sensor', label: 'Peta Pantauan', icon: MapIcon, target: 'seksi-sensor' },
];

export const NAV_IDS = NAV_ITEMS.map((n) => n.id);
export const SECTION_TARGETS = NAV_ITEMS.filter((n) => n.target).map((n) => n.target);
export default NAV_ITEMS;
