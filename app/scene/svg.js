/**
 * SVG-примитивы посуды и установок для стенда. Все функции возвращают строку SVG.
 * Сцена рисуется в системе координат 360 × 250 (viewBox), стол — полоса y = 232…250.
 * Цвета — только через CSS-переменные (светлая и тёмная тема): классы .gl .liq .ice .met и т. п. в styles.css.
 * Идентификаторы clipPath должны быть уникальны в пределах сцены — передавайте id.
 */
import { tr } from '../i18n.js';
import { esc, clamp } from '../dom.js';

const f1 = (x) => Math.round(x * 10) / 10;

/** Обёртка сцены: <svg viewBox="0 0 360 250"> со столом. */
export function scene(inner, label) {
  return `<svg viewBox="0 0 360 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(tr(label || { ru: 'Лабораторная установка', kk: 'Зертханалық қондырғы', en: 'Laboratory set-up' }))}"><rect class="sv-bench" x="0" y="232" width="360" height="18"/>${inner}</svg>`;
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
  return list.map(([x, y, s, r]) => `<rect class="ice" x="${x}" y="${y}" width="${s}" height="${s}" rx="3" transform="rotate(${r} ${x + s / 2} ${y + s / 2})" opacity="${opacity}"/>`).join('');
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
<g clip-path="url(#${id}-c)"><rect class="liq" x="110" y="${f1(ly)}" width="140" height="${f1(222 - ly)}"${o.color ? ` style="fill:${o.color}"` : ''}/>${sh ? `<path class="sol" d="M${180 - sh * 3.2} 222 Q180 ${222 - 2 * sh} ${180 + sh * 3.2} 222 Z"${o.solidColor ? ` style="fill:${o.solidColor}"` : ''}/>` : ''}${o.inner || ''}</g>
<path class="gl" d="${P}"/><rect class="gl" x="164" y="53" width="32" height="6" rx="2"/></g>${o.label ? text(cx + 70 * s, by - 158 * s, o.label, 'lbl', 'start') : ''}`;
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
<path class="gls" d="M${x} ${y} L${x} ${y + hh - 5} Q${x} ${y + hh} ${x + 5} ${y + hh} L${x + w - 5} ${y + hh} Q${x + w} ${y + hh} ${x + w} ${y + hh - 5} L${x + w} ${y} M${x} ${y} l-6 -5"/>${marks}${o.label ? text(x + w / 2, y - 10, o.label) : ''}`;
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
<g clip-path="url(#${id}-c)">${inner}</g><path class="gls" d="M${cx - r} ${top} L${cx - r} ${bot} A${r} ${r} 0 0 0 ${cx + r} ${bot} L${cx + r} ${top}"/>${o.label ? text(cx, bot + r + 22, o.label, 'lblb') : ''}`;
}

/** Штатив для пробирок. */
export function tubeRack(x1 = 60, x2 = 300) {
  return `<rect class="met" x="${x1}" y="150" width="${x2 - x1}" height="10" rx="2"/><rect class="met" x="${x1}" y="222" width="${x2 - x1}" height="8" rx="2"/><rect class="met" x="${x1 + 2}" y="150" width="6" height="80"/><rect class="met" x="${x2 - 8}" y="150" width="6" height="80"/>`;
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
  return `<g><rect x="${x}" y="${top}" width="7" height="${hh}" rx="3.5" fill="var(--panel)" stroke="var(--glass)" stroke-width="1.2"/>${ticks}<rect class="redc" x="${x + 2.2}" y="${f1(ty)}" width="2.6" height="${f1(top + hh - ty + 2)}"/><circle class="redc" cx="${x + 3.5}" cy="${top + hh + 4}" r="5"/></g>`;
}

/** Стеклянная палочка; stir — анимация перемешивания. */
export function rod(x1 = 172, y1 = 10, x2 = 158, y2 = 216, stir = false) {
  return `<line class="${stir ? 'stir' : ''}" style="transform-origin:${x1}px ${y1}px" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--glass)" stroke-width="3.2" stroke-linecap="round"/>`;
}

