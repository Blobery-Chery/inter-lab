/** Опыт 1. Измерение оптического вращения. Удельное вращение сахарозы. Методичка, раздел 6, опыт 1. */
import { L, n } from '../../app/i18n.js';
import { SUCROSE_LIT, STD_C, sucroseAlpha, specificRotation, concentration } from './model.js';
import { hoodScene, polBench } from './scene.js';

const sg = (x, d = 2) => (x > 0.0049 ? '+' : '') + n(x, d);
const zeroOf = (S) => (S.zero ? S.zero.mean : 0);
const aStd = (S) => (S.std ? S.std.mean - zeroOf(S) : 0);
const aUnk = (S) => (S.unk ? S.unk.mean - zeroOf(S) : 0);
const lS = (S) => (S.std ? S.std.tube : 2), lU = (S) => (S.unk ? S.unk.tube : 2);
const mS = (S) => (S.std ? S.std.mean : 0), mU = (S) => (S.unk ? S.unk.mean : 0);

const s0 = {
  type: 'checklist', id: 'ppe',
  title: L('Рабочее место и средства защиты', 'Жұмыс орны және қорғаныс құралдары', 'Workplace and protective equipment'),
  instr: L('<p>Перед работой подготовьте рабочее место (разделы 2 и 3 правил ТБ): нажмите на каждый нужный пункт. Лишнее не нажимайте.</p><p class="note">Сегодня вы работаете с поляриметром и растворами сахарозы, а в следующих опытах — с едким 1-фенилэтиламином, метанолом и эфиром.</p>',
    '<p>Жұмыс алдында жұмыс орнын дайындаңыз (ҚТ ережелерінің 2 және 3-бөлімдері): әр қажетті тармақты басыңыз. Артығын баспаңыз.</p><p class="note">Бүгін сіз поляриметрмен және сахароза ерітінділерімен, ал келесі тәжірибелерде күйдіргіш 1-фенилэтиламинмен, метанолмен және эфирмен жұмыс істейсіз.</p>',
    '<p>Prepare your workplace before starting (safety rules, sections 2 and 3): tap every item you need. Do not tap anything that is wrong.</p><p class="note">Today you work with the polarimeter and sucrose solutions; the next experiments involve corrosive 1-phenylethylamine, methanol and ether.</p>'),
  need: L('Выполните все нужные пункты', 'Барлық қажетті тармақтарды орындаңыз', 'Complete every required item'),
  scene: hoodScene,
  items: [
    { id: 'coat', label: L('Хлопковый халат застёгнут', 'Мақта мата халат түймеленген', 'Cotton lab coat buttoned'), log: L('Надет и застёгнут хлопковый халат', 'Мақта мата халат киіліп, түймеленді', 'Cotton lab coat on and buttoned') },
    { id: 'gog', label: L('Защитные очки', 'Қорғаныс көзілдірігі', 'Safety goggles'), log: L('Надеты защитные очки', 'Қорғаныс көзілдірігі киілді', 'Safety goggles on') },
    { id: 'hair', label: L('Убрать длинные волосы', 'Ұзын шашты жинау', 'Tie back long hair'), log: L('Волосы убраны', 'Шаш жиналды', 'Hair tied back') },
    { id: 'eye', label: L('Найти фонтанчик для глаз', 'Көз жуатын фонтанды табу', 'Locate the eyewash station'), log: L('Найден фонтанчик для промывания глаз', 'Көз жуатын фонтан табылды', 'Eyewash station located') },
    { id: 'shw', label: L('Найти аварийный душ', 'Апаттық душты табу', 'Locate the safety shower'), log: L('Найден аварийный душ', 'Апаттық душ табылды', 'Safety shower located') },
    { id: 'ext', label: L('Найти огнетушитель', 'Өрт сөндіргішті табу', 'Locate the fire extinguisher'), log: L('Найден огнетушитель', 'Өрт сөндіргіш табылды', 'Fire extinguisher located') },
    { id: 'bag', label: L('Положить сумку на рабочий стол рядом с прибором', 'Сөмкені құралдың жанына жұмыс үстеліне қою', 'Put your bag on the bench next to the instrument'),
      wrong: { severity: 'minor', text: L('личные вещи на рабочем столе (п. 2.7 правил ТБ)', 'жұмыс үстеліндегі жеке заттар (ҚТ ережелерінің 2.7-тармағы)', 'personal belongings on the bench (safety rule 2.7)'),
        whatif: L('Сумка на столе мешает работать, её легко облить раствором, а рядом с поляриметром — задеть и уронить трубку.', 'Үстелдегі сөмке жұмысқа кедергі келтіреді, оған ерітінді төгілуі оңай, ал поляриметрдің жанында түтікті қағып түсіріп алу мүмкін.', 'A bag on the bench gets in the way, is easily splashed and, next to the polarimeter, can knock the tube off.') } },
    { id: 'shoes', label: L('Остаться в открытых сандалиях — опыт ведь безопасный', 'Ашық сандалмен қалу — тәжірибе қауіпсіз ғой', 'Stay in open sandals — the experiment is safe anyway'),
      wrong: { severity: 'safety', text: L('открытая обувь в лаборатории (п. 3.4 правил ТБ)', 'зертханадағы ашық аяқ киім (ҚТ ережелерінің 3.4-тармағы)', 'open footwear in the laboratory (safety rule 3.4)'),
        whatif: L('В этой работе используют 50 % NaOH и едкий амин: капля на открытую стопу — химический ожог. Закрытая обувь обязательна на любом занятии.', 'Бұл жұмыста 50 % NaOH және күйдіргіш амин қолданылады: ашық табанға тамшы түссе — химиялық күйік. Жабық аяқ киім кез келген сабақта міндетті.', 'This work uses 50 % NaOH and a corrosive amine: a drop on a bare foot is a chemical burn. Closed shoes are compulsory in every session.') } },
  ],
};

