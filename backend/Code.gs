/**
 * Виртуальная лаборатория — сервер преподавателя (Google Apps Script + Google Таблица).
 *
 * Установка — backend/README.md. Коротко:
 *   1) Таблица → Расширения → Apps Script → вставить этот файл целиком → Сохранить.
 *   2) В таблице: меню «Виртуальная лаборатория → Задать логин и пароль».
 *   3) Развернуть → Новое развёртывание → Веб-приложение («от моего имени», «доступ: все»).
 *   4) Адрес веб-приложения → config.js → BACKEND_URL.
 *
 * Пароля в этом файле нет и быть не должно: логин и хэш пароля с солью хранятся
 * в «Свойствах скрипта» (Script Properties) и задаются только из меню таблицы.
 *
 * Запрос: POST, тело — JSON-строка {action, ...} с типом text/plain (без CORS preflight).
 * Ответ: JSON {ok: true, ...} или {ok: false, error: 'код', message: 'текст'}.
 *
 * Действия студента: submitAdmission, getStatus, submitReport, getSettings, getAccess, requestAccess.
 * Действия преподавателя (нужен token из login): listRequests, decide, listReports, getReport,
 *   setGrade, getSettings (полные), setSettings, listStudents.
 *
 * Логика, не зависящая от Google, вынесена в чистые функции (раздел «Чистые функции»)
 * и проверяется в Node: tests/api-backend.test.js.
 */

/* ======================================================================= */
/* Константы                                                                */
/* ======================================================================= */

var VLAB = {
  VERSION: '1.0.0',
  TOKEN_TTL_MS: 12 * 60 * 60 * 1000,   // токен преподавателя живёт 12 часов
  MAX_FAILS: 5,                         // неудачных входов подряд…
  LOCK_SECONDS: 15 * 60,                // …и вход закрыт на 15 минут
  HASH_ROUNDS: 500,                     // повторов хэширования пароля
  CELL_LIMIT: 50000,                    // предел символов в ячейке Google Таблицы
  CELL_SAFE: 48000,                     // с запасом
  MAX_TEXT: 4000,                       // предел обычной строки от студента
  LOCK_WAIT_MS: 20000,
  MIN_PASSWORD: 8,
  MAIL_RESERVE: 5,                      // столько писем из суточной квоты Gmail оставляем про запас
  // Работы дисциплины (docs/labs.md). Для них getSettings всегда возвращает настройки.
  LABS: ['lab-00', 'lab-06-07', 'lab-08', 'lab-09', 'lab-10', 'lab-11', 'lab-12', 'lab-13', 'lab-14', 'lab-15'],
  // По умолчанию: работа открыта, подсказки есть, допуск решает преподаватель.
  DEFAULT_LAB: { open: true, hints: true, autoAdmit: false },
  DEFAULT_GENERAL: { access: 'all', notifyMode: 'off', notifyEmail: '' },
};

var SHEETS = {
  requests: {
    name: 'Заявки',
    cols: [
      ['id', 'ID'], ['createdAt', 'Получено'], ['kind', 'Тип'], ['lab', 'Работа'], ['status', 'Статус'],
      ['name', 'ФИО'], ['group', 'Группа'], ['deviceId', 'Устройство'], ['attempt', 'Попытка'],
      ['score', 'Балл'], ['total', 'Из'], ['pass', 'Порог'], ['lang', 'Язык'],
      ['comment', 'Комментарий'], ['decidedAt', 'Решено'], ['startedAt', 'Начато'], ['finishedAt', 'Закончено'],
      ['answers', 'Ответы (JSON)'],
    ],
  },
  reports: {
    name: 'Протоколы',
    cols: [
      ['id', 'ID'], ['createdAt', 'Получено'], ['lab', 'Работа'], ['name', 'ФИО'], ['group', 'Группа'],
      ['deviceId', 'Устройство'], ['attempt', 'Попытка'], ['mode', 'Режим'], ['lang', 'Язык'],
      ['grade', 'Оценка (авто)'], ['points', 'Штрафные баллы'], ['teacherGrade', 'Оценка преподавателя'],
      ['teacherComment', 'Комментарий преподавателя'], ['gradedAt', 'Оценено'], ['finishedAt', 'Закончено'],
      ['data', 'Протокол (JSON)'],
    ],
  },
  settings: {
    name: 'Настройки',
    cols: [['key', 'Параметр'], ['value', 'Значение'], ['note', 'Пояснение']],
  },
  students: {
    name: 'Студенты',
    cols: [
      ['key', 'Ключ'], ['name', 'ФИО'], ['group', 'Группа'], ['deviceId', 'Устройство'],
      ['firstSeen', 'Впервые'], ['lastSeen', 'Последний раз'], ['summary', 'Сводка'],
    ],
  },
};

var STATUS_RU = { pending: 'на рассмотрении', approved: 'допущен', denied: 'не допущен' };
var KIND_RU = { admission: 'допуск', briefing: 'инструктаж', access: 'доступ к сайту' };

/* ======================================================================= */
/* Чистые функции (без обращений к Google; проверяются в Node)              */
/* ======================================================================= */

/** Байты (в т. ч. знаковые, как отдаёт Apps Script) → hex. */
function bytesToHex(bytes) {
  var s = '';
  for (var i = 0; i < bytes.length; i++) {
    var b = (bytes[i] + 256) % 256;
    s += (b < 16 ? '0' : '') + b.toString(16);
  }
  return s;
}

