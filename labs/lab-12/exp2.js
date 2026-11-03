/** Опыт 2. Расщепление рацемического 1-фенилэтиламина через диастереомерные соли. Методичка, раздел 6, опыт 2. */
import { L, n } from '../../app/i18n.js';
import { relax } from '../../app/instruments/thermal.js';
import { pHcolor, pHread } from '../../app/instruments/indicator.js';
import { M, D_AMINE, MAX_ONE, WASH, crystallise, saltMass, liberation, resolveAmine } from './model.js';
import { hoodScene, flaskBath, alkaliScene, evapScene, flaskBalance } from './scene.js';

const g4 = (x) => n(x, 4);
const BP_MEOH = 64.7;

/* ---------------- 0. рабочее место ---------------- */
const s0 = {
  type: 'checklist', id: 'ppe',
  title: L('Вытяжной шкаф и средства защиты', 'Тартпа шкаф және қорғаныс құралдары', 'Fume hood and protective equipment'),
  instr: L('<p>1-Фенилэтиламин едкий и вредный, метанол токсичен и горюч, диэтиловый эфир чрезвычайно легко воспламеняется (раздел 7 методички). Подготовьте рабочее место: нажмите на каждый нужный пункт, лишнее не нажимайте.</p>',
    '<p>1-Фенилэтиламин күйдіргіш және зиянды, метанол улы әрі жанғыш, диэтил эфирі өте оңай тұтанады (әдістеменің 7-бөлімі). Жұмыс орнын дайындаңыз: әр қажетті тармақты басыңыз, артығын баспаңыз.</p>',
    '<p>1-Phenylethylamine is corrosive and harmful, methanol is toxic and flammable, and diethyl ether is extremely flammable (manual, section 7). Prepare your workplace: tap every item you need and nothing that is wrong.</p>'),
  need: L('Выполните все нужные пункты', 'Барлық қажетті тармақтарды орындаңыз', 'Complete every required item'),
  scene: hoodScene,
  items: [
    { id: 'coat', label: L('Халат застёгнут', 'Халат түймеленген', 'Lab coat buttoned'), log: L('Надет и застёгнут хлопковый халат', 'Мақта мата халат киіліп, түймеленді', 'Cotton lab coat on and buttoned') },
    { id: 'gog', label: L('Защитные очки', 'Қорғаныс көзілдірігі', 'Safety goggles'), log: L('Надеты защитные очки', 'Қорғаныс көзілдірігі киілді', 'Safety goggles on') },
    { id: 'glv', label: L('Нитриловые перчатки (амин, NaOH)', 'Нитрил қолғаптар (амин, NaOH)', 'Nitrile gloves (amine, NaOH)'), log: L('Надеты нитриловые перчатки', 'Нитрил қолғаптар киілді', 'Nitrile gloves on') },
    { id: 'hood', label: L('Включить тягу, опустить экран', 'Тартымды қосып, экранды түсіру', 'Switch on the hood, lower the sash'), log: L('Включена тяга вытяжного шкафа, экран опущен до рабочего уровня', 'Тартпа шкафтың тартымы қосылды, экран жұмыс деңгейіне дейін түсірілді', 'Fume hood on, sash lowered to working height') },
    { id: 'fire', label: L('Убрать из шкафа горелки и плитки — рядом будет эфир', 'Шкафтан жанарғылар мен плиталарды алып тастау — жанында эфир болады', 'Remove burners and hot plates from the hood — ether will be used'), log: L('Источники огня и открытые нагревательные элементы убраны: в работе эфир и метанол', 'От көздері мен ашық қыздыру элементтері алынды: жұмыста эфир мен метанол бар', 'Ignition sources and open heating elements removed: ether and methanol are in use') },
    { id: 'ext', label: L('Найти огнетушитель и противопожарное одеяло', 'Өрт сөндіргіш пен өртке қарсы жамылғыны табу', 'Locate the extinguisher and fire blanket'), log: L('Найдены огнетушитель и противопожарное одеяло', 'Өрт сөндіргіш пен өртке қарсы жамылғы табылды', 'Extinguisher and fire blanket located') },
    { id: 'eye', label: L('Найти фонтанчик для глаз и душ', 'Көз жуатын фонтан мен душты табу', 'Locate the eyewash and shower'), log: L('Найдены фонтанчик для промывания глаз и аварийный душ', 'Көз жуатын фонтан мен апаттық душ табылды', 'Eyewash station and safety shower located') },
    { id: 'burner', label: L('Зажечь спиртовку, чтобы быстрее нагреть метанол', 'Метанолды тезірек қыздыру үшін спиртшамды жағу', 'Light a spirit burner to heat the methanol faster'),
      wrong: { severity: 'safety', text: L('открытое пламя рядом с метанолом и эфиром (пп. 5.1, 5.2, 7.5 правил ТБ)', 'метанол мен эфирдің жанында ашық от (ҚТ ережелерінің 5.1, 5.2, 7.5-тармақтары)', 'open flame near methanol and ether (safety rules 5.1, 5.2, 7.5)'),
        whatif: L('Пары метанола и особенно эфира тяжелее воздуха, стекают по столу и вспыхивают от пламени на расстоянии. Легковоспламеняющиеся растворители греют только на водяной бане.', 'Метанол мен әсіресе эфир булары ауадан ауыр, үстел бойымен ағып, алыстағы оттан тұтанады. Оңай тұтанатын еріткіштерді тек су моншасында қыздырады.', 'Methanol and especially ether vapours are heavier than air, flow along the bench and ignite from a flame some distance away. Flammable solvents are heated only on a water bath.') } },
    { id: 'sniff', label: L('Понюхать амин из склянки, чтобы узнать запах', 'Иісін білу үшін аминді склянкадан иіскеу', 'Sniff the amine straight from the bottle to learn its smell'),
      wrong: { severity: 'safety', text: L('попытка нюхать едкий амин из склянки (пп. 4.4, 4.6 правил ТБ)', 'күйдіргіш аминді склянкадан иіскеу әрекеті (ҚТ ережелерінің 4.4, 4.6-тармақтары)', 'tried to sniff the corrosive amine from the bottle (safety rules 4.4, 4.6)'),
        whatif: L('Пары 1-фенилэтиламина раздражают и обжигают слизистые. Запах, если нужно, оценивают, направляя пары к себе движением руки, — и только под тягой.', '1-Фенилэтиламин булары шырышты қабықты тітіркендіріп, күйдіреді. Иісті қажет болса, буды қол қимылымен өзіне бағыттап, тек тартым астында бағалайды.', '1-Phenylethylamine vapour irritates and burns the mucous membranes. If a smell must be noted, waft the vapour towards you with your hand — and only in the hood.') } },
  ],
};

/* ---------------- 1. посуда ---------------- */
const s1 = {
  type: 'pick', id: 'kit',
  title: L('Посуда и приборы для расщепления', 'Ажыратуға арналған ыдыстар мен құралдар', 'Glassware and instruments for the resolution'),
  instr: L('<p>Возьмите всё, что понадобится по ходу опыта 2 (пп. 1–7), и ничего лишнего.</p>', '<p>2-тәжірибе барысында (1–7-тармақтар) қажет болатынның бәрін алыңыз, артығын алмаңыз.</p>', '<p>Take everything you will need for experiment 2 (steps 1–7), and nothing extra.</p>'),
  need: L('Соберите нужный набор', 'Қажетті жиынтықты жинаңыз', 'Collect the right set'),
  shelf: ['conical-125', 'water-bath', 'balance', 'weighing-boat', 'spatula', { id: 'cyl100', label: L('Мерный цилиндр 100 мл', 'Өлшегіш цилиндр 100 мл', '100 mL measuring cylinder') }, 'graduated-pipette', 'buchner', 'filter-flask', 'water-pump', 'sep-funnel', 'beaker-100', 'rbf-25', 'thermometer-100',
    'hot-plate', 'reflux-condenser', 'mp-apparatus', 'ice-salt-bath', 'liebig-condenser'],
  take: ['conical-125', 'water-bath', 'balance', 'weighing-boat', 'spatula', 'cyl100', 'graduated-pipette', 'buchner', 'filter-flask', 'water-pump', 'sep-funnel', 'beaker-100', 'rbf-25', 'thermometer-100'],
  hint1: L('Нагрев — только водяная баня (метанол, эфир). Нужны: колба 125 мл, весы с лодочкой и шпателем, цилиндр на 55 мл метанола, пипетка с грушей для амина, Бюхнер + Бунзен + насос, делительная воронка, стакан, взвешенная колбочка для упаривания, термометр.', 'Қыздыру — тек су моншасы (метанол, эфир). Қажет: 125 мл колба, қайықша мен шпателі бар таразы, 55 мл метанолға цилиндр, аминге алмұрты бар пипетка, Бюхнер + Бунзен + сорғы, бөлгіш шұңғыма, стақан, буландыруға өлшенген колба, термометр.', 'Heating is on a water bath only (methanol, ether). You need: a 125 mL flask, a balance with boat and spatula, a cylinder for 55 mL of methanol, a pipette with a bulb for the amine, Büchner + filter flask + pump, a separating funnel, a beaker, a pre-weighed small flask for evaporation and a thermometer.'),
};

/* ---------------- 2. навеска винной кислоты ---------------- */
const s2 = {
  type: 'weigh', id: 'wta',
  title: L('Навеска L-(+)-винной кислоты', 'L-(+)-шарап қышқылының өлшендісі', 'Weighing the L-(+)-tartaric acid'),
  instr: L('<ol><li>Возьмите на аналитических весах <b>3,9 г (26 ммоль)</b> L-(+)-винной кислоты.</li><li>Лодочка → тарирование → вещество шпателем → закрыть дверцы → записать массу.</li></ol><p class="note">Допустимо 3,85–3,95 г. Кислота энантиомерно чистая — это (2R,3R)-винная кислота.</p>',
    '<ol><li>Аналитикалық таразыда L-(+)-шарап қышқылының <b>3,9 г (26 ммоль)</b> мөлшерін алыңыз.</li><li>Қайықша → тарировкалау → шпательмен зат → есікшелерді жабу → массаны жазу.</li></ol><p class="note">3,85–3,95 г рұқсат етіледі. Қышқыл энантиомерлік таза — бұл (2R,3R)-шарап қышқылы.</p>',
    '<ol><li>Weigh out <b>3.9 g (26 mmol)</b> of L-(+)-tartaric acid on the analytical balance.</li><li>Boat → tare → solid with the spatula → close the doors → record the mass.</li></ol><p class="note">3.85–3.95 g is acceptable. The acid is enantiomerically pure — (2R,3R)-tartaric acid.</p>'),
  need: L('Запишите массу навески', 'Өлшендінің массасын жазыңыз', 'Record the mass of the sample'),
  reagent: L('C₄H₆O₆', 'C₄H₆O₆', 'C₄H₆O₆'), mode: 'spatula', container: 'boat', target: 3.9, lo: 3.85, hi: 3.95, saveAs: 'mTA',
  onRecord(S, m, ctx) {
    ctx.log(L(`Навеска L-(+)-винной кислоты: <b>${g4(m)} г</b> (${n((m / M.ta) * 1000, 1)} ммоль); перенесена в коническую колбу на 125 мл`, `L-(+)-шарап қышқылының өлшендісі: <b>${g4(m)} г</b> (${n((m / M.ta) * 1000, 1)} ммоль); 125 мл конустық колбаға ауыстырылды`, `L-(+)-tartaric acid: <b>${g4(m)} g</b> (${n((m / M.ta) * 1000, 1)} mmol); transferred to a 125 mL conical flask`), 'calc');
  },
};

/* ---------------- 3. метанол ---------------- */
const s3 = {
  type: 'measure', id: 'meoh', measure: 'cylinder-100',
  title: L('Метанол для кристаллизации', 'Кристалдауға арналған метанол', 'Methanol for the crystallisation'),
  instr: L('<p>Отмерьте цилиндром <b>55 мл</b> метанола и прилейте его к винной кислоте в колбе.</p><p class="note">Объём растворителя определяет, какая из солей выпадет: при избытке метанола соль (S)-амина частично остаётся в растворе, при недостатке — вместе с ней выпадает соль (R)-амина.</p>',
    '<p>Цилиндрмен <b>55 мл</b> метанол өлшеп, оны колбадағы шарап қышқылына құйыңыз.</p><p class="note">Еріткіштің көлемі қай тұздың түзілетінін анықтайды: метанол артық болса, (S)-амин тұзы ішінара ерітіндіде қалады, жетіспесе — онымен бірге (R)-амин тұзы да тұнбаға түседі.</p>',
    '<p>Measure <b>55 mL</b> of methanol with the cylinder and add it to the tartaric acid in the flask.</p><p class="note">The solvent volume decides which salt crystallises: with too much methanol some of the (S)-amine salt stays in solution, with too little the (R)-amine salt comes down with it.</p>'),
  need: L('Прилейте 55 мл метанола', '55 мл метанол құйыңыз', 'Add 55 mL of methanol'),
  reagent: L('метанол', 'метанол', 'methanol'), bottleSub: 'CH₃OH', target: 55, tol: 1, onDeviation: 'consequence', deviationSeverity: 'minor', saveAs: 'vMeOH',
  into: L('коническая колба 125 мл', '125 мл конустық колба', 'the 125 mL conical flask'),
};

