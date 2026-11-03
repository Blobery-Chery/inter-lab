/**
 * Модель работы № 14 «Азосочетание. Получение метилового оранжевого».
 * Из методички (docs/source/labs/lab-14.md): 1,73 г (10 ммоль) сульфаниловой кислоты, 0,53 г (5 ммоль) Na₂CO₃, 20 мл воды,
 * 0,75 г (11 ммоль) NaNO₂ в 3 мл воды, ~10 г льда + 2 мл конц. HCl (36 %), 0–5 °C 5–10 мин, иодкрахмальная бумага,
 * 1,3 мл (1,21 г, 10 ммоль) N,N-диметиланилина + 1 мл ледяной CH₃COOH, 10 мин в бане, 12–15 мл 10 % NaOH до щелочной реакции,
 * кипячение, ~5 г NaCl, охлаждение, фильтрование, промывка насыщенным NaCl. M(метилового оранжевого) = 327,33 г/моль,
 * теоретический выход 3,27 г; интервал перехода окраски pH 3,1–4,4.
 * Всё остальное (скорость разложения диазония, растворимость, теплоты, потери) — допущения, см. ASSUMPTIONS.md.
 * Все функции чистые (кроме make* — они записывают результат в S), тестируются в Node: tests/lab14-model.test.js.
 */
export const M = { SA: 173.19, NA2CO3: 105.99, NANO2: 69.0, DMA: 121.18, MO: 327.33, HCL: 36.46, ACOH: 60.05 };

/** Количество HCl (ммоль) в V мл 36 % HCl (d 1,18). */
export const hclMmol = (V) => (V * 1.18 * 0.36 / M.HCL) * 1000;
/** Количество NaOH (ммоль) в V мл 10 % NaOH (d 1,11). */
export const naohMmol = (V) => (V * 1.11 * 0.1 / 40.0) * 1000;
/** Ледяная уксусная кислота, ммоль в V мл (d 1,049). */
export const acohMmol = (V) => (V * 1.049 / M.ACOH) * 1000;
/** N,N-диметиланилин, ммоль в V мл (d 0,956: 1,3 мл = 1,24 г ≈ 10 ммоль; методичка округляет до 1,21 г). */
export const dmaMmol = (V) => (V * 0.93 / M.DMA) * 1000;

export const theoretical = (mSA) => (mSA / M.SA) * M.MO;
export const percentYield = (m, mSA) => (mSA > 0 ? (m / theoretical(mSA)) * 100 : 0);

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/* ---------------- растворение сульфаниловой кислоты в растворе Na₂CO₃ ---------------- */
/** Скорость растворения (доля в секунду) при температуре T, °C: холодной почти не идёт, при 60–80 °C — за 2–4 мин. */
export const dissolveRate = (T, stir) => (T < 25 ? 0.0004 : 0.0004 + 0.00022 * (T - 25)) * (stir ? 1.6 : 1);

/* ---------------- разложение соли диазония ---------------- */
/** Константа скорости разложения −O₃S–C₆H₄–N₂⁺ в воде, с⁻¹: при 5 °C ≈ 1 % за 10 мин, при 20 °C ≈ 9 %, при 30 °C ≈ 30 %. */
export const decompRate = (T) => 2e-5 * Math.exp(0.14 * (T - 5));

/**
 * Температура после выливания раствора (Vsol мл при Tsol °C) на m г льда с 2 мл HCl: теплота таяния льда 334 Дж/г,
 * теплота диазотирования ≈ 100 кДж/моль (n — ммоль амина). → { T, iceLeft } (iceLeft, г — нерастаявший лёд).
 */
export function mixOnIce(Vsol, Tsol, mIce, n = 10) {
  const c = 4.18, q = n * 100; // Дж
  const E = mIce * 334 - c * Vsol * Math.max(0, Tsol) - q;
  if (E >= 0) return { T: 0.5, iceLeft: E / 334 };
  return { T: -E / (c * (Vsol + mIce)), iceLeft: 0 };
}

