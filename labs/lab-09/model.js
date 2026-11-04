/**
 * Модель работы № 9 (диазотирование анилина, синтез иодбензола). Чистые функции — тестируются в Node.
 * Из методички: 2,3 мл (2,33 г, 25 ммоль) анилина; 6,5 мл конц. HCl (36 %) + 6,5 мл воды; 1,8 г (26 ммоль) NaNO₂ в 5 мл воды;
 * 4,5 г (27 ммоль) KI в 7 мл воды; 0–5 °C; баня 60–70 °C; фракция 185–190 °C; т. кип. 188 °C; d = 1,83 г/мл;
 * теоретический выход из 25 ммоль анилина — 5,1 г. Всё прочее (кинетика, теплота, потери) — допущения, см. ASSUMPTIONS.md.
 */
export const M = { An: 93.13, NaNO2: 69.0, KI: 166.0, PhI: 204.01, PhOH: 94.11, HCl: 36.46, naphthol: 144.17 };
export const D_PHI = 1.83;      // г/мл, иодбензол (методичка)
export const BP_PHI = 188;      // °C (методичка)

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/** Анилин: ммоль из объёма, мл (по данным методички 2,3 мл = 2,33 г = 25 ммоль). */
export const anilineMmol = (v) => (v * (2.33 / 2.3) / M.An) * 1000;
/** Анилин: масса, г, из объёма. */
export const anilineMass = (v) => v * (2.33 / 2.3);
/** Конц. HCl 36 %, d 1,18: ммоль из объёма, мл. */
export const hclMmol = (v) => (v * 1.18 * 0.36 / M.HCl) * 1000;
export const nitriteMmol = (m) => (m / M.NaNO2) * 1000;
export const kiMmol = (m) => (m / M.KI) * 1000;

/** Теоретический выход иодбензола, г, из количества анилина, ммоль (1 : 1). */
export const theoretical = (nAn) => (nAn * M.PhI) / 1000;
export const percentYield = (m, nAn) => (nAn > 0 ? (m / theoretical(nAn)) * 100 : 0);

/**
 * Скорость разложения катиона диазония водой (гидролиз → фенол + N₂), с⁻¹. Аррениусоподобная аппроксимация:
 * при 0–5 °C — доли процента за занятие, при 60–70 °C — минуты (допущение).
 */
export const kHyd = (T) => 1.5e-6 * Math.exp(0.115 * (T - 5));
/** Скорость замещения диазогруппы на иод в присутствии избытка I⁻, с⁻¹ (допущение). */
export const kIod = (T) => 4e-4 * Math.exp(0.08 * (T - 20));

/** Доля диазония, потерянная за время dt при температуре T (гидролиз). */
export const hydLoss = (T, dt) => 1 - Math.exp(-kHyd(T) * dt);

/**
 * Одна порция раствора нитрита при диазотировании. D — состояние диазотирования:
 * { A — свободный анилин (в виде соли), Dz — диазоний, P — фенол и смолы, N — избыток HNO₂, lostN — HNO₂, ушедшая в NO/NO₂ (все в ммоль) }.
 * dn — ммоль нитрита в порции, T — температура смеси, °C.
 * При T > 5 °C часть HNO₂ разлагается (бурые пары), часть образовавшегося диазония сразу разлагается (допущение).
 */
export function nitriteDrop(D, dn, T) {
  const fHot = clamp((T - 5) * 0.025, 0, 0.5);
  D.added = (D.added || 0) + dn;
  const lost = dn * fHot;
  D.lostN += lost;
  let eff = dn - lost;
  const react = Math.min(D.A, eff);
  D.A -= react; eff -= react;
  const dec = react * fHot * 0.6;
  D.Dz += react - dec; D.P += dec;
  D.N += eff;
  return D;
}

/** Иодкрахмальная бумага: синеет сразу, если в смеси есть избыток азотистой кислоты (ммоль). */
export const starchIodide = (N) => (N > 0.05 ? 'blue' : N > 0.01 ? 'faint' : 'none');

/**
 * Доля диазония, которая сочетается со свободным анилином (диазоаминобензол, жёлтый осадок) при недостатке кислоты.
 * r — эквиваленты HCl на 1 моль анилина. При r ≥ 2,5 сочетания нет (методичка: 2,5–3 экв.).
 */
export const couplingFrac = (r) => clamp((2.5 - r) * 0.35, 0, 0.5);

/**
 * Свободная сильная кислота (ммоль H⁺) в смеси после замещения: HCl минус израсходованная на соль анилина и на HNO₂,
 * плюс HCl от гидролиза (на каждый фенол — 1 HCl).
 */