/** Сравнение строк за постоянное время (против атак по времени). */
function safeEqual(a, b) {
  a = String(a == null ? '' : a);
  b = String(b == null ? '' : b);
  var diff = a.length ^ b.length;
  var n = Math.max(a.length, b.length);
  for (var i = 0; i < n; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

/**
 * Хэш пароля: HMAC-SHA256 с солью, повторённый rounds раз.
 * @param {function(string,string):string} hmacHex — (сообщение, ключ) → hex
 */
function hashPassword(password, salt, rounds, hmacHex) {
  var h = hmacHex(String(password), String(salt));
  for (var i = 1; i < rounds; i++) h = hmacHex(h + ':' + password, String(salt));
  return h;
}

/** Токен: base64url(JSON {u, exp}) + '.' + HMAC. */
function makeToken(login, now, ttl, secret, hmacHex, b64url) {
  var body = b64url(JSON.stringify({ u: String(login), exp: now + ttl }));
  return body + '.' + hmacHex(body, secret);
}

/** Проверка токена → {u, exp} или null. */
function verifyToken(token, now, secret, hmacHex, b64decode) {
  if (!token || typeof token !== 'string' || !secret) return null;
  var dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  var body = token.slice(0, dot);
  var sig = token.slice(dot + 1);
  if (!safeEqual(sig, hmacHex(body, secret))) return null;
  try {
    var p = JSON.parse(b64decode(body));
    if (!p || typeof p.exp !== 'number' || p.exp <= now) return null;
    return p;
  } catch (e) {
    return null;
  }
}

/**
 * Защита от перебора. state = {fails, lockedUntil}. Возвращает новый state.
 * После MAX_FAILS неудач подряд — блокировка на LOCK_SECONDS.
 */
function loginAttemptState(state, success, now) {
  state = state || { fails: 0, lockedUntil: 0 };
  if (success) return { fails: 0, lockedUntil: 0 };
  var fails = (state.fails || 0) + 1;
  if (fails >= VLAB.MAX_FAILS) return { fails: 0, lockedUntil: now + VLAB.LOCK_SECONDS * 1000 };
  return { fails: fails, lockedUntil: state.lockedUntil || 0 };
}

/** ФИО для сравнения: без лишних пробелов, без регистра, ё = е. */
function normalizeName(name) {
  return String(name || '').replace(/\s+/g, ' ').trim().toLowerCase().replace(/ё/g, 'е');
}

/** Ключ студента: устройство + ФИО (на одном компьютере могут работать разные студенты). */
function studentKey(student) {
  student = student || {};
  return String(student.deviceId || '') + '|' + normalizeName(student.name);
}

/** Строка от студента → безопасная для ячейки (без формул, с пределом длины). */
function cellText(v, max) {
  if (v == null) return '';
  var s = String(v);
  if (s.length > (max || VLAB.MAX_TEXT)) s = s.slice(0, max || VLAB.MAX_TEXT) + '…';
  if (/^[=+\-@]/.test(s)) s = "'" + s;  // иначе Таблица посчитает строку формулой
  return s;
}

function num(v, fallback) {
  var n = Number(v);
  return isFinite(n) ? n : (fallback === undefined ? 0 : fallback);
}

/**
 * Начальный статус заявки.
 *  access — всегда на рассмотрении;
 *  балл ниже порога — сразу «не допущен» (студент может пересдать, не дожидаясь преподавателя);
 *  балл не ниже порога — «допущен», если включён автодопуск, иначе «на рассмотрении».
 */
function initialStatus(kind, score, pass, autoAdmit) {
  if (kind === 'access') return 'pending';
  if (num(score) < num(pass)) return 'denied';
  return autoAdmit ? 'approved' : 'pending';
}

/** Настройки работы с умолчаниями. */
function labSettingsOf(all, labId) {
  var s = (all && all[labId]) || {};
  return {
    open: s.open === undefined ? VLAB.DEFAULT_LAB.open : Boolean(s.open),
    hints: s.hints === undefined ? VLAB.DEFAULT_LAB.hints : Boolean(s.hints),
    autoAdmit: s.autoAdmit === undefined ? VLAB.DEFAULT_LAB.autoAdmit : Boolean(s.autoAdmit),
  };
}

/** Все работы: известные + те, что уже встречались в настройках. */
function allLabSettings(stored) {
  var out = {};
  var ids = VLAB.LABS.slice();
  for (var k in (stored || {})) if (ids.indexOf(k) < 0) ids.push(k);
  for (var i = 0; i < ids.length; i++) out[ids[i]] = labSettingsOf(stored, ids[i]);
  return out;
}

/**
 * Протокол в одну ячейку (≤ 50 000 символов). Если не помещается — сокращаем журнал
 * (оставляем начало и конец), потом текст протокола, потом ответы задания.
 * Возвращает {json, truncated}.
 */
function packReport(report, limit) {
  limit = limit || VLAB.CELL_SAFE;
  var r = JSON.parse(JSON.stringify(report || {}));
  var json = JSON.stringify(r);
  if (json.length <= limit) return { json: json, truncated: false };
  r.truncated = true;
  var journal = Array.isArray(r.journal) ? r.journal : [];
  var keep = journal.length;
  while (json.length > limit && keep > 10) {
    keep = Math.floor(keep * 0.7);
    var head = Math.ceil(keep / 2);
    var tail = keep - head;
    r.journal = journal.slice(0, head)
      .concat([{ t: '…', kind: 'warn', text: '[журнал сокращён: ' + (journal.length - keep) + ' записей не поместились в ячейку]' }])
      .concat(tail ? journal.slice(journal.length - tail) : []);
    json = JSON.stringify(r);
  }
  if (json.length > limit && typeof r.reportText === 'string') {
    var over = json.length - limit + 200;
    r.reportText = r.reportText.slice(0, Math.max(0, r.reportText.length - over)) + '\n[…текст сокращён]';
    json = JSON.stringify(r);
  }
  if (json.length > limit) {
    r.journal = [];
    r.answersTrimmed = true;
    if (Array.isArray(r.assignment)) r.assignment = r.assignment.map(function (a) {
      return { task: String(a.task || '').slice(0, 300), answer: String(a.answer || '').slice(0, 1000), ok: a.ok };
    });
    json = JSON.stringify(r);
  }
  if (json.length > limit) json = JSON.stringify({ truncated: true, lab: r.lab, grade: r.grade, points: r.points, reportText: String(r.reportText || '').slice(0, limit - 500) });
  return { json: json, truncated: true };
}

/** Ответы допуска → компактный массив для ячейки. */
function packAnswers(answers) {
  if (!Array.isArray(answers)) return '[]';
  var list = answers.slice(0, 100).map(function (a) {
    return {
      q: String((a && a.q) || '').slice(0, 1500),
      chosen: String((a && a.chosen) || '').slice(0, 800),
      correct: String((a && a.correct) || '').slice(0, 800),
      ok: Boolean(a && a.ok),
    };
  });
  var json = JSON.stringify(list);
  while (json.length > VLAB.CELL_SAFE && list.length) { list.pop(); json = JSON.stringify(list); }
  return json;
}

/** Последняя запись (по createdAt) из списка, подходящая под условие. */
function latest(list, pred) {
  var best = null;
  for (var i = 0; i < list.length; i++) {
    var x = list[i];
    if (pred(x) && (!best || num(x.createdAt) >= num(best.createdAt))) best = x;
  }
  return best;
}

/** Статус доступа студента к сайту. */
function accessStatusOf(mode, requests, student) {
  if (mode !== 'approved') return { status: 'open', comment: '' };
  var key = studentKey(student);
  var r = latest(requests, function (x) { return x.kind === 'access' && studentKey(x) === key; });
  if (!r) return { status: 'none', comment: '' };
  return { status: r.status, comment: r.comment || '' };
}

/** Порядок заявок: сначала ожидающие, затем новые выше. */
function sortRequests(list) {
  return list.slice().sort(function (a, b) {
    var pa = a.status === 'pending' ? 0 : 1;
    var pb = b.status === 'pending' ? 0 : 1;
    if (pa !== pb) return pa - pb;
    return num(b.createdAt) - num(a.createdAt);
  });
}

/**
 * Сводка «студент × работа».
 * → [{key, name, group, deviceId, access, labs: {labId: {admission, score, total, grade, reports}}}]
 */
function buildStudentMatrix(requests, reports, accessMode) {
  var map = {};
  function get(x) {
    var k = studentKey(x);
    if (!map[k]) map[k] = { key: k, name: x.name || '', group: x.group || '', deviceId: x.deviceId || '', access: accessMode === 'approved' ? 'none' : 'open', labs: {}, lastSeen: 0 };
    var s = map[k];
    if (num(x.createdAt) >= s.lastSeen) { s.lastSeen = num(x.createdAt); if (x.group) s.group = x.group; if (x.name) s.name = x.name; }
    return s;
  }
  var reqs = requests.slice().sort(function (a, b) { return num(a.createdAt) - num(b.createdAt); });
  for (var i = 0; i < reqs.length; i++) {
    var r = reqs[i];
    var s = get(r);
    if (r.kind === 'access') { if (accessMode === 'approved') s.access = r.status; continue; }
    var cell = s.labs[r.lab] || (s.labs[r.lab] = { admission: null, score: null, total: null, grade: null, reports: 0 });
    cell.admission = r.status; cell.score = r.score; cell.total = r.total;
  }
  var reps = reports.slice().sort(function (a, b) { return num(a.createdAt) - num(b.createdAt); });
  for (var j = 0; j < reps.length; j++) {
    var p = reps[j];
    var st = get(p);
    var c = st.labs[p.lab] || (st.labs[p.lab] = { admission: null, score: null, total: null, grade: null, reports: 0 });
    c.reports += 1;
    var g = p.teacherGrade !== '' && p.teacherGrade != null ? p.teacherGrade : p.grade;
    if (g !== '' && g != null) c.grade = num(g);
  }
  var out = [];
  for (var k in map) out.push(map[k]);
  out.sort(function (a, b) {
    return String(a.group).localeCompare(String(b.group)) || String(a.name).localeCompare(String(b.name));
  });
  return out;
}

/** Текст письма о новой заявке. */
function requestMailText(r) {
  var kind = KIND_RU[r.kind] || r.kind;
  var lines = [
    'Новая заявка: ' + kind + (r.lab ? ' · ' + r.lab : ''),
    'Студент: ' + (r.name || '—') + ', группа ' + (r.group || '—'),
  ];
  if (r.kind !== 'access') lines.push('Балл: ' + r.score + ' из ' + r.total + ' (порог ' + r.pass + ')');
  lines.push('', 'Решение — в панели преподавателя (…/teacher/).');
  return lines.join('\n');
}

/** Текст ежедневной сводки. */
function digestText(requests, reports, since) {
  var pend = requests.filter(function (r) { return r.status === 'pending'; });
  var fresh = requests.filter(function (r) { return num(r.createdAt) >= since; });
  var rep = reports.filter(function (r) { return num(r.createdAt) >= since; });
  if (!pend.length && !fresh.length && !rep.length) return '';
  var lines = [
    'Виртуальная лаборатория — сводка за сутки',
    '',
    'Новых заявок: ' + fresh.length,
    'Ожидают решения: ' + pend.length,
    'Новых протоколов: ' + rep.length,
  ];
  if (pend.length) {
    lines.push('', 'Ожидают решения:');
    pend.slice(0, 50).forEach(function (r) {
      lines.push('• ' + (KIND_RU[r.kind] || r.kind) + (r.lab ? ' ' + r.lab : '') + ' — ' + (r.name || '—') + ', ' + (r.group || '—') + (r.kind !== 'access' ? ' (' + r.score + '/' + r.total + ')' : ''));
    });
  }
  lines.push('', 'Панель преподавателя: …/teacher/');
  return lines.join('\n');
}

/** Значение ячейки → число мс (Таблица возвращает даты как Date). */
function toMs(v) {
  if (v === '' || v == null) return null;
  if (Object.prototype.toString.call(v) === '[object Date]') return v.getTime();
  var n = Number(v);
  return isFinite(n) ? n : null;
}

/** Студент из запроса → проверенный объект. */
function cleanStudent(s) {
  s = s || {};
  return {
    name: cellText(String(s.name || '').replace(/\s+/g, ' ').trim(), 200),
    group: cellText(String(s.group || '').replace(/\s+/g, ' ').trim(), 60),
    deviceId: String(s.deviceId || '').replace(/[^\w\-]/g, '').slice(0, 80),
  };
}

/* ======================================================================= */
/* Обёртки над сервисами Google                                             */
/* ======================================================================= */

function hmacHex_(message, key) {
  return bytesToHex(Utilities.computeHmacSha256Signature(String(message), String(key), Utilities.Charset.UTF_8));
}

function b64url_(s) {
  return Utilities.base64EncodeWebSafe(String(s), Utilities.Charset.UTF_8).replace(/=+$/, '');
}

function b64decode_(s) {
  var pad = String(s);
  while (pad.length % 4) pad += '=';
  return Utilities.newBlob(Utilities.base64DecodeWebSafe(pad)).getDataAsString('UTF-8');
}

function props_() {
  return PropertiesService.getScriptProperties();
}

function ss_() {
  var ss = null;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) { ss = null; }
  if (!ss) {
    var id = props_().getProperty('SHEET_ID');
    if (!id) throw apiError_('setup', 'Скрипт не привязан к таблице. Откройте таблицу и выполните меню «Виртуальная лаборатория → Подготовить листы».');
    ss = SpreadsheetApp.openById(id);
  }
  return ss;
}

function apiError_(code, message) {
  var e = new Error(message || code);
  e.code = code;
  return e;
}

/** Лист по описанию; создаётся с заголовками, если его нет. */
function sheet_(def) {
  var ss = ss_();
  var sh = ss.getSheetByName(def.name);
  if (!sh) {
    sh = ss.insertSheet(def.name);
    sh.getRange(1, 1, 1, def.cols.length).setValues([def.cols.map(function (c) { return c[1]; })]);
    sh.setFrozenRows(1);
    try { sh.getRange(1, 1, 1, def.cols.length).setFontWeight('bold'); } catch (e) { /* оформление не обязательно */ }
  }
  return sh;
}

/** Индексы колонок по заголовкам (колонки можно переставлять). Недостающие дописываются справа. */
function colIndex_(sh, def) {
  var lastCol = Math.max(sh.getLastColumn(), 1);
  var head = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var idx = {};
  for (var i = 0; i < def.cols.length; i++) {
    var pos = head.indexOf(def.cols[i][1]);
    if (pos < 0) {
      pos = head.length;
      head.push(def.cols[i][1]);
      sh.getRange(1, pos + 1).setValue(def.cols[i][1]);
    }
    idx[def.cols[i][0]] = pos;
  }
  idx._width = head.length;
  return idx;
}

/** Все строки листа → объекты (с полем _row — номер строки). */
function readAll_(def) {
  var sh = sheet_(def);
  var idx = colIndex_(sh, def);
  var last = sh.getLastRow();
  if (last < 2) return [];
  var values = sh.getRange(2, 1, last - 1, idx._width).getValues();
  var out = [];
  for (var r = 0; r < values.length; r++) {
    var row = values[r];
    if (row.join('') === '') continue;
    var o = { _row: r + 2 };
    for (var i = 0; i < def.cols.length; i++) o[def.cols[i][0]] = row[idx[def.cols[i][0]]];
    out.push(o);
  }
  return out;
}

function append_(def, obj) {
  var sh = sheet_(def);
  var idx = colIndex_(sh, def);
  var row = [];
  for (var i = 0; i < idx._width; i++) row.push('');
  for (var k in obj) if (idx[k] !== undefined) row[idx[k]] = obj[k];
  sh.appendRow(row);
}

function update_(def, rowNum, patch) {
  var sh = sheet_(def);
  var idx = colIndex_(sh, def);
  for (var k in patch) if (idx[k] !== undefined) sh.getRange(rowNum, idx[k] + 1).setValue(patch[k]);
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(VLAB.LOCK_WAIT_MS)) throw apiError_('busy', 'Сервер занят, повторите через минуту.');
  try { return fn(); } finally { lock.releaseLock(); }
}