/* ---------------- pH реакционной смеси при прибавлении NaOH ---------------- */
const KW = 1e-14;
/**
 * pH по балансу зарядов. inv (ммоль): strong — избыток сильной кислоты (HCl), dye — краситель (кислотная форма, pKa 3,4),
 * acoh — уксусная кислота (pKa 4,76), hno2 — HNO₂ (pKa 3,3), dma — свободный диметиланилин (pKa DMAH⁺ 5,1), naoh — прибавленная щёлочь;
 * V — объём, мл. Возвращает pH.
 */
export function mixPH(inv, V) {
  const c = (x) => (x || 0) / V;
  const Cs = c(inv.strong), Cb = c(inv.naoh);
  const A = [[c(inv.dye), 10 ** -3.4], [c(inv.acoh), 10 ** -4.76], [c(inv.hno2), 10 ** -3.3]];
  const Cd = c(inv.dma), Kd = 10 ** -5.1;
  const F = (h) => {
    let neg = Cs + KW / h;
    for (const [C, K] of A) neg += (C * K) / (K + h);
    const pos = Cb + h + (Cd * h) / (Kd + h);
    return pos - neg;
  };
  let lo = -15, hi = 1.5;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (F(10 ** m) > 0) hi = m; else lo = m; }
  return -((lo + hi) / 2);
}

/** Запас кислот смеси перед прибавлением щёлочи (ммоль) по state опыта 1. */
export function acidInventory(S) {
  const nSA = S.mSA / M.SA, nNit = S.mNit / M.NANO2, nH = hclMmol(S.vHCl) / 1000;
  const dz = S.dz || {};
  const dye = (S.cp && S.cp.nDye) || 0;
  const strong = Math.max(0, nH - 2 * nSA * (dz.conv ?? 0.95) - Math.min(nNit - nSA, 0.002)) * 1000;
  return {
    strong,
    dye: dye * 1000,
    acoh: acohMmol(S.vAcOH || 0),
    hno2: Math.max(0, (dz.excess || 0)) * 1000,
    dma: Math.max(0, dmaMmol(S.vDMA || 0) - dye * 1000),
  };
}

/** Доля кислотной (красной, хиноидной) формы метилового оранжевого при данном pH (pKa 3,4; переход 3,1–4,4). */
export const acidFraction = (pH) => 1 / (1 + 10 ** (pH - 3.4));

/**
 * Цвет раствора метилового оранжевого: f — доля кислотной формы (0 — жёлтая азоформа, 1 — красная), a — насыщенность 0…1.
 * Переходная область (f ≈ 0,5) — оранжевая.
 */
export function moColor(f, a = 0.75) {
  const Y = [242, 196, 40], O = [240, 128, 30], R = [205, 32, 52];
  const u = clamp(f, 0, 1);
  const mix = u < 0.5 ? Y.map((v, i) => v + (O[i] - v) * (u / 0.5)) : O.map((v, i) => v + (R[i] - v) * ((u - 0.5) / 0.5));
  return `rgba(${mix.map((v) => Math.round(v)).join(',')},${clamp(a, 0, 1).toFixed(2)})`;
}

/* ---------------- растворимость метилового оранжевого ---------------- */
/** Растворимость натриевой соли в реакционной жидкости, г/л, при T °C и концентрации NaCl cNaCl г/л (высаливание). */
export const solubility = (T, cNaCl = 0) => 5 * Math.exp(0.035 * (T - 20)) * Math.exp(-cNaCl / 40);

/* ---------------- синтез: продукт ---------------- */
/**
 * Количество красителя после сочетания, моль. Учитывает: растворение сульфаниловой кислоты, полноту диазотирования (HCl, NaNO₂,
 * порядок смешения), разложение диазония (∫k dt), среду и перемешивание при сочетании, количество диметиланилина.
 */
export function coupled(S) {
  const nSA = S.mSA / M.SA;
  const dz = S.dz || {};
  const conv = dz.conv ?? 0.95;
  const surv = Math.exp(-(dz.D || 0));
  const nDz = nSA * conv * surv;
  const nDMA = dmaMmol(S.vDMA || 1.3) / 1000;
  const cp = S.cp || {};
  const eff = (cp.medium === 'alk' ? 0.25 : cp.medium === 'warm' ? 0.6 : 0.93) * (cp.stirred === false ? 0.9 : 1) * (cp.time >= 600 ? 1 : 0.85 + 0.15 * clamp((cp.time || 0) / 600, 0, 1));
  return Math.max(0, Math.min(nDz, nDMA) * eff);
}

