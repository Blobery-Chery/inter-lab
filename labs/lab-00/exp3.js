/** Этап 3. Реактивы, ЛВЖ, кислоты и щёлочи — разделы 4–6 правил ТБ. */
import { L, n } from '../../app/i18n.js';
import { relax } from '../../app/instruments/thermal.js';
import { dilutedPercent, dilutionRise } from './model.js';
import { dilutionScene, spillScene, bench, beaker, conical, steam, flames, STYLE, text, scene } from './scene.js';
import { stageResults } from './common.js';

const WATER = 80, ACIDV = 5;

const sQuiz = {
  type: 'quiz', id: 'q3',
  title: L('Прежде чем взять реактив', 'Реактивті алмас бұрын', 'Before you take a reagent'),
  instr: L('<p>Разделы 4 и 6 правил ТБ: обращение с реактивами, кислотами и щелочами. Ответьте на вопросы.</p>', '<p>ҚТ ережелерінің 4 және 6-бөлімдері: реактивтермен, қышқылдармен және сілтілермен жұмыс. Сұрақтарға жауап беріңіз.</p>', '<p>Sections 4 and 6 of the safety rules: handling reagents, acids and alkalis. Answer the questions.</p>'),
  need: L('Ответьте на все вопросы', 'Барлық сұраққа жауап беріңіз', 'Answer every question'),
  scene: () => bench(`<g transform="translate(60 0)"><rect class="pnl" x="10" y="98" width="56" height="98" rx="6"/><rect class="met" x="26" y="84" width="24" height="16" rx="2"/><rect x="14" y="120" width="48" height="40" fill="var(--panel)" stroke="var(--muted)"/>${text(38, 136, 'H₂SO₄', 'lblb')}${text(38, 150, '96 %', 'lbl')}</g><rect x="180" y="186" width="120" height="10" rx="2" class="met"/>` + beaker({ id: 'l0q3', x: 210, y: 140, w: 50, hh: 46, frac: 0.2 }), L('Склянка с кислотой и поддон', 'Қышқыл құтысы мен науа', 'Acid bottle and a tray')),
  questions: [
    { q: L('Что сделать в первую очередь, прежде чем использовать реактив?', 'Реактивті қолданар алдында ең алдымен не істеу керек?', 'What is the first thing to do before using a reagent?'),
      options: [L('Изучить этикетку и паспорт безопасности: горючесть, токсичность, реакционная способность', 'Этикетка мен қауіпсіздік паспортын оқу: жанғыштығы, уыттылығы, реакцияға қабілеттілігі', 'Read the label and the safety data sheet: flammability, toxicity, reactivity'), L('Понюхать, чтобы узнать запах', 'Иісін білу үшін иіскеу', 'Sniff it to learn the smell'), L('Взять с запасом, чтобы не ходить второй раз', 'Қайта бармау үшін артығымен алу', 'Take extra so you need not come back')], correct: 0,
      why: L('П. 4.1; брать — только нужное количество (п. 4.2).', '4.1-тармақ; тек қажетті мөлшерін алу (4.2-тармақ).', 'Rule 4.1; take only the amount you need (rule 4.2).') },
    { q: L('Где и как переносят и разливают концентрированные кислоты и щёлочи?', 'Концентрлі қышқылдар мен сілтілерді қай жерде және қалай тасымалдап, құяды?', 'Where and how are concentrated acids and alkalis carried and poured?'),
      options: [L('Только в вытяжном шкафу, на подставке или поддоне', 'Тек тартпа шкафта, тұғырда немесе науада', 'Only in the fume hood, on a stand or tray'), L('На рабочем столе у окна', 'Терезе жанындағы жұмыс үстелінде', 'On the bench by the window'), L('В раковине, чтобы сразу смыть пролитое', 'Төгілгенін бірден жуу үшін раковинада', 'In the sink, so spills are washed away at once')], correct: 0,
      why: L('П. 6.1: поддон удерживает пролив.', '6.1-тармақ: науа төгілген сұйықты ұстап қалады.', 'Rule 6.1: the tray contains any spill.') },
    { q: L('Как набрать 1 мл 10 % NaOH градуированной пипеткой?', '10 % NaOH-ның 1 мл-ін бөлікті пипеткамен қалай алу керек?', 'How do you draw up 1 mL of 10 % NaOH with a graduated pipette?'),
      options: [L('Резиновой грушей или автоматическим дозатором', 'Резеңке алмұртпен немесе автоматты мөлшерлегішпен', 'With a rubber bulb or an automatic dispenser'), L('Ртом, но осторожно', 'Аузымен, бірақ абайлап', 'By mouth, but carefully'), L('Ртом через ватный тампон', 'Аузымен мақта тампон арқылы', 'By mouth through a cotton plug')], correct: 0,
      why: L('П. 6.2: набор ртом категорически запрещён.', '6.2-тармақ: аузымен тартуға қатаң тыйым салынған.', 'Rule 6.2: mouth pipetting is strictly forbidden.') },
  ],
};

