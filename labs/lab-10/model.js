/**
 * Модель работы № 10 — качественные реакции. Чистые функции (тестируются в Node: tests/lab10-model.test.js).
 * Количества — из методички (раздел 6): 1 мл растворов, капли (1 капля ≈ 0,05 мл), концентрации раздела 5.
 * Всё, чего в методичке нет (скорости, растворимости, пороги окраски), — в labs/lab-10/ASSUMPTIONS.md.
 */

export const DROP = 0.05; // мл
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/** Молярные массы, г/моль. */
export const M = { ox: 90.03, KMnO4: 158.03, tart: 150.09, citr: 192.12, KOH: 56.11, NaOH: 40.0, CuSO4: 159.61, phenol: 94.11, Br2: 159.81, HCl: 36.46, lact: 90.08 };

/* ------------------------------------------------------------------ опыт 1: KMnO₄ + H₂C₂O₄ */

/** Масса щавелевой кислоты (мг), окисляемая v мл раствора KMnO₄ массовой доли w (ρ = 1,00 г/мл): 5H₂C₂O₄ : 2KMnO₄. */
export function oxalicByPermanganate(vMl, w = 0.005) {
  const nK = (vMl * 1.0 * w * 1000) / M.KMnO4; // ммоль
  return nK * 2.5 * M.ox; // мг
}

/**
 * Скорость обесцвечивания перманганата (доля x прореагировавшего, 0…1) — автокатализ ионами Mn²⁺:
 * dx/dt = f(T) · acid · (a + b·x) · (1 − x) · √(3 / капли).
 * f(T) = 2^((T − 65)/10): при 60–70 °C — минуты, при 20 °C — часы.
 */
export function kmno4Rate(x, T, { acid = true, drops = 3 } = {}) {
  if (drops <= 0 || x >= 1) return 0;
  const f = Math.pow(2, (T - 65) / 10);
  const a = 0.0012, b = 0.03;
  return f * (acid ? 1 : 0.35) * (a + b * x) * (1 - x) * Math.sqrt(3 / Math.max(1, drops));
}

/** Окраска раствора перманганата: violet — остаток MnO₄⁻, brown — муть MnO₂. */
export function kmno4Color(x, drops, brown = 0) {
  const v = clamp((1 - x) * Math.min(1.4, drops / 3), 0, 1.4);
  if (brown > 0.05) return `rgba(${Math.round(150 - 20 * brown)},${Math.round(70 + 20 * brown)},${Math.round(150 - 110 * brown)},${(0.25 + 0.45 * Math.max(v, brown)).toFixed(2)})`;
  if (v < 0.04) return null; // бесцветный — цвет жидкости по умолчанию
  return `rgba(140,40,165,${(0.18 + 0.55 * Math.min(1, v)).toFixed(2)})`;
}

/* ------------------------------------------------------------------ опыт 2: молочная кислота */

/**
 * Реакция Уффельмана: доля Fe³⁺, перешедшего из фенолята (фиолетовый) в лактат (жёлто-зелёный).
 * fe — капли 1 % FeCl₃, lac — капли молочной кислоты. Половина железа связана при lac = 2·fe.
 */
export function uffelmann({ phenol, fe, lac }) {
  if (!fe) return { share: 0, violet: 0, yg: 0, color: null };
  const share = lac / (lac + 2 * fe);
  const amt = Math.min(1.6, fe / 2);
  const violet = phenol ? amt * (1 - share) : 0;
  const yg = amt * (phenol ? share : 1);
  let color;
  if (violet >= yg) color = `rgba(${Math.round(105 + 60 * share)},${Math.round(40 + 120 * share)},${Math.round(160 - 90 * share)},${(0.3 + 0.4 * Math.min(1, violet + yg)).toFixed(2)})`;
  else color = `rgba(${Math.round(170 - 30 * (violet / (yg || 1)))},${Math.round(190 - 60 * (violet / (yg || 1)))},${Math.round(60 + 60 * (violet / (yg || 1)))},${(0.3 + 0.35 * Math.min(1, yg)).toFixed(2)})`;
  return { share, violet, yg, color };
}

/** Иодоформная проба: сколько иода «съедается» до устойчивой жёлтой окраски, капель. */
export const IODINE_NEED = 6;

/**
 * Иодоформная проба. i — капли I₂/KI; naoh — мл 10 % NaOH. Возвращает избыточный иод (окраска) и предел образования CHI₃.
 */
