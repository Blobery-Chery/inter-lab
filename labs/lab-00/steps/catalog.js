/**
 * lab00-catalog — узнать посуду и приборы всех работ (каталог app/equipment.js).
 * Раунды двух видов: 'name' — на стенде рисунок, выбрать название; 'use' — на стенде назначение, выбрать прибор.
 * step: { pool: ['id', …], rounds: 10, useRounds: 4, points: 0.25 }
 * Ошибка в раунде — одно замечание minor (points) на раунд; нужно найти верный ответ, затем следующий раунд.
 * Состояние — ctx.local: rounds [{ id, kind, opts:[id…] }], k, wrong {k:[id…]}.
 */
import { h } from '../../../app/dom.js';
import { L, tr } from '../../../app/i18n.js';
import { option } from '../../../app/ui/controls.js';
import { EQUIPMENT, equipmentIcon } from '../../../app/equipment.js';
import { iconScene, useScene } from '../scene.js';

export default {
  type: 'lab00-catalog',
  init(step, ctx) {
    const rng = ctx.rng;
    const pool = step.pool.filter((id) => EQUIPMENT[id]);
    const pickN = Math.min(step.rounds || 10, pool.length);
    const ids = rng.sample(pool, pickN);
    const useN = step.useRounds ?? 4;
    ctx.local.rounds = ids.map((id, i) => {
      const others = rng.sample(pool.filter((x) => x !== id), 3);
      return { id, kind: i % Math.max(1, Math.round(pickN / Math.max(1, useN))) === 1 && useN ? 'use' : 'name', opts: rng.shuffle([id, ...others]) };
    });
    ctx.local.k = 0; ctx.local.wrong = {};
  },
  render(step, ctx) {
    const { local } = ctx;
    const wrap = h('div', { class: 'wfull' });
    const R = local.rounds[Math.min(local.k, local.rounds.length - 1)];
    const done = local.k >= local.rounds.length;
    if (!done) {
      wrap.append(h('p', { class: 'qq' }, tr(R.kind === 'use' ? L('Какой прибор или посуда служит для этого?', 'Бұл үшін қандай құрал немесе ыдыс қолданылады?', 'Which item is used for this?') : L('Что изображено на стенде?', 'Стендте не бейнеленген?', 'What is shown on the bench?'))));
      const box = h('div', { class: 'q' });
      const wr = local.wrong[local.k] || [];
      for (const id of R.opts) {
        const e = EQUIPMENT[id];
        const b = option(e.name, () => this.choose(step, ctx, id), wr.includes(id) ? 'wrong' : '');
        if (R.kind === 'use') {
          // значок вставляется в DOM напрямую, без tr(): иначе «31.5» в координатах SVG превратится в «31,5»
          const ico = h('span', { style: 'width:30px;height:30px;display:inline-block;vertical-align:middle;margin-right:8px', 'aria-hidden': 'true' });
          ico.innerHTML = equipmentIcon(id);
          b.prepend(ico);
        }
        if (wr.includes(id)) b.disabled = true;
        box.append(b);
      }
      wrap.append(box);
    } else {
      wrap.append(h('p', { class: 'fb good' }, tr(L('Каталог пройден.', 'Каталог өтілді.', 'Catalogue complete.'))));
    }
    const errs = Object.keys(local.wrong).length;
    ctx.readouts([{ label: L('Раунд', 'Раунд', 'Round'), value: `${Math.min(local.k + 1, local.rounds.length)} / ${local.rounds.length}` }, { label: L('Раундов с ошибкой', 'Қатесі бар раундтар', 'Rounds with mistakes'), value: String(errs), st: errs ? 'warn' : 'ok' }]);
    return wrap;
  },
  choose(step, ctx, id) {
    const { local } = ctx;
    const R = local.rounds[local.k];
    if (!R) return;
    const e = EQUIPMENT[R.id];
    if (id === R.id) {
      ctx.log({ ru: `${tr(e.name, 'ru')} — ${tr(e.use, 'ru')}`, kk: `${tr(e.name, 'kk')} — ${tr(e.use, 'kk')}`, en: `${tr(e.name, 'en')} — ${tr(e.use, 'en')}` });
      ctx.feedback({ ru: tr(e.name, 'ru') + ': ' + tr(e.use, 'ru'), kk: tr(e.name, 'kk') + ': ' + tr(e.use, 'kk'), en: tr(e.name, 'en') + ': ' + tr(e.use, 'en') }, 'good');
      local.k++;
      ctx.advance(30);
      if (local.k >= local.rounds.length) {
        const errs = Object.keys(local.wrong).length;
        ctx.log(L(`Каталог оборудования: верно с первой попытки ${local.rounds.length - errs} из ${local.rounds.length}`, `Құрал-жабдықтар каталогы: бірінші әрекеттен дұрыс ${local.rounds.length - errs} / ${local.rounds.length}`, `Equipment catalogue: right first time ${local.rounds.length - errs} of ${local.rounds.length}`), 'obs');
        ctx.state.catalog = { n: local.rounds.length, errs };
        ctx.solve(L('Все приборы узнаны.', 'Барлық құрал танылды.', 'All items identified.'));
      }
    } else {
      local.wrong[local.k] = (local.wrong[local.k] || []).concat(id);
      const w = EQUIPMENT[id];
      ctx.remark({ key: `cat-${local.k}`, severity: 'minor', points: step.points ?? 0.25, text: { ru: `не узнан прибор: ${tr(e.name, 'ru')}`, kk: `құрал танылмады: ${tr(e.name, 'kk')}`, en: `item not recognised: ${tr(e.name, 'en')}` } });
      ctx.feedback({ ru: `Это не так. ${tr(w.name, 'ru')} — ${tr(w.use, 'ru')}.`, kk: `Дұрыс емес. ${tr(w.name, 'kk')} — ${tr(w.use, 'kk')}.`, en: `Not that one. ${tr(w.name, 'en')}: ${tr(w.use, 'en')}.` }, 'bad');
    }
    ctx.save(); ctx.rerender();
  },
  scene(step, ctx) {
    const { local } = ctx;
    const R = local.rounds[Math.min(local.k, local.rounds.length - 1)];
    if (!R) return '';
    if (local.k >= local.rounds.length) return iconScene(R.id, EQUIPMENT[R.id].name);
    return R.kind === 'use' ? useScene(EQUIPMENT[R.id].use) : iconScene(R.id);
  },
  hints(step, ctx) {
    const R = ctx.local.rounds[ctx.local.k];
    if (!R) return [];
    const e = EQUIPMENT[R.id];
    const wrong = R.opts.find((x) => x !== R.id && !(ctx.local.wrong[ctx.local.k] || []).includes(x));
    return [
      { ru: 'Подсказка по назначению: ' + tr(e.use, 'ru'), kk: 'Мақсаты бойынша кеңес: ' + tr(e.use, 'kk'), en: 'What it is for: ' + tr(e.use, 'en') },
      wrong ? { ru: 'Точно не: ' + tr(EQUIPMENT[wrong].name, 'ru'), kk: 'Анық емес: ' + tr(EQUIPMENT[wrong].name, 'kk'), en: 'Definitely not: ' + tr(EQUIPMENT[wrong].name, 'en') } : null,
      { ru: 'Ответ: ' + tr(e.name, 'ru'), kk: 'Жауабы: ' + tr(e.name, 'kk'), en: 'Answer: ' + tr(e.name, 'en') },
    ];
  },
};
