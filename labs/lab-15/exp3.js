/** Опыт 3. Проба Фелинга (Бенедикта). Методичка, раздел 6, опыт 3. */
import { L } from '../../app/i18n.js';
import { tubesOf, sugarReagent, baseState, cellsSummary, CROSS } from './common.js';
import { envOf } from './steps/bench.js';
import { PROPS, look } from './model.js';

const settled = (S, b) => b.tubes.filter((t) => PROPS[t.sug].reducing).every((t) => look('fehling', t, envOf(S)).code === 'red');

const s0 = {
  type: 'lab15-bench', id: 'fehling', key: 'fehling', test: 'fehling',
  title: L('Проба Фелинга', 'Фелинг сынамасы', 'Fehling’s test'),
  instr: L('<ol><li>В каждой пробирке смешайте <b>1 мл раствора Фелинга A</b> (≈ 7 % CuSO₄·5H₂O) и <b>1 мл раствора Фелинга B</b> (тартрат калия-натрия + NaOH).</li><li>Прибавьте <b>1 мл</b> раствора сахара.</li><li>Нагрейте в <b>кипящей водяной бане 2–3 минуты</b>.</li></ol><p class="note">Растворы A и B хранят раздельно и смешивают непосредственно перед пробой. Вместо них можно взять 2 мл реактива Бенедикта.</p>',
    '<ol><li>Әр пробиркада <b>1 мл Фелинг A ерітіндісін</b> (≈ 7 % CuSO₄·5H₂O) және <b>1 мл Фелинг B ерітіндісін</b> (калий-натрий тартраты + NaOH) араластырыңыз.</li><li>Қант ерітіндісінің <b>1 мл</b>-ін қосыңыз.</li><li><b>Қайнап тұрған су моншасында 2–3 минут</b> қыздырыңыз.</li></ol><p class="note">A және B ерітінділерін бөлек сақтап, сынаманың алдында ғана араластырады. Олардың орнына 2 мл Бенедикт реактивін алуға болады.</p>',
    '<ol><li>In each tube mix <b>1 mL of Fehling’s solution A</b> (≈ 7 % CuSO₄·5H₂O) and <b>1 mL of Fehling’s solution B</b> (potassium sodium tartrate + NaOH).</li><li>Add <b>1 mL</b> of the sugar solution.</li><li>Heat in a <b>boiling water bath for 2–3 minutes</b>.</li></ol><p class="note">Solutions A and B are stored separately and mixed just before the test. 2 mL of Benedict’s reagent may be used instead.</p>'),
  need: L('Приготовьте пробы и нагрейте 2–3 мин', 'Сынамаларды дайындап, 2–3 мин қыздырыңыз', 'Prepare the tubes and heat for 2–3 min'),
  tubes: tubesOf(),
  baths: ['boil', 'warm'],
  reagents: [
    { id: 'a', group: L('Реактив Фелинга', 'Фелинг реактиві', 'Fehling’s reagent'), label: L('1 мл раствора A (CuSO₄)', '1 мл A ерітіндісі (CuSO₄)', '1 mL of solution A (CuSO₄)'), target: 'all', advance: 45,
      disabled: (S, b) => b.tubes.every((t) => t.a > 0), when: (t) => (t.a ? L('Раствор A уже прилит.', 'A ерітіндісі құйылды.', 'Solution A is already in.') : null),
      apply(t) { t.a = 1; t.v += 1; }, log: L('В каждую пробирку прилит 1 мл раствора Фелинга A — голубой раствор CuSO₄', 'Әр пробиркаға 1 мл Фелинг A ерітіндісі құйылды — CuSO₄-тің көгілдір ерітіндісі', '1 mL of Fehling’s solution A added to each tube — a pale-blue CuSO₄ solution') },
    { id: 'b', group: L('Реактив Фелинга', 'Фелинг реактиві', 'Fehling’s reagent'), label: L('1 мл раствора B (тартрат + NaOH)', '1 мл B ерітіндісі (тартрат + NaOH)', '1 mL of solution B (tartrate + NaOH)'), target: 'all', advance: 45,
      disabled: (S, b) => b.tubes.every((t) => t.b > 0), when: (t) => (t.b ? L('Раствор B уже прилит.', 'B ерітіндісі құйылды.', 'Solution B is already in.') : null),
      apply(t) { t.b = 1; t.v += 1; }, log: (S, b) => (b.tubes[0].a ? L('Прилит 1 мл раствора Фелинга B — образовался прозрачный тёмно-синий тартратный комплекс меди(II)', '1 мл Фелинг B ерітіндісі құйылды — мыс(II)-тің мөлдір қою көк тартрат кешені түзілді', '1 mL of Fehling’s solution B added — a clear dark-blue copper(II) tartrate complex formed') : L('В каждую пробирку прилит 1 мл раствора Фелинга B', 'Әр пробиркаға 1 мл Фелинг B ерітіндісі құйылды', '1 mL of Fehling’s solution B added to each tube')) },
    sugarReagent(1),
  ],
  check(S, b, ctx) {
    if (b.tubes.some((t) => t.bath && !(t.sugV > 0))) ctx.feedback(L('В пробирки ещё не внесены растворы сахаров.', 'Пробиркаларға әлі қант ерітінділері салынбаған.', 'The sugar solutions are not in the tubes yet.'), 'warn');
    if (b.tubes.some((t) => (t.hw || 0) >= 150) && !b.tubes.some((t) => t.hb > 0)) {
      ctx.remark({ key: 'feh-warm', severity: 'minor', text: L('проба Фелинга нагревается в бане 50–60 °C вместо кипящей', 'Фелинг сынамасы қайнап тұрғанның орнына 50–60 °C моншада қыздырылуда', 'Fehling’s test heated in the 50–60 °C bath instead of the boiling one') });
      ctx.feedback(L('При 50–60 °C реакция идёт очень медленно — по методичке нужна кипящая баня.', '50–60 °C-та реакция өте баяу жүреді — әдістеме бойынша қайнап тұрған монша керек.', 'At 50–60 °C the reaction is very slow — the manual calls for a boiling bath.'), 'warn');
    }
  },
  done: (S, b) => b.tubes.every((t) => t.sugV > 0 && (t.hb || 0) >= 120) && (settled(S, b) || b.tubes.every((t) => (t.hb || 0) >= 240)) && L('Картина установилась — можно вынимать пробирки и записывать.', 'Көрініс тұрақтады — пробиркаларды алып, жазуға болады.', 'The picture is settled — take the tubes out and record.'),
  reset: true,
  hints: [
    L('Реактив Фелинга — это смесь двух растворов: A (сульфат меди) и B (тартрат + щёлочь). Сначала смешать их, потом сахар, потом кипящая баня.', 'Фелинг реактиві — екі ерітіндінің қоспасы: A (мыс сульфаты) және B (тартрат + сілті). Алдымен оларды араластыру, содан кейін қант, содан кейін қайнап тұрған монша.', 'Fehling’s reagent is a mixture of two solutions: A (copper sulfate) and B (tartrate + alkali). Mix them first, then the sugar, then the boiling bath.'),
    L('Без раствора B нет ни щелочной среды, ни растворимого комплекса меди — реакция не пойдёт.', 'B ерітіндісі болмаса, сілтілі орта да, мыстың еритін кешені де жоқ — реакция жүрмейді.', 'Without solution B there is neither an alkaline medium nor a soluble copper complex — no reaction.'),
    L('«Раствор A» → «Раствор B» → «Внести по 1 мл» → «Все пробирки → в кипящую баню», ждать ≈ 2,5 мин.', '«A ерітіндісі» → «B ерітіндісі» → «1 мл-ден салу» → «Барлық пробирка → қайнап тұрған моншаға», ≈ 2,5 мин күту.', '“Solution A” → “Solution B” → “Add 1 mL” → “All tubes → into the boiling bath”, wait ≈ 2.5 min.'),
  ],
};

