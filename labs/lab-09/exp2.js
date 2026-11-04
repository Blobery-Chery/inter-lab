/** Опыт 2. Синтез иодбензола. Методичка, раздел 6, опыт 2. */
import { L, n } from '../../app/i18n.js';
import { relax } from '../../app/instruments/thermal.js';
import { M, D_PHI, kiMmol, kHyd, kIod, freeAcid, alkaliPH, phenolInOrg, vapourT, distilPortion, productLook, theoretical, percentYield, lossBreakdown } from './model.js';
import { kiScene, washScene, distillScene, COL } from './scene.js';
import { text } from '../../app/scene/svg.js';

const g = (x, d = 2) => n(x, d);
const ml = (x, d = 1) => ({ ru: n(x, d) + ' мл', kk: n(x, d) + ' мл', en: n(x, d) + ' mL' });
const PORTIONS = 14;

/* ------------------------------------------------------------------ 0. навеска KI */
const e0 = {
  type: 'weigh', id: 'wKI',
  title: L('Навеска иодида калия', 'Калий иодидінің өлшендісі', 'Weighing the potassium iodide'),
  instr: L('<ol><li>Пока раствор соли диазония стоит во льду, возьмите <b>4,5 г (27 ммоль)</b> KI: лодочка → тарирование → вещество → закрыть дверцы → записать.</li></ol><p class="note">Допустимо 4,4–4,6 г. Соль диазония ждать не может — работайте без задержек.</p>',
    '<ol><li>Диазоний тұзының ерітіндісі мұзда тұрғанда <b>4,5 г (27 ммоль)</b> KI алыңыз: қайықша → тарировкалау → зат → есікшелерді жабу → жазу.</li></ol><p class="note">4,4–4,6 г рұқсат етіледі. Диазоний тұзы күте алмайды — кідірмей жұмыс істеңіз.</p>',
    '<ol><li>While the diazonium solution stands in ice, weigh <b>4.5 g (27 mmol)</b> of KI: boat → tare → solid → close the doors → record.</li></ol><p class="note">4.4–4.6 g is acceptable. The diazonium salt cannot wait — work without delay.</p>'),
  need: L('Запишите массу KI', 'KI массасын жазыңыз', 'Record the mass of KI'),
  reagent: L('KI', 'KI', 'KI'), mode: 'spatula', container: 'boat', target: 4.5, lo: 4.4, hi: 4.6, saveAs: 'mKI',
  onRecord(S, m, ctx) {
    S.nKI = kiMmol(m);
    ctx.log(L(`Навеска KI: <b>${n(m, 4)} г</b> = ${n(S.nKI, 1)} ммоль (соли диазония в колбе ≈ ${n(S.Dz, 1)} ммоль)`, `KI өлшендісі: <b>${n(m, 4)} г</b> = ${n(S.nKI, 1)} ммоль (колбадағы диазоний тұзы ≈ ${n(S.Dz, 1)} ммоль)`, `KI sample: <b>${n(m, 4)} g</b> = ${n(S.nKI, 1)} mmol (diazonium salt in the flask ≈ ${n(S.Dz, 1)} mmol)`), 'calc');
  },
};

/* ------------------------------------------------------------------ 1. раствор KI */
const e1 = {
  type: 'measure', id: 'kiw',
  title: L('Раствор иодида калия', 'Калий иодидінің ерітіндісі', 'Potassium iodide solution'),
  instr: L('<ol><li>Отмерьте цилиндром <b>7 мл</b> дистиллированной воды и растворите в ней KI.</li></ol>', '<ol><li>Цилиндрмен <b>7 мл</b> дистилденген су өлшеп, онда KI ерітіңіз.</li></ol>', '<ol><li>Measure <b>7 mL</b> of distilled water with a cylinder and dissolve the KI in it.</li></ol>'),
  need: L('Растворите KI в 7 мл воды', 'KI-ді 7 мл суда ерітіңіз', 'Dissolve the KI in 7 mL of water'),
  measure: 'cylinder-10', reagent: L('H₂O', 'H₂O', 'H₂O'), bottleSub: L('дист.', 'дист.', 'dist.'), target: 7, tol: 0.4, onDeviation: 'consequence', saveAs: 'vKIw',
  into: L('стаканчик с KI', 'KI бар стақанша', 'the beaker with KI'),
  then: [{ id: 'dis', label: L('Перемешать до растворения', 'Ерігенше араластыру', 'Stir until dissolved'), advance: 60, obs: L('KI растворился полностью; раствор бесцветный и заметно охладился (растворение KI эндотермично)', 'KI толық еріді; ерітінді түссіз және айтарлықтай салқындады (KI-дің еруі эндотермиялық)', 'The KI dissolved completely; the solution is colourless and has cooled noticeably (dissolving KI is endothermic)') }],
};

/* ------------------------------------------------------------------ 2. прибавление KI */
function react(S, dt, T) {
  // замещение на иод и гидролиз параллельно; I⁻ в избытке
  if (S.Dz <= 1e-6) return { rI: 0, rH: 0 };
  const iod = S.iodide > 0 ? Math.min(1, S.iodide / Math.max(0.5, S.Dz)) : 0;
  const kI = kIod(T) * iod, kH = kHyd(T);
  const f = 1 - Math.exp(-(kI + kH) * dt);
  const d = S.Dz * f;
  const dI = d * (kI / (kI + kH || 1)), dH = d - dI;
  S.Dz -= d; S.PhI += dI; S.iodide -= dI; S.phenolKI += dH;
  return { rI: dI / dt, rH: dH / dt };
}

const STOPPER = {
  ru: 'Из смеси непрерывно выделяется азот. В колбе, закрытой пробкой, давление растёт: пробку выбило, бурую смесь с иодом выбросило на стенки шкафа и на руки. В реальной лаборатории реакции с выделением газа никогда не проводят в закрытом сосуде (п. 7.4 правил ТБ); пролив собирают, кожу промывают водой не менее 15 минут, о происшествии сообщают преподавателю. Синтез повторяют с новой порцией соли диазония.',
  kk: 'Қоспадан үздіксіз азот бөлінеді. Тығынмен жабылған колбада қысым өседі: тығын атылып, иоды бар қоңыр қоспа шкаф қабырғаларына және қолға шашырады. Нақты зертханада газ бөлінетін реакцияларды ешқашан жабық ыдыста жүргізбейді (ҚТ ережелерінің 7.4-тармағы); төгілгенді жинап, теріні кемінде 15 минут сумен жуады, оқиға туралы оқытушыға хабарлайды. Синтез диазоний тұзының жаңа порциясымен қайталанады.',
  en: 'Nitrogen is being evolved continuously. In a stoppered flask the pressure builds up: the stopper blew out and the brown iodine-containing mixture was thrown over the hood walls and your hands. In a real lab, reactions that evolve gas are never run in a closed vessel (safety rule 7.4); the spill is cleaned up, skin is rinsed with water for at least 15 minutes and the instructor is told. The synthesis is repeated with a new batch of diazonium salt.',
};

const e2 = {
  type: 'add', id: 'addKI',
  title: L('Прибавление раствора KI к соли диазония', 'KI ерітіндісін диазоний тұзына қосу', 'Adding the KI solution to the diazonium salt'),
  instr: L('<ol><li>Прибавляйте раствор KI к <b>холодному</b> раствору соли диазония <b>медленно</b>, порциями по 0,5 мл, при перемешивании.</li><li>Появляется бурая окраска, выделяется азот — смесь пенится. Не давайте пене подняться к горлу колбы.</li></ol>',
    '<ol><li>KI ерітіндісін <b>суық</b> диазоний тұзы ерітіндісіне араластыра отырып, 0,5 мл-ден порциялап, <b>баяу</b> қосыңыз.</li><li>Қоңыр түс пайда болады, азот бөлінеді — қоспа көпіршиді. Көбіктің колба мойнына дейін көтерілуіне жол бермеңіз.</li></ol>',
    '<ol><li>Add the KI solution to the <b>cold</b> diazonium solution <b>slowly</b>, in 0.5 mL portions, with stirring.</li><li>A brown colour appears and nitrogen is evolved — the mixture froths. Do not let the froth rise to the neck of the flask.</li></ol>'),
  need: L('Прибавьте весь раствор KI', 'KI ерітіндісін түгел қосыңыз', 'Add all of the KI solution'),
  speeds: [5, 10, 20],
  setup(S, lc) { lc.c.stir = false; S.T = Math.min(S.T, 4); },
  add: {
    label: L('Порция KI (0,5 мл)', 'KI порциясы (0,5 мл)', 'KI portion (0.5 mL)'), total: PORTIONS, big: true,
    group: L('Раствор KI · интервал между порциями', 'KI ерітіндісі · порциялар арасындағы аралық', 'KI solution · interval between portions'),
    rhythms: [[0, L('вручную', 'қолмен', 'by hand')], [30, L('30 с', '30 с', '30 s')], [15, L('15 с', '15 с', '15 s')], [3, L('3 с', '3 с', '3 s')]],
    onAdd(S, lc, ctx) {
      if (S.k.t0 == null) { S.k.t0 = ctx.now(); ctx.log(L('Начато прибавление раствора KI', 'KI ерітіндісін қосу басталды', 'Addition of the KI solution started')); }
      S.iodide += S.nKI / PORTIONS; S.V += (S.vKIw || 7) / PORTIONS;
      // быстрая начальная реакция у капли: азот и пена
      const dr = Math.min(S.Dz, 0.035 * S.Dz0);
      S.Dz -= dr; S.PhI += dr; S.iodide -= dr;
      S.foam += (dr / Math.max(1, S.Dz0)) * (lc.c.stir ? 4.2 : 5.5);
      lc.dropKey = (lc.dropKey || 0) + 1;
      if (lc.added === 1) ctx.log(L('С первой порцией появилась бурая окраска, началось выделение пузырьков газа (N₂)', 'Бірінші порциямен қоңыр түс пайда болып, газ көпіршіктерінің (N₂) бөлінуі басталды', 'With the first portion a brown colour appeared and gas bubbles (N₂) began to form'), 'obs');
      if (lc.added >= PORTIONS) {
        S.k.t1 = ctx.now();
        const min = (S.k.t1 - S.k.t0) / 60;
        if (min < 2) ctx.remark({ key: 'kifast', severity: 'minor', text: L(`раствор KI прибавлен слишком быстро (${n(min, 1)} мин)`, `KI ерітіндісі тым жылдам қосылды (${n(min, 1)} мин)`, `KI solution added too quickly (${n(min, 1)} min)`) });
        ctx.log(L(`Весь раствор KI прибавлен за ${n(min, 1)} мин; смесь тёмно-бурая, выделяется азот`, `KI ерітіндісі ${n(min, 1)} мин ішінде түгел қосылды; қоспа қою қоңыр, азот бөлінуде`, `All the KI solution added in ${n(min, 1)} min; the mixture is dark brown and nitrogen is being evolved`), 'obs');
      }
    },
  },
  controls: [
    { kind: 'toggle', id: 'stir', group: L('Колба', 'Колба', 'Flask'), label: L('Перемешивать', 'Араластыру', 'Stir'), labelOn: L('Перемешивание: вкл.', 'Араластыру: қосулы', 'Stirring: on') },
  ],
  tick(S, lc, dt) {
    S.T = relax(S.T, 3, 0.01, dt);
    const r = react(S, dt, S.T);
    S.gas = r.rI + r.rH;
    S.foam = Math.max(0, S.foam * Math.exp(-(lc.c.stir ? 0.07 : 0.05) * dt));
    if (S.foam > 1.15 && !S.k.over) { S.k.over = true; S.lossFoam += 0.05; }
  },
  alerts(S) {
    if (S.foam > 0.8) return { text: L('Пена у горла колбы! Остановите прибавление и перемешивайте, пока пена не осядет.', 'Көбік колба мойнында! Қосуды тоқтатып, көбік басылғанша араластырыңыз.', 'Froth at the neck of the flask! Stop adding and stir until it subsides.'), kind: 'bad' };
    if (S.foam > 0.45) return { text: L('Смесь сильно пенится — прибавляйте медленнее.', 'Қоспа қатты көпіршиді — баяуырақ қосыңыз.', 'The mixture is frothing a lot — add more slowly.'), kind: 'warn' };
    return null;
  },
  events: [{
    id: 'foam', when: (S) => S.foam > 0.8,
    title: L('Пена поднимается к горлу колбы', 'Көбік колба мойнына көтерілуде', 'The froth is rising to the neck of the flask'),
    text: L('Азот выделяется бурно, бурая пена быстро поднимается. Что вы сделаете?', 'Азот қарқынды бөлінуде, қоңыр көбік тез көтерілуде. Не істейсіз?', 'Nitrogen is coming off vigorously and the brown froth is rising fast. What do you do?'),
    options: [
      { ok: true, label: L('Прекратить прибавление и перемешивать, пока пена не осядет; дальше — медленнее', 'Қосуды тоқтатып, көбік басылғанша араластыру; әрі қарай — баяуырақ', 'Stop adding and stir until the froth subsides; then go more slowly'), effect(S, lc) { lc.rh = 0; lc.c.stir = true; S.foam *= 0.4; }, log: L('Прибавление остановлено, смесь перемешивается — пена осела', 'Қосу тоқтатылды, қоспа араластырылуда — көбік басылды', 'Addition stopped, the mixture is stirred — the froth has subsided') },
      { ok: false, severity: 'major', label: L('Продолжать прибавление в том же темпе', 'Қосуды сол қарқынмен жалғастыру', 'Keep adding at the same rate'), remark: L('прибавление KI продолжено при сильном вспенивании — часть смеси перелилась через край', 'қатты көпіршу кезінде KI қосу жалғастырылды — қоспаның бір бөлігі шетінен асып төгілді', 'KI addition continued despite heavy frothing — some of the mixture foamed over'), effect(S) { S.lossFoam += 0.07; S.foam = 0.3; } },
      { ok: false, label: L('Закрыть колбу пробкой, чтобы пена не вышла наружу', 'Көбік сыртқа шықпауы үшін колбаны тығынмен жабу', 'Stopper the flask so the froth cannot get out'), remark: L('колба с выделяющимся азотом закрыта пробкой (п. 7.4 правил ТБ)', 'азот бөлініп жатқан колба тығынмен жабылды (ҚТ ережелерінің 7.4-тармағы)', 'flask evolving nitrogen was stoppered (safety rule 7.4)'), critical: { text: STOPPER } },
    ],
  }],
  done: (S, lc) => lc.added >= PORTIONS && S.foam < 0.6 && { text: L('Раствор KI прибавлен.', 'KI ерітіндісі қосылды.', 'The KI solution has been added.') },
  scene: (S, lc) => kiScene(S, { vol: S.V, T: S.T, foam: S.foam, gas: Math.min(1, S.gas * 30), oil: 0, pip: true, dropKey: lc.dropKey, color: lc.added ? COL.brown : COL.diaz }),
  hints: [
    L('Выделение азота идёт сразу: следите за пеной и прибавляйте порциями с паузами.', 'Азот бірден бөлінеді: көбікті бақылап, үзіліспен порциялап қосыңыз.', 'Nitrogen comes off at once: watch the froth and add in portions with pauses.'),
    L('Ритм 15–30 с и перемешивание дают пене оседать между порциями.', '15–30 с ырғақ пен араластыру көбіктің порциялар арасында басылуына мүмкіндік береді.', 'A 15–30 s rhythm with stirring lets the froth settle between portions.'),
    L('Включите перемешивание, выберите ритм 15 с и дождитесь последней порции.', 'Араластыруды қосып, 15 с ырғағын таңдап, соңғы порцияны күтіңіз.', 'Switch stirring on, choose the 15 s rhythm and wait for the last portion.'),
  ],
};
e2.readouts = (S, lc) => [
  { label: L('Смесь', 'Қоспа', 'Mixture'), value: n(S.T, 1) + ' °C' },
  { label: L('Порций KI', 'KI порциясы', 'KI portions'), value: `${lc.added} / ${PORTIONS}` },
  { label: L('Пена', 'Көбік', 'Froth'), value: S.foam > 0.8 ? L('у горла!', 'мойнында!', 'at the neck!') : S.foam > 0.45 ? L('высокая', 'биік', 'high') : S.foam > 0.15 ? L('умеренная', 'орташа', 'moderate') : L('мало', 'аз', 'little'), st: S.foam > 0.8 ? 'bad' : S.foam > 0.45 ? 'warn' : 'ok' },
];

