/** Опыт 3. Реакции винной кислоты. Методичка, раздел 6, опыт 3. */
import { L, n } from '../../app/i18n.js';
import { khtState, cuTartrate, DROP } from './model.js';
import { tubesScene } from './scene.js';

const WHITE = 'var(--solid)', CUOH = 'rgba(120,185,235,.95)';

/* ---------- 1. Гидротартрат калия ---------- */
const kTubes = [{ id: 'k', label: L('Пробирка', 'Пробирка', 'Tube'), short: L('винная к-та + KOH', 'шарап қ-лы + KOH', 'tartaric acid + KOH') }];
function paintK(t) {
  const st = khtState(t.koh || 0);
  t.pH = st.pH;
  if (t.rub && st.super > 0) t.seeded = true;
  if (st.super <= 0) t.seeded = false;
  t.ppt = t.seeded ? Math.min(1, st.super / 0.45) : 0;
  t.pptColor = WHITE;
  if (t.ppt > 0.25) t.seen = true;
  t.rub = false;
  return st;
}
const kohBtn = (k) => ({ id: 'koh' + k, group: L('KOH 10 % по каплям', 'KOH 10 % тамшылап', 'KOH 10 % dropwise'), label: L(`+${k} кап.`, `+${k} тамшы`, `+${k} ${k > 1 ? 'drops' : 'drop'}`), advance: 5 * k, disabled: (t) => !t.tart,
  apply(t, S, ctx) {
    const before = t.ppt || 0, wasExcess = khtState(t.koh || 0).excess;
    t.koh = (t.koh || 0) + k; t.v += DROP * k;
    const st = paintK(t);
    if (before > 0.25 && t.ppt < 0.05 && st.excess && !wasExcess) ctx.log(L(`В избытке KOH (${t.koh} кап.) кристаллы растворились — образовался средний тартрат калия`, `KOH артық болғанда (${t.koh} тамшы) кристалдар еріді — орта калий тартраты түзілді`, `In excess KOH (${t.koh} drops) the crystals dissolved — the neutral potassium tartrate formed`), 'obs');
  } });
