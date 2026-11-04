/** Опыт 3. Определение оптической чистоты расщеплённого амина. Методичка, раздел 6, опыт 3. */
import { L, n } from '../../app/i18n.js';
import { D_AMINE, AMINE_PURE, AMINE_REF_MEOH, TUBE_VOL, neatAlpha, solutionAlpha, specificRotation, opticalPurity, percentS, percentR } from './model.js';
import { polBench, volFlask, vialScene } from './scene.js';

const sg = (x, d = 2) => (x > 0.0049 ? '+' : '') + n(x, d);
const V_FLASK = 10; // мл, мерная колба для раствора в метаноле
const vol = (S) => S.mAmine / D_AMINE;
const neat = (S) => S.route === 'neat';
const conc = (S) => (neat(S) ? D_AMINE : S.mAmine / V_FLASK);
const ref = (S) => (neat(S) ? AMINE_PURE : AMINE_REF_MEOH);
const zeroOf = (S) => (S.zero ? S.zero.mean : 0);
const aCorr = (S) => (S.sample ? S.sample.mean - zeroOf(S) : 0);
const spec = (S) => (conc(S) > 0 ? specificRotation(aCorr(S), S.sample ? S.sample.tube : 1, conc(S)) : 0);
const op = (S) => opticalPurity(spec(S), ref(S));

const s0 = {
  type: 'observe', id: 'route',
  title: L('Как измерить вращение амина', 'Амин айналуын қалай өлшеу керек', 'How to measure the rotation of the amine'),
  instr: L('<p>Неразбавленный амин измеряют в короткой трубке (для чистой жидкости c = плотности = 0,95 г/мл). Если амина мало, взвешенную пробу растворяют в метаноле в мерной колбе и сравнивают с опорным значением преподавателя для того же растворителя.</p><p class="note">Трубка 1 дм вмещает ≈ 1,0 мл, трубка 2 дм — ≈ 2,0 мл.</p>',
    '<p>Сұйылтылмаған аминді қысқа түтікте өлшейді (таза сұйықтық үшін c = тығыздық = 0,95 г/мл). Амин аз болса, өлшенген сынаманы өлшегіш колбада метанолда ерітіп, сол еріткіш үшін оқытушы берген тірек мәнмен салыстырады.</p><p class="note">1 дм түтікке ≈ 1,0 мл, 2 дм түтікке ≈ 2,0 мл сыяды.</p>',
    '<p>The neat amine is measured in a short tube (for the neat liquid c = density = 0.95 g/mL). If there is too little amine, a weighed sample is dissolved in methanol in a volumetric flask and compared with the teacher’s reference value for the same solvent.</p><p class="note">A 1 dm tube holds ≈ 1.0 mL, a 2 dm tube ≈ 2.0 mL.</p>'),
  need: L('Выберите способ', 'Тәсілді таңдаңыз', 'Choose the method'),
  question: L('Сравните объём своего амина с вместимостью трубки (стенд). Как измерить его вращение?', 'Аминіңіздің көлемін түтік сыйымдылығымен салыстырыңыз (стенд). Оның айналуын қалай өлшейді?', 'Compare the volume of your amine with the capacity of the tube (see the bench). How do you measure its rotation?'),
  options: [
    { id: 'neat', label: L('Неразбавленный амин в трубке 1 дм, c = 0,95 г/мл', 'Сұйылтылмаған амин 1 дм түтікте, c = 0,95 г/мл', 'Neat amine in the 1 dm tube, c = 0.95 g/mL') },
    { id: 'sol', label: L('Растворить всю пробу в метаноле в мерной колбе 10 мл и измерить раствор', 'Бүкіл сынаманы 10 мл өлшегіш колбада метанолда ерітіп, ерітіндіні өлшеу', 'Dissolve the whole sample in methanol in a 10 mL volumetric flask and measure the solution') },
    { id: 'water', label: L('Растворить в воде — амин хорошо растворим', 'Суда еріту — амин жақсы ериді', 'Dissolve it in water — the amine is very soluble') },
  ],
  correct: (S) => (vol(S) >= TUBE_VOL[1] ? 'neat' : 'sol'),
  why: (S) => (vol(S) >= TUBE_VOL[1] ? L('Амина достаточно, чтобы заполнить трубку 1 дм: измеряют неразбавленную жидкость.', 'Амин 1 дм түтікті толтыруға жеткілікті: сұйылтылмаған сұйықтықты өлшейді.', 'There is enough amine to fill the 1 dm tube: the neat liquid is measured.') : L('Амина меньше 1 мл — трубку не заполнить; измеряют раствор в метаноле и сравнивают с опорным значением преподавателя.', 'Амин 1 мл-ден аз — түтікті толтыру мүмкін емес; метанолдағы ерітіндіні өлшеп, оқытушының тірек мәнімен салыстырады.', 'There is less than 1 mL of amine — the tube cannot be filled; measure a methanol solution and compare with the teacher’s reference value.')),
  onRight(S) { S.route = vol(S) >= TUBE_VOL[1] ? 'neat' : 'sol'; },
  scene: (S) => vialScene(S.mAmine, vol(S)),
};
s0.hint1 = L('Сравните объём своего амина (масса / 0,95) с вместимостью трубки 1 дм.', 'Аминіңіздің көлемін (масса / 0,95) 1 дм түтіктің сыйымдылығымен салыстырыңыз.', 'Compare the volume of your amine (mass / 0.95) with the capacity of the 1 dm tube.');

