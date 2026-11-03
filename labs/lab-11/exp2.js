/** Опыт 2. Нингидриновая реакция. Методичка, раздел 6, опыт 2. */
import { L, n } from '../../app/i18n.js';
import { ninhydrin, heatGain, bathStep } from './model.js';
import { bathScene, benchBack } from './scene.js';
import { warmBath, eggInit, prepNote, cat, readyBtn } from './common.js';

const s0 = {
  type: 'process', id: 'bath',
  title: L('Кипящая водяная баня', 'Қайнап тұрған су моншасы', 'Boiling water bath'),
  instr: L('<ol><li>Налейте в стакан на 250 мл около 150 мл воды — это водяная баня.</li><li>Поставьте стакан на электроплитку и включите её.</li><li>Пробы нагревают в <b>кипящей</b> бане — следите за термометром.</li></ol><p class="note">Перейти к следующему шагу можно, когда вода нагреется, но нингидриновую реакцию проводят только в кипящей бане. Плитка остаётся включённой до конца работы.</p>',
    '<ol><li>250 мл стақанға шамамен 150 мл су құйыңыз — бұл су моншасы.</li><li>Стақанды электр плитасына қойып, плитаны қосыңыз.</li><li>Сынамаларды <b>қайнап тұрған</b> моншада қыздырады — термометрді қадағалаңыз.</li></ol><p class="note">Су жылыған кезде келесі қадамға өтуге болады, бірақ нингидрин реакциясын тек қайнап тұрған моншада жүргізеді. Плита жұмыстың соңына дейін қосулы қалады.</p>',
    '<ol><li>Pour about 150 mL of water into a 250 mL beaker — this is the water bath.</li><li>Put the beaker on the hot plate and switch it on.</li><li>The tests are heated in a <b>boiling</b> bath — watch the thermometer.</li></ol><p class="note">You may go on once the water is warm, but the ninhydrin reaction is done only in a boiling bath. The hot plate stays on until the end of the work.</p>'),
  need: L('Нагрейте баню', 'Моншаны қыздырыңыз', 'Heat the bath'),
  speeds: [10, 30],
  setup(S) { S.bath = S.bath || { T: 22, water: false, on: false }; },
  controls: [
    { kind: 'action', id: 'water', group: L('Баня', 'Монша', 'Bath'), label: L('Налить 150 мл воды в стакан', 'Стақанға 150 мл су құю', 'Pour 150 mL of water into the beaker'), advance: 60, do(S) { S.bath.water = true; }, log: L('В стакан на 250 мл налито ≈ 150 мл воды (водяная баня)', '250 мл стақанға ≈ 150 мл су құйылды (су моншасы)', '≈ 150 mL of water poured into a 250 mL beaker (water bath)') },
    { kind: 'action', id: 'put', group: L('Баня', 'Монша', 'Bath'), label: L('Поставить на плитку', 'Плитаға қою', 'Put on the hot plate'), requires: ['water'], advance: 10, log: L('Стакан с водой поставлен на электроплитку', 'Су бар стақан электр плитасына қойылды', 'The beaker of water is on the hot plate') },
    { kind: 'toggle', id: 'plate', group: L('Плитка', 'Плита', 'Hot plate'), label: L('Включить плитку', 'Плитаны қосу', 'Switch on the hot plate'), labelOn: L('Плитка: вкл.', 'Плита: қосулы', 'Hot plate: on'),
      when: (S, lc) => !!lc.done.put, whenText: L('Сначала поставьте баню на плитку.', 'Алдымен моншаны плитаға қойыңыз.', 'Put the bath on the hot plate first.'),
      onChange(S, lc, on, ctx) { S.bath.on = on; ctx.log(on ? L('Плитка включена', 'Плита қосылды', 'Hot plate switched on') : L('Плитка выключена', 'Плита сөндірілді', 'Hot plate switched off')); } },
  ],
  tick(S, lc, dt) { if (S.bath.water) S.bath.T = bathStep(S.bath.T, !!lc.c.plate, dt); },
  readouts: (S) => [{ label: L('Баня', 'Монша', 'Bath'), value: `${S.bath.T >= 99.5 ? 100 : n(S.bath.T, 0)} °C`, st: S.bath.T >= 97 ? 'ok' : '' }],
  alerts: (S, lc) => (!lc.c.plate || !S.bath.water ? null
    : S.bath.T >= 97 ? { text: L('Вода кипит — баня готова.', 'Су қайнап тұр — монша дайын.', 'The water is boiling — the bath is ready.'), kind: 'good' }
      : { text: L(`Баня ещё не кипит (${n(S.bath.T, 0)} °C).`, `Монша әлі қайнаған жоқ (${n(S.bath.T, 0)} °C).`, `The bath is not boiling yet (${n(S.bath.T, 0)} °C).`), kind: 'info' }),
  chart: { value: (S) => S.bath.T, min: 0, max: 110, band: [97, 101], every: 10, span: 900, label: L('Температура бани', 'Монша температурасы', 'Bath temperature'), empty: L('включите плитку', 'плитаны қосыңыз', 'switch on the hot plate') },
  done: (S, lc) => S.bath.water && lc.c.plate && S.bath.T >= 60 && { text: L('Баня нагрелась. Для нингидриновой пробы нужна кипящая вода — можно подождать кипения здесь.', 'Монша жылыды. Нингидрин сынамасына қайнап тұрған су қажет — қайнағанын осында күтуге болады.', 'The bath is warm. The ninhydrin test needs boiling water — you can wait here for it to boil.'), kind: 'info' },
  scene: bathScene,
  onLeave(S, ctx) { ctx.log(L(`Температура бани ${S.bath.T >= 99.5 ? '100' : n(S.bath.T, 0)} °C${S.bath.T >= 97 ? ' — вода кипит' : ''}`, `Монша температурасы ${S.bath.T >= 99.5 ? '100' : n(S.bath.T, 0)} °C${S.bath.T >= 97 ? ' — су қайнап тұр' : ''}`, `Bath temperature ${S.bath.T >= 99.5 ? '100' : n(S.bath.T, 0)} °C${S.bath.T >= 97 ? ' — boiling' : ''}`), 'obs'); },
  hints: [
    L('Баня — стакан с водой на включённой плитке. Нингидриновой пробе нужна кипящая вода.', 'Монша — қосулы плитадағы су бар стақан. Нингидрин сынамасына қайнап тұрған су қажет.', 'The bath is a beaker of water on a switched-on hot plate. The ninhydrin test needs boiling water.'),
    L('Нагрев от комнатной температуры до кипения занимает несколько минут — увеличьте ход времени.', 'Бөлме температурасынан қайнағанға дейін қыздыру бірнеше минутқа созылады — уақыт жылдамдығын арттырыңыз.', 'Heating from room temperature to boiling takes several minutes — increase the time speed.'),
    L('Налить воду → поставить на плитку → включить плитку, затем дождаться 100 °C.', 'Су құю → плитаға қою → плитаны қосу, содан кейін 100 °C-ты күту.', 'Pour the water → put it on the plate → switch on, then wait for 100 °C.'),
  ],
};

