/**
 * weigh — навеска на аналитических весах (app/instruments/balance.js).
 * step: {
 *   reagent: {ru,kk,en}            подпись склянки на сцене
 *   mode: 'spatula' | 'transfer'   насыпать шпателем до нужной массы / перенести весь продукт
 *   container: 'boat'|'watch'|'paper'
 *   target, lo, hi                 г; масса вне [lo, hi] не записывается (spatula)
 *   mass(state)                    для transfer — истинная масса продукта
 *   saveAs: 'mBA'                  куда записать массу в state
 *   onRecord(state, m, ctx)        дополнительные записи в журнал, расчёты
 *   product: 'var(--solid-y)'      цвет вещества на сцене
 * }
 * Ошибки: вещество на голую чашку (major), без тарирования (minor, взвешивание повторяют),
 * излишек обратно в склянку (safety, п. 4.2 правил ТБ). Дверцы открыты — масса не записывается.
 */
import { h } from '../dom.js';
import { tr, L, n } from '../i18n.js';
import { btn, row, group } from '../ui/controls.js';
import { scene } from '../scene/svg.js';
import { createBalance, reading, stableValue, tare, balanceSVG, CONTAINERS } from '../instruments/balance.js';

const TX = {
  pan: L('вещество насыпали прямо на чашку весов', 'затты таразы табақшасына тікелей салды', 'substance was put straight onto the balance pan'),
  panFb: L('Вещество нельзя насыпать прямо на чашку весов — чашка загрязнена, часть вещества потеряна. Поставьте тару.', 'Затты таразы табақшасына тікелей салуға болмайды — табақша ластанды, заттың бір бөлігі жоғалды. Ыдыс қойыңыз.', 'Never put a substance straight onto the pan — the pan is contaminated and some substance is lost. Use a container.'),
  doors: L('Дверцы закрыты — откройте их, чтобы работать шпателем.', 'Есікшелер жабық — шпательмен жұмыс істеу үшін оларды ашыңыз.', 'The doors are closed — open them to use the spatula.'),
  tare: L('взвешивание без тарирования пустой тары', 'бос ыдыспен тарировкаламай өлшеу', 'weighing without taring the empty container'),
  bottle: L('излишек реактива вернули в склянку — так загрязняют реактив (п. 4.2 правил ТБ)', 'реактивтің артығы склянкаға қайта салынды — реактив осылай ластанады (ҚТ ережелерінің 4.2-тармағы)', 'excess reagent returned to the jar — this contaminates the reagent (safety rule 4.2)'),
};

