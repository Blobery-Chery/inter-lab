/** Опыт 1. Нитрование бензойной кислоты (синтез м-нитробензойной кислоты). Методичка, раздел 6, опыт 1. */
import { L, n } from '../../app/i18n.js';
import { relax } from '../../app/instruments/thermal.js';
import { M, makeCrude, makeFin, washPH, solubility, theoretical, percentYield, lossBreakdown } from './model.js';
import { flaskScene, acidScene, mixScene, pourScene, hotScene, hoodScene, filterBase } from './scene.js';

const g = (x, d = 4) => n(x, d);

/* ------------------------------------------------------------------ шаги */
const s0 = {
  type: 'checklist', id: 'ppe',
  title: L('Рабочее место и средства защиты', 'Жұмыс орны және қорғаныс құралдары', 'Workplace and protective equipment'),
  instr: L('<p>Работа с нитрующей смесью (конц. HNO₃ + H₂SO₄) — только в вытяжном шкафу. Наденьте средства защиты, включите тягу и найдите средства аварийной защиты: нажмите на каждый нужный пункт. Лишнее не нажимайте.</p>',
    '<p>Нитрлеуші қоспамен (конц. HNO₃ + H₂SO₄) тек тартпа шкафта жұмыс істейді. Қорғаныс құралдарын киіп, тартымды қосыңыз және апаттық қорғаныс құралдарын табыңыз: әр қажетті тармақты басыңыз. Артығын баспаңыз.</p>',
    '<p>The nitrating mixture (conc. HNO₃ + H₂SO₄) is handled only in a fume hood. Put on your protective equipment, switch on the hood and locate the emergency equipment: tap every item you need. Do not tap anything that is wrong.</p>'),
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
    { id: 'waste', label: L('Ёмкость для кислотных отходов', 'Қышқыл қалдықтарға арналған ыдыс', 'Acid waste container'), log: L('Подготовлена ёмкость для кислотных отходов', 'Қышқыл қалдықтарға арналған ыдыс дайындалды', 'Acid waste container ready') },
    { id: 'lens', label: L('Работать в контактных линзах вместо очков', 'Көзілдіріктің орнына контакт линзаларымен жұмыс істеу', 'Work in contact lenses instead of goggles'),
      wrong: { severity: 'safety', text: L('попытка работать в контактных линзах без защитных очков (п. 3.2 правил ТБ)', 'қорғаныс көзілдірігінсіз контакт линзаларымен жұмыс істеу әрекеті (ҚТ ережелерінің 3.2-тармағы)', 'tried to work in contact lenses without goggles (safety rule 3.2)'),
        whatif: L('Пары кислот скапливаются под линзой, а брызги нитрующей смеси попадают прямо в глаз — это тяжёлый химический ожог роговицы. Очки обязательны при любой работе с реактивами.', 'Қышқыл булары линза астына жиналады, ал нитрлеуші қоспаның шашырандылары тікелей көзге түседі — бұл қасаңқабықтың ауыр химиялық күйігі. Реактивтермен кез келген жұмыста көзілдірік міндетті.', 'Acid vapour collects under the lens and splashes of nitrating mixture go straight into the eye — a severe chemical burn of the cornea. Goggles are compulsory for any work with reagents.') } },
    { id: 'tea', label: L('Поставить рядом чай, чтобы не отвлекаться', 'Алаңдамау үшін жанына шай қою', 'Keep a cup of tea nearby'),
      wrong: { severity: 'safety', text: L('напитки на рабочем месте (п. 2.2 правил ТБ)', 'жұмыс орнындағы сусындар (ҚТ ережелерінің 2.2-тармағы)', 'drinks at the workplace (safety rule 2.2)'),
        whatif: L('Еда и напитки в лаборатории запрещены: в чашку могут попасть брызги или пары кислот, а кружку легко перепутать с химическим стаканом.', 'Зертханада тамақ пен сусындарға тыйым салынған: кесеге қышқыл шашырандылары немесе булары түсуі мүмкін, ал кесені химиялық стақанмен шатастыру оңай.', 'Food and drink are forbidden in the lab: acid splashes or fumes can get into the cup, and a mug is easily confused with a beaker.') } },
  ],
};

const s1 = {
  type: 'pick', id: 'kit',
  title: L('Посуда и приборы для нитрования', 'Нитрлеуге арналған ыдыстар мен құралдар', 'Glassware and instruments for the nitration'),
  instr: L('<p>Возьмите с полки всё, что нужно для нитрования (пп. 1–4 хода работы), и ничего лишнего.</p><p class="note">Навеску возьмёте на аналитических весах в следующем шаге.</p>',
    '<p>Сөреден нитрлеуге қажеттінің бәрін алыңыз (жұмыс барысының 1–4-тармақтары), артығын алмаңыз.</p><p class="note">Өлшендіні келесі қадамда аналитикалық таразыда аласыз.</p>',
    '<p>Take from the shelf everything you need for the nitration (procedure steps 1–4) and nothing extra.</p><p class="note">You will weigh the sample on the analytical balance in the next step.</p>'),
  need: L('Соберите нужный набор', 'Қажетті жиынтықты жинаңыз', 'Collect the right set'),
  shelf: ['conical-50', 'thermometer-100', 'dropping-pipette', 'ice-salt-bath', 'glass-rod', 'cylinder-10', 'test-tube', 'rbf-50', 'reflux-condenser', 'heating-mantle', 'thermometer-250', 'sep-funnel', 'boiling-chips', 'polarimeter-tube'],
  take: ['conical-50', 'thermometer-100', 'dropping-pipette', 'ice-salt-bath', 'glass-rod', 'cylinder-10', 'test-tube'],
  hint1: L('Реакционный сосуд — коническая колба на 50 мл; нужна баня для охлаждения, термометр с ценой деления 1 °C, чем отмерить кислоту, где приготовить нитрующую смесь и чем её прибавлять.', 'Реакциялық ыдыс — 50 мл конустық колба; салқындату моншасы, бөлік құны 1 °C термометр, қышқылды өлшейтін, нитрлеуші қоспаны дайындайтын және оны қосатын құрал қажет.', 'The reaction vessel is a 50 mL conical flask; you need a cooling bath, a thermometer with 1 °C divisions, something to measure the acid, somewhere to prepare the nitrating mixture and something to add it with.'),
};

const s2 = {
  type: 'weigh', id: 'weigh',
  title: L('Навеска бензойной кислоты', 'Бензой қышқылының өлшендісі', 'Weighing the benzoic acid'),
  instr: L('<ol><li>Возьмите навеску <b>2,0 г (16,4 ммоль)</b> бензойной кислоты на аналитических весах.</li><li>Поставьте лодочку, тарируйте весы, насыпьте вещество шпателем, закройте дверцы и запишите массу.</li></ol><p class="note">Допустимо 1,95–2,05 г. Записывают фактическую массу до 0,0001 г — по ней считают выход.</p>',
    '<ol><li>Аналитикалық таразыда бензой қышқылының <b>2,0 г (16,4 ммоль)</b> өлшендісін алыңыз.</li><li>Қайықшаны қойып, таразыны тарировкалаңыз, затты шпательмен салыңыз, есікшелерді жауып, массаны жазыңыз.</li></ol><p class="note">1,95–2,05 г рұқсат етіледі. Нақты массаны 0,0001 г-ға дейін жазады — шығым соған қарай есептеледі.</p>',
    '<ol><li>Weigh out <b>2.0 g (16.4 mmol)</b> of benzoic acid on the analytical balance.</li><li>Place a weighing boat, tare the balance, add the solid with a spatula, close the doors and record the mass.</li></ol><p class="note">1.95–2.05 g is acceptable. Record the actual mass to 0.0001 g — the yield is calculated from it.</p>'),
  need: L('Запишите массу навески', 'Өлшендінің массасын жазыңыз', 'Record the mass of the sample'),
  reagent: L('C₆H₅COOH', 'C₆H₅COOH', 'C₆H₅COOH'), mode: 'spatula', container: 'boat', target: 2.0, lo: 1.95, hi: 2.05, saveAs: 'mBA',
  onRecord(S, m, ctx) {
    ctx.log(L(`Навеска бензойной кислоты: <b>${g(m)} г</b> (${n((m / M.BA) * 1000, 1)} ммоль)`, `Бензой қышқылының өлшендісі: <b>${g(m)} г</b> (${n((m / M.BA) * 1000, 1)} ммоль)`, `Benzoic acid sample: <b>${g(m)} g</b> (${n((m / M.BA) * 1000, 1)} mmol)`), 'calc');
    ctx.log(L('Навеска перенесена в коническую колбу на 50 мл (в вытяжном шкафу)', 'Өлшенді 50 мл конустық колбаға ауыстырылды (тартпа шкафта)', 'Sample transferred to a 50 mL conical flask (in the fume hood)'));
  },
};

const s3 = {
  type: 'measure', id: 'h2so4',
  title: L('Растворение в серной кислоте', 'Күкірт қышқылында еріту', 'Dissolving in sulfuric acid'),
  instr: L('<ol><li>В вытяжном шкафу отмерьте цилиндром <b>5 мл</b> конц. H₂SO₄ (96–98 %, d 1,84).</li><li>Прилейте кислоту к бензойной кислоте в колбе и перемешайте стеклянной палочкой.</li></ol><p class="note">Излишек реактива в склянку не возвращают — только в ёмкость для отходов.</p>',
    '<ol><li>Тартпа шкафта цилиндрмен <b>5 мл</b> конц. H₂SO₄ (96–98 %, d 1,84) өлшеңіз.</li><li>Қышқылды колбадағы бензой қышқылына құйып, шыны таяқшамен араластырыңыз.</li></ol><p class="note">Реактивтің артығы склянкаға қайтарылмайды — тек қалдық ыдысына.</p>',
    '<ol><li>In the fume hood, measure <b>5 mL</b> of conc. H₂SO₄ (96–98 %, d 1.84) with a measuring cylinder.</li><li>Add the acid to the benzoic acid in the flask and stir with a glass rod.</li></ol><p class="note">Excess reagent never goes back into the bottle — only into the waste container.</p>'),
  need: L('Прилейте 5 мл H₂SO₄ и перемешайте', '5 мл H₂SO₄ құйып, араластырыңыз', 'Add 5 mL of H₂SO₄ and stir'),
  measure: 'cylinder-10', reagent: L('конц. H₂SO₄', 'конц. H₂SO₄', 'conc. H₂SO₄'), target: 5, tol: 0.25, onDeviation: 'consequence', saveAs: 'vAcid',
  into: L('коническая колба с бензойной кислотой', 'бензой қышқылы бар конустық колба', 'the conical flask with benzoic acid'),
  onTransfer(S) { S.T = 23; },
  then: [{ id: 'stir', label: L('Перемешать палочкой', 'Таяқшамен араластыру', 'Stir with the rod'), advance: 120,
    do(S) { S.dissolved = true; S.T = 27; },
    obs: L('Бензойная кислота почти полностью растворяется в H₂SO₄; густой бесцветный раствор, смесь слегка разогрелась (≈ 27 °C)', 'Бензой қышқылы H₂SO₄-те толығымен дерлік ериді; қою түссіз ерітінді, қоспа сәл жылыды (≈ 27 °C)', 'The benzoic acid dissolves almost completely in H₂SO₄; thick colourless solution, the mixture has warmed slightly (≈ 27 °C)') }],
  scene: acidScene,
};

