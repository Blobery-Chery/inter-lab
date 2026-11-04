/** Опыт 4. Проба Толленса (серебряное зеркало). Методичка, раздел 6, опыт 4. */
import { L } from '../../app/i18n.js';
import { scene, tube, tubeRack } from '../../app/scene/svg.js';
import { tubesOf, baseState, cellsSummary, CROSS } from './common.js';
import { benchScene, envOf } from './steps/bench.js';
import { PROPS, look, tollensPrep } from './model.js';

const settled = (S, b) => b.tubes.filter((t) => PROPS[t.sug].reducing).every((t) => ['mirror', 'black'].includes(look('tollens', t, envOf(S)).code));
const rack = () => scene([90, 150, 210, 270].map((x, i) => tube({ id: 'w' + i, cx: x, frac: 0.15, color: 'rgba(205,225,238,.35)' })).join('') + tubeRack(60, 300));

const s0 = {
  type: 'decide', id: 'wash',
  title: L('Чистые пробирки для серебряного зеркала', 'Күміс айнаға арналған таза пробиркалар', 'Clean tubes for the silver mirror'),
  instr: L('<p>Серебряное зеркало осаждается только на чистом, обезжиренном стекле. Как подготовить четыре пробирки?</p>', '<p>Күміс айна тек таза, майсыздандырылған шыныға ғана отырады. Төрт пробирканы қалай дайындайды?</p>', '<p>A silver mirror deposits only on clean, grease-free glass. How do you prepare the four tubes?</p>'),
  need: L('Выберите способ подготовки пробирок', 'Пробиркаларды дайындау тәсілін таңдаңыз', 'Choose how to prepare the tubes'),
  question: L('Как вымыть пробирки для пробы Толленса?', 'Толленс сынамасына пробиркаларды қалай жуады?', 'How do you wash the tubes for Tollens’ test?'),
  scene: rack,
  options: [
    { id: 'naoh', ok: true, label: L('Прокипятить с раствором NaOH (обезжирить), затем тщательно ополоснуть дистиллированной водой', 'NaOH ерітіндісімен қайнатып (майсыздандырып), содан кейін дистилденген сумен мұқият шаю', 'Boil out with NaOH solution (to degrease), then rinse thoroughly with distilled water'),
      why: L('Жир и следы прежних реактивов мешают серебру прилипать к стеклу.', 'Май мен бұрынғы реактивтердің іздері күмістің шыныға жабысуына кедергі келтіреді.', 'Grease and traces of earlier reagents keep the silver from sticking to the glass.'),
      advance: 600, effect(S) { S.clean = true; }, log: L('Пробирки обезжирены горячим раствором NaOH и ополоснуты дистиллированной водой', 'Пробиркалар ыстық NaOH ерітіндісімен майсыздандырылып, дистилденген сумен шайылды', 'Tubes degreased with hot NaOH solution and rinsed with distilled water') },
    { id: 'tap', ok: false, label: L('Ополоснуть водопроводной водой — пробирки и так выглядят чистыми', 'Құбыр суымен шаю — пробиркалар онсыз да таза көрінеді', 'Rinse with tap water — the tubes look clean anyway'),
      whatif: L('На стекле остаётся тонкая жировая плёнка и следы солей: серебро выпадет не зеркалом, а серо-чёрными хлопьями, и проба будет выглядеть «неудачной».', 'Шыныда жұқа май қабыршағы мен тұз іздері қалады: күміс айна болып емес, сұр-қара үлпек болып түседі, сынама «сәтсіз» көрінеді.', 'A thin grease film and traces of salts stay on the glass: the silver will come down not as a mirror but as grey-black flakes, and the test will look “failed”.'),
      advance: 120, effect(S) { S.clean = false; }, log: L('Пробирки ополоснуты водопроводной водой', 'Пробиркалар құбыр суымен шайылды', 'Tubes rinsed with tap water') },
    { id: 'fehl', ok: false, severity: 'minor', retry: true, label: L('Взять пробирки после пробы Фелинга, вылив содержимое', 'Ішіндегісін төгіп, Фелинг сынамасынан кейінгі пробиркаларды алу', 'Use the tubes from Fehling’s test after emptying them'),
      remark: L('для пробы Толленса взяты немытые пробирки с остатками Cu₂O и щелочного реактива', 'Толленс сынамасы үшін Cu₂O мен сілтілі реактив қалдықтары бар жуылмаған пробиркалар алынды', 'unwashed tubes with Cu₂O and alkaline reagent residues used for Tollens’ test'),
      whatif: L('Остатки Cu₂O и органики сами восстанавливают серебро: реактив почернеет во всех пробирках, даже с сахарозой.', 'Cu₂O мен органика қалдықтары күмісті өздері тотықсыздандырады: реактив барлық пробиркада, тіпті сахарозамен де қараяды.', 'The Cu₂O and organic residues reduce silver themselves: the reagent will blacken in every tube, even with sucrose.') },
  ],
};

