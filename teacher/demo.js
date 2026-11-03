// Демо-режим панели: вымышленные студенты, заявки, протоколы и оценки — для показа без сервера.
// Все имена вымышлены и помечены «(пример)». Содержание вопросов и протоколов — по методичке
// работы № 6–7 (docs/source/labs/lab-06-07.md) и правилам ТБ (docs/source/safety-rules-ru.md).
// Тексты — объекты {ru, kk, en}: в демо они переключаются вместе с языком панели.

const L = (ru, kk, en) => ({ ru, kk, en });
const MARK = { ru: ' (пример)', kk: ' (мысал)', en: ' (example)' };
const person = (ru, kk, en) => ({ ru: ru + MARK.ru, kk: kk + MARK.kk, en: en + MARK.en });

const STUDENTS = [
  { id: 'demo-1', group: 'Х-31', name: person('Әсем Нұрланқызы', 'Әсем Нұрланқызы', 'Asem Nurlankyzy'), lang: 'kk' },
  { id: 'demo-2', group: 'Х-31', name: person('Данияр Сапаров', 'Данияр Сапаров', 'Daniyar Saparov'), lang: 'ru' },
  { id: 'demo-3', group: 'Х-31', name: person('Мария Ковалёва', 'Мария Ковалёва', 'Maria Kovaleva'), lang: 'ru' },
  { id: 'demo-4', group: 'Х-31', name: person('Ерлан Жақыпов', 'Ерлан Жақыпов', 'Yerlan Zhakypov'), lang: 'kk' },
  { id: 'demo-5', group: 'Х-32', name: person('Айгерим Төлеген', 'Айгерім Төлеген', 'Aigerim Tolegen'), lang: 'kk' },
  { id: 'demo-6', group: 'Х-32', name: person('Тимур Ахметов', 'Тимур Ахметов', 'Timur Akhmetov'), lang: 'en' },
  { id: 'demo-7', group: 'Х-32', name: person('Жанна Ли', 'Жанна Ли', 'Zhanna Li'), lang: 'ru' },
  { id: 'demo-8', group: 'Х-32', name: person('Нұрсұлтан Бекболатов', 'Нұрсұлтан Бекболатов', 'Nursultan Bekbolatov'), lang: 'kk' },
  { id: 'demo-9', group: 'Х-31', name: person('Ольга Ким', 'Ольга Ким', 'Olga Kim'), lang: 'ru' },
];

/* ---------- вопросы (правильный вариант — первый в right, неверный — wrong) ---------- */

