/** Опыт 6. Проба Селиванова (кетозы и альдозы). Методичка, раздел 6, опыт 6; уборка — раздел 7. */
import { L } from '../../app/i18n.js';
import { hood, scene } from '../../app/scene/svg.js';
import { tubesOf, sugarReagent, baseState, cellsSummary } from './common.js';
import { envOf } from './steps/bench.js';
import { simulate } from './model.js';

const s0 = {
  type: 'decide', id: 'how',
  title: L('Как нагревать пробы с соляной кислотой', 'Тұз қышқылы бар сынамаларды қалай қыздырады', 'How to heat the hydrochloric acid tests'),
  instr: L('<p>Реактив Селиванова — 0,05 % резорцин в соляной кислоте (конц. HCl : вода = 1 : 2). Пробы нужно нагреть до кипения и сравнить, как быстро появляется окраска.</p>', '<p>Селиванов реактиві — тұз қышқылындағы 0,05 % резорцин (конц. HCl : су = 1 : 2). Сынамаларды қайнағанша қыздырып, түстің қаншалықты тез пайда болатынын салыстыру керек.</p>', '<p>Seliwanoff’s reagent is 0.05 % resorcinol in hydrochloric acid (conc. HCl : water = 1 : 2). The tests are brought to the boil and the speed of colour development is compared.</p>'),
  need: L('Выберите способ нагревания', 'Қыздыру тәсілін таңдаңыз', 'Choose how to heat'),
  question: L('Как вы нагреете три пробирки с реактивом Селиванова?', 'Селиванов реактиві бар үш пробирканы қалай қыздырасыз?', 'How will you heat the three tubes of Seliwanoff’s reagent?'),
  scene: () => scene(hood({ air: true })),
  options: [
    { id: 'bath', ok: true, label: L('Все пробирки одновременно — в кипящую водяную баню в вытяжном шкафу, отверстиями от себя и соседей', 'Барлық пробирканы бір мезгілде — тартпа шкафтағы қайнап тұрған су моншасына, аузын өзіңізден және көршілерден ары', 'All tubes at once — into the boiling water bath in the fume hood, mouths pointing away from you and your neighbours'),
      why: L('Баня даёт одинаковую температуру всем пробиркам — скорость окрашивания можно сравнивать; горячая HCl не выбрасывается.', 'Монша барлық пробиркаға бірдей температура береді — боялу жылдамдығын салыстыруға болады; ыстық HCl шашырамайды.', 'The bath gives every tube the same temperature, so the rates can be compared, and hot HCl is not thrown out.'),
      log: L('Решено: нагревать пробы Селиванова одновременно в кипящей водяной бане в вытяжном шкафу', 'Шешім: Селиванов сынамаларын тартпа шкафтағы қайнап тұрған су моншасында бір мезгілде қыздыру', 'Decision: heat the Seliwanoff tests together in the boiling water bath in the fume hood') },
    { id: 'plate', ok: false, label: L('Быстрее — по очереди прямо на электроплитке, наклонив пробирку к соседу, чтобы ему было видно цвет', 'Тезірек — кезекпен электр плитасының үстінде, түсі көрінуі үшін пробирканы көршіге қарай еңкейтіп', 'Quicker — one by one straight on the hotplate, tilting the tube towards your neighbour so they can see the colour'),
      remark: L('пробирка с горячей соляной кислотой нагревалась на плитке и была направлена на соседа', 'ыстық тұз қышқылы бар пробирка плитада қыздырылып, көршіге бағытталды', 'a tube of hot hydrochloric acid was heated on the hotplate and pointed at a neighbour'),
      critical: { text: L('Жидкость в узкой пробирке на плитке перегревается и вскипает толчком: горячая соляная кислота выбрасывается из пробирки на 1–2 метра — прямо в лицо соседу. Это химический и термический ожог глаз и кожи; пострадавшему промывают глаза у фонтанчика не менее 15 минут и вызывают врача. Пробирки с кислотой греют только в водяной бане и никогда не направляют на людей.', 'Тар пробиркадағы сұйықтық плитада қызып кетіп, кенет қайнап шығады: ыстық тұз қышқылы пробиркадан 1–2 метрге — тура көршінің бетіне атылады. Бұл көз бен терінің химиялық және термиялық күйігі; зардап шегушінің көзін фонтаншада кемінде 15 минут жуып, дәрігер шақырады. Қышқылы бар пробиркаларды тек су моншасында қыздырады және ешқашан адамдарға бағыттамайды.', 'Liquid in a narrow tube on a hotplate superheats and boils in a sudden burst: hot hydrochloric acid is thrown 1–2 metres out of the tube — straight into the neighbour’s face. That is a chemical and thermal burn of the eyes and skin; the casualty’s eyes are rinsed at the eyewash for at least 15 minutes and a doctor is called. Tubes of acid are heated only in a water bath and never pointed at anyone.') } },
    { id: 'stopper', ok: false, severity: 'safety', retry: true, label: L('Закрыть пробирки пробками, чтобы не выходили пары HCl', 'HCl булары шықпауы үшін пробиркаларды тығынмен жабу', 'Stopper the tubes so that no HCl fumes escape'),
      remark: L('попытка нагревать закрытые пробирки (п. 7.4 правил ТБ)', 'жабық пробиркаларды қыздыру әрекеті (ҚТ ережелерінің 7.4-тармағы)', 'tried to heat stoppered tubes (safety rule 7.4)'),
      whatif: L('При нагревании закрытой пробирки давление пара растёт: пробку выбивает вместе с горячей кислотой, а стекло может лопнуть. Пары HCl отводит тяга вытяжного шкафа.', 'Жабық пробирканы қыздырғанда бу қысымы артады: тығын ыстық қышқылмен бірге атылып шығады, ал шыны жарылуы мүмкін. HCl буларын тартпа шкафтың тартымы әкетеді.', 'When a closed tube is heated the vapour pressure builds up: the stopper shoots out with the hot acid and the glass may burst. HCl fumes are removed by the fume-hood draught.') },
  ],
};

