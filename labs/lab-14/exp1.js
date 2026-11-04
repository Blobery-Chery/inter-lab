/** Опыт 1. Синтез метилового оранжевого. Методичка, раздел 6, опыт 1 (пп. 1–8). */
import { L, n } from '../../app/i18n.js';
import { relax } from '../../app/instruments/thermal.js';
import { pHcolor } from '../../app/instruments/indicator.js';
import { M, hclMmol, naohMmol, dissolveRate, decompRate, mixOnIce, mixPH, acidInventory, acidFraction, solubility, coupled, makeFin, theoretical, percentYield, lossBreakdown } from './model.js';
import { beakerScene, hoodScene, pourScene, dmaTubeExtra, filterBase, slurryColor } from './scene.js';
import { beaker as beakerSVG, text } from '../../app/scene/svg.js';
import { equipmentIcon } from '../../app/equipment.js';

const g = (x, d = 4) => n(x, d);
const ml = (v, d = 1) => ({ ru: n(v, d) + ' мл', kk: n(v, d) + ' мл', en: n(v, d) + ' mL' });
const gr = (v, d = 1) => ({ ru: n(v, d) + ' г', kk: n(v, d) + ' г', en: n(v, d) + ' g' });
const mins = (s) => ({ ru: n(s / 60, 1) + ' мин', kk: n(s / 60, 1) + ' мин', en: n(s / 60, 1) + ' min' });
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

const WHITE = 'rgba(240,240,232,.62)';
const RED = slurryColor(1);

/* ------------------------------------------------------------------ 0. рабочее место */
const s0 = {
  type: 'checklist', id: 'ppe',
  title: L('Рабочее место и средства защиты', 'Жұмыс орны және қорғаныс құралдары', 'Workplace and protective equipment'),
  instr: L('<p>N,N-Диметиланилин токсичен при вдыхании и попадании на кожу, нитрит натрия ядовит, конц. HCl и ледяная уксусная кислота едкие. Наденьте средства защиты, включите тягу и найдите средства аварийной защиты: нажмите на каждый нужный пункт. Лишнее не нажимайте.</p>',
    '<p>N,N-Диметиланилин буын жұтқанда және теріге тигенде улы, натрий нитриті улы, конц. HCl мен мұзды сірке қышқылы күйдіргіш. Қорғаныс құралдарын киіп, тартымды қосыңыз және апаттық қорғаныс құралдарын табыңыз: әр қажетті тармақты басыңыз. Артығын баспаңыз.</p>',
    '<p>N,N-Dimethylaniline is toxic by inhalation and skin contact, sodium nitrite is poisonous, and conc. HCl and glacial acetic acid are corrosive. Put on your protective equipment, switch on the hood and locate the emergency equipment: tap every item you need. Do not tap anything that is wrong.</p>'),
  need: L('Выполните все нужные пункты', 'Барлық қажетті тармақтарды орындаңыз', 'Complete every required item'),
  scene: hoodScene,
  items: [
    { id: 'coat', label: L('Халат застёгнут', 'Халат түймеленген', 'Lab coat buttoned'), log: L('Надет и застёгнут хлопковый халат', 'Мақта мата халат киіліп, түймеленді', 'Cotton lab coat on and buttoned') },
    { id: 'gog', label: L('Защитные очки', 'Қорғаныс көзілдірігі', 'Safety goggles'), log: L('Надеты защитные очки', 'Қорғаныс көзілдірігі киілді', 'Safety goggles on') },
    { id: 'glv', label: L('Перчатки нитриловые', 'Нитрил қолғаптар', 'Nitrile gloves'), log: L('Надеты нитриловые перчатки (диметиланилин всасывается через кожу)', 'Нитрил қолғаптар киілді (диметиланилин тері арқылы сіңеді)', 'Nitrile gloves on (dimethylaniline is absorbed through the skin)') },
    { id: 'hood', label: L('Включить тягу шкафа, опустить экран', 'Шкаф тартымын қосып, экранды түсіру', 'Switch on the hood, lower the sash'), log: L('Включена тяга вытяжного шкафа, экран опущен до рабочего уровня', 'Тартпа шкафтың тартымы қосылды, экран жұмыс деңгейіне дейін түсірілді', 'Fume hood switched on, sash lowered to working height') },
    { id: 'eye', label: L('Найти фонтанчик для глаз', 'Көз жуатын фонтанды табу', 'Locate the eyewash station'), log: L('Найден фонтанчик для промывания глаз', 'Көз жуатын фонтан табылды', 'Eyewash station located') },
    { id: 'shw', label: L('Найти аварийный душ', 'Апаттық душты табу', 'Locate the safety shower'), log: L('Найден аварийный душ', 'Апаттық душ табылды', 'Safety shower located') },
    { id: 'ext', label: L('Найти огнетушитель', 'Өрт сөндіргішті табу', 'Locate the fire extinguisher'), log: L('Найден огнетушитель', 'Өрт сөндіргіш табылды', 'Fire extinguisher located') },
    { id: 'lens', label: L('Работать в контактных линзах вместо очков', 'Көзілдіріктің орнына контакт линзаларымен жұмыс істеу', 'Work in contact lenses instead of goggles'),
      wrong: { severity: 'safety', text: L('попытка работать в контактных линзах без защитных очков (п. 3.2 правил ТБ)', 'қорғаныс көзілдірігінсіз контакт линзаларымен жұмыс істеу әрекеті (ҚТ ережелерінің 3.2-тармағы)', 'tried to work in contact lenses without goggles (safety rule 3.2)'),
        whatif: L('Пары HCl и уксусной кислоты скапливаются под линзой, а брызги щёлочи или кислоты попадают прямо в глаз. Очки обязательны при любой работе с реактивами.', 'HCl мен сірке қышқылының булары линза астына жиналады, ал сілті немесе қышқыл шашырандылары тікелей көзге түседі. Реактивтермен кез келген жұмыста көзілдірік міндетті.', 'HCl and acetic acid vapour collects under the lens, and splashes of alkali or acid go straight into the eye. Goggles are compulsory for any work with reagents.') } },
    { id: 'tea', label: L('Поставить рядом чай, чтобы не отвлекаться', 'Алаңдамау үшін жанына шай қою', 'Keep a cup of tea nearby'),
      wrong: { severity: 'safety', text: L('напитки на рабочем месте (п. 2.2 правил ТБ)', 'жұмыс орнындағы сусындар (ҚТ ережелерінің 2.2-тармағы)', 'drinks at the workplace (safety rule 2.2)'),
        whatif: L('Еда и напитки в лаборатории запрещены: нитрит натрия и диметиланилин ядовиты при проглатывании, а кружку легко перепутать со стаканом.', 'Зертханада тамақ пен сусындарға тыйым салынған: натрий нитриті мен диметиланилин жұтқанда улы, ал кесені стақанмен шатастыру оңай.', 'Food and drink are forbidden in the lab: sodium nitrite and dimethylaniline are poisonous if swallowed, and a mug is easily confused with a beaker.') } },
  ],
};

/* ------------------------------------------------------------------ 1. посуда */
const s1 = {
  type: 'pick', id: 'kit',
  title: L('Посуда и приборы для синтеза', 'Синтезге арналған ыдыстар мен құралдар', 'Glassware and instruments for the synthesis'),
  instr: L('<p>Возьмите с полки всё, что нужно для растворения, диазотирования и сочетания (пп. 1–6 хода работы), и ничего лишнего.</p><p class="note">Установку для фильтрования соберёте позже; навески возьмёте на весах.</p>',
    '<p>Сөреден еріту, диазоттау және азоқосылу үшін қажеттінің бәрін алыңыз (жұмыс барысының 1–6-тармақтары), артығын алмаңыз.</p><p class="note">Сүзу қондырғысын кейін жинайсыз; өлшендіні таразыда аласыз.</p>',
    '<p>Take from the shelf everything you need for dissolving, diazotization and coupling (procedure steps 1–6) and nothing extra.</p><p class="note">You will assemble the filtration set-up later; the samples are weighed on the balance.</p>'),
  need: L('Соберите нужный набор', 'Қажетті жиынтықты жинаңыз', 'Collect the right set'),
  shelf: ['beaker-50', 'beaker-100', 'test-tube', 'thermometer-100', 'glass-rod', 'ice-bath', 'hot-plate', 'cylinder-25', 'cylinder-10', 'graduated-pipette', 'indicator-paper',
    { id: 'starch', label: L('Иодкрахмальная бумага', 'Иодкрахмал қағазы', 'Starch–iodide paper'), icon: equipmentIcon('indicator-paper') },
    'rbf-50', 'reflux-condenser', 'sep-funnel', 'heating-mantle', 'ice-salt-bath', 'mp-apparatus', 'polarimeter-tube', 'boiling-chips'],
  take: ['beaker-50', 'beaker-100', 'test-tube', 'thermometer-100', 'glass-rod', 'ice-bath', 'hot-plate', 'cylinder-25', 'cylinder-10', 'graduated-pipette', 'indicator-paper', 'starch'],
  hint1: L('Реакцию ведут в стаканах на 50 и 100 мл (раздел 5 методички), диметиланилин смешивают с уксусной кислотой в пробирке. Нужны ледяная баня, термометр, плитка, палочка, мерная посуда и две бумаги: индикаторная и иодкрахмальная.', 'Реакцияны 50 және 100 мл стақандарда жүргізеді (әдістеменің 5-бөлімі), диметиланилинді сірке қышқылымен пробиркада араластырады. Мұз моншасы, термометр, плита, таяқша, өлшегіш ыдыстар және екі қағаз қажет: индикатор және иодкрахмал.', 'The reaction is run in 50 and 100 mL beakers (manual, section 5); dimethylaniline is mixed with acetic acid in a test tube. You need an ice bath, a thermometer, a hot plate, a rod, measuring glassware and two papers: indicator and starch–iodide.'),
};

/* ------------------------------------------------------------------ 2. навеска сульфаниловой кислоты */
const s2 = {
  type: 'weigh', id: 'wSA',
  title: L('Навеска сульфаниловой кислоты', 'Сульфанил қышқылының өлшендісі', 'Weighing the sulfanilic acid'),
  instr: L('<ol><li>Возьмите на аналитических весах <b>1,73 г (10 ммоль)</b> сульфаниловой кислоты (4-аминобензолсульфокислоты).</li><li>Лодочка → тарирование → вещество шпателем → закрыть дверцы → записать массу.</li></ol><p class="note">Допустимо 1,70–1,76 г. По фактической массе считают теоретический выход.</p>',
    '<ol><li>Аналитикалық таразыда <b>1,73 г (10 ммоль)</b> сульфанил қышқылын (4-аминобензолсульфоқышқылын) өлшеп алыңыз.</li><li>Қайықша → тарировкалау → затты шпательмен салу → есікшелерді жабу → массаны жазу.</li></ol><p class="note">1,70–1,76 г рұқсат етіледі. Теориялық шығым нақты масса бойынша есептеледі.</p>',
    '<ol><li>Weigh out <b>1.73 g (10 mmol)</b> of sulfanilic acid (4-aminobenzenesulfonic acid) on the analytical balance.</li><li>Boat → tare → solid with a spatula → close the doors → record the mass.</li></ol><p class="note">1.70–1.76 g is acceptable. The theoretical yield is calculated from the actual mass.</p>'),
  need: L('Запишите массу навески', 'Өлшендінің массасын жазыңыз', 'Record the mass of the sample'),
  reagent: L('H₂N–C₆H₄–SO₃H', 'H₂N–C₆H₄–SO₃H', 'H₂N–C₆H₄–SO₃H'), mode: 'spatula', container: 'boat', target: 1.73, lo: 1.70, hi: 1.76, saveAs: 'mSA',
  onRecord(S, m, ctx) {
    ctx.log(L(`Навеска сульфаниловой кислоты: <b>${g(m)} г</b> (${n((m / M.SA) * 1000, 2)} ммоль)`, `Сульфанил қышқылының өлшендісі: <b>${g(m)} г</b> (${n((m / M.SA) * 1000, 2)} ммоль)`, `Sulfanilic acid sample: <b>${g(m)} g</b> (${n((m / M.SA) * 1000, 2)} mmol)`), 'calc');
    ctx.log(L('Навеска перенесена в стакан на 50 мл', 'Өлшенді 50 мл стақанға ауыстырылды', 'Sample transferred to a 50 mL beaker'));
  },
};

/* ------------------------------------------------------------------ 3. вода и Na₂CO₃ */
const s3 = {
  type: 'measure', id: 'water',
  title: L('Вода и карбонат натрия', 'Су және натрий карбонаты', 'Water and sodium carbonate'),
  instr: L('<ol><li>Отмерьте цилиндром <b>20 мл</b> дистиллированной воды и прилейте к сульфаниловой кислоте.</li><li>Внесите <b>0,53 г (5 ммоль)</b> безводного Na₂CO₃ (взвешен на технохимических весах) и перемешайте.</li></ol><p class="note">Сульфаниловая кислота — цвиттер-ион H₃N⁺–C₆H₄–SO₃⁻, в воде растворяется плохо; растворимую натриевую соль она даёт с карбонатом.</p>',
    '<ol><li>Цилиндрмен <b>20 мл</b> дистилденген су өлшеп, сульфанил қышқылына құйыңыз.</li><li><b>0,53 г (5 ммоль)</b> сусыз Na₂CO₃ салыңыз (техникалық таразыда өлшенген) және араластырыңыз.</li></ol><p class="note">Сульфанил қышқылы — H₃N⁺–C₆H₄–SO₃⁻ биполярлы ионы (цвиттер-ион), суда нашар ериді; карбонатпен еритін натрий тұзын береді.</p>',
    '<ol><li>Measure <b>20 mL</b> of distilled water with a cylinder and add it to the sulfanilic acid.</li><li>Add <b>0.53 g (5 mmol)</b> of anhydrous Na₂CO₃ (weighed on a top-pan balance) and stir.</li></ol><p class="note">Sulfanilic acid is a zwitterion, H₃N⁺–C₆H₄–SO₃⁻, and dissolves poorly in water; with carbonate it gives the soluble sodium salt.</p>'),
  need: L('Прилейте 20 мл воды и внесите Na₂CO₃', '20 мл су құйып, Na₂CO₃ салыңыз', 'Add 20 mL of water and the Na₂CO₃'),
  measure: 'cylinder-25', reagent: L('H₂O дист.', 'H₂O дист.', 'dist. H₂O'), bottleSub: L('вода', 'су', 'water'), target: 20, tol: 1, onDeviation: 'consequence', saveAs: 'vWater',
  into: L('стакан с сульфаниловой кислотой', 'сульфанил қышқылы бар стақан', 'the beaker with sulfanilic acid'),
  then: [
    { id: 'carb', label: L('Внести 0,53 г Na₂CO₃', '0,53 г Na₂CO₃ салу', 'Add 0.53 g of Na₂CO₃'), advance: 30, do(S) { S.carb = true; }, log: L('Внесено 0,53 г (5 ммоль) безводного Na₂CO₃', '0,53 г (5 ммоль) сусыз Na₂CO₃ салынды', '0.53 g (5 mmol) of anhydrous Na₂CO₃ added') },
    { id: 'stir', label: L('Перемешать палочкой', 'Таяқшамен араластыру', 'Stir with the rod'), requires: ['carb'], advance: 60, obs: L('На холоду растворяется плохо: белая суспензия, единичные пузырьки CO₂', 'Суықта нашар ериді: ақ суспензия, жекелеген CO₂ көпіршіктері', 'Little dissolves in the cold: a white suspension with a few bubbles of CO₂') },
  ],
  sceneExtra: (S, lc) => beakerSVG({ id: 'sx', x: 236, y: 120, w: 70, hh: 92, frac: (S.vWater || 0) / 50, ppt: 0.6, pptColor: 'var(--solid)', cap: 50, marks: [20, 40], label: L('стакан 50 мл', 'стақан 50 мл', '50 mL beaker') }),
};

