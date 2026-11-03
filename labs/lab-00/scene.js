/**
 * SVG-сцены вводного занятия (360 × 250). Цвета — CSS-переменные движка; свои мелкие стили — в STYLE
 * (префикс l00-, вставляется в сцену; анимации отключаются глобальным prefers-reduced-motion движка).
 */
import { L, tr, n } from '../../app/i18n.js';
import { esc, clamp } from '../../app/dom.js';
import { scene, text, beaker, rbFlask, condenser, stand, steam, bubbles, vacuumFilter, sepFunnel, tube, thermometer, conical } from '../../app/scene/svg.js';
import { pHcolor } from '../../app/instruments/indicator.js';
import { EQUIPMENT, equipmentIcon } from '../../app/equipment.js';

const f1 = (x) => Math.round(x * 10) / 10;
const SKIN = '#e6bf9a', RED = '#d23b2f', GREEN = '#1f9d55';

export const STYLE = `<style>
.l00-hs{cursor:pointer;outline:none}.l00-hs rect{fill:transparent;stroke:transparent;stroke-width:2;rx:7}
.l00-hs:hover rect,.l00-hs:focus-visible rect{stroke:var(--accent);stroke-dasharray:4 3}
.l00-hs.found rect{stroke:var(--good);stroke-dasharray:none;fill:var(--good-soft);fill-opacity:.35}
.l00-hs.miss rect{stroke:var(--muted);stroke-dasharray:2 3}
.l00-tag{fill:var(--good)}.l00-tagt{font:700 9px var(--f-body);fill:#fff}
.l00-sign{font:700 7px var(--f-body);fill:#fff;letter-spacing:.02em}
.l00-flame{transform-box:fill-box;transform-origin:50% 100%;animation:l00fl .5s ease-in-out infinite alternate}
.l00-flame.b{animation-duration:.37s}
@keyframes l00fl{from{transform:scaleY(.86) scaleX(1.04)}to{transform:scaleY(1.1) scaleX(.94)}}
.l00-spark{animation:l00sp .8s steps(2) infinite}@keyframes l00sp{50%{opacity:0}}
.l00-jet{stroke:var(--liquid);stroke-width:2.2;fill:none;stroke-linecap:round;stroke-dasharray:3 4;animation:l00jet .6s linear infinite}
@keyframes l00jet{to{stroke-dashoffset:-14}}
</style>`;

/* ------------------------------------------------------------------ люди */
/**
 * Человек за столом (видна верхняя часть). o: { hair:'tied'|'loose'|'short', gog, coat:'cotton'|'synth'|'none', mouthPipette }
 */
export function person(cx, o = {}) {
  const hy = o.hy ?? 82;
  let s = '';
  const coat = o.coat === 'none' ? 'fill="#7a8fb3"' : o.coat === 'synth' ? 'fill="#9fc3e6" stroke="#5b7fa8" stroke-width="1"' : 'fill="var(--panel)" stroke="var(--muted)" stroke-width="1"';
  s += `<path ${coat} d="M${cx - 17} 152 L${cx - 15} ${hy + 18} Q${cx} ${hy + 10} ${cx + 15} ${hy + 18} L${cx + 17} 152 Z"/>`;
  if (o.coat !== 'none') s += `<path d="M${cx} ${hy + 14} L${cx} 150" stroke="var(--muted)" stroke-width=".8"/><path d="M${cx - 6} ${hy + 13} L${cx} ${hy + 22} L${cx + 6} ${hy + 13}" fill="none" stroke="var(--muted)" stroke-width=".9"/>`;
  if (o.hair === 'loose') s += `<path fill="var(--ink)" opacity=".85" d="M${cx - 10} ${hy - 4} Q${cx - 14} ${hy + 22} ${cx - 8} ${hy + 46} Q${cx - 4} ${hy + 52} ${cx - 2} ${hy + 40} L${cx - 4} ${hy + 6} Z M${cx + 10} ${hy - 4} Q${cx + 16} ${hy + 26} ${cx + 12} ${hy + 50} Q${cx + 8} ${hy + 56} ${cx + 5} ${hy + 44} L${cx + 4} ${hy + 6} Z"/>`;
  s += `<circle cx="${cx}" cy="${hy}" r="9.5" fill="${SKIN}"/>`;
  if (o.hair === 'tied') s += `<path fill="var(--ink)" opacity=".85" d="M${cx - 10} ${hy - 1} Q${cx} ${hy - 16} ${cx + 10} ${hy - 1} Q${cx} ${hy - 7} ${cx - 10} ${hy - 1} Z"/><circle cx="${cx}" cy="${hy - 12}" r="4" fill="var(--ink)" opacity=".85"/>`;
  else s += `<path fill="var(--ink)" opacity=".85" d="M${cx - 10} ${hy - 1} Q${cx} ${hy - 16} ${cx + 10} ${hy - 1} Q${cx} ${hy - 6} ${cx - 10} ${hy - 1} Z"/>`;
  if (o.gog) s += `<rect x="${cx - 9}" y="${hy - 3}" width="18" height="6" rx="3" fill="rgba(120,190,230,.55)" stroke="var(--metal-dark)" stroke-width=".8"/>`;
  else s += `<circle cx="${cx - 3.5}" cy="${hy}" r=".9" fill="var(--ink)"/><circle cx="${cx + 3.5}" cy="${hy}" r=".9" fill="var(--ink)"/>`;
  if (o.mouthPipette) s += `<line x1="${cx + 1}" y1="${hy + 6}" x2="${cx + 12}" y2="${hy + 54}" stroke="var(--glass)" stroke-width="2.4" stroke-linecap="round"/>`;
  return s;
}