const s1 = {
  type: 'pick', id: 'kit',
  title: L('Прибор и посуда для поляриметрии', 'Поляриметрияға арналған құрал мен ыдыстар', 'Instrument and glassware for polarimetry'),
  instr: L('<p>Возьмите всё, что нужно для измерения угла вращения растворов сахарозы (ход работы, пп. 1–4), и ничего лишнего.</p><p class="note">Стандартный раствор (0,10 г/мл) и раствор неизвестной концентрации выдаёт преподаватель.</p>',
    '<p>Сахароза ерітінділерінің айналу бұрышын өлшеуге қажеттінің бәрін алыңыз (жұмыс барысы, 1–4-тармақтар), артығын алмаңыз.</p><p class="note">Стандарт ерітіндіні (0,10 г/мл) және концентрациясы белгісіз ерітіндіні оқытушы береді.</p>',
    '<p>Take everything you need to measure the rotation of the sucrose solutions (procedure steps 1–4), and nothing extra.</p><p class="note">The standard solution (0.10 g/mL) and the solution of unknown concentration are provided by the instructor.</p>'),
  need: L('Соберите нужный набор', 'Қажетті жиынтықты жинаңыз', 'Collect the right set'),
  shelf: ['polarimeter', 'polarimeter-tube', 'beaker-100', 'dropping-pipette', 'filter-paper', 'buchner', 'sep-funnel', 'thermometer-100', 'mp-apparatus', 'hot-plate', 'cylinder-25'],
  take: ['polarimeter', 'polarimeter-tube', 'beaker-100', 'dropping-pipette', 'filter-paper'],
  hint1: L('Нужны сам прибор, трубки, стаканчики для растворов и воды, пипетка для заполнения трубки и мягкая бумага, чтобы осушить торцевые стёкла. Нагрев и фильтрование здесь не нужны.', 'Құралдың өзі, түтіктер, ерітінділер мен суға арналған стақаншалар, түтікті толтыруға пипетка және шеткі шыныларды құрғатуға жұмсақ қағаз қажет. Қыздыру мен сүзу мұнда керек емес.', 'You need the instrument itself, the tubes, small beakers for the solutions and water, a pipette to fill the tube and soft paper to dry the end glasses. No heating or filtration is needed here.'),
  scene: () => polBench(),
};

