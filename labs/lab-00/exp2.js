/** Этап 2. Средства индивидуальной защиты — раздел 3 и п. 2.3 правил ТБ. */
import { L } from '../../app/i18n.js';
import { stageResults } from './common.js';
import { avatar, scene } from './scene.js';

const sDress = {
  type: 'lab00-dress', id: 'dress',
  title: L('Оденьтесь для работы', 'Жұмысқа киініңіз', 'Get dressed for lab work'),
  instr: L('<p>Сегодня работа с концентрированными кислотами в вытяжном шкафу (как в работе 6–7). Студент пришёл с улицы: распущенные волосы, шарф, летняя обувь. Подготовьте студента к работе: в каждой строке выберите верный вариант. Фигура на стенде меняется.</p>',
    '<p>Бүгін тартпа шкафта концентрлі қышқылдармен жұмыс (6–7-жұмыстағыдай). Студент көшеден келді: шашы жайылған, мойнында шарф, жазғы аяқ киім. Оны жұмысқа дайындаңыз: әр жолда дұрыс нұсқаны таңдаңыз. Стендтегі бейне өзгереді.</p>',
    '<p>Today’s work is with concentrated acids in the fume hood (as in lab 6–7). The student has come in from the street: hair down, a scarf, summer shoes. Get them ready: choose the right option in every row. The figure on the bench changes.</p>'),
  need: L('Верный выбор во всех строках', 'Барлық жолда дұрыс таңдау', 'The right choice in every row'),
  start: { shoes: 'sandals', hair: 'loose', scarf: 'keep' },
  groups: [
    { id: 'coat', label: L('Халат (п. 3.1)', 'Халат (3.1-тармақ)', 'Lab coat (rule 3.1)'), options: [
      { id: 'cotton', ok: true, wear: { coat: 'cotton' }, label: L('Хлопчатобумажный халат', 'Мақта мата халат', 'Cotton lab coat'), log: L('Надет хлопчатобумажный халат', 'Мақта мата халат киілді', 'Cotton lab coat on') },
      { id: 'synth', wear: { coat: 'synth' }, label: L('Синтетический халат (полиэстер)', 'Синтетикалық халат (полиэстер)', 'Synthetic coat (polyester)'),
        remark: L('синтетический халат вместо хлопкового (п. 3.1)', 'мақта мата орнына синтетикалық халат (3.1-тармақ)', 'synthetic coat instead of cotton (rule 3.1)'),
        whatif: L('Синтетика при пожаре плавится и прилипает к коже, усиливая ожог. Хлопок обугливается, но не плавится и не прилипает — поэтому п. 3.1 требует хлопчатобумажный халат.', 'Синтетика өрт кезінде балқып, теріге жабысады да, күйікті күшейтеді. Мақта көмірленеді, бірақ балқымайды және жабыспайды — сондықтан 3.1-тармақ мақта мата халатты талап етеді.', 'Synthetic fabric melts and sticks to the skin in a fire, making the burn worse. Cotton chars but neither melts nor sticks — which is why rule 3.1 requires a cotton coat.') },
      { id: 'none', wear: { coat: 'none' }, label: L('Без халата', 'Халатсыз', 'No coat'),
        remark: L('работа без халата (п. 3.1)', 'халатсыз жұмыс (3.1-тармақ)', 'working without a coat (rule 3.1)'),
        whatif: L('Брызги кислоты попадут на одежду и кожу. В лаборатории халат носят постоянно.', 'Қышқыл шашырандылары киім мен теріге түседі. Зертханада халат үнемі киіледі.', 'Acid splashes land on clothes and skin. The coat is worn at all times in the lab.') },
    ] },
    { id: 'button', mark: 'coat', label: L('Халат застёгнут?', 'Халат түймеленген бе?', 'Is the coat buttoned?'), options: [
      { id: 'yes', ok: true, wear: { buttoned: true }, label: L('Застегнуть на все пуговицы', 'Барлық түймесін салу', 'Button it all the way'), log: L('Халат застёгнут', 'Халат түймеленді', 'Coat buttoned') },
      { id: 'no', wear: { buttoned: false }, label: L('Оставить расстёгнутым — так удобнее', 'Түймесін салмау — ыңғайлырақ', 'Leave it open — more comfortable'),
        remark: L('халат не застёгнут (п. 3.1)', 'халат түймеленбеген (3.1-тармақ)', 'coat not buttoned (rule 3.1)'),
        whatif: L('Расстёгнутые полы цепляют посуду и не защищают одежду на груди и коленях — туда и попадают брызги.', 'Түймеленбеген етектер ыдысқа ілінеді және кеуде мен тізедегі киімді қорғамайды — шашырандылар дәл сол жерге түседі.', 'Open flaps catch on glassware and leave the chest and knees unprotected — exactly where splashes land.') },
    ] },
    { id: 'eyes', label: L('Глаза (п. 3.2)', 'Көз (3.2-тармақ)', 'Eyes (rule 3.2)'), options: [
      { id: 'goggles', ok: true, wear: { eyes: 'goggles' }, label: L('Защитные очки', 'Қорғаныс көзілдірігі', 'Safety goggles'), log: L('Надеты защитные очки', 'Қорғаныс көзілдірігі киілді', 'Safety goggles on') },
      { id: 'lenses', wear: { eyes: 'lenses' }, label: L('Контактные линзы, без очков', 'Көзілдіріксіз, контакт линзалары', 'Contact lenses, no goggles'),
        remark: L('контактные линзы без защитных очков (п. 3.2)', 'қорғаныс көзілдірігінсіз контакт линзалары (3.2-тармақ)', 'contact lenses without goggles (rule 3.2)'),
        whatif: L('Под линзами скапливаются пары веществ, а брызги кислоты попадают прямо в глаз. Линзы не рекомендуются, очки обязательны.', 'Линза астында заттардың булары жиналады, ал қышқыл шашырандылары тікелей көзге түседі. Линзалар ұсынылмайды, көзілдірік міндетті.', 'Vapour collects under the lenses and acid splashes go straight into the eye. Lenses are not recommended; goggles are compulsory.') },
      { id: 'glasses', wear: { eyes: 'glasses' }, label: L('Обычные очки для зрения', 'Көру үшін кәдімгі көзілдірік', 'Ordinary prescription glasses'),
        remark: L('обычные очки вместо защитных (п. 3.2)', 'қорғаныс көзілдірігінің орнына кәдімгі көзілдірік (3.2-тармақ)', 'ordinary glasses instead of safety goggles (rule 3.2)'),
        whatif: L('Обычные очки открыты сбоку, сверху и снизу — брызги и пары попадают в глаз. Защитные очки надевают поверх или подбирают с диоптриями.', 'Кәдімгі көзілдірік бүйірінен, үстінен және астынан ашық — шашырандылар мен булар көзге түседі. Қорғаныс көзілдірігін үстінен киеді немесе диоптриялысын таңдайды.', 'Ordinary glasses are open at the sides, top and bottom — splashes and vapour reach the eye. Safety goggles go over them, or prescription safety glasses are used.') },
    ] },
    { id: 'gloves', label: L('Перчатки (п. 3.3)', 'Қолғап (3.3-тармақ)', 'Gloves (rule 3.3)'), options: [
      { id: 'nitrile', ok: true, wear: { gloves: 'nitrile' }, label: L('Нитриловые химически стойкие', 'Химиялық төзімді нитрил', 'Chemical-resistant nitrile'), log: L('Надеты нитриловые перчатки', 'Нитрил қолғаптар киілді', 'Nitrile gloves on') },
      { id: 'cloth', wear: { gloves: 'cloth' }, label: L('Хлопчатобумажные (тканевые)', 'Мақта мата (матадан)', 'Cotton (fabric)'),
        remark: L('тканевые перчатки вместо химически стойких (п. 3.3)', 'химиялық төзімдінің орнына мата қолғап (3.3-тармақ)', 'fabric gloves instead of chemical-resistant ones (rule 3.3)'),
        whatif: L('Ткань впитывает кислоту и держит её у кожи — ожог будет сильнее, чем без перчаток.', 'Мата қышқылды сіңіріп, оны тері жанында ұстайды — күйік қолғапсыздан да ауыр болады.', 'Fabric soaks up the acid and holds it against the skin — the burn is worse than with no gloves.') },
      { id: 'bare', wear: { gloves: 'none' }, label: L('Без перчаток', 'Қолғапсыз', 'No gloves'),
        remark: L('работа с концентрированными кислотами без перчаток (п. 3.3)', 'концентрлі қышқылдармен қолғапсыз жұмыс (3.3-тармақ)', 'handling concentrated acids without gloves (rule 3.3)'),
        whatif: L('Капля концентрированной серной кислоты на коже — химический ожог за секунды.', 'Терідегі концентрлі күкірт қышқылының бір тамшысы — бірнеше секундта химиялық күйік.', 'One drop of concentrated sulfuric acid on the skin is a chemical burn within seconds.') },
    ] },
    { id: 'shoes', label: L('Обувь (п. 3.4)', 'Аяқ киім (3.4-тармақ)', 'Footwear (rule 3.4)'), options: [
      { id: 'closed', ok: true, wear: { shoes: 'closed' }, label: L('Закрытая обувь', 'Жабық аяқ киім', 'Closed shoes'), log: L('Закрытая обувь', 'Жабық аяқ киім', 'Closed shoes on') },
      { id: 'sandals', wear: { shoes: 'sandals' }, label: L('Сандалии', 'Сандал', 'Sandals'),
        remark: L('открытая обувь (п. 3.4)', 'ашық аяқ киім (3.4-тармақ)', 'open footwear (rule 3.4)'),
        whatif: L('Пролитый реактив и осколки стекла попадают прямо на ногу.', 'Төгілген реактив пен шыны сынықтары тікелей аяққа түседі.', 'Spilled reagent and broken glass land directly on the foot.') },
      { id: 'heels', wear: { shoes: 'heels' }, label: L('Туфли на высоком каблуке', 'Биік өкшелі туфли', 'High heels'),
        remark: L('обувь на высоком каблуке (п. 3.4)', 'биік өкшелі аяқ киім (3.4-тармақ)', 'high-heeled shoes (rule 3.4)'),
        whatif: L('На каблуке легко оступиться с посудой в руках или при эвакуации.', 'Өкшемен қолда ыдыс бар кезде немесе эвакуация кезінде сүрініп кету оңай.', 'In heels it is easy to stumble while carrying glassware or during an evacuation.') },
    ] },
    { id: 'hair', label: L('Волосы (п. 2.3)', 'Шаш (2.3-тармақ)', 'Hair (rule 2.3)'), options: [
      { id: 'tied', ok: true, wear: { hair: 'tied' }, label: L('Убрать, собрать в пучок', 'Жинап, түйіп қою', 'Tie it back in a bun'), log: L('Волосы убраны', 'Шаш жиналды', 'Hair tied back') },
      { id: 'loose', wear: { hair: 'loose' }, label: L('Оставить распущенными', 'Жайып қою', 'Leave it down'),
        remark: L('длинные волосы не убраны (п. 2.3)', 'ұзын шаш жиналмаған (2.3-тармақ)', 'long hair not tied back (rule 2.3)'),
        whatif: L('Волосы могут загореться от плитки или спиртовки, попасть в реактив, затянуться в мешалку.', 'Шаш плитадан немесе спирт шамынан жануы, реактивке тиюі, араластырғышқа оралуы мүмкін.', 'Hair can catch fire from a hot plate or spirit lamp, dip into a reagent or get caught in a stirrer.') },
    ] },
    { id: 'scarf', label: L('Шарф и украшения (п. 2.3)', 'Шарф пен әшекейлер (2.3-тармақ)', 'Scarf and jewellery (rule 2.3)'), options: [
      { id: 'off', ok: true, wear: { scarf: false }, label: L('Снять шарф и свисающие украшения', 'Шарф пен салбыраған әшекейлерді шешу', 'Take off the scarf and dangling jewellery'), log: L('Шарф и свисающие украшения сняты', 'Шарф пен салбыраған әшекейлер шешілді', 'Scarf and dangling jewellery removed') },
      { id: 'keep', wear: { scarf: true }, label: L('Оставить шарф — в лаборатории прохладно', 'Шарфты қалдыру — зертхана салқын', 'Keep the scarf — the lab is cold'),
        remark: L('свисающий шарф (п. 2.3)', 'салбыраған шарф (2.3-тармақ)', 'dangling scarf (rule 2.3)'),
        whatif: L('Свободный конец шарфа задевает посуду, опускается в реактивы и загорается от нагревателя.', 'Шарфтың бос ұшы ыдысқа тиеді, реактивке түседі және қыздырғыштан жанады.', 'The loose end of the scarf knocks glassware, dips into reagents and catches fire on a heater.') },
    ] },
  ],
  doneText: L('Студент готов к работе.', 'Студент жұмысқа дайын.', 'The student is ready for work.'),
  onLeave(S, ctx) { ctx.log(L('СИЗ: халат хлопковый застёгнут, защитные очки, нитриловые перчатки, закрытая обувь, волосы убраны', 'ЖҚҚ: мақта мата халат түймеленген, қорғаныс көзілдірігі, нитрил қолғаптар, жабық аяқ киім, шаш жиналған', 'PPE: cotton coat buttoned, safety goggles, nitrile gloves, closed shoes, hair tied back'), 'obs'); },
};