const s1 = {
  type: 'process', id: 'prep',
  title: L('Подготовка пробы', 'Сынаманы дайындау', 'Preparing the sample'),
  instr: L('<p><b>Неразбавленный амин:</b> перенесите амин пипеткой прямо в сухую трубку 1 дм (в вытяжном шкафу).</p><p><b>Раствор:</b> перенесите всю взвешенную пробу в мерную колбу на 10 мл, смойте остатки метанолом, доведите метанолом до метки и перемешайте.</p>',
    '<p><b>Сұйылтылмаған амин:</b> аминді пипеткамен тікелей құрғақ 1 дм түтікке ауыстырыңыз (тартпа шкафта).</p><p><b>Ерітінді:</b> бүкіл өлшенген сынаманы 10 мл өлшегіш колбаға ауыстырып, қалдықтарын метанолмен шайып, метанолмен белгіге дейін жеткізіп, араластырыңыз.</p>',
    '<p><b>Neat amine:</b> transfer the amine with a pipette straight into the dry 1 dm tube (in the fume hood).</p><p><b>Solution:</b> transfer the whole weighed sample into a 10 mL volumetric flask, rinse in the remains with methanol, make up to the mark with methanol and mix.</p>'),
  need: L('Подготовьте пробу', 'Сынаманы дайындаңыз', 'Prepare the sample'),
  speeds: null,
  controls: [
    { kind: 'action', id: 'neat', group: L('Неразбавленный амин', 'Сұйылтылмаған амин', 'Neat amine'), label: L('Амин готов к заполнению трубки', 'Амин түтікті толтыруға дайын', 'The amine is ready for filling the tube'), disabled: (S) => !neat(S), log: L('Амин подготовлен для измерения в неразбавленном виде', 'Амин сұйылтылмаған күйде өлшеуге дайындалды', 'Amine prepared for measurement as the neat liquid') },
    { kind: 'action', id: 'tr', group: L('Раствор в метаноле', 'Метанолдағы ерітінді', 'Methanol solution'), label: L('Перенести пробу в мерную колбу, смыть метанолом', 'Сынаманы өлшегіш колбаға ауыстырып, метанолмен шаю', 'Transfer the sample into the flask and rinse in with methanol'), advance: 120, disabled: (S) => neat(S), log: (S) => L(`Проба амина (${n(S.mAmine, 4)} г) перенесена в мерную колбу на 10 мл`, `Амин сынамасы (${n(S.mAmine, 4)} г) 10 мл өлшегіш колбаға ауыстырылды`, `Amine sample (${n(S.mAmine, 4)} g) transferred to a 10 mL volumetric flask`) },
    { kind: 'action', id: 'mark', group: L('Раствор в метаноле', 'Метанолдағы ерітінді', 'Methanol solution'), label: L('Довести метанолом до метки (по нижнему мениску)', 'Метанолмен белгіге дейін жеткізу (төменгі мениск бойынша)', 'Make up to the mark with methanol (bottom of the meniscus)'), requires: ['tr'], advance: 90, disabled: (S) => neat(S), log: L('Раствор доведён метанолом до метки', 'Ерітінді метанолмен белгіге дейін жеткізілді', 'Solution made up to the mark with methanol') },
    { kind: 'action', id: 'mix', group: L('Раствор в метаноле', 'Метанолдағы ерітінді', 'Methanol solution'), label: L('Закрыть пробкой и перемешать, переворачивая', 'Тығынмен жауып, аударып араластыру', 'Stopper and mix by inverting'), requires: ['mark'], advance: 60, disabled: (S) => neat(S), obs: (S) => L(`Прозрачный бесцветный раствор, c = ${n(S.mAmine / V_FLASK, 4)} г/мл`, `Мөлдір түссіз ерітінді, c = ${n(S.mAmine / V_FLASK, 4)} г/мл`, `Clear colourless solution, c = ${n(S.mAmine / V_FLASK, 4)} g/mL`) },
  ],
  done: (S, lc) => (neat(S) ? !!lc.done.neat : !!lc.done.mix) && { text: L('Проба готова.', 'Сынама дайын.', 'The sample is ready.') },
  scene: (S, lc) => (neat(S) ? polBench() : volFlask(!!(lc.done && lc.done.mark))),
};

