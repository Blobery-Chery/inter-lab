/** Опыт 4. Азосочетание с 2-нафтолом (реакция без выделения азота). Методичка, раздел 6, опыт 4. */
import { L } from '../../app/i18n.js';

const DYE = '#d0461c';

const t1 = {
  type: 'test', id: 'couple',
  title: L('Азосочетание с 2-нафтолом', '2-Нафтолмен азоқосылу', 'Azo coupling with 2-naphthol'),
  instr: L('<ol><li>Растворите около <b>0,1 г</b> 2-нафтола в <b>2 мл 10 % NaOH</b> и охладите раствор во льду.</li><li>Прибавьте <b>1 мл</b> холодного раствора соли диазония (вторая порция из опыта 1), встряхивая.</li></ol><p class="note">2-Нафтол вреден — перчатки, вытяжной шкаф.</p>',
    '<ol><li>Шамамен <b>0,1 г</b> 2-нафтолды <b>2 мл 10 % NaOH</b>-та ерітіп, ерітіндіні мұзда салқындатыңыз.</li><li>Шайқай отырып, диазоний тұзының суық ерітіндісінен <b>1 мл</b> (1-тәжірибедегі екінші порция) қосыңыз.</li></ol><p class="note">2-Нафтол зиянды — қолғап, тартпа шкаф.</p>',
    '<ol><li>Dissolve about <b>0.1 g</b> of 2-naphthol in <b>2 mL of 10 % NaOH</b> and cool the solution in ice.</li><li>Add <b>1 mL</b> of the cold diazonium solution (the second portion from experiment 1) with shaking.</li></ol><p class="note">2-Naphthol is harmful — gloves, fume hood.</p>'),
  need: L('Получите азокраситель', 'Азобояғыш алыңыз', 'Make the azo dye'),
  tubes: [{ id: 'n', label: L('пробирка', 'пробирка', 'test tube'), init: { v: 0 } }],
  indicator: true, reset: true,
  reagents: [
    { id: 'naph', group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('2-Нафтол, ~0,1 г', '2-Нафтол, ~0,1 г', '2-Naphthol, ~0.1 g'), advance: 60, disabled: (t) => t.naph,
      apply(t, S, ctx) { t.naph = true; t.solid = t.base ? 0 : 0.5; ctx.log(L('В пробирку внесено около 0,1 г 2-нафтола (белые кристаллы)', 'Пробиркаға шамамен 0,1 г 2-нафтол (ақ кристалдар) салынды', 'About 0.1 g of 2-naphthol (white crystals) put into the tube')); } },
    { id: 'naoh', group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('10 % NaOH, 2 мл', '10 % NaOH, 2 мл', '10 % NaOH, 2 mL'), advance: 60, disabled: (t) => t.base || t.water || t.acid,
      apply(t, S, ctx) { t.base = true; t.v += 2; t.pH = 13.7; if (t.naph) t.solid = 0; t.color = 'rgba(235,230,200,.45)'; ctx.log(t.naph ? L('2-Нафтол растворился в 2 мл 10 % NaOH (нафтолят натрия)', '2-Нафтол 2 мл 10 % NaOH-та еріді (натрий нафтоляты)', '2-Naphthol dissolved in 2 mL of 10 % NaOH (sodium naphthoxide)') : L('В пробирку налито 2 мл 10 % NaOH', 'Пробиркаға 2 мл 10 % NaOH құйылды', '2 mL of 10 % NaOH put into the tube')); } },
    { id: 'water', group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('Вода, 2 мл', 'Су, 2 мл', 'Water, 2 mL'), advance: 30, disabled: (t) => t.base || t.water || t.acid,
      apply(t, S, ctx) { t.water = true; t.v += 2; t.pH = 6.5; ctx.log(L('В пробирку налито 2 мл воды; 2-нафтол почти не растворяется', 'Пробиркаға 2 мл су құйылды; 2-нафтол еріген жоқ дерлік', '2 mL of water added; the 2-naphthol hardly dissolves')); } },
    { id: 'hcl', group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('10 % HCl, 2 мл', '10 % HCl, 2 мл', '10 % HCl, 2 mL'), advance: 30, disabled: (t) => t.base || t.water || t.acid,
      apply(t, S, ctx) { t.acid = true; t.v += 2; t.pH = 0; /* 10 % HCl ≈ 2,9 моль/л → индикатор pH ≈ 0 */ ctx.log(L('В пробирку налито 2 мл 10 % HCl; 2-нафтол не растворяется', 'Пробиркаға 2 мл 10 % HCl құйылды; 2-нафтол ерімейді', '2 mL of 10 % HCl added; the 2-naphthol does not dissolve')); } },
    { id: 'ice', group: L('Охлаждение', 'Салқындату', 'Cooling'), label: L('Охладить пробирку во льду', 'Пробирканы мұзда салқындату', 'Cool the tube in ice'), advance: 120, disabled: (t) => t.cold,
      apply(t, S, ctx) { t.cold = true; ctx.log(L('Пробирка охлаждена во льду', 'Пробирка мұзда салқындатылды', 'Tube cooled in ice')); } },
    { id: 'diaz', group: L('Сочетание', 'Қосылу', 'Coupling'), label: L('Холодный раствор соли диазония, 1 мл', 'Диазоний тұзының суық ерітіндісі, 1 мл', 'Cold diazonium solution, 1 mL'), advance: 60, disabled: (t) => t.dz,
      apply(t, S, ctx) {
        t.dz = true; t.v += 1;
        if (!t.naph) { t.color = 'rgba(236,222,150,.5)'; ctx.feedback(L('В пробирке нет азосоставляющей (2-нафтола) — сочетаться не с чем. Вылейте и повторите.', 'Пробиркада азоқұраушы (2-нафтол) жоқ — қосылатын ештеңе жоқ. Төгіп, қайталаңыз.', 'There is no coupling component (2-naphthol) in the tube — nothing to couple with. Empty it and repeat.'), 'bad'); return; }
        if (t.acid) {
          ctx.remark({ key: 'acidC', severity: 'minor', text: L('азосочетание пытались провести в кислой среде — 2-нафтол не сочетается', 'азоқосылуды қышқыл ортада жүргізуге тырысты — 2-нафтол қосылмайды', 'azo coupling attempted in acid — 2-naphthol does not couple') });
          t.color = 'rgba(236,222,150,.5)'; t.solid = 0.5;
          ctx.log(L('В кислой среде окраски почти нет, нафтол остаётся нерастворённым', 'Қышқыл ортада түс жоқ дерлік, нафтол ерімей қалады', 'In acid there is hardly any colour; the naphthol stays undissolved'), 'obs');
          ctx.feedback(L('В кислой среде 2-нафтол не ионизирован и не сочетается: нужен нафтолят-ион. Вылейте и повторите в щелочной среде.', 'Қышқыл ортада 2-нафтол иондалмайды және қосылмайды: нафтолят-ион қажет. Төгіп, сілтілі ортада қайталаңыз.', 'In acid 2-naphthol is not ionised and does not couple: the naphthoxide ion is needed. Empty the tube and repeat in alkali.'), 'bad');
          return;
        }
        if (t.water || !t.base) {
          ctx.remark({ key: 'waterC', severity: 'minor', text: L('2-нафтол не растворён в щёлочи — сочетание идёт плохо', '2-нафтол сілтіде ерітілмеген — қосылу нашар жүреді', '2-naphthol not dissolved in alkali — coupling is poor') });
          t.ppt = 0.15; t.pptColor = '#e08a3a'; t.color = 'rgba(236,200,140,.5)';
          ctx.log(L('Лишь слабое оранжевое окрашивание на поверхности кристаллов нафтола', 'Нафтол кристалдарының бетінде тек әлсіз қызғылт сары түс', 'Only a faint orange colour on the surface of the naphthol crystals'), 'obs');
          ctx.feedback(L('Окраска слабая: нафтол не растворён, нафтолят-иона нет. Вылейте и растворите нафтол в 10 % NaOH.', 'Түс әлсіз: нафтол ерімеген, нафтолят-ион жоқ. Төгіп, нафтолды 10 % NaOH-та ерітіңіз.', 'The colour is faint: the naphthol is not dissolved, so there is no naphthoxide ion. Empty the tube and dissolve the naphthol in 10 % NaOH.'), 'bad');
          return;
        }
        const k = Math.max(0.35, Math.min(1, S.q));
        t.ppt = k; t.pptColor = DYE; t.color = 'rgba(230,110,40,.5)'; t.good = true;
        if (!t.cold) {
          ctx.remark({ key: 'warmC', severity: 'minor', text: L('раствор нафтола не охлаждён — часть соли диазония разложилась с выделением азота', 'нафтол ерітіндісі салқындатылмаған — диазоний тұзының бір бөлігі азот бөле ыдырады', 'naphthol solution not cooled — some diazonium salt decomposed with loss of nitrogen') });
          t.gas = true; t.pptColor = '#a63c1c'; t.ppt = k * 0.8;
        }
        S.e4 = { ok: true, cold: !!t.cold, k };
      } },
  ],
  done: (tubes) => !!tubes.n.good,
  observe: {
    question: L('Что образовалось в пробирке?', 'Пробиркада не түзілді?', 'What has formed in the tube?'),
    options: [
      { id: 'dye', label: L('Сразу выпал оранжево-красный осадок азокрасителя', 'Азобояғыштың қызғылт сары-қызыл тұнбасы бірден түзілді', 'An orange-red precipitate of the azo dye formed at once'), log: (S) => (S.e4 && S.e4.cold
        ? L('Сразу выпал обильный оранжево-красный осадок 1-фенилазо-2-нафтола; газ не выделяется', '1-Фенилазо-2-нафтолдың мол қызғылт сары-қызыл тұнбасы бірден түзілді; газ бөлінбейді', 'An abundant orange-red precipitate of 1-phenylazo-2-naphthol formed at once; no gas is evolved')
        : L('Выпал оранжево-красный осадок азокрасителя с бурым оттенком; заметны пузырьки газа (частичное разложение соли диазония в тёплом растворе)', 'Қоңыр реңкті азобояғыштың қызғылт сары-қызыл тұнбасы түзілді; газ көпіршіктері байқалады (жылы ерітіндіде диазоний тұзының ішінара ыдырауы)', 'An orange-red precipitate of the azo dye with a brownish tinge formed; gas bubbles are seen (partial decomposition of the diazonium salt in the warm solution)')) },
      { id: 'white', label: L('Белый осадок', 'Ақ тұнба', 'A white precipitate') },
      { id: 'gas', label: L('Бурное выделение газа, осадка нет', 'Қарқынды газ бөлінуі, тұнба жоқ', 'Vigorous gas evolution, no precipitate') },
      { id: 'blue', label: L('Синее окрашивание раствора', 'Ерітіндінің көк түске боялуы', 'A blue colour in the solution') },
    ],
    correct: () => 'dye',
    why: () => L('Катион диазония — слабый электрофил; он атакует сильно активированный нафтолят-ион в положение 1 — образуется окрашенное азосоединение, азот не выделяется.', 'Диазоний катионы — әлсіз электрофил; ол қатты белсендірілген нафтолят-ионға 1-жағдайда шабуыл жасайды — боялған азоқосылыс түзіледі, азот бөлінбейді.', 'The diazonium ion is a weak electrophile; it attacks the strongly activated naphthoxide ion at position 1 to form a coloured azo compound; no nitrogen is lost.'),
  },
};