const upd = (t, S) => { const a = ninhydrin(t, S.egg); t.color = a.color; t.ppt = a.ppt; t.pptColor = a.pptColor; t.key = a.key; };

const s1 = {
  type: 'test', id: 'ninh',
  title: L('Нингидриновая проба', 'Нингидрин сынамасы', 'Ninhydrin test'),
  instr: L('<ol><li>Налейте в одну пробирку <b>1 мл</b> раствора глицина, в другую — <b>1 мл</b> раствора яичного белка.</li><li>Прибавьте в каждую <b>4–5 капель</b> раствора нингидрина.</li><li>Нагрейте в кипящей водяной бане <b>1–2 минуты</b>.</li></ol><p class="note">Нингидрин окрашивает кожу в фиолетовый цвет — работайте в перчатках.</p>',
    '<ol><li>Бір пробиркаға <b>1 мл</b> глицин ерітіндісін, екіншісіне <b>1 мл</b> жұмыртқа ақуызының ерітіндісін құйыңыз.</li><li>Әрқайсысына нингидрин ерітіндісінің <b>4–5 тамшысын</b> қосыңыз.</li><li>Қайнап тұрған су моншасында <b>1–2 минут</b> қыздырыңыз.</li></ol><p class="note">Нингидрин теріні күлгін түске бояйды — қолғаппен жұмыс істеңіз.</p>',
    '<ol><li>Put <b>1 mL</b> of glycine solution into one tube and <b>1 mL</b> of egg white solution into another.</li><li>Add <b>4–5 drops</b> of ninhydrin solution to each.</li><li>Heat in a boiling water bath for <b>1–2 minutes</b>.</li></ol><p class="note">Ninhydrin stains skin purple — wear gloves.</p>'),
  need: L('Проведите пробу и запишите наблюдение', 'Сынаманы жүргізіп, бақылауды жазыңыз', 'Do the test and record the observation'),
  tubes: [{ id: 'g', label: L('1 · глицин', '1 · глицин', '1 · glycine'), init: { sub: 'gly' } }, { id: 'e', label: L('2 · белок', '2 · ақуыз', '2 · egg white'), init: { sub: 'egg' } }],
  reset: true,
  sceneBack: benchBack(['g', 'e']),
  reagents: [
    { id: 'fill', target: 'all', group: L('Исследуемые растворы', 'Зерттелетін ерітінділер', 'Test solutions'), label: L('Налить по 1 мл (глицин / белок)', '1 мл-ден құю (глицин / ақуыз)', 'Pour 1 mL each (glycine / egg white)'), advance: 30,
      disabled: (t) => t.v > 0,
      apply(t, S, ctx, id) {
        if (id === 'g') { warmBath(S, 30); ctx.log(cat(L('В пробирку 1 налит 1 мл 1 % глицина, в пробирку 2 — 1 мл раствора белка', '1-пробиркаға 1 мл 1 % глицин, 2-пробиркаға 1 мл ақуыз ерітіндісі құйылды', 'Tube 1: 1 mL of 1 % glycine; tube 2: 1 mL of egg white solution'), prepNote(S.egg))); }
        if (t.v > 0) return;
        if (t.sub === 'egg') Object.assign(t, eggInit(S.egg, 1)); else t.v = 1;
        upd(t, S);
      } },
    { id: 'ninh', group: L('В выбранную пробирку', 'Таңдалған пробиркаға', 'Into the selected tube'), label: L('Нингидрин: +1 кап.', 'Нингидрин: +1 тамшы', 'Ninhydrin: +1 drop'), advance: 5,
      apply(t, S, ctx) {
        warmBath(S, 5);
        if (!t.v) { ctx.feedback(L('Сначала налейте исследуемый раствор.', 'Алдымен зерттелетін ерітіндіні құйыңыз.', 'Pour the test solution first.'), 'warn'); return; }
        t.ninh = (t.ninh || 0) + 1; t.v += 0.05; upd(t, S);
      } },
    { id: 'heat', target: 'all', group: L('Водяная баня', 'Су моншасы', 'Water bath'), label: L('Нагреть обе пробирки в бане 1 мин', 'Екі пробирканы моншада 1 мин қыздыру', 'Heat both tubes in the bath for 1 min'), advance: 60,
      apply(t, S, ctx, id) {
        if (id === 'g') {
          const T = S.bath.T;
          if (T < 90) ctx.remark({ key: 'e2cold', severity: 'minor', text: L(`пробы нагреты не в кипящей бане (${n(T, 0)} °C)`, `сынамалар қайнап тұрмаған моншада қыздырылды (${n(T, 0)} °C)`, `tests heated in a bath that was not boiling (${n(T, 0)} °C)`) });
          ctx.log(L(`Пробирки нагреты в бане при ${T >= 99.5 ? 100 : n(T, 0)} °C — 1 мин`, `Пробиркалар моншада ${T >= 99.5 ? 100 : n(T, 0)} °C-та қыздырылды — 1 мин`, `Tubes heated in the bath at ${T >= 99.5 ? 100 : n(T, 0)} °C — 1 min`));
          S.e2.T = Math.min(S.e2.T ?? 999, T);
          S.e2.heat += 60;
          warmBath(S, 60);
        }
        t.ext = (t.ext || 0) + heatGain(60, S.bath.T, 90); t.hot = true; upd(t, S);
      } },
    readyBtn((tb) => {
      if (!tb.g.v || !tb.e.v) return L('Налейте исследуемые растворы.', 'Зерттелетін ерітінділерді құйыңыз.', 'Pour the test solutions.');
      if ((tb.g.ninh || 0) < 3 || (tb.e.ninh || 0) < 3) return L('Прибавьте в каждую пробирку 4–5 капель нингидрина.', 'Әр пробиркаға 4–5 тамшы нингидрин қосыңыз.', 'Add 4–5 drops of ninhydrin to each tube.');
      if (!tb.g.ext) return L('Пробы ещё не нагреты.', 'Сынамалар әлі қыздырылған жоқ.', 'The tests have not been heated yet.');
      return null;
    }),
  ],
  done: (tubes, S, local) => !!local.ready,
  observe: {
    question: L('Что наблюдается после нагревания?', 'Қыздырғаннан кейін не байқалады?', 'What is observed after heating?'),
    options: [
      { id: 'both', label: L('Сине-фиолетовая окраска и в пробирке с глицином, и в пробирке с белком', 'Глицин бар пробиркада да, ақуыз бар пробиркада да көкшіл-күлгін түс', 'A blue-violet colour in both the glycine and the egg white tube'),
        log: (S) => cat(L('После нагревания в кипящей бане в обеих пробирках (глицин и белок) появилась интенсивная сине-фиолетовая окраска (пурпур Руэмана)', 'Қайнап тұрған моншада қыздырғаннан кейін екі пробиркада да (глицин және ақуыз) қарқынды көкшіл-күлгін түс пайда болды (Руэман пурпуры)', 'After heating in the boiling bath an intense blue-violet colour (Ruhemann’s purple) appeared in both tubes (glycine and egg white)'), prepNote(S.egg)) },
      { id: 'weak', label: L('Лишь бледно-сиреневое окрашивание', 'Тек бозғылт күлгін түс', 'Only a pale lilac tint'),
        log: (S) => L(`Окраска слабая, бледно-сиреневая: пробы нагреты недостаточно (баня ${n(S.e2.T, 0)} °C) или мало нингидрина`, `Түс әлсіз, бозғылт күлгін: сынамалар жеткіліксіз қыздырылды (монша ${n(S.e2.T, 0)} °C) немесе нингидрин аз`, `Only a weak pale lilac colour: the tests were not heated enough (bath ${n(S.e2.T, 0)} °C) or too little ninhydrin was used`) },
      { id: 'glyonly', label: L('Окраска только с глицином, белок бесцветный', 'Түс тек глицинмен, ақуыз түссіз', 'Colour only with glycine; the egg white stays colourless') },
      { id: 'none', label: L('Окраска не изменилась', 'Түсі өзгерген жоқ', 'No colour change'),
        log: L('Окраска не появилась — пробы практически не нагреты', 'Түс пайда болмады — сынамалар іс жүзінде қыздырылмаған', 'No colour developed — the tests were hardly heated') },
    ],
    correct: (S, tb) => (tb.g.key === 'strong' && tb.e.key === 'strong' ? 'both' : tb.g.key === 'none' && tb.e.key === 'none' ? 'none' : 'weak'),
    why: (S, tb) => (tb.g.key === 'strong' && tb.e.key === 'strong'
      ? L('Свободные α-аминогруппы глицина и белка (N-концевые остатки, ε-NH₂ лизина) при нагревании дают с нингидрином сине-фиолетовый пурпур Руэмана.', 'Глицин мен ақуыздың бос α-аминотоптары (N-соңғы қалдықтар, лизиннің ε-NH₂) қыздырғанда нингидринмен көкшіл-күлгін Руэман пурпурын береді.', 'The free α-amino groups of glycine and of the protein (N-terminal residues, ε-NH₂ of lysine) give blue-violet Ruhemann’s purple with ninhydrin on heating.')
      : L('Реакция идёт при нагревании: в не кипящей бане или с 1–2 каплями нингидрина окраска развивается слабо. Пробу нужно повторить.', 'Реакция қыздырғанда жүреді: қайнамаған моншада немесе 1–2 тамшы нингидринмен түс әлсіз дамиды. Сынаманы қайталау керек.', 'The reaction needs heat: in a bath that is not boiling, or with only 1–2 drops of ninhydrin, the colour develops weakly. The test should be repeated.')),
  },
  onDone(S, tb, ctx) {
    S.e2.gly = tb.g.key; S.e2.egg = tb.e.key; S.e2.ninh = Math.min(tb.g.ninh || 0, tb.e.ninh || 0);
    if (tb.g.key !== 'strong' || tb.e.key !== 'strong') ctx.remark({ key: 'e2weak', severity: 'major', text: L('нингидриновая проба не доведена: окраска не развилась (не кипящая баня или мало нингидрина) — результат недостоверен', 'нингидрин сынамасы аяқталмады: түс дамымады (монша қайнамаған немесе нингидрин аз) — нәтиже сенімсіз', 'ninhydrin test incomplete: the colour did not develop (bath not boiling or too little ninhydrin) — the result is unreliable') });
  },
  hint1: L('Обе пробирки: 1 мл раствора и 4–5 капель нингидрина. Нагревают в кипящей бане — посмотрите на табло бани.', 'Екі пробирка да: 1 мл ерітінді және 4–5 тамшы нингидрин. Қайнап тұрған моншада қыздырады — монша таблосына қараңыз.', 'Both tubes: 1 mL of solution and 4–5 drops of ninhydrin. They are heated in a boiling bath — check the bath display.'),
  hint2: L('Если баня ещё не 100 °C, сначала приготовьте пробирки — вода тем временем нагреется. 1 минута в кипящей бане достаточна.', 'Монша әлі 100 °C болмаса, алдымен пробиркаларды дайындаңыз — су сол уақытта қызады. Қайнап тұрған моншада 1 минут жеткілікті.', 'If the bath is not yet at 100 °C, prepare the tubes first — the water will heat up meanwhile. One minute in a boiling bath is enough.'),
  hint3: L('Налить по 1 мл → по 4 капли нингидрина в каждую → когда баня кипит, нагреть 1 мин → записать наблюдение.', '1 мл-ден құю → әрқайсысына 4 тамшы нингидрин → монша қайнағанда, 1 мин қыздыру → бақылауды жазу.', 'Pour 1 mL each → 4 drops of ninhydrin into each → when the bath boils, heat for 1 min → record the observation.'),
};