const s4 = {
  type: 'process', id: 'cool',
  title: L('Охлаждение до 0–5 °C', '0–5 °C-қа дейін салқындату', 'Cooling to 0–5 °C'),
  instr: L('<ol><li>Приготовьте баню из колотого льда с солью (охлаждающая смесь).</li><li>Поместите колбу в баню и охладите раствор до <b>0–5 °C</b>, перемешивая.</li></ol><p class="note">Лёд с водой даёт только около 0 °C — с солью охлаждение быстрее и надёжнее.</p>',
    '<ol><li>Уатылған мұз бен тұздан монша (салқындатқыш қоспа) дайындаңыз.</li><li>Колбаны моншаға салып, ерітіндіні араластыра отырып <b>0–5 °C</b>-қа дейін салқындатыңыз.</li></ol><p class="note">Мұз бен су шамамен 0 °C ғана береді — тұзбен салқындату тезірек және сенімдірек.</p>',
    '<ol><li>Prepare an ice–salt bath (a freezing mixture).</li><li>Put the flask in the bath and cool the solution to <b>0–5 °C</b> with stirring.</li></ol><p class="note">Ice and water only reach about 0 °C — with salt the cooling is faster and more reliable.</p>'),
  need: L('Охладите раствор до 5 °C и ниже', 'Ерітіндіні 5 °C және одан төмен салқындатыңыз', 'Cool the solution to 5 °C or below'),
  speeds: [5, 10, 30],
  setup(S) { if (S.T == null) S.T = 27; S.Tb = 22; },
  controls: [
    { kind: 'action', id: 'ice', group: L('Баня', 'Монша', 'Bath'), label: L('Насыпать колотый лёд', 'Уатылған мұз салу', 'Add crushed ice'), advance: 60, do(S) { S.bath.ice = true; }, log: L('Приготовлена ледяная баня', 'Мұз моншасы дайындалды', 'Ice bath prepared') },
    { kind: 'action', id: 'salt', group: L('Баня', 'Монша', 'Bath'), label: L('Добавить соль NaCl', 'NaCl тұзын қосу', 'Add NaCl'), requires: ['ice'], advance: 30, do(S) { S.bath.salt = true; }, log: L('В баню добавлена соль: охлаждающая смесь лёд / NaCl', 'Моншаға тұз қосылды: мұз / NaCl салқындатқыш қоспасы', 'Salt added: ice / NaCl freezing mixture') },
    { kind: 'action', id: 'in', group: L('Баня', 'Монша', 'Bath'), label: L('Поместить колбу в баню', 'Колбаны моншаға салу', 'Put the flask in the bath'), requires: ['ice'], advance: 15, do(S) { S.bath.in = true; }, log: L('Колба помещена в баню', 'Колба моншаға салынды', 'Flask placed in the bath') },
    { kind: 'toggle', id: 'stir', group: L('Колба', 'Колба', 'Flask'), label: L('Перемешивать', 'Араластыру', 'Stir'), labelOn: L('Перемешивание: вкл.', 'Араластыру: қосулы', 'Stirring: on') },
  ],
  tick(S, lc, dt) {
    const tgt = S.bath.ice ? (S.bath.salt ? -8 : 0.5) : 22;
    S.Tb = relax(S.Tb, tgt, 0.03, dt);
    const k = S.bath.in ? (lc.c.stir ? 0.024 : 0.011) : 0.0008;
    S.T = relax(S.T, S.bath.in ? S.Tb : 22, k, dt);
  },
  readouts: (S) => [
    { label: L('Раствор', 'Ерітінді', 'Solution'), value: n(S.T, 1) + ' °C', st: S.T <= 5 ? 'ok' : '' },
    { label: L('Баня', 'Монша', 'Bath'), value: n(S.Tb, 1) + ' °C' },
  ],
  done(S, lc, ctx) {
    if (S.T <= 5 && S.bath.in) {
      ctx.log(L(`Раствор охлаждён до ${n(S.T, 1)} °C`, `Ерітінді ${n(S.T, 1)} °C-қа дейін салқындатылды`, `Solution cooled to ${n(S.T, 1)} °C`), 'obs');
      return { text: L('Раствор охлаждён. Колба остаётся в бане.', 'Ерітінді салқындатылды. Колба моншада қалады.', 'The solution is cold. The flask stays in the bath.') };
    }
    return false;
  },
  scene: (S, lc) => flaskScene(S, { bath: true, th: true, rod: true, stir: lc.c && lc.c.stir }),
};

const s5 = {
  type: 'process', id: 'mix',
  title: L('Нитрующая смесь', 'Нитрлеуші қоспа', 'Nitrating mixture'),
  instr: L('<ol><li>В пробирку налейте <b>1,5 мл</b> конц. H₂SO₄.</li><li>Медленно, порциями, при охлаждении прилейте <b>1,5 мл</b> конц. HNO₃ (65–68 %).</li><li>Охладите смесь в ледяной бане до 0–5 °C.</li></ol><p class="note">Азотную кислоту приливают к серной, а не наоборот. Колба с бензойной кислотой всё это время стоит в бане.</p>',
    '<ol><li>Пробиркаға <b>1,5 мл</b> конц. H₂SO₄ құйыңыз.</li><li>Баяу, порциялап, салқындата отырып <b>1,5 мл</b> конц. HNO₃ (65–68 %) қосыңыз.</li><li>Қоспаны мұз моншасында 0–5 °C-қа дейін салқындатыңыз.</li></ol><p class="note">Азот қышқылын күкірт қышқылына құяды, керісінше емес. Бензой қышқылы бар колба осы уақыт бойы моншада тұрады.</p>',
    '<ol><li>Put <b>1.5 mL</b> of conc. H₂SO₄ into a test tube.</li><li>Slowly, in portions and with cooling, add <b>1.5 mL</b> of conc. HNO₃ (65–68 %).</li><li>Cool the mixture in an ice bath to 0–5 °C.</li></ol><p class="note">Nitric acid is added to sulfuric acid, not the other way round. The benzoic acid flask stays in the bath all this time.</p>'),
  need: L('Приготовьте 1,5 + 1,5 мл и охладите', '1,5 + 1,5 мл дайындап, салқындатыңыз', 'Prepare 1.5 + 1.5 mL and cool it'),
  speeds: [5, 10],
  setup(S) { S.mix = S.mix || { s: 0, n: 0, T: 3, last: -999 }; },
  controls: [
    { kind: 'action', id: 'addS', once: false, group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('H₂SO₄ +0,5 мл', 'H₂SO₄ +0,5 мл', 'H₂SO₄ +0.5 mL'), advance: 20,
      do(S, lc, ctx) {
        const m = S.mix;
        if (m.n > 0) { ctx.remark({ key: 'order', severity: 'safety', text: L('нарушен порядок смешения: серную кислоту прилили к азотной', 'араластыру реті бұзылды: күкірт қышқылы азот қышқылына құйылды', 'wrong order of mixing: sulfuric acid added to nitric acid') }); m.T += 7; }
        m.s = +(m.s + 0.5).toFixed(1);
        ctx.log(L('В пробирку налито 0,5 мл конц. H₂SO₄', 'Пробиркаға 0,5 мл конц. H₂SO₄ құйылды', '0.5 mL of conc. H₂SO₄ put into the tube'));
        if (m.s > 1.5) ctx.feedback(L('Объём превышен. Слейте смесь в ёмкость для кислотных отходов и приготовьте заново.', 'Көлем асып кетті. Қоспаны қышқыл қалдықтар ыдысына төгіп, қайта дайындаңыз.', 'Too much acid. Pour the mixture into the acid waste and prepare it again.'), 'warn');
      } },
    { kind: 'action', id: 'addN', once: false, group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('HNO₃ +0,5 мл, по стенке', 'HNO₃ +0,5 мл, қабырға бойымен', 'HNO₃ +0.5 mL, down the wall'), advance: 20,
      do(S, lc, ctx) {
        const m = S.mix, now = ctx.now();
        if (m.s === 0) ctx.remark({ key: 'order', severity: 'safety', text: L('нарушен порядок смешения: азотную кислоту налили первой', 'араластыру реті бұзылды: азот қышқылы бірінші құйылды', 'wrong order of mixing: nitric acid put in first') });
        const quick = m.n > 0 && now - m.last < 45;
        m.last = now; m.n = +(m.n + 0.5).toFixed(1); m.T += quick ? 11 : 6.5;
        ctx.log(quick ? L('Прилито 0,5 мл конц. HNO₃ — слишком быстро', '0,5 мл конц. HNO₃ қосылды — тым жылдам', '0.5 mL of conc. HNO₃ added — too quickly') : L('Прилито 0,5 мл конц. HNO₃', '0,5 мл конц. HNO₃ қосылды', '0.5 mL of conc. HNO₃ added'));
        if (m.T > 30) { S.mixHot = true; ctx.remark({ key: 'mixhot', severity: 'major', text: L('нитрующая смесь перегрета при смешении (выше 30 °C): часть HNO₃ разложилась до NO₂', 'нитрлеуші қоспа араластыру кезінде қызып кетті (30 °C-тан жоғары): HNO₃-тің бір бөлігі NO₂-ге дейін ыдырады', 'nitrating mixture overheated while mixing (above 30 °C): some HNO₃ decomposed to NO₂') }); }
        if (m.T > 18) ctx.feedback(L('Смесь сильно разогрелась. Дождитесь охлаждения, прежде чем приливать следующую порцию.', 'Қоспа қатты қызды. Келесі порцияны құймас бұрын салқындағанын күтіңіз.', 'The mixture has warmed up a lot. Let it cool before adding the next portion.'), 'warn');
        if (m.n > 1.5) ctx.feedback(L('Объём превышен. Слейте смесь в ёмкость для кислотных отходов и приготовьте заново.', 'Көлем асып кетті. Қоспаны қышқыл қалдықтар ыдысына төгіп, қайта дайындаңыз.', 'Too much acid. Pour the mixture into the acid waste and prepare it again.'), 'warn');
      } },
    { kind: 'action', id: 'reset', once: false, cls: 'danger', group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('Слить в отходы, приготовить заново', 'Қалдыққа төгіп, қайта дайындау', 'Discard into waste and start again'),
      do(S, lc, ctx) { S.mix = { s: 0, n: 0, T: 3, last: -999 }; ctx.feedback(null); }, log: L('Нитрующая смесь слита в ёмкость для кислотных отходов', 'Нитрлеуші қоспа қышқыл қалдықтар ыдысына төгілді', 'Nitrating mixture poured into the acid waste') },
  ],
  tick(S, lc, dt) {
    S.mix.T = relax(S.mix.T, 1, 0.02, dt);
    S.T = relax(S.T, S.Tb + 1.5, 0.01, dt);
  },
  readouts: (S) => {
    const m = S.mix;
    return [
      { label: 'H₂SO₄', value: { ru: n(m.s, 1) + ' мл', kk: n(m.s, 1) + ' мл', en: n(m.s, 1) + ' mL' }, st: m.s === 1.5 ? 'ok' : m.s > 1.5 ? 'bad' : '' },
      { label: 'HNO₃', value: { ru: n(m.n, 1) + ' мл', kk: n(m.n, 1) + ' мл', en: n(m.n, 1) + ' mL' }, st: m.n === 1.5 ? 'ok' : m.n > 1.5 ? 'bad' : '' },
      { label: L('Смесь', 'Қоспа', 'Mixture'), value: n(m.T, 1) + ' °C', st: m.T > 30 ? 'bad' : m.T > 10 ? 'warn' : 'ok' },
    ];
  },
  done(S, lc, ctx) {
    const m = S.mix;
    if (m.s === 1.5 && m.n === 1.5 && m.T <= 5) {
      ctx.log(L(`Нитрующая смесь (3,0 мл) готова и охлаждена до ${n(m.T, 1)} °C`, `Нитрлеуші қоспа (3,0 мл) дайын және ${n(m.T, 1)} °C-қа дейін салқындатылды`, `Nitrating mixture (3.0 mL) ready and cooled to ${n(m.T, 1)} °C`), 'obs');
      return { text: L('Нитрующая смесь готова.', 'Нитрлеуші қоспа дайын.', 'The nitrating mixture is ready.') };
    }
    return false;
  },
  scene: mixScene,
};

