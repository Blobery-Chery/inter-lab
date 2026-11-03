/** Общие помощники типов шагов. */
import { h } from '../dom.js';
import { tr, L } from '../i18n.js';
import { btn, option, whatif } from '../ui/controls.js';

export const T = {
  whatIf: L('Что будет, если так сделать?', 'Былай істесе не болады?', 'What happens if you do that?'),
  correct: L('Верно.', 'Дұрыс.', 'Correct.'),
  wrong: L('Неверно.', 'Қате.', 'Incorrect.'),
  thinkAgain: L('Неверно. Подумайте ещё.', 'Қате. Тағы ойланыңыз.', 'Incorrect. Think again.'),
  first: L('Сначала: ', 'Алдымен: ', 'First: '),
};

/**
 * Вопрос с вариантами, состояние в mem = { wrong:[i…], right:i|null, order:[…] }.
 * q: { q, options:[label…] | [{label, ok?, why?}], correct (индекс в исходном массиве), why, hint, onWrong(i), onRight(i) }
 */
export function questionBlock(q, mem, rng) {
  const opts = q.options.map((o) => (typeof o === 'object' && !o.ru && !o.kk ? o : { label: o }));
  if (!mem.order) mem.order = q.shuffle === false ? opts.map((_, i) => i) : rng.shuffle(opts.map((_, i) => i));
  mem.wrong = mem.wrong || [];
  const box = h('div', { class: 'q' }, h('p', { html: tr(q.q) }));
  const res = h('div', { class: 'fb', role: 'status', 'aria-live': 'polite', hidden: true });
  const show = () => {
    if (mem.right != null) {
      res.hidden = false; res.className = 'fb good';
      res.innerHTML = '✓ ' + tr(T.correct) + ' ' + tr(opts[mem.right].why || q.why || '');
    } else if (mem.wrong.length) {
      const last = opts[mem.wrong[mem.wrong.length - 1]];
      res.hidden = false; res.className = 'fb bad';
      res.innerHTML = '✗ ' + tr(last.why ? { ru: tr(T.wrong, 'ru') + ' ' + tr(last.why, 'ru'), kk: tr(T.wrong, 'kk') + ' ' + tr(last.why, 'kk'), en: tr(T.wrong, 'en') + ' ' + tr(last.why, 'en') } : (q.hint || T.thinkAgain));
    }
  };
  for (const i of mem.order) {
    const state = mem.right === i ? 'right' : mem.wrong.includes(i) ? 'wrong' : '';
    const b = option(opts[i].label, () => {
      if (mem.right != null || mem.wrong.includes(i)) return;
      if (i === q.correct) { mem.right = i; b.classList.add('right'); q.onRight && q.onRight(i); }
      else { mem.wrong.push(i); b.classList.add('wrong'); q.onWrong && q.onWrong(i); }
      show();
    }, state);
    if (state) b.setAttribute('aria-disabled', 'true');
    box.append(b);
  }
  box.append(res);
  show();
  return box;
}

/**
 * Действие-кнопка с проверкой порядка. a: { id, label, requires:[id], once=true, advance, log, obs, do(ctx), remark (если всегда ошибка) }
 * done — объект выполненных действий (в local). Возвращает true, если выполнено.
 */
export function runAction(a, ctx, done, all) {
  if (a.once !== false && done[a.id]) return false;
  const missing = (a.requires || []).filter((r) => !done[r]);
  if (missing.length) {
    const lbl = missing.map((id) => tr((all.find((x) => x.id === id) || {}).label || id)).join(', ');
    if (a.orderRemark) ctx.remark(a.orderRemark);
    else { ctx.feedback({ ru: tr(T.first, 'ru') + lbl, kk: tr(T.first, 'kk') + lbl, en: tr(T.first, 'en') + lbl }, 'warn'); return false; }
  }
  if (a.when && !a.when(ctx.state, ctx.local, ctx)) { if (a.whenText) ctx.feedback(a.whenText, 'warn'); return false; }
  done[a.id] = (done[a.id] || 0) + 1;
  if (a.advance) ctx.advance(a.advance);
  if (a.log) ctx.log(typeof a.log === 'function' ? a.log(ctx.state, ctx.local) : a.log);
  if (a.do) a.do(ctx.state, ctx.local, ctx);
  if (a.obs) ctx.log(typeof a.obs === 'function' ? a.obs(ctx.state, ctx.local) : a.obs, 'obs');
  if (a.remark) ctx.remark(typeof a.remark === 'function' ? a.remark(ctx.state, ctx.local) : a.remark);
  if (a.feedback) ctx.feedback(typeof a.feedback === 'function' ? a.feedback(ctx.state, ctx.local) : a.feedback, a.feedbackKind || 'info');
  return true;
}

export function actionButton(a, ctx, done, all, after) {
  const b = btn(a.label, () => { if (runAction(a, ctx, done, all)) { after && after(); } }, (a.cls || '') + (done[a.id] && a.once !== false ? ' on' : ''));
  if (done[a.id] && a.once !== false) b.disabled = true;
  return b;
}

export { whatif, btn };
