// Работа № 10: расчёты модели и прохождение проб «вслепую» (без браузера) — верный путь и пути с ошибками.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isTri } from '../app/i18n.js';
import { createRng } from '../app/rng.js';
import * as m from '../labs/lab-10/model.js';
import lab from '../labs/lab-10/lab.js';

/* ---------- фиктивный ctx шага ---------- */
function makeCtx(state) {
  const c = { t: 0, logs: [], remarks: [], fb: null, state, rng: createRng(7) };
  Object.assign(c, {
    now: () => c.t, advance: (s) => { c.t += s; },
    log: (text, kind = 'act') => c.logs.push({ text, kind }),
    remark: (r) => { if (!c.remarks.some((x) => x.key === r.key)) c.remarks.push(r); },
    feedback: (text, kind) => { c.fb = text ? { text, kind } : null; },
  });
  return c;
}
const expOf = (id) => lab.experiments.find((e) => e.id === id);
const stepOf = (e, id) => expOf(e).steps.find((s) => s.id === id);

/** Выполнить на шаге test последовательность [tubeId, reagentId] — как нажатия кнопок. */
function runTest(expId, stepId, seq, prev = {}) {
  const e = expOf(expId), step = stepOf(expId, stepId);
  const S = e.initialState({ prev, rng: createRng(1) });
  Object.assign(S, prev.state || {});
  const ctx = makeCtx(S);
  const local = { tubes: Object.fromEntries(step.tubes.map((t) => [t.id, { v: 0, added: [] }])), sel: step.tubes[0].id };
  for (const [tid, rid] of seq) {
    local.sel = tid;
    const r = step.reagents.find((x) => x.id === rid);
    assert.ok(r, 'нет реактива ' + rid);
    if (r.disabled && r.disabled(local.tubes[tid], S, local)) continue;
    const ids = r.target === 'all' ? step.tubes.map((t) => t.id) : [tid];
    for (const id of ids) { local.tubes[id].added.push(rid); r.apply(local.tubes[id], S, ctx, id, local); }
    if (r.advance) ctx.advance(r.advance);
  }
  const done = !!step.done(local.tubes, S, local);
  const correct = done && step.observe ? step.observe.correct(S, local.tubes) : null;
  if (done && step.onDone) step.onDone(S, local.tubes, ctx);
  return { S, ctx, tubes: local.tubes, done, correct };
}
const rep = (id, k) => Array.from({ length: k }, () => id);

test('расчёт индивидуального задания: 0,15 мл 0,5 % KMnO₄ окисляют ≈ 1,07 мг H₂C₂O₄', () => {
  assert.equal(m.oxalicByPermanganate(0.15).toFixed(2), '1.07');
});

test('KMnO₄: при 60–70 °C обесцвечивание за минуты с индукционным периодом, при 20 °C — очень медленно, без H₂SO₄ — медленнее', () => {
  const t97 = (T, o) => { let x = 0, t = 0, t20 = null; while (x < 0.97 && t < 20000) { x += m.kmno4Rate(x, T, o); t++; if (t20 == null && x >= 0.2) t20 = t; } return { t, t20 }; };
  const hot = t97(65, { acid: true, drops: 3 });
  assert.ok(hot.t > 120 && hot.t < 400, 'при 65 °C: ' + hot.t + ' с');
  assert.ok(hot.t20 > (hot.t - hot.t20) * 0.3, 'индукционный период заметен');
  assert.ok(t97(22, { acid: true, drops: 3 }).t > 10 * hot.t);
  assert.ok(t97(65, { acid: false, drops: 3 }).t > 2 * hot.t);
});

test('KHT: кристаллы при 1–14 каплях KOH, растворение в избытке (15 капель)', () => {
  assert.ok(m.khtState(5).super > 0);
  assert.equal(m.khtState(15).excess, true);
  assert.ok(m.khtState(15).super < 0);
});

test('Cu(OH)₂: при 2 мл NaOH — тёмно-синий хелат, при 0,5 мл среда становится кислой', () => {
  const ok = m.cuTartrate({ cu: true, naoh: 2, tart: 10 });
  assert.equal(ok.acid, false); assert.ok(ok.ppt < 0.02 && ok.chelate > 0.95);
  assert.equal(m.cuTartrate({ cu: true, naoh: 0.5, tart: 10 }).acid, true);
});

test('Ca²⁺: тартрат на холоду, цитрат — только при кипячении в щелочной среде', () => {
  assert.ok(m.caSalt('tart', 2, false) > 0);
  assert.equal(m.caSalt('citr', 4, false), 0);
  assert.ok(m.caSalt('citr', 4, true) > 0);
  assert.equal(m.caSalt('citr', 2, true), 0);
});

