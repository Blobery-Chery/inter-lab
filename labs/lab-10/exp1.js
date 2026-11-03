/** Опыт 1. Реакции щавелевой кислоты. Методичка, раздел 6, опыт 1. */
import { L, n } from '../../app/i18n.js';
import { relax } from '../../app/instruments/thermal.js';
import { kmno4Rate, kmno4Color, DROP } from './model.js';
import { perTube } from './util.js';
import { tubesScene, bathScene, hoodScene } from './scene.js';

const WHITE = 'var(--solid)', BROWN = '#7a4a1e';

/* ---------- 1. Рабочее место ---------- */
const s0 = {
  type: 'checklist', id: 'ppe',
  title: L('Рабочее место и средства защиты', 'Жұмыс орны және қорғаныс құралдары', 'Workplace and protective equipment'),
  instr: L('<p>В этой работе — фенолы (токсичны, вызывают ожоги и быстро всасываются через кожу), бромная вода (ядовитые пары брома), щавелевая кислота, KMnO₄, растворы NaOH и KOH. Наденьте средства защиты, включите тягу и найдите средства аварийной защиты. Лишнее не нажимайте.</p>',
    '<p>Бұл жұмыста — фенолдар (улы, күйік шалдырады және тері арқылы тез сіңеді), бромды су (бромның улы булары), щавель қышқылы, KMnO₄, NaOH және KOH ерітінділері. Қорғаныс құралдарын киіп, тартымды қосыңыз және апаттық қорғаныс құралдарын табыңыз. Артығын баспаңыз.</p>',
    '<p>This work involves phenols (toxic, cause burns and are rapidly absorbed through the skin), bromine water (toxic bromine vapour), oxalic acid, KMnO₄, and NaOH and KOH solutions. Put on your protective equipment, switch on the hood and locate the emergency equipment. Do not tap anything that is wrong.</p>'),
  need: L('Выполните все нужные пункты', 'Барлық қажетті тармақтарды орындаңыз', 'Complete every required item'),
  scene: hoodScene,
  items: [
    { id: 'coat', label: L('Халат застёгнут', 'Халат түймеленген', 'Lab coat buttoned'), log: L('Надет и застёгнут хлопковый халат', 'Мақта мата халат киіліп, түймеленді', 'Cotton lab coat on and buttoned') },
    { id: 'gog', label: L('Защитные очки', 'Қорғаныс көзілдірігі', 'Safety goggles'), log: L('Надеты защитные очки', 'Қорғаныс көзілдірігі киілді', 'Safety goggles on') },
    { id: 'glv', label: L('Перчатки нитриловые', 'Нитрил қолғаптар', 'Nitrile gloves'), log: L('Надеты нитриловые перчатки (фенол всасывается через кожу)', 'Нитрил қолғаптар киілді (фенол тері арқылы сіңеді)', 'Nitrile gloves on (phenol is absorbed through the skin)') },
    { id: 'hood', label: L('Включить тягу шкафа, опустить экран', 'Шкаф тартымын қосып, экранды түсіру', 'Switch on the hood, lower the sash'), log: L('Включена тяга вытяжного шкафа: бромная вода — только под тягой', 'Тартпа шкафтың тартымы қосылды: бромды сумен тек тартымда жұмыс істейді', 'Fume hood switched on: bromine water is handled only under the hood') },
    { id: 'eye', label: L('Найти фонтанчик для глаз', 'Көз жуатын фонтанды табу', 'Locate the eyewash station'), log: L('Найден фонтанчик для промывания глаз', 'Көз жуатын фонтан табылды', 'Eyewash station located') },
    { id: 'shw', label: L('Найти аварийный душ', 'Апаттық душты табу', 'Locate the safety shower'), log: L('Найден аварийный душ', 'Апаттық душ табылды', 'Safety shower located') },
    { id: 'ext', label: L('Найти огнетушитель', 'Өрт сөндіргішті табу', 'Locate the fire extinguisher'), log: L('Найден огнетушитель', 'Өрт сөндіргіш табылды', 'Fire extinguisher located') },
    { id: 'waste', label: L('Ёмкости для фенольных и бромсодержащих отходов', 'Фенолды және бромды қалдықтарға арналған ыдыстар', 'Containers for phenol and bromine waste'), log: L('Подготовлены ёмкости для фенол- и бромсодержащих отходов', 'Фенол және бром бар қалдықтарға арналған ыдыстар дайындалды', 'Containers for phenol- and bromine-containing waste are ready') },
    { id: 'lens', label: L('Работать в контактных линзах вместо очков', 'Көзілдіріктің орнына контакт линзаларымен жұмыс істеу', 'Work in contact lenses instead of goggles'),
      wrong: { severity: 'safety', text: L('попытка работать в контактных линзах без защитных очков (п. 3.2 правил ТБ)', 'қорғаныс көзілдірігінсіз контакт линзаларымен жұмыс істеу әрекеті (ҚТ ережелерінің 3.2-тармағы)', 'tried to work in contact lenses without goggles (safety rule 3.2)'),
        whatif: L('Пары брома скапливаются под линзой, а брызги щёлочи или фенола попадают прямо в глаз — тяжёлый химический ожог роговицы. Очки обязательны при любой работе с реактивами.', 'Бром булары линза астына жиналады, ал сілті немесе фенол шашырандылары тікелей көзге түседі — қасаңқабықтың ауыр химиялық күйігі. Реактивтермен кез келген жұмыста көзілдірік міндетті.', 'Bromine vapour collects under the lens, and splashes of alkali or phenol go straight into the eye — a severe chemical burn of the cornea. Goggles are compulsory for any work with reagents.') } },
    { id: 'mouth', label: L('Набирать растворы пипеткой ртом — так точнее', 'Ерітінділерді пипеткамен аузымен тарту — дәлірек', 'Fill the pipette by mouth — it is more accurate'),
      wrong: { severity: 'safety', text: L('намерение набирать растворы пипеткой ртом (п. 2.5 правил ТБ)', 'ерітінділерді пипеткамен аузымен тарту ниеті (ҚТ ережелерінің 2.5-тармағы)', 'intended to fill a pipette by mouth (safety rule 2.5)'),
        whatif: L('Фенол, щавелевая кислота и щёлочи попадут в рот: фенол вызывает ожог слизистой и всасывается, щавелевая кислота ядовита при проглатывании (связывает кальций). Только груша или дозатор.', 'Фенол, щавель қышқылы және сілтілер ауызға түседі: фенол сілемейлі қабықты күйдіріп, сіңеді, щавель қышқылы жұтқанда улы (кальцийді байланыстырады). Тек алмұрт немесе дозатор.', 'Phenol, oxalic acid and alkalis would get into your mouth: phenol burns the mucosa and is absorbed, oxalic acid is toxic if swallowed (it binds calcium). Use only a bulb or a dispenser.') } },
    { id: 'tea', label: L('Поставить рядом чай, чтобы не отвлекаться', 'Алаңдамау үшін жанына шай қою', 'Keep a cup of tea nearby'),
      wrong: { severity: 'safety', text: L('напитки на рабочем месте (п. 2.2 правил ТБ)', 'жұмыс орнындағы сусындар (ҚТ ережелерінің 2.2-тармағы)', 'drinks at the workplace (safety rule 2.2)'),
        whatif: L('Еда и напитки в лаборатории запрещены: в чашку попадают брызги и пары реактивов, а кружку легко перепутать с химическим стаканом.', 'Зертханада тамақ пен сусындарға тыйым салынған: кесеге реактив шашырандылары мен булары түседі, ал кесені химиялық стақанмен шатастыру оңай.', 'Food and drink are forbidden in the lab: splashes and vapours get into the cup, and a mug is easily confused with a beaker.') } },
  ],
};

