/** Опыт 1. Диазотирование анилина (раствор хлорида бензолдиазония). Методичка, раздел 6, опыт 1. */
import { L, n } from '../../app/i18n.js';
import { relax } from '../../app/instruments/thermal.js';
import { anilineMmol, anilineMass, hclMmol, nitriteMmol, nitriteDrop, starchIodide, couplingFrac, hydLoss } from './model.js';
import { equipmentIcon } from '../../app/equipment.js';
import { flaskScene, flaskSide, hoodScene, COL } from './scene.js';

const g = (x, d = 4) => n(x, d);
const mm = (x) => n(x, 1);

/* ------------------------------------------------------------------ 0. рабочее место */
const s0 = {
  type: 'checklist', id: 'ppe',
  title: L('Рабочее место и средства защиты', 'Жұмыс орны және қорғаныс құралдары', 'Workplace and protective equipment'),
  instr: L('<p>Анилин токсичен при любом пути поступления и легко всасывается через кожу; нитрит натрия токсичен, оксиды азота ядовиты. Вся работа — в вытяжном шкафу. Наденьте средства защиты, включите тягу и найдите средства аварийной защиты. Лишнее не нажимайте.</p>',
    '<p>Анилин кез келген жолмен түскенде улы және тері арқылы оңай сіңеді; натрий нитриті улы, азот оксидтері улы. Бүкіл жұмыс — тартпа шкафта. Қорғаныс құралдарын киіп, тартымды қосыңыз және апаттық қорғаныс құралдарын табыңыз. Артығын баспаңыз.</p>',
    '<p>Aniline is toxic by every route and is readily absorbed through the skin; sodium nitrite is toxic and nitrogen oxides are poisonous. All the work is done in the fume hood. Put on your protective equipment, switch on the hood and locate the emergency equipment. Do not tap anything that is wrong.</p>'),
  need: L('Выполните все нужные пункты', 'Барлық қажетті тармақтарды орындаңыз', 'Complete every required item'),
  scene: hoodScene,
  items: [
    { id: 'coat', label: L('Халат застёгнут', 'Халат түймеленген', 'Lab coat buttoned'), log: L('Надет и застёгнут хлопковый халат', 'Мақта мата халат киіліп, түймеленді', 'Cotton lab coat on and buttoned') },
    { id: 'gog', label: L('Защитные очки', 'Қорғаныс көзілдірігі', 'Safety goggles'), log: L('Надеты защитные очки', 'Қорғаныс көзілдірігі киілді', 'Safety goggles on') },
    { id: 'glv', label: L('Нитриловые перчатки (анилин всасывается через кожу)', 'Нитрил қолғаптар (анилин тері арқылы сіңеді)', 'Nitrile gloves (aniline is absorbed through the skin)'), log: L('Надеты нитриловые перчатки', 'Нитрил қолғаптар киілді', 'Nitrile gloves on') },
    { id: 'hood', label: L('Включить тягу шкафа, опустить экран', 'Шкаф тартымын қосып, экранды түсіру', 'Switch on the hood, lower the sash'), log: L('Включена тяга вытяжного шкафа, экран опущен до рабочего уровня', 'Тартпа шкафтың тартымы қосылды, экран жұмыс деңгейіне дейін түсірілді', 'Fume hood switched on, sash lowered to working height') },
    { id: 'eye', label: L('Найти фонтанчик для глаз', 'Көз жуатын фонтанды табу', 'Locate the eyewash station'), log: L('Найден фонтанчик для промывания глаз', 'Көз жуатын фонтан табылды', 'Eyewash station located') },
    { id: 'shw', label: L('Найти аварийный душ', 'Апаттық душты табу', 'Locate the safety shower'), log: L('Найден аварийный душ', 'Апаттық душ табылды', 'Safety shower located') },
    { id: 'ext', label: L('Найти огнетушитель', 'Өрт сөндіргішті табу', 'Locate the fire extinguisher'), log: L('Найден огнетушитель', 'Өрт сөндіргіш табылды', 'Fire extinguisher located') },
    { id: 'bench', label: L('Отмерить анилин на открытом столе — так удобнее', 'Анилинді ашық үстелде өлшеу — бұл ыңғайлырақ', 'Measure the aniline on the open bench — it is handier'),
      wrong: { severity: 'safety', text: L('анилин собирались отмерять вне вытяжного шкафа (методичка, раздел 7; п. 4.6 правил ТБ)', 'анилинді тартпа шкафтан тыс өлшемек болды (әдістеме, 7-бөлім; ҚТ ережелерінің 4.6-тармағы)', 'aniline was going to be measured outside the fume hood (manual, section 7; safety rule 4.6)'),
        whatif: L('Пары анилина токсичны, а капли легко всасываются через кожу и вызывают метгемоглобинемию (кровь хуже переносит кислород): синеют губы, появляются слабость и головокружение. Ароматические амины — только под тягой и в перчатках.', 'Анилин булары улы, ал тамшылары тері арқылы оңай сіңіп, метгемоглобинемия тудырады (қан оттегіні нашар тасымалдайды): ерін көгереді, әлсіздік пен бас айналу пайда болады. Ароматты аминдер — тек тартым астында және қолғаппен.', 'Aniline vapour is toxic and drops are readily absorbed through the skin, causing methaemoglobinaemia (the blood carries less oxygen): blue lips, weakness and dizziness. Aromatic amines are handled only in the hood and with gloves.') } },
    { id: 'lens', label: L('Работать в контактных линзах вместо очков', 'Көзілдіріктің орнына контакт линзаларымен жұмыс істеу', 'Work in contact lenses instead of goggles'),
      wrong: { severity: 'safety', text: L('попытка работать в контактных линзах без защитных очков (п. 3.2 правил ТБ)', 'қорғаныс көзілдірігінсіз контакт линзаларымен жұмыс істеу әрекеті (ҚТ ережелерінің 3.2-тармағы)', 'tried to work in contact lenses without goggles (safety rule 3.2)'),
        whatif: L('Пары HCl и оксидов азота скапливаются под линзой, а брызги концентрированной кислоты попадают прямо в глаз — химический ожог роговицы.', 'HCl мен азот оксидтерінің булары линза астына жиналады, ал концентрлі қышқылдың шашырандылары тікелей көзге түседі — қасаңқабықтың химиялық күйігі.', 'HCl and nitrogen oxide vapours collect under the lens, and splashes of concentrated acid go straight into the eye — a chemical burn of the cornea.') } },
  ],
};

/* ------------------------------------------------------------------ 1. посуда */
const s1 = {
  type: 'pick', id: 'kit',
  title: L('Посуда и приборы для диазотирования', 'Диазоттауға арналған ыдыстар мен құралдар', 'Glassware and instruments for the diazotization'),
  instr: L('<p>Возьмите с полки всё, что нужно для диазотирования (пп. 1–5 хода работы), и ничего лишнего.</p><p class="note">Нитрит натрия взвесите на весах позже.</p>',
    '<p>Сөреден диазоттауға қажеттінің бәрін алыңыз (жұмыс барысының 1–5-тармақтары), артығын алмаңыз.</p><p class="note">Натрий нитритін кейін таразыда өлшейсіз.</p>',
    '<p>Take from the shelf everything you need for the diazotization (procedure steps 1–5) and nothing extra.</p><p class="note">You will weigh the sodium nitrite on the balance later.</p>'),
  need: L('Соберите нужный набор', 'Қажетті жиынтықты жинаңыз', 'Collect the right set'),
  shelf: [
    { id: 'conical-100', label: L('Коническая колба 100 мл', 'Конустық колба 100 мл', '100 mL conical flask'), icon: equipmentIcon('conical-250') },
    'cylinder-10', 'graduated-pipette', 'ice-salt-bath', 'thermometer-100', 'glass-rod', 'dropping-pipette', 'beaker-100',
    { id: 'starch', label: L('Иодкрахмальная бумага', 'Иодкрахмал қағазы', 'Starch–iodide paper'), icon: equipmentIcon('indicator-paper') },
    'rbf-50', 'reflux-condenser', 'heating-mantle', 'buchner', 'polarimeter-tube', 'boiling-chips',
  ],
  take: ['conical-100', 'cylinder-10', 'graduated-pipette', 'ice-salt-bath', 'thermometer-100', 'glass-rod', 'dropping-pipette', 'beaker-100', 'starch'],
  hint1: L('Реакционный сосуд — коническая колба на 100 мл в ледяно-солевой бане; термометр; чем отмерить кислоту и (точно) анилин; где растворить нитрит и чем его прибавлять по каплям; чем перемешивать; чем установить конец диазотирования.', 'Реакциялық ыдыс — мұз-тұз моншасындағы 100 мл конустық колба; термометр; қышқылды және анилинді (дәл) немен өлшеу; нитритті қайда ерітіп, немен тамшылатып қосу; немен араластыру; диазоттаудың соңын немен анықтау.', 'The reaction vessel is a 100 mL conical flask in an ice–salt bath; a thermometer; something to measure the acid and (accurately) the aniline; somewhere to dissolve the nitrite and something to add it dropwise; something to stir with; something to detect the end of diazotization.'),
};

