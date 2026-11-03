/**
 * add — прибавление реагента: сразу / порциями / по каплям, следя за прибором.
 * Это process с кнопкой прибавления и ритмом. Дополнительные поля step.add:
 *   { label, total, unit, onAdd(state, local, ctx), rhythms:[[0,'вручную'],[15,'15 с'],…], every: подпись ритма, big: true }
 * local.added — сколько порций прибавлено; ритм (local.rh, с) прибавляет порции автоматически.
 * Скорость прибавления влияет на state через onAdd и tick (перегрев, выброс, побочные продукты).
 */
import { L, tr } from '../i18n.js';
import { btn, seg } from '../ui/controls.js';
import { makeProcess } from './process.js';

function addOne(step, ctx) {
  const a = step.add, { local } = ctx;
  if (local.added >= a.total) return;
  local.added++;
  a.onAdd(ctx.state, local, ctx);
  if (local.added >= a.total) { local.rh = 0; ctx.rerender(); }
}

export default makeProcess('add', {
  init(step, ctx) { ctx.local.added = 0; ctx.local.rh = 0; ctx.local.nextRh = 0; },
  controls(step, ctx, put) {
    const a = step.add, { local } = ctx;
    const b = btn(a.label, () => { if (a.when && !a.when(ctx.state, local)) { ctx.feedback(a.whenText, 'warn'); return; } addOne(step, ctx); ctx.save(); }, 'pri' + (a.big ? ' big' : ''));
    if (local.added >= a.total) b.disabled = true;
    put(a.group || L('Прибавление', 'Қосу', 'Addition'), b);
    if (a.rhythms) put(a.group || L('Прибавление', 'Қосу', 'Addition'), seg(a.rhythms, () => local.rh, (v) => { local.rh = v; local.nextRh = 0; ctx.save(); }, a.rhythmLabel || L('Ритм прибавления', 'Қосу ырғағы', 'Addition rhythm')));
  },
  tick(step, ctx, dt) {
    const { local } = ctx;
    if (local.rh && local.added < step.add.total) {
      local.nextRh -= dt;
      if (local.nextRh <= 0) { addOne(step, ctx); local.nextRh = local.rh; }
    }
  },
  hints: (step) => [
    L('Прибавляйте медленно и следите за термометром: экзотермическая реакция разогревает смесь.', 'Баяу қосып, термометрді қадағалаңыз: экзотермиялық реакция қоспаны қыздырады.', 'Add slowly and watch the thermometer: the exothermic reaction heats the mixture.'),
    L('Если температура растёт — остановитесь, перемешивайте и усильте охлаждение, затем продолжайте.', 'Температура көтерілсе — тоқтап, араластырып, салқындатуды күшейтіңіз, содан кейін жалғастырыңыз.', 'If the temperature climbs, stop, stir and cool harder, then carry on.'),
    L('Выберите спокойный ритм (например, капля раз в 10–15 с) при постоянном перемешивании и охлаждении.', 'Тұрақты араластыру мен салқындату кезінде баяу ырғақты таңдаңыз (мысалы, 10–15 с сайын бір тамшы).', 'Choose a steady rhythm (e.g. a drop every 10–15 s) with constant stirring and cooling.'),
  ],
});
