/** Этап 1. Лаборатория глазами инспектора — разделы 1–2 правил ТБ (общие положения и поведение). */
import { L } from '../../app/i18n.js';
import { labRoom, bench, rbFlask, condenser, scene } from './scene.js';
import { stageResults } from './common.js';

/* объекты сцены лаборатории (координаты — scene.js, labRoom) */
const WALL = [
  { id: 'exit', x: 4, y: 24, w: 42, h: 176, name: L('запасной выход', 'қосалқы шығу есігі', 'emergency exit'), short: L('выход', 'шығу', 'exit'), rule: L('п. 2.4', '2.4-тармақ', 'rule 2.4'), where: L('дверь слева со знаком «ВЫХОД»', 'сол жақтағы «ШЫҒУ» белгісі бар есік', 'the door on the left with the EXIT sign'),
    text: L('Запасной выход: путь эвакуации при крупном пожаре (п. 11.4).', 'Қосалқы шығу есігі: ірі өрт кезіндегі эвакуация жолы (11.4-тармақ).', 'Emergency exit: the evacuation route in a major fire (rule 11.4).') },
  { id: 'shower', x: 50, y: 0, w: 28, h: 62, name: L('аварийный душ', 'апаттық душ', 'safety shower'), short: L('душ', 'душ', 'shower'), rule: L('п. 2.4', '2.4-тармақ', 'rule 2.4'), where: L('под потолком слева, с зелёной ручкой-тягой', 'сол жақта төбе астында, жасыл тартқышы бар', 'under the ceiling on the left, with a green pull handle'),
    text: L('Аварийный душ: при попадании реактива на тело и при возгорании одежды (п. 11.3).', 'Апаттық душ: реактив денеге тигенде және киім жанғанда (11.3-тармақ).', 'Safety shower: for chemicals on the body and for burning clothing (rule 11.3).') },
  { id: 'eyewash', x: 80, y: 20, w: 30, h: 42, name: L('фонтанчик для промывания глаз', 'көз жуатын фонтан', 'eyewash station'), short: L('для глаз', 'көзге', 'eyewash'), rule: L('п. 2.4', '2.4-тармақ', 'rule 2.4'), where: L('на стене, зелёный знак с глазом', 'қабырғада, көз бейнеленген жасыл белгі', 'on the wall, the green sign with an eye'),
    text: L('Фонтанчик для глаз: промывать не менее 15 минут, удерживая веко открытым (п. 12.2).', 'Көз жуатын фонтан: қабақты ашық ұстап, кемінде 15 минут жуу (12.2-тармақ).', 'Eyewash station: rinse for at least 15 minutes holding the eyelid open (rule 12.2).') },
  { id: 'ext', x: 112, y: 6, w: 28, h: 56, name: L('огнетушитель', 'өрт сөндіргіш', 'fire extinguisher'), short: L('огнетуш.', 'өрт сөнд.', 'extinguisher'), rule: L('п. 11.1', '11.1-тармақ', 'rule 11.1'), where: L('красный баллон на стене', 'қабырғадағы қызыл баллон', 'the red cylinder on the wall'),
    text: L('Огнетушитель: для химических пожаров обычно углекислотный или порошковый (п. 11.1).', 'Өрт сөндіргіш: химиялық өртке әдетте көмірқышқыл немесе ұнтақ сөндіргіш (11.1-тармақ).', 'Fire extinguisher: chemical fires usually need a CO₂ or powder extinguisher (rule 11.1).') },
  { id: 'blanket', x: 140, y: 8, w: 30, h: 42, name: L('противопожарное одеяло', 'өртке қарсы жамылғы', 'fire blanket'), short: L('одеяло', 'жамылғы', 'blanket'), rule: L('п. 11.1', '11.1-тармақ', 'rule 11.1'), where: L('красный футляр с надписью «ОДЕЯЛО»', '«ЖАМЫЛҒЫ» жазуы бар қызыл қап', 'the red case labelled BLANKET'),
    text: L('Противопожарное одеяло: накрыть небольшой очаг или горящую одежду (пп. 11.1–11.3).', 'Өртке қарсы жамылғы: шағын ошақты немесе жанып жатқан киімді жабу (11.1–11.3-тармақтар).', 'Fire blanket: to smother a small fire or burning clothing (rules 11.1–11.3).') },
  { id: 'aid', x: 172, y: 8, w: 36, h: 32, name: L('аптечка первой помощи', 'алғашқы көмек қобдишасы', 'first-aid kit'), short: L('аптечка', 'қобдиша', 'first aid'), rule: L('п. 2.4', '2.4-тармақ', 'rule 2.4'), where: L('белый ящик с зелёным крестом', 'жасыл айқышы бар ақ жәшік', 'the white box with a green cross'),
    text: L('Аптечка первой помощи: её место нужно знать до начала работы (п. 2.4).', 'Алғашқы көмек қобдишасы: оның орнын жұмыс басталғанға дейін білу керек (2.4-тармақ).', 'First-aid kit: know where it is before you start (rule 2.4).') },
  { id: 'sand', x: 4, y: 202, w: 42, h: 30, name: L('ящик с песком', 'құм салынған жәшік', 'sand box'), short: L('песок', 'құм', 'sand'), rule: L('п. 2.4', '2.4-тармақ', 'rule 2.4'), where: L('на полу у выхода, надпись «ПЕСОК»', 'шығу жанындағы еденде, «ҚҰМ» жазуы', 'on the floor by the exit, labelled SAND'),
    text: L('Ящик с песком: засыпать небольшой пролив или очаг на полу.', 'Құм салынған жәшік: еденге төгілген аз сұйықты немесе ошақты көму.', 'Sand box: for covering a small spill or fire on the floor.') },
  { id: 'hood', x: 284, y: 8, w: 72, h: 144, name: L('вытяжной шкаф', 'тартпа шкаф', 'fume hood'), short: L('шкаф', 'шкаф', 'hood'), rule: L('п. 4.4', '4.4-тармақ', 'rule 4.4'),
    text: L('Вытяжной шкаф: тяга включена, экран опущен до рабочего уровня — так и должно быть (п. 4.4).', 'Тартпа шкаф: тартым қосулы, экран жұмыс деңгейіне дейін түсірілген — солай болуы керек (4.4-тармақ).', 'Fume hood: airflow on, sash lowered to working height — exactly as it should be (rule 4.4).') },
  { id: 'waste', x: 288, y: 176, w: 66, h: 52, name: L('ёмкости для отходов', 'қалдық ыдыстары', 'waste containers'), short: L('отходы', 'қалдық', 'waste'), rule: L('п. 10.1', '10.1-тармақ', 'rule 10.1'),
    text: L('Промаркированные ёмкости для отходов по видам — это правильно (п. 10.1).', 'Түрлері бойынша таңбаланған қалдық ыдыстары — бұл дұрыс (10.1-тармақ).', 'Labelled waste containers sorted by type — that is correct (rule 10.1).') },
];

