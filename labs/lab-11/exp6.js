/** Опыт 6. Осаждение белков: высаливание и денатурация. Методичка, раздел 6, опыт 6. */
import { L } from '../../app/i18n.js';
import { saltOut, heatCoag, heavyMetal, ethanolPpt } from './model.js';
import { benchBack, ethanolScene } from './scene.js';
import { scene, bottle, text } from '../../app/scene/svg.js';
import { warmBath, eggInit, prepNote, cat, readyBtn } from './common.js';

const G = L('Действия', 'Әрекеттер', 'Actions');
const one = (id, label) => [{ id, label, init: { sub: 'egg' } }];
const fillEgg = (v, advance = 30) => ({
  id: 'fill', group: L('Раствор белка', 'Ақуыз ерітіндісі', 'Egg white solution'), label: L(`Налить ${v} мл раствора белка`, `${v} мл ақуыз ерітіндісін құю`, `Pour ${v} mL of egg white solution`), advance,
  disabled: (t) => t.v > 0,
  apply(t, S, ctx) { warmBath(S, advance); Object.assign(t, eggInit(S.egg, v)); t.egg = v; ctx.log(cat(L(`В пробирку налито ${v} мл раствора белка`, `Пробиркаға ${v} мл ақуыз ерітіндісі құйылды`, `${v} mL of egg white solution put into a tube`), prepNote(S.egg))); },
});
const need = L('Сначала налейте раствор белка.', 'Алдымен ақуыз ерітіндісін құйыңыз.', 'Pour the egg white solution first.');