/* ------------------------------------------------------------------ 3. выдержка и нагрев */
const gasWord = (r) => (r > 0.05 ? L('бурное', 'қарқынды', 'vigorous') : r > 0.012 ? L('заметное', 'айқын', 'steady') : r > 0.002 ? L('слабое', 'әлсіз', 'slight') : L('прекратилось', 'тоқтады', 'stopped'));

const e3 = {
  type: 'process', id: 'heat',
  title: L('Выдержка и нагревание на водяной бане', 'Ұстау және су моншасында қыздыру', 'Standing and warming on a water bath'),
  instr: L('<ol><li>Оставьте смесь при комнатной температуре на <b>15–20 минут</b>.</li><li>Затем нагревайте на водяной бане при <b>60–70 °C</b>, пока не прекратится выделение азота.</li><li>Тяжёлое тёмное масло (сырой иодбензол) собирается на дне.</li></ol><p class="note">Колба открыта — газ должен свободно выходить. Плитку без присмотра не оставляют (п. 7.2).</p>',
    '<ol><li>Қоспаны бөлме температурасында <b>15–20 минутқа</b> қалдырыңыз.</li><li>Содан кейін азоттың бөлінуі тоқтағанша су моншасында <b>60–70 °C</b>-та қыздырыңыз.</li><li>Ауыр қара май (шикі иодбензол) түбіне жиналады.</li></ol><p class="note">Колба ашық — газ еркін шығуы тиіс. Плитаны қараусыз қалдырмайды (7.2-тармақ).</p>',
    '<ol><li>Leave the mixture at room temperature for <b>15–20 minutes</b>.</li><li>Then warm it on a water bath at <b>60–70 °C</b> until nitrogen evolution stops.</li><li>A heavy dark oil (crude iodobenzene) collects at the bottom.</li></ol><p class="note">The flask is open — the gas must escape freely. Never leave the hot plate unattended (rule 7.2).</p>'),
  need: L('Доведите реакцию до конца выделения азота', 'Реакцияны азоттың бөлінуі тоқтағанша жеткізіңіз', 'Take the reaction to the end of nitrogen evolution'),
  speeds: [10, 30, 60],
  setup(S, lc) { lc.c.set = lc.c.set ?? 50; S.place = S.place || 'ice'; S.Tb = S.Tb ?? 22; lc.room = 0; lc.bath = 0; lc.hot = 0; },
  controls: [
    { kind: 'action', id: 'out', group: L('Колба', 'Колба', 'Flask'), label: L('Вынуть из ледяной бани — выдержка при комнатной t', 'Мұз моншасынан алу — бөлме t-да ұстау', 'Out of the ice bath — stand at room temperature'), advance: 15, do(S) { S.place = 'room'; }, log: L('Колба вынута из ледяной бани и оставлена при комнатной температуре', 'Колба мұз моншасынан алынып, бөлме температурасында қалдырылды', 'Flask taken out of the ice bath and left at room temperature') },
    { kind: 'action', id: 'in', group: L('Колба', 'Колба', 'Flask'), label: L('Поставить колбу на водяную баню', 'Колбаны су моншасына қою', 'Put the flask on the water bath'), advance: 15,
      do(S, lc, ctx) {
        if (lc.room < 15 * 60) ctx.remark({ key: 'stand', severity: 'minor', text: L(`смесь нагревали, не выдержав 15–20 мин при комнатной температуре (${n(lc.room / 60, 0)} мин)`, `қоспа бөлме температурасында 15–20 мин ұсталмай қыздырылды (${n(lc.room / 60, 0)} мин)`, `mixture warmed before standing 15–20 min at room temperature (${n(lc.room / 60, 0)} min)`) });
        S.place = 'bath';
      }, log: L('Колба поставлена на водяную баню', 'Колба су моншасына қойылды', 'Flask placed on the water bath') },
    { kind: 'toggle', id: 'heat', group: L('Водяная баня', 'Су моншасы', 'Water bath'), label: L('Плитка: включить', 'Плита: қосу', 'Hot plate: on'), labelOn: L('Плитка: выключить', 'Плита: өшіру', 'Hot plate: off') },
    { kind: 'seg', id: 'set', group: L('Водяная баня', 'Су моншасы', 'Water bath'), label: L('Регулятор бани', 'Монша реттегіші', 'Bath setting'), options: [[50, '50 °C'], [65, '65 °C'], [80, '80 °C'], [100, L('кипение', 'қайнау', 'boiling')]], default: 50 },
    { kind: 'action', id: 'off', cls: 'pri', group: L('Окончание', 'Аяқтау', 'Finishing'), label: L('Газ больше не выделяется — снять с бани, охладить', 'Газ бөлінбейді — моншадан алып, салқындату', 'No more gas — take off the bath and cool'), advance: 600,
      disabled: (S) => S.place !== 'bath',
      do(S, lc, ctx) {
        const left = S.Dz / Math.max(1, S.Dz0);
        if (left > 0.03) {
          ctx.remark({ key: 'early', severity: 'major', text: L('нагревание прекращено до окончания выделения азота — часть соли диазония не прореагировала', 'азоттың бөлінуі аяқталмай қыздыру тоқтатылды — диазоний тұзының бір бөлігі әрекеттеспеді', 'heating stopped before nitrogen evolution ended — some diazonium salt did not react') });
          S.unreacted = S.Dz;
        }
        S.place = 'room'; lc.c.heat = false; S.T = 25; lc.finished = true;
        ctx.log(L(`Выделение азота ${left > 0.03 ? 'ещё продолжалось' : 'прекратилось'}; колба снята с бани и охлаждена. На дне — тяжёлое тёмное масло (сырой иодбензол) под бурым водным слоем`, `Азоттың бөлінуі ${left > 0.03 ? 'әлі жалғасып жатты' : 'тоқтады'}; колба моншадан алынып, салқындатылды. Түбінде — қоңыр сулы қабаттың астында ауыр қара май (шикі иодбензол)`, `Nitrogen evolution ${left > 0.03 ? 'was still going on' : 'had stopped'}; the flask was taken off the bath and cooled. A heavy dark oil (crude iodobenzene) lies at the bottom under a brown aqueous layer`), 'obs');
      } },
  ],
  tick(S, lc, dt, ctx) {
    if (lc.finished) return;
    S.Tb = relax(S.Tb, lc.c.heat ? lc.c.set + 1 : 22, lc.c.heat ? 0.008 : 0.003, dt);
    const tgt = S.place === 'bath' ? S.Tb : S.place === 'ice' ? 3 : 22;
    S.T = relax(S.T, tgt, S.place === 'bath' ? 0.012 : 0.0035, dt);
    if (S.place === 'room') lc.room += dt;
    if (S.place === 'bath') { lc.bath += dt; S.maxT = Math.max(S.maxT, S.T); }
    const r = react(S, dt, S.T);
    S.gas = r.rI + r.rH;
    S.foam = relax(S.foam, Math.min(1.6, (S.gas / Math.max(1, S.Dz0)) * 140), 0.05, dt);
    if (S.place === 'bath' && S.T > 76) { lc.hot += dt; if (lc.hot > 60) ctx.remark({ key: 'hotbath', severity: 'major', text: L('смесь перегрета выше 75 °C — гидролиз до фенола конкурирует с замещением на иод', 'қоспа 75 °C-тан жоғары қызды — фенолға дейінгі гидролиз иодпен орынбасумен бәсекелеседі', 'mixture overheated above 75 °C — hydrolysis to phenol competes with iodination') }); }
  },
  readouts: (S, lc) => [
    { label: L('Смесь', 'Қоспа', 'Mixture'), value: n(S.T, 0) + ' °C', st: S.place === 'bath' ? (S.T >= 58 && S.T <= 72 ? 'ok' : S.T > 75 ? 'warn' : '') : '' },
    { label: L('Баня', 'Монша', 'Bath'), value: n(S.Tb, 0) + ' °C' },
    { label: L('Выделение N₂', 'N₂ бөлінуі', 'N₂ evolution'), value: gasWord(S.gas), st: S.gas <= 0.002 ? 'ok' : '' },
    { label: L('При комн. t', 'Бөлме t-да', 'At room t'), value: { ru: n(lc.room / 60, 0) + ' мин', kk: n(lc.room / 60, 0) + ' мин', en: n(lc.room / 60, 0) + ' min' }, st: lc.room >= 900 ? 'ok' : '' },
  ],
  alerts(S, lc) {
    if (lc.finished) return null;
    if (S.place === 'bath' && S.T > 75) return { text: L('Выше 70 °C: растёт доля фенола (гидролиз), смесь бурно пенится. Уменьшите нагрев бани до 60–70 °C.', '70 °C-тан жоғары: фенол үлесі өседі (гидролиз), қоспа қатты көпіршиді. Монша қызуын 60–70 °C-қа дейін азайтыңыз.', 'Above 70 °C: more phenol forms (hydrolysis) and the mixture froths hard. Turn the bath down to 60–70 °C.'), kind: 'warn' };
    if (S.place === 'bath' && S.T > 55 && S.gas <= 0.002) return { text: L('Пузырьков больше нет — выделение азота закончилось.', 'Көпіршіктер жоқ — азоттың бөлінуі аяқталды.', 'No more bubbles — nitrogen evolution is over.'), kind: 'good' };
    return null;
  },
  events: [{
    id: 'foam2', when: (S) => S.foam > 0.9,
    title: L('Смесь вспенивается на бане', 'Қоспа моншада көпіршиді', 'The mixture is frothing on the bath'),
    text: L('При нагревании азот выделяется очень бурно, пена подходит к горлу колбы. Ваши действия?', 'Қыздырғанда азот өте қарқынды бөлінуде, көбік колба мойнына жақындады. Әрекетіңіз?', 'On warming, nitrogen is coming off very vigorously and the froth is nearing the neck of the flask. What do you do?'),
    options: [
      { ok: true, label: L('Снять колбу с бани, перемешать, дать пене осесть; затем греть при 60–70 °C', 'Колбаны моншадан алып, араластырып, көбіктің басылуын күту; содан кейін 60–70 °C-та қыздыру', 'Lift the flask off the bath, swirl, let the froth settle; then warm at 60–70 °C'), effect(S, lc) { S.place = 'room'; S.foam *= 0.3; S.T -= 6; if (lc.c.set > 65) lc.c.set = 65; }, log: L('Колба снята с бани, пена осела; нагрев продолжен при 65 °C', 'Колба моншадан алынды, көбік басылды; қыздыру 65 °C-та жалғасты', 'Flask lifted off the bath, the froth settled; warming continued at 65 °C') },
      { ok: false, severity: 'major', label: L('Ничего не менять — пена осядет сама', 'Ештеңені өзгертпеу — көбік өзі басылады', 'Change nothing — the froth will settle by itself'), remark: L('смесь перелилась через край колбы при нагревании', 'қыздыру кезінде қоспа колба шетінен асып төгілді', 'the mixture foamed over the rim of the flask on warming'), effect(S) { S.lossFoam += 0.08; S.foam = 0.4; } },
      { ok: false, label: L('Закрыть колбу пробкой', 'Колбаны тығынмен жабу', 'Stopper the flask'), remark: L('колба с выделяющимся азотом закрыта пробкой при нагревании (п. 7.4 правил ТБ)', 'қыздыру кезінде азот бөлініп жатқан колба тығынмен жабылды (ҚТ ережелерінің 7.4-тармағы)', 'flask evolving nitrogen stoppered while being warmed (safety rule 7.4)'), critical: { text: STOPPER } },
    ],
  }],
  chart: { label: L('Температура смеси', 'Қоспа температурасы', 'Mixture temperature'), value: (S) => S.T, min: 0, max: 100, band: [60, 70], limit: 70, every: 10, active: (S, lc) => !lc.finished },
  done: (S, lc) => lc.finished && { text: L('Замещение закончено. На дне — тёмное тяжёлое масло.', 'Орынбасу аяқталды. Түбінде — қара ауыр май.', 'The replacement is complete. A dark heavy oil lies at the bottom.') },
  scene: (S, lc) => kiScene(S, { inBath: S.place === 'bath', heat: lc.c && lc.c.heat, T: S.T, Tb: S.Tb, vol: S.V, foam: S.foam, gas: Math.min(1, S.gas * 25), oil: Math.min(1, S.PhI / Math.max(1, S.Dz0)) }),
  hints: [
    L('Сначала 15–20 мин при комнатной температуре, затем водяная баня 60–70 °C — до прекращения пузырьков.', 'Алдымен бөлме температурасында 15–20 мин, содан кейін су моншасы 60–70 °C — көпіршіктер тоқтағанша.', 'First 15–20 min at room temperature, then a water bath at 60–70 °C until the bubbles stop.'),
    L('Кипящая баня (100 °C) или 80 °C — слишком горячо: больше фенола и сильная пена. Регулятор — на 65 °C.', 'Қайнаған монша (100 °C) немесе 80 °C — тым ыстық: фенол көбірек және қатты көбік. Реттегіш — 65 °C-қа.', 'A boiling (100 °C) or 80 °C bath is too hot: more phenol and heavy frothing. Set the regulator to 65 °C.'),
    L('«Вынуть из ледяной бани», выждать ≥ 15 мин (ход времени ×60), «Поставить на баню», плитка включена, 65 °C; когда «Выделение N₂: прекратилось» — «Снять с бани».', '«Мұз моншасынан алу», ≥ 15 мин күту (уақыт ×60), «Су моншасына қою», плита қосулы, 65 °C; «N₂ бөлінуі: тоқтады» болғанда — «Моншадан алу».', '“Out of the ice bath”, wait ≥ 15 min (time ×60), “Put on the water bath”, hot plate on, 65 °C; when “N₂ evolution: stopped”, “Take off the bath”.'),
  ],
};

