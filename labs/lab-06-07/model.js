/**
 * Модель работы 6–7 (перенесена из прототипа автора reference/lab06-07-m-nitrobenzoic-acid.html).
 * Количества — по методичке: 2,0 г (16,4 ммоль) бензойной кислоты, M(м-НБК) = 167,12 г/моль, теор. выход 2,74 г,
 * соотношение изомеров ≈ 80 % мета / 19 % орто / 1–2 % пара, pKa(м-НБК) = 3,45, т. пл. 140–141 °C, бензойной — 122 °C.
 * Всё прочее (кинетика, растворимость, потери) — допущения, см. ASSUMPTIONS.md.
 */
export const M = { BA: 122.12, NBA: 167.12, DNBA: 212.12 };

export const theoretical = (mBA) => (mBA * M.NBA) / M.BA;
export const percentYield = (m, mBA) => (mBA > 0 ? (m / theoretical(mBA)) * 100 : 0);

/* ---------- pH: баланс зарядов для м-нитробензойной кислоты (pKa 3,45; растворимость ≈ 0,015 М) ---------- */
const KA = 10 ** -3.45, SOL = 0.015, KW = 1e-14;
/**
 * net — избыток сильного основания над сильной кислотой, ммоль; Cm — кислота, ммоль; V — объём, мл.
 * → { pH, ppt } ppt — ммоль выпавшей свободной кислоты.
 */
export function pHcalc(net, Cm, V) {
  const nn = net / V, c = Cm / V, F = (x) => nn + x - (KA * c) / (KA + x) - KW / x;
  let lo = -15, hi = 1.5;
  for (let i = 0; i < 70; i++) { const m = (lo + hi) / 2; if (F(10 ** m) > 0) hi = m; else lo = m; }
  let x = 10 ** ((lo + hi) / 2), ppt = 0;
  if ((c * x) / (KA + x) > SOL) {
    x = (-nn + Math.sqrt(nn * nn + 4 * (KA * SOL + KW))) / 2;
    ppt = Math.max(0, c - SOL - (KA * SOL) / x) * V;
  }
  return { pH: -Math.log10(x), ppt };
}

/** pH промывных вод после n промывок (кислота смывается, предел — собственная растворимость продукта, pH ≈ 3). */
export const washPH = (n) => -Math.log10(10 ** -(0.4 + 0.75 * n) + 10 ** -2.9);

/** Растворимость м-нитробензойной кислоты в воде, г/мл, при t °C (аппроксимация, допущение). */
export const solubility = (t) => 0.0024 * Math.exp(0.0316 * (t - 20));

/**
 * Сырой продукт после фильтрования. S — state опыта 1.
 * conv — конверсия (выдержка), d — доля динитрования, ox — окисление (от «перегрева» E, °C·с выше 10 °C).
 */
export function makeCrude(S) {
  const n = S.mBA / M.BA, H = S.hold, N = S.nit;
  const conv = Math.min(0.98, 0.8 + 0.12 * Math.min(1, H.bath / 600) + 0.06 * Math.min(1, H.room / 600) - (S.mixHot ? 0.05 : 0));
  const d = Math.min(0.35, Math.max(0, 0.006 + N.E / 12000)), ox = Math.min(0.2, Math.max(0, N.E / 30000));
  const nN = n * conv * (1 - ox), keep = Math.max(0.2, 1 - S.pour.loss - S.filt.tloss);
  const c = {
    meta: Math.max(0.05, nN * (1 - d) * 0.8 * M.NBA * keep - S.filt.loss),
    ortho: nN * (1 - d) * 0.185 * M.NBA * keep * 0.7,
    para: nN * (1 - d) * 0.015 * M.NBA * keep,
    di: nN * d * M.DNBA * keep,
    ba: n * (1 - conv) * M.BA * keep * 0.9,
    d, conv, ox, keep,
  };
  c.acid = S.filt.pH < 2.5 ? 0.06 : 0.008;
  c.org = c.meta + c.ortho + c.para + c.di + c.ba;
  c.tot = c.org * (1 + c.acid);
  S.crude = c;
  return c;
}

/** Чистый продукт после перекристаллизации. */
export function makeFin(S) {
  const c = S.crude, R = S.rec, imp = R.full ? 1 : 3;
  const metaLoss = R.V * (R.shock ? 0.0022 : 0.0024) + 0.04;
  const meta = Math.max(0.05, c.meta - metaLoss);
  const o = {
    meta,
    ortho: c.ortho * 0.05 * imp * (R.shock ? 1.6 : 1),
    para: c.para * 0.45,
    di: c.di * 0.3 * imp * (R.shock ? 1.3 : 1),
    ba: Math.max(0, c.ba - R.V * 0.0017) * 0.6 * imp,
    acid: c.acid * 0.1 * c.org,
    motherMeta: c.meta - meta,
  };
  o.m = o.meta + o.ortho + o.para + o.di + o.ba + o.acid;
  o.purity = o.meta / o.m;
  S.fin = o;
  return o;
}

/** Интервал плавления продукта (°C) по чистоте p, влажности w, слою и растиранию. */
export function mpRange(p, w, layer, ground) {
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  return {
    on: clamp(140.8 - 60 * (1 - p) - (w > 0.02 ? w * 40 : 0), 112, 141),
    end: clamp(141.2 - 15 * (1 - p) - (w > 0.02 ? w * 8 : 0), 118, 141.3) + (layer > 3.2 ? 0.8 : 0) + (ground ? 0 : 0.6),
  };
}

/**
 * «Куда делся продукт»: доли от теоретического выхода (в пересчёте на м-нитробензойную кислоту).
 * Возвращает [{ id, frac }] — сумма = 1.
 */
export function lossBreakdown(S) {
  const th = theoretical(S.mBA);
  if (!th || !S.crude || !S.fin) return [];
  const c = S.crude, f = S.fin;
  const n = S.mBA / M.BA;
  const prod = Math.min(th, f.meta);
  const unreacted = n * (1 - c.conv) * M.NBA;               // не прореагировало
  const side = n * c.conv * (c.ox + (1 - c.ox) * (c.d + (1 - c.d) * 0.2)) * M.NBA; // окисление, динитрование, орто/пара
  const handling = n * c.conv * (1 - c.ox) * (1 - c.d) * 0.8 * M.NBA * (1 - c.keep) + S.filt.loss; // выливание и фильтрование
  const mother = Math.max(0, f.motherMeta);
  const other = Math.max(0, th - prod - unreacted - side - handling - mother);
  const parts = [['product', prod], ['side', side], ['unreacted', unreacted], ['handling', handling], ['mother', mother], ['other', other]];
  const tot = parts.reduce((a, [, v]) => a + Math.max(0, v), 0) || 1;
  return parts.map(([id, v]) => ({ id, frac: Math.max(0, v) / tot }));
}
