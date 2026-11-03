/** Сцены стенда работы 6–7 (SVG 360×250), перенесены из прототипа автора. Цвета — CSS-переменные. */
import { L, num } from '../../app/i18n.js';
import { scene, text, conical, thermometer, rod, dropper, bath, fumes, ice, bottle, hood, ring, beaker, hotplate, bubbles, tube, steam } from '../../app/scene/svg.js';
import { cylinderSVG } from '../../app/instruments/glassware.js';

const bathName = (b) => (b.salt ? L('баня: лёд + NaCl', 'монша: мұз + NaCl', 'bath: ice + NaCl') : L('баня: лёд', 'монша: мұз', 'bath: ice'));

/** Колба на 50 мл: в бане (по желанию), с термометром −20…40 °C, палочкой, капельной пипеткой. */
export function flaskScene(S, o = {}) {
  const b = S.bath || {};
  const showBath = o.bath && b.ice;
  const vol = o.vol ?? (S.vAcid ? S.vAcid + 1 : 0);
  let s = '';
  if (showBath) s += bath({ kind: b.salt ? 'ice-salt' : 'ice' });
  s += conical({ id: 'fl', vol, cap: 40, color: o.color, solid: o.solid ?? 0, label: L('колба 50 мл', 'колба 50 мл', '50 mL flask') });
  if (o.th) s += thermometer({ x: 183, top: 4, hh: 206, T: S.T ?? 22, min: -20, max: 40, mark: 10 }) + text(209, 4 + 206 - 6 - ((10 + 20) / 60) * 192 + 3, '10°', 'lbl', 'start', ' style="fill:var(--bad)"');
  if (o.rod) s += rod(172, 10, 158, 216, o.stir);
  if (o.pip) s += dropper(166, 9, o.dropKey || 0, 120);
  s += fumes(176, 46, o.fumes || 0);
  if (showBath) s += bath({ kind: b.salt ? 'ice-salt' : 'ice', front: true, label: bathName(b) });
  return scene(s);
}

/** Цилиндр с H₂SO₄ + колба с бензойной кислотой. */
export function acidScene(S, local) {
  const cyl = cylinderSVG({ cap: 10, v: local.v || 0, x: 70, name: L('цилиндр 10 мл', 'цилиндр 10 мл', '10 mL cylinder'), bottle: 'H₂SO₄' });
  const fl = conical({ id: 'fl', cx: 250, by: 222, s: 0.62, vol: S.vAcid ? S.vAcid + 1 : 0, cap: 40, solid: S.dissolved ? 0.02 : Math.min(1, (S.mBA || 2) / 2.5) });
  return scene(cyl + fl + (local.done && local.done.stir ? rod(258, 100, 247, 214, true) : '') + text(250, 240, L('колба 50 мл', 'колба 50 мл', '50 mL flask')));
}

/** Нитрующая смесь: склянки H₂SO₄ и HNO₃, пробирка в ледяной бане. */
export function mixScene(S, local) {
  const m = S.mix;
  const fill = Math.min(1, (m.s + m.n) / 4);
  return scene(`${bottle(8, 'H₂SO₄', L('конц.', 'конц.', 'conc.'))}${bottle(64, 'HNO₃', L('конц.', 'конц.', 'conc.'), 'nox')}
<rect class="gl" x="168" y="128" width="128" height="102" rx="6"/><rect class="liq" x="170" y="146" width="124" height="82" rx="5" opacity=".5"/>${ice([[176, 158, 15, 10], [268, 164, 15, -10], [180, 204, 14, -6], [270, 206, 14, 8]])}
${tube({ id: 'mx', cx: 232, top: 26, len: 174, r: 9, frac: fill, color: m.n > 0 ? 'var(--liq-y)' : null })}${fumes(236, 20, m.T > 25 ? Math.min(0.8, (m.T - 25) / 15) : 0)}
${text(232, 16, L('пробирка', 'пробирка', 'test tube'))}${text(232, 244, L('ледяная баня', 'мұз моншасы', 'ice bath'))}
${text(320, 60, L(`смесь ${num(m.T, 0)} °C`, `қоспа ${num(m.T, 0)} °C`, `mixture ${num(m.T, 0)} °C`), 'lbl mono', 'end')}`);
}