const s2 = {
  type: 'lab12-polarimeter', id: 'zero', zero: true, liquid: 'water',
  title: L('Нулевая точка поляриметра', 'Поляриметрдің нөлдік нүктесі', 'Zero point of the polarimeter'),
  instr: L('<ol><li>Включите натриевую лампу и дайте ей прогреться.</li><li>Заполните трубку <b>дистиллированной водой</b> без пузырьков воздуха.</li><li>Поворачивая анализатор, добейтесь одинаковой яркости обеих половин поля зрения и снимите отсчёт по нониусу. Это нулевая точка — её вычитают из всех отсчётов.</li></ol><p class="note">Вода оптически неактивна: при исправном приборе отсчёт близок к 0°.</p>',
    '<ol><li>Натрий шамын қосып, қызуына мүмкіндік беріңіз.</li><li>Түтікті ауа көпіршіктерінсіз <b>дистилденген сумен</b> толтырыңыз.</li><li>Анализаторды бұрай отырып, көру өрісінің екі жартысының жарықтығын бірдей етіп, нониус бойынша есепті алыңыз. Бұл нөлдік нүкте — оны барлық есептерден шегереді.</li></ol><p class="note">Су оптикалық белсенді емес: құрал дұрыс болса, есеп 0°-қа жақын.</p>',
    '<ol><li>Switch on the sodium lamp and let it warm up.</li><li>Fill the tube with <b>distilled water</b> without air bubbles.</li><li>Turn the analyser until both halves of the field are equally bright and take the vernier reading. This is the zero point — it is subtracted from every reading.</li></ol><p class="note">Water is optically inactive: on a working instrument the reading is close to 0°.</p>'),
  need: L('Определите нулевую точку', 'Нөлдік нүктені анықтаңыз', 'Find the zero point'),
  sample: L('дистиллированная вода', 'дистилденген су', 'distilled water'), color: 'var(--liquid)',
  tubes: [2], tube: 2, readings: 1, saveAs: 'zero',
};

const s3 = {
  type: 'lab12-polarimeter', id: 'std', liquid: 'std',
  title: L('Стандартный раствор сахарозы, 0,10 г/мл', 'Сахарозаның стандарт ерітіндісі, 0,10 г/мл', 'Standard sucrose solution, 0.10 g/mL'),
  instr: L('<ol><li>Слейте воду. Ополосните трубку 2–3 раза небольшими порциями стандартного раствора.</li><li>Заполните трубку <b>2 дм</b> стандартным раствором (0,10 г/мл), избегая пузырьков воздуха.</li><li>Измерьте угол вращения <b>три раза</b> (после каждого отсчёта отведите анализатор и найдите равенство полей заново); возьмите среднее.</li></ol>',
    '<ol><li>Суды төгіңіз. Түтікті стандарт ерітіндінің аз порцияларымен 2–3 рет шайыңыз.</li><li><b>2 дм</b> түтікті ауа көпіршіктерінен сақтана отырып стандарт ерітіндімен (0,10 г/мл) толтырыңыз.</li><li>Айналу бұрышын <b>үш рет</b> өлшеңіз (әр есептен кейін анализаторды бұрып, өрістер теңдігін қайта табыңыз); орташасын алыңыз.</li></ol>',
    '<ol><li>Empty the water. Rinse the tube 2–3 times with small portions of the standard solution.</li><li>Fill the <b>2 dm</b> tube with the standard solution (0.10 g/mL), avoiding air bubbles.</li><li>Measure the angle of rotation <b>three times</b> (after each reading turn the analyser away and find the equal fields again); take the mean.</li></ol>'),
  need: L('Снимите три отсчёта', 'Үш есеп алыңыз', 'Take three readings'),
  sample: L('стандарт сахарозы 0,10 г/мл', 'сахароза стандарты 0,10 г/мл', 'sucrose standard 0.10 g/mL'), color: 'rgba(180,210,230,.6)',
  tubes: [1, 2], tube: 2, readings: 3, saveAs: 'std',
  wrongTube: { severity: 'minor', text: L('взята трубка 1 дм вместо 2 дм: угол вдвое меньше, относительная погрешность больше', '2 дм орнына 1 дм түтік алынды: бұрыш екі есе кіші, салыстырмалы қателік көбірек', '1 dm tube used instead of 2 dm: the angle is halved and the relative error is larger') },
  alpha: (S, tube, lc) => sucroseAlpha(STD_C, tube, { dil: lc.dil ? S.dilFrac : 0 }),
  onFill(S, lc, ctx) {
    if (lc.dil) ctx.remark({ key: 'rinse-std', severity: 'major', text: L('трубку не ополоснули стандартным раствором — он разбавлен остатками воды', 'түтік стандарт ерітіндімен шайылмады — ол су қалдықтарымен сұйылды', 'the tube was not rinsed with the standard — it was diluted by the water left inside'),
      whatif: L('В трубке остаются капли воды: концентрация в трубке становится меньше 0,10 г/мл, угол — меньше, а удельное вращение, рассчитанное для c = 0,10 г/мл, получится заниженным.', 'Түтікте су тамшылары қалады: түтіктегі концентрация 0,10 г/мл-ден аз болады, бұрыш кішірейеді, ал c = 0,10 г/мл үшін есептелген меншікті айналу төмен шығады.', 'Drops of water remain in the tube: the concentration inside drops below 0.10 g/mL, the angle is smaller, and the specific rotation calculated for c = 0.10 g/mL comes out too low.') });
  },
};

