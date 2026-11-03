// Работа № 9: расчётные функции модели на данных методички и проверка переводов.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isTri } from '../app/i18n.js';
import {
  theoretical, percentYield, anilineMmol, hclMmol, nitriteMmol, nitriteDrop, starchIodide, couplingFrac,
  alkaliPH, phenolInOrg, freeAcid, vapourT, distilPortion, kHyd, kIod, lossBreakdown,
} from '../labs/lab-09/model.js';

test('теоретический выход иодбензола из 25 ммоль анилина = 5,1 г (методичка)', () => {
  assert.equal(theoretical(25).toFixed(1), '5.1');
  assert.equal(percentYield(theoretical(25) / 2, 25).toFixed(1), '50.0');
});

test('количества методички: 2,3 мл анилина = 25 ммоль, 6,5 мл HCl ≈ 3 экв., 1,8 г NaNO₂ = 26 ммоль', () => {
  assert.equal(Math.round(anilineMmol(2.3)), 25);
  const r = hclMmol(6.5) / anilineMmol(2.3);
  assert.ok(r >= 2.5 && r <= 3.2, 'экв. HCl ' + r);
  assert.equal(Math.round(nitriteMmol(1.8)), 26);
});

test('диазотирование при 0–5 °C: иодкрахмальная проба синеет только в конце', () => {
  const D = { A: anilineMmol(2.3), Dz: 0, P: 0, N: 0, lostN: 0 };
  const dn = nitriteMmol(1.8) / 60;
  let firstBlue = null;
  for (let i = 1; i <= 60; i++) { nitriteDrop(D, dn, 2); if (firstBlue == null && starchIodide(D.N) === 'blue') firstBlue = i; }
  assert.ok(firstBlue >= 56 && firstBlue <= 60, 'синеет на капле ' + firstBlue);
  assert.ok(D.Dz > 24.5 && D.A < 0.01, JSON.stringify(D));
});

test('перегрев при диазотировании → потери HNO₂ и соли диазония (отложенное последствие)', () => {
  const cold = { A: 25, Dz: 0, P: 0, N: 0, lostN: 0 }, hot = { A: 25, Dz: 0, P: 0, N: 0, lostN: 0 };
  for (let i = 0; i < 60; i++) { nitriteDrop(cold, 26 / 60, 3); nitriteDrop(hot, 26 / 60, 15); }
  assert.ok(hot.Dz < cold.Dz - 2, `${hot.Dz} vs ${cold.Dz}`);
  assert.ok(hot.lostN > 0 && hot.P > 0);
  assert.equal(starchIodide(hot.N), 'none', 'нитрита не хватило — проба не синеет');
});

test('недостаток кислоты → сочетание с амином; при 2,5–3 экв. сочетания нет', () => {
  assert.equal(couplingFrac(3.0), 0);
  assert.ok(couplingFrac(1.8) > 0.2);
});

test('разложение соли диазония: медленно при 0–5 °C, быстро при 60–70 °C; иодид быстрее воды', () => {
  assert.ok(kHyd(3) * 3600 < 0.01);
  assert.ok(kHyd(65) * 600 > 0.5);
  assert.ok(kIod(65) > 5 * kHyd(65));
});

test('подщелачивание: 15 мл 10 % NaOH → pH ≥ 12 (фенол в водном слое), 5 мл — кислая среда', () => {
  const H = freeAcid(75.7, 25, 26, 1.5) * 0.85, P = 1.5, V = 25;
  assert.ok(alkaliPH(15, H, P, V) >= 12);
  assert.ok(alkaliPH(5, H, P, V) < 7);
  assert.ok(phenolInOrg(13) < 0.1 && phenolInOrg(2) > 0.5);
});

test('перегонка: влажный продукт кипит ≈ 98 °C, затем 185–188 °C; фенол понижает т. кип.', () => {
  assert.equal(vapourT({ w: 0.05, p: 0, i: 4 }), 98.5);
  assert.equal(vapourT({ w: 0, p: 0, i: 4 }), 188);
  assert.ok(vapourT({ w: 0, p: 0.4, i: 3.6 }) < 188);
  const liq = { w: 0.02, p: 0.05, i: 4 };
  const a = distilPortion(liq, 0.03);
  assert.ok(a.w > 0.019 && a.i < 0.02, 'сначала уходит вода');
  let main = 0;
  while (liq.i + liq.p > 0.2) main += distilPortion(liq, 0.05).i;
  assert.ok(main > 3.7);
});

test('разбор потерь: доли в сумме дают 1', () => {
  const L = lossBreakdown({ nAn: 25, portions: 3.5, coupled: 0.2, phenolDiaz: 0.2, phenolKI: 1.2, unreacted: 0, foam: 0, funnel: 0.35, washes: 0, fore: 0.1, residue: 0.25, product: 3.1 });
  assert.equal(Math.round(L.reduce((a, p) => a + p.frac, 0) * 1e6), 1e6);
  assert.ok(L.find((p) => p.id === 'product').frac > 0.5);
});

test('работа 9: казахские фразы переведены (не совпадают с русскими)', async () => {
  const lab = (await import('../labs/lab-09/lab.js')).default;
  const same = [];
  const seen = new Set();
  (function w(x, p) {
    if (!x || typeof x !== 'object' || seen.has(x)) return; seen.add(x);
    if (isTri(x)) { if ((x.ru.match(/[а-яё]{3,}/gi) || []).length >= 4 && x.ru === x.kk) same.push(p + ': ' + x.ru.slice(0, 40)); return; }
    for (const [k, v] of Object.entries(x)) w(v, p + '.' + k);
  })(lab, 'lab');
  assert.deepEqual(same, []);
});
