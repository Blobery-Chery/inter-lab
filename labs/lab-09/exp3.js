/** Опыт 3. Гидролиз соли диазония (реакция с выделением азота). Методичка, раздел 6, опыт 3. */
import { L } from '../../app/i18n.js';
import { COL, waterBathBack } from './scene.js';

const t1 = {
  type: 'test', id: 'warm',
  title: L('Нагревание раствора соли диазония', 'Диазоний тұзының ерітіндісін қыздыру', 'Warming the diazonium salt solution'),
  instr: L('<ol><li>Нагрейте 1–2 мл раствора соли диазония (порция, отобранная в опыте 1) на водяной бане при <b>50–60 °C</b>.</li><li>Наблюдайте выделение газа и определите запах — правильно, направляя пары ладонью к себе.</li></ol><p class="note">Работа в вытяжном шкафу.</p>',
    '<ol><li>Диазоний тұзы ерітіндісінің 1–2 мл-ін (1-тәжірибеде алынған порция) су моншасында <b>50–60 °C</b>-та қыздырыңыз.</li><li>Газдың бөлінуін бақылап, иісті анықтаңыз — дұрысы, буды алақанмен өзіңізге қарай бағыттап.</li></ol><p class="note">Жұмыс тартпа шкафта.</p>',
    '<ol><li>Warm 1–2 mL of the diazonium solution (the portion taken in experiment 1) on a water bath at <b>50–60 °C</b>.</li><li>Watch for gas evolution and note the odour — correctly, by wafting the vapour towards you with your hand.</li></ol><p class="note">Work in the fume hood.</p>'),
  need: L('Нагрейте и определите запах', 'Қыздырып, иісін анықтаңыз', 'Warm the tube and note the odour'),
  tubes: [{ id: 'd', label: L('соль диазония, 1,5 мл', 'диазоний тұзы, 1,5 мл', 'diazonium salt, 1.5 mL'), init: { v: 1.5, color: COL.diaz } }],
  reagents: [
    { id: 'bath', group: L('Нагрев', 'Қыздыру', 'Heating'), label: L('Водяная баня 50–60 °C, 4 мин', 'Су моншасы 50–60 °C, 4 мин', 'Water bath 50–60 °C, 4 min'), advance: 240, disabled: (t) => t.warm,
      apply(t, S, ctx) { t.warm = true; t.hot = true; t.gas = S.q > 0.2; t.color = 'rgba(226,208,160,.55)'; S.e3.warm = 'ok'; ctx.log(L('Пробирка нагрета на водяной бане при 55 °C', 'Пробирка су моншасында 55 °C-та қыздырылды', 'Tube warmed on a water bath at 55 °C')); } },
    { id: 'boil', group: L('Нагрев', 'Қыздыру', 'Heating'), label: L('Кипящая водяная баня — быстрее', 'Қайнаған су моншасы — тезірек', 'Boiling water bath — quicker'), advance: 120, disabled: (t) => t.warm,
      apply(t, S, ctx) {
        ctx.remark({ key: 'boil3', severity: 'minor', text: L('пробирку нагревали в кипящей бане — бурное вспенивание, часть раствора выброшена', 'пробирка қайнаған моншада қыздырылды — қатты көпіршу, ерітіндінің бір бөлігі атылып шықты', 'tube heated in a boiling bath — violent frothing, some of the solution was thrown out') });
        t.warm = true; t.hot = true; t.gas = true; t.v = 1.0; t.color = 'rgba(200,170,110,.6)'; S.e3.warm = 'boil';
        ctx.log(L('Пробирка в кипящей бане: бурное вспенивание, часть раствора выплеснулась', 'Қайнаған моншадағы пробирка: қатты көпіршу, ерітіндінің бір бөлігі шашырады', 'Tube in a boiling bath: violent frothing, some solution spurted out'), 'obs');
      } },
    { id: 'waft', group: L('Запах', 'Иіс', 'Odour'), label: L('Направить пары ладонью к себе', 'Буды алақанмен өзіне бағыттау', 'Waft the vapour towards you'), advance: 20,
      apply(t, S, ctx) { if (!t.warm) { ctx.feedback(L('Пока запаха нет — сначала нагрейте пробирку.', 'Әзірге иіс жоқ — алдымен пробирканы қыздырыңыз.', 'No odour yet — warm the tube first.'), 'warn'); return; } t.smelled = true; } },
    { id: 'sniff', group: L('Запах', 'Иіс', 'Odour'), label: L('Поднести пробирку к носу и вдохнуть', 'Пробирканы мұрынға жақындатып, иіскеу', 'Hold the tube to your nose and sniff'), advance: 10,
      apply(t, S, ctx) {
        ctx.remark({ key: 'sniff', severity: 'safety', text: L('пары вдыхали прямо из пробирки', 'буды тікелей пробиркадан иіскеді', 'vapour sniffed straight from the tube'), whatif: L('Из горячей пробирки выходят пары фенола и HCl: вдыхать их непосредственно опасно (ожог слизистой). Запах определяют, направляя пары ладонью к себе.', 'Ыстық пробиркадан фенол мен HCl булары шығады: оларды тікелей иіскеу қауіпті (кілегей қабықтың күйігі). Иісті буды алақанмен өзіне бағыттап анықтайды.', 'Phenol and HCl vapour comes out of the hot tube: inhaling it directly is dangerous (burns to the mucous membranes). Odour is checked by wafting the vapour towards you.') });
        if (t.warm) t.smelled = true;
      } },
  ],
  sceneBack: waterBathBack,
  done: (tubes) => tubes.d.warm && tubes.d.smelled,
  observe: {
    question: L('Что вы наблюдаете при нагревании?', 'Қыздырғанда не байқайсыз?', 'What do you observe on warming?'),
    options: [
      { id: 'gas', label: L('Выделяются пузырьки газа, появляется характерный запах фенола', 'Газ көпіршіктері бөлінеді, фенолдың тән иісі пайда болады', 'Gas bubbles are evolved and the characteristic odour of phenol appears'), log: (S) => (S.q > 0.2 ? L('При нагревании до 50–60 °C выделяются пузырьки газа (N₂), раствор слегка мутнеет, появляется характерный запах фенола', '50–60 °C-қа дейін қыздырғанда газ көпіршіктері (N₂) бөлінеді, ерітінді сәл лайланады, фенолдың тән иісі пайда болады', 'On warming to 50–60 °C gas bubbles (N₂) are given off, the solution turns slightly cloudy and the characteristic odour of phenol appears')
        : L('Пузырьков газа немного (соль диазония частично разложилась ещё до опыта), запах фенола отчётливый', 'Газ көпіршіктері аз (диазоний тұзы тәжірибеге дейін ішінара ыдырап кеткен), фенол иісі айқын', 'Only a few gas bubbles (the diazonium salt had partly decomposed before the test); a distinct odour of phenol')) },
      { id: 'brown', label: L('Бурые пары, запах горького миндаля', 'Қоңыр булар, ащы бадам иісі', 'Brown fumes and a smell of bitter almonds') },
      { id: 'orange', label: L('Выпадает оранжевый осадок', 'Қызғылт сары тұнба түзіледі', 'An orange precipitate forms') },
      { id: 'none', label: L('Никаких изменений', 'Ешқандай өзгеріс жоқ', 'No change at all') },
    ],
    correct: () => 'gas',
    why: () => L('При нагревании катион диазония реагирует с водой: N₂ — прекрасная уходящая группа, образуется фенол.', 'Қыздырғанда диазоний катионы сумен әрекеттеседі: N₂ — тамаша кететін топ, фенол түзіледі.', 'On warming the diazonium ion reacts with water: N₂ is an excellent leaving group and phenol is formed.'),
  },
  onDone(S) { S.e3.gas = true; },
};

