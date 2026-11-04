// Модель работы 13: конформации, R/S, растворимость, изомеризация, выход, спектры — на данных методички.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ethaneE, butaneE, conformerOf, dG_Me, lowFraction, rsOf, parity, rotV, rotH, mirror, swap, fischerOf,
  solFum, solMal, dissolvedFrac, malMp, kIso, cHCl, boilT, C_REF, makeProduct, theoretical, percentYield,
  lossBreakdown, productHeating, washPH, cinnamicLines, jFromLines, configFromJ, CINNAMIC, octeneBands, irT, IR_DIAG,
} from '../labs/lab-13/model.js';
import lab from '../labs/lab-13/lab.js';

const near = (a, b, tol) => Math.abs(a - b) <= tol;
const PRIO = ['OH', 'C2H5', 'CH3', 'H'];

test('этан: заслонённая на 12 кДж/моль выше заторможенной', () => {
  assert.ok(near(ethaneE(0) - ethaneE(60), 12, 1e-9));
  assert.equal(conformerOf('ethane', 60), 'staggered');
  assert.equal(conformerOf('ethane', 120), 'eclipsed');
  assert.equal(conformerOf('ethane', 30), null);
});

test('бутан: анти < гош (3,8 кДж/моль) < заслонённая < полностью заслонённая', () => {
  assert.ok(near(butaneE(60) - butaneE(180), 3.8, 1e-9));
  assert.ok(butaneE(180) < butaneE(60) && butaneE(60) < butaneE(120) && butaneE(120) < butaneE(0));
  assert.equal(conformerOf('butane', 180), 'anti');
  assert.equal(conformerOf('butane', 300), 'gauche');
  assert.equal(conformerOf('butane', 240), 'eclipsed');
  assert.equal(conformerOf('butane', 0), 'syn');
});

test('метилциклогексан: 95 % экваториального ↔ ΔG ≈ 7,3 кДж/моль', () => {
  assert.ok(near(dG_Me, 7.30, 0.01));
  assert.ok(near(lowFraction(dG_Me), 0.95, 1e-9));
});

test('R/S бутан-2-ола: перестановка двух групп меняет конфигурацию, повороты — нет', () => {
  const A = ['OH', 'CH3', 'C2H5', 'H']; // OH вверху, CH3 слева, C2H5 на клине, H на пунктире → по часовой → R
  assert.equal(rsOf(A, PRIO), 'R');
  assert.equal(rsOf(mirror(A), PRIO), 'S');
  assert.equal(rsOf(swap(A, 0, 1), PRIO), 'S');
  assert.equal(rsOf(rotV(A), PRIO), 'R');
  assert.equal(rsOf(rotH(A), PRIO), 'R');
  assert.equal(rsOf(rotV(rotH(rotV(A))), PRIO), 'R');
  // чётность связана с конфигурацией однозначно
  const ref = ['OH', 'CH3', 'C2H5', 'H'];
  for (const p of [A, mirror(A), rotV(A), swap(A, 1, 3)]) assert.equal(parity(p, ref) === 0, rsOf(p, PRIO) === 'R');
});

test('проекция Фишера (R)-бутан-2-ола: CH₃ вверху, C₂H₅ внизу, OH слева', () => {
  assert.deepEqual(fischerOf('R'), { left: 'OH', right: 'H' });
  assert.deepEqual(fischerOf('S'), { left: 'H', right: 'OH' });
});

test('растворимость: малеиновая ≈ 78 г/100 мл, фумаровая ≈ 0,6 г/100 мл (методичка)', () => {
  assert.ok(near(solMal(25) * 100, 78, 0.5));
  assert.ok(near(solFum(25) * 100, 0.63, 0.05));
  assert.equal(dissolvedFrac(0.2, 1, 18, 'mal'), 1);
  assert.ok(dissolvedFrac(0.2, 1, 18, 'fum') < 0.05);
  assert.ok(dissolvedFrac(0.2, 1, 80, 'fum') > dissolvedFrac(0.2, 1, 18, 'fum') * 5, 'в горячей воде фумаровая растворяется заметно лучше');
});

test('т. пл. малеиновой кислоты в интервале методички 130–135 °C', () => {
  const m = malMp(0, 2.5, true);
  assert.ok(m.on >= 130 && m.end <= 135, JSON.stringify(m));
  assert.ok(malMp(0, 4, false).end > m.end);
});