export function iodine({ i, naoh }) {
  if (!naoh) return { excess: i, limit: 0, color: i ? `rgba(150,85,25,${clamp(0.25 + i * 0.08, 0, 0.8).toFixed(2)})` : null };
  const excess = Math.max(0, i - IODINE_NEED);
  const limit = Math.min(1, i / IODINE_NEED);
  const color = excess <= 0 ? null : excess <= 3 ? `rgba(236,205,90,${(0.25 + excess * 0.08).toFixed(2)})` : `rgba(165,95,30,${clamp(0.35 + (excess - 3) * 0.07, 0, 0.8).toFixed(2)})`;
  return { excess, limit, color };
}

/** Скорость образования иодоформа (1/с) при температуре T: оптимум 40–50 °C, выше 60 °C иодоформ улетучивается. */
export function iodoformRate(T) { return 0.012 * Math.pow(2, (T - 45) / 10); }
export function iodoformLoss(T) { return T > 60 ? 0.0012 * (T - 60) : 0; }

/* ------------------------------------------------------------------ опыт 3: винная кислота */

export const TART = { n: (1 * 0.1) / M.tart * 1000, koh: (DROP * 0.1 * 1000) / M.KOH, sol: 0.046 }; // ммоль: в 1 мл 10 %; в капле 10 % KOH; KHT растворимо в ~1,5 мл

/** Гидротартрат калия в пробирке (ммоль) и pH при данном числе капель KOH. */
export function khtState(kohDrops) {
  const n = TART.n, oh = kohDrops * TART.koh;
  const kht = oh <= n ? oh : Math.max(0, 2 * n - oh);
  let pH;
  if (oh < 0.05 * n) pH = 2.2;
  else if (oh < n) pH = 3 + (oh / n) * 0.9;
  else if (oh < 1.95 * n) pH = 4 + ((oh - n) / n) * 2;
  else if (oh <= 2 * n) pH = 7.5;
  else pH = clamp(12 + Math.log10((oh - 2 * n) / 0.5 + 0.01) * 0.5, 9, 13.5);
  return { kht, super: kht - TART.sol, pH, excess: oh >= 2 * n };
}

export const CU = { cu: (1 * 0.05 / M.CuSO4) * 1000, ohPerMl: (1 * 0.1 / M.NaOH) * 1000, tPerDrop: (DROP * 0.1 / M.tart) * 1000 };

/**
 * Cu(OH)₂ + тартрат. naoh — мл 10 % NaOH, tart — капли 10 % винной кислоты, cu — есть ли 1 мл 5 % CuSO₄.
 * Тартрат связывает Cu(OH)₂ в растворимый синий хелат только в щелочной среде.
 */
export function cuTartrate({ cu, naoh, tart }) {
  const Cu = cu ? CU.cu : 0, OH = naoh * CU.ohPerMl, T = tart * CU.tPerDrop;
  const hyd = Math.min(Cu, OH / 2);
  const free = OH - 2 * hyd - 2 * T; // свободная щёлочь после нейтрализации обеих COOH
  if (!Cu) return { ppt: 0, chelate: 0, acid: free < 0, free, color: null };
  if (free < 0) return { ppt: 0, chelate: 0, acid: true, free, color: 'rgba(120,185,230,.45)' };
  const chelate = Math.min(Cu, T);
  const ppt = Math.max(0, hyd - chelate) / Cu;
  const deep = chelate / Cu;
  const color = deep > 0.05 ? `rgba(${Math.round(80 - 50 * deep)},${Math.round(150 - 80 * deep)},${Math.round(225 - 10 * deep)},${(0.3 + 0.45 * deep).toFixed(2)})` : hyd ? 'rgba(150,200,235,.35)' : 'rgba(120,185,230,.45)';
  return { ppt, chelate: deep, acid: false, free, color };
}

/* ------------------------------------------------------------------ опыт 4: Ca²⁺ — лимонная и винная */

/** pH смеси 1 мл 10 % кислоты с V мл известковой воды (по методичке щелочная среда — при 3–5 мл; модель по объёму, см. ASSUMPTIONS). */
export function limePH(V) {
  if (V <= 0) return 2.2;
  if (V < 1) return 2.6;
  if (V < 2) return 3.8;
  if (V < 3) return 5.6;
  return Math.min(11.5, 9 + (V - 3) * 0.6);
}

/** Осадок кальциевой соли: tartrate — уже на холоду; citrate — только при нагревании в щелочной среде. */
export function caSalt(acid, V, hot) {
  const pH = limePH(V);
  if (acid === 'tart') return V >= 1 ? clamp(0.35 + (V - 1) * 0.15, 0, 0.9) : 0;
  return hot && pH >= 7 ? clamp(0.5 + (V - 3) * 0.1, 0, 0.9) : 0;
}

