/** Опыт 1. Образование глицината меди(II) (хелатный комплекс). Методичка, раздел 6, опыт 1. */
import { L, n } from '../../app/i18n.js';
import { glycinate } from './model.js';
import { hoodScene, benchBack } from './scene.js';
import { drops, readyBtn } from './common.js';

const s0 = {
  type: 'checklist', id: 'ppe',
  title: L('Рабочее место и средства защиты', 'Жұмыс орны және қорғаныс құралдары', 'Workplace and protective equipment'),
  instr: L('<p>В работе используются конц. HNO₃, 30 % NaOH и токсичный ацетат свинца(II). Наденьте средства защиты, включите тягу вытяжного шкафа, найдите средства аварийной защиты и подготовьте ёмкость для свинецсодержащих отходов. Нажмите на каждый нужный пункт, лишнее не нажимайте.</p>',
    '<p>Жұмыста конц. HNO₃, 30 % NaOH және улы қорғасын(II) ацетаты қолданылады. Қорғаныс құралдарын киіп, тартпа шкафтың тартымын қосыңыз, апаттық қорғаныс құралдарын тауып, құрамында қорғасын бар қалдықтарға арналған ыдысты дайындаңыз. Әр қажетті тармақты басыңыз, артығын баспаңыз.</p>',
    '<p>This work uses conc. HNO₃, 30 % NaOH and toxic lead(II) acetate. Put on your protective equipment, switch on the fume hood, locate the emergency equipment and prepare the container for lead-containing waste. Tap every item you need and nothing else.</p>'),
  need: L('Выполните все нужные пункты', 'Барлық қажетті тармақтарды орындаңыз', 'Complete every required item'),
  scene: hoodScene,
  items: [
    { id: 'coat', label: L('Халат застёгнут', 'Халат түймеленген', 'Lab coat buttoned'), log: L('Надет и застёгнут хлопковый халат', 'Мақта мата халат киіліп, түймеленді', 'Cotton lab coat on and buttoned') },
    { id: 'gog', label: L('Защитные очки', 'Қорғаныс көзілдірігі', 'Safety goggles'), log: L('Надеты защитные очки', 'Қорғаныс көзілдірігі киілді', 'Safety goggles on') },
    { id: 'glv', label: L('Перчатки нитриловые', 'Нитрил қолғаптар', 'Nitrile gloves'), log: L('Надеты нитриловые перчатки (ацетат свинца, нингидрин, конц. HNO₃)', 'Нитрил қолғаптар киілді (қорғасын ацетаты, нингидрин, конц. HNO₃)', 'Nitrile gloves on (lead acetate, ninhydrin, conc. HNO₃)') },
    { id: 'hood', label: L('Включить тягу шкафа', 'Шкаф тартымын қосу', 'Switch on the fume hood'), log: L('Включена тяга вытяжного шкафа', 'Тартпа шкафтың тартымы қосылды', 'Fume hood switched on') },
    { id: 'eye', label: L('Найти фонтанчик для глаз', 'Көз жуатын фонтанды табу', 'Locate the eyewash station'), log: L('Найден фонтанчик для промывания глаз', 'Көз жуатын фонтан табылды', 'Eyewash station located') },
    { id: 'shw', label: L('Найти аварийный душ', 'Апаттық душты табу', 'Locate the safety shower'), log: L('Найден аварийный душ', 'Апаттық душ табылды', 'Safety shower located') },
    { id: 'ext', label: L('Найти огнетушитель', 'Өрт сөндіргішті табу', 'Locate the fire extinguisher'), log: L('Найден огнетушитель', 'Өрт сөндіргіш табылды', 'Fire extinguisher located') },
    { id: 'pbw', label: L('Ёмкость для отходов со свинцом', 'Қорғасын бар қалдықтарға арналған ыдыс', 'Container for lead waste'), log: L('Подготовлена отдельная ёмкость для свинецсодержащих отходов', 'Құрамында қорғасын бар қалдықтарға арналған бөлек ыдыс дайындалды', 'A separate container for lead-containing waste is ready') },
    { id: 'mouth', label: L('Набирать растворы в пипетку ртом — так быстрее', 'Ерітінділерді пипеткаға аузымен тарту — тезірек', 'Fill pipettes by mouth — it is quicker'),
      wrong: { severity: 'safety', text: L('попытка набирать раствор в пипетку ртом (правила ТБ, раздел 2)', 'ерітіндіні пипеткаға аузымен тарту әрекеті (ҚТ ережелері, 2-бөлім)', 'tried to fill a pipette by mouth (safety rules, section 2)'),
        whatif: L('Раствор ацетата свинца или 30 % щёлочи легко попадает в рот: отравление тяжёлым металлом или химический ожог. Растворы набирают только грушей или капельной пипеткой.', 'Қорғасын ацетатының немесе 30 % сілтінің ерітіндісі ауызға оңай түседі: ауыр металмен улану немесе химиялық күйік. Ерітінділерді тек алмұрт немесе тамшылатқыш пипетка арқылы тартады.', 'Lead acetate or 30 % alkali easily gets into the mouth: heavy-metal poisoning or a chemical burn. Solutions are drawn up only with a bulb or a dropping pipette.') } },
    { id: 'snack', label: L('Перекусить, пока греется баня', 'Монша қызғанша тамақтанып алу', 'Have a snack while the bath heats up'),
      wrong: { severity: 'safety', text: L('еда в лаборатории (п. 2.2 правил ТБ)', 'зертханада тамақтану (ҚТ ережелерінің 2.2-тармағы)', 'eating in the laboratory (safety rule 2.2)'),
        whatif: L('Еда и напитки в лаборатории запрещены: соли свинца и меди с перчаток и стола переходят на пищу.', 'Зертханада тамақ пен сусынға тыйым салынған: қорғасын мен мыс тұздары қолғаптан және үстелден тағамға ауысады.', 'Food and drink are forbidden in the lab: lead and copper salts pass from gloves and bench onto the food.') } },
  ],
};