/* ---------------- 4. растворение при нагревании ---------------- */
const CLOSED = L('Колбу нагревали плотно закрытой пробкой. Пары метанола создали давление, пробку выбило, горячий раствор выплеснулся на руки и стол; пары метанола могут вспыхнуть. В реальной лаборатории закрытую систему никогда не нагревают (п. 7.4 правил ТБ): поражённую кожу промывают водой не менее 15 минут, о происшествии сообщают преподавателю, опыт начинают заново.',
  'Колба тығынмен тығыз жабылған күйде қыздырылды. Метанол булары қысым тудырып, тығынды атып шығарды, ыстық ерітінді қол мен үстелге шашырады; метанол булары тұтануы мүмкін. Нақты зертханада жабық жүйені ешқашан қыздырмайды (ҚТ ережелерінің 7.4-тармағы): зақымданған теріні кемінде 15 минут сумен жуады, оқиға туралы оқытушыға хабарлайды, тәжірибені қайта бастайды.',
  'The flask was heated tightly stoppered. Methanol vapour built up pressure, the stopper blew out and hot solution splashed onto the hands and bench; methanol vapour may ignite. In a real lab a closed system is never heated (safety rule 7.4): affected skin is rinsed with water for at least 15 minutes, the instructor is told, and the experiment is restarted.');

const s4 = {
  type: 'process', id: 'dissolve',
  title: L('Растворение винной кислоты в горячем метаноле', 'Шарап қышқылын ыстық метанолда еріту', 'Dissolving the tartaric acid in hot methanol'),
  instr: L('<ol><li>Поставьте колбу на <b>водяную баню</b> и нагрейте раствор <b>почти до кипения</b> (т. кип. метанола 64,7 °C), покачивая колбу, пока вся винная кислота не растворится.</li><li>Бурного кипения не допускайте: метанол выкипает.</li></ol>',
    '<ol><li>Колбаны <b>су моншасына</b> қойып, ерітіндіні колбаны шайқай отырып, бүкіл шарап қышқылы ерігенше <b>қайнауға жақын</b> температураға дейін қыздырыңыз (метанолдың қайнау t 64,7 °C).</li><li>Қатты қайнатуға жол бермеңіз: метанол буланып кетеді.</li></ol>',
    '<ol><li>Put the flask on the <b>water bath</b> and heat the solution <b>almost to boiling</b> (methanol b.p. 64.7 °C), swirling, until all the tartaric acid has dissolved.</li><li>Avoid vigorous boiling: the methanol boils away.</li></ol>'),
  need: L('Растворите кислоту в почти кипящем метаноле', 'Қышқылды қайнауға жақын метанолда ерітіңіз', 'Dissolve the acid in almost boiling methanol'),
  speeds: [10, 30],
  setup(S) { S.T = 22; S.Tb = 22; S.und = 1; },
  controls: [
    { kind: 'seg', id: 'bath', group: L('Водяная баня', 'Су моншасы', 'Water bath'), label: L('Температура бани', 'Монша температурасы', 'Bath temperature'), options: [[0, L('выкл.', 'өшір.', 'off')], [60, '60 °C'], [70, '70 °C'], [90, '90 °C']], default: 0 },
    { kind: 'toggle', id: 'swirl', group: L('Колба', 'Колба', 'Flask'), label: L('Покачивать колбу', 'Колбаны шайқау', 'Swirl the flask'), labelOn: L('Покачивание: вкл.', 'Шайқау: қосулы', 'Swirling: on') },
  ],
  tick(S, lc, dt, ctx) {
    const set = lc.c.bath || 0;
    S.Tb = relax(S.Tb, set || 22, 0.02, dt);
    S.T = Math.min(BP_MEOH + 0.3, relax(S.T, S.Tb, lc.c.swirl ? 0.012 : 0.006, dt));
    const rate = Math.max(0, (S.T - 25) / 40) * (lc.c.swirl ? 1 : 0.35) * 0.006;
    S.und = Math.max(0, S.und - rate * dt);
    if (S.T >= BP_MEOH) {
      const boil = Math.max(0, S.Tb - BP_MEOH);
      S.lostMeOH = (S.lostMeOH || 0) + boil * 0.0012 * dt;   // мл, выкипает при бурном кипении
      lc.boilT = (lc.boilT || 0) + (S.Tb > 75 ? dt : 0);
      if ((S.lostMeOH || 0) > 3) ctx.remark({ key: 'boiloff', severity: 'minor', text: L(`бурное кипение — выкипело ≈ ${n(S.lostMeOH, 0)} мл метанола`, `қатты қайнау — ≈ ${n(S.lostMeOH, 0)} мл метанол буланып кетті`, `vigorous boiling — ≈ ${n(S.lostMeOH, 0)} mL of methanol boiled away`) });
    }
  },
  readouts: (S) => [
    { label: L('Раствор', 'Ерітінді', 'Solution'), value: n(S.T, 1) + ' °C', st: S.T >= 55 && S.T < BP_MEOH ? 'ok' : S.T >= BP_MEOH ? 'warn' : '' },
    { label: L('Баня', 'Монша', 'Bath'), value: n(S.Tb, 0) + ' °C' },
    { label: L('Не растворилось', 'Ерімеді', 'Undissolved'), value: S.und < 0.01 ? L('нет', 'жоқ', 'none') : S.und < 0.4 ? L('немного', 'аздап', 'a little') : L('много', 'көп', 'a lot'), st: S.und < 0.01 ? 'ok' : '' },
  ],
  alerts(S) {
    if (S.T >= BP_MEOH && S.Tb > 75) return { text: L('Метанол бурно кипит и выкипает. Уменьшите температуру бани.', 'Метанол қатты қайнап, буланып кетуде. Монша температурасын азайтыңыз.', 'The methanol is boiling vigorously and boiling away. Lower the bath temperature.'), kind: 'warn' };
    if (S.und < 0.01 && S.T >= 55) return { text: L('Кислота растворилась, раствор горячий и прозрачный.', 'Қышқыл еріді, ерітінді ыстық әрі мөлдір.', 'The acid has dissolved; the solution is hot and clear.'), kind: 'good' };
    return null;
  },
  events: [{
    id: 'boil', when: (S, lc) => (lc.boilT || 0) > 45,
    title: L('Метанол бурно кипит', 'Метанол қатты қайнап жатыр', 'The methanol is boiling vigorously'),
    text: L('Раствор бурно кипит, над колбой поднимаются пары метанола, уровень жидкости заметно понижается. Что вы сделаете?', 'Ерітінді қатты қайнап, колба үстінде метанол булары көтерілуде, сұйықтық деңгейі айтарлықтай төмендеуде. Не істейсіз?', 'The solution is boiling vigorously, methanol vapour is rising from the flask and the liquid level is visibly falling. What do you do?'),
    options: [
      { ok: true, label: L('Снизить температуру бани до 60–70 °C, нагревать до слабого кипения', 'Монша температурасын 60–70 °C-қа дейін төмендетіп, әлсіз қайнағанша қыздыру', 'Lower the bath to 60–70 °C and keep only a gentle boil'), effect(S, lc) { lc.c.bath = 70; lc.boilT = -1e9; } },
      { ok: false, severity: 'minor', label: L('Ничего не менять — так быстрее растворится', 'Ештеңе өзгертпеу — осылай тезірек ериді', 'Change nothing — it will dissolve faster'), remark: L('продолжено бурное кипение метанола — растворитель теряется', 'метанолдың қатты қайнауы жалғастырылды — еріткіш жоғалуда', 'vigorous boiling continued — solvent is being lost'), effect(S, lc) { S.lostMeOH = (S.lostMeOH || 0) + 4; lc.boilT = -1e9; } },
      { ok: false, label: L('Плотно закрыть колбу пробкой, чтобы метанол не испарялся', 'Метанол буланбауы үшін колбаны тығынмен тығыз жабу', 'Stopper the flask tightly so the methanol cannot evaporate'), remark: L('нагревание плотно закрытой колбы — пробку выбило давлением паров', 'тығыз жабылған колбаны қыздыру — бу қысымы тығынды атып шығарды', 'heating a tightly stoppered flask — vapour pressure blew out the stopper'), critical: { text: CLOSED } },
    ],
  }],
  done(S, lc, ctx) {
    if (S.und < 0.01 && S.T >= 55) {
      ctx.log(L(`Винная кислота полностью растворилась в горячем метаноле (${n(S.T, 0)} °C); раствор прозрачный, бесцветный`, `Шарап қышқылы ыстық метанолда (${n(S.T, 0)} °C) толық еріді; ерітінді мөлдір, түссіз`, `The tartaric acid has dissolved completely in hot methanol (${n(S.T, 0)} °C); clear colourless solution`), 'obs');
      return { text: L('Раствор готов. Не давайте ему остыть — сразу прибавляйте амин.', 'Ерітінді дайын. Суытпаңыз — бірден амин қосыңыз.', 'The solution is ready. Do not let it cool — add the amine straight away.') };
    }
    return false;
  },
  scene: (S, lc) => flaskBath({ T: S.T, Tb: S.Tb, vol: 55 - (S.lostMeOH || 0), solid: S.und * 0.8, boil: S.T >= BP_MEOH && S.Tb > 68 }),
};

/* ---------------- 5. амин пипеткой ---------------- */
const s5 = {
  type: 'measure', id: 'amine', measure: 'pipette-5',
  title: L('Рацемический 1-фенилэтиламин', 'Рацемиялық 1-фенилэтиламин', 'Racemic 1-phenylethylamine'),
  instr: L('<p>В вытяжном шкафу наберите градуированной пипеткой <b>с грушей</b> <b>3,3 мл (3,1 г, 26 ммоль)</b> рацемического 1-фенилэтиламина (d 0,95 г/мл) и перенесите в сухую пробирку — из неё амин будут прибавлять порциями.</p><p class="note">Набирать пипеткой ртом запрещено (п. 2.5 правил ТБ). Излишек — в отходы, не в склянку.</p>',
    '<p>Тартпа шкафта бөлікті пипеткамен <b>алмұрт арқылы</b> рацемиялық 1-фенилэтиламиннің (d 0,95 г/мл) <b>3,3 мл (3,1 г, 26 ммоль)</b> мөлшерін алып, құрғақ пробиркаға ауыстырыңыз — аминді одан порциялап қосады.</p><p class="note">Пипеткаға ауызбен тартуға тыйым салынған (ҚТ ережелерінің 2.5-тармағы). Артығы — қалдыққа, склянкаға емес.</p>',
    '<p>In the fume hood, draw up <b>3.3 mL (3.1 g, 26 mmol)</b> of racemic 1-phenylethylamine (d 0.95 g/mL) with a graduated pipette <b>and a bulb</b> and transfer it to a dry test tube — the amine will be added from it in portions.</p><p class="note">Pipetting by mouth is forbidden (safety rule 2.5). Excess goes to waste, not back into the bottle.</p>'),
  need: L('Отмерьте 3,3 мл амина', '3,3 мл амин өлшеңіз', 'Measure 3.3 mL of the amine'),
  reagent: L('(±)-1-фенилэтиламин', '(±)-1-фенилэтиламин', '(±)-1-phenylethylamine'), bottleSub: 'C₆H₅CH(CH₃)NH₂', target: 3.3, tol: 0.1, onDeviation: 'consequence', deviationSeverity: 'minor', saveAs: 'vAmine',
  into: L('сухая пробирка', 'құрғақ пробирка', 'a dry test tube'),
  onTransfer(S, v, ctx) { ctx.log(L(`Отмерено ${n(v, 1)} мл амина (${n(v * D_AMINE, 2)} г, ${n((v * D_AMINE / M.amine) * 1000, 1)} ммоль): бесцветная жидкость с аммиачным запахом`, `${n(v, 1)} мл амин өлшенді (${n(v * D_AMINE, 2)} г, ${n((v * D_AMINE / M.amine) * 1000, 1)} ммоль): аммиак иісті түссіз сұйықтық`, `${n(v, 1)} mL of amine measured (${n(v * D_AMINE, 2)} g, ${n((v * D_AMINE / M.amine) * 1000, 1)} mmol): colourless liquid with an ammonia-like odour`), 'calc'); },
};