const Q_BRIEF = [
  { q: L('Можно ли набирать жидкость в пипетку ртом?', 'Сұйықтықты пипеткаға аузымен тартуға бола ма?', 'May liquid be drawn into a pipette by mouth?'),
    right: L('Нет — только резиновой грушей или автоматической пипеткой', 'Жоқ — тек резеңке алмұрт немесе автоматты пипеткамен', 'No — only with a rubber bulb or an automatic pipette'),
    wrong: L('Можно, если жидкость не ядовита', 'Сұйықтық улы болмаса, болады', 'Yes, if the liquid is not toxic') },
  { q: L('Можно ли работать в контактных линзах?', 'Жанаспалы линзамен жұмыс істеуге бола ма?', 'May you work wearing contact lenses?'),
    right: L('Не рекомендуется: под линзами могут скапливаться пары веществ', 'Ұсынылмайды: линза астында заттардың булары жиналуы мүмкін', 'Not recommended: vapours can collect under the lenses'),
    wrong: L('Можно, очки тогда не нужны', 'Болады, онда көзілдірік қажет емес', 'Yes, then goggles are not needed') },
  { q: L('Чем нельзя тушить горящий органический растворитель?', 'Жанып жатқан органикалық еріткішті немен сөндіруге болмайды?', 'What must never be used on a burning organic solvent?'),
    right: L('Водой', 'Сумен', 'Water'),
    wrong: L('Песком или противопожарным одеялом', 'Құммен немесе өртке қарсы жамылғымен', 'Sand or a fire blanket') },
  { q: L('Реактив попал в глаз. Что делать?', 'Реактив көзге түсті. Не істеу керек?', 'A reagent got into the eye. What should you do?'),
    right: L('Промыть у фонтанчика не менее 15 минут, удерживая веко открытым, и обратиться к врачу', 'Көз жуғыш фонтаншада кемінде 15 минут қабақты ашық ұстап жуып, дәрігерге қаралу', 'Rinse at the eyewash for at least 15 minutes, holding the eyelid open, and seek medical help'),
    wrong: L('Потереть глаз и закапать капли', 'Көзді уқалап, тамшы тамызу', 'Rub the eye and use eye drops') },
  { q: L('Загорелась одежда. Что делать?', 'Киім тұтанды. Не істеу керек?', 'Your clothing has caught fire. What should you do?'),
    right: L('Остановиться, упасть на пол и покататься или встать под аварийный душ', 'Тоқтап, еденге жатып аунау немесе апаттық душқа тұру', 'Stop, drop and roll, or use the safety shower'),
    wrong: L('Бежать к выходу', 'Шығуға қарай жүгіру', 'Run to the exit') },
  { q: L('Какой халат нужен в лаборатории?', 'Зертханада қандай халат керек?', 'What kind of lab coat is required?'),
    right: L('Застёгнутый, из хлопчатобумажной ткани', 'Түймеленген, мақта-мата матадан', 'Buttoned, made of cotton'),
    wrong: L('Любой, можно синтетический', 'Кез келгені, синтетикалық та болады', 'Any, synthetic is fine') },
  { q: L('Можно ли работать одному при нагревании и перегонке ЛВЖ?', 'Қыздыру және ТЖС айдау кезінде жалғыз жұмыс істеуге бола ма?', 'May you work alone when heating or distilling flammable solvents?'),
    right: L('Нет, это запрещено', 'Жоқ, бұған тыйым салынған', 'No, it is forbidden'),
    wrong: L('Можно, если включена тяга', 'Тартпа қосулы болса, болады', 'Yes, if the fume hood is on') },
  { q: L('Что нужно знать до начала любого эксперимента?', 'Кез келген тәжірибе алдында нені білу керек?', 'What must you know before starting any experiment?'),
    right: L('Где огнетушитель, аптечка, аварийный душ, фонтанчик для глаз, ящик с песком и запасные выходы', 'Өрт сөндіргіш, дәрі қобдишасы, апаттық душ, көз жуғыш фонтанша, құм жәшігі және қосалқы шығулар қайда екенін', 'Where the extinguisher, first-aid kit, safety shower, eyewash, sand box and emergency exits are'),
    wrong: L('Только номер своего рабочего места', 'Тек өз жұмыс орнының нөмірін', 'Only the number of your bench') },
  { q: L('Пострадавший надышался паров. Первое действие?', 'Зардап шегуші буларды жұтып қойды. Алғашқы әрекет?', 'Someone has inhaled vapours. The first action?'),
    right: L('Вывести на свежий воздух и ослабить стесняющую одежду', 'Таза ауаға шығарып, қысып тұрған киімді босату', 'Take them into fresh air and loosen tight clothing'),
    wrong: L('Дать выпить воды и оставить на месте', 'Су ішкізіп, орнында қалдыру', 'Give water and leave them where they are') },
  { q: L('Где держать сумки и личные вещи?', 'Сөмкелер мен жеке заттарды қайда ұстау керек?', 'Where should bags and personal items be kept?'),
    right: L('Не на рабочем месте — оно должно быть свободно', 'Жұмыс орнында емес — ол бос болуы керек', 'Not at the bench — it must be kept clear'),
    wrong: L('На краю рабочего стола', 'Жұмыс үстелінің шетінде', 'On the edge of the bench') },
];

