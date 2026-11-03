/** Опыт 5. Проба Барфёда (моносахариды и дисахариды). Методичка, раздел 6, опыт 5. */
import { L } from '../../app/i18n.js';
import { tubesOf, sugarReagent, baseState, cellsSummary } from './common.js';
import { envOf } from './steps/bench.js';
import { simulate } from './model.js';

const s0 = {
  type: 'lab15-bench', id: 'barfoed', key: 'barfoed', test: 'barfoed',
  title: L('Проба Барфёда', 'Барфёд сынамасы', 'Barfoed’s test'),
  instr: L('<ol><li>К <b>2 мл реактива Барфёда</b> (ацетат меди(II) в разбавленной уксусной кислоте) прибавьте <b>1 мл</b> раствора сахара: глюкозы, фруктозы, мальтозы.</li><li><b>Все пробирки одновременно</b> поставьте в кипящую водяную баню и отмечайте по секундомеру, когда появится красный осадок.</li><li>Наблюдение прекращают через <b>5 минут</b>.</li></ol>',
    '<ol><li><b>2 мл Барфёд реактивіне</b> (сұйылтылған сірке қышқылындағы мыс(II) ацетаты) қант ерітіндісінің <b>1 мл</b>-ін қосыңыз: глюкоза, фруктоза, мальтоза.</li><li><b>Барлық пробирканы бір мезгілде</b> қайнап тұрған су моншасына қойып, қызыл тұнбаның қашан пайда болатынын секундомермен белгілеңіз.</li><li>Бақылауды <b>5 минуттан</b> кейін тоқтатады.</li></ol>',
    '<ol><li>To <b>2 mL of Barfoed’s reagent</b> (copper(II) acetate in dilute acetic acid) add <b>1 mL</b> of the sugar solution: glucose, fructose, maltose.</li><li>Place <b>all the tubes in the boiling water bath at the same time</b> and note on the stopwatch when a red precipitate appears.</li><li>Stop the observation after <b>5 minutes</b>.</li></ol>'),
  need: L('Нагрейте все пробирки одновременно и наблюдайте 5 мин', 'Барлық пробирканы бір мезгілде қыздырып, 5 мин бақылаңыз', 'Heat all tubes together and watch for 5 min'),
  tubes: tubesOf(['glu', 'fru', 'mal']),
  baths: ['boil'], single: true,
  reagents: [
    { id: 'bar', group: L('Реактив Барфёда', 'Барфёд реактиві', 'Barfoed’s reagent'), label: L('2 мл реактива в каждую', 'Әрқайсысына 2 мл реактив', '2 mL of reagent to each'), target: 'all', advance: 60,
      disabled: (S, b) => b.tubes.every((t) => t.bar > 0), when: (t) => (t.bar ? L('Реактив уже налит.', 'Реактив құйылды.', 'The reagent is already in.') : null),
      apply(t) { t.bar = 2; t.v += 2; }, log: L('В каждую пробирку налито 2 мл реактива Барфёда — прозрачный голубой раствор', 'Әр пробиркаға 2 мл Барфёд реактиві құйылды — мөлдір көгілдір ерітінді', '2 mL of Barfoed’s reagent put into each tube — a clear pale-blue solution') },
    sugarReagent(1),
  ],
  onBath(S, b, ctx, kind, moved) {
    if (b.sw > 10 && moved.length < b.tubes.length) ctx.remark({ key: 'barf-seq', severity: 'minor', text: L('пробирки поставлены в баню не одновременно — времена появления осадка нельзя сравнивать', 'пробиркалар моншаға бір мезгілде қойылмады — тұнбаның пайда болу уақыттарын салыстыруға болмайды', 'the tubes were not placed in the bath at the same time — the times of precipitation cannot be compared'),
      whatif: L('Суть пробы Барфёда — сравнить скорость: моносахариды дают осадок за 2–3 минуты, дисахариды — намного позже. Если пробирки поставлены в разное время, разница во времени отражает вашу задержку, а не строение сахара.', 'Барфёд сынамасының мәні — жылдамдықты салыстыру: моносахаридтер 2–3 минутта тұнба береді, дисахаридтер — әлдеқайда кеш. Пробиркалар әртүрлі уақытта қойылса, уақыт айырмасы қанттың құрылысын емес, сіздің кідірісіңізді көрсетеді.', 'The point of Barfoed’s test is to compare rates: monosaccharides give a precipitate in 2–3 minutes, disaccharides much later. If the tubes go in at different times, the time difference reflects your delay, not the structure of the sugar.') });
  },
  events: [{
    id: 'five', when: (S, b) => b.sw >= 300 && b.tubes.some((t) => t.bath),
    title: L('Прошло 5 минут', '5 минут өтті', '5 minutes have passed'),
    text: L('Секундомер показывает 05:00. В пробирке с мальтозой осадка пока нет. Что делать?', 'Секундомер 05:00 көрсетеді. Мальтоза бар пробиркада әзірге тұнба жоқ. Не істеу керек?', 'The stopwatch reads 05:00. There is still no precipitate in the maltose tube. What do you do?'),
    options: [
      { ok: true, label: L('Вынуть пробирки и закончить наблюдение — по методичке 5 минут', 'Пробиркаларды алып, бақылауды аяқтау — әдістеме бойынша 5 минут', 'Take the tubes out and stop the observation — the manual says 5 minutes'),
        effect(S, b) { for (const t of b.tubes) t.bath = null; b.swOn = false; } },
      { ok: false, label: L('Нагревать ещё 8 минут — вдруг в мальтозе тоже появится осадок', 'Тағы 8 минут қыздыру — мальтозада да тұнба пайда болуы мүмкін', 'Keep heating for 8 more minutes — maybe the maltose will give a precipitate too'),
        effect(S, b, ctx) { simulate(b, envOf(S), 480); ctx.advance(480); for (const t of b.tubes) t.bath = null; b.swOn = false; S.barfLong = true; } },
    ],
  }],
  check(S, b, ctx) {
    if (b.tubes.every((t) => !t.bath) && b.sw > 0 && b.sw < 300 && !b.swOn) ctx.feedback(L('Пробирки вынуты раньше 5 минут — моносахариды могли ещё не дать осадок. Верните их в баню.', 'Пробиркалар 5 минуттан бұрын алынды — моносахаридтер әлі тұнба бермеуі мүмкін. Оларды моншаға қайтарыңыз.', 'The tubes came out before 5 minutes — the monosaccharides may not have reacted yet. Put them back in the bath.'), 'warn');
  },
  done: (S, b) => b.tubes.every((t) => !t.bath && t.bar > 0 && t.sugV > 0) && b.sw >= 300 && L('Наблюдение закончено — запишите результат и время появления осадка.', 'Бақылау аяқталды — нәтижені және тұнбаның пайда болу уақытын жазыңыз.', 'The observation is over — record the result and the time of precipitation.'),
  hints: [
    L('Важно время: все пробирки ставят в кипящую баню одновременно и смотрят не дольше 5 минут.', 'Уақыт маңызды: барлық пробирканы қайнап тұрған моншаға бір мезгілде қойып, 5 минуттан артық бақыламайды.', 'Timing matters: all the tubes go into the boiling bath at the same time and are watched for no more than 5 minutes.'),
    L('Осадок дисахарида после 10 минут — результат частичного гидролиза, его не считают положительным.', '10 минуттан кейінгі дисахарид тұнбасы — ішінара гидролиздің нәтижесі, оны оң деп санамайды.', 'A disaccharide precipitate after 10 minutes comes from partial hydrolysis and is not counted as positive.'),
    L('«2 мл реактива» → «Внести по 1 мл» → «Все пробирки → в кипящую баню» → ×10 до 05:00 → вынуть.', '«2 мл реактив» → «1 мл-ден салу» → «Барлық пробирка → қайнап тұрған моншаға» → ×10, 05:00-ге дейін → алу.', '“2 mL of reagent” → “Add 1 mL” → “All tubes → into the boiling bath” → ×10 until 05:00 → take out.'),
  ],
};

