/**
 * decide — выбрать действие из вариантов. У каждого варианта — последствия.
 * step: {
 *   question: {…}
 *   inputs: [{ id, label, min, max, step, unit, value }]   ползунки перед выбором (значения → local.inp[id], и в state[saveAs][id])
 *   options: [{
 *     id, label, ok: true|false,
 *     severity, points, remark: {…}      замечание за неверный вариант (key сформируется сам)
 *     whatif: {…}                        «Что будет, если так сделать?»
 *     critical: { title?, text }         экран «что произошло бы в реальной лаборатории» (severity 'critical')
 *     effect(state, inputs, ctx)         последствие в state (в т. ч. отложенное)
 *     log, obs                           записи в журнал (строка/тройка или функция (state, inputs))
 *     retry: true                        после неверного выбора можно выбрать снова (вариант блокируется)
 *     advance                            сек лабораторного времени
 *   }]
 *   check(state, inputs, ctx)            доп. проверка значений ползунков после выбора (замечания)
 * }
 * Неверный вариант без retry применяется (опыт идёт дальше с последствиями).
 */
import { h } from '../dom.js';
import { tr, L } from '../i18n.js';
import { range, group, option, whatif } from '../ui/controls.js';
import { T } from './_common.js';

export default {
  type: 'decide',
  init(step, ctx) {
    ctx.local.inp = Object.fromEntries((step.inputs || []).map((i) => [i.id, i.value ?? i.min]));
    ctx.local.tried = [];
    ctx.local.order = step.shuffle === false ? step.options.map((_, i) => i) : ctx.rng.shuffle(step.options.map((_, i) => i));
  },
  render(step, ctx) {
    const { local } = ctx;
    const wrap = h('div', { class: 'wfull' });
    for (const inp of step.inputs || []) {
      const r = range({ ...inp, value: local.inp[inp.id], oninput: (v) => { local.inp[inp.id] = v; ctx.update(); ctx.save(); } });
      if (local.chosen) r.querySelector('input').disabled = true;
      wrap.append(group(inp.label, r));
    }
    if (step.question) wrap.append(h('p', { class: 'qq', html: tr(step.question) }));
    const box = h('div', { class: 'q' });
    for (const i of local.order) {
      const o = step.options[i];
      const st = local.chosen === o.id ? (o.ok ? 'right' : 'wrong') : local.tried.includes(o.id) ? 'wrong' : '';
      const b = option(o.label, () => this.choose(step, ctx, o), st);
      if (local.chosen || local.tried.includes(o.id)) b.disabled = true;
      box.append(b);
    }
    wrap.append(box);
    const last = step.options.find((o) => o.id === (local.chosen || local.tried[local.tried.length - 1]));
    if (last && !last.ok && last.whatif) wrap.append(whatif({ ru: tr(T.whatIf, 'ru') + ' — ' + tr(last.label, 'ru'), kk: tr(T.whatIf, 'kk') + ' — ' + tr(last.label, 'kk'), en: tr(T.whatIf, 'en') + ' — ' + tr(last.label, 'en') }, last.whatif));
    return wrap;
  },
  choose(step, ctx, o) {
    const { local, state } = ctx;
    if (local.chosen || local.tried.includes(o.id)) return;
    const inputs = local.inp;
    if (step.saveAs) state[step.saveAs] = { ...(state[step.saveAs] || {}), ...inputs, choice: o.id };
    if (!o.ok) {
      local.tried.push(o.id);
      const sev = o.critical ? 'critical' : o.severity;
      if (sev || o.remark) {
        ctx.remark({ key: `dec-${ctx.stepIndex}-${o.id}`, severity: sev || 'major', points: o.points, text: o.remark || o.label, whatif: o.whatif, critical: o.critical });
      }
      if (o.critical) { ctx.rerender(); return; }
      if (o.retry) {
        ctx.feedback(o.feedback || L('Это неверное действие. Выберите другое.', 'Бұл қате әрекет. Басқасын таңдаңыз.', 'That is the wrong action. Choose another one.'), 'bad');
        ctx.rerender();
        return;
      }
    }
    local.chosen = o.id;
    if (o.advance) ctx.advance(o.advance);
    if (o.log) ctx.log(typeof o.log === 'function' ? o.log(state, inputs) : o.log);
    if (o.effect) o.effect(state, inputs, ctx);
    if (o.obs) ctx.log(typeof o.obs === 'function' ? o.obs(state, inputs) : o.obs, 'obs');
    if (step.check) step.check(state, inputs, ctx, o);
    const fb = typeof o.feedback === 'function' ? o.feedback(state, inputs) : o.feedback;
    ctx.solve(fb || (o.ok ? L('Верное решение.', 'Дұрыс шешім.', 'The right decision.') : L('Решение принято — последствия скажутся на результате.', 'Шешім қабылданды — салдары нәтижеге әсер етеді.', 'Decision made — the consequences will show in the result.')), o.ok ? 'good' : 'warn');
    ctx.rerender();
  },
  hints(step) {
    const right = step.options.find((o) => o.ok);
    const wrong = step.options.find((o) => !o.ok);
    return [
      step.hint1 || L('Подумайте, что произойдёт с веществом и с вами при каждом варианте. Опирайтесь на правила ТБ и методичку.', 'Әр нұсқада затқа және сізге не болатынын ойлаңыз. ҚТ ережелері мен әдістемеге сүйеніңіз.', 'Think about what each option does to the substance and to you. Rely on the safety rules and the manual.'),
      wrong ? { ru: 'Точно неверно: ' + tr(wrong.label, 'ru'), kk: 'Анық қате: ' + tr(wrong.label, 'kk'), en: 'Definitely wrong: ' + tr(wrong.label, 'en') } : step.hint1,
      right ? { ru: 'Верно: ' + tr(right.label, 'ru') + (right.why ? '. ' + tr(right.why, 'ru') : ''), kk: 'Дұрыс: ' + tr(right.label, 'kk') + (right.why ? '. ' + tr(right.why, 'kk') : ''), en: 'Right: ' + tr(right.label, 'en') + (right.why ? '. ' + tr(right.why, 'en') : '') } : null,
    ];
  },
};