const s2 = {
  type: 'lab12-polarimeter', id: 'zero', zero: true, liquid: 'water',
  title: L('Проверка нуля поляриметра', 'Поляриметр нөлін тексеру', 'Checking the polarimeter zero'),
  instr: L('<p>Новое занятие: включите лампу, заполните трубку 1 дм дистиллированной водой и проверьте нулевую точку.</p><p class="note">После воды трубку нужно высушить или ополоснуть исследуемой жидкостью.</p>',
    '<p>Жаңа сабақ: шамды қосып, 1 дм түтікті дистилденген сумен толтырып, нөлдік нүктені тексеріңіз.</p><p class="note">Судан кейін түтікті кептіру немесе зерттелетін сұйықтықпен шаю керек.</p>',
    '<p>A new session: switch on the lamp, fill the 1 dm tube with distilled water and check the zero point.</p><p class="note">After the water the tube must be dried or rinsed with the liquid to be measured.</p>'),
  need: L('Определите нулевую точку', 'Нөлдік нүктені анықтаңыз', 'Find the zero point'),
  sample: L('дистиллированная вода', 'дистилденген су', 'distilled water'), color: 'var(--liquid)',
  tubes: [1, 2], tube: 1, readings: 1, saveAs: 'zero',
};

const s3 = {
  type: 'lab12-polarimeter', id: 'meas', liquid: 'amine',
  title: L('Угол вращения амина', 'Амин айналу бұрышы', 'Angle of rotation of the amine'),
  instr: L('<ol><li>Слейте воду, ополосните трубку исследуемой жидкостью (или высушите её).</li><li>Заполните трубку без пузырьков и снимите <b>три отсчёта</b>.</li></ol><p class="note">(S)-(−)-амин левовращающий: ожидайте отрицательный угол. Неразбавленный амин — только в трубке 1 дм (его мало).</p>',
    '<ol><li>Суды төгіп, түтікті зерттелетін сұйықтықпен шайыңыз (немесе кептіріңіз).</li><li>Түтікті көпіршіксіз толтырып, <b>үш есеп</b> алыңыз.</li></ol><p class="note">(S)-(−)-амин солға айналдырады: теріс бұрыш күтіңіз. Сұйылтылмаған амин — тек 1 дм түтікте (ол аз).</p>',
    '<ol><li>Empty the water and rinse the tube with the liquid to be measured (or dry it).</li><li>Fill the tube without bubbles and take <b>three readings</b>.</li></ol><p class="note">(S)-(−)-amine is laevorotatory: expect a negative angle. Neat amine goes only into the 1 dm tube (there is little of it).</p>'),
  need: L('Снимите три отсчёта', 'Үш есеп алыңыз', 'Take three readings'),
  sample: L('расщеплённый 1-фенилэтиламин', 'ажыратылған 1-фенилэтиламин', 'resolved 1-phenylethylamine'), color: 'rgba(236,224,170,.6)',
  tubes: [1, 2], readings: 3, saveAs: 'sample',
  volume: (S) => (neat(S) ? vol(S) : V_FLASK),
  alpha: (S, tube, lc) => {
    const dil = lc.dil ? 0.04 : 0;            // капли воды в трубке разбавляют пробу
    return neat(S) ? neatAlpha(S.ee, tube, 1 - (1 - S.wDil) * (1 - dil)) : solutionAlpha(S.ee, tube, S.mAmine / V_FLASK, 1 - (1 - S.wDil) * (1 - dil));
  },
  onFill(S, lc, ctx) {
    if (lc.dil) ctx.remark({ key: 'rinse-am', severity: 'major', text: L('трубку после воды не ополоснули и не высушили — проба разбавлена', 'түтік судан кейін шайылмады және кептірілмеді — сынама сұйылды', 'the tube was neither rinsed nor dried after the water — the sample was diluted'),
      whatif: L('Остатки воды разбавляют амин: угол вращения меньше, а оптическая чистота, рассчитанная для c = 0,95 г/мл, получится заниженной.', 'Су қалдықтары аминді сұйылтады: айналу бұрышы кішірейеді, ал c = 0,95 г/мл үшін есептелген оптикалық тазалық төмен шығады.', 'Leftover water dilutes the amine: the angle is smaller and the optical purity calculated for c = 0.95 g/mL comes out too low.') });
  },
};

