/**
 * Модель вводного занятия (чистые функции, тестируются в Node: tests/lab00-model.test.js).
 * Разбавление серной кислоты (п. 4.3 правил ТБ), нейтрализация кислых отходов (п. 10.3),
 * нагрев в колбонагревателе (раздел 7). Константы, которых нет в правилах ТБ, — в ASSUMPTIONS.md.
 */

/** Конц. H₂SO₄ — как в методичке (работа 6–7): 96–98 %, d 1,84. */
export const ACID = { w: 0.96, d: 1.84, M: 98.08 };
/** Теплота разбавления конц. H₂SO₄ большим избытком воды, кДж/моль (допущение, справочное ≈ 70–95). */
export const DIL_HEAT = 74;
export const M_NAHCO3 = 84.01;

/** Массовая доля H₂SO₄ (%) после приливания vAcid мл конц. кислоты к vWater мл воды. */
export function dilutedPercent(vAcid, vWater) {
  const mAcid = vAcid * ACID.d;
  const mH2SO4 = mAcid * ACID.w;
  return (mH2SO4 / (mAcid + vWater * 1.0)) * 100;
}

/**
 * Нагрев раствора при приливании порции dv мл конц. кислоты к раствору массой mSol г (перемешивание, без теплопотерь).
 * Теплоёмкость разбавленного раствора ≈ 4,0 Дж/(г·К).
 */
export function dilutionRise(dv, mSol) {
  const mol = (dv * ACID.d * ACID.w) / ACID.M;
  const q = mol * DIL_HEAT * 1000; // Дж
  return q / ((mSol + dv * ACID.d) * 4.0);
}

/** Объём конц. H₂SO₄ (мл) для mSol г раствора с массовой долей pct %. */
export function acidVolumeFor(pct, mSol) {
  return (mSol * pct / 100) / ACID.w / ACID.d;
}

/** Масса NaHCO₃ (г) для нейтрализации n ммоль сильной кислоты (HCl). */
export function bicarbonateFor(mmolH) {
  return (mmolH / 1000) * M_NAHCO3;
}

/**
 * pH водных отходов: h — ммоль сильной кислоты, b — ммоль NaHCO₃, oh — ммоль NaOH, V — мл.
 * Избыток кислоты — по [H⁺]; избыток гидрокарбоната — буфер CO₂/HCO₃⁻ (pKa 6,35, растворённый CO₂ ≤ 33 мМ),
 * не выше 8,3; избыток щёлочи (сверх гидрокарбоната) — по [OH⁻].
 */
export function wastePH(h, b, oh, V) {
  const L = V / 1000;
  const acid = h - b - oh;
  if (acid > 1e-6) return Math.max(0, -Math.log10(acid / 1000 / L));
  // сильная кислота сначала с OH⁻, остаток — с HCO₃⁻ (→ CO₂); лишний OH⁻ переводит HCO₃⁻ в CO₃²⁻
  const x = Math.min(h, oh), h1 = h - x, oh1 = oh - x;
  const y = Math.min(h1, b), b1 = b - y;
  const z = Math.min(oh1, b1), b2 = b1 - z, oh2 = oh1 - z;
  if (oh2 > 0.05) return Math.min(14, 14 + Math.log10(oh2 / 1000 / L));
  if (z > 1e-6) return Math.min(12.5, Math.max(8.3, 10.33 + Math.log10(z / Math.max(b2, 1e-3))));
  const co2 = Math.min(Math.max(y, 0.01), 33 * L); // ммоль растворённого CO₂ (остальной выделяется пузырьками)
  return Math.min(8.3, Math.max(4.6, 6.35 + Math.log10(Math.max(b2, 1e-3) / co2)));
}

/** Температура кипения жидкости в колбе для учебного нагрева (этанол, °C). */
export const ETHANOL_BP = 78;
/** Установившаяся температура колбонагревателя по ступени мощности 0…3 (допущение). */
export const MANTLE_T = [22, 70, 110, 160];
