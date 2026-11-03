/** Опыт 2. Сравнение физических свойств малеиновой и фумаровой кислот. Методичка, раздел 6, опыт 2. */
import { L, n } from '../../app/i18n.js';
import { dissolvedFrac, malMp, sublimeRate } from './model.js';
import { hoodScene, capApparatus } from './scene.js';
import { scene } from '../../app/scene/svg.js';

const g = (x, d = 4) => n(x, d);

/* ---------------------------------------------------------------- 0. рабочее место */
const s0 = {
  type: 'checklist', id: 'ppe',
  title: L('Рабочее место и средства защиты', 'Жұмыс орны және қорғаныс құралдары', 'Workplace and protective equipment'),
  instr: L('<p>Малеиновая кислота вредна при проглатывании, раздражает кожу, глаза и дыхательные пути и может вызывать аллергию — не поднимайте пыль. Подготовьте рабочее место: нажмите на каждый нужный пункт, лишнее не нажимайте.</p>',
    '<p>Малеин қышқылы жұтқанда зиянды, теріні, көзді және тыныс жолдарын тітіркендіреді, аллергия тудыруы мүмкін — шаң көтермеңіз. Жұмыс орнын дайындаңыз: әр қажетті тармақты басыңыз, артығын баспаңыз.</p>',
    '<p>Maleic acid is harmful if swallowed, irritates the skin, eyes and respiratory tract and may cause skin sensitisation — avoid raising dust. Prepare the workplace: tap every item you need and nothing that is wrong.</p>'),
  need: L('Выполните все нужные пункты', 'Барлық қажетті тармақтарды орындаңыз', 'Complete every required item'),
  scene: hoodScene,
  items: [
    { id: 'coat', label: L('Халат застёгнут', 'Халат түймеленген', 'Lab coat buttoned'), log: L('Надет и застёгнут хлопковый халат', 'Мақта мата халат киіліп, түймеленді', 'Cotton lab coat on and buttoned') },
    { id: 'gog', label: L('Защитные очки', 'Қорғаныс көзілдірігі', 'Safety goggles'), log: L('Надеты защитные очки', 'Қорғаныс көзілдірігі киілді', 'Safety goggles on') },
    { id: 'glv', label: L('Перчатки нитриловые', 'Нитрил қолғаптар', 'Nitrile gloves'), log: L('Надеты нитриловые перчатки', 'Нитрил қолғаптар киілді', 'Nitrile gloves on') },
    { id: 'eye', label: L('Найти фонтанчик для глаз и аварийный душ', 'Көз жуатын фонтан мен апаттық душты табу', 'Locate the eyewash station and safety shower'), log: L('Найдены фонтанчик для промывания глаз и аварийный душ', 'Көз жуатын фонтан мен апаттық душ табылды', 'Eyewash station and safety shower located') },
    { id: 'ext', label: L('Найти огнетушитель', 'Өрт сөндіргішті табу', 'Locate the fire extinguisher'), log: L('Найден огнетушитель', 'Өрт сөндіргіш табылды', 'Fire extinguisher located') },
    { id: 'spat', label: L('Брать вещество шпателем, не поднимая пыль', 'Затты шаң көтермей, шпательмен алу', 'Take the solid with a spatula without raising dust'), log: L('Твёрдые кислоты берут шпателем, аккуратно, без пыли', 'Қатты қышқылдарды шпательмен, ұқыпты, шаңсыз алады', 'The solid acids are taken with a spatula, carefully, without dust') },
    { id: 'taste', label: L('Сравнить кислоты на вкус (какая кислее)', 'Қышқылдарды дәмі бойынша салыстыру (қайсысы қышқылырақ)', 'Compare the acids by taste (which is sourer)'),
      wrong: { severity: 'safety', text: L('попытка пробовать реактив на вкус (п. 2.5 правил ТБ)', 'реактивтің дәмін татып көру әрекеті (ҚТ ережелерінің 2.5-тармағы)', 'attempt to taste a reagent (safety rule 2.5)'),
        whatif: L('Пробовать реактивы на вкус запрещено. Малеиновая кислота вредна при проглатывании и раздражает слизистые; кислотность сравнивают по pKa и индикатором, а не языком.', 'Реактивтердің дәмін татуға тыйым салынған. Малеин қышқылы жұтқанда зиянды және сілемейлі қабықты тітіркендіреді; қышқылдықты тілмен емес, pKa және индикатор арқылы салыстырады.', 'Tasting reagents is forbidden. Maleic acid is harmful if swallowed and irritates mucous membranes; acidity is compared by pKa and with an indicator, never with your tongue.') } },
    { id: 'lens', label: L('Работать в контактных линзах вместо очков', 'Көзілдіріктің орнына контакт линзаларымен жұмыс істеу', 'Work in contact lenses instead of goggles'),
      wrong: { severity: 'safety', text: L('попытка работать в контактных линзах без защитных очков (п. 3.2 правил ТБ)', 'қорғаныс көзілдірігінсіз контакт линзаларымен жұмыс істеу әрекеті (ҚТ ережелерінің 3.2-тармағы)', 'tried to work in contact lenses without goggles (safety rule 3.2)'),
        whatif: L('Пыль и пары кислоты скапливаются под линзой; при попадании в глаз — химический ожог. Очки обязательны.', 'Қышқыл шаңы мен булары линза астына жиналады; көзге түссе — химиялық күйік. Көзілдірік міндетті.', 'Acid dust and vapour collect under the lens; if it gets into the eye it causes a chemical burn. Goggles are compulsory.') } },
  ],
};

