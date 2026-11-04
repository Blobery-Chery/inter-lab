/** Опыт 2. Реакции молочной кислоты. Методичка, раздел 6, опыт 2. */
import { L, n } from '../../app/i18n.js';
import { relax } from '../../app/instruments/thermal.js';
import { uffelmann, iodine, iodoformRate, iodoformLoss, IODINE_NEED, DROP } from './model.js';
import { tubesScene, bathScene } from './scene.js';

const IODO = '#e3b92c';

/* ---------- 1. Реакция Уффельмана ---------- */
const uTubes = [{ id: 'u', label: L('Пробирка', 'Пробирка', 'Tube'), short: L('реактив Уффельмана', 'Уффельман реактиві', 'Uffelmann’s reagent') }];
function paintU(t) {
  const u = uffelmann({ phenol: !!t.ph, fe: t.fe || 0, lac: t.lac || 0 });
  t.color = u.color; t.share = u.share; t.violet = u.violet;
  if (t.ph && u.violet > 0.25) t.sawViolet = true;
  return u;
}
const s0 = {
  type: 'test', id: 'uff',
  title: L('Реакция Уффельмана', 'Уффельман реакциясы', 'Uffelmann’s test'),
  instr: L('<ol><li>К <b>2 мл</b> 1 % раствора фенола прибавьте <b>1–2 капли</b> 1 % FeCl₃ — появится фиолетовая окраска (реактив Уффельмана).</li><li>Прибавляйте по каплям раствор молочной кислоты и наблюдайте за окраской.</li></ol><p class="note">Фенол токсичен и всасывается через кожу — только в перчатках.</p>',
    '<ol><li>1 % фенол ерітіндісінің <b>2 мл</b> мөлшеріне 1 % FeCl₃-тің <b>1–2 тамшысын</b> қосыңыз — күлгін түс пайда болады (Уффельман реактиві).</li><li>Сүт қышқылы ерітіндісін тамшылатып қосып, түсін бақылаңыз.</li></ol><p class="note">Фенол улы және тері арқылы сіңеді — тек қолғаппен.</p>',
    '<ol><li>To <b>2 mL</b> of 1 % phenol solution add <b>1–2 drops</b> of 1 % FeCl₃ — a violet colour appears (Uffelmann’s reagent).</li><li>Add lactic acid solution dropwise and watch the colour.</li></ol><p class="note">Phenol is toxic and absorbed through the skin — gloves only.</p>'),
  need: L('Добейтесь смены окраски', 'Түстің өзгеруіне қол жеткізіңіз', 'Bring about the colour change'),
  tubes: uTubes, reset: true,
  reagents: [
    { id: 'ph', group: L('Реактив Уффельмана', 'Уффельман реактиві', 'Uffelmann’s reagent'), label: L('Фенол 1 %: 2 мл', 'Фенол 1 %: 2 мл', 'Phenol 1 %: 2 mL'), advance: 20, disabled: (t) => t.ph,
      apply(t, S, ctx) { t.ph = 1; t.v += 2; paintU(t); ctx.log(L('В пробирку отмерено 2 мл 1 % раствора фенола', 'Пробиркаға 1 % фенол ерітіндісінің 2 мл өлшенді', '2 mL of 1 % phenol solution measured into the tube')); } },
    { id: 'fe', group: L('Реактив Уффельмана', 'Уффельман реактиві', 'Uffelmann’s reagent'), label: L('FeCl₃ 1 %: +1 капля', 'FeCl₃ 1 %: +1 тамшы', 'FeCl₃ 1 %: +1 drop'), advance: 5, disabled: (t) => (t.fe || 0) >= 8,
      apply(t, S, ctx) {
        const first = !t.fe;
        t.fe = (t.fe || 0) + 1; t.v += DROP;
        if (first && t.lac) ctx.remark({ key: 'uff_order', severity: 'minor', text: L('нарушен порядок: молочная кислота прибавлена до FeCl₃ — фиолетовый фенолят железа не образовался', 'рет бұзылды: сүт қышқылы FeCl₃-тен бұрын қосылды — темір фенолятының күлгін түсі түзілмеді', 'wrong order: lactic acid added before FeCl₃ — the violet iron phenolate never formed') });
        paintU(t);
        if (t.fe === 3) ctx.feedback(L('По методичке — 1–2 капли. Чем больше FeCl₃, тем больше молочной кислоты нужно для смены окраски.', 'Әдістеме бойынша — 1–2 тамшы. FeCl₃ көп болған сайын, түс өзгеруі үшін сүт қышқылы көбірек қажет.', 'The manual says 1–2 drops. The more FeCl₃, the more lactic acid is needed to change the colour.'), 'warn');
        if (t.fe > 3) ctx.remark({ key: 'uff_fe', severity: 'minor', text: L('избыток FeCl₃ в реактиве Уффельмана: окраска слишком густая, переход маскируется', 'Уффельман реактивінде FeCl₃ артық: түс тым қою, ауысу байқалмайды', 'excess FeCl₃ in Uffelmann’s reagent: the colour is too intense and the change is masked') });
        if (first && t.ph && !t.lac) ctx.log(L('Появилась фиолетовая окраска (фенолят железа(III)) — реактив Уффельмана', 'Күлгін түс пайда болды (темір(III) феноляты) — Уффельман реактиві', 'A violet colour appeared (iron(III) phenolate) — Uffelmann’s reagent'), 'obs');
      } },
    ...[1, 5].map((k) => ({ id: 'lac' + k, group: L('Молочная кислота 1–2 %', 'Сүт қышқылы 1–2 %', 'Lactic acid 1–2 %'), label: L(`+${k} кап.`, `+${k} тамшы`, `+${k} ${k > 1 ? 'drops' : 'drop'}`), advance: 5 * k,
      apply(t, S, ctx) {
        t.lac = (t.lac || 0) + k; t.v += DROP * k; paintU(t);
        if (!t.fe) ctx.feedback(L('Раствор бесцветный: сначала приготовьте реактив Уффельмана (фенол + FeCl₃).', 'Ерітінді түссіз: алдымен Уффельман реактивін дайындаңыз (фенол + FeCl₃).', 'The solution is colourless: prepare Uffelmann’s reagent first (phenol + FeCl₃).'), 'warn');
      } })),
  ],
  done: (tb) => { const t = tb.u; return t.fe > 0 && t.lac > 0 && t.share >= 0.8; },
  observe: {
    question: L('Как изменилась окраска реактива Уффельмана?', 'Уффельман реактивінің түсі қалай өзгерді?', 'How did the colour of Uffelmann’s reagent change?'),
    options: [
      { id: 'ok', label: L('Фиолетовая окраска перешла в жёлто-зелёную', 'Күлгін түс сары-жасыл түске ауысты', 'The violet colour turned yellow-green'), log: (S, tb) => L(`Фиолетовая окраска реактива Уффельмана при прибавлении ${tb.u.lac} кап. молочной кислоты перешла в жёлто-зелёную (лактат железа(III))`, `Сүт қышқылының ${tb.u.lac} тамшысын қосқанда Уффельман реактивінің күлгін түсі сары-жасылға ауысты (темір(III) лактаты)`, `On adding ${tb.u.lac} drops of lactic acid the violet colour of Uffelmann’s reagent turned yellow-green (iron(III) lactate)`) },
      { id: 'noviolet', label: L('Раствор сразу жёлто-зелёный, фиолетовой окраски не было', 'Ерітінді бірден сары-жасыл, күлгін түс болған жоқ', 'The solution was yellow-green at once; there was no violet colour'), log: L('Фиолетовой окраски не было: молочная кислота прибавлена раньше FeCl₃ — раствор сразу жёлто-зелёный', 'Күлгін түс болған жоқ: сүт қышқылы FeCl₃-тен бұрын қосылды — ерітінді бірден сары-жасыл', 'No violet colour: lactic acid was added before FeCl₃ — the solution was yellow-green at once') },
      { id: 'colourless', label: L('Фиолетовая окраска исчезла, раствор бесцветный', 'Күлгін түс жоғалып, ерітінді түссіз', 'The violet colour vanished, the solution is colourless') },
      { id: 'ppt', label: L('Выпал бурый осадок', 'Қоңыр тұнба түзілді', 'A brown precipitate formed') },
    ],
    correct: (S, tb) => (tb.u.sawViolet ? 'ok' : 'noviolet'),
    why: () => L('Лактат-ион — α-гидроксикислота — связывает Fe³⁺ в более прочный жёлто-зелёный комплекс (лактат железа(III)) и разрушает фиолетовый фенолят.', 'Лактат-ион — α-гидроксиқышқыл — Fe³⁺-ті берігірек сары-жасыл кешенге (темір(III) лактаты) байланыстырып, күлгін фенолятты бұзады.', 'Lactate — an α-hydroxy acid — binds Fe³⁺ into a stronger yellow-green complex (iron(III) lactate) and destroys the violet phenolate.'),
  },
  onDone(S, tb) { S.e2.uff = { lac: tb.u.lac, fe: tb.u.fe, saw: !!tb.u.sawViolet }; },
  scene: (S, local) => tubesScene(uTubes, local, { cap: 4 }),
  hint1: L('Сначала реактив Уффельмана: фенол + 1–2 капли FeCl₃ (фиолетовый). Только потом — молочная кислота по каплям.', 'Алдымен Уффельман реактиві: фенол + 1–2 тамшы FeCl₃ (күлгін). Тек содан кейін — сүт қышқылы тамшылап.', 'First Uffelmann’s reagent: phenol + 1–2 drops of FeCl₃ (violet). Only then lactic acid, drop by drop.'),
  hint2: L('Для смены окраски нужно молочной кислоты в несколько раз больше, чем FeCl₃ (по каплям).', 'Түс өзгеруі үшін сүт қышқылы FeCl₃-тен бірнеше есе көп (тамшы бойынша) қажет.', 'To change the colour you need several times more lactic acid than FeCl₃ (in drops).'),
  hint3: L('2 мл фенола → 2 капли FeCl₃ → молочная кислота «+5 кап.» 4 раза (нужно не меньше 16 капель), пока окраска не станет жёлто-зелёной.', '2 мл фенол → 2 тамшы FeCl₃ → сүт қышқылы «+5 тамшы» 4 рет (кемінде 16 тамшы қажет), түсі сары-жасыл болғанша.', '2 mL phenol → 2 drops FeCl₃ → lactic acid “+5 drops” 4 times (at least 16 drops are needed) until the colour is yellow-green.'),
};

