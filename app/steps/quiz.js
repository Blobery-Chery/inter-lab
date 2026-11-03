/**
 * quiz — вопросы внутри опыта. step.questions: [{ q, options:[…], correct, why, points=0.5 }]
 * Каждый неверный ответ — замечание (minor, points). Нужно найти верный ответ на каждый вопрос.
 */
import { h } from '../dom.js';
import { tr, L } from '../i18n.js';
import { questionBlock } from './_common.js';

export default {
  type: 'quiz',
  init(step, ctx) { ctx.local.q = step.questions.map(() => ({})); },
  render(step, ctx) {
    const { local } = ctx;
    const wrap = h('div', { class: 'wfull' });
    const check = () => {
      const n = local.q.filter((m) => m.right != null).length;
      ctx.readouts([{ label: L('Отвечено верно', 'Дұрыс жауап', 'Answered'), value: `${n} / ${step.questions.length}`, st: n === step.questions.length ? 'ok' : '' }]);
      if (n === step.questions.length && !ctx.solved()) { ctx.log(step.log || L('Ответы на вопросы преподавателя даны', 'Оқытушы сұрақтарына жауап берілді', 'The instructor’s questions have been answered')); ctx.solve(); }
    };
    step.questions.forEach((q, qi) => {
      wrap.append(questionBlock({
        ...q,
        onWrong: () => { ctx.remark({ key: `quiz-${ctx.stepIndex}-${qi}`, severity: 'minor', points: q.points ?? 0.5, text: { ru: 'ошибка в ответе: «' + tr(q.q, 'ru') + '»', kk: 'жауаптағы қате: «' + tr(q.q, 'kk') + '»', en: 'wrong answer: “' + tr(q.q, 'en') + '”' } }); ctx.save(); },
        onRight: () => { ctx.save(); check(); },
      }, local.q[qi], ctx.rng));
    });
    setTimeout(check);
    return wrap;
  },
  hints(step, ctx) {
    const qi = (ctx.local.q || []).findIndex((m) => m.right == null);
    const q = step.questions[qi < 0 ? 0 : qi];
    const wrongI = q.options.findIndex((_, i) => i !== q.correct);
    return [
      q.hint || L('Ответ есть в разделе «Теория» методички и в правилах ТБ.', 'Жауап әдістеменің «Теория» бөлімінде және ҚТ ережелерінде бар.', 'The answer is in the theory section of the manual and in the safety rules.'),
      { ru: 'Неверно: ' + tr(q.options[wrongI], 'ru'), kk: 'Қате: ' + tr(q.options[wrongI], 'kk'), en: 'Wrong: ' + tr(q.options[wrongI], 'en') },
      { ru: 'Верно: ' + tr(q.options[q.correct], 'ru') + '. ' + tr(q.why || '', 'ru'), kk: 'Дұрыс: ' + tr(q.options[q.correct], 'kk') + '. ' + tr(q.why || '', 'kk'), en: 'Right: ' + tr(q.options[q.correct], 'en') + '. ' + tr(q.why || '', 'en') },
    ];
  },
};
