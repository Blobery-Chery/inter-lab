/** Опыт 2. Индикаторные свойства метилового оранжевого. Методичка, раздел 6, опыт 2. */
import { L, n } from '../../app/i18n.js';
import { acidFraction, moColor } from './model.js';
import { beakerScene } from './scene.js';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const DROP = 0.05; // мл

/**
 * pH пробирки: t.acid — ммоль сильной кислоты минус щёлочь, t.V — мл. При нулевом избытке — pH раствора самого красителя (S.pH0).
 */
function tubePH(t, pH0) {
  const net = t.acid || 0, V = Math.max(0.1, t.V || 0.1);
  if (Math.abs(net) < 1e-5) return pH0;
  if (net > 0) return Math.min(pH0, -Math.log10(net / V));
  return Math.max(pH0, 14 + Math.log10(-net / V));
}
/** Пересчитать цвет пробирки по pH и насыщенности раствора. */
function paint(t, S) {
  if (!t.mo) { t.color = t.V > 0 ? null : t.color; return; }
  t.pH = tubePH(t, S.pH0);
  t.color = moColor(acidFraction(t.pH), S.dark ? 0.95 : 0.7);
}
const zone = (pH) => (pH < 3.1 ? 'red' : pH <= 4.4 ? 'orange' : 'yellow');
const zoneName = (z) => (z === 'red' ? L('красная', 'қызыл', 'red') : z === 'orange' ? L('оранжевая', 'қызғылт сары', 'orange') : L('жёлтая', 'сары', 'yellow'));