const s4 = {
  type: 'calc', id: 'spec',
  title: L('Удельное вращение сахарозы', 'Сахарозаның меншікті айналуы', 'Specific rotation of sucrose'),
  instr: L('<p>По своим отсчётам рассчитайте исправленный угол вращения (среднее минус нулевая точка) и удельное вращение сахарозы.</p><p class="note">[α] = α / (l · c); α — °, l — дм, c — г/мл.</p>',
    '<p>Өз есептеріңіз бойынша түзетілген айналу бұрышын (орташа минус нөлдік нүкте) және сахарозаның меншікті айналуын есептеңіз.</p><p class="note">[α] = α / (l · c); α — °, l — дм, c — г/мл.</p>',
    '<p>From your readings calculate the corrected angle of rotation (mean minus the zero point) and the specific rotation of sucrose.</p><p class="note">[α] = α / (l · c); α in °, l in dm, c in g/mL.</p>'),
  need: L('Рассчитайте [α]', '[α] есептеңіз', 'Calculate [α]'),
  fields: [
    { id: 'a', label: L('Угол вращения α (исправленный)', 'Айналу бұрышы α (түзетілген)', 'Angle of rotation α (corrected)'), unit: '°', decimals: 2, tol: 0.01, answer: aStd,
      formula: (S) => L(`α = ${sg(mS(S))} − (${sg(zeroOf(S))})`, `α = ${sg(mS(S))} − (${sg(zeroOf(S))})`, `α = ${sg(mS(S))} − (${sg(zeroOf(S))})`),
      hint1: L('Возьмите среднее из трёх отсчётов и вычтите нулевую точку (отсчёт с водой).', 'Үш есептің орташасын алып, нөлдік нүктені (сумен алынған есеп) шегеріңіз.', 'Take the mean of the three readings and subtract the zero point (the reading with water).') },
    { id: 'spec', label: L('Удельное вращение [α]', 'Меншікті айналу [α]', 'Specific rotation [α]'), unit: '°', decimals: 1, tol: 0.01, answer: (S) => specificRotation(aStd(S), lS(S), STD_C),
      formula: (S) => L(`[α] = ${sg(aStd(S))} / (${lS(S)} × 0.10)`, `[α] = ${sg(aStd(S))} / (${lS(S)} × 0.10)`, `[α] = ${sg(aStd(S))} / (${lS(S)} × 0.10)`),
      hint1: L('l — длина трубки в дециметрах, c — в г/мл.', 'l — түтік ұзындығы дециметрмен, c — г/мл-мен.', 'l is the tube length in decimetres, c is in g/mL.') },
  ],
  saveAs: 'calcStd',
};

