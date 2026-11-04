/**
 * test — качественная проба в пробирках: добавить реактив, нагреть, наблюдать.
 * Наблюдение считается из state: если раньше была ошибка (грязный продукт, не та среда), картина другая.
 * step: {
 *   tubes: [{ id, label, init:{ v, color, solid, ppt, pptColor, gas, pH } }]
 *   reagents: [{ id, label, group, target:'sel'|'all', apply(tube, state, ctx, tubeId, local) }]   apply меняет tube и пишет в журнал
 *   indicator: true                   кнопка «индикаторная бумага» (по tube.pH выбранной пробирки)
 *   reset: true                       «Вылить и повторить пробу» (tube → init)
 *   done(tubes, state, local) → bool  проба выполнена
 *   observe: { question, options:[{ id, label, log }], correct(state, tubes) → id, points }   вопрос после пробы (необязательно)
 *   onDone(state, tubes, ctx)
 * }
 * tube: { v (мл), color, solid (0…1), ppt (0…1), pptColor, gas, mirror, layer, pH, added:[ids] }
 */
import { h, deepClone } from '../dom.js';
import { tr, L } from '../i18n.js';
import { btn, row, group, seg } from '../ui/controls.js';
import { scene, tube as tubeSVG, tubeRack } from '../scene/svg.js';
import { stripHTML } from '../instruments/indicator.js';
import { questionBlock } from './_common.js';

