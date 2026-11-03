/** Сцены стенда работы № 8 (SVG 360×250). Цвета — CSS-переменные или rgba. */
import { L, num } from '../../app/i18n.js';
import { scene, text, rbFlask, condenser, bubbles, steam, hood, conical, stand, beaker, tube, bath, thermometer } from '../../app/scene/svg.js';

export const ORG = 'rgba(214,200,120,.42)';     // органический слой (сырой эфир)
export const AQ = 'var(--liquid)';               // водный слой

/** Колбонагреватель (полусферическая чаша). power 0…3 — накал. */
export function mantle(cx = 180, cy = 196, r = 46, power = 0) {
  return `<path class="met" d="M${cx - r - 6} ${cy - 8} Q${cx - r - 6} ${cy + r - 4} ${cx} ${cy + r - 2} Q${cx + r + 6} ${cy + r - 4} ${cx + r + 6} ${cy - 8} Z"/>
<path d="M${cx - r} ${cy - 8} Q${cx - r} ${cy + r - 12} ${cx} ${cy + r - 10} Q${cx + r} ${cy + r - 12} ${cx + r} ${cy - 8}" fill="none" stroke="var(--hot)" stroke-width="3" opacity="${[0, 0.35, 0.65, 1][power] || 0}"/>
<rect class="metd" x="${cx + r - 8}" y="${cy + 22}" width="14" height="10" rx="2"/><circle cx="${cx - r + 4}" cy="${cy + 28}" r="3" fill="var(--hot)" opacity="${power ? 1 : 0.15}"/>`;
}

/** Газовая горелка (ловушка при сборке). */
function burner(cx = 180, y = 232) {
  return `<rect class="met" x="${cx - 8}" y="${y - 52}" width="16" height="44"/><rect class="metd" x="${cx - 22}" y="${y - 10}" width="44" height="10" rx="2"/>`;
}

/** Склянка с реактивом рядом не нужна — правая колба для шагов «отмерить». */
export function flaskRight(S) {
  const v = (S.vAlc || 0) + (S.vAcid || 0) + (S.cat || 0);
  return rbFlask({ id: 'rbm', cx: 268, cy: 186, r: 34, frac: Math.min(0.9, v / 50 * 1.6), chips: S.chips }) + text(268, 244, L('круглодонная колба 50 мл', 'дөңгелек түпті колба 50 мл', '50 mL round-bottom flask'));
}

/** Внесение катализатора и кипелок. */
export function chargeScene(S, lc) {
  const v = (S.vAlc || 0) + (S.vAcid || 0) + (S.cat || 0);
  const dark = S.char ? 'rgba(190,140,60,.5)' : null;
  let s = rbFlask({ id: 'rbc', cx: 180, cy: 180, r: 44, frac: Math.min(0.9, v / 50 * 1.5), color: dark, chips: S.chips });
  if (lc.pip) s += `<rect class="gl" x="176" y="20" width="8" height="96"/><rect class="liq" x="177" y="${100 - lc.pip * 60}" width="6" height="${lc.pip * 60}"/><ellipse cx="180" cy="16" rx="8" ry="10" class="metd"/>`;
  s += text(180, 244, L('колба: н-бутанол + CH₃COOH', 'колба: н-бутанол + CH₃COOH', 'flask: n-butanol + CH₃COOH'));
  return scene(s);
}

/** Установка для кипячения с обратным холодильником (по местам сборки). */
export function refluxApparatus(o = {}) {
  const pl = o.place || {};
  let s = stand(70, 60);
  if (pl.heat === 'mantle' || o.heat === 'mantle') s += mantle(180, 196, 46, o.power || 0);
  else if (pl.heat === 'burner') s += burner(180) + (o.power ? `<path d="M174 178 Q180 160 186 178 Z" fill="var(--hot)"/>` : '');
  const flask = pl.flask || o.flask;
  if (flask === 'conical') s += conical({ id: 'cfr', cx: 180, by: 226, s: 0.45, vol: 20, cap: 50 });
  else if (flask) s += rbFlask({ id: 'rbr', cx: 180, cy: 186, r: 38, frac: o.frac ?? 0.42, chips: o.chips, boiling: o.boiling, color: o.color });
  const cnd = pl.cond || o.cond;
  if (cnd) {
    const water = o.water ?? !!(pl.win && pl.wout);
    s += condenser({ cx: 180, by: 112, hh: 100, water, waterIn: o.waterTop ? 'top' : 'bottom' });
    if (cnd === 'liebig') s += text(240, 30, L('холодильник Либиха', 'Либих мұздатқышы', 'Liebig condenser'), 'lbl', 'start');
  }
  if (o.ring) {
    const y = 112 - Math.min(1.05, o.ring) * 96;
    s += `<rect x="173" y="${y.toFixed(1)}" width="14" height="8" fill="var(--liquid)" opacity=".9"/>`;
    if (o.ring > 0.85) s += steam(180, 10, true);
  }
  if (o.stopper) s += `<rect class="metd" x="172" y="4" width="16" height="10" rx="2"/>`;
  return s;
}

