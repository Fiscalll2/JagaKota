import { LayoutDashboard, Wind, Siren, Map as MapIcon, BookOpen } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'ringkasan', label: 'Ringkasan', icon: LayoutDashboard },
  { id: 'udara', label: 'Udara', icon: Wind },
  { id: 'siaga', label: 'Siaga', icon: Siren },
  { id: 'peta', label: 'Peta', icon: MapIcon },
  { id: 'panduan', label: 'Panduan', icon: BookOpen },
];

export const NAV_IDS = NAV_ITEMS.map((n) => n.id);
export default NAV_ITEMS;