const BAD = [
  { id: 'bag', bad: true, x: 52, y: 100, w: 46, h: 52, name: L('рюкзак и книги на рабочем столе', 'жұмыс үстеліндегі рюкзак пен кітаптар', 'backpack and books on the bench'), rule: L('п. 2.7', '2.7-тармақ', 'rule 2.7'),
    text: L('Рабочее место должно быть свободно от сумок, книг и личных вещей.', 'Жұмыс орны сөмкелерден, кітаптардан және жеке заттардан бос болуы тиіс.', 'The workplace must be free of bags, books and personal belongings.'),
    whatif: L('Вещи мешают работать, их легко облить реактивом, а сумка может опрокинуть посуду. Личные вещи оставляют вне рабочей зоны.', 'Заттар жұмысқа кедергі келтіреді, оларға реактив оңай төгіледі, ал сөмке ыдысты құлатуы мүмкін. Жеке заттар жұмыс аймағынан тыс қалдырылады.', 'Belongings get in the way, are easily splashed with reagents, and a bag can knock glassware over. Personal items are kept outside the work area.') },
  { id: 'hair', bad: true, x: 100, y: 64, w: 46, h: 88, name: L('распущенные длинные волосы у плитки', 'плита жанындағы жайылған ұзын шаш', 'loose long hair next to the hot plate'), rule: L('п. 2.3', '2.3-тармақ', 'rule 2.3'),
    text: L('Длинные волосы должны быть убраны.', 'Ұзын шаш жиналуы тиіс.', 'Long hair must be tied back.'),
    whatif: L('Волосы свисают к горячей плитке и стакану: могут загореться, попасть в реактив или зацепиться за установку.', 'Шаш ыстық плита мен стақанға қарай салбырап тұр: жануы, реактивке тиюі немесе қондырғыға ілінуі мүмкін.', 'The hair hangs towards the hot plate and the beaker: it can catch fire, dip into the reagent or snag on the apparatus.') },
  { id: 'mouth', bad: true, x: 148, y: 64, w: 44, h: 88, name: L('набор жидкости пипеткой ртом', 'пипеткамен сұйықты аузымен тарту', 'mouth pipetting'), rule: L('п. 2.5', '2.5-тармақ', 'rule 2.5'),
    text: L('Нельзя набирать жидкость пипеткой ртом — только грушей или автоматической пипеткой.', 'Пипеткамен сұйықты аузымен тартуға болмайды — тек алмұртпен немесе автоматты пипеткамен.', 'Never pipette by mouth — use a bulb or an automatic pipette.'),
    whatif: L('Достаточно одного неосторожного вдоха — едкий или ядовитый раствор попадает в рот: химический ожог, отравление.', 'Бір абайсыз тыныс жеткілікті — күйдіргіш немесе улы ерітінді ауызға түседі: химиялық күйік, улану.', 'One careless breath is enough for a corrosive or toxic solution to reach the mouth: chemical burn, poisoning.') },
  { id: 'food', bad: true, x: 194, y: 120, w: 36, h: 32, name: L('чай и бутерброд на рабочем столе', 'жұмыс үстеліндегі шай мен бутерброд', 'tea and a sandwich on the bench'), rule: L('п. 2.2', '2.2-тармақ', 'rule 2.2'),
    text: L('Приём пищи и напитков, хранение продуктов в лаборатории запрещены.', 'Зертханада тамақ ішуге, сусын ішуге және азық-түлік сақтауға тыйым салынған.', 'Eating, drinking and storing food in the laboratory are forbidden.'),
    whatif: L('Пары и брызги реактивов оседают на еде, кружку легко перепутать со стаканом — так происходят отравления.', 'Реактив булары мен шашырандылары тамаққа қонады, кесені стақанмен шатастыру оңай — улану осылай болады.', 'Reagent vapour and splashes settle on food, and a mug is easily mistaken for a beaker — this is how poisonings happen.') },
  { id: 'alone', bad: true, x: 230, y: 48, w: 52, h: 104, name: L('нагрев оставлен без присмотра', 'қыздыру қараусыз қалдырылған', 'heating left unattended'), rule: L('пп. 2.1, 7.2', '2.1, 7.2-тармақтар', 'rules 2.1, 7.2'),
    text: L('Колба кипит в колбонагревателе, рядом никого нет. Нельзя оставлять рабочее место во время нагревания.', 'Колба колба қыздырғышта қайнап тұр, жанында ешкім жоқ. Қыздыру кезінде жұмыс орнын тастап кетуге болмайды.', 'The flask is boiling in the heating mantle and nobody is there. Never leave your workplace while something is heating.'),
    whatif: L('Без присмотра жидкость может выкипеть, перегреться и дать толчок, а пары — загореться. Заметить это вовремя некому.', 'Қараусыз сұйық қайнап кетуі, қызып кетіп лықсуы, ал булары жануы мүмкін. Мұны уақытында байқайтын ешкім жоқ.', 'Unattended, the liquid can boil dry, superheat and bump, and the vapour can ignite. Nobody is there to notice in time.') },
];

