// Панель преподавателя: вход, заявки, протоколы, студенты, настройки, экспорт CSV, демо-режим.
import { CONFIG } from '../config.js';
import { S, LANGS, LANG_LABEL, LABS_FALLBACK } from './i18n.js';
import { createServerClient } from './client.js';
import { createDemoClient } from './demo.js';
import { requestsCsv, reportsCsv, studentsCsv } from './csv.js';

const REFRESH_MS = 30000;
const KEY = { lang: 'vlab_teacher_lang', theme: 'vlab_teacher_theme', token: 'vlab_teacher_token' };

/* ---------- хранение ---------- */
const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* нет хранилища */ } },
};
const ss = {
  get(k) { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (e) { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* нет хранилища */ } },
  del(k) { try { sessionStorage.removeItem(k); } catch (e) { /* нет хранилища */ } },
};

/* ---------- состояние ---------- */
const st = {
  lang: LANGS.includes(ls.get(KEY.lang)) ? ls.get(KEY.lang) : 'kk',
  theme: ['auto', 'light', 'dark'].includes(ls.get(KEY.theme)) ? ls.get(KEY.theme) : 'auto',
  mode: 'login', token: '', tab: 'requests', loading: false, lastUpdate: 0,
  requests: [], reports: [], students: [], studentsAccess: 'all', settings: null, draft: null, dirty: false,
  f: { kind: '', status: 'pending', group: '', lab: '', grade: '', q: '', sgroup: '' },
  openAns: new Set(), changing: new Set(), drafts: {},
  report: null, reportData: null, gradeDraft: null,
  loginErr: '', loginBusy: false, deferRender: false,
};
let client = null;
let labs = LABS_FALLBACK.slice();