/* ---------- запись → объект для ответа ---------- */

function requestOut_(r) {
  var answers = [];
  try { answers = JSON.parse(r.answers || '[]'); } catch (e) { answers = []; }
  return {
    id: String(r.id), createdAt: toMs(r.createdAt), kind: r.kind, lab: r.lab, status: r.status,
    name: r.name, group: r.group, deviceId: r.deviceId, attempt: num(r.attempt, null),
    score: num(r.score, null), total: num(r.total, null), pass: num(r.pass, null), lang: r.lang,
    comment: r.comment || '', decidedAt: toMs(r.decidedAt), startedAt: toMs(r.startedAt), finishedAt: toMs(r.finishedAt),
    answers: answers,
  };
}

function reportSummary_(r) {
  return {
    id: String(r.id), createdAt: toMs(r.createdAt), lab: r.lab, name: r.name, group: r.group, deviceId: r.deviceId,
    attempt: num(r.attempt, null), mode: r.mode, lang: r.lang,
    grade: r.grade === '' ? null : num(r.grade, null), points: r.points === '' ? null : num(r.points, null),
    teacherGrade: r.teacherGrade === '' || r.teacherGrade == null ? null : num(r.teacherGrade, null),
    teacherComment: r.teacherComment || '', gradedAt: toMs(r.gradedAt), finishedAt: toMs(r.finishedAt),
  };
}