const s5 = {
  type: 'observe', id: 'cmp',
  title: L('Сравнение с литературным значением', 'Әдебиеттегі мәнмен салыстыру', 'Comparison with the literature value'),
  instr: L('<p>Сравните найденное удельное вращение с литературным значением для сахарозы <b>[α]D20 = +66,5°</b>.</p>', '<p>Табылған меншікті айналуды сахароза үшін әдебиеттегі <b>[α]D20 = +66,5°</b> мәнімен салыстырыңыз.</p>', '<p>Compare the specific rotation you found with the literature value for sucrose, <b>[α]D20 = +66.5°</b>.</p>'),
  need: L('Сделайте вывод', 'Қорытынды жасаңыз', 'Draw the conclusion'),
  question: L('Что показывает сравнение?', 'Салыстыру нені көрсетеді?', 'What does the comparison show?'),
  options: [
    { id: 'ok', label: L('Совпадает с +66,5° в пределах 2–3 %: измерение выполнено правильно, прибор исправен', '+66,5°-пен 2–3 % шегінде сәйкес келеді: өлшеу дұрыс орындалды, құрал дұрыс', 'Agrees with +66.5° within 2–3 %: the measurement is correct and the instrument works') },
    { id: 'low', label: L('Заметно меньше +66,5°: систематическая ошибка — раствор в трубке разбавлен (трубку не ополоснули) или мешал пузырёк', '+66,5°-тан айтарлықтай аз: жүйелі қате — түтіктегі ерітінді сұйылған (түтік шайылмаған) немесе көпіршік кедергі келтірген', 'Clearly below +66.5°: a systematic error — the solution in the tube was diluted (the tube was not rinsed) or a bubble interfered') },
    { id: 'high', label: L('Заметно больше +66,5°: неверно учтён нуль или мешал пузырёк', '+66,5°-тан айтарлықтай көп: нөл дұрыс ескерілмеген немесе көпіршік кедергі келтірген', 'Clearly above +66.5°: the zero was handled wrongly or a bubble interfered') },
    { id: 'neg', label: L('Знак отрицательный: сахароза левовращающая', 'Таңбасы теріс: сахароза солға айналдырады', 'The sign is negative: sucrose is laevorotatory') },
  ],
  correct: (S) => { const s = specificRotation(aStd(S), lS(S), STD_C), d = (s - SUCROSE_LIT) / SUCROSE_LIT; return Math.abs(d) <= 0.03 ? 'ok' : d < 0 ? 'low' : 'high'; },
  why: (S) => L(`Найдено ${sg(specificRotation(aStd(S), lS(S), STD_C), 1)}° при лит. +66,5°.`, `Табылғаны ${sg(specificRotation(aStd(S), lS(S), STD_C), 1)}°, әдеб. +66,5°.`, `Found ${sg(specificRotation(aStd(S), lS(S), STD_C), 1)}° vs lit. +66.5°.`),
  scene: () => polBench(),
};

const s6 = {
  type: 'lab12-polarimeter', id: 'unk', liquid: 'unk',
  title: L('Раствор сахарозы неизвестной концентрации', 'Концентрациясы белгісіз сахароза ерітіндісі', 'Sucrose solution of unknown concentration'),
  instr: L('<ol><li>Слейте стандартный раствор, ополосните трубку исследуемым раствором.</li><li>Заполните трубку 2 дм раствором неизвестной концентрации и так же снимите <b>три отсчёта</b>.</li></ol>',
    '<ol><li>Стандарт ерітіндіні төгіп, түтікті зерттелетін ерітіндімен шайыңыз.</li><li>2 дм түтікті концентрациясы белгісіз ерітіндімен толтырып, дәл солай <b>үш есеп</b> алыңыз.</li></ol>',
    '<ol><li>Empty the standard and rinse the tube with the sample.</li><li>Fill the 2 dm tube with the solution of unknown concentration and take <b>three readings</b> in the same way.</li></ol>'),
  need: L('Снимите три отсчёта', 'Үш есеп алыңыз', 'Take three readings'),
  sample: L('сахароза, неизвестная концентрация', 'сахароза, белгісіз концентрация', 'sucrose, unknown concentration'), color: 'rgba(180,210,230,.5)',
  tubes: [1, 2], tube: 2, readings: 3, saveAs: 'unk',
  wrongTube: { severity: 'minor', text: L('взята трубка 1 дм вместо 2 дм: угол вдвое меньше, относительная погрешность больше', '2 дм орнына 1 дм түтік алынды: бұрыш екі есе кіші, салыстырмалы қателік көбірек', '1 dm tube used instead of 2 dm: the angle is halved and the relative error is larger') },
  alpha: (S, tube, lc) => sucroseAlpha(S.cU, tube, { mixStd: lc.dil ? S.dilFrac : 0 }),
  onFill(S, lc, ctx) {
    if (lc.dil) ctx.remark({ key: 'rinse-unk', severity: 'major', text: L('трубку не ополоснули исследуемым раствором — в него попали остатки стандарта', 'түтік зерттелетін ерітіндімен шайылмады — оған стандарттың қалдықтары түсті', 'the tube was not rinsed with the sample — it was contaminated by the remaining standard'),
      whatif: L('Остатки стандартного раствора (0,10 г/мл) смешиваются с исследуемым: найденная концентрация смещается к 0,10 г/мл.', 'Стандарт ерітіндінің (0,10 г/мл) қалдықтары зерттелетінмен араласады: табылған концентрация 0,10 г/мл-ге қарай ығысады.', 'The remaining standard (0.10 g/mL) mixes with the sample: the concentration found is biased towards 0.10 g/mL.') });
  },
};

