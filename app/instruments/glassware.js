/**
 * Мерная посуда: цилиндр, пипетка, бюретка. Модель — объём v (мл) и параметры прибора.
 * Отсчёт по нижнему краю мениска с точностью до половины цены деления.
 */
import { L } from '../i18n.js';
import { text, bottle } from '../scene/svg.js';

export const MEASURES = {
  'cylinder-10': { name: L('мерный цилиндр 10 мл', 'өлшегіш цилиндр 10 мл', '10 mL measuring cylinder'), cap: 10, div: 0.2, kind: 'cylinder' },
  'cylinder-25': { name: L('мерный цилиндр 25 мл', 'өлшегіш цилиндр 25 мл', '25 mL measuring cylinder'), cap: 25, div: 0.5, kind: 'cylinder' },
  'cylinder-50': { name: L('мерный цилиндр 50 мл', 'өлшегіш цилиндр 50 мл', '50 mL measuring cylinder'), cap: 50, div: 1, kind: 'cylinder' },
  'cylinder-100': { name: L('мерный цилиндр 100 мл', 'өлшегіш цилиндр 100 мл', '100 mL measuring cylinder'), cap: 100, div: 1, kind: 'cylinder' },
  'pipette-5': { name: L('градуированная пипетка 5 мл', 'бөлікті пипетка 5 мл', '5 mL graduated pipette'), cap: 5, div: 0.1, kind: 'pipette' },
  'pipette-10': { name: L('градуированная пипетка 10 мл', 'бөлікті пипетка 10 мл', '10 mL graduated pipette'), cap: 10, div: 0.1, kind: 'pipette' },
  'burette-25': { name: L('бюретка 25 мл', 'бюретка 25 мл', '25 mL burette'), cap: 25, div: 0.1, kind: 'burette' },
};

/** Показание прибора (округление до половины деления). */
export function measureReading(v, div) {
  const half = div / 2;
  return Math.round(v / half) * half;
}

/** SVG цилиндра со шкалой и склянкой реактива. x — левый край цилиндра. */
export function cylinderSVG(o) {
  const cap = o.cap || 10, x = o.x ?? 70, top = 54, hh = 160;
  const k = hh / cap, v = Math.max(0, Math.min(cap, o.v || 0));
  const majorEvery = cap <= 10 ? 1 : cap <= 25 ? 5 : 10;
  const minor = cap <= 10 ? 0.5 : cap <= 25 ? 1 : 5;
  let t = '';
  for (let q = 0; q <= cap + 1e-9; q += minor) {
    const y = top + hh - q * k, M = Math.abs(q / majorEvery - Math.round(q / majorEvery)) < 1e-6;
    t += `<line x1="${x - 1}" x2="${x + (M ? 9 : 5)}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--glass)" stroke-width=".9"/>`;
    if (M && q > 0 && (cap <= 10 ? q % 5 === 0 : true)) t += `<text class="lbl mono" x="${x + 30}" y="${(y + 3).toFixed(1)}">${q}</text>`;
  }
  const ly = top + hh - v * k;
  return `${o.bottle ? bottle(o.bottleX ?? 8, o.bottle, o.bottleSub || L('конц.', 'конц.', 'conc.'), o.bottleCls) : ''}<defs><clipPath id="cyl-c"><rect x="${x + 1}" y="${top}" width="24" height="${hh}"/></clipPath></defs><g clip-path="url(#cyl-c)"><rect class="liq" x="${x + 1}" y="${ly.toFixed(1)}" width="24" height="${(v * k).toFixed(1)}"${o.color ? ` style="fill:${o.color}"` : ''}/>${v > 0 ? `<path d="M${x + 1} ${(ly - 1.5).toFixed(1)} Q${x + 13} ${(ly + 3).toFixed(1)} ${x + 25} ${(ly - 1.5).toFixed(1)}" fill="none" stroke="var(--glass)" stroke-width="1"/>` : ''}</g><rect class="gl" x="${x}" y="${top - 4}" width="26" height="${hh + 8}" rx="2"/><rect class="gl" x="${x - 11}" y="${top + hh}" width="48" height="8" rx="2"/>${t}${text(x + 13, top - 10, o.name || L('цилиндр', 'цилиндр', 'cylinder'))}`;
}
