/** Опыт 1. Молекулярные модели: конформации и конфигурации. Методичка, раздел 6, опыт 1. */
import { L, n } from '../../app/i18n.js';
import { dG_Me } from './model.js';
import { chairScene } from './scene.js';

const s0 = {
  type: 'lab13-rotor', id: 'ethane', mol: 'ethane', start: 35,
  title: L('Этан: заторможенная и заслонённая конформации', 'Этан: тежелген және көмкерілген конформациялар', 'Ethane: staggered and eclipsed conformations'),
  instr: L('<ol><li>Соберите шаростержневую модель этана.</li><li>Вращая задний атом углерода вокруг связи C–C, получите <b>заторможенную</b> и <b>заслонённую</b> конформации.</li><li>Зарисуйте их проекции Ньюмена в журнал.</li></ol><p class="note">Энергия на графике — расчёт методом молекулярной механики (справочно). Заторможенная конформация этана устойчивее заслонённой на ≈ 12 кДж/моль (торсионное напряжение).</p>',
    '<ol><li>Этанның шар-стерженді моделін жинаңыз.</li><li>Артқы көміртек атомын C–C байланысы бойынша бұрап, <b>тежелген</b> және <b>көмкерілген</b> конформацияларды алыңыз.</li><li>Олардың Ньюмен проекцияларын журналға сызыңыз.</li></ol><p class="note">Графиктегі энергия — молекулалық механика әдісімен есептеу (анықтама үшін). Этанның тежелген конформациясы көмкерілгенінен ≈ 12 кДж/моль тұрақты (торсиялық кернеу).</p>',
    '<ol><li>Build a ball-and-stick model of ethane.</li><li>Turning the rear carbon atom about the C–C bond, obtain the <b>staggered</b> and <b>eclipsed</b> conformations.</li><li>Draw their Newman projections in the notebook.</li></ol><p class="note">The energy on the graph comes from a molecular mechanics calculation (for reference). The staggered conformation of ethane is about 12 kJ/mol more stable than the eclipsed one (torsional strain).</p>'),
  need: L('Найдите и зарисуйте обе конформации', 'Екі конформацияны тауып, сызыңыз', 'Find and draw both conformations'),
  targets: [
    { id: 'staggered', label: L('заторможенная', 'тежелген', 'staggered'), log: L('связи C–H заднего атома точно между связями переднего, энергия минимальна', 'артқы атомның C–H байланыстары алдыңғысының байланыстарының дәл арасында, энергия ең аз', 'the rear C–H bonds lie exactly between the front ones; minimum energy') },
    { id: 'eclipsed', label: L('заслонённая', 'көмкерілген', 'eclipsed'), log: L('связи C–H заднего атома закрыты связями переднего, энергия на ≈ 12 кДж/моль выше', 'артқы атомның C–H байланыстарын алдыңғысының байланыстары жауып тұр, энергия ≈ 12 кДж/моль жоғары', 'the rear C–H bonds are hidden behind the front ones; energy ≈ 12 kJ/mol higher') },
  ],
  names: [
    { id: 'staggered', label: L('заторможенная', 'тежелген', 'staggered') },
    { id: 'eclipsed', label: L('заслонённая', 'көмкерілген', 'eclipsed') },
  ],
  saveAs: 'ethane',
};