/* ---------- 6.1 высаливание ---------- */
const updS = (t, S) => { const a = saltOut(t, S.egg); t.ppt = a.ppt; t.pptColor = a.pptColor; t.key = a.key; };
const s0 = {
  type: 'test', id: 'salt',
  title: L('Высаливание сульфатом аммония', 'Аммоний сульфатымен тұздау', 'Salting out with ammonium sulfate'),
  instr: L('<ol><li>К <b>2 мл</b> раствора белка прилейте <b>равный объём</b> насыщенного раствора (NH₄)₂SO₄ — выпадают глобулины.</li><li>Отфильтруйте и насытьте фильтрат твёрдым (NH₄)₂SO₄ — выпадают альбумины.</li><li>Разбавьте часть осадка водой.</li></ol>',
    '<ol><li><b>2 мл</b> ақуыз ерітіндісіне қаныққан (NH₄)₂SO₄ ерітіндісінің <b>тең көлемін</b> құйыңыз — глобулиндер тұнбаға түседі.</li><li>Сүзіп, фильтратты қатты (NH₄)₂SO₄-пен қанықтырыңыз — альбуминдер тұнбаға түседі.</li><li>Тұнбаның бір бөлігін сумен сұйылтыңыз.</li></ol>',
    '<ol><li>To <b>2 mL</b> of egg white solution add an <b>equal volume</b> of saturated (NH₄)₂SO₄ solution — globulins precipitate.</li><li>Filter and saturate the filtrate with solid (NH₄)₂SO₄ — albumins precipitate.</li><li>Dilute part of the precipitate with water.</li></ol>'),
  need: L('Проведите высаливание и запишите наблюдение', 'Тұздауды жүргізіп, бақылауды жазыңыз', 'Do the salting out and record the observation'),
  tubes: one('s', L('белок', 'ақуыз', 'egg white')),
  reset: true,
  sceneBack: benchBack(['s']),
  reagents: [
    fillEgg(2),
    { id: 'sat', group: G, label: L('(NH₄)₂SO₄ насыщ.: +1 мл', '(NH₄)₂SO₄ қаныққан: +1 мл', 'Sat. (NH₄)₂SO₄: +1 mL'), advance: 20, disabled: (t) => t.filtered,
      apply(t, S, ctx) { if (!t.v) { ctx.feedback(need, 'warn'); return; } t.sat = (t.sat || 0) + 1; t.v += 1; updS(t, S);
        if (t.key === 'globulins' && !t.gLog) { t.gLog = true; ctx.log(L('При равном объёме насыщенного (NH₄)₂SO₄ (полунасыщение) выпал белый хлопьевидный осадок глобулинов', 'Қаныққан (NH₄)₂SO₄-тің тең көлемінде (жартылай қанығу) глобулиндердің ақ үлпек тұнбасы түсті', 'With an equal volume of saturated (NH₄)₂SO₄ (half-saturation) a white flocculent precipitate of globulins formed'), 'obs'); } } },
    { id: 'filter', group: G, label: L('Отфильтровать через бумажный фильтр', 'Қағаз сүзгі арқылы сүзу', 'Filter through filter paper'), advance: 240, disabled: (t) => t.filtered,
      apply(t, S, ctx) {
        warmBath(S, 240);
        if (t.key !== 'globulins') { ctx.feedback(L('Осадка глобулинов ещё нет — фильтровать нечего. Нужен равный объём насыщенного раствора соли.', 'Глобулин тұнбасы әлі жоқ — сүзетін ештеңе жоқ. Қаныққан тұз ерітіндісінің тең көлемі қажет.', 'There is no globulin precipitate yet — nothing to filter. An equal volume of saturated salt solution is needed.'), 'warn'); return; }
        t.filtered = true; t.v = Math.max(1, t.v - 0.6); updS(t, S); ctx.log(L('Осадок глобулинов отфильтрован, фильтрат прозрачный', 'Глобулин тұнбасы сүзілді, фильтрат мөлдір', 'The globulin precipitate was filtered off; the filtrate is clear'));
      } },
    { id: 'solid', group: G, label: L('Насытить фильтрат твёрдым (NH₄)₂SO₄', 'Фильтратты қатты (NH₄)₂SO₄-пен қанықтыру', 'Saturate the filtrate with solid (NH₄)₂SO₄'), advance: 120, disabled: (t) => !t.filtered || t.solid,
      apply(t, S, ctx) { warmBath(S, 120); t.solid = true; updS(t, S); ctx.log(L('Фильтрат насыщен твёрдым (NH₄)₂SO₄ (часть соли не растворилась) — выпал белый осадок альбуминов', 'Фильтрат қатты (NH₄)₂SO₄-пен қанықтырылды (тұздың бір бөлігі ерімеді) — альбуминдердің ақ тұнбасы түсті', 'The filtrate was saturated with solid (NH₄)₂SO₄ (some salt stayed undissolved) — a white precipitate of albumins formed'), 'obs'); } },
    { id: 'dil', group: G, label: L('Разбавить часть осадка водой: +1 мл', 'Тұнбаның бір бөлігін сумен сұйылту: +1 мл', 'Dilute part of the precipitate with water: +1 mL'), advance: 30, disabled: (t) => !t.solid,
      apply(t, S) { t.dil = (t.dil || 0) + 1; updS(t, S); } },
    readyBtn((tb) => (tb.s.dil >= 1 ? null : L('Выполните все стадии: соль → фильтрование → твёрдая соль → разбавление водой.', 'Барлық сатыны орындаңыз: тұз → сүзу → қатты тұз → сумен сұйылту.', 'Do all the stages: salt → filtration → solid salt → dilution with water.'))),
  ],
  done: (tubes, S, local) => !!local.ready,
  observe: {
    question: L('Что происходит с осадком при разбавлении водой?', 'Тұнбаны сумен сұйылтқанда онымен не болады?', 'What happens to the precipitate on dilution with water?'),
    options: [
      { id: 'ok', label: L('Белый осадок растворяется — высаливание обратимо', 'Ақ тұнба ериді — тұздау қайтымды', 'The white precipitate dissolves — salting out is reversible'),
        log: L('При разбавлении водой белый осадок растворился — осаждение сульфатом аммония обратимо, белок не денатурирован', 'Сумен сұйылтқанда ақ тұнба еріді — аммоний сульфатымен тұндыру қайтымды, ақуыз денатурацияланбаған', 'On dilution with water the white precipitate dissolved — precipitation by ammonium sulfate is reversible and the protein is not denatured') },
      { id: 'partly', label: L('Осадок растворяется лишь частично — нужно больше воды', 'Тұнба тек ішінара ериді — көбірек су қажет', 'The precipitate dissolves only partly — more water is needed'),
        log: L('После 1 мл воды осадок растворился лишь частично — соли ещё много; при дальнейшем разбавлении растворяется', '1 мл судан кейін тұнба тек ішінара еріді — тұз әлі көп; әрі қарай сұйылтқанда ериді', 'After 1 mL of water the precipitate dissolved only partly — there is still much salt; it dissolves on further dilution') },
      { id: 'stays', label: L('Осадок не растворяется — белок денатурирован', 'Тұнба ерімейді — ақуыз денатурацияланған', 'The precipitate does not dissolve — the protein is denatured') },
      { id: 'black', label: L('Осадок чернеет', 'Тұнба қараяды', 'The precipitate turns black') },
    ],
    correct: (S, tb) => (tb.s.key === 'redissolved' ? 'ok' : 'partly'),
    why: () => L('Нейтральные соли в высокой концентрации снимают гидратную оболочку и заряд белка и осаждают его обратимо: при разбавлении белок снова растворяется.', 'Жоғары концентрациядағы бейтарап тұздар ақуыздың гидраттық қабығы мен зарядын алып, оны қайтымды тұндырады: сұйылтқанда ақуыз қайта ериді.', 'Neutral salts at high concentration remove the hydration shell and charge of the protein and precipitate it reversibly: on dilution the protein redissolves.'),
  },
  onDone(S, tb) { S.e6.salt = tb.s.key; },
  hint1: L('Равный объём насыщенного раствора — это 2 мл к 2 мл белка.', 'Қаныққан ерітіндінің тең көлемі — 2 мл ақуызға 2 мл.', 'An equal volume of saturated solution means 2 mL to 2 mL of egg white.'),
  hint2: L('После фильтрования насыщают уже фильтрат твёрдой солью, а потом проверяют обратимость, разбавляя осадок водой.', 'Сүзгеннен кейін фильтратты қатты тұзбен қанықтырады, содан кейін тұнбаны сумен сұйылтып, қайтымдылығын тексереді.', 'After filtering, the filtrate is saturated with solid salt; then reversibility is checked by diluting the precipitate with water.'),
  hint3: L('Налить 2 мл → (NH₄)₂SO₄ +1 +1 мл → отфильтровать → твёрдая соль → вода +1 +1 мл → записать наблюдение.', '2 мл құю → (NH₄)₂SO₄ +1 +1 мл → сүзу → қатты тұз → су +1 +1 мл → бақылауды жазу.', 'Pour 2 mL → (NH₄)₂SO₄ +1 +1 mL → filter → solid salt → water +1 +1 mL → record the observation.'),
};

