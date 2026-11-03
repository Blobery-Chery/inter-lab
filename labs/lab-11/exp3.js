/** Опыт 3. Биуретовая реакция (проба на пептидные связи). Методичка, раздел 6, опыт 3. */
import { L } from '../../app/i18n.js';
import { biuret } from './model.js';
import { washScene, benchBack } from './scene.js';
import { eggInit, prepNote, cat, readyBtn, SUB } from './common.js';

const s0 = {
  type: 'decide', id: 'wash',
  title: L('Чистые пробирки', 'Таза пробиркалар', 'Clean test tubes'),
  instr: L('<p>Для биуретовой пробы нужны три пробирки. В штативе стоят пробирки после нингидриновой пробы — с фиолетовым раствором на стенках.</p>',
    '<p>Биурет сынамасына үш пробирка қажет. Штативте нингидрин сынамасынан кейінгі пробиркалар тұр — қабырғаларында күлгін ерітінді бар.</p>',
    '<p>The biuret test needs three test tubes. The rack holds the tubes from the ninhydrin test, with violet solution on their walls.</p>'),
  need: L('Подготовьте пробирки', 'Пробиркаларды дайындаңыз', 'Prepare the tubes'),
  scene: washScene,
  question: L('Как подготовить пробирки?', 'Пробиркаларды қалай дайындау керек?', 'How do you prepare the tubes?'),
  options: [
    { id: 'wash', ok: true, label: L('Вылить остатки в ёмкость для водных отходов, вымыть пробирки ёршиком и ополоснуть дистиллированной водой', 'Қалдықтарды сулы қалдықтар ыдысына төгіп, пробиркаларды ершікпен жуып, дистилденген сумен шаю', 'Pour the residues into the aqueous waste, wash the tubes with a brush and rinse with distilled water'), advance: 180,
      effect(S) { S.dirty = false; },
      log: L('Пробирки вымыты ёршиком и ополоснуты дистиллированной водой; остатки — в ёмкость для водных отходов', 'Пробиркалар ершікпен жуылып, дистилденген сумен шайылды; қалдықтар — сулы қалдықтар ыдысына', 'Tubes washed with a brush and rinsed with distilled water; residues into the aqueous waste') },
    { id: 'reuse', ok: false, severity: 'major', label: L('Только вылить содержимое и сразу налить новые растворы — так быстрее', 'Ішіндегісін төгіп, бірден жаңа ерітінділерді құю — тезірек', 'Just empty them and pour in the new solutions straight away — it is quicker'), advance: 20,
      remark: L('для биуретовой пробы взяты невымытые пробирки (остатки нингидриновой пробы)', 'биурет сынамасына жуылмаған пробиркалар алынды (нингидрин сынамасының қалдықтары)', 'unwashed tubes used for the biuret test (residues of the ninhydrin test)'),
      whatif: L('Пурпур Руэмана остаётся на стенках: в пробирке с глицином появится сиреневый оттенок, который легко принять за положительную биуретовую реакцию, — вывод о пептидных связях будет неверным.', 'Руэман пурпуры қабырғаларда қалады: глицин бар пробиркада күлгін реңк пайда болады, оны оң биурет реакциясы деп қабылдау оңай — пептидтік байланыстар туралы қорытынды қате болады.', 'Ruhemann’s purple stays on the walls: the glycine tube will show a lilac tint that is easily mistaken for a positive biuret reaction, so the conclusion about peptide bonds will be wrong.'),
      effect(S) { S.dirty = true; },
      log: L('Содержимое пробирок вылито, пробирки не мыли', 'Пробиркалардың ішіндегісі төгілді, пробиркалар жуылмады', 'Tubes emptied but not washed') },
    { id: 'sink', ok: false, severity: 'minor', label: L('Вымыть пробирки, а остатки с нингидрином вылить в раковину', 'Пробиркаларды жуып, нингидрин қалдықтарын раковинаға төгу', 'Wash the tubes and pour the ninhydrin residues down the sink'), advance: 180,
      remark: L('остатки нингидриновой пробы вылиты в раковину (п. 10.2 правил ТБ)', 'нингидрин сынамасының қалдықтары раковинаға төгілді (ҚТ ережелерінің 10.2-тармағы)', 'ninhydrin residues poured down the sink (safety rule 10.2)'),
      whatif: L('Нингидрин вреден; растворы реактивов сливают в ёмкость для отходов, а не в канализацию.', 'Нингидрин зиянды; реактив ерітінділерін кәрізге емес, қалдықтар ыдысына төгеді.', 'Ninhydrin is harmful; reagent solutions go into the waste container, not down the drain.'),
      effect(S) { S.dirty = false; },
      log: L('Пробирки вымыты; остатки вылиты в раковину', 'Пробиркалар жуылды; қалдықтар раковинаға төгілді', 'Tubes washed; residues poured down the sink') },
  ],
};

