/**
 * Модель работы № 15: качественные реакции углеводов. Чистые функции — проверяются в Node (tests/lab15-model.test.js).
 *
 * Пробирка (tube) — объект в state: { id, sug, v (мл), T (°C), bath: null|'boil'|'warm', heat (с в бане), maxT,
 *   p (степень превращения, 1 — признак полностью проявился), q (образование CuO при избытке Cu(OH)₂), tApp (с по секундомеру), … реактивы }.
 * Скорость: p растёт как dt · f(T) / t100, где t100 — время проявления признака при 100 °C (для пробы Толленса — пересчитано
 * от 55 °C), f(T) = 2^((T − 100)/10) — правило Вант-Гоффа (Q10 = 2). Значения t100 — labs/lab-15/ASSUMPTIONS.md.
 */
import { L, n } from '../../app/i18n.js';
import { relax } from '../../app/instruments/thermal.js';

export const SUGARS = ['glu', 'fru', 'suc', 'mal'];

export const NAME = {
  glu: L('глюкоза', 'глюкоза', 'glucose'),
  fru: L('фруктоза', 'фруктоза', 'fructose'),
  suc: L('сахароза', 'сахароза', 'sucrose'),
  mal: L('мальтоза', 'мальтоза', 'maltose'),
};
export const NAME_CAP = {
  glu: L('Глюкоза', 'Глюкоза', 'Glucose'),
  fru: L('Фруктоза', 'Фруктоза', 'Fructose'),
  suc: L('Сахароза', 'Сахароза', 'Sucrose'),
  mal: L('Мальтоза', 'Мальтоза', 'Maltose'),
};
export const SHORT = {
  glu: L('Глю', 'Глю', 'Glc'), fru: L('Фру', 'Фру', 'Fru'), suc: L('Сах', 'Сах', 'Suc'), mal: L('Мал', 'Мал', 'Mal'),
};

/** Свойства сахаров (методичка, раздел 3.2). */
export const PROPS = {
  glu: { reducing: true, mono: true, ketose: false },
  fru: { reducing: true, mono: true, ketose: true },
  suc: { reducing: false, mono: false, ketose: false, fruUnit: true },
  mal: { reducing: true, mono: false, ketose: false },
};

/** Температуры бань, °C. */
export const BATH = { boil: 99, warm: 55, room: 22 };
export const f = (T) => Math.pow(2, (T - 100) / 10);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/**
 * Времена проявления признака при 100 °C, с (null — реакции нет) для попытки.
 * Средние подобраны под методичку: Троммер и Фелинг 2–3 мин; Барфёд моносахариды 2–3 мин, дисахариды > 10 мин;
 * Селиванов фруктоза ≈ 1 мин, сахароза — с задержкой, глюкоза — бледно-розовая лишь при долгом нагреве;
 * Толленс при 50–60 °C — «несколько минут».
 */
export function kinetics(rng) {
  const r = (m, sd) => Math.max(m * 0.6, rng ? rng.normal(m, sd) : m);
  const tol55 = f(BATH.warm); // пересчёт: t100 = t55 · f(55)
  return {
    trommer: { glu: r(120, 9), fru: r(105, 8), suc: null, mal: r(140, 10) },
    fehling: { glu: r(115, 9), fru: r(100, 8), suc: null, mal: r(135, 10) },
    tollens: { glu: r(165, 12) * tol55, fru: r(185, 14) * tol55, suc: null, mal: r(215, 15) * tol55 },
    barfoed: { glu: r(110, 9), fru: r(100, 8), suc: null, mal: r(600, 40) },
    seliwanoff: { glu: r(700, 50), fru: r(30, 3), suc: r(50, 4), mal: r(700, 50) },
  };
}

