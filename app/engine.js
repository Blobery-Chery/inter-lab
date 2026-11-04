/**
 * Исполнитель опыта (без DOM): этапы, шаги, состояние, замечания, подсказки, журнал,
 * лабораторное время, контрольные точки. Интерфейс (app/ui/experiment.js) подключается через hooks.
 *
 * run — сохраняемая попытка опыта:
 * {
 *   v, lab, exp, attempt, seed, rng:{state}, step, t, state, local:{[stepIndex]:{…}},
 *   journal:[{t, kind, text, exp, step}], remarks:[…], hints:[…], checkpoints:{[i]:snapshot},
 *   status:'active'|'failed'|'done', failure, startedAt, finishedAt
 * }
 */
import { createRng, hashSeed } from './rng.js';
import { pointsFor, HINT_POINTS } from './grading.js';
import { L, tr, t, tt } from './i18n.js';
import { deepClone } from './dom.js';

export const RUN_VERSION = 1;
export const DAY0 = 9 * 3600; // лабораторное время начинается «День 1 · 09:00»

/** Время в формате «День 1 · 09:12». */
export function clockText(sec, short = false) {
  const tt = Math.max(0, Math.round(sec)) + DAY0;
  const d = Math.floor(tt / 86400) + 1;
  const m = Math.floor(tt / 60) % 1440;
  const hm = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  if (short) return (d > 1 ? t('dayShort') + d + ' ' : '') + hm;
  return `${t('day')} ${d} · ${hm}`;
}
export function dayOf(sec) { return Math.floor((Math.max(0, sec) + DAY0) / 86400) + 1; }

/** Подпись шага для замечаний и протокола: «Опыт 1, шаг 3». */
export function stepLabel(expId, i, word) {
  if (word === 'stage') return L(`Этап ${expId}, шаг ${i + 1}`, `${expId}-кезең, ${i + 1}-қадам`, `Stage ${expId}, step ${i + 1}`);
  return L(`Опыт ${expId}, шаг ${i + 1}`, `${expId}-тәжірибе, ${i + 1}-қадам`, `Experiment ${expId}, step ${i + 1}`);
}

/** Новая попытка опыта. */
export function newRun(lab, exp, progress, deviceId = '') {
  const attempt = (progress.attempts[exp.id] || 0) + 1;
  progress.attempts[exp.id] = attempt;
  const seed = hashSeed(`${deviceId}/${lab.id}/${exp.id}/${attempt}`);
  const rngHolder = { state: seed };
  const rng = createRng(rngHolder);
  const init = typeof exp.initialState === 'function'
    ? exp.initialState({ prev: progress.results || {}, rng })
    : deepClone(exp.initialState || {});
  const run = {
    v: RUN_VERSION, lab: lab.id, exp: exp.id, attempt, seed, rng: rngHolder,
    step: 0, t: progress.clock || 0, state: init || {}, local: {},
    journal: [], remarks: [], hints: [], checkpoints: {}, status: 'active', failure: null,
    startedAt: Date.now(), finishedAt: null,
  };
  progress.runs[exp.id] = run;
  snapshot(run, 0);
  return run;
}

function snapshot(run, i) {
  run.checkpoints[i] = { state: deepClone(run.state), rng: run.rng.state };
}

/**
 * Runner связывает данные работы, попытку и интерфейс.
 * hooks: { onChange(), onClock(), onLog(e), onRemark(r), onFeedback(), onFail(r), onEvent(ev, resolve), onSolved(), onFinish(), save() }
 */
export class Runner {
  constructor({ lab, exp, progress, run, hooks = {}, hintsEnabled = true, mode = 'train', types = {} }) {
    this.lab = lab; this.exp = exp; this.progress = progress; this.run = run;
    this.hooks = hooks; this.hintsEnabled = hintsEnabled; this.mode = mode; this.types = types;
    // контрольный режим «прилипает» к попытке: протокол помечается, если опыт хоть раз шёл без подсказок (?mode=exam или преподаватель выключил)
    if ((mode === 'exam' || !hintsEnabled) && run.status !== 'done') run.mode = 'exam'; else if (!run.mode) run.mode = 'train';
    this.rng = createRng(run.rng);
  }

  get stepIndex() { return this.run.step; }
  get step() { return this.exp.steps[this.run.step]; }
  get steps() { return this.exp.steps; }
  get state() { return this.run.state; }
  get type() { return this.types[this.step.type]; }

