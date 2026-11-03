/**
 * Страница опыта: этапы сверху, стенд (SVG) слева / сверху, панель шага справа, журнал и памятка ТБ.
 * Смена языка перерисовывает экран из сохранённого состояния — шаг не перезапускается.
 */
import { h, morph, esc } from '../dom.js';
import { tr, t, L, getLang, num, pts } from '../i18n.js';
import * as store from '../store.js';
import { Runner, newRun, clockText, nextHintCost } from '../engine.js';
import { typesFor } from '../steps/index.js';
import { btn } from './controls.js';
import { criticalDialog, eventDialog, confirmDialog, toast, isOpen } from './modal.js';
import { HINT_POINTS } from '../grading.js';

export async function experimentPage(root, env, lab, exp) {
  const { api, mode } = env;
  const hintsEnabled = !env.hintsOff(lab);
  const progress = store.loadLab(lab.id);
  let run = progress.runs[exp.id];
  if (!run || run.v == null) run = newRun(lab, exp, progress, api.getStudent().deviceId);
  const save = () => store.saveLab(lab.id, progress);
  save();
  const types = await typesFor(lab);
  let timers = [], cleanup = null, mounted = false;
  const clearTimers = () => { for (const x of timers) { clearInterval(x); clearTimeout(x); } timers = []; };

  /* ---------- каркас ---------- */
  const clock = h('div', { class: 'clock', 'aria-live': 'off', title: t('labTime') });
  const stages = h('nav', { class: 'stages', 'aria-label': t('experiments') });
  const sceneBox = h('div', { class: 'scenebox', 'aria-label': t('stand') });
  const meta = h('div', { class: 'stepmeta' });
  const title = h('h2');
  const instr = h('div', { class: 'instr' });
  const controls = h('div', { class: 'controls' });
  const fb = h('div', { class: 'fb', role: 'status', 'aria-live': 'polite', hidden: true });
  const readouts = h('div', { class: 'readouts', 'aria-live': 'off' });
  const hintBox = h('div', { class: 'hintbox', hidden: true, 'aria-live': 'polite' });
  const need = h('span', { class: 'need' });
  const hintB = btn(t('hint'), () => takeHint(), 'ghost');
  const nextB = btn(t('next') + ' →', () => goNext(), 'pri');
  const bar = h('div', { class: 'actionbar' }, need, hintsEnabled ? hintB : null, nextB);
  const panel = h('section', { class: 'card panel', 'aria-labelledby': 'step-title' }, meta, title, instr, controls, fb, readouts, hintBox, bar);
  title.id = 'step-title';
  const logList = h('ol', { class: 'log' });
  const jCount = h('span', { class: 'jcount' });
  const journal = h('details', { class: 'card journal', open: true }, h('summary', null, t('journal'), ' ', jCount), logList);
  const tb = h('details', { class: 'card tb' }, h('summary', null, t('safetyMemo')), h('ul', null, ...(lab.safety || []).map((s) => h('li', { html: tr(s) }))));
  const restartB = btn(t('restartExp'), async () => {
    if (await confirmDialog(t('redoConfirm'), t('restartExp'))) { destroy(); run = newRun(lab, exp, progress, api.getStudent().deviceId); if (progress.results) delete progress.results[exp.id]; progress.report = null; save(); env.rerender(); }
  }, 'sm danger');
  const head = h('div', { class: 'top' },
    h('div', null, h('div', { class: 'eyebrow' }, t('labNo', { n: tr(lab.display || lab.number) }) + ' · ' + tr(lab.title)), h('h1', null, t('expN', { n: exp.id }) + '. ' + tr(exp.title))),
    h('div', { class: 'topr' }, clock, restartB));
  root.append(head, stages);
  if (!hintsEnabled) root.append(h('div', { class: 'banner warn' }, mode === 'exam' ? t('examMode') : t('hintsOff')));
  root.append(h('div', { class: 'exp' }, h('div', { class: 'standcol' }, sceneBox), h('div', { class: 'side' }, panel, journal, tb)));
  document.body.classList.add('has-bar');

  /* ---------- раннер ---------- */
  const runner = new Runner({
    lab, exp, progress, run, types, hintsEnabled, mode,
    hooks: {
      save,
      ctx: () => ctx,
      onClock: () => { clock.textContent = clockText(run.t); },
      onLog: () => drawLog(),
      onRemark: (r) => { toast(`<b>${esc(t('remarkW'))}</b> (−${pts(r.points)}): ${esc(tr(r.text))}`); },
      onFeedback: () => drawFb(),
      onSolved: () => drawBar(),
      onChange: () => { if (mounted) mount(); },
      onFail: (rec) => showFail(rec),
      onFinish: () => { destroyStep(); drawDone(); drawStages(); },
    },
  });

  let ctx = null;
  function makeCtx() {
    const step = runner.step, local = runner.local();
    return {
      runner, lab, exp, step, stepIndex: runner.stepIndex, state: run.state, local, lang: getLang(), rng: runner.rng, prev: progress.results || {},
      t, tr, hintsEnabled, mode,
      advance: (s) => runner.advance(s), nextDay: () => runner.nextDay(), now: () => run.t,
      log: (x, k) => runner.log(x, k),
      remark: (r) => runner.remark(r),
      solve: (f, k) => { runner.solve(f, k); drawFb(); },
      unsolve: () => runner.unsolve(),
      solved: () => runner.isSolved(),
      feedback: (x, k) => runner.feedback(x, k),
      readouts: (items) => { local._ro = items; drawReadouts(); },
      update: () => { drawScene(); drawReadouts(); },
      rerender: () => mount(),
      every: (ms, fn) => { const id = setInterval(() => { try { fn(); } catch (e) { console.error(e); } }, ms); timers.push(id); return id; },
      timeout: (ms, fn) => { const id = setTimeout(fn, ms); timers.push(id); return id; },
      event: (ev) => eventDialog(ev),
      forceSolutionHint: () => runner.forceSolutionHint(),
      save,
    };
  }

  /* ---------- отрисовка ---------- */
  function drawStages() {
    stages.innerHTML = '';
    const ri = lab.experiments.findIndex((e) => e.id === exp.id);
    lab.experiments.forEach((e, i) => {
      const done = progress.results && progress.results[e.id] && (!progress.runs[e.id] || progress.runs[e.id].status === 'done');
      const cls = e.id === exp.id ? 'now' : done ? 'done' : '';
      const a = h('a', { class: 'stg ' + cls, href: `#/lab/${lab.number}/exp/${e.id}`, 'aria-current': e.id === exp.id ? 'step' : null }, (done && e.id !== exp.id ? '✓ ' : '') + t('expN', { n: e.id }));
      if (i > ri && !done && !(progress.results || {})[lab.experiments[i - 1]?.id]) { a.removeAttribute('href'); a.setAttribute('aria-disabled', 'true'); }
      stages.append(a);
    });
    stages.append(h('a', { class: 'stg', href: `#/lab/${lab.number}/report` }, t('report')));
    stages.prepend(h('a', { class: 'stg', href: `#/lab/${lab.number}` }, '← ' + t('toLab')));
  }
  function drawScene() {
    if (!ctx) return;
    const step = runner.step, type = runner.type;
    let svg = '';
    try { svg = step.scene ? step.scene(run.state, ctx.local, ctx) : type && type.scene ? type.scene(step, ctx) : ''; } catch (e) { console.error(e); }
    if (!svg) { sceneBox.innerHTML = ''; return; }
    morph(sceneBox, svg);
  }
  function drawReadouts() {
    const items = (ctx && ctx.local._ro) || [];
    readouts.innerHTML = '';
    for (const r of items) readouts.append(h('div', { class: 'ro ' + (r.st || '') }, h('span', null, tr(r.label)), h('b', null, tr(r.value))));
  }
  function drawFb() {
    const f = ctx && ctx.local._fb;
    if (!f || !f.text) { fb.hidden = true; return; }
    fb.hidden = false; fb.className = 'fb ' + (f.kind || 'info'); fb.innerHTML = tr(f.text);
  }
  function drawHints() {
    const lvl = runner.hintLevel();
    if (!lvl || !hintsEnabled) { hintBox.hidden = true; } else {
      const texts = runner.hintTexts(ctx);
      hintBox.hidden = false; hintBox.innerHTML = '';
      hintBox.append(h('div', { class: 'eyebrow' }, t('hintLevel', { l: lvl })), h('ol', null, ...texts.slice(0, lvl).map((x) => h('li', { html: tr(x) }))));
    }
    if (hintsEnabled) {
      hintB.disabled = lvl >= 3;
      const cost = nextHintCost(lvl);
      hintB.textContent = (lvl ? t('hintMore') : t('hint')) + (lvl < 3 ? (cost ? ` (−${pts(cost)})` : '') : '');
      hintB.title = lvl >= 3 ? t('hintNoMore') : cost ? t('hintCost', { p: pts(cost) }) : t('hintFree');
    }
  }
  function drawBar() {
    const solved = runner.isSolved(), last = runner.stepIndex >= exp.steps.length - 1;
    nextB.disabled = !solved || run.status !== 'active';
    nextB.textContent = last ? t('finishExp') + ' ✓' : t('next') + ' →';
    need.textContent = solved ? t('stepDone') + ' ✓' : tr(runner.step.need || '');
  }
  function drawLog() {
    logList.innerHTML = '';
    const items = run.journal;
    jCount.textContent = items.length ? '· ' + items.length : '';
    if (!items.length) { logList.append(h('li', { class: 'muted' }, t('journalEmpty'))); return; }
    for (let i = items.length - 1; i >= 0; i--) {
      const e = items[i];
      logList.append(h('li', { class: 'lg ' + e.kind }, h('time', null, clockText(e.t, true)), h('span', null, e.kind === 'obs' ? h('span', { class: 'k' }, t('obs')) : null, h('span', { html: tr(e.text) }))));
    }
  }
  function destroyStep() { clearTimers(); if (cleanup) try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }

  function mount() {
    destroyStep();
    mounted = true;
    if (run.status === 'done') { drawDone(); return; }
    const step = runner.step, type = runner.type;
    ctx = makeCtx();
    const n = exp.steps.length, k = runner.stepIndex + 1;
    meta.textContent = t('expN', { n: exp.id }) + ' · ' + t('step', { k, n }) + (step.stage ? ' · ' + tr(step.stage) : '');
    title.textContent = tr(step.title);
    instr.innerHTML = tr(step.instr || '');
    controls.innerHTML = '';
    if (!type) { controls.append(h('p', { class: 'fb bad' }, 'Unknown step type: ' + step.type)); return; }
    if (!ctx.local._init) { if (type.init) type.init(step, ctx); ctx.local._init = 1; save(); }
    try {
      const node = type.render(step, ctx);
      if (typeof node === 'string') controls.innerHTML = node; else if (node) controls.append(node);
      if (type.bind) cleanup = type.bind(controls, step, ctx) || null;
    } catch (e) { console.error(e); controls.append(h('p', { class: 'fb bad' }, String(e))); }
    drawScene(); drawReadouts(); drawFb(); drawHints(); drawBar(); drawLog();
    clock.textContent = clockText(run.t);
    if (run.status === 'failed') showFail(run.remarks.find((r) => r.key === (run.failure || {}).key) || {});
  }

  function takeHint() {
    const lvl = runner.takeHint();
    if (lvl) { drawHints(); drawLog(); }
  }
  function goNext() {
    if (nextB.disabled) return;
    if (runner.next()) { const top = panel.getBoundingClientRect().top; if (top < 0) panel.scrollIntoView({ block: 'start' }); }
  }
  async function showFail(rec) {
    if (isOpen()) return;
    const cp = runner.checkpointFor((run.failure || {}).step ?? run.step);
    await criticalDialog({
      title: t('realLab'),
      text: (rec.critical && rec.critical.text) || rec.whatif || rec.text || '',
      remark: rec.text,
      restartLabel: t('restartFrom', { s: tr(exp.steps[cp].title) }),
    });
    runner.restart();
  }

  function drawDone() {
    destroyStep();
    meta.textContent = t('expN', { n: exp.id });
    title.textContent = t('expComplete') + ' ✓';
    const res = (progress.results || {})[exp.id] || {};
    instr.innerHTML = '';
    controls.innerHTML = '';
    const sum = exp.summary ? exp.summary(res, run) : [];
    if (sum.length) controls.append(h('div', { class: 'readouts' }, ...sum.map((r) => h('div', { class: 'ro ' + (r.st || '') }, h('span', null, tr(r.label)), h('b', null, tr(r.value))))));
    const i = lab.experiments.findIndex((e) => e.id === exp.id);
    const nx = lab.experiments[i + 1];
    controls.append(h('div', { class: 'row', style: 'margin-top:12px' },
      nx ? h('a', { class: 'b pri', href: `#/lab/${lab.number}/exp/${nx.id}` }, t('expN', { n: nx.id }) + ' →') : h('a', { class: 'b pri', href: `#/lab/${lab.number}/report` }, t('report') + ' →'),
      h('a', { class: 'b', href: `#/lab/${lab.number}` }, t('toLab')),
      nx ? h('a', { class: 'b', href: `#/lab/${lab.number}/report` }, t('report')) : null));
    fb.hidden = true; hintBox.hidden = true; readouts.innerHTML = '';
    sceneBox.innerHTML = '';
    nextB.disabled = true; need.textContent = ''; bar.hidden = true;
    document.body.classList.remove('has-bar');
    drawLog();
    clock.textContent = clockText(run.t);
  }

  drawStages();
  mount();

  function destroy() { destroyStep(); mounted = false; save(); document.body.classList.remove('has-bar'); }
  return { destroy };
}