/* ---------- 6.2 тепловая денатурация ---------- */
const updH = (t, S) => { const a = heatCoag(t, S.egg); t.ppt = a.ppt; t.pptColor = a.pptColor; t.key = a.key; if (a.color) t.color = a.color; };
const s1 = {
  type: 'test', id: 'heat',
  title: L('Тепловая денатурация', 'Жылулық денатурация', 'Heat coagulation'),
  instr: L('<ol><li>Подкислите <b>2 мл</b> раствора белка <b>1–2 каплями</b> 1 % уксусной кислоты.</li><li>Нагрейте до кипения в кипящей водяной бане.</li></ol>',
    '<ol><li><b>2 мл</b> ақуыз ерітіндісін 1 % сірке қышқылының <b>1–2 тамшысымен</b> қышқылдаңыз.</li><li>Қайнап тұрған су моншасында қайнағанға дейін қыздырыңыз.</li></ol>',
    '<ol><li>Acidify <b>2 mL</b> of egg white solution with <b>1–2 drops</b> of 1 % acetic acid.</li><li>Heat to boiling in the boiling water bath.</li></ol>'),
  need: L('Проведите пробу и запишите наблюдение', 'Сынаманы жүргізіп, бақылауды жазыңыз', 'Do the test and record the observation'),
  tubes: one('h', L('белок', 'ақуыз', 'egg white')),
  reset: true,
  sceneBack: benchBack(['h']),
  reagents: [
    fillEgg(2),
    { id: 'ac', group: G, label: L('CH₃COOH 1 %: +1 кап.', 'CH₃COOH 1 %: +1 тамшы', 'CH₃COOH 1 %: +1 drop'), advance: 5, disabled: (t) => t.heated,
      apply(t, S, ctx) { warmBath(S, 5); if (!t.v) { ctx.feedback(need, 'warn'); return; } t.ac = (t.ac || 0) + 1; t.v += 0.05; t.pH = t.ac >= 1 ? 5 : 7; updH(t, S); } },
    { id: 'hb', group: G, label: L('Нагреть до кипения в бане (3 мин)', 'Моншада қайнағанға дейін қыздыру (3 мин)', 'Heat to boiling in the bath (3 min)'), advance: 180, disabled: (t) => t.heated,
      apply(t, S, ctx) {
        if (!t.v) { ctx.feedback(need, 'warn'); return; }
        if (!t.ac) ctx.remark({ key: 'e6noac', severity: 'minor', text: L('белок нагрет без подкисления уксусной кислотой — коагуляция неполная', 'ақуыз сірке қышқылымен қышқылдандырылмай қыздырылды — коагуляция толық емес', 'egg white heated without acidifying with acetic acid — incomplete coagulation') });
        warmBath(S, 180); t.heated = true; t.hot = true; updH(t, S);
      } },
    readyBtn((tb) => (tb.h.heated ? null : L('Нагрейте пробирку в бане.', 'Пробирканы моншада қыздырыңыз.', 'Heat the tube in the bath.'))),
  ],
  done: (tubes, S, local) => !!local.ready,
  observe: {
    question: L('Что образовалось при кипячении?', 'Қайнатқанда не түзілді?', 'What formed on boiling?'),
    options: [
      { id: 'flakes', label: L('Белые хлопья свернувшегося белка', 'Ұйыған ақуыздың ақ үлпектері', 'White flakes of coagulated protein'),
        log: (S, tb) => L(`При кипячении подкислённого раствора (${tb.h.ac} кап. 1 % CH₃COOH) выпали белые хлопья свернувшегося белка`, `Қышқылдандырылған ерітіндіні (${tb.h.ac} тамшы 1 % CH₃COOH) қайнатқанда ұйыған ақуыздың ақ үлпектері түсті`, `On boiling the acidified solution (${tb.h.ac} drops of 1 % CH₃COOH) white flakes of coagulated protein formed`) },
      { id: 'opal', label: L('Только опалесценция и лёгкая муть, хлопьев почти нет', 'Тек опалесценция және жеңіл лай, үлпектер жоқтың қасы', 'Only opalescence and slight turbidity, hardly any flakes'),
        log: L('Без подкисления при кипячении — лишь опалесценция и лёгкая муть, хлопья почти не образовались', 'Қышқылдандырусыз қайнатқанда — тек опалесценция және жеңіл лай, үлпектер іс жүзінде түзілмеді', 'Without acidifying, boiling gave only opalescence and slight turbidity, hardly any flakes') },
      { id: 'clear', label: L('Раствор остался прозрачным', 'Ерітінді мөлдір күйінде қалды', 'The solution stayed clear') },
      { id: 'violet', label: L('Появилась фиолетовая окраска', 'Күлгін түс пайда болды', 'A violet colour appeared') },
    ],
    correct: (S, tb) => (tb.h.key === 'opal' ? 'opal' : 'flakes'),
    why: () => L('Нагревание разрушает нативную структуру белка (денатурация); вблизи изоэлектрической точки белок теряет заряд и свёртывается хлопьями — поэтому раствор слегка подкисляют.', 'Қыздыру ақуыздың нативті құрылымын бұзады (денатурация); изоэлектрлік нүктеге жақын ақуыз зарядын жоғалтып, үлпек болып ұйиды — сондықтан ерітіндіні сәл қышқылдандырады.', 'Heating destroys the native structure of the protein (denaturation); near the isoelectric point the protein loses its charge and coagulates into flakes — which is why the solution is slightly acidified.'),
  },
  onDone(S, tb) { S.e6.coag = tb.h.key; },
  hint1: L('Сначала 1–2 капли уксусной кислоты, потом нагрев.', 'Алдымен 1–2 тамшы сірке қышқылы, содан кейін қыздыру.', 'First 1–2 drops of acetic acid, then heating.'),
  hint3: L('Налить 2 мл → CH₃COOH +1 +1 кап. → нагреть → записать наблюдение.', '2 мл құю → CH₃COOH +1 +1 тамшы → қыздыру → бақылауды жазу.', 'Pour 2 mL → CH₃COOH +1 +1 drop → heat → record the observation.'),
};

