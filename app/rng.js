/**
 * Генератор псевдослучайных чисел по seed (mulberry32).
 * Состояние — одно 32-битное число, его можно сохранить и продолжить с того же места.
 */

/** Хэш строки → 32-битное число (FNV-1a). */
export function hashSeed(str) {
  let h = 0x811c9dc5;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Создать генератор. holder — объект, в поле state которого хранится состояние
 * (так генератор продолжает последовательность после перезагрузки страницы).
 */
export function createRng(seedOrHolder) {
  const holder = typeof seedOrHolder === 'object' && seedOrHolder
    ? seedOrHolder
    : { state: typeof seedOrHolder === 'number' ? seedOrHolder >>> 0 : hashSeed(seedOrHolder) };
  function next() {
    let t = (holder.state = (holder.state + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const rng = {
    next,
    /** равномерно в [a, b) */
    range: (a, b) => a + next() * (b - a),
    /** целое в [a, b] */
    int: (a, b) => a + Math.floor(next() * (b - a + 1)),
    /** нормальное распределение (Бокс — Мюллер) */
    normal(mean = 0, sd = 1) {
      const u = Math.max(1e-12, next()), v = next();
      return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    },
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    /** n случайных элементов без повторов */
    sample(arr, n) { return rng.shuffle(arr).slice(0, Math.min(n, arr.length)); },
    get state() { return holder.state; },
  };
  return rng;
}