const s1 = {
  type: 'pick', id: 'kit',
  title: L('Посуда и приборы', 'Ыдыстар мен құралдар', 'Glassware and equipment'),
  instr: L('<p>Все опыты работы — качественные пробы в пробирках. Возьмите с полки то, что понадобится (раздел 5 методички), и ничего лишнего.</p>',
    '<p>Жұмыстың барлық тәжірибелері — пробиркадағы сапалық сынамалар. Сөреден қажеттісін алыңыз (әдістеменің 5-бөлімі), артығын алмаңыз.</p>',
    '<p>All the experiments of this work are qualitative tests in test tubes. Take from the shelf what you will need (section 5 of the manual) and nothing extra.</p>'),
  need: L('Соберите нужный набор', 'Қажетті жиынтықты жинаңыз', 'Collect the right set'),
  shelf: ['test-tube', 'tube-rack', 'dropping-pipette', 'graduated-pipette', 'water-bath', 'hot-plate', 'funnel', 'filter-paper', 'glass-rod',
    { id: 'holder', label: L('Пробиркодержатель', 'Пробирка ұстағыш', 'Test-tube holder') },
    'rbf-50', 'reflux-condenser', 'sep-funnel', 'balance', 'mp-apparatus', 'polarimeter-tube', 'buchner'],
  take: ['test-tube', 'tube-rack', 'dropping-pipette', 'graduated-pipette', 'water-bath', 'hot-plate', 'funnel', 'filter-paper', 'glass-rod', 'holder'],
  hint1: L('Нужны: пробирки и штатив, чем отмерять капли и миллилитры, кипящая водяная баня и на чём её греть, чем фильтровать (опыт 6), чем перемешивать и чем держать пробирку при нагревании.', 'Қажет: пробиркалар мен штатив, тамшылар мен миллилитрлерді өлшейтін құрал, қайнап тұрған су моншасы және оны қыздыратын құрал, сүзетін құрал (6-тәжірибе), араластыратын және қыздыру кезінде пробирканы ұстайтын құрал.', 'You need: test tubes and a rack, something to measure drops and millilitres, a boiling water bath and something to heat it on, something to filter with (exp. 6), something to stir with and something to hold a tube while heating.'),
};

