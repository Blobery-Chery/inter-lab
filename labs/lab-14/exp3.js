/** Опыт 3. Восстановительное расщепление азогруппы. Методичка, раздел 6, опыт 3. */
import { L, n } from '../../app/i18n.js';
import { acidFraction, moColor, reduceRate } from './model.js';
import { hoodScene, tubeBath } from './scene.js';

/* ------------------------------------------------------------------ 1. где нагревать */
const FLASH = {
  ru: 'Цинк с кислотой выделяет водород, а его смесь с воздухом над пробиркой воспламеняется от пламени спиртовки: хлопок, вспышка, выброс горячей кислоты из пробирки. В реальной лаборатории это ожоги лица и рук кислотой. Поражённое место промывают проточной водой не менее 15 минут (пп. 6.3, 12.1), о происшествии сообщают преподавателю (п. 12.6). Правило из раздела 7 методички: рядом с цинком и кислотой — никакого открытого огня; нагревают только на водяной бане в вытяжном шкафу. Пробу ставят заново.',
  kk: 'Мырыш қышқылмен сутек бөледі, ал оның пробирка үстіндегі ауамен қоспасы спиртшам жалынынан тұтанады: шарт ету, жарқ ету, ыстық қышқылдың пробиркадан атылып шығуы. Нақты зертханада бұл бет пен қолдың қышқылдан күйуі. Зақымданған жерді кемінде 15 минут ағын сумен жуады (6.3, 12.1-тармақтар), оқиға туралы оқытушыға хабарлайды (12.6-тармақ). Әдістеменің 7-бөліміндегі ереже: мырыш пен қышқылдың жанында — ешқандай ашық от болмайды; тек тартпа шкафтағы су моншасында қыздырады. Сынама қайтадан қойылады.',
  en: 'Zinc and acid give off hydrogen, and its mixture with air above the tube is ignited by the spirit-lamp flame: a pop, a flash and hot acid thrown out of the tube. In a real lab that means acid burns to the face and hands. The affected skin is rinsed under running water for at least 15 minutes (rules 6.3, 12.1) and the instructor is told (rule 12.6). The rule from section 7 of the manual: no open flames near zinc and acid; warm only in a water bath in the fume hood. The test is set up again.',
};