/* ------------------------------------------------------------------ 4. растворение при нагревании */
const s4 = {
  type: 'process', id: 'dissolve',
  title: L('Растворение при нагревании и охлаждение', 'Қыздырып еріту және салқындату', 'Dissolving with warming, then cooling'),
  instr: L('<ol><li>Нагрейте суспензию на плитке, перемешивая, до полного растворения (выделяется CO₂).</li><li>Снимите с плитки и <b>охладите раствор до комнатной температуры</b> (можно под струёй холодной воды снаружи стакана).</li></ol><p class="note">Кипятить не нужно. Тёплый раствор при выливании на лёд разогреет смесь для диазотирования.</p>',
    '<ol><li>Суспензияны плитада араластыра отырып толық ерігенше қыздырыңыз (CO₂ бөлінеді).</li><li>Плитадан алып, <b>ерітіндіні бөлме температурасына дейін салқындатыңыз</b> (стақанның сыртынан суық су ағынымен салқындатуға болады).</li></ol><p class="note">Қайнатудың қажеті жоқ. Жылы ерітінді мұзға құйылғанда диазоттау қоспасын қыздырады.</p>',
    '<ol><li>Warm the suspension on the hot plate with stirring until it has completely dissolved (CO₂ is given off).</li><li>Take it off the hot plate and <b>cool the solution to room temperature</b> (you can hold the beaker under a stream of cold water).</li></ol><p class="note">There is no need to boil it. A warm solution poured onto ice will warm up the diazotization mixture.</p>'),
  need: L('Растворите и охладите до комнатной температуры', 'Ерітіп, бөлме температурасына дейін салқындатыңыз', 'Dissolve, then cool to room temperature'),
  speeds: [5, 10, 30],
  setup(S, lc) { S.T = 22; S.dis = S.dis || 0; lc.boil = 0; },
  controls: [
    { kind: 'toggle', id: 'heat', group: L('Плитка', 'Плита', 'Hot plate'), label: L('Плитка: включить', 'Плита: қосу', 'Hot plate: on'), labelOn: L('Плитка: выключить', 'Плита: өшіру', 'Hot plate: off'),
      onChange(S, lc, on, ctx) { ctx.log(on ? L('Стакан на плитке, нагрев включён', 'Стақан плитада, қыздыру қосылды', 'Beaker on the hot plate, heating on') : L('Плитка выключена, стакан снят', 'Плита өшірілді, стақан алынды', 'Hot plate off, beaker removed')); } },
    { kind: 'toggle', id: 'stir', group: L('Плитка', 'Плита', 'Hot plate'), label: L('Перемешивать', 'Араластыру', 'Stir'), labelOn: L('Перемешивание: вкл.', 'Араластыру: қосулы', 'Stirring: on') },
    { kind: 'action', id: 'tap', once: false, group: L('Охлаждение', 'Салқындату', 'Cooling'), label: L('Охладить под струёй воды (1 мин)', 'Су ағынымен салқындату (1 мин)', 'Cool under running water (1 min)'), advance: 60,
      disabled: (S, lc) => !!lc.c.heat,
      do(S) { S.T = relax(S.T, 16, 0.025, 60); } },
  ],
  tick(S, lc, dt) {
    const on = lc.c.heat;
    S.T = Math.min(100, relax(S.T, on ? 104 : 22, on ? 0.006 : 0.0016, dt));
    S.Tmax = Math.max(S.Tmax || 22, S.T);
    if (S.dis < 1) S.dis = Math.min(1, S.dis + dissolveRate(S.T, lc.c.stir) * dt);
    if (S.T >= 99.5) lc.boil += dt;
  },
  readouts: (S, lc) => [
    { label: L('Раствор', 'Ерітінді', 'Solution'), value: n(S.T, 1) + ' °C', st: S.T >= 99 ? 'warn' : S.dis >= 0.995 && S.T <= 30 ? 'ok' : '' },
    { label: L('Не растворилось', 'Ерімеді', 'Undissolved'), value: S.dis >= 0.995 ? L('нет', 'жоқ', 'none') : S.dis > 0.6 ? L('немного', 'аздап', 'a little') : L('много', 'көп', 'a lot'), st: S.dis >= 0.995 ? 'ok' : '' },
  ],
  alerts(S, lc) {
    if (S.T >= 99.5) return { text: L('Раствор кипит — кипятить не нужно. Выключите плитку.', 'Ерітінді қайнап жатыр — қайнатудың қажеті жоқ. Плитаны өшіріңіз.', 'The solution is boiling — no need to boil it. Switch off the hot plate.'), kind: 'warn' };
    if (S.dis >= 0.995 && lc.c.heat) return { text: L('Всё растворилось, CO₂ больше не выделяется. Выключите плитку и охладите раствор.', 'Бәрі еріді, CO₂ енді бөлінбейді. Плитаны өшіріп, ерітіндіні салқындатыңыз.', 'Everything has dissolved and no more CO₂ is evolved. Switch off the hot plate and cool the solution.'), kind: 'good' };
    if (S.dis >= 0.995 && S.T > 30) return { text: L(`Раствор ещё тёплый (${n(S.T, 0)} °C). Охладите его до комнатной температуры.`, `Ерітінді әлі жылы (${n(S.T, 0)} °C). Оны бөлме температурасына дейін салқындатыңыз.`, `The solution is still warm (${n(S.T, 0)} °C). Cool it to room temperature.`), kind: 'info' };
    return null;
  },
  done(S, lc, ctx) {
    if (S.dis >= 0.995 && !lc.c.heat) {
      ctx.log(L('Сульфаниловая кислота полностью растворилась (натриевая соль), прозрачный бесцветный раствор; выделение CO₂ прекратилось', 'Сульфанил қышқылы толық еріді (натрий тұзы), мөлдір түссіз ерітінді; CO₂ бөлінуі тоқтады', 'The sulfanilic acid has dissolved completely (sodium salt) — a clear colourless solution; CO₂ evolution has stopped'), 'obs');
      return { text: L('Раствор прозрачный. Перед продолжением он должен остыть до комнатной температуры.', 'Ерітінді мөлдір. Жалғастырар алдында ол бөлме температурасына дейін суынуы тиіс.', 'The solution is clear. It must be at room temperature before you go on.'), kind: 'good' };
    }
    return false;
  },
  onLeave(S, ctx) {
    S.Tsol = S.T;
    if (S.T > 30) ctx.remark({ key: 'hotsol', severity: 'minor', text: L(`раствор сульфанилата не охлаждён (${n(S.T, 0)} °C) — смесь для диазотирования разогреется`, `сульфанилат ерітіндісі салқындатылмады (${n(S.T, 0)} °C) — диазоттау қоспасы қызады`, `the sulfanilate solution was not cooled (${n(S.T, 0)} °C) — the diazotization mixture will warm up`) });
    if ((ctx.local.boil || 0) > 60) ctx.remark({ key: 'boil1', severity: 'minor', text: L('раствор кипятили без необходимости — брызги и потеря воды', 'ерітінді қажетсіз қайнатылды — шашырау және судың жоғалуы', 'the solution was boiled for no reason — splashing and loss of water') });
  },
  scene: (S, lc) => beakerScene({ cap: 50, vol: (S.vWater || 20) + 1, color: S.dis < 0.995 ? 'rgba(240,240,232,.5)' : null, ppt: Math.max(0, 1 - S.dis) * 0.8, pptColor: 'var(--solid)', T: S.T, tMin: 0, tMax: 100, rod: true, stir: lc.c && lc.c.stir, plate: true, hot: lc.c && lc.c.heat, gas: S.dis < 0.995 && S.T > 30, boil: S.T >= 99.5, steam: S.T > 85, label: L('стакан 50 мл', 'стақан 50 мл', '50 mL beaker') }),
  hints: [
    L('Нагрев ускоряет растворение сульфаниловой кислоты в растворе Na₂CO₃; пузырьки — это CO₂.', 'Қыздыру сульфанил қышқылының Na₂CO₃ ерітіндісінде еруін тездетеді; көпіршіктер — CO₂.', 'Warming speeds up the dissolution of sulfanilic acid in the Na₂CO₃ solution; the bubbles are CO₂.'),
    L('Кипятить не нужно: достаточно 60–80 °C. Когда всё растворится — выключите плитку.', 'Қайнатудың қажеті жоқ: 60–80 °C жеткілікті. Бәрі ерігенде — плитаны өшіріңіз.', 'No need to boil: 60–80 °C is enough. When everything has dissolved, switch off the hot plate.'),
    L('Включите плитку и перемешивание → дождитесь «Не растворилось: нет» → выключите плитку → охлаждайте под струёй воды до ≈ 22 °C → «Далее».', 'Плита мен араластыруды қосыңыз → «Ерімеді: жоқ» болғанша күтіңіз → плитаны өшіріңіз → су ағынымен ≈ 22 °C-қа дейін салқындатыңыз → «Әрі қарай».', 'Switch on the hot plate and stirring → wait for “Undissolved: none” → switch off the plate → cool under running water to ≈ 22 °C → “Next”.'),
  ],
};

/* ------------------------------------------------------------------ 5. нитрит натрия */
const s5 = {
  type: 'weigh', id: 'wNit',
  title: L('Нитрит натрия', 'Натрий нитриті', 'Sodium nitrite'),
  instr: L('<ol><li>Возьмите <b>0,75 г (11 ммоль)</b> NaNO₂ и растворите в <b>3 мл</b> воды.</li><li>Прилейте раствор нитрита к раствору сульфанилата натрия.</li></ol><p class="note">Нитрит натрия ядовит при проглатывании и является окислителем. Небольшой избыток (11 ммоль на 10 ммоль амина) нужен для полного диазотирования.</p>',
    '<ol><li><b>0,75 г (11 ммоль)</b> NaNO₂ алып, <b>3 мл</b> суда ерітіңіз.</li><li>Нитрит ерітіндісін натрий сульфанилаты ерітіндісіне құйыңыз.</li></ol><p class="note">Натрий нитриті жұтқанда улы және тотықтырғыш. Толық диазоттау үшін аздаған артық мөлшер (10 ммоль аминге 11 ммоль) қажет.</p>',
    '<ol><li>Take <b>0.75 g (11 mmol)</b> of NaNO₂ and dissolve it in <b>3 mL</b> of water.</li><li>Add the nitrite solution to the sodium sulfanilate solution.</li></ol><p class="note">Sodium nitrite is toxic if swallowed and is an oxidiser. A slight excess (11 mmol per 10 mmol of amine) is needed for complete diazotization.</p>'),
  need: L('Запишите массу NaNO₂', 'NaNO₂ массасын жазыңыз', 'Record the mass of NaNO₂'),
  reagent: L('NaNO₂', 'NaNO₂', 'NaNO₂'), mode: 'spatula', container: 'boat', target: 0.75, lo: 0.73, hi: 0.77, saveAs: 'mNit',
  onRecord(S, m, ctx) {
    ctx.log(L(`Навеска NaNO₂: <b>${g(m)} г</b> (${n((m / M.NANO2) * 1000, 2)} ммоль)`, `NaNO₂ өлшендісі: <b>${g(m)} г</b> (${n((m / M.NANO2) * 1000, 2)} ммоль)`, `NaNO₂ sample: <b>${g(m)} g</b> (${n((m / M.NANO2) * 1000, 2)} mmol)`), 'calc');
    ctx.log(L('NaNO₂ растворён в 3 мл воды, раствор прилит к раствору сульфанилата натрия; раствор прозрачный, бесцветный', 'NaNO₂ 3 мл суда ерітіліп, натрий сульфанилаты ерітіндісіне құйылды; ерітінді мөлдір, түссіз', 'NaNO₂ dissolved in 3 mL of water and added to the sodium sulfanilate solution; the solution is clear and colourless'), 'obs');
    ctx.advance(180);
  },
};

/* ------------------------------------------------------------------ 6. HCl на лёд */
const s6 = {
  type: 'measure', id: 'hcl',
  title: L('Конц. HCl в стакан со льдом', 'Конц. HCl мұзы бар стақанға', 'Conc. HCl into the beaker with ice'),
  instr: L('<ol><li>В вытяжном шкафу отмерьте цилиндром <b>2 мл</b> конц. HCl (36 %).</li><li>Влейте кислоту в стакан на 100 мл, в который насыпан колотый лёд.</li></ol><p class="note">HCl нужна на образование HNO₂ и на диазотирование (2 моль на 1 моль амина) с небольшим избытком: недостаток кислоты — неполное диазотирование.</p>',
    '<ol><li>Тартпа шкафта цилиндрмен <b>2 мл</b> конц. HCl (36 %) өлшеңіз.</li><li>Қышқылды уатылған мұз салынған 100 мл стақанға құйыңыз.</li></ol><p class="note">HCl HNO₂ түзуге және диазоттауға (1 моль аминге 2 моль) аздаған артығымен қажет: қышқыл жетіспесе — диазоттау толық жүрмейді.</p>',
    '<ol><li>In the fume hood, measure <b>2 mL</b> of conc. HCl (36 %) with a cylinder.</li><li>Pour the acid into a 100 mL beaker containing crushed ice.</li></ol><p class="note">HCl is needed to form HNO₂ and for the diazotization (2 mol per mol of amine) with a slight excess: too little acid means incomplete diazotization.</p>'),
  need: L('Отмерьте 2 мл конц. HCl', '2 мл конц. HCl өлшеңіз', 'Measure 2 mL of conc. HCl'),
  measure: 'cylinder-10', reagent: L('HCl', 'HCl', 'HCl'), bottleSub: L('конц. 36 %', 'конц. 36 %', 'conc. 36 %'), target: 2, tol: 0.2, onDeviation: 'consequence', saveAs: 'vHCl',
  into: L('стакан 100 мл со льдом', 'мұзы бар 100 мл стақан', 'the 100 mL beaker with ice'),
  onTransfer(S, v, ctx) {
    const need = 2 * (S.mSA / M.SA) * 1000 + 1;
    if (hclMmol(v) < need * 0.92) ctx.remark({ key: 'hcl-low', severity: 'major', text: L(`недостаточно HCl (${n(v, 1)} мл ≈ ${n(hclMmol(v), 1)} ммоль при потребности ≈ ${n(need, 0)} ммоль) — диазотирование будет неполным`, `HCl жеткіліксіз (${n(v, 1)} мл ≈ ${n(hclMmol(v), 1)} ммоль, қажеті ≈ ${n(need, 0)} ммоль) — диазоттау толық болмайды`, `too little HCl (${n(v, 1)} mL ≈ ${n(hclMmol(v), 1)} mmol for ≈ ${n(need, 0)} mmol needed) — the diazotization will be incomplete`) });
  },
  sceneExtra: () => beakerSVG({ id: 'hx', x: 226, y: 112, w: 92, hh: 100, frac: 0.05, cap: 100, marks: [50], label: L('стакан 100 мл', 'стақан 100 мл', '100 mL beaker') }),
};

/* ------------------------------------------------------------------ 7. выливание на лёд с HCl */
const s7 = {
  type: 'decide', id: 'pour',
  title: L('Диазотирование: раствор — на лёд с HCl', 'Диазоттау: ерітінді — HCl бар мұзға', 'Diazotization: the solution onto ice and HCl'),
  instr: L('<ol><li>Подберите массу колотого льда в стакане (по методичке — <b>около 10 г</b>).</li><li>Выберите, как соединить раствор сульфанилата и нитрита с кислотой.</li></ol><p class="note">Должен появиться мелкий белый осадок соли диазония.</p>',
    '<ol><li>Стақандағы уатылған мұздың массасын таңдаңыз (әдістеме бойынша — <b>шамамен 10 г</b>).</li><li>Сульфанилат пен нитрит ерітіндісін қышқылмен қалай қосатыныңызды таңдаңыз.</li></ol><p class="note">Диазоний тұзының ұсақ ақ тұнбасы пайда болуы тиіс.</p>',
    '<ol><li>Choose the mass of crushed ice in the beaker (the manual says <b>about 10 g</b>).</li><li>Choose how to combine the sulfanilate–nitrite solution with the acid.</li></ol><p class="note">A fine white precipitate of the diazonium salt should appear.</p>'),
  need: L('Соедините растворы', 'Ерітінділерді қосыңыз', 'Combine the solutions'),
  inputs: [{ id: 'ice', label: L('Колотый лёд, г', 'Уатылған мұз, г', 'Crushed ice, g'), min: 0, max: 20, step: 2, value: 4, unit: L('г', 'г', 'g') }],
  question: L('Как провести смешение?', 'Араластыруды қалай жүргізесіз?', 'How do you combine them?'),
  options: [
    { id: 'ok', ok: true, label: L('Влить раствор тонкой струёй в стакан со льдом и HCl, перемешивая', 'Ерітіндіні мұз бен HCl бар стақанға жіңішке ағынмен, араластыра отырып құю', 'Pour the solution in a thin stream into the beaker with ice and HCl, stirring'), advance: 90,
      effect(S) { S.dz.order = 'ok'; }, why: L('амин и нитрит попадают сразу в избыток холодной кислоты', 'амин мен нитрит бірден суық қышқылдың артық мөлшеріне түседі', 'the amine and nitrite meet an excess of cold acid at once') },
    { id: 'rev', ok: false, severity: 'major', label: L('Наоборот: лёд с HCl высыпать в стакан с раствором', 'Керісінше: HCl бар мұзды ерітіндісі бар стақанға салу', 'The other way round: tip the ice and HCl into the solution'), advance: 90,
      remark: L('нарушен порядок: кислоту прибавили к раствору нитрита и амина — местный недостаток кислоты, HNO₂ разлагается, часть амина даёт побочные продукты', 'рет бұзылды: қышқыл нитрит пен амин ерітіндісіне қосылды — қышқылдың жергілікті жетіспеушілігі, HNO₂ ыдырайды, аминнің бір бөлігі қосымша өнімдер береді', 'wrong order: acid added to the nitrite–amine solution — local shortage of acid, HNO₂ decomposes and part of the amine gives by-products'),
      whatif: L('Пока кислоты мало, образующийся катион диазония встречает ещё не продиазотированный амин и сочетается с ним (диазоаминосоединение, жёлтая муть), а HNO₂ частично разлагается с бурыми оксидами азота. Выход падает.', 'Қышқыл аз болғанда түзілген диазоний катионы әлі диазотталмаған аминмен кездесіп, онымен қосылады (диазоаминоқосылыс, сары лайлану), ал HNO₂ қоңыр азот оксидтерін бөліп, ішінара ыдырайды. Шығым төмендейді.', 'While acid is scarce, the diazonium ion as it forms meets amine that has not yet been diazotized and couples with it (a diazoamino compound, a yellow haze), and some HNO₂ decomposes giving brown nitrogen oxides. The yield drops.'),
      effect(S) { S.dz.order = 'rev'; } },
    { id: 'fast', ok: false, severity: 'minor', label: L('Вылить всё сразу, без перемешивания', 'Бәрін бірден, араластырмай құю', 'Pour it all in at once without stirring'), advance: 30,
      remark: L('раствор вылит разом без перемешивания — местный разогрев, комки', 'ерітінді араластырмай бірден құйылды — жергілікті қызу, кесектер', 'solution poured in all at once without stirring — local warming, lumps'),
      whatif: L('Без перемешивания раствор растекается по поверхности, лёд тает неравномерно, осадок соли диазония выпадает комками, внутри которых остаётся непрореагировавший амин.', 'Араластырмаса ерітінді бетке жайылады, мұз біркелкі ерімейді, диазоний тұзының тұнбасы кесек болып түзіледі, олардың ішінде әрекеттеспеген амин қалады.', 'Without stirring the solution spreads over the surface, the ice melts unevenly and the diazonium salt comes down in lumps that trap unreacted amine.'),
      effect(S) { S.dz.order = 'fast'; } },
  ],
  check(S, inp, ctx) {
    const nSA = S.mSA / M.SA, need = 2 * nSA * 1000 + 1;
    const fH = clamp(hclMmol(S.vHCl) / need, 0, 1);
    const fOrder = S.dz.order === 'rev' ? 0.86 : S.dz.order === 'fast' ? 0.96 : 1;
    S.dz.conv = 0.96 * fH * fH * fOrder * (0.7 + 0.3 * (S.dis ?? 1));
    S.dz.excess = S.mNit / M.NANO2 - nSA * S.dz.conv - (S.dz.order === 'rev' ? 0.0012 : 0);
    const r = mixOnIce((S.vWater || 20) + 3 + S.vHCl, S.Tsol ?? 22, inp.ice, nSA * 1000 * S.dz.conv);
    S.dz.T0 = r.T + (S.dz.order === 'fast' ? 2 : 0); S.dz.iceLeft = r.iceLeft; S.dz.ice = inp.ice;
    S.T = S.dz.T0; S.dz.Tmax = S.T;
    S.vTot = (S.vWater || 20) + 3 + S.vHCl + inp.ice;
    if (inp.ice < 6) ctx.remark({ key: 'ice-low', severity: 'minor', text: L(`мало льда (${inp.ice} г вместо ~10 г): смесь сразу разогрелась до ${n(S.T, 0)} °C`, `мұз аз (~10 г орнына ${inp.ice} г): қоспа бірден ${n(S.T, 0)} °C-қа дейін қызды`, `too little ice (${inp.ice} g instead of ~10 g): the mixture warmed to ${n(S.T, 0)} °C at once`) });
    ctx.log(L(`Раствор влит в стакан с ${inp.ice} г льда и ${n(S.vHCl, 1)} мл конц. HCl. Выпал мелкий белый осадок соли диазония; температура ≈ ${n(S.T, 0)} °C${S.dz.order === 'rev' ? '; над стаканом слабые бурые пары, лёгкая жёлтая муть' : ''}`,
      `Ерітінді ${inp.ice} г мұз бен ${n(S.vHCl, 1)} мл конц. HCl бар стақанға құйылды. Диазоний тұзының ұсақ ақ тұнбасы түзілді; температура ≈ ${n(S.T, 0)} °C${S.dz.order === 'rev' ? '; стақан үстінде әлсіз қоңыр булар, аздап сары лайлану' : ''}`,
      `The solution was poured into the beaker with ${inp.ice} g of ice and ${n(S.vHCl, 1)} mL of conc. HCl. A fine white precipitate of the diazonium salt formed; temperature ≈ ${n(S.T, 0)} °C${S.dz.order === 'rev' ? '; faint brown fumes above the beaker and a slight yellow haze' : ''}`), 'obs');
  },
  scene: pourScene,
};