const s1 = {
  type: 'lab13-rotor', id: 'butane', mol: 'butane', start: 150,
  title: L('Бутан: анти-, гош- и заслонённые конформации', 'Бутан: анти-, гош- және көмкерілген конформациялар', 'Butane: anti, gauche and eclipsed conformations'),
  instr: L('<ol><li>Соберите модель бутана и вращайте её вокруг связи <b>C2–C3</b>.</li><li>Получите и зарисуйте проекции Ньюмена четырёх конформаций: <b>анти</b>, <b>гош</b>, <b>заслонённой</b> (CH₃ против H) и <b>полностью заслонённой</b> (CH₃ против CH₃).</li></ol><p class="note">Угол φ — двугранный угол между метильными группами. Анти-конформация устойчивее гош на ≈ 3,8 кДж/моль (пространственное взаимодействие метилов).</p>',
    '<ol><li>Бутан моделін жинап, оны <b>C2–C3</b> байланысы бойынша бұраңыз.</li><li>Төрт конформацияның Ньюмен проекцияларын алып, сызыңыз: <b>анти</b>, <b>гош</b>, <b>көмкерілген</b> (CH₃ H-қа қарсы) және <b>толық көмкерілген</b> (CH₃ CH₃-ке қарсы).</li></ol><p class="note">φ бұрышы — метил топтары арасындағы екіжақты бұрыш. Анти-конформация гош-тан ≈ 3,8 кДж/моль тұрақты (метилдердің кеңістіктік әрекеттесуі).</p>',
    '<ol><li>Build a model of butane and rotate it about the <b>C2–C3</b> bond.</li><li>Obtain and draw the Newman projections of four conformations: <b>anti</b>, <b>gauche</b>, <b>eclipsed</b> (CH₃ facing H) and <b>fully eclipsed</b> (CH₃ facing CH₃).</li></ol><p class="note">φ is the dihedral angle between the methyl groups. The anti conformation is about 3.8 kJ/mol more stable than gauche (steric interaction of the methyl groups).</p>'),
  need: L('Зарисуйте четыре конформации бутана', 'Бутанның төрт конформациясын сызыңыз', 'Draw the four conformations of butane'),
  targets: [
    { id: 'anti', label: L('анти', 'анти', 'anti'), log: L('метильные группы друг против друга (180°), энергия минимальна', 'метил топтары бір-біріне қарама-қарсы (180°), энергия ең аз', 'methyl groups opposite each other (180°), minimum energy') },
    { id: 'gauche', label: L('гош', 'гош', 'gauche'), log: L('метильные группы сближены (60°), на ≈ 3,8 кДж/моль выше анти', 'метил топтары жақындасқан (60°), антиден ≈ 3,8 кДж/моль жоғары', 'methyl groups close (60°), ≈ 3.8 kJ/mol above anti') },
    { id: 'eclipsed', label: L('заслонённая (CH₃/H)', 'көмкерілген (CH₃/H)', 'eclipsed (CH₃/H)'), log: L('CH₃ заслоняет H (120°)', 'CH₃ H-ты көмкереді (120°)', 'CH₃ eclipses H (120°)') },
    { id: 'syn', label: L('полностью заслонённая (CH₃/CH₃)', 'толық көмкерілген (CH₃/CH₃)', 'fully eclipsed (CH₃/CH₃)'), log: L('CH₃ заслоняет CH₃ (0°), энергия максимальна', 'CH₃ CH₃-ті көмкереді (0°), энергия ең жоғары', 'CH₃ eclipses CH₃ (0°), maximum energy') },
  ],
  names: [
    { id: 'anti', label: L('анти', 'анти', 'anti') },
    { id: 'gauche', label: L('гош', 'гош', 'gauche') },
    { id: 'eclipsed', label: L('заслонённая (CH₃/H)', 'көмкерілген (CH₃/H)', 'eclipsed (CH₃/H)') },
    { id: 'syn', label: L('полностью заслонённая (CH₃/CH₃)', 'толық көмкерілген (CH₃/CH₃)', 'fully eclipsed (CH₃/CH₃)') },
  ],
  saveAs: 'butane',
};

const s2 = {
  type: 'order', id: 'butane-order',
  title: L('Энергии конформаций бутана', 'Бутан конформацияларының энергиялары', 'Energies of the butane conformations'),
  instr: L('<p>Расположите конформации бутана в порядке <b>возрастания энергии</b> (вопрос 2 для самоконтроля).</p>', '<p>Бутан конформацияларын <b>энергияның өсу</b> ретімен орналастырыңыз (өзін-өзі бақылаудың 2-сұрағы).</p>', '<p>Arrange the conformations of butane in order of <b>increasing energy</b> (self-control question 2).</p>'),
  need: L('Расставьте по возрастанию энергии', 'Энергияның өсуі бойынша орналастырыңыз', 'Order by increasing energy'),
  items: [
    { id: 'anti', label: L('анти (φ = 180°)', 'анти (φ = 180°)', 'anti (φ = 180°)') },
    { id: 'gauche', label: L('гош (φ = 60°)', 'гош (φ = 60°)', 'gauche (φ = 60°)') },
    { id: 'ecl', label: L('заслонённая, CH₃ против H (φ = 120°)', 'көмкерілген, CH₃ H-қа қарсы (φ = 120°)', 'eclipsed, CH₃ facing H (φ = 120°)') },
    { id: 'syn', label: L('полностью заслонённая, CH₃ против CH₃ (φ = 0°)', 'толық көмкерілген, CH₃ CH₃-ке қарсы (φ = 0°)', 'fully eclipsed, CH₃ facing CH₃ (φ = 0°)') },
  ],
  hints: [
    L('Заторможенные конформации ниже по энергии, чем заслонённые. Чем ближе метильные группы, тем выше энергия.', 'Тежелген конформациялар көмкерілгендерден энергиясы бойынша төмен. Метил топтары неғұрлым жақын болса, энергия соғұрлым жоғары.', 'Staggered conformations are lower in energy than eclipsed ones. The closer the methyl groups, the higher the energy.'),
    L('Самая устойчивая — анти, самая неустойчивая — полностью заслонённая.', 'Ең тұрақтысы — анти, ең тұрақсызы — толық көмкерілген.', 'The most stable is anti; the least stable is fully eclipsed.'),
    L('анти < гош < заслонённая (CH₃/H) < полностью заслонённая (CH₃/CH₃).', 'анти < гош < көмкерілген (CH₃/H) < толық көмкерілген (CH₃/CH₃).', 'anti < gauche < eclipsed (CH₃/H) < fully eclipsed (CH₃/CH₃).'),
  ],
};
s2.onLeave = (S, ctx) => { ctx.log(L('Порядок энергий конформаций бутана: анти < гош < заслонённая (CH₃/H) < полностью заслонённая (CH₃/CH₃)', 'Бутан конформацияларының энергия реті: анти < гош < көмкерілген (CH₃/H) < толық көмкерілген (CH₃/CH₃)', 'Order of butane conformer energies: anti < gauche < eclipsed (CH₃/H) < fully eclipsed (CH₃/CH₃)'), 'obs'); };