/* ------------------------------------------------------------------ 4. подщелачивание */
const e4 = {
  type: 'decide', id: 'alk',
  title: L('Подщелачивание: удаление фенола', 'Сілтілендіру: фенолды жою', 'Making alkaline: removing the phenol'),
  instr: L('<p>Охладите смесь и сделайте её <b>сильнощелочной</b> 10 % NaOH: побочный фенол переходит в растворимый в воде фенолят натрия. Выберите объём щёлочи и действие; среду проверят индикаторной бумагой.</p><p class="note">10 % NaOH — едкий раствор: очки и перчатки.</p>',
    '<p>Қоспаны салқындатып, 10 % NaOH-пен <b>күшті сілтілі</b> етіңіз: қосымша фенол суда еритін натрий фенолятына айналады. Сілті көлемін және әрекетті таңдаңыз; ортаны индикатор қағазымен тексереді.</p><p class="note">10 % NaOH — күйдіргіш ерітінді: көзілдірік пен қолғап.</p>',
    '<p>Cool the mixture and make it <b>strongly alkaline</b> with 10 % NaOH: the phenol by-product becomes water-soluble sodium phenoxide. Choose the volume of alkali and the action; the medium will be checked with indicator paper.</p><p class="note">10 % NaOH is caustic: goggles and gloves.</p>'),
  need: L('Подщелочите смесь', 'Қоспаны сілтілендіріңіз', 'Make the mixture alkaline'),
  inputs: [{ id: 'naoh', label: L('10 % NaOH, мл', '10 % NaOH, мл', '10 % NaOH, mL'), min: 0, max: 25, step: 1, value: 4, unit: L('мл', 'мл', 'mL') }],
  question: L('Как подготовить смесь к выделению иодбензола?', 'Иодбензолды бөліп алуға қоспаны қалай дайындайды?', 'How do you prepare the mixture for isolating the iodobenzene?'),
  options: [
    { id: 'ok', ok: true, label: L('Охладить, прилить выбранный объём NaOH при перемешивании, проверить среду бумагой', 'Салқындатып, таңдалған NaOH көлемін араластыра отырып құю, ортаны қағазбен тексеру', 'Cool, add the chosen volume of NaOH with stirring, check the medium with paper'), advance: 240, why: L('фенол (pKa 10) переходит в фенолят только в сильнощелочной среде', 'фенол (pKa 10) тек күшті сілтілі ортада фенолятқа айналады', 'phenol (pKa 10) becomes phenoxide only in strongly alkaline solution') },
    { id: 'hot', ok: false, severity: 'safety', label: L('Сразу прилить NaOH в горячую смесь, не охлаждая', 'NaOH-ты салқындатпай, бірден ыстық қоспаға құю', 'Pour the NaOH straight into the hot mixture without cooling'), advance: 120,
      remark: L('щёлочь прилита к горячей смеси — разбрызгивание едкой жидкости', 'сілті ыстық қоспаға құйылды — күйдіргіш сұйықтықтың шашырауы', 'alkali added to the hot mixture — caustic liquid spattered'),
      whatif: L('Нейтрализация экзотермична: горячая смесь вскипает и разбрызгивается, капли щёлочи с иодбензолом попадают на руки и лицо. Смесь сначала охлаждают.', 'Бейтараптау экзотермиялық: ыстық қоспа қайнап, шашырайды, иодбензолы бар сілті тамшылары қол мен бетке түседі. Қоспаны алдымен салқындатады.', 'Neutralisation is exothermic: the hot mixture boils up and spatters, and drops of alkali with iodobenzene land on hands and face. Cool the mixture first.') },
    { id: 'none', ok: false, severity: 'major', label: L('Не подщелачивать — сразу выделять продукт', 'Сілтілендірмеу — өнімді бірден бөліп алу', 'Do not add alkali — isolate the product straight away'), advance: 30,
      remark: L('смесь не подщелочена — фенол останется в иодбензоле', 'қоспа сілтілендірілмеді — фенол иодбензолда қалады', 'mixture not made alkaline — phenol will stay in the iodobenzene'),
      whatif: L('В кислой среде фенол не ионизирован и растворяется в иодбензоле. При перегонке он идёт вместе с продуктом (т. кип. 182 °C): фракция начнёт кипеть ниже 185 °C, продукт будет загрязнён.', 'Қышқыл ортада фенол иондалмайды және иодбензолда ериді. Айдағанда ол өніммен бірге шығады (қайнау t 182 °C): фракция 185 °C-тан төмен қайнай бастайды, өнім ластанады.', 'In acid the phenol is not ionised and dissolves in the iodobenzene. On distillation it comes over with the product (b.p. 182 °C): the fraction starts boiling below 185 °C and the product is contaminated.') },
  ],
  check(S, inp, ctx, o) {
    const v = o.id === 'none' ? 0 : inp.naoh;
    const P = S.phenolDiaz + S.phenolKI;
    // свободная HCl: остаток после диазотирования + HCl от гидролиза соли диазония в этом опыте (1 HCl на 1 фенол)
    const pH = alkaliPH(v, S.H + S.phenolKI, P, S.V);
    S.vNaOH = v; S.V += v; S.pH = pH; S.phOrg = phenolInOrg(pH);
    const r = Math.round(pH);
    ctx.log(v ? L(`Прилито ${v} мл 10 % NaOH; индикаторная бумага: pH ≈ ${r}`, `${v} мл 10 % NaOH құйылды; индикатор қағазы: pH ≈ ${r}`, `${v} mL of 10 % NaOH added; indicator paper: pH ≈ ${r}`) : L(`Щёлочь не прибавлялась; среда кислая (pH ≈ ${r})`, `Сілті қосылмады; орта қышқыл (pH ≈ ${r})`, `No alkali added; the medium is acidic (pH ≈ ${r})`), 'obs');
    if (o.id !== 'none' && pH < 12) ctx.remark({ key: 'alkLow', severity: 'major', text: L(`щёлочи недостаточно (pH ≈ ${r}) — фенол не полностью перешёл в фенолят`, `сілті жеткіліксіз (pH ≈ ${r}) — фенол фенолятқа толық айналмады`, `not enough alkali (pH ≈ ${r}) — the phenol was not fully converted to phenoxide`) });
    if (pH >= 12) ctx.log(L('Смесь сильнощелочная; фенол перешёл в водный слой в виде фенолята натрия', 'Қоспа күшті сілтілі; фенол натрий феноляты түрінде сулы қабатқа өтті', 'The mixture is strongly alkaline; the phenol has gone into the aqueous layer as sodium phenoxide'), 'obs');
    if (S.unreacted > 0.3 && pH > 8) { ctx.log(L('В щелочной среде непрореагировавшая соль диазония сочетается с фенолятом — смесь краснеет, выпадает смолистый осадок', 'Сілтілі ортада әрекеттеспеген диазоний тұзы фенолятпен қосылады — қоспа қызарып, шайырлы тұнба түзіледі', 'In alkali the unreacted diazonium salt couples with phenoxide — the mixture turns red and a tarry solid separates'), 'obs'); }
  },
  feedback: (S) => (S.pH >= 12 ? L('Среда сильнощелочная (pH ≥ 12).', 'Орта күшті сілтілі (pH ≥ 12).', 'The medium is strongly alkaline (pH ≥ 12).') : L('Среда не сильнощелочная — фенол частично останется с продуктом.', 'Орта күшті сілтілі емес — фенол ішінара өніммен бірге қалады.', 'The medium is not strongly alkaline — some phenol will stay with the product.')),
  hints: [
    L('Сначала нейтрализуется оставшаяся HCl (≈ 3 экв. было взято на анилин), потом фенол → фенолят. Нужен избыток.', 'Алдымен қалған HCl бейтараптанады (анилинге ≈ 3 экв. алынған), содан кейін фенол → фенолят. Артық мөлшер қажет.', 'First the remaining HCl is neutralised (≈ 3 equiv. were taken per aniline), then phenol → phenoxide. An excess is needed.'),
    L('В смеси ≈ 20–25 ммоль свободной кислоты (75,7 ммоль HCl − 25 на анилин − 26 на HNO₂, плюс HCl от гидролиза) и ещё фенол; 1 мл 10 % NaOH ≈ 2,8 ммоль. 4–8 мл мало.', 'Қоспада ≈ 20–25 ммоль бос қышқыл (75,7 ммоль HCl − анилинге 25 − HNO₂-ге 26, оған гидролизден түзілген HCl қосылады) және фенол бар; 1 мл 10 % NaOH ≈ 2,8 ммоль. 4–8 мл аз.', 'The mixture holds ≈ 20–25 mmol of free acid (75.7 mmol HCl − 25 for the aniline − 26 for HNO₂, plus HCl from hydrolysis) as well as phenol; 1 mL of 10 % NaOH ≈ 2.8 mmol. 4–8 mL is too little.'),
    L('15 мл 10 % NaOH, вариант «Охладить, прилить… проверить среду» — pH ≈ 13–14.', '15 мл 10 % NaOH, «Салқындатып, құю… ортаны тексеру» нұсқасы — pH ≈ 13–14.', '15 mL of 10 % NaOH and “Cool, add… check the medium” — pH ≈ 13–14.'),
  ],
  scene: (S, lc) => kiScene(S, { T: 22, vol: S.V + ((lc.inp && lc.inp.naoh) || 0), oil: 0.8, color: COL.brown }),
};