const Q_LAB67 = [
  { q: L('Почему карбоксильная группа направляет нитрогруппу в мета-положение?', 'Неліктен карбоксил тобы нитротопты мета-жағдайға бағыттайды?', 'Why does the carboxyl group direct the nitro group to the meta position?'),
    right: L('Она дезактивирует кольцо (−I, −M); при орто- и пара-атаке заряд σ-комплекса оказывается на атоме C, связанном с –COOH', 'Ол сақинаны дезактивтейді (−I, −M); орто- және пара-шабуылда σ-кешеннің заряды –COOH-пен байланысқан C атомында болады', 'It deactivates the ring (−I, −M); ortho/para attack puts the σ-complex charge on the carbon bearing –COOH'),
    wrong: L('Она активирует кольцо за счёт +M-эффекта', 'Ол +M-эффект арқылы сақинаны белсендіреді', 'It activates the ring by a +M effect') },
  { q: L('Какова роль концентрированной H₂SO₄ в нитрующей смеси?', 'Нитрлеуші қоспадағы концентрлі H₂SO₄ рөлі қандай?', 'What is the role of concentrated H₂SO₄ in the nitrating mixture?'),
    right: L('Генерирует ион нитрония NO₂⁺ из HNO₃', 'HNO₃-тен нитроний ионын NO₂⁺ түзеді', 'It generates the nitronium ion NO₂⁺ from HNO₃'),
    wrong: L('Окисляет бензойную кислоту', 'Бензой қышқылын тотықтырады', 'It oxidises benzoic acid') },
  { q: L('Почему при нитровании температура должна быть не выше 10 °C?', 'Неліктен нитрлеу кезінде температура 10 °C-тан аспауы керек?', 'Why must the nitration be kept below 10 °C?'),
    right: L('Чтобы подавить динитрование и окислительные побочные реакции', 'Динитрлеу мен тотығу жанама реакцияларын басу үшін', 'To suppress dinitration and oxidative side reactions'),
    wrong: L('Чтобы ускорить реакцию', 'Реакцияны жылдамдату үшін', 'To speed up the reaction') },
  { q: L('Как доказать, что продукт — карбоновая кислота, а не фенол?', 'Өнім фенол емес, карбон қышқылы екенін қалай дәлелдеуге болады?', 'How can you show that the product is a carboxylic acid and not a phenol?'),
    right: L('С раствором NaHCO₃ выделяется CO₂', 'NaHCO₃ ерітіндісімен CO₂ бөлінеді', 'It releases CO₂ from NaHCO₃ solution'),
    wrong: L('Он растворяется в NaOH', 'Ол NaOH-та ериді', 'It dissolves in NaOH') },
  { q: L('Расположите кислоты по возрастанию кислотности.', 'Қышқылдарды қышқылдығының артуы бойынша орналастырыңыз.', 'Arrange the acids in order of increasing acidity.'),
    right: L('п-метилбензойная < бензойная < м-нитробензойная < о-нитробензойная', 'п-метилбензой < бензой < м-нитробензой < о-нитробензой', 'p-methylbenzoic < benzoic < m-nitrobenzoic < o-nitrobenzoic'),
    wrong: L('о-нитробензойная < м-нитробензойная < бензойная < п-метилбензойная', 'о-нитробензой < м-нитробензой < бензой < п-метилбензой', 'o-nitrobenzoic < m-nitrobenzoic < benzoic < p-methylbenzoic') },
  { q: L('Что означает низкая и растянутая температура плавления продукта?', 'Өнімнің төмен әрі созылыңқы балқу температурасы нені білдіреді?', 'What does a low and broad melting range of the product indicate?'),
    right: L('Продукт загрязнён — нужна повторная перекристаллизация', 'Өнім ластанған — қайта кристалдау қажет', 'The product is impure — a second recrystallisation is needed'),
    wrong: L('Продукт чистый и сухой', 'Өнім таза және құрғақ', 'The product is pure and dry') },
  { q: L('Зачем реакционную смесь в конце выливают на лёд?', 'Неліктен реакция қоспасын соңында мұзға құяды?', 'Why is the reaction mixture poured onto ice at the end?'),
    right: L('Кислота разбавляется с охлаждением, и продукт выпадает в осадок', 'Қышқыл суыта отырып сұйылтылады да, өнім тұнбаға түседі', 'The acid is diluted with cooling and the product precipitates'),
    wrong: L('Чтобы растворить продукт', 'Өнімді еріту үшін', 'To dissolve the product') },
];

function answers(bank, okFlags) {
  return okFlags.map((ok, i) => {
    const q = bank[i % bank.length];
    return { q: q.q, chosen: ok ? q.right : q.wrong, correct: q.right, ok };
  });
}

/* ---------- протоколы работы № 6–7 ---------- */

const TH = 2.74; // теоретический выход из 2,0 г бензойной кислоты, г (методичка)
const sev = { minor: 0.5, major: 1, critical: 2, safety: 1 };

function fmt(x, d, lang) {
  const s = Number(x).toFixed(d);
  return lang === 'en' ? s : s.replace('.', ',');
}

function journal67(mass, mp, extra = []) {
  return [
    { t: L('День 1 · 09:00', 'Күн 1 · 09:00', 'Day 1 · 09:00'), kind: 'act', text: L('Надеты халат, очки, перчатки; включена тяга вытяжного шкафа', 'Халат, көзілдірік, қолғап киілді; тартпа шкаф қосылды', 'Lab coat, goggles and gloves on; fume hood switched on') },
    { t: L('День 1 · 09:08', 'Күн 1 · 09:08', 'Day 1 · 09:08'), kind: 'act', text: L('Взвешено 2,00 г бензойной кислоты (16,4 ммоль) в конической колбе 50 мл', '50 мл конустық колбада 2,00 г бензой қышқылы (16,4 ммоль) өлшенді', '2.00 g of benzoic acid (16.4 mmol) weighed into a 50 mL conical flask') },
    { t: L('День 1 · 09:14', 'Күн 1 · 09:14', 'Day 1 · 09:14'), kind: 'act', text: L('Прилито 5 мл конц. H₂SO₄, колба охлаждена в ледяно-солевой бане до 3 °C', '5 мл конц. H₂SO₄ құйылды, колба мұзды-тұзды моншада 3 °C-қа дейін суытылды', '5 mL of conc. H₂SO₄ added; flask cooled in an ice–salt bath to 3 °C') },
    { t: L('День 1 · 09:22', 'Күн 1 · 09:22', 'Day 1 · 09:22'), kind: 'act', text: L('Нитрующая смесь: 1,5 мл HNO₃ прилито к 1,5 мл H₂SO₄ при охлаждении', 'Нитрлеуші қоспа: 1,5 мл HNO₃ суыта отырып 1,5 мл H₂SO₄-ке құйылды', 'Nitrating mixture: 1.5 mL HNO₃ added to 1.5 mL H₂SO₄ with cooling') },
    ...extra,
    { t: L('День 1 · 10:05', 'Күн 1 · 10:05', 'Day 1 · 10:05'), kind: 'obs', text: L('При выливании на лёд выпал белый осадок', 'Мұзға құйғанда ақ тұнба түсті', 'A white precipitate formed on pouring onto ice') },
    { t: L('День 2 · 09:10', 'Күн 2 · 09:10', 'Day 2 · 09:10'), kind: 'act', text: L(`Масса сухого продукта ${fmt(mass, 2, 'ru')} г`, `Құрғақ өнімнің массасы ${fmt(mass, 2, 'kk')} г`, `Mass of dry product ${fmt(mass, 2, 'en')} g`) },
    { t: L('День 2 · 09:40', 'Күн 2 · 09:40', 'Day 2 · 09:40'), kind: 'obs', text: L(`Т. пл. ${fmt(mp[0], 1, 'ru')}–${fmt(mp[1], 1, 'ru')} °C`, `Балқу т. ${fmt(mp[0], 1, 'kk')}–${fmt(mp[1], 1, 'kk')} °C`, `M.p. ${fmt(mp[0], 1, 'en')}–${fmt(mp[1], 1, 'en')} °C`) },
  ];
}