/* ---------------- 6. прибавление амина порциями ---------------- */
const BOILOVER = L('Амин прилит слишком быстро: теплота нейтрализации мгновенно довела метанол до бурного кипения, горячая смесь метанола и едкого амина вспенилась и выплеснулась из колбы. В реальной лаборатории это химический и термический ожог рук и лица и пожароопасные пары метанола. Пострадавший участок промывают водой не менее 15 минут, о происшествии сообщают преподавателю; опыт начинают заново с новой навески.',
  'Амин тым жылдам құйылды: бейтараптану жылуы метанолды лезде қатты қайнатты, ыстық метанол мен күйдіргіш амин қоспасы көбіктеніп, колбадан шашырады. Нақты зертханада бұл қол мен беттің химиялық және термиялық күйігі, әрі метанолдың өртке қауіпті булары. Зақымданған жерді кемінде 15 минут сумен жуады, оқиға туралы оқытушыға хабарлайды; тәжірибені жаңа өлшендіден қайта бастайды.',
  'The amine was added too fast: the heat of neutralisation brought the methanol to a violent boil at once, and the hot mixture of methanol and corrosive amine foamed and splashed out of the flask. In a real lab this means chemical and thermal burns to the hands and face and flammable methanol vapour. Affected skin is rinsed with water for at least 15 minutes, the instructor is told, and the experiment is restarted from a new sample.');
const PORTIONS = 11;
const s6 = {
  type: 'add', id: 'addAmine',
  title: L('Прибавление амина к горячему раствору', 'Аминді ыстық ерітіндіге қосу', 'Adding the amine to the hot solution'),
  instr: L('<ol><li>В вытяжном шкафу <b>медленно и осторожно, небольшими порциями</b> прибавляйте амин к горячему раствору винной кислоты, покачивая колбу.</li><li>Реакция экзотермична: после каждой порции дождитесь, пока кипение утихнет. Раствор не должен остыть ниже ~50 °C — иначе соль выпадет раньше времени мелким порошком.</li></ol><p class="note">≈ 0,3 мл на порцию, всего 11 порций. При необходимости подогрейте колбу на бане.</p>',
    '<ol><li>Тартпа шкафта аминді шарап қышқылының ыстық ерітіндісіне колбаны шайқай отырып <b>баяу, абайлап, аз порциялармен</b> қосыңыз.</li><li>Реакция экзотермиялық: әр порциядан кейін қайнау басылғанын күтіңіз. Ерітінді ~50 °C-тан төмен суымауы керек — әйтпесе тұз мерзімінен бұрын ұсақ ұнтақ болып түседі.</li></ol><p class="note">Бір порцияға ≈ 0,3 мл, барлығы 11 порция. Қажет болса, колбаны моншада жылытыңыз.</p>',
    '<ol><li>In the fume hood, add the amine to the hot tartaric acid solution <b>slowly and carefully, in small portions</b>, swirling the flask.</li><li>The reaction is exothermic: after each portion wait for the boiling to subside. Do not let the solution cool below ~50 °C, or the salt will come down too early as a fine powder.</li></ol><p class="note">≈ 0.3 mL per portion, 11 portions in all. Warm the flask on the bath if needed.</p>'),
  need: L('Прибавьте весь амин порциями', 'Бүкіл аминді порциялап қосыңыз', 'Add all of the amine in portions'),
  speeds: [5, 10, 20],
  setup(S, lc) { S.T = Math.max(50, Math.min(S.T ?? 60, 64)); S.Tb = S.Tb ?? 60; lc.pend = 0; lc.c.warm = false; },
  add: {
    label: L('Порция амина ≈ 0,3 мл', 'Амин порциясы ≈ 0,3 мл', 'Portion of amine ≈ 0.3 mL'), total: PORTIONS, big: true,
    group: L('Пипетка · интервал между порциями', 'Пипетка · порциялар арасындағы аралық', 'Pipette · interval between portions'),
    rhythms: [[0, L('вручную', 'қолмен', 'by hand')], [40, L('40 с', '40 с', '40 s')], [20, L('20 с', '20 с', '20 s')], [5, L('5 с', '5 с', '5 s')]],
    onAdd(S, lc, ctx) {
      lc.pend += 1.05 * (S.vAmine || 3.3) / 3.3; lc.dropKey = (lc.dropKey || 0) + 1;
      if (lc.added === 1) ctx.log(L('Начато прибавление амина порциями; раствор разогревается, слегка закипает', 'Аминді порциялап қосу басталды; ерітінді қызып, сәл қайнайды', 'Portionwise addition of the amine started; the solution warms up and boils slightly'));
      if (lc.added >= PORTIONS) {
        ctx.log(L(`Прибавлен весь амин (${n(S.vAmine || 3.3, 1)} мл); раствор прозрачный, ${S.early ? 'на стенках появился белый порошок соли' : 'горячий'}`, `Бүкіл амин қосылды (${n(S.vAmine || 3.3, 1)} мл); ерітінді мөлдір, ${S.early ? 'қабырғаларда тұздың ақ ұнтағы пайда болды' : 'ыстық'}`, `All of the amine added (${n(S.vAmine || 3.3, 1)} mL); the solution is clear and ${S.early ? 'a white powder of salt has appeared on the walls' : 'hot'}`), 'obs');
      }
    },
  },
  controls: [
    { kind: 'toggle', id: 'warm', group: L('Колба', 'Колба', 'Flask'), label: L('Подогревать на бане (60 °C)', 'Моншада жылыту (60 °C)', 'Keep warm on the bath (60 °C)'), labelOn: L('На бане 60 °C: вкл.', '60 °C моншада: қосулы', 'On the 60 °C bath: on') },
    { kind: 'action', id: 'all', cls: 'danger', group: L('Колба', 'Колба', 'Flask'), label: L('Влить весь амин сразу', 'Бүкіл аминді бірден құю', 'Pour in all the amine at once'),
      disabled: (S, lc) => lc.added >= PORTIONS,
      do(S, lc, ctx) {
        lc.pend += 1.05 * (PORTIONS - lc.added); lc.added = PORTIONS; lc.blown = true;
        ctx.log(L('Весь амин влит в горячий раствор одной порцией', 'Бүкіл амин ыстық ерітіндіге бір порциямен құйылды', 'All the amine poured into the hot solution at once'));
        ctx.remark({ key: 'boilover', severity: 'critical', text: L('весь амин влит сразу — горячая смесь вскипела и выплеснулась из колбы', 'бүкіл амин бірден құйылды — ыстық қоспа қайнап, колбадан шашырады', 'all the amine poured in at once — the hot mixture boiled up and splashed out of the flask'), critical: { text: BOILOVER } });
      } },
  ],
  tick(S, lc, dt, ctx) {
    const rel = Math.min(lc.pend, lc.pend * 0.25 * dt);
    lc.pend -= rel;
    const env = lc.c.warm ? 60 : 22;
    S.T = relax(S.T, env, lc.c.warm ? 0.004 : 0.0016, dt) + rel;
    if (S.T > BP_MEOH) {
      const over = S.T - BP_MEOH;
      S.T = BP_MEOH;
      lc.surge = (lc.surge || 0) * Math.exp(-0.05 * dt) + over;
      S.hot = S.hot || over > 0.6;
      if (lc.surge > 5 && !lc.blown) { lc.blown = true; ctx.remark({ key: 'boilover', severity: 'critical', text: L('амин прибавлен слишком быстро — горячая смесь вскипела и выплеснулась из колбы', 'амин тым жылдам қосылды — ыстық қоспа қайнап, колбадан шашырады', 'amine added too fast — the hot mixture boiled up and splashed out of the flask'), critical: { text: BOILOVER } }); }
    } else lc.surge = (lc.surge || 0) * Math.exp(-0.05 * dt);
    if (S.T < 48 && lc.added > 0 && lc.added < PORTIONS && !S.early) {
      S.early = true;
      ctx.remark({ key: 'early', severity: 'minor', text: L('раствор остыл ниже 50 °C до конца прибавления — соль начала выпадать мелким порошком', 'қосу аяқталмай ерітінді 50 °C-тан төмен суыды — тұз ұсақ ұнтақ болып түсе бастады', 'the solution cooled below 50 °C before the addition was complete — the salt started to come down as a fine powder') });
    }
  },
  readouts: (S, lc) => [
    { label: L('Раствор', 'Ерітінді', 'Solution'), value: n(S.T, 1) + ' °C', st: S.T >= BP_MEOH - 0.05 ? 'warn' : S.T < 50 ? 'warn' : 'ok' },
    { label: L('Порций', 'Порция', 'Portions'), value: `${lc.added} / ${PORTIONS}` },
    { label: L('Кипение', 'Қайнау', 'Boiling'), value: (lc.surge || 0) > 2.5 ? L('бурное!', 'қатты!', 'violent!') : S.T >= BP_MEOH - 0.05 ? L('слабое', 'әлсіз', 'gentle') : L('нет', 'жоқ', 'none'), st: (lc.surge || 0) > 2.5 ? 'bad' : '' },
  ],
  alerts(S, lc) {
    if ((lc.surge || 0) > 2.5) return { text: L('Смесь бурно вскипает и пенится! Прекратите прибавление и подождите.', 'Қоспа қатты қайнап, көбіктенуде! Қосуды тоқтатып, күтіңіз.', 'The mixture is boiling up and foaming! Stop adding and wait.'), kind: 'bad' };
    if (S.T < 52 && lc.added < PORTIONS) return { text: L('Раствор остывает — подогрейте колбу на бане.', 'Ерітінді суып барады — колбаны моншада жылытыңыз.', 'The solution is cooling — warm the flask on the bath.'), kind: 'warn' };
    return null;
  },
  events: [{
    id: 'foam', when: (S, lc) => (lc.surge || 0) > 2.6 && !lc.blown,
    title: L('Смесь вскипает и пенится', 'Қоспа қайнап, көбіктенуде', 'The mixture boils up and foams'),
    text: L('После очередной порции метанол бурно вскипел, пена поднимается к горлу колбы. Что вы сделаете?', 'Кезекті порциядан кейін метанол қатты қайнап, көбік колба мойнына көтерілуде. Не істейсіз?', 'After the last portion the methanol boiled up violently and foam is rising to the neck of the flask. What do you do?'),
    options: [
      { ok: true, label: L('Прекратить прибавление, снять колбу с бани и подождать, пока кипение утихнет', 'Қосуды тоқтатып, колбаны моншадан алып, қайнау басылғанша күту', 'Stop adding, take the flask off the bath and wait for the boiling to subside'), effect(S, lc) { lc.rh = 0; lc.c.warm = false; lc.pend *= 0.3; lc.surge = 1; } },
      { ok: false, severity: 'major', label: L('Добавить ещё порцию — быстрее закончим', 'Тағы бір порция қосу — тезірек бітіреміз', 'Add another portion — it will be over sooner'), remark: L('амин прибавлен при бурном кипении смеси', 'амин қоспа қатты қайнап тұрғанда қосылды', 'amine added while the mixture was boiling violently'), effect(S, lc) { lc.pend += 2.5; S.hot = true; } },
      { ok: false, severity: 'safety', label: L('Наклониться и посмотреть в горло колбы', 'Еңкейіп, колба мойнына қарау', 'Lean over and look into the neck of the flask'), remark: L('заглядывание в горло колбы с кипящей едкой смесью (п. 3.2 правил ТБ)', 'қайнап тұрған күйдіргіш қоспасы бар колба мойнына үңілу (ҚТ ережелерінің 3.2-тармағы)', 'looked into the neck of a flask of boiling corrosive mixture (safety rule 3.2)'), effect(S, lc) { lc.rh = 0; lc.pend *= 0.5; } },
    ],
  }],
  done: (S, lc) => lc.added >= PORTIONS && (lc.surge || 0) < 1.5 && S.T < BP_MEOH && { text: L('Весь амин прибавлен.', 'Бүкіл амин қосылды.', 'All of the amine has been added.') },
  scene: (S, lc) => flaskBath({ T: S.T, Tb: lc.c && lc.c.warm ? 60 : 22, bath: !!(lc.c && lc.c.warm), vol: 55 - (S.lostMeOH || 0) + (lc.added || 0) * 0.3, boil: S.T >= BP_MEOH - 0.05, drip: true, dripKey: lc.dropKey, solid: S.early ? 0.15 : 0 }),
};

