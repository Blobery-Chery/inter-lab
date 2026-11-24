/**
 * SVG-примитивы посуды и установок для стенда. Все функции возвращают строку SVG.
 * Сцена рисуется в системе координат 360 × 250 (viewBox), стол — полоса y = 232…250.
 * Цвета — только через CSS-переменные (светлая и тёмная тема): классы .gl .liq .ice .met и т. п. в styles.css.
 * Идентификаторы clipPath должны быть уникальны в пределах сцены — передавайте id.
 */
import { tr } from '../i18n.js';
import { esc, clamp } from '../dom.js';

const f1 = (x) => Math.round(x * 10) / 10;

/** Общие градиенты сцены: металл штатива, вода бани, резиновая груша, блик стекла. Цвета — из темы. */
const DEFS = `<defs>
<linearGradient id="vg-metal" x1="0" x2="1"><stop offset="0" style="stop-color:var(--metal-dark)"/><stop offset=".35" style="stop-color:var(--metal)"/><stop offset=".6" style="stop-color:var(--metal-hi)"/><stop offset="1" style="stop-color:var(--metal-dark)"/></linearGradient>
<linearGradient id="vg-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--water-top)"/><stop offset="1" style="stop-color:var(--water-bot)"/></linearGradient>
<radialGradient id="vg-bulb" cx=".35" cy=".3" r=".8"><stop offset="0" style="stop-color:var(--rubber-hi)"/><stop offset="1" style="stop-color:var(--rubber)"/></radialGradient>
<radialGradient id="vg-merc" cx=".35" cy=".35" r=".75"><stop offset="0" style="stop-color:#f08a7c"/><stop offset="1" style="stop-color:#b3261e"/></radialGradient>
</defs>`;

/** Обёртка сцены: <svg viewBox="0 0 360 250"> с лабораторным столом (столешница y = 228…238, передняя кромка ниже). */
export function scene(inner, label) {
  return `<svg viewBox="0 0 360 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(tr(label || { ru: 'Лабораторная установка', kk: 'Зертханалық қондырғы', en: 'Laboratory set-up' }))}">${DEFS}<rect class="sv-benchtop" x="0" y="228" width="360" height="10"/><rect class="sv-bench" x="0" y="238" width="360" height="12"/><line class="sv-benchedge" x1="0" x2="360" y1="238" y2="238"/>${inner}</svg>`;
}

/** Подпись с выноской: тонкая линия от предмета (px, py) к подписи (lx, ly). anchor — выравнивание подписи. */
export function callout(px, py, lx, ly, s, anchor = 'start') {
  const lines = Array.isArray(s) ? s : [s];
  const w = Math.max(...lines.map((x) => String(tr(x)).length)) * 5.6;
  const left = anchor === 'start' ? lx : anchor === 'end' ? lx - w : lx - w / 2, right = left + w;
  // линия начинается у того края подписи, который ближе к предмету, и не перечёркивает текст
  const ex = px >= right ? right + 4 : px <= left ? left - 4 : (left + right) / 2;
  const ey = px > left && px < right ? (py < ly ? ly - 11 : ly + (lines.length - 1) * 12 + 4) : ly - 3 + (lines.length - 1) * 6;
  return `<g class="callout"><path d="M${f1(ex)} ${f1(ey)} L${f1(px)} ${f1(py)}" fill="none"/><circle cx="${f1(px)}" cy="${f1(py)}" r="1.6"/>${lines.map((x, i) => `<text class="lblc" x="${f1(lx)}" y="${f1(ly + i * 12)}" text-anchor="${anchor}">${esc(tr(x))}</text>`).join('')}</g>`;
}

/** Делит подпись {ru,kk,en} на две строки по пробелу ближе к середине (для выносок). */
export function split2(s) {
  const one = (t) => {
    t = String(t); const mid = t.length / 2; let k = -1;
    for (let i = 0; i < t.length; i++) if (t[i] === ' ' && (k < 0 || Math.abs(i - mid) < Math.abs(k - mid))) k = i;
    return k < 0 ? [t, ''] : [t.slice(0, k), t.slice(k + 1)];
  };
  if (typeof s !== 'object' || !s) return one(s);
  const r = Object.fromEntries(Object.entries(s).map(([k, v]) => [k, one(v)]));
  return [0, 1].map((i) => Object.fromEntries(Object.keys(r).map((k) => [k, r[k][i]])));
}

/** Блик на стекле (вертикальная светлая полоска). */
function shine(x1, y1, x2, y2, w = 2.4) {
  return `<path class="hl" d="M${f1(x1)} ${f1(y1)} L${f1(x2)} ${f1(y2)}" style="stroke-width:${w}"/>`;
}

export function text(x, y, s, cls = 'lbl', anchor = 'middle', extra = '') {
  return `<text class="${cls}" x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}"${extra}>${esc(tr(s))}</text>`;
}

