/** Опыт 8. Кислотные свойства фенола в сравнении с карбоновой кислотой. Методичка, раздел 6, опыт 8. Уборка. */
import { L } from '../../app/i18n.js';
import { emulsion, DROP } from './model.js';
import { perTube } from './util.js';
import { tubesScene, bottlesScene } from './scene.js';

const EMUL = 'rgba(235,235,225,.85)';
const aTubes = [
  { id: '1', label: L('1 · эмульсия + NaOH, HCl', '1 · эмульсия + NaOH, HCl', '1 · emulsion + NaOH, HCl'), short: '1' },
  { id: '2', label: L('2 · эмульсия + NaHCO₃', '2 · эмульсия + NaHCO₃', '2 · emulsion + NaHCO₃'), short: '2' },
  { id: '3', label: L('3 · винная к-та + NaHCO₃', '3 · шарап қ-лы + NaHCO₃', '3 · tartaric acid + NaHCO₃'), short: '3' },
];
function paint(t) {
  if (t.crys) { t.solid = t.bic ? 0 : 0.5; t.pH = t.bic ? 7.5 : 2; t.gas = !!t.bic && !t.gasDone; return; }
  const r = emulsion({ em: !!t.em, oh: t.oh || 0, h: t.h || 0, v: t.v || 1 });
  t.turb = r.turb; t.pH = r.pH;
  t.color = t.em && r.turb > 0.05 ? `rgba(235,235,225,${(0.3 + 0.55 * r.turb).toFixed(2)})` : null;
  t.layer = 0;
}
const s0 = {
  type: 'test', id: 'acid',
  title: L('NaOH, HCl и NaHCO₃', 'NaOH, HCl және NaHCO₃', 'NaOH, HCl and NaHCO₃'),
  instr: L('<ol><li>В пробирку 1 поместите <b>1 мл</b> фенольной эмульсии и по каплям прибавляйте 10 % NaOH до просветления.</li><li>К прозрачному раствору прибавляйте разбавленную HCl до кислой реакции и наблюдайте.</li><li>К <b>1 мл</b> фенольной эмульсии (пробирка 2) и к нескольким кристаллам винной кислоты (пробирка 3) прилейте по <b>1 мл</b> 5 % NaHCO₃. Сравните.</li></ol><p class="note">Фенол вызывает тяжёлые ожоги и быстро всасывается через кожу — перчатки обязательны.</p>',
    '<ol><li>1-пробиркаға фенол эмульсиясының <b>1 мл</b> мөлшерін салып, мөлдір болғанша 10 % NaOH-ты тамшылатып қосыңыз.</li><li>Мөлдір ерітіндіге қышқыл реакцияға дейін сұйылтылған HCl қосып, бақылаңыз.</li><li>Фенол эмульсиясының <b>1 мл</b> мөлшеріне (2-пробирка) және шарап қышқылының бірнеше кристалына (3-пробирка) 5 % NaHCO₃-тың <b>1 мл</b>-ін құйыңыз. Салыстырыңыз.</li></ol><p class="note">Фенол ауыр күйік шалдырады және тері арқылы тез сіңеді — қолғап міндетті.</p>',
    '<ol><li>Put <b>1 mL</b> of phenol emulsion into tube 1 and add 10 % NaOH dropwise until the solution becomes clear.</li><li>Add dilute HCl to the clear solution until it is acidic and observe.</li><li>Add <b>1 mL</b> of 5 % NaHCO₃ to 1 mL of phenol emulsion (tube 2) and to a few crystals of tartaric acid (tube 3). Compare.</li></ol><p class="note">Phenol causes severe burns and is rapidly absorbed through the skin — gloves are compulsory.</p>'),
  need: L('Сравните фенол и карбоновую кислоту', 'Фенол мен карбон қышқылын салыстырыңыз', 'Compare the phenol with the carboxylic acid'),
  tubes: aTubes, reset: true, indicator: true, capacity: 4,
  reagents: perTube([
    { id: 'em', group: L('Вещества', 'Заттар', 'Substances'), label: L('Фенольная эмульсия: 1 мл', 'Фенол эмульсиясы: 1 мл', 'Phenol emulsion: 1 mL'), advance: 20, disabled: (t, S, local) => t.em || t.crys || local.sel === '3',
      apply(t, S, ctx, id) { t.em = 1; t.v = (t.v || 0) + 1; paint(t); ctx.log(L(`В пробирку ${id} — 1 мл фенольной эмульсии (мутная смесь фенола с водой)`, `${id}-пробиркаға — 1 мл фенол эмульсиясы (фенол мен судың лайлы қоспасы)`, `Tube ${id}: 1 mL of phenol emulsion (a turbid mixture of phenol and water)`)); } },
    { id: 'crys', group: L('Вещества', 'Заттар', 'Substances'), label: L('Кристаллы винной кислоты', 'Шарап қышқылының кристалдары', 'Crystals of tartaric acid'), advance: 20, disabled: (t, S, local) => t.em || t.crys || local.sel !== '3',
      apply(t, S, ctx) { t.crys = 1; paint(t); ctx.log(L('В пробирку 3 — несколько кристаллов винной кислоты', '3-пробиркаға — шарап қышқылының бірнеше кристалы', 'Tube 3: a few crystals of tartaric acid')); } },
    ...[1, 5].map((k) => ({ id: 'oh' + k, group: L('NaOH 10 %', 'NaOH 10 %', 'NaOH 10 %'), label: L(`+${k} кап.`, `+${k} тамшы`, `+${k} ${k > 1 ? 'drops' : 'drop'}`), advance: 5 * k, disabled: (t, S, local) => !t.em || local.sel !== '1',
      apply(t, S, ctx) { const was = t.turb; t.oh = (t.oh || 0) + k; t.v += DROP * k; paint(t); if (was > 0.05 && t.turb <= 0.05 && !t.clear) { t.clear = true; ctx.log(L(`После ${t.oh} кап. NaOH эмульсия просветлела — прозрачный раствор фенолята натрия`, `NaOH-тың ${t.oh} тамшысынан кейін эмульсия мөлдірленді — натрий фенолятының мөлдір ерітіндісі`, `After ${t.oh} drops of NaOH the emulsion cleared — a clear solution of sodium phenoxide`), 'obs'); } } })),
    ...[1, 5].map((k) => ({ id: 'h' + k, group: L('HCl разб.', 'Сұйылт. HCl', 'Dilute HCl'), label: L(`+${k} кап.`, `+${k} тамшы`, `+${k} ${k > 1 ? 'drops' : 'drop'}`), advance: 5 * k, disabled: (t, S, local) => !t.em || local.sel !== '1',
      apply(t, S, ctx) {
        const was = t.turb; t.h = (t.h || 0) + k; t.v += DROP * k; paint(t);
        if (!t.clear) ctx.feedback(L('Сначала растворите фенол в щёлочи до просветления.', 'Алдымен фенолды мөлдір болғанша сілтіде ерітіңіз.', 'First dissolve the phenol in alkali until the solution clears.'), 'warn');
        if (t.clear && was <= 0.05 && t.turb > 0.05 && !t.back) { t.back = true; ctx.log(L(`При подкислении HCl (${t.h} кап.) снова выделилась мутная эмульсия фенола`, `HCl-мен қышқылдағанда (${t.h} тамшы) фенолдың лайлы эмульсиясы қайта бөлінді`, `On acidifying with HCl (${t.h} drops) the turbid phenol emulsion separated again`), 'obs'); }
      } })),
    { id: 'bic', group: L('NaHCO₃ 5 %', 'NaHCO₃ 5 %', 'NaHCO₃ 5 %'), label: L('Прилить 1 мл NaHCO₃', '1 мл NaHCO₃ құю', 'Add 1 mL of NaHCO₃'), advance: 60, disabled: (t) => t.bic || !(t.em || t.crys),
      apply(t, S, ctx, id) {
        t.bic = 1; t.v = (t.v || 0) + 1;
        if (t.crys) { paint(t); ctx.log(L('Пробирка 3 (винная кислота): бурное выделение пузырьков газа (CO₂), кристаллы растворяются', '3-пробирка (шарап қышқылы): газ көпіршіктерінің (CO₂) қарқынды бөлінуі, кристалдар ериді', 'Tube 3 (tartaric acid): brisk evolution of gas bubbles (CO₂); the crystals dissolve'), 'obs'); return; }
        const excessHCl = (t.h || 0) * 0.144 > (t.oh || 0) * 0.1375 + 0.01;
        if (excessHCl) {
          t.gas = true;
          ctx.remark({ key: 'bic_dirty', severity: 'major', text: L('NaHCO₃ прилит в пробирку с избытком HCl: газ выделяет соляная кислота, а не фенол — ложный результат', 'NaHCO₃ артық HCl бар пробиркаға құйылды: газды фенол емес, тұз қышқылы бөледі — жалған нәтиже', 'NaHCO₃ was added to a tube containing excess HCl: the gas comes from the hydrochloric acid, not the phenol — a false result') });
          ctx.log(L(`Пробирка ${id}: пузырьки газа — CO₂ из избытка HCl (проба недостоверна)`, `${id}-пробирка: газ көпіршіктері — артық HCl-дан CO₂ (сынама сенімсіз)`, `Tube ${id}: gas bubbles — CO₂ from the excess HCl (the test is invalid)`), 'warn');
          ctx.feedback(L('Газ дал избыток HCl, а не фенол. Возьмите свежую порцию эмульсии в пробирку 2.', 'Газды фенол емес, артық HCl берді. 2-пробиркаға эмульсияның жаңа үлесін алыңыз.', 'The gas came from the excess HCl, not from the phenol. Take a fresh portion of emulsion in tube 2.'), 'bad');
        } else { paint(t); ctx.log(L(`Пробирка ${id} (фенол): газ не выделяется, эмульсия остаётся мутной`, `${id}-пробирка (фенол): газ бөлінбейді, эмульсия лайлы күйінде қалады`, `Tube ${id} (phenol): no gas is given off; the emulsion stays turbid`), 'obs'); }
      } },
  ]),
  done: (tb) => !!(tb['1'].clear && tb['1'].back && tb['2'].em && tb['2'].bic && tb['3'].crys && tb['3'].bic),
  observe: {
    question: L('Сравните поведение фенола и винной кислоты.', 'Фенол мен шарап қышқылының әрекетін салыстырыңыз.', 'Compare the behaviour of phenol and tartaric acid.'),
    options: [
      { id: 'ok', label: L('Фенол растворяется в NaOH и снова выделяется кислотой; с NaHCO₃ газа нет. Винная кислота выделяет CO₂ из NaHCO₃', 'Фенол NaOH-та ериді және қышқылмен қайта бөлінеді; NaHCO₃-пен газ жоқ. Шарап қышқылы NaHCO₃-тен CO₂ бөледі', 'Phenol dissolves in NaOH and separates again with acid; no gas with NaHCO₃. Tartaric acid releases CO₂ from NaHCO₃'), log: L('Фенол растворяется в NaOH (фенолят натрия) и вновь выделяется эмульсией при подкислении; с NaHCO₃ газ не выделяется, тогда как винная кислота выделяет CO₂', 'Фенол NaOH-та ериді (натрий феноляты) және қышқылдағанда эмульсия түрінде қайта бөлінеді; NaHCO₃-пен газ бөлінбейді, ал шарап қышқылы CO₂ бөледі', 'Phenol dissolves in NaOH (sodium phenoxide) and separates again as an emulsion on acidification; no gas is evolved with NaHCO₃, whereas tartaric acid releases CO₂') },
      { id: 'both', label: L('И фенол, и винная кислота выделяют CO₂ из NaHCO₃', 'Фенол да, шарап қышқылы да NaHCO₃-тен CO₂ бөледі', 'Both phenol and tartaric acid release CO₂ from NaHCO₃') },
      { id: 'noNaOH', label: L('Фенол не растворяется в NaOH', 'Фенол NaOH-та ерімейді', 'Phenol does not dissolve in NaOH') },
      { id: 'none', label: L('Ни фенол, ни винная кислота с NaHCO₃ не реагируют', 'Фенол да, шарап қышқылы да NaHCO₃-пен әрекеттеспейді', 'Neither phenol nor tartaric acid reacts with NaHCO₃') },
    ],
    correct: () => 'ok',
    why: () => L('Фенол (pKa ≈ 10) сильнее воды и реагирует с NaOH, но слабее угольной кислоты (pKa₁ = 6,4) и не разлагает NaHCO₃; карбоновые кислоты сильнее угольной и реагируют с обоими.', 'Фенол (pKa ≈ 10) судан күшті және NaOH-пен әрекеттеседі, бірақ көмір қышқылынан (pKa₁ = 6,4) әлсіз және NaHCO₃-ті ыдыратпайды; карбон қышқылдары көмір қышқылынан күшті және екеуімен де әрекеттеседі.', 'Phenol (pKa ≈ 10) reacts with NaOH but is too weak an acid to decompose NaHCO₃ (carbonic acid pKa₁ = 6.4); carboxylic acids are stronger than carbonic acid and react with both.'),
  },
  onDone(S, tb) { S.e8.res = { oh: tb['1'].oh, h: tb['1'].h, dirty: !!tb['1'].bic }; },
  scene: (S, local) => tubesScene(aTubes, local, { cap: 4, title: L('1 NaOH / HCl · 2 фенол + NaHCO₃ · 3 к-та + NaHCO₃', '1 NaOH / HCl · 2 фенол + NaHCO₃ · 3 қ-л + NaHCO₃', '1 NaOH / HCl · 2 phenol + NaHCO₃ · 3 acid + NaHCO₃') }),
  hint1: L('Пробирка 1: эмульсия → NaOH до просветления → HCl до кислой реакции. Пробирки 2 и 3 — свежие, только с NaHCO₃.', '1-пробирка: эмульсия → мөлдір болғанша NaOH → қышқыл реакцияға дейін HCl. 2 және 3-пробиркалар — жаңа, тек NaHCO₃-пен.', 'Tube 1: emulsion → NaOH until clear → HCl until acidic. Tubes 2 and 3 are fresh, with NaHCO₃ only.'),
  hint2: L('Эмульсия просветляется примерно от 10 капель NaOH; столько же капель HCl и ещё немного — до кислой реакции. NaHCO₃ в пробирку 1 не приливайте: в ней избыток HCl.', 'Эмульсия шамамен 10 тамшы NaOH-тан мөлдірленеді; дәл сонша HCl тамшысы және тағы аздап — қышқыл реакцияға дейін. NaHCO₃-ты 1-пробиркаға құймаңыз: онда HCl артық.', 'The emulsion clears after about 10 drops of NaOH; the same number of HCl drops and a few more make it acidic. Do not add NaHCO₃ to tube 1: it contains excess HCl.'),
  hint3: L('1: эмульсия → NaOH «+5» ×2 → HCl «+5» ×3. 2: эмульсия → NaHCO₃. 3: кристаллы → NaHCO₃.', '1: эмульсия → NaOH «+5» ×2 → HCl «+5» ×3. 2: эмульсия → NaHCO₃. 3: кристалдар → NaHCO₃.', '1: emulsion → NaOH “+5” ×2 → HCl “+5” ×3. 2: emulsion → NaHCO₃. 3: crystals → NaHCO₃.'),
};