/* ---------------- 7. кристаллизация ---------------- */
const s7 = {
  type: 'process', id: 'cryst',
  title: L('Кристаллизация диастереомерной соли', 'Диастереомерлі тұзды кристалдау', 'Crystallisation of the diastereomeric salt'),
  instr: L('<ol><li>Закройте колбу пробкой и оставьте кристаллизоваться <b>не трогая, при комнатной температуре</b>, до следующего занятия (<b>не менее 24 ч</b>).</li><li>Соль (S)-амина кристаллизуется <b>призмами</b>. Если вместо них появляются <b>иглы</b>, их растворяют нагреванием и дают раствору остыть медленно.</li></ol>',
    '<ol><li>Колбаны тығынмен жауып, келесі сабаққа дейін (<b>кемінде 24 сағ</b>) <b>қозғамай, бөлме температурасында</b> кристалдануға қалдырыңыз.</li><li>(S)-Амин тұзы <b>призмалар</b> түрінде кристалданады. Олардың орнына <b>инелер</b> пайда болса, оларды қыздыру арқылы ерітіп, ерітіндіні баяу суытады.</li></ol>',
    '<ol><li>Stopper the flask and leave it to crystallise <b>undisturbed at room temperature</b> until the next session (<b>at least 24 h</b>).</li><li>The (S)-amine salt crystallises as <b>prisms</b>. If <b>needles</b> form instead, redissolve them by heating and let the solution cool slowly.</li></ol>'),
  need: L('Получите призматические кристаллы', 'Призма тәрізді кристалдар алыңыз', 'Obtain prismatic crystals'),
  speeds: [120, 600],
  setup(S, lc, ctx) { lc.h = 0; lc.mode = null; S.cryst = 'slow'; S.needleRisk = ctx.rng.next() < 0.4; },
  controls: [
    { kind: 'action', id: 'stop', group: L('Колба', 'Колба', 'Flask'), label: L('Закрыть колбу пробкой', 'Колбаны тығынмен жабу', 'Stopper the flask'), advance: 10, log: L('Колба закрыта пробкой (раствор уже не нагревают)', 'Колба тығынмен жабылды (ерітінді енді қыздырылмайды)', 'Flask stoppered (the solution is no longer being heated)') },
    { kind: 'action', id: 'slow', group: L('Как кристаллизовать', 'Қалай кристалдау керек', 'How to crystallise'), label: L('Оставить в шкафу при комнатной температуре, не трогая', 'Шкафта бөлме температурасында қозғамай қалдыру', 'Leave in the cupboard at room temperature, undisturbed'),
      disabled: (S, lc) => !!lc.mode, do(S, lc) { lc.mode = 'slow'; }, log: L('Колба оставлена кристаллизоваться при комнатной температуре без встряхивания', 'Колба бөлме температурасында шайқалмай кристалдануға қалдырылды', 'Flask left to crystallise at room temperature without shaking') },
    { kind: 'action', id: 'ice', group: L('Как кристаллизовать', 'Қалай кристалдау керек', 'How to crystallise'), label: L('Поставить в ледяную баню — быстрее', 'Мұз моншасына қою — тезірек', 'Put it in an ice bath — faster'),
      disabled: (S, lc) => !!lc.mode, do(S, lc, ctx) { lc.mode = 'ice'; S.cryst = 'ice'; ctx.remark({ key: 'ice', severity: 'minor', text: L('горячий раствор соли охлаждён во льду вместо медленной кристаллизации', 'тұздың ыстық ерітіндісі баяу кристалдаудың орнына мұзда салқындатылды', 'hot salt solution chilled in ice instead of slow crystallisation') }); }, log: L('Колба поставлена в ледяную баню', 'Колба мұз моншасына қойылды', 'Flask put into an ice bath') },
    { kind: 'action', id: 'shake', group: L('Как кристаллизовать', 'Қалай кристалдау керек', 'How to crystallise'), label: L('Время от времени встряхивать, чтобы кристаллы росли быстрее', 'Кристалдар тезірек өсуі үшін анда-санда шайқау', 'Shake now and then to make the crystals grow faster'),
      disabled: (S, lc) => !!lc.mode, do(S, lc, ctx) { lc.mode = 'shake'; S.cryst = 'disturbed'; ctx.remark({ key: 'shake', severity: 'major', text: L('кристаллизующийся раствор встряхивали — выпадает мелкая смесь кристаллов обеих солей', 'кристалданып жатқан ерітінді шайқалды — екі тұздың да ұсақ кристалдар қоспасы түседі', 'the crystallising solution was shaken — a fine mixture of both salts comes down'),
        whatif: L('Встряхивание вызывает массовое зарождение мелких кристаллов: соль (R)-амина захватывается вместе с солью (S)-амина, и разделение диастереомеров ухудшается — оптическая чистота амина будет ниже.', 'Шайқау ұсақ кристалдардың жаппай түзілуін тудырады: (R)-амин тұзы (S)-амин тұзымен бірге ілесіп түседі, диастереомерлердің бөлінуі нашарлайды — аминнің оптикалық тазалығы төмен болады.', 'Shaking causes mass nucleation of small crystals: the (R)-amine salt is trapped together with the (S)-amine salt and the separation of the diastereomers worsens — the optical purity of the amine will be lower.') }); }, log: L('Колбу периодически встряхивают', 'Колба мезгіл-мезгіл шайқалады', 'The flask is shaken from time to time') },
    { kind: 'action', id: 'wait', cls: 'pri', group: L('Время', 'Уақыт', 'Time'), label: L('Оставить до следующего занятия (≥ 24 ч)', 'Келесі сабаққа дейін қалдыру (≥ 24 сағ)', 'Leave until the next session (≥ 24 h)'), requires: ['stop'],
      when: (S, lc) => !!lc.mode && lc.h >= 1, whenText: L('Сначала выберите, как кристаллизовать, и понаблюдайте за колбой хотя бы час.', 'Алдымен қалай кристалдау керегін таңдап, колбаны кем дегенде бір сағат бақылаңыз.', 'First choose how to crystallise and watch the flask for at least an hour.'),
      do(S, lc, ctx) { ctx.nextDay(); S.hours = 24; lc.h = 24; lc.fin = true; ctx.log(L(`Следующее занятие. На дне колбы — ${S.cryst === 'slow' && !S.needlesKept ? 'бесцветные призматические кристаллы' : 'масса мелких игольчатых кристаллов'}`, `Келесі сабақ. Колба түбінде — ${S.cryst === 'slow' && !S.needlesKept ? 'түссіз призма тәрізді кристалдар' : 'ұсақ ине тәрізді кристалдар массасы'}`, `Next session. At the bottom of the flask: ${S.cryst === 'slow' && !S.needlesKept ? 'colourless prismatic crystals' : 'a mass of small needle-like crystals'}`), 'obs'); } },
    { kind: 'action', id: 'early', cls: 'danger', group: L('Время', 'Уақыт', 'Time'), label: L('Отфильтровать уже сегодня', 'Бүгін-ақ сүзу', 'Filter it today'), requires: ['stop'],
      when: (S, lc) => !!lc.mode, whenText: L('Сначала выберите, как кристаллизовать.', 'Алдымен қалай кристалдау керегін таңдаңыз.', 'First choose how to crystallise.'),
      do(S, lc, ctx) { S.hours = Math.max(0.5, lc.h); lc.fin = true; ctx.remark({ key: 'short', severity: 'major', text: L(`кристаллизация прервана через ${n(lc.h, 1)} ч вместо 24 ч — соль выпала не полностью`, `кристалдау 24 сағ орнына ${n(lc.h, 1)} сағ кейін үзілді — тұз толық түспеді`, `crystallisation stopped after ${n(lc.h, 1)} h instead of 24 h — the salt has not crystallised fully`) }); } },
  ],
  tick(S, lc, dt) {
    if (lc.fin || !lc.mode) return;
    lc.h += dt / 3600;
    if (lc.h > 0.6 && (lc.mode === 'ice' || lc.mode === 'shake' || S.needleRisk)) lc.needles = true;
  },
  stop: (S, lc) => !!lc.fin,
  readouts: (S, lc) => [
    { label: L('Прошло', 'Өтті', 'Elapsed'), value: { ru: n(lc.h, 1) + ' ч', kk: n(lc.h, 1) + ' сағ', en: n(lc.h, 1) + ' h' } },
    { label: L('Кристаллы', 'Кристалдар', 'Crystals'), value: lc.h < 0.3 ? L('нет', 'жоқ', 'none') : (lc.needles ? L('иглы', 'инелер', 'needles') : L('призмы', 'призмалар', 'prisms')), st: lc.h >= 0.3 ? (lc.needles ? 'warn' : 'ok') : '' },
  ],
  events: [{
    id: 'needles', when: (S, lc) => !!lc.mode && lc.h > 0.6 && (lc.mode === 'ice' || (lc.mode === 'slow' && S.needleRisk) || lc.mode === 'shake'),
    title: L('В колбе растут иглы', 'Колбада инелер өсуде', 'Needles are growing in the flask'),
    text: L('Вместо призм на дне и стенках колбы растут тонкие иглы. Что вы сделаете?', 'Призмалардың орнына колба түбі мен қабырғаларында жіңішке инелер өсуде. Не істейсіз?', 'Instead of prisms, thin needles are growing on the bottom and walls of the flask. What do you do?'),
    options: [
      { ok: true, label: L('Растворить иглы нагреванием на водяной бане и дать раствору остыть медленно, не трогая', 'Инелерді су моншасында қыздырып ерітіп, ерітіндіні қозғамай баяу суыту', 'Redissolve the needles by warming on the water bath and let the solution cool slowly, undisturbed'),
        effect(S, lc, ctx) { lc.mode = 'slow'; S.cryst = 'slow'; S.needleRisk = false; lc.needles = false; lc.h = 0; ctx.advance(1800); }, log: L('Иглы растворены нагреванием на водяной бане; раствор оставлен медленно остывать', 'Инелер су моншасында қыздыру арқылы ерітілді; ерітінді баяу суытуға қалдырылды', 'Needles redissolved by warming on the water bath; the solution left to cool slowly') },
      { ok: false, severity: 'major', label: L('Ничего не делать — кристаллы есть кристаллы', 'Ештеңе істемеу — кристалдар бәрібір кристалдар', 'Do nothing — crystals are crystals'), remark: L('игольчатые кристаллы не перерастворили — они содержат соль (R)-амина', 'ине тәрізді кристалдар қайта ерітілмеді — оларда (R)-амин тұзы бар', 'needle crystals were not redissolved — they contain the (R)-amine salt'),
        whatif: L('Иглы — это быстро выросшие кристаллы, в которые попадает и менее растворимая, и более растворимая соль. Освобождённый из них амин будет иметь низкую оптическую чистоту.', 'Инелер — тез өскен кристалдар, оларға аз еритін тұз да, көбірек еритін тұз да түседі. Олардан бөлінген аминнің оптикалық тазалығы төмен болады.', 'Needles are fast-grown crystals that trap both the less soluble and the more soluble salt. The amine liberated from them will have low optical purity.'),
        effect(S) { S.needlesKept = true; } },
      { ok: false, severity: 'major', label: L('Отфильтровать иглы сразу', 'Инелерді бірден сүзу', 'Filter off the needles at once'), remark: L('отфильтрованы игольчатые кристаллы — смесь солей, кристаллизация не закончена', 'ине тәрізді кристалдар сүзілді — тұздар қоспасы, кристалдау аяқталмаған', 'needle crystals filtered off — a mixture of salts, crystallisation unfinished'),
        effect(S, lc) { S.needlesKept = true; S.hours = Math.max(0.5, lc.h); lc.fin = true; } },
    ],
  }],
  done: (S, lc) => !!lc.fin && { text: L('Кристаллизация закончена — можно фильтровать.', 'Кристалдау аяқталды — сүзуге болады.', 'Crystallisation complete — ready to filter.') },
  scene: (S, lc) => flaskBath({ bath: false, th: false, stopper: !!(lc.done && lc.done.stop), vol: 58, crystals: { n: Math.min(1, lc.h / 6), needles: !!lc.needles } }),
};

