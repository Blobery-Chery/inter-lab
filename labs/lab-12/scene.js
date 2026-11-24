/** Сцены стенда работы № 12 (SVG 360×250). Цвета — CSS-переменные и явные rgba для растворов. */
import { L, num } from '../../app/i18n.js';
import { scene, text, conical, thermometer, bath, bubbles, steam, beaker, hood, bottle, rbFlask, hotplate, callout } from '../../app/scene/svg.js';
import { esc } from '../../app/dom.js';
import { balanceBody, balanceCallout } from '../../app/instruments/balance.js';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/** Вытяжной шкаф (подготовка рабочего места). */
export const hoodScene = (S, lc) => scene(hood({ air: !!(lc && lc.sel && lc.sel.hood) || !!(lc && lc.done && lc.done.hood) }));

/** Стол с поляриметром (подготовка к опыту 1). */
export function polBench() {
  // поляриметр справа (корпус как в приборе опыта), три стакана слева на столе
  const pol = `<ellipse class="shadow" cx="248" cy="232" rx="102" ry="3"/><rect class="dev" x="152" y="198" width="190" height="32" rx="6"/><rect class="devf" x="152" y="214" width="190" height="16" rx="5"/>
<rect class="knob" x="170" y="176" width="9" height="24"/><rect class="knob" x="314" y="176" width="9" height="24"/>
<rect class="dev" x="140" y="138" width="28" height="48" rx="5"/><circle cx="154" cy="162" r="6" fill="var(--hot)" opacity=".5"/><rect class="dev" x="160" y="148" width="176" height="32" rx="7"/><rect class="devf" x="160" y="168" width="176" height="12" rx="5"/>
<rect class="gl" x="196" y="154" width="96" height="18" rx="5"/><rect class="knob" x="192" y="152" width="5" height="22" rx="2"/><rect class="knob" x="291" y="152" width="5" height="22" rx="2"/>
<rect class="dev" x="330" y="150" width="14" height="28" rx="4"/><circle cx="337" cy="136" r="16" class="knob"/><circle cx="337" cy="136" r="12" fill="var(--metal-dark)"/>`;
  return scene(`${pol}${callout(244, 150, 238, 116, L('поляриметр', 'поляриметр', 'polarimeter'), 'middle')}
${beaker({ id: 'w1', x: 8, y: 182, w: 40, hh: 48, frac: 0.6 })}${beaker({ id: 's1', x: 56, y: 182, w: 40, hh: 48, frac: 0.6 })}${beaker({ id: 's2', x: 104, y: 182, w: 40, hh: 48, frac: 0.6 })}
${callout(28, 192, 8, 124, L('H₂O дист.', 'H₂O дист.', 'dist. H₂O'))}${callout(76, 192, 76, 148, L('стандарт', 'стандарт', 'standard'), 'middle')}${callout(124, 192, 136, 170, L('неизв.', 'белгісіз', 'unknown'), 'end')}`);
}

/**
 * Коническая колба 125 мл на водяной бане: раствор (vol), нерастворённое вещество (solid 0…1),
 * термометр (T), кипение, капли амина. o: { T, Tb, vol, solid, boil, drip, stopper, crystals:{n, needles} }
 */
export function flaskBath(o = {}) {
  let s = '';
  const bl = L(`водяная баня ${num(o.Tb ?? 22, 0, 'ru')} °C`, `су моншасы ${num(o.Tb ?? 22, 0, 'kk')} °C`, `water bath ${num(o.Tb ?? 22, 0, 'en')} °C`);
  if (o.bath !== false) s += bath({ kind: 'water' });
  s += conical({ id: 'f125', vol: o.vol ?? 0, cap: 120, color: o.color, solid: o.solid ?? 0, label: L('колба 125 мл', 'колба 125 мл', '125 mL flask') });
  if (o.boil) s += bubbles(140, 205, 80, 7, true) + steam(180, 46, true);
  if (o.th !== false) s += thermometer({ x: 177, top: 6, hh: 200, T: o.T ?? 22, min: 0, max: 100, step: 5, major: 20, mark: 65, labels: false }) + text(198, 6 + 200 - 6 - (65 / 100) * 186 + 3, '65 °C', 'lbl', 'start', ' style="fill:var(--bad)"');
  if (o.drip) s += `<g><rect x="150" y="6" width="8" height="40" class="gl"/><path class="gl" d="M150 46 L153 64 L155 64 L158 46 Z"/><ellipse cx="154" cy="6" rx="7" ry="8" class="metd"/>${o.dripKey ? `<circle data-key="d${o.dripKey}" class="drop" cx="154" cy="68" r="2.6" style="fill:var(--liq-y)"/>` : ''}</g>`;
  if (o.stopper) s += '<rect class="metd" x="166" y="44" width="28" height="12" rx="3"/>';
  if (o.crystals) s += crystals(o.crystals);
  if (o.bath !== false) s += bath({ kind: 'water', front: true, label: bl });
  return scene(s);
}

/** Кристаллы гидротартрата на дне колбы: призмы или иглы. */
function crystals({ n = 0, needles = false }) {
  let s = '';
  const k = Math.round(clamp(n, 0, 1) * 26);
  for (let i = 0; i < k; i++) {
    const x = 136 + ((i * 37) % 88), y = 214 - ((i * 13) % 16);
    if (needles) s += `<line x1="${x}" y1="${y}" x2="${x + 10 - (i % 3) * 7}" y2="${y - 16 - (i % 4) * 4}" stroke="var(--solid)" stroke-width="1.4" stroke-linecap="round" opacity=".95"/>`;
    else s += `<path d="M${x} ${y} l5 -7 l7 0 l-5 7 z" fill="var(--solid)" stroke="var(--muted)" stroke-width=".5"/>`;
  }
  return s;
}

