// Панель преподавателя: экспорт CSV, демо-данные, строки на трёх языках.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { csvCell, toCsv, requestsCsv } from '../teacher/csv.js';
import { createDemoClient, buildDemoData } from '../teacher/demo.js';
import { S, LABS_FALLBACK } from '../teacher/i18n.js';

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
  assert.match(csv, /\(пример\)/);
});

test('демо: все имена помечены как пример; решение и оценка меняют данные', async () => {
  const c = createDemoClient();
  const { requests } = await c.call('listRequests');
  assert.ok(requests.length >= 10);
  for (const r of requests) for (const l of ['ru', 'kk', 'en']) assert.match(r.name[l], /\((пример|мысал|example)\)$/);
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