/* ---------- 6.3 соли тяжёлых металлов ---------- */
const updM = (t, S) => { const a = heavyMetal(t, S.egg); t.ppt = a.ppt; t.pptColor = a.pptColor; t.key = a.key; t.color = a.color; };
const s2 = {
  type: 'test', id: 'metal',
  title: L('Осаждение солями тяжёлых металлов', 'Ауыр металдар тұздарымен тұндыру', 'Precipitation by heavy-metal salts'),
  instr: L('<ol><li>К <b>1 мл</b> раствора белка по каплям прибавляйте 5 % CuSO₄.</li><li>Затем прибавьте избыток CuSO₄.</li></ol>',
    '<ol><li><b>1 мл</b> ақуыз ерітіндісіне 5 % CuSO₄-ты тамшылатып қосыңыз.</li><li>Содан кейін CuSO₄-тің артығын қосыңыз.</li></ol>',
    '<ol><li>Add 5 % CuSO₄ dropwise to <b>1 mL</b> of egg white solution.</li><li>Then add excess CuSO₄.</li></ol>'),
  need: L('Проведите пробу и запишите наблюдение', 'Сынаманы жүргізіп, бақылауды жазыңыз', 'Do the test and record the observation'),
  tubes: one('m', L('белок', 'ақуыз', 'egg white')),
  reset: true,
  sceneBack: benchBack(['m']),
  reagents: [
    fillEgg(1),
    { id: 'cu1', group: G, label: L('CuSO₄ 5 %: +1 кап.', 'CuSO₄ 5 %: +1 тамшы', 'CuSO₄ 5 %: +1 drop'), advance: 5,
      apply(t, S, ctx) { warmBath(S, 5); if (!t.v) { ctx.feedback(need, 'warn'); return; } t.cu = (t.cu || 0) + 1; t.v += 0.05; updM(t, S);
        if (t.cu === 1) ctx.log(L('От первых капель CuSO₄ выпал голубовато-белый осадок', 'CuSO₄-тің алғашқы тамшыларынан көгілдір-ақ тұнба түсті', 'The first drops of CuSO₄ gave a bluish-white precipitate'), 'obs'); } },
    { id: 'cu10', group: G, label: L('CuSO₄ 5 %: избыток (+10 кап.)', 'CuSO₄ 5 %: артығы (+10 тамшы)', 'CuSO₄ 5 %: excess (+10 drops)'), advance: 30,
      apply(t, S, ctx) {
        warmBath(S, 30); if (!t.v) { ctx.feedback(need, 'warn'); return; }
        if (!t.cu) ctx.remark({ key: 'e6cu', severity: 'minor', text: L('избыток CuSO₄ прилит сразу — не видно, как осадок образуется по каплям', 'CuSO₄ артығы бірден құйылды — тұнбаның тамшылап түзілуі көрінбейді', 'excess CuSO₄ added at once — the dropwise formation of the precipitate was not seen') });
        t.cu = (t.cu || 0) + 10; t.v += 0.5; updM(t, S);
      } },
    readyBtn((tb) => ((tb.m.cu || 0) >= 8 ? null : L('Прибавьте CuSO₄ по каплям, а затем в избытке.', 'CuSO₄-ты тамшылатып, содан кейін артық мөлшерде қосыңыз.', 'Add CuSO₄ dropwise and then in excess.'))),
  ],
  done: (tubes, S, local) => !!local.ready,
  observe: {
    question: L('Что наблюдается при прибавлении избытка CuSO₄?', 'CuSO₄ артығын қосқанда не байқалады?', 'What is observed on adding excess CuSO₄?'),
    options: [
      { id: 'ok', label: L('Голубоватый осадок, который в избытке CuSO₄ частично растворяется', 'Көгілдір тұнба, ол CuSO₄ артығында ішінара ериді', 'A bluish precipitate that partly redissolves in excess CuSO₄'),
        log: L('Голубоватый осадок белка; в избытке CuSO₄ осадок частично растворился (адсорбция ионов меди), раствор голубой', 'Ақуыздың көгілдір тұнбасы; CuSO₄ артығында тұнба ішінара еріді (мыс иондарының адсорбциясы), ерітінді көгілдір', 'A bluish protein precipitate; in excess CuSO₄ it partly redissolved (adsorption of copper ions); the solution is blue') },
      { id: 'more', label: L('Осадок только увеличивается, раствор бесцветный', 'Тұнба тек көбейеді, ерітінді түссіз', 'The precipitate only grows, the solution is colourless') },
      { id: 'violet', label: L('Фиолетовое окрашивание без осадка', 'Тұнбасыз күлгін түс', 'A violet colour without precipitate') },
      { id: 'none', label: L('Изменений нет', 'Өзгеріс жоқ', 'No change') },
    ],
    correct: () => 'ok',
    why: () => L('Ионы тяжёлых металлов образуют с белком нерастворимые соединения (денатурация, необратимо); избыток соли адсорбируется на частицах и частично переводит осадок в раствор.', 'Ауыр металдар иондары ақуызбен ерімейтін қосылыстар түзеді (денатурация, қайтымсыз); тұздың артығы бөлшектерге адсорбцияланып, тұнбаны ішінара ерітіндіге көшіреді.', 'Heavy-metal ions form insoluble compounds with the protein (denaturation, irreversible); excess salt is adsorbed on the particles and partly brings the precipitate back into solution.'),
  },
  onDone(S, tb) { S.e6.metal = tb.m.key; },
};