/* ---------- 2. Посуда ---------- */
const s1 = {
  type: 'pick', id: 'kit',
  title: L('Посуда и приборы', 'Ыдыстар мен құралдар', 'Glassware and instruments'),
  instr: L('<p>Возьмите с полки всё, что нужно для качественных проб этой работы (раздел 5 методички), и ничего лишнего.</p><p class="note">Водяную баню нагревают до 60–70 °C — нужен термометр.</p>',
    '<p>Сөреден осы жұмыстың сапалық сынамаларына қажеттінің бәрін алыңыз (әдістеменің 5-бөлімі), артығын алмаңыз.</p><p class="note">Су моншасын 60–70 °C-қа дейін қыздырады — термометр қажет.</p>',
    '<p>Take from the shelf everything you need for the qualitative tests of this work (manual, section 5) and nothing extra.</p><p class="note">The water bath is heated to 60–70 °C — you need a thermometer.</p>'),
  need: L('Соберите нужный набор', 'Қажетті жиынтықты жинаңыз', 'Collect the right set'),
  shelf: ['test-tube', 'tube-rack', 'dropping-pipette', 'graduated-pipette', 'water-bath', 'glass-rod', 'indicator-paper', 'thermometer-100', 'buchner', 'rbf-50', 'reflux-condenser', 'sep-funnel', 'mp-apparatus', 'balance', 'polarimeter-tube', 'heating-mantle'],
  take: ['test-tube', 'tube-rack', 'dropping-pipette', 'graduated-pipette', 'water-bath', 'glass-rod', 'indicator-paper', 'thermometer-100'],
  hint1: L('Все опыты — пробирочные: пробирки и штатив, пипетки (мерная и капельная), стеклянная палочка, индикаторная бумага и водяная баня с термометром. Синтеза и перегонки нет.', 'Барлық тәжірибелер — пробиркалық: пробиркалар мен штатив, пипеткалар (өлшегіш және тамшуыр), шыны таяқша, индикатор қағазы және термометрі бар су моншасы. Синтез бен айдау жоқ.', 'All experiments are test-tube tests: tubes and a rack, pipettes (graduated and dropping), a glass rod, indicator paper and a water bath with a thermometer. There is no synthesis or distillation.'),
};

