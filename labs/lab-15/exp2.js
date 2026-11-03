/** Опыт 2. Проба Троммера. Методичка, раздел 6, опыт 2. */
import { L } from '../../app/i18n.js';
import { tubesOf, sugarReagent, baseState, cellsSummary, CROSS } from './common.js';
import { benchScene } from './steps/bench.js';
import { PROPS, look } from './model.js';
import { envOf } from './steps/bench.js';

const reddish = (S, b) => b.tubes.filter((t) => PROPS[t.sug].reducing).every((t) => look('trommer', t, envOf(S)).code === 'red' || look('trommer', t, envOf(S)).code === 'black');


const s0 = {
  type: 'lab15-bench', id: 'cold', key: 'trommer', test: 'trommer',
  title: L('Проба Троммера на холоду', 'Суықтағы Троммер сынамасы', 'Trommer’s test in the cold'),
  instr: L('<ol><li>К <b>1 мл</b> каждого раствора сахара прибавьте <b>1 мл 10 % NaOH</b> и <b>3–5 капель 5 % CuSO₄</b>.</li><li>Встряхните и отметьте окраску при комнатной температуре.</li></ol><p class="note">NaOH — едкая щёлочь: перчатки и очки.</p>',
    '<ol><li>Әр қант ерітіндісінің <b>1 мл</b>-іне <b>1 мл 10 % NaOH</b> және <b>3–5 тамшы 5 % CuSO₄</b> қосыңыз.</li><li>Шайқап, бөлме температурасындағы түсті белгілеңіз.</li></ol><p class="note">NaOH — күйдіргіш сілті: қолғап пен көзілдірік.</p>',
    '<ol><li>To <b>1 mL</b> of each sugar solution add <b>1 mL of 10 % NaOH</b> and <b>3–5 drops of 5 % CuSO₄</b>.</li><li>Shake and note the colour at room temperature.</li></ol><p class="note">NaOH is a caustic alkali: gloves and goggles.</p>'),
  need: L('Приготовьте пробы и встряхните', 'Сынамаларды дайындап, шайқаңыз', 'Prepare the tubes and shake them'),
  tubes: tubesOf(),
  baths: [],
  reagents: [
    sugarReagent(1),
    { id: 'naoh', group: L('Щёлочь', 'Сілті', 'Alkali'), label: L('1 мл NaOH 10 % в каждую', 'Әрқайсысына 1 мл NaOH 10 %', '1 mL of 10 % NaOH to each'), target: 'all', advance: 60,
      disabled: (S, b) => b.tubes.every((t) => t.naoh > 0),
      when: (t) => (!t.sugV ? L('Сначала внесите растворы сахаров.', 'Алдымен қант ерітінділерін салыңыз.', 'Add the sugar solutions first.') : t.naoh ? L('Щёлочь уже прилита.', 'Сілті құйылды.', 'The alkali is already in.') : null),
      apply(t) { t.naoh = 1; t.v += 1; }, log: L('В каждую пробирку прилит 1 мл 10 % NaOH', 'Әр пробиркаға 1 мл 10 % NaOH құйылды', '1 mL of 10 % NaOH added to each tube') },
    { id: 'cu1', group: L('Сульфат меди(II) 5 %', 'Мыс(II) сульфаты 5 %', 'Copper(II) sulfate 5 %'), label: L('+1 капля CuSO₄ в каждую', 'Әрқайсысына +1 тамшы CuSO₄', '+1 drop of CuSO₄ to each'), target: 'all', advance: 15,
      when: (t) => (!t.sugV ? L('Сначала внесите растворы сахаров.', 'Алдымен қант ерітінділерін салыңыз.', 'Add the sugar solutions first.') : null),
      apply(t) { t.cu = (t.cu || 0) + 1; t.v += 0.05; },
      log: (S, b) => L(`В каждую пробирку прибавлена капля 5 % CuSO₄ (всего ${b.tubes[0].cu} кап.)`, `Әр пробиркаға 5 % CuSO₄ тамшысы қосылды (барлығы ${b.tubes[0].cu} тамшы)`, `A drop of 5 % CuSO₄ added to each tube (${b.tubes[0].cu} in total)`) },
    { id: 'cuml', group: L('Сульфат меди(II) 5 %', 'Мыс(II) сульфаты 5 %', 'Copper(II) sulfate 5 %'), label: L('Прилить 1 мл CuSO₄ — для яркости', 'Жарқын болу үшін 1 мл CuSO₄ құю', 'Add 1 mL of CuSO₄ — for a brighter colour'), target: 'all', advance: 20, cls: 'ghost',
      when: (t) => (!t.sugV ? L('Сначала внесите растворы сахаров.', 'Алдымен қант ерітінділерін салыңыз.', 'Add the sugar solutions first.') : null),
      apply(t) { t.cu = (t.cu || 0) + 20; t.v += 1; }, log: L('В каждую пробирку прилит 1 мл 5 % CuSO₄ (≈ 20 капель)', 'Әр пробиркаға 1 мл 5 % CuSO₄ құйылды (≈ 20 тамшы)', '1 mL of 5 % CuSO₄ (≈ 20 drops) added to each tube') },
    { id: 'shake', group: L('Пробирки', 'Пробиркалар', 'Tubes'), label: L('Встряхнуть пробирки', 'Пробиркаларды шайқау', 'Shake the tubes'), target: 'all', advance: 20,
      when: (t) => (!t.cu ? L('Сначала прибавьте реактивы.', 'Алдымен реактивтерді қосыңыз.', 'Add the reagents first.') : null),
      apply(t) { t.mixed = 1; }, log: L('Пробирки встряхнуты, окраска отмечена при комнатной температуре', 'Пробиркалар шайқалды, түс бөлме температурасында белгіленді', 'Tubes shaken; the colour noted at room temperature') },
  ],
  check(S, b, ctx) {
    if (b.tubes.some((t) => t.cu > 0 && t.cu < 3 && t.mixed)) ctx.feedback(L('По методичке CuSO₄ — 3–5 капель.', 'Әдістеме бойынша CuSO₄ — 3–5 тамшы.', 'The manual says 3–5 drops of CuSO₄.'), 'warn');
  },
  done: (S, b) => b.tubes.every((t) => t.sugV && t.cu >= 3 && t.mixed) && L('Окраска при комнатной температуре установилась.', 'Бөлме температурасындағы түс тұрақтады.', 'The colour at room temperature is settled.'),
  reset: true,
  hints: [
    L('Порядок: сахар → щёлочь → немного CuSO₄. Cu(OH)₂ образуется в щелочной среде и растворяется полиолом.', 'Рет: қант → сілті → аздап CuSO₄. Cu(OH)₂ сілтілі ортада түзіледі және полиолда ериді.', 'Order: sugar → alkali → a little CuSO₄. Cu(OH)₂ forms in alkaline medium and is dissolved by the polyol.'),
    L('CuSO₄ — всего 3–5 капель: избыток Cu(OH)₂ сахар растворить не сможет.', 'CuSO₄ — небәрі 3–5 тамшы: Cu(OH)₂ артығын қант ерітуге қабілетсіз.', 'Only 3–5 drops of CuSO₄: the sugar cannot dissolve an excess of Cu(OH)₂.'),
    L('«Внести по 1 мл» → «1 мл NaOH» → «+1 капля CuSO₄» четыре раза → «Встряхнуть».', '«1 мл-ден салу» → «1 мл NaOH» → «+1 тамшы CuSO₄» төрт рет → «Шайқау».', '“Add 1 mL” → “1 mL NaOH” → “+1 drop CuSO₄” four times → “Shake”.'),
  ],
};