const RUNAWAY = {
  ru: 'Температура в колбе превысила 30 °C: реакция нитрования вышла из-под контроля. Выделяется много бурого ядовитого NO₂, идут окисление и динитрование, кислотную смесь может выбросить из колбы. В реальной лаборатории прибавление немедленно прекращают, экран вытяжного шкафа опускают, сообщают преподавателю; смесь непригодна — синтез начинают заново с новой навески.',
  kk: 'Колбадағы температура 30 °C-тан асты: нитрлеу реакциясы бақылаудан шықты. Көп мөлшерде қоңыр улы NO₂ бөлінеді, тотығу мен динитрлеу жүреді, қышқыл қоспа колбадан атылып шығуы мүмкін. Нақты зертханада қосуды бірден тоқтатып, тартпа шкаф экранын түсіріп, оқытушыға хабарлайды; қоспа жарамсыз — синтезді жаңа өлшендіден қайта бастайды.',
  en: 'The flask temperature rose above 30 °C: the nitration has run away. Large amounts of toxic brown NO₂ are evolved, oxidation and dinitration take over, and the acid mixture may be thrown out of the flask. In a real lab you stop adding at once, lower the hood sash and tell the instructor; the mixture is useless — the synthesis is restarted from a new sample.',
};

const s6 = {
  type: 'add', id: 'nitr',
  title: L('Нитрование: прибавление по каплям', 'Нитрлеу: тамшылатып қосу', 'Nitration: dropwise addition'),
  instr: L('<ol><li>Холодную нитрующую смесь (3,0 мл ≈ 60 капель) прибавляйте <b>по каплям</b> к раствору бензойной кислоты при постоянном перемешивании.</li><li>Температура не должна подниматься <b>выше 5–10 °C</b>. Прибавление занимает 10–15 минут.</li></ol><p class="note">Растёт температура — прекратите прибавление, перемешивайте, подсыпьте в баню лёд с солью. Капать можно вручную или в выбранном ритме.</p>',
    '<ol><li>Суық нитрлеуші қоспаны (3,0 мл ≈ 60 тамшы) бензой қышқылының ерітіндісіне үздіксіз араластыра отырып <b>тамшылатып</b> қосыңыз.</li><li>Температура <b>5–10 °C-тан</b> аспауы тиіс. Қосу 10–15 минутқа созылады.</li></ol><p class="note">Температура көтерілсе — қосуды тоқтатып, араластырыңыз, моншаға тұзы бар мұз салыңыз. Қолмен немесе таңдалған ырғақпен тамызуға болады.</p>',
    '<ol><li>Add the cold nitrating mixture (3.0 mL ≈ 60 drops) <b>dropwise</b> to the benzoic acid solution with constant stirring.</li><li>The temperature must not rise <b>above 5–10 °C</b>. The addition takes 10–15 minutes.</li></ol><p class="note">If the temperature climbs, stop adding, keep stirring and add more ice and salt to the bath. Drop by hand or choose a steady rhythm.</p>'),
  need: L('Прибавьте всю нитрующую смесь', 'Бүкіл нитрлеуші қоспаны қосыңыз', 'Add all of the nitrating mixture'),
  speeds: [5, 10, 20],
  setup(S, lc) { if (S.bath.in) S.T = Math.max(S.Tb + 1.5, Math.min(S.T, 4)); lc.pend = 0; },
  add: {
    label: L('Капля', 'Тамшы', 'Drop'), total: 60, big: true,
    group: L('Капельная пипетка · интервал между каплями', 'Тамшуыр · тамшылар арасындағы аралық', 'Dropping pipette · interval between drops'),
    rhythms: [[0, L('вручную', 'қолмен', 'by hand')], [15, L('15 с', '15 с', '15 s')], [10, L('10 с', '10 с', '10 s')], [6, L('6 с', '6 с', '6 s')]],
    onAdd(S, lc, ctx) {
      const N = S.nit;
      if (N.t0 == null) { N.t0 = ctx.now(); ctx.log(L('Начато прибавление нитрующей смеси по каплям', 'Нитрлеуші қоспаны тамшылатып қосу басталды', 'Dropwise addition of the nitrating mixture started')); }
      N.drops = lc.added; lc.pend += 1.5; lc.dropKey = (lc.dropKey || 0) + 1;
      if (S.T > 10.5) ctx.remark({ key: 'dropHot', severity: 'major', text: L('нитрующую смесь прибавляли при температуре выше 10 °C', 'нитрлеуші қоспа 10 °C-тан жоғары температурада қосылды', 'nitrating mixture added while above 10 °C') });
      if (lc.added >= 60) {
        N.t1 = ctx.now();
        const min = (N.t1 - N.t0) / 60;
        ctx.log(L(`Прибавлено 3,0 мл нитрующей смеси за ${n(min, 1)} мин; максимальная температура ${n(N.maxT, 1)} °C`, `3,0 мл нитрлеуші қоспа ${n(min, 1)} мин ішінде қосылды; ең жоғары температура ${n(N.maxT, 1)} °C`, `3.0 mL of nitrating mixture added in ${n(min, 1)} min; maximum temperature ${n(N.maxT, 1)} °C`), 'obs');
        if (min < 7) ctx.remark({ key: 'fast', severity: 'minor', text: L(`прибавление слишком быстрое (${n(min, 1)} мин вместо 10–15)`, `қосу тым жылдам (10–15 мин орнына ${n(min, 1)} мин)`, `addition too fast (${n(min, 1)} min instead of 10–15)`) });
        ctx.log(N.maxT <= 10 ? L('Температура всё время оставалась в пределах 0–10 °C; раствор светло-жёлтый', 'Температура үнемі 0–10 °C шегінде болды; ерітінді ашық сары', 'The temperature stayed within 0–10 °C throughout; the solution is pale yellow')
          : L('Раствор жёлто-оранжевый, над колбой появлялись бурые пары', 'Ерітінді сарғыш-қызғылт сары, колба үстінде қоңыр булар пайда болды', 'The solution is yellow-orange; brown fumes appeared above the flask'), 'obs');
      }
    },
  },
  controls: [
    { kind: 'toggle', id: 'stir', group: L('Колба и баня', 'Колба және монша', 'Flask and bath'), label: L('Перемешивать', 'Араластыру', 'Stir'), labelOn: L('Перемешивание: вкл.', 'Араластыру: қосулы', 'Stirring: on') },
    { kind: 'action', id: 'ice', once: false, group: L('Колба и баня', 'Колба және монша', 'Flask and bath'), label: L('Подсыпать лёд с солью', 'Тұзы бар мұз салу', 'Add ice and salt'), advance: 30, do(S) { S.Tb = Math.min(S.Tb, -8); S.bath.ice = true; S.bath.salt = true; }, log: L('В баню подсыпали лёд с солью', 'Моншаға тұзы бар мұз салынды', 'Ice and salt added to the bath') },
    { kind: 'action', id: 'back', once: false, group: L('Колба и баня', 'Колба және монша', 'Flask and bath'), label: L('Вернуть колбу в баню', 'Колбаны моншаға қайтару', 'Put the flask back into the bath'), advance: 10,
      disabled: (S) => S.bath.in !== false, do(S) { S.bath.in = true; }, log: L('Колба возвращена в охлаждающую баню', 'Колба салқындатқыш моншаға қайтарылды', 'Flask returned to the cooling bath') },
  ],
  tick(S, lc, dt, ctx) {
    const N = S.nit;
    S.Tb = Math.min(12, S.Tb + 0.004 * dt);
    const rel = Math.min(lc.pend, lc.pend * 0.35 * dt);
    lc.pend -= rel;
    // колба вне бани (событие «вынуть колбу») остывает только на воздухе — теплота реакции не отводится
    const out = S.bath.in === false;
    S.T += rel - (S.T - (out ? 22 : S.Tb)) * Math.min(1, (out ? 0.0015 : lc.c.stir ? 0.03 : 0.012) * dt);
    if (N.t0 != null) { N.maxT = Math.max(N.maxT, S.T); if (S.T > 10) { N.E += (S.T - 10) * dt; N.hot += dt; } }
    if (S.T > 30 && !N.run) {
      N.run = 1; lc.rh = 0;
      ctx.remark({ key: 'runaway', severity: 'critical', text: L('перегрев выше 30 °C: реакция вышла из-под контроля (окисление, NO₂, динитрование)', '30 °C-тан жоғары қызу: реакция бақылаудан шықты (тотығу, NO₂, динитрлеу)', 'overheating above 30 °C: runaway reaction (oxidation, NO₂, dinitration)'), critical: { text: RUNAWAY } });
    }
  },
  alerts(S) {
    if (S.bath.in === false) return { text: L('Колба вне бани — теплота реакции не отводится. Верните колбу в баню.', 'Колба моншадан тыс — реакция жылуы әкетілмейді. Колбаны моншаға қайтарыңыз.', 'The flask is out of the bath — the heat of reaction is not removed. Put the flask back into the bath.'), kind: 'bad' };
    if (S.T > 20) return { text: L('Выше 20 °C: выделяется много бурого NO₂, идут окисление и динитрование. Прекратите прибавление и охлаждайте!', '20 °C-тан жоғары: қоңыр NO₂ көп бөлінеді, тотығу мен динитрлеу жүреді. Қосуды тоқтатып, салқындатыңыз!', 'Above 20 °C: much brown NO₂ is evolved; oxidation and dinitration set in. Stop adding and cool!'), kind: 'bad' };
    if (S.T > 10) return { text: L('Температура выше 10 °C. Прекратите прибавление, перемешивайте, подсыпьте лёд с солью.', 'Температура 10 °C-тан жоғары. Қосуды тоқтатып, араластырыңыз, тұзы бар мұз салыңыз.', 'Temperature above 10 °C. Stop adding, keep stirring, add ice and salt.'), kind: 'warn' };
    return null;
  },
  events: [{
    id: 'fumes', when: (S) => S.T > 14,
    title: L('Над колбой появились бурые пары', 'Колба үстінде қоңыр булар пайда болды', 'Brown fumes above the flask'),
    text: L('Температура в колбе быстро растёт, над раствором поднимаются бурые пары диоксида азота. Что вы сделаете?', 'Колбадағы температура тез көтерілуде, ерітінді үстінде азот диоксидінің қоңыр булары көтерілуде. Не істейсіз?', 'The temperature in the flask is climbing fast and brown nitrogen dioxide fumes are rising above the solution. What do you do?'),
    options: [
      { ok: true, label: L('Прекратить прибавление, перемешивать, подсыпать в баню лёд с солью', 'Қосуды тоқтатып, араластыру, моншаға тұзы бар мұз салу', 'Stop adding, stir, add ice and salt to the bath'), effect(S, lc) { lc.rh = 0; lc.c.stir = true; S.Tb = Math.min(S.Tb, -8); S.bath.salt = true; }, log: L('Прибавление остановлено, смесь перемешивается, в баню добавлен лёд с солью', 'Қосу тоқтатылды, қоспа араластырылуда, моншаға тұзы бар мұз қосылды', 'Addition stopped, the mixture is stirred, ice and salt added to the bath') },
      { ok: false, severity: 'major', label: L('Продолжать прибавление — скоро всё закончится', 'Қосуды жалғастыру — жақында бітеді', 'Keep adding — it will be over soon'), remark: L('прибавление продолжено при бурых парах и росте температуры', 'қоңыр булар мен температура өсуі кезінде қосу жалғастырылды', 'addition continued despite brown fumes and rising temperature'), effect(S, lc) { lc.pend += 3; } },
      { ok: false, severity: 'safety', label: L('Поднять экран шкафа, чтобы лучше рассмотреть пары', 'Буды жақсырақ көру үшін шкаф экранын көтеру', 'Raise the hood sash to see the fumes better'), remark: L('экран вытяжного шкафа поднят при выделении NO₂ (п. 4.4 правил ТБ)', 'NO₂ бөлінгенде тартпа шкаф экраны көтерілді (ҚТ ережелерінің 4.4-тармағы)', 'hood sash raised while NO₂ was evolved (safety rule 4.4)'), effect(S, lc) { lc.rh = 0; } },
      { ok: false, severity: 'major', label: L('Вынуть колбу из бани и подождать', 'Колбаны моншадан алып, күту', 'Take the flask out of the bath and wait'), remark: L('колбу вынули из охлаждающей бани во время нитрования', 'нитрлеу кезінде колба салқындатқыш моншадан алынды', 'flask taken out of the cooling bath during the nitration'), effect(S, lc) { lc.rh = 0; S.T += 4; S.bath.in = false; } },
    ],
  }],
  chart: { label: L('Термограмма: температура в колбе во времени', 'Термограмма: колбадағы температураның уақытқа тәуелділігі', 'Thermogram: flask temperature over time'), value: (S) => S.T, min: -10, max: 40, band: [0, 10], limit: 10, every: 5, active: (S, lc) => S.nit.t0 != null && (S.nit.t1 == null || lc.added < 60 || (lc.chartT || 0) < (S.nit.t1 - S.nit.t0) + 90), empty: L('термограмма начнётся с первой капли', 'термограмма бірінші тамшыдан басталады', 'the thermogram starts with the first drop') },
  done: (S, lc) => lc.added >= 60 && S.T < 15 && { text: L('Прибавление закончено.', 'Қосу аяқталды.', 'Addition complete.') },
  scene: (S, lc) => flaskScene(S, { bath: S.bath.in !== false, th: true, rod: true, stir: lc.c && lc.c.stir, pip: true, dropKey: lc.dropKey, vol: S.vAcid + 1 + lc.added * 0.05, color: lc.added ? 'var(--liq-y)' : null, fumes: Math.max(0, Math.min(0.9, (S.T - 14) / 12)) }),
};
// Время прибавления в показаниях: считаем по часам опыта
s6.readouts = (S, lc) => {
  const N = S.nit;
  const tm = N.t0 == null ? null : ((N.t1 != null ? N.t1 : N.tNow || N.t0) - N.t0) / 60;
  return [
    { label: L('Раствор', 'Ерітінді', 'Solution'), value: n(S.T, 1) + ' °C', st: S.T > 20 ? 'bad' : S.T > 10 ? 'warn' : 'ok' },
    { label: L('Баня', 'Монша', 'Bath'), value: n(S.Tb, 1) + ' °C' },
    { label: L('Капель', 'Тамшы', 'Drops'), value: `${lc.added} / 60` },
    { label: L('Время', 'Уақыт', 'Time'), value: tm == null ? '—' : { ru: n(tm, 1) + ' мин', kk: n(tm, 1) + ' мин', en: n(tm, 1) + ' min' } },
  ];
};
const tick6 = s6.tick;
s6.tick = (S, lc, dt, ctx) => { tick6(S, lc, dt, ctx); S.nit.tNow = ctx.now(); };