/* ------------------------------------------------------------------ 1. раствор красителя */
const e0 = {
  type: 'process', id: 'sol',
  title: L('Раствор красителя', 'Бояғыш ерітіндісі', 'The dye solution'),
  instr: L('<ol><li>Растворите <b>несколько кристаллов</b> синтезированного красителя в <b>10 мл</b> воды.</li></ol><p class="note">Раствор должен быть прозрачным и не слишком тёмным — иначе переход окраски плохо виден.</p>',
    '<ol><li>Синтезделген бояғыштың <b>бірнеше кристалын</b> <b>10 мл</b> суда ерітіңіз.</li></ol><p class="note">Ерітінді мөлдір және тым қою болмауы тиіс — әйтпесе түстің ауысуы нашар көрінеді.</p>',
    '<ol><li>Dissolve <b>a few crystals</b> of the synthesised dye in <b>10 mL</b> of water.</li></ol><p class="note">The solution should be clear and not too dark — otherwise the colour change is hard to see.</p>'),
  need: L('Приготовьте раствор красителя', 'Бояғыш ерітіндісін дайындаңыз', 'Prepare the dye solution'),
  speeds: null,
  setup(S, lc) { lc.mg = 0; lc.water = false; },
  controls: [
    { kind: 'action', id: 'few', once: false, group: L('Краситель', 'Бояғыш', 'Dye'), label: L('Несколько кристаллов (~10 мг)', 'Бірнеше кристал (~10 мг)', 'A few crystals (~10 mg)'), advance: 20, do(S, lc) { lc.mg += 10; } },
    { kind: 'action', id: 'spat', once: false, group: L('Краситель', 'Бояғыш', 'Dye'), label: L('Полный шпатель (~0,3 г)', 'Толық шпатель (~0,3 г)', 'A full spatula (~0.3 g)'), advance: 20, do(S, lc) { lc.mg += 300; } },
    { kind: 'action', id: 'water', group: L('Вода', 'Су', 'Water'), label: L('Прилить 10 мл воды и перемешать', '10 мл су құйып, араластыру', 'Add 10 mL of water and stir'), advance: 90, do(S, lc) { lc.water = true; } },
  ],
  readouts: (S, lc) => [
    { label: L('Краситель', 'Бояғыш', 'Dye'), value: { ru: lc.mg + ' мг', kk: lc.mg + ' мг', en: lc.mg + ' mg' }, st: lc.mg > 0 && lc.mg <= 60 ? 'ok' : lc.mg > 100 ? 'warn' : '' },
    { label: L('Вода', 'Су', 'Water'), value: lc.water ? { ru: '10 мл', kk: '10 мл', en: '10 mL' } : '—' },
  ],
  done(S, lc, ctx) {
    if (lc.mg > 0 && lc.water) {
      S.mg = lc.mg; S.dark = lc.mg > 100;
      ctx.log(S.dark ? L(`${lc.mg} мг красителя в 10 мл воды: очень тёмный, почти непрозрачный оранжево-красный раствор`, `10 мл судағы ${lc.mg} мг бояғыш: өте қою, мөлдір емеске жуық қызғылт сары-қызыл ерітінді`, `${lc.mg} mg of dye in 10 mL of water: a very dark, almost opaque orange-red solution`)
        : S.pH0 < 4.4 ? L(`${lc.mg} мг красителя в 10 мл воды: прозрачный оранжевый раствор`, `10 мл судағы ${lc.mg} мг бояғыш: мөлдір қызғылт сары ерітінді`, `${lc.mg} mg of dye in 10 mL of water: a clear orange solution`)
          : L(`${lc.mg} мг красителя в 10 мл воды: прозрачный оранжево-жёлтый раствор`, `10 мл судағы ${lc.mg} мг бояғыш: мөлдір қызғылт сары-сары ерітінді`, `${lc.mg} mg of dye in 10 mL of water: a clear orange-yellow solution`), 'obs');
      return { text: L('Раствор красителя готов.', 'Бояғыш ерітіндісі дайын.', 'The dye solution is ready.') };
    }
    return false;
  },
  onLeave(S, ctx) {
    if (S.dark) ctx.remark({ key: 'e2-dark', severity: 'minor', text: L('взято слишком много красителя — раствор тёмный, переход окраски плохо виден', 'бояғыш тым көп алынды — ерітінді қою, түстің ауысуы нашар көрінеді', 'too much dye taken — the solution is dark and the colour change is hard to see') });
  },
  scene: (S, lc) => beakerScene({ cap: 50, vol: lc.water ? 10 : 0.5, color: lc.water && lc.mg ? moColor(acidFraction(S.pH0), lc.mg > 100 ? 0.95 : 0.6) : null, ppt: !lc.water && lc.mg ? Math.min(0.6, lc.mg / 300) : 0, pptColor: '#d8641c', rod: lc.water, label: L('стакан 50 мл', 'стақан 50 мл', '50 mL beaker') }),
  hints: [
    L('Индикатора нужно совсем немного: в разбавленном растворе окраска яркая и прозрачная.', 'Индикатор өте аз қажет: сұйылтылған ерітіндіде түс ашық әрі мөлдір.', 'Only a very little indicator is needed: a dilute solution is bright and clear.'),
    L('Возьмите несколько кристаллов (10–50 мг), а не полный шпатель.', 'Толық шпатель емес, бірнеше кристал (10–50 мг) алыңыз.', 'Take a few crystals (10–50 mg), not a full spatula.'),
    L('«Несколько кристаллов» → «Прилить 10 мл воды и перемешать» → «Далее».', '«Бірнеше кристал» → «10 мл су құйып, араластыру» → «Әрі қарай».', '“A few crystals” → “Add 10 mL of water and stir” → “Next”.'),
  ],
};

