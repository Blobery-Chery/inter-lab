/**
 * Сцены стенда работы 13 (SVG 360×250). Цвета — только CSS-переменные.
 * Молекулярные модели (проекции Ньюмена, «козлы», кресло/ванна, тетраэдрический центр, проекция Фишера, малеиновая/фумаровая
 * кислоты), установка для кипячения с обратным холодильником, прибор т. пл. с возгонкой, спектры ЯМР и ИК.
 */
import { L, tr, num } from '../../app/i18n.js';
import { esc, clamp } from '../../app/dom.js';
import { scene, text, rbFlask, condenser, bubbles, steam, hood, stand, ice } from '../../app/scene/svg.js';
import { ethaneE, butaneE, norm360, angDiff, irT, NMR_MHZ } from './model.js';

const f1 = (x) => Math.round(x * 10) / 10;
const rad = (d) => (d * Math.PI) / 180;
const pol = (cx, cy, Lr, deg) => [cx + Lr * Math.sin(rad(deg)), cy - Lr * Math.cos(rad(deg))];

/* ---------------------------------------------------------------- атомы и группы */
const GROUP = {
  H: { r: 7, fill: 'var(--panel)', stroke: 'var(--muted)', t: 'H', ink: 'var(--ink)' },
  C: { r: 7.5, fill: 'var(--ink)', stroke: 'var(--ink)', t: '', ink: 'var(--panel)' },
  CH3: { r: 12, fill: 'var(--metal-dark)', stroke: 'var(--ink)', t: 'CH₃', ink: 'var(--panel)' },
  C2H5: { r: 13.5, fill: 'var(--accent)', stroke: 'var(--ink)', t: 'C₂H₅', ink: 'var(--panel)' },
  OH: { r: 11, fill: 'var(--bad)', stroke: 'var(--ink)', t: 'OH', ink: 'var(--panel)' },
  COOH: { r: 15, fill: 'var(--bad)', stroke: 'var(--ink)', t: 'COOH', ink: 'var(--panel)' },
};
export function atom(x, y, g, o = {}) {
  const G = GROUP[g] || GROUP.H, r = (o.r || G.r) * (o.s || 1);
  const op = o.op != null ? ` opacity="${o.op}"` : '';
  return `<g${op}><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" style="fill:${G.fill};stroke:${o.hl ? 'var(--warn)' : G.stroke};stroke-width:${o.hl ? 3 : 1.2}"/>${G.t ? `<text x="${f1(x)}" y="${f1(y + 3.2)}" text-anchor="middle" style="font:700 ${g === 'H' ? 8.5 : 7.5}px var(--f-body);fill:${G.ink}">${esc(G.t)}</text>` : ''}</g>`;
}
const bond = (x1, y1, x2, y2, o = {}) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${o.color || 'var(--ink)'}" stroke-width="${o.w || 2.2}" stroke-linecap="round"${o.dash ? ' stroke-dasharray="3 3"' : ''}${o.op != null ? ` opacity="${o.op}"` : ''}/>`;

/* ---------------------------------------------------------------- проекция Ньюмена */
/**
 * front/back — заместители у переднего и заднего атома ([3], по часовой от «вверх»), phi — поворот заднего атома (°).
 */
export function newman({ cx = 92, cy = 100, r = 36, phi = 0, front = ['H', 'H', 'H'], back = ['H', 'H', 'H'], bad = [] } = {}) {
  let s = '';
  const Lb = r + 22;
  const fa = [0, 120, 240], ba = [0, 120, 240].map((a) => a + phi);
  // задние связи — от окружности; при заслонении слегка сдвинуты, чтобы были видны
  ba.forEach((a, i) => {
    const near = fa.some((x) => angDiff(x, a) < 4);
    const aa = near ? a + 8 : a;
    const [x1, y1] = pol(cx, cy, r, aa), [x2, y2] = pol(cx, cy, Lb, aa);
    s += bond(x1, y1, x2, y2, { color: 'var(--muted)', w: 2.4 }) + atom(x2, y2, back[i], { s: back[i] === 'H' ? 0.85 : 0.95, op: 0.9 });
  });
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:var(--scene);stroke:var(--ink);stroke-width:2"/>`;
  fa.forEach((a, i) => {
    const [x2, y2] = pol(cx, cy, Lb - 2, a);
    s += bond(cx, cy, x2, y2, { w: 2.6 }) + atom(x2, y2, front[i], { s: front[i] === 'H' ? 0.85 : 0.95 });
  });
  s += `<circle cx="${cx}" cy="${cy}" r="3" style="fill:var(--ink)"/>`;
  for (const [i, j] of bad) {
    const [x1, y1] = pol(cx, cy, Lb - 2, fa[i]), [x2, y2] = pol(cx, cy, Lb, ba[j] + (angDiff(fa[i], ba[j]) < 4 ? 8 : 0));
    s += `<path d="M${f1(x1)} ${f1(y1)} Q${f1((x1 + x2) / 2 + (cx - (x1 + x2) / 2) * 0.25)} ${f1((y1 + y2) / 2 + (cy - (y1 + y2) / 2) * 0.25)} ${f1(x2)} ${f1(y2)}" fill="none" stroke="var(--bad)" stroke-width="2" stroke-dasharray="4 3"/>`;
  }
  return s;
}

