// Работа 14: исправления сверки с методичкой (сессия C2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { M, DMA_DENSITY, dmaMmol, coupled, theoretical } from '../labs/lab-14/model.js';

test('N,N-диметиланилин: справочная плотность 0,956 г/мл, 1,3 мл = 1,24 г ≈ 10,3 ммоль', () => {
  assert.equal(DMA_DENSITY, 0.956);
  assert.equal((1.3 * DMA_DENSITY).toFixed(2), '1.24');
  assert.equal(dmaMmol(1.3).toFixed(1), '10.3');
  // 1,21 г из методички — 10,0 ммоль
  assert.equal(((1.21 / M.DMA) * 1000).toFixed(1), '10.0');
});

test('молярные массы и теоретический выход по методичке', () => {
  assert.equal(M.SA, 173.19);
  assert.equal(M.MO, 327.33);
  assert.equal(M.DMA, 121.18);
  assert.equal(theoretical(1.73).toFixed(2), '3.27');
});

test('сочетание в сильнокислой среде (ещё 5 мл конц. HCl) снижает выход до 60 % от нормы', () => {
  const S = (medium) => ({ mSA: 1.73, vDMA: 1.3, dz: { conv: 0.95, D: 0 }, cp: { medium, stirred: true, time: 600 } });
  const ok = coupled(S('acid'));
  const strong = coupled(S('strong'));
  const alk = coupled(S('alk'));
  assert.ok(Math.abs(strong / ok - 0.6 / 0.93) < 1e-9, String(strong / ok));
  assert.ok(Math.abs(alk / ok - 0.25 / 0.93) < 1e-9, String(alk / ok));
});
