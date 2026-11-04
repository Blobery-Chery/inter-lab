// Работа № 10: сверка с методичкой (сессия C1) — баланс уравнений и числа, на которых держатся подсказки.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../labs/lab-10/model.js';
import lab from '../labs/lab-10/lab.js';
import bank from '../labs/lab-10/admission.js';

/* ---------- баланс атомов в уравнениях ---------- */
const SUB = { '₀': 0, '₁': 1, '₂': 2, '₃': 3, '₄': 4, '₅': 5, '₆': 6, '₇': 7, '₈': 8, '₉': 9 };
function parseFormula(f) {
  const s = f.replace(/[₀-₉]/g, (c) => SUB[c]).replace(/[↑↓]/g, '').replace(/^\d,\d,\d-/, '');
  let i = 0;
  function group() {
    const out = {};
    while (i < s.length) {
      const c = s[i];
      if (c === '(' || c === '[') { i++; const g = group(); let k = num(); for (const e in g) out[e] = (out[e] || 0) + g[e] * k; }
      else if (c === ')' || c === ']') { i++; return out; }
      else if (/[A-Z]/.test(c)) { let e = c; i++; while (i < s.length && /[a-z]/.test(s[i])) e += s[i++]; out[e] = (out[e] || 0) + num(); }
      else throw new Error('не разобрано: ' + f);
    }
    return out;
  }
  function num() { let d = ''; while (i < s.length && /\d/.test(s[i])) d += s[i++]; return d ? +d : 1; }
  return group();
}
function side(str) {
  const tot = {};
  for (let term of str.split(' + ')) {
    term = term.trim();
    const mm = term.match(/^(\d+)\s*(.*)$/);
    const k = mm && !/^\d,/.test(term) ? +mm[1] : 1, f = mm && !/^\d,/.test(term) ? mm[2] : term;
    const a = parseFormula(f);
    for (const e in a) tot[e] = (tot[e] || 0) + k * a[e];
  }
  return tot;
}
function balanced(eq) {
  const [l, r] = eq.split(/\s→\s/);
  const sort = (o) => JSON.stringify(Object.keys(o).sort().map((k) => [k, o[k]]));
  return sort(side(l)) === sort(side(r));
}
const ru = (x) => (typeof x === 'string' ? x : x.ru);

test('уравнения опытов 1, 4, 6, 7, 8 сбалансированы', () => {
  const eqs = [
    ...lab.experiments.find((e) => e.id === '1').equation,
    ru(lab.experiments.find((e) => e.id === '4').equation[0]).replace(/\s*\([^()]*\)$/, ''),
    ru(lab.experiments.find((e) => e.id === '6').equation[0]).replace(/\s*\([^()]*\)$/, ''),
    ...lab.experiments.find((e) => e.id === '7').equation,
    ...lab.experiments.find((e) => e.id === '8').equation.slice(0, 2),
  ];
  assert.equal(eqs.length, 7);
  for (const eq of eqs) assert.ok(balanced(eq), 'не сбалансировано: ' + eq);
});

test('допуск: ровно одно сбалансированное уравнение KMnO₄ + H₂C₂O₄, и оно отмечено верным', () => {
  const q = bank.find((x) => Array.isArray(x.options) && typeof x.options[0] === 'string' && x.options[0].includes('KMnO₄'));
  const ok = q.options.map((o) => balanced(o));
  assert.deepEqual(ok.map((v, i) => (v ? i : -1)).filter((i) => i >= 0), [q.correct]);
});

test('молярные массы модели (г/моль)', () => {
  const near = (a, b) => assert.ok(Math.abs(a - b) < 0.02, `${a} ≠ ${b}`);
  near(m.M.ox, 90.03); near(m.M.KMnO4, 158.03); near(m.M.tart, 150.09); near(m.M.citr, 192.12);
  near(m.M.KOH, 56.11); near(m.M.CuSO4, 159.61); near(m.M.phenol, 94.11); near(m.M.Br2, 159.81); near(m.M.lact, 90.08);
});

/* ---------- числа из подсказок (исправлены при сверке) ---------- */
test('Уффельман: при 2 каплях FeCl₃ окраска меняется от 16 капель молочной кислоты (15 — ещё нет)', () => {
  assert.ok(m.uffelmann({ phenol: true, fe: 2, lac: 15 }).share < 0.8);
  assert.ok(m.uffelmann({ phenol: true, fe: 2, lac: 16 }).share >= 0.8);
});

test('KHT: осадок заметен со 2-й капли KOH, максимум ≈ 7 капель, растворение при 15', () => {
  assert.ok(m.khtState(2).super / 0.45 > 0.25);
  const best = [...Array(15).keys()].reduce((a, k) => (m.khtState(k).kht > m.khtState(a).kht ? k : a), 0);
  assert.equal(best, 7);
  assert.equal(m.khtState(14).excess, false);
  assert.equal(m.khtState(15).excess, true);
});

test('кето-енол: после обесцвечивания окраска видна через ≈ 20–30 с, почти полностью — к минуте', () => {
  const t = { eaa: 1, E: 0, B: 0 };
  m.enolRelax(t, 20); assert.ok(t.E < 0.6);
  m.enolRelax(t, 10); assert.ok(t.E > 0.6);
  m.enolRelax(t, 30); assert.ok(t.E > 0.85);
});

test('фенольная эмульсия просветляется от 10 капель 10 % NaOH (9 — ещё мутная)', () => {
  assert.ok(m.emulsion({ em: true, oh: 9, v: 1.45 }).turb > 0.05);
  assert.ok(m.emulsion({ em: true, oh: 10, v: 1.5 }).turb <= 0.05);
  assert.ok(m.emulsion({ em: true, oh: 10, h: 10, v: 2 }).pH < 3);
});