const upd = (t, S) => { const a = biuret(t, S.egg); t.color = a.color; t.ppt = a.ppt; t.pptColor = a.pptColor; t.key = a.key; };

const s1 = {
  type: 'test', id: 'biuret',
  title: L('Биуретовая проба', 'Биурет сынамасы', 'Biuret test'),
  instr: L('<ol><li>Налейте в три пробирки по <b>1 мл</b> растворов яичного белка, желатина и глицина.</li><li>Прибавьте в каждую <b>1 мл</b> 10 % NaOH, затем <b>1–2 капли</b> 1 % CuSO₄ и встряхните.</li></ol><p class="note">Избегайте избытка CuSO₄ — его голубой цвет маскирует реакцию.</p>',
    '<ol><li>Үш пробиркаға жұмыртқа ақуызы, желатин және глицин ерітінділерінен <b>1 мл</b>-ден құйыңыз.</li><li>Әрқайсысына <b>1 мл</b> 10 % NaOH, содан кейін 1 % CuSO₄-тің <b>1–2 тамшысын</b> қосып, шайқаңыз.</li></ol><p class="note">CuSO₄ артық болмасын — оның көгілдір түсі реакцияны көмескілейді.</p>',
    '<ol><li>Put <b>1 mL</b> each of egg white, gelatin and glycine solution into three tubes.</li><li>Add <b>1 mL</b> of 10 % NaOH to each, then <b>1–2 drops</b> of 1 % CuSO₄, and shake.</li></ol><p class="note">Avoid excess CuSO₄ — its blue colour masks the reaction.</p>'),
  need: L('Проведите пробу и запишите наблюдение', 'Сынаманы жүргізіп, бақылауды жазыңыз', 'Do the test and record the observation'),
  tubes: [
    { id: 'e', label: L('1 · белок', '1 · ақуыз', '1 · egg white'), init: { sub: 'egg' } },
    { id: 'gl', label: L('2 · желатин', '2 · желатин', '2 · gelatin'), init: { sub: 'gel' } },
    { id: 'g', label: L('3 · глицин', '3 · глицин', '3 · glycine'), init: { sub: 'gly' } },
  ],
  reset: true,
  sceneBack: benchBack(['e', 'gl', 'g']),
  reagents: [
    { id: 'fill', target: 'all', group: L('Исследуемые растворы', 'Зерттелетін ерітінділер', 'Test solutions'), label: L('Налить по 1 мл в три пробирки', 'Үш пробиркаға 1 мл-ден құю', 'Pour 1 mL into each of the three tubes'), advance: 40,
      disabled: (t) => t.v > 0,
      apply(t, S, ctx, id) {
        if (id === 'e') ctx.log(cat(L('В пробирки налито по 1 мл: 1 — раствор белка, 2 — желатин, 3 — глицин', 'Пробиркаларға 1 мл-ден құйылды: 1 — ақуыз ерітіндісі, 2 — желатин, 3 — глицин', '1 mL poured into each tube: 1 — egg white, 2 — gelatin, 3 — glycine'), prepNote(S.egg)));
        if (t.v > 0) return;
        if (t.sub === 'egg') Object.assign(t, eggInit(S.egg, 1)); else t.v = 1;
        t.dirty = !!S.dirty; upd(t, S);
      } },
    { id: 'naoh', group: L('В выбранную пробирку', 'Таңдалған пробиркаға', 'Into the selected tube'), label: L('NaOH 10 %: 1 мл', 'NaOH 10 %: 1 мл', 'NaOH 10 %: 1 mL'), advance: 15,
      apply(t, S, ctx) {
        if (!t.v) { ctx.feedback(L('Сначала налейте исследуемый раствор.', 'Алдымен зерттелетін ерітіндіні құйыңыз.', 'Pour the test solution first.'), 'warn'); return; }
        if ((t.oh || 0) >= 1) { ctx.feedback(L('В эту пробирку щёлочь уже прилита.', 'Бұл пробиркаға сілті құйылып қойған.', 'Alkali has already been added to this tube.'), 'warn'); return; }
        if ((t.cu || 0) > 0) ctx.remark({ key: 'e3order', severity: 'minor', text: L('нарушен порядок: CuSO₄ прибавлен раньше щёлочи', 'рет бұзылды: CuSO₄ сілтіден бұрын қосылды', 'wrong order: CuSO₄ added before the alkali') });
        t.oh = 1; t.v += 1; t.shaken = false; upd(t, S);
      } },
    { id: 'cu', group: L('В выбранную пробирку', 'Таңдалған пробиркаға', 'Into the selected tube'), label: L('CuSO₄ 1 %: +1 кап.', 'CuSO₄ 1 %: +1 тамшы', 'CuSO₄ 1 %: +1 drop'), advance: 5,
      apply(t, S, ctx) {
        if (!t.v) { ctx.feedback(L('Сначала налейте исследуемый раствор.', 'Алдымен зерттелетін ерітіндіні құйыңыз.', 'Pour the test solution first.'), 'warn'); return; }
        t.cu = (t.cu || 0) + 1; t.v += 0.05; t.shaken = false; upd(t, S);
        if (t.cu === 4 && t.sub !== 'gly') {
          ctx.remark({ key: 'e3cu', severity: 'minor', text: L('избыток CuSO₄ в биуретовой пробе', 'биурет сынамасында CuSO₄ артық', 'excess CuSO₄ in the biuret test') });
          ctx.feedback(L('Это уже больше 1–2 капель: голубой цвет начинает маскировать фиолетовый. Вылейте и повторите пробу.', 'Бұл 1–2 тамшыдан көп: көгілдір түс күлгінді көмескілей бастады. Төгіп, сынаманы қайталаңыз.', 'That is more than 1–2 drops: the blue starts to mask the violet. Empty the tube and repeat the test.'), 'warn');
        }
      } },
    { id: 'shake', group: L('В выбранную пробирку', 'Таңдалған пробиркаға', 'Into the selected tube'), label: L('Встряхнуть', 'Шайқау', 'Shake'), advance: 10,
      apply(t, S) { t.shaken = true; upd(t, S); } },
    readyBtn((tb) => {
      if (['e', 'gl', 'g'].some((k) => !tb[k].v)) return L('Налейте исследуемые растворы во все три пробирки.', 'Үш пробиркаға да зерттелетін ерітінділерді құйыңыз.', 'Pour the test solutions into all three tubes.');
      if (['e', 'gl', 'g'].some((k) => !(tb[k].cu > 0))) return L('Прибавьте CuSO₄ во все три пробирки.', 'Үш пробиркаға да CuSO₄ қосыңыз.', 'Add CuSO₄ to all three tubes.');
      if (['e', 'gl', 'g'].some((k) => !tb[k].shaken)) return L('Встряхните все пробирки.', 'Барлық пробиркаларды шайқаңыз.', 'Shake all the tubes.');
      return null;
    }),
  ],
  done: (tubes, S, local) => !!local.ready,
  observe: {
    question: L('Какая окраска в трёх пробирках?', 'Үш пробиркада қандай түс бар?', 'What colours are in the three tubes?'),
    options: [
      { id: 'ok', label: L('Белок — фиолетовая, желатин — красно-фиолетовая, глицин — только голубая', 'Ақуыз — күлгін, желатин — қызыл-күлгін, глицин — тек көгілдір', 'Egg white — violet, gelatin — red-violet, glycine — blue only'),
        log: (S) => cat(L('Биуретовая проба: белок — фиолетовое окрашивание, желатин — красно-фиолетовое, глицин — только голубая окраска (отрицательно)', 'Биурет сынамасы: ақуыз — күлгін түс, желатин — қызыл-күлгін, глицин — тек көгілдір түс (теріс)', 'Biuret test: egg white — violet, gelatin — red-violet, glycine — blue only (negative)'), prepNote(S.egg)) },
      { id: 'dirty', label: L('Белок и желатин — фиолетовые, и у глицина сиреневый оттенок', 'Ақуыз бен желатин — күлгін, глицинде де күлгін реңк бар', 'Egg white and gelatin violet, and glycine has a lilac tint too'),
        log: L('Белок — фиолетовое, желатин — красно-фиолетовое; в пробирке с глицином сиреневый оттенок — остатки пурпура Руэмана на стенках невымытой пробирки', 'Ақуыз — күлгін, желатин — қызыл-күлгін; глицин бар пробиркада күлгін реңк — жуылмаған пробирка қабырғаларындағы Руэман пурпурының қалдықтары', 'Egg white violet, gelatin red-violet; the glycine tube shows a lilac tint — Ruhemann’s purple left on the walls of the unwashed tube') },
      { id: 'masked', label: L('Синяя окраска, фиолетовый оттенок едва заметен, голубой осадок', 'Көк түс, күлгін реңк әрең байқалады, көгілдір тұнба', 'Blue colour, violet barely visible, blue precipitate'),
        log: L('Окраска синяя, фиолетовый оттенок маскирован избытком CuSO₄ (голубой осадок Cu(OH)₂)', 'Түс көк, күлгін реңк CuSO₄ артықтығымен көмескіленген (Cu(OH)₂ көгілдір тұнбасы)', 'Blue colour; the violet is masked by excess CuSO₄ (blue Cu(OH)₂ precipitate)') },
      { id: 'nobase', label: L('Во всех пробирках лишь бледно-голубая окраска CuSO₄', 'Барлық пробиркада тек CuSO₄-тің бозғылт көгілдір түсі', 'Only the pale blue of CuSO₄ in all tubes'),
        log: L('Фиолетовой окраски нет — бледно-голубой раствор: пробу ставили без щёлочи', 'Күлгін түс жоқ — бозғылт көгілдір ерітінді: сынама сілтісіз жүргізілді', 'No violet — pale blue solution: the test was done without alkali') },
    ],
    correct: (S, tb) => {
      const pep = [tb.e.key, tb.gl.key];
      if (pep.some((k) => k === 'masked' || k === 'blueish') || tb.g.key === 'masked') return 'masked';
      if ([...pep, tb.g.key].some((k) => k === 'nobase')) return 'nobase';
      if (tb.g.key === 'lilac') return 'dirty';
      return 'ok';
    },
    why: (S, tb) => L('В сильнощелочной среде Cu²⁺ образует фиолетовые комплексы с атомами азота пептидных групп; нужно не меньше двух пептидных связей, поэтому свободная аминокислота даёт только голубую окраску.', 'Күшті сілтілі ортада Cu²⁺ пептидтік топтардың азот атомдарымен күлгін кешендер түзеді; кемінде екі пептидтік байланыс қажет, сондықтан бос аминқышқылы тек көгілдір түс береді.', 'In strongly alkaline solution Cu²⁺ forms violet complexes with the nitrogen atoms of the peptide groups; at least two peptide bonds are needed, so a free amino acid gives only a blue colour.'),
  },
  onDone(S, tb, ctx) {
    S.e3 = { egg: tb.e.key, gel: tb.gl.key, gly: tb.g.key, cu: Math.max(tb.e.cu || 0, tb.gl.cu || 0, tb.g.cu || 0), dirty: !!S.dirty };
    const keys = [tb.e.key, tb.gl.key, tb.g.key];
    if (keys.includes('nobase')) ctx.remark({ key: 'e3base', severity: 'major', text: L('биуретовая проба без щёлочи — фиолетовая окраска не могла появиться', 'биурет сынамасы сілтісіз — күлгін түс пайда бола алмады', 'biuret test without alkali — the violet colour could not appear') });
    if (keys.some((k) => k === 'masked' || k === 'blueish')) ctx.remark({ key: 'e3mask', severity: 'major', text: L('избыток CuSO₄ замаскировал биуретовую реакцию — результат не читается', 'CuSO₄ артықтығы биурет реакциясын көмескіледі — нәтиже оқылмайды', 'excess CuSO₄ masked the biuret reaction — the result cannot be read') });
  },
  hint1: L('Порядок: раствор → 1 мл NaOH → 1–2 капли CuSO₄ → встряхнуть. В каждой пробирке.', 'Рет: ерітінді → 1 мл NaOH → 1–2 тамшы CuSO₄ → шайқау. Әр пробиркада.', 'Order: solution → 1 mL NaOH → 1–2 drops CuSO₄ → shake. In every tube.'),
  hint2: L('Больше двух капель CuSO₄ не нужно: голубой Cu(OH)₂ маскирует фиолетовую окраску. Переборщили — «Вылить и повторить пробу».', 'CuSO₄-тің екі тамшысынан артығы қажет емес: көгілдір Cu(OH)₂ күлгін түсті көмескілейді. Асып кетсе — «Төгіп, сынаманы қайталау».', 'No more than two drops of CuSO₄: blue Cu(OH)₂ masks the violet. If you overdo it — “Empty the tube and repeat”.'),
  hint3: L('Налить по 1 мл → в каждую пробирку: NaOH 1 мл, CuSO₄ 2 капли, встряхнуть → записать наблюдение.', '1 мл-ден құю → әр пробиркаға: NaOH 1 мл, CuSO₄ 2 тамшы, шайқау → бақылауды жазу.', 'Pour 1 mL each → for every tube: NaOH 1 mL, CuSO₄ 2 drops, shake → record the observation.'),
};