test('изомеризация: 15–20 мин кипячения → 85–95 % превращения; меньше HCl — медленнее', () => {
  const c = cHCl(4, 4, 2), Tb = boilT(c);
  assert.ok(near(c, C_REF, 1e-12));
  const X = (t, k) => 1 - Math.exp(-k * t);
  assert.ok(X(900, kIso(Tb, c)) > 0.85 && X(900, kIso(Tb, c)) < 0.92);
  assert.ok(X(1200, kIso(Tb, c)) > 0.92);
  assert.ok(kIso(Tb, cHCl(2, 4, 2)) < kIso(Tb, c));
  assert.ok(kIso(60, c) < kIso(Tb, c) / 20, 'без кипения изомеризация почти не идёт');
});

const prod = (o = {}) => makeProduct({ mMal: 2.0, X: 0.9, Vmix: 8, Tfilt: 3, washes: 3, lossMech: 0.06, ...o });

test('теоретический выход из 2,0 г = 2,0 г (молярная масса не меняется)', () => {
  assert.equal(theoretical(2.0).toFixed(2), '2.00');
  assert.equal(percentYield(1.5, 2.0).toFixed(1), '75.0');
});

test('всё верно → выход 60–95 %, продукт не плавится ниже 200 °C', () => {
  const P = prod();
  const y = percentYield(P.m, 2.0);
  assert.ok(y > 60 && y < 95, 'выход ' + y);
  assert.equal(productHeating(P).sinter, null);
});

test('короткое кипячение без промывки → меньше выход и примесь малеиновой кислоты (отложенное последствие)', () => {
  const ok = prod(), bad = prod({ X: 0.45, washes: 0 });
  assert.ok(bad.mFum < ok.mFum);
  assert.ok(bad.mMalImp > ok.mMalImp * 5);
  assert.ok(productHeating(bad).sinter > 110 && productHeating(bad).sinter < 135);
});

test('тёплая вода и этанол при промывании уносят продукт', () => {
  assert.ok(prod({ warmW: 2, washes: 1 }).mFum < prod().mFum);
  assert.ok(prod({ etOH: 2, washes: 1 }).mFum < prod().mFum);
});

test('промывные воды: от сильнокислых к pH ≈ 2', () => {
  assert.ok(washPH(0) < 0.5 && washPH(4) > 1.8 && washPH(10) < 2.2);
});

test('диаграмма потерь: сумма долей = 1', () => {
  const S = { mMal: 2.0, X: 0.9 };
  const parts = lossBreakdown(S, prod());
  assert.ok(near(parts.reduce((a, p) => a + p.frac, 0), 1, 1e-9));
  assert.equal(parts[0].id, 'product');
});

test('ЯМР коричных кислот: J по линиям дублета = 16,0 и 12,7 Гц (методичка)', () => {
  for (const iso of ['E', 'Z']) {
    const L4 = cinnamicLines(iso);
    assert.ok(near(jFromLines(L4[0].d, L4[1].d), CINNAMIC[iso].J, 0.05));
    assert.equal(configFromJ(jFromLines(L4[2].d, L4[3].d)), iso);
  }
});

test('ИК окт-4-енов: сильная полоса при 965 (транс) или 690 см⁻¹ (цис)', () => {
  for (const iso of ['trans', 'cis']) {
    const b = octeneBands(iso);
    assert.ok(irT(b, IR_DIAG[iso]) < 50, iso);
    assert.ok(irT(b, IR_DIAG[iso === 'trans' ? 'cis' : 'trans']) > 80, iso);
  }
});

test('работа 13 готова: 4 опыта по методичке, допуск ≥ 15, свои типы шагов подключены', () => {
  assert.equal(lab.status, 'ready');
  assert.deepEqual(lab.experiments.map((e) => e.id), ['1', '2', '3', '4']);
  assert.ok(lab.admission.bank.length >= 15);
  assert.equal(lab.customSteps.length, 4);
  const types = new Set(lab.experiments.flatMap((e) => e.steps.map((s) => s.type)));
  for (const t of ['lab13-rotor', 'lab13-chair', 'lab13-stereo', 'lab13-spectrum']) assert.ok(types.has(t), t);
  // минимум последствий (SPEC, раздел 6): critical есть в опыте 3
  const src = JSON.stringify(lab.experiments[2], (k, v) => (typeof v === 'function' ? v.toString() : v));
  assert.ok((src.match(/critical/g) || []).length >= 3);
});

test('казахские фразы работы 13 не совпадают с русскими', () => {
  const same = [], seen = new Set();
  (function w(x, p) {
    if (!x || typeof x !== 'object' || seen.has(x)) return; seen.add(x);
    if ('ru' in x && 'kk' in x && typeof x.ru === 'string') { if ((x.ru.match(/[а-яё]{3,}/gi) || []).length >= 4 && x.ru === x.kk) same.push(p + ': ' + x.ru.slice(0, 40)); return; }
    for (const [k, v] of Object.entries(x)) w(v, p + '.' + k);
  })(lab, 'lab');
  assert.deepEqual(same, []);
});
