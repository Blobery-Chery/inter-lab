// Расчётные функции работы 6–7 на эталонных данных методички.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { theoretical, percentYield, makeCrude, makeFin, mpRange, pHcalc, washPH, lossBreakdown } from '../labs/lab-06-07/model.js';

test('теоретический выход м-нитробензойной кислоты из 2,0 г = 2,74 г', () => {
  assert.equal(theoretical(2.0).toFixed(2), '2.74');
  assert.equal(percentYield(1.3685, 2.0).toFixed(1), '50.0');
});

function run(overrides = {}) {
  const S = { mBA: 2.0, hold: { bath: 600, room: 600 }, nit: { E: 0 }, pour: { loss: 0 }, filt: { tloss: 0, loss: 0.04, pH: 3 }, mixHot: false, ...overrides };
  makeCrude(S);
  S.rec = { V: 70, full: true, shock: false, ...(overrides.rec || {}) };
  makeFin(S);
  return S;
}

test('всё верно → выход и т. пл. в диапазоне методички', () => {
  const S = run();
  const y = percentYield(S.fin.m, S.mBA);
  assert.ok(y > 50 && y < 85, 'выход ' + y);
  const m = mpRange(S.fin.purity, 0.003, 2.5, true);
  assert.ok(m.on >= 138.5 && m.end <= 141.5, JSON.stringify(m));
});

test('перегрев при нитровании → больше примесей, т. пл. ниже (отложенное последствие)', () => {
  const ok = run(), hot = run({ nit: { E: 4000 } });
  assert.ok(hot.fin.purity < ok.fin.purity);
  assert.ok(mpRange(hot.fin.purity, 0, 2.5, true).on < mpRange(ok.fin.purity, 0, 2.5, true).on);
});

test('лишняя вода при перекристаллизации → меньше выход', () => {
  assert.ok(run({ rec: { V: 150 } }).fin.m < run({ rec: { V: 70 } }).fin.m);
});

test('pH: раствор соли щелочной, при подкислении выпадает кислота', () => {
  const C0 = 0.1 / 167.12 * 1000;
  assert.ok(pHcalc(4.16, C0, 1.5).pH > 12);
  const acid = pHcalc(4.16 - 0.1436 * 31, C0, 1.5 + 0.05 * 31);
  assert.ok(acid.pH < 3 && acid.ppt > 0.3 * C0);
  assert.ok(washPH(0) < 1 && washPH(4) > 2.5);
});

test('диаграмма потерь: сумма долей = 1', () => {
  const S = run();
  const parts = lossBreakdown(S);
  assert.ok(Math.abs(parts.reduce((a, p) => a + p.frac, 0) - 1) < 1e-9);
  assert.equal(parts[0].id, 'product');
});
