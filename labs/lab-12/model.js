/**
 * Модель работы № 12 — чистые функции (тестируются в Node: tests/lab12-model.test.js).
 * Константы и формулы — из методички (docs/source/labs/lab-12.md, разделы 3.1, 5, 6).
 * Всё, чего в методичке нет (распределение амина между эфиром и водой, доли кристаллизующихся солей,
 * потери), — допущения, см. labs/lab-12/ASSUMPTIONS.md.
 */

export const M = { amine: 121.18, ta: 150.09, salt: 271.27, sucrose: 342.30, naoh: 40.0 };
export const D_AMINE = 0.95;            // г/мл, методичка, раздел 5
export const SUCROSE_LIT = 66.5;        // [α]D20 сахарозы, °, методичка, опыт 1
export const AMINE_PURE = -40;          // [α]D (S)-(−)-1-фенилэтиламина, чистая жидкость, методичка, опыт 3
export const STD_C = 0.10;              // г/мл, стандартный раствор сахарозы
export const MAX_ONE = 1.55;            // г, максимум одного энантиомера из 3,1 г рацемата (методичка)
export const NAOH50 = 1.52 * 0.5 / M.naoh * 1000; // ммоль NaOH в 1 мл 50 % раствора (d 1,52) ≈ 19 ммоль
export const PKA_AMINE = 9.8;           // pKa иона 1-фенилэтиламмония (допущение)
export const K_EXTR = 10;               // коэффициент распределения амина эфир/вода в сильнощелочной среде (допущение)
/** Опорное значение для раствора в метаноле «от преподавателя» (методичка, опыт 3, п. 1) — допущение, проверить. */
export const AMINE_REF_MEOH = -32;
/** Вместимость трубок поляриметра, мл (допущение: микротрубки). */
export const TUBE_VOL = { 1: 1.0, 2: 2.0 };

/* ---------------- формулы раздела 3.1 и опытов 1, 3 ---------------- */
export const specificRotation = (alpha, l, c) => alpha / (l * c);          // [α] = α / (l·c)
export const concentration = (alpha, spec, l) => alpha / (spec * l);       // c = α / ([α]·l)
export const opticalPurity = (spec, specPure = AMINE_PURE) => (spec / specPure) * 100;
export const eeFromAmounts = (R, S) => ((R - S) / (R + S)) * 100;          // ee = ([R] − [S]) / ([R] + [S]) × 100
export const percentS = (ee) => (100 + ee) / 2;
export const percentR = (ee) => (100 - ee) / 2;
export const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);

/* ---------------- опыт 1: сахароза ---------------- */
/**
 * Истинный угол вращения раствора сахарозы в трубке l (дм). dil — доля разбавления остатками воды
 * в неополоснутой трубке; mixStd — доля примеси стандартного раствора (трубку не ополоснули после стандарта).
 */
export function sucroseAlpha(c, l, { dil = 0, mixStd = 0 } = {}) {
  const cEff = (c * (1 - mixStd) + STD_C * mixStd) * (1 - dil);
  return SUCROSE_LIT * l * cEff;
}

/* ---------------- опыт 2: расщепление через диастереомерные соли ---------------- */
/**
 * Кристаллизация гидротартратов. S — состояние опыта 2:
 *   vAmine (мл), mTA (г), vMeOH (мл), lostMeOH (мл, выкипело при нагреве), cryst: 'slow'|'ice'|'disturbed',
 *   needlesKept (иглы не перерастворили), hours (время кристаллизации, ч), base: { fS, fR } (разброс по seed)
 * Возвращает { nS, nR (ммоль в кристаллах), fS, fR, de }.
 */
export function crystallise(S) {
  const nAm = (S.vAmine * D_AMINE) / M.amine * 1000;
  const nTA = (S.mTA / M.ta) * 1000;
  const nEach = Math.min(nAm, nTA) / 2;                // соль 1:1; рацемат — поровну (S) и (R)
  let fS = S.base.fS, fR = S.base.fR;
  const V = (S.vMeOH || 55) - (S.lostMeOH || 0);
  if (V > 58) fS -= (V - 58) * 0.012;                  // много метанола — больше остаётся в растворе
  if (V < 50) fR += (50 - V) * 0.012;                  // мало метанола — соосаждается соль (R)-амина
  if (S.cryst === 'ice') { fS += 0.05; fR += 0.22; }   // быстрое охлаждение — иглы, смесь солей
  if (S.cryst === 'disturbed') fR += 0.08;
  if (S.needlesKept) fR += 0.15;
  if (S.hot) fR += 0.04;                               // вскипание при прибавлении амина
  const h = S.hours ?? 24;
  if (h < 24) fS *= 0.45 + 0.55 * Math.min(1, h / 24);
  fS = Math.max(0.05, Math.min(0.95, fS)); fR = Math.max(0, Math.min(0.6, fR));
  const nS = fS * nEach, nR = fR * nEach;
  return { nS, nR, fS, fR, nEach, de: (nS - nR) / (nS + nR) };
}

/** Потери соли при промывании на фильтре: доля, уходящая в фильтрат; R-соль маточника на кристаллах без промывки. */
export const WASH = { cold: 0.03, coldMuch: 0.12, warm: 0.18, water: 0.4 };

