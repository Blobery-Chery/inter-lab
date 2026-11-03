/** Опыт 2. Кислотные свойства продукта. Методичка, раздел 6, опыт 2. */
import { L, n } from '../../app/i18n.js';
import { M, pHcalc } from './model.js';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const setPH = (t) => { const r = pHcalc(t.net, t.C0, t.V); t.pH = r.pH; t.pptRaw = r.ppt; t.ppt = clamp((r.ppt / t.C0) * 1.4, 0, 1); return r; };

const t1 = {
  type: 'test', id: 'nahco3',
  title: L('Реакция с гидрокарбонатом натрия', 'Натрий гидрокарбонатымен реакция', 'Reaction with sodium hydrogen carbonate'),
  instr: L('<ol><li>К нескольким кристаллам м-нитробензойной кислоты и параллельно — бензойной кислоты прилейте по 1–2 мл раствора NaHCO₃ (5–10 %).</li><li>Наблюдайте и запишите наблюдение.</li></ol>',
    '<ol><li>м-Нитробензой қышқылының бірнеше кристалына және қатар — бензой қышқылына 1–2 мл NaHCO₃ ерітіндісінен (5–10 %) құйыңыз.</li><li>Бақылап, бақылауды жазыңыз.</li></ol>',
    '<ol><li>To a few crystals of m-nitrobenzoic acid and, side by side, of benzoic acid add 1–2 mL of NaHCO₃ solution (5–10 %).</li><li>Observe and record what you see.</li></ol>'),
  need: L('Проведите пробу и запишите наблюдение', 'Сынаманы жүргізіп, бақылауды жазыңыз', 'Do the test and record the observation'),
  tubes: [{ id: 'p', label: L('1 · продукт', '1 · өнім', '1 · product') }, { id: 'b', label: L('2 · бензойная к-та', '2 · бензой қ-лы', '2 · benzoic acid') }],
  reagents: [
    { id: 'crys', target: 'all', label: L('Внести кристаллы в пробирки', 'Пробиркаларға кристалдар салу', 'Put crystals into the tubes'), advance: 30,
      disabled: (t) => t.crys,
      apply(t, S, ctx, id) { t.crys = true; t.solid = 0.6; if (id === 'p') ctx.log(L('В пробирку 1 внесены кристаллы продукта, в пробирку 2 — бензойной кислоты', '1-пробиркаға өнім кристалдары, 2-пробиркаға бензой қышқылы салынды', 'Tube 1: crystals of the product; tube 2: crystals of benzoic acid')); } },
    { id: 'nahco3', target: 'all', label: L('Прилить по 1,5 мл NaHCO₃', 'Әрқайсысына 1,5 мл NaHCO₃ құю', 'Add 1.5 mL of NaHCO₃ to each'), advance: 60,
      disabled: (t) => t.nahco3,
      apply(t, S, ctx, id) { t.nahco3 = true; t.v += 1.5; if (t.crys) { t.gas = true; t.solid = 0; } if (id === 'p') ctx.log(L('В обе пробирки прилито по 1,5 мл раствора NaHCO₃', 'Екі пробиркаға да 1,5 мл NaHCO₃ ерітіндісі құйылды', '1.5 mL of NaHCO₃ solution added to both tubes')); } },
  ],
  done: (tubes) => tubes.p.crys && tubes.p.nahco3 && tubes.b.crys && tubes.b.nahco3,
  observe: {
    question: L('Что вы наблюдаете в обеих пробирках?', 'Екі пробиркада не байқайсыз?', 'What do you observe in both tubes?'),
    options: [
      { id: 'gas', label: L('Выделяются пузырьки газа, кристаллы растворяются', 'Газ көпіршіктері бөлініп, кристалдар ериді', 'Gas bubbles are given off and the crystals dissolve'), log: L('В обеих пробирках выделяются пузырьки газа (CO₂), кристаллы растворяются', 'Екі пробиркада да газ көпіршіктері (CO₂) бөлініп, кристалдар ериді', 'Gas bubbles (CO₂) are given off in both tubes and the crystals dissolve') },
      { id: 'ppt', label: L('Выпадает белый осадок', 'Ақ тұнба түзіледі', 'A white precipitate forms') },
      { id: 'none', label: L('Изменений нет', 'Өзгеріс жоқ', 'No change') },
      { id: 'violet', label: L('Появляется фиолетовое окрашивание', 'Күлгін түс пайда болады', 'A violet colour appears') },
    ],
    correct: () => 'gas',
    why: () => L('Обе карбоновые кислоты (pKa 3,45 и 4,20) сильнее угольной и вытесняют CO₂ из гидрокарбоната.', 'Екі карбон қышқылы да (pKa 3,45 және 4,20) көмір қышқылынан күшті және гидрокарбонаттан CO₂ ығыстырады.', 'Both carboxylic acids (pKa 3.45 and 4.20) are stronger than carbonic acid and liberate CO₂ from hydrogen carbonate.'),
  },
  onDone(S) { S.e2.a = true; },
};

