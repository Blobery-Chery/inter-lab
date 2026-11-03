// Проверка backend/Code.gs в Node: чистые функции и действия doPost на макете Google Таблицы.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { CODE_GS, createServer } from './api-gas-mock.js';

// Чистые функции берём через module.exports (как это видит Node).
function loadPure() {
  const module = { exports: {} };
  const ctx = vm.createContext({ module, console });
  vm.runInContext(CODE_GS, ctx, { filename: 'Code.gs' });
  return module.exports;
}
const G = loadPure();
// Объекты из другого контекста vm сравниваем как JSON.
const plain = (x) => JSON.parse(JSON.stringify(x));
const hmacHex = (m, k) => crypto.createHmac('sha256', k).update(m).digest('hex');
const b64 = (s) => Buffer.from(s, 'utf8').toString('base64url');
const unb64 = (s) => Buffer.from(s, 'base64url').toString('utf8');


test('bytesToHex понимает знаковые байты Apps Script', () => {
  assert.equal(G.bytesToHex([0, 15, -1, -128, 127]), '000fff807f');
});

test('хэш пароля: детерминирован, зависит от соли и пароля', () => {
  const a = G.hashPassword('пароль-123', 'соль1', 50, hmacHex);
  assert.equal(a, G.hashPassword('пароль-123', 'соль1', 50, hmacHex));
  assert.notEqual(a, G.hashPassword('пароль-123', 'соль2', 50, hmacHex));
  assert.notEqual(a, G.hashPassword('пароль-124', 'соль1', 50, hmacHex));
  assert.match(a, /^[0-9a-f]{64}$/);
});

test('safeEqual', () => {
  assert.ok(G.safeEqual('abc', 'abc'));
  assert.ok(!G.safeEqual('abc', 'abd'));
  assert.ok(!G.safeEqual('abc', 'abcd'));
  assert.ok(!G.safeEqual(null, 'x'));
});

test('токен: действует 12 ч, подделку и просрочку не принимает', () => {
  const now = 1_700_000_000_000;
  const t = G.makeToken('teacher', now, G.VLAB.TOKEN_TTL_MS, 'secret', hmacHex, b64);
  assert.equal(G.verifyToken(t, now + 1000, 'secret', hmacHex, unb64).u, 'teacher');
  assert.equal(G.verifyToken(t, now + 12 * 3600 * 1000 + 1, 'secret', hmacHex, unb64), null);
  assert.equal(G.verifyToken(t, now, 'other-secret', hmacHex, unb64), null);
  const [body, sig] = t.split('.');
  const forged = b64(JSON.stringify({ u: 'teacher', exp: now + 10 ** 10 })) + '.' + sig;
  assert.equal(G.verifyToken(forged, now, 'secret', hmacHex, unb64), null);
  assert.equal(G.verifyToken(body, now, 'secret', hmacHex, unb64), null);
  assert.equal(G.verifyToken('', now, 'secret', hmacHex, unb64), null);
});

test('защита от перебора: 5 неудач → блокировка 15 мин, успех сбрасывает', () => {
  let s = { fails: 0, lockedUntil: 0 };
  for (let i = 0; i < 4; i++) s = G.loginAttemptState(s, false, 1000);
  assert.equal(s.fails, 4);
  assert.equal(s.lockedUntil, 0);
  s = G.loginAttemptState(s, false, 1000);
  assert.equal(s.lockedUntil, 1000 + 15 * 60 * 1000);
  assert.deepEqual(plain(G.loginAttemptState({ fails: 3, lockedUntil: 0 }, true, 1)), { fails: 0, lockedUntil: 0 });
});

test('cellText не пропускает формулы и режет длинное', () => {
  assert.equal(G.cellText('=IMPORTXML("x")'), "'=IMPORTXML(\"x\")");
  assert.equal(G.cellText('+7 700'), "'+7 700");
  assert.equal(G.cellText('Иванова'), 'Иванова');
  assert.equal(G.cellText('a'.repeat(50), 10), 'a'.repeat(10) + '…');
  assert.equal(G.cellText(null), '');
});