const r0 = {
  type: 'decide', id: 'where',
  title: L('Где и как нагревать', 'Қай жерде және қалай қыздыру керек', 'Where and how to warm the tube'),
  instr: L('<p>Цинковая пыль с кислотой выделяет горючий водород, концентрированная HCl дымит. Выберите, где и как вы будете нагревать пробирку.</p>', '<p>Мырыш ұнтағы қышқылмен жанғыш сутек бөледі, концентрлі HCl түтіндейді. Пробирканы қай жерде және қалай қыздыратыныңызды таңдаңыз.</p>', '<p>Zinc dust with acid gives off flammable hydrogen, and concentrated HCl fumes. Choose where and how you will warm the tube.</p>'),
  need: L('Выберите условия', 'Жағдайды таңдаңыз', 'Choose the conditions'),
  question: L('Как провести восстановление?', 'Тотықсыздандыруды қалай жүргізесіз?', 'How will you carry out the reduction?'),
  options: [
    { id: 'ok', ok: true, label: L('На водяной бане в вытяжном шкафу, открытого огня рядом нет', 'Тартпа шкафтағы су моншасында, жанында ашық от жоқ', 'In a water bath in the fume hood, with no open flames nearby'), log: L('Водяная баня (≈ 60 °C) подготовлена в вытяжном шкафу; горелок и спиртовок рядом нет', 'Су моншасы (≈ 60 °C) тартпа шкафта дайындалды; жанында жанарғы мен спиртшам жоқ', 'Water bath (≈ 60 °C) set up in the fume hood; no burners or spirit lamps nearby'),
      why: L('водород горюч, HCl дымит (раздел 7 методички)', 'сутек жанғыш, HCl түтіндейді (әдістеменің 7-бөлімі)', 'hydrogen is flammable and HCl fumes (manual, section 7)') },
    { id: 'flame', ok: false, label: L('Над пламенем спиртовки — так быстрее', 'Спиртшам жалынының үстінде — тезірек', 'Over a spirit-lamp flame — it is quicker'),
      remark: L('пробирку с цинком и кислотой нагревали на открытом пламени — водород вспыхнул', 'мырыш пен қышқылы бар пробирка ашық жалында қыздырылды — сутек тұтанды', 'the tube with zinc and acid was heated over an open flame — the hydrogen ignited'),
      critical: { text: FLASH } },
    { id: 'bench', ok: false, severity: 'safety', retry: true, label: L('На столе вне шкафа — водород не ядовит', 'Шкафтан тыс үстелде — сутек улы емес', 'On the bench outside the hood — hydrogen is not poisonous'),
      remark: L('проба с конц. HCl и цинком на столе вне вытяжного шкафа (пп. 4.4, 6.1 правил ТБ)', 'конц. HCl мен мырышпен сынама тартпа шкафтан тыс үстелде (ҚТ ережелерінің 4.4, 6.1-тармақтары)', 'the test with conc. HCl and zinc done on the bench outside the hood (safety rules 4.4, 6.1)'),
      whatif: L('Конц. HCl дымит, а с пузырьками водорода из пробирки уносятся брызги кислоты. Методичка требует вытяжной шкаф.', 'Конц. HCl түтіндейді, ал сутек көпіршіктерімен пробиркадан қышқыл шашырандылары ұшады. Әдістеме тартпа шкафты талап етеді.', 'Conc. HCl fumes, and the hydrogen bubbles carry acid spray out of the tube. The manual requires a fume hood.') },
    { id: 'stop', ok: false, severity: 'safety', retry: true, label: L('Закрыть пробирку пробкой, чтобы не выходили пары', 'Булар шықпауы үшін пробирканы тығынмен жабу', 'Stopper the tube so that no fumes escape'),
      remark: L('нагревание закрытой пробирки с выделением газа (п. 7.4 правил ТБ)', 'газ бөлінетін жабық пробирканы қыздыру (ҚТ ережелерінің 7.4-тармағы)', 'heating a stoppered tube that gives off gas (safety rule 7.4)'),
      whatif: L('Водород и нагревание создают давление: пробку выбивает вместе с горячей кислотой. Закрытую систему, где выделяется газ, не нагревают.', 'Сутек пен қыздыру қысым тудырады: тығын ыстық қышқылмен бірге атылып шығады. Газ бөлінетін жабық жүйені қыздырмайды.', 'Hydrogen and heat build up pressure: the stopper is blown out together with hot acid. A closed system that gives off gas is never heated.') },
  ],
  scene: hoodScene,
};

/* ------------------------------------------------------------------ 2. восстановление */
function recolor(t, S) {
  if (!t.mo) return;
  const f = t.acid ? 1 : acidFraction(S.pH0);
  t.color = moColor(f, 0.75 * Math.max(0, t.left ?? 1));
}
function react(t, S, ctx, local, sec, T) {
  const rate = reduceRate(Math.min(t.zn || 0, 3), T, !!t.acid, S.load);
  if (!t.zn || !t.acid || !t.mo) {
    if (t.zn && !t.acid) ctx.feedback(L('Без кислоты цинк не выделяет водород — окраска не меняется.', 'Қышқылсыз мырыш сутек бөлмейді — түс өзгермейді.', 'Without acid the zinc gives off no hydrogen — the colour does not change.'), 'warn');
    return;
  }
  const before = t.left ?? 1;
  t.left = before * Math.exp(-rate * sec);
  t.min = (t.min || 0) + sec / 60;
  t.gas = true;
  recolor(t, S);
  if (before > 0.5 && t.left <= 0.5) ctx.log(L(`Через ${n(t.min, 0)} мин красная окраска заметно побледнела (бледно-розовый раствор)`, `${n(t.min, 0)} минуттан кейін қызыл түс айтарлықтай бозарды (ақшыл қызғылт ерітінді)`, `After ${n(t.min, 0)} min the red colour has faded markedly (pale pink solution)`), 'obs');
  if (before > 0.04 && t.left <= 0.04) ctx.log(L(`Через ${n(t.min, 0)} мин раствор обесцветился; продолжается выделение пузырьков водорода`, `${n(t.min, 0)} минуттан кейін ерітінді түссізденді; сутек көпіршіктерінің бөлінуі жалғасуда`, `After ${n(t.min, 0)} min the solution has become colourless; hydrogen bubbles are still being given off`), 'obs');
}

