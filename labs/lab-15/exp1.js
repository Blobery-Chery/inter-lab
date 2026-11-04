/** Опыт 1. Проба Молиша (общая реакция на углеводы). Методичка, раздел 6, опыт 1. */
import { L } from '../../app/i18n.js';
import { hood, scene, tubeRack, tube } from '../../app/scene/svg.js';
import { tubesOf, sugarReagent, baseState, cellsSummary } from './common.js';
import { benchScene } from './steps/bench.js';

const hoodScene = (S, lc) => scene(hood({ air: !!(lc && lc.on && lc.on.hood) }));
const rackScene = () => scene([90, 150, 210, 270].map((x, i) => tube({ id: 'r' + i, cx: x, frac: 0 })).join('') + tubeRack(60, 300));

const s0 = {
  type: 'checklist', id: 'ppe',
  title: L('Рабочее место и средства защиты', 'Жұмыс орны және қорғаныс құралдары', 'Workplace and protective equipment'),
  instr: L('<p>В работе используются концентрированные H₂SO₄ и HCl, щёлочи, соли меди и серебра. Работа с концентрированными кислотами — в вытяжном шкафу. Наденьте средства защиты и найдите средства аварийной защиты: нажмите на каждый нужный пункт. Лишнее не нажимайте.</p>',
    '<p>Жұмыста концентрлі H₂SO₄ және HCl, сілтілер, мыс пен күміс тұздары қолданылады. Концентрлі қышқылдармен жұмыс — тартпа шкафта. Қорғаныс құралдарын киіп, апаттық қорғаныс құралдарын табыңыз: әр қажетті тармақты басыңыз. Артығын баспаңыз.</p>',
    '<p>This work uses concentrated H₂SO₄ and HCl, alkalis and copper and silver salts. Concentrated acids are handled in the fume hood. Put on your protective equipment and locate the emergency equipment: tap every item you need. Do not tap anything that is wrong.</p>'),
  need: L('Выполните все нужные пункты', 'Барлық қажетті тармақтарды орындаңыз', 'Complete every required item'),
  scene: hoodScene,
  items: [
    { id: 'coat', label: L('Халат застёгнут', 'Халат түймеленген', 'Lab coat buttoned'), log: L('Надет и застёгнут хлопковый халат', 'Мақта мата халат киіліп, түймеленді', 'Cotton lab coat on and buttoned') },
    { id: 'gog', label: L('Защитные очки', 'Қорғаныс көзілдірігі', 'Safety goggles'), log: L('Надеты защитные очки', 'Қорғаныс көзілдірігі киілді', 'Safety goggles on') },
    { id: 'glv', label: L('Перчатки нитриловые', 'Нитрил қолғаптар', 'Nitrile gloves'), log: L('Надеты нитриловые перчатки', 'Нитрил қолғаптар киілді', 'Nitrile gloves on') },
    { id: 'hood', label: L('Включить тягу шкафа, опустить экран', 'Шкаф тартымын қосып, экранды түсіру', 'Switch on the hood, lower the sash'), log: L('Включена тяга вытяжного шкафа, экран опущен до рабочего уровня', 'Тартпа шкафтың тартымы қосылды, экран жұмыс деңгейіне дейін түсірілді', 'Fume hood switched on, sash lowered to working height') },
    { id: 'eye', label: L('Найти фонтанчик для глаз', 'Көз жуатын фонтанды табу', 'Locate the eyewash station'), log: L('Найден фонтанчик для промывания глаз', 'Көз жуатын фонтан табылды', 'Eyewash station located') },
    { id: 'shw', label: L('Найти аварийный душ', 'Апаттық душты табу', 'Locate the safety shower'), log: L('Найден аварийный душ', 'Апаттық душ табылды', 'Safety shower located') },
    { id: 'ext', label: L('Найти огнетушитель', 'Өрт сөндіргішті табу', 'Locate the fire extinguisher'), log: L('Найден огнетушитель', 'Өрт сөндіргіш табылды', 'Fire extinguisher located') },
    { id: 'heavy', label: L('Ёмкость для отходов тяжёлых металлов (Cu, Ag)', 'Ауыр металдар қалдықтарына арналған ыдыс (Cu, Ag)', 'Heavy-metal waste container (Cu, Ag)'), log: L('Подготовлена ёмкость для отходов, содержащих медь и серебро', 'Құрамында мыс пен күміс бар қалдықтарға арналған ыдыс дайындалды', 'Container for copper- and silver-containing waste ready') },
    { id: 'lens', label: L('Работать в контактных линзах вместо очков', 'Көзілдіріктің орнына контакт линзаларымен жұмыс істеу', 'Work in contact lenses instead of goggles'),
      wrong: { severity: 'safety', text: L('попытка работать в контактных линзах без защитных очков (п. 3.2 правил ТБ)', 'қорғаныс көзілдірігінсіз контакт линзаларымен жұмыс істеу әрекеті (ҚТ ережелерінің 3.2-тармағы)', 'tried to work in contact lenses without goggles (safety rule 3.2)'),
        whatif: L('Пары HCl скапливаются под линзой, а капля концентрированной H₂SO₄ попадает прямо в глаз — тяжёлый химический ожог роговицы. Очки обязательны при любой работе с реактивами.', 'HCl булары линза астына жиналады, ал концентрлі H₂SO₄ тамшысы тікелей көзге түседі — қасаңқабықтың ауыр химиялық күйігі. Реактивтермен кез келген жұмыста көзілдірік міндетті.', 'HCl vapour collects under the lens and a drop of concentrated H₂SO₄ goes straight into the eye — a severe chemical burn of the cornea. Goggles are compulsory for any work with reagents.') } },
    { id: 'taste', label: L('Попробовать раствор сахара на вкус, чтобы не перепутать', 'Шатастырмау үшін қант ерітіндісінің дәмін тату', 'Taste the sugar solution to avoid mixing them up'),
      wrong: { severity: 'safety', text: L('попытка попробовать реактив на вкус (п. 2.2 правил ТБ)', 'реактивтің дәмін татуға әрекет (ҚТ ережелерінің 2.2-тармағы)', 'tried to taste a reagent (safety rule 2.2)'),
        whatif: L('В лаборатории ничего не пробуют на вкус, даже «безобидный» сахар: склянки и пипетки загрязнены кислотами, щёлочами и солями меди и серебра. Растворы различают только по этикеткам.', 'Зертханада ештеңенің дәмін татпайды, тіпті «зиянсыз» қантты да: склянкалар мен пипеткалар қышқылдармен, сілтілермен, мыс пен күміс тұздарымен ластанған. Ерітінділерді тек жапсырмалары бойынша ажыратады.', 'Nothing is ever tasted in the laboratory, not even “harmless” sugar: bottles and pipettes are contaminated with acids, alkalis and copper and silver salts. Solutions are told apart only by their labels.') } },
  ],
};