const s2 = {
  type: 'decide', id: 'egg',
  title: L('Исследуемые растворы', 'Зерттелетін ерітінділер', 'Test solutions'),
  instr: L('<p>Для опытов нужны: раствор яичного белка, 1 % раствор желатина, 1 % раствор глицина. Желатин и глицин выданы готовыми. Раствор белка приготовьте сами по методичке.</p><p class="note">Яичный белок содержит глобулины, которые плохо растворимы в чистой воде.</p>',
    '<p>Тәжірибелерге қажет: жұмыртқа ақуызының ерітіндісі, 1 % желатин ерітіндісі, 1 % глицин ерітіндісі. Желатин мен глицин дайын күйінде берілген. Ақуыз ерітіндісін әдістеме бойынша өзіңіз дайындаңыз.</p><p class="note">Жұмыртқа ақуызында таза суда нашар еритін глобулиндер бар.</p>',
    '<p>The experiments need: egg white solution, 1 % gelatin solution and 1 % glycine solution. Gelatin and glycine are provided ready-made. Prepare the egg white solution yourself as in the manual.</p><p class="note">Egg white contains globulins, which are poorly soluble in pure water.</p>'),
  need: L('Приготовьте раствор белка', 'Ақуыз ерітіндісін дайындаңыз', 'Prepare the egg white solution'),
  question: L('Как приготовить раствор яичного белка?', 'Жұмыртқа ақуызының ерітіндісін қалай дайындайды?', 'How is the egg white solution prepared?'),
  options: [
    { id: 'ok', ok: true, label: L('Развести белок водой 1 : 10 и профильтровать через марлю', 'Ақуызды сумен 1 : 10 сұйылтып, дәке арқылы сүзу', 'Dilute the egg white 1 : 10 with water and filter through gauze'), advance: 600,
      effect(S) { S.egg = 'ok'; },
      log: L('Белок одного яйца разведён водой 1 : 10 и профильтрован через марлю', 'Бір жұмыртқаның ақуызы сумен 1 : 10 сұйылтылып, дәке арқылы сүзілді', 'The white of one egg was diluted 1 : 10 with water and filtered through gauze'),
      obs: L('Раствор белка прозрачный, слегка опалесцирующий; на марле остались хлопья и плёнки', 'Ақуыз ерітіндісі мөлдір, сәл опалесценцияланады; дәкеде үлпектер мен қабықшалар қалды', 'The egg white solution is clear and slightly opalescent; flakes and films remain on the gauze'),
      why: L('Так указано в разделе 5 методички: разбавление 1 : 10 и фильтрование через марлю.', 'Әдістеменің 5-бөлімінде солай көрсетілген: 1 : 10 сұйылту және дәке арқылы сүзу.', 'That is what section 5 of the manual says: dilute 1 : 10 and filter through gauze.') },
    { id: 'nofilter', ok: false, severity: 'major', label: L('Развести водой 1 : 10, хорошо взболтать и не фильтровать', 'Сумен 1 : 10 сұйылтып, жақсылап шайқап, сүзбеу', 'Dilute 1 : 10 with water, shake well and do not filter'), advance: 300,
      remark: L('раствор белка не профильтрован — мутный, с хлопьями глобулинов и плёнками', 'ақуыз ерітіндісі сүзілмеген — глобулин үлпектері мен қабықшалары бар лайлы ерітінді', 'egg white solution not filtered — turbid, with globulin flakes and films'),
      whatif: L('Глобулины в чистой воде выпадают хлопьями, плёнки белка остаются в растворе. Мутный раствор мешает различать окраску проб, а в опытах на осаждение белка осадок виден ещё до добавления реактива.', 'Глобулиндер таза суда үлпек болып тұнады, ақуыз қабықшалары ерітіндіде қалады. Лайлы ерітінді сынамалардың түсін ажыратуға кедергі келтіреді, ал ақуызды тұндыру тәжірибелерінде тұнба реактив қосылмай тұрып-ақ көрінеді.', 'Globulins come out as flakes in pure water and films of egg white stay in the solution. A turbid solution makes the colours of the tests hard to judge, and in the precipitation tests a precipitate is visible before any reagent is added.'),
      effect(S) { S.egg = 'nofilter'; },
      log: L('Белок разведён водой 1 : 10 и взболтан, раствор не фильтровали', 'Ақуыз сумен 1 : 10 сұйылтылып, шайқалды, ерітінді сүзілмеді', 'Egg white diluted 1 : 10 and shaken; the solution was not filtered'),
      obs: L('Раствор белка мутный, с белыми хлопьями и плёнками', 'Ақуыз ерітіндісі лайлы, ақ үлпектері мен қабықшалары бар', 'The egg white solution is turbid, with white flakes and films') },
    { id: 'conc', ok: false, severity: 'major', label: L('Взять неразбавленный белок — реакции будут ярче', 'Сұйылтылмаған ақуызды алу — реакциялар айқынырақ болады', 'Use undiluted egg white — the reactions will be brighter'), advance: 60,
      remark: L('взят неразбавленный белок вместо раствора 1 : 10', '1 : 10 ерітіндінің орнына сұйылтылмаған ақуыз алынды', 'undiluted egg white used instead of a 1 : 10 solution'),
      whatif: L('Неразбавленный белок вязкий, плохо смешивается с реактивами и при нагревании или добавлении кислоты сворачивается в сплошной сгусток: окраску внутри сгустка не видно, количества реактивов из методички рассчитаны на раствор 1 : 10.', 'Сұйылтылмаған ақуыз тұтқыр, реактивтермен нашар араласады, қыздырғанда немесе қышқыл қосқанда тұтас ұйындыға айналады: ұйынды ішіндегі түс көрінбейді, әдістемедегі реактив мөлшерлері 1 : 10 ерітіндіге есептелген.', 'Undiluted egg white is viscous, mixes poorly with the reagents and on heating or adding acid sets into a solid clot: the colour inside the clot cannot be seen, and the reagent amounts in the manual are for a 1 : 10 solution.'),
      effect(S) { S.egg = 'conc'; },
      log: L('Для опытов взят неразбавленный яичный белок', 'Тәжірибелерге сұйылтылмаған жұмыртқа ақуызы алынды', 'Undiluted egg white taken for the experiments'),
      obs: L('Неразбавленный белок — густая вязкая слегка желтоватая жидкость', 'Сұйылтылмаған ақуыз — қою тұтқыр сәл сарғыш сұйықтық', 'Undiluted egg white is a thick, viscous, slightly yellowish liquid') },
  ],
};

