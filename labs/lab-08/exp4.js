/** Опыт 4. Щелочной гидролиз (омыление) эфира. Методичка, раздел 6, опыт 4. Затем уборка рабочего места. */
import { L, n } from '../../app/i18n.js';
import { saponScene } from './scene.js';

const CRIT_STOP = L(
  'Пробирку, плотно закрытую пробкой, поставили в кипящую баню: пары эфира, бутанола и воды создали давление, пробку выбило, горячий 2 М раствор щёлочи выплеснулся. В реальной лаборатории это химический ожог кожи или глаз: промывать проточной водой не менее 15 минут (п. 6.3), сообщить преподавателю. Нагревают только открытые пробирки, направляя отверстие от себя и соседей. Опыт повторяют с новой порцией эфира.',
  'Тығынмен тығыз жабылған пробирка қайнаған моншаға қойылды: эфир, бутанол және су булары қысым туғызды, тығын атылып, ыстық 2 М сілті ерітіндісі шашырады. Нақты зертханада бұл тері немесе көздің химиялық күйігі: кемінде 15 минут ағын сумен жуу (6.3-тармақ), оқытушыға хабарлау. Тек ашық пробиркаларды, аузын өзінен және көршілерден алыс бағыттап қыздырады. Тәжірибе эфирдің жаңа порциясымен қайталанады.',
  'A tightly stoppered tube was put into the boiling bath: vapour of ester, butanol and water built up pressure, the stopper blew out and hot 2 M alkali splashed out. In a real lab this means a chemical burn to the skin or eyes: rinse under running water for at least 15 minutes (rule 6.3) and tell the instructor. Only open tubes are heated, mouth pointed away from people. The experiment is repeated with a fresh portion of ester.');

/*
 * Подсказка 3 — готовое решение с названиями кнопок дословно (SCHEMA.md). «Встряхнуть» добавляется раз в минуту нагрева (считаются только нажатия кнопки, не встряхивание в событии),
 * «Вынуть» — когда слой эфира исчез и прошло 10 мин. cur — последнее состояние шага (обновляется при отрисовке показаний).
 */
let cur = null;
const SB = {
  load: { ru: 'Внести 0,5 мл эфира и 5 мл 2 М NaOH', kk: '0,5 мл эфир және 5 мл 2 М NaOH салу', en: 'Add 0.5 mL of ester and 5 mL of 2 M NaOH' },
  bath: { ru: 'Поставить пробирку в кипящую водяную баню', kk: 'Пробирканы қайнаған су моншасына қою', en: 'Put the tube into the boiling water bath' },
  shake: { ru: 'Встряхнуть пробирку', kk: 'Пробирканы шайқау', en: 'Shake the tube' },
  out: { ru: 'Вынуть пробирку из бани, охладить', kk: 'Пробирканы моншадан алып, суыту', en: 'Take the tube out of the bath and cool it' },
  waft: { ru: 'Определить запах, направляя пары к себе ладонью', kk: 'Буды алақанмен өзіне бағыттап, иісін анықтау', en: 'Smell it by wafting the vapour towards you' },
};
function saponH3() {
  const P = cur && cur.S.sap, bathOn = !!(cur && cur.lc.c && cur.lc.c.bath);
  const ready = P && P.h > 0.9 && P.t >= 600;
  const k = (P ? P.btnShakes || 0 : 0) + (P && bathOn && !P.out && !ready && (P.tNow || 0) - P.lastShake >= 60 ? 1 : 0);
  const items = [SB.load, SB.bath, ...Array(k).fill(SB.shake)];
  if (ready || (P && P.out)) items.push(SB.out, SB.waft);
  const tail = ready || (P && P.out) ? null : { ru: '→ встряхивайте каждую минуту нагрева (ускорьте ход времени); когда слой эфира исчезнет и пройдёт 10–15 мин, выньте пробирку и определите запах ладонью.', kk: '→ қыздырудың әр минутында шайқаңыз (уақытты жылдамдатыңыз); эфир қабаты жоғалып, 10–15 мин өткенде пробирканы алып, иісін алақанмен анықтаңыз.', en: '→ shake every minute of heating (speed up time); when the ester layer has gone and 10–15 min have passed, take the tube out and smell it by wafting.' };
  const f = (l) => items.map((x) => (l === 'en' ? `“${x.en}”` : `«${x[l]}»`)).join(' → ') + (tail ? ' ' + tail[l] : '');
  return { ru: f('ru'), kk: f('kk'), en: f('en') };
}