const s1 = {
  type: 'pick', id: 'kit',
  title: L('Посуда и приборы для качественных проб', 'Сапалық сынамаларға арналған ыдыстар мен құралдар', 'Glassware and instruments for the qualitative tests'),
  instr: L('<p>Возьмите с полки всё, что понадобится для шести проб этой работы (раздел 5 методички), и ничего лишнего.</p>',
    '<p>Сөреден осы жұмыстың алты сынамасына қажеттінің бәрін алыңыз (әдістеменің 5-бөлімі), артығын алмаңыз.</p>',
    '<p>Take from the shelf everything you will need for the six tests of this work (section 5 of the manual) and nothing extra.</p>'),
  need: L('Соберите нужный набор', 'Қажетті жиынтықты жинаңыз', 'Collect the right set'),
  shelf: ['test-tube', 'tube-rack', 'graduated-pipette', 'dropping-pipette', 'water-bath', 'stopwatch', 'conical-50', 'rbf-50', 'reflux-condenser', 'buchner', 'polarimeter', 'thermometer-250', 'sep-funnel', 'balance'],
  take: ['test-tube', 'tube-rack', 'graduated-pipette', 'dropping-pipette', 'water-bath', 'stopwatch'],
  hint1: L('Все пробы — в пробирках на штативе: растворы отмеряют пипетками (1 мл, 0,5 мл) и капельной пипеткой (капли), нагревают на водяных банях, время отмечают по секундомеру. Синтеза, фильтрования и взвешивания нет.', 'Барлық сынама штативтегі пробиркаларда: ерітінділерді пипеткалармен (1 мл, 0,5 мл) және тамшуырмен (тамшылар) өлшейді, су моншаларында қыздырады, уақытты секундомермен белгілейді. Синтез, сүзу және өлшеу жоқ.', 'All tests are done in test tubes in a rack: solutions are measured with pipettes (1 mL, 0.5 mL) and a dropping pipette (drops), heated on water baths and timed with a stopwatch. No synthesis, filtration or weighing.'),
  scene: rackScene,
};

