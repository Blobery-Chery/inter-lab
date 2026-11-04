/**
 * Модель работы № 11: окраска, осадок и pH пробирок качественных реакций аминокислот и белков.
 * Чистые функции (без DOM) — тестируются в Node (tests/lab11-model.test.js).
 *
 * Пробирка — объект с количествами: объёмы растворов в мл, капли реактивов, накопленный нагрев.
 * Каждая функция appearance-типа возвращает { key, color, ppt, pptColor, … }: key — что видит студент
 * (по нему выбирается верное описание наблюдения), остальное — для сцены (app/scene/svg.js → tube()).
 * Концентрации и объём капли — в ASSUMPTIONS.md (методичка даёт только массовые доли).
 */

export const DROP = 0.05; // мл, одна капля из капельной пипетки
/** Молярные концентрации растворов из методички (раздел 5), моль/л = ммоль/мл. */
export const CONC = {
  cu5: 0.20,    // 5 % CuSO₄ (по CuSO₄·5H₂O)
  cu1: 0.04,    // 1 % CuSO₄
  naoh10: 2.75, // 10 % NaOH
  naoh30: 10.0, // 30 % NaOH
  hno3: 14.4,   // HNO₃ 65–68 %
  gly: 0.133,   // 1 % глицин
};

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const rgba = (r, g, b, a) => `rgba(${r},${g},${b},${clamp(a, 0, 1).toFixed(2)})`;

/** Вид исходного раствора белка (опыт 1, шаг «приготовление»): 'ok' | 'nofilter' | 'conc'. */
export function eggLook(prep) {
  if (prep === 'nofilter') return { color: 'rgba(232,228,205,.6)', ppt: 0.25, pptColor: '#e9e4cf' };
  if (prep === 'conc') return { color: 'rgba(238,226,170,.75)', ppt: 0 };
  return { color: 'rgba(236,234,215,.45)', ppt: 0 };
}

/**
 * Нагрев: скорость реакции относительно кипящей бани. ≥ 95 °C — 1; ниже резко падает.
 * Значения — допущение (качественная картина: нингидриновая и ксантопротеиновая пробы при 60–70 °C идут медленно).
 */
export function heatRate(T) {
  if (T >= 95) return 1;
  if (T <= 40) return 0.02;
  return 0.02 + 0.6 * ((T - 40) / 55) ** 2;
}

/** Модель водяной бани на плитке: T стремится к 100 °C (плитка вкл.) или к комнатной. */
export function bathStep(T, on, sec) {
  const target = on ? 100.5 : 22;
  const k = on ? 0.0042 : 0.0015;
  const next = T + (target - T) * Math.min(1, k * sec);
  return Math.min(100, next);
}

/* ------------------------------------------------------------ опыт 1: глицинат меди(II) */
/**
 * t: { cu (капли 5 % CuSO₄), oh (капли 10 % NaOH), gly (мл 1 % глицина), water (мл), shaken }
 * Cu²⁺ + 2OH⁻ → Cu(OH)₂↓;  Cu(OH)₂ + 2 Gly → Cu(Gly)₂ (тёмно-синий раствор).
 */
export function glycinate(t) {
  const cu = (t.cu || 0) * DROP * CONC.cu5;
  const oh = (t.oh || 0) * DROP * CONC.naoh10;
  const hyd = Math.min(cu, oh / 2);                // Cu(OH)₂, ммоль
  const free = cu - hyd;                            // Cu²⁺ в растворе (не хватило щёлочи)
  const gly = (t.gly || 0) * CONC.gly;
  const cplx = Math.min(cu, gly / 2) * (t.shaken ? 1 : 0.3);
  const fromPpt = Math.max(0, cplx - free);         // сначала связывается свободный Cu²⁺, затем осадок
  const left = Math.max(0, hyd - fromPpt);
  const V = (t.gly || 0) + (t.water || 0) + ((t.cu || 0) + (t.oh || 0)) * DROP;
  const dissolved = hyd > 1e-6 ? 1 - left / hyd : 0;
  let color = null;
  if (cplx > 1e-6) color = rgba(28, 62, 196, 0.3 + 30 * (cplx / Math.max(V, 0.1)));
  else if (free > 1e-6) color = rgba(80, 150, 230, 0.3);
  const key = hyd < 1e-6 ? (cu > 0 ? 'cu' : 'empty') : dissolved >= 0.95 ? 'dissolved' : dissolved >= 0.15 ? 'partial' : 'ppt';
  return { key, cu, oh, hyd, cplx, dissolved, color, ppt: clamp(left / 0.03, 0, 1), pptColor: '#4f97d6' };
}