const upd = (t) => {
  const a = glycinate(t);
  t.v = (t.gly || 0) + (t.water || 0) + ((t.cu || 0) + (t.oh || 0)) * 0.05;
  t.color = a.color; t.ppt = a.ppt; t.pptColor = a.pptColor; t.key = a.key; t.dis = a.dissolved; t.hyd = a.hyd;
};
const orderCheck = (ctx, local) => {
  if (Object.values(local.tubes).some((x) => (x.gly || 0) + (x.water || 0) > 0)) ctx.remark({ key: 'e1order', severity: 'minor', text: L('нарушен порядок: глицин или воду прилили раньше, чем получили Cu(OH)₂', 'рет бұзылды: глицин немесе су Cu(OH)₂ алынғанға дейін құйылды', 'wrong order: glycine or water added before Cu(OH)₂ was prepared') });
};

const s3 = {
  type: 'test', id: 'chelate',
  title: L('Cu(OH)₂ и глицин', 'Cu(OH)₂ және глицин', 'Cu(OH)₂ and glycine'),
  instr: L('<ol><li>Получите немного Cu(OH)₂: смешайте <b>2–3 капли</b> 5 % CuSO₄ с <b>3–4 каплями</b> 10 % NaOH (голубой осадок). Сделайте это сразу в двух пробирках.</li><li>В пробирку 1 прилейте <b>1–2 мл</b> раствора глицина и встряхните.</li><li>Для сравнения в пробирку 2 прилейте <b>1–2 мл</b> воды и встряхните.</li></ol>',
    '<ol><li>Аздаған Cu(OH)₂ алыңыз: 5 % CuSO₄-тің <b>2–3 тамшысын</b> 10 % NaOH-тың <b>3–4 тамшысымен</b> араластырыңыз (көгілдір тұнба). Мұны бірден екі пробиркада жасаңыз.</li><li>1-пробиркаға <b>1–2 мл</b> глицин ерітіндісін құйып, шайқаңыз.</li><li>Салыстыру үшін 2-пробиркаға <b>1–2 мл</b> су құйып, шайқаңыз.</li></ol>',
    '<ol><li>Prepare a little Cu(OH)₂: mix <b>2–3 drops</b> of 5 % CuSO₄ with <b>3–4 drops</b> of 10 % NaOH (blue precipitate). Do this in two tubes at once.</li><li>To tube 1 add <b>1–2 mL</b> of glycine solution and shake.</li><li>For comparison, add <b>1–2 mL</b> of water to tube 2 and shake.</li></ol>'),
  need: L('Проведите пробу и запишите наблюдение', 'Сынаманы жүргізіп, бақылауды жазыңыз', 'Do the test and record the observation'),
  tubes: [{ id: 'g', label: L('1 · глицин', '1 · глицин', '1 · glycine') }, { id: 'w', label: L('2 · вода', '2 · су', '2 · water') }],
  reset: true,
  sceneBack: benchBack(['g', 'w']),
  reagents: [
    { id: 'cu', target: 'all', group: L('Cu(OH)₂ — сразу в обе пробирки', 'Cu(OH)₂ — бірден екі пробиркаға', 'Cu(OH)₂ — in both tubes at once'), label: L('CuSO₄ 5 %: +1 кап.', 'CuSO₄ 5 %: +1 тамшы', 'CuSO₄ 5 %: +1 drop'), advance: 5,
      apply(t, S, ctx, id, local) {
        if (id === 'g') orderCheck(ctx, local);
        t.cu = (t.cu || 0) + 1; upd(t);
        if (id === 'g' && t.cu === 6) ctx.feedback(L('Это уже вдвое больше, чем по методичке (2–3 капли). Избыток Cu²⁺ потребует больше глицина.', 'Бұл әдістемедегіден (2–3 тамшы) екі есе көп. Cu²⁺ артық болса, глицин көбірек қажет болады.', 'That is already twice the amount in the manual (2–3 drops). Excess Cu²⁺ needs more glycine.'), 'warn');
      } },
    { id: 'oh', target: 'all', group: L('Cu(OH)₂ — сразу в обе пробирки', 'Cu(OH)₂ — бірден екі пробиркаға', 'Cu(OH)₂ — in both tubes at once'), label: L('NaOH 10 %: +1 кап.', 'NaOH 10 %: +1 тамшы', 'NaOH 10 %: +1 drop'), advance: 5,
      apply(t, S, ctx, id, local) {
        if (id === 'g') orderCheck(ctx, local);
        t.oh = (t.oh || 0) + 1; upd(t);
        if (id === 'g' && t.oh === 1 && t.cu > 0) ctx.log(L('Выпал голубой студенистый осадок Cu(OH)₂', 'Cu(OH)₂ көгілдір қоймалжың тұнбасы түсті', 'A blue gelatinous precipitate of Cu(OH)₂ formed'), 'obs');
      } },
    { id: 'gly', group: L('В выбранную пробирку', 'Таңдалған пробиркаға', 'Into the selected tube'), label: L('Глицин 1 %: +0,5 мл', 'Глицин 1 %: +0,5 мл', 'Glycine 1 %: +0.5 mL'), advance: 15,
      apply(t, S, ctx, id) { t.gly = (t.gly || 0) + 0.5; t.shaken = false; upd(t); if (id === 'w') ctx.feedback(L('В контрольную пробирку прилит глицин — сравнивать будет не с чем.', 'Бақылау пробиркасына глицин құйылды — салыстыратын ештеңе болмайды.', 'Glycine has gone into the control tube — there will be nothing to compare with.'), 'warn'); } },
    { id: 'water', group: L('В выбранную пробирку', 'Таңдалған пробиркаға', 'Into the selected tube'), label: L('Вода дистиллированная: +0,5 мл', 'Дистилденген су: +0,5 мл', 'Distilled water: +0.5 mL'), advance: 15,
      apply(t) { t.water = (t.water || 0) + 0.5; t.shaken = false; upd(t); } },
    { id: 'shake', group: L('В выбранную пробирку', 'Таңдалған пробиркаға', 'Into the selected tube'), label: L('Встряхнуть', 'Шайқау', 'Shake'), advance: 20,
      apply(t) { t.shaken = true; upd(t); } },
    readyBtn((tubes) => {
      const g = tubes.g, w = tubes.w;
      if (!(g.hyd > 0 || (g.cu > 0 && g.oh > 0))) return L('Сначала получите Cu(OH)₂ в обеих пробирках.', 'Алдымен екі пробиркада да Cu(OH)₂ алыңыз.', 'First prepare Cu(OH)₂ in both tubes.');
      if ((g.gly || 0) < 1 || (w.water || 0) + (w.gly || 0) < 1) return L('Прилейте 1–2 мл глицина в пробирку 1 и 1–2 мл воды в пробирку 2.', '1-пробиркаға 1–2 мл глицин, 2-пробиркаға 1–2 мл су құйыңыз.', 'Add 1–2 mL of glycine to tube 1 and 1–2 mL of water to tube 2.');
      if (!g.shaken || !w.shaken) return L('Встряхните обе пробирки.', 'Екі пробирканы да шайқаңыз.', 'Shake both tubes.');
      return null;
    }),
  ],
  done: (tubes, S, local) => !!local.ready,
  observe: {
    question: L('Что вы наблюдаете в пробирках 1 и 2?', '1 және 2-пробиркаларда не байқайсыз?', 'What do you observe in tubes 1 and 2?'),
    options: [
      { id: 'ok', label: L('1: осадок растворился, тёмно-синий раствор; 2: голубой осадок не изменился', '1: тұнба еріді, қою көк ерітінді; 2: көгілдір тұнба өзгерген жоқ', '1: the precipitate dissolved, dark-blue solution; 2: the blue precipitate is unchanged'),
        log: L('Пробирка 1 (глицин): голубой осадок Cu(OH)₂ растворился, образовался тёмно-синий раствор глицината меди(II). Пробирка 2 (вода): голубой осадок не изменился', '1-пробирка (глицин): Cu(OH)₂ көгілдір тұнбасы еріп, мыс(II) глицинатының қою көк ерітіндісі түзілді. 2-пробирка (су): көгілдір тұнба өзгерген жоқ', 'Tube 1 (glycine): the blue Cu(OH)₂ precipitate dissolved to give a dark-blue solution of copper(II) glycinate. Tube 2 (water): the blue precipitate is unchanged') },
      { id: 'partial', label: L('1: раствор посинел, но часть голубого осадка осталась; 2: без изменений', '1: ерітінді көгерді, бірақ көгілдір тұнбаның бір бөлігі қалды; 2: өзгеріссіз', '1: the solution turned blue but some blue precipitate remains; 2: no change'),
        log: (S, tb) => L(`Пробирка 1: раствор синий, но голубой осадок растворился не полностью (CuSO₄ — ${tb.g.cu} кап., глицин — ${n(tb.g.gly, 1)} мл). Пробирка 2: осадок без изменений`, `1-пробирка: ерітінді көк, бірақ көгілдір тұнба толық ерімеді (CuSO₄ — ${tb.g.cu} тамшы, глицин — ${n(tb.g.gly, 1)} мл). 2-пробирка: тұнба өзгеріссіз`, `Tube 1: blue solution, but the blue precipitate did not dissolve completely (CuSO₄ — ${tb.g.cu} drops, glycine — ${n(tb.g.gly, 1)} mL). Tube 2: precipitate unchanged`) },
      { id: 'both', label: L('Осадок растворился в обеих пробирках', 'Тұнба екі пробиркада да еріді', 'The precipitate dissolved in both tubes'),
        log: L('Осадок растворился в обеих пробирках — в контрольную пробирку попал глицин, сравнения нет', 'Тұнба екі пробиркада да еріді — бақылау пробиркасына глицин түсті, салыстыру жоқ', 'The precipitate dissolved in both tubes — glycine got into the control tube, there is no comparison') },
      { id: 'none', label: L('В обеих пробирках голубой осадок не изменился', 'Екі пробиркада да көгілдір тұнба өзгерген жоқ', 'The blue precipitate is unchanged in both tubes') },
    ],
    correct: (S, tb) => ((tb.w.gly || 0) > 0 ? 'both' : tb.g.key === 'dissolved' ? 'ok' : tb.g.key === 'partial' ? 'partial' : 'none'),
    why: (S, tb) => ((tb.w.gly || 0) > 0
      ? L('Глицин связал Cu²⁺ в обеих пробирках; контрольный опыт испорчен.', 'Глицин екі пробиркада да Cu²⁺-ты байланыстырды; бақылау тәжірибесі бұзылды.', 'Glycine bound Cu²⁺ in both tubes; the control is spoilt.')
      : tb.g.key === 'dissolved'
        ? L('Глицин — бидентатный лиганд (N аминогруппы и O карбоксилата): Cu(OH)₂ переходит в растворимый хелат (H₂N–CH₂–COO)₂Cu. Вода комплекса не образует.', 'Глицин — бидентатты лиганд (аминотоптың N және карбоксилаттың O атомдары): Cu(OH)₂ еритін (H₂N–CH₂–COO)₂Cu хелатына айналады. Су кешен түзбейді.', 'Glycine is a bidentate ligand (amino N and carboxylate O): Cu(OH)₂ turns into the soluble chelate (H₂N–CH₂–COO)₂Cu. Water forms no complex.')
        : L('На 1 Cu²⁺ нужно 2 молекулы глицина: при избытке CuSO₄ или малом объёме глицина часть Cu(OH)₂ остаётся в осадке.', '1 Cu²⁺-қа 2 глицин молекуласы қажет: CuSO₄ артық болса немесе глицин аз болса, Cu(OH)₂-нің бір бөлігі тұнбада қалады.', 'One Cu²⁺ needs two glycine molecules: with excess CuSO₄ or too little glycine some Cu(OH)₂ stays undissolved.')),
  },
  onDone(S, tb, ctx) {
    const g = tb.g;
    S.e1 = { cu: g.cu || 0, oh: g.oh || 0, gly: g.gly || 0, key: (tb.w.gly || 0) > 0 ? 'both' : g.key };
    if ((tb.w.gly || 0) > 0) ctx.remark({ key: 'e1ctrl', severity: 'major', text: L('в контрольную пробирку добавлен глицин — опыт без контроля', 'бақылау пробиркасына глицин қосылды — тәжірибе бақылаусыз қалды', 'glycine added to the control tube — the experiment has no control') });
    else if (g.key !== 'dissolved') ctx.remark({ key: 'e1part', severity: 'major', text: L('избыток CuSO₄ или мало глицина — осадок Cu(OH)₂ растворился не полностью', 'CuSO₄ артық немесе глицин аз — Cu(OH)₂ тұнбасы толық ерімеді', 'excess CuSO₄ or too little glycine — the Cu(OH)₂ precipitate did not dissolve completely') });
    ctx.log(L(`Взято: 5 % CuSO₄ — ${g.cu} кап., 10 % NaOH — ${g.oh} кап. (в каждую пробирку), глицин 1 % — ${n(g.gly, 1)} мл`, `Алынды: 5 % CuSO₄ — ${g.cu} тамшы, 10 % NaOH — ${g.oh} тамшы (әр пробиркаға), 1 % глицин — ${n(g.gly, 1)} мл`, `Used: 5 % CuSO₄ — ${g.cu} drops, 10 % NaOH — ${g.oh} drops (each tube), 1 % glycine — ${n(g.gly, 1)} mL`), 'calc');
  },
  hint1: L('Сначала Cu(OH)₂ в обеих пробирках (CuSO₄, затем NaOH), потом глицин — в первую, вода — во вторую, и встряхнуть.', 'Алдымен екі пробиркада да Cu(OH)₂ (CuSO₄, содан кейін NaOH), содан кейін глицин — біріншіге, су — екіншіге, және шайқау.', 'First Cu(OH)₂ in both tubes (CuSO₄, then NaOH), then glycine into the first, water into the second, and shake.'),
  hint2: L('Количества: 2–3 капли CuSO₄, 3–4 капли NaOH, 1–2 мл глицина. Избыток CuSO₄ глицин не растворит.', 'Мөлшерлер: 2–3 тамшы CuSO₄, 3–4 тамшы NaOH, 1–2 мл глицин. CuSO₄ артық болса, глицин ерітпейді.', 'Amounts: 2–3 drops of CuSO₄, 3–4 drops of NaOH, 1–2 mL of glycine. Glycine will not dissolve excess CuSO₄.'),
  hint3: L('По 3 капли CuSO₄ и 4 капли NaOH (в обе), в пробирку 1 — 1,5 мл глицина, в пробирку 2 — 1,5 мл воды, встряхнуть обе, затем «записать наблюдение».', 'Екеуіне де 3 тамшы CuSO₄ және 4 тамшы NaOH, 1-пробиркаға — 1,5 мл глицин, 2-пробиркаға — 1,5 мл су, екеуін де шайқап, содан кейін «бақылауды жазу».', '3 drops of CuSO₄ and 4 drops of NaOH (both tubes), 1.5 mL of glycine into tube 1, 1.5 mL of water into tube 2, shake both, then “record the observation”.'),
};