export function refluxScene(S, lc) {
  const R = S.reflux;
  const power = lc.c ? lc.c.pow || 0 : 0;
  const boiling = R.T >= R.Tb - 0.5 && power > 0;
  return scene(refluxApparatus({ heat: S.app.heat === 'burner' ? undefined : 'mantle', place: S.app.heat === 'burner' ? { heat: 'burner' } : {}, flask: 'rb', cond: 'reflux', power, chips: S.chips, boiling, water: !!R.water && !S.app.noWater, waterTop: S.app.waterTop, ring: boiling ? lc.ring : 0, stopper: R.stopper, color: S.char ? 'rgba(190,140,60,.45)' : null })
    + text(300, 238, boiling ? L('кипит', 'қайнап жатыр', 'boiling') : `${num(R.T, 0)} °C`, 'lbl mono', 'end'));
}

/** Делительная воронка с двумя слоями. F — local шага промывок. */
export function funnelScene(F) {
  const cx = 160, top = 34;
  const P = `M${cx - 8} ${top} L${cx - 8} ${top + 20} Q${cx - 50} ${top + 74} ${cx - 10} ${top + 140} L${cx - 3} ${top + 150} L${cx + 3} ${top + 150} L${cx + 10} ${top + 140} Q${cx + 50} ${top + 74} ${cx + 8} ${top + 20} L${cx + 8} ${top} Z`;
  const k = 1.25; // мл → px
  let y = top + 150, lay = '';
  const aq = F.aq || 0, org = F.org || 0;
  if (F.mixed && aq + org > 0) {
    const hh = (aq + org) * k; lay += `<rect x="${cx - 60}" y="${(y - hh).toFixed(1)}" width="120" height="${hh.toFixed(1)}" style="fill:rgba(200,205,170,.5)"/>`;
  } else {
    if (aq > 0) { const hh = aq * k; lay += `<rect x="${cx - 60}" y="${(y - hh).toFixed(1)}" width="120" height="${hh.toFixed(1)}" style="fill:${AQ}"/>`; y -= hh; }
    if (org > 0) { const hh = org * k; lay += `<rect x="${cx - 60}" y="${(y - hh).toFixed(1)}" width="120" height="${hh.toFixed(1)}" style="fill:${ORG}"/>`; if (aq > 0) lay += `<line x1="${cx - 60}" x2="${cx + 60}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--muted)" stroke-dasharray="3 2"/>`; }
  }
  const gas = F.gas > 0.05 ? bubbles(cx - 26, top + 132, 52, Math.min(8, 2 + Math.round(F.gas * 1.2))) : '';
  let s = `<rect class="met" x="34" y="20" width="5" height="212"/><rect class="met" x="14" y="224" width="70" height="8" rx="2"/><path d="M39 112 L${cx - 34} 112" stroke="var(--metal-dark)" stroke-width="4"/><ellipse cx="${cx}" cy="112" rx="38" ry="5" fill="none" stroke="var(--metal-dark)" stroke-width="3"/>
<defs><clipPath id="sf8-c"><path d="${P}"/></clipPath></defs><g clip-path="url(#sf8-c)">${lay}${gas}</g><path class="gl" d="${P}"/>
<rect class="metd" x="${cx - 13}" y="${top + 150}" width="26" height="7" rx="2"/><rect x="${cx - 3}" y="${top + 146}" width="6" height="15" rx="1" fill="${F.tap ? 'var(--good)' : 'var(--metal-dark)'}" transform="rotate(${F.tap ? 0 : 90} ${cx} ${top + 153})"/>
<rect class="gl" x="${cx - 2}" y="${top + 157}" width="4" height="22"/>`;
  if (F.stopper) s += `<rect class="metd" x="${cx - 10}" y="${top - 9}" width="20" height="10" rx="3"/>`;
  if (F.tap && F.flow) s += `<line x1="${cx}" y1="${top + 179}" x2="${cx}" y2="206" stroke="var(--liquid)" stroke-width="3"/>`;
  s += beaker({ id: 'wst', x: cx - 32, y: 196, w: 64, hh: 34, frac: Math.min(0.9, (F.waste || 0) / 90), label: null });
  s += text(cx, 246, L('стакан для водного слоя', 'сулы қабатқа арналған стақан', 'beaker for the aqueous layer'));
  if (F.prod) s += conical({ id: 'cfp', cx: 300, by: 226, s: 0.42, vol: F.prod, cap: 50, color: ORG }) + text(300, 246, L('колба с эфиром', 'эфирі бар колба', 'flask with ester'));
  const lbl = F.mixed ? [L('эмульсия —', 'эмульсия —', 'emulsion —'), L('дайте отстояться', 'тұндырыңыз', 'let it settle')] : org > 0 && aq > 0 ? [L('верх — эфир', 'үсті — эфир', 'top — ester'), L('низ — водный слой', 'асты — сулы қабат', 'bottom — aqueous')] : null;
  if (lbl) s += text(354, top + 96, lbl[0], 'lbl', 'end') + text(354, top + 110, lbl[1], 'lbl', 'end');
  if (F.gas > 0.05) s += text(354, top + 128, L('выделяется CO₂', 'CO₂ бөлінуде', 'CO₂ evolving'), 'lbl', 'end', ' style="fill:var(--warn)"');
  return scene(s);
}