const t2 = {
  type: 'quiz', id: 'q4',
  title: L('Вопросы к опыту 4', '4-тәжірибеге сұрақтар', 'Questions on experiment 4'),
  instr: L('<p>Ответьте на вопросы преподавателя.</p>', '<p>Оқытушының сұрақтарына жауап беріңіз.</p>', '<p>Answer the instructor’s questions.</p>'),
  need: L('Ответьте на вопросы', 'Сұрақтарға жауап беріңіз', 'Answer the questions'),
  questions: [
    { q: L('Почему азосочетание с 2-нафтолом проводят в щелочной среде?', 'Неліктен 2-нафтолмен азоқосылуды сілтілі ортада жүргізеді?', 'Why is azo coupling with 2-naphthol carried out in alkaline solution?'),
      options: [L('В щёлочи образуется нафтолят-ион — гораздо более сильный нуклеофил, чем нейтральный нафтол', 'Сілтіде нафтолят-ион түзіледі — ол бейтарап нафтолға қарағанда әлдеқайда күшті нуклеофил', 'In alkali the naphthoxide ion forms — a much stronger nucleophile than neutral naphthol'), L('Щёлочь разрушает соль диазония', 'Сілті диазоний тұзын бұзады', 'Alkali destroys the diazonium salt'), L('Щёлочь окрашивает продукт', 'Сілті өнімді бояйды', 'Alkali colours the product'), L('В кислой среде азокраситель растворяется', 'Қышқыл ортада азобояғыш ериді', 'The azo dye dissolves in acid')],
      correct: 0, why: L('Фенолы сочетаются в слабощелочной среде (методичка, раздел 3.2): атакует фенолят (нафтолят)-ион.', 'Фенолдар әлсіз сілтілі ортада қосылады (әдістеме, 3.2-бөлім): фенолят (нафтолят)-ион шабуыл жасайды.', 'Phenols couple in weakly alkaline medium (manual, section 3.2): the phenoxide (naphthoxide) ion is attacked.') },
    { q: L('На какой реакции основана фармакопейная проба на первичную ароматическую аминогруппу (сульфаниламиды, новокаин, анестезин)?', 'Біріншілік ароматты амин тобына фармакопеялық сынама (сульфаниламидтер, новокаин, анестезин) қандай реакцияға негізделген?', 'Which reaction is the basis of the pharmacopoeial test for a primary aromatic amino group (sulfonamides, procaine, benzocaine)?'),
      options: [L('Диазотирование с последующим азосочетанием с 2-нафтолом (оранжево-красный краситель)', 'Диазоттау, содан кейін 2-нафтолмен азоқосылу (қызғылт сары-қызыл бояғыш)', 'Diazotization followed by azo coupling with 2-naphthol (orange-red dye)'), L('Реакция с FeCl₃ (фиолетовое окрашивание)', 'FeCl₃-пен реакция (күлгін түс)', 'Reaction with FeCl₃ (violet colour)'), L('Бромирование до белого осадка', 'Ақ тұнбаға дейін бромдау', 'Bromination to a white precipitate'), L('Реакция серебряного зеркала', 'Күміс айна реакциясы', 'The silver mirror reaction')],
      correct: 0, why: L('Методичка, раздел 1 и опыт 4: та же последовательность — диазотирование и сочетание с 2-нафтолом.', 'Әдістеме, 1-бөлім және 4-тәжірибе: дәл сол реттілік — диазоттау және 2-нафтолмен қосылу.', 'Manual, section 1 and experiment 4: the same sequence — diazotization and coupling with 2-naphthol.') },
    { q: L('В какое положение 2-нафтола вступает азогруппа?', '2-Нафтолдың қай жағдайына азотоп енеді?', 'Which position of 2-naphthol does the azo group enter?'),
      options: [L('В положение 1', '1-жағдайға', 'Position 1'), L('В положение 3', '3-жағдайға', 'Position 3'), L('В положение 6', '6-жағдайға', 'Position 6'), L('Замещает группу OH', 'OH тобын орынбасады', 'It replaces the OH group')],
      correct: 0, why: L('Сочетание идёт в положение 1 (методичка, опыт 4): образуется 1-фенилазо-2-нафтол.', 'Қосылу 1-жағдайға жүреді (әдістеме, 4-тәжірибе): 1-фенилазо-2-нафтол түзіледі.', 'Coupling goes to position 1 (manual, experiment 4): 1-phenylazo-2-naphthol is formed.') },
  ],
};