const s1 = {
  type: 'lab15-bench', id: 'seliwanoff', key: 'seliwanoff', test: 'seliwanoff',
  title: L('Проба Селиванова', 'Селиванов сынамасы', 'Seliwanoff’s test'),
  instr: L('<ol><li>К <b>2 мл реактива Селиванова</b> прибавьте <b>0,5 мл</b> раствора сахара: глюкозы, фруктозы, сахарозы.</li><li>Поставьте пробирки <b>одновременно</b> в кипящую водяную баню.</li><li>Наблюдайте <b>не дольше 1–2 минут</b> и отметьте время появления окраски.</li></ol>',
    '<ol><li><b>2 мл Селиванов реактивіне</b> қант ерітіндісінің <b>0,5 мл</b>-ін қосыңыз: глюкоза, фруктоза, сахароза.</li><li>Пробиркаларды <b>бір мезгілде</b> қайнап тұрған су моншасына қойыңыз.</li><li><b>1–2 минуттан артық емес</b> бақылап, түстің пайда болу уақытын белгілеңіз.</li></ol>',
    '<ol><li>To <b>2 mL of Seliwanoff’s reagent</b> add <b>0.5 mL</b> of the sugar solution: glucose, fructose, sucrose.</li><li>Place the tubes in the boiling water bath <b>at the same time</b>.</li><li>Watch for <b>no more than 1–2 minutes</b> and note when the colour appears.</li></ol>'),
  need: L('Нагрейте пробы и следите за временем', 'Сынамаларды қыздырып, уақытты қадағалаңыз', 'Heat the tubes and watch the time'),
  tubes: tubesOf(['glu', 'fru', 'suc']),
  baths: ['boil'],
  reagents: [
    { id: 'sel', group: L('Реактив Селиванова (в вытяжном шкафу)', 'Селиванов реактиві (тартпа шкафта)', 'Seliwanoff’s reagent (in the fume hood)'), label: L('2 мл реактива в каждую', 'Әрқайсысына 2 мл реактив', '2 mL of reagent to each'), target: 'all', advance: 60,
      disabled: (S, b) => b.tubes.every((t) => t.sel > 0), when: (t) => (t.sel ? L('Реактив уже налит.', 'Реактив құйылды.', 'The reagent is already in.') : null),
      apply(t) { t.sel = 2; t.v += 2; }, log: L('В каждую пробирку налито 2 мл реактива Селиванова', 'Әр пробиркаға 2 мл Селиванов реактиві құйылды', '2 mL of Seliwanoff’s reagent put into each tube') },
    sugarReagent(0.5, { label: L('Внести по 0,5 мл раствора сахара', 'Әрқайсысына 0,5 мл қант ерітіндісін салу', 'Add 0.5 mL of sugar solution to each') }),
  ],
  events: [{
    id: 'two', when: (S, b) => b.sw >= 120 && b.tubes.some((t) => t.bath),
    title: L('Прошло 2 минуты', '2 минут өтті', '2 minutes have passed'),
    text: L('Секундомер показывает 02:00. Окраска в пробирках установилась так, как видно на стенде. Что делать дальше?', 'Секундомер 02:00 көрсетеді. Пробиркалардағы түс стендте көрінгендей тұрақтады. Әрі қарай не істеу керек?', 'The stopwatch reads 02:00. The colours in the tubes are as you see them on the bench. What next?'),
    options: [
      { ok: true, label: L('Вынуть пробирки и записать результат — дольше 1–2 минут не наблюдают', 'Пробиркаларды алып, нәтижені жазу — 1–2 минуттан артық бақыламайды', 'Take the tubes out and record the result — no longer than 1–2 minutes'),
        effect(S, b) { for (const t of b.tubes) t.bath = null; b.swOn = false; } },
      { ok: false, severity: 'major', label: L('Нагревать ещё 5 минут, чтобы окраска стала ярче', 'Түсі жарқын болуы үшін тағы 5 минут қыздыру', 'Heat for 5 more minutes so the colours become brighter'),
        remark: L('превышено время наблюдения пробы Селиванова (не более 1–2 мин) — глюкоза тоже окрашивается, проба теряет избирательность', 'Селиванов сынамасын бақылау уақыты асып кетті (1–2 минуттан артық емес) — глюкоза да боялады, сынама таңдамалылығын жоғалтады', 'Seliwanoff’s test watched too long (no more than 1–2 min) — glucose colours too and the test loses its selectivity'),
        whatif: L('Альдозы тоже дегидратируются, только медленнее: через несколько минут кипячения глюкоза даёт розовую окраску, и кетозу уже не отличить от альдозы.', 'Альдозалар да дегидратацияланады, тек баяу: бірнеше минут қайнатқаннан кейін глюкоза қызғылт түс береді де, кетозаны альдозадан ажырату мүмкін болмайды.', 'Aldoses are dehydrated too, only more slowly: after a few minutes of boiling glucose turns pink and a ketose can no longer be told from an aldose.'),
        effect(S, b, ctx) { simulate(b, envOf(S), 300); ctx.advance(300); for (const t of b.tubes) t.bath = null; b.swOn = false; S.selLong = true; } },
    ],
  }],
  check(S, b, ctx) {
    if (b.tubes.every((t) => !t.bath) && b.sw > 0 && b.sw < 60) ctx.feedback(L('Пробирки вынуты слишком рано: окраска фруктозы появляется примерно через минуту. Верните их в баню.', 'Пробиркалар тым ерте алынды: фруктозаның түсі шамамен бір минуттан кейін пайда болады. Оларды моншаға қайтарыңыз.', 'The tubes came out too early: the fructose colour appears after about a minute. Put them back in the bath.'), 'warn');
  },
  done: (S, b) => b.tubes.every((t) => !t.bath && t.sel > 0 && t.sugV > 0) && b.sw >= 60 && L('Наблюдение закончено — запишите окраску и время её появления.', 'Бақылау аяқталды — түсті және оның пайда болу уақытын жазыңыз.', 'The observation is over — record the colours and when they appeared.'),
  hints: [
    L('Кетозы дегидратируются в горячей HCl намного быстрее альдоз — поэтому важно время: 1–2 минуты.', 'Кетозалар ыстық HCl-да альдозаларға қарағанда әлдеқайда тез дегидратацияланады — сондықтан уақыт маңызды: 1–2 минут.', 'Ketoses are dehydrated in hot HCl much faster than aldoses — so timing matters: 1–2 minutes.'),
    L('Сахароза окрашивается с небольшой задержкой: кислота сначала гидролизует её до глюкозы и фруктозы.', 'Сахароза аздап кешігіп боялады: қышқыл алдымен оны глюкоза мен фруктозаға дейін гидролиздейді.', 'Sucrose colours after a short delay: the acid first hydrolyses it to glucose and fructose.'),
    L('«2 мл реактива» → «0,5 мл сахара» → «Все пробирки → в кипящую баню»; на 02:00 — вынуть и записать.', '«2 мл реактив» → «0,5 мл қант» → «Барлық пробирка → қайнап тұрған моншаға»; 02:00-де — алып, жазу.', '“2 mL of reagent” → “0.5 mL of sugar” → “All tubes → into the boiling bath”; at 02:00 — take out and record.'),
  ],
};