/** Стакан со льдом, наклонённая колба (выливание). */
export function pourScene(S, local) {
  const P = S.pour || {}, iceN = Math.round(((local.inp ? local.inp.ice : 15) / 60) * 9);
  const cubes = [[124, 196, 18, 8], [150, 204, 17, -12], [178, 200, 18, 4], [204, 206, 16, 15], [230, 198, 18, -6], [138, 178, 16, 20], [192, 182, 17, -14], [220, 176, 16, 6], [164, 166, 15, -4]].slice(0, iceN);
  const poured = !!local.chosen;
  const yellow = (S.nit && S.nit.E > 900);
  let s = `<defs><clipPath id="bk-c"><rect x="114" y="104" width="152" height="124" rx="5"/></clipPath><clipPath id="tilt-c"><path d="M168 58 L168 112 L124 212 Q121 222 132 222 L228 222 Q239 222 236 212 L192 112 L192 58 Z"/></clipPath></defs>
<rect class="gl" x="112" y="104" width="156" height="126" rx="6"/><g clip-path="url(#bk-c)">${poured ? `<rect class="liq" x="114" y="${228 - ((local.inp.ice || 15) + 9) * 1.3}" width="152" height="${((local.inp.ice || 15) + 9) * 1.3}"/>` : ''}${ice(cubes, poured ? 0.3 : 0.92)}
${poured ? `<g class="ppt"${yellow ? ' style="fill:var(--warn)"' : ''}>${Array.from({ length: 46 }, (_, i) => `<circle cx="${120 + ((i * 37) % 140)}" cy="${156 + ((i * 53) % 70)}" r="${1.2 + (i % 3) * 0.6}"/>`).join('')}</g>` : ''}</g>
<g transform="translate(166 96) rotate(132) scale(.42) translate(-180 -58)"><g clip-path="url(#tilt-c)">${poured ? '' : '<rect x="140" y="58" width="80" height="70" style="fill:var(--liq-y)"/>'}</g><path class="gl" d="M168 58 L168 112 L124 212 Q121 222 132 222 L228 222 Q239 222 236 212 L192 112 L192 58 Z"/></g>
${text(190, 96, L('стакан со льдом', 'мұзы бар стақан', 'beaker with ice'), 'lbl', 'start')}`;
  if (poured) s += text(262, 120, P.ice < 25 ? '≈ 18 °C' : '≈ 2 °C', 'lbl mono', 'end');
  else s += text(262, 120, L(`лёд: ${local.inp ? local.inp.ice : 15} г`, `мұз: ${local.inp ? local.inp.ice : 15} г`, `ice: ${local.inp ? local.inp.ice : 15} g`), 'lbl mono', 'end');
  return scene(s);
}