/* ------------------------------------------------------------ опыт 2: нингидриновая реакция */
/** t: { sub: 'gly'|'egg', ninh (капли), ext (накопленный нагрев: 1 ≈ 90 с в кипящей бане) } */
export function ninhydrin(t, prep = 'ok') {
  const dose = clamp((t.ninh || 0) / 4, 0, 1);
  const I = clamp(t.ext || 0, 0, 1) * dose * (t.sub === 'egg' ? 0.85 : 1);
  const base = t.sub === 'egg' ? eggLook(prep) : { color: null, ppt: 0 };
  const key = I >= 0.55 ? 'strong' : I >= 0.12 ? 'weak' : 'none';
  const color = I >= 0.05 ? rgba(92, 38, 168, 0.18 + 0.7 * I) : base.color;
  return { key, I, color, ppt: base.ppt, pptColor: base.pptColor };
}
/** Прирост нагрева за sec секунд в бане с температурой T. */
export function heatGain(sec, T, per = 90) { return (sec / per) * heatRate(T); }

/* ------------------------------------------------------------ опыт 3: биуретовая реакция */
/**
 * t: { sub: 'egg'|'gel'|'gly', oh (мл 10 % NaOH), cu (капли 1 % CuSO₄), shaken, dirty (остатки пурпура Руэмана) }
 * Пептиды в сильнощелочной среде + Cu²⁺ → фиолетовый (красно-фиолетовый) комплекс; избыток CuSO₄ маскирует.
 */
export function biuret(t, prep = 'ok') {
  const pep = t.sub === 'egg' || t.sub === 'gel';
  const cu = t.cu || 0, alk = (t.oh || 0) >= 0.8;
  const base = t.sub === 'egg' ? eggLook(prep) : { color: null, ppt: 0 };
  let key, color = base.color, ppt = base.ppt, pptColor = base.pptColor;
  if (cu === 0) key = alk ? 'alk' : 'none';
  else if (!alk) { key = 'nobase'; color = rgba(110, 170, 230, 0.32); ppt = pep ? 0.2 : 0; pptColor = '#cfe2f0'; }
  else if (cu >= 6) { key = 'masked'; color = rgba(60, 120, 220, 0.55); ppt = 0.45; pptColor = '#4f97d6'; }
  else if (pep && cu >= 4) { key = 'blueish'; color = rgba(95, 95, 210, 0.6); }
  else if (pep) {
    const a = (t.sub === 'egg' ? 0.55 : 0.45) + 0.08 * cu + (prep === 'conc' && t.sub === 'egg' ? 0.15 : 0);
    key = t.sub === 'egg' ? 'violet' : 'redviolet';
    color = t.sub === 'egg' ? rgba(132, 58, 182, a) : rgba(168, 52, 140, a);
  } else if (t.dirty) { key = 'lilac'; color = rgba(150, 110, 205, 0.45); }
  else { key = 'blue'; color = rgba(90, 150, 225, 0.42); }
  if (!t.shaken && cu > 0 && key !== 'nobase') key = 'unmixed';
  return { key, color, ppt, pptColor };
}

