/**
 * lab00-dress — одеться для работы в лаборатории (раздел 3 и п. 2.3 правил ТБ). Фигура студента на стенде
 * меняется по выбору. Неверный выбор — замечание safety с «Что будет, если…» (один раз на группу), отметка «!»
 * на фигуре; шаг решён, когда во всех группах выбрано верное (и халат застёгнут).
 * step.groups: [{ id, label, options: [{ id, label, ok?, log?, text?, whatif? }] }]
 * Состояние — ctx.local.w (что надето), ctx.local.bad (группы с ошибкой).
 */
import { h } from '../../../app/dom.js';
import { L, tr } from '../../../app/i18n.js';
import { btn, group, row, whatif } from '../../../app/ui/controls.js';
import { scene } from '../../../app/scene/svg.js';
import { avatar } from '../scene.js';

export default {
  type: 'lab00-dress',
  init(step, ctx) { ctx.local.w = { ...(step.start || {}) }; ctx.local.bad = {}; ctx.local.last = null; },
  render(step, ctx) {
    const { local } = ctx;
    const wrap = h('div', { class: 'wfull' });
    for (const g of step.groups) {
      const r = row();
      for (const o of g.options) {
        const on = local.w[g.id] === o.id;
        const b = btn(o.label, () => this.choose(step, ctx, g, o), on ? (o.ok ? 'on' : 'on danger') : '', { 'aria-pressed': String(on) });
        if (ctx.solved()) b.disabled = true;
        r.append(b);
      }
      wrap.append(group(g.label, r));
    }
    if (local.last) {
      const g = step.groups.find((x) => x.id === local.last.g), o = g && g.options.find((x) => x.id === local.last.o);
      if (o && !o.ok && o.whatif) wrap.append(whatif(L('Что будет, если так прийти в лабораторию?', 'Зертханаға осылай келсе не болады?', 'What happens if you come to the lab like this?'), o.whatif));
    }
    const okN = step.groups.filter((g) => this.isOk(g, local)).length;
    ctx.readouts([{ label: L('Готово', 'Дайын', 'Ready'), value: `${okN} / ${step.groups.length}`, st: okN === step.groups.length ? 'ok' : '' }]);
    return wrap;
  },
  isOk(g, local) { const o = g.options.find((x) => x.id === local.w[g.id]); return !!(o && o.ok); },
  choose(step, ctx, g, o) {
    if (ctx.solved()) return;
    const { local } = ctx;
    local.w[g.id] = o.id;
    local.last = { g: g.id, o: o.id };
    ctx.advance(15);
    if (o.ok) {
      local.bad[g.id] = false;
      if (o.log) ctx.log(o.log);
      ctx.feedback(o.text || null, 'good');
    } else {
      local.bad[g.id] = true;
      ctx.remark({ key: `dress-${g.id}`, severity: o.severity || 'safety', points: o.points, text: o.remark || o.label, whatif: o.whatif });
      ctx.feedback(o.text || L('Так в лабораторию нельзя. Выберите другой вариант.', 'Зертханаға бұлай болмайды. Басқа нұсқаны таңдаңыз.', 'You cannot work in the lab like this. Choose another option.'), 'bad');
    }
    if (step.groups.every((x) => this.isOk(x, local)) && !ctx.solved()) ctx.solve(step.doneText || L('Можно входить в лабораторию.', 'Зертханаға кіруге болады.', 'You may enter the lab.'));
    ctx.save(); ctx.rerender();
  },
  scene(step, ctx) {
    const w = {}, bad = {};
    for (const g of step.groups) {
      const o = g.options.find((x) => x.id === ctx.local.w[g.id]);
      if (o && o.wear) Object.assign(w, o.wear);
      if (ctx.local.bad[g.id]) bad[g.mark || g.id] = true;
    }
    return scene(avatar(w, bad), L('Студент перед входом в лабораторию', 'Зертханаға кірер алдындағы студент', 'Student before entering the lab'));
  },
  hints(step, ctx) {
    const left = step.groups.filter((g) => !this.isOk(g, ctx.local));
    const g = left[0];
    const right = g && g.options.find((o) => o.ok);
    return [
      L('Раздел 3 правил ТБ: халат, очки, перчатки, обувь; п. 2.3 — волосы, одежда и украшения.', 'ҚТ ережелерінің 3-бөлімі: халат, көзілдірік, қолғап, аяқ киім; 2.3-тармақ — шаш, киім және әшекейлер.', 'Section 3 of the safety rules: coat, goggles, gloves, footwear; rule 2.3 — hair, clothing and jewellery.'),
      g ? { ru: 'Ещё не так: ' + tr(g.label, 'ru'), kk: 'Әлі дұрыс емес: ' + tr(g.label, 'kk'), en: 'Not right yet: ' + tr(g.label, 'en') } : L('Всё надето верно.', 'Бәрі дұрыс киілді.', 'Everything is right.'),
      right ? { ru: tr(g.label, 'ru') + ' — ' + tr(right.label, 'ru'), kk: tr(g.label, 'kk') + ' — ' + tr(right.label, 'kk'), en: tr(g.label, 'en') + ' — ' + tr(right.label, 'en') } : null,
    ];
  },
};