/* ------------------------------------------------------------------ 8. выдержка 0–5 °C */
const s8 = {
  type: 'process', id: 'diazo',
  title: L('Выдержка в ледяной бане 0–5 °C', 'Мұз моншасында 0–5 °C-та ұстау', 'Holding in the ice bath at 0–5 °C'),
  instr: L('<ol><li>Поставьте стакан в ледяную баню и выдержите смесь при <b>0–5 °C 5–10 минут</b>, перемешивая.</li></ol><p class="note">Соль диазония устойчива только на холоду: при нагревании она разлагается с выделением азота. Её не выделяют и не сушат — используют сразу.</p>',
    '<ol><li>Стақанды мұз моншасына қойып, қоспаны араластыра отырып <b>0–5 °C-та 5–10 минут</b> ұстаңыз.</li></ol><p class="note">Диазоний тұзы тек суықта тұрақты: қыздырғанда азот бөле ыдырайды. Оны бөліп алмайды және кептірмейді — бірден пайдаланады.</p>',
    '<ol><li>Put the beaker in the ice bath and keep the mixture at <b>0–5 °C for 5–10 minutes</b>, stirring.</li></ol><p class="note">The diazonium salt is stable only in the cold: when warmed it decomposes giving off nitrogen. It is never isolated or dried — it is used at once.</p>'),
  need: L('Выдержите 5 мин при 0–5 °C', '0–5 °C-та 5 мин ұстаңыз', 'Hold for 5 min at 0–5 °C'),
  speeds: [5, 10, 30],
  setup(S, lc) { lc.Tb = 20; lc.hold = 0; lc.t = 0; },
  controls: [
    { kind: 'action', id: 'bath', group: L('Баня', 'Монша', 'Bath'), label: L('Поставить стакан в ледяную баню', 'Стақанды мұз моншасына қою', 'Put the beaker in the ice bath'), advance: 20, do(S, lc) { S.dz.inBath = true; lc.Tb = 1; }, log: L('Стакан поставлен в ледяную баню', 'Стақан мұз моншасына қойылды', 'Beaker placed in the ice bath') },
    { kind: 'action', id: 'ice', once: false, group: L('Баня', 'Монша', 'Bath'), label: L('Подсыпать лёд в баню', 'Моншаға мұз салу', 'Add ice to the bath'), requires: ['bath'], advance: 20, do(S, lc) { lc.Tb = 0.5; } },
    { kind: 'toggle', id: 'stir', group: L('Стакан', 'Стақан', 'Beaker'), label: L('Перемешивать', 'Араластыру', 'Stir'), labelOn: L('Перемешивание: вкл.', 'Араластыру: қосулы', 'Stirring: on') },
  ],
  tick(S, lc, dt) {
    const D = S.dz;
    lc.t += dt;
    if (D.inBath) lc.Tb = Math.min(4, lc.Tb + 0.0006 * dt);
    if (D.iceLeft > 0) { S.T = relax(S.T, 0.5, 0.05, dt); D.iceLeft = Math.max(0, D.iceLeft - 0.0015 * dt); }
    else S.T = relax(S.T, D.inBath ? lc.Tb : 22, D.inBath ? (lc.c.stir ? 0.016 : 0.007) : 0.0012, dt);
    D.Tmax = Math.max(D.Tmax ?? S.T, S.T);
    D.D += decompRate(S.T) * dt;
    D.excess -= Math.max(0, D.excess) * 2e-5 * Math.exp(0.12 * (S.T - 5)) * dt;
    if (S.T <= 5.05) lc.hold += dt;
    D.hold = lc.hold;
  },
  readouts: (S, lc) => [
    { label: L('Смесь', 'Қоспа', 'Mixture'), value: n(S.T, 1) + ' °C', st: S.T > 10 ? 'bad' : S.T > 5.05 ? 'warn' : 'ok' },
    { label: L('Выдержка при 0–5 °C', '0–5 °C-та ұстау', 'Held at 0–5 °C'), value: mins(lc.hold), st: lc.hold >= 300 ? 'ok' : '' },
    { label: L('Лёд в смеси', 'Қоспадағы мұз', 'Ice in the mixture'), value: S.dz.iceLeft > 0.2 ? gr(S.dz.iceLeft, 0) : L('растаял', 'еріп кетті', 'melted') },
  ],
  alerts(S) {
    if (S.T > 10) return { text: L('Выше 10 °C соль диазония быстро разлагается (N₂↑). Поставьте стакан в лёд и перемешивайте!', '10 °C-тан жоғары диазоний тұзы тез ыдырайды (N₂↑). Стақанды мұзға қойып, араластырыңыз!', 'Above 10 °C the diazonium salt decomposes fast (N₂↑). Put the beaker in ice and stir!'), kind: 'bad' };
    if (S.T > 5.05) return { text: L('Температура выше 5 °C. Охлаждайте смесь в ледяной бане.', 'Температура 5 °C-тан жоғары. Қоспаны мұз моншасында салқындатыңыз.', 'Temperature above 5 °C. Cool the mixture in the ice bath.'), kind: 'warn' };
    return null;
  },
  events: [{
    id: 'gas', when: (S, lc) => S.T > 9 && lc.t > 20,
    title: L('В суспензии появились пузырьки газа', 'Суспензияда газ көпіршіктері пайда болды', 'Gas bubbles in the suspension'),
    text: L('Смесь тёплая, от осадка поднимаются мелкие пузырьки газа, появился слабый запах фенола. Что вы сделаете?', 'Қоспа жылы, тұнбадан ұсақ газ көпіршіктері көтерілуде, әлсіз фенол иісі пайда болды. Не істейсіз?', 'The mixture is warm, small gas bubbles rise from the solid and there is a faint smell of phenol. What do you do?'),
    options: [
      { ok: true, label: L('Сразу в ледяную баню, подсыпать лёд, перемешивать', 'Бірден мұз моншасына, мұз салу, араластыру', 'Into the ice bath at once, add ice, stir'), effect(S, lc) { S.dz.inBath = true; lc.Tb = 0.5; lc.c.stir = true; S.dz.iceLeft += 3; }, log: L('Стакан в ледяной бане, добавлен лёд, смесь перемешивается', 'Стақан мұз моншасында, мұз қосылды, қоспа араластырылуда', 'Beaker in the ice bath, ice added, mixture being stirred') },
      { ok: false, severity: 'major', label: L('Это CO₂ от карбоната — продолжать как есть', 'Бұл карбонаттан шыққан CO₂ — осылай жалғастыру', 'It is CO₂ from the carbonate — carry on as is'), remark: L('выделение азота при разложении соли диазония принято за CO₂, смесь не охлаждена', 'диазоний тұзы ыдырағанда бөлінетін азот CO₂ деп қабылданды, қоспа салқындатылмады', 'nitrogen from the decomposing diazonium salt mistaken for CO₂; the mixture was not cooled'),
        whatif: L('Карбонат давно израсходован. Газ — азот: соль диазония разлагается Ar–N₂⁺ + H₂O → Ar–OH + N₂↑ + H⁺, и каждая её молекула потеряна для сочетания.', 'Карбонат әлдеқашан жұмсалған. Газ — азот: диазоний тұзы Ar–N₂⁺ + H₂O → Ar–OH + N₂↑ + H⁺ бойынша ыдырайды, оның әр молекуласы азоқосылу үшін жоғалады.', 'The carbonate was used up long ago. The gas is nitrogen: the diazonium salt decomposes, Ar–N₂⁺ + H₂O → Ar–OH + N₂↑ + H⁺, and every molecule of it is lost to the coupling.'), effect() {} },
      { ok: false, severity: 'major', label: L('Слегка подогреть, чтобы осадок растворился', 'Тұнба еруі үшін сәл жылыту', 'Warm it a little so that the solid dissolves'), remark: L('суспензию соли диазония подогрели', 'диазоний тұзының суспензиясы жылытылды', 'the diazonium suspension was warmed'),
        whatif: L('Соль диазония разлагается тем быстрее, чем выше температура: подогрев превращает её в фенол и азот. Осадок и не должен растворяться — сочетание идёт в суспензии.', 'Диазоний тұзы температура жоғары болған сайын тез ыдырайды: жылыту оны фенол мен азотқа айналдырады. Тұнба ерімеуі керек — азоқосылу суспензияда жүреді.', 'The higher the temperature, the faster the diazonium salt decomposes: warming turns it into a phenol and nitrogen. The solid is not supposed to dissolve — the coupling takes place in suspension.'), effect(S) { S.dz.warm = true; S.T += 12; } },
    ],
  }],
  done(S, lc, ctx) {
    if (lc.hold >= 300 && S.T <= 5.05 && S.dz.inBath) {
      ctx.log(L(`Суспензия выдержана при 0–5 °C ${n(lc.hold / 60, 0)} мин: мелкий белый осадок внутренней соли диазония ⁻O₃S–C₆H₄–N₂⁺${S.dz.Tmax > 10 ? `; температура поднималась до ${n(S.dz.Tmax, 0)} °C, выделялся газ` : ''}`, `Суспензия 0–5 °C-та ${n(lc.hold / 60, 0)} мин ұсталды: ⁻O₃S–C₆H₄–N₂⁺ ішкі диазоний тұзының ұсақ ақ тұнбасы${S.dz.Tmax > 10 ? `; температура ${n(S.dz.Tmax, 0)} °C-қа дейін көтерілді, газ бөлінді` : ''}`, `Suspension held at 0–5 °C for ${n(lc.hold / 60, 0)} min: a fine white precipitate of the inner diazonium salt ⁻O₃S–C₆H₄–N₂⁺${S.dz.Tmax > 10 ? `; the temperature rose to ${n(S.dz.Tmax, 0)} °C and gas was given off` : ''}`), 'obs');
      return { text: L('Диазотирование закончено.', 'Диазоттау аяқталды.', 'Diazotization complete.') };
    }
    return false;
  },
  onLeave(S, ctx) { if (S.dz.Tmax > 10) ctx.remark({ key: 'dz-hot', severity: 'major', text: L(`диазотирование при температуре до ${n(S.dz.Tmax, 0)} °C — часть соли диазония разложилась`, `диазоттау ${n(S.dz.Tmax, 0)} °C-қа дейінгі температурада — диазоний тұзының бір бөлігі ыдырады`, `diazotization at up to ${n(S.dz.Tmax, 0)} °C — part of the diazonium salt decomposed`) }); },
  chart: { label: L('Температура смеси во времени', 'Қоспа температурасының уақытқа тәуелділігі', 'Mixture temperature over time'), value: (S) => S.T, min: -5, max: 30, band: [0, 5], limit: 5, every: 5, span: 600 },
  scene: (S, lc) => beakerScene({ cap: 100, vol: S.vTot || 36, color: WHITE, ppt: 0.7, pptColor: 'var(--solid)', T: S.T, tMin: -10, tMax: 40, mark: 5, rod: true, stir: lc.c && lc.c.stir, bath: S.dz.inBath ? 'ice' : null, gas: S.T > 9, label: L('стакан 100 мл', 'стақан 100 мл', '100 mL beaker') }),
  hints: [
    L('Соль диазония устойчива только при 0–5 °C. Где должен стоять стакан?', 'Диазоний тұзы тек 0–5 °C-та тұрақты. Стақан қайда тұруы керек?', 'The diazonium salt is stable only at 0–5 °C. Where should the beaker be?'),
    L('Поставьте стакан в ледяную баню и включите перемешивание; нагревать нельзя.', 'Стақанды мұз моншасына қойып, араластыруды қосыңыз; қыздыруға болмайды.', 'Put the beaker in the ice bath and switch on stirring; never warm it.'),
    L('«Поставить стакан в ледяную баню» → «Перемешивать» → дождитесь «Выдержка при 0–5 °C: 5 мин» (ускорьте ход времени ×30).', '«Стақанды мұз моншасына қою» → «Араластыру» → «0–5 °C-та ұстау: 5 мин» болғанша күтіңіз (уақытты ×30 жылдамдатыңыз).', '“Put the beaker in the ice bath” → “Stir” → wait for “Held at 0–5 °C: 5 min” (speed up time ×30).'),
  ],
};

/* ------------------------------------------------------------------ 9. иодкрахмальная бумага */
const s9 = {
  type: 'process', id: 'starch',
  title: L('Проба на избыток азотистой кислоты', 'Азотты қышқылдың артық мөлшеріне сынама', 'Test for excess nitrous acid'),
  instr: L('<ol><li>Нанесите каплю суспензии стеклянной палочкой на иодкрахмальную бумагу.</li><li>Немедленное синее окрашивание — есть небольшой избыток HNO₂, диазотирование полное.</li><li>Если бумага не синеет — добавьте немного раствора NaNO₂ и повторите пробу.</li></ol><p class="note">HNO₂ окисляет I⁻ до I₂, который с крахмалом даёт синюю окраску.</p>',
    '<ol><li>Суспензиядан шыны таяқшамен бір тамшыны иодкрахмал қағазына тамызыңыз.</li><li>Бірден көк түс — HNO₂ аздап артық, диазоттау толық.</li><li>Қағаз көгермесе — аздап NaNO₂ ерітіндісін қосып, сынаманы қайталаңыз.</li></ol><p class="note">HNO₂ I⁻-ны I₂-ге дейін тотықтырады, ол крахмалмен көк түс береді.</p>',
    '<ol><li>Put a drop of the suspension on starch–iodide paper with a glass rod.</li><li>An immediate blue colour means a slight excess of HNO₂ — diazotization is complete.</li><li>If the paper does not turn blue, add a little NaNO₂ solution and test again.</li></ol><p class="note">HNO₂ oxidises I⁻ to I₂, which gives a blue colour with starch.</p>'),
  need: L('Подтвердите избыток HNO₂', 'HNO₂ артық екенін растаңыз', 'Confirm an excess of HNO₂'),
  speeds: null,
  setup(S, lc) { lc.n = 0; lc.blue = null; },
  controls: [
    { kind: 'action', id: 'test', once: false, label: L('Капля смеси на иодкрахмальную бумагу', 'Қоспа тамшысын иодкрахмал қағазына', 'A drop of the mixture on starch–iodide paper'), advance: 20,
      do(S, lc, ctx) {
        lc.n++; S.dz.D += decompRate(S.T) * 20;
        lc.blue = S.dz.excess > 0.0002; lc.after = lc.added || 0;
        ctx.log(lc.blue ? L('Иодкрахмальная бумага сразу синеет — в смеси небольшой избыток HNO₂', 'Иодкрахмал қағазы бірден көгереді — қоспада HNO₂ аздап артық', 'The starch–iodide paper turns blue at once — a slight excess of HNO₂ is present')
          : L('Иодкрахмальная бумага не синеет — азотистой кислоты нет', 'Иодкрахмал қағазы көгермейді — азотты қышқыл жоқ', 'The starch–iodide paper does not turn blue — no nitrous acid is present'), 'obs');
        ctx.feedback(lc.blue ? null : L('Избытка HNO₂ нет: часть амина не продиазотирована. Добавьте раствор NaNO₂ и повторите пробу.', 'HNO₂ артық емес: аминнің бір бөлігі диазотталмаған. NaNO₂ ерітіндісін қосып, сынаманы қайталаңыз.', 'No excess HNO₂: some amine is not diazotized. Add NaNO₂ solution and test again.'), 'warn');
      } },
    { kind: 'action', id: 'nit', once: false, label: L('Добавить 0,5 мл раствора NaNO₂ и перемешать', '0,5 мл NaNO₂ ерітіндісін қосып, араластыру', 'Add 0.5 mL of NaNO₂ solution and stir'), advance: 60,
      do(S, lc, ctx) {
        if (lc.blue) ctx.remark({ key: 'nit-x', severity: 'minor', text: L('NaNO₂ добавлен при положительной пробе — лишний избыток HNO₂', 'оң сынамада NaNO₂ қосылды — HNO₂ артық мөлшері тым көп', 'NaNO₂ added although the test was positive — needless extra HNO₂') });
        S.dz.excess += 0.0007; lc.added = (lc.added || 0) + 1; lc.blue = null; S.dz.addedNit = (S.dz.addedNit || 0) + 1;
        ctx.log(L('Добавлено 0,5 мл раствора NaNO₂, смесь перемешана', '0,5 мл NaNO₂ ерітіндісі қосылып, қоспа араластырылды', '0.5 mL of NaNO₂ solution added and stirred'));
      } },
  ],
  readouts: (S, lc) => [
    { label: L('Проб', 'Сынама саны', 'Tests'), value: String(lc.n) },
    { label: L('Бумага', 'Қағаз', 'Paper'), value: lc.blue == null ? '—' : lc.blue ? L('синяя', 'көк', 'blue') : L('не синеет', 'көгермейді', 'no colour'), st: lc.blue ? 'ok' : lc.blue === false ? 'warn' : '' },
  ],
  done(S, lc) { return lc.blue === true && { text: L('Небольшой избыток HNO₂ есть — диазотирование полное.', 'HNO₂ аздап артық — диазоттау толық.', 'A slight excess of HNO₂ is present — diazotization is complete.') }; },
  onLeave(S) {
    // недостающий амин, продиазотированный добавленным нитритом
    if (S.dz.addedNit && S.dz.conv < 0.96) S.dz.conv = Math.min(0.96 * (0.7 + 0.3 * (S.dis ?? 1)), S.dz.conv + 0.04 * S.dz.addedNit);
  },
  scene: (S, lc) => beakerScene({ cap: 100, vol: S.vTot || 36, color: WHITE, ppt: 0.7, pptColor: 'var(--solid)', T: S.T, tMin: -10, tMax: 40, mark: 5, rod: true, bath: S.dz.inBath ? 'ice' : null, paper: lc.blue == null ? false : lc.blue, label: L('стакан 100 мл', 'стақан 100 мл', '100 mL beaker') }),
  hints: [
    L('Иодкрахмальная бумага синеет, если в смеси есть HNO₂ (окисляет иодид до иода).', 'Қоспада HNO₂ болса, иодкрахмал қағазы көгереді (иодидті иодқа дейін тотықтырады).', 'Starch–iodide paper turns blue if HNO₂ is present (it oxidises iodide to iodine).'),
    L('Синяя бумага — продолжайте; не синеет — добавьте немного NaNO₂ и проверьте снова. Лишний нитрит не добавляйте.', 'Қағаз көк — жалғастырыңыз; көгермесе — аздап NaNO₂ қосып, қайта тексеріңіз. Артық нитрит қоспаңыз.', 'Blue paper — carry on; no colour — add a little NaNO₂ and test again. Do not add nitrite you do not need.'),
    L('Нажмите «Капля смеси на иодкрахмальную бумагу». Если бумага синяя — «Далее».', '«Қоспа тамшысын иодкрахмал қағазына» басыңыз. Қағаз көк болса — «Әрі қарай».', 'Press “A drop of the mixture on starch–iodide paper”. If the paper is blue, press “Next”.'),
  ],
};

