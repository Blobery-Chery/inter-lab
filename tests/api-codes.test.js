/**
 * Коды студентов вместо ФИО: выдача, проверка, приём только кодов, замена ФИО кодами в старых данных.
 * В Google Таблице после перехода не должно остаться ни одного ФИО.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { CODE_GS, createServer } from './api-gas-mock.js';

function loadPure() {
  const module = { exports: {} };
  const ctx = vm.createContext({ module, console });
  vm.runInContext(CODE_GS, ctx, { filename: 'Code.gs' });
  return module.exports;
}
const G = loadPure();
const plain = (x) => JSON.parse(JSON.stringify(x));

function teacher() {
  const s = createServer();
  s.setCredentials('teacher', 'Секрет-пароль-1');
  const token = s.post({ action: 'login', login: 'teacher', password: 'Секрет-пароль-1' }).token;
  return { s, token };
}
const adm = (student, extra = {}) => ({ action: 'submitAdmission', clientId: crypto.randomUUID(), payload: { lab: 'lab-06-07', kind: 'admission', attempt: 1, score: 5, total: 5, pass: 4, lang: 'ru', answers: [], student, ...extra } });
/** Всё, что лежит в таблице, одной строкой. */
const sheetText = (s) => Object.values(s.ss.sheets).map((sh) => JSON.stringify(sh.data)).join('\n');

test('код: 8 цифр с контрольной цифрой; опечатка в одной цифре видна', () => {
  let r = 0;
  const rand = () => { r = (r * 9301 + 49297) % 233280; return r / 233280; };
  const taken = {};
  for (let i = 0; i < 200; i++) {
    const c = G.makeCode(taken, rand);
    taken[c] = 1;
    assert.match(c, /^[1-9]\d{7}$/);
    assert.equal(G.normalizeCode(c), c);
    assert.equal(G.normalizeCode(G.formatCode(c)), c, 'с дефисом');
    assert.equal(G.normalizeCode(' ' + c.slice(0, 4) + ' ' + c.slice(4) + ' '), c, 'с пробелами');
    const typo = c.slice(0, 3) + String((+c[3] + 1) % 10) + c.slice(4);
    assert.equal(G.normalizeCode(typo), '', 'опечатка');
  }
  assert.equal(Object.keys(taken).length, 200, 'коды не повторяются');
  assert.equal(G.normalizeCode('Иванова Анна'), '');
});

test('пока кодов нет — сайт работает по ФИО, как раньше', () => {
  const { s } = teacher();
  const st = { name: 'Старый Студент', group: 'Х-31', deviceId: 'dev-old' };
  assert.equal(s.post(adm(st)).ok, true);
  assert.equal(s.post({ action: 'getStatus', lab: 'lab-06-07', student: st }).status.status, 'pending');
});

test('коды: создаёт только преподаватель; checkCode возвращает группу и отмечает первый вход', () => {
  const { s, token } = teacher();
  assert.equal(s.post({ action: 'createCodes', group: 'Х-31', count: 3 }).error, 'auth');
  assert.equal(s.post({ action: 'createCodes', token, group: '', count: 3 }).error, 'bad_request');
  assert.equal(s.post({ action: 'createCodes', token, group: 'Х-31', count: 0 }).error, 'bad_request');
  const made = s.post({ action: 'createCodes', token, group: 'Х-31', count: 3 }).codes;
  assert.equal(made.length, 3);
  const c = made[0].code;
  const ok = s.post({ action: 'checkCode', code: G.formatCode(c), deviceId: 'dev-a' });
  assert.deepEqual([ok.ok, ok.code, ok.group], [true, c, 'Х-31']);
  assert.equal(s.post({ action: 'checkCode', code: '1234-5678', deviceId: 'dev-a' }).error, 'bad_code');
  const list = s.post({ action: 'listCodes', token });
  assert.equal(list.codes.length, 3);
  assert.ok(list.codes.find((x) => x.code === c).usedAt > 0, 'первый вход отмечен');
  assert.equal(list.codes.find((x) => x.code === made[1].code).usedAt, null);
  // удалить можно только неиспользованный
  assert.equal(s.post({ action: 'deleteCode', token, code: c }).error, 'bad_request');
  assert.equal(s.post({ action: 'deleteCode', token, code: made[1].code }).ok, true);
  assert.equal(s.post({ action: 'listCodes', token }).codes.length, 2);
});