/* ------------------------------------------------------------------ 2. HCl */
const s2 = {
  type: 'measure', id: 'hcl',
  title: L('Соляная кислота', 'Тұз қышқылы', 'Hydrochloric acid'),
  instr: L('<ol><li>В колбу на 100 мл налито <b>6,5 мл</b> дистиллированной воды.</li><li>В вытяжном шкафу отмерьте цилиндром <b>6,5 мл</b> конц. HCl (36 %) и прилейте к воде, перемешивая палочкой.</li></ol><p class="note">Кислоту — в воду. Излишек кислоты в склянку не возвращают.</p>',
    '<ol><li>100 мл колбаға <b>6,5 мл</b> дистилденген су құйылған.</li><li>Тартпа шкафта цилиндрмен <b>6,5 мл</b> конц. HCl (36 %) өлшеп, таяқшамен араластыра отырып суға құйыңыз.</li></ol><p class="note">Қышқылды — суға. Қышқылдың артығын склянкаға қайтармайды.</p>',
    '<ol><li>The 100 mL flask contains <b>6.5 mL</b> of distilled water.</li><li>In the fume hood, measure <b>6.5 mL</b> of conc. HCl (36 %) with a measuring cylinder and add it to the water, stirring with a glass rod.</li></ol><p class="note">Acid into water. Excess acid never goes back into the bottle.</p>'),
  need: L('Прилейте 6,5 мл HCl и перемешайте', '6,5 мл HCl құйып, араластырыңыз', 'Add 6.5 mL of HCl and stir'),
  measure: 'cylinder-10', reagent: L('конц. HCl', 'конц. HCl', 'conc. HCl'), target: 6.5, tol: 0.3, onDeviation: 'consequence', deviationSeverity: 'major', deviationPoints: 1, saveAs: 'vHCl',
  into: L('колба 100 мл с 6,5 мл воды', '6,5 мл суы бар 100 мл колба', 'the 100 mL flask with 6.5 mL of water'),
  onTransfer(S, v, ctx) {
    S.nHCl = hclMmol(v); S.vMix = 6.5 + v; S.T = 26;
    ctx.log(L(`HCl: ${n(v, 1)} мл × 1.18 г/мл × 0.36 / 36.46 = ${mm(S.nHCl)} ммоль`, `HCl: ${n(v, 1)} мл × 1.18 г/мл × 0.36 / 36.46 = ${mm(S.nHCl)} ммоль`, `HCl: ${n(v, 1)} mL × 1.18 g/mL × 0.36 / 36.46 = ${mm(S.nHCl)} mmol`), 'calc');
  },
  then: [{ id: 'stir', label: L('Перемешать палочкой', 'Таяқшамен араластыру', 'Stir with the rod'), advance: 30, obs: L('Разбавленная соляная кислота — бесцветный раствор, слегка дымит над горлом колбы, немного разогрелась', 'Сұйытылған тұз қышқылы — түссіз ерітінді, колба мойны үстінде сәл түтіндейді, аздап жылыды', 'Dilute hydrochloric acid — a colourless solution, fuming slightly at the neck of the flask, a little warm') }],
  sceneExtra: (S) => flaskSide(S),
};

/* ------------------------------------------------------------------ 3. анилин */
const s3 = {
  type: 'measure', id: 'aniline',
  title: L('Анилин: гидрохлорид анилина', 'Анилин: анилин гидрохлориді', 'Aniline: aniline hydrochloride'),
  instr: L('<ol><li>Градуированной пипеткой с грушей отмерьте <b>2,3 мл (2,33 г, 25 ммоль)</b> свежеперегнанного анилина.</li><li>Прибавьте его к кислоте, перемешивая. Образуется гидрохлорид анилина — смесь разогревается.</li></ol><p class="note">Набирать пипеткой ртом запрещено (п. 2.5, 6.2 правил ТБ). Анилин бесцветный или бледно-жёлтый.</p>',
    '<ol><li>Алмұрты бар бөлікті пипеткамен жаңа айдалған анилиннің <b>2,3 мл (2,33 г, 25 ммоль)</b> мөлшерін өлшеңіз.</li><li>Оны араластыра отырып қышқылға қосыңыз. Анилин гидрохлориді түзіледі — қоспа қызады.</li></ol><p class="note">Пипетканы аузымен тартуға тыйым салынған (ҚТ ережелерінің 2.5, 6.2-тармақтары). Анилин түссіз немесе ақшыл сары.</p>',
    '<ol><li>With a graduated pipette and bulb, measure <b>2.3 mL (2.33 g, 25 mmol)</b> of freshly distilled aniline.</li><li>Add it to the acid with stirring. Aniline hydrochloride forms and the mixture warms up.</li></ol><p class="note">Pipetting by mouth is forbidden (safety rules 2.5, 6.2). Aniline is colourless or pale yellow.</p>'),
  need: L('Прибавьте 2,3 мл анилина и перемешайте', '2,3 мл анилин қосып, араластырыңыз', 'Add 2.3 mL of aniline and stir'),
  measure: 'pipette-5', reagent: L('C₆H₅NH₂', 'C₆H₅NH₂', 'C₆H₅NH₂'), bottleSub: L('анилин', 'анилин', 'aniline'), target: 2.3, tol: 0.1, onDeviation: 'consequence', deviationSeverity: 'major', deviationPoints: 1, saveAs: 'vAn',
  into: L('колба с соляной кислотой', 'тұз қышқылы бар колба', 'the flask with hydrochloric acid'),
  onTransfer(S, v, ctx) {
    S.nAn = anilineMmol(v); S.vMix += v; S.T = 38;
    S.D.A = S.nAn;
    S.r = S.nHCl / S.nAn;
    ctx.log(L(`Анилин: ${n(v, 1)} мл = ${n(anilineMass(v), 2)} г = ${mm(S.nAn)} ммоль; HCl / анилин = ${n(S.r, 2)} экв.`, `Анилин: ${n(v, 1)} мл = ${n(anilineMass(v), 2)} г = ${mm(S.nAn)} ммоль; HCl / анилин = ${n(S.r, 2)} экв.`, `Aniline: ${n(v, 1)} mL = ${n(anilineMass(v), 2)} g = ${mm(S.nAn)} mmol; HCl / aniline = ${n(S.r, 2)} equiv.`), 'calc');
  },
  then: [{ id: 'stir', label: L('Перемешать палочкой', 'Таяқшамен араластыру', 'Stir with the rod'), advance: 60,
    obs: (S) => (S.r < 2.2
      ? L('Анилин растворяется не полностью, на поверхности остаются маслянистые капли; смесь заметно разогрелась (≈ 38 °C)', 'Анилин толық ерімейді, бетінде майлы тамшылар қалады; қоспа айтарлықтай қызды (≈ 38 °C)', 'The aniline does not dissolve completely; oily drops remain on the surface; the mixture has warmed noticeably (≈ 38 °C)')
      : L('Анилин растворился с образованием прозрачного бесцветного раствора гидрохлорида анилина; смесь заметно разогрелась (≈ 38 °C)', 'Анилин еріп, анилин гидрохлоридінің мөлдір түссіз ерітіндісі түзілді; қоспа айтарлықтай қызды (≈ 38 °C)', 'The aniline dissolved to give a clear colourless solution of aniline hydrochloride; the mixture has warmed noticeably (≈ 38 °C)')) }],
  sceneExtra: (S) => flaskSide(S),
  hints: [
    L('Нужно 25 ммоль анилина — это 2,3 мл. Отмеряйте пипеткой с ценой деления 0,1 мл, с грушей.', '25 ммоль анилин қажет — бұл 2,3 мл. Бөлік құны 0,1 мл пипеткамен, алмұртпен өлшеңіз.', 'You need 25 mmol of aniline, i.e. 2.3 mL. Measure it with a pipette graduated in 0.1 mL, using a bulb.'),
    L('Избыток анилина уменьшит избыток кислоты (нужно 2,5–3 экв.) — непрореагировавший амин будет сочетаться с солью диазония.', 'Анилиннің артығы қышқылдың артық мөлшерін азайтады (2,5–3 экв. қажет) — әрекеттеспеген амин диазоний тұзымен қосылады.', 'Too much aniline lowers the excess of acid (2.5–3 equiv. are needed) — unreacted amine will couple with the diazonium salt.'),
    L('+1 мл, +1 мл, +0,1 мл, +0,1 мл, +0,1 мл → 2,3 мл; затем «Перелить» и «Перемешать».', '+1 мл, +1 мл, +0,1 мл, +0,1 мл, +0,1 мл → 2,3 мл; содан кейін «Құю» және «Араластыру».', '+1 mL, +1 mL, +0.1 mL ×3 → 2.3 mL; then “Pour” and “Stir”.'),
  ],
};