const s2 = {
  type: 'quiz', id: 'q3',
  title: L('Биуретовая реакция: вопросы', 'Биурет реакциясы: сұрақтар', 'Biuret reaction: questions'),
  instr: L('<p>Свяжите результат со строением веществ.</p>', '<p>Нәтижені заттардың құрылысымен байланыстырыңыз.</p>', '<p>Link the result to the structure of the substances.</p>'),
  need: L('Ответьте на вопросы', 'Сұрақтарға жауап беріңіз', 'Answer the questions'),
  questions: [
    { q: L('Какой структурный элемент белков обнаруживает биуретовая реакция?', 'Биурет реакциясы ақуыздардың қандай құрылымдық элементін анықтайды?', 'Which structural element of proteins does the biuret reaction detect?'),
      options: [L('Пептидные связи (не меньше двух)', 'Пептидтік байланыстар (кемінде екі)', 'Peptide bonds (at least two)'), L('Ароматические остатки', 'Ароматты қалдықтар', 'Aromatic residues'), L('Серосодержащие остатки', 'Құрамында күкірт бар қалдықтар', 'Sulfur-containing residues'), L('Свободные α-аминогруппы', 'Бос α-аминотоптар', 'Free α-amino groups')],
      correct: 0, why: L('–CO–NH– группы пептидной цепи координируют Cu²⁺ в щелочной среде.', 'Пептидтік тізбектің –CO–NH– топтары сілтілі ортада Cu²⁺-ты координациялайды.', 'The –CO–NH– groups of the chain coordinate Cu²⁺ in alkaline solution.') },
    { q: L('Почему глицин даёт отрицательную биуретовую пробу?', 'Неліктен глицин теріс биурет сынамасын береді?', 'Why does glycine give a negative biuret test?'),
      options: [L('В свободной аминокислоте нет пептидных связей; голубая окраска — от комплекса Cu²⁺ с аминокислотой', 'Бос аминқышқылында пептидтік байланыс жоқ; көгілдір түс — Cu²⁺-тың аминқышқылымен кешенінен', 'A free amino acid has no peptide bonds; the blue colour is the Cu²⁺–amino acid complex'), L('Глицин не растворяется в щёлочи', 'Глицин сілтіде ерімейді', 'Glycine is insoluble in alkali'), L('Глицин восстанавливает Cu²⁺', 'Глицин Cu²⁺-ты тотықсыздандырады', 'Glycine reduces Cu²⁺'), L('В глицине нет атомов азота', 'Глицинде азот атомы жоқ', 'Glycine has no nitrogen atoms')],
      correct: 0, why: L('Нужно хотя бы две пептидные связи (раздел 6, принцип опыта 3).', 'Кемінде екі пептидтік байланыс қажет (6-бөлім, 3-тәжірибе принципі).', 'At least two peptide bonds are required (section 6, principle of exp. 3).') },
    { q: L('Почему пептидная связь плоская?', 'Неліктен пептидтік байланыс жазық?', 'Why is the peptide bond planar?'),
      options: [L('Неподелённая пара азота сопряжена с C=O: связь C–N частично двойная, вращение затруднено', 'Азоттың бөлінбеген жұбы C=O-мен түйіндескен: C–N байланысы ішінара қос, айналу қиындаған', 'The nitrogen lone pair is conjugated with C=O: the C–N bond has partial double-bond character and rotation is restricted'), L('Из-за водородных связей с водой', 'Сумен сутектік байланыстарға байланысты', 'Because of hydrogen bonds to water'), L('Из-за дисульфидных мостиков', 'Дисульфидтік көпірлерге байланысты', 'Because of disulfide bridges'), L('Атом азота в ней sp³-гибридизован', 'Ондағы азот атомы sp³-гибридтелген', 'Its nitrogen atom is sp³-hybridised')],
      correct: 0, why: L('Раздел 3.2: сопряжение, частично двойная связь, обычно транс-конфигурация.', '3.2-бөлім: түйіндесу, ішінара қос байланыс, әдетте транс-конфигурация.', 'Section 3.2: conjugation, partial double bond, usually trans configuration.') },
  ],
};