/** Капельная пипетка над сосудом; dropKey — номер капли (каждая новая капля перезапускает анимацию). */
export function dropper(x = 177, y = 9, dropKey = 0, dropTo = 120, color = 'var(--liq-y)') {
  return `<g><ellipse cx="${x}" cy="${y}" rx="6.5" ry="8.5" class="metd"/><rect x="${x - 3}" y="${y + 6}" width="6" height="30" class="gl"/><path class="gl" d="M${x - 3} ${y + 36} L${x - 0.6} ${y + 55} L${x + 0.6} ${y + 55} L${x + 3} ${y + 36} Z"/>${dropKey ? `<circle data-key="d${dropKey}" class="drop" cx="${x}" cy="${y + 57}" r="2.4" style="fill:${color};--dy:${dropTo}px"/>` : ''}</g>`;
}

/** Баня (стеклянный кристаллизатор). kind: 'ice' | 'ice-salt' | 'water' | 'empty'. */
export function bath(o = {}) {
  const x = o.x ?? 64, y = o.y ?? 136, w = o.w ?? 232, hh = o.hh ?? 94;
  const front = o.front ?? false;
  if (o.kind === 'none') return '';
  const iceBack = [[x + 10, y + 28, 15, -12], [x + 34, y + 48, 17, 8], [x + w - 56, y + 30, 16, 14], [x + w - 34, y + 52, 15, -6]];
  const iceFront = [[x + 14, y + 70, 16, 10], [x + w - 28, y + 72, 14, -14], [x + 48, y + 74, 13, 6], [x + w - 62, y + 72, 15, -8]];
  if (front) {
    let s = '';
    if (o.kind === 'ice' || o.kind === 'ice-salt') s += ice(iceFront);
    if (o.kind === 'ice-salt') s += [16, 40, 66, w - 70, w - 46, w - 20, 26, w - 34].map((dx, i) => `<circle class="sol" cx="${x + dx}" cy="${y + 16 + (i % 3) * 4}" r="1.7"/>`).join('');
    return s + (o.label ? text(x + 6, y - 5, o.label, 'lbl', 'start') : '');
  }
  return `<rect class="gl" x="${x}" y="${y}" width="${w}" height="${hh}" rx="10"/>${o.kind === 'empty' ? '' : `<rect class="liq" x="${x + 2}" y="${y + 14}" width="${w - 4}" height="${hh - 16}" rx="8" opacity=".5"${o.color ? ` style="fill:${o.color}"` : ''}/>`}${o.kind === 'ice' || o.kind === 'ice-salt' ? ice(iceBack) : ''}`;
}

/** Электроплитка; on — накал. */
export function hotplate(o = {}) {
  const x = o.x ?? 100, y = o.y ?? 198, w = o.w ?? 160;
  return `<rect class="met" x="${x}" y="${y}" width="${w}" height="34" rx="5"/><rect x="${x + 12}" y="${y - 6}" width="${w - 24}" height="7" rx="2" class="metd"/><rect x="${x + 12}" y="${y - 6}" width="${w - 24}" height="7" rx="2" fill="var(--hot)" opacity="${o.on ? 0.55 : 0}"/><circle cx="${x + w - 18}" cy="${y + 17}" r="7" class="metd"/><circle cx="${x + 18}" cy="${y + 17}" r="3.5" fill="var(--hot)" opacity="${o.on ? 1 : 0.15}"/>`;
}

/** Склянка с реактивом. */
export function bottle(x, name, sub, cls) {
  return `<rect class="${cls || 'pnl'}" x="${x}" y="122" width="46" height="98" rx="6"${cls ? ' opacity=".25"' : ''}/>${cls ? `<rect x="${x}" y="122" width="46" height="98" rx="6" fill="none" stroke="var(--muted)"/>` : ''}<rect class="met" x="${x + 12}" y="106" width="22" height="18" rx="2"/><text class="lblb" x="${x + 23}" y="164" text-anchor="middle">${esc(tr(name))}</text>${sub ? `<text class="lbl" x="${x + 23}" y="178" text-anchor="middle">${esc(tr(sub))}</text>` : ''}`;
}