const s1 = {
  type: 'process', id: 'sapon', speeds: [10, 30],
  title: L('Омыление эфира в кипящей бане', 'Эфирді қайнаған моншада сабындандыру', 'Saponifying the ester in a boiling bath'),
  instr: L('<ol><li>Поместите в пробирку <b>0,5 мл</b> эфира и <b>5 мл 2 М NaOH</b>; отметьте два слоя и фруктовый запах.</li><li>Нагревайте пробирку в кипящей водяной бане <b>10–15 минут, часто встряхивая</b>.</li><li>Наблюдайте постепенное исчезновение слоя эфира и изменение запаха.</li></ol><p class="note">Пробирку не закрывают пробкой. Запах определяют, направляя пары к себе движением ладони.</p>',
    '<ol><li>Пробиркаға <b>0,5 мл</b> эфир және <b>5 мл 2 М NaOH</b> салыңыз; екі қабатты және жеміс иісін белгілеңіз.</li><li>Пробирканы қайнаған су моншасында <b>10–15 минут, жиі шайқай отырып</b> қыздырыңыз.</li><li>Эфир қабатының біртіндеп жоғалуын және иістің өзгеруін бақылаңыз.</li></ol><p class="note">Пробирканы тығынмен жаппайды. Иісті алақан қимылымен буды өзіне бағыттап анықтайды.</p>',
    '<ol><li>Put <b>0.5 mL</b> of the ester and <b>5 mL of 2 M NaOH</b> into a test tube; note the two layers and the fruity odour.</li><li>Heat the tube in a boiling water bath for <b>10–15 minutes, shaking frequently</b>.</li><li>Watch the ester layer gradually disappear and the odour change.</li></ol><p class="note">The tube is not stoppered. Smell it by wafting the vapour towards you with your hand.</p>'),
  need: L('Омылите эфир и оцените запах', 'Эфирді сабындандырып, иісін бағалаңыз', 'Saponify the ester and assess the odour'),
  setup(S) { S.sap = S.sap || { h: 0, t: 0, loaded: false, stopper: false, mixed: false, lastShake: -999, out: false, smelled: false }; },
  controls: [
    { kind: 'action', id: 'load', group: L('Пробирка', 'Пробирка', 'Test tube'), label: L('Внести 0,5 мл эфира и 5 мл 2 М NaOH', '0,5 мл эфир және 5 мл 2 М NaOH салу', 'Add 0.5 mL of ester and 5 mL of 2 M NaOH'), advance: 60,
      do(S) { S.sap.loaded = true; }, obs: L('В пробирке два слоя: сверху тонкий бесцветный слой эфира, снизу раствор щёлочи; фруктовый запах эфира', 'Пробиркада екі қабат: үстінде эфирдің жұқа түссіз қабаты, астында сілті ерітіндісі; эфирдің жеміс иісі', 'Two layers in the tube: a thin colourless ester layer on top, alkali solution below; fruity odour of the ester') },
    { kind: 'action', id: 'stopper', group: L('Пробирка', 'Пробирка', 'Test tube'), label: L('Плотно закрыть пробирку пробкой, чтобы эфир не испарялся', 'Эфир буланбауы үшін пробирканы тығынмен тығыз жабу', 'Stopper the tube tightly so the ester does not evaporate'), requires: ['load'], disabled: (S) => S.sap.out,
      do(S) { S.sap.stopper = true; }, log: L('Пробирка закрыта пробкой', 'Пробирка тығынмен жабылды', 'Tube stoppered') },
    { kind: 'toggle', id: 'bath', group: L('Баня', 'Монша', 'Bath'), label: L('Поставить пробирку в кипящую водяную баню', 'Пробирканы қайнаған су моншасына қою', 'Put the tube into the boiling water bath'), labelOn: L('Пробирка в кипящей бане', 'Пробирка қайнаған моншада', 'Tube in the boiling bath'),
      when: (S) => S.sap.loaded && !S.sap.out, whenText: L('Сначала внесите в пробирку эфир и щёлочь.', 'Алдымен пробиркаға эфир мен сілті салыңыз.', 'Put the ester and alkali into the tube first.'),
      onChange(S, lc, on, ctx) { if (on) ctx.log(L('Пробирка помещена в кипящую водяную баню', 'Пробирка қайнаған су моншасына қойылды', 'Tube placed in the boiling water bath')); } },
    { kind: 'action', id: 'shake', once: false, group: L('Баня', 'Монша', 'Bath'), label: L('Встряхнуть пробирку', 'Пробирканы шайқау', 'Shake the tube'), advance: 10, disabled: (S) => !S.sap.loaded || S.sap.out,
      do(S, lc, ctx) { S.sap.mixed = true; S.sap.lastShake = ctx.now(); S.sap.shakes = (S.sap.shakes || 0) + 1; S.sap.btnShakes = (S.sap.btnShakes || 0) + 1; } },
    { kind: 'action', id: 'out', cls: 'pri', group: L('Завершение', 'Аяқтау', 'Finishing'), label: L('Вынуть пробирку из бани, охладить', 'Пробирканы моншадан алып, суыту', 'Take the tube out of the bath and cool it'), disabled: (S) => S.sap.out || S.sap.t < 60,
      do(S, lc, ctx) {
        const P = S.sap; P.out = true; lc.c.bath = false; P.mixed = false; ctx.advance(120);
        if (P.t < 600) ctx.remark({ key: 's4-short', severity: 'minor', text: { ru: `нагревание короче 10 минут (${n(P.t / 60, 0)} мин)`, kk: `қыздыру 10 минуттан қысқа (${n(P.t / 60, 0)} мин)`, en: `heated for less than 10 minutes (${n(P.t / 60, 0)} min)` } });
        if ((P.shakes || 0) < 3) ctx.remark({ key: 's4-shake', severity: 'minor', text: L('пробирку почти не встряхивали — гидролиз шёл только на границе слоёв', 'пробирка шайқалмады дерлік — гидролиз тек қабаттар шекарасында жүрді', 'the tube was hardly shaken — hydrolysis only took place at the interface') });
        ctx.log(P.h > 0.9 ? L('Слой эфира полностью исчез, раствор однородный и прозрачный', 'Эфир қабаты толық жоғалды, ерітінді біртекті және мөлдір', 'The ester layer has disappeared completely; the solution is homogeneous and clear')
          : { ru: `Слой эфира уменьшился, но ещё виден (прореагировало ≈ ${n(P.h * 100, 0)} %)`, kk: `Эфир қабаты азайды, бірақ әлі көрінеді (≈ ${n(P.h * 100, 0)} % әрекеттесті)`, en: `The ester layer is smaller but still visible (≈ ${n(P.h * 100, 0)} % reacted)` }, 'obs');
      } },
    { kind: 'action', id: 'waft', group: L('Запах', 'Иіс', 'Odour'), label: L('Определить запах, направляя пары к себе ладонью', 'Буды алақанмен өзіне бағыттап, иісін анықтау', 'Smell it by wafting the vapour towards you'), disabled: (S) => !S.sap.out || S.sap.smelled,
      do(S, lc, ctx) { S.sap.smelled = true; ctx.log(S.sap.h > 0.9 ? L('Фруктовый запах эфира исчез; чувствуется запах бутанола («сивушный»)', 'Эфирдің жеміс иісі жоғалды; бутанол иісі («сивуха») сезіледі', 'The fruity ester odour has gone; the odour of butanol (“fusel oil”) is noticeable') : L('Ещё чувствуется фруктовый запах эфира вместе с запахом бутанола', 'Эфирдің жеміс иісі бутанол иісімен бірге әлі сезіледі', 'The fruity ester odour is still noticeable along with butanol'), 'obs'); } },
    { kind: 'action', id: 'sniff', group: L('Запах', 'Иіс', 'Odour'), label: L('Поднести пробирку к носу и вдохнуть', 'Пробирканы мұрынға жақындатып, иіскеу', 'Hold the tube under your nose and sniff'), disabled: (S) => !S.sap.out || S.sap.smelled,
      do(S, lc, ctx) {
        S.sap.smelled = true;
        ctx.remark({ key: 's4-sniff', severity: 'safety', text: L('запах определяли, поднеся пробирку к носу — вдыхание паров над горячей щёлочью', 'иісті пробирканы мұрынға жақындатып анықтады — ыстық сілті үстіндегі буды жұту', 'the odour was assessed by holding the tube under the nose — vapour above hot alkali inhaled'), whatif: L('Над горячим раствором щёлочи — капли аэрозоля и концентрированные пары спирта: прямой вдох раздражает и обжигает слизистую. Пары направляют к себе ладонью, держа пробирку на расстоянии.', 'Ыстық сілті ерітіндісінің үстінде — аэрозоль тамшылары мен спирттің қою булары: тікелей иіскеу шырышты қабықты тітіркендіріп, күйдіреді. Пробирканы алыс ұстап, буды алақанмен өзіне бағыттайды.', 'Above hot alkali there are aerosol droplets and concentrated alcohol vapour: sniffing directly irritates and burns the mucous membranes. Waft the vapour towards you, keeping the tube at a distance.') });
        ctx.log(S.sap.h > 0.9 ? L('Запах бутанола, фруктового запаха эфира нет', 'Бутанол иісі, эфирдің жеміс иісі жоқ', 'Odour of butanol; no fruity ester odour') : L('Ещё чувствуется фруктовый запах эфира', 'Эфирдің жеміс иісі әлі сезіледі', 'The fruity ester odour is still noticeable'), 'obs');
      } },
  ],
  tick(S, lc, dt, ctx) {
    const P = S.sap;
    if (!P.loaded || P.out) return;
    if (lc.c.bath) {
      const was = P.t; P.t += dt;
      if (was < 60 && P.t >= 60) ctx.timeout(0, () => ctx.rerender());
      if (P.stopper && P.t > 40) ctx.remark({ key: 's4-stop', severity: 'critical', text: L('закрытую пробкой пробирку нагревали в кипящей бане — пробку выбило, щёлочь выплеснулась', 'тығынмен жабылған пробирка қайнаған моншада қыздырылды — тығын атылып, сілті шашырады', 'a stoppered tube was heated in a boiling bath — the stopper blew out and the alkali splashed'), critical: { text: CRIT_STOP } });
      const recent = ctx.now() - P.lastShake < 60;
      if (!recent) P.mixed = false;
      const k = recent ? 1 / 200 : 1 / 1600;
      P.h = 1 - (1 - P.h) * Math.exp(-k * dt);
    }
  },
  readouts: (S, lc) => {
    cur = { S, lc };
    const P = S.sap;
    return [
      { label: L('Нагрев', 'Қыздыру', 'Heating'), value: { ru: n(P.t / 60, 0) + ' мин', kk: n(P.t / 60, 0) + ' мин', en: n(P.t / 60, 0) + ' min' }, st: P.t >= 600 ? 'ok' : '' },
      { label: L('Слой эфира', 'Эфир қабаты', 'Ester layer'), value: !P.loaded ? '—' : P.h > 0.9 ? L('исчез', 'жоғалды', 'gone') : P.mixed ? L('эмульсия', 'эмульсия', 'emulsion') : { ru: `${n((1 - P.h) * 100, 0)} % исходного`, kk: `бастапқының ${n((1 - P.h) * 100, 0)} %`, en: `${n((1 - P.h) * 100, 0)} % of the original` }, st: P.h > 0.9 ? 'ok' : '' },
      { label: L('Встряхиваний', 'Шайқау саны', 'Shakes'), value: String(P.shakes || 0) },
    ];
  },
  alerts(S, lc) {
    const P = S.sap;
    if (!P.loaded || P.out || !lc.c.bath) return null;
    if (P.h > 0.9) return { text: L('Слой эфира исчез — можно вынуть пробирку.', 'Эфир қабаты жоғалды — пробирканы алуға болады.', 'The ester layer is gone — you can take the tube out.'), kind: 'good' };
    if (ctx0(S) > 90) return { text: L('Без встряхивания слои снова разделились — гидролиз идёт только на границе.', 'Шайқамаса қабаттар қайта бөлінді — гидролиз тек шекарада жүреді.', 'Without shaking the layers have separated again — hydrolysis only goes on at the interface.'), kind: 'info' };
    return null;
  },
  events: [{
    id: 'bump4', when: (S, lc) => lc.c.bath && S.sap.t > 150 && !S.sap.stopper,
    title: L('Жидкость в пробирке вскипает', 'Пробиркадағы сұйық қайнап кетеді', 'The liquid in the tube boils up'),
    text: L('Смесь в пробирке внезапно вскипела и поднялась почти до края. Что вы сделаете?', 'Пробиркадағы қоспа кенет қайнап, шетіне дейін көтерілді. Не істейсіз?', 'The mixture in the tube suddenly boils up almost to the rim. What do you do?'),
    options: [
      { ok: true, label: L('Приподнять пробирку из бани на несколько секунд, отверстием от себя и соседей, встряхнуть и вернуть', 'Пробирканы моншадан бірнеше секундқа көтеріп, аузын өзінен және көршілерден алыс ұстап, шайқап, қайта салу', 'Lift the tube out for a few seconds, mouth away from people, shake and put it back'), effect(S, lc, ctx) { S.sap.mixed = true; S.sap.lastShake = ctx.now(); S.sap.shakes = (S.sap.shakes || 0) + 1; }, log: L('Пробирка на несколько секунд вынута из бани и встряхнута; вскипание прекратилось', 'Пробирка бірнеше секундқа моншадан алынып, шайқалды; қайнап кету тоқтады', 'Tube lifted out for a few seconds and shaken; the boiling up stopped') },
      { ok: false, severity: 'safety', label: L('Заглянуть в пробирку сверху, что там происходит', 'Не болып жатқанын көру үшін пробиркаға жоғарыдан қарау', 'Look down into the tube to see what is happening'), remark: L('заглядывали сверху в нагреваемую пробирку со щёлочью', 'сілтісі бар қыздырылып жатқан пробиркаға жоғарыдан қарады', 'looked down into a heated tube of alkali'), whatif: L('Вскипающая жидкость выбрасывается вверх — горячая щёлочь попадает в глаза. Нагреваемую пробирку никогда не рассматривают сверху и не направляют на людей.', 'Қайнап кеткен сұйық жоғары атылады — ыстық сілті көзге түседі. Қыздырылып жатқан пробиркаға ешқашан жоғарыдан қарамайды және адамдарға бағыттамайды.', 'Liquid boiling up shoots upwards — hot alkali gets into the eyes. Never look down into a heated tube or point it at anyone.') },
      { ok: false, severity: 'safety', label: L('Зажать отверстие пальцем и встряхнуть', 'Аузын саусақпен басып, шайқау', 'Close the mouth with a finger and shake'), remark: L('отверстие пробирки с горячей щёлочью зажали пальцем', 'ыстық сілтісі бар пробирканың аузы саусақпен басылды', 'the mouth of a tube of hot alkali was closed with a finger'), whatif: L('Горячая 2 М щёлочь под пальцем — ожог кожи даже через перчатку, а давление паров выбрасывает жидкость. Пробирку встряхивают, не закрывая.', 'Саусақ астындағы ыстық 2 М сілті — қолғап арқылы да тері күйігі, ал бу қысымы сұйықты атып шығарады. Пробирканы жаппай шайқайды.', 'Hot 2 M alkali under a finger burns the skin even through a glove, and the vapour pressure throws the liquid out. The tube is shaken open.') },
    ],
  }],
  done: (S) => S.sap.out && S.sap.smelled && { text: L('Омыление закончено.', 'Сабындандыру аяқталды.', 'Saponification finished.') },
  scene: saponScene,
  get hints() {
    return [
      L('Гидроксид-ион реагирует с эфиром на границе слоёв, поэтому слои нужно часто перемешивать встряхиванием. Пробирку не закрывают.', 'Гидроксид-ион эфирмен қабаттар шекарасында әрекеттеседі, сондықтан қабаттарды шайқап жиі араластыру керек. Пробирканы жаппайды.', 'Hydroxide reacts with the ester at the interface, so the layers must be mixed often by shaking. The tube is not stoppered.'),
      L('Нагревайте 10–15 минут и встряхивайте хотя бы раз в минуту — тогда слой эфира исчезнет.', '10–15 минут қыздырып, кемінде минутына бір рет шайқаңыз — сонда эфир қабаты жоғалады.', 'Heat for 10–15 minutes and shake at least once a minute — then the ester layer disappears.'),
      saponH3(),
    ];
  },
};
/** Сколько секунд прошло без встряхивания (для подсказки). */
function ctx0(S) { return S.sap.lastShake < 0 ? S.sap.t : Math.max(0, (S.sap.tNow || 0) - S.sap.lastShake); }
const tickBase = s1.tick;
s1.tick = (S, lc, dt, ctx) => { S.sap.tNow = ctx.now(); tickBase(S, lc, dt, ctx); };