/* ------------------------------------------------------------------ 10. что делать с солью диазония */
const EXPLODE = {
  ru: 'Сухая соль диазония — взрывчатое вещество: при трении шпателем, ударе или лёгком нагреве она разлагается со взрывом. В реальной лаборатории так получают травмы рук и глаз осколками посуды. Соли диазония никогда не выделяют и не сушат: их хранят на холоду в растворе и сразу используют. Остатки суспензии разрушают нагреванием в вытяжном шкафу до прекращения выделения азота (раздел 7 методички). О происшествии сообщают преподавателю (п. 12.6). Синтез начинают заново с новой навески.',
  kk: 'Құрғақ диазоний тұзы — жарылғыш зат: шпательмен үйкегенде, соққанда немесе сәл қыздырғанда жарылыспен ыдырайды. Нақты зертханада осылай ыдыс сынықтарымен қол мен көз жарақаттанады. Диазоний тұздарын ешқашан бөліп алмайды және кептірмейді: оларды суықта ерітіндіде сақтап, бірден пайдаланады. Суспензия қалдықтарын тартпа шкафта азот бөлінуі тоқтағанша қыздырып жояды (әдістеменің 7-бөлімі). Оқиға туралы оқытушыға хабарлайды (12.6-тармақ). Синтезді жаңа өлшендіден қайта бастайды.',
  en: 'A dry diazonium salt is an explosive: rubbing with a spatula, a knock or gentle warming makes it decompose explosively. In a real lab this is how hands and eyes are injured by flying glass. Diazonium salts are never isolated or dried: they are kept cold in solution and used at once. Any leftover suspension is destroyed by warming in the fume hood until nitrogen evolution stops (manual, section 7). The incident is reported to the instructor (rule 12.6). The synthesis is restarted from a new sample.',
};

const s10 = {
  type: 'decide', id: 'keep',
  title: L('Суспензия соли диазония', 'Диазоний тұзының суспензиясы', 'The diazonium suspension'),
  instr: L('<p>Диазотирование закончено. Пока вы готовите раствор N,N-диметиланилина, суспензия ждёт. Что с ней сделать?</p>', '<p>Диазоттау аяқталды. N,N-диметиланилин ерітіндісін дайындап жатқанда суспензия күтіп тұрады. Онымен не істейсіз?</p>', '<p>The diazotization is over. The suspension has to wait while you prepare the N,N-dimethylaniline solution. What do you do with it?</p>'),
  need: L('Выберите действие', 'Әрекетті таңдаңыз', 'Choose an action'),
  question: L('Как поступить с солью диазония?', 'Диазоний тұзымен не істейсіз?', 'What do you do with the diazonium salt?'),
  options: [
    { id: 'cold', ok: true, label: L('Оставить в ледяной бане и сразу использовать для сочетания', 'Мұз моншасында қалдырып, бірден азоқосылуға пайдалану', 'Leave it in the ice bath and use it straight away for the coupling'), advance: 60,
      effect(S) { S.dz.D += decompRate(2) * 300; }, why: L('соль диазония устойчива только на холоду и в растворе (суспензии)', 'диазоний тұзы тек суықта және ерітіндіде (суспензияда) тұрақты', 'the diazonium salt is stable only cold and in solution (suspension)') },
    { id: 'dry', ok: false, label: L('Отфильтровать белый осадок и высушить, чтобы взвесить', 'Ақ тұнбаны сүзіп, өлшеу үшін кептіру', 'Filter off the white solid and dry it to weigh it'),
      remark: L('соль диазония выделена и высушена — сухая соль разложилась со взрывом', 'диазоний тұзы бөлініп, кептірілді — құрғақ тұз жарылыспен ыдырады', 'the diazonium salt was isolated and dried — the dry salt decomposed explosively'),
      critical: { text: EXPLODE } },
    { id: 'bench', ok: false, severity: 'major', label: L('Поставить на стол при комнатной температуре на 20 минут', 'Бөлме температурасында 20 минутқа үстелге қою', 'Put it on the bench at room temperature for 20 minutes'), advance: 1200,
      remark: L('суспензия соли диазония 20 мин стояла при комнатной температуре — частичное разложение', 'диазоний тұзының суспензиясы бөлме температурасында 20 мин тұрды — ішінара ыдырау', 'the diazonium suspension stood at room temperature for 20 min — partial decomposition'),
      whatif: L('При 20–22 °C соль диазония разлагается в десятки раз быстрее, чем при 0–5 °C: за 20 минут теряется заметная часть, в смеси появляется фенол, продукт темнеет.', '20–22 °C-та диазоний тұзы 0–5 °C-қа қарағанда ондаған есе тез ыдырайды: 20 минутта едәуір бөлігі жоғалады, қоспада фенол пайда болады, өнім қараяды.', 'At 20–22 °C the diazonium salt decomposes tens of times faster than at 0–5 °C: in 20 minutes a noticeable part is lost, phenol appears in the mixture and the product darkens.'),
      effect(S) { S.dz.D += decompRate(19) * 1200; S.dz.inBath = false; S.T = 19; S.dz.Tmax = Math.max(S.dz.Tmax, 19); } },
    { id: 'warm', ok: false, severity: 'major', label: L('Слегка подогреть до растворения осадка', 'Тұнба ерігенше сәл жылыту', 'Warm it gently until the solid dissolves'), advance: 300,
      remark: L('суспензию соли диазония подогревали — значительное разложение с выделением азота', 'диазоний тұзының суспензиясы жылытылды — азот бөле едәуір ыдырау', 'the diazonium suspension was warmed — extensive decomposition with evolution of nitrogen'),
      whatif: L('При 35–40 °C соль диазония за несколько минут в основном разлагается до фенола и N₂. Осадок «исчезает» не потому, что растворился, а потому, что его больше нет.', '35–40 °C-та диазоний тұзы бірнеше минутта негізінен фенол мен N₂-ге ыдырайды. Тұнба еріп кеткендіктен емес, енді жоқ болғандықтан «жоғалады».', 'At 35–40 °C the diazonium salt mostly decomposes to the phenol and N₂ within minutes. The solid “disappears” not because it dissolved but because it is gone.'),
      effect(S) { S.dz.D += decompRate(38) * 300; S.dz.warm = true; S.T = 30; S.dz.Tmax = Math.max(S.dz.Tmax, 38); S.dz.inBath = false; },
      obs: L('При подогревании осадок исчезает, обильно выделяется газ (N₂), запах фенола', 'Жылытқанда тұнба жоғалады, газ (N₂) мол бөлінеді, фенол иісі', 'On warming the solid disappears, gas (N₂) is evolved freely and there is a smell of phenol') },
  ],
  scene: (S) => beakerScene({ cap: 100, vol: S.vTot || 36, color: WHITE, ppt: 0.7, pptColor: 'var(--solid)', T: S.T, tMin: -10, tMax: 40, mark: 5, rod: true, bath: S.dz.inBath ? 'ice' : null, label: L('стакан 100 мл', 'стақан 100 мл', '100 mL beaker') }),
};

/* ------------------------------------------------------------------ 11. работа с диметиланилином (ТБ) */
const s11 = {
  type: 'decide', id: 'dma-safe',
  title: L('Как отмерить N,N-диметиланилин', 'N,N-диметиланилинді қалай өлшейді', 'How to measure the N,N-dimethylaniline'),
  instr: L('<p>N,N-Диметиланилин токсичен при вдыхании, проглатывании и попадании на кожу (вызывает метгемоглобинемию) и подозревается в канцерогенности (раздел 7 методички).</p>', '<p>N,N-Диметиланилин буын жұтқанда, ішке түскенде және теріге тигенде улы (метгемоглобинемия тудырады), канцерогенділігіне күдік бар (әдістеменің 7-бөлімі).</p>', '<p>N,N-Dimethylaniline is toxic by inhalation, ingestion and skin contact (it causes methaemoglobinaemia) and is suspected of causing cancer (manual, section 7).</p>'),
  need: L('Выберите правильный способ', 'Дұрыс тәсілді таңдаңыз', 'Choose the right way'),
  question: L('Как вы будете отмерять 1,3 мл диметиланилина?', '1,3 мл диметиланилинді қалай өлшейсіз?', 'How will you measure 1.3 mL of dimethylaniline?'),
  options: [
    { id: 'ok', ok: true, label: L('В вытяжном шкафу, в перчатках, градуированной пипеткой с грушей', 'Тартпа шкафта, қолғаппен, алмұрты бар бөлікті пипеткамен', 'In the fume hood, wearing gloves, with a graduated pipette and a pipette bulb'), log: L('Диметиланилин отмеряют в вытяжном шкафу, в перчатках, пипеткой с грушей', 'Диметиланилинді тартпа шкафта, қолғаппен, алмұрты бар пипеткамен өлшейді', 'Dimethylaniline is measured in the fume hood, wearing gloves, with a pipette and bulb'),
      why: L('пп. 3.3, 4.6 и 6.2 правил ТБ; раздел 7 методички', 'ҚТ ережелерінің 3.3, 4.6 және 6.2-тармақтары; әдістеменің 7-бөлімі', 'safety rules 3.3, 4.6 and 6.2; manual, section 7') },
    { id: 'bench', ok: false, severity: 'safety', retry: true, label: L('На лабораторном столе — его всего 1,3 мл', 'Зертхана үстелінде — оның бар болғаны 1,3 мл', 'On the open bench — it is only 1.3 mL'),
      remark: L('ароматический амин отмеряли вне вытяжного шкафа (пп. 4.4, 4.6 правил ТБ)', 'ароматты амин тартпа шкафтан тыс өлшенді (ҚТ ережелерінің 4.4, 4.6-тармақтары)', 'an aromatic amine was measured outside the fume hood (safety rules 4.4, 4.6)'),
      whatif: L('Пары диметиланилина токсичны даже в малом количестве; ароматические амины используют только под тягой.', 'Диметиланилин булары аз мөлшерде де улы; ароматты аминдер тек тартым астында қолданылады.', 'Dimethylaniline vapour is toxic even in small amounts; aromatic amines are used only under the hood.') },
    { id: 'mouth', ok: false, severity: 'safety', retry: true, label: L('Набрать пипеткой ртом — так точнее', 'Пипеткаға аузымен тарту — дәлірек болады', 'Draw it up by mouth — it is more precise'),
      remark: L('попытка набрать токсичный реактив в пипетку ртом (п. 6.2 правил ТБ)', 'улы реактивті пипеткаға аузымен тарту әрекеті (ҚТ ережелерінің 6.2-тармағы)', 'tried to pipette a toxic reagent by mouth (safety rule 6.2)'),
      whatif: L('Набор ртом запрещён: пары попадают в дыхательные пути, а жидкость — в рот. Только груша или дозатор.', 'Аузымен тартуға тыйым салынған: булар тыныс жолдарына, ал сұйықтық ауызға түседі. Тек алмұрт немесе дозатор.', 'Mouth pipetting is forbidden: the vapour goes into your airways and the liquid into your mouth. Only a bulb or a dispenser.') },
    { id: 'gl', ok: false, severity: 'safety', retry: true, label: L('Снять перчатки, чтобы пипетка не скользила', 'Пипетка тайғанамауы үшін қолғапты шешу', 'Take off the gloves so the pipette does not slip'),
      remark: L('работа с диметиланилином без перчаток (пп. 3.3, 4.6 правил ТБ)', 'диметиланилинмен қолғапсыз жұмыс (ҚТ ережелерінің 3.3, 4.6-тармақтары)', 'handling dimethylaniline without gloves (safety rules 3.3, 4.6)'),
      whatif: L('Диметиланилин быстро всасывается через кожу и вызывает метгемоглобинемию (синюшность, головная боль). Перчатки не снимают.', 'Диметиланилин тері арқылы тез сіңіп, метгемоглобинемия тудырады (көгеру, бас ауруы). Қолғапты шешпейді.', 'Dimethylaniline is quickly absorbed through the skin and causes methaemoglobinaemia (cyanosis, headache). Keep your gloves on.') },
  ],
  scene: hoodScene,
};

/* ------------------------------------------------------------------ 12. диметиланилин + уксусная кислота */
const s12 = {
  type: 'measure', id: 'dma',
  title: L('Раствор N,N-диметиланилина', 'N,N-диметиланилин ерітіндісі', 'The N,N-dimethylaniline solution'),
  instr: L('<ol><li>В вытяжном шкафу отмерьте пипеткой <b>1,3 мл (1,21 г, 10 ммоль)</b> N,N-диметиланилина в пробирку.</li><li>Прилейте <b>1 мл</b> ледяной уксусной кислоты и перемешайте.</li></ol>',
    '<ol><li>Тартпа шкафта пипеткамен пробиркаға <b>1,3 мл (1,21 г, 10 ммоль)</b> N,N-диметиланилин өлшеңіз.</li><li><b>1 мл</b> мұзды сірке қышқылын қосып, араластырыңыз.</li></ol>',
    '<ol><li>In the fume hood, pipette <b>1.3 mL (1.21 g, 10 mmol)</b> of N,N-dimethylaniline into a test tube.</li><li>Add <b>1 mL</b> of glacial acetic acid and mix.</li></ol>'),
  need: L('Приготовьте раствор ДМА в уксусной кислоте', 'ДМА-ның сірке қышқылындағы ерітіндісін дайындаңыз', 'Prepare the DMA solution in acetic acid'),
  measure: 'pipette-5', reagent: L('C₆H₅N(CH₃)₂', 'C₆H₅N(CH₃)₂', 'C₆H₅N(CH₃)₂'), bottleSub: L('ДМА', 'ДМА', 'DMA'), target: 1.3, tol: 0.1, onDeviation: 'consequence', saveAs: 'vDMA',
  into: L('пробирка', 'пробирка', 'the test tube'),
  then: [
    { id: 'acoh', label: L('Прилить 1 мл ледяной CH₃COOH', '1 мл мұзды CH₃COOH құю', 'Add 1 mL of glacial CH₃COOH'), advance: 30, do(S) { S.vAcOH = 1; }, log: L('К диметиланилину прилит 1 мл ледяной уксусной кислоты', 'Диметиланилинге 1 мл мұзды сірке қышқылы құйылды', '1 mL of glacial acetic acid added to the dimethylaniline') },
    { id: 'mix', label: L('Перемешать', 'Араластыру', 'Mix'), requires: ['acoh'], advance: 20, obs: L('Диметиланилин растворился в уксусной кислоте — прозрачный бледно-жёлтый раствор, характерный запах амина', 'Диметиланилин сірке қышқылында еріді — мөлдір ақшыл сары ерітінді, аминнің тән иісі', 'The dimethylaniline dissolved in the acetic acid — a clear pale yellow solution with the typical amine smell') },
  ],
  sceneExtra: dmaTubeExtra,
};