/* ---------------------------------------------------------------- 1–2. навески */
const weigh = (id, name, nameEn, saveAs) => ({
  type: 'weigh', id,
  title: L(`Навеска ${name.ru}`, `${name.kk} өлшендісі`, `Weighing the ${nameEn}`),
  instr: L(`<ol><li>Возьмите на аналитических весах около <b>0,2 г</b> ${name.ru} (0,18–0,22 г).</li><li>Лодочка → тарирование → вещество шпателем → закрыть дверцы → записать.</li></ol><p class="note">Шпатель набирает больше, чем нужно: подсыпайте понемногу, излишек — в отдельный стаканчик.</p>`,
    `<ol><li>Аналитикалық таразыда шамамен <b>0,2 г</b> ${name.kk} алыңыз (0,18–0,22 г).</li><li>Қайықша → тарировкалау → шпательмен зат → есікшелерді жабу → жазу.</li></ol><p class="note">Шпатель қажеттен көп алады: аздап қосыңыз, артығы — бөлек стақаншаға.</p>`,
    `<ol><li>Weigh out about <b>0.2 g</b> of ${nameEn} on the analytical balance (0.18–0.22 g).</li><li>Boat → tare → solid with the spatula → close the doors → record.</li></ol><p class="note">A spatula load is more than you need: add small pinches; excess goes to a separate beaker.</p>`),
  need: L('Запишите массу навески', 'Өлшендінің массасын жазыңыз', 'Record the mass of the sample'),
  reagent: name.formula, mode: 'spatula', container: 'boat', target: 0.2, lo: 0.18, hi: 0.22, saveAs,
  onRecord(S, m, ctx) { ctx.log(L(`Навеска ${name.ru}: <b>${g(m)} г</b>; перенесена в пробирку`, `${name.kk} өлшендісі: <b>${g(m)} г</b>; пробиркаға ауыстырылды`, `${nameEn} sample: <b>${g(m)} g</b>; transferred to a test tube`), 'calc'); },
});
const s1 = weigh('wmal', { ru: 'малеиновой кислоты', kk: 'малеин қышқылының', formula: L('малеин. к-та', 'малеин қ-лы', 'maleic acid') }, 'maleic acid', 'mMal');
const s2 = weigh('wfum', { ru: 'фумаровой кислоты', kk: 'фумар қышқылының', formula: L('фумар. к-та', 'фумар қ-лы', 'fumaric acid') }, 'fumaric acid', 'mFum');