test('scrubNames: целым словом, без учёта регистра и ё/е; чужие слова не задеты', () => {
  const pairs = [['Ли Анна', '31842065'], ['Ковалёва Анна', '59270314']];
  assert.equal(G.scrubNames('ковалева  анна и Ли Анна', pairs), '5927-0314 и 3184-2065');
  assert.equal(G.scrubNames('Полина Анна', [['Ли Анна', '31842065']]), 'Полина Анна', 'не часть слова');
  assert.equal(G.scrubNames('{"t":"Студент: Ковалёва Анна"}', pairs), '{"t":"Студент: 5927-0314"}');
});

test('коды случайные: 200 разных, все проходят проверку; от ФИО не зависят', () => {
  const { s, token } = teacher();
  const made = s.post({ action: 'createCodes', token, group: 'Х-31', count: 200 }).codes.map((x) => x.code);
  assert.equal(new Set(made).size, 200);
  assert.ok(made.every((c) => G.normalizeCode(c) === c));
  assert.equal(s.post({ action: 'createCodes', token, group: 'Х-31', count: 201 }).error, 'bad_request');
  // одно и то же ФИО в двух разных таблицах получает разные коды
  const codeFor = () => {
    const t = teacher();
    t.s.post(adm({ name: 'Ковалёва Анна', group: 'Х-31', deviceId: 'd' }));
    return t.s.post({ action: 'migrateToCodes', token: t.token }).mapping[0].code;
  };
  assert.notEqual(codeFor(), codeFor());
});

test('подбор кодов ограничен: 20 неверных попыток в час с устройства', () => {
  const { s, token } = teacher();
  s.post({ action: 'createCodes', token, group: 'Х-31', count: 1 });
  for (let i = 0; i < 20; i++) assert.equal(s.post({ action: 'checkCode', code: '1234-5678', deviceId: 'bot' }).error, 'bad_code');
  assert.equal(s.post({ action: 'checkCode', code: '1234-5678', deviceId: 'bot' }).error, 'rate');
});

test('когда коды введены: ФИО не принимаются, код — принимается, группа берётся из листа «Коды»', () => {
  const { s, token } = teacher();
  const c = s.post({ action: 'createCodes', token, group: 'Х-31', count: 1 }).codes[0].code;
  const byName = { name: 'Иванова Анна', group: 'Х-31', deviceId: 'dev-1' };
  assert.equal(s.post(adm(byName)).error, 'bad_code');
  assert.equal(s.post({ action: 'saveProgress', student: byName, lab: 'lab-08', data: 'j.xyz' }).error, 'bad_code');
  assert.equal(s.post({ action: 'activity', student: byName, act: { view: 'home' } }).error, 'bad_code');
  assert.equal(s.post({ action: 'getStatus', lab: 'lab-06-07', student: byName }).status, null);
  assert.equal(s.post({ action: 'getStatus', lab: 'lab-06-07', student: byName }).needCode, true);
  const me = { name: G.formatCode(c), group: 'какая-то другая', deviceId: 'dev-1' };
  assert.equal(s.post(adm(me)).ok, true);
  const r = s.post({ action: 'listRequests', token }).requests[0];
  assert.deepEqual([String(r.name), r.group], [c, 'Х-31']);
  assert.equal(s.post({ action: 'getStatus', lab: 'lab-06-07', student: { name: c, group: '', deviceId: 'другое-устройство' } }).status.status, 'pending', 'с другого устройства — по коду');
  assert.equal(s.post({ action: 'saveProgress', student: me, lab: 'lab-08', data: 'j.abc' }).ok, true);
  assert.equal(s.post({ action: 'loadProgress', student: { name: c, deviceId: 'x' } }).items[0].data, 'j.abc');
  assert.ok(!sheetText(s).includes('Иванова'), 'ФИО в таблицу не попало');
});

