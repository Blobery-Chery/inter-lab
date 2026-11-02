/**
 * Связь с преподавателем.
 *
 * КОНТРАКТ ЗАФИКСИРОВАН (docs/SPEC.md, раздел 19).
 * Движок и работы вызывают только эти функции и не меняют этот файл.
 * Сетевой режим дописывает сессия «Преподаватель» здесь же, сохраняя сигнатуры и форматы.
 *
 * ЛОКАЛЬНЫЙ режим (CONFIG.BACKEND_URL пуст):
 *   - всё хранится на устройстве;
 *   - допуск выдаётся автоматически по порогу (score >= pass);
 *   - протоколы сохраняются локально.
 *
 * СЕТЕВОЙ режим (в config.js задан BACKEND_URL — веб-приложение backend/Code.gs):
 *   - запрос: fetch POST, тело JSON.stringify({action, ...}), Content-Type text/plain (без CORS preflight);
 *   - таймаут 20 с (CONFIG.API_TIMEOUT_MS, если задан); ошибки — ApiError {code, message, text: {ru, kk, en}};
 *   - протокол всегда сохраняется и на устройстве; если связи нет — уходит в очередь (outbox)
 *     и отправляется при следующем старте и по событию online (flushOutbox);
 *   - заявка на допуск без связи тоже ставится в очередь: статус «на рассмотрении», пока не уйдёт;
 *   - статусы и настройки кэшируются: без связи возвращается последнее известное значение;
 *   - повторная отправка не создаёт дублей: у каждой записи свой clientId, сервер его проверяет.
 *
 * ---------------------------------------------------------------------------
 * payload для submitAdmission:
 * {
 *   lab: 'lab-08',                       // id работы; для инструктажа — 'lab-00'
 *   kind: 'admission' | 'briefing',      // briefing — запись в журнале инструктажа (lab-00)
 *   attempt: 2,
 *   score: 4, total: 5, pass: 4,
 *   answers: [{ q: 'текст вопроса', chosen: 'выбранный ответ', correct: 'верный ответ', ok: true }],
 *                                        // тексты — на языке, на котором студент проходил тест
 *   lang: 'ru' | 'kk' | 'en',
 *   startedAt: 1730550000000, finishedAt: 1730550300000
 * }
 *
 * payload для submitReport:
 * {
 *   lab: 'lab-08', attempt: 1, mode: 'train' | 'exam', lang: 'kk',
 *   grade: 4, points: 2.5,
 *   remarks: [{ step: 'Опыт 1, шаг 3', severity: 'minor'|'major'|'critical'|'safety', points: 1, text: '…' }],
 *   hints: [{ step: 'Опыт 1, шаг 3', level: 1 | 2 | 3 }],
 *   results: { … },                      // ключевые числа: масса, выход, т. пл., вращение…
 *   assignment: [{ task: '…', answer: '…', ok: true | false | null }],  // null — свободный ответ
 *   journal: [{ t: 'День 1 · 09:12', kind: 'act' | 'obs' | 'warn', text: '…' }],
 *   reportText: '…',                     // протокол целиком простым текстом
 *   finishedAt: 1730551000000
 * }
 *
 * В оба payload автоматически добавляется student: { name, group, deviceId }.
 * ---------------------------------------------------------------------------
 */
import { CONFIG } from '../config.js';

const K = {
  student: 'vlab_api_student',
  admissions: 'vlab_api_admissions',
  reports: 'vlab_api_reports',
  outbox: 'vlab_api_outbox',
};