/* ------------------------------------------------------------------ лаборатория */
function exitDoor() {
  return `<rect class="pnl" x="6" y="44" width="38" height="186" rx="2"/><circle cx="38" cy="140" r="2.4" class="metd"/><rect x="5" y="28" width="40" height="13" rx="2" fill="${GREEN}"/>${text(25, 37.5, L('ВЫХОД', 'ШЫҒУ', 'EXIT'), 'l00-sign')}`;
}
function shower() {
  return `<line x1="64" y1="0" x2="64" y2="22" stroke="var(--metal-dark)" stroke-width="3"/><path class="met" d="M52 22 L76 22 L71 30 L57 30 Z"/><line x1="72" y1="26" x2="72" y2="54" stroke="var(--metal-dark)" stroke-width="1.4"/><path d="M68 54 L76 54 L72 60 Z" fill="${GREEN}"/>`;
}
function eyewash() {
  return `<rect x="82" y="22" width="26" height="12" rx="2" fill="${GREEN}"/><ellipse cx="95" cy="28" rx="6" ry="3.4" fill="none" stroke="#fff" stroke-width="1.2"/><circle cx="95" cy="28" r="1.6" fill="#fff"/><path class="met" d="M82 44 L108 44 L104 54 L86 54 Z"/><rect class="metd" x="88" y="38" width="3" height="7"/><rect class="metd" x="99" y="38" width="3" height="7"/><rect class="metd" x="93" y="54" width="4" height="5"/>`;
}
function extinguisher() {
  return `<rect x="116" y="10" width="18" height="4" class="metd"/><rect x="118" y="16" width="14" height="40" rx="5" fill="${RED}"/><rect x="121" y="10" width="8" height="8" class="metd"/><path d="M129 13 Q140 16 136 30" fill="none" stroke="var(--ink)" stroke-width="1.6"/>`;
}
function blanket() {
  return `<rect x="141" y="12" width="30" height="34" rx="2" fill="${RED}"/><rect x="147" y="38" width="18" height="5" rx="1" fill="#fff" opacity=".85"/>${text(156, 30, L('ОДЕЯЛО', 'ЖАМЫЛҒЫ', 'BLANKET'), 'l00-sign', 'middle', ' style="font-size:5.2px"')}`;
}
function firstAid() {
  return `<rect class="pnl" x="176" y="12" width="28" height="22" rx="3"/><rect x="187.5" y="15" width="5" height="16" fill="${GREEN}"/><rect x="182" y="20.5" width="16" height="5" fill="${GREEN}"/>`;
}
function sandBox() {
  return `<rect x="6" y="204" width="38" height="26" rx="2" fill="#c9a96a" stroke="var(--muted)"/><rect x="6" y="204" width="38" height="5" fill="#a4864d"/>${text(25, 222, L('ПЕСОК', 'ҚҰМ', 'SAND'), 'l00-sign')}`;
}
function hoodBox(o = {}) {
  return `<rect class="met" x="284" y="8" width="72" height="144" rx="5"/><rect x="290" y="24" width="60" height="124" rx="3" fill="var(--scene)"/><rect class="gl" x="290" y="24" width="60" height="60" rx="2"/><rect class="metd" x="290" y="82" width="60" height="4"/>`
    + `<path class="gl" d="M316 118 L316 128 L306 146 L334 146 L324 128 L324 118 Z"/><circle cx="346" cy="16" r="3.5" fill="var(--good)"/>`
    + (o.air !== false ? [302, 320, 338].map((x, i) => `<path class="airp" style="animation-delay:${i * 0.4}s" d="M${x} 112 l0 -18 m-4 5 l4 -5 l4 5" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round"/>`).join('') : '');
}
function wasteCans() {
  const c = [['#3b82c4', 'H₂O'], ['#d9a33a', 'Org'], ['#2f9e6e', 'Hal']];
  return c.map(([col, lb], i) => `<rect x="${292 + i * 21}" y="182" width="18" height="42" rx="3" fill="var(--panel)" stroke="var(--muted)"/><rect x="${292 + i * 21}" y="182" width="18" height="7" rx="2" fill="${col}"/><text class="lbl" x="${301 + i * 21}" y="208" text-anchor="middle" style="font-size:6.5px">${lb}</text>`).join('');
}
function counter() {
  return `<rect x="48" y="150" width="236" height="82" fill="var(--bench)"/><rect class="metd" x="48" y="150" width="308" height="4"/><rect x="284" y="152" width="72" height="80" fill="var(--bench)"/><line x1="166" y1="160" x2="166" y2="230" stroke="var(--line)"/><line x1="284" y1="160" x2="284" y2="230" stroke="var(--line)"/>`;
}

