/**
 * Модель работы № 13 — чистые функции (тестируются в Node: tests/lab13-model.test.js).
 * Из методички (docs/source/labs/lab-13.md): этан — заторможенная конформация на ≈ 12 кДж/моль устойчивее заслонённой;
 * бутан — анти на ≈ 3,8 кДж/моль устойчивее гош; метилциклогексан — ≈ 95 % экваториального конформера при 25 °C;
 * малеиновая кислота: растворимость ≈ 78 г/100 мл, т. пл. 130–135 °C, pKa1 1,9; фумаровая: ≈ 0,6 г/100 мл, не плавится
 * в открытом капилляре, возгоняется выше ≈ 200 °C, pKa1 3,0; 2,0 г малеиновой кислоты + 4 мл тёплой воды + 4 мл конц. HCl (36 %),
 * кипячение 15–20 мин; теоретический выход 2,0 г; ³J(транс) 11–18 Гц, ³J(цис) 6–14 Гц, ³J(ax,ax) 8–13 Гц, ³J(ax,eq), ³J(eq,eq) 2–5 Гц;
 * ИК: транс-CH=CH ≈ 965 см⁻¹, цис ≈ 690 см⁻¹; коричные кислоты — 16,0 и 12,7 Гц.
 * Всё прочее (заслонённые конформации бутана, кинетика, растворимость при других температурах, потери, химические сдвиги) —
 * допущения, см. ASSUMPTIONS.md.
 */
export const M = { MAL: 116.07, FUM: 116.07, HCL: 36.46 };
export const R_GAS = 8.314e-3; // кДж/(моль·К)

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const rad = (d) => (d * Math.PI) / 180;
export const norm360 = (a) => ((a % 360) + 360) % 360;
/** Наименьшая разница углов, 0…180. */
export const angDiff = (a, b) => { const d = Math.abs(norm360(a) - norm360(b)); return Math.min(d, 360 - d); };

/* ================================================================ конформации */

/** Этан: E(φ) = 6(1 + cos 3φ) кДж/моль, φ — двугранный угол H–C–C–H. Заслонённая (0°) — 12, заторможенная (60°) — 0. */
export const ethaneE = (phi) => 6 * (1 + Math.cos(3 * rad(phi)));

/**
 * Бутан, φ — двугранный угол CH₃–C2–C3–CH₃ (0° — полностью заслонённая, 180° — анти).
 * Ряд Фурье через четыре точки: анти 0, гош 3,8 (методичка), заслонённая H/CH₃ 16, полностью заслонённая 19 кДж/моль (допущение).
 */
const BA = (() => {
  const a3 = (19 - 0 + 2 * (16 - 3.8)) / 6; // из системы уравнений (см. тест)
  const a1 = 9.5 - a3;
  const a2 = (2 * 9.5 - 19.8) / 3; // a0 + a2 = 9.5; 2a0 − a2 = 19.8
  const a0 = 9.5 - a2;
  return { a0, a1, a2, a3 };
})();
export const butaneE = (phi) => { const p = rad(phi); return BA.a0 + BA.a1 * Math.cos(p) + BA.a2 * Math.cos(2 * p) + BA.a3 * Math.cos(3 * p); };

/** Названия конформаций по углу (с допуском tol°). Возвращает id или null, если угол не «особый». */
export function conformerOf(mol, phi, tol = 7.5) {
  const a = norm360(phi);
  if (mol === 'ethane') {
    for (const k of [0, 120, 240]) if (angDiff(a, k) <= tol) return 'eclipsed';
    for (const k of [60, 180, 300]) if (angDiff(a, k) <= tol) return 'staggered';
    return null;
  }
  if (angDiff(a, 0) <= tol) return 'syn';
  if (angDiff(a, 180) <= tol) return 'anti';
  if (angDiff(a, 60) <= tol || angDiff(a, 300) <= tol) return 'gauche';
  if (angDiff(a, 120) <= tol || angDiff(a, 240) <= tol) return 'eclipsed';
  return null;
}