function results67(mass, mp) {
  const y = (mass / TH) * 100;
  return {
    mass: { label: L('Масса м-нитробензойной кислоты', 'м-Нитробензой қышқылының массасы', 'Mass of m-nitrobenzoic acid'), value: mass, unit: L('г', 'г', 'g'), digits: 2 },
    theory: { label: L('Теоретический выход', 'Теориялық шығым', 'Theoretical yield'), value: TH, unit: L('г', 'г', 'g'), digits: 2 },
    yield: { label: L('Выход', 'Шығым', 'Yield'), value: y, unit: L('%', '%', '%'), digits: 1 },
    mp: { label: L('Т. пл. (лит. 140–141 °C)', 'Балқу т. (әдеб. 140–141 °C)', 'M.p. (lit. 140–141 °C)'), value: L(`${fmt(mp[0], 1, 'ru')}–${fmt(mp[1], 1, 'ru')} °C`, `${fmt(mp[0], 1, 'kk')}–${fmt(mp[1], 1, 'kk')} °C`, `${fmt(mp[0], 1, 'en')}–${fmt(mp[1], 1, 'en')} °C`) },
    nahco3: { label: L('Проба с NaHCO₃', 'NaHCO₃ сынамасы', 'NaHCO₃ test'), value: L('выделение CO₂ (вскипание)', 'CO₂ бөлінеді (көпіршиді)', 'CO₂ evolved (effervescence)') },
  };
}

function assignment67(mass, freeOk) {
  const y = (mass / TH) * 100;
  return [
    { task: L('Теоретический выход из 2,0 г бензойной кислоты, г', '2,0 г бензой қышқылынан теориялық шығым, г', 'Theoretical yield from 2.0 g of benzoic acid, g'), answer: L('2,74', '2,74', '2.74'), ok: true },
    { task: L('Практический выход, %', 'Практикалық шығым, %', 'Percent yield, %'), answer: L(fmt(y, 1, 'ru'), fmt(y, 1, 'kk'), fmt(y, 1, 'en')), ok: true },
    { task: L('Главный продукт нитрования метилбензоата', 'Метилбензоатты нитрлеудің негізгі өнімі', 'Main product of nitration of methyl benzoate'), answer: L('метил-3-нитробензоат', 'метил-3-нитробензоат', 'methyl 3-nitrobenzoate'), ok: true },
    { task: L('Главный продукт нитрования ацетанилида', 'Ацетанилидті нитрлеудің негізгі өнімі', 'Main product of nitration of acetanilide'), answer: freeOk ? L('4-нитроацетанилид', '4-нитроацетанилид', '4-nitroacetanilide') : L('3-нитроацетанилид', '3-нитроацетанилид', '3-nitroacetanilide'), ok: freeOk },
    { task: L('Механизм нитрования бензойной кислоты (свободный ответ)', 'Бензой қышқылын нитрлеу механизмі (еркін жауап)', 'Mechanism of nitration of benzoic acid (free answer)'),
      answer: L('HNO₃ + 2H₂SO₄ → NO₂⁺ + H₃O⁺ + 2HSO₄⁻; NO₂⁺ атакует мета-положение, σ-комплекс (три резонансные структуры, заряд не на C–COOH) теряет H⁺.',
        'HNO₃ + 2H₂SO₄ → NO₂⁺ + H₃O⁺ + 2HSO₄⁻; NO₂⁺ мета-жағдайға шабуыл жасайды, σ-кешен (үш резонанстық құрылым, заряд C–COOH-та емес) H⁺ жоғалтады.',
        'HNO₃ + 2H₂SO₄ → NO₂⁺ + H₃O⁺ + 2HSO₄⁻; NO₂⁺ attacks the meta position; the σ-complex (three resonance structures, no charge on C–COOH) loses H⁺.'), ok: null },
  ];
}