const s3 = {
  type: 'lab13-chair', id: 'chair-bonds', mode: 'bonds',
  title: L('Циклогексан: аксиальные и экваториальные связи', 'Циклогексан: аксиалды және экваториалды байланыстар', 'Cyclohexane: axial and equatorial bonds'),
  instr: L('<ol><li>Соберите модель циклогексана в форме <b>кресла</b>.</li><li>Для каждой выделенной связи определите, аксиальная она или экваториальная.</li><li>Переверните кресло (инверсия цикла) и проследите, что стало с теми же связями.</li></ol><p class="note">У каждого атома углерода одна аксиальная и одна экваториальная связь.</p>',
    '<ol><li>Циклогексан моделін <b>кресло</b> пішінінде жинаңыз.</li><li>Әр белгіленген байланыстың аксиалды немесе экваториалды екенін анықтаңыз.</li><li>Креслоны аударыңыз (цикл инверсиясы) және сол байланыстарға не болғанын бақылаңыз.</li></ol><p class="note">Әр көміртек атомында бір аксиалды және бір экваториалды байланыс бар.</p>',
    '<ol><li>Build a model of cyclohexane in the <b>chair</b> form.</li><li>For each highlighted bond decide whether it is axial or equatorial.</li><li>Flip the chair (ring inversion) and see what happened to the same bonds.</li></ol><p class="note">Each carbon atom carries one axial and one equatorial bond.</p>'),
  need: L('Определите все выделенные связи', 'Белгіленген барлық байланысты анықтаңыз', 'Identify every highlighted bond'),
};

const s4 = {
  type: 'lab13-chair', id: 'chair-forms', mode: 'forms',
  title: L('Кресло и ванна', 'Кресло және ванна', 'Chair and boat'),
  instr: L('<p>Переведите модель циклогексана из кресла в ванну и обратно. Сравните, заторможены ли связи и нет ли сближенных атомов.</p>', '<p>Циклогексан моделін креслодан ваннаға және кері ауыстырыңыз. Байланыстар тежелген бе және жақындасқан атомдар бар ма — салыстырыңыз.</p>', '<p>Change the cyclohexane model from the chair into the boat and back. Compare whether the bonds are staggered and whether any atoms clash.</p>'),
  need: L('Сравните формы и сделайте вывод', 'Пішіндерді салыстырып, қорытынды жасаңыз', 'Compare the forms and draw a conclusion'),
  question: {
    q: L('Какая форма циклогексана устойчивее и почему?', 'Циклогексанның қай пішіні тұрақтырақ және неге?', 'Which form of cyclohexane is more stable and why?'),
    options: [
      L('Кресло: все связи C–C заторможены, валентные углы близки к тетраэдрическим — нет углового и торсионного напряжения', 'Кресло: барлық C–C байланыстары тежелген, валенттік бұрыштар тетраэдрлікке жақын — бұрыштық және торсиялық кернеу жоқ', 'Chair: all C–C bonds are staggered and bond angles are close to tetrahedral — no angle or torsional strain'),
      L('Ванна: в ней атомы H у C1 и C4 сближены и удерживают цикл', 'Ванна: онда C1 мен C4-тегі H атомдары жақындасып, циклді ұстап тұрады', 'Boat: the H atoms at C1 and C4 come close and hold the ring together'),
      L('Обе формы одинаково устойчивы и не превращаются друг в друга', 'Екі пішін де бірдей тұрақты және бір-біріне айналмайды', 'Both forms are equally stable and do not interconvert'),
      L('Плоский шестиугольник: углы 120°', 'Жазық алтыбұрыш: бұрыштар 120°', 'A flat hexagon: angles of 120°'),
    ],
    correct: 0,
    why: L('В ванне связи C2–C3 и C5–C6 заслонены, а флагштоковые H у C1 и C4 сближены — она выше по энергии.', 'Ваннада C2–C3 және C5–C6 байланыстары көмкерілген, ал C1 мен C4-тегі флагшток H жақындасқан — оның энергиясы жоғары.', 'In the boat the C2–C3 and C5–C6 bonds are eclipsed and the flagpole H atoms at C1 and C4 clash — it is higher in energy.'),
    log: L('Кресло циклогексана свободно от напряжения (все связи заторможены); ванна менее устойчива — заслонённые связи и сближенные флагштоковые H', 'Циклогексан креслосында кернеу жоқ (барлық байланыс тежелген); ванна тұрақсыздау — көмкерілген байланыстар және жақындасқан флагшток H', 'The cyclohexane chair is strain-free (all bonds staggered); the boat is less stable — eclipsed bonds and clashing flagpole H atoms'),
  },
};