const sInspect = {
  type: 'lab00-spot', id: 'inspect', mode: 'violations',
  title: L('Найдите нарушения правил', 'Ереже бұзушылықтарын табыңыз', 'Find the rule violations'),
  instr: L('<p>Вы — инспектор по технике безопасности. В лаборатории идёт занятие. Нажимайте на стенде на всё, что нарушает раздел 2 правил ТБ (общие правила поведения). Безопасные объекты нажимать не нужно — частые «ложные тревоги» засчитываются как невнимательность.</p><p class="note">Нарушений пять.</p>',
    '<p>Сіз — қауіпсіздік техникасы жөніндегі инспекторсыз. Зертханада сабақ жүріп жатыр. Стендте ҚТ ережелерінің 2-бөлімін (жалпы мінез-құлық ережелері) бұзатынның бәрін басыңыз. Қауіпсіз нысандарды басудың қажеті жоқ — жиі «жалған дабыл» мұқияттылықтың жоқтығы ретінде есептеледі.</p><p class="note">Бұзушылық бесеу.</p>',
    '<p>You are the safety inspector. A class is in progress. Tap on the bench everything that breaks section 2 of the safety rules (general conduct). Do not tap safe objects — frequent “false alarms” count as carelessness.</p><p class="note">There are five violations.</p>'),
  need: L('Найдите все 5 нарушений', 'Барлық 5 бұзушылықты табыңыз', 'Find all 5 violations'),
  draw: () => labRoom({ people: true }),
  spots: [...BAD, ...WALL],
  label: L('Лаборатория во время занятия', 'Сабақ кезіндегі зертхана', 'The lab during a class'),
  doneText: L('Все нарушения найдены. Лаборант их устранил.', 'Барлық бұзушылық табылды. Зертханашы оларды жойды.', 'All violations found. The technician has dealt with them.'),
  onLeave(S, ctx) { ctx.log(L('Нарушения устранены: вещи убраны, волосы собраны, еда вынесена, пипетка с грушей, у нагрева дежурит студент', 'Бұзушылықтар жойылды: заттар жиналды, шаш жиналды, тамақ шығарылды, пипетка алмұртпен, қыздыру жанында студент кезекшілік етеді', 'Violations fixed: belongings removed, hair tied back, food taken out, pipette with a bulb, a student now watches the heating')); },
};

