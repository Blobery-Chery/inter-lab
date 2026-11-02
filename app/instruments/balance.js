/**
 * Аналитические весы, d = 0,1 мг (как в эталоне): тара, дверцы, стабилизация показаний.
 * Модель b: { cont: false, contMass, load, tare, open, taredEmpty }
 *   cont — тара (лодочка/стекло) на чашке, contMass — её масса, load — масса вещества,
 *   tare — масса, вычитаемая тарированием, open — дверцы открыты.
 * При открытых дверцах показание «плывёт» (±0,6 мг), при закрытых — шум ±0,04 мг и значок стабильности.
 */
import { tr, L, num } from '../i18n.js';
import { esc } from '../dom.js';
import { text } from '../scene/svg.js';

export const CONTAINERS = {
  boat: { name: L('лодочка для взвешивания', 'өлшеуге арналған қайықша', 'weighing boat'), mass: [0.82, 0.87] },
  watch: { name: L('часовое стекло', 'сағат шынысы', 'watch glass'), mass: [21.3, 24.8] },
  paper: { name: L('калька', 'калька қағазы', 'weighing paper'), mass: [0.25, 0.32] },
};

export function createBalance(rng, container = 'boat') {
  const c = CONTAINERS[container] || CONTAINERS.boat;
  return { container, cont: false, contMass: +rng.range(c.mass[0], c.mass[1]).toFixed(4), load: 0, tare: 0, open: true, taredEmpty: false };
}

/** Текущее показание (г) с шумом. */
export function reading(b, rng) {
  const v = (b.cont ? b.contMass : 0) + b.load - b.tare;
  const noise = b.open ? rng.range(-6e-4, 6e-4) : rng.range(-4e-5, 4e-5);
  return v + noise;
}

/** Масса без шума (для записи при закрытых дверцах). */
export function stableValue(b) {
  return Math.round(((b.cont ? b.contMass : 0) + b.load - b.tare) * 1e4) / 1e4;
}

export function tare(b) {
  b.tare = (b.cont ? b.contMass : 0) + b.load;
  b.taredEmpty = b.cont && b.load === 0;
}

/** SVG весов. value — показание дисплея, opts: { reagent: подпись склянки, product: цвет продукта } */
export function balanceSVG(b, value, opts = {}) {
  const base = b.container === 'boat' || b.container === 'paper' ? 168 : 172;
  const m = b.load;
  let pile = '';
  if (m > 0) {
    const hh = 3 + 8 * Math.sqrt(Math.min(m, 6) / 2.5), w = 12 + 16 * Math.sqrt(Math.min(m, 6) / 2.5);
    pile = `<path class="sol" d="M${(180 - w).toFixed(1)} ${base} Q180 ${(base - 2 * hh).toFixed(1)} ${(180 + w).toFixed(1)} ${base} Z"${opts.product ? ` style="fill:${opts.product}"` : ''}/>`;
  }
  const disp = num(value, 4) + ' g';
  return `<rect class="pnl" x="12" y="150" width="44" height="72" rx="5"/><rect class="met" x="20" y="138" width="28" height="13" rx="2"/>${text(34, 184, opts.reagent || L('реактив', 'реактив', 'reagent'), 'lbl', 'middle', ' style="font-size:7.5px"')}
<rect class="met" x="70" y="196" width="220" height="36" rx="6"/><rect class="scr" x="128" y="203" width="138" height="24" rx="3"/><text class="scrt" x="260" y="221" text-anchor="end">${esc(disp)}</text><circle cx="137" cy="215" r="2.6" fill="var(--screen-ink)" opacity="${b.open ? 0.2 : 1}"/>
<rect class="gl" x="84" y="56" width="192" height="140" rx="4"/><rect class="metd" x="176" y="186" width="8" height="10"/><ellipse class="metd" cx="180" cy="186" rx="46" ry="5"/>
${b.cont && (b.container === 'boat' || b.container === 'paper') ? '<path class="pnl" d="M148 168 L212 168 L205 181 L155 181 Z"/>' : ''}${b.cont && b.container === 'watch' ? '<ellipse class="gl" cx="180" cy="177" rx="42" ry="6"/>' : ''}${pile}
<rect x="84" y="56" width="96" height="140" fill="none" stroke="var(--glass)" stroke-width="2.4" stroke-dasharray="${b.open ? '4 3' : 'none'}"/>${text(90, 70, b.open ? L('дверца открыта', 'есікше ашық', 'door open') : L('дверца закрыта', 'есікше жабық', 'door closed'), 'lbl', 'start')}
${text(270, 50, L('аналитические весы, d = 0,1 мг', 'аналитикалық таразы, d = 0,1 мг', 'analytical balance, d = 0.1 mg'), 'lbl', 'end')}`;
}
