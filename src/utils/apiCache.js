const RAM = new Map();
const PREFIX = 'jk:';
const DEFAULT_TTL = 10 * 60 * 1000;
const BUCKET_TTL = { cuaca: 5 * 60 * 1000, udara: 5 * 60 * 1000, gempa: 2 * 60 * 1000, default: DEFAULT_TTL };

const stats = { hit: 0, miss: 0 };

function bucketOf(key = '') {
  if (key.startsWith('cuaca_') || key.startsWith('weather_')) return 'cuaca';
  if (key.startsWith('udara_') || key.startsWith('aqi_')) return 'udara';
  if (key.startsWith('gempa_') || key.startsWith('quake_')) return 'gempa';
  return 'default';
}

function readDisk(k) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(PREFIX + k);
    if (!raw) return null;
    const doc = JSON.parse(raw);
    if (!doc || Date.now() > doc.exp) {
      window.localStorage.removeItem(PREFIX + k);
      return null;
    }
    return doc;
  } catch {
    return null;
  }
}

function writeDisk(k, doc) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(PREFIX + k, JSON.stringify(doc));
  } catch {
    try {

      const all = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const name = window.localStorage.key(i);
        if (name && name.startsWith(PREFIX)) all.push(name);
      }
      all.slice(0, 15).forEach((n) => window.localStorage.removeItem(n));
      window.localStorage.setItem(PREFIX + k, JSON.stringify(doc));
    } catch {}
  }
}

export const apiCache = {
  stats,
  get(k) {
    const mem = RAM.get(k);
    if (mem && Date.now() < mem.exp) {
      stats.hit += 1;
      return mem.val;
    }
    if (mem) RAM.delete(k);
    const disk = readDisk(k);
    if (disk) {
      RAM.set(k, disk);
      stats.hit += 1;
      return disk.val;
    }
    stats.miss += 1;
    return null;
  },
  set(k, val, ttl) {
    if (val === null || val === undefined) return;
    const life = ttl || BUCKET_TTL[bucketOf(k)] || DEFAULT_TTL;
    const doc = { val, exp: Date.now() + life, at: new Date().toISOString(), v: 2 };
    RAM.set(k, doc);
    writeDisk(k, doc);
  },
  remove(k) {
    RAM.delete(k);
    try { window?.localStorage?.removeItem(PREFIX + k); } catch {}
  },
  clear() {
    RAM.clear();
    try {
      if (typeof window === 'undefined') return;
      const victims = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const name = window.localStorage.key(i);
        if (name && (name.startsWith(PREFIX) || name.startsWith('jagakota_cache_'))) victims.push(name);
      }
      victims.forEach((n) => window.localStorage.removeItem(n));
    } catch {}
  },
};

export const jagaStore = apiCache;
export default apiCache;