const DRY = {
  ru: 'В открытом стакане вода испаряется, и на стенках остаётся сухая соль диазония. Сухие соли диазония взрываются от удара, трения или нагревания — достаточно задеть стакан. По правилам (методичка, раздел 7) неиспользованный раствор соли диазония разрушают сразу: нагревают в вытяжном шкафу до прекращения выделения азота и сливают в ёмкость для водных отходов. В реальной лаборатории о таком нарушении сообщают преподавателю; остаток осторожно смывают водой, не соскабливая.',
  kk: 'Ашық стақанда су буланып, қабырғаларында құрғақ диазоний тұзы қалады. Құрғақ диазоний тұздары соққыдан, үйкелуден немесе қыздырудан жарылады — стақанды қағып кету жеткілікті. Ереже бойынша (әдістеме, 7-бөлім) пайдаланылмаған диазоний тұзының ерітіндісін бірден ыдыратады: тартпа шкафта азоттың бөлінуі тоқтағанша қыздырып, сулы қалдықтар ыдысына құяды. Нақты зертханада мұндай бұзушылық туралы оқытушыға хабарлайды; қалдықты қырмай, абайлап сумен шаяды.',
  en: 'In an open beaker the water evaporates and dry diazonium salt is left on the walls. Dry diazonium salts explode on impact, friction or heating — knocking the beaker is enough. By the rules (manual, section 7) unused diazonium solution is destroyed at once: it is warmed in the fume hood until nitrogen evolution stops and poured into the aqueous waste. In a real lab such a violation is reported to the instructor; the residue is carefully rinsed away with water, never scraped.',
};