/** Пузырьки газа (анимация подъёма). */
export function bubbles(x, y, w, n = 5, on = true) {
  if (!on) return '';
  let s = '';
  for (let i = 0; i < n; i++) s += `<circle class="bub" cx="${f1(x + (w * (i + 0.5)) / n)}" cy="${f1(y)}" r="${1.3 + (i % 3) * 0.6}" style="animation-delay:${(i * 0.23).toFixed(2)}s"/>`;
  return s;
}

/** Бурые пары NO₂ над сосудом; opacity 0…1. */
export function fumes(x, y, opacity = 0) {
  if (opacity <= 0.01) return '';
  return `<g opacity="${opacity.toFixed(2)}">${[0, 1, 2].map((i) => `<ellipse class="nox fume" style="animation-delay:${i}s" cx="${x + i * 5}" cy="${y}" rx="9" ry="6"/>`).join('')}</g>`;
}

/** Пар над горячей жидкостью. */
export function steam(x, y, on = true) {
  if (!on) return '';
  return `<g>${[0, 1, 2].map((i) => `<path class="steam" style="animation-delay:${(i * 0.6).toFixed(1)}s" d="M${x - 10 + i * 10} ${y} q-4 -8 0 -16 q4 -8 0 -16" fill="none" stroke="var(--glass)" stroke-width="1.4" stroke-linecap="round"/>`).join('')}</g>`;
}

/** Куски льда: массив [x, y, size, rotate]. */
export function ice(list, opacity = 0.92) {
  return list.map(([x, y, s, r]) => `<g transform="rotate(${r} ${x + s / 2} ${y + s / 2})" opacity="${opacity}"><rect class="ice" x="${x}" y="${y}" width="${s}" height="${s}" rx="${f1(s * 0.22)}"/><path class="hl" d="M${f1(x + s * 0.22)} ${f1(y + s * 0.3)} L${f1(x + s * 0.55)} ${f1(y + s * 0.2)}" style="stroke-width:1.6"/></g>`).join('');
}

/**
 * Коническая колба (Эрленмейера). cx — центр, by — дно.
 * o: { id, cx=180, by=222, s=1, vol (мл, условно), cap (мл, ёмкость, для шкалы уровня), color, solid (0…1), label, neck=true }
 */
export function conical(o = {}) {
  const id = o.id || 'cf', s = o.s || 1, cx = o.cx ?? 180, by = o.by ?? 222;
  const P = 'M168 58 L168 112 L124 212 Q121 222 132 222 L228 222 Q239 222 236 212 L192 112 L192 58 Z';
  const frac = clamp((o.vol || 0) / (o.cap || 50), 0, 1);
  const ly = 222 - frac * 150;
  const sh = o.solid > 0.01 ? 3 + 9 * Math.sqrt(clamp(o.solid, 0, 1)) : 0;
  return `<g transform="translate(${f1(cx - 180 * s)} ${f1(by - 222 * s)}) scale(${s})"><defs><clipPath id="${id}-c"><path d="${P}"/></clipPath></defs>
<g clip-path="url(#${id}-c)"><rect class="liq" x="110" y="${f1(ly)}" width="140" height="${f1(222 - ly)}"${o.color ? ` style="fill:${o.color}"` : ''}/>${o.swirl && frac > 0.04 ? `<g class="swirl"><ellipse cx="180" cy="${f1(ly + (222 - ly) * 0.35)}" rx="${f1(14 + (222 - ly) * 0.3)}" ry="3.2"/><ellipse cx="180" cy="${f1(ly + (222 - ly) * 0.7)}" rx="${f1(18 + (222 - ly) * 0.38)}" ry="3.6" style="animation-delay:-.4s"/></g>` : ''}${sh ? `<path class="sol" d="M${180 - sh * 3.2} 222 Q180 ${222 - 2 * sh} ${180 + sh * 3.2} 222 Z"${o.solidColor ? ` style="fill:${o.solidColor}"` : ''}/>` : ''}${o.inner || ''}</g>
<path class="gl" d="${P}"/><rect class="gl" x="164" y="53" width="32" height="6" rx="2"/>${frac > 0.01 ? `<path class="men" d="M${f1(Math.max(126, 180 - 12 - (222 - ly) * 0.44 + 2))} ${f1(ly)} L${f1(Math.min(234, 180 + 12 + (222 - ly) * 0.44 - 2))} ${f1(ly)}"/>` : ''}${shine(171.5, 64, 171.5, 112)}${shine(166, 122, 134, 196, 3)}</g>${o.label ? text(cx + 70 * s, by - 158 * s, o.label, 'lbl', 'start') : ''}`;
}

/**
 * Химический стакан. x, y — левый верхний угол, w × hh.
 * o: { id, x, y, w, hh, frac (0…1), color, ppt (0…1), pptColor, label, marks:[мл], cap }
 */