/* ---------- 6.4 этанол: где работать с ЛВЖ ---------- */
const s3 = {
  type: 'decide', id: 'etohsafe',
  title: L('Этанол рядом с плиткой', 'Плита жанындағы этанол', 'Ethanol near the hot plate'),
  instr: L('<p>Для последней пробы нужен 96 % этанол — легковоспламеняющаяся жидкость. На столе работает электроплитка с кипящей баней.</p>',
    '<p>Соңғы сынамаға 96 % этанол қажет — тез тұтанатын сұйықтық. Үстелде қайнап тұрған моншасы бар электр плитасы жұмыс істеп тұр.</p>',
    '<p>The last test needs 96 % ethanol, a flammable liquid. A hot plate with a boiling bath is on the bench.</p>'),
  need: L('Выберите, как работать с этанолом', 'Этанолмен қалай жұмыс істеу керегін таңдаңыз', 'Choose how to work with ethanol'),
  scene: ethanolScene,
  question: L('Как вы проведёте пробу с этанолом?', 'Этанолмен сынаманы қалай жүргізесіз?', 'How will you do the ethanol test?'),
  options: [
    { id: 'away', ok: true, label: L('Выключить плитку (баня больше не нужна), работать с этанолом вдали от неё, склянку сразу закрыть', 'Плитаны сөндіру (монша енді қажет емес), этанолмен одан алыс жұмыс істеу, құтыны бірден жабу', 'Switch off the hot plate (the bath is no longer needed), work with ethanol away from it and close the bottle at once'), advance: 30,
      effect(S) { S.bath.on = false; },
      log: L('Плитка выключена; этанол отмеривают вдали от плитки, склянка закрыта', 'Плита сөндірілді; этанол плитадан алыс өлшенеді, құты жабылды', 'Hot plate switched off; ethanol measured away from it; bottle closed') },
    { id: 'plate', ok: false, label: L('Подогреть пробирку с этанолом на плитке — осадок выпадет быстрее', 'Этанол бар пробирканы плитада жылыту — тұнба тезірек түседі', 'Warm the tube with ethanol on the hot plate — the precipitate will form faster'),
      remark: L('этанол нагревали на открытой электроплитке — воспламенение паров', 'этанол ашық электр плитасында қыздырылды — булардың тұтануы', 'ethanol heated on an open hot plate — the vapour caught fire'),
      critical: { text: L('Пары этанола над раскалённой плиткой вспыхивают; горящий спирт выплёскивается из пробирки на стол. В реальной лаборатории это пожар на рабочем месте и ожоги рук; горящую жидкость гасят, накрыв асбестовым (противопожарным) полотном, а водой не заливают.</p><p>Правильно: этанол держат вдали от плиток и пламени (раздел 7 методички), а осаждение белка спиртом идёт без нагревания.', 'Қызған плита үстіндегі этанол булары тұтанады; жанып жатқан спирт пробиркадан үстелге шашырайды. Нақты зертханада бұл жұмыс орнындағы өрт және қолдың күйігі; жанып жатқан сұйықтықты өртке қарсы жабындымен жауып сөндіреді, суға құймайды.</p><p>Дұрысы: этанолды плиталар мен жалыннан алыс ұстайды (әдістеменің 7-бөлімі), ал ақуызды спиртпен тұндыру қыздырусыз жүреді.', 'Ethanol vapour above the hot plate ignites and burning spirit splashes out of the tube onto the bench. In a real laboratory this is a fire at the workplace and burns to the hands; burning liquid is put out by covering it with a fire blanket, not with water.</p><p>The right way: keep ethanol away from hot plates and flames (manual, section 7); precipitation of protein by ethanol needs no heating.') } },
    { id: 'near', ok: false, severity: 'safety', label: L('Отмерить этанол рядом с работающей плиткой, склянку оставить открытой', 'Этанолды жұмыс істеп тұрған плита жанында өлшеп, құтыны ашық қалдыру', 'Measure the ethanol next to the hot plate and leave the bottle open'),
      remark: L('открытая склянка с этанолом рядом с работающей плиткой (раздел 7 методички)', 'жұмыс істеп тұрған плита жанында ашық этанол құтысы (әдістеменің 7-бөлімі)', 'open ethanol bottle next to a working hot plate (manual, section 7)'),
      whatif: L('Пары этанола тяжелее воздуха и стелются по столу к плитке; до вспышки достаточно одного разлива.', 'Этанол булары ауадан ауыр, үстел бойымен плитаға қарай таралады; тұтану үшін бір рет төгілу жеткілікті.', 'Ethanol vapour is heavier than air and creeps along the bench to the hot plate; a single spill is enough for a flash fire.'),
      effect(S) { S.bath.on = false; },
      log: L('Этанол отмерен рядом с работающей плиткой; затем плитку выключили', 'Этанол жұмыс істеп тұрған плита жанында өлшенді; содан кейін плита сөндірілді', 'Ethanol measured next to the working hot plate; the plate was then switched off') },
  ],
};