const s7 = {
  type: 'process', id: 'hold',
  title: L('Выдержка реакционной смеси', 'Реакциялық қоспаны ұстау', 'Holding the reaction mixture'),
  instr: L('<ol><li>Выдержите смесь в ледяной бане ещё <b>10–15 минут</b>, периодически перемешивая.</li><li>Затем выньте колбу и оставьте при комнатной температуре на <b>10 минут</b>.</li></ol>',
    '<ol><li>Қоспаны мұз моншасында мезгіл-мезгіл араластыра отырып тағы <b>10–15 минут</b> ұстаңыз.</li><li>Содан кейін колбаны алып, бөлме температурасында <b>10 минутқа</b> қалдырыңыз.</li></ol>',
    '<ol><li>Keep the mixture in the ice bath for another <b>10–15 minutes</b>, stirring from time to time.</li><li>Then take the flask out and leave it at room temperature for <b>10 minutes</b>.</li></ol>'),
  need: L('Выдержите смесь в бане, затем при комнатной температуре', 'Қоспаны моншада, содан кейін бөлме температурасында ұстаңыз', 'Hold the mixture in the bath, then at room temperature'),
  speeds: null,
  controls: [
    { kind: 'action', id: 'bath', once: false, label: L('В бане, перемешивая: +5 мин', 'Моншада, араластыра: +5 мин', 'In the bath, stirring: +5 min'), advance: 300,
      disabled: (S) => S.hold.room > 0,
      do(S, lc, ctx) {
        S.hold.bath += 300; S.T = relax(S.T, S.Tb + 1, 0.95, 1);
        ctx.log(L('Выдержка в ледяной бане 5 мин, перемешивание', 'Мұз моншасында 5 мин ұстау, араластыру', 'Held in the ice bath for 5 min with stirring'));
        if (S.hold.bath === 300) ctx.log(L('Смесь густеет, из раствора начинает выделяться осадок', 'Қоспа қоюланып, ерітіндіден тұнба бөліне бастайды', 'The mixture thickens; a solid starts to separate'), 'obs');
      } },
    { kind: 'action', id: 'room', once: false, label: L('Вынуть из бани: +5 мин при комн. т-ре', 'Моншадан алу: бөлме t-да +5 мин', 'Out of the bath: +5 min at room temp.'), advance: 300,
      do(S, lc, ctx) {
        if (S.hold.room === 0) { S.bath.in = false; if (S.hold.bath < 600) ctx.remark({ key: 'hold', severity: 'minor', text: L('колбу вынули из бани раньше 10 минут выдержки', 'колба моншадан 10 минут ұстағанға дейін алынды', 'flask taken out of the bath before 10 minutes') }); }
        S.hold.room += 300; S.T = relax(S.T, 21, 0.6, 1);
        ctx.log(L('Выдержка при комнатной температуре 5 мин', 'Бөлме температурасында 5 мин ұстау', 'Held at room temperature for 5 min'));
      } },
  ],
  readouts: (S) => [
    { label: L('В бане', 'Моншада', 'In the bath'), value: { ru: S.hold.bath / 60 + ' мин', kk: S.hold.bath / 60 + ' мин', en: S.hold.bath / 60 + ' min' }, st: S.hold.bath >= 600 ? 'ok' : '' },
    { label: L('При комн. т-ре', 'Бөлме t-да', 'At room temp.'), value: { ru: S.hold.room / 60 + ' мин', kk: S.hold.room / 60 + ' мин', en: S.hold.room / 60 + ' min' }, st: S.hold.room >= 600 ? 'ok' : '' },
    { label: L('Раствор', 'Ерітінді', 'Solution'), value: n(S.T, 1) + ' °C' },
  ],
  done: (S) => S.hold.room >= 600 && S.hold.bath >= 300 && { text: L('Нитрование завершено.', 'Нитрлеу аяқталды.', 'Nitration complete.') },
  scene: (S) => flaskScene(S, { bath: S.bath.in, th: true, rod: true, vol: S.vAcid + 4, color: 'var(--liq-y)', solid: Math.min(0.6, 0.15 + S.hold.bath / 2000) }),
};

const s8 = {
  type: 'decide', id: 'pour',
  title: L('Выливание на лёд', 'Мұзға төгу', 'Pouring onto ice'),
  instr: L('<ol><li>Подберите массу колотого льда в стакане по методичке (<b>30–40 г</b>).</li><li>Выберите, как разбавить реакционную смесь.</li></ol><p class="note">Выпадает осадок сырого продукта белого или бледно-жёлтого цвета.</p>',
    '<ol><li>Стақандағы уатылған мұздың массасын әдістеме бойынша таңдаңыз (<b>30–40 г</b>).</li><li>Реакциялық қоспаны қалай сұйылту керектігін таңдаңыз.</li></ol><p class="note">Ақ немесе ақшыл сары түсті шикі өнім тұнбасы түзіледі.</p>',
    '<ol><li>Choose the mass of crushed ice in the beaker as in the manual (<b>30–40 g</b>).</li><li>Choose how to dilute the reaction mixture.</li></ol><p class="note">The crude product precipitates as a white or pale yellow solid.</p>'),
  need: L('Вылейте смесь на лёд', 'Қоспаны мұзға төгіңіз', 'Pour the mixture onto ice'),
  inputs: [{ id: 'ice', label: L('Колотый лёд, г', 'Уатылған мұз, г', 'Crushed ice, g'), min: 10, max: 60, step: 5, value: 15, unit: L('г', 'г', 'g') }],
  question: L('Как разбавить реакционную смесь?', 'Реакциялық қоспаны қалай сұйылтады?', 'How do you dilute the reaction mixture?'),
  options: [
    { id: 'ok', ok: true, label: L('Медленно вылить смесь на лёд, перемешивая', 'Қоспаны араластыра отырып, мұзға баяу төгу', 'Pour the mixture slowly onto the ice, stirring'), advance: 120,
      effect(S, inp) { S.pour = { loss: 0, ice: inp.ice, method: 'ok' }; },
      why: L('кислоту — в воду (лёд), медленно, при перемешивании', 'қышқылды — суға (мұзға), баяу, араластыра отырып', 'acid into water (ice), slowly, with stirring') },
    { id: 'fast', ok: false, severity: 'minor', label: L('Вылить на лёд быстро, одной порцией', 'Мұзға тез, бір порциямен төгу', 'Pour it onto the ice quickly, all at once'), advance: 60,
      remark: L('смесь вылита на лёд одной порцией — местный перегрев, комки, потери', 'қоспа мұзға бір порциямен төгілді — жергілікті қызу, кесектер, шығын', 'mixture poured onto ice all at once — local overheating, lumps, losses'),
      whatif: L('Теплота разбавления выделяется сразу: лёд местами тает, смесь шипит и разогревается, продукт выпадает комками и захватывает кислоту и примеси.', 'Сұйылту жылуы бірден бөлінеді: мұз жер-жерде ериді, қоспа ысылдап қызады, өнім кесек болып түзіліп, қышқыл мен қоспаларды ұстап қалады.', 'The heat of dilution is released at once: the ice melts locally, the mixture hisses and warms up, and the product comes down in lumps that trap acid and impurities.'),
      effect(S, inp) { S.pour = { loss: 0.03, ice: inp.ice, method: 'fast' }; } },
    { id: 'water', ok: false, label: L('Прилить в колбу холодную воду', 'Колбаға суық су құю', 'Pour cold water into the flask'),
      remark: L('грубое нарушение ТБ: вода прилита к концентрированной кислотной смеси', 'ҚТ өрескел бұзылды: концентрлі қышқыл қоспасына су құйылды', 'serious safety violation: water added to the concentrated acid mixture'),
      critical: { text: L('Вода, прилитая к концентрированной серной кислоте, мгновенно вскипает: смесь вскипела, кислоту с продуктом выбросило из колбы. В реальной лаборатории это химический ожог рук и лица. Пострадавший участок промывают проточной водой не менее 15 минут (п. 12.1), о происшествии сообщают преподавателю. Синтез повторяют с новой навески. Правило: кислоту — в воду, никогда наоборот (п. 4.3).',
        'Концентрлі күкірт қышқылына құйылған су лезде қайнайды: қоспа қайнап, қышқыл өніммен бірге колбадан атылып шықты. Нақты зертханада бұл қол мен беттің химиялық күйігі. Зақымданған жерді кемінде 15 минут ағын сумен жуады (12.1-тармақ), оқиға туралы оқытушыға хабарлайды. Синтез жаңа өлшендіден қайталанады. Ереже: қышқылды — суға, ешқашан керісінше емес (4.3-тармақ).',
        'Water added to concentrated sulfuric acid boils instantly: the mixture erupted and acid with the product was thrown out of the flask. In a real lab this means chemical burns to the hands and face. The affected skin is rinsed under running water for at least 15 minutes (rule 12.1) and the instructor is told. The synthesis is repeated from a new sample. Rule: acid into water, never the reverse (rule 4.3).') } },
  ],
  check(S, inp, ctx) {
    const E = S.nit.E;
    const col = E > 900 ? L('жёлтый, с оранжевым оттенком', 'қызғылт сары реңкті сары', 'yellow with an orange tinge') : E > 200 ? L('бледно-жёлтый', 'ақшыл сары', 'pale yellow') : L('белый, слегка кремовый', 'ақ, сәл кремді', 'white, slightly creamy');
    if (inp.ice < 25) {
      S.pour.loss += 0.04;
      ctx.remark({ key: 'ice', severity: 'minor', text: L(`мало льда (${inp.ice} г вместо 30–40 г): смесь разогрелась, часть продукта осталась в растворе`, `мұз аз (30–40 г орнына ${inp.ice} г): қоспа қызып, өнімнің бір бөлігі ерітіндіде қалды`, `too little ice (${inp.ice} g instead of 30–40 g): the mixture warmed up and some product stayed in solution`) });
    }
    const base = S.pour.method === 'fast'
      ? L(`Смесь вылита разом: шипение, разогревание, осадок комковатый (${col.ru}).`, `Қоспа бірден төгілді: ысылдау, қызу, тұнба кесекті (${col.kk}).`, `Poured all at once: hissing, warming, lumpy precipitate (${col.en}).`)
      : L(`Смесь медленно вылита на ${inp.ice} г льда при перемешивании. Выпал мелкокристаллический осадок — ${col.ru}.`, `Қоспа араластыра отырып ${inp.ice} г мұзға баяу төгілді. Ұсақ кристалды тұнба түзілді — ${col.kk}.`, `The mixture was poured slowly onto ${inp.ice} g of ice with stirring. A finely crystalline precipitate formed — ${col.en}.`);
    ctx.log(inp.ice < 25 ? { ru: base.ru + ' Лёд полностью растаял, смесь тёплая.', kk: base.kk + ' Мұз толық еріп, қоспа жылы.', en: base.en + ' All the ice melted; the mixture is warm.' } : base, 'obs');
  },
  scene: pourScene,
};

