/** Опыт 3. Изомеризация малеиновой кислоты в фумаровую. Методичка, раздел 6, опыт 3. */
import { L, n } from '../../app/i18n.js';
import { relax } from '../../app/instruments/thermal.js';
import { scene } from '../../app/scene/svg.js';
import { cHCl, boilT, kIso, solFum, crystallised, washPH, makeProduct, theoretical, percentYield, lossBreakdown, productHeating, dissolvedFrac } from './model.js';
import { hoodScene, refluxScene, assembleBase, coolScene, capApparatus } from './scene.js';

const g = (x, d = 4) => n(x, d);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/* ---------------------------------------------------------------- 0. рабочее место */
const s0 = {
  type: 'checklist', id: 'ppe',
  title: L('Вытяжной шкаф и средства защиты', 'Тартпа шкаф және қорғаныс құралдары', 'Fume hood and protective equipment'),
  instr: L('<p>Концентрированная HCl выделяет едкий хлороводород: её отмеривают и кипятят смесь <b>только в вытяжном шкафу</b>. Подготовьте рабочее место: нажмите на каждый нужный пункт, лишнее не нажимайте.</p>',
    '<p>Концентрлі HCl күйдіргіш хлорсутек бөледі: оны өлшеу және қоспаны қайнату <b>тек тартпа шкафта</b> жүргізіледі. Жұмыс орнын дайындаңыз: әр қажетті тармақты басыңыз, артығын баспаңыз.</p>',
    '<p>Concentrated HCl gives off corrosive hydrogen chloride: it is measured and the mixture is refluxed <b>only in the fume hood</b>. Prepare the workplace: tap every item you need and nothing that is wrong.</p>'),
  need: L('Выполните все нужные пункты', 'Барлық қажетті тармақтарды орындаңыз', 'Complete every required item'),
  scene: hoodScene,
  items: [
    { id: 'coat', label: L('Халат застёгнут', 'Халат түймеленген', 'Lab coat buttoned'), log: L('Надет и застёгнут хлопковый халат', 'Мақта мата халат киіліп, түймеленді', 'Cotton lab coat on and buttoned') },
    { id: 'gog', label: L('Защитные очки', 'Қорғаныс көзілдірігі', 'Safety goggles'), log: L('Надеты защитные очки', 'Қорғаныс көзілдірігі киілді', 'Safety goggles on') },
    { id: 'glv', label: L('Перчатки нитриловые', 'Нитрил қолғаптар', 'Nitrile gloves'), log: L('Надеты нитриловые перчатки (конц. HCl, п. 3.3)', 'Нитрил қолғаптар киілді (конц. HCl, 3.3-тармақ)', 'Nitrile gloves on (conc. HCl, rule 3.3)') },
    { id: 'hood', label: L('Включить тягу шкафа, опустить экран', 'Шкаф тартымын қосып, экранды түсіру', 'Switch on the hood, lower the sash'), log: L('Включена тяга вытяжного шкафа, экран опущен до рабочего уровня', 'Тартпа шкафтың тартымы қосылды, экран жұмыс деңгейіне дейін түсірілді', 'Fume hood switched on, sash lowered to working height') },
    { id: 'eye', label: L('Найти фонтанчик для глаз и аварийный душ', 'Көз жуатын фонтан мен апаттық душты табу', 'Locate the eyewash station and safety shower'), log: L('Найдены фонтанчик для промывания глаз и аварийный душ', 'Көз жуатын фонтан мен апаттық душ табылды', 'Eyewash station and safety shower located') },
    { id: 'ext', label: L('Найти огнетушитель', 'Өрт сөндіргішті табу', 'Locate the fire extinguisher'), log: L('Найден огнетушитель', 'Өрт сөндіргіш табылды', 'Fire extinguisher located') },
    { id: 'soda', label: L('Подготовить NaHCO₃ для нейтрализации пролива кислоты', 'Қышқыл төгілсе, бейтараптауға NaHCO₃ дайындау', 'Have NaHCO₃ ready to neutralise an acid spill'), log: L('Рядом подготовлен гидрокарбонат натрия для нейтрализации проливов (п. 6.4)', 'Төгілгенді бейтараптауға натрий гидрокарбонаты дайындалды (6.4-тармақ)', 'Sodium hydrogen carbonate ready to neutralise spills (rule 6.4)') },
    { id: 'bench', label: L('Отмерять HCl на столе — в шкафу тесно', 'HCl-ді үстелде өлшеу — шкафта тар', 'Measure the HCl on the open bench — the hood is crowded'),
      wrong: { severity: 'safety', text: L('намерение работать с концентрированной HCl вне вытяжного шкафа (п. 6.1 правил ТБ)', 'концентрлі HCl-мен тартпа шкафтан тыс жұмыс істеу ниеті (ҚТ ережелерінің 6.1-тармағы)', 'intended to handle concentrated HCl outside the fume hood (safety rule 6.1)'),
        whatif: L('Над склянкой с 36 % HCl стоит туман хлороводорода: он раздражает глаза и дыхательные пути всех, кто рядом. Концентрированные кислоты разливают только в шкафу.', '36 % HCl склянкасының үстінде хлорсутек тұманы тұрады: ол жанындағылардың бәрінің көзін және тыныс жолдарын тітіркендіреді. Концентрлі қышқылдарды тек шкафта құяды.', 'A mist of hydrogen chloride hangs over a bottle of 36 % HCl and irritates the eyes and lungs of everyone nearby. Concentrated acids are poured only in the hood.') } },
    { id: 'lens', label: L('Работать в контактных линзах вместо очков', 'Көзілдіріктің орнына контакт линзаларымен жұмыс істеу', 'Work in contact lenses instead of goggles'),
      wrong: { severity: 'safety', text: L('попытка работать в контактных линзах без защитных очков (п. 3.2 правил ТБ)', 'қорғаныс көзілдірігінсіз контакт линзаларымен жұмыс істеу әрекеті (ҚТ ережелерінің 3.2-тармағы)', 'tried to work in contact lenses without goggles (safety rule 3.2)'),
        whatif: L('Пары HCl скапливаются под линзой и обжигают роговицу. Очки обязательны.', 'HCl булары линза астына жиналып, қасаңқабықты күйдіреді. Көзілдірік міндетті.', 'HCl vapour collects under the lens and burns the cornea. Goggles are compulsory.') } },
  ],
};

/* ---------------------------------------------------------------- 1. посуда */
const s1 = {
  type: 'pick', id: 'kit',
  title: L('Посуда и приборы', 'Ыдыстар мен құралдар', 'Glassware and apparatus'),
  instr: L('<p>Возьмите с полки всё, что нужно для изомеризации, охлаждения и фильтрования (пп. 1–4 хода работы), и ничего лишнего.</p><p class="note">Аналитические весы и прибор т. пл. стоят на своих местах — их брать не нужно.</p>',
    '<p>Сөреден изомерлеуге, салқындатуға және сүзуге қажеттінің бәрін алыңыз (жұмыс барысының 1–4-тармақтары), артығын алмаңыз.</p><p class="note">Аналитикалық таразы мен балқу t құралы өз орнында тұр — оларды алудың қажеті жоқ.</p>',
    '<p>Take from the shelf everything you need for the isomerisation, cooling and filtration (procedure steps 1–4) and nothing extra.</p><p class="note">The analytical balance and the m.p. apparatus stay where they are — you do not need to take them.</p>'),
  need: L('Соберите нужный набор', 'Қажетті жиынтықты жинаңыз', 'Collect the right set'),
  shelf: ['rbf-50', 'reflux-condenser', 'water-bath', 'boiling-chips', 'cylinder-10', 'stand', 'ice-bath', 'buchner', 'filter-flask', 'water-pump', 'filter-paper', 'watch-glass', 'liebig-condenser', 'distill-flask', 'sep-funnel', 'thermometer-250', 'dropping-pipette', 'polarimeter-tube', 'conical-50'],
  take: ['rbf-50', 'reflux-condenser', 'water-bath', 'boiling-chips', 'cylinder-10', 'stand', 'ice-bath', 'buchner', 'filter-flask', 'water-pump', 'filter-paper', 'watch-glass'],
  hint1: L('Нужны: колба для кипячения, обратный холодильник со штативом, нагрев, кипелки, чем отмерить жидкости, баня для охлаждения и всё для вакуумного фильтрования и сушки.', 'Қажет: қайнатуға арналған колба, штативі бар кері мұздатқыш, қыздыру, қайнату тастары, сұйықтарды өлшейтін құрал, салқындату моншасы және вакуумда сүзу мен кептіруге арналғанның бәрі.', 'You need a flask for refluxing, a reflux condenser with a stand, heating, boiling chips, something to measure liquids, a cooling bath and everything for vacuum filtration and drying.'),
};

/* ---------------------------------------------------------------- 2. навеска */
const s2 = {
  type: 'weigh', id: 'weigh',
  title: L('Навеска малеиновой кислоты', 'Малеин қышқылының өлшендісі', 'Weighing the maleic acid'),
  instr: L('<ol><li>Возьмите на аналитических весах <b>2,0 г</b> малеиновой кислоты (1,95–2,05 г).</li><li>Лодочка → тарирование → вещество → закрыть дверцы → записать.</li></ol><p class="note">Фактическая масса до 0,0001 г — по ней считают выход.</p>',
    '<ol><li>Аналитикалық таразыда <b>2,0 г</b> малеин қышқылын алыңыз (1,95–2,05 г).</li><li>Қайықша → тарировкалау → зат → есікшелерді жабу → жазу.</li></ol><p class="note">0,0001 г-ға дейінгі нақты масса — шығым соған қарай есептеледі.</p>',
    '<ol><li>Weigh out <b>2.0 g</b> of maleic acid on the analytical balance (1.95–2.05 g).</li><li>Boat → tare → solid → close the doors → record.</li></ol><p class="note">The actual mass to 0.0001 g is used to calculate the yield.</p>'),
  need: L('Запишите массу навески', 'Өлшендінің массасын жазыңыз', 'Record the mass of the sample'),
  reagent: L('малеин. к-та', 'малеин қ-лы', 'maleic acid'), mode: 'spatula', container: 'boat', target: 2.0, lo: 1.95, hi: 2.05, saveAs: 'mMal',
  onRecord(S, m, ctx) {
    ctx.log(L(`Навеска малеиновой кислоты: <b>${g(m)} г</b> (${n((m / 116.07) * 1000, 1)} ммоль); перенесена в круглодонную колбу на 50 мл`, `Малеин қышқылының өлшендісі: <b>${g(m)} г</b> (${n((m / 116.07) * 1000, 1)} ммоль); 50 мл түбі дөңгелек колбаға ауыстырылды`, `Maleic acid sample: <b>${g(m)} g</b> (${n((m / 116.07) * 1000, 1)} mmol); transferred to a 50 mL round-bottomed flask`), 'calc');
  },
};

