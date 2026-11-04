/** Опыт 6. Реакция фенолов с хлоридом железа(III). Методичка, раздел 6, опыт 6. */
import { L } from '../../app/i18n.js';
import { PHENOL_COLORS as C } from './model.js';
import { perTube } from './util.js';
import { tubesScene, bottlesScene } from './scene.js';

/* ---------- 1. Как разливать ---------- */
const s0 = {
  type: 'decide', id: 'pipette',
  title: L('Как разлить растворы по пробиркам', 'Ерітінділерді пробиркаларға қалай құю', 'How to fill the tubes'),
  instr: L('<p>В пять пробирок нужно налить по 1 мл растворов фенола, резорцина, гидрохинона, салициловой кислоты и (контроль) этанола.</p>', '<p>Бес пробиркаға фенол, резорцин, гидрохинон, салицил қышқылы ерітінділерінен және (бақылау) этанолдан 1 мл-ден құю керек.</p>', '<p>Five tubes are to be filled with 1 mL each of phenol, resorcinol, hydroquinone and salicylic acid solutions and, as a control, ethanol.</p>'),
  need: L('Выберите способ', 'Тәсілді таңдаңыз', 'Choose a method'),
  scene: () => bottlesScene([['C₆H₅OH', '1 %'], [L('резорцин', 'резорцин', 'resorcinol'), '1 %'], [L('гидрохинон', 'гидрохинон', 'hydroquinone'), '1 %'], [L('салицил. к-та', 'салицил қ-лы', 'salicylic'), '1 %'], ['C₂H₅OH', ''], ['FeCl₃', '1 %']]),
  question: L('Как вы отберёте растворы?', 'Ерітінділерді қалай аласыз?', 'How will you dispense the solutions?'),
  options: [
    { id: 'clean', ok: true, label: L('Для каждого раствора — своя чистая пипетка; пробирки подписаны', 'Әр ерітіндіге — өз таза пипеткасы; пробиркалар белгіленген', 'A separate clean pipette for each solution; the tubes are labelled'),
      why: L('Так растворы не переносятся из склянки в склянку и контроль остаётся чистым.', 'Осылайша ерітінділер склянкадан склянкаға ауыспайды және бақылау таза қалады.', 'That way no solution is carried over between bottles and the control stays clean.'),
      effect(S) { S.e6.dirty = false; }, log: L('Растворы разлиты разными чистыми пипетками, пробирки подписаны', 'Ерітінділер әртүрлі таза пипеткалармен құйылды, пробиркалар белгіленді', 'The solutions were dispensed with separate clean pipettes; the tubes are labelled') },
    { id: 'one', ok: false, severity: 'major', label: L('Одной пипеткой подряд, не промывая — растворы же разбавленные', 'Бір пипеткамен қатарынан, жумай — ерітінділер сұйылтылған ғой', 'One pipette for all, without rinsing — the solutions are dilute anyway'),
      remark: L('растворы отобраны одной непромытой пипеткой: фенолы перенесены в другие пробирки и в контроль', 'ерітінділер бір жуылмаған пипеткамен алынды: фенолдар басқа пробиркаларға және бақылауға ауысты', 'all solutions taken with one unrinsed pipette: phenols were carried over into the other tubes and into the control'),
      whatif: L('На стенках пипетки остаётся раствор предыдущего фенола. Даже следы фенола дают с FeCl₃ фиолетовую окраску — контроль с этанолом «окрасится», и опыт потеряет доказательную силу.', 'Пипетка қабырғасында алдыңғы фенолдың ерітіндісі қалады. Фенолдың ізі де FeCl₃-пен күлгін түс береді — этанолы бар бақылау «боялады», тәжірибе дәлелдік күшін жоғалтады.', 'Solution of the previous phenol stays on the pipette walls. Even traces of phenol give a violet colour with FeCl₃ — the ethanol control will be “coloured” and the experiment loses its value as evidence.'),
      effect(S) { S.e6.dirty = true; }, log: L('Растворы разлиты одной пипеткой без промывания', 'Ерітінділер бір пипеткамен жумай құйылды', 'The solutions were dispensed with one pipette without rinsing') },
    { id: 'mouth', ok: false, severity: 'safety', retry: true, label: L('Набирать пипеткой ртом — так быстрее', 'Пипеткамен аузымен тарту — тезірек', 'Fill the pipette by mouth — it is quicker'),
      remark: L('набор растворов фенолов пипеткой ртом (п. 2.5 правил ТБ)', 'фенол ерітінділерін пипеткамен аузымен тарту (ҚТ ережелерінің 2.5-тармағы)', 'filling a pipette with phenol solutions by mouth (safety rule 2.5)'),
      whatif: L('Фенол вызывает ожог слизистой рта и быстро всасывается — отравление. Только груша или дозатор.', 'Фенол ауыз сілемейлі қабығын күйдіреді және тез сіңеді — улану. Тек алмұрт немесе дозатор.', 'Phenol burns the mouth and is rapidly absorbed — poisoning. Use only a bulb or a dispenser.') },
  ],
};