const s5 = {
  type: 'lab13-chair', id: 'chair-me', mode: 'methyl',
  title: L('Метилциклогексан: аксиальный и экваториальный CH₃', 'Метилциклогексан: аксиалды және экваториалды CH₃', 'Methylcyclohexane: axial and equatorial CH₃'),
  instr: L('<ol><li>Замените атом H у C1 метильной группой: сначала в <b>аксиальном</b>, затем в <b>экваториальном</b> положении.</li><li>Выполните инверсию цикла и сравните 1,3-диаксиальные взаимодействия.</li></ol><p class="note">При 25 °C ≈ 95 % метилциклогексана находится в экваториальной конформации.</p>',
    '<ol><li>C1-дегі H атомын метил тобымен алмастырыңыз: алдымен <b>аксиалды</b>, содан кейін <b>экваториалды</b> күйде.</li><li>Цикл инверсиясын орындап, 1,3-диаксиалды әрекеттесулерді салыстырыңыз.</li></ol><p class="note">25 °C-та метилциклогексанның ≈ 95 %-ы экваториалды конформацияда болады.</p>',
    '<ol><li>Replace the H atom at C1 by a methyl group: first in the <b>axial</b>, then in the <b>equatorial</b> position.</li><li>Carry out a ring flip and compare the 1,3-diaxial interactions.</li></ol><p class="note">At 25 °C about 95 % of methylcyclohexane is in the equatorial conformation.</p>'),
  need: L('Сравните положения CH₃ и ответьте', 'CH₃ күйлерін салыстырып, жауап беріңіз', 'Compare the CH₃ positions and answer'),
  questions: [
    { q: L('Сколько 1,3-диаксиальных взаимодействий CH₃…H у аксиальной метильной группы?', 'Аксиалды метил тобында қанша 1,3-диаксиалды CH₃…H әрекеттесу бар?', 'How many 1,3-diaxial CH₃…H interactions does an axial methyl group have?'), options: ['0', '1', '2', '4'], correct: 2, why: L('CH₃ у C1 сближена с аксиальными H у C3 и C5.', 'C1-дегі CH₃ C3 және C5-тегі аксиалды H-пен жақындасқан.', 'The CH₃ at C1 is close to the axial H atoms at C3 and C5.'), log: L('Аксиальная CH₃ испытывает два 1,3-диаксиальных взаимодействия (с H у C3 и C5); у экваториальной их нет', 'Аксиалды CH₃ екі 1,3-диаксиалды әрекеттесуге ұшырайды (C3 және C5-тегі H-пен); экваториалдыда олар жоқ', 'An axial CH₃ has two 1,3-diaxial interactions (with H at C3 and C5); an equatorial one has none') },
    { q: L('Какой конформер метилциклогексана преобладает при 25 °C?', '25 °C-та метилциклогексанның қай конформері басым?', 'Which conformer of methylcyclohexane predominates at 25 °C?'), options: [L('экваториальный (≈ 95 %)', 'экваториалды (≈ 95 %)', 'equatorial (≈ 95 %)'), L('аксиальный (≈ 95 %)', 'аксиалды (≈ 95 %)', 'axial (≈ 95 %)'), L('поровну', 'тең', 'equal amounts'), L('только ванна', 'тек ванна', 'only the boat')], correct: 0, why: L('Большие заместители предпочитают экваториальное положение: нет 1,3-диаксиальных взаимодействий.', 'Үлкен орынбасарлар экваториалды күйді қалайды: 1,3-диаксиалды әрекеттесу жоқ.', 'Large substituents prefer the equatorial position: no 1,3-diaxial interactions.'), log: L('Преобладает экваториальный конформер метилциклогексана (≈ 95 % при 25 °C)', 'Метилциклогексанның экваториалды конформері басым (25 °C-та ≈ 95 %)', 'The equatorial conformer of methylcyclohexane predominates (≈ 95 % at 25 °C)') },
  ],
};