test('normalizeName и studentKey', () => {
  assert.equal(G.normalizeName('  Пётр   Иванов '), 'петр иванов');
  assert.equal(G.studentKey({ deviceId: 'd1', name: 'Пётр Иванов' }), G.studentKey({ deviceId: 'd1', name: 'петр  иванов' }));
  assert.notEqual(G.studentKey({ deviceId: 'd1', name: 'А' }), G.studentKey({ deviceId: 'd2', name: 'А' }));
});

test('initialStatus: ниже порога — отказ, иначе автодопуск или ожидание', () => {
  assert.equal(G.initialStatus('admission', 3, 4, true), 'denied');
  assert.equal(G.initialStatus('admission', 4, 4, true), 'approved');
  assert.equal(G.initialStatus('admission', 5, 4, false), 'pending');
  assert.equal(G.initialStatus('briefing', 9, 8, false), 'pending');
  assert.equal(G.initialStatus('access', 0, 0, true), 'pending');
});

test('настройки работ: умолчания и все работы дисциплины', () => {
  const all = G.allLabSettings({ 'lab-08': { open: false } });
  assert.deepEqual(plain(all['lab-08']), { open: false, hints: true, autoAdmit: false });
  assert.deepEqual(plain(all['lab-00']), { open: true, hints: true, autoAdmit: false });
  for (const id of ['lab-00', 'lab-06-07', 'lab-08', 'lab-09', 'lab-10', 'lab-11', 'lab-12', 'lab-13', 'lab-14', 'lab-15']) assert.ok(all[id], id);
});

test('packReport укладывает огромный протокол в ячейку 50 000 символов', () => {
  const journal = Array.from({ length: 3000 }, (_, i) => ({ t: 'День 1 · 09:' + String(i % 60).padStart(2, '0'), kind: 'act', text: 'Действие номер ' + i + ' — подробное описание операции' }));
  const r = { lab: 'lab-06-07', grade: 4, points: 2, journal, reportText: 'Протокол '.repeat(2000) };
  const { json, truncated } = G.packReport(r);
  assert.ok(truncated);
  assert.ok(json.length <= G.VLAB.CELL_LIMIT);
  const back = JSON.parse(json);
  assert.equal(back.grade, 4);
  assert.equal(back.journal[0].text, journal[0].text);
  assert.equal(back.journal.at(-1).text, journal.at(-1).text);
  assert.ok(back.journal.some((x) => /сокращён/.test(x.text)));
  const small = G.packReport({ lab: 'x', journal: [] });
  assert.equal(small.truncated, false);
});

test('сводка студент × работа', () => {
  const reqs = [
    { kind: 'briefing', lab: 'lab-00', status: 'approved', name: 'Студент А', group: 'Х-31', deviceId: 'd1', createdAt: 1, score: 9, total: 10 },
    { kind: 'admission', lab: 'lab-06-07', status: 'denied', name: 'Студент А', group: 'Х-31', deviceId: 'd1', createdAt: 2, score: 2, total: 5 },
    { kind: 'admission', lab: 'lab-06-07', status: 'approved', name: 'студент а', group: 'Х-31', deviceId: 'd1', createdAt: 3, score: 5, total: 5 },
    { kind: 'access', lab: '', status: 'approved', name: 'Студент Б', group: 'Х-32', deviceId: 'd2', createdAt: 1 },
  ];
  const reps = [{ lab: 'lab-06-07', name: 'Студент А', group: 'Х-31', deviceId: 'd1', createdAt: 4, grade: 4, teacherGrade: 5 }];
  const m = G.buildStudentMatrix(reqs, reps, 'approved');
  assert.equal(m.length, 2);
  const a = m.find((x) => x.deviceId === 'd1');
  assert.equal(a.labs['lab-06-07'].admission, 'approved');
  assert.equal(a.labs['lab-06-07'].grade, 5);
  assert.equal(a.labs['lab-00'].admission, 'approved');
  assert.equal(a.access, 'none');
  assert.equal(m.find((x) => x.deviceId === 'd2').access, 'approved');
});