function remark(stepRu, stepKk, stepEn, severity, text) {
  return { step: L(stepRu, stepKk, stepEn), severity, points: sev[severity], text };
}

const LAB67_TITLE = L('Карбоновые кислоты. Получение м-нитробензойной кислоты', 'Карбон қышқылдары. м-Нитробензой қышқылын алу', 'Carboxylic acids. Preparation of m-nitrobenzoic acid');

function reportText(st, rep) {
  const out = {};
  for (const lang of ['ru', 'kk', 'en']) {
    const T = (o) => (o && typeof o === 'object' ? o[lang] : o);
    const head = { ru: 'Лабораторная работа № 6–7', kk: '№ 6–7 зертханалық жұмыс', en: 'Laboratory work No. 6–7' }[lang];
    const lines = [
      head + '. ' + T(LAB67_TITLE),
      { ru: 'Студент', kk: 'Студент', en: 'Student' }[lang] + ': ' + T(st.name) + '   ' + { ru: 'Группа', kk: 'Топ', en: 'Group' }[lang] + ': ' + st.group,
      '',
      { ru: 'Опыт 1. Нитрование бензойной кислоты', kk: '1-тәжірибе. Бензой қышқылын нитрлеу', en: 'Experiment 1. Nitration of benzoic acid' }[lang],
      'C₆H₅COOH + HNO₃ → m-O₂N–C₆H₄–COOH + H₂O (H₂SO₄, 0–10 °C)',
      ...Object.values(rep.results).map((r) => '  ' + T(r.label) + ': ' + (typeof r.value === 'number' ? fmt(r.value, r.digits ?? 2, lang) + ' ' + T(r.unit) : T(r.value))),
      '',
      { ru: 'Опыт 2. Кислотные свойства продукта', kk: '2-тәжірибе. Өнімнің қышқылдық қасиеттері', en: 'Experiment 2. Acidic properties of the product' }[lang],
      'm-O₂N–C₆H₄–COOH + NaHCO₃ → m-O₂N–C₆H₄–COONa + CO₂↑ + H₂O',
      '',
      { ru: 'Опыт 3. Температура плавления', kk: '3-тәжірибе. Балқу температурасы', en: 'Experiment 3. Melting point' }[lang],
      '  ' + T(rep.results.mp.value),
      '',
      { ru: 'Замечания', kk: 'Ескертулер', en: 'Remarks' }[lang] + ':',
      ...(rep.remarks.length ? rep.remarks.map((r) => '  • ' + T(r.step) + ' — ' + T(r.text) + ' (' + fmt(r.points, 1, lang) + ')') : ['  —']),
      '',
      { ru: 'Оценка', kk: 'Баға', en: 'Grade' }[lang] + ': ' + rep.grade + '   ' + { ru: 'штрафных баллов', kk: 'айып ұпайы', en: 'penalty points' }[lang] + ': ' + fmt(rep.points, 2, lang),
    ];
    out[lang] = lines.join('\n');
  }
  return out;
}

/* ---------- сборка набора данных ---------- */