function requestsAll_() {
  return readAll_(SHEETS.requests).map(function (r) {
    var o = requestOut_(r); o._row = r._row; return o;
  });
}

function reportsAll_() {
  return readAll_(SHEETS.reports).map(function (r) {
    var o = reportSummary_(r); o._row = r._row; o._data = r.data; return o;
  });
}

function stripRow_(o) {
  var c = {};
  for (var k in o) if (k.charAt(0) !== '_') c[k] = o[k];
  return c;
}

/* ---------- настройки ---------- */

function readSettings_() {
  var rows = readAll_(SHEETS.settings);
  var general = JSON.parse(JSON.stringify(VLAB.DEFAULT_GENERAL));
  var labs = {};
  for (var i = 0; i < rows.length; i++) {
    var key = String(rows[i].key || '').trim();
    var val = rows[i].value;
    if (!key) continue;
    if (key.indexOf('lab-') === 0) {
      try { labs[key] = JSON.parse(val); } catch (e) { /* испорченную строку пропускаем */ }
    } else if (key === 'access') {
      general.access = String(val) === 'approved' ? 'approved' : 'all';
    } else if (key === 'notifyMode') {
      general.notifyMode = ['off', 'each', 'daily'].indexOf(String(val)) >= 0 ? String(val) : 'off';
    } else if (key === 'notifyEmail') {
      general.notifyEmail = String(val || '').trim();
    }
  }
  return { general: general, labs: allLabSettings(labs) };
}

