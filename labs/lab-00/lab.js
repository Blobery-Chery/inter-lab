/**
 * Вводное занятие (lab-00): техника безопасности и лабораторное оборудование. SPEC, раздел 18.
 * Источник: docs/source/safety-rules-ru.md (разделы 1–14), оборудование работ 6–15 (docs/labs.md, app/equipment.js),
 * приборы и приёмы из методички (docs/source/lab-manual-06-15-en.md).
 * Итоговый тест (≥ 30 вопросов, 10 случайных, порог 8) — это «допуск» работы: он уходит преподавателю как заявка
 * типа briefing и открывает работы 6–15. Запись в журнале инструктажа — в протоколе (индивидуальное задание).
 */
import { L, n } from '../../app/i18n.js';
import bank from './admission.js';
import exp1 from './exp1.js';
import exp2 from './exp2.js';
import exp3 from './exp3.js';
import exp4 from './exp4.js';
import exp5 from './exp5.js';
import exp6 from './exp6.js';
import exp7 from './exp7.js';
import { CATALOG } from './exp7.js';
import { acidVolumeFor, bicarbonateFor } from './model.js';

const SECTIONS = [
  ['1', L('Разделы 1–2', '1–2-бөлімдер', 'Sections 1–2')], ['2', L('Раздел 3', '3-бөлім', 'Section 3')], ['3', L('Разделы 4–6', '4–6-бөлімдер', 'Sections 4–6')],
  ['4', L('Разделы 7–9', '7–9-бөлімдер', 'Sections 7–9')], ['5', L('Раздел 10', '10-бөлім', 'Section 10')], ['6', L('Разделы 11–13', '11–13-бөлімдер', 'Sections 11–13')], ['7', L('Оборудование', 'Құрал-жабдықтар', 'Equipment')],
];
const STAGE = { 1: exp1, 2: exp2, 3: exp3, 4: exp4, 5: exp5, 6: exp6, 7: exp7 };

const remarksLine = (r) => L(`замечаний: ${r.remarks} (−${n(r.points, 2)} балла)${r.critical ? `, аварийных ситуаций: ${r.critical}` : ''}`, `ескертулер: ${r.remarks} (−${n(r.points, 2)} балл)${r.critical ? `, апаттық жағдайлар: ${r.critical}` : ''}`, `remarks: ${r.remarks} (−${n(r.points, 2)} points)${r.critical ? `, emergencies: ${r.critical}` : ''}`);

