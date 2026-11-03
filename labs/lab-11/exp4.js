/** Опыт 4. Ксантопротеиновая реакция (ароматические остатки). Методичка, раздел 6, опыт 4. */
import { L, n } from '../../app/i18n.js';
import { xantho, heatGain } from './model.js';
import { hoodScene, benchBack } from './scene.js';
import { warmBath, eggInit, prepNote, cat, readyBtn } from './common.js';

const s0 = {
  type: 'decide', id: 'where',
  title: L('Где работать с концентрированной HNO₃', 'Концентрлі HNO₃-пен қай жерде жұмыс істеу керек', 'Where to work with concentrated HNO₃'),
  instr: L('<p>В опыте используются концентрированная азотная кислота (65–68 %) и 30 % NaOH — оба реактива сильно едкие, при нагревании HNO₃ выделяются бурые пары оксидов азота.</p>',
    '<p>Тәжірибеде концентрлі азот қышқылы (65–68 %) және 30 % NaOH қолданылады — екі реактив те қатты күйдіргіш, қыздырғанда HNO₃-тен азот оксидтерінің қоңыр булары бөлінеді.</p>',
    '<p>This experiment uses concentrated nitric acid (65–68 %) and 30 % NaOH — both are highly corrosive, and heated HNO₃ gives off brown fumes of nitrogen oxides.</p>'),
  need: L('Выберите место работы', 'Жұмыс орнын таңдаңыз', 'Choose where to work'),
  scene: (S, local) => hoodScene(S, { on: { hood: true } }),
  question: L('Где и как вы проведёте пробу?', 'Сынаманы қай жерде және қалай жүргізесіз?', 'Where and how will you do the test?'),
  options: [
    { id: 'hood', ok: true, label: L('В вытяжном шкафу, в очках и перчатках, отверстием пробирки от себя и соседей', 'Тартпа шкафта, көзілдірік пен қолғапта, пробирканың аузын өзіңізден және көршілерден аулақ ұстап', 'In the fume hood, with goggles and gloves, the tube mouth pointing away from yourself and others'),
      log: L('Работа с конц. HNO₃ — в вытяжном шкафу, в очках и перчатках', 'Конц. HNO₃-пен жұмыс — тартпа шкафта, көзілдірік пен қолғапта', 'Work with conc. HNO₃ — in the fume hood, with goggles and gloves') },
    { id: 'bench', ok: false, severity: 'safety', retry: true, label: L('На рабочем столе: кислоты всего несколько капель', 'Жұмыс үстелінде: қышқыл бар болғаны бірнеше тамшы', 'On the open bench: it is only a few drops of acid'),
      remark: L('попытка работать с конц. HNO₃ вне вытяжного шкафа (раздел 7 методички)', 'конц. HNO₃-пен тартпа шкафтан тыс жұмыс істеу әрекеті (әдістеменің 7-бөлімі)', 'tried to work with conc. HNO₃ outside the fume hood (manual, section 7)'),
      whatif: L('При нагревании HNO₃ с белком выделяются ядовитые бурые оксиды азота; на столе нет защитного экрана от брызг. Методичка требует вытяжной шкаф.', 'HNO₃-ті ақуызбен қыздырғанда улы қоңыр азот оксидтері бөлінеді; үстелде шашыраудан қорғайтын экран жоқ. Әдістеме тартпа шкафты талап етеді.', 'Heating HNO₃ with protein releases toxic brown nitrogen oxides, and the open bench has no sash against splashes. The manual requires a fume hood.') },
    { id: 'nogl', ok: false, severity: 'safety', retry: true, label: L('В вытяжном шкафу, но без перчаток — так удобнее держать пипетку', 'Тартпа шкафта, бірақ қолғапсыз — пипетканы ұстау ыңғайлы', 'In the fume hood but without gloves — the pipette is easier to hold'),
      remark: L('попытка работать с конц. HNO₃ без перчаток', 'конц. HNO₃-пен қолғапсыз жұмыс істеу әрекеті', 'tried to work with conc. HNO₃ without gloves'),
      whatif: L('Капля азотной кислоты на коже даёт химический ожог и жёлтое пятно — это та же ксантопротеиновая реакция белков кожи (примечание к опыту 4).', 'Терідегі азот қышқылының тамшысы химиялық күйік пен сары дақ қалдырады — бұл тері ақуыздарының сол ксантопротеин реакциясы (4-тәжірибеге ескерту).', 'A drop of nitric acid on the skin causes a chemical burn and a yellow stain — the same xanthoproteic reaction of skin proteins (note to exp. 4).') },
  ],
};