const sExcess = {
  type: 'decide', id: 'excess',
  title: L('Лишний реактив', 'Артық реактив', 'Surplus reagent'),
  instr: L('<p>По методике нужно 10 мл ацетона, а вы налили в цилиндр 12 мл. Куда деть лишние 2 мл?</p>', '<p>Әдістеме бойынша 10 мл ацетон керек, ал сіз цилиндрге 12 мл құйдыңыз. Артық 2 мл-ді қайда жіберу керек?</p>', '<p>The method calls for 10 mL of acetone, but you have poured 12 mL into the cylinder. What do you do with the extra 2 mL?</p>'),
  need: L('Примите решение', 'Шешім қабылдаңыз', 'Make a decision'),
  scene: () => bench(`<rect class="gl" x="150" y="60" width="30" height="132" rx="3"/><rect class="liq" x="152" y="96" width="26" height="94"/><rect class="gl" x="140" y="190" width="50" height="6" rx="2"/>` + `<g transform="translate(210 0)"><rect class="pnl" x="10" y="110" width="50" height="86" rx="6"/><rect class="met" x="24" y="96" width="22" height="16" rx="2"/>${text(35, 160, L('ацетон', 'ацетон', 'acetone'), 'lblb')}</g>`, L('12 мл вместо 10', '10 орнына 12 мл', '12 mL instead of 10')),
  options: [
    { id: 'waste', ok: true, label: L('Слить в ёмкость для отходов органических растворителей', 'Органикалық еріткіш қалдықтарының ыдысына төгу', 'Pour it into the organic solvent waste container'),
      why: L('Неиспользованный реактив в склянку не возвращают (п. 4.2); органику — в свой контейнер (п. 10.1).', 'Пайдаланылмаған реактив құтыға қайтарылмайды (4.2-тармақ); органика — өз ыдысына (10.1-тармақ).', 'Unused reagent never goes back into the bottle (rule 4.2); organics go into their own container (rule 10.1).'),
      log: L('Излишек ацетона (2 мл) слит в ёмкость для органических отходов', 'Артық ацетон (2 мл) органикалық қалдықтар ыдысына төгілді', 'Surplus acetone (2 mL) poured into the organic waste container') },
    { id: 'back', ok: false, severity: 'minor', retry: true, label: L('Вылить обратно в склянку — не пропадать же', 'Құтыға қайта құю — босқа кетпесін', 'Pour it back into the bottle — no point wasting it'),
      remark: L('реактив возвращён в склянку (п. 4.2)', 'реактив құтыға қайтарылды (4.2-тармақ)', 'reagent returned to the stock bottle (rule 4.2)'),
      whatif: L('В цилиндре могли быть следы воды или другого вещества — загрязнится вся склянка, и опыты всей группы дадут неверный результат.', 'Цилиндрде судың немесе басқа заттың іздері болуы мүмкін — бүкіл құты ластанып, бүкіл топтың тәжірибелері қате нәтиже береді.', 'The cylinder may hold traces of water or something else — the whole bottle is contaminated and the whole group’s experiments go wrong.') },
    { id: 'sink', ok: false, severity: 'safety', retry: true, label: L('Вылить в раковину и смыть водой', 'Раковинаға төгіп, сумен шаю', 'Pour it down the sink with water'),
      remark: L('органический растворитель вылит в раковину (п. 10.2)', 'органикалық еріткіш раковинаға төгілді (10.2-тармақ)', 'organic solvent poured down the sink (rule 10.2)'),
      whatif: L('Пары ацетона из канализации скапливаются у пола и могут вспыхнуть от искры; растворители в раковину сливать запрещено.', 'Кәрізден шыққан ацетон булары еден маңында жиналып, ұшқыннан тұтануы мүмкін; еріткіштерді раковинаға төгуге тыйым салынған.', 'Acetone vapour from the drain gathers near the floor and can flash from a spark; solvents must never go down the sink.') },
  ],
};

/* ------------------------------------------------------------ разбавление кислоты (п. 4.3) */
const WATER_TO_ACID = {
  ru: 'Вода легче концентрированной серной кислоты и растекается по её поверхности. В месте контакта выделяется столько тепла, что вода мгновенно вскипает, и горячая кислота вместе с паром выбрасывается из стакана — на руки, лицо, стол. В реальной лаборатории это химический ожог и срочное промывание у фонтанчика и аварийного душа. Раствор готовят заново: сначала вода, затем кислота — медленно, по стенке, при перемешивании.',
  kk: 'Су концентрлі күкірт қышқылынан жеңіл және оның бетіне жайылады. Түйіскен жерде соншалық көп жылу бөлінеді, су лезде қайнап, ыстық қышқыл бумен бірге стақаннан атылып шығады — қолға, бетке, үстелге. Нақты зертханада бұл — химиялық күйік және фонтан мен апаттық душ жанында шұғыл жуу. Ерітінді қайта дайындалады: алдымен су, содан кейін қышқыл — баяу, қабырға бойымен, араластыра отырып.',
  en: 'Water is lighter than concentrated sulfuric acid and spreads over its surface. So much heat is released at the interface that the water boils instantly and hot acid is thrown out of the beaker with the steam — onto hands, face and bench. In a real lab this means a chemical burn and urgent rinsing at the eyewash and safety shower. The solution is made again: water first, then the acid — slowly, down the wall, with stirring.',
};

