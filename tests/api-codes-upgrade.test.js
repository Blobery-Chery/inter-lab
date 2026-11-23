// Обновление настоящей таблицы: данные записаны сервером 1.2.0 (столбец «ФИО»), затем поработал 1.3.0
// (он не узнал «ФИО» и дописал справа пустой столбец «Код студента»), затем ставится 1.3.1.
// Сервер 1.3.1 должен слить столбцы, увидеть всех студентов и заменить ФИО кодами без потерь.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from './api-gas-mock.js';

const OLD = (v) => readFileSync(new URL(`./fixtures/Code-${v}.gs`, import.meta.url), 'utf8');
const PASS = 'Тест-пароль-1';
const login = (s) => { s.setCredentials('teacher', PASS); return s.post({ action: 'login', login: 'teacher', password: PASS }).token; };
const adm = (student, lab = 'lab-08', kind = 'admission') => ({ action: 'submitAdmission', clientId: Math.random().toString(36).slice(2), payload: { lab, kind, attempt: 1, score: 5, total: 5, pass: 4, answers: [{ q: 'q', chosen: 'a', ok: true }], lang: 'ru', student } });
const heads = (s, name) => s.ss.sheets[name].data[0];
const text = (s) => JSON.stringify(Object.values(s.ss.sheets).map((x) => x.data));
const plain = (x) => JSON.parse(JSON.stringify(x));

const ANNA = { name: 'Ковалёва Анна', group: 'Х-31', deviceId: 'dev-anna' };
const BEK = { name: 'Беков Ерлан', group: 'Х-32', deviceId: 'dev-bek' };
const C1 = { name: 'Сейтова Дана', group: 'Х-31', deviceId: 'dev-lab' }; // один компьютер в классе
const C2 = { name: 'Ли Марат', group: 'Х-31', deviceId: 'dev-lab' };

function oldSheet() {
  const s = createServer({ code: OLD('1.2.0') });
  const tok = login(s);
  for (const st of [ANNA, BEK, C1, C2]) s.post(adm(st, 'lab-00', 'briefing'));
  s.post(adm(ANNA));
  for (const r of s.post({ action: 'listRequests', token: tok }).requests) s.post({ action: 'decide', token: tok, id: r.id, status: 'approved', comment: r.name === 'Беков Ерлан' ? 'Беков Ерлан, молодец' : '' });
  s.post({ action: 'submitReport', clientId: 'r1', payload: { lab: 'lab-08', grade: 4, points: 2, student: ANNA, reportText: 'Студент: Ковалёва Анна · Группа: Х-31', journal: [] } });
  s.post({ action: 'saveProgress', student: ANNA, lab: 'lab-08', data: 'j.old', at: 1000 });
  s.post({ action: 'saveProgress', student: C1, lab: 'lab-09', data: 'j.c1', at: 1000 });
  return s;
}

test('1.2.0 → 1.3.1: «ФИО» становится «Код студента», лишних столбцов нет, все студенты видны', () => {
  const old = oldSheet();
  const s = createServer({ ss: old.ss });
  const tok = login(s);
  assert.equal(s.post({ action: 'listCodes', token: tok }).legacy, 4);
  for (const n of ['Заявки', 'Протоколы', 'Студенты', 'Прогресс']) {
    const h = heads(s, n);
    assert.ok(h.includes('Код студента') && !h.includes('ФИО'), n + ': ' + h.join(', '));
    assert.equal(h.filter((x) => x === 'Код студента').length, 1, n + ': один столбец');
  }
  assert.ok(heads(s, 'Прогресс').includes('Студент (код|группа)'));
  assert.equal(s.post({ action: 'getStatus', lab: 'lab-08', student: ANNA }).status.status, 'approved', 'до замены — по ФИО, как раньше');
});