const upd = (t, S) => { const a = xantho(t, S.egg); t.color = a.color; t.ppt = a.ppt; t.pptColor = a.pptColor; t.key = a.key; t.pH = a.pH; };
const G = L('В выбранную пробирку', 'Таңдалған пробиркаға', 'Into the selected tube');

const s1 = {
  type: 'test', id: 'xan',
  title: L('Ксантопротеиновая проба', 'Ксантопротеин сынамасы', 'Xanthoproteic test'),
  instr: L('<ol><li>В вытяжном шкафу прибавьте <b>5–6 капель</b> конц. HNO₃ к 1 мл раствора белка (образуется белый осадок денатурированного белка) и к 1 мл раствора желатина в другой пробирке.</li><li>Осторожно нагрейте в водяной бане <b>1–2 минуты</b> и наблюдайте окраску.</li><li>Охладите пробирки и осторожно, по каплям, прибавляйте 30 % NaOH <b>до щелочной реакции</b>.</li></ol><p class="note">Щелочную реакцию проверяйте индикаторной бумагой.</p>',
    '<ol><li>Тартпа шкафта 1 мл ақуыз ерітіндісіне (денатурацияланған ақуыздың ақ тұнбасы түзіледі) және екінші пробиркадағы 1 мл желатин ерітіндісіне конц. HNO₃-тің <b>5–6 тамшысын</b> қосыңыз.</li><li>Су моншасында <b>1–2 минут</b> абайлап қыздырып, түсін бақылаңыз.</li><li>Пробиркаларды салқындатып, 30 % NaOH-ты абайлап, тамшылатып, <b>сілтілі реакцияға дейін</b> қосыңыз.</li></ol><p class="note">Сілтілі реакцияны индикатор қағазымен тексеріңіз.</p>',
    '<ol><li>In the fume hood add <b>5–6 drops</b> of conc. HNO₃ to 1 mL of egg white solution (a white precipitate of denatured protein forms) and to 1 mL of gelatin solution in another tube.</li><li>Heat carefully in a water bath for <b>1–2 minutes</b> and observe the colour.</li><li>Cool the tubes and carefully add 30 % NaOH dropwise <b>until alkaline</b>.</li></ol><p class="note">Check that the solution is alkaline with indicator paper.</p>'),
  need: L('Проведите пробу и запишите наблюдение', 'Сынаманы жүргізіп, бақылауды жазыңыз', 'Do the test and record the observation'),
  tubes: [{ id: 'e', label: L('1 · белок', '1 · ақуыз', '1 · egg white'), init: { sub: 'egg' } }, { id: 'gl', label: L('2 · желатин', '2 · желатин', '2 · gelatin'), init: { sub: 'gel' } }],
  indicator: true, reset: true,
  sceneBack: benchBack(['e', 'gl']),
  reagents: [
    { id: 'fill', target: 'all', group: L('Исследуемые растворы', 'Зерттелетін ерітінділер', 'Test solutions'), label: L('Налить по 1 мл (белок / желатин)', '1 мл-ден құю (ақуыз / желатин)', 'Pour 1 mL each (egg white / gelatin)'), advance: 30,
      disabled: (t) => t.v > 0,
      apply(t, S, ctx, id) {
        if (id === 'e') { warmBath(S, 30); ctx.log(cat(L('В пробирку 1 налит 1 мл раствора белка, в пробирку 2 — 1 мл 1 % желатина', '1-пробиркаға 1 мл ақуыз ерітіндісі, 2-пробиркаға 1 мл 1 % желатин құйылды', 'Tube 1: 1 mL of egg white solution; tube 2: 1 mL of 1 % gelatin'), prepNote(S.egg))); }
        if (t.v > 0) return;
        if (t.sub === 'egg') Object.assign(t, eggInit(S.egg, 1)); else t.v = 1;
        t.T = 22; upd(t, S);
      } },
    { id: 'hno3', group: G, label: L('HNO₃ конц.: +1 кап.', 'HNO₃ конц.: +1 тамшы', 'HNO₃ conc.: +1 drop'), advance: 5,
      apply(t, S, ctx) {
        warmBath(S, 5);
        if (!t.v) { ctx.feedback(L('Сначала налейте исследуемый раствор.', 'Алдымен зерттелетін ерітіндіні құйыңыз.', 'Pour the test solution first.'), 'warn'); return; }
        t.hno3 = (t.hno3 || 0) + 1; t.v += 0.05; upd(t, S);
        if (t.hno3 === 1 && t.sub === 'egg') ctx.log(L('От первых капель HNO₃ в растворе белка выпал белый осадок (денатурация)', 'HNO₃-тің алғашқы тамшыларынан ақуыз ерітіндісінде ақ тұнба түсті (денатурация)', 'The first drops of HNO₃ gave a white precipitate in the egg white solution (denaturation)'), 'obs');
        if (t.hno3 === 9) ctx.remark({ key: 'e4acid', severity: 'minor', text: L('избыток конц. HNO₃ (больше 5–6 капель)', 'конц. HNO₃ артық (5–6 тамшыдан көп)', 'excess conc. HNO₃ (more than 5–6 drops)') });
      } },
    { id: 'heat', group: G, label: L('Нагреть в бане 1 мин', 'Моншада 1 мин қыздыру', 'Heat in the bath for 1 min'), advance: 60,
      apply(t, S, ctx, id) {
        if (!t.hno3) { ctx.feedback(L('Сначала прибавьте азотную кислоту.', 'Алдымен азот қышқылын қосыңыз.', 'Add the nitric acid first.'), 'warn'); return; }
        const T = S.bath.T;
        t.ext = (t.ext || 0) + heatGain(60, T, 75); t.T = Math.max(t.T || 22, Math.min(T, 95)); t.hot = true; t.heated = (t.heated || 0) + 60;
        warmBath(S, 60); upd(t, S);
        const who = id === 'e' ? L('белка', 'ақуыздың', 'egg white') : L('желатина', 'желатиннің', 'gelatin');
        ctx.log(L(`Пробирка с раствором ${who.ru} нагрета в бане (${n(T, 0)} °C) 1 мин`, `${who.kk} ерітіндісі бар пробирка моншада (${n(T, 0)} °C) 1 мин қыздырылды`, `The ${who.en} tube heated in the bath (${n(T, 0)} °C) for 1 min`));
      } },
    { id: 'cool', group: G, label: L('Охладить под струёй воды', 'Су ағынымен салқындату', 'Cool under running water'), advance: 60,
      apply(t, S) { warmBath(S, 60); t.T = 22; t.hot = false; upd(t, S); } },
    ...[1, 3].map((k) => ({ id: 'oh' + k, group: L('NaOH 30 % — по каплям', 'NaOH 30 % — тамшылатып', 'NaOH 30 % — dropwise'), label: L(`NaOH 30 %: +${k} кап.`, `NaOH 30 %: +${k} тамшы`, `NaOH 30 %: +${k} ${k > 1 ? 'drops' : 'drop'}`), advance: 5 * k,
      apply(t, S, ctx) {
        warmBath(S, 5 * k);
        if (!t.v) { ctx.feedback(L('Сначала налейте исследуемый раствор.', 'Алдымен зерттелетін ерітіндіні құйыңыз.', 'Pour the test solution first.'), 'warn'); return; }
        if ((t.T || 22) > 50) ctx.remark({ key: 'e4hot', severity: 'safety', text: L('30 % NaOH прибавлен в горячую кислую смесь без охлаждения', '30 % NaOH салқындатылмаған ыстық қышқыл қоспаға қосылды', '30 % NaOH added to the hot acid mixture without cooling'),
          whatif: L('Нейтрализация концентрированной HNO₃ концентрированной щёлочью сильно экзотермична: горячая смесь вскипает и разбрызгивается. Поэтому пробирку сначала охлаждают.', 'Концентрлі HNO₃-ті концентрлі сілтімен бейтараптау қатты экзотермиялық: ыстық қоспа қайнап, шашырайды. Сондықтан пробирканы алдымен салқындатады.', 'Neutralising concentrated HNO₃ with concentrated alkali is strongly exothermic: the hot mixture boils up and spatters. That is why the tube is cooled first.') });
        t.oh = (t.oh || 0) + k; t.v += 0.05 * k; t.checked = false; upd(t, S);
      } })),
    readyBtn((tb) => {
      if (!tb.e.v || !tb.gl.v) return L('Налейте исследуемые растворы.', 'Зерттелетін ерітінділерді құйыңыз.', 'Pour the test solutions.');
      if ((tb.e.hno3 || 0) < 5 || (tb.gl.hno3 || 0) < 5) return L('Прибавьте в каждую пробирку 5–6 капель конц. HNO₃.', 'Әр пробиркаға 5–6 тамшы конц. HNO₃ қосыңыз.', 'Add 5–6 drops of conc. HNO₃ to each tube.');
      if (!tb.e.oh || !tb.gl.oh) return L('Прибавьте щёлочь в обе пробирки.', 'Екі пробиркаға да сілті қосыңыз.', 'Add alkali to both tubes.');
      return null;
    }),
  ],
  done: (tubes, S, local) => !!local.ready,
  observe: {
    question: L('Что наблюдается в пробирках с белком и желатином?', 'Ақуыз және желатин бар пробиркаларда не байқалады?', 'What do you observe in the egg white and gelatin tubes?'),
    options: [
      { id: 'ok', label: L('Белок: белый осадок желтеет при нагревании и становится оранжевым после щёлочи; желатин — лишь слабое бледно-жёлтое окрашивание', 'Ақуыз: ақ тұнба қыздырғанда сарғаяды, сілтіден кейін қызғылт сары болады; желатин — тек әлсіз бозғылт сары түс', 'Egg white: the white precipitate turns yellow on heating and orange after alkali; gelatin — only a weak pale-yellow colour'),
        log: (S, tb) => cat(L(`Белок: белый осадок и раствор при нагревании стали жёлтыми, после прибавления NaOH (pH ≈ ${Math.round(tb.e.pH)}) — оранжевыми. Желатин: лишь слабое бледно-жёлтое окрашивание`, `Ақуыз: ақ тұнба мен ерітінді қыздырғанда сарғайды, NaOH қосқаннан кейін (pH ≈ ${Math.round(tb.e.pH)}) — қызғылт сары болды. Желатин: тек әлсіз бозғылт сары түс`, `Egg white: the white precipitate and the solution turned yellow on heating and orange after NaOH (pH ≈ ${Math.round(tb.e.pH)}). Gelatin: only a weak pale-yellow colour`), prepNote(S.egg)) },
      { id: 'acid', label: L('Белок жёлтый, но после щёлочи цвет не изменился', 'Ақуыз сары, бірақ сілтіден кейін түсі өзгерген жоқ', 'Egg white yellow, but the colour did not change after alkali'),
        log: (S, tb) => L(`Белок — жёлтый осадок и раствор; оранжевой окраски нет: щёлочи мало, среда осталась кислой (pH ≈ ${Math.round(tb.e.pH)})`, `Ақуыз — сары тұнба мен ерітінді; қызғылт сары түс жоқ: сілті аз, орта қышқыл күйінде қалды (pH ≈ ${Math.round(tb.e.pH)})`, `Egg white — yellow precipitate and solution; no orange: too little alkali, the medium stayed acidic (pH ≈ ${Math.round(tb.e.pH)})`) },
      { id: 'weak', label: L('Белок — белый осадок, едва желтоватый; желатин бесцветен', 'Ақуыз — ақ тұнба, әрең сарғыш; желатин түссіз', 'Egg white — white precipitate, barely yellowish; gelatin colourless'),
        log: L('Белок — белый, едва желтоватый осадок; желатин бесцветен: без нагревания нитрование почти не прошло', 'Ақуыз — ақ, әрең сарғыш тұнба; желатин түссіз: қыздырусыз нитрлеу іс жүзінде жүрмеді', 'Egg white — white, barely yellowish precipitate; gelatin colourless: without heating nitration hardly took place') },
      { id: 'same', label: L('Белок и желатин окрасились одинаково ярко', 'Ақуыз бен желатин бірдей айқын боялды', 'Egg white and gelatin are coloured equally brightly') },
    ],
    correct: (S, tb) => (['white', 'colourless', 'paleYellow', 'paleOrange'].includes(tb.e.key) ? 'weak' : tb.e.pH < 9 ? 'acid' : 'ok'),
    why: (S, tb) => L('Конц. HNO₃ нитрует активированные кольца остатков тирозина и триптофана (жёлтые нитропроизводные); в щелочной среде образуются оранжевые соли. В желатине мало тирозина и нет триптофана.', 'Конц. HNO₃ тирозин мен триптофан қалдықтарының белсендірілген сақиналарын нитрлейді (сары нитро туындылар); сілтілі ортада қызғылт сары тұздар түзіледі. Желатинде тирозин аз, триптофан жоқ.', 'Conc. HNO₃ nitrates the activated rings of tyrosine and tryptophan residues (yellow nitro derivatives); in alkaline medium orange salts form. Gelatin contains little tyrosine and no tryptophan.'),
  },
  onDone(S, tb, ctx) {
    S.e4 = { egg: tb.e.key, gel: tb.gl.key, pHe: tb.e.pH, pHg: tb.gl.pH, hno3: tb.e.hno3 || 0, oh: tb.e.oh || 0, heated: (tb.e.heated || 0) > 0 };
    if (['white', 'colourless', 'paleYellow', 'paleOrange'].includes(tb.e.key)) ctx.remark({ key: 'e4cold', severity: 'major', text: L('ксантопротеиновая проба не нагрета — нитрование почти не прошло', 'ксантопротеин сынамасы қыздырылмады — нитрлеу іс жүзінде жүрмеді', 'the xanthoproteic test was not heated — nitration hardly took place') });
    else if (tb.e.pH < 9) ctx.remark({ key: 'e4alk', severity: 'major', text: L('щелочная среда не достигнута — переход жёлтой окраски в оранжевую не наблюдался', 'сілтілі орта алынбады — сары түстің қызғылт сарыға ауысуы байқалмады', 'the solution was never made alkaline — the yellow-to-orange change was not observed') });
  },
  hint1: L('Порядок: HNO₃ (5–6 капель) → нагреть 1–2 мин → охладить → NaOH по каплям до щелочной реакции (индикаторная бумага).', 'Рет: HNO₃ (5–6 тамшы) → 1–2 мин қыздыру → салқындату → индикатор қағазымен тексеріп, сілтілі реакцияға дейін NaOH тамшылату.', 'Order: HNO₃ (5–6 drops) → heat 1–2 min → cool → NaOH dropwise until alkaline (indicator paper).'),
  hint2: L('6 капель конц. HNO₃ — это около 4 ммоль кислоты; одна капля 30 % NaOH — около 0,5 ммоль. Значит, щёлочи нужно примерно 9–10 капель.', 'Конц. HNO₃-тің 6 тамшысы — шамамен 4 ммоль қышқыл; 30 % NaOH-тың бір тамшысы — шамамен 0,5 ммоль. Демек, сілті шамамен 9–10 тамшы қажет.', '6 drops of conc. HNO₃ are about 4 mmol of acid; one drop of 30 % NaOH is about 0.5 mmol. So roughly 9–10 drops of alkali are needed.'),
  hint3: L('Каждая пробирка: 6 капель HNO₃ → «нагреть 1 мин» → «охладить» → NaOH 3 + 3 + 3 + 1 капля → проверить бумагой (pH ≥ 9) → записать наблюдение.', 'Әр пробирка: 6 тамшы HNO₃ → «1 мин қыздыру» → «салқындату» → NaOH 3 + 3 + 3 + 1 тамшы → қағазбен тексеру (pH ≥ 9) → бақылауды жазу.', 'Each tube: 6 drops HNO₃ → “heat 1 min” → “cool” → NaOH 3 + 3 + 3 + 1 drops → check with paper (pH ≥ 9) → record the observation.'),
};

