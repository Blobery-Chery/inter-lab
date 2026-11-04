/**
 * Модель работы № 8 (синтез н-бутилацетата и изобутилацетата). Чистые функции — тестируются в Node.
 * Из методички: 9,2 мл (7,4 г, 0,10 моль) н-бутанола или 9,3 мл изобутанола; 11,5 мл (12,0 г, 0,20 моль) ледяной
 * уксусной кислоты; 0,5 мл конц. H₂SO₄; кипячение 45–60 мин; K ≈ 4; эфир — верхний слой, d ≈ 0,88 г/мл;
 * фракции 122–127 °C и 114–119 °C; т. кип. 126 °C и 117–118 °C; теоретический выход 11,6 г.
 * Всё остальное (плотности спиртов, коэффициенты распределения, летучести, скорости) — допущения, см. ASSUMPTIONS.md.
 */
export const M = { AcOH: 60.05, BuOH: 74.12, ester: 116.16, H2O: 18.02, H2SO4: 98.08, NaHCO3: 84.01, heavy: 130.23 };
export const D_ACID = 1.049, D_H2SO4 = 1.84, K_EQ = 4;

/** Параметры двух спиртов (опыты 1 и 2). */
export const ALC = {
  n: {
    d: 0.810, V: 9.2, frac: [122, 127], bp: 126, bpLit: '126', dEster: 0.882, nD: 1.3941,
    Taz: 90.7, Talc: 117.6, aAlc: 3.0, aAcid: 1.25, Tmix: 112,
  },
  i: {
    d: 0.802, V: 9.3, frac: [114, 119], bp: 117.5, bpLit: '117–118', dEster: 0.871, nD: 1.3902,
    Taz: 87.4, Talc: 107.6, aAlc: 3.5, aAcid: 0.9, Tmix: 108,
  },
};

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/** Равновесная степень превращения спирта при мольном отношении кислота : спирт = r и константе K. */
export function eqConversion(r, K = K_EQ) {
  if (Math.abs(K - 1) < 1e-9) return r / (1 + r);
  const a = K - 1, b = -K * (1 + r), c = K * r;
  return (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
}

/** Количество спирта (моль) по объёму и плотности. */
export const molAlc = (V, kind = 'n') => (V * ALC[kind].d) / M.BuOH;
export const molAcid = (V) => (V * D_ACID) / M.AcOH;
export const theoretical = (nAlc) => nAlc * M.ester;
export const percentYield = (m, nAlc) => (nAlc > 0 ? (m / theoretical(nAlc)) * 100 : 0);

/**
 * Степень превращения после кипячения tBoil секунд: приближение к равновесию с τ = 15 мин при 0,5 мл H₂SO₄.
 * Меньше катализатора — медленнее; без катализатора за время занятия почти ничего не образуется.
 */
export function conversion(r, tBoil, vCat = 0.5) {
  const xeq = eqConversion(Math.min(r, 1e6));
  const tau = vCat > 0.05 ? 900 * clamp(0.5 / vCat, 0.5, 4) : 1e6;
  return xeq * (1 - Math.exp(-Math.max(0, tBoil) / tau));
}

/**
 * Состав органической фазы после кипячения (г). S — state опыта: vAlc, vAcid, cat, reflux{t, vap, bump}, char.
 * Возвращает { org, ledger } — ledger: куда ушёл эфир (г, в пересчёте на теоретический выход).
 */
export function afterReflux(S, kind = 'n') {
  const nA = molAlc(S.vAlc, kind), nC = molAcid(S.vAcid), r = nC / nA;
  const x = conversion(r, S.reflux.t, S.cat);
  const lost = clamp(S.reflux.vap + S.reflux.bump, 0, 0.6);
  const th = theoretical(nA);
  const org = {
    ester: x * nA * M.ester * (1 - lost),
    alc: (1 - x) * nA * M.BuOH * (1 - lost),
    acid: Math.max(0, nC - x * nA) * M.AcOH * (1 - lost * 0.5),
    water: x * nA * M.H2O + S.cat * D_H2SO4 * 0.03,
    heavy: 0.1 + (S.char ? 0.25 : 0),
    h2so4: S.cat * D_H2SO4 * 0.97,
  };
  const ledger = { th, unreacted: (1 - x) * nA * M.ester, vapour: x * nA * M.ester * lost, wash: 0, drying: 0, fore: 0, residue: 0, holdup: 0 };
  return { org, ledger, x, r };
}

/**
 * Состояние после кипячения, если шаг кипячения был закрыт без него (принудительный переход,
 * восстановление старого сохранения): считаем по тому, что есть, чтобы следующие шаги не падали.
 */
export function ensureOrg(S, kind = 'n') {
  if (S.org && S.ledger) return;
  if (!S.reflux || S.reflux.t == null) S.reflux = Object.assign({ t: 0, vap: 0, bump: 0 }, S.reflux || {});
  const res = afterReflux(S, kind);
  S.org = res.org; S.ledger = res.ledger; S.x = res.x; S.ratio = res.r;
}

/** Объём органической фазы, мл (для коэффициентов распределения). */
export const orgVolume = (o) => o.ester / 0.88 + o.alc / 0.81 + o.acid / D_ACID + o.heavy / 0.77;

/* ------------------------------------------------------------------ промывки в делительной воронке */
const KD_ACID = 0.15;   // распределение CH₃COOH: орг./водн. (концентрационное), допущение
const KD_ALC = 4;       // распределение бутанола: орг./водн., допущение
const SOL_ESTER = 0.007; // растворимость бутилацетата в воде, г/мл (≈ 0,7 г/100 мл)

function saturate(o, k = 0.012, drops = 0.15) { o.water = (o.ester + o.alc + o.acid) * k + drops; }

/** Промывка водой V мл. Меняет org, возвращает { esterLost, pH } (pH водного слоя). */
export function washWater(o, V) {
  const Vo = Math.max(1, orgVolume(o));
  const before = o.acid;
  o.acid *= (KD_ACID * Vo) / (KD_ACID * Vo + V);
  o.alc *= (KD_ALC * Vo) / (KD_ALC * Vo + V);
  const h2 = o.h2so4; o.h2so4 = 0;
  const lost = Math.min(o.ester, SOL_ESTER * V * 1.3 + o.ester * 0.01);
  o.ester -= lost;
  saturate(o);
  const hplus = (h2 / M.H2SO4) * 2 + ((before - o.acid) / M.AcOH) * 0.02; // моль H⁺, уксусная кислота слабая
  return { esterLost: lost, pH: clamp(-Math.log10(Math.max(1e-9, hplus / (V / 1000))), 0.3, 6) };
}

/** Промывка V мл 5 % NaHCO₃: нейтрализует кислоту, выделяется CO₂. → { co2 (ммоль), esterLost, pH, excess } */
export function washBicarb(o, V) {
  const base = V * 1.036 * 0.05 / M.NaHCO3 * 1000; // ммоль
  const acid = (o.acid / M.AcOH) * 1000 + (o.h2so4 / M.H2SO4) * 2000;
  const neut = Math.min(acid, base);
  let left = acid - neut;
  o.h2so4 = 0;
  o.acid = (left / 1000) * M.AcOH;
  o.alc *= (KD_ALC * orgVolume(o)) / (KD_ALC * orgVolume(o) + V);
  const lost = Math.min(o.ester, SOL_ESTER * V + o.ester * 0.008);
  o.ester -= lost;
  saturate(o);
  const excess = base - neut;
  const pH = excess > 0.2 ? 8.3 : clamp(4.76 + Math.log10(Math.max(0.05, neut) / Math.max(0.05, left + 0.5)), 4, 6.5);
  return { co2: neut, esterLost: lost, pH, excess };
}

/** Промывка насыщенным NaCl V мл: высаливает эфир и воду из органического слоя. */
export function washBrine(o, V) {
  o.alc *= 0.95;
  const lost = Math.min(o.ester, 0.0012 * V + o.ester * 0.004);
  o.ester -= lost;
  saturate(o, 0.006, 0.05);
  return { esterLost: lost, pH: 7 };
}

/** Кислота в органическом слое, ммоль. */
export const acidMmol = (o) => (o.acid / M.AcOH) * 1000 + (o.h2so4 / M.H2SO4) * 2000;

/* ------------------------------------------------------------------ сушка */
/** Сколько воды связал осушитель (г): g — масса Na₂SO₄, t — время, с; swirl — взбалтывали. */
export const dryCapacity = (g, t, swirl = true) => 0.3 * g * Math.min(1, t / (swirl ? 2400 : 4400));
/** Эфир, удерживаемый осушителем при декантации, г. */
export const dryHoldup = (g) => 0.11 * g;

/* ------------------------------------------------------------------ перегонка */
const TB = { acid: 118.1, ester: null, heavy: 142, water: null, alc: null };

/** Летучести компонентов относительно эфира (с учётом азеотропов) и эффективность разделения. */
function alphas(kind, eff) {
  const c = ALC[kind];
  const a = { water: 7, alc: c.aAlc, acid: c.aAcid, ester: 1, heavy: 0.22 };
  for (const k in a) a[k] = 1 + (a[k] - 1) * eff;
  return a;
}
const Tb = (kind) => ({ water: ALC[kind].Taz, alc: ALC[kind].Talc, acid: TB.acid, ester: ALC[kind].bp, heavy: TB.heavy });
const MOL = { water: M.H2O, alc: M.BuOH, acid: M.AcOH, ester: M.ester, heavy: M.heavy };
const KEYS = ['water', 'alc', 'acid', 'ester', 'heavy'];

export const liquidMass = (L) => KEYS.reduce((a, k) => a + (L[k] || 0), 0);

/** Мольные доли жидкости и пара. → { x, y } */
export function vle(L, kind = 'n', eff = 1) {
  const a = alphas(kind, eff);
  const n = Object.fromEntries(KEYS.map((k) => [k, Math.max(0, L[k] || 0) / MOL[k]]));
  const tot = KEYS.reduce((s, k) => s + n[k], 0) || 1;
  const x = Object.fromEntries(KEYS.map((k) => [k, n[k] / tot]));
  const ys = KEYS.reduce((s, k) => s + a[k] * x[k], 0) || 1;
  const y = Object.fromEntries(KEYS.map((k) => [k, (a[k] * x[k]) / ys]));
  return { x, y };
}

/** Температура паров у шарика термометра (истинная) и температура кипящей жидкости. */
export function vapourT(L, kind = 'n', eff = 1) {
  const { x, y } = vle(L, kind, eff), tb = Tb(kind);
  const Tv = KEYS.reduce((s, k) => s + y[k] * tb[k], 0);
  const Tl = KEYS.reduce((s, k) => s + x[k] * tb[k], 0) + 1.5;
  return { Tv, Tl: Math.max(Tv + 0.5, Tl) };
}

/** Показание термометра при положении шарика: 'ok' (на уровне отвода), 'low' (в жидкости), 'high' (выше отвода). */
export function thermoShown(L, kind, eff, pos) {
  const { Tv, Tl } = vapourT(L, kind, eff);
  if (pos === 'low') return Tl + 3;
  if (pos === 'high') return Tv - 6;
  return Tv;
}

/** Скорость отгонки, г/с, при мощности 1–3. */
export const distRate = (p) => [0, 0.014, 0.035, 0.08][p] || 0;

/**
 * Отогнать dm граммов: состав пара по летучестям. Меняет L, возвращает порцию дистиллята {water, alc, …}.
 */
export function distil(L, dm, kind = 'n', eff = 1) {
  const tot = liquidMass(L);
  dm = Math.min(dm, Math.max(0, tot));
  if (dm <= 0) return {};
  const { y } = vle(L, kind, eff);
  const w = Object.fromEntries(KEYS.map((k) => [k, y[k] * MOL[k]]));
  const ws = KEYS.reduce((s, k) => s + w[k], 0) || 1;
  const out = {};
  for (const k of KEYS) { const g = Math.min(L[k] || 0, (dm * w[k]) / ws); out[k] = g; L[k] = (L[k] || 0) - g; }
  return out;
}

export function addTo(acc, part) { for (const k of KEYS) acc[k] = (acc[k] || 0) + (part[k] || 0); return acc; }
export const purity = (F) => { const m = liquidMass(F); return m > 0 ? (F.ester || 0) / m : 0; };

/**
 * «Куда делся эфир»: доли от теоретического выхода. ledger — из afterReflux + промывки/сушка/перегонка.
 */
export function lossBreakdown(ledger, mainEster) {
  if (!ledger || !ledger.th) return [];
  const prod = Math.max(0, Math.min(ledger.th, mainEster || 0));
  const parts = [
    ['product', prod], ['unreacted', ledger.unreacted], ['vapour', ledger.vapour], ['wash', ledger.wash],
    ['drying', ledger.drying], ['dist', ledger.fore + ledger.residue + ledger.holdup],
  ];
  const known = parts.reduce((a, [, v]) => a + Math.max(0, v), 0);
  parts.push(['other', Math.max(0, ledger.th - known)]);
  const tot = parts.reduce((a, [, v]) => a + Math.max(0, v), 0) || 1;
  return parts.map(([id, v]) => ({ id, frac: Math.max(0, v) / tot }));
}
