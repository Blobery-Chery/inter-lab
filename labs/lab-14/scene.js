/** Сцены стенда работы № 14 (SVG 360×250). Цвета — CSS-переменные или явные rgba(…) для окраски растворов красителя. */
import { L, num } from '../../app/i18n.js';
import { scene, text, beaker, thermometer, rod, bath, hotplate, bubbles, steam, fumes, hood, tube, bottle, dropper } from '../../app/scene/svg.js';
import { moColor } from './model.js';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/** Цвет густой реакционной смеси (суспензии) по доле кислотной формы f: 1 — красная, 0 — оранжевая натриевая соль. */
export function slurryColor(f, a = 0.82) {
  const O = [236, 120, 28], R = [186, 24, 46], u = clamp(f, 0, 1);
  return `rgba(${O.map((v, i) => Math.round(v + (R[i] - v) * u)).join(',')},${a})`;
}

/** Цвет иодкрахмальной бумаги: синяя (избыток HNO₂) или белая. */
const paperColor = (blue) => (blue ? '#27306e' : 'var(--panel)');

/**
 * Стакан на стенде. o: { vol, cap (мл), color, ppt (0…1), pptColor, T, tMin, tMax, mark, rod, stir, bath ('ice'|'water'|null),
 *   hot (плитка: true — вкл.), plate (показать плитку), boil, steam, gas, fumes, label, paper: null|true|false, drops, dropColor }
 */
export function beakerScene(o = {}) {
  const cap = o.cap || 50, w = cap <= 50 ? 96 : 116, hh = cap <= 50 ? 112 : 128;
  const x = 180 - w / 2, y = (o.plate ? 196 : 222) - hh;
  let s = '';
  if (o.bath) s += bath({ kind: o.bath, x: 84, w: 192 });
  if (o.plate) s += hotplate({ on: !!o.hot, x: 100, y: 198, w: 160 });
  let inner = '';
  if (o.boil) inner += bubbles(x + 10, y + hh - 10, w - 20, 7);
  else if (o.gas) inner += bubbles(x + 14, y + hh - 10, w - 28, 4);
  s += beaker({ id: 'bk14', x, y, w, hh, frac: clamp((o.vol || 0) / cap, 0, 1), color: o.color, ppt: o.ppt || 0, pptColor: o.pptColor, cap, marks: cap <= 50 ? [20, 40] : [50, 100], inner });
  if (o.T != null) {
    const tMin = o.tMin ?? -10, tMax = o.tMax ?? 40;
    s += thermometer({ x: x + w - 24, top: y - 60, hh: hh + 50, T: o.T, min: tMin, max: tMax, step: tMax - tMin > 60 ? 10 : 5, major: tMax - tMin > 60 ? 20 : 10, mark: o.mark, labels: false });
  }
  if (o.rod) s += rod(x + 30, y - 44, x + 40, y + hh - 6, !!o.stir);
  if (o.drops) s += dropper(x + 52, y - 54, o.drops, 40 + hh * 0.5, o.dropColor || 'var(--liquid)');
  if (o.steam) s += steam(180, y - 6, true);
  if (o.fumes) s += fumes(196, y - 14, o.fumes);
  if (o.bath) s += bath({ kind: o.bath, x: 84, w: 192, front: true });
  const cap1 = o.label ? (o.bath ? { ru: o.label.ru + ' · ледяная баня', kk: o.label.kk + ' · мұз моншасы', en: o.label.en + ' · ice bath' } : o.label) : null;
  if (cap1) s += text(14, 20, cap1, 'lbl', 'start');
  if (o.paper != null) {
    s += `<rect x="16" y="64" width="44" height="58" rx="3" fill="var(--panel)" stroke="var(--line)"/><circle cx="38" cy="93" r="${o.paper ? 12 : 9}" fill="${paperColor(o.paper)}" stroke="var(--muted)" stroke-width=".6"/>`;
    s += text(12, 138, L('иодкрахм.', 'иодкрахмал', 'starch–iodide'), 'lbl', 'start') + text(12, 152, L('бумага', 'қағазы', 'paper'), 'lbl', 'start');
  }
  if (o.T != null) s += text(346, 20, `${num(o.T, 1)} °C`, 'lblb mono', 'end');
  return scene(s);
}