/** Стакан 150 мл на плитке (перекристаллизация). */
export function hotScene(S, local) {
  const R = S.rec || { V: 0 }, und = local.und || 0;
  const frac = Math.min(1, R.V / 150);
  const hh = und > 0.005 && local.phase === 0 ? 2 + 6 * Math.sqrt(und / 2.6) : 0;
  let inner = '';
  if (hh) inner += `<path class="ppt" stroke="var(--muted)" stroke-width=".6" d="M${180 - hh * 4} 190 Q180 ${190 - 2 * hh} ${180 + hh * 4} 190 Z"/>`;
  if (local.phase === 0 && local.T > 88 && und > 0.25 && R.V > 0) inner += [150, 166, 182, 200, 212].map((x, i) => `<ellipse cx="${x}" cy="${185 - (i % 2) * 3}" rx="5" ry="3" fill="var(--liq-y)" stroke="var(--warn)" stroke-width=".7"/>`).join('');
  if (local.phase >= 1) inner += Array.from({ length: 28 }, (_, i) => { const x = 142 + ((i * 29) % 74), y = 168 + ((i * 17) % 20), a = (i * 47) % 180; return `<rect x="${x}" y="${y}" width="${local.shock ? 4 : 8}" height="1.7" class="ppt" stroke="var(--muted)" stroke-width=".3" transform="rotate(${a} ${x + 4} ${y + 0.8})"/>`; }).join('');
  if (local.phase === 0 && local.T >= 99.5 && R.V > 0) inner += bubbles(146, 186, 70, 7);
  return scene(hotplate({ on: local.c && local.c.heat }) + beaker({ id: 'rc', x: 136, y: 60, w: 88, hh: 131, frac, cap: 150, marks: [50, 100], inner, label: L('стакан 150 мл на плитке', 'плитадағы 150 мл стақан', '150 mL beaker on a hot plate') }) + steam(180, 52, local.phase === 0 && local.T > 90 && R.V > 0) + text(300, 100, `${num(local.T || 22, 0)} °C`, 'lbl mono', 'end'));
}

/** Вытяжной шкаф (первый шаг). */
export function hoodScene(S, local) {
  return scene(hood({ air: !!(local.on && local.on.hood) }));
}

/** Схема реакции. */
export function schemeScene() {
  return scene(`${ring(78, 124, 30, { 0: 'COOH' })}${text(78, 188, L('бензойная кислота', 'бензой қышқылы', 'benzoic acid'), 'lblb')}${text(78, 202, 'M 122.12', 'lbl mono')}
<line x1="124" y1="124" x2="206" y2="124" stroke="var(--ink)" stroke-width="1.6"/><path d="M206 119 L216 124 L206 129 Z" fill="var(--ink)"/>${text(166, 114, 'HNO₃ / H₂SO₄')}${text(166, 140, '0–10 °C')}
${ring(270, 124, 30, { 0: 'COOH', 2: 'NO₂' })}${text(270, 188, L('м-нитробензойная к-та', 'м-нитробензой қышқылы', 'm-nitrobenzoic acid'), 'lblb')}${text(270, 202, 'M 167.12', 'lbl mono')}`);
}

/** Сборка установки для вакуумного фильтрования: подложка. */
export function filterBase() {
  return `<rect class="met" x="290" y="150" width="46" height="72" rx="6"/>${text(313, 244, L('насос', 'сорғы', 'pump'))}<rect class="met" x="40" y="224" width="200" height="8" rx="2"/>`;
}

/** Капилляр для т. пл. (набивка). */
export function capScene(S, local) {
  const c = S.cap || { loose: 0, packed: 0 };
  return scene(`<defs><clipPath id="mg-c"><circle cx="180" cy="120" r="96"/></clipPath></defs><circle cx="180" cy="120" r="98" fill="var(--scene)" stroke="var(--glass)" stroke-width="3"/>
<g clip-path="url(#mg-c)"><rect x="166" y="10" width="28" height="200" rx="2" class="gl"/>${c.loose ? `<rect x="169" y="30" width="22" height="${(c.loose * 13).toFixed(1)}" class="ppt" opacity=".7"/>` : ''}<rect x="169" y="${(200 - c.packed * 13).toFixed(1)}" width="22" height="${(c.packed * 13).toFixed(1)}" class="ppt"/>
${[1, 2, 3, 4].map((mm) => `<line x1="196" x2="204" y1="${200 - mm * 13}" y2="${200 - mm * 13}" stroke="var(--muted)"/><text class="lbl mono" x="208" y="${203 - mm * 13}">${mm}</text>`).join('')}</g>
${text(180, 240, L('капилляр под лупой, шкала в мм', 'лупа астындағы капилляр, шкала мм', 'capillary under the magnifier, scale in mm'))}`);
}