/* ---------- 3. CaCl₂ ---------- */
const tubesA = [{ id: 'A', label: L('Пробирка 1', '1-пробирка', 'Tube 1'), short: '1' }, { id: 'B', label: L('Пробирка 2', '2-пробирка', 'Tube 2'), short: '2' }];
const s2 = {
  type: 'test', id: 'cacl2',
  title: L('Оксалат кальция', 'Кальций оксалаты', 'Calcium oxalate'),
  instr: L('<ol><li>К <b>1 мл</b> раствора щавелевой кислоты (5 %) прилейте <b>1 мл</b> раствора CaCl₂ (5 %).</li><li>Разделите осадок на две пробирки.</li><li>В одну прилейте разбавленную уксусную кислоту, в другую — разбавленную HCl.</li></ol>',
    '<ol><li><b>1 мл</b> щавель қышқылы ерітіндісіне (5 %) <b>1 мл</b> CaCl₂ ерітіндісін (5 %) құйыңыз.</li><li>Тұнбаны екі пробиркаға бөліңіз.</li><li>Біреуіне сұйылтылған сірке қышқылын, екіншісіне — сұйылтылған HCl құйыңыз.</li></ol>',
    '<ol><li>To <b>1 mL</b> of oxalic acid solution (5 %) add <b>1 mL</b> of CaCl₂ solution (5 %).</li><li>Divide the precipitate between two tubes.</li><li>Add dilute acetic acid to one tube and dilute HCl to the other.</li></ol>'),
  need: L('Проверьте растворимость осадка в CH₃COOH и HCl', 'Тұнбаның CH₃COOH пен HCl-да ерігіштігін тексеріңіз', 'Test the precipitate in CH₃COOH and in HCl'),
  tubes: tubesA, reset: true,
  reagents: perTube([
    { id: 'ox', group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('Щавелевая кислота 5 %: 1 мл', 'Щавель қышқылы 5 %: 1 мл', 'Oxalic acid 5 %: 1 mL'), advance: 20, disabled: (t) => t.ox,
      apply(t, S, ctx) {
        t.ox = 1; t.v += 1;
        ctx.log(L('В пробирку отмерен 1 мл 5 % раствора щавелевой кислоты', 'Пробиркаға 5 % щавель қышқылы ерітіндісінің 1 мл өлшенді', '1 mL of 5 % oxalic acid solution measured into the tube'));
        if (t.ca && !t.hcl) precipitate(t, ctx);
      } },
    { id: 'ca', group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('CaCl₂ 5 %: 1 мл', 'CaCl₂ 5 %: 1 мл', 'CaCl₂ 5 %: 1 mL'), advance: 20, disabled: (t) => t.ca,
      apply(t, S, ctx) {
        t.ca = 1; t.v += 1;
        ctx.log(L('Прилит 1 мл 5 % раствора CaCl₂', '5 % CaCl₂ ерітіндісінің 1 мл құйылды', '1 mL of 5 % CaCl₂ solution added'));
        if (!t.ox) return;
        if (t.hcl) {
          ctx.remark({ key: 'ox_order', severity: 'minor', text: L('нарушен порядок реактивов: HCl прилита до CaCl₂ — оксалат кальция в минеральной кислоте не осаждается', 'реактивтер реті бұзылды: HCl CaCl₂-ден бұрын құйылды — кальций оксалаты минералдық қышқылда тұнбаға түспейді', 'wrong order of reagents: HCl added before CaCl₂ — calcium oxalate does not precipitate in a mineral acid') });
          ctx.log(L('Осадок не образуется: раствор прозрачный (в пробирке уже есть HCl)', 'Тұнба түзілмейді: ерітінді мөлдір (пробиркада HCl бар)', 'No precipitate: the solution stays clear (the tube already contains HCl)'), 'obs');
          ctx.feedback(L('Осадка нет: в сильнокислой среде CaC₂O₄ растворим. Вылейте и повторите пробу в правильном порядке.', 'Тұнба жоқ: күшті қышқыл ортада CaC₂O₄ ериді. Төгіп, сынаманы дұрыс ретпен қайталаңыз.', 'No precipitate: CaC₂O₄ dissolves in strongly acidic solution. Empty the tube and repeat in the right order.'), 'bad');
        } else precipitate(t, ctx);
      } },
    { id: 'split', group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('Разделить осадок на две пробирки', 'Тұнбаны екі пробиркаға бөлу', 'Divide the precipitate between two tubes'), advance: 30,
      disabled: (t, S, local) => Object.values(local.tubes).some((x) => x.split) || !Object.values(local.tubes).some((x) => x.ppt > 0.1),
      apply(t, S, ctx, id, local) {
        const ids = Object.keys(local.tubes);
        const src = ids.find((k) => local.tubes[k].ppt > 0.1), dst = ids.find((k) => k !== src && !local.tubes[k].v);
        if (!src || !dst) { ctx.feedback(L('Нужна пробирка с осадком и пустая пробирка.', 'Тұнбасы бар пробирка және бос пробирка қажет.', 'You need a tube with the precipitate and an empty tube.'), 'warn'); return; }
        const s = local.tubes[src];
        s.v /= 2; s.split = true; s.had = true;
        local.tubes[dst] = { ...s, added: ['split'] };
        ctx.log(L('Осадок с раствором разделён поровну на две пробирки', 'Тұнба ерітіндісімен екі пробиркаға тең бөлінді', 'The precipitate and liquid were divided equally between two tubes'));
      } },
    { id: 'ac', group: L('Проба на растворимость', 'Ерігіштікке сынама', 'Solubility test'), label: L('Уксусная кислота разб.: 1 мл', 'Сұйылт. сірке қышқылы: 1 мл', 'Dilute acetic acid: 1 mL'), advance: 30, disabled: (t) => t.ac || t.hcl,
      apply(t, S, ctx) {
        t.ac = 1; t.v += 1;
        if (t.ppt > 0.1) ctx.log(L('Уксусная кислота: белый осадок не растворяется', 'Сірке қышқылы: ақ тұнба ерімейді', 'Acetic acid: the white precipitate does not dissolve'), 'obs');
        else ctx.log(L('Прилита разбавленная уксусная кислота', 'Сұйылтылған сірке қышқылы құйылды', 'Dilute acetic acid added'));
      } },
    { id: 'hcl', group: L('Проба на растворимость', 'Ерігіштікке сынама', 'Solubility test'), label: L('HCl разб.: 1 мл', 'Сұйылт. HCl: 1 мл', 'Dilute HCl: 1 mL'), advance: 30, disabled: (t) => t.hcl,
      apply(t, S, ctx) {
        t.hcl = 1; t.v += 1;
        if (t.ppt > 0.1) { t.ppt = 0; t.dis = true; ctx.log(L('Хлороводородная кислота: осадок растворился, раствор прозрачный', 'Хлорсутек қышқылы: тұнба еріді, ерітінді мөлдір', 'Hydrochloric acid: the precipitate dissolved, the solution is clear'), 'obs'); }
        else ctx.log(L('Прилита разбавленная HCl', 'Сұйылтылған HCl құйылды', 'Dilute HCl added'));
      } },
  ]),
  done: (tb) => { const v = Object.values(tb); return v.some((t) => t.had && t.ac && !t.hcl && t.ppt > 0.1) && v.some((t) => t.had && t.dis); },
  observe: {
    question: L('Как ведёт себя осадок оксалата кальция в кислотах?', 'Кальций оксалатының тұнбасы қышқылдарда қалай өзгереді?', 'How does the calcium oxalate precipitate behave in the acids?'),
    options: [
      { id: 'ok', label: L('В уксусной кислоте не растворяется, в HCl растворяется', 'Сірке қышқылында ерімейді, HCl-да ериді', 'Insoluble in acetic acid, dissolves in HCl'), log: L('Белый мелкокристаллический осадок CaC₂O₄ не растворяется в уксусной кислоте и растворяется в HCl', 'CaC₂O₄-тің ақ ұсақ кристалды тұнбасы сірке қышқылында ерімейді, HCl-да ериді', 'The white fine-crystalline CaC₂O₄ precipitate is insoluble in acetic acid and dissolves in HCl') },
      { id: 'both', label: L('Растворяется в обеих кислотах', 'Екі қышқылда да ериді', 'Dissolves in both acids') },
      { id: 'none', label: L('Не растворяется ни в одной', 'Ешқайсысында ерімейді', 'Dissolves in neither') },
      { id: 'rev', label: L('Растворяется в уксусной, но не в HCl', 'Сірке қышқылында ериді, HCl-да ерімейді', 'Dissolves in acetic acid but not in HCl') },
    ],
    correct: () => 'ok',
    why: () => L('Щавелевая кислота (pKa₁ = 1,25) сильнее уксусной, поэтому уксусная кислота не переводит C₂O₄²⁻ в H₂C₂O₄; сильная HCl — переводит, и осадок растворяется. Это признак оксалат-иона.', 'Щавель қышқылы (pKa₁ = 1,25) сірке қышқылынан күшті, сондықтан сірке қышқылы C₂O₄²⁻-ні H₂C₂O₄-ке айналдыра алмайды; күшті HCl айналдырады да, тұнба ериді. Бұл — оксалат-ионның белгісі.', 'Oxalic acid (pKa₁ = 1.25) is stronger than acetic acid, so acetic acid cannot convert C₂O₄²⁻ into H₂C₂O₄; strong HCl does, and the precipitate dissolves. This identifies the oxalate ion.'),
  },
  onDone(S) { S.e1.ca = true; },
  scene: (S, local) => tubesScene(tubesA, local, { cap: 4 }),
  hint1: L('Порядок: щавелевая кислота → CaCl₂ → осадок → разделить → в одну пробирку CH₃COOH, в другую HCl.', 'Реті: щавель қышқылы → CaCl₂ → тұнба → бөлу → бір пробиркаға CH₃COOH, екіншісіне HCl.', 'Order: oxalic acid → CaCl₂ → precipitate → divide → CH₃COOH into one tube, HCl into the other.'),
};
function precipitate(t, ctx) {
  t.ppt = 0.85; t.pptColor = WHITE;
  ctx.log(L('Выпал белый мелкокристаллический осадок оксалата кальция', 'Кальций оксалатының ақ ұсақ кристалды тұнбасы түзілді', 'A white fine-crystalline precipitate of calcium oxalate formed'), 'obs');
}