/* ------------------------------------------------------------------ 5. делительная воронка */
const e5 = {
  type: 'separate', id: 'funnel', mode: 'funnel', keep: 'org',
  title: L('Отделение иодбензола в делительной воронке', 'Иодбензолды бөлгіш шұңғымада бөлу', 'Separating the iodobenzene in a separating funnel'),
  instr: L('<ol><li>Перенесите смесь в делительную воронку (кран закрыт), закройте пробкой, перемешайте, выпуская газ, и дайте слоям разделиться.</li><li>Снимите пробку и слейте <b>нижний</b> слой в чистую колбочку. Решите, какой слой содержит продукт.</li></ol><p class="note">Перегонка с водяным паром в этой лаборатории недоступна — используется вариант методички с делительной воронкой. d(C₆H₅I) = 1,83 г/мл.</p>',
    '<ol><li>Қоспаны бөлгіш шұңғымаға ауыстырыңыз (шүмек жабық), тығынмен жабыңыз, газды шығара отырып араластырыңыз және қабаттардың бөлінуін күтіңіз.</li><li>Тығынды алып, <b>төменгі</b> қабатты таза колбаға ағызыңыз. Өнім қай қабатта екенін шешіңіз.</li></ol><p class="note">Бұл зертханада су буымен айдау қолжетімсіз — әдістеменің бөлгіш шұңғымамен нұсқасы қолданылады. d(C₆H₅I) = 1,83 г/мл.</p>',
    '<ol><li>Transfer the mixture to a separating funnel (stopcock closed), stopper it, mix while venting and let the layers separate.</li><li>Remove the stopper and run the <b>lower</b> layer into a clean small flask. Decide which layer contains the product.</li></ol><p class="note">Steam distillation is not available in this lab, so the manual’s separating-funnel option is used. d(C₆H₅I) = 1.83 g/mL.</p>'),
  need: L('Отделите слой продукта', 'Өнім қабатын бөліңіз', 'Separate the product layer'),
  layers: [
    { id: 'org', label: L('нижний слой — тёмный, тяжёлый, маслянистый', 'төменгі қабат — қара, ауыр, майлы', 'lower layer — dark, heavy, oily'), color: COL.oil, frac: 0.12 },
    { id: 'aq', label: L('верхний слой — светлый, большой по объёму', 'жоғарғы қабат — ашық түсті, көлемі үлкен', 'upper layer — light-coloured, large volume'), color: 'rgba(205,170,120,.5)', frac: 0.55 },
  ],
  onFinish(S, F, ctx) {
    S.lossFunnel = (F.loss || 0) + 0.03;
    ctx.log(L('Нижний органический слой (сырой иодбензол, тёмно-бурый) слит в колбочку; верхний водный щелочной слой — в отходы', 'Төменгі органикалық қабат (шикі иодбензол, қою қоңыр) колбаға ағызылды; жоғарғы сулы сілтілі қабат — қалдыққа', 'The lower organic layer (crude iodobenzene, dark brown) was run into a small flask; the upper aqueous alkaline layer goes to waste'), 'obs');
  },
  hints: [
    L('Кран закрыт → залить → пробка → встряхнуть с выпуском газа → отстоять → снять пробку → слить нижний слой.', 'Шүмек жабық → құю → тығын → газды шығарып шайқау → тұндыру → тығынды алу → төменгі қабатты ағызу.', 'Stopcock closed → fill → stopper → shake with venting → settle → remove stopper → run off the lower layer.'),
    L('Плотность иодбензола 1,83 г/мл — он почти вдвое тяжелее воды.', 'Иодбензолдың тығыздығы 1,83 г/мл — ол судан екі есе дерлік ауыр.', 'Iodobenzene has a density of 1.83 g/mL — almost twice that of water.'),
    L('Продукт — в нижнем тёмном тяжёлом слое; верхний водный слой — в отходы.', 'Өнім — төменгі қара ауыр қабатта; жоғарғы сулы қабат — қалдыққа.', 'The product is in the lower dark heavy layer; the upper aqueous layer goes to waste.'),
  ],
};

/* ------------------------------------------------------------------ 6. промывание */
const e6 = {
  type: 'process', id: 'wash',
  title: L('Промывание: тиосульфат, затем вода', 'Жуу: тиосульфат, содан кейін су', 'Washing: thiosulfate, then water'),
  instr: L('<ol><li>Верните органический слой в воронку и промойте <b>5 % раствором Na₂S₂O₃</b> — он удаляет свободный иод (бурая окраска).</li><li>Затем промойте <b>водой</b>. Каждый раз сливайте нижний (органический) слой.</li></ol><p class="note">I₂ + 2Na₂S₂O₃ → 2NaI + Na₂S₄O₆. Каждая промывка — небольшие потери продукта.</p>',
    '<ol><li>Органикалық қабатты шұңғымаға қайтарып, <b>5 % Na₂S₂O₃ ерітіндісімен</b> жуыңыз — ол бос иодты (қоңыр түсті) жояды.</li><li>Содан кейін <b>сумен</b> жуыңыз. Әр жолы төменгі (органикалық) қабатты ағызыңыз.</li></ol><p class="note">I₂ + 2Na₂S₂O₃ → 2NaI + Na₂S₄O₆. Әр жуу — өнімнің аздаған шығыны.</p>',
    '<ol><li>Return the organic layer to the funnel and wash it with <b>5 % Na₂S₂O₃ solution</b> — this removes free iodine (the brown colour).</li><li>Then wash it with <b>water</b>. Each time run off the lower (organic) layer.</li></ol><p class="note">I₂ + 2Na₂S₂O₃ → 2NaI + Na₂S₄O₆. Every wash costs a little product.</p>'),
  need: L('Удалите иод и отмойте тиосульфат', 'Иодты жойып, тиосульфатты жуыңыз', 'Remove the iodine and wash out the thiosulfate'),
  speeds: null,
  setup(S, lc) { S.wash = S.wash || { I2: 1, n: 0, thio: 0, water: 0, last: '' }; lc.last = S.wash.last; },
  controls: [
    { kind: 'action', id: 'thio', once: false, group: L('Промывание (5 мл, встряхнуть, слить нижний слой)', 'Жуу (5 мл, шайқау, төменгі қабатты ағызу)', 'Washing (5 mL, shake, run off the lower layer)'), label: L('5 % Na₂S₂O₃', '5 % Na₂S₂O₃', '5 % Na₂S₂O₃'), advance: 300,
      do(S, lc, ctx) {
        const W = S.wash; W.I2 *= 0.12; W.n++; W.thio++; W.last = lc.last = 'thio';
        ctx.log(W.I2 > 0.15 ? L('Промывка тиосульфатом: окраска органического слоя посветлела, но остаётся бурой', 'Тиосульфатпен жуу: органикалық қабаттың түсі ашылды, бірақ қоңыр күйінде қалды', 'Thiosulfate wash: the organic layer is lighter but still brown')
          : L('Промывка тиосульфатом: бурая окраска исчезла, органический слой бледно-жёлтый', 'Тиосульфатпен жуу: қоңыр түс жойылды, органикалық қабат ақшыл сары', 'Thiosulfate wash: the brown colour is gone; the organic layer is pale yellow'), 'obs');
      } },
    { kind: 'action', id: 'water', once: false, group: L('Промывание (5 мл, встряхнуть, слить нижний слой)', 'Жуу (5 мл, шайқау, төменгі қабатты ағызу)', 'Washing (5 mL, shake, run off the lower layer)'), label: L('Вода', 'Су', 'Water'), advance: 300,
      do(S, lc, ctx) {
        const W = S.wash; W.n++; W.water++; W.last = lc.last = 'water';
        ctx.log(L('Промывка водой: органический слой отделён снизу', 'Сумен жуу: органикалық қабат төменнен бөлінді', 'Water wash: the organic layer run off from below'), 'obs');
      } },
    { kind: 'action', id: 'naoh', once: false, group: L('Промывание (5 мл, встряхнуть, слить нижний слой)', 'Жуу (5 мл, шайқау, төменгі қабатты ағызу)', 'Washing (5 mL, shake, run off the lower layer)'), label: L('Конц. HCl — «для чистоты»', 'Конц. HCl — «тазалық үшін»', 'Conc. HCl — “to make it cleaner”'), advance: 120,
      do(S, lc, ctx) {
        ctx.remark({ key: 'hclwash', severity: 'safety', text: L('промывание концентрированной HCl без необходимости — выделение HCl и иода, едкие пары', 'қажетсіз концентрлі HCl-мен жуу — HCl мен иодтың бөлінуі, күйдіргіш булар', 'washing with concentrated HCl for no reason — HCl and iodine fumes'), whatif: L('Методичка такой промывки не предусматривает: кислота не удаляет ни иод, ни фенол, при встряхивании в воронке выделяются едкие пары HCl, а возврат в кислую среду переводит фенолят обратно в фенол.', 'Әдістемеде мұндай жуу жоқ: қышқыл иодты да, фенолды да жоймайды, шұңғымада шайқағанда күйдіргіш HCl булары бөлінеді, ал қышқыл ортаға қайту фенолятты қайтадан фенолға айналдырады.', 'The manual has no such wash: acid removes neither iodine nor phenol, shaking it in the funnel releases corrosive HCl fumes, and going back to acid turns any phenoxide back into phenol.') });
        S.wash.n++; S.wash.I2 = Math.min(1, S.wash.I2 + 0.2);
      } },
  ],
  readouts: (S) => [
    { label: L('Органический слой', 'Органикалық қабат', 'Organic layer'), value: S.wash.I2 > 0.6 ? L('тёмно-бурый', 'қою қоңыр', 'dark brown') : S.wash.I2 > 0.15 ? L('бурый', 'қоңыр', 'brown') : L('бледно-жёлтый', 'ақшыл сары', 'pale yellow'), st: S.wash.I2 <= 0.15 ? 'ok' : '' },
    { label: L('Промывок', 'Жуу саны', 'Washes'), value: `${S.wash.thio} + ${S.wash.water}` },
  ],
  done: (S) => S.wash.thio >= 1 && S.wash.I2 <= 0.15 && S.wash.last === 'water' && { text: L('Иод удалён, тиосульфат отмыт.', 'Иод жойылды, тиосульфат жуылды.', 'Iodine removed, thiosulfate washed out.') },
  onLeave(S, ctx) { if (S.wash.n > 4) ctx.remark({ key: 'overwash', severity: 'minor', text: L('лишние промывки — потери продукта', 'артық жуу — өнім шығыны', 'too many washes — product lost') }); },
  scene: (S, lc) => washScene(S, lc),
  hints: [
    L('Бурая окраска — это иод. Его удаляет восстановитель из методички.', 'Қоңыр түс — бұл иод. Оны әдістемедегі тотықсыздандырғыш жояды.', 'The brown colour is iodine. The reducing agent in the manual removes it.'),
    L('Тиосульфат — пока слой не станет бледно-жёлтым, затем одна промывка водой.', 'Тиосульфат — қабат ақшыл сары болғанша, содан кейін бір рет сумен жуу.', 'Thiosulfate until the layer is pale yellow, then one water wash.'),
    L('«5 % Na₂S₂O₃» один раз, затем «Вода» один раз.', '«5 % Na₂S₂O₃» бір рет, содан кейін «Су» бір рет.', '“5 % Na₂S₂O₃” once, then “Water” once.'),
  ],
};