const s6 = {
  type: 'calc', id: 'dG',
  title: L('Разность энергий конформеров', 'Конформерлер энергияларының айырмасы', 'Energy difference of the conformers'),
  instr: L('<p>По соотношению конформеров (≈ 95 % экваториального и 5 % аксиального при 25 °C) рассчитайте, на сколько аксиальный конформер выше по свободной энергии: <b>ΔG° = G°(акс.) − G°(экв.) = RT·ln K</b>, где K = [экв.] / [акс.] — константа равновесия акс. ⇌ экв. (для самого перехода акс. → экв. ΔG° = −RT·ln K < 0).</p><p class="note">R = 8,314 Дж/(моль·К), T = 298,15 К. Допустимая погрешность — 1 %, три попытки.</p>',
    '<p>Конформерлер қатынасы бойынша (25 °C-та ≈ 95 % экваториалды және 5 % аксиалды) аксиалды конформердің бос энергиясы қаншалықты жоғары екенін есептеңіз: <b>ΔG° = G°(акс.) − G°(экв.) = RT·ln K</b>, мұндағы K = [экв.] / [акс.] — акс. ⇌ экв. тепе-теңдігінің тұрақтысы (акс. → экв. ауысуының өзі үшін ΔG° = −RT·ln K < 0).</p><p class="note">R = 8,314 Дж/(моль·К), T = 298,15 К. Рұқсат етілген қателік — 1 %, үш әрекет.</p>',
    '<p>From the conformer ratio (≈ 95 % equatorial and 5 % axial at 25 °C) calculate how much higher in free energy the axial conformer is: <b>ΔG° = G°(ax.) − G°(eq.) = RT·ln K</b>, where K = [eq.] / [ax.] is the equilibrium constant of ax. ⇌ eq. (for the ax. → eq. change itself ΔG° = −RT·ln K < 0).</p><p class="note">R = 8.314 J/(mol·K), T = 298.15 K. Allowed error 1 %, three attempts.</p>'),
  need: L('Рассчитайте ΔG°', 'ΔG° есептеңіз', 'Calculate ΔG°'),
  fields: [{ id: 'dG', label: L('ΔG° = G°(акс.) − G°(экв.)', 'ΔG° = G°(акс.) − G°(экв.)', 'ΔG° = G°(ax.) − G°(eq.)'), unit: L('кДж/моль', 'кДж/моль', 'kJ/mol'), decimals: 2, answer: () => dG_Me, formula: () => L('ΔG° = 8.314 × 298.15 × ln(95 / 5) / 1000', 'ΔG° = 8.314 × 298.15 × ln(95 / 5) / 1000', 'ΔG° = 8.314 × 298.15 × ln(95 / 5) / 1000') }],
  saveAs: 'dG',
  scene: () => chairScene({ me: 'eq' }),
};