const t2 = {
  type: 'test', id: 'brom',
  title: L('Проба с бромной водой', 'Бром суымен сынама', 'Test with bromine water'),
  instr: L('<ol><li>Охладите пробирку.</li><li>Прибавляйте <b>бромную воду</b> по каплям и наблюдайте.</li></ol><p class="note">Бромная вода вредна, пары брома ядовиты — только в вытяжном шкафу, только в холодный раствор.</p>',
    '<ol><li>Пробирканы салқындатыңыз.</li><li><b>Бром суын</b> тамшылатып қосып, бақылаңыз.</li></ol><p class="note">Бром суы зиянды, бром булары улы — тек тартпа шкафта, тек суық ерітіндіге.</p>',
    '<ol><li>Cool the tube.</li><li>Add <b>bromine water</b> dropwise and observe.</li></ol><p class="note">Bromine water is harmful and bromine vapour is toxic — fume hood only, cold solution only.</p>'),
  need: L('Проведите пробу с бромной водой', 'Бром суымен сынама жүргізіңіз', 'Do the bromine water test'),
  tubes: [{ id: 'd', label: L('после нагревания', 'қыздырғаннан кейін', 'after warming'), init: { v: 1.4, color: 'rgba(226,208,160,.55)' } }],
  reagents: [
    { id: 'cool', group: L('Пробирка', 'Пробирка', 'Tube'), label: L('Охладить под струёй холодной воды', 'Суық су ағынымен салқындату', 'Cool under running cold water'), advance: 60, disabled: (t) => t.cool,
      apply(t, S, ctx) { t.cool = true; ctx.log(L('Пробирка охлаждена под струёй воды', 'Пробирка су ағынымен салқындатылды', 'Tube cooled under running water')); } },
    ...[2, 5].map((k) => ({ id: 'br' + k, group: L('Бромная вода', 'Бром суы', 'Bromine water'), label: L(`+${k} капли`, `+${k} тамшы`, `+${k} drops`), advance: 10 * k,
      apply(t, S, ctx) {
        if (!t.cool) ctx.remark({ key: 'brHot', severity: 'safety', text: L('бромную воду прибавляли к горячему раствору — пары брома', 'бром суы ыстық ерітіндіге қосылды — бром булары', 'bromine water added to the hot solution — bromine vapour'), whatif: L('Из горячего раствора бром улетучивается: над пробиркой бурые ядовитые пары брома, а для пробы его остаётся меньше. Раствор сначала охлаждают.', 'Ыстық ерітіндіден бром ұшып кетеді: пробирка үстінде қоңыр улы бром булары, ал сынамаға ол азырақ қалады. Ерітіндіні алдымен салқындатады.', 'Bromine evaporates from a hot solution: toxic brown bromine vapour forms above the tube and less is left for the test. Cool the solution first.') });
        t.v += 0.05 * k; t.drops = (t.drops || 0) + k;
        const phenol = S.q2 > 0.05;
        if (phenol) { t.ppt = Math.min(1, (t.ppt || 0) + 0.06 * k); t.pptColor = 'var(--solid)'; t.color = 'rgba(232,226,200,.5)'; }
        else t.color = 'rgba(230,150,40,.55)';
      } })),
  ],
  done: (tubes) => (tubes.d.ppt || 0) >= 0.5,
  observe: {
    question: L('Что происходит при прибавлении бромной воды?', 'Бром суын қосқанда не болады?', 'What happens when bromine water is added?'),
    options: [
      { id: 'white', label: L('Бромная вода обесцвечивается, выпадает белый осадок', 'Бром суы түссізденеді, ақ тұнба түзіледі', 'The bromine water is decolourised and a white precipitate forms'), log: (S, tubes) => L(`Бромная вода (${tubes.d.drops} кап.) обесцвечивается, выпадает белый осадок 2,4,6-трибромфенола`, `Бром суы (${tubes.d.drops} тамшы) түссізденеді, 2,4,6-трибромфенолдың ақ тұнбасы түзіледі`, `The bromine water (${tubes.d.drops} drops) is decolourised and a white precipitate of 2,4,6-tribromophenol forms`) },
      { id: 'stay', label: L('Окраска брома сохраняется, осадка нет', 'Бромның түсі сақталады, тұнба жоқ', 'The bromine colour persists; no precipitate') },
      { id: 'orange', label: L('Выпадает оранжево-красный осадок', 'Қызғылт сары-қызыл тұнба түзіледі', 'An orange-red precipitate forms') },
      { id: 'gas', label: L('Выделяется бурый газ, раствор синеет', 'Қоңыр газ бөлініп, ерітінді көгереді', 'A brown gas is evolved and the solution turns blue') },
    ],
    correct: () => 'white',
    why: () => L('Фенол — сильно активированное кольцо (+M группы OH): бром замещает все три орто- и пара-положения, 2,4,6-трибромфенол нерастворим в воде.', 'Фенол — қатты белсендірілген сақина (OH тобының +M әсері): бром барлық үш орто- және пара-жағдайды орынбасады, 2,4,6-трибромфенол суда ерімейді.', 'Phenol has a strongly activated ring (+M of OH): bromine substitutes all three ortho and para positions; 2,4,6-tribromophenol is insoluble in water.'),
  },
  onDone(S) { S.e3.br = true; },
};