/** Доля конформера с энергией выше на dG (кДж/моль) при T (К): 1 / (1 + exp(dG/RT)). */
export const lowFraction = (dG, T = 298.15) => 1 / (1 + Math.exp(-dG / (R_GAS * T)));
/** ΔG(акс → экв) для метилциклогексана из «≈ 95 % экваториального конформера при 25 °C» (методичка). */
export const dG_Me = R_GAS * 298.15 * Math.log(95 / 5);

/* ================================================================ R/S */

/** Направления четырёх связей тетраэдрического центра: 0 — вверх, 1 — влево (в плоскости), 2 — клин (к нам), 3 — пунктир (от нас). */
export const TET = [[0, 1, 0], [-0.943, -0.333, 0], [0.471, -0.333, 0.816], [0.471, -0.333, -0.816]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * Конфигурация центра. perm[pos] — заместитель в позиции pos; prio — заместители по убыванию старшинства [a, b, c, d].
 * coords — направления связей (по умолчанию TET). Возвращает 'R' | 'S'.
 */
export function rsOf(perm, prio, coords = TET) {
  const at = (sub) => coords[perm.indexOf(sub)];
  const v = dot(cross(at(prio[0]), at(prio[1])), at(prio[2]));
  return v < 0 ? 'R' : 'S';
}
/** Чётность перестановки (0 — чётная). */
export function parity(perm, ref) {
  const p = perm.map((x) => ref.indexOf(x));
  let s = 0;
  for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) if (p[i] > p[j]) s ^= 1;
  return s;
}
/** Поворот модели вокруг вертикальной связи на 120°: позиции 1 → 2 → 3 → 1 (чётная перестановка). */
export const rotV = (perm) => [perm[0], perm[3], perm[1], perm[2]];
/** Поворот на 180° вокруг оси, лежащей в плоскости рисунка между связями 0 и 1: 0 ↔ 1, 2 ↔ 3. */
export const rotH = (perm) => [perm[1], perm[0], perm[3], perm[2]];
/** Отражение в плоскости рисунка: клин ↔ пунктир. */
export const mirror = (perm) => [perm[0], perm[1], perm[3], perm[2]];
/** Поменять местами две группы (позиции i и j). */
export const swap = (perm, i, j) => { const p = perm.slice(); [p[i], p[j]] = [p[j], p[i]]; return p; };

/**
 * Проекция Фишера бутан-2-ола: вертикально CH₃ (вверху) и C₂H₅ (внизу) — от наблюдателя, горизонтально H и OH — к наблюдателю.
 * Возвращает { left, right } для нужной конфигурации.
 */
export const FISCHER = [[0, 1, -0.7], [-1, 0, 0.7], [1, 0, 0.7], [0, -1, -0.7]]; // верх, лево, право, низ
export function fischerOf(conf, prio = ['OH', 'C2H5', 'CH3', 'H']) {
  const tryP = ['CH3', 'OH', 'H', 'C2H5'];
  return rsOf(tryP, prio, FISCHER) === conf ? { left: 'OH', right: 'H' } : { left: 'H', right: 'OH' };
}

/* ================================================================ малеиновая / фумаровая кислоты */

/** Растворимость в воде, г/мл, при t °C. Фумаровая: 0,63 г/100 мл при 25 °C (методичка ≈ 0,6), рост ≈ ×2,9 на 30 °C (допущение). */
export const solFum = (t) => 0.0063 * Math.exp(0.035 * (t - 25));
/** Малеиновая: 0,78 г/мл при 25 °C (методичка ≈ 78 г/100 мл), слабый рост с температурой (допущение). */
export const solMal = (t) => 0.78 * Math.exp(0.012 * (t - 25));

/** Доля навески, растворившейся в V мл воды при t °C. */
export const dissolvedFrac = (m, V, t, kind) => (m > 0 ? clamp(((kind === 'mal' ? solMal(t) : solFum(t)) * V) / m, 0, 1) : 0);