/* ------------------------------------------------------------------ 2. три пробирки */
const ROLE = { a: 'hcl', b: 'w', c: 'oh' };
function assign(rid) {
  return function apply(t, S, ctx, id) {
    if (t.r && t.r !== rid) { ctx.remark({ key: 'e2-mix-' + id, severity: 'minor', text: L('в одну пробирку прилиты разные реактивы — опыт в ней испорчен', 'бір пробиркаға әртүрлі реактивтер құйылды — ондағы тәжірибе бүлінді', 'different reagents added to the same tube — that tube is spoiled') }); t.spoiled = true; }
    else if (ROLE[id] !== rid) ctx.remark({ key: 'e2-role', severity: 'minor', text: L('реактив прилит не в ту пробирку (1 — HCl, 2 — вода, 3 — NaOH)', 'реактив басқа пробиркаға құйылды (1 — HCl, 2 — су, 3 — NaOH)', 'reagent added to the wrong tube (1 — HCl, 2 — water, 3 — NaOH)') });
    if (t.r === rid) ctx.feedback(L('Этот реактив в пробирку уже прилит.', 'Бұл реактив пробиркаға құйылған.', 'This reagent is already in the tube.'), 'warn');
    t.r = t.r || rid; t.n = (t.n || 0) + 1;
    t.V = (t.V || 0) + 1; t.v = t.V;
    if (rid === 'hcl') t.acid = (t.acid || 0) + 0.1;
    if (rid === 'oh') t.acid = (t.acid || 0) - 0.1;
    paint(t, S);
  };
}
const e1 = {
  type: 'test', id: 'three',
  title: L('Окраска в кислой, нейтральной и щелочной среде', 'Қышқыл, бейтарап және сілтілі ортадағы түсі', 'Colour in acidic, neutral and alkaline solution'),
  instr: L('<ol><li>Налейте по <b>2 мл</b> раствора красителя в три пробирки.</li><li>В первую прилейте <b>1 мл 0,1 М HCl</b>, во вторую — <b>1 мл воды</b>, в третью — <b>1 мл 0,1 М NaOH</b>.</li><li>Сравните окраску.</li></ol>',
    '<ol><li>Үш пробиркаға бояғыш ерітіндісінен <b>2 мл</b>-ден құйыңыз.</li><li>Біріншісіне <b>1 мл 0,1 М HCl</b>, екіншісіне — <b>1 мл су</b>, үшіншісіне — <b>1 мл 0,1 М NaOH</b> құйыңыз.</li><li>Түстерін салыстырыңыз.</li></ol>',
    '<ol><li>Put <b>2 mL</b> of the dye solution into each of three test tubes.</li><li>Add <b>1 mL of 0.1 M HCl</b> to the first, <b>1 mL of water</b> to the second and <b>1 mL of 0.1 M NaOH</b> to the third.</li><li>Compare the colours.</li></ol>'),
  need: L('Подготовьте три пробирки и сравните окраску', 'Үш пробирканы дайындап, түстерін салыстырыңыз', 'Prepare the three tubes and compare the colours'),
  tubes: [{ id: 'a', label: L('1 · HCl', '1 · HCl', '1 · HCl') }, { id: 'b', label: L('2 · вода', '2 · су', '2 · water') }, { id: 'c', label: L('3 · NaOH', '3 · NaOH', '3 · NaOH') }],
  reset: true,
  reagents: [
    { id: 'mo', target: 'all', label: L('Раствор красителя: по 2 мл в каждую', 'Бояғыш ерітіндісі: әрқайсысына 2 мл', 'Dye solution: 2 mL into each'), advance: 60, disabled: (t) => t.mo,
      apply(t, S, ctx, id) { t.mo = true; t.V = (t.V || 0) + 2; t.v = t.V; paint(t, S); if (id === 'a') ctx.log(L('В три пробирки налито по 2 мл раствора красителя', 'Үш пробиркаға бояғыш ерітіндісінен 2 мл-ден құйылды', '2 mL of dye solution put into each of three tubes')); } },
    { id: 'hcl', group: L('В выбранную пробирку', 'Таңдалған пробиркаға', 'Into the selected tube'), label: L('0,1 М HCl, 1 мл', '0,1 М HCl, 1 мл', '0.1 M HCl, 1 mL'), advance: 20, apply: assign('hcl') },
    { id: 'w', group: L('В выбранную пробирку', 'Таңдалған пробиркаға', 'Into the selected tube'), label: L('Вода, 1 мл', 'Су, 1 мл', 'Water, 1 mL'), advance: 20, apply: assign('w') },
    { id: 'oh', group: L('В выбранную пробирку', 'Таңдалған пробиркаға', 'Into the selected tube'), label: L('0,1 М NaOH, 1 мл', '0,1 М NaOH, 1 мл', '0.1 M NaOH, 1 mL'), advance: 20, apply: assign('oh') },
  ],
  done: (T) => ['a', 'b', 'c'].every((k) => T[k].mo && T[k].r === ROLE[k] && T[k].n === 1 && !T[k].spoiled),
  observe: {
    question: L('Какая окраска в пробирках 1, 2 и 3?', '1, 2 және 3-пробиркалардағы түс қандай?', 'What colour are tubes 1, 2 and 3?'),
    options: [
      { id: 'ok', label: L('1 — красная, 2 — оранжево-жёлтая, 3 — жёлтая', '1 — қызыл, 2 — қызғылт сары-сары, 3 — сары', '1 — red, 2 — orange-yellow, 3 — yellow'), log: L('Пробирка 1 (HCl) — красная, 2 (вода) — оранжево-жёлтая, 3 (NaOH) — жёлтая', '1-пробирка (HCl) — қызыл, 2 (су) — қызғылт сары-сары, 3 (NaOH) — сары', 'Tube 1 (HCl) — red, 2 (water) — orange-yellow, 3 (NaOH) — yellow') },
      { id: 'acid', label: L('1 — красная, 2 — оранжевая, 3 — жёлтая', '1 — қызыл, 2 — қызғылт сары, 3 — сары', '1 — red, 2 — orange, 3 — yellow'), log: L('Пробирка 1 (HCl) — красная, 2 (вода) — оранжевая (раствор продукта слабокислый), 3 (NaOH) — жёлтая', '1-пробирка (HCl) — қызыл, 2 (су) — қызғылт сары (өнім ерітіндісі әлсіз қышқыл), 3 (NaOH) — сары', 'Tube 1 (HCl) — red, 2 (water) — orange (the product solution is slightly acidic), 3 (NaOH) — yellow') },
      { id: 'rev', label: L('1 — жёлтая, 2 — оранжевая, 3 — красная', '1 — сары, 2 — қызғылт сары, 3 — қызыл', '1 — yellow, 2 — orange, 3 — red') },
      { id: 'same', label: L('Во всех трёх одинаковая оранжевая окраска', 'Үшеуінде де бірдей қызғылт сары түс', 'The same orange colour in all three') },
    ],
    correct: (S, T) => (zone(T.b.pH) === 'yellow' ? 'ok' : 'acid'),
    why: (S, T) => (zone(T.b.pH) === 'yellow'
      ? L('В кислоте (pH ≈ 1,5) — красная хиноидная форма, в щёлочи — жёлтая азоформа; в воде раствор натриевой соли выше pH 4,4 — оранжево-жёлтый.', 'Қышқылда (pH ≈ 1,5) — қызыл хиноидты түрі, сілтіде — сары азотүрі; суда натрий тұзының ерітіндісі pH 4,4-тен жоғары — қызғылт сары-сары.', 'In acid (pH ≈ 1.5) — the red quinonoid form; in alkali — the yellow azo form; in water the solution of the sodium salt is above pH 4.4 — orange-yellow.')
      : L('Продукт содержит кислотную форму (не был доведён до щелочной реакции), поэтому его водный раствор слабокислый (pH ≈ 4) и находится в зоне перехода — оранжевый.', 'Өнімде қышқылдық түрі бар (сілтілі реакцияға жеткізілмеген), сондықтан оның судағы ерітіндісі әлсіз қышқыл (pH ≈ 4) және ауысу аймағында — қызғылт сары.', 'The product contains the acid form (it was not made alkaline), so its aqueous solution is slightly acidic (pH ≈ 4) and lies in the transition range — orange.')),
  },
  onDone(S, T) { S.c3 = ['a', 'b', 'c'].map((k) => zone(T[k].pH)); },
  hint1: L('По порядку: краситель во все три, затем выберите пробирку и прилейте ей «её» реактив: 1 — HCl, 2 — вода, 3 — NaOH.', 'Ретімен: бояғышты үшеуіне де, содан кейін пробирканы таңдап, оған «өз» реактивін құйыңыз: 1 — HCl, 2 — су, 3 — NaOH.', 'In order: dye into all three, then select each tube and add “its” reagent: 1 — HCl, 2 — water, 3 — NaOH.'),
};

