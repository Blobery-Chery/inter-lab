/**
 * assemble — собрать установку: нажать предмет, затем место (в панели или на стенде).
 * step.parts: [{ id, label }]  (могут быть лишние)
 * step.slots: [{ id, label, accepts: 'partId', x, y }]  — x, y: точка на сцене (360×250) для метки места
 * step.onDone(state, placement, errors, ctx) — записать в state последствия неверной сборки (проявятся позже).
 * Неверная сборка разрешена; пустое место — нельзя (сначала заполнить все места).
 * В state[step.saveAs || 'assembly'] сохраняется { placement, errors:[slotId] }.
 */
import { h, esc } from '../dom.js';
import { tr, L } from '../i18n.js';
import { btn, row, group } from '../ui/controls.js';
import { scene, text } from '../scene/svg.js';

export default {
  type: 'assemble',
  init(step, ctx) { ctx.local.place = {}; ctx.local.sel = null; },
  render(step, ctx) {
    const { local } = ctx;
    const wrap = h('div', { class: 'wfull' });
    const used = new Set(Object.values(local.place));
    const parts = h('div', { class: 'shelf' });
    for (const p of step.parts) {
      const b = h('button', { class: 'tile' + (local.sel === p.id ? ' on' : '') + (used.has(p.id) ? ' used' : ''), type: 'button', 'aria-pressed': String(local.sel === p.id) }, h('span', null, tr(p.label)));
      b.onclick = () => { if (ctx.solved()) return; local.sel = local.sel === p.id ? null : p.id; ctx.rerender(); };
      parts.append(b);
    }
    const slots = h('div', { class: 'check' });
    for (const s of step.slots) {
      const p = step.parts.find((x) => x.id === local.place[s.id]);
      const b = btn({ ru: `${tr(s.label, 'ru')}: ${p ? tr(p.label, 'ru') : '—'}`, kk: `${tr(s.label, 'kk')}: ${p ? tr(p.label, 'kk') : '—'}`, en: `${tr(s.label, 'en')}: ${p ? tr(p.label, 'en') : '—'}` },
        () => this.sceneAct('slot:' + s.id, step, ctx), p ? 'on' : '');
      slots.append(b);
    }
    const doneB = btn(step.doneLabel || L('Установка собрана', 'Қондырғы жиналды', 'Set-up assembled'), () => {
      const empty = step.slots.filter((s) => !local.place[s.id]);
      if (empty.length) { ctx.feedback(L('Заполните все места установки.', 'Қондырғының барлық орнын толтырыңыз.', 'Fill every position of the set-up.'), 'warn'); return; }
      const errors = step.slots.filter((s) => local.place[s.id] !== s.accepts).map((s) => s.id);
      ctx.state[step.saveAs || 'assembly'] = { placement: { ...local.place }, errors };
      ctx.advance(step.seconds ?? 180);
      ctx.log({ ru: 'Собрана установка: ' + step.slots.map((s) => tr(s.label, 'ru') + ' — ' + tr(step.parts.find((x) => x.id === local.place[s.id]).label, 'ru')).join('; '), kk: 'Қондырғы жиналды: ' + step.slots.map((s) => tr(s.label, 'kk') + ' — ' + tr(step.parts.find((x) => x.id === local.place[s.id]).label, 'kk')).join('; '), en: 'Set-up assembled: ' + step.slots.map((s) => tr(s.label, 'en') + ' — ' + tr(step.parts.find((x) => x.id === local.place[s.id]).label, 'en')).join('; ') });
      if (step.onDone) step.onDone(ctx.state, local.place, errors, ctx);
      ctx.solve(step.solvedText || L('Установка собрана. Проверьте её ещё раз перед работой.', 'Қондырғы жиналды. Жұмыс алдында оны тағы тексеріңіз.', 'The set-up is assembled. Check it once more before use.'), 'info');
      ctx.rerender();
    }, 'pri');
    if (ctx.solved()) doneB.disabled = true;
    wrap.append(group(L('Детали — выберите', 'Бөлшектер — таңдаңыз', 'Parts — choose one'), parts), group(L('Места установки — нажмите, чтобы поставить выбранное', 'Қондырғы орындары — таңдалғанды қою үшін басыңыз', 'Positions — tap to place the chosen part'), slots), row(doneB));
    ctx.readouts([{ label: L('Выбрано', 'Таңдалды', 'Chosen'), value: local.sel ? tr(step.parts.find((x) => x.id === local.sel).label) : '—' }]);
    return wrap;
  },
  sceneAct(act, step, ctx) {
    if (!act.startsWith('slot:') || ctx.solved()) return;
    const id = act.slice(5), { local } = ctx;
    if (local.sel) {
      for (const k of Object.keys(local.place)) if (local.place[k] === local.sel) delete local.place[k];
      local.place[id] = local.sel; local.sel = null;
    } else if (local.place[id]) delete local.place[id];
    else { ctx.feedback(L('Сначала выберите деталь.', 'Алдымен бөлшекті таңдаңыз.', 'Choose a part first.'), 'warn'); return; }
    ctx.save(); ctx.rerender();
  },
  scene(step, ctx) {
    const { local } = ctx;
    let s = step.base ? step.base(ctx.state, local) : '';
    for (const sl of step.slots) {
      const p = step.parts.find((x) => x.id === local.place[sl.id]);
      s += `<g data-act="slot:${esc(sl.id)}" class="slot${p ? ' full' : ''}" tabindex="0" role="button" aria-label="${esc(tr(sl.label))}"><rect x="${sl.x - 46}" y="${sl.y - 13}" width="92" height="26" rx="6"/>${text(sl.x, sl.y + 4, p ? p.label : sl.label, p ? 'lblb' : 'lbl')}</g>`;
    }
    return scene(s);
  },
  hints(step, ctx) {
    const wrong = step.slots.filter((s) => ctx.local.place[s.id] && ctx.local.place[s.id] !== s.accepts);
    return [
      step.hint1 || L('Подумайте, как работает установка: откуда поступает жидкость, куда уходит газ или вода.', 'Қондырғының қалай жұмыс істейтінін ойлаңыз: сұйықтық қайдан келеді, газ немесе су қайда кетеді.', 'Think about how the set-up works: where the liquid comes from and where gas or water goes.'),
      wrong.length ? L(`Неверно стоит: ${tr(wrong[0].label, 'ru')}.`, `Қате тұр: ${tr(wrong[0].label, 'kk')}.`, `Wrong position: ${tr(wrong[0].label, 'en')}.`) : L('Пока ошибок в расстановке нет — заполните оставшиеся места.', 'Әзірге орналастыруда қате жоқ — қалған орындарды толтырыңыз.', 'No mistakes so far — fill the remaining positions.'),
      { ru: step.slots.map((s) => tr(s.label, 'ru') + ' — ' + tr(step.parts.find((p) => p.id === s.accepts).label, 'ru')).join('; '), kk: step.slots.map((s) => tr(s.label, 'kk') + ' — ' + tr(step.parts.find((p) => p.id === s.accepts).label, 'kk')).join('; '), en: step.slots.map((s) => tr(s.label, 'en') + ' — ' + tr(step.parts.find((p) => p.id === s.accepts).label, 'en')).join('; ') },
    ];
  },
};