/* выводы по этапам — для протокола */
const CONCL = {
  1: [L('Нарушения раздела 2 найдены, средства аварийной защиты показаны; работа в одиночку и без инструктажа недопустима.', '2-бөлімнің бұзушылықтары табылды, апаттық қорғаныс құралдары көрсетілді; жалғыз және нұсқаулықсыз жұмыс істеуге болмайды.', 'The section 2 violations were found and the emergency equipment located; working alone or without a briefing is not allowed.')],
  2: [L('Студент одет по разделу 3: хлопковый застёгнутый халат, защитные очки, нитриловые перчатки, закрытая обувь; волосы убраны, шарф снят.', 'Студент 3-бөлімге сай киінді: түймеленген мақта мата халат, қорғаныс көзілдірігі, нитрил қолғап, жабық аяқ киім; шаш жиналған, шарф шешілген.', 'The student is dressed per section 3: buttoned cotton coat, goggles, nitrile gloves, closed shoes; hair tied back, scarf off.')],
  3: [L('Кислоту приливают в воду; летучие растворители — в вытяжном шкафу; ЛВЖ нагревают без огня; проливы нейтрализуют (кислота — NaHCO₃, щёлочь — разб. уксусная кислота).', 'Қышқылды суға құяды; ұшқыш еріткіштер — тартпа шкафта; тез тұтанатын сұйықтарды отсыз қыздырады; төгілулерді бейтараптайды (қышқыл — NaHCO₃, сілті — сұйылт. сірке қышқылы).', 'Acid goes into water; volatile solvents in the hood; flammable liquids heated without flames; spills neutralised (acid — NaHCO₃, alkali — dilute acetic acid).')],
  4: [L('Перед нагревом проверены прибор, шлифы, крепление; система открыта; кипелки — до нагрева; при неисправности прибор выключают и сообщают; повреждённое и горячее стекло — по правилам раздела 9.', 'Қыздыру алдында құрал, шлифтер, бекіту тексерілді; жүйе ашық; қайнату тастары — қыздыруға дейін; ақаулық болса құралды өшіріп, хабарлайды; зақымданған және ыстық шыны — 9-бөлім ережелері бойынша.', 'Before heating the device, joints and clamping were checked; the system is open; chips go in before heating; a faulty device is switched off and reported; damaged and hot glass is handled per section 9.')],
  5: [L('Кислые отходы нейтрализованы до pH ≈ 7, отходы рассортированы по видам, рабочее место убрано по п. 14.3.', 'Қышқыл қалдықтар pH ≈ 7-ге дейін бейтараптанды, қалдықтар түрлері бойынша сұрыпталды, жұмыс орны 14.3-тармақ бойынша жиналды.', 'Acidic waste neutralised to pH ≈ 7, waste sorted by kind, bench cleared per rule 14.3.')],
  6: [L('Очаг в стакане тушат без воды, горящую одежду — «остановиться, упасть, кататься» или душем; кожу и глаза промывают не менее 15 минут; о происшествиях сообщают преподавателю.', 'Стақандағы ошақты сусыз сөндіреді, жанып жатқан киімді — «тоқта, құла, домала» немесе душпен; тері мен көзді кемінде 15 минут жуады; оқиғалар туралы оқытушыға хабарлайды.', 'A beaker fire is put out without water, burning clothing by stop–drop–roll or the shower; skin and eyes are rinsed for at least 15 minutes; incidents are reported.')],
  7: [L('Посуда и приборы работ 6–15 узнаны; установки для кипячения с обратным холодильником и простой перегонки собраны и проверены, порядок фильтрования под вакуумом и работы с делительной воронкой усвоен.', '6–15-жұмыстардың ыдыстары мен құралдары танылды; кері мұздатқышпен қайнату және жай айдау қондырғылары жиналып, тексерілді, вакуумда сүзу және бөлгіш шұңғымамен жұмыс реті меңгерілді.', 'The glassware and instruments of labs 6–15 were identified; the reflux and simple distillation set-ups were assembled and tested; the order for vacuum filtration and the separating funnel was learnt.')],
};
function stageReports() {
  const out = {};
  for (const id of Object.keys(CONCL)) {
  out[id] = {
    calculations: id === '3' ? (r) => (r.w != null ? [L(`w(H₂SO₄) = 5 мл × 1.84 × 0.96 / (5 × 1.84 + 80) × 100 % = ${n(r.w, 1)} %`, `w(H₂SO₄) = 5 мл × 1.84 × 0.96 / (5 × 1.84 + 80) × 100 % = ${n(r.w, 1)} %`, `w(H₂SO₄) = 5 mL × 1.84 × 0.96 / (5 × 1.84 + 80) × 100 % = ${n(r.w, 1)} %`)] : [])
      : id === '5' ? (r) => [L(`m(NaHCO₃, теор.) = 0.050 моль × 84.01 г/моль = ${n(bicarbonateFor(50), 2)} г; израсходовано ${n(r.soda || 0, 0)} г; pH ≈ ${Math.round(r.pH || 7)}`, `m(NaHCO₃, теор.) = 0.050 моль × 84.01 г/моль = ${n(bicarbonateFor(50), 2)} г; жұмсалды ${n(r.soda || 0, 0)} г; pH ≈ ${Math.round(r.pH || 7)}`, `m(NaHCO₃, theor.) = 0.050 mol × 84.01 g/mol = ${n(bicarbonateFor(50), 2)} g; used ${n(r.soda || 0, 0)} g; pH ≈ ${Math.round(r.pH || 7)}`)] : undefined,
    conclusion: (r) => {
      const base = CONCL[id][0];
      if (!r.remarks) return base;
      const extra = remarksLine(r);
      return { ru: `${base.ru} Этап пройден с замечаниями — ${extra.ru}.`, kk: `${base.kk} Кезең ескертулермен өтті — ${extra.kk}.`, en: `${base.en} Stage completed with remarks — ${extra.en}.` };
    },
  };
}
  return out;
}

