/**
 * observe — описать наблюдение. Верный ответ зависит от state (если раньше была ошибка, картина другая).
 * step: { question, options:[{ id, label, log? }], correct(state) → id, points=0.5, severity='minor' }
 * Верный ответ записывается в журнал как наблюдение (option.log или его текст).
 */
import { h } from '../dom.js';
import { tr, L } from '../i18n.js';
import { questionBlock } from './_common.js';

export default {
  type: 'observe',
  init(step, ctx) { ctx.local.m = {}; },
  render(step, ctx) {
    const right = step.correct(ctx.state, ctx);
    const ci = step.options.findIndex((o) => o.id === right);
    const wrap = h('div', { class: 'wfull' });
    wrap.append(questionBlock({
      q: step.question,
      options: step.options.map((o) => ({ label: o.label, why: o.id === right ? (step.why ? step.why(ctx.state) : '') : o.why })),
      correct: ci,
      onWrong: () => { ctx.remark({ key: 'obs-' + ctx.stepIndex, severity: step.severity || 'minor', points: step.points ?? 0.5, text: step.remarkText || L('неточное описание наблюдения', 'бақылаудың дәл емес сипаттамасы', 'inaccurate description of the observation') }); ctx.save(); },
      onRight: () => {
        const o = step.options[ci];
        ctx.log(o.log ? (typeof o.log === 'function' ? o.log(ctx.state) : o.log) : o.label, 'obs');
        if (step.onRight) step.onRight(ctx.state, ctx);
        ctx.solve();
      },
    }, ctx.local.m, ctx.rng));
    return wrap;
  },
  hints(step, ctx) {
    const right = step.options.find((o) => o.id === step.correct(ctx.state, ctx));
    return [
      step.hint1 || L('Посмотрите на стенд: цвет, осадок, пузырьки газа, запах, слои.', 'Стендке қараңыз: түсі, тұнба, газ көпіршіктері, иісі, қабаттар.', 'Look at the bench: colour, precipitate, gas bubbles, odour, layers.'),
      step.hint2 || L('Наблюдение зависит от того, как вы выполнили предыдущие шаги.', 'Бақылау алдыңғы қадамдарды қалай орындағаныңызға байланысты.', 'The observation depends on how you carried out the earlier steps.'),
      right ? { ru: 'Верно: ' + tr(right.label, 'ru'), kk: 'Дұрыс: ' + tr(right.label, 'kk'), en: 'Right: ' + tr(right.label, 'en') } : null,
    ];
  },
};