/* ------------------------------------------------------------ опыт 4: ксантопротеиновая реакция */
/** pH по избытку щёлочи (net > 0) или кислоты (net < 0), ммоль, в объёме V мл. */
export function pHof(net, V) {
  const c = Math.abs(net) / Math.max(V, 0.05);
  if (c < 1e-7) return 7;
  return net > 0 ? clamp(14 + Math.log10(c), 7, 14) : clamp(-Math.log10(c), 0, 7);
}
/**
 * t: { sub: 'egg'|'gel', v (мл раствора белка), hno3 (капли), oh (капли 30 % NaOH), ext (нагрев: 1 ≈ 75 с в кипящей бане) }
 * Нитрование остатков Tyr/Trp → жёлтые нитропроизводные; в щелочной среде — оранжевые соли.
 */
export function xantho(t, prep = 'ok') {
  const tyr = t.sub === 'egg' ? 1 : 0.15;        // желатин беден тирозином, без триптофана
  const acid = (t.hno3 || 0) * DROP * CONC.hno3, base = (t.oh || 0) * DROP * CONC.naoh30;
  const V = (t.v || 1) + ((t.hno3 || 0) + (t.oh || 0)) * DROP;
  const pH = (t.hno3 || 0) + (t.oh || 0) > 0 ? pHof(base - acid, V) : 7;
  const N = clamp(t.ext || 0, 0, 1) * clamp((t.hno3 || 0) / 5, 0, 1);
  const Y = N * tyr;
  const denat = t.sub === 'egg' && (t.hno3 || 0) >= 1;
  const egg = eggLook(prep);
  let color = t.sub === 'egg' ? egg.color : null, pptColor = '#f4f2ea';
  if (Y >= 0.04) {
    if (pH >= 9) { color = rgba(236, 120, 22, 0.25 + 0.65 * Y); pptColor = '#e8892a'; }
    else if (pH >= 6.5) { color = rgba(238, 160, 30, 0.2 + 0.65 * Y); pptColor = '#e9b13c'; }
    else { color = rgba(236, 198, 32, 0.15 + 0.7 * Y); pptColor = '#e9cf4a'; }
  }
  const ppt = denat ? (prep === 'conc' ? 0.9 : 0.55) : 0;
  let key;
  if ((t.hno3 || 0) === 0) key = 'none';
  else if (Y < 0.08) key = denat ? 'white' : 'colourless';
  else if (Y < 0.3) key = pH >= 9 ? 'paleOrange' : 'paleYellow';
  else key = pH >= 9 ? 'orange' : 'yellow';
  return { key, pH, Y, color, ppt, pptColor };
}

/* ------------------------------------------------------------ опыт 5: реакция Фоля */
/**
 * t: { sub: 'egg'|'gel', oh (мл 30 % NaOH), pb (капли 5 % Pb(CH₃COO)₂) }, boil — секунды кипения.
 * S²⁻ из остатков Cys/цистина + плюмбит → PbS↓ (чёрно-бурый). Методичка: кипятить 2–3 мин.
 */
export function fohl(t, boil = 0) {
  const cys = t.sub === 'egg' ? 1 : 0.03;
  const alk = (t.oh || 0) >= 0.8;
  const pb = t.pb || 0;
  const ext = alk ? clamp(boil / 150, 0, 1) ** 1.5 : 0;
  const D = ext * cys * clamp(pb / 3, 0, 1);
  let key;
  if (pb === 0) key = 'nopb';
  else if (!alk) key = 'noalk';
  else if (D >= 0.6) key = 'black';
  else if (D >= 0.18) key = 'brown';
  else if (D >= 0.04) key = 'trace';
  else key = 'none';
  const pre = !alk && pb > 0 && t.sub === 'egg'; // без щёлочи: белый осадок с белком, Pb(OH)₂ не растворился
  const color = D >= 0.04 ? rgba(70, 48, 30, 0.25 + 0.6 * D) : rgba(236, 232, 214, 0.4);
  return { key, D, color, ppt: D >= 0.04 ? clamp(0.3 + D, 0, 1) : pre ? 0.4 : 0, pptColor: D >= 0.04 ? '#2b1d14' : '#f2f0e6' };
}