  local(i = this.run.step) {
    if (!this.run.local[i]) this.run.local[i] = {};
    return this.run.local[i];
  }

  save() { this.hooks.save && this.hooks.save(); }

  /* ---------- время ---------- */
  advance(sec) {
    if (!(sec > 0)) return;
    this.run.t += sec;
    this.progress.clock = Math.max(this.progress.clock || 0, this.run.t);
    this.hooks.onClock && this.hooks.onClock();
  }
  /** Перевести часы на начало следующего дня в 09:00 (например, сушка «до следующего занятия»). */
  nextDay() {
    const abs = this.run.t + DAY0;
    const next9 = (Math.floor(abs / 86400) + 1) * 86400 + DAY0; // 09:00 следующего дня
    this.advance(next9 - DAY0 - this.run.t);
  }

  /* ---------- журнал ---------- */
  log(text, kind = 'act') {
    const e = { t: this.run.t, kind, text, exp: this.exp.id, step: this.run.step };
    this.run.journal.push(e);
    this.hooks.onLog && this.hooks.onLog(e);
    return e;
  }

  /* ---------- замечания ---------- */
  /**
   * remark({key, severity, points?, text, effect?(state), whatif?, critical?:{title?, text}})
   * Повтор того же key в этой попытке не засчитывается. Возвращает true, если замечание новое.
   */
  remark(r) {
    if (!r || !r.key) throw new Error('remark: нужен key');
    if (this.run.remarks.some((x) => x.key === r.key)) return false;
    const severity = r.severity || 'major';
    const rec = {
      key: r.key, severity, points: pointsFor(severity, r.points), text: r.text,
      step: stepLabel(this.exp.id, this.run.step, this.lab.expWord), stepIndex: this.run.step, exp: this.exp.id, t: this.run.t,
    };
    if (r.whatif) rec.whatif = r.whatif;
    if (r.critical) rec.critical = r.critical;
    this.run.remarks.push(rec);
    if (typeof r.effect === 'function') r.effect(this.run.state);
    this.log({ ru: 'Замечание: ' + tr(r.text, 'ru'), kk: 'Ескерту: ' + tr(r.text, 'kk'), en: 'Remark: ' + tr(r.text, 'en') }, 'warn');
    this.hooks.onRemark && this.hooks.onRemark(rec);
    if (severity === 'critical') this.fail(rec);
    this.save();
    return true;
  }

  /* ---------- контрольные точки и аварии ---------- */
  checkpointFor(i = this.run.step) {
    const cps = (this.exp.checkpoints || [0]).filter((c) => c <= i).sort((a, b) => b - a);
    return cps.length ? cps[0] : 0;
  }

  fail(rec) {
    this.run.status = 'failed';
    this.run.failure = { key: rec.key, step: this.run.step, checkpoint: this.checkpointFor(), t: this.run.t };
    this.log(L('Аварийная ситуация — опыт сорван', 'Апаттық жағдай — тәжірибе үзілді', 'Emergency — the experiment has failed'), 'warn');
    this.save();
    this.hooks.onFail && this.hooks.onFail(rec);
  }

  /** Перезапуск с контрольной точки после аварии. Журнал, замечания и время сохраняются. */
  restart() {
    const cp = this.run.failure ? this.run.failure.checkpoint : this.checkpointFor();
    const snap = this.run.checkpoints[cp] || this.run.checkpoints[0];
    this.run.state = deepClone(snap.state);
    for (const k of Object.keys(this.run.local)) if (+k >= cp) delete this.run.local[k];
    // записи сорванной попытки с шагов ≥ контрольной точки остаются в журнале, но не идут в наблюдения протокола
    for (const e of this.run.journal) if (e.step >= cp) e.void = 1;
    this.run.step = cp;
    this.run.status = 'active';
    this.run.failure = null;
    this.advance(600); // уборка и подготовка заново — 10 мин лабораторного времени
    const title = this.exp.steps[cp].title;
    this.log(tt('restarted', { s: title }));
    this.save();
    this.hooks.onChange && this.hooks.onChange();
  }

