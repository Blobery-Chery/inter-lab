// app/api.js: локальный режим и сетевой режим на макете сервера (подмена fetch → backend/Code.gs в vm).
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, memoryStorage } from './api-gas-mock.js';

globalThis.localStorage = memoryStorage();
const { CONFIG } = await import('../config.js');
const { api, ApiError } = await import('../app/api.js');

const PASS = 'Секрет-пароль-1';
const admission = (extra = {}) => ({
  lab: 'lab-06-07', kind: 'admission', attempt: 1, score: 4, total: 5, pass: 4, lang: 'ru',
  answers: [{ q: 'Почему карбоксильная группа — мета-ориентант?', chosen: '−I и −M эффекты', correct: '−I и −M эффекты', ok: true }],
  startedAt: Date.now() - 60000, finishedAt: Date.now(), ...extra,
});
const report = (extra = {}) => ({
  lab: 'lab-06-07', attempt: 1, mode: 'train', lang: 'kk', grade: 4, points: 2.5,
  remarks: [{ step: 'Опыт 1, шаг 3', severity: 'major', points: 1, text: 'Температура поднялась выше 10 °C' }],
  hints: [{ step: 'Опыт 1, шаг 3', level: 2 }], results: { mass: 2.05, yield: 74.8 },
  assignment: [{ task: 'Теоретический выход', answer: '2,74 г', ok: true }],
  journal: [{ t: 'День 1 · 09:12', kind: 'act', text: 'Взвешено 2,00 г бензойной кислоты' }],
  reportText: 'Протокол целиком', finishedAt: Date.now(), ...extra,
});

let server;
function connect() {
  server = createServer();
  server.setCredentials('teacher', PASS);
  globalThis.fetch = server.fetch;
  CONFIG.BACKEND_URL = 'https://script.google.com/macros/s/TEST/exec';
  return server;
}
function teacher() {
  const token = server.post({ action: 'login', login: 'teacher', password: PASS }).token;
  return (action, data = {}) => server.post({ action, token, ...data });
}
const outboxLen = () => JSON.parse(localStorage.getItem('vlab_api_outbox') || '[]').length;

beforeEach(() => {
  localStorage.clear();
  CONFIG.BACKEND_URL = '';
  CONFIG.API_TIMEOUT_MS = 200;
  delete globalThis.fetch;
});

/* ---------------- локальный режим ---------------- */

test('локальный режим: всё работает без сервера', async () => {
  assert.equal(api.isConnected(), false);
  const s = api.getStudent();
  assert.ok(s.deviceId);
  assert.equal(api.getStudent().deviceId, s.deviceId);
  api.setStudent({ name: '  Тестовый Студент ', group: 'Х-31' });
  assert.deepEqual(api.getStudent(), { name: 'Тестовый Студент', group: 'Х-31', deviceId: s.deviceId });
  assert.equal((await api.submitAdmission(admission())).status, 'approved');
  assert.equal((await api.getStatus('lab-06-07')).status, 'approved');
  assert.equal((await api.submitAdmission(admission({ lab: 'lab-08', score: 2 }))).status, 'denied');
  assert.equal(await api.getStatus('lab-09'), null);
  assert.deepEqual(await api.submitReport(report()), { ok: true, id: (JSON.parse(localStorage.getItem('vlab_api_reports'))[0].id), queued: false, local: true });
  assert.deepEqual(await api.getSettings(), { labs: {} });
  assert.deepEqual(await api.getAccess(), { status: 'open', comment: '' });
  assert.deepEqual(await api.requestAccess(), { ok: true, status: 'open' });
  assert.deepEqual(await api.flushOutbox(), { sent: 0, pending: 0 });
});

/* ---------------- сетевой режим ---------------- */

test('сеть: запрос — POST text/plain с JSON {action, …}', async () => {
  connect();
  api.setStudent({ name: 'Тестовый Студент', group: 'Х-31' });
  await api.getSettings();
  const call = server.net.calls.at(-1);
  assert.equal(call.url, CONFIG.BACKEND_URL);
  assert.equal(call.opts.method, 'POST');
  assert.match(call.opts.headers['Content-Type'], /^text\/plain/);
  assert.equal(JSON.parse(call.opts.body).action, 'getSettings');
});