export default {
  type: 'test',
  init(step, ctx) {
    ctx.local.tubes = Object.fromEntries(step.tubes.map((t) => [t.id, { v: 0, added: [], ...deepClone(t.init || {}) }]));
    ctx.local.sel = step.tubes[0].id; ctx.local.q = {};
  },
  render(step, ctx) {
    const { local, state } = ctx;
    const wrap = h('div', { class: 'wfull' });
    if (step.tubes.length > 1) wrap.append(group(L('Пробирка', 'Пробирка', 'Test tube'), seg(step.tubes.map((t) => [t.id, t.label]), () => local.sel, (v) => { local.sel = v; ctx.save(); ctx.rerender(); }, L('Пробирка', 'Пробирка', 'Test tube'))));
    const groups = new Map();
    for (const r of step.reagents) {
      const b = btn(r.label, () => {
        if (local.finished && !step.reset) return;
        if (local.finished) { ctx.feedback(L('Проба уже проведена — вылейте и повторите.', 'Сынама жүргізілді — төгіп, қайталаңыз.', 'The test is done — empty the tube and repeat.'), 'warn'); return; }
        const ids = r.target === 'all' ? step.tubes.map((t) => t.id) : [local.sel];
        for (const id of ids) { const t = local.tubes[id]; t.added.push(r.id); r.apply(t, state, ctx, id, local); }
        if (r.advance) ctx.advance(r.advance);
        check(); ctx.save(); ctx.rerender();
      }, r.cls || '');
      if (r.disabled && r.disabled(local.tubes[local.sel], state, local)) b.disabled = true;
      const k = r.group ? tr(r.group) : '';
      if (!groups.has(k)) groups.set(k, { label: r.group, els: [] });
      groups.get(k).els.push(b);
    }
    for (const g of groups.values()) wrap.append(group(g.label || L('Реактивы и действия', 'Реактивтер мен әрекеттер', 'Reagents and actions'), row(...g.els)));
    const extra = [];
    if (step.indicator) extra.push(btn(L('Индикаторная бумага', 'Индикатор қағазы', 'Indicator paper'), () => {
      const t = local.tubes[local.sel];
      if (!t.v || t.pH == null) { ctx.feedback(L('В пробирке пока нечего проверять.', 'Пробиркада әзірге тексеретін ештеңе жоқ.', 'There is nothing to test in the tube yet.'), 'warn'); return; }
      local.paper = t.pH; t.checked = true;
      ctx.log({ ru: `Индикаторная бумага: pH ≈ ${Math.round(t.pH)}`, kk: `Индикатор қағазы: pH ≈ ${Math.round(t.pH)}`, en: `Indicator paper: pH ≈ ${Math.round(t.pH)}` }, 'obs');
      ctx.advance(10); ctx.save(); ctx.rerender();
    }));
    if (step.reset) extra.push(btn(L('Вылить и повторить пробу', 'Төгіп, сынаманы қайталау', 'Empty the tube and repeat'), () => {
      const def = step.tubes.find((t) => t.id === local.sel);
      local.tubes[local.sel] = { v: 0, added: [], ...deepClone(def.init || {}) };
      local.finished = false; local.paper = null;
      ctx.log(L('Пробирка вымыта, проба повторяется', 'Пробирка жуылды, сынама қайталанады', 'Tube washed out; the test is repeated'));
      ctx.feedback(null); ctx.save(); ctx.rerender();
    }, 'danger'));
    if (extra.length) wrap.append(row(...extra));
    if (local.paper != null) wrap.append(h('div', { class: 'wfull', html: stripHTML(local.paper, tr) }));
    const check = () => {
      if (!local.finished && step.done(local.tubes, state, local)) {
        local.finished = true;
        if (!step.observe) { if (step.onDone) step.onDone(state, local.tubes, ctx); ctx.solve(step.doneText); }
      }
    };
    if (step.observe && local.finished) {
      const right = step.observe.correct(state, local.tubes);
      const ci = step.observe.options.findIndex((o) => o.id === right);
      wrap.append(questionBlock({
        q: step.observe.question, options: step.observe.options.map((o) => ({ label: o.label, why: o.id === right ? step.observe.why && step.observe.why(state, local.tubes) : o.why })), correct: ci,
        onWrong: () => { ctx.remark({ key: 'tobs-' + ctx.stepIndex, severity: 'minor', points: step.observe.points ?? 0.5, text: L('неточное описание наблюдения', 'бақылаудың дәл емес сипаттамасы', 'inaccurate description of the observation') }); ctx.save(); },
        onRight: () => {
          const o = step.observe.options[ci];
          ctx.log(o.log ? (typeof o.log === 'function' ? o.log(state, local.tubes) : o.log) : o.label, 'obs');
          if (step.onDone) step.onDone(state, local.tubes, ctx);
          ctx.solve(step.doneText);
        },
      }, local.q, ctx.rng));
    }
    const t = local.tubes[local.sel];
    ctx.readouts([{ label: L('Объём', 'Көлем', 'Volume'), value: { ru: (t.v || 0).toFixed(2) + ' мл', kk: (t.v || 0).toFixed(2) + ' мл', en: (t.v || 0).toFixed(2) + ' mL' } }]);
    setTimeout(() => ctx.update());
    return wrap;
  },
  scene(step, ctx) {
    const n = step.tubes.length, xs = n === 1 ? [180] : n === 2 ? [140, 220] : n === 3 ? [110, 180, 250] : step.tubes.map((_, i) => 80 + (i * 200) / (n - 1));
    let s = '';
    step.tubes.forEach((td, i) => {
      const t = ctx.local.tubes[td.id];
      s += tubeSVG({ id: 'tt' + i, cx: xs[i], frac: Math.min(1, (t.v || 0) / (step.capacity || 5)), color: t.color, solid: t.solid, ppt: t.ppt, pptColor: t.pptColor, gas: t.gas, mirror: t.mirror, layer: t.layer, layerColor: t.layerColor, label: td.label });
      if (ctx.local.sel === td.id && n > 1) s += `<path d="M${xs[i] - 6} 22 L${xs[i] + 6} 22 L${xs[i]} 30 Z" fill="var(--accent)"/>`;
    });
    // штатив рисуется до пробирок — иначе нижняя планка закрывает подписи пробирок
    return scene((step.sceneBack ? step.sceneBack(ctx.state, ctx.local) : '') + tubeRack(Math.min(...xs) - 50, Math.max(...xs) + 50) + s);
  },
  hints(step, ctx) {
    return [
      step.hint1 || L('Выполните пробу точно по методичке: порядок реактивов и среда важны.', 'Сынаманы әдістеме бойынша дәл орындаңыз: реактивтердің реті мен орта маңызды.', 'Do the test exactly as in the manual: the order of reagents and the medium matter.'),
      step.hint2 || L('Если картина не та — проверьте среду индикаторной бумагой и при необходимости повторите пробу.', 'Көрініс басқаша болса — ортаны индикатор қағазымен тексеріп, қажет болса сынаманы қайталаңыз.', 'If the picture is wrong, check the medium with indicator paper and repeat the test if needed.'),
      step.hint3 || L('Добавляйте реактивы в порядке, указанном в инструкции шага.', 'Реактивтерді қадам нұсқаулығындағы ретпен қосыңыз.', 'Add the reagents in the order given in the step instructions.'),
    ];
  },
};