/* ---------------------------------------------------------------- 3. растворимость */
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
function dissolve(t, S, kind) {
  const m = kind === 'mal' ? S.mMal || 0.2 : S.mFum || 0.2;
  const f = dissolvedFrac(m, t.v, t.Tw, kind);
  t.dis = f; t.solid = clamp(0.7 * (1 - f), 0, 0.7); t.color = null;
  if (kind === 'fum' && t.Tw > 50) t.ppt = 0;
}
const s3 = {
  type: 'test', id: 'sol',
  title: L('Растворимость в холодной воде', 'Суық судағы ерігіштік', 'Solubility in cold water'),
  instr: L('<ol><li>В пробирку 1 — навеска малеиновой кислоты, в пробирку 2 — фумаровой.</li><li>Прилейте в каждую <b>1 мл холодной воды</b> и встряхните.</li><li>Сравните растворимость.</li></ol><p class="note">Сравнение корректно только при одинаковых условиях: одинаковый объём, одинаковая (комнатная или ниже) температура воды.</p>',
    '<ol><li>1-пробиркаға — малеин қышқылының өлшендісі, 2-пробиркаға — фумар қышқылының.</li><li>Әрқайсысына <b>1 мл суық су</b> құйып, шайқаңыз.</li><li>Ерігіштікті салыстырыңыз.</li></ol><p class="note">Салыстыру тек бірдей жағдайда дұрыс: көлемі бірдей, су температурасы бірдей (бөлме немесе одан төмен).</p>',
    '<ol><li>Tube 1 — the maleic acid sample, tube 2 — the fumaric acid sample.</li><li>Add <b>1 mL of cold water</b> to each and shake.</li><li>Compare the solubility.</li></ol><p class="note">The comparison is valid only under identical conditions: the same volume and the same (room temperature or colder) water.</p>'),
  need: L('Проведите пробу и опишите наблюдение', 'Сынаманы жүргізіп, бақылауды сипаттаңыз', 'Do the test and describe what you see'),
  tubes: [{ id: 'mal', label: L('1 · малеин.', '1 · малеин', '1 · maleic') }, { id: 'fum', label: L('2 · фумар.', '2 · фумар', '2 · fumaric') }],
  capacity: 4,
  reagents: [
    { id: 'solid', target: 'all', label: L('Внести навески в пробирки', 'Өлшендірлерді пробиркаларға салу', 'Put the samples into the tubes'), advance: 30, disabled: (t) => t.in,
      apply(t, S, ctx, id) { t.in = true; t.solid = 0.7; if (id === 'mal') ctx.log(L('В пробирку 1 внесена малеиновая кислота, в пробирку 2 — фумаровая (белые кристаллические порошки)', '1-пробиркаға малеин қышқылы, 2-пробиркаға фумар қышқылы салынды (ақ кристалды ұнтақтар)', 'Maleic acid put into tube 1 and fumaric acid into tube 2 (white crystalline powders)')); } },
    { id: 'cold', target: 'all', group: L('Вода', 'Су', 'Water'), label: L('Прилить по 1 мл холодной воды', 'Әрқайсысына 1 мл суық су құю', 'Add 1 mL of cold water to each'), advance: 30, disabled: (t) => t.v > 0,
      apply(t, S, ctx, id) { if (!t.in) { if (id === 'mal') ctx.feedback(L('Сначала внесите навески.', 'Алдымен өлшендірлерді салыңыз.', 'Put the samples in first.'), 'warn'); return; } t.v = 1; t.Tw = 18; if (id === 'mal') ctx.log(L('В обе пробирки прилито по 1 мл холодной дистиллированной воды (≈ 18 °C)', 'Екі пробиркаға да 1 мл суық дистилденген су (≈ 18 °C) құйылды', '1 mL of cold distilled water (≈ 18 °C) added to both tubes')); } },
    { id: 'hot', target: 'all', group: L('Вода', 'Су', 'Water'), label: L('Прилить по 1 мл горячей воды (~80 °C), чтобы быстрее растворилось', 'Тезірек еру үшін әрқайсысына 1 мл ыстық су (~80 °C) құю', 'Add 1 mL of hot water (~80 °C) to each to dissolve faster'), advance: 30, disabled: (t) => t.v > 0,
      apply(t, S, ctx, id) {
        if (!t.in) return;
        t.v = 1; t.Tw = 80; S.hotWater = true;
        if (id === 'mal') {
          ctx.remark({ key: 'hotw', severity: 'major', text: L('растворимость сравнивали в горячей воде вместо холодной — условия опыта нарушены', 'ерігіштік суық судың орнына ыстық суда салыстырылды — тәжірибе шарттары бұзылды', 'solubility compared in hot instead of cold water — the conditions of the test were violated'),
            whatif: L('Растворимость фумаровой кислоты сильно растёт с температурой: в горячей воде часть её растворится, и разница между изомерами станет менее явной; при остывании фумаровая кислота снова выкристаллизуется. По методичке сравнивают в холодной воде.', 'Фумар қышқылының ерігіштігі температурамен қатты өседі: ыстық суда оның бір бөлігі ериді де, изомерлер арасындағы айырма азаяды; суыған кезде фумар қышқылы қайта кристалданады. Әдістеме бойынша суық суда салыстырады.', 'The solubility of fumaric acid rises steeply with temperature: in hot water part of it dissolves and the difference between the isomers becomes less obvious; on cooling the fumaric acid crystallises out again. The manual compares them in cold water.') });
          ctx.log(L('В обе пробирки прилито по 1 мл горячей воды (≈ 80 °C)', 'Екі пробиркаға да 1 мл ыстық су (≈ 80 °C) құйылды', '1 mL of hot water (≈ 80 °C) added to both tubes'));
        }
      } },
    { id: 'shake', target: 'all', group: L('Действия', 'Әрекеттер', 'Actions'), label: L('Встряхнуть 1 мин', '1 мин шайқау', 'Shake for 1 min'), advance: 60, disabled: (t) => !t.v || t.shaken,
      apply(t, S, ctx, id) { t.shaken = true; dissolve(t, S, id); if (id === 'fum') ctx.log(L('Пробирки встряхивали 1 мин', 'Пробиркалар 1 мин шайқалды', 'The tubes were shaken for 1 min')); } },
  ],
  done: (tubes) => tubes.mal.shaken && tubes.fum.shaken,
  observe: {
    question: L('Что вы наблюдаете?', 'Не байқайсыз?', 'What do you observe?'),
    options: [
      { id: 'cold', label: L('Малеиновая кислота растворилась полностью (прозрачный раствор); фумаровая почти не растворилась — осадок на дне', 'Малеин қышқылы толық еріді (мөлдір ерітінді); фумар қышқылы ерімеді дерлік — түбінде тұнба', 'Maleic acid dissolved completely (clear solution); fumaric acid hardly dissolved — solid on the bottom'),
        log: (S) => L(`Малеиновая кислота (${g(S.mMal)} г) быстро и полностью растворилась в 1 мл холодной воды; фумаровая (${g(S.mFum)} г) осталась почти нерастворённой — белый осадок на дне`, `Малеин қышқылы (${g(S.mMal)} г) 1 мл суық суда тез әрі толық еріді; фумар қышқылы (${g(S.mFum)} г) ерімей дерлік қалды — түбінде ақ тұнба`, `Maleic acid (${g(S.mMal)} g) dissolved quickly and completely in 1 mL of cold water; fumaric acid (${g(S.mFum)} g) remained almost undissolved — a white solid on the bottom`) },
      { id: 'hot', label: L('Малеиновая растворилась полностью, фумаровая — частично; разница меньше ожидаемой', 'Малеин толық еріді, фумар — жартылай; айырма күтілгеннен аз', 'Maleic dissolved completely, fumaric partly; the difference is smaller than expected'),
        log: L('В горячей воде малеиновая кислота растворилась полностью, фумаровая — частично; при остывании во второй пробирке снова появились кристаллы', 'Ыстық суда малеин қышқылы толық, фумар қышқылы жартылай еріді; суыған кезде екінші пробиркада қайтадан кристалдар пайда болды', 'In hot water maleic acid dissolved completely and fumaric acid partly; on cooling, crystals reappeared in the second tube') },
      { id: 'both', label: L('Обе кислоты растворились полностью', 'Екі қышқыл да толық еріді', 'Both acids dissolved completely') },
      { id: 'none', label: L('Обе кислоты не растворились', 'Екі қышқыл да ерімеді', 'Neither acid dissolved') },
      { id: 'rev', label: L('Фумаровая растворилась, малеиновая — нет', 'Фумар еріді, малеин — жоқ', 'Fumaric dissolved, maleic did not') },
    ],
    correct: (S) => (S.hotWater ? 'hot' : 'cold'),
    why: (S) => (S.hotWater ? L('В горячей воде растворимость фумаровой кислоты выше, поэтому её осадок частично растворился.', 'Ыстық суда фумар қышқылының ерігіштігі жоғары, сондықтан оның тұнбасы жартылай еріді.', 'Fumaric acid is more soluble in hot water, so part of it dissolved.')
      : L('Растворимость в воде: малеиновая ≈ 78 г/100 мл, фумаровая ≈ 0,6 г/100 мл.', 'Судағы ерігіштік: малеин ≈ 78 г/100 мл, фумар ≈ 0,6 г/100 мл.', 'Solubility in water: maleic ≈ 78 g/100 mL, fumaric ≈ 0.6 g/100 mL.')),
  },
  onDone(S, tubes) { S.sol = { mal: tubes.mal.dis, fum: tubes.fum.dis, hot: !!S.hotWater }; },
};