/**
 * Выделенный продукт после высаливания, фильтрования и промывания (S.iso — данные шага высаливания, S.filt — фильтрования).
 * → { mo (г чистого красителя), acidForm (г), nacl (г), m (г сухого продукта), purity, losses:{…} } и записывает в S.fin.
 */
export function makeFin(S) {
  const nDye = coupled(S);
  const th = theoretical(S.mSA);
  const mDye = nDye * M.MO;
  const iso = S.iso || {}, F = S.filt || {};
  const V = S.vTot || 50;
  const cNaCl = ((iso.nacl || 0) / V) * 1000;
  const Tf = iso.Tfilt ?? 3;
  const dissolved = Math.min(mDye, (solubility(Tf, cNaCl) * V) / 1000);
  const fines = iso.nacl >= 3 ? 0.01 : 0.06;                 // без высаливания — мелкие кристаллы проходят через фильтр
  const handling = clamp(0.05 + (S.luck || 0) + (F.loss || 0) + (iso.boilOver || 0), 0, 0.9);
  let solid = Math.max(0, mDye - dissolved) * (1 - fines) * (1 - handling);
  const washLoss = clamp(F.washLoss || 0, 0, 0.9);
  solid *= 1 - washLoss;
  const acidFrac = clamp((S.alk && S.alk.pH < 8 ? 0.35 : 0) + (F.acidWash ? 0.3 : 0), 0, 0.6);
  const nacl = solid * ((F.brine ? 0.03 : 0.005) + ((iso.nacl || 0) > 7 ? 0.06 : 0));
  const phenol = solid * clamp((S.dz && S.dz.warm ? 0.06 : 0) + (S.dz ? (S.dz.D || 0) * 0.05 : 0), 0, 0.1);
  const m = solid + nacl + phenol;
  const fin = {
    mo: solid, acidFrac, nacl, phenol, m, purity: m > 0 ? (solid * (1 - acidFrac * 0.04)) / m : 0,
    losses: [
      ['product', solid],
      ['diazo', (S.mSA / M.SA) * (1 - (S.dz ? S.dz.conv ?? 0.95 : 0.95) * Math.exp(-((S.dz || {}).D || 0))) * M.MO],
      ['coupling', Math.max(0, (S.mSA / M.SA) * (S.dz ? (S.dz.conv ?? 0.95) * Math.exp(-(S.dz.D || 0)) : 0.95) * M.MO - mDye)],
      ['mother', dissolved + Math.max(0, mDye - dissolved) * fines],
      ['handling', Math.max(0, mDye - dissolved) * (1 - fines) * handling],
      ['wash', Math.max(0, mDye - dissolved) * (1 - fines) * (1 - handling) * washLoss],
    ],
    th,
  };
  S.fin = fin;
  return fin;
}

/** «Куда делся продукт»: доли от теоретического выхода, сумма = 1. */
export function lossBreakdown(S) {
  const f = S.fin;
  if (!f || !f.th) return [];
  const parts = f.losses.map(([id, v]) => [id, Math.max(0, v)]);
  const sum = parts.reduce((a, [, v]) => a + v, 0);
  parts.push(['other', Math.max(0, f.th - sum)]);
  const tot = parts.reduce((a, [, v]) => a + v, 0) || 1;
  return parts.map(([id, v]) => ({ id, frac: v / tot }));
}

/* ---------------- опыт 3: восстановление азогруппы ---------------- */
/** Скорость обесцвечивания (доля красителя в секунду) при цинке z (0…1, кончик шпателя = 1) в сильнокислой среде при T °C. */
export const reduceRate = (z, T, acid, load = 1) => (acid ? (0.0012 + 0.00018 * Math.max(0, T - 20)) * z / Math.max(0.5, load) : 0);