const s1 = {
  type: 'lab15-record', id: 'recCold', key: 'trommer', test: 'trommer', saveAs: 'trommerCold',
  title: L('Наблюдения: Троммер на холоду', 'Бақылаулар: суықтағы Троммер', 'Observations: Trommer in the cold'),
  instr: L('<p>Опишите окраску и вид содержимого каждой пробирки при комнатной температуре.</p>', '<p>Бөлме температурасындағы әр пробирканың түсі мен түрін сипаттаңыз.</p>', '<p>Describe the colour and appearance of each tube at room temperature.</p>'),
  need: L('Запишите наблюдение по каждой пробирке', 'Әр пробирка бойынша бақылауды жазыңыз', 'Record the observation for each tube'),
  options: ['chelate', 'cuppt', 'excess', 'red'],
  anomalies: {
    cuso4: { severity: 'major', text: L('не прибавлена щёлочь: Cu(OH)₂ не образовался, проба на полиол не проведена', 'сілті қосылмаған: Cu(OH)₂ түзілмеді, полиолға сынама жүргізілмеді', 'no alkali added: Cu(OH)₂ did not form and the polyol test was not done'),
      whatif: L('Без NaOH в растворе остаётся только бледно-голубой CuSO₄: хелатного комплекса нет, и при нагревании медь(II) тоже не восстановится — все пробы выйдут «отрицательными».', 'NaOH болмаса, ерітіндіде тек ақшыл көгілдір CuSO₄ қалады: хелат кешені жоқ, қыздырғанда мыс(II) де тотықсызданбайды — барлық сынама «теріс» шығады.', 'Without NaOH only pale-blue CuSO₄ remains: there is no chelate, and on heating copper(II) will not be reduced either — every test will come out “negative”.') },
  },
  why: (t, code) => (code === 'chelate' ? L('Вицинальные OH-группы сахара образуют с Cu(OH)₂ растворимый ярко-синий хелат — это проба на многоатомный спирт, поэтому её дают все сахара, и сахароза тоже.', 'Қанттың вициналь OH-топтары Cu(OH)₂-мен еритін ашық көк хелат түзеді — бұл көпатомды спиртке сынама, сондықтан оны барлық қант, сахароза да береді.', 'The vicinal OH groups of the sugar form a soluble deep-blue chelate with Cu(OH)₂ — a test for a polyol, so every sugar gives it, sucrose included.') : null),
};

