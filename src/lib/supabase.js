let _klien = null;
let _coba = false;

export function supabaseSiap() {
  try {

    const env = import.meta.env || {};
    if (env.VITE_LAPOR_CLOUD !== 'true') return false;
    return Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY);
  } catch {
    return false;
  }
}

function bacaEnv() {
  try {
    const env = import.meta.env || {};
    return { url: env.VITE_SUPABASE_URL || '', kunci: env.VITE_SUPABASE_ANON_KEY || '' };
  } catch {
    return { url: '', kunci: '' };
  }
}

export async function dapatKlien() {
  if (_klien) return _klien;
  if (_coba || !supabaseSiap()) return null;
  _coba = true;
  try {
    const { url, kunci } = bacaEnv();
    if (!url || !kunci) return null;
    const { createClient } = await import('@supabase/supabase-js');
    _klien = createClient(url, kunci);
    return _klien;
  } catch {
    return null;
  }
}