export function beaker(o = {}) {
  const id = o.id || 'bk', x = o.x ?? 120, y = o.y ?? 100, w = o.w ?? 120, hh = o.hh ?? 120;
  const ly = y + hh - clamp(o.frac || 0, 0, 1) * (hh - 6);
  let ppt = '';
  if (o.ppt > 0.01) {
    const n = Math.round(10 + 40 * clamp(o.ppt, 0, 1));
    for (let i = 0; i < n; i++) ppt += `<circle cx="${f1(x + 6 + ((i * 37) % (w - 12)))}" cy="${f1(y + hh - 4 - ((i * 53) % Math.max(8, (y + hh - ly) * 0.9)))}" r="${1.2 + (i % 3) * 0.6}"/>`;
    ppt = `<g class="ppt"${o.pptColor ? ` style="fill:${o.pptColor}"` : ''}>${ppt}</g>`;
  }
  const marks = (o.marks || []).map((v) => {
    const my = y + hh - (v / (o.cap || 100)) * (hh - 6);
    return `<line x1="${x}" x2="${x + 9}" y1="${f1(my)}" y2="${f1(my)}" stroke="var(--glass)"/><text class="lbl mono" x="${x + 12}" y="${f1(my + 3)}">${v}</text>`;
  }).join('');
  return `<defs><clipPath id="${id}-c"><rect x="${x + 2}" y="${y}" width="${w - 4}" height="${hh - 2}" rx="4"/></clipPath></defs>
<g clip-path="url(#${id}-c)"><rect class="liq" x="${x}" y="${f1(ly)}" width="${w}" height="${f1(y + hh - ly)}"${o.color ? ` style="fill:${o.color}"` : ''}/>${ppt}${o.inner || ''}</g>
<path class="glf" d="M${x} ${y} L${x} ${y + hh - 5} Q${x} ${y + hh} ${x + 5} ${y + hh} L${x + w - 5} ${y + hh} Q${x + w} ${y + hh} ${x + w} ${y + hh - 5} L${x + w} ${y} Z"/>${(o.frac || 0) > 0.01 ? `<path class="men" d="M${x + 3} ${f1(ly)} L${x + w - 3} ${f1(ly)}"/>` : ''}<path class="gls" d="M${x} ${y} L${x} ${y + hh - 5} Q${x} ${y + hh} ${x + 5} ${y + hh} L${x + w - 5} ${y + hh} Q${x + w} ${y + hh} ${x + w} ${y + hh - 5} L${x + w} ${y} M${x} ${y} l-6 -5"/>${shine(x + 7, y + 10, x + 7, y + hh - 14)}${marks}${o.label ? text(x + w / 2, y - 10, o.label) : ''}`;
}

/**
 * Пробирка. cx — центр, top — верх, len — длина (до дна). r — радиус.
 * o: { id, cx, top=36, len=166, r=11, frac (0…1), color, ppt (0…1), pptColor, solid (0…1), gas, mirror, label }
 */
export function tube(o = {}) {
  const id = o.id || 'tb', cx = o.cx ?? 180, top = o.top ?? 36, len = o.len ?? 166, r = o.r ?? 11;
  const bot = top + len;
  const ly = bot + r - clamp(o.frac || 0, 0, 1) * (len * 0.85);
  let inner = `<rect class="liq" x="${cx - r - 1}" y="${f1(ly)}" width="${2 * r + 2}" height="${f1(bot + r - ly + 2)}"${o.color ? ` style="fill:${o.color}"` : ''}/>`;
  if (o.solid > 0.01) inner += `<path class="sol" d="M${cx - r + 2} ${bot + r - 1} Q${cx} ${f1(bot + r - 1 - 14 * o.solid)} ${cx + r - 2} ${bot + r - 1} Z"${o.solidColor ? ` style="fill:${o.solidColor}"` : ''}/>`;
  if (o.ppt > 0.01) {
    let p = '';
    const n = Math.round(6 + 16 * clamp(o.ppt, 0, 1));
    for (let k = 0; k < n; k++) p += `<circle cx="${f1(cx - r + 3 + ((k * 7) % (2 * r - 6)))}" cy="${f1(bot + r - 3 - ((k * 5) % 14) - (k > 12 ? 6 : 0))}" r="${1.4 + (k % 2) * 0.8}"/>`;
    inner += `<g style="fill:${o.pptColor || 'var(--solid)'}">${p}</g>`;
  }
  if (o.layer) inner += `<rect x="${cx - r - 1}" y="${f1(ly)}" width="${2 * r + 2}" height="${f1(o.layer * len * 0.85)}" style="fill:${o.layerColor || 'var(--liq-y)'}"/>`;
  if (o.gas) inner += bubbles(cx - r + 2, bot + r - 6, 2 * r - 4, 4, true);
  if (o.mirror) inner += `<rect x="${cx - r - 1}" y="${f1(ly)}" width="4" height="${f1(bot + r - ly)}" fill="var(--metal)" opacity=".9"/><rect x="${cx + r - 3}" y="${f1(ly)}" width="4" height="${f1(bot + r - ly)}" fill="var(--metal)" opacity=".9"/>`;
  return `<defs><clipPath id="${id}-c"><path d="M${cx - r} ${top + 4} L${cx - r} ${bot} A${r} ${r} 0 0 0 ${cx + r} ${bot} L${cx + r} ${top + 4} Z"/></clipPath></defs>
<g clip-path="url(#${id}-c)">${inner}</g><path class="gls" d="M${cx - r} ${top} L${cx - r} ${bot} A${r} ${r} 0 0 0 ${cx + r} ${bot} L${cx + r} ${top}"/>${shine(cx - r * 0.45, top + 8, cx - r * 0.45, bot - 4, 1.8)}${o.label ? text(cx, bot + r + 14, o.label, 'lblb') : ''}`;
}