/* ------------------------------------------------------------------ 4. охлаждение */
const s4 = {
  type: 'process', id: 'cool',
  title: L('Охлаждение до 0–5 °C', '0–5 °C-қа дейін салқындату', 'Cooling to 0–5 °C'),
  instr: L('<ol><li>Приготовьте ледяно-солевую баню (колотый лёд + NaCl).</li><li>Поместите колбу в баню и охладите раствор до <b>0–5 °C</b>, перемешивая.</li></ol><p class="note">Часть гидрохлорида анилина может выкристаллизоваться — это не мешает.</p>',
    '<ol><li>Мұз-тұз моншасын дайындаңыз (уатылған мұз + NaCl).</li><li>Колбаны моншаға салып, ерітіндіні араластыра отырып <b>0–5 °C</b>-қа дейін салқындатыңыз.</li></ol><p class="note">Анилин гидрохлоридінің бір бөлігі кристалданып шығуы мүмкін — бұл кедергі келтірмейді.</p>',
    '<ol><li>Prepare an ice–salt bath (crushed ice + NaCl).</li><li>Put the flask in the bath and cool the solution to <b>0–5 °C</b> with stirring.</li></ol><p class="note">Some aniline hydrochloride may crystallise — this does not interfere.</p>'),
  need: L('Охладите раствор до 5 °C и ниже', 'Ерітіндіні 5 °C және одан төмен салқындатыңыз', 'Cool the solution to 5 °C or below'),
  speeds: [5, 10, 30],
  setup(S) { if (S.T == null) S.T = 38; S.Tb = 22; },
  controls: [
    { kind: 'action', id: 'ice', group: L('Баня', 'Монша', 'Bath'), label: L('Насыпать колотый лёд', 'Уатылған мұз салу', 'Add crushed ice'), advance: 60, do(S) { S.bath.ice = true; }, log: L('Приготовлена ледяная баня', 'Мұз моншасы дайындалды', 'Ice bath prepared') },
    { kind: 'action', id: 'salt', group: L('Баня', 'Монша', 'Bath'), label: L('Добавить соль NaCl', 'NaCl тұзын қосу', 'Add NaCl'), requires: ['ice'], advance: 30, do(S) { S.bath.salt = true; }, log: L('В баню добавлена соль: охлаждающая смесь лёд / NaCl', 'Моншаға тұз қосылды: мұз / NaCl салқындатқыш қоспасы', 'Salt added: ice / NaCl freezing mixture') },
    { kind: 'action', id: 'in', group: L('Баня', 'Монша', 'Bath'), label: L('Поместить колбу в баню', 'Колбаны моншаға салу', 'Put the flask in the bath'), requires: ['ice'], advance: 15, do(S) { S.bath.in = true; }, log: L('Колба помещена в баню', 'Колба моншаға салынды', 'Flask placed in the bath') },
    { kind: 'toggle', id: 'stir', group: L('Колба', 'Колба', 'Flask'), label: L('Перемешивать', 'Араластыру', 'Stir'), labelOn: L('Перемешивание: вкл.', 'Араластыру: қосулы', 'Stirring: on') },
  ],
  tick(S, lc, dt) {
    const tgt = S.bath.ice ? (S.bath.salt ? -8 : 0.5) : 22;
    S.Tb = relax(S.Tb, tgt, 0.03, dt);
    const k = S.bath.in ? (lc.c.stir ? 0.02 : 0.009) : 0.0008;
    S.T = relax(S.T, S.bath.in ? S.Tb : 22, k, dt);
  },
  readouts: (S) => [
    { label: L('Раствор', 'Ерітінді', 'Solution'), value: n(S.T, 1) + ' °C', st: S.T <= 5 ? 'ok' : '' },
    { label: L('Баня', 'Монша', 'Bath'), value: n(S.Tb, 1) + ' °C' },
  ],
  done(S, lc, ctx) {
    if (S.T <= 5 && S.bath.in) {
      ctx.log(L(`Раствор охлаждён до ${n(S.T, 1)} °C; выпало немного белых кристаллов гидрохлорида анилина`, `Ерітінді ${n(S.T, 1)} °C-қа дейін салқындатылды; анилин гидрохлоридінің аздаған ақ кристалдары түзілді`, `Solution cooled to ${n(S.T, 1)} °C; a few white crystals of aniline hydrochloride have separated`), 'obs');
      return { text: L('Раствор охлаждён. Колба остаётся в бане.', 'Ерітінді салқындатылды. Колба моншада қалады.', 'The solution is cold. The flask stays in the bath.') };
    }
    return false;
  },
  scene: (S, lc) => flaskScene(S, { bath: true, th: true, rod: true, stir: lc.c && lc.c.stir, vol: S.vMix, color: COL.amineSalt, solid: S.T < 8 ? 0.25 : 0 }),
};

/* ------------------------------------------------------------------ 5. навеска нитрита */
const s5 = {
  type: 'weigh', id: 'wNO2',
  title: L('Навеска нитрита натрия', 'Натрий нитритінің өлшендісі', 'Weighing the sodium nitrite'),
  instr: L('<ol><li>Возьмите <b>1,8 г (26 ммоль)</b> NaNO₂ на весах: лодочка → тарирование → вещество шпателем → закрыть дверцы → записать.</li></ol><p class="note">Допустимо 1,75–1,85 г. Нитрит натрия — токсичный окислитель: излишек в склянку не возвращают.</p>',
    '<ol><li>Таразыда <b>1,8 г (26 ммоль)</b> NaNO₂ алыңыз: қайықша → тарировкалау → затты шпательмен салу → есікшелерді жабу → жазу.</li></ol><p class="note">1,75–1,85 г рұқсат етіледі. Натрий нитриті — улы тотықтырғыш: артығын склянкаға қайтармайды.</p>',
    '<ol><li>Weigh <b>1.8 g (26 mmol)</b> of NaNO₂: boat → tare → solid with a spatula → close the doors → record.</li></ol><p class="note">1.75–1.85 g is acceptable. Sodium nitrite is a toxic oxidiser: excess never goes back into the jar.</p>'),
  need: L('Запишите массу NaNO₂', 'NaNO₂ массасын жазыңыз', 'Record the mass of NaNO₂'),
  reagent: L('NaNO₂', 'NaNO₂', 'NaNO₂'), mode: 'spatula', container: 'boat', target: 1.8, lo: 1.75, hi: 1.85, saveAs: 'mNO2',
  onRecord(S, m, ctx) {
    S.nNO2 = nitriteMmol(m);
    ctx.log(L(`Навеска NaNO₂: <b>${g(m)} г</b> = ${mm(S.nNO2)} ммоль (${n(S.nNO2 / S.nAn, 2)} экв. на анилин)`, `NaNO₂ өлшендісі: <b>${g(m)} г</b> = ${mm(S.nNO2)} ммоль (анилинге ${n(S.nNO2 / S.nAn, 2)} экв.)`, `NaNO₂ sample: <b>${g(m)} g</b> = ${mm(S.nNO2)} mmol (${n(S.nNO2 / S.nAn, 2)} equiv. per aniline)`), 'calc');
  },
};