function writeSettings_(general, labs) {
  var sh = sheet_(SHEETS.settings);
  var rows = [
    ['access', general.access, 'Доступ к сайту: all — всем, approved — только одобренным студентам'],
    ['notifyMode', general.notifyMode, 'Письма о заявках: off — нет, each — о каждой, daily — сводка раз в день'],
    ['notifyEmail', general.notifyEmail, 'Почта для писем (пусто — почта владельца таблицы)'],
  ];
  for (var id in labs) rows.push([id, JSON.stringify(labs[id]), 'open — открыта, hints — подсказки, autoAdmit — автодопуск']);
  var last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 1, last - 1, Math.max(3, sh.getLastColumn())).clearContent();
  sh.getRange(2, 1, rows.length, 3).setValues(rows);
}

/* ---------- студенты (сводный лист) ---------- */

function touchStudent_(student, now) {
  if (!student.deviceId && !student.name) return;
  var key = studentKey(student);
  var rows = readAll_(SHEETS.students);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].key) === key) {
      update_(SHEETS.students, rows[i]._row, { name: student.name, group: student.group, lastSeen: new Date(now) });
      return;
    }
  }
  append_(SHEETS.students, { key: key, name: student.name, group: student.group, deviceId: student.deviceId, firstSeen: new Date(now), lastSeen: new Date(now), summary: '' });
}

/* ======================================================================= */
/* Действия                                                                  */
/* ======================================================================= */

var STUDENT_ACTIONS = {
  ping: function () {
    return { ok: true, service: 'vlab', version: VLAB.VERSION };
  },

  submitAdmission: function (req) {
    var p = req.payload || req;
    var student = cleanStudent(p.student || req.student);
    if (!student.deviceId) throw apiError_('bad_request', 'Нет идентификатора устройства.');
    var kind = p.kind === 'briefing' ? 'briefing' : 'admission';
    var lab = cellText(p.lab || (kind === 'briefing' ? 'lab-00' : ''), 40);
    if (!lab) throw apiError_('bad_request', 'Не указана работа.');
    var clientId = String(req.clientId || p.clientId || '').slice(0, 80);
    var now = Date.now();
    var mail = null;
    var res = withLock_(function () {
      var all = requestsAll_();
      if (clientId) {
        for (var i = 0; i < all.length; i++) if (all[i].id === clientId) return { ok: true, id: clientId, status: all[i].status, duplicate: true };
      }
      var settings = readSettings_();
      var status = initialStatus(kind, p.score, p.pass, labSettingsOf(settings.labs, lab).autoAdmit);
      var rec = {
        id: clientId || Utilities.getUuid(), createdAt: new Date(now), kind: kind, lab: lab, status: status,
        name: student.name, group: student.group, deviceId: student.deviceId,
        attempt: num(p.attempt, ''), score: num(p.score), total: num(p.total), pass: num(p.pass),
        lang: cellText(p.lang, 5), comment: '', decidedAt: status === 'pending' ? '' : new Date(now),
        startedAt: p.startedAt ? new Date(num(p.startedAt)) : '', finishedAt: p.finishedAt ? new Date(num(p.finishedAt)) : '',
        answers: packAnswers(p.answers),
      };
      append_(SHEETS.requests, rec);
      touchStudent_(student, now);
      if (status === 'pending') mail = { settings: settings.general, rec: rec };
      return { ok: true, id: rec.id, status: status };
    });
    if (mail) notifyNew_(mail.settings, mail.rec);
    return res;
  },

  getStatus: function (req) {
    var student = cleanStudent(req.student);
    var lab = String(req.lab || '');
    var key = studentKey(student);
    var r = latest(requestsAll_(), function (x) { return x.kind !== 'access' && x.lab === lab && studentKey(x) === key; });
    if (!r) return { ok: true, status: null };
    return { ok: true, status: { status: r.status, score: r.score, comment: r.comment || '', decidedAt: r.decidedAt || null } };
  },

  submitReport: function (req) {
    var p = req.payload || req;
    var student = cleanStudent(p.student || req.student);
    if (!student.deviceId) throw apiError_('bad_request', 'Нет идентификатора устройства.');
    var clientId = String(req.clientId || p.clientId || '').slice(0, 80);
    var now = Date.now();
    return withLock_(function () {
      if (clientId) {
        var ex = readAll_(SHEETS.reports);
        for (var i = 0; i < ex.length; i++) if (String(ex[i].id) === clientId) return { ok: true, id: clientId, duplicate: true };
      }
      var copy = {};
      for (var k in p) if (k !== 'student') copy[k] = p[k];
      copy.student = student;
      var packed = packReport(copy);
      var rec = {
        id: clientId || Utilities.getUuid(), createdAt: new Date(now), lab: cellText(p.lab, 40),
        name: student.name, group: student.group, deviceId: student.deviceId,
        attempt: num(p.attempt, ''), mode: p.mode === 'exam' ? 'exam' : 'train', lang: cellText(p.lang, 5),
        grade: num(p.grade, ''), points: num(p.points, ''), teacherGrade: '', teacherComment: '', gradedAt: '',
        finishedAt: p.finishedAt ? new Date(num(p.finishedAt)) : '', data: packed.json,
      };
      append_(SHEETS.reports, rec);
      touchStudent_(student, now);
      return { ok: true, id: rec.id, truncated: packed.truncated };
    });
  },

  getSettings: function (req) {
    var s = readSettings_();
    if (req.token && checkToken_(req.token)) {
      return { ok: true, labs: s.labs, access: s.general.access, notifyMode: s.general.notifyMode, notifyEmail: s.general.notifyEmail };
    }
    return { ok: true, labs: s.labs };
  },

  getAccess: function (req) {
    var s = readSettings_();
    if (s.general.access !== 'approved') return { ok: true, status: 'open', comment: '' };
    var a = accessStatusOf('approved', requestsAll_(), cleanStudent(req.student));
    return { ok: true, status: a.status, comment: a.comment };
  },

  requestAccess: function (req) {
    var student = cleanStudent(req.student);
    if (!student.deviceId) throw apiError_('bad_request', 'Нет идентификатора устройства.');
    if (!student.name || !student.group) throw apiError_('bad_request', 'Укажите ФИО и группу.');
    var now = Date.now();
    var mail = null;
    var res = withLock_(function () {
      var s = readSettings_();
      if (s.general.access !== 'approved') return { ok: true, status: 'open' };
      var cur = accessStatusOf('approved', requestsAll_(), student);
      if (cur.status === 'approved' || cur.status === 'pending') return { ok: true, status: cur.status };
      var rec = {
        id: String(req.clientId || '').slice(0, 80) || Utilities.getUuid(), createdAt: new Date(now), kind: 'access', lab: '',
        status: 'pending', name: student.name, group: student.group, deviceId: student.deviceId,
        attempt: '', score: '', total: '', pass: '', lang: cellText(req.lang, 5), comment: '', decidedAt: '',
        startedAt: '', finishedAt: '', answers: '[]',
      };
      append_(SHEETS.requests, rec);
      touchStudent_(student, now);
      mail = { settings: s.general, rec: rec };
      return { ok: true, status: 'pending' };
    });
    if (mail) notifyNew_(mail.settings, mail.rec);
    return res;
  },
};

