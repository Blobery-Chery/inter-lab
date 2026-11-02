/**
 * Связь с преподавателем.
 *
 * КОНТРАКТ ЗАФИКСИРОВАН (docs/SPEC.md, раздел 19).
 * Движок и работы вызывают только эти функции и не меняют этот файл.
 * Сетевой режим дописывает сессия «Преподаватель» здесь же, сохраняя сигнатуры и форматы.
 *
 * Сейчас реализован ЛОКАЛЬНЫЙ режим (CONFIG.BACKEND_URL пуст):
 *   - всё хранится на устройстве;
 *   - допуск выдаётся автоматически по порогу (score >= pass);
 *   - протоколы сохраняются локально.
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

/**
 * Заявка на допуск (или запись об инструктаже для lab-00).
 * @returns {Promise<{ok: boolean, id: string, status: 'pending'|'approved'|'denied'}>}
 */
async function submitAdmission(payload) {
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
async function getStatus(labId) {
  const all = read(K.admissions, {});
  const a = all[labId];
  return a ? { status: a.status, score: a.score, comment: a.comment || '', decidedAt: a.decidedAt || null } : null;
}

/**
 * Протокол работы.
 * @returns {Promise<{ok: boolean, id: string, queued: boolean, local: boolean}>}
 *   queued — лежит в очереди и уйдёт при подключении; local — сервер не настроен, сохранено только на устройстве.
 */
async function submitReport(payload) {
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
async function getSettings() {
  return { labs: {} };
}

/** Отправить очередь неотправленного. В локальном режиме отправлять некуда. */
async function flushOutbox() {
  const pending = read(K.outbox, []);
  return { sent: 0, pending: pending.length };
}

export const api = {
  isConnected,
  getStudent,
  setStudent,
  submitAdmission,
  getStatus,
  submitReport,
  getSettings,
  flushOutbox,
};

export default api;
