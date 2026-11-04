// Работа № 15: проверки, закрепляющие исправления сверки с методичкой и правилами ТБ (сессия C2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../labs/lab-15/model.js';
import exp1 from '../labs/lab-15/exp1.js';
import exp4 from '../labs/lab-15/exp4.js';

const nums = (s) => (String(s).replace(/[₀-₉⁰-⁹]/g, '').match(/\d+(?:[.,]\d+)?/g) || []).map((x) => x.replace(',', '.')).join(' ');

test('подписи наблюдений: числа (минуты) одинаковы в ru, kk, en — и без времени, и со временем', () => {
  for (const [tst, o] of Object.entries(M.OBS)) {
    for (const [code, d] of Object.entries(o)) {
      for (const tube of [{}, { tApp: 125, tPink: 300 }]) {
        for (const f of ['label', 'cell']) {
          const x = d[f](tube);
          assert.equal(nums(x.kk), nums(x.ru), `${tst}.${code}.${f} kk`);
          assert.equal(nums(x.en), nums(x.ru), `${tst}.${code}.${f} en`);
        }
      }
    }
  }
});

test('Барфёд: поздний осадок дисахарида без отметки времени подписан как «≈ 11 мин», а не «2–3 мин»', () => {
  const d = M.OBS.barfoed.late;
  for (const lng of ['ru', 'kk', 'en']) {
    assert.match(d.label({})[lng], /11/, lng);
    assert.doesNotMatch(d.label({})[lng], /2–3/, lng);
    assert.doesNotMatch(d.cell({})[lng], /2–3/, lng);
  }
});

test('ссылки на правила ТБ: вкус — п. 2.5, раздельный сбор отходов — п. 10.1', () => {
  const taste = exp1.steps[0].items.find((i) => i.id === 'taste').wrong.text;
  assert.match(taste.ru, /п\. 2\.5 правил ТБ/);
  assert.match(taste.kk, /2\.5-тармағы/);
  assert.match(taste.en, /safety rule 2\.5/);
  const sink = exp4.steps.find((s) => s.id === 'dispose').options.find((o) => o.id === 'sink').remark;
  assert.match(sink.ru, /п\. 10\.1 правил ТБ/);
  assert.match(sink.en, /safety rule 10\.1/);
});

test('kk: «deep-blue» хелат/раствор переведён как «қанық көк» (не «ашық көк» — светло-синий)', () => {
  const ch = M.OBS.trommer.chelate.label({});
  assert.match(ch.kk, /қанық көк/);
  assert.doesNotMatch(ch.kk, /ашық көк/);
});

test('подсказки записи наблюдений не падают, если реактивы не внесены (код без описания, например Фелинг без раствора A)', async () => {
  const rec = (await import('../labs/lab-15/steps/record.js')).default;
  const exp3 = (await import('../labs/lab-15/exp3.js')).default;
  const step = exp3.steps.find((s) => s.type === 'lab15-record');
  const t = Object.assign(M.newTube('glu', 'glu'), { b: 1, sugV: 1 });
  const ctx = { state: { b: { fehling: { test: 'fehling', tubes: [t] } }, clean: true }, local: { m: {} } };
  const h = rec.hints(step, ctx);
  assert.match(h[2].ru, /реактивы не внесены/);
  assert.ok(step.anomalies.none && step.anomalies.none.severity === 'major', 'Фелинг без раствора A — замечание');
});
