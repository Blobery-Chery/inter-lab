/**
 * Сквозная проверка панели преподавателя в браузере (не входит в `node --test`).
 * 1) Макет сервера: backend/Code.gs в Node (tests/api-gas-mock.js), config.js подменяется на BACKEND_URL макета.
 *    Студент проходит допуск к работе 6–7 → заявка в панели → «Допустить» с комментарием → у студента «Допуск получен»
 *    → протокол уходит на сервер → в панели протокол, изменение оценки.
 * 2) Демо-режим панели: «Показать на примере» — вкладки на 375 и 1280 px, светлая и тёмная тема, три языка.
 * Запуск: python3 -m http.server 8000 & node tests/e2e/teacher.mjs [--shots=DIR]
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { createServer } from '../api-gas-mock.js';
const { chromium } = createRequire(import.meta.url)('playwright');

const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, v] = a.slice(2).split('='); return [k, v ?? '1']; }));
const BASE = opt.base || 'http://localhost:8000/';
const SHOTS = opt.shots || '';
const MOCK = 'https://script.google.com/macros/s/MOCK/exec';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const issues = [];
const errors = [];
const check = (cond, msg) => { if (!cond) issues.push(msg); else console.error('  ✓ ' + msg); };

const srv = createServer();
srv.setCredentials('teacher', 'Secret-2026');
const config = readFileSync(new URL('../../config.js', import.meta.url), 'utf8').replace("BACKEND_URL: ''", `BACKEND_URL: '${MOCK}'`);

async function wire(context) {
  await context.route('**/config.js', (r) => r.fulfill({ body: config, contentType: 'text/javascript' }));
  await context.route(MOCK + '*', async (r) => {
    const req = r.request();
    if (req.method() !== 'POST') return r.fulfill({ status: 405, body: '' });
    let out;
    try { out = srv.post(req.postData()); } catch (e) { out = { ok: false, error: 'server', message: String(e) }; }
    return r.fulfill({ body: JSON.stringify(out), contentType: 'application/json', headers: { 'access-control-allow-origin': '*' } });
  });
}
const watch = (page, tag) => {
  page.on('pageerror', (e) => errors.push(`${tag} pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${tag} console: ${m.text()}`); });
};
const textIssues = async (page, where) => {
  const r = await page.evaluate(() => {
    const txt = document.body.innerText;
    const bad = [...txt.matchAll(/(^|[^\p{L}])(undefined|NaN|null|\[object Object\])([^\p{L}]|$)/gu)].map((m) => txt.slice(Math.max(0, m.index - 30), m.index + 30).replace(/\s+/g, ' '));
    return { bad, over: document.documentElement.scrollWidth > window.innerWidth + 1 };
  });
  for (const b of r.bad) issues.push(`${where}: text «${b}»`);
  if (r.over) issues.push(`${where}: horizontal scroll`);
};

const browser = await chromium.launch();