/** Воронка Бюхнера на колбе Бунзена с вакуумным шлангом и насосом. */
export function vacuumFilter(o = {}) {
  const fv = clamp(o.filtrate || 0, 0, 1), cake = clamp(o.cake || 0, 0, 1);
  return `<defs><clipPath id="bf-c"><path d="M152 126 L152 150 L112 222 L230 222 L190 150 L190 126 Z"/></clipPath></defs>
<g clip-path="url(#bf-c)"><rect class="liq" x="110" y="${f1(222 - fv * 70)}" width="122" height="${f1(fv * 70)}"/></g>
<path class="gl" d="M152 124 L152 150 L112 220 Q110 224 116 224 L226 224 Q232 224 230 220 L190 150 L190 124"/>
<path class="gls" d="M190 136 L232 128"/>${o.hose !== false ? `<path d="M232 128 C262 122 270 150 292 160" fill="none" stroke="var(--metal-dark)" stroke-width="5" stroke-linecap="round"/>` : ''}
<rect class="met" x="290" y="150" width="46" height="72" rx="6"/><circle cx="313" cy="168" r="5" fill="var(--good)" opacity="${o.vac ? 1 : 0.2}"/>${text(313, 244, { ru: 'насос', kk: 'сорғы', en: 'pump' })}
${o.seal === false ? '' : '<rect class="metd" x="146" y="112" width="50" height="14" rx="3"/>'}<rect class="porc" x="166" y="92" width="10" height="34"/><path class="porc" d="M124 56 L218 56 L214 94 L128 94 Z"/>
${o.liquid ? `<rect class="liq" x="130" y="74" width="82" height="14"/>` : ''}${cake > 0 ? `<rect class="ppt" x="132" y="${f1(88 - 9 * cake)}" width="78" height="${f1(9 * cake)}" stroke="var(--muted)" stroke-width=".5"${o.cakeColor ? ` style="fill:${o.cakeColor}"` : ''}/>` : ''}
${o.paper ? `<line x1="130" y1="89" x2="212" y2="89" stroke="var(--muted)" stroke-width="2.5"/>` : ''}
${text(171, 48, { ru: 'воронка Бюхнера', kk: 'Бюхнер шұңғымасы', en: 'Büchner funnel' })}${text(171, 244, { ru: 'колба Бунзена', kk: 'Бунзен колбасы', en: 'filter flask' })}`;
}

/** Вытяжной шкаф; air — тяга включена. */
export function hood(o = {}) {
  return `<rect class="met" x="44" y="10" width="272" height="222" rx="8"/><rect x="58" y="34" width="244" height="190" rx="4" fill="var(--scene)"/>
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
<circle class="gls" cx="${cx}" cy="${cy}" r="${r}"/><rect class="gl" x="${cx - 8}" y="${cy - r - 34}" width="16" height="36"/>`;
}

/** Обратный холодильник (вертикальный) над точкой (cx, by). waterIn — 'bottom' | 'top' | null. */
export function condenser(o = {}) {
  const cx = o.cx ?? 180, by = o.by ?? 112, hh = o.hh ?? 96;
  const t = by - hh;
  return `<rect class="gl" x="${cx - 7}" y="${t}" width="14" height="${hh}"/><rect x="${cx - 14}" y="${t + 10}" width="28" height="${hh - 20}" rx="6" fill="${o.water ? 'var(--liquid)' : 'none'}" stroke="var(--glass)" stroke-width="1.6"/>
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
  return `<defs><clipPath id="${id}-c"><path d="${P}"/></clipPath></defs><g clip-path="url(#${id}-c)">${layers}</g><path class="gl" d="${P}"/><rect class="metd" x="${cx - 12}" y="${top + 150}" width="24" height="7" rx="2"/><rect class="gl" x="${cx - 2}" y="${top + 157}" width="4" height="26"/><rect class="metd" x="${cx - 10}" y="${top - 8}" width="20" height="9" rx="3"/>`;
}

/** Лабораторный штатив с лапкой. */
export function stand(x = 60, clampY = 90) {
  return `<rect class="met" x="${x - 30}" y="224" width="80" height="8" rx="2"/><rect class="met" x="${x}" y="20" width="5" height="206"/><rect class="metd" x="${x}" y="${clampY}" width="70" height="5" rx="2"/>`;
}
