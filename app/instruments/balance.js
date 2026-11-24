/**
 * Аналитические весы, d = 0,1 мг (как в эталоне): тара, дверцы, стабилизация показаний.
 * Модель b: { cont: false, contMass, load, tare, open, taredEmpty }
 *   cont — тара (лодочка/стекло) на чашке, contMass — её масса, load — масса вещества,
 *   tare — масса, вычитаемая тарированием, open — дверцы открыты.
 * При открытых дверцах показание «плывёт» (±0,6 мг), при закрытых — шум ±0,04 мг и значок стабильности.
 */
import { tr, L, num } from '../i18n.js';
import { esc } from '../dom.js';
import { text, callout } from '../scene/svg.js';

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

/** Подпись склянки — строками не длиннее 11 знаков, чтобы не заходила на весы. */
function wrapName(name) {
  const out = [];
  for (const w of String(name).split(/\s+/)) {
    if (out.length && (out[out.length - 1] + ' ' + w).length <= 11) out[out.length - 1] += ' ' + w; else out.push(w);
  }
  return out.slice(0, 3);
}

/** SVG весов. value — показание дисплея, opts: { reagent: подпись склянки, product: цвет продукта } */
/** Корпус аналитических весов: дисплей (строка), кнопки, ветрозащитный шкаф, чашка. stable — показание установилось. */
export function balanceBody(disp, stable = true) {
  return `<ellipse class="shadow" cx="180" cy="233" rx="120" ry="3.4"/><rect class="dev" x="66" y="190" width="228" height="42" rx="7"/><rect class="devf" x="66" y="206" width="228" height="26" rx="6"/>
<rect class="scr" x="128" y="209" width="138" height="20" rx="3"/><text class="scrt" x="260" y="224" text-anchor="end" style="font-size:13.5px">${esc(disp)}</text><circle cx="137" cy="219" r="2.4" fill="var(--screen-ink)" opacity="${stable ? 1 : 0.2}"/>
<circle class="knob" cx="86" cy="219" r="6"/><circle class="knob" cx="106" cy="219" r="6"/><circle cx="86" cy="219" r="2" fill="var(--panel)" opacity=".7"/>
<rect class="dev" x="80" y="50" width="200" height="8" rx="3"/><circle cx="270" cy="54" r="2.6" fill="var(--panel)" stroke="var(--knob)" stroke-width=".8"/>
<rect class="glf" x="84" y="58" width="192" height="132"/><rect class="metd" x="82" y="56" width="4" height="136" rx="1"/><rect class="metd" x="274" y="56" width="4" height="136" rx="1"/>
<rect class="metd" x="176" y="180" width="8" height="12"/><ellipse class="metd" cx="180" cy="181" rx="46" ry="5"/><ellipse cx="180" cy="179.5" rx="42" ry="3.2" fill="var(--metal-hi)" opacity=".6"/>`;
}

/** Подпись-выноска «аналитические весы». */
export const balanceCallout = () => callout(266, 50, 352, 26, L('аналитические весы, d = 0,1 мг', 'аналитикалық таразы, d = 0,1 мг', 'analytical balance, d = 0.1 mg'), 'end');

export function balanceSVG(b, value, opts = {}) {
  const base = b.container === 'boat' || b.container === 'paper' ? 168 : 172;
  const m = b.load;
  let pile = '';
  if (m > 0) {
    const hh = 3 + 8 * Math.sqrt(Math.min(m, 6) / 2.5), w = 12 + 16 * Math.sqrt(Math.min(m, 6) / 2.5);
    pile = `<path class="sol" d="M${(180 - w).toFixed(1)} ${base} Q180 ${(base - 2 * hh).toFixed(1)} ${(180 + w).toFixed(1)} ${base} Z"${opts.product ? ` style="fill:${opts.product}"` : ''}/>`;
  }
  const disp = num(value, 4) + ' g';
  // склянка с реактивом слева
  const jar = `<ellipse class="shadow" cx="34" cy="232" rx="26" ry="2.6"/><rect class="glf" x="12" y="150" width="44" height="80" rx="7"/><rect x="14" y="196" width="40" height="32" rx="5" class="sol" style="stroke:none"/>
<rect class="gls" x="12" y="150" width="44" height="80" rx="7"/><rect class="knob" x="19" y="134" width="30" height="17" rx="3"/><rect class="pnl" x="15" y="166" width="38" height="24" rx="2"/><path d="M20 174 L48 174 M20 180 L42 180" stroke="var(--line-2)" stroke-width="1.6"/>
<path class="hl" d="M50 158 L50 220" style="stroke-width:2"/>${callout(34, 140, 6, 104, wrapName(tr(opts.reagent || L('реактив', 'реактив', 'reagent'))))}`;
  const body = balanceBody(disp, !b.open);
  const cont = `${b.cont && (b.container === 'boat' || b.container === 'paper') ? '<path class="pnl" d="M148 168 L212 168 L205 178 L155 178 Z"/>' : ''}${b.cont && b.container === 'watch' ? '<ellipse class="gl" cx="180" cy="174" rx="42" ry="6"/>' : ''}${pile}`;
  const door = b.open
    ? `<rect x="84" y="58" width="96" height="132" fill="none" stroke="var(--glass)" stroke-width="2" stroke-dasharray="4 3"/>`
    : `<rect x="84" y="58" width="96" height="132" class="glf"/><rect x="84" y="58" width="96" height="132" fill="none" stroke="var(--glass)" stroke-width="2"/><rect class="knob" x="174" y="112" width="3" height="26" rx="1.5"/>`;
  return `${jar}${body}${cont}${door}<rect class="gls" x="84" y="58" width="192" height="132"/><path class="hl" d="M96 66 L96 182" style="stroke-width:3"/><path class="hl" d="M262 70 L262 178" style="stroke-width:1.6"/>
${text(90, 72, b.open ? L('дверца открыта', 'есікше ашық', 'door open') : L('дверца закрыта', 'есікше жабық', 'door closed'), 'lbl', 'start')}
${balanceCallout()}`;
}