/* ---------------------------------------------------------------- «козлы» (перспективная формула) */
export function sawhorse({ cx = 262, cy = 100, phi = 0, front = ['H', 'H', 'H'], back = ['H', 'H', 'H'] } = {}) {
  const kx = 30, ky = 24, S = 30;
  const P = (x, y, z) => [cx + S * x + kx * z - kx / 2, cy - S * y - ky * z + ky / 2];
  const C1 = P(0, 0, 0), C2 = P(0, 0, 1.54);
  const subs = (theta, z0, dz) => { const t = rad(theta); return [0.94 * Math.sin(t), 0.94 * Math.cos(t), z0 + dz]; };
  const items = [];
  [0, 120, 240].forEach((a, i) => items.push({ p: subs(a, 0, -0.36), g: front[i], from: C1, z: -0.36 }));
  [0, 120, 240].forEach((a, i) => items.push({ p: subs(a + phi, 1.54, 0.36), g: back[i], from: C2, z: 1.9 }));
  items.sort((a, b) => b.z - a.z);
  let s = '';
  const back2 = items.filter((x) => x.z > 1), front2 = items.filter((x) => x.z < 1);
  for (const it of back2) { const [x, y] = P(...it.p); s += bond(it.from[0], it.from[1], x, y, { color: 'var(--muted)' }) + atom(x, y, it.g, { s: it.g === 'H' ? 0.8 : 0.72, op: 0.9 }); }
  s += bond(C1[0], C1[1], C2[0], C2[1], { w: 3 }) + atom(C2[0], C2[1], 'C', { s: 0.8 });
  for (const it of front2) { const [x, y] = P(...it.p); s += bond(it.from[0], it.from[1], x, y) + atom(x, y, it.g, { s: it.g === 'H' ? 0.85 : 0.76 }); }
  s += atom(C1[0], C1[1], 'C', { s: 0.9 });
  return s;
}

/* ---------------------------------------------------------------- энергетическая диаграмма */
export function energyPlot({ x = 30, y = 162, w = 312, hh = 46, mol = 'butane', phi = 0, marks = [], title = '' } = {}) {
  const E = mol === 'ethane' ? ethaneE : butaneE, max = mol === 'ethane' ? 14 : 21;
  const X = (a) => x + (w * a) / 360, Y = (e) => y + hh - (hh * e) / max;
  let d = '';
  for (let a = 0; a <= 360; a += 5) d += (a ? 'L' : 'M') + f1(X(a)) + ' ' + f1(Y(E(a)));
  let s = `<rect x="${x}" y="${y - 4}" width="${w}" height="${hh + 8}" rx="4" style="fill:var(--panel);stroke:var(--line)"/>`;
  s += `<path d="${d}" fill="none" stroke="var(--accent)" stroke-width="1.8"/>`;
  for (const a of [0, 60, 120, 180, 240, 300, 360]) s += `<text class="lbl mono" x="${f1(X(a))}" y="${y + hh + 14}" text-anchor="middle">${a}°</text>`;
  for (const m of marks) s += `<circle cx="${f1(X(norm360(m)))}" cy="${f1(Y(E(m)))}" r="3" style="fill:var(--good)"/>`;
  const a = norm360(phi);
  s += `<line x1="${f1(X(a))}" x2="${f1(X(a))}" y1="${y - 2}" y2="${y + hh + 2}" stroke="var(--muted)" stroke-dasharray="2 2"/><circle cx="${f1(X(a))}" cy="${f1(Y(E(a)))}" r="4.5" style="fill:var(--bad)"/>`;
  s += text(x + 4, y + 7, { ru: 'E, кДж/моль · ' + tr(title, 'ru'), kk: 'E, кДж/моль · ' + tr(title, 'kk'), en: 'E, kJ/mol · ' + tr(title, 'en') }, 'lbl', 'start') + text(x + w - 4, y + 7, `${num(E(a), 1)}`, 'lbl mono', 'end');
  return s;
}

/** Сцена «вращение вокруг C–C». */
export function rotorScene({ mol, phi, marks = [] }) {
  const isB = mol === 'butane';
  const front = isB ? ['CH3', 'H', 'H'] : ['H', 'H', 'H'], back = isB ? ['CH3', 'H', 'H'] : ['H', 'H', 'H'];
  const bad = [];
  if (isB && angDiff(0, phi) < 75) bad.push([0, 0]);
  if (!isB && [0, 120, 240].some((k) => angDiff(phi, k) < 4)) bad.push([0, 0], [1, 1], [2, 2]);
  const title = isB ? L('бутан, связь C2–C3', 'бутан, C2–C3 байланысы', 'butane, C2–C3 bond') : L('этан, связь C–C', 'этан, C–C байланысы', 'ethane, C–C bond');
  return scene(`${text(92, 18, L('проекция Ньюмена', 'Ньюмен проекциясы', 'Newman projection'), 'lblb')}${text(262, 18, L('«козлы»', '«ешкі» формуласы', 'sawhorse'), 'lblb')}
${newman({ cy: 92, r: 34, phi, front, back, bad })}${sawhorse({ cy: 92, phi, front, back })}${text(180, 18, `φ = ${Math.round(norm360(phi))}°`, 'lbl mono')}
${energyPlot({ mol, phi, marks, title })}`, L('Молекулярная модель', 'Молекулалық модель', 'Molecular model'));
}

/* ---------------------------------------------------------------- циклогексан */
/**
 * Координаты циклогексана. form: 'chair' | 'boat'; flip — инверсия цикла. Возвращает атомы C и для каждого две связи
 * { ax:[x,y,z], eq:[x,y,z] } (для ванны — флагштоковые/бушпритные у C1 и C4).
 */
export function ringGeom(form = 'chair', flip = false) {
  const R = 1.25, h = 0.27, out = [];
  for (let i = 0; i < 6; i++) {
    const a = rad(i * 60), sgn = (i % 2 ? -1 : 1) * (flip ? -1 : 1);
    let z = sgn * h;
    if (form === 'boat') z = i === 0 || i === 3 ? 0.55 : 0;
    const c = [R * Math.cos(a), R * Math.sin(a), z];
    let ax, eq;
    if (form === 'chair') {
      ax = [c[0], c[1], z + sgn * 1.0];
      eq = [c[0] * 1.75, c[1] * 1.75, z - sgn * 0.32];
    } else if (i === 0 || i === 3) {
      ax = [c[0] * 0.55, c[1] * 0.55, z + 0.95]; // флагшток
      eq = [c[0] * 1.8, c[1] * 1.8, z + 0.15]; // бушприт
    } else {
      ax = [c[0] * 1.25, c[1] * 1.25, z + 0.95];
      eq = [c[0] * 1.45, c[1] * 1.45, z - 0.9];
    }
    out.push({ c, ax, eq, up: sgn > 0 });
  }
  return out;
}
const proj = (p, cx = 180, cy = 108, S = 52) => [cx + S * (p[0] + p[1] * 0.12), cy - S * (p[2] + p[1] * 0.2)];

