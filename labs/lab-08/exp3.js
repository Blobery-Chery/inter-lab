/** Опыт 3. Гидроксамовая проба на сложноэфирную группу. Методичка, раздел 6, опыт 3. */
import { L } from '../../app/i18n.js';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const KA_NH3OH = 5.95; // pKa NH₃OH⁺ (допущение, справочное значение)

/** pH пробирки: NH₂OH·HCl 1 ммоль, NaOH (ммоль), HCl (ммоль), объём (мл). */
export function tubePH(t) {
  const V = Math.max(0.1, t.v || 0.1);
  const nh = t.nh ? 1 : 0, oh = t.oh ? 1.39 : 0, h = (t.hcl || 0) * 0.05;
  if (!nh && !oh) return t.s ? 7 : null;
  const E = oh - nh - h;                  // избыток сильного основания, ммоль
  if (E > 1e-3) return clamp(14 + Math.log10(E / V), 7, 13.8);
  if (nh && E > -nh) { const b = nh + E, a = -E; return clamp(KA_NH3OH + Math.log10(Math.max(1e-3, b) / Math.max(1e-3, a)), 3.2, 9); }
  const ex = -E - nh;
  return ex < 0.01 ? 3.2 : clamp(-Math.log10(ex / V), 0.2, 3.2);
}

const VIOLET = 'rgba(128,20,70,.78)', YELLOW = 'rgba(232,192,70,.5)', BROWN = '#8a3b12';

