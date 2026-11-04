// Работа № 12: исправления по сверке с методичкой (сессия C2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveAmine, crystallise, M } from '../labs/lab-12/model.js';

const worst = { base: { fS: 0.66, fR: 0.09 }, mTA: 3.9, vMeOH: 45, lostMeOH: 5, vAmine: 3.3, cryst: 'ice', needlesKept: true, hot: true, hours: 0.5, washLoss: 0.4, vNaOH: 3, vWater: 15, portions: [10], dry: 'none' };

test('кристаллы соли никогда не обогащены (R)-амином: ee ≥ 0 даже при грубейших ошибках', () => {
  for (const cryst of ['ice', 'disturbed', 'slow']) for (const hours of [0.5, 2, 24]) {
    const E = { ...worst, cryst, hours };
    assert.ok(crystallise(E).de >= 0, `de < 0 при ${cryst}, ${hours} ч`);
    assert.ok(resolveAmine(E).ee >= 0, `ee < 0 при ${cryst}, ${hours} ч`);
  }
});

test('молярные массы: C₈H₁₁N, C₄H₆O₆ и их соль 1 : 1', () => {
  assert.equal(M.amine.toFixed(2), '121.18');
  assert.equal(M.ta.toFixed(2), '150.09');
  assert.equal(M.salt.toFixed(2), (M.amine + M.ta).toFixed(2));
  assert.equal(((3.1 / M.amine) * 1000).toFixed(0), '26');   // 3,1 г амина = 26 ммоль
});

test('индивидуальное задание: у каждого вопроса ровно один верный вариант, тексты на трёх языках', async () => {
  const lab = (await import('../labs/lab-12/lab.js')).default;
  const exp3 = (await import('../labs/lab-12/exp3.js')).default;
  for (const a of lab.report.assignment.filter((x) => x.kind === 'choice')) {
    assert.equal(a.correct, 0);
    for (const o of a.options) for (const k of ['ru', 'kk', 'en']) assert.ok(o[k] && o[k].length > 3);
  }
  const ala = lab.report.assignment.find((x) => x.id === 'ala');
  assert.ok(!ala.options.slice(1).some((o) => /¹⁹F NMR/.test(o.en)), 'MTPA с ЯМР ¹⁹F — тоже верный ответ для аланина');
  assert.equal(typeof exp3.equation[0], 'object');
  assert.ok(exp3.equation[0].ru.startsWith('оптическая чистота'));
});

test('вывод протокола: при [α] ≥ 0 амин не называют левовращающим (S)-амином', async () => {
  const lab = (await import('../labs/lab-12/lab.js')).default;
  const c = lab.report.experiments[3].conclusion({ op: -1.2, spec: 0.5, pS: 49.4, pR: 50.6 });
  assert.ok(!/левовращающий/.test(c.ru) && /не удалось/.test(c.ru));
  const g = lab.report.experiments[3].conclusion({ op: 80, spec: -32, pS: 90, pR: 10 });
  assert.ok(/левовращающий/.test(g.ru));
});