/**
 * Кресло/ванна. me: null | 'ax' | 'eq' (метил у C1); hl: { i, kind } — подсвеченная связь; diax — показать 1,3-диаксиальные взаимодействия.
 */
export function chairSVG({ form = 'chair', flip = false, me = null, hl = null, diax = false, labels = true, cx = 180, cy = 128 } = {}) {
  const G = ringGeom(form, flip);
  const P = (p) => proj(p, cx, cy);
  const items = [];
  G.forEach((g, i) => {
    for (const kind of ['ax', 'eq']) {
      const isMe = i === 0 && me && ((me === 'ax' && kind === 'ax') || (me === 'eq' && kind === 'eq'));
      items.push({ kind, i, from: g.c, to: g[kind], g: isMe ? 'CH3' : 'H', y: g[kind][1] });
    }
  });
  let s = '';
  // кольцо: задние связи тоньше
  const ring = [];
  for (let i = 0; i < 6; i++) { const a = G[i].c, b = G[(i + 1) % 6].c; ring.push({ a, b, y: (a[1] + b[1]) / 2 }); }
  const backBonds = items.filter((x) => x.y > 0.4), frontBonds = items.filter((x) => x.y <= 0.4);
  const draw = (it) => {
    const [x1, y1] = P(it.from), [x2, y2] = P(it.to);
    const isHl = hl && hl.i === it.i && hl.kind === it.kind;
    const col = isHl ? 'var(--warn)' : it.kind === 'ax' && form === 'chair' && labels ? 'var(--accent)' : 'var(--muted)';
    return bond(x1, y1, x2, y2, { color: col, w: isHl ? 4 : 2 }) + atom(x2, y2, it.g, { s: it.g === 'H' ? 0.72 : 0.8, hl: isHl });
  };
  for (const it of backBonds) s += draw(it);
  for (const r of ring.filter((x) => x.y > 0)) { const [x1, y1] = P(r.a), [x2, y2] = P(r.b); s += bond(x1, y1, x2, y2, { w: 2.4, color: 'var(--ink)', op: 0.7 }); }
  for (const r of ring.filter((x) => x.y <= 0)) { const [x1, y1] = P(r.a), [x2, y2] = P(r.b); s += bond(x1, y1, x2, y2, { w: 3.4 }); }
  for (const it of frontBonds) s += draw(it);
  const [ox, oy] = P([0, 0, 0]);
  G.forEach((g, i) => { const [x, y] = P(g.c); s += atom(x, y, 'C', { s: 0.75 }) + (labels ? `<text class="lbl mono" x="${f1(x + (ox - x) * 0.3)}" y="${f1(y + (oy - y) * 0.3 + 3)}" text-anchor="middle" style="font-weight:700">C${i + 1}</text>` : ''); });
  if (diax && me === 'ax' && form === 'chair') {
    const [mx, my] = P(G[0].ax);
    for (const k of [2, 4]) { const [hx, hy] = P(G[k].ax); s += `<line x1="${f1(mx)}" y1="${f1(my)}" x2="${f1(hx)}" y2="${f1(hy)}" stroke="var(--bad)" stroke-width="2" stroke-dasharray="4 3"/>`; }
  }
  if (form === 'boat') {
    const [ax, ay] = P(G[0].ax), [bx, by] = P(G[3].ax);
    s += `<line x1="${f1(ax)}" y1="${f1(ay)}" x2="${f1(bx)}" y2="${f1(by)}" stroke="var(--bad)" stroke-width="2" stroke-dasharray="4 3"/>`;
  }
  return s;
}

export function chairScene(o) {
  const legend = o.form === 'boat'
    ? text(180, 38, L('флагштоковые H сближены, связи заслонены', 'флагшток H жақындасқан, байланыстар көмкерілген', 'flagpole H atoms close, bonds eclipsed'))
    : o.labels === false ? '' : `<line x1="12" x2="30" y1="40" y2="40" stroke="var(--accent)" stroke-width="2.5"/>${text(34, 43, L('аксиальные', 'аксиалды', 'axial'), 'lbl', 'start')}<line x1="12" x2="30" y1="54" y2="54" stroke="var(--muted)" stroke-width="2.5"/>${text(34, 57, L('экваториальные', 'экваториалды', 'equatorial'), 'lbl', 'start')}`;
  return scene(chairSVG({ ...o, cy: o.form === 'boat' ? 140 : 128 }) + legend + text(180, 18, o.form === 'boat' ? L('циклогексан — ванна', 'циклогексан — ванна', 'cyclohexane — boat') : o.me ? L('метилциклогексан — кресло', 'метилциклогексан — кресло', 'methylcyclohexane — chair') : L('циклогексан — кресло', 'циклогексан — кресло', 'cyclohexane — chair'), 'lblb'), L('Модель циклогексана', 'Циклогексан моделі', 'Cyclohexane model'));
}