const s4 = {
  type: 'quiz', id: 'q1',
  title: L('Строение глицината меди(II)', 'Мыс(II) глицинатының құрылысы', 'Structure of copper(II) glycinate'),
  instr: L('<p>Объясните результат опыта.</p>', '<p>Тәжірибе нәтижесін түсіндіріңіз.</p>', '<p>Explain the result of the experiment.</p>'),
  need: L('Ответьте на вопросы', 'Сұрақтарға жауап беріңіз', 'Answer the questions'),
  questions: [
    { q: L('К какому типу соединений относится глицинат меди(II)?', 'Мыс(II) глицинаты қосылыстардың қай түріне жатады?', 'What type of compound is copper(II) glycinate?'),
      options: [L('Хелатное (внутрикомплексное) соединение', 'Хелатты (ішкі кешенді) қосылыс', 'A chelate (inner complex) compound'), L('Простая соль меди и уксусной кислоты', 'Мыс пен сірке қышқылының қарапайым тұзы', 'A simple salt of copper and acetic acid'), L('Сложный эфир глицина', 'Глициннің күрделі эфирі', 'An ester of glycine'), L('Нерастворимый гидроксид', 'Ерімейтін гидроксид', 'An insoluble hydroxide')],
      correct: 0, why: L('Каждая молекула глицина связана с Cu²⁺ двумя атомами — образуются циклы (хелаты).', 'Әр глицин молекуласы Cu²⁺-пен екі атом арқылы байланысады — циклдар (хелаттар) түзіледі.', 'Each glycine molecule binds Cu²⁺ through two atoms, forming rings (chelates).') },
    { q: L('Какие атомы глицина координируют ион Cu²⁺?', 'Глициннің қандай атомдары Cu²⁺ ионын координациялайды?', 'Which atoms of glycine coordinate the Cu²⁺ ion?'),
      options: [L('N аминогруппы и O карбоксилат-иона', 'Аминотоптың N және карбоксилат-ионның O атомдары', 'The amino-group N and a carboxylate O'), L('Два атома O карбоксильной группы', 'Карбоксил тобының екі O атомы', 'Both carboxyl O atoms'), L('Атомы H метиленовой группы', 'Метилен тобының H атомдары', 'The H atoms of the CH₂ group'), L('Только N аминогруппы', 'Тек аминотоптың N атомы', 'Only the amino N')],
      correct: 0, why: L('Аминокислота — бидентатный лиганд: азот аминогруппы и кислород карбоксилата (раздел 6, принцип опыта 1).', 'Аминқышқылы — бидентатты лиганд: аминотоптың азоты және карбоксилаттың оттегі (6-бөлім, 1-тәжірибе принципі).', 'The amino acid is a bidentate ligand: amino nitrogen and carboxylate oxygen (section 6, principle of exp. 1).') },
    { q: L('Зачем во вторую пробирку прилили воду?', 'Екінші пробиркаға неге су құйылды?', 'Why was water added to the second tube?'),
      options: [L('Это контрольный опыт: показывает, что Cu(OH)₂ растворяется не от разбавления, а из-за глицина', 'Бұл бақылау тәжірибесі: Cu(OH)₂ сұйылтудан емес, глициннің әсерінен еритінін көрсетеді', 'It is a control: it shows that Cu(OH)₂ dissolves because of glycine, not because of dilution'), L('Чтобы смыть осадок', 'Тұнбаны шаю үшін', 'To wash the precipitate away'), L('Чтобы нейтрализовать щёлочь', 'Сілтіні бейтараптау үшін', 'To neutralise the alkali'), L('Чтобы ускорить реакцию', 'Реакцияны жылдамдату үшін', 'To speed up the reaction')],
      correct: 0, why: L('С водой осадок остаётся без изменений — так доказывается роль глицина.', 'Сумен тұнба өзгеріссіз қалады — глициннің рөлі осылай дәлелденеді.', 'With water the precipitate stays unchanged — this proves the role of glycine.') },
  ],
};