/** Пробирка с N,N-диметиланилином и уксусной кислотой (в вытяжном шкафу) — справа от цилиндра/пипетки. */
export function dmaTubeExtra(S, local) {
  const v = (S.vDMA || 0) + ((local.done && local.done.acoh) ? 1 : 0);
  return tube({ id: 'dma', cx: 268, top: 60, len: 140, r: 10, frac: clamp(v / 5, 0, 1), color: S.vDMA ? 'rgba(232,214,160,.55)' : null, label: L('пробирка', 'пробирка', 'test tube') });
}

/** Вытяжной шкаф (подготовка рабочего места). */
export function hoodScene(S, local) {
  return scene(hood({ air: !!(local.on && local.on.hood) }));
}

/** Пробирка над водяной баней (опыт 3). */
export function tubeBath(t, o = {}) {
  let s = bath({ kind: 'water', x: 104, y: 150, w: 152, hh: 80, color: o.hot ? 'rgba(160,198,222,.7)' : null });
  s += tube({ id: 'r3', cx: 180, top: 40, len: 150, r: 11, frac: clamp((t.v || 0) / 5, 0, 1), color: t.color, solid: t.solid, gas: t.gas, label: L('пробирка', 'пробирка', 'test tube') });
  if (o.hot) s += steam(140, 146, true) + steam(222, 146, true);
  s += bath({ kind: 'water', x: 104, y: 150, w: 152, hh: 80, front: true, label: L('водяная баня', 'су моншасы', 'water bath') });
  s += text(340, 30, `${num(o.T ?? 22, 0)} °C`, 'lbl mono', 'end');
  return scene(s);
}

/** Склянки реактивов слева от стакана — для шагов с выбором (выливание на лёд). */
export function pourScene(S, local) {
  const inp = local.inp || {}, ice = inp.ice ?? 4;
  const poured = !!local.chosen;
  const cubes = Array.from({ length: Math.round(clamp(ice / 2, 0, 8)) }, (_, i) => [146 + ((i * 23) % 70), 170 + ((i * 13) % 30), 13, (i * 37) % 30 - 15]);
  let s = bottle(16, 'HCl', L('конц. 36 %', 'конц. 36 %', 'conc. 36 %'));
  s += beaker({ id: 'pi', x: 126, y: 104, w: 108, hh: 118, frac: poured ? 0.42 : 0.06, color: poured ? 'rgba(236,236,226,.6)' : null, ppt: poured ? 0.7 : 0, pptColor: 'var(--solid)', cap: 100, marks: [50], label: L('стакан 100 мл', 'стақан 100 мл', '100 mL beaker') });
  s += cubes.map(([x, y, a, r]) => `<rect class="ice" x="${x}" y="${y}" width="${a}" height="${a}" rx="3" transform="rotate(${r} ${x + a / 2} ${y + a / 2})" opacity="${poured ? 0.45 : 0.92}"/>`).join('');
  s += text(330, 120, poured ? `≈ ${num(S.dz && S.dz.T0 != null ? S.dz.T0 : 1, 0)} °C` : L(`лёд: ${ice} г`, `мұз: ${ice} г`, `ice: ${ice} g`), 'lbl mono', 'end');
  return scene(s);
}

/** Подложка установки для вакуумного фильтрования (шаг сборки). */
export function filterBase() {
  return `<rect class="met" x="290" y="150" width="46" height="72" rx="6"/>${text(313, 244, L('насос', 'сорғы', 'pump'))}<rect class="met" x="40" y="224" width="200" height="8" rx="2"/>`;
}

export { moColor };