const r1 = {
  type: 'test', id: 'reduce',
  title: L('Восстановление цинком в кислой среде', 'Қышқыл ортада мырышпен тотықсыздандыру', 'Reduction with zinc in acid'),
  instr: L('<ol><li>К <b>2 мл</b> раствора метилового оранжевого прилейте <b>1 мл конц. HCl</b> (красная окраска) и внесите <b>на кончике шпателя</b> цинковую пыль.</li><li>Осторожно нагрейте пробирку на водяной бане в вытяжном шкафу (выделяется водород) и наблюдайте.</li></ol>',
    '<ol><li><b>2 мл</b> метилоранж ерітіндісіне <b>1 мл конц. HCl</b> құйып (қызыл түс), <b>шпательдің ұшымен</b> мырыш ұнтағын салыңыз.</li><li>Пробирканы тартпа шкафтағы су моншасында абайлап қыздырып (сутек бөлінеді), бақылаңыз.</li></ol>',
    '<ol><li>To <b>2 mL</b> of methyl orange solution add <b>1 mL of conc. HCl</b> (red colour) and <b>a small spatula-tip</b> of zinc dust.</li><li>Warm the tube gently in a water bath in the fume hood (hydrogen is evolved) and observe.</li></ol>'),
  need: L('Добейтесь обесцвечивания раствора', 'Ерітіндінің түссізденуіне қол жеткізіңіз', 'Get the solution to decolourise'),
  tubes: [{ id: 'p', label: L('пробирка', 'пробирка', 'test tube') }],
  reset: true,
  reagents: [
    { id: 'mo', group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('Раствор метилового оранжевого, 2 мл', 'Метилоранж ерітіндісі, 2 мл', 'Methyl orange solution, 2 mL'), advance: 20, disabled: (t) => t.mo,
      apply(t, S, ctx) { t.mo = true; t.v += 2; t.left = 1; recolor(t, S); ctx.log(L('В пробирку налито 2 мл раствора метилового оранжевого (оранжево-жёлтый)', 'Пробиркаға 2 мл метилоранж ерітіндісі құйылды (қызғылт сары-сары)', '2 mL of methyl orange solution put into the tube (orange-yellow)')); } },
    { id: 'hcl', group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('Конц. HCl, 1 мл', 'Конц. HCl, 1 мл', 'Conc. HCl, 1 mL'), advance: 20, disabled: (t) => t.acid,
      apply(t, S, ctx) { t.acid = true; t.v += 1; recolor(t, S); if (t.zn) t.gas = true; ctx.log(t.mo ? L('Прилит 1 мл конц. HCl: раствор стал красным', '1 мл конц. HCl құйылды: ерітінді қызыл болды', '1 mL of conc. HCl added: the solution turned red') : L('Прилит 1 мл конц. HCl', '1 мл конц. HCl құйылды', '1 mL of conc. HCl added'), 'obs'); } },
    { id: 'zn', group: L('Цинковая пыль', 'Мырыш ұнтағы', 'Zinc dust'), label: L('На кончике шпателя', 'Шпательдің ұшымен', 'A spatula-tip'), advance: 15,
      apply(t, S, ctx) { t.zn = (t.zn || 0) + 1; t.solid = Math.min(0.8, (t.solid || 0) + 0.3); t.solidColor = 'var(--metal)'; if (t.acid) t.gas = true; ctx.log(L('Внесена цинковая пыль на кончике шпателя', 'Шпательдің ұшымен мырыш ұнтағы салынды', 'A spatula-tip of zinc dust added')); } },
    { id: 'znx', group: L('Цинковая пыль', 'Мырыш ұнтағы', 'Zinc dust'), label: L('Полный шпатель', 'Толық шпатель', 'A full spatula'), advance: 15,
      apply(t, S, ctx) {
        t.zn = (t.zn || 0) + 5; t.solid = 0.9; t.solidColor = 'var(--metal)';
        if (t.acid) { t.gas = true; t.v = Math.max(1, t.v - 0.6); ctx.remark({ key: 'e3-zn', severity: 'minor', text: L('слишком много цинковой пыли — бурное выделение водорода, смесь вспенилась и выплеснулась', 'мырыш ұнтағы тым көп — сутек қатты бөлініп, қоспа көпіршіп, шашырады', 'far too much zinc dust — violent evolution of hydrogen; the mixture foamed and splashed out') }); ctx.log(L('Бурное вспенивание, часть смеси выплеснулась из пробирки', 'Қатты көпіршу, қоспаның бір бөлігі пробиркадан шашырады', 'Violent foaming; some of the mixture splashed out of the tube'), 'obs'); }
      } },
    { id: 'warm', group: L('Нагревание', 'Қыздыру', 'Warming'), label: L('Водяная баня ≈ 60 °C, 1 мин', 'Су моншасы ≈ 60 °C, 1 мин', 'Water bath ≈ 60 °C, 1 min'), advance: 60,
      apply(t, S, ctx, id, local) { local.hot = true; local.T = 60; react(t, S, ctx, local, 60, 60); } },
    { id: 'wait', group: L('Нагревание', 'Қыздыру', 'Warming'), label: L('Подождать 1 мин без нагревания', 'Қыздырмай 1 мин күту', 'Wait 1 min without warming'), advance: 60,
      apply(t, S, ctx, id, local) { local.hot = false; local.T = 22; react(t, S, ctx, local, 60, 22); } },
  ],
  done: (T) => !!(T.p.mo && T.p.acid && T.p.zn && (T.p.left ?? 1) <= 0.04),
  observe: {
    question: L('Что вы наблюдаете?', 'Не байқайсыз?', 'What do you observe?'),
    options: [
      { id: 'ok', label: L('Красная окраска постепенно бледнеет, раствор обесцвечивается; выделяются пузырьки газа (H₂)', 'Қызыл түс бірте-бірте бозарып, ерітінді түссізденеді; газ (H₂) көпіршіктері бөлінеді', 'The red colour gradually fades and the solution becomes colourless; gas bubbles (H₂) are given off'), log: (S, T) => L(`Красная окраска постепенно бледнеет и за ≈ ${n(T.p.min || 0, 0)} мин исчезает — раствор бесцветный; выделяется водород`, `Қызыл түс бірте-бірте бозарып, ≈ ${n(T.p.min || 0, 0)} минутта жоғалады — ерітінді түссіз; сутек бөлінеді`, `The red colour gradually fades and disappears in ≈ ${n(T.p.min || 0, 0)} min — the solution is colourless; hydrogen is evolved`) },
      { id: 'yellow', label: L('Раствор становится жёлтым — среда стала щелочной', 'Ерітінді сары болады — орта сілтілі болды', 'The solution turns yellow — the medium has become alkaline') },
      { id: 'ppt', label: L('Выпадает оранжевый осадок красителя', 'Бояғыштың қызғылт сары тұнбасы түзіледі', 'An orange precipitate of the dye forms') },
      { id: 'none', label: L('Изменений нет', 'Өзгеріс жоқ', 'No change') },
    ],
    correct: () => 'ok',
    why: () => L('Водород в момент выделения восстанавливает связь –N=N–: хромофор разрушен, образуются бесцветные сульфаниловая кислота и N,N-диметил-п-фенилендиамин.', 'Бөліну сәтіндегі сутек –N=N– байланысын тотықсыздандырады: хромофор бұзылады, түссіз сульфанил қышқылы мен N,N-диметил-п-фенилендиамин түзіледі.', 'Nascent hydrogen reduces the –N=N– bond: the chromophore is destroyed and colourless sulfanilic acid and N,N-dimethyl-p-phenylenediamine are formed.'),
  },
  onDone(S, T) { S.red = { min: T.p.min || 0 }; },
  scene: (S, local) => tubeBath((local.tubes || {}).p || {}, { hot: local.hot, T: local.T }),
  hint1: L('Нужны три вещи: краситель, сильная кислота и цинк; восстановление ускоряет нагревание на водяной бане.', 'Үш нәрсе қажет: бояғыш, күшті қышқыл және мырыш; су моншасында қыздыру тотықсыздануды тездетеді.', 'You need three things: the dye, a strong acid and zinc; warming in a water bath speeds up the reduction.'),
  hint2: L('Цинка — только на кончике шпателя: избыток даёт бурное вспенивание. Без HCl водород не выделяется.', 'Мырыш — тек шпательдің ұшымен: артығы қатты көпіршуге әкеледі. HCl-сыз сутек бөлінбейді.', 'Zinc — only a spatula-tip: too much makes it foam violently. Without HCl no hydrogen is given off.'),
  hint3: L('«Раствор МО, 2 мл» → «Конц. HCl, 1 мл» → «На кончике шпателя» → «Водяная баня, 1 мин» несколько раз до обесцвечивания.', '«МО ерітіндісі, 2 мл» → «Конц. HCl, 1 мл» → «Шпательдің ұшымен» → түссізденгенше бірнеше рет «Су моншасы, 1 мин».', '“Methyl orange solution, 2 mL” → “Conc. HCl, 1 mL” → “A spatula-tip” → “Water bath, 1 min” several times until colourless.'),
};