/* ---------- 2. Фенол на коже ---------- */
const s1 = {
  type: 'decide', id: 'skin',
  title: L('Капля фенола на коже', 'Теріге тамған фенол тамшысы', 'A drop of phenol on the skin'),
  instr: L('<p>При встряхивании пробирки капля фенольной эмульсии попала вам на запястье выше перчатки. Кожа пока не болит.</p>', '<p>Пробирканы сілкілегенде фенол эмульсиясының бір тамшысы қолғаптан жоғары білегіңізге тамды. Тері әзірге ауырмайды.</p>', '<p>While you were shaking the tube a drop of phenol emulsion landed on your wrist above the glove. The skin does not hurt yet.</p>'),
  need: L('Выберите правильное действие', 'Дұрыс әрекетті таңдаңыз', 'Choose the right action'),
  scene: () => bottlesScene([['H₂O', L('кран', 'кран', 'tap')], [L('ПЭГ', 'ПЭГ', 'PEG'), '400'], ['C₆H₅OH', L('эмульсия', 'эмульсия', 'emulsion')], ['NaOH', '10 %']], L('раковина рядом', 'раковина жанында', 'sink nearby')),
  question: L('Ваши действия?', 'Сіздің әрекеттеріңіз?', 'What do you do?'),
  options: [
    { id: 'wash', ok: true, label: L('Сразу смыть большим количеством проточной воды (или полиэтиленгликолем 300/400), снять загрязнённую перчатку и сообщить преподавателю', 'Дереу көп мөлшердегі ағын сумен (немесе 300/400 полиэтиленгликольмен) жуып, ластанған қолғапты шешіп, оқытушыға хабарлау', 'Immediately wash it off with plenty of running water (or polyethylene glycol 300/400), remove the contaminated glove and inform the teacher'),
      why: L('Раздел 7 методички: фенол быстро всасывается через кожу — смыть немедленно и сообщить преподавателю.', 'Әдістеменің 7-бөлімі: фенол тері арқылы тез сіңеді — дереу жуып, оқытушыға хабарлау керек.', 'Manual, section 7: phenol is rapidly absorbed through the skin — wash it off at once and tell the teacher.'),
      advance: 300, log: L('Капля фенола на запястье: немедленно смыта проточной водой, перчатка заменена, преподаватель извещён', 'Білекке тамған фенол: дереу ағын сумен жуылды, қолғап ауыстырылды, оқытушыға хабарланды', 'Drop of phenol on the wrist: washed off at once with running water, glove replaced, teacher informed') },
    { id: 'ignore', ok: false, label: L('Продолжить работу — капля маленькая, руки вымою в конце', 'Жұмысты жалғастыру — тамшы кішкентай, қолды соңында жуамын', 'Carry on working — it is a tiny drop, I will wash my hands at the end'),
      remark: L('фенол на коже не смыт немедленно (раздел 7 методички)', 'теріге тамған фенол дереу жуылмады (әдістеменің 7-бөлімі)', 'phenol on the skin was not washed off immediately (manual, section 7)'),
      critical: { text: L('Фенол обладает местноанестезирующим действием, поэтому ожог сначала не чувствуется. За несколько минут он проникает в кожу: появляется белое пятно химического ожога, затем покраснение и боль; всасывание фенола даёт общее отравление. Работа прекращена, пострадавшему оказывают первую помощь. Фенол смывают сразу, не дожидаясь боли.', 'Фенолдың жергілікті жансыздандыратын әсері бар, сондықтан күйік алдымен сезілмейді. Бірнеше минутта ол теріге енеді: химиялық күйіктің ақ дағы, содан кейін қызару мен ауырсыну пайда болады; фенолдың сіңуі жалпы улануға әкеледі. Жұмыс тоқтатылды, зардап шегушіге алғашқы көмек көрсетіледі. Фенолды ауырсынуды күтпей, бірден жуады.', 'Phenol has a local anaesthetic action, so the burn is not felt at first. Within minutes it penetrates the skin: a white patch of chemical burn appears, then redness and pain; absorbed phenol causes systemic poisoning. Work is stopped and first aid is given. Phenol is washed off at once, without waiting for pain.') } },
    { id: 'naoh', ok: false, severity: 'safety', retry: true, label: L('Нейтрализовать каплей раствора NaOH — фенол ведь кислота', 'NaOH ерітіндісінің тамшысымен бейтараптау — фенол қышқыл ғой', 'Neutralise it with a drop of NaOH solution — phenol is an acid after all'),
      remark: L('попытка нейтрализовать фенол на коже щёлочью', 'теріге тамған фенолды сілтімен бейтараптау әрекеті', 'tried to neutralise phenol on the skin with alkali'),
      whatif: L('Щёлочь сама вызывает ожог, а фенол при этом продолжает всасываться. Нейтрализацию применяют только к проливам на столе (п. 6.4), а кожу промывают водой.', 'Сілтінің өзі күйдіреді, ал фенол сіңе береді. Бейтараптауды тек үстелге төгілгенде қолданады (6.4-тармақ), ал теріні сумен жуады.', 'The alkali causes a burn of its own while the phenol keeps being absorbed. Neutralisation is only for spills on the bench (rule 6.4); skin is rinsed with water.') },
    { id: 'wipe', ok: false, severity: 'safety', retry: true, label: L('Вытереть бумажной салфеткой и продолжить', 'Қағаз майлықпен сүртіп, жалғастыру', 'Wipe it with a paper towel and carry on'),
      remark: L('фенол на коже только вытерт салфеткой, без промывания', 'теріге тамған фенол жуылмай, тек майлықпен сүртілді', 'phenol on the skin was only wiped with a towel, not rinsed'),
      whatif: L('Салфетка размазывает фенол по коже и не удаляет то, что уже впиталось. Нужно обильное промывание.', 'Майлық фенолды теріге жағып жібереді және сіңіп кеткенін кетірмейді. Мол сумен жуу керек.', 'A towel smears phenol over the skin and does not remove what has already soaked in. Copious rinsing is needed.') },
  ],
};