/* ---------- 4. KMnO₄ на водяной бане ---------- */
const colorWord = (k) => {
  if (k.brown > 0.15) return L('бурая муть', 'қоңыр лай', 'brown turbidity');
  if (!k.drops) return L('бесцветный', 'түссіз', 'colourless');
  if (k.x < 0.3) return L('фиолетовый', 'күлгін', 'violet');
  if (k.x < 0.8) return L('розовый', 'қызғылт', 'pink');
  if (k.x < 0.97) return L('бледно-розовый', 'ақшыл қызғылт', 'pale pink');
  return L('бесцветный', 'түссіз', 'colourless');
};
const s3 = {
  type: 'process', id: 'kmno4',
  title: L('Окисление перманганатом', 'Перманганатпен тотығу', 'Oxidation by permanganate'),
  instr: L('<ol><li>К <b>1 мл</b> раствора щавелевой кислоты прилейте <b>1 мл</b> 10 % H₂SO₄ и <b>2–3 капли</b> раствора KMnO₄ (0,5 %).</li><li>Нагрейте водяную баню до <b>60–70 °C</b>, поставьте пробирку в баню и наблюдайте.</li></ol><p class="note">Следите за окраской и пузырьками газа. Баню без присмотра не оставляют (п. 7.2 правил ТБ).</p>',
    '<ol><li><b>1 мл</b> щавель қышқылы ерітіндісіне <b>1 мл</b> 10 % H₂SO₄ және <b>2–3 тамшы</b> KMnO₄ ерітіндісін (0,5 %) қосыңыз.</li><li>Су моншасын <b>60–70 °C</b>-қа дейін қыздырып, пробирканы моншаға қойып, бақылаңыз.</li></ol><p class="note">Түсі мен газ көпіршіктерін қадағалаңыз. Моншаны қараусыз қалдырмайды (ҚТ ережелерінің 7.2-тармағы).</p>',
    '<ol><li>To <b>1 mL</b> of oxalic acid solution add <b>1 mL</b> of 10 % H₂SO₄ and <b>2–3 drops</b> of KMnO₄ solution (0.5 %).</li><li>Heat the water bath to <b>60–70 °C</b>, put the tube in the bath and observe.</li></ol><p class="note">Watch the colour and the gas bubbles. Never leave the bath unattended (safety rule 7.2).</p>'),
  need: L('Дождитесь обесцвечивания перманганата', 'Перманганаттың түссізденуін күтіңіз', 'Wait until the permanganate is decolourised'),
  speeds: [5, 10, 30],
  setup(S) { S.km = S.km || { ox: 0, acid: 0, drops: 0, x: 0, T: 22, Tb: 20, brown: 0, hot: 0, over: false, tIn: null, t20: null, t97: null, gas: false }; },
  controls: [
    { kind: 'action', id: 'ox', group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('Щавелевая кислота 5 %: 1 мл', 'Щавель қышқылы 5 %: 1 мл', 'Oxalic acid 5 %: 1 mL'), advance: 20, do(S) { S.km.ox = 1; }, log: L('В пробирку отмерен 1 мл раствора щавелевой кислоты', 'Пробиркаға щавель қышқылы ерітіндісінің 1 мл өлшенді', '1 mL of oxalic acid solution measured into the tube') },
    { kind: 'action', id: 'acid', group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('H₂SO₄ 10 %: 1 мл', 'H₂SO₄ 10 %: 1 мл', 'H₂SO₄ 10 %: 1 mL'), requires: ['ox'], advance: 20, do(S) { S.km.acid = 1; }, log: L('Прилит 1 мл 10 % H₂SO₄', '10 % H₂SO₄-тің 1 мл құйылды', '1 mL of 10 % H₂SO₄ added') },
    { kind: 'action', id: 'km', once: false, group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('KMnO₄ 0,5 %: +1 капля', 'KMnO₄ 0,5 %: +1 тамшы', 'KMnO₄ 0.5 %: +1 drop'), requires: ['ox'], advance: 5,
      disabled: (S) => S.km.drops >= 10 || S.km.x >= 0.97,
      do(S, lc, ctx) {
        const k = S.km; k.drops += 1;
        ctx.log(L(`Прибавлена капля KMnO₄ (всего ${k.drops}) — фиолетовая окраска`, `KMnO₄ тамшысы қосылды (барлығы ${k.drops}) — күлгін түс`, `A drop of KMnO₄ added (total ${k.drops}) — violet colour`));
        if (k.drops === 4) ctx.feedback(L('По методичке — 2–3 капли. Лишний перманганат только затянет обесцвечивание.', 'Әдістеме бойынша — 2–3 тамшы. Артық перманганат түссізденуді ғана созады.', 'The manual says 2–3 drops. Extra permanganate only slows the decolourisation.'), 'warn');
        if (k.drops > 5) ctx.remark({ key: 'km_many', severity: 'minor', text: L('избыток KMnO₄ (больше 5 капель вместо 2–3): обесцвечивание затягивается', 'KMnO₄ артық (2–3 орнына 5 тамшыдан көп): түссіздену созылады', 'excess KMnO₄ (more than 5 drops instead of 2–3): decolourisation takes longer') });
      } },
    { kind: 'toggle', id: 'in', group: L('Баня', 'Монша', 'Bath'), label: L('Поставить пробирку в баню', 'Пробирканы моншаға қою', 'Put the tube in the bath'), labelOn: L('Пробирка в бане — вынуть', 'Пробирка моншада — шығару', 'Tube in the bath — take out'),
      when: (S) => S.km.drops > 0, whenText: L('Сначала приготовьте смесь: щавелевая кислота, H₂SO₄, 2–3 капли KMnO₄.', 'Алдымен қоспаны дайындаңыз: щавель қышқылы, H₂SO₄, 2–3 тамшы KMnO₄.', 'First prepare the mixture: oxalic acid, H₂SO₄, 2–3 drops of KMnO₄.'),
      onChange(S, lc, on, ctx) {
        if (on && S.km.tIn == null) S.km.tIn = ctx.now();
        ctx.log(on ? L(`Пробирка поставлена в водяную баню (${n(S.km.Tb, 0)} °C)`, `Пробирка су моншасына қойылды (${n(S.km.Tb, 0)} °C)`, `Tube placed in the water bath (${n(S.km.Tb, 0)} °C)`) : L('Пробирка вынута из бани', 'Пробирка моншадан шығарылды', 'Tube taken out of the bath'));
      } },
    { kind: 'range', id: 'set', group: L('Терморегулятор бани', 'Монша терморегуляторы', 'Bath thermostat'), label: L('Терморегулятор бани', 'Монша терморегуляторы', 'Bath thermostat'), min: 20, max: 100, step: 5, unit: '°C', default: 20 },
  ],
  tick(S, lc, dt, ctx) {
    const k = S.km, set = lc.c.set ?? 20;
    k.Tb = relax(k.Tb, set, 0.004, dt);
    k.T = relax(k.T, lc.c.in ? k.Tb : 22, lc.c.in ? 0.03 : 0.01, dt);
    if (k.ox && k.drops && k.x < 1) {
      const r = kmno4Rate(k.x, k.T, { acid: !!k.acid, drops: k.drops });
      k.x = Math.min(1, k.x + r * dt);
      k.gas = r > 0.002 && k.T > 40;
    } else k.gas = false;
    if (!k.acid) k.brown = 0.6 * k.x;
    if (k.T > 85 && k.x < 0.97) { k.hot += dt; if (k.over) k.brown = Math.max(k.brown, Math.min(0.7, k.hot / 90)); }
    const now = ctx.now();
    if (k.x >= 0.2 && k.t20 == null) k.t20 = now;
    if (k.x >= 0.97 && k.t97 == null) k.t97 = now;
  },
  readouts: (S) => [
    { label: L('Баня', 'Монша', 'Bath'), value: n(S.km.Tb, 1) + ' °C', st: S.km.Tb >= 60 && S.km.Tb <= 70 ? 'ok' : S.km.Tb > 80 ? 'bad' : '' },
    { label: L('Пробирка', 'Пробирка', 'Tube'), value: n(S.km.T, 1) + ' °C', st: S.km.T >= 60 && S.km.T <= 70 ? 'ok' : S.km.T > 80 ? 'bad' : '' },
    { label: L('Окраска', 'Түсі', 'Colour'), value: colorWord(S.km) },
  ],
  alerts: (S, lc) => {
    const k = S.km;
    if (k.x >= 0.97) return null;
    if (k.T > 75) return { text: L('Температура выше 60–70 °C — уменьшите нагрев бани.', 'Температура 60–70 °C-тан жоғары — монша қызуын азайтыңыз.', 'The temperature is above 60–70 °C — turn the bath down.'), kind: 'warn' };
    if (lc.c.in && k.T < 45 && (lc.c.set ?? 20) < 55) return { text: L('При комнатной температуре реакция идёт очень медленно — нагрейте баню до 60–70 °C.', 'Бөлме температурасында реакция өте баяу жүреді — моншаны 60–70 °C-қа дейін қыздырыңыз.', 'At room temperature the reaction is very slow — heat the bath to 60–70 °C.'), kind: 'info' };
    return null;
  },
  events: [{
    id: 'hot', when: (S) => S.km.T > 85 && S.km.x < 0.97,
    title: L('Перегрев пробирки', 'Пробирканың қызып кетуі', 'The tube is overheating'),
    text: L('Температура в пробирке выше 85 °C, вода в бане почти кипит. Что делать?', 'Пробиркадағы температура 85 °C-тан жоғары, моншадағы су қайнауға жақын. Не істейсіз?', 'The tube is above 85 °C and the bath is close to boiling. What do you do?'),
    options: [
      { ok: true, label: L('Вынуть пробирку, снизить терморегулятор до 65 °C', 'Пробирканы шығарып, терморегуляторды 65 °C-қа түсіру', 'Take the tube out and turn the thermostat down to 65 °C'), effect(S, lc) { lc.c.in = false; lc.c.set = 65; } },
      { ok: false, severity: 'major', label: L('Продолжать — при кипящей бане реакция пройдёт быстрее', 'Жалғастыру — қайнаған моншада реакция тезірек жүреді', 'Carry on — a boiling bath will make it faster'),
        remark: L('перегрев смеси выше 85 °C: часть KMnO₄ разложилась до бурого MnO₂', 'қоспа 85 °C-тан жоғары қызды: KMnO₄-тің бір бөлігі қоңыр MnO₂-ге дейін ыдырады', 'mixture overheated above 85 °C: part of the KMnO₄ decomposed to brown MnO₂'),
        whatif: L('В горячем растворе перманганат частично разлагается, выпадает бурый MnO₂ — картина «обесцвечивания» смазывается, автокатализ не виден. Методичка требует 60–70 °C.', 'Ыстық ерітіндіде перманганат ішінара ыдырап, қоңыр MnO₂ түзіледі — «түссіздену» көрінісі бұзылады, автокатализ көрінбейді. Әдістеме 60–70 °C талап етеді.', 'In hot solution permanganate partly decomposes and brown MnO₂ appears — the decolourisation is blurred and autocatalysis cannot be seen. The manual requires 60–70 °C.'),
        effect(S) { S.km.over = true; } },
    ],
  }],
  chart: { value: (S) => S.km.T, min: 0, max: 100, band: [60, 70], limit: 85, label: L('Температура в пробирке', 'Пробиркадағы температура', 'Tube temperature'), active: (S, lc) => !!lc.c.in || S.km.T > 30 },
  stop: (S) => S.km.x >= 0.97,
  done(S, lc, ctx) {
    const k = S.km;
    if (k.x < 0.97) return false;
    const t0 = k.tIn ?? k.t20 ?? 0;
    const slow = Math.max(0, ((k.t20 ?? t0) - t0) / 60), fast = Math.max(0.1, ((k.t97 ?? k.t20 ?? t0) - (k.t20 ?? t0)) / 60);
    if (!k.acid) {
      ctx.remark({ key: 'km_noacid', severity: 'major', text: L('H₂SO₄ не прибавлена: перманганат восстановился только частично до бурого MnO₂ — проба не по методичке', 'H₂SO₄ қосылмады: перманганат тек ішінара қоңыр MnO₂-ге дейін тотықсызданды — сынама әдістеме бойынша емес', 'no H₂SO₄ was added: permanganate was reduced only partly, to brown MnO₂ — the test does not follow the manual') });
      ctx.log(L(`Без серной кислоты окраска исчезала медленно (≈ ${n(slow + fast, 1)} мин), выпала бурая муть MnO₂`, `Күкірт қышқылынсыз түсі баяу кетті (≈ ${n(slow + fast, 1)} мин), қоңыр MnO₂ лайы түзілді`, `Without sulfuric acid the colour faded slowly (≈ ${n(slow + fast, 1)} min) and a brown MnO₂ turbidity appeared`), 'obs');
    } else if (k.over) {
      ctx.log(L('Окраска перманганата исчезла, но раствор помутнел — бурый осадок MnO₂ (перегрев выше 85 °C)', 'Перманганат түсі кетті, бірақ ерітінді лайланды — қоңыр MnO₂ тұнбасы (85 °C-тан жоғары қызу)', 'The permanganate colour disappeared but the solution became turbid — brown MnO₂ (overheating above 85 °C)'), 'obs');
    } else {
      ctx.log(L(`Фиолетовая окраска KMnO₄ исчезла: первые ≈ ${n(slow, 1)} мин — медленно, затем за ≈ ${n(fast, 1)} мин — быстро; выделялись пузырьки газа (CO₂)`, `KMnO₄-тің күлгін түсі кетті: алғашқы ≈ ${n(slow, 1)} мин — баяу, содан кейін ≈ ${n(fast, 1)} мин ішінде — тез; газ көпіршіктері (CO₂) бөлінді`, `The violet colour of KMnO₄ disappeared: slowly for the first ≈ ${n(slow, 1)} min, then quickly within ≈ ${n(fast, 1)} min; gas bubbles (CO₂) were given off`), 'obs');
    }
    S.e1.km = { acid: !!k.acid, over: !!k.over, slow, fast, Tmax: k.T, drops: k.drops };
    return { text: L('Перманганат обесцвечен.', 'Перманганат түссізденді.', 'The permanganate has been decolourised.') };
  },
  scene: (S, lc) => {
    const k = S.km, v = (k.ox ? 1 : 0) + (k.acid ? 1 : 0) + k.drops * DROP;
    return bathScene({ t: { v, color: kmno4Color(k.x, k.drops, k.brown), ppt: k.brown > 0.15 ? k.brown : 0, pptColor: BROWN, gas: k.gas }, inBath: !!lc.c.in, Tb: k.Tb, T: k.T, heat: (lc.c.set ?? 20) > 22, mark: 70, cap: 4 });
  },
  hints: [
    L('Нужны три реактива в пробирке и нагретая до 60–70 °C баня. Перманганат реагирует с щавелевой кислотой только в кислой среде.', 'Пробиркада үш реактив және 60–70 °C-қа дейін қыздырылған монша қажет. Перманганат щавель қышқылымен тек қышқыл ортада әрекеттеседі.', 'You need three reagents in the tube and a bath at 60–70 °C. Permanganate reacts with oxalic acid only in acidic solution.'),
    L('Поставьте терморегулятор на 65 °C, дождитесь прогрева бани, затем поставьте пробирку. Выше 85 °C — перегрев.', 'Терморегуляторды 65 °C-қа қойып, монша қызғанша күтіңіз, содан кейін пробирканы қойыңыз. 85 °C-тан жоғары — қызып кету.', 'Set the thermostat to 65 °C, wait for the bath to warm up, then put the tube in. Above 85 °C is overheating.'),
    L('1 мл H₂C₂O₄ → 1 мл H₂SO₄ → 3 капли KMnO₄ → баня 65 °C → пробирка в баню → ход времени ×30 и наблюдать: сначала медленно, потом быстро (автокатализ Mn²⁺).', '1 мл H₂C₂O₄ → 1 мл H₂SO₄ → 3 тамшы KMnO₄ → монша 65 °C → пробирка моншаға → уақыт ×30 және бақылау: алдымен баяу, кейін тез (Mn²⁺ автокатализі).', '1 mL H₂C₂O₄ → 1 mL H₂SO₄ → 3 drops KMnO₄ → bath 65 °C → tube into the bath → time ×30 and watch: slow at first, then fast (Mn²⁺ autocatalysis).'),
  ],
};