/* ---------- 6.5 органический растворитель ---------- */
const updE = (t, S) => { const a = ethanolPpt(t, S.egg); t.ppt = a.ppt; t.pptColor = a.pptColor; t.key = a.key; t.color = a.color; };
const s4 = {
  type: 'test', id: 'etoh',
  title: L('Осаждение этанолом', 'Этанолмен тұндыру', 'Precipitation by ethanol'),
  instr: L('<p>К <b>1 мл</b> раствора белка прилейте <b>2 мл</b> 96 % этанола и перемешайте.</p>', '<p><b>1 мл</b> ақуыз ерітіндісіне 96 % этанолдың <b>2 мл</b> құйып, араластырыңыз.</p>', '<p>Add <b>2 mL</b> of 96 % ethanol to <b>1 mL</b> of egg white solution and mix.</p>'),
  need: L('Проведите пробу и запишите наблюдение', 'Сынаманы жүргізіп, бақылауды жазыңыз', 'Do the test and record the observation'),
  tubes: one('a', L('белок', 'ақуыз', 'egg white')),
  reset: true,
  sceneBack: benchBack(['a']),
  reagents: [
    fillEgg(1),
    { id: 'et', group: G, label: L('Этанол 96 %: +1 мл', 'Этанол 96 %: +1 мл', 'Ethanol 96 %: +1 mL'), advance: 20, disabled: (t) => (t.etoh || 0) >= 2,
      apply(t, S, ctx) { warmBath(S, 20); if (!t.v) { ctx.feedback(need, 'warn'); return; } t.etoh = (t.etoh || 0) + 1; t.v += 1; updE(t, S); } },
    readyBtn((tb) => ((tb.a.etoh || 0) >= 2 ? null : L('Прилейте 2 мл этанола.', '2 мл этанол құйыңыз.', 'Add 2 mL of ethanol.'))),
  ],
  done: (tubes, S, local) => !!local.ready,
  observe: {
    question: L('Что наблюдается?', 'Не байқалады?', 'What is observed?'),
    options: [
      { id: 'ok', label: L('Помутнение и белый осадок', 'Лайлану және ақ тұнба', 'Turbidity and a white precipitate'),
        log: L('После прибавления 2 мл этанола раствор помутнел, выпал белый осадок денатурированного белка', '2 мл этанол қосқаннан кейін ерітінді лайланып, денатурацияланған ақуыздың ақ тұнбасы түсті', 'After adding 2 mL of ethanol the solution turned turbid and a white precipitate of denatured protein formed') },
      { id: 'clear', label: L('Раствор остался прозрачным', 'Ерітінді мөлдір күйінде қалды', 'The solution stayed clear') },
      { id: 'yellow', label: L('Раствор пожелтел', 'Ерітінді сарғайды', 'The solution turned yellow') },
      { id: 'gas', label: L('Выделяется газ', 'Газ бөлінеді', 'A gas is given off') },
    ],
    correct: () => 'ok',
    why: () => L('Органические растворители отнимают воду гидратной оболочки и разрушают нативную структуру белка — осаждение необратимо (денатурация).', 'Органикалық еріткіштер гидраттық қабықтың суын тартып алып, ақуыздың нативті құрылымын бұзады — тұндыру қайтымсыз (денатурация).', 'Organic solvents strip the water of the hydration shell and destroy the native structure of the protein — the precipitation is irreversible (denaturation).'),
  },
  onDone(S, tb) { S.e6.etoh = tb.a.key; },
};