/** Лаборатория: people — показать студентов и нарушения (этап «глазами инспектора»). */
export function labRoom(o = {}) {
  let s = STYLE + exitDoor() + shower() + eyewash() + extinguisher() + blanket() + firstAid() + hoodBox() + counter() + sandBox() + wasteCans();
  if (o.people) {
    // рюкзак и книги на столе (п. 2.7)
    s += `<rect x="58" y="116" width="22" height="34" rx="6" fill="#5a6fa8"/><rect x="61" y="124" width="16" height="10" rx="3" fill="#4a5c90"/><path d="M62 116 Q69 104 76 116" fill="none" stroke="#4a5c90" stroke-width="2.4"/>`
      + `<rect x="80" y="142" width="16" height="8" fill="#b9573f"/><rect x="81" y="135" width="14" height="7" fill="#3f7f6a"/><rect x="80" y="129" width="15" height="6" fill="#c9a24a"/>`;
    // студентка с распущенными волосами у плитки (п. 2.3)
    s += person(122, { hair: 'loose', gog: true });
    s += `<rect class="met" x="104" y="142" width="38" height="8" rx="2"/><rect x="106" y="140" width="34" height="3" fill="var(--hot)" opacity=".6"/>` + beaker({ id: 'l0b1', x: 112, y: 120, w: 22, hh: 20, frac: 0.6 }) + steam(123, 116, true);
    // набор пипеткой ртом (п. 2.5)
    s += person(168, { hair: 'short', gog: true, mouthPipette: true }) + beaker({ id: 'l0b2', x: 172, y: 130, w: 18, hh: 20, frac: 0.5, color: 'rgba(236,212,110,.6)' });
    // еда и напитки (п. 2.2)
    s += `<rect x="198" y="134" width="13" height="16" rx="2" fill="#c0504d"/><path d="M211 138 q6 0 6 5 q0 5 -6 5" fill="none" stroke="#c0504d" stroke-width="2"/>` + steam(204, 130, true)
      + `<path d="M213 150 L215 141 Q221 137 227 141 L229 150 Z" fill="#d8b36a"/><rect x="214" y="143" width="14" height="3" fill="#7fb069"/>`;
    // нагрев без присмотра (п. 2.1, 7.2)
    s += `<path class="metd" d="M236 150 L238 134 Q252 128 266 134 L268 150 Z"/><circle cx="262" cy="146" r="1.8" fill="var(--hot)"/>` + rbFlask({ id: 'l0rb', cx: 252, cy: 128, r: 12, frac: 0.45, boiling: true })
      + condenser({ cx: 252, by: 92, hh: 36, water: true }) + `<rect class="met" x="276" y="50" width="4" height="100"/><rect class="metd" x="256" y="80" width="22" height="3"/>`;
  } else {
    s += beaker({ id: 'l0b3', x: 120, y: 128, w: 24, hh: 22, frac: 0.3 }) + `<rect class="pnl" x="196" y="136" width="30" height="14" rx="2"/>`;
  }
  return s;
}

/** Метка найденного объекта. */
export function tag(x, y, label) {
  const w = Math.max(30, String(tr(label)).length * 5 + 10);
  return `<g><rect class="l00-tag" x="${f1(x - w / 2)}" y="${f1(y - 8)}" width="${f1(w)}" height="13" rx="6"/><text class="l00-tagt" x="${x}" y="${y + 2}" text-anchor="middle">${esc(tr(label))}</text></g>`;
}

/* ------------------------------------------------------------------ СИЗ: фигура студента */
/**
 * w: { coat:'cotton'|'synth'|'none', buttoned, eyes:'goggles'|'lenses'|'glasses'|'none', gloves:'nitrile'|'cloth'|'none',
 *      shoes:'closed'|'sandals'|'heels', hair:'tied'|'loose', scarf:true|false }
 * bad: { group: true } — отметить красным
 */