const sLocate = {
  type: 'lab00-spot', id: 'locate', mode: 'locate',
  title: L('Где средства аварийной защиты', 'Апаттық қорғаныс құралдары қай жерде', 'Where the emergency equipment is'),
  instr: L('<p>Перед любым экспериментом нужно знать, где огнетушитель, аптечка, аварийный душ, фонтанчик для промывания глаз, ящик с песком и запасной выход (п. 2.4), а также противопожарное одеяло (п. 11.1). Покажите каждый предмет на стенде — по очереди, как спросит панель.</p>',
    '<p>Кез келген эксперимент алдында өрт сөндіргіш, алғашқы көмек қобдишасы, апаттық душ, көз жуатын фонтан, құм салынған жәшік және қосалқы шығу есігі (2.4-тармақ), сондай-ақ өртке қарсы жамылғы (11.1-тармақ) қай жерде екенін білу керек. Әр затты панель сұрағандай кезекпен стендте көрсетіңіз.</p>',
    '<p>Before any experiment you must know where the fire extinguisher, first-aid kit, safety shower, eyewash station, sand box and emergency exit are (rule 2.4), and the fire blanket too (rule 11.1). Show each item on the bench, one at a time, as the panel asks.</p>'),
  need: L('Покажите все 7 средств', 'Барлық 7 құралды көрсетіңіз', 'Show all 7 items'),
  draw: () => labRoom({ people: false }),
  spots: WALL,
  find: ['ext', 'aid', 'shower', 'eyewash', 'sand', 'exit', 'blanket'],
  missLimit: 3,
  missRemark: L('не знает, где средства аварийной защиты (п. 2.4)', 'апаттық қорғаныс құралдарының орнын білмейді (2.4-тармақ)', 'does not know where the emergency equipment is (rule 2.4)'),
  label: L('Лаборатория: средства аварийной защиты', 'Зертхана: апаттық қорғаныс құралдары', 'The lab: emergency equipment'),
  doneText: L('Вы знаете, где всё находится.', 'Сіз бәрінің қай жерде екенін білесіз.', 'You know where everything is.'),
};