/* ---------- 3. Уборка ---------- */
const s2 = {
  type: 'cleanup', id: 'clean',
  title: L('Уборка рабочего места', 'Жұмыс орнын жинау', 'Cleaning up'),
  instr: L('<p>Утилизируйте отходы по контейнерам, выключите баню, закройте склянки и вымойте руки (разделы 10 и 14.3 правил ТБ).</p><p class="note">Фенол- и бромсодержащие отходы — в специальные ёмкости, не в раковину (раздел 7 методички).</p>',
    '<p>Қалдықтарды ыдыстар бойынша кәдеге жаратыңыз, моншаны өшіріңіз, склянкаларды жабыңыз және қолыңызды жуыңыз (ҚТ ережелерінің 10 және 14.3-бөлімдері).</p><p class="note">Фенол және бром бар қалдықтар — арнайы ыдыстарға, раковинаға емес (әдістеменің 7-бөлімі).</p>',
    '<p>Sort the waste into the containers, switch off the bath, close the bottles and wash your hands (safety rules sections 10 and 14.3).</p><p class="note">Phenol- and bromine-containing waste goes into the designated containers, not the sink (manual, section 7).</p>'),
  need: L('Уберите рабочее место', 'Жұмыс орнын жинаңыз', 'Clean up the bench'),
  bins: ['acid', 'organic', 'halogen', 'solid', 'glass', 'sink', 'trash'],
  items: [
    { id: 'brom', bin: 'halogen', label: L('Пробирки с бромной водой, трибромфенолом и иодоформом (опыты 2, 5, 7)', 'Бромды су, трибромфенол және иодоформ бар пробиркалар (2, 5, 7-тәжірибелер)', 'Tubes with bromine water, tribromophenol and iodoform (experiments 2, 5, 7)'),
      wrong: { sink: { severity: 'safety', text: L('бромсодержащие отходы вылиты в раковину (п. 10.2 правил ТБ)', 'бром бар қалдықтар раковинаға төгілді (ҚТ ережелерінің 10.2-тармағы)', 'bromine-containing waste poured down the sink (safety rule 10.2)'), whatif: L('Бром и бромфенолы ядовиты и выделяют пары из раковины; галогенсодержащие отходы собирают отдельно.', 'Бром мен бромфенолдар улы және раковинадан бу бөледі; галогенді қалдықтарды бөлек жинайды.', 'Bromine and bromophenols are toxic and give off vapour from the sink; halogenated waste is collected separately.') } } },
    { id: 'phen', bin: 'organic', label: L('Растворы фенолов и фенольная эмульсия (опыты 2, 6, 8)', 'Фенол ерітінділері және фенол эмульсиясы (2, 6, 8-тәжірибелер)', 'Phenol solutions and phenol emulsion (experiments 2, 6, 8)'),
      wrong: { sink: { severity: 'safety', text: L('фенолсодержащие отходы вылиты в раковину (раздел 7 методички)', 'фенол бар қалдықтар раковинаға төгілді (әдістеменің 7-бөлімі)', 'phenol-containing waste poured down the sink (manual, section 7)'), whatif: L('Фенол токсичен для водоёмов и не задерживается очистными сооружениями; его собирают в ёмкость для органических отходов.', 'Фенол су айдындары үшін улы және тазарту құрылғыларында ұсталмайды; оны органикалық қалдықтар ыдысына жинайды.', 'Phenol is toxic to waterways and is not removed by sewage treatment; it is collected in the organic waste container.') } } },
    { id: 'aq', bin: 'acid', label: L('Водные растворы: оксалат кальция, соли марганца, тартрат меди, известковая вода (опыты 1, 3, 4)', 'Сулы ерітінділер: кальций оксалаты, марганец тұздары, мыс тартраты, әк суы (1, 3, 4-тәжірибелер)', 'Aqueous solutions: calcium oxalate, manganese salts, copper tartrate, lime water (experiments 1, 3, 4)') },
    { id: 'paper', bin: 'solid', label: L('Использованная индикаторная бумага', 'Пайдаланылған индикатор қағазы', 'Used indicator paper') },
    { id: 'tube', bin: 'glass', label: L('Треснувшая пробирка', 'Жарылған пробирка', 'A cracked test tube') },
  ],
  switches: [
    { id: 'bath', label: L('Выключить водяную баню и плитку', 'Су моншасы мен плитаны өшіру', 'Switch off the water bath and the hot plate') },
    { id: 'bottles', label: L('Закрыть склянки, бромную воду — в шкаф', 'Склянкаларды жабу, бромды суды — шкафқа', 'Close the bottles; bromine water back into the hood cupboard') },
    { id: 'wash', label: L('Вымыть пробирки и пипетки', 'Пробиркалар мен пипеткаларды жуу', 'Wash the tubes and pipettes') },
    { id: 'hands', label: L('Вымыть руки', 'Қолды жуу', 'Wash your hands'), log: L('Руки вымыты с мылом (фенол всасывается через кожу)', 'Қол сабынмен жуылды (фенол тері арқылы сіңеді)', 'Hands washed with soap (phenol is absorbed through the skin)') },
  ],
};