const s0 = {
  type: 'test', id: 'kht',
  title: L('Гидротартрат калия', 'Калий гидротартраты', 'Potassium hydrogen tartrate'),
  instr: L('<ol><li>К <b>1 мл</b> раствора винной кислоты (10 %) прибавляйте по каплям 10 % KOH, энергично встряхивая и потирая стенку пробирки стеклянной палочкой.</li><li>После появления кристаллов продолжайте прибавлять KOH до избытка.</li></ol><p class="note">Кристаллизация гидротартрата часто запаздывает: трение палочкой по стенке создаёт центры кристаллизации.</p>',
    '<ol><li><b>1 мл</b> шарап қышқылы ерітіндісіне (10 %) 10 % KOH-ты тамшылатып қосыңыз, қатты сілкілеп, пробирка қабырғасын шыны таяқшамен ысқылаңыз.</li><li>Кристалдар пайда болғаннан кейін KOH-ты артық мөлшерге дейін қосуды жалғастырыңыз.</li></ol><p class="note">Гидротартраттың кристалдануы жиі кешігеді: қабырғаны таяқшамен ысқылау кристалдану орталықтарын жасайды.</p>',
    '<ol><li>To <b>1 mL</b> of tartaric acid solution (10 %) add 10 % KOH dropwise, shaking vigorously and rubbing the tube wall with a glass rod.</li><li>After crystals appear, continue adding KOH in excess.</li></ol><p class="note">Crystallisation of the hydrogen tartrate is often delayed: rubbing the wall with the rod creates nucleation sites.</p>'),
  need: L('Получите кристаллы и растворите их в избытке KOH', 'Кристалдарды алып, артық KOH-та ерітіңіз', 'Obtain the crystals and dissolve them in excess KOH'),
  tubes: kTubes, reset: true, indicator: true,
  reagents: [
    { id: 'tart', group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('Винная кислота 10 %: 1 мл', 'Шарап қышқылы 10 %: 1 мл', 'Tartaric acid 10 %: 1 mL'), advance: 20, disabled: (t) => t.tart,
      apply(t, S, ctx) { t.tart = 1; t.v += 1; paintK(t); ctx.log(L('В пробирку отмерен 1 мл 10 % раствора винной кислоты', 'Пробиркаға 10 % шарап қышқылы ерітіндісінің 1 мл өлшенді', '1 mL of 10 % tartaric acid solution measured into the tube')); } },
    kohBtn(1), kohBtn(5),
    { id: 'rub', group: L('KOH 10 % по каплям', 'KOH 10 % тамшылап', 'KOH 10 % dropwise'), label: L('Встряхнуть, потереть стенку палочкой', 'Сілкілеп, қабырғаны таяқшамен ысқылау', 'Shake and rub the wall with the rod'), advance: 30, disabled: (t) => !t.tart,
      apply(t, S, ctx) {
        t.rub = true; t.rubbed = true; const had = t.seen;
        paintK(t);
        if (t.ppt > 0.05 && !had) ctx.log(L(`После трения палочкой (${t.koh || 0} кап. KOH) выпали белые кристаллы гидротартрата калия`, `Таяқшамен ысқылағаннан кейін (${t.koh || 0} тамшы KOH) калий гидротартратының ақ кристалдары түзілді`, `After rubbing with the rod (${t.koh || 0} drops of KOH) white crystals of potassium hydrogen tartrate appeared`), 'obs');
        else if (!(t.ppt > 0.05)) ctx.feedback(L('Кристаллов нет — гидротартрата пока недостаточно (или он уже растворился).', 'Кристалдар жоқ — гидротартрат әлі жеткіліксіз (немесе еріп кеткен).', 'No crystals — there is not enough hydrogen tartrate yet (or it has already dissolved).'), 'info');
      } },
    { id: 'kall', group: L('Быстро', 'Жылдам', 'Quickly'), label: L('Влить сразу 2 мл KOH', '2 мл KOH-ты бірден құю', 'Pour in 2 mL of KOH at once'), advance: 15, cls: 'danger', disabled: (t) => !t.tart,
      apply(t, S, ctx) { t.koh = (t.koh || 0) + 40; t.v += 2; paintK(t); ctx.log(L('В пробирку сразу влито 2 мл 10 % KOH', 'Пробиркаға бірден 10 % KOH-тың 2 мл құйылды', '2 mL of 10 % KOH poured into the tube at once')); } },
  ],
  done: (tb) => tb.k.tart && khtState(tb.k.koh || 0).excess,
  observe: {
    question: L('Что вы наблюдали при прибавлении KOH?', 'KOH қосқанда не байқадыңыз?', 'What did you observe on adding KOH?'),
    options: [
      { id: 'ok', label: L('Белые кристаллы, которые растворились в избытке KOH', 'Артық KOH-та еріген ақ кристалдар', 'White crystals that dissolved in excess KOH'), log: L('Выпал белый кристаллический осадок гидротартрата калия; в избытке KOH он растворился', 'Калий гидротартратының ақ кристалды тұнбасы түзілді; артық KOH-та ол еріді', 'A white crystalline precipitate of potassium hydrogen tartrate formed and dissolved in excess KOH') },
      { id: 'none', label: L('Осадка не было, раствор всё время прозрачный', 'Тұнба болған жоқ, ерітінді үнемі мөлдір', 'No precipitate; the solution stayed clear throughout'), log: L('Осадок гидротартрата калия не наблюдался: раствор оставался прозрачным', 'Калий гидротартратының тұнбасы байқалмады: ерітінді мөлдір күйінде қалды', 'No potassium hydrogen tartrate precipitate was seen: the solution stayed clear') },
      { id: 'stay', label: L('Белые кристаллы, не растворяющиеся в избытке KOH', 'Артық KOH-та ерімейтін ақ кристалдар', 'White crystals that do not dissolve in excess KOH') },
      { id: 'blue', label: L('Синее окрашивание', 'Көк түске боялу', 'A blue colour') },
    ],
    correct: (S, tb) => (tb.k.seen ? 'ok' : 'none'),
    why: (S, tb) => (tb.k.seen
      ? L('Гидротартрат KOOC–CH(OH)–CH(OH)–COOH малорастворим и выпадает; с избытком KOH образуется хорошо растворимый средний тартрат KOOC–…–COOK.', 'KOOC–CH(OH)–CH(OH)–COOH гидротартраты нашар ериді де, тұнбаға түседі; артық KOH-пен жақсы еритін орта тартрат KOOC–…–COOK түзіледі.', 'The hydrogen tartrate KOOC–CH(OH)–CH(OH)–COOH is poorly soluble and precipitates; excess KOH gives the soluble neutral tartrate KOOC–…–COOK.')
      : L('Кристаллы не появились: KOH влит сразу (сразу образовался растворимый средний тартрат) или не было трения палочкой (пересыщенный раствор). Пробу повторяют.', 'Кристалдар пайда болмады: KOH бірден құйылды (бірден еритін орта тартрат түзілді) немесе таяқшамен ысқыланбады (аса қаныққан ерітінді). Сынаманы қайталайды.', 'No crystals appeared: either the KOH was poured in at once (the soluble neutral tartrate formed straight away) or the wall was not rubbed (supersaturated solution). The test is repeated.')),
  },
  onDone(S, tb, ctx) {
    if (!tb.k.seen) ctx.remark({ key: 'kht_miss', severity: 'major', text: L('характерный осадок гидротартрата калия не получен (KOH влит сразу или не было трения палочкой)', 'калий гидротартратының тән тұнбасы алынбады (KOH бірден құйылды немесе таяқшамен ысқыланбады)', 'the characteristic potassium hydrogen tartrate precipitate was not obtained (KOH poured in at once or no rubbing with the rod)') });
    S.e3.kht = !!tb.k.seen;
  },
  scene: (S, local) => tubesScene(kTubes, local, { cap: 4, rodIf: (t) => t.tart && t.added && t.added[t.added.length - 1] === 'rub' }),
  hint1: L('KOH — по каплям, после каждых нескольких капель встряхните и потрите стенку палочкой.', 'KOH — тамшылап, әр бірнеше тамшыдан кейін сілкілеп, қабырғаны таяқшамен ысқылаңыз.', 'KOH drop by drop; after every few drops shake and rub the wall with the rod.'),
  hint2: L('Кристаллы KHT появляются уже после 2–3 капель KOH при трении палочкой, больше всего их — около 7 капель (половина кислоты нейтрализована); растворяются они при ≈ 15 каплях всего.', 'KHT кристалдары таяқшамен ысқылағанда 2–3 тамшы KOH-тан кейін-ақ пайда болады, ең көбі — шамамен 7 тамшыда (қышқылдың жартысы бейтараптанған); барлығы ≈ 15 тамшыда олар ериді.', 'KHT crystals appear after only 2–3 drops of KOH when you rub with the rod; there are most of them at about 7 drops (half the acid neutralised); they dissolve at ≈ 15 drops in total.'),
  hint3: L('1 мл винной кислоты → «+5 кап.» → «Потереть стенку» (кристаллы) → «+5 кап.» ×2 (растворились).', '1 мл шарап қышқылы → «+5 тамшы» → «Қабырғаны ысқылау» (кристалдар) → «+5 тамшы» ×2 (еріді).', '1 mL tartaric acid → “+5 drops” → “Rub the wall” (crystals) → “+5 drops” ×2 (dissolved).'),
};