/* ---------------------------------------------------------------- 3. вода */
const s3 = {
  type: 'measure', id: 'water',
  title: L('Растворение в тёплой воде', 'Жылы суда еріту', 'Dissolving in warm water'),
  instr: L('<ol><li>Отмерьте цилиндром <b>4 мл</b> дистиллированной воды и прилейте к малеиновой кислоте в колбе.</li><li>Подогрейте на водяной бане и покачайте колбу до растворения.</li></ol>',
    '<ol><li>Цилиндрмен <b>4 мл</b> дистилденген су өлшеп, колбадағы малеин қышқылына құйыңыз.</li><li>Су моншасында жылытып, ерігенше колбаны шайқаңыз.</li></ol>',
    '<ol><li>Measure <b>4 mL</b> of distilled water with the cylinder and add it to the maleic acid in the flask.</li><li>Warm on the water bath and swirl until dissolved.</li></ol>'),
  need: L('Растворите кислоту в 4 мл тёплой воды', 'Қышқылды 4 мл жылы суда ерітіңіз', 'Dissolve the acid in 4 mL of warm water'),
  measure: 'cylinder-10', reagent: L('H₂O', 'H₂O', 'H₂O'), bottleSub: L('дист.', 'дист.', 'dist.'), target: 4, tol: 0.3, onDeviation: 'consequence', saveAs: 'vW',
  into: L('круглодонная колба с малеиновой кислотой', 'малеин қышқылы бар түбі дөңгелек колба', 'the round-bottomed flask with maleic acid'),
  then: [{ id: 'warm', label: L('Подогреть на бане и покачать', 'Моншада жылытып, шайқау', 'Warm on the bath and swirl'), advance: 240,
    do(S) { S.T = 50; S.dissolved = dissolvedFrac(S.mMal, S.vW, 50, 'mal') > 0.99; },
    obs: (S) => (dissolvedFrac(S.mMal, S.vW, 50, 'mal') > 0.99 ? L('Малеиновая кислота полностью растворилась в тёплой воде — прозрачный бесцветный раствор', 'Малеин қышқылы жылы суда толық еріді — мөлдір түссіз ерітінді', 'The maleic acid dissolved completely in the warm water — a clear colourless solution') : L('Часть малеиновой кислоты не растворилась — воды мало', 'Малеин қышқылының бір бөлігі ерімеді — су аз', 'Some maleic acid did not dissolve — too little water')) }],
};

/* ---------------------------------------------------------------- 4. как отмерить HCl */
const MOUTH = {
  ru: 'Концентрированную соляную кислоту попытались набрать пипеткой ртом. Пары HCl и капли кислоты попадают в рот и дыхательные пути — химический ожог слизистой. В реальной лаборатории рот немедленно и долго полощут водой, кислоту не глотают, о происшествии сразу сообщают преподавателю и обращаются за медицинской помощью (пп. 12.4, 12.6). Набирать жидкости ртом запрещено — только грушей или дозатором (пп. 2.5, 6.2). Опыт начинают заново.',
  kk: 'Концентрлі тұз қышқылын пипеткамен аузымен тартып алуға тырысты. HCl булары мен қышқыл тамшылары ауызға және тыныс жолдарына түседі — сілемейлі қабықтың химиялық күйігі. Нақты зертханада ауызды дереу әрі ұзақ сумен шаяды, қышқылды жұтпайды, оқиға туралы бірден оқытушыға хабарлап, медициналық көмекке жүгінеді (12.4, 12.6-тармақтар). Сұйықтарды аузымен тартуға тыйым салынған — тек алмұртпен немесе дозатормен (2.5, 6.2-тармақтар). Тәжірибе қайта басталады.',
  en: 'Concentrated hydrochloric acid was drawn into a pipette by mouth. HCl vapour and drops of acid reach the mouth and airways — a chemical burn of the mucous membranes. In a real lab the mouth is rinsed at once and thoroughly with water, the acid is not swallowed, the instructor is told immediately and medical help is sought (rules 12.4, 12.6). Liquids are never pipetted by mouth — only with a bulb or a dispenser (rules 2.5, 6.2). The experiment is started again.',
};
const s4 = {
  type: 'decide', id: 'hcl-how',
  title: L('Как отмерить концентрированную HCl', 'Концентрлі HCl-ді қалай өлшеу керек', 'How to measure concentrated HCl'),
  instr: L('<p>Нужно <b>4 мл</b> концентрированной HCl (36 %). Выберите способ.</p>', '<p><b>4 мл</b> концентрлі HCl (36 %) қажет. Тәсілді таңдаңыз.</p>', '<p>You need <b>4 mL</b> of concentrated HCl (36 %). Choose how to measure it.</p>'),
  need: L('Выберите способ', 'Тәсілді таңдаңыз', 'Choose a method'),
  question: L('Как вы отмерите кислоту?', 'Қышқылды қалай өлшейсіз?', 'How will you measure the acid?'),
  options: [
    { id: 'hood', ok: true, label: L('В вытяжном шкафу, мерным цилиндром на 10 мл, склянку сразу закрыть', 'Тартпа шкафта, 10 мл өлшегіш цилиндрмен, склянканы бірден жабу', 'In the fume hood, with a 10 mL measuring cylinder; close the bottle at once'), advance: 30, why: L('конц. кислоты разливают только в шкафу (п. 6.1)', 'конц. қышқылдарды тек шкафта құяды (6.1-тармақ)', 'concentrated acids are poured only in the hood (rule 6.1)'), log: L('Склянка с конц. HCl открыта в вытяжном шкафу', 'Конц. HCl склянкасы тартпа шкафта ашылды', 'The conc. HCl bottle was opened in the fume hood') },
    { id: 'mouth', ok: false, label: L('Пипеткой на 5 мл — так точнее, набрать ртом', '5 мл пипеткамен — дәлірек, аузымен тарту', 'With a 5 mL pipette — it is more accurate; draw it up by mouth'), remark: L('попытка набрать концентрированную HCl пипеткой ртом (пп. 2.5, 6.2 правил ТБ)', 'концентрлі HCl-ді пипеткамен аузымен тарту әрекеті (ҚТ ережелерінің 2.5, 6.2-тармақтары)', 'attempt to pipette concentrated HCl by mouth (safety rules 2.5, 6.2)'), critical: { text: MOUTH } },
    { id: 'bench', ok: false, severity: 'safety', retry: true, label: L('Налить у себя на столе, пока шкаф занят', 'Шкаф бос болмаса, өз үстеліңде құю', 'Pour it at your own bench while the hood is busy'), remark: L('концентрированную HCl наливали вне вытяжного шкафа (п. 6.1 правил ТБ)', 'концентрлі HCl тартпа шкафтан тыс құйылды (ҚТ ережелерінің 6.1-тармағы)', 'concentrated HCl poured outside the fume hood (safety rule 6.1)'),
      whatif: L('Хлороводород сразу поднимается из склянки и раздражает глаза и дыхательные пути — ваши и соседей. Подождите, пока освободится шкаф.', 'Хлорсутек склянкадан бірден көтеріліп, сіздің және көршілеріңіздің көзін және тыныс жолдарын тітіркендіреді. Шкаф босағанша күтіңіз.', 'Hydrogen chloride rises from the bottle at once and irritates your eyes and lungs and your neighbours’. Wait until the hood is free.') },
  ],
};

/* ---------------------------------------------------------------- 5. HCl */
const s5 = {
  type: 'measure', id: 'hcl',
  title: L('Концентрированная HCl', 'Концентрлі HCl', 'Concentrated HCl'),
  instr: L('<ol><li>В вытяжном шкафу отмерьте цилиндром <b>4 мл</b> конц. HCl (36 %).</li><li>Прилейте её к раствору малеиновой кислоты в колбе.</li></ol><p class="note">Излишек кислоты в склянку не возвращают — только в отходы.</p>',
    '<ol><li>Тартпа шкафта цилиндрмен <b>4 мл</b> конц. HCl (36 %) өлшеңіз.</li><li>Оны колбадағы малеин қышқылының ерітіндісіне құйыңыз.</li></ol><p class="note">Қышқылдың артығы склянкаға қайтарылмайды — тек қалдыққа.</p>',
    '<ol><li>In the fume hood measure <b>4 mL</b> of conc. HCl (36 %) with the cylinder.</li><li>Add it to the maleic acid solution in the flask.</li></ol><p class="note">Excess acid never goes back into the bottle — only into the waste.</p>'),
  need: L('Прилейте 4 мл конц. HCl', '4 мл конц. HCl құйыңыз', 'Add 4 mL of conc. HCl'),
  measure: 'cylinder-10', reagent: L('HCl', 'HCl', 'HCl'), bottleSub: L('36 %', '36 %', '36 %'), target: 4, tol: 0.3, onDeviation: 'consequence', deviationSeverity: 'minor', saveAs: 'vHCl',
  into: L('круглодонная колба', 'түбі дөңгелек колба', 'the round-bottomed flask'),
  onTransfer(S, v, ctx) { S.c = cHCl(v, S.vW, S.mMal); S.c0 = S.c; S.Tb = boilT(S.c); ctx.log(L('Над колбой появился слабый туман HCl; раствор бесцветный, прозрачный', 'Колба үстінде әлсіз HCl тұманы пайда болды; ерітінді түссіз, мөлдір', 'A faint HCl mist appeared above the flask; the solution is clear and colourless'), 'obs'); },
};

