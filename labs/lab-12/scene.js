/** Сцены стенда работы № 12 (SVG 360×250). Цвета — CSS-переменные и явные rgba для растворов. */
import { L, num } from '../../app/i18n.js';
import { scene, text, conical, thermometer, bath, bubbles, steam, beaker, hood, bottle, rbFlask, hotplate } from '../../app/scene/svg.js';
import { esc } from '../../app/dom.js';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/** Вытяжной шкаф (подготовка рабочего места). */
export const hoodScene = (S, lc) => scene(hood({ air: !!(lc && lc.sel && lc.sel.hood) || !!(lc && lc.done && lc.done.hood) }));

/** Стол с поляриметром (подготовка к опыту 1). */
export function polBench() {
  return scene(`<rect class="met" x="20" y="150" width="300" height="36" rx="8"/><circle cx="40" cy="168" r="14" fill="var(--metal-dark)"/><rect class="metd" x="70" y="154" width="14" height="28" rx="3"/>
<rect class="gl" x="112" y="158" width="150" height="20" rx="5"/><circle cx="300" cy="168" r="18" class="metd"/><circle cx="300" cy="100" r="34" fill="var(--metal-dark)"/><circle cx="300" cy="100" r="30" fill="var(--scene)"/>
${text(180, 140, L('поляриметр', 'поляриметр', 'polarimeter'))}${beaker({ id: 'w1', x: 40, y: 60, w: 50, hh: 64, frac: 0.6, label: L('H₂O дист.', 'H₂O дист.', 'dist. H₂O') })}
${beaker({ id: 's1', x: 120, y: 60, w: 50, hh: 64, frac: 0.6, label: L('стандарт', 'стандарт', 'standard') })}${beaker({ id: 's2', x: 200, y: 60, w: 50, hh: 64, frac: 0.6, label: L('неизв.', 'белгісіз', 'unknown') })}`);
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
  return scene(`<rect class="met" x="70" y="196" width="220" height="36" rx="6"/><rect class="scr" x="128" y="203" width="138" height="24" rx="3"/><text class="scrt" x="260" y="221" text-anchor="end">${esc(num(value, 4))} g</text>
<rect class="gl" x="84" y="56" width="192" height="140" rx="4"/><ellipse class="metd" cx="180" cy="186" rx="46" ry="5"/>
${rbFlask({ id: 'bf', cx: 180, cy: 156, r: 24, frac: withLiquid ? 0.12 : 0, color: 'rgba(236,224,170,.7)' })}
${text(270, 50, L('аналитические весы, d = 0,1 мг', 'аналитикалық таразы, d = 0,1 мг', 'analytical balance, d = 0.1 mg'), 'lbl', 'end')}`);
}

/** Мерная колба с раствором амина в метаноле. */
export function volFlask(full) {
  return scene(`<path class="gl" d="M170 40 L170 120 Q120 140 120 180 Q120 226 180 226 Q240 226 240 180 Q240 140 190 120 L190 40 Z"/>
<rect class="liq" x="124" y="${full ? 150 : 200}" width="112" height="${full ? 72 : 22}" rx="10" style="fill:rgba(236,224,170,.45)"/>${full ? '<rect class="liq" x="171" y="72" width="18" height="80" style="fill:rgba(236,224,170,.45)"/>' : ''}
<line x1="166" y1="72" x2="194" y2="72" stroke="var(--bad)" stroke-width="1.5"/>${text(250, 76, L('метка', 'белгі', 'mark'), 'lbl', 'start')}${text(180, 244, L('мерная колба 10 мл', 'өлшегіш колба 10 мл', '10 mL volumetric flask'))}`);
}

/** Колбочка с амином и подписью массы и объёма (опыт 3). */
export function vialScene(m, v) {
  return scene(`${rbFlask({ id: 'vl', cx: 120, cy: 170, r: 40, frac: 0.18, color: 'rgba(236,224,170,.7)' })}<rect class="metd" x="111" y="88" width="18" height="12" rx="3"/>
${text(120, 244, L('колба с амином', 'амині бар колба', 'flask with the amine'))}
<rect class="gl" x="232" y="60" width="22" height="150" rx="6"/><rect class="liq" x="234" y="180" width="18" height="28" rx="4" style="fill:rgba(236,224,170,.6)"/>${text(243, 50, L('трубка 1 дм ≈ 1,0 мл', '1 дм түтік ≈ 1,0 мл', '1 dm tube ≈ 1.0 mL'))}
${text(120, 40, L(`m = ${num(m, 3, 'ru')} г`, `m = ${num(m, 3, 'kk')} г`, `m = ${num(m, 3, 'en')} g`), 'lblb')}${text(120, 60, L(`V ≈ ${num(v, 2, 'ru')} мл`, `V ≈ ${num(v, 2, 'kk')} мл`, `V ≈ ${num(v, 2, 'en')} mL`), 'lblb')}`);
}