/* ------------------------------------------------------------------ 7. сушка */
const e7 = {
  type: 'decide', id: 'dry',
  title: L('Сушка сырого иодбензола', 'Шикі иодбензолды кептіру', 'Drying the crude iodobenzene'),
  instr: L('<p>Промытый иодбензол мутный от капелек воды. Перед перегонкой его сушат (п. 5 хода работы).</p>', '<p>Жуылған иодбензол су тамшыларынан лайлы. Айдау алдында оны кептіреді (жұмыс барысының 5-тармағы).</p>', '<p>The washed iodobenzene is cloudy with droplets of water. It is dried before distillation (procedure step 5).</p>'),
  need: L('Выберите способ сушки', 'Кептіру тәсілін таңдаңыз', 'Choose how to dry'),
  question: L('Как высушить сырой иодбензол?', 'Шикі иодбензолды қалай кептіреді?', 'How do you dry the crude iodobenzene?'),
  options: [
    { id: 'cacl2', ok: true, label: L('Безводный CaCl₂ до прозрачности жидкости, затем слить жидкость с осушителя в перегонную колбу', 'Сұйықтық мөлдір болғанша сусыз CaCl₂, содан кейін сұйықтықты кептіргіштен айдау колбасына құйып алу', 'Anhydrous CaCl₂ until the liquid is clear, then decant the liquid off the drying agent into the distillation flask'), advance: 1500,
      effect(S) { S.wet = 0.002; S.lossDry = 0.04; }, obs: L('Над безводным CaCl₂ жидкость стала прозрачной; слита в перегонную колбу (часть продукта осталась на осушителе)', 'Сусыз CaCl₂ үстінде сұйықтық мөлдір болды; айдау колбасына құйылды (өнімнің бір бөлігі кептіргіште қалды)', 'Over anhydrous CaCl₂ the liquid became clear; decanted into the distillation flask (a little product stayed on the drying agent)'),
      why: L('безводный CaCl₂ связывает воду; осушитель в перегонную колбу не переносят', 'сусыз CaCl₂ суды байланыстырады; кептіргішті айдау колбасына ауыстырмайды', 'anhydrous CaCl₂ binds the water; the drying agent is not carried into the distillation flask') },
    { id: 'none', ok: false, severity: 'major', label: L('Не сушить — вода всё равно отгонится первой', 'Кептірмеу — су бәрібір бірінші айдалады', 'Do not dry — the water will distil off first anyway'), advance: 60,
      remark: L('продукт перегоняли без сушки — мутный предгон, толчки, влажный продукт', 'өнім кептірілмей айдалды — лайлы алғашқы айдалым, лықсу, ылғалды өнім', 'product distilled without drying — cloudy forerun, bumping, wet product'),
      whatif: L('Вода перегоняется с иодбензолом (около 98 °C), смесь толкается, а капли воды попадают и в основную фракцию: продукт мутный, масса завышена.', 'Су иодбензолмен бірге айдалады (шамамен 98 °C), қоспа лықсып қайнайды, ал су тамшылары негізгі фракцияға да түседі: өнім лайлы, массасы жоғары.', 'Water co-distils with iodobenzene (around 98 °C), the mixture bumps, and water droplets also reach the main fraction: the product is cloudy and its mass too high.'),
      effect(S) { S.wet = 0.08; S.wetTail = 0.025; S.lossDry = 0; } },
    { id: 'hydrate', ok: false, severity: 'major', label: L('Кристаллогидрат CaCl₂·6H₂O — его больше на полке', 'CaCl₂·6H₂O кристаллогидраты — сөреде ол көбірек', 'CaCl₂·6H₂O crystals — there is more of it on the shelf'), advance: 1500,
      remark: L('для сушки взят кристаллогидрат CaCl₂·6H₂O — продукт не высушен', 'кептіру үшін CaCl₂·6H₂O кристаллогидраты алынды — өнім кептірілмеді', 'CaCl₂·6H₂O hydrate used for drying — the product was not dried'),
      whatif: L('Кристаллогидрат уже насыщен водой и не поглощает её: жидкость остаётся мутной. Осушитель должен быть безводным.', 'Кристаллогидрат сумен қаныққан және оны сіңірмейді: сұйықтық лайлы күйінде қалады. Кептіргіш сусыз болуы тиіс.', 'The hydrate is already saturated with water and absorbs no more: the liquid stays cloudy. The drying agent must be anhydrous.'),
      effect(S) { S.wet = 0.06; S.wetTail = 0.02; S.lossDry = 0.04; } },
  ],
  onLeave(S) {
    // состав сырого продукта в перегонной колбе, г
    const keep = (1 - S.lossFoam) * (1 - S.lossFunnel) * Math.pow(0.985, S.wash.n) * (1 - S.lossDry);
    const iMass = (S.PhI * M.PhI) / 1000 * keep;
    const pMass = ((S.phenolDiaz + S.phenolKI) * M.PhOH) / 1000 * S.phOrg * keep;
    S.crude = { i: iMass, p: pMass, w: S.wet, I2: S.wash.I2 };
    S.lossHandling = (S.PhI * M.PhI) / 1000 * (1 - keep);
  },
  scene: () => washScene({ wash: { I2: 0.05 } }, {}),
};

/* ------------------------------------------------------------------ 8. сборка перегонки */
const e8 = {
  type: 'assemble', id: 'asm',
  title: L('Сборка установки для перегонки с воздушным холодильником', 'Ауа мұздатқышы бар айдау қондырғысын жинау', 'Assembling the distillation set-up with an air condenser'),
  instr: L('<p>Соберите установку для перегонки иодбензола (т. кип. 188 °C): выберите деталь и нажмите место. Термометр — с шариком у отвода или в жидкости; приёмник заранее взвешивают. Лишние детали останутся на столе.</p><p class="note">Ошибка сборки проявится при перегонке.</p>',
    '<p>Иодбензолды (қайнау t 188 °C) айдау қондырғысын жинаңыз: бөлшекті таңдап, орнын басыңыз. Термометр шарикі — бұрма тұсында немесе сұйықтықта; қабылдағышты алдын ала өлшейді. Артық бөлшектер үстелде қалады.</p><p class="note">Жинаудағы қате айдау кезінде байқалады.</p>',
    '<p>Assemble the set-up for distilling iodobenzene (b.p. 188 °C): choose a part and tap its place. The thermometer bulb goes either at the side arm or in the liquid; the receiver is weighed beforehand. Spare parts stay on the bench.</p><p class="note">An assembly mistake will show up during the distillation.</p>'),
  need: L('Соберите установку', 'Қондырғыны жинаңыз', 'Assemble the set-up'),
  parts: [
    { id: 'mantle', label: L('Колбонагреватель', 'Колба қыздырғыш', 'Heating mantle') },
    { id: 'wbath', label: L('Водяная баня', 'Су моншасы', 'Water bath') },
    { id: 'flask', label: L('Перегонная колба', 'Айдау колбасы', 'Distilling flask') },
    { id: 'chips', label: L('Кипелки', 'Қайнату тастары', 'Boiling chips') },
    { id: 'nochips', label: L('Без кипелок', 'Қайнату тастарынсыз', 'No boiling chips') },
    { id: 'thVap', label: L('Термометр у отвода', 'Термометр бұрмада', 'Thermometer at arm') },
    { id: 'thLiq', label: L('Термометр в жидкости', 'Термометр сұйықта', 'Thermometer in liquid') },
    { id: 'air', label: L('Воздушный холод.', 'Ауа мұздатқышы', 'Air condenser') },
    { id: 'liebig', label: L('Либих (с водой)', 'Либих (сумен)', 'Liebig (water)') },
    { id: 'recv', label: L('Приёмник открыт', 'Ашық қабылдағыш', 'Open receiver') },
    { id: 'recvClosed', label: L('Приёмник с пробкой', 'Тығынды қабылдағыш', 'Stoppered receiver') },
  ],
  slots: [
    { id: 'th', label: L('Термометр', 'Термометр', 'Thermometer'), accepts: 'thVap', x: 92, y: 26 },
    { id: 'boil', label: L('В колбу', 'Колбаға', 'Into the flask'), accepts: 'chips', x: 92, y: 120 },
    { id: 'flask', label: L('Колба', 'Колба', 'Flask'), accepts: 'flask', x: 92, y: 168 },
    { id: 'heat', label: L('Нагрев', 'Қыздыру', 'Heating'), accepts: 'mantle', x: 92, y: 214 },
    { id: 'cond', label: L('Холодильник', 'Мұздатқыш', 'Condenser'), accepts: 'air', x: 236, y: 112 },
    { id: 'recv', label: L('Приёмник', 'Қабылдағыш', 'Receiver'), accepts: 'recv', x: 290, y: 200 },
  ],
  base: () => `<rect class="met" x="40" y="224" width="110" height="8" rx="2"/><rect class="met" x="22" y="20" width="5" height="206"/><line x1="110" y1="112" x2="262" y2="172" stroke="var(--glass)" stroke-width="3" stroke-dasharray="5 4"/>${text(200, 240, L('стол вытяжного шкафа', 'тартпа шкаф үстелі', 'fume hood bench'))}`,
  onDone(S, place) {
    S.asm = {
      heat: place.heat === 'mantle' ? 'mantle' : place.heat === 'wbath' ? 'wbath' : 'none',
      chips: place.boil === 'chips',
      thermo: place.th === 'thVap' ? 'vap' : place.th === 'thLiq' ? 'liq' : 'none',
      cond: place.cond === 'air' ? 'air' : place.cond === 'liebig' ? 'liebig' : 'none',
      closed: place.recv === 'recvClosed',
      flask: place.flask === 'flask',
    };
  },
  hint1: L('Т. кип. 188 °C: нужен нагрев выше 100 °C; при такой температуре водяной холодильник может треснуть; термометр показывает температуру паров; кипелки — от толчков; система должна быть открыта.', 'Қайнау t 188 °C: 100 °C-тан жоғары қыздыру қажет; мұндай температурада сулы мұздатқыш жарылуы мүмкін; термометр бу температурасын көрсетеді; қайнату тастары — лықсудан; жүйе ашық болуы тиіс.', 'B.p. 188 °C: you need heating above 100 °C; at this temperature a water condenser can crack; the thermometer measures the vapour; boiling chips prevent bumping; the system must be open.'),
};

/* ------------------------------------------------------------------ 9. перегонка */
const CRACK = {
  ru: 'Пары иодбензола при 188 °C попали в холодильник, охлаждаемый водой: от резкого перепада температур стеклянная трубка треснула, в горячую колбу и на нагреватель попала вода, перегонка сорвана. Методичка требует для перегонки при 188 °C воздушный холодильник (раздел 7). В реальной лаборатории нагрев выключают, установку обесточивают и дают остыть, осколки собирают в ёмкость для боя стекла (п. 9.3), о происшествии сообщают преподавателю.',
  kk: 'Иодбензолдың 188 °C-тағы булары сумен салқындатылатын мұздатқышқа түсті: температураның күрт айырмасынан шыны түтік жарылып, ыстық колба мен қыздырғышқа су түсті, айдау үзілді. Әдістеме 188 °C-та айдау үшін ауа мұздатқышын талап етеді (7-бөлім). Нақты зертханада қыздыруды өшіріп, қондырғыны токтан ажыратып, суытады, сынықтарды сынған шыны ыдысына жинайды (9.3-тармақ), оқиға туралы оқытушыға хабарлайды.',
  en: 'Iodobenzene vapour at 188 °C entered a water-cooled condenser: the sudden temperature difference cracked the glass tube, water got into the hot flask and onto the heater, and the distillation failed. The manual requires an air condenser for distilling at 188 °C (section 7). In a real lab you switch the heater off, unplug the set-up and let it cool, put the fragments into the broken-glass container (rule 9.3) and tell the instructor.',
};
const CLOSED = {
  ru: 'Приёмник был плотно закрыт пробкой — установка превратилась в закрытую систему. При нагревании давление паров и воздуха растёт: пробку выбило, горячие пары иодбензола вырвались в шкаф, колба могла разорваться. Правило п. 7.4: при нагревании система должна сообщаться с атмосферой. В реальной лаборатории нагрев немедленно выключают, дают установке остыть, затем собирают её заново.',
  kk: 'Қабылдағыш тығынмен тығыз жабылған еді — қондырғы жабық жүйеге айналды. Қыздырғанда бу мен ауаның қысымы өседі: тығын атылып, иодбензолдың ыстық булары шкафқа шықты, колба жарылуы мүмкін еді. 7.4-тармақ ережесі: қыздыру кезінде жүйе атмосферамен байланысуы тиіс. Нақты зертханада қыздыруды бірден өшіріп, қондырғыны суытып, содан кейін оны қайта жинайды.',
  en: 'The receiver was tightly stoppered, turning the set-up into a closed system. On heating, the pressure of vapour and air rose: the stopper blew out, hot iodobenzene vapour escaped into the hood and the flask could have burst. Rule 7.4: a heated system must be open to the atmosphere. In a real lab you switch the heating off at once, let the set-up cool and then assemble it again.',
};
const DRYNESS = {
  ru: 'Нагрев не выключили, и колба выкипела досуха. Перегретый смолистый остаток разлагается с выделением паров иода, сухая колба на колбонагревателе может треснуть. Методичка (раздел 7): никогда не перегонять досуха — в колбе оставляют немного жидкости. В реальной лаборатории нагрев выключают, установке дают остыть под тягой и сообщают преподавателю.',
  kk: 'Қыздыру өшірілмей, колба құрғағанша қайнап кетті. Қызып кеткен шайырлы қалдық иод буларын бөле ыдырайды, колба қыздырғыштағы құрғақ колба жарылуы мүмкін. Әдістеме (7-бөлім): ешқашан құрғағанша айдамау — колбада аздап сұйықтық қалдырады. Нақты зертханада қыздыруды өшіріп, қондырғыны тартпа астында суытып, оқытушыға хабарлайды.',
  en: 'The heating was not switched off and the flask boiled dry. The overheated tarry residue decomposes, giving off iodine vapour, and a dry flask on a heating mantle can crack. The manual (section 7): never distil to dryness — leave a little liquid in the flask. In a real lab the heater is switched off, the set-up is left to cool in the hood and the instructor is told.',
};

const tot = (x) => x.w + x.p + x.i;