test('доступ к сайту: всем — open; только одобренным — по последней заявке', () => {
  const st = { deviceId: 'd1', name: 'А' };
  assert.equal(G.accessStatusOf('all', [], st).status, 'open');
  assert.equal(G.accessStatusOf('approved', [], st).status, 'none');
  const reqs = [
    { kind: 'access', status: 'denied', comment: 'нет в списке', deviceId: 'd1', name: 'А', createdAt: 1 },
    { kind: 'access', status: 'pending', deviceId: 'd1', name: 'А', createdAt: 2 },
  ];
  assert.equal(G.accessStatusOf('approved', reqs, st).status, 'pending');
});

test('сортировка заявок: сначала ожидающие, затем новые', () => {
  const s = G.sortRequests([
    { id: 1, status: 'approved', createdAt: 5 },
    { id: 2, status: 'pending', createdAt: 1 },
    { id: 3, status: 'pending', createdAt: 3 },
  ]);
  assert.deepEqual(s.map((x) => x.id), [3, 2, 1]);
});

test('сводка на почту пуста, если ничего нового', () => {
  assert.equal(G.digestText([], [], 0), '');
  const t = G.digestText([{ kind: 'admission', lab: 'lab-08', status: 'pending', name: 'А', group: 'Г', score: 4, total: 5, createdAt: 10 }], [], 0);
  assert.match(t, /Ожидают решения: 1/);
});

/* ---------------- doPost на макете таблицы ---------------- */

const student = { name: 'Тестовый Студент', group: 'Х-31', deviceId: 'dev-1' };
const adm = (extra = {}) => ({ action: 'submitAdmission', clientId: crypto.randomUUID(), payload: { lab: 'lab-06-07', kind: 'admission', attempt: 1, score: 4, total: 5, pass: 4, lang: 'ru', answers: [{ q: 'Вопрос', chosen: 'A', correct: 'A', ok: true }], student, ...extra } });

test('doGet и неверные запросы', () => {
  const s = createServer();
  assert.equal(JSON.parse(s.ctx.doGet().getContent()).ok, true);
  assert.equal(s.post('{не json').error, 'bad_json');
  assert.equal(s.post({ action: 'nope' }).error, 'bad_action');
  assert.equal(s.post({ action: 'listRequests' }).error, 'auth');
  assert.equal(s.post({ action: 'login', login: 'x', password: 'y' }).error, 'setup');
});

test('меню «Задать логин и пароль»: хранится только хэш с солью', () => {
  const s = createServer();
  s.setCredentials('teacher', 'Секрет-пароль-1');
  assert.equal(s.props.TEACHER_LOGIN, 'teacher');
  assert.ok(s.props.TEACHER_SALT.length > 30);
  assert.match(s.props.TEACHER_HASH, /^[0-9a-f]{64}$/);
  assert.ok(!Object.values(s.props).some((v) => v.includes('Секрет-пароль-1')));
  for (const name of ['Заявки', 'Протоколы', 'Настройки', 'Студенты']) assert.ok(s.ss.getSheetByName(name), name);
  // короткий пароль не принимается
  const s2 = createServer();
  s2.uiAnswers.push('teacher', 'short');
  s2.ctx.menuSetCredentials();
  assert.equal(s2.props.TEACHER_HASH, undefined);
  assert.match(s2.alerts.at(-1), /короткий/);
});