/* ------------------------------------------------------------------ 3. вопросы */
const r2 = {
  type: 'quiz', id: 'q-red',
  title: L('Вопросы по восстановлению азокрасителей', 'Азобояғыштарды тотықсыздандыру бойынша сұрақтар', 'Questions on the reduction of azo dyes'),
  instr: L('<p>Ответьте на вопросы. Каждая ошибка записывается в журнал.</p>', '<p>Сұрақтарға жауап беріңіз. Әр қате журналға жазылады.</p>', '<p>Answer the questions. Every wrong answer is recorded in the notebook.</p>'),
  need: L('Ответьте на все вопросы', 'Барлық сұраққа жауап беріңіз', 'Answer all the questions'),
  questions: [
    { q: L('Какие продукты образуются при восстановлении метилового оранжевого?', 'Метилоранжды тотықсыздандырғанда қандай өнімдер түзіледі?', 'Which products are formed when methyl orange is reduced?'),
      options: [L('Сульфаниловая кислота (её соль) и N,N-диметил-п-фенилендиамин', 'Сульфанил қышқылы (оның тұзы) және N,N-диметил-п-фенилендиамин', 'Sulfanilic acid (its salt) and N,N-dimethyl-p-phenylenediamine'), L('Бензол и азот', 'Бензол және азот', 'Benzene and nitrogen'), L('Гидразосоединение, устойчивое к дальнейшему восстановлению', 'Әрі қарай тотықсыздануға төзімді гидразоқосылыс', 'A hydrazo compound that resists further reduction'), L('Фенол и диметиланилин', 'Фенол және диметиланилин', 'Phenol and dimethylaniline')],
      correct: 0, why: L('NaO₃S–C₆H₄–N=N–C₆H₄–N(CH₃)₂ + 4[H] → NaO₃S–C₆H₄–NH₂ + H₂N–C₆H₄–N(CH₃)₂', 'NaO₃S–C₆H₄–N=N–C₆H₄–N(CH₃)₂ + 4[H] → NaO₃S–C₆H₄–NH₂ + H₂N–C₆H₄–N(CH₃)₂', 'NaO₃S–C₆H₄–N=N–C₆H₄–N(CH₃)₂ + 4[H] → NaO₃S–C₆H₄–NH₂ + H₂N–C₆H₄–N(CH₃)₂') },
    { q: L('Почему пронтозил неактивен in vitro, но активен in vivo?', 'Пронтозил неліктен in vitro белсенді емес, ал in vivo белсенді?', 'Why is prontosil inactive in vitro but active in vivo?'),
      options: [L('В организме азоредуктазы восстанавливают его азосвязь до активного сульфаниламида', 'Ағзада азоредуктазалар оның азобайланысын белсенді сульфаниламидке дейін тотықсыздандырады', 'In the body azoreductases reduce its azo bond to the active sulfanilamide'), L('Он растворяется только в крови', 'Ол тек қанда ериді', 'It dissolves only in blood'), L('In vitro он разлагается на свету', 'In vitro ол жарықта ыдырайды', 'In vitro it decomposes in light'), L('Он окисляется в печени до азокрасителя', 'Ол бауырда азобояғышқа дейін тотығады', 'It is oxidised in the liver to an azo dye')],
      correct: 0, why: L('Восстановительное расщепление азосвязи — путь метаболизма азопрепаратов (практическое значение опыта 3).', 'Азобайланыстың тотықсыздана ыдырауы — азопрепараттардың метаболизм жолы (3-тәжірибенің практикалық маңызы).', 'Reductive cleavage of the azo bond is a metabolic pathway of azo drugs (practical significance of experiment 3).') },
    { q: L('Как в фармакопейном анализе обнаруживают первичную ароматическую аминогруппу (сульфаниламиды, новокаин)?', 'Фармакопеялық талдауда біріншілік ароматты аминотопты (сульфаниламидтер, новокаин) қалай анықтайды?', 'How is a primary aromatic amino group (sulfonamides, procaine) detected in pharmacopoeial analysis?'),
      options: [L('Диазотированием и сочетанием с 2-нафтолом — образуется интенсивно окрашенный азокраситель', 'Диазоттау және 2-нафтолмен қосу — қарқынды боялған азобояғыш түзіледі', 'By diazotization and coupling with 2-naphthol — an intensely coloured azo dye forms'), L('Пробой с FeCl₃ — фиолетовое окрашивание', 'FeCl₃ сынамасы — күлгін түс', 'With FeCl₃ — a violet colour'), L('Реакцией серебряного зеркала', 'Күміс айна реакциясымен', 'By the silver mirror test'), L('По выделению CO₂ с NaHCO₃', 'NaHCO₃-пен CO₂ бөлінуі бойынша', 'By the release of CO₂ with NaHCO₃')],
      correct: 0, why: L('Раздел 1 методички: диазотирование + сочетание с 2-нафтолом — идентификация препаратов с первичной ароматической аминогруппой.', 'Әдістеменің 1-бөлімі: диазоттау + 2-нафтолмен қосу — біріншілік ароматты аминотобы бар препараттарды сәйкестендіру.', 'Manual, section 1: diazotization + coupling with 2-naphthol identifies drugs with a primary aromatic amino group.') },
  ],
};