/** Интервал плавления малеиновой кислоты (°C): база 131,0–133,2 (методичка 130–135), слой > 3,2 мм и нерастёртая проба растягивают. */
export function malMp(jitter = 0, layer = 2.5, ground = true) {
  const on = 131.0 + jitter;
  return { on, end: on + 2.2 + (layer > 3.2 ? 0.8 : 0) + (ground ? 0 : 0.6) };
}

/** Доля фумаровой кислоты, возогнанной из капилляра за dt с при температуре блока T (выше ≈ 200 °C — методичка). */
export const sublimeRate = (T) => (T < 195 ? 0 : 0.0016 * Math.exp((T - 200) / 22));

/* ================================================================ изомеризация (опыт 3) */

/** Молярная концентрация HCl в смеси: 36 % HCl, d 1,18 → 11,65 моль/л; объём смеси ≈ вода + HCl + 0,65 мл на 1 г кислоты. */
export const cHCl = (vHCl, vW, m = 2) => (vHCl * 11.65) / Math.max(0.5, vHCl + vW + 0.65 * m);
export const C_REF = cHCl(4, 4, 2);
/** Температура слабого кипения смеси на кипящей водяной бане / в колбонагревателе (≈ 101 °C; допущение, см. ASSUMPTIONS.md). */
export const boilT = (c) => 100 + 0.2 * Math.max(0, c);

/**
 * Константа скорости изомеризации, с⁻¹: первый порядок по малеиновой кислоте, пропорционально [HCl], Ea ≈ 90 кДж/моль.
 * При стандартных условиях (кипение, 4 мл HCl) за 15 мин превращается ≈ 88 %, за 20 мин ≈ 94 % (допущение под методичку).
 */
export function kIso(T, c) {
  const kRef = 0.00236, Tb = boilT(C_REF);
  return kRef * (c / C_REF) * Math.exp((-90 / R_GAS) * (1 / (T + 273.15) - 1 / (Tb + 273.15)));
}

/** Масса фумаровой кислоты, выпавшей из V мл при t °C (если образовалось mF г). */
export const crystallised = (mF, V, t) => Math.max(0, mF - solFum(t) * V);

/** pH промывных вод после n промывок ледяной водой (предел — собственная растворимость фумаровой кислоты, pH ≈ 2,1). */
export const washPH = (n) => -Math.log10(10 ** -(-0.6 + 0.75 * n) + 10 ** -2.1);

/**
 * Продукт опыта 3. S — state опыта: mMal, X (доля превращения), Vmix (мл), Tfilt (°C), washes (ледяной водой), warmW, etOH,
 * shock (резкое охлаждение), lossMech (доли), water (влажность).
 * → { m (сухой), mFum, mMal (примесь), acid (HCl), purity, mother (г фумаровой в маточном растворе), wash (г, смыто) }
 */
export function makeProduct(S) {
  const mF = S.mMal * clamp(S.X, 0, 1); // M одинаковые
  const inMother = Math.min(mF, solFum(S.Tfilt ?? 3) * (S.Vmix || 9));
  let solid = mF - inMother;
  const mech = solid * clamp(S.lossMech || 0, 0, 0.9);
  solid -= mech;
  const washLoss = Math.min(solid * 0.5, (S.washes || 0) * 1.8 * solFum(2) + (S.warmW || 0) * 2 * (solFum(60) - solFum(2)) + (S.etOH || 0) * 0.08);
  solid -= washLoss;
  const wf = [1, 0.45, 0.2, 0.1, 0.06][Math.min(4, (S.washes || 0) + (S.warmW || 0) + (S.etOH || 0))];
  const mMalImp = S.mMal * (1 - clamp(S.X, 0, 1)) * 0.08 * wf * (S.shock ? 1.5 : 1);
  const acid = solid * (S.washes ? 0.004 : 0.03);
  const m = Math.max(0.01, solid) + mMalImp + acid;
  return { m, mFum: Math.max(0.01, solid), mMalImp, acid, purity: Math.max(0.01, solid) / m, mother: inMother, mech, wash: washLoss };
}