const t3 = {
  type: 'decide', id: 'destroy',
  title: L('Остаток раствора соли диазония', 'Диазоний тұзы ерітіндісінің қалдығы', 'Leftover diazonium solution'),
  instr: L('<p>В пробирке осталось немного раствора соли диазония. Что с ним сделать (методичка, раздел 7)?</p>', '<p>Пробиркада диазоний тұзының аздаған ерітіндісі қалды. Онымен не істеу керек (әдістеме, 7-бөлім)?</p>', '<p>A little diazonium solution is left in the tube. What do you do with it (manual, section 7)?</p>'),
  need: L('Выберите действие', 'Әрекетті таңдаңыз', 'Choose the action'),
  question: L('Как поступить с неиспользованным раствором соли диазония?', 'Пайдаланылмаған диазоний тұзының ерітіндісімен не істейді?', 'What do you do with unused diazonium solution?'),
  options: [
    { id: 'warm', ok: true, label: L('Нагреть в вытяжном шкафу до прекращения выделения азота, затем — в ёмкость для водных отходов', 'Тартпа шкафта азоттың бөлінуі тоқтағанша қыздырып, содан кейін — сулы қалдықтар ыдысына', 'Warm it in the fume hood until nitrogen evolution stops, then into the aqueous waste'), advance: 300, why: L('соль диазония разрушают нагреванием, не давая ей высохнуть', 'диазоний тұзын құрғатпай, қыздыру арқылы ыдыратады', 'the diazonium salt is destroyed by warming, never allowed to dry'),
      log: L('Остаток раствора соли диазония нагрет в вытяжном шкафу до прекращения выделения азота и слит в ёмкость для водных отходов', 'Диазоний тұзы ерітіндісінің қалдығы тартпа шкафта азоттың бөлінуі тоқтағанша қыздырылып, сулы қалдықтар ыдысына құйылды', 'The leftover diazonium solution was warmed in the hood until nitrogen evolution stopped and poured into the aqueous waste') },
    { id: 'sink', ok: false, severity: 'safety', retry: true, label: L('Вылить в раковину и смыть водой', 'Раковинаға төгіп, сумен шаю', 'Pour it down the sink and rinse with water'), remark: L('раствор соли диазония вылит в раковину (пп. 10.2–10.3 правил ТБ)', 'диазоний тұзының ерітіндісі раковинаға төгілді (ҚТ ережелерінің 10.2–10.3-тармақтары)', 'diazonium solution poured down the sink (safety rules 10.2–10.3)'), whatif: L('В сифоне раковины соль диазония может накапливаться и высыхать, а кислые растворы с ароматическими соединениями в канализацию не сливают. Сначала разрушить нагреванием, затем — в ёмкость для отходов.', 'Раковина сифонында диазоний тұзы жиналып, құрғап қалуы мүмкін, ал ароматты қосылыстары бар қышқыл ерітінділерді кәрізге төкпейді. Алдымен қыздырып ыдырату, содан кейін — қалдық ыдысына.', 'Diazonium salt can collect and dry out in the sink trap, and acidic solutions of aromatic compounds are not poured into the drains. Destroy it by warming first, then into the waste container.') },
    { id: 'keep', ok: false, label: L('Оставить в открытом стакане в шкафу — пригодится на следующем занятии', 'Ашық стақанда шкафта қалдыру — келесі сабақта керек болады', 'Leave it in an open beaker in the cupboard — it will be useful next time'), remark: L('раствор соли диазония оставлен высыхать в открытом сосуде', 'диазоний тұзының ерітіндісі ашық ыдыста құрғауға қалдырылды', 'diazonium solution left to dry out in an open vessel'), critical: { text: DRY } },
  ],
};