const s5 = {
  type: 'quiz', id: 'q6',
  title: L('Высаливание и денатурация', 'Тұздау және денатурация', 'Salting out and denaturation'),
  instr: L('<p>Сравните результаты четырёх проб.</p>', '<p>Төрт сынаманың нәтижелерін салыстырыңыз.</p>', '<p>Compare the results of the four tests.</p>'),
  need: L('Ответьте на вопросы', 'Сұрақтарға жауап беріңіз', 'Answer the questions'),
  questions: [
    { q: L('Какое из осаждений обратимо?', 'Қай тұндыру қайтымды?', 'Which precipitation is reversible?'),
      options: [L('Высаливание сульфатом аммония', 'Аммоний сульфатымен тұздау', 'Salting out with ammonium sulfate'), L('Свёртывание при кипячении', 'Қайнатқанда ұю', 'Coagulation on boiling'), L('Осаждение CuSO₄', 'CuSO₄-пен тұндыру', 'Precipitation by CuSO₄'), L('Осаждение этанолом', 'Этанолмен тұндыру', 'Precipitation by ethanol')],
      correct: 0, why: L('Осадок после высаливания растворяется в воде; в пробах (2)–(4) — денатурация, необратимо.', 'Тұздаудан кейінгі тұнба суда ериді; (2)–(4) сынамаларда — денатурация, қайтымсыз.', 'The salted-out precipitate redissolves in water; tests (2)–(4) are denaturation, irreversible.') },
    { q: L('Почему при отравлении солями тяжёлых металлов дают молоко и яичный белок?', 'Неліктен ауыр металдар тұздарымен уланғанда сүт пен жұмыртқа ақуызын береді?', 'Why are milk and egg white given in poisoning with heavy-metal salts?'),
      options: [L('Их белки связывают ионы металла', 'Олардың ақуыздары металл иондарын байланыстырады', 'Their proteins bind the metal ions'), L('Они нейтрализуют кислоту желудка', 'Олар асқазан қышқылын бейтараптайды', 'They neutralise stomach acid'), L('Они вызывают рвоту', 'Олар құсуды тудырады', 'They cause vomiting'), L('Они восстанавливают металл', 'Олар металды тотықсыздандырады', 'They reduce the metal')],
      correct: 0, why: L('Практическое значение опыта 6 по методичке.', 'Әдістеме бойынша 6-тәжірибенің практикалық маңызы.', 'Practical significance of exp. 6 in the manual.') },
    { q: L('Что разрушается при денатурации белка?', 'Ақуыз денатурацияланғанда не бұзылады?', 'What is destroyed when a protein is denatured?'),
      options: [L('Нативная пространственная структура (вторичная, третичная, четвертичная); первичная сохраняется', 'Нативті кеңістіктік құрылым (екіншілік, үшіншілік, төртіншілік); біріншілік сақталады', 'The native spatial structure (secondary, tertiary, quaternary); the primary structure remains'), L('Пептидные связи — белок распадается на аминокислоты', 'Пептидтік байланыстар — ақуыз аминқышқылдарына ыдырайды', 'The peptide bonds — the protein falls apart into amino acids'), L('Только гидратная оболочка', 'Тек гидраттық қабық', 'Only the hydration shell'), L('Ничего — белок лишь выпадает в осадок', 'Ештеңе — ақуыз тек тұнбаға түседі', 'Nothing — the protein just precipitates')],
      correct: 0, why: L('Денатурация — разрушение нативной структуры; последовательность аминокислот не меняется (разделы 3.2 и 6).', 'Денатурация — нативті құрылымның бұзылуы; аминқышқылдарының реттілігі өзгермейді (3.2 және 6-бөлімдер).', 'Denaturation destroys the native structure; the amino acid sequence does not change (sections 3.2 and 6).') },
  ],
};

const wasteScene = () => scene(bottle(20, 'Pb, Cu', '') + bottle(84, L('водн.', 'сулы', 'aq.'), '') + bottle(148, L('орг.', 'орг.', 'org.'), '') + bottle(212, L('тв.', 'қатты', 'solid'), '') + bottle(276, L('стекло', 'шыны', 'glass'), '') + text(180, 60, L('ёмкости для отходов', 'қалдықтарға арналған ыдыстар', 'waste containers'), 'lblb'), L('Ёмкости для отходов', 'Қалдықтарға арналған ыдыстар', 'Waste containers'));