/* ------------------------------------------------------------------ 6. раствор нитрита */
const s6 = {
  type: 'decide', id: 'nitSol',
  title: L('Раствор нитрита натрия', 'Натрий нитритінің ерітіндісі', 'Sodium nitrite solution'),
  instr: L('<p>По методичке: растворите 1,8 г NaNO₂ в <b>5 мл воды</b> и охладите раствор. Как вы подготовите нитрит?</p>', '<p>Әдістеме бойынша: 1,8 г NaNO₂-ні <b>5 мл суда</b> ерітіп, ерітіндіні салқындатыңыз. Нитритті қалай дайындайсыз?</p>', '<p>According to the manual: dissolve the 1.8 g of NaNO₂ in <b>5 mL of water</b> and cool the solution. How will you prepare the nitrite?</p>'),
  need: L('Выберите способ', 'Тәсілді таңдаңыз', 'Choose the method'),
  question: L('Как подготовить нитрит натрия к диазотированию?', 'Натрий нитритін диазоттауға қалай дайындайды?', 'How do you prepare the sodium nitrite for the diazotization?'),
  options: [
    { id: 'ok', ok: true, label: L('Растворить в 5 мл холодной воды в стаканчике и охладить во льду', 'Стақаншадағы 5 мл суық суда ерітіп, мұзда салқындату', 'Dissolve in 5 mL of cold water in a small beaker and cool in ice'), advance: 240,
      effect(S) { S.sol = { n: S.nNO2, warm: false }; },
      obs: L('Нитрит растворился в 5 мл воды: прозрачный бесцветный раствор, охлаждён во льду до ≈ 2 °C', 'Нитрит 5 мл суда еріді: мөлдір түссіз ерітінді, мұзда ≈ 2 °C-қа дейін салқындатылды', 'The nitrite dissolved in 5 mL of water: a clear colourless solution, cooled in ice to ≈ 2 °C'),
      why: L('азотистая кислота должна образовываться только в реакционной смеси, на холоду', 'азотты қышқыл тек реакциялық қоспада, суықта түзілуі тиіс', 'nitrous acid must form only in the reaction mixture, in the cold') },
    { id: 'acid', ok: false, severity: 'major', label: L('Растворить в 5 мл разбавленной HCl, чтобы сразу получить азотистую кислоту', 'Азотты қышқылды бірден алу үшін 5 мл сұйытылған HCl-да еріту', 'Dissolve in 5 mL of dilute HCl to make the nitrous acid right away'), advance: 240,
      remark: L('нитрит растворён в кислоте заранее — азотистая кислота разложилась до оксидов азота', 'нитрит қышқылда алдын ала ерітілді — азотты қышқыл азот оксидтеріне дейін ыдырады', 'nitrite dissolved in acid beforehand — the nitrous acid decomposed to nitrogen oxides'),
      whatif: L('Азотистая кислота неустойчива: в стаканчике она сразу разлагается, выделяя бурые ядовитые NO₂/NO. Часть нитрита теряется, его не хватит до конца диазотирования, а оксиды азота попадают в воздух.', 'Азотты қышқыл тұрақсыз: стақаншада ол бірден ыдырап, қоңыр улы NO₂/NO бөледі. Нитриттің бір бөлігі жоғалады, ол диазоттаудың соңына дейін жетпейді, ал азот оксидтері ауаға түседі.', 'Nitrous acid is unstable: in the beaker it decomposes at once, giving off toxic brown NO₂/NO. Part of the nitrite is lost and there will not be enough to finish the diazotization, and nitrogen oxides get into the air.'),
      effect(S) { S.sol = { n: S.nNO2 * 0.7, warm: false }; },
      obs: L('Раствор в стаканчике позеленел и вспенился, над ним — бурые пары оксидов азота', 'Стақаншадағы ерітінді жасылданып, көбіктенді, үстінде — азот оксидтерінің қоңыр булары', 'The solution in the beaker turned greenish and frothed, with brown nitrogen oxide fumes above it') },
    { id: 'warm', ok: false, severity: 'minor', label: L('Растворить в 5 мл тёплой воды — быстрее, охлаждать не нужно', '5 мл жылы суда еріту — тезірек, салқындатудың қажеті жоқ', 'Dissolve in 5 mL of warm water — it is quicker and needs no cooling'), advance: 120,
      remark: L('раствор нитрита не охлаждён — каждая порция разогревает реакционную смесь', 'нитрит ерітіндісі салқындатылмады — әр порция реакциялық қоспаны қыздырады', 'nitrite solution not cooled — every portion warms the reaction mixture'),
      whatif: L('Тёплый раствор при прибавлении поднимает температуру в колбе: удерживать 0–5 °C станет труднее, часть азотистой кислоты и соли диазония разложится.', 'Жылы ерітінді қосқанда колбадағы температураны көтереді: 0–5 °C ұстау қиындайды, азотты қышқыл мен диазоний тұзының бір бөлігі ыдырайды.', 'A warm solution raises the flask temperature on addition: holding 0–5 °C becomes harder and some nitrous acid and diazonium salt decompose.'),
      effect(S) { S.sol = { n: S.nNO2, warm: true }; } },
    { id: 'solid', ok: false, severity: 'major', retry: true, label: L('Всыпать твёрдый нитрит прямо в колбу — так быстрее', 'Қатты нитритті тікелей колбаға салу — бұл тезірек', 'Tip the solid nitrite straight into the flask — it is quicker'),
      remark: L('предложено вносить твёрдый нитрит сразу в кислую смесь', 'қатты нитритті бірден қышқыл қоспаға салу ұсынылды', 'proposed adding solid nitrite straight to the acid mixture'),
      whatif: L('Твёрдый нитрит в кислоте даёт местный избыток азотистой кислоты и разогрев: бурно выделяются оксиды азота, температура выходит из 0–5 °C, соль диазония разлагается. Нитрит прибавляют раствором, по каплям.', 'Қышқылдағы қатты нитрит азотты қышқылдың жергілікті артық мөлшерін және қызуды береді: азот оксидтері қарқынды бөлінеді, температура 0–5 °C-тан шығады, диазоний тұзы ыдырайды. Нитритті ерітінді түрінде, тамшылатып қосады.', 'Solid nitrite in acid gives a local excess of nitrous acid and heating: nitrogen oxides are evolved vigorously, the temperature leaves 0–5 °C and the diazonium salt decomposes. Nitrite is added as a solution, dropwise.'),
      feedback: L('Так делать нельзя. Выберите другой способ.', 'Олай істеуге болмайды. Басқа тәсілді таңдаңыз.', 'That must not be done. Choose another method.') },
  ],
  scene: (S) => flaskScene(S, { bath: true, th: true, rod: true, vol: S.vMix, color: COL.amineSalt, solid: 0.25 }),
};

/* ------------------------------------------------------------------ 7. диазотирование */
const DROPS = 60;
const dropN = (S) => S.sol.n / DROPS;

function testPaper(S, lc, ctx) {
  const res = starchIodide(S.D.N);
  lc.tests = (lc.tests || 0) + 1; lc.strip = res; lc.testAt = lc.added + (lc.extra || 0);
  const at = L(`после ${lc.added} капель`, `${lc.added} тамшыдан кейін`, `after ${lc.added} drops`);
  if (res === 'blue') {
    ctx.log(L(`Иодкрахмальная бумага ${at.ru}: мгновенно синеет — в смеси избыток HNO₂`, `Иодкрахмал қағазы ${at.kk}: бірден көгереді — қоспада HNO₂ артық`, `Starch–iodide paper ${at.en}: turns blue at once — excess HNO₂ is present`), 'obs');
    if (!lc.firstBlue) {
      lc.firstBlue = true;
      if (S.D.N > 1.5) ctx.remark({ key: 'overshoot', severity: 'minor', text: L('конец диазотирования не контролировали вовремя — большой избыток азотистой кислоты', 'диазоттаудың соңы уақытында бақыланбады — азотты қышқылдың үлкен артық мөлшері', 'the end of diazotization was not checked in time — a large excess of nitrous acid') });
    }
    ctx.feedback(L('Бумага сразу посинела: азотистая кислота в небольшом избытке — диазотирование закончено.', 'Қағаз бірден көгерді: азотты қышқыл аздап артық — диазоттау аяқталды.', 'The paper turned blue at once: nitrous acid is in slight excess — the diazotization is complete.'), 'good');
  } else if (res === 'faint') {
    ctx.log(L(`Иодкрахмальная бумага ${at.ru}: слабое, медленное посинение`, `Иодкрахмал қағазы ${at.kk}: әлсіз, баяу көгеру`, `Starch–iodide paper ${at.en}: faint, slow blue colour`), 'obs');
    ctx.feedback(L('Посинение слабое и медленное — конец ещё не достигнут. Прибавьте ещё немного нитрита и через 1–2 мин проверьте снова.', 'Көгеру әлсіз әрі баяу — соңы әлі жетпеді. Тағы аздап нитрит қосып, 1–2 минуттан кейін қайта тексеріңіз.', 'Faint and slow — the end point is not reached yet. Add a little more nitrite and test again after 1–2 min.'), 'info');
  } else {
    ctx.log(L(`Иодкрахмальная бумага ${at.ru}: не синеет`, `Иодкрахмал қағазы ${at.kk}: көгермейді`, `Starch–iodide paper ${at.en}: no blue colour`), 'obs');
    ctx.feedback(lc.added >= DROPS
      ? L('Весь раствор нитрита прибавлен, а бумага не синеет: нитрита не хватило. Добавьте ещё немного раствора NaNO₂ и проверьте снова.', 'Нитрит ерітіндісі түгел қосылды, бірақ қағаз көгермейді: нитрит жетпеді. Тағы аздап NaNO₂ ерітіндісін қосып, қайта тексеріңіз.', 'All the nitrite solution has been added but the paper does not turn blue: there was not enough nitrite. Add a little more NaNO₂ solution and test again.')
      : L('Бумага не синеет — свободной HNO₂ нет, амин ещё не весь продиазотирован. Продолжайте прибавление.', 'Қағаз көгермейді — бос HNO₂ жоқ, амин әлі толық диазотталмады. Қосуды жалғастырыңыз.', 'No blue colour — there is no free HNO₂ and not all the amine is diazotized yet. Keep adding.'), 'info');
  }
}