/** Штатив для пробирок. */
export function tubeRack(x1 = 60, x2 = 300) {
  return `<ellipse class="shadow" cx="${(x1 + x2) / 2}" cy="231" rx="${(x2 - x1) / 2 + 4}" ry="2.8"/><rect class="dev" x="${x1 + 3}" y="156" width="6" height="70"/><rect class="dev" x="${x2 - 9}" y="156" width="6" height="70"/>
<rect class="dev" x="${x1}" y="221" width="${x2 - x1}" height="9" rx="3"/><rect class="dev" x="${x1}" y="150" width="${x2 - x1}" height="10" rx="3"/><rect class="devf" x="${x1}" y="156" width="${x2 - x1}" height="4" rx="2"/>`;
}

/**
 * Термометр (вертикальный). x — левый край, top, hh — высота трубки, T — температура, [min, max] — шкала.
 * mark — красная отметка (например, 10 °C).
 */
export function thermometer(o = {}) {
  const x = o.x ?? 183, top = o.top ?? 4, hh = o.hh ?? 206, min = o.min ?? -20, max = o.max ?? 40;
  const Y = (T) => top + hh - 6 - ((T - min) / (max - min)) * (hh - 14);
  let ticks = '';
  const step = o.step || 5, major = o.major || 10;
  for (let T = min; T <= max + 1e-9; T += step) {
    const y = Y(T), isM = Math.abs(T % major) < 1e-6, isMark = o.mark != null && Math.abs(T - o.mark) < 1e-6;
    ticks += `<line x1="${x + 6}" x2="${x + (isM ? 12 : 9)}" y1="${f1(y)}" y2="${f1(y)}" stroke="${isMark ? 'var(--bad)' : 'var(--glass)'}" stroke-width="${isMark ? 1.8 : 0.9}"/>`;
    if (isM && o.labels !== false) ticks += `<text class="lbl mono" x="${x + 14}" y="${f1(y + 3)}" style="font-size:8px">${T}</text>`;
  }
  const ty = clamp(Y(o.T ?? 20), top + 4, top + hh - 4);
  return `<g><rect x="${x}" y="${top}" width="7" height="${hh}" rx="3.5" class="thg"/>${ticks}<rect class="redc" x="${x + 2.2}" y="${f1(ty)}" width="2.6" height="${f1(top + hh - ty + 2)}" rx="1.3"/><circle cx="${x + 3.5}" cy="${top + hh + 4}" r="5.2" fill="url(#vg-merc)" stroke="var(--glass)" stroke-width=".8"/>${shine(x + 1.6, top + 6, x + 1.6, top + hh - 8, 1.1)}</g>`;
}

/** Стеклянная палочка; stir — анимация перемешивания. */
export function rod(x1 = 172, y1 = 10, x2 = 158, y2 = 216, stir = false) {
  return `<g class="${stir ? 'stir' : ''}" style="transform-origin:${x1}px ${y1}px"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="rodg" stroke-linecap="round"/><line x1="${x1 - 0.8}" y1="${y1 + 4}" x2="${x2 - 0.8}" y2="${y2 - 6}" class="hl" style="stroke-width:1"/></g>`;
}

/** Капельная пипетка над сосудом; dropKey — номер капли (каждая новая капля перезапускает анимацию). */
export function dropper(x = 177, y = 9, dropKey = 0, dropTo = 120, color = 'var(--liq-y)') {
  return `<g><rect x="${x - 3.2}" y="${y + 6}" width="6.4" height="30" class="gl"/><rect x="${x - 2}" y="${y + 18}" width="4" height="17" style="fill:${color}" opacity=".85"/><path class="gl" d="M${x - 3.2} ${y + 36} L${x - 0.6} ${y + 55} L${x + 0.6} ${y + 55} L${x + 3.2} ${y + 36} Z"/><path d="M${x - 6.5} ${y + 2} Q${x - 7.5} ${y - 9} ${x} ${y - 10} Q${x + 7.5} ${y - 9} ${x + 6.5} ${y + 2} L${x + 4} ${y + 7} L${x - 4} ${y + 7} Z" fill="url(#vg-bulb)"/><ellipse cx="${x - 2.4}" cy="${y - 4}" rx="1.6" ry="3" class="hlf"/>${dropKey ? `<circle data-key="d${dropKey}" class="drop" cx="${x}" cy="${y + 57}" r="2.4" style="fill:${color};--dy:${dropTo}px"/>` : ''}</g>`;
}