test('1.2.0 → 1.3.0 (ошибка) → 1.3.1: столбцы сливаются, код уже вошедшей студентки сохраняется', () => {
  const old = oldSheet();
  // поработал 1.3.0: дописал справа пустые «Код студента»; Анна отправила заявку — она легла в новый столбец
  const mid = createServer({ code: OLD('1.3.0'), ss: old.ss });
  let tok = login(mid);
  mid.post(adm(ANNA, 'lab-09'));
  mid.post({ action: 'saveProgress', student: ANNA, lab: 'lab-08', data: 'j.new', at: 5000 });
  assert.equal(heads(mid, 'Заявки').filter((x) => x === 'Код студента' || x === 'ФИО').length, 2, 'как у преподавателя: два столбца');
  const listMid = mid.post({ action: 'listCodes', token: tok });
  assert.equal(listMid.legacy, 1, 'ошибка 1.3.0: виден только один студент');
  const codeA = mid.post({ action: 'migrateToCodes', token: tok }).mapping[0].code;

  // ставится 1.3.1
  const s = createServer({ ss: old.ss });
  tok = login(s);
  const list = s.post({ action: 'listCodes', token: tok });
  for (const n of ['Заявки', 'Протоколы', 'Студенты', 'Прогресс']) {
    const h = heads(s, n);
    assert.ok(!h.includes('ФИО') && h.filter((x) => x === 'Код студента').length === 1, n + ': ' + h.join(', '));
  }
  assert.equal(list.legacy, 4, 'видны все четыре студента');
  assert.equal(s.ss.sheets['Прогресс'].data.slice(1).filter((r) => r.join('')).length, 3, 'повторная строка прогресса Анны убрана');

  // шаг 1: план — таблица не меняется
  const before = text(s);
  const dry = s.post({ action: 'migrateToCodes', token: tok, dry: true });
  assert.ok(dry.plan && dry.mapping.length === 4);
  assert.equal(text(s), before, 'план ничего не меняет в таблице');
  const by = Object.fromEntries(dry.mapping.map((m) => [m.name, m.code]));
  assert.equal(by['Ковалёва Анна'], codeA, 'Анне — её уже выданный код (устройство только её)');
  assert.notEqual(by['Сейтова Дана'], by['Ли Марат'], 'общий компьютер: каждому свой код');

  // шаг 2: замена по плану
  const res = s.post({ action: 'migrateToCodes', token: tok, plan: dry.plan });
  assert.deepEqual(plain(res.mapping), plain(dry.mapping), 'коды те же, что в плане');
  const t = text(s);
  for (const w of ['Ковал', 'Беков', 'Сейтова', 'Ли Марат', 'Ерлан']) assert.ok(!t.includes(w), 'не осталось: ' + w);
  const codes = s.post({ action: 'listCodes', token: tok });
  assert.equal(codes.legacy, 0);
  assert.equal(codes.codes.length, 4, 'код Анны не задвоен');

  // Анна со своим кодом: инструктаж, оба допуска и свежий прогресс
  const anna = { name: codeA, group: '', deviceId: 'другой-телефон' };
  assert.equal(s.post({ action: 'getStatus', lab: 'lab-00', student: anna }).status.status, 'approved');
  assert.equal(s.post({ action: 'getStatus', lab: 'lab-08', student: anna }).status.status, 'approved');
  assert.equal(s.post({ action: 'getStatus', lab: 'lab-09', student: anna }).status.status, 'pending');
  assert.deepEqual(s.post({ action: 'loadProgress', student: anna }).items.map((x) => x.data), ['j.new']);
  const dana = { name: by['Сейтова Дана'], group: '', deviceId: 'x' };
  assert.deepEqual(s.post({ action: 'loadProgress', student: dana }).items.map((x) => x.data), ['j.c1']);
  // повторно план не нужен
  assert.deepEqual(plain(s.post({ action: 'migrateToCodes', token: tok, dry: true }).mapping), []);
});

test('устаревший план — понятная ошибка, ФИО на месте', () => {
  const s = createServer({ ss: oldSheet().ss });
  const tok = login(s);
  const r = s.post({ action: 'migrateToCodes', token: tok, plan: 'нет-такого' });
  assert.equal(r.error, 'bad_request');
  assert.ok(text(s).includes('Ковал'));
});