/* ---------------------------------------------------------------- 6. сборка установки */
const s6 = {
  type: 'assemble', id: 'reflux-setup',
  title: L('Сборка установки с обратным холодильником', 'Кері мұздатқышы бар қондырғыны жинау', 'Assembling the reflux set-up'),
  instr: L('<p>Соберите установку для кипячения с обратным холодильником: выберите деталь и нажмите место (в панели или на стенде). Колба уже закреплена в лапке штатива.</p><p class="note">Кипелки — в колбу до нагревания; холодильник — на шлиф колбы; вода в рубашку холодильника подаётся в один из штуцеров; нагрев — снизу. Ошибка сборки проявится при нагревании.</p>',
    '<p>Кері мұздатқышпен қайнатуға арналған қондырғыны жинаңыз: бөлшекті таңдап, орынды басыңыз (панельде немесе стендте). Колба штатив қысқышына бекітілген.</p><p class="note">Қайнату тастары — қыздыру алдында колбаға; мұздатқыш — колба шлифіне; мұздатқыш қабына су штуцерлердің біріне беріледі; қыздыру — төменнен. Жинаудағы қате қыздыру кезінде байқалады.</p>',
    '<p>Assemble the set-up for heating under reflux: choose a part and tap its position (in the panel or on the bench). The flask is already held in the stand clamp.</p><p class="note">Boiling chips go into the flask before heating; the condenser goes on the flask joint; cooling water enters the condenser jacket through one of the two inlets; heating is from below. An assembly mistake will show up during heating.</p>'),
  need: L('Соберите установку', 'Қондырғыны жинаңыз', 'Assemble the set-up'),
  parts: [
    { id: 'chips', label: L('Кипелки', 'Қайнату тастары', 'Boiling chips') },
    { id: 'rod', label: L('Палочка', 'Таяқша', 'Glass rod') },
    { id: 'cond', label: L('Холодильник', 'Мұздатқыш', 'Condenser') },
    { id: 'stopper', label: L('Пробка', 'Тығын', 'Stopper') },
    { id: 'wlow', label: L('Вода снизу', 'Су төменнен', 'Water in low') },
    { id: 'wtop', label: L('Вода сверху', 'Су жоғарыдан', 'Water in high') },
    { id: 'bath', label: L('Водяная баня', 'Су моншасы', 'Water bath') },
    { id: 'mantle', label: L('Колбонагрев.', 'Колба қыздырғыш', 'Heating mantle') },
    { id: 'plate', label: L('Плитка', 'Плита', 'Hot plate') },
  ],
  slots: [
    { id: 'in', label: L('В колбу', 'Колбаға', 'Into the flask'), accepts: 'chips', x: 286, y: 176 },
    { id: 'top', label: L('На шлиф', 'Шлифке', 'On the joint'), accepts: 'cond', x: 286, y: 112 },
    { id: 'water', label: L('Вода', 'Су', 'Water'), accepts: 'wlow', x: 286, y: 56 },
    { id: 'heat', label: L('Нагрев', 'Қыздыру', 'Heating'), accepts: 'bath', x: 286, y: 214 },
  ],
  base: assembleBase,
  onDone(S, place, errors, ctx) {
    S.asm = {
      chips: place.in === 'chips',
      top: place.top === 'cond' ? 'condenser' : place.top === 'stopper' ? 'stopper' : 'open',
      water: place.water === 'wlow' ? 'bottom' : place.water === 'wtop' ? 'top' : 'none',
      heat: place.heat === 'bath' || place.heat === 'mantle' ? place.heat : place.heat === 'plate' ? 'plate' : 'none',
    };
    if (place.heat === 'mantle') ctx.log(L('Нагрев — колбонагреватель (методичка допускает водяную баню или колбонагреватель)', 'Қыздыру — колба қыздырғыш (әдістеме су моншасын немесе колба қыздырғышты рұқсат етеді)', 'Heating — heating mantle (the manual allows a water bath or a heating mantle)'));
  },
  hint1: L('В колбу до нагревания — кипелки; на колбу — вертикальный обратный холодильник; вода подаётся снизу, выходит сверху; нагрев — водяная баня или колбонагреватель.', 'Колбаға қыздыру алдында — қайнату тастары; колбаға — тік кері мұздатқыш; су төменнен беріліп, жоғарыдан шығады; қыздыру — су моншасы немесе колба қыздырғыш.', 'Boiling chips go into the flask before heating; the vertical reflux condenser goes on the flask; water enters at the bottom and leaves at the top; heating is a water bath or a heating mantle.'),
};

/* ---------------------------------------------------------------- 7. кипячение */
const CLOSED = {
  ru: 'Колба была закрыта стеклянной пробкой и нагрета до кипения: пар и хлороводород не находили выхода, давление выросло, пробку выбило, горячая кислая смесь выплеснулась в шкаф (могла разорваться и колба). В реальной лаборатории нагрев немедленно выключают, экран шкафа опускают, пролив нейтрализуют гидрокарбонатом натрия, о происшествии сообщают преподавателю. Нагревать закрытую систему нельзя — нужен обратный холодильник или другой выход для пара (п. 7.4). Установку собирают заново.',
  kk: 'Колба шыны тығынмен жабылып, қайнағанға дейін қыздырылды: бу мен хлорсутек шығатын жол таппады, қысым өсті, тығын атылып шықты, ыстық қышқыл қоспа шкафқа шашырады (колба да жарылуы мүмкін еді). Нақты зертханада қыздыруды бірден өшіріп, шкаф экранын түсіреді, төгілгенді натрий гидрокарбонатымен бейтараптайды, оқиға туралы оқытушыға хабарлайды. Жабық жүйені қыздыруға болмайды — кері мұздатқыш немесе бу шығатын басқа жол қажет (7.4-тармақ). Қондырғы қайта жиналады.',
  en: 'The flask was closed with a glass stopper and heated to boiling: steam and hydrogen chloride had no way out, the pressure rose, the stopper blew out and the hot acid mixture splashed into the hood (the flask itself could have burst). In a real lab the heating is switched off at once, the sash is lowered, the spill is neutralised with sodium hydrogen carbonate and the instructor is told. A closed system must never be heated — it needs a reflux condenser or another vent (rule 7.4). The set-up is assembled again.',
};
const ERUPT = {
  ru: 'Кипелки бросили в жидкость, нагретую до кипения: перегретый раствор мгновенно вскипел по всему объёму, и горячую соляную кислоту выбросило через холодильник. В реальной лаборатории это ожоги рук и лица. Кипелки кладут только в холодную жидкость; если их забыли — нагрев выключают, дают раствору остыть ниже температуры кипения и лишь потом добавляют (п. 5.3). Опыт повторяют.',
  kk: 'Қайнату тастары қайнағанға дейін қыздырылған сұйыққа тасталды: аса қызған ерітінді бүкіл көлемі бойынша лезде қайнап, ыстық тұз қышқылы мұздатқыш арқылы атылып шықты. Нақты зертханада бұл қол мен беттің күйігі. Қайнату тастарын тек суық сұйыққа салады; ұмытып кетсе — қыздыруды өшіріп, ерітіндіні қайнау температурасынан төмен суытып, содан кейін ғана қосады (5.3-тармақ). Тәжірибе қайталанады.',
  en: 'Boiling chips were dropped into liquid heated to boiling: the superheated solution boiled up instantly throughout and hot hydrochloric acid was thrown out through the condenser. In a real lab that means burns to the hands and face. Chips are added only to cold liquid; if you forgot them, switch off the heating, let the solution cool below its boiling point and only then add them (rule 5.3). The experiment is repeated.',
};