const s4 = {
  type: 'calc', id: 'purity',
  title: L('Удельное вращение и оптическая чистота', 'Меншікті айналу және оптикалық тазалық', 'Specific rotation and optical purity'),
  instr: L('<p>Рассчитайте исправленный угол, удельное вращение, оптическую чистоту и процент каждого энантиомера.</p><p class="note">[α] = α / (l · c); оптическая чистота (%) = [α]набл / [α]чист × 100 ≈ ee; %(S) = (100 + ee) / 2; %(R) = (100 − ee) / 2. Для неразбавленного амина c = 0,95 г/мл и [α]чист = −40°.</p>',
    '<p>Түзетілген бұрышты, меншікті айналуды, оптикалық тазалықты және әр энантиомердің пайызын есептеңіз.</p><p class="note">[α] = α / (l · c); оптикалық тазалық (%) = [α]бақ / [α]таза × 100 ≈ ee; %(S) = (100 + ee) / 2; %(R) = (100 − ee) / 2. Сұйылтылмаған амин үшін c = 0,95 г/мл және [α]таза = −40°.</p>',
    '<p>Calculate the corrected angle, the specific rotation, the optical purity and the percentage of each enantiomer.</p><p class="note">[α] = α / (l · c); optical purity (%) = [α]obs / [α]pure × 100 ≈ ee; %(S) = (100 + ee) / 2; %(R) = (100 − ee) / 2. For the neat amine c = 0.95 g/mL and [α]pure = −40°.</p>'),
  need: L('Рассчитайте оптическую чистоту', 'Оптикалық тазалықты есептеңіз', 'Calculate the optical purity'),
  fields: [
    { id: 'a', label: L('Угол вращения α (исправленный)', 'Айналу бұрышы α (түзетілген)', 'Angle of rotation α (corrected)'), unit: '°', decimals: 2, tol: 0.01, answer: aCorr,
      formula: (S) => L(`α = ${sg(S.sample.mean)} − (${sg(zeroOf(S))})`, `α = ${sg(S.sample.mean)} − (${sg(zeroOf(S))})`, `α = ${sg(S.sample.mean)} − (${sg(zeroOf(S))})`) },
    { id: 'spec', label: L('Удельное вращение [α]', 'Меншікті айналу [α]', 'Specific rotation [α]'), unit: '°', decimals: 1, tol: 0.01, answer: spec,
      formula: (S) => L(`[α] = ${sg(aCorr(S))} / (${S.sample.tube} × ${n(conc(S), 4)})`, `[α] = ${sg(aCorr(S))} / (${S.sample.tube} × ${n(conc(S), 4)})`, `[α] = ${sg(aCorr(S))} / (${S.sample.tube} × ${n(conc(S), 4)})`),
      hint1: L('Для неразбавленной жидкости c = плотность (0,95 г/мл); для раствора c = масса пробы / 10 мл.', 'Сұйылтылмаған сұйықтық үшін c = тығыздық (0,95 г/мл); ерітінді үшін c = сынама массасы / 10 мл.', 'For the neat liquid c = density (0.95 g/mL); for the solution c = sample mass / 10 mL.') },
    { id: 'op', label: L('Оптическая чистота (≈ ee)', 'Оптикалық тазалық (≈ ee)', 'Optical purity (≈ ee)'), unit: '%', decimals: 1, tol: 0.01, answer: op,
      formula: (S) => L(`${sg(spec(S), 1)} / (${n(ref(S), 1)}) × 100 %`, `${sg(spec(S), 1)} / (${n(ref(S), 1)}) × 100 %`, `${sg(spec(S), 1)} / (${n(ref(S), 1)}) × 100 %`) },
    { id: 's', label: L('Доля (S)-энантиомера', '(S)-энантиомер үлесі', 'Proportion of the (S)-enantiomer'), unit: '%', decimals: 1, tol: 0.01, answer: (S) => percentS(op(S)), formula: (S) => L(`(100 + ${n(op(S), 1)}) / 2`, `(100 + ${n(op(S), 1)}) / 2`, `(100 + ${n(op(S), 1)}) / 2`) },
    { id: 'r', label: L('Доля (R)-энантиомера', '(R)-энантиомер үлесі', 'Proportion of the (R)-enantiomer'), unit: '%', decimals: 1, tol: 0.02, answer: (S) => percentR(op(S)), formula: (S) => L(`(100 − ${n(op(S), 1)}) / 2`, `(100 − ${n(op(S), 1)}) / 2`, `(100 − ${n(op(S), 1)}) / 2`) },
  ],
  saveAs: 'calcP',
};