const t2 = {
  type: 'test', id: 'salt',
  title: L('Соль и её разложение кислотой', 'Тұз және оның қышқылмен ыдырауы', 'The salt and its decomposition by acid'),
  instr: L('<ol><li>Растворите около <b>0,1 г</b> продукта в 1–2 мл 10 % NaOH.</li><li>По каплям прибавляйте 10 % HCl до кислой реакции, контролируя pH индикаторной бумагой.</li></ol>',
    '<ol><li>Өнімнің шамамен <b>0,1 г</b> мөлшерін 1–2 мл 10 % NaOH-та ерітіңіз.</li><li>Индикатор қағазымен pH-ты бақылай отырып, қышқыл реакцияға дейін 10 % HCl тамшылатып қосыңыз.</li></ol>',
    '<ol><li>Dissolve about <b>0.1 g</b> of the product in 1–2 mL of 10 % NaOH.</li><li>Add 10 % HCl dropwise until the solution is acidic, checking the pH with indicator paper.</li></ol>'),
  need: L('Подкислите раствор до выпадения осадка', 'Тұнба түзілгенше ерітіндіні қышқылдаңыз', 'Acidify until a precipitate forms'),
  tubes: [{ id: 'p', label: L('продукт + NaOH', 'өнім + NaOH', 'product + NaOH') }],
  indicator: true,
  reagents: [
    { id: 'dis', label: L('Растворить 0,1 г в 1,5 мл NaOH', '0,1 г-ды 1,5 мл NaOH-та еріту', 'Dissolve 0.1 g in 1.5 mL of NaOH'), advance: 60, disabled: (t) => t.dis,
      apply(t, S, ctx) { t.dis = true; t.net = 4.16; t.V = 1.5; t.v = 1.5; t.C0 = (0.1 / M.NBA) * 1000; setPH(t); ctx.log(L('Продукт растворился в NaOH — прозрачный бесцветный раствор м-нитробензоата натрия', 'Өнім NaOH-та еріді — натрий м-нитробензоатының мөлдір түссіз ерітіндісі', 'The product dissolved in NaOH — a clear colourless solution of sodium m-nitrobenzoate'), 'obs'); } },
    ...[1, 5].map((k) => ({ id: 'hcl' + k, group: L('Хлороводородная кислота 10 %', 'Хлорсутек қышқылы 10 %', 'Hydrochloric acid 10 %'), label: L(`HCl: +${k} кап.`, `HCl: +${k} тамшы`, `HCl: +${k} ${k > 1 ? 'drops' : 'drop'}`), advance: 10 * k,
      apply(t, S, ctx) {
        if (!t.dis) { ctx.feedback(L('Сначала растворите продукт в щёлочи.', 'Алдымен өнімді сілтіде ерітіңіз.', 'Dissolve the product in alkali first.'), 'warn'); return; }
        t.net -= 0.1436 * k; t.V += 0.05 * k; t.v = t.V; t.drops = (t.drops || 0) + k; setPH(t);
      } })),
  ],
  done: (tubes) => { const t = tubes.p; return t.dis && t.pH < 3 && t.pptRaw > 0.3 * t.C0; },
  observe: {
    question: L('Что происходит при подкислении раствора соли до кислой реакции?', 'Тұз ерітіндісін қышқыл реакцияға дейін қышқылдағанда не болады?', 'What happens when the salt solution is acidified?'),
    options: [
      { id: 'ppt', label: L('Выпадает белый осадок свободной м-нитробензойной кислоты', 'Бос м-нитробензой қышқылының ақ тұнбасы түзіледі', 'A white precipitate of free m-nitrobenzoic acid forms'), log: (S, tubes) => L(`При подкислении до pH ≈ ${Math.round(tubes.p.pH)} выпал белый осадок свободной м-нитробензойной кислоты`, `pH ≈ ${Math.round(tubes.p.pH)} дейін қышқылдағанда бос м-нитробензой қышқылының ақ тұнбасы түзілді`, `On acidifying to pH ≈ ${Math.round(tubes.p.pH)} a white precipitate of free m-nitrobenzoic acid formed`) },
      { id: 'gas', label: L('Выделяется бурый газ', 'Қоңыр газ бөлінеді', 'A brown gas is given off') },
      { id: 'clear', label: L('Раствор остаётся прозрачным', 'Ерітінді мөлдір күйінде қалады', 'The solution stays clear') },
      { id: 'yellow', label: L('Раствор желтеет, осадка нет', 'Ерітінді сарғаяды, тұнба жоқ', 'The solution turns yellow, no precipitate') },
    ],
    correct: () => 'ppt',
    why: () => L('Сильная кислота HCl вытесняет слабую карбоновую кислоту из её соли; свободная кислота плохо растворима в воде.', 'Күшті HCl қышқылы әлсіз карбон қышқылын оның тұзынан ығыстырады; бос қышқыл суда нашар ериді.', 'The strong acid HCl displaces the weak carboxylic acid from its salt; the free acid is poorly soluble in water.'),
  },
  onDone(S) { S.e2.b = true; },
};

