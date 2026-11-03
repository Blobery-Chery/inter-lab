// Схема каждой работы: манифест, обязательные поля, типы шагов, допуск ≥ 15 с корректными индексами.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LABS } from '../labs/manifest.js';
import { BASE_TYPES } from '../app/steps/index.js';
import { EQUIPMENT } from '../app/equipment.js';
import { readFileSync, existsSync } from 'node:fs';

const LIST = readFileSync(new URL('../docs/labs.md', import.meta.url), 'utf8');

test('в манифесте все работы из docs/labs.md, lab-00 обязателен для остальных', () => {
  const ids = [...LIST.matchAll(/\| `(lab-[\d-]+)` \|/g)].map((m) => m[1]);
  assert.deepEqual(LABS.map((l) => l.id).sort(), ids.sort());
  for (const l of LABS) {
    assert.ok(existsSync(new URL(`../labs/${l.folder}/lab.js`, import.meta.url)), l.id + ': нет папки');
    if (l.id !== 'lab-00') assert.ok(l.requires.includes('lab-00'), l.id + ': requires lab-00');
    assert.ok(['ready', 'draft'].includes(l.status));
  }
});

for (const entry of LABS) {
  test(`схема ${entry.id}`, async () => {
    const lab = (await import(`../labs/${entry.folder}/lab.js`)).default;
    assert.equal(lab.id, entry.id);
    assert.equal(lab.number, entry.number);
    assert.ok(lab.title && lab.title.ru && lab.title.kk && lab.title.en);
    if (entry.id !== 'lab-00') assert.ok((lab.requires || []).includes('lab-00'), 'requires lab-00');
    if (lab.status !== 'ready') return;
    for (const f of ['topic', 'aim', 'relevance', 'theory', 'reagents', 'equipment', 'safety', 'admission', 'experiments', 'report']) assert.ok(lab[f], `${entry.id}: нет поля ${f}`);
    for (const id of lab.equipment) assert.ok(EQUIPMENT[id], `${entry.id}: нет оборудования ${id} в app/equipment.js`);
    const bank = lab.admission.bank;
    assert.ok(bank.length >= 15, `${entry.id}: банк допуска ${bank.length} < 15`);
    assert.ok(lab.admission.pass <= lab.admission.pick);
    bank.forEach((q, i) => {
      assert.ok(q.options.length >= 2, `вопрос ${i}`);
      assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length, `вопрос ${i}: индекс ответа`);
      assert.ok(q.why, `вопрос ${i}: нет объяснения`);
    });
    for (const e of lab.experiments) {
      assert.ok(e.id && e.title && e.steps.length, `опыт ${e.id}`);
      for (const cp of e.checkpoints || [0]) assert.ok(cp >= 0 && cp < e.steps.length);
      e.steps.forEach((s, i) => {
        assert.ok(BASE_TYPES[s.type] || (lab.customSteps || []).length, `${entry.id} опыт ${e.id} шаг ${i + 1}: неизвестный тип ${s.type}`);
        assert.ok(s.title && s.title.ru, `шаг ${i + 1}: нет title`);
        assert.ok(s.instr, `шаг ${i + 1}: нет instr`);
      });
      assert.equal(typeof e.results, 'function');
    }
    assert.ok(lab.report.table && lab.report.assignment.length);
    assert.ok(lab.report.assignment.some((a) => a.kind === 'text'), 'нужно одно поле свободного ответа');
  });
}
