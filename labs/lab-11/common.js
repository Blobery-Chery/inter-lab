/** Общие помощники опытов работы № 11: подписи веществ, баня, кнопка «записать наблюдение». */
import { L, n } from '../../app/i18n.js';
import { bathStep, eggLook } from './model.js';

export const SUB = {
  egg: L('раствор яичного белка', 'жұмыртқа ақуызының ерітіндісі', 'egg white solution'),
  gel: L('1 % раствор желатина', '1 % желатин ерітіндісі', '1 % gelatin solution'),
  gly: L('1 % раствор глицина', '1 % глицин ерітіндісі', '1 % glycine solution'),
};
export const TUBE = {
  egg: L('белок', 'ақуыз', 'egg white'),
  gel: L('желатин', 'желатин', 'gelatin'),
  gly: L('глицин', 'глицин', 'glycine'),
};

/** Лабораторное время идёт — баня на включённой плитке греется дальше. Вызывать один раз на действие. */
export function warmBath(S, sec) {
  if (S.bath) S.bath.T = bathStep(S.bath.T, S.bath.on !== false, sec);
}

/** Начальный вид пробирки с раствором белка с учётом того, как его приготовили (опыт 1). */
export function eggInit(prep, v) {
  const e = eggLook(prep);
  return { v, color: e.color, ppt: e.ppt, pptColor: e.pptColor };
}

/** Текст «как приготовлен раствор белка» для журнала. */
export function prepNote(prep) {
  if (prep === 'nofilter') return L(' (раствор мутный — не отфильтрован через марлю)', ' (ерітінді лайлы — дәке арқылы сүзілмеген)', ' (the solution is turbid — it was not filtered through gauze)');
  if (prep === 'conc') return L(' (взят неразбавленный белок — густой, вязкий)', ' (сұйылтылмаған ақуыз алынды — қою, тұтқыр)', ' (undiluted egg white was used — thick and viscous)');
  return L('', '', '');
}

/** Склейка тройки из частей: cat(L(…), L(…)) */
export function cat(...parts) {
  const out = { ru: '', kk: '', en: '' };
  for (const p of parts) for (const k of ['ru', 'kk', 'en']) out[k] += typeof p === 'string' ? p : p[k];
  return out;
}

/** Кнопка «Пробы готовы — записать наблюдение» для шага test (done проверяет local.ready). */
export function readyBtn(check, label) {
  return {
    id: 'ready', target: 'sel', group: L('Наблюдение', 'Бақылау', 'Observation'),
    label: label || L('Пробы готовы — записать наблюдение', 'Сынамалар дайын — бақылауды жазу', 'Tests ready — record the observation'),
    apply(t, S, ctx, id, local) {
      const why = check(local.tubes, S);
      if (why) { ctx.feedback(why, 'warn'); return; }
      local.ready = true;
    },
  };
}

/** Капли: «+1 кап.» на трёх языках. */
export const drops = (k) => L(`+${k} кап.`, `+${k} тамшы`, `+${k} ${k > 1 ? 'drops' : 'drop'}`);
export const mL = (v) => L(`${n(v, 1)} мл`, `${n(v, 1)} мл`, `${n(v, 1)} mL`);