/* ---------- 2. Cu(OH)₂ + тартрат ---------- */
const cTubes = [{ id: 'c', label: L('Пробирка', 'Пробирка', 'Tube'), short: 'CuSO₄ + NaOH' }];
function paintC(t) {
  const r = cuTartrate({ cu: !!t.cu, naoh: t.naoh || 0, tart: t.tart || 0 });
  t.color = r.ppt > 0.3 ? `rgba(105,165,225,${(0.5 + 0.35 * r.ppt).toFixed(2)})` : r.color; t.ppt = r.ppt; t.pptColor = CUOH; t.acid = r.acid; t.chel = r.chelate;
  t.pH = r.free > 0 ? 12.5 : r.free > -0.05 ? 6 : 3;
  if (r.ppt > 0.5) t.sawPpt = true;
  return r;
}
const s1 = {
  type: 'test', id: 'cu',
  title: L('Растворение Cu(OH)₂ тартратом', 'Cu(OH)₂-нің тартратпен еруі', 'Dissolving Cu(OH)₂ with tartrate'),
  instr: L('<ol><li>Получите Cu(OH)₂: смешайте <b>1 мл</b> раствора CuSO₄ (5 %) с <b>2 мл</b> 10 % NaOH (голубой осадок).</li><li>Прибавляйте по каплям раствор винной кислоты, встряхивая.</li></ol>',
    '<ol><li>Cu(OH)₂ алыңыз: CuSO₄ ерітіндісінің (5 %) <b>1 мл</b> мөлшерін 10 % NaOH-тың <b>2 мл</b> мөлшерімен араластырыңыз (көкшіл тұнба).</li><li>Шарап қышқылы ерітіндісін сілкілей отырып тамшылатып қосыңыз.</li></ol>',
    '<ol><li>Prepare Cu(OH)₂: mix <b>1 mL</b> of CuSO₄ solution (5 %) with <b>2 mL</b> of 10 % NaOH (a blue precipitate).</li><li>Add tartaric acid solution dropwise with shaking.</li></ol>'),
  need: L('Растворите осадок Cu(OH)₂ винной кислотой', 'Cu(OH)₂ тұнбасын шарап қышқылымен ерітіңіз', 'Dissolve the Cu(OH)₂ with tartaric acid'),
  tubes: cTubes, reset: true, indicator: true, capacity: 5,
  reagents: [
    { id: 'cu', group: L('Гидроксид меди(II)', 'Мыс(II) гидроксиді', 'Copper(II) hydroxide'), label: L('CuSO₄ 5 %: 1 мл', 'CuSO₄ 5 %: 1 мл', 'CuSO₄ 5 %: 1 mL'), advance: 20, disabled: (t) => t.cu,
      apply(t, S, ctx) { t.cu = 1; t.v += 1; const r = paintC(t); ctx.log(L('В пробирку отмерен 1 мл 5 % раствора CuSO₄ (голубой раствор)', 'Пробиркаға 5 % CuSO₄ ерітіндісінің 1 мл өлшенді (көкшіл ерітінді)', '1 mL of 5 % CuSO₄ solution measured into the tube (pale blue solution)')); if (r.ppt > 0.5) ctx.log(L('Выпал голубой студенистый осадок Cu(OH)₂', 'Cu(OH)₂-нің көкшіл қоймалжың тұнбасы түзілді', 'A pale blue gelatinous precipitate of Cu(OH)₂ formed'), 'obs'); } },
    ...[[0.5, L('NaOH 10 %: +0,5 мл', 'NaOH 10 %: +0,5 мл', 'NaOH 10 %: +0.5 mL')], [1, L('NaOH 10 %: +1 мл', 'NaOH 10 %: +1 мл', 'NaOH 10 %: +1 mL')]].map(([v, label]) => ({ id: 'na' + v, group: L('Гидроксид меди(II)', 'Мыс(II) гидроксиді', 'Copper(II) hydroxide'), label, advance: 15, disabled: (t) => (t.naoh || 0) >= 3,
      apply(t, S, ctx) {
        const first = !t.naoh;
        if (first && (t.tart || 0) > 0) { t.order = true; ctx.remark({ key: 'cu_order', severity: 'minor', text: L('нарушен порядок: винная кислота прибавлена до NaOH — осадок Cu(OH)₂ и его растворение не наблюдались', 'рет бұзылды: шарап қышқылы NaOH-тан бұрын қосылды — Cu(OH)₂ тұнбасы және оның еруі байқалмады', 'wrong order: tartaric acid added before NaOH — the Cu(OH)₂ precipitate and its dissolution were not seen') }); }
        t.naoh = +((t.naoh || 0) + v).toFixed(1); t.v += v; const r = paintC(t);
        if (first && t.cu && r.ppt > 0.5) ctx.log(L('Выпал голубой студенистый осадок Cu(OH)₂', 'Cu(OH)₂-нің көкшіл қоймалжың тұнбасы түзілді', 'A pale blue gelatinous precipitate of Cu(OH)₂ formed'), 'obs');
        else ctx.log(L(`Прибавлено ${n(v, 1)} мл 10 % NaOH (всего ${n(t.naoh, 1)} мл)`, `10 % NaOH-тың ${n(v, 1)} мл қосылды (барлығы ${n(t.naoh, 1)} мл)`, `${n(v, 1)} mL of 10 % NaOH added (total ${n(t.naoh, 1)} mL)`));
      } })),
    ...[1, 5].map((k) => ({ id: 'ta' + k, group: L('Винная кислота 10 %', 'Шарап қышқылы 10 %', 'Tartaric acid 10 %'), label: L(`+${k} кап.`, `+${k} тамшы`, `+${k} ${k > 1 ? 'drops' : 'drop'}`), advance: 5 * k, disabled: (t) => !t.cu,
      apply(t, S, ctx) { t.tart = (t.tart || 0) + k; t.v += DROP * k; paintC(t); } })),
  ],
  done: (tb) => { const t = tb.c; return t.cu && t.naoh > 0 && t.tart > 0 && t.ppt < 0.02; },
  observe: {
    question: L('Что произошло с осадком Cu(OH)₂?', 'Cu(OH)₂ тұнбасына не болды?', 'What happened to the Cu(OH)₂ precipitate?'),
    options: [
      { id: 'deep', label: L('Осадок растворился — прозрачный тёмно-синий раствор', 'Тұнба еріді — мөлдір қою көк ерітінді', 'The precipitate dissolved — a clear deep-blue solution'), log: (S, tb) => L(`Голубой осадок Cu(OH)₂ при прибавлении ${tb.c.tart} кап. винной кислоты растворился: прозрачный тёмно-синий раствор тартрата меди(II)`, `Шарап қышқылының ${tb.c.tart} тамшысын қосқанда Cu(OH)₂-нің көкшіл тұнбасы еріді: мыс(II) тартратының мөлдір қою көк ерітіндісі`, `On adding ${tb.c.tart} drops of tartaric acid the pale blue Cu(OH)₂ dissolved: a clear deep-blue solution of copper(II) tartrate`) },
      { id: 'pale', label: L('Осадок растворился, но раствор бледно-голубой, как CuSO₄', 'Тұнба еріді, бірақ ерітінді CuSO₄ сияқты ақшыл көк', 'The precipitate dissolved but the solution is pale blue, like CuSO₄'), log: L('Осадок растворился, но раствор бледно-голубой (ионы Cu²⁺): щёлочи было мало, среда стала кислой — хелат не образовался', 'Тұнба еріді, бірақ ерітінді ақшыл көк (Cu²⁺ иондары): сілті аз болды, орта қышқыл болды — хелат түзілмеді', 'The precipitate dissolved but the solution is pale blue (Cu²⁺ ions): there was too little alkali, the medium turned acidic and no chelate formed') },
      { id: 'nopp', label: L('Тёмно-синий раствор сразу, осадка Cu(OH)₂ не было', 'Бірден қою көк ерітінді, Cu(OH)₂ тұнбасы болған жоқ', 'A deep-blue solution at once; there was no Cu(OH)₂ precipitate'), log: L('Осадок Cu(OH)₂ не образовался: винная кислота прибавлена раньше щёлочи — сразу тёмно-синий раствор', 'Cu(OH)₂ тұнбасы түзілмеді: шарап қышқылы сілтіден бұрын қосылды — бірден қою көк ерітінді', 'No Cu(OH)₂ precipitate formed: tartaric acid was added before the alkali — a deep-blue solution at once') },
      { id: 'black', label: L('Осадок почернел', 'Тұнба қараяды', 'The precipitate turned black') },
    ],
    correct: (S, tb) => (tb.c.acid ? 'pale' : tb.c.order || !tb.c.sawPpt ? 'nopp' : 'deep'),
    why: () => L('Тартрат — вицинальный диол — в щелочной среде образует с Cu²⁺ растворимый тёмно-синий хелат (принцип реактива Фелинга). В кислой среде хелат разрушается.', 'Тартрат — вициналды диол — сілтілі ортада Cu²⁺-пен еритін қою көк хелат түзеді (Фелинг реактивінің принципі). Қышқыл ортада хелат бұзылады.', 'Tartrate, a vicinal diol, forms a soluble deep-blue chelate with Cu²⁺ in alkaline solution (the principle of Fehling’s solution). In acidic solution the chelate breaks down.'),
  },
  onDone(S, tb, ctx) {
    const t = tb.c;
    if (t.acid) ctx.remark({ key: 'cu_naoh', severity: 'major', text: L('щёлочи прибавлено меньше 2 мл: винная кислота нейтрализовала её, хелат меди(II) не образовался', 'сілті 2 мл-ден аз қосылды: шарап қышқылы оны бейтараптады, мыс(II) хелаты түзілмеді', 'less than 2 mL of alkali was added: the tartaric acid neutralised it and no copper(II) chelate formed') });
    S.e3.cu = t.acid ? 'pale' : t.order || !t.sawPpt ? 'nopp' : 'deep';
    S.e3.naoh = t.naoh; S.e3.tart = t.tart;
  },
  scene: (S, local) => tubesScene(cTubes, local, { cap: 4 }),
  hint1: L('Реактив Фелинга работает только в щелочной среде: NaOH должно быть с запасом — 2 мл.', 'Фелинг реактиві тек сілтілі ортада жұмыс істейді: NaOH қормен — 2 мл болуы керек.', 'Fehling-type chelation works only in alkaline solution: use NaOH in excess — 2 mL.'),
  hint2: L('Если NaOH мало (0,5 мл), винная кислота его нейтрализует и раствор станет кислым — синего хелата не будет.', 'NaOH аз болса (0,5 мл), шарап қышқылы оны бейтараптап, ерітінді қышқыл болады — көк хелат болмайды.', 'With too little NaOH (0.5 mL) the tartaric acid neutralises it and the solution turns acidic — no blue chelate.'),
  hint3: L('1 мл CuSO₄ → NaOH +1 мл ×2 (голубой осадок) → винная кислота «+5 кап.» ×2 — тёмно-синий раствор.', '1 мл CuSO₄ → NaOH +1 мл ×2 (көкшіл тұнба) → шарап қышқылы «+5 тамшы» ×2 — қою көк ерітінді.', '1 mL CuSO₄ → NaOH +1 mL ×2 (blue precipitate) → tartaric acid “+5 drops” ×2 — deep-blue solution.'),
};