const s9 = {
  type: 'quiz', id: 'q-ice',
  title: L('Вопросы преподавателя', 'Оқытушының сұрақтары', 'The instructor’s questions'),
  instr: L('<p>Пока осадок оседает, ответьте на вопросы преподавателя. Каждая ошибка записывается в журнал.</p>', '<p>Тұнба тұнып жатқанда, оқытушының сұрақтарына жауап беріңіз. Әр қате журналға жазылады.</p>', '<p>While the solid settles, answer the instructor’s questions. Every wrong answer is recorded in the notebook.</p>'),
  need: L('Ответьте на все вопросы', 'Барлық сұраққа жауап беріңіз', 'Answer all the questions'),
  questions: [
    { q: L('Зачем реакционную смесь выливают на лёд?', 'Реакциялық қоспаны не үшін мұзға төгеді?', 'Why is the reaction mixture poured onto ice?'),
      options: [L('Чтобы разбавить кислоту без перегрева и осадить малорастворимый в холодной воде продукт', 'Қышқылды қызып кетпей сұйылту және суық суда нашар еритін өнімді тұндыру үшін', 'To dilute the acid without overheating and precipitate the product, which is poorly soluble in cold water'), L('Чтобы продолжить нитрование при низкой температуре', 'Нитрлеуді төмен температурада жалғастыру үшін', 'To continue the nitration at low temperature'), L('Чтобы нейтрализовать серную кислоту', 'Күкірт қышқылын бейтараптау үшін', 'To neutralise the sulfuric acid'), L('Чтобы растворить продукт', 'Өнімді еріту үшін', 'To dissolve the product')],
      correct: 0, why: L('Лёд поглощает теплоту разбавления; м-нитробензойная кислота плохо растворима в холодной воде и выпадает в осадок.', 'Мұз сұйылту жылуын сіңіреді; м-нитробензой қышқылы суық суда нашар ериді және тұнбаға түседі.', 'The ice absorbs the heat of dilution; m-nitrobenzoic acid is poorly soluble in cold water and precipitates.') },
    { q: L('Какой изомер — основной побочный продукт и где он в основном остаётся?', 'Қай изомер — негізгі қосымша өнім және ол негізінен қайда қалады?', 'Which isomer is the main by-product and where does it mostly end up?'),
      options: [L('Орто-изомер; остаётся в маточном растворе после перекристаллизации', 'Орто-изомер; қайта кристалдаудан кейін аналық ерітіндіде қалады', 'The ortho isomer; it stays in the mother liquor after recrystallisation'), L('Пара-изомер; выпадает первым', 'Пара-изомер; бірінші түзіледі', 'The para isomer; it crystallises first'), L('Динитробензол; улетучивается', 'Динитробензол; ұшып кетеді', 'Dinitrobenzene; it evaporates'), L('Побочных продуктов нет', 'Қосымша өнімдер жоқ', 'There are no by-products')],
      correct: 0, why: L('≈ 19 % орто-изомера; он лучше растворим в воде, чем мета-изомер.', '≈ 19 % орто-изомер; ол суда мета-изомерге қарағанда жақсы ериді.', 'About 19 % ortho isomer; it is more soluble in water than the meta isomer.') },
  ],
};

const s10 = {
  type: 'assemble', id: 'vac-setup',
  title: L('Сборка установки для вакуумного фильтрования', 'Вакуумда сүзу қондырғысын жинау', 'Assembling the vacuum filtration set-up'),
  instr: L('<p>Соберите установку для фильтрования под вакуумом: выберите деталь и нажмите место, куда её поставить (в панели или на стенде).</p><p class="note">Ошибка сборки проявится при работе.</p>',
    '<p>Вакуумда сүзу қондырғысын жинаңыз: бөлшекті таңдап, оны қоятын орынды басыңыз (панельде немесе стендте).</p><p class="note">Жинаудағы қате жұмыс кезінде байқалады.</p>',
    '<p>Assemble the set-up for filtration under vacuum: choose a part and tap the place where it goes (in the panel or on the bench).</p><p class="note">An assembly mistake will show up during the work.</p>'),
  need: L('Соберите установку', 'Қондырғыны жинаңыз', 'Assemble the set-up'),
  parts: [
    { id: 'buchner', label: L('Воронка Бюхнера', 'Бюхнер шұңғымасы', 'Büchner funnel') },
    { id: 'funnel', label: L('Стеклянная воронка', 'Шыны шұңғыма', 'Glass funnel') },
    { id: 'cone', label: L('Резиновый конус', 'Резеңке конус', 'Rubber cone') },
    { id: 'stopper', label: L('Пробка с термометром', 'Термометрі бар тығын', 'Stopper with thermometer') },
    { id: 'bunsen', label: L('Колба Бунзена', 'Бунзен колбасы', 'Filter flask') },
    { id: 'conical', label: L('Коническая колба 250 мл', 'Конустық колба 250 мл', '250 mL conical flask') },
    { id: 'hose', label: L('Вакуумный шланг к насосу', 'Сорғыға вакуумдық шланг', 'Vacuum hose to the pump') },
  ],
  slots: [
    { id: 'top', label: L('Воронка', 'Шұңғыма', 'Funnel'), accepts: 'buchner', x: 140, y: 50 },
    { id: 'seal', label: L('Уплотнение', 'Тығыздағыш', 'Seal'), accepts: 'cone', x: 140, y: 100 },
    { id: 'flask', label: L('Приёмник фильтрата', 'Фильтрат қабылдағышы', 'Filtrate receiver'), accepts: 'bunsen', x: 140, y: 170 },
    { id: 'vac', label: L('Отвод → насос', 'Бұрма → сорғы', 'Side arm → pump'), accepts: 'hose', x: 250, y: 130 },
  ],
  base: filterBase,
  onDone(S, place) {
    S.leak = place.seal !== 'cone';
    S.thin = place.flask !== 'bunsen';
    S.glassFunnel = place.top !== 'buchner';
    S.noHose = place.vac !== 'hose';
  },
  hint1: L('Воронка Бюхнера ставится на толстостенную колбу Бунзена через резиновое уплотнение; отвод колбы соединяют шлангом с насосом.', 'Бюхнер шұңғымасы қалың қабырғалы Бунзен колбасына резеңке тығыздағыш арқылы қойылады; колба бұрмасы сорғымен шланг арқылы жалғанады.', 'The Büchner funnel sits on a thick-walled filter flask with a rubber seal; the side arm is connected to the pump with a hose.'),
};

const IMPLODE = {
  ru: 'Тонкостенная коническая колба не рассчитана на разрежение: при включении насоса её может раздавить атмосферным давлением (имплозия), осколки разлетаются. В реальной лаборатории для вакуумного фильтрования используют только толстостенную колбу Бунзена, а стеклянную посуду перед работой под вакуумом осматривают (п. 3.2, 9.1). Осколки собирают в ёмкость для боя стекла. Установку собирают заново.',
  kk: 'Жұқа қабырғалы конустық колба сиреуге шыдамайды: сорғыны қосқанда оны атмосфералық қысым жаншып жіберуі мүмкін (имплозия), сынықтар шашырайды. Нақты зертханада вакуумда сүзу үшін тек қалың қабырғалы Бунзен колбасын қолданады, ал шыны ыдысты вакуумда жұмыс істемес бұрын тексереді (3.2, 9.1-тармақтар). Сынықтарды сынған шыны ыдысына жинайды. Қондырғы қайта жиналады.',
  en: 'A thin-walled conical flask is not designed for vacuum: when the pump is switched on it can be crushed by atmospheric pressure (implosion) and glass fragments fly. In a real lab only a thick-walled filter flask is used for vacuum filtration, and glassware is inspected before working under vacuum (rules 3.2, 9.1). The fragments go into the broken-glass container. The set-up is assembled again.',
};