const s7 = {
  type: 'process', id: 'reflux',
  title: L('Кипячение с обратным холодильником', 'Кері мұздатқышпен қайнату', 'Heating under reflux'),
  instr: L('<ol><li>Пустите воду в холодильник, затем включите нагрев.</li><li>Кипятите смесь при <b>слабом кипении 15–20 минут</b>: пары должны конденсироваться в нижней трети холодильника.</li><li>Наблюдайте: из горячего раствора начинают выделяться кристаллы фумаровой кислоты.</li><li>Выключите нагрев; воду в холодильнике выключают последней, когда кипение прекратилось.</li></ol>',
    '<ol><li>Мұздатқышқа су жіберіп, содан кейін қыздыруды қосыңыз.</li><li>Қоспаны <b>15–20 минут әлсіз қайнатыңыз</b>: булар мұздатқыштың төменгі үштен бір бөлігінде конденсациялануы тиіс.</li><li>Бақылаңыз: ыстық ерітіндіден фумар қышқылының кристалдары бөліне бастайды.</li><li>Қыздыруды өшіріңіз; мұздатқыштағы суды қайнау тоқтағанда ең соңында өшіреді.</li></ol>',
    '<ol><li>Turn on the condenser water, then switch on the heating.</li><li>Keep the mixture at a <b>gentle boil for 15–20 minutes</b>: the vapour should condense in the lower third of the condenser.</li><li>Watch: crystals of fumaric acid begin to separate from the hot solution.</li><li>Switch off the heating; the condenser water is turned off last, once boiling has stopped.</li></ol>'),
  need: L('Прокипятите 15–20 мин и выключите нагрев', '15–20 мин қайнатып, қыздыруды өшіріңіз', 'Reflux for 15–20 min and switch off the heating'),
  speeds: [10, 30, 60],
  setup(S, lc) { S.T = S.T ?? 40; S.tBoil = 0; S.X = S.X || 0; S.cryst = 0; S.fumes = 0; lc.c.power = 1; if (!S.c) { S.c = cHCl(S.vHCl || 4, S.vW || 4, S.mMal || 2); S.Tb = boilT(S.c); } },
  controls: [
    { kind: 'toggle', id: 'water', group: L('Холодильник', 'Мұздатқыш', 'Condenser'), label: L('Вода в холодильник: открыть', 'Мұздатқышқа су: ашу', 'Condenser water: on'), labelOn: L('Вода в холодильник: закрыть', 'Мұздатқышқа су: жабу', 'Condenser water: off'),
      onChange(S, lc, on, ctx) {
        if (!on && S.T >= S.Tb - 2) ctx.remark({ key: 'water-off', severity: 'safety', text: L('вода в холодильнике перекрыта во время кипения — пары HCl выходят в шкаф', 'қайнау кезінде мұздатқыштағы су жабылды — HCl булары шкафқа шығады', 'condenser water turned off while boiling — HCl vapour escapes into the hood') });
        if (on) ctx.log(S.asm && S.asm.water === 'top' ? L('Вода пущена в верхний штуцер — рубашка холодильника заполнена только наполовину', 'Су жоғарғы штуцерге жіберілді — мұздатқыш қабы тек жартылай толды', 'Water fed into the upper inlet — the condenser jacket is only half full') : L('В холодильник пущена вода (снизу вверх)', 'Мұздатқышқа су жіберілді (төменнен жоғары)', 'Water turned on through the condenser (bottom to top)'));
      } },
    { kind: 'toggle', id: 'heat', group: L('Нагрев', 'Қыздыру', 'Heating'), label: L('Нагрев: включить', 'Қыздыру: қосу', 'Heating: on'), labelOn: L('Нагрев: выключить', 'Қыздыру: өшіру', 'Heating: off'),
      onChange(S, lc, on, ctx) {
        if (on && !lc.c.water && S.asm && S.asm.top === 'condenser') ctx.remark({ key: 'heat-before-water', severity: 'minor', points: 0.5, text: L('нагрев включён раньше, чем пущена вода в холодильник', 'мұздатқышқа су жіберілмей тұрып қыздыру қосылды', 'heating switched on before the condenser water') });
        if (on && S.asm && S.asm.heat === 'plate' && !lc.plateR) { lc.plateR = 1; S.bumpLoss = (S.bumpLoss || 0) + 0.04; ctx.remark({ key: 'plate', severity: 'major', text: L('круглодонную колбу нагревали прямо на электроплитке — местный перегрев, толчки, риск трещины', 'түбі дөңгелек колба тікелей электр плитасында қыздырылды — жергілікті қызу, серпілістер, жарылу қаупі', 'the round-bottomed flask was heated directly on the hot plate — local overheating, bumping, risk of cracking'), whatif: L('Круглое дно касается плитки в одной точке: там жидкость перегревается, кипит толчками и выбрасывается в холодильник, стекло может треснуть. Колбу греют на водяной бане или в колбонагревателе.', 'Дөңгелек түбі плитаға бір нүктеде тиеді: сол жерде сұйық аса қызып, серпіліп қайнайды және мұздатқышқа атылады, шыны жарылуы мүмкін. Колбаны су моншасында немесе колба қыздырғышта қыздырады.', 'The round bottom touches the plate at one point: the liquid overheats there, bumps and is thrown up into the condenser, and the glass may crack. The flask is heated on a water bath or in a heating mantle.') }); }
        if (on) ctx.log(L('Включён нагрев', 'Қыздыру қосылды', 'Heating switched on')); else if (S.tBoil > 0) { lc.heatOffAt = ctx.now(); ctx.log(L(`Нагрев выключен; кипячение продолжалось ${n(S.tBoil / 60, 1)} мин`, `Қыздыру өшірілді; қайнату ${n(S.tBoil / 60, 1)} мин созылды`, `Heating switched off; the mixture boiled for ${n(S.tBoil / 60, 1)} min`), 'obs'); }
      } },
    { kind: 'seg', id: 'power', group: L('Интенсивность кипения', 'Қайнау қарқыны', 'Boiling rate'), options: [[1, L('слабое', 'әлсіз', 'gentle')], [2, L('бурное', 'қарқынды', 'vigorous')]], default: 1 },
    { kind: 'action', id: 'fixheat', once: true, group: L('Нагрев', 'Қыздыру', 'Heating'), label: L('Подставить водяную баню', 'Су моншасын қою', 'Put a water bath under the flask'), disabled: (S) => !S.asm || S.asm.heat !== 'none',
      do(S, lc, ctx) { S.asm.heat = 'bath'; ctx.remark({ key: 'noheat', severity: 'minor', points: 0.5, text: L('в установке не было источника нагрева — баню пришлось подставлять отдельно', 'қондырғыда қыздыру көзі болмады — моншаны бөлек қоюға тура келді', 'the set-up had no heat source — the bath had to be added separately') }); ctx.log(L('Под колбу подставлена водяная баня', 'Колбаның астына су моншасы қойылды', 'A water bath was placed under the flask')); } },
    { kind: 'action', id: 'chips', once: true, group: L('Колба', 'Колба', 'Flask'), label: L('Бросить кипелки в колбу', 'Колбаға қайнату тастарын салу', 'Drop boiling chips into the flask'), disabled: (S) => S.asm && S.asm.chips,
      do(S, lc, ctx) {
        if (S.T >= S.Tb - 6) ctx.remark({ key: 'chips-hot', severity: 'critical', text: L('кипелки брошены в перегретую жидкость — выброс кипящей кислоты', 'қайнату тастары аса қызған сұйыққа тасталды — қайнаған қышқылдың атылып шығуы', 'boiling chips dropped into superheated liquid — boiling acid erupted'), critical: { text: ERUPT } });
        else { S.asm.chips = true; ctx.log(L('В остывшую жидкость добавлены кипелки', 'Суыған сұйыққа қайнату тастары қосылды', 'Boiling chips added to the cooled liquid')); }
      } },
  ],
  tick(S, lc, dt, ctx) {
    const A = S.asm || {}, c = lc.c;
    const heaterT = A.heat === 'bath' ? 100 : A.heat === 'mantle' || A.heat === 'plate' ? 130 + (c.power === 2 ? 30 : 0) : 22;
    const k = A.heat === 'bath' ? 0.0046 : A.heat === 'plate' ? 0.0035 : 0.0055;
    const Tb = S.Tb;
    // водяная баня не доводит до бурного кипения смесь с т. кип. ≈ 101 °C (boilT) — кипение за счёт пара бани и крышки (допущение: бани хватает для слабого кипения)
    const target = c.heat ? (A.heat === 'bath' ? Tb + 8 + (c.power === 2 ? 4 : 0) : heaterT) : 22;
    S.T = Math.min(Tb, relax(S.T, target, (c.heat ? k * 1.3 : 0.0027), dt));
    const boiling = c.heat && S.T >= Tb - 0.4;
    if (boiling && A.top === 'stopper' && !lc.boom) { lc.boom = 1; ctx.remark({ key: 'closed', severity: 'critical', text: L('нагревание закрытой системы (колба закрыта пробкой) — пробку выбило давлением', 'жабық жүйені қыздыру (колба тығынмен жабылған) — тығынды қысым атып шығарды', 'a closed system was heated (stopper in the flask) — the pressure blew the stopper out'), critical: { text: CLOSED } }); return; }
    if (boiling) {
      S.tBoil += dt;
      // потери HCl: нет холодильника/воды, вода сверху, бурное кипение
      const leak = A.top !== 'condenser' || !c.water || A.water === 'none' ? 0.004 : A.water === 'top' ? 0.0012 : c.power === 2 ? 0.0009 : 0.00004;
      S.c = Math.max(0.5, S.c * (1 - leak * dt));
      S.fumes = leak > 0.0005 ? Math.min(0.8, S.fumes + 0.02 * dt) : Math.max(0, S.fumes - 0.05 * dt);
      if (leak > 0.0005) { lc.leakT = (lc.leakT || 0) + dt; if (lc.leakT > 60 && !lc.leakR) { lc.leakR = 1; S.hclLoss = true; ctx.remark({ key: 'hcl-leak', severity: 'major', text: !c.water || A.top !== 'condenser' ? L('кипячение без охлаждения холодильника — пары воды и HCl уходят из колбы', 'мұздатқышты салқындатпай қайнату — су мен HCl булары колбадан кетеді', 'boiling without condenser cooling — water and HCl vapour escape from the flask') : A.water === 'top' ? L('вода подана в верхний штуцер — холодильник не заполнен, пары HCl проскакивают', 'су жоғарғы штуцерге берілді — мұздатқыш толмаған, HCl булары өтіп кетеді', 'water fed into the upper inlet — the condenser is not full and HCl vapour gets through') : L('слишком бурное кипение — кольцо конденсации поднялось к верху холодильника, теряется HCl', 'тым қарқынды қайнау — конденсация сақинасы мұздатқыштың жоғарғы жағына көтерілді, HCl жоғалады', 'boiling too vigorous — the condensation ring rose to the top of the condenser and HCl is lost') }); } }
      if (!A.chips && !lc.bumpSeen) lc.bumpReady = true;
    }
    if (S.T > 60) S.X = 1 - (1 - S.X) * Math.exp(-kIso(S.T, S.c) * dt);
    S.cryst = clamp(crystallised(S.mMal * S.X, (S.vW || 4) + (S.vHCl || 4), S.T) / Math.max(0.1, S.mMal), 0, 1);
    if (S.cryst > 0.05 && !lc.crystLog) { lc.crystLog = 1; ctx.log(L(`Через ${n(S.tBoil / 60, 0)} мин кипения из горячего раствора начали выделяться белые кристаллы фумаровой кислоты`, `${n(S.tBoil / 60, 0)} мин қайнағаннан кейін ыстық ерітіндіден фумар қышқылының ақ кристалдары бөліне бастады`, `After ${n(S.tBoil / 60, 0)} min of boiling white crystals of fumaric acid began to separate from the hot solution`), 'obs'); }
    if (lc.heatOffAt == null && !c.heat && S.tBoil > 0 && !lc.offLogged) lc.offLogged = true;
  },
  readouts: (S, lc) => [
    { label: L('Смесь', 'Қоспа', 'Mixture'), value: n(S.T, 0) + ' °C', st: S.T >= S.Tb - 0.4 && lc.c.heat ? 'ok' : '' },
    { label: L('Кипение', 'Қайнау', 'Boiling'), value: { ru: n(S.tBoil / 60, 1) + ' мин', kk: n(S.tBoil / 60, 1) + ' мин', en: n(S.tBoil / 60, 1) + ' min' }, st: S.tBoil >= 900 && S.tBoil <= 1500 ? 'ok' : S.tBoil > 1500 ? 'warn' : '' },
    { label: L('Кристаллы', 'Кристалдар', 'Crystals'), value: S.cryst > 0.05 ? L('выделяются', 'бөлінуде', 'separating') : '—' },
  ],
  alerts(S, lc) {
    const A = S.asm || {};
    if (!lc.c.heat) return S.tBoil > 0 ? null : { text: L('Пустите воду в холодильник и включите нагрев.', 'Мұздатқышқа су жіберіп, қыздыруды қосыңыз.', 'Turn on the condenser water and switch on the heating.'), kind: 'info' };
    if (S.T >= S.Tb - 0.4 && (!lc.c.water || A.water === 'top')) return { text: L('Пары поднимаются выше холодильника — над установкой туман HCl!', 'Булар мұздатқыштан жоғары көтерілуде — қондырғы үстінде HCl тұманы!', 'Vapour is rising past the condenser — HCl mist above the set-up!'), kind: 'bad' };
    if (S.T >= S.Tb - 0.4 && lc.c.power === 2) return { text: L('Кипение слишком бурное: кольцо конденсации у верха холодильника. Уменьшите нагрев.', 'Қайнау тым қарқынды: конденсация сақинасы мұздатқыштың жоғарғы жағында. Қыздыруды азайтыңыз.', 'Boiling too vigorous: the condensation ring is near the top of the condenser. Turn the heat down.'), kind: 'warn' };
    if (S.tBoil >= 900) return { text: L('Прошло 15 минут кипения. Можно выключать нагрев (до 20 мин — допустимо).', 'Қайнағанына 15 минут болды. Қыздыруды өшіруге болады (20 минутқа дейін — рұқсат).', '15 minutes of boiling done. You can switch off the heating (up to 20 min is fine).'), kind: 'good' };
    return null;
  },
  events: [
    { id: 'bump', when: (S, lc) => lc.bumpReady && S.tBoil > 40,
      title: L('Толчки при кипении', 'Қайнау кезіндегі серпілістер', 'Bumping'),
      text: L('Жидкость в колбе кипит толчками: она то затихает, то резко вскипает, колба вздрагивает в лапке. В колбе нет кипелок. Что вы сделаете?', 'Колбадағы сұйық серпіліп қайнайды: бірде тынып, бірде кенет қайнайды, колба қысқышта дірілдейді. Колбада қайнату тастары жоқ. Не істейсіз?', 'The liquid in the flask is bumping: it goes quiet, then boils up violently, and the flask jerks in the clamp. There are no boiling chips in the flask. What do you do?'),
      options: [
        { ok: true, label: L('Выключить нагрев, дать остыть ниже кипения, затем добавить кипелки', 'Қыздыруды өшіріп, қайнаудан төмен суыту, содан кейін қайнату тастарын қосу', 'Switch off the heating, let it cool below boiling, then add chips'), effect(S, lc, ctx) { lc.c.heat = false; S.T = S.Tb - 25; S.asm.chips = true; ctx.advance(480); },
          log: L('Нагрев выключен, после охлаждения ниже кипения в колбу добавлены кипелки; кипячение возобновлено', 'Қыздыру өшірілді, қайнаудан төмен суығаннан кейін колбаға қайнату тастары қосылды; қайнату қайта басталды', 'Heating switched off; after cooling below boiling, chips were added and refluxing resumed') },
        { ok: false, label: L('Сразу бросить кипелки в кипящую жидкость', 'Қайнату тастарын бірден қайнаған сұйыққа тастау', 'Drop chips straight into the boiling liquid'), remark: L('кипелки брошены в перегретую жидкость — выброс кипящей кислоты', 'қайнату тастары аса қызған сұйыққа тасталды — қайнаған қышқылдың атылып шығуы', 'boiling chips dropped into superheated liquid — boiling acid erupted'), critical: { text: ERUPT } },
        { ok: false, severity: 'major', label: L('Ничего не делать — так и кипятить', 'Ештеңе істемеу — осылай қайнату', 'Do nothing — carry on boiling'), remark: L('кипячение с толчками без кипелок — часть смеси выброшена в холодильник', 'қайнату тастарынсыз серпіліп қайнату — қоспаның бір бөлігі мұздатқышқа атылды', 'bumping without chips — part of the mixture was thrown up into the condenser'),
          whatif: L('При толчках перегретая жидкость вскипает рывком и выбрасывается в холодильник: теряется смесь, можно сорвать колбу с лапки.', 'Серпілістер кезінде аса қызған сұйық кенет қайнап, мұздатқышқа атылады: қоспа жоғалады, колбаны қысқыштан жұлып алуы мүмкін.', 'With bumping the superheated liquid boils up in jerks and is thrown into the condenser: mixture is lost and the flask may be shaken loose.'), effect(S) { S.bumpLoss = 0.06; } },
      ] },
    { id: 'call', when: (S) => S.tBoil > 300,
      title: L('Вас зовут', 'Сізді шақырады', 'Someone calls you'),
      text: L('Идёт кипячение. Однокурсник зовёт вас в коридор на пять минут — показать расписание зачёта. Что вы сделаете?', 'Қайнату жүріп жатыр. Курстасыңыз сынақ кестесін көрсету үшін сізді бес минутқа дәлізге шақырады. Не істейсіз?', 'Refluxing is under way. A classmate calls you into the corridor for five minutes to show you the test timetable. What do you do?'),
      options: [
        { ok: true, label: L('Остаться у установки — посмотрю после кипячения', 'Қондырғының жанында қалу — қайнатудан кейін қараймын', 'Stay with the apparatus — I will look after the reflux'), log: L('Работающая установка не оставлена без присмотра', 'Жұмыс істеп тұрған қондырғы қараусыз қалдырылмады', 'The running apparatus was not left unattended') },
        { ok: false, severity: 'safety', label: L('Отойти на пять минут — ничего не случится', 'Бес минутқа кету — ештеңе болмайды', 'Step out for five minutes — nothing will happen'), remark: L('нагревательный прибор с кипящей кислотой оставлен без присмотра (пп. 2.1, 7.2 правил ТБ)', 'қайнап жатқан қышқылы бар қыздыру құралы қараусыз қалдырылды (ҚТ ережелерінің 2.1, 7.2-тармақтары)', 'a heater with boiling acid was left unattended (safety rules 2.1, 7.2)'),
          whatif: L('За пять минут без присмотра может кончиться вода в холодильнике, упасть давление в водопроводе или начаться толчки — и некому выключить нагрев.', 'Бес минут қараусыз қалғанда мұздатқыштағы су таусылуы, су құбырындағы қысым төмендеуі немесе серпілістер басталуы мүмкін — ал қыздыруды өшіретін ешкім жоқ.', 'In five minutes unattended the condenser water may fail, the mains pressure may drop or bumping may start — and nobody is there to switch off the heat.'), effect(S, lc, ctx) { ctx.advance(300); } },
      ] },
  ],
  done(S, lc) {
    if (S.tBoil > 0 && !lc.c.heat && S.T < S.Tb - 5) {
      if (S.tBoil < 600) return false;
      return { text: L('Кипячение закончено, нагрев выключен. Можно закрыть воду и охлаждать.', 'Қайнату аяқталды, қыздыру өшірілді. Суды жауып, салқындатуға болады.', 'Refluxing finished and the heating is off. You may turn off the water and cool the flask.') };
    }
    return false;
  },
  onLeave(S, ctx) {
    const t = S.tBoil / 60;
    if (t < 15) ctx.remark({ key: 'short', severity: 'major', text: L(`кипячение короче 15 мин (${n(t, 1)} мин) — изомеризация не завершена`, `қайнату 15 минуттан қысқа (${n(t, 1)} мин) — изомерлеу аяқталмады`, `refluxed for less than 15 min (${n(t, 1)} min) — isomerisation incomplete`) });
    else if (t > 30) ctx.remark({ key: 'long', severity: 'minor', points: 0.5, text: L(`кипячение затянуто (${n(t, 0)} мин вместо 15–20)`, `қайнату созылып кетті (15–20 орнына ${n(t, 0)} мин)`, `refluxed for too long (${n(t, 0)} min instead of 15–20)`) });
    ctx.log(L(`Изомеризация: кипячение ${n(t, 1)} мин; смесь — густая суспензия белых кристаллов`, `Изомерлеу: қайнату ${n(t, 1)} мин; қоспа — ақ кристалдардың қою суспензиясы`, `Isomerisation: refluxed for ${n(t, 1)} min; the mixture is a thick suspension of white crystals`), 'obs');
  },
  scene: (S, lc) => refluxScene(S, lc),
};