function read(key, fallback) {
  try {
    const raw = globalThis.localStorage && globalThis.localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function write(key, value) {
  try {
    globalThis.localStorage && globalThis.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) { /* хранилище недоступно — работаем без памяти */ }
}

function uid() {
  try {
    if (globalThis.crypto && globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
  } catch (e) { /* нет crypto */ }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

/** true, если в config.js задан адрес сервера преподавателя. */
function isConnected() {
  return Boolean(CONFIG.BACKEND_URL);
}

/** Профиль студента: { name, group, deviceId }. deviceId создаётся один раз на устройстве. */
function getStudent() {
  const s = read(K.student, null) || {};
  if (!s.deviceId) {
    s.deviceId = uid();
    write(K.student, s);
  }
  return { name: s.name || '', group: s.group || '', deviceId: s.deviceId };
}

function setStudent({ name, group }) {
  const s = getStudent();
  const next = { ...s, name: String(name || '').trim(), group: String(group || '').trim() };
  write(K.student, next);
  return next;
}

/* ======================================================================= */
/* Локальный режим (без сервера) — как было                                  */
/* ======================================================================= */

/**
 * Заявка на допуск (или запись об инструктаже для lab-00).
 * @returns {Promise<{ok: boolean, id: string, status: 'pending'|'approved'|'denied'}>}
 */
async function localSubmitAdmission(payload) {
  const id = uid();
  const status = payload.score >= payload.pass ? 'approved' : 'denied';
  const all = read(K.admissions, {});
  all[payload.lab] = {
    id,
    status,
    score: payload.score,
    total: payload.total,
    comment: '',
    decidedAt: Date.now(),
  };
  write(K.admissions, all);
  return { ok: true, id, status };
}

/**
 * Текущий статус допуска по работе.
 * @returns {Promise<{status: 'pending'|'approved'|'denied', score: number, comment: string, decidedAt: number} | null>}
 */
async function localGetStatus(labId) {
  const all = read(K.admissions, {});
  const a = all[labId];
  return a ? { status: a.status, score: a.score, comment: a.comment || '', decidedAt: a.decidedAt || null } : null;
}

/**
 * Протокол работы.
 * @returns {Promise<{ok: boolean, id: string, queued: boolean, local: boolean}>}
 *   queued — лежит в очереди и уйдёт при подключении; local — сервер не настроен, сохранено только на устройстве.
 */
async function localSubmitReport(payload) {
  const id = uid();
  const record = { id, ...payload, student: getStudent(), savedAt: Date.now() };
  const reports = read(K.reports, []);
  reports.push(record);
  write(K.reports, reports);
  return { ok: true, id, queued: false, local: true };
}

/**
 * Настройки работ, заданные преподавателем.
 * @returns {Promise<{labs: Object<string, {open: boolean, hints: boolean, autoAdmit: boolean}>}>}
 *   Работа, которой нет в ответе, считается открытой, с подсказками и автодопуском.
 */
async function localGetSettings() {
  return { labs: {} };
}

/**
 * Доступ к сайту целиком. Преподаватель в панели выбирает: «всем» или «только одобренным студентам».
 * @returns {Promise<{status: 'open'|'approved'|'pending'|'denied'|'none', comment: string}>}
 *   open — доступ открыт всем; none — студент ещё не подавал заявку.
 *   При 'pending' | 'denied' | 'none' сайт показывает только экран заявки на доступ.
 */
async function localGetAccess() {
  return { status: 'open', comment: '' };
}

/**
 * Заявка на доступ к сайту (ФИО и группа берутся из профиля студента).
 * @returns {Promise<{ok: boolean, status: 'open'|'approved'|'pending'|'denied'}>}
 */
async function localRequestAccess() {
  return { ok: true, status: 'open' };
}

/** Отправить очередь неотправленного. В локальном режиме отправлять некуда. */
async function localFlushOutbox() {
  const pending = read(K.outbox, []);
  return { sent: 0, pending: pending.length };
}

/* ======================================================================= */
/* Сетевой режим (задан CONFIG.BACKEND_URL)                                 */
/* ======================================================================= */

const NK = {
  settings: 'vlab_api_settings',   // последние настройки работ с сервера
  access: 'vlab_api_access',       // последний статус доступа к сайту
  failed: 'vlab_api_failed',       // записи, которые сервер отверг (не теряются)
};

const TIMEOUT_MS = 20000;          // «холодный» старт Apps Script бывает 5–10 с
const MAX_FAILED = 50;

const ERR_TEXT = {
  timeout: { ru: 'Сервер преподавателя не ответил вовремя.', kk: 'Оқытушы сервері уақытында жауап бермеді.', en: 'The teacher’s server did not respond in time.' },
  network: { ru: 'Нет связи с сервером преподавателя.', kk: 'Оқытушы серверімен байланыс жоқ.', en: 'No connection to the teacher’s server.' },
  http: { ru: 'Сервер преподавателя вернул ошибку.', kk: 'Оқытушы сервері қате қайтарды.', en: 'The teacher’s server returned an error.' },
  bad_response: { ru: 'Сервер ответил не так, как ожидалось. Проверьте адрес в config.js.', kk: 'Сервер күтілгендей жауап бермеді. config.js ішіндегі мекенжайды тексеріңіз.', en: 'Unexpected server response. Check the address in config.js.' },
  busy: { ru: 'Сервер занят, повторим чуть позже.', kk: 'Сервер бос емес, сәлден соң қайталаймыз.', en: 'The server is busy; we will retry shortly.' },
  setup: { ru: 'Сервер преподавателя ещё не настроен.', kk: 'Оқытушы сервері әлі бапталмаған.', en: 'The teacher’s server is not set up yet.' },
  bad_request: { ru: 'Сервер не принял запрос.', kk: 'Сервер сұрауды қабылдамады.', en: 'The server rejected the request.' },
  no_profile: { ru: 'Укажите ФИО и группу.', kk: 'Аты-жөніңізді және тобыңызды көрсетіңіз.', en: 'Enter your full name and group.' },
  server: { ru: 'Ошибка на сервере преподавателя.', kk: 'Оқытушы серверіндегі қате.', en: 'Error on the teacher’s server.' },
};

/** Ошибка связи с сервером: code — машинный код, text — понятный текст на трёх языках. */
export class ApiError extends Error {
  constructor(code, message, extra = {}) {
    const text = ERR_TEXT[code] || ERR_TEXT.server;
    super(message || text.ru);
    this.name = 'ApiError';
    this.code = code;
    this.text = text;
    Object.assign(this, extra);
  }
  /** Временная ли ошибка (стоит повторить позже). */
  get transient() {
    return ['timeout', 'network', 'http', 'busy', 'setup', 'server', 'bad_response'].includes(this.code);
  }
}

/** Один запрос к серверу: POST text/plain, ответ JSON {ok, …}. */
async function call(action, data = {}, { timeout = CONFIG.API_TIMEOUT_MS || TIMEOUT_MS } = {}) {
  if (typeof globalThis.fetch !== 'function') throw new ApiError('network', 'fetch недоступен');
  const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
  let timer;
  // Таймер и обрывает запрос (signal), и не даёт зависнуть, если fetch не поддерживает signal.
  const expire = new Promise((_, rej) => {
    timer = setTimeout(() => { if (ctrl) ctrl.abort(); rej(new ApiError('timeout')); }, timeout);
  });
  let res;
  try {
    const req = fetch(CONFIG.BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...data, action }),
      redirect: 'follow',
      signal: ctrl ? ctrl.signal : undefined,
    });
    res = await Promise.race([req, expire]);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(ctrl && ctrl.signal.aborted ? 'timeout' : 'network', e && e.message);
  } finally {
    clearTimeout(timer);
  }
  if (!res || !res.ok) {
    const st = res ? res.status : 0;
    throw new ApiError(st === 400 || st === 404 ? 'bad_response' : 'http', 'HTTP ' + st, { status: st });
  }
  let body;
  try {
    body = await res.json();
  } catch (e) {
    throw new ApiError('bad_response', 'ответ не JSON');
  }
  if (!body || typeof body !== 'object') throw new ApiError('bad_response', 'пустой ответ');
  if (body.ok === false) throw new ApiError(body.error && ERR_TEXT[body.error] ? body.error : (body.error === 'bad_action' || body.error === 'bad_json' || body.error === 'not_found' ? 'bad_request' : 'server'), body.message, { serverCode: body.error });
  return body;
}

/* ---------- очередь неотправленного ---------- */

function outbox() {
  const q = read(K.outbox, []);
  return Array.isArray(q) ? q : [];
}

function enqueue(action, data, err) {
  const q = outbox();
  if (!q.some((x) => x.id === data.clientId)) {
    q.push({ id: data.clientId, action, data, createdAt: Date.now(), attempts: 1, lastError: err ? err.code : '' });
    write(K.outbox, q);
  }
}

function queuedFor(pred) {
  return outbox().some(pred);
}

function setLocalAdmission(lab, rec) {
  const all = read(K.admissions, {});
  all[lab] = rec;
  write(K.admissions, all);
}

function markReportSent(id, sent) {
  const reports = read(K.reports, []);
  const r = Array.isArray(reports) ? reports.find((x) => x.id === id) : null;
  if (r) { r.sent = sent; write(K.reports, reports); }
}

/** Что делать после успешной отправки записи (из очереди или сразу). */
function afterSent(action, data, res) {
  if (action === 'submitAdmission') {
    const p = data.payload || {};
    setLocalAdmission(p.lab, {
      id: res.id || data.clientId, status: res.status || 'pending', score: p.score, total: p.total,
      comment: '', decidedAt: res.status && res.status !== 'pending' ? Date.now() : null,
    });
  } else if (action === 'submitReport') {
    markReportSent(data.clientId, true);
  } else if (action === 'requestAccess') {
    write(NK.access, { status: res.status || 'pending', comment: '', at: Date.now() });
  }
}

let flushing = null;

async function netFlushOutbox() {
  if (flushing) return flushing;
  flushing = (async () => {
    let sent = 0;
    const q = outbox();
    const keep = [];
    const failed = read(NK.failed, []);
    let stop = false;
    for (const item of q) {
      if (stop) { keep.push(item); continue; }
      try {
        const res = await call(item.action, item.data);
        afterSent(item.action, item.data, res);
        sent += 1;
      } catch (e) {
        const err = e instanceof ApiError ? e : new ApiError('network', e && e.message);
        if (err.transient) {
          keep.push({ ...item, attempts: (item.attempts || 0) + 1, lastError: err.code });
          stop = true;                         // связи нет — остальное не пытаемся
        } else {
          failed.push({ ...item, failedAt: Date.now(), lastError: err.serverCode || err.code, message: err.message });
        }
      }
    }
    // Пока шла отправка, могли добавиться новые записи — сохраняем их.
    const ids = new Set(q.map((x) => x.id));
    const added = outbox().filter((x) => !ids.has(x.id));
    write(K.outbox, keep.concat(added));
    if (failed.length) write(NK.failed, failed.slice(-MAX_FAILED));
    return { sent, pending: keep.length + added.length };
  })();
  try {
    return await flushing;
  } finally {
    flushing = null;
  }
}

/* ---------- действия студента ---------- */

async function netSubmitAdmission(payload) {
  const id = uid();
  const data = { clientId: id, payload: { ...payload, student: getStudent() } };
  try {
    const res = await call('submitAdmission', data);
    afterSent('submitAdmission', data, res);
    return { ok: true, id: res.id || id, status: res.status || 'pending' };
  } catch (e) {
    if (e instanceof ApiError && !e.transient) return { ok: false, id, status: 'pending', error: e.code, message: e.message, text: e.text };
    // Нет связи: заявка уйдёт при подключении, а пока — «на рассмотрении».
    enqueue('submitAdmission', data, e);
    setLocalAdmission(payload.lab, { id, status: 'pending', score: payload.score, total: payload.total, comment: '', decidedAt: null });
    return { ok: true, id, status: 'pending', queued: true };
  }
}

function statusShape(a) {
  return a ? { status: a.status, score: a.score, comment: a.comment || '', decidedAt: a.decidedAt || null } : null;
}

async function netGetStatus(labId) {
  const cached = read(K.admissions, {})[labId];
  // Заявка ещё в очереди — у сервера старые данные, показываем «на рассмотрении».
  if (queuedFor((x) => x.action === 'submitAdmission' && x.data.payload && x.data.payload.lab === labId)) {
    return statusShape(cached) || { status: 'pending', score: null, comment: '', decidedAt: null };
  }
  try {
    const res = await call('getStatus', { lab: labId, student: getStudent() });
    const st = res.status;
    if (!st) {
      const all = read(K.admissions, {});
      if (all[labId]) { delete all[labId]; write(K.admissions, all); }
      return null;
    }
    setLocalAdmission(labId, { ...(cached || {}), status: st.status, score: st.score, comment: st.comment || '', decidedAt: st.decidedAt || null });
    return statusShape(st);
  } catch (e) {
    return statusShape(cached);
  }
}

async function netSubmitReport(payload) {
  const id = uid();
  const student = getStudent();
  const record = { id, ...payload, student, savedAt: Date.now(), sent: false };
  const reports = read(K.reports, []);
  reports.push(record);
  write(K.reports, reports);
  const data = { clientId: id, payload: { ...payload, student } };
  try {
    const res = await call('submitReport', data);
    afterSent('submitReport', data, res);
    return { ok: true, id, queued: false, local: false };
  } catch (e) {
    if (e instanceof ApiError && !e.transient) {
      return { ok: false, id, queued: false, local: true, error: e.code, message: e.message, text: e.text };
    }
    enqueue('submitReport', data, e);
    return { ok: true, id, queued: true, local: false };
  }
}

async function netGetSettings() {
  try {
    const res = await call('getSettings', {});
    const labs = res.labs && typeof res.labs === 'object' ? res.labs : {};
    write(NK.settings, { labs, at: Date.now() });
    return { labs };
  } catch (e) {
    const c = read(NK.settings, null);
    return { labs: (c && c.labs) || {} };
  }
}

async function netGetAccess() {
  if (queuedFor((x) => x.action === 'requestAccess')) return { status: 'pending', comment: '' };
  try {
    const res = await call('getAccess', { student: getStudent() });
    const out = { status: res.status || 'open', comment: res.comment || '' };
    write(NK.access, { ...out, at: Date.now() });
    return out;
  } catch (e) {
    // Без связи — последнее известное решение; если его нет, сайт не блокируем.
    const c = read(NK.access, null);
    return c ? { status: c.status, comment: c.comment || '' } : { status: 'open', comment: '' };
  }
}

async function netRequestAccess() {
  const student = getStudent();
  if (!student.name || !student.group) {
    const e = new ApiError('no_profile');
    return { ok: false, status: 'none', error: e.code, message: e.message, text: e.text };
  }
  const data = { clientId: uid(), student };
  try {
    const res = await call('requestAccess', data);
    afterSent('requestAccess', data, res);
    return { ok: true, status: res.status || 'pending' };
  } catch (e) {
    if (e instanceof ApiError && !e.transient) return { ok: false, status: 'none', error: e.code, message: e.message, text: e.text };
    enqueue('requestAccess', data, e);
    write(NK.access, { status: 'pending', comment: '', at: Date.now() });
    return { ok: true, status: 'pending', queued: true };
  }
}

/* ======================================================================= */
/* Публичные функции: выбор режима                                          */
/* ======================================================================= */

/**
 * Заявка на допуск (или запись об инструктаже для lab-00).
 * @returns {Promise<{ok: boolean, id: string, status: 'pending'|'approved'|'denied', queued?: boolean}>}
 *   queued — нет связи, заявка уйдёт при подключении.
 */
function submitAdmission(payload) {
  return isConnected() ? netSubmitAdmission(payload) : localSubmitAdmission(payload);
}

/**
 * Текущий статус допуска по работе.
 * @returns {Promise<{status: 'pending'|'approved'|'denied', score: number, comment: string, decidedAt: number} | null>}
 */
function getStatus(labId) {
  return isConnected() ? netGetStatus(labId) : localGetStatus(labId);
}

/**
 * Протокол работы.
 * @returns {Promise<{ok: boolean, id: string, queued: boolean, local: boolean}>}
 */
function submitReport(payload) {
  return isConnected() ? netSubmitReport(payload) : localSubmitReport(payload);
}

/** @returns {Promise<{labs: Object<string, {open: boolean, hints: boolean, autoAdmit: boolean}>}>} */
function getSettings() {
  return isConnected() ? netGetSettings() : localGetSettings();
}

/** @returns {Promise<{status: 'open'|'approved'|'pending'|'denied'|'none', comment: string}>} */
function getAccess() {
  return isConnected() ? netGetAccess() : localGetAccess();
}

/** @returns {Promise<{ok: boolean, status: 'open'|'approved'|'pending'|'denied'}>} */
function requestAccess() {
  return isConnected() ? netRequestAccess() : localRequestAccess();
}

/** Отправить очередь неотправленного. @returns {Promise<{sent: number, pending: number}>} */
function flushOutbox() {
  return isConnected() ? netFlushOutbox() : localFlushOutbox();
}

// В браузере: повтор очереди при старте и при появлении связи.
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('online', () => { flushOutbox().catch(() => {}); });
  setTimeout(() => { if (isConnected()) flushOutbox().catch(() => {}); }, 1500);
}
export const api = {
  isConnected,
  getStudent,
  setStudent,
  submitAdmission,
  getStatus,
  submitReport,
  getSettings,
  getAccess,
  requestAccess,
  flushOutbox,
};

export default api;