/* ---------------- 8. фильтрование соли ---------------- */
const s8 = {
  type: 'separate', id: 'filt', mode: 'filter', keep: 'cake',
  title: L('Фильтрование соли под вакуумом', 'Тұзды вакуумда сүзу', 'Vacuum filtration of the salt'),
  instr: L('<ol><li>Отфильтруйте кристаллы под вакуумом на воронке Бюхнера.</li><li>Промойте их на фильтре <b>небольшим количеством холодного метанола</b>.</li><li>Решите, что оставить: в маточном растворе — соль (R)-амина.</li></ol>',
    '<ol><li>Кристалдарды Бюхнер шұңғымасында вакуумда сүзіңіз.</li><li>Оларды сүзгіде <b>аз мөлшерде суық метанолмен</b> жуыңыз.</li><li>Нені қалдыру керектігін шешіңіз: аналық ерітіндіде — (R)-амин тұзы.</li></ol>',
    '<ol><li>Collect the crystals by vacuum filtration on a Büchner funnel.</li><li>Wash them on the filter with <b>a small amount of cold methanol</b>.</li><li>Decide what to keep: the mother liquor contains the (R)-amine salt.</li></ol>'),
  need: L('Отфильтруйте и промойте кристаллы', 'Кристалдарды сүзіп, жуыңыз', 'Filter and wash the crystals'),
  transferLabel: L('Перенести кристаллы с маточным раствором на фильтр', 'Кристалдарды аналық ерітіндімен сүзгіге ауыстыру', 'Pour the crystals and mother liquor onto the filter'),
  transferObs: L('Кристаллы отфильтрованы; маточный раствор (соль (R)-амина в метаноле) собран в колбе Бунзена', 'Кристалдар сүзілді; аналық ерітінді (метанолдағы (R)-амин тұзы) Бунзен колбасына жиналды', 'Crystals filtered off; the mother liquor ((R)-amine salt in methanol) collected in the filter flask'),
  keepCakeLabel: L('Оставить кристаллы на фильтре; маточный раствор — в органические отходы', 'Сүзгідегі кристалдарды қалдыру; аналық ерітінді — органикалық қалдыққа', 'Keep the crystals; mother liquor to organic waste'),
  keepFiltrateLabel: L('Оставить маточный раствор; кристаллы выбросить', 'Аналық ерітіндіні қалдыру; кристалдарды тастау', 'Keep the mother liquor; throw away the crystals'),
  liquids: [
    { id: 'cold', ok: true, label: L('Холодный метанол, 2–3 мл', 'Суық метанол, 2–3 мл', 'Cold methanol, 2–3 mL') },
    { id: 'much', ok: false, severity: 'minor', label: L('Холодный метанол, 20 мл', 'Суық метанол, 20 мл', 'Cold methanol, 20 mL'), remark: L('слишком много метанола для промывания — часть соли растворилась', 'жууға метанол тым көп — тұздың бір бөлігі еріді', 'far too much methanol for washing — some salt dissolved'), whatif: L('Соль немного растворима даже в холодном метаноле: большой объём уносит заметную часть кристаллов.', 'Тұз суық метанолда да аздап ериді: үлкен көлем кристалдардың едәуір бөлігін алып кетеді.', 'The salt is slightly soluble even in cold methanol: a large volume carries away a noticeable part of the crystals.'), effect(S, F) { F.wl = (F.wl || 0) + WASH.coldMuch; } },
    { id: 'warm', ok: false, severity: 'major', label: L('Тёплый метанол, 3 мл', 'Жылы метанол, 3 мл', 'Warm methanol, 3 mL'), remark: L('кристаллы промыты тёплым метанолом — часть соли растворилась', 'кристалдар жылы метанолмен жуылды — тұздың бір бөлігі еріді', 'crystals washed with warm methanol — part of the salt dissolved'), whatif: L('Растворимость соли быстро растёт с температурой: тёплый метанол растворяет кристаллы прямо на фильтре.', 'Тұздың ерігіштігі температурамен тез өседі: жылы метанол кристалдарды сүзгінің өзінде ерітеді.', 'The solubility of the salt rises quickly with temperature: warm methanol dissolves the crystals right on the filter.'), effect(S, F) { F.wl = (F.wl || 0) + WASH.warm; } },
    { id: 'water', ok: false, severity: 'major', label: L('Дистиллированная вода, 5 мл', 'Дистилденген су, 5 мл', 'Distilled water, 5 mL'), remark: L('соль промыта водой — гидротартрат амина хорошо растворим в воде', 'тұз сумен жуылды — амин гидротартраты суда жақсы ериді', 'salt washed with water — the amine hydrogen tartrate is very soluble in water'), whatif: L('Соли аминов с винной кислотой хорошо растворимы в воде: значительная часть продукта уходит в фильтрат.', 'Аминдердің шарап қышқылымен түзген тұздары суда жақсы ериді: өнімнің едәуір бөлігі фильтратқа кетеді.', 'Amine tartrate salts are very soluble in water: a large part of the product goes into the filtrate.'), effect(S, F) { F.wl = (F.wl || 0) + WASH.water; } },
  ],
  onWash(S, F, liq) { if (liq.id === 'cold') F.wl = (F.wl || 0) + WASH.cold; },
  onFinish(S, F) {
    S.washLoss = Math.min(0.8, (F.wl || 0) + (F.loss || 0));
    S.noWash = !F.washes;
  },
  cakeColor: () => null,
};

/* ---------------- 9. сушка соли ---------------- */
const s9 = {
  type: 'decide', id: 'drySalt',
  title: L('Сушка соли', 'Тұзды кептіру', 'Drying the salt'),
  instr: L('<p>Кристаллы нужно высушить на воздухе, прежде чем взвешивать.</p>', '<p>Кристалдарды өлшемес бұрын ауада кептіру керек.</p>', '<p>The crystals must be dried in air before weighing.</p>'),
  need: L('Выберите способ сушки', 'Кептіру тәсілін таңдаңыз', 'Choose how to dry'),
  question: L('Как подготовить соль к взвешиванию?', 'Тұзды өлшеуге қалай дайындайды?', 'How do you prepare the salt for weighing?'),
  options: [
    { id: 'air', ok: true, label: L('Разложить на фильтровальной бумаге и высушить на воздухе (30–40 мин)', 'Сүзгі қағазға жайып, ауада кептіру (30–40 мин)', 'Spread on filter paper and dry in air (30–40 min)'), advance: 2100, effect(S) { S.wetSalt = 0; },
      log: L('Соль высушена на воздухе', 'Тұз ауада кептірілді', 'Salt dried in air'), why: L('метанол летуч и быстро испаряется с кристаллов', 'метанол ұшқыш, кристалдардан тез буланады', 'methanol is volatile and evaporates quickly from the crystals') },
    { id: 'wet', ok: false, severity: 'major', label: L('Взвесить сразу, влажную', 'Бірден, ылғал күйінде өлшеу', 'Weigh it straight away, still wet'), remark: L('соль взвешена влажной от метанола — масса завышена', 'тұз метанолдан ылғал күйде өлшенді — масса жоғарылатылған', 'salt weighed wet with methanol — the mass is too high'), effect(S) { S.wetSalt = 0.14; } },
    { id: 'oven', ok: false, severity: 'minor', label: L('Подсушить на фильтре, просасывая воздух 5 мин', 'Сүзгіде 5 мин ауа сорып кептіру', 'Dry on the filter by drawing air through for 5 min'), remark: L('соль недосушена — масса немного завышена', 'тұз толық кептірілмеген — масса сәл жоғары', 'salt not fully dried — the mass is slightly high'), advance: 300, effect(S) { S.wetSalt = 0.04; } },
  ],
};

const s10 = {
  type: 'weigh', id: 'wSalt', mode: 'transfer', container: 'watch',
  title: L('Взвешивание соли', 'Тұзды өлшеу', 'Weighing the salt'),
  instr: L('<p>Взвесьте кристаллы на часовом стекле: стекло → тарирование → кристаллы → закрыть дверцы → записать.</p>', '<p>Кристалдарды сағат шынысында өлшеңіз: шыны → тарировкалау → кристалдар → есікшелерді жабу → жазу.</p>', '<p>Weigh the crystals on a watch glass: glass → tare → crystals → close the doors → record.</p>'),
  need: L('Запишите массу соли', 'Тұз массасын жазыңыз', 'Record the mass of the salt'),
  reagent: L('соль', 'тұз', 'salt'), saveAs: 'mSalt',
  mass: (S) => { const r = resolveAmine(S); return r.salt * (1 + (S.wetSalt || 0)); },
  onRecord(S, m, ctx) {
    const cr = crystallise(S);
    const good = cr.de > 0.6 && !S.needlesKept && S.cryst === 'slow';
    ctx.log(good ? L(`Бесцветные призматические кристаллы (S)-амин·(R,R)-гидротартрата, масса <b>${g4(m)} г</b>`, `(S)-амин·(R,R)-гидротартраттың түссіз призма тәрізді кристалдары, массасы <b>${g4(m)} г</b>`, `Colourless prismatic crystals of (S)-amine·(R,R)-hydrogen tartrate, mass <b>${g4(m)} g</b>`)
      : L(`Белые мелкие игольчатые кристаллы соли, масса <b>${g4(m)} г</b>`, `Тұздың ақ ұсақ ине тәрізді кристалдары, массасы <b>${g4(m)} г</b>`, `Small white needle-like crystals of the salt, mass <b>${g4(m)} g</b>`), 'obs');
  },
};

/* ---------------- 11. освобождение амина ---------------- */
const s11 = {
  type: 'process', id: 'lib',
  title: L('Освобождение амина щёлочью', 'Аминді сілтімен бөліп алу', 'Liberating the amine with alkali'),
  instr: L('<ol><li>Растворите соль в <b>≈ 15 мл воды</b> в стакане.</li><li>В вытяжном шкафу прибавьте <b>3 мл 50 % NaOH</b>: раствор должен стать <b>сильнощелочным</b> (проверьте индикаторной бумагой). Свободный амин отделяется маслянистым слоем.</li></ol><p class="note">50 % NaOH очень едкий — перчатки и очки.</p>',
    '<ol><li>Тұзды стақанда <b>≈ 15 мл суда</b> ерітіңіз.</li><li>Тартпа шкафта <b>3 мл 50 % NaOH</b> қосыңыз: ерітінді <b>күшті сілтілі</b> болуы тиіс (индикатор қағазымен тексеріңіз). Бос амин майлы қабат болып бөлінеді.</li></ol><p class="note">50 % NaOH өте күйдіргіш — қолғап пен көзілдірік.</p>',
    '<ol><li>Dissolve the salt in <b>≈ 15 mL of water</b> in a beaker.</li><li>In the fume hood add <b>3 mL of 50 % NaOH</b>: the solution must be <b>strongly alkaline</b> (check with indicator paper). The free amine separates as an oily layer.</li></ol><p class="note">50 % NaOH is highly caustic — gloves and goggles.</p>'),
  need: L('Сделайте раствор сильнощелочным и проверьте pH', 'Ерітіндіні күшті сілтілі етіп, pH-ты тексеріңіз', 'Make the solution strongly alkaline and check the pH'),
  speeds: null,
  setup(S, lc) { S.vNaOH = 0; S.vWater = 15; lc.water = false; lc.dissolved = false; lc.pH = null; lc.checkedAt = -1; S.lib = { free: 0 }; },
  controls: [
    { kind: 'action', id: 'water', group: L('Раствор соли', 'Тұз ерітіндісі', 'Salt solution'), label: L('Растворить соль в 15 мл воды', 'Тұзды 15 мл суда ерітү', 'Dissolve the salt in 15 mL of water'), advance: 120,
      do(S, lc) { lc.water = true; lc.dissolved = true; }, obs: L('Соль растворилась в воде — прозрачный бесцветный раствор', 'Тұз суда еріді — мөлдір түссіз ерітінді', 'The salt dissolved in water — a clear colourless solution') },
    ...[[1, '+1'], [0.5, '+0,5']].map(([v, lab]) => ({ kind: 'action', id: 'naoh' + v, once: false, group: L('Щёлочь (NaOH 50 %)', 'Сілті (NaOH 50 %)', 'Alkali (NaOH 50 %)'), label: L(`NaOH ${lab} мл`, `NaOH ${lab} мл`, `NaOH ${lab.replace(',', '.')} mL`), advance: 30,
      do(S, lc, ctx) {
        if (!lc.water) ctx.remark({ key: 'dry-naoh', severity: 'minor', text: L('концентрированная щёлочь прилита к сухой соли — сильный разогрев, разбрызгивание', 'концентрлі сілті құрғақ тұзға құйылды — қатты қызу, шашырау', 'concentrated alkali added to the dry salt — strong heating and spattering') });
        S.vNaOH = +(S.vNaOH + v).toFixed(1);
        const nSalt = (S.mSalt / (1 + (S.wetSalt || 0))) / 271.27 * 1000;
        S.lib = liberation(nSalt, S.vNaOH, 15);
        ctx.log(L(`Прибавлено ${n(v, 1)} мл 50 % NaOH (всего ${n(S.vNaOH, 1)} мл); раствор разогрелся${S.lib.free > 0.3 ? ', всплывает маслянистый слой амина' : ', слегка мутнеет'}`, `${n(v, 1)} мл 50 % NaOH қосылды (барлығы ${n(S.vNaOH, 1)} мл); ерітінді қызды${S.lib.free > 0.3 ? ', аминнің майлы қабаты қалқып шығады' : ', сәл лайланады'}`, `${n(v, 1)} mL of 50 % NaOH added (${n(S.vNaOH, 1)} mL in all); the solution warmed up${S.lib.free > 0.3 ? ' and an oily layer of amine floats up' : ' and turns slightly cloudy'}`));
        if (S.vNaOH > 6) ctx.remark({ key: 'naoh-much', severity: 'minor', text: L('большой избыток 50 % NaOH без необходимости', 'қажетсіз 50 % NaOH-тың үлкен артықшылығы', 'large unnecessary excess of 50 % NaOH') });
      } })),
    { kind: 'action', id: 'ph', once: false, group: L('Контроль', 'Бақылау', 'Check'), label: L('Проверить индикаторной бумагой', 'Индикатор қағазымен тексеру', 'Check with indicator paper'), advance: 20,
      do(S, lc, ctx) {
        if (!lc.water) { ctx.feedback(L('Сначала растворите соль в воде.', 'Алдымен тұзды суда ерітіңіз.', 'Dissolve the salt in water first.'), 'warn'); return; }
        const p = S.lib.pH ?? 3.2; lc.pH = p; lc.pHcol = pHcolor(p); lc.checkedAt = S.vNaOH;
        const r = pHread(p);
        ctx.log(L(`Индикаторная бумага: pH ≈ ${r}`, `Индикатор қағазы: pH ≈ ${r}`, `Indicator paper: pH ≈ ${r}`), 'obs');
        ctx.feedback(r >= 12 ? L(`pH ≈ ${r} — раствор сильнощелочной, амин освобождён.`, `pH ≈ ${r} — ерітінді күшті сілтілі, амин бөлінді.`, `pH ≈ ${r} — strongly alkaline; the amine has been liberated.`)
          : (S.lib.free || 0) <= 0.5 ? L(`pH ≈ ${r} — маслянистого слоя нет: амин всё ещё в виде соли. Прибавьте щёлочь.`, `pH ≈ ${r} — майлы қабат жоқ: амин әлі тұз түрінде. Сілті қосыңыз.`, `pH ≈ ${r} — no oily layer: the amine is still present as the salt. Add more alkali.`)
            : L(`pH ≈ ${r} — раствор недостаточно щелочной, часть амина ещё в виде соли.`, `pH ≈ ${r} — ерітінді жеткілікті сілтілі емес, аминнің бір бөлігі әлі тұз түрінде.`, `pH ≈ ${r} — not alkaline enough; part of the amine is still present as the salt.`), r >= 12 ? 'good' : 'warn');
      } },
  ],
  readouts: (S, lc) => [
    { label: L('Вода', 'Су', 'Water'), value: lc.water ? L('15 мл', '15 мл', '15 mL') : '—' },
    { label: 'NaOH 50 %', value: { ru: n(S.vNaOH, 1) + ' мл', kk: n(S.vNaOH, 1) + ' мл', en: n(S.vNaOH, 1) + ' mL' } },
    { label: 'pH', value: lc.pH == null ? '—' : '≈ ' + pHread(lc.pH), st: lc.pH == null ? '' : pHread(lc.pH) >= 12 ? 'ok' : 'warn' },
  ],
  done: (S, lc) => lc.water && S.vNaOH > 0 && lc.checkedAt === S.vNaOH && (S.lib.free || 0) > 0.5 && { text: L('Среда проверена. Переходите к экстракции.', 'Орта тексерілді. Экстракцияға өтіңіз.', 'The medium has been checked. Go on to the extraction.') },
  onLeave(S, ctx) {
    if (pHread(S.lib.pH) < 12) ctx.remark({ key: 'notAlk', severity: 'major', text: L('раствор не сделан сильнощелочным — часть амина осталась в водном слое в виде соли', 'ерітінді күшті сілтілі етілмеді — аминнің бір бөлігі сулы қабатта тұз күйінде қалды', 'the solution was not made strongly alkaline — part of the amine stayed in the aqueous layer as the salt'),
      whatif: L('Ион аммония R–NH₃⁺ эфиром не извлекается. Пока pH ниже ~12, заметная часть амина остаётся протонированной в воде — масса выделенного амина будет меньше.', 'R–NH₃⁺ аммоний ионы эфирмен бөлінбейді. pH ~12-ден төмен болғанда аминнің едәуір бөлігі суда протондалған күйде қалады — бөлінген амин массасы аз болады.', 'The ammonium ion R–NH₃⁺ is not extracted by ether. While the pH is below ~12 a noticeable part of the amine stays protonated in the water — the mass of amine isolated will be lower.') });
  },
  scene: alkaliScene,
};

