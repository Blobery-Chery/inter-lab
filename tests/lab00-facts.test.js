// Вводное занятие (lab-00): факты, исправленные при сверке C1 (правила ТБ, химическая правильность).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isTri } from '../app/i18n.js';
import { ETHANOL_BP } from '../labs/lab-00/model.js';
import { DIST_T } from '../labs/lab-00/exp7.js';

const lab = (await import('../labs/lab-00/lab.js')).default;
const stage = (id) => lab.experiments.find((e) => e.id === id);
const step = (e, id) => stage(e).steps.find((s) => s.id === id);

test('lab-00: показания термометра при перегонке этанола', () => {
  assert.equal(ETHANOL_BP, 78);
  assert.equal(DIST_T.side, 78, 'шарик напротив отвода — т. кип. этанола');
  assert.ok(DIST_T.high < DIST_T.side, 'шарик выше отвода — показание ниже');
  // в жидкости: с кипелкой перегрев 1–3 °C, а не 6 °C (было 84)
  assert.ok(DIST_T.liq > DIST_T.side && DIST_T.liq <= DIST_T.side + 3, `в жидкости ${DIST_T.liq} °C`);
});

test('lab-00: горящий в стакане растворитель — несмешивающийся с водой (эфир, не спирт)', () => {
  const s = step('6', 'beakerFire');
  assert.match(s.instr.ru, /эфир/);
  assert.doesNotMatch(s.instr.ru, /спирт/);
  assert.match(s.instr.en, /ether/);
});

test('lab-00: синтетический халат — без неверного довода о кислотах', () => {
  const o = step('2', 'dress').groups.find((g) => g.id === 'coat').options.find((x) => x.id === 'synth');
  assert.doesNotMatch(o.whatif.ru, /кислот/);
  assert.match(o.whatif.ru, /плавится/);
});

test('lab-00: пролив щёлочи — NaHCO₃ даёт карбонат, раствор остаётся щелочным', () => {
  const o = step('3', 'spillBase').options.find((x) => x.id === 'soda');
  assert.match(o.whatif.ru, /Na₂CO₃/);
  const ok = step('3', 'spillBase').options.find((x) => x.ok);
  assert.match(ok.label.ru, /уксусн|лимонн/);
});

test('lab-00: все видимые строки — три непустых языка', () => {
  const bad = [];
  const seen = new Set();
  (function w(x, p) {
    if (!x || typeof x !== 'object' || seen.has(x)) return; seen.add(x);
    if ('ru' in x || 'kk' in x || 'en' in x) {
      if (!isTri(x) || !['ru', 'kk', 'en'].every((l) => typeof x[l] === 'string' && x[l].trim())) bad.push(p);
      return;
    }
    for (const [k, v] of Object.entries(x)) w(v, p + '.' + k);
  })(lab, 'lab');
  assert.deepEqual(bad, []);
});