/** Время проявления для пробирки с учётом загрязнения (общая пипетка: в сахарозу попадает фруктоза). */
export function t100(test, tube, env) {
  const k = (env.kin || {})[test] || {};
  if (tube.sug === 'suc' && tube.cross && ['trommer', 'fehling', 'tollens', 'barfoed'].includes(test)) return (k.glu || 100) * 2.2;
  const base = k[tube.sug] ?? null;
  if (base && test === 'tollens' && env.nh3x > 4) return base * 1.8;
  return base;
}

/** Новая пробирка опыта. */
export function newTube(id, sug, extra = {}) {
  return { id, sug, v: 0, T: BATH.room, bath: null, heat: 0, maxT: BATH.room, p: 0, q: 0, tApp: null, tPink: null, shaken: 0, ...extra };
}

/** Один шаг модели для пробирки (dt — секунды лабораторного времени). */
export function stepTube(test, tube, env, dt) {
  const target = tube.bath ? BATH[tube.bath] : BATH.room;
  tube.T = relax(tube.T, target, tube.bath ? 0.045 : 0.012, dt);
  tube.maxT = Math.max(tube.maxT || 0, tube.T);
  if (tube.bath) tube.heat += dt;
  if (tube.bath === 'boil') tube.hb = (tube.hb || 0) + dt;
  if (tube.bath === 'warm') tube.hw = (tube.hw || 0) + dt;
  const t = t100(test, tube, env);
  const go = (cond) => { if (cond && t) tube.p = Math.min(3, tube.p + (dt * f(tube.T)) / t); };
  if (test === 'molisch') { if (tube.acid) tube.p = Math.min(3, tube.p + dt / 25); }
  else if (test === 'trommer') {
    go(tube.naoh > 0 && tube.cu > 0);
    if (excessCu(tube)) tube.q = Math.min(3, tube.q + (dt * f(tube.T)) / 45);
  } else if (test === 'fehling') go(tube.a > 0 && tube.b > 0 && tube.sugV > 0);
  else if (test === 'tollens') go(tube.tol > 0 && tube.sugV > 0);
  else if (test === 'barfoed') go(tube.bar > 0 && tube.sugV > 0);
  else if (test === 'seliwanoff') go(tube.sel > 0 && tube.sugV > 0);
}

/** Шаг всей батареи пробирок: секундомер и время появления признака. */
export function stepBench(bench, env, dt) {
  if (bench.tubes.some((t) => t.bath)) bench.swOn = true;
  if (bench.swOn) bench.sw += dt;
  for (const t of bench.tubes) {
    const before = look(bench.test, t, env).code;
    stepTube(bench.test, t, env, dt);
    const after = look(bench.test, t, env).code;
    if (after !== before) {
      if (POSITIVE[bench.test].includes(after) && t.tApp == null) t.tApp = bench.sw;
      if (after === 'pink' && t.tPink == null) t.tPink = bench.sw;
    }
  }
}

/** Прокрутить время (например, «продолжить нагревание ещё 6 мин»). */
export function simulate(bench, env, sec) {
  for (let s = 0; s < sec; s += 1) stepBench(bench, env, 1);
}

export function excessCu(t) { return t.naoh > 0 && t.cu > 6; }

/** Коды положительного признака (для времени появления). */
export const POSITIVE = {
  molisch: ['ring'], trommer: ['red'], fehling: ['red'], tollens: ['mirror', 'black'], barfoed: ['red', 'late'], seliwanoff: ['red'],
};

const C = {
  clear: 'rgba(205,225,238,.35)', deepBlue: 'rgba(30,80,200,.72)', lightBlue: 'rgba(110,165,230,.45)', green: 'rgba(70,150,110,.62)',
  yellow: 'rgba(220,175,40,.68)', orange: 'rgba(215,120,45,.7)', violet: '#7a2c93', dark: 'rgba(85,35,60,.82)',
  pink: 'rgba(240,150,175,.5)', cherry: 'rgba(170,20,55,.82)', brick: '#b0401f', black: '#262626', cuoh: '#5b8fd8', grey: 'rgba(120,120,125,.55)',
};
export const COLORS = C;