/** Масса соли (г) из ммоль. */
export const saltMass = (n) => (n * M.salt) / 1000;

/**
 * pH и доля свободного амина после прибавления vNaOH мл 50 % NaOH к nSalt ммоль гидротартрата в vW мл воды.
 * 1-й эквивалент NaOH нейтрализует COOH гидротартрата, 2-й — ион аммония.
 */
export function liberation(nSalt, vNaOH, vW = 15) {
  if (!(nSalt > 0)) return { pH: 7, free: 0, x: 0 };
  const x = (vNaOH * NAOH50) / nSalt, V = vW + vNaOH;
  let pH;
  if (x < 1) pH = 3.2 + 1.2 * x;                                   // гидротартрат — кислый раствор
  else if (x < 2) pH = PKA_AMINE + Math.log10(Math.max(1e-3, x - 1) / Math.max(1e-3, 2 - x));
  else pH = 14 + Math.log10(Math.max(1e-3, ((x - 2) * nSalt) / V));
  pH = Math.max(2.5, Math.min(14, pH));
  const free = x < 1 ? 0 : 1 / (1 + 10 ** (PKA_AMINE - pH));
  return { pH, free, x };
}

/** Доля амина, извлечённая эфиром: порции vEach мл, k порций, водная фаза vW мл. */
export function extracted(portions, vW) {
  let left = 1;
  for (const v of portions) left *= vW / (K_EXTR * v + vW);
  return 1 - left;
}

/**
 * Итог опыта 2: масса амина и его состав. E — состояние опыта 2 после всех шагов.
 * Возвращает { mAmine (г, масса остатка), mPure (г амина), nS, nR, ee, wDil (массовая доля воды/эфира), losses }.
 */
export function resolveAmine(E) {
  const cr = crystallise(E);
  const wash = E.washLoss || 0;
  const keepR = E.noWash ? 0.04 * cr.nEach : 0;          // маточник с (R)-солью остаётся на кристаллах
  let nS = cr.nS * (1 - wash), nR = cr.nR * (1 - wash) + keepR;
  const salt = nS + nR;
  const lib = liberation(salt, E.vNaOH || 0, E.vWater || 15);
  const ext = extracted(E.portions && E.portions.length ? E.portions : [10, 10], (E.vWater || 15) + (E.vNaOH || 0));
  const dryLoss = E.dry === 'cacl2' ? 0.3 : E.dry === 'na2so4' ? 0.02 : 0;
  const evapLoss = 0.03 + (E.bump ? 0.12 : 0) + (E.splash || 0);
  const keep = lib.free * ext * (1 - dryLoss) * (1 - evapLoss);
  const nSf = nS * keep, nRf = nR * keep;
  const mPure = ((nSf + nRf) * M.amine) / 1000;
  const water = E.dry === 'none' ? 0.05 : 0;              // эфирный экстракт насыщен водой
  const ether = Math.max(0, E.etherLeft || 0) * 0.71;     // г эфира (d 0,71), не удалённого при упаривании
  const mAmine = mPure / (1 - water) + ether;
  const wDil = mAmine > 0 ? 1 - mPure / mAmine : 0;
  const ee = nSf + nRf > 0 ? ((nSf - nRf) / (nSf + nRf)) * 100 : 0;  // избыток (S)
  // разбор потерь (S)+(R) амина, взятого в опыт, по этапам
  const n0 = cr.nEach * 2;
  const inSalt0 = cr.nS + cr.nR;
  const parts = [
    { id: 'product', frac: (nSf + nRf) / n0 },
    { id: 'mother', frac: (n0 - inSalt0) / n0 },
    { id: 'wash', frac: (inSalt0 - (cr.nS + cr.nR) * (1 - wash)) / n0 },
    { id: 'liber', frac: (salt * (1 - lib.free)) / n0 },
    { id: 'extr', frac: (salt * lib.free * (1 - ext)) / n0 },
    { id: 'dry', frac: (salt * lib.free * ext * dryLoss) / n0 },
    { id: 'evap', frac: (salt * lib.free * ext * (1 - dryLoss) * evapLoss) / n0 },
  ];
  // keepR добавлен к соли из маточника — вычитаем его из доли маточника
  parts[1].frac -= keepR / n0;
  const sum = parts.reduce((a, p) => a + p.frac, 0);
  parts.push({ id: 'other', frac: Math.max(0, 1 - sum) });
  if (sum > 1) parts[1].frac -= sum - 1;
  return { mAmine, mPure, nS: nSf, nR: nRf, ee, wDil, salt: saltMass(salt), lib, ext, losses: parts.map((p) => ({ ...p, frac: Math.max(0, p.frac) })) };
}

/* ---------------- опыт 3: оптическая чистота ---------------- */
/** Угол вращения неразбавленного амина в трубке l дм: [α]чист · ee · l · d · (1 − доля разбавителя). */
export function neatAlpha(ee, l, wDil = 0) {
  return AMINE_PURE * (ee / 100) * l * D_AMINE * (1 - wDil);
}
/** Угол вращения раствора амина в метаноле: c — г/мл (по массе навески), [α]ref — значение преподавателя. */
export function solutionAlpha(ee, l, c, wDil = 0) {
  return AMINE_REF_MEOH * (ee / 100) * l * c * (1 - wDil);
}