const t1 = {
  type: 'test', id: 'hydroxamic',
  title: L('Гидроксамовая проба', 'Гидроксам сынамасы', 'Hydroxamic acid test'),
  instr: L('<ol><li>В пробирку 1 внесите 2–3 капли полученного эфира, в пробирку 2 — 2–3 капли н-бутанола (контрольный опыт).</li><li>В обе прибавьте <b>1 мл</b> раствора NH₂OH·HCl (1 М) и <b>0,5 мл</b> 10 % NaOH.</li><li>Нагрейте до кипения 1–2 минуты и охладите.</li><li>Подкислите 1 М HCl — проверьте <b>индикаторной бумагой</b> — и прибавьте 1–3 капли FeCl₃.</li></ol><p class="note">Нагревайте в кипящей водяной бане, отверстием пробирки от себя и соседей. Гидроксиламин вреден и вызывает аллергию — избегайте контакта.</p>',
    '<ol><li>1-пробиркаға алынған эфирден 2–3 тамшы, 2-пробиркаға — 2–3 тамшы н-бутанол салыңыз (бақылау тәжірибесі).</li><li>Екеуіне де <b>1 мл</b> NH₂OH·HCl ерітіндісін (1 М) және <b>0,5 мл</b> 10 % NaOH қосыңыз.</li><li>Қайнағанға дейін қыздырып, 1–2 минут қайнатыңыз да, суытыңыз.</li><li>1 М HCl-мен қышқылдаңыз — <b>индикатор қағазымен</b> тексеріңіз — және 1–3 тамшы FeCl₃ қосыңыз.</li></ol><p class="note">Қайнаған су моншасында, пробирка аузын өзіңізден және көршілерден алыс бағыттап қыздырыңыз. Гидроксиламин зиянды және аллергия тудырады — жанасудан аулақ болыңыз.</p>',
    '<ol><li>Put 2–3 drops of your ester into tube 1 and 2–3 drops of n-butanol into tube 2 (blank test).</li><li>To both add <b>1 mL</b> of NH₂OH·HCl solution (1 M) and <b>0.5 mL</b> of 10 % NaOH.</li><li>Heat to boiling for 1–2 minutes and cool.</li><li>Acidify with 1 M HCl — check with <b>indicator paper</b> — and add 1–3 drops of FeCl₃.</li></ol><p class="note">Heat in a boiling water bath with the mouth of the tube away from people. Hydroxylamine is harmful and a skin sensitiser — avoid contact.</p>'),
  need: L('Проведите пробу и контрольный опыт', 'Сынама мен бақылау тәжірибесін жүргізіңіз', 'Do the test and the blank'),
  tubes: [{ id: 'e', label: L('1 · эфир', '1 · эфир', '1 · ester') }, { id: 'b', label: L('2 · н-бутанол', '2 · н-бутанол', '2 · n-butanol') }],
  indicator: true, reset: true,
  reagents: [
    { id: 'smp', group: L('Образец', 'Үлгі', 'Sample'), label: L('2–3 капли образца в выбранную пробирку', 'Таңдалған пробиркаға 2–3 тамшы үлгі', '2–3 drops of the sample into the selected tube'), advance: 20,
      apply(t, S, ctx, id) { if (t.s) { ctx.feedback(L('Образец в эту пробирку уже внесён.', 'Бұл пробиркаға үлгі салынған.', 'The sample is already in this tube.'), 'info'); return; } t.s = id === 'e' ? 'ester' : 'alc'; t.v += 0.12; t.pH = 7; ctx.log(id === 'e' ? L('В пробирку 1 внесено 2–3 капли полученного эфира', '1-пробиркаға алынған эфирден 2–3 тамшы салынды', '2–3 drops of the ester put into tube 1') : L('В пробирку 2 внесено 2–3 капли н-бутанола (контроль)', '2-пробиркаға 2–3 тамшы н-бутанол салынды (бақылау)', '2–3 drops of n-butanol put into tube 2 (blank)')); } },
    { id: 'nh', target: 'all', group: L('Реактивы (в обе пробирки)', 'Реактивтер (екі пробиркаға)', 'Reagents (both tubes)'), label: L('1 мл NH₂OH·HCl (1 М)', '1 мл NH₂OH·HCl (1 М)', '1 mL NH₂OH·HCl (1 M)'), advance: 40, disabled: (t, S, lc) => Object.values(lc.tubes).every((x) => x.nh),
      apply(t, S, ctx, id) { if (t.nh) return; t.nh = true; t.v += 1; t.pH = tubePH(t); if (id === 'e') ctx.log(L('В обе пробирки прилито по 1 мл раствора гидроксиламина гидрохлорида', 'Екі пробиркаға да 1 мл гидроксиламин гидрохлориді ерітіндісі құйылды', '1 mL of hydroxylamine hydrochloride solution added to both tubes')); } },
    { id: 'oh', target: 'all', group: L('Реактивы (в обе пробирки)', 'Реактивтер (екі пробиркаға)', 'Reagents (both tubes)'), label: L('0,5 мл 10 % NaOH', '0,5 мл 10 % NaOH', '0.5 mL 10 % NaOH'), advance: 30, disabled: (t, S, lc) => Object.values(lc.tubes).every((x) => x.oh),
      apply(t, S, ctx, id) { if (t.oh) return; t.oh = true; t.v += 0.5; t.pH = tubePH(t); if (id === 'e') ctx.log(L('В обе пробирки прилито по 0,5 мл 10 % NaOH — среда щелочная, выделяется свободный гидроксиламин', 'Екі пробиркаға да 0,5 мл 10 % NaOH құйылды — орта сілтілі, бос гидроксиламин бөлінеді', '0.5 mL of 10 % NaOH added to both tubes — the medium is alkaline and free hydroxylamine is released')); } },
    { id: 'heat', target: 'all', group: L('Нагрев', 'Қыздыру', 'Heating'), label: L('В кипящую водяную баню на 1–2 мин, затем охладить', 'Қайнаған су моншасына 1–2 минутқа, содан кейін суыту', 'Into the boiling water bath for 1–2 min, then cool'), advance: 60, disabled: (t, S, lc) => Object.values(lc.tubes).every((x) => x.heated),
      apply(t, S, ctx, id) {
        if (t.heated) return;
        t.heated = true;
        if (t.s === 'ester' && t.nh && t.oh) t.hx = true;
        if (id === 'e') ctx.log(L('Пробирки нагреты в кипящей водяной бане 1–2 мин (отверстием от себя) и охлаждены под краном', 'Пробиркалар қайнаған су моншасында 1–2 мин қыздырылып (аузы өзінен алыс), шүмек астында суытылды', 'The tubes were heated in a boiling water bath for 1–2 min (mouth pointed away) and cooled under the tap'));
      } },
    { id: 'flame', target: 'all', group: L('Нагрев', 'Қыздыру', 'Heating'), label: L('Быстро прогреть над пламенем спиртовки, отверстием к себе — так лучше видно', 'Спирт шамының жалынында тез қыздыру, аузын өзіне қаратып — жақсы көрінеді', 'Quickly heat over a spirit lamp, mouth towards you — easier to see'), advance: 30, disabled: (t, S, lc) => Object.values(lc.tubes).every((x) => x.heated),
      apply(t, S, ctx, id) {
        if (t.heated) return;
        t.heated = true;
        if (t.s === 'ester' && t.nh && t.oh) t.hx = true;
        if (id === 'e') ctx.remark({ key: 'e3-flame', severity: 'safety', text: L('пробирку с эфиром и щёлочью грели над открытым пламенем, направив отверстие к себе', 'эфир мен сілтісі бар пробирка ашық жалында, аузы өзіне қаратылып қыздырылды', 'a tube of ester and alkali was heated over an open flame with its mouth pointed at the student'), whatif: L('Жидкость в пробирке над пламенем перегревается и выбрасывается толчком — горячая щёлочь летит в лицо, а пары эфира могут вспыхнуть. Пробирку греют на бане, отверстием от себя и соседей.', 'Жалын үстіндегі пробиркадағы сұйық қызып кетіп, серпіліп атылады — ыстық сілті бетке ұшады, ал эфир булары тұтануы мүмкін. Пробирканы моншада, аузын өзінен және көршілерден алыс бағыттап қыздырады.', 'Liquid in a tube over a flame superheats and shoots out — hot alkali flies into your face and ester vapour can ignite. Tubes are heated in a bath with the mouth pointed away from everyone.') });
      } },
    ...[[1, 'h1'], [5, 'h5'], [10, 'h10']].map(([k, id]) => ({ id, group: L('1 М HCl (в выбранную пробирку)', '1 М HCl (таңдалған пробиркаға)', '1 M HCl (selected tube)'), label: { ru: `HCl: +${k} кап.`, kk: `HCl: +${k} тамшы`, en: `HCl: +${k} ${k > 1 ? 'drops' : 'drop'}` }, advance: 5 * k,
      apply(t, S, ctx) { if (t.fe) { ctx.feedback(L('FeCl₃ уже прибавлен — проба проведена.', 'FeCl₃ қосылған — сынама жүргізілді.', 'FeCl₃ has been added — the test is done.'), 'info'); return; } if (!t.oh) { ctx.feedback(L('Сначала проведите реакцию в щелочной среде.', 'Алдымен реакцияны сілтілі ортада жүргізіңіз.', 'Carry out the reaction in alkaline medium first.'), 'warn'); return; } t.hcl = (t.hcl || 0) + k; t.v += 0.05 * k; t.pH = tubePH(t); t.checked = false; } })),
    { id: 'fe', group: L('Проба', 'Сынама', 'Test'), label: L('FeCl₃ 5 %: 2 капли в выбранную пробирку', 'FeCl₃ 5 %: таңдалған пробиркаға 2 тамшы', '5 % FeCl₃: 2 drops into the selected tube'), advance: 20,
      apply(t, S, ctx, id) {
        if (t.fe) { ctx.feedback(L('FeCl₃ в эту пробирку уже прибавлен.', 'Бұл пробиркаға FeCl₃ қосылған.', 'FeCl₃ has already been added to this tube.'), 'info'); return; }
        if (!t.s) { ctx.feedback(L('Сначала внесите образец.', 'Алдымен үлгі салыңыз.', 'Put the sample in first.'), 'warn'); return; }
        t.fe = true; t.v += 0.1;
        const pH = tubePH(t) ?? 7;
        if (!t.checked) ctx.remark({ key: 'e3-nocheck', severity: 'minor', text: L('FeCl₃ прибавлен без проверки среды индикаторной бумагой', 'FeCl₃ ортаны индикатор қағазымен тексермей қосылды', 'FeCl₃ added without checking the medium with indicator paper') });
        if (pH >= 5) {
          t.brown = true; t.ppt = 0.9; t.pptColor = BROWN; t.color = 'rgba(150,80,35,.35)';
          ctx.remark({ key: 'e3-alk', severity: 'minor', text: L('FeCl₃ прибавлен в недостаточно кислой среде — выпал Fe(OH)₃', 'FeCl₃ жеткіліксіз қышқыл ортада қосылды — Fe(OH)₃ тұнбаға түсті', 'FeCl₃ added to a medium that was not acidic enough — Fe(OH)₃ precipitated') });
          ctx.log({ ru: `Пробирка ${id === 'e' ? 1 : 2}: бурый осадок Fe(OH)₃ (pH ≈ ${Math.round(pH)}) — окраску не видно`, kk: `${id === 'e' ? 1 : 2}-пробирка: Fe(OH)₃ қоңыр тұнбасы (pH ≈ ${Math.round(pH)}) — түс көрінбейді`, en: `Tube ${id === 'e' ? 1 : 2}: brown Fe(OH)₃ precipitate (pH ≈ ${Math.round(pH)}) — the colour cannot be seen` }, 'obs');
          ctx.feedback(L('Бурый осадок Fe(OH)₃: среда не кислая. Вылейте содержимое и повторите пробу, подкислив до pH 1–4.', 'Fe(OH)₃ қоңыр тұнбасы: орта қышқыл емес. Ішіндегіні төгіп, pH 1–4-ке дейін қышқылдап, сынаманы қайталаңыз.', 'Brown Fe(OH)₃: the medium is not acidic. Empty the tube and repeat, acidifying to pH 1–4.'), 'bad');
          return;
        }
        if (t.hx) { t.color = pH < 1 ? 'rgba(170,70,110,.4)' : VIOLET; t.violet = true; }
        else {
          t.color = YELLOW;
          if (t.s === 'ester') ctx.remark({ key: 'e3-false', severity: 'minor', text: L('ложноотрицательная проба: эфир не нагревали со щелочным раствором гидроксиламина', 'жалған теріс сынама: эфир гидроксиламиннің сілтілі ерітіндісімен қыздырылмады', 'false negative: the ester was not heated with alkaline hydroxylamine'), whatif: L('Гидроксамовая кислота образуется только из эфира и свободного гидроксиламина (щелочная среда) при нагревании. Без этого Fe³⁺ даёт лишь жёлтую окраску — эфир «не найден».', 'Гидроксам қышқылы тек эфир мен бос гидроксиламиннен (сілтілі орта) қыздырғанда түзіледі. Онсыз Fe³⁺ тек сары түс береді — эфир «табылмайды».', 'Hydroxamic acid forms only from the ester and free hydroxylamine (alkaline medium) on heating. Otherwise Fe³⁺ gives just a yellow colour and the ester is “not found”.') });
        }
        ctx.feedback(null);
      } },
  ],
  done: (tubes) => tubes.e.fe && tubes.b.fe && !tubes.e.brown && !tubes.b.brown,
  observe: {
    question: L('Что наблюдается после прибавления FeCl₃?', 'FeCl₃ қосқаннан кейін не байқалады?', 'What is observed after adding FeCl₃?'),
    options: [
      { id: 'violet', label: L('Пробирка 1 — красно-фиолетовое (бордовое) окрашивание; пробирка 2 — только жёлтая окраска FeCl₃', '1-пробирка — қызыл-күлгін (қызыл күрең) түс; 2-пробирка — FeCl₃-тің тек сары түсі', 'Tube 1 — red-violet (burgundy) colour; tube 2 — only the yellow colour of FeCl₃'),
        log: L('Пробирка 1 (эфир): интенсивное красно-фиолетовое (бордовое) окрашивание гидроксамата железа(III); пробирка 2 (н-бутанол): только жёлтая окраска FeCl₃', '1-пробирка (эфир): темір(III) гидроксаматының қанық қызыл-күлгін (қызыл күрең) түсі; 2-пробирка (н-бутанол): FeCl₃-тің тек сары түсі', 'Tube 1 (ester): intense red-violet (burgundy) colour of iron(III) hydroxamate; tube 2 (n-butanol): only the yellow colour of FeCl₃') },
      { id: 'both', label: L('В обеих пробирках красно-фиолетовое окрашивание', 'Екі пробиркада да қызыл-күлгін түс', 'A red-violet colour in both tubes') },
      { id: 'none', label: L('В обеих пробирках только жёлтая окраска FeCl₃', 'Екі пробиркада да FeCl₃-тің тек сары түсі', 'Only the yellow colour of FeCl₃ in both tubes'),
        log: L('В обеих пробирках только жёлтая окраска FeCl₃ — окрашенного гидроксамата не образовалось', 'Екі пробиркада да FeCl₃-тің тек сары түсі — боялған гидроксамат түзілмеді', 'Only the yellow colour of FeCl₃ in both tubes — no coloured hydroxamate formed') },
      { id: 'brown', label: L('Бурый осадок в обеих пробирках', 'Екі пробиркада да қоңыр тұнба', 'A brown precipitate in both tubes') },
    ],
    correct: (S, tubes) => (tubes.e.violet ? 'violet' : 'none'),
    why: (S, tubes) => (tubes.e.violet ? L('Эфир с гидроксиламином даёт гидроксамовую кислоту CH₃CO–NHOH, которая с Fe³⁺ образует красно-фиолетовый комплекс; спирт такой кислоты не даёт.', 'Эфир гидроксиламинмен CH₃CO–NHOH гидроксам қышқылын береді, ол Fe³⁺-пен қызыл-күлгін кешен түзеді; спирт мұндай қышқыл бермейді.', 'The ester gives the hydroxamic acid CH₃CO–NHOH with hydroxylamine, which forms a red-violet complex with Fe³⁺; the alcohol gives no such acid.')
      : L('В пробирке с эфиром гидроксамовая кислота не образовалась (нет нагревания в щелочной среде) — проба ложноотрицательная. Её нужно повторить.', 'Эфирі бар пробиркада гидроксам қышқылы түзілмеді (сілтілі ортада қыздыру жоқ) — сынама жалған теріс. Оны қайталау керек.', 'No hydroxamic acid formed in the ester tube (no heating in alkaline medium) — the test is a false negative and should be repeated.')),
  },
  onDone(S, tubes) { S.hx = { pos: !!tubes.e.violet, blank: !tubes.b.violet }; },
  hint1: L('Порядок: образец → NH₂OH·HCl → NaOH → нагреть → охладить → HCl до кислой реакции (бумагой!) → FeCl₃. Контроль — то же с н-бутанолом.', 'Рет: үлгі → NH₂OH·HCl → NaOH → қыздыру → суыту → қышқыл реакцияға дейін HCl (қағазбен!) → FeCl₃. Бақылау — н-бутанолмен дәл солай.', 'Order: sample → NH₂OH·HCl → NaOH → heat → cool → HCl until acidic (paper!) → FeCl₃. Blank — the same with n-butanol.'),
  hint2: L('После NaOH среда сильнощелочная: чтобы подкислить, нужно ≈ 28–30 капель 1 М HCl. FeCl₃ — только в кислой среде (pH 1–4), иначе выпадет бурый Fe(OH)₃.', 'NaOH-тан кейін орта күшті сілтілі: қышқылдау үшін ≈ 28–30 тамшы 1 М HCl керек. FeCl₃ — тек қышқыл ортада (pH 1–4), әйтпесе қоңыр Fe(OH)₃ түседі.', 'After NaOH the medium is strongly alkaline: about 28–30 drops of 1 M HCl are needed to acidify. FeCl₃ only in acidic medium (pH 1–4), otherwise brown Fe(OH)₃ precipitates.'),
  hint3: L('Каждую пробирку: 3 × «+10» капель HCl → индикаторная бумага (pH ≈ 1–2) → FeCl₃. Нагрев — в водяной бане, не над пламенем.', 'Әр пробиркаға: 3 × «+10» тамшы HCl → индикатор қағазы (pH ≈ 1–2) → FeCl₃. Қыздыру — су моншасында, жалын үстінде емес.', 'For each tube: 3 × “+10” drops of HCl → indicator paper (pH ≈ 1–2) → FeCl₃. Heat in the water bath, not over a flame.'),
};