/* ---------------------------------------------------------------- 4. капилляр с малеиновой кислотой */
const s4 = {
  type: 'process', id: 'cap',
  title: L('Набивка капилляра малеиновой кислотой', 'Капиллярды малеин қышқылымен толтыру', 'Filling the capillary with maleic acid'),
  instr: L('<ol><li>Разотрите немного малеиновой кислоты на часовом стекле.</li><li>Наберите порошок в капилляр и уплотните, бросая капилляр запаянным концом вниз через длинную трубку, до слоя <b>2–3 мм</b>.</li></ol>',
    '<ol><li>Аздаған малеин қышқылын сағат шынысында ұнтақтаңыз.</li><li>Ұнтақты капиллярға алып, капиллярды дәнекерленген ұшымен төмен ұзын түтік арқылы тастай отырып, <b>2–3 мм</b> қабатқа дейін тығыздаңыз.</li></ol>',
    '<ol><li>Grind a little maleic acid on a watch glass.</li><li>Push the capillary into the powder and pack it by dropping the capillary, sealed end down, through a long tube until the layer is <b>2–3 mm</b>.</li></ol>'),
  need: L('Набейте капилляр слоем 2–3 мм', 'Капиллярды 2–3 мм қабатпен толтырыңыз', 'Pack a 2–3 mm layer'),
  speeds: null,
  setup(S) { S.cap = S.cap || { ground: false, loose: 0, packed: 0 }; },
  controls: [
    { kind: 'action', id: 'grind', label: L('Растереть пробу', 'Сынаманы ұнтақтау', 'Grind the sample'), advance: 60, do(S) { S.cap.ground = true; }, log: L('Малеиновая кислота растёрта в тонкий порошок', 'Малеин қышқылы ұсақ ұнтаққа айналдырылды', 'Maleic acid ground to a fine powder') },
    { kind: 'action', id: 'dip', once: false, label: L('Вдавить капилляр в порошок', 'Капиллярды ұнтаққа батыру', 'Push the capillary into the powder'), advance: 15,
      do(S, lc, ctx) { if (!S.cap.ground) ctx.remark({ key: 'grind', severity: 'minor', points: 0.5, text: L('проба не растёрта — неплотная набивка капилляра', 'сынама ұнтақталмаған — капилляр тығыз толтырылмайды', 'sample not ground — loose packing of the capillary') }); S.cap.loose += ctx.rng.range(0.8, 1.3); } },
    { kind: 'action', id: 'tap', once: false, label: L('Бросить через трубку (уплотнить)', 'Түтік арқылы тастау (тығыздау)', 'Drop through the tube (pack)'), advance: 15,
      do(S, lc, ctx) {
        const C = S.cap;
        if (!C.loose) { ctx.feedback(L('В капилляре нет порошка.', 'Капиллярда ұнтақ жоқ.', 'There is no powder in the capillary.'), 'warn'); return; }
        C.packed += C.loose * (C.ground ? 0.72 : 0.95); C.loose = 0;
        ctx.feedback(C.packed > 3.6 ? L('Слой больше 3–4 мм — интервал плавления растянется. Возьмите новый капилляр.', 'Қабат 3–4 мм-ден асты — балқу аралығы созылады. Жаңа капилляр алыңыз.', 'The layer is over 3–4 mm — the melting range will be broad. Take a new capillary.') : null, 'warn');
      } },
    { kind: 'action', id: 'new', once: false, cls: 'danger', label: L('Взять новый капилляр', 'Жаңа капилляр алу', 'Take a new capillary'), do(S, lc, ctx) { S.cap.loose = 0; S.cap.packed = 0; ctx.feedback(null); } },
  ],
  readouts: (S) => [
    { label: L('Слой', 'Қабат', 'Layer'), value: { ru: n(S.cap.packed, 1) + ' мм', kk: n(S.cap.packed, 1) + ' мм', en: n(S.cap.packed, 1) + ' mm' }, st: S.cap.packed >= 2 && S.cap.packed <= 3.2 ? 'ok' : S.cap.packed > 3.2 ? 'warn' : '' },
  ],
  done(S, lc, ctx) {
    const C = S.cap;
    if (C.packed >= 2 && C.packed <= 3.6 && C.loose === 0) { ctx.log(L(`Капилляр набит малеиновой кислотой, слой ${n(C.packed, 1)} мм`, `Капилляр малеин қышқылымен толтырылды, қабат ${n(C.packed, 1)} мм`, `Capillary packed with maleic acid, layer ${n(C.packed, 1)} mm`)); return { text: L('Капилляр готов.', 'Капилляр дайын.', 'The capillary is ready.') }; }
    return false;
  },
  scene: (S) => scene(capApparatus({ Tb: 25, on: false, inside: false }, { layer: S.cap.packed + S.cap.loose * 0.6 })),
};

