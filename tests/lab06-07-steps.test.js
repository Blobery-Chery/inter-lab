// Поведение шагов работы 6–7, найденное при сквозной проверке (сессия Q).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import exp1 from '../labs/lab-06-07/exp1.js';

const nitr = exp1.steps.find((s) => s.id === 'nitr');
const ctx = { now: () => 0, remark() {}, log() {} };
const base = () => ({ T: 12, Tb: -5, bath: { ice: true, salt: true, in: true }, nit: { drops: 0, maxT: -99, E: 0, t0: 0, t1: null, hot: 0 } });

test('нитрование: колба в бане остывает до температуры бани', () => {
  const S = base(), lc = { pend: 0, c: { stir: true } };
  for (let i = 0; i < 300; i++) nitr.tick(S, lc, 1, ctx);
  assert.ok(S.T < 0, 'T = ' + S.T);
});

test('нитрование: событие «вынуть колбу из бани» — колба больше не охлаждается баней', () => {
  const ev = nitr.events.find((e) => e.id === 'fumes');
  const out = ev.options.find((o) => o.ok === false && o.label.ru.startsWith('Вынуть колбу'));
  const S = base(), lc = { pend: 0, c: { stir: true } };
  out.effect(S, lc);
  assert.equal(S.bath.in, false);
  const T0 = S.T;
  for (let i = 0; i < 300; i++) nitr.tick(S, lc, 1, ctx);
  assert.ok(S.T >= T0 - 0.01, `вне бани температура не должна падать к бане: ${T0} → ${S.T}`);
  assert.ok(nitr.alerts(S), 'есть предупреждение «колба вне бани»');
  // кнопка «Вернуть колбу в баню» доступна и возвращает охлаждение
  const back = nitr.controls.find((c) => c.id === 'back');
  assert.equal(back.disabled(S), false);
  back.do(S);
  assert.equal(back.disabled(S), true);
  for (let i = 0; i < 300; i++) nitr.tick(S, lc, 1, ctx);
  assert.ok(S.T < T0, 'в бане снова остывает');
});

test('шаги-процессы и пробы работы 6–7 имеют свои подсказки трёх уровней (не общие фразы типа)', async () => {
  const lab = (await import('../labs/lab-06-07/lab.js')).default;
  for (const e of lab.experiments) for (const s of e.steps) {
    if (!['process', 'add', 'test'].includes(s.type) || s.type === 'add') continue;
    assert.equal((s.hints || []).length, 3, `опыт ${e.id}, шаг ${s.id}`);
    for (const x of s.hints) for (const l of ['ru', 'kk', 'en']) assert.ok(x[l] && x[l].length > 20, `опыт ${e.id}, шаг ${s.id}, ${l}`);
  }
});