/** Стакан с раствором соли и NaOH: сверху — маслянистый слой свободного амина. */
export function alkaliScene(S, lc) {
  const L2 = S.lib || {};
  const oil = clamp((L2.free || 0) * (lc.dissolved ? 1 : 0), 0, 1);
  const vol = (lc.water ? 15 : 0) + (S.vNaOH || 0);
  const frac = clamp(vol / 30, 0, 0.85);
  const top = 70 + 140 - frac * 134;
  const oilH = 10 * oil;
  let s = bottle(10, 'NaOH', '50 %') + beaker({ id: 'al', x: 110, y: 70, w: 140, hh: 140, frac, color: 'rgba(170,205,225,.5)', ppt: lc.water && !lc.dissolved ? 0.6 : 0, label: L('стакан 100 мл', 'стакан 100 мл', '100 mL beaker') });
  if (oilH > 0.5) s += `<rect x="112" y="${(top + 2).toFixed(1)}" width="136" height="${oilH.toFixed(1)}" style="fill:rgba(236,212,110,.75)"/>`;
  if (lc.pH != null) s += `<rect x="290" y="80" width="14" height="60" rx="2" style="fill:${esc(lc.pHcol || '#999')}"/>` + text(297, 156, `pH ≈ ${Math.round(lc.pH)}`, 'lbl mono');
  return scene(s);
}

/** Упаривание эфира: колба на тёплой водяной бане в вытяжном шкафу (или на источнике огня). */
export function evapScene(S, lc) {
  const E = lc.E || {};
  let s = '';
  if (lc.src === 'plate') s += hotplate({ x: 110, y: 198, w: 140, on: true });
  else s += bath({ x: 90, y: 150, w: 180, hh: 80, kind: 'water' });
  const v = (E.ether || 0) + (E.amineV || 0);
  s += rbFlask({ id: 'ev', cx: 180, cy: 168, r: 34, frac: clamp(0.08 + v / 26, 0.08, 0.9), color: 'rgba(230,205,120,.6)', boiling: E.boil });
  if (E.boil) s += steam(180, 96, true);
  if (lc.src !== 'plate') s += bath({ x: 90, y: 150, w: 180, hh: 80, kind: 'water', front: true, label: L(`водяная баня ${num(E.Tb ?? 22, 0, 'ru')} °C`, `су моншасы ${num(E.Tb ?? 22, 0, 'kk')} °C`, `water bath ${num(E.Tb ?? 22, 0, 'en')} °C`) });
  s += text(180, 92, L(`эфир ≈ ${num(E.ether || 0, 1)} мл`, `эфир ≈ ${num(E.ether || 0, 1)} мл`, `ether ≈ ${num(E.ether || 0, 1)} mL`), 'lbl mono');
  return scene(s);
}

/** Весы с колбочкой; value — показание дисплея (г). */
export function flaskBalance(value, withLiquid) {
  return scene(`${balanceBody(num(value, 4) + ' g')}
${rbFlask({ id: 'bf', cx: 180, cy: 152, r: 24, frac: withLiquid ? 0.12 : 0, color: 'rgba(236,224,170,.7)' })}<ellipse class="metd" cx="180" cy="177" rx="14" ry="3"/>
<rect x="84" y="58" width="192" height="132" fill="none" stroke="var(--glass)" stroke-width="2"/>${balanceCallout()}`);
}

/** Мерная колба с раствором амина в метаноле. */
export function volFlask(full) {
  return scene(`<path class="gl" d="M170 40 L170 120 Q120 140 120 180 Q120 226 180 226 Q240 226 240 180 Q240 140 190 120 L190 40 Z"/>
<rect class="liq" x="124" y="${full ? 150 : 200}" width="112" height="${full ? 72 : 22}" rx="10" style="fill:rgba(236,224,170,.45)"/>${full ? '<rect class="liq" x="171" y="72" width="18" height="80" style="fill:rgba(236,224,170,.45)"/>' : ''}
<line x1="166" y1="72" x2="194" y2="72" stroke="var(--bad)" stroke-width="1.5"/>${text(250, 76, L('метка', 'белгі', 'mark'), 'lbl', 'start')}${callout(124, 200, 20, 150, [L('мерная колба', 'өлшегіш колба', 'volumetric'), L('10 мл', '10 мл', 'flask, 10 mL')])}`);
}

/** Колбочка с амином и подписью массы и объёма (опыт 3). */
export function vialScene(m, v) {
  return scene(`${rbFlask({ id: 'vl', cx: 120, cy: 170, r: 40, frac: 0.18, color: 'rgba(236,224,170,.7)' })}<rect class="metd" x="111" y="88" width="18" height="12" rx="3"/>
${callout(86, 192, 14, 120, [L('колба', 'амині бар', 'flask with'), L('с амином', 'колба', 'the amine')])}
<rect class="gl" x="232" y="60" width="22" height="150" rx="6"/><rect class="liq" x="234" y="180" width="18" height="28" rx="4" style="fill:rgba(236,224,170,.6)"/>${text(243, 50, L('трубка 1 дм ≈ 1,0 мл', '1 дм түтік ≈ 1,0 мл', '1 dm tube ≈ 1.0 mL'))}
${text(120, 40, L(`m = ${num(m, 3, 'ru')} г`, `m = ${num(m, 3, 'kk')} г`, `m = ${num(m, 3, 'en')} g`), 'lblb')}${text(120, 60, L(`V ≈ ${num(v, 2, 'ru')} мл`, `V ≈ ${num(v, 2, 'kk')} мл`, `V ≈ ${num(v, 2, 'en')} mL`), 'lblb')}`);
}