/* ---------------- 12. экстракция эфиром ---------------- */
const s12 = {
  type: 'separate', id: 'ext1', mode: 'funnel', keep: 'org',
  title: L('Экстракция амина эфиром (1-я порция)', 'Аминді эфирмен экстракциялау (1-порция)', 'Extracting the amine with ether (1st portion)'),
  instr: L('<ol><li>Перелейте щелочную смесь в делительную воронку (кран закрыт), прилейте <b>10 мл эфира</b>, закройте пробкой.</li><li>Встряхивайте, <b>выпуская пары</b> через кран, дайте слоям разделиться.</li><li>Слейте нижний слой и решите, какой слой содержит амин.</li></ol><p class="note">Плотность эфира 0,71 г/мл — он легче воды. Рядом не должно быть огня.</p>',
    '<ol><li>Сілтілі қоспаны бөлгіш шұңғымаға құйып (шүмек жабық), <b>10 мл эфир</b> қосып, тығынмен жабыңыз.</li><li><b>Буды шүмек арқылы шығара</b> отырып шайқаңыз, қабаттардың бөлінуін күтіңіз.</li><li>Төменгі қабатты ағызып, амин қай қабатта екенін шешіңіз.</li></ol><p class="note">Эфирдің тығыздығы 0,71 г/мл — ол судан жеңіл. Жанында от болмауы тиіс.</p>',
    '<ol><li>Pour the alkaline mixture into the separating funnel (stopcock closed), add <b>10 mL of ether</b> and stopper it.</li><li>Shake, <b>venting</b> through the stopcock, and let the layers separate.</li><li>Run off the lower layer and decide which layer contains the amine.</li></ol><p class="note">Ether has a density of 0.71 g/mL — it is lighter than water. No flames nearby.</p>'),
  need: L('Разделите слои', 'Қабаттарды бөліңіз', 'Separate the layers'),
  layers: [
    { id: 'aq', label: L('нижний водный щелочной слой', 'төменгі сулы сілтілі қабат', 'lower aqueous alkaline layer'), color: 'rgba(170,205,225,.6)', frac: 0.55 },
    { id: 'org', label: L('верхний эфирный слой (амин)', 'жоғарғы эфир қабаты (амин)', 'upper ether layer (amine)'), color: 'rgba(236,224,170,.65)', frac: 0.32 },
  ],
  onFinish(S, F) { S.funnelLoss = F.loss || 0; S.splash = (S.splash || 0) + (F.loss || 0); },
};

const s13 = {
  type: 'decide', id: 'ext2',
  title: L('Вторая экстракция', 'Екінші экстракция', 'Second extraction'),
  instr: L('<p>По методичке амин извлекают <b>двумя порциями по 10 мл</b> эфира и экстракты объединяют. Что делать с водным слоем?</p>', '<p>Әдістеме бойынша аминді эфирдің <b>10 мл-ден екі порциясымен</b> бөліп алып, экстракттарды біріктіреді. Сулы қабатпен не істейді?</p>', '<p>According to the manual, the amine is extracted with <b>two 10 mL portions</b> of ether and the extracts are combined. What do you do with the aqueous layer?</p>'),
  need: L('Выберите действие', 'Әрекетті таңдаңыз', 'Choose the action'),
  question: L('Водный слой после первой экстракции:', 'Бірінші экстракциядан кейінгі сулы қабат:', 'The aqueous layer after the first extraction:'),
  options: [
    { id: 'again', ok: true, label: L('Вернуть в воронку, экстрагировать ещё 10 мл эфира, экстракты объединить', 'Шұңғымаға қайтарып, тағы 10 мл эфирмен экстракциялап, экстракттарды біріктіру', 'Return it to the funnel, extract with another 10 mL of ether and combine the extracts'), advance: 600,
      effect(S) { S.portions = [10, 10]; }, log: L('Водный слой повторно проэкстрагирован 10 мл эфира; эфирные экстракты (≈ 20 мл) объединены', 'Сулы қабат 10 мл эфирмен қайта экстракцияланды; эфир экстракттары (≈ 20 мл) біріктірілді', 'The aqueous layer was extracted again with 10 mL of ether; the ether extracts (≈ 20 mL) were combined'),
      why: L('две порции по 10 мл извлекают больше амина, чем одна', '10 мл-ден екі порция біреуінен көбірек амин бөліп алады', 'two 10 mL portions extract more amine than one') },
    { id: 'once', ok: false, severity: 'major', label: L('Одной экстракции достаточно — водный слой в отходы', 'Бір экстракция жеткілікті — сулы қабат қалдыққа', 'One extraction is enough — the aqueous layer goes to waste'), remark: L('проведена одна экстракция вместо двух — часть амина осталась в водном слое', 'екі экстракцияның орнына біреуі жүргізілді — аминнің бір бөлігі сулы қабатта қалды', 'only one extraction instead of two — part of the amine stayed in the aqueous layer'),
      whatif: L('Каждая экстракция извлекает лишь часть амина (распределение между эфиром и водой). Вторая порция эфира забирает большую часть оставшегося.', 'Әр экстракция аминнің бір бөлігін ғана бөліп алады (эфир мен су арасында таралу). Эфирдің екінші порциясы қалғанның көп бөлігін алады.', 'Each extraction removes only part of the amine (it is distributed between ether and water). A second portion of ether takes most of what is left.'), effect(S) { S.portions = [10]; } },
    { id: 'sink', ok: false, severity: 'safety', label: L('Вылить водный слой в раковину и закончить экстракцию', 'Сулы қабатты раковинаға төгіп, экстракцияны аяқтау', 'Pour the aqueous layer down the sink and stop extracting'), remark: L('сильнощелочной водный слой с амином вылит в раковину (п. 10.2 правил ТБ)', 'амині бар күшті сілтілі сулы қабат раковинаға төгілді (ҚТ ережелерінің 10.2-тармағы)', 'strongly alkaline aqueous layer containing amine poured down the sink (safety rule 10.2)'), effect(S) { S.portions = [10]; } },
  ],
};

const s14 = {
  type: 'decide', id: 'dryExt',
  title: L('Сушка эфирного экстракта', 'Эфир экстрактын кептіру', 'Drying the ether extract'),
  instr: L('<p>Эфирный экстракт насыщен водой. По методичке его сушат <b>безводным сульфатом натрия</b>.</p>', '<p>Эфир экстракты сумен қаныққан. Әдістеме бойынша оны <b>сусыз натрий сульфатымен</b> кептіреді.</p>', '<p>The ether extract is saturated with water. According to the manual it is dried over <b>anhydrous sodium sulfate</b>.</p>'),
  need: L('Высушите экстракт', 'Экстрактты кептіріңіз', 'Dry the extract'),
  question: L('Как высушить объединённый эфирный экстракт?', 'Біріктірілген эфир экстрактын қалай кептіреді?', 'How do you dry the combined ether extract?'),
  options: [
    { id: 'na2so4', ok: true, label: L('Внести безводный Na₂SO₄, покачивать 10 мин, пока осушитель не станет рассыпчатым', 'Сусыз Na₂SO₄ салып, кептіргіш үгілгіш болғанша 10 мин шайқау', 'Add anhydrous Na₂SO₄ and swirl for 10 min until the drying agent is free-flowing'), advance: 600,
      effect(S) { S.dry = 'na2so4'; }, log: L('Экстракт высушен безводным Na₂SO₄ (10 мин); раствор прозрачный', 'Экстракт сусыз Na₂SO₄-пен кептірілді (10 мин); ерітінді мөлдір', 'Extract dried over anhydrous Na₂SO₄ (10 min); the solution is clear') },
    { id: 'none', ok: false, severity: 'major', label: L('Не сушить — вода испарится вместе с эфиром', 'Кептірмеу — су эфирмен бірге буланады', 'Do not dry — the water will evaporate with the ether'), remark: L('эфирный экстракт не высушен — в амине осталась вода', 'эфир экстракты кептірілмеді — аминде су қалды', 'the ether extract was not dried — water remained in the amine'),
      whatif: L('Вода кипит при 100 °C и на тёплой бане вместе с эфиром не уходит: она остаётся в амине. Масса амина будет завышена, а угол вращения неразбавленного амина — занижен.', 'Су 100 °C-та қайнайды және жылы моншада эфирмен бірге кетпейді: ол аминде қалады. Амин массасы жоғары, ал сұйылтылмаған аминнің айналу бұрышы төмен болады.', 'Water boils at 100 °C and does not leave with the ether on a warm bath: it stays in the amine. The mass of amine will be too high and the rotation of the neat amine too low.'), effect(S) { S.dry = 'none'; } },
    { id: 'cacl2', ok: false, severity: 'major', label: L('Высушить безводным CaCl₂ — он сильнее', 'Сусыз CaCl₂-пен кептіру — ол күштірек', 'Dry over anhydrous CaCl₂ — it is stronger'), advance: 600, remark: L('амин сушили хлоридом кальция — часть амина связана в комплекс', 'амин кальций хлоридімен кептірілді — аминнің бір бөлігі кешенге байланды', 'the amine was dried over calcium chloride — part of the amine was bound as a complex'),
      whatif: L('Хлорид кальция образует комплексы с аминами (и спиртами): амин остаётся на осушителе, выход резко падает. Для аминов берут Na₂SO₄, K₂CO₃ или KOH.', 'Кальций хлориді аминдермен (және спирттермен) кешендер түзеді: амин кептіргіште қалады, шығым күрт төмендейді. Аминдер үшін Na₂SO₄, K₂CO₃ немесе KOH алады.', 'Calcium chloride forms complexes with amines (and alcohols): the amine stays on the drying agent and the yield drops sharply. For amines use Na₂SO₄, K₂CO₃ or KOH.'), effect(S) { S.dry = 'cacl2'; } },
  ],
};