export function avatar(w = {}, bad = {}) {
  const cx = 180;
  let s = STYLE;
  // ноги и обувь
  s += `<rect x="${cx - 16}" y="150" width="12" height="70" rx="4" fill="#4b5563"/><rect x="${cx + 4}" y="150" width="12" height="70" rx="4" fill="#4b5563"/>`;
  if (w.shoes === 'sandals') s += `<rect x="${cx - 19}" y="226" width="17" height="4" rx="2" fill="#8b5a2b"/><rect x="${cx + 2}" y="226" width="17" height="4" rx="2" fill="#8b5a2b"/><rect x="${cx - 16}" y="218" width="12" height="9" fill="${SKIN}"/><rect x="${cx + 4}" y="218" width="12" height="9" fill="${SKIN}"/><line x1="${cx - 16}" y1="222" x2="${cx - 4}" y2="222" stroke="#8b5a2b" stroke-width="2"/><line x1="${cx + 4}" y1="222" x2="${cx + 16}" y2="222" stroke="#8b5a2b" stroke-width="2"/>`;
  else if (w.shoes === 'heels') s += `<path d="M${cx - 18} 230 L${cx - 18} 220 L${cx - 3} 224 L${cx - 3} 230 Z" fill="#7c2d3a"/><rect x="${cx - 19}" y="224" width="3" height="8" fill="#7c2d3a"/><path d="M${cx + 3} 230 L${cx + 3} 224 L${cx + 18} 220 L${cx + 18} 230 Z" fill="#7c2d3a"/><rect x="${cx + 16}" y="224" width="3" height="8" fill="#7c2d3a"/>`;
  else if (w.shoes === 'closed') s += `<path d="M${cx - 21} 231 Q${cx - 21} 219 ${cx - 10} 218 L${cx - 3} 218 L${cx - 3} 231 Z" fill="#2f3640"/><path d="M${cx + 3} 231 L${cx + 3} 218 L${cx + 10} 218 Q${cx + 21} 219 ${cx + 21} 231 Z" fill="#2f3640"/>`;
  else s += `<rect x="${cx - 17}" y="219" width="14" height="10" rx="3" fill="${SKIN}"/><rect x="${cx + 3}" y="219" width="14" height="10" rx="3" fill="${SKIN}"/>`;
  // одежда под халатом
  s += `<path d="M${cx - 26} 70 Q${cx} 60 ${cx + 26} 70 L${cx + 24} 156 L${cx - 24} 156 Z" fill="#7a8fb3"/>`;
  // руки
  const hand = (x) => (w.gloves === 'nitrile' ? `<rect x="${x - 6}" y="148" width="12" height="18" rx="5" fill="#5b8def"/>` : w.gloves === 'cloth' ? `<rect x="${x - 6}" y="148" width="12" height="18" rx="5" fill="#ece6d6" stroke="var(--muted)" stroke-width=".8"/>` : `<rect x="${x - 5}" y="150" width="10" height="15" rx="5" fill="${SKIN}"/>`);
  // халат
  if (w.coat && w.coat !== 'none') {
    const fill = w.coat === 'synth' ? 'fill="#a8cdee" stroke="#4f7cac"' : 'fill="var(--panel)" stroke="var(--muted)"';
    s += `<path ${fill} stroke-width="1.2" d="M${cx - 30} 70 Q${cx} 58 ${cx + 30} 70 L${cx + 33} 196 L${cx - 33} 196 Z"/>`;
    if (w.coat === 'synth') s += `<path d="M${cx - 22} 90 L${cx - 10} 170 M${cx + 18} 86 L${cx + 8} 160" stroke="#fff" stroke-width="2" opacity=".55"/>`;
    if (w.buttoned) s += `<line x1="${cx}" y1="72" x2="${cx}" y2="196" stroke="var(--muted)" stroke-width="1"/>${[90, 112, 134, 156, 178].map((y) => `<circle cx="${cx + 3}" cy="${y}" r="1.8" fill="var(--muted)"/>`).join('')}`;
    else s += `<path d="M${cx - 4} 70 L${cx - 12} 196 L${cx + 12} 196 L${cx + 4} 70 Z" fill="#7a8fb3"/>`;
    s += `<path d="M${cx - 14} 66 L${cx} 86 L${cx + 14} 66" fill="none" stroke="var(--muted)" stroke-width="1.2"/><rect x="${cx - 26}" y="130" width="13" height="10" rx="1" fill="none" stroke="var(--muted)" stroke-width=".8"/>`;
    s += `<path ${fill} stroke-width="1.2" d="M${cx - 30} 72 L${cx - 44} 146 L${cx - 32} 150 L${cx - 22} 90 Z M${cx + 30} 72 L${cx + 44} 146 L${cx + 32} 150 L${cx + 22} 90 Z"/>`;
  } else {
    s += `<path fill="#7a8fb3" d="M${cx - 26} 72 L${cx - 40} 146 L${cx - 30} 150 L${cx - 20} 92 Z M${cx + 26} 72 L${cx + 40} 146 L${cx + 30} 150 L${cx + 20} 92 Z"/>`;
  }
  s += hand(cx - 38) + hand(cx + 38);
  // шарф
  if (w.scarf) s += `<path d="M${cx - 14} 62 Q${cx} 74 ${cx + 14} 62 L${cx + 12} 70 Q${cx} 80 ${cx - 12} 70 Z" fill="#e0457b"/><path d="M${cx + 6} 72 L${cx + 2} 128 L${cx + 12} 128 L${cx + 13} 72 Z" fill="#e0457b"/>`;
  // голова, волосы
  const hy = 38;
  if (w.hair === 'loose') s += `<path fill="#3b2a20" d="M${cx - 18} ${hy - 4} Q${cx - 26} ${hy + 40} ${cx - 16} ${hy + 72} L${cx - 6} ${hy + 60} L${cx - 9} ${hy + 6} Z M${cx + 18} ${hy - 4} Q${cx + 28} ${hy + 44} ${cx + 18} ${hy + 76} L${cx + 7} ${hy + 62} L${cx + 9} ${hy + 6} Z"/>`;
  s += `<rect x="${cx - 6}" y="${hy + 14}" width="12" height="10" fill="${SKIN}"/><circle cx="${cx}" cy="${hy}" r="18" fill="${SKIN}"/>`;
  s += `<path fill="#3b2a20" d="M${cx - 19} ${hy - 2} Q${cx} ${hy - 30} ${cx + 19} ${hy - 2} Q${cx + 4} ${hy - 12} ${cx - 19} ${hy - 2} Z"/>`;
  if (w.hair === 'tied') s += `<circle cx="${cx}" cy="${hy - 22}" r="7" fill="#3b2a20"/>`;
  // глаза и защита
  if (w.eyes === 'goggles') s += `<rect x="${cx - 17}" y="${hy - 6}" width="34" height="12" rx="6" fill="rgba(120,190,230,.55)" stroke="var(--metal-dark)" stroke-width="1.2"/><line x1="${cx - 17}" y1="${hy}" x2="${cx - 20}" y2="${hy}" stroke="var(--metal-dark)" stroke-width="2"/><line x1="${cx + 17}" y1="${hy}" x2="${cx + 20}" y2="${hy}" stroke="var(--metal-dark)" stroke-width="2"/>`;
  else if (w.eyes === 'glasses') s += `<circle cx="${cx - 7}" cy="${hy}" r="5" fill="none" stroke="var(--ink)" stroke-width="1.2"/><circle cx="${cx + 7}" cy="${hy}" r="5" fill="none" stroke="var(--ink)" stroke-width="1.2"/><line x1="${cx - 2}" y1="${hy}" x2="${cx + 2}" y2="${hy}" stroke="var(--ink)"/>`;
  s += `<circle cx="${cx - 7}" cy="${hy}" r="1.5" fill="var(--ink)"/><circle cx="${cx + 7}" cy="${hy}" r="1.5" fill="var(--ink)"/><path d="M${cx - 5} ${hy + 9} Q${cx} ${hy + 12} ${cx + 5} ${hy + 9}" fill="none" stroke="var(--ink)" stroke-width="1.1"/>`;
  if (w.eyes === 'lenses') s += `<circle cx="${cx - 7}" cy="${hy}" r="3.2" fill="none" stroke="#5aa9e6" stroke-width=".9"/><circle cx="${cx + 7}" cy="${hy}" r="3.2" fill="none" stroke="#5aa9e6" stroke-width=".9"/>`;
  // отметки ошибок
  const mark = (x, y) => `<g><circle cx="${x}" cy="${y}" r="7" fill="var(--bad)"/><text x="${x}" y="${y + 3.5}" text-anchor="middle" style="font:700 10px var(--f-body);fill:#fff">!</text></g>`;
  const pos = { coat: [cx + 46, 110], eyes: [cx + 30, hy], gloves: [cx - 54, 158], shoes: [cx + 30, 226], hair: [cx - 30, hy - 14], scarf: [cx - 30, 76] };
  for (const k in bad) if (bad[k] && pos[k]) s += mark(...pos[k]);
  return s;
}