/* ---------- 5. Наблюдение ---------- */
const s4 = {
  type: 'observe', id: 'km-obs',
  title: L('Наблюдение: обесцвечивание перманганата', 'Бақылау: перманганаттың түссізденуі', 'Observation: decolourisation of permanganate'),
  instr: L('<p>Опишите, как исчезала окраска раствора KMnO₄ в пробирке.</p>', '<p>Пробиркадағы KMnO₄ ерітіндісінің түсі қалай кеткенін сипаттаңыз.</p>', '<p>Describe how the colour of the KMnO₄ solution disappeared in the tube.</p>'),
  need: L('Выберите точное описание', 'Дәл сипаттаманы таңдаңыз', 'Choose the accurate description'),
  scene: (S) => { const k = S.km; return bathScene({ t: { v: 2.15, color: kmno4Color(k.x, k.drops, k.brown), ppt: k.brown > 0.15 ? k.brown : 0, pptColor: BROWN }, inBath: false, Tb: k.Tb, T: k.T, heat: false, cap: 4 }); },
  question: L('Как исчезала окраска перманганата?', 'Перманганат түсі қалай кетті?', 'How did the permanganate colour disappear?'),
  options: [
    { id: 'auto', label: L('Сначала медленно, затем быстро; выделялись пузырьки газа', 'Алдымен баяу, кейін тез; газ көпіршіктері бөлінді', 'Slowly at first, then quickly; gas bubbles were given off') },
    { id: 'instant', label: L('Мгновенно, ещё до нагревания', 'Лезде, қыздырмай тұрып', 'Instantly, before heating') },
    { id: 'brown', label: L('Окраска исчезала, но раствор помутнел — бурый осадок', 'Түсі кетті, бірақ ерітінді лайланды — қоңыр тұнба', 'The colour faded but the solution became turbid — a brown precipitate') },
    { id: 'none', label: L('Окраска не изменилась', 'Түсі өзгерген жоқ', 'The colour did not change') },
  ],
  correct: (S) => (S.km.acid && !S.km.over ? 'auto' : 'brown'),
  why: (S) => (S.km.acid && !S.km.over
    ? L('Mn²⁺, образующийся в реакции, катализирует её — автокатализ: индукционный период, затем быстрое обесцвечивание; газ — CO₂.', 'Реакцияда түзілетін Mn²⁺ оны катализдейді — автокатализ: индукциялық кезең, содан кейін тез түссіздену; газ — CO₂.', 'The Mn²⁺ formed in the reaction catalyses it — autocatalysis: an induction period, then rapid decolourisation; the gas is CO₂.')
    : L('Без достаточной кислотности или при перегреве перманганат восстанавливается до MnO₂ — бурого осадка, а не до бесцветного Mn²⁺.', 'Қышқылдық жеткіліксіз болса немесе қызып кетсе, перманганат түссіз Mn²⁺-ке емес, қоңыр тұнба MnO₂-ге дейін тотықсызданады.', 'With too little acid or on overheating, permanganate is reduced to MnO₂, a brown precipitate, rather than to colourless Mn²⁺.')),
};