export default {
  id: '8',
  title: L('Кислотные свойства фенола в сравнении с карбоновой кислотой', 'Фенолдың қышқылдық қасиеттері карбон қышқылымен салыстырғанда', 'Acidic properties of phenol compared with a carboxylic acid'),
  principle: L('Фенол (pKa ≈ 10) реагирует с NaOH, но слишком слабая кислота, чтобы разложить NaHCO₃ (pKa₁ угольной кислоты = 6,4); карбоновые кислоты реагируют с обоими.', 'Фенол (pKa ≈ 10) NaOH-пен әрекеттеседі, бірақ NaHCO₃-ті ыдырату үшін тым әлсіз қышқыл (көмір қышқылының pKa₁ = 6,4); карбон қышқылдары екеуімен де әрекеттеседі.', 'Phenol (pKa ≈ 10) reacts with NaOH but is too weak an acid to decompose NaHCO₃ (carbonic acid pKa₁ = 6.4); carboxylic acids react with both.'),
  equation: ['C₆H₅OH + NaOH → C₆H₅ONa + H₂O', 'C₆H₅ONa + HCl → C₆H₅OH + NaCl', L('C₆H₅OH + NaHCO₃ → реакция не идёт', 'C₆H₅OH + NaHCO₃ → реакция жүрмейді', 'C₆H₅OH + NaHCO₃ → no reaction')],
  initialState: () => ({ e8: { res: null } }),
  checkpoints: [0, 1, 2],
  steps: [s0, s1, s2],
  results: (S) => ({ ...(S.e8.res || {}) }),
  summary: () => [
    { label: 'NaOH / HCl', value: L('растворяется / выделяется', 'ериді / бөлінеді', 'dissolves / separates'), st: 'ok' },
    { label: 'NaHCO₃', value: L('фенол — нет газа; кислота — CO₂', 'фенол — газ жоқ; қышқыл — CO₂', 'phenol — no gas; acid — CO₂'), st: 'ok' },
  ],
};