/* ------------------------------------------------------------------ огонь, пролив */
export function flames(cx, by, wdt = 26, hh = 34) {
  return `<g><path class="l00-flame" fill="#f59e0b" opacity=".9" d="M${cx - wdt / 2} ${by} Q${cx - wdt / 2} ${by - hh * 0.6} ${cx} ${by - hh} Q${cx + wdt / 2} ${by - hh * 0.55} ${cx + wdt / 2} ${by} Z"/><path class="l00-flame b" fill="#ef4444" opacity=".85" d="M${cx - wdt / 3} ${by} Q${cx - wdt / 4} ${by - hh * 0.5} ${cx + 2} ${by - hh * 0.72} Q${cx + wdt / 3} ${by - hh * 0.4} ${cx + wdt / 3} ${by} Z"/><path class="l00-flame" fill="#fde68a" d="M${cx - 5} ${by} Q${cx - 3} ${by - hh * 0.3} ${cx + 1} ${by - hh * 0.42} Q${cx + 5} ${by - hh * 0.25} ${cx + 5} ${by} Z"/></g>`;
}

/** Горящий растворитель в стакане; out — потушен (накрыт часовым стеклом). */
export function fireScene(S = {}) {
  let s = STYLE + `<rect x="40" y="200" width="280" height="32" fill="var(--bench)"/>`;
  s += beaker({ id: 'l0fb', x: 150, y: 140, w: 60, hh: 60, frac: 0.35 });
  if (S.out) s += `<path class="gl" d="M140 138 Q180 128 220 138 Q180 133 140 138 Z"/>` + `<g opacity=".5">${steam(180, 120, true)}</g>`;
  else if (S.spread) s += flames(180, 140, 54, 60) + flames(110, 200, 40, 36) + flames(250, 200, 44, 40) + `<ellipse cx="180" cy="203" rx="90" ry="5" fill="var(--liq-y)"/>`;
  else s += flames(180, 140, 46, 52);
  s += `<path class="gl" d="M250 196 Q272 188 294 196 Q272 192 250 196 Z"/>` + text(272, 186, L('часовое стекло', 'сағат шынысы', 'watch glass'));
  s += `<rect x="54" y="160" width="40" height="38" rx="3" fill="${RED}"/>` + text(74, 182, L('ОДЕЯЛО', 'ЖАМЫЛҒЫ', 'BLANKET'), 'l00-sign');
  s += text(180, 226, S.label || L('горящий растворитель в стакане', 'стақандағы жанып жатқан еріткіш', 'burning solvent in a beaker'));
  return scene(s);
}

