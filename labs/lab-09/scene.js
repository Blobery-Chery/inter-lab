/** Сцены стенда работы № 9 (SVG 360 × 250). Цвета — CSS-переменные или явные rgba для окраски растворов. */
import { L, num } from '../../app/i18n.js';
import { scene, text, conical, thermometer, rod, dropper, bath, fumes, bubbles, hood, ring, hotplate, rbFlask, beaker, sepFunnel, stand, steam } from '../../app/scene/svg.js';

export const COL = {
  diaz: 'rgba(236,222,150,.55)',        // почти бесцветный / бледно-жёлтый раствор диазония
  amineSalt: 'rgba(200,215,225,.6)',    // раствор гидрохлорида анилина
  brown: 'rgba(122,62,22,.62)',         // бурый раствор после KI (I₂ / I₃⁻)
  oil: 'rgba(58,32,20,.92)',            // тяжёлое тёмное масло — сырой иодбензол
  oilPale: 'rgba(214,190,120,.85)',     // промытый иодбензол
  yellowPpt: '#e2b23a',                 // диазоаминобензол
  starchBlue: '#1f2f78',
};

const bathLabel = (b) => (b.salt ? L('баня: лёд + NaCl', 'монша: мұз + NaCl', 'bath: ice + NaCl') : L('баня: лёд', 'монша: мұз', 'bath: ice'));

/** Вытяжной шкаф (первый шаг опыта). */
export function hoodScene(S, local) {
  return scene(hood({ air: !!(local && local.on && local.on.hood) }));
}

/** Иодкрахмальная бумажка слева от колбы. */
function starchStrip(res) {
  const fill = res === 'blue' ? COL.starchBlue : res === 'faint' ? '#8c93c4' : 'var(--panel)';
  return `<rect x="22" y="132" width="16" height="64" rx="2" fill="${fill}" stroke="var(--line)"/>${text(30, 212, L('иодкрахм.', 'иодкрахм.', 'starch–KI'), 'lbl')}`;
}

/**
 * Колба 100 мл с раствором соли анилина / диазония в ледяно-солевой бане.
 * o: { bath, th, rod, stir, pip, dropKey, vol, color, fumes, gas, solid, solidColor, strip }
 */
export function flaskScene(S, o = {}) {
  const b = S.bath || {};
  const showBath = o.bath && b.ice;
  let s = '';
  if (showBath) s += bath({ kind: b.salt ? 'ice-salt' : 'ice' });
  const inner = (o.gas ? bubbles(150, 214, 60, 5) : '') + (o.icePieces ? `<rect class="ice" x="150" y="${(222 - Math.min(1, (o.vol || 0) / 100) * 150 - 6).toFixed(1)}" width="10" height="10" rx="2"/><rect class="ice" x="190" y="${(222 - Math.min(1, (o.vol || 0) / 100) * 150 - 4).toFixed(1)}" width="9" height="9" rx="2"/>` : '');
  s += conical({ id: 'fl', vol: o.vol ?? 0, cap: 100, color: o.color, solid: o.solid ?? 0, solidColor: o.solidColor, inner, label: L('колба 100 мл', 'колба 100 мл', '100 mL flask') });
  if (o.th) s += thermometer({ x: 183, top: 4, hh: 206, T: S.T ?? 22, min: -20, max: 40, mark: 5 }) + text(209, 4 + 206 - 6 - ((5 + 20) / 60) * 192 + 3, '5°', 'lbl', 'start', ' style="fill:var(--bad)"');
  if (o.rod) s += rod(172, 10, 158, 216, o.stir);
  if (o.pip) s += dropper(166, 9, o.dropKey || 0, 120, 'var(--liquid)');
  s += fumes(176, 46, o.fumes || 0);
  if (showBath) s += bath({ kind: b.salt ? 'ice-salt' : 'ice', front: true, label: bathLabel(b) });
  if (o.strip) s += starchStrip(o.strip);
  return scene(s);
}

/** Склянка анилина и пипетка — для отмеривания (дополнение к сцене цилиндра/пипетки). */
export function flaskSide(S) {
  return conical({ id: 'fs', cx: 280, by: 222, s: 0.55, vol: S.vMix || 0, cap: 100, color: S.vAn ? COL.amineSalt : null }) + text(280, 240, L('колба 100 мл', 'колба 100 мл', '100 mL flask'));
}

/**
 * Реакционная колба при замещении на иод: бурый раствор, пена, пузырьки N₂, тяжёлое масло на дне, водяная баня на плитке.
 * o: { inBath, heat, T, Tb, foam (0…1), gas (0…1), oil (0…1), color, dropKey, pip }
 */