/**
 * Что видно в пробирке: { code, color, ppt, pptColor, mirror, ring (0…1), acid (мл нижнего слоя) }.
 * code — категория наблюдения (по ней проверяется запись в журнал).
 */
export function look(test, t, env = {}) {
  const o = { code: 'none', color: C.clear, ppt: 0, pptColor: null, mirror: false, ring: 0, acid: 0 };
  const P = t.p || 0;
  if (test === 'molisch') {
    if (!t.acid) { o.code = t.mol ? 'reag' : 'none'; return o; }
    o.acid = 1;
    if (t.acid === 'pour' || t.shaken) { o.code = 'mixed'; o.color = C.dark; o.acid = 0; return o; }
    o.ring = clamp(P, 0, 1);
    o.code = P >= 1 ? 'ring' : 'forming';
    return o;
  }
  if (test === 'trommer') {
    if (!t.cu) { o.code = 'none'; return o; }
    if (!(t.naoh > 0)) { o.code = 'cuso4'; o.color = C.lightBlue; return o; }
    const ex = excessCu(t);
    if (ex && t.q >= 1) { o.code = 'black'; o.color = C.grey; o.ppt = 1; o.pptColor = C.black; return o; }
    if (!t.heat) {
      o.color = C.deepBlue; o.code = ex ? 'excess' : 'chelate';
      if (ex) { o.ppt = clamp((t.cu - 6) / 8, 0.3, 1); o.pptColor = C.cuoh; }
      return o;
    }
    const w = t.weak ? 0.45 : 1;
    if (P < 0.35) { o.code = 'blue'; o.color = C.deepBlue; if (ex) { o.ppt = 0.5; o.pptColor = C.cuoh; } }
    else if (P < 0.7) { o.code = 'yellow'; o.color = C.green; o.ppt = 0.5 * w; o.pptColor = '#d9b23a'; }
    else { o.code = 'red'; o.color = P < 1 ? C.orange : C.yellow; o.ppt = clamp(P, 0.6, 1) * w; o.pptColor = C.brick; if (t.sug === 'suc') o.color = C.green; }
    return o;
  }
  if (test === 'fehling') {
    if (!(t.a > 0) && !(t.b > 0)) { o.code = 'none'; return o; }
    if (!(t.a > 0)) { o.code = 'none'; return o; }
    if (!(t.b > 0)) { o.code = 'cuso4'; o.color = C.lightBlue; return o; }
    if (!t.heat || !(t.sugV > 0)) { o.code = 'complex'; o.color = C.deepBlue; return o; }
    if (P < 0.35) { o.code = 'blue'; o.color = C.deepBlue; }
    else if (P < 0.75) { o.code = 'yellow'; o.color = C.green; o.ppt = 0.45; o.pptColor = C.orange; }
    else { o.code = 'red'; o.color = t.sug === 'suc' ? C.green : C.lightBlue; o.ppt = t.sug === 'suc' ? 0.4 : clamp(P, 0.6, 1); o.pptColor = C.brick; }
    return o;
  }
  if (test === 'tollens') {
    if (!(t.tol > 0)) { o.code = 'none'; return o; }
    if (P < 0.3) return o;
    if (P < 1) { o.code = 'grey'; o.color = C.grey; return o; }
    const bad = !env.clean || t.shaken || (t.maxT || 0) > 75;
    if (bad) { o.code = 'black'; o.color = C.grey; o.ppt = 1; o.pptColor = C.black; return o; }
    o.code = 'mirror'; o.mirror = true; o.color = 'rgba(150,150,150,.25)';
    return o;
  }
  if (test === 'barfoed') {
    if (!(t.bar > 0)) { o.code = 'none'; return o; }
    o.color = C.lightBlue;
    if (P >= 1) { o.code = t.tApp != null && t.tApp > 300 ? 'late' : 'red'; o.ppt = clamp(P - 0.5, 0.3, 1) * (o.code === 'late' ? 0.5 : 1); o.pptColor = C.brick; }
    return o;
  }
  if (test === 'seliwanoff') {
    if (!(t.sel > 0)) { o.code = 'none'; return o; }
    if (t.sug === 'glu' || t.sug === 'mal') {
      if (P >= 0.45) { o.code = 'pink'; o.color = C.pink; }
      return o;
    }
    if (P >= 1) { o.code = 'red'; o.color = C.cherry; }
    else if (P >= 0.45) { o.code = 'pink'; o.color = C.pink; }
    return o;
  }
  return o;
}

