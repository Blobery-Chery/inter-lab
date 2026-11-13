/**
 * Оболочка студента: старт, маршруты (хэш), шапка с языком и темой, подпись автора, офлайн.
 * Маршруты: #/ · #/lab/08 · #/lab/08/admission · #/lab/08/exp/2 · #/lab/08/report
 * Параметры: ?mode=exam — без подсказок; ?preview=… — демонстрация статусов (app/preview.js).
 */
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
import { close as closeModal } from './ui/modal.js';

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

const env = {
  api, mode, labs,
  get settings() { return settings; },
  get dark() { return isDark(); },
  rerender: () => render(),
  hintsOff: (lab) => mode === 'exam' || (((settings.labs || {})[lab.id] || {}).hints === false),
};

/* ---------- шапка и подвал ---------- */
const LOGO = '<svg class="logo" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="var(--accent)"/><path d="M26 12 L26 28 L14 50 Q12 54 17 54 L47 54 Q52 54 50 50 L38 28 L38 12 Z" fill="var(--accent-ink)" opacity=".95"/><path d="M19 44 L45 44 L49 51 Q50 53 47 53 L17 53 Q14 53 15 51 Z" fill="var(--accent)" opacity=".45"/><rect x="23" y="9" width="18" height="5" rx="2" fill="var(--accent-ink)"/></svg>';

function header() {
  const lang = h('div', { class: 'seg', role: 'group', 'aria-label': t('langLabel') });
  for (const l of LANGS) {
    const b = h('button', { class: 'b sm' + (getLang() === l ? ' on' : ''), type: 'button', lang: l, 'aria-pressed': String(getLang() === l) }, LANG_LABEL[l]);
    b.onclick = () => setLang(l);
    lang.append(b);
  }
  const th = store.get('theme', 'auto');
  const thLabel = { auto: t('themeAuto'), light: t('themeLight'), dark: t('themeDark') };
  const theme = h('button', { class: 'b sm', type: 'button', title: t('theme'), 'aria-label': t('theme') + ': ' + thLabel[th] }, (th === 'dark' ? '☾ ' : th === 'light' ? '☀ ' : '◐ ') + thLabel[th]);
  theme.onclick = () => { store.set('theme', themes[(themes.indexOf(th) + 1) % 3]); applyTheme(); render(); };
  return h('header', { class: 'top noprint' },
    h('a', { class: 'brand', href: '#/', html: LOGO }, h('span', null, h('b', null, t('appName')), h('small', null, t('discipline')))),
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

function footer() {
  return h('footer', { class: 'foot' }, h('span', null, `© ${new Date().getFullYear()} ${tr(CONFIG.AUTHOR)}. ${t('rights')}.`), h('span', { class: 'noprint' }, `${t('appName')} · v${CONFIG.APP_VERSION}`));
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
function movedNotice() {
  let f = null;
  try { f = sessionStorage.getItem('vlab_moved'); sessionStorage.removeItem('vlab_moved'); } catch (e) { /* без уведомления */ }
  if (f === 'ok') return h('p', { class: 'fb good', role: 'status' }, t('movedOk'));
  if (f === 'skip') return h('p', { class: 'fb info', role: 'status' }, t('movedSkip'));
  return '';
}

function render() {
  rendering = rendering.then(doRender).catch((e) => console.error(e));
  return rendering;
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
  root.style.removeProperty('--accent');

  let access = { status: 'open' };
  try { access = (await api.getAccess()) || access; } catch (e) { /* без связи — пускаем */ }
  if (['pending', 'denied', 'none'].includes(access.status)) {
    await accessPage(root, env, access, () => render());
    const id = setInterval(async () => { const a = await api.getAccess(); if (a.status !== access.status) { clearInterval(id); render(); } }, 30000);
    page = { destroy: () => clearInterval(id) };
    return;
  }

  const r = parse();
  if (r.name === 'home') { root.append(movedNotice()); await homePage(root, env); document.title = t('appName'); return; }
  const entry = byNumber(r.num);
  const lab = entry && labs.get(entry.id);
  if (!entry || !lab) { root.append(h('h1', null, t('notFound')), h('a', { class: 'b', href: '#/' }, t('home'))); return; }
  document.title = `${labName({ ...entry, ...lab, display: entry.display })} · ${t('appName')}`;
  const acc = lab.accent || entry.accent;
  app.style.setProperty('--accent', isDark() ? acc.dark : acc.light);
  if (r.name === 'lab') { await labPage(root, env, entry, lab); return; }
  if (r.name === 'admission') {
    if (!(await guard(entry, lab, false, 'admission'))) { location.hash = `#/lab/${entry.number}`; return; }
    page = await admissionPage(root, env, entry, lab); return;
  }
  if (r.name === 'report') {
    if (!(await guard(entry, lab, true, 'report'))) { location.hash = `#/lab/${entry.number}`; return; }
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

window.addEventListener('hashchange', () => { app.style.removeProperty('--accent'); render().then(() => window.scrollTo(0, 0)); });
onLang(() => render());
window.addEventListener('online', () => { api.flushOutbox().catch(() => {}); render(); });
window.addEventListener('offline', () => render());
if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => render());

(async function boot() {
  await Promise.all([loadLabs(), loadSettings()]);
  try { await api.flushOutbox(); } catch (e) { /* очередь подождёт */ }
  await render();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => {});
})();