const s1 = {
  type: 'test', id: 'prep',
  title: L('Приготовление реактива Толленса', 'Толленс реактивін дайындау', 'Preparing Tollens’ reagent'),
  instr: L('<ol><li>В чистую пробирку налейте <b>9 мл 2 % AgNO₃</b> (по 2 мл на пробу и запас).</li><li>Прибавьте <b>1–2 капли 10 % NaOH</b> — выпадет бурый осадок Ag₂O.</li><li>По каплям, встряхивая, прибавляйте <b>разбавленный раствор NH₃</b> только до растворения осадка.</li></ol><p class="note">Реактив готовят непосредственно перед опытом и <b>никогда не хранят</b>: при стоянии он может выделить взрывчатые соединения серебра. Лишний аммиак снижает чувствительность реактива.</p>',
    '<ol><li>Таза пробиркаға <b>9 мл 2 % AgNO₃</b> құйыңыз (әр сынамаға 2 мл және қор).</li><li><b>1–2 тамшы 10 % NaOH</b> қосыңыз — Ag₂O қоңыр тұнбасы түседі.</li><li>Шайқай отырып, тұнба ерігенше ғана <b>сұйылтылған NH₃ ерітіндісін</b> тамшылатып қосыңыз.</li></ol><p class="note">Реактивті тәжірибенің алдында ғана дайындайды және <b>ешқашан сақтамайды</b>: тұрып қалғанда ол күмістің жарылғыш қосылыстарын бөліп шығаруы мүмкін. Артық аммиак реактивтің сезімталдығын төмендетеді.</p>',
    '<ol><li>Put <b>9 mL of 2 % AgNO₃</b> into a clean tube (2 mL per test plus a margin).</li><li>Add <b>1–2 drops of 10 % NaOH</b> — a brown precipitate of Ag₂O forms.</li><li>Add <b>dilute NH₃ solution</b> drop by drop, shaking, only until the precipitate dissolves.</li></ol><p class="note">The reagent is made just before use and <b>never stored</b>: on standing it can deposit explosive silver compounds. Excess ammonia lowers the sensitivity of the reagent.</p>'),
  need: L('Растворите осадок Ag₂O аммиаком', 'Ag₂O тұнбасын аммиакпен ерітіңіз', 'Dissolve the Ag₂O precipitate with ammonia'),
  capacity: 12,
  tubes: [{ id: 'r', label: L('реактив Толленса', 'Толленс реактиві', 'Tollens’ reagent') }],
  reagents: [
    { id: 'ag', label: L('9 мл AgNO₃ 2 %', '9 мл AgNO₃ 2 %', '9 mL of 2 % AgNO₃'), advance: 60, disabled: (t) => t.ag,
      apply(t, S, ctx) { t.ag = 1; t.v = 9; t.color = 'rgba(205,225,238,.35)'; ctx.log(L('В пробирку налито 9 мл 2 % AgNO₃ — бесцветный прозрачный раствор', 'Пробиркаға 9 мл 2 % AgNO₃ құйылды — түссіз мөлдір ерітінді', '9 mL of 2 % AgNO₃ put into the tube — a clear colourless solution')); } },
    { id: 'naoh', label: L('NaOH 10 %: +1 кап.', 'NaOH 10 %: +1 тамшы', 'NaOH 10 %: +1 drop'), group: L('Реактивы по каплям', 'Тамшылатып қосылатын реактивтер', 'Reagents dropwise'), advance: 10,
      apply(t, S, ctx) {
        if (!t.ag) { ctx.feedback(L('Сначала налейте раствор AgNO₃.', 'Алдымен AgNO₃ ерітіндісін құйыңыз.', 'Pour in the AgNO₃ solution first.'), 'warn'); return; }
        S.prep.naoh += 1; t.v += 0.05;
        if (S.prep.naoh > 3) ctx.remark({ key: 'tol-naoh', severity: 'minor', text: L('избыток NaOH при приготовлении реактива Толленса', 'Толленс реактивін дайындағанда NaOH артық', 'too much NaOH when preparing Tollens’ reagent') });
        upd(t, S, ctx);
        if (S.prep.naoh === 1) ctx.log(L('После капли NaOH выпал бурый осадок оксида серебра Ag₂O', 'NaOH тамшысынан кейін күміс оксиді Ag₂O-ның қоңыр тұнбасы түсті', 'A drop of NaOH gave a brown precipitate of silver oxide Ag₂O'), 'obs');
      } },
    { id: 'nh3', label: L('NH₃ разб.: +1 кап.', 'NH₃ сұйыт.: +1 тамшы', 'Dilute NH₃: +1 drop'), group: L('Реактивы по каплям', 'Тамшылатып қосылатын реактивтер', 'Reagents dropwise'), advance: 10,
      apply(t, S, ctx) {
        if (!t.ag) { ctx.feedback(L('Сначала налейте раствор AgNO₃.', 'Алдымен AgNO₃ ерітіндісін құйыңыз.', 'Pour in the AgNO₃ solution first.'), 'warn'); return; }
        if (!S.prep.naoh) { ctx.feedback(L('По методичке сначала NaOH (осадок Ag₂O), затем аммиак.', 'Әдістеме бойынша алдымен NaOH (Ag₂O тұнбасы), содан кейін аммиак.', 'The manual says NaOH first (Ag₂O precipitate), then ammonia.'), 'warn'); return; }
        const was = tollensPrep(S.prep).dissolved;
        S.prep.nh3 += 1; t.v += 0.05;
        upd(t, S, ctx);
        const p = tollensPrep(S.prep);
        if (p.dissolved && !was) ctx.log(L(`После ${S.prep.nh3} капель NH₃ осадок Ag₂O растворился — прозрачный бесцветный раствор [Ag(NH₃)₂]OH`, `${S.prep.nh3} тамшы NH₃-тен кейін Ag₂O тұнбасы еріді — [Ag(NH₃)₂]OH мөлдір түссіз ерітіндісі`, `After ${S.prep.nh3} drops of NH₃ the Ag₂O precipitate dissolved — a clear colourless [Ag(NH₃)₂]OH solution`), 'obs');
        if (p.excess > 0) ctx.feedback(L(`Осадок уже растворился — лишние капли аммиака (${p.excess}) только снижают чувствительность реактива.`, `Тұнба еріп кетті — аммиактың артық тамшылары (${p.excess}) реактивтің сезімталдығын ғана төмендетеді.`, `The precipitate has already dissolved — the extra drops of ammonia (${p.excess}) only lower the sensitivity of the reagent.`), 'warn');
        if (p.excess > 4) ctx.remark({ key: 'tol-nh3', severity: 'minor', text: L('большой избыток аммиака в реактиве Толленса — чувствительность снижена, зеркало образуется медленнее', 'Толленс реактивінде аммиак өте артық — сезімталдық төмендеді, айна баяу түзіледі', 'large excess of ammonia in Tollens’ reagent — lower sensitivity, the mirror forms more slowly') });
      } },
  ],
  done: (tubes, S) => tollensPrep(S.prep).dissolved,
  observe: {
    question: L('Что вы наблюдали при приготовлении реактива?', 'Реактивті дайындағанда не байқадыңыз?', 'What did you observe while preparing the reagent?'),
    options: [
      { id: 'ok', label: L('Бурый осадок Ag₂O, который растворился в аммиаке — прозрачный бесцветный раствор', 'Аммиакта еріген Ag₂O қоңыр тұнбасы — мөлдір түссіз ерітінді', 'A brown Ag₂O precipitate that dissolved in ammonia — a clear colourless solution') },
      { id: 'white', label: L('Белый творожистый осадок, не растворяется', 'Ақ ірімшік тәрізді тұнба, ерімейді', 'A white curdy precipitate that does not dissolve') },
      { id: 'mirror', label: L('Сразу появилось серебряное зеркало', 'Бірден күміс айна пайда болды', 'A silver mirror appeared at once') },
      { id: 'blue', label: L('Ярко-синий раствор', 'Ашық көк ерітінді', 'A deep-blue solution') },
    ],
    correct: () => 'ok',
    why: () => L('2AgNO₃ + 2NaOH → Ag₂O↓ + 2NaNO₃ + H₂O; Ag₂O + 4NH₃ + H₂O → 2[Ag(NH₃)₂]OH — растворимый комплекс диамминсеребра(I).', '2AgNO₃ + 2NaOH → Ag₂O↓ + 2NaNO₃ + H₂O; Ag₂O + 4NH₃ + H₂O → 2[Ag(NH₃)₂]OH — диамминкүміс(I)-тің еритін кешені.', '2AgNO₃ + 2NaOH → Ag₂O↓ + 2NaNO₃ + H₂O; Ag₂O + 4NH₃ + H₂O → 2[Ag(NH₃)₂]OH — the soluble diamminesilver(I) complex.'),
  },
  onDone(S) { S.nh3x = tollensPrep(S.prep).excess; },
  hint1: L('Сначала AgNO₃, затем 1–2 капли NaOH (бурый осадок), затем аммиак по одной капле — пока осадок не исчезнет.', 'Алдымен AgNO₃, содан кейін 1–2 тамшы NaOH (қоңыр тұнба), содан кейін аммиакты бір тамшыдан — тұнба жоғалғанша.', 'First AgNO₃, then 1–2 drops of NaOH (brown precipitate), then ammonia one drop at a time — until the precipitate disappears.'),
  hint2: L('Остановитесь, как только осадок растворится: избыток NH₃ снижает чувствительность реактива.', 'Тұнба еріген бойда тоқтаңыз: NH₃ артығы реактивтің сезімталдығын төмендетеді.', 'Stop as soon as the precipitate dissolves: excess NH₃ lowers the sensitivity of the reagent.'),
  hint3: L('Обычно нужно около 10 капель разбавленного аммиака; следите за осадком на стенде.', 'Әдетте сұйылтылған аммиактың шамамен 10 тамшысы керек; стендтегі тұнбаны қадағалаңыз.', 'About 10 drops of dilute ammonia are usually needed; watch the precipitate on the bench.'),
};
function upd(t, S) {
  const p = tollensPrep(S.prep);
  t.ppt = p.brown; t.pptColor = '#5b3a1f'; t.color = p.brown > 0.05 ? `rgba(120,80,40,${(0.15 + 0.35 * p.brown).toFixed(2)})` : 'rgba(205,225,238,.35)';
}