const s2 = {
  type: 'quiz', id: 'q2',
  title: L('Нингидриновая реакция: вопросы', 'Нингидрин реакциясы: сұрақтар', 'Ninhydrin reaction: questions'),
  instr: L('<p>Объясните наблюдение.</p>', '<p>Бақылауды түсіндіріңіз.</p>', '<p>Explain the observation.</p>'),
  need: L('Ответьте на вопросы', 'Сұрақтарға жауап беріңіз', 'Answer the questions'),
  questions: [
    { q: L('Что происходит с аминокислотой в нингидриновой реакции?', 'Нингидрин реакциясында аминқышқылымен не болады?', 'What happens to the amino acid in the ninhydrin reaction?'),
      options: [L('Окислительное дезаминирование и декарбоксилирование; NH₃ конденсируется со второй молекулой нингидрина', 'Тотығып дезаминдеу және декарбоксилдеу; NH₃ нингидриннің екінші молекуласымен конденсацияланады', 'Oxidative deamination and decarboxylation; the NH₃ condenses with a second ninhydrin molecule'), L('Аминокислота этерифицируется', 'Аминқышқылы этерификацияланады', 'The amino acid is esterified'), L('Образуется хелат с медью', 'Мыспен хелат түзіледі', 'A copper chelate forms'), L('Нитруется ароматическое кольцо', 'Ароматты сақина нитрленеді', 'An aromatic ring is nitrated')],
      correct: 0, why: L('R–CH(NH₂)–COOH + 2 нингидрин → пурпур Руэмана + R–CHO + CO₂ + 3H₂O (раздел 3.1).', 'R–CH(NH₂)–COOH + 2 нингидрин → Руэман пурпуры + R–CHO + CO₂ + 3H₂O (3.1-бөлім).', 'R–CH(NH₂)–COOH + 2 ninhydrin → Ruhemann’s purple + R–CHO + CO₂ + 3H₂O (section 3.1).') },
    { q: L('Почему пролин даёт с нингидрином жёлтую окраску?', 'Неліктен пролин нингидринмен сары түс береді?', 'Why does proline give a yellow colour with ninhydrin?'),
      options: [L('Пролин — вторичный амин: пурпур Руэмана не образуется', 'Пролин — екіншілік амин: Руэман пурпуры түзілмейді', 'Proline is a secondary amine: Ruhemann’s purple cannot form'), L('Пролин содержит ароматическое кольцо', 'Пролинде ароматты сақина бар', 'Proline has an aromatic ring'), L('Пролин содержит серу', 'Пролинде күкірт бар', 'Proline contains sulfur'), L('Пролин не растворяется в воде', 'Пролин суда ерімейді', 'Proline is insoluble in water')],
      correct: 0, why: L('Раздел 3.1: пролин — вторичный амин, окраска жёлтая.', '3.1-бөлім: пролин — екіншілік амин, түсі сары.', 'Section 3.1: proline is a secondary amine and gives a yellow colour.') },
    { q: L('Почему белок тоже даёт нингидриновую реакцию?', 'Неліктен ақуыз да нингидрин реакциясын береді?', 'Why does the protein also give the ninhydrin reaction?'),
      options: [L('В белке есть свободные аминогруппы (N-концевые и боковые)', 'Ақуызда бос аминотоптар бар (N-соңғы және бүйірлік)', 'The protein has free amino groups (N-terminal and side-chain)'), L('Из-за пептидных связей', 'Пептидтік байланыстарға байланысты', 'Because of the peptide bonds'), L('Из-за остатков цистеина', 'Цистеин қалдықтарына байланысты', 'Because of cysteine residues'), L('Белок не даёт этой реакции', 'Ақуыз бұл реакцияны бермейді', 'The protein does not give this reaction')],
      correct: 0, why: L('Методичка: окраска появляется у глицина и у белка — за счёт свободных α-аминогрупп.', 'Әдістеме: түс глицинде де, ақуызда да пайда болады — бос α-аминотоптар есебінен.', 'Manual: the colour appears with glycine and with the protein — due to free α-amino groups.') },
  ],
};