/* ---------------------------------------------------------------- 8. охлаждение */
const s8 = {
  type: 'process', id: 'cool',
  title: L('Охлаждение', 'Салқындату', 'Cooling'),
  instr: L('<ol><li>Закройте воду в холодильнике, снимите холодильник и выньте колбу из бани.</li><li>Охладите смесь <b>до комнатной температуры</b>, затем — <b>в ледяной бане</b>.</li></ol><p class="note">Горячую колбу сразу в лёд не ставят: стекло может треснуть, а при резком охлаждении выпадают мелкие кристаллы, захватывающие маточный раствор.</p>',
    '<ol><li>Мұздатқыштағы суды жауып, мұздатқышты алып, колбаны моншадан шығарыңыз.</li><li>Қоспаны <b>бөлме температурасына дейін</b>, содан кейін <b>мұз моншасында</b> салқындатыңыз.</li></ol><p class="note">Ыстық колбаны бірден мұзға қоймайды: шыны жарылуы мүмкін, ал кенет салқындатқанда аналық ерітіндіні ұстап қалатын ұсақ кристалдар түзіледі.</p>',
    '<ol><li>Turn off the condenser water, remove the condenser and take the flask out of the bath.</li><li>Cool the mixture <b>to room temperature</b>, then <b>in an ice bath</b>.</li></ol><p class="note">A hot flask is not put straight into ice: the glass may crack, and sudden cooling gives small crystals that trap mother liquor.</p>'),
  need: L('Охладите смесь до 0–5 °C', 'Қоспаны 0–5 °C-қа дейін салқындатыңыз', 'Cool the mixture to 0–5 °C'),
  speeds: [10, 30, 60],
  setup(S) { S.cool = { ice: false, shock: false, air: 0 }; S.T = Math.min(S.T, S.Tb - 6); },
  controls: [
    { kind: 'action', id: 'air', group: L('Охлаждение', 'Салқындату', 'Cooling'), label: L('Оставить остывать на воздухе', 'Ауада суытуға қалдыру', 'Leave to cool in air'), log: L('Колба оставлена остывать на воздухе (на пробковом кольце)', 'Колба ауада суытуға қалдырылды (тығын сақинада)', 'Flask left to cool in air (on a cork ring)'), do(S) { S.cool.air = 1; } },
    { kind: 'action', id: 'ice', group: L('Охлаждение', 'Салқындату', 'Cooling'), label: L('Поставить колбу в ледяную баню', 'Колбаны мұз моншасына қою', 'Put the flask into an ice bath'),
      do(S, lc, ctx) {
        if (S.T > 45) { S.cool.shock = true; ctx.remark({ key: 'shock', severity: 'minor', points: 0.5, text: L(`горячая колба (${n(S.T, 0)} °C) сразу поставлена в лёд — мелкие кристаллы, риск трещины (п. 9.4 правил ТБ)`, `ыстық колба (${n(S.T, 0)} °C) бірден мұзға қойылды — ұсақ кристалдар, жарылу қаупі (ҚТ ережелерінің 9.4-тармағы)`, `hot flask (${n(S.T, 0)} °C) put straight into ice — small crystals and a risk of cracking (safety rule 9.4)`) }); }
        S.cool.ice = true; ctx.log(L('Колба помещена в ледяную баню', 'Колба мұз моншасына салынды', 'Flask placed in the ice bath'));
      } },
  ],
  tick(S, lc, dt) {
    const tgt = S.cool.ice ? 1.5 : S.cool.air ? 22 : 22;
    const k = S.cool.ice ? 0.006 : S.cool.air ? 0.0022 : 0.0012;
    S.T = relax(S.T, tgt, k, dt);
    const V = (S.vW || 4) + (S.vHCl || 4);
    S.cryst = clamp(crystallised(S.mMal * S.X, V, S.T) / Math.max(0.1, S.mMal), 0, 1);
  },
  readouts: (S) => [
    { label: L('Смесь', 'Қоспа', 'Mixture'), value: n(S.T, 1) + ' °C', st: S.T <= 5 ? 'ok' : '' },
    { label: L('Где', 'Қайда', 'Where'), value: S.cool.ice ? L('ледяная баня', 'мұз моншасы', 'ice bath') : S.cool.air ? L('на воздухе', 'ауада', 'in air') : '—' },
  ],
  done(S, lc, ctx) {
    if (S.cool.ice && S.T <= 5) {
      S.Tfilt = S.T;
      ctx.log(L(`Смесь охлаждена до ${n(S.T, 1)} °C; кристаллы фумаровой кислоты заполнили колбу${S.cool.shock ? ' (мелкие)' : ' (иглы и призмы)'}`, `Қоспа ${n(S.T, 1)} °C-қа дейін салқындатылды; фумар қышқылының кристалдары колбаны толтырды${S.cool.shock ? ' (ұсақ)' : ' (инелер мен призмалар)'}`, `Mixture cooled to ${n(S.T, 1)} °C; crystals of fumaric acid fill the flask${S.cool.shock ? ' (small)' : ' (needles and prisms)'}`), 'obs');
      return { text: L('Смесь охлаждена.', 'Қоспа салқындатылды.', 'The mixture is cold.') };
    }
    return false;
  },
  scene: coolScene,
};