/**
 * Баня (стеклянный кристаллизатор с овальным краем). kind: 'ice' | 'ice-salt' | 'water' | 'empty'.
 * Рисуется в два слоя: front = false — задняя стенка, вода и лёд за колбой; front = true — лёд перед колбой,
 * толща воды поверх погружённой части и передний край.
 */
export function bath(o = {}) {
  const x = o.x ?? 64, y = o.y ?? 136, w = o.w ?? 232, hh = o.hh ?? 94;
  const front = o.front ?? false;
  if (o.kind === 'none') return '';
  const cx = x + w / 2, ry = 9, wy = y + 16, bot = y + hh;
  const wet = o.kind !== 'empty';
  const isIce = o.kind === 'ice' || o.kind === 'ice-salt';
  const iceBack = [[x + 18, wy - 6, 17, -12], [x + 44, wy - 2, 19, 8], [x + w - 64, wy - 5, 18, 14], [x + w - 38, wy - 1, 16, -6]];
  const iceFront = [[x + 12, wy + 14, 19, 10], [x + w - 32, wy + 18, 17, -14], [x + 50, wy + 30, 15, 6], [x + w - 70, wy + 30, 17, -8], [x + 20, bot - 30, 16, 18]];
  const water = o.color ? ` style="fill:${o.color}"` : '';
  if (front) {
    let s = '';
    if (wet) s += `<rect x="${x + 2}" y="${wy}" width="${w - 4}" height="${bot - wy - 2}" rx="8" class="water-front"${water}/>`;
    if (isIce) s += ice(iceFront);
    if (o.kind === 'ice-salt') s += [16, 40, 66, w - 70, w - 46, w - 20, 26, w - 34, 90, w - 96, 110, w - 120].map((dx, i) => `<rect class="salt" x="${x + dx}" y="${wy + 1 + (i % 3) * 3}" width="2.6" height="2.6" transform="rotate(${(i * 37) % 90} ${x + dx + 1.3} ${wy + 2 + (i % 3) * 3})"/>`).join('');
    s += `<path class="gls" d="M${x} ${y + ry} L${x} ${bot - 10} Q${x} ${bot} ${x + 12} ${bot} L${x + w - 12} ${bot} Q${x + w} ${bot} ${x + w} ${bot - 10} L${x + w} ${y + ry}"/><path class="gls" d="M${x} ${y + ry} A${w / 2} ${ry} 0 0 0 ${x + w} ${y + ry}"/>${shine(x + 8, y + 18, x + 8, bot - 12, 3)}${shine(x + w - 9, y + 22, x + w - 9, bot - 18, 1.6)}`;
    // подпись — выноской слева сверху, чтобы не ложилась на предметы в бане
    return s + (o.label ? callout(x + 8, y + 22, Math.max(6, x - 40), y - 26, o.label) : '');
  }
  return `<ellipse cx="${cx}" cy="${bot - 1}" rx="${w / 2 + 6}" ry="5" class="shadow"/><path class="glf" d="M${x} ${y + ry} L${x} ${bot - 10} Q${x} ${bot} ${x + 12} ${bot} L${x + w - 12} ${bot} Q${x + w} ${bot} ${x + w} ${bot - 10} L${x + w} ${y + ry} Z"/><path class="gls" d="M${x} ${y + ry} A${w / 2} ${ry} 0 0 1 ${x + w} ${y + ry}"/>${wet ? `<rect x="${x + 2}" y="${wy}" width="${w - 4}" height="${bot - wy - 2}" rx="8" fill="url(#vg-water)"${water}/><ellipse cx="${cx}" cy="${wy}" rx="${w / 2 - 2}" ry="${ry - 2}" class="water-top"${water}/>` : ''}${isIce ? ice(iceBack) : ''}`;
}

/** Электроплитка; on — накал. */
export function hotplate(o = {}) {
  const x = o.x ?? 100, y = o.y ?? 198, w = o.w ?? 160, h = o.h ?? 34;
  return `<ellipse cx="${x + w / 2}" cy="${y + h}" rx="${w / 2 + 4}" ry="3.5" class="shadow"/><rect class="dev" x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/><rect class="devf" x="${x}" y="${y + h - 16}" width="${w}" height="16" rx="5"/><rect x="${x + 10}" y="${y - 6}" width="${w - 20}" height="8" rx="3" class="metd"/><rect x="${x + 10}" y="${y - 6}" width="${w - 20}" height="8" rx="3" fill="var(--hot)" opacity="${o.on ? 0.6 : 0}"/><circle cx="${x + w - 20}" cy="${y + h / 2}" r="${Math.min(7.5, h / 2 - 2)}" class="knob"/><line x1="${x + w - 20}" y1="${y + h / 2}" x2="${x + w - 20}" y2="${y + h / 2 - 6}" stroke="var(--panel)" stroke-width="1.6" stroke-linecap="round"/><circle cx="${x + 18}" cy="${y + h / 2}" r="3.5" fill="var(--hot)" opacity="${o.on ? 1 : 0.18}"/>`;
}