const s7 = {
  type: 'add', id: 'diaz',
  title: L('Диазотирование: прибавление нитрита по каплям', 'Диазоттау: нитритті тамшылатып қосу', 'Diazotization: dropwise addition of nitrite'),
  instr: L('<ol><li>Прибавляйте холодный раствор нитрита <b>по каплям</b> при постоянном перемешивании; температура — <b>ниже 5 °C</b>. При необходимости бросайте в смесь кусочки льда.</li><li>Ближе к концу (после ~45 капель) проверяйте смесь <b>иодкрахмальной бумагой</b> через 1–2 мин после каждой порции.</li><li>Диазотирование закончено, когда капля смеси <b>сразу</b> окрашивает бумагу в синий цвет.</li></ol>',
    '<ol><li>Суық нитрит ерітіндісін үздіксіз араластыра отырып <b>тамшылатып</b> қосыңыз; температура — <b>5 °C-тан төмен</b>. Қажет болса, қоспаға мұз кесектерін салыңыз.</li><li>Соңына қарай (~45 тамшыдан кейін) әр порциядан 1–2 мин өткен соң қоспаны <b>иодкрахмал қағазымен</b> тексеріңіз.</li><li>Қоспаның тамшысы қағазды <b>бірден</b> көк түске бояса, диазоттау аяқталды.</li></ol>',
    '<ol><li>Add the cold nitrite solution <b>dropwise</b> with constant stirring; keep the temperature <b>below 5 °C</b>. Drop small pieces of ice into the mixture if necessary.</li><li>Towards the end (after ~45 drops) test the mixture with <b>starch–iodide paper</b> 1–2 min after each portion.</li><li>Diazotization is complete when a drop of the mixture turns the paper blue <b>immediately</b>.</li></ol>'),
  need: L('Доведите до положительной иодкрахмальной пробы при t < 5 °C', 't < 5 °C кезінде иодкрахмал сынамасын оң нәтижеге жеткізіңіз', 'Reach a positive starch–iodide test below 5 °C'),
  speeds: [5, 10, 20],
  setup(S, lc) { lc.pend = 0; lc.extra = 0; if (S.bath.in) S.T = Math.min(S.T, 4); },
  add: {
    label: L('Капля NaNO₂', 'NaNO₂ тамшысы', 'Drop of NaNO₂'), total: DROPS, big: true,
    group: L('Капельная пипетка · интервал между каплями', 'Тамшуыр · тамшылар арасындағы аралық', 'Dropping pipette · interval between drops'),
    rhythms: [[0, L('вручную', 'қолмен', 'by hand')], [15, L('15 с', '15 с', '15 s')], [10, L('10 с', '10 с', '10 s')], [5, L('5 с', '5 с', '5 s')]],
    onAdd(S, lc, ctx) {
      const Z = S.zt;
      if (Z.t0 == null) { Z.t0 = ctx.now(); ctx.log(L('Начато прибавление раствора нитрита по каплям', 'Нитрит ерітіндісін тамшылатып қосу басталды', 'Dropwise addition of the nitrite solution started')); }
      nitriteDrop(S.D, dropN(S), S.T);
      lc.pend += S.sol.warm ? 1.3 : 0.8; lc.dropKey = (lc.dropKey || 0) + 1; S.vMix += 5 / DROPS;
      if (S.T > 5.5) { Z.hotDrops++; ctx.remark({ key: 'dropHot', severity: 'major', text: L('нитрит прибавляли при температуре выше 5 °C — часть HNO₂ и соли диазония разложилась', 'нитрит 5 °C-тан жоғары температурада қосылды — HNO₂ мен диазоний тұзының бір бөлігі ыдырады', 'nitrite added above 5 °C — some HNO₂ and diazonium salt decomposed') }); }
      if (lc.added >= DROPS) {
        Z.t1 = ctx.now();
        ctx.log(L(`Прибавлено 5 мл раствора нитрита за ${n((Z.t1 - Z.t0) / 60, 1)} мин; максимальная температура ${n(Z.maxT, 1)} °C`, `5 мл нитрит ерітіндісі ${n((Z.t1 - Z.t0) / 60, 1)} мин ішінде қосылды; ең жоғары температура ${n(Z.maxT, 1)} °C`, `5 mL of nitrite solution added in ${n((Z.t1 - Z.t0) / 60, 1)} min; maximum temperature ${n(Z.maxT, 1)} °C`), 'obs');
      }
    },
  },
  controls: [
    { kind: 'toggle', id: 'stir', group: L('Колба и баня', 'Колба және монша', 'Flask and bath'), label: L('Перемешивать', 'Араластыру', 'Stir'), labelOn: L('Перемешивание: вкл.', 'Араластыру: қосулы', 'Stirring: on') },
    { kind: 'action', id: 'icein', once: false, group: L('Колба и баня', 'Колба және монша', 'Flask and bath'), label: L('Бросить кусочек льда в смесь', 'Қоспаға мұз кесегін салу', 'Drop a piece of ice into the mixture'), advance: 10,
      do(S, lc) { S.T = Math.max(0.5, S.T - 3); S.vMix += 1; lc.icePieces = (lc.icePieces || 0) + 1; }, log: L('В реакционную смесь брошен кусочек льда', 'Реакциялық қоспаға мұз кесегі салынды', 'A piece of ice dropped into the reaction mixture') },
    { kind: 'action', id: 'icebath', once: false, group: L('Колба и баня', 'Колба және монша', 'Flask and bath'), label: L('Подсыпать в баню лёд с солью', 'Моншаға тұзы бар мұз салу', 'Add ice and salt to the bath'), advance: 30, do(S) { S.Tb = Math.min(S.Tb, -8); S.bath.ice = true; S.bath.salt = true; }, log: L('В баню подсыпали лёд с солью', 'Моншаға тұзы бар мұз салынды', 'Ice and salt added to the bath') },
    { kind: 'action', id: 'test', once: false, group: L('Контроль', 'Бақылау', 'Control'), label: L('Иодкрахмальная проба (через 1–2 мин)', 'Иодкрахмал сынамасы (1–2 мин кейін)', 'Starch–iodide test (after 1–2 min)'), advance: 90,
      do(S, lc, ctx) { if (!lc.added) { ctx.feedback(L('Нитрит ещё не прибавлялся.', 'Нитрит әлі қосылған жоқ.', 'No nitrite has been added yet.'), 'warn'); return; } testPaper(S, lc, ctx); } },
    { kind: 'action', id: 'more', once: false, group: L('Контроль', 'Бақылау', 'Control'), label: L('Добавить ещё 0,5 мл раствора NaNO₂ (0,1 г)', 'Тағы 0,5 мл NaNO₂ ерітіндісін (0,1 г) қосу', 'Add another 0.5 mL of NaNO₂ solution (0.1 g)'), advance: 30,
      disabled: (S, lc) => lc.added < DROPS,
      do(S, lc, ctx) { nitriteDrop(S.D, nitriteMmol(0.1), S.T); lc.pend += 2.5; lc.extra = (lc.extra || 0) + 1; S.extraNO2 = (S.extraNO2 || 0) + 0.1; S.vMix += 0.5; lc.dropKey = (lc.dropKey || 0) + 1; ctx.log(L('Дополнительно прибавлено 0,5 мл раствора NaNO₂ (0,1 г)', 'Қосымша 0,5 мл NaNO₂ ерітіндісі (0,1 г) қосылды', 'An extra 0.5 mL of NaNO₂ solution (0.1 g) added')); } },
  ],
  tick(S, lc, dt) {
    const Z = S.zt;
    S.Tb = Math.min(10, S.Tb + 0.004 * dt);
    const rel = Math.min(lc.pend, lc.pend * 0.35 * dt);
    lc.pend -= rel;
    S.T += rel - (S.T - S.Tb) * Math.min(1, (lc.c.stir ? 0.022 : 0.009) * dt);
    if (Z.t0 != null) { Z.maxT = Math.max(Z.maxT, S.T); if (S.T > 5) Z.hot += dt; }
    // соль диазония медленно разлагается и при 0–5 °C
    const f = hydLoss(S.T, dt) * (S.T > 5 ? 8 : 1);
    const d = S.D.Dz * f; S.D.Dz -= d; S.D.P += d;
    // избыток HNO₂ понемногу улетает
    if (S.D.N > 0) S.D.N = Math.max(0, S.D.N - S.D.N * 0.0004 * dt);
  },
  alerts(S) {
    if (S.T > 10) return { text: L('Выше 10 °C: азотистая кислота разлагается (бурые пары), соль диазония превращается в фенол. Остановите прибавление и охлаждайте!', '10 °C-тан жоғары: азотты қышқыл ыдырайды (қоңыр булар), диазоний тұзы фенолға айналады. Қосуды тоқтатып, салқындатыңыз!', 'Above 10 °C: nitrous acid decomposes (brown fumes) and the diazonium salt turns into phenol. Stop adding and cool!'), kind: 'bad' };
    if (S.T > 5) return { text: L('Температура выше 5 °C. Остановите прибавление, перемешивайте, бросьте в смесь лёд.', 'Температура 5 °C-тан жоғары. Қосуды тоқтатып, араластырыңыз, қоспаға мұз салыңыз.', 'Temperature above 5 °C. Stop adding, stir, drop ice into the mixture.'), kind: 'warn' };
    return null;
  },
  events: [{
    id: 'nox', when: (S) => S.T > 9,
    title: L('Над колбой бурые пары, в смеси пузырьки газа', 'Колба үстінде қоңыр булар, қоспада газ көпіршіктері', 'Brown fumes above the flask, gas bubbles in the mixture'),
    text: L('Температура поднялась, над раствором появились бурые пары оксидов азота, в смеси — пузырьки. Что вы сделаете?', 'Температура көтеріліп, ерітінді үстінде азот оксидтерінің қоңыр булары пайда болды, қоспада — көпіршіктер. Не істейсіз?', 'The temperature has risen, brown nitrogen oxide fumes appear above the solution and the mixture is bubbling. What do you do?'),
    options: [
      { ok: true, label: L('Прекратить прибавление, бросить в смесь лёд, перемешивать, подсыпать в баню лёд с солью', 'Қосуды тоқтатып, қоспаға мұз салу, араластыру, моншаға тұзы бар мұз салу', 'Stop adding, drop ice into the mixture, stir, add ice and salt to the bath'), effect(S, lc) { lc.rh = 0; lc.c.stir = true; S.T = Math.max(1, S.T - 4); S.vMix += 1; S.Tb = Math.min(S.Tb, -8); S.bath.salt = true; }, log: L('Прибавление остановлено, в смесь брошен лёд, баня усилена', 'Қосу тоқтатылды, қоспаға мұз салынды, монша күшейтілді', 'Addition stopped, ice added to the mixture, bath topped up') },
      { ok: false, severity: 'major', label: L('Продолжать прибавление — осталось немного', 'Қосуды жалғастыру — аз қалды', 'Keep adding — there is not much left'), remark: L('прибавление нитрита продолжено при бурых парах и росте температуры', 'қоңыр булар мен температура өсуі кезінде нитрит қосу жалғастырылды', 'nitrite addition continued despite brown fumes and rising temperature'), effect(S, lc) { lc.pend += 3; } },
      { ok: false, severity: 'safety', label: L('Поднять экран шкафа, чтобы рассмотреть пары', 'Буды көру үшін шкаф экранын көтеру', 'Raise the hood sash to look at the fumes'), remark: L('экран вытяжного шкафа поднят при выделении оксидов азота (п. 4.4 правил ТБ)', 'азот оксидтері бөлінгенде тартпа шкаф экраны көтерілді (ҚТ ережелерінің 4.4-тармағы)', 'hood sash raised while nitrogen oxides were evolved (safety rule 4.4)'), whatif: L('Оксиды азота ядовиты: при поднятом экране они попадают в зону дыхания. Экран держат опущенным, наблюдают через стекло.', 'Азот оксидтері улы: экран көтерілгенде олар тыныс алу аймағына түседі. Экранды түсіріп ұстап, шыны арқылы бақылайды.', 'Nitrogen oxides are poisonous: with the sash raised they reach your breathing zone. Keep the sash down and watch through the glass.'), effect(S, lc) { lc.rh = 0; } },
      { ok: false, severity: 'major', label: L('Вынуть колбу из бани, чтобы пары быстрее ушли', 'Булар тезірек кетуі үшін колбаны моншадан алу', 'Take the flask out of the bath so the fumes clear faster'), remark: L('колбу вынули из охлаждающей бани во время диазотирования', 'диазоттау кезінде колба салқындатқыш моншадан алынды', 'flask taken out of the cooling bath during the diazotization'), effect(S, lc) { lc.rh = 0; S.T += 4; } },
    ],
  }],
  chart: { label: L('Термограмма: температура в колбе во времени', 'Термограмма: колбадағы температураның уақытқа тәуелділігі', 'Thermogram: flask temperature over time'), value: (S) => S.T, min: -10, max: 30, band: [0, 5], limit: 5, every: 5, active: (S) => S.zt.t0 != null, empty: L('термограмма начнётся с первой капли', 'термограмма бірінші тамшыдан басталады', 'the thermogram starts with the first drop') },
  done(S, lc) {
    const fresh = lc.testAt === lc.added + (lc.extra || 0);
    return fresh && lc.strip === 'blue' && S.T <= 5 && { text: L('Диазотирование закончено: иодкрахмальная проба положительная.', 'Диазоттау аяқталды: иодкрахмал сынамасы оң.', 'Diazotization complete: the starch–iodide test is positive.') };
  },
  scene: (S, lc) => flaskScene(S, { bath: true, th: true, rod: true, stir: lc.c && lc.c.stir, pip: true, dropKey: lc.dropKey, vol: S.vMix, color: lc.added > 30 ? COL.diaz : COL.amineSalt, solid: Math.max(0, 0.25 - lc.added / 120), fumes: Math.max(0, Math.min(0.8, (S.T - 8) / 10)), gas: S.T > 9, strip: lc.strip || 'none', icePieces: lc.icePieces }),
  hints: [
    L('Капайте спокойно и следите за термометром: выше 5 °C — пауза, лёд в смесь. Иодкрахмальная проба — ближе к концу, через 1–2 мин после порции.', 'Баяу тамызып, термометрді қадағалаңыз: 5 °C-тан жоғары — үзіліс, қоспаға мұз. Иодкрахмал сынамасы — соңына қарай, порциядан 1–2 мин кейін.', 'Add calmly and watch the thermometer: above 5 °C — pause and drop ice into the mixture. The starch–iodide test comes towards the end, 1–2 min after a portion.'),
    L('Нитрита 26 ммоль на 25 ммоль анилина: свободная HNO₂ появится только после ~58 капель. Ритм 10–15 с при включённом перемешивании держит смесь холодной.', '25 ммоль анилинге 26 ммоль нитрит: бос HNO₂ тек ~58 тамшыдан кейін пайда болады. Араластыру қосулы кезде 10–15 с ырғақ қоспаны суық ұстайды.', '26 mmol of nitrite for 25 mmol of aniline: free HNO₂ appears only after ~58 drops. A 10–15 s rhythm with stirring on keeps the mixture cold.'),
    L('Включите перемешивание, ритм 10 с; после 55 капель — проба после каждых 1–2 капель. Если весь нитрит прибавлен, а бумага не синеет, — «Добавить ещё 0,5 мл NaNO₂» и снова проба.', 'Араластыруды қосып, ырғақ 10 с; 55 тамшыдан кейін — әр 1–2 тамшыдан соң сынама. Нитрит түгел қосылып, қағаз көгермесе — «Тағы 0,5 мл NaNO₂ қосу» және қайта сынама.', 'Switch stirring on, rhythm 10 s; after 55 drops test after every 1–2 drops. If all the nitrite is in and the paper stays white, use “Add another 0.5 mL of NaNO₂” and test again.'),
  ],
};
s7.readouts = (S, lc) => [
  { label: L('Раствор', 'Ерітінді', 'Solution'), value: n(S.T, 1) + ' °C', st: S.T > 10 ? 'bad' : S.T > 5 ? 'warn' : 'ok' },
  { label: L('Баня', 'Монша', 'Bath'), value: n(S.Tb, 1) + ' °C' },
  { label: L('Капель', 'Тамшы', 'Drops'), value: `${lc.added} / ${DROPS}` + (lc.extra ? ` + ${lc.extra}×0.5` : '') },
  { label: L('Иодкрахм. проба', 'Иодкрахм. сынама', 'Starch–KI test'), value: lc.strip === 'blue' ? L('синяя', 'көк', 'blue') : lc.strip === 'faint' ? L('слабая', 'әлсіз', 'faint') : lc.tests ? L('нет', 'жоқ', 'none') : '—', st: lc.strip === 'blue' ? 'ok' : '' },
];