export function kiScene(S, o = {}) {
  let s = '';
  if (o.inBath) s += hotplate({ x: 70, y: 198, w: 220, on: o.heat }) + `<rect class="gl" x="74" y="112" width="212" height="86" rx="10"/>`;
  const vol = o.vol ?? 30, ly = 222 - Math.min(1, vol / 100) * 150;
  let inner = '';
  if (o.oil > 0.01) { const hh = 3 + 9 * Math.sqrt(o.oil); inner += `<path d="M${(180 - hh * 4.2).toFixed(1)} 222 Q180 ${(222 - 2 * hh).toFixed(1)} ${(180 + hh * 4.2).toFixed(1)} 222 Z" fill="${o.oilColor || COL.oil}"/>`; }
  if (o.gas > 0.02) inner += bubbles(146, 214, 70, Math.max(2, Math.round(3 + 6 * Math.min(1, o.gas))));
  if (o.foam > 0.02) {
    const fh = Math.min(70, 6 + 64 * o.foam);
    inner += `<rect x="110" y="${(ly - fh).toFixed(1)}" width="140" height="${fh.toFixed(1)}" fill="var(--panel)" opacity=".88"/>` + Array.from({ length: 14 }, (_, i) => `<circle cx="${130 + ((i * 37) % 100)}" cy="${(ly - 3 - ((i * 13) % Math.max(4, fh - 4))).toFixed(1)}" r="${2 + (i % 3)}" fill="none" stroke="var(--glass)" stroke-width=".8"/>`).join('');
  }
  s += conical({ id: 'kf', vol, cap: 100, color: o.color || COL.brown, inner, label: L('колба 100 мл', 'колба 100 мл', '100 mL flask'), ...(o.inBath ? { by: 192, s: 0.8 } : {}) });
  if (o.inBath) s += `<rect x="76" y="128" width="208" height="68" rx="8" fill="var(--liquid)" opacity=".45"/>`;
  if (o.pip) s += dropper(166, 9, o.dropKey || 0, 120, 'var(--liquid)');
  s += thermometer({ x: 196, top: 6, hh: 200, T: o.T ?? 22, min: 0, max: 100, step: 10, major: 20, mark: 70 });
  if (o.inBath) s += text(84, 106, L(`баня ${num(o.Tb ?? 22, 0)} °C`, `монша ${num(o.Tb ?? 22, 0)} °C`, `bath ${num(o.Tb ?? 22, 0)} °C`), 'lbl mono', 'start');
  s += text(300, 40, `${num(o.T ?? 22, 0)} °C`, 'lbl mono', 'end');
  return scene(s);
}

/** Делительная воронка с водным и органическим слоями (промывание иодбензола). */
export function washScene(S, local) {
  const W = S.wash || {};
  const org = W.I2 > 0.6 ? 'rgba(95,45,20,.9)' : W.I2 > 0.15 ? 'rgba(170,110,40,.85)' : COL.oilPale;
  const aq = local && local.last === 'thio' ? 'rgba(220,226,232,.55)' : 'var(--liquid)';
  return scene(stand(108, 54) + sepFunnel({ cx: 180, top: 40, layers: [{ frac: 0.16, color: org }, { frac: 0.3, color: aq }] }) + beaker({ id: 'wr', x: 150, y: 200, w: 60, hh: 32, frac: 0.3 }) +
    text(296, 140, L('органический', 'органикалық', 'organic layer'), 'lbl') + text(296, 154, L('слой — внизу', 'қабат — төменде', 'at the bottom'), 'lbl') + text(296, 170, 'd = 1.83', 'lbl mono'));
}

/**
 * Установка для перегонки с воздушным холодильником.
 * D: { liq:{w,p,i}, heat, Tf, Tv, recv:'fore'|'main', main:{…}, fore:{…}, asm:{ chips, thermo, cond, closed, recvOK } , boiling, dryness }
 */