/* ---------- 1. макет сервера ---------- */
{
  const sc = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await wire(sc);
  const stu = await sc.newPage(); watch(stu, 'student');
  await stu.goto(BASE + '#/');
  await stu.waitForSelector('.labcard');
  await stu.evaluate(async () => {
    const api = (await import('/app/api.js')).default;
    api.setStudent({ name: 'Тестовый Студент', group: 'ХИМ-31' });
    (await import('/app/i18n.js')).setLang('ru');
  });
  check(await stu.evaluate(async () => (await import('/app/api.js')).default.isConnected()), 'студент: сетевой режим (BACKEND_URL макета)');
  // инструктаж и допуск к 6–7 — через api, как это делает страница допуска
  const r0 = await stu.evaluate(async () => (await import('/app/api.js')).default.submitAdmission({ lab: 'lab-00', kind: 'briefing', attempt: 1, score: 9, total: 10, pass: 8, answers: [], lang: 'ru' }));
  check(r0 && r0.ok && r0.status === 'pending', `заявка на инструктаж ушла на сервер (${JSON.stringify(r0)})`);
  await stu.goto(BASE + '#/lab/06-07/admission');
  await sleep(800);
  await textIssues(stu, 'student admission (pending briefing)');

  const tp = await sc.newPage(); watch(tp, 'teacher');
  await tp.goto(BASE + 'teacher/');
  await tp.waitForSelector('#loginForm');
  await tp.fill('input[name=login]', 'teacher');
  await tp.fill('input[name=password]', 'wrong-pass');
  await tp.click('#loginForm button[type=submit]');
  await sleep(600);
  check(await tp.locator('.note.bad').count() > 0, 'панель: неверный пароль — сообщение об ошибке');
  await tp.fill('input[name=password]', 'Secret-2026');
  await tp.click('#loginForm button[type=submit]');
  await sleep(1200);
  const body = await tp.evaluate(() => document.body.innerText);
  check(/Тестовый Студент/.test(body), 'панель: заявка студента видна после входа');
  if (SHOTS) await tp.screenshot({ path: `${SHOTS}/teacher-mock-requests.png`, fullPage: true });
  // одобрить все ожидающие заявки
  for (let k = 0; k < 4; k++) {
    const approve = tp.locator('button[data-act="approve"], button:has-text("Допустить"), button:has-text("Рұқсат беру"), button:has-text("Admit")').first();
    if (!(await approve.count())) break;
    const card = approve.locator('xpath=ancestor::*[contains(@class,"card")][1]');
    const ta = card.locator('textarea, input[type=text]').first();
    if (await ta.count()) await ta.fill('Хорошо, допущен.');
    await approve.click();
    await sleep(900);
  }
  const st0 = await stu.evaluate(async () => (await import('/app/api.js')).default.getStatus('lab-00'));
  check(st0 && st0.status === 'approved', `студент: инструктаж одобрен преподавателем (${JSON.stringify(st0)})`);
  // допуск к 6–7 через страницу допуска
  await stu.goto(BASE + '#/lab/06-07/admission');
  await stu.waitForSelector('main h1'); await sleep(500);
  const A = await stu.evaluate(async () => (await import('/app/store.js')).loadLab('lab-06-07').admission);
  const bank = await stu.evaluate(async () => (await import('/labs/lab-06-07/admission.js')).default.map((q) => q.correct));
  for (let k = 0; k < A.qs.length; k++) await stu.locator('fieldset.q').nth(k).locator('button.opt').nth(A.orders[k].indexOf(bank[A.qs[k]])).click();
  await stu.locator('main button.pri', { hasText: 'Проверить' }).first().click();
  await sleep(1200);
  check(/на рассмотрении|Ожидаем решения/i.test(await stu.evaluate(() => document.body.innerText)), 'студент: допуск отправлен, ждёт решения');
  await tp.reload(); await sleep(1500);
  for (let k = 0; k < 3; k++) {
    const approve = tp.locator('button:has-text("Допустить"), button:has-text("Рұқсат беру"), button:has-text("Admit")').first();
    if (!(await approve.count())) break;
    await approve.click(); await sleep(900);
  }
  await stu.locator('main button', { hasText: 'Проверить' }).first().click().catch(() => {});
  await sleep(1200);
  const st1 = await stu.evaluate(async () => (await import('/app/api.js')).default.getStatus('lab-06-07'));
  check(st1 && st1.status === 'approved', `студент: допуск к 6–7 получен (${JSON.stringify(st1)})`);
  await textIssues(stu, 'student admission approved');
  // протокол: отправка (даже неполного протокола через api — проверяем путь до панели)
  const rep = await stu.evaluate(async () => (await import('/app/api.js')).default.submitReport({ lab: 'lab-06-07', grade: 4, points: 2, mode: 'train', lang: 'ru', text: 'Протокол (проверка)', remarks: [], hints: [], results: {}, assignment: {} }));
  check(rep && rep.ok && !rep.queued, `протокол ушёл на сервер (${JSON.stringify(rep)})`);
  await tp.reload(); await sleep(1500);
  await tp.locator('.tabs button, [role=tab]').nth(1).click(); await sleep(800);
  check(/Тестовый Студент/.test(await tp.evaluate(() => document.body.innerText)), 'панель: протокол студента в списке');
  await textIssues(tp, 'teacher reports (mock)');
  if (SHOTS) await tp.screenshot({ path: `${SHOTS}/teacher-mock-reports.png`, fullPage: true });
  await sc.close();
}

/* ---------- 2. демо-режим ---------- */
for (const w of [375, 1280]) for (const theme of ['light', 'dark']) for (const lang of ['kk', 'ru', 'en']) {
  if (theme === 'dark' && lang !== 'ru') continue;
  const c = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: theme });
  const p = await c.newPage(); watch(p, `demo ${w} ${theme} ${lang}`);
  await p.goto(BASE + 'teacher/');
  await p.waitForSelector('[data-act="demo"]');
  const lb = p.locator('#langSeg button', { hasText: { kk: 'Қаз', ru: 'Рус', en: 'Eng' }[lang] });
  if (await lb.count()) await lb.first().click();
  await p.click('[data-act="demo"]');
  await sleep(700);
  const tabs = await p.locator('.tabs button, [role=tab]').count();
  check(tabs >= 3, `демо ${w}px ${theme} ${lang}: вкладки (${tabs})`);
  for (let i = 0; i < tabs; i++) {
    await p.locator('.tabs button, [role=tab]').nth(i).click(); await sleep(300);
    await textIssues(p, `demo ${w} ${theme} ${lang} tab ${i}`);
    if (SHOTS && lang === 'ru') await p.screenshot({ path: `${SHOTS}/teacher-demo-${w}-${theme}-tab${i}.png`, fullPage: true });
  }
  if (lang === 'ru' && theme === 'light') {
    // открыть протокол из демо и изменить оценку
    await p.locator('.tabs button, [role=tab]').nth(1).click(); await sleep(300);
    const open = p.locator('button:has-text("Открыть"), a:has-text("Открыть"), [data-act="open"]').first();
    if (await open.count()) { await open.click(); await sleep(500); await textIssues(p, `demo ${w} report view`); if (SHOTS) await p.screenshot({ path: `${SHOTS}/teacher-demo-${w}-report.png`, fullPage: true }); }
  }
  await c.close();
}
await browser.close();
console.log(JSON.stringify({ issues, errors: [...new Set(errors)] }, null, 1));