const sDilute = {
  type: 'process', id: 'dilute',
  title: L('Разбавление серной кислоты', 'Күкірт қышқылын сұйылту', 'Diluting sulfuric acid'),
  instr: L(`<p>Приготовьте ≈ 10 % раствор H₂SO₄ в вытяжном шкафу: <b>${WATER} мл</b> дистиллированной воды и <b>${ACIDV} мл</b> конц. H₂SO₄ (96 %, d 1,84) в стакане на 150 мл.</p><ol><li>Порядок смешения выберите сами — кнопками.</li><li>Следите за термометром: разбавление идёт с сильным разогреванием.</li></ol><p class="note">П. 4.3: кислоту приливают в воду, медленно, при постоянном перемешивании — никогда не наоборот.</p>`,
    `<p>Тартпа шкафта ≈ 10 % H₂SO₄ ерітіндісін дайындаңыз: 150 мл стақанда <b>${WATER} мл</b> дистилденген су және <b>${ACIDV} мл</b> конц. H₂SO₄ (96 %, d 1,84).</p><ol><li>Араластыру ретін өзіңіз таңдаңыз — батырмалармен.</li><li>Термометрді қадағалаңыз: сұйылту қатты қызумен жүреді.</li></ol><p class="note">4.3-тармақ: қышқылды суға баяу, үздіксіз араластыра отырып құяды — ешқашан керісінше емес.</p>`,
    `<p>Make ≈ 10 % H₂SO₄ in the fume hood: <b>${WATER} mL</b> of distilled water and <b>${ACIDV} mL</b> of conc. H₂SO₄ (96 %, d 1.84) in a 150 mL beaker.</p><ol><li>Choose the order of mixing yourself, with the buttons.</li><li>Watch the thermometer: dilution releases a lot of heat.</li></ol><p class="note">Rule 4.3: acid is added to water, slowly, with constant stirring — never the other way round.</p>`),
  need: L(`${WATER} мл воды + ${ACIDV} мл кислоты, верным способом`, `${WATER} мл су + ${ACIDV} мл қышқыл, дұрыс тәсілмен`, `${WATER} mL water + ${ACIDV} mL acid, the right way`),
  speeds: [5, 10, 20],
  setup(S) { S.dil = S.dil || { water: 0, acid: 0, T: 22, acidFirst: false, last: -999, spatter: false, maxT: 22 }; },
  controls: [
    { kind: 'action', id: 'water', group: L('Стакан на 150 мл', '150 мл стақан', '150 mL beaker'), label: L(`Налить ${WATER} мл дистиллированной воды`, `${WATER} мл дистилденген су құю`, `Pour in ${WATER} mL of distilled water`), advance: 60,
      do(S, lc, ctx) {
        if (S.dil.acidFirst) {
          ctx.remark({ key: 'water-to-acid', severity: 'critical', text: L('вода прилита к концентрированной серной кислоте (п. 4.3)', 'су концентрлі күкірт қышқылына құйылды (4.3-тармақ)', 'water added to concentrated sulfuric acid (rule 4.3)'), critical: { text: WATER_TO_ACID } });
          S.dil.spatter = true;
          return;
        }
        S.dil.water = WATER;
      },
      log: L(`В стакан налито ${WATER} мл дистиллированной воды`, `Стақанға ${WATER} мл дистилденген су құйылды`, `${WATER} mL of distilled water poured into the beaker`) },
    { kind: 'toggle', id: 'stir', group: L('Стакан на 150 мл', '150 мл стақан', '150 mL beaker'), label: L('Перемешивать палочкой', 'Таяқшамен араластыру', 'Stir with a rod'), labelOn: L('Перемешивание: вкл.', 'Араластыру: қосулы', 'Stirring: on') },
    { kind: 'action', id: 'acid', once: false, group: L('Конц. H₂SO₄ (цилиндр 10 мл)', 'Конц. H₂SO₄ (10 мл цилиндр)', 'Conc. H₂SO₄ (10 mL cylinder)'), label: L('Прилить 1 мл по стенке', 'Қабырға бойымен 1 мл құю', 'Add 1 mL down the wall'), advance: 15,
      disabled: (S) => S.dil.acid >= ACIDV || S.dil.dumped,
      do(S, lc, ctx) {
        const D = S.dil, now = ctx.now();
        if (!D.water) {
          D.acidFirst = true; D.acid += 1;
          ctx.log(L('В пустой стакан налит 1 мл конц. H₂SO₄', 'Бос стақанға 1 мл конц. H₂SO₄ құйылды', '1 mL of conc. H₂SO₄ put into the empty beaker'));
          ctx.feedback(L('В стакане концентрированная кислота. Подумайте, что будет дальше.', 'Стақанда концентрлі қышқыл. Әрі қарай не болатынын ойлаңыз.', 'There is concentrated acid in the beaker. Think about what comes next.'), 'warn');
          return;
        }
        const quick = now - D.last < 20;
        if (!lc.c.stir) ctx.remark({ key: 'nostir', severity: 'minor', text: L('кислоту приливали без перемешивания (п. 4.3)', 'қышқыл араластырусыз құйылды (4.3-тармақ)', 'acid added without stirring (rule 4.3)') });
        const rise = dilutionRise(1, D.water + D.acid * 1.84) * (lc.c.stir ? 1 : 1.25) * (quick ? 1.2 : 1);
        D.T += rise; D.acid += 1; D.last = now; D.maxT = Math.max(D.maxT, D.T);
        if (!lc.c.stir && quick) D.spatter = true;
        ctx.log(L(`Прилит 1 мл конц. H₂SO₄ (всего ${n(D.acid, 0)} мл); температура ${n(D.T, 1)} °C`, `1 мл конц. H₂SO₄ құйылды (барлығы ${n(D.acid, 0)} мл); температура ${n(D.T, 1)} °C`, `1 mL of conc. H₂SO₄ added (${n(D.acid, 0)} mL in total); temperature ${n(D.T, 1)} °C`));
      } },
    { kind: 'action', id: 'dump', group: L('Конц. H₂SO₄ (цилиндр 10 мл)', 'Конц. H₂SO₄ (10 мл цилиндр)', 'Conc. H₂SO₄ (10 mL cylinder)'), label: L('Влить всю оставшуюся кислоту сразу', 'Қалған қышқылды бірден құю', 'Pour in all the remaining acid at once'), cls: 'danger',
      disabled: (S) => S.dil.acid >= ACIDV || !S.dil.water, advance: 10,
      do(S, lc, ctx) { dump(S, ctx); } },
  ],
  tick(S, lc, dt) {
    const D = S.dil;
    D.T = relax(D.T, 22, lc.c.stir ? 0.0022 : 0.0015, dt);
    if (D.spatter && D.T < 40) D.spatter = false;
    D.stir = !!lc.c.stir;
  },
  readouts: (S) => [
    { label: L('Вода', 'Су', 'Water'), value: L(`${n(S.dil.water, 0)} мл`, `${n(S.dil.water, 0)} мл`, `${n(S.dil.water, 0)} mL`), st: S.dil.water === WATER ? 'ok' : '' },
    { label: 'H₂SO₄', value: L(`${n(S.dil.acid, 0)} / ${ACIDV} мл`, `${n(S.dil.acid, 0)} / ${ACIDV} мл`, `${n(S.dil.acid, 0)} / ${ACIDV} mL`), st: S.dil.acid >= ACIDV ? 'ok' : '' },
    { label: L('Температура', 'Температура', 'Temperature'), value: n(S.dil.T, 1) + ' °C', st: S.dil.T > 45 ? 'bad' : S.dil.T > 35 ? 'warn' : '' },
  ],
  alerts: (S) => (S.dil.acidFirst && !S.dil.water ? { text: L('Кислота уже в стакане. Прилить к ней воду — нельзя (п. 4.3).', 'Қышқыл стақанда тұр. Оған су құюға болмайды (4.3-тармақ).', 'The acid is already in the beaker. Adding water to it is forbidden (rule 4.3).'), kind: 'warn' } : S.dil.T > 35 ? { text: L('Раствор заметно разогрелся — дайте ему остыть, перемешивая.', 'Ерітінді айтарлықтай қызды — араластыра отырып, салқындауына мүмкіндік беріңіз.', 'The solution has warmed noticeably — let it cool while stirring.'), kind: 'warn' } : null),
  events: [
    { id: 'warm', when: (S) => S.dil.T > 33 && S.dil.acid < ACIDV && !S.dil.dumped,
      title: L('Стакан горячий', 'Стақан ыстық', 'The beaker is hot'),
      text: L('Стакан стал горячим на ощупь, над раствором лёгкий пар. Осталось прилить ещё немного кислоты. Как поступить?', 'Стақан ұстағанда ыстық, ерітінді үстінде жеңіл бу. Тағы аздап қышқыл құю қалды. Не істеу керек?', 'The beaker feels hot and there is a faint vapour above the solution. A little more acid is still to be added. What do you do?'),
      options: [
        { ok: true, label: L('Подождать, перемешивая, при необходимости охладить стакан в бане с холодной водой; затем продолжить медленно', 'Араластыра отырып күту, қажет болса стақанды суық су моншасында салқындату; содан кейін баяу жалғастыру', 'Wait while stirring, cooling the beaker in a cold-water bath if needed; then carry on slowly'), effect(S) { S.dil.T -= 4; } },
        { ok: false, severity: 'major', label: L('Влить остаток сразу, чтобы быстрее закончить', 'Тезірек бітіру үшін қалғанын бірден құю', 'Pour in the rest at once to finish faster'),
          remark: L('при разогревании кислоту влили сразу, а не порциями', 'қызған кезде қышқыл порциялап емес, бірден құйылды', 'acid poured in all at once while the solution was already hot'),
          whatif: L('Нагрев складывается: раствор закипит местами, брызги кислоты вылетят из стакана.', 'Қызу қосылады: ерітінді жергілікті қайнап, қышқыл шашырандылары стақаннан ұшып шығады.', 'The heat adds up: the solution boils locally and acid splashes fly out of the beaker.'),
          effect(S, lc, ctx) { dump(S, ctx, true); } },
      ] },
  ],
  done(S, lc, ctx) {
    const D = S.dil;
    if (D.water === WATER && D.acid >= ACIDV && !D.acidFirst && D.T < 40) {
      const w = dilutedPercent(ACIDV, WATER);
      S.dilution = { w, maxT: D.maxT, dumped: !!D.dumped };
      ctx.log(L(`Получено ≈ ${n(w, 1)} % раствора H₂SO₄; при разбавлении раствор разогрелся до ${n(D.maxT, 1)} °C`, `≈ ${n(w, 1)} % H₂SO₄ ерітіндісі алынды; сұйылту кезінде ерітінді ${n(D.maxT, 1)} °C-қа дейін қызды`, `≈ ${n(w, 1)} % H₂SO₄ obtained; the solution warmed to ${n(D.maxT, 1)} °C on dilution`), 'obs');
      return { text: L(`Раствор готов: ≈ ${n(w, 1)} % H₂SO₄. Склянку подпишите.`, `Ерітінді дайын: ≈ ${n(w, 1)} % H₂SO₄. Құтыға жазу жапсырыңыз.`, `The solution is ready: ≈ ${n(w, 1)} % H₂SO₄. Label the bottle.`) };
    }
    if (D.water === WATER && D.acid >= ACIDV && D.T >= 40) return false;
    return false;
  },
  scene: (S) => dilutionScene(S),
  hints: [
    L('Вспомните п. 4.3: что во что приливают и почему.', '4.3-тармақты еске түсіріңіз: нені неге құяды және неліктен.', 'Remember rule 4.3: what goes into what, and why.'),
    L('Сначала вода в стакане, включите перемешивание; кислоту — по 1 мл, давая раствору остыть.', 'Алдымен стақанға су, араластыруды қосыңыз; қышқылды 1 мл-ден, ерітіндінің салқындауына мүмкіндік бере отырып.', 'Water in the beaker first, switch on stirring; add the acid 1 mL at a time and let the solution cool.'),
    L(`«Налить ${WATER} мл дистиллированной воды» → «Перемешивать палочкой» → 5 × «Прилить 1 мл по стенке» с паузами; дождаться, пока температура опустится ниже 40 °C.`, `«${WATER} мл дистилденген су құю» → «Таяқшамен араластыру» → үзіліспен 5 × «Қабырға бойымен 1 мл құю»; температура 40 °C-тан төмен түскенше күту.`, `“Pour in ${WATER} mL of distilled water” → “Stir with a rod” → 5 × “Add 1 mL down the wall” with pauses; wait until the temperature is below 40 °C.`),
  ],
};