const s11 = {
  type: 'separate', id: 'filt', mode: 'filter', keep: 'cake',
  title: L('Фильтрование и промывание', 'Сүзу және жуу', 'Filtration and washing'),
  instr: L('<ol><li>Отфильтруйте осадок под вакуумом на воронке Бюхнера.</li><li>Промойте его на фильтре несколькими небольшими порциями <b>ледяной воды</b>, пока промывные воды не станут лишь слабокислыми — проверяйте индикаторной бумагой.</li></ol><p class="note">Перед выключением водоструйного насоса отсоедините шланг от колбы Бунзена.</p>',
    '<ol><li>Тұнбаны Бюхнер шұңғымасында вакуумда сүзіңіз.</li><li>Оны сүзгіде <b>мұздай судың</b> бірнеше аз порциясымен жуынды су әлсіз қышқыл болғанша жуыңыз — индикатор қағазымен тексеріп отырыңыз.</li></ol><p class="note">Су ағынды сорғыны өшірмес бұрын шлангты Бунзен колбасынан ажыратыңыз.</p>',
    '<ol><li>Filter off the solid under vacuum on a Büchner funnel.</li><li>Wash it on the filter with several small portions of <b>ice-cold water</b> until the washings are only weakly acidic — check with indicator paper.</li></ol><p class="note">Before switching off the water aspirator, disconnect the hose from the filter flask.</p>'),
  need: L('Отфильтруйте и промойте осадок', 'Тұнбаны сүзіп, жуыңыз', 'Filter and wash the solid'),
  liquids: [
    { id: 'ice', ok: true, label: L('Ледяная вода (~5 мл)', 'Мұздай су (~5 мл)', 'Ice-cold water (~5 mL)') },
    { id: 'warm', ok: false, severity: 'major', label: L('Тёплая вода (~5 мл)', 'Жылы су (~5 мл)', 'Warm water (~5 mL)'),
      remark: L('осадок промыт тёплой водой — часть продукта растворилась', 'тұнба жылы сумен жуылды — өнімнің бір бөлігі еріді', 'solid washed with warm water — some of the product dissolved'),
      whatif: L('Растворимость м-нитробензойной кислоты в воде быстро растёт с температурой: тёплая вода уносит продукт в фильтрат.', 'м-Нитробензой қышқылының судағы ерігіштігі температурамен тез өседі: жылы су өнімді фильтратқа алып кетеді.', 'The solubility of m-nitrobenzoic acid in water rises quickly with temperature: warm water carries the product into the filtrate.'),
      effect(S, F) { F.washLoss = (F.washLoss || 0) + 0.06; } },
    { id: 'naoh', ok: false, severity: 'major', points: 1, label: L('10 % NaOH (~5 мл) — смыть кислоту быстрее', '10 % NaOH (~5 мл) — қышқылды тезірек жуу', '10 % NaOH (~5 mL) — to wash out the acid faster'),
      remark: L('осадок промыт щёлочью — продукт перешёл в растворимую соль и ушёл в фильтрат', 'тұнба сілтімен жуылды — өнім еритін тұзға айналып, фильтратқа кетті', 'solid washed with alkali — the product turned into a soluble salt and went into the filtrate'),
      whatif: L('Карбоновая кислота со щёлочью даёт растворимую соль (м-нитробензоат натрия) — значительная часть продукта ушла в фильтрат.', 'Карбон қышқылы сілтімен еритін тұз (натрий м-нитробензоаты) түзеді — өнімнің едәуір бөлігі фильтратқа кетті.', 'A carboxylic acid forms a soluble salt with alkali (sodium m-nitrobenzoate) — a large part of the product went into the filtrate.'),
      effect(S, F) { F.washLoss = (F.washLoss || 0) + 0.6; } },
  ],
  okPH: 2.5,
  washings: (S, F) => (F.naohUsed ? 9 : washPH(F.iceWashes || 0)),
  onVacuum(S, F, ctx) {
    if (S.thin) { ctx.remark({ key: 'implode', severity: 'critical', text: L('вакуум включён на тонкостенной конической колбе — колба лопнула', 'вакуум жұқа қабырғалы конустық колбада қосылды — колба жарылды', 'vacuum applied to a thin-walled conical flask — the flask imploded'), critical: { text: IMPLODE } }); return false; }
    if (S.noHose) { ctx.feedback(L('Отвод колбы не соединён с насосом — разрежения нет.', 'Колба бұрмасы сорғыға жалғанбаған — сиреу жоқ.', 'The side arm is not connected to the pump — there is no vacuum.'), 'warn'); return false; }
    if (S.leak && !F.leakSeen) { F.leakSeen = true; ctx.log(L('Слышен подсос воздуха между воронкой и колбой — вакуум слабый', 'Шұңғыма мен колба арасынан ауа сорылғаны естіледі — вакуум әлсіз', 'Air hisses in between the funnel and the flask — the vacuum is weak'), 'obs'); }
    return true;
  },
  onTransfer(S, F, ctx) {
    if (S.leak) F.loss += 0.05;
    if (S.glassFunnel) { F.loss += 0.1; ctx.log(L('Через стеклянную воронку фильтрование идёт очень медленно, осадок забивает фильтр', 'Шыны шұңғыма арқылы сүзу өте баяу жүреді, тұнба сүзгіні бітейді', 'Through a glass funnel the filtration is very slow and the solid clogs the paper'), 'obs'); ctx.advance(900); }
    ctx.log(L('Фильтрат сильнокислый', 'Фильтрат күшті қышқыл', 'The filtrate is strongly acidic'), 'obs');
  },
  onWash(S, F, liq) {
    if (liq.id === 'ice') F.iceWashes = (F.iceWashes || 0) + 1;
    if (liq.id === 'naoh') F.naohUsed = true;
    F.washLoss = (F.washLoss || 0) + 0.012;
  },
  washFeedback(p) {
    const r = Math.round(p);
    if (r >= 8) return L('Бумага сине-зелёная — промывные воды щелочные: щёлочь перевела продукт в растворимую соль.', 'Қағаз көкшіл-жасыл — жуынды су сілтілі: сілті өнімді еритін тұзға айналдырды.', 'The paper is blue-green — the washings are alkaline: the alkali has turned the product into a soluble salt.');
    return r <= 1 ? L('Бумага красная — промывные воды сильнокислые.', 'Қағаз қызыл — жуынды су күшті қышқыл.', 'The paper is red — the washings are strongly acidic.')
      : r <= 2 ? L('Бумага красно-оранжевая — ещё кислые.', 'Қағаз қызыл-сарғыш — әлі қышқыл.', 'The paper is red-orange — still acidic.')
        : L('Бумага оранжевая — промывные воды слабокислые. Выше pH не поднимется: сама м-нитробензойная кислота немного растворима в воде (pH ≈ 3).', 'Қағаз қызғылт сары — жуынды су әлсіз қышқыл. pH бұдан жоғарыламайды: м-нитробензой қышқылының өзі суда аздап ериді (pH ≈ 3).', 'The paper is orange — the washings are weakly acidic. It will not get higher: m-nitrobenzoic acid itself is slightly soluble in water (pH ≈ 3).');
  },
  finishCheck(S, F, ctx) {
    const pH = washPH(F.iceWashes || 0);
    if (pH < 2.5 || F.lastCheck !== F.washes) ctx.remark({ key: 'wash', severity: 'major', text: L('осадок недостаточно промыт или не проверены последние промывные воды', 'тұнба жеткілікті жуылмаған немесе соңғы жуынды су тексерілмеген', 'solid insufficiently washed, or the last washings were not tested') });
    if (F.washes > 8) ctx.remark({ key: 'overwash', severity: 'minor', text: L('лишние промывки — потери продукта', 'артық жуу — өнім шығыны', 'too many washes — product lost') });
  },
  onFinish(S, F, ctx) {
    S.filt = { washes: F.washes, pH: washPH(F.iceWashes || 0), loss: F.washLoss || 0, tloss: F.loss || 0 };
    const c = makeCrude(S);
    const wm = n(c.tot * 1.3, 1);
    ctx.log(c.d > 0.08 ? L(`Сырой продукт отжат на фильтре: влажная масса ≈ ${wm} г, жёлтого цвета`, `Шикі өнім сүзгіде сығылды: ылғал массасы ≈ ${wm} г, сары түсті`, `Crude product pressed dry on the filter: wet mass ≈ ${wm} g, yellow`)
      : L(`Сырой продукт отжат на фильтре: влажная масса ≈ ${wm} г, белого с кремовым оттенком цвета`, `Шикі өнім сүзгіде сығылды: ылғал массасы ≈ ${wm} г, кремді реңкті ақ түсті`, `Crude product pressed dry on the filter: wet mass ≈ ${wm} g, creamy white`), 'obs');
  },
  cakeColor: (S) => (S.nit.E > 900 ? 'var(--warn)' : null),
  seal: (S) => !S.leak,
};

const s12 = {
  type: 'order', id: 'rec-order',
  title: L('План перекристаллизации', 'Қайта кристалдау жоспары', 'Recrystallisation plan'),
  instr: L('<p>Расставьте операции перекристаллизации из воды в правильном порядке (стрелками ↑ ↓).</p>', '<p>Судан қайта кристалдау операцияларын дұрыс ретпен орналастырыңыз (↑ ↓ көрсеткілерімен).</p>', '<p>Put the operations of recrystallisation from water in the right order (with the ↑ ↓ arrows).</p>'),
  need: L('Расставьте операции по порядку', 'Операцияларды ретімен орналастырыңыз', 'Put the operations in order'),
  items: [
    { id: 'a', label: L('Перенести сырой продукт в стакан', 'Шикі өнімді стақанға ауыстыру', 'Transfer the crude product to a beaker') },
    { id: 'b', label: L('Добавить немного воды и нагреть до кипения', 'Аздап су қосып, қайнағанша қыздыру', 'Add a little water and heat to boiling') },
    { id: 'c', label: L('Добавлять кипящую воду порциями до полного растворения', 'Толық ерігенше қайнаған суды порциялап қосу', 'Add boiling water in portions until everything dissolves') },
    { id: 'd', label: L('Снять с плитки и дать медленно остыть', 'Плитадан алып, баяу суытуға қалдыру', 'Take off the heat and let it cool slowly') },
    { id: 'e', label: L('Охладить во льду', 'Мұзда салқындату', 'Chill in ice') },
    { id: 'f', label: L('Отфильтровать под вакуумом, промыть ледяной водой', 'Вакуумда сүзіп, мұздай сумен жуу', 'Filter under vacuum, wash with ice-cold water') },
    { id: 'g', label: L('Высушить кристаллы на воздухе и взвесить', 'Кристалдарды ауада кептіріп, өлшеу', 'Dry the crystals in air and weigh them') },
  ],
};

const s13 = {
  type: 'process', id: 'recr',
  title: L('Перекристаллизация из воды', 'Судан қайта кристалдау', 'Recrystallisation from water'),
  instr: L('<ol><li>Перекристаллизуйте сырой продукт из <b>минимального объёма кипящей воды</b>: добавляйте воду порциями и нагревайте до кипения, пока вещество не растворится.</li><li>Охладите, затем выдержите во льду и отфильтруйте кристаллы.</li></ol><p class="note">Орто-изомер лучше растворим в воде и в основном остаётся в маточном растворе. Лишняя вода — лишние потери.</p>',
    '<ol><li>Шикі өнімді <b>қайнаған судың ең аз көлемінен</b> қайта кристалдаңыз: суды порциялап қосып, зат ерігенше қайнағанға дейін қыздырыңыз.</li><li>Суытып, содан кейін мұзда ұстап, кристалдарды сүзіңіз.</li></ol><p class="note">Орто-изомер суда жақсы ериді және негізінен аналық ерітіндіде қалады. Артық су — артық шығын.</p>',
    '<ol><li>Recrystallise the crude product from the <b>minimum volume of boiling water</b>: add water in portions and heat to boiling until the solid dissolves.</li><li>Let it cool, then chill in ice and filter off the crystals.</li></ol><p class="note">The ortho isomer is more soluble in water and mostly stays in the mother liquor. Extra water means extra losses.</p>'),
  need: L('Перекристаллизуйте продукт', 'Өнімді қайта кристалдаңыз', 'Recrystallise the product'),
  speeds: [10, 20, 40],
  setup(S, lc, ctx) {
    lc.T = 22; lc.phase = 0; lc.c.heat = false;
    S.rec = { V: 0, full: false, shock: false, Vneed: 0 };
    const c = S.crude;
    S.rec.Vneed = Math.round((c.meta + c.para + c.di * 0.8 + c.ba * 0.6 + c.ortho * 0.3) / solubility(100));
    ctx.log(L(`Сырой продукт (≈ ${n(c.tot, 2)} г в пересчёте на сухое вещество) перенесён в стакан на 150 мл`, `Шикі өнім (құрғақ затқа шаққанда ≈ ${n(c.tot, 2)} г) 150 мл стақанға ауыстырылды`, `Crude product (≈ ${n(c.tot, 2)} g on a dry basis) transferred to a 150 mL beaker`));
  },
  controls: [
    { kind: 'action', id: 'w10', once: false, group: L('Вода и нагрев', 'Су және қыздыру', 'Water and heating'), label: L('Добавить воды +10 мл', 'Су қосу +10 мл', 'Add water +10 mL'), advance: 30, disabled: (S, lc) => lc.phase > 0, do(S, lc) { S.rec.V += 10; lc.T -= (lc.T - 22) * 10 / (S.rec.V + 5); } },
    { kind: 'action', id: 'w5', once: false, group: L('Вода и нагрев', 'Су және қыздыру', 'Water and heating'), label: L('Добавить воды +5 мл', 'Су қосу +5 мл', 'Add water +5 mL'), advance: 30, disabled: (S, lc) => lc.phase > 0, do(S, lc) { S.rec.V += 5; lc.T -= (lc.T - 22) * 5 / (S.rec.V + 5); } },
    { kind: 'toggle', id: 'heat', group: L('Вода и нагрев', 'Су және қыздыру', 'Water and heating'), label: L('Плитка: включить', 'Плита: қосу', 'Hot plate: on'), labelOn: L('Плитка: выключить', 'Плита: өшіру', 'Hot plate: off'), disabled: (S, lc) => lc.phase > 0 },
    { kind: 'action', id: 'slow', cls: 'pri', group: L('Охлаждение', 'Салқындату', 'Cooling'), label: L('Снять с плитки, остудить, затем лёд', 'Плитадан алып, суыту, содан кейін мұз', 'Remove from heat, cool, then ice'), disabled: (S, lc) => lc.phase > 0, do: (S, lc, ctx) => cool(S, lc, ctx, false) },
    { kind: 'action', id: 'shock', group: L('Охлаждение', 'Салқындату', 'Cooling'), label: L('Сразу поставить в ледяную баню', 'Бірден мұз моншасына қою', 'Put straight into an ice bath'), disabled: (S, lc) => lc.phase > 0, do: (S, lc, ctx) => cool(S, lc, ctx, true) },
    { kind: 'action', id: 'filt', group: L('Охлаждение', 'Салқындату', 'Cooling'), label: L('Отфильтровать, промыть 2–3 мл ледяной воды', 'Сүзіп, 2–3 мл мұздай сумен жуу', 'Filter, wash with 2–3 mL of ice-cold water'), disabled: (S, lc) => lc.phase !== 1, advance: 300,
      do(S, lc, ctx) { lc.phase = 2; makeFin(S); ctx.log(L('Кристаллы отфильтрованы под вакуумом; маточный раствор (с орто-изомером) слит в отходы', 'Кристалдар вакуумда сүзілді; аналық ерітінді (орто-изомермен) қалдыққа құйылды', 'Crystals filtered off under vacuum; the mother liquor (with the ortho isomer) discarded to waste'), 'obs'); } },
  ],
  tick(S, lc, dt) {
    if (lc.phase) return;
    const on = lc.c.heat;
    lc.T = Math.min(100, relax(lc.T, on ? 104 : 22, (on ? 0.0045 : 0.002) * (S.rec.V ? 1 : 3), dt));
    lc.und = undissolved(S, lc.T);
  },
  alerts(S, lc) {
    lc.und = undissolved(S, lc.T);
    if (lc.phase) return null;
    if (lc.T >= 99.5 && S.rec.V > 0 && lc.und < 0.005) return { text: L('Раствор прозрачный. Снимите стакан с плитки.', 'Ерітінді мөлдір. Стақанды плитадан алыңыз.', 'The solution is clear. Take the beaker off the hot plate.'), kind: 'good' };
    if (lc.T > 88 && lc.und > 0.25 && S.rec.V > 0) return { text: L('На дне собираются маслянистые капли — вещество плавится под горячей водой. Добавьте воды и кипятите до полного растворения.', 'Түбінде майлы тамшылар жиналуда — зат ыстық судың астында балқиды. Су қосып, толық ерігенше қайнатыңыз.', 'Oily droplets collect on the bottom — the solid is melting under the hot water. Add water and boil until it dissolves completely.'), kind: 'info' };
    return null;
  },
  readouts: (S, lc) => {
    const u = lc.phase ? 0 : undissolved(S, lc.T);
    return [
      { label: L('Вода', 'Су', 'Water'), value: { ru: S.rec.V + ' мл', kk: S.rec.V + ' мл', en: S.rec.V + ' mL' } },
      { label: L('Температура', 'Температура', 'Temperature'), value: n(lc.T, 0) + ' °C', st: lc.T >= 99.5 ? 'warn' : '' },
      { label: L('Не растворилось', 'Ерімеді', 'Undissolved'), value: lc.phase ? '—' : u < 0.005 ? L('нет', 'жоқ', 'none') : u < 0.3 ? L('немного', 'аздап', 'a little') : L('много', 'көп', 'a lot'), st: !lc.phase && u < 0.005 ? 'ok' : '' },
    ];
  },
  done: (S, lc) => lc.phase === 2 && { text: L('Кристаллы отфильтрованы. Осталось высушить и взвесить.', 'Кристалдар сүзілді. Кептіріп, өлшеу қалды.', 'Crystals filtered off. Now dry and weigh them.') },
  scene: (S, lc) => hotScene(S, { ...lc, shock: S.rec.shock }),
};

