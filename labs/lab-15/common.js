/** Общие части опытов работы № 15: пробирки, внесение растворов сахаров, начальное состояние. */
import { L } from '../../app/i18n.js';
import { kinetics, SUGARS } from './model.js';

export const tubesOf = (list = SUGARS) => list.map((s) => ({ id: s, sug: s }));

const LIST = {
  glu: L('глюкоза', 'глюкоза', 'glucose'), fru: L('фруктоза', 'фруктоза', 'fructose'), suc: L('сахароза', 'сахароза', 'sucrose'), mal: L('мальтоза', 'мальтоза', 'maltose'),
};
const names = (b, lng) => b.tubes.map((t) => LIST[t.sug][lng]).join(', ');

/** Кнопка «внести по V мл растворов сахаров» (каждый своей пипеткой — или общей, если так решили в опыте 1). */
export function sugarReagent(vol, opts = {}) {
  return {
    id: 'sug', group: L('Растворы сахаров (1–5 %)', 'Қант ерітінділері (1–5 %)', 'Sugar solutions (1–5 %)'),
    label: opts.label || L(`Внести по ${vol} мл раствора сахара`, `Әрқайсысына ${vol} мл қант ерітіндісін салу`, `Add ${vol} mL of sugar solution to each`),
    target: 'all', advance: 60,
    disabled: (S, b) => b.tubes.every((t) => t.sugV > 0),
    when: (t) => (t.sugV > 0 ? L('Растворы сахаров уже внесены.', 'Қант ерітінділері салынды.', 'The sugar solutions are already in.') : (opts.when ? opts.when(t) : null)),
    apply(t, S) { t.sugV = vol; t.v = (t.v || 0) + vol; if (S.cross && t.sug === 'suc') { t.cross = true; t.weak = true; } },
    log: (S, b) => L(`В пробирки внесено по ${vol} мл растворов (${names(b, 'ru')}) — ${S.cross ? 'одной и той же пипеткой' : 'каждый своей пипеткой'}`,
      `Пробиркаларға ${vol} мл-ден ерітінділер (${names(b, 'kk')}) салынды — ${S.cross ? 'бір пипеткамен' : 'әрқайсысы өз пипеткасымен'}`,
      `${vol} mL of each solution (${names(b, 'en')}) added to the tubes — ${S.cross ? 'with one and the same pipette' : 'each with its own pipette'}`),
  };
}

/** Начальное состояние опыта: кинетика попытки и решение о пипетках из опыта 1. */
export const baseState = ({ prev, rng }, extra = {}) => ({ kin: kinetics(rng), cross: !!(prev && prev['1'] && prev['1'].cross), crossSeen: Object.values(prev || {}).some((r) => r && r.crossSeen), b: {}, res: {}, clean: true, ...extra });

/** Плашки «Опыт завершён» из res[key]. */
export function cellsSummary(res, key, sugars = SUGARS) {
  const NAMES = { glu: L('Глюкоза', 'Глюкоза', 'Glucose'), fru: L('Фруктоза', 'Фруктоза', 'Fructose'), suc: L('Сахароза', 'Сахароза', 'Sucrose'), mal: L('Мальтоза', 'Мальтоза', 'Maltose') };
  const r = (res.cells || {})[key] || {};
  return sugars.filter((s) => r[s]).map((s) => ({ label: NAMES[s], value: r[s].cell, st: r[s].sign === '+' ? 'ok' : r[s].sign === '?' ? 'warn' : '' }));
}

/** Сахароза ведёт себя как восстанавливающий сахар — значит, раствор загрязнён (общая пипетка, опыт 1). */
export const CROSS = {
  only: ['suc'], when: (S) => !S.crossSeen, effect: (S) => { S.crossSeen = true; },
  text: L('«сахароза» дала положительную пробу на восстанавливающий сахар — растворы загрязнены (общая пипетка)', '«сахароза» тотықсыздандырғыш қантқа оң сынама берді — ерітінділер ластанған (ортақ пипетка)', '“sucrose” gave a positive test for a reducing sugar — the solutions are contaminated (shared pipette)'),
  whatif: L('Чистая сахароза — невосстанавливающий сахар: Cu(II) и Ag(I) она не восстанавливает. Если в её пробирке появился осадок, туда попала глюкоза или фруктоза — например, когда все растворы отмеряли одной пипеткой. Результат пробы с сахарозой недостоверен.', 'Таза сахароза — тотықсыздандырмайтын қант: ол Cu(II) мен Ag(I)-ді тотықсыздандырмайды. Оның пробиркасында тұнба пайда болса, оған глюкоза немесе фруктоза түскен — мысалы, барлық ерітінді бір пипеткамен өлшенгенде. Сахарозамен сынаманың нәтижесі сенімсіз.', 'Pure sucrose is a non-reducing sugar: it does not reduce Cu(II) or Ag(I). If a precipitate appears in its tube, glucose or fructose got in — for example when all the solutions were measured with one pipette. The result for sucrose is unreliable.'),
};