function dump(S, ctx, fromEvent) {
  const D = S.dil, rest = ACIDV - D.acid;
  if (rest <= 0) return;
  D.T += dilutionRise(rest, D.water + D.acid * 1.84) * 1.6;
  D.acid = ACIDV; D.dumped = true; D.spatter = true; D.maxT = Math.max(D.maxT, D.T);
  if (!fromEvent) ctx.remark({ key: 'dump', severity: 'safety', text: L('кислоту влили в воду сразу, а не медленно порциями (п. 4.3)', 'қышқыл суға баяу порциялап емес, бірден құйылды (4.3-тармақ)', 'acid poured into the water all at once instead of slowly (rule 4.3)'),
    whatif: L('Тепло выделяется в одном месте быстрее, чем раствор успевает его рассеять: местное вскипание и брызги кислоты.', 'Жылу ерітінді оны таратып үлгергенше бір жерде тез бөлінеді: жергілікті қайнау және қышқыл шашырандылары.', 'Heat is released in one spot faster than the solution can spread it: local boiling and acid splashes.') });
  ctx.log(L(`Вся оставшаяся кислота влита сразу: раствор вскипел местами, брызги; ${n(D.T, 1)} °C`, `Қалған қышқыл бірден құйылды: ерітінді жергілікті қайнап, шашырады; ${n(D.T, 1)} °C`, `All the remaining acid poured in at once: local boiling and splashes; ${n(D.T, 1)} °C`), 'obs');
}

/* ------------------------------------------------------------ ЛВЖ */
const bottle = (name, icon = true) => `<g transform="translate(250 0)"><rect class="pnl" x="10" y="112" width="48" height="84" rx="6"/><rect class="met" x="23" y="98" width="22" height="16" rx="2"/>${text(34, 150, name, 'lblb')}${icon ? '<path d="M16 168 l8 -14 l8 14 z" fill="#f59e0b"/>' : ''}</g>`;
const ETHER = L('эфир', 'эфир', 'ether');
const etherBottle = () => bottle(ETHER);