export default {
  id: '3',
  title: L('Биуретовая реакция (проба на пептидные связи)', 'Биурет реакциясы (пептидтік байланыстарға сынама)', 'Biuret reaction (test for peptide bonds)'),
  principle: L('В сильнощелочной среде Cu²⁺ образует фиолетовые комплексы с атомами азота пептидных групп. Нужно не меньше двух пептидных связей, поэтому свободные аминокислоты фиолетовой окраски не дают.', 'Күшті сілтілі ортада Cu²⁺ пептидтік топтардың азот атомдарымен күлгін кешендер түзеді. Кемінде екі пептидтік байланыс қажет, сондықтан бос аминқышқылдары күлгін түс бермейді.', 'In strongly alkaline medium Cu²⁺ forms violet complexes with the nitrogen atoms of peptide groups. At least two peptide bonds are required, so free amino acids do not give the violet colour.'),
  equation: [L('белок (–CO–NH–)ₙ + Cu²⁺ (NaOH) → фиолетовый комплекс меди(II) с пептидными группами', 'ақуыз (–CO–NH–)ₙ + Cu²⁺ (NaOH) → мыс(II)-тің пептидтік топтармен күлгін кешені', 'protein (–CO–NH–)ₙ + Cu²⁺ (NaOH) → violet copper(II) complex with peptide groups')],
  initialState: ({ prev }) => ({ egg: (prev['1'] || {}).egg || 'ok', dirty: false, e3: null }),
  checkpoints: [0, 1],
  steps: [s0, s1, s2],
  results: (S) => ({ ...(S.e3 || {}), eggPrep: S.egg }),
  summary: (r) => [
    { label: SUB.egg, value: r.egg === 'violet' ? L('фиолетовая', 'күлгін', 'violet') : L('не читается', 'оқылмайды', 'unclear'), st: r.egg === 'violet' ? 'ok' : 'warn' },
    { label: SUB.gly, value: r.gly === 'blue' ? L('голубая (–)', 'көгілдір (–)', 'blue (–)') : L('ложная окраска', 'жалған түс', 'false colour'), st: r.gly === 'blue' ? 'ok' : 'warn' },
  ],
};
