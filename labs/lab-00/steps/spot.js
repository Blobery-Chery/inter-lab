/**
 * lab00-spot — найти на сцене лаборатории нарушения (mode 'violations') или показать, где находятся
 * средства аварийной защиты (mode 'locate'). Нажатие — прямо на стенде (объекты фокусируются с клавиатуры, Enter).
 * step: {
 *   mode: 'violations' | 'locate',
 *   draw(state, local) → внутренность сцены (без обёртки scene()),
 *   spots: [{ id, x, y, w, h, name:{…}, bad?: true, rule?: {…}, text:{…} (объяснение), whatif? }],
 *   find: ['id', …]                — для locate: что показать (по очереди, в случайном порядке)
 *   missLimit: 3                   — после стольких «ложных тревог» — одно замечание minor
 * }
 * Состояние — только в ctx.local: found {id:true}, miss, k (номер искомого), order.
 */
import { h } from '../../../app/dom.js';
import { L, tr } from '../../../app/i18n.js';
import { group } from '../../../app/ui/controls.js';
import { scene } from '../../../app/scene/svg.js';
import { tag } from '../scene.js';

const join = (parts, l) => parts.map((p) => tr(p, l)).join('');
const cat = (...parts) => ({ ru: join(parts, 'ru'), kk: join(parts, 'kk'), en: join(parts, 'en') });