export function buildDemoData(now = Date.now()) {
  const day = 86400000;
  const h = 3600000;
  const S = Object.fromEntries(STUDENTS.map((s) => [s.id, s]));
  let n = 0;
  const id = (p) => `${p}-${++n}`;
  const requests = [];
  const reports = [];
  const req = (sid, kind, lab, okFlags, status, ago, extra = {}) => {
    const s = S[sid];
    const total = kind === 'briefing' ? 10 : kind === 'access' ? null : 5;
    const pass = kind === 'briefing' ? 8 : kind === 'access' ? null : 4;
    const ans = kind === 'access' ? [] : answers(kind === 'briefing' ? Q_BRIEF : Q_LAB67, okFlags);
    const score = kind === 'access' ? null : okFlags.filter(Boolean).length;
    requests.push({
      id: id('req'), createdAt: now - ago, kind, lab, status, name: s.name, group: s.group, deviceId: s.id,
      attempt: kind === 'access' ? null : extra.attempt || 1, score, total, pass, lang: s.lang,
      comment: extra.comment || '', decidedAt: status === 'pending' ? null : now - ago + (extra.decideAfter || 20 * 60000),
      startedAt: now - ago - 15 * 60000, finishedAt: now - ago, answers: ans,
    });
  };
  const T = true, F = false;

  // доступ к сайту
  for (const sid of ['demo-1', 'demo-2', 'demo-3', 'demo-4', 'demo-5', 'demo-6', 'demo-8', 'demo-9']) req(sid, 'access', '', [], 'approved', 9 * day + 2 * h, { decideAfter: 40 * 60000 });
  req('demo-7', 'access', '', [], 'pending', 35 * 60000);

  // инструктаж по ТБ (10 вопросов, порог 8)
  req('demo-1', 'briefing', 'lab-00', [T, T, T, T, T, T, T, T, T, T], 'approved', 8 * day);
  req('demo-2', 'briefing', 'lab-00', [T, T, T, F, T, T, T, T, T, T], 'approved', 8 * day - h);
  req('demo-3', 'briefing', 'lab-00', [T, T, F, T, T, T, T, T, T, T], 'approved', 8 * day - 2 * h);
  req('demo-4', 'briefing', 'lab-00', [T, F, T, T, F, T, F, T, T, T], 'denied', 8 * day - 3 * h, { comment: L('Повторите разделы 3 и 11 правил ТБ', 'ҚТ ережелерінің 3 және 11 бөлімдерін қайталаңыз', 'Revise sections 3 and 11 of the safety rules') });
  req('demo-4', 'briefing', 'lab-00', [T, T, T, T, T, T, T, T, F, T], 'pending', 2 * h, { attempt: 2 });
  req('demo-5', 'briefing', 'lab-00', [T, T, T, T, T, T, T, F, T, T], 'approved', 7 * day);
  req('demo-6', 'briefing', 'lab-00', [T, T, T, T, T, T, T, T, T, T], 'approved', 7 * day - h);
  req('demo-8', 'briefing', 'lab-00', [T, T, T, T, F, T, T, T, T, T], 'approved', 3 * day);
  req('demo-9', 'briefing', 'lab-00', [T, T, T, T, T, T, T, T, T, F], 'approved', 3 * day - h);

  // допуск к работе 6–7 (5 вопросов, порог 4)
  req('demo-1', 'admission', 'lab-06-07', [T, T, T, T, T], 'approved', 6 * day, { comment: '' });
  req('demo-2', 'admission', 'lab-06-07', [T, F, T, T, T], 'approved', 6 * day - h);
  req('demo-3', 'admission', 'lab-06-07', [T, T, F, T, T], 'approved', 6 * day - 2 * h);
  req('demo-5', 'admission', 'lab-06-07', [F, T, F, T, F], 'denied', 5 * day, { comment: L('Повторите теорию: роль H₂SO₄ и ориентацию в бензойной кислоте', 'Теорияны қайталаңыз: H₂SO₄ рөлі және бензой қышқылындағы бағдарлау', 'Revise the theory: the role of H₂SO₄ and orientation in benzoic acid') });
  req('demo-5', 'admission', 'lab-06-07', [T, T, T, F, T], 'approved', 4 * day, { attempt: 2 });
  req('demo-6', 'admission', 'lab-06-07', [T, T, T, T, T], 'approved', 5 * day - 3 * h);
  req('demo-8', 'admission', 'lab-06-07', [T, T, F, T, T], 'pending', 50 * 60000);
  req('demo-9', 'admission', 'lab-06-07', [T, T, T, T, T], 'pending', 20 * 60000);

  const rep = (sid, ago, mass, mp, remarks, hints, mode, extra = {}) => {
    const s = S[sid];
    const points = remarks.reduce((a, r) => a + r.points, 0) + hints.reduce((a, x) => a + (x.level === 2 ? 0.25 : x.level === 3 ? 0.5 : 0), 0);
    const grade = points <= 1 ? 5 : points <= 3 ? 4 : points <= 5.5 ? 3 : 2;
    const r = {
      id: id('rep'), createdAt: now - ago, lab: 'lab-06-07', name: s.name, group: s.group, deviceId: s.id, attempt: 1,
      mode, lang: s.lang, grade, points, teacherGrade: extra.teacherGrade ?? null, teacherComment: extra.teacherComment || '',
      gradedAt: extra.teacherGrade ? now - ago + 3 * h : null, finishedAt: now - ago,
    };
    const data = {
      lab: 'lab-06-07', attempt: 1, mode, lang: s.lang, grade, points, remarks, hints,
      results: results67(mass, mp), assignment: assignment67(mass, extra.assignOk !== false),
      journal: journal67(mass, mp, extra.journal || []), finishedAt: now - ago,
      student: { name: s.name, group: s.group, deviceId: s.id },
    };
    data.reportText = reportText(s, data);
    reports.push({ ...r, _data: data });
  };

  rep('demo-1', 5 * day, 2.08, [139.5, 140.5], [
    remark('Опыт 3, шаг 2', '3-тәжірибе, 2-қадам', 'Experiment 3, step 2', 'minor', L('Капилляр заполнен на 5 мм вместо 2–3 мм', 'Капилляр 2–3 мм орнына 5 мм толтырылды', 'Capillary filled to 5 mm instead of 2–3 mm')),
  ], [], 'train');
  rep('demo-2', 5 * day - 2 * h, 1.71, [136.0, 139.0], [
    remark('Опыт 1, шаг 3', '1-тәжірибе, 3-қадам', 'Experiment 1, step 3', 'major', L('Нитрующая смесь прибавлена слишком быстро: температура поднялась до 14 °C — побочные продукты, выход ниже', 'Нитрлеуші қоспа тым тез қосылды: температура 14 °C-қа көтерілді — жанама өнімдер, шығым төмен', 'Nitrating mixture added too fast: the temperature rose to 14 °C — by-products, lower yield')),
    remark('Опыт 1, шаг 6', '1-тәжірибе, 6-қадам', 'Experiment 1, step 6', 'minor', L('Осадок промыт тёплой, а не ледяной водой', 'Тұнба мұздай емес, жылы сумен жуылды', 'The solid was washed with warm instead of ice-cold water')),
  ], [{ step: L('Опыт 1, шаг 3', '1-тәжірибе, 3-қадам', 'Experiment 1, step 3'), level: 2 }, { step: L('Опыт 3, шаг 1', '3-тәжірибе, 1-қадам', 'Experiment 3, step 1'), level: 3 }], 'train', {
    journal: [{ t: L('День 1 · 09:31', 'Күн 1 · 09:31', 'Day 1 · 09:31'), kind: 'warn', text: L('Температура 14 °C — выше допустимых 10 °C', 'Температура 14 °C — рұқсат етілген 10 °C-тан жоғары', 'Temperature 14 °C — above the allowed 10 °C') }],
  });
  rep('demo-3', 4 * day, 1.32, [134.0, 138.0], [
    remark('Опыт 1, шаг 5', '1-тәжірибе, 5-қадам', 'Experiment 1, step 5', 'critical', L('Вода прилита к кислой реакционной смеси вместо выливания смеси на лёд — выброс кислоты; опыт перезапущен с контрольной точки', 'Реакция қоспасын мұзға құюдың орнына қышқыл қоспаға су құйылды — қышқыл шашырады; тәжірибе бақылау нүктесінен қайта басталды', 'Water was added to the acid mixture instead of pouring the mixture onto ice — acid spattered; restarted from a checkpoint')),
    remark('Опыт 1, шаг 7', '1-тәжірибе, 7-қадам', 'Experiment 1, step 7', 'major', L('Для перекристаллизации взято слишком много воды — часть продукта осталась в маточном растворе', 'Қайта кристалдауға тым көп су алынды — өнімнің бір бөлігі аналық ерітіндіде қалды', 'Too much water used for recrystallisation — part of the product stayed in the mother liquor')),
    remark('Уборка', 'Жинау', 'Clean-up', 'safety', L('Кислый фильтрат вылит в раковину, а не в контейнер для кислых отходов', 'Қышқыл фильтрат қышқыл қалдықтар контейнеріне емес, раковинаға төгілді', 'Acidic filtrate poured into the sink instead of the acid waste container')),
  ], [{ step: L('Опыт 1, шаг 7', '1-тәжірибе, 7-қадам', 'Experiment 1, step 7'), level: 3 }], 'train', {
    assignOk: false,
    journal: [{ t: L('День 1 · 09:58', 'Күн 1 · 09:58', 'Day 1 · 09:58'), kind: 'warn', text: L('Аварийная ситуация: вода в кислоту', 'Апаттық жағдай: қышқылға су', 'Emergency: water into acid') }],
  });
  rep('demo-6', 3 * day, 2.15, [140.0, 141.0], [
    remark('Опыт 2, шаг 3', '2-тәжірибе, 3-қадам', 'Experiment 2, step 3', 'major', L('Перед FeCl₃ раствор не нейтрализован по индикаторной бумаге — проба повторена', 'FeCl₃ алдында ерітінді индикатор қағазымен бейтараптандырылмады — сынама қайталанды', 'Solution not neutralised with indicator paper before FeCl₃ — test repeated')),
  ], [], 'exam');
  rep('demo-5', 2 * day, 1.95, [138.5, 140.5], [
    remark('Опыт 1, шаг 1', '1-тәжірибе, 1-қадам', 'Experiment 1, step 1', 'safety', L('Начала работу с кислотой до включения тяги', 'Тартпаны қоспай тұрып қышқылмен жұмысты бастады', 'Started handling the acid before switching on the fume hood')),
    remark('Опыт 1, шаг 4', '1-тәжірибе, 4-қадам', 'Experiment 1, step 4', 'major', L('Выдержка в бане сокращена до 5 мин — часть бензойной кислоты не прореагировала', 'Моншада ұстау 5 минутқа дейін қысқартылды — бензой қышқылының бір бөлігі әрекеттеспеді', 'Holding time in the bath cut to 5 min — some benzoic acid did not react')),
    remark('Опыт 3, шаг 1', '3-тәжірибе, 1-қадам', 'Experiment 3, step 1', 'minor', L('Нагрев вблизи т. пл. 4 °C/мин вместо 1–2 °C/мин', 'Балқу т. маңында қыздыру 1–2 °C/мин орнына 4 °C/мин', 'Heating near the m.p. at 4 °C/min instead of 1–2 °C/min')),
  ], [{ step: L('Опыт 1, шаг 4', '1-тәжірибе, 4-қадам', 'Experiment 1, step 4'), level: 1 }], 'train', {
    teacherGrade: 5,
    teacherComment: L('Индивидуальное задание выполнено полностью, механизм записан верно', 'Жеке тапсырма толық орындалды, механизм дұрыс жазылды', 'Individual assignment complete; the mechanism is correct'),
  });

  const settings = {
    access: 'approved', notifyMode: 'daily', notifyEmail: 'teacher@example.com',
    labs: {},
  };
  for (const lab of ['lab-00', 'lab-06-07', 'lab-08', 'lab-09', 'lab-10', 'lab-11', 'lab-12', 'lab-13', 'lab-14', 'lab-15']) {
    settings.labs[lab] = { open: true, hints: true, autoAdmit: false };
  }
  settings.labs['lab-12'].hints = false;
  settings.labs['lab-15'].open = false;
  return { requests, reports, settings };
}