/* ---------------------------------------------------------------- 5. т. пл. малеиновой кислоты */
const s5 = {
  type: 'read', mode: 'mp', id: 'mp',
  title: L('Температура плавления малеиновой кислоты', 'Малеин қышқылының балқу температурасы', 'Melting point of maleic acid'),
  instr: L('<ol><li>Поместите капилляр в прибор. Быстро нагрейте до ~115 °C, затем медленно — <b>1–2 °C/мин</b>.</li><li>Отметьте начало и конец плавления.</li></ol><p class="note">Ожидаемая т. пл. малеиновой кислоты — 130–135 °C.</p>',
    '<ol><li>Капиллярды құралға салыңыз. ~115 °C-қа дейін тез, содан кейін баяу — <b>1–2 °C/мин</b> қыздырыңыз.</li><li>Балқудың басы мен соңын белгілеңіз.</li></ol><p class="note">Малеин қышқылының күтілетін балқу температурасы — 130–135 °C.</p>',
    '<ol><li>Put the capillary into the apparatus. Heat quickly to ~115 °C, then slowly at <b>1–2 °C/min</b>.</li><li>Mark the start and end of melting.</li></ol><p class="note">The expected m.p. of maleic acid is 130–135 °C.</p>'),
  need: L('Отметьте начало и конец плавления', 'Балқудың басы мен соңын белгілеңіз', 'Mark the start and end of melting'),
  samples: [{ id: 'mal', required: true, name: L('малеиновая кислота', 'малеин қышқылы', 'maleic acid'), range: (S) => malMp(S.mpJit, S.cap.packed, S.cap.ground), layer: (S) => S.cap.packed }],
  saveAs: 'mp',
  onRecord(S, id, on, end, ctx) {
    const good = on >= 129.5 && end <= 136;
    ctx.feedback(L(`Интервал плавления малеиновой кислоты: <b>${n(on, 1)}–${n(end, 1)} °C</b> (ожидается 130–135 °C). ${good ? 'Совпадает с ожидаемым.' : 'Значение вне ожидаемого интервала — нагрев был слишком быстрым или капилляр набит неправильно.'}`, `Малеин қышқылының балқу аралығы: <b>${n(on, 1)}–${n(end, 1)} °C</b> (130–135 °C күтіледі). ${good ? 'Күтілгенмен сәйкес.' : 'Мән күтілген аралықтан тыс — қыздыру тым жылдам болды немесе капилляр дұрыс толтырылмады.'}`, `Melting range of maleic acid: <b>${n(on, 1)}–${n(end, 1)} °C</b> (expected 130–135 °C). ${good ? 'Agrees with the expected value.' : 'Outside the expected range — the heating was too fast or the capillary badly packed.'}`), good ? 'good' : 'warn');
  },
};