const q1 = {
  type: 'quiz', id: 'q-hx',
  title: L('Химизм пробы', 'Сынаманың химизмі', 'Chemistry of the test'),
  instr: L('<p>Ответьте на вопросы о химизме гидроксамовой пробы.</p>', '<p>Гидроксам сынамасының химизмі туралы сұрақтарға жауап беріңіз.</p>', '<p>Answer the questions on the chemistry of the hydroxamic acid test.</p>'),
  need: L('Ответьте на вопросы', 'Сұрақтарға жауап беріңіз', 'Answer the questions'),
  questions: [
    { q: L('К какому типу относится реакция эфира с гидроксиламином?', 'Эфирдің гидроксиламинмен реакциясы қай түрге жатады?', 'What type of reaction is that of the ester with hydroxylamine?'),
      options: [L('Нуклеофильное замещение у ацильного атома углерода', 'Ацил көміртек атомындағы нуклеофилдік орынбасу', 'Nucleophilic substitution at the acyl carbon'), L('Электрофильное присоединение по C=O', 'C=O бойынша электрофильдік қосылу', 'Electrophilic addition to C=O'), L('Окисление эфира', 'Эфирдің тотығуы', 'Oxidation of the ester'), L('Радикальное замещение', 'Радикалдық орынбасу', 'Radical substitution')],
      correct: 0, why: L('NH₂OH атакует карбонильный углерод, через тетраэдрический интермедиат уходит C₄H₉O⁻: CH₃COOC₄H₉ + NH₂OH → CH₃CO–NHOH + C₄H₉OH.', 'NH₂OH карбонил көміртегіне шабуыл жасайды, тетраэдрлік аралық өнім арқылы C₄H₉O⁻ кетеді: CH₃COOC₄H₉ + NH₂OH → CH₃CO–NHOH + C₄H₉OH.', 'NH₂OH attacks the carbonyl carbon and C₄H₉O⁻ leaves via a tetrahedral intermediate: CH₃COOC₄H₉ + NH₂OH → CH₃CO–NHOH + C₄H₉OH.') },
    { q: L('Зачем перед FeCl₃ раствор подкисляют?', 'FeCl₃ алдында ерітіндіні не үшін қышқылдайды?', 'Why is the solution acidified before FeCl₃ is added?'),
      options: [L('В щелочной среде Fe³⁺ выпадает в виде бурого Fe(OH)₃ и окраски комплекса не видно', 'Сілтілі ортада Fe³⁺ қоңыр Fe(OH)₃ түрінде тұнбаға түсіп, кешен түсі көрінбейді', 'In alkaline medium Fe³⁺ precipitates as brown Fe(OH)₃ and the complex colour cannot be seen'), L('Чтобы гидролизовать эфир', 'Эфирді гидролиздеу үшін', 'To hydrolyse the ester'), L('Чтобы выделился гидроксиламин', 'Гидроксиламин бөлінуі үшін', 'To release hydroxylamine'), L('Кислота окрашивает раствор в фиолетовый цвет', 'Қышқыл ерітіндіні күлгін түске бояйды', 'The acid colours the solution violet')],
      correct: 0, why: L('Гидроксамат железа(III) Fe(CH₃CO–NHO)₃ устойчив в слабокислой среде; в щелочной Fe³⁺ связывается в Fe(OH)₃.', 'Темір(III) гидроксаматы Fe(CH₃CO–NHO)₃ әлсіз қышқыл ортада тұрақты; сілтілі ортада Fe³⁺ Fe(OH)₃-ке байланады.', 'Iron(III) hydroxamate Fe(CH₃CO–NHO)₃ is stable in weakly acidic medium; in alkaline medium Fe³⁺ is bound as Fe(OH)₃.') },
  ],
};

