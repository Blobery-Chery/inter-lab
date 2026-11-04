// sw.js кэширует всё приложение и все работы (SPEC, раздел 15), версия кэша совпадает с версией в config.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { CONFIG } from '../config.js';

const root = new URL('..', import.meta.url).pathname;
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const src = readFileSync(join(root, 'sw.js'), 'utf8');
const core = JSON.parse(src.slice(src.indexOf('const CORE = [') + 13, src.indexOf('];', src.indexOf('const CORE')) + 1));

test('sw.js: в CORE все js/css приложения, работ и панели преподавателя', () => {
  const need = ['app', 'labs', 'teacher'].flatMap((d) => walk(join(root, d))).map((p) => relative(root, p)).filter((p) => /\.(js|css)$/.test(p));
  for (const f of need) assert.ok(core.includes(f), 'нет в sw.js: ' + f);
  for (const f of core) if (!f.endsWith('/')) assert.ok(statSync(join(root, f)).isFile(), 'лишний файл в sw.js: ' + f);
});

test('sw.js: версия кэша = APP_VERSION', () => {
  assert.ok(src.includes(`'vlab-v${CONFIG.APP_VERSION}'`), 'обновите CACHE в sw.js и APP_VERSION в config.js вместе');
});