const e9 = {
  type: 'process', id: 'distil',
  title: L('Перегонка: фракция 185–190 °C', 'Айдау: 185–190 °C фракциясы', 'Distillation: the 185–190 °C fraction'),
  instr: L('<ol><li>Взвесьте пустой приёмник.</li><li>Нагревайте колбу; всё, что перегоняется до 185 °C, соберите в стаканчик (предгон).</li><li>При 185 °C подставьте взвешенный приёмник и собирайте фракцию <b>185–190 °C</b>.</li><li>Прекратите нагрев, когда в колбе останется немного жидкости — <b>никогда не досуха</b>. Остудите и взвесьте приёмник с продуктом.</li></ol>',
    '<ol><li>Бос қабылдағышты өлшеңіз.</li><li>Колбаны қыздырыңыз; 185 °C-қа дейін айдалатынның бәрін стақаншаға жинаңыз (алғашқы айдалым).</li><li>185 °C-та өлшенген қабылдағышты қойып, <b>185–190 °C</b> фракциясын жинаңыз.</li><li>Колбада аздап сұйықтық қалғанда қыздыруды тоқтатыңыз — <b>ешқашан құрғағанша емес</b>. Суытып, өніммен бірге қабылдағышты өлшеңіз.</li></ol>',
    '<ol><li>Weigh the empty receiver.</li><li>Heat the flask; collect everything that distils below 185 °C in a small beaker (forerun).</li><li>At 185 °C put the weighed receiver in place and collect the <b>185–190 °C</b> fraction.</li><li>Stop heating while a little liquid is left in the flask — <b>never to dryness</b>. Let it cool and weigh the receiver with the product.</li></ol>'),
  need: L('Соберите фракцию 185–190 °C и взвесьте её', '185–190 °C фракциясын жинап, өлшеңіз', 'Collect the 185–190 °C fraction and weigh it'),
  speeds: [5, 10, 20],
  setup(S, lc) {
    const c = S.crude || { i: 4, p: 0.05, w: 0.002 };
    const hold = Math.min(c.i * 0.5, 0.12);
    S.dist = { liq: { w: c.w, p: c.p, i: Math.max(0, c.i - hold) }, hold, heat: false, Tf: 22, Tv: 22, Tth: 22, recv: 'fore', main: { w: 0, p: 0, i: 0 }, fore: { w: 0, p: 0, i: 0 }, lost: 0, m0: null, m1: null, bp: { lo: null, hi: null }, boiling: false, asm: { ...(S.asm || {}) }, hotFast: 0 };
    lc.c.power = 2; lc.c.recv = 'fore';
  },
  controls: [
    { kind: 'action', id: 'tare', group: L('Приёмник', 'Қабылдағыш', 'Receiver'), label: L('Взвесить пустой приёмник', 'Бос қабылдағышты өлшеу', 'Weigh the empty receiver'), advance: 120,
      do(S, lc, ctx) { const D = S.dist; D.m0 = Math.round(ctx.rng.range(28.4, 33.6) * 100) / 100; ctx.log(L(`Масса пустого приёмника m₀ = ${g(D.m0)} г`, `Бос қабылдағыштың массасы m₀ = ${g(D.m0)} г`, `Mass of the empty receiver m₀ = ${g(D.m0)} g`), 'calc'); } },
    { kind: 'seg', id: 'recv', group: L('Приёмник', 'Қабылдағыш', 'Receiver'), label: L('Под отводом', 'Бұрма астында', 'Under the outlet'), options: [['fore', L('стаканчик (предгон)', 'стақанша (алғашқы айдалым)', 'beaker (forerun)')], ['main', L('взвешенный приёмник', 'өлшенген қабылдағыш', 'weighed receiver')]], default: 'fore',
      onChange(S, lc, v, ctx) {
        S.dist.recv = v;
        const at = S.dist.asm.thermo === 'none' ? '—' : n(S.dist.Tth, 0);
        ctx.log(v === 'main' ? L(`Подставлен взвешенный приёмник (термометр ${at} °C)`, `Өлшенген қабылдағыш қойылды (термометр ${at} °C)`, `Weighed receiver put in place (thermometer ${at} °C)`) : L(`Подставлен стаканчик для предгона (термометр ${at} °C)`, `Алғашқы айдалым стақаншасы қойылды (термометр ${at} °C)`, `Forerun beaker put in place (thermometer ${at} °C)`));
      } },
    { kind: 'action', id: 'swap', group: L('Нагрев', 'Қыздыру', 'Heating'), label: L('Заменить водяную баню колбонагревателем', 'Су моншасын колба қыздырғышпен ауыстыру', 'Replace the water bath with a heating mantle'), advance: 600,
      disabled: (S) => S.dist.asm.heat === 'mantle' || S.dist.heat, do(S) { S.dist.asm.heat = 'mantle'; }, log: L('Водяная баня заменена колбонагревателем', 'Су моншасы колба қыздырғышпен ауыстырылды', 'Water bath replaced with a heating mantle') },
    { kind: 'toggle', id: 'heat', group: L('Нагрев', 'Қыздыру', 'Heating'), label: L('Нагрев: включить', 'Қыздыру: қосу', 'Heating: on'), labelOn: L('Нагрев: выключить', 'Қыздыру: өшіру', 'Heating: off'),
      when: (S) => S.dist.m0 != null && S.dist.m1 == null, whenText: L('Сначала взвесьте пустой приёмник.', 'Алдымен бос қабылдағышты өлшеңіз.', 'Weigh the empty receiver first.'),
      onChange(S, lc, on, ctx) {
        S.dist.heat = on;
        ctx.log(on ? L('Нагрев включён', 'Қыздыру қосылды', 'Heating switched on') : L(`Нагрев выключен; в колбе осталось ≈ ${n(tot(S.dist.liq) / D_PHI, 1)} мл`, `Қыздыру өшірілді; колбада ≈ ${n(tot(S.dist.liq) / D_PHI, 1)} мл қалды`, `Heating switched off; ≈ ${n(tot(S.dist.liq) / D_PHI, 1)} mL left in the flask`));
      } },
    { kind: 'seg', id: 'power', group: L('Нагрев', 'Қыздыру', 'Heating'), label: L('Мощность', 'Қуаты', 'Power'), options: [[1, L('слабо', 'әлсіз', 'low')], [2, L('средне', 'орташа', 'medium')], [3, L('сильно', 'күшті', 'high')]], default: 2 },
    { kind: 'action', id: 'weigh', cls: 'pri', group: L('Приёмник', 'Қабылдағыш', 'Receiver'), label: L('Остудить и взвесить приёмник с продуктом', 'Суытып, өніммен бірге қабылдағышты өлшеу', 'Cool and weigh the receiver with the product'), advance: 600,
      when: (S) => !S.dist.heat && S.dist.Tf < 60 && (tot(S.dist.main) > 0.01 || tot(S.dist.liq) < 0.3), whenText: L('Выключите нагрев, дайте установке остыть ниже 60 °C (в приёмнике должна быть фракция).', 'Қыздыруды өшіріп, қондырғыны 60 °C-тан төмен суытыңыз (қабылдағышта фракция болуы тиіс).', 'Switch the heating off and let the set-up cool below 60 °C (the receiver must contain the fraction).'),
      do(S, lc, ctx) {
        const D = S.dist;
        if (tot(D.main) <= 0.01) ctx.remark({ key: 'nomain', severity: 'major', text: L('основная фракция не собрана во взвешенный приёмник', 'негізгі фракция өлшенген қабылдағышқа жиналмады', 'the main fraction was not collected in the weighed receiver') });
        if (tot(D.main) > 0.5 && S.wetTail) D.main.w += S.wetTail; // капли воды, увлечённые с основной фракцией
        D.m1 = Math.round((D.m0 + tot(D.main)) * 100) / 100;
        S.look = productLook(D.main, S.crude ? S.crude.I2 : 0);
        ctx.log(L(`Масса приёмника с продуктом m₁ = ${g(D.m1)} г`, `Өніммен бірге қабылдағыштың массасы m₁ = ${g(D.m1)} г`, `Mass of the receiver with the product m₁ = ${g(D.m1)} g`), 'calc');
        const look = S.look.cloudy ? L('мутная', 'лайлы', 'cloudy') : S.look.brown ? L('буроватая', 'қоңырқай', 'brownish') : L('бесцветная (бледно-жёлтая) прозрачная', 'түссіз (ақшыл сары) мөлдір', 'colourless (pale yellow) and clear');
        const bp = D.bp.lo != null ? `${n(D.bp.lo, 0)}–${n(D.bp.hi, 0)}` : '—';
        ctx.log(L(`Иодбензол — тяжёлая ${look.ru} жидкость, тонет в воде; т. кип. фракции ${bp} °C`, `Иодбензол — ауыр ${look.kk} сұйықтық, суда батады; фракцияның қайнау t ${bp} °C`, `Iodobenzene — a heavy ${look.en} liquid that sinks in water; b.p. of the fraction ${bp} °C`), 'obs');
      } },
  ],
  tick(S, lc, dt, ctx) {
    const D = S.dist, A = D.asm, liq = D.liq;
    const left = tot(liq);
    const bp = vapourT(liq) || 200;
    const maxHeat = A.heat === 'mantle' ? 280 : A.heat === 'wbath' ? 99.5 : 22;
    const P = lc.c.power || 2;
    if (D.heat) {
      if (Math.abs(D.Tf - bp) < 0.6 || D.Tf > bp) D.Tf = left > 0.02 ? bp + (A.chips ? 0.5 : 3) : D.Tf + 0.5 * dt;
      else D.Tf = relax(D.Tf, maxHeat, 0.0035 * P, dt);
    } else D.Tf = relax(D.Tf, 22, 0.006, dt);
    D.boiling = D.heat && left > 0.02 && D.Tf >= bp;
    D.Tv = D.boiling ? relax(D.Tv, bp, 0.12, dt) : relax(D.Tv, 22, D.Tv > 60 ? 0.02 : 0.008, dt);
    D.Tth = A.thermo === 'liq' ? D.Tf + (D.boiling ? 4 : 0) : D.Tv;
    D.dripping = false;
    if (A.heat === 'wbath' && D.heat && !D.wbWarn && D.Tf > 95 && left > 0.5 && liq.w < 0.005) {
      D.wbWarn = true;
      ctx.remark({ key: 'wbath', severity: 'major', text: L('для перегонки при 188 °C собрали водяную баню — она не нагревает выше 100 °C', '188 °C-та айдау үшін су моншасы жиналды — ол 100 °C-тан жоғары қыздырмайды', 'a water bath was set up for distilling at 188 °C — it cannot heat above 100 °C') });
      ctx.feedback(L('Колба на водяной бане не нагревается выше ~98 °C — иодбензол не перегоняется. Выключите нагрев и замените баню колбонагревателем.', 'Су моншасындағы колба ~98 °C-тан жоғары қызбайды — иодбензол айдалмайды. Қыздыруды өшіріп, моншаны колба қыздырғышпен ауыстырыңыз.', 'On a water bath the flask cannot get above ~98 °C — iodobenzene will not distil. Switch the heating off and replace the bath with a heating mantle.'), 'warn');
    }
    if (D.boiling && A.closed) { ctx.remark({ key: 'closed', severity: 'critical', text: L('нагрев закрытой системы: приёмник закрыт пробкой (п. 7.4 правил ТБ)', 'жабық жүйені қыздыру: қабылдағыш тығынмен жабылған (ҚТ ережелерінің 7.4-тармағы)', 'heating a closed system: the receiver was stoppered (safety rule 7.4)'), critical: { text: CLOSED } }); D.heat = false; lc.c.heat = false; return; }
    if (D.boiling && D.Tv >= bp - 6) {
      const rate = [0, 0.004, 0.008, 0.018][P] * Math.min(1, Math.max(0.15, left / 1.2));
      const out = distilPortion(liq, rate * dt);
      const m = tot(out);
      if (m > 0) {
        D.dripping = true; lc.dk = (lc.dk || 0) + dt * 2;
        if (A.cond === 'none') { D.lost += m; ctx.remark({ key: 'nocond', severity: 'safety', text: L('пары перегоняются без холодильника — продукт уходит в шкаф', 'булар мұздатқышсыз айдалады — өнім шкафқа кетеді', 'vapour distilled without a condenser — the product escapes into the hood') }); }
        else {
          const R = D.recv === 'main' ? D.main : D.fore;
          R.w += out.w; R.p += out.p; R.i += out.i;
          if (D.recv === 'main' && D.Tth != null && A.thermo !== 'none') {
            if (out.i > 0.0005) { D.bp.lo = D.bp.lo == null ? D.Tth : Math.min(D.bp.lo, D.Tth); D.bp.hi = D.bp.hi == null ? D.Tth : Math.max(D.bp.hi, D.Tth); }
            if (D.Tv < 183 && m > 0.003) ctx.remark({ key: 'foreMain', severity: 'minor', text: L('во взвешенный приёмник попал предгон (ниже 185 °C)', 'өлшенген қабылдағышқа алғашқы айдалым түсті (185 °C-тан төмен)', 'forerun (below 185 °C) went into the weighed receiver') });
          }
          if (D.recv === 'fore' && D.fore.i > 0.5) ctx.remark({ key: 'mainFore', severity: 'minor', text: L('часть основной фракции собрана в стаканчик для предгона', 'негізгі фракцияның бір бөлігі алғашқы айдалым стақаншасына жиналды', 'part of the main fraction was collected in the forerun beaker') });
        }
      }
      if (P === 3) { D.hotFast += dt; if (D.hotFast > 40) ctx.remark({ key: 'fast', severity: 'minor', text: L('перегонка слишком быстрая — пары перегреваются, фракции плохо разделяются', 'айдау тым жылдам — булар қызып кетеді, фракциялар нашар бөлінеді', 'distillation too fast — the vapour is superheated and the fractions separate poorly') }); }
      if (A.cond === 'liebig' && D.Tv > 150 && !D.cracked) { D.cracked = true; ctx.remark({ key: 'crack', severity: 'critical', text: L('холодильник Либиха с водой треснул от горячих паров при 188 °C', 'сулы Либих мұздатқышы 188 °C-тағы ыстық булардан жарылды', 'the water-cooled Liebig condenser cracked under the hot vapour at 188 °C'), critical: { text: CRACK } }); D.heat = false; lc.c.heat = false; return; }
    }
    if (D.heat && tot(liq) < 0.05) { D.dryness = true; ctx.remark({ key: 'dry', severity: 'critical', text: L('перегонка досуха (раздел 7 методички)', 'құрғағанша айдау (әдістеменің 7-бөлімі)', 'distilled to dryness (manual, section 7)'), critical: { text: DRYNESS } }); D.heat = false; lc.c.heat = false; }
  },
  readouts: (S) => {
    const D = S.dist;
    return [
      { label: L('Термометр', 'Термометр', 'Thermometer'), value: D.asm.thermo === 'none' ? '—' : n(D.Tth, 0) + ' °C', st: D.Tth >= 185 && D.Tth <= 190 ? 'ok' : D.Tth > 192 ? 'warn' : '' },
      { label: L('В колбе', 'Колбада', 'In the flask'), value: ml(tot(D.liq) / D_PHI), st: D.heat && tot(D.liq) < 0.35 ? 'bad' : '' },
      { label: L('Приёмник', 'Қабылдағыш', 'Receiver'), value: ml(tot(D.main) / D_PHI), st: tot(D.main) > 0.5 ? 'ok' : '' },
      { label: L('Предгон', 'Алғашқы айдалым', 'Forerun'), value: ml(tot(D.fore) / 1.5) },
    ];
  },
  alerts(S, lc) {
    const D = S.dist;
    if (D.m1 != null) return null;
    if (D.heat && tot(D.liq) < 0.35) return { text: L('В колбе почти ничего не осталось — выключите нагрев! Досуха не перегоняют.', 'Колбада ештеңе дерлік қалмады — қыздыруды өшіріңіз! Құрғағанша айдамайды.', 'Almost nothing is left in the flask — switch the heating off! Never distil to dryness.'), kind: 'bad' };
    if (D.boiling && D.recv === 'fore' && D.Tv >= 185) return { text: L('Температура паров 185 °C и выше — подставьте взвешенный приёмник.', 'Бу температурасы 185 °C және одан жоғары — өлшенген қабылдағышты қойыңыз.', 'The vapour is at 185 °C or above — put the weighed receiver in place.'), kind: 'info' };
    if (D.boiling && D.recv === 'main' && D.Tv < 183) return { text: L('Ниже 185 °C перегоняется предгон — он загрязнит продукт.', '185 °C-тан төмен алғашқы айдалым айдалады — ол өнімді ластайды.', 'Below 185 °C it is forerun that distils — it will contaminate the product.'), kind: 'warn' };
    if (D.boiling && D.Tv < 110 && D.Tv > 90) return { text: L('Перегоняется вода (≈ 98 °C) — продукт был влажным.', 'Су айдалуда (≈ 98 °C) — өнім ылғалды болған.', 'Water is distilling (≈ 98 °C) — the product was wet.'), kind: 'info' };
    return null;
  },
  events: [{
    id: 'bump', when: (S) => !S.dist.asm.chips && S.dist.boiling && !S.dist.asm.closed,
    title: L('Толчки при кипении', 'Қайнау кезіндегі лықсу', 'Bumping'),
    text: L('Жидкость в колбе перегревается и вскипает толчками — колба вздрагивает, брызги долетают до отвода. Что вы сделаете?', 'Колбадағы сұйықтық қызып кетіп, лықсып қайнайды — колба дірілдейді, шашырандылар бұрмаға дейін жетеді. Не істейсіз?', 'The liquid is superheating and boiling in bumps — the flask jolts and splashes reach the side arm. What do you do?'),
    options: [
      { ok: true, label: L('Выключить нагрев, дать колбе остыть ниже 100 °C, внести кипелки и снова нагреть', 'Қыздыруды өшіріп, колбаны 100 °C-тан төмен суытып, қайнату тастарын салып, қайта қыздыру', 'Switch off the heating, let the flask cool below 100 °C, add boiling chips and heat again'), effect(S, lc, ctx) { const D = S.dist; D.heat = false; lc.c.heat = false; D.asm.chips = true; D.Tf = 90; D.Tv = 60; ctx.advance(900); }, log: L('Нагрев остановлен, после охлаждения в колбу внесены кипелки', 'Қыздыру тоқтатылды, салқындағаннан кейін колбаға қайнату тастары салынды', 'Heating stopped; after cooling, boiling chips were added to the flask') },
      { ok: false, severity: 'safety', label: L('Сразу бросить кипелки в кипящую жидкость', 'Қайнату тастарын бірден қайнап жатқан сұйықтыққа тастау', 'Drop boiling chips straight into the boiling liquid'), remark: L('кипелки брошены в перегретую жидкость — выброс горячей жидкости', 'қайнату тастары қызып кеткен сұйықтыққа тасталды — ыстық сұйықтықтың атылуы', 'boiling chips dropped into superheated liquid — hot liquid erupted'), whatif: L('Перегретая жидкость на кипелках вскипает мгновенно: горячий иодбензол выбрасывает из горла колбы. Кипелки вносят только в холодную жидкость (п. 5.3).', 'Қызып кеткен сұйықтық қайнату тастарында лезде қайнайды: ыстық иодбензол колба мойнынан атылады. Қайнату тастарын тек суық сұйықтыққа салады (5.3-тармақ).', 'Superheated liquid boils instantly on the chips: hot iodobenzene is thrown out of the neck. Chips go only into cold liquid (rule 5.3).'), effect(S) { const D = S.dist; D.asm.chips = true; const x = tot(D.liq) * 0.12; D.liq.i = Math.max(0, D.liq.i - x); D.lost += x; } },
      { ok: false, severity: 'major', label: L('Продолжать перегонку', 'Айдауды жалғастыру', 'Carry on distilling'), remark: L('перегонка с толчками — брызги неперегнанной жидкости попали в приёмник', 'лықсумен айдау — айдалмаған сұйықтықтың шашырандылары қабылдағышқа түсті', 'distilling with bumping — splashes of undistilled liquid got into the receiver'), effect(S) { const D = S.dist; D.asm.chips = true; D.bumpDirt = true; const x = Math.min(D.liq.p + D.liq.i, 0.15); D.main.p += D.liq.p * 0.3; D.liq.p *= 0.7; D.lost += x * 0.3; } },
    ],
  }],
  chart: { label: L('Температура паров', 'Бу температурасы', 'Vapour temperature'), value: (S) => S.dist.Tth || 22, min: 20, max: 220, band: [185, 190], limit: 190, every: 5, active: (S) => S.dist.heat || S.dist.Tth > 40, empty: L('кривая начнётся с нагрева', 'қисық қыздырудан басталады', 'the curve starts when heating begins') },
  done: (S) => S.dist.m1 != null && { text: L('Продукт взвешен.', 'Өнім өлшенді.', 'The product has been weighed.') },
  scene: (S, lc) => distillScene(S, lc),
  hints: [
    L('Сначала тара (пустой приёмник), потом нагрев. Смотрите на термометр: до 185 °C — в стаканчик, 185–190 °C — во взвешенный приёмник.', 'Алдымен тара (бос қабылдағыш), содан кейін қыздыру. Термометрге қараңыз: 185 °C-қа дейін — стақаншаға, 185–190 °C — өлшенген қабылдағышқа.', 'First the tare (empty receiver), then heating. Watch the thermometer: below 185 °C into the beaker, 185–190 °C into the weighed receiver.'),
    L('Средняя мощность; когда в колбе остаётся ~0,2 мл — выключить нагрев. Сильный нагрев портит разделение фракций.', 'Орташа қуат; колбада ~0,2 мл қалғанда — қыздыруды өшіру. Күшті қыздыру фракциялардың бөлінуін бұзады.', 'Medium power; switch off when about 0.2 mL is left in the flask. Strong heating spoils the separation of fractions.'),
    L('«Взвесить пустой приёмник» → «Нагрев: включить» → при 185 °C «взвешенный приёмник» → при «В колбе ≈ 0,2 мл» «Нагрев: выключить» → дождаться < 60 °C → «Взвесить приёмник с продуктом».', '«Бос қабылдағышты өлшеу» → «Қыздыру: қосу» → 185 °C-та «өлшенген қабылдағыш» → «Колбада ≈ 0,2 мл» болғанда «Қыздыру: өшіру» → < 60 °C күту → «Өніммен бірге қабылдағышты өлшеу».', '“Weigh the empty receiver” → “Heating: on” → at 185 °C “weighed receiver” → at “In the flask ≈ 0.2 mL” “Heating: off” → wait for < 60 °C → “Weigh the receiver with the product”.'),
  ],
};

