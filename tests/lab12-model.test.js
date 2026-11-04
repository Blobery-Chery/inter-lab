// Расчёты и модель работы № 12 на эталонных данных методички (docs/source/labs/lab-12.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isTri } from '../app/i18n.js';
import { specificRotation, concentration, opticalPurity, percentS, percentR, eeFromAmounts, sucroseAlpha, crystallise, liberation, extracted, resolveAmine, neatAlpha, MAX_ONE, D_AMINE, M } from '../labs/lab-12/model.js';

test('сахароза: c = 0,10 г/мл, l = 2 дм → α ≈ +13,3°, [α] = +66,5° (методичка, опыт 1)', () => {
  const a = sucroseAlpha(0.10, 2);
  assert.equal(a.toFixed(1), '13.3');
  assert.equal(specificRotation(a, 2, 0.10).toFixed(1), '66.5');
  assert.equal(concentration(6.65, 66.5, 2).toFixed(3), '0.050');
});

test('вопросы для самоконтроля 9 и 10', () => {
  assert.equal(specificRotation(2.1, 1, 0.05).toFixed(0), '42');
  const op = opticalPurity(-32, -40);
  assert.equal(op, 80);
  assert.equal(percentS(op), 90);
  assert.equal(percentR(op), 10);
  assert.equal(eeFromAmounts(90, 10), 80);
});

test('максимум одного энантиомера — 1,55 г из 3,1 г рацемата', () => {
  assert.equal(((3.3 * D_AMINE) / 2).toFixed(2), '1.57');   // 3,3 мл × 0,95 = 3,1 г
  assert.equal(MAX_ONE, 1.55);
  assert.equal(((3.9 / M.ta) * 1000).toFixed(0), '26');
});

test('неополоснутая трубка занижает [α] сахарозы (отложенное последствие)', () => {
  assert.ok(specificRotation(sucroseAlpha(0.10, 2, { dil: 0.03 }), 2, 0.10) < 65);
  assert.ok(sucroseAlpha(0.05, 2, { mixStd: 0.04 }) > sucroseAlpha(0.05, 2));
});

const good = () => ({ base: { fS: 0.75, fR: 0.08 }, mTA: 3.9, vMeOH: 55, vAmine: 3.3, cryst: 'slow', hours: 24, washLoss: 0.03, vNaOH: 3, vWater: 15, portions: [10, 10], dry: 'na2so4' });

test('всё верно → умеренная–высокая оптическая чистота и масса амина < 1,55 г (методичка, опыт 3)', () => {
  const r = resolveAmine(good());
  assert.ok(r.mAmine > 0.9 && r.mAmine < MAX_ONE, 'масса ' + r.mAmine);
  assert.ok(r.ee > 70 && r.ee < 95, 'ee ' + r.ee);
  const a = neatAlpha(r.ee, 1, r.wDil);
  assert.ok(a < -25 && a > -38, 'α ' + a);
  assert.ok(Math.abs(r.losses.reduce((s, p) => s + p.frac, 0) - 1) < 1e-9);
  assert.equal(r.losses[0].id, 'product');
});

test('ошибки кристаллизации понижают оптическую чистоту', () => {
  const ok = resolveAmine(good()).ee;
  assert.ok(resolveAmine({ ...good(), cryst: 'ice' }).ee < ok - 20);
  assert.ok(resolveAmine({ ...good(), needlesKept: true }).ee < ok - 10);
  assert.ok(resolveAmine({ ...good(), cryst: 'disturbed' }).ee < ok);
  assert.ok(crystallise({ ...good(), hours: 2 }).nS < crystallise(good()).nS * 0.6);
});

test('мало щёлочи, одна экстракция, CaCl₂ → меньше амина; без сушки → амин «разбавлен» водой', () => {
  const m = resolveAmine(good()).mPure;
  assert.ok(resolveAmine({ ...good(), vNaOH: 0.5 }).mPure < m * 0.2);
  assert.ok(resolveAmine({ ...good(), portions: [10] }).mPure < m);
  assert.ok(resolveAmine({ ...good(), dry: 'cacl2' }).mPure < m * 0.8);
  const wet = resolveAmine({ ...good(), dry: 'none' });
  assert.ok(wet.wDil > 0.03 && wet.mAmine > wet.mPure);
  assert.ok(Math.abs(neatAlpha(wet.ee, 1, wet.wDil)) < Math.abs(neatAlpha(wet.ee, 1, 0)));
});

test('pH: без щёлочи раствор соли кислый, 3 мл 50 % NaOH — сильнощелочной', () => {
  const nSalt = 10;
  assert.ok(liberation(nSalt, 0).pH < 5);
  const l = liberation(nSalt, 3);
  assert.ok(l.pH >= 13 && l.free > 0.999);
  assert.ok(extracted([10, 10], 18) > extracted([20], 18));
});

test('работа 12: казахские фразы не совпадают с русскими', async () => {
  const lab = (await import('../labs/lab-12/lab.js')).default;
  const same = [], seen = new Set();
  (function w(x, p) {
    if (!x || typeof x !== 'object' || seen.has(x)) return; seen.add(x);
    if (isTri(x)) { if ((x.ru.match(/[а-яё]{3,}/gi) || []).length >= 4 && x.ru === x.kk) same.push(p + ': ' + x.ru.slice(0, 40)); return; }
    for (const [k, v] of Object.entries(x)) w(v, p + '.' + k);
  })(lab, 'lab');
  assert.deepEqual(same, []);
});

test('работа 12: свой тип шага на трёх языках и подключён', async () => {
  const lab = (await import('../labs/lab-12/lab.js')).default;
  const t = (await import('../labs/lab-12/steps/polarimeter.js')).default;
  assert.equal(t.type, 'lab12-polarimeter');
  const types = new Set(lab.experiments.flatMap((e) => e.steps.map((s) => s.type)));
  assert.ok(types.has('lab12-polarimeter'));
  assert.ok(lab.customSteps.includes('./steps/polarimeter.js'));
});