const t4 = {
  type: 'cleanup', id: 'waste4',
  title: L('Уборка рабочего места', 'Жұмыс орнын жинау', 'Clearing up'),
  instr: L('<p>Утилизируйте содержимое пробирок опытов 3 и 4 и использованную бумагу (раздел 10 правил ТБ), выключите баню, вымойте руки.</p>', '<p>3 және 4-тәжірибелердің пробиркаларындағыны және пайдаланылған қағазды кәдеге жаратыңыз (ҚТ ережелерінің 10-бөлімі), моншаны өшіріп, қолыңызды жуыңыз.</p>', '<p>Dispose of the contents of the tubes from experiments 3 and 4 and the used paper (safety rules, section 10), switch off the bath and wash your hands.</p>'),
  need: L('Утилизируйте всё и выключите приборы', 'Бәрін кәдеге жаратып, құралдарды өшіріңіз', 'Dispose of everything and switch off the equipment'),
  bins: ['acid', 'organic', 'halogen', 'solid', 'sink', 'trash'],
  items: [
    { id: 'tbp', bin: 'halogen', label: L('Пробирка опыта 3: трибромфенол и бромная вода', '3-тәжірибе пробиркасы: трибромфенол және бромды су', 'Tube from experiment 3: tribromophenol and bromine water'), wrong: { sink: { severity: 'safety', text: L('бромсодержащие отходы — в раковину (п. 10.2 правил ТБ)', 'құрамында бром бар қалдықтар — раковинаға (ҚТ ережелерінің 10.2-тармағы)', 'bromine-containing waste down the sink (safety rule 10.2)') } } },
    { id: 'dye', bin: 'acid', label: L('Пробирка опыта 4: азокраситель в щелочном растворе', '4-тәжірибе пробиркасы: сілтілі ерітіндідегі азобояғыш', 'Tube from experiment 4: azo dye in alkaline solution') },
    { id: 'paper', bin: 'solid', label: L('Иодкрахмальная и индикаторная бумага', 'Иодкрахмал және индикатор қағазы', 'Starch–iodide and indicator paper'), wrong: { trash: { severity: 'minor', text: L('бумага с реактивами — в бытовой мусор (п. 10.4 правил ТБ)', 'реактивтері бар қағаз — тұрмыстық қоқысқа (ҚТ ережелерінің 10.4-тармағы)', 'paper with reagents in the general rubbish (safety rule 10.4)') } } },
  ],
  switches: [
    { id: 'bath', label: L('Выключить водяную баню', 'Су моншасын өшіру', 'Switch off the water bath'), log: L('Водяная баня выключена', 'Су моншасы өшірілді', 'Water bath switched off') },
    { id: 'hood', label: L('Убрать реактивы, закрыть экран шкафа', 'Реактивтерді жинап, шкаф экранын жабу', 'Put the reagents away, close the hood sash'), log: L('Реактивы убраны, экран шкафа закрыт', 'Реактивтер жиналды, шкаф экраны жабылды', 'Reagents put away, hood sash closed') },
    { id: 'hands', label: L('Вымыть руки с мылом', 'Қолды сабынмен жуу', 'Wash hands with soap'), log: L('Руки вымыты с мылом', 'Қол сабынмен жуылды', 'Hands washed with soap') },
  ],
};