const s7 = {
  type: 'order', id: 'cip',
  title: L('Старшинство заместителей (правила Кана — Ингольда — Прелога)', 'Орынбасарлардың үлкендігі (Кан — Ингольд — Прелог ережелері)', 'Substituent priorities (Cahn–Ingold–Prelog rules)'),
  instr: L('<p>У атома C2 бутан-2-ола CH₃–CH(OH)–CH₂CH₃ четыре разные группы. Расставьте их по <b>убыванию старшинства</b>.</p><p class="note">Сравнивают атомные номера атомов, непосредственно связанных со стереоцентром; при равенстве — следующие атомы.</p>',
    '<p>Бутан-2-олдың CH₃–CH(OH)–CH₂CH₃ C2 атомында төрт түрлі топ бар. Оларды <b>үлкендігінің кемуі</b> бойынша орналастырыңыз.</p><p class="note">Стереоорталықпен тікелей байланысқан атомдардың атомдық нөмірлерін салыстырады; тең болса — келесі атомдарды.</p>',
    '<p>C2 of butan-2-ol, CH₃–CH(OH)–CH₂CH₃, carries four different groups. Arrange them in order of <b>decreasing priority</b>.</p><p class="note">Compare the atomic numbers of the atoms attached directly to the stereocentre; if equal, compare the next atoms out.</p>'),
  need: L('Расставьте группы по старшинству', 'Топтарды үлкендігі бойынша орналастырыңыз', 'Order the groups by priority'),
  items: [
    { id: 'oh', label: L('–OH (O, Z = 8)', '–OH (O, Z = 8)', '–OH (O, Z = 8)') },
    { id: 'et', label: L('–CH₂CH₃ (C: C, H, H)', '–CH₂CH₃ (C: C, H, H)', '–CH₂CH₃ (C: C, H, H)') },
    { id: 'me', label: L('–CH₃ (C: H, H, H)', '–CH₃ (C: H, H, H)', '–CH₃ (C: H, H, H)') },
    { id: 'h', label: L('–H (Z = 1)', '–H (Z = 1)', '–H (Z = 1)') },
  ],
  hints: [
    L('Старше группа, у которой атом, связанный со стереоцентром, имеет больший атомный номер.', 'Стереоорталықпен байланысқан атомының атомдық нөмірі үлкен топ үлкенірек.', 'The group whose atom attached to the stereocentre has the higher atomic number has priority.'),
    L('CH₃ и C₂H₅ присоединены через углерод: сравните следующие атомы — (H, H, H) и (C, H, H).', 'CH₃ және C₂H₅ көміртек арқылы қосылған: келесі атомдарды салыстырыңыз — (H, H, H) және (C, H, H).', 'CH₃ and C₂H₅ are both attached through carbon: compare the next atoms — (H, H, H) and (C, H, H).'),
    L('OH > C₂H₅ > CH₃ > H.', 'OH > C₂H₅ > CH₃ > H.', 'OH > C₂H₅ > CH₃ > H.'),
  ],
};
s7.onLeave = (S, ctx) => { ctx.log(L('Старшинство групп у C2 бутан-2-ола: OH > C₂H₅ > CH₃ > H', 'Бутан-2-олдың C2-сіндегі топтардың үлкендігі: OH > C₂H₅ > CH₃ > H', 'Priorities at C2 of butan-2-ol: OH > C₂H₅ > CH₃ > H'), 'obs'); };

const s8 = {
  type: 'lab13-stereo', id: 'enant', prio: ['OH', 'C2H5', 'CH3', 'H'], saveAs: 'enant',
  title: L('Энантиомеры бутан-2-ола', 'Бутан-2-ол энантиомерлері', 'Enantiomers of butan-2-ol'),
  instr: L('<ol><li>Модель A уже собрана. Соберите её точную копию — модель B.</li><li>Превратите B в <b>зеркальное отражение</b> A (поменяйте местами две группы или «отразите» модель).</li><li>Попробуйте наложить B на A, поворачивая B, и убедитесь, что они <b>не совмещаются</b>.</li><li>Определите конфигурацию (R или S) каждой модели.</li></ol><p class="note">R/S: младшую группу (H) направляют от наблюдателя и смотрят на направление OH → C₂H₅ → CH₃: по часовой стрелке — R, против — S.</p>',
    '<ol><li>A моделі жиналған. Оның дәл көшірмесін — B моделін жинаңыз.</li><li>B-ны A-ның <b>айнадағы шағылуына</b> айналдырыңыз (екі топтың орнын ауыстырыңыз немесе модельді «шағылыстырыңыз»).</li><li>B-ны бұрай отырып, оны A-ға беттестіріп көріңіз және олардың <b>беттеспейтініне</b> көз жеткізіңіз.</li><li>Әр модельдің конфигурациясын (R немесе S) анықтаңыз.</li></ol><p class="note">R/S: кіші топты (H) бақылаушыдан бағыттап, OH → C₂H₅ → CH₃ бағытына қарайды: сағат тілімен — R, қарсы — S.</p>',
    '<ol><li>Model A is already built. Build an exact copy of it — model B.</li><li>Turn B into the <b>mirror image</b> of A (swap two groups or “reflect” the model).</li><li>Try to superimpose B on A by turning B and make sure they <b>do not coincide</b>.</li><li>Assign the configuration (R or S) of each model.</li></ol><p class="note">R/S: point the lowest group (H) away from you and look at OH → C₂H₅ → CH₃: clockwise is R, anticlockwise is S.</p>'),
  need: L('Покажите несовместимость и определите R/S', 'Беттеспейтінін көрсетіп, R/S анықтаңыз', 'Show non-superimposability and assign R/S'),
};

