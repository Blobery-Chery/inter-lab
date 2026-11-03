/**
 * lab11-waste — утилизация отходов работы № 11. Как базовый cleanup (app/steps/cleanup.js), но с отдельной
 * ёмкостью для отходов тяжёлых металлов (свинец, медь): методичка, раздел 7 — «collect all lead-containing waste
 * in the designated container». В базовом списке BINS такой ёмкости нет (см. отчёт сессии L11).
 * step.items: [{ id, label, bin, wrong?: { [binId]: { severity, text, whatif } } }], step.switches: [{ id, label, log }]
 */
import { h } from '../../../app/dom.js';
import { tr, L } from '../../../app/i18n.js';
import { btn, group, grid } from '../../../app/ui/controls.js';
import { BINS as BASE } from '../../../app/steps/cleanup.js';

export const BINS = {
  heavy: L('Отходы тяжёлых металлов (Pb, Cu)', 'Ауыр металдар қалдықтары (Pb, Cu)', 'Heavy-metal waste (Pb, Cu)'),
  acid: BASE.acid,
  organic: BASE.organic,
  solid: BASE.solid,
  glass: BASE.glass,
  sink: BASE.sink,
  trash: BASE.trash,
};

export default {
  type: 'lab11-waste',
  init(step, ctx) { ctx.local.put = {}; ctx.local.sw = {}; ctx.local.sel = null; },
  render(step, ctx) {
    const { local } = ctx;
    const wrap = h('div', { class: 'wfull' });
    const items = h('div', { class: 'shelf' });
    for (const it of step.items) {
      const done = !!local.put[it.id];
      const b = h('button', { class: 'tile' + (local.sel === it.id ? ' on' : '') + (done ? ' used' : ''), type: 'button', 'aria-pressed': String(local.sel === it.id) }, h('span', null, (done ? '✓ ' : '') + tr(it.label)));
      if (done) b.disabled = true;
      b.onclick = () => { local.sel = local.sel === it.id ? null : it.id; ctx.save(); ctx.rerender(); };
      items.append(b);
    }
    const check = () => {
      const all = step.items.every((i) => local.put[i.id]) && (step.switches || []).every((s) => local.sw[s.id]);
      if (all && !ctx.solved()) ctx.solve(L('Рабочее место убрано.', 'Жұмыс орны жиналды.', 'The bench is clean.'));
    };
    const binBox = grid();
    for (const id of Object.keys(BINS)) {
      binBox.append(btn(BINS[id], () => {
        if (!local.sel) { ctx.feedback(L('Сначала выберите, что утилизировать.', 'Алдымен нені кәдеге жарату керегін таңдаңыз.', 'First choose what to dispose of.'), 'warn'); return; }
        const it = step.items.find((x) => x.id === local.sel);
        if (id === it.bin) {
          local.put[it.id] = id; local.sel = null;
          ctx.log({ ru: `${tr(it.label, 'ru')} → ${tr(BINS[id], 'ru')}`, kk: `${tr(it.label, 'kk')} → ${tr(BINS[id], 'kk')}`, en: `${tr(it.label, 'en')} → ${tr(BINS[id], 'en')}` });
          ctx.advance(30); ctx.feedback(null);
        } else {
          const w = (it.wrong && it.wrong[id]) || {};
          const sev = w.severity || (id === 'sink' || id === 'trash' ? 'safety' : 'minor');
          ctx.remark({ key: `waste-${it.id}`, severity: sev, points: w.points, whatif: w.whatif, text: w.text || { ru: `${tr(it.label, 'ru')} — не в тот контейнер (${tr(BINS[id], 'ru')})`, kk: `${tr(it.label, 'kk')} — басқа ыдысқа (${tr(BINS[id], 'kk')})`, en: `${tr(it.label, 'en')} — wrong container (${tr(BINS[id], 'en')})` } });
          ctx.feedback(w.whatif || L('Этот контейнер не подходит. Посмотрите раздел 7 методички и раздел 10 правил ТБ.', 'Бұл ыдыс сәйкес емес. Әдістеменің 7-бөлімін және ҚТ ережелерінің 10-бөлімін қараңыз.', 'That container is not right. See section 7 of the manual and section 10 of the safety rules.'), 'bad');
        }
        check(); ctx.save(); ctx.rerender();
      }, 'bin'));
    }
    const sw = grid();
    for (const s of step.switches || []) {
      const b = btn(s.label, () => { if (local.sw[s.id]) return; local.sw[s.id] = true; ctx.log(s.log || s.label); ctx.advance(30); check(); ctx.save(); ctx.rerender(); }, local.sw[s.id] ? 'on' : '');
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
      L('Все отходы, содержащие свинец, собирают в отдельную ёмкость (раздел 7 методички); соли меди — туда же, как соли тяжёлых металлов.', 'Құрамында қорғасын бар барлық қалдықтар бөлек ыдысқа жиналады (әдістеменің 7-бөлімі); мыс тұздары да — ауыр металдар тұздары ретінде сонда.', 'All lead-containing waste goes into a separate container (manual, section 7); copper salts go there too, as heavy-metal salts.'),
      L('В раковину нельзя: соли тяжёлых металлов, концентрированные кислоты и щёлочи, органические растворители (п. 10.2 правил ТБ).', 'Раковинаға болмайды: ауыр металдар тұздары, концентрлі қышқылдар мен сілтілер, органикалық еріткіштер (ҚТ ережелерінің 10.2-тармағы).', 'Never down the sink: heavy-metal salts, concentrated acids and alkalis, organic solvents (safety rule 10.2).'),
      it ? { ru: `${tr(it.label, 'ru')} → ${tr(BINS[it.bin], 'ru')}`, kk: `${tr(it.label, 'kk')} → ${tr(BINS[it.bin], 'kk')}`, en: `${tr(it.label, 'en')} → ${tr(BINS[it.bin], 'en')}` } : L('Выполните пункты завершения работы.', 'Жұмысты аяқтау тармақтарын орындаңыз.', 'Complete the finishing items.'),
    ];
  },
};