export function distillScene(S, lc = {}) {
  const D = S.dist || {}, A = D.asm || {};
  const liqTot = D.liq ? D.liq.w + D.liq.p + D.liq.i : 0;
  const cx = 92, cy = 168, r = 30;
  let s = '';
  // колбонагреватель
  s += `<path class="met" d="M${cx - 44} 232 L${cx - 44} 186 Q${cx} 228 ${cx + 44} 186 L${cx + 44} 232 Z"/><rect x="${cx - 40}" y="222" width="18" height="6" rx="2" fill="var(--hot)" opacity="${D.heat ? 0.9 : 0.15}"/>`;
  s += stand(24, 112);
  const frac = Math.min(0.85, (liqTot / 1.83) / 9);
  s += rbFlask({ cx, cy, r, frac, color: D.liq && D.liq.w > 0.01 ? 'rgba(200,180,120,.6)' : COL.oilPale, boiling: D.boiling, chips: A.chips });
  // боковой отвод + холодильник
  const x1 = cx + 8, y1 = 116, x2 = 262, y2 = 172;
  s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--glass)" stroke-width="6" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--scene)" stroke-width="3" stroke-linecap="round"/>`;
  if (A.cond === 'liebig') {
    s += `<line x1="150" y1="135" x2="240" y2="165" stroke="var(--glass)" stroke-width="16" stroke-linecap="round" opacity=".55"/><line x1="150" y1="135" x2="240" y2="165" stroke="var(--liquid)" stroke-width="12" stroke-linecap="round"/>`;
    s += text(196, 190, L('холодильник Либиха (вода)', 'Либих мұздатқышы (су)', 'Liebig condenser (water)'), 'lbl');
    if (D.cracked) s += `<path d="M190 140 l8 10 l-6 4 l9 8" fill="none" stroke="var(--bad)" stroke-width="2"/>`;
  } else {
    s += text(200, 136, L('воздушный холодильник', 'ауа мұздатқышы', 'air condenser'), 'lbl', 'middle', ' transform="rotate(18 200 136)"');
  }
  // термометр
  const bulbY = A.thermo === 'liq' ? cy + 12 : 112;
  s += `<rect x="${cx - 3}" y="14" width="6" height="${bulbY - 14}" rx="3" fill="var(--panel)" stroke="var(--glass)"/><rect class="redc" x="${cx - 1.2}" y="${Math.max(16, bulbY - 6 - ((D.Tth || 22) / 250) * (bulbY - 24)).toFixed(1)}" width="2.4" height="${Math.min(bulbY - 16, 6 + ((D.Tth || 22) / 250) * (bulbY - 24)).toFixed(1)}"/><circle class="redc" cx="${cx}" cy="${bulbY + 3}" r="4"/>`;
  s += text(cx + 12, 30, `${num(D.Tth || 22, 0)} °C`, 'lbl mono', 'start');
  // пары в горле колбы
  if (D.boiling && (D.Tv || 0) > 90) s += `<rect x="${cx - 7}" y="${cy - r - 32}" width="14" height="30" fill="var(--glass-fill)"/>`;
  // приёмники
  const mainV = D.main ? (D.main.w + D.main.p + D.main.i) / 1.83 : 0, foreV = D.fore ? (D.fore.w + D.fore.p + D.fore.i) / 1.5 : 0;
  const atOut = D.recv === 'main';
  const recvMain = conical({ id: 'rm', cx: atOut ? 274 : 330, by: 228, s: 0.36, vol: mainV, cap: 8, color: COL.oilPale }) + (A.closed ? `<rect class="metd" x="${(atOut ? 274 : 330) - 7}" y="${(228 - 166 * 0.36).toFixed(1)}" width="14" height="8" rx="2"/>` : '');
  const fore = beaker({ id: 'rf', x: atOut ? 316 : 256, y: 196, w: 36, hh: 34, frac: Math.min(1, foreV / 6), color: 'rgba(200,180,120,.5)' });
  s += recvMain + fore;
  s += text(atOut ? 274 : 330, 246, L('приёмник (взвеш.)', 'қабылдағыш (өлш.)', 'receiver (weighed)'), 'lbl');
  if (D.heat && D.dripping) s += `<circle data-key="dd${Math.floor((lc.dk || 0))}" class="drop" cx="${x2 + 2}" cy="${y2 + 6}" r="2.2" style="fill:${COL.oilPale};--dy:24px"/>`;
  s += fumes(cx + 6, 28, D.dryness ? 0.8 : 0);
  return scene(s);
}

/** Схема синтеза: анилин → соль диазония → иодбензол. */
export function schemeScene() {
  return scene(`${ring(58, 110, 24, { 0: 'NH₂' })}${text(58, 164, L('анилин', 'анилин', 'aniline'), 'lblb')}
<line x1="94" y1="110" x2="146" y2="110" stroke="var(--ink)" stroke-width="1.5"/><path d="M146 106 L154 110 L146 114 Z" fill="var(--ink)"/>${text(122, 100, 'NaNO₂, HCl')}${text(122, 126, '0–5 °C')}
${ring(190, 110, 24, { 0: 'N₂⁺Cl⁻' })}
<line x1="226" y1="110" x2="266" y2="110" stroke="var(--ink)" stroke-width="1.5"/><path d="M266 106 L274 110 L266 114 Z" fill="var(--ink)"/>${text(246, 100, 'KI')}${text(246, 126, '−N₂')}
${ring(306, 110, 24, { 0: 'I' })}${text(306, 164, L('иодбензол', 'иодбензол', 'iodobenzene'), 'lblb')}`);
}

/** Пробирка над водяной баней — опыт 3 (фон для типа test). */
export function waterBathBack(S, local) {
  const t = local && local.tubes && Object.values(local.tubes)[0];
  return t && t.hot ? bath({ x: 120, y: 150, w: 120, hh: 80, kind: 'water' }) + steam(180, 146, true) : '';
}
