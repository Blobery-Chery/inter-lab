/** Реестр базовых типов шагов. Работа может добавить свои типы через lab.customSteps. */
import checklist from './checklist.js';
import pick from './pick.js';
import assemble from './assemble.js';
import weigh from './weigh.js';
import measure from './measure.js';
import add from './add.js';
import processT from './process.js';
import decide from './decide.js';
import order from './order.js';
import separate from './separate.js';
import test from './test.js';
import observe from './observe.js';
import read from './read.js';
import calc from './calc.js';
import quiz from './quiz.js';
import cleanup from './cleanup.js';

export const BASE_TYPES = Object.fromEntries([checklist, pick, assemble, weigh, measure, add, processT, decide, order, separate, test, observe, read, calc, quiz, cleanup].map((t) => [t.type, t]));

/** Типы для работы: базовые + свои (модули с default export { type, … }). */
export async function typesFor(lab, base = '') {
  const types = { ...BASE_TYPES };
  for (const p of lab.customSteps || []) {
    const mod = await import(new URL(p, lab._url || base).href);
    const t = mod.default;
    if (t && t.type) types[t.type] = t;
  }
  return types;
}