const s2 = {
  type: 'lab15-bench', id: 'hot', key: 'trommer', test: 'trommer',
  title: L('Проба Троммера при нагревании', 'Қыздырғандағы Троммер сынамасы', 'Trommer’s test on heating'),
  instr: L('<ol><li>Поместите пробирки в <b>кипящую водяную баню на 2–3 минуты</b>.</li><li>Наблюдайте изменение окраски и время появления осадка по секундомеру.</li></ol><p class="note">Нагретую пробирку не направляют отверстием на себя и соседей.</p>',
    '<ol><li>Пробиркаларды <b>2–3 минутқа қайнап тұрған су моншасына</b> салыңыз.</li><li>Түстің өзгеруін және тұнбаның пайда болу уақытын секундомер бойынша бақылаңыз.</li></ol><p class="note">Қыздырылған пробирканың аузын өзіңізге және көршілерге бағыттамайды.</p>',
    '<ol><li>Place the tubes in a <b>boiling water bath for 2–3 minutes</b>.</li><li>Watch the colour change and time the appearance of the precipitate with the stopwatch.</li></ol><p class="note">Never point a heated tube at yourself or anyone else.</p>'),
  need: L('Нагрейте в кипящей бане 2–3 мин', 'Қайнап тұрған моншада 2–3 мин қыздырыңыз', 'Heat in the boiling bath for 2–3 min'),
  tubes: tubesOf(),
  baths: ['boil', 'warm'],
  reagents: [],
  check(S, b, ctx) {
    if (b.tubes.some((t) => (t.hw || 0) >= 150) && !b.tubes.some((t) => t.hb > 0)) {
      ctx.remark({ key: 'trom-warm', severity: 'minor', text: L('проба Троммера нагревается в бане 50–60 °C вместо кипящей', 'Троммер сынамасы қайнап тұрғанның орнына 50–60 °C моншада қыздырылуда', 'Trommer’s test heated in the 50–60 °C bath instead of the boiling one') });
      ctx.feedback(L('При 50–60 °C медь(II) восстанавливается очень медленно — методичка требует кипящую баню.', '50–60 °C-та мыс(II) өте баяу тотықсызданады — әдістеме қайнап тұрған моншаны талап етеді.', 'At 50–60 °C copper(II) is reduced very slowly — the manual calls for a boiling bath.'), 'warn');
    }
  },
  done: (S, b) => b.tubes.every((t) => (t.hb || 0) >= 120) && (reddish(S, b) || b.tubes.every((t) => (t.hb || 0) >= 240)) && L('Картина установилась — можно вынимать пробирки и записывать.', 'Көрініс тұрақтады — пробиркаларды алып, жазуға болады.', 'The picture is settled — take the tubes out and record.'),
  hints: [
    L('Нужна кипящая баня и 2–3 минуты; следите за пробирками по очереди.', 'Қайнап тұрған монша және 2–3 минут керек; пробиркаларды кезекпен қадағалаңыз.', 'You need the boiling bath and 2–3 minutes; watch the tubes one by one.'),
    L('Восстанавливающие сахара дают сначала жёлтый CuOH, затем красный Cu₂O; в баню 50–60 °C ставить не нужно.', 'Тотықсыздандырғыш қанттар алдымен сары CuOH, содан кейін қызыл Cu₂O береді; 50–60 °C моншаға қоюдың қажеті жоқ.', 'Reducing sugars give first yellow CuOH and then red Cu₂O; the 50–60 °C bath is not the one to use.'),
    L('«Все пробирки → в кипящую баню», ход времени ×5 или ×10 — и ждать ≈ 2,5 мин по секундомеру.', '«Барлық пробирка → қайнап тұрған моншаға», уақыт ×5 немесе ×10 — секундомер бойынша ≈ 2,5 мин күту.', '“All tubes → into the boiling bath”, time ×5 or ×10 — and wait ≈ 2.5 min on the stopwatch.'),
  ],
};