const s2 = {
  type: 'lab15-bench', id: 'tollens', key: 'tollens', test: 'tollens',
  title: L('Серебряное зеркало', 'Күміс айна', 'The silver mirror'),
  instr: L('<ol><li>В каждую чистую пробирку налейте <b>2 мл</b> свежего реактива Толленса.</li><li>Прибавьте <b>3–5 капель</b> раствора сахара.</li><li>Нагревайте в <b>водяной бане 50–60 °C</b> несколько минут <b>без встряхивания</b>.</li></ol>',
    '<ol><li>Әр таза пробиркаға жаңа Толленс реактивінің <b>2 мл</b>-ін құйыңыз.</li><li>Қант ерітіндісінің <b>3–5 тамшысын</b> қосыңыз.</li><li><b>50–60 °C су моншасында</b> бірнеше минут <b>шайқамай</b> қыздырыңыз.</li></ol>',
    '<ol><li>Put <b>2 mL</b> of fresh Tollens’ reagent into each clean tube.</li><li>Add <b>3–5 drops</b> of the sugar solution.</li><li>Warm in a <b>water bath at 50–60 °C</b> for a few minutes <b>without shaking</b>.</li></ol>'),
  need: L('Получите серебряное зеркало', 'Күміс айна алыңыз', 'Obtain the silver mirror'),
  tubes: tubesOf(),
  baths: ['warm', 'boil'],
  reagents: [
    { id: 'tol', group: L('Реактив Толленса', 'Толленс реактиві', 'Tollens’ reagent'), label: L('2 мл реактива в каждую', 'Әрқайсысына 2 мл реактив', '2 mL of reagent to each'), target: 'all', advance: 60,
      disabled: (S, b) => b.tubes.every((t) => t.tol > 0), when: (t) => (t.tol ? L('Реактив уже налит.', 'Реактив құйылды.', 'The reagent is already in.') : null),
      apply(t) { t.tol = 2; t.v += 2; }, log: L('В каждую пробирку налито 2 мл свежеприготовленного реактива Толленса', 'Әр пробиркаға жаңа дайындалған Толленс реактивінің 2 мл-і құйылды', '2 mL of freshly prepared Tollens’ reagent put into each tube') },
    { id: 'sug', group: L('Растворы сахаров (1–5 %)', 'Қант ерітінділері (1–5 %)', 'Sugar solutions (1–5 %)'), label: L('+4 капли раствора сахара', '+4 тамшы қант ерітіндісі', '+4 drops of sugar solution'), target: 'all', advance: 45,
      disabled: (S, b) => b.tubes.every((t) => t.sugV > 0),
      when: (t) => (!t.tol ? L('Сначала налейте реактив Толленса.', 'Алдымен Толленс реактивін құйыңыз.', 'Pour in Tollens’ reagent first.') : t.sugV ? L('Растворы сахаров уже внесены.', 'Қант ерітінділері салынды.', 'The sugar solutions are already in.') : null),
      apply(t, S) { t.sugV = 0.2; t.v += 0.2; if (S.cross && t.sug === 'suc') { t.cross = true; t.weak = true; } },
      log: (S) => L(`В каждую пробирку прибавлено по 4 капли раствора сахара${S.cross ? ' (одной пипеткой)' : ''}`, `Әр пробиркаға 4 тамшыдан қант ерітіндісі қосылды${S.cross ? ' (бір пипеткамен)' : ''}`, `4 drops of sugar solution added to each tube${S.cross ? ' (with one pipette)' : ''}`) },
    { id: 'shake', group: L('Пробирки', 'Пробиркалар', 'Tubes'), label: L('Встряхнуть пробирки', 'Пробиркаларды шайқау', 'Shake the tubes'), target: 'all', advance: 10, cls: 'ghost',
      when: (t) => (!t.tol ? L('В пробирках ещё нет реактива.', 'Пробиркаларда әлі реактив жоқ.', 'There is no reagent in the tubes yet.') : null),
      apply(t) { t.shaken = 1; }, log: L('Пробирки с реактивом Толленса встряхнуты', 'Толленс реактиві бар пробиркалар шайқалды', 'The tubes with Tollens’ reagent were shaken') },
  ],
  check(S, b, ctx) {
    if (b.tubes.some((t) => t.shaken && t.sugV > 0)) ctx.remark({ key: 'tol-shake', severity: 'major', text: L('пробирки с реактивом Толленса встряхивали — серебро выпадает хлопьями, а не зеркалом', 'Толленс реактиві бар пробиркалар шайқалды — күміс айна емес, үлпек болып түседі', 'the tubes with Tollens’ reagent were shaken — the silver comes down as flakes, not as a mirror'),
      whatif: L('Зеркало растёт на неподвижной стенке из мельчайших зародышей серебра. При встряхивании частицы слипаются в объёме раствора и оседают серо-чёрным осадком.', 'Айна қозғалмайтын қабырғада күмістің ұсақ ұрықтарынан өседі. Шайқағанда бөлшектер ерітінді көлемінде жабысып, сұр-қара тұнба болып шөгеді.', 'The mirror grows on a still wall from tiny silver nuclei. When the tube is shaken the particles clump in the solution and settle as a grey-black precipitate.') });
    if (b.tubes.some((t) => (t.maxT || 0) > 75)) ctx.remark({ key: 'tol-boil', severity: 'major', text: L('проба Толленса нагревалась в кипящей бане вместо 50–60 °C — серебро выпало чёрным осадком', 'Толленс сынамасы 50–60 °C-тың орнына қайнап тұрған моншада қыздырылды — күміс қара тұнба болып түсті', 'Tollens’ test heated in the boiling bath instead of at 50–60 °C — the silver came down as a black precipitate'),
      whatif: L('При кипячении серебро восстанавливается слишком быстро и выпадает в объёме — зеркала нет; горячий аммиачный раствор к тому же выделяет пары NH₃.', 'Қайнатқанда күміс тым тез тотықсызданып, көлемде түседі — айна жоқ; оның үстіне ыстық аммиак ерітіндісі NH₃ буларын бөледі.', 'On boiling the silver is reduced too fast and comes down in the bulk — no mirror; the hot ammoniacal solution also gives off NH₃ vapour.') });
    if (b.tubes.some((t) => t.bath && !(t.sugV > 0))) ctx.feedback(L('В пробирках ещё нет растворов сахаров.', 'Пробиркаларда әлі қант ерітінділері жоқ.', 'There are no sugar solutions in the tubes yet.'), 'warn');
  },
  done: (S, b) => b.tubes.every((t) => t.sugV > 0 && t.heat >= 120) && (settled(S, b) || b.tubes.every((t) => t.heat >= 420)) && L('Картина установилась — можно вынимать пробирки и записывать.', 'Көрініс тұрақтады — пробиркаларды алып, жазуға болады.', 'The picture is settled — take the tubes out and record.'),
  hints: [
    L('Нужна баня 50–60 °C, а не кипящая, и пробирки нельзя встряхивать.', 'Қайнап тұрған емес, 50–60 °C монша керек, пробиркаларды шайқауға болмайды.', 'You need the 50–60 °C bath, not the boiling one, and the tubes must not be shaken.'),
    L('Зеркало появляется за несколько минут; сахароза зеркала не даёт.', 'Айна бірнеше минутта пайда болады; сахароза айна бермейді.', 'The mirror appears within a few minutes; sucrose gives no mirror.'),
    L('«2 мл реактива» → «+4 капли» → «Все пробирки → в баню 50–60 °C», ×10 — ждать ≈ 4 мин.', '«2 мл реактив» → «+4 тамшы» → «Барлық пробирка → 50–60 °C моншаға», ×10 — ≈ 4 мин күту.', '“2 mL of reagent” → “+4 drops” → “All tubes → into the 50–60 °C bath”, ×10 — wait ≈ 4 min.'),
  ],
};