/** Сушка над Na₂SO₄: мутная/прозрачная жидкость, осушитель комками или «снежком». */
export function dryScene(S, lc) {
  const D = S.dry, cloudy = D.water > 0.03;
  const salt = D.g > 0 ? Array.from({ length: Math.round(8 + D.g * 10) }, (_, i) => {
    const x = 150 + ((i * 23) % 62), y = 214 - ((i * 7) % 10), r = cloudy ? 3.2 + (i % 3) : 1.4;
    return `<circle cx="${x}" cy="${y}" r="${r}" class="sol"/>`;
  }).join('') : '';
  const col = cloudy ? 'rgba(205,210,190,.75)' : 'rgba(220,214,160,.32)';
  return scene(conical({ id: 'cfd', cx: 180, by: 222, vol: lc.vol || 12, cap: 50, color: col, inner: salt }) + text(180, 40, L('коническая колба 50 мл', 'конустық колба 50 мл', '50 mL conical flask'))
    + text(180, 244, cloudy ? L('жидкость мутная, осушитель слипается', 'сұйық лайлы, кептіргіш жабысады', 'cloudy liquid, the drying agent clumps') : L('жидкость прозрачная, осушитель сыпучий', 'сұйық мөлдір, кептіргіш үгілгіш', 'clear liquid, the drying agent flows freely')));
}

/** Установка для простой перегонки. o: { place, power, frac, boiling, Tshow, drip, rec, recFrac, pos } */
export function distApparatus(o = {}) {
  const pl = o.place || {};
  let s = stand(40, 70);
  const fx = 100, fy = 186;
  if ((pl.heat || o.heat) === 'mantle') s += mantle(fx, fy + 10, 40, o.power || 0);
  else if (pl.heat === 'burner') s += burner(fx);
  if (pl.flask || o.flask) {
    s += rbFlask({ id: 'rbd', cx: fx, cy: fy, r: 32, frac: o.frac ?? 0.4, boiling: o.boiling, chips: o.chips, color: o.color });
    s += `<rect class="gl" x="${fx - 8}" y="78" width="16" height="78"/><path class="gls" d="M${fx + 8} 96 L${fx + 54} 120"/>`;
  }
  const pos = pl.therm || o.pos;
  if (pos) {
    const bulb = pos === 'low' ? 196 : pos === 'high' ? 70 : 96;
    s += `<rect x="${fx - 2.5}" y="${bulb - 70}" width="5" height="70" rx="2" fill="var(--panel)" stroke="var(--glass)"/><circle class="redc" cx="${fx}" cy="${bulb + 2}" r="3.5"/><rect class="metd" x="${fx - 9}" y="70" width="18" height="9" rx="2"/>`;
    if (o.Tshow != null) s += text(fx - 14, 60, `${num(o.Tshow, 0)} °C`, 'lbl mono', 'end');
  }
  if (pl.cond || o.cond) {
    s += `<path class="gl" d="M${fx + 54} 112 L${fx + 170} 172 L${fx + 166} 180 L${fx + 50} 120 Z"/>`;
    s += `<path d="M${fx + 66} 110 L${fx + 162} 160 L${fx + 154} 176 L${fx + 58} 126 Z" fill="${o.water ? 'var(--liquid)' : 'none'}" stroke="var(--glass)" stroke-width="1.4"/>`;
    s += `<line x1="${fx + 156}" y1="172" x2="${fx + 160}" y2="190" stroke="var(--glass)" stroke-width="3"/><line x1="${fx + 66}" y1="110" x2="${fx + 70}" y2="94" stroke="var(--glass)" stroke-width="3"/>`;
    if (o.waterTop) s += text(fx + 74, 90, L('вода ↓', 'су ↓', 'water ↓'), 'lbl', 'start');
  }
  if (pl.rec || o.rec) {
    s += conical({ id: 'cfr', cx: 296, by: 226, s: 0.34, vol: o.recFrac || 0, cap: 50, color: o.recCloudy ? 'rgba(205,210,190,.8)' : 'rgba(220,214,160,.35)' });
    if (o.drip) s += `<circle data-key="dd${o.dripKey || 0}" class="drop" cx="${fx + 168}" cy="180" r="2" style="fill:var(--liquid);--dy:16px"/>`;
    if (o.recLabel) s += text(296, 246, o.recLabel);
  }
  return s;
}