const s2 = {
  type: 'decide', id: 'pipettes',
  title: L('Растворы сахаров и пипетки', 'Қант ерітінділері және пипеткалар', 'Sugar solutions and pipettes'),
  instr: L('<p>На столе четыре склянки: 1–5 % растворы <b>глюкозы, фруктозы, сахарозы и мальтозы</b>. Их будут отмеривать во всех шести пробах. Пронумеруйте пробирки (1 — глюкоза, 2 — фруктоза, 3 — сахароза, 4 — мальтоза) и решите, чем отмерять растворы.</p>',
    '<p>Үстелде төрт склянка: <b>глюкоза, фруктоза, сахароза және мальтозаның</b> 1–5 % ерітінділері. Оларды алты сынаманың бәрінде өлшейді. Пробиркаларды нөмірлеңіз (1 — глюкоза, 2 — фруктоза, 3 — сахароза, 4 — мальтоза) және ерітінділерді немен өлшейтініңізді шешіңіз.</p>',
    '<p>There are four bottles on the bench: 1–5 % solutions of <b>glucose, fructose, sucrose and maltose</b>. They will be measured out in all six tests. Number the tubes (1 — glucose, 2 — fructose, 3 — sucrose, 4 — maltose) and decide what to measure the solutions with.</p>'),
  need: L('Выберите способ отмеривания', 'Өлшеу тәсілін таңдаңыз', 'Choose how to measure out the solutions'),
  question: L('Как вы будете отмеривать растворы сахаров?', 'Қант ерітінділерін қалай өлшейсіз?', 'How will you measure out the sugar solutions?'),
  scene: rackScene,
  options: [
    { id: 'own', ok: true, label: L('Отдельной подписанной пипеткой для каждого раствора', 'Әр ерітінді үшін жеке белгіленген пипеткамен', 'With a separate labelled pipette for each solution'), why: L('Так растворы не загрязняют друг друга: даже следы восстанавливающего сахара в сахарозе дадут ложноположительные пробы.', 'Осылай ерітінділер бір-бірін ластамайды: сахарозадағы тотықсыздандырғыш қанттың іздері де жалған оң сынама береді.', 'This way the solutions do not contaminate each other: even traces of a reducing sugar in the sucrose would give false positives.'),
      log: L('Пробирки пронумерованы; для каждого раствора сахара — своя подписанная пипетка', 'Пробиркалар нөмірленді; әр қант ерітіндісіне — өз белгіленген пипеткасы', 'Tubes numbered; each sugar solution has its own labelled pipette'), effect(S) { S.cross = false; } },
    { id: 'one', ok: false, label: L('Одной пипеткой для всех четырёх — так быстрее, растворы ведь бесцветные и похожие', 'Төртеуіне бір пипеткамен — тезірек, ерітінділер түссіз әрі ұқсас қой', 'With one pipette for all four — it is quicker, the solutions are colourless and alike anyway'),
      whatif: L('В пипетке остаются капли предыдущего раствора: в сахарозу (её набирают после фруктозы) попадает восстанавливающий сахар, и пробы Троммера, Фелинга и Толленса с «сахарозой» окажутся слабо положительными.', 'Пипеткада алдыңғы ерітіндінің тамшылары қалады: сахарозаға (оны фруктозадан кейін алады) тотықсыздандырғыш қант түседі, сондықтан «сахарозамен» Троммер, Фелинг және Толленс сынамалары әлсіз оң болып шығады.', 'Drops of the previous solution stay in the pipette: a reducing sugar gets into the sucrose (taken after the fructose), and Trommer’s, Fehling’s and Tollens’ tests with the “sucrose” will come out weakly positive.'),
      log: L('Пробирки пронумерованы; все растворы сахаров отмеряются одной и той же пипеткой', 'Пробиркалар нөмірленді; барлық қант ерітінділері бір пипеткамен өлшенеді', 'Tubes numbered; all the sugar solutions are measured with one and the same pipette'), effect(S) { S.cross = true; } },
    { id: 'eye', ok: false, severity: 'minor', retry: true, label: L('Наливать прямо из склянок «на глаз»', 'Склянкадан тікелей «көзбен» құю', 'Pour straight from the bottles by eye'),
      remark: L('растворы наливают «на глаз» — объёмы в пробирках не одинаковы, сравнивать пробы нельзя', 'ерітінділер «көзбен» құйылады — пробиркалардағы көлемдер бірдей емес, сынамаларды салыстыруға болмайды', 'solutions poured by eye — the volumes differ and the tests cannot be compared'),
      whatif: L('Без пипетки в пробирках окажется от 0,5 до 3 мл — интенсивность окраски и время появления осадка нельзя будет сравнивать между сахарами.', 'Пипеткасыз пробиркаларда 0,5-тен 3 мл-ге дейін болады — түстің қарқындылығы мен тұнбаның пайда болу уақытын қанттар арасында салыстыру мүмкін болмайды.', 'Without a pipette the tubes will hold anything from 0.5 to 3 mL — the colour intensity and the time of precipitation cannot be compared between the sugars.') },
  ],
};