/* ---------- 2. Иодоформная проба ---------- */
const s1 = {
  type: 'process', id: 'iodoform',
  title: L('Иодоформная проба', 'Иодоформ сынамасы', 'Iodoform test'),
  instr: L('<ol><li>К <b>1 мл</b> раствора молочной кислоты прибавьте <b>1–2 мл</b> 10 % NaOH.</li><li>По каплям прибавляйте раствор иода в KI, пока не сохранится <b>слабо-жёлтая</b> окраска.</li><li>Осторожно нагрейте на водяной бане до <b>40–50 °C</b> и наблюдайте.</li></ol>',
    '<ol><li><b>1 мл</b> сүт қышқылы ерітіндісіне 10 % NaOH-тың <b>1–2 мл</b> мөлшерін қосыңыз.</li><li><b>Әлсіз сары</b> түс сақталғанша KI-дегі иод ерітіндісін тамшылатып қосыңыз.</li><li>Су моншасында <b>40–50 °C</b>-қа дейін абайлап қыздырып, бақылаңыз.</li></ol>',
    '<ol><li>To <b>1 mL</b> of lactic acid solution add <b>1–2 mL</b> of 10 % NaOH.</li><li>Add iodine–KI solution dropwise until a <b>faint yellow</b> colour persists.</li><li>Warm gently in a water bath to <b>40–50 °C</b> and observe.</li></ol>'),
  need: L('Получите осадок иодоформа', 'Иодоформ тұнбасын алыңыз', 'Obtain the iodoform precipitate'),
  speeds: [5, 10, 30],
  setup(S) { S.io = S.io || { lac: 0, naoh: 0, i: 0, T: 22, Tb: 20, chi3: 0, over: false, maxT: 22 }; },
  controls: [
    { kind: 'action', id: 'lac', group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('Молочная кислота: 1 мл', 'Сүт қышқылы: 1 мл', 'Lactic acid: 1 mL'), advance: 20, do(S) { S.io.lac = 1; }, log: L('В пробирку отмерен 1 мл раствора молочной кислоты', 'Пробиркаға сүт қышқылы ерітіндісінің 1 мл өлшенді', '1 mL of lactic acid solution measured into the tube') },
    { kind: 'action', id: 'naoh', once: false, group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('NaOH 10 %: +0,5 мл', 'NaOH 10 %: +0,5 мл', 'NaOH 10 %: +0.5 mL'), requires: ['lac'], advance: 15, disabled: (S) => S.io.naoh >= 2,
      do(S, lc, ctx) {
        const k = S.io, was = k.naoh; k.naoh = +(k.naoh + 0.5).toFixed(1);
        ctx.log(L(`Прибавлено 0,5 мл 10 % NaOH (всего ${n(k.naoh, 1)} мл)`, `10 % NaOH-тың 0,5 мл қосылды (барлығы ${n(k.naoh, 1)} мл)`, `0.5 mL of 10 % NaOH added (total ${n(k.naoh, 1)} mL)`));
        if (!was && k.i > 0) {
          ctx.remark({ key: 'io_order', severity: 'minor', text: L('нарушен порядок: иод прибавлен до щёлочи', 'рет бұзылды: иод сілтіден бұрын қосылды', 'wrong order: iodine added before the alkali') });
          ctx.log(L('После прибавления щёлочи бурая окраска иода ослабла', 'Сілті қосылғаннан кейін иодтың қоңыр түсі әлсіреді', 'After the alkali was added the brown iodine colour faded'), 'obs');
        }
      } },
    { kind: 'action', id: 'i2', once: false, group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('I₂ в KI: +1 капля', 'KI-дегі I₂: +1 тамшы', 'I₂ in KI: +1 drop'), requires: ['lac'], advance: 8, disabled: (S) => S.io.i >= 16,
      do(S, lc, ctx) {
        const k = S.io; k.i += 1;
        const st = iodine(k);
        if (!k.naoh) { if (k.i === 1) ctx.feedback(L('Иод не обесцвечивается — бурая окраска. Среда щелочная?', 'Иод түссізденбейді — қоңыр түс. Орта сілтілі ме?', 'The iodine is not decolourised — it stays brown. Is the medium alkaline?'), 'warn'); return; }
        if (k.i === IODINE_NEED + 1) { ctx.log(L(`После ${k.i} капель раствора иода сохраняется слабо-жёлтая окраска`, `Иод ерітіндісінің ${k.i} тамшысынан кейін әлсіз сары түс сақталады`, `After ${k.i} drops of iodine solution a faint yellow colour persists`), 'obs'); ctx.feedback(L('Слабо-жёлтая окраска сохраняется — иода достаточно.', 'Әлсіз сары түс сақталады — иод жеткілікті.', 'A faint yellow colour persists — enough iodine.'), 'good'); }
        else if (st.excess === 0) ctx.feedback(L('Капля иода обесцвечивается.', 'Иод тамшысы түссізденеді.', 'The drop of iodine is decolourised.'), 'info');
        if (st.excess > 4) ctx.remark({ key: 'io_many', severity: 'minor', text: L('избыток иода: раствор бурый вместо слабо-жёлтого, осадок иодоформа маскируется', 'иод артық: ерітінді әлсіз сарының орнына қоңыр, иодоформ тұнбасы көрінбейді', 'excess iodine: the solution is brown instead of faint yellow and masks the iodoform') });
      } },
    { kind: 'toggle', id: 'in', group: L('Баня', 'Монша', 'Bath'), label: L('Поставить пробирку в баню', 'Пробирканы моншаға қою', 'Put the tube in the bath'), labelOn: L('Пробирка в бане — вынуть', 'Пробирка моншада — шығару', 'Tube in the bath — take out'),
      when: (S) => S.io.lac > 0, whenText: L('Сначала приготовьте смесь в пробирке.', 'Алдымен пробиркада қоспаны дайындаңыз.', 'First prepare the mixture in the tube.'),
      onChange(S, lc, on, ctx) {
        ctx.log(on ? L(`Пробирка поставлена в водяную баню (${n(S.io.Tb, 0)} °C)`, `Пробирка су моншасына қойылды (${n(S.io.Tb, 0)} °C)`, `Tube placed in the water bath (${n(S.io.Tb, 0)} °C)`) : L('Пробирка вынута из бани', 'Пробирка моншадан шығарылды', 'Tube taken out of the bath'));
        if (on && (!S.io.naoh || S.io.i <= IODINE_NEED)) ctx.feedback(L('Нагревать имеет смысл, когда в щелочной среде сохраняется слабо-жёлтая окраска иода.', 'Сілтілі ортада иодтың әлсіз сары түсі сақталғанда ғана қыздырудың мәні бар.', 'Warming only makes sense once a faint yellow iodine colour persists in alkaline solution.'), 'warn');
      } },
    { kind: 'range', id: 'set', group: L('Терморегулятор бани', 'Монша терморегуляторы', 'Bath thermostat'), label: L('Терморегулятор бани', 'Монша терморегуляторы', 'Bath thermostat'), min: 20, max: 90, step: 5, unit: '°C', default: 20 },
  ],
  tick(S, lc, dt) {
    const k = S.io, set = lc.c.set ?? 20;
    k.Tb = relax(k.Tb, set, 0.004, dt);
    k.T = relax(k.T, lc.c.in ? k.Tb : 22, lc.c.in ? 0.03 : 0.01, dt);
    k.maxT = Math.max(k.maxT, k.T);
    const st = iodine(k);
    if (k.lac && k.naoh && st.limit > 0) k.chi3 = Math.min(st.limit, k.chi3 + iodoformRate(k.T) * dt * (st.limit - k.chi3) * 0.3);
    if (k.T > 60) k.chi3 = Math.max(0, k.chi3 - iodoformLoss(k.T) * dt);
  },
  readouts: (S) => [
    { label: L('Баня', 'Монша', 'Bath'), value: n(S.io.Tb, 1) + ' °C', st: S.io.Tb >= 40 && S.io.Tb <= 50 ? 'ok' : S.io.Tb > 60 ? 'bad' : '' },
    { label: L('Пробирка', 'Пробирка', 'Tube'), value: n(S.io.T, 1) + ' °C', st: S.io.T >= 40 && S.io.T <= 50 ? 'ok' : S.io.T > 60 ? 'bad' : '' },
    { label: L('Иод, кап.', 'Иод, тамшы', 'Iodine, drops'), value: String(S.io.i) },
  ],
  alerts: (S) => {
    const k = S.io;
    if (k.i > 0 && !k.naoh) return { text: L('Бурая окраска иода не исчезает: в пробирке нет щёлочи.', 'Иодтың қоңыр түсі кетпейді: пробиркада сілті жоқ.', 'The brown iodine colour does not fade: there is no alkali in the tube.'), kind: 'warn' };
    if (k.T > 55) return { text: L('Выше 50 °C — нагревают осторожно, только до 40–50 °C.', '50 °C-тан жоғары — абайлап, тек 40–50 °C-қа дейін қыздырады.', 'Above 50 °C — warm gently, only to 40–50 °C.'), kind: 'warn' };
    return null;
  },
  events: [{
    id: 'hot', when: (S) => S.io.T > 62 && S.io.chi3 < 0.6,
    title: L('Резкий запах, муть исчезает', 'Өткір иіс, лай жоғалады', 'Sharp odour, the turbidity disappears'),
    text: L('Температура в пробирке выше 60 °C: появился резкий запах, жёлтая муть исчезает. Что делать?', 'Пробиркадағы температура 60 °C-тан жоғары: өткір иіс пайда болды, сары лай жоғалып барады. Не істейсіз?', 'The tube is above 60 °C: there is a sharp odour and the yellow turbidity is disappearing. What do you do?'),
    options: [
      { ok: true, label: L('Вынуть пробирку, снизить баню до 45 °C', 'Пробирканы шығарып, моншаны 45 °C-қа түсіру', 'Take the tube out and turn the bath down to 45 °C'), effect(S, lc) { lc.c.in = false; lc.c.set = 45; } },
      { ok: false, severity: 'major', label: L('Нагреть сильнее, чтобы реакция прошла до конца', 'Реакция соңына дейін жүруі үшін қаттырақ қыздыру', 'Heat more strongly so the reaction goes to completion'),
        remark: L('перегрев иодоформной пробы выше 60 °C: иодоформ улетучился, осадок почти не виден', 'иодоформ сынамасы 60 °C-тан жоғары қызды: иодоформ ұшып кетті, тұнба әрең көрінеді', 'iodoform test overheated above 60 °C: the iodoform volatilised and the precipitate is barely visible'),
        whatif: L('Иодоформ летуч (уходит с паром), а при сильном нагреве разлагается: вместо жёлтого осадка — слабая муть и резкий запах. Поэтому нагревают «осторожно, до 40–50 °C».', 'Иодоформ ұшқыш (бумен кетеді), қатты қыздырғанда ыдырайды: сары тұнбаның орнына — әлсіз лай және өткір иіс. Сондықтан «абайлап, 40–50 °C-қа дейін» қыздырады.', 'Iodoform is volatile (it leaves with the steam) and decomposes on strong heating: instead of a yellow precipitate you get a faint haze and a sharp odour. That is why you warm “gently, to 40–50 °C”.'),
        effect(S, lc) { S.io.over = true; S.io.chi3 *= 0.3; lc.c.set = 45; } },
    ],
  }],
  chart: { value: (S) => S.io.T, min: 0, max: 100, band: [40, 50], limit: 60, label: L('Температура в пробирке', 'Пробиркадағы температура', 'Tube temperature'), active: (S, lc) => !!lc.c.in || S.io.T > 30 },
  stop: (S) => S.io.chi3 >= 0.6 && S.io.T < 55,
  done(S, lc, ctx) {
    const k = S.io;
    if (!(k.chi3 >= 0.6 && k.T < 55)) return false;
    ctx.log(k.over
      ? L('Жёлтый осадок иодоформа выпал в небольшом количестве, резкий характерный запах (часть иодоформа улетучилась при перегреве)', 'Иодоформның сары тұнбасы аз мөлшерде түзілді, өткір тән иіс (қызып кеткенде иодоформның бір бөлігі ұшып кетті)', 'A small amount of yellow iodoform precipitate with a sharp characteristic odour (part of the iodoform was lost on overheating)')
      : L(`При ${n(k.maxT, 0)} °C выпал жёлтый осадок иодоформа с характерным «аптечным» запахом`, `${n(k.maxT, 0)} °C-та тән «дәріхана» иісі бар иодоформның сары тұнбасы түзілді`, `At ${n(k.maxT, 0)} °C a yellow precipitate of iodoform with its characteristic “medicinal” odour formed`), 'obs');
    S.e2.io = { i: k.i, naoh: k.naoh, over: !!k.over, maxT: k.maxT };
    return { text: L('Иодоформ получен.', 'Иодоформ алынды.', 'Iodoform obtained.') };
  },
  scene: (S, lc) => {
    const k = S.io, st = iodine(k), v = (k.lac ? 1 : 0) + k.naoh + k.i * DROP;
    return bathScene({ t: { v, color: st.color, ppt: k.chi3 > 0.05 ? Math.min(k.over ? 0.3 : 1, k.chi3 * 1.2) : 0, pptColor: IODO }, inBath: !!lc.c.in, Tb: k.Tb, T: k.T, heat: (lc.c.set ?? 20) > 22, mark: 50, cap: 4 });
  },
  hints: [
    L('Иодоформную пробу проводят в щелочной среде: сначала NaOH, потом иод до слабо-жёлтой окраски, потом — мягкое нагревание.', 'Иодоформ сынамасын сілтілі ортада жүргізеді: алдымен NaOH, содан кейін әлсіз сары түске дейін иод, содан кейін — жұмсақ қыздыру.', 'The iodoform test is done in alkaline solution: first NaOH, then iodine to a faint yellow colour, then gentle warming.'),
    L(`Примерно ${IODINE_NEED} капель иода обесцвечиваются; следующая капля даёт устойчивую слабо-жёлтую окраску. Баня — 45 °C, не выше 50 °C.`, `Шамамен ${IODINE_NEED} тамшы иод түссізденеді; келесі тамшы тұрақты әлсіз сары түс береді. Монша — 45 °C, 50 °C-тан жоғары емес.`, `About ${IODINE_NEED} drops of iodine are decolourised; the next drop gives a persistent faint yellow. Bath at 45 °C, no higher than 50 °C.`),
    L(`1 мл молочной кислоты → NaOH 1,5 мл → иод ${IODINE_NEED + 1} капель → баня 45 °C → пробирка в баню → ход времени ×30, дождаться жёлтого осадка.`, `1 мл сүт қышқылы → NaOH 1,5 мл → иод ${IODINE_NEED + 1} тамшы → монша 45 °C → пробирка моншаға → уақыт ×30, сары тұнбаны күту.`, `1 mL lactic acid → NaOH 1.5 mL → iodine ${IODINE_NEED + 1} drops → bath 45 °C → tube in the bath → time ×30, wait for the yellow precipitate.`),
  ],
};

