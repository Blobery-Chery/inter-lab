/**
 * lab15-record — запись наблюдений по каждой пробирке (цвет, осадок, время появления).
 * Верный вариант для пробирки считается из её состояния (M.look): если раньше была ошибка, верна другая запись.
 *
 * step: {
 *   key, test,                                  пробирки — ctx.state.b[key]
 *   options: ['ring', 'mixed', …]               коды из M.OBS[test] (код фактического наблюдения добавляется сам)
 *   saveAs: 'trommerHot'                        → state.res[saveAs][sug] = { code, sign, cell }
 *   anomalies: { code: { severity, text, whatif?, only?: [sug], when?(S, tube) } }   замечание, если в пробирке получилась искажённая картина
 *   misread: { tubeSug: { code: { severity, text } } } тяжесть неверной записи (по умолчанию minor 0,5)
 *   onDone(state, ctx)
 * }
 */
import { h } from '../../../app/dom.js';
import { tr, L } from '../../../app/i18n.js';
import { questionBlock } from '../../../app/steps/_common.js';
import { benchOf, benchScene, envOf } from './bench.js';
import * as M from '../model.js';

export default {
  type: 'lab15-record',
  init(step, ctx) { ctx.local.m = {}; },
  render(step, ctx) {
    const S = ctx.state, b = benchOf(S, step.key), env = envOf(S);
    const wrap = h('div', { class: 'wfull' });
    const base = M.OBS[step.test];
    // код без описания (например, реактивы не внесены) — «изменений нет», а не ошибка
    const NONE = { sign: '−', label: () => L('изменений нет — реактивы не внесены', 'өзгеріс жоқ — реактивтер қосылмаған', 'no change — the reagents were not added') };
    const obs = new Proxy(base, { get: (o, k) => o[k] || NONE });
    const done = () => b.tubes.every((t) => ctx.local.m[t.id] && ctx.local.m[t.id].right != null);
    const check = () => {
      const k = b.tubes.filter((t) => ctx.local.m[t.id] && ctx.local.m[t.id].right != null).length;
      ctx.readouts([{ label: L('Записано', 'Жазылды', 'Recorded'), value: `${k} / ${b.tubes.length}`, st: k === b.tubes.length ? 'ok' : '' }]);
      if (done() && !ctx.solved()) {
        S.res = S.res || {};
        if (step.saveAs) S.res[step.saveAs] = Object.fromEntries(b.tubes.map((t) => { const d = M.describe(step.test, t, env); return [t.label ? t.id : t.sug, { code: d.code, sign: d.sign, cell: d.cell, tApp: t.tApp }]; }));
        if (step.onDone) step.onDone(S, ctx);
        ctx.solve(step.doneText || L('Наблюдения записаны в журнал.', 'Бақылаулар журналға жазылды.', 'The observations are recorded in the notebook.'));
      }
    };
    for (const t of b.tubes) {
      const code = M.look(step.test, t, env).code;
      const codes = step.options.includes(code) ? step.options.slice() : [code, ...step.options];
      const mem = ctx.local.m[t.id] = ctx.local.m[t.id] || {};
      const name = t.label ? { ru: `Пробирка ${t.label}`, kk: `${t.label} пробиркасы`, en: `Tube ${t.label}` } : M.NAME_CAP[t.sug];
      wrap.append(questionBlock({
        q: { ru: `<b>${tr(name, 'ru')}</b> — что вы наблюдаете?`, kk: `<b>${tr(name, 'kk')}</b> — не байқайсыз?`, en: `<b>${tr(name, 'en')}</b> — what do you observe?` },
        options: codes.map((c) => ({ label: obs[c].label(t) })),
        correct: codes.indexOf(code),
        why: step.why ? step.why(t, code, S) : null,
        onWrong: (i) => {
          const w = ((step.misread || {})[t.sug] || {})[codes[i]] || {};
          ctx.remark({ key: `rec-${step.saveAs || ctx.stepIndex}-${t.id}`, severity: w.severity || 'minor', points: w.points, text: w.text || { ru: `неточная запись наблюдения: ${tr(name, 'ru').toLowerCase()}`, kk: `бақылаудың дәл емес жазбасы: ${tr(name, 'kk').toLowerCase()}`, en: `inaccurate record of the observation: ${tr(name, 'en').toLowerCase()}` } });
          ctx.save();
        },
        onRight: () => {
          ctx.log({ ru: `${tr(name, 'ru')}: ${tr(obs[code].label(t), 'ru')}`, kk: `${tr(name, 'kk')}: ${tr(obs[code].label(t), 'kk')}`, en: `${tr(name, 'en')}: ${tr(obs[code].label(t), 'en')}` }, 'obs');
          const an = (step.anomalies || {})[code];
          if (an && (!an.only || an.only.includes(t.sug)) && (!an.when || an.when(S, t))) ctx.remark({ key: `anom-${step.saveAs}-${code}`, severity: an.severity || 'major', text: an.text, whatif: an.whatif, effect: an.effect });
          ctx.save(); check();
        },
      }, mem, ctx.rng));
    }
    setTimeout(check);
    return wrap;
  },
  scene(step, ctx) { return benchScene(ctx.state, step.key, { baths: step.baths || [] }); },
  hints(step, ctx) {
    const S = ctx.state, b = benchOf(S, step.key), env = envOf(S);
    const t = b.tubes.find((x) => !(ctx.local.m[x.id] && ctx.local.m[x.id].right != null)) || b.tubes[0];
    const code = M.look(step.test, t, env).code;
    const name = t.label ? { ru: `Пробирка ${t.label}`, kk: `${t.label} пробиркасы`, en: `Tube ${t.label}` } : M.NAME_CAP[t.sug];
    return [
      L('Смотрите на стенд, а не на ожидаемый по теории результат: записывают то, что видно в пробирке, — цвет, осадок, зеркало, время появления.', 'Теориядағы күтілетін нәтижеге емес, стендке қараңыз: пробиркада көрінетінді жазады — түсі, тұнба, айна, пайда болу уақыты.', 'Look at the bench, not at the result you expect from theory: record what is actually in the tube — colour, precipitate, mirror, time of appearance.'),
      L('Если раньше в пробе была ошибка, картина может отличаться от описанной в методичке — так её и запишите.', 'Егер сынамада бұрын қате болса, көрініс әдістемедегіден өзгеше болуы мүмкін — солай жазыңыз.', 'If there was a mistake earlier, the picture may differ from the manual — record it as it is.'),
      { ru: `${tr(name, 'ru')}: ${tr(M.OBS[step.test][code].label(t), 'ru')}`, kk: `${tr(name, 'kk')}: ${tr(M.OBS[step.test][code].label(t), 'kk')}`, en: `${tr(name, 'en')}: ${tr(M.OBS[step.test][code].label(t), 'en')}` },
    ];
  },
};