const t3 = {
  type: 'test', id: 'fecl3',
  title: L('Реакция с хлоридом железа(III)', 'Темір(III) хлоридімен реакция', 'Reaction with iron(III) chloride'),
  instr: L('<ol><li>Растворите немного кислоты в нескольких каплях NaOH.</li><li>Осторожно нейтрализуйте HCl до <b>нейтральной реакции</b> — проверьте индикаторной бумагой: избыток кислоты или щёлочи мешает пробе.</li><li>Прибавьте 2–3 капли 3 % FeCl₃.</li></ol><p class="note">Для точной нейтрализации удобна разбавленная (1 %) HCl; перетитровали — верните каплей NaOH.</p>',
    '<ol><li>Аздаған қышқылды бірнеше тамшы NaOH-та ерітіңіз.</li><li>HCl-мен абайлап <b>бейтарап реакцияға</b> дейін бейтараптаңыз — индикатор қағазымен тексеріңіз: қышқыл немесе сілті артық болса, сынамаға кедергі келтіреді.</li><li>2–3 тамшы 3 % FeCl₃ қосыңыз.</li></ol><p class="note">Дәл бейтараптау үшін сұйылтылған (1 %) HCl ыңғайлы; асып кетсеңіз — бір тамшы NaOH-пен қайтарыңыз.</p>',
    '<ol><li>Dissolve a little of the acid in a few drops of NaOH.</li><li>Carefully neutralise with HCl to a <b>neutral reaction</b> — check with indicator paper: excess acid or alkali spoils the test.</li><li>Add 2–3 drops of 3 % FeCl₃.</li></ol><p class="note">Dilute (1 %) HCl is handy for fine neutralisation; if you overshoot, bring it back with a drop of NaOH.</p>'),
  need: L('Получите осадок основной соли железа(III)', 'Темір(III) негіздік тұзының тұнбасын алыңыз', 'Obtain the basic iron(III) salt precipitate'),
  tubes: [{ id: 'p', label: L('соль + FeCl₃', 'тұз + FeCl₃', 'salt + FeCl₃') }],
  indicator: true, reset: true,
  reagents: [
    { id: 'dis', label: L('Кристаллы + 4 капли NaOH 10 %', 'Кристалдар + 4 тамшы NaOH 10 %', 'Crystals + 4 drops of 10 % NaOH'), advance: 30, disabled: (t) => t.dis,
      apply(t, S, ctx) { t.dis = true; t.net = 0.555; t.V = 0.25; t.v = 0.45; t.C0 = (0.03 / M.NBA) * 1000; setPH(t); ctx.log(L('Несколько кристаллов продукта растворены в 4 каплях 10 % NaOH', 'Өнімнің бірнеше кристалы 4 тамшы 10 % NaOH-та ерітілді', 'A few crystals of the product dissolved in 4 drops of 10 % NaOH')); } },
    ...[['h10', L('HCl 10 %: +1 кап.', 'HCl 10 %: +1 тамшы', 'HCl 10 %: +1 drop'), -0.1436], ['h1', L('HCl 1 %: +1 кап.', 'HCl 1 %: +1 тамшы', 'HCl 1 %: +1 drop'), -0.0144], ['oh', L('NaOH 10 %: +1 кап.', 'NaOH 10 %: +1 тамшы', 'NaOH 10 %: +1 drop'), 0.139]].map(([id, label, dn]) => ({
      id, label, group: L('Нейтрализация', 'Бейтараптау', 'Neutralisation'), advance: 10, disabled: (t) => t.used,
      apply(t, S, ctx) { if (!t.dis) { ctx.feedback(L('Сначала растворите кислоту в щёлочи.', 'Алдымен қышқылды сілтіде ерітіңіз.', 'Dissolve the acid in alkali first.'), 'warn'); return; } t.net += dn; t.V += 0.05; t.v = t.V + 0.2; t.checked = false; setPH(t); },
    })),
    { id: 'fe', label: L('Прибавить 3 капли FeCl₃', '3 тамшы FeCl₃ қосу', 'Add 3 drops of FeCl₃'), group: L('Проба', 'Сынама', 'Test'), advance: 30, disabled: (t) => t.used || !t.dis,
      apply(t, S, ctx) {
        if (!t.checked) ctx.remark({ key: 'fe_nocheck', severity: 'minor', text: L('FeCl₃ прибавлен без проверки среды индикаторной бумагой', 'FeCl₃ ортаны индикатор қағазымен тексермей қосылды', 'FeCl₃ added without checking the medium with indicator paper') });
        t.used = true; t.V += 0.15; t.v += 0.15;
        const p = t.pH, pr = Math.round(p);
        if (p > 9) {
          t.ppt = 1; t.pptColor = '#8a3b12'; t.color = 'rgba(160,80,30,.35)';
          ctx.remark({ key: 'fe_alk', severity: 'minor', text: L('проба с FeCl₃ в щелочной среде — выпал Fe(OH)₃', 'FeCl₃ сынамасы сілтілі ортада — Fe(OH)₃ тұнбаға түсті', 'FeCl₃ test done in alkaline medium — Fe(OH)₃ precipitated') });
          ctx.log(L(`Бурый осадок гидроксида железа(III): в растворе избыток щёлочи (pH перед пробой ≈ ${pr})`, `Темір(III) гидроксидінің қоңыр тұнбасы: ерітіндіде сілті артық (сынама алдындағы pH ≈ ${pr})`, `Brown precipitate of iron(III) hydroxide: the solution contains excess alkali (pH before the test ≈ ${pr})`), 'obs');
          ctx.feedback(L('Бурый осадок Fe(OH)₃ — среда щелочная. Вылейте содержимое и повторите пробу.', 'Fe(OH)₃ қоңыр тұнбасы — орта сілтілі. Ішіндегіні төгіп, сынаманы қайталаңыз.', 'Brown Fe(OH)₃ — the medium is alkaline. Empty the tube and repeat the test.'), 'bad');
        } else if (p < 4) {
          t.ppt = 0.35; t.pptColor = 'var(--solid)'; t.color = 'rgba(230,190,60,.5)';
          ctx.remark({ key: 'fe_acid', severity: 'minor', text: L('проба с FeCl₃ в кислой среде', 'FeCl₃ сынамасы қышқыл ортада', 'FeCl₃ test done in acidic medium') });
          ctx.log(L(`Осадка основной соли нет: раствор жёлтый от FeCl₃, белая муть свободной кислоты — среда слишком кислая (pH ≈ ${pr})`, `Негіздік тұз тұнбасы жоқ: ерітінді FeCl₃-тен сары, бос қышқылдың ақ лайы — орта тым қышқыл (pH ≈ ${pr})`, `No basic salt: the solution is yellow from FeCl₃ with a white haze of free acid — the medium is too acidic (pH ≈ ${pr})`), 'obs');
          ctx.feedback(L('Осадка основной соли нет — среда кислая. Вылейте содержимое и повторите пробу.', 'Негіздік тұз тұнбасы жоқ — орта қышқыл. Ішіндегіні төгіп, сынаманы қайталаңыз.', 'No basic salt — the medium is acidic. Empty the tube and repeat the test.'), 'bad');
        } else {
          t.ppt = 1; t.pptColor = '#d9a27f'; t.color = 'rgba(225,180,140,.35)'; t.good = true; t.pHgood = pr;
          ctx.feedback(null);
        }
      } },
  ],
  done: (tubes) => !!tubes.p.good,
  observe: {
    question: L('Какой осадок образовался?', 'Қандай тұнба түзілді?', 'What precipitate has formed?'),
    options: [
      { id: 'buff', label: L('Бледно-коричневый (телесного цвета) осадок основной соли железа(III)', 'Темір(III) негіздік тұзының ақшыл қоңыр (тән түсті) тұнбасы', 'A pale brown (buff) precipitate of the basic iron(III) salt'), log: (S, tubes) => L(`Бледно-коричневый (телесного цвета) осадок основной соли железа(III) м-нитробензойной кислоты (pH перед пробой ≈ ${tubes.p.pHgood})`, `м-Нитробензой қышқылының темір(III) негіздік тұзының ақшыл қоңыр (тән түсті) тұнбасы (сынама алдындағы pH ≈ ${tubes.p.pHgood})`, `Pale brown (buff) precipitate of the basic iron(III) salt of m-nitrobenzoic acid (pH before the test ≈ ${tubes.p.pHgood})`) },
      { id: 'violet', label: L('Фиолетовое окрашивание раствора', 'Ерітіндінің күлгін түске боялуы', 'A violet colour in solution') },
      { id: 'rust', label: L('Ржаво-бурый осадок Fe(OH)₃', 'Fe(OH)₃ тот-қоңыр тұнбасы', 'A rust-brown precipitate of Fe(OH)₃') },
      { id: 'white', label: L('Белый осадок', 'Ақ тұнба', 'A white precipitate') },
    ],
    correct: () => 'buff',
    why: () => L('Ароматические карбоксилат-анионы в нейтральной среде дают окрашенную основную соль железа(III); фиолетовое окрашивание характерно для фенолов.', 'Ароматты карбоксилат-аниондар бейтарап ортада темір(III)-тің боялған негіздік тұзын түзеді; күлгін түс фенолдарға тән.', 'Aromatic carboxylate anions give a coloured basic iron(III) salt in neutral solution; a violet colour is typical of phenols.'),
  },
  onDone(S) { S.e2.c = true; },
};