var TEACHER_ACTIONS = {
  listRequests: function (req) {
    var list = requestsAll_().map(stripRow_);
    if (req.kind) list = list.filter(function (r) { return r.kind === req.kind; });
    if (req.status) list = list.filter(function (r) { return r.status === req.status; });
    return { ok: true, requests: sortRequests(list) };
  },

  decide: function (req) {
    var id = String(req.id || '');
    var status = req.status === 'approved' ? 'approved' : req.status === 'denied' ? 'denied' : '';
    if (!id || !status) throw apiError_('bad_request', 'Нужны id и решение (approved / denied).');
    return withLock_(function () {
      var all = requestsAll_();
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === id) {
          var now = Date.now();
          update_(SHEETS.requests, all[i]._row, { status: status, comment: cellText(req.comment || '', 1000), decidedAt: new Date(now) });
          return { ok: true, id: id, status: status, decidedAt: now };
        }
      }
      throw apiError_('not_found', 'Заявка не найдена.');
    });
  },

  listReports: function (req) {
    var list = reportsAll_().map(function (r) { var o = stripRow_(r); return o; });
    if (req.lab) list = list.filter(function (r) { return r.lab === req.lab; });
    if (req.group) list = list.filter(function (r) { return String(r.group) === String(req.group); });
    list.sort(function (a, b) { return num(b.createdAt) - num(a.createdAt); });
    return { ok: true, reports: list };
  },

  getReport: function (req) {
    var all = reportsAll_();
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === String(req.id)) {
        var data = {};
        try { data = JSON.parse(all[i]._data || '{}'); } catch (e) { data = { reportText: String(all[i]._data || '') }; }
        return { ok: true, report: stripRow_(all[i]), data: data };
      }
    }
    throw apiError_('not_found', 'Протокол не найден.');
  },

  setGrade: function (req) {
    var id = String(req.id || '');
    var g = req.grade === null || req.grade === '' ? '' : num(req.grade, NaN);
    if (g !== '' && [2, 3, 4, 5].indexOf(g) < 0) throw apiError_('bad_request', 'Оценка — 2, 3, 4 или 5 (пусто — вернуть автоматическую).');
    return withLock_(function () {
      var all = readAll_(SHEETS.reports);
      for (var i = 0; i < all.length; i++) {
        if (String(all[i].id) === id) {
          var now = Date.now();
          update_(SHEETS.reports, all[i]._row, { teacherGrade: g, teacherComment: cellText(req.comment || '', 1000), gradedAt: g === '' ? '' : new Date(now) });
          return { ok: true, id: id, teacherGrade: g === '' ? null : g, gradedAt: g === '' ? null : now };
        }
      }
      throw apiError_('not_found', 'Протокол не найден.');
    });
  },

  getSettings: function () {
    var s = readSettings_();
    return { ok: true, labs: s.labs, access: s.general.access, notifyMode: s.general.notifyMode, notifyEmail: s.general.notifyEmail };
  },

  setSettings: function (req) {
    var res = withLock_(function () {
      var s = readSettings_();
      var g = s.general;
      if (req.access !== undefined) g.access = req.access === 'approved' ? 'approved' : 'all';
      if (req.notifyMode !== undefined) g.notifyMode = ['off', 'each', 'daily'].indexOf(req.notifyMode) >= 0 ? req.notifyMode : 'off';
      if (req.notifyEmail !== undefined) {
        var em = String(req.notifyEmail || '').trim();
        if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) throw apiError_('bad_request', 'Неверный адрес почты.');
        g.notifyEmail = em;
      }
      var labs = s.labs;
      if (req.labs && typeof req.labs === 'object') {
        for (var id in req.labs) {
          if (!/^lab-[\w-]{1,20}$/.test(id)) continue;
          var cur = labSettingsOf(labs, id);
          var inc = req.labs[id] || {};
          labs[id] = {
            open: inc.open === undefined ? cur.open : Boolean(inc.open),
            hints: inc.hints === undefined ? cur.hints : Boolean(inc.hints),
            autoAdmit: inc.autoAdmit === undefined ? cur.autoAdmit : Boolean(inc.autoAdmit),
          };
        }
      }
      writeSettings_(g, labs);
      return { ok: true, labs: labs, access: g.access, notifyMode: g.notifyMode, notifyEmail: g.notifyEmail };
    });
    try { syncDigestTrigger_(res.notifyMode === 'daily'); } catch (e) { res.warning = 'Не удалось настроить ежедневную сводку: ' + e.message; }
    return res;
  },

  listStudents: function () {
    var s = readSettings_();
    return { ok: true, access: s.general.access, students: buildStudentMatrix(requestsAll_(), reportsAll_(), s.general.access) };
  },
};