/** Время в минутах с одним знаком: «2.4». */
export const mins = (sec) => n((sec || 0) / 60, 1);

/**
 * Описания наблюдений (код → подпись). label(t) — полный текст для журнала, sign — «+»/«−», cell(t) — для итоговой таблицы.
 */
const tm = (t, fb = '2–3') => (t && t.tApp != null ? mins(t.tApp) : fb);
export const OBS = {
  molisch: {
    ring: { sign: '+', label: () => L('на границе слоёв — фиолетовое кольцо', 'қабаттар шекарасында — күлгін сақина', 'a violet ring at the interface of the layers'), cell: () => L('+ фиолетовое кольцо', '+ күлгін сақина', '+ violet ring') },
    mixed: { sign: '?', label: () => L('слои перемешались: тёмная буро-фиолетовая жидкость, сильный разогрев, кольца нет', 'қабаттар араласып кетті: қою қоңыр-күлгін сұйықтық, қатты қызу, сақина жоқ', 'the layers have mixed: a dark brownish-violet liquid, strong heating, no ring'), cell: () => L('? слои смешаны', '? қабаттар араласқан', '? layers mixed') },
    none: { sign: '−', label: () => L('два бесцветных слоя, окраски нет', 'екі түссіз қабат, түс жоқ', 'two colourless layers, no colour'), cell: () => L('− нет окраски', '− түс жоқ', '− no colour') },
    green: { sign: '+', label: () => L('зелёное кольцо', 'жасыл сақина', 'a green ring'), cell: () => L('+ зелёное кольцо', '+ жасыл сақина', '+ green ring') },
    red: { sign: '+', label: () => L('вишнёво-красное окрашивание всего раствора', 'бүкіл ерітіндінің шие-қызыл түсі', 'a cherry-red colour throughout'), cell: () => L('+ красное', '+ қызыл', '+ red') },
  },
  trommer: {
    chelate: { sign: '+', label: () => L('Cu(OH)₂ растворился: прозрачный ярко-синий раствор', 'Cu(OH)₂ еріді: мөлдір ашық көк ерітінді', 'Cu(OH)₂ dissolved: a clear deep-blue solution'), cell: () => L('+ ярко-синий раствор', '+ ашық көк ерітінді', '+ clear deep blue') },
    excess: { sign: '+', label: () => L('синий раствор над голубым осадком нерастворившегося Cu(OH)₂', 'ерімеген Cu(OH)₂ көгілдір тұнбасының үстінде көк ерітінді', 'a blue solution above a pale-blue precipitate of undissolved Cu(OH)₂'), cell: () => L('+ синий, осадок Cu(OH)₂', '+ көк, Cu(OH)₂ тұнбасы', '+ blue, Cu(OH)₂ ppt') },
    cuso4: { sign: '−', label: () => L('бледно-голубой прозрачный раствор CuSO₄ — гидроксид меди не образовался', 'CuSO₄-тің ақшыл көгілдір мөлдір ерітіндісі — мыс гидроксиді түзілмеді', 'a pale-blue clear CuSO₄ solution — no copper hydroxide formed'), cell: () => L('− бледно-голубой (нет щёлочи)', '− ақшыл көгілдір (сілті жоқ)', '− pale blue (no alkali)') },
    cuppt: { sign: '−', label: () => L('голубой студенистый осадок Cu(OH)₂, раствор бесцветный', 'Cu(OH)₂ көгілдір қойыртпақ тұнбасы, ерітінді түссіз', 'a pale-blue gelatinous Cu(OH)₂ precipitate, colourless solution'), cell: () => L('− осадок Cu(OH)₂', '− Cu(OH)₂ тұнбасы', '− Cu(OH)₂ ppt') },
    blue: { sign: '−', label: () => L('раствор остаётся синим, осадка нет', 'ерітінді көк күйінде қалады, тұнба жоқ', 'the solution stays blue, no precipitate'), cell: () => L('− остаётся синим', '− көк күйінде қалады', '− stays blue') },
    yellow: { sign: '±', label: () => L('жёлто-зелёная муть CuOH, красного осадка ещё нет', 'CuOH сары-жасыл лайы, қызыл тұнба әлі жоқ', 'a yellow-green CuOH turbidity, no red precipitate yet'), cell: () => L('± жёлтая муть CuOH', '± CuOH сары лайы', '± yellow CuOH') },
    red: { sign: '+', label: (t) => L(`сначала жёлтый (CuOH), затем красный осадок Cu₂O (≈ ${tm(t, '2–3')} мин)`, `алдымен сары (CuOH), содан кейін Cu₂O қызыл тұнбасы (≈ ${tm(t, '2–3')} мин)`, `first a yellow (CuOH), then a red precipitate of Cu₂O (≈ ${tm(t, '2–3')} min)`), cell: (t) => L(`+ жёлтый → красный Cu₂O, ${tm(t, '2–3')} мин`, `+ сары → қызыл Cu₂O, ${tm(t, '2–3')} мин`, `+ yellow → red Cu₂O, ${tm(t, '2–3')} min`) },
    black: { sign: '?', label: () => L('чёрный осадок CuO — избыток Cu(OH)₂ разложился и замаскировал результат', 'CuO қара тұнбасы — артық Cu(OH)₂ ыдырап, нәтижені бүркемеледі', 'a black CuO precipitate — the excess Cu(OH)₂ decomposed and masked the result'), cell: () => L('? чёрный CuO', '? қара CuO', '? black CuO') },
  },
  fehling: {
    complex: { sign: '', label: () => L('прозрачный тёмно-синий раствор тартратного комплекса меди(II)', 'мыс(II) тартрат кешенінің мөлдір қою көк ерітіндісі', 'a clear dark-blue solution of the copper(II) tartrate complex'), cell: () => L('синий', 'көк', 'blue') },
    cuso4: { sign: '−', label: () => L('бледно-голубой раствор без изменений — среда не щелочная, комплекса нет', 'өзгеріссіз ақшыл көгілдір ерітінді — орта сілтілі емес, кешен жоқ', 'a pale-blue solution, unchanged — the medium is not alkaline, no complex'), cell: () => L('− без изменений (нет раствора B)', '− өзгеріссіз (B ерітіндісі жоқ)', '− unchanged (no solution B)') },
    blue: { sign: '−', label: () => L('раствор остаётся синим, осадка нет', 'ерітінді көк күйінде қалады, тұнба жоқ', 'the solution stays blue, no precipitate'), cell: () => L('− остаётся синим', '− көк күйінде қалады', '− stays blue') },
    yellow: { sign: '±', label: () => L('зеленоватая муть, кирпично-красного осадка ещё нет', 'жасылдау лай, кірпіш-қызыл тұнба әлі жоқ', 'a greenish turbidity, no brick-red precipitate yet'), cell: () => L('± зеленоватая муть', '± жасылдау лай', '± greenish turbidity') },
    red: { sign: '+', label: (t) => L(`кирпично-красный осадок Cu₂O (≈ ${tm(t, '2–3')} мин)`, `Cu₂O кірпіш-қызыл тұнбасы (≈ ${tm(t, '2–3')} мин)`, `a brick-red precipitate of Cu₂O (≈ ${tm(t, '2–3')} min)`), cell: (t) => L(`+ кирпично-красный Cu₂O, ${tm(t, '2–3')} мин`, `+ кірпіш-қызыл Cu₂O, ${tm(t, '2–3')} мин`, `+ brick-red Cu₂O, ${tm(t, '2–3')} min`) },
    black: { sign: '?', label: () => L('чёрный осадок', 'қара тұнба', 'a black precipitate'), cell: () => L('? чёрный', '? қара', '? black') },
  },
  tollens: {
    none: { sign: '−', label: () => L('раствор бесцветный и прозрачный, серебра нет', 'ерітінді түссіз әрі мөлдір, күміс жоқ', 'the solution is colourless and clear, no silver'), cell: () => L('− без изменений', '− өзгеріссіз', '− no change') },
    grey: { sign: '±', label: () => L('раствор слегка потемнел, зеркала ещё нет', 'ерітінді сәл қараңғыланды, айна әлі жоқ', 'the solution has darkened slightly, no mirror yet'), cell: () => L('± потемнение', '± қараю', '± darkening') },
    mirror: { sign: '+', label: (t) => L(`на стенках пробирки — блестящее серебряное зеркало (≈ ${tm(t, '3–4')} мин)`, `пробирка қабырғасында — жылтыр күміс айна (≈ ${tm(t, '3–4')} мин)`, `a shiny silver mirror on the walls of the tube (≈ ${tm(t, '3–4')} min)`), cell: (t) => L(`+ серебряное зеркало, ${tm(t, '3–4')} мин`, `+ күміс айна, ${tm(t, '3–4')} мин`, `+ silver mirror, ${tm(t, '3–4')} min`) },
    black: { sign: '+', label: (t) => L(`серо-чёрный осадок серебра без зеркала (≈ ${tm(t, '3–4')} мин)`, `айнасыз күмістің сұр-қара тұнбасы (≈ ${tm(t, '3–4')} мин)`, `a grey-black silver precipitate, no mirror (≈ ${tm(t, '3–4')} min)`), cell: (t) => L(`+ серо-чёрный осадок Ag, ${tm(t, '3–4')} мин`, `+ Ag сұр-қара тұнбасы, ${tm(t, '3–4')} мин`, `+ grey-black Ag, ${tm(t, '3–4')} min`) },
    brown: { sign: '−', label: () => L('бурый осадок Ag₂O', 'Ag₂O қоңыр тұнбасы', 'a brown Ag₂O precipitate'), cell: () => L('− бурый Ag₂O', '− қоңыр Ag₂O', '− brown Ag₂O') },
  },
  barfoed: {
    none: { sign: '−', label: () => L('за 5 минут осадка нет, раствор голубой', '5 минутта тұнба жоқ, ерітінді көгілдір', 'no precipitate within 5 minutes, the solution is blue'), cell: () => L('− нет осадка за 5 мин', '− 5 мин ішінде тұнба жоқ', '− no ppt in 5 min') },
    red: { sign: '+', label: (t) => L(`красный осадок Cu₂O через ≈ ${tm(t, '2–3')} мин`, `≈ ${tm(t, '2–3')} мин өткенде Cu₂O қызыл тұнбасы`, `a red Cu₂O precipitate after ≈ ${tm(t, '2–3')} min`), cell: (t) => L(`+ красный Cu₂O, ${tm(t, '2–3')} мин`, `+ қызыл Cu₂O, ${tm(t, '2–3')} мин`, `+ red Cu₂O, ${tm(t, '2–3')} min`) },
    late: { sign: '−', label: (t) => L(`за 5 минут осадка нет; слабый осадок появился лишь через ≈ ${tm(t, '11')} мин (частичный гидролиз) — результат отрицательный`, `5 минутта тұнба жоқ; әлсіз тұнба тек ≈ ${tm(t, '2–3')} мин өткенде пайда болды (ішінара гидролиз) — нәтиже теріс`, `no precipitate within 5 minutes; a faint precipitate only after ≈ ${tm(t, '2–3')} min (partial hydrolysis) — negative`), cell: (t) => L(`− (слабый осадок лишь через ${tm(t, '2–3')} мин)`, `− (әлсіз тұнба тек ${tm(t, '2–3')} мин кейін)`, `− (faint ppt only after ${tm(t, '2–3')} min)`) },
    lateplus: { sign: '+', label: (t) => L(`красный осадок через ≈ ${tm(t, '2–3')} мин — проба положительна, это моносахарид`, `≈ ${tm(t, '2–3')} мин өткенде қызыл тұнба — сынама оң, бұл моносахарид`, `a red precipitate after ≈ ${tm(t, '2–3')} min — positive, a monosaccharide`), cell: (t) => L(`+ осадок, ${tm(t, '2–3')} мин`, `+ тұнба, ${tm(t, '2–3')} мин`, `+ ppt, ${tm(t, '2–3')} min`) },
    blue: { sign: '', label: () => L('тёмно-синий раствор', 'қою көк ерітінді', 'a dark-blue solution'), cell: () => L('синий', 'көк', 'blue') },
  },
  seliwanoff: {
    red: { sign: '+', label: (t) => L(`вишнёво-красное окрашивание через ≈ ${tm(t, '1')} мин`, `≈ ${tm(t, '1')} мин өткенде шие-қызыл түс`, `a cherry-red colour after ≈ ${tm(t, '1')} min`), cell: (t) => L(`+ вишнёво-красное, ${tm(t, '1')} мин`, `+ шие-қызыл, ${tm(t, '1')} мин`, `+ cherry-red, ${tm(t, '1')} min`) },
    pink: { sign: '±', label: (t) => L(`лишь бледно-розовая окраска после долгого нагревания (≈ ${t && t.tPink != null ? mins(t.tPink) : '5–6'} мин)`, `ұзақ қыздырудан кейін ғана ақшыл қызғылт түс (≈ ${t && t.tPink != null ? mins(t.tPink) : '5–6'} мин)`, `only a faint pink after prolonged heating (≈ ${t && t.tPink != null ? mins(t.tPink) : '5–6'} min)`), cell: (t) => L(`± бледно-розовая, ${t && t.tPink != null ? mins(t.tPink) : '5–6'} мин`, `± ақшыл қызғылт, ${t && t.tPink != null ? mins(t.tPink) : '5–6'} мин`, `± faint pink, ${t && t.tPink != null ? mins(t.tPink) : '5–6'} min`) },
    none: { sign: '−', label: () => L('за 1–2 минуты окраски нет, раствор бесцветный', '1–2 минутта түс жоқ, ерітінді түссіз', 'no colour within 1–2 minutes, the solution is colourless'), cell: () => L('− нет окраски', '− түс жоқ', '− no colour') },
    violet: { sign: '+', label: () => L('фиолетовое кольцо', 'күлгін сақина', 'a violet ring'), cell: () => L('+ фиолетовое', '+ күлгін', '+ violet') },
  },
};

