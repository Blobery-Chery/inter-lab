/**
 * pick — выбрать посуду, приборы или реактивы с полки (с лишними предметами).
 * step.shelf: ['id' | {id, label, icon?}] — id из app/equipment.js или свои предметы с label;
 * step.take: ['id'] — что нужно взять (step.need — подсказка в нижней полосе, как у всех шагов); step.points (0.5) — за лишнее/недостающее при проверке.
 * Проверка: недостающее или лишнее → одно замечание (minor), нужно исправить и проверить снова.
 */
import { h } from '../dom.js';
import { tr, L } from '../i18n.js';
import { btn, row } from '../ui/controls.js';
import { EQUIPMENT, equipmentIcon } from '../equipment.js';

function item(x) {
  if (typeof x === 'string') {
    const e = EQUIPMENT[x];
    return { id: x, label: e ? e.name : x, icon: e ? equipmentIcon(x) : '' };
  }
  return { icon: x.icon || (EQUIPMENT[x.id] ? equipmentIcon(x.id) : ''), label: x.label || (EQUIPMENT[x.id] || {}).name, ...x };
}

export default {
  type: 'pick',
  init(step, ctx) {
    ctx.local.sel = {};
    ctx.local.order = ctx.rng.shuffle(step.shelf.map((x) => (typeof x === 'string' ? x : x.id)));
    ctx.local.checks = 0;
  },
  render(step, ctx) {
    const { local } = ctx;
    const byId = Object.fromEntries(step.shelf.map((x) => [typeof x === 'string' ? x : x.id, item(x)]));
    const wrap = h('div', { class: 'wfull' });
    const shelf = h('div', { class: 'shelf', role: 'group', 'aria-label': tr(L('Полка', 'Сөре', 'Shelf')) });
    const count = () => ctx.readouts([{ label: L('Выбрано', 'Таңдалды', 'Selected'), value: String(Object.values(local.sel).filter(Boolean).length) }]);
    for (const id of local.order) {
      const it = byId[id];
      const b = h('button', { class: 'tile' + (local.sel[id] ? ' on' : ''), type: 'button', 'aria-pressed': String(!!local.sel[id]) },
        h('span', { class: 'ico', html: it.icon || '' }), h('span', null, tr(it.label)));
      b.onclick = () => {
        if (ctx.solved()) return;
        local.sel[id] = !local.sel[id];
        b.classList.toggle('on', local.sel[id]);
        b.setAttribute('aria-pressed', String(local.sel[id]));
        count();
        ctx.save();
      };
      shelf.append(b);
    }
    const checkB = btn(step.checkLabel || L('Взять на рабочее место', 'Жұмыс орнына алу', 'Take to the bench'), () => {
      if (ctx.solved()) return;
      local.checks++;
      const missing = step.take.filter((id) => !local.sel[id]);
      const extra = Object.keys(local.sel).filter((id) => local.sel[id] && !step.take.includes(id));
      ctx.advance(60);
      if (!missing.length && !extra.length) {
        ctx.log({ ru: 'На рабочее место взято: ' + step.take.map((id) => tr(byId[id].label, 'ru')).join(', '), kk: 'Жұмыс орнына алынды: ' + step.take.map((id) => tr(byId[id].label, 'kk')).join(', '), en: 'Taken to the bench: ' + step.take.map((id) => tr(byId[id].label, 'en')).join(', ') });
        ctx.solve(L('Всё нужное на месте, лишнего нет.', 'Қажеттің бәрі орнында, артығы жоқ.', 'Everything needed is here and nothing extra.'));
        ctx.rerender();
        return;
      }
      ctx.remark({
        key: 'pick-' + (step.id || ctx.stepIndex), severity: 'minor', points: step.points ?? 0.5,
        text: L('рабочее место подготовлено с ошибками (лишние или недостающие предметы)', 'жұмыс орны қателікпен дайындалды (артық немесе жетіспейтін заттар)', 'bench prepared with mistakes (extra or missing items)'),
      });
      const parts = [];
      if (missing.length) parts.push(L(`Не хватает предметов: ${missing.length}.`, `Жетіспейтін заттар: ${missing.length}.`, `Items missing: ${missing.length}.`));
      if (extra.length) parts.push(L(`Лишних предметов: ${extra.length} — они не нужны в этом опыте.`, `Артық заттар: ${extra.length} — олар бұл тәжірибеде қажет емес.`, `Extra items: ${extra.length} — not needed in this experiment.`));
      ctx.feedback({ ru: parts.map((p) => tr(p, 'ru')).join(' '), kk: parts.map((p) => tr(p, 'kk')).join(' '), en: parts.map((p) => tr(p, 'en')).join(' ') }, 'warn');
    }, 'pri');
    if (ctx.solved()) checkB.disabled = true;
    wrap.append(shelf, row(checkB));
    setTimeout(count);
    return wrap;
  },
  hints(step, ctx) {
    const sel = ctx.local.sel || {};
    const byId = Object.fromEntries(step.shelf.map((x) => [typeof x === 'string' ? x : x.id, item(x)]));
    const missing = step.take.filter((id) => !sel[id]);
    const extra = Object.keys(sel).filter((id) => sel[id] && !step.take.includes(id));
    const one = extra[0] ? L(`Уберите «${tr(byId[extra[0]].label, 'ru')}» — в этом опыте не нужно.`, `«${tr(byId[extra[0]].label, 'kk')}» алып тастаңыз — бұл тәжірибеде қажет емес.`, `Put back “${tr(byId[extra[0]].label, 'en')}” — not needed here.`)
      : missing[0] ? L(`Не забудьте: ${tr(byId[missing[0]].label, 'ru')}.`, `Ұмытпаңыз: ${tr(byId[missing[0]].label, 'kk')}.`, `Don’t forget: ${tr(byId[missing[0]].label, 'en')}.`)
        : L('Набор верный — нажмите «Взять на рабочее место».', 'Жиынтық дұрыс — «Жұмыс орнына алу» батырмасын басыңыз.', 'The set is right — press “Take to the bench”.');
    return [
      step.hint1 || L('Пройдите по ходу работы в методичке: какая посуда и какие приборы упоминаются в каждом пункте?', 'Әдістемедегі жұмыс барысын қараңыз: әр тармақта қандай ыдыс пен құралдар аталады?', 'Go through the procedure in the manual: which glassware and instruments does each step mention?'),
      one,
      { ru: 'Нужно: ' + step.take.map((id) => tr(byId[id].label, 'ru')).join(', ') + '.', kk: 'Қажет: ' + step.take.map((id) => tr(byId[id].label, 'kk')).join(', ') + '.', en: 'Needed: ' + step.take.map((id) => tr(byId[id].label, 'en')).join(', ') + '.' },
    ];
  },
};