/** Колбонагреватель (полусферическая чаша). power 0…3 — накал. */
export function mantle(cx = 180, cy = 196, r = 46, power = 0) {
  return `<ellipse class="shadow" cx="${cx}" cy="${cy + r - 1}" rx="${r + 8}" ry="3"/><path class="dev" d="M${cx - r - 6} ${cy - 8} Q${cx - r - 6} ${cy + r - 4} ${cx} ${cy + r - 2} Q${cx + r + 6} ${cy + r - 4} ${cx + r + 6} ${cy - 8} Z"/><path class="devf" d="M${cx - r - 2} ${cy + 14} Q${cx} ${cy + r + 2} ${cx + r + 2} ${cy + 14} Q${cx + r + 4} ${cy + r - 6} ${cx} ${cy + r - 3} Q${cx - r - 4} ${cy + r - 6} ${cx - r - 2} ${cy + 14} Z"/>
<path d="M${cx - r} ${cy - 8} Q${cx - r} ${cy + r - 12} ${cx} ${cy + r - 10} Q${cx + r} ${cy + r - 12} ${cx + r} ${cy - 8}" fill="none" stroke="var(--hot)" stroke-width="3" opacity="${[0, 0.35, 0.65, 1][power] || 0}"/>
<circle class="knob" cx="${cx + r - 2}" cy="${cy + 26}" r="6"/><circle cx="${cx - r + 6}" cy="${cy + 26}" r="3" fill="var(--hot)" opacity="${power ? 1 : 0.15}"/>`;
}

/** Склянка с реактивом: стекло, крышка, содержимое, этикетка (длинное название уменьшается, чтобы влезть). cls 'nox' — тёмная склянка. */
export function bottle(x, name, sub, cls) {
  const nm = String(tr(name)), sb = sub ? String(tr(sub)) : '';
  // шрифт уменьшается под ширину этикетки (34 px); если и так не влезает — сжимается textLength
  const fs = (t, max) => Math.max(7.5, Math.min(max, 34 / Math.max(1, t.length * 0.62))).toFixed(1);
  const fit = (t, size) => (t.length * 0.62 * size > 35 ? ' textLength="34" lengthAdjust="spacingAndGlyphs"' : '');
  const tint = cls ? ' style="fill:var(--nox);opacity:.35"' : '';
  return `<ellipse class="shadow" cx="${x + 23}" cy="231" rx="27" ry="2.6"/><rect class="glf" x="${x}" y="122" width="46" height="108" rx="8"${cls ? ' style="fill:var(--nox);fill-opacity:.18"' : ''}/>
<rect x="${x + 2}" y="176" width="42" height="52" rx="6" class="liq"${tint}/><rect class="gls" x="${x}" y="122" width="46" height="108" rx="8"/>
<rect class="glf" x="${x + 14}" y="110" width="18" height="13"/><rect class="gls" x="${x + 14}" y="110" width="18" height="13"/><rect class="knob" x="${x + 11}" y="100" width="24" height="12" rx="3"/>
<rect class="pnl" x="${x + 4}" y="146" width="38" height="${sb ? 38 : 28}" rx="2"/>
<text class="lblb" x="${x + 23}" y="${sb ? 163 : 164}" text-anchor="middle" style="font-size:${fs(nm, 10.5)}px"${fit(nm, +fs(nm, 10.5))}>${esc(nm)}</text>${sb ? `<text class="lbl" x="${x + 23}" y="${177}" text-anchor="middle" style="font-size:${fs(sb, 9.5)}px"${fit(sb, +fs(sb, 9.5))}>${esc(sb)}</text>` : ''}${shine(x + 40, 130, x + 40, 222, 2)}`;
}

/** Воронка Бюхнера на колбе Бунзена с вакуумным шлангом и насосом. */
export function vacuumFilter(o = {}) {
  const fv = clamp(o.filtrate || 0, 0, 1), cake = clamp(o.cake || 0, 0, 1);
  return `<defs><clipPath id="bf-c"><path d="M152 126 L152 150 L112 222 L230 222 L190 150 L190 126 Z"/></clipPath></defs>
<g clip-path="url(#bf-c)"><rect class="liq" x="110" y="${f1(222 - fv * 70)}" width="122" height="${f1(fv * 70)}"/></g>
<ellipse class="shadow" cx="171" cy="231" rx="66" ry="3"/><path class="gl" d="M152 124 L152 150 L112 220 Q110 224 116 224 L226 224 Q232 224 230 220 L190 150 L190 124"/>${shine(158, 152, 126, 212, 2.6)}
<path class="gls" d="M190 136 L232 128"/>${o.hose !== false ? `<path d="M232 128 C262 122 270 150 292 160" fill="none" stroke="var(--metal-dark)" stroke-width="5" stroke-linecap="round"/>` : ''}
${pump(o.vac)}
${o.seal === false ? '' : '<rect class="metd" x="146" y="112" width="50" height="14" rx="3"/>'}<rect class="porc" x="166" y="92" width="10" height="34"/><path class="porc" d="M124 56 L218 56 L214 94 L128 94 Z"/>
${o.liquid ? `<rect class="liq" x="130" y="74" width="82" height="14"/>` : ''}${cake > 0 ? `<rect class="ppt" x="132" y="${f1(88 - 9 * cake)}" width="78" height="${f1(9 * cake)}" stroke="var(--muted)" stroke-width=".5"${o.cakeColor ? ` style="fill:${o.cakeColor}"` : ''}/>` : ''}
${o.paper ? `<line x1="130" y1="89" x2="212" y2="89" stroke="var(--muted)" stroke-width="2.5"/>` : ''}
${callout(214, 62, 248, 40, { ru: 'воронка Бюхнера', kk: 'Бюхнер шұңғымасы', en: 'Büchner funnel' })}${callout(127, 196, 104, 118, { ru: 'колба Бунзена', kk: 'Бунзен колбасы', en: 'filter flask' }, 'end')}`;
}