export default {
  type: 'weigh',
  init(step, ctx) {
    ctx.local.b = createBalance(ctx.rng, step.container || (step.mode === 'transfer' ? 'watch' : 'boat'));
    ctx.local.disp = 0;
  },
  render(step, ctx) {
    const { local } = ctx, b = local.b, sp = step.mode !== 'transfer';
    const cname = (CONTAINERS[b.container] || CONTAINERS.boat).name;
    const upd = () => { local.disp = local.done ? local.m : reading(b, ctx.rng); ctx.update(); };
    const can = () => {
      if (local.done) return false;
      if (!b.cont) {
        if (ctx.remark({ key: 'pan-' + ctx.stepIndex, severity: 'major', points: 1, text: TX.pan })) ctx.feedback(TX.panFb, 'bad');
        else ctx.feedback(TX.panFb, 'bad');
        return false;
      }
      if (!b.open) { ctx.feedback(TX.doors, 'warn'); return false; }
      return true;
    };
    const contB = btn({ ru: 'Поставить: ' + tr(cname, 'ru'), kk: 'Қою: ' + tr(cname, 'kk'), en: 'Place: ' + tr(cname, 'en') }, () => {
      if (b.cont || local.done) return;
      if (!b.open) { ctx.feedback(TX.doors, 'warn'); return; }
      b.cont = true; ctx.log({ ru: 'На чашку весов поставлена тара: ' + tr(cname, 'ru'), kk: 'Таразы табақшасына ыдыс қойылды: ' + tr(cname, 'kk'), en: 'Container placed on the pan: ' + tr(cname, 'en') });
      ctx.advance(15); ctx.rerender();
    }, b.cont ? 'on' : '');
    if (b.cont) contB.disabled = true;
    const tareB = btn(L('Тарировать → 0', 'Тарировкалау → 0', 'Tare → 0'), () => { if (local.done) return; tare(b); ctx.log(L('Весы тарированы', 'Таразы тарировкаланды', 'Balance tared')); ctx.advance(5); upd(); });
    const doorB = btn(b.open ? L('Закрыть дверцы', 'Есікшелерді жабу', 'Close the doors') : L('Открыть дверцы', 'Есікшелерді ашу', 'Open the doors'), () => { b.open = !b.open; ctx.rerender(); });
    const rows = [group(L('Весы', 'Таразы', 'Balance'), row(contB, tareB, doorB))];
    if (sp) {
      const add = (lo, hi) => () => { if (can()) { b.load += ctx.rng.range(lo, hi); ctx.advance(10); upd(); } };
      rows.push(group(L('Шпатель', 'Шпатель', 'Spatula'), row(
        btn(L('Насыпать шпателем', 'Шпательмен салу', 'Add a spatula load'), add(0.22, 0.42)),
        btn(L('Подсыпать чуть-чуть', 'Аздап қосу', 'Add a pinch'), add(0.006, 0.03)),
      ), row(
        btn(L('Отсыпать излишек в стаканчик', 'Артығын стақаншаға төгу', 'Move the excess to a beaker'), () => {
          if (!can() || b.load <= 0) return;
          b.load = Math.max(0, b.load - ctx.rng.range(0.01, 0.05)); if (b.load < 0.004) b.load = 0;
          ctx.log(L('Излишек отсыпан в отдельный стаканчик (в склянку не возвращают)', 'Артығы бөлек стақаншаға төгілді (склянкаға қайтарылмайды)', 'Excess moved to a separate beaker (never back into the jar)'));
          upd();
        }),
        btn(L('Вернуть излишек в склянку', 'Артығын склянкаға қайтару', 'Return the excess to the jar'), () => {
          if (!can() || b.load <= 0) return;
          b.load = Math.max(0, b.load - ctx.rng.range(0.01, 0.05)); if (b.load < 0.004) b.load = 0;
          ctx.remark({ key: 'jar-' + ctx.stepIndex, severity: 'safety', text: TX.bottle });
          upd();
        }),
      )));
    } else {
      rows.push(group(L('Продукт', 'Өнім', 'Product'), row(btn(L('Перенести весь продукт', 'Бүкіл өнімді ауыстыру', 'Transfer all the product'), () => {
        if (local.done || b.load) return;
        if (!b.cont) { ctx.feedback(L('Сначала поставьте тару.', 'Алдымен ыдысты қойыңыз.', 'Place the container first.'), 'warn'); return; }
        if (!b.open) { ctx.feedback(L('Откройте дверцы весов.', 'Таразы есікшелерін ашыңыз.', 'Open the balance doors.'), 'warn'); return; }
        b.load = Math.max(0.0001, +step.mass(ctx.state).toFixed(4));
        ctx.log(L('Продукт перенесён на тару', 'Өнім ыдысқа ауыстырылды', 'Product transferred onto the container'));
        ctx.advance(60); upd();
      }))));
    }
    const rec = btn(L('Записать массу', 'Массаны жазу', 'Record the mass'), () => {
      if (local.done) return;
      if (!b.cont || b.load <= 0) { ctx.feedback(L('На весах нет вещества.', 'Таразыда зат жоқ.', 'There is nothing on the balance.'), 'warn'); return; }
      if (!b.taredEmpty) {
        ctx.remark({ key: 'tare-' + ctx.stepIndex, severity: 'minor', points: 0.5, text: TX.tare });
        ctx.feedback(sp ? L('На дисплее не масса вещества: весы тарированы не с пустой тарой. Отсыпьте вещество, тарируйте весы с пустой тарой и взвесьте снова.', 'Дисплейде заттың массасы емес: таразы бос ыдыспен тарировкаланбаған. Затты төгіп, бос ыдыспен тарировкалап, қайта өлшеңіз.', 'The display does not show the mass of the substance: the balance was not tared with the empty container. Remove the substance, tare with the empty container and weigh again.')
          : L('Весы тарированы не с пустой тарой. Снимите продукт, тарируйте с пустой тарой и перенесите снова.', 'Таразы бос ыдыспен тарировкаланбаған. Өнімді алып, бос ыдыспен тарировкалап, қайта ауыстырыңыз.', 'The balance was not tared with the empty container. Remove the product, tare with the empty container and transfer again.'), 'warn');
        if (!sp) { b.load = 0; upd(); }
        return;
      }
      if (b.open) { ctx.feedback(L('Закройте дверцы весов — при открытых дверцах показания «плывут».', 'Таразы есікшелерін жабыңыз — ашық кезде көрсеткіш тұрақсыз.', 'Close the balance doors — with the doors open the reading drifts.'), 'warn'); return; }
      const m = stableValue(b);
      if (sp && step.lo != null && (m < step.lo || m > step.hi)) {
        ctx.feedback(L(`Масса ${n(m, 4)} г вне допустимого интервала ${n(step.lo, 2)}–${n(step.hi, 2)} г.`, `Масса ${n(m, 4)} г рұқсат етілген ${n(step.lo, 2)}–${n(step.hi, 2)} г аралығынан тыс.`, `The mass ${n(m, 4)} g is outside the allowed ${n(step.lo, 2)}–${n(step.hi, 2)} g.`), 'warn');
        return;
      }
      local.done = true; local.m = m; local.disp = m;
      if (step.saveAs) ctx.state[step.saveAs] = m;
      if (step.onRecord) step.onRecord(ctx.state, m, ctx);
      ctx.solve(L(`Записано в журнал: <b>${n(m, 4)} г</b>`, `Журналға жазылды: <b>${n(m, 4)} г</b>`, `Recorded in the notebook: <b>${n(m, 4)} g</b>`));
      ctx.rerender();
    }, 'pri');
    if (local.done) rec.disabled = true;
    rows.push(row(rec));
    setTimeout(upd);
    ctx.every(350, () => { if (!local.done) upd(); });
    return h('div', { class: 'wfull' }, ...rows);
  },
  scene(step, ctx) {
    return scene(balanceSVG(ctx.local.b, ctx.local.disp || 0, { reagent: step.reagent, product: step.product }));
  },
  hints(step, ctx) {
    const b = ctx.local.b || {};
    return [
      L('Порядок на аналитических весах: тара → тарирование → вещество → закрыть дверцы → записать.', 'Аналитикалық таразыдағы рет: ыдыс → тарировкалау → зат → есікшелерді жабу → жазу.', 'Order on the analytical balance: container → tare → substance → close the doors → record.'),
      !b.cont ? L('Сначала поставьте тару на чашку.', 'Алдымен табақшаға ыдыс қойыңыз.', 'Place the container on the pan first.')
        : !b.taredEmpty ? L('Тарируйте весы, пока на чашке только пустая тара.', 'Табақшада тек бос ыдыс тұрғанда таразыны тарировкалаңыз.', 'Tare while only the empty container is on the pan.')
          : step.lo != null ? L(`Нужно ${n(step.lo, 2)}–${n(step.hi, 2)} г: шпателем до ~${n(step.target - 0.1, 1)} г, дальше по щепотке.`, `${n(step.lo, 2)}–${n(step.hi, 2)} г қажет: шпательмен ~${n(step.target - 0.1, 1)} г-ға дейін, содан кейін аздап.`, `You need ${n(step.lo, 2)}–${n(step.hi, 2)} g: spatula loads up to ~${n(step.target - 0.1, 1)} g, then pinches.`)
            : L('Перенесите продукт, закройте дверцы и запишите массу.', 'Өнімді ауыстырып, есікшелерді жабыңыз да, массаны жазыңыз.', 'Transfer the product, close the doors and record the mass.'),
      L('Тара → «Тарировать» → вещество → «Закрыть дверцы» → «Записать массу». Излишек — в отдельный стаканчик, не в склянку.', 'Ыдыс → «Тарировкалау» → зат → «Есікшелерді жабу» → «Массаны жазу». Артығы — бөлек стақаншаға, склянкаға емес.', 'Container → “Tare” → substance → “Close the doors” → “Record the mass”. Excess goes to a separate beaker, not the jar.'),
    ];
  },
};
