// Список «код → ФИО» преподавателя. Хранится только в этом браузере (localStorage) и в файле CSV,
// который преподаватель сохраняет у себя. На сервер не отправляется ни в одном запросе:
// панель передаёт серверу только коды.
import { normalizeCode, formatCode } from '../app/code.js';
import { toCsv, csvDate } from './csv.js';

export const NAMES_KEY = 'vlab_teacher_names';

/**
 * @param {{persist?: boolean, seed?: object, storage?: Storage}} o
 *   persist — хранить в localStorage (в демо-режиме — нет: демо не трогает настоящий список);
 *   seed — начальные записи {код: ФИО}.
 */
export function createNames({ persist = true, seed = {}, storage = globalThis.localStorage } = {}) {
  let map = {};
  if (persist) {
    try { const raw = storage && storage.getItem(NAMES_KEY); if (raw) map = JSON.parse(raw) || {}; } catch (e) { map = {}; }
  }
  for (const [k, v] of Object.entries(seed)) { const c = normalizeCode(k); if (c && !map[c]) map[c] = v; }
  const save = () => {
    if (!persist) return;
    try { storage.setItem(NAMES_KEY, JSON.stringify(map)); } catch (e) { /* нет хранилища */ }
  };
  return {
    get(code) { const c = normalizeCode(code); return c ? map[c] || '' : ''; },
    set(code, name) {
      const c = normalizeCode(code);
      if (!c) return;
      const n = String(name ?? '').replace(/\s+/g, ' ').trim();
      if (n) map[c] = n; else delete map[c];
      save();
    },
    /** entries — [[код, ФИО], …]; пустые ФИО не затирают уже записанные. Возвращает число новых/изменённых. */
    merge(entries) {
      let n = 0;
      for (const [code, name] of entries) {
        const c = normalizeCode(code);
        const v = String(name ?? '').replace(/\s+/g, ' ').trim();
        if (!c || !v || map[c] === v) continue;
        map[c] = v; n++;
      }
      if (n) save();
      return n;
    },
    remove(code) { const c = normalizeCode(code); if (c && map[c] != null) { delete map[c]; save(); } },
    clear() { map = {}; if (persist) { try { storage.removeItem(NAMES_KEY); } catch (e) { /* нет хранилища */ } } },
    size() { return Object.keys(map).length; },
    all() { return { ...map }; },
  };
}

/**
 * CSV «Код; ФИО; Группа; Создан; Первый вход» — для хранения у преподавателя.
 * rows — [{code, name, group, createdAt, usedAt}]; tr — перевод объектов {ru,kk,en} (в демо ФИО — такие объекты).
 */
export function namesCsv(rows, t, tr = (x) => x) {
  const head = [t('studentCode'), t('fullName'), t('group'), t('codeCreated'), t('codeUsed')];
  return toCsv([head, ...rows.map((r) => [formatCode(r.code), tr(r.name) || '', r.group || '', csvDate(r.createdAt), csvDate(r.usedAt)])]);
}

/** Разбор CSV/TSV (в т. ч. после правки в Excel): «;», «,» или табуляция, кавычки, BOM. */
export function parseTable(text) {
  const s = String(text || '').replace(/^﻿/, '');
  const first = s.split(/\r?\n/, 1)[0] || '';
  const count = (ch) => first.split(ch).length - 1;
  const sep = [';', '\t', ','].sort((a, b) => count(b) - count(a))[0];
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) {
      if (ch === '"') { if (s[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === sep) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.map((r) => r.map((c) => c.trim())).filter((r) => r.some(Boolean));
}

const NAME_HEAD = /фио|аты|name|имя|студент|student/i;

/** Пары [код, ФИО] из таблицы: столбец кодов находится по содержимому, столбец ФИО — по заголовку или следующий за кодом. */
export function namesFromTable(text) {
  const rows = parseTable(text);
  if (!rows.length) return [];
  const width = Math.max(...rows.map((r) => r.length));
  let codeCol = -1, best = 0;
  for (let c = 0; c < width; c++) {
    const n = rows.filter((r) => normalizeCode(r[c])).length;
    if (n > best) { best = n; codeCol = c; }
  }
  if (codeCol < 0) return [];
  const head = normalizeCode(rows[0][codeCol]) ? null : rows[0];
  let nameCol = head ? head.findIndex((h, i) => i !== codeCol && NAME_HEAD.test(h) && !/код|code/i.test(h)) : -1;
  if (nameCol < 0) nameCol = codeCol + 1 < width ? codeCol + 1 : codeCol - 1;
  return rows.filter((r) => normalizeCode(r[codeCol]) && r[nameCol]).map((r) => [normalizeCode(r[codeCol]), r[nameCol]]);
}
