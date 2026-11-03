// Модель работы 14 (метиловый оранжевый): расчёты на данных методички и последствия ошибок.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { theoretical, percentYield, hclMmol, naohMmol, mixOnIce, mixPH, acidInventory, acidFraction, coupled, makeFin, lossBreakdown, decompRate, solubility } from '../labs/lab-14/model.js';
import { tubePH } from '../labs/lab-14/exp2.js';

test('теоретический выход из 1,73 г сульфаниловой кислоты = 3,27 г (методичка)', () => {
  assert.equal(theoretical(1.73).toFixed(2), '3.27');
  assert.equal(percentYield(theoretical(1.73) / 2, 1.73).toFixed(1), '50.0');
});

test('2 мл конц. HCl — небольшой избыток над 2 моль на моль амина', () => {
  const h = hclMmol(2);
  assert.ok(h > 21 && h < 25, String(h));
});

test('10 г льда удерживают смесь при 0–5 °C; без льда и с тёплым раствором — нет', () => {
  assert.ok(mixOnIce(25, 22, 10).T <= 5);
  assert.ok(mixOnIce(25, 22, 0).T > 15);
  assert.ok(mixOnIce(25, 60, 10).T > mixOnIce(25, 22, 10).T);
});

test('разложение диазония: при 20 °C в разы быстрее, чем при 5 °C', () => {
  assert.ok(decompRate(20) / decompRate(5) > 5);
});

function run(o = {}) {
  const S = {
    mSA: 1.73, mNit: 0.75, vWater: 20, vHCl: 2, vDMA: 1.3, vAcOH: 1, luck: 0,
    dz: { conv: 0.96, D: 0.01, excess: 0.0012, ...(o.dz || {}) },
    cp: { medium: 'acid', stirred: true, time: 600, ...(o.cp || {}) },
    alk: { V: 13, pH: 12, ...(o.alk || {}) }, vTot: 50,
    iso: { nacl: 5, boilOver: 0, Tfilt: 3, ...(o.iso || {}) },
    filt: { loss: 0, washLoss: 0.006, brine: true, acidWash: false, ...(o.filt || {}) },
  };
  S.cp.nDye = coupled(S);
  makeFin(S);
  return S;
}

test('всё верно → выход 70–95 % (теор. 3,27 г)', () => {
  const S = run();
  const y = percentYield(S.fin.m, S.mSA);
  assert.ok(y > 70 && y < 95, 'выход ' + y);
  const parts = lossBreakdown(S);
  assert.ok(Math.abs(parts.reduce((a, p) => a + p.frac, 0) - 1) < 1e-9);
});

test('отложенные последствия: тёплое диазотирование, щелочная среда сочетания, промывка водой, без NaCl — выход ниже', () => {
  const ok = run().fin.m;
  assert.ok(run({ dz: { D: 0.4 } }).fin.m < ok * 0.75);
  assert.ok(run({ cp: { medium: 'alk' } }).fin.m < ok * 0.4);
  assert.ok(run({ filt: { washLoss: 0.1, brine: false } }).fin.m < ok * 0.92);
  assert.ok(run({ iso: { nacl: 0 } }).fin.m < ok * 0.92);
  assert.ok(run({ alk: { pH: 5 } }).fin.acidFrac > 0.2);
});

test('pH: до щёлочи смесь сильнокислая (красная), щелочной становится около 11–13 мл 10 % NaOH', () => {
  const S = run();
  const inv = (V) => ({ ...acidInventory(S), naoh: naohMmol(V) });
  const p0 = mixPH(inv(0), 37);
  assert.ok(p0 < 2.5 && acidFraction(p0) > 0.9, 'pH0 ' + p0);
  assert.ok(mixPH(inv(8), 45) < 7);
  const p13 = mixPH(inv(13), 50);
  assert.ok(p13 > 10, 'pH(13 мл) ' + p13);
});

test('растворимость красителя: при кипении велика, с NaCl на холоду мала', () => {
  assert.ok(solubility(100) * 0.05 > 2.5);
  assert.ok(solubility(3, 100) * 0.05 < 0.05);
});

test('опыт 2: 2 мл красителя + 1 мл 0,1 М HCl → pH ≈ 1,5; + 1 мл NaOH → ≈ 12,5', () => {
  assert.ok(Math.abs(tubePH({ acid: 0.1, V: 3 }, 6.5) - 1.48) < 0.05);
  assert.ok(Math.abs(tubePH({ acid: -0.1, V: 3 }, 6.5) - 12.52) < 0.05);
  assert.equal(tubePH({ acid: 0, V: 3 }, 6.5), 6.5);
});
