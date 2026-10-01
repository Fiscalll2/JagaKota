// JagaKota — getar v2: pola, bukan sekali getar
export function getarJaga(pola = 12) {
  try {
    if (typeof window !== 'undefined' && typeof navigator?.vibrate === 'function') {
      navigator.vibrate(pola);
      return true;
    }
  } catch {}
  return false;
}

export const triggerHaptic = getarJaga;
export const hapticRingan = () => getarJaga(10);
export const hapticSedang = () => getarJaga([15, 30, 15]);
export const hapticKuat = () => getarJaga([25, 40, 25, 40, 25]);
export default getarJaga;