/* ------------------------------------------------------------------ 13. среда для сочетания */
const s13 = {
  type: 'decide', id: 'medium',
  title: L('Среда для азосочетания', 'Азоқосылуға арналған орта', 'The medium for the coupling'),
  instr: L('<p>Ароматические амины сочетаются в слабокислой среде (pH 4–7), фенолы — в слабощелочной (pH 8–10). В сильнокислой среде амин протонирован, в сильнощелочной соль диазония переходит в неактивный диазотат Ar–N=N–O⁻.</p>', '<p>Ароматты аминдер әлсіз қышқыл ортада (pH 4–7), фенолдар — әлсіз сілтілі ортада (pH 8–10) қосылады. Күшті қышқыл ортада амин протондалған, күшті сілтілі ортада диазоний тұзы белсенді емес Ar–N=N–O⁻ диазотатқа айналады.</p>', '<p>Aromatic amines couple in weakly acidic solution (pH 4–7) and phenols in weakly alkaline solution (pH 8–10). In strong acid the amine is protonated; in strong alkali the diazonium ion is converted into the unreactive diazotate Ar–N=N–O⁻.</p>'),
  need: L('Выберите условия сочетания', 'Азоқосылу жағдайын таңдаңыз', 'Choose the coupling conditions'),
  question: L('Как ввести диметиланилин в реакцию?', 'Диметиланилинді реакцияға қалай енгізесіз?', 'How do you bring in the dimethylaniline?'),
  options: [
    { id: 'ok', ok: true, label: L('Прилить раствор ДМА в уксусной кислоте прямо к холодной суспензии соли диазония', 'ДМА-ның сірке қышқылындағы ерітіндісін диазоний тұзының суық суспензиясына тікелей құю', 'Add the DMA solution in acetic acid straight to the cold diazonium suspension'),
      effect(S) { S.cp.medium = 'acid'; }, why: L('ацетатный буфер даёт слабокислую среду, в которой амин частично свободен, а диазоний устойчив', 'ацетат буфері әлсіз қышқыл орта береді, онда амин ішінара бос, ал диазоний тұрақты', 'the acetate buffer gives a weakly acidic medium where some amine is free and the diazonium ion is stable') },
    { id: 'alk', ok: false, severity: 'major', label: L('Сначала подщелочить суспензию NaOH до pH 10, затем прилить ДМА', 'Алдымен суспензияны NaOH-пен pH 10-ға дейін сілтілеу, содан кейін ДМА құю', 'First make the suspension alkaline with NaOH to pH 10, then add the DMA'),
      remark: L('сочетание с амином начато в щелочной среде — соль диазония перешла в диазотат', 'аминмен азоқосылу сілтілі ортада басталды — диазоний тұзы диазотатқа айналды', 'coupling with the amine started in alkaline medium — the diazonium salt was converted into the diazotate'),
      whatif: L('В щелочи Ar–N₂⁺ + 2OH⁻ → Ar–N=N–O⁻ + H₂O: диазотат не является электрофилом, и с диметиланилином почти ничего не сочетается. Щёлочь прибавляют только после сочетания — чтобы перевести краситель в натриевую соль.', 'Сілтіде Ar–N₂⁺ + 2OH⁻ → Ar–N=N–O⁻ + H₂O: диазотат электрофил емес, диметиланилинмен іс жүзінде ештеңе қосылмайды. Сілтіні тек азоқосылудан кейін — бояғышты натрий тұзына айналдыру үшін қосады.', 'In alkali Ar–N₂⁺ + 2OH⁻ → Ar–N=N–O⁻ + H₂O: the diazotate is not an electrophile and hardly anything couples with the dimethylaniline. Alkali is added only after the coupling, to convert the dye into its sodium salt.'),
      effect(S) { S.cp.medium = 'alk'; S.alk.pre = 24; } },
    { id: 'strong', ok: false, severity: 'major', label: L('Добавить ещё 5 мл конц. HCl — в сильнокислой среде надёжнее', 'Тағы 5 мл конц. HCl қосу — күшті қышқыл ортада сенімдірек', 'Add another 5 mL of conc. HCl — strongly acidic is safer'),
      remark: L('сочетание в сильнокислой среде — амин протонирован, реакция почти не идёт', 'азоқосылу күшті қышқыл ортада — амин протондалған, реакция іс жүзінде жүрмейді', 'coupling in strongly acidic medium — the amine is protonated and the reaction barely goes'),
      whatif: L('В сильной кислоте почти весь диметиланилин находится в виде катиона C₆H₅NH(CH₃)₂⁺; группа –NHR₂⁺ дезактивирует кольцо, и слабый электрофил ArN₂⁺ с ним не реагирует.', 'Күшті қышқылда диметиланилиннің барлығы дерлік C₆H₅NH(CH₃)₂⁺ катионы түрінде болады; –NHR₂⁺ тобы сақинаны пассивтендіреді, әлсіз ArN₂⁺ электрофилі онымен әрекеттеспейді.', 'In strong acid almost all the dimethylaniline is present as the cation C₆H₅NH(CH₃)₂⁺; the –NHR₂⁺ group deactivates the ring and the weak electrophile ArN₂⁺ does not react with it.'),
      effect(S) { S.cp.medium = 'strong'; S.vHCl += 5; } },
  ],
  scene: (S) => beakerScene({ cap: 100, vol: S.vTot || 36, color: WHITE, ppt: 0.7, pptColor: 'var(--solid)', T: S.T, tMin: -10, tMax: 40, mark: 5, rod: true, bath: S.dz.inBath ? 'ice' : null, label: L('стакан 100 мл', 'стақан 100 мл', '100 mL beaker') }),
};

/* ------------------------------------------------------------------ 14. азосочетание */
const s14 = {
  type: 'process', id: 'couple',
  title: L('Азосочетание', 'Азоқосылу', 'Azo coupling'),
  instr: L('<ol><li>При <b>энергичном перемешивании</b> прилейте раствор диметиланилина к холодной суспензии соли диазония — появляется красная окраска (кислотная форма красителя).</li><li>Выдержите смесь в ледяной бане <b>10 минут</b>, время от времени перемешивая.</li></ol>',
    '<ol><li><b>Қатты араластыра отырып</b> диметиланилин ерітіндісін диазоний тұзының суық суспензиясына құйыңыз — қызыл түс пайда болады (бояғыштың қышқылдық түрі).</li><li>Қоспаны мұз моншасында мезгіл-мезгіл араластыра отырып <b>10 минут</b> ұстаңыз.</li></ol>',
    '<ol><li>With <b>vigorous stirring</b>, add the dimethylaniline solution to the cold diazonium suspension — a red colour develops (the acid form of the dye).</li><li>Keep the mixture in the ice bath for <b>10 minutes</b>, stirring from time to time.</li></ol>'),
  need: L('Прилейте ДМА и выдержите 10 мин', 'ДМА құйып, 10 мин ұстаңыз', 'Add the DMA and hold for 10 min'),
  speeds: [5, 10, 30],
  setup(S, lc) { lc.Tb = S.dz.inBath ? 1 : 22; },
  controls: [
    { kind: 'toggle', id: 'stir', group: L('Стакан', 'Стақан', 'Beaker'), label: L('Энергично перемешивать', 'Қатты араластыру', 'Stir vigorously'), labelOn: L('Перемешивание: вкл.', 'Араластыру: қосулы', 'Stirring: on') },
    { kind: 'action', id: 'bath', group: L('Стакан', 'Стақан', 'Beaker'), label: L('Поставить в ледяную баню', 'Мұз моншасына қою', 'Put in the ice bath'), advance: 20, disabled: (S) => !!S.dz.inBath, do(S, lc) { S.dz.inBath = true; lc.Tb = 1; }, log: L('Стакан поставлен в ледяную баню', 'Стақан мұз моншасына қойылды', 'Beaker placed in the ice bath') },
    { kind: 'action', id: 'pour', cls: 'pri', group: L('Сочетание', 'Азоқосылу', 'Coupling'), label: L('Прилить раствор диметиланилина', 'Диметиланилин ерітіндісін құю', 'Add the dimethylaniline solution'), advance: 30,
      do(S, lc, ctx) {
        S.cp.added = true; S.cp.stirred = !!lc.c.stir; S.T += 2.5;
        S.vTot = (S.vTot || 36) + (S.vDMA || 1.3) + (S.vAcOH || 1);
        if (!lc.c.stir) ctx.remark({ key: 'cp-stir', severity: 'minor', text: L('диметиланилин прилит без перемешивания — комки, часть амина не прореагировала', 'диметиланилин араластырылмай құйылды — кесектер, аминнің бір бөлігі әрекеттеспеді', 'dimethylaniline added without stirring — lumps; part of the amine did not react') });
        if (!S.dz.inBath) ctx.remark({ key: 'cp-bath', severity: 'minor', text: L('сочетание начато вне ледяной бани', 'азоқосылу мұз моншасынан тыс басталды', 'coupling started outside the ice bath') });
        const red = S.cp.medium !== 'alk';
        ctx.log(red ? L('Раствор диметиланилина прилит к суспензии: сразу появляется красная окраска (кислотная форма красителя)', 'Диметиланилин ерітіндісі суспензияға құйылды: бірден қызыл түс пайда болады (бояғыштың қышқылдық түрі)', 'Dimethylaniline solution added to the suspension: a red colour appears at once (the acid form of the dye)')
          : L('Раствор диметиланилина прилит к щелочной смеси: окраска лишь слабо-жёлтая, на поверхности маслянистые капли амина', 'Диметиланилин ерітіндісі сілтілі қоспаға құйылды: түсі тек әлсіз сары, бетінде аминнің майлы тамшылары', 'Dimethylaniline solution added to the alkaline mixture: only a faint yellow colour; oily droplets of the amine on the surface'), 'obs');
      } },
  ],
  tick(S, lc, dt) {
    S.T = relax(S.T, S.dz.inBath ? lc.Tb : 22, S.dz.inBath ? (lc.c.stir ? 0.012 : 0.006) : 0.0012, dt);
    if (S.dz.inBath) lc.Tb = Math.min(4, lc.Tb + 0.0006 * dt);
    S.dz.Tmax = Math.max(S.dz.Tmax, S.T);
    if (!S.cp.added) S.dz.D += decompRate(S.T) * dt;
    else {
      S.cp.time += dt;
      S.dz.D += decompRate(S.T) * dt * Math.max(0, 1 - S.cp.time / 120) * 0.5;
    }
  },
  readouts: (S) => [
    { label: L('Смесь', 'Қоспа', 'Mixture'), value: n(S.T, 1) + ' °C', st: S.T > 10 ? 'bad' : S.T > 5.05 ? 'warn' : 'ok' },
    { label: L('Время сочетания', 'Азоқосылу уақыты', 'Coupling time'), value: S.cp.added ? mins(S.cp.time) : '—', st: S.cp.time >= 600 ? 'ok' : '' },
    { label: L('Окраска', 'Түсі', 'Colour'), value: !S.cp.added ? L('белая суспензия', 'ақ суспензия', 'white suspension') : S.cp.medium === 'alk' ? L('бледно-жёлтая', 'ақшыл сары', 'pale yellow') : L('красная', 'қызыл', 'red') },
  ],
  alerts(S) {
    if (S.T > 10) return { text: L('Смесь нагрелась выше 10 °C. Поставьте стакан в ледяную баню.', 'Қоспа 10 °C-тан жоғары қызды. Стақанды мұз моншасына қойыңыз.', 'The mixture has warmed above 10 °C. Put the beaker in the ice bath.'), kind: 'warn' };
    return null;
  },
  events: [{
    id: 'thick', when: (S) => S.cp.added && S.cp.time > 150,
    title: L('Смесь загустела', 'Қоспа қоюланды', 'The mixture has thickened'),
    text: L('Выделяется красный осадок кислотной формы красителя, смесь превращается в густую пасту, перемешивать палочкой трудно. Что вы сделаете?', 'Бояғыштың қышқылдық түрінің қызыл тұнбасы бөлінуде, қоспа қою пастаға айналады, таяқшамен араластыру қиын. Не істейсіз?', 'The red acid form of the dye is coming out of solution; the mixture is turning into a thick paste that is hard to stir with the rod. What do you do?'),
    options: [
      { ok: true, label: L('Продолжать перемешивать палочкой, не вынимая стакан из бани', 'Стақанды моншадан алмай, таяқшамен араластыруды жалғастыру', 'Keep stirring with the rod without taking the beaker out of the bath'), effect(S, lc) { lc.c.stir = true; }, log: L('Густая красная паста перемешивается в ледяной бане', 'Қою қызыл паста мұз моншасында араластырылуда', 'The thick red paste is stirred in the ice bath') },
      { ok: false, severity: 'minor', label: L('Разбавить смесь 20 мл воды', 'Қоспаны 20 мл сумен сұйылту', 'Dilute the mixture with 20 mL of water'), remark: L('смесь разбавлена лишней водой — больше красителя останется в маточном растворе', 'қоспа артық сумен сұйылтылды — аналық ерітіндіде бояғыш көбірек қалады', 'the mixture was diluted with extra water — more dye will stay in the mother liquor'),
        whatif: L('Методичка не предусматривает разбавления: каждые лишние миллилитры воды растворяют часть красителя, и при фильтровании он уйдёт с фильтратом.', 'Әдістемеде сұйылту қарастырылмаған: әр артық миллилитр су бояғыштың бір бөлігін ерітеді, сүзгенде ол фильтратпен кетеді.', 'The manual does not call for dilution: every extra millilitre of water dissolves some dye, which will leave with the filtrate.'), effect(S) { S.vTot += 20; S.T += 3; } },
      { ok: false, severity: 'major', label: L('Вынуть стакан из бани — так удобнее мешать', 'Стақанды моншадан алу — араластыру ыңғайлырақ', 'Take the beaker out of the bath — it is easier to stir'), remark: L('стакан вынут из ледяной бани во время сочетания', 'азоқосылу кезінде стақан мұз моншасынан алынды', 'beaker taken out of the ice bath during the coupling'),
        whatif: L('Пока сочетание не закончилось, в смеси ещё есть соль диазония; вне бани смесь нагревается, и соль разлагается.', 'Азоқосылу аяқталмайынша, қоспада әлі де диазоний тұзы бар; моншадан тыс қоспа қызып, тұз ыдырайды.', 'Until the coupling is over there is still diazonium salt in the mixture; out of the bath the mixture warms up and the salt decomposes.'), effect(S) { S.dz.inBath = false; } },
    ],
  }],
  done(S, lc, ctx) {
    if (S.cp.added && S.cp.time >= 600) {
      S.cp.nDye = coupled(S);
      ctx.log(S.cp.medium === 'alk' ? L('После 10 мин: смесь бледно-жёлтая, красного осадка почти нет', '10 минуттан кейін: қоспа ақшыл сары, қызыл тұнба жоқтың қасы', 'After 10 min: the mixture is pale yellow with hardly any red solid')
        : L('После 10 мин в ледяной бане: густая красная суспензия кислотной формы метилового оранжевого', 'Мұз моншасында 10 минуттан кейін: метилоранждың қышқылдық түрінің қою қызыл суспензиясы', 'After 10 min in the ice bath: a thick red suspension of the acid form of methyl orange'), 'obs');
      return { text: L('Сочетание закончено.', 'Азоқосылу аяқталды.', 'Coupling complete.') };
    }
    return false;
  },
  onLeave(S) { S.cp.nDye = coupled(S); },
  scene: (S, lc) => beakerScene({ cap: 100, vol: S.vTot || 36, color: S.cp.added ? (S.cp.medium === 'alk' ? 'rgba(240,210,110,.55)' : RED) : WHITE, ppt: 0.75, pptColor: S.cp.added && S.cp.medium !== 'alk' ? '#9c1830' : 'var(--solid)', T: S.T, tMin: -10, tMax: 40, mark: 5, rod: true, stir: lc.c && lc.c.stir, bath: S.dz.inBath ? 'ice' : null, label: L('стакан 100 мл', 'стақан 100 мл', '100 mL beaker') }),
  hints: [
    L('Электрофил слабый — нужен хороший контакт фаз: перемешивайте энергично и держите смесь холодной.', 'Электрофил әлсіз — фазалардың жақсы жанасуы қажет: қатты араластырып, қоспаны суық ұстаңыз.', 'The electrophile is weak — good mixing is needed: stir vigorously and keep the mixture cold.'),
    L('Сначала включите перемешивание, потом прилейте раствор ДМА. Стакан — в ледяной бане все 10 минут.', 'Алдымен араластыруды қосып, содан кейін ДМА ерітіндісін құйыңыз. Стақан — 10 минут бойы мұз моншасында.', 'Switch on stirring first, then add the DMA solution. The beaker stays in the ice bath for all 10 minutes.'),
    L('«Энергично перемешивать» → «Прилить раствор диметиланилина» → ход времени ×30 до «Время сочетания: 10 мин».', '«Қатты араластыру» → «Диметиланилин ерітіндісін құю» → «Азоқосылу уақыты: 10 мин» болғанша уақыт ×30.', '“Stir vigorously” → “Add the dimethylaniline solution” → time ×30 until “Coupling time: 10 min”.'),
  ],
};

/* ------------------------------------------------------------------ 15. вопросы преподавателя */
const s15 = {
  type: 'quiz', id: 'q-couple',
  title: L('Вопросы преподавателя', 'Оқытушының сұрақтары', 'The instructor’s questions'),
  instr: L('<p>Пока смесь стоит в бане, ответьте на вопросы преподавателя. Каждая ошибка записывается в журнал.</p>', '<p>Қоспа моншада тұрғанда, оқытушының сұрақтарына жауап беріңіз. Әр қате журналға жазылады.</p>', '<p>While the mixture stands in the bath, answer the instructor’s questions. Every wrong answer is recorded in the notebook.</p>'),
  need: L('Ответьте на все вопросы', 'Барлық сұраққа жауап беріңіз', 'Answer all the questions'),
  questions: [
    { q: L('В какое положение N,N-диметиланилина вступает азогруппа?', 'Азотоп N,N-диметиланилиннің қай жағдайына енеді?', 'Which position of N,N-dimethylaniline does the azo group enter?'),
      options: [L('В пара-положение к группе –N(CH₃)₂', '–N(CH₃)₂ тобына қатысты пара-жағдайға', 'Para to the –N(CH₃)₂ group'), L('В мета-положение', 'Мета-жағдайға', 'The meta position'), L('К атому азота аминогруппы', 'Аминотоптың азот атомына', 'Onto the nitrogen atom of the amino group'), L('В орто-положение, потому что оно ближе', 'Орто-жағдайға, себебі ол жақынырақ', 'The ortho position, because it is closer')],
      correct: 0, why: L('–N(CH₃)₂ — сильный активирующий орто/пара-ориентант; пара-положение свободно и стерически доступно, поэтому сочетание идёт в пара-положение (в орто — только если пара занято).', '–N(CH₃)₂ — күшті белсендіретін орто/пара-бағдарлағыш; пара-жағдай бос және стерикалық тұрғыдан қолжетімді, сондықтан азоқосылу пара-жағдайға жүреді (орто-жағдайға — тек пара бос болмаса).', '–N(CH₃)₂ is a strong activating ortho/para director; the para position is free and sterically accessible, so coupling goes para (ortho only if para is occupied).') },
    { q: L('Почему катион арендиазония — слабый электрофил?', 'Арендиазоний катионы неліктен әлсіз электрофил?', 'Why is the arenediazonium ion a weak electrophile?'),
      options: [L('Положительный заряд делокализован по ароматическому кольцу', 'Оң заряд ароматты сақина бойынша делокализацияланған', 'Its positive charge is delocalised over the aromatic ring'), L('У него нет положительного заряда', 'Онда оң заряд жоқ', 'It has no positive charge'), L('Он легко отдаёт протон', 'Ол протонды оңай береді', 'It readily gives up a proton'), L('Он нерастворим в воде', 'Ол суда ерімейді', 'It is insoluble in water')],
      correct: 0, why: L('Сопряжение с кольцом рассредоточивает заряд, поэтому ArN₂⁺ реагирует только с сильно активированными кольцами — фенолятами и ароматическими аминами.', 'Сақинамен түйіндесу зарядты таратады, сондықтан ArN₂⁺ тек қатты белсендірілген сақиналармен — феноляттармен және ароматты аминдермен әрекеттеседі.', 'Conjugation with the ring spreads out the charge, so ArN₂⁺ reacts only with strongly activated rings — phenoxides and aromatic amines.') },
  ],
};

