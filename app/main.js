/**
 * Оболочка студента: старт, маршруты (хэш), шапка с языком и темой, подпись автора, офлайн.
 * Маршруты: #/ · #/lab/08 · #/lab/08/admission · #/lab/08/exp/2 · #/lab/08/report
 * Параметры: ?mode=exam — без подсказок; ?preview=… — демонстрация статусов (app/preview.js).
 */
import { createActivity } from './activity.js';
import { VERSION } from './version.js';
import { btn } from './ui/controls.js';
import { createSync } from './sync.js';
import { CONFIG } from '../config.js';
import apiBase from './api.js';
import { withPreview } from './preview.js';
import { withFastApi } from './fastapi.js';
import { h, esc } from './dom.js';
import { t, tr, getLang, setLang, onLang, LANGS, LANG_LABEL, labName } from './i18n.js';
import * as store from './store.js';
import { LABS, byNumber } from '../labs/manifest.js';
import { homePage, labPage, accessPage } from './ui/pages.js';
import { admissionPage } from './ui/admission.js';
import { experimentPage } from './ui/experiment.js';
import { reportPage } from './ui/reportPage.js';
import { close as closeModal, toast } from './ui/modal.js';

const params = new URLSearchParams(location.search);
const mode = params.get('mode') === 'exam' ? 'exam' : 'train';
const previewMode = params.get('preview');
// Быстрый слой (app/fastapi.js): кэш статусов и мгновенный доступ/настройки; в режиме ?preview= — без него.
let changeTimer = null;
const api = previewMode ? withPreview(apiBase, previewMode) : withFastApi(apiBase, { onChange: (what, data) => {
  if (what === 'settings' && data) settings = data;
  // Сервер ответил иначе, чем помнило устройство: перерисовать главную или страницу работы (опыт не трогаем).
  clearTimeout(changeTimer);
  changeTimer = setTimeout(() => {
    const r = parse();
    if (what === 'access' || r.name === 'home' || r.name === 'lab') render();
  }, 400);
} });
const app = document.getElementById('app');

store.migrate();