const s2 = {
  type: 'quiz', id: 'q4',
  title: L('Ксантопротеиновая реакция: вопросы', 'Ксантопротеин реакциясы: сұрақтар', 'Xanthoproteic reaction: questions'),
  instr: L('<p>Объясните наблюдение.</p>', '<p>Бақылауды түсіндіріңіз.</p>', '<p>Explain the observation.</p>'),
  need: L('Ответьте на вопросы', 'Сұрақтарға жауап беріңіз', 'Answer the questions'),
  questions: [
    { q: L('Остатки каких аминокислот дают ксантопротеиновую реакцию?', 'Қай аминқышқылдарының қалдықтары ксантопротеин реакциясын береді?', 'Residues of which amino acids give the xanthoproteic reaction?'),
      options: [L('Тирозина и триптофана (активированные ароматические кольца)', 'Тирозин мен триптофанның (белсендірілген ароматты сақиналар)', 'Tyrosine and tryptophan (activated aromatic rings)'), L('Цистеина и цистина', 'Цистеин мен цистиннің', 'Cysteine and cystine'), L('Глицина и аланина', 'Глицин мен аланиннің', 'Glycine and alanine'), L('Аргинина', 'Аргининнің', 'Arginine')],
      correct: 0, why: L('Раздел 3.2 и принцип опыта 4.', '3.2-бөлім және 4-тәжірибе принципі.', 'Section 3.2 and the principle of exp. 4.') },
    { q: L('Почему желатин даёт слабую ксантопротеиновую реакцию?', 'Неліктен желатин әлсіз ксантопротеин реакциясын береді?', 'Why does gelatin give a weak xanthoproteic reaction?'),
      options: [L('В желатине мало тирозина и нет триптофана', 'Желатинде тирозин аз, триптофан жоқ', 'Gelatin contains little tyrosine and no tryptophan'), L('Желатин не денатурирует', 'Желатин денатурацияланбайды', 'Gelatin does not denature'), L('В желатине нет пептидных связей', 'Желатинде пептидтік байланыс жоқ', 'Gelatin has no peptide bonds'), L('Желатин разрушается азотной кислотой полностью', 'Желатин азот қышқылымен толық ыдырайды', 'Gelatin is completely destroyed by nitric acid')],
      correct: 0, why: L('Методичка, результат опыта 4.', 'Әдістеме, 4-тәжірибенің нәтижесі.', 'Manual, result of exp. 4.') },
    { q: L('Почему после прибавления щёлочи жёлтая окраска переходит в оранжевую?', 'Неліктен сілті қосқаннан кейін сары түс қызғылт сарыға ауысады?', 'Why does the yellow turn orange when alkali is added?'),
      options: [L('Нитрофенольные группы нитротирозина превращаются в окрашенные феноляты (соли)', 'Нитротирозиннің нитрофенол топтары боялған фенолаттарға (тұздарға) айналады', 'The nitrophenol groups of nitrotyrosine become coloured phenolates (salts)'), L('Щёлочь окисляет белок', 'Сілті ақуызды тотықтырады', 'The alkali oxidises the protein'), L('Образуется сульфид свинца', 'Қорғасын сульфиді түзіледі', 'Lead sulfide forms'), L('Выпадает гидроксид меди', 'Мыс гидроксиді тұнбаға түседі', 'Copper hydroxide precipitates')],
      correct: 0, why: L('остаток тирозина + HNO₃ → 3-нитротирозин (жёлтый); в NaOH → оранжевый фенолят.', 'тирозин қалдығы + HNO₃ → 3-нитротирозин (сары); NaOH-та → қызғылт сары фенолят.', 'tyrosine residue + HNO₃ → 3-nitrotyrosine (yellow); in NaOH → orange phenolate.') },
  ],
};

