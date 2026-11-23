/**
 * Код студента вместо ФИО: 8 цифр, последняя — контрольная (алгоритм Луна, как в backend/Code.gs).
 * Опечатку в одной цифре сайт замечает ещё до отправки на сервер.
 */
export function luhnDigit(d7) {
  let sum = 0;
  for (let i = 0; i < d7.length; i++) {
    let n = +d7[d7.length - 1 - i];
    if (i % 2 === 0) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
  }
  return String((10 - (sum % 10)) % 10);
}

/** «4827-1935», « 4827 1935 » → «48271935»; иначе ''. */
export function normalizeCode(s) {
  const d = String(s ?? '').replace(/[\s\-–—'.]/g, '');
  if (!/^[1-9]\d{7}$/.test(d)) return '';
  return luhnDigit(d.slice(0, 7)) === d[7] ? d : '';
}

export const isCode = (s) => !!normalizeCode(s);
export const formatCode = (c) => (c && String(c).length === 8 ? String(c).slice(0, 4) + '-' + String(c).slice(4) : String(c || ''));