const s7 = {
  type: 'calc', id: 'conc',
  title: L('Концентрация неизвестного раствора', 'Белгісіз ерітіндінің концентрациясы', 'Concentration of the unknown solution'),
  instr: L('<p>Рассчитайте исправленный угол и концентрацию раствора по литературному удельному вращению сахарозы (+66,5°).</p><p class="note">c = α / ([α] · l)</p>',
    '<p>Түзетілген бұрышты және сахарозаның әдебиеттегі меншікті айналуы (+66,5°) бойынша ерітінді концентрациясын есептеңіз.</p><p class="note">c = α / ([α] · l)</p>',
    '<p>Calculate the corrected angle and the concentration of the solution from the literature specific rotation of sucrose (+66.5°).</p><p class="note">c = α / ([α] · l)</p>'),
  need: L('Рассчитайте концентрацию', 'Концентрацияны есептеңіз', 'Calculate the concentration'),
  fields: [
    { id: 'a', label: L('Угол вращения α (исправленный)', 'Айналу бұрышы α (түзетілген)', 'Angle of rotation α (corrected)'), unit: '°', decimals: 2, tol: 0.01, answer: aUnk,
      formula: (S) => L(`α = ${sg(mU(S))} − (${sg(zeroOf(S))})`, `α = ${sg(mU(S))} − (${sg(zeroOf(S))})`, `α = ${sg(mU(S))} − (${sg(zeroOf(S))})`) },
    { id: 'c', label: L('Концентрация c', 'Концентрация c', 'Concentration c'), unit: L('г/мл', 'г/мл', 'g/mL'), decimals: 4, tol: 0.01, answer: (S) => concentration(aUnk(S), SUCROSE_LIT, lU(S)),
      formula: (S) => L(`c = ${sg(aUnk(S))} / (66.5 × ${lU(S)})`, `c = ${sg(aUnk(S))} / (66.5 × ${lU(S)})`, `c = ${sg(aUnk(S))} / (66.5 × ${lU(S)})`) },
  ],
  saveAs: 'calcUnk',
};

const s8 = {
  type: 'cleanup', id: 'clean',
  title: L('Уборка после поляриметрии', 'Поляриметриядан кейін жинау', 'Cleaning up after polarimetry'),
  instr: L('<p>Трубки поляриметра моют сразу после работы (раздел 7 методички). Утилизируйте растворы, выключите лампу.</p><p class="note">Разбавленные водные растворы сахарозы не опасны и сливаются в раковину с водой.</p>',
    '<p>Поляриметр түтіктерін жұмыстан кейін бірден жуады (әдістеменің 7-бөлімі). Ерітінділерді кәдеге жаратып, шамды өшіріңіз.</p><p class="note">Сахарозаның сұйылтылған сулы ерітінділері қауіпсіз, оларды сумен бірге раковинаға төгеді.</p>',
    '<p>Polarimeter tubes are cleaned immediately after use (manual, section 7). Dispose of the solutions and switch off the lamp.</p><p class="note">Dilute aqueous sucrose solutions are harmless and go down the sink with water.</p>'),
  need: L('Уберите рабочее место', 'Жұмыс орнын жинаңыз', 'Clean up the bench'),
  bins: ['sink', 'organic', 'acid', 'solid', 'trash'],
  items: [
    { id: 'suc', bin: 'sink', label: L('Остатки растворов сахарозы', 'Сахароза ерітінділерінің қалдықтары', 'Leftover sucrose solutions'),
      wrong: { organic: { severity: 'minor', text: L('водный раствор сахарозы слит в ёмкость для органических растворителей', 'сахарозаның сулы ерітіндісі органикалық еріткіштер ыдысына төгілді', 'aqueous sucrose solution poured into the organic solvent waste'), whatif: L('Ёмкость для растворителей заполняется водой без нужды; водные неопасные растворы туда не сливают.', 'Еріткіштер ыдысы қажетсіз сумен толады; сулы қауіпсіз ерітінділерді оған төкпейді.', 'The solvent container fills up with water for no reason; harmless aqueous solutions do not go there.') } } },
    { id: 'tissue', bin: 'trash', label: L('Бумага, которой осушали торцевые стёкла', 'Шеткі шыныларды құрғатқан қағаз', 'Paper used to dry the end glasses') },
  ],
  switches: [
    { id: 'tube', label: L('Сразу промыть трубки дистиллированной водой и осушить', 'Түтіктерді бірден дистилденген сумен жуып, құрғату', 'Rinse the tubes with distilled water at once and dry them'), log: L('Трубки поляриметра промыты дистиллированной водой и осушены (сахароза при высыхании оставляет липкий налёт на стёклах)', 'Поляриметр түтіктері дистилденген сумен жуылып, құрғатылды (сахароза кепкенде шыныларда жабысқақ қабат қалдырады)', 'Polarimeter tubes rinsed with distilled water and dried (sucrose leaves a sticky film on the glasses when it dries)') },
    { id: 'lamp', label: L('Выключить лампу поляриметра', 'Поляриметр шамын өшіру', 'Switch off the polarimeter lamp') },
    { id: 'hands', label: L('Вымыть руки', 'Қолды жуу', 'Wash your hands') },
  ],
};

