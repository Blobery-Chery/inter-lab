// Работа № 15: модель качественных реакций углеводов — при правильном выполнении результаты совпадают с методичкой (раздел 6),
// ошибки меняют наблюдение. Файл добавлен сессией L15 (docs/SCHEMA.md, раздел 10).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../labs/lab-15/model.js';
import { createRng } from '../app/rng.js';
import lab from '../labs/lab-15/lab.js';

const ALL = { glu: 'glu', fru: 'fru', suc: 'suc', mal: 'mal' };
const seeds = [1, 2, 3, 17, 99, 12345];

test('правильное выполнение даёт результаты раздела 6 методички при любом seed', () => {
  for (const seed of seeds) {
    const env = { kin: M.kinetics(createRng(seed)) };
    const code = (test, map = ALL) => Object.fromEntries(Object.entries(M.runIdeal(test, map, env).out).map(([k, v]) => [k, v.code]));
    assert.deepEqual(code('molisch'), { glu: 'ring', fru: 'ring', suc: 'ring', mal: 'ring' }, 'Молиш: кольцо у всех');
    for (const t of ['trommer', 'fehling']) assert.deepEqual(code(t), { glu: 'red', fru: 'red', suc: 'blue', mal: 'red' }, t);
    assert.deepEqual(code('tollens'), { glu: 'mirror', fru: 'mirror', suc: 'none', mal: 'mirror' }, 'Толленс');
    assert.deepEqual(code('barfoed', { glu: 'glu', fru: 'fru', mal: 'mal' }), { glu: 'red', fru: 'red', mal: 'none' }, 'Барфёд за 5 мин');
    assert.deepEqual(code('seliwanoff', { glu: 'glu', fru: 'fru', suc: 'suc' }), { glu: 'none', fru: 'red', suc: 'red' }, 'Селиванов за 2 мин');
  }
});

test('времена появления признака — в пределах методички', () => {
  for (const seed of seeds) {
    const env = { kin: M.kinetics(createRng(seed)) };
    const b = M.runIdeal('barfoed', { glu: 'glu', fru: 'fru' }, env).bench;
    for (const t of b.tubes) assert.ok(t.tApp > 90 && t.tApp <= 200, `Барфёд ${t.sug}: ${t.tApp} с (2–3 мин)`);
    const s = M.runIdeal('seliwanoff', { fru: 'fru', suc: 'suc' }, env).bench;
    const fru = s.tubes.find((t) => t.sug === 'fru'), suc = s.tubes.find((t) => t.sug === 'suc');
    assert.ok(fru.tApp >= 45 && fru.tApp <= 100, `фруктоза ≈ 1 мин: ${fru.tApp}`);
    assert.ok(suc.tApp > fru.tApp && suc.tApp <= 120, `сахароза — с задержкой, но в пределах 2 мин: ${suc.tApp}`);
    const tr = M.runIdeal('trommer', { glu: 'glu', mal: 'mal' }, env).bench;
    for (const t of tr.tubes) assert.ok(t.tApp <= 180, `Троммер ${t.sug}: красный осадок за 2–3 мин (${t.tApp} с)`);
  }
});

test('дисахарид в пробе Барфёда даёт осадок лишь после 10 мин; глюкоза у Селиванова розовеет при долгом нагреве', () => {
  const env = { kin: M.kinetics(createRng(5)) };
  const b = { test: 'barfoed', sw: 0, swOn: false, tubes: [M.idealTube('barfoed', 'mal', 'mal')] };
  b.tubes[0].bath = 'boil'; M.simulate(b, env, 780);
  assert.equal(M.look('barfoed', b.tubes[0], env).code, 'late');
  assert.ok(b.tubes[0].tApp > 600);
  const s = { test: 'seliwanoff', sw: 0, swOn: false, tubes: [M.idealTube('seliwanoff', 'glu', 'glu')] };
  s.tubes[0].bath = 'boil'; M.simulate(s, env, 420);
  assert.equal(M.look('seliwanoff', s.tubes[0], env).code, 'pink');
});