/* ---------------------------------------------------------------- 6. фумаровая кислота при нагревании */
const s6 = {
  type: 'process', id: 'fum-heat',
  title: L('Фумаровая кислота при нагревании', 'Фумар қышқылы қыздырғанда', 'Fumaric acid on heating'),
  instr: L('<ol><li>Набейте капилляр фумаровой кислотой и поместите в прибор.</li><li>Нагревайте и наблюдайте в лупу. Фумаровая кислота в открытом капилляре <b>не плавится</b>, при сильном нагревании (выше ≈ 200 °C) <b>возгоняется</b>.</li><li>Запишите наблюдение вместо температуры плавления.</li></ol>',
    '<ol><li>Капиллярды фумар қышқылымен толтырып, құралға салыңыз.</li><li>Қыздырып, лупамен бақылаңыз. Фумар қышқылы ашық капиллярда <b>балқымайды</b>, қатты қыздырғанда (≈ 200 °C-тан жоғары) <b>сублимацияланады</b>.</li><li>Балқу температурасының орнына бақылауды жазыңыз.</li></ol>',
    '<ol><li>Pack a capillary with fumaric acid and put it into the apparatus.</li><li>Heat and watch through the magnifier. In an open capillary fumaric acid <b>does not melt</b>; on strong heating (above about 200 °C) it <b>sublimes</b>.</li><li>Record this observation instead of a melting point.</li></ol>'),
  need: L('Нагрейте выше 200 °C и запишите наблюдение', '200 °C-тан жоғары қыздырып, бақылауды жазыңыз', 'Heat above 200 °C and record the observation'),
  speeds: [10, 30, 60],
  setup(S, lc) { lc.m = { Tb: 25, on: false, rate: 10, inside: false }; lc.sub = 0; lc.maxT = 25; },
  controls: [
    { kind: 'action', id: 'load', label: L('Набить капилляр фумаровой кислотой и поместить в прибор', 'Капиллярды фумар қышқылымен толтырып, құралға салу', 'Pack a capillary with fumaric acid and put it in'), advance: 240, do(S, lc) { lc.m.inside = true; }, log: L('Капилляр с фумаровой кислотой (слой ≈ 2,5 мм) помещён в прибор', 'Фумар қышқылы бар капилляр (қабат ≈ 2,5 мм) құралға салынды', 'Capillary with fumaric acid (layer ≈ 2.5 mm) put into the apparatus') },
    { kind: 'toggle', id: 'heat', label: L('Нагрев: включить', 'Қыздыру: қосу', 'Heating: on'), labelOn: L('Нагрев: выключить', 'Қыздыру: өшіру', 'Heating: off'), when: (S, lc) => lc.m.inside, whenText: L('Сначала поместите капилляр в прибор.', 'Алдымен капиллярды құралға салыңыз.', 'Put the capillary into the apparatus first.') },
    { kind: 'seg', id: 'rate', group: L('Скорость нагрева, °C/мин', 'Қыздыру жылдамдығы, °C/мин', 'Heating rate, °C/min'), options: [[10, '10'], [5, '5'], [2, '2']], default: 10 },
  ],
  tick(S, lc, dt, ctx) {
    const m = lc.m; m.on = !!lc.c.heat; m.rate = lc.c.rate || 10;
    if (m.on) m.Tb = Math.min(320, m.Tb + (m.rate / 60) * dt); else m.Tb += (25 - m.Tb) * Math.min(1, 0.0015 * dt);
    lc.maxT = Math.max(lc.maxT, m.Tb);
    if (m.inside) lc.sub = Math.min(0.85, lc.sub + sublimeRate(m.Tb) * dt);
    if (m.Tb > 290 && !lc.over) { lc.over = true; ctx.remark({ key: 'overheat', severity: 'minor', points: 0.5, text: L('прибор перегрет выше 290 °C без необходимости — наблюдение возгонки было возможно уже при 200–230 °C', 'құрал қажетсіз 290 °C-тан жоғары қыздырылды — сублимацияны 200–230 °C-та-ақ бақылауға болатын еді', 'apparatus overheated above 290 °C for no reason — sublimation could be seen at 200–230 °C') }); }
  },
  readouts: (S, lc) => [
    { label: L('Блок', 'Блок', 'Block'), value: n(lc.m.Tb, 1) + ' °C', st: lc.m.Tb > 290 ? 'bad' : lc.m.Tb >= 200 ? 'ok' : '' },
    { label: L('В капилляре', 'Капиллярда', 'In the capillary'), value: !lc.m.inside ? '—' : lc.sub > 0.08 ? L('кристаллы, налёт возгона выше слоя', 'кристалдар, қабаттан жоғары сублимат жабындысы', 'crystals, sublimate above the layer') : L('белые кристаллы, не плавятся', 'ақ кристалдар, балқымайды', 'white crystals, not melting') },
  ],
  events: [{
    id: 'nomelt', when: (S, lc) => lc.m.Tb >= 215 && lc.sub > 0.05,
    title: L('Вещество не плавится', 'Зат балқымайды', 'The solid is not melting'),
    text: L('Блок нагрет выше 210 °C. Кристаллы не плавятся, слой постепенно уменьшается, а на стенках капилляра выше пробы появляется белый налёт. Что вы сделаете?', 'Блок 210 °C-тан жоғары қызды. Кристалдар балқымайды, қабат біртіндеп азаяды, ал сынамадан жоғары капилляр қабырғаларында ақ жабынды пайда болады. Не істейсіз?', 'The block is above 210 °C. The crystals do not melt, the layer slowly shrinks and a white deposit appears on the capillary walls above the sample. What do you do?'),
    options: [
      { ok: true, label: L('Выключить нагрев и записать: не плавится, возгоняется', 'Қыздыруды өшіріп, жазу: балқымайды, сублимацияланады', 'Switch off the heating and record: does not melt, sublimes'), effect(S, lc) { lc.c.heat = false; lc.rec = true; },
        log: L('Фумаровая кислота при нагревании до ≈ 220 °C в открытом капилляре не плавится; слой уменьшается, выше пробы оседает белый налёт возгона', 'Фумар қышқылы ашық капиллярда ≈ 220 °C-қа дейін қыздырғанда балқымайды; қабат азаяды, сынамадан жоғары сублиматтың ақ жабындысы тұнады', 'In an open capillary fumaric acid does not melt on heating to about 220 °C; the layer shrinks and a white sublimate settles above the sample') },
      { ok: false, severity: 'minor', points: 0.5, label: L('Продолжать нагрев до 300 °C, пока не расплавится', 'Балқығанша 300 °C-қа дейін қыздыруды жалғастыру', 'Keep heating to 300 °C until it melts'), remark: L('нагрев продолжен в ожидании плавления, хотя вещество возгоняется', 'зат сублимацияланса да, балқуды күтіп қыздыру жалғастырылды', 'heating continued waiting for melting although the solid was subliming'),
        whatif: L('В открытом капилляре фумаровая кислота не плавится: она возгоняется (и частично дегидратируется), пока проба не исчезнет. Температуру плавления (≈ 287 °C) определяют только в запаянном капилляре.', 'Ашық капиллярда фумар қышқылы балқымайды: сынама жойылғанша ол сублимацияланады (және жартылай дегидратацияланады). Балқу температурасын (≈ 287 °C) тек дәнекерленген капиллярда анықтайды.', 'In an open capillary fumaric acid does not melt: it sublimes (and partly dehydrates) until the sample is gone. Its m.p. (≈ 287 °C) is measured only in a sealed capillary.'), effect(S, lc) { lc.c.heat = false; lc.rec = true; lc.sub = Math.max(lc.sub, 0.7); } },
      { ok: false, severity: 'major', label: L('Записать «т. пл. 215 °C» — слой ведь уменьшился', '«Балқу t 215 °C» деп жазу — қабат азайды ғой', 'Record “m.p. 215 °C” — the layer did shrink'), remark: L('уменьшение слоя при возгонке принято за плавление — неверное наблюдение', 'сублимация кезінде қабаттың азаюы балқу деп қабылданды — қате бақылау', 'shrinking of the layer by sublimation mistaken for melting — wrong observation'),
        whatif: L('При плавлении в капилляре появляется прозрачная жидкость. Здесь её нет: вещество переходит в пар, минуя жидкость, и оседает выше — это возгонка.', 'Балқығанда капиллярда мөлдір сұйықтық пайда болады. Мұнда ол жоқ: зат сұйықтықты айналып өтіп буға айналады және жоғарырақ тұнады — бұл сублимация.', 'Melting gives a clear liquid in the capillary. There is none here: the solid passes into vapour without melting and settles higher up — that is sublimation.'), effect(S, lc) { lc.c.heat = false; lc.rec = true; S.fumWrong = true; } },
    ],
  }],
  done: (S, lc) => lc.rec && { text: L('Наблюдение записано.', 'Бақылау жазылды.', 'Observation recorded.') },
  onLeave(S, ctx) { S.fumHeat = { maxT: Math.round((ctx.local.maxT || 220)), sub: ctx.local.sub }; },
  scene: (S, lc) => scene(capApparatus(lc.m || { Tb: 25 }, { layer: 2.5, sub: lc.sub || 0 })),
};