const s3 = {
  type: 'lab15-bench', id: 'molisch', key: 'molisch', test: 'molisch',
  title: L('Проба Молиша', 'Молиш сынамасы', 'Molisch’s test'),
  instr: L('<ol><li>К <b>1 мл</b> каждого раствора сахара прибавьте <b>2–3 капли</b> реактива Молиша (5 % α-нафтол в этаноле) и перемешайте.</li><li>Наклоните пробирку и осторожно прилейте по стенке <b>1 мл конц. H₂SO₄</b>, чтобы она образовала отдельный нижний слой. <b>Не встряхивать!</b></li><li>Наблюдайте границу слоёв.</li></ol><p class="note">Концентрированная H₂SO₄ — в вытяжном шкафу, медленно, по стенке; отверстие пробирки — от себя и от соседей.</p>',
    '<ol><li>Әр қант ерітіндісінің <b>1 мл</b>-іне Молиш реактивінің (этанолдағы 5 % α-нафтол) <b>2–3 тамшысын</b> қосып, араластырыңыз.</li><li>Пробирканы еңкейтіп, бөлек төменгі қабат түзетіндей етіп қабырға бойымен абайлап <b>1 мл конц. H₂SO₄</b> құйыңыз. <b>Шайқамаңыз!</b></li><li>Қабаттар шекарасын бақылаңыз.</li></ol><p class="note">Концентрлі H₂SO₄ — тартпа шкафта, баяу, қабырға бойымен; пробирканың аузы — өзіңізден және көршілерден ары.</p>',
    '<ol><li>To <b>1 mL</b> of each sugar solution add <b>2–3 drops</b> of Molisch reagent (5 % α-naphthol in ethanol) and mix.</li><li>Tilt the tube and carefully pour <b>1 mL of conc. H₂SO₄</b> down the wall so that it forms a separate lower layer. <b>Do not shake!</b></li><li>Watch the interface of the two layers.</li></ol><p class="note">Concentrated H₂SO₄ — in the fume hood, slowly, down the wall; the mouth of the tube pointing away from you and your neighbours.</p>'),
  need: L('Получите два слоя и дождитесь результата', 'Екі қабат алып, нәтижені күтіңіз', 'Form two layers and wait for the result'),
  tubes: tubesOf(),
  baths: [],
  reagents: [
    sugarReagent(1),
    { id: 'mol', group: L('Реактив Молиша', 'Молиш реактиві', 'Molisch reagent'), label: L('+1 капля α-нафтола в каждую', 'Әрқайсысына +1 тамшы α-нафтол', '+1 drop of α-naphthol to each'), target: 'all', advance: 15,
      when: (t) => (!t.sugV ? L('Сначала внесите растворы сахаров.', 'Алдымен қант ерітінділерін салыңыз.', 'Add the sugar solutions first.') : t.acid ? L('Кислота уже прилита — реактив прибавляют до неё.', 'Қышқыл құйылды — реактивті оған дейін қосады.', 'The acid is already in — the reagent goes in before it.') : null),
      apply(t) { t.mol = (t.mol || 0) + 1; t.v += 0.05; },
      log: (S, b) => L(`В каждую пробирку прибавлена капля реактива Молиша (всего ${b.tubes[0].mol} кап.), перемешано`, `Әр пробиркаға Молиш реактивінің бір тамшысы қосылды (барлығы ${b.tubes[0].mol} тамшы), араластырылды`, `A drop of Molisch reagent added to each tube (${b.tubes[0].mol} in total), mixed`) },
    { id: 'wall', group: L('Конц. H₂SO₄ (в вытяжном шкафу)', 'Конц. H₂SO₄ (тартпа шкафта)', 'Conc. H₂SO₄ (in the fume hood)'), label: L('1 мл по стенке наклонённой пробирки', 'Еңкейтілген пробирканың қабырғасымен 1 мл', '1 mL down the wall of the tilted tube'), target: 'all', advance: 90,
      when: (t) => (!t.mol ? L('Сначала прибавьте 2–3 капли реактива Молиша.', 'Алдымен Молиш реактивінің 2–3 тамшысын қосыңыз.', 'First add 2–3 drops of Molisch reagent.') : t.acid ? L('Кислота уже прилита.', 'Қышқыл құйылды.', 'The acid is already in.') : null),
      apply(t) { t.acid = 'wall'; t.v += 1; t.p = 0; },
      log: L('В каждую наклонённую пробирку по стенке осторожно прилит 1 мл конц. H₂SO₄ — кислота опустилась вниз отдельным слоем', 'Әр еңкейтілген пробиркаға қабырға бойымен абайлап 1 мл конц. H₂SO₄ құйылды — қышқыл бөлек қабат болып төмен түсті', '1 mL of conc. H₂SO₄ carefully poured down the wall of each tilted tube — the acid sank as a separate layer') },
    { id: 'pour', group: L('Конц. H₂SO₄ (в вытяжном шкафу)', 'Конц. H₂SO₄ (тартпа шкафта)', 'Conc. H₂SO₄ (in the fume hood)'), label: L('1 мл влить сразу, не наклоняя', 'Еңкейтпей, 1 мл бірден құю', 'Pour in 1 mL at once without tilting'), target: 'all', advance: 30,
      when: (t) => (!t.mol ? L('Сначала прибавьте 2–3 капли реактива Молиша.', 'Алдымен Молиш реактивінің 2–3 тамшысын қосыңыз.', 'First add 2–3 drops of Molisch reagent.') : t.acid ? L('Кислота уже прилита.', 'Қышқыл құйылды.', 'The acid is already in.') : null),
      apply(t) { t.acid = 'pour'; t.v += 1; t.T = 70; },
      log: L('Конц. H₂SO₄ влита в пробирки сразу, струёй', 'Конц. H₂SO₄ пробиркаларға бірден, ағынмен құйылды', 'Conc. H₂SO₄ poured into the tubes at once, in a stream') },
    { id: 'shake', group: L('Пробирки', 'Пробиркалар', 'Tubes'), label: L('Встряхнуть пробирки', 'Пробиркаларды шайқау', 'Shake the tubes'), target: 'all', advance: 10, cls: 'ghost',
      when: (t) => (!t.acid ? L('Перемешивать нужно после реактива Молиша — это уже сделано.', 'Молиш реактивінен кейін араластыру керек — бұл жасалды.', 'Mixing after the Molisch reagent has already been done.') : null),
      apply(t) { t.shaken = 1; t.T = 75; },
      log: L('Пробирки с кислотой встряхнуты — слои перемешались, пробирки сильно разогрелись', 'Қышқылы бар пробиркалар шайқалды — қабаттар араласты, пробиркалар қатты қызды', 'The tubes with acid were shaken — the layers mixed and the tubes became very hot') },
  ],
  check(S, b, ctx) {
    if (b.tubes.some((t) => t.mol > 5)) ctx.remark({ key: 'mol-x', severity: 'minor', text: L('избыток реактива Молиша (больше 5 капель вместо 2–3)', 'Молиш реактивінің артық мөлшері (2–3 тамшының орнына 5-тен көп)', 'too much Molisch reagent (more than 5 drops instead of 2–3)') });
    if (b.tubes.some((t) => t.acid === 'pour')) ctx.remark({ key: 'acid-pour', severity: 'major', text: L('кислота влита сразу, а не по стенке — слои смешались, кольца на границе нет', 'қышқыл қабырға бойымен емес, бірден құйылды — қабаттар араласты, шекарада сақина жоқ', 'the acid was poured straight in, not down the wall — the layers mixed and there is no ring at the interface'),
      whatif: L('Концентрированная H₂SO₄ тяжелее воды: если приливать её по стенке, она стекает вниз отдельным слоем и фиолетовое кольцо появляется на границе. Струя кислоты сразу смешивается с водой, раствор вскипает от теплоты разбавления и может выплеснуться.', 'Концентрлі H₂SO₄ судан ауыр: қабырға бойымен құйса, ол бөлек қабат болып төмен ағады да, шекарада күлгін сақина пайда болады. Қышқыл ағыны бірден сумен араласады, ерітінді сұйылту жылуынан қайнап, шашырауы мүмкін.', 'Concentrated H₂SO₄ is denser than water: poured down the wall it runs to the bottom as a separate layer and the violet ring appears at the interface. A stream of acid mixes at once, the solution boils from the heat of dilution and may splash out.') });
    if (b.tubes.some((t) => t.shaken)) ctx.remark({ key: 'shake', severity: 'major', text: L('пробирки встряхнуты после прибавления H₂SO₄ — слои перемешались, кольца нет', 'H₂SO₄ қосылғаннан кейін пробиркалар шайқалды — қабаттар араласты, сақина жоқ', 'the tubes were shaken after the H₂SO₄ — the layers mixed and there is no ring'),
      whatif: L('Методичка прямо требует не встряхивать: при смешении слоёв выделяется много тепла, весь раствор темнеет (обугливание сахара), фиолетовое кольцо не образуется, а горячая кислота может выплеснуться из пробирки.', 'Әдістеме шайқамауды тікелей талап етеді: қабаттар араласқанда көп жылу бөлінеді, бүкіл ерітінді қараяды (қанттың көмірленуі), күлгін сақина түзілмейді, ал ыстық қышқыл пробиркадан шашырауы мүмкін.', 'The manual says explicitly not to shake: mixing the layers releases a lot of heat, the whole solution darkens (the sugar chars), no violet ring forms, and hot acid may splash out of the tube.') });
  },
  done: (S, b) => b.tubes.every((t) => t.acid && ((t.p || 0) >= 1 || t.acid === 'pour' || t.shaken)) && L('Картина установилась — запишите наблюдения.', 'Көрініс тұрақтады — бақылауларды жазыңыз.', 'The picture is settled — record the observations.'),
  reset: true,
  hints: [
    L('Порядок по методичке: раствор сахара → 2–3 капли α-нафтола → кислота по стенке наклонённой пробирки.', 'Әдістеме бойынша рет: қант ерітіндісі → 2–3 тамшы α-нафтол → еңкейтілген пробирканың қабырғасымен қышқыл.', 'The order in the manual: sugar solution → 2–3 drops of α-naphthol → acid down the wall of the tilted tube.'),
    L('Кольцо образуется только на границе двух слоёв; кислоту не вливают струёй и пробирки не встряхивают.', 'Сақина тек екі қабаттың шекарасында түзіледі; қышқылды ағынмен құймайды және пробиркаларды шайқамайды.', 'The ring forms only at the boundary between two layers; the acid is not poured in a stream and the tubes are not shaken.'),
    L('Нажмите «Внести по 1 мл», затем «+1 капля» два-три раза, затем «1 мл по стенке» — и подождите ≈ полминуты.', '«1 мл-ден салу», содан кейін «+1 тамшы» екі-үш рет, содан кейін «қабырғамен 1 мл» басыңыз — шамамен жарты минут күтіңіз.', 'Tap “Add 1 mL”, then “+1 drop” two or three times, then “1 mL down the wall” — and wait about half a minute.'),
  ],
};