/* ---------- язык и форматирование ---------- */
const t = (k) => (S[k] ? S[k][st.lang] || S[k].ru : k);
const tr = (x) => {
  if (x == null) return '';
  if (typeof x === 'object') return x[st.lang] || x.ru || x.en || x.kk || '';
  return String(x);
};
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const E = (x) => esc(tr(x));
const LOCALE = { ru: 'ru-RU', kk: 'kk-KZ', en: 'en-GB' };
function fmtDate(ms) {
  if (!ms) return '—';
  try {
    return new Date(ms).toLocaleString(LOCALE[st.lang], { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return new Date(ms).toISOString().slice(0, 16).replace('T', ' '); }
}
function fmtTime(ms) {
  try { return new Date(ms).toLocaleTimeString(LOCALE[st.lang], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); } catch (e) { return ''; }
}
function fmtNum(x, d = 2) {
  if (x == null || x === '' || !isFinite(Number(x))) return '—';
  const s = Number(x).toFixed(d).replace(/^-/, '−');
  return st.lang === 'en' ? s : s.replace('.', ',');
}
const fmtPts = (x) => fmtNum(x, Number(x) % 1 === 0 ? 0 : (Math.round(Number(x) * 100) % 10 === 0 ? 1 : 2));

function labOf(id) { return labs.find((l) => l.id === id); }
function labShort(id) {
  const l = labOf(id);
  if (!l) return id || '—';
  const n = tr(l.number);
  return /^\d/.test(n) ? '№ ' + n : n;
}
function labName(id) {
  const l = labOf(id);
  return l ? labShort(id) + ' · ' + tr(l.title) : id || '—';
}
function kindName(k) { return t(k === 'briefing' ? 'kindBriefing' : k === 'access' ? 'kindAccess' : 'kindAdmission'); }
function statusName(r) {
  if (r.status === 'pending') return t('stPending');
  if (r.kind === 'access') return t(r.status === 'approved' ? 'stAccessApproved' : 'stAccessDenied');
  return t(r.status === 'approved' ? 'stApproved' : 'stDenied');
}
const ICON = { pending: '◷', approved: '✓', denied: '✕' };
function badge(r) { return `<span class="badge ${esc(r.status)}"><span aria-hidden="true">${ICON[r.status] || ''}</span>${esc(statusName(r))}</span>`; }
function accessName(a) {
  if (a === 'open') return t('accOpen');
  if (a === 'none' || !a) return t('accNone');
  return statusName({ kind: 'access', status: a });
}
const effGrade = (r) => (r.teacherGrade != null ? r.teacherGrade : r.grade);

/* ---------- DOM ---------- */
const $ = (id) => document.getElementById(id);
const main = $('main');

function toast(msg, bad = false) {
  const el = $('toast');
  el.textContent = msg;
  el.className = 'toast' + (bad ? ' bad' : '');
  el.hidden = false;
  clearTimeout(toast.tm);
  toast.tm = setTimeout(() => { el.hidden = true; }, bad ? 7000 : 3000);
}

function errText(e) {
  const code = e && e.code;
  if (code === 'bad_login') return t('e_bad_login') + (e.attemptsLeft != null ? ' ' + t('e_attempts') + ': ' + e.attemptsLeft + '.' : '');
  if (code === 'locked') {
    const min = e.retryAfter ? Math.ceil(e.retryAfter / 60000) : 15;
    return st.lang === 'en' ? `Too many failed attempts. Try again in ${min} min.` : st.lang === 'kk' ? `Сәтсіз әрекеттер тым көп. ${min} мин кейін қайталаңыз.` : `Слишком много неудачных попыток. Попробуйте через ${min} мин.`;
  }
  // Непредвиденная ошибка сервера: показываем текст — по нему видно, что не так в таблице или скрипте.
  if (code === 'server' && e && e.message) return String(e.message).startsWith('Ошибка сервера') ? e.message : t('e_server') + ': ' + e.message;
  if (S['e_' + code]) return t('e_' + code);
  return t('e_server') + (e && e.message ? ': ' + e.message : '');
}

/* ---------- шапка, подвал, тема ---------- */
function applyTheme() {
  const root = document.documentElement;
  if (st.theme === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', st.theme);
  const b = $('themeBtn');
  const label = t(st.theme === 'auto' ? 'themeAuto' : st.theme === 'light' ? 'themeLight' : 'themeDark');
  const icon = st.theme === 'auto'
    ? '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/>'
    : st.theme === 'light'
      ? '<circle cx="12" cy="12" r="4.5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      : '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" fill="currentColor"/>';
  b.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">${icon}</svg>`;
  b.title = label;
  b.setAttribute('aria-label', label);
}

function renderChrome() {
  document.documentElement.lang = st.lang;
  document.title = t('panel') + ' · ' + t('appName');
  $('hEyebrow').textContent = t('appName') + ' · ' + t('course');
  $('hTitle').textContent = t('panel');
  const seg = $('langSeg');
  seg.setAttribute('aria-label', t('langGroup'));
  seg.innerHTML = LANGS.map((l) => `<button class="b sm${l === st.lang ? ' on' : ''}" type="button" data-act="lang" data-v="${l}" aria-pressed="${l === st.lang}" lang="${l}">${LANG_LABEL[l]}</button>`).join('');
  const out = $('logoutBtn');
  out.hidden = st.mode !== 'live';
  out.textContent = st.mode === 'demo' ? t('exitDemo') : t('logout');
  out.dataset.act = 'logout';
  const banner = $('demoBanner');
  banner.hidden = st.mode !== 'demo';
  banner.innerHTML = `<span><b>${esc(t('demoTag'))}</b> · ${esc(t('demoBanner'))}</span><button class="b sm" type="button" data-act="logout">${esc(t('exitDemo'))}</button>`;
  const year = new Date().getFullYear();
  $('foot').innerHTML = `<span>© ${year}, ${esc(tr(CONFIG.AUTHOR))}. ${esc(t('rights'))}</span><span class="mono">${esc(t('appName'))} · v${esc(CONFIG.APP_VERSION || '')}</span>`;
  applyTheme();
}

/* ---------- экраны ---------- */
function viewLogin() {
  const noServer = !CONFIG.BACKEND_URL;
  return `<section class="login">
    <div class="card pad stack">
      <h2>${esc(t('loginTitle'))}</h2>
      <p class="muted small" style="margin:0">${esc(t('loginLead'))}</p>
      ${noServer ? `<div class="note warn">${esc(t('noServer'))}</div>` : ''}
      <form id="loginForm" novalidate>
        <label class="f">${esc(t('login'))}<input type="text" name="login" value="${esc(st.loginName || '')}" autocomplete="username" autocapitalize="none" spellcheck="false" ${noServer ? 'disabled' : ''} required></label>
        <label class="f">${esc(t('password'))}<input type="password" name="password" autocomplete="current-password" ${noServer ? 'disabled' : ''} required></label>
        <div aria-live="polite">${st.loginErr ? `<div class="note bad"><span aria-hidden="true">✕ </span>${esc(st.loginErr)}</div>` : ''}</div>
        <button class="b pri" type="submit" ${noServer || st.loginBusy ? 'disabled' : ''}>${esc(t(st.loginBusy ? 'signingIn' : 'signIn'))}</button>
      </form>
      <div class="or">·</div>
      <button class="b" type="button" data-act="demo">${esc(t('showDemo'))}</button>
      <p class="muted small" style="margin:0">${esc(t('demoLead'))}</p>
    </div>
  </section>`;
}

function tabsBar() {
  const pend = st.requests.filter((r) => r.status === 'pending').length;
  const tabs = [
    ['requests', t('tabRequests'), pend],
    ['reports', t('tabReports'), 0],
    ['students', t('tabStudents'), 0],
    ['settings', t('tabSettings'), 0],
  ];
  return `<nav class="tabs" role="tablist" aria-label="${esc(t('panel'))}">${tabs.map(([id, name, n]) => `<button class="tab" type="button" role="tab" aria-selected="${st.tab === id}" data-act="tab" data-v="${id}">${esc(name)}${n ? `<span class="cnt" aria-label="${n} ${esc(t('pendingCount'))}">${n}</span>` : ''}</button>`).join('')}</nav>`;
}

function topBar(csvKind) {
  return `<div class="bar">
    <span class="upd" aria-live="polite">${st.loading ? esc(t('loading')) : st.lastUpdate ? esc(t('updated')) + ' ' + esc(fmtTime(st.lastUpdate)) : ''}</span>
    <span class="row">
      ${csvKind ? `<button class="b sm" type="button" data-act="csv" data-v="${csvKind}">⇩ ${esc(t('exportCsv'))}</button>` : ''}
      <button class="b sm" type="button" data-act="refresh">⟳ ${esc(t('refresh'))}</button>
    </span>
  </div>`;
}

const groupsOf = (list) => [...new Set(list.map((x) => x.group).filter(Boolean))].sort();
const labsOf = (list) => [...new Set(list.map((x) => x.lab).filter(Boolean))].sort();
const matchQ = (x) => !st.f.q || tr(x.name).toLowerCase().includes(st.f.q.toLowerCase());

function selectGroup(list, key) {
  return `<label class="f">${esc(t('group'))}<select data-f="${key}"><option value="">${esc(t('allGroups'))}</option>${groupsOf(list).map((g) => `<option${st.f[key] === g ? ' selected' : ''}>${esc(g)}</option>`).join('')}</select></label>`;
}
function selectLab(list) {
  return `<label class="f">${esc(t('lab'))}<select data-f="lab"><option value="">${esc(t('allLabs'))}</option>${labsOf(list).map((l) => `<option value="${esc(l)}"${st.f.lab === l ? ' selected' : ''}>${esc(labName(l))}</option>`).join('')}</select></label>`;
}
function searchBox() {
  return `<label class="f">${esc(t('search'))}<input type="search" data-f="q" value="${esc(st.f.q)}" autocomplete="off"></label>`;
}
function chip(k, v, label) {
  return `<button class="chip" type="button" data-act="f" data-k="${k}" data-v="${v}" aria-pressed="${st.f[k] === v}">${esc(label)}</button>`;
}

/* --- заявки --- */
function filteredRequests() {
  return st.requests.filter((r) => (!st.f.kind || r.kind === st.f.kind) && (!st.f.status || r.status === st.f.status)
    && (!st.f.group || r.group === st.f.group) && (!st.f.lab || r.lab === st.f.lab) && matchQ(r));
}

function viewRequests() {
  const list = filteredRequests();
  const nPend = st.requests.filter((r) => r.status === 'pending').length;
  return `${topBar('requests')}
  <div class="chips" role="group">${chip('status', 'pending', t('filterPending') + ' · ' + nPend)}${chip('status', '', t('filterAll'))}${chip('status', 'approved', t('stApproved'))}${chip('status', 'denied', t('stDenied'))}</div>
  <div class="chips" role="group">${chip('kind', '', t('all'))}${chip('kind', 'admission', t('kindAdmission'))}${chip('kind', 'briefing', t('kindBriefing'))}${chip('kind', 'access', t('kindAccess'))}</div>
  <div class="filters">${selectGroup(st.requests, 'group')}${selectLab(st.requests)}${searchBox()}</div>
  <div class="list">${list.length ? list.map(reqCard).join('') : `<div class="card empty">${esc(t('nothing'))}</div>`}</div>`;
}

function reqCard(r) {
  const isAccess = r.kind === 'access';
  const ok = r.score != null && r.pass != null && Number(r.score) >= Number(r.pass);
  const showDecide = r.status === 'pending' || st.changing.has(r.id);
  const answers = Array.isArray(r.answers) ? r.answers : [];
  const open = st.openAns.has(r.id);
  const autoDenied = r.status === 'denied' && !isAccess && !ok && !tr(r.comment);
  return `<article class="card req${r.status === 'pending' ? ' is-pending' : ''}" aria-label="${E(r.name)}">
    <div class="row">${badge(r)}<span class="badge kind">${esc(kindName(r.kind))}</span>${r.lab && !isAccess ? `<span class="small muted">${esc(labName(r.lab))}</span>` : ''}</div>
    <div class="who">${E(r.name) || '—'} <span class="muted">· ${esc(r.group || '—')}</span></div>
    <div class="meta">
      ${isAccess ? '' : `<span>${esc(t('score'))}: <span class="score ${ok ? 'ok' : 'low'}">${esc(r.score)} / ${esc(r.total)}</span> (${esc(t('passMark'))} ${esc(r.pass)}) <span aria-hidden="true">${ok ? '✓' : '✕'}</span> ${esc(ok ? t('atPass') : t('belowPass'))}</span>`}
      ${r.attempt ? `<span>${esc(t('attempt'))} ${esc(r.attempt)}</span>` : ''}
      <span>${esc(t('received'))}: ${esc(fmtDate(r.createdAt))}</span>
      ${r.lang ? `<span>${esc(LANG_LABEL[r.lang] || r.lang)}</span>` : ''}
    </div>
    ${r.status !== 'pending' && tr(r.comment) ? `<div class="cmt">💬 ${E(r.comment)}</div>` : ''}
    ${autoDenied ? `<div class="small muted">${esc(t('autoDenied'))}</div>` : ''}
    ${answers.length ? `<div><button class="b sm link" type="button" data-act="ans" data-id="${esc(r.id)}" aria-expanded="${open}">${esc(open ? t('hideAnswers') : t('answers') + ' (' + answers.length + ')')}</button>
      ${open ? `<ol class="ans">${answers.map((a, i) => `<li class="${a.ok ? 'ok' : 'no'}"><div class="qq">${i + 1}. ${E(a.q)}</div>
        <div><span class="lbl">${esc(t('chosen'))}:</span> ${E(a.chosen) || '—'} <b class="${a.ok ? 'ic-ok' : 'ic-no'}">${a.ok ? '✓ ' + esc(t('right')) : '✕ ' + esc(t('wrong'))}</b></div>
        ${a.ok ? '' : `<div><span class="lbl">${esc(t('correctAns'))}:</span> ${E(a.correct)}</div>`}</li>`).join('')}</ol>` : ''}</div>` : ''}
    ${showDecide ? `<div class="decide">
        <label class="f">${esc(t('comment'))}<textarea data-draft="${esc(r.id)}" rows="2" placeholder="${esc(t('commentPh'))}">${esc(st.drafts[r.id] ?? tr(r.comment) ?? '')}</textarea></label>
        <div class="row">
          <button class="b good" type="button" data-act="decide" data-id="${esc(r.id)}" data-v="approved">✓ ${esc(isAccess ? t('approveAccess') : t('admit'))}</button>
          <button class="b bad" type="button" data-act="decide" data-id="${esc(r.id)}" data-v="denied">✕ ${esc(isAccess ? t('denyAccess') : t('deny'))}</button>
        </div>
      </div>` : `<div class="row small muted"><span>${esc(t('decidedAt'))}: ${esc(fmtDate(r.decidedAt))}</span><button class="b sm link" type="button" data-act="change" data-id="${esc(r.id)}">${esc(t('changeDecision'))}</button></div>`}
  </article>`;
}

/* --- протоколы --- */
function filteredReports() {
  return st.reports.filter((r) => (!st.f.group || r.group === st.f.group) && (!st.f.lab || r.lab === st.f.lab)
    && (!st.f.grade || String(effGrade(r)) === st.f.grade) && matchQ(r));
}

function gnum(g) { return `<span class="gnum g${esc(g)}">${g == null ? '—' : esc(g)}</span>`; }

function viewReports() {
  if (st.report) return viewReport();
  const list = filteredReports();
  return `${topBar('reports')}
  <div class="filters">${selectGroup(st.reports, 'group')}${selectLab(st.reports)}
    <label class="f">${esc(t('grade'))}<select data-f="grade"><option value="">${esc(t('anyGrade'))}</option>${['5', '4', '3', '2'].map((g) => `<option${st.f.grade === g ? ' selected' : ''}>${g}</option>`).join('')}</select></label>
    ${searchBox()}</div>
  <p class="small muted">${list.length} ${esc(t('reportsCount'))}</p>
  <div class="reps">${list.length ? list.map((r) => `<article class="card rep">
      <div><div class="who">${E(r.name) || '—'} <span class="muted">· ${esc(r.group || '—')}</span></div>
        <div class="meta"><span>${esc(labName(r.lab))}</span><span>${esc(fmtDate(r.finishedAt || r.createdAt))}</span>${r.attempt ? `<span>${esc(t('attempt'))} ${esc(r.attempt)}</span>` : ''}${r.mode === 'exam' ? `<span class="badge exam">${esc(t('modeExam'))}</span>` : ''}${r.teacherGrade != null ? `<span>✎ ${esc(t('changedByTeacher'))}</span>` : ''}</div></div>
      <div class="gbox">${gnum(effGrade(r))}<button class="b sm" type="button" data-act="openRep" data-id="${esc(r.id)}">${esc(t('open'))}</button></div>
    </article>`).join('') : `<div class="card empty">${esc(t('nothing'))}</div>`}</div>`;
}

const SEV = { minor: 'sevMinor', major: 'sevMajor', critical: 'sevCritical', safety: 'sevSafety' };

function resultRows(results) {
  if (!results || typeof results !== 'object') return [];
  const entries = Array.isArray(results) ? results.map((v, i) => [String(i + 1), v]) : Object.entries(results);
  return entries.map(([k, v]) => {
    if (v && typeof v === 'object' && 'value' in v) {
      const val = typeof v.value === 'number' ? fmtNum(v.value, v.digits ?? 2) + (v.unit ? ' ' + tr(v.unit) : '') : tr(v.value);
      return [tr(v.label) || k, val];
    }
    if (typeof v === 'number') return [k, fmtNum(v, Number.isInteger(v) ? 0 : 2)];
    if (v && typeof v === 'object' && !(v.ru || v.kk || v.en)) return [k, JSON.stringify(v)];
    return [k, tr(v)];
  });
}

function viewReport() {
  const head = `<div class="bar no-print"><button class="b sm" type="button" data-act="back">${esc(t('back'))}</button><button class="b sm" type="button" data-act="print">⎙ ${esc(t('print'))}</button></div>`;
  if (!st.reportData) return head + `<div class="card empty">${esc(t('loading'))}</div>`;
  const { report: r, data: d } = st.reportData;
  const g = st.gradeDraft || { grade: '', comment: '' };
  const remarks = Array.isArray(d.remarks) ? d.remarks : [];
  const hints = Array.isArray(d.hints) ? d.hints : [];
  const asg = Array.isArray(d.assignment) ? d.assignment : [];
  const journal = Array.isArray(d.journal) ? d.journal : [];
  const res = resultRows(d.results);
  const full = tr(d.reportText);
  return `${head}
  <article class="card pad doc">
    <div class="eyebrow">${esc(t('tabReports'))} · ${esc(labShort(r.lab))}</div>
    <h2>${esc(labName(r.lab))}</h2>
    ${d.truncated ? `<div class="note warn">${esc(t('truncated'))}</div>` : ''}
    <div class="dochead">
      <div><span>${esc(t('student'))}</span>${E(r.name) || '—'}</div>
      <div><span>${esc(t('group'))}</span>${esc(r.group || '—')}</div>
      <div><span>${esc(t('attempt'))}</span>${esc(r.attempt ?? '—')}</div>
      <div><span>${esc(t('langOfWork'))}</span>${esc(LANG_LABEL[r.lang] || r.lang || '—')} · ${esc(r.mode === 'exam' ? t('modeExam') : t('modeTrain'))}</div>
      <div><span>${esc(t('finished'))}</span>${esc(fmtDate(r.finishedAt || r.createdAt))}</div>
    </div>
    <div class="grade">
      <span class="big">${esc(effGrade(r) ?? '—')}</span>
      <div><div class="eyebrow">${esc(r.teacherGrade != null ? t('teacherGrade') : t('autoGrade'))}</div>
        <div>${esc(t('autoGrade'))}: <b>${esc(r.grade ?? '—')}</b> · ${esc(t('penalty'))}: <b class="mono">${esc(fmtPts(r.points ?? 0))}</b></div>
        ${r.teacherGrade != null ? `<div>✎ ${esc(t('changedByTeacher'))}${tr(r.teacherComment) ? ': ' + E(r.teacherComment) : ''}</div>` : ''}</div>
    </div>
    <form class="gradeform" id="gradeForm">
      <label class="f">${esc(t('setGrade'))}<select data-g="grade"><option value="">${esc(t('keepAuto'))} (${esc(r.grade ?? '—')})</option>${[5, 4, 3, 2].map((n) => `<option value="${n}"${String(g.grade) === String(n) ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
      <label class="f">${esc(t('gradeComment'))}<input type="text" data-g="comment" value="${esc(g.comment)}"></label>
      <button class="b pri" type="submit">${esc(t('save'))}</button>
    </form>

    ${res.length ? `<h3>${esc(t('results'))}</h3><div class="tw"><table class="t"><tbody>${res.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table></div>` : ''}

    <h3>${esc(t('remarks'))}</h3>
    ${remarks.length ? `<div class="tw"><table class="t"><thead><tr><th>${esc(t('step'))}</th><th>${esc(t('severity'))}</th><th>${esc(t('points'))}</th><th>${esc(t('remarks'))}</th></tr></thead><tbody>
      ${remarks.map((m) => `<tr><td>${E(m.step)}</td><td class="sev-${esc(m.severity)}">${m.severity === 'critical' ? '⚠ ' : ''}${esc(t(SEV[m.severity] || 'sevMinor'))}</td><td class="mono">${esc(fmtPts(m.points))}</td><td>${E(m.text)}</td></tr>`).join('')}</tbody></table></div>` : `<p class="muted">${esc(t('noRemarks'))}</p>`}

    <h3>${esc(t('hints'))}</h3>
    ${hints.length ? `<ul>${hints.map((h) => `<li>${E(h.step)} — ${esc(t('hintLevel'))} ${esc(h.level)}</li>`).join('')}</ul>` : `<p class="muted">${esc(t('noHints'))}</p>`}

    ${asg.length ? `<h3>${esc(t('assignment'))}</h3><div class="tw"><table class="t"><tbody>${asg.map((a) => `<tr><td>${E(a.task)}</td><td>${E(a.answer) || '—'}</td><td>${a.ok === true ? `<span class="ic-ok">✓ ${esc(t('right'))}</span>` : a.ok === false ? `<span class="ic-no">✕ ${esc(t('wrong'))}</span>` : `<span class="muted">✎ ${esc(t('freeAnswer'))}</span>`}</td></tr>`).join('')}</tbody></table></div>` : ''}

    ${journal.length ? `<h3>${esc(t('journal'))}</h3><ol class="jr">${journal.map((j) => `<li class="${esc(j.kind)}"><time>${E(j.t)}</time><span>${j.kind === 'obs' ? `<b>${esc(t('obs'))}</b> ` : ''}${E(j.text)}</span></li>`).join('')}</ol>` : ''}

    ${full ? `<h3>${esc(t('fullText'))}</h3><pre class="full">${esc(full)}</pre>` : ''}
    <p class="small muted">© ${new Date().getFullYear()}, ${esc(tr(CONFIG.AUTHOR))}. ${esc(t('rights'))}</p>
  </article>`;
}

/* --- студенты --- */
function cellFor(lab, c) {
  if (!c) return '<span class="muted" aria-label="—">·</span>';
  if (c.grade != null) return gnum(c.grade);
  const r = { kind: lab === 'lab-00' ? 'briefing' : 'admission', status: c.admission };
  const cls = c.admission === 'approved' ? 'ic-ok' : c.admission === 'pending' ? 'ic-wait' : 'ic-no';
  return c.admission ? `<span class="${cls}" title="${esc(statusName(r))}${c.score != null ? ' · ' + esc(c.score) + '/' + esc(c.total) : ''}" aria-label="${esc(statusName(r))}">${ICON[c.admission]}</span>` : '·';
}

function viewStudents() {
  const list = st.students.filter((s) => (!st.f.sgroup || s.group === st.f.sgroup) && matchQ(s));
  const showAccess = st.studentsAccess === 'approved';
  return `${topBar('students')}
  <div class="filters">${selectGroup(st.students, 'sgroup')}${searchBox()}</div>
  ${list.length ? `<div class="card tw"><table class="mx"><thead><tr><th class="nm" scope="col">${esc(t('student'))}</th>${showAccess ? `<th scope="col">${esc(t('access'))}</th>` : ''}${labs.map((l) => `<th scope="col" title="${esc(tr(l.title))}">${esc(labShort(l.id))}</th>`).join('')}</tr></thead>
    <tbody>${list.map((s) => `<tr><td class="nm"><b>${E(s.name) || '—'}</b><br><span class="small muted">${esc(s.group || '—')}</span></td>${showAccess ? `<td><span class="${s.access === 'approved' ? 'ic-ok' : s.access === 'pending' ? 'ic-wait' : 'ic-no'}" title="${esc(accessName(s.access))}">${s.access === 'approved' ? '✓' : s.access === 'pending' ? '◷' : s.access === 'denied' ? '✕' : '·'}</span></td>` : ''}${labs.map((l) => `<td>${cellFor(l.id, s.labs && s.labs[l.id])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <div class="legend"><b>${esc(t('legend'))}:</b><span><span class="gnum" style="font-size:14px">5</span> ${esc(t('grade'))}</span><span class="ic-ok">✓</span> ${esc(t('stApproved'))}<span class="ic-wait">◷</span> ${esc(t('stPending'))}<span class="ic-no">✕</span> ${esc(t('stDenied'))}<span>· —</span></div>`
    : `<div class="card empty">${esc(t('noStudents'))}</div>`}`;
}

/* --- настройки --- */
function viewSettings() {
  const d = st.draft;
  if (!d) return topBar('') + `<div class="card empty">${esc(t('loading'))}</div>`;
  const tgl = (lab, k, label) => {
    const on = Boolean(d.labs[lab] && d.labs[lab][k]);
    return `<label class="tgl${on ? ' on' : ''}"><input type="checkbox" data-lab="${esc(lab)}" data-k="${k}"${on ? ' checked' : ''}>${esc(label)}</label>`;
  };
  const ids = [...new Set([...labs.map((l) => l.id), ...Object.keys(d.labs || {})])];
  return `${topBar('')}
  <div class="sets">
    <section class="card pad">
      <h2>${esc(t('siteAccess'))}</h2>
      <div class="seg" role="group" aria-label="${esc(t('siteAccess'))}">
        <button class="b${d.access !== 'approved' ? ' on' : ''}" type="button" data-act="access" data-v="all" aria-pressed="${d.access !== 'approved'}">${esc(t('accessAll'))}</button>
        <button class="b${d.access === 'approved' ? ' on' : ''}" type="button" data-act="access" data-v="approved" aria-pressed="${d.access === 'approved'}">${esc(t('accessApproved'))}</button>
      </div>
      <p class="small muted">${esc(t('accessNote'))}</p>
    </section>
    <section class="card pad">
      <h2>${esc(t('labSettings'))}</h2>
      <p class="small muted" style="margin-top:0">${esc(t('labSettingsNote'))}</p>
      <div class="labset">${ids.map((id) => `<div class="labrow"><div class="nm">${esc(labShort(id))}<small>${esc(labOf(id) ? tr(labOf(id).title) : id)}</small></div>
        <div class="tgls">${tgl(id, 'open', t('sOpen'))}${tgl(id, 'hints', t('sHints'))}${tgl(id, 'autoAdmit', t('sAuto'))}</div></div>`).join('')}</div>
    </section>
    <section class="card pad">
      <h2>${esc(t('notify'))}</h2>
      <div class="radio" role="radiogroup" aria-label="${esc(t('notify'))}">
        ${[['off', 'notifyOff'], ['each', 'notifyEach'], ['daily', 'notifyDaily']].map(([v, k]) => `<label><input type="radio" name="notifyMode" value="${v}" data-s="notifyMode"${d.notifyMode === v ? ' checked' : ''}>${esc(t(k))}</label>`).join('')}
      </div>
      <label class="f" style="margin-top:10px">${esc(t('notifyEmail'))}<input type="email" data-s="notifyEmail" value="${esc(d.notifyEmail || '')}" autocomplete="email" inputmode="email"></label>
      <p class="small muted">${esc(t('notifyNote'))}</p>
      <p class="small muted">${esc(t('server'))}: <span class="mono">${esc(st.mode === 'demo' ? t('demoServer') : shortUrl(CONFIG.BACKEND_URL))}</span></p>
    </section>
    <div class="savebar"><span class="small ${st.dirty ? '' : 'muted'} grow">${st.dirty ? '● ' + esc(t('unsaved')) : ''}</span><button class="b pri" type="button" data-act="saveSettings"${st.dirty ? '' : ' disabled'}>${esc(t('saveSettings'))}</button></div>
  </div>`;
}

function shortUrl(u) {
  if (!u) return '—';
  return u.length > 48 ? u.slice(0, 30) + '…' + u.slice(-12) : u;
}

/* ---------- отрисовка ---------- */
function render() {
  renderChrome();
  if (st.mode === 'login') {
    main.innerHTML = viewLogin();
    return;
  }
  const body = st.tab === 'requests' ? viewRequests() : st.tab === 'reports' ? viewReports() : st.tab === 'students' ? viewStudents() : viewSettings();
  main.innerHTML = tabsBar() + `<section role="tabpanel">${body}</section>`;
}

/** Перерисовать, не мешая вводу: если курсор в поле — дождаться, пока его покинут. */
function softRender() {
  const a = document.activeElement;
  if (a && main.contains(a) && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) {
    if (!st.deferRender) {
      st.deferRender = true;
      a.addEventListener('blur', () => { st.deferRender = false; setTimeout(render, 0); }, { once: true });
    }
    return;
  }
  render();
}

/* ---------- данные ---------- */
async function loadAll(silent = false) {
  if (!client) return;
  if (!silent) { st.loading = true; softRender(); }
  try {
    const [rq, rp, sd, se] = await Promise.all([
      client.call('listRequests'), client.call('listReports'), client.call('listStudents'), client.call('getSettings'),
    ]);
    st.requests = rq.requests || [];
    st.reports = rp.reports || [];
    st.students = sd.students || [];
    st.studentsAccess = sd.access || se.access || 'all';
    st.settings = { access: se.access || 'all', notifyMode: se.notifyMode || 'off', notifyEmail: se.notifyEmail || '', labs: se.labs || {} };
    if (!st.dirty) st.draft = JSON.parse(JSON.stringify(st.settings));
    st.lastUpdate = Date.now();
  } catch (e) {
    if (handleAuth(e)) return;
    toast(errText(e), true);
  } finally {
    st.loading = false;
  }
  softRender();
}

function handleAuth(e) {
  if (e && e.code === 'auth' && st.mode === 'live') {
    logout();
    st.loginErr = t('e_auth');
    render();
    return true;
  }
  return false;
}

async function doLogin(form) {
  const login = form.login.value.trim();
  st.loginName = login;
  const password = form.password.value;
  if (!login || !password) { st.loginErr = t('needLogin'); render(); return; }
  st.loginBusy = true; st.loginErr = ''; render();
  const c = createServerClient(CONFIG.BACKEND_URL, () => st.token);
  try {
    const res = await c.call('login', { login, password });
    st.token = res.token;
    ss.set(KEY.token, { token: res.token, exp: res.expiresAt || Date.now() + 12 * 3600 * 1000 });
    client = c;
    st.mode = 'live';
    st.loginBusy = false;
    st.tab = 'requests';
    render();
    main.focus();
    loadAll();
  } catch (e) {
    st.loginBusy = false;
    st.loginErr = errText(e);
    render();
    const f = document.querySelector('#loginForm input[name=password]');
    if (f) f.focus();
  }
}

function startDemo() {
  client = createDemoClient();
  st.mode = 'demo';
  st.tab = 'requests';
  st.f = { kind: '', status: 'pending', group: '', lab: '', grade: '', q: '', sgroup: '' };
  st.dirty = false; st.draft = null; st.report = null;
  render();
  main.focus();
  loadAll();
}

function logout() {
  ss.del(KEY.token);
  client = null;
  Object.assign(st, { mode: 'login', token: '', requests: [], reports: [], students: [], settings: null, draft: null, dirty: false, report: null, reportData: null, loginErr: '', drafts: {} });
  st.openAns.clear(); st.changing.clear();
  try { const u = new URL(location.href); if (u.searchParams.has('demo')) { u.searchParams.delete('demo'); history.replaceState(null, '', u); } } catch (e) { /* нет URL */ }
}

async function decide(id, status) {
  const r = st.requests.find((x) => x.id === id);
  if (!r) return;
  const comment = (st.drafts[id] ?? tr(r.comment) ?? '').trim();
  try {
    const res = await client.call('decide', { id, status, comment });
    Object.assign(r, { status, comment, decidedAt: res.decidedAt || Date.now() });
    st.changing.delete(id);
    delete st.drafts[id];
    toast('✓ ' + t('saved') + ': ' + tr(r.name) + ' — ' + statusName(r));
    render();
    loadAll(true);
  } catch (e) {
    if (!handleAuth(e)) toast(errText(e), true);
  }
}

async function openReport(id) {
  st.report = id; st.reportData = null; st.gradeDraft = null;
  render();
  window.scrollTo(0, 0);
  try {
    const res = await client.call('getReport', { id });
    st.reportData = { report: res.report, data: res.data || {} };
    st.gradeDraft = { grade: res.report.teacherGrade ?? '', comment: tr(res.report.teacherComment) || '' };
  } catch (e) {
    if (handleAuth(e)) return;
    toast(errText(e), true);
    st.report = null;
  }
  render();
}

async function saveGrade() {
  const r = st.reportData && st.reportData.report;
  if (!r) return;
  const g = st.gradeDraft || { grade: '', comment: '' };
  try {
    const res = await client.call('setGrade', { id: r.id, grade: g.grade === '' ? null : Number(g.grade), comment: g.comment });
    r.teacherGrade = res.teacherGrade ?? null;
    r.teacherComment = r.teacherGrade == null ? '' : g.comment;
    const inList = st.reports.find((x) => x.id === r.id);
    if (inList) Object.assign(inList, { teacherGrade: r.teacherGrade, teacherComment: r.teacherComment, gradedAt: res.gradedAt });
    toast('✓ ' + t('saved'));
    render();
    loadAll(true);
  } catch (e) {
    if (!handleAuth(e)) toast(errText(e), true);
  }
}

async function saveSettings() {
  try {
    const res = await client.call('setSettings', st.draft);
    st.settings = { access: res.access, notifyMode: res.notifyMode, notifyEmail: res.notifyEmail, labs: res.labs };
    st.draft = JSON.parse(JSON.stringify(st.settings));
    st.dirty = false;
    toast('✓ ' + t('saved') + (res.warning ? ' · ' + res.warning : ''));
    render();
    loadAll(true);
  } catch (e) {
    if (!handleAuth(e)) toast(errText(e), true);
  }
}

function download(name, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

function exportCsv(kind) {
  const f = { t, tr, lang: st.lang, labName, labShort, kindName, statusName, accessName };
  const day = new Date().toISOString().slice(0, 10);
  if (kind === 'requests') download(`vlab-requests-${day}.csv`, requestsCsv(filteredRequests(), f));
  else if (kind === 'reports') download(`vlab-reports-${day}.csv`, reportsCsv(filteredReports(), f));
  else if (kind === 'students') download(`vlab-students-${day}.csv`, studentsCsv(st.students.filter((s) => (!st.f.sgroup || s.group === st.f.sgroup) && matchQ(s)), labs, f));
}

/* ---------- события ---------- */
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  const v = el.dataset.v;
  const id = el.dataset.id;
  switch (act) {
    case 'lang':
      st.lang = v; ls.set(KEY.lang, v); render(); break;
    case 'logout':
      logout(); render(); break;
    case 'demo':
      startDemo(); break;
    case 'tab':
      st.tab = v; st.report = null; render(); break;
    case 'refresh':
      loadAll(); break;
    case 'f':
      st.f[el.dataset.k] = v; render(); break;
    case 'ans':
      if (st.openAns.has(id)) st.openAns.delete(id); else st.openAns.add(id);
      render(); break;
    case 'change':
      st.changing.add(id); render(); break;
    case 'decide':
      decide(id, v); break;
    case 'openRep':
      openReport(id); break;
    case 'back':
      st.report = null; st.reportData = null; render(); break;
    case 'print':
      window.print(); break;
    case 'csv':
      exportCsv(v); break;
    case 'access':
      st.draft.access = v; st.dirty = true; render(); break;
    case 'saveSettings':
      saveSettings(); break;
    default:
  }
});

$('themeBtn').addEventListener('click', () => {
  st.theme = st.theme === 'auto' ? 'light' : st.theme === 'light' ? 'dark' : 'auto';
  ls.set(KEY.theme, st.theme);
  applyTheme();
});

main.addEventListener('submit', (ev) => {
  ev.preventDefault();
  if (ev.target.id === 'loginForm') doLogin(ev.target);
  else if (ev.target.id === 'gradeForm') saveGrade();
});

main.addEventListener('input', (ev) => {
  const el = ev.target;
  if (el.dataset.draft) st.drafts[el.dataset.draft] = el.value;
  else if (el.dataset.g && st.gradeDraft) st.gradeDraft[el.dataset.g] = el.value;
  else if (el.dataset.f === 'q') {
    st.f.q = el.value;
    const pos = el.selectionStart;
    render();
    const box = main.querySelector('input[data-f="q"]');
    if (box) { box.focus(); try { box.setSelectionRange(pos, pos); } catch (e) { /* пусто */ } }
  } else if (el.dataset.s === 'notifyEmail') { st.draft.notifyEmail = el.value; st.dirty = true; markDirty(); }
});

main.addEventListener('change', (ev) => {
  const el = ev.target;
  if (el.dataset.f && el.dataset.f !== 'q') { st.f[el.dataset.f] = el.value; render(); }
  else if (el.dataset.g && st.gradeDraft) st.gradeDraft[el.dataset.g] = el.value;
  else if (el.dataset.lab) {
    const lab = el.dataset.lab;
    st.draft.labs[lab] = { open: true, hints: true, autoAdmit: false, ...(st.draft.labs[lab] || {}), [el.dataset.k]: el.checked };
    st.dirty = true;
    el.closest('.tgl').classList.toggle('on', el.checked);
    markDirty();
  } else if (el.dataset.s === 'notifyMode') { st.draft.notifyMode = el.value; st.dirty = true; markDirty(); }
});

/** Показать «несохранённые изменения», не перерисовывая форму. */
function markDirty() {
  const bar = main.querySelector('.savebar');
  if (!bar) return;
  bar.querySelector('span').textContent = '● ' + t('unsaved');
  bar.querySelector('span').classList.remove('muted');
  bar.querySelector('button').disabled = false;
}

setInterval(() => {
  if (st.mode !== 'login' && !document.hidden && !st.loading) loadAll(true);
}, REFRESH_MS);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && st.mode !== 'login' && Date.now() - st.lastUpdate > REFRESH_MS) loadAll(true);
});

/* ---------- названия работ из манифеста (если он уже есть) ---------- */
async function loadManifest() {
  try {
    const m = await import('../labs/manifest.js');
    const arr = [m.default, m.labs, m.manifest, m.LABS, m.MANIFEST].find((x) => Array.isArray(x) || (x && Array.isArray(x.labs)));
    const list = Array.isArray(arr) ? arr : arr && arr.labs;
    if (!list || !list.length) return;
    const ok = (x) => x && typeof x === 'object' && x.ru && x.kk && x.en;
    const merged = LABS_FALLBACK.map((fb) => {
      const e = list.find((x) => x && x.id === fb.id);
      return e ? { ...fb, title: ok(e.title) ? e.title : fb.title } : fb;
    });
    for (const e of list) {
      if (e && e.id && !merged.some((x) => x.id === e.id) && ok(e.title)) merged.push({ id: e.id, number: e.number || e.id.replace('lab-', ''), title: e.title });
    }
    labs = merged;
    render();
  } catch (e) { /* манифеста пока нет — используем список из i18n.js */ }
}

/* ---------- старт ---------- */
function start() {
  const saved = ss.get(KEY.token);
  const wantDemo = /[?&]demo(=1|&|$)/.test(location.search);
  if (wantDemo) { startDemo(); }
  else if (saved && saved.token && saved.exp > Date.now() && CONFIG.BACKEND_URL) {
    st.token = saved.token;
    client = createServerClient(CONFIG.BACKEND_URL, () => st.token);
    st.mode = 'live';
    render();
    loadAll();
  } else {
    render();
  }
  loadManifest();
}

start();