/* ---------------------------------------------------------------- 7. вывод */
const s7 = {
  type: 'quiz', id: 'q-prop',
  title: L('Объяснение различий в свойствах', 'Қасиеттердегі айырмашылықтарды түсіндіру', 'Explaining the differences'),
  instr: L('<p>Свяжите наблюдаемые свойства со строением изомеров (вопросы 7 и 8 для самоконтроля).</p>', '<p>Байқалған қасиеттерді изомерлердің құрылысымен байланыстырыңыз (өзін-өзі бақылаудың 7 және 8-сұрақтары).</p>', '<p>Link the properties you observed to the structure of the isomers (self-control questions 7 and 8).</p>'),
  need: L('Ответьте на все вопросы', 'Барлық сұраққа жауап беріңіз', 'Answer all the questions'),
  questions: [
    { q: L('Почему малеиновая кислота плавится ниже и лучше растворима в воде, чем фумаровая?', 'Неге малеин қышқылы фумар қышқылынан төмен балқиды және суда жақсы ериді?', 'Why does maleic acid melt lower and dissolve better in water than fumaric acid?'),
      options: [L('В малеиновой кислоте есть внутримолекулярная водородная связь, молекулы упакованы менее плотно; фумаровая образует прочную сетку межмолекулярных водородных связей', 'Малеин қышқылында молекулаішілік сутектік байланыс бар, молекулалар тығыз емес оралған; фумар қышқылы молекулааралық сутектік байланыстардың берік торын түзеді', 'Maleic acid has an intramolecular hydrogen bond and packs less efficiently; fumaric acid forms a strong network of intermolecular hydrogen bonds'), L('У малеиновой кислоты больше молярная масса', 'Малеин қышқылының молярлық массасы үлкен', 'Maleic acid has the higher molar mass'), L('Фумаровая кислота неполярна, поэтому не растворяется', 'Фумар қышқылы полюссіз, сондықтан ерімейді', 'Fumaric acid is non-polar and therefore insoluble'), L('Малеиновая кислота — соль', 'Малеин қышқылы — тұз', 'Maleic acid is a salt')],
      correct: 0, why: L('Методичка, опыт 2, «Принцип».', 'Әдістеме, 2-тәжірибе, «Принцип».', 'Manual, experiment 2, “Principle”.') },
    { q: L('Почему малеиновая кислота сильнее фумаровой по первой ступени (pKa₁ 1,9 и 3,0)?', 'Неге малеин қышқылы бірінші сатысы бойынша фумар қышқылынан күшті (pKa₁ 1,9 және 3,0)?', 'Why is maleic acid the stronger acid in the first step (pKa₁ 1.9 vs 3.0)?'),
      options: [L('Её моноанион стабилизирован внутримолекулярной водородной связью', 'Оның моноанионы молекулаішілік сутектік байланыспен тұрақтандырылған', 'Its monoanion is stabilised by an intramolecular hydrogen bond'), L('В ней больше карбоксильных групп', 'Онда карбоксил топтары көп', 'It has more carboxyl groups'), L('Она лучше растворима', 'Ол жақсы ериді', 'It is more soluble'), L('Двойная связь в ней сопряжена слабее', 'Ондағы қос байланыс әлсіз түйіндескен', 'Its double bond is less conjugated')],
      correct: 0, why: L('Методичка, раздел 3.1.', 'Әдістеме, 3.1-бөлім.', 'Manual, section 3.1.') },
    { q: L('Почему при нагревании малеиновая кислота образует циклический ангидрид, а фумаровая — нет?', 'Неге қыздырғанда малеин қышқылы циклдік ангидрид түзеді, ал фумар қышқылы — жоқ?', 'Why does maleic acid form a cyclic anhydride on heating while fumaric acid does not?'),
      options: [L('В цис-изомере две группы COOH сближены и могут отщепить воду с замыканием цикла; в транс-изомере они по разные стороны', 'Цис-изомерде екі COOH тобы жақындасқан және циклді тұйықтай суды бөле алады; транс-изомерде олар екі жақта', 'In the cis isomer the two COOH groups are close and can lose water to close a ring; in the trans isomer they are on opposite sides'), L('Фумаровая кислота при нагревании разлагается до CO₂', 'Фумар қышқылы қыздырғанда CO₂-ге дейін ыдырайды', 'Fumaric acid decomposes to CO₂ on heating'), L('Малеиновая кислота сильнее', 'Малеин қышқылы күштірек', 'Maleic acid is stronger'), L('Ангидриды образуют все дикарбоновые кислоты одинаково', 'Ангидридтерді барлық дикарбон қышқылдары бірдей түзеді', 'All dicarboxylic acids form anhydrides equally easily')],
      correct: 0, why: L('Это химический метод установления относительной конфигурации (таблица методов, раздел 3.2).', 'Бұл салыстырмалы конфигурацияны анықтаудың химиялық әдісі (әдістер кестесі, 3.2-бөлім).', 'This is a chemical method for establishing relative configuration (table of methods, section 3.2).') },
  ],
};