const ETHER_FIRE = {
  ru: 'Пары диэтилового эфира тяжелее воздуха, стекают со стола и вспыхивают от пламени или раскалённой спирали — огонь мгновенно перебрасывается на колбу и склянку. В реальной лаборатории это пожар: накрыть очаг, отключить нагрев, при необходимости — эвакуация. ЛВЖ нагревают только на водяной или масляной бане либо в колбонагревателе.',
  kk: 'Диэтил эфирінің булары ауадан ауыр, үстелден ағып түсіп, жалыннан немесе қызған спиральдан тұтанады — от колба мен құтыға лезде ауысады. Нақты зертханада бұл — өрт: ошақты жабу, қыздыруды өшіру, қажет болса — эвакуация. Тез тұтанатын сұйықтарды тек су немесе май моншасында не колба қыздырғышта қыздырады.',
  en: 'Diethyl ether vapour is heavier than air, flows off the bench and ignites on a flame or a red-hot coil — the fire flashes back to the flask and the bottle at once. In a real lab that is a fire: smother it, switch off the heating, evacuate if needed. Flammable liquids are heated only on a water or oil bath or in a heating mantle.',
};

const sHood = {
  type: 'decide', id: 'hood',
  title: L('Где работать с эфиром', 'Эфирмен қай жерде жұмыс істеу керек', 'Where to work with ether'),
  instr: L('<p>Нужно отмерить 20 мл диэтилового эфира для экстракции. Где это делать?</p>', '<p>Экстракция үшін 20 мл диэтил эфирін өлшеу керек. Мұны қай жерде істеу керек?</p>', '<p>You need to measure out 20 mL of diethyl ether for an extraction. Where do you do it?</p>'),
  need: L('Выберите место', 'Орынды таңдаңыз', 'Choose the place'),
  scene: () => bench(etherBottle() + `<rect class="gl" x="150" y="80" width="26" height="112" rx="3"/><rect class="gl" x="140" y="190" width="46" height="6" rx="2"/>`, L('Диэтиловый эфир — ЛВЖ, летучий', 'Диэтил эфирі — тез тұтанатын, ұшқыш', 'Diethyl ether — volatile and flammable')),
  options: [
    { id: 'hood', ok: true, label: L('В вытяжном шкафу, экран опущен до рабочего уровня', 'Тартпа шкафта, экран жұмыс деңгейіне дейін түсірілген', 'In the fume hood with the sash lowered to working height'),
      why: L('П. 4.4: летучие растворители — только в вытяжном шкафу с опущенным экраном.', '4.4-тармақ: ұшқыш еріткіштер — тек экраны түсірілген тартпа шкафта.', 'Rule 4.4: volatile solvents only in a fume hood with the sash lowered.'),
      log: L('Эфир отмерен в вытяжном шкафу, экран опущен', 'Эфир тартпа шкафта өлшенді, экран түсірілген', 'Ether measured in the fume hood, sash lowered') },
    { id: 'bench', ok: false, severity: 'safety', retry: true, label: L('На рабочем столе у открытого окна', 'Ашық терезе жанындағы жұмыс үстелінде', 'On the bench by an open window'),
      remark: L('летучий растворитель вне вытяжного шкафа (п. 4.4)', 'ұшқыш еріткіш тартпа шкафтан тыс (4.4-тармақ)', 'volatile solvent outside the fume hood (rule 4.4)'),
      whatif: L('Окно не заменяет тягу: пары эфира растекаются по столу к соседям, к плиткам и розеткам.', 'Терезе тартымды алмастырмайды: эфир булары үстел бойымен көршілерге, плиталар мен розеткаларға жайылады.', 'A window is no substitute for extraction: ether vapour spreads along the bench to neighbours, hot plates and sockets.') },
    { id: 'sash', ok: false, severity: 'safety', retry: true, label: L('В вытяжном шкафу, экран поднять до конца — так удобнее', 'Тартпа шкафта, экранды толық көтеру — ыңғайлырақ', 'In the fume hood with the sash fully raised — more convenient'),
      remark: L('работа в вытяжном шкафу с поднятым экраном (п. 4.4)', 'экраны көтерілген тартпа шкафта жұмыс (4.4-тармақ)', 'working in the fume hood with the sash raised (rule 4.4)'),
      whatif: L('С поднятым экраном тяга слабеет, пары выходят в комнату, а лицо ничем не закрыто от брызг.', 'Экран көтерілгенде тартым әлсірейді, булар бөлмеге шығады, ал бет шашырандылардан ештеңемен жабылмайды.', 'With the sash up the airflow weakens, vapour escapes into the room and your face is unprotected from splashes.') },
  ],
};

