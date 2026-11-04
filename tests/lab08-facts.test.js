// Работа № 8: сверка с методичкой (сессия C1) — константы, молярные массы, исправленные числа и тексты.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../labs/lab-08/model.js';
import { tubePH } from '../labs/lab-08/exp3.js';
import { chargeScene } from '../labs/lab-08/scene.js';
import lab from '../labs/lab-08/lab.js';

const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b} (±${tol})`);
const AW = { C: 12.011, H: 1.008, O: 15.999 };
const mm = (c, h, o) => c * AW.C + h * AW.H + o * AW.O;

test('молярные массы по стандартным атомным массам', () => {
  near(m.M.BuOH, mm(4, 10, 1), 0.01);   // C₄H₁₀O
  near(m.M.ester, mm(6, 12, 2), 0.01);  // C₆H₁₂O₂
  near(m.M.AcOH, mm(2, 4, 2), 0.01);    // C₂H₄O₂
  near(m.M.H2O, mm(0, 2, 1), 0.01);
});

test('количества методички согласуются с плотностями: 9,2 / 9,3 мл спирта ≈ 7,4 г, 11,5 мл AcOH ≈ 12,0 г', () => {
  near(m.ALC.n.V * m.ALC.n.d, 7.4, 0.06);
  near(m.ALC.i.V * m.ALC.i.d, 7.4, 0.06);
  near(11.5 * m.D_ACID, 12.0, 0.07);
  near(m.molAcid(11.5) / m.molAlc(9.2, 'n'), 2, 0.01); // двукратный избыток
});

test('литературные константы и фракции — как в методичке', () => {
  assert.deepEqual(m.ALC.n.frac, [122, 127]);
  assert.deepEqual(m.ALC.i.frac, [114, 119]);
  assert.equal(m.ALC.n.bpLit, '126');
  assert.equal(m.ALC.i.bpLit, '117–118');
  assert.equal(m.ALC.n.dEster, 0.882);
  assert.equal(m.ALC.i.dEster, 0.871);
  assert.equal(m.ALC.n.nD, 1.3941);
  assert.equal(m.ALC.i.nD, 1.3902);
  assert.ok(m.ALC.i.bp < m.ALC.n.bp);
});

test('опыт 3: 0,5 мл 10 % NaOH (d = 1,109) = 1,39 ммоль — избыток над 1 ммоль NH₃OH⁺ задаёт pH', () => {
  const nOH = (0.5 * 1.109 * 0.10) / 40.00 * 1000; // ммоль
  near(nOH, 1.386, 0.001);
  const V = 1.62;
  near(tubePH({ s: 'ester', nh: true, oh: true, v: V, hcl: 0 }), 14 + Math.log10((nOH - 1) / V), 0.01);
});

test('сцена загрузки колбы в опыте 2 подписывает изобутанол, а не н-бутанол', () => {
  const s = String(chargeScene({ kind: 'i', vAlc: 9.3, vAcid: 11.5, cat: 0 }, {}));
  assert.match(s, /изобутанол|isobutanol/);
  assert.doesNotMatch(s, /н-бутанол|n-butanol/);
});

test('теория: катализатор делает карбонильный углерод электрофильным (методичка, 3.2)', () => {
  const t = lab.theory[2];
  assert.match(t.ru, /электрофильным/);
  assert.match(t.en, /electrophilic enough/);
});

test('вывод по опытам 1–2 приводит литературные d²⁰ и nD²⁰', () => {
  const c = lab.report.experiments[1].conclusion({ lo: 123, hi: 126, yield: 60, cloudy: false, acid: false });
  assert.match(c.ru, /0\.882/);
  assert.match(c.ru, /1\.3941/);
  const c2 = lab.report.experiments[2].conclusion({ lo: 115, hi: 118, yield: 60, cloudy: false, acid: false });
  assert.match(c2.en, /0\.871/);
  assert.match(c2.en, /1\.3902/);
});

test('подсказка 3 шагов-процессов цитирует кнопки шага дословно (ru, kk, en)', async () => {
  const exps = lab.experiments;
  const labels = (s) => {
    const out = [];
    for (const c of s.controls || []) {
      if (c.label) out.push(c.label);
      if (c.labelOn) out.push(c.labelOn);
      for (const o of c.options || []) out.push(o[1]);
    }
    return out;
  };
  let checked = 0;
  for (const e of exps) for (const s of e.steps) {
    if (s.type !== 'process') continue;
    const h3 = s.hints[2];
    for (const l of ['ru', 'kk', 'en']) {
      const quoted = [...h3[l].matchAll(l === 'en' ? /“([^”]+)”/g : /«([^»]+)»/g)].map((m) => m[1]);
      const own = labels(s).map((x) => x[l]);
      for (const q of quoted) { assert.ok(own.some((x) => x.startsWith(q)), `опыт ${e.id}, шаг ${s.id}, ${l}: нет кнопки «${q}»`); checked++; }
    }
  }
  assert.ok(checked > 20);
});

test('работа 8: шаги после кипячения не падают, если кипячение закрыто без расчёта', async () => {
  const { ensureOrg } = await import('../labs/lab-08/model.js');
  const S = { vAlc: 9.2, vAcid: 11.5, cat: 0.5, char: false, org: null, ledger: null, reflux: null };
  ensureOrg(S, 'n');
  assert.ok(S.org && S.ledger, 'состояние восстановлено');
  for (const k of ['ester', 'alc', 'acid', 'water', 'heavy', 'h2so4']) assert.ok(Number.isFinite(S.org[k]), k);
  const before = S.org;
  ensureOrg(S, 'n');
  assert.equal(S.org, before, 'существующее состояние не перезаписывается');
});