/* ------------------------------------------------------------------ 3. NaOH по каплям в первую пробирку */
function drops(k) {
  return function apply(t, S, ctx) {
    if (!t.mo) { t.mo = true; t.V = 3; t.acid = 0.1; }
    const before = t.pH ?? tubePH(t, S.pH0);
    t.acid -= 0.1 * DROP * k; t.V += DROP * k; t.v = t.V; t.d = (t.d || 0) + k;
    paint(t, S);
    const zb = zone(before), za = zone(t.pH);
    t.seen = t.seen || {};
    t.seen[za] = true;
    if (zb === 'red' && za === 'yellow') { if (k <= 5) t.seen.orange = true; else ctx.remark({ key: 'e2-jump', severity: 'minor', text: L('щёлочь прилита сразу большой порцией — переход через оранжевую окраску не наблюдали', 'сілті бірден үлкен порциямен құйылды — қызғылт сары түс арқылы ауысу байқалмады', 'alkali added in one large portion — the change through orange was not observed') }); }
    if (zb === 'red' && za === 'yellow' && k <= 5) ctx.log(L(`После ${t.d} капель NaOH окраска сменилась с красной через оранжевую на жёлтую`, `${t.d} тамшы NaOH-тан кейін түс қызылдан қызғылт сары арқылы сарыға ауысты`, `After ${t.d} drops of NaOH the colour changed from red through orange to yellow`), 'obs');
    else if (zb !== za) {
      if (za === 'red' && t.seen.yellow) t.rev = true;
      ctx.log(L(`После ${t.d} капель NaOH${t.h ? ` и ${t.h} капель HCl` : ''}: окраска ${zoneName(za).ru}`, `${t.d} тамшы NaOH-тан${t.h ? ` және ${t.h} тамшы HCl-дан` : ''} кейін: түсі ${zoneName(za).kk}`, `After ${t.d} drops of NaOH${t.h ? ` and ${t.h} drops of HCl` : ''}: the colour is ${zoneName(za).en}`), 'obs');
    }
  };
}
const e2 = {
  type: 'test', id: 'titr',
  title: L('Прибавление NaOH по каплям', 'NaOH-ты тамшылатып қосу', 'Adding NaOH dropwise'),
  instr: L('<ol><li>К первой пробирке (краситель + HCl) прибавляйте <b>0,1 М NaOH по каплям</b>, встряхивая, и наблюдайте изменение окраски.</li><li>Чтобы убедиться в обратимости, затем прибавьте каплю-другую 0,1 М HCl.</li></ol><p class="note">жёлтая азоформа (pH > 4,4) + H⁺ ⇌ красная хиноидная форма (pH < 3,1)</p>',
    '<ol><li>Бірінші пробиркаға (бояғыш + HCl) шайқай отырып, <b>0,1 М NaOH-ты тамшылатып</b> қосыңыз және түстің өзгеруін бақылаңыз.</li><li>Қайтымдылыққа көз жеткізу үшін содан кейін бір-екі тамшы 0,1 М HCl қосыңыз.</li></ol><p class="note">сары азотүрі (pH > 4,4) + H⁺ ⇌ қызыл хиноидты түрі (pH < 3,1)</p>',
    '<ol><li>To the first tube (dye + HCl) add <b>0.1 M NaOH dropwise</b>, shaking, and watch the colour change.</li><li>To check that the change is reversible, then add a drop or two of 0.1 M HCl.</li></ol><p class="note">yellow azo form (pH > 4.4) + H⁺ ⇌ red quinonoid form (pH < 3.1)</p>'),
  need: L('Пронаблюдайте переход окраски', 'Түстің ауысуын бақылаңыз', 'Observe the colour change'),
  tubes: [{ id: 'a', label: L('1 · краситель + HCl', '1 · бояғыш + HCl', '1 · dye + HCl'), init: { mo: true, V: 3, v: 3, acid: 0.1, pH: 1.5, color: moColor(1, 0.7) } }],
  indicator: true, reset: true,
  reagents: [
    { id: 'oh1', group: L('0,1 М NaOH', '0,1 М NaOH', '0.1 M NaOH'), label: L('+1 капля', '+1 тамшы', '+1 drop'), advance: 10, apply: drops(1) },
    { id: 'oh5', group: L('0,1 М NaOH', '0,1 М NaOH', '0.1 M NaOH'), label: L('+5 капель', '+5 тамшы', '+5 drops'), advance: 25, apply: drops(5) },
    { id: 'oh20', group: L('0,1 М NaOH', '0,1 М NaOH', '0.1 M NaOH'), label: L('+1 мл сразу', '+1 мл бірден', '+1 mL at once'), advance: 10, apply: drops(20) },
    { id: 'h1', group: L('0,1 М HCl', '0,1 М HCl', '0.1 M HCl'), label: L('+1 капля HCl', '+1 тамшы HCl', '+1 drop of HCl'), advance: 10,
      apply(t, S, ctx) { t.h = (t.h || 0) + 1; t.d = t.d || 0; t.acid += 0.1 * DROP; t.V += DROP; t.v = t.V; const zb = zone(t.pH); paint(t, S); const za = zone(t.pH); t.seen = t.seen || {}; t.seen[za] = true; if (zb !== za) { if (za === 'red' && t.seen.yellow) t.rev = true; ctx.log(L(`После капли HCl окраска снова ${zoneName(za).ru}`, `HCl тамшысынан кейін түсі қайтадан ${zoneName(za).kk}`, `After a drop of HCl the colour is ${zoneName(za).en} again`), 'obs'); } } },
  ],
  done: (T) => !!(T.a.seen && T.a.seen.orange && T.a.seen.yellow),
  observe: {
    question: L('Как меняется окраска при прибавлении щёлочи?', 'Сілті қосқанда түс қалай өзгереді?', 'How does the colour change as alkali is added?'),
    options: [
      { id: 'ok', label: L('Красная → оранжевая → жёлтая; от кислоты снова красная — переход обратим', 'Қызыл → қызғылт сары → сары; қышқылдан қайтадан қызыл — ауысу қайтымды', 'Red → orange → yellow; acid turns it red again — the change is reversible'), log: (S, T) => L(`При прибавлении 0,1 М NaOH по каплям окраска меняется: красная → оранжевая → жёлтая (≈ ${T.a.d} капель)${T.a.rev ? '; от капли HCl снова красная — переход обратим' : ''}`, `0,1 М NaOH тамшылатып қосқанда түс өзгереді: қызыл → қызғылт сары → сары (≈ ${T.a.d} тамшы)${T.a.rev ? '; HCl тамшысынан қайтадан қызыл — ауысу қайтымды' : ''}`, `On adding 0.1 M NaOH dropwise the colour changes red → orange → yellow (≈ ${T.a.d} drops)${T.a.rev ? '; a drop of HCl turns it red again — the change is reversible' : ''}`) },
      { id: 'colourless', label: L('Раствор обесцвечивается', 'Ерітінді түссізденеді', 'The solution becomes colourless') },
      { id: 'none', label: L('Окраска не меняется', 'Түс өзгермейді', 'The colour does not change') },
      { id: 'irr', label: L('Красная → жёлтая, а от кислоты остаётся жёлтой — переход необратим', 'Қызыл → сары, ал қышқылдан сары күйінде қалады — ауысу қайтымсыз', 'Red → yellow, and acid leaves it yellow — the change is irreversible') },
    ],
    correct: () => 'ok',
    why: () => L('Протонирование по атому азота азогруппы обратимо: равновесие азоформа + H⁺ ⇌ хиноидная форма смещается с pH; переход — в интервале 3,1–4,4.', 'Азотоптың азот атомы бойынша протондану қайтымды: азотүрі + H⁺ ⇌ хиноидты түрі тепе-теңдігі pH-қа қарай ығысады; ауысу — 3,1–4,4 аралығында.', 'Protonation at the azo nitrogen is reversible: the equilibrium azo form + H⁺ ⇌ quinonoid form shifts with pH; the change lies in the range 3.1–4.4.'),
  },
  onDone(S, T) { S.titr = { drops: T.a.d || 0, rev: !!T.a.rev }; },
  hint1: L('Щёлочь прибавляют по одной капле: переход окраски узкий, его легко «проскочить».', 'Сілтіні бір тамшыдан қосады: түстің ауысуы тар, оны «өткізіп алу» оңай.', 'Add the alkali one drop at a time: the colour change is narrow and easy to overshoot.'),
  hint2: L('В пробирке 0,1 ммоль HCl; капля 0,1 М NaOH (0,05 мл) нейтрализует 0,005 ммоль — переход около 20-й капли. Сначала можно по 5 капель, у перехода — по одной.', 'Пробиркада 0,1 ммоль HCl; 0,1 М NaOH тамшысы (0,05 мл) 0,005 ммоль бейтараптайды — ауысу шамамен 20-тамшыда. Алдымен 5 тамшыдан, ауысу маңында — бір-бірден.', 'The tube holds 0.1 mmol of HCl; a drop of 0.1 M NaOH (0.05 mL) neutralises 0.005 mmol — the change comes at about the 20th drop. Add 5 drops at a time at first, then one at a time near the change.'),
  hint3: L('«+5 капель» ×3, затем «+1 капля» до жёлтой окраски; потом «+1 капля HCl» — окраска снова красная.', '«+5 тамшы» ×3, содан кейін сары түске дейін «+1 тамшы»; сосын «+1 тамшы HCl» — түс қайтадан қызыл.', '“+5 drops” ×3, then “+1 drop” until yellow; then “+1 drop of HCl” — red again.'),
};