/* ------------------------------------------------------------------ 16. подщелачивание */
function alkUpdate(S) {
  const inv = { ...acidInventory(S), naoh: naohMmol(S.alk.V) + (S.alk.pre || 0) };
  S.alk.pH = mixPH(inv, S.vTot + S.alk.V);
  return S.alk.pH;
}

const s16 = {
  type: 'add', id: 'alk',
  title: L('Подщелачивание: 10 % NaOH', 'Сілтілеу: 10 % NaOH', 'Making alkaline: 10 % NaOH'),
  instr: L('<ol><li>Медленно, при перемешивании прибавляйте <b>12–15 мл</b> 10 % NaOH до щелочной реакции — проверяйте <b>индикаторной бумагой</b>.</li><li>Окраска переходит в оранжевую, начинает выделяться натриевая соль метилового оранжевого.</li></ol><p class="note">Нейтрализация экзотермична. Раствор NaOH едкий.</p>',
    '<ol><li>Араластыра отырып, сілтілі реакцияға дейін <b>12–15 мл</b> 10 % NaOH баяу қосыңыз — <b>индикатор қағазымен</b> тексеріңіз.</li><li>Түсі қызғылт сарыға ауысады, метилоранждың натрий тұзы бөліне бастайды.</li></ol><p class="note">Бейтараптау экзотермиялық. NaOH ерітіндісі күйдіргіш.</p>',
    '<ol><li>Slowly, with stirring, add <b>12–15 mL</b> of 10 % NaOH until the mixture is alkaline — check with <b>indicator paper</b>.</li><li>The colour changes to orange and the sodium salt of methyl orange begins to separate.</li></ol><p class="note">Neutralisation is exothermic. NaOH solution is caustic.</p>'),
  need: L('Доведите смесь до щелочной реакции', 'Қоспаны сілтілі реакцияға жеткізіңіз', 'Make the mixture alkaline'),
  speeds: [5, 10],
  setup(S, lc) { S.alk = S.alk || { V: 0, pH: 1 }; alkUpdate(S); lc.paper = null; },
  add: {
    label: L('NaOH +1 мл', 'NaOH +1 мл', 'NaOH +1 mL'), total: 40, big: true,
    group: L('10 % NaOH из цилиндра · порциями по 1 мл', 'Цилиндрден 10 % NaOH · 1 мл-ден', '10 % NaOH from a cylinder · 1 mL portions'),
    rhythms: [[0, L('вручную', 'қолмен', 'by hand')], [30, L('30 с', '30 с', '30 s')], [10, L('10 с', '10 с', '10 s')]],
    onAdd(S, lc, ctx) {
      S.alk.V += 1; lc.fresh = false;
      S.T += 0.8;
      const now = ctx.now();
      if (lc.last != null && now - lc.last < 15 && !lc.c.stir) ctx.remark({ key: 'alk-fast', severity: 'minor', text: L('щёлочь прибавляли быстро и без перемешивания — местный перегрев и комки', 'сілті тез және араластырмай қосылды — жергілікті қызу және кесектер', 'alkali added quickly without stirring — local heating and lumps') });
      lc.last = now;
      const before = acidFraction(S.alk.pH);
      alkUpdate(S);
      const after = acidFraction(S.alk.pH);
      if (before > 0.5 && after <= 0.5) ctx.log(L(`После ${S.alk.V} мл NaOH окраска смеси переходит из красной в оранжевую`, `${S.alk.V} мл NaOH-тан кейін қоспа түсі қызылдан қызғылт сарыға ауысады`, `After ${S.alk.V} mL of NaOH the colour of the mixture changes from red to orange`), 'obs');
    },
  },
  controls: [
    { kind: 'toggle', id: 'stir', group: L('Стакан', 'Стақан', 'Beaker'), label: L('Перемешивать', 'Араластыру', 'Stir'), labelOn: L('Перемешивание: вкл.', 'Араластыру: қосулы', 'Stirring: on') },
    { kind: 'action', id: 'paper', once: false, group: L('Стакан', 'Стақан', 'Beaker'), label: L('Индикаторная бумага', 'Индикатор қағазы', 'Indicator paper'), advance: 15,
      do(S, lc, ctx) {
        lc.paper = S.alk.pH; lc.fresh = true; S.alk.checked = true;
        const r = Math.round(clamp(S.alk.pH, 0, 14));
        ctx.log({ ru: `Индикаторная бумага: pH ≈ ${r} (${S.alk.V} мл NaOH)`, kk: `Индикатор қағазы: pH ≈ ${r} (${S.alk.V} мл NaOH)`, en: `Indicator paper: pH ≈ ${r} (${S.alk.V} mL NaOH)` }, 'obs');
      } },
  ],
  tick(S, lc, dt) { S.T = relax(S.T, S.dz.inBath ? 4 : 22, 0.004, dt); },
  readouts: (S, lc) => [
    { label: L('Прибавлено NaOH', 'NaOH қосылды', 'NaOH added'), value: ml(S.alk.V, 0), st: S.alk.V >= 12 && S.alk.V <= 15 ? 'ok' : S.alk.V > 18 ? 'warn' : '' },
    { label: L('Окраска', 'Түсі', 'Colour'), value: acidFraction(S.alk.pH) > 0.7 ? L('красная', 'қызыл', 'red') : acidFraction(S.alk.pH) > 0.3 ? L('красно-оранжевая', 'қызыл-сарғыш', 'red-orange') : L('оранжевая', 'қызғылт сары', 'orange') },
    { label: L('Бумага', 'Қағаз', 'Paper'), value: lc.paper == null ? '—' : 'pH ≈ ' + Math.round(clamp(lc.paper, 0, 14)), st: lc.paper != null && lc.fresh ? (lc.paper >= 9 ? 'ok' : 'warn') : '' },
    { label: L('Смесь', 'Қоспа', 'Mixture'), value: n(S.T, 0) + ' °C' },
  ],
  done(S, lc) {
    if (S.alk.V >= 10 && lc.fresh && lc.paper != null) {
      return lc.paper >= 9 ? { text: L('Среда щелочная: окраска оранжевая, выделяется натриевая соль.', 'Орта сілтілі: түсі қызғылт сары, натрий тұзы бөлінуде.', 'The mixture is alkaline: orange colour, the sodium salt is separating.') }
        : { text: L(`Бумага показывает pH ≈ ${Math.round(lc.paper)} — среда ещё не щелочная. Можно продолжить прибавление.`, `Қағаз pH ≈ ${Math.round(lc.paper)} көрсетеді — орта әлі сілтілі емес. Қосуды жалғастыруға болады.`, `The paper shows pH ≈ ${Math.round(lc.paper)} — not alkaline yet. You can keep adding.`), kind: 'warn' };
    }
    return false;
  },
  onLeave(S, ctx) {
    alkUpdate(S);
    S.vTot += S.alk.V;
    if (S.alk.pH < 8) ctx.remark({ key: 'alk-low', severity: 'major', text: L(`смесь не доведена до щелочной реакции (pH ≈ ${Math.round(S.alk.pH)}) — часть красителя осталась в красной кислотной форме`, `қоспа сілтілі реакцияға жеткізілмеді (pH ≈ ${Math.round(S.alk.pH)}) — бояғыштың бір бөлігі қызыл қышқылдық түрінде қалды`, `the mixture was not made alkaline (pH ≈ ${Math.round(S.alk.pH)}) — part of the dye stayed in the red acid form`) });
    else if (S.alk.V > 18) ctx.remark({ key: 'alk-x', severity: 'minor', text: L(`избыток щёлочи (${S.alk.V} мл вместо 12–15 мл)`, `сілті артық (12–15 мл орнына ${S.alk.V} мл)`, `excess alkali (${S.alk.V} mL instead of 12–15 mL)`) });
    ctx.log(S.alk.pH >= 8 ? L(`Прибавлено ${S.alk.V} мл 10 % NaOH: смесь щелочная, оранжевая; выделяются оранжевые кристаллы натриевой соли`, `${S.alk.V} мл 10 % NaOH қосылды: қоспа сілтілі, қызғылт сары; натрий тұзының қызғылт сары кристалдары бөлінуде`, `${S.alk.V} mL of 10 % NaOH added: the mixture is alkaline and orange; orange crystals of the sodium salt are separating`)
      : L(`Прибавлено ${S.alk.V} мл 10 % NaOH: смесь красно-оранжевая, pH ≈ ${Math.round(S.alk.pH)}`, `${S.alk.V} мл 10 % NaOH қосылды: қоспа қызыл-сарғыш, pH ≈ ${Math.round(S.alk.pH)}`, `${S.alk.V} mL of 10 % NaOH added: the mixture is red-orange, pH ≈ ${Math.round(S.alk.pH)}`), 'obs');
  },
  scene: (S, lc) => {
    const f = S.cp.medium === 'alk' ? 0 : acidFraction(S.alk.pH);
    const sv = beakerScene({ cap: 100, vol: (S.vTot || 40) + S.alk.V, color: S.cp.medium === 'alk' ? 'rgba(240,210,110,.55)' : slurryColor(f), ppt: 0.8, pptColor: f > 0.5 ? '#9c1830' : '#d8641c', T: S.T, tMin: -10, tMax: 40, rod: true, stir: lc.c && lc.c.stir, bath: S.dz.inBath ? 'ice' : null, drops: lc.added || 0, dropColor: 'var(--liquid)', label: L('стакан 100 мл', 'стақан 100 мл', '100 mL beaker') });
    return lc.paper == null ? sv : sv.replace('</svg>', `<rect x="22" y="70" width="16" height="64" rx="2" fill="${pHcolor(lc.paper)}" stroke="var(--line)"/>${text(30, 148, L('инд. бумага', 'инд. қағаз', 'pH paper'))}</svg>`);
  },
  hints: [
    L('Щёлочь нейтрализует HCl, уксусную кислоту и сульфогруппу красителя. До щелочной реакции нужно около 12–15 мл.', 'Сілті HCl-ды, сірке қышқылын және бояғыштың сульфотобын бейтараптайды. Сілтілі реакцияға дейін шамамен 12–15 мл қажет.', 'The alkali neutralises the HCl, the acetic acid and the sulfonic acid group of the dye. About 12–15 mL are needed to make it alkaline.'),
    L('Прибавляйте по 1 мл при перемешивании и после каждых 2–3 мл проверяйте бумагой. Цель — pH 9 и выше.', 'Араластыра отырып 1 мл-ден қосып, әр 2–3 мл-ден кейін қағазбен тексеріңіз. Мақсат — pH 9 және одан жоғары.', 'Add 1 mL at a time with stirring and test with paper after every 2–3 mL. Aim for pH 9 or higher.'),
    L('«Перемешивать» → «NaOH +1 мл» ×12–13 → «Индикаторная бумага»: pH ≥ 9 — «Далее».', '«Араластыру» → «NaOH +1 мл» ×12–13 → «Индикатор қағазы»: pH ≥ 9 — «Әрі қарай».', '“Stir” → “NaOH +1 mL” ×12–13 → “Indicator paper”: pH ≥ 9 — “Next”.'),
  ],
};