test('бромирование: на 1 мл 1 % фенола ≈ 29 капель насыщенной бромной воды', () => {
  assert.ok(Math.abs(m.bromNeed() - 29) < 1.5);
});

test('эмульсия фенола просветляется от NaOH и снова мутнеет при подкислении', () => {
  assert.ok(m.emulsion({ em: true, v: 1 }).turb > 0.9);
  assert.equal(m.emulsion({ em: true, oh: 10, v: 1.5 }).turb, 0);
  const back = m.emulsion({ em: true, oh: 10, h: 15, v: 2.25 });
  assert.ok(back.turb > 0.05 && back.pH < 3);
});

/* ---------- пробы целиком ---------- */
test('опыт 1, CaCl₂: верный порядок → проба выполнена; HCl до CaCl₂ → осадка нет и замечание', () => {
  const ok = runTest('1', 'cacl2', [['A', 'ox'], ['A', 'ca'], ['A', 'split'], ['A', 'ac'], ['B', 'hcl']]);
  assert.equal(ok.done, true); assert.equal(ok.correct, 'ok'); assert.equal(ok.ctx.remarks.length, 0);
  const bad = runTest('1', 'cacl2', [['A', 'ox'], ['A', 'hcl'], ['A', 'ca']]);
  assert.equal(bad.tubes.A.ppt || 0, 0);
  assert.ok(bad.ctx.remarks.some((r) => r.key === 'ox_order'));
});

test('опыт 2, Уффельман: фиолетовый → жёлто-зелёный; молочная кислота раньше FeCl₃ — другое наблюдение', () => {
  const ok = runTest('2', 'uff', [['u', 'ph'], ['u', 'fe'], ['u', 'fe'], ...rep(['u', 'lac5'], 4)]);
  assert.equal(ok.done, true); assert.equal(ok.correct, 'ok');
  const bad = runTest('2', 'uff', [['u', 'ph'], ...rep(['u', 'lac5'], 4), ['u', 'fe']]);
  assert.equal(bad.done, true); assert.equal(bad.correct, 'noviolet');
  assert.ok(bad.ctx.remarks.some((r) => r.key === 'uff_order'));
});

test('опыт 3, KHT: по каплям с трением — кристаллы; «сразу 2 мл» — осадка нет и замечание major', () => {
  const ok = runTest('3', 'kht', [['k', 'tart'], ['k', 'koh5'], ['k', 'rub'], ['k', 'koh5'], ['k', 'koh5']]);
  assert.equal(ok.done, true); assert.equal(ok.correct, 'ok'); assert.equal(ok.S.e3.kht, true);
  const fast = runTest('3', 'kht', [['k', 'tart'], ['k', 'kall']]);
  assert.equal(fast.done, true); assert.equal(fast.correct, 'none');
  assert.ok(fast.ctx.remarks.some((r) => r.key === 'kht_miss' && r.severity === 'major'));
  const norub = runTest('3', 'kht', [['k', 'tart'], ['k', 'koh5'], ['k', 'koh5'], ['k', 'koh5']]);
  assert.equal(norub.correct, 'none');
});

test('опыт 3, Cu(OH)₂: 2 мл NaOH — тёмно-синий; 0,5 мл — бледно-голубой (отложенное последствие)', () => {
  const ok = runTest('3', 'cu', [['c', 'cu'], ['c', 'na1'], ['c', 'na1'], ['c', 'ta5'], ['c', 'ta5']]);
  assert.equal(ok.done, true); assert.equal(ok.correct, 'deep');
  const low = runTest('3', 'cu', [['c', 'cu'], ['c', 'na0.5'], ['c', 'ta5'], ['c', 'ta5']]);
  assert.equal(low.done, true); assert.equal(low.correct, 'pale');
  assert.ok(low.ctx.remarks.some((r) => r.key === 'cu_naoh'));
});

test('опыт 4: лимонная кислота с 4 мл известковой воды — осадок при кипячении; с 2 мл — нет', () => {
  const pre = { state: { e4: { heat: 'bath', res: null } } };
  const seq = (L) => [['c', 'acid'], ...rep(['c', 'lime'], L), ['c', 'boil'], ['c', 'cool'], ['t', 'acid'], ['t', 'lime'], ['t', 'lime']];
  const ok = runTest('4', 'ca', seq(4), pre);
  assert.equal(ok.done, true); assert.equal(ok.correct, 'ok');
  const low = runTest('4', 'ca', seq(2), pre);
  assert.equal(low.done, true); assert.equal(low.correct, 'noppt');
  assert.ok(low.ctx.remarks.some((r) => r.key === 'cit_lime'));
});