/* ------------------------------------------------------------ опыт 6: осаждение белков */
/** Высаливание: t: { egg (мл), sat (мл насыщ. (NH₄)₂SO₄), filtered, solid (насыщено тв. солью), dil (мл воды на осадок) } */
export function saltOut(t, prep = 'ok') {
  const frac = (t.sat || 0) / Math.max(0.1, (t.egg || 0) + (t.sat || 0)); // доля насыщения
  let key = 'clear', ppt = 0;
  if (t.dil > 0) { key = t.dil >= 2 ? 'redissolved' : 'partly'; ppt = t.dil >= 2 ? 0.05 : 0.35; }
  else if (t.solid) { key = 'albumins'; ppt = 0.85; }
  else if (t.filtered) { key = 'filtrate'; ppt = 0; }
  else if (frac >= 0.45) { key = 'globulins'; ppt = prep === 'conc' ? 0.9 : 0.5; }
  else if (frac >= 0.25) { key = 'haze'; ppt = 0.15; }
  return { key, frac, ppt, color: eggLook(prep).color, pptColor: '#f6f4ec' };
}
/** Тепловая денатурация: t: { ac (капли 1 % CH₃COOH), heated } */
export function heatCoag(t, prep = 'ok') {
  if (!t.heated) return { key: 'clear', ppt: eggLook(prep).ppt, color: eggLook(prep).color };
  if ((t.ac || 0) >= 1 && (t.ac || 0) <= 4) return { key: 'flakes', ppt: 0.8, color: 'rgba(236,234,220,.35)', pptColor: '#fbfaf4' };
  if ((t.ac || 0) > 4) return { key: 'flakesAcid', ppt: 0.6, color: 'rgba(236,234,220,.45)', pptColor: '#fbfaf4' };
  return { key: 'opal', ppt: 0.3, color: 'rgba(240,238,228,.75)', pptColor: '#fbfaf4' };
}
/** Соли тяжёлых металлов: t: { cu (капли 5 % CuSO₄) } — осадок, при избытке частично растворяется (адсорбция ионов). */
export function heavyMetal(t, prep = 'ok') {
  const cu = t.cu || 0;
  if (cu === 0) return { key: 'clear', ppt: eggLook(prep).ppt, color: eggLook(prep).color };
  if (cu < 8) return { key: 'ppt', ppt: clamp(0.25 + cu * 0.12, 0, 0.9), color: rgba(150, 195, 230, 0.35), pptColor: '#bcd8ec' };
  return { key: 'excess', ppt: 0.45, color: rgba(70, 135, 220, 0.55), pptColor: '#9cc4e6' };
}
/** Органический растворитель: t: { etoh (мл 96 % этанола) } */
export function ethanolPpt(t, prep = 'ok') {
  const e = t.etoh || 0;
  if (e === 0) return { key: 'clear', ppt: eggLook(prep).ppt, color: eggLook(prep).color };
  if (e < 1) return { key: 'haze', ppt: 0.15, color: 'rgba(240,238,228,.6)', pptColor: '#fbfaf4' };
  return { key: e >= 2 ? 'ppt' : 'turbid', ppt: e >= 2 ? 0.7 : 0.4, color: 'rgba(240,238,228,.8)', pptColor: '#fbfaf4' };
}

/* ------------------------------------------------------------ протокол */
/** Знак и цвет для итоговой таблицы по ключу наблюдения. */
export const SIGN = {
  dissolved: '+', partial: '±', ppt: '–',
  strong: '+', weak: '±', none: '–',
  violet: '+', redviolet: '+', blue: '–', lilac: '?', blueish: '?', masked: '?', nobase: '?', unmixed: '?', alk: '?',
  orange: '+', yellow: '+', paleOrange: '±', paleYellow: '±', white: '–', colourless: '–',
  black: '+', brown: '+', trace: '±', noalk: '?', nopb: '?',
};
