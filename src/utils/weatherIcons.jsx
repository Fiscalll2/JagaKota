import React from 'react';
import {
  Sun, Sunrise, CloudSun, Cloudy, CloudFog, CloudDrizzle,
  CloudRain, CloudRainWind, CloudLightning, Snowflake,
} from 'lucide-react';

// JagaKota — tabel WMO gaya warga (label lebih pendek, palet sendiri)
const TABEL = [
  { kode: [0], label: 'Terik Cerah', icon: Sun, warna: '#d97706', bg: '#fffbeb' },
  { kode: [1], label: 'Cerah Berawan', icon: Sunrise, warna: '#d97706', bg: '#fffbeb' },
  { kode: [2], label: 'Mendung Tipis', icon: CloudSun, warna: '#2563eb', bg: '#eff6ff' },
  { kode: [3], label: 'Mendung Tebal', icon: Cloudy, warna: '#475569', bg: '#f1f5f9' },
  { kode: [45, 48], label: 'Kabut Pagi', icon: CloudFog, warna: '#64748b', bg: '#f8fafc' },
  { kode: [51, 53, 55, 56, 57], label: 'Rintik', icon: CloudDrizzle, warna: '#0284c7', bg: '#f0f9ff' },
  { kode: [61], label: 'Hujan Rintik', icon: CloudRain, warna: '#1d4ed8', bg: '#eff6ff' },
  { kode: [63], label: 'Hujan Sedang', icon: CloudRain, warna: '#1e40af', bg: '#dbeafe' },
  { kode: [65, 66, 67], label: 'Hujan Lebat', icon: CloudRainWind, warna: '#1e3a8a', bg: '#dbeafe' },
  { kode: [71, 73, 75, 77], label: 'Salju Puncak', icon: Snowflake, warna: '#0284c7', bg: '#f0f9ff' },
  { kode: [80], label: 'Hujan Lokal', icon: CloudRain, warna: '#1d4ed8', bg: '#eff6ff' },
  { kode: [81, 82], label: 'Hujan Deras', icon: CloudRainWind, warna: '#1e40af', bg: '#dbeafe' },
  { kode: [85, 86], label: 'Hujan Es', icon: Snowflake, warna: '#0284c7', bg: '#f0f9ff' },
  { kode: [95], label: 'Petir', icon: CloudLightning, warna: '#6d28d9', bg: '#f5f3ff' },
  { kode: [96, 99], label: 'Badai Petir', icon: CloudLightning, warna: '#5b21b6', bg: '#ede9fe' },
];

const JATUH = { label: 'Cerah Berawan', icon: CloudSun, color: '#2563eb', bg: '#eff6ff' };

export function visualCuaca(kode) {
  const c = Number(kode) || 0;
  const baris = TABEL.find((b) => b.kode.includes(c));
  if (!baris) return JATUH;
  return { label: baris.label, icon: baris.icon, color: baris.warna, bg: baris.bg };
}

export const getWeatherVisual = visualCuaca;
export default visualCuaca;