const sAlone = {
  type: 'decide', id: 'alone',
  title: L('Работа в одиночку', 'Жалғыз жұмыс істеу', 'Working alone'),
  instr: L('<p>Вечер, группа ушла. Вам осталось 40 минут: отогнать диэтиловый эфир на водяной бане. В лаборатории вы одни. Ваше решение?</p>',
    '<p>Кеш, топ кетіп қалды. Сізге 40 минут қалды: диэтил эфирін су моншасында айдап алу керек. Зертханада жалғызсыз. Сіздің шешіміңіз?</p>',
    '<p>It is evening and the group has gone. You have 40 minutes of work left: distilling off diethyl ether on a water bath. You are alone in the lab. Your decision?</p>'),
  need: L('Примите решение', 'Шешім қабылдаңыз', 'Make a decision'),
  scene: () => bench(rbFlask({ id: 'l0al', cx: 150, cy: 166, r: 26, frac: 0.4 }) + condenser({ cx: 150, by: 132, hh: 80, water: true }) + `<rect x="110" y="190" width="80" height="8" class="met"/>`, L('Перегонка эфира', 'Эфирді айдау', 'Distilling ether')),
  options: [
    { id: 'wait', ok: true, label: L('Отложить перегонку на следующее занятие и предупредить преподавателя', 'Айдауды келесі сабаққа қалдырып, оқытушыға ескерту', 'Postpone the distillation to the next class and tell the instructor'),
      why: L('Работать в одиночку при нагревании, перегонке ЛВЖ и с токсичными реактивами запрещено (п. 2.6).', 'Қыздыру, тез тұтанатын сұйықтарды айдау және улы реактивтермен жұмыс кезінде жалғыз жұмыс істеуге тыйым салынған (2.6-тармақ).', 'Working alone while heating, distilling flammable solvents or using toxic reagents is forbidden (rule 2.6).'),
      log: L('Перегонка эфира отложена: в лаборатории нельзя работать в одиночку (п. 2.6)', 'Эфирді айдау кейінге қалдырылды: зертханада жалғыз жұмыс істеуге болмайды (2.6-тармақ)', 'Ether distillation postponed: never work alone in the lab (rule 2.6)') },
    { id: 'go', ok: false, severity: 'safety', label: L('Перегнать быстро, пока никого нет — это всего 40 минут', 'Ешкім жоқта тез айдап алу — небәрі 40 минут', 'Do it quickly while nobody is around — it is only 40 minutes'),
      remark: L('собирался перегонять эфир в одиночку (п. 2.6)', 'эфирді жалғыз айдамақ болды (2.6-тармақ)', 'was going to distil ether alone (rule 2.6)'),
      whatif: L('Пары эфира тяжелее воздуха и легко воспламеняются. Если начнётся пожар или станет плохо от паров, помочь и вызвать помощь будет некому.', 'Эфир булары ауадан ауыр және оңай тұтанады. Өрт басталса немесе будан жағдайыңыз нашарласа, көмектесетін және көмек шақыратын ешкім болмайды.', 'Ether vapour is heavier than air and ignites easily. If a fire starts or the fumes make you ill, nobody is there to help or call for help.'), retry: true },
    { id: 'phone', ok: false, severity: 'safety', label: L('Включить перегонку и выйти позвонить, пока идёт отгонка', 'Айдауды қосып, ол жүріп жатқанда қоңырау шалуға шығу', 'Start the distillation and step out to make a phone call while it runs'),
      remark: L('собирался оставить перегонку без присмотра (пп. 2.1, 7.2)', 'айдауды қараусыз қалдырмақ болды (2.1, 7.2-тармақтар)', 'was going to leave a distillation unattended (rules 2.1, 7.2)'),
      whatif: L('Нагрев и перегонку нельзя оставлять без присмотра ни на минуту: приёмник переполнится, колба выкипит, пары эфира растекутся по столу.', 'Қыздыру мен айдауды бір минутқа да қараусыз қалдыруға болмайды: қабылдағыш толып кетеді, колба қайнап құрғайды, эфир булары үстелге жайылады.', 'Heating and distillation must never be left unattended even for a minute: the receiver overflows, the flask boils dry, ether vapour spreads over the bench.'), retry: true },
  ],
};