/* ---------------------------------------------------------------- тетраэдрический центр */
const POS = [[0, -50], [-46, 24], [32, 36], [48, -8]];
/** perm[pos] — заместитель; hl — подсвеченные позиции. */
export function tetra({ cx, cy, perm, label, hl = [] }) {
  let s = '';
  const d = POS.map(([x, y]) => [cx + x, cy + y]);
  // пунктир (от нас)
  {
    const [x, y] = d[3];
    let lines = '';
    for (let k = 1; k <= 6; k++) { const t = k / 7, px = cx + (x - cx) * t, py = cy + (y - cy) * t, w = 1 + 5 * t, nx = -(y - cy), ny = x - cx, nl = Math.hypot(nx, ny); lines += `<line x1="${f1(px + (nx / nl) * w)}" y1="${f1(py + (ny / nl) * w)}" x2="${f1(px - (nx / nl) * w)}" y2="${f1(py - (ny / nl) * w)}" stroke="var(--ink)" stroke-width="1.6"/>`; }
    s += lines + atom(x, y, perm[3], { s: perm[3] === 'H' ? 0.9 : 0.85, op: 0.85, hl: hl.includes(3) });
  }
  s += bond(cx, cy, d[0][0], d[0][1], { w: 2.6 }) + atom(d[0][0], d[0][1], perm[0], { hl: hl.includes(0) });
  s += bond(cx, cy, d[1][0], d[1][1], { w: 2.6 }) + atom(d[1][0], d[1][1], perm[1], { hl: hl.includes(1) });
  {
    const [x, y] = d[2], nx = -(y - cy), ny = x - cx, nl = Math.hypot(nx, ny), w = 6;
    s += `<path d="M${cx} ${cy} L${f1(x + (nx / nl) * w)} ${f1(y + (ny / nl) * w)} L${f1(x - (nx / nl) * w)} ${f1(y - (ny / nl) * w)} Z" style="fill:var(--ink)"/>` + atom(x, y, perm[2], { s: perm[2] === 'H' ? 1.05 : 1.08, hl: hl.includes(2) });
  }
  s += atom(cx, cy, 'C', { s: 1 });
  if (label) s += text(cx, cy + 60, label, 'lblb');
  return s;
}

/** Проекция Фишера бутан-2-ола: { left, right } у горизонтали; вертикаль CH₃ / C₂H₅. */
export function fischer({ cx, cy, left, right, conf }) {
  const lab = (x, y, t, a = 'middle') => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${a}" style="font:600 11px var(--f-body);fill:var(--ink)">${esc(t)}</text>`;
  const nm = (g) => ({ OH: 'OH', H: 'H', CH3: 'CH₃', C2H5: 'C₂H₅' }[g]);
  return `<line x1="${cx}" y1="${cy - 20}" x2="${cx}" y2="${cy + 20}" stroke="var(--ink)" stroke-width="2"/><line x1="${cx - 22}" y1="${cy}" x2="${cx + 22}" y2="${cy}" stroke="var(--ink)" stroke-width="2"/>
${lab(cx, cy - 24, 'CH₃')}${lab(cx, cy + 33, 'C₂H₅')}${lab(cx - 25, cy + 4, nm(left), 'end')}${lab(cx + 25, cy + 4, nm(right), 'start')}${conf ? `<text x="${cx + 52}" y="${cy + 4}" class="mono" style="font:700 12px var(--f-mono);fill:var(--accent)">(${conf})</text>` : ''}`;
}

export function stereoScene({ A, B, showB, fischerA, fischerB, hl = [] }) {
  let s = tetra({ cx: 92, cy: 86, perm: A, label: L('модель A', 'A моделі', 'model A') });
  if (showB) s += `<line x1="180" y1="30" x2="180" y2="222" stroke="var(--glass)" stroke-width="2" stroke-dasharray="6 4"/>` + tetra({ cx: 262, cy: 86, perm: B, label: L('модель B', 'B моделі', 'model B'), hl });
  if (fischerA) s += fischer({ cx: 80, cy: 194, ...fischerA });
  if (fischerB) s += fischer({ cx: 250, cy: 194, ...fischerB });
  return scene(s + text(180, 18, L('бутан-2-ол: CH₃–CH(OH)–C₂H₅', 'бутан-2-ол: CH₃–CH(OH)–C₂H₅', 'butan-2-ol: CH₃–CH(OH)–C₂H₅'), 'lblb'), L('Модели энантиомеров', 'Энантиомерлер модельдері', 'Models of the enantiomers'));
}

/* ---------------------------------------------------------------- малеиновая / фумаровая */
/**
 * theta — поворот правого атома C вокруг оси C=C (0 — малеиновая, 180 — фумаровая); pi — π-связь цела; strain — «пружины» изогнуты.
 */
export function butenedioic({ theta = 0, pi = true, strain = 0, hbond = true }) {
  const cx1 = 140, cx2 = 220, cy = 118;
  const c = Math.cos(rad(theta));
  let s = '';
  // левый атом: COOH вверх-влево, H вниз-влево
  s += bond(cx1, cy, cx1 - 40, cy - 52) + atom(cx1 - 44, cy - 58, 'COOH') + bond(cx1, cy, cx1 - 36, cy + 46) + atom(cx1 - 38, cy + 50, 'H');
  // правый атом: COOH вверх-вправо (при θ = 0), H вниз-вправо; поворот сжимает вертикаль
  const yu = cy - 52 * c, yd = cy + 46 * c;
  s += bond(cx2, cy, cx2 + 40, yu, { op: Math.abs(c) < 0.2 ? 0.6 : 1 }) + atom(cx2 + 44, cy - 58 * c, 'COOH', { op: Math.abs(c) < 0.3 ? 0.7 : 1 });
  s += bond(cx2, cy, cx2 + 36, yd) + atom(cx2 + 38, cy + 50 * c, 'H');
  // двойная связь: две изогнутые «пружины» модели; без π — одна прямая
  if (pi) {
    const b = 14 + strain * 0.3;
    s += `<path d="M${cx1} ${cy} Q180 ${f1(cy - b)} ${cx2} ${cy}" fill="none" stroke="var(--ink)" stroke-width="2.6"/><path d="M${cx1} ${cy} Q180 ${f1(cy + b)} ${cx2} ${cy}" fill="none" stroke="var(--ink)" stroke-width="2.6"/>`;
  } else {
    s += bond(cx1, cy, cx2, cy, { w: 2.8 }) + `<path d="M150 ${cy - 26} q30 -14 60 0" fill="none" stroke="var(--muted)" stroke-width="2" stroke-dasharray="3 3"/>${text(180, cy - 34, L('π-связь разомкнута', 'π-байланыс ажыратылған', 'π-bond opened'), 'lbl')}`;
  }
  s += atom(cx1, cy, 'C') + atom(cx2, cy, 'C');
  if (hbond && Math.abs(norm360(theta)) < 10 && pi) s += `<path d="M${cx1 - 30} ${cy - 66} Q180 ${cy - 96} ${cx2 + 30} ${cy - 66}" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-dasharray="3 3"/>${text(180, cy - 86, L('внутримолекулярная H-связь', 'молекулаішілік H-байланыс', 'intramolecular H-bond'), 'lbl')}`;
  return s;
}
export function maleicScene(o) {
  const t = norm360(o.theta || 0);
  const name = t < 20 || t > 340 ? L('малеиновая кислота (Z, цис)', 'малеин қышқылы (Z, цис)', 'maleic acid (Z, cis)') : angDiff(t, 180) < 20 ? L('фумаровая кислота (E, транс)', 'фумар қышқылы (E, транс)', 'fumaric acid (E, trans)') : L('промежуточное положение — только без π-связи', 'аралық күй — тек π-байланыссыз', 'intermediate — possible only without the π-bond');
  return scene(butenedioic(o) + text(180, 214, name, 'lblb') + text(180, 18, `θ = ${Math.round(t)}°`, 'lbl mono'), L('Модели малеиновой и фумаровой кислот', 'Малеин және фумар қышқылдарының модельдері', 'Models of maleic and fumaric acids'));
}