  /* ---------- шаг решён ---------- */
  solve(feedback, kind = 'good') {
    const loc = this.local();
    loc._solved = true;
    if (feedback) loc._fb = { text: feedback, kind };
    this.save();
    this.hooks.onSolved && this.hooks.onSolved();
  }
  unsolve() { this.local()._solved = false; this.hooks.onSolved && this.hooks.onSolved(); }
  isSolved(i = this.run.step) { return !!(this.run.local[i] && this.run.local[i]._solved); }

  feedback(text, kind = 'info') {
    this.local()._fb = text ? { text, kind } : null;
    this.hooks.onFeedback && this.hooks.onFeedback();
  }

  /* ---------- подсказки ---------- */
  hintLevel(i = this.run.step) { return (this.run.local[i] && this.run.local[i]._hint) || 0; }

  /** Взять следующую подсказку. Возвращает уровень (1–3) или 0, если подсказки выключены/исчерпаны. */
  takeHint() {
    if (!this.hintsEnabled) return 0;
    const loc = this.local();
    const lvl = (loc._hint || 0) + 1;
    if (lvl > 3) return 0;
    loc._hint = lvl;
    this.run.hints.push({ step: stepLabel(this.exp.id, this.run.step, this.lab.expWord), stepIndex: this.run.step, exp: this.exp.id, level: lvl, t: this.run.t });
    this.log({ ru: `Подсказка ${lvl}`, kk: `${lvl}-кеңес`, en: `Hint ${lvl}` }, 'hint');
    this.save();
    return lvl;
  }

  /** Решение, показанное движком (например, в calc после 3 попыток): записывается как подсказка уровня 3. */
  forceSolutionHint() {
    const loc = this.local();
    if ((loc._hint || 0) >= 3) return;
    loc._hint = 3;
    this.run.hints.push({ step: stepLabel(this.exp.id, this.run.step, this.lab.expWord), stepIndex: this.run.step, exp: this.exp.id, level: 3, t: this.run.t, forced: true });
    this.log(L('Показано решение (засчитано как подсказка 3)', 'Шешім көрсетілді (3-кеңес ретінде есептелді)', 'Solution shown (counted as hint 3)'), 'hint');
    this.save();
  }

  hintTexts(ctx) {
    const s = this.step, type = this.type;
    const own = s.hints || [];
    const def = (type && type.hints) ? type.hints(s, ctx) || [] : [];
    return [0, 1, 2].map((i) => own[i] || def[i] || GENERIC_HINTS[i]);
  }

  /* ---------- переход ---------- */
  next() {
    if (!this.isSolved()) return false;
    const s = this.step, type = this.type;
    const ctx = this.hooks.ctx ? this.hooks.ctx() : null;
    if (type && type.leave) type.leave(s, ctx);
    if (s.onLeave) s.onLeave(this.run.state, ctx);
    if (this.run.step >= this.exp.steps.length - 1) return this.finish();
    this.run.step++;
    if ((this.exp.checkpoints || []).includes(this.run.step)) snapshot(this.run, this.run.step);
    this.save();
    this.hooks.onChange && this.hooks.onChange();
    return true;
  }

  finish() {
    this.run.status = 'done';
    this.run.finishedAt = Date.now();
    const res = this.exp.results ? this.exp.results(this.run.state, this.run) : {};
    this.progress.results = this.progress.results || {};
    this.progress.results[this.exp.id] = res;
    this.log(L('Опыт завершён', 'Тәжірибе аяқталды', 'Experiment complete'));
    this.save();
    this.hooks.onFinish && this.hooks.onFinish();
    return true;
  }
}
export const GENERIC_HINTS = [
  L('Перечитайте инструкцию шага и посмотрите на показания приборов на стенде.', 'Қадам нұсқаулығын қайта оқып, стендтегі құралдардың көрсеткіштеріне қараңыз.', 'Re-read the step instructions and look at the instrument readings on the bench.'),
  L('Сравните, что требует методичка (количество, температура, порядок), с тем, что сейчас на стенде.', 'Әдістеме талап ететін нәрсені (мөлшер, температура, рет) стендтегі жағдаймен салыстырыңыз.', 'Compare what the manual requires (amount, temperature, order) with what is on the bench now.'),
  L('Выполните действия строго в порядке, указанном в инструкции шага.', 'Әрекеттерді қадам нұсқаулығында көрсетілген ретпен орындаңыз.', 'Carry out the actions strictly in the order given in the step instructions.'),
];

/** Стоимость следующей подсказки. */
export function nextHintCost(level) { return HINT_POINTS[level + 1] || 0; }
