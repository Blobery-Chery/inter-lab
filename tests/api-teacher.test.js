// Панель преподавателя: экспорт CSV, демо-данные, строки на трёх языках.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { csvCell, toCsv, requestsCsv } from '../teacher/csv.js';
import { readFileSync } from 'node:fs';
import { createDemoClient, buildDemoData, DEMO_NAMES } from '../teacher/demo.js';
import { S, LABS_FALLBACK } from '../teacher/i18n.js';
import { createNames, namesCsv, namesFromTable, parseTable, NAMES_KEY } from '../teacher/names.js';
import { normalizeCode } from '../app/code.js';

test('CSV: BOM, «;», кавычки, защита от формул', () => {
  assert.equal(csvCell('a;b'), '"a;b"');
  assert.equal(csvCell('он сказал "да"'), '"он сказал ""да"""');
  assert.equal(csvCell('=SUM(A1)'), "'=SUM(A1)");
  assert.equal(csvCell(-2), '-2');
  assert.ok(toCsv([['x', 'y']]).startsWith('﻿x;y'));
});

test('CSV заявок собирается из демо-данных', () => {
  const { requests } = buildDemoData(Date.UTC(2026, 10, 2, 9));
  const t = (k) => S[k].ru;
  const tr = (x) => (x && typeof x === 'object' ? x.ru : x ?? '');
  const csv = requestsCsv(requests, { t, tr, lang: 'ru', labName: (id) => id, kindName: (k) => k, statusName: (r) => r.status });
  assert.equal(csv.trim().split('\r\n').length, requests.length + 1);
  assert.match(csv, /;\d{8};/, 'в заявках — коды');
});

test('демо: студенты — коды, «ФИО» — условные метки с пометкой «пример»; решение и оценка меняют данные', async () => {
  const c = createDemoClient();
  const { requests } = await c.call('listRequests');
  assert.ok(requests.length >= 10);
  for (const r of requests) assert.equal(normalizeCode(r.name), r.name, 'вместо ФИО — код');
  for (const v of Object.values(DEMO_NAMES)) for (const l of ['ru', 'kk', 'en']) assert.match(v[l], /^(Студент|Student) .+\((пример|мысал|example)\)$/);
  const codes = (await c.call('listCodes')).codes;
  assert.ok(requests.every((r) => codes.some((x) => x.code === r.name)));
  assert.equal(codes.filter((x) => !x.usedAt).length, 3);
  const pending = requests.filter((r) => r.status === 'pending');
  assert.ok(pending.length >= 2);
  assert.ok(requests.some((r) => r.kind === 'briefing') && requests.some((r) => r.kind === 'access'));
  await c.call('decide', { id: pending[0].id, status: 'approved', comment: 'ok' });
  const after = (await c.call('listRequests')).requests.find((r) => r.id === pending[0].id);
  assert.equal(after.status, 'approved');
  const { reports } = await c.call('listReports');
  assert.ok(reports.length >= 4);
  const full = await c.call('getReport', { id: reports[0].id });
  assert.ok(full.data.journal.length > 3);
  await c.call('setGrade', { id: reports[0].id, grade: 3, comment: 'x' });
  const studs = (await c.call('listStudents')).students;
  const s = studs.find((x) => x.deviceId === reports[0].deviceId);
  assert.equal(s.labs['lab-06-07'].grade, 3);
});

test('демо: оценка соответствует порогам (≤1 → 5, ≤3 → 4, ≤5,5 → 3)', () => {
  for (const r of buildDemoData().reports) {
    const want = r.points <= 1 ? 5 : r.points <= 3 ? 4 : r.points <= 5.5 ? 3 : 2;
    assert.equal(r.grade, want);
  }
});

test('строки панели: ru, kk, en непустые; казахский — кириллическая «і»', () => {
  const all = [...Object.entries(S), ...LABS_FALLBACK.map((l) => [l.id, l.title])];
  for (const [k, v] of all) {
    for (const l of ['ru', 'kk', 'en']) assert.ok(v[l] && v[l].trim(), `${k}.${l}`);
    assert.doesNotMatch(v.kk, /[Ѐ-ӿ]i|i[Ѐ-ӿ]/, `${k}.kk: латинская i в казахском слове`);
  }
});

test('список «код → ФИО»: хранится в браузере, CSV туда и обратно, правка в Excel', () => {
  const mem = new Map();
  const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
  const n = createNames({ storage });
  n.set('3184-2065', '  Студент   Один ');
  assert.equal(n.get('31842065'), 'Студент Один');
  assert.equal(n.get('3184-2066'), '', 'неверный код — пусто');
  n.set('1234-5678', 'x'); // не код — не записывается
  assert.equal(n.size(), 1);
  assert.equal(n.merge([['59270314', 'Студент Два'], ['59270314', ''], ['bad', 'Z']]), 1);
  assert.deepEqual(Object.keys(JSON.parse(mem.get(NAMES_KEY))).sort(), ['31842065', '59270314']);
  assert.equal(createNames({ storage }).get('59270314'), 'Студент Два', 'после перезагрузки страницы');
  // CSV панели → разбор
  const t = (k) => S[k].ru;
  const csv = namesCsv([{ code: '31842065', name: 'Студент; «Один»', group: 'Х-31', createdAt: 0, usedAt: 0 }], t);
  assert.deepEqual(namesFromTable(csv), [['31842065', 'Студент; «Один»']]);
  // таблица после Excel: запятые, другой порядок столбцов, код без дефиса
  assert.deepEqual(namesFromTable('Группа,ФИО,Код\r\nХ-31,"Студент Три",74605189\r\n'), [['74605189', 'Студент Три']]);
  assert.deepEqual(namesFromTable('74605189\tСтудент Три'), [['74605189', 'Студент Три']]);
  assert.deepEqual(parseTable('a;"b ""c"""\n'), [['a', 'b "c"']]);
  // демо не пишет в хранилище
  const before = mem.get(NAMES_KEY);
  createNames({ persist: false, storage, seed: { 20593745: 'demo' } }).set('86139201', 'demo2');
  assert.equal(mem.get(NAMES_KEY), before);
  n.clear();
  assert.equal(mem.has(NAMES_KEY), false);
});

test('панель не отправляет ФИО на сервер: в запросах — только коды', () => {
  const src = readFileSync(new URL('../teacher/app.js', import.meta.url), 'utf8');
  const calls = [...src.matchAll(/client\.call\('(\w+)'(?:,\s*([^)]*))?\)/g)].map((m) => [m[1], m[2] || '']);
  assert.ok(calls.length >= 10);
  for (const [action, args] of calls) {
    assert.doesNotMatch(args, /names|\.name\b|name:/, `${action}: ${args}`);
  }
  const allowed = { createCodes: '{ group, count }', deleteCode: '{ code }' };
  for (const [a, args] of calls) if (allowed[a]) assert.equal(args.trim(), allowed[a]);
  // список хранится только через names.js (localStorage), а client.js отправляет лишь то, что ему передали
  assert.doesNotMatch(readFileSync(new URL('../teacher/names.js', import.meta.url), 'utf8'), /fetch|XMLHttpRequest|sendBeacon/);
});