/* ---------------------------------------------------------------- установка с обратным холодильником */
/**
 * S — state опыта 3: assembly (top: 'condenser'|'stopper', water: 'bottom'|'top', heat: 'bath'|'mantle'|'plate', chips: bool),
 * T, boil, cryst (0…1), local: { water, heat }.
 */
export function refluxScene(S, lc = {}) {
  const A = S.asm || {}, c = lc.c || {};
  const heatOn = !!c.heat, waterOn = !!c.water;
  const T = S.T ?? 22, boiling = T >= (S.Tb || 104) - 0.4;
  const cx = 180, cy = 176;
  let s = stand(66, 76) + `<rect class="metd" x="66" y="${cy - 52}" width="${cx - 66 - 8}" height="5" rx="2"/>`;
  if (A.heat === 'mantle') s += `<path class="met" d="M${cx - 50} ${cy - 6} Q${cx} ${cy + 76} ${cx + 50} ${cy - 6} L${cx + 50} 230 L${cx - 50} 230 Z"/><path d="M${cx - 42} ${cy} Q${cx} ${cy + 62} ${cx + 42} ${cy}" fill="none" stroke="var(--hot)" stroke-width="2" opacity="${heatOn ? 0.9 : 0.15}"/>`;
  else if (A.heat === 'plate') s += `<rect class="met" x="${cx - 60}" y="${cy + 34}" width="120" height="22" rx="4"/><rect x="${cx - 48}" y="${cy + 30}" width="96" height="5" rx="2" fill="var(--hot)" opacity="${heatOn ? 0.6 : 0.1}"/>`;
  else s += `<rect class="gl" x="${cx - 62}" y="${cy - 14}" width="124" height="68" rx="8"/><rect class="liq" x="${cx - 60}" y="${cy - 4}" width="120" height="56" rx="6" opacity=".45"/>${heatOn ? bubbles(cx - 54, cy + 48, 108, 6, T > 90) : ''}<rect class="met" x="${cx - 70}" y="${cy + 50}" width="140" height="10" rx="3"/><circle cx="${cx + 60}" cy="${cy + 55}" r="3" fill="var(--hot)" opacity="${heatOn ? 1 : 0.15}"/>`;
  const frac = clamp(((S.vW || 0) + (S.vHCl || 0) + (S.mMal ? 1.3 : 0)) / 50 * 1.4, 0, 0.75);
  s += rbFlask({ id: 'rx', cx, cy, r: 34, frac, color: null, boiling: boiling && heatOn, chips: !!A.chips });
  // кристаллы фумаровой кислоты
  const cr = clamp(S.cryst || 0, 0, 1);
  if (cr > 0.02) s += Array.from({ length: Math.round(6 + cr * 30) }, (_, i) => { const x = cx - 24 + ((i * 29) % 48), y = cy + 26 - ((i * 13) % 14); return `<rect x="${x}" y="${y}" width="5" height="1.8" class="ppt" transform="rotate(${(i * 47) % 180} ${x + 2.5} ${y + 1})"/>`; }).join('');
  if (A.top === 'stopper') s += `<rect class="metd" x="${cx - 9}" y="${cy - 74}" width="18" height="12" rx="3"/>${text(cx + 16, cy - 64, L('пробка', 'тығын', 'stopper'), 'lbl', 'start')}`;
  else if (A.top === 'condenser') {
    s += condenser({ cx, by: cy - 34, hh: 120, water: waterOn, waterIn: A.water === 'top' ? 'top' : 'bottom' });
    // кольцо конденсации паров
    if (boiling && heatOn) { const lvl = waterOn && A.water !== 'top' ? (c.power === 2 ? 0.75 : 0.28) : 1.05; const y = cy - 34 - 120 * clamp(lvl, 0, 1); s += `<rect x="${cx - 6}" y="${f1(y)}" width="12" height="4" rx="2" style="fill:var(--liquid)" opacity=".9"/>`; if (lvl > 0.95) s += steam(cx, cy - 158, true); }
    s += text(cx + 34, cy - 140, L('вода', 'су', 'water'), 'lbl', 'start');
  }
  if (S.fumes > 0.05) s += `<g opacity="${clamp(S.fumes, 0, 0.8).toFixed(2)}">${[0, 1, 2].map((i) => `<ellipse class="fume" style="animation-delay:${i}s;fill:var(--glass)" cx="${cx + i * 6}" cy="20" rx="10" ry="6"/>`).join('')}</g>`;
  s += text(318, 120, `${num(T, 0)} °C`, 'lbl mono', 'end');
  return scene(s, L('Кипячение с обратным холодильником', 'Кері мұздатқышпен қайнату', 'Heating under reflux'));
}

export function assembleBase() {
  return `${stand(66, 76)}<circle class="gls" cx="180" cy="176" r="34"/><rect class="gl" x="172" y="108" width="16" height="36"/>`;
}