/* ------------------------------------------------------------------ 8. вопросы */
const s8 = {
  type: 'quiz', id: 'q',
  title: L('Вопросы преподавателя', 'Оқытушының сұрақтары', 'The instructor’s questions'),
  instr: L('<p>Раствор соли диазония стоит в бане. Ответьте на вопросы преподавателя — каждая ошибка записывается в журнал.</p>', '<p>Диазоний тұзының ерітіндісі моншада тұр. Оқытушының сұрақтарына жауап беріңіз — әр қате журналға жазылады.</p>', '<p>The diazonium solution is standing in the bath. Answer the instructor’s questions — every mistake is recorded in the notebook.</p>'),
  need: L('Ответьте на все вопросы', 'Барлық сұраққа жауап беріңіз', 'Answer all the questions'),
  questions: [
    { q: L('Почему иодкрахмальная бумага синеет в конце диазотирования?', 'Неліктен диазоттаудың соңында иодкрахмал қағазы көгереді?', 'Why does starch–iodide paper turn blue at the end of the diazotization?'),
      options: [L('Избыток HNO₂ окисляет иодид до иода: 2HNO₂ + 2KI + 2HCl → I₂ + 2NO + 2KCl + 2H₂O; иод с крахмалом — синий', 'Артық HNO₂ иодидті иодқа дейін тотықтырады: 2HNO₂ + 2KI + 2HCl → I₂ + 2NO + 2KCl + 2H₂O; иод крахмалмен — көк', 'Excess HNO₂ oxidises iodide to iodine: 2HNO₂ + 2KI + 2HCl → I₂ + 2NO + 2KCl + 2H₂O; iodine with starch is blue'), L('Соль диазония окрашивает крахмал', 'Диазоний тұзы крахмалды бояйды', 'The diazonium salt colours the starch'), L('Соляная кислота разрушает бумагу', 'Тұз қышқылы қағазды бұзады', 'Hydrochloric acid destroys the paper'), L('Анилин восстанавливает крахмал', 'Анилин крахмалды тотықсыздандырады', 'Aniline reduces the starch')],
      correct: 0, why: L('Пока в смеси есть амин, HNO₂ сразу расходуется; синева появляется только при небольшом избытке HNO₂ — это и есть конец диазотирования.', 'Қоспада амин болғанда HNO₂ бірден жұмсалады; көк түс тек HNO₂ аздап артық болғанда пайда болады — бұл диазоттаудың соңы.', 'While amine is present, HNO₂ is consumed at once; the blue appears only when HNO₂ is in slight excess — that is the end point.') },
    { q: L('Зачем нужен избыток соляной кислоты (2,5–3 экв.)?', 'Тұз қышқылының артық мөлшері (2,5–3 экв.) не үшін қажет?', 'Why is an excess of hydrochloric acid (2.5–3 equiv.) needed?'),
      options: [L('Чтобы получить HNO₂ из NaNO₂, удержать амин в растворе в виде соли и не дать соли диазония сочетаться с непрореагировавшим амином', 'NaNO₂-ден HNO₂ алу, аминді ерітіндіде тұз түрінде ұстау және диазоний тұзының әрекеттеспеген аминмен қосылуына жол бермеу үшін', 'To generate HNO₂ from NaNO₂, keep the amine in solution as its salt and stop the diazonium salt coupling with unreacted amine'), L('Чтобы ускорить разложение соли диазония', 'Диазоний тұзының ыдырауын жылдамдату үшін', 'To speed up the decomposition of the diazonium salt'), L('Чтобы нейтрализовать нитрит натрия до NaCl без реакции', 'Натрий нитритін реакциясыз NaCl-ға дейін бейтараптау үшін', 'To neutralise the sodium nitrite to NaCl without reaction'), L('Кислота не нужна, её прибавляют для растворения льда', 'Қышқыл қажет емес, оны мұзды еріту үшін қосады', 'Acid is not needed; it is added to melt the ice')],
      correct: 0, why: L('Методичка, раздел 3.1: избыток кислоты нужен для образования HNO₂, растворения амина в виде соли и предотвращения сочетания с амином.', 'Әдістеме, 3.1-бөлім: қышқылдың артық мөлшері HNO₂ түзу, аминді тұз түрінде еріту және аминмен қосылудың алдын алу үшін қажет.', 'Manual, section 3.1: excess acid generates HNO₂, keeps the amine dissolved as its salt and prevents coupling with the amine.') },
  ],
};