/* ---------- 2. Проба ---------- */
const ids = ['ph', 'res', 'hq', 'sal', 'eth'];
const fTubes = [
  { id: 'ph', label: L('1 · фенол', '1 · фенол', '1 · phenol'), short: '1' },
  { id: 'res', label: L('2 · резорцин', '2 · резорцин', '2 · resorcinol'), short: '2' },
  { id: 'hq', label: L('3 · гидрохинон', '3 · гидрохинон', '3 · hydroquinone'), short: '3' },
  { id: 'sal', label: L('4 · салициловая к-та', '4 · салицил қ-лы', '4 · salicylic acid'), short: '4' },
  { id: 'eth', label: L('5 · этанол (контроль)', '5 · этанол (бақылау)', '5 · ethanol (control)'), short: '5' },
];
function paint(t, id, S, now) {
  if (!t.fe) { t.color = null; return; }
  if (t.fe > 3) { t.color = C.masked; return; }
  if (id === 'hq') { t.color = now - t.feAt >= 60 ? C.hq1 : C.hq0; t.ppt = now - t.feAt >= 60 && t.qh ? 0.2 : 0; t.pptColor = '#2f5a3a'; return; }
  if (id === 'eth') { t.color = S.e6.dirty ? C.ethDirty : C.eth; return; }
  t.color = C[id];
}
const s1 = {
  type: 'test', id: 'fecl3',
  title: L('Фенолы + FeCl₃', 'Фенолдар + FeCl₃', 'Phenols + FeCl₃'),
  instr: L('<ol><li>Налейте по <b>1 мл</b> растворов фенола, резорцина, гидрохинона и салициловой кислоты в четыре пробирки и <b>1 мл</b> этанола — в пятую (контроль).</li><li>Прибавьте в каждую пробирку <b>1–2 капли</b> 1 % FeCl₃ и сравните окраски. За пробиркой с гидрохиноном понаблюдайте 1–2 минуты.</li></ol>',
    '<ol><li>Төрт пробиркаға фенол, резорцин, гидрохинон және салицил қышқылы ерітінділерінен <b>1 мл</b>-ден, бесіншісіне (бақылау) <b>1 мл</b> этанол құйыңыз.</li><li>Әр пробиркаға 1 % FeCl₃-тің <b>1–2 тамшысын</b> қосып, түстерін салыстырыңыз. Гидрохиноны бар пробирканы 1–2 минут бақылаңыз.</li></ol>',
    '<ol><li>Put <b>1 mL</b> of the solutions of phenol, resorcinol, hydroquinone and salicylic acid into four tubes and <b>1 mL</b> of ethanol into a fifth tube (control).</li><li>Add <b>1–2 drops</b> of 1 % FeCl₃ to each tube and compare the colours. Watch the hydroquinone tube for 1–2 minutes.</li></ol>'),
  need: L('Сравните окраски в пяти пробирках', 'Бес пробирканың түстерін салыстырыңыз', 'Compare the colours in the five tubes'),
  tubes: fTubes,
  reagents: perTube([
    { id: 'fill', target: 'all', group: L('Растворы', 'Ерітінділер', 'Solutions'), label: L('Налить по 1 мл в пробирки 1–5', '1–5 пробиркаларға 1 мл-ден құю', 'Put 1 mL into tubes 1–5'), advance: 24, disabled: (t) => t.v > 0,
      apply(t, S, ctx, id) { t.v = 1; if (id === 'eth') ctx.log(L('В пробирки 1–5 налито по 1 мл растворов фенола, резорцина, гидрохинона, салициловой кислоты и этанола', '1–5 пробиркаларға фенол, резорцин, гидрохинон, салицил қышқылы ерітінділерінен және этанолдан 1 мл-ден құйылды', '1 mL each of phenol, resorcinol, hydroquinone, salicylic acid and ethanol solutions put into tubes 1–5')); } },
    { id: 'fe', group: L('FeCl₃ 1 %', 'FeCl₃ 1 %', 'FeCl₃ 1 %'), label: L('+1 капля в выбранную пробирку', 'Таңдалған пробиркаға +1 тамшы', '+1 drop into the selected tube'), advance: 5, disabled: (t) => !t.v || t.fe >= 5,
      apply(t, S, ctx, id) { addFe(t, S, ctx, id); } },
    { id: 'feAll', target: 'all', group: L('FeCl₃ 1 %', 'FeCl₃ 1 %', 'FeCl₃ 1 %'), label: L('+1 капля во все пробирки', 'Барлық пробиркаға +1 тамшы', '+1 drop into every tube'), advance: 15, disabled: (t) => !t.v,
      apply(t, S, ctx, id) { addFe(t, S, ctx, id); } },
    { id: 'wait', target: 'all', group: L('Наблюдение', 'Бақылау', 'Observation'), label: L('Наблюдать 1 мин', '1 мин бақылау', 'Watch for 1 min'), advance: 60, disabled: (t) => !t.v,
      apply(t, S, ctx, id) {
        if (id === 'hq' && t.fe && !t.waited) { t.waited = true; t.qh = ctx.rng.next() < 0.5; paint(t, id, S, ctx.now() + 60); ctx.log(t.qh ? L('Гидрохинон: зеленоватая окраска перешла в жёлтую, появились тёмно-зелёные кристаллы хингидрона', 'Гидрохинон: жасылдау түс сарыға ауысты, хингидронның қою жасыл кристалдары пайда болды', 'Hydroquinone: the greenish colour turned yellow and dark-green crystals of quinhydrone appeared') : L('Гидрохинон: зеленоватая окраска быстро перешла в жёлтую (п-бензохинон)', 'Гидрохинон: жасылдау түс тез сарыға ауысты (п-бензохинон)', 'Hydroquinone: the greenish colour quickly turned yellow (p-benzoquinone)'), 'obs'); }
      } },
  ]),
  done: (tb) => ids.every((k) => tb[k].fe > 0) && tb.hq.waited,
  observe: {
    question: L('Какие окраски вы наблюдали?', 'Қандай түстерді байқадыңыз?', 'Which colours did you observe?'),
    options: [
      { id: 'ok', label: L('Фенол — фиолетовая; резорцин — тёмно-фиолетовая; гидрохинон — зеленоватая, затем жёлтая; салициловая кислота — фиолетовая (красно-фиолетовая); этанол — без изменений', 'Фенол — күлгін; резорцин — қою күлгін; гидрохинон — жасылдау, кейін сары; салицил қышқылы — күлгін (қызыл-күлгін); этанол — өзгеріссіз', 'Phenol — violet; resorcinol — dark violet; hydroquinone — greenish, then yellow; salicylic acid — violet (red-violet); ethanol — no change'),
        log: L('Фенол — фиолетовая; резорцин — тёмно-фиолетовая; салициловая кислота — красно-фиолетовая; гидрохинон — кратковременно зеленоватая, затем жёлтая; этанол (контроль) — без изменений', 'Фенол — күлгін; резорцин — қою күлгін; салицил қышқылы — қызыл-күлгін; гидрохинон — қысқа уақыт жасылдау, кейін сары; этанол (бақылау) — өзгеріссіз', 'Phenol — violet; resorcinol — dark violet; salicylic acid — red-violet; hydroquinone — transient greenish, then yellow; ethanol (control) — no change') },
      { id: 'dirty', label: L('Фенол, резорцин, салициловая кислота — фиолетовые оттенки; гидрохинон — жёлтая; но и этанол (контроль) слабо-фиолетовый', 'Фенол, резорцин, салицил қышқылы — күлгін реңктер; гидрохинон — сары; бірақ этанол (бақылау) да әлсіз күлгін', 'Phenol, resorcinol, salicylic acid — shades of violet; hydroquinone — yellow; but the ethanol control is faintly violet too'),
        log: L('Фенол, резорцин, салициловая кислота — фиолетовые оттенки; гидрохинон — жёлтая; контроль (этанол) слабо-фиолетовый — загрязнён фенолом', 'Фенол, резорцин, салицил қышқылы — күлгін реңктер; гидрохинон — сары; бақылау (этанол) әлсіз күлгін — фенолмен ластанған', 'Phenol, resorcinol, salicylic acid — shades of violet; hydroquinone — yellow; the ethanol control is faintly violet — contaminated with phenol') },
      { id: 'allv', label: L('Во всех пяти пробирках одинаковая фиолетовая окраска', 'Бес пробирканың бәрінде бірдей күлгін түс', 'The same violet colour in all five tubes') },
      { id: 'none', label: L('Фиолетовая только с фенолом, остальные без изменений', 'Тек фенолмен күлгін, қалғандары өзгеріссіз', 'Violet with phenol only; the rest unchanged') },
    ],
    correct: (S) => (S.e6.dirty ? 'dirty' : 'ok'),
    why: (S) => (S.e6.dirty
      ? L('Окраска контроля — следы фенола, перенесённые пипеткой. Спирты с FeCl₃ окраски не дают.', 'Бақылаудың боялуы — пипеткамен ауысқан фенол іздері. Спирттер FeCl₃-пен түс бермейді.', 'The colour of the control is due to traces of phenol carried over by the pipette. Alcohols give no colour with FeCl₃.')
      : L('Цвет комплекса Fe³⁺ зависит от числа и положения OH-групп; гидрохинон окисляется Fe³⁺ до п-бензохинона; спирт (этанол) окраски не даёт.', 'Fe³⁺ кешенінің түсі OH-топтарының саны мен орнына байланысты; гидрохинон Fe³⁺-пен п-бензохинонға дейін тотығады; спирт (этанол) түс бермейді.', 'The colour of the Fe³⁺ complex depends on the number and position of the OH groups; hydroquinone is oxidised by Fe³⁺ to p-benzoquinone; the alcohol (ethanol) gives no colour.')),
  },
  onDone(S, tb) { S.e6.res = { dirty: !!S.e6.dirty, qh: !!tb.hq.qh, masked: ids.some((k) => tb[k].fe > 3) }; },
  scene: (S, local) => tubesScene(fTubes, local, { cap: 3, title: L('1 фенол · 2 резорцин · 3 гидрохинон · 4 салицил. к-та · 5 этанол', '1 фенол · 2 резорцин · 3 гидрохинон · 4 салицил қ. · 5 этанол', '1 phenol · 2 resorcinol · 3 hydroquinone · 4 salicylic · 5 ethanol') }),
  hint1: L('Налейте растворы во все пробирки, затем в каждую — 1 каплю FeCl₃ и понаблюдайте минуту (гидрохинон меняет цвет со временем).', 'Ерітінділерді барлық пробиркаларға құйып, содан кейін әрқайсысына 1 тамшы FeCl₃ қосып, бір минут бақылаңыз (гидрохинон уақыт өте түсін өзгертеді).', 'Fill all the tubes, then add 1 drop of FeCl₃ to each and watch for a minute (hydroquinone changes colour with time).'),
  hint2: L('По методичке — 1–2 капли FeCl₃, больше 3 не прибавляйте: избыток даёт жёлто-бурую окраску самого FeCl₃ и маскирует цвет комплекса.', 'Әдістеме бойынша — FeCl₃-тің 1–2 тамшысы, 3-тен артық қоспаңыз: артығы FeCl₃-тің өз сары-қоңыр түсін беріп, кешен түсін жасырады.', 'The manual says 1–2 drops of FeCl₃; do not add more than 3: the excess gives the yellow-brown colour of FeCl₃ itself and masks the complex.'),
  hint3: L('«Налить по 1 мл» → «+1 капля во все пробирки» → «Наблюдать 1 мин».', '«1 мл-ден құю» → «Барлық пробиркаға +1 тамшы» → «1 мин бақылау».', '“Put 1 mL” → “+1 drop into every tube” → “Watch for 1 min”.'),
};
function addFe(t, S, ctx, id) {
  t.fe = (t.fe || 0) + 1; t.v += 0.05;
  if (t.fe === 1) t.feAt = ctx.now();
  paint(t, id, S, ctx.now());
  if (t.fe > 3) ctx.remark({ key: 'fe_many', severity: 'minor', text: L('избыток FeCl₃ (больше 3 капель): бурая окраска реактива маскирует цвет комплекса', 'FeCl₃ артық (3 тамшыдан көп): реактивтің қоңыр түсі кешен түсін жасырады', 'excess FeCl₃ (more than 3 drops): the brown colour of the reagent masks the complex') });
}