const s4 = {
  type: 'lab15-record', id: 'rec', key: 'molisch', test: 'molisch', saveAs: 'molisch',
  title: L('Наблюдения: проба Молиша', 'Бақылаулар: Молиш сынамасы', 'Observations: Molisch’s test'),
  instr: L('<p>Опишите, что видно в каждой пробирке. Запишите точно — цвет и где он появился, а не просто «+» или «−».</p>', '<p>Әр пробиркада не көрінетінін сипаттаңыз. Дәл жазыңыз — түсі және ол қай жерде пайда болды, жай ғана «+» немесе «−» емес.</p>', '<p>Describe what you see in each tube. Be precise — the colour and where it appeared, not just “+” or “−”.</p>'),
  need: L('Запишите наблюдение по каждой пробирке', 'Әр пробирка бойынша бақылауды жазыңыз', 'Record the observation for each tube'),
  options: ['ring', 'none', 'green', 'red'],
  why: (t, code) => (code === 'ring' ? L('Конц. H₂SO₄ дегидратирует сахар до производного фурфурола, которое конденсируется с α-нафтолом — фиолетовое кольцо.', 'Конц. H₂SO₄ қантты фурфурол туындысына дейін дегидраттайды, ол α-нафтолмен конденсацияланады — күлгін сақина.', 'Conc. H₂SO₄ dehydrates the sugar to a furfural derivative, which condenses with α-naphthol — the violet ring.') : null),
};