/* ---------- «сервер» в памяти ---------- */

const keyOf = (x) => x.deviceId;

function matrix(requests, reports, access) {
  const map = new Map();
  const get = (x) => {
    if (!map.has(keyOf(x))) map.set(keyOf(x), { key: keyOf(x), name: x.name, group: x.group, deviceId: x.deviceId, access: access === 'approved' ? 'none' : 'open', labs: {} });
    return map.get(keyOf(x));
  };
  for (const r of [...requests].sort((a, b) => a.createdAt - b.createdAt)) {
    const s = get(r);
    if (r.kind === 'access') { if (access === 'approved') s.access = r.status; continue; }
    const c = s.labs[r.lab] || (s.labs[r.lab] = { admission: null, score: null, total: null, grade: null, reports: 0 });
    Object.assign(c, { admission: r.status, score: r.score, total: r.total });
  }
  for (const p of [...reports].sort((a, b) => a.createdAt - b.createdAt)) {
    const s = get(p);
    const c = s.labs[p.lab] || (s.labs[p.lab] = { admission: null, score: null, total: null, grade: null, reports: 0 });
    c.reports += 1;
    c.grade = p.teacherGrade ?? p.grade;
  }
  return [...map.values()].sort((a, b) => String(a.group).localeCompare(b.group) || String(a.name.ru || a.name).localeCompare(String(b.name.ru || b.name)));
}

