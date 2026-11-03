/**
 * lab15-waste — уборка с отдельной ёмкостью для отходов тяжёлых металлов (Cu, Ag): методичка, раздел 7.
 * Базовый cleanup не позволяет добавить свой контейнер, поэтому здесь — его вариант с BINS + 'heavy'.
 * step: { items: [{ id, label, bin, wrong?: { [binId]: { severity, text, whatif } } }], bins: [...], switches: [{ id, label, log }] }
 */
import { h } from '../../../app/dom.js';
import { tr, L } from '../../../app/i18n.js';
import { btn, group, grid } from '../../../app/ui/controls.js';
import { BINS as BASE } from '../../../app/steps/cleanup.js';

export const BINS = {
  heavy: L('Отходы тяжёлых металлов (Cu, Ag)', 'Ауыр металдар қалдықтары (Cu, Ag)', 'Heavy-metal waste (Cu, Ag)'),
  acid: BASE.acid, organic: BASE.organic, solid: BASE.solid, glass: BASE.glass, sink: BASE.sink, trash: BASE.trash,
};

export default {
  type: 'lab15-waste',
  init(step, ctx) { ctx.local.put = {}; ctx.local.sw = {}; ctx.local.sel = null; },
  render(step, ctx) {
    const { local } = ctx;
    const bins = step.bins || Object.keys(BINS);
    const wrap = h('div', { class: 'wfull' });
    const items = h('div', { class: 'shelf' });
    for (const it of step.items) {
      const done = !!local.put[it.id];
      const b = h('button', { class: 'tile' + (local.sel === it.id ? ' on' : '') + (done ? ' used' : ''), type: 'button', 'aria-pressed': String(local.sel === it.id) }, h('span', null, (done ? '✓ ' : '') + tr(it.label)));
      if (done) b.disabled = true;
      b.onclick = () => { local.sel = local.sel === it.id ? null : it.id; ctx.rerender(); };
      items.append(b);
    }
    const check = () => {
      const all = step.items.every((i) => local.put[i.id]) && (step.switches || []).every((s) => local.sw[s.id]);
      if (all && !ctx.solved()) ctx.solve(L('Рабочее место убрано.', 'Жұмыс орны жиналды.', 'The bench is clean.'));
    };
    const binBox = grid();
    for (const id of bins) {
      binBox.append(btn(BINS[id], () => {
        if (!local.sel) { ctx.feedback(L('Сначала выберите, что утилизировать.', 'Алдымен нені кәдеге жарату керегін таңдаңыз.', 'First choose what to dispose of.'), 'warn'); return; }
        const it = step.items.find((x) => x.id === local.sel);
        if (id === it.bin) {
          local.put[it.id] = id; local.sel = null;
          ctx.log({ ru: `${tr(it.label, 'ru')} → ${tr(BINS[id], 'ru')}`, kk: `${tr(it.label, 'kk')} → ${tr(BINS[id], 'kk')}`, en: `${tr(it.label, 'en')} → ${tr(BINS[id], 'en')}` });
          ctx.advance(30);
          ctx.feedback(null);
        } else {
          const w = (it.wrong && it.wrong[id]) || {};
          const sev = w.severity || (id === 'sink' || id === 'trash' ? 'safety' : 'minor');
          ctx.remark({ key: `waste-${it.id}`, severity: sev, points: w.points, whatif: w.whatif, text: w.text || { ru: `${tr(it.label, 'ru')} — не в тот контейнер (${tr(BINS[id], 'ru')})`, kk: `${tr(it.label, 'kk')} — басқа ыдысқа (${tr(BINS[id], 'kk')})`, en: `${tr(it.label, 'en')} — wrong container (${tr(BINS[id], 'en')})` } });
          ctx.feedback(w.whatif || L('Этот контейнер не подходит. Посмотрите раздел 7 методички и п. 10 правил ТБ.', 'Бұл ыдыс сәйкес емес. Әдістеменің 7-бөлімін және ҚТ ережелерінің 10-тармағын қараңыз.', 'That container is not right. See section 7 of the manual and safety rule 10.'), 'bad');
        }
        check(); ctx.rerender();
      }, 'bin'));
    }
    const sw = grid();
    for (const s of step.switches || []) {
      const b = btn(s.label, () => { if (local.sw[s.id]) return; local.sw[s.id] = true; ctx.log(s.log || s.label); ctx.advance(20); check(); ctx.rerender(); }, local.sw[s.id] ? 'on' : '');
      if (local.sw[s.id]) b.disabled = true;
      sw.append(b);
    }
    wrap.append(group(L('Отходы и посуда — выберите', 'Қалдықтар мен ыдыстар — таңдаңыз', 'Waste and glassware — choose'), items), group(L('Куда', 'Қайда', 'Where'), binBox));
    if ((step.switches || []).length) wrap.append(group(L('Завершение работы (п. 14.3 правил ТБ)', 'Жұмысты аяқтау (ҚТ ережелерінің 14.3-тармағы)', 'Finishing work (safety rule 14.3)'), sw));
    const left = step.items.filter((i) => !local.put[i.id]).length + (step.switches || []).filter((s) => !local.sw[s.id]).length;
    ctx.readouts([{ label: L('Осталось', 'Қалды', 'Left'), value: String(left), st: left ? '' : 'ok' }]);
    return wrap;
  },
  hints(step, ctx) {
    const it = step.items.find((i) => !ctx.local.put[i.id]);
    return [
      L('Растворы с медью и серебром — отдельно, в ёмкость для тяжёлых металлов (раздел 7 методички).', 'Мыс пен күмісі бар ерітінділер — бөлек, ауыр металдар ыдысына (әдістеменің 7-бөлімі).', 'Copper and silver solutions go separately into the heavy-metal container (manual, section 7).'),
      L('Концентрированные кислоты в раковину нельзя (п. 10.2); кислые водные отходы — в ёмкость для кислотно-щелочных отходов.', 'Концентрлі қышқылдарды раковинаға төгуге болмайды (10.2-тармақ); қышқыл сулы қалдықтар — қышқыл-сілтілі қалдықтар ыдысына.', 'Concentrated acids never go down the sink (rule 10.2); acidic aqueous waste goes into the acid/alkali waste container.'),
      it ? { ru: `${tr(it.label, 'ru')} → ${tr(BINS[it.bin], 'ru')}`, kk: `${tr(it.label, 'kk')} → ${tr(BINS[it.bin], 'kk')}`, en: `${tr(it.label, 'en')} → ${tr(BINS[it.bin], 'en')}` } : L('Выполните пункты завершения работы.', 'Жұмысты аяқтау тармақтарын орындаңыз.', 'Complete the finishing items.'),
    ];
  },
};