function undissolved(S, T) {
  const c = S.crude;
  const solids = c.meta + c.para + c.di * 0.8 + c.ba * 0.6 + c.ortho * 0.3;
  return Math.max(0, solids - S.rec.V * solubility(T));
}

function cool(S, lc, ctx, shock) {
  const R = S.rec;
  if (R.V === 0) { ctx.feedback(L('В стакане нет воды.', 'Стақанда су жоқ.', 'There is no water in the beaker.'), 'warn'); delete lc.done[shock ? 'shock' : 'slow']; return; }
  if (lc.T < 95) { ctx.feedback(L('Раствор не доведён до кипения — растворяйте вещество в кипящей воде.', 'Ерітінді қайнағанға дейін жеткізілмеді — затты қайнаған суда ерітіңіз.', 'The solution is not boiling — dissolve the solid in boiling water.'), 'warn'); delete lc.done[shock ? 'shock' : 'slow']; return; }
  R.full = undissolved(S, lc.T) < 0.005;
  if (!R.full) ctx.remark({ key: 'undiss', severity: 'minor', text: L('перекристаллизация без полного растворения вещества — примеси остаются в кристаллах', 'зат толық ерімей қайта кристалдалды — қоспалар кристалдарда қалады', 'recrystallised without complete dissolution — impurities stay in the crystals') });
  if (R.V > 1.6 * R.Vneed) ctx.remark({ key: 'water_x', severity: 'minor', text: L(`слишком много воды (${R.V} мл) — большие потери в маточном растворе`, `су тым көп (${R.V} мл) — аналық ерітіндіде үлкен шығын`, `too much water (${R.V} mL) — large losses in the mother liquor`) });
  R.shock = shock; lc.phase = 1; lc.c.heat = false;
  ctx.advance(shock ? 600 : 1500); lc.T = 3;
  ctx.log(L(`Продукт растворён в ${R.V} мл кипящей воды${R.full ? '' : ' не полностью'}; ${shock ? 'раствор сразу охлаждён во льду — мелкие кристаллы' : 'медленное охлаждение, затем лёд — длинные игольчатые кристаллы'}`,
    `Өнім ${R.V} мл қайнаған суда${R.full ? '' : ' толық емес'} ерітілді; ${shock ? 'ерітінді бірден мұзда салқындатылды — ұсақ кристалдар' : 'баяу салқындату, содан кейін мұз — ұзын ине тәрізді кристалдар'}`,
    `Product dissolved in ${R.V} mL of boiling water${R.full ? '' : ' (not completely)'}; ${shock ? 'chilled straight in ice — small crystals' : 'slow cooling, then ice — long needle-like crystals'}`), 'obs');
  ctx.feedback(null);
}

const s14 = {
  type: 'decide', id: 'dry',
  title: L('Сушка продукта', 'Өнімді кептіру', 'Drying the product'),
  instr: L('<p>Кристаллы нужно высушить на воздухе, прежде чем взвешивать.</p><p class="note">Теоретический выход считают по фактической навеске бензойной кислоты.</p>', '<p>Кристалдарды өлшемес бұрын ауада кептіру керек.</p><p class="note">Теориялық шығым бензой қышқылының нақты өлшендісі бойынша есептеледі.</p>', '<p>The crystals must be dried in air before weighing.</p><p class="note">The theoretical yield is calculated from the actual mass of benzoic acid.</p>'),
  need: L('Выберите способ сушки', 'Кептіру тәсілін таңдаңыз', 'Choose how to dry'),
  question: L('Как подготовить продукт к взвешиванию?', 'Өнімді өлшеуге қалай дайындайды?', 'How do you prepare the product for weighing?'),
  options: [
    { id: 'air', ok: true, label: L('Оставить на воздухе до следующего занятия', 'Келесі сабаққа дейін ауада қалдыру', 'Leave to dry in air until the next session'), effect(S, i, ctx) { S.water = 0.003; ctx.nextDay(); }, log: L('Кристаллы оставлены сушиться на воздухе до следующего занятия', 'Кристалдар келесі сабаққа дейін ауада кептіруге қалдырылды', 'Crystals left to dry in air until the next session') },
    { id: 'filter', ok: false, severity: 'minor', label: L('Подсушить на фильтре, просасывая воздух 15 мин', 'Сүзгіде 15 мин ауа сорып кептіру', 'Dry on the filter by drawing air through for 15 min'), remark: L('продукт недосушен (только 15 мин на фильтре) — масса немного завышена', 'өнім толық кептірілмеген (сүзгіде тек 15 мин) — масса сәл жоғары', 'product not fully dry (only 15 min on the filter) — the mass is slightly high'), whatif: L('За 15 минут вода с кристаллов уходит не вся: масса и выход окажутся завышены, т. пл. — немного ниже.', '15 минутта кристалдардағы судың бәрі кетпейді: масса мен шығым жоғары, балқу температурасы сәл төмен болады.', 'In 15 minutes not all the water leaves the crystals: the mass and yield will be too high and the m.p. slightly low.'), advance: 900, effect(S) { S.water = 0.06; }, log: L('Кристаллы подсушены на фильтре током воздуха 15 мин', 'Кристалдар сүзгіде ауа ағынымен 15 мин кептірілді', 'Crystals dried on the filter with an air stream for 15 min') },
    { id: 'wet', ok: false, severity: 'major', label: L('Взвесить сразу', 'Бірден өлшеу', 'Weigh straight away'), remark: L('продукт взвешен влажным — масса и выход завышены', 'өнім ылғал күйінде өлшенді — масса мен шығым жоғарылатылған', 'product weighed while wet — mass and yield too high'), whatif: L('Влажные кристаллы содержат до четверти массы воды: выход получится завышенным, а т. пл. — заниженной и растянутой.', 'Ылғал кристалдарда массаның төрттен біріне дейін су болады: шығым жоғары, ал балқу температурасы төмен және созылған болады.', 'Wet crystals hold up to a quarter of their mass in water: the yield will come out too high and the m.p. low and broad.'), effect(S) { S.water = 0.25; }, log: L('Кристаллы взвешены сразу после фильтрования', 'Кристалдар сүзгеннен кейін бірден өлшенді', 'Crystals weighed straight after filtration') },
  ],
};

const s15 = {
  type: 'weigh', id: 'wprod',
  title: L('Взвешивание продукта', 'Өнімді өлшеу', 'Weighing the product'),
  instr: L('<p>Взвесьте продукт на часовом стекле: стекло → тарирование → продукт → закрыть дверцы → записать.</p>', '<p>Өнімді сағат шынысында өлшеңіз: шыны → тарировкалау → өнім → есікшелерді жабу → жазу.</p>', '<p>Weigh the product on a watch glass: glass → tare → product → close the doors → record.</p>'),
  need: L('Запишите массу продукта', 'Өнім массасын жазыңыз', 'Record the mass of the product'),
  reagent: L('продукт', 'өнім', 'product'), mode: 'transfer', container: 'watch', saveAs: 'mFin', product: 'var(--solid-y)',
  // S.fin нет, если шаг перекристаллизации пропущен принудительным переходом (бот): считаем по имеющимся данным
  mass: (S) => { if (!S.fin && S.crude) makeFin(S); return S.fin ? S.fin.m * (1 + S.water) : 0; },
  onRecord(S, m, ctx) {
    const white = !!(S.fin && S.fin.purity > 0.965 && S.water < 0.02);
    ctx.log(white ? L(`Белые игольчатые кристаллы, масса <b>${g(m)} г</b>`, `Ақ ине тәрізді кристалдар, массасы <b>${g(m)} г</b>`, `White needle-like crystals, mass <b>${g(m)} g</b>`) : L(`Бледно-жёлтые кристаллы, масса <b>${g(m)} г</b>`, `Ақшыл сары кристалдар, массасы <b>${g(m)} г</b>`, `Pale yellow crystals, mass <b>${g(m)} g</b>`), 'obs');
  },
};