const s3 = {
  type: 'lab15-record', id: 'rec', key: 'tollens', test: 'tollens', saveAs: 'tollens', baths: ['warm'],
  title: L('Наблюдения: проба Толленса', 'Бақылаулар: Толленс сынамасы', 'Observations: Tollens’ test'),
  instr: L('<p>Опишите результат в каждой пробирке.</p>', '<p>Әр пробирканың нәтижесін сипаттаңыз.</p>', '<p>Describe the result in each tube.</p>'),
  need: L('Запишите наблюдение по каждой пробирке', 'Әр пробирка бойынша бақылауды жазыңыз', 'Record the observation for each tube'),
  options: ['mirror', 'black', 'none', 'brown'],
  anomalies: {
    black: { severity: 'major', when: (S, t) => !S.clean && !t.shaken && (t.maxT || 0) <= 75, text: L('серебро выпало хлопьями вместо зеркала: пробирки не обезжирены', 'күміс айнаның орнына үлпек болып түсті: пробиркалар майсыздандырылмаған', 'the silver came down as flakes instead of a mirror: the tubes were not degreased'),
      whatif: L('На жирном стекле зародыши серебра не закрепляются — металл выпадает в объёме серо-чёрным осадком. Перед пробой Толленса пробирки обезжиривают щёлочью и ополаскивают дистиллированной водой.', 'Майлы шыныда күміс ұрықтары бекімейді — металл көлемде сұр-қара тұнба болып түседі. Толленс сынамасының алдында пробиркаларды сілтімен майсыздандырып, дистилденген сумен шаяды.', 'Silver nuclei do not hold on greasy glass — the metal comes down in the bulk as a grey-black precipitate. Before Tollens’ test the tubes are degreased with alkali and rinsed with distilled water.') },
    mirror: CROSS, grey: CROSS,
  },
  why: (t, code) => (code === 'mirror' && t.sug !== 'suc' ? L('Восстанавливающий сахар восстанавливает [Ag(NH₃)₂]⁺ до металлического серебра, которое осаждается на стенках зеркалом.', 'Тотықсыздандырғыш қант [Ag(NH₃)₂]⁺-ті металл күміске дейін тотықсыздандырады, ол қабырғаларға айна болып отырады.', 'The reducing sugar reduces [Ag(NH₃)₂]⁺ to metallic silver, which deposits on the walls as a mirror.') : code === 'none' && t.sug === 'suc' ? L('Сахароза не имеет свободного полуацетального гидроксила — зеркала нет.', 'Сахарозада бос жартылай ацеталь гидроксил жоқ — айна жоқ.', 'Sucrose has no free hemiacetal hydroxyl — no mirror.') : null),
};