/* ---------- 3. Контроль ---------- */
const s2 = {
  type: 'observe', id: 'control',
  title: L('Что показывает контроль', 'Бақылау нені көрсетеді', 'What the control shows'),
  instr: L('<p>Посмотрите на пробирку 5 (этанол + FeCl₃). Какой вывод можно сделать?</p>', '<p>5-пробиркаға (этанол + FeCl₃) қараңыз. Қандай қорытынды жасауға болады?</p>', '<p>Look at tube 5 (ethanol + FeCl₃). What can you conclude?</p>'),
  need: L('Сделайте вывод по контролю', 'Бақылау бойынша қорытынды жасаңыз', 'Draw a conclusion from the control'),
  scene: (S) => tubesScene([{ id: 'x', short: L('5 · этанол + FeCl₃', '5 · этанол + FeCl₃', '5 · ethanol + FeCl₃') }], { tubes: { x: { v: 1.05, color: S.e6.dirty ? C.ethDirty : C.eth } } }, { cap: 3 }),
  question: L('Что означает результат контрольной пробы?', 'Бақылау сынамасының нәтижесі нені білдіреді?', 'What does the control result mean?'),
  options: [
    { id: 'valid', label: L('Контроль бесцветен (лишь бледно-жёлтый цвет FeCl₃): спирт не даёт окраски, окраска в пробирках 1–4 вызвана фенольной OH-группой', 'Бақылау түссіз (тек FeCl₃-тің ақшыл сары түсі): спирт түс бермейді, 1–4 пробиркалардағы түс фенолдық OH-тобынан', 'The control is colourless (only the pale yellow of FeCl₃): the alcohol gives no colour, so the colours in tubes 1–4 are due to the phenolic OH group'),
      log: L('Контроль (этанол + FeCl₃) — без окраски: реакция с FeCl₃ характерна для фенольного гидроксила, спирты её не дают', 'Бақылау (этанол + FeCl₃) — түссіз: FeCl₃-пен реакция фенолдық гидроксилге тән, спирттер оны бермейді', 'Control (ethanol + FeCl₃) — no colour: the FeCl₃ reaction is characteristic of the phenolic hydroxyl, alcohols do not give it') },
    { id: 'contam', label: L('Контроль слабо-фиолетовый: он загрязнён фенолом — пробу нужно повторить с чистыми пипетками', 'Бақылау әлсіз күлгін: ол фенолмен ластанған — сынаманы таза пипеткалармен қайталау керек', 'The control is faintly violet: it is contaminated with phenol — the test must be repeated with clean pipettes'),
      log: L('Контроль слабо-фиолетовый — загрязнён фенолом (одна пипетка без промывания); результаты пробирок 1–4 недостоверны, пробу следует повторить', 'Бақылау әлсіз күлгін — фенолмен ластанған (бір пипетка жуылмаған); 1–4 пробиркалардың нәтижелері сенімсіз, сынаманы қайталау керек', 'The control is faintly violet — contaminated with phenol (one unrinsed pipette); the results in tubes 1–4 are unreliable and the test should be repeated') },
    { id: 'ethpos', label: L('Этанол тоже даёт с FeCl₃ фиолетовую окраску — реакция не специфична', 'Этанол да FeCl₃-пен күлгін түс береді — реакция спецификалық емес', 'Ethanol also gives a violet colour with FeCl₃ — the reaction is not specific') },
  ],
  correct: (S) => (S.e6.dirty ? 'contam' : 'valid'),
  why: () => L('Контроль нужен, чтобы убедиться, что окраска вызвана именно фенольной OH-группой. Спирты с FeCl₃ окраски не дают.', 'Бақылау түстің дәл фенолдық OH-тобынан екеніне көз жеткізу үшін қажет. Спирттер FeCl₃-пен түс бермейді.', 'The control shows that the colour is really due to the phenolic OH group. Alcohols give no colour with FeCl₃.'),
};