/* ------------------------------------------------------------------ 9. хранение раствора */
const DRY = {
  ru: 'При упаривании вода уходит, и хлорид бензолдиазония остаётся в сухом виде. Сухие соли диазония взрываются от удара, трения или нагревания: при соскабливании осадка со стенок произошла бы детонация — осколки стекла, ожоги, травмы глаз и рук. В реальной лаборатории соли диазония никогда не выделяют в сухом виде: их готовят при 0–5 °C и сразу используют в растворе, а неиспользованный раствор разрушают нагреванием в тяге до прекращения выделения азота. Диазотирование повторяют.',
  kk: 'Буландырғанда су кетеді де, бензолдиазоний хлориді құрғақ күйде қалады. Құрғақ диазоний тұздары соққыдан, үйкелуден немесе қыздырудан жарылады: қабырғадағы тұнбаны қырғанда детонация болар еді — шыны сынықтары, күйік, көз бен қолдың жарақаты. Нақты зертханада диазоний тұздарын ешқашан құрғақ күйде бөліп алмайды: оларды 0–5 °C-та дайындап, бірден ерітіндіде пайдаланады, ал пайдаланылмаған ерітіндіні тартпада азоттың бөлінуі тоқтағанша қыздырып ыдыратады. Диазоттау қайталанады.',
  en: 'On evaporation the water goes and benzenediazonium chloride is left dry. Dry diazonium salts explode on impact, friction or heating: scraping the solid off the walls would set off a detonation — flying glass, burns, eye and hand injuries. In a real lab diazonium salts are never isolated dry: they are made at 0–5 °C and used at once in solution, and unused solution is destroyed by warming in the hood until nitrogen evolution stops. The diazotization is repeated.',
};