export default {
  id: '4',
  title: L('Ксантопротеиновая реакция (ароматические остатки)', 'Ксантопротеин реакциясы (ароматты қалдықтар)', 'Xanthoproteic reaction (aromatic amino acid residues)'),
  principle: L('Концентрированная азотная кислота нитрует активированные ароматические кольца остатков тирозина и триптофана с образованием жёлтых нитропроизводных; в щелочной среде они превращаются в оранжевые соли.', 'Концентрлі азот қышқылы тирозин мен триптофан қалдықтарының белсендірілген ароматты сақиналарын нитрлеп, сары нитро туындылар түзеді; сілтілі ортада олар қызғылт сары тұздарға айналады.', 'Concentrated nitric acid nitrates the activated aromatic rings of tyrosine and tryptophan residues, forming yellow nitro derivatives; in alkaline medium they are converted into orange salts.'),
  equation: [L('остаток тирозина + HNO₃ → остаток 3-нитротирозина (жёлтый) + H₂O; в NaOH → оранжевый фенолят', 'тирозин қалдығы + HNO₃ → 3-нитротирозин қалдығы (сары) + H₂O; NaOH-та → қызғылт сары фенолят', 'tyrosine residue + HNO₃ → 3-nitrotyrosine residue (yellow) + H₂O; in NaOH → orange phenolate')],
  initialState: ({ prev }) => ({ egg: (prev['1'] || {}).egg || 'ok', bath: { T: 100, on: true }, e4: null }),
  checkpoints: [0, 1],
  steps: [s0, s1, s2],
  results: (S) => ({ ...(S.e4 || {}), eggPrep: S.egg }),
  summary: (r) => [
    { label: L('Белок', 'Ақуыз', 'Egg white'), value: r.egg === 'orange' ? L('жёлтый → оранжевый', 'сары → қызғылт сары', 'yellow → orange') : r.egg === 'yellow' ? L('жёлтый', 'сары', 'yellow') : L('слабо', 'әлсіз', 'weak'), st: r.egg === 'orange' ? 'ok' : 'warn' },
    { label: 'pH', value: r.pHe != null ? String(Math.round(r.pHe)) : '—', st: r.pHe >= 9 ? 'ok' : 'warn' },
  ],
};