/* ---------- вход преподавателя ---------- */

function checkToken_(token) {
  var secret = props_().getProperty('TOKEN_SECRET');
  return verifyToken(token, Date.now(), secret, hmacHex_, b64decode_);
}

function login_(req) {
  var p = props_();
  var storedLogin = p.getProperty('TEACHER_LOGIN');
  var storedHash = p.getProperty('TEACHER_HASH');
  var salt = p.getProperty('TEACHER_SALT');
  var secret = p.getProperty('TOKEN_SECRET');
  if (!storedLogin || !storedHash || !salt || !secret) {
    throw apiError_('setup', 'Логин и пароль ещё не заданы. В таблице: «Виртуальная лаборатория → Задать логин и пароль».');
  }
  var cache = CacheService.getScriptCache();
  var now = Date.now();
  var state = { fails: 0, lockedUntil: 0 };
  try { state = JSON.parse(cache.get('vlab_login') || 'null') || state; } catch (e) { /* пусто */ }
  if (state.lockedUntil && state.lockedUntil > now) {
    var min = Math.ceil((state.lockedUntil - now) / 60000);
    var e1 = apiError_('locked', 'Слишком много неудачных попыток. Вход закрыт ещё на ' + min + ' мин.');
    e1.retryAfter = state.lockedUntil - now;
    throw e1;
  }
  var okLogin = safeEqual(String(req.login || '').trim().toLowerCase(), String(storedLogin).toLowerCase());
  var okPass = safeEqual(hashPassword(String(req.password || ''), salt, VLAB.HASH_ROUNDS, hmacHex_), storedHash);
  var next = loginAttemptState(state, okLogin && okPass, now);
  cache.put('vlab_login', JSON.stringify(next), VLAB.LOCK_SECONDS + 60);
  if (!(okLogin && okPass)) {
    if (next.lockedUntil > now) {
      var e2 = apiError_('locked', 'Слишком много неудачных попыток. Вход закрыт на 15 минут.');
      e2.retryAfter = next.lockedUntil - now;
      throw e2;
    }
    throw apiError_('bad_login', 'Неверный логин или пароль. Осталось попыток: ' + (VLAB.MAX_FAILS - next.fails) + '.');
  }
  return { ok: true, token: makeToken(storedLogin, now, VLAB.TOKEN_TTL_MS, secret, hmacHex_, b64url_), expiresAt: now + VLAB.TOKEN_TTL_MS };
}

/* ---------- маршрутизация ---------- */

function handle_(req) {
  var action = String(req && req.action || '');
  if (action === 'login') return login_(req);
  if (TEACHER_ACTIONS[action] && (action !== 'getSettings' || req.token)) {
    if (!checkToken_(req.token)) throw apiError_('auth', 'Сеанс истёк — войдите снова.');
    return TEACHER_ACTIONS[action](req);
  }
  if (STUDENT_ACTIONS[action]) return STUDENT_ACTIONS[action](req);
  throw apiError_('bad_action', 'Неизвестное действие: ' + action);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Веб-приложение: POST-запросы сайта и панели. */
function doPost(e) {
  var req;
  try {
    req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'bad_json', message: 'Запрос не в формате JSON.' });
  }
  try {
    return json_(handle_(req));
  } catch (err) {
    var out = { ok: false, error: err.code || 'server', message: err.code ? err.message : 'Ошибка сервера: ' + err.message };
    if (err.retryAfter) out.retryAfter = err.retryAfter;
    return json_(out);
  }
}

/** Открыть адрес веб-приложения в браузере — проверка, что сервер работает. */
function doGet() {
  return json_({ ok: true, service: 'vlab', version: VLAB.VERSION, message: 'Сервер виртуальной лаборатории работает. Этот адрес вставьте в config.js (BACKEND_URL).' });
}

/* ======================================================================= */
/* Почта                                                                     */
/* ======================================================================= */

function mailTo_(general) {
  if (general.notifyEmail) return general.notifyEmail;
  try { return Session.getEffectiveUser().getEmail(); } catch (e) { return ''; }
}

function notifyNew_(general, rec) {
  if (general.notifyMode !== 'each') return;
  try {
    var to = mailTo_(general);
    if (!to) return;
    // Лимит Gmail — около 100 писем в сутки. Когда квота на исходе, пропускаем:
    // заявка всё равно видна в панели (и попадёт в ежедневную сводку, если она включена).
    if (MailApp.getRemainingDailyQuota() <= VLAB.MAIL_RESERVE) return;
    var r = { kind: rec.kind, lab: rec.lab, name: rec.name, group: rec.group, score: rec.score, total: rec.total, pass: rec.pass };
    MailApp.sendEmail({ to: to, subject: 'Виртуальная лаборатория: заявка — ' + (KIND_RU[r.kind] || r.kind) + (r.lab ? ' ' + r.lab : ''), body: requestMailText(r) });
  } catch (e) { /* письмо не обязательно: заявка уже сохранена */ }
}

