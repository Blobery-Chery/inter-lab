// Работа 13: сверка с методичкой (сессия C2) — исправленные числа и знаки закреплены тестами.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dG_Me, R_GAS, productHeating, makeProduct, CINNAMIC, configFromJ, M, theoretical } from '../labs/lab-13/model.js';
import lab from '../labs/lab-13/lab.js';

const exp = (id) => lab.experiments.find((e) => e.id === id);
const src = (f) => readFileSync(new URL('../labs/lab-13/' + f, import.meta.url), 'utf8');

test('метилциклогексан: в расчёте G°(акс.) − G°(экв.) = +RT·ln 19 (> 0), а не «ΔG°(акс. → экв.)»', () => {
  const step = exp('1').steps.find((s) => s.id === 'dG');
  const f = step.fields[0];
  assert.ok(f.answer() > 0);
  assert.ok(Math.abs(f.answer() - R_GAS * 298.15 * Math.log(19)) < 1e-12);
  for (const lang of ['ru', 'kk', 'en']) {
    assert.ok(!/→/.test(f.label[lang]), 'подпись не должна называть переход акс. → экв. с положительным ΔG°: ' + f.label[lang]);
    assert.match(step.instr[lang], /−RT·ln K < 0/);
  }
  // в протоколе — R в кДж (8.314·10⁻³), иначе «8.314 × 298.15 × ln 19 = 7.30 кДж/моль» неверно на три порядка
  const line = lab.report.experiments[1].calculations({ dG: dG_Me })[0];
  for (const lang of ['ru', 'kk', 'en']) {
    assert.match(line[lang], /8\.314·10⁻³ × 298\.15 × ln 19/);
    assert.ok(!/акс\. → экв|ax\. → eq/.test(line[lang]));
  }
  assert.ok(Math.abs(8.314e-3 * 298.15 * Math.log(19) - 7.30) < 0.005);
});

test('загрязнённый продукт спекается при 120–130 °C — как написано в шаге идентификации', () => {
  for (const X of [0.3, 0.45, 0.6]) {
    const P = makeProduct({ mMal: 2.0, X, Vmix: 8, Tfilt: 3, washes: 0, lossMech: 0.06 });
    const H = productHeating(P);
    if (H.sinter == null) continue;
    assert.ok(H.sinter >= 120 && H.sinter <= 130, String(H.sinter));
  }
  const s3 = src('exp3.js');
  assert.ok(!s3.includes('125–130'));
  assert.equal((s3.match(/120–130 °C/g) || []).length, 6);
});

test('коричные кислоты: J методички (16,0 и 12,7 Гц), 12,7 Гц честно названо «выше» цис-интервала 6–12 Гц', () => {
  assert.equal(CINNAMIC.E.J, 16.0);
  assert.equal(CINNAMIC.Z.J, 12.7);
  assert.equal(configFromJ(16.0), 'E');
  assert.equal(configFromJ(12.7), 'Z');
  const sp = src('steps/spectrum.js');
  assert.ok(!sp.includes('у верхней границы цис-интервала'));
  assert.ok(!sp.includes('at the upper edge of the cis range'));
});

test('малеиновая/фумаровая кислоты C₄H₄O₄: M = 116,07 г/моль, теоретический выход 2,0 г', () => {
  const m = 4 * 12.011 + 4 * 1.008 + 4 * 15.999;
  assert.ok(Math.abs(m - M.MAL) < 0.01);
  assert.equal(M.MAL, M.FUM);
  assert.ok(Math.abs(theoretical(2.0) - 2.0) < 1e-12);
  // 36 % HCl, d 1,18 → 11,65 моль/л
  assert.ok(Math.abs((1180 * 0.36) / M.HCL - 11.65) < 0.01);
});