test('сеть: заявка → решение → статус у студента → протокол → оценка', async () => {
  connect();
  const t = teacher();
  api.setStudent({ name: 'Тестовый Студент', group: 'Х-31' });
  assert.equal(api.isConnected(), true);

  const r = await api.submitAdmission(admission());
  assert.equal(r.ok, true);
  assert.equal(r.status, 'pending');
  assert.equal((await api.getStatus('lab-06-07')).status, 'pending');

  const reqs = t('listRequests').requests;
  assert.equal(reqs.length, 1);
  assert.equal(reqs[0].name, 'Тестовый Студент');
  assert.equal(reqs[0].group, 'Х-31');
  assert.equal(reqs[0].answers[0].chosen, '−I и −M эффекты');

  t('decide', { id: reqs[0].id, status: 'approved', comment: 'Допущен(а)' });
  const st = await api.getStatus('lab-06-07');
  assert.equal(st.status, 'approved');
  assert.equal(st.comment, 'Допущен(а)');
  assert.equal(st.score, 4);

  const sent = await api.submitReport(report());
  assert.deepEqual({ ...sent, id: undefined }, { ok: true, id: undefined, queued: false, local: false });
  const reps = t('listReports').reports;
  assert.equal(reps.length, 1);
  assert.equal(reps[0].grade, 4);
  const full = t('getReport', { id: reps[0].id });
  assert.equal(full.data.remarks[0].severity, 'major');
  assert.equal(full.data.student.deviceId, api.getStudent().deviceId);

  assert.equal(t('setGrade', { id: reps[0].id, grade: 5, comment: 'Отлично оформлено' }).ok, true);
  const studs = t('listStudents').students;
  assert.equal(studs.length, 1);
  assert.equal(studs[0].labs['lab-06-07'].grade, 5);
  assert.equal(studs[0].labs['lab-06-07'].admission, 'approved');
});

test('сеть: автодопуск и отказ по порогу; настройки работ', async () => {
  connect();
  const t = teacher();
  api.setStudent({ name: 'Тестовый Студент', group: 'Х-31' });
  t('setSettings', { labs: { 'lab-08': { autoAdmit: true, hints: false }, 'lab-09': { open: false } } });
  const s = await api.getSettings();
  assert.deepEqual(s.labs['lab-08'], { open: true, hints: false, autoAdmit: true });
  assert.equal(s.labs['lab-09'].open, false);
  assert.equal((await api.submitAdmission(admission({ lab: 'lab-08', score: 5 }))).status, 'approved');
  assert.equal((await api.submitAdmission(admission({ lab: 'lab-08', score: 1 }))).status, 'denied');
  assert.equal((await api.getStatus('lab-08')).status, 'denied');
});

test('сеть: нет связи → протокол в очереди и на устройстве; при связи уходит один раз', async () => {
  connect();
  const t = teacher();
  api.setStudent({ name: 'Тестовый Студент', group: 'Х-31' });
  server.net.online = false;
  const r = await api.submitReport(report());
  assert.deepEqual([r.ok, r.queued, r.local], [true, true, false]);
  assert.equal(outboxLen(), 1);
  assert.equal(JSON.parse(localStorage.getItem('vlab_api_reports')).length, 1);
  assert.deepEqual(await api.flushOutbox(), { sent: 0, pending: 1 });

  server.net.online = true;
  // ответ сервера потерялся — запись дошла, но клиент об этом не узнал
  server.net.loseResponses = 1;
  assert.deepEqual(await api.flushOutbox(), { sent: 0, pending: 1 });
  assert.deepEqual(await api.flushOutbox(), { sent: 1, pending: 0 });
  assert.equal(outboxLen(), 0);
  assert.equal(t('listReports').reports.length, 1, 'повтор не создал дубль');
  assert.equal(JSON.parse(localStorage.getItem('vlab_api_reports'))[0].sent, true);
});

test('сеть: допуск без связи — «на рассмотрении», после связи — решение сервера', async () => {
  connect();
  const t = teacher();
  api.setStudent({ name: 'Тестовый Студент', group: 'Х-31' });
  t('setSettings', { labs: { 'lab-06-07': { autoAdmit: true } } });
  server.net.online = false;
  const r = await api.submitAdmission(admission({ score: 5 }));
  assert.deepEqual([r.status, r.queued], ['pending', true]);
  assert.equal((await api.getStatus('lab-06-07')).status, 'pending');
  server.net.online = true;
  // пока заявка в очереди, у сервера нет данных — всё равно «на рассмотрении»
  assert.equal((await api.getStatus('lab-06-07')).status, 'pending');
  assert.equal((await api.flushOutbox()).sent, 1);
  assert.equal((await api.getStatus('lab-06-07')).status, 'approved');
});