const s3 = {
  type: 'lab15-record', id: 'recHot', key: 'trommer', test: 'trommer', saveAs: 'trommerHot',
  title: L('Наблюдения: Троммер при нагревании', 'Бақылаулар: қыздырғандағы Троммер', 'Observations: Trommer on heating'),
  instr: L('<p>Опишите, что произошло в каждой пробирке при нагревании, и время появления красного осадка.</p>', '<p>Қыздырғанда әр пробиркада не болғанын және қызыл тұнбаның пайда болу уақытын сипаттаңыз.</p>', '<p>Describe what happened in each tube on heating and when the red precipitate appeared.</p>'),
  need: L('Запишите наблюдение по каждой пробирке', 'Әр пробирка бойынша бақылауды жазыңыз', 'Record the observation for each tube'),
  options: ['red', 'yellow', 'blue', 'black'],
  anomalies: {
    black: { severity: 'major', text: L('избыток CuSO₄: нерастворённый Cu(OH)₂ при нагревании разложился до чёрного CuO и замаскировал результат', 'CuSO₄ артық: ерімеген Cu(OH)₂ қыздырғанда қара CuO-ға дейін ыдырап, нәтижені бүркемеледі', 'excess CuSO₄: undissolved Cu(OH)₂ decomposed on heating to black CuO and masked the result'),
      whatif: L('Сахар растворяет только столько Cu(OH)₂, сколько связывает в хелат. Лишний гидроксид при кипячении теряет воду: Cu(OH)₂ → CuO↓ + H₂O — чёрный осадок закрывает красный Cu₂O, и восстанавливающий сахар не отличить от сахарозы.', 'Қант хелатқа байланыстыра алатын Cu(OH)₂-ні ғана ерітеді. Артық гидроксид қайнатқанда су жоғалтады: Cu(OH)₂ → CuO↓ + H₂O — қара тұнба қызыл Cu₂O-ны жабады да, тотықсыздандырғыш қантты сахарозадан ажырату мүмкін емес.', 'The sugar dissolves only as much Cu(OH)₂ as it binds in the chelate. On boiling the extra hydroxide loses water: Cu(OH)₂ → CuO↓ + H₂O — the black precipitate hides the red Cu₂O and a reducing sugar cannot be told from sucrose.') },
    red: CROSS, yellow: CROSS,
  },
  why: (t, code) => (code === 'red' && t.sug !== 'suc' ? L('Свободная (потенциально свободная) карбонильная группа восстанавливает Cu(II) до Cu(I): сначала жёлтый CuOH, затем красный Cu₂O.', 'Бос (әлеуетті бос) карбонил тобы Cu(II)-ні Cu(I)-ге дейін тотықсыздандырады: алдымен сары CuOH, содан кейін қызыл Cu₂O.', 'The free (potentially free) carbonyl group reduces Cu(II) to Cu(I): first yellow CuOH, then red Cu₂O.') : code === 'blue' ? L('У сахарозы оба аномерных атома углерода заняты гликозидной связью — свободной карбонильной группы нет, медь не восстанавливается.', 'Сахарозада екі аномерлі көміртек атомы да гликозидтік байланыспен бос емес — бос карбонил тобы жоқ, мыс тотықсызданбайды.', 'In sucrose both anomeric carbons are tied up in the glycosidic bond — there is no free carbonyl and the copper is not reduced.') : null),
};