const strip = ({ _data, ...rest }) => rest;
const clone = (x) => JSON.parse(JSON.stringify(x));

/** Клиент с тем же интерфейсом, что createServerClient, но данные — в памяти. */
export function createDemoClient(now = Date.now()) {
  const db = buildDemoData(now);
  const handlers = {
    listRequests: () => ({ requests: [...db.requests].sort((a, b) => (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1) || b.createdAt - a.createdAt) }),
    decide: ({ id, status, comment }) => {
      const r = db.requests.find((x) => x.id === id);
      if (!r) throw Object.assign(new Error('not_found'), { code: 'not_found' });
      Object.assign(r, { status, comment: comment || '', decidedAt: Date.now() });
      return { id, status, decidedAt: r.decidedAt };
    },
    listReports: () => ({ reports: db.reports.map(strip).sort((a, b) => b.createdAt - a.createdAt) }),
    getReport: ({ id }) => {
      const r = db.reports.find((x) => x.id === id);
      if (!r) throw Object.assign(new Error('not_found'), { code: 'not_found' });
      return { report: strip(r), data: r._data };
    },
    setGrade: ({ id, grade, comment }) => {
      const r = db.reports.find((x) => x.id === id);
      if (!r) throw Object.assign(new Error('not_found'), { code: 'not_found' });
      r.teacherGrade = grade == null || grade === '' ? null : Number(grade);
      r.teacherComment = comment || '';
      r.gradedAt = r.teacherGrade == null ? null : Date.now();
      return { id, teacherGrade: r.teacherGrade, gradedAt: r.gradedAt };
    },
    getSettings: () => clone(db.settings),
    setSettings: (s) => {
      if (s.access !== undefined) db.settings.access = s.access === 'approved' ? 'approved' : 'all';
      if (s.notifyMode !== undefined) db.settings.notifyMode = s.notifyMode;
      if (s.notifyEmail !== undefined) db.settings.notifyEmail = s.notifyEmail;
      for (const id in s.labs || {}) db.settings.labs[id] = { ...db.settings.labs[id], ...s.labs[id] };
      return clone(db.settings);
    },
    listStudents: () => ({ access: db.settings.access, students: matrix(db.requests, db.reports, db.settings.access) }),
  };
  async function call(action, data = {}) {
    await new Promise((r) => setTimeout(r, 120)); // как будто сеть
    if (!handlers[action]) throw Object.assign(new Error(action), { code: 'bad_action' });
    return { ok: true, ...clone(handlers[action](data)) };
  }
  return { call, demo: true };
}