/** Вакуумный насос справа на столе; on — включён. */
export function pump(on = false) {
  return `<ellipse class="shadow" cx="313" cy="232" rx="28" ry="2.6"/><rect class="dev" x="290" y="150" width="46" height="80" rx="6"/><rect class="devf" x="290" y="196" width="46" height="34" rx="5"/><circle class="knob" cx="313" cy="212" r="6"/><circle cx="313" cy="168" r="5" fill="var(--good)" opacity="${on ? 1 : 0.2}"/>${callout(322, 150, 340, 132, { ru: 'насос', kk: 'сорғы', en: 'pump' }, 'end')}`;
}

/** Вытяжной шкаф; air — тяга включена. */
export function hood(o = {}) {
  return `<rect class="dev" x="44" y="10" width="272" height="222" rx="8"/><rect class="devf" x="44" y="10" width="272" height="20" rx="8"/><rect x="58" y="34" width="244" height="190" rx="4" fill="var(--scene)"/>
${o.air ? `<g>${[100, 180, 260].map((x, i) => `<path class="airp" style="animation-delay:${i * 0.4}s" d="M${x} 160 l0 -40 m-6 8 l6 -8 l6 8" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/>`).join('')}</g>` : ''}
<rect class="gl" x="58" y="34" width="244" height="${o.sashLow === false ? 40 : 92}" rx="3"/><rect class="metd" x="58" y="${o.sashLow === false ? 72 : 124}" width="244" height="6"/>
<rect class="pnl" x="88" y="178" width="30" height="46" rx="4"/><rect class="nox" x="128" y="178" width="30" height="46" rx="4" opacity=".3"/><path class="gl" d="M200 170 L200 190 L184 222 L232 222 L216 190 L216 170 Z"/>
<circle cx="294" cy="22" r="5" fill="var(--good)" opacity="${o.air ? 1 : 0.2}"/>${text(284, 26, { ru: 'тяга', kk: 'тартым', en: 'airflow' }, 'lbl', 'end')}${text(58, 26, { ru: 'вытяжной шкаф', kk: 'тартпа шкаф', en: 'fume hood' }, 'lbl', 'start')}${o.extra || ''}`;
}