const s5 = {
  type: 'observe', id: 'concl',
  title: L('Вывод об оптической чистоте', 'Оптикалық тазалық туралы қорытынды', 'Conclusion on optical purity'),
  instr: L('<p>Оцените результат расщепления по найденной оптической чистоте.</p>', '<p>Табылған оптикалық тазалық бойынша ажырату нәтижесін бағалаңыз.</p>', '<p>Assess the result of the resolution from the optical purity you found.</p>'),
  need: L('Сделайте вывод', 'Қорытынды жасаңыз', 'Draw the conclusion'),
  question: L('Что показывает найденная оптическая чистота?', 'Табылған оптикалық тазалық нені көрсетеді?', 'What does the optical purity you found show?'),
  options: [
    { id: 'high', label: L('Высокая (≥ 70 %): амин сильно обогащён (S)-энантиомером, одной кристаллизации достаточно', 'Жоғары (≥ 70 %): амин (S)-энантиомермен қатты байытылған, бір кристалдау жеткілікті', 'High (≥ 70 %): the amine is strongly enriched in the (S)-enantiomer; one crystallisation was enough') },
    { id: 'mid', label: L('Умеренная (40–70 %): соль загрязнена солью (R)-амина — её стоит перекристаллизовать', 'Орташа (40–70 %): тұз (R)-амин тұзымен ластанған — оны қайта кристалдаған жөн', 'Moderate (40–70 %): the salt is contaminated with the (R)-amine salt — it should be recrystallised') },
    { id: 'low', label: L('Низкая (< 40 %): разделение диастереомеров почти не прошло', 'Төмен (< 40 %): диастереомерлер бөлінуі дерлік жүрмеді', 'Low (< 40 %): the diastereomers were hardly separated') },
    { id: 'rac', label: L('Угол положительный: получен (R)-(+)-амин', 'Бұрыш оң: (R)-(+)-амин алынды', 'The angle is positive: (R)-(+)-amine was obtained') },
  ],
  correct: (S) => { const p = op(S); return p >= 70 ? 'high' : p >= 40 ? 'mid' : 'low'; },
  why: (S) => L(`Оптическая чистота ${n(op(S), 1)} %: (S) — ${n(percentS(op(S)), 1)} %, (R) — ${n(percentR(op(S)), 1)} %.`, `Оптикалық тазалық ${n(op(S), 1)} %: (S) — ${n(percentS(op(S)), 1)} %, (R) — ${n(percentR(op(S)), 1)} %.`, `Optical purity ${n(op(S), 1)} %: (S) ${n(percentS(op(S)), 1)} %, (R) ${n(percentR(op(S)), 1)} %.`),
  scene: () => polBench(),
};