const s2 = {
  type: 'lab15-record', id: 'rec', key: 'seliwanoff', test: 'seliwanoff', saveAs: 'seliwanoff',
  title: L('Наблюдения: проба Селиванова', 'Бақылаулар: Селиванов сынамасы', 'Observations: Seliwanoff’s test'),
  instr: L('<p>Запишите окраску и время её появления в каждой пробирке.</p>', '<p>Әр пробиркадағы түсті және оның пайда болу уақытын жазыңыз.</p>', '<p>Record the colour and the time it appeared in each tube.</p>'),
  need: L('Запишите наблюдение по каждой пробирке', 'Әр пробирка бойынша бақылауды жазыңыз', 'Record the observation for each tube'),
  options: ['red', 'none', 'violet'],
  why: (t, code) => (code === 'red' && t.sug === 'fru' ? L('Кетогексоза в горячей HCl быстро дегидратируется до 5-гидроксиметилфурфурола, который с резорцином даёт вишнёво-красный продукт.', 'Кетогексоза ыстық HCl-да тез 5-гидроксиметилфурфуролға дейін дегидратацияланады, ол резорцинмен шие-қызыл өнім береді.', 'The ketohexose is rapidly dehydrated in hot HCl to 5-hydroxymethylfurfural, which gives a cherry-red product with resorcinol.') : code === 'red' && t.sug === 'suc' ? L('Кислота гидролизует сахарозу; освободившаяся фруктоза даёт окраску с небольшой задержкой.', 'Қышқыл сахарозаны гидролиздейді; бөлінген фруктоза аздап кешігіп түс береді.', 'The acid hydrolyses sucrose; the fructose released gives the colour after a short delay.') : code === 'none' ? L('Альдогексоза за 1–2 минуты почти не дегидратируется — окраски нет.', 'Альдогексоза 1–2 минутта дерлік дегидратацияланбайды — түс жоқ.', 'The aldohexose is hardly dehydrated in 1–2 minutes — no colour.') : null),
};