/** Пролив на столе: kind 'acid' | 'alkali'; agent — чем засыпали; fizz — шипение. */
export function spillScene(S = {}) {
  let s = STYLE + `<rect x="20" y="180" width="320" height="52" fill="var(--bench)"/>`;
  s += `<g transform="rotate(-78 250 176)"><rect class="pnl" x="226" y="128" width="40" height="70" rx="6"/><rect class="met" x="236" y="116" width="20" height="14" rx="2"/>${text(246, 170, S.kind === 'alkali' ? 'NaOH' : S.kind === 'solvent' ? L('ацетон', 'ацетон', 'acetone') : 'H₂SO₄', 'lblb')}</g>`;
  if (!S.clean) s += `<path d="M90 190 Q120 178 170 184 Q220 180 238 190 Q232 200 190 198 Q140 204 100 198 Q82 196 90 190 Z" fill="${S.kind === 'alkali' ? 'rgba(160,198,222,.7)' : 'rgba(236,212,110,.55)'}" stroke="var(--glass)" stroke-width=".8"/>`;
  if (S.agent === 'soda') s += [110, 128, 146, 164, 182, 200, 218].map((x, i) => `<circle cx="${x}" cy="${189 + (i % 3) * 3}" r="2.3" class="sol"/>`).join('');
  if (S.fizz) s += bubbles(100, 188, 130, 9, true);
  if (S.burn) s += `<path d="M150 160 l6 -10 l6 10 z" fill="var(--bad)"/>` + text(156, 176, L('бумага обуглилась', 'қағаз көмірленді', 'paper charred'), 'lbl');
  s += text(160, 222, S.kind === 'alkali' ? L('пролита щёлочь (10 % NaOH)', 'сілті төгілді (10 % NaOH)', 'alkali spill (10 % NaOH)') : S.kind === 'solvent' ? L('пролит растворитель', 'еріткіш төгілді', 'solvent spill') : L('пролита серная кислота', 'күкірт қышқылы төгілді', 'sulfuric acid spill'));
  return scene(s);
}

/** Ёмкости для отходов (п. 10.1) и бой стекла (п. 9.3). */
export function wasteScene() {
  const C = [['#d9a33a', L('органика', 'органика', 'organic')], ['#2f9e6e', L('галоген', 'галоген', 'halogen')], ['#3b82c4', L('водные', 'сулы', 'aqueous')], ['#8a6d3b', L('твёрдые', 'қатты', 'solid')], ['#b0413e', L('стекло', 'шыны', 'glass')]];
  let s = STYLE + `<rect x="10" y="196" width="340" height="36" fill="var(--bench)"/>`;
  C.forEach(([col, lb], i) => { const x = 24 + i * 66; s += `<rect x="${x}" y="110" width="50" height="86" rx="6" fill="var(--panel)" stroke="var(--muted)"/><rect x="${x}" y="110" width="50" height="14" rx="5" fill="${col}"/>` + text(x + 25, 162, lb, 'lblb'); });
  return scene(s, L('Промаркированные ёмкости для отходов', 'Таңбаланған қалдық ыдыстары', 'Labelled waste containers'));
}