export default {
  id: '3',
  title: L('Гидроксамовая проба на сложноэфирную группу', 'Күрделі эфир тобына гидроксам сынамасы', 'Hydroxamic acid test for the ester group'),
  principle: L('Эфиры реагируют с гидроксиламином в щелочной среде (нуклеофильное ацильное замещение) с образованием гидроксамовых кислот, которые с ионами Fe³⁺ дают интенсивно окрашенные красно-фиолетовые комплексы.', 'Эфирлер сілтілі ортада гидроксиламинмен әрекеттесіп (нуклеофилдік ацилдік орынбасу) гидроксам қышқылдарын түзеді, олар Fe³⁺ иондарымен қанық қызыл-күлгін кешендер береді.', 'Esters react with hydroxylamine in alkaline medium (nucleophilic acyl substitution) to form hydroxamic acids, which give intensely coloured red-violet complexes with Fe³⁺ ions.'),
  equation: ['CH₃COOC₄H₉ + NH₂OH → CH₃CO–NHOH + C₄H₉OH', '3 CH₃CO–NHOH + Fe³⁺ → Fe(CH₃CO–NHO)₃ + 3H⁺'],
  initialState: () => ({ hx: null }),
  checkpoints: [0],
  steps: [t1, q1],
  results: (S) => ({ pos: !!(S.hx && S.hx.pos), blank: !!(S.hx && S.hx.blank) }),
  summary: (r) => [
    { label: L('Эфир', 'Эфир', 'Ester'), value: r.pos ? L('красно-фиолетовый', 'қызыл-күлгін', 'red-violet') : L('нет окраски', 'түс жоқ', 'no colour'), st: r.pos ? 'ok' : 'warn' },
    { label: L('Контроль', 'Бақылау', 'Blank'), value: L('жёлтый (FeCl₃)', 'сары (FeCl₃)', 'yellow (FeCl₃)'), st: 'ok' },
  ],
};