/** Текст наблюдения для пробирки (полный и для таблицы). */
export function describe(test, tube, env) {
  const code = look(test, tube, env).code;
  const d = (OBS[test] || {})[code];
  if (!d) return { code, sign: '', text: L('—', '—', '—'), cell: L('—', '—', '—') };
  return { code, sign: d.sign, text: d.label(tube), cell: d.cell(tube), tApp: tube.tApp };
}

/* ------------------------------------------------------------------ правильно приготовленные пробирки (идентификация, тесты) */

/** Пробирка, приготовленная строго по методичке, для пробы test с сахаром sug. */
export function idealTube(test, id, sug) {
  const t = newTube(id, sug);
  if (test === 'molisch') Object.assign(t, { sugV: 1, mol: 3, acid: 'wall', v: 2.15 });
  if (test === 'trommer') Object.assign(t, { sugV: 1, naoh: 1, cu: 4, v: 2.2 });
  if (test === 'fehling') Object.assign(t, { a: 1, b: 1, sugV: 1, v: 3 });
  if (test === 'tollens') Object.assign(t, { tol: 2, sugV: 0.2, v: 2.2 });
  if (test === 'barfoed') Object.assign(t, { bar: 2, sugV: 1, v: 3 });
  if (test === 'seliwanoff') Object.assign(t, { sel: 2, sugV: 0.5, v: 2.5 });
  return t;
}