const sHeat = {
  type: 'decide', id: 'heat',
  title: L('Чем нагреть эфирный раствор', 'Эфир ерітіндісін немен қыздыру керек', 'How to heat an ether solution'),
  instr: L('<p>Эфирный раствор в круглодонной колбе с обратным холодильником нужно слегка нагреть (т. кип. эфира ≈ 35 °C). Чем?</p>', '<p>Кері мұздатқышы бар түбі дөңгелек колбадағы эфир ерітіндісін аздап қыздыру керек (эфирдің қайнау t ≈ 35 °C). Немен?</p>', '<p>An ether solution in a round-bottomed flask with a reflux condenser has to be warmed gently (b.p. of ether ≈ 35 °C). With what?</p>'),
  need: L('Выберите источник нагрева', 'Қыздыру көзін таңдаңыз', 'Choose the heat source'),
  scene: (S, lc) => bench(`<rect class="met" x="62" y="150" width="4" height="46"/>` + conical({ id: 'l0h', cx: 140, by: 196, s: 0.4, vol: 14, cap: 50 }) + (lc.chosen === 'water' || lc.chosen === 'mantle' ? '' : (lc.tried || []).includes('burner') ? flames(140, 196, 30, 26) : '') + etherBottle(), L('Эфир: т. кип. ≈ 35 °C', 'Эфир: қайнау t ≈ 35 °C', 'Ether: b.p. ≈ 35 °C')),
  options: [
    { id: 'water', ok: true, label: L('На водяной бане', 'Су моншасында', 'On a water bath'), why: L('П. 5.2: водяная или масляная баня, колбонагреватель.', '5.2-тармақ: су немесе май моншасы, колба қыздырғыш.', 'Rule 5.2: a water or oil bath, or a heating mantle.'), log: L('Эфирный раствор нагрет на водяной бане', 'Эфир ерітіндісі су моншасында қыздырылды', 'Ether solution warmed on a water bath') },
    { id: 'mantle', ok: true, label: L('В электрическом колбонагревателе', 'Электр колба қыздырғышта', 'In an electric heating mantle'), why: L('П. 5.2 допускает колбонагревательную установку.', '5.2-тармақ колба қыздырғыш қондырғыны рұқсат етеді.', 'Rule 5.2 allows a heating mantle.'), log: L('Эфирный раствор нагрет в колбонагревателе', 'Эфир ерітіндісі колба қыздырғышта қыздырылды', 'Ether solution warmed in a heating mantle') },
    { id: 'burner', ok: false, label: L('На спиртовке или газовой горелке — так быстрее', 'Спирт шамында немесе газ шілтерінде — тезірек', 'Over a spirit lamp or gas burner — it is quicker'),
      remark: L('ЛВЖ нагревали на открытом пламени (п. 5.2)', 'тез тұтанатын сұйық ашық жалында қыздырылды (5.2-тармақ)', 'flammable liquid heated over an open flame (rule 5.2)'), critical: { text: ETHER_FIRE } },
    { id: 'coil', ok: false, label: L('На плитке с открытой спиралью', 'Ашық спиральды плитада', 'On a hot plate with an exposed coil'),
      remark: L('ЛВЖ нагревали на открытой электрической спирали (п. 5.2)', 'тез тұтанатын сұйық ашық электр спиралінде қыздырылды (5.2-тармақ)', 'flammable liquid heated on an exposed electric coil (rule 5.2)'), critical: { text: ETHER_FIRE } },
  ],
};

const sEtherWaste = {
  type: 'decide', id: 'etherWaste',
  title: L('Остатки эфира', 'Эфир қалдықтары', 'Ether residues'),
  instr: L('<p>После экстракции осталось около 5 мл эфира в стакане. Что с ним делать?</p>', '<p>Экстракциядан кейін стақанда шамамен 5 мл эфир қалды. Онымен не істеу керек?</p>', '<p>After the extraction about 5 mL of ether is left in a beaker. What do you do with it?</p>'),
  need: L('Примите решение', 'Шешім қабылдаңыз', 'Make a decision'),
  scene: () => bench(beaker({ id: 'l0ew', x: 140, y: 150, w: 44, hh: 46, frac: 0.15 }) + steam(162, 146, true) + etherBottle(), L('5 мл эфира', '5 мл эфир', '5 mL of ether')),
  options: [
    { id: 'org', ok: true, label: L('В закрывающуюся ёмкость для отходов органических растворителей', 'Органикалық еріткіш қалдықтарына арналған жабылатын ыдысқа', 'Into the closed organic solvent waste container'), why: L('Пп. 5.5, 10.1.', '5.5, 10.1-тармақтар.', 'Rules 5.5, 10.1.'), log: L('Остатки эфира слиты в ёмкость для органических отходов, ёмкость закрыта', 'Эфир қалдықтары органикалық қалдықтар ыдысына төгілді, ыдыс жабылды', 'Ether residues poured into the organic waste container, container closed') },
    { id: 'sink', ok: false, severity: 'safety', retry: true, label: L('В раковину под струю воды', 'Су ағынымен раковинаға', 'Down the sink under running water'),
      remark: L('эфир вылит в раковину (пп. 5.5, 10.2)', 'эфир раковинаға төгілді (5.5, 10.2-тармақтар)', 'ether poured down the sink (rules 5.5, 10.2)'),
      whatif: L('Эфир не растворяется полностью в воде, его пары поднимаются из стоков и распространяются по полу и столам — вспышка от удалённого источника огня.', 'Эфир суда толық ерімейді, оның булары кәріз құбырларынан көтеріліп, еден мен үстелдерге жайылады — алыстағы от көзінен тұтану.', 'Ether does not fully dissolve in water; its vapour rises from the drains and spreads over floor and benches — a flash fire from a distant ignition source.') },
    { id: 'open', ok: false, severity: 'safety', retry: true, label: L('Оставить в открытом стакане — сам испарится', 'Ашық стақанда қалдыру — өзі буланып кетеді', 'Leave it in the open beaker — it will evaporate'),
      remark: L('эфир оставлен в открытом сосуде (п. 5.5)', 'эфир ашық ыдыста қалдырылды (5.5-тармақ)', 'ether left in an open vessel (rule 5.5)'),
      whatif: L('Испаряясь, эфир создаёт над столом взрывоопасную смесь паров с воздухом.', 'Буланған эфир үстел үстінде будың ауамен жарылыс қаупі бар қоспасын түзеді.', 'As it evaporates, ether forms an explosive vapour–air mixture over the bench.') },
  ],
};