const s9 = {
  type: 'lab13-rotor', id: 'maleic', mol: 'double',
  title: L('Малеиновая и фумаровая кислоты: можно ли повернуть вокруг C=C?', 'Малеин және фумар қышқылдары: C=C бойынша бұруға бола ма?', 'Maleic and fumaric acids: can you rotate about C=C?'),
  instr: L('<ol><li>Соберите модель малеиновой кислоты HOOC–CH=CH–COOH (группы COOH по одну сторону двойной связи).</li><li>Попробуйте повернуть один атом углерода вокруг связи C=C.</li><li>Покажите, что получить фумаровую кислоту можно только <b>разомкнув π-связь</b>, повернув на 180° и замкнув её снова.</li></ol>',
    '<ol><li>Малеин қышқылының HOOC–CH=CH–COOH моделін жинаңыз (COOH топтары қос байланыстың бір жағында).</li><li>Бір көміртек атомын C=C байланысы бойынша бұрап көріңіз.</li><li>Фумар қышқылын тек <b>π-байланысты ажыратып</b>, 180°-қа бұрап және оны қайта тұйықтап алуға болатынын көрсетіңіз.</li></ol>',
    '<ol><li>Build a model of maleic acid HOOC–CH=CH–COOH (the COOH groups on the same side of the double bond).</li><li>Try to turn one carbon atom about the C=C bond.</li><li>Show that fumaric acid can be obtained only by <b>opening the π-bond</b>, turning by 180° and closing it again.</li></ol>'),
  need: L('Получите модель фумаровой кислоты и сделайте вывод', 'Фумар қышқылының моделін алып, қорытынды жасаңыз', 'Obtain the fumaric acid model and draw a conclusion'),
  question: {
    q: L('Что показывает опыт с моделями?', 'Модельдермен тәжірибе нені көрсетеді?', 'What does the experiment with the models show?'),
    options: [
      L('Малеиновая и фумаровая кислоты — цис-транс-изомеры (диастереомеры): они различаются конфигурацией и превращаются друг в друга только с разрывом π-связи', 'Малеин және фумар қышқылдары — цис-транс-изомерлер (диастереомерлер): олар конфигурациясы бойынша ерекшеленеді және бір-біріне тек π-байланыс үзілгенде айналады', 'Maleic and fumaric acids are cis–trans isomers (diastereomers): they differ in configuration and interconvert only when the π-bond is broken'),
      L('Это две конформации одной молекулы, при комнатной температуре они быстро переходят друг в друга', 'Бұл бір молекуланың екі конформациясы, бөлме температурасында олар бір-біріне тез ауысады', 'They are two conformations of one molecule that interconvert rapidly at room temperature'),
      L('Это энантиомеры — несовместимые зеркальные отражения', 'Бұл энантиомерлер — беттеспейтін айналық шағылулар', 'They are enantiomers — non-superimposable mirror images'),
      L('Это одно и то же вещество', 'Бұл бір зат', 'They are the same compound'),
    ],
    correct: 0,
    why: L('Обе молекулы плоские и ахиральные, но не являются зеркальными отражениями — это диастереомеры.', 'Екі молекула да жазық және хиралды емес, бірақ айналық шағылулар емес — бұл диастереомерлер.', 'Both molecules are planar and achiral but are not mirror images — they are diastereomers.'),
    log: L('Малеиновую кислоту нельзя превратить в фумаровую вращением: требуется разрыв π-связи. Это цис-транс-изомеры (диастереомеры) — различные конфигурации', 'Малеин қышқылын айналдыру арқылы фумар қышқылына айналдыру мүмкін емес: π-байланыстың үзілуі қажет. Бұл цис-транс-изомерлер (диастереомерлер) — әртүрлі конфигурациялар', 'Maleic acid cannot be turned into fumaric acid by rotation: the π-bond must be broken. They are cis–trans isomers (diastereomers) — different configurations'),
  },
};