const s4 = {
  type: 'quiz', id: 'q',
  title: L('Вывод по пробе Троммера', 'Троммер сынамасы бойынша қорытынды', 'Conclusion from Trommer’s test'),
  instr: L('<p>Ответьте на вопросы преподавателя.</p>', '<p>Оқытушының сұрақтарына жауап беріңіз.</p>', '<p>Answer the instructor’s questions.</p>'),
  need: L('Ответьте на вопросы', 'Сұрақтарға жауап беріңіз', 'Answer the questions'),
  scene: (S) => benchScene(S, 'trommer', { baths: ['boil'] }),
  questions: [
    { q: L('Какое свойство сахаров обнаруживает реакция с Cu(OH)₂ на холоду, а какое — при нагревании?', 'Суықта Cu(OH)₂-мен реакция қанттардың қандай қасиетін, ал қыздырғанда қайсысын анықтайды?', 'Which property of the sugars is detected by Cu(OH)₂ in the cold, and which on heating?'),
      options: [L('На холоду — многоатомный спирт (вицинальные OH), при нагревании — восстанавливающие свойства', 'Суықта — көпатомды спирт (вициналь OH), қыздырғанда — тотықсыздандырғыш қасиеттер', 'Cold — a polyol (vicinal OH); hot — reducing properties'), L('На холоду — альдегидная группа, при нагревании — кетогруппа', 'Суықта — альдегид тобы, қыздырғанда — кето топ', 'Cold — the aldehyde group; hot — the keto group'), L('Обе стадии обнаруживают только восстанавливающие сахара', 'Екі саты да тек тотықсыздандырғыш қанттарды анықтайды', 'Both stages detect only reducing sugars')],
      correct: 0, why: L('Синий хелат дают все сахара (и сахароза), Cu₂O — только восстанавливающие.', 'Көк хелатты барлық қант (сахароза да) береді, Cu₂O — тек тотықсыздандырғыштар.', 'All sugars (sucrose too) give the blue chelate; only reducing sugars give Cu₂O.') },
    { q: L('Почему фруктоза — кетоза — тоже восстанавливает Cu(OH)₂?', 'Неліктен фруктоза — кетоза — да Cu(OH)₂-ні тотықсыздандырады?', 'Why does fructose, a ketose, also reduce Cu(OH)₂?'),
      options: [L('В щелочной среде она через ендиол изомеризуется в глюкозу и маннозу (Лобри де Брюйн — ван Экенштейн)', 'Сілтілі ортада ол ендиол арқылы глюкоза мен маннозаға изомерленеді (Лобри де Брюйн — ван Экенштейн)', 'In alkaline medium it isomerises through an enediol into glucose and mannose (Lobry de Bruyn–van Ekenstein)'), L('Кетогруппа окисляется легче альдегидной', 'Кето топ альдегид тобынан оңай тотығады', 'A keto group is oxidised more easily than an aldehyde group'), L('Фруктоза гидролизуется щёлочью до глюкозы и галактозы', 'Фруктоза сілтімен глюкоза мен галактозаға дейін гидролизденеді', 'Fructose is hydrolysed by alkali to glucose and galactose')],
      correct: 0, why: L('Раздел 3.2 методички: превращение Лобри де Брюйна — ван Экенштейна.', 'Әдістеменің 3.2-бөлімі: Лобри де Брюйн — ван Экенштейн айналуы.', 'Manual, section 3.2: the Lobry de Bruyn–van Ekenstein transformation.') },
  ],
};

export default {
  id: '2',
  title: L('Проба Троммера', 'Троммер сынамасы', 'Trommer’s test'),
  principle: L('На холоду Cu(OH)₂ растворяется полиольной структурой сахара (хелат — проба на вицинальные диолы); при нагревании восстанавливающие сахара восстанавливают Cu(II) до Cu(I).', 'Суықта Cu(OH)₂ қанттың полиол құрылымымен ериді (хелат — вициналь диолдарға сынама); қыздырғанда тотықсыздандырғыш қанттар Cu(II)-ні Cu(I)-ге дейін тотықсыздандырады.', 'In the cold Cu(OH)₂ is dissolved by the polyol structure of the sugar (chelate — a test for vicinal diols); on heating reducing sugars reduce Cu(II) to Cu(I).'),
  equation: ['CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄', L('сахар (полиол) + Cu(OH)₂ → ярко-синий хелат меди(II)', 'қант (полиол) + Cu(OH)₂ → мыс(II)-тің ашық көк хелаты', 'sugar (polyol) + Cu(OH)₂ → deep-blue copper(II) chelate'), 'CH₂OH–(CHOH)₄–CHO + 2Cu(OH)₂ → CH₂OH–(CHOH)₄–COOH + Cu₂O↓ + 2H₂O'],
  initialState: (a) => baseState(a),
  checkpoints: [0, 2],
  steps: [s0, s1, s2, s3, s4],
  results: (S) => ({ cells: S.res, cross: !!S.cross, crossSeen: !!S.crossSeen, excess: !!(S.b.trommer && S.b.trommer.tubes.some((t) => t.cu > 6)) }),
  summary: (r) => cellsSummary(r, 'trommerHot'),
};