const s5 = {
  type: 'quiz', id: 'q',
  title: L('Вывод по пробе Молиша', 'Молиш сынамасы бойынша қорытынды', 'Conclusion from Molisch’s test'),
  instr: L('<p>Ответьте на вопросы преподавателя.</p>', '<p>Оқытушының сұрақтарына жауап беріңіз.</p>', '<p>Answer the instructor’s questions.</p>'),
  need: L('Ответьте на вопросы', 'Сұрақтарға жауап беріңіз', 'Answer the questions'),
  scene: (S) => benchScene(S, 'molisch'),
  questions: [
    { q: L('Почему пробу Молиша дают все четыре сахара, в том числе сахароза?', 'Неліктен Молиш сынамасын төрт қанттың бәрі, оның ішінде сахароза да береді?', 'Why do all four sugars, including sucrose, give a positive Molisch test?'),
      options: [L('Конц. H₂SO₄ гидролизует гликозидные связи и дегидратирует любые моносахаридные звенья до производных фурфурола', 'Конц. H₂SO₄ гликозидтік байланыстарды гидролиздеп, кез келген моносахарид буындарын фурфурол туындыларына дейін дегидраттайды', 'Conc. H₂SO₄ hydrolyses glycosidic bonds and dehydrates any monosaccharide units to furfural derivatives'), L('Все четыре сахара — восстанавливающие', 'Төрт қанттың бәрі — тотықсыздандырғыш', 'All four sugars are reducing'), L('α-Нафтол окисляет свободную альдегидную группу', 'α-Нафтол бос альдегид тобын тотықтырады', 'α-Naphthol oxidises the free aldehyde group')],
      correct: 0, why: L('Проба Молиша — общая на углеводы: она не различает восстанавливающие и невосстанавливающие сахара.', 'Молиш сынамасы — көмірсуларға жалпы сынама: ол тотықсыздандырғыш және тотықсыздандырмайтын қанттарды ажыратпайды.', 'Molisch’s test is a general test for carbohydrates: it does not distinguish reducing from non-reducing sugars.') },
    { q: L('Что образуется из гексозы при действии конц. H₂SO₄?', 'Конц. H₂SO₄ әсерінен гексозадан не түзіледі?', 'What does a hexose give with conc. H₂SO₄?'),
      options: [L('5-гидроксиметилфурфурол (−3H₂O)', '5-гидроксиметилфурфурол (−3H₂O)', '5-hydroxymethylfurfural (−3H₂O)'), L('Фурфурол (−3H₂O)', 'Фурфурол (−3H₂O)', 'Furfural (−3H₂O)'), L('Глюконовая кислота', 'Глюкон қышқылы', 'Gluconic acid')],
      correct: 0, why: L('Пентозы дают фурфурол, гексозы — 5-гидроксиметилфурфурол (раздел 3.2 методички).', 'Пентозалар фурфурол, гексозалар — 5-гидроксиметилфурфурол береді (әдістеменің 3.2-бөлімі).', 'Pentoses give furfural and hexoses 5-hydroxymethylfurfural (manual, section 3.2).') },
  ],
};

