/** Универсальная индикаторная бумага: цвет и словесная оценка pH. */
import { L } from '../i18n.js';
import { clamp } from '../dom.js';

const STOPS = [[0, [200, 30, 50]], [2, [230, 60, 50]], [4, [245, 140, 40]], [5, [245, 200, 50]], [7, [110, 180, 40]], [9, [30, 150, 130]], [11, [50, 90, 170]], [14, [90, 40, 130]]];

export function pHcolor(p) {
  p = clamp(p, 0, 14);
  for (let i = 1; i < STOPS.length; i++) {
    if (p <= STOPS[i][0]) {
      const [a, ca] = STOPS[i - 1], [b, cb] = STOPS[i], u = (p - a) / (b - a);
      return `rgb(${ca.map((v, j) => Math.round(v + (cb[j] - v) * u)).join(',')})`;
    }
  }
  return 'rgb(90,40,130)';
}

/** Отсчёт по бумаге — целое значение pH (цена деления шкалы 1). */
export const pHread = (p) => Math.round(clamp(p, 0, 14));

export function pHword(p) {
  const r = pHread(p);
  if (r <= 2) return L('сильнокислая', 'күшті қышқыл', 'strongly acidic');
  if (r <= 4) return L('кислая', 'қышқыл', 'acidic');
  if (r <= 6) return L('слабокислая', 'әлсіз қышқыл', 'weakly acidic');
  if (r === 7) return L('нейтральная', 'бейтарап', 'neutral');
  if (r <= 9) return L('слабощелочная', 'әлсіз сілтілі', 'weakly alkaline');
  return L('щелочная', 'сілтілі', 'alkaline');
}

/** HTML полоски индикаторной бумаги со шкалой. */
export function stripHTML(p, trf) {
  const r = pHread(p);
  return `<div class="strip"><i style="background:${pHcolor(p)}"></i><span>${trf(L(`Индикаторная бумага: pH ≈ ${r}`, `Индикатор қағазы: pH ≈ ${r}`, `Indicator paper: pH ≈ ${r}`))}</span><em>${trf(pHword(p))}</em><div class="scale" aria-hidden="true"></div></div>`;
}