/* ---------- 6. Вопросы ---------- */
const s5 = {
  type: 'quiz', id: 'q1',
  title: L('Вопросы по опыту', 'Тәжірибе бойынша сұрақтар', 'Questions on the experiment'),
  instr: L('<p>Ответьте на вопросы преподавателя.</p>', '<p>Оқытушының сұрақтарына жауап беріңіз.</p>', '<p>Answer the instructor’s questions.</p>'),
  need: L('Ответьте на все вопросы', 'Барлық сұрақтарға жауап беріңіз', 'Answer all the questions'),
  questions: [
    { q: L('Почему щавелевая кислота сильнее уксусной по первой ступени (pKa₁ = 1,25)?', 'Неліктен щавель қышқылы бірінші сатысы бойынша сірке қышқылынан күшті (pKa₁ = 1,25)?', 'Why is oxalic acid stronger than acetic acid in its first step (pKa₁ = 1.25)?'),
      options: [L('Вторая карбоксильная группа оттягивает электронную плотность (−I) и стабилизирует анион', 'Екінші карбоксил тобы электрон тығыздығын тартып (−I), анионды тұрақтандырады', 'The second carboxyl group withdraws electron density (−I) and stabilises the anion'), L('В молекуле больше атомов водорода', 'Молекулада сутек атомдары көп', 'The molecule has more hydrogen atoms'), L('Щавелевая кислота лучше растворима в воде', 'Щавель қышқылы суда жақсы ериді', 'Oxalic acid is more soluble in water'), L('Карбоксильные группы образуют сопряжение с кольцом', 'Карбоксил топтары сақинамен түйіндеседі', 'The carboxyl groups are conjugated with a ring')], correct: 0,
      why: L('Одна –COOH группа оттягивает электроны от другой — взаимное влияние функциональных групп.', 'Бір –COOH тобы екіншісінен электрондарды тартады — функционалдық топтардың өзара әсері.', 'One –COOH group withdraws electrons from the other — mutual influence of functional groups.') },
    { q: L('Сколько молей CO₂ образуется при окислении 5 моль H₂C₂O₄ перманганатом?', '5 моль H₂C₂O₄ перманганатпен тотыққанда неше моль CO₂ түзіледі?', 'How many moles of CO₂ form when 5 mol of H₂C₂O₄ are oxidised by permanganate?'),
      options: ['10', '5', '2', '8'], correct: 0,
      why: L('5H₂C₂O₄ + 2KMnO₄ + 3H₂SO₄ → 10CO₂↑ + 2MnSO₄ + K₂SO₄ + 8H₂O.', '5H₂C₂O₄ + 2KMnO₄ + 3H₂SO₄ → 10CO₂↑ + 2MnSO₄ + K₂SO₄ + 8H₂O.', '5H₂C₂O₄ + 2KMnO₄ + 3H₂SO₄ → 10CO₂↑ + 2MnSO₄ + K₂SO₄ + 8H₂O.') },
  ],
};