export default {
  id: '1',
  title: L('Проба Молиша (общая реакция на углеводы)', 'Молиш сынамасы (көмірсуларға жалпы реакция)', 'Molisch’s test (general test for carbohydrates)'),
  principle: L('Концентрированная серная кислота дегидратирует углеводы (после гидролиза гликозидных связей) до производных фурфурола, которые конденсируются с α-нафтолом в фиолетовый продукт.', 'Концентрлі күкірт қышқылы көмірсуларды (гликозидтік байланыстар гидролизденгеннен кейін) фурфурол туындыларына дейін дегидраттайды, олар α-нафтолмен конденсацияланып, күлгін өнім түзеді.', 'Concentrated sulfuric acid dehydrates carbohydrates (after hydrolysis of glycosidic bonds) to furfural derivatives, which condense with α-naphthol to form a violet product.'),
  equation: [L('гексоза → 5-гидроксиметилфурфурол (конц. H₂SO₄, −3H₂O); + α-нафтол → фиолетовый продукт конденсации', 'гексоза → 5-гидроксиметилфурфурол (конц. H₂SO₄, −3H₂O); + α-нафтол → күлгін конденсация өнімі', 'hexose → 5-hydroxymethylfurfural (conc. H₂SO₄, −3H₂O); + α-naphthol → violet condensation product')],
  initialState: (a) => baseState(a, { cross: false }),
  checkpoints: [0, 3],
  steps: [s0, s1, s2, s3, s4, s5],
  results: (S) => ({ cells: S.res, cross: !!S.cross }),
  summary: (r) => cellsSummary(r, 'molisch'),
};