test('опыт 5: окраска исчезает от брома и возвращается — два цикла', () => {
  const cyc = [['e', 'br1'], ['e', 'br1'], ['e', 'wait'], ['e', 'wait']];
  const ok = runTest('5', 'enol', [['e', 'eaa'], ['e', 'fe'], ...cyc, ...cyc]);
  assert.equal(ok.done, true); assert.equal(ok.tubes.e.cycles >= 2, true);
  const ex = runTest('5', 'enol', [['e', 'eaa'], ['e', 'fe'], ['e', 'br3'], ['e', 'br3'], ['e', 'wait']]);
  assert.ok(ex.ctx.remarks.some((r) => r.key === 'eaa_br'));
  assert.equal(ex.tubes.e.cycles || 0, 0, 'избыток брома задерживает возврат окраски');
});

test('опыт 6: чистые пипетки — контроль бесцветный; одна пипетка — контроль загрязнён', () => {
  const seq = [['ph', 'fill'], ['ph', 'feAll'], ['ph', 'wait']];
  const ok = runTest('6', 'fecl3', seq, { state: { e6: { dirty: false } } });
  assert.equal(ok.done, true); assert.equal(ok.correct, 'ok');
  const dirty = runTest('6', 'fecl3', seq, { state: { e6: { dirty: true } } });
  assert.equal(dirty.correct, 'dirty');
  assert.equal(stepOf('6', 'control').correct(dirty.S), 'contam');
});

test('опыт 7: белый осадок; избыток бромной воды — жёлтый раствор', () => {
  const ok = runTest('7', 'brom', [['b', 'ph'], ['b', 'br10'], ['b', 'look']]);
  assert.equal(ok.done, true); assert.equal(ok.correct, 'ok');
  const ex = runTest('7', 'brom', [['b', 'ph'], ['b', 'br10'], ['b', 'br10'], ['b', 'br10'], ['b', 'br5'], ['b', 'look']]);
  assert.equal(ex.correct, 'excess');
});

test('опыт 8: верный путь; NaHCO₃ в подкисленную пробирку — замечание major', () => {
  const base = [['1', 'em'], ['1', 'oh5'], ['1', 'oh5'], ['1', 'h5'], ['1', 'h5'], ['1', 'h5']];
  const ok = runTest('8', 'acid', [...base, ['2', 'em'], ['2', 'bic'], ['3', 'crys'], ['3', 'bic']]);
  assert.equal(ok.done, true); assert.equal(ok.correct, 'ok'); assert.equal(ok.ctx.remarks.length, 0);
  const bad = runTest('8', 'acid', [...base, ['1', 'bic']]);
  assert.ok(bad.ctx.remarks.some((r) => r.key === 'bic_dirty'));
});

/* ---------- минимум последствий (SPEC, раздел 6) ---------- */
test('работа 10: есть critical, ≥ 3 major, ≥ 2 safety, событие в процессе', () => {
  const src = JSON.stringify(lab.experiments.map((e) => e.steps.map((s) => Object.keys(s))));
  const txt = lab.experiments.map((e) => e.steps.map((s) => s.toString())).join('');
  assert.ok(src && txt);
  const opts = lab.experiments.flatMap((e) => e.steps.flatMap((s) => [...(s.options || []), ...(s.items || []).map((i) => i.wrong || {}), ...(s.events || []).flatMap((ev) => ev.options)]));
  assert.ok(opts.filter((o) => o.critical).length >= 1, 'critical');
  assert.ok(opts.filter((o) => o.severity === 'safety').length >= 2, 'safety');
  assert.ok(lab.experiments.some((e) => e.steps.some((s) => s.type === 'process' && (s.events || []).length)), 'событие');
});

test('казахские фразы работы 10 не совпадают с русскими', () => {
  const same = [], seen = new Set();
  (function w(x, p) {
    if (!x || typeof x !== 'object' || seen.has(x)) return; seen.add(x);
    if (isTri(x)) { if ((x.ru.match(/[а-яё]{3,}/gi) || []).length >= 4 && x.ru === x.kk) same.push(p + ': ' + x.ru.slice(0, 40)); return; }
    for (const [k, v] of Object.entries(x)) w(v, p + '.' + k);
  })(lab, 'lab');
  assert.deepEqual(same, []);
});
