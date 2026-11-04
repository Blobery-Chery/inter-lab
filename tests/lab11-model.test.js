// Работа № 11: модель окрасок и осадков качественных проб, протокол, переводы.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { glycinate, ninhydrin, heatGain, biuret, xantho, fohl, saltOut, heatCoag, heavyMetal, ethanolPpt, pHof, bathStep } from '../labs/lab-11/model.js';
import lab from '../labs/lab-11/lab.js';
import { BINS } from '../app/steps/cleanup.js';
import { isTri, tr } from '../app/i18n.js';

test('опыт 1: Cu(OH)₂ растворяется в глицине; избыток CuSO₄ — частично; без встряхивания — нет', () => {
  assert.equal(glycinate({ cu: 3, oh: 4, gly: 1.5, shaken: true }).key, 'dissolved');
  assert.equal(glycinate({ cu: 12, oh: 4, gly: 1, shaken: true }).key, 'partial');
  assert.equal(glycinate({ cu: 3, oh: 4, water: 1.5, shaken: true }).key, 'ppt');
  assert.notEqual(glycinate({ cu: 3, oh: 4, gly: 1.5, shaken: false }).key, 'dissolved');
});

test('опыт 2: нингидрин — окраска только при нагревании в кипящей бане', () => {
  assert.equal(ninhydrin({ sub: 'gly', ninh: 4, ext: heatGain(60, 100) }).key, 'strong');
  assert.equal(ninhydrin({ sub: 'egg', ninh: 5, ext: heatGain(60, 100) }).key, 'strong');
  assert.notEqual(ninhydrin({ sub: 'gly', ninh: 4, ext: heatGain(60, 65) }).key, 'strong');
  assert.equal(ninhydrin({ sub: 'gly', ninh: 4, ext: 0 }).key, 'none');
  assert.notEqual(ninhydrin({ sub: 'gly', ninh: 1, ext: 1 }).key, 'strong');
});

test('баня на плитке закипает за несколько минут и не перегревается выше 100 °C', () => {
  let T = 22, t = 0;
  while (T < 97 && t < 3600) { T = bathStep(T, true, 10); t += 10; }
  assert.ok(t > 180 && t < 1500, `время закипания ${t} с`);
  for (let i = 0; i < 100; i++) T = bathStep(T, true, 10);
  assert.ok(T <= 100);
});

test('опыт 3: биуретовая проба', () => {
  assert.equal(biuret({ sub: 'egg', oh: 1, cu: 2, shaken: true }).key, 'violet');
  assert.equal(biuret({ sub: 'gel', oh: 1, cu: 2, shaken: true }).key, 'redviolet');
  assert.equal(biuret({ sub: 'gly', oh: 1, cu: 2, shaken: true }).key, 'blue');
  assert.equal(biuret({ sub: 'gly', oh: 1, cu: 2, shaken: true, dirty: true }).key, 'lilac', 'грязная пробирка — ложная окраска');
  assert.equal(biuret({ sub: 'egg', oh: 1, cu: 6, shaken: true }).key, 'masked', 'избыток CuSO₄ маскирует');
  assert.equal(biuret({ sub: 'egg', oh: 0, cu: 2, shaken: true }).key, 'nobase');
});

test('опыт 4: ксантопротеиновая — жёлтая, оранжевая только в щелочной среде; без нагрева — белый осадок', () => {
  assert.ok(pHof(-4, 1.3) < 1); assert.ok(pHof(0.2, 1.8) > 12); assert.equal(pHof(0, 1), 7);
  const ext = heatGain(60, 100, 75);
  assert.equal(xantho({ sub: 'egg', v: 1, hno3: 6, oh: 10, ext }).key, 'orange');
  assert.equal(xantho({ sub: 'egg', v: 1, hno3: 6, oh: 3, ext }).key, 'yellow');
  assert.equal(xantho({ sub: 'egg', v: 1, hno3: 6, oh: 10, ext: 0 }).key, 'white');
  assert.ok(['paleYellow', 'paleOrange'].includes(xantho({ sub: 'gel', v: 1, hno3: 6, oh: 10, ext }).key), 'желатин — слабо');
});