/* ---------------------------------------------------------------- 9. фильтрование */
const s9 = {
  type: 'separate', id: 'filt', mode: 'filter', keep: 'cake',
  title: L('Фильтрование и промывание', 'Сүзу және жуу', 'Filtration and washing'),
  instr: L('<ol><li>Отфильтруйте кристаллы под вакуумом на воронке Бюхнера.</li><li>Промойте их на фильтре <b>небольшим количеством холодной воды</b> (2–3 порции по ~2 мл), проверяя промывные воды индикаторной бумагой.</li></ol><p class="note">Перед выключением водоструйного насоса отсоедините шланг от колбы Бунзена.</p>',
    '<ol><li>Кристалдарды Бюхнер шұңғымасында вакуумда сүзіңіз.</li><li>Оларды сүзгіде <b>аз мөлшердегі суық сумен</b> жуыңыз (~2 мл-ден 2–3 порция), жуынды суды индикатор қағазымен тексеріп отырыңыз.</li></ol><p class="note">Су ағынды сорғыны өшірмес бұрын шлангты Бунзен колбасынан ажыратыңыз.</p>',
    '<ol><li>Collect the crystals by vacuum filtration on a Büchner funnel.</li><li>Wash them on the filter with <b>a little cold water</b> (2–3 portions of ~2 mL), testing the washings with indicator paper.</li></ol><p class="note">Before switching off the water aspirator, disconnect the hose from the filter flask.</p>'),
  need: L('Отфильтруйте и промойте кристаллы', 'Кристалдарды сүзіп, жуыңыз', 'Filter and wash the crystals'),
  liquids: [
    { id: 'cold', ok: true, label: L('Холодная вода (~2 мл)', 'Суық су (~2 мл)', 'Cold water (~2 mL)') },
    { id: 'warm', ok: false, severity: 'major', label: L('Тёплая вода (~2 мл) — лучше смывает кислоту', 'Жылы су (~2 мл) — қышқылды жақсы шаяды', 'Warm water (~2 mL) — washes the acid out better'),
      remark: L('кристаллы промыты тёплой водой — часть фумаровой кислоты растворилась', 'кристалдар жылы сумен жуылды — фумар қышқылының бір бөлігі еріді', 'crystals washed with warm water — some fumaric acid dissolved'),
      whatif: L('Растворимость фумаровой кислоты растёт с температурой в несколько раз: тёплая вода уносит продукт в фильтрат.', 'Фумар қышқылының ерігіштігі температурамен бірнеше есе өседі: жылы су өнімді фильтратқа алып кетеді.', 'The solubility of fumaric acid rises several-fold with temperature: warm water carries the product into the filtrate.'), effect(S, F) { F.warm = (F.warm || 0) + 1; } },
    { id: 'etoh', ok: false, severity: 'major', label: L('Этанол (~2 мл) — быстрее высохнет', 'Этанол (~2 мл) — тезірек кебеді', 'Ethanol (~2 mL) — it dries faster'),
      remark: L('кристаллы промыты этанолом — фумаровая кислота в нём заметно растворима', 'кристалдар этанолмен жуылды — фумар қышқылы онда айтарлықтай ериді', 'crystals washed with ethanol — fumaric acid is noticeably soluble in it'),
      whatif: L('Фумаровая кислота растворяется в этаноле значительно лучше, чем в холодной воде: заметная часть продукта уходит в фильтрат, а спирт загрязняет водные кислотные отходы.', 'Фумар қышқылы этанолда суық суға қарағанда әлдеқайда жақсы ериді: өнімнің айтарлықтай бөлігі фильтратқа кетеді, ал спирт сулы қышқыл қалдықтарды ластайды.', 'Fumaric acid dissolves much better in ethanol than in cold water: a noticeable part of the product goes into the filtrate and the alcohol contaminates the aqueous acid waste.'), effect(S, F) { F.etoh = (F.etoh || 0) + 1; } },
  ],
  okPH: 1.8,
  washings: (S, F) => washPH(F.coldW || 0),
  onVacuum() { return true; },
  onTransfer(S, F, ctx) { if (S.bumpLoss) F.loss += S.bumpLoss; ctx.log(L('Фильтрат — прозрачный, сильнокислый (pH < 1), с запахом HCl', 'Фильтрат — мөлдір, күшті қышқыл (pH < 1), HCl иісі бар', 'The filtrate is clear and strongly acidic (pH < 1) and smells of HCl'), 'obs'); },
  onWash(S, F, liq) { if (liq.id === 'cold') F.coldW = (F.coldW || 0) + 1; },
  washFeedback(p) {
    const r = Math.round(p * 10) / 10;
    if (r < 0.5) return L('Бумага красная — промывные воды сильнокислые (HCl).', 'Қағаз қызыл — жуынды су күшті қышқыл (HCl).', 'The paper is red — the washings are strongly acidic (HCl).');
    if (r < 1.8) return L('Бумага красная с оранжевым — ещё много HCl.', 'Қағаз қызғылт сарымен қызыл — HCl әлі көп.', 'The paper is red-orange — still a lot of HCl.');
    return L('Бумага оранжево-красная, pH ≈ 2: HCl отмыта. Выше pH не поднимется — сама фумаровая кислота немного растворима и кисла.', 'Қағаз қызғылт-қызыл, pH ≈ 2: HCl жуылды. pH бұдан жоғарыламайды — фумар қышқылының өзі аздап ериді және қышқыл.', 'The paper is orange-red, pH ≈ 2: the HCl has been washed out. It will not go higher — fumaric acid itself is slightly soluble and acidic.');
  },
  finishCheck(S, F, ctx) {
    const cw = F.coldW || 0;
    if (cw + (F.warm || 0) + (F.etoh || 0) < 2 || F.lastCheck !== F.washes) ctx.remark({ key: 'wash', severity: 'minor', points: 0.5, text: L('кристаллы промыты недостаточно или не проверены последние промывные воды — в продукте остаются HCl и малеиновая кислота', 'кристалдар жеткіліксіз жуылды немесе соңғы жуынды су тексерілмеді — өнімде HCl мен малеин қышқылы қалады', 'crystals insufficiently washed, or the last washings not tested — HCl and maleic acid remain in the product') });
    if (F.washes > 5) ctx.remark({ key: 'overwash', severity: 'minor', points: 0.5, text: L('лишние промывки — потери продукта', 'артық жуу — өнім шығыны', 'too many washes — product lost') });
  },
  onFinish(S, F, ctx) {
    S.wash = { cold: F.coldW || 0, warm: F.warm || 0, etoh: F.etoh || 0, loss: F.loss || 0 };
    S.P = makeProduct({ mMal: S.mMal, X: S.X, Vmix: (S.vW || 4) + (S.vHCl || 4), Tfilt: S.Tfilt ?? 4, washes: S.wash.cold, warmW: S.wash.warm, etOH: S.wash.etoh, shock: S.cool && S.cool.shock, lossMech: 0.06 + (F.loss || 0) });
    ctx.log(L(`Кристаллы отжаты на фильтре: белые блестящие призмы и иглы, влажная масса ≈ ${n(S.P.m * 1.35, 1)} г`, `Кристалдар сүзгіде сығылды: ақ жылтыр призмалар мен инелер, ылғал массасы ≈ ${n(S.P.m * 1.35, 1)} г`, `Crystals pressed dry on the filter: white shiny prisms and needles, wet mass ≈ ${n(S.P.m * 1.35, 1)} g`), 'obs');
  },
};

/* ---------------------------------------------------------------- 10. сушка */
const s10 = {
  type: 'decide', id: 'dry',
  title: L('Сушка продукта', 'Өнімді кептіру', 'Drying the product'),
  instr: L('<p>Перед взвешиванием кристаллы нужно высушить.</p><p class="note">Теоретический выход — 2,0 г: при изомеризации молярная масса не меняется.</p>', '<p>Өлшемес бұрын кристалдарды кептіру керек.</p><p class="note">Теориялық шығым — 2,0 г: изомерлеу кезінде молярлық масса өзгермейді.</p>', '<p>The crystals must be dried before weighing.</p><p class="note">The theoretical yield is 2.0 g: isomerisation does not change the molar mass.</p>'),
  need: L('Выберите способ сушки', 'Кептіру тәсілін таңдаңыз', 'Choose how to dry'),
  question: L('Как подготовить продукт к взвешиванию?', 'Өнімді өлшеуге қалай дайындайды?', 'How do you prepare the product for weighing?'),
  options: [
    { id: 'air', ok: true, label: L('Перенести на часовое стекло и сушить на воздухе до следующего занятия', 'Сағат шынысына ауыстырып, келесі сабаққа дейін ауада кептіру', 'Transfer to a watch glass and dry in air until the next session'), effect(S, i, ctx) { S.water = 0.002; ctx.nextDay(); }, log: L('Кристаллы на часовом стекле оставлены сушиться на воздухе до следующего занятия', 'Сағат шынысындағы кристалдар келесі сабаққа дейін ауада кептіруге қалдырылды', 'Crystals left to dry in air on a watch glass until the next session') },
    { id: 'filter', ok: false, severity: 'minor', label: L('Подсушить на фильтре, просасывая воздух 15 мин', 'Сүзгіде 15 мин ауа сорып кептіру', 'Dry on the filter by drawing air through for 15 min'), remark: L('продукт недосушен (15 мин на фильтре) — масса немного завышена', 'өнім толық кептірілмеген (сүзгіде 15 мин) — масса сәл жоғары', 'product not fully dry (15 min on the filter) — mass slightly high'), whatif: L('За 15 минут вода с кристаллов уходит не вся: масса и выход окажутся завышены.', '15 минутта кристалдардағы судың бәрі кетпейді: масса мен шығым жоғары болады.', 'In 15 minutes not all the water leaves the crystals: the mass and yield will be too high.'), advance: 900, effect(S) { S.water = 0.05; }, log: L('Кристаллы подсушены на фильтре током воздуха 15 мин', 'Кристалдар сүзгіде ауа ағынымен 15 мин кептірілді', 'Crystals dried on the filter with an air stream for 15 min') },
    { id: 'wet', ok: false, severity: 'major', label: L('Взвесить сразу', 'Бірден өлшеу', 'Weigh straight away'), remark: L('продукт взвешен влажным — масса и выход завышены', 'өнім ылғал күйінде өлшенді — масса мен шығым жоғарылатылған', 'product weighed wet — mass and yield too high'), whatif: L('Влажные кристаллы содержат до трети массы воды: выход получится завышенным (может превысить 100 %).', 'Ылғал кристалдарда массаның үштен біріне дейін су болады: шығым жоғары болады (100 %-дан асуы мүмкін).', 'Wet crystals hold up to a third of their mass in water: the yield comes out too high (it may even exceed 100 %).'), effect(S) { S.water = 0.3; }, log: L('Кристаллы взвешены сразу после фильтрования', 'Кристалдар сүзгеннен кейін бірден өлшенді', 'Crystals weighed straight after filtration') },
  ],
};

/* ---------------------------------------------------------------- 11. взвешивание */
const s11 = {
  type: 'weigh', id: 'wprod',
  title: L('Взвешивание продукта', 'Өнімді өлшеу', 'Weighing the product'),
  instr: L('<p>Взвесьте продукт на часовом стекле: стекло → тарирование → продукт → закрыть дверцы → записать.</p>', '<p>Өнімді сағат шынысында өлшеңіз: шыны → тарировкалау → өнім → есікшелерді жабу → жазу.</p>', '<p>Weigh the product on a watch glass: glass → tare → product → close the doors → record.</p>'),
  need: L('Запишите массу продукта', 'Өнім массасын жазыңыз', 'Record the mass of the product'),
  reagent: L('продукт', 'өнім', 'product'), mode: 'transfer', container: 'watch', saveAs: 'mProd',
  mass: (S) => S.P.m * (1 + S.water),
  onRecord(S, m, ctx) { ctx.log(L(`Белые кристаллы фумаровой кислоты, масса <b>${g(m)} г</b>`, `Фумар қышқылының ақ кристалдары, массасы <b>${g(m)} г</b>`, `White crystals of fumaric acid, mass <b>${g(m)} g</b>`), 'obs'); },
};