const s3 = {
  type: 'lab15-waste', id: 'waste',
  title: L('Уборка рабочего места', 'Жұмыс орнын жинау', 'Cleaning up'),
  instr: L('<p>Распределите отходы всех шести проб по ёмкостям, выключите бани, вымойте посуду и руки. Растворы, содержащие медь и серебро, собирают в ёмкость для отходов тяжёлых металлов (раздел 7 методички).</p>', '<p>Алты сынаманың барлық қалдықтарын ыдыстарға бөліңіз, моншаларды сөндіріп, ыдыстар мен қолды жуыңыз. Құрамында мыс пен күміс бар ерітінділерді ауыр металдар қалдығы ыдысына жинайды (әдістеменің 7-бөлімі).</p>', '<p>Sort the waste from all six tests into the containers, switch off the baths and wash the glassware and your hands. Solutions containing copper and silver are collected in the heavy-metal waste container (manual, section 7).</p>'),
  need: L('Уберите рабочее место', 'Жұмыс орнын жинаңыз', 'Clean up the bench'),
  scene: () => scene(hood({ air: true })),
  items: [
    { id: 'cu', bin: 'heavy', label: L('Пробы Троммера, Фелинга и Барфёда (соли меди, Cu₂O)', 'Троммер, Фелинг және Барфёд сынамалары (мыс тұздары, Cu₂O)', 'Trommer, Fehling and Barfoed tests (copper salts, Cu₂O)'),
      wrong: { sink: { severity: 'safety', text: L('растворы солей меди вылиты в раковину', 'мыс тұздарының ерітінділері раковинаға төгілді', 'copper salt solutions poured down the sink'), whatif: L('Соли меди токсичны для водоёмов и очистных сооружений; методичка требует собирать их в ёмкость для тяжёлых металлов.', 'Мыс тұздары су қоймалары мен тазарту құрылыстары үшін улы; әдістеме оларды ауыр металдар ыдысына жинауды талап етеді.', 'Copper salts are toxic to water bodies and treatment plants; the manual requires them to be collected in the heavy-metal container.') } } },
    { id: 'ag', bin: 'heavy', label: L('Подкисленные остатки пробы Толленса (серебро)', 'Толленс сынамасының қышқылданған қалдықтары (күміс)', 'Acidified Tollens’ residues (silver)') },
    { id: 'acid', bin: 'acid', label: L('Пробы Молиша и Селиванова (H₂SO₄, HCl)', 'Молиш және Селиванов сынамалары (H₂SO₄, HCl)', 'Molisch and Seliwanoff tests (H₂SO₄, HCl)'),
      wrong: { sink: { severity: 'safety', text: L('концентрированные кислоты вылиты в раковину (п. 10.2 правил ТБ)', 'концентрлі қышқылдар раковинаға төгілді (ҚТ ережелерінің 10.2-тармағы)', 'concentrated acids poured down the sink (safety rule 10.2)') } } },
    { id: 'sug', bin: 'sink', label: L('Остатки разбавленных растворов сахаров', 'Қант сұйылтылған ерітінділерінің қалдықтары', 'Leftover dilute sugar solutions'), wrong: { heavy: { severity: 'minor', text: L('чистые растворы сахаров слиты в ёмкость для тяжёлых металлов — она заполняется без нужды', 'таза қант ерітінділері ауыр металдар ыдысына төгілді — ол қажетсіз толады', 'plain sugar solutions poured into the heavy-metal container — it fills up for nothing') } } },
  ],
  bins: ['heavy', 'acid', 'organic', 'solid', 'sink', 'trash'],
  switches: [
    { id: 'baths', label: L('Выключить водяные бани', 'Су моншаларын сөндіру', 'Switch off the water baths'), log: L('Водяные бани выключены', 'Су моншалары сөндірілді', 'Water baths switched off') },
    { id: 'wash', label: L('Вымыть пробирки и пипетки', 'Пробиркалар мен пипеткаларды жуу', 'Wash the test tubes and pipettes'), log: L('Пробирки и пипетки вымыты и поставлены сушиться', 'Пробиркалар мен пипеткалар жуылып, кептіруге қойылды', 'Test tubes and pipettes washed and set to dry') },
    { id: 'hands', label: L('Снять перчатки, вымыть руки', 'Қолғапты шешіп, қолды жуу', 'Take off the gloves and wash your hands'), log: L('Перчатки сняты, руки вымыты с мылом', 'Қолғап шешіліп, қол сабынмен жуылды', 'Gloves off, hands washed with soap') },
  ],
};