export default {
  id: '2',
  title: L('Кислотные свойства продукта', 'Өнімнің қышқылдық қасиеттері', 'Acidic properties of the product'),
  principle: L('Карбоксильная группа достаточно кислая, чтобы разлагать гидрокарбонат (выделение CO₂) и образовывать растворимые соли; свободная кислота вытесняется более сильной кислотой. Ароматические карбоксилат-анионы в нейтральной среде дают окрашенную основную соль железа(III).',
    'Карбоксил тобы гидрокарбонатты ыдыратуға (CO₂ бөлінуі) және еритін тұздар түзуге жеткілікті қышқыл; бос қышқылды күштірек қышқыл ығыстырады. Ароматты карбоксилат-аниондар бейтарап ортада темір(III)-тің боялған негіздік тұзын береді.',
    'The carboxyl group is acidic enough to decompose hydrogen carbonate (release of CO₂) and to form water-soluble salts; the free acid is regenerated by a stronger acid. Aromatic carboxylate anions form a coloured basic iron(III) salt in neutral solution.'),
  equation: [L('м-O₂N–C₆H₄–COOH + NaHCO₃ → м-O₂N–C₆H₄–COONa + CO₂↑ + H₂O', 'м-O₂N–C₆H₄–COOH + NaHCO₃ → м-O₂N–C₆H₄–COONa + CO₂↑ + H₂O', 'm-O₂N–C₆H₄–COOH + NaHCO₃ → m-O₂N–C₆H₄–COONa + CO₂↑ + H₂O'), L('м-O₂N–C₆H₄–COOH + NaOH → м-O₂N–C₆H₄–COONa + H₂O', 'м-O₂N–C₆H₄–COOH + NaOH → м-O₂N–C₆H₄–COONa + H₂O', 'm-O₂N–C₆H₄–COOH + NaOH → m-O₂N–C₆H₄–COONa + H₂O'), L('м-O₂N–C₆H₄–COONa + HCl → м-O₂N–C₆H₄–COOH↓ + NaCl', 'м-O₂N–C₆H₄–COONa + HCl → м-O₂N–C₆H₄–COOH↓ + NaCl', 'm-O₂N–C₆H₄–COONa + HCl → m-O₂N–C₆H₄–COOH↓ + NaCl')],
  initialState: () => ({ e2: { a: false, b: false, c: false } }),
  checkpoints: [0],
  steps: [t1, t2, t3],
  results: (S) => ({ ...S.e2 }),
  summary: (r) => [
    { label: 'NaHCO₃', value: r.a ? L('CO₂ ↑', 'CO₂ ↑', 'CO₂ ↑') : '—', st: r.a ? 'ok' : '' },
    { label: 'NaOH / HCl', value: r.b ? L('осадок', 'тұнба', 'precipitate') : '—', st: r.b ? 'ok' : '' },
    { label: 'FeCl₃', value: r.c ? L('бледно-коричневый', 'ақшыл қоңыр', 'buff') : '—', st: r.c ? 'ok' : '' },
  ],
};