/** Нагрев по методичке: баня и время (с). */
export const PROTOCOL = {
  molisch: { bath: null, sec: 60 },
  trommer: { bath: 'boil', sec: 180 },
  fehling: { bath: 'boil', sec: 180 },
  tollens: { bath: 'warm', sec: 360 },
  barfoed: { bath: 'boil', sec: 300 },
  seliwanoff: { bath: 'boil', sec: 120 },
};

/** Провести пробу по методичке над набором {id: sug}; вернуть { [id]: describe(...) } и прошедшее время, с. */
export function runIdeal(test, map, env) {
  const bench = { test, sw: 0, swOn: false, tubes: Object.entries(map).map(([id, sug]) => idealTube(test, id, sug)) };
  const pr = PROTOCOL[test];
  for (const t of bench.tubes) t.bath = pr.bath;
  simulate(bench, { ...env, clean: true }, pr.sec);
  for (const t of bench.tubes) t.bath = null;
  return { bench, out: Object.fromEntries(bench.tubes.map((t) => [t.id, describe(test, t, { ...env, clean: true })])), sec: pr.sec };
}

/**
 * Можно ли однозначно определить четыре раствора по набору проб?
 * Для каждой перестановки строится «подпись» по кодам наблюдений; если подписи всех сахаров различны — да.
 */