/* ------------------------------------------------------------------ опыт 5: кето-енольная таутомерия */

export const ENOL = { tau: 25, perDrop: 0.5, eq: 1 };

/** Восстановление енола за dt секунд: избыточный Br₂ (B) расходует енол первым. */
export function enolRelax(t, dt) {
  if (!(dt > 0) || !t.eaa) return t;
  const gain = (ENOL.eq - t.E) * (1 - Math.exp(-dt / ENOL.tau));
  let g = gain;
  if (t.B > 0) { const use = Math.min(t.B, g); t.B -= use; g -= use; }
  t.E = clamp(t.E + g, 0, ENOL.eq);
  return t;
}

/** Капля бромной воды. */
export function enolBrom(t) {
  if (!t.eaa) { t.B = (t.B || 0) + ENOL.perDrop; return t; }
  if (t.E >= ENOL.perDrop) t.E -= ENOL.perDrop;
  else { t.B = (t.B || 0) + (ENOL.perDrop - t.E); t.E = 0; }
  return t;
}

export function enolColor(t) {
  const c = t.fe ? clamp(t.E / ENOL.eq, 0, 1) * Math.min(1, t.fe / 1.5) : 0;
  if (c > 0.08) return `rgba(165,35,105,${(0.2 + 0.55 * c).toFixed(2)})`;
  if (t.B > 0.3) return `rgba(236,200,90,${clamp(0.2 + t.B * 0.12, 0, 0.6).toFixed(2)})`;
  if (t.fe) return 'rgba(240,215,130,.3)';
  return null;
}

/* ------------------------------------------------------------------ опыт 6: фенолы + FeCl₃ */

export const PHENOL_COLORS = {
  ph: 'rgba(105,45,170,.72)',   // фиолетовый
  res: 'rgba(70,20,120,.86)',   // тёмно-фиолетовый
  sal: 'rgba(160,40,140,.74)',  // фиолетовый (красно-фиолетовый)
  hq0: 'rgba(85,150,90,.5)',    // кратковременно зеленоватый
  hq1: 'rgba(232,195,70,.55)',  // жёлтый (п-бензохинон)
  eth: 'rgba(240,215,130,.3)',  // бледно-жёлтый от самого FeCl₃
  ethDirty: 'rgba(125,70,170,.35)', // загрязнён фенолом
  masked: 'rgba(130,70,45,.65)',    // избыток FeCl₃ — бурое, окраска маскируется
};

/* ------------------------------------------------------------------ опыт 7: бромирование фенола */

export const BROM = { phenol: (1 * 0.01 / M.phenol) * 1000, perDrop: (DROP * 35 / M.Br2) }; // ммоль фенола в 1 мл 1 %; Br₂ в капле насыщенной (≈ 35 г/л) бромной воды
export const bromNeed = () => (3 * BROM.phenol) / BROM.perDrop; // капель до полного бромирования

export function bromination(drops) {
  const need = bromNeed();
  const ppt = clamp(drops / need, 0, 1);
  const excess = Math.max(0, drops - need);
  return { ppt, excess, need, color: excess > 0.5 ? `rgba(236,190,70,${clamp(0.2 + excess * 0.05, 0, 0.7).toFixed(2)})` : null };
}

/* ------------------------------------------------------------------ опыт 8: кислотность фенола */

export const EMUL = { phenol: 2.6, cap: 0.88, oh: (DROP * 1.1 * 0.1 / M.NaOH) * 1000, h: (DROP * 1.05 * 0.1 / M.HCl) * 1000 }; // ммоль; растворимость фенола ≈ 0,88 ммоль/мл (8,3 г/100 мл)

/** Пробирка с фенольной эмульсией: oh/h — капли NaOH и HCl, v — объём водной фазы, мл. */
export function emulsion({ em, oh = 0, h = 0, v = 1 }) {
  if (!em) return { turb: 0, pH: h > 0 ? 1 : oh > 0 ? 13 : 7, phenoxide: 0 };
  const OH = oh * EMUL.oh, H = h * EMUL.h, net = OH - H;
  const phenoxide = clamp(net, 0, EMUL.phenol);
  const free = EMUL.phenol - phenoxide;
  const turb = clamp((free - EMUL.cap * v) / 0.6, 0, 1);
  let pH;
  if (net > EMUL.phenol) pH = 13;
  else if (net > 0.02) pH = clamp(10 + Math.log10(phenoxide / Math.max(0.01, free)), 8, 12.5);
  else if (net > -0.02) pH = 5.5;
  else pH = clamp(-Math.log10(-net / Math.max(0.5, v)), 0.5, 3);
  return { turb, pH, phenoxide };
}
