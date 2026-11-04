/** Опыт 4. Отличие лимонной кислоты от винной по ионам кальция. Методичка, раздел 6, опыт 4. */
import { L, n } from '../../app/i18n.js';
import { limePH, caSalt } from './model.js';
import { perTube } from './util.js';
import { tubesScene, bathScene } from './scene.js';

const WHITE = 'var(--solid)';

/* ---------- 1. Как нагревать ---------- */
const s0 = {
  type: 'decide', id: 'heat',
  title: L('Как нагреть пробирку до кипения', 'Пробирканы қайнағанға дейін қалай қыздыру керек', 'How to heat the tube to boiling'),
  instr: L('<p>Смесь кислоты с известковой водой нужно будет нагреть до кипения, а затем охладить под струёй воды. Выберите, как вы будете нагревать.</p>',
    '<p>Қышқыл мен әк суының қоспасын қайнағанға дейін қыздырып, содан кейін су ағынымен салқындату керек болады. Қалай қыздыратыныңызды таңдаңыз.</p>',
    '<p>The mixture of the acid and lime water will have to be heated to boiling and then cooled under running water. Choose how you will heat it.</p>'),
  need: L('Выберите безопасный способ', 'Қауіпсіз тәсілді таңдаңыз', 'Choose the safe way'),
  scene: () => bathScene({ t: { v: 4 }, inBath: true, Tb: 98, T: 96, heat: true, cap: 8 }),
  question: L('Как вы нагреете пробирку со смесью?', 'Қоспасы бар пробирканы қалай қыздырасыз?', 'How will you heat the tube with the mixture?'),
  options: [
    { id: 'bath', ok: true, label: L('В держателе, в кипящей водяной бане; пробирка заполнена не более чем на треть, отверстие — от себя и соседей', 'Ұстағышпен, қайнаған су моншасында; пробирка үштен бірінен артық толтырылмаған, аузы — өзіңізден және көршілерден басқа жаққа', 'In a holder, in a boiling water bath; the tube no more than a third full, the mouth pointing away from you and your neighbours'),
      why: L('Открытая пробирка, равномерный нагрев бани и направление отверстия от людей исключают выброс в лицо.', 'Ашық пробирка, моншаның біркелкі қызуы және аузын адамдардан басқа жаққа бағыттау бетке шашырауды болдырмайды.', 'An open tube, the even heating of the bath and pointing the mouth away from people prevent liquid being thrown into anyone’s face.'),
      effect(S) { S.e4.heat = 'bath'; }, log: L('Нагрев — в кипящей водяной бане, пробирка в держателе, отверстие направлено от людей', 'Қыздыру — қайнаған су моншасында, пробирка ұстағышта, аузы адамдардан басқа жаққа бағытталған', 'Heating in a boiling water bath, tube in a holder, mouth pointing away from people') },
    { id: 'stopper', ok: false, label: L('Закрыть пробирку пробкой, чтобы смесь не разбрызгивалась, и нагреть в бане', 'Қоспа шашырамауы үшін пробирканы тығынмен жауып, моншада қыздыру', 'Close the tube with a stopper so the mixture cannot splash, then heat it in the bath'),
      remark: L('нагрев закрытой пробирки (п. 7.4 правил ТБ)', 'жабық пробирканы қыздыру (ҚТ ережелерінің 7.4-тармағы)', 'heating a stoppered tube (safety rule 7.4)'),
      critical: { text: L('При нагревании закрытой пробирки пар и воздух не находят выхода: давление растёт, пробку выбивает, и горячая щелочная известковая вода выплёскивается — на руки и в лицо. Пробирка может лопнуть. Опыт прекращён: рабочее место убирают, пробу готовят заново. Нагревать можно только открытую систему (п. 7.4 правил ТБ).', 'Жабық пробирканы қыздырғанда бу мен ауаның шығатын жері болмайды: қысым артады, тығын атылып шығады, ыстық сілтілі әк суы қолға және бетке шашырайды. Пробирка жарылуы мүмкін. Тәжірибе тоқтатылды: жұмыс орнын жинайды, сынаманы қайта дайындайды. Тек ашық жүйені қыздыруға болады (ҚТ ережелерінің 7.4-тармағы).', 'When a stoppered tube is heated, the steam and air have nowhere to go: the pressure rises, the stopper is blown out and hot alkaline lime water is thrown onto your hands and face. The tube may burst. The experiment is stopped: the bench is cleaned and the test is prepared again. Only an open system may be heated (safety rule 7.4).') } },
    { id: 'plate', ok: false, severity: 'major', label: L('Держать пробирку прямо над горячей плиткой — так быстрее закипит', 'Пробирканы тікелей ыстық плитаның үстінде ұстау — тезірек қайнайды', 'Hold the tube directly over the hot plate — it will boil sooner'),
      remark: L('нагрев пробирки прямо над плиткой: толчок при кипении, часть смеси выброшена', 'пробирканы тікелей плитаның үстінде қыздыру: қайнағанда серпіліс, қоспаның бір бөлігі шашырады', 'tube heated directly over the hot plate: bumping on boiling threw out part of the mixture'),
      whatif: L('Местный перегрев дна пробирки вызывает толчок: смесь выбрасывается из пробирки, часть пробы теряется, осадок получается меньше и его труднее заметить. Пробирки нагревают в бане.', 'Пробирка түбінің жергілікті қызуы серпіліс тудырады: қоспа пробиркадан шашырайды, сынаманың бір бөлігі жоғалады, тұнба азаяды және оны байқау қиындайды. Пробиркаларды моншада қыздырады.', 'Local overheating of the bottom of the tube causes bumping: the mixture is thrown out, part of the sample is lost and the precipitate is smaller and harder to see. Tubes are heated in a bath.'),
      effect(S) { S.e4.heat = 'plate'; } },
    { id: 'look', ok: false, severity: 'safety', retry: true, label: L('Держать пробирку пальцами и заглядывать в неё сверху, чтобы не пропустить осадок', 'Пробирканы саусақпен ұстап, тұнбаны жіберіп алмау үшін оған жоғарыдан қарау', 'Hold the tube with your fingers and look down into it so as not to miss the precipitate'),
      remark: L('намерение заглядывать в нагреваемую пробирку и держать её пальцами (пп. 3.2, 9.4 правил ТБ)', 'қыздырылатын пробиркаға қарап, оны саусақпен ұстау ниеті (ҚТ ережелерінің 3.2, 9.4-тармақтары)', 'intended to look into a tube being heated and hold it with the fingers (safety rules 3.2, 9.4)'),
      whatif: L('Горячая пробирка обжигает пальцы, а при толчке щелочная жидкость летит прямо в глаза. Осадок рассматривают сбоку, на тёмном фоне, держа пробирку держателем.', 'Ыстық пробирка саусақты күйдіреді, ал серпілген кезде сілтілі сұйықтық тура көзге ұшады. Тұнбаны қараңғы фонда, пробирканы ұстағышпен ұстап, бүйірінен қарайды.', 'A hot tube burns your fingers, and if it bumps the alkaline liquid flies straight into your eyes. Look at the precipitate from the side, against a dark background, holding the tube in a holder.') },
  ],
};

