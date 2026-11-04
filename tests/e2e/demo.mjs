/**
 * Проверка сценария показа docs/DEMO.md в браузере (не входит в `node --test`).
 * Нужны сохранённые состояния готовых работ: node tests/e2e/walk.mjs lab-00 lab-06-07 --save=DIR
 * Запуск: node tests/e2e/demo.mjs --state=DIR [--shots=DIR]
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');

const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, v] = a.slice(2).split('='); return [k, v ?? '1']; }));
const BASE = opt.base || 'http://localhost:8000/';
const SHOTS = opt.shots || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const issues = [], errors = [];
const ok = (cond, msg) => { if (!cond) issues.push(msg); console.error((cond ? '  ✓ ' : '  ✗ ') + msg); };

// склеить localStorage двух готовых работ (ключи api.js с допусками — объединить)
const ls = {};
for (const f of ['lab-00-good.json', 'lab-06-07-good.json']) {
  const st = JSON.parse(readFileSync(`${opt.state}/${f}`, 'utf8'));
  for (const o of st.origins) for (const { name, value } of o.localStorage) {
    if (ls[name] && name.startsWith('vlab_api_') && value.startsWith('{')) ls[name] = JSON.stringify({ ...JSON.parse(ls[name]), ...JSON.parse(value) });
    else if (!ls[name] || !name.startsWith('vlab_api_admissions')) ls[name] = ls[name] && name.startsWith('vlab_api_') ? ls[name] : value;
  }
}
const adm = JSON.parse(ls.vlab_api_admissions || '{}');
ok(adm['lab-00'] && adm['lab-00'].status === 'approved' && adm['lab-06-07'] && adm['lab-06-07'].status === 'approved', 'подготовка: инструктаж и допуск 6–7 одобрены');

const browser = await chromium.launch();
async function ctxFor(w) {
  const c = await browser.newContext({ viewport: { width: w, height: w < 600 ? 800 : 900 }, deviceScaleFactor: 1 });
  await c.addInitScript((data) => { if (!sessionStorage.getItem('seeded')) { for (const [k, v] of Object.entries(data)) localStorage.setItem(k, v); sessionStorage.setItem('seeded', '1'); } }, ls);
  return c;
}
const watch = (p, tag) => { p.on('pageerror', (e) => errors.push(`${tag}: ${e.message}`)); p.on('console', (m) => { if (m.type() === 'error') errors.push(`${tag}: ${m.text()}`); }); };
const bodyText = (p) => p.evaluate(() => document.querySelector('main').innerText);
const noJunk = async (p, where) => { const t = await bodyText(p); const m = t.match(/(^|[^\p{L}])(undefined|NaN|null|\[object Object\])([^\p{L}]|$)/u); ok(!m, `${where}: нет undefined/NaN/null на экране${m ? ' — «' + t.slice(Math.max(0, m.index - 30), m.index + 30) + '»' : ''}`); const over = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1); ok(!over, `${where}: нет горизонтальной прокрутки`); };

for (const W of [1280, 375]) {
  const c = await ctxFor(W);
  const p = await c.newPage(); watch(p, `${W}`);
  // 0:00 главная, смена языка
  await p.goto(BASE + '#/'); await p.waitForSelector('.labcard');
  ok((await p.evaluate(() => document.documentElement.lang)) === 'kk', `${W}: язык по умолчанию — казахский`);
  for (const l of ['Рус', 'Eng', 'Қаз', 'Рус']) { await p.locator('header .seg button', { hasText: l }).click(); await sleep(250); }
  const cards = await p.evaluate(() => [...document.querySelectorAll('.labcard')].slice(0, 2).map((c) => c.querySelector('.badge').textContent));
  ok(/Инструктаж пройден|Выполнено/.test(cards[0]) && /Выполнено/.test(cards[1]), `${W}: статусы карточек (${cards.join(' | ')})`);
  await noJunk(p, `${W} главная`);
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/demo-${W}-home.png`, fullPage: W > 600 });

  // 1:00 вводное занятие, этап 6 заново, авария
  await p.goto(BASE + '#/lab/00'); await sleep(500);
  ok(/Этапы/.test(await bodyText(p)) && /Итоговый тест/.test(await bodyText(p)), `${W}: вводное занятие — «Этапы» и «Итоговый тест»`);
  const card6 = p.locator('.cards .card').nth(5);
  await card6.locator('button', { hasText: 'Выполнить заново' }).click();
  await p.locator('.modal button', { hasText: 'Выполнить заново' }).click();
  await p.waitForFunction(() => window.__vlab && window.__vlab.exp.id === '6');
  await sleep(400);
  ok(/Этап 6/.test(await bodyText(p)), `${W}: заголовок «Этап 6»`);
  await p.locator('.controls button.opt', { hasText: 'Залить водой из-под крана' }).click();
  await p.waitForSelector('.modal .box.crit', { timeout: 4000 }).catch(() => {});
  ok(await p.locator('.modal .box.crit').count() === 1, `${W}: окно «Что произошло бы в реальной лаборатории»`);
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/demo-${W}-critical.png` });
  await p.locator('.modal .box.crit button').click(); await sleep(400);
  const st = await p.evaluate(() => ({ s: window.__vlab.run().status, i: window.__vlab.runner.stepIndex, r: window.__vlab.run().remarks.length }));
  ok(st.s === 'active' && st.i === 0 && st.r >= 1, `${W}: перезапуск с контрольной точки, замечание записано (${JSON.stringify(st)})`);
  // верный вариант
  const right = await p.evaluate(async () => { const { tr } = await import('/app/i18n.js'); return tr(window.__vlab.runner.step.options.find((o) => o.ok).label).replace(/<[^>]+>/g, ''); });
  await p.locator('.controls button.opt', { hasText: right.slice(0, 25) }).first().click(); await sleep(300);
  ok(await p.evaluate(() => window.__vlab.runner.isSolved()), `${W}: верный вариант принят`);
  await p.locator('.actionbar button.pri').click(); await sleep(300);
  // подсказка и смена языка посреди шага
  await p.locator('.actionbar button', { hasText: 'Подсказка' }).click(); await sleep(200);
  await p.locator('.actionbar button', { hasText: 'Ещё подсказка' }).click(); await sleep(200);
  const before = await p.evaluate(() => ({ i: window.__vlab.runner.stepIndex, h: window.__vlab.runner.hintLevel(), t: window.__vlab.run().t }));
  await p.locator('header .seg button', { hasText: 'Қаз' }).click(); await sleep(600);
  const after = await p.evaluate(() => ({ i: window.__vlab.runner.stepIndex, h: window.__vlab.runner.hintLevel(), t: window.__vlab.run().t }));
  ok(before.i === after.i && before.h === after.h && after.h === 2, `${W}: смена языка посреди шага не сбрасывает шаг и подсказки (${JSON.stringify(after)})`);
  ok(/кезең/i.test(await bodyText(p)), `${W}: казахский интерфейс этапа`);
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/demo-${W}-stage6-kk.png`, fullPage: W > 600 });
  await p.locator('header .seg button', { hasText: 'Рус' }).click(); await sleep(400);
  await noJunk(p, `${W} этап 6`);

  // 2:40 работа 6–7 и протокол
  await p.goto(BASE + '#/lab/06-07'); await sleep(500);
  await noJunk(p, `${W} страница работы 6–7`);
  await p.goto(BASE + '#/lab/06-07/report'); await p.waitForSelector('article.doc'); await sleep(500);
  const rep = await bodyText(p);
  ok(/Оценка|оценка/.test(rep) && /Индивидуальное задание/.test(rep), `${W}: протокол 6–7 с оценкой и заданием`);
  ok(/Отправлено|Сохранено на этом устройстве|сохранён/i.test(rep), `${W}: статус отправки протокола`);
  await noJunk(p, `${W} протокол 6–7`);
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/demo-${W}-report.png`, fullPage: true });
  await p.emulateMedia({ media: 'print' });
  if (SHOTS && W > 600) await p.pdf({ path: `${SHOTS}/demo-report.pdf`, format: 'A4' });
  await p.emulateMedia({ media: 'screen' });
  // опыт 1 на телефоне — стенд сверху, нижняя полоса
  await p.goto(BASE + '#/lab/06-07/exp/1'); await sleep(600);
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/demo-${W}-exp1.png` });
  // 6:00 контрольный режим
  await p.goto(BASE + '?mode=exam#/lab/06-07'); await sleep(600);
  ok(/Контрольный режим/i.test(await p.evaluate(() => document.body.innerText)), `${W}: ?mode=exam — плашка контрольного режима`);
  ok(/©/.test(await p.evaluate(() => document.querySelector('footer').innerText)), `${W}: подпись © автора`);
  await c.close();
}
await browser.close();
console.log(JSON.stringify({ issues, errors: [...new Set(errors)] }, null, 1));