/** Колба в ледяной бане / на воздухе (охлаждение). */
export function coolScene(S, lc = {}) {
  const cx = 180, cy = 170, inIce = S.cool && S.cool.ice;
  let s = '';
  if (inIce) s += `<rect class="gl" x="96" y="140" width="168" height="90" rx="10"/><rect class="liq" x="98" y="154" width="164" height="74" rx="8" opacity=".5"/>${ice([[104, 168, 15, -12], [128, 186, 16, 8], [228, 170, 15, 12], [240, 196, 14, -6]])}`;
  s += rbFlask({ id: 'cl', cx, cy, r: 34, frac: 0.42, color: 'rgba(220,226,234,.5)' });
  const cr = clamp(S.cryst || 0, 0, 1);
  s += Array.from({ length: Math.round(8 + cr * 40) }, (_, i) => { const x = cx - 26 + ((i * 29) % 52), y = cy + 28 - ((i * 13) % 18); return `<rect x="${x}" y="${y}" width="${S.cool && S.cool.shock ? 3 : 6}" height="1.8" class="ppt" transform="rotate(${(i * 47) % 180} ${x + 2.5} ${y + 1})"/>`; }).join('');
  if (inIce) s += ice([[110, 206, 16, 10], [236, 210, 14, -14]]);
  s += text(318, 110, `${num(S.T ?? 22, 0)} °C`, 'lbl mono', 'end') + text(cx, 60, inIce ? L('ледяная баня', 'мұз моншасы', 'ice bath') : L('на воздухе', 'ауада', 'in air'));
  return scene(s);
}

/** Вытяжной шкаф (первый шаг). */
export function hoodScene(S, local) { return scene(hood({ air: !!(local && local.on && local.on.hood) })); }

/* ---------------------------------------------------------------- прибор т. пл.: возгонка, спекание */
/**
 * m — модель прибора { Tb, on, rate, inside }; cap: { layer (мм), sub (0…1 возогнано), melt (0…1 расплав), sinter (bool), wet }.
 */
export function capApparatus(m, cap) {
  const Lh = clamp(cap.layer || 2.5, 0, 6) * 13 * (1 - clamp(cap.sub || 0, 0, 0.9));
  const lH = Lh * clamp(cap.melt || 0, 0, 1) * 0.8, sH = Lh * (1 - clamp(cap.melt || 0, 0, 1)) * (cap.sinter ? 0.9 : 1);
  const u = clamp((m.Tb - 20) / 260, 0, 1);
  const subH = clamp(cap.sub || 0, 0, 1) * 26;
  return `<defs><clipPath id="mp13-c"><circle cx="262" cy="116" r="84"/></clipPath></defs>
<rect class="met" x="22" y="96" width="140" height="128" rx="10"/><rect class="scr" x="40" y="182" width="104" height="28" rx="4"/><text class="scrt" x="138" y="202" text-anchor="end">${esc(num(m.Tb, 1))} °C</text><circle cx="32" cy="196" r="4" fill="var(--hot)" opacity="${m.on ? 1 : 0.15}"/>
<rect x="60" y="14" width="8" height="92" rx="4" fill="var(--panel)" stroke="var(--glass)"/><rect class="redc" x="62.5" y="${f1(102 - u * 80)}" width="3" height="${f1(u * 80 + 4)}"/>
<line x1="100" y1="40" x2="100" y2="112" stroke="var(--glass)" stroke-width="2.4" opacity="${m.inside ? 1 : 0}"/><rect x="88" y="112" width="26" height="40" rx="3" class="metd"/>${text(101, 166, L('окно', 'терезе', 'window'))}
<circle cx="262" cy="116" r="86" fill="var(--scene)" stroke="var(--glass)" stroke-width="3"/>
<g clip-path="url(#mp13-c)"><rect x="248" y="10" width="28" height="198" rx="2" class="gl"/>
<rect x="251" y="${f1(200 - lH - sH)}" width="22" height="${f1(sH)}" class="ppt"${cap.wet ? ' opacity=".8"' : ''}/><rect x="251" y="${f1(200 - lH)}" width="22" height="${f1(lH)}" style="fill:var(--melt)"/>
${subH > 0.5 ? `<rect x="249" y="${f1(96 - subH)}" width="2.5" height="${f1(subH)}" class="ppt"/><rect x="273.5" y="${f1(96 - subH)}" width="2.5" height="${f1(subH)}" class="ppt"/>${Array.from({ length: Math.round(subH / 2) }, (_, i) => `<circle cx="${252 + ((i * 7) % 20)}" cy="${f1(96 - ((i * 11) % Math.max(2, subH)))}" r="0.9" class="ppt"/>`).join('')}` : ''}</g>
${text(262, 222, L('капилляр под лупой', 'лупа астындағы капилляр', 'capillary under the magnifier'))}`;
}

