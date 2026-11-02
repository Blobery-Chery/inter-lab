/**
 * checklist — подготовка рабочего места: СИЗ, тяга, средства аварийной защиты.
 * step.items: [{ id, label, log, wrong?: { severity, points, text, whatif } }]
 * Все верные пункты нужно отметить; неверный (wrong) пункт даёт замечание и снимается.
 */
import { h } from '../dom.js';
import { tr, L } from '../i18n.js';
import { btn, grid, whatif } from '../ui/controls.js';
import { T } from './_common.js';

export default {
  type: 'checklist',
  init(step, ctx) { ctx.local.on = {}; },
  render(step, ctx) {
    const { local } = ctx;
    const need = step.items.filter((i) => !i.wrong);
    const wrap = h('div', { class: 'wfull' });
    const box = grid();
    const upd = () => {
      const n = need.filter((i) => local.on[i.id]).length;
      ctx.readouts([{ label: L('Готово', 'Дайын', 'Done'), value: `${n} / ${need.length}`, st: n === need.length ? 'ok' : '' }]);
      if (n === need.length) { if (!ctx.solved()) ctx.solve(step.doneText || L('Всё готово — можно приступать.', 'Бәрі дайын — бастауға болады.', 'Everything is ready — you may start.')); }
      ctx.update();
    };
    for (const it of step.items) {
      const b = btn(it.label, () => {
        if (it.wrong) {
          ctx.remark({ key: 'chk-' + it.id, ...it.wrong });
          wrap.querySelector('.whatif')?.remove();
          if (it.wrong.whatif) wrap.append(whatif(T.whatIf, it.wrong.whatif));
          return;
        }
        local.on[it.id] = !local.on[it.id];
        b.classList.toggle('on', !!local.on[it.id]);
        b.setAttribute('aria-pressed', String(!!local.on[it.id]));
        if (local.on[it.id] && it.log) ctx.log(it.log);
        ctx.advance(step.secondsPerItem ?? 20);
        upd();
      }, local.on[it.id] ? 'on' : '', { 'aria-pressed': String(!!local.on[it.id]) });
      box.append(b);
    }
    wrap.append(box);
    setTimeout(upd);
    return wrap;
  },
  hints(step, ctx) {
    const left = step.items.filter((i) => !i.wrong && !ctx.local.on[i.id]);
    return [
      L('Перед работой: средства защиты, тяга вытяжного шкафа и средства аварийной защиты (п. 2.4, 3 правил ТБ).', 'Жұмыс алдында: қорғаныс құралдары, тартпа шкафтың тартымы және апаттық қорғаныс құралдары (ҚТ ережелерінің 2.4, 3-тармақтары).', 'Before work: protective equipment, fume-hood airflow and emergency equipment (safety rules 2.4, 3).'),
      L(`Осталось отметить: ${left.length}.`, `Белгілеу қалды: ${left.length}.`, `Still to tick: ${left.length}.`),
      { ru: 'Отметьте: ' + left.map((i) => tr(i.label, 'ru')).join('; ') + '.', kk: 'Белгілеңіз: ' + left.map((i) => tr(i.label, 'kk')).join('; ') + '.', en: 'Tick: ' + left.map((i) => tr(i.label, 'en')).join('; ') + '.' },
    ];
  },
};