const s1 = {
  type: 'lab15-record', id: 'rec', key: 'barfoed', test: 'barfoed', saveAs: 'barfoed',
  title: L('Наблюдения: проба Барфёда', 'Бақылаулар: Барфёд сынамасы', 'Observations: Barfoed’s test'),
  instr: L('<p>Запишите результат и время появления красного осадка в каждой пробирке.</p>', '<p>Әр пробиркадағы нәтижені және қызыл тұнбаның пайда болу уақытын жазыңыз.</p>', '<p>Record the result and the time the red precipitate appeared in each tube.</p>'),
  need: L('Запишите наблюдение по каждой пробирке', 'Әр пробирка бойынша бақылауды жазыңыз', 'Record the observation for each tube'),
  options: ['red', 'none', 'lateplus'],
  misread: { mal: { lateplus: { severity: 'major', text: L('осадок мальтозы, появившийся после 10 минут (частичный гидролиз), принят за положительный результат', '10 минуттан кейін пайда болған мальтоза тұнбасы (ішінара гидролиз) оң нәтиже деп қабылданды', 'the maltose precipitate that appeared after 10 minutes (partial hydrolysis) was taken as a positive result') } } },
  why: (t, code) => (code === 'red' ? L('Моносахариды быстро восстанавливают слабый окислитель — ацетат меди(II) в слабокислой среде.', 'Моносахаридтер әлсіз тотықтырғышты — әлсіз қышқыл ортадағы мыс(II) ацетатын тез тотықсыздандырады.', 'Monosaccharides quickly reduce the weak oxidant — copper(II) acetate in weakly acidic medium.') : code === 'late' ? L('Осадок после 10 минут — из моносахаридов, образовавшихся при частичном гидролизе мальтозы; он не означает положительной пробы.', '10 минуттан кейінгі тұнба — мальтозаның ішінара гидролизі кезінде түзілген моносахаридтерден; бұл оң сынаманы білдірмейді.', 'A precipitate after 10 minutes comes from monosaccharides formed by partial hydrolysis of maltose; it does not mean a positive test.') : code === 'none' && t.sug === 'mal' ? L('Восстанавливающие дисахариды в слабокислой среде реагируют намного медленнее моносахаридов.', 'Тотықсыздандырғыш дисахаридтер әлсіз қышқыл ортада моносахаридтерге қарағанда әлдеқайда баяу әрекеттеседі.', 'Reducing disaccharides react much more slowly than monosaccharides in weakly acidic medium.') : null),
};

