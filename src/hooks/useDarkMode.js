import { useCallback, useEffect, useState } from 'react';

const KUNCI = 'jagakota-tema-v2';

function bacaAwal() {
  try {
    const simpan = window?.localStorage?.getItem(KUNCI);
    if (simpan === 'gelap') return true;
    if (simpan === 'terang') return false;
  } catch {}
  try {
    if (window?.matchMedia?.('(prefers-color-scheme: dark)')?.matches) return true;
  } catch {}
  return false;
}

export function useDarkMode() {
  const [gelap, setGelap] = useState(bacaAwal);
  const [mode, setMode] = useState(gelap ? 'dark' : 'light');

  useEffect(() => {
    const akar = document.documentElement;
    if (gelap) akar.setAttribute('data-theme', 'dark');
    else akar.removeAttribute('data-theme');
    akar.style.colorScheme = gelap ? 'dark' : 'light';
    setMode(gelap ? 'dark' : 'light');
    try { window.localStorage.setItem(KUNCI, gelap ? 'gelap' : 'terang'); } catch {}
    // migrasi kunci lama
    try { window.localStorage.removeItem('jagokota-theme'); } catch {}
  }, [gelap]);

  const toggleDarkMode = useCallback(() => setGelap((v) => !v), []);
  const setTerang = useCallback(() => setGelap(false), []);
  const setGelapMode = useCallback(() => setGelap(true), []);

  return { isDark: gelap, isGelap: gelap, mode, toggleDarkMode, setTerang, setGelapMode };
}

export default useDarkMode;