const t3 = {
  type: 'quiz', id: 'q3',
  title: L('Вопросы к опыту 3', '3-тәжірибеге сұрақтар', 'Questions on experiment 3'),
  instr: L('<p>Ответьте на вопросы преподавателя.</p>', '<p>Оқытушының сұрақтарына жауап беріңіз.</p>', '<p>Answer the instructor’s questions.</p>'),
  need: L('Ответьте на вопросы', 'Сұрақтарға жауап беріңіз', 'Answer the questions'),
  questions: [
    { q: L('Почему гидролиз соли диазония идёт только при нагревании, а в ледяной бане раствор устойчив?', 'Неліктен диазоний тұзының гидролизі тек қыздырғанда жүреді, ал мұз моншасында ерітінді тұрақты?', 'Why does the diazonium salt hydrolyse only on warming, while the solution is stable in the ice bath?'),
      options: [L('Арендиазоний-катион стабилизирован сопряжением с кольцом; отщепление N₂ требует энергии активации', 'Арендиазоний катионы сақинамен түйіндесу арқылы тұрақтанған; N₂-нің бөлінуі активтендіру энергиясын қажет етеді', 'The arenediazonium ion is stabilised by conjugation with the ring; loss of N₂ needs activation energy'), L('На холоду вода не реагирует ни с чем', 'Суықта су ештеңемен әрекеттеспейді', 'Cold water does not react with anything'), L('Лёд связывает азот', 'Мұз азотты байланыстырады', 'The ice binds the nitrogen'), L('Соляная кислота разрушается при нагревании', 'Тұз қышқылы қыздырғанда бұзылады', 'Hydrochloric acid is destroyed by heating')],
      correct: 0, why: L('Методичка, раздел 3.1: сопряжение –N≡N⁺ с кольцом делает соль устойчивой в холодном растворе; при нагревании она разлагается с выделением N₂.', 'Әдістеме, 3.1-бөлім: –N≡N⁺ тобының сақинамен түйіндесуі тұзды суық ерітіндіде тұрақты етеді; қыздырғанда ол N₂ бөле ыдырайды.', 'Manual, section 3.1: conjugation of –N≡N⁺ with the ring keeps the salt stable in cold solution; on warming it decomposes with loss of N₂.') },
    { q: L('Сколько молей брома расходуется на 1 моль фенола в этой пробе?', 'Бұл сынамада 1 моль фенолға бромның неше молі жұмсалады?', 'How many moles of bromine are used per mole of phenol in this test?'),
      options: ['3', '1', '2', '6'], correct: 0, why: L('C₆H₅OH + 3Br₂ → 2,4,6-Br₃C₆H₂OH↓ + 3HBr.', 'C₆H₅OH + 3Br₂ → 2,4,6-Br₃C₆H₂OH↓ + 3HBr.', 'C₆H₅OH + 3Br₂ → 2,4,6-Br₃C₆H₂OH↓ + 3HBr.') },
  ],
};

