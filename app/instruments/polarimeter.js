/**
 * Круговой поляриметр с полутеневым полем. Студент поворачивает анализатор до равенства яркости половин поля
 * и снимает отсчёт по нониусу (точность 0,05°).
 * Модель p: { alpha (истинный угол вращения пробы, °), theta (положение анализатора, °), tube (дм), filled }
 */
import { L, num } from '../i18n.js';
import { esc } from '../dom.js';
import { text } from '../scene/svg.js';

export const HALF_SHADE = 3; // полутеневой угол, °

export function fields(p) {
  const d = ((p.theta - (p.filled ? p.alpha : 0)) * Math.PI) / 180, e = (HALF_SHADE * Math.PI) / 180;
  const a = Math.sin(d + e) ** 2, b = Math.sin(d - e) ** 2;
  const k = 1 / Math.sin(e) ** 2 / 4; // нормировка для видимости
  return [Math.min(1, a * k), Math.min(1, b * k)];
}

/** Отсчёт по нониусу (до 0,05°). */
export const vernier = (theta) => Math.round(theta / 0.05) * 0.05;

export function polarimeterSVG(p) {
  const [a, b] = fields(p);
  const g = (v) => Math.round(30 + 200 * v);
  return `<ellipse class="shadow" cx="150" cy="232" rx="140" ry="3"/><rect class="dev" x="20" y="186" width="250" height="44" rx="6"/><rect class="devf" x="20" y="208" width="250" height="22" rx="5"/><rect class="knob" x="40" y="160" width="10" height="28"/><rect class="knob" x="236" y="160" width="10" height="28"/>
<rect class="dev" x="14" y="112" width="34" height="56" rx="6"/><circle cx="31" cy="140" r="8" fill="var(--hot)" opacity=".55"/><rect class="dev" x="20" y="120" width="250" height="40" rx="8"/><rect class="devf" x="20" y="146" width="250" height="14" rx="6"/>
<rect class="gl" x="60" y="128" width="${p.tube === 2 ? 150 : 90}" height="24" rx="6"/>${p.filled ? `<rect class="liq" x="62" y="131" width="${p.tube === 2 ? 146 : 86}" height="18" rx="4"/>` : ''}<rect class="knob" x="56" y="126" width="6" height="28" rx="2"/><rect class="knob" x="${p.tube === 2 ? 208 : 148}" y="126" width="6" height="28" rx="2"/><path class="hl" d="M66 132 L${p.tube === 2 ? 204 : 144} 132" style="stroke-width:1.6"/>
${text(140, 176, p.tube === 2 ? L('трубка 2 дм', 'түтік 2 дм', '2 dm tube') : L('трубка 1 дм', 'түтік 1 дм', '1 dm tube'))}
<rect class="dev" x="262" y="118" width="18" height="44" rx="4"/><circle cx="300" cy="96" r="48" class="knob"/><circle cx="300" cy="96" r="44" fill="var(--metal-dark)"/><path d="M300 56 A40 40 0 0 0 300 136 Z" fill="rgb(${g(a)},${g(a)},${g(a) - 10})"/><path d="M300 56 A40 40 0 0 1 300 136 Z" fill="rgb(${g(b)},${g(b)},${g(b) - 10})"/><circle cx="300" cy="96" r="40" fill="none" stroke="var(--glass)" stroke-width="2"/>
${text(300, 160, L('поле зрения', 'көру өрісі', 'field of view'))}<text class="lbl mono" x="300" y="34" text-anchor="middle">${esc(num(vernier(p.theta), 2))}°</text>`;
}