/* ------------------------------------------------------------------ 4. вопросы */
const e3 = {
  type: 'quiz', id: 'q-ind',
  title: L('Вопросы по индикаторным свойствам', 'Индикаторлық қасиеттер бойынша сұрақтар', 'Questions on the indicator properties'),
  instr: L('<p>Ответьте на вопросы. Каждая ошибка записывается в журнал.</p>', '<p>Сұрақтарға жауап беріңіз. Әр қате журналға жазылады.</p>', '<p>Answer the questions. Every wrong answer is recorded in the notebook.</p>'),
  need: L('Ответьте на все вопросы', 'Барлық сұраққа жауап беріңіз', 'Answer all the questions'),
  questions: [
    { q: L('В каком интервале pH метиловый оранжевый меняет окраску?', 'Метилоранж түсін қай pH аралығында өзгертеді?', 'In which pH range does methyl orange change colour?'),
      options: ['3,1–4,4', '6,8–8,0', '8,2–10,0', '1,0–2,0'], correct: 0, why: L('Ниже pH 3,1 — красный, выше 4,4 — жёлтый, между ними — оранжевый.', 'pH 3,1-ден төмен — қызыл, 4,4-тен жоғары — сары, олардың арасында — қызғылт сары.', 'Below pH 3.1 it is red, above 4.4 yellow, and orange in between.') },
    { q: L('Почему кислотная форма метилового оранжевого красная?', 'Метилоранждың қышқылдық түрі неліктен қызыл?', 'Why is the acid form of methyl orange red?'),
      options: [L('Протонирование по атому азота азогруппы даёт катион хиноидного строения с другой сопряжённой системой — он поглощает при большей длине волны', 'Азотоптың азот атомы бойынша протондану сопряжен жүйесі басқа хиноидты құрылысты катион береді — ол ұзынырақ толқында жұтады', 'Protonation at an azo nitrogen gives a cation with a quinonoid structure and a different conjugated system that absorbs at a longer wavelength'), L('Протонируется сульфогруппа', 'Сульфотоп протондалады', 'The sulfonic acid group is protonated'), L('Азогруппа разрушается', 'Азотоп бұзылады', 'The azo group is destroyed'), L('Молекула теряет натрий и выпадает в осадок', 'Молекула натрийін жоғалтып, тұнбаға түседі', 'The molecule loses sodium and precipitates')],
      correct: 0, why: L('Раздел 3.2 методички: в кислоте азоформа переходит в хиноидный катион с иной системой сопряжения.', 'Әдістеменің 3.2-бөлімі: қышқылда азотүрі түйіндесу жүйесі басқа хиноидты катионға айналады.', 'Manual, section 3.2: in acid the azo form becomes a quinonoid cation with a different conjugated system.') },
    { q: L('Для какого титрования подходит метиловый оранжевый?', 'Метилоранж қандай титрлеуге жарайды?', 'For which titration is methyl orange suitable?'),
      options: [L('Титрование слабого основания (например, NH₃, Na₂CO₃) сильной кислотой — точка эквивалентности в кислой области', 'Әлсіз негізді (мысалы, NH₃, Na₂CO₃) күшті қышқылмен титрлеу — эквиваленттік нүкте қышқыл аймақта', 'Titration of a weak base (e.g. NH₃, Na₂CO₃) with a strong acid — the equivalence point is in the acidic range'), L('Титрование слабой кислоты (уксусной) щёлочью', 'Әлсіз қышқылды (сірке) сілтімен титрлеу', 'Titration of a weak acid (acetic acid) with alkali'), L('Только окислительно-восстановительное титрование', 'Тек тотығу-тотықсыздану титрлеуі', 'Only redox titrations'), L('Ни для какого — переход слишком широкий', 'Ешқайсысына — ауысу тым кең', 'None — the transition is too broad')],
      correct: 0, why: L('Переход 3,1–4,4 совпадает со скачком pH при титровании слабых оснований сильными кислотами; при титровании слабой кислоты щёлочью эквивалентность в щелочной области (нужен фенолфталеин).', '3,1–4,4 ауысуы әлсіз негіздерді күшті қышқылдармен титрлегендегі pH секірісімен сәйкес келеді; әлсіз қышқылды сілтімен титрлегенде эквиваленттік сілтілі аймақта (фенолфталеин қажет).', 'The 3.1–4.4 range matches the pH jump when weak bases are titrated with strong acids; for a weak acid titrated with alkali the equivalence point is alkaline (phenolphthalein is needed).') },
  ],
};