/* ---------------------------------------------------------------- спектры */
/** Спектр ЯМР ¹H (фрагмент): lines — [{d, h}], range [hi, lo] м. д.; полные подписи линий над пиками. */
export function nmrScene({ lines, range = [8.3, 5.6], label, mhz = NMR_MHZ }) {
  const x0 = 22, x1 = 340, yb = 150, H = 104;
  const X = (d) => x0 + ((range[0] - d) / (range[0] - range[1])) * (x1 - x0);
  const lw = 0.0022; // полуширина, м. д.
  let d = '';
  for (let i = 0; i <= 640; i++) {
    const dd = range[0] - ((range[0] - range[1]) * i) / 640;
    let y = 0; for (const l of lines) y += l.h / (1 + ((dd - l.d) / lw) ** 2);
    d += (i ? 'L' : 'M') + f1(X(dd)) + ' ' + f1(yb - H * Math.min(1.05, y));
  }
  let s = `<rect x="${x0 - 6}" y="20" width="${x1 - x0 + 12}" height="${yb - 12}" rx="4" style="fill:var(--panel);stroke:var(--line)"/><path d="${d}" fill="none" stroke="var(--ink)" stroke-width="1.2"/>`;
  s += `<line x1="${x0}" x2="${x1}" y1="${yb}" y2="${yb}" stroke="var(--muted)"/>`;
  for (let v = Math.ceil(range[1] * 2) / 2; v <= range[0] + 1e-9; v += 0.5) s += `<line x1="${f1(X(v))}" x2="${f1(X(v))}" y1="${yb}" y2="${yb + 4}" stroke="var(--muted)"/><text class="lbl mono" x="${f1(X(v))}" y="${yb + 14}" text-anchor="middle">${num(v, 1)}</text>`;
  s += text((x0 + x1) / 2, yb + 26, L('δ, м. д.', 'δ, м. ү.', 'δ, ppm'), 'lbl');
  // увеличенные фрагменты с пиками (распечатка прибора)
  const groups = [];
  for (const l of lines.slice().sort((a, b) => b.d - a.d)) { const g = groups.find((q) => Math.abs(q.c - l.d) < 0.15); if (g) { g.ls.push(l); g.c = (g.c + l.d) / 2; } else groups.push({ c: l.d, ls: [l] }); }
  groups.forEach((g, k) => {
    const bx = k === 0 ? 30 : 200, by = 178, bw = 130, bh = 50;
    const span = 0.09, lo = g.c - span / 2, hi = g.c + span / 2;
    const XX = (dd) => bx + ((hi - dd) / span) * bw;
    let p = '';
    for (let i = 0; i <= 160; i++) { const dd = hi - (span * i) / 160; let y = 0; for (const l of g.ls) y += l.h / (1 + ((dd - l.d) / lw) ** 2); p += (i ? 'L' : 'M') + f1(XX(dd)) + ' ' + f1(by + bh - (bh - 14) * Math.min(1, y)); }
    s += `<rect x="${bx - 4}" y="${by - 4}" width="${bw + 8}" height="${bh + 8}" rx="4" style="fill:var(--panel);stroke:var(--line)"/><path d="${p}" fill="none" stroke="var(--accent)" stroke-width="1.3"/>`;
    for (const l of g.ls) s += `<text class="mono" x="${f1(XX(l.d))}" y="${by + 8}" text-anchor="middle" style="font-size:8.5px;fill:var(--ink)">${esc(num(l.d, 4))}</text>`;
    s += `<line x1="${f1(X(g.c))}" y1="${yb - H - 4}" x2="${f1(bx + bw / 2)}" y2="${by - 4}" stroke="var(--line)" stroke-dasharray="2 3"/>`;
  });
  s += text(x0, 14, label || '', 'lblb', 'start') + text(x1, 14, `¹H, ${mhz} ${tr(L('МГц', 'МГц', 'MHz'))}`, 'lbl mono', 'end');
  return `<svg viewBox="0 0 360 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(tr(L('Спектр ЯМР', 'ЯМР спектрі', 'NMR spectrum')))}"><rect x="0" y="0" width="360" height="250" style="fill:var(--scene)"/>${s}</svg>`;
}

/** ИК-спектр (пропускание) 4000–600 см⁻¹, курсор nu. */
export function irScene({ bands, cursor = null, mark = null, label }) {
  const x0 = 30, x1 = 344, yt = 30, yb = 196;
  // ось: 4000–2000 сжата вдвое (как на бланках ИК), 2000–600 — шире
  const X = (nu) => (nu >= 2000 ? x0 + ((4000 - nu) / 2000) * (x1 - x0) * 0.4 : x0 + (x1 - x0) * 0.4 + ((2000 - nu) / 1400) * (x1 - x0) * 0.6);
  const Y = (t) => yb - ((yb - yt) * t) / 100;
  let d = '';
  for (let nu = 4000; nu >= 600; nu -= nu > 2000 ? 8 : 3) d += (nu === 4000 ? 'M' : 'L') + f1(X(nu)) + ' ' + f1(Y(irT(bands, nu)));
  let s = `<rect x="0" y="0" width="360" height="250" style="fill:var(--scene)"/><rect x="${x0}" y="${yt}" width="${x1 - x0}" height="${yb - yt}" style="fill:var(--panel);stroke:var(--line)"/>`;
  for (const t of [0, 50, 100]) s += `<text class="lbl mono" x="${x0 - 4}" y="${f1(Y(t) + 3)}" text-anchor="end">${t}</text>`;
  for (const nu of [4000, 3000, 2000, 1500, 1000, 600]) s += `<line x1="${f1(X(nu))}" x2="${f1(X(nu))}" y1="${yb}" y2="${yb + 4}" stroke="var(--muted)"/><text class="lbl mono" x="${f1(X(nu))}" y="${yb + 15}" text-anchor="middle">${nu}</text>`;
  s += `<rect x="${f1(X(1000))}" y="${yt}" width="${f1(X(650) - X(1000))}" height="${yb - yt}" style="fill:var(--accent-soft)" opacity=".6"/>`;
  s += `<path d="${d}" fill="none" stroke="var(--ink)" stroke-width="1.3"/>`;
  if (cursor != null) s += `<line x1="${f1(X(cursor))}" x2="${f1(X(cursor))}" y1="${yt}" y2="${yb}" stroke="var(--bad)" stroke-width="1.2"/><text class="mono" x="${f1(Math.min(x1 - 30, Math.max(x0 + 30, X(cursor))))}" y="${yt - 6}" text-anchor="middle" style="font-size:9px;fill:var(--bad)">${Math.round(cursor)}</text>`;
  if (mark != null) s += `<circle cx="${f1(X(mark))}" cy="${f1(Y(irT(bands, mark)))}" r="4" style="fill:none;stroke:var(--good);stroke-width:2"/>`;
  s += text((x0 + x1) / 2, yb + 30, L('ν, см⁻¹', 'ν, см⁻¹', 'ν, cm⁻¹'), 'lbl') + text(x0, 16, label || '', 'lblb', 'start') + text(x1, 16, L('T, %', 'T, %', 'T, %'), 'lbl mono', 'end');
  return `<svg viewBox="0 0 360 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(tr(L('ИК-спектр', 'ИҚ спектрі', 'IR spectrum')))}">${s}</svg>`;
}