/* ---------- 2. Проба ---------- */
const caTubes = [
  { id: 'c', label: L('1 · лимонная кислота', '1 · лимон қышқылы', '1 · citric acid'), short: L('1 · лимонная', '1 · лимон', '1 · citric') },
  { id: 't', label: L('2 · винная кислота', '2 · шарап қышқылы', '2 · tartaric acid'), short: L('2 · винная', '2 · шарап', '2 · tartaric') },
];
const nameOf = (id) => (id === 'c' ? L('лимонной', 'лимон', 'citric') : L('винной', 'шарап', 'tartaric'));
function paint(t, id) {
  t.pH = limePH(t.L || 0);
  t.ppt = t.acid ? caSalt(id === 'c' ? 'citr' : 'tart', t.L || 0, !!t.hot) : 0;
  if (t.lost) t.ppt *= 0.5;
  t.pptColor = WHITE;
}
const s1 = {
  type: 'test', id: 'ca',
  title: L('Известковая вода: на холоду и при кипячении', 'Әк суы: суықта және қайнатқанда', 'Lime water: cold and on boiling'),
  instr: L('<ol><li>К <b>1 мл</b> раствора лимонной кислоты прилейте известковую воду в избытке — до щелочной реакции по индикаторной бумаге (около <b>3–5 мл</b>). Отметьте, выпадает ли осадок на холоду.</li><li>Нагрейте смесь до кипения и наблюдайте; затем охладите пробирку под струёй воды.</li><li>Повторите пробу с раствором винной кислоты для сравнения.</li></ol>',
    '<ol><li><b>1 мл</b> лимон қышқылы ерітіндісіне әк суын артық мөлшерде — индикатор қағазы бойынша сілтілі реакцияға дейін (шамамен <b>3–5 мл</b>) құйыңыз. Суықта тұнба түсетінін белгілеңіз.</li><li>Қоспаны қайнағанға дейін қыздырып, бақылаңыз; содан кейін пробирканы су ағынымен салқындатыңыз.</li><li>Салыстыру үшін сынаманы шарап қышқылы ерітіндісімен қайталаңыз.</li></ol>',
    '<ol><li>To <b>1 mL</b> of citric acid solution add lime water in excess — until alkaline to indicator paper (about <b>3–5 mL</b>). Note whether a precipitate forms in the cold.</li><li>Heat the mixture to boiling and observe; then cool the tube under running water.</li><li>Repeat the test with tartaric acid solution for comparison.</li></ol>'),
  need: L('Сравните лимонную и винную кислоты', 'Лимон және шарап қышқылдарын салыстырыңыз', 'Compare citric and tartaric acids'),
  tubes: caTubes, reset: true, indicator: true, capacity: 8,
  reagents: perTube([
    { id: 'acid', group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('Раствор кислоты (по этикетке): 1 мл', 'Қышқыл ерітіндісі (заттаңба бойынша): 1 мл', 'Acid solution (as labelled): 1 mL'), advance: 20, disabled: (t) => t.acid,
      apply(t, S, ctx, id) { t.acid = 1; t.v += 1; paint(t, id); ctx.log(L(`В пробирку ${id === 'c' ? 1 : 2} отмерен 1 мл 10 % раствора ${tr3(nameOf(id), 'ru')} кислоты`, `${id === 'c' ? 1 : 2}-пробиркаға 10 % ${tr3(nameOf(id), 'kk')} қышқылы ерітіндісінің 1 мл өлшенді`, `1 mL of 10 % ${tr3(nameOf(id), 'en')} acid solution measured into tube ${id === 'c' ? 1 : 2}`)); } },
    { id: 'lime', group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('Известковая вода: +1 мл', 'Әк суы: +1 мл', 'Lime water: +1 mL'), advance: 15, disabled: (t) => !t.acid || (t.L || 0) >= 6,
      apply(t, S, ctx, id) {
        const before = t.ppt || 0;
        t.L = (t.L || 0) + 1; t.v += 1; paint(t, id);
        ctx.log(L(`В пробирку ${id === 'c' ? 1 : 2} прилит 1 мл известковой воды (всего ${t.L} мл)`, `${id === 'c' ? 1 : 2}-пробиркаға 1 мл әк суы құйылды (барлығы ${t.L} мл)`, `1 mL of lime water added to tube ${id === 'c' ? 1 : 2} (total ${t.L} mL)`));
        if (!t.hot && id === 't' && t.ppt > 0.1 && before <= 0.1) { t.coldPpt = true; ctx.log(L('Винная кислота: на холоду выпал белый осадок тартрата кальция', 'Шарап қышқылы: суықта кальций тартратының ақ тұнбасы түзілді', 'Tartaric acid: a white precipitate of calcium tartrate formed in the cold'), 'obs'); }
        if (!t.hot && id === 'c' && t.L === 3) ctx.log(L('Лимонная кислота: на холоду раствор остаётся прозрачным', 'Лимон қышқылы: суықта ерітінді мөлдір күйінде қалады', 'Citric acid: the solution stays clear in the cold'), 'obs');
      } },
    { id: 'boil', group: L('Нагрев', 'Қыздыру', 'Heating'), label: L('Нагреть до кипения', 'Қайнағанға дейін қыздыру', 'Heat to boiling'), advance: 180, disabled: (t) => !t.acid || !t.L || t.hot,
      apply(t, S, ctx, id) {
        t.hot = true; t.boiled = true; t.cooled = false;
        if (S.e4.heat === 'plate' && !t.lost) { t.lost = true; t.v *= 0.6; ctx.log(L('Толчок при кипении: часть смеси выброшена из пробирки', 'Қайнағанда серпіліс: қоспаның бір бөлігі пробиркадан шашырады', 'Bumping on boiling: part of the mixture was thrown out of the tube'), 'warn'); }
        paint(t, id);
        if (id === 'c') {
          if (t.ppt > 0.1) { t.seenHot = true; ctx.log(L('Лимонная кислота: при кипячении выпал белый осадок цитрата кальция', 'Лимон қышқылы: қайнатқанда кальций цитратының ақ тұнбасы түзілді', 'Citric acid: a white precipitate of calcium citrate formed on boiling'), 'obs'); }
          else ctx.log(L(`Лимонная кислота: при кипячении осадка нет (pH ≈ ${Math.round(t.pH)})`, `Лимон қышқылы: қайнатқанда тұнба жоқ (pH ≈ ${Math.round(t.pH)})`, `Citric acid: no precipitate on boiling (pH ≈ ${Math.round(t.pH)})`), 'obs');
        } else ctx.log(L('Винная кислота: при кипячении осадок сохраняется', 'Шарап қышқылы: қайнатқанда тұнба сақталады', 'Tartaric acid: the precipitate remains on boiling'));
      } },
    { id: 'cool', group: L('Нагрев', 'Қыздыру', 'Heating'), label: L('Охладить под струёй воды', 'Су ағынымен салқындату', 'Cool under running water'), advance: 60, disabled: (t) => !t.hot,
      apply(t, S, ctx, id) {
        const had = t.ppt; t.hot = false; t.cooled = true; paint(t, id);
        if (id === 'c' && had > 0.1 && t.ppt < 0.05) { t.redis = true; ctx.log(L('Лимонная кислота: при охлаждении осадок цитрата кальция снова растворился', 'Лимон қышқылы: салқындатқанда кальций цитратының тұнбасы қайта еріді', 'Citric acid: on cooling the calcium citrate precipitate dissolved again'), 'obs'); }
        else ctx.log(L(`Пробирка ${id === 'c' ? 1 : 2} охлаждена под струёй воды`, `${id === 'c' ? 1 : 2}-пробирка су ағынымен салқындатылды`, `Tube ${id === 'c' ? 1 : 2} cooled under running water`));
      } },
  ]),
  done: (tb) => tb.c.acid && tb.c.boiled && tb.c.cooled && tb.t.acid && tb.t.coldPpt,
  observe: {
    question: L('Чем различаются лимонная и винная кислоты в этой пробе?', 'Бұл сынамада лимон және шарап қышқылдары немен ерекшеленеді?', 'How do citric and tartaric acids differ in this test?'),
    options: [
      { id: 'ok', label: L('Лимонная: на холоду прозрачно, при кипячении белый осадок, при охлаждении растворяется; винная: осадок уже на холоду', 'Лимон: суықта мөлдір, қайнатқанда ақ тұнба, салқындатқанда ериді; шарап: тұнба суықта-ақ', 'Citric: clear in the cold, white precipitate on boiling, redissolves on cooling; tartaric: precipitate already in the cold'), log: L('Лимонная кислота: на холоду раствор прозрачный, при кипячении — белый осадок цитрата кальция, при охлаждении он растворяется; винная кислота: белый осадок тартрата кальция уже на холоду', 'Лимон қышқылы: суықта ерітінді мөлдір, қайнатқанда — кальций цитратының ақ тұнбасы, салқындатқанда ол ериді; шарап қышқылы: кальций тартратының ақ тұнбасы суықта-ақ', 'Citric acid: clear in the cold, a white precipitate of calcium citrate on boiling which redissolves on cooling; tartaric acid: a white precipitate of calcium tartrate already in the cold') },
      { id: 'noppt', label: L('Лимонная: осадка нет даже при кипячении; винная: осадок на холоду', 'Лимон: қайнатқанда да тұнба жоқ; шарап: тұнба суықта', 'Citric: no precipitate even on boiling; tartaric: precipitate in the cold'), log: L('Лимонная кислота: осадка нет даже при кипячении (среда не стала щелочной); винная кислота: осадок на холоду', 'Лимон қышқылы: қайнатқанда да тұнба жоқ (орта сілтілі болмады); шарап қышқылы: суықта тұнба', 'Citric acid: no precipitate even on boiling (the medium never became alkaline); tartaric acid: precipitate in the cold') },
      { id: 'rev', label: L('Лимонная: осадок на холоду; винная: только при кипячении', 'Лимон: суықта тұнба; шарап: тек қайнатқанда', 'Citric: precipitate in the cold; tartaric: only on boiling') },
      { id: 'same', label: L('Обе кислоты ведут себя одинаково', 'Екі қышқыл да бірдей', 'Both acids behave the same way') },
    ],
    correct: (S, tb) => (tb.c.seenHot && tb.c.redis ? 'ok' : 'noppt'),
    why: (S, tb) => (tb.c.seenHot
      ? L('Цитрат кальция растворим в горячей воде хуже, чем в холодной: выпадает при кипячении и растворяется при охлаждении. Тартрат кальция выпадает уже на холоду.', 'Кальций цитраты ыстық суда суыққа қарағанда нашар ериді: қайнатқанда тұнбаға түсіп, салқындатқанда ериді. Кальций тартраты суықта-ақ тұнбаға түседі.', 'Calcium citrate is less soluble in hot water than in cold: it separates on boiling and redissolves on cooling. Calcium tartrate precipitates already in the cold.')
      : L('Цитрат кальция выпадает при кипячении только из щелочного раствора; известковой воды было мало — проверьте среду индикаторной бумагой и повторите.', 'Кальций цитраты қайнатқанда тек сілтілі ерітіндіден тұнбаға түседі; әк суы аз болды — ортаны индикатор қағазымен тексеріп, қайталаңыз.', 'Calcium citrate separates on boiling only from alkaline solution; there was too little lime water — check the medium with indicator paper and repeat.')),
  },
  onDone(S, tb, ctx) {
    const c = tb.c;
    if (!c.seenHot) ctx.remark({ key: 'cit_lime', severity: 'major', text: L('к лимонной кислоте прилито мало известковой воды (среда не щелочная) — цитрат кальция при кипячении не выпал', 'лимон қышқылына әк суы аз құйылды (орта сілтілі емес) — қайнатқанда кальций цитраты тұнбаға түспеді', 'too little lime water was added to the citric acid (not alkaline) — calcium citrate did not separate on boiling') });
    S.e4.res = { L: c.L, seenHot: !!c.seenHot, redis: !!c.redis, tartL: tb.t.L, lost: !!(c.lost || tb.t.lost) };
  },
  scene: (S, local) => tubesScene(caTubes, local, { cap: 8, hot: (t) => t.hot }),
  hint1: L('Известковой воды — до щелочной реакции (проверьте бумагой), потом кипятить и охладить. Винная кислота — для сравнения, осадок уже на холоду.', 'Әк суы — сілтілі реакцияға дейін (қағазбен тексеріңіз), содан кейін қайнатып, салқындату. Шарап қышқылы — салыстыру үшін, тұнба суықта-ақ.', 'Lime water until alkaline (check with paper), then boil and cool. Tartaric acid is for comparison — it gives a precipitate already in the cold.'),
  hint2: L('Для лимонной кислоты нужно не меньше 3 мл известковой воды — тогда бумага покажет щелочную среду.', 'Лимон қышқылы үшін кемінде 3 мл әк суы қажет — сонда қағаз сілтілі ортаны көрсетеді.', 'Citric acid needs at least 3 mL of lime water — then the paper shows an alkaline medium.'),
  hint3: L('Пробирка 1: кислота → известковая вода +1 мл ×4 → бумага → нагреть → охладить. Пробирка 2: кислота → известковая вода +1 мл ×2.', '1-пробирка: қышқыл → әк суы +1 мл ×4 → қағаз → қыздыру → салқындату. 2-пробирка: қышқыл → әк суы +1 мл ×2.', 'Tube 1: acid → lime water +1 mL ×4 → paper → heat → cool. Tube 2: acid → lime water +1 mL ×2.'),
};
function tr3(x, l) { return x[l]; }

