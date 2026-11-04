// Работа № 11: сверка с методичкой (сессия C2) — числа, закреплённые после проверки.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { glycinate, fohl, CONC, DROP } from '../labs/lab-11/model.js';
import exp1 from '../labs/lab-11/exp1.js';
import exp2 from '../labs/lab-11/exp2.js';
import exp6 from '../labs/lab-11/exp6.js';
import lab from '../labs/lab-11/lab.js';

test('концентрации реактивов (ASSUMPTIONS.md) согласованы с массовыми долями методички', () => {
  // 1 % глицин: 10 г/л / 75,07 г/моль
  assert.ok(Math.abs(CONC.gly - 10 / 75.07) < 0.002);
  // 6 капель конц. HNO₃ ≈ 4,3 ммоль; 1 капля 30 % NaOH ≈ 0,5 ммоль → щелочная среда после 9 капель
  assert.ok(Math.abs(6 * DROP * CONC.hno3 - 4.32) < 0.05);
  assert.ok(Math.abs(DROP * CONC.naoh30 - 0.5) < 0.01);
  assert.ok(9 * DROP * CONC.naoh30 > 6 * DROP * CONC.hno3 && 8 * DROP * CONC.naoh30 < 6 * DROP * CONC.hno3);
});

test('опыт 1: порог частичного растворения Cu(OH)₂ — от 8 капель CuSO₄ на 1 мл глицина (ASSUMPTIONS.md)', () => {
  const k = (cu, gly) => glycinate({ cu, oh: 4, gly, shaken: true }).key;
  assert.equal(k(3, 1), 'dissolved');
  assert.equal(k(7, 1), 'dissolved');
  assert.equal(k(8, 1), 'partial');
  assert.equal(k(14, 2), 'dissolved');
  assert.equal(k(15, 2), 'partial');
});

test('опыт 5: пороги осадка PbS по времени кипячения (ASSUMPTIONS.md)', () => {
  const k = (s) => fohl({ sub: 'egg', oh: 1, pb: 3 }, s).key;
  assert.equal(k(17), 'none');
  assert.equal(k(18), 'trace');
  assert.equal(k(47), 'trace');
  assert.equal(k(48), 'brown');
  assert.equal(k(106), 'brown');
  assert.equal(k(107), 'black');
  assert.equal(k(150), 'black'); // 2,5 мин — середина диапазона методички 2–3 мин
});

test('тексты: нет противоречия «α-аминогруппы … ε-NH₂», нет устаревшего «асбестового полотна»', () => {
  const s2 = JSON.stringify(exp2) + JSON.stringify(lab.report.experiments[2].conclusion({ gly: 'strong', egg: 'strong' }));
  assert.ok(!/α-аминогруппы глицина и белка \(N-концевые остатки, ε/.test(s2));
  const ninhWhy = exp2.steps[1].observe.why({}, { g: { key: 'strong' }, e: { key: 'strong' } });
  assert.ok(ninhWhy.ru.includes('ε-NH₂') && ninhWhy.en.includes('ε-NH₂') && ninhWhy.kk.includes('ε-NH₂'));
  assert.ok(!/асбест/i.test(JSON.stringify(exp6)));
  assert.ok(!/не растворит\.'|will not dissolve excess CuSO₄/.test(JSON.stringify(exp1)));
});
