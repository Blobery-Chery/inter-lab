/**
 * Хранилище на устройстве: localStorage с префиксом vlab_, поле schemaVersion, все обращения в try/catch.
 * Ключи app/api.js (vlab_api_*) этот модуль не трогает — ими владеет api.js.
 */
export const PREFIX = 'vlab_';
export const SCHEMA_VERSION = 1;

const mem = new Map(); // запасное хранилище, если localStorage недоступен (приватный режим, Node)

function ls() {
  try {
    const s = globalThis.localStorage;
    if (!s) return null;
    return s;
  } catch (e) { return null; }
}

export function get(key, fallback = null) {
  const k = PREFIX + key;
  try {
    const s = ls();
    const raw = s ? s.getItem(k) : (mem.has(k) ? mem.get(k) : null);
    return raw == null ? fallback : JSON.parse(raw);
  } catch (e) { return fallback; }
}

export function set(key, value) {
  const k = PREFIX + key;
  const raw = JSON.stringify(value);
  try {
    const s = ls();
    if (s) s.setItem(k, raw); else mem.set(k, raw);
    return true;
  } catch (e) {
    mem.set(k, raw);
    return false;
  }
}

export function remove(key) {
  const k = PREFIX + key;
  try { const s = ls(); if (s) s.removeItem(k); } catch (e) { /* нет хранилища */ }
  mem.delete(k);
}

/** Все ключи (без префикса), начинающиеся с start. Ключи api.js исключены. */
export function keys(start = '') {
  const out = new Set();
  try {
    const s = ls();
    if (s) for (let i = 0; i < s.length; i++) {
      const k = s.key(i);
      if (k && k.startsWith(PREFIX + start) && !k.startsWith(PREFIX + 'api_')) out.add(k.slice(PREFIX.length));
    }
  } catch (e) { /* нет хранилища */ }
  for (const k of mem.keys()) if (k.startsWith(PREFIX + start) && !k.startsWith(PREFIX + 'api_')) out.add(k.slice(PREFIX.length));
  return [...out];
}

/** Проверка версии схемы: при несовпадении прогресс старого формата удаляется (настройки сохраняются). */
export function migrate() {
  const v = get('schemaVersion', null);
  if (v === SCHEMA_VERSION) return;
  if (v != null) for (const k of keys('lab_')) remove(k);
  set('schemaVersion', SCHEMA_VERSION);
}

/** «Сбросить прогресс»: опыты, протоколы и ответы. Язык, тема и профиль остаются. */
export function resetProgress() {
  for (const k of keys('lab_')) remove(k);
}

/** Прогресс работы: { runs:{expId:run}, attempts:{expId:n}, results:{expId:{…}}, clock, assignment, report } */
export function loadLab(labId) {
  return get('lab_' + labId, null) || { runs: {}, attempts: {}, results: {}, clock: 0, assignment: {}, report: null, admission: null };
}

export function saveLab(labId, progress) {
  return set('lab_' + labId, progress);
}