export default {
  id: '3',
  title: L('Реакции винной кислоты', 'Шарап қышқылының реакциялары', 'Reactions of tartaric acid'),
  principle: L('(а) Гидротартрат калия малорастворим в воде и выпадает белыми кристаллами; (б) тартрат, вицинальный диол, образует с Cu(OH)₂ в щелочной среде растворимый тёмно-синий хелат.', '(а) Калий гидротартраты суда нашар ериді және ақ кристалдар түрінде тұнбаға түседі; (ә) тартрат, вициналды диол, сілтілі ортада Cu(OH)₂-пен еритін қою көк хелат түзеді.', '(a) Potassium hydrogen tartrate is poorly soluble in water and precipitates as white crystals; (b) tartrate, a vicinal diol, forms a soluble deep-blue chelate with Cu(OH)₂ in alkaline medium.'),
  equation: ['HOOC–CH(OH)–CH(OH)–COOH + KOH → KOOC–CH(OH)–CH(OH)–COOH↓ + H₂O', 'KOOC–CH(OH)–CH(OH)–COOH + KOH → KOOC–CH(OH)–CH(OH)–COOK + H₂O', L('тартрат + Cu(OH)₂ (NaOH) → растворимый тёмно-синий хелат тартрата меди(II)', 'тартрат + Cu(OH)₂ (NaOH) → мыс(II) тартратының еритін қою көк хелаты', 'tartrate + Cu(OH)₂ (NaOH) → soluble deep-blue copper(II) tartrate chelate')],
  initialState: () => ({ e3: { kht: null, cu: null } }),
  checkpoints: [0, 1],
  steps: [s0, s1],
  results: (S) => ({ ...S.e3 }),
  summary: (r) => [
    { label: 'KOH', value: r.kht ? L('кристаллы KHT', 'KHT кристалдары', 'KHT crystals') : L('осадка нет', 'тұнба жоқ', 'no precipitate'), st: r.kht ? 'ok' : 'warn' },
    { label: 'Cu(OH)₂', value: r.cu === 'deep' ? L('тёмно-синий', 'қою көк', 'deep blue') : r.cu === 'pale' ? L('бледно-голубой', 'ақшыл көк', 'pale blue') : L('тёмно-синий сразу', 'бірден қою көк', 'deep blue at once'), st: r.cu === 'deep' ? 'ok' : 'warn' },
  ],
};
