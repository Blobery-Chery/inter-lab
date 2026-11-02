/**
 * Прибор для определения температуры плавления (блок с капилляром и лупой), как в эталоне.
 * Модель m: { Tb, on, rate (°C/мин), inside (капилляр в приборе) }
 * Проба: { on, end } — истинные начало и конец плавления (°C), layer — высота слоя (мм).
 * Температура в капилляре отстаёт от блока на 0,4·rate (чем быстрее нагрев, тем выше отсчёт).
 */
import { L, num, tr } from '../i18n.js';
import { clamp, esc } from '../dom.js';
import { text } from '../scene/svg.js';

export function createMp(T0 = 25) { return { Tb: T0, on: false, rate: 10, inside: false }; }

export function tickMp(m, dt, room = 25) {
  if (m.on) m.Tb += (m.rate / 60) * dt;
  else m.Tb += (room - m.Tb) * Math.min(1, 0.0015 * dt);
}

/** Температура пробы с учётом запаздывания. */
export const sampleT = (m) => m.Tb - (m.on ? 0.4 * m.rate : 0);

/** Доля расплава 0…1. */
export function meltFraction(m, s) {
  const Ts = sampleT(m);
  return Ts >= s.on ? clamp((Ts - s.on) / Math.max(0.3, s.end - s.on), 0, 1) : 0;
}

export function mpSVG(m, s = { on: 140.5, end: 141.2 }, layer = 2.5, opts = {}) {
  const Lh = clamp(layer, 0, 6) * 13;
  const Ts = sampleT(m), sintered = Ts > s.on - 1.5;
  const fr = m.inside ? meltFraction(m, s) : 0;
  const sH = Lh * (1 - fr) * (sintered ? 0.92 : 1), lH = Lh * 0.8 * fr;
  const u = clamp((m.Tb - 20) / 160, 0, 1);
  const loose = opts.loose ? clamp(opts.loose, 0, 6) * 13 : 0;
  return `<defs><clipPath id="mp-c"><circle cx="262" cy="116" r="84"/></clipPath></defs>
<rect class="met" x="22" y="96" width="140" height="128" rx="10"/><rect class="scr" x="40" y="182" width="104" height="28" rx="4"/><text class="scrt" x="138" y="202" text-anchor="end">${esc(num(m.Tb, 1))} °C</text><circle cx="32" cy="196" r="4" fill="var(--hot)" opacity="${m.on ? 1 : 0.15}"/>
<rect x="60" y="14" width="8" height="92" rx="4" fill="var(--panel)" stroke="var(--glass)"/><rect class="redc" x="62.5" y="${(102 - u * 80).toFixed(1)}" width="3" height="${(u * 80 + 4).toFixed(1)}"/>
<line x1="100" y1="40" x2="100" y2="112" stroke="var(--glass)" stroke-width="2.4" opacity="${m.inside ? 1 : 0}"/><rect x="88" y="112" width="26" height="40" rx="3" class="metd"/>${text(101, 166, L('окно', 'терезе', 'window'))}
<circle cx="262" cy="116" r="86" fill="var(--scene)" stroke="var(--glass)" stroke-width="3"/>
<g clip-path="url(#mp-c)"><rect x="248" y="10" width="28" height="198" rx="2" class="gl"/>${loose ? `<rect x="251" y="30" width="22" height="${loose.toFixed(1)}" class="ppt" opacity=".7"/>` : ''}<rect x="251" y="${(200 - lH - sH).toFixed(1)}" width="22" height="${sH.toFixed(1)}" class="ppt" opacity="${fr > 0 ? 0.85 : 1}"/><rect x="251" y="${(200 - lH).toFixed(1)}" width="22" height="${lH.toFixed(1)}" style="fill:var(--melt)"/></g>
${text(262, 222, L('капилляр под лупой', 'лупа астындағы капилляр', 'capillary under the magnifier'))}`;
}