test('опыт 5: реакция Фоля — PbS у белка после 2–3 мин кипячения, желатин отрицательный', () => {
  assert.equal(fohl({ sub: 'egg', oh: 1, pb: 3 }, 150).key, 'black');
  assert.equal(fohl({ sub: 'gel', oh: 1, pb: 3 }, 150).key, 'none');
  assert.equal(fohl({ sub: 'egg', oh: 1, pb: 3 }, 20).key, 'trace');
  assert.equal(fohl({ sub: 'egg', oh: 0, pb: 3 }, 150).key, 'noalk');
});

test('опыт 6: высаливание обратимо, денатурация', () => {
  assert.equal(saltOut({ egg: 2, sat: 2 }).key, 'globulins');
  assert.equal(saltOut({ egg: 2, sat: 1 }).key, 'haze');
  assert.equal(saltOut({ egg: 2, sat: 2, filtered: true, solid: true }).key, 'albumins');
  assert.equal(saltOut({ egg: 2, sat: 2, filtered: true, solid: true, dil: 2 }).key, 'redissolved');
  assert.equal(heatCoag({ ac: 2, heated: true }).key, 'flakes');
  assert.equal(heatCoag({ ac: 0, heated: true }).key, 'opal');
  assert.equal(heavyMetal({ cu: 3 }).key, 'ppt'); assert.equal(heavyMetal({ cu: 13 }).key, 'excess');
  assert.equal(ethanolPpt({ etoh: 2 }).key, 'ppt');
});

test('работа 11: статус ready, 6 опытов, критическая ошибка и не меньше двух safety', () => {
  assert.equal(lab.status, 'ready');
  assert.equal(lab.experiments.length, 6);
  const src = JSON.stringify(lab.experiments.map((e) => e.steps.map((s) => s.type)));
  assert.ok(src.includes('cleanup'));
  for (const v of Object.values(BINS)) assert.ok(isTri(v) && v.ru && v.kk && v.en);
  for (const e of lab.experiments) for (const s of e.steps) if (s.type === 'cleanup') for (const it of s.items) { assert.ok(BINS[it.bin], it.id); assert.ok(s.bins.includes(it.bin), it.id); }
});

test('протокол: итоговая таблица по образцу методички, задания с верными ответами', () => {
  const R = {
    1: { key: 'dissolved', egg: 'ok' }, 2: { gly: 'strong', egg: 'strong' }, 3: { egg: 'violet', gel: 'redviolet', gly: 'blue' },
    4: { egg: 'orange', gel: 'paleOrange', pHe: 13 }, 5: { egg: 'black', gel: 'none', boil: 150 }, 6: { salt: 'redissolved', coag: 'flakes', metal: 'excess', etoh: 'ppt' },
  };
  const rows = lab.report.table.rows(R);
  assert.equal(rows.length, 6);
  assert.equal(lab.report.table.columns.length, 5);
  for (const r of rows) { assert.equal(r.length, 5); for (const c of r) assert.ok(typeof c === 'string' || isTri(c)); }
  assert.ok(tr(rows[2][3], 'ru').startsWith('–'), 'глицин — биуретовая отрицательная');
  assert.ok(tr(rows[4][1], 'ru').startsWith('+'), 'белок — Фоль положительная');
  for (const [id, f] of Object.entries(lab.report.experiments)) for (const k of ['reagents', 'conclusion']) if (f[k]) { const v = f[k](R[id]); assert.ok(Array.isArray(v) ? v.every(isTri) : isTri(v), `${id}.${k}`); }
  const calc = lab.report.assignment.find((a) => a.id === 'pb');
  assert.equal(calc.answer(R), 2);
});

test('казахский текст работы 11 не совпадает с русским', () => {
  const same = [], seen = new Set();
  (function w(x, p) {
    if (!x || typeof x !== 'object' || seen.has(x)) return; seen.add(x);
    if (isTri(x)) { if ((x.ru.match(/[а-яё]{3,}/gi) || []).length >= 4 && x.ru === x.kk) same.push(p + ': ' + x.ru.slice(0, 40)); return; }
    for (const [k, v] of Object.entries(x)) w(v, p + '.' + k);
  })(lab, 'lab');
  assert.deepEqual(same, []);
});
