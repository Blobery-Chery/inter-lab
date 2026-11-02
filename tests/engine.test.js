// Ядро без DOM: генератор по seed, оценка, лабораторное время, замечания, подсказки, контрольные точки.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng, hashSeed } from '../app/rng.js';
import { gradeFor, summarize } from '../app/grading.js';
import { Runner, newRun, clockText } from '../app/engine.js';
import { setLang, num, tr, fixNums, pts } from '../app/i18n.js';
import { withinTol, parseNum } from '../app/steps/calc.js';

test('rng: одинаковый seed — одинаковая последовательность; состояние продолжается', () => {
  const a = createRng('lab/1/1'), b = createRng('lab/1/1');
  assert.deepEqual([a.next(), a.next()], [b.next(), b.next()]);
  const holder = { state: hashSeed('x') };
  const r1 = createRng(holder); r1.next();
  const saved = holder.state;
  const r2 = createRng({ state: saved });
  assert.equal(r1.next(), r2.next());
});

test('оценка по сумме баллов: 5 (≤1), 4 (≤3), 3 (≤5,5), 2 (>5,5)', () => {
  assert.equal(gradeFor(0), 5); assert.equal(gradeFor(1), 5); assert.equal(gradeFor(1.25), 4);
  assert.equal(gradeFor(3), 4); assert.equal(gradeFor(5.5), 3); assert.equal(gradeFor(5.75), 2);
  const s = summarize([{ points: 1 }, { points: 0.5 }], [{ level: 1 }, { level: 2 }, { level: 3 }], [{ points: 1 }]);
  assert.equal(s.points, 3.25); assert.equal(s.grade, 3);
});

test('числа: запятая для ru и kk, точка для en', () => {
  assert.equal(num(2.74, 2, 'kk'), '2,74'); assert.equal(num(2.74, 2, 'en'), '2.74');
  assert.equal(num(-1.5, 1, 'en'), '−1.5');
  assert.equal(fixNums('m = 2.74 g', 'ru'), 'm = 2,74 g');
  assert.equal(fixNums('(п. 3.2 правил ТБ), 2.5 мл', 'ru'), '(п. 3.2 правил ТБ), 2,5 мл');
  assert.equal(fixNums('пп. 6.3 и 12.1 правил', 'ru'), 'пп. 6.3 и 12.1 правил');
  assert.equal(fixNums('разделы 10.1–10.4; 1.5 мл', 'ru'), 'разделы 10.1–10.4; 1,5 мл');
  assert.equal(fixNums('ҚТ ережелерінің 2.4, 3-тармақтары; 9.3, 10.1-тармақтар; 0.5 мл', 'kk'), 'ҚТ ережелерінің 2.4, 3-тармақтары; 9.3, 10.1-тармақтар; 0,5 мл');
  assert.equal(tr({ ru: '2.0 г', kk: '2.0 г', en: '2.0 g' }, 'en'), '2.0 g');
  assert.equal(pts(0.5, 'ru'), '0,5'); assert.equal(pts(1, 'ru'), '1'); assert.equal(pts(0.25, 'en'), '0.25');
});

test('calc: допуск 1 %, ввод с запятой', () => {
  assert.equal(parseNum('2,74'), 2.74);
  assert.ok(withinTol(2.74, 2.7376)); assert.ok(!withinTol(2.80, 2.7376));
});

function miniLab() {
  return {
    id: 'lab-x', experiments: [{
      id: '1', title: { ru: 'x', kk: 'x', en: 'x' }, checkpoints: [0, 2],
      initialState: () => ({ v: 0 }),
      steps: [0, 1, 2, 3].map((i) => ({ type: 'quiz', title: { ru: 's' + i, kk: 's' + i, en: 's' + i } })),
      results: (S) => ({ v: S.v }),
    }],
  };
}

test('лабораторное время: «День 1 · 09:00», сутки → «День 2»', () => {
  setLang('ru');
  assert.equal(clockText(0), 'День 1 · 09:00');
  assert.equal(clockText(15 * 60), 'День 1 · 09:15');
  assert.equal(clockText(86400), 'День 2 · 09:00');
});

test('Runner: замечания без повторов, подсказки 1–3, авария и перезапуск с контрольной точки', () => {
  const lab = miniLab(), exp = lab.experiments[0];
  const progress = { runs: {}, attempts: {}, results: {}, clock: 0 };
  const run = newRun(lab, exp, progress, 'dev');
  let failed = null;
  const r = new Runner({ lab, exp, progress, run, hooks: { onFail: (x) => (failed = x) }, types: {} });
  assert.ok(r.remark({ key: 'a', severity: 'minor', text: { ru: 'a', kk: 'a', en: 'a' } }));
  assert.ok(!r.remark({ key: 'a', severity: 'minor', text: { ru: 'a', kk: 'a', en: 'a' } }));
  assert.equal(run.remarks[0].points, 0.5);
  assert.equal(r.takeHint(), 1); assert.equal(r.takeHint(), 2); assert.equal(r.takeHint(), 3); assert.equal(r.takeHint(), 0);
  r.solve(); r.next(); r.solve(); r.next(); // → шаг 2 (контрольная точка)
  run.state.v = 5; r.solve(); r.next();    // шаг 3
  run.state.v = 9;
  r.remark({ key: 'boom', severity: 'critical', text: { ru: 'b', kk: 'b', en: 'b' } });
  assert.ok(failed); assert.equal(run.status, 'failed');
  r.restart();
  assert.equal(run.step, 2); assert.equal(run.status, 'active'); assert.equal(run.state.v, 0);
  assert.equal(run.remarks.length, 2, 'замечания сохраняются после перезапуска');
  r.advance(3600); assert.ok(run.t >= 3600);
  r.solve(); r.next(); r.solve(); r.next();
  assert.equal(run.status, 'done'); assert.deepEqual(progress.results['1'], { v: 0 });
});