const s9 = {
  type: 'decide', id: 'store',
  title: L('Раствор соли диазония', 'Диазоний тұзының ерітіндісі', 'The diazonium salt solution'),
  instr: L('<p>Раствор хлорида бензолдиазония готов. Что вы с ним сделаете (п. 6 хода работы)?</p><p class="note">Опыты 2, 3 и 4 проводят с этим раствором в тот же день.</p>', '<p>Бензолдиазоний хлоридінің ерітіндісі дайын. Онымен не істейсіз (жұмыс барысының 6-тармағы)?</p><p class="note">2, 3 және 4-тәжірибелер осы ерітіндімен сол күні жүргізіледі.</p>', '<p>The benzenediazonium chloride solution is ready. What do you do with it (procedure step 6)?</p><p class="note">Experiments 2, 3 and 4 are done with this solution on the same day.</p>'),
  need: L('Выберите действие', 'Әрекетті таңдаңыз', 'Choose the action'),
  question: L('Как поступить с раствором соли диазония?', 'Диазоний тұзының ерітіндісімен не істеу керек?', 'What do you do with the diazonium salt solution?'),
  options: [
    { id: 'ice', ok: true, label: L('Держать в ледяной бане и сразу использовать: отобрать две порции по 1,5 мл (для опытов 3 и 4), остальное — в опыт 2', 'Мұз моншасында ұстап, бірден пайдалану: 1,5 мл-ден екі порция алу (3 және 4-тәжірибелерге), қалғаны — 2-тәжірибеге', 'Keep it in the ice bath and use it at once: take two 1.5 mL portions (for experiments 3 and 4), the rest goes to experiment 2'), advance: 120,
      effect(S) { S.store = 'ice'; },
      log: L('Две порции по 1,5 мл раствора соли диазония отобраны в пробирки и поставлены в лёд; основная часть — для синтеза иодбензола', 'Диазоний тұзы ерітіндісінің 1,5 мл-ден екі порциясы пробиркаларға алынып, мұзға қойылды; негізгі бөлігі — иодбензол синтезіне', 'Two 1.5 mL portions of the diazonium solution taken into test tubes and put in ice; the main part is for the iodobenzene synthesis'),
      why: L('соли диазония неустойчивы: их готовят при 0–5 °C и используют сразу, в растворе', 'диазоний тұздары тұрақсыз: оларды 0–5 °C-та дайындап, бірден ерітіндіде пайдаланады', 'diazonium salts are unstable: they are made at 0–5 °C and used at once, in solution') },
    { id: 'room', ok: false, severity: 'major', label: L('Поставить колбу на стол и подготовить реактивы к опыту 2 (около часа)', 'Колбаны үстелге қойып, 2-тәжірибенің реактивтерін дайындау (шамамен бір сағат)', 'Put the flask on the bench and get the reagents for experiment 2 ready (about an hour)'), advance: 3600,
      remark: L('раствор соли диазония час стоял при комнатной температуре — часть разложилась до фенола', 'диазоний тұзының ерітіндісі бір сағат бөлме температурасында тұрды — бір бөлігі фенолға дейін ыдырады', 'the diazonium solution stood at room temperature for an hour — part of it decomposed to phenol'),
      whatif: L('При комнатной температуре соль диазония медленно реагирует с водой: выделяется азот, образуется фенол, раствор темнеет. Выход иодбензола снизится, а фенол придётся удалять.', 'Бөлме температурасында диазоний тұзы сумен баяу әрекеттеседі: азот бөлінеді, фенол түзіледі, ерітінді қараяды. Иодбензолдың шығымы төмендейді, ал фенолды жоюға тура келеді.', 'At room temperature the diazonium salt slowly reacts with water: nitrogen is given off, phenol forms and the solution darkens. The iodobenzene yield drops and the phenol has to be removed.'),
      effect(S) { S.store = 'room'; const lost = S.D.Dz * 0.12; S.D.Dz -= lost; S.D.P += lost; },
      obs: L('За час раствор потемнел, в нём видны редкие пузырьки газа, ощущается запах фенола', 'Бір сағатта ерітінді қараңғыланды, онда сирек газ көпіршіктері көрінеді, фенол иісі сезіледі', 'In an hour the solution darkened; occasional gas bubbles are seen and there is a smell of phenol') },
    { id: 'dry', ok: false, label: L('Упарить раствор на водяной бане досуха, чтобы сохранить соль диазония до следующего занятия', 'Диазоний тұзын келесі сабаққа дейін сақтау үшін ерітіндіні су моншасында құрғағанша буландыру', 'Evaporate the solution to dryness on a water bath to keep the diazonium salt until the next session'),
      remark: L('попытка выделить сухую соль диазония упариванием', 'диазоний тұзын буландыру арқылы құрғақ күйде бөліп алу әрекеті', 'attempt to isolate the dry diazonium salt by evaporation'),
      critical: { text: DRY } },
  ],
  check(S, inp, ctx) {
    ctx.log(S.r < 2.2 || S.D.A > 0.5
      ? L('Раствор соли диазония мутный, с жёлтым осадком (сочетание с непрореагировавшим анилином)', 'Диазоний тұзының ерітіндісі лайлы, сары тұнбасы бар (әрекеттеспеген анилинмен қосылу)', 'The diazonium solution is cloudy with a yellow precipitate (coupling with unreacted aniline)')
      : S.store === 'room' ? L('Раствор соли диазония тёмно-жёлтый', 'Диазоний тұзының ерітіндісі қою сары', 'The diazonium solution is dark yellow')
        : L('Прозрачный, почти бесцветный (бледно-жёлтый) раствор хлорида бензолдиазония', 'Бензолдиазоний хлоридінің мөлдір, түссіз дерлік (ақшыл сары) ерітіндісі', 'A clear, almost colourless (pale yellow) solution of benzenediazonium chloride'), 'obs');
  },
  scene: (S) => flaskScene(S, { bath: true, th: true, vol: S.vMix, color: S.r < 2.2 ? 'rgba(226,190,90,.6)' : COL.diaz, solid: S.r < 2.2 ? 0.4 : 0, solidColor: COL.yellowPpt }),
};

export default {
  id: '1',
  title: L('Диазотирование анилина (раствор хлорида бензолдиазония)', 'Анилинді диазоттау (бензолдиазоний хлоридінің ерітіндісі)', 'Diazotization of aniline (benzenediazonium chloride solution)'),
  principle: L('Гидрохлорид анилина реагирует с азотистой кислотой (из NaNO₂ и HCl) при 0–5 °C; конец реакции определяют по небольшому избытку HNO₂, который окисляет иодид до иода (синее окрашивание с крахмалом).', 'Анилин гидрохлориді 0–5 °C-та азотты қышқылмен (NaNO₂ мен HCl-дан) әрекеттеседі; реакцияның соңын HNO₂-нің аздаған артық мөлшері бойынша анықтайды, ол иодидті иодқа дейін тотықтырады (крахмалмен көк түс).', 'Aniline hydrochloride reacts with nitrous acid (from NaNO₂ and HCl) at 0–5 °C; the end point is a slight excess of HNO₂, which oxidises iodide to iodine (blue with starch).'),
  equation: ['C₆H₅NH₂ + HCl → C₆H₅NH₃⁺ Cl⁻', 'C₆H₅NH₃⁺ Cl⁻ + NaNO₂ + HCl → C₆H₅N₂⁺ Cl⁻ + NaCl + 2H₂O', L('2HNO₂ + 2KI + 2HCl → I₂ + 2NO↑ + 2KCl + 2H₂O (иодкрахмальная проба)', '2HNO₂ + 2KI + 2HCl → I₂ + 2NO↑ + 2KCl + 2H₂O (иодкрахмал сынамасы)', '2HNO₂ + 2KI + 2HCl → I₂ + 2NO↑ + 2KCl + 2H₂O (starch–iodide test)')],
  initialState: () => ({
    vHCl: 0, nHCl: 0, vAn: 0, nAn: 0, r: 3, vMix: 6.5, T: 22, Tb: 22, bath: { ice: false, salt: false, in: false },
    mNO2: 0, nNO2: 0, sol: { n: 0, warm: false }, extraNO2: 0,
    D: { A: 0, Dz: 0, P: 0, N: 0, lostN: 0 },
    zt: { t0: null, t1: null, maxT: -99, hot: 0, hotDrops: 0 }, store: '',
  }),
  checkpoints: [0, 5],
  steps: [s0, s1, s2, s3, s4, s5, s6, s7, s8, s9],
  results(S) {
    const D = S.D;
    // сочетание соли диазония с непрореагировавшим амином (недостаток кислоты или нитрита)
    const cf = couplingFrac(S.r);
    const coupled = Math.min(D.Dz, D.Dz * cf + Math.min(D.Dz, D.A) * 0.5);
    const Dz = D.Dz - coupled;
    return {
      vHCl: S.vHCl, nHCl: S.nHCl, vAn: S.vAn, nAn: S.nAn, mAn: anilineMass(S.vAn), r: S.r,
      mNO2: S.mNO2, nNO2: S.nNO2, extraNO2: S.extraNO2 || 0, solWarm: S.sol.warm,
      Dz, P: D.P, A: D.A, N: D.N, coupled, nitriteAdded: D.added || 0,
      maxT: S.zt.maxT, hot: S.zt.hot, tAdd: S.zt.t1 != null && S.zt.t0 != null ? (S.zt.t1 - S.zt.t0) / 60 : null,
      V: S.vMix, store: S.store, conv: S.nAn ? Dz / S.nAn : 0,
    };
  },
  summary: (r) => [
    { label: L('Анилин', 'Анилин', 'Aniline'), value: { ru: n(r.nAn, 1) + ' ммоль', kk: n(r.nAn, 1) + ' ммоль', en: n(r.nAn, 1) + ' mmol' } },
    { label: L('Соль диазония', 'Диазоний тұзы', 'Diazonium salt'), value: { ru: '≈ ' + n(r.Dz, 1) + ' ммоль', kk: '≈ ' + n(r.Dz, 1) + ' ммоль', en: '≈ ' + n(r.Dz, 1) + ' mmol' }, st: r.conv > 0.9 ? 'ok' : 'warn' },
    { label: L('Макс. t', 'Макс. t', 'Max t'), value: n(r.maxT, 1) + ' °C', st: r.maxT <= 5.5 ? 'ok' : 'warn' },
    { label: L('Иодкрахм. проба', 'Иодкрахм. сынама', 'Starch–KI test'), value: L('синяя', 'көк', 'blue'), st: 'ok' },
  ],
};