export default {
  id: '4',
  title: L('Отличие лимонной кислоты от винной (ионы Ca²⁺)', 'Лимон қышқылын шарап қышқылынан ажырату (Ca²⁺ иондары)', 'Distinguishing citric acid from tartaric acid with calcium ions'),
  principle: L('Цитрат кальция растворим в горячей воде хуже, чем в холодной: из холодного раствора не выпадает, выделяется при кипячении и вновь растворяется при охлаждении. Тартрат кальция выпадает на холоду.', 'Кальций цитраты ыстық суда суыққа қарағанда нашар ериді: суық ерітіндіден тұнбаға түспейді, қайнатқанда бөлінеді және салқындатқанда қайта ериді. Кальций тартраты суықта тұнбаға түседі.', 'Calcium citrate is less soluble in hot water than in cold: it does not precipitate from a cold solution but separates on boiling and redissolves on cooling. Calcium tartrate precipitates in the cold.'),
  equation: [L('2 C₆H₈O₇ + 3Ca(OH)₂ → Ca₃(C₆H₅O₇)₂↓ + 6H₂O (при кипячении)', '2 C₆H₈O₇ + 3Ca(OH)₂ → Ca₃(C₆H₅O₇)₂↓ + 6H₂O (қайнатқанда)', '2 C₆H₈O₇ + 3Ca(OH)₂ → Ca₃(C₆H₅O₇)₂↓ + 6H₂O (on boiling)')],
  initialState: () => ({ e4: { heat: null, res: null } }),
  checkpoints: [0],
  steps: [s0, s1],
  results: (S) => ({ heat: S.e4.heat, ...(S.e4.res || {}) }),
  summary: (r) => [
    { label: L('Лимонная', 'Лимон', 'Citric'), value: r.seenHot ? L('осадок при кипячении', 'қайнатқанда тұнба', 'ppt on boiling') : L('осадка нет', 'тұнба жоқ', 'no ppt'), st: r.seenHot && r.redis ? 'ok' : 'warn' },
    { label: L('Винная', 'Шарап', 'Tartaric'), value: L('осадок на холоду', 'суықта тұнба', 'ppt in the cold'), st: 'ok' },
  ],
};