export default {
  id: '6',
  title: L('Реакция фенолов с хлоридом железа(III)', 'Фенолдардың темір(III) хлоридімен реакциясы', 'Reaction of phenols with iron(III) chloride'),
  principle: L('Фенолы образуют с Fe³⁺ окрашенные комплексы (феноляты железа(III)); окраска зависит от числа и положения OH-групп.', 'Фенолдар Fe³⁺-пен боялған кешендер (темір(III) феноляттары) түзеді; түсі OH-топтарының саны мен орнына байланысты.', 'Phenols form coloured complexes (iron(III) phenolates) with Fe³⁺; the colour depends on the number and position of the OH groups.'),
  equation: [L('6 C₆H₅OH + FeCl₃ → H₃[Fe(OC₆H₅)₆] + 3HCl (упрощённо)', '6 C₆H₅OH + FeCl₃ → H₃[Fe(OC₆H₅)₆] + 3HCl (жеңілдетілген)', '6 C₆H₅OH + FeCl₃ → H₃[Fe(OC₆H₅)₆] + 3HCl (simplified)')],
  initialState: () => ({ e6: { dirty: null, res: null } }),
  checkpoints: [0],
  steps: [s0, s1, s2],
  results: (S) => ({ ...(S.e6.res || {}) }),
  summary: (r) => [
    { label: L('Фенолы', 'Фенолдар', 'Phenols'), value: L('фиолетовые оттенки', 'күлгін реңктер', 'violet shades'), st: 'ok' },
    { label: L('Контроль', 'Бақылау', 'Control'), value: r.dirty ? L('загрязнён', 'ластанған', 'contaminated') : L('без окраски', 'түссіз', 'no colour'), st: r.dirty ? 'warn' : 'ok' },
  ],
};