export default {
  id: '6',
  title: L('Проба Селиванова (кетозы и альдозы)', 'Селиванов сынамасы (кетозалар және альдозалар)', 'Seliwanoff’s test (ketoses vs aldoses)'),
  principle: L('В горячей соляной кислоте кетогексозы быстро дегидратируются до 5-гидроксиметилфурфурола, который конденсируется с резорцином в вишнёво-красный продукт; альдогексозы реагируют намного медленнее.', 'Ыстық тұз қышқылында кетогексозалар тез 5-гидроксиметилфурфуролға дейін дегидратацияланады, ол резорцинмен конденсацияланып, шие-қызыл өнім түзеді; альдогексозалар әлдеқайда баяу әрекеттеседі.', 'In hot hydrochloric acid ketohexoses are rapidly dehydrated to 5-hydroxymethylfurfural, which condenses with resorcinol to a cherry-red product; aldohexoses react much more slowly.'),
  equation: [L('фруктоза → 5-гидроксиметилфурфурол (HCl, t, −3H₂O); + резорцин → вишнёво-красный продукт', 'фруктоза → 5-гидроксиметилфурфурол (HCl, t, −3H₂O); + резорцин → шие-қызыл өнім', 'fructose → 5-hydroxymethylfurfural (HCl, t, −3H₂O); + resorcinol → cherry-red product')],
  initialState: (a) => baseState(a),
  checkpoints: [0, 1, 3],
  steps: [s0, s1, s2, s3],
  results: (S) => ({ cells: S.res, long: !!S.selLong }),
  summary: (r) => cellsSummary(r, 'seliwanoff', ['glu', 'fru', 'suc']),
};