const s6 = {
  type: 'quiz', id: 'q',
  title: L('Вопросы преподавателя', 'Оқытушының сұрақтары', 'The instructor’s questions'),
  instr: L('<p>Ответьте на вопросы по результатам. Каждая ошибка записывается в журнал.</p>', '<p>Нәтижелер бойынша сұрақтарға жауап беріңіз. Әр қате журналға жазылады.</p>', '<p>Answer the questions about your results. Every wrong answer is recorded in the notebook.</p>'),
  need: L('Ответьте на все вопросы', 'Барлық сұраққа жауап беріңіз', 'Answer all the questions'),
  questions: [
    { q: L('Как повысить оптическую чистоту полученного амина?', 'Алынған аминнің оптикалық тазалығын қалай арттыруға болады?', 'How can the optical purity of the amine be increased?'),
      options: [L('Перекристаллизовать диастереомерную соль и снова освободить амин', 'Диастереомерлі тұзды қайта кристалдап, аминді қайта бөліп алу', 'Recrystallise the diastereomeric salt and liberate the amine again'), L('Перегнать амин', 'Аминді айдау', 'Distil the amine'), L('Высушить амин над Na₂SO₄ дольше', 'Аминді Na₂SO₄ үстінде ұзағырақ кептіру', 'Dry the amine over Na₂SO₄ for longer'), L('Измерить в трубке 2 дм', '2 дм түтікте өлшеу', 'Measure it in a 2 dm tube')],
      correct: 0, why: L('Перекристаллизация соли удаляет соль (R)-амина (методичка, опыт 3). Перегонка не разделяет энантиомеры: их т. кип. одинаковы.', 'Тұзды қайта кристалдау (R)-амин тұзын кетіреді (әдістеме, 3-тәжірибе). Айдау энантиомерлерді бөлмейді: олардың қайнау t бірдей.', 'Recrystallising the salt removes the (R)-amine salt (manual, experiment 3). Distillation does not separate enantiomers: their boiling points are identical.') },
    { q: L('Почему вода или эфир, оставшиеся в амине, занижают оптическую чистоту?', 'Аминде қалған су немесе эфир неліктен оптикалық тазалықты төмендетеді?', 'Why does water or ether left in the amine lower the optical purity found?'),
      options: [L('Они разбавляют амин: реальная концентрация меньше 0,95 г/мл, а в расчёт взята плотность', 'Олар аминді сұйылтады: нақты концентрация 0,95 г/мл-ден аз, ал есептеуге тығыздық алынған', 'They dilute the amine: the real concentration is below 0.95 g/mL, but the density was used in the calculation'), L('Они вращают плоскость поляризации в другую сторону', 'Олар поляризация жазықтығын басқа жаққа бұрады', 'They rotate the plane of polarisation the other way'), L('Они рацемизуют амин', 'Олар аминді рацемизациялайды', 'They racemise the amine')],
      correct: 0, why: L('Вода и эфир оптически неактивны: они лишь уменьшают долю амина в трубке.', 'Су мен эфир оптикалық белсенді емес: олар түтіктегі амин үлесін ғана азайтады.', 'Water and ether are optically inactive: they only lower the proportion of amine in the tube.') },
    { q: L('Где находится (R)-энантиомер амина после опыта 2?', '2-тәжірибеден кейін аминнің (R)-энантиомері қайда?', 'Where is the (R)-enantiomer of the amine after experiment 2?'),
      options: [L('В основном в метанольном маточном растворе в виде более растворимой соли', 'Негізінен метанолды аналық ерітіндіде көбірек еритін тұз түрінде', 'Mostly in the methanol mother liquor, as the more soluble salt'), L('В эфирном экстракте', 'Эфир экстрактында', 'In the ether extract'), L('Он разложился щёлочью', 'Ол сілтімен ыдырады', 'It was decomposed by the alkali')],
      correct: 0, why: L('Соль (R)-амина с (R,R)-винной кислотой лучше растворима в метаноле и остаётся в фильтрате.', '(R)-Аминнің (R,R)-шарап қышқылымен тұзы метанолда жақсырақ ериді және фильтратта қалады.', 'The (R)-amine salt of (R,R)-tartaric acid is more soluble in methanol and stays in the filtrate.') },
  ],
};

