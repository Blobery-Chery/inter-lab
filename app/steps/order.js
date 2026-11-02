/**
 * order — расставить операции по порядку. step.items: [{id, label}] — в верном порядке (перемешиваются).
 * «Проверить»: первая неверная позиция подсвечивается, замечание (minor, один раз за шаг); исправить и проверить снова.
 */
import { h } from '../dom.js';
import { tr, L } from '../i18n.js';
import { btn, row } from '../ui/controls.js';

export default {
  type: 'order',
  init(step, ctx) {
    let o = ctx.rng.shuffle(step.items.map((x) => x.id));
    if (o.every((id, i) => id === step.items[i].id)) o = o.slice(1).concat(o[0]);
    ctx.local.order = o; ctx.local.bad = null;
  },
  render(step, ctx) {
    const { local } = ctx;
    const list = h('ol', { class: 'order' });
    local.order.forEach((id, i) => {
      const it = step.items.find((x) => x.id === id);
      const mv = (d) => () => {
        if (ctx.solved()) return;
        const j = i + d; if (j < 0 || j >= local.order.length) return;
        [local.order[i], local.order[j]] = [local.order[j], local.order[i]];
        local.bad = null; ctx.save(); ctx.rerender();
      };
      const up = btn('↑', mv(-1), 'sm', { 'aria-label': tr(L('Выше', 'Жоғары', 'Move up')) });
      const dn = btn('↓', mv(1), 'sm', { 'aria-label': tr(L('Ниже', 'Төмен', 'Move down')) });
      if (i === 0 || ctx.solved()) up.disabled = true;
      if (i === local.order.length - 1 || ctx.solved()) dn.disabled = true;
      list.append(h('li', { class: local.bad === i ? 'bad' : ctx.solved() ? 'ok' : '' }, h('span', { class: 'n mono' }, String(i + 1)), h('span', { class: 'tx', html: tr(it.label) }), up, dn));
    });
    const chk = btn(L('Проверить порядок', 'Ретті тексеру', 'Check the order'), () => {
      const bad = local.order.findIndex((id, i) => id !== step.items[i].id);
      if (bad < 0) {
        ctx.log(step.log || L('Порядок операций составлен верно', 'Операциялар реті дұрыс құрылды', 'The order of operations is correct'));
        ctx.solve(step.doneText || L('Порядок верный.', 'Рет дұрыс.', 'The order is correct.'));
      } else {
        local.bad = bad;
        ctx.remark({ key: 'order-' + ctx.stepIndex, severity: step.severity || 'minor', points: step.points, text: step.remarkText || L('неверный порядок операций', 'операциялардың реті қате', 'wrong order of operations') });
        ctx.feedback(L(`Позиция ${bad + 1} стоит неверно. Исправьте и проверьте снова.`, `${bad + 1}-орын қате тұр. Түзетіп, қайта тексеріңіз.`, `Position ${bad + 1} is wrong. Fix it and check again.`), 'bad');
      }
      ctx.rerender();
    }, 'pri');
    if (ctx.solved()) chk.disabled = true;
    return h('div', { class: 'wfull' }, list, row(chk));
  },
  hints(step, ctx) {
    const bad = (ctx.local.order || []).findIndex((id, i) => id !== step.items[i].id);
    return [
      step.hint1 || L('Начните с подготовки, закончите выделением и проверкой продукта.', 'Дайындықтан бастап, өнімді бөліп алу және тексерумен аяқтаңыз.', 'Start with the preparation, finish with isolating and checking the product.'),
      bad >= 0 ? { ru: `На место ${bad + 1}: ${tr(step.items[bad].label, 'ru')}`, kk: `${bad + 1}-орынға: ${tr(step.items[bad].label, 'kk')}`, en: `Position ${bad + 1}: ${tr(step.items[bad].label, 'en')}` } : L('Порядок уже верный — нажмите «Проверить».', 'Рет дұрыс — «Тексеру» батырмасын басыңыз.', 'The order is already right — press “Check”.'),
      { ru: step.items.map((x, i) => `${i + 1}. ${tr(x.label, 'ru')}`).join(' '), kk: step.items.map((x, i) => `${i + 1}. ${tr(x.label, 'kk')}`).join(' '), en: step.items.map((x, i) => `${i + 1}. ${tr(x.label, 'en')}`).join(' ') },
    ];
  },
};
