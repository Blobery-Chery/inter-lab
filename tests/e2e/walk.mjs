/**
 * Сквозная проверка: бот-студент проходит работы целиком — допуск → все опыты → протокол → отправка.
 * Не входит в `node --test tests/` (нужен браузер). Запуск:
 *   python3 -m http.server 8000 &
 *   node tests/e2e/walk.mjs [lab-08 …] [--mode=good|bad] [--w=375] [--lang=ru] [--theme=dark] [--shots=DIR]
 * Без списка — все работы. Отчёт — в консоль (JSON-строка на работу) и скриншоты протокола.
 */
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // глобальный Playwright (NODE_PATH)
import { act } from './bot.js';

const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => { const [k, v] = a.slice(2).split('='); return [k, v ?? '1']; }));
const BASE = opt.base || 'http://localhost:8000/';
const MODE = opt.mode || 'good';
const W = +(opt.w || 1280);
const LANG = opt.lang || 'ru';
const SHOTS = opt.shots || '';
const STEP_TIMEOUT = +(opt.stepTimeout || 120) * 1000;
const ALL = ['lab-00', 'lab-06-07', 'lab-08', 'lab-09', 'lab-10', 'lab-11', 'lab-12', 'lab-13', 'lab-14', 'lab-15'];
const labs = args.filter((a) => !a.startsWith('--'));
const list = labs.length ? labs : ALL;
const num = (id) => id.slice(4);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function walkLab(browser, id) {
  const ctxB = await browser.newContext({ viewport: { width: W, height: W < 600 ? 800 : 900 }, colorScheme: opt.theme === 'dark' ? 'dark' : 'light', deviceScaleFactor: 1 });
  const page = await ctxB.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const out = { lab: id, mode: MODE, w: W, lang: LANG, forced: [], issues: [], remarks: 0, restarts: 0, steps: 0 };
  await page.goto(BASE + '#/');
  await page.waitForSelector('.labcard');
  await page.evaluate(async ({ lang, needBriefing }) => {
    const api = (await import('/app/api.js')).default;
    api.setStudent({ name: 'Тестовый Студент', group: 'ХИМ-31' });
    const i18n = await import('/app/i18n.js');
    i18n.setLang(lang);
    if (needBriefing) await api.submitAdmission({ lab: 'lab-00', kind: 'briefing', score: 10, total: 10, pass: 8, answers: [] });
  }, { lang: LANG, needBriefing: id !== 'lab-00' });
  const lab = await page.evaluate(async (folder) => {
    const l = (await import(`/labs/${folder}/lab.js`)).default;
    return { after: !!l.admissionAfterExperiments, exps: l.experiments.map((e) => ({ id: e.id, n: e.steps.length, optional: !!e.optional })) };
  }, id);

  const textIssues = async (where) => {
    const r = await page.evaluate(() => {
      const main = document.querySelector('main');
      const txt = main ? main.innerText : '';
      const bad = [...txt.matchAll(/(^|[^\p{L}])(undefined|NaN|null|\[object Object\]|Infinity)([^\p{L}]|$)/gu)].map((m) => txt.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\s+/g, ' '));
      const over = document.documentElement.scrollWidth > window.innerWidth + 1;
      let wide = '';
      if (over) { for (const el of document.querySelectorAll('main *')) { const b = el.getBoundingClientRect(); if (b.right > window.innerWidth + 1 && b.width > 0) { wide = (el.className || el.tagName) + ' ' + Math.round(b.right); break; } } }
      return { bad, over, wide };
    });
    for (const b of r.bad) out.issues.push(`${where}: text «${b}»`);
    if (r.over) out.issues.push(`${where}: horizontal scroll (${r.wide})`);
  };

  async function admission() {
    await page.goto(BASE + `#/lab/${num(id)}/admission`);
    await page.waitForSelector('main h1');
    await sleep(300);
    for (let attempt = 0; attempt < 3; attempt++) {
      const st = await page.evaluate(async (lid) => { const s = await import('/app/store.js'); return s.loadLab(lid).admission; }, id);
      if (!st || st.submitted) {
        const retake = page.locator('main button', { hasText: /Пересдать|Қайта тапсыру|Retake/ });
        if (await retake.count()) { await retake.first().click(); await sleep(200); continue; }
        break;
      }
      const wrong = MODE === 'bad' && attempt === 0;
      const bank = await page.evaluate(async (folder) => (await import(`/labs/${folder}/admission.js`)).default.map((q) => q.correct), id);
      const A = await page.evaluate(async (lid) => { const s = await import('/app/store.js'); return s.loadLab(lid).admission; }, id);
      if (opt.v) console.error(`  ${id} admission attempt ${attempt + 1}`);
      for (let k = 0; k < A.qs.length; k++) {
        const correct = bank[A.qs[k]];
        const pos = A.orders[k].indexOf(correct);
        const idx = wrong ? (pos + 1) % A.orders[k].length : pos;
        await page.locator('fieldset.q').nth(k).locator('button.opt').nth(idx).click({ timeout: 5000 });
      }
      await textIssues('admission');
      await page.locator('main button.pri', { hasText: /Проверить|Тексеру|Check/ }).first().click();
      await sleep(400);
    }
    const s = await page.evaluate(async (lid) => (await (await import('/app/api.js')).default.getStatus(lid)), id);
    out.admission = s && s.status;
  }

  async function experiment(e) {
    await page.goto(BASE + `#/lab/${num(id)}/exp/${e.id}`);
    try { await page.waitForFunction(() => window.__vlab && window.__vlab.exp, null, { timeout: 8000 }); } catch (err) { out.issues.push(`exp ${e.id}: page did not open (${await page.evaluate(() => location.hash)})`); return; }
    let stepStart = Date.now(), lastStep = -1, iters = 0;
    while (iters++ < 6000) {
      let r;
      try { r = await page.evaluate(act, MODE); } catch (err) { r = { k: 'idle', err: err.message.slice(0, 160) }; if (!out.botErrors) out.botErrors = []; if (out.botErrors.length < 5) out.botErrors.push(`exp ${e.id}: ${r.err}`); }
      if (r.k === 'done') break;
      if (r.k === 'restart') out.restarts++;
      if (r.k === 'next') {
        out.steps++;
        if (opt.check !== '0') await textIssues(`exp ${e.id} step ${r.i + 1} (${r.type})`);
      }
      const cur = await page.evaluate(() => window.__vlab && window.__vlab.runner.stepIndex);
      if (cur !== lastStep) { lastStep = cur; stepStart = Date.now(); if (opt.v) console.error(`  ${id} exp ${e.id} step ${cur + 1}`); }
      if (opt.v === '2' && r.k !== 'idle') console.error('    ' + JSON.stringify(r).slice(0, 200));
      if (Date.now() - stepStart > STEP_TIMEOUT) {
        const info = await page.evaluate(() => { const V = window.__vlab; const s = V.runner.step; V.runner.solve(); return { type: s.type, title: (s.title && s.title.ru) || '' }; });
        if (opt.v) console.error('  FORCED ' + JSON.stringify(r).slice(0, 400));
        out.forced.push(`exp ${e.id} step ${cur + 1} ${info.type} «${info.title}» (last: ${JSON.stringify(r).slice(0, 300)})`);
        stepStart = Date.now();
      }
      await sleep(r.k === 'idle' ? 350 : r.k === 'wait' ? r.ms : 60);
    }
    const run = await page.evaluate(() => { const r = window.__vlab && window.__vlab.run(); return r && { status: r.status, remarks: r.remarks.length, hints: r.hints.length }; });
    if (!run || run.status !== 'done') out.issues.push(`exp ${e.id}: not finished (${JSON.stringify(run)})`);
    else out.remarks += run.remarks;
    await textIssues(`exp ${e.id} done`);
  }

  async function report() {
    await page.goto(BASE + `#/lab/${num(id)}/report`);
    await page.waitForSelector('article.doc');
    await sleep(300);
    // индивидуальное задание
    for (let pass = 0; pass < 12; pass++) {
      const did = await page.evaluate(async ({ folder, lid, mode }) => {
        const l = (await import(`/labs/${folder}/lab.js`)).default;
        const s = await import('/app/store.js');
        const p = s.loadLab(lid);
        const R = p.results || {};
        const qs = [...document.querySelectorAll('.assign .q')];
        const tasks = l.report.assignment || [];
        for (let i = 0; i < tasks.length; i++) {
          const t = tasks[i], a = (p.assignment || {})[t.id];
          if (a && a.answer != null && a.answer !== '') continue;
          const box = qs[i];
          if (t.kind === 'calc') { const inp = box.querySelector('input'); const v = t.answer(R); inp.value = String(+(mode === 'bad' && i === 0 ? v * 2 + 1 : v).toFixed(t.decimals ?? 2)); box.querySelector('button').click(); return 'calc'; }
          if (t.kind === 'choice') { box.querySelectorAll('button.opt')[mode === 'bad' && i <= 1 ? (t.correct + 1) % t.options.length : t.correct].click(); return 'choice'; }
          if (t.kind === 'order') { p.assignment = p.assignment || {}; p.assignment[t.id + '_o'] = t.items.map((x) => x.id); s.saveLab(lid, p); return 'order-set'; }
          if (t.kind === 'text') { const ta = box.querySelector('textarea'); if (!ta.value) { ta.value = 'Ответ на свободный вопрос: вывод по работе со ссылкой на наблюдения.'; ta.dispatchEvent(new Event('input')); } continue; }
        }
        return null;
      }, { folder: id, lid: id, mode: MODE });
      if (!did) break;
      if (did === 'order-set') {
        await page.reload(); await page.waitForSelector('article.doc');
        const i = await page.evaluate(async (folder) => (await import(`/labs/${folder}/lab.js`)).default.report.assignment.findIndex((t) => t.kind === 'order'), id);
        const box = page.locator('.assign .q').nth(i);
        await box.locator('button', { hasText: /Проверить|Тексеру|Check/ }).first().click();
      }
      await sleep(250);
    }
    await textIssues('report');
    const sub = page.locator('main .row.noprint button.pri').first();
    if (await sub.isDisabled()) out.issues.push('report: submit disabled');
    else { await sub.click(); await sleep(500); }
    const g = await page.evaluate(async (lid) => { const s = await import('/app/store.js'); const p = s.loadLab(lid); return p.report; }, id);
    out.grade = g && g.grade; out.points = g && g.points;
    await textIssues('report sent');
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/${id}-${MODE}-${W}-${LANG}${opt.theme === 'dark' ? '-dark' : ''}-report.png`, fullPage: true });
  }

  if (!lab.after) await admission();
  for (const e of lab.exps) await experiment(e);
  if (lab.after) await admission();
  await report();
  // страница работы и главная
  await page.goto(BASE + `#/lab/${num(id)}`); await sleep(300); await textIssues('lab page');
  await page.goto(BASE + '#/'); await sleep(300); await textIssues('home');
  out.status = await page.evaluate((lid) => [...document.querySelectorAll('.labcard')].map((c) => c.getAttribute('href') + ' ' + c.querySelector('.badge').textContent).find((x) => x.includes(lid.slice(4))), id);
  out.errors = [...new Set(errors)].slice(0, 20);
  if (opt.save) await ctxB.storageState({ path: `${opt.save}/${id}-${MODE}.json` }); // localStorage готовой работы — для tests/e2e/demo.mjs
  await ctxB.close();
  return out;
}

const browser = await chromium.launch();
const par = +(opt.par || 3);
const queue = [...list];
const results = [];
await Promise.all(Array.from({ length: par }, async () => {
  while (queue.length) {
    const id = queue.shift();
    const t0 = Date.now();
    try { const r = await walkLab(browser, id); r.sec = Math.round((Date.now() - t0) / 1000); results.push(r); console.log(JSON.stringify(r)); }
    catch (e) { console.log(JSON.stringify({ lab: id, crash: e.message.slice(0, 400) })); }
  }
}));
await browser.close();
