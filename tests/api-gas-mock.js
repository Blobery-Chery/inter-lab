// Макет Google Apps Script для проверки backend/Code.gs в Node.
// Загружает Code.gs в отдельный контекст vm и подставляет SpreadsheetApp, PropertiesService,
// CacheService, LockService, ContentService, Utilities, MailApp, ScriptApp, Session.
// Не тест (имя не *.test.js) — используется из tests/api*.test.js.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const CODE_GS = readFileSync(join(ROOT, 'backend', 'Code.gs'), 'utf8');

function signed(buf) {
  return Array.from(buf, (b) => (b > 127 ? b - 256 : b));
}
function unsigned(bytes) {
  return Buffer.from(bytes.map((b) => (b + 256) % 256));
}

class Range {
  constructor(sheet, row, col, nr = 1, nc = 1) { Object.assign(this, { sheet, row, col, nr, nc }); }
  getValues() {
    const out = [];
    for (let r = 0; r < this.nr; r++) {
      const line = [];
      for (let c = 0; c < this.nc; c++) {
        const v = (this.sheet.data[this.row - 1 + r] || [])[this.col - 1 + c];
        line.push(v === undefined ? '' : v);
      }
      out.push(line);
    }
    return out;
  }
  setValues(values) {
    values.forEach((line, r) => line.forEach((v, c) => this.sheet.set(this.row + r, this.col + c, v)));
    return this;
  }
  setValue(v) { this.sheet.set(this.row, this.col, v); return this; }
  clearContent() {
    for (let r = 0; r < this.nr; r++) for (let c = 0; c < this.nc; c++) this.sheet.set(this.row + r, this.col + c, '');
    return this;
  }
  setFontWeight() { return this; }
}

class Sheet {
  constructor(name) { this.name = name; this.data = []; this.formulas = 0; }
  getName() { return this.name; }
  set(row, col, v) {
    // Как в Google Таблице: строка с «=» стала бы формулой; «'» в начале — признак текста.
    if (typeof v === 'string' && v.startsWith('=')) this.formulas += 1;
    if (typeof v === 'string' && v.startsWith("'")) v = v.slice(1);
    while (this.data.length < row) this.data.push([]);
    const line = this.data[row - 1];
    while (line.length < col) line.push('');
    line[col - 1] = v;
  }
  getRange(row, col, nr, nc) { return new Range(this, row, col, nr, nc); }
  getLastRow() {
    for (let i = this.data.length; i > 0; i--) if (this.data[i - 1].some((v) => v !== '' && v != null)) return i;
    return 0;
  }
  getLastColumn() { return this.data.reduce((m, l) => Math.max(m, l.length), 0); }
  appendRow(values) { const r = this.getLastRow() + 1; values.forEach((v, c) => this.set(r, c + 1, v)); }
  setFrozenRows() {}
}

class Spreadsheet {
  constructor() { this.sheets = {}; }
  getId() { return 'sheet-test-id'; }
  getSheetByName(n) { return this.sheets[n] || null; }
  insertSheet(n) { this.sheets[n] = new Sheet(n); return this.sheets[n]; }
}

/**
 * Новый «сервер»: свежая таблица и свойства.
 * @returns {{ctx, ss, props, mail, ui, post(obj) → объект ответа, fetch: функция для подмены globalThis.fetch}}
 */
export function createServer() {
  const ss = new Spreadsheet();
  const props = {};
  const cache = {};
  const mail = [];
  const triggers = [];
  const uiAnswers = [];
  const alerts = [];
  const ui = {
    ButtonSet: { OK_CANCEL: 'OK_CANCEL' },
    Button: { OK: 'OK', CANCEL: 'CANCEL' },
    prompt() {
      const a = uiAnswers.shift();
      return { getSelectedButton: () => (a == null ? 'CANCEL' : 'OK'), getResponseText: () => a };
    },
    alert(t) { alerts.push(t); },
    createMenu() { const m = { addItem: () => m, addToUi: () => m }; return m; },
  };
  const ctx = {
    console,
    SpreadsheetApp: { getActiveSpreadsheet: () => ss, openById: () => ss, getUi: () => ui },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k) => (k in props ? props[k] : null),
        setProperty: (k, v) => { props[k] = String(v); },
        setProperties: (o) => { for (const k in o) props[k] = String(o[k]); },
      }),
    },
    CacheService: {
      getScriptCache: () => ({
        get: (k) => (k in cache ? cache[k] : null),
        put: (k, v) => { cache[k] = String(v); },
        remove: (k) => { delete cache[k]; },
      }),
    },
    LockService: { getScriptLock: () => ({ tryLock: () => true, waitLock: () => {}, releaseLock: () => {} }) },
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput: (s) => ({ content: s, setMimeType() { return this; }, getContent() { return this.content; } }),
    },
    Utilities: {
      Charset: { UTF_8: 'UTF-8' },
      DigestAlgorithm: { SHA_256: 'SHA_256' },
      computeHmacSha256Signature: (value, key) => signed(crypto.createHmac('sha256', Buffer.from(String(key), 'utf8')).update(String(value), 'utf8').digest()),
      base64EncodeWebSafe: (v) => (typeof v === 'string' ? Buffer.from(v, 'utf8') : unsigned(v)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_'),
      base64DecodeWebSafe: (s) => signed(Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/'), 'base64')),
      newBlob: (bytes) => ({ getDataAsString: () => unsigned(bytes).toString('utf8') }),
      getUuid: () => crypto.randomUUID(),
    },
    MailApp: { sendEmail: (m) => mail.push(m), getRemainingDailyQuota: () => 100 },
    Session: { getEffectiveUser: () => ({ getEmail: () => 'owner@example.com' }) },
    ScriptApp: {
      getProjectTriggers: () => triggers.slice(),
      deleteTrigger: (t) => { const i = triggers.indexOf(t); if (i >= 0) triggers.splice(i, 1); },
      newTrigger: (fn) => {
        const b = { timeBased: () => b, everyDays: () => b, atHour: () => b, create: () => { triggers.push({ getHandlerFunction: () => fn }); } };
        return b;
      },
    },
  };
  vm.createContext(ctx);
  vm.runInContext(CODE_GS, ctx, { filename: 'Code.gs' });

  const post = (obj) => JSON.parse(ctx.doPost({ postData: { contents: typeof obj === 'string' ? obj : JSON.stringify(obj) } }).getContent());

  const net = { online: true, loseResponses: 0, hang: false, calls: [] };
  async function fetch(url, opts) {
    net.calls.push({ url, opts });
    if (net.hang) {
      return new Promise((_, rej) => {
        if (opts && opts.signal) opts.signal.addEventListener('abort', () => rej(Object.assign(new Error('aborted'), { name: 'AbortError' })));
      });
    }
    if (!net.online) throw new TypeError('Failed to fetch');
    const out = ctx.doPost({ postData: { contents: opts.body } }).getContent();
    if (net.loseResponses > 0) { net.loseResponses -= 1; throw new TypeError('Failed to fetch'); }
    return { ok: true, status: 200, json: async () => JSON.parse(out) };
  }

  /** Задать логин и пароль так, как это делает меню таблицы. */
  function setCredentials(login, password) {
    uiAnswers.push(login, password, password);
    ctx.menuSetCredentials();
  }

  return { ctx, ss, props, cache, mail, ui, uiAnswers, alerts, triggers, post, fetch, net, setCredentials };
}

/** Простая замена localStorage для Node. */
export function memoryStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
    clear: () => m.clear(),
    key: (i) => Array.from(m.keys())[i] ?? null,
    get length() { return m.size; },
  };
}