/* ------------------------------------------------------------------ 4. уборка */
const r3 = {
  type: 'cleanup', id: 'clean',
  title: L('Уборка рабочего места', 'Жұмыс орнын жинау', 'Cleaning up'),
  instr: L('<p>Соберите отходы в нужные ёмкости, выключите приборы, закройте склянки и вымойте руки (разделы 10 и 14.3 правил ТБ, раздел 7 методички).</p><p class="note">Все остатки — в обозначенные ёмкости; в раковину ничего не выливают.</p>',
    '<p>Қалдықтарды тиісті ыдыстарға жинаңыз, құралдарды өшіріңіз, склянкаларды жабыңыз және қолыңызды жуыңыз (ҚТ ережелерінің 10 және 14.3-бөлімдері, әдістеменің 7-бөлімі).</p><p class="note">Барлық қалдықтар — белгіленген ыдыстарға; раковинаға ештеңе төгілмейді.</p>',
    '<p>Put the waste into the right containers, switch off the instruments, close the bottles and wash your hands (safety rules sections 10 and 14.3; manual, section 7).</p><p class="note">All residues go into the designated containers; nothing goes down the sink.</p>'),
  need: L('Уберите рабочее место', 'Жұмыс орнын жинаңыз', 'Clean up the bench'),
  bins: ['acid', 'organic', 'solid', 'glass', 'sink', 'trash'],
  items: [
    { id: 'mother', bin: 'acid', label: L('Фильтрат после выделения метилового оранжевого', 'Метилоранжды бөліп алғаннан кейінгі фильтрат', 'Filtrate from isolating the methyl orange'),
      wrong: { sink: { severity: 'safety', text: L('фильтрат с красителем и остатками диметиланилина вылит в раковину (п. 10.2 правил ТБ)', 'бояғышы және диметиланилин қалдықтары бар фильтрат раковинаға төгілді (ҚТ ережелерінің 10.2-тармағы)', 'filtrate containing dye and traces of dimethylaniline poured down the sink (safety rule 10.2)'),
        whatif: L('В фильтрате — краситель, следы токсичного ароматического амина и щёлочь: это водные отходы для отдельной ёмкости, их нейтрализуют перед утилизацией (п. 10.3).', 'Фильтратта — бояғыш, улы ароматты амин іздері және сілті: бұл бөлек ыдысқа арналған сулы қалдықтар, оларды кәдеге жаратар алдында бейтараптайды (10.3-тармақ).', 'The filtrate holds dye, traces of a toxic aromatic amine and alkali: it is aqueous waste for its own container and is neutralised before disposal (rule 10.3).') } } },
    { id: 'dma', bin: 'organic', label: L('Остатки N,N-диметиланилина, промывка пипетки', 'N,N-диметиланилин қалдықтары, пипетканы шаю', 'Leftover N,N-dimethylaniline, pipette rinsings'),
      wrong: { sink: { severity: 'safety', text: L('ароматический амин вылит в раковину (пп. 4.6, 10.2 правил ТБ)', 'ароматты амин раковинаға төгілді (ҚТ ережелерінің 4.6, 10.2-тармақтары)', 'an aromatic amine poured down the sink (safety rules 4.6, 10.2)') } } },
    { id: 'tubes', bin: 'acid', label: L('Содержимое пробирок с индикатором (HCl, вода, NaOH)', 'Индикаторы бар пробиркалардың ішіндегісі (HCl, су, NaOH)', 'Contents of the indicator tubes (HCl, water, NaOH)') },
    { id: 'zn', bin: 'acid', label: L('Пробирка с цинком и кислотой (после окончания реакции)', 'Мырышы мен қышқылы бар пробирка (реакция аяқталғаннан кейін)', 'The tube with zinc and acid (once the reaction has stopped)'),
      wrong: { trash: { severity: 'safety', text: L('цинковая пыль с кислотой выброшена в мусор — продолжает выделяться водород', 'қышқылды мырыш ұнтағы қоқысқа тасталды — сутек бөлінуі жалғасады', 'zinc dust with acid thrown into the rubbish bin — it keeps giving off hydrogen') } } },
    { id: 'paper', bin: 'solid', label: L('Фильтры, индикаторная и иодкрахмальная бумага', 'Сүзгілер, индикатор және иодкрахмал қағазы', 'Filter papers, indicator and starch–iodide paper') },
  ],
  switches: [
    { id: 'hot', label: L('Выключить плитку и водяную баню', 'Плита мен су моншасын өшіру', 'Switch off the hot plate and the water bath') },
    { id: 'pump', label: L('Закрыть воду водоструйного насоса', 'Су ағынды сорғының суын жабу', 'Turn off the water to the aspirator') },
    { id: 'bottles', label: L('Закрыть склянки, вернуть на место', 'Склянкаларды жауып, орнына қою', 'Close the bottles and put them back') },
    { id: 'hands', label: L('Вымыть руки', 'Қолды жуу', 'Wash your hands'), log: L('Руки вымыты с мылом (диметиланилин всасывается через кожу, метиловый оранжевый окрашивает кожу)', 'Қол сабынмен жуылды (диметиланилин тері арқылы сіңеді, метилоранж теріні бояйды)', 'Hands washed with soap (dimethylaniline is absorbed through the skin and methyl orange stains it)') },
  ],
};

