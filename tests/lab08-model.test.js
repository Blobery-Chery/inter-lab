// Работа № 8: модель этерификации, промывок, сушки и перегонки; гидроксамовая проба; переводы.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isTri } from '../app/i18n.js';
import * as m from '../labs/lab-08/model.js';
import { tubePH } from '../labs/lab-08/exp3.js';
import lab from '../labs/lab-08/lab.js';

const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b} (±${tol})`);

test('равновесие этерификации при K = 4 (индивидуальное задание)', () => {
  near(m.eqConversion(1), 2 / 3, 1e-9);
  near(m.eqConversion(2), 0.8453, 1e-4);
  assert.ok(m.eqConversion(3) > m.eqConversion(2));
});

test('теоретический выход по методичке: 0,10 моль спирта → 11,6 г эфира', () => {
  near(m.theoretical(0.10), 11.6, 0.02);
  near(m.molAlc(9.2, 'n'), 0.1005, 0.0005);
  near(m.molAlc(9.3, 'i'), 0.1006, 0.0005);
  near(m.molAcid(11.5), 0.2009, 0.0005);
  near(m.percentYield(5.808, 0.10), 50, 0.01);
});

/** Верная обработка: 50 мин кипячения → вода → NaHCO₃ до прекращения CO₂ → NaCl → сушка → перегонка «средне». */
function ideal(kind, opt = {}) {
  const S = { vAlc: m.ALC[kind].V, vAcid: opt.vAcid ?? 11.5, cat: 0.5, reflux: { t: opt.t ?? 3000, vap: 0, bump: 0 }, char: false };
  const { org: o, x } = m.afterReflux(S, kind);
  m.washWater(o, 20);
  let portions = 0;
  if (!opt.noBicarb) for (; portions < 6; portions++) { const r = m.washBicarb(o, 15); if (r.co2 < 0.5) break; }
  m.washBrine(o, 10);
  o.water = Math.max(0.012, o.water - m.dryCapacity(1.5, 900));
  const L = { water: o.water, alc: o.alc, acid: o.acid, ester: o.ester, heavy: o.heavy };
  const [lo, hi] = m.ALC[kind].frac;
  const main = {}, fore = {};
  let rec = 'fore', Tlo = 999, Thi = 0;
  while (m.liquidMass(L) > 0.8) {
    const T = m.thermoShown(L, kind, 1, 'ok');
    if (rec === 'fore' && T >= lo) rec = 'main';
    if (T > hi + 0.5) break;
    m.addTo(rec === 'main' ? main : fore, m.distil(L, 0.035, kind, 1));
    if (rec === 'main') { Tlo = Math.min(Tlo, T); Thi = Math.max(Thi, T); }
  }
  return { x, portions, main, fore, Tlo, Thi, nA: m.molAlc(S.vAlc, kind) };
}

for (const kind of ['n', 'i']) {
  test(`верная работа (${kind}): фракция в пределах методички, выход 55–75 %, чистота > 90 %`, () => {
    const r = ideal(kind);
    const [lo, hi] = m.ALC[kind].frac;
    assert.ok(r.x > 0.78 && r.x < 0.85, 'степень превращения ' + r.x);
    assert.ok(r.portions >= 1 && r.portions <= 3, 'порций NaHCO₃ ' + r.portions);
    assert.ok(r.Tlo >= lo - 0.5 && r.Thi <= hi + 0.5, `фракция ${r.Tlo}–${r.Thi}`);
    const y = m.percentYield(m.liquidMass(r.main), r.nA);
    assert.ok(y > 55 && y < 75, 'выход ' + y);
    assert.ok(m.purity(r.main) > 0.9, 'чистота ' + m.purity(r.main));
    near(r.main.acid || 0, 0, 0.01);
  });
}

test('отложенные последствия: без NaHCO₃ кислота в продукте; короткое кипячение и мало кислоты снижают превращение', () => {
  const bad = ideal('n', { noBicarb: true });
  assert.ok((bad.main.acid || 0) > 0.04, 'кислота в основной фракции ' + bad.main.acid);
  assert.ok(ideal('n', { t: 900 }).x < ideal('n').x - 0.15);
  assert.ok(ideal('n', { vAcid: 6 }).x < ideal('n').x - 0.05);
});

test('термометр не на уровне отвода даёт смещённые показания', () => {
  const L = { water: 0.01, alc: 0.4, acid: 0, ester: 8, heavy: 0.1 };
  const ok = m.thermoShown(L, 'n', 1, 'ok');
  assert.ok(m.thermoShown(L, 'n', 1, 'low') > ok + 2);
  assert.ok(m.thermoShown(L, 'n', 1, 'high') < ok - 5);
});

test('гидроксамовая проба: pH щелочной после NaOH, кислый после ~30 капель 1 М HCl', () => {
  const t = { s: 'ester', nh: true, oh: true, v: 1.62, hcl: 0 };
  assert.ok(tubePH(t) > 12);
  t.hcl = 20; t.v += 1; assert.ok(tubePH(t) >= 5, 'буфер NH₂OH/NH₃OH⁺');
  t.hcl = 30; t.v += 0.5; assert.ok(tubePH(t) < 5);
});

test('«куда делся продукт»: доли в сумме 1', () => {
  const S = { vAlc: 9.2, vAcid: 11.5, cat: 0.5, reflux: { t: 3000, vap: 0.05, bump: 0 }, char: false };
  const { ledger } = m.afterReflux(S, 'n');
  ledger.wash = 0.5; ledger.drying = 0.15; ledger.fore = 0.4; ledger.residue = 0.6; ledger.holdup = 0.25;
  const parts = m.lossBreakdown(ledger, 7.2);
  near(parts.reduce((a, p) => a + p.frac, 0), 1, 1e-9);
  assert.ok(parts.find((p) => p.id === 'product').frac > 0.55);
});

test('работа 8: казахские фразы не совпадают с русскими', () => {
  const same = [], seen = new Set();
  (function w(x, p) {
    if (!x || typeof x !== 'object' || seen.has(x)) return; seen.add(x);
    if (isTri(x)) { if ((x.ru.match(/[а-яё]{3,}/gi) || []).length >= 4 && x.ru === x.kk) same.push(p + ': ' + x.ru.slice(0, 40)); return; }
    for (const [k, v] of Object.entries(x)) w(v, p + '.' + k);
  })(lab, 'lab');
  assert.deepEqual(same, []);
  assert.equal(lab.status, 'ready');
  assert.ok(lab.admission.bank.length >= 15);
});
