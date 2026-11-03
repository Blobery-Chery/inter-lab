/**
 * Работа № 6–7. Карбоновые кислоты. Получение м-нитробензойной кислоты.
 * Источник: docs/source/labs/lab-06-07.md (методичка) и прототип автора reference/lab06-07-m-nitrobenzoic-acid.html.
 */
import { L, n } from '../../app/i18n.js';
import bank from './admission.js';
import exp1 from './exp1.js';
import exp2 from './exp2.js';
import exp3 from './exp3.js';
import { theoretical, percentYield } from './model.js';

const g = (x, d = 4) => n(x, d);

export default {
  id: 'lab-06-07', number: '06-07', display: '6–7', status: 'ready',
  title: L('Карбоновые кислоты. Получение м-нитробензойной кислоты', 'Карбон қышқылдары. м-Нитробензой қышқылын алу', 'Carboxylic acids. Preparation of m-nitrobenzoic acid'),
  topic: L('Карбоновые кислоты: строение, кислотность и электрофильное замещение в ароматических кислотах. Получение м-нитробензойной кислоты.', 'Карбон қышқылдары: құрылысы, қышқылдығы және ароматты қышқылдардағы электрофильді орынбасу. м-Нитробензой қышқылын алу.', 'Carboxylic acids: structure, acidity and electrophilic substitution in aromatic acids. Preparation of m-nitrobenzoic acid.'),
  aim: L('Получить м-нитробензойную кислоту нитрованием бензойной кислоты при строгом контроле температуры, выделить её, подтвердить кислотные свойства и чистоту, рассчитать теоретический и практический выход.', 'Температураны қатаң бақылай отырып, бензой қышқылын нитрлеу арқылы м-нитробензой қышқылын алу, оны бөліп алу, қышқылдық қасиеттері мен тазалығын растау, теориялық және практикалық шығымды есептеу.', 'To prepare m-nitrobenzoic acid by nitration of benzoic acid under strict temperature control, isolate it, confirm its acidic properties and purity, and calculate the theoretical and percent yield.'),
  relevance: L('Карбоксильная группа есть в нестероидных противовоспалительных средствах, аминокислотах, желчных кислотах. Ароматические нитрокислоты — ключевые промежуточные продукты: их восстанавливают до аминобензойных кислот — основы местных анестетиков. Нитрование бензойной кислоты показывает, как заместитель управляет скоростью и ориентацией электрофильного замещения.',
    'Карбоксил тобы стероидты емес қабынуға қарсы дәрілерде, аминқышқылдарында, өт қышқылдарында бар. Ароматты нитроқышқылдар — негізгі аралық өнімдер: оларды жергілікті анестетиктердің негізі болып табылатын аминобензой қышқылдарына дейін тотықсыздандырады. Бензой қышқылын нитрлеу орынбасардың электрофильді орынбасудың жылдамдығы мен бағытын қалай басқаратынын көрсетеді.',
    'The carboxyl group is present in NSAIDs, amino acids and bile acids. Aromatic nitro acids are key intermediates: they are reduced to aminobenzoic acids, the building blocks of local anaesthetics. Nitration of benzoic acid shows how a substituent controls the rate and orientation of electrophilic substitution.'),
  accent: { light: '#1f4fd1', dark: '#86a6ff' },
  requires: ['lab-00'],
  theory: [
    L('<b>Кислотность.</b> В –COOH карбонильная и гидроксильная группы сопряжены (p,π-сопряжение). Заряд карбоксилат-аниона делокализован поровну на двух атомах кислорода, обе связи C–O одинаковы (≈ 0,127 нм). Поэтому карбоновые кислоты (pKa ≈ 4–5) сильнее спиртов (≈ 16) и фенолов (≈ 10), но слабее минеральных кислот. Они реагируют с NaHCO₃ с выделением CO₂ — фенолы и спирты нет.',
      '<b>Қышқылдық.</b> –COOH тобында карбонил және гидроксил топтары түйіндескен (p,π-түйіндесу). Карбоксилат-анион заряды екі оттек атомына бірдей делокализацияланады, екі C–O байланысы бірдей (≈ 0,127 нм). Сондықтан карбон қышқылдары (pKa ≈ 4–5) спирттерден (≈ 16) және фенолдардан (≈ 10) күшті, бірақ минералдық қышқылдардан әлсіз. Олар NaHCO₃-пен CO₂ бөле әрекеттеседі — фенолдар мен спирттер әрекеттеспейді.',
      '<b>Acidity.</b> In –COOH the carbonyl and hydroxyl groups are conjugated (p,π-conjugation). The charge of the carboxylate anion is delocalised equally over both oxygens and both C–O bonds are equal (≈ 0.127 nm). So carboxylic acids (pKa ≈ 4–5) are stronger than alcohols (≈ 16) and phenols (≈ 10) but weaker than mineral acids. They react with NaHCO₃ releasing CO₂ — phenols and alcohols do not.'),
    L('<b>Заместители.</b> Электроноакцепторные группы (–NO₂, –Cl, –CN) стабилизируют анион и повышают кислотность, электронодонорные (–CH₃, –OCH₃, –NH₂) — понижают. pKa: бензойная 4,20; м-нитробензойная 3,45; о-нитробензойная 2,17 (орто-эффект).',
      '<b>Орынбасарлар.</b> Электронакцепторлы топтар (–NO₂, –Cl, –CN) анионды тұрақтандырып, қышқылдықты арттырады, электрондонорлы топтар (–CH₃, –OCH₃, –NH₂) — төмендетеді. pKa: бензой 4,20; м-нитробензой 3,45; о-нитробензой 2,17 (орто-эффект).',
      '<b>Substituents.</b> Electron-withdrawing groups (–NO₂, –Cl, –CN) stabilise the anion and increase acidity; electron-donating groups (–CH₃, –OCH₃, –NH₂) decrease it. pKa: benzoic 4.20; m-nitrobenzoic 3.45; o-nitrobenzoic 2.17 (ortho effect).'),
    L('<b>Нитрование.</b> –COOH оттягивает электронную плотность (−I, −M): кольцо дезактивировано, замещение идёт в мета-положение. Электрофил — катион нитрония: HNO₃ + 2H₂SO₄ → NO₂⁺ + H₃O⁺ + 2HSO₄⁻. NO₂⁺ образует σ-комплекс (арений-ион), который теряет протон. При орто- и пара-атаке одна резонансная структура несёт «+» на атоме C, связанном с –COOH, поэтому преобладает мета-продукт: ≈ 80 % мета, 19 % орто, 1–2 % пара. Низкая температура подавляет динитрование и окисление.',
      '<b>Нитрлеу.</b> –COOH электрон тығыздығын тартады (−I, −M): сақина пассивтенген, орынбасу мета-жағдайға жүреді. Электрофил — нитроний катионы: HNO₃ + 2H₂SO₄ → NO₂⁺ + H₃O⁺ + 2HSO₄⁻. NO₂⁺ σ-кешен (арений-ион) түзеді, ол протонын жоғалтады. Орто- және пара-шабуылда бір резонанстық құрылым –COOH-пен байланысқан C атомында «+» алады, сондықтан мета-өнім басым: ≈ 80 % мета, 19 % орто, 1–2 % пара. Төмен температура динитрлеу мен тотығуды басады.',
      '<b>Nitration.</b> –COOH withdraws electron density (−I, −M): the ring is deactivated and substitution goes meta. The electrophile is the nitronium ion: HNO₃ + 2H₂SO₄ → NO₂⁺ + H₃O⁺ + 2HSO₄⁻. NO₂⁺ forms a σ-complex (arenium ion), which loses a proton. On ortho and para attack one resonance structure puts “+” on the carbon bearing –COOH, so the meta product predominates: ≈ 80 % meta, 19 % ortho, 1–2 % para. Low temperature suppresses dinitration and oxidation.'),
  ],
  reagents: [
    { id: 'ba', name: L('Бензойная кислота', 'Бензой қышқылы', 'Benzoic acid'), formula: 'C₆H₅COOH', conc: L('2,0 г (16,4 ммоль)', '2,0 г (16,4 ммоль)', '2.0 g (16.4 mmol)'), hazard: ['irritant'] },
    { id: 'h2so4', name: L('Серная кислота конц.', 'Күкірт қышқылы конц.', 'Sulfuric acid, conc.'), formula: 'H₂SO₄', conc: L('96–98 %, d 1,84; 5 + 1,5 мл', '96–98 %, d 1,84; 5 + 1,5 мл', '96–98 %, d 1.84; 5 + 1.5 mL'), hazard: ['corrosive'] },
    { id: 'hno3', name: L('Азотная кислота конц.', 'Азот қышқылы конц.', 'Nitric acid, conc.'), formula: 'HNO₃', conc: L('65–68 %, d 1,40; 1,5 мл', '65–68 %, d 1,40; 1,5 мл', '65–68 %, d 1.40; 1.5 mL'), hazard: ['corrosive', 'oxidiser'] },
    { id: 'ice', name: L('Колотый лёд, дистиллированная вода', 'Уатылған мұз, дистилденген су', 'Crushed ice, distilled water'), formula: 'H₂O', conc: L('30–40 г льда', '30–40 г мұз', '30–40 g of ice'), hazard: [] },
    { id: 'nahco3', name: L('Гидрокарбонат натрия', 'Натрий гидрокарбонаты', 'Sodium hydrogen carbonate'), formula: 'NaHCO₃', conc: L('5–10 % раствор', '5–10 % ерітінді', '5–10 % solution'), hazard: [] },
    { id: 'naoh', name: L('Гидроксид натрия', 'Натрий гидроксиді', 'Sodium hydroxide'), formula: 'NaOH', conc: L('10 % раствор', '10 % ерітінді', '10 % solution'), hazard: ['corrosive'] },
    { id: 'hcl', name: L('Хлороводородная кислота', 'Хлорсутек қышқылы', 'Hydrochloric acid'), formula: 'HCl', conc: L('10 % раствор', '10 % ерітінді', '10 % solution'), hazard: ['corrosive'] },
    { id: 'fecl3', name: L('Хлорид железа(III)', 'Темір(III) хлориді', 'Iron(III) chloride'), formula: 'FeCl₃', conc: L('3 % раствор', '3 % ерітінді', '3 % solution'), hazard: ['irritant'] },
  ],
  equipment: ['conical-50', 'thermometer-100', 'dropping-pipette', 'ice-salt-bath', 'glass-rod', 'cylinder-10', 'buchner', 'filter-flask', 'water-pump', 'beaker-100', 'beaker-150', 'hot-plate', 'test-tube', 'mp-apparatus', 'capillary', 'balance', 'weighing-boat', 'watch-glass', 'indicator-paper', 'fume-hood', 'goggles', 'gloves'],
  safety: [
    L('Нитрующая смесь (конц. HNO₃ + H₂SO₄) крайне едкая и сильный окислитель. Только в вытяжном шкафу; HNO₃ приливают к H₂SO₄ медленно, при охлаждении.', 'Нитрлеуші қоспа (конц. HNO₃ + H₂SO₄) өте күйдіргіш және күшті тотықтырғыш. Тек тартпа шкафта; HNO₃-ті H₂SO₄-ке баяу, салқындата отырып құяды.', 'The nitrating mixture (conc. HNO₃ + H₂SO₄) is extremely corrosive and a strong oxidiser. Fume hood only; add HNO₃ to H₂SO₄ slowly, with cooling.'),
    L('Нитрование сильно экзотермично: прибавлять по каплям, температура ниже 10 °C. Перегрев — побочные реакции и ядовитые бурые пары NO₂.', 'Нитрлеу қатты экзотермиялық: тамшылатып қосу, температура 10 °C-тан төмен. Қызып кету — қосымша реакциялар және улы қоңыр NO₂ булары.', 'Nitration is strongly exothermic: add dropwise, keep below 10 °C. Overheating means side reactions and toxic brown NO₂ fumes.'),
    L('Кислую смесь выливают на лёд — никогда не приливают воду к концентрированной кислотной смеси.', 'Қышқыл қоспаны мұзға төгеді — концентрлі қышқыл қоспасына ешқашан су құймайды.', 'Pour the acid mixture onto ice — never add water to the concentrated acid mixture.'),
    L('Нитросоединения токсичны и всасываются через кожу: избегайте контакта, мойте руки после работы.', 'Нитроқосылыстар улы және тері арқылы сіңеді: жанасудан аулақ болыңыз, жұмыстан кейін қолды жуыңыз.', 'Nitro compounds are toxic and absorbed through the skin: avoid contact and wash your hands after work.'),
    L('Халат, защитные очки и перчатки — всё время; еда и напитки в лаборатории запрещены.', 'Халат, қорғаныс көзілдірігі және қолғап — үнемі; зертханада тамақ пен сусынға тыйым салынған.', 'Lab coat, goggles and gloves at all times; no food or drink in the laboratory.'),
    L('До начала работы знайте, где фонтанчик для глаз, аварийный душ и огнетушитель.', 'Жұмыс басталғанға дейін көз жуатын фонтан, апаттық душ және өрт сөндіргіш қай жерде екенін біліңіз.', 'Know where the eyewash station, safety shower and fire extinguisher are before starting.'),
    L('Кислые фильтраты и промывные воды — в ёмкость для кислотных отходов.', 'Қышқыл фильтраттар мен жуынды сулар — қышқыл қалдықтар ыдысына.', 'Acidic filtrates and washings go into the acid waste container.'),
  ],
  admission: { pick: 5, pass: 4, bank },
  experiments: [exp1, exp2, exp3],

  report: {
    experiments: {
      1: {
        reagents: (r) => [
          L(`бензойная кислота — ${g(r.mBA)} г (${n((r.mBA / 122.12) * 1000, 1)} ммоль)`, `бензой қышқылы — ${g(r.mBA)} г (${n((r.mBA / 122.12) * 1000, 1)} ммоль)`, `benzoic acid — ${g(r.mBA)} g (${n((r.mBA / 122.12) * 1000, 1)} mmol)`),
          L(`H₂SO₄ конц. — ${n(r.vAcid, 1)} мл + 1.5 мл`, `H₂SO₄ конц. — ${n(r.vAcid, 1)} мл + 1.5 мл`, `conc. H₂SO₄ — ${n(r.vAcid, 1)} mL + 1.5 mL`),
          L('HNO₃ конц. — 1.5 мл', 'HNO₃ конц. — 1.5 мл', 'conc. HNO₃ — 1.5 mL'),
          L(`лёд — ${r.ice} г`, `мұз — ${r.ice} г`, `ice — ${r.ice} g`),
          L(`вода для перекристаллизации — ${r.recV} мл`, `қайта кристалдауға арналған су — ${r.recV} мл`, `water for recrystallisation — ${r.recV} mL`),
        ],
        conditions: (r) => L(`Прибавление нитрующей смеси — ${r.tAdd != null ? n(r.tAdd, 1) : '—'} мин, максимальная температура ${n(r.maxT, 1)} °C${r.hot > 0 ? `, выше 10 °C — ${n(r.hot / 60, 1)} мин` : ''}.`,
          `Нитрлеуші қоспаны қосу — ${r.tAdd != null ? n(r.tAdd, 1) : '—'} мин, ең жоғары температура ${n(r.maxT, 1)} °C${r.hot > 0 ? `, 10 °C-тан жоғары — ${n(r.hot / 60, 1)} мин` : ''}.`,
          `Nitrating mixture added over ${r.tAdd != null ? n(r.tAdd, 1) : '—'} min, maximum temperature ${n(r.maxT, 1)} °C${r.hot > 0 ? `, above 10 °C for ${n(r.hot / 60, 1)} min` : ''}.`),
        calculations: (r) => [
          L(`m(теор.) = ${g(r.mBA)} г × 167.12 / 122.12 = ${n(r.th, 3)} г`, `m(теор.) = ${g(r.mBA)} г × 167.12 / 122.12 = ${n(r.th, 3)} г`, `m(theor.) = ${g(r.mBA)} g × 167.12 / 122.12 = ${n(r.th, 3)} g`),
          `η = ${g(r.mFin)} / ${n(r.th, 3)} × 100 % = ${n(r.yield, 1)} %`,
        ],
        conclusion: (r) => L(`Нитрованием бензойной кислоты нитрующей смесью получена м-нитробензойная кислота (${r.white ? 'белые игольчатые кристаллы' : 'бледно-жёлтые кристаллы'}) с выходом ${n(r.yield, 1)} %. Группа –COOH (−I, −M) дезактивирует кольцо и направляет нитрогруппу в мета-положение; ${r.maxT <= 10 ? 'температура не превышала 10 °C, поэтому побочные динитрование и окисление сведены к минимуму' : 'перегрев выше 10 °C привёл к побочному динитрованию и окислению'}.`,
          `Бензой қышқылын нитрлеуші қоспамен нитрлеу арқылы м-нитробензой қышқылы (${r.white ? 'ақ ине тәрізді кристалдар' : 'ақшыл сары кристалдар'}) ${n(r.yield, 1)} % шығыммен алынды. –COOH тобы (−I, −M) сақинаны пассивтендіріп, нитротопты мета-жағдайға бағыттайды; ${r.maxT <= 10 ? 'температура 10 °C-тан аспады, сондықтан қосымша динитрлеу мен тотығу ең аз деңгейде болды' : '10 °C-тан жоғары қызу қосымша динитрлеу мен тотығуға әкелді'}.`,
          `Nitration of benzoic acid with the nitrating mixture gave m-nitrobenzoic acid (${r.white ? 'white needle-like crystals' : 'pale yellow crystals'}) in ${n(r.yield, 1)} % yield. The –COOH group (−I, −M) deactivates the ring and directs the nitro group to the meta position; ${r.maxT <= 10 ? 'the temperature never exceeded 10 °C, so dinitration and oxidation were kept to a minimum' : 'overheating above 10 °C caused some dinitration and oxidation'}.`),
      },
      2: {
        reagents: () => [L('продукт (несколько кристаллов, ~0.1 г), бензойная кислота', 'өнім (бірнеше кристал, ~0.1 г), бензой қышқылы', 'product (a few crystals, ~0.1 g), benzoic acid'), L('NaHCO₃ 5–10 % — 2 × 1.5 мл; NaOH 10 % — 1.5 мл и 4 капли; HCl 10 % и 1 % — по каплям; FeCl₃ 3 % — 3 капли', 'NaHCO₃ 5–10 % — 2 × 1.5 мл; NaOH 10 % — 1.5 мл және 4 тамшы; HCl 10 % және 1 % — тамшылап; FeCl₃ 3 % — 3 тамшы', 'NaHCO₃ 5–10 % — 2 × 1.5 mL; NaOH 10 % — 1.5 mL and 4 drops; HCl 10 % and 1 % — dropwise; FeCl₃ 3 % — 3 drops')],
        conclusion: () => L('Продукт разлагает NaHCO₃ с выделением CO₂, растворяется в щёлочи и вновь осаждается кислотой, с FeCl₃ в нейтральной среде даёт основную соль железа(III) — это карбоновая кислота. Фенол растворился бы в NaOH, но не выделял бы CO₂ из NaHCO₃.',
          'Өнім NaHCO₃-ті CO₂ бөле ыдыратады, сілтіде ериді және қышқылмен қайта тұнбаға түседі, бейтарап ортада FeCl₃-пен темір(III) негіздік тұзын береді — бұл карбон қышқылы. Фенол NaOH-та ерір еді, бірақ NaHCO₃-тен CO₂ бөлмес еді.',
          'The product liberates CO₂ from NaHCO₃, dissolves in alkali and is reprecipitated by acid, and gives a basic iron(III) salt with FeCl₃ in neutral solution — it is a carboxylic acid. A phenol would dissolve in NaOH but would not liberate CO₂ from NaHCO₃.'),
      },
      3: {
        reagents: (r) => [L(`продукт опыта 1; капилляр, слой ${n(r.layer || 0, 1)} мм; бензойная кислота (для сравнения)`, `1-тәжірибенің өнімі; капилляр, қабат ${n(r.layer || 0, 1)} мм; бензой қышқылы (салыстыру үшін)`, `product of experiment 1; capillary, layer ${n(r.layer || 0, 1)} mm; benzoic acid (for comparison)`)],
        conclusion: (r) => {
          const ok = r.mp && r.mp.on >= 138.5 && r.mp.end <= 142.5;
          const mp = r.mp ? `${n(r.mp.on, 1)}–${n(r.mp.end, 1)}` : '—';
          const ba = r.ba ? `${n(r.ba.on, 1)}–${n(r.ba.end, 1)}` : null;
          return L(`Т. пл. продукта ${mp} °C (лит. 140–141 °C)${ba ? `, бензойной кислоты ${ba} °C (лит. 122 °C)` : ''}. ${ok ? 'Узкий интервал, близкий к литературному, подтверждает подлинность и чистоту м-нитробензойной кислоты.' : 'Заниженный или растянутый интервал указывает на примеси (орто-изомер, динитропроизводные, влага) — нужна повторная перекристаллизация.'}`,
            `Өнімнің балқу t ${mp} °C (әдеб. 140–141 °C)${ba ? `, бензой қышқылының ${ba} °C (әдеб. 122 °C)` : ''}. ${ok ? 'Әдебиеттегі мәнге жақын тар аралық м-нитробензой қышқылының түпнұсқалығы мен тазалығын растайды.' : 'Төмендеген немесе созылған аралық қоспалардың (орто-изомер, динитро туындылар, ылғал) барын көрсетеді — қайта кристалдау қажет.'}`,
            `M.p. of the product ${mp} °C (lit. 140–141 °C)${ba ? `; benzoic acid ${ba} °C (lit. 122 °C)` : ''}. ${ok ? 'A narrow range close to the literature value confirms the identity and purity of m-nitrobenzoic acid.' : 'A low or broad range points to impurities (ortho isomer, dinitro compounds, moisture) — the product should be recrystallised again.'}`);
        },
      },
    },
    table: {
      columns: [L('Вещество', 'Зат', 'Compound'), L('Внешний вид', 'Сыртқы түрі', 'Appearance'), L('Масса, г', 'Массасы, г', 'Mass, g'), L('Выход, %', 'Шығым, %', 'Yield, %'), L('Т. пл. найд., °C', 'Балқу t, табылған, °C', 'M.p. observed, °C'), L('Т. пл. лит., °C', 'Балқу t, әдеб., °C', 'M.p. lit., °C'), L('Проба с NaHCO₃', 'NaHCO₃ сынамасы', 'NaHCO₃ test')],
      rows: (R) => {
        const r1 = R['1'] || {}, r2 = R['2'] || {}, r3 = R['3'] || {};
        return [
          [L('Бензойная кислота (исходное)', 'Бензой қышқылы (бастапқы зат)', 'Benzoic acid (starting material)'), L('белые кристаллы', 'ақ кристалдар', 'white crystals'), r1.mBA ? g(r1.mBA) : '—', '—', r3.ba ? `${n(r3.ba.on, 1)}–${n(r3.ba.end, 1)}` : '—', '122', r2.a ? L('+ (CO₂)', '+ (CO₂)', '+ (CO₂)') : '—'],
          [L('м-Нитробензойная кислота (продукт)', 'м-Нитробензой қышқылы (өнім)', 'm-Nitrobenzoic acid (product)'), r1.white ? L('белые игольчатые кристаллы', 'ақ ине тәрізді кристалдар', 'white needle-like crystals') : L('бледно-жёлтые кристаллы', 'ақшыл сары кристалдар', 'pale yellow crystals'), r1.mFin ? g(r1.mFin) : '—', r1.mFin ? n(r1.yield, 1) : '—', r3.mp ? `${n(r3.mp.on, 1)}–${n(r3.mp.end, 1)}` : '—', '140–141', r2.a ? L('+ (CO₂)', '+ (CO₂)', '+ (CO₂)') : '—'],
        ];
      },
    },
    losses: {
      from: '1',
      labels: {
        product: L('выделено продукта', 'бөлінген өнім', 'product isolated'),
        side: L('побочные продукты: орто/пара-изомеры, динитрование, окисление', 'қосымша өнімдер: орто/пара-изомерлер, динитрлеу, тотығу', 'by-products: ortho/para isomers, dinitration, oxidation'),
        unreacted: L('не прореагировало (короткая выдержка)', 'әрекеттеспеді (қысқа ұстау)', 'unreacted (short holding)'),
        handling: L('потери при выливании и фильтровании', 'төгу және сүзу кезіндегі шығын', 'lost on pouring and filtration'),
        mother: L('осталось в маточном растворе', 'аналық ерітіндіде қалды', 'left in the mother liquor'),
        other: L('прочие потери', 'басқа шығындар', 'other losses'),
      },
      colors: { product: 'var(--good)', side: '#d9a33a', unreacted: '#8a96a3', handling: 'var(--bad)', mother: '#5b8fd0', other: '#b06ab3' },
    },
    extra: (R) => {
      const out = [], r1 = R['1'] || {}, r3 = R['3'] || {};
      if (r1.mFin && r1.yield < 45) out.push({ text: L('низкий выход продукта (менее 45 %)', 'өнімнің төмен шығымы (45 %-дан аз)', 'low product yield (below 45 %)'), points: 1 });
      if (r3.mp && r3.mp.on < 137) out.push({ text: L('продукт загрязнён: т. пл. занижена и растянута', 'өнім ластанған: балқу t төмендеген және созылған', 'impure product: m.p. low and broad'), points: 1 });
      return out;
    },
    assignment: [
      { id: 'th', kind: 'calc', task: L('Рассчитайте теоретический выход м-нитробензойной кислоты из 2,0 г бензойной кислоты, г.', '2,0 г бензой қышқылынан м-нитробензой қышқылының теориялық шығымын есептеңіз, г.', 'Calculate the theoretical yield of m-nitrobenzoic acid from 2.0 g of benzoic acid, g.'), answer: () => theoretical(2.0), unit: L('г', 'г', 'g'), tol: 0.01, decimals: 2 },
      { id: 'eta', kind: 'calc', task: L('Рассчитайте выход в процентах по выделенной вами массе продукта.', 'Өзіңіз бөліп алған өнім массасы бойынша пайыздық шығымды есептеңіз.', 'Calculate the percent yield from the mass of product you isolated.'), answer: (R) => percentYield((R['1'] || {}).mFin || 0, (R['1'] || {}).mBA || 2), unit: '%', tol: 0.01, decimals: 1 },
      { id: 'mech', kind: 'order', task: L('Расставьте стадии механизма нитрования бензойной кислоты по порядку.', 'Бензой қышқылын нитрлеу механизмінің сатыларын ретімен орналастырыңыз.', 'Put the stages of the nitration mechanism of benzoic acid in order.'),
        items: [
          { id: 'a', label: L('H₂SO₄ протонирует HNO₃', 'H₂SO₄ HNO₃-ті протондайды', 'H₂SO₄ protonates HNO₃') },
          { id: 'b', label: L('Отщепляется вода, образуется катион нитрония NO₂⁺', 'Су бөлініп, NO₂⁺ нитроний катионы түзіледі', 'Water is lost and the nitronium ion NO₂⁺ forms') },
          { id: 'c', label: L('NO₂⁺ атакует мета-положение кольца — образуется σ-комплекс', 'NO₂⁺ сақинаның мета-жағдайына шабуыл жасайды — σ-кешен түзіледі', 'NO₂⁺ attacks the meta position — the σ-complex forms') },
          { id: 'd', label: L('σ-Комплекс теряет протон — ароматичность восстанавливается', 'σ-Кешен протонын жоғалтады — ароматтылық қалпына келеді', 'The σ-complex loses a proton — aromaticity is restored') },
        ] },
      { id: 'mb', kind: 'choice', task: L('Основной продукт нитрования метилбензоата:', 'Метилбензоатты нитрлеудің негізгі өнімі:', 'Main product of the nitration of methyl benzoate:'),
        options: [L('метил-3-нитробензоат (мета)', 'метил-3-нитробензоат (мета)', 'methyl 3-nitrobenzoate (meta)'), L('метил-4-нитробензоат (пара)', 'метил-4-нитробензоат (пара)', 'methyl 4-nitrobenzoate (para)'), L('смесь орто- и пара-изомеров поровну', 'орто- және пара-изомерлердің тең қоспасы', 'equal amounts of ortho and para isomers')], correct: 0,
        why: L('–COOCH₃ — дезактивирующий мета-ориентант, как и –COOH.', '–COOCH₃ — –COOH сияқты пассивтендіретін мета-бағдарлағыш.', '–COOCH₃ is a deactivating meta director, like –COOH.') },
      { id: 'ac', kind: 'choice', task: L('Основной продукт нитрования ацетанилида:', 'Ацетанилидті нитрлеудің негізгі өнімі:', 'Main product of the nitration of acetanilide:'),
        options: [L('3-нитроацетанилид (мета)', '3-нитроацетанилид (мета)', '3-nitroacetanilide (meta)'), L('4-нитроацетанилид (пара), немного орто-', '4-нитроацетанилид (пара), аздап орто-', '4-nitroacetanilide (para), with some ortho'), L('нитрование не идёт', 'нитрлеу жүрмейді', 'no nitration takes place')], correct: 1,
        why: L('–NHCOCH₃ — активирующий орто/пара-ориентант; из-за объёма группы преобладает пара-продукт.', '–NHCOCH₃ — белсендіретін орто/пара-бағдарлағыш; топ көлемді болғандықтан пара-өнім басым.', '–NHCOCH₃ is an activating ortho/para director; the bulky group makes para the main product.') },
      { id: 'cl', kind: 'choice', task: L('Основной продукт нитрования хлорбензола:', 'Хлорбензолды нитрлеудің негізгі өнімі:', 'Main product of the nitration of chlorobenzene:'),
        options: [L('1-хлор-3-нитробензол (мета)', '1-хлор-3-нитробензол (мета)', '1-chloro-3-nitrobenzene (meta)'), L('1-хлор-4-нитробензол (пара) и 1-хлор-2-нитробензол (орто), пара больше', '1-хлор-4-нитробензол (пара) және 1-хлор-2-нитробензол (орто), пара көбірек', '1-chloro-4-nitrobenzene (para) and 1-chloro-2-nitrobenzene (ortho), mostly para'), L('нитробензол', 'нитробензол', 'nitrobenzene')], correct: 1,
        why: L('Галоген дезактивирует кольцо (−I), но направляет в орто/пара-положения (+M).', 'Галоген сақинаны пассивтендіреді (−I), бірақ орто/пара-жағдайларға бағыттайды (+M).', 'Halogen deactivates the ring (−I) but directs ortho/para (+M).') },
      { id: 'free', kind: 'text', task: L('Напишите механизм нитрования бензойной кислоты со всеми резонансными структурами мета-σ-комплекса и объясните, почему мета-σ-комплекс устойчивее орто- и пара-.', 'Бензой қышқылын нитрлеу механизмін мета-σ-кешеннің барлық резонанстық құрылымдарымен жазып, мета-σ-кешеннің орто- және пара-кешендерден неліктен тұрақты екенін түсіндіріңіз.', 'Write the mechanism of nitration of benzoic acid with all resonance structures of the meta σ-complex and explain why the meta σ-complex is more stable than the ortho and para ones.') },
    ],
  },
};