test('ошибки меняют наблюдение', () => {
  const env = { kin: M.kinetics(createRng(7)) };
  // Молиш: встряхнули — колец нет
  const m = M.idealTube('molisch', 'glu', 'glu'); m.shaken = 1;
  assert.equal(M.look('molisch', m, env).code, 'mixed');
  // Троммер: избыток CuSO₄ → чёрный CuO
  const t = { test: 'trommer', sw: 0, swOn: false, tubes: [Object.assign(M.idealTube('trommer', 'glu', 'glu'), { cu: 20 })] };
  assert.equal(M.look('trommer', t.tubes[0], env).code, 'excess');
  t.tubes[0].bath = 'boil'; M.simulate(t, env, 180);
  assert.equal(M.look('trommer', t.tubes[0], env).code, 'black');
  // Троммер без щёлочи
  const n = Object.assign(M.idealTube('trommer', 'glu', 'glu'), { naoh: 0 });
  assert.equal(M.look('trommer', n, env).code, 'cuso4');
  // Фелинг без раствора B — нет восстановления
  const f = { test: 'fehling', sw: 0, swOn: false, tubes: [Object.assign(M.idealTube('fehling', 'glu', 'glu'), { b: 0 })] };
  f.tubes[0].bath = 'boil'; M.simulate(f, env, 240);
  assert.equal(M.look('fehling', f.tubes[0], env).code, 'cuso4');
  // Толленс: кипящая баня или грязные пробирки — чёрный осадок вместо зеркала
  const hot = { test: 'tollens', sw: 0, swOn: false, tubes: [M.idealTube('tollens', 'glu', 'glu')] };
  hot.tubes[0].bath = 'boil'; M.simulate(hot, env, 120);
  assert.equal(M.look('tollens', hot.tubes[0], { ...env, clean: true }).code, 'black');
  const dirty = { test: 'tollens', sw: 0, swOn: false, tubes: [M.idealTube('tollens', 'glu', 'glu')] };
  dirty.tubes[0].bath = 'warm'; M.simulate(dirty, env, 360);
  assert.equal(M.look('tollens', dirty.tubes[0], { ...env, clean: false }).code, 'black');
  assert.equal(M.look('tollens', dirty.tubes[0], { ...env, clean: true }).code, 'mirror');
  // загрязнённая сахароза (общая пипетка) восстанавливает
  const c = { test: 'fehling', sw: 0, swOn: false, tubes: [Object.assign(M.idealTube('fehling', 'suc', 'suc'), { cross: true })] };
  c.tubes[0].bath = 'boil'; M.simulate(c, env, 300);
  assert.equal(M.look('fehling', c.tubes[0], env).code, 'red');
});

test('Селиванов + Барфёд однозначно определяют четыре сахара, Фелинг + Толленс — нет', () => {
  const env = { kin: M.kinetics(createRng(3)) };
  assert.equal(M.identifies(['seliwanoff', 'barfoed'], env), true);
  assert.equal(M.identifies(['fehling', 'seliwanoff', 'barfoed'], env), true);
  assert.equal(M.identifies(['fehling', 'tollens'], env), false);
  assert.equal(M.identifies(['molisch', 'trommer'], env), false);
});

test('реактив Толленса: осадок Ag₂O растворяется аммиаком, избыток считается', () => {
  assert.equal(M.tollensPrep({ naoh: 1, nh3: 5, need: 10 }).dissolved, false);
  assert.equal(M.tollensPrep({ naoh: 1, nh3: 10, need: 10 }).dissolved, true);
  assert.equal(M.tollensPrep({ naoh: 1, nh3: 15, need: 10 }).excess, 5);
});

test('у каждого кода наблюдения есть подписи на трёх языках', () => {
  for (const [test, obs] of Object.entries(M.OBS)) for (const [code, o] of Object.entries(obs)) {
    for (const f of [o.label, o.cell]) { const s = f({ tApp: 130, tPink: 360 }); for (const l of ['ru', 'kk', 'en']) assert.ok(s[l] && s[l].trim() && !/undefined|NaN|null/.test(s[l]), `${test}.${code}.${l}`); }
  }
});

test('работа 15: минимум последствий SPEC (раздел 6) и обязательные поля', () => {
  const steps = lab.experiments.flatMap((e) => e.steps);
  const crit = steps.flatMap((s) => (s.options || []).filter((o) => o.critical));
  assert.ok(crit.length >= 1, 'нужен сценарий critical');
  const events = steps.flatMap((s) => s.events || []);
  assert.ok(events.length >= 1, 'нужно событие внутри процесса');
  assert.equal(lab.status, 'ready');
  assert.ok(lab.admission.bank.length >= 15);
  assert.equal(lab.report.table.rows({}).length, 7, 'итоговая таблица методички — 7 проб');
});
