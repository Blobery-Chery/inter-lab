// Все пользовательские строки — {ru, kk, en}, без пустых (SPEC, раздел 16).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UI, isTri } from '../app/i18n.js';
import { LABS } from '../labs/manifest.js';
import { EQUIPMENT } from '../app/equipment.js';
import { BINS } from '../app/steps/cleanup.js';

/** Обходит объект и проверяет каждую тройку {ru,kk,en}; функции вызываются с пустым state, если возможно. */
function walk(x, path, out, seen = new Set()) {
  if (x == null || typeof x !== 'object' || seen.has(x)) return;
  seen.add(x);
  if (isTri(x)) {
    for (const l of ['ru', 'kk', 'en']) if (typeof x[l] !== 'string' || !x[l].trim()) out.push(`${path}.${l}`);
    return;
  }
  for (const [k, v] of Object.entries(x)) walk(v, `${path}.${k}`, out, seen);
}

test('строки интерфейса UI на трёх языках', () => {
  const bad = [];
  for (const [k, v] of Object.entries(UI)) { if (!isTri(v)) bad.push(k); else walk(v, 'UI.' + k, bad); }
  assert.deepEqual(bad, []);
});

test('манифест и каталог оборудования на трёх языках', () => {
  const bad = [];
  walk(LABS, 'LABS', bad); walk(EQUIPMENT, 'EQUIPMENT', bad); walk(BINS, 'BINS', bad);
  assert.deepEqual(bad, []);
});

test('все строки работ (lab.js, допуск) на трёх языках', async () => {
  for (const e of LABS) {
    const lab = (await import(`../labs/${e.folder}/lab.js`)).default;
    const bad = [];
    walk(lab, e.id, bad);
    assert.deepEqual(bad, [], `${e.id}: пустые или отсутствующие переводы`);
  }
});

test('казахские фразы не совпадают с русскими (признак непереведённого текста; названия веществ и единицы допускаются)', async () => {
  const lab = (await import('../labs/lab-06-07/lab.js')).default;
  const same = [];
  const seen = new Set();
  (function w(x, p) {
    if (!x || typeof x !== 'object' || seen.has(x)) return; seen.add(x);
    if (isTri(x)) { if ((x.ru.match(/[а-яё]{3,}/gi) || []).length >= 4 && x.ru === x.kk) same.push(p + ': ' + x.ru.slice(0, 40)); return; }
    for (const [k, v] of Object.entries(x)) w(v, p + '.' + k);
  })(lab, 'lab');
  assert.deepEqual(same, []);
});