/* ---------------- 15. колбочка ---------------- */
const s15 = {
  type: 'read', id: 'm0',
  title: L('Взвешивание пустой колбы', 'Бос колбаны өлшеу', 'Weighing the empty flask'),
  instr: L('<p>Взвесьте чистую сухую круглодонную колбу на 25 мл на аналитических весах (дверцы закрыты) и запишите массу с точностью до 0,0001 г. В неё декантируют эфирный раствор.</p>', '<p>Таза құрғақ 25 мл түбі дөңгелек колбаны аналитикалық таразыда (есікшелері жабық) өлшеп, массасын 0,0001 г дәлдікпен жазыңыз. Оған эфир ерітіндісін декантациялайды.</p>', '<p>Weigh a clean dry 25 mL round-bottomed flask on the analytical balance (doors closed) and record its mass to 0.0001 g. The ether solution is decanted into it.</p>'),
  need: L('Запишите массу колбы', 'Колба массасын жазыңыз', 'Record the mass of the flask'),
  label: L('Масса пустой колбы', 'Бос колба массасы', 'Mass of the empty flask'), unit: L('г', 'г', 'g'), div: 0.0001, tol: 0.00005, decimals: 4, saveAs: 'm0r',
  value: (S) => S.m0,
  scene: (S) => flaskBalance(S.m0, false),
};

/* ---------------- 16. упаривание эфира ---------------- */
const FIRE = L('Пары эфира вспыхнули от раскалённой поверхности: над колбой горит эфир, огонь может перекинуться на склянки с растворителями. В реальной лаборатории: выключить нагрев, накрыть горящий сосуд часовым стеклом или влажной тканью, при крупном возгорании — огнетушитель и эвакуация (пп. 11.2, 11.4); водой горящий эфир не тушат. Эфир упаривают только на тёплой водяной бане в вытяжном шкафу (п. 5.2).',
  'Эфир булары қызған беттен тұтанды: колба үстінде эфир жанып жатыр, от еріткіштер салынған склянкаларға ауысуы мүмкін. Нақты зертханада: қыздыруды өшіру, жанып жатқан ыдысты сағат шынысымен немесе ылғал матамен жабу, ірі өртте — өрт сөндіргіш және эвакуация (11.2, 11.4-тармақтар); жанып жатқан эфирді сумен сөндірмейді. Эфирді тек тартпа шкафта жылы су моншасында буландырады (5.2-тармақ).',
  'Ether vapour ignited on the hot surface: ether is burning above the flask and the fire may spread to the solvent bottles. In a real lab: switch off the heating, cover the burning vessel with a watch glass or a damp cloth, and for a larger fire use the extinguisher and evacuate (rules 11.2, 11.4); burning ether is never put out with water. Ether is evaporated only on a warm water bath in the fume hood (rule 5.2).');

const s16 = {
  type: 'process', id: 'evap',
  title: L('Упаривание эфира', 'Эфирді буландыру', 'Evaporating the ether'),
  instr: L('<ol><li>Декантируйте высушенный раствор с осушителя в предварительно взвешенную колбу.</li><li>Упарьте эфир на <b>тёплой водяной бане</b> в вытяжном шкафу. <b>Никакого открытого огня!</b></li><li>Когда эфир отгонится, снимите колбу с бани.</li></ol><p class="note">Т. кип. эфира 34,6 °C: тёплой бани (40–50 °C) достаточно. Горячая баня — бурное вскипание и выброс.</p>',
    '<ol><li>Кептірілген ерітіндіні кептіргіштен алдын ала өлшенген колбаға декантациялаңыз.</li><li>Эфирді тартпа шкафта <b>жылы су моншасында</b> буландырыңыз. <b>Ешқандай ашық от болмасын!</b></li><li>Эфир айдалып біткенде колбаны моншадан алыңыз.</li></ol><p class="note">Эфирдің қайнау t 34,6 °C: жылы монша (40–50 °C) жеткілікті. Ыстық монша — қатты қайнау және лақтырып шығару.</p>',
    '<ol><li>Decant the dried solution off the drying agent into the pre-weighed flask.</li><li>Evaporate the ether on a <b>warm water bath</b> in the fume hood. <b>No open flames!</b></li><li>When the ether has gone, take the flask off the bath.</li></ol><p class="note">Ether boils at 34.6 °C: a warm bath (40–50 °C) is enough. A hot bath causes violent boiling and bumping.</p>'),
  need: L('Удалите эфир', 'Эфирді кетіріңіз', 'Remove the ether'),
  speeds: [10, 30, 60],
  setup(S, lc) { lc.E = { ether: (S.portions || [10, 10]).reduce((a, b) => a + b, 0) - 1.5, Tb: 22, boil: false, amineV: 1 }; lc.src = null; },
  controls: [
    { kind: 'action', id: 'dec', group: L('Раствор', 'Ерітінді', 'Solution'), label: L('Декантировать раствор в взвешенную колбу', 'Ерітіндіні өлшенген колбаға декантациялау', 'Decant the solution into the weighed flask'), advance: 60, log: L('Эфирный раствор декантирован с осушителя в предварительно взвешенную колбу; осушитель промыт 1–2 мл эфира', 'Эфир ерітіндісі кептіргіштен алдын ала өлшенген колбаға декантацияланды; кептіргіш 1–2 мл эфирмен шайылды', 'The ether solution was decanted off the drying agent into the pre-weighed flask; the drying agent was rinsed with 1–2 mL of ether') },
    { kind: 'seg', id: 'bath', group: L('Водяная баня', 'Су моншасы', 'Water bath'), label: L('Температура бани', 'Монша температурасы', 'Bath temperature'), options: [[0, L('выкл.', 'өшір.', 'off')], [45, '45 °C'], [70, '70 °C'], [95, '95 °C']], default: 0 },
    { kind: 'action', id: 'plate', cls: 'danger', group: L('Быстрее', 'Тезірек', 'Faster'), label: L('Поставить колбу прямо на электроплитку', 'Колбаны тікелей электр плитасына қою', 'Put the flask straight on the hot plate'), requires: ['dec'],
      do(S, lc, ctx) { lc.src = 'plate'; ctx.remark({ key: 'fire', severity: 'critical', text: L('эфир нагревали на электроплитке — пары эфира вспыхнули', 'эфир электр плитасында қыздырылды — эфир булары тұтанды', 'ether heated on a hot plate — the ether vapour caught fire'), critical: { text: FIRE } }); } },
    { kind: 'action', id: 'off', cls: 'pri', group: L('Завершение', 'Аяқтау', 'Finishing'), label: L('Снять колбу с бани — эфир отогнан', 'Колбаны моншадан алу — эфир айдалды', 'Take the flask off the bath — the ether is gone'), requires: ['dec'],
      do(S, lc, ctx) {
        lc.c.bath = 0; lc.fin = true; S.etherLeft = Math.max(0, lc.E.ether);
        if (lc.E.ether > 0.3) ctx.remark({ key: 'ether-left', severity: 'major', text: L(`упаривание прекращено рано — в колбе осталось ≈ ${n(lc.E.ether, 1)} мл эфира`, `буландыру ерте тоқтатылды — колбада ≈ ${n(lc.E.ether, 1)} мл эфир қалды`, `evaporation stopped too early — ≈ ${n(lc.E.ether, 1)} mL of ether left in the flask`),
          whatif: L('Остаток эфира увеличит массу «амина» и разбавит его: удельное вращение и оптическая чистота получатся заниженными.', 'Эфир қалдығы «амин» массасын арттырып, оны сұйылтады: меншікті айналу мен оптикалық тазалық төмен шығады.', 'Leftover ether adds to the mass of the “amine” and dilutes it: the specific rotation and optical purity come out too low.') });
        ctx.log(L(`Эфир удалён; в колбе — ${lc.E.ether > 0.3 ? 'жидкость с сильным запахом эфира' : 'бесцветная маслянистая жидкость с аммиачным запахом'}`, `Эфир кетірілді; колбада — ${lc.E.ether > 0.3 ? 'эфирдің қатты иісі бар сұйықтық' : 'аммиак иісті түссіз майлы сұйықтық'}`, `Ether removed; the flask contains ${lc.E.ether > 0.3 ? 'a liquid smelling strongly of ether' : 'a colourless oily liquid with an ammonia-like odour'}`), 'obs');
      } },
  ],
  tick(S, lc, dt) {
    if (lc.fin) return;
    const E = lc.E, set = lc.c.bath || 0;
    if (!lc.done.dec) return;
    E.Tb = relax(E.Tb, set || 22, 0.02, dt);
    const rate = Math.max(0, E.Tb - 34.6) * 0.0012;           // мл/с
    E.ether = Math.max(0, E.ether - rate * dt);
    E.boil = E.ether > 0.05 && E.Tb > 36;
    if (E.boil && E.Tb > 65) lc.hotT = (lc.hotT || 0) + dt;
  },
  stop: (S, lc) => !!lc.fin,
  readouts: (S, lc) => [
    { label: L('Баня', 'Монша', 'Bath'), value: n(lc.E.Tb, 0) + ' °C', st: lc.E.Tb > 60 ? 'warn' : lc.E.Tb >= 38 ? 'ok' : '' },
    { label: L('Эфир в колбе', 'Колбадағы эфир', 'Ether in the flask'), value: { ru: '≈ ' + n(lc.E.ether, 1) + ' мл', kk: '≈ ' + n(lc.E.ether, 1) + ' мл', en: '≈ ' + n(lc.E.ether, 1) + ' mL' }, st: lc.E.ether <= 0.3 ? 'ok' : '' },
  ],
  alerts(S, lc) {
    if (!lc.done.dec) return null;
    if (lc.E.Tb > 65 && lc.E.ether > 0.05) return { text: L('Эфир кипит слишком бурно — возможен выброс. Уменьшите температуру бани.', 'Эфир тым қатты қайнап жатыр — лақтырып шығаруы мүмкін. Монша температурасын азайтыңыз.', 'The ether is boiling too violently — it may bump. Lower the bath temperature.'), kind: 'warn' };
    if (lc.E.ether <= 0.3 && !lc.fin) return { text: L('Эфир почти полностью отогнан — снимите колбу с бани.', 'Эфир толығымен дерлік айдалды — колбаны моншадан алыңыз.', 'The ether has almost all gone — take the flask off the bath.'), kind: 'good' };
    return null;
  },
  events: [{
    id: 'bump', when: (S, lc) => (lc.hotT || 0) > 20,
    title: L('Эфир вскипает толчками', 'Эфир сілкіністермен қайнап жатыр', 'The ether is bumping'),
    text: L('На горячей бане эфир вскипает толчками, капли раствора выбрасывает из горла колбы. Что вы сделаете?', 'Ыстық моншада эфир сілкіністермен қайнап, ерітінді тамшылары колба мойнынан атылып шығуда. Не істейсіз?', 'On the hot bath the ether is bumping and drops of solution are being thrown out of the neck of the flask. What do you do?'),
    options: [
      { ok: true, label: L('Сразу снизить температуру бани до 40–50 °C', 'Монша температурасын бірден 40–50 °C-қа төмендету', 'Lower the bath to 40–50 °C at once'), effect(S, lc) { lc.c.bath = 45; lc.E.Tb = 50; lc.hotT = -1e9; S.splash = (S.splash || 0) + 0.02; } },
      { ok: false, severity: 'major', label: L('Продолжать — так быстрее', 'Жалғастыру — осылай тезірек', 'Carry on — it is faster'), remark: L('эфир упаривали на горячей бане с выбросом — часть амина потеряна', 'эфир ыстық моншада лақтырып шығарумен буландырылды — аминнің бір бөлігі жоғалды', 'ether evaporated on a hot bath with bumping — part of the amine was lost'), effect(S, lc) { S.bump = true; lc.hotT = -1e9; } },
      { ok: false, severity: 'safety', label: L('Закрыть колбу пробкой, чтобы ничего не выбрасывало', 'Ештеңе атылмауы үшін колбаны тығынмен жабу', 'Stopper the flask so nothing can splash out'), remark: L('попытка закрыть пробкой колбу с кипящим эфиром (п. 7.4 правил ТБ)', 'қайнап жатқан эфирі бар колбаны тығынмен жабу әрекеті (ҚТ ережелерінің 7.4-тармағы)', 'tried to stopper a flask of boiling ether (safety rule 7.4)'), whatif: L('Нагревать закрытый сосуд нельзя: давление паров эфира выбьет пробку или разорвёт колбу. Уменьшите нагрев.', 'Жабық ыдысты қыздыруға болмайды: эфир буларының қысымы тығынды атып шығарады немесе колбаны жарады. Қыздыруды азайтыңыз.', 'A closed vessel must never be heated: the ether vapour pressure will blow out the stopper or burst the flask. Reduce the heating.'), effect(S, lc) { lc.c.bath = 45; lc.hotT = -1e9; } },
    ],
  }],
  done: (S, lc) => !!lc.fin && { text: L('Эфир удалён. Взвесьте колбу с амином.', 'Эфир кетірілді. Амині бар колбаны өлшеңіз.', 'The ether is removed. Weigh the flask with the amine.') },
  scene: evapScene,
};