export default {
  id: '1',
  title: L('Измерение оптического вращения. Удельное вращение сахарозы', 'Оптикалық айналуды өлшеу. Сахарозаның меншікті айналуы', 'Measurement of optical rotation. Specific rotation of sucrose'),
  principle: L('Угол вращения плоскости поляризации пропорционален концентрации оптически активного вещества и длине трубки. По измеренному углу рассчитывают удельное вращение — характеристическую константу — или неизвестную концентрацию.',
    'Поляризация жазықтығының айналу бұрышы оптикалық белсенді заттың концентрациясына және түтік ұзындығына пропорционал. Өлшенген бұрыш бойынша меншікті айналуды — сипаттамалық тұрақтыны — немесе белгісіз концентрацияны есептейді.',
    'The angle of rotation of plane-polarised light is proportional to the concentration of the optically active substance and to the length of the tube. From the measured angle the specific rotation — a characteristic constant — or an unknown concentration can be calculated.'),
  equation: ['[α] = α / (l · c)', 'c = α / ([α] · l)'],
  initialState: ({ rng }) => ({
    pol: { zero: +(Math.round(rng.range(-0.15, 0.15) / 0.05) * 0.05).toFixed(2), lamp: false, last: null },
    cU: +rng.range(0.045, 0.085).toFixed(3), dilFrac: +rng.range(0.025, 0.04).toFixed(3),
    zero: null, std: null, unk: null,
  }),
  checkpoints: [0],
  steps: [s0, s1, s2, s3, s4, s5, s6, s7, s8],
  results(S) {
    const a1 = aStd(S), a2 = aUnk(S);
    const spec = S.std ? specificRotation(a1, lS(S), STD_C) : null;
    return {
      zero: S.zero ? S.zero.mean : 0, zeroTrue: S.pol.zero,
      std: S.std, unk: S.unk, aStd: a1, aUnk: a2, spec,
      cUnk: S.unk ? concentration(a2, SUCROSE_LIT, lU(S)) : null, cTrue: S.cU,
      lStd: S.std ? lS(S) : 2, lUnk: S.unk ? lU(S) : 2,
    };
  },
  summary: (r) => [
    { label: L('Нуль прибора', 'Құрал нөлі', 'Instrument zero'), value: sg(r.zero) + '°' },
    { label: L('[α] сахарозы', 'Сахароза [α]', '[α] of sucrose'), value: r.spec != null ? sg(r.spec, 1) + '°' : '—', st: r.spec != null && Math.abs(r.spec - SUCROSE_LIT) / SUCROSE_LIT <= 0.03 ? 'ok' : 'warn' },
    { label: L('c неизвестного', 'Белгісіздің c', 'c of unknown'), value: r.cUnk != null ? { ru: n(r.cUnk, 4) + ' г/мл', kk: n(r.cUnk, 4) + ' г/мл', en: n(r.cUnk, 4) + ' g/mL' } : '—' },
  ],
};