test('замена ФИО кодами: во всех листах и в тексте протокола; допуск и прогресс находятся по коду', () => {
  const { s, token } = teacher();
  const anna = { name: 'Ковалёва Анна', group: 'Х-31', deviceId: 'dev-anna' };
  const bek = { name: 'Беков Ерлан', group: 'Х-32', deviceId: 'dev-bek' };
  s.post(adm(anna));
  s.post(adm({ ...anna, name: 'ковалева  анна' })); // то же ФИО, записанное иначе
  s.post(adm(bek));
  s.post({ action: 'submitReport', clientId: 'r1', payload: { lab: 'lab-06-07', grade: 5, points: 0, student: anna, reportText: 'Студент: Ковалёва Анна · Группа: Х-31', journal: [] } });
  s.post({ action: 'saveProgress', student: anna, lab: 'lab-08', data: 'j.progress' });
  // ФИО в комментариях преподавателя (в т. ч. о другом студенте, в другом регистре и с «е» вместо «ё»)
  const reqs = s.post({ action: 'listRequests', token }).requests;
  s.post({ action: 'decide', token, id: reqs.find((r) => r.group === 'Х-32').id, status: 'denied', comment: 'Как у КОВАЛЕВА АННА — повторите теорию' });
  const rid = s.post({ action: 'listReports', token }).reports[0].id;
  s.post({ action: 'setGrade', token, id: rid, grade: 5, comment: 'Ковалёва Анна: отлично; Беков Ерлан помогал' });
  assert.equal(s.post({ action: 'listCodes', token }).legacy, 2);

  const res = s.post({ action: 'migrateToCodes', token });
  assert.equal(res.ok, true);
  assert.equal(res.mapping.length, 2, 'одно ФИО + группа — один код');
  const codeOf = Object.fromEntries(res.mapping.map((m) => [m.name.toLowerCase().replace('ё', 'е').replace(/\s+/g, ' '), m.code]));
  const ca = codeOf['ковалева анна'];
  assert.ok(ca && G.normalizeCode(ca));

  const text = sheetText(s);
  for (const word of ['Ковалёва', 'Ковалева', 'ковалева', 'КОВАЛЕВА', 'Беков']) assert.ok(!text.includes(word), 'в таблице не осталось: ' + word);
  assert.match(text, /повторите теорию/, 'остальной текст комментария на месте');
  assert.equal(s.post({ action: 'listCodes', token }).legacy, 0);
  assert.equal(s.post({ action: 'listCodes', token }).codes.length, 2);
  assert.equal(s.post({ action: 'deleteCode', token, code: ca }).error, 'bad_request', 'код с данными удалить нельзя');

  // студент вводит выданный код на своём устройстве — допуск находится, прогресс тоже
  const annaCode = { name: ca, group: '', deviceId: 'dev-anna' };
  assert.equal(s.post({ action: 'getStatus', lab: 'lab-06-07', student: annaCode }).status.status, 'pending');
  assert.equal(s.post({ action: 'loadProgress', student: annaCode }).items[0].data, 'j.progress');
  const rep = s.post({ action: 'listReports', token }).reports[0];
  assert.equal(String(rep.name), ca);
  const full = s.post({ action: 'getReport', token, id: rep.id });
  const data = plain(full.report || full);
  assert.ok(JSON.stringify(data).includes(ca), 'код в протоколе');
  assert.ok(!JSON.stringify(data).includes('Ковал'), 'ФИО в протоколе нет');
  // теперь ФИО не принимаются
  assert.equal(s.post(adm(bek)).error, 'bad_code');
  // повторный запуск ничего не меняет
  assert.deepEqual(plain(s.post({ action: 'migrateToCodes', token }).mapping), []);
});