export default {
  id: '3',
  title: L('Восстановительное расщепление азогруппы', 'Азотоптың тотықсыздана ыдырауы', 'Reductive cleavage of the azo group'),
  principle: L('Сильные восстановители расщепляют связь –N=N– и разрушают хромофор: метиловый оранжевый восстанавливается до сульфаниловой кислоты и N,N-диметил-п-фенилендиамина, раствор обесцвечивается.', 'Күшті тотықсыздандырғыштар –N=N– байланысын ыдыратып, хромофорды бұзады: метилоранж сульфанил қышқылы мен N,N-диметил-п-фенилендиаминге дейін тотықсызданады, ерітінді түссізденеді.', 'Strong reducing agents cleave the –N=N– bond and destroy the chromophore; methyl orange is reduced to sulfanilic acid and N,N-dimethyl-p-phenylenediamine, and the solution becomes colourless.'),
  equation: ['NaO₃S–C₆H₄–N=N–C₆H₄–N(CH₃)₂ + 4[H] → NaO₃S–C₆H₄–NH₂ + H₂N–C₆H₄–N(CH₃)₂', 'Zn + 2HCl → ZnCl₂ + H₂↑'],
  initialState: ({ prev }) => ({ pH0: (prev['1'] || {}).acidForm ? 4.0 : 6.5, load: (prev['2'] || {}).dark ? 3 : 1, red: null }),
  checkpoints: [0],
  steps: [r0, r1, r2, r3],
  results: (S) => ({ min: S.red ? S.red.min : null, load: S.load }),
  summary: (r) => [
    { label: L('Обесцвечивание', 'Түссіздену', 'Decolourisation'), value: r.min != null ? { ru: `за ${n(r.min, 0)} мин`, kk: `${n(r.min, 0)} минутта`, en: `in ${n(r.min, 0)} min` } : '—', st: r.min != null ? 'ok' : '' },
  ],
};