/** Ежедневная сводка (запускается триггером по времени). */
function sendDailyDigest() {
  var s = readSettings_();
  var to = mailTo_(s.general);
  if (!to) return;
  var text = digestText(requestsAll_(), reportsAll_(), Date.now() - 24 * 60 * 60 * 1000);
  if (!text) return;
  if (MailApp.getRemainingDailyQuota() < 1) return;
  MailApp.sendEmail({ to: to, subject: 'Виртуальная лаборатория: сводка за сутки', body: text });
}

function syncDigestTrigger_(on) {
  var triggers = ScriptApp.getProjectTriggers();
  var has = false;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'sendDailyDigest') {
      if (on && !has) { has = true; continue; }
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  if (on && !has) ScriptApp.newTrigger('sendDailyDigest').timeBased().everyDays(1).atHour(8).create();
}

/* ======================================================================= */
/* Меню таблицы                                                              */
/* ======================================================================= */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Виртуальная лаборатория')
    .addItem('Задать логин и пароль', 'menuSetCredentials')
    .addItem('Подготовить листы', 'menuSetup')
    .addItem('Отправить сводку сейчас', 'menuDigestNow')
    .addItem('Проверить настройку', 'menuCheck')
    .addToUi();
}

function menuSetup() {
  setupSheets_();
  SpreadsheetApp.getUi().alert('Листы «Заявки», «Протоколы», «Настройки», «Студенты» готовы.');
}

function setupSheets_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  props_().setProperty('SHEET_ID', ss.getId());
  sheet_(SHEETS.requests); sheet_(SHEETS.reports); sheet_(SHEETS.students);
  var hadSettings = Boolean(ss.getSheetByName(SHEETS.settings.name));
  sheet_(SHEETS.settings);
  if (!hadSettings || sheet_(SHEETS.settings).getLastRow() < 2) {
    var s = readSettings_();
    writeSettings_(s.general, s.labs);
  }
}

function menuSetCredentials() {
  var ui = SpreadsheetApp.getUi();
  var r1 = ui.prompt('Логин преподавателя', 'Придумайте логин (латиницей, без пробелов):', ui.ButtonSet.OK_CANCEL);
  if (r1.getSelectedButton() !== ui.Button.OK) return;
  var login = String(r1.getResponseText() || '').trim();
  if (!/^[A-Za-z0-9._-]{3,40}$/.test(login)) { ui.alert('Логин: от 3 до 40 латинских букв, цифр, точек, дефисов. Попробуйте ещё раз.'); return; }
  var r2 = ui.prompt('Пароль', 'Придумайте пароль (не короче ' + VLAB.MIN_PASSWORD + ' символов). Никому его не сообщайте:', ui.ButtonSet.OK_CANCEL);
  if (r2.getSelectedButton() !== ui.Button.OK) return;
  var pass = String(r2.getResponseText() || '');
  if (pass.length < VLAB.MIN_PASSWORD) { ui.alert('Пароль слишком короткий. Нужно не меньше ' + VLAB.MIN_PASSWORD + ' символов.'); return; }
  var r3 = ui.prompt('Пароль ещё раз', 'Повторите пароль:', ui.ButtonSet.OK_CANCEL);
  if (r3.getSelectedButton() !== ui.Button.OK) return;
  if (String(r3.getResponseText() || '') !== pass) { ui.alert('Пароли не совпали. Попробуйте ещё раз.'); return; }
  var salt = Utilities.getUuid() + Utilities.getUuid();
  props_().setProperties({
    TEACHER_LOGIN: login,
    TEACHER_SALT: salt,
    TEACHER_HASH: hashPassword(pass, salt, VLAB.HASH_ROUNDS, hmacHex_),
    TOKEN_SECRET: Utilities.getUuid() + Utilities.getUuid(), // новый секрет — старые входы недействительны
  });
  try { CacheService.getScriptCache().remove('vlab_login'); } catch (e) { /* пусто */ }
  setupSheets_();
  ui.alert('Готово. Логин «' + login + '» и пароль сохранены (пароль — только в виде хэша). Теперь разверните веб-приложение (см. инструкцию).');
}

function menuDigestNow() {
  var s = readSettings_();
  var to = mailTo_(s.general);
  var text = digestText(requestsAll_(), reportsAll_(), Date.now() - 24 * 60 * 60 * 1000) || 'За сутки новых заявок и протоколов нет.';
  if (to) MailApp.sendEmail({ to: to, subject: 'Виртуальная лаборатория: сводка за сутки', body: text });
  SpreadsheetApp.getUi().alert(to ? 'Сводка отправлена на ' + to : 'Нет адреса почты.');
}

function menuCheck() {
  var p = props_();
  var s = readSettings_();
  var lines = [
    'Логин и пароль: ' + (p.getProperty('TEACHER_HASH') ? 'заданы (логин «' + p.getProperty('TEACHER_LOGIN') + '»)' : 'НЕ заданы'),
    'Доступ к сайту: ' + (s.general.access === 'approved' ? 'только одобренным' : 'всем'),
    'Письма: ' + ({ off: 'выключены', each: 'о каждой заявке', daily: 'сводка раз в день' })[s.general.notifyMode] + (s.general.notifyMode !== 'off' ? ' → ' + mailTo_(s.general) : ''),
    'Осталось писем на сегодня: ' + MailApp.getRemainingDailyQuota(),
    'Версия сервера: ' + VLAB.VERSION,
  ];
  SpreadsheetApp.getUi().alert(lines.join('\n'));
}

/* Для проверки в Node (в Apps Script переменной module нет). */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    VLAB: VLAB, bytesToHex: bytesToHex, safeEqual: safeEqual, hashPassword: hashPassword, makeToken: makeToken,
    verifyToken: verifyToken, loginAttemptState: loginAttemptState, normalizeName: normalizeName, studentKey: studentKey,
    cellText: cellText, initialStatus: initialStatus, labSettingsOf: labSettingsOf, allLabSettings: allLabSettings,
    packReport: packReport, packAnswers: packAnswers, accessStatusOf: accessStatusOf, sortRequests: sortRequests,
    buildStudentMatrix: buildStudentMatrix, digestText: digestText, requestMailText: requestMailText, toMs: toMs,
  };
}
