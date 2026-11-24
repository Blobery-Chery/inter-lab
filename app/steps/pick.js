/**
 * pick — выбрать посуду, приборы или реактивы с полки (с лишними предметами).
 * step.shelf: ['id' | {id, label, icon?}] — id из app/equipment.js или свои предметы с label;
 * step.take: ['id'] — что нужно взять (step.need — подсказка в нижней полосе, как у всех шагов); step.points (0.5) — за лишнее/недостающее при проверке.
 * Проверка: недостающее или лишнее → одно замечание (minor), нужно исправить и проверить снова.
 */
import { h } from '../dom.js';
import { tr, L } from '../i18n.js';
import { btn, row } from '../ui/controls.js';
import { EQUIPMENT, equipmentIcon, HAZARD } from '../equipment.js';
import { benchScene } from '../scene/bench.js';

/** Склянка с реактивом — линией, для карточек реактивов. */
const BOTTLE = '<svg viewBox="0 0 40 58" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><rect x="13" y="3" width="14" height="8" rx="2"/><path d="M14 11 L14 17 Q5 20 5 28 L5 52 Q5 55 8 55 L32 55 Q35 55 35 52 L35 28 Q35 20 26 17 L26 11"/><path d="M6.2 36 L33.8 36 L33.8 52 Q33.8 53.8 32 53.8 L8 53.8 Q6.2 53.8 6.2 52 Z" fill="var(--soft)" stroke="none"/></svg>';

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
    // Слева (на телефоне — сверху) вместо рисунка — полка и реактивы работы; в панели шага — рабочий стол.
    const bench = h('ul', { class: 'benchlist', 'aria-live': 'polite' });
    const drawBench = () => {
      const ids = local.order.filter((id) => local.sel[id]);
      bench.replaceChildren(...(ids.length ? ids.map((id) => h('li', null, tr(byId[id].label))) : [h('li', { class: 'empty' }, ctx.t('benchEmpty'))]));
    };
    drawBench();
    const shelf = h('div', { class: 'shelf', role: 'group', 'aria-label': ctx.t('shelfTitle') });
    for (const id of local.order) {
      const it = byId[id];
      const b = h('button', { class: 'tile' + (local.sel[id] ? ' on' : ''), type: 'button', 'aria-pressed': String(!!local.sel[id]) },
        h('span', { class: 'ico', html: it.icon || '' }), h('span', null, tr(it.label)),
        h('span', { class: 'ts', 'data-on': ctx.t('takeOn'), 'data-off': ctx.t('takeOff'), 'aria-hidden': 'true' }));
      b.onclick = () => {
        if (ctx.solved()) return;
        local.sel[id] = !local.sel[id];
        b.classList.toggle('on', local.sel[id]);
        b.setAttribute('aria-pressed', String(local.sel[id]));
        drawBench();
        ctx.save();
      };
      shelf.append(b);
    }
    // На телефоне реактивы свёрнуты, чтобы рабочий стол был сразу под полкой.
    const wide = !globalThis.matchMedia || globalThis.matchMedia('(min-width: 900px)').matches;
    const reag = (ctx.lab.reagents || []).length ? h('details', { class: 'reagbox', style: 'margin-top:18px', open: wide || null },
      h('summary', null, h('h2', null, ctx.t('labReagents'))),
      h('div', { class: 'reagents' }, ...ctx.lab.reagents.map((r) => h('div', { class: 'rg' },
        h('span', { html: BOTTLE }),
        h('b', null, tr(r.name)),
        r.formula ? h('span', { class: 'fm' }, r.formula) : null,
        r.conc ? h('span', { class: 'ds' }, tr(r.conc)) : null,
        (r.hazard || []).length ? h('span', { class: 'hz' }, ...r.hazard.map((z) => h('span', { class: 'pill' + (z === 'irritant' ? '' : ' hz') }, tr(HAZARD[z] || z)))) : null)))) : null;
    ctx.stand = h('div', null, h('section', { class: 'standgrid' }, h('h2', null, ctx.t('shelfTitle')), shelf), reag);
    const checkB = btn(step.checkLabel || L('Взять на рабочее место', 'Жұмыс орнына алу', 'Take to the bench'), () => {
      if (ctx.solved()) return;
      local.checks++;
      const missing = step.take.filter((id) => !local.sel[id]);
      const extra = Object.keys(local.sel).filter((id) => local.sel[id] && !step.take.includes(id));
      ctx.advance(60);
      if (!missing.length && !extra.length) {
        ctx.log({ ru: 'На рабочее место взято: ' + step.take.map((id) => tr(byId[id].label, 'ru')).join(', '), kk: 'Жұмыс орнына алынды: ' + step.take.map((id) => tr(byId[id].label, 'kk')).join(', '), en: 'Taken to the bench: ' + step.take.map((id) => tr(byId[id].label, 'en')).join(', ') });
        ctx.state.bench = step.shelf.filter((x) => step.take.includes(typeof x === 'string' ? x : x.id));
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
    return h('div', { class: 'wfull' }, h('div', { class: 'benchhead' }, ctx.t('benchTitle')), bench, row(checkB));
  },
  /** Стенд: выбранные предметы появляются на рабочем столе по мере выбора. */
  scene(step, ctx) {
    const sel = ctx.local.sel || {};
    const order = ctx.local.order || step.shelf.map((x) => (typeof x === 'string' ? x : x.id));
    const byId = Object.fromEntries(step.shelf.map((x) => [typeof x === 'string' ? x : x.id, x]));
    const items = order.filter((id) => sel[id]).map((id) => byId[id]);
    return benchScene(items, {
      caption: ctx.solved() ? L('Рабочее место готово', 'Жұмыс орны дайын', 'The bench is ready') : L('Рабочее место', 'Жұмыс орны', 'Workbench'),
      empty: L('Выберите предметы на полке — они появятся на столе', 'Сөреден заттарды таңдаңыз — олар үстелде пайда болады', 'Pick items from the shelf — they will appear on the bench'),
    });
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
