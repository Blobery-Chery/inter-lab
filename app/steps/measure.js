/**
 * measure — отмерить жидкость мерной посудой (app/instruments/glassware.js) и перелить в сосуд.
 * step: {
 *   measure: 'cylinder-10'         прибор из MEASURES
 *   reagent: {…}, bottleCls        подпись склянки (bottleCls: 'nox' — бурая склянка HNO₃)
 *   target: 5, tol: 0.25           мл; отклонение больше tol → последствие
 *   onDeviation: 'consequence' | 'block'
 *   saveAs: 'vAcid'                куда записать фактический объём
 *   into: {…}                      куда переливают (для кнопки и журнала)
 *   onTransfer(state, v, ctx)      что меняется в сосуде
 *   then: [action…]                действия после переливания (например, перемешать) — см. runAction в _common.js
 *   sceneExtra(state, local)       SVG сосуда справа от цилиндра
 * }
 */
import { h } from '../dom.js';
import { tr, L, n } from '../i18n.js';
import { btn, row, group } from '../ui/controls.js';
import { scene } from '../scene/svg.js';
import { MEASURES, cylinderSVG, measureReading } from '../instruments/glassware.js';
import { actionButton } from './_common.js';

export default {
  type: 'measure',
  init(step, ctx) { ctx.local.v = 0; ctx.local.moved = false; ctx.local.done = {}; },
  render(step, ctx) {
    const { local } = ctx, M = MEASURES[step.measure || 'cylinder-10'];
    const ml = L('мл', 'мл', 'mL');
    const upd = () => {
      const r = measureReading(local.v, M.div);
      ctx.readouts([
        { label: L('Прибор', 'Құрал', 'Instrument'), value: { ru: n(r, 1) + ' мл', kk: n(r, 1) + ' мл', en: n(r, 1) + ' mL' }, st: Math.abs(local.v - step.target) < M.div / 2 + 1e-9 ? 'ok' : local.v > step.target ? 'warn' : '' },
        { label: L('Нужно', 'Қажет', 'Needed'), value: { ru: n(step.target, 1) + ' мл', kk: n(step.target, 1) + ' мл', en: n(step.target, 1) + ' mL' } },
      ]);
      ctx.update();
    };
    const add = (d) => btn({ ru: `+${n(d, 1)} мл`, kk: `+${n(d, 1)} мл`, en: `+${n(d, 1)} mL` }, () => {
      if (local.moved) return;
      local.v = Math.min(M.cap, +(local.v + d).toFixed(2)); ctx.advance(5); upd(); ctx.save();
    });
    const steps = M.div <= 0.1 ? [1, 0.5, 0.1] : M.div <= 0.2 ? [1, 0.5, 0.1] : M.div <= 0.5 ? [5, 1, 0.5] : [10, 5, 1];
    const sub = (toBottle) => btn(toBottle ? L('Отлить 0,5 мл обратно в склянку', '0,5 мл склянкаға қайта құю', 'Pour 0.5 mL back into the bottle') : L('Отлить 0,5 мл в отходы', '0,5 мл қалдыққа құю', 'Pour 0.5 mL into the waste'), () => {
      if (local.moved || local.v <= 0) return;
      local.v = Math.max(0, +(local.v - 0.5).toFixed(2));
      if (toBottle) ctx.remark({ key: 'back-' + ctx.stepIndex, severity: 'safety', text: L('излишек реактива вернули в склянку — так загрязняют реактив (п. 4.2 правил ТБ)', 'реактивтің артығы склянкаға қайтарылды — реактив осылай ластанады (ҚТ ережелерінің 4.2-тармағы)', 'excess reagent returned to the bottle — this contaminates the reagent (safety rule 4.2)') });
      else ctx.log({ ru: 'Излишек слит в ёмкость для отходов', kk: 'Артығы қалдық ыдысына құйылды', en: 'Excess poured into the waste container' });
      upd(); ctx.save();
    });
    const into = step.into || L('сосуд', 'ыдыс', 'the vessel');
    const pour = btn({ ru: 'Перелить: ' + tr(into, 'ru'), kk: 'Құю: ' + tr(into, 'kk'), en: 'Pour into ' + tr(into, 'en') }, () => {
      if (local.moved) return;
      if (local.v < M.div) { ctx.feedback(L('Прибор пуст.', 'Құрал бос.', 'The instrument is empty.'), 'warn'); return; }
      const dev = Math.abs(local.v - step.target);
      if (dev > (step.tol ?? M.div)) {
        if (step.onDeviation === 'block') { ctx.feedback(L(`Нужно ${n(step.target, 1)} мл, отмерено ${n(local.v, 1)} мл. Исправьте объём.`, `${n(step.target, 1)} мл қажет, ${n(local.v, 1)} мл өлшенді. Көлемді түзетіңіз.`, `${n(step.target, 1)} mL is needed, ${n(local.v, 1)} mL measured. Correct the volume.`), 'warn'); return; }
        ctx.remark({ key: 'vol-' + ctx.stepIndex, severity: step.deviationSeverity || 'minor', points: step.deviationPoints ?? 0.5, text: { ru: `объём отмерен неточно (${n(local.v, 1)} мл вместо ${n(step.target, 1)} мл)`, kk: `көлем дәл өлшенбеді (${n(step.target, 1)} мл орнына ${n(local.v, 1)} мл)`, en: `inaccurate volume (${n(local.v, 1)} mL instead of ${n(step.target, 1)} mL)` } });
      }
      local.moved = true; local.vMoved = local.v;
      if (step.saveAs) ctx.state[step.saveAs] = local.v;
      ctx.advance(step.seconds ?? 60);
      ctx.log({ ru: `${tr(step.reagent, 'ru')}: отмерено ${n(local.v, 1)} мл, перелито — ${tr(into, 'ru')}`, kk: `${tr(step.reagent, 'kk')}: ${n(local.v, 1)} мл өлшеніп, құйылды — ${tr(into, 'kk')}`, en: `${tr(step.reagent, 'en')}: ${n(local.v, 1)} mL measured and poured into ${tr(into, 'en')}` });
      if (step.onTransfer) step.onTransfer(ctx.state, local.v, ctx);
      local.v = 0;
      check(); ctx.rerender();
    }, 'pri');
    const check = () => {
      if (!local.moved) return;
      if ((step.then || []).every((a) => local.done[a.id])) ctx.solve(step.doneText);
    };
    if (local.moved) pour.disabled = true;
    const rows = [group(M.name, row(...steps.map(add)), row(sub(false), sub(true))), row(pour)];
    if (step.then && step.then.length) {
      const acts = step.then.map((a) => ({ ...a, when: (st, lc, c) => lc.moved && (!a.when || a.when(st, lc, c)), whenText: a.whenText || L('Сначала перелейте отмеренный объём.', 'Алдымен өлшенген көлемді құйыңыз.', 'Pour the measured volume first.') }));
      rows.push(group(L('Дальше', 'Әрі қарай', 'Then'), row(...acts.map((a) => actionButton(a, ctx, local.done, acts, () => { check(); ctx.rerender(); })))));
    }
    setTimeout(upd);
    return h('div', { class: 'wfull' }, ...rows);
  },
  scene(step, ctx) {
    const M = MEASURES[step.measure || 'cylinder-10'];
    return scene(cylinderSVG({ cap: M.cap, v: ctx.local.v, name: M.name, bottle: step.reagent, bottleSub: step.bottleSub, bottleCls: step.bottleCls }) + (step.sceneExtra ? step.sceneExtra(ctx.state, ctx.local) : ''));
  },
  hints(step, ctx) {
    const M = MEASURES[step.measure || 'cylinder-10'];
    return [
      L('Отсчёт — по нижнему краю мениска, глаз на уровне мениска. Цена деления прибора — смотрите на шкалу.', 'Есеп — менисктің төменгі шеті бойынша, көз мениск деңгейінде. Құралдың бөлік құнын шкаладан қараңыз.', 'Read at the bottom of the meniscus with your eye level with it. Check the scale division of the instrument.'),
      L(`Нужно ${n(step.target, 1)} мл; сейчас ${n(ctx.local.v || 0, 1)} мл. Цена деления ${n(M.div, 1)} мл.`, `${n(step.target, 1)} мл қажет; қазір ${n(ctx.local.v || 0, 1)} мл. Бөлік құны ${n(M.div, 1)} мл.`, `You need ${n(step.target, 1)} mL; now ${n(ctx.local.v || 0, 1)} mL. Division ${n(M.div, 1)} mL.`),
      L('Наберите точно нужный объём; лишнее — только в отходы (в склянку не возвращают). Затем перелейте и выполните действия ниже.', 'Қажетті көлемді дәл алыңыз; артығы тек қалдыққа (склянкаға қайтарылмайды). Содан кейін құйып, төмендегі әрекеттерді орындаңыз.', 'Measure exactly the volume needed; excess only into the waste (never back into the bottle). Then pour and do the actions below.'),
    ];
  },
};