export default {
  id: 'lab-00', number: '00', status: 'ready',
  title: L('Техника безопасности и лабораторное оборудование', 'Қауіпсіздік техникасы және зертханалық құрал-жабдықтар', 'Lab safety and laboratory equipment'),
  topic: L('Вводное занятие: правила техники безопасности при проведении лабораторных занятий по дисциплине «Химия функциональных производных органических молекул» и оборудование работ 6–15.',
    'Кіріспе сабақ: «Органикалық молекулалардың функционалдық туындыларының химиясы» пәні бойынша зертханалық сабақтар өткізу кезіндегі қауіпсіздік техникасы ережелері және 6–15-жұмыстардың құрал-жабдықтары.',
    'Introductory session: safety rules for laboratory classes in “Chemistry of the Functional Derivatives of Organic Molecules” and the equipment of labs 6–15.'),
  aim: L('Изучить правила техники безопасности (разделы 1–14), научиться действовать в аварийных ситуациях и оказывать первую помощь, узнать посуду и приборы работ 6–15 и правильно собирать типовые установки; пройти итоговый тест и получить запись в журнале инструктажа — без неё к работам не допускают (п. 1.3).',
    'Қауіпсіздік техникасы ережелерін (1–14-бөлімдер) оқып-үйрену, апаттық жағдайларда әрекет етуді және алғашқы көмек көрсетуді үйрену, 6–15-жұмыстардың ыдыстары мен құралдарын тану және типтік қондырғыларды дұрыс жинау; қорытынды тесттен өтіп, нұсқаулық журналына жазылу — онсыз жұмыстарға жіберілмейді (1.3-тармақ).',
    'To learn the safety rules (sections 1–14), how to act in an emergency and give first aid, to recognise the glassware and instruments of labs 6–15 and assemble the standard set-ups correctly; to pass the final test and get the entry in the briefing log — without it no lab work is allowed (rule 1.3).'),
  relevance: L('Работы курса — это едкие кислоты и щёлочи, легковоспламеняющиеся растворители, нагрев, перегонка и вакуум. Почти все несчастные случаи в учебной лаборатории — следствие нарушения нескольких простых правил. Здесь можно ошибиться без вреда и увидеть, к чему ведёт каждая ошибка.',
    'Курс жұмыстары — күйдіргіш қышқылдар мен сілтілер, тез тұтанатын еріткіштер, қыздыру, айдау және вакуум. Оқу зертханасындағы жазатайым оқиғалардың барлығы дерлік бірнеше қарапайым ережені бұзудың салдары. Мұнда зиянсыз қателесіп, әр қатенің неге әкелетінін көруге болады.',
    'The labs in this course involve corrosive acids and alkalis, flammable solvents, heating, distillation and vacuum. Almost every accident in a teaching lab comes from breaking a few simple rules. Here you can make mistakes safely and see where each one leads.'),
  accent: { light: '#b45309', dark: '#fbbf24' },
  requires: [],
  /** Для финальной сессии: желательный порядок — сначала этапы 1–7, затем итоговый тест (см. ASSUMPTIONS.md). */
  admissionAfterExperiments: true,
  theory: [
    L('<b>1. Общие положения.</b> Правила обязательны для всех, кто работает в лаборатории. Реактивы курса — легковоспламеняющиеся, летучие, едкие, а иногда токсичные (спирты, фенолы, эфиры, альдегиды, кетоны, карбоновые кислоты и их производные, амины, галогенпроизводные). Без инструктажа с записью в журнале к работе не допускают (п. 1.3). Повторный инструктаж — перед занятием с новым классом реактивов или новым оборудованием (п. 1.4).',
      '<b>1. Жалпы ережелер.</b> Ережелер зертханада жұмыс істейтін барлық адамға міндетті. Курс реактивтері — тез тұтанатын, ұшқыш, күйдіргіш, кейде улы (спирттер, фенолдар, эфирлер, альдегидтер, кетондар, карбон қышқылдары және олардың туындылары, аминдер, галоген туындылары). Журналға жазылған нұсқаулықсыз жұмысқа жіберілмейді (1.3-тармақ). Қайталама нұсқаулық — реактивтердің жаңа класымен немесе жаңа жабдықпен сабақ алдында (1.4-тармақ).',
      '<b>1. General.</b> The rules apply to everyone working in the lab. The course reagents are flammable, volatile, corrosive and sometimes toxic (alcohols, phenols, ethers, aldehydes, ketones, carboxylic acids and their derivatives, amines, halogenated compounds). Nobody works without a briefing recorded in the log (rule 1.3). A repeat briefing is given before a class with a new class of reagents or new equipment (rule 1.4).'),
    L('<b>2. Поведение.</b> Работать только на своём месте и не оставлять его во время реакции или нагрева; не есть, не пить, не курить; убрать волосы, закрепить свободную одежду, снять шарфы и украшения; знать, где огнетушитель, аптечка, аварийный душ, фонтанчик для глаз, ящик с песком и запасные выходы; не пробовать реактивы на вкус и не набирать пипеткой ртом; не работать в одиночку при нагреве, перегонке ЛВЖ и с токсичными реактивами; не держать на столе сумки и книги.',
      '<b>2. Мінез-құлық.</b> Тек өз орныңда жұмыс істеу және реакция не қыздыру кезінде оны тастамау; тамақ ішпеу, сусын ішпеу, темекі шекпеу; шашты жинау, бос киімді бекіту, шарф пен әшекейлерді шешу; өрт сөндіргіш, алғашқы көмек қобдишасы, апаттық душ, көз жуатын фонтан, құм жәшігі және қосалқы шығу есіктері қай жерде екенін білу; реактивтердің дәмін татпау және пипеткамен аузымен тартпау; қыздыру, тез тұтанатын сұйықты айдау кезінде және улы реактивтермен жалғыз жұмыс істемеу; үстелде сөмке мен кітап ұстамау.',
      '<b>2. Conduct.</b> Work only at your own place and never leave it during a reaction or heating; no eating, drinking or smoking; tie back hair, secure loose clothing, remove scarves and jewellery; know where the extinguisher, first-aid kit, safety shower, eyewash, sand box and exits are; never taste reagents or pipette by mouth; never work alone when heating, distilling flammable solvents or using toxic reagents; keep bags and books off the bench.'),
    L('<b>3. СИЗ.</b> Застёгнутый хлопчатобумажный халат; защитные очки при любых операциях с реактивами (контактные линзы не рекомендуются); химически стойкие перчатки — с концентрированными кислотами и щелочами, галогенпроизводными, аминами, окислителями и восстановителями; закрытая обувь.',
      '<b>3. ЖҚҚ.</b> Түймеленген мақта мата халат; реактивтермен кез келген жұмыста қорғаныс көзілдірігі (контакт линзалары ұсынылмайды); концентрлі қышқылдар мен сілтілермен, галоген туындыларымен, аминдермен, тотықтырғыштар мен тотықсыздандырғыштармен — химиялық төзімді қолғап; жабық аяқ киім.',
      '<b>3. PPE.</b> A buttoned cotton lab coat; safety goggles for any work with reagents (contact lenses not recommended); chemical-resistant gloves for concentrated acids and alkalis, halogenated compounds, amines, oxidising and reducing agents; closed shoes.'),
    L('<b>4. Реактивы.</b> Перед работой изучить этикетку и паспорт безопасности; брать только нужное количество и не возвращать излишек в склянку; кислоту приливать в воду, медленно, при перемешивании — никогда не наоборот; летучие растворители и пахучие реактивы — только в вытяжном шкафу с опущенным экраном; не смешивать реактивы, не зная результата; галогенпроизводные, ароматические амины и фенолы — в перчатках и под тягой.',
      '<b>4. Реактивтер.</b> Жұмыс алдында этикетка мен қауіпсіздік паспортын оқу; тек қажетті мөлшерін алу және артығын құтыға қайтармау; қышқылды суға баяу, араластыра отырып құю — ешқашан керісінше емес; ұшқыш еріткіштер мен иісті реактивтер — тек экраны түсірілген тартпа шкафта; нәтижесін білмей реактивтерді араластырмау; галоген туындылары, ароматты аминдер мен фенолдар — қолғаппен және тартпа астында.',
      '<b>4. Reagents.</b> Read the label and safety data sheet first; take only what you need and never return the excess to the bottle; add acid to water, slowly, with stirring — never the other way round; volatile solvents and smelly reagents only in a fume hood with the sash lowered; never mix reagents without knowing the result; halogenated compounds, aromatic amines and phenols — gloves and hood.'),
    L('<b>5. ЛВЖ.</b> Хранить вдали от огня, искр и горячих поверхностей; нагревать только на водяной или масляной бане или в колбонагревателе — не на открытом пламени и не на голой спирали; перед нагревом проверить герметичность установки и добавить кипелки; не выливать эфир в раковину и не оставлять в открытых сосудах.',
      '<b>5. Тез тұтанатын сұйықтар.</b> Оттан, ұшқыннан және ыстық беттерден алыс сақтау; тек су немесе май моншасында не колба қыздырғышта қыздыру — ашық жалында және ашық спиральда емес; қыздыру алдында қондырғының саңылаусыздығын тексеріп, қайнату тастарын салу; эфирді раковинаға төкпеу және ашық ыдыста қалдырмау.',
      '<b>5. Flammable liquids.</b> Keep away from flames, sparks and hot surfaces; heat only on a water or oil bath or in a heating mantle — never over an open flame or bare coil; check the apparatus is tight and add boiling chips before heating; never pour ether down the sink or leave it in open vessels.'),
    L('<b>6. Кислоты и щёлочи.</b> Концентрированные кислоты и щёлочи переносят и разливают в вытяжном шкафу на поддоне; набирают только грушей или дозатором. Попадание на кожу — промывать проточной водой не менее 15 минут и сообщить преподавателю. Пролив кислоты нейтрализуют гидрокарбонатом натрия, щёлочи — разбавленной уксусной или лимонной кислотой, и только потом вытирают.',
      '<b>6. Қышқылдар мен сілтілер.</b> Концентрлі қышқылдар мен сілтілерді тартпа шкафта науада тасымалдап, құяды; тек алмұртпен немесе мөлшерлегішпен алады. Теріге тисе — кемінде 15 минут ағын сумен жуып, оқытушыға хабарлау. Төгілген қышқылды натрий гидрокарбонатымен, сілтіні сұйылтылған сірке немесе лимон қышқылымен бейтараптайды, содан кейін ғана сүртеді.',
      '<b>6. Acids and alkalis.</b> Concentrated acids and alkalis are carried and poured in the fume hood on a tray, and drawn up only with a bulb or dispenser. On the skin — rinse under running water for at least 15 minutes and tell the instructor. Acid spills are neutralised with sodium hydrogen carbonate, alkali spills with dilute acetic or citric acid, and only then wiped up.'),
    L('<b>7–8. Нагрев и электричество.</b> Перед включением проверить шнур, вилку и нагревательный элемент; нагревательные приборы не оставлять без присмотра; установки крепить на штативе, проверять шлифы; закрытую систему не нагревать — нужен открытый конец или обратный холодильник; открытое пламя — только с разрешения преподавателя и вдали от паров ЛВЖ. Не работать с электроприборами мокрыми руками и на мокром столе; искрящий или пахнущий прибор — сразу выключить и сообщить; перед чисткой — отключить от сети.',
      '<b>7–8. Қыздыру және электр.</b> Қосар алдында сымды, ашаны және қыздыру элементін тексеру; қыздыру құралдарын қараусыз қалдырмау; қондырғыларды штативке бекіту, шлифтерді тексеру; жабық жүйені қыздырмау — ашық ұш немесе кері мұздатқыш қажет; ашық жалын — тек оқытушының рұқсатымен және тез тұтанатын сұйық буларынан алыс. Электр құралдарымен дымқыл қолмен және дымқыл үстелде жұмыс істемеу; ұшқын шашқан немесе иіс шыққан құралды бірден өшіріп, хабарлау; тазалау алдында желіден ажырату.',
      '<b>7–8. Heating and electricity.</b> Check the cord, plug and element before switching on; never leave heaters unattended; clamp apparatus to a stand and check the joints; never heat a closed system — it needs an open end or a reflux condenser; open flames only with the instructor’s permission and away from flammable vapour. No electrical work with wet hands or on a wet bench; a sparking or smelling device is switched off and reported at once; unplug before cleaning.'),
    L('<b>9. Стекло.</b> Посуду с трещинами и сколами не использовать; стеклянную трубку или термометр вводить в пробку, смазав стекло, защитив руки тканью и держа трубку у места введения; бой стекла — только в ёмкость для боя стекла; горячую посуду остужать на термостойкой поверхности, брать щипцами или в термостойких перчатках.',
      '<b>9. Шыны.</b> Сызаты немесе қырылған жері бар ыдысты қолданбау; шыны түтікті немесе термометрді тығынға шыныны майлап, қолды матамен қорғап, түтікті енгізетін жерден ұстап енгізу; сынған шыны — тек сынған шыны ыдысына; ыстық ыдысты ыстыққа төзімді бетте суыту, қысқышпен немесе ыстыққа төзімді қолғаппен алу.',
      '<b>9. Glassware.</b> Never use cracked or chipped glassware; to push a tube or thermometer into a stopper, lubricate the glass, protect your hands with a cloth and hold the tube close to the stopper; broken glass goes only into the broken-glass container; let hot glassware cool on a heat-resistant surface and handle it with tongs or heat-resistant gloves.'),
    L('<b>10. Отходы.</b> Четыре вида — органические растворители, галогенсодержащие, водные кислотно-щелочные, твёрдые — каждый в свою промаркированную ёмкость. В раковину нельзя: органические растворители, галогенпроизводные, концентрированные кислоты и щёлочи. Кислые и щелочные водные отходы нейтрализуют до pH около 7.',
      '<b>10. Қалдықтар.</b> Төрт түрі — органикалық еріткіштер, құрамында галогені бар, сулы қышқыл-сілтілі, қатты — әрқайсысы өзінің таңбаланған ыдысына. Раковинаға болмайды: органикалық еріткіштер, галоген туындылары, концентрлі қышқылдар мен сілтілер. Қышқыл және сілтілі сулы қалдықтарды pH 7 шамасына дейін бейтараптайды.',
      '<b>10. Waste.</b> Four kinds — organic solvents, halogenated, aqueous acid/alkali, solid — each in its own labelled container. Never down the sink: organic solvents, halogenated compounds, concentrated acids and alkalis. Acidic and alkaline aqueous waste is neutralised to about pH 7.'),
    L('<b>11. Пожар.</b> Огнетушители для химических пожаров обычно углекислотные и порошковые; есть противопожарное одеяло. Небольшой очаг накрывают часовым стеклом, влажной тканью или одеялом — водой горящие органические растворители не тушат. Горит одежда — остановиться, упасть и кататься или под аварийный душ. Крупный пожар — эвакуация и оповещение.',
      '<b>11. Өрт.</b> Химиялық өрттерге арналған өрт сөндіргіштер әдетте көмірқышқыл және ұнтақ; өртке қарсы жамылғы бар. Шағын ошақты сағат шынысымен, дымқыл матамен немесе жамылғымен жабады — жанып жатқан органикалық еріткіштерді сумен сөндірмейді. Киім жанса — тоқтап, құлап, домалау немесе апаттық душқа. Ірі өрт — эвакуация және хабарлау.',
      '<b>11. Fire.</b> Chemical fires usually call for CO₂ or powder extinguishers; there is a fire blanket. A small fire is covered with a watch glass, a damp cloth or the blanket — water is never used on burning organic solvents. Clothing on fire — stop, drop and roll, or the safety shower. A large fire — evacuate and raise the alarm.'),
    L('<b>12–13. Первая помощь и экстренные ситуации.</b> Кожа — промыть водой не менее 15 минут, снять загрязнённую одежду. Глаза — у фонтанчика не менее 15 минут, веко открыто, затем врач. Пары — на свежий воздух, ослабить одежду. Проглатывание — не вызывать рвоту без указания врача, к врачу с этикеткой. Ожог — охладить проточной водой, без мазей и льда, прикрыть чистой тканью. О любом происшествии — сразу преподавателю. Пролив — предупредить окружающих, не дышать парами, комплект для проливов; запах газа — покинуть помещение и проветрить.',
      '<b>12–13. Алғашқы көмек және төтенше жағдайлар.</b> Тері — кемінде 15 минут сумен жуу, ластанған киімді шешу. Көз — фонтан жанында кемінде 15 минут, қабақ ашық, содан кейін дәрігер. Булар — таза ауаға, киімді босату. Жұтып қою — дәрігердің нұсқауынсыз құсуды шақырмау, этикеткамен дәрігерге. Күйік — ағын сумен салқындату, жақпа майсыз және мұзсыз, таза матамен жабу. Кез келген оқиға туралы — бірден оқытушыға. Төгілу — айналадағыларға ескерту, буларды жұтпау, төгілуге арналған жиынтық; газ иісі — бөлмеден шығып, желдету.',
      '<b>12–13. First aid and emergencies.</b> Skin — rinse with water for at least 15 minutes, remove contaminated clothing. Eyes — at the eyewash for at least 15 minutes, eyelid open, then a doctor. Vapour — fresh air, loosen clothing. Swallowed — no vomiting unless a doctor says so, to a doctor with the label. Burn — cool under running water, no ointment or ice, cover with a clean cloth. Report every incident to the instructor at once. Spill — warn others, avoid the vapour, use the spill kit; smell of gas — leave and ventilate.'),
    L('<b>14. Обязанности студента.</b> Каждый лично отвечает за безопасность своего места и сообщает о любой неисправности. После занятия: выключить приборы, закрыть и вернуть склянки, утилизировать отходы, убрать место, вымыть руки. Нарушение правил может повлечь отстранение до повторного инструктажа.',
      '<b>14. Студенттің міндеттері.</b> Әркім өз орнының қауіпсіздігіне жеке жауап береді және кез келген ақаулық туралы хабарлайды. Сабақтан кейін: құралдарды өшіру, құтыларды жауып, орнына қайтару, қалдықтарды кәдеге жарату, орынды жинау, қол жуу. Ережелерді бұзу қайталама нұсқаулыққа дейін шеттетуге әкелуі мүмкін.',
      '<b>14. Student duties.</b> Everyone is personally responsible for the safety of their own place and reports any fault. After the class: switch off equipment, close and return bottles, dispose of waste, clean the bench, wash hands. Breaking the rules may mean suspension until a repeat briefing.'),
  ],
  reagents: [
    { id: 'h2so4', name: L('Серная кислота конц.', 'Күкірт қышқылы конц.', 'Sulfuric acid, conc.'), formula: 'H₂SO₄', conc: L('96 %, d 1,84; 5 мл (разбавление)', '96 %, d 1,84; 5 мл (сұйылту)', '96 %, d 1.84; 5 mL (dilution)'), hazard: ['corrosive'] },
    { id: 'hcl', name: L('Кислые водные отходы', 'Қышқыл сулы қалдықтар', 'Acidic aqueous waste'), formula: 'HCl', conc: L('≈ 1 М, 50 мл', '≈ 1 М, 50 мл', '≈ 1 M, 50 mL'), hazard: ['corrosive'] },
    { id: 'nahco3', name: L('Гидрокарбонат натрия', 'Натрий гидрокарбонаты', 'Sodium hydrogen carbonate'), formula: 'NaHCO₃', conc: L('твёрдый, порции по 1 г', 'қатты, 1 г-нан порциялар', 'solid, 1 g portions'), hazard: [] },
    { id: 'naoh', name: L('Гидроксид натрия', 'Натрий гидроксиді', 'Sodium hydroxide'), formula: 'NaOH', conc: L('10 % раствор', '10 % ерітінді', '10 % solution'), hazard: ['corrosive'] },
    { id: 'acoh', name: L('Уксусная кислота разб.', 'Сірке қышқылы сұйылт.', 'Acetic acid, dilute'), formula: 'CH₃COOH', conc: L('для нейтрализации проливов щёлочи', 'сілті төгілгенде бейтараптауға', 'for neutralising alkali spills'), hazard: ['irritant'] },
    { id: 'ether', name: L('Диэтиловый эфир', 'Диэтил эфирі', 'Diethyl ether'), formula: '(C₂H₅)₂O', conc: L('т. кип. ≈ 35 °C', 'қайнау t ≈ 35 °C', 'b.p. ≈ 35 °C'), hazard: ['flammable'] },
    { id: 'etoh', name: L('Этанол', 'Этанол', 'Ethanol'), formula: 'C₂H₅OH', conc: L('30 мл, т. кип. 78 °C', '30 мл, қайнау t 78 °C', '30 mL, b.p. 78 °C'), hazard: ['flammable'] },
    { id: 'acetone', name: L('Ацетон', 'Ацетон', 'Acetone'), formula: '(CH₃)₂CO', conc: L('промывка посуды', 'ыдыс шаю', 'rinsing glassware'), hazard: ['flammable', 'irritant'] },
    { id: 'chcl3', name: L('Хлороформ', 'Хлороформ', 'Chloroform'), formula: 'CHCl₃', conc: L('галогенсодержащие отходы', 'құрамында галогені бар қалдықтар', 'halogenated waste'), hazard: ['toxic'] },
    { id: 'hno3', name: L('Азотная кислота конц.', 'Азот қышқылы конц.', 'Nitric acid, conc.'), formula: 'HNO₃', conc: L('пример окислителя', 'тотықтырғыштың мысалы', 'an example oxidiser'), hazard: ['corrosive', 'oxidiser'] },
  ],
  equipment: CATALOG.concat(['goggles', 'gloves', 'lab-coat', 'liebig-condenser', 'cylinder-50', 'beaker-150']).filter((x, i, a) => a.indexOf(x) === i),
  safety: [
    L('Халат застёгнут, защитные очки, по реактиву — перчатки, закрытая обувь, волосы убраны (разделы 2–3).', 'Халат түймеленген, қорғаныс көзілдірігі, реактивке қарай — қолғап, жабық аяқ киім, шаш жиналған (2–3-бөлімдер).', 'Coat buttoned, goggles, gloves as the reagent requires, closed shoes, hair tied back (sections 2–3).'),
    L('Кислоту — в воду, медленно, при перемешивании (п. 4.3).', 'Қышқылды — суға, баяу, араластыра отырып (4.3-тармақ).', 'Acid into water, slowly, with stirring (rule 4.3).'),
    L('ЛВЖ — без открытого огня; нагрев — баня или колбонагреватель (п. 5.2).', 'Тез тұтанатын сұйық — ашық отсыз; қыздыру — монша немесе колба қыздырғыш (5.2-тармақ).', 'No open flames near flammable liquids; heat with a bath or mantle (rule 5.2).'),
    L('Нагреваемая система всегда сообщается с атмосферой; кипелки — до нагрева (пп. 5.3, 7.4).', 'Қыздырылатын жүйе әрқашан атмосферамен қатынасады; қайнату тастары — қыздыруға дейін (5.3, 7.4-тармақтар).', 'A heated system is always open to the air; boiling chips before heating (rules 5.3, 7.4).'),
    L('Горящий растворитель водой не тушат — накрыть (п. 11.2).', 'Жанып жатқан еріткішті сумен сөндірмейді — жабу керек (11.2-тармақ).', 'Never use water on a burning solvent — smother it (rule 11.2).'),
    L('Кожа и глаза — промывать водой не менее 15 минут; о любом происшествии — преподавателю (раздел 12).', 'Тері мен көз — кемінде 15 минут сумен жуу; кез келген оқиға туралы — оқытушыға (12-бөлім).', 'Skin and eyes — rinse with water for at least 15 minutes; report every incident (section 12).'),
    L('Отходы — по четырём видам, бой стекла отдельно; в раковину — нельзя (разделы 9–10).', 'Қалдықтар — төрт түрге, сынған шыны бөлек; раковинаға — болмайды (9–10-бөлімдер).', 'Waste in four kinds, broken glass separately; nothing down the sink (sections 9–10).'),
  ],
  admission: { pick: 10, pass: 8, bank },
  experiments: [exp1, exp2, exp3, exp4, exp5, exp6, exp7],
  customSteps: ['./steps/spot.js', './steps/dress.js', './steps/catalog.js'],

  report: {
    experiments: stageReports(),
    table: {
      columns: [L('Этап', 'Кезең', 'Stage'), L('Разделы правил', 'Ереже бөлімдері', 'Rules'), L('Замечаний', 'Ескертулер', 'Remarks'), L('Из них ТБ / аварийных', 'Оның ішінде ҚТ / апаттық', 'Of which safety / emergency'), L('Подсказок', 'Кеңестер', 'Hints'), L('Итог', 'Нәтиже', 'Result')],
      rows: (R) => SECTIONS.map(([id, sec]) => {
        const r = R[id];
        const e = STAGE[id];
        if (!r) return [e.title, sec, '—', '—', '—', L('не выполнен', 'орындалмады', 'not done')];
        return [e.title, sec, String(r.remarks), `${r.safety} / ${r.critical}`, String(r.hints), r.remarks ? L('с замечаниями', 'ескертулермен', 'with remarks') : L('без замечаний', 'ескертусіз', 'no remarks')];
      }),
    },
    assignment: [
      { id: 'acid', kind: 'calc', task: L('Сколько миллилитров концентрированной H₂SO₄ (96 %, d 1,84) нужно для приготовления 100 г 10 % раствора? Ответ — с точностью до 0,01 мл.', '100 г 10 % ерітінді дайындау үшін концентрлі H₂SO₄ (96 %, d 1,84) неше миллилитр қажет? Жауабы — 0,01 мл дәлдікпен.', 'How many millilitres of concentrated H₂SO₄ (96 %, d 1.84) are needed for 100 g of a 10 % solution? Answer to 0.01 mL.'), answer: () => acidVolumeFor(10, 100), unit: L('мл', 'мл', 'mL'), tol: 0.01, decimals: 2 },
      { id: 'soda', kind: 'calc', task: L('Сколько граммов NaHCO₃ (M = 84,01 г/моль) нужно, чтобы нейтрализовать 50 мл 1 М HCl?', '50 мл 1 М HCl-ды бейтараптау үшін неше грамм NaHCO₃ (M = 84,01 г/моль) қажет?', 'How many grams of NaHCO₃ (M = 84.01 g/mol) are needed to neutralise 50 mL of 1 M HCl?'), answer: () => bicarbonateFor(50), unit: L('г', 'г', 'g'), tol: 0.01, decimals: 2 },
      { id: 'dil', kind: 'order', task: L('Расставьте по порядку приготовление разбавленного раствора серной кислоты.', 'Күкірт қышқылының сұйылтылған ерітіндісін дайындауды ретімен орналастырыңыз.', 'Put the preparation of dilute sulfuric acid in order.'),
        items: [
          { id: 'a', label: L('Надеть халат, очки и перчатки; включить тягу', 'Халат, көзілдірік және қолғап кию; тартымды қосу', 'Put on coat, goggles and gloves; switch on the hood') },
          { id: 'b', label: L('Налить в стакан нужный объём воды', 'Стақанға қажетті көлемде су құю', 'Pour the required volume of water into a beaker') },
          { id: 'c', label: L('Приливать кислоту тонкой струйкой по стенке, перемешивая', 'Қышқылды жіңішке ағынмен қабырға бойымен араластыра отырып құю', 'Add the acid in a thin stream down the wall, stirring') },
          { id: 'd', label: L('Дать раствору остыть', 'Ерітіндінің суығанын күту', 'Let the solution cool') },
          { id: 'e', label: L('Перелить в склянку и подписать этикетку', 'Құтыға құйып, этикеткасын жазу', 'Transfer to a bottle and label it') },
        ] },
      { id: 'fire', kind: 'choice', task: L('В вытяжном шкафу загорелся эфир в колбе, пламя небольшое. Что сделать сначала?', 'Тартпа шкафтағы колбада эфир жанып кетті, жалын шағын. Алдымен не істеу керек?', 'Ether has caught fire in a flask in the fume hood; the flame is small. What first?'),
        options: [L('Накрыть горло колбы (часовым стеклом / влажной тканью), выключить нагрев', 'Колба мойнын жабу (сағат шынысымен / дымқыл матамен), қыздыруды өшіру', 'Cover the flask neck (watch glass / damp cloth) and switch off the heating'), L('Залить водой', 'Сумен құю', 'Pour water on it'), L('Вынести колбу из шкафа', 'Колбаны шкафтан алып шығу', 'Carry the flask out of the hood')], correct: 0,
        why: L('П. 11.2: перекрыть доступ воздуха; вода разбрызгивает горящий растворитель.', '11.2-тармақ: ауаның кіруін тоқтату; су жанып жатқан еріткішті шашыратады.', 'Rule 11.2: cut off the air; water splashes the burning solvent about.') },
      { id: 'eye', kind: 'choice', task: L('Брызги кислоты в глаз. Минимальное время промывания у фонтанчика:', 'Көзге қышқыл шашырады. Фонтан жанында жуудың ең аз уақыты:', 'Acid splashed into an eye. Minimum rinsing time at the eyewash:'),
        options: [L('1–2 минуты', '1–2 минут', '1–2 minutes'), L('5 минут', '5 минут', '5 minutes'), L('не менее 15 минут', 'кемінде 15 минут', 'at least 15 minutes')], correct: 2, why: L('П. 12.2.', '12.2-тармақ.', 'Rule 12.2.') },
      { id: 'journal', kind: 'text', task: L('Запись в журнале инструктажа. Напишите: «С правилами техники безопасности ознакомлен(а), обязуюсь выполнять», ваши ФИО и группу.', 'Нұсқаулық журналындағы жазба. Жазыңыз: «Қауіпсіздік техникасы ережелерімен таныстым, орындауға міндеттенемін», аты-жөніңіз бен тобыңыз.', 'Briefing log entry. Write: “I have read the safety rules and undertake to follow them”, followed by your full name and group.') },
    ],
  },
};

