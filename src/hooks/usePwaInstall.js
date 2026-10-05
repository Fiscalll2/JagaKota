import { useCallback, useEffect, useState } from 'react';

function bacaTerpasang() {
  if (typeof window === 'undefined') return false;
  try {
    if (window.matchMedia?.('(display-mode: standalone)').matches) return true;

    if (window.navigator?.standalone === true) return true;
  } catch {}
  return false;
}

function tebakPlatform() {
  if (typeof navigator === 'undefined') return 'android';
  const ua = navigator.userAgent || '';
  const ios = /iphone|ipad|ipod/i.test(ua)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}

export function usePwaInstall() {
  const [pinta, setPinta] = useState(null);
  const [sudahPasang, setSudahPasang] = useState(bacaTerpasang);
  const [platform, setPlatform] = useState('android');

  useEffect(() => {
    setPlatform(tebakPlatform());
    setSudahPasang(bacaTerpasang());
    const tadah = (e) => {
      e.preventDefault();
      setPinta(e);
    };
    const tandaiPasang = () => {
      setSudahPasang(true);
      setPinta(null);
    };
    window.addEventListener('beforeinstallprompt', tadah);
    window.addEventListener('appinstalled', tandaiPasang);
    const mq = window.matchMedia?.('(display-mode: standalone)');
    const cek = () => setSudahPasang(bacaTerpasang());
    mq?.addEventListener?.('change', cek);
    return () => {
      window.removeEventListener('beforeinstallprompt', tadah);
      window.removeEventListener('appinstalled', tandaiPasang);
      mq?.removeEventListener?.('change', cek);
    };
  }, []);

  const promptPasang = useCallback(async () => {
    if (!pinta) return 'tak-tersedia';
    try {
      pinta.prompt();
      const { outcome } = await pinta.userChoice;
      if (outcome === 'accepted') {
        setPinta(null);
        return 'diterima';
      }
      return 'ditolak';
    } catch {
      return 'ditolak';
    }
  }, [pinta]);

  return {
    bisaPrompt: !!pinta,
    sudahPasang,
    platform,
    isIos: platform === 'ios',
    promptPasang,
  };
}