export default {
  id: '2',
  title: L('Сравнение физических свойств малеиновой и фумаровой кислот', 'Малеин және фумар қышқылдарының физикалық қасиеттерін салыстыру', 'Comparison of the physical properties of maleic and fumaric acids'),
  principle: L('Цис-транс-изомеры — диастереомеры с разными физическими свойствами. Малеиновая кислота образует внутримолекулярную водородную связь и менее плотно упакована в кристалле, поэтому гораздо лучше растворима в воде и плавится ниже фумаровой, молекулы которой образуют прочную сетку межмолекулярных водородных связей.',
    'Цис-транс-изомерлер — физикалық қасиеттері әртүрлі диастереомерлер. Малеин қышқылы молекулаішілік сутектік байланыс түзеді және кристалда тығыз емес оралған, сондықтан суда әлдеқайда жақсы ериді және молекулалары молекулааралық сутектік байланыстардың берік торын түзетін фумар қышқылынан төмен балқиды.',
    'cis–trans isomers are diastereomers with different physical properties. Maleic acid forms an intramolecular hydrogen bond and packs less efficiently in the crystal, so it is much more soluble in water and melts lower than fumaric acid, whose molecules form a strong intermolecular hydrogen-bonded network.'),
  equation: [],
  initialState: ({ rng }) => ({ mMal: 0, mFum: 0, hotWater: false, sol: null, cap: { ground: false, loose: 0, packed: 0 }, mp: {}, mpJit: +rng.range(-0.4, 0.5).toFixed(2), fumHeat: null, fumWrong: false }),
  checkpoints: [0],
  steps: [s0, s1, s2, s3, s4, s5, s6, s7],
  results(S) {
    return { mMal: S.mMal, mFum: S.mFum, hot: S.hotWater, solMal: S.sol ? S.sol.mal : null, solFum: S.sol ? S.sol.fum : null, mp: (S.mp || {}).mal || null, fumMax: S.fumHeat ? S.fumHeat.maxT : null, fumWrong: S.fumWrong };
  },
  summary: (r) => [
    { label: L('Растворимость', 'Ерігіштік', 'Solubility'), value: r.solMal != null ? { ru: `мал. ${Math.round(r.solMal * 100)} % / фум. ${Math.round(r.solFum * 100)} %`, kk: `мал. ${Math.round(r.solMal * 100)} % / фум. ${Math.round(r.solFum * 100)} %`, en: `mal. ${Math.round(r.solMal * 100)} % / fum. ${Math.round(r.solFum * 100)} %` } : '—', st: r.hot ? 'warn' : 'ok' },
    { label: L('Т. пл. малеиновой', 'Малеин балқу t', 'M.p. of maleic'), value: r.mp ? `${n(r.mp.on, 1)}–${n(r.mp.end, 1)} °C` : '—', st: r.mp && r.mp.on >= 129.5 && r.mp.end <= 136 ? 'ok' : 'warn' },
    { label: L('Фумаровая', 'Фумар', 'Fumaric'), value: r.fumWrong ? L('ошибочно «т. пл.»', 'қате «балқу t»', 'wrongly “m.p.”') : L('возгоняется', 'сублимацияланады', 'sublimes'), st: r.fumWrong ? 'warn' : 'ok' },
  ],
};