export const theoretical = (mMal) => (mMal * M.FUM) / M.MAL;
export const percentYield = (m, mMal) => (mMal > 0 ? (m / theoretical(mMal)) * 100 : 0);

/**
 * Поведение продукта при нагревании в капилляре: примесь малеиновой кислоты > 3 % — спекается и частично плавится ≈ 120–130 °C;
 * влажный — «потеет» около 100 °C. → { sinter: °C | null, partial: 0…1 }
 */
export function productHeating(P, water = 0) {
  const w = P.mMalImp / P.m;
  if (w > 0.03) return { sinter: 132 - 120 * Math.min(0.1, w), partial: clamp(w * 4, 0.12, 0.7), wet: water > 0.02 };
  return { sinter: null, partial: 0, wet: water > 0.02 };
}

/** «Куда делась малеиновая кислота»: доли от теоретического выхода фумаровой кислоты. */
export function lossBreakdown(S, P) {
  const th = theoretical(S.mMal);
  if (!th || !P) return [];
  const parts = [
    ['product', P.mFum],
    ['unreacted', S.mMal * (1 - clamp(S.X, 0, 1))],
    ['mother', P.mother],
    ['handling', P.mech],
    ['wash', P.wash],
  ];
  const sum = parts.reduce((a, [, v]) => a + Math.max(0, v), 0);
  parts.push(['other', Math.max(0, th - sum)]);
  const tot = parts.reduce((a, [, v]) => a + Math.max(0, v), 0) || 1;
  return parts.map(([id, v]) => ({ id, frac: Math.max(0, v) / tot }));
}

/* ================================================================ спектры (опыт 4) */

/** Спектрометр, МГц (допущение: учебный прибор 400 МГц). */
export const NMR_MHZ = 400;
/** Винильные протоны коричных кислот: J из методички, δ — типичные значения (допущение). */
export const CINNAMIC = {
  E: { J: 16.0, b: 7.80, a: 6.45 },
  Z: { J: 12.7, b: 7.05, a: 5.96 },
};
/** Линии дублетов (м. д.) для изомера: [{ d, h }]. */
export function cinnamicLines(iso, mhz = NMR_MHZ) {
  const c = CINNAMIC[iso], dd = c.J / mhz / 2;
  return [c.b + dd, c.b - dd, c.a + dd, c.a - dd].map((d) => ({ d: +d.toFixed(4), h: 1 }));
}
/** J из положений двух линий дублета (м. д.) → Гц. */
export const jFromLines = (d1, d2, mhz = NMR_MHZ) => Math.abs(d1 - d2) * mhz;
/** Отнесение пары изомеров: у транс-изомера J больше (16,0 против 12,7 Гц — методичка); граница 14 Гц — допущение. */
export const configFromJ = (J) => (J > 14 ? 'E' : 'Z');

/** ИК-полосы окт-4-енов (см⁻¹, глубина 0…1, полуширина): общие + диагностическая внеплоскостная δ(C–H). */
export function octeneBands(iso) {
  const common = [[2960, 0.85, 18], [2930, 0.8, 18], [2873, 0.6, 14], [1465, 0.45, 12], [1379, 0.3, 8], [1110, 0.12, 14], [740, 0.12, 10]];
  return iso === 'trans' ? [...common, [965, 0.75, 9]] : [...common, [3015, 0.28, 10], [1655, 0.18, 10], [690, 0.62, 14]];
}
/** Пропускание, % при ν. */
export function irT(bands, nu) {
  let a = 0;
  for (const [c, d, w] of bands) a += d * Math.exp(-(((nu - c) / w) ** 2));
  return 100 * Math.exp(-1.6 * a) * 0.97 + 1;
}
/** Диагностическая полоса и отнесение. */
export const IR_DIAG = { trans: 965, cis: 690 };