export default {
  type: 'lab00-spot',
  init(step, ctx) {
    ctx.local.found = {}; ctx.local.miss = 0; ctx.local.k = 0; ctx.local.last = null;
    if (step.mode === 'locate') ctx.local.order = ctx.rng.shuffle(step.find.slice());
  },
  targets(step) { return step.mode === 'locate' ? step.find : step.spots.filter((s) => s.bad).map((s) => s.id); },
  render(step, ctx) {
    const { local } = ctx;
    const wrap = h('div', { class: 'wfull' });
    const tg = this.targets(step);
    const nFound = tg.filter((id) => local.found[id]).length;
    if (step.mode === 'locate') {
      const cur = local.order[local.k];
      const sp = step.spots.find((s) => s.id === cur);
      if (sp) wrap.append(h('p', { class: 'qq' }, tr(L('Покажите на стенде: ', 'Стендте көрсетіңіз: ', 'Show on the bench: ')), h('b', null, tr(sp.name))));
    } else {
      wrap.append(h('p', { class: 'muted' }, tr(L('Нажимайте на стенде на то, что нарушает правила. Нажатие на безопасное место — «ложная тревога».', 'Стендте ережені бұзатын нәрсені басыңыз. Қауіпсіз жерді басу — «жалған дабыл».', 'Tap on the bench whatever breaks the rules. Tapping something safe is a “false alarm”.'))));
    }
    const list = h('ul', { class: 'l00-found', style: 'margin:6px 0 0;padding-left:18px' });
    for (const id of tg) {
      if (!local.found[id]) continue;
      const sp = step.spots.find((s) => s.id === id);
      list.append(h('li', { html: '<b>✓ ' + tr(sp.name) + '</b>' + (sp.rule ? ` <span class="muted">(${tr(sp.rule)})</span>` : '') + (step.mode === 'violations' ? ' — ' + tr(sp.text) : '') }));
    }
    if (nFound) wrap.append(group(step.mode === 'locate' ? L('Найдено', 'Табылды', 'Located') : L('Найденные нарушения', 'Табылған бұзушылықтар', 'Violations found'), list));
    if (local.last) {
      const sp = step.spots.find((s) => s.id === local.last);
      if (sp && sp.whatif && sp.bad) wrap.append(h('div', { class: 'whatif', role: 'note' }, h('strong', null, tr(L('Чем это опасно?', 'Бұл немен қауіпті?', 'Why is it dangerous?'))), h('div', { html: tr(sp.whatif) })));
    }
    ctx.readouts([{ label: step.mode === 'locate' ? L('Показано', 'Көрсетілді', 'Shown') : L('Найдено нарушений', 'Табылған бұзушылық', 'Violations found'), value: `${nFound} / ${tg.length}`, st: nFound === tg.length ? 'ok' : '' },
      { label: L('Ложные тревоги', 'Жалған дабылдар', 'False alarms'), value: String(local.miss), st: local.miss >= (step.missLimit ?? 3) ? 'warn' : '' }]);
    return wrap;
  },
  bind(root, step, ctx) {
    const box = document.querySelector('.scenebox');
    if (!box) return null;
    const act = (e) => {
      const g = e.target.closest && e.target.closest('[data-l00]');
      if (!g || !box.contains(g)) return;
      if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      this.hit(step, ctx, g.getAttribute('data-l00'));
    };
    box.addEventListener('click', act);
    box.addEventListener('keydown', act);
    return () => { box.removeEventListener('click', act); box.removeEventListener('keydown', act); };
  },
  hit(step, ctx, id) {
    if (ctx.solved()) return;
    const { local } = ctx;
    const sp = step.spots.find((s) => s.id === id);
    if (!sp) return;
    const miss = () => {
      local.miss++;
      if (local.miss >= (step.missLimit ?? 3)) ctx.remark({ key: 'spot-miss-' + ctx.stepIndex, severity: 'minor', text: step.missRemark || L('невнимательный осмотр: много ложных тревог', 'мұқият емес тексеру: жалған дабыл көп', 'careless inspection: many false alarms') });
    };
    if (step.mode === 'locate') {
      const cur = local.order[local.k];
      if (id === cur) {
        local.found[id] = true; local.k++;
        ctx.log(cat(L('Найдено: ', 'Табылды: ', 'Located: '), sp.name, sp.rule ? cat(' (', sp.rule, ')') : ''));
        ctx.advance(20);
        ctx.feedback(sp.text, 'good');
      } else {
        const want = step.spots.find((s) => s.id === cur);
        miss();
        ctx.feedback(cat(L('Это ', 'Бұл — ', 'This is '), sp.name, L(', а нужно найти: ', ', ал табу керек: ', '; you need to find: '), want.name, '.'), 'bad');
      }
    } else if (sp.bad) {
      if (local.found[id]) return;
      local.found[id] = true; local.last = id;
      ctx.log(cat(L('Нарушение: ', 'Бұзушылық: ', 'Violation: '), sp.name, sp.rule ? cat(' (', sp.rule, ')') : ''), 'obs');
      ctx.advance(30);
      ctx.feedback(cat(L('Нарушение найдено: ', 'Бұзушылық табылды: ', 'Violation found: '), sp.name, '.'), 'good');
    } else {
      if (!local.found['_ok_' + id]) { local.found['_ok_' + id] = true; miss(); }
      ctx.feedback(cat(L('Здесь нарушения нет. ', 'Мұнда бұзушылық жоқ. ', 'No violation here. '), sp.text), 'info');
    }
    const tg = this.targets(step);
    if (tg.every((x) => local.found[x]) && !ctx.solved()) ctx.solve(step.doneText || L('Готово.', 'Дайын.', 'Done.'));
    ctx.save(); ctx.rerender();
  },
  scene(step, ctx) {
    const { local } = ctx;
    let s = step.draw(ctx.state, local);
    for (const sp of step.spots) {
      const found = local.found[sp.id], miss = local.found['_ok_' + sp.id];
      s += `<g class="l00-hs${found ? ' found' : miss ? ' miss' : ''}" data-l00="${sp.id}" tabindex="0" role="button" aria-label="${step.mode === 'locate' || found ? tr(sp.name) : tr(L('объект на стенде', 'стендтегі нысан', 'object on the bench'))}"><rect x="${sp.x}" y="${sp.y}" width="${sp.w}" height="${sp.h}"/></g>`;
    }
    for (const sp of step.spots) if (local.found[sp.id]) s += tag(sp.x + sp.w / 2, sp.y + (sp.tagY ?? 8), step.mode === 'locate' ? sp.short || sp.name : '✓');
    return scene(s, step.label);
  },
  hints(step, ctx) {
    const { local } = ctx;
    const left = this.targets(step).filter((id) => !local.found[id]).map((id) => step.spots.find((s) => s.id === id));
    if (step.mode === 'locate') {
      const cur = step.spots.find((s) => s.id === local.order[local.k]) || left[0];
      return [
        L('Средства аварийной защиты обычно у выхода и на стенах, на виду; их отмечают знаками (п. 2.4, 11.1).', 'Апаттық қорғаныс құралдары әдетте шығу жанында және қабырғаларда, көзге көрінетін жерде; олар белгілермен белгіленеді (2.4, 11.1-тармақтар).', 'Emergency equipment is usually by the exit and on the walls, in plain view, and marked with signs (rules 2.4, 11.1).'),
        cur ? cat(cur.name, ' — ', cur.where || L('ищите на стене или у выхода', 'қабырғадан немесе шығу жанынан іздеңіз', 'look on the walls or by the exit')) : null,
        cur ? cat(L('Нажмите: ', 'Басыңыз: ', 'Tap: '), cur.name, ' — ', cur.where || '', '.') : null,
      ];
    }
    return [
      step.hint1 || L('Проверьте по разделу 2 правил ТБ: еда и напитки, внешний вид, вещи на столе, как набирают жидкость, оставлены ли приборы без присмотра.', 'ҚТ ережелерінің 2-бөлімі бойынша тексеріңіз: тамақ пен сусын, сыртқы түр, үстелдегі заттар, сұйықты қалай алады, құралдар қараусыз қалдырылған ба.', 'Check against section 2 of the safety rules: food and drink, appearance, belongings on the bench, how liquids are drawn up, whether equipment is left unattended.'),
      left.length ? L(`Осталось найти: ${left.length}. Посмотрите внимательнее на людей и на то, что стоит на столе.`, `Табу қалды: ${left.length}. Адамдарға және үстелдегі заттарға мұқият қараңыз.`, `Still to find: ${left.length}. Look closely at the people and at what is on the bench.`) : L('Все нарушения найдены.', 'Барлық бұзушылық табылды.', 'All violations found.'),
      left.length ? { ru: 'Найдите: ' + left.map((s) => tr(s.name, 'ru')).join('; ') + '.', kk: 'Табыңыз: ' + left.map((s) => tr(s.name, 'kk')).join('; ') + '.', en: 'Find: ' + left.map((s) => tr(s.name, 'en')).join('; ') + '.' } : null,
    ];
  },
};