export default {
  id: '2',
  title: L('Нингидриновая реакция', 'Нингидрин реакциясы', 'Ninhydrin reaction'),
  principle: L('Свободные α-аминогруппы при нагревании реагируют с нингидрином и образуют сине-фиолетовый пурпур Руэмана.', 'Бос α-аминотоптар қыздырғанда нингидринмен әрекеттесіп, көкшіл-күлгін Руэман пурпурын түзеді.', 'Free α-amino groups react with ninhydrin on heating to form the blue-violet Ruhemann’s purple.'),
  equation: [L('R–CH(NH₂)–COOH + 2 нингидрин → пурпур Руэмана + R–CHO + CO₂ + 3H₂O (схема)', 'R–CH(NH₂)–COOH + 2 нингидрин → Руэман пурпуры + R–CHO + CO₂ + 3H₂O (сызба)', 'R–CH(NH₂)–COOH + 2 ninhydrin → Ruhemann’s purple + R–CHO + CO₂ + 3H₂O (schematic)')],
  initialState: ({ prev }) => ({ egg: (prev['1'] || {}).egg || 'ok', bath: { T: 22, water: false, on: false }, e2: { heat: 0, T: null } }),
  checkpoints: [0, 1],
  steps: [s0, s1, s2],
  results: (S) => ({ gly: S.e2.gly, egg: S.e2.egg, T: S.e2.T, heat: S.e2.heat, ninh: S.e2.ninh, eggPrep: S.egg }),
  summary: (r) => [
    { label: L('Баня при нагреве', 'Қыздырғандағы монша', 'Bath when heating'), value: r.T != null ? `${r.T >= 99.5 ? 100 : n(r.T, 0)} °C` : '—', st: r.T >= 97 ? 'ok' : 'warn' },
    { label: L('Глицин / белок', 'Глицин / ақуыз', 'Glycine / egg white'), value: r.gly === 'strong' && r.egg === 'strong' ? L('сине-фиолетовая', 'көкшіл-күлгін', 'blue-violet') : L('слабая окраска', 'әлсіз түс', 'weak colour'), st: r.gly === 'strong' && r.egg === 'strong' ? 'ok' : 'warn' },
  ],
};