/* ---------- тема ---------- */
const themes = ['auto', 'light', 'dark'];
function applyTheme() {
  const th = store.get('theme', 'auto');
  if (th === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', th);
}
const isDark = () => {
  const th = document.documentElement.getAttribute('data-theme');
  if (th) return th === 'dark';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};
applyTheme();

/* ---------- работы ---------- */
const labs = new Map();
async function loadLabs() {
  await Promise.all(LABS.map(async (e) => {
    try {
      const mod = await import(`../labs/${e.folder}/lab.js`);
      const lab = mod.default;
      lab._url = new URL(`../labs/${e.folder}/`, import.meta.url).href;
      lab.display = lab.display || e.display;
      labs.set(e.id, lab);
    } catch (err) { console.error('lab', e.id, err); }
  }));
}

let settings = { labs: {} };
async function loadSettings() { try { settings = (await api.getSettings()) || { labs: {} }; } catch (e) { /* локально */ } }

const activity = createActivity(apiBase, { enabled: !previewMode });
const sync = createSync(apiBase, { enabled: !previewMode });
const env = {
  api, mode, labs, activity, sync,
  get settings() { return settings; },
  get dark() { return isDark(); },
  get footSlot() { return footSlot; },
  rerender: () => rerender(),
  hintsOff: (lab) => mode === 'exam' || (((settings.labs || {})[lab.id] || {}).hints === false),
};

/* ---------- шапка и подвал ---------- */
// Знак сайта — бензольное кольцо (шестиугольник с кругом), линией в цвет акцента.
const LOGO = '<svg class="logo" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3.5 L34.3 11.75 L34.3 28.25 L20 36.5 L5.7 28.25 L5.7 11.75 Z" fill="none" stroke="var(--accent)" stroke-width="2.6" stroke-linejoin="round"/><circle cx="20" cy="20" r="7.2" fill="none" stroke="var(--accent)" stroke-width="2.6"/></svg>';
const THEME_ICON = {
  auto: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 4 A8 8 0 0 1 12 20 Z" fill="currentColor"/></svg>',
  light: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M5.3 18.7 7 17M17 7l1.7-1.7"/></g></svg>',
  dark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
};

function header() {
  const lang = h('div', { class: 'seg', role: 'group', 'aria-label': t('langLabel') });
  for (const l of LANGS) {
    const b = h('button', { class: 'b sm' + (getLang() === l ? ' on' : ''), type: 'button', lang: l, 'aria-pressed': String(getLang() === l) }, LANG_LABEL[l]);
    b.onclick = () => setLang(l);
    lang.append(b);
  }
  const th = store.get('theme', 'auto');
  const thLabel = { auto: t('themeAuto'), light: t('themeLight'), dark: t('themeDark') };
  const theme = h('button', { class: 'b themebtn', type: 'button', title: t('theme') + ': ' + thLabel[th], 'aria-label': t('theme') + ': ' + thLabel[th], html: THEME_ICON[th] });
  theme.onclick = () => { store.set('theme', themes[(themes.indexOf(th) + 1) % 3]); applyTheme(); render(); };
  return h('header', { class: 'top noprint' },
    h('a', { class: 'brand', href: '#/', html: LOGO }, h('b', null, t('appName'))),
    h('div', { class: 'topr' }, lang, theme));
}

function banners() {
  const out = [];
  if (api.preview) out.push(h('p', { class: 'banner info noprint' }, `${t('previewMode')}: ${api.preview}`));
  if (mode === 'exam') out.push(h('p', { class: 'banner warn noprint' }, t('examMode')));
  if (!navigator.onLine) out.push(h('p', { class: 'banner warn noprint' }, t('offline')));
  else if (!api.isConnected()) out.push(h('p', { class: 'banner noprint muted', style: 'font-size:12.5px' }, t('localMode')));
  return out;
}

/** Подвал: автор, версия; справа — место для кнопок страницы (на главной — «Сбросить прогресс»). */
let footSlot = null;
function footer() {
  footSlot = h('span', { class: 'noprint' });
  return h('footer', { class: 'foot' },
    h('span', null, `© ${tr(CONFIG.AUTHOR_SHORT || CONFIG.AUTHOR)}, ${new Date().getFullYear()} · ${t('rights')}`, h('span', { class: 'noprint' }, ` · v${VERSION}`)),
    footSlot);
}

/* ---------- маршрутизация ---------- */
let page = null;
let rendering = Promise.resolve();

function parse() {
  const p = (location.hash || '#/').replace(/^#\/?/, '').split('/').filter(Boolean);
  if (p[0] === 'lab' && p[1]) return { name: p[2] === 'exp' ? 'exp' : p[2] || 'lab', num: p[1], exp: p[3] };
  return { name: 'home' };
}

async function guard(entry, lab, needAdmission, what) {
  const { labStatus, allDone } = await import('./ui/status.js');
  const st = await labStatus(entry, lab, env);
  if (['draft', 'closed', 'briefing'].includes(st.key)) return false;
  if (lab.admissionAfterExperiments) {
    // вводное занятие: этапы — без допуска; итоговый тест — после всех этапов (или для просмотра решения)
    if (what === 'exp') return true;
    if (what === 'admission') return !!st.adm || allDone(lab, store.loadLab(entry.id));
  }
  if (needAdmission && (!st.adm || st.adm.status !== 'approved')) return false;
  return true;
}

/** Сообщение после переезда со старого адреса (import.html ставит флаг vlab_moved), показывается один раз. */
let movedFlag = null;
try { movedFlag = sessionStorage.getItem('vlab_moved'); sessionStorage.removeItem('vlab_moved'); } catch (e) { /* без уведомления */ }
// Показывается на главной, пока студент не уйдёт с неё (перерисовки главной его не убирают).
window.addEventListener('hashchange', () => { if (parse().name !== 'home') movedFlag = null; });
function movedNotice() {
  const f = movedFlag;
  if (f === 'ok') return h('p', { class: 'fb good', role: 'status' }, t('movedOk'));
  if (f === 'skip') return h('p', { class: 'fb info', role: 'status' }, t('movedSkip'));
  return '';
}

function render() {
  rendering = rendering.then(doRender).catch((e) => console.error(e));
  return rendering;
}

/**
 * Перерисовка той же страницы (выбран вариант ответа, сохранено ФИО, сменён язык): прокрутка остаётся на месте.
 * На время перерисовки страница держит прежнюю высоту — иначе браузер прокручивает её к началу.
 */
function rerender() {
  const y = window.scrollY;
  app.style.minHeight = app.offsetHeight + 'px';
  return render().then(() => { app.style.minHeight = ''; window.scrollTo(0, y); });
}

async function doRender() {
  closeModal();
  if (page && page.destroy) try { page.destroy(); } catch (e) { console.error(e); }
  page = null;
  document.documentElement.lang = getLang();
  document.body.classList.remove('has-bar');
  const root = h('main', { id: 'main', tabindex: '-1' });
  app.innerHTML = '';
  app.append(h('a', { class: 'skip', href: '#main' }, '↓'), header(), ...banners(), root, footer());

  let access = { status: 'open' };
  try { access = (await api.getAccess()) || access; } catch (e) { /* без связи — пускаем */ }
  if (['pending', 'denied', 'none'].includes(access.status)) {
    await accessPage(root, env, access, () => render());
    const id = setInterval(async () => { const a = await api.getAccess(); if (a.status !== access.status) { clearInterval(id); render(); } }, 30000);
    page = { destroy: () => clearInterval(id) };
    return;
  }

  const r = parse();
  if (r.name === 'home') { activity.set({ view: 'home' }); root.append(movedNotice()); await homePage(root, env); document.title = t('appName'); return; }
  const entry = byNumber(r.num);
  const lab = entry && labs.get(entry.id);
  if (!entry || !lab) { root.append(h('h1', null, t('notFound')), h('a', { class: 'b', href: '#/' }, t('home'))); return; }
  document.title = `${labName({ ...entry, ...lab, display: entry.display })} · ${t('appName')}`;
  if (r.name === 'lab') { activity.set({ view: 'lab', lab: entry.id }); await labPage(root, env, entry, lab); return; }
  if (r.name === 'admission') {
    if (!(await guard(entry, lab, false, 'admission'))) { location.hash = `#/lab/${entry.number}`; return; }
    activity.set({ view: 'admission', lab: entry.id });
    page = await admissionPage(root, env, entry, lab); return;
  }
  if (r.name === 'report') {
    if (!(await guard(entry, lab, true, 'report'))) { location.hash = `#/lab/${entry.number}`; return; }
    activity.set({ view: 'report', lab: entry.id });
    page = await reportPage(root, env, entry, lab); return;
  }
  if (r.name === 'exp') {
    const exp = lab.experiments.find((e) => e.id === r.exp);
    if (!exp || !(await guard(entry, lab, true, 'exp'))) { location.hash = `#/lab/${entry.number}`; return; }
    const progress = store.loadLab(entry.id);
    const i = lab.experiments.indexOf(exp);
    const prev = lab.experiments[i - 1];
    if (prev && !prev.optional && !(progress.runs[prev.id] && progress.runs[prev.id].status === 'done') && !progress.runs[exp.id]) { location.hash = `#/lab/${entry.number}`; return; }
    page = await experimentPage(root, env, lab, exp);
    return;
  }
  root.append(h('h1', null, t('notFound')));
}

/**
 * Числовые поля: клавиши цифр и минуса дают цифру и минус в любой раскладке.
 * В казахской раскладке Windows верхний ряд печатает буквы (2 → ә, «-» → ө), и минус в ответ не вводился.
 */
document.addEventListener('keydown', (e) => {
  const el = e.target;
  if (!el || el.tagName !== 'INPUT' || !el.classList.contains('num') || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
  const m = /^Digit(\d)$/.exec(e.code || '');
  const ch = m ? m[1] : (e.code === 'Minus' || e.code === 'NumpadSubtract') ? '-' : null;
  if (!ch || e.key === ch) return;
  e.preventDefault();
  const a = el.selectionStart ?? el.value.length, b = el.selectionEnd ?? a;
  el.setRangeText(ch, a, b, 'end');
  el.dispatchEvent(new Event('input', { bubbles: true }));
}, true);

window.addEventListener('hashchange', () => {
  if (updateReady) { location.reload(); return; } // новая версия ждёт — применяем при переходе на другую страницу
  render().then(() => window.scrollTo(0, 0));
});

/**
 * Обновление сайта. Сервис-воркер проверяет новую версию каждые 5 минут и при возврате на вкладку
 * (сайт — одна страница, сам браузер проверяет только при полной загрузке). Когда новая версия установлена:
 * на главной и странице работы — перезагрузка сразу; в опыте, тесте и протоколе — плашка «Обновить»
 * и перезагрузка при следующем переходе (прогресс сохраняется при каждом действии).
 */
let updateReady = false;
function onUpdateReady() {
  if (updateReady) return;
  updateReady = true;
  if (['home', 'lab'].includes(parse().name)) { location.reload(); return; }
  const bar = h('div', { class: 'updbar noprint', role: 'status' }, h('span', null, t('updReady')), btn(t('updNow'), () => location.reload(), 'pri sm'));
  document.body.append(bar);
}
onLang(() => render());
window.addEventListener('online', () => { api.flushOutbox().catch(() => {}); render(); });
window.addEventListener('offline', () => render());
if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => render());

/** Забрать копию прогресса с сервера; если что-то восстановлено — перерисовать (кроме открытого опыта). */
async function restoreProgress() {
  const r = parse();
  const entry = r.name === 'exp' ? byNumber(r.num) : null;
  const n = await sync.restore({ skipLab: entry ? entry.id : '' });
  sync.scan();
  if (n && parse().name !== 'exp') { await render(); toast(esc(t('restoredN', { n })), 'info'); }
}
globalThis.addEventListener('vlab-profile', async () => {
  if (api.resetCache) api.resetCache(); // статусы допуска — заново, уже с новыми ФИО и группой
  const before = parse().name;
  await restoreProgress();
  if (before !== 'exp' && parse().name !== 'exp') render();
});

(async function boot() {
  await Promise.all([loadLabs(), loadSettings()]);
  try { await api.flushOutbox(); } catch (e) { /* очередь подождёт */ }
  await render();
  restoreProgress();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController) onUpdateReady(); });
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      const check = () => { reg.update().catch(() => {}); };
      setInterval(check, 5 * 60000);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
    }).catch(() => {});
  }
})();
