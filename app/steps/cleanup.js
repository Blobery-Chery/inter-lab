/**
 * cleanup — утилизация отходов по контейнерам, выключение приборов, мытьё посуды и рук (разделы 10 и 14.3 правил ТБ).
 * step.items: [{ id, label, bin: 'acid'|'organic'|'halogen'|'solid'|'heavy'|'glass', wrong?: {binId: {severity, text}} }]
 * step.bins: список id контейнеров (по умолчанию все из BINS, кроме heavy); step.binLabels: {binId: L(…)} — своя подпись контейнера; step.switches: [{ id, label, log }]
 * Неверный контейнер → замечание (по умолчанию minor; раковина для кислот/органики — safety). Предмет остаётся, нужно выбрать верно.
 */
import { h } from '../dom.js';
import { tr, L } from '../i18n.js';
import { btn, group, grid } from '../ui/controls.js';

export const BINS = {
  acid: L('Водные кислотно-щелочные отходы', 'Сулы қышқыл-сілтілі қалдықтар', 'Aqueous acid/alkali waste'),
  organic: L('Органические растворители', 'Органикалық еріткіштер', 'Organic solvent waste'),
  halogen: L('Галогенсодержащие отходы', 'Құрамында галоген бар қалдықтар', 'Halogenated waste'),
  solid: L('Твёрдые отходы (фильтры, бумага)', 'Қатты қалдықтар (сүзгілер, қағаз)', 'Solid waste (filters, paper)'),
  heavy: L('Отходы солей тяжёлых металлов', 'Ауыр металдар тұздарының қалдықтары', 'Heavy-metal salt waste'),
  glass: L('Бой стекла', 'Сынған шыны', 'Broken glass'),
  sink: L('Раковина', 'Раковина', 'Sink'),
  trash: L('Бытовой мусор', 'Тұрмыстық қоқыс', 'General rubbish'),
};

const BASE_BINS = BINS;

export default {
  type: 'cleanup',
  init(step, ctx) { ctx.local.put = {}; ctx.local.sw = {}; ctx.local.sel = null; },
  render(step, ctx) {
    const { local } = ctx;
    const BINS = { ...BASE_BINS, ...(step.binLabels || {}) };
    const bins = step.bins || Object.keys(BINS).filter((b) => b !== 'heavy'); // ёмкость для тяжёлых металлов — только если работа её назвала
    const wrap = h('div', { class: 'wfull' });
    const items = h('div', { class: 'shelf' });
    for (const it of step.items) {
      const done = !!local.put[it.id];
      const b = h('button', { class: 'tile' + (local.sel === it.id ? ' on' : '') + (done ? ' used' : ''), type: 'button', 'aria-pressed': String(local.sel === it.id) }, h('span', null, (done ? '✓ ' : '') + tr(it.label)));
      if (done) b.disabled = true;
      b.onclick = () => { local.sel = local.sel === it.id ? null : it.id; ctx.save(); ctx.rerender(); };
      items.append(b);
    }
    const binBox = grid();
    for (const id of bins) {
      binBox.append(btn(BINS[id] || id, () => {
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
          ctx.feedback(w.whatif || L('Этот контейнер не подходит. Посмотрите разделы 10.1–10.4 правил ТБ.', 'Бұл ыдыс сәйкес емес. ҚТ ережелерінің 10.1–10.4 бөлімдерін қараңыз.', 'That container is not right. See safety rules 10.1–10.4.'), 'bad');
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
    const check = () => {
      const all = step.items.every((i) => local.put[i.id]) && (step.switches || []).every((s) => local.sw[s.id]);
      if (all && !ctx.solved()) ctx.solve(L('Рабочее место убрано.', 'Жұмыс орны жиналды.', 'The bench is clean.'));
    };
    wrap.append(group(L('Отходы и посуда — выберите', 'Қалдықтар мен ыдыстар — таңдаңыз', 'Waste and glassware — choose'), items), group(L('Куда', 'Қайда', 'Where'), binBox));
    if ((step.switches || []).length) wrap.append(group(L('Завершение работы (п. 14.3 правил ТБ)', 'Жұмысты аяқтау (ҚТ ережелерінің 14.3-тармағы)', 'Finishing work (safety rule 14.3)'), sw));
    const left = step.items.filter((i) => !local.put[i.id]).length + (step.switches || []).filter((s) => !local.sw[s.id]).length;
    ctx.readouts([{ label: L('Осталось', 'Қалды', 'Left'), value: String(left), st: left ? '' : 'ok' }]);
    return wrap;
  },
  hints(step, ctx) {
    const BINS = { ...BASE_BINS, ...(step.binLabels || {}) };
    const it = step.items.find((i) => !ctx.local.put[i.id]);
    return [
      L('Отходы разделяют по видам: органические растворители, галогенсодержащие, водные кислотно-щелочные, твёрдые; бой стекла — отдельно (п. 9.3, 10.1).', 'Қалдықтар түрлері бойынша бөлінеді: органикалық еріткіштер, галогенді, сулы қышқыл-сілтілі, қатты; сынған шыны — бөлек (9.3, 10.1-тармақтар).', 'Waste is sorted by type: organic solvents, halogenated, aqueous acid/alkali, solid; broken glass separately (rules 9.3, 10.1).'),
      L('В раковину нельзя: органические растворители, галогенпроизводные, концентрированные кислоты и щёлочи (п. 10.2).', 'Раковинаға болмайды: органикалық еріткіштер, галоген туындылары, концентрлі қышқылдар мен сілтілер (10.2-тармақ).', 'Never down the sink: organic solvents, halogenated compounds, concentrated acids and alkalis (rule 10.2).'),
      it ? { ru: `${tr(it.label, 'ru')} → ${tr(BINS[it.bin], 'ru')}`, kk: `${tr(it.label, 'kk')} → ${tr(BINS[it.bin], 'kk')}`, en: `${tr(it.label, 'en')} → ${tr(BINS[it.bin], 'en')}` } : L('Выполните пункты завершения работы.', 'Жұмысты аяқтау тармақтарын орындаңыз.', 'Complete the finishing items.'),
    ];
  },
};