/** Кривая Карплуса ³J(φ) — справочная сцена для опыта 4. */
export function karplusScene(phi = null) {
  const x0 = 40, x1 = 330, yb = 196, yt = 40;
  const J = (p) => { const c = Math.cos(rad(p)); return 7.76 * c * c - 1.1 * c + 1.4; }; // классическая форма уравнения Карплуса (допущение)
  const X = (p) => x0 + ((x1 - x0) * p) / 180, Y = (j) => yb - ((yb - yt) * j) / 14;
  let d = '';
  for (let p = 0; p <= 180; p += 3) d += (p ? 'L' : 'M') + f1(X(p)) + ' ' + f1(Y(J(p)));
  let s = `<rect x="${x0}" y="${yt}" width="${x1 - x0}" height="${yb - yt}" style="fill:var(--panel);stroke:var(--line)"/><path d="${d}" fill="none" stroke="var(--accent)" stroke-width="2"/>`;
  for (const p of [0, 60, 90, 120, 180]) s += `<text class="lbl mono" x="${f1(X(p))}" y="${yb + 14}" text-anchor="middle">${p}°</text>`;
  for (const j of [0, 5, 10]) s += `<text class="lbl mono" x="${x0 - 4}" y="${f1(Y(j) + 3)}" text-anchor="end">${j}</text>`;
  s += `<rect x="${f1(X(150))}" y="${f1(Y(13))}" width="${f1(X(180) - X(150))}" height="${f1(Y(8) - Y(13))}" style="fill:var(--good)" opacity=".18"/><rect x="${f1(X(45))}" y="${f1(Y(5))}" width="${f1(X(75) - X(45))}" height="${f1(Y(2) - Y(5))}" style="fill:var(--warn)" opacity=".2"/>`;
  s += text(X(178), Y(13.4), L('ax,ax: 8–13 Гц', 'ax,ax: 8–13 Гц', 'ax,ax: 8–13 Hz'), 'lbl', 'end') + text(X(60), Y(5.5), L('ax,eq; eq,eq: 2–5 Гц', 'ax,eq; eq,eq: 2–5 Гц', 'ax,eq; eq,eq: 2–5 Hz'), 'lbl');
  if (phi != null) s += `<line x1="${f1(X(phi))}" x2="${f1(X(phi))}" y1="${yt}" y2="${yb}" stroke="var(--bad)" stroke-dasharray="3 3"/>`;
  s += text((x0 + x1) / 2, yb + 30, L('двугранный угол H–C–C–H, φ', 'H–C–C–H екіжақты бұрышы, φ', 'H–C–C–H dihedral angle, φ'), 'lbl') + text(x0, yt - 8, L('³J, Гц — зависимость Карплуса', '³J, Гц — Карплус тәуелділігі', '³J, Hz — Karplus relationship'), 'lblb', 'start');
  return `<svg viewBox="0 0 360 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(tr(L('Кривая Карплуса', 'Карплус қисығы', 'Karplus curve')))}"><rect x="0" y="0" width="360" height="250" style="fill:var(--scene)"/>${s}</svg>`;
}

/** Сигналы H-1 изомеров 4-трет-бутилциклогексанола (распечатка с подписанными J). */
export function ringNmrScene({ X: isoX, Y: isoY }) {
  const draw = (bx, iso, lab) => {
    // трет-трет: ax-H: tt J 11,0 и 4,3; eq-H: узкий мультиплет ≈ 3 Гц
    const pts = [];
    const Js = iso === 'ax' ? [11.0, 11.0, 4.3, 4.3] : [3.0, 3.0, 2.8, 2.8];
    // мультиплет как свёртка дублетов
    let comps = [[0, 1]];
    for (const j of Js) comps = comps.flatMap(([p, h]) => [[p - j / 2, h / 2], [p + j / 2, h / 2]]);
    const span = 40, bw = 140, bh = 90, by = 70;
    for (let i = 0; i <= 200; i++) { const hz = -span / 2 + (span * i) / 200; let y = 0; for (const [p, h] of comps) y += h / (1 + ((hz - p) / 0.7) ** 2); pts.push([bx + (bw * i) / 200, by + bh - (bh - 10) * Math.min(1, y * (iso === 'ax' ? 2.2 : 1.4))]); }
    let s = `<rect x="${bx - 6}" y="${by - 26}" width="${bw + 12}" height="${bh + 60}" rx="4" style="fill:var(--panel);stroke:var(--line)"/><path d="${pts.map(([x, y], i) => (i ? 'L' : 'M') + f1(x) + ' ' + f1(y)).join('')}" fill="none" stroke="var(--ink)" stroke-width="1.2"/>`;
    s += text(bx + bw / 2, by - 12, lab, 'lblb');
    s += text(bx + bw / 2, by + bh + 14, iso === 'ax' ? L('δ 3,50 · tt', 'δ 3,50 · tt', 'δ 3.50 · tt') : L('δ 4,03 · узкий мультиплет', 'δ 4,03 · тар мультиплет', 'δ 4.03 · narrow multiplet'), 'lbl mono');
    s += text(bx + bw / 2, by + bh + 28, iso === 'ax' ? L('J = 11,0 и 4,3 Гц', 'J = 11,0 және 4,3 Гц', 'J = 11.0 and 4.3 Hz') : L('все J ≈ 3 Гц', 'барлық J ≈ 3 Гц', 'all J ≈ 3 Hz'), 'lbl mono');
    return s;
  };
  return `<svg viewBox="0 0 360 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(tr(L('Сигналы H-1', 'H-1 сигналдары', 'H-1 signals')))}"><rect x="0" y="0" width="360" height="250" style="fill:var(--scene)"/>${draw(16, isoX, L('изомер X, H-1', 'X изомері, H-1', 'isomer X, H-1'))}${draw(200, isoY, L('изомер Y, H-1', 'Y изомері, H-1', 'isomer Y, H-1'))}${text(180, 20, L('4-трет-бутилциклогексанол: сигнал CH–OH', '4-трет-бутилциклогексанол: CH–OH сигналы', '4-tert-butylcyclohexanol: CH–OH signal'), 'lblb')}</svg>`;
}
