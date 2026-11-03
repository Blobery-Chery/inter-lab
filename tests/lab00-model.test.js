// Вводное занятие (lab-00): модель (разбавление, нейтрализация), итоговый тест, переводы, протокол.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isTri, tr } from '../app/i18n.js';
import { dilutedPercent, dilutionRise, acidVolumeFor, bicarbonateFor, wastePH } from '../labs/lab-00/model.js';

const lab = (await import('../labs/lab-00/lab.js')).default;

test('lab-00: модель разбавления серной кислоты', () => {
  assert.ok(Math.abs(dilutedPercent(5, 80) - 9.9) < 0.1, 'w ≈ 9,9 %');
  const r = dilutionRise(1, 85);
  assert.ok(r > 3 && r < 4.5, `1 мл кислоты греет ~3,8 °C, получено ${r}`);
  let T = 0, m = 85;
  for (let i = 0; i < 5; i++) { T += dilutionRise(1, m); m += 1.84; }
  assert.ok(T > 15 && T < 21, `5 мл: ΔT ≈ 18 °C, получено ${T}`);
  assert.equal(acidVolumeFor(10, 100).toFixed(2), '5.66');
});

test('lab-00: нейтрализация кислых отходов', () => {
  assert.equal(bicarbonateFor(50).toFixed(2), '4.20');
  assert.ok(wastePH(50, 0, 0, 50) < 0.1, 'исходные отходы ≈ pH 0');
  const soda = 1000 / 84.01;
  assert.ok(wastePH(50, 4 * soda, 0, 50) < 2, '4 г NaHCO₃ — ещё кисло');
  const p5 = wastePH(50, 5 * soda, 0, 50);
  assert.ok(p5 >= 6 && p5 <= 8, `5 г NaHCO₃ → pH 6–8, получено ${p5}`);
  assert.ok(wastePH(50, 20 * soda, 0, 50) <= 8.3, 'избыток гидрокарбоната не поднимает pH выше 8,3');
  assert.ok(wastePH(50, 0, 4 * 13.9, 70) > 12, 'перещелачивание NaOH');
});

test('lab-00: итоговый тест — ≥ 30 вопросов, 10 случайных, порог 8', () => {
  assert.ok(lab.admission.bank.length >= 30);
  assert.equal(lab.admission.pick, 10);
  assert.equal(lab.admission.pass, 8);
  assert.deepEqual(lab.requires, []);
});

test('lab-00: казахские строки не совпадают с русскими', () => {
  const same = [];
  const seen = new Set();
  (function w(x, p) {
    if (!x || typeof x !== 'object' || seen.has(x)) return; seen.add(x);
    if (isTri(x)) { if ((x.ru.match(/[а-яё]{3,}/gi) || []).length >= 4 && x.ru === x.kk) same.push(p + ': ' + x.ru.slice(0, 40)); return; }
    for (const [k, v] of Object.entries(x)) w(v, p + '.' + k);
  })(lab, 'lab');
  assert.deepEqual(same, []);
});

test('lab-00: этапы — минимум последствий и свои типы шагов', async () => {
  const types = new Set();
  for (const p of lab.customSteps) types.add((await import(new URL(p, new URL('../labs/lab-00/', import.meta.url)).href)).default.type);
  assert.deepEqual([...types].sort(), ['lab00-catalog', 'lab00-dress', 'lab00-spot']);
  let critical = 0, safety = 0, events = 0;
  const walk = (x) => {
    if (!x || typeof x !== 'object') return;
    if (Array.isArray(x)) return x.forEach(walk);
    if (x.critical) critical++;
    if (x.severity === 'safety') safety++;
    if (x.severity === 'critical') critical++;
    for (const v of Object.values(x)) if (v && typeof v === 'object') walk(v);
  };
  for (const e of lab.experiments) {
    for (const s of e.steps) { walk(s); if (s.events) events += s.events.length; if (s.type === 'lab00-spot' || s.type === 'lab00-dress' || s.type === 'lab00-catalog') assert.ok(types.has(s.type)); }
    for (const cp of e.checkpoints) assert.ok(cp < e.steps.length);
  }
  assert.ok(critical >= 6, `аварийных сценариев ${critical}`);
  assert.ok(safety >= 10, `нарушений ТБ ${safety}`);
  assert.ok(events >= 5, `событий в процессах ${events}`);
});

test('lab-00: протокол — таблица и выводы на трёх языках', () => {
  const run = { remarks: [{ severity: 'safety', points: 1 }], hints: [] };
  const R = {};
  for (const e of lab.experiments) R[e.id] = e.results({ dilution: { w: 9.6, maxT: 38 }, waste: { pH: 7.1, soda: 5 }, catalog: { n: 12, errs: 1 } }, run);
  const rows = lab.report.table.rows(R);
  assert.equal(rows.length, 7);
  for (const row of rows) for (const c of row) for (const l of ['ru', 'kk', 'en']) assert.ok(String(tr(c, l)).trim(), 'пустая ячейка');
  for (const [id, cfg] of Object.entries(lab.report.experiments)) {
    const c = cfg.conclusion(R[id]);
    for (const l of ['ru', 'kk', 'en']) assert.ok(c[l] && c[l].length > 20, `вывод этапа ${id}`);
    if (cfg.calculations) for (const x of cfg.calculations(R[id])) assert.ok(isTri(x));
  }
  assert.ok(Math.abs(lab.report.assignment.find((a) => a.id === 'acid').answer() - 5.66) < 0.01);
  assert.ok(lab.report.assignment.some((a) => a.kind === 'text'));
});