/* ---------------------------------------------------------------- 12. расчёт */
const s12 = {
  type: 'calc', id: 'yield',
  title: L('Расчёт выхода', 'Шығымды есептеу', 'Calculating the yield'),
  instr: L('<p>Рассчитайте теоретический выход фумаровой кислоты и выход в процентах по своим данным.</p><p class="note">C₄H₄O₄: M(малеиновой) = M(фумаровой) = 116,07 г/моль, 1 : 1. Допустимая погрешность — 1 %, три попытки.</p>',
    '<p>Өз деректеріңіз бойынша фумар қышқылының теориялық шығымын және пайыздық шығымын есептеңіз.</p><p class="note">C₄H₄O₄: M(малеин) = M(фумар) = 116,07 г/моль, 1 : 1. Рұқсат етілген қателік — 1 %, үш әрекет.</p>',
    '<p>Using your own data, calculate the theoretical yield of fumaric acid and the percent yield.</p><p class="note">C₄H₄O₄: M(maleic) = M(fumaric) = 116.07 g/mol, 1 : 1. Allowed error 1 %, three attempts.</p>'),
  need: L('Рассчитайте выход', 'Шығымды есептеңіз', 'Calculate the yield'),
  fields: [
    { id: 'th', label: L('Теоретический выход', 'Теориялық шығым', 'Theoretical yield'), unit: L('г', 'г', 'g'), decimals: 3, answer: (S) => theoretical(S.mMal), formula: (S) => L(`m(теор.) = ${g(S.mMal)} × 116.07 / 116.07`, `m(теор.) = ${g(S.mMal)} × 116.07 / 116.07`, `m(theor.) = ${g(S.mMal)} × 116.07 / 116.07`) },
    { id: 'eta', label: L('Выход', 'Шығым', 'Yield'), unit: '%', decimals: 1, answer: (S) => percentYield(S.mProd, S.mMal), formula: (S) => L(`η = ${g(S.mProd)} / ${n(theoretical(S.mMal), 3)} × 100 %`, `η = ${g(S.mProd)} / ${n(theoretical(S.mMal), 3)} × 100 %`, `η = ${g(S.mProd)} / ${n(theoretical(S.mMal), 3)} × 100 %`) },
  ],
  saveAs: 'calc3',
};

/* ---------------------------------------------------------------- 13. идентификация: растворимость */
const s13 = {
  type: 'test', id: 'ident-sol',
  title: L('Идентификация: растворимость', 'Сәйкестендіру: ерігіштік', 'Identification: solubility'),
  instr: L('<ol><li>Поместите немного продукта в пробирку 1 и столько же малеиновой кислоты — в пробирку 2.</li><li>Прилейте по 1 мл холодной воды, встряхните и сравните (как в опыте 2).</li></ol>',
    '<ol><li>Аздаған өнімді 1-пробиркаға, сонша малеин қышқылын 2-пробиркаға салыңыз.</li><li>Әрқайсысына 1 мл суық су құйып, шайқап, салыстырыңыз (2-тәжірибедегідей).</li></ol>',
    '<ol><li>Put a little of the product into tube 1 and the same amount of maleic acid into tube 2.</li><li>Add 1 mL of cold water to each, shake and compare (as in experiment 2).</li></ol>'),
  need: L('Сравните растворимость продукта и малеиновой кислоты', 'Өнім мен малеин қышқылының ерігіштігін салыстырыңыз', 'Compare the solubility of the product and maleic acid'),
  tubes: [{ id: 'p', label: L('1 · продукт', '1 · өнім', '1 · product') }, { id: 'm', label: L('2 · малеин.', '2 · малеин', '2 · maleic') }],
  capacity: 4,
  reagents: [
    { id: 'solid', target: 'all', label: L('Внести по ~0,1 г веществ', 'Заттардан ~0,1 г-нан салу', 'Put ~0.1 g of each in'), advance: 30, disabled: (t) => t.in, apply(t) { t.in = true; t.solid = 0.55; } },
    { id: 'water', target: 'all', label: L('Прилить по 1 мл холодной воды и встряхнуть', 'Әрқайсысына 1 мл суық су құйып, шайқау', 'Add 1 mL of cold water to each and shake'), advance: 90, disabled: (t) => !t.in || t.v > 0,
      apply(t, S, ctx, id) {
        t.v = 1;
        if (id === 'm') { t.solid = 0; return; }
        const P = S.P, imp = P.mMalImp / P.m;
        const f = Math.min(1, (solFum(18) * 1 + imp * 0.1) / 0.1);
        t.solid = 0.55 * (1 - f); t.dis = f;
        ctx.log(L('В обе пробирки прилито по 1 мл холодной воды, пробирки встряхнуты', 'Екі пробиркаға да 1 мл суық су құйылып, шайқалды', '1 mL of cold water added to both tubes and shaken'));
      } },
  ],
  done: (tubes) => tubes.p.v > 0 && tubes.m.v > 0,
  observe: {
    question: L('Что вы наблюдаете?', 'Не байқайсыз?', 'What do you observe?'),
    options: [
      { id: 'ok', label: L('Продукт почти не растворился, малеиновая кислота растворилась полностью', 'Өнім ерімеді дерлік, малеин қышқылы толық еріді', 'The product hardly dissolved; maleic acid dissolved completely'), log: L('Продукт в холодной воде практически нерастворим (как фумаровая кислота в опыте 2), малеиновая кислота растворилась полностью', 'Өнім суық суда іс жүзінде ерімейді (2-тәжірибедегі фумар қышқылы сияқты), малеин қышқылы толық еріді', 'The product is practically insoluble in cold water (like fumaric acid in experiment 2); maleic acid dissolved completely') },
      { id: 'both', label: L('Оба вещества растворились полностью', 'Екі зат та толық еріді', 'Both dissolved completely') },
      { id: 'rev', label: L('Продукт растворился, малеиновая — нет', 'Өнім еріді, малеин — жоқ', 'The product dissolved, maleic did not') },
    ],
    correct: () => 'ok',
    why: () => L('Растворимость продукта совпадает с фумаровой кислотой (≈ 0,6 г/100 мл), а не с малеиновой (≈ 78 г/100 мл).', 'Өнімнің ерігіштігі малеин қышқылымен (≈ 78 г/100 мл) емес, фумар қышқылымен (≈ 0,6 г/100 мл) сәйкес келеді.', 'The solubility of the product matches fumaric acid (≈ 0.6 g/100 mL), not maleic acid (≈ 78 g/100 mL).'),
  },
};

/* ---------------------------------------------------------------- 14. идентификация: нагревание */
const s14 = {
  type: 'process', id: 'ident-heat',
  title: L('Идентификация: не плавится ниже 200 °C', 'Сәйкестендіру: 200 °C-тан төмен балқымайды', 'Identification: no melting below 200 °C'),
  instr: L('<ol><li>Набейте капилляр продуктом и поместите в прибор т. пл.</li><li>Нагрейте до <b>200 °C</b> и наблюдайте в лупу: чистая фумаровая кислота ниже 200 °C не плавится.</li></ol><p class="note">Если в продукте осталась малеиновая кислота, проба спекается и частично плавится около 120–130 °C.</p>',
    '<ol><li>Капиллярды өніммен толтырып, балқу t құралына салыңыз.</li><li><b>200 °C</b>-қа дейін қыздырып, лупамен бақылаңыз: таза фумар қышқылы 200 °C-тан төмен балқымайды.</li></ol><p class="note">Өнімде малеин қышқылы қалса, сынама 120–130 °C шамасында жентектеліп, жартылай балқиды.</p>',
    '<ol><li>Pack a capillary with the product and put it into the m.p. apparatus.</li><li>Heat to <b>200 °C</b> and watch through the magnifier: pure fumaric acid does not melt below 200 °C.</li></ol><p class="note">If maleic acid is left in the product, the sample sinters and partly melts at about 120–130 °C.</p>'),
  need: L('Нагрейте пробу до 200 °C', 'Сынаманы 200 °C-қа дейін қыздырыңыз', 'Heat the sample to 200 °C'),
  speeds: [10, 30, 60],
  setup(S, lc) { lc.m = { Tb: 25, on: false, rate: 10, inside: false }; lc.melt = 0; lc.sinter = false; },
  controls: [
    { kind: 'action', id: 'load', label: L('Набить капилляр продуктом и поместить в прибор', 'Капиллярды өніммен толтырып, құралға салу', 'Pack a capillary with the product and put it in'), advance: 240, do(S, lc) { lc.m.inside = true; }, log: L('Капилляр с продуктом помещён в прибор т. пл.', 'Өнімі бар капилляр балқу t құралына салынды', 'Capillary with the product placed in the m.p. apparatus') },
    { kind: 'toggle', id: 'heat', label: L('Нагрев: включить', 'Қыздыру: қосу', 'Heating: on'), labelOn: L('Нагрев: выключить', 'Қыздыру: өшіру', 'Heating: off'), when: (S, lc) => lc.m.inside, whenText: L('Сначала поместите капилляр в прибор.', 'Алдымен капиллярды құралға салыңыз.', 'Put the capillary into the apparatus first.') },
    { kind: 'seg', id: 'rate', group: L('Скорость нагрева, °C/мин', 'Қыздыру жылдамдығы, °C/мин', 'Heating rate, °C/min'), options: [[10, '10'], [5, '5'], [2, '2']], default: 10 },
  ],
  tick(S, lc, dt, ctx) {
    const m = lc.m; m.on = !!lc.c.heat; m.rate = lc.c.rate || 10;
    if (m.on) m.Tb = Math.min(240, m.Tb + (m.rate / 60) * dt); else m.Tb += (25 - m.Tb) * Math.min(1, 0.0015 * dt);
    const H = productHeating(S.P, S.water);
    if (H.sinter && m.inside && m.Tb > H.sinter && !lc.sinter) { lc.sinter = true; lc.melt = H.partial; ctx.log(L(`При ${n(m.Tb, 0)} °C проба спеклась и частично оплавилась (примесь малеиновой кислоты); остаток не плавится`, `${n(m.Tb, 0)} °C-та сынама жентектеліп, жартылай балқыды (малеин қышқылының қоспасы); қалдығы балқымайды`, `At ${n(m.Tb, 0)} °C the sample sintered and partly melted (maleic acid impurity); the rest does not melt`), 'obs'); }
    if (H.wet && m.inside && m.Tb > 100 && !lc.wetLog) { lc.wetLog = true; ctx.log(L('Около 100 °C на стенках капилляра выше пробы осели капли воды — продукт влажный', '100 °C шамасында сынамадан жоғары капилляр қабырғаларына су тамшылары тұнды — өнім ылғал', 'Near 100 °C droplets of water condensed on the capillary walls above the sample — the product is wet'), 'obs'); }
  },
  readouts: (S, lc) => [
    { label: L('Блок', 'Блок', 'Block'), value: n(lc.m.Tb, 1) + ' °C', st: lc.m.Tb >= 200 ? 'ok' : '' },
    { label: L('Проба', 'Сынама', 'Sample'), value: !lc.m.inside ? '—' : lc.sinter ? L('спеклась, частично оплавилась', 'жентектелді, жартылай балқыды', 'sintered, partly melted') : L('белые кристаллы', 'ақ кристалдар', 'white crystals') },
  ],
  done(S, lc, ctx) {
    if (lc.m.Tb >= 200 && lc.m.inside) {
      if (!lc.sinter) ctx.log(L('Продукт при нагревании до 200 °C не плавится — белые кристаллы без изменений', 'Өнім 200 °C-қа дейін қыздырғанда балқымайды — ақ кристалдар өзгеріссіз', 'The product does not melt on heating to 200 °C — white crystals unchanged'), 'obs');
      S.ident = { sinter: lc.sinter };
      return { text: L('Достигнуто 200 °C. Выключите нагрев и сделайте вывод.', '200 °C-қа жетті. Қыздыруды өшіріп, қорытынды жасаңыз.', '200 °C reached. Switch off the heating and draw a conclusion.') };
    }
    return false;
  },
  stop: (S, lc) => lc.m.Tb >= 200 && !lc.c.heat,
  scene: (S, lc) => scene(capApparatus(lc.m || { Tb: 25 }, { layer: 2.5, melt: lc.melt || 0, sinter: lc.sinter, wet: S.water > 0.02 && (lc.m || {}).Tb > 100 })),
};