const sMix = {
  type: 'decide', id: 'mix',
  title: L('Смешивание реактивов', 'Реактивтерді араластыру', 'Mixing reagents'),
  instr: L('<p>Колба загрязнена органическим остатком. Сосед предлагает: «Плесни туда концентрированной азотной кислоты и ацетона — всё отмоется». Ваши действия?</p>', '<p>Колба органикалық қалдықпен ластанған. Көршіңіз: «Оған концентрлі азот қышқылы мен ацетон құй — бәрі тазарады» дейді. Сіздің әрекетіңіз?</p>', '<p>A flask is dirty with an organic residue. Your neighbour suggests: “Splash in some concentrated nitric acid and acetone — that will clean it.” What do you do?</p>'),
  need: L('Примите решение', 'Шешім қабылдаңыз', 'Make a decision'),
  scene: () => bench(conical({ id: 'l0mx', cx: 140, by: 196, s: 0.55, vol: 3, cap: 50, solid: 0.4, solidColor: '#8a6d3b' }) + `<g transform="translate(200 0)"><rect class="pnl" x="10" y="112" width="44" height="84" rx="6"/><rect class="met" x="22" y="98" width="20" height="16" rx="2"/>${text(32, 150, 'HNO₃', 'lblb')}</g>` + bottle(L('ацетон', 'ацетон', 'acetone')), L('Окислитель и органика', 'Тотықтырғыш пен органика', 'An oxidiser and an organic solvent')),
  options: [
    { id: 'no', ok: true, label: L('Отказаться: смешивать окислитель с органическим растворителем нельзя; отмыть колбу подходящим способом, спросив преподавателя', 'Бас тарту: тотықтырғышты органикалық еріткішпен араластыруға болмайды; колбаны оқытушыдан сұрап, лайықты тәсілмен жуу', 'Refuse: an oxidiser must not be mixed with an organic solvent; clean the flask a suitable way after asking the instructor'),
      why: L('П. 4.5: смешивать реактивы, не зная результата, запрещено; окислители с органическими растворителями — категорически.', '4.5-тармақ: нәтижесін білмей реактивтерді араластыруға тыйым салынған; тотықтырғыштарды органикалық еріткіштермен — қатаң түрде.', 'Rule 4.5: never mix reagents without knowing the result; oxidisers with organic solvents — absolutely not.'),
      log: L('Отказ от смешивания HNO₃ с ацетоном (п. 4.5)', 'HNO₃-ті ацетонмен араластырудан бас тарту (4.5-тармақ)', 'Refused to mix HNO₃ with acetone (rule 4.5)') },
    { id: 'try', ok: false, severity: 'safety', retry: true, label: L('Сначала проверить в пробирке на капле — посмотреть, что будет', 'Алдымен пробиркада бір тамшымен тексеру — не болатынын көру', 'Test a drop in a test tube first — see what happens'),
      remark: L('попытка смешать реактивы, не зная результата (п. 4.5)', 'нәтижесін білмей реактивтерді араластыру әрекеті (4.5-тармақ)', 'attempt to mix reagents without knowing the outcome (rule 4.5)'),
      whatif: L('«Посмотреть, что будет» — это и есть смешивание с неизвестным результатом. Даже в пробирке смесь может вскипеть и выбросить кислоту.', '«Не болатынын көру» — дәл осы нәтижесі белгісіз араластыру. Пробиркада да қоспа қайнап, қышқылды атып шығаруы мүмкін.', '“Seeing what happens” is exactly mixing with an unknown outcome. Even in a test tube the mixture can boil up and eject acid.') },
    { id: 'do', ok: false, label: L('Сделать, как советует сосед', 'Көршінің кеңесі бойынша істеу', 'Do as the neighbour says'),
      remark: L('смешаны концентрированная HNO₃ (окислитель) и ацетон (п. 4.5)', 'концентрлі HNO₃ (тотықтырғыш) пен ацетон араластырылды (4.5-тармақ)', 'concentrated HNO₃ (an oxidiser) mixed with acetone (rule 4.5)'),
      critical: { text: L('Концентрированная азотная кислота бурно окисляет ацетон: смесь разогревается сама собой, вскипает, выделяет бурые ядовитые пары NO₂ и может выбросить содержимое из колбы. В реальной лаборатории — опустить экран шкафа, отойти, сообщить преподавателю; помещение проветривают.',
        'Концентрлі азот қышқылы ацетонды қарқынды тотықтырады: қоспа өздігінен қызып, қайнайды, қоңыр улы NO₂ буларын бөледі және колбадағыны атып шығаруы мүмкін. Нақты зертханада — шкаф экранын түсіріп, алыстау, оқытушыға хабарлау; бөлме желдетіледі.',
        'Concentrated nitric acid oxidises acetone violently: the mixture heats itself, boils, gives off toxic brown NO₂ and can eject the contents of the flask. In a real lab: lower the sash, step back, tell the instructor; the room is ventilated.') } },
  ],
};

const sSpillAcid = {
  type: 'decide', id: 'spillAcid',
  title: L('Пролив кислоты', 'Қышқыл төгілді', 'An acid spill'),
  instr: L('<p>На стол пролилось немного разбавленной серной кислоты. Что сделать до того, как вытирать?</p>', '<p>Үстелге аздап сұйылтылған күкірт қышқылы төгілді. Сүртпес бұрын не істеу керек?</p>', '<p>A little dilute sulfuric acid has been spilled on the bench. What do you do before wiping it up?</p>'),
  need: L('Выберите средство', 'Құралды таңдаңыз', 'Choose the agent'),
  scene: (S, lc) => spillScene({ kind: 'acid', agent: lc.chosen === 'soda' ? 'soda' : null, fizz: lc.chosen === 'soda', burn: (lc.tried || []).includes('paper') }),
  options: [
    { id: 'soda', ok: true, label: L('Засыпать гидрокарбонатом натрия NaHCO₃, дождаться конца шипения, затем убрать', 'Натрий гидрокарбонатымен NaHCO₃ сеуіп, ысылдың тоқтағанын күтіп, содан кейін жинау', 'Cover it with sodium hydrogen carbonate NaHCO₃, wait until the fizzing stops, then clean up'),
      why: L('П. 6.4: кислоты нейтрализуют гидрокарбонатом натрия.', '6.4-тармақ: қышқылдарды натрий гидрокарбонатымен бейтараптайды.', 'Rule 6.4: acids are neutralised with sodium hydrogen carbonate.'),
      obs: L('При засыпании NaHCO₃ — шипение, выделяется CO₂; после прекращения шипения пролив нейтрализован и убран', 'NaHCO₃ себілгенде — ысылдап, CO₂ бөлінеді; ысыл тоқтағаннан кейін төгілген қышқыл бейтараптанып, жиналды', 'On adding NaHCO₃ — fizzing, CO₂ is evolved; once it stops, the spill is neutralised and cleaned up') },
    { id: 'paper', ok: false, severity: 'safety', retry: true, label: L('Сразу вытереть бумажным полотенцем', 'Бірден қағаз сүлгімен сүрту', 'Wipe it up at once with a paper towel'),
      remark: L('пролив кислоты вытирали без нейтрализации (п. 6.4)', 'төгілген қышқыл бейтараптандырусыз сүртілді (6.4-тармақ)', 'acid spill wiped up without neutralising (rule 6.4)'),
      whatif: L('Бумага пропитывается кислотой и обугливается, кислота попадает на пальцы и разносится по столу.', 'Қағаз қышқылға малынып, көмірленеді, қышқыл саусаққа тиіп, үстел бойымен таралады.', 'The paper soaks up the acid and chars; the acid gets on your fingers and is smeared over the bench.') },
    { id: 'acetic', ok: false, severity: 'major', retry: true, label: L('Полить разбавленной уксусной кислотой', 'Сұйылтылған сірке қышқылын құю', 'Pour dilute acetic acid over it'),
      remark: L('кислоту «нейтрализовали» кислотой', 'қышқылды қышқылмен «бейтараптады»', 'tried to “neutralise” an acid with an acid'),
      whatif: L('Кислота кислоту не нейтрализует: пролив стал только больше. Уксусная кислота нужна для проливов щёлочи.', 'Қышқыл қышқылды бейтараптамайды: төгілген сұйық тек көбейді. Сірке қышқылы сілті төгілгенде қажет.', 'An acid does not neutralise an acid: the spill just got bigger. Acetic acid is for alkali spills.') },
  ],
};