const s2 = {
  type: 'observe', id: 'io-obs',
  title: L('Наблюдение: иодоформ', 'Бақылау: иодоформ', 'Observation: iodoform'),
  instr: L('<p>Опишите результат иодоформной пробы.</p>', '<p>Иодоформ сынамасының нәтижесін сипаттаңыз.</p>', '<p>Describe the result of the iodoform test.</p>'),
  need: L('Выберите точное описание', 'Дәл сипаттаманы таңдаңыз', 'Choose the accurate description'),
  scene: (S) => bathScene({ t: { v: 1 + S.io.naoh + S.io.i * DROP, color: iodine(S.io).color, ppt: Math.min(S.io.over ? 0.3 : 1, S.io.chi3 * 1.2), pptColor: IODO }, inBath: false, Tb: S.io.Tb, T: S.io.T, heat: false, cap: 4 }),
  question: L('Что вы наблюдаете?', 'Не байқайсыз?', 'What do you observe?'),
  options: [
    { id: 'ok', label: L('Жёлтый осадок с характерным запахом иодоформа', 'Иодоформның тән иісі бар сары тұнба', 'A yellow precipitate with the characteristic odour of iodoform') },
    { id: 'little', label: L('Лишь слабая жёлтая муть, резкий запах', 'Тек әлсіз сары лай, өткір иіс', 'Only a faint yellow haze and a sharp odour') },
    { id: 'white', label: L('Белый осадок без запаха', 'Иіссіз ақ тұнба', 'A white odourless precipitate') },
    { id: 'blue', label: L('Синее окрашивание', 'Көк түске боялу', 'A blue colour') },
  ],
  correct: (S) => (S.io.over ? 'little' : 'ok'),
  why: () => L('Фрагмент CH₃–CH(OH)– окисляется иодом в щелочной среде до CH₃–CO– и иодируется; CI₃-группа отщепляется — иодоформ CHI₃, жёлтые кристаллы с характерным запахом.', 'CH₃–CH(OH)– фрагменті сілтілі ортада иодпен CH₃–CO–-ге дейін тотығып, иодталады; CI₃-тобы бөлініп шығады — иодоформ CHI₃, тән иісі бар сары кристалдар.', 'The CH₃–CH(OH)– fragment is oxidised by iodine in alkaline solution to CH₃–CO– and iodinated; the CI₃ group is cleaved off as iodoform CHI₃, yellow crystals with a characteristic odour.'),
};

