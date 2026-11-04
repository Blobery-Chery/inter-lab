// Сверка работы 6–7 с методичкой (сессия C1): числа, исправленные при проверке, и константы методички.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { M, DROP, pHcalc, theoretical } from '../labs/lab-06-07/model.js';
import exp1 from '../labs/lab-06-07/exp1.js';
import exp2 from '../labs/lab-06-07/exp2.js';
import bank from '../labs/lab-06-07/admission.js';

const A = { C: 12.011, H: 1.008, N: 14.007, O: 15.999 };
const mm = (f) => Object.entries(f).reduce((s, [el, k]) => s + A[el] * k, 0);

test('молярные массы по атомным массам ИЮПАК совпадают с методичкой', () => {
  assert.equal(mm({ C: 7, H: 6, O: 2 }).toFixed(2), M.BA.toFixed(2));        // бензойная кислота
  assert.equal(mm({ C: 7, H: 5, N: 1, O: 4 }).toFixed(2), M.NBA.toFixed(2)); // м-нитробензойная, 167,12
  assert.equal(mm({ C: 7, H: 4, N: 2, O: 6 }).toFixed(2), M.DNBA.toFixed(2)); // 3,5-динитробензойная
  assert.equal(((2.0 / M.BA) * 1000).toFixed(1), '16.4');
  assert.equal(theoretical(2.0).toFixed(2), '2.74');
});

test('капля 0,05 мл: количество вещества с учётом плотности (1 % HCl — 0,0138, а не 0,0144 ммоль)', () => {
  assert.equal(DROP.HCl10.toFixed(4), ((0.05 * 1.047 * 0.10) / 36.46 * 1000).toFixed(4));
  assert.equal(DROP.HCl1.toFixed(4), ((0.05 * 1.003 * 0.01) / 36.46 * 1000).toFixed(4));
  assert.equal(DROP.HCl1.toFixed(4), '0.0138');
  assert.equal(DROP.NaOH10.toFixed(4), ((0.05 * 1.109 * 0.10) / 40.0 * 1000).toFixed(4));
});

test('проба с FeCl₃: кнопка «HCl 1 %» прибавляет 0,0138 ммоль', () => {
  const t3 = exp2.steps.find((s) => s.id === 'fecl3');
  const h1 = t3.reagents.find((r) => r.id === 'h1');
  const t = { dis: true, net: 0.1, C0: 0.18, V: 0.3, v: 0.5 };
  h1.apply(t, {}, { feedback() {} });
  assert.ok(Math.abs(0.1 - t.net - 0.01375) < 1e-9, 'Δn = ' + (0.1 - t.net));
});

test('соль и её разложение: около 30 капель 10 % HCl дают pH 1–2 и осадок (как в подсказке)', () => {
  const C0 = (0.1 / M.NBA) * 1000, net0 = (1.5 * DROP.NaOH10) / 0.05;
  const r = pHcalc(net0 - DROP.HCl10 * 30, C0, 1.5 + 0.05 * 30);
  assert.ok(r.pH >= 1 && r.pH <= 2, 'pH ' + r.pH);
  assert.ok(r.ppt > 0.3 * C0);
});

test('промывание осадка щёлочью: промывные воды щелочные (pH ≥ 8), текст не противоречит pH', () => {
  const filt = exp1.steps.find((s) => s.id === 'filt');
  const p = filt.washings({}, { naohUsed: true });
  assert.ok(p >= 8, 'pH ' + p);
  assert.match(filt.washFeedback(p).ru, /щелочные/);
});

test('допуск: в каждом вопросе ровно один верный ответ и четыре варианта', () => {
  for (const q of bank) {
    assert.equal(q.options.length, 4, q.q.ru);
    assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length, q.q.ru);
    const texts = q.options.map((o) => (typeof o === 'string' ? o : o.ru));
    assert.equal(new Set(texts).size, texts.length, 'повторяющиеся варианты: ' + q.q.ru);
  }
  const role = bank.find((q) => q.q.ru.startsWith('Какова роль концентрированной серной'));
  assert.ok(!role.options.some((o) => /Сульфирует/.test(o.ru)), 'спорный вариант (ипсо-замещение) убран');
});