/* ------------------------------------------------------------------ разбавление кислоты */
export function dilutionScene(S) {
  const D = S.dil || {};
  const vol = (D.water || 0) + (D.acid || 0);
  let s = STYLE + beaker({ id: 'l0dil', x: 110, y: 90, w: 110, hh: 130, frac: vol / 150, color: D.acidFirst && !D.water ? 'rgba(236,212,110,.5)' : null, marks: [50, 100] , cap: 150 });
  s += thermometer({ x: 196, top: 30, hh: 186, T: D.T ?? 22, min: 0, max: 100, step: 10, major: 20 });
  s += `<g transform="translate(250 0)"><rect class="pnl" x="10" y="120" width="44" height="100" rx="6"/><rect class="met" x="22" y="104" width="20" height="18" rx="2"/>${text(32, 168, 'H₂SO₄', 'lblb')}${text(32, 182, '96 %', 'lbl')}</g>`;
  if (D.pour) s += `<path d="M250 110 Q230 96 206 104" fill="none" stroke="rgba(236,212,110,.85)" stroke-width="2.4"/>`;
  if (D.spatter) s += [[120, 74], [140, 66], [206, 70], [96, 84], [226, 82]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="var(--liq-y)" stroke="var(--glass)" stroke-width=".5"/>`).join('') + steam(165, 84, true);
  if (D.stir) s += `<line class="stir" style="transform-origin:150px 20px" x1="150" y1="20" x2="140" y2="210" stroke="var(--glass)" stroke-width="3.2" stroke-linecap="round"/>`;
  s += text(165, 244, L(`воды ${n(D.water || 0, 0)} мл · кислоты ${n(D.acid || 0, 0)} мл`, `су ${n(D.water || 0, 0)} мл · қышқыл ${n(D.acid || 0, 0)} мл`, `water ${n(D.water || 0, 0)} mL · acid ${n(D.acid || 0, 0)} mL`));
  return scene(s);
}

/* ------------------------------------------------------------------ нагрев в колбонагревателе */
/** H: { T, power, chips, water, on, bump, vapour, spark } */
export function refluxScene(H = {}) {
  let s = STYLE + stand(70, 112) + `<rect class="metd" x="70" y="58" width="96" height="4" rx="2"/>`;
  s += `<path class="metd" d="M140 222 L144 182 Q180 168 216 182 L220 222 Z"/><circle cx="206" cy="212" r="3.5" fill="${H.on ? 'var(--hot)' : 'var(--metal)'}"/>`;
  s += `<path d="M140 222 Q120 228 100 226 L60 230" fill="none" stroke="var(--ink)" stroke-width="2"/>`;
  if (H.spark) s += `<g class="l00-spark"><path d="M96 220 l6 -6 l-2 6 l6 -4" fill="none" stroke="#f59e0b" stroke-width="2"/></g>`;
  s += rbFlask({ id: 'l0rf', cx: 180, cy: 176, r: 30, frac: 0.42, boiling: H.T >= 77.5 && !H.bump, chips: H.chips });
  s += condenser({ cx: 180, by: 140, hh: 104, water: H.water, waterIn: H.waterIn || 'bottom' });
  if (H.water) s += `<path class="l00-jet" d="M210 ${H.waterIn === 'top' ? 52 : 124} L232 ${H.waterIn === 'top' ? 52 : 124}"/>`;
  if (H.vapour) s += steam(180, 32, true) + `<g opacity=".35">${steam(172, 26, true)}</g>`;
  if (H.bump) s += `<path d="M168 150 Q180 112 192 150" fill="var(--liquid)" opacity=".8"/>`;
  if (H.closed) s += `<rect class="metd" x="171" y="28" width="18" height="10" rx="2"/>`;
  if (H.flame) s += flames(180, 222, 56, 40);
  s += thermometer({ x: 300, top: 40, hh: 170, T: H.T ?? 22, min: 0, max: 100, step: 10, major: 20 });
  s += text(304, 236, `${n(H.T ?? 22, 0)} °C`, 'lblb');
  return scene(s);
}

/* ------------------------------------------------------------------ нейтрализация отходов */
export function neutralScene(S) {
  const N = S.neu || {};
  let s = STYLE + beaker({ id: 'l0neu', x: 110, y: 100, w: 120, hh: 120, frac: (N.V || 50) / 150, marks: [50, 100], cap: 150, color: 'rgba(160,198,222,.55)' });
  if (N.fizz > 0) s += bubbles(118, 214, 104, Math.min(10, 3 + Math.round(N.fizz)), true);
  if (N.strip != null) s += `<rect x="262" y="70" width="14" height="70" rx="2" fill="var(--panel)" stroke="var(--muted)"/><rect x="262" y="110" width="14" height="30" rx="2" style="fill:${pHcolor(N.strip)}"/>` + text(269, 156, `pH ≈ ${Math.round(N.strip)}`, 'lblb');
  s += `<g transform="translate(14 0)"><rect class="pnl" x="10" y="150" width="56" height="70" rx="6"/><rect class="met" x="26" y="138" width="24" height="14" rx="2"/>${text(38, 186, 'NaHCO₃', 'lblb')}</g>`;
  return scene(s);
}

/* ------------------------------------------------------------------ промывание глаз */
export function eyewashScene(S) {
  const E = S.eye || {};
  let s = STYLE + `<path class="met" d="M90 170 L270 170 L254 214 L106 214 Z"/><rect class="metd" x="174" y="214" width="12" height="18"/>`;
  s += `<rect class="metd" x="146" y="150" width="8" height="20"/><rect class="metd" x="206" y="150" width="8" height="20"/>`;
  if (E.on) s += `<path class="l00-jet" d="M150 150 Q150 110 168 96"/><path class="l00-jet" d="M210 150 Q210 110 192 96"/>`;
  s += `<circle cx="180" cy="80" r="26" fill="${SKIN}"/><path fill="#3b2a20" d="M154 74 Q180 40 206 74 Q180 60 154 74 Z"/>`;
  s += E.open ? `<ellipse cx="170" cy="84" rx="5" ry="3.5" fill="#fff" stroke="var(--ink)" stroke-width=".8"/><circle cx="170" cy="84" r="1.8" fill="var(--ink)"/><path d="M163 79 Q170 72 177 79" fill="none" stroke="var(--ink)"/>` : `<path d="M165 84 Q170 87 175 84" fill="none" stroke="var(--ink)" stroke-width="1.2"/>`;
  s += `<path d="M186 84 Q191 87 196 84" fill="none" stroke="var(--ink)" stroke-width="1.2"/>`;
  s += `<rect x="114" y="18" width="132" height="22" rx="5" class="pnl"/>` + text(180, 33, L(`промывание: ${n((E.t || 0) / 60, 1)} мин`, `жуу: ${n((E.t || 0) / 60, 1)} мин`, `rinsing: ${n((E.t || 0) / 60, 1)} min`), 'lblb');
  return scene(s);
}

/* ------------------------------------------------------------------ установки (основы для assemble) */
export function refluxBase() {
  return STYLE + stand(70, 120) + `<rect class="metd" x="70" y="60" width="90" height="4" rx="2"/>` + `<circle class="gls" cx="180" cy="176" r="28" stroke-dasharray="4 4"/><rect class="gls" x="168" y="36" width="24" height="104" stroke-dasharray="4 4"/>` + `<path class="metd" d="M146 230 L150 196 Q180 186 210 196 L214 230 Z" opacity=".25"/>`;
}
export function distillBase() {
  return STYLE + stand(46, 110) + `<circle class="gls" cx="96" cy="170" r="26" stroke-dasharray="4 4"/><path class="gls" d="M118 128 L250 168" stroke-dasharray="4 4"/><path class="gls" d="M288 160 L272 222 L330 222 L314 160" stroke-dasharray="4 4"/>`;
}
export function vacuumBase() {
  return STYLE + vacuumFilter({ filtrate: 0, seal: true, paper: false, hose: true, vac: false });
}

/* ------------------------------------------------------------------ фильтрование под вакуумом (процесс) */
export function vacuumScene(S) {
  const V = S.vf || {};
  let s = STYLE + vacuumFilter({ filtrate: V.filtrate || 0, cake: V.cake || 0, seal: V.seal !== false, paper: true, vac: V.vac, liquid: V.liquid });
  if (V.thin) s += text(171, 238, L('тонкостенная коническая колба!', 'жұқа қабырғалы конустық колба!', 'thin-walled conical flask!'), 'lblb');
  if (V.back) s += `<path class="l00-jet" d="M290 160 C270 150 262 122 232 128"/>`;
  return scene(s);
}

/* ------------------------------------------------------------------ делительная воронка */
export function funnelScene(S = {}) {
  return scene(STYLE + stand(90, 54) + `<circle cx="180" cy="62" r="34" fill="none" stroke="var(--metal-dark)" stroke-width="3"/>` + sepFunnel({ cx: 180, top: 36, layers: [{ frac: 0.35, color: 'var(--liquid)' }, { frac: 0.3, color: 'var(--liq-y)' }] }) + beaker({ id: 'l0sf', x: 150, y: 196, w: 60, hh: 34, frac: 0.1 }));
}

/* ------------------------------------------------------------------ каталог */
export function iconScene(id, caption) {
  const icon = equipmentIcon(id).replace('<svg ', '<svg x="110" y="34" width="140" height="140" ');
  return scene(STYLE + `<rect x="96" y="22" width="168" height="164" rx="14" fill="var(--panel)" stroke="var(--line)"/>` + icon + (caption ? text(180, 214, caption, 'lblb') : ''));
}
export function useScene(use) {
  const words = String(tr(use)).split(' ');
  const lines = [''];
  for (const w of words) { if ((lines[lines.length - 1] + ' ' + w).length > 34) lines.push(w); else lines[lines.length - 1] += (lines[lines.length - 1] ? ' ' : '') + w; }
  return scene(STYLE + `<rect x="40" y="40" width="280" height="${30 + lines.length * 18}" rx="12" fill="var(--panel)" stroke="var(--line)"/>` + `<text class="lbl" x="180" y="30" text-anchor="middle">${esc(tr(L('Назначение прибора', 'Құралдың мақсаты', 'What it is for')))}</text>` + lines.map((l, i) => `<text class="lblb" x="180" y="${66 + i * 18}" text-anchor="middle" style="font-size:12px">${esc(l)}</text>`).join(''));
}

/** Простой стол с предметами: items — строки SVG. */
export function bench(inner, label) {
  return scene(STYLE + `<rect x="20" y="196" width="320" height="36" fill="var(--bench)"/>` + inner + (label ? text(180, 246, label) : ''), label);
}
export { beaker, tube, conical, thermometer, rbFlask, condenser, stand, steam, bubbles, text, scene, EQUIPMENT };

/* ------------------------------------------------------------------ простая перегонка (по сборке) */
/** D: { th:'side'|'high'|'liq', T (показание), waterTop, closed, drip } */
export function distillScene(D = {}) {
  let s = STYLE + stand(46, 112) + `<path class="metd" d="M64 222 L68 190 Q96 178 124 190 L128 222 Z"/>`;
  s += rbFlask({ id: 'l0ds', cx: 96, cy: 172, r: 26, frac: 0.4, boiling: true, chips: true });
  s += `<rect class="gl" x="89" y="96" width="14" height="52"/><path class="gl" d="M103 112 L134 124 L134 132 L103 120 Z"/>`;
  s += `<g transform="rotate(16 134 128)"><rect class="gl" x="134" y="122" width="150" height="12"/><rect x="146" y="114" width="126" height="28" rx="6" fill="var(--liquid)" stroke="var(--glass)" stroke-width="1.6"/></g>`;
  const inY = D.waterTop ? 128 : 172, outY = D.waterTop ? 172 : 128;
  s += `<line x1="${D.waterTop ? 150 : 262}" y1="${inY - 18}" x2="${D.waterTop ? 150 : 262}" y2="${inY - 34}" stroke="var(--glass)" stroke-width="3"/>` + text(D.waterTop ? 150 : 262, inY - 38, L('вход', 'кіру', 'in'));
  s += `<line x1="${D.waterTop ? 262 : 150}" y1="${outY - 18}" x2="${D.waterTop ? 262 : 150}" y2="${outY - 34}" stroke="var(--glass)" stroke-width="3"/>` + text(D.waterTop ? 262 : 150, outY - 38, L('выход', 'шығу', 'out'));
  s += conical({ id: 'l0rc', cx: 300, by: 222, s: 0.32, vol: 8, cap: 50 });
  if (D.closed) s += `<rect class="metd" x="292" y="160" width="16" height="8" rx="2"/>`;
  if (D.drip) s += `<circle class="drop" data-key="dd${D.drip}" cx="292" cy="172" r="2.2" style="fill:var(--liquid);--dy:30px"/>`;
  const bulb = D.th === 'high' ? 84 : D.th === 'liq' ? 178 : 116;
  s += `<rect x="94" y="${bulb - 70}" width="4" height="70" fill="var(--panel)" stroke="var(--glass)"/><circle cx="96" cy="${bulb}" r="4" class="redc"/>`;
  s += `<rect x="6" y="20" width="70" height="22" rx="5" class="pnl"/>` + text(41, 35, `${n(D.T ?? 78, 0)} °C`, 'lblb');
  return scene(s);
}