const s6 = {
  type: 'lab11-waste', id: 'waste',
  title: L('Отходы и уборка рабочего места', 'Қалдықтар және жұмыс орнын жинау', 'Waste and cleaning up'),
  instr: L('<p>Распределите отходы всех опытов по ёмкостям, выключите приборы и вымойте руки.</p><p class="note">Все отходы со свинцом — в отдельную ёмкость (раздел 7 методички).</p>', '<p>Барлық тәжірибелердің қалдықтарын ыдыстарға бөліп, құралдарды сөндіріп, қолды жуыңыз.</p><p class="note">Құрамында қорғасын бар барлық қалдықтар — бөлек ыдысқа (әдістеменің 7-бөлімі).</p>', '<p>Sort the waste from all the experiments into the containers, switch off the equipment and wash your hands.</p><p class="note">All lead-containing waste goes into a separate container (manual, section 7).</p>'),
  need: L('Утилизируйте отходы', 'Қалдықтарды кәдеге жаратыңыз', 'Dispose of the waste'),
  scene: wasteScene,
  items: [
    { id: 'pb', bin: 'heavy', label: L('Пробирки с PbS и плюмбитом (опыт 5)', 'PbS және плюмбиті бар пробиркалар (5-тәжірибе)', 'Tubes with PbS and plumbite (exp. 5)'),
      wrong: { sink: { severity: 'safety', text: L('свинецсодержащие отходы вылиты в раковину', 'құрамында қорғасын бар қалдықтар раковинаға төгілді', 'lead-containing waste poured down the sink'), whatif: L('Свинец не разрушается и накапливается в сточных водах и организмах; методичка требует собирать все отходы со свинцом в отдельную ёмкость.', 'Қорғасын ыдырамайды, ағынды суларда және ағзаларда жиналады; әдістеме құрамында қорғасын бар барлық қалдықтарды бөлек ыдысқа жинауды талап етеді.', 'Lead does not break down and accumulates in waste water and living organisms; the manual requires all lead waste to be collected in a separate container.') },
        acid: { severity: 'minor', text: L('свинецсодержащие отходы смешаны с обычными водными отходами', 'құрамында қорғасын бар қалдықтар қарапайым сулы қалдықтармен араластырылды', 'lead-containing waste mixed with ordinary aqueous waste') } } },
    { id: 'cu', bin: 'heavy', label: L('Растворы и осадки с солями меди (опыты 1, 3, 6)', 'Мыс тұздары бар ерітінділер мен тұнбалар (1, 3, 6-тәжірибелер)', 'Solutions and precipitates with copper salts (exp. 1, 3, 6)') },
    { id: 'hno3', bin: 'acid', label: L('Смеси с HNO₃ и 30 % NaOH (опыт 4)', 'HNO₃ және 30 % NaOH бар қоспалар (4-тәжірибе)', 'Mixtures with HNO₃ and 30 % NaOH (exp. 4)') },
    { id: 'nin', bin: 'acid', label: L('Пробы с нингидрином (опыт 2)', 'Нингидрин бар сынамалар (2-тәжірибе)', 'Ninhydrin tests (exp. 2)') },
    { id: 'etoh', bin: 'organic', label: L('Смесь белка с этанолом (опыт 6)', 'Ақуыз бен этанол қоспасы (6-тәжірибе)', 'Egg white–ethanol mixture (exp. 6)') },
    { id: 'filt', bin: 'solid', label: L('Фильтр с осадком глобулинов', 'Глобулин тұнбасы бар сүзгі', 'Filter paper with the globulin precipitate') },
  ],
  switches: [
    { id: 'plate', label: L('Плитка выключена и остывает', 'Плита сөндірілді және суып жатыр', 'Hot plate off and cooling'), log: L('Электроплитка выключена', 'Электр плитасы сөндірілді', 'Hot plate switched off') },
    { id: 'tubes', label: L('Пробирки вымыты', 'Пробиркалар жуылды', 'Tubes washed'), log: L('Пробирки вымыты и поставлены в штатив', 'Пробиркалар жуылып, штативке қойылды', 'Tubes washed and put in the rack') },
    { id: 'hands', label: L('Снять перчатки, вымыть руки с мылом', 'Қолғапты шешіп, қолды сабынмен жуу', 'Remove gloves, wash hands with soap'), log: L('Перчатки сняты, руки вымыты с мылом', 'Қолғап шешілді, қол сабынмен жуылды', 'Gloves removed, hands washed with soap') },
  ],
};

export default {
  id: '6',
  title: L('Осаждение белков (высаливание и денатурация)', 'Ақуыздарды тұндыру (тұздау және денатурация)', 'Precipitation of proteins (salting out and denaturation)'),
  principle: L('Нейтральные соли в высокой концентрации снимают гидратную оболочку и заряд молекул белка и осаждают их обратимо (высаливание); нагревание, ионы тяжёлых металлов и органические растворители разрушают нативную структуру (денатурация) и осаждают белок необратимо.', 'Жоғары концентрациядағы бейтарап тұздар ақуыз молекулаларының гидраттық қабығы мен зарядын алып, оларды қайтымды тұндырады (тұздау); қыздыру, ауыр металдар иондары және органикалық еріткіштер нативті құрылымды бұзып (денатурация), ақуызды қайтымсыз тұндырады.', 'Neutral salts at high concentration remove the hydration shell and charge of protein molecules and precipitate them reversibly (salting out); heat, heavy-metal ions and organic solvents destroy the native structure (denaturation) and precipitate proteins irreversibly.'),
  equation: [L('белок (р-р) + (NH₄)₂SO₄ ⇄ белок↓ (обратимо)', 'ақуыз (ер-ді) + (NH₄)₂SO₄ ⇄ ақуыз↓ (қайтымды)', 'protein (soln) + (NH₄)₂SO₄ ⇄ protein↓ (reversible)'), L('нативный белок → денатурированный белок↓ (t°, Cu²⁺, C₂H₅OH; необратимо)', 'нативті ақуыз → денатурацияланған ақуыз↓ (t°, Cu²⁺, C₂H₅OH; қайтымсыз)', 'native protein → denatured protein↓ (heat, Cu²⁺, C₂H₅OH; irreversible)')],
  initialState: ({ prev }) => ({ egg: (prev['1'] || {}).egg || 'ok', bath: { T: 100, on: true }, e6: {} }),
  checkpoints: [0, 3],
  steps: [s0, s1, s2, s3, s4, s5, s6],
  results: (S) => ({ ...S.e6, eggPrep: S.egg }),
  summary: (r) => [
    { label: L('Высаливание', 'Тұздау', 'Salting out'), value: L('обратимо', 'қайтымды', 'reversible'), st: 'ok' },
    { label: L('t° / Cu²⁺ / этанол', 't° / Cu²⁺ / этанол', 'heat / Cu²⁺ / ethanol'), value: r.coag === 'opal' ? L('слабая коагуляция / + / +', 'әлсіз коагуляция / + / +', 'weak coagulation / + / +') : L('+ / + / +', '+ / + / +', '+ / + / +'), st: r.coag === 'opal' ? 'warn' : 'ok' },
  ],
};