test('1.2.0 → 1.3.0 → откат на 1.2.0 (студенты работают) → 1.3.1: ничего не теряется', () => {
  const old = oldSheet();
  const mid = createServer({ code: OLD('1.3.0'), ss: old.ss });
  let tok = login(mid);
  mid.post(adm(ANNA, 'lab-09'));
  const codeA = mid.post({ action: 'migrateToCodes', token: tok }).mapping[0].code;
  // откат: старый сервер; Беков работает по ФИО, у Анны на телефоне уже код (сервер 1.2.0 считает его «ФИО»)
  const back = createServer({ code: OLD('1.2.0'), ss: old.ss });
  back.post(adm(BEK, 'lab-10'));
  back.post({ action: 'saveProgress', student: { name: codeA, group: 'Х-31', deviceId: 'dev-anna' }, lab: 'lab-10', data: 'j.a10', at: 9000 });
  // исправленный сервер
  const s = createServer({ ss: old.ss });
  tok = login(s);
  assert.equal(s.post({ action: 'listCodes', token: tok }).legacy, 4);
  const dry = s.post({ action: 'migrateToCodes', token: tok, dry: true });
  const by = Object.fromEntries(dry.mapping.map((m) => [m.name, m.code]));
  assert.equal(by['Ковалёва Анна'], codeA);
  s.post({ action: 'migrateToCodes', token: tok, plan: dry.plan });
  assert.ok(!/Ковал|Беков/.test(text(s)));
  const bek = { name: by['Беков Ерлан'], group: '', deviceId: 'dev-bek' };
  assert.equal(s.post({ action: 'getStatus', lab: 'lab-10', student: bek }).status.status, 'pending', 'заявка, поданная во время отката');
  const anna = { name: codeA, group: '', deviceId: 'dev-anna' };
  assert.deepEqual(s.post({ action: 'loadProgress', student: anna }).items.map((x) => x.data).sort(), ['j.a10', 'j.old']);
});

/* ---------- запись в журнале инструктажа: в старых записях — ФИО в свободной форме ---------- */
import zlib from 'node:zlib';
const OLD_TASK = 'Запись в журнале инструктажа. Напишите: «С правилами техники безопасности ознакомлен(а), обязуюсь выполнять», ваши ФИО и группу.';
const pack = (o) => 'g.' + zlib.gzipSync(Buffer.from(JSON.stringify(o))).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unpack = (s) => JSON.parse(zlib.gunzipSync(Buffer.from(s.slice(2).replace(/-/g, '+').replace(/_/g, '/'), 'base64')).toString());
const ANS = 'С правилами техники безопасности ознакомлена, обязуюсь выполнять. Анна Ковалёва Сергеевна, группа Х-31';

function sheetWithJournal() {
  const s = createServer({ code: OLD('1.2.0') });
  s.post({ action: 'submitReport', clientId: 'r0', payload: {
    lab: 'lab-00', grade: 5, points: 0, student: ANNA, journal: [],
    assignment: [{ task: OLD_TASK, answer: ANS, ok: null }],
    reportText: 'ПРОТОКОЛ\nСтудент: Ковалёва Анна\n6. ' + OLD_TASK + '\n   → ' + ANS + '\n' } });
  s.post({ action: 'saveProgress', student: ANNA, lab: 'lab-00', data: pack({ runs: {}, assignment: { journal: { answer: ANS, ok: null }, eye: { answer: '2', ok: true } } }), at: 1000 });
  return s;
}
const noName = (s) => {
  const t = text(s);
  for (const w of ['Ковал', 'Анна', 'Сергеевна']) assert.ok(!t.includes(w), 'в таблице: ' + w);
  const row = s.ss.sheets['Прогресс'].data.find((r) => r.includes('lab-00'));
  const h = heads(s, 'Прогресс');
  const blob = ['Данные 1', 'Данные 2', 'Данные 3', 'Данные 4'].map((k) => row[h.indexOf(k)] || '').join('');
  const o = unpack(blob);
  assert.equal(o.assignment.journal.answer, 'С правилами техники безопасности ознакомлена, обязуюсь выполнять.', 'в копии прогресса — только клятва');
  assert.equal(o.assignment.eye.answer, '2', 'остальное на месте');
  const rep = s.post({ action: 'listReports', token: login(s) }).reports.find((r) => r.lab === 'lab-00');
  const data = s.post({ action: 'getReport', token: login(s), id: rep.id }).data;
  return data;
};

