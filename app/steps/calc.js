/**
 * calc — расчёт по своим данным. Относительная погрешность ≤ tol (по умолчанию 1 %).
 * После 3 неверных попыток показывается решение (засчитывается как подсказка уровня 3).
 * step.fields: [{ id, label, unit, answer(state, ctx) → число, tol=0.01, decimals=2, formula(state) → {…} }]
 * step.saveAs — куда записать ответы { id: значение }; step.onDone(state, values, ctx)
 */
import { h } from '../dom.js';
import { tr, L, n, num } from '../i18n.js';
import { btn, row } from '../ui/controls.js';

export const parseNum = (s) => {
  const v = parseFloat(String(s).replace(/\s/g, '').replace(',', '.').replace('−', '-'));
  return isFinite(v) ? v : NaN;
};

export function withinTol(x, ans, tol = 0.01) {
  if (!isFinite(x)) return false;
  if (ans === 0) return Math.abs(x) < 1e-9 + tol;
  return Math.abs(x - ans) / Math.abs(ans) <= tol + 1e-12;
}

export default {
  type: 'calc',
  init(step, ctx) { ctx.local.val = {}; ctx.local.att = {}; ctx.local.ok = {}; ctx.local.shown = {}; },
  render(step, ctx) {
    const { local, state } = ctx;
    const wrap = h('div', { class: 'wfull calcbox' });
    const finish = () => {
      if (step.fields.every((f) => local.ok[f.id] || local.shown[f.id]) && !ctx.solved()) {
        const vals = Object.fromEntries(step.fields.map((f) => [f.id, local.val[f.id]]));
        if (step.saveAs) state[step.saveAs] = vals;
        if (step.onDone) step.onDone(state, vals, ctx);
        ctx.solve();
      }
    };
    for (const f of step.fields) {
      const ans = f.answer(state, ctx), d = f.decimals ?? 2;
      const inp = h('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', class: 'num', 'aria-label': tr(f.label), value: local.val[f.id] != null ? num(local.val[f.id], d) : '' });
      const st = local.ok[f.id] ? 'ok' : local.shown[f.id] ? 'shown' : '';
      if (st) inp.disabled = true;
      const res = h('div', { class: 'fb', hidden: true, role: 'status', 'aria-live': 'polite' });
      if (local.ok[f.id]) { res.hidden = false; res.className = 'fb good'; res.innerHTML = '✓ ' + tr(L('Верно', 'Дұрыс', 'Correct')); }
      else if (local.shown[f.id]) { res.hidden = false; res.className = 'fb warn'; res.innerHTML = tr(L('Решение: ', 'Шешім: ', 'Solution: ')) + tr(f.formula ? f.formula(state) : '') + ' = <b>' + num(ans, d) + ' ' + tr(f.unit || '') + '</b>'; }
      else if (local.att[f.id]) { res.hidden = false; res.className = 'fb bad'; res.innerHTML = '✗ ' + tr(L(`Неверно (попытка ${local.att[f.id]} из 3). Проверьте исходные числа и единицы.`, `Қате (3 әрекеттің ${local.att[f.id]}-сі). Бастапқы сандар мен бірліктерді тексеріңіз.`, `Incorrect (attempt ${local.att[f.id]} of 3). Check your data and units.`)); }
      const go = btn(L('Проверить', 'Тексеру', 'Check'), () => {
        if (local.ok[f.id] || local.shown[f.id]) return;
        const x = parseNum(inp.value);
        if (!isFinite(x)) { ctx.feedback(L('Введите число.', 'Сан енгізіңіз.', 'Enter a number.'), 'warn'); return; }
        local.val[f.id] = x;
        if (withinTol(x, ans, f.tol ?? 0.01)) {
          local.ok[f.id] = true;
          ctx.log({ ru: `${tr(f.label, 'ru')}: ${n(x, d)} ${tr(f.unit || '', 'ru')}`, kk: `${tr(f.label, 'kk')}: ${n(x, d)} ${tr(f.unit || '', 'kk')}`, en: `${tr(f.label, 'en')}: ${n(x, d)} ${tr(f.unit || '', 'en')}` }, 'calc');
        } else {
          local.att[f.id] = (local.att[f.id] || 0) + 1;
          if (local.att[f.id] >= 3) {
            local.shown[f.id] = true; local.val[f.id] = ans;
            ctx.forceSolutionHint();
            ctx.log({ ru: `${tr(f.label, 'ru')}: ${n(ans, d)} ${tr(f.unit || '', 'ru')} (по решению)`, kk: `${tr(f.label, 'kk')}: ${n(ans, d)} ${tr(f.unit || '', 'kk')} (шешім бойынша)`, en: `${tr(f.label, 'en')}: ${n(ans, d)} ${tr(f.unit || '', 'en')} (from the solution)` }, 'calc');
          }
        }
        ctx.save(); finish(); ctx.rerender();
      }, 'pri');
      if (st) go.disabled = true;
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go.click(); });
      wrap.append(h('label', { class: 'field' }, h('span', { html: tr(f.label) }), row(inp, h('span', { class: 'unit' }, tr(f.unit || '')), go)), res);
    }
    setTimeout(finish);
    return wrap;
  },
  hints(step, ctx) {
    const f = step.fields.find((x) => !ctx.local.ok[x.id] && !ctx.local.shown[x.id]) || step.fields[0];
    return [
      f.hint1 || L('Возьмите свои числа из журнала (масса навески, масса продукта), а молярные массы — из методички.', 'Өз сандарыңызды журналдан (өлшендінің массасы, өнім массасы), ал молярлық массаларды әдістемеден алыңыз.', 'Take your own numbers from the notebook (sample mass, product mass) and the molar masses from the manual.'),
      f.hint2 || (f.formula ? { ru: 'Формула: ' + tr(f.formula(ctx.state), 'ru'), kk: 'Формула: ' + tr(f.formula(ctx.state), 'kk'), en: 'Formula: ' + tr(f.formula(ctx.state), 'en') } : null),
      { ru: `${tr(f.label, 'ru')} = ${num(f.answer(ctx.state, ctx), f.decimals ?? 2, 'ru')} ${tr(f.unit || '', 'ru')}`, kk: `${tr(f.label, 'kk')} = ${num(f.answer(ctx.state, ctx), f.decimals ?? 2, 'kk')} ${tr(f.unit || '', 'kk')}`, en: `${tr(f.label, 'en')} = ${num(f.answer(ctx.state, ctx), f.decimals ?? 2, 'en')} ${tr(f.unit || '', 'en')}` },
    ];
  },
};
