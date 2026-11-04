/**
 * Рабочее место: выбранные предметы стоят на лабораторном столе.
 * Используется шагом pick (предметы появляются на столе по мере выбора) и как стенд по умолчанию
 * для шагов без своей сцены (вопрос, расчёт, вывод, уборка) — тогда на столе то, что студент взял в начале опыта.
 */
import { EQUIPMENT, equipmentIcon } from '../equipment.js';
import { scene, text } from './svg.js';
import { L, tr } from '../i18n.js';
import { esc } from '../dom.js';

const PER_ROW = 7;

/** Иконка предмета: из каталога или своя (строка SVG 64×64 без обёртки / с обёрткой). */
function iconAt(item, x, y, size) {
  const id = typeof item === 'string' ? item : item.id;
  let svg = EQUIPMENT[id] ? equipmentIcon(id) : '';
  if (!svg && item && item.icon) svg = /^\s*<svg/.test(item.icon) ? item.icon : `<svg viewBox="0 0 64 64">${item.icon}</svg>`;
  if (!svg) {
    const label = item && item.label ? tr(item.label) : id;
    return `<g><rect class="pnl" x="${x + size * 0.12}" y="${y + size * 0.3}" width="${size * 0.76}" height="${size * 0.7}" rx="4"/>` +
      `<text class="lbl" x="${x + size / 2}" y="${y + size * 0.72}" text-anchor="middle">${esc(String(label).slice(0, 8))}</text></g>`;
  }
  return svg.replace(/<svg\b[^>]*>/, `<svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${size.toFixed(1)}" height="${size.toFixed(1)}" viewBox="0 0 64 64" aria-hidden="true">`);
}

/**
 * Сцена «рабочее место».
 * @param {Array<string|{id,label?,icon?}>} items — что стоит на столе
 * @param {{ caption?: object, empty?: object, highlight?: string }} opts
 */
export function benchScene(items, opts = {}) {
  const list = (items || []).filter(Boolean);
  let inner = '';
  if (!list.length) {
    inner += text(180, 120, opts.empty || L('Рабочее место пока пустое', 'Жұмыс орны әзірге бос', 'The bench is empty so far'), 'lbl');
  } else {
    const rows = Math.ceil(list.length / PER_ROW);
    const perRow = Math.min(list.length, PER_ROW);
    const size = Math.min(64, Math.floor((340 - (perRow - 1) * 6) / perRow));
    for (let r = 0; r < rows; r++) {
      const rowItems = list.slice(r * PER_ROW, (r + 1) * PER_ROW);
      const width = rowItems.length * size + (rowItems.length - 1) * 6;
      const x0 = (360 - width) / 2;
      const y = 232 - size - r * (size + 22);
      if (r > 0) inner += `<rect class="metd" x="${x0 - 8}" y="${y + size}" width="${width + 16}" height="4" rx="2" opacity=".55"/>`;
      rowItems.forEach((it, i) => { inner += `<g class="bench-item">${iconAt(it, x0 + i * (size + 6), y, size)}</g>`; });
    }
  }
  inner += text(12, 18, opts.caption || L('Рабочее место', 'Жұмыс орны', 'Workbench'), 'lblb', 'start');
  return scene(inner, opts.caption || L('Рабочее место', 'Жұмыс орны', 'Workbench'));
}