/** Бензольное кольцо с заместителями {позиция 0…5: 'COOH'}. */
export function ring(cx, cy, r, subs = {}) {
  const V = [];
  for (let i = 0; i < 6; i++) { const a = ((-90 + 60 * i) * Math.PI) / 180; V.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  let p = `<polygon points="${V.map((v) => v.map((q) => q.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="var(--ink)" stroke-width="1.6"/><circle cx="${cx}" cy="${cy}" r="${r * 0.58}" fill="none" stroke="var(--ink)" stroke-width="1.2"/>`;
  for (const k in subs) {
    const i = +k, [x, y] = V[i], a = ((-90 + 60 * i) * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    p += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(cx + (r + 13) * c).toFixed(1)}" y2="${(cy + (r + 13) * s).toFixed(1)}" stroke="var(--ink)" stroke-width="1.6"/><text class="lblb" x="${(cx + (r + 17) * c).toFixed(1)}" y="${(cy + (r + 17) * s + 4).toFixed(1)}" text-anchor="${c > 0.3 ? 'start' : c < -0.3 ? 'end' : 'middle'}">${subs[k]}</text>`;
  }
  return p;
}

/** Круглодонная колба. cx, cy — центр шара. */
export function rbFlask(o = {}) {
  const cx = o.cx ?? 180, cy = o.cy ?? 180, r = o.r ?? 34, id = o.id || 'rb';
  const ly = cy + r - clamp(o.frac || 0, 0, 1) * 2 * r;
  return `<defs><clipPath id="${id}-c"><circle cx="${cx}" cy="${cy}" r="${r - 1}"/></clipPath></defs><g clip-path="url(#${id}-c)"><rect class="liq" x="${cx - r}" y="${f1(ly)}" width="${2 * r}" height="${f1(cy + r - ly)}"${o.color ? ` style="fill:${o.color}"` : ''}/>${o.boiling ? bubbles(cx - r * 0.6, cy + r * 0.7, r * 1.2, 6) : ''}${o.chips ? `<circle cx="${cx - 6}" cy="${cy + r - 5}" r="2" class="metd"/><circle cx="${cx + 5}" cy="${cy + r - 4}" r="2" class="metd"/>` : ''}</g>
<circle class="gls" cx="${cx}" cy="${cy}" r="${r}"/><rect class="gl" x="${cx - 8}" y="${cy - r - 34}" width="16" height="36"/><path class="hl" d="M${f1(cx - r * 0.72)} ${f1(cy - r * 0.1)} A${f1(r * 0.75)} ${f1(r * 0.75)} 0 0 1 ${f1(cx - r * 0.25)} ${f1(cy - r * 0.66)}" style="stroke-width:2.6"/>${shine(cx - 4, cy - r - 30, cx - 4, cy - r - 2, 1.6)}`;
}

/** Обратный холодильник (вертикальный) над точкой (cx, by). waterIn — 'bottom' | 'top' | null. */
export function condenser(o = {}) {
  const cx = o.cx ?? 180, by = o.by ?? 112, hh = o.hh ?? 96;
  const t = by - hh;
  return `<rect class="gl" x="${cx - 7}" y="${t}" width="14" height="${hh}"/><rect x="${cx - 14}" y="${t + 10}" width="28" height="${hh - 20}" rx="6" fill="${o.water ? 'var(--liquid)' : 'var(--glass-fill)'}" stroke="var(--glass)" stroke-width="1.6"/>${shine(cx - 10, t + 16, cx - 10, by - 16, 1.8)}
<line x1="${cx + 14}" y1="${o.waterIn === 'top' ? t + 16 : by - 16}" x2="${cx + 30}" y2="${o.waterIn === 'top' ? t + 16 : by - 16}" stroke="var(--glass)" stroke-width="3"/><line x1="${cx - 14}" y1="${o.waterIn === 'top' ? by - 16 : t + 16}" x2="${cx - 30}" y2="${o.waterIn === 'top' ? by - 16 : t + 16}" stroke="var(--glass)" stroke-width="3"/>`;
}

/** Делительная воронка. layers: [{frac, color}] снизу вверх. */
export function sepFunnel(o = {}) {
  const cx = o.cx ?? 180, top = o.top ?? 30, id = o.id || 'sf';
  const P = `M${cx - 8} ${top} L${cx - 8} ${top + 20} Q${cx - 46} ${top + 70} ${cx - 10} ${top + 140} L${cx - 3} ${top + 150} L${cx + 3} ${top + 150} L${cx + 10} ${top + 140} Q${cx + 46} ${top + 70} ${cx + 8} ${top + 20} L${cx + 8} ${top} Z`;
  let y = top + 150, layers = '';
  for (const l of o.layers || []) {
    const hh = l.frac * 120;
    layers += `<rect x="${cx - 50}" y="${f1(y - hh)}" width="100" height="${f1(hh)}" style="fill:${l.color || 'var(--liquid)'}"/>`;
    y -= hh;
  }
  return `<defs><clipPath id="${id}-c"><path d="${P}"/></clipPath></defs><g clip-path="url(#${id}-c)">${layers}</g><path class="gl" d="${P}"/>${shine(cx - 18, top + 50, cx - 14, top + 110, 2.4)}<rect class="metd" x="${cx - 12}" y="${top + 150}" width="24" height="7" rx="2"/><rect class="gl" x="${cx - 2}" y="${top + 157}" width="4" height="26"/><rect class="metd" x="${cx - 10}" y="${top - 8}" width="20" height="9" rx="3"/>`;
}

/** Лабораторный штатив с лапкой. */
export function stand(x = 60, clampY = 90, reach = 70, jaws = false) {
  const dir = reach < 0 ? -1 : 1, ex = x + 2.5 + reach;
  return `<ellipse cx="${x + 10}" cy="233" rx="46" ry="3" class="shadow"/><rect class="dev" x="${x - 30}" y="222" width="80" height="10" rx="3"/><rect x="${x}" y="18" width="5" height="206" rx="2" fill="url(#vg-metal)"/>
<rect x="${f1(Math.min(x + 2.5, ex))}" y="${clampY}" width="${f1(Math.abs(reach))}" height="5" rx="2" fill="url(#vg-metal)"/><rect class="knob" x="${x - 4}" y="${clampY - 5}" width="13" height="15" rx="3"/>${jaws ? `
<rect class="knob" x="${f1(ex - (dir > 0 ? 4 : 10))}" y="${clampY - 7}" width="14" height="19" rx="4"/><rect class="pad" x="${f1(ex - (dir > 0 ? 2 : 8))}" y="${clampY - 5}" width="3" height="15" rx="1"/><rect class="pad" x="${f1(ex + (dir > 0 ? 7 : 1))}" y="${clampY - 5}" width="3" height="15" rx="1"/>` : ''}`;
}