const sSpillBase = {
  type: 'decide', id: 'spillBase',
  title: L('Пролив щёлочи', 'Сілті төгілді', 'An alkali spill'),
  instr: L('<p>Теперь пролили 10 % раствор NaOH. Чем нейтрализовать?</p>', '<p>Енді 10 % NaOH ерітіндісі төгілді. Немен бейтараптау керек?</p>', '<p>Now some 10 % NaOH solution has been spilled. What do you neutralise it with?</p>'),
  need: L('Выберите средство', 'Құралды таңдаңыз', 'Choose the agent'),
  scene: (S, lc) => spillScene({ kind: 'alkali', clean: lc.chosen === 'acid' }),
  options: [
    { id: 'acid', ok: true, label: L('Разбавленной уксусной или лимонной кислотой, затем вытереть', 'Сұйылтылған сірке немесе лимон қышқылымен, содан кейін сүрту', 'Dilute acetic or citric acid, then wipe up'), why: L('П. 6.4.', '6.4-тармақ.', 'Rule 6.4.'),
      obs: L('Пролив щёлочи нейтрализован разбавленной уксусной кислотой и вытерт', 'Төгілген сілті сұйылтылған сірке қышқылымен бейтараптанып, сүртілді', 'Alkali spill neutralised with dilute acetic acid and wiped up') },
    { id: 'soda', ok: false, severity: 'major', retry: true, label: L('Гидрокарбонатом натрия, как кислоту', 'Қышқыл сияқты натрий гидрокарбонатымен', 'Sodium hydrogen carbonate, as for an acid'),
      remark: L('щёлочь «нейтрализовали» гидрокарбонатом натрия', 'сілтіні натрий гидрокарбонатымен «бейтараптады»', 'tried to “neutralise” an alkali with sodium hydrogen carbonate'),
      whatif: L('NaHCO₃ сам слабое основание — щёлочь он не нейтрализует, пролив остаётся едким.', 'NaHCO₃-тің өзі әлсіз негіз — ол сілтіні бейтараптамайды, төгілген сұйық күйдіргіш күйінде қалады.', 'NaHCO₃ is itself a weak base — it does not neutralise the alkali and the spill stays caustic.') },
    { id: 'hand', ok: false, severity: 'safety', retry: true, label: L('Смахнуть тряпкой голой рукой', 'Жалаң қолмен шүберекпен сүртіп тастау', 'Brush it off with a cloth in your bare hand'),
      remark: L('пролив щёлочи убирали без нейтрализации и без перчаток (пп. 3.3, 6.4)', 'төгілген сілті бейтараптандырусыз және қолғапсыз жиналды (3.3, 6.4-тармақтар)', 'alkali spill cleaned without neutralising and without gloves (rules 3.3, 6.4)'),
      whatif: L('Щёлочь разъедает кожу незаметно, без сильной боли сначала, — ожог глубже, чем кажется.', 'Сілті теріні білдірмей, алғашында қатты ауыртпай жеп кетеді — күйік көрінгеннен тереңірек.', 'Alkali eats into the skin quietly, without much pain at first — the burn is deeper than it looks.') },
  ],
};

export default {
  id: '3',
  title: L('Реактивы, ЛВЖ, кислоты и щёлочи', 'Реактивтер, тез тұтанатын сұйықтар, қышқылдар мен сілтілер', 'Reagents, flammable liquids, acids and alkalis'),
  principle: L('Разделы 4–6 правил ТБ: чтение этикетки, количество реактива, разбавление кислоты, вытяжной шкаф, нагрев ЛВЖ, проливы.', 'ҚТ ережелерінің 4–6-бөлімдері: этикетканы оқу, реактив мөлшері, қышқылды сұйылту, тартпа шкаф, тез тұтанатын сұйықтарды қыздыру, төгілулер.', 'Safety rules, sections 4–6: reading labels, reagent quantities, diluting acid, the fume hood, heating flammable liquids, spills.'),
  equation: ['H₂SO₄ + 2NaHCO₃ → Na₂SO₄ + 2H₂O + 2CO₂↑', 'NaOH + CH₃COOH → CH₃COONa + H₂O'],
  initialState: () => ({}),
  checkpoints: [0, 2, 4, 6],
  steps: [sQuiz, sExcess, sDilute, sHood, sHeat, sEtherWaste, sMix, sSpillAcid, sSpillBase],
  results: (S, run) => stageResults(run, { w: S.dilution ? S.dilution.w : null, maxT: S.dilution ? S.dilution.maxT : null, dumped: !!(S.dilution && S.dilution.dumped) }),
  summary: (r) => [
    { label: L('Раствор H₂SO₄', 'H₂SO₄ ерітіндісі', 'H₂SO₄ solution'), value: r.w != null ? `≈ ${n(r.w, 1)} %` : '—', st: 'ok' },
    { label: L('Максимум при разбавлении', 'Сұйылтудағы ең жоғары t', 'Peak on dilution'), value: r.maxT != null ? `${n(r.maxT, 1)} °C` : '—', st: r.dumped ? 'warn' : 'ok' },
    { label: L('Замечаний', 'Ескертулер', 'Remarks'), value: String(r.remarks), st: r.remarks ? 'warn' : 'ok' },
  ],
};