/* ---------------- 17. масса амина ---------------- */
const s17 = {
  type: 'read', id: 'm1',
  title: L('Взвешивание колбы с амином', 'Амині бар колбаны өлшеу', 'Weighing the flask with the amine'),
  instr: L('<p>Дайте колбе остыть, протрите снаружи и взвесьте с закрытыми дверцами. Масса амина — по разности.</p>', '<p>Колбаны суытып, сыртын сүртіп, есікшелері жабық күйде өлшеңіз. Амин массасы — айырма бойынша.</p>', '<p>Let the flask cool, wipe the outside and weigh it with the doors closed. The mass of amine is found by difference.</p>'),
  need: L('Запишите массу колбы с амином', 'Амині бар колба массасын жазыңыз', 'Record the mass of the flask with the amine'),
  label: L('Масса колбы с амином', 'Амині бар колба массасы', 'Mass of the flask with the amine'), unit: L('г', 'г', 'g'), div: 0.0001, tol: 0.00005, decimals: 4, saveAs: 'm1r',
  value: (S) => +(S.m0 + resolveAmine(S).mAmine).toFixed(4),
  scene: (S) => flaskBalance(S.m0 + resolveAmine(S).mAmine, true),
};

const s18 = {
  type: 'calc', id: 'mass',
  title: L('Масса и выход амина', 'Амин массасы мен шығымы', 'Mass and yield of the amine'),
  instr: L('<p>Рассчитайте массу выделенного амина и её долю от максимально возможной массы одного энантиомера (<b>1,55 г</b> — половина рацемата).</p>', '<p>Бөлінген амин массасын және оның бір энантиомердің ең көп мүмкін массасынан (<b>1,55 г</b> — рацематтың жартысы) үлесін есептеңіз.</p>', '<p>Calculate the mass of amine isolated and its percentage of the maximum possible mass of one enantiomer (<b>1.55 g</b> — half of the racemate).</p>'),
  need: L('Рассчитайте массу и выход', 'Массасы мен шығымын есептеңіз', 'Calculate the mass and yield'),
  fields: [
    { id: 'm', label: L('Масса амина', 'Амин массасы', 'Mass of amine'), unit: L('г', 'г', 'g'), decimals: 4, tol: 0.005, answer: (S) => S.m1r - S.m0r,
      formula: (S) => L(`m = ${g4(S.m1r)} − ${g4(S.m0r)}`, `m = ${g4(S.m1r)} − ${g4(S.m0r)}`, `m = ${g4(S.m1r)} − ${g4(S.m0r)}`) },
    { id: 'y', label: L('От максимума одного энантиомера', 'Бір энантиомер максимумынан', 'Of the maximum for one enantiomer'), unit: '%', decimals: 1, tol: 0.01, answer: (S) => ((S.m1r - S.m0r) / MAX_ONE) * 100,
      formula: (S) => L(`${g4(S.m1r - S.m0r)} / 1.55 × 100 %`, `${g4(S.m1r - S.m0r)} / 1.55 × 100 %`, `${g4(S.m1r - S.m0r)} / 1.55 × 100 %`) },
  ],
  saveAs: 'calcM',
};

const s19 = {
  type: 'cleanup', id: 'clean',
  title: L('Уборка рабочего места', 'Жұмыс орнын жинау', 'Cleaning up'),
  instr: L('<p>Утилизируйте отходы по контейнерам (раздел 10 правил ТБ), выключите приборы, закройте склянки, вымойте руки. Колбу с амином закройте пробкой — она нужна для опыта 3.</p><p class="note">Отходы органических растворителей — в отдельную ёмкость (раздел 7 методички).</p>',
    '<p>Қалдықтарды ыдыстар бойынша кәдеге жаратыңыз (ҚТ ережелерінің 10-бөлімі), құралдарды өшіріңіз, склянкаларды жабыңыз, қолыңызды жуыңыз. Амині бар колбаны тығынмен жабыңыз — ол 3-тәжірибеге керек.</p><p class="note">Органикалық еріткіш қалдықтары — бөлек ыдысқа (әдістеменің 7-бөлімі).</p>',
    '<p>Dispose of the waste into the right containers (safety rules, section 10), switch off the equipment, close the bottles and wash your hands. Stopper the flask with the amine — you need it for experiment 3.</p><p class="note">Organic solvent waste goes into a separate container (manual, section 7).</p>'),
  need: L('Уберите рабочее место', 'Жұмыс орнын жинаңыз', 'Clean up the bench'),
  bins: ['organic', 'acid', 'solid', 'sink', 'trash'],
  items: [
    { id: 'mother', bin: 'organic', label: L('Метанольный маточный раствор (соль (R)-амина)', 'Метанолды аналық ерітінді ((R)-амин тұзы)', 'Methanol mother liquor ((R)-amine salt)'),
      wrong: { sink: { severity: 'safety', text: L('метанольный раствор с амином вылит в раковину (п. 10.2 правил ТБ)', 'амині бар метанол ерітіндісі раковинаға төгілді (ҚТ ережелерінің 10.2-тармағы)', 'methanol solution containing amine poured down the sink (safety rule 10.2)'), whatif: L('Метанол токсичен и горюч, амин едкий: органические растворители в раковину не сливают — только в ёмкость для органических отходов.', 'Метанол улы әрі жанғыш, амин күйдіргіш: органикалық еріткіштерді раковинаға төкпейді — тек органикалық қалдықтар ыдысына.', 'Methanol is toxic and flammable and the amine corrosive: organic solvents never go down the sink — only into the organic waste container.') } } },
    { id: 'aq', bin: 'acid', label: L('Щелочной водный слой после экстракции', 'Экстракциядан кейінгі сілтілі сулы қабат', 'Alkaline aqueous layer from the extraction') },
    { id: 'dry', bin: 'solid', label: L('Отработанный Na₂SO₄ и фильтры', 'Пайдаланылған Na₂SO₄ және сүзгілер', 'Spent Na₂SO₄ and filter papers') },
    { id: 'wash', bin: 'organic', label: L('Метанол после промывания кристаллов', 'Кристалдарды жуғаннан кейінгі метанол', 'Methanol from washing the crystals') },
  ],
  switches: [
    { id: 'bath', label: L('Выключить водяную баню', 'Су моншасын өшіру', 'Switch off the water bath') },
    { id: 'pump', label: L('Отсоединить шланг и закрыть воду насоса', 'Шлангты ажыратып, сорғы суын жабу', 'Disconnect the hose and turn off the aspirator') },
    { id: 'ether', label: L('Закрыть склянку с эфиром, убрать в шкаф для ЛВЖ', 'Эфир склянкасын жауып, ОТС шкафына қою', 'Close the ether bottle and return it to the flammables cupboard'), log: L('Склянка с эфиром закрыта и убрана в шкаф для ЛВЖ (п. 5.4 правил ТБ)', 'Эфир склянкасы жабылып, ОТС шкафына қойылды (ҚТ ережелерінің 5.4-тармағы)', 'Ether bottle closed and returned to the flammables cupboard (safety rule 5.4)') },
    { id: 'hands', label: L('Вымыть руки', 'Қолды жуу', 'Wash your hands') },
  ],
};

export default {
  id: '2',
  title: L('Расщепление рацемического 1-фенилэтиламина через диастереомерные соли', 'Рацемиялық 1-фенилэтиламинді диастереомерлі тұздар арқылы ажырату', 'Resolution of racemic 1-phenylethylamine via diastereomeric salts'),
  principle: L('Рацемический 1-фенилэтиламин с энантиомерно чистой (R,R)-винной кислотой образует две диастереомерные соли. В метаноле соль (S)-амина менее растворима и кристаллизуется, соль (R)-амина остаётся в растворе. Обработка кристаллов щёлочью освобождает (S)-(−)-амин.',
    'Рацемиялық 1-фенилэтиламин энантиомерлік таза (R,R)-шарап қышқылымен екі диастереомерлі тұз түзеді. Метанолда (S)-амин тұзы аз ериді және кристалданады, (R)-амин тұзы ерітіндіде қалады. Кристалдарды сілтімен өңдеу (S)-(−)-аминді бөліп шығарады.',
    'Racemic 1-phenylethylamine reacts with enantiomerically pure (R,R)-tartaric acid to form two diastereomeric salts. In methanol the salt of the (S)-amine is less soluble and crystallises, while the salt of the (R)-amine stays in solution. Treatment of the crystals with alkali liberates the (S)-(−)-amine.'),
  equation: [
    L('(R,S)-C₆H₅CH(CH₃)NH₂ + (R,R)-винная кислота → (S)-амин · (R,R)-гидротартрат↓ (менее растворима) + соль (R)-амина (в растворе)', '(R,S)-C₆H₅CH(CH₃)NH₂ + (R,R)-шарап қышқылы → (S)-амин · (R,R)-гидротартрат↓ (аз ериді) + (R)-амин тұзы (ерітіндіде)', '(R,S)-C₆H₅CH(CH₃)NH₂ + (R,R)-tartaric acid → (S)-amine · (R,R)-hydrogen tartrate↓ (less soluble) + (R)-amine salt (in solution)'),
    L('(S)-C₆H₅CH(CH₃)NH₃⁺ HT⁻ + 2NaOH → (S)-C₆H₅CH(CH₃)NH₂ + Na₂T + 2H₂O (T — тартрат)', '(S)-C₆H₅CH(CH₃)NH₃⁺ HT⁻ + 2NaOH → (S)-C₆H₅CH(CH₃)NH₂ + Na₂T + 2H₂O (T — тартрат)', '(S)-C₆H₅CH(CH₃)NH₃⁺ HT⁻ + 2NaOH → (S)-C₆H₅CH(CH₃)NH₂ + Na₂T + 2H₂O (T = tartrate)'),
  ],
  initialState: ({ rng }) => ({
    base: { fS: +rng.range(0.66, 0.76).toFixed(3), fR: +rng.range(0.05, 0.09).toFixed(3) },
    mTA: 0, vMeOH: 55, lostMeOH: 0, vAmine: 3.3, T: 22, Tb: 22, und: 1, hot: false, early: false,
    cryst: 'slow', needlesKept: false, needleRisk: false, hours: 24,
    washLoss: 0, noWash: false, wetSalt: 0, mSalt: 0,
    vNaOH: 0, vWater: 15, lib: { free: 0 }, portions: [10, 10], dry: 'na2so4', splash: 0, bump: false, etherLeft: 0,
    m0: +rng.range(23.5, 26.5).toFixed(4), m0r: 0, m1r: 0,
  }),
  checkpoints: [0, 2, 12, 15],
  steps: [s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19],
  results(S) {
    const r = resolveAmine(S);
    const cr = crystallise(S);
    const m = S.m1r && S.m0r ? S.m1r - S.m0r : r.mAmine;
    return {
      mTA: S.mTA, vMeOH: S.vMeOH, vAmine: S.vAmine, lostMeOH: S.lostMeOH, mSalt: S.mSalt, cryst: S.cryst, needles: S.needlesKept, hours: S.hours,
      vNaOH: S.vNaOH, pH: S.lib ? S.lib.pH : null, portions: S.portions, dry: S.dry, etherLeft: S.etherLeft,
      m0: S.m0r, m1: S.m1r, mAmine: m, yieldMax: (m / MAX_ONE) * 100, ee: r.ee, wDil: r.wDil, de: cr.de * 100,
      prisms: S.cryst === 'slow' && !S.needlesKept,
      losses: r.losses,
    };
  },
  summary: (r) => [
    { label: L('Соль', 'Тұз', 'Salt'), value: { ru: n(r.mSalt, 4) + ' г', kk: n(r.mSalt, 4) + ' г', en: n(r.mSalt, 4) + ' g' } },
    { label: L('Амин', 'Амин', 'Amine'), value: { ru: n(r.mAmine, 4) + ' г', kk: n(r.mAmine, 4) + ' г', en: n(r.mAmine, 4) + ' g' } },
    { label: L('От 1,55 г', '1,55 г-нан', 'Of 1.55 g'), value: n(r.yieldMax, 1) + ' %', st: r.yieldMax >= 50 ? 'ok' : 'warn' },
    { label: L('Кристаллы', 'Кристалдар', 'Crystals'), value: r.prisms ? L('призмы', 'призмалар', 'prisms') : L('иглы', 'инелер', 'needles'), st: r.prisms ? 'ok' : 'warn' },
  ],
};