const s2 = {
  type: 'quiz', id: 'q',
  title: L('Вывод по пробе Барфёда', 'Барфёд сынамасы бойынша қорытынды', 'Conclusion from Barfoed’s test'),
  instr: L('<p>Ответьте на вопрос преподавателя.</p>', '<p>Оқытушының сұрағына жауап беріңіз.</p>', '<p>Answer the instructor’s question.</p>'),
  need: L('Ответьте на вопрос', 'Сұраққа жауап беріңіз', 'Answer the question'),
  questions: [
    { q: L('Почему проба Барфёда отличает моносахариды от восстанавливающих дисахаридов, а проба Фелинга — нет?', 'Неліктен Барфёд сынамасы моносахаридтерді тотықсыздандырғыш дисахаридтерден ажыратады, ал Фелинг сынамасы — жоқ?', 'Why does Barfoed’s test tell monosaccharides from reducing disaccharides, while Fehling’s test does not?'),
      options: [L('Ацетат меди(II) в слабокислой среде — слабый окислитель: моносахариды восстанавливают его за 2–3 мин, дисахариды — гораздо медленнее', 'Әлсіз қышқыл ортадағы мыс(II) ацетаты — әлсіз тотықтырғыш: моносахаридтер оны 2–3 минутта, дисахаридтер — әлдеқайда баяу тотықсыздандырады', 'Copper(II) acetate in weakly acidic medium is a weak oxidant: monosaccharides reduce it in 2–3 min, disaccharides much more slowly'), L('В реактиве Барфёда нет меди', 'Барфёд реактивінде мыс жоқ', 'Barfoed’s reagent contains no copper'), L('Дисахариды в кислой среде вообще не окисляются', 'Дисахаридтер қышқыл ортада мүлдем тотықпайды', 'Disaccharides are not oxidised at all in acidic medium')],
      correct: 0, why: L('Решает скорость, поэтому важны одновременный нагрев и предел 5 минут.', 'Жылдамдық шешеді, сондықтан бір мезгілде қыздыру мен 5 минуттық шек маңызды.', 'It is the rate that matters — hence heating all tubes together and the 5-minute limit.') },
  ],
};

export default {
  id: '5',
  title: L('Проба Барфёда (моносахариды и дисахариды)', 'Барфёд сынамасы (моносахаридтер және дисахаридтер)', 'Barfoed’s test (monosaccharides vs disaccharides)'),
  principle: L('В слабокислой среде ацетат меди(II) — слабый окислитель: моносахариды восстанавливают его быстро, восстанавливающие дисахариды — только при длительном нагревании.', 'Әлсіз қышқыл ортада мыс(II) ацетаты — әлсіз тотықтырғыш: моносахаридтер оны тез, ал тотықсыздандырғыш дисахаридтер тек ұзақ қыздырғанда тотықсыздандырады.', 'In weakly acidic medium copper(II) acetate is a weak oxidant: monosaccharides reduce it quickly, reducing disaccharides only after prolonged heating.'),
  equation: [L('моносахарид + Cu(II) (ацетат, CH₃COOH, кипящая баня) → Cu₂O↓ (красный) за 2–3 мин; дисахарид — осадка за 5 мин нет', 'моносахарид + Cu(II) (ацетат, CH₃COOH, қайнап тұрған монша) → 2–3 минутта Cu₂O↓ (қызыл); дисахарид — 5 минутта тұнба жоқ', 'monosaccharide + Cu(II) (acetate, CH₃COOH, boiling bath) → Cu₂O↓ (red) within 2–3 min; disaccharide — no precipitate within 5 min')],
  initialState: (a) => baseState(a),
  checkpoints: [0],
  steps: [s0, s1, s2],
  results: (S) => ({ cells: S.res, long: !!S.barfLong }),
  summary: (r) => cellsSummary(r, 'barfoed', ['glu', 'fru', 'mal']),
};