test('вход: верный пароль → токен; 5 ошибок → блокировка даже с верным паролем', () => {
  const s = createServer();
  s.setCredentials('teacher', 'Секрет-пароль-1');
  const ok = s.post({ action: 'login', login: 'Teacher', password: 'Секрет-пароль-1' });
  assert.equal(ok.ok, true);
  assert.ok(ok.token);
  assert.equal(s.post({ action: 'listRequests', token: ok.token }).ok, true);
  assert.equal(s.post({ action: 'listRequests', token: ok.token + 'x' }).error, 'auth');
  for (let i = 0; i < 4; i++) assert.equal(s.post({ action: 'login', login: 'teacher', password: 'wrong' }).error, 'bad_login');
  assert.equal(s.post({ action: 'login', login: 'teacher', password: 'wrong' }).error, 'locked');
  const locked = s.post({ action: 'login', login: 'teacher', password: 'Секрет-пароль-1' });
  assert.equal(locked.error, 'locked');
  assert.ok(locked.retryAfter > 0);
  // смена пароля из меню снимает блокировку и делает старые токены недействительными
  s.setCredentials('teacher', 'Новый-пароль-2');
  assert.equal(s.post({ action: 'listRequests', token: ok.token }).error, 'auth');
  assert.equal(s.post({ action: 'login', login: 'teacher', password: 'Новый-пароль-2' }).ok, true);
});

test('заявка → решение преподавателя → статус у студента; повтор не дублирует', () => {
  const s = createServer();
  s.setCredentials('teacher', 'Секрет-пароль-1');
  const token = s.post({ action: 'login', login: 'teacher', password: 'Секрет-пароль-1' }).token;
  const req = adm();
  const r1 = s.post(req);
  assert.deepEqual([r1.ok, r1.status], [true, 'pending']);
  assert.equal(s.post(req).duplicate, true); // тот же clientId
  const list = s.post({ action: 'listRequests', token }).requests;
  assert.equal(list.length, 1);
  assert.equal(list[0].answers[0].q, 'Вопрос');
  assert.equal(list[0].name, 'Тестовый Студент');
  assert.equal(s.post({ action: 'getStatus', lab: 'lab-06-07', student }).status.status, 'pending');
  const d = s.post({ action: 'decide', token, id: list[0].id, status: 'denied', comment: 'Повторите механизм нитрования' });
  assert.equal(d.ok, true);
  const st = s.post({ action: 'getStatus', lab: 'lab-06-07', student }).status;
  assert.equal(st.status, 'denied');
  assert.equal(st.comment, 'Повторите механизм нитрования');
  // чужой студент своих данных не видит
  assert.equal(s.post({ action: 'getStatus', lab: 'lab-06-07', student: { ...student, deviceId: 'other' } }).status, null);
  // ниже порога — сразу отказ
  assert.equal(s.post(adm({ score: 2 })).status, 'denied');
  // автодопуск
  s.post({ action: 'setSettings', token, labs: { 'lab-06-07': { autoAdmit: true } } });
  assert.equal(s.post(adm({ score: 5 })).status, 'approved');
  assert.equal(s.post({ action: 'getStatus', lab: 'lab-06-07', student }).status.status, 'approved');
});

test('формулы от студента не попадают в таблицу', () => {
  const s = createServer();
  s.setCredentials('teacher', 'Секрет-пароль-1');
  s.post({ action: 'submitAdmission', payload: { lab: 'lab-08', kind: 'admission', score: 5, total: 5, pass: 4, student: { ...student, name: '=HYPERLINK("http://x")' } } });
  assert.equal(s.ss.getSheetByName('Заявки').formulas, 0);
});