const s16 = {
  type: 'calc', id: 'yield',
  title: L('Расчёт выхода', 'Шығымды есептеу', 'Calculating the yield'),
  instr: L('<p>Рассчитайте по своим данным теоретический выход м-нитробензойной кислоты и выход в процентах.</p><p class="note">C₆H₅COOH (M = 122,12) → м-O₂N–C₆H₄–COOH (M = 167,12), 1 : 1. Допустимая погрешность — 1 %, три попытки.</p>',
    '<p>Өз деректеріңіз бойынша м-нитробензой қышқылының теориялық шығымын және пайыздық шығымын есептеңіз.</p><p class="note">C₆H₅COOH (M = 122,12) → м-O₂N–C₆H₄–COOH (M = 167,12), 1 : 1. Рұқсат етілген қателік — 1 %, үш әрекет.</p>',
    '<p>Using your own data, calculate the theoretical yield of m-nitrobenzoic acid and the percent yield.</p><p class="note">C₆H₅COOH (M = 122.12) → m-O₂N–C₆H₄–COOH (M = 167.12), 1 : 1. Allowed error 1 %, three attempts.</p>'),
  need: L('Рассчитайте выход', 'Шығымды есептеңіз', 'Calculate the yield'),
  fields: [
    { id: 'th', label: L('Теоретический выход', 'Теориялық шығым', 'Theoretical yield'), unit: L('г', 'г', 'g'), decimals: 3, answer: (S) => theoretical(S.mBA), formula: (S) => L(`m(теор.) = ${g(S.mBA)} × 167.12 / 122.12`, `m(теор.) = ${g(S.mBA)} × 167.12 / 122.12`, `m(theor.) = ${g(S.mBA)} × 167.12 / 122.12`) },
    { id: 'eta', label: L('Выход', 'Шығым', 'Yield'), unit: '%', decimals: 1, answer: (S) => percentYield(S.mFin, S.mBA), formula: (S) => L(`η = ${g(S.mFin)} / ${n(theoretical(S.mBA), 3)} × 100 %`, `η = ${g(S.mFin)} / ${n(theoretical(S.mBA), 3)} × 100 %`, `η = ${g(S.mFin)} / ${n(theoretical(S.mBA), 3)} × 100 %`) },
  ],
  saveAs: 'calc1',
};

/* Подсказки шагов-процессов (сессия Q): вместо общих фраз типа — конкретно по методичке. */
s4.hints = [
  L('Охлаждающая смесь — лёд с солью: она холоднее, чем лёд с водой. Колба должна стоять в бане, раствор — перемешиваться.', 'Салқындатқыш қоспа — тұзы бар мұз: ол сулы мұздан суығырақ. Колба моншада тұруы, ерітінді араластырылуы тиіс.', 'The cooling mixture is ice with salt: it is colder than ice with water. The flask must sit in the bath and the solution must be stirred.'),
  L('Без соли баня даёт около 0 °C и охлаждает медленно; без перемешивания раствор остывает вдвое медленнее. Цель — 5 °C и ниже.', 'Тұзсыз монша шамамен 0 °C береді және баяу салқындатады; араластырусыз ерітінді екі есе баяу суиды. Мақсат — 5 °C және одан төмен.', 'Without salt the bath gives about 0 °C and cools slowly; without stirring the solution cools half as fast. The target is 5 °C or below.'),
  L('«Насыпать колотый лёд» → «Добавить соль NaCl» → «Поместить колбу в баню» → «Перемешивать» и ждать, пока раствор не охладится до 0–5 °C (ускорьте ход времени).', '«Уатылған мұз салу» → «NaCl тұзын қосу» → «Колбаны моншаға салу» → «Араластыру» және ерітінді 0–5 °C-қа дейін суығанша күту (уақыт жүрісін жылдамдатыңыз).', '“Add crushed ice” → “Add NaCl” → “Put the flask in the bath” → “Stir”, then wait until the solution is at 0–5 °C (speed up the clock).'),
];
s5.hints = [
  L('Порядок по методичке (раздел 7): азотную кислоту приливают к серной — медленно, порциями, при охлаждении. Смешение кислот экзотермично.', 'Әдістеме бойынша рет (7-бөлім): азот қышқылын күкірт қышқылына құяды — баяу, порциялап, салқындата отырып. Қышқылдарды араластыру экзотермиялық.', 'The order from the manual (section 7): nitric acid is added to sulfuric acid — slowly, in portions, with cooling. Mixing the acids is exothermic.'),
  L('Нужно ровно 1,5 мл H₂SO₄ и 1,5 мл HNO₃ (по 3 порции по 0,5 мл). HNO₃ прибавляйте с паузами, давая смеси остыть, — иначе она разогреется.', 'Дәл 1,5 мл H₂SO₄ және 1,5 мл HNO₃ қажет (0,5 мл-ден 3 порция). HNO₃-ті қоспаның суынуына мүмкіндік беріп, үзіліспен қосыңыз — әйтпесе ол қызады.', 'You need exactly 1.5 mL of H₂SO₄ and 1.5 mL of HNO₃ (3 portions of 0.5 mL each). Add the HNO₃ with pauses so the mixture can cool, otherwise it warms up.'),
  L('3 × «H₂SO₄ +0,5 мл», затем 3 × «HNO₃ +0,5 мл, по стенке» с паузами и ждать, пока смесь не охладится до 5 °C. Перепутали порядок или перелили — «Слить в отходы, приготовить заново».', '3 × «H₂SO₄ +0,5 мл», содан кейін үзіліспен 3 × «HNO₃ +0,5 мл, қабырға бойымен» және қоспа 5 °C-қа дейін суығанша күту. Ретін шатастырсаңыз не артық құйсаңыз — «Қалдыққа төгіп, қайта дайындау».', '3 × “H₂SO₄ +0.5 mL”, then 3 × “HNO₃ +0.5 mL, down the wall” with pauses, and wait until the mixture is at 5 °C. Wrong order or too much — “Discard into waste and start again”.'),
];
s7.hints = [
  L('Реакции нужно время: сначала выдержка в ледяной бане, потом — при комнатной температуре.', 'Реакцияға уақыт керек: алдымен мұз моншасында ұстау, содан кейін — бөлме температурасында.', 'The reaction needs time: first in the ice bath, then at room temperature.'),
  L('Методичка: 10–15 мин в бане, затем 10 мин при комнатной температуре. Короткая выдержка — часть бензойной кислоты не прореагирует, выход ниже.', 'Әдістеме: моншада 10–15 мин, содан кейін бөлме температурасында 10 мин. Қысқа ұстау — бензой қышқылының бір бөлігі әрекеттеспейді, шығым төмен.', 'The manual: 10–15 min in the bath, then 10 min at room temperature. A short hold leaves some benzoic acid unreacted and lowers the yield.'),
  L('2–3 раза «В бане, перемешивая: +5 мин» (10–15 мин), затем 2 раза «Вынуть из бани: +5 мин при комн. т-ре» (10 мин).', '2–3 рет «Моншада, араластыра: +5 мин» (10–15 мин), содан кейін 2 рет «Моншадан алу: бөлме t-да +5 мин» (10 мин).', '“In the bath, stirring: +5 min” 2–3 times (10–15 min), then “Out of the bath: +5 min at room temp.” twice (10 min).'),
];
s13.hints = [
  L('Вода нужна минимальная: столько, чтобы при кипении растворилось всё вещество. Лишняя вода оставит продукт в маточном растворе.', 'Су ең аз мөлшерде қажет: қайнаған кезде бүкіл зат еритіндей. Артық су өнімді аналық ерітіндіде қалдырады.', 'Use the minimum of water: just enough to dissolve all the solid at the boil. Extra water leaves product in the mother liquor.'),
  L('Добавляйте воду порциями и нагревайте до кипения; маслянистые капли на дне — вещества ещё не растворено, добавьте 5 мл. Охлаждать — медленно, лёд — только потом.', 'Суды порциялап қосып, қайнағанша қыздырыңыз; түбіндегі майлы тамшылар — зат әлі ерімеген, 5 мл қосыңыз. Баяу суыту керек, мұз — тек содан кейін.', 'Add water in portions and heat to the boil; oily drops on the bottom mean undissolved solid — add 5 mL. Cool slowly, ice only afterwards.'),
  L('Добавьте воду (около 33 мл на 1 г сырого продукта), «Плитка: включить», дождитесь «Раствор прозрачный», затем «Снять с плитки, остудить, затем лёд» и «Отфильтровать, промыть 2–3 мл ледяной воды». Резкое охлаждение даёт мелкие кристаллы с примесями.', 'Су қосыңыз (1 г шикі өнімге шамамен 33 мл), «Плита: қосу», «Ерітінді мөлдір» болғанша күтіңіз, содан кейін «Плитадан алып, суыту, содан кейін мұз» және «Сүзіп, 2–3 мл мұздай сумен жуу». Кенет суыту қоспалары бар ұсақ кристалдар береді.', 'Add water (about 33 mL per 1 g of crude product), “Hot plate: on”, wait for “The solution is clear”, then “Remove from heat, cool, then ice” and “Filter, wash with 2–3 mL of ice-cold water”. Shock cooling gives small, impure crystals.'),
];

export default {
  id: '1',
  title: L('Нитрование бензойной кислоты (синтез м-нитробензойной кислоты)', 'Бензой қышқылын нитрлеу (м-нитробензой қышқылының синтезі)', 'Nitration of benzoic acid (synthesis of m-nitrobenzoic acid)'),
  principle: L('Электрофильное ароматическое замещение катионом нитрония; дезактивирующая группа –COOH направляет нитрогруппу преимущественно в мета-положение.', 'Нитроний катионымен электрофильді ароматты орынбасу; пассивтендіретін –COOH тобы нитротопты негізінен мета-жағдайға бағыттайды.', 'Electrophilic aromatic substitution by the nitronium ion; the deactivating –COOH group directs the nitro group mainly to the meta position.'),
  equation: ['HNO₃ + 2H₂SO₄ → NO₂⁺ + H₃O⁺ + 2HSO₄⁻', L('C₆H₅COOH + HNO₃ → м-O₂N–C₆H₄–COOH + H₂O (H₂SO₄, 0–10 °C)', 'C₆H₅COOH + HNO₃ → м-O₂N–C₆H₄–COOH + H₂O (H₂SO₄, 0–10 °C)', 'C₆H₅COOH + HNO₃ → m-O₂N–C₆H₄–COOH + H₂O (H₂SO₄, 0–10 °C)')],
  initialState: () => ({
    mBA: 0, vAcid: 0, T: 22, Tb: 22, bath: { ice: false, salt: false, in: false }, dissolved: false,
    mix: { s: 0, n: 0, T: 3, last: -999 }, mixHot: false,
    nit: { drops: 0, maxT: -99, E: 0, t0: null, t1: null, hot: 0 },
    hold: { bath: 0, room: 0 }, pour: { loss: 0, ice: 0, method: '' },
    filt: { washes: 0, pH: 0.4, loss: 0, tloss: 0 }, crude: null, rec: { V: 0, full: false, shock: false, Vneed: 0 }, fin: null, water: 0, mFin: 0,
    leak: false, thin: false, glassFunnel: false, noHose: false,
  }),
  checkpoints: [0, 2, 10],
  steps: [s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16],
  results(S) {
    const th = theoretical(S.mBA);
    return {
      mBA: S.mBA, vAcid: S.vAcid, mFin: S.mFin, th, yield: percentYield(S.mFin, S.mBA),
      purity: S.fin ? S.fin.purity : 0, water: S.water, maxT: S.nit.maxT, hot: S.nit.hot, E: S.nit.E,
      tAdd: S.nit.t1 != null && S.nit.t0 != null ? (S.nit.t1 - S.nit.t0) / 60 : null,
      ice: S.pour.ice, recV: S.rec.V, washes: S.filt.washes,
      white: !!(S.fin && S.fin.purity > 0.965 && S.water < 0.02),
      losses: lossBreakdown(S),
    };
  },
  summary: (r) => [
    { label: L('Навеска', 'Өлшенді', 'Sample'), value: { ru: n(r.mBA, 4) + ' г', kk: n(r.mBA, 4) + ' г', en: n(r.mBA, 4) + ' g' } },
    { label: L('Продукт', 'Өнім', 'Product'), value: { ru: n(r.mFin, 4) + ' г', kk: n(r.mFin, 4) + ' г', en: n(r.mFin, 4) + ' g' } },
    { label: L('Выход', 'Шығым', 'Yield'), value: n(r.yield, 1) + ' %', st: r.yield >= 45 ? 'ok' : 'warn' },
    { label: L('Макс. t нитрования', 'Нитрлеудің макс. t', 'Max nitration t'), value: n(r.maxT, 1) + ' °C', st: r.maxT <= 10 ? 'ok' : 'warn' },
  ],
};