export default {
  id: '3',
  title: L('Гидролиз соли диазония (реакция с выделением азота)', 'Диазоний тұзының гидролизі (азот бөлінетін реакция)', 'Hydrolysis of the diazonium salt (reaction with loss of nitrogen)'),
  principle: L('При нагревании катион диазония реагирует с водой: выделяется азот и образуется фенол; фенол обнаруживают бромной водой (белый осадок 2,4,6-трибромфенола).', 'Қыздырғанда диазоний катионы сумен әрекеттеседі: азот бөлініп, фенол түзіледі; фенолды бром суымен анықтайды (2,4,6-трибромфенолдың ақ тұнбасы).', 'On warming the diazonium ion reacts with water: nitrogen is released and phenol is formed; the phenol is detected with bromine water (white precipitate of 2,4,6-tribromophenol).'),
  equation: ['C₆H₅N₂⁺ Cl⁻ + H₂O → C₆H₅OH + N₂↑ + HCl', 'C₆H₅OH + 3Br₂ → 2,4,6-Br₃C₆H₂OH↓ + 3HBr'],
  initialState: ({ prev }) => {
    const r = prev['1'] || { Dz: 24, nAn: 25, P: 0.3 };
    const q = r.nAn ? r.Dz / r.nAn : 0.9;
    return { q, q2: q + (r.nAn ? (r.P || 0) / r.nAn : 0), store: r.store || 'ice', e3: { warm: '', gas: false, br: false } };
  },
  checkpoints: [0],
  steps: [t1, t2, t3],
  results: (S) => ({ ...S.e3 }),
  summary: (r) => [
    { label: L('Нагревание', 'Қыздыру', 'Warming'), value: r.gas ? L('N₂ ↑, запах фенола', 'N₂ ↑, фенол иісі', 'N₂ ↑, phenol odour') : '—', st: r.gas ? 'ok' : '' },
    { label: L('Бромная вода', 'Бром суы', 'Bromine water'), value: r.br ? L('белый осадок', 'ақ тұнба', 'white precipitate') : '—', st: r.br ? 'ok' : '' },
  ],
};