export default {
  id: '4',
  title: L('Азосочетание с 2-нафтолом (реакция без выделения азота)', '2-Нафтолмен азоқосылу (азот бөлінбейтін реакция)', 'Azo coupling with 2-naphthol (reaction without loss of nitrogen)'),
  principle: L('Катион диазония сочетается с 2-нафтолят-ионом в положение 1 с образованием оранжево-красного азокрасителя 1-фенилазо-2-нафтола; азот не выделяется.', 'Диазоний катионы 2-нафтолят-ионмен 1-жағдайда қосылып, қызғылт сары-қызыл 1-фенилазо-2-нафтол азобояғышын түзеді; азот бөлінбейді.', 'The diazonium ion couples with the 2-naphthoxide ion at position 1 to form the orange-red azo dye 1-phenylazo-2-naphthol; no nitrogen is lost.'),
  equation: ['C₆H₅N₂⁺ Cl⁻ + C₁₀H₇OH + NaOH → C₆H₅–N=N–C₁₀H₆OH↓ + NaCl + H₂O'],
  initialState: ({ prev }) => {
    const r = prev['1'] || { Dz: 24, nAn: 25 };
    return { q: r.nAn ? r.Dz / r.nAn : 0.9, e4: null };
  },
  checkpoints: [0, 2],
  steps: [t1, t2, t3, t4],
  results: (S) => ({ ok: !!(S.e4 && S.e4.ok), cold: !!(S.e4 && S.e4.cold) }),
  summary: (r) => [
    { label: L('Азокраситель', 'Азобояғыш', 'Azo dye'), value: r.ok ? L('оранжево-красный осадок', 'қызғылт сары-қызыл тұнба', 'orange-red precipitate') : '—', st: r.ok ? 'ok' : '' },
  ],
};
