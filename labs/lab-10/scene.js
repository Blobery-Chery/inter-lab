/** Сцены стенда работы № 10 (SVG 360×250). Цвета посуды — CSS-переменные, окраска растворов — rgba. */
import { L, num } from '../../app/i18n.js';
import { scene, text, tube, tubeRack, thermometer, bath, hotplate, hood, steam, bottle, rod } from '../../app/scene/svg.js';

const TUBE_TOP = 44, TUBE_LEN = 138;

function oneTube(id, cx, t, cap, label) {
  return tube({ id, cx, top: TUBE_TOP, len: TUBE_LEN, r: 10, frac: Math.min(1, (t.v || 0) / cap), color: t.color || (t.ppt > 0.15 ? `rgba(228,230,232,${(0.45 + 0.4 * Math.min(1, t.ppt)).toFixed(2)})` : undefined), solid: t.solid, ppt: t.ppt, pptColor: t.pptColor, gas: t.gas, layer: t.layer, layerColor: t.layerColor, label });
}

/**
 * Штатив с пробирками для шага test. defs — шаги tubes [{ id, short }], local — ctx.local шага test.
 * o: { cap — объём пробирки для шкалы, мл; title; hot: (t) → bool — пар над пробиркой; rod: id пробирки с палочкой }
 */
export function tubesScene(defs, local, o = {}) {
  const n = defs.length, cap = o.cap || 5;
  const xs = n === 1 ? [180] : defs.map((_, i) => 180 + (i - (n - 1) / 2) * Math.min(80, 260 / (n - 1)));
  let s = '';
  defs.forEach((d, i) => {
    const t = (local.tubes || {})[d.id] || {};
    s += oneTube('t10' + i, xs[i], t, cap, d.short || d.label);
    if (o.hot && o.hot(t)) s += steam(xs[i], TUBE_TOP - 4, true);
    if (o.rod === d.id || (o.rodIf && o.rodIf(t))) s += rod(xs[i] + 3, TUBE_TOP - 30, xs[i] - 2, TUBE_TOP + TUBE_LEN, !!(o.rodIf && o.rodIf(t)));
    if (local.sel === d.id && n > 1) s += `<path d="M${xs[i] - 6} ${TUBE_TOP - 16} L${xs[i] + 6} ${TUBE_TOP - 16} L${xs[i]} ${TUBE_TOP - 8} Z" fill="var(--accent)"/>`;
  });
  if (o.title) s += text(180, 16, o.title, 'lbl');
  return scene(s + tubeRack(Math.min(...xs) - 34, Math.max(...xs) + 34));
}

/**
 * Пробирка на водяной бане: баня на электроплитке, термометр в бане.
 * o: { t — вид пробирки {v, color, ppt, pptColor, gas}; inBath; Tb — температура бани; T — пробирки; heat — плитка включена; cap }
 */
export function bathScene(o) {
  const t = o.t || {}, cap = o.cap || 5, inBath = !!o.inBath;
  let s = '';
  s += hotplate({ x: 140, y: 198, w: 180, on: o.heat });
  s += bath({ x: 150, y: 104, w: 160, hh: 92 });
  if (o.Tb > 75) s += steam(195, 100, true) + steam(265, 100, true);
  const cx = inBath ? 210 : 70, top = inBath ? 36 : TUBE_TOP;
  s += tube({ id: 'bt', cx, top, len: TUBE_LEN, r: 10, frac: Math.min(1, (t.v || 0) / cap), color: t.color, ppt: t.ppt, pptColor: t.pptColor, gas: t.gas });
  if (!inBath) s += tubeRack(36, 104);
  s += thermometer({ x: 280, top: 22, hh: 160, T: o.Tb ?? 20, min: 0, max: 100, step: 10, major: 20, mark: o.mark });
  s += text(230, 244, L(`баня ${num(o.Tb ?? 20, 0)} °C · пробирка ${num(o.T ?? 20, 0)} °C`, `монша ${num(o.Tb ?? 20, 0)} °C · пробирка ${num(o.T ?? 20, 0)} °C`, `bath ${num(o.Tb ?? 20, 0)} °C · tube ${num(o.T ?? 20, 0)} °C`), 'lbl mono');
  if (!inBath) s += text(70, 244, L('штатив', 'штатив', 'rack'), 'lbl');
  return scene(s);
}

/** Вытяжной шкаф с реактивами работы (шаг checklist). */
export function hoodScene(S, local) {
  const on = (local && local.on) || {};
  return scene(hood({ air: !!on.hood, extra: `${text(258, 176, L('бромная вода', 'бромды су', 'bromine water'), 'lbl')}<rect x="244" y="182" width="28" height="22" rx="3" fill="rgba(200,120,40,.55)" stroke="var(--glass)"/>` }));
}

/** Склянки реактивов опыта — фон для шагов decide. names: [[формула, подпись]] */
export function bottlesScene(names, note) {
  let s = '';
  names.slice(0, 6).forEach(([f, sub], i) => { s += bottle(12 + i * 58, f, sub); });
  if (note) s += text(180, 40, note, 'lbl');
  return scene(s);
}