test('сеть: без связи возвращаются последние известные статус и настройки', async () => {
  connect();
  const t = teacher();
  api.setStudent({ name: 'Тестовый Студент', group: 'Х-31' });
  t('setSettings', { labs: { 'lab-10': { hints: false } } });
  await api.submitAdmission(admission());
  t('decide', { id: t('listRequests').requests[0].id, status: 'approved' });
  assert.equal((await api.getStatus('lab-06-07')).status, 'approved');
  assert.equal((await api.getSettings()).labs['lab-10'].hints, false);
  server.net.online = false;
  assert.equal((await api.getStatus('lab-06-07')).status, 'approved');
  assert.equal((await api.getSettings()).labs['lab-10'].hints, false);
  assert.equal((await api.getAccess()).status, 'open');
});

test('сеть: таймаут — понятная ошибка, запись в очереди', async () => {
  connect();
  api.setStudent({ name: 'Тестовый Студент', group: 'Х-31' });
  server.net.hang = true;
  const t0 = Date.now();
  const r = await api.submitReport(report());
  assert.ok(Date.now() - t0 < 2000);
  assert.equal(r.queued, true);
  assert.equal(JSON.parse(localStorage.getItem('vlab_api_outbox'))[0].lastError, 'timeout');
  const e = new ApiError('timeout');
  assert.ok(e.transient);
  for (const l of ['ru', 'kk', 'en']) assert.ok(e.text[l].length > 5, l);
});

test('сеть: ответ не JSON (неверный адрес) — ошибка bad_response, данные не теряются', async () => {
  connect();
  api.setStudent({ name: 'Тестовый Студент', group: 'Х-31' });
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('html'); } });
  const r = await api.submitReport(report());
  assert.equal(r.queued, true);
  globalThis.fetch = async () => ({ ok: false, status: 500, json: async () => ({}) });
  assert.equal((await api.flushOutbox()).pending, 1);
});

test('сеть: доступ к сайту только одобренным', async () => {
  connect();
  const t = teacher();
  t('setSettings', { access: 'approved' });
  assert.equal((await api.getAccess()).status, 'none');
  const noName = await api.requestAccess();
  assert.equal(noName.ok, false);
  assert.equal(noName.error, 'no_profile');
  api.setStudent({ name: 'Тестовый Студент', group: 'Х-31' });
  assert.deepEqual(await api.requestAccess(), { ok: true, status: 'pending' });
  assert.equal((await api.getAccess()).status, 'pending');
  const req = t('listRequests', { kind: 'access' }).requests[0];
  t('decide', { id: req.id, status: 'denied', comment: 'Нет в списке группы' });
  assert.deepEqual(await api.getAccess(), { status: 'denied', comment: 'Нет в списке группы' });
  t('decide', { id: req.id, status: 'approved' });
  assert.equal((await api.getAccess()).status, 'approved');
  server.net.online = false;
  assert.equal((await api.getAccess()).status, 'approved', 'без связи — последнее решение');
});

test('сеть: заявка на доступ без связи уходит из очереди', async () => {
  connect();
  const t = teacher();
  t('setSettings', { access: 'approved' });
  api.setStudent({ name: 'Тестовый Студент', group: 'Х-31' });
  server.net.online = false;
  assert.deepEqual(await api.requestAccess(), { ok: true, status: 'pending', queued: true });
  assert.equal((await api.getAccess()).status, 'pending');
  server.net.online = true;
  assert.equal((await api.flushOutbox()).sent, 1);
  assert.equal(t('listRequests', { kind: 'access' }).requests.length, 1);
});

test('сеть: отвергнутая сервером запись не зацикливается в очереди', async () => {
  connect();
  api.setStudent({ name: 'Тестовый Студент', group: 'Х-31' });
  server.net.online = false;
  await api.submitReport(report());
  server.net.online = true;
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ ok: false, error: 'bad_request', message: 'Нет идентификатора устройства.' }) });
  assert.deepEqual(await api.flushOutbox(), { sent: 0, pending: 0 });
  assert.equal(JSON.parse(localStorage.getItem('vlab_api_failed')).length, 1);
});

test('сеть: одновременные flushOutbox не отправляют дважды', async () => {
  connect();
  const t = teacher();
  api.setStudent({ name: 'Тестовый Студент', group: 'Х-31' });
  server.net.online = false;
  await api.submitReport(report());
  await api.submitReport(report({ attempt: 2 }));
  server.net.online = true;
  const [a, b] = await Promise.all([api.flushOutbox(), api.flushOutbox()]);
  assert.equal(a.sent, 2);
  assert.equal(b.sent, 2);
  assert.equal(t('listReports').reports.length, 2);
});