export default {
  id: '2',
  title: L('Индикаторные свойства метилового оранжевого', 'Метилоранждың индикаторлық қасиеттері', 'Indicator properties of methyl orange'),
  principle: L('Краситель существует в двух формах с разными сопряжёнными системами: красной (протонированной, хиноидной) ниже pH 3,1 и жёлтой (азоформа) выше pH 4,4.', 'Бояғыш түйіндесу жүйелері әртүрлі екі түрде болады: pH 3,1-ден төмен қызыл (протондалған, хиноидты) және pH 4,4-тен жоғары сары (азотүрі).', 'The dye exists in two forms with different conjugated systems: red (protonated, quinonoid) below pH 3.1 and yellow (azo form) above pH 4.4.'),
  equation: [L('жёлтая азоформа (pH > 4,4) + H⁺ ⇌ красная хиноидная форма (pH < 3,1)', 'сары азотүрі (pH > 4,4) + H⁺ ⇌ қызыл хиноидты түрі (pH < 3,1)', 'yellow azo form (pH > 4.4) + H⁺ ⇌ red quinonoid form (pH < 3.1)')],
  initialState: ({ prev }) => ({ pH0: (prev['1'] || {}).acidForm ? 4.0 : 6.5, mg: 0, dark: false, c3: null, titr: null }),
  checkpoints: [0],
  steps: [e0, e1, e2, e3],
  results: (S) => ({ pH0: S.pH0, mg: S.mg, dark: S.dark, c3: S.c3, titr: S.titr }),
  summary: (r) => [
    { label: 'HCl', value: r.c3 ? zoneName(r.c3[0]) : '—', st: r.c3 ? 'ok' : '' },
    { label: L('Вода', 'Су', 'Water'), value: r.c3 ? (r.c3[1] === 'yellow' ? L('оранжево-жёлтая', 'қызғылт сары-сары', 'orange-yellow') : zoneName(r.c3[1])) : '—', st: r.c3 ? (r.c3[1] === 'yellow' ? 'ok' : 'warn') : '' },
    { label: 'NaOH', value: r.c3 ? zoneName(r.c3[2]) : '—', st: r.c3 ? 'ok' : '' },
    { label: L('Обратимость', 'Қайтымдылық', 'Reversibility'), value: r.titr && r.titr.rev ? L('да', 'иә', 'yes') : '—' },
  ],
};

export { tubePH, zone };