/* ------------------------------------------------------------------ 10. расчёт */
const e10 = {
  type: 'calc', id: 'yield',
  title: L('Масса продукта и выход', 'Өнім массасы және шығым', 'Product mass and yield'),
  instr: L('<p>По своим данным рассчитайте массу иодбензола, теоретический выход (из количества взятого анилина, 1 : 1) и выход в процентах.</p><p class="note">C₆H₅NH₂ → C₆H₅I (M = 204,01). Из 25 ммоль анилина теоретически 5,1 г. Погрешность — 1 %, три попытки.</p>',
    '<p>Өз деректеріңіз бойынша иодбензолдың массасын, теориялық шығымды (алынған анилин мөлшерінен, 1 : 1) және пайыздық шығымды есептеңіз.</p><p class="note">C₆H₅NH₂ → C₆H₅I (M = 204,01). 25 ммоль анилиннен теориялық тұрғыдан 5,1 г. Қателік — 1 %, үш әрекет.</p>',
    '<p>From your own data calculate the mass of iodobenzene, the theoretical yield (from the aniline taken, 1 : 1) and the percent yield.</p><p class="note">C₆H₅NH₂ → C₆H₅I (M = 204.01). From 25 mmol of aniline the theoretical yield is 5.1 g. Allowed error 1 %, three attempts.</p>'),
  need: L('Рассчитайте выход', 'Шығымды есептеңіз', 'Calculate the yield'),
  fields: [
    { id: 'm', label: L('Масса иодбензола', 'Иодбензол массасы', 'Mass of iodobenzene'), unit: L('г', 'г', 'g'), decimals: 2, answer: (S) => S.dist.m1 - S.dist.m0, formula: (S) => L(`m = m₁ − m₀ = ${g(S.dist.m1)} − ${g(S.dist.m0)}`, `m = m₁ − m₀ = ${g(S.dist.m1)} − ${g(S.dist.m0)}`, `m = m₁ − m₀ = ${g(S.dist.m1)} − ${g(S.dist.m0)}`) },
    { id: 'th', label: L('Теоретический выход', 'Теориялық шығым', 'Theoretical yield'), unit: L('г', 'г', 'g'), decimals: 2, answer: (S) => theoretical(S.nAn), formula: (S) => L(`m(теор.) = ${n(S.nAn, 1)} ммоль × 204.01 / 1000`, `m(теор.) = ${n(S.nAn, 1)} ммоль × 204.01 / 1000`, `m(theor.) = ${n(S.nAn, 1)} mmol × 204.01 / 1000`) },
    { id: 'eta', label: L('Выход', 'Шығым', 'Yield'), unit: '%', decimals: 1, answer: (S) => percentYield(S.dist.m1 - S.dist.m0, S.nAn), formula: (S) => L(`η = ${g(S.dist.m1 - S.dist.m0)} / ${g(theoretical(S.nAn))} × 100 %`, `η = ${g(S.dist.m1 - S.dist.m0)} / ${g(theoretical(S.nAn))} × 100 %`, `η = ${g(S.dist.m1 - S.dist.m0)} / ${g(theoretical(S.nAn))} × 100 %`) },
  ],
  saveAs: 'calc2',
};