test('журнал инструктажа: при замене ФИО кодами (1.3.2) — клятва + код, ФИО в любом порядке исчезает', () => {
  const s = createServer({ ss: sheetWithJournal().ss });
  const tok = login(s);
  const dry = s.post({ action: 'migrateToCodes', token: tok, dry: true });
  const code = dry.mapping[0].code;
  s.post({ action: 'migrateToCodes', token: tok, plan: dry.plan });
  const data = noName(s);
  const want = `С правилами техники безопасности ознакомлена, обязуюсь выполнять. — код ${code.slice(0, 4)}-${code.slice(4)}, группа Х-31`;
  assert.equal(data.assignment[0].answer, want);
  assert.ok(data.reportText.includes('→ ' + want));
});

test('журнал инструктажа: если ФИО уже заменили версией 1.3.1 — 1.3.2 чистит при первом запросе', () => {
  const base = sheetWithJournal();
  const v131 = createServer({ code: OLD('1.3.1'), ss: base.ss });
  const t1 = login(v131);
  const dry = v131.post({ action: 'migrateToCodes', token: t1, dry: true });
  v131.post({ action: 'migrateToCodes', token: t1, plan: dry.plan });
  assert.ok(text(v131).includes('Анна Ковалёва Сергеевна'), 'версия 1.3.1 обратный порядок не находила');
  const s = createServer({ ss: base.ss });
  for (const k of Object.keys(v131.props)) if (!(k in s.props)) s.props[k] = v131.props[k];
  delete s.props.JOURNAL_FIXED;
  s.post({ action: 'getStatus', lab: 'lab-00', student: { name: dry.mapping[0].code, group: '', deviceId: 'x' } }); // любой запрос
  noName(s);
  assert.equal(s.props.JOURNAL_FIXED, '1');
});

test('новые копии прогресса работы 0 и протоколы старой версии сайта приходят уже без ФИО', () => {
  const s = createServer();
  const tok = login(s);
  const code = s.post({ action: 'createCodes', token: tok, group: 'Х-31', count: 1 }).codes[0].code;
  const st = { name: code, group: '', deviceId: 'd1' };
  s.post({ action: 'saveProgress', student: st, lab: 'lab-00', data: pack({ assignment: { journal: { answer: 'Ознакомлен, обязуюсь выполнять! Петров П.', ok: null } } }), at: 1 });
  const item = s.post({ action: 'loadProgress', student: st }).items[0];
  assert.equal(unpack(item.data).assignment.journal.answer, 'Ознакомлен, обязуюсь выполнять!');
  s.post({ action: 'saveProgress', student: st, lab: 'lab-00', data: pack({ assignment: { journal: { answer: 'Просто текст', ok: null } } }), at: 2 });
  assert.equal(unpack(s.post({ action: 'loadProgress', student: st }).items[0].data).assignment.journal.answer, 'Просто текст', 'без клятвы — не трогаем');
  // протокол от закэшированной старой версии сайта (старое задание)
  s.post({ action: 'submitReport', clientId: 'x', payload: { lab: 'lab-00', grade: 5, points: 0, student: st, journal: [],
    assignment: [{ task: OLD_TASK, answer: 'Ознакомлен, обязуюсь выполнять. Петров Пётр', ok: null }], reportText: '→ Ознакомлен, обязуюсь выполнять. Петров Пётр' } });
  assert.ok(!text(s).includes('Петров'));
});
