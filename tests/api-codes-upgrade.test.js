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