export function distScene(S, lc) {
  const D = S.dist;
  const power = lc.c ? lc.c.pow || 0 : 0;
  const tot = D.flaskMass || 0;
  return scene(distApparatus({ heat: S.dapp.heat === 'burner' ? undefined : 'mantle', place: S.dapp.heat === 'burner' ? { heat: 'burner' } : {}, flask: 'rb', pos: S.dapp.pos, cond: true, rec: true, power, frac: Math.min(0.8, tot / 30), boiling: D.boiling, chips: S.chipD, water: !!D.water, waterTop: S.dapp.waterTop, Tshow: D.Tshow, drip: D.rate > 0, dripKey: lc.drip || 0, recFrac: D.rec === 'main' ? (D.mainMass || 0) * 1.6 : (D.foreMass || 0) * 1.6, recCloudy: D.rec === 'fore' && D.foreCloudy, recLabel: D.rec === 'main' ? L('взвешенный приёмник', 'өлшенген қабылдағыш', 'pre-weighed receiver') : L('приёмник для головной фракции', 'бастапқы фракция қабылдағышы', 'receiver for the fore-run') }));
}

/** Шкала термометра 100–140 °C крупно (снять отсчёт). */
export function thermoReadScene(T, lo = 100, hi = 140) {
  const x0 = 60, x1 = 320, X = (t) => x0 + ((t - lo) / (hi - lo)) * (x1 - x0);
  let s = `<rect x="${x0 - 14}" y="96" width="${x1 - x0 + 28}" height="40" rx="18" fill="var(--panel)" stroke="var(--glass)" stroke-width="1.6"/>`;
  s += `<rect class="redc" x="${x0 - 8}" y="112" width="${Math.max(0, X(T) - x0 + 8).toFixed(1)}" height="8"/>`;
  for (let t = lo; t <= hi; t++) {
    const big = t % 5 === 0;
    s += `<line x1="${X(t).toFixed(1)}" x2="${X(t).toFixed(1)}" y1="100" y2="${big ? 112 : 106}" stroke="var(--ink)" stroke-width="${big ? 1.2 : 0.7}"/>`;
    if (t % 10 === 0) s += `<text class="lbl mono" x="${X(t).toFixed(1)}" y="152" text-anchor="middle">${t}</text>`;
  }
  return scene(s + text(180, 70, L('термометр у отвода — шкала крупно, цена деления 1 °C', 'бұрма жанындағы термометр — шкала ірі, бөлік құны 1 °C', 'thermometer at the side arm — close-up, 1 °C divisions')) + text(180, 190, L('основная фракция перегоняется', 'негізгі фракция айдалуда', 'main fraction distilling')));
}

/** Пробирка с эфиром и NaOH в кипящей водяной бане (омыление). */
export function saponScene(S, lc) {
  const P = S.sap;
  const layer = Math.max(0, 1 - P.h) * 0.09;
  const inBath = lc.c && lc.c.bath;
  let s = bath({ kind: 'water', x: 90, y: 120, w: 180, hh: 110 });
  s += tube({ id: 'sp', cx: 180, top: inBath ? 40 : 10, len: 150, r: 11, frac: 0.5, color: 'var(--liquid)', layer: P.mixed ? 0 : layer, layerColor: ORG, label: null });
  if (P.mixed && layer > 0.005) s += text(206, 70, L('эмульсия', 'эмульсия', 'emulsion'), 'lbl', 'start');
  s += bubbles(100, 222, 160, inBath ? 7 : 0, inBath);
  s += steam(130, 116, inBath) + steam(240, 116, inBath);
  s += text(180, 246, inBath ? L('кипящая водяная баня, 100 °C', 'қайнаған су моншасы, 100 °C', 'boiling water bath, 100 °C') : L('пробирка вынута из бани', 'пробирка моншадан алынған', 'tube out of the bath'));
  return scene(s);
}

export function hoodScene(S, lc) { return scene(hood({ air: !!(lc.on && lc.on.hood) })); }

/** Схема реакции (для протокола и первого шага не нужна; используется в сцене весов как фон). */
export function thermoSmall(T) { return thermometer({ x: 30, top: 30, hh: 180, T, min: 0, max: 150, step: 10, major: 50 }); }
