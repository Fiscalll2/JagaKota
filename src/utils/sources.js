import React from 'react';

export const SUMBER_DATA = [
  {
    id: 'bmkg',
    nama: 'BMKG',
    host: 'bmkg.go.id',
    url: 'https://www.bmkg.go.id',
    umpan: 'Gempa real-time',
    warna: '#1d4ed8',
  },
  {
    id: 'magma',
    nama: 'PVMBG Magma',
    host: 'magma.esdm.go.id',
    url: 'https://magma.esdm.go.id',
    umpan: 'Status gunung api',
    warna: '#ea580c',
  },
  {
    id: 'firms',
    nama: 'NASA FIRMS',
    host: 'firms.modaps.eosdis.nasa.gov',
    url: 'https://firms.modaps.eosdis.nasa.gov',
    umpan: 'Titik api satelit',
    warna: '#b45309',
  },
  {
    id: 'sipongi',
    nama: 'KLHK SiPongi+',
    host: 'sipongi.gakkum.kehutanan.go.id',
    url: 'https://sipongi.gakkum.kehutanan.go.id',
    umpan: 'Karhutla & FDRS',
    warna: '#15803d',
  },
  {
    id: 'openmeteo',
    nama: 'Open-Meteo',
    host: 'open-meteo.com',
    url: 'https://open-meteo.com',
    umpan: 'Cuaca & kualitas udara',
    warna: '#0284c7',
  },
];

export function sumberById(id) {
  return SUMBER_DATA.find((s) => s.id === id);
}