const s10 = {
  type: 'quiz', id: 'q-models',
  title: L('Вывод по моделям', 'Модельдер бойынша қорытынды', 'Conclusions from the models'),
  instr: L('<p>Ответьте на вопросы преподавателя о связи между построенными моделями. Каждая ошибка записывается в журнал.</p>', '<p>Құрастырылған модельдер арасындағы байланыс туралы оқытушының сұрақтарына жауап беріңіз. Әр қате журналға жазылады.</p>', '<p>Answer the instructor’s questions about the relationships between the models you built. Every wrong answer is recorded.</p>'),
  need: L('Ответьте на все вопросы', 'Барлық сұраққа жауап беріңіз', 'Answer all the questions'),
  questions: [
    { q: L('Анти- и гош-конформации бутана — это…', 'Бутанның анти- және гош-конформациялары — бұл…', 'The anti and gauche conformations of butane are…'), options: [L('конформеры одного вещества', 'бір заттың конформерлері', 'conformers of one compound'), L('энантиомеры', 'энантиомерлер', 'enantiomers'), L('диастереомеры', 'диастереомерлер', 'diastereomers'), L('структурные изомеры', 'құрылымдық изомерлер', 'constitutional isomers')], correct: 0, why: L('Они переходят друг в друга вращением вокруг одинарной связи без разрыва связей.', 'Олар байланыстар үзілмей бір реттік байланыс бойынша айналу арқылы бір-біріне ауысады.', 'They interconvert by rotation about a single bond without breaking any bonds.') },
    { q: L('(R)- и (S)-бутан-2-ол — это…', '(R)- және (S)-бутан-2-ол — бұл…', '(R)- and (S)-butan-2-ol are…'), options: [L('энантиомеры', 'энантиомерлер', 'enantiomers'), L('конформеры', 'конформерлер', 'conformers'), L('одно и то же вещество', 'бір зат', 'the same compound'), L('цис-транс-изомеры', 'цис-транс-изомерлер', 'cis–trans isomers')], correct: 0, why: L('Несовместимые зеркальные отражения — энантиомеры.', 'Беттеспейтін айналық шағылулар — энантиомерлер.', 'Non-superimposable mirror images are enantiomers.') },
    { q: L('Чем конфигурация отличается от конформации?', 'Конфигурацияның конформациядан айырмашылығы неде?', 'How does configuration differ from conformation?'), options: [L('Конфигурацию нельзя изменить без разрыва связей; конформации переходят друг в друга вращением вокруг одинарных связей', 'Конфигурацияны байланыстарды үзбей өзгерту мүмкін емес; конформациялар бір реттік байланыстар бойынша айналу арқылы бір-біріне ауысады', 'Configuration cannot be changed without breaking bonds; conformations interconvert by rotation about single bonds'), L('Конфигурации быстро переходят друг в друга при комнатной температуре', 'Конфигурациялар бөлме температурасында бір-біріне тез ауысады', 'Configurations interconvert rapidly at room temperature'), L('Ничем — это синонимы', 'Ешқандай — бұл синонимдер', 'There is no difference — the terms are synonyms'), L('Конформации различаются составом', 'Конформациялар құрамы бойынша ерекшеленеді', 'Conformations differ in composition')], correct: 0, why: L('Методичка, раздел 3.1.', 'Әдістеме, 3.1-бөлім.', 'Manual, section 3.1.') },
  ],
};

export default {
  id: '1',
  title: L('Молекулярные модели: конформации и конфигурации', 'Молекулалық модельдер: конформациялар және конфигурациялар', 'Molecular models: conformations and configurations'),
  principle: L('Шаростержневые модели помогают наглядно представить конформации и конфигурации и установить отношение между стереоизомерами (идентичны, энантиомеры, диастереомеры).', 'Шар-стерженді модельдер конформациялар мен конфигурацияларды көрнекі елестетуге және стереоизомерлер арасындағы қатынасты (бірдей, энантиомерлер, диастереомерлер) анықтауға көмектеседі.', 'Ball-and-stick models help visualise conformations and configurations and establish the relationship between stereoisomers (identical, enantiomers, diastereomers).'),
  equation: [],
  initialState: () => ({ ethane: null, butane: null, enant: null, dG: null, doubleDone: false }),
  checkpoints: [0],
  steps: [s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10],
  results(S) {
    return { ethane: S.ethane, butane: S.butane, dG: S.dG ? S.dG.dG : null, rsA: S.enant ? S.enant.A : null, rsB: S.enant ? S.enant.B : null, double: !!S.doubleDone };
  },
  summary: (r) => [
    { label: L('Этан', 'Этан', 'Ethane'), value: r.ethane ? L('2 конформации', '2 конформация', '2 conformations') : '—', st: r.ethane ? 'ok' : '' },
    { label: L('Бутан', 'Бутан', 'Butane'), value: r.butane ? L('4 конформации', '4 конформация', '4 conformations') : '—', st: r.butane ? 'ok' : '' },
    { label: 'ΔG°(Me)', value: r.dG != null ? { ru: n(r.dG, 2) + ' кДж/моль', kk: n(r.dG, 2) + ' кДж/моль', en: n(r.dG, 2) + ' kJ/mol' } : '—' },
    { label: L('Бутан-2-ол', 'Бутан-2-ол', 'Butan-2-ol'), value: r.rsA ? `(${r.rsA}) / (${r.rsB})` : '—', st: r.rsA ? 'ok' : '' },
  ],
};