const s2 = {
  type: 'observe', id: 'sapobs',
  title: L('Вывод по омылению', 'Сабындандыру бойынша қорытынды', 'Conclusion on saponification'),
  instr: L('<p>Сравните, что было в пробирке до и после нагревания со щёлочью, и сделайте вывод.</p>', '<p>Сілтімен қыздыруға дейін және кейін пробиркада не болғанын салыстырып, қорытынды жасаңыз.</p>', '<p>Compare what was in the tube before and after heating with alkali and draw a conclusion.</p>'),
  need: L('Сделайте вывод', 'Қорытынды жасаңыз', 'Draw the conclusion'),
  question: L('Что показывает опыт?', 'Тәжірибе нені көрсетеді?', 'What does the experiment show?'),
  options: [
    { id: 'full', label: L('Слой эфира исчез, фруктовый запах сменился запахом бутанола: эфир необратимо омылён до ацетата натрия и спирта', 'Эфир қабаты жоғалды, жеміс иісі бутанол иісіне ауысты: эфир натрий ацетаты мен спиртке дейін қайтымсыз сабындандырылды', 'The ester layer disappeared and the fruity odour gave way to butanol: the ester was irreversibly saponified to sodium acetate and the alcohol') },
    { id: 'part', label: L('Слой эфира остался, запах эфира ещё чувствуется: омыление прошло не полностью — мало нагревали или встряхивали', 'Эфир қабаты қалды, эфир иісі әлі сезіледі: сабындандыру толық жүрмеді — аз қыздырылды немесе шайқалды', 'The ester layer remains and it still smells of ester: saponification is incomplete — too little heating or shaking') },
    { id: 'eq', label: L('Установилось равновесие: эфира и кислоты стало поровну', 'Тепе-теңдік орнады: эфир мен қышқыл тең болды', 'Equilibrium was reached with equal amounts of ester and acid') },
    { id: 'none', label: L('Ничего не произошло: эфиры со щёлочью не реагируют', 'Ештеңе болмады: эфирлер сілтімен әрекеттеспейді', 'Nothing happened: esters do not react with alkali') },
  ],
  correct: (S) => (S.sap.h > 0.9 ? 'full' : 'part'),
  why: (S) => (S.sap.h > 0.9 ? L('OH⁻ — сильный нуклеофил; образующийся карбоксилат-анион уже не атакуется спиртом, поэтому щелочной гидролиз необратим.', 'OH⁻ — күшті нуклеофил; түзілген карбоксилат-анионға спирт енді шабуыл жасамайды, сондықтан сілтілік гидролиз қайтымсыз.', 'OH⁻ is a strong nucleophile; the carboxylate anion formed is no longer attacked by the alcohol, so alkaline hydrolysis is irreversible.')
    : { ru: `Прореагировало только ≈ ${n(S.sap.h * 100, 0)} % эфира: реакция идёт на границе фаз, нужно чаще встряхивать и греть 10–15 мин.`, kk: `Эфирдің тек ≈ ${n(S.sap.h * 100, 0)} %-ы әрекеттесті: реакция фазалар шекарасында жүреді, жиі шайқап, 10–15 мин қыздыру керек.`, en: `Only ≈ ${n(S.sap.h * 100, 0)} % of the ester reacted: the reaction goes at the interface, so shake more often and heat for 10–15 min.` }),
};