const s7 = {
  type: 'cleanup', id: 'clean',
  title: L('Уборка и мытьё трубки', 'Жинау және түтікті жуу', 'Cleaning up and washing the tube'),
  instr: L('<p>Трубку поляриметра чистят сразу после измерения (раздел 7 методички). Амин едкий — перчатки. Растворители — в ёмкость для органических отходов.</p>', '<p>Поляриметр түтігін өлшегеннен кейін бірден тазалайды (әдістеменің 7-бөлімі). Амин күйдіргіш — қолғап. Еріткіштер — органикалық қалдықтар ыдысына.</p>', '<p>The polarimeter tube is cleaned immediately after the measurement (manual, section 7). The amine is corrosive — gloves. Solvents go into the organic waste container.</p>'),
  need: L('Уберите рабочее место', 'Жұмыс орнын жинаңыз', 'Clean up the bench'),
  bins: ['organic', 'acid', 'solid', 'sink', 'trash'],
  items: [
    { id: 'amine', bin: 'organic', label: L('Амин (или его раствор в метаноле) после измерения', 'Өлшеуден кейінгі амин (немесе оның метанолдағы ерітіндісі)', 'Amine (or its methanol solution) after the measurement'),
      wrong: { sink: { severity: 'safety', text: L('едкий амин вылит в раковину (п. 10.2 правил ТБ)', 'күйдіргіш амин раковинаға төгілді (ҚТ ережелерінің 10.2-тармағы)', 'corrosive amine poured down the sink (safety rule 10.2)'), whatif: L('Амины токсичны для водоёмов и разъедают трубы; органические вещества собирают в ёмкость для органических отходов.', 'Аминдер су қоймаларына улы және құбырларды жегідей жейді; органикалық заттарды органикалық қалдықтар ыдысына жинайды.', 'Amines are toxic to waterways and corrode the drains; organic substances are collected in the organic waste container.') } } },
    { id: 'rinse', bin: 'organic', label: L('Метанол после промывания трубки', 'Түтікті жуғаннан кейінгі метанол', 'Methanol used to rinse the tube') },
    { id: 'water', bin: 'sink', label: L('Вода после проверки нуля', 'Нөлді тексергеннен кейінгі су', 'Water from the zero check') },
  ],
  switches: [
    { id: 'tube', label: L('Промыть трубку метанолом, затем водой, осушить', 'Түтікті метанолмен, содан кейін сумен жуып, құрғату', 'Rinse the tube with methanol, then water, and dry it'), log: L('Трубка поляриметра сразу промыта метанолом и водой и осушена', 'Поляриметр түтігі бірден метанолмен және сумен жуылып, құрғатылды', 'Polarimeter tube rinsed at once with methanol and water and dried') },
    { id: 'lamp', label: L('Выключить лампу поляриметра', 'Поляриметр шамын өшіру', 'Switch off the polarimeter lamp') },
    { id: 'hands', label: L('Вымыть руки', 'Қолды жуу', 'Wash your hands') },
  ],
};