const sQuiz = {
  type: 'quiz', id: 'q1',
  title: L('Общие положения', 'Жалпы ережелер', 'General provisions'),
  instr: L('<p>Ответьте на вопросы по разделам 1–2 правил ТБ. Каждая ошибка — замечание.</p>', '<p>ҚТ ережелерінің 1–2-бөлімдері бойынша сұрақтарға жауап беріңіз. Әр қате — ескерту.</p>', '<p>Answer the questions on sections 1–2 of the safety rules. Every mistake is a remark.</p>'),
  need: L('Ответьте на все вопросы', 'Барлық сұраққа жауап беріңіз', 'Answer every question'),
  scene: () => scene(labRoom({ people: false })),
  questions: [
    { q: L('Студент не прошёл инструктаж по ТБ (нет записи в журнале инструктажа). Может ли он выполнять лабораторную работу?', 'Студент ҚТ бойынша нұсқаулықтан өтпеген (нұсқаулық журналында жазба жоқ). Ол зертханалық жұмысты орындай ала ма?', 'A student has not had the safety briefing (no entry in the briefing log). May they do the lab work?'),
      options: [L('Нет, к работе не допускается', 'Жоқ, жұмысқа жіберілмейді', 'No, they are not admitted'), L('Да, если работает рядом с опытным студентом', 'Иә, тәжірибелі студенттің жанында жұмыс істесе', 'Yes, if they work next to an experienced student'), L('Да, если прочитает правила дома', 'Иә, ережелерді үйде оқыса', 'Yes, if they read the rules at home')], correct: 0,
      why: L('П. 1.3: не прошедший инструктаж (с записью в журнале) к работе не допускается.', '1.3-тармақ: нұсқаулықтан өтпеген (журналда жазбасы бар) студент жұмысқа жіберілмейді.', 'Rule 1.3: anyone without the briefing (recorded in the log) is not admitted.') },
    { q: L('Когда проводят повторный (внеплановый) инструктаж?', 'Қайталама (жоспардан тыс) нұсқаулық қашан өткізіледі?', 'When is a repeat (unscheduled) briefing held?'),
      options: [L('Перед занятием с новым классом реактивов или новым видом оборудования (перегонка, обратный холодильник, вакуумное фильтрование…)', 'Реактивтердің жаңа класымен немесе жабдықтың жаңа түрімен (айдау, кері мұздатқыш, вакуумда сүзу…) сабақ алдында', 'Before a class with a new class of reagents or a new type of equipment (distillation, reflux condenser, vacuum filtration…)'), L('Только раз в год', 'Тек жылына бір рет', 'Only once a year'), L('Только после несчастного случая', 'Тек жазатайым оқиғадан кейін', 'Only after an accident')], correct: 0,
      why: L('П. 1.4.', '1.4-тармақ.', 'Rule 1.4.') },
    { q: L('Нужно определить, что во флаконе без этикетки. Как поступить?', 'Этикеткасы жоқ құтыда не бар екенін анықтау керек. Не істеу керек?', 'You need to find out what is in an unlabelled bottle. What do you do?'),
      options: [L('Не пробовать на вкус и не нюхать; сообщить преподавателю', 'Дәмін татпау және иіскемеу; оқытушыға хабарлау', 'Do not taste or sniff it; tell the instructor'), L('Попробовать капельку на язык', 'Тілге бір тамшы татып көру', 'Taste a tiny drop'), L('Набрать пипеткой ртом и посмотреть', 'Пипеткамен аузымен тартып қарау', 'Draw some up by mouth with a pipette and look')], correct: 0,
      why: L('П. 2.5: пробовать реактивы на вкус и набирать пипеткой ртом запрещено; п. 4.1 — реактив без этикетки не используют.', '2.5-тармақ: реактивтердің дәмін татуға және пипеткамен аузымен тартуға тыйым салынған; 4.1-тармақ — этикеткасыз реактив қолданылмайды.', 'Rule 2.5: never taste reagents or pipette by mouth; rule 4.1 — an unlabelled reagent is not used.') },
  ],
};

export default {
  id: '1',
  title: L('Лаборатория глазами инспектора', 'Зертхана инспектордың көзімен', 'The lab through an inspector’s eyes'),
  principle: L('Разделы 1–2 правил ТБ: допуск к работе, поведение в лаборатории, средства аварийной защиты.', 'ҚТ ережелерінің 1–2-бөлімдері: жұмысқа рұқсат, зертханадағы мінез-құлық, апаттық қорғаныс құралдары.', 'Safety rules, sections 1–2: admission to work, conduct in the lab, emergency equipment.'),
  equation: [],
  initialState: () => ({}),
  checkpoints: [0],
  steps: [sInspect, sLocate, sAlone, sQuiz],
  results: (S, run) => stageResults(run),
  summary: (r) => [{ label: L('Замечаний', 'Ескертулер', 'Remarks'), value: String(r.remarks), st: r.remarks ? 'warn' : 'ok' }],
};