const s4 = {
  type: 'decide', id: 'dispose',
  title: L('Остаток реактива Толленса', 'Толленс реактивінің қалдығы', 'Leftover Tollens’ reagent'),
  instr: L('<p>После пробы в пробирке осталось около 1 мл приготовленного реактива Толленса, а в пробирках с пробами — аммиачные растворы серебра.</p>', '<p>Сынамадан кейін пробиркада дайындалған Толленс реактивінің шамамен 1 мл-і, ал сынама пробиркаларында — күмістің аммиак ерітінділері қалды.</p>', '<p>After the test about 1 mL of the prepared Tollens’ reagent is left over, and the test tubes contain ammoniacal silver solutions.</p>'),
  need: L('Решите, что делать с остатками', 'Қалдықтармен не істеу керегін шешіңіз', 'Decide what to do with the residues'),
  question: L('Что сделать с остатком реактива и содержимым пробирок?', 'Реактив қалдығы мен пробиркалардағы қоспаны не істеу керек?', 'What do you do with the leftover reagent and the contents of the tubes?'),
  scene: (S) => benchScene(S, 'tollens', { baths: ['warm'] }),
  options: [
    { id: 'acid', ok: true, label: L('Сразу подкислить разбавленной HNO₃ и слить в ёмкость для отходов тяжёлых металлов', 'Бірден сұйылтылған HNO₃-пен қышқылдап, ауыр металдар қалдығы ыдысына төгу', 'Acidify at once with dilute HNO₃ and pour into the heavy-metal waste container'),
      why: L('Методичка: реактив не хранят; остатки сразу подкисляют и выбрасывают в ёмкость для отходов серебра и меди.', 'Әдістеме: реактивті сақтамайды; қалдықтарды бірден қышқылдап, күміс пен мыс қалдығы ыдысына тастайды.', 'The manual: the reagent is never stored; residues are acidified at once and discarded into the silver and copper waste container.'),
      advance: 120, log: L('Остаток реактива Толленса и содержимое пробирок сразу подкислены разбавленной HNO₃ и слиты в ёмкость для отходов тяжёлых металлов', 'Толленс реактивінің қалдығы мен пробиркалардағы қоспа бірден сұйылтылған HNO₃-пен қышқылданып, ауыр металдар қалдығы ыдысына төгілді', 'The leftover Tollens’ reagent and the contents of the tubes acidified at once with dilute HNO₃ and poured into the heavy-metal waste container'), effect(S) { S.tolDisposed = true; } },
    { id: 'keep', ok: false, label: L('Закрыть пробкой и оставить в шкафу — пригодится на следующем занятии', 'Тығынмен жауып, шкафта қалдыру — келесі сабақта керек болады', 'Stopper it and leave it in the cupboard — it will be useful next time'),
      remark: L('реактив Толленса оставлен на хранение', 'Толленс реактиві сақтауға қалдырылды', 'Tollens’ reagent left in storage'),
      critical: { text: L('Аммиачный раствор серебра при стоянии медленно выделяет чёрный осадок — нитрид и имид серебра («гремучее серебро»). Сухие крупинки взрываются от лёгкого трения или удара — например, когда кто-то откроет пробку или начнёт мыть пробирку. Поэтому реактив Толленса готовят только перед опытом, а остатки сразу подкисляют и выбрасывают.', 'Күмістің аммиак ерітіндісі тұрып қалғанда баяу қара тұнба — күміс нитриді мен имидін («гүрілдек күміс») бөледі. Құрғақ түйіршіктер жеңіл үйкелістен немесе соққыдан жарылады — мысалы, біреу тығынды ашқанда немесе пробирканы жуа бастағанда. Сондықтан Толленс реактивін тек тәжірибе алдында дайындайды, ал қалдықтарды бірден қышқылдап, тастайды.', 'On standing, an ammoniacal silver solution slowly deposits a black precipitate of silver nitride and imide (“fulminating silver”). The dry grains explode at the slightest friction or knock — for instance when someone opens the stopper or starts washing the tube. That is why Tollens’ reagent is made only just before use and the residues are acidified and discarded at once.') } },
    { id: 'sink', ok: false, severity: 'safety', retry: true, label: L('Вылить в раковину и смыть водой', 'Раковинаға төгіп, сумен шаю', 'Pour it down the sink and flush with water'),
      remark: L('соли серебра вылиты в раковину (раздел 7 методички, п. 10.2 правил ТБ)', 'күміс тұздары раковинаға төгілді (әдістеменің 7-бөлімі, ҚТ ережелерінің 10.2-тармағы)', 'silver salts poured down the sink (manual section 7, safety rule 10.2)'),
      whatif: L('Соединения серебра токсичны для водной среды и собираются отдельно, как отходы тяжёлых металлов; неподкисленный аммиачный раствор к тому же может образовать взрывчатый осадок в сифоне.', 'Күміс қосылыстары су ортасы үшін улы, оларды ауыр металдар қалдығы ретінде бөлек жинайды; қышқылданбаған аммиак ерітіндісі сифонда жарылғыш тұнба түзуі де мүмкін.', 'Silver compounds are toxic to aquatic life and are collected separately as heavy-metal waste; an unacidified ammoniacal solution may also form an explosive deposit in the trap.') },
  ],
};

