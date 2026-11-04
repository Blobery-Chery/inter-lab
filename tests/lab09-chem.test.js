// Работа № 9: сверка с методичкой — молярные массы, баланс уравнений, исправленные числа (сессия C1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { M, anilineMmol, hclMmol, nitriteMmol, kiMmol, theoretical, NAOH_PER_ML } from '../labs/lab-09/model.js';

const AW = { C: 12.011, H: 1.008, N: 14.007, O: 15.999, Na: 22.990, K: 39.098, Cl: 35.45, I: 126.904, Br: 79.904 };
const SUB = { '₀': 0, '₁': 1, '₂': 2, '₃': 3, '₄': 4, '₅': 5, '₆': 6, '₇': 7, '₈': 8, '₉': 9 };

/** Разбор формулы вида «2,4,6-Br₃C₆H₂OH↓», «C₆H₅N₂⁺ Cl⁻», «C₆H₅–N=N–C₁₀H₆OH» → { атомы, заряд }. */
function parse(f) {
  let s = f.replace(/[↑↓]/g, '').replace(/^\d+(,\d+)*-/, '').replace(/[–=\s]/g, '');
  let charge = 0;
  s = s.replace(/[⁺⁻]/g, (c) => { charge += c === '⁺' ? 1 : -1; return ''; });
  s = s.replace(/[₀-₉]/g, (c) => String(SUB[c]));
  const atoms = {};
  for (const [, el, k] of s.matchAll(/([A-Z][a-z]?)(\d*)/g)) atoms[el] = (atoms[el] || 0) + (k ? +k : 1);
  return { atoms, charge };
}
function side(str) {
  const tot = { atoms: {}, charge: 0 };
  for (const term of str.split(' + ')) {
    const m = term.trim().match(/^(\d+)(?=[A-Z])/);
    const k = m ? +m[1] : 1;
    const p = parse(m ? term.trim().slice(m[1].length) : term.trim());
    for (const [el, c] of Object.entries(p.atoms)) tot.atoms[el] = (tot.atoms[el] || 0) + k * c;
    tot.charge += k * p.charge;
  }
  return tot;
}
function balanced(eq) {
  const clean = eq.replace(/\s*\(.*\)\s*$/, '');
  const [l, r] = clean.split('→');
  const a = side(l), b = side(r);
  return JSON.stringify(Object.entries(a.atoms).sort()) === JSON.stringify(Object.entries(b.atoms).sort()) && a.charge === b.charge;
}
const mw = (f) => Object.entries(parse(f).atoms).reduce((s, [el, k]) => s + AW[el] * k, 0);

test('молярные массы модели совпадают с расчётом по атомным массам', () => {
  const cases = { An: 'C₆H₇N', NaNO2: 'NaNO₂', KI: 'KI', PhI: 'C₆H₅I', PhOH: 'C₆H₆O', HCl: 'HCl', naphthol: 'C₁₀H₈O' };
  for (const [k, f] of Object.entries(cases)) assert.ok(Math.abs(M[k] - mw(f)) < 0.01, `${k}: ${M[k]} vs ${mw(f).toFixed(3)}`);
});

test('количества методички: 25 ммоль анилина, 26 ммоль NaNO₂, 27 ммоль KI, ≈ 3 экв. HCl, 5,1 г иодбензола', () => {
  assert.equal(anilineMmol(2.3).toFixed(1), '25.0');
  assert.equal(nitriteMmol(1.8).toFixed(0), '26');
  assert.equal(kiMmol(4.5).toFixed(0), '27');
  assert.equal(hclMmol(6.5).toFixed(1), '75.7');
  assert.equal((hclMmol(6.5) / anilineMmol(2.3)).toFixed(1), '3.0');
  assert.equal(theoretical(25).toFixed(2), '5.10');
  assert.equal(NAOH_PER_ML.toFixed(2), '2.78');
});

test('все уравнения опытов сбалансированы по атомам и зарядам; газы помечены ↑, осадки ↓', async () => {
  const lab = (await import('../labs/lab-09/lab.js')).default;
  const eqs = lab.experiments.flatMap((e) => e.equation.map((q) => (typeof q === 'string' ? q : q.en)));
  assert.ok(eqs.length >= 9);
  for (const q of eqs) assert.ok(balanced(q), 'не сбалансировано: ' + q);
  for (const q of eqs) {
    if (/ N₂ | 2NO /.test(q + ' ')) assert.fail('газ без ↑: ' + q);
  }
  assert.ok(eqs.some((q) => q.includes('2,4,6-Br₃C₆H₂OH↓')));
  assert.ok(eqs.some((q) => q.includes('C₁₀H₆OH↓')));
});

test('уравнение иодкрахмальной пробы в вопросах — с NO↑', async () => {
  const bank = (await import('../labs/lab-09/admission.js')).default;
  const txt = JSON.stringify(bank) + JSON.stringify((await import('../labs/lab-09/exp1.js')).default.steps);
  assert.ok(!/I₂ \+ 2NO \+/.test(txt));
  assert.ok(balanced('2HNO₂ + 2KI + 2HCl → I₂ + 2NO↑ + 2KCl + 2H₂O'));
});

function stubCtx() {
  const remarks = [], logs = [];
  return { remarks, logs, ctx: { log: (t) => logs.push(t), remark: (r) => remarks.push(r), feedback() {}, advance() {} } };
}

test('подщелачивание учитывает HCl от гидролиза: 8 мл 10 % NaOH мало, 15 мл — pH ≥ 12', async () => {
  const exp2 = (await import('../labs/lab-09/exp2.js')).default;
  const alk = exp2.steps.find((s) => s.id === 'alk');
  const mk = () => { const S = exp2.initialState({ prev: {} }); S.phenolKI = 2; return S; };
  const a = mk(), b = mk(), c = mk();
  alk.check(a, { naoh: 8 }, stubCtx().ctx, { id: 'ok' });
  alk.check(b, { naoh: 15 }, stubCtx().ctx, { id: 'ok' });
  assert.ok(a.pH < 12, 'pH при 8 мл ' + a.pH);
  assert.ok(b.pH >= 12, 'pH при 15 мл ' + b.pH);
  // свободная HCl: 75,7 − 25 − 26 + фенол ≈ 25 ммоль на весь раствор → 9 мл (25 ммоль NaOH) на 85 % раствора с 2 ммоль HCl гидролиза ещё не сильнощелочная
  alk.check(c, { naoh: 9 }, stubCtx().ctx, { id: 'ok' });
  assert.ok(c.pH < 12, 'pH при 9 мл ' + c.pH);
});

test('10 % HCl в опыте 4: индикатор показывает pH ≈ 0', async () => {
  const exp4 = (await import('../labs/lab-09/exp4.js')).default;
  const hcl = exp4.steps[0].reagents.find((r) => r.id === 'hcl');
  const t = { v: 0 };
  hcl.apply(t, {}, stubCtx().ctx);
  assert.equal(Math.round(t.pH), 0);
});

test('казахский: «толчки при кипении» — «лықсу» (глоссарий), не «толқу»', async () => {
  const fs = await import('node:fs');
  for (const f of ['exp1.js', 'exp2.js', 'exp3.js', 'exp4.js', 'lab.js', 'admission.js']) {
    const src = fs.readFileSync(new URL('../labs/lab-09/' + f, import.meta.url), 'utf8');
    assert.ok(!/толқ/.test(src), f);
  }
});