export default {
  id: '1',
  title: L('Образование глицината меди(II) (хелатный комплекс)', 'Мыс(II) глицинатының түзілуі (хелатты кешен)', 'Formation of copper(II) glycinate (chelate complex)'),
  principle: L('α-Аминокислоты — бидентатные лиганды (азот аминогруппы и кислород карбоксилата): с Cu²⁺ они образуют прочные интенсивно окрашенные хелатные комплексы.', 'α-Аминқышқылдары — бидентатты лигандтар (аминотоптың азоты және карбоксилаттың оттегі): Cu²⁺-пен берік, қарқынды боялған хелатты кешендер түзеді.', 'α-Amino acids act as bidentate ligands (amino nitrogen and carboxylate oxygen) and form stable, intensely coloured chelate complexes with Cu²⁺.'),
  equation: ['CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄', '2 H₂N–CH₂–COOH + Cu(OH)₂ → (H₂N–CH₂–COO)₂Cu + 2H₂O'],
  initialState: () => ({ egg: 'ok', e1: null }),
  checkpoints: [0, 3],
  steps: [s0, s1, s2, s3, s4],
  results: (S) => ({ egg: S.egg, ...(S.e1 || {}) }),
  summary: (r) => [
    { label: L('Раствор белка', 'Ақуыз ерітіндісі', 'Egg white solution'), value: r.egg === 'ok' ? L('1 : 10, фильтр.', '1 : 10, сүзілген', '1 : 10, filtered') : r.egg === 'nofilter' ? L('мутный', 'лайлы', 'turbid') : L('неразбавленный', 'сұйылтылмаған', 'undiluted'), st: r.egg === 'ok' ? 'ok' : 'warn' },
    { label: L('Глицин + Cu(OH)₂', 'Глицин + Cu(OH)₂', 'Glycine + Cu(OH)₂'), value: r.key === 'dissolved' ? L('тёмно-синий раствор', 'қою көк ерітінді', 'dark-blue solution') : L('осадок не растворился полностью', 'тұнба толық ерімеді', 'precipitate not fully dissolved'), st: r.key === 'dissolved' ? 'ok' : 'warn' },
  ],
};