test('протокол → список → открыть → оценка преподавателя → студенты', () => {
  const s = createServer();
  s.setCredentials('teacher', 'Секрет-пароль-1');
  const token = s.post({ action: 'login', login: 'teacher', password: 'Секрет-пароль-1' }).token;
  const r = s.post({ action: 'submitReport', clientId: 'rep-1', payload: { lab: 'lab-06-07', attempt: 1, mode: 'train', lang: 'ru', grade: 4, points: 2.5, remarks: [{ step: 'Опыт 1, шаг 3', severity: 'major', points: 1, text: 'Перегрев' }], hints: [], results: { mass: 2.1 }, assignment: [], journal: [{ t: 'День 1 · 09:00', kind: 'act', text: 'Начало' }], reportText: 'Протокол', finishedAt: Date.now(), student } });
  assert.equal(r.ok, true);
  assert.equal(s.post({ action: 'submitReport', clientId: 'rep-1', payload: { lab: 'lab-06-07', student } }).duplicate, true);
  const list = s.post({ action: 'listReports', token }).reports;
  assert.equal(list.length, 1);
  assert.equal(list[0].grade, 4);
  assert.equal(list[0].teacherGrade, null);
  const full = s.post({ action: 'getReport', token, id: 'rep-1' });
  assert.equal(full.data.remarks[0].text, 'Перегрев');
  assert.equal(full.data.student.name, 'Тестовый Студент');
  assert.equal(s.post({ action: 'setGrade', token, id: 'rep-1', grade: 7 }).error, 'bad_request');
  assert.equal(s.post({ action: 'setGrade', token, id: 'rep-1', grade: 5, comment: 'Хороший разбор' }).teacherGrade, 5);
  assert.equal(s.post({ action: 'listReports', token }).reports[0].teacherComment, 'Хороший разбор');
  const studs = s.post({ action: 'listStudents', token }).students;
  assert.equal(studs[0].labs['lab-06-07'].grade, 5);
  assert.equal(s.post({ action: 'getReport', token, id: 'нет' }).error, 'not_found');
});

test('настройки: студент видит только работы, преподаватель — всё; почта и сводка', () => {
  const s = createServer();
  s.setCredentials('teacher', 'Секрет-пароль-1');
  const token = s.post({ action: 'login', login: 'teacher', password: 'Секрет-пароль-1' }).token;
  assert.equal(s.post({ action: 'setSettings', token, notifyEmail: 'не почта' }).error, 'bad_request');
  const set = s.post({ action: 'setSettings', token, access: 'approved', notifyMode: 'each', notifyEmail: 'teacher@example.com', labs: { 'lab-09': { open: false, hints: false } } });
  assert.equal(set.ok, true);
  const pub = s.post({ action: 'getSettings' });
  assert.deepEqual(pub.labs['lab-09'], { open: false, hints: false, autoAdmit: false });
  assert.equal(pub.notifyEmail, undefined);
  assert.equal(s.post({ action: 'getSettings', token }).notifyEmail, 'teacher@example.com');
  s.post(adm());
  assert.equal(s.mail.length, 1);
  assert.equal(s.mail[0].to, 'teacher@example.com');
  assert.ok(!/Секрет/.test(s.mail[0].body));
  s.post({ action: 'setSettings', token, notifyMode: 'daily' });
  assert.equal(s.triggers.length, 1);
  s.post({ action: 'setSettings', token, notifyMode: 'daily' });
  assert.equal(s.triggers.length, 1);
  s.ctx.sendDailyDigest();
  assert.match(s.mail.at(-1).body, /Ожидают решения: 1/);
  s.post({ action: 'setSettings', token, notifyMode: 'off' });
  assert.equal(s.triggers.length, 0);
});

test('доступ к сайту по одобрению', () => {
  const s = createServer();
  s.setCredentials('teacher', 'Секрет-пароль-1');
  const token = s.post({ action: 'login', login: 'teacher', password: 'Секрет-пароль-1' }).token;
  assert.equal(s.post({ action: 'getAccess', student }).status, 'open');
  s.post({ action: 'setSettings', token, access: 'approved' });
  assert.equal(s.post({ action: 'getAccess', student }).status, 'none');
  assert.equal(s.post({ action: 'requestAccess', student: { ...student, name: '' } }).error, 'bad_request');
  assert.equal(s.post({ action: 'requestAccess', student }).status, 'pending');
  assert.equal(s.post({ action: 'requestAccess', student }).status, 'pending');
  const reqs = s.post({ action: 'listRequests', token, kind: 'access' }).requests;
  assert.equal(reqs.length, 1);
  s.post({ action: 'decide', token, id: reqs[0].id, status: 'approved' });
  assert.equal(s.post({ action: 'getAccess', student }).status, 'approved');
  assert.equal(s.post({ action: 'listStudents', token }).students[0].access, 'approved');
});