const s3 = {
  type: 'cleanup', id: 'clean',
  title: L('Уборка рабочего места', 'Жұмыс орнын жинау', 'Cleaning up'),
  instr: L('<p>Рассортируйте отходы по контейнерам, выключите приборы, закройте склянки и вымойте руки (разделы 10 и 14 правил ТБ).</p><p class="note">Органические остатки — в ёмкость для органических отходов (раздел 7 методички).</p>',
    '<p>Қалдықтарды ыдыстар бойынша сұрыптаңыз, құралдарды өшіріңіз, склянкаларды жабыңыз және қолыңызды жуыңыз (ҚТ ережелерінің 10 және 14-бөлімдері).</p><p class="note">Органикалық қалдықтар — органикалық қалдықтар ыдысына (әдістеменің 7-бөлімі).</p>',
    '<p>Sort the waste into the containers, switch off the equipment, close the bottles and wash your hands (safety rules sections 10 and 14).</p><p class="note">Organic residues go into the organic waste container (manual, section 7).</p>'),
  need: L('Уберите рабочее место', 'Жұмыс орнын жинаңыз', 'Clean up the bench'),
  bins: ['acid', 'organic', 'solid', 'glass', 'sink', 'trash'],
  items: [
    { id: 'fore', bin: 'organic', label: L('Головная фракция и остаток из перегонной колбы', 'Бастапқы фракция және айдау колбасындағы қалдық', 'Fore-run and the distillation residue'),
      wrong: { sink: { severity: 'safety', text: L('органические остатки (эфир, бутанол) вылиты в раковину (пп. 5.5, 10.2 правил ТБ)', 'органикалық қалдықтар (эфир, бутанол) раковинаға төгілді (ҚТ ережелерінің 5.5, 10.2-тармақтары)', 'organic residues (ester, butanol) poured down the sink (safety rules 5.5, 10.2)'), whatif: L('Пары эфира и бутанола из канализации распространяются по лаборатории и могут вспыхнуть от удалённого источника огня; органика загрязняет сточные воды.', 'Кәрізден шыққан эфир мен бутанол булары зертхана бойынша таралып, алыстағы от көзінен тұтануы мүмкін; органика ағынды суды ластайды.', 'Ester and butanol vapour from the drain spreads through the lab and can ignite from a distant flame; organics pollute the waste water.') } } },
    { id: 'aq', bin: 'acid', label: L('Водные слои после промывок (вода, NaHCO₃, NaCl)', 'Жуудан кейінгі сулы қабаттар (су, NaHCO₃, NaCl)', 'Aqueous layers from the washes (water, NaHCO₃, NaCl)'),
      wrong: { sink: { severity: 'safety', text: L('кислые водные слои с растворённым бутанолом вылиты в раковину (п. 10.2 правил ТБ)', 'еріген бутанолы бар қышқыл сулы қабаттар раковинаға төгілді (ҚТ ережелерінің 10.2-тармағы)', 'acidic aqueous layers with dissolved butanol poured down the sink (safety rule 10.2)') } } },
    { id: 'na2so4', bin: 'solid', label: L('Na₂SO₄, смоченный эфиром, и кипелки', 'Эфирмен суланған Na₂SO₄ және қайнату тастары', 'Na₂SO₄ wet with ester, and boiling chips') },
    { id: 'tubes', bin: 'acid', label: L('Содержимое пробирок (NH₂OH·HCl, FeCl₃, NaOH, ацетат натрия)', 'Пробиркалардағы заттар (NH₂OH·HCl, FeCl₃, NaOH, натрий ацетаты)', 'Contents of the test tubes (NH₂OH·HCl, FeCl₃, NaOH, sodium acetate)'),
      wrong: { sink: { severity: 'safety', text: L('растворы с гидроксиламином и щёлочью вылиты в раковину (п. 10.2 правил ТБ)', 'гидроксиламин мен сілтісі бар ерітінділер раковинаға төгілді (ҚТ ережелерінің 10.2-тармағы)', 'solutions with hydroxylamine and alkali poured down the sink (safety rule 10.2)') } } },
    { id: 'paper', bin: 'solid', label: L('Использованная индикаторная бумага', 'Пайдаланылған индикатор қағазы', 'Used indicator paper') },
  ],
  switches: [
    { id: 'mantle', label: L('Выключить колбонагреватель и отключить от сети', 'Колба қыздырғышты өшіріп, желіден ажырату', 'Switch off and unplug the heating mantle') },
    { id: 'water', label: L('Закрыть воду в холодильниках', 'Мұздатқыштардағы суды жабу', 'Turn off the condenser water') },
    { id: 'bath', label: L('Выключить водяную баню', 'Су моншасын өшіру', 'Switch off the water bath') },
    { id: 'bottles', label: L('Закрыть склянки, убрать ЛВЖ в шкаф', 'Склянкаларды жауып, ТТС-ты шкафқа қою', 'Close the bottles and put the flammables away') },
    { id: 'product', label: L('Сдать продукт преподавателю в подписанной склянке', 'Өнімді оқытушыға жазуы бар склянкада тапсыру', 'Hand in the product in a labelled bottle'), log: L('Продукт сдан преподавателю в подписанной склянке', 'Өнім оқытушыға жазуы бар склянкада тапсырылды', 'Product handed in to the instructor in a labelled bottle') },
    { id: 'hands', label: L('Вымыть руки', 'Қолды жуу', 'Wash your hands'), log: L('Руки вымыты с мылом', 'Қол сабынмен жуылды', 'Hands washed with soap') },
  ],
};