/* ------------------------------------------------------------------ 17. кипячение, высаливание, охлаждение */
const s17 = {
  type: 'process', id: 'salt',
  title: L('Растворение при кипячении и высаливание', 'Қайнатып еріту және тұздап бөлу', 'Dissolving at the boil and salting out'),
  instr: L('<ol><li>Нагрейте смесь до кипения, чтобы растворить большую часть красителя.</li><li>Добавьте <b>около 5 г NaCl</b> и перемешивайте до растворения.</li><li>Дайте смеси остыть до комнатной температуры, затем охладите в ледяной бане.</li></ol><p class="note">NaCl понижает растворимость натриевой соли красителя (высаливание); при медленном охлаждении растут крупные кристаллы.</p>',
    '<ol><li>Бояғыштың көп бөлігін еріту үшін қоспаны қайнағанға дейін қыздырыңыз.</li><li><b>Шамамен 5 г NaCl</b> қосып, ерігенше араластырыңыз.</li><li>Қоспаны бөлме температурасына дейін суытып, содан кейін мұз моншасында салқындатыңыз.</li></ol><p class="note">NaCl бояғыштың натрий тұзының ерігіштігін төмендетеді (тұздап бөлу); баяу салқындатқанда ірі кристалдар өседі.</p>',
    '<ol><li>Heat the mixture to boiling to dissolve most of the dye.</li><li>Add <b>about 5 g of NaCl</b> and stir until it dissolves.</li><li>Let the mixture cool to room temperature, then chill it in an ice bath.</li></ol><p class="note">NaCl lowers the solubility of the sodium salt of the dye (salting out); slow cooling grows large crystals.</p>'),
  need: L('Прокипятите, высолите и охладите', 'Қайнатып, тұздап, салқындатыңыз', 'Boil, salt out and cool'),
  speeds: [10, 20, 40],
  setup(S, lc) { S.iso = S.iso || { nacl: 0, boilOver: 0, Tfilt: 22 }; lc.boiled = 0; lc.ice = false; lc.low = false; S.dz.inBath = false; },
  controls: [
    { kind: 'toggle', id: 'heat', group: L('Плитка', 'Плита', 'Hot plate'), label: L('Плитка: включить', 'Плита: қосу', 'Hot plate: on'), labelOn: L('Плитка: выключить', 'Плита: өшіру', 'Hot plate: off'), disabled: (S, lc) => lc.ice,
      onChange(S, lc, on, ctx) { lc.low = false; ctx.log(on ? L('Стакан на плитке, нагрев включён', 'Стақан плитада, қыздыру қосылды', 'Beaker on the hot plate, heating on') : L('Плитка выключена, стакан остывает на термостойкой подставке', 'Плита өшірілді, стақан ыстыққа төзімді тұғырда суып жатыр', 'Hot plate off; the beaker is cooling on a heat-resistant mat')); } },
    { kind: 'toggle', id: 'stir', group: L('Плитка', 'Плита', 'Hot plate'), label: L('Перемешивать', 'Араластыру', 'Stir'), labelOn: L('Перемешивание: вкл.', 'Араластыру: қосулы', 'Stirring: on') },
    { kind: 'action', id: 'nacl', once: false, group: L('Высаливание', 'Тұздау', 'Salting out'), label: L('NaCl +1 г', 'NaCl +1 г', 'NaCl +1 g'), advance: 20,
      do(S, lc, ctx) { S.iso.nacl += 1; ctx.log({ ru: `Добавлен 1 г NaCl (всего ${S.iso.nacl} г)`, kk: `1 г NaCl қосылды (барлығы ${S.iso.nacl} г)`, en: `1 g of NaCl added (${S.iso.nacl} g in total)` }); } },
    { kind: 'action', id: 'ice', group: L('Охлаждение', 'Салқындату', 'Cooling'), label: L('Поставить в ледяную баню', 'Мұз моншасына қою', 'Put in the ice bath'), advance: 20,
      do(S, lc, ctx) {
        lc.ice = true; lc.c.heat = false;
        if (S.T > 60) ctx.remark({ key: 'iso-shock', severity: 'minor', text: L(`горячий стакан (${n(S.T, 0)} °C) сразу поставлен в лёд — мелкие кристаллы, стакан может треснуть (п. 9.4 правил ТБ)`, `ыстық стақан (${n(S.T, 0)} °C) бірден мұзға қойылды — ұсақ кристалдар, стақан жарылуы мүмкін (ҚТ ережелерінің 9.4-тармағы)`, `the hot beaker (${n(S.T, 0)} °C) went straight into ice — small crystals, and the beaker may crack (safety rule 9.4)`) });
        ctx.log(L(`Стакан поставлен в ледяную баню (${n(S.T, 0)} °C)`, `Стақан мұз моншасына қойылды (${n(S.T, 0)} °C)`, `Beaker placed in the ice bath (${n(S.T, 0)} °C)`));
      } },
  ],
  tick(S, lc, dt) {
    const tgt = lc.ice ? 1 : lc.c.heat ? (lc.low ? 101 : 104) : 22;
    S.T = Math.min(100, relax(S.T, tgt, lc.ice ? 0.006 : lc.c.heat ? 0.005 : 0.0028, dt));
    if (S.T >= 99) lc.boiled += dt;
  },
  readouts: (S, lc) => {
    const cN = (S.iso.nacl / S.vTot) * 1000, mD = (S.cp.nDye || 0) * M.MO;
    const dis = mD > 0 ? Math.min(1, (solubility(S.T, cN) * S.vTot) / 1000 / mD) : 0;
    return [
      { label: L('Смесь', 'Қоспа', 'Mixture'), value: n(S.T, 0) + ' °C', st: S.T >= 99.5 ? 'warn' : S.T <= 8 ? 'ok' : '' },
      { label: 'NaCl', value: gr(S.iso.nacl, 0), st: S.iso.nacl >= 4 && S.iso.nacl <= 7 ? 'ok' : '' },
      { label: L('Краситель в растворе', 'Ерітіндідегі бояғыш', 'Dye in solution'), value: n(dis * 100, 0) + ' %' },
    ];
  },
  alerts(S, lc) {
    if (!lc.boiled && !lc.c.heat && (S.iso.nacl > 0 || lc.ice)) return { text: L('Смесь ещё не доводили до кипения — краситель не растворился. Включите плитку.', 'Қоспа әлі қайнатылған жоқ — бояғыш ерімеді. Плитаны қосыңыз.', 'The mixture has not been brought to the boil yet — the dye has not dissolved. Switch on the hot plate.'), kind: 'warn' };
    if (lc.ice && S.T <= 8) return { text: L('Смесь охлаждена, выпали оранжевые кристаллы. Можно фильтровать.', 'Қоспа салқындатылды, қызғылт сары кристалдар түзілді. Сүзуге болады.', 'The mixture is cold and orange crystals have formed. It can be filtered.'), kind: 'good' };
    if (lc.boiled > 0 && S.iso.nacl < 4 && S.T > 80) return { text: L('Смесь прокипячена. Добавьте около 5 г NaCl.', 'Қоспа қайнатылды. Шамамен 5 г NaCl қосыңыз.', 'The mixture has boiled. Add about 5 g of NaCl.'), kind: 'info' };
    if (lc.boiled > 0 && S.iso.nacl >= 4 && lc.c.heat) return { text: L('NaCl добавлен. Выключите плитку и дайте смеси остыть.', 'NaCl қосылды. Плитаны өшіріп, қоспаны суытыңыз.', 'NaCl added. Switch off the hot plate and let the mixture cool.'), kind: 'info' };
    if (lc.boiled > 0 && !lc.c.heat && !lc.ice && S.T <= 28) return { text: L('Смесь остыла до комнатной температуры. Охладите её в ледяной бане.', 'Қоспа бөлме температурасына дейін суыды. Оны мұз моншасында салқындатыңыз.', 'The mixture has cooled to room temperature. Chill it in the ice bath.'), kind: 'info' };
    return null;
  },
  events: [{
    id: 'foam', when: (S, lc) => S.T >= 99 && lc.c.heat && !lc.low,
    title: L('Смесь вспенивается при кипении', 'Қоспа қайнағанда көпіршиді', 'The mixture foams on boiling'),
    text: L('Густая суспензия закипает толчками, пена поднимается к краю стакана. Что вы сделаете?', 'Қою суспензия лықсып қайнайды, көбік стақан жиегіне көтерілуде. Не істейсіз?', 'The thick suspension boils in bumps and the foam is rising to the rim of the beaker. What do you do?'),
    options: [
      { ok: true, label: L('Уменьшить нагрев и перемешивать палочкой', 'Қыздыруды азайтып, таяқшамен араластыру', 'Turn the heat down and stir with the rod'), effect(S, lc) { lc.low = true; lc.c.stir = true; }, log: L('Нагрев уменьшен, смесь слабо кипит при перемешивании', 'Қыздыру азайтылды, қоспа араластыруда әлсіз қайнайды', 'Heat turned down; the mixture simmers with stirring') },
      { ok: false, severity: 'major', label: L('Продолжать сильный нагрев — пена осядет', 'Қатты қыздыруды жалғастыру — көбік басылады', 'Keep heating hard — the foam will settle'), remark: L('смесь перелилась через край при кипении — потеря красителя', 'қоспа қайнағанда жиектен асып төгілді — бояғыштың жоғалуы', 'the mixture boiled over — dye was lost'),
        whatif: L('Пена с красителем перелилась на плитку: часть продукта потеряна, а горячая щелочная смесь может обжечь руки.', 'Бояғышы бар көбік плитаға төгілді: өнімнің бір бөлігі жоғалды, ал ыстық сілтілі қоспа қолды күйдіруі мүмкін.', 'Foam containing dye ran over onto the hot plate: some product is lost, and the hot alkaline mixture can burn your hands.'), effect(S, lc) { S.iso.boilOver += 0.12; lc.low = true; }, log: L('Часть смеси перелилась через край на плитку', 'Қоспаның бір бөлігі жиектен асып плитаға төгілді', 'Some of the mixture ran over the rim onto the hot plate') },
      { ok: false, severity: 'minor', label: L('Накрыть стакан часовым стеклом', 'Стақанды сағат шынысымен жабу', 'Cover the beaker with a watch glass'), remark: L('кипящую смесь накрыли стеклом — пена приподняла стекло, брызги', 'қайнап жатқан қоспа шынымен жабылды — көбік шыныны көтерді, шашырау', 'the boiling mixture was covered with a glass — the foam lifted the glass, splashes'),
        whatif: L('Стекло не удерживает пену: оно сдвигается, брызги горячей щелочной смеси летят на стол. Пену гасят уменьшением нагрева и перемешиванием.', 'Шыны көбікті ұстап тұрмайды: ол жылжиды, ыстық сілтілі қоспаның шашырандылары үстелге ұшады. Көбікті қыздыруды азайтып, араластыру арқылы басады.', 'A glass will not hold the foam back: it slides off and hot alkaline splashes land on the bench. Foam is controlled by lowering the heat and stirring.'), effect(S, lc) { S.iso.boilOver += 0.03; lc.low = true; } },
    ],
  }],
  done(S, lc, ctx) {
    if (lc.boiled > 0 && S.iso.nacl >= 1 && !lc.c.heat && S.T <= 30) {
      if (!lc.logged) { lc.logged = 1; ctx.log(L('Смесь прокипячена, краситель в основном растворился; после добавления NaCl и охлаждения выпали оранжевые кристаллы', 'Қоспа қайнатылды, бояғыш негізінен еріді; NaCl қосып, салқындатқаннан кейін қызғылт сары кристалдар түзілді', 'The mixture was boiled and most of the dye dissolved; after adding NaCl and cooling, orange crystals came out'), 'obs'); }
      return lc.ice && S.T <= 8 ? { text: L('Смесь охлаждена во льду.', 'Қоспа мұзда салқындатылды.', 'The mixture is chilled in ice.') } : { text: L('Смесь остыла. По методичке её ещё охлаждают в ледяной бане.', 'Қоспа суыды. Әдістеме бойынша оны мұз моншасында тағы салқындатады.', 'The mixture has cooled. The manual says to chill it in an ice bath as well.'), kind: 'info' };
    }
    return false;
  },
  onLeave(S, ctx) {
    S.iso.Tfilt = S.T;
    if (S.iso.nacl < 3) ctx.remark({ key: 'iso-salt', severity: 'major', text: L(`недостаточно NaCl для высаливания (${S.iso.nacl} г вместо ~5 г) — краситель остаётся в растворе`, `тұздап бөлуге NaCl жеткіліксіз (~5 г орнына ${S.iso.nacl} г) — бояғыш ерітіндіде қалады`, `not enough NaCl for salting out (${S.iso.nacl} g instead of ~5 g) — dye stays in solution`) });
    else if (S.iso.nacl > 7) ctx.remark({ key: 'iso-saltx', severity: 'minor', text: L(`избыток NaCl (${S.iso.nacl} г) — нерастворившаяся соль загрязнит продукт`, `NaCl артық (${S.iso.nacl} г) — ерімеген тұз өнімді ластайды`, `too much NaCl (${S.iso.nacl} g) — undissolved salt will contaminate the product`) });
    if (S.T > 10) ctx.remark({ key: 'iso-warm', severity: 'minor', text: L(`смесь не охлаждена в ледяной бане (${n(S.T, 0)} °C) — больше красителя останется в фильтрате`, `қоспа мұз моншасында салқындатылмады (${n(S.T, 0)} °C) — фильтратта бояғыш көбірек қалады`, `the mixture was not chilled in ice (${n(S.T, 0)} °C) — more dye will stay in the filtrate`) });
  },
  scene: (S, lc) => {
    const hot = S.T > 60;
    const cN = (S.iso.nacl / S.vTot) * 1000, mD = (S.cp.nDye || 0) * M.MO;
    const dis = mD > 0 ? Math.min(1, (solubility(S.T, cN) * S.vTot) / 1000 / mD) : 0;
    return beakerScene({ cap: 100, vol: S.vTot, color: slurryColor(0, 0.5 + 0.4 * dis), ppt: Math.max(0, 1 - dis) * 0.9, pptColor: '#d8641c', T: S.T, tMin: 0, tMax: 100, rod: true, stir: lc.c && lc.c.stir, plate: !lc.ice, hot: lc.c && lc.c.heat, bath: lc.ice ? 'ice' : null, boil: S.T >= 99.5, steam: hot, label: L('стакан 100 мл', 'стақан 100 мл', '100 mL beaker') });
  },
  hints: [
    L('Порядок по методичке: кипячение → NaCl → остывание до комнатной температуры → ледяная баня.', 'Әдістеме бойынша рет: қайнату → NaCl → бөлме температурасына дейін суыту → мұз моншасы.', 'The order in the manual: boil → NaCl → cool to room temperature → ice bath.'),
    L('NaCl нужно около 5 г — меньше 3 г плохо высаливает, больше 7 г загрязняет продукт. Пена при кипении — уменьшить нагрев.', 'NaCl шамамен 5 г қажет — 3 г-нан аз болса нашар бөледі, 7 г-нан көп болса өнімді ластайды. Қайнағанда көбік — қыздыруды азайту.', 'About 5 g of NaCl is needed — under 3 g salts out poorly, over 7 g contaminates the product. Foam on boiling — turn the heat down.'),
    L('«Плитка: включить» → дождитесь кипения → «NaCl +1 г» ×5 → «Плитка: выключить» → остыть до ≈ 25 °C → «Поставить в ледяную баню» → до 8 °C.', '«Плита: қосу» → қайнағанша күтіңіз → «NaCl +1 г» ×5 → «Плита: өшіру» → ≈ 25 °C-қа дейін суыту → «Мұз моншасына қою» → 8 °C-қа дейін.', '“Hot plate: on” → wait for boiling → “NaCl +1 g” ×5 → “Hot plate: off” → cool to ≈ 25 °C → “Put in the ice bath” → down to 8 °C.'),
  ],
};

/* ------------------------------------------------------------------ 18. сборка установки */
const s18 = {
  type: 'assemble', id: 'vac-setup',
  title: L('Сборка установки для вакуумного фильтрования', 'Вакуумда сүзу қондырғысын жинау', 'Assembling the vacuum filtration set-up'),
  instr: L('<p>Соберите установку для фильтрования под вакуумом: выберите деталь и нажмите место, куда её поставить (в панели или на стенде).</p><p class="note">Ошибка сборки проявится при работе.</p>',
    '<p>Вакуумда сүзу қондырғысын жинаңыз: бөлшекті таңдап, оны қоятын орынды басыңыз (панельде немесе стендте).</p><p class="note">Жинаудағы қате жұмыс кезінде байқалады.</p>',
    '<p>Assemble the set-up for filtration under vacuum: choose a part and tap the place where it goes (in the panel or on the bench).</p><p class="note">An assembly mistake will show up during the work.</p>'),
  need: L('Соберите установку', 'Қондырғыны жинаңыз', 'Assemble the set-up'),
  parts: [
    { id: 'buchner', label: L('Воронка Бюхнера', 'Бюхнер шұңғымасы', 'Büchner funnel') },
    { id: 'funnel', label: L('Стеклянная воронка', 'Шыны шұңғыма', 'Glass funnel') },
    { id: 'cone', label: L('Резиновый конус', 'Резеңке конус', 'Rubber cone') },
    { id: 'stopper', label: L('Пробка с термометром', 'Термометрі бар тығын', 'Stopper with thermometer') },
    { id: 'bunsen', label: L('Колба Бунзена', 'Бунзен колбасы', 'Filter flask') },
    { id: 'conical', label: L('Коническая колба 250 мл', 'Конустық колба 250 мл', '250 mL conical flask') },
    { id: 'hose', label: L('Вакуумный шланг к насосу', 'Сорғыға вакуумдық шланг', 'Vacuum hose to the pump') },
  ],
  slots: [
    { id: 'top', label: L('Воронка', 'Шұңғыма', 'Funnel'), accepts: 'buchner', x: 140, y: 50 },
    { id: 'seal', label: L('Уплотнение', 'Тығыздағыш', 'Seal'), accepts: 'cone', x: 140, y: 100 },
    { id: 'flask', label: L('Приёмник фильтрата', 'Фильтрат қабылдағышы', 'Filtrate receiver'), accepts: 'bunsen', x: 140, y: 170 },
    { id: 'vac', label: L('Отвод → насос', 'Бұрма → сорғы', 'Side arm → pump'), accepts: 'hose', x: 250, y: 130 },
  ],
  base: filterBase,
  onDone(S, place) {
    S.leak = place.seal !== 'cone';
    S.thin = place.flask !== 'bunsen';
    S.glassFunnel = place.top !== 'buchner';
    S.noHose = place.vac !== 'hose';
  },
  hint1: L('Воронка Бюхнера ставится на толстостенную колбу Бунзена через резиновое уплотнение; отвод колбы соединяют шлангом с насосом.', 'Бюхнер шұңғымасы қалың қабырғалы Бунзен колбасына резеңке тығыздағыш арқылы қойылады; колба бұрмасы сорғымен шланг арқылы жалғанады.', 'The Büchner funnel sits on a thick-walled filter flask with a rubber seal; the side arm is connected to the pump with a hose.'),
};

const IMPLODE = {
  ru: 'Тонкостенная коническая колба не рассчитана на разрежение: при включении насоса её раздавило атмосферным давлением (имплозия), осколки разлетелись, щелочная смесь с красителем пролилась на стол. В реальной лаборатории для вакуумного фильтрования используют только толстостенную колбу Бунзена, а посуду перед работой под вакуумом осматривают (пп. 3.2, 9.1). Осколки собирают в ёмкость для боя стекла (п. 9.3). Установку собирают заново.',
  kk: 'Жұқа қабырғалы конустық колба сиреуге шыдамайды: сорғыны қосқанда оны атмосфералық қысым жаншып жіберді (имплозия), сынықтар шашырады, бояғышы бар сілтілі қоспа үстелге төгілді. Нақты зертханада вакуумда сүзу үшін тек қалың қабырғалы Бунзен колбасын қолданады, ал вакуумда жұмыс алдында ыдысты тексереді (3.2, 9.1-тармақтар). Сынықтарды сынған шыны ыдысына жинайды (9.3-тармақ). Қондырғы қайта жиналады.',
  en: 'A thin-walled conical flask is not designed for vacuum: when the pump was switched on it was crushed by atmospheric pressure (implosion), glass fragments flew and the alkaline dye mixture spilled on the bench. In a real lab only a thick-walled filter flask is used for vacuum filtration, and glassware is inspected before working under vacuum (rules 3.2, 9.1). The fragments go into the broken-glass container (rule 9.3). The set-up is assembled again.',
};