const s15 = {
  type: 'observe', id: 'ident-concl',
  title: L('Вывод: что получено?', 'Қорытынды: не алынды?', 'Conclusion: what was obtained?'),
  instr: L('<p>Сопоставьте растворимость и поведение продукта при нагревании со свойствами малеиновой и фумаровой кислот (опыт 2).</p>', '<p>Өнімнің ерігіштігі мен қыздырғандағы қасиетін малеин және фумар қышқылдарының қасиеттерімен салыстырыңыз (2-тәжірибе).</p>', '<p>Compare the solubility of the product and its behaviour on heating with the properties of maleic and fumaric acids (experiment 2).</p>'),
  need: L('Сделайте вывод', 'Қорытынды жасаңыз', 'Draw the conclusion'),
  question: L('Что показывает идентификация продукта?', 'Өнімді сәйкестендіру нені көрсетеді?', 'What does the identification of the product show?'),
  options: [
    { id: 'pure', label: L('Белые кристаллы, плохо растворимые в холодной воде, не плавятся ниже 200 °C — фумаровая кислота', 'Суық суда нашар еритін, 200 °C-тан төмен балқымайтын ақ кристалдар — фумар қышқылы', 'White crystals, poorly soluble in cold water, not melting below 200 °C — fumaric acid') },
    { id: 'mix', label: L('В основном фумаровая кислота, но с примесью малеиновой: проба частично оплавилась ниже 200 °C — нужна промывка или перекристаллизация', 'Негізінен фумар қышқылы, бірақ малеин қышқылының қоспасы бар: сынама 200 °C-тан төмен жартылай балқыды — жуу немесе қайта кристалдау қажет', 'Mainly fumaric acid but contaminated with maleic acid: the sample partly melted below 200 °C — wash or recrystallise it') },
    { id: 'mal', label: L('Получена исходная малеиновая кислота — изомеризация не прошла', 'Бастапқы малеин қышқылы алынды — изомерлеу жүрмеді', 'The starting maleic acid was recovered — no isomerisation') },
  ],
  correct: (S) => (S.ident && S.ident.sinter ? 'mix' : 'pure'),
  why: (S) => (S.ident && S.ident.sinter ? L('Частичное плавление около 120–130 °C — признак примеси малеиновой кислоты (короткое кипячение и/или плохая промывка).', '120–130 °C шамасында жартылай балқу — малеин қышқылы қоспасының белгісі (қысқа қайнату және/немесе нашар жуу).', 'Partial melting at about 120–130 °C points to maleic acid impurity (short reflux and/or poor washing).') : L('Свойства продукта совпадают со свойствами фумаровой кислоты.', 'Өнімнің қасиеттері фумар қышқылының қасиеттерімен сәйкес келеді.', 'The properties of the product match fumaric acid.')),
};

/* ---------------------------------------------------------------- 16. уборка */
const s16 = {
  type: 'cleanup', id: 'clean',
  title: L('Уборка рабочего места', 'Жұмыс орнын жинау', 'Cleaning up'),
  instr: L('<p>Утилизируйте отходы по контейнерам, выключите приборы, закройте склянки и вымойте руки (разделы 10 и 14.3 правил ТБ).</p><p class="note">Кислый фильтрат с HCl — в ёмкость для водных кислотно-щелочных отходов, не в раковину.</p>',
    '<p>Қалдықтарды ыдыстар бойынша кәдеге жаратыңыз, құралдарды өшіріңіз, склянкаларды жабыңыз және қолыңызды жуыңыз (ҚТ ережелерінің 10 және 14.3-бөлімдері).</p><p class="note">HCl бар қышқыл фильтрат — раковинаға емес, сулы қышқыл-сілтілі қалдықтар ыдысына.</p>',
    '<p>Dispose of the waste in the right containers, switch off the instruments, close the bottles and wash your hands (safety rules sections 10 and 14.3).</p><p class="note">The acidic filtrate containing HCl goes into the aqueous acid/alkali waste, not down the sink.</p>'),
  need: L('Уберите рабочее место', 'Жұмыс орнын жинаңыз', 'Clean up the bench'),
  bins: ['acid', 'organic', 'solid', 'glass', 'sink', 'trash'],
  items: [
    { id: 'filtrate', bin: 'acid', label: L('Кислый фильтрат с HCl и промывные воды', 'HCl бар қышқыл фильтрат және жуынды сулар', 'Acidic filtrate with HCl and the washings'),
      wrong: { sink: { severity: 'safety', text: L('кислый фильтрат с HCl вылит в раковину (п. 10.2 правил ТБ)', 'HCl бар қышқыл фильтрат раковинаға төгілді (ҚТ ережелерінің 10.2-тармағы)', 'acidic HCl filtrate poured down the sink (safety rule 10.2)'), whatif: L('Концентрированные кислоты в раковину не выливают: они разрушают канализацию. Кислые водные отходы собирают отдельно и нейтрализуют (п. 10.3).', 'Концентрлі қышқылдарды раковинаға төкпейді: олар кәрізді бұзады. Қышқыл сулы қалдықтарды бөлек жинап, бейтараптайды (10.3-тармақ).', 'Concentrated acids are never poured down the sink: they damage the drains. Acidic aqueous waste is collected separately and neutralised (rule 10.3).') } } },
    { id: 'tubes', bin: 'acid', label: L('Содержимое пробирок (растворы кислот)', 'Пробиркалардағы заттар (қышқыл ерітінділері)', 'Contents of the test tubes (acid solutions)') },
    { id: 'paper', bin: 'solid', label: L('Использованный фильтр и индикаторная бумага', 'Пайдаланылған сүзгі мен индикатор қағазы', 'Used filter paper and indicator paper') },
    { id: 'chips', bin: 'solid', label: L('Использованные кипелки', 'Пайдаланылған қайнату тастары', 'Used boiling chips') },
    { id: 'caps', bin: 'glass', label: L('Использованные капилляры', 'Пайдаланылған капиллярлар', 'Used capillaries') },
  ],
  switches: [
    { id: 'heat', label: L('Выключить баню и прибор т. пл.', 'Монша мен балқу t құралын өшіру', 'Switch off the bath and the m.p. apparatus') },
    { id: 'water', label: L('Закрыть воду холодильника и насоса', 'Мұздатқыш пен сорғының суын жабу', 'Turn off the condenser and aspirator water') },
    { id: 'bottles', label: L('Закрыть склянки, вернуть на место', 'Склянкаларды жауып, орнына қою', 'Close the bottles and put them back') },
    { id: 'hands', label: L('Вымыть руки', 'Қолды жуу', 'Wash your hands'), log: L('Руки вымыты с мылом', 'Қол сабынмен жуылды', 'Hands washed with soap') },
  ],
};

export default {
  id: '3',
  title: L('Изомеризация малеиновой кислоты в фумаровую', 'Малеин қышқылын фумар қышқылына изомерлеу', 'Isomerisation of maleic acid into fumaric acid'),
  principle: L('В присутствии концентрированной HCl при нагревании цис-изомер превращается в термодинамически более устойчивый транс-изомер: протонирование временно превращает двойную связь в одинарную, становится возможным свободное вращение. Малорастворимая фумаровая кислота кристаллизуется из горячего раствора.',
    'Концентрлі HCl қатысында қыздырғанда цис-изомер термодинамикалық тұрақтырақ транс-изомерге айналады: протондау қос байланысты уақытша бір реттік байланысқа айналдырады, еркін айналу мүмкін болады. Нашар еритін фумар қышқылы ыстық ерітіндіден кристалданады.',
    'In the presence of concentrated HCl and on heating, the cis isomer is converted into the thermodynamically more stable trans isomer: protonation temporarily turns the double bond into a single bond and free rotation becomes possible. The poorly soluble fumaric acid crystallises from the hot solution.'),
  equation: [L('HOOC–CH=CH–COOH (малеиновая, Z) → HOOC–CH=CH–COOH (фумаровая, E) (HCl, t)', 'HOOC–CH=CH–COOH (малеин, Z) → HOOC–CH=CH–COOH (фумар, E) (HCl, t)', 'HOOC–CH=CH–COOH (maleic, Z) → HOOC–CH=CH–COOH (fumaric, E) (HCl, t)')],
  initialState: () => ({
    mMal: 0, vW: 0, vHCl: 0, c: 0, c0: 0, Tb: 104, T: 22, dissolved: false,
    asm: null, tBoil: 0, X: 0, cryst: 0, fumes: 0, hclLoss: false, bumpLoss: 0,
    cool: null, Tfilt: 4, wash: null, P: null, water: 0, mProd: 0, ident: null,
  }),
  checkpoints: [0, 2, 6],
  steps: [s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16],
  results(S) {
    const P = S.P;
    return {
      mMal: S.mMal, vW: S.vW, vHCl: S.vHCl, tBoil: S.tBoil / 60, X: S.X, mProd: S.mProd, th: theoretical(S.mMal), yield: percentYield(S.mProd, S.mMal),
      water: S.water, washes: S.wash ? S.wash.cold : 0, sinter: !!(S.ident && S.ident.sinter), purity: P ? P.purity : 0, hclLoss: S.hclLoss,
      heater: S.asm ? S.asm.heat : '', losses: P ? lossBreakdown(S, P) : [],
    };
  },
  summary: (r) => [
    { label: L('Навеска', 'Өлшенді', 'Sample'), value: { ru: n(r.mMal, 4) + ' г', kk: n(r.mMal, 4) + ' г', en: n(r.mMal, 4) + ' g' } },
    { label: L('Кипячение', 'Қайнату', 'Reflux'), value: { ru: n(r.tBoil, 1) + ' мин', kk: n(r.tBoil, 1) + ' мин', en: n(r.tBoil, 1) + ' min' }, st: r.tBoil >= 15 && r.tBoil <= 30 ? 'ok' : 'warn' },
    { label: L('Продукт', 'Өнім', 'Product'), value: { ru: n(r.mProd, 4) + ' г', kk: n(r.mProd, 4) + ' г', en: n(r.mProd, 4) + ' g' } },
    { label: L('Выход', 'Шығым', 'Yield'), value: n(r.yield, 1) + ' %', st: r.yield >= 50 && r.yield <= 100 ? 'ok' : 'warn' },
  ],
};