export function freeAcid(nHCl, nAn, nNO2used, nPhenol) {
  return Math.max(0, nHCl - nAn - nNO2used + nPhenol);
}

/** 10 % NaOH: ммоль в 1 мл (d 1,11). */
export const NAOH_PER_ML = (1.11 * 0.1 / 40) * 1000;

/**
 * pH смеси после подщелачивания: vNaOH мл 10 % NaOH, H — свободная кислота, P — фенол (ммоль), V — объём, мл.
 * Грубая модель: до нейтрализации — кислая, затем фенол (pKa 10) буферизует, потом избыток щёлочи.
 */
export function alkaliPH(vNaOH, H, P, V) {
  const OH = vNaOH * NAOH_PER_ML;
  if (OH < H) return clamp(-Math.log10((H - OH) / (V + vNaOH)), 0, 7);
  const ex = OH - H;
  if (ex < P) { const ratio = Math.max(1e-3, ex / Math.max(1e-6, P - ex)); return clamp(10 + Math.log10(ratio), 7, 12); }
  const c = (ex - P) / (V + vNaOH);
  return clamp(14 + Math.log10(Math.max(1e-4, c)), 12, 14);
}

/** Доля фенола, остающаяся в органическом слое, по pH водного слоя (фенолят натрия — в воде). */
export const phenolInOrg = (pH) => (pH >= 12 ? 0.03 : pH >= 10 ? 0.35 : pH >= 8 ? 0.7 : 0.85);

/**
 * Температура кипения смеси в перегонной колбе (показание термометра у отвода, °C) по составу оставшейся жидкости, г.
 * Вода (влажный продукт) отгоняется первой как гетероазеотроп (~98 °C), затем фенол (182 °C) с иодбензолом (188 °C).
 */
export function vapourT(liq) {
  const tot = liq.w + liq.p + liq.i;
  if (tot <= 1e-6) return 0;
  if (liq.w > 0.005) return 98.5;
  const xp = liq.p / Math.max(1e-6, liq.p + liq.i);
  return BP_PHI - 6 * xp;
}

/**
 * Перегнать dm г из колбы: сначала вода, затем фенол и иодбензол (фенол обогащает пары в 1,3 раза).
 * Возвращает { w, p, i } — состав порции дистиллята, г; liq изменяется.
 */
export function distilPortion(liq, dm) {
  const out = { w: 0, p: 0, i: 0 };
  if (liq.w > 1e-9) { const x = Math.min(liq.w, dm); liq.w -= x; out.w = x; dm -= x; }
  if (dm <= 0) return out;
  const tot = liq.p + liq.i;
  if (tot <= 1e-9) return out;
  const yp = (1.3 * liq.p) / (1.3 * liq.p + liq.i);
  const take = Math.min(dm, tot);
  const dp = Math.min(liq.p, take * yp);
  const di = Math.min(liq.i, take - dp);
  liq.p -= dp; liq.i -= di; out.p = dp; out.i = di;
  return out;
}

/** Мутность/цвет продукта по составу основной фракции. */
export function productLook(main, I2left) {
  const tot = main.w + main.p + main.i;
  return {
    cloudy: tot > 0 && main.w / tot > 0.004,
    brown: I2left > 0.15,
    purity: tot > 0 ? main.i / tot : 0,
  };
}

/**
 * «Куда делся продукт» для опыта 2: доли от теоретического выхода (в пересчёте на иодбензол). Сумма = 1.
 * L — учёт потерь в state опыта 2: { nAn, portions, coupled, phenolDiaz, phenolKI, unreacted, foam, funnel, washes, fore, residue, product }
 */
export function lossBreakdown(Ls) {
  const th = theoretical(Ls.nAn);
  if (!th) return [];
  const g = (mmol) => Math.max(0, (mmol * M.PhI) / 1000);
  const parts = [
    ['product', Math.max(0, Ls.product)],
    ['portions', g(Ls.portions)],
    ['side', g(Ls.coupled + Ls.phenolDiaz + Ls.phenolKI + Ls.unreacted)],
    ['handling', Math.max(0, Ls.foam + Ls.funnel + Ls.washes)],
    ['distil', Math.max(0, Ls.fore + Ls.residue)],
  ];
  const known = parts.reduce((a, [, v]) => a + v, 0);
  parts.push(['other', Math.max(0, th - known)]);
  const tot = parts.reduce((a, [, v]) => a + v, 0) || 1;
  return parts.map(([id, v]) => ({ id, frac: v / tot }));
}