export default {
  id: '3',
  title: L('Определение оптической чистоты расщеплённого амина', 'Ажыратылған аминнің оптикалық тазалығын анықтау', 'Determination of the optical purity of the resolved amine'),
  principle: L('Оптическую чистоту расщеплённого амина находят, сравнивая его удельное вращение с удельным вращением чистого энантиомера ((S)-(−)-1-фенилэтиламин, [α]D ≈ −40°, неразбавленная жидкость).',
    'Ажыратылған аминнің оптикалық тазалығын оның меншікті айналуын таза энантиомердің ((S)-(−)-1-фенилэтиламин, [α]D ≈ −40°, сұйылтылмаған сұйықтық) меншікті айналуымен салыстыру арқылы табады.',
    'The optical purity of the resolved amine is found by comparing its specific rotation with that of the pure enantiomer ((S)-(−)-1-phenylethylamine, [α]D ≈ −40°, neat liquid).'),
  equation: ['optical purity (%) = [α]obs / (−40°) × 100', '% (S) = (100 + ee) / 2;  % (R) = (100 − ee) / 2'],
  initialState: ({ prev, rng }) => {
    const p = prev['2'] || {};
    const p1 = prev['1'] || {};
    return {
      mAmine: p.mAmine ?? 1.1, ee: p.ee ?? 80, wDil: p.wDil ?? 0, route: null,
      pol: { zero: p1.zeroTrue ?? +(Math.round(rng.range(-0.15, 0.15) / 0.05) * 0.05).toFixed(2), lamp: false, last: null },
      zero: null, sample: null,
    };
  },
  checkpoints: [0],
  steps: [s0, s1, s2, s3, s4, s5, s6, s7],
  results(S) {
    const has = !!S.sample;
    return {
      route: S.route, mAmine: S.mAmine, c: conc(S), l: has ? S.sample.tube : 1, zero: zeroOf(S), sample: S.sample,
      alpha: has ? aCorr(S) : null, spec: has ? spec(S) : null, op: has ? op(S) : null, ref: ref(S),
      pS: has ? percentS(op(S)) : null, pR: has ? percentR(op(S)) : null,
    };
  },
  summary: (r) => [
    { label: 'α', value: r.alpha != null ? sg(r.alpha) + '°' : '—' },
    { label: '[α]', value: r.spec != null ? sg(r.spec, 1) + '°' : '—' },
    { label: L('Оптическая чистота', 'Оптикалық тазалық', 'Optical purity'), value: r.op != null ? n(r.op, 1) + ' %' : '—', st: r.op != null && r.op >= 50 ? 'ok' : 'warn' },
  ],
};