export function identifies(tests, env) {
  const sig = {};
  for (const s of SUGARS) sig[s] = tests.map((tst) => runIdeal(tst, { x: s }, env).out.x.code).join('/');
  return new Set(Object.values(sig)).size === SUGARS.length;
}

/** Реактив Толленса: сколько капель NH₃ нужно, чтобы растворить Ag₂O. */
export function tollensPrep(p) {
  const brown = p.naoh > 0 ? clamp(1 - (p.nh3 || 0) / (p.need || 10), 0, 1) : 0;
  return { brown, dissolved: p.naoh > 0 && (p.nh3 || 0) >= (p.need || 10), excess: Math.max(0, (p.nh3 || 0) - (p.need || 10)) };
}

/** Названия проб. */
export const TEST_NAME = {
  molisch: L('Проба Молиша', 'Молиш сынамасы', 'Molisch’s test'),
  trommer: L('Проба Троммера', 'Троммер сынамасы', 'Trommer’s test'),
  fehling: L('Проба Фелинга', 'Фелинг сынамасы', 'Fehling’s test'),
  tollens: L('Проба Толленса', 'Толленс сынамасы', 'Tollens’ test'),
  barfoed: L('Проба Барфёда', 'Барфёд сынамасы', 'Barfoed’s test'),
  seliwanoff: L('Проба Селиванова', 'Селиванов сынамасы', 'Seliwanoff’s test'),
};
/** Что обнаруживает проба (последний столбец таблицы методички). */
export const FEATURE = {
  molisch: L('углевод', 'көмірсу', 'carbohydrate'),
  trommerCold: L('полиол (вицинальные OH)', 'полиол (вициналь OH)', 'polyol (vicinal OH)'),
  trommerHot: L('восстанавливающий сахар', 'тотықсыздандырғыш қант', 'reducing sugar'),
  fehling: L('восстанавливающий сахар', 'тотықсыздандырғыш қант', 'reducing sugar'),
  tollens: L('восстанавливающий сахар', 'тотықсыздандырғыш қант', 'reducing sugar'),
  barfoed: L('моносахарид', 'моносахарид', 'monosaccharide'),
  seliwanoff: L('кетоза', 'кетоза', 'ketose'),
};
