import React from 'react';
import { createRoot } from 'react-dom/client';
import JagaApp from './App.jsx';
import { BatasRusak } from './components/common/ErrorBoundary.jsx';
import './index.css';

const akar = document.getElementById('root');

function pasangSw() {
  try {
    if (!('serviceWorker' in navigator)) return;
    if (import.meta.env.PROD) navigator.serviceWorker.register('/sw.js').catch(() => {});
    else navigator.serviceWorker.getRegistrations?.().then((r) => r.forEach((x) => x.unregister())).catch(() => {});
  } catch {}
}

pasangSw();

createRoot(akar).render(
  <React.StrictMode>
    <BatasRusak>
      <JagaApp />
    </BatasRusak>
  </React.StrictMode>
);