export default {
  id: '4',
  title: L('Щелочной гидролиз (омыление) эфира', 'Эфирдің сілтілік гидролизі (сабындануы)', 'Alkaline hydrolysis (saponification) of the ester'),
  principle: L('Гидроксид-ион — сильный нуклеофил; он необратимо превращает эфир в соль карбоновой кислоты и спирт.', 'Гидроксид-ион — күшті нуклеофил; ол эфирді карбон қышқылының тұзы мен спиртке қайтымсыз айналдырады.', 'The hydroxide ion is a strong nucleophile; it converts the ester irreversibly into the carboxylate salt and the alcohol.'),
  equation: ['CH₃COOC₄H₉ + NaOH → CH₃COONa + C₄H₉OH'],
  initialState: () => ({ sap: { h: 0, t: 0, loaded: false, stopper: false, mixed: false, lastShake: -999, out: false, smelled: false, shakes: 0 } }),
  checkpoints: [0],
  steps: [s1, s2, s3],
  results: (S) => ({ h: S.sap.h, t: S.sap.t / 60, full: S.sap.h > 0.9 }),
  summary: (r) => [
    { label: L('Омыление', 'Сабындану', 'Saponification'), value: n(r.h * 100, 0) + ' %', st: r.full ? 'ok' : 'warn' },
    { label: L('Нагрев', 'Қыздыру', 'Heating'), value: { ru: n(r.t, 0) + ' мин', kk: n(r.t, 0) + ' мин', en: n(r.t, 0) + ' min' } },
  ],
};