/* ------------------------------------------------------------------ 11. оценка чистоты */
const e11 = {
  type: 'observe', id: 'purity',
  title: L('Чистота продукта', 'Өнімнің тазалығы', 'Purity of the product'),
  instr: L('<p>Сравните свой продукт с данными методички: бесцветная или бледно-жёлтая тяжёлая жидкость, т. кип. 188 °C, d = 1,83 г/мл.</p>', '<p>Өніміңізді әдістеме деректерімен салыстырыңыз: түссіз немесе ақшыл сары ауыр сұйықтық, қайнау t 188 °C, d = 1,83 г/мл.</p>', '<p>Compare your product with the manual: a colourless or pale yellow heavy liquid, b.p. 188 °C, d = 1.83 g/mL.</p>'),
  need: L('Оцените продукт', 'Өнімді бағалаңыз', 'Assess the product'),
  question: L('Что можно сказать о полученном иодбензоле?', 'Алынған иодбензол туралы не айтуға болады?', 'What can you say about your iodobenzene?'),
  options: [
    { id: 'pure', label: L('Продукт чистый: прозрачная бесцветная (бледно-жёлтая) жидкость, кипит в интервале 185–190 °C', 'Өнім таза: мөлдір түссіз (ақшыл сары) сұйықтық, 185–190 °C аралығында қайнайды', 'The product is pure: a clear colourless (pale yellow) liquid boiling within 185–190 °C') },
    { id: 'impure', label: L('Продукт загрязнён: мутный или окрашенный, либо кипел ниже 185 °C / в широком интервале', 'Өнім ластанған: лайлы немесе боялған, не 185 °C-тан төмен / кең аралықта қайнады', 'The product is impure: cloudy or coloured, or it boiled below 185 °C / over a wide range') },
  ],
  correct: (S) => (isPure(S) ? 'pure' : 'impure'),
  why: (S) => (isPure(S) ? L('Фракция собрана в интервале 185–190 °C, жидкость прозрачная и бесцветная — соответствует методичке.', 'Фракция 185–190 °C аралығында жиналды, сұйықтық мөлдір әрі түссіз — әдістемеге сәйкес.', 'The fraction was collected at 185–190 °C and the liquid is clear and colourless — it matches the manual.')
    : L('Отклонения от методички (мутность — вода, бурая окраска — иод, кипение ниже 185 °C — фенол или предгон) указывают на примеси.', 'Әдістемеден ауытқулар (лайлылық — су, қоңыр түс — иод, 185 °C-тан төмен қайнау — фенол немесе алғашқы айдалым) қоспаларды көрсетеді.', 'Deviations from the manual (cloudiness — water, brown colour — iodine, boiling below 185 °C — phenol or forerun) point to impurities.')),
};
function isPure(S) {
  const D = S.dist, L2 = S.look || {};
  return !!(L2.purity > 0.97 && !L2.cloudy && !L2.brown && D.bp.lo != null && D.bp.lo >= 184.5 && D.bp.hi <= 190.5 && S.asm && S.asm.thermo === 'vap');
}

/* ------------------------------------------------------------------ 12. хранение и отходы */
const e12 = {
  type: 'decide', id: 'store',
  title: L('Хранение иодбензола', 'Иодбензолды сақтау', 'Storing the iodobenzene'),
  instr: L('<p>Иодбензол на свету темнеет — выделяется иод (примечание к опыту 2). Куда поместить продукт до сдачи преподавателю?</p>', '<p>Иодбензол жарықта қараяды — иод бөлінеді (2-тәжірибеге ескерту). Өнімді оқытушыға тапсырғанша қайда қояды?</p>', '<p>Iodobenzene darkens in light as iodine is liberated (note to experiment 2). Where do you keep the product until you hand it in?</p>'),
  need: L('Выберите', 'Таңдаңыз', 'Choose'),
  question: L('Как хранить иодбензол?', 'Иодбензолды қалай сақтайды?', 'How should iodobenzene be stored?'),
  options: [
    { id: 'dark', ok: true, label: L('В склянке тёмного стекла с этикеткой (название, масса, дата, ФИО)', 'Затбелгісі бар (атауы, массасы, күні, аты-жөні) қараңғы шыны склянкада', 'In a labelled dark-glass bottle (name, mass, date, your name)'), why: L('свет разлагает иодбензол с выделением иода', 'жарық иодбензолды иод бөле ыдыратады', 'light decomposes iodobenzene, liberating iodine'), log: L('Иодбензол перелит в склянку тёмного стекла с этикеткой', 'Иодбензол затбелгісі бар қараңғы шыны склянкаға құйылды', 'Iodobenzene transferred to a labelled dark-glass bottle') },
    { id: 'window', ok: false, severity: 'minor', label: L('В открытом приёмнике на подоконнике', 'Терезе алдындағы ашық қабылдағышта', 'In the open receiver on the windowsill'), remark: L('продукт оставлен на свету в открытом сосуде — он потемнеет', 'өнім жарықта ашық ыдыста қалдырылды — ол қараяды', 'product left in the light in an open vessel — it will darken'), whatif: L('На свету иодбензол разлагается, выделяется иод — жидкость буреет; перед использованием её придётся снова промывать тиосульфатом.', 'Жарықта иодбензол ыдырайды, иод бөлінеді — сұйықтық қоңырланады; пайдаланар алдында оны тиосульфатпен қайта жууға тура келеді.', 'In light, iodobenzene decomposes and iodine is released — the liquid turns brown and will need washing with thiosulfate again before use.') },
    { id: 'sink', ok: false, severity: 'safety', retry: true, label: L('Продукт не нужен — вылить в раковину', 'Өнім қажет емес — раковинаға төгу', 'The product is not needed — pour it down the sink'), remark: L('галогенорганическое соединение в раковину (п. 10.2 правил ТБ)', 'галогенорганикалық қосылыс раковинаға (ҚТ ережелерінің 10.2-тармағы)', 'organohalogen compound down the sink (safety rule 10.2)'), whatif: L('Галогенсодержащие соединения в канализацию выливать запрещено: продукт сдают преподавателю, а отходы собирают в ёмкость для галогенсодержащих отходов.', 'Құрамында галоген бар қосылыстарды кәрізге төгуге тыйым салынған: өнімді оқытушыға тапсырады, ал қалдықтарды галогенді қалдықтар ыдысына жинайды.', 'Halogenated compounds must never go down the drain: the product is handed in and waste goes into the halogenated waste container.') },
  ],
  scene: (S) => distillScene(S, {}),
};

const e13 = {
  type: 'cleanup', id: 'waste',
  title: L('Отходы и рабочее место', 'Қалдықтар және жұмыс орны', 'Waste and workplace'),
  instr: L('<p>Рассортируйте отходы по контейнерам (раздел 10 правил ТБ), выключите приборы и вымойте руки.</p>', '<p>Қалдықтарды ыдыстарға сұрыптаңыз (ҚТ ережелерінің 10-бөлімі), құралдарды өшіріп, қолыңызды жуыңыз.</p>', '<p>Sort the waste into containers (safety rules, section 10), switch off the equipment and wash your hands.</p>'),
  need: L('Утилизируйте всё и выключите приборы', 'Бәрін кәдеге жаратып, құралдарды өшіріңіз', 'Dispose of everything and switch off the equipment'),
  bins: ['acid', 'organic', 'halogen', 'solid', 'glass', 'sink'],
  items: [
    { id: 'aq', bin: 'acid', label: L('Водный щелочной слой (фенолят, NaCl, KCl)', 'Сулы сілтілі қабат (фенолят, NaCl, KCl)', 'Aqueous alkaline layer (phenoxide, NaCl, KCl)'), wrong: { sink: { severity: 'safety', text: L('щелочной раствор с фенолятом — в раковину (пп. 10.2–10.3 правил ТБ)', 'фенолят бар сілтілі ерітінді — раковинаға (ҚТ ережелерінің 10.2–10.3-тармақтары)', 'alkaline solution with phenoxide down the sink (safety rules 10.2–10.3)') } } },
    { id: 'thio', bin: 'acid', label: L('Промывные воды (тиосульфат, вода)', 'Жуынды сулар (тиосульфат, су)', 'Washings (thiosulfate, water)') },
    { id: 'fore', bin: 'halogen', label: L('Предгон (вода + иодбензол)', 'Алғашқы айдалым (су + иодбензол)', 'Forerun (water + iodobenzene)'), wrong: { organic: { severity: 'minor', text: L('иодсодержащий предгон — не в ту ёмкость (это галогенсодержащие отходы)', 'құрамында иод бар алғашқы айдалым — басқа ыдысқа (бұл галогенді қалдықтар)', 'iodine-containing forerun in the wrong container (it is halogenated waste)') } } },
    { id: 'res', bin: 'halogen', label: L('Остаток в перегонной колбе', 'Айдау колбасындағы қалдық', 'Residue in the distillation flask') },
    { id: 'cacl', bin: 'solid', label: L('Отработанный CaCl₂', 'Пайдаланылған CaCl₂', 'Spent CaCl₂') },
  ],
  switches: [
    { id: 'mantle', label: L('Выключить колбонагреватель и плитку', 'Колба қыздырғыш пен плитаны өшіру', 'Switch off the heating mantle and hot plate'), log: L('Колбонагреватель и плитка выключены', 'Колба қыздырғыш пен плита өшірілді', 'Heating mantle and hot plate switched off') },
    { id: 'hands', label: L('Вымыть руки с мылом', 'Қолды сабынмен жуу', 'Wash hands with soap'), log: L('Руки вымыты с мылом', 'Қол сабынмен жуылды', 'Hands washed with soap') },
  ],
};

export default {
  id: '2',
  title: L('Синтез иодбензола', 'Иодбензол синтезі', 'Synthesis of iodobenzene'),
  principle: L('Иодид-ион замещает диазогруппу с выделением азота; катализатор не нужен. Побочный фенол удаляют в виде фенолята натрия, иод — тиосульфатом; продукт сушат и перегоняют (фракция 185–190 °C).', 'Иодид-ион диазотопты азот бөле орынбасады; катализатор қажет емес. Қосымша фенолды натрий феноляты түрінде, иодты тиосульфатпен жояды; өнімді кептіріп, айдайды (185–190 °C фракциясы).', 'Iodide ion replaces the diazo group with evolution of nitrogen; no catalyst is needed. The phenol by-product is removed as sodium phenoxide and iodine with thiosulfate; the product is dried and distilled (185–190 °C fraction).'),
  equation: ['C₆H₅N₂⁺ Cl⁻ + KI → C₆H₅I + N₂↑ + KCl', L('C₆H₅N₂⁺ Cl⁻ + H₂O → C₆H₅OH + N₂↑ + HCl (побочно, при нагревании)', 'C₆H₅N₂⁺ Cl⁻ + H₂O → C₆H₅OH + N₂↑ + HCl (қосымша, қыздырғанда)', 'C₆H₅N₂⁺ Cl⁻ + H₂O → C₆H₅OH + N₂↑ + HCl (side reaction, on warming)'), 'C₆H₅OH + NaOH → C₆H₅ONa + H₂O', 'I₂ + 2Na₂S₂O₃ → 2NaI + Na₂S₄O₆'],
  initialState: ({ prev }) => {
    const r = prev['1'] || { nAn: 25, Dz: 24, P: 0.3, coupled: 0.2, N: 0.4, V: 21, nHCl: 75.7, nitriteAdded: 26, store: 'ice' };
    const V = r.V || 21, frac = Math.max(0.5, (V - 3) / V);
    const Dz = Math.max(0, r.Dz * frac);
    return {
      nAn: r.nAn, frac, Dz0: Dz, Dz, PhI: 0, iodide: 0, phenolDiaz: (r.P || 0) * frac, phenolKI: 0, coupled: (r.coupled || 0) * frac,
      portions: (r.Dz || 0) * (1 - frac), side1: Math.max(0, r.nAn - r.Dz) * frac,
      H: freeAcid(r.nHCl || 75.7, r.nAn, r.nitriteAdded || 26, r.P || 0) * frac, V: V * frac,
      mKI: 0, nKI: 0, vKIw: 0, T: 3, Tb: 22, place: 'ice', maxT: 0, foam: 0, gas: 0, lossFoam: 0, k: { t0: null, t1: null, over: false },
      unreacted: 0, vNaOH: 0, pH: 1, phOrg: 0.85, lossFunnel: 0, wash: { I2: 1, n: 0, thio: 0, water: 0, last: '' }, wet: 0.002, lossDry: 0,
      crude: null, lossHandling: 0, asm: null, dist: null, look: null,
    };
  },
  checkpoints: [0, 3, 5, 8],
  steps: [e0, e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12, e13],
  results(S) {
    const D = S.dist || { m0: 0, m1: 0, main: { w: 0, p: 0, i: 0 }, fore: { w: 0, p: 0, i: 0 }, liq: { w: 0, p: 0, i: 0 }, bp: {}, hold: 0, lost: 0 };
    const m = Math.max(0, (D.m1 || 0) - (D.m0 || 0));
    const th = theoretical(S.nAn);
    const losses = lossBreakdown({
      nAn: S.nAn, portions: S.portions, coupled: S.coupled + S.side1, phenolDiaz: S.phenolDiaz, phenolKI: S.phenolKI, unreacted: S.unreacted,
      foam: 0, funnel: S.lossHandling || 0, washes: 0, fore: D.fore.i + (D.lost || 0), residue: D.liq.i + (D.hold || 0), product: D.main.i,
    });
    return {
      nAn: S.nAn, mKI: S.mKI, nKI: S.nKI, vNaOH: S.vNaOH, pH: S.pH, maxT: S.maxT,
      m0: D.m0, m1: D.m1, m, th, yield: percentYield(m, S.nAn), bpLo: D.bp.lo, bpHi: D.bp.hi,
      purity: S.look ? S.look.purity : 0, cloudy: !!(S.look && S.look.cloudy), brown: !!(S.look && S.look.brown), pure: isPure(S),
      washes: S.wash.n, thio: S.wash.thio, losses,
    };
  },
  summary: (r) => [
    { label: L('Иодбензол', 'Иодбензол', 'Iodobenzene'), value: { ru: n(r.m, 2) + ' г', kk: n(r.m, 2) + ' г', en: n(r.m, 2) + ' g' } },
    { label: L('Выход', 'Шығым', 'Yield'), value: n(r.yield, 1) + ' %', st: r.yield >= 40 ? 'ok' : 'warn' },
    { label: L('Т. кип.', 'Қайнау t', 'B.p.'), value: r.bpLo != null ? `${n(r.bpLo, 0)}–${n(r.bpHi, 0)} °C` : '—', st: r.pure ? 'ok' : 'warn' },
  ],
};