export default {
  id: '2',
  title: L('Реакции молочной кислоты', 'Сүт қышқылының реакциялары', 'Reactions of lactic acid'),
  principle: L('(а) Реакция Уффельмана: фиолетовый фенолят железа(III) разрушается молочной кислотой, которая связывает Fe³⁺ в жёлто-зелёный лактат железа(III); (б) фрагмент CH₃–CH(OH)– окисляется и иодируется в щелочной среде с образованием иодоформа.', '(а) Уффельман реакциясы: темір(III)-тің күлгін феноляты сүт қышқылымен бұзылады, ол Fe³⁺-ті сары-жасыл темір(III) лактатына байланыстырады; (ә) CH₃–CH(OH)– фрагменті сілтілі ортада тотығып, иодталып, иодоформ түзеді.', '(a) Uffelmann’s test: the violet iron(III) phenolate complex is destroyed by lactic acid, which binds Fe³⁺ as yellow-green iron(III) lactate; (b) the CH₃–CH(OH)– fragment is oxidised and iodinated in alkaline medium to give iodoform.'),
  equation: [L('CH₃–CH(OH)–COOH + I₂ / NaOH → CHI₃↓ + NaOOC–COONa (схема)', 'CH₃–CH(OH)–COOH + I₂ / NaOH → CHI₃↓ + NaOOC–COONa (сұлба)', 'CH₃–CH(OH)–COOH + I₂ / NaOH → CHI₃↓ + NaOOC–COONa (schematic)')],
  initialState: () => ({ e2: { uff: null, io: null } }),
  checkpoints: [0, 1],
  steps: [s0, s1, s2],
  results: (S) => ({ uff: S.e2.uff, io: S.e2.io }),
  summary: (r) => [
    { label: L('Уффельман', 'Уффельман', 'Uffelmann'), value: r.uff && r.uff.saw ? L('фиолет. → жёлто-зел.', 'күлгін → сары-жасыл', 'violet → yellow-green') : L('переход не виден', 'ауысу көрінбеді', 'change not seen'), st: r.uff && r.uff.saw ? 'ok' : 'warn' },
    { label: 'I₂ / NaOH', value: r.io && !r.io.over ? L('CHI₃ ↓ жёлтый', 'CHI₃ ↓ сары', 'CHI₃ ↓ yellow') : L('мало CHI₃', 'CHI₃ аз', 'little CHI₃'), st: r.io && !r.io.over ? 'ok' : 'warn' },
  ],
};