/* ------------------------------------------------------------------ 19. фильтрование и промывание */
const s19 = {
  type: 'separate', id: 'filt', mode: 'filter', keep: 'cake',
  title: L('Фильтрование и промывание', 'Сүзу және жуу', 'Filtration and washing'),
  instr: L('<ol><li>Соберите оранжевые кристаллы фильтрованием под вакуумом.</li><li>Промойте их на фильтре <b>небольшим количеством насыщенного раствора NaCl</b>.</li></ol><p class="note">Перед выключением водоструйного насоса отсоедините шланг от колбы Бунзена.</p>',
    '<ol><li>Қызғылт сары кристалдарды вакуумда сүзу арқылы жинаңыз.</li><li>Оларды сүзгіде <b>қаныққан NaCl ерітіндісінің аз мөлшерімен</b> жуыңыз.</li></ol><p class="note">Су ағынды сорғыны өшірмес бұрын шлангты Бунзен колбасынан ажыратыңыз.</p>',
    '<ol><li>Collect the orange crystals by vacuum filtration.</li><li>Wash them on the filter with <b>a small amount of saturated NaCl solution</b>.</li></ol><p class="note">Before switching off the water aspirator, disconnect the hose from the filter flask.</p>'),
  need: L('Отфильтруйте и промойте кристаллы', 'Кристалдарды сүзіп, жуыңыз', 'Filter and wash the crystals'),
  transferLabel: L('Перенести суспензию на фильтр', 'Суспензияны сүзгіге ауыстыру', 'Pour the suspension onto the filter'),
  liquids: [
    { id: 'brine', ok: true, label: L('Насыщенный раствор NaCl (~3 мл)', 'Қаныққан NaCl ерітіндісі (~3 мл)', 'Saturated NaCl solution (~3 mL)') },
    { id: 'water', ok: false, severity: 'major', label: L('Дистиллированная вода (~5 мл)', 'Дистилденген су (~5 мл)', 'Distilled water (~5 mL)'),
      remark: L('кристаллы промыты водой — краситель растворяется и уходит в фильтрат', 'кристалдар сумен жуылды — бояғыш еріп, фильтратқа кетеді', 'crystals washed with water — the dye dissolves and goes into the filtrate'),
      whatif: L('Метиловый оранжевый — натриевая соль сульфокислоты, он заметно растворим в воде; насыщенный раствор NaCl смывает маточный раствор, почти не растворяя краситель.', 'Метилоранж — сульфоқышқылдың натрий тұзы, ол суда едәуір ериді; қаныққан NaCl ерітіндісі бояғышты ерітпей дерлік аналық ерітіндіні шаяды.', 'Methyl orange is the sodium salt of a sulfonic acid and is noticeably soluble in water; saturated NaCl solution rinses away the mother liquor while hardly dissolving the dye.'),
      effect(S, F) { F.washLoss = (F.washLoss || 0) + 0.1; } },
    { id: 'hot', ok: false, severity: 'major', label: L('Горячая вода (~5 мл)', 'Ыстық су (~5 мл)', 'Hot water (~5 mL)'),
      remark: L('кристаллы промыты горячей водой — значительная часть красителя растворилась', 'кристалдар ыстық сумен жуылды — бояғыштың едәуір бөлігі еріді', 'crystals washed with hot water — a large part of the dye dissolved'),
      whatif: L('В горячей воде метиловый оранжевый растворяется хорошо — именно ею его перекристаллизовывают. Промывка горячей водой уносит продукт в фильтрат.', 'Ыстық суда метилоранж жақсы ериді — оны дәл сонымен қайта кристалдайды. Ыстық сумен жуу өнімді фильтратқа алып кетеді.', 'Methyl orange dissolves well in hot water — that is what it is recrystallised from. Washing with hot water carries the product into the filtrate.'),
      effect(S, F) { F.washLoss = (F.washLoss || 0) + 0.3; } },
    { id: 'hcl', ok: false, severity: 'major', label: L('Разбавленная HCl (~5 мл)', 'Сұйылтылған HCl (~5 мл)', 'Dilute HCl (~5 mL)'),
      remark: L('кристаллы промыты кислотой — краситель частично перешёл в красную кислотную форму', 'кристалдар қышқылмен жуылды — бояғыш ішінара қызыл қышқылдық түріне ауысты', 'crystals washed with acid — the dye partly turned into the red acid form'),
      whatif: L('Метиловый оранжевый — индикатор: в кислоте (pH < 3,1) он протонируется и становится красным. Продукт будет загрязнён кислотной формой.', 'Метилоранж — индикатор: қышқылда (pH < 3,1) ол протондалып, қызыл түске боялады. Өнім қышқылдық түрімен ластанады.', 'Methyl orange is an indicator: in acid (pH < 3.1) it is protonated and turns red. The product will be contaminated with the acid form.'),
      effect(S, F) { F.acidWash = true; F.washLoss = (F.washLoss || 0) + 0.03; } },
  ],
  onVacuum(S, F, ctx) {
    if (S.thin) { ctx.remark({ key: 'implode', severity: 'critical', text: L('вакуум включён на тонкостенной конической колбе — колба лопнула', 'вакуум жұқа қабырғалы конустық колбада қосылды — колба жарылды', 'vacuum applied to a thin-walled conical flask — the flask imploded'), critical: { text: IMPLODE } }); return false; }
    if (S.noHose) { ctx.feedback(L('Отвод колбы не соединён с насосом — разрежения нет.', 'Колба бұрмасы сорғыға жалғанбаған — сиреу жоқ.', 'The side arm is not connected to the pump — there is no vacuum.'), 'warn'); return false; }
    if (S.leak && !F.leakSeen) { F.leakSeen = true; ctx.log(L('Слышен подсос воздуха между воронкой и колбой — вакуум слабый', 'Шұңғыма мен колба арасынан ауа сорылғаны естіледі — вакуум әлсіз', 'Air hisses in between the funnel and the flask — the vacuum is weak'), 'obs'); }
    return true;
  },
  onTransfer(S, F, ctx) {
    if (S.leak) F.loss += 0.05;
    if (S.glassFunnel) { F.loss += 0.1; ctx.log(L('Через стеклянную воронку фильтрование идёт очень медленно, кристаллы забивают фильтр', 'Шыны шұңғыма арқылы сүзу өте баяу жүреді, кристалдар сүзгіні бітейді', 'Through a glass funnel the filtration is very slow and the crystals clog the paper'), 'obs'); ctx.advance(900); }
    ctx.log(L('На фильтре — оранжевые кристаллические листочки; фильтрат оранжево-красный (часть красителя осталась в растворе)', 'Сүзгіде — қызғылт сары кристалды жапырақшалар; фильтрат қызғылт сары-қызыл (бояғыштың бір бөлігі ерітіндіде қалды)', 'On the filter: orange crystalline leaflets; the filtrate is orange-red (some dye has stayed in solution)'), 'obs');
  },
  onWash(S, F, liq) {
    if (liq.id === 'brine') { F.brine = true; F.washLoss = (F.washLoss || 0) + 0.006; }
  },
  finishCheck(S, F, ctx) {
    if (F.washes > 3) ctx.remark({ key: 'overwash', severity: 'minor', text: L('лишние промывки — потери продукта', 'артық жуу — өнім шығыны', 'too many washes — product lost') });
  },
  onFinish(S, F, ctx) {
    S.filt = { washes: F.washes, loss: F.loss || 0, washLoss: F.washLoss || 0, brine: !!F.brine, acidWash: !!F.acidWash };
    const f = makeFin(S);
    const red = f.acidFrac > 0.2;
    ctx.log(red ? L(`Продукт отжат на фильтре: влажная масса ≈ ${n(f.m * 1.35, 1)} г, кристаллы красно-оранжевые`, `Өнім сүзгіде сығылды: ылғал массасы ≈ ${n(f.m * 1.35, 1)} г, кристалдар қызыл-сарғыш`, `Product pressed dry on the filter: wet mass ≈ ${n(f.m * 1.35, 1)} g, red-orange crystals`)
      : L(`Продукт отжат на фильтре: влажная масса ≈ ${n(f.m * 1.35, 1)} г, оранжевые кристаллы`, `Өнім сүзгіде сығылды: ылғал массасы ≈ ${n(f.m * 1.35, 1)} г, қызғылт сары кристалдар`, `Product pressed dry on the filter: wet mass ≈ ${n(f.m * 1.35, 1)} g, orange crystals`), 'obs');
  },
  cakeColor: (S) => (S.alk && S.alk.pH < 8 ? '#b8323a' : '#e07a22'),
  seal: (S) => !S.leak,
  hint3: L('Продукт — кристаллы на фильтре, фильтрат — в отходы. Промывают 1–2 раза насыщенным NaCl. В конце: сначала отсоединить шланг, потом выключить насос.', 'Өнім — сүзгідегі кристалдар, фильтрат — қалдыққа. Қаныққан NaCl-мен 1–2 рет жуады. Соңында: алдымен шлангты ажырату, содан кейін сорғыны өшіру.', 'The product is the crystals on the filter; the filtrate goes to waste. Wash 1–2 times with saturated NaCl. At the end: disconnect the hose first, then switch off the pump.'),
};

/* ------------------------------------------------------------------ 20. сушка */
const s20 = {
  type: 'decide', id: 'dry',
  title: L('Сушка продукта', 'Өнімді кептіру', 'Drying the product'),
  instr: L('<p>Кристаллы нужно высушить, прежде чем взвешивать.</p><p class="note">Теоретический выход считают по фактической навеске сульфаниловой кислоты.</p>', '<p>Кристалдарды өлшемес бұрын кептіру керек.</p><p class="note">Теориялық шығым сульфанил қышқылының нақты өлшендісі бойынша есептеледі.</p>', '<p>The crystals must be dried before weighing.</p><p class="note">The theoretical yield is calculated from the actual mass of sulfanilic acid.</p>'),
  need: L('Выберите способ сушки', 'Кептіру тәсілін таңдаңыз', 'Choose how to dry'),
  question: L('Как подготовить продукт к взвешиванию?', 'Өнімді өлшеуге қалай дайындайды?', 'How do you prepare the product for weighing?'),
  options: [
    { id: 'air', ok: true, label: L('Разложить на фильтровальной бумаге и сушить на воздухе до следующего занятия', 'Сүзгі қағазына жайып, келесі сабаққа дейін ауада кептіру', 'Spread on filter paper and dry in air until the next session'), effect(S, i, ctx) { S.water = 0.01; ctx.nextDay(); }, log: L('Кристаллы разложены на фильтровальной бумаге и оставлены сушиться до следующего занятия', 'Кристалдар сүзгі қағазына жайылып, келесі сабаққа дейін кептіруге қалдырылды', 'Crystals spread on filter paper and left to dry until the next session') },
    { id: 'filter', ok: false, severity: 'minor', label: L('Подсушить на фильтре, просасывая воздух 15 мин', 'Сүзгіде 15 мин ауа сорып кептіру', 'Dry on the filter by drawing air through for 15 min'), remark: L('продукт недосушен (только 15 мин на фильтре) — масса завышена', 'өнім толық кептірілмеген (сүзгіде тек 15 мин) — масса жоғары', 'product not fully dry (only 15 min on the filter) — the mass is too high'), whatif: L('Пасту мелких кристаллов, пропитанную рассолом, за 15 минут не высушить: в ней остаётся вода, и масса с выходом окажутся завышены.', 'Тұзды ерітіндіге қаныққан ұсақ кристалдар пастасын 15 минутта кептіру мүмкін емес: онда су қалады, масса мен шығым жоғары болады.', 'A paste of small crystals soaked in brine cannot be dried in 15 minutes: water stays in it, and the mass and yield come out too high.'), advance: 900, effect(S) { S.water = 0.08; }, log: L('Кристаллы подсушены на фильтре током воздуха 15 мин', 'Кристалдар сүзгіде ауа ағынымен 15 мин кептірілді', 'Crystals dried on the filter with an air stream for 15 min') },
    { id: 'wet', ok: false, severity: 'major', label: L('Взвесить сразу', 'Бірден өлшеу', 'Weigh straight away'), remark: L('продукт взвешен влажным — масса и выход завышены', 'өнім ылғал күйінде өлшенді — масса мен шығым жоғарылатылған', 'product weighed while wet — mass and yield too high'), whatif: L('Влажные кристаллы содержат до трети массы маточного раствора: выход получится завышенным, иногда больше 100 %.', 'Ылғал кристалдарда массаның үштен біріне дейін аналық ерітінді болады: шығым жоғары, кейде 100 %-дан да көп болады.', 'Wet crystals hold up to a third of their mass in mother liquor: the yield comes out too high, sometimes over 100 %.'), effect(S) { S.water = 0.3; }, log: L('Кристаллы взвешены сразу после фильтрования', 'Кристалдар сүзгеннен кейін бірден өлшенді', 'Crystals weighed straight after filtration') },
  ],
};

/* ------------------------------------------------------------------ 21. взвешивание */
const s21 = {
  type: 'weigh', id: 'wprod',
  title: L('Взвешивание продукта', 'Өнімді өлшеу', 'Weighing the product'),
  instr: L('<p>Взвесьте продукт на часовом стекле: стекло → тарирование → продукт → закрыть дверцы → записать.</p>', '<p>Өнімді сағат шынысында өлшеңіз: шыны → тарировкалау → өнім → есікшелерді жабу → жазу.</p>', '<p>Weigh the product on a watch glass: glass → tare → product → close the doors → record.</p>'),
  need: L('Запишите массу продукта', 'Өнім массасын жазыңыз', 'Record the mass of the product'),
  reagent: L('метиловый оранжевый', 'метилоранж', 'methyl orange'), mode: 'transfer', container: 'watch', saveAs: 'mFin', product: 'rgba(232,118,30,.95)',
  mass: (S) => S.fin.m * (1 + S.water),
  onRecord(S, m, ctx) {
    const red = S.fin.acidFrac > 0.2, dark = S.fin.phenol > 0.02 * S.fin.m;
    ctx.log(red ? L(`Красно-оранжевые кристаллы, масса <b>${g(m)} г</b>`, `Қызыл-сарғыш кристалдар, массасы <b>${g(m)} г</b>`, `Red-orange crystals, mass <b>${g(m)} g</b>`)
      : dark ? L(`Оранжевые кристаллы с бурым оттенком, масса <b>${g(m)} г</b>`, `Қоңыр реңкті қызғылт сары кристалдар, массасы <b>${g(m)} г</b>`, `Orange crystals with a brownish tinge, mass <b>${g(m)} g</b>`)
        : L(`Оранжево-жёлтые кристаллические листочки, масса <b>${g(m)} г</b>`, `Қызғылт сары-сары кристалды жапырақшалар, массасы <b>${g(m)} г</b>`, `Orange-yellow crystalline leaflets, mass <b>${g(m)} g</b>`), 'obs');
  },
};

/* ------------------------------------------------------------------ 22. расчёт выхода */
const s22 = {
  type: 'calc', id: 'yield',
  title: L('Расчёт выхода', 'Шығымды есептеу', 'Calculating the yield'),
  instr: L('<p>Рассчитайте по своим данным теоретический выход метилового оранжевого и выход в процентах.</p><p class="note">H₂N–C₆H₄–SO₃H (M = 173,19) → C₁₄H₁₄N₃NaO₃S (M = 327,33), 1 : 1. Допустимая погрешность — 1 %, три попытки.</p>',
    '<p>Өз деректеріңіз бойынша метилоранждың теориялық шығымын және пайыздық шығымын есептеңіз.</p><p class="note">H₂N–C₆H₄–SO₃H (M = 173,19) → C₁₄H₁₄N₃NaO₃S (M = 327,33), 1 : 1. Рұқсат етілген қателік — 1 %, үш әрекет.</p>',
    '<p>Using your own data, calculate the theoretical yield of methyl orange and the percent yield.</p><p class="note">H₂N–C₆H₄–SO₃H (M = 173.19) → C₁₄H₁₄N₃NaO₃S (M = 327.33), 1 : 1. Allowed error 1 %, three attempts.</p>'),
  need: L('Рассчитайте выход', 'Шығымды есептеңіз', 'Calculate the yield'),
  fields: [
    { id: 'th', label: L('Теоретический выход', 'Теориялық шығым', 'Theoretical yield'), unit: L('г', 'г', 'g'), decimals: 3, answer: (S) => theoretical(S.mSA), formula: (S) => L(`m(теор.) = ${g(S.mSA)} × 327.33 / 173.19`, `m(теор.) = ${g(S.mSA)} × 327.33 / 173.19`, `m(theor.) = ${g(S.mSA)} × 327.33 / 173.19`) },
    { id: 'eta', label: L('Выход', 'Шығым', 'Yield'), unit: '%', decimals: 1, answer: (S) => percentYield(S.mFin, S.mSA), formula: (S) => L(`η = ${g(S.mFin)} / ${n(theoretical(S.mSA), 3)} × 100 %`, `η = ${g(S.mFin)} / ${n(theoretical(S.mSA), 3)} × 100 %`, `η = ${g(S.mFin)} / ${n(theoretical(S.mSA), 3)} × 100 %`) },
  ],
  saveAs: 'calc1',
};

export default {
  id: '1',
  title: L('Синтез метилового оранжевого', 'Метилоранж синтезі', 'Synthesis of methyl orange'),
  principle: L('Диазотирование сульфаниловой кислоты (в виде натриевой соли) и азосочетание соли диазония с N,N-диметиланилином в слабокислой среде; красная кислотная форма красителя щёлочью переводится в оранжевую натриевую соль.', 'Сульфанил қышқылын (натрий тұзы түрінде) диазоттау және диазоний тұзын әлсіз қышқыл ортада N,N-диметиланилинмен азоқосу; бояғыштың қызыл қышқылдық түрі сілтімен қызғылт сары натрий тұзына айналады.', 'Diazotization of sulfanilic acid (as its sodium salt), followed by azo coupling of the diazonium salt with N,N-dimethylaniline in weakly acidic medium; the red acid form of the dye is converted into the orange sodium salt by alkali.'),
  equation: [
    '2 H₂N–C₆H₄–SO₃H + Na₂CO₃ → 2 H₂N–C₆H₄–SO₃Na + CO₂↑ + H₂O',
    'H₂N–C₆H₄–SO₃Na + NaNO₂ + 2HCl → ⁻O₃S–C₆H₄–N₂⁺ + 2NaCl + 2H₂O',
    L('⁻O₃S–C₆H₄–N₂⁺ + C₆H₅N(CH₃)₂ → HO₃S–C₆H₄–N=N–C₆H₄–N(CH₃)₂ (красная кислотная форма)', '⁻O₃S–C₆H₄–N₂⁺ + C₆H₅N(CH₃)₂ → HO₃S–C₆H₄–N=N–C₆H₄–N(CH₃)₂ (қызыл қышқылдық түрі)', '⁻O₃S–C₆H₄–N₂⁺ + C₆H₅N(CH₃)₂ → HO₃S–C₆H₄–N=N–C₆H₄–N(CH₃)₂ (red acid form)'),
    L('HO₃S–C₆H₄–N=N–C₆H₄–N(CH₃)₂ + NaOH → NaO₃S–C₆H₄–N=N–C₆H₄–N(CH₃)₂ (метиловый оранжевый) + H₂O', 'HO₃S–C₆H₄–N=N–C₆H₄–N(CH₃)₂ + NaOH → NaO₃S–C₆H₄–N=N–C₆H₄–N(CH₃)₂ (метилоранж) + H₂O', 'HO₃S–C₆H₄–N=N–C₆H₄–N(CH₃)₂ + NaOH → NaO₃S–C₆H₄–N=N–C₆H₄–N(CH₃)₂ (methyl orange) + H₂O'),
  ],
  initialState: ({ rng }) => ({
    luck: rng ? rng.range(-0.03, 0.03) : 0,
    mSA: 0, vWater: 0, carb: false, T: 22, Tmax: 22, dis: 0, Tsol: 22, mNit: 0, vHCl: 0,
    dz: { order: '', conv: 0.95, excess: 0, D: 0, T0: null, Tmax: 0, iceLeft: 0, ice: 0, inBath: false, hold: 0, warm: false, addedNit: 0 },
    vDMA: 0, vAcOH: 0, cp: { medium: 'acid', stirred: true, added: false, time: 0, nDye: 0 },
    alk: { V: 0, pH: 1, checked: false }, vTot: 36,
    iso: { nacl: 0, boilOver: 0, Tfilt: 22 }, filt: { washes: 0, loss: 0, washLoss: 0, brine: false, acidWash: false },
    fin: null, water: 0, mFin: 0, leak: false, thin: false, glassFunnel: false, noHose: false,
  }),
  checkpoints: [0, 2, 18],
  steps: [s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21, s22],
  results(S) {
    const f = S.fin || {};
    return {
      mSA: S.mSA, mNit: S.mNit, vWater: S.vWater, vHCl: S.vHCl, vDMA: S.vDMA, mFin: S.mFin, th: theoretical(S.mSA), yield: percentYield(S.mFin, S.mSA),
      Tdis: S.Tmax, T0: S.dz.T0, Tdz: S.dz.Tmax, hold: S.dz.hold, order: S.dz.order, excess: S.dz.excess > 0.0002, medium: S.cp.medium,
      vNaOH: S.alk.V, pH: S.alk.pH, nacl: S.iso.nacl, Tfilt: S.iso.Tfilt, washes: S.filt.washes, brine: S.filt.brine,
      acidForm: (f.acidFrac || 0) > 0.2, purity: f.purity || 0, water: S.water,
      losses: lossBreakdown(S),
    };
  },
  summary: (r) => [
    { label: L('Навеска', 'Өлшенді', 'Sample'), value: { ru: n(r.mSA, 4) + ' г', kk: n(r.mSA, 4) + ' г', en: n(r.mSA, 4) + ' g' } },
    { label: L('Продукт', 'Өнім', 'Product'), value: { ru: n(r.mFin, 4) + ' г', kk: n(r.mFin, 4) + ' г', en: n(r.mFin, 4) + ' g' } },
    { label: L('Выход', 'Шығым', 'Yield'), value: n(r.yield, 1) + ' %', st: r.yield >= 60 && r.yield <= 100 ? 'ok' : 'warn' },
    { label: L('Макс. t диазотирования', 'Диазоттаудың макс. t', 'Max diazotization t'), value: n(r.Tdz, 1) + ' °C', st: r.Tdz <= 10 ? 'ok' : 'warn' },
  ],
};