export default {
  id: '4',
  title: L('Проба Толленса (серебряное зеркало)', 'Толленс сынамасы (күміс айна)', 'Tollens’ test (silver mirror)'),
  principle: L('Восстанавливающие сахара восстанавливают комплекс диамминсеребра(I) до металлического серебра.', 'Тотықсыздандырғыш қанттар диамминкүміс(I) кешенін металл күміске дейін тотықсыздандырады.', 'Reducing sugars reduce the diamminesilver(I) complex to metallic silver.'),
  equation: ['2AgNO₃ + 2NaOH → Ag₂O↓ + 2NaNO₃ + H₂O', 'Ag₂O + 4NH₃ + H₂O → 2[Ag(NH₃)₂]OH', 'CH₂OH–(CHOH)₄–CHO + 2[Ag(NH₃)₂]OH → CH₂OH–(CHOH)₄–COONH₄ + 2Ag↓ + 3NH₃ + H₂O'],
  initialState: (a) => baseState(a, { prep: { naoh: 0, nh3: 0, need: a.rng ? a.rng.int(9, 13) : 10 }, nh3x: 0 }),
  checkpoints: [0, 2, 4],
  steps: [s0, s1, s2, s3, s4],
  results: (S) => ({ cells: S.res, crossSeen: !!S.crossSeen, clean: S.clean !== false, nh3: S.prep.nh3, nh3x: S.nh3x || 0 }),
  summary: (r) => cellsSummary(r, 'tollens'),
};