const sQuiz = {
  type: 'quiz', id: 'q2',
  title: L('Когда нужны перчатки', 'Қолғап қашан қажет', 'When gloves are needed'),
  instr: L('<p>Химически стойкие перчатки (нитриловые или бутилкаучуковые — в зависимости от реактива) обязательны не всегда, а при определённых работах (п. 3.3). Ответьте на вопросы.</p>', '<p>Химиялық төзімді қолғаптар (реактивке байланысты нитрил немесе бутилкаучук) әрдайым емес, белгілі бір жұмыстарда міндетті (3.3-тармақ). Сұрақтарға жауап беріңіз.</p>', '<p>Chemical-resistant gloves (nitrile or butyl rubber, depending on the reagent) are compulsory for certain kinds of work (rule 3.3). Answer the questions.</p>'),
  need: L('Ответьте на все вопросы', 'Барлық сұраққа жауап беріңіз', 'Answer every question'),
  scene: () => scene(avatar({ coat: 'cotton', buttoned: true, eyes: 'goggles', gloves: 'nitrile', shoes: 'closed', hair: 'tied', scarf: false })),
  questions: [
    { q: L('При какой работе перчатки обязательны по п. 3.3?', '3.3-тармақ бойынша қай жұмыста қолғап міндетті?', 'For which work are gloves compulsory under rule 3.3?'),
      options: [L('Анилин (ароматический амин) — всасывается через кожу', 'Анилин (ароматты амин) — тері арқылы сіңеді', 'Aniline (an aromatic amine) — absorbed through the skin'), L('Запись наблюдений в журнал', 'Бақылауларды журналға жазу', 'Writing observations in the notebook'), L('Чтение методички', 'Әдістемені оқу', 'Reading the manual')], correct: 0,
      why: L('П. 3.3: концентрированные кислоты и щёлочи, галогенсодержащие соединения, амины и вещества, опасные при всасывании через кожу, окислители и восстановители.', '3.3-тармақ: концентрлі қышқылдар мен сілтілер, галогені бар қосылыстар, аминдер және тері арқылы сіңгенде қауіпті заттар, тотықтырғыштар мен тотықсыздандырғыштар.', 'Rule 3.3: concentrated acids and alkalis, halogenated compounds, amines and substances dangerous through the skin, oxidising and reducing agents.') },
    { q: L('Нужны ли перчатки при работе с хлороформом CHCl₃?', 'Хлороформмен CHCl₃ жұмыс істегенде қолғап қажет пе?', 'Are gloves needed when working with chloroform CHCl₃?'),
      options: [L('Да: галогенсодержащее соединение (п. 3.3), и только под тягой (п. 4.6)', 'Иә: галогені бар қосылыс (3.3-тармақ), және тек тартпа астында (4.6-тармақ)', 'Yes: a halogenated compound (rule 3.3), and only in the hood (rule 4.6)'), L('Нет, это просто растворитель', 'Жоқ, бұл жай еріткіш', 'No, it is just a solvent'), L('Только если пролили', 'Тек төгілсе ғана', 'Only if it is spilled')], correct: 0,
      why: L('Галогенпроизводные токсичны при вдыхании и контакте с кожей (п. 4.6).', 'Галоген туындылары буын жұтқанда (тыныс жолы арқылы) және терімен жанасқанда улы (4.6-тармақ).', 'Halogenated compounds are toxic by inhalation and skin contact (rule 4.6).') },
    { q: L('Почему контактные линзы в лаборатории не рекомендуются?', 'Зертханада контакт линзалары неге ұсынылмайды?', 'Why are contact lenses not recommended in the lab?'),
      options: [L('Под ними могут скапливаться пары веществ', 'Олардың астында заттардың булары жиналуы мүмкін', 'Vapour can collect underneath them'), L('Они мешают видеть мениск', 'Олар менискті көруге кедергі келтіреді', 'They make the meniscus hard to see'), L('Они запотевают от тепла', 'Олар жылудан тұманданып қалады', 'They fog up from the heat')], correct: 0,
      why: L('П. 3.2.', '3.2-тармақ.', 'Rule 3.2.') },
  ],
};

export default {
  id: '2',
  title: L('Средства индивидуальной защиты', 'Жеке қорғаныс құралдары', 'Personal protective equipment'),
  principle: L('Раздел 3 правил ТБ: халат, защитные очки, перчатки, обувь; п. 2.3 — волосы, одежда, украшения.', 'ҚТ ережелерінің 3-бөлімі: халат, қорғаныс көзілдірігі, қолғап, аяқ киім; 2.3-тармақ — шаш, киім, әшекейлер.', 'Safety rules, section 3: coat, goggles, gloves, footwear; rule 2.3 — hair, clothing, jewellery.'),
  equation: [],
  initialState: () => ({}),
  checkpoints: [0],
  steps: [sDress, sQuiz],
  results: (S, run) => stageResults(run),
  summary: (r) => [{ label: L('Замечаний', 'Ескертулер', 'Remarks'), value: String(r.remarks), st: r.remarks ? 'warn' : 'ok' }],
};