export default {
  id: '1',
  title: L('Реакции щавелевой кислоты', 'Щавель қышқылының реакциялары', 'Reactions of oxalic acid'),
  principle: L('Оксалат-ионы дают белый осадок оксалата кальция, нерастворимый в уксусной кислоте, но растворимый в минеральных кислотах; в кислой среде щавелевая кислота окисляется перманганатом до CO₂.', 'Оксалат-иондар сірке қышқылында ерімейтін, бірақ минералдық қышқылдарда еритін кальций оксалатының ақ тұнбасын береді; қышқыл ортада щавель қышқылы перманганатпен CO₂-ге дейін тотығады.', 'Oxalate ions form a white precipitate of calcium oxalate, insoluble in acetic acid but soluble in mineral acids; in acidic medium oxalic acid is oxidised by permanganate to CO₂.'),
  equation: ['H₂C₂O₄ + CaCl₂ → CaC₂O₄↓ + 2HCl', '5H₂C₂O₄ + 2KMnO₄ + 3H₂SO₄ → 10CO₂↑ + 2MnSO₄ + K₂SO₄ + 8H₂O'],
  initialState: () => ({ e1: { ca: false, km: null } }),
  checkpoints: [0, 2, 3],
  steps: [s0, s1, s2, s3, s4, s5],
  results: (S) => ({ ca: S.e1.ca, ...(S.e1.km || {}) }),
  summary: (r) => [
    { label: 'CaCl₂', value: r.ca ? L('белый осадок', 'ақ тұнба', 'white ppt') : '—', st: r.ca ? 'ok' : '' },
    { label: 'KMnO₄ / H₂SO₄', value: r.acid && !r.over ? L('обесцвечен, CO₂ ↑', 'түссізденді, CO₂ ↑', 'decolourised, CO₂ ↑') : L('бурый MnO₂', 'қоңыр MnO₂', 'brown MnO₂'), st: r.acid && !r.over ? 'ok' : 'warn' },
  ],
};