const s1 = {
  type: 'lab15-record', id: 'rec', key: 'fehling', test: 'fehling', saveAs: 'fehling',
  title: L('Наблюдения: проба Фелинга', 'Бақылаулар: Фелинг сынамасы', 'Observations: Fehling’s test'),
  instr: L('<p>Опишите результат в каждой пробирке после нагревания.</p>', '<p>Қыздырудан кейін әр пробирканың нәтижесін сипаттаңыз.</p>', '<p>Describe the result in each tube after heating.</p>'),
  need: L('Запишите наблюдение по каждой пробирке', 'Әр пробирка бойынша бақылауды жазыңыз', 'Record the observation for each tube'),
  options: ['red', 'blue', 'yellow', 'black'],
  anomalies: {
    cuso4: { severity: 'major', text: L('не прилит раствор Фелинга B: нет щелочной среды и тартратного комплекса — все пробы ложноотрицательные', 'Фелинг B ерітіндісі құйылмаған: сілтілі орта мен тартрат кешені жоқ — барлық сынама жалған теріс', 'Fehling’s solution B was not added: no alkaline medium and no tartrate complex — every test is falsely negative'),
      whatif: L('Раствор A — это только CuSO₄. Восстановление Cu(II) сахаром идёт в щелочной среде, а тартрат удерживает медь в растворе в виде синего комплекса. Без раствора B даже глюкоза «не реагирует».', 'A ерітіндісі — тек CuSO₄. Cu(II)-нің қантпен тотықсыздануы сілтілі ортада жүреді, ал тартрат мысты көк кешен түрінде ерітіндіде ұстайды. B ерітіндісі болмаса, тіпті глюкоза да «әрекеттеспейді».', 'Solution A is just CuSO₄. Copper(II) is reduced by the sugar in alkaline medium, and the tartrate keeps the copper in solution as the blue complex. Without solution B even glucose “does not react”.') },
    red: CROSS, yellow: CROSS,
  },
  why: (t, code) => (code === 'red' && t.sug !== 'suc' ? L('Восстанавливающий сахар восстанавливает тёмно-синий тартратный комплекс Cu(II) до кирпично-красного Cu₂O.', 'Тотықсыздандырғыш қант Cu(II)-нің қою көк тартрат кешенін кірпіш-қызыл Cu₂O-ға дейін тотықсыздандырады.', 'The reducing sugar reduces the dark-blue Cu(II) tartrate complex to brick-red Cu₂O.') : code === 'blue' ? L('Сахароза — невосстанавливающий сахар: раствор остаётся синим.', 'Сахароза — тотықсыздандырмайтын қант: ерітінді көк күйінде қалады.', 'Sucrose is a non-reducing sugar: the solution stays blue.') : null),
};

export default {
  id: '3',
  title: L('Проба Фелинга (Бенедикта)', 'Фелинг (Бенедикт) сынамасы', 'Fehling’s (Benedict’s) test'),
  principle: L('Восстанавливающие сахара при нагревании восстанавливают тёмно-синий тартратный (или цитратный) комплекс меди(II) до красного оксида меди(I).', 'Тотықсыздандырғыш қанттар қыздырғанда мыс(II)-тің қою көк тартрат (немесе цитрат) кешенін қызыл мыс(I) оксидіне дейін тотықсыздандырады.', 'On heating, reducing sugars reduce the deep-blue copper(II) tartrate (or citrate) complex to red copper(I) oxide.'),
  equation: ['RCHO + 2Cu²⁺ + 5OH⁻ → RCOO⁻ + Cu₂O↓ + 3H₂O'],
  initialState: (a) => baseState(a),
  checkpoints: [0],
  steps: [s0, s1],
  results: (S) => ({ cells: S.res, crossSeen: !!S.crossSeen, noB: !!(S.b.fehling && S.b.fehling.tubes.some((t) => !(t.b > 0))) }),
  summary: (r) => cellsSummary(r, 'fehling'),
};
