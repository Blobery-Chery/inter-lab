/**
 * Опыты 1 и 2: синтез н-бутилацетата и изобутилацетата (методичка, раздел 6). Опыт 2 выполняется «точно как опыт 1»
 * с 9,3 мл изобутанола и фракцией 114–119 °C, поэтому оба опыта собираются одной фабрикой makeSynthesis(kind).
 */
import { L, tr, n } from '../../app/i18n.js';
import { relax } from '../../app/instruments/thermal.js';
import {
  ALC, M, afterReflux, molAlc, theoretical, percentYield, orgVolume, liquidMass, vapourT, thermoShown, distRate,
  distil, addTo, purity, lossBreakdown, ensureOrg,
} from './model.js';
import { hoodScene, flaskRight, chargeScene, refluxApparatus, refluxScene, funnelScene, dryScene, distApparatus, distScene, thermoReadScene } from './scene.js';

/** Тройка строк из функции языка. */
const T3 = (f) => ({ ru: f('ru'), kk: f('kk'), en: f('en') });

export const NAMES = {
  n: {
    alc: L('н-бутанол', 'н-бутанол', 'n-butanol'), alcG: L('н-бутанола', 'н-бутанолды', 'n-butanol'),
    alcFull: L('н-бутанол (бутан-1-ол)', 'н-бутанол (бутан-1-ол)', 'n-butanol (butan-1-ol)'),
    ester: L('н-бутилацетат', 'н-бутилацетат', 'n-butyl acetate'), esterG: L('н-бутилацетата', 'н-бутилацетаттың', 'n-butyl acetate'),
    eq: 'CH₃COOH + CH₃CH₂CH₂CH₂OH ⇌ CH₃COOCH₂CH₂CH₂CH₃ + H₂O (H₂SO₄, t)',
  },
  i: {
    alc: L('изобутанол', 'изобутанол', 'isobutanol'), alcG: L('изобутанола', 'изобутанолды', 'isobutanol'),
    alcFull: L('изобутанол (2-метилпропан-1-ол)', 'изобутанол (2-метилпропан-1-ол)', 'isobutanol (2-methylpropan-1-ol)'),
    ester: L('изобутилацетат', 'изобутилацетат', 'isobutyl acetate'), esterG: L('изобутилацетата', 'изобутилацетаттың', 'isobutyl acetate'),
    eq: 'CH₃COOH + (CH₃)₂CHCH₂OH ⇌ CH₃COOCH₂CH(CH₃)₂ + H₂O (H₂SO₄, t)',
  },
};

const G = {
  heat: L('Колбонагреватель', 'Колба қыздырғыш', 'Heating mantle'),
  cond: L('Холодильник', 'Мұздатқыш', 'Condenser'),
  flask: L('Колба', 'Колба', 'Flask'),
  end: L('Завершение', 'Аяқтау', 'Finishing'),
  rec: L('Приёмник', 'Қабылдағыш', 'Receiver'),
};
const POWER = [[0, L('выкл.', 'өшірулі', 'off')], [1, L('слабо', 'әлсіз', 'low')], [2, L('средне', 'орташа', 'medium')], [3, L('сильно', 'қатты', 'high')]];
const min = (s) => ({ ru: n(s / 60, 0) + ' мин', kk: n(s / 60, 0) + ' мин', en: n(s / 60, 0) + ' min' });
const grams = (g, d = 2) => ({ ru: n(g, d) + ' г', kk: n(g, d) + ' г', en: n(g, d) + ' g' });

/* ------------------------------------------------------------------ тексты аварий */
const FIRE = L(
  'Открытое пламя рядом с парами бутанола, уксусной кислоты и эфира: пары вспыхнули у горла колбы. В реальной лаборатории это пожар в вытяжном шкафу: перекрывают газ, накрывают очаг противопожарным одеялом или тушат углекислотным огнетушителем — не водой (пп. 11.1, 11.2). ЛВЖ нагревают только колбонагревателем или на бане (п. 5.2). Смесь испорчена — синтез начинают заново.',
  'Бутанол, сірке қышқылы мен эфир буларының жанындағы ашық жалын: булар колба мойнында тұтанды. Нақты зертханада бұл тартпа шкафтағы өрт: газды жауып, ошақты өртке қарсы жамылғымен жабады немесе көмірқышқыл өрт сөндіргішпен сөндіреді — сумен емес (11.1, 11.2-тармақтар). ТТС-ты тек колба қыздырғышпен немесе моншада қыздырады (5.2-тармақ). Қоспа бүлінді — синтез қайта басталады.',
  'An open flame next to butanol, acetic acid and ester vapours: the vapours ignited at the neck of the flask. In a real lab this is a fire in the fume hood: the gas is shut off and the fire smothered with a fire blanket or a CO₂ extinguisher — never water (rules 11.1, 11.2). Flammable liquids are heated only with a heating mantle or a bath (rule 5.2). The mixture is spoilt — the synthesis starts again.');
const CLOSED = L(
  'Верх обратного холодильника закрыт пробкой: при кипячении пары не находят выхода, давление в колбе растёт — пробку выбивает или установка разрывается, горячая кислая смесь ЛВЖ выбрасывается наружу. При нагревании система должна сообщаться с атмосферой (п. 7.4). В реальной лаборатории нагрев немедленно выключают и сообщают преподавателю. Смесь потеряна — синтез начинают заново.',
  'Кері мұздатқыштың үсті тығынмен жабылған: қайнағанда булар шығатын жол таппай, колбадағы қысым өседі — тығын атылады немесе қондырғы жарылады, ыстық қышқыл ТТС қоспасы сыртқа шашырайды. Қыздырғанда жүйе атмосферамен байланысып тұруы тиіс (7.4-тармақ). Нақты зертханада қыздыруды бірден өшіріп, оқытушыға хабарлайды. Қоспа жоғалды — синтез қайта басталады.',
  'The top of the reflux condenser was stoppered: on boiling the vapour has nowhere to go and the pressure rises — the stopper blows out or the apparatus bursts and the hot acidic flammable mixture is thrown out. A heated system must be open to the atmosphere (rule 7.4). In a real lab the heating is switched off at once and the instructor told. The mixture is lost — the synthesis starts again.');
const HOTCHIPS = L(
  'Кипелки брошены в перегретую кипящую жидкость: на их порах мгновенно образуется масса пузырей пара, смесь вскипает «залпом» и выбрасывается из колбы — горячая кислая ЛВЖ на руках и в шкафу. Кипелки добавляют только в холодную жидкость; если их забыли — нагрев выключают, жидкости дают остыть ниже температуры кипения и лишь потом добавляют кипелки (раздел 7 методички, п. 5.3). Смесь потеряна — синтез начинают заново.',
  'Қайнату тастары қызып кеткен қайнап жатқан сұйыққа тасталды: олардың кеуектерінде лезде көп бу көпіршіктері түзіліп, қоспа «атылып» қайнап, колбадан шашырайды — ыстық қышқыл ТТС қолға және шкафқа тиеді. Қайнату тастарын тек суық сұйыққа салады; ұмытып кетсе — қыздыруды өшіріп, сұйықты қайнау температурасынан төмен суытып, содан кейін ғана салады (әдістеменің 7-бөлімі, 5.3-тармақ). Қоспа жоғалды — синтез қайта басталады.',
  'Boiling chips were dropped into a superheated boiling liquid: a mass of vapour bubbles forms on their pores at once, the liquid erupts and is thrown out of the flask — hot acidic flammable liquid on the hands and in the hood. Chips are added only to cold liquid; if they were forgotten, switch off the heat, let the liquid cool below its boiling point and only then add them (manual, section 7; rule 5.3). The mixture is lost — the synthesis starts again.');
const DRYNESS = L(
  'Перегонку довели досуха: в пустой горячей колбе перегревается и разлагается остаток (высококипящие примеси, следы кислоты), колба может треснуть, а пары ЛВЖ — вспыхнуть на раскалённом колбонагревателе. Методичка прямо запрещает: «никогда не перегоняйте досуха — останавливайте перегонку, пока в колбе остаётся немного жидкости». В реальной лаборатории нагрев выключают, колбе дают остыть, не трогая её. В тренажёре вы вернётесь к сборке установки для перегонки.',
  'Айдау құрғағанша жүргізілді: бос ыстық колбада қалдық (жоғары қайнайтын қоспалар, қышқыл іздері) қызып ыдырайды, колба жарылуы, ал ТТС булары қызған колба қыздырғышта тұтануы мүмкін. Әдістеме тікелей тыйым салады: «ешқашан құрғағанша айдамаңыз — колбада аздап сұйық қалғанда айдауды тоқтатыңыз». Нақты зертханада қыздыруды өшіріп, колбаны ұстамай суытады. Тренажерде айдау қондырғысын жинауға ораласыз.',
  'The distillation was taken to dryness: in the empty hot flask the residue (high-boiling impurities, traces of acid) overheats and decomposes, the flask may crack and flammable vapour may ignite on the hot mantle. The manual says plainly: “never distil to dryness — stop while a small residue remains in the flask”. In a real lab the heat is switched off and the flask left to cool untouched. In the simulator you return to assembling the distillation apparatus.');
const FIRE_D = L(
  'Перегонная колба с ЛВЖ на открытом пламени: пары эфира у шлифов и из приёмника вспыхнули. Нагревать ЛВЖ на открытом пламени запрещено (п. 5.2); в реальной лаборатории перекрывают газ и тушат очаг одеялом или углекислотным огнетушителем (пп. 11.1, 11.2). В тренажёре вы вернётесь к сборке установки.',
  'ТТС бар айдау колбасы ашық жалында: шлифтер мен қабылдағыштағы эфир булары тұтанды. ТТС-ты ашық жалында қыздыруға тыйым салынған (5.2-тармақ); нақты зертханада газды жауып, ошақты жамылғымен немесе көмірқышқыл өрт сөндіргішпен сөндіреді (11.1, 11.2-тармақтар). Тренажерде қондырғыны жинауға ораласыз.',
  'A distillation flask of flammable liquid over an open flame: ester vapour at the joints and from the receiver ignited. Heating flammable liquids over an open flame is forbidden (rule 5.2); in a real lab the gas is shut off and the fire smothered with a blanket or a CO₂ extinguisher (rules 11.1, 11.2). In the simulator you return to assembling the apparatus.');

/* ------------------------------------------------------------------ фабрика */
export function makeSynthesis(kind, opts = {}) {
  const C = ALC[kind], N = NAMES[kind];
  const nm = (k, l) => tr(N[k], l);
  const [lo, hi] = C.frac;

  /*
   * Подсказка 3 процессов — готовое решение с названиями кнопок дословно (SCHEMA.md). Шаги, которые можно сделать
   * только по прошествии времени (выключить нагрев после 45 мин, декантировать прозрачный эфир, сменить приёмник),
   * появляются в подсказке, когда для них пришло время; до этого подсказка говорит, чего ждать.
   * cur.* — последнее состояние шага (обновляется при каждой отрисовке показаний).
   */
  const cur = {};
  const chain = (items, tail) => T3((l) => items.map((x) => (l === 'en' ? `“${x.en}”` : `«${x[l]}»`)).join(' → ') + (tail ? ' ' + tail[l] : ''));
  const B = {
    water: { ru: 'Пустить воду в холодильник', kk: 'Мұздатқышқа су жіберу', en: 'Turn on the condenser water' },
    med: { ru: 'средне', kk: 'орташа', en: 'medium' },
    cool: { ru: 'Выключить нагрев, охладить колбу до комнатной температуры', kk: 'Қыздыруды өшіріп, колбаны бөлме температурасына дейін суыту', en: 'Switch off the heat and cool the flask to room temperature' },
    swirl: { ru: 'Время от времени взбалтывать', kk: 'Анда-санда шайқау', en: 'Swirl from time to time' },
    salt: { ru: 'Насыпать ≈ 0,5 г безводного Na₂SO₄', kk: '≈ 0,5 г сусыз Na₂SO₄ салу', en: 'Add ≈ 0.5 g of anhydrous Na₂SO₄' },
    decant: { ru: 'Декантировать в сухую перегонную колбу, осушитель оставить', kk: 'Кептіргішті қалдырып, құрғақ айдау колбасына декантациялау', en: 'Decant into the dry distillation flask, leaving the drying agent behind' },
    chip: { ru: 'Бросить в колбу кипелку', kk: 'Колбаға қайнату тасын салу', en: 'Drop a boiling chip into the flask' },
    recW: { ru: 'взвешенный', kk: 'өлшенген', en: 'pre-weighed' },
    stop: { ru: 'Прекратить перегонку: выключить нагрев, в колбе остаётся немного жидкости', kk: 'Айдауды тоқтату: қыздыруды өшіру, колбада аздап сұйық қалады', en: 'Stop the distillation: heat off, leaving a small residue in the flask' },
  };
  function refluxH3() {
    const R = cur.reflux && cur.reflux.S.reflux;
    if (R && R.started && R.t >= 2700) return chain([B.water, B.med, B.cool], { ru: '— кипение длится уже 45 мин.', kk: '— қайнау 45 минуттан асты.', en: '— the reflux has already lasted 45 min.' });
    const t = R ? n(R.t / 60, 0) : '0';
    return chain([B.water, B.med], { ru: `→ ускорьте ход времени и дождитесь 45 мин спокойного кипения (сейчас ${t} мин); затем выключите нагрев и охладите колбу.`, kk: `→ уақытты жылдамдатып, 45 мин баяу қайнауды күтіңіз (қазір ${t} мин); содан кейін қыздыруды өшіріп, колбаны суытыңыз.`, en: `→ speed up time and wait for 45 min of gentle reflux (now ${t} min); then switch off the heat and cool the flask.` });
  }
  function dryH3() {
    const D = cur.dry && cur.dry.S.dry;
    const g = D ? D.g : 0, clumped = D && D.water > 0.03 && D.bound >= 0.3 * g * 0.97;
    const adds = Math.max(2, Math.round(g / 0.5) + (clumped ? 1 : 0));
    const items = [B.swirl, ...Array(adds).fill(B.salt)];
    if (D && D.water <= 0.03 && D.t >= 600) return chain([...items, B.decant], { ru: '— жидкость прозрачная, прошло 10 мин.', kk: '— сұйық мөлдір, 10 мин өтті.', en: '— the liquid is clear and 10 min have passed.' });
    const t = D ? n(D.t / 60, 0) : '0';
    return chain(items, { ru: `→ ускорьте ход времени: сушите 10–15 мин, пока жидкость не станет прозрачной (сейчас ${t} мин); затем декантируйте, осушитель в колбу не переносите.`, kk: `→ уақытты жылдамдатыңыз: сұйық мөлдір болғанша 10–15 мин кептіріңіз (қазір ${t} мин); содан кейін декантациялаңыз, кептіргішті колбаға ауыстырмаңыз.`, en: `→ speed up time: dry for 10–15 min until the liquid is clear (now ${t} min); then decant, leaving the drying agent behind.` });
  }
  function distH3() {
    const D = cur.dist && cur.dist.S.dist;
    const items = [B.chip, B.water, B.med];
    const main = D && (D.rec === 'main' || (D.boiling && D.Th >= lo));
    if (main) items.push(B.recW);
    if (D && D.rec === 'main' && D.mainMass > 0.5 && (D.flaskMass < 1.0 || D.Th > hi)) items.push(B.stop);
    else return chain(items, main
      ? { ru: `→ собирайте фракцию ${lo}–${hi} °C; когда в колбе останется ≈ 1 мл или температура превысит ${hi} °C — прекратите перегонку.`, kk: `→ ${lo}–${hi} °C фракциясын жинаңыз; колбада ≈ 1 мл қалғанда немесе температура ${hi} °C-тан асқанда айдауды тоқтатыңыз.`, en: `→ collect the ${lo}–${hi} °C fraction; when ≈ 1 mL is left in the flask or the temperature exceeds ${hi} °C, stop the distillation.` }
      : { ru: `→ первые капли — в приёмник для головной фракции; когда термометр покажет ${lo} °C, переключите приёмник на взвешенный.`, kk: `→ алғашқы тамшылар — бастапқы фракция қабылдағышына; термометр ${lo} °C көрсеткенде, қабылдағышты өлшенгенге ауыстырыңыз.`, en: `→ the first drops go into the fore-run receiver; when the thermometer reads ${lo} °C, switch to the pre-weighed receiver.` });
    return chain(items);
  }

  const sPPE = {
    type: 'checklist', id: 'ppe',
    title: L('Рабочее место и средства защиты', 'Жұмыс орны және қорғаныс құралдары', 'Workplace and protective equipment'),
    instr: L('<p>Уксусная и серная кислоты едкие, бутанолы и эфиры — легковоспламеняющиеся жидкости (ЛВЖ). Подготовьте рабочее место в вытяжном шкафу: нажмите каждый нужный пункт. Лишнее не нажимайте.</p>',
      '<p>Сірке және күкірт қышқылдары күйдіргіш, бутанолдар мен эфирлер — тез тұтанатын сұйықтықтар (ТТС). Тартпа шкафта жұмыс орнын дайындаңыз: әр қажетті тармақты басыңыз. Артығын баспаңыз.</p>',
      '<p>Acetic and sulfuric acids are corrosive; butanols and esters are flammable liquids. Prepare your place in the fume hood: tap every item you need. Do not tap anything that is wrong.</p>'),
    need: L('Выполните все нужные пункты', 'Барлық қажетті тармақтарды орындаңыз', 'Complete every required item'),
    scene: hoodScene,
    items: [
      { id: 'coat', label: L('Хлопковый халат застёгнут', 'Мақта мата халат түймеленген', 'Cotton lab coat buttoned'), log: L('Надет и застёгнут хлопковый халат', 'Мақта мата халат киіліп, түймеленді', 'Cotton lab coat on and buttoned') },
      { id: 'gog', label: L('Защитные очки', 'Қорғаныс көзілдірігі', 'Safety goggles'), log: L('Надеты защитные очки', 'Қорғаныс көзілдірігі киілді', 'Safety goggles on') },
      { id: 'glv', label: L('Перчатки нитриловые', 'Нитрил қолғаптар', 'Nitrile gloves'), log: L('Надеты нитриловые перчатки', 'Нитрил қолғаптар киілді', 'Nitrile gloves on') },
      { id: 'hood', label: L('Включить тягу, опустить экран шкафа', 'Тартымды қосып, шкаф экранын түсіру', 'Switch on the hood, lower the sash'), log: L('Включена тяга вытяжного шкафа, экран опущен до рабочего уровня', 'Тартпа шкафтың тартымы қосылды, экран жұмыс деңгейіне түсірілді', 'Fume hood on, sash lowered to working height') },
      { id: 'flame', label: L('Убрать из шкафа спиртовку и спички — рядом будут ЛВЖ', 'Шкафтан спирт шамы мен сіріңкені алып тастау — жанында ТТС болады', 'Remove the spirit lamp and matches from the hood — flammable liquids will be used'), log: L('Источники открытого огня убраны с рабочего места (пп. 5.1, 7.5)', 'Ашық от көздері жұмыс орнынан алынды (5.1, 7.5-тармақтар)', 'Open flames removed from the workplace (rules 5.1, 7.5)') },
      { id: 'eye', label: L('Найти фонтанчик для глаз и аварийный душ', 'Көз жуатын фонтан мен апаттық душты табу', 'Locate the eyewash station and safety shower'), log: L('Найдены фонтанчик для промывания глаз и аварийный душ', 'Көз жуатын фонтан мен апаттық душ табылды', 'Eyewash station and safety shower located') },
      { id: 'ext', label: L('Найти огнетушитель и противопожарное одеяло', 'Өрт сөндіргіш пен өртке қарсы жамылғыны табу', 'Locate the fire extinguisher and fire blanket'), log: L('Найдены огнетушитель и противопожарное одеяло', 'Өрт сөндіргіш пен өртке қарсы жамылғы табылды', 'Fire extinguisher and fire blanket located') },
      { id: 'waste', label: L('Ёмкость для органических отходов', 'Органикалық қалдықтарға арналған ыдыс', 'Organic waste container'), log: L('Подготовлена ёмкость для органических отходов', 'Органикалық қалдықтарға арналған ыдыс дайындалды', 'Organic waste container ready') },
      { id: 'lamp', label: L('Зажечь спиртовку — пригодится для нагрева колбы', 'Спирт шамын жағу — колбаны қыздыруға керек болады', 'Light the spirit lamp — handy for heating the flask'),
        wrong: { severity: 'safety', text: L('открытое пламя рядом с ЛВЖ (пп. 5.1, 5.2 правил ТБ)', 'ТТС жанында ашық жалын (ҚТ ережелерінің 5.1, 5.2-тармақтары)', 'open flame next to flammable liquids (safety rules 5.1, 5.2)'),
          whatif: L('Пары бутанола и бутилацетата тяжелее воздуха, стелются по столу и вспыхивают от пламени на расстоянии. ЛВЖ нагревают только колбонагревателем или на бане.', 'Бутанол мен бутилацетат булары ауадан ауыр, үстел бетімен жайылып, алыстағы жалыннан тұтанады. ТТС-ты тек колба қыздырғышпен немесе моншада қыздырады.', 'Butanol and butyl acetate vapours are heavier than air, spread along the bench and ignite from a flame some distance away. Flammable liquids are heated only with a mantle or a bath.') } },
      { id: 'lens', label: L('Работать в контактных линзах вместо очков', 'Көзілдіріктің орнына контакт линзаларымен жұмыс істеу', 'Work in contact lenses instead of goggles'),
        wrong: { severity: 'safety', text: L('попытка работать в контактных линзах без защитных очков (п. 3.2 правил ТБ)', 'қорғаныс көзілдірігінсіз контакт линзаларымен жұмыс істеу әрекеті (ҚТ ережелерінің 3.2-тармағы)', 'tried to work in contact lenses without goggles (safety rule 3.2)'),
          whatif: L('Пары уксусной кислоты скапливаются под линзой, а брызги серной кислоты попадают прямо в глаз — тяжёлый химический ожог.', 'Сірке қышқылының булары линза астына жиналады, ал күкірт қышқылының шашырандылары тікелей көзге түседі — ауыр химиялық күйік.', 'Acetic acid vapour collects under the lens and sulfuric acid splashes go straight into the eye — a severe chemical burn.') } },
    ],
  };

  const sPick = {
    type: 'pick', id: 'kit',
    title: L('Посуда и приборы для синтеза', 'Синтезге арналған ыдыстар мен құралдар', 'Glassware and instruments for the synthesis'),
    instr: L('<p>Возьмите с полки всё, что понадобится для синтеза эфира (пп. 1–6 хода работы): кипячение с обратным холодильником, промывание, сушка и простая перегонка. Лишнее не берите.</p>',
      '<p>Сөреден эфир синтезіне қажеттінің бәрін алыңыз (жұмыс барысының 1–6-тармақтары): кері мұздатқышпен қайнату, жуу, кептіру және қарапайым айдау. Артығын алмаңыз.</p>',
      '<p>Take from the shelf everything needed for the ester synthesis (procedure steps 1–6): reflux, washing, drying and simple distillation. Do not take anything extra.</p>'),
    need: L('Соберите нужный набор', 'Қажетті жиынтықты жинаңыз', 'Collect the right set'),
    shelf: ['rbf-50', 'reflux-condenser', 'heating-mantle', 'boiling-chips', 'cylinder-10', 'cylinder-25', 'graduated-pipette', 'sep-funnel', 'conical-50', 'distill-flask', 'liebig-condenser', 'thermometer-250', 'stand', 'thermometer-100', 'buchner', 'filter-flask', 'ice-salt-bath', 'mp-apparatus', 'polarimeter-tube', 'beaker-250'],
    take: ['rbf-50', 'reflux-condenser', 'heating-mantle', 'boiling-chips', 'cylinder-10', 'cylinder-25', 'graduated-pipette', 'sep-funnel', 'conical-50', 'distill-flask', 'liebig-condenser', 'thermometer-250', 'stand'],
    hint1: L('Эфир кипит при 117–126 °C: подумайте, какой термометр подойдёт. Фильтровать и охлаждать льдом в этой работе ничего не нужно.', 'Эфир 117–126 °C-та қайнайды: қандай термометр сәйкес келетінін ойлаңыз. Бұл жұмыста ештеңені сүзу және мұзбен салқындату қажет емес.', 'The ester boils at 117–126 °C: think about which thermometer will do. Nothing needs to be filtered or cooled in ice in this work.'),
  };

  const sAlc = {
    type: 'measure', id: 'alc',
    title: T3((l) => ({ ru: `Отмерить ${nm('alc', l)}`, kk: `${nm('alc', l)} өлшеу`, en: `Measuring the ${nm('alc', l)}` })[l]),
    instr: T3((l) => ({
      ru: `<ol><li>Отмерьте мерным цилиндром <b>${n(C.V, 1)} мл (7,4 г, 0,10 моль)</b> ${nm('alcG', l)}.</li><li>Перелейте его в круглодонную колбу на 50 мл.</li></ol><p class="note">Бутанолы — ЛВЖ с раздражающими парами: работайте в шкафу, вдали от нагретых приборов. Излишек — в ёмкость для органических отходов, не в склянку.</p>`,
      kk: `<ol><li>Өлшегіш цилиндрмен <b>${n(C.V, 1)} мл (7,4 г, 0,10 моль)</b> ${nm('alc', l)} өлшеңіз.</li><li>Оны 50 мл дөңгелек түпті колбаға құйыңыз.</li></ol><p class="note">Бутанолдар — булары тітіркендіретін ТТС: шкафта, қызған құралдардан алыс жұмыс істеңіз. Артығы — склянкаға емес, органикалық қалдықтар ыдысына.</p>`,
      en: `<ol><li>Measure <b>${n(C.V, 1)} mL (7.4 g, 0.10 mol)</b> of ${nm('alc', l)} with a measuring cylinder.</li><li>Pour it into the 50 mL round-bottom flask.</li></ol><p class="note">Butanols are flammable liquids with irritating vapours: work in the hood, away from hot equipment. Excess goes to the organic waste, never back into the bottle.</p>`,
    })[l]),
    need: T3((l) => ({ ru: `Перелейте ${n(C.V, 1)} мл в колбу`, kk: `${n(C.V, 1)} мл колбаға құйыңыз`, en: `Pour ${n(C.V, 1)} mL into the flask` })[l]),
    measure: 'cylinder-10', reagent: N.alc, bottleSub: L('ЛВЖ', 'ТТС', 'flamm.'), target: C.V, tol: 0.2, onDeviation: 'consequence', deviationSeverity: 'minor', saveAs: 'vAlc',
    into: L('круглодонная колба 50 мл', 'дөңгелек түпті колба 50 мл', 'the 50 mL round-bottom flask'),
    sceneExtra: (S) => flaskRight(S),
  };

  const sAcid = {
    type: 'measure', id: 'acoh',
    title: L('Отмерить ледяную уксусную кислоту', 'Мұздай сірке қышқылын өлшеу', 'Measuring the glacial acetic acid'),
    instr: L('<ol><li>В вытяжном шкафу отмерьте цилиндром на 25 мл <b>11,5 мл (12,0 г, 0,20 моль)</b> ледяной уксусной кислоты — двукратный избыток.</li><li>Прилейте её к спирту в колбе.</li></ol><p class="note">Ледяная уксусная кислота едкая, её пары раздражают глаза и дыхательные пути.</p>',
      '<ol><li>Тартпа шкафта 25 мл цилиндрмен <b>11,5 мл (12,0 г, 0,20 моль)</b> мұздай сірке қышқылын өлшеңіз — екі есе артық мөлшер.</li><li>Оны колбадағы спиртке құйыңыз.</li></ol><p class="note">Мұздай сірке қышқылы күйдіргіш, оның булары көз бен тыныс жолдарын тітіркендіреді.</p>',
      '<ol><li>In the fume hood measure <b>11.5 mL (12.0 g, 0.20 mol)</b> of glacial acetic acid with the 25 mL cylinder — a twofold excess.</li><li>Add it to the alcohol in the flask.</li></ol><p class="note">Glacial acetic acid is corrosive; its vapour irritates the eyes and airways.</p>'),
    need: L('Прилейте 11,5 мл уксусной кислоты', '11,5 мл сірке қышқылын құйыңыз', 'Add 11.5 mL of acetic acid'),
    measure: 'cylinder-25', reagent: L('CH₃COOH', 'CH₃COOH', 'CH₃COOH'), bottleSub: L('ледяная', 'мұздай', 'glacial'), target: 11.5, tol: 0.5, onDeviation: 'consequence', deviationSeverity: 'major', deviationPoints: 1, saveAs: 'vAcid',
    into: L('круглодонная колба со спиртом', 'спирті бар дөңгелек түпті колба', 'the round-bottom flask with the alcohol'),
    sceneExtra: (S) => flaskRight(S),
  };

  const sCat = {
    type: 'process', id: 'cat', speeds: null,
    title: L('Катализатор и кипелки', 'Катализатор және қайнату тастары', 'Catalyst and boiling chips'),
    instr: L('<ol><li>Наберите градуированной пипеткой с грушей <b>0,5 мл</b> конц. H₂SO₄ (96–98 %).</li><li>Осторожно прибавьте кислоту к смеси, <b>вращая колбу</b>.</li><li>Добавьте <b>2–3 кипелки</b>.</li></ol><p class="note">Кипелки кладут в холодную жидкость — до начала нагревания.</p>',
      '<ol><li>Грушасы бар бөлікті пипеткамен <b>0,5 мл</b> конц. H₂SO₄ (96–98 %) алыңыз.</li><li>Қышқылды қоспаға <b>колбаны айналдыра отырып</b> абайлап қосыңыз.</li><li><b>2–3 қайнату тасын</b> салыңыз.</li></ol><p class="note">Қайнату тастарын суық сұйыққа — қыздыру басталғанға дейін салады.</p>',
      '<ol><li>Take up <b>0.5 mL</b> of conc. H₂SO₄ (96–98 %) with a graduated pipette and a bulb.</li><li>Add the acid carefully to the mixture <b>while swirling the flask</b>.</li><li>Add <b>2–3 boiling chips</b>.</li></ol><p class="note">Boiling chips go into the cold liquid — before heating starts.</p>'),
    need: L('Прибавьте H₂SO₄ и кипелки', 'H₂SO₄ пен қайнату тастарын қосыңыз', 'Add the H₂SO₄ and the boiling chips'),
    controls: [
      { kind: 'action', id: 'bulb', group: L('Пипетка 1 мл', 'Пипетка 1 мл', '1 mL pipette'), label: L('Набрать 0,5 мл H₂SO₄ пипеткой с грушей', 'Грушасы бар пипеткамен 0,5 мл H₂SO₄ алу', 'Take up 0.5 mL of H₂SO₄ with a pipette and bulb'), advance: 30, disabled: (S, lc) => !!lc.pip || S.cat > 0, do(S, lc) { lc.pip = 0.5; }, log: L('Пипеткой с резиновой грушей набрано 0,5 мл конц. H₂SO₄', 'Резеңке грушасы бар пипеткамен 0,5 мл конц. H₂SO₄ алынды', '0.5 mL of conc. H₂SO₄ taken up with a pipette and rubber bulb') },
      { kind: 'action', id: 'mouth', group: L('Пипетка 1 мл', 'Пипетка 1 мл', '1 mL pipette'), label: L('Набрать пипеткой ртом — быстрее', 'Пипеткамен аузымен алу — тезірек', 'Pipette it by mouth — quicker'), advance: 20, disabled: (S, lc) => !!lc.pip || S.cat > 0,
        do(S, lc, ctx) { lc.pip = 0.5; ctx.remark({ key: 'mouth', severity: 'safety', text: L('концентрированную кислоту набирали пипеткой ртом (пп. 2.5, 6.2 правил ТБ)', 'концентрлі қышқыл пипеткамен аузымен алынды (ҚТ ережелерінің 2.5, 6.2-тармақтары)', 'concentrated acid pipetted by mouth (safety rules 2.5, 6.2)'), whatif: L('Достаточно чуть сильнее втянуть — и концентрированная серная кислота попадает в рот: тяжёлый химический ожог слизистой. Набор ртом запрещён всегда — только груша или дозатор.', 'Сәл қаттырақ сорса болды — концентрлі күкірт қышқылы ауызға түседі: шырышты қабықтың ауыр химиялық күйігі. Аузымен алуға әрқашан тыйым салынған — тек груша немесе дозатор.', 'One slightly stronger suck and concentrated sulfuric acid is in your mouth — a severe chemical burn. Mouth pipetting is always forbidden: use a bulb or a dispenser.') }); } },
      { kind: 'action', id: 'slow', group: L('Прибавление', 'Қосу', 'Adding'), label: L('Прибавлять по каплям, вращая колбу', 'Колбаны айналдыра отырып тамшылатып қосу', 'Add dropwise while swirling the flask'), advance: 60, disabled: (S, lc) => !lc.pip || S.cat > 0,
        do(S, lc) { S.cat = lc.pip; lc.pip = 0; }, obs: L('Серная кислота прибавлена при перемешивании: смесь бесцветная, слегка разогрелась', 'Күкірт қышқылы араластыра отырып қосылды: қоспа түссіз, сәл жылыды', 'Sulfuric acid added with swirling: the mixture is colourless and has warmed slightly') },
      { kind: 'action', id: 'fast', group: L('Прибавление', 'Қосу', 'Adding'), label: L('Вылить кислоту сразу, без перемешивания', 'Қышқылды араластырмай бірден құю', 'Pour the acid in at once without swirling'), advance: 15, disabled: (S, lc) => !lc.pip || S.cat > 0,
        do(S, lc, ctx) { S.cat = lc.pip; lc.pip = 0; S.char = true; ctx.remark({ key: 'catfast', severity: 'minor', text: L('серная кислота влита сразу, без перемешивания — местный перегрев и обугливание', 'күкірт қышқылы араластырылмай бірден құйылды — жергілікті қызу және көмірлену', 'sulfuric acid poured in at once without swirling — local overheating and charring'), whatif: L('Тяжёлая серная кислота опускается на дно и там сильно разогревает смесь: появляются тёмные продукты обугливания и окисления спирта, которые потом окрашивают остаток в колбе и снижают чистоту эфира.', 'Ауыр күкірт қышқылы түбіне түсіп, сол жерде қоспаны қатты қыздырады: спирттің көмірлену және тотығу өнімдері пайда болып, кейін колбадағы қалдықты бояйды және эфирдің тазалығын төмендетеді.', 'The dense sulfuric acid sinks and strongly heats the mixture at the bottom: dark products of charring and oxidation of the alcohol appear, later colouring the residue and lowering the purity of the ester.') }); },
        obs: L('В месте падения кислоты смесь потемнела и разогрелась', 'Қышқыл түскен жерде қоспа қараңғыланып, қызды', 'Where the acid fell the mixture darkened and grew hot') },
      { kind: 'action', id: 'chips', group: L('Кипелки', 'Қайнату тастары', 'Boiling chips'), label: L('Бросить 2–3 кипелки', '2–3 қайнату тасын салу', 'Add 2–3 boiling chips'), advance: 10, do(S) { S.chips = true; }, log: L('В колбу добавлены 2–3 кипелки', 'Колбаға 2–3 қайнату тасы салынды', '2–3 boiling chips added to the flask') },
    ],
    readouts: (S, lc) => [
      { label: L('В пипетке', 'Пипеткада', 'In the pipette'), value: lc.pip ? { ru: n(lc.pip, 1) + ' мл', kk: n(lc.pip, 1) + ' мл', en: n(lc.pip, 1) + ' mL' } : '—' },
      { label: 'H₂SO₄', value: S.cat ? { ru: n(S.cat, 1) + ' мл', kk: n(S.cat, 1) + ' мл', en: n(S.cat, 1) + ' mL' } : '—', st: S.cat ? 'ok' : '' },
      { label: L('Кипелки', 'Қайнату тастары', 'Boiling chips'), value: S.chips ? L('есть', 'бар', 'in') : L('нет', 'жоқ', 'none'), st: S.chips ? 'ok' : '' },
    ],
    done: (S) => S.cat > 0 && { text: L('Катализатор прибавлен.', 'Катализатор қосылды.', 'The catalyst has been added.') },
    scene: chargeScene,
    hints: [
      L('Концентрированные кислоты набирают только грушей. Кислоту прибавляют медленно, перемешивая.', 'Концентрлі қышқылдарды тек грушамен алады. Қышқылды араластыра отырып баяу қосады.', 'Concentrated acids are pipetted only with a bulb. The acid is added slowly with swirling.'),
      L('Не забудьте кипелки: без них жидкость перегревается и кипит толчками.', 'Қайнату тастарын ұмытпаңыз: оларсыз сұйық қызып кетіп, серпіліп қайнайды.', 'Do not forget the boiling chips: without them the liquid superheats and bumps.'),
      L('«Набрать 0,5 мл H₂SO₄ пипеткой с грушей» → «Прибавлять по каплям, вращая колбу» → «Бросить 2–3 кипелки».', '«Грушасы бар пипеткамен 0,5 мл H₂SO₄ алу» → «Колбаны айналдыра отырып тамшылатып қосу» → «2–3 қайнату тасын салу».', '“Take up 0.5 mL of H₂SO₄ with a pipette and bulb” → “Add dropwise while swirling the flask” → “Add 2–3 boiling chips”.'),
    ],
  };

  const refluxParts = [
    { id: 'mantle', label: L('Колбонагреватель', 'Колба қыздырғыш', 'Heating mantle') },
    { id: 'burner', label: L('Газовая горелка', 'Газ жанарғысы', 'Gas burner') },
    { id: 'rbf', label: L('Круглодонная колба со смесью', 'Қоспасы бар дөңгелек түпті колба', 'Round-bottom flask with the mixture') },
    { id: 'conical', label: L('Коническая колба 50 мл', 'Конустық колба 50 мл', '50 mL conical flask') },
    { id: 'reflux', label: L('Обратный (шариковый) холодильник', 'Кері (шарлы) мұздатқыш', 'Reflux (bulb) condenser') },
    { id: 'tap', label: L('Шланг от водопроводного крана', 'Су құбыры шүмегінен шланг', 'Hose from the water tap') },
    { id: 'drain', label: L('Шланг в раковину (слив)', 'Раковинаға шланг (ағызу)', 'Hose to the sink (outlet)') },
    { id: 'stopper', label: L('Пробка', 'Тығын', 'Stopper') },
  ];
  const sAsmR = {
    type: 'assemble', id: 'asm-reflux',
    title: L('Сборка установки с обратным холодильником', 'Кері мұздатқышы бар қондырғыны жинау', 'Assembling the reflux apparatus'),
    instr: L('<p>Соберите установку для кипячения с обратным холодильником: выберите деталь и нажмите место, куда её поставить. Колбу и холодильник закрепляют лапками штатива (п. 7.3).</p><p class="note">Ошибка сборки проявится при нагревании.</p>',
      '<p>Кері мұздатқышпен қайнатуға арналған қондырғыны жинаңыз: бөлшекті таңдап, оны қоятын орынды басыңыз. Колба мен мұздатқышты штатив қысқыштарымен бекітеді (7.3-тармақ).</p><p class="note">Жинаудағы қате қыздырғанда байқалады.</p>',
      '<p>Assemble the apparatus for heating under reflux: choose a part and tap the place where it goes. The flask and condenser are held by stand clamps (rule 7.3).</p><p class="note">An assembly mistake will show up on heating.</p>'),
    need: L('Соберите установку', 'Қондырғыны жинаңыз', 'Assemble the apparatus'),
    parts: refluxParts,
    slots: [
      { id: 'heat', label: L('Нагрев', 'Қыздыру', 'Heating'), accepts: 'mantle', options: ['mantle', 'burner'], x: 180, y: 226 },
      { id: 'flask', label: L('Реакционная колба', 'Реакциялық колба', 'Reaction flask'), accepts: 'rbf', options: ['rbf', 'conical'], x: 180, y: 186 },
      { id: 'cond', label: L('Холодильник', 'Мұздатқыш', 'Condenser'), accepts: 'reflux', options: ['reflux', 'stopper'], x: 180, y: 70 },
      { id: 'win', label: L('Нижний штуцер', 'Төменгі штуцер', 'Lower inlet'), accepts: 'tap', options: ['tap', 'drain'], x: 292, y: 104 },
      { id: 'wout', label: L('Верхний штуцер', 'Жоғарғы штуцер', 'Upper outlet'), accepts: 'drain', options: ['drain', 'tap'], x: 292, y: 30 },
    ],
    base: (S, lc) => refluxApparatus({ place: { heat: lc.place.heat, flask: lc.place.flask === 'rbf' ? 'rbf' : lc.place.flask === 'conical' ? 'conical' : null, cond: lc.place.cond === 'reflux' ? 'reflux' : null, win: lc.place.win, wout: lc.place.wout } }),
    onDone(S, place) {
      S.app = {
        heat: place.heat === 'burner' ? 'burner' : place.heat === 'mantle' ? 'mantle' : 'none',
        flaskWrong: place.flask !== 'rbf', condWrong: place.cond !== 'reflux',
        waterTop: place.win === 'drain' && place.wout === 'tap',
        noWater: !((place.win === 'tap' && place.wout === 'drain') || (place.win === 'drain' && place.wout === 'tap')),
      };
    },
    hint1: L('Колба — на колбонагревателе; холодильник — вертикально над колбой; вода входит в холодильник снизу и выходит сверху, тогда рубашка заполнена целиком.', 'Колба — колба қыздырғышта; мұздатқыш — колбаның үстінде тік; су мұздатқышқа төменнен кіріп, жоғарыдан шығады, сонда қабы толығымен толады.', 'Flask on the heating mantle; condenser vertical above it; water enters the condenser at the bottom and leaves at the top so the jacket is completely full.'),
  };

  const sReflux = {
    type: 'process', id: 'reflux', speeds: [10, 30, 60],
    title: L('Кипячение с обратным холодильником', 'Кері мұздатқышпен қайнату', 'Heating under reflux'),
    instr: L('<ol><li>Пустите воду в холодильник.</li><li>Нагревайте смесь при <b>слабом кипении 45–60 минут</b>: кольцо конденсата должно стоять в нижней половине холодильника.</li><li>Затем выключите нагрев и охладите колбу до комнатной температуры.</li></ol><p class="note">Нагревательные приборы не оставляют без присмотра (п. 7.2).</p>',
      '<ol><li>Мұздатқышқа су жіберіңіз.</li><li>Қоспаны <b>45–60 минут әлсіз қайнауда</b> қыздырыңыз: конденсат сақинасы мұздатқыштың төменгі жартысында тұруы тиіс.</li><li>Содан кейін қыздыруды өшіріп, колбаны бөлме температурасына дейін суытыңыз.</li></ol><p class="note">Қыздыру құралдарын қараусыз қалдырмайды (7.2-тармақ).</p>',
      '<ol><li>Turn on the condenser water.</li><li>Heat the mixture at a <b>gentle boil for 45–60 minutes</b>: the ring of condensate should stay in the lower half of the condenser.</li><li>Then switch off the heat and let the flask cool to room temperature.</li></ol><p class="note">Heating equipment is never left unattended (rule 7.2).</p>'),
    need: L('Прокипятите 45–60 мин и охладите', '45–60 мин қайнатып, суытыңыз', 'Reflux for 45–60 min and cool'),
    setup(S, lc) { S.reflux = S.reflux && S.reflux.T != null ? S.reflux : { T: 22, Tb: C.Tmix, t: 0, vap: 0, bump: 0, water: false, stopper: false, started: false, cooled: false }; lc.ring = 0; },
    controls: [
      { kind: 'toggle', id: 'water', group: G.cond, label: L('Пустить воду в холодильник', 'Мұздатқышқа су жіберу', 'Turn on the condenser water'), labelOn: L('Вода идёт через холодильник', 'Су мұздатқыш арқылы өтуде', 'Water is flowing through the condenser'), disabled: (S) => S.reflux.cooled,
        onChange(S, lc, on) { S.reflux.water = on; } },
      { kind: 'seg', id: 'pow', group: G.heat, label: G.heat, options: POWER, default: 0,
        onChange(S, lc, v, ctx) {
          if (S.reflux.cooled) { if (v) { lc.c.pow = 0; ctx.rerender(); } return; }
          if (v > 0 && S.app.heat === 'burner') ctx.remark({ key: 'fire', severity: 'critical', text: L('ЛВЖ нагревали на открытом пламени горелки — пары вспыхнули', 'ТТС жанарғының ашық жалынында қыздырылды — булар тұтанды', 'flammable liquids heated over an open burner flame — the vapours ignited'), critical: { text: FIRE } });
          if (v > 0 && S.app.heat === 'none') { lc.c.pow = 0; ctx.rerender(); ctx.feedback(L('Под колбой нет нагревателя — установка собрана без колбонагревателя.', 'Колбаның астында қыздырғыш жоқ — қондырғы колба қыздырғышсыз жиналған.', 'There is no heater under the flask — the apparatus was assembled without a mantle.'), 'warn'); }
          if (v > 0 && !lc.logged) { lc.logged = 1; ctx.log(L('Включён колбонагреватель', 'Колба қыздырғыш қосылды', 'Heating mantle switched on')); }
        } },
      { kind: 'action', id: 'stopper', group: G.cond, label: L('Закрыть верх холодильника пробкой, чтобы пары не уходили', 'Булар кетпеуі үшін мұздатқыштың үстін тығынмен жабу', 'Stopper the top of the condenser so no vapour escapes'), disabled: (S) => S.reflux.cooled,
        do(S) { S.reflux.stopper = true; }, log: L('Верх обратного холодильника закрыт пробкой', 'Кері мұздатқыштың үсті тығынмен жабылды', 'The top of the reflux condenser stoppered') },
      { kind: 'action', id: 'leave', group: L('Наблюдение', 'Бақылау', 'Watching'), label: L('Отойти от установки, пока смесь кипит', 'Қоспа қайнап жатқанда қондырғыдан кету', 'Walk away from the apparatus while it boils'), disabled: (S) => !S.reflux.started || S.reflux.cooled,
        do(S, lc, ctx) { ctx.remark({ key: 'leave', severity: 'safety', text: L('работающий колбонагреватель с кипящей ЛВЖ оставлен без присмотра (п. 7.2 правил ТБ)', 'қайнап жатқан ТТС бар жұмыс істеп тұрған колба қыздырғыш қараусыз қалдырылды (ҚТ ережелерінің 7.2-тармағы)', 'a running heating mantle with boiling flammable liquid left unattended (safety rule 7.2)'), whatif: L('Пока вас нет, может прекратиться подача воды, начаться бурное кипение или треснуть колба — и некому выключить нагрев. Кипячение ЛВЖ требует постоянного присмотра.', 'Сіз жоқта су берілуі тоқтауы, қатты қайнау басталуы немесе колба жарылуы мүмкін — ал қыздыруды өшіретін ешкім жоқ. ТТС-ты қайнату үнемі қадағалауды талап етеді.', 'While you are away the water may stop, violent boiling may start or the flask may crack — and nobody is there to switch off the heat. Refluxing flammable liquids needs constant supervision.') }); } },
      { kind: 'action', id: 'cool', cls: 'pri', group: G.end, label: L('Выключить нагрев, охладить колбу до комнатной температуры', 'Қыздыруды өшіріп, колбаны бөлме температурасына дейін суыту', 'Switch off the heat and cool the flask to room temperature'), disabled: (S) => !S.reflux.started || S.reflux.cooled,
        do(S, lc, ctx) {
          const R = S.reflux;
          lc.c.pow = 0; R.cooled = true; ctx.advance(900); R.T = 24; lc.ring = 0;
          if (R.t < 2700) ctx.remark({ key: 'short', severity: 'minor', text: T3((l) => ({ ru: `кипячение короче 45 минут (${n(R.t / 60, 0)} мин) — равновесие не достигнуто, выход ниже`, kk: `қайнату 45 минуттан қысқа (${n(R.t / 60, 0)} мин) — тепе-теңдікке жетпеді, шығым төмен`, en: `reflux shorter than 45 minutes (${n(R.t / 60, 0)} min) — equilibrium not reached, lower yield` })[l]), whatif: L('Этерификация медленная даже с катализатором: за короткое время в смеси остаётся много непрореагировавшего спирта, и выход падает.', 'Этерификация катализатормен де баяу жүреді: қысқа уақытта қоспада көп әрекеттеспеген спирт қалады, шығым төмендейді.', 'Esterification is slow even with a catalyst: after a short time much unreacted alcohol remains and the yield drops.') });
          const res = afterReflux(S, kind);
          S.org = res.org; S.ledger = res.ledger; S.x = res.x; S.ratio = res.r;
          ctx.log(T3((l) => ({ ru: `Кипячение ${n(R.t / 60, 0)} мин; нагрев выключен, колба охлаждена до комнатной температуры. Смесь однородная, ${S.char ? 'светло-коричневая' : 'бесцветная'}, с фруктовым запахом`, kk: `Қайнату ${n(R.t / 60, 0)} мин; қыздыру өшірілді, колба бөлме температурасына дейін суытылды. Қоспа біртекті, ${S.char ? 'ашық қоңыр' : 'түссіз'}, жеміс иісі бар`, en: `Refluxed for ${n(R.t / 60, 0)} min; heat off, flask cooled to room temperature. The mixture is homogeneous, ${S.char ? 'light brown' : 'colourless'}, with a fruity odour` })[l]), 'obs');
        } },
    ],
    tick(S, lc, dt, ctx) {
      const R = S.reflux, p = lc.c.pow || 0;
      if (R.cooled) return;
      const k = S.app.flaskWrong ? 0.0035 : 0.007;
      const target = [22, 135, 160, 190][p];
      R.T = Math.min(R.Tb, relax(R.T, target, k, dt));
      const boiling = p > 0 && R.T >= R.Tb - 0.5;
      const ringT = boiling ? [0, 0.3, 0.5, 0.88][p] + (S.app.waterTop ? 0.3 : 0) + (S.app.condWrong ? 0.15 : 0) + (!R.water || S.app.noWater ? 0.7 : 0) : 0;
      lc.ring = relax(lc.ring || 0, ringT, 0.05, dt);
      if (boiling) {
        if (!R.started) { R.started = true; ctx.timeout(0, () => ctx.rerender()); ctx.log(L('Смесь закипела; пары конденсируются в холодильнике и стекают обратно в колбу', 'Қоспа қайнады; булар мұздатқышта конденсацияланып, колбаға қайта ағады', 'The mixture boils; the vapour condenses in the condenser and runs back into the flask'), 'obs'); }
        R.t += dt;
        if (lc.ring > 1) R.vap = Math.min(0.45, R.vap + 0.00025 * dt);
        else if (lc.ring > 0.8) R.vap = Math.min(0.45, R.vap + 0.00006 * dt);
        if ((!R.water || S.app.noWater) && lc.ring > 0.9) ctx.remark({ key: 'nowater', severity: 'safety', text: L('кипячение без воды в холодильнике — пары ЛВЖ выходили в шкаф', 'мұздатқышта сусыз қайнату — ТТС булары шкафқа шықты', 'refluxing without condenser water — flammable vapour escaped into the hood'), whatif: L('Без охлаждения пары не конденсируются: бутанол и эфир уходят из верха холодильника — это и потеря продукта, и горючая смесь паров с воздухом над горячим колбонагревателем.', 'Салқындатусыз булар конденсацияланбайды: бутанол мен эфир мұздатқыштың үстінен кетеді — бұл өнімнің шығыны да, ыстық колба қыздырғыш үстіндегі будың ауамен жанғыш қоспасы да.', 'Without cooling the vapour does not condense: butanol and ester escape from the top of the condenser — product is lost and a flammable vapour–air mixture forms above the hot mantle.') });
        if (S.app.flaskWrong) ctx.remark({ key: 'flask', severity: 'minor', text: L('для кипячения взята коническая колба — она плохо прилегает к колбонагревателю, нагрев неравномерный', 'қайнату үшін конустық колба алынды — ол колба қыздырғышқа нашар жанасады, қызу біркелкі емес', 'a conical flask was used for the reflux — it does not fit the mantle and heats unevenly') });
      }
      if (R.stopper && R.T > 95) ctx.remark({ key: 'closed', severity: 'critical', text: L('нагревали закрытую систему: верх обратного холодильника был заткнут пробкой (п. 7.4)', 'жабық жүйе қыздырылды: кері мұздатқыштың үсті тығынмен жабылған (7.4-тармақ)', 'a closed system was heated: the top of the reflux condenser was stoppered (rule 7.4)'), critical: { text: CLOSED } });
    },
    readouts: (S, lc) => {
      cur.reflux = { S, lc };
      const R = S.reflux, p = lc.c.pow || 0, boiling = p > 0 && R.T >= R.Tb - 0.5 && !R.cooled;
      return [
        { label: G.heat, value: POWER[p][1] },
        { label: L('Кипение', 'Қайнау', 'Boiling'), value: R.cooled ? L('нагрев выключен', 'қыздыру өшірулі', 'heat off') : !boiling ? L('нет', 'жоқ', 'no') : p === 3 ? L('бурное', 'қатты', 'vigorous') : L('спокойное', 'баяу', 'gentle'), st: boiling && p < 3 ? 'ok' : boiling ? 'warn' : '' },
        { label: L('Кольцо конденсата', 'Конденсат сақинасы', 'Condensate ring'), value: !boiling ? '—' : lc.ring > 0.95 ? L('пары выходят из холодильника', 'булар мұздатқыштан шығуда', 'vapour escapes from the top') : { ru: `${n(Math.min(1, lc.ring) * 100, 0)} % высоты`, kk: `биіктіктің ${n(Math.min(1, lc.ring) * 100, 0)} %`, en: `${n(Math.min(1, lc.ring) * 100, 0)} % of height` }, st: !boiling ? '' : lc.ring > 0.8 ? 'bad' : lc.ring > 0.55 ? 'warn' : 'ok' },
        { label: L('Время кипения', 'Қайнау уақыты', 'Reflux time'), value: min(R.t), st: R.t >= 2700 ? 'ok' : '' },
      ];
    },
    alerts(S, lc) {
      const R = S.reflux, p = lc.c.pow || 0;
      if (R.cooled) return null;
      if (p > 0 && (!R.water || S.app.noWater)) return { text: L('Вода в холодильник не поступает — пары не будут конденсироваться!', 'Мұздатқышқа су берілмейді — булар конденсацияланбайды!', 'No water is flowing through the condenser — the vapour will not condense!'), kind: 'bad' };
      if (lc.ring > 0.8) return { text: L('Кольцо конденсата у верха холодильника — пары уходят. Уменьшите нагрев.', 'Конденсат сақинасы мұздатқыштың жоғарғы жағында — булар кетуде. Қыздыруды азайтыңыз.', 'The condensate ring is near the top of the condenser — vapour is escaping. Reduce the heating.'), kind: 'bad' };
      if (R.started && R.t >= 2700) return { text: L('Прошло 45 минут кипения — можно заканчивать (до 60 мин).', '45 минут қайнау өтті — аяқтауға болады (60 минутқа дейін).', '45 minutes of reflux done — you may finish (up to 60 min).'), kind: 'good' };
      if (R.started && lc.ring > 0.05) return { text: L('Спокойное кипение: пары конденсируются в холодильнике и стекают обратно.', 'Баяу қайнау: булар мұздатқышта конденсацияланып, кері ағады.', 'Gentle reflux: the vapour condenses and runs back.'), kind: 'info' };
      return null;
    },
    events: [
      { id: 'bump', when: (S, lc) => !S.chips && (lc.c.pow || 0) > 0 && S.reflux.T >= S.reflux.Tb - 0.5,
        title: L('Смесь кипит толчками', 'Қоспа серпіліп қайнайды', 'The mixture is bumping'),
        text: L('Жидкость то затихает, то с громкими толчками выбрасывается вверх в холодильник, колба вздрагивает. Кипелок в колбе нет. Что вы сделаете?', 'Сұйық бірде тынышталып, бірде қатты серпіліп мұздатқышқа жоғары атылады, колба дірілдейді. Колбада қайнату тастары жоқ. Не істейсіз?', 'The liquid goes quiet, then shoots up into the condenser with loud bumps; the flask jerks. There are no boiling chips in the flask. What do you do?'),
        options: [
          { ok: true, label: L('Выключить нагрев, дать смеси остыть ниже кипения, затем добавить кипелки и снова нагреть', 'Қыздыруды өшіріп, қоспаны қайнаудан төмен суытып, содан кейін қайнату тастарын салып, қайта қыздыру', 'Switch off the heat, let it cool below boiling, then add chips and heat again'), effect(S, lc, ctx) { lc.c.pow = 0; S.reflux.T = 70; S.chips = true; ctx.advance(600); }, log: L('Нагрев выключен; после охлаждения до ≈ 70 °C в колбу добавлены кипелки', 'Қыздыру өшірілді; ≈ 70 °C-қа дейін суығаннан кейін колбаға қайнату тастары салынды', 'Heat switched off; boiling chips added after cooling to ≈ 70 °C') },
          { ok: false, severity: 'critical', label: L('Сразу бросить кипелки в кипящую смесь', 'Қайнату тастарын қайнап жатқан қоспаға бірден тастау', 'Drop the chips straight into the boiling mixture'), remark: L('кипелки брошены в кипящую жидкость — выброс смеси', 'қайнату тастары қайнап жатқан сұйыққа тасталды — қоспа атылды', 'boiling chips dropped into boiling liquid — the mixture erupted'), critical: { text: HOTCHIPS } },
          { ok: false, severity: 'major', label: L('Продолжать нагрев — толчки сами прекратятся', 'Қыздыруды жалғастыру — серпілу өзі тоқтайды', 'Keep heating — the bumping will stop by itself'), remark: L('кипячение продолжено с толчками — часть смеси выброшена в холодильник и потеряна', 'серпіліп қайнау жалғастырылды — қоспаның бір бөлігі мұздатқышқа атылып, жоғалды', 'reflux continued with bumping — some of the mixture was thrown up and lost'), whatif: L('Перегретая жидкость вскипает толчками и выбрасывается в холодильник; часть смеси вылетает наружу, колба может треснуть.', 'Қызып кеткен сұйық серпіліп қайнап, мұздатқышқа атылады; қоспаның бір бөлігі сыртқа ұшады, колба жарылуы мүмкін.', 'The superheated liquid erupts in bumps into the condenser; some mixture is thrown out and the flask may crack.'), effect(S) { S.reflux.bump += 0.08; } },
        ] },
      { id: 'ring', when: (S, lc) => lc.ring > 0.86 && S.reflux.started && !S.reflux.cooled,
        title: L('Пары доходят до верха холодильника', 'Булар мұздатқыштың жоғарғы жағына жетеді', 'Vapour reaches the top of the condenser'),
        text: L('Кольцо конденсата поднялось к самому верху холодильника, из него тянет фруктовым запахом эфира. Что вы сделаете?', 'Конденсат сақинасы мұздатқыштың ең жоғарғы жағына көтерілді, одан эфирдің жеміс иісі шығады. Не істейсіз?', 'The condensate ring has climbed to the very top of the condenser and you can smell the fruity ester. What do you do?'),
        options: [
          { ok: true, label: L('Уменьшить нагрев и проверить, идёт ли вода через холодильник', 'Қыздыруды азайтып, мұздатқыш арқылы су өтіп жатқанын тексеру', 'Reduce the heat and check the condenser water'), effect(S, lc) { lc.c.pow = 1; if (!S.app.noWater) { S.reflux.water = true; lc.c.water = true; } }, log: L('Нагрев уменьшен, подача воды проверена', 'Қыздыру азайтылды, су берілуі тексерілді', 'Heat reduced, water supply checked') },
          { ok: false, severity: 'major', label: L('Ничего не менять — так реакция пойдёт быстрее', 'Ештеңе өзгертпеу — реакция тезірек жүреді', 'Change nothing — the reaction will go faster'), remark: L('бурное кипение продолжено — пары спирта и эфира уходили из холодильника', 'қатты қайнау жалғастырылды — спирт пен эфир булары мұздатқыштан кетті', 'vigorous boiling continued — alcohol and ester vapour escaped from the condenser'), whatif: L('Скорость этерификации ограничена равновесием и катализатором, а не силой кипения. Бурное кипение лишь выгоняет пары из холодильника — продукт теряется, а горючие пары скапливаются в шкафу.', 'Этерификация жылдамдығы қайнау күшімен емес, тепе-теңдік пен катализатормен шектеледі. Қатты қайнау буларды мұздатқыштан шығарып жібереді — өнім жоғалады, ал жанғыш булар шкафта жиналады.', 'The rate of esterification is limited by equilibrium and the catalyst, not by how hard it boils. Vigorous boiling only drives vapour out of the condenser — product is lost and flammable vapour builds up in the hood.') },
          { ok: false, severity: 'critical', label: L('Закрыть верх холодильника пробкой', 'Мұздатқыштың үстін тығынмен жабу', 'Stopper the top of the condenser'), remark: L('при кипении верх обратного холодильника закрыт пробкой — нагрев закрытой системы (п. 7.4)', 'қайнау кезінде кері мұздатқыштың үсті тығынмен жабылды — жабық жүйені қыздыру (7.4-тармақ)', 'the top of the reflux condenser stoppered during boiling — heating a closed system (rule 7.4)'), critical: { text: CLOSED } },
        ] },
    ],
    done: (S) => S.reflux.cooled && { text: L('Кипячение закончено, смесь охлаждена.', 'Қайнату аяқталды, қоспа суытылды.', 'Reflux finished, the mixture is cool.') },
    scene: refluxScene,
    get hints() {
      return [
        L('Сначала вода в холодильник, затем нагрев. Нужен слабый, спокойный режим — кольцо конденсата в нижней половине холодильника.', 'Алдымен мұздатқышқа су, содан кейін қыздыру. Әлсіз, баяу режим керек — конденсат сақинасы мұздатқыштың төменгі жартысында.', 'Water first, then heat. You need a gentle boil — the condensate ring in the lower half of the condenser.'),
        L('Мощность «слабо» или «средне»; «сильно» выгоняет пары. Верх холодильника всегда открыт. Нужно 45–60 мин кипения.', 'Қуаты «әлсіз» немесе «орташа»; «қатты» буларды шығарады. Мұздатқыштың үсті әрқашан ашық. 45–60 мин қайнау керек.', 'Power “low” or “medium”; “high” drives vapour out. The top of the condenser is always open. You need 45–60 min of boiling.'),
        refluxH3(),
      ];
    },
  };

  const sFunnel = {
    type: 'lab08-funnel', id: 'wash', kind, ester: N.ester,
    title: L('Промывание в делительной воронке', 'Бөлгіш шұңғымада жуу', 'Washing in the separating funnel'),
    instr: L('<ol><li>Проверьте, что кран делительной воронки на 100 мл закрыт. Налейте в неё <b>20 мл холодной воды</b> и вылейте охлаждённую смесь. Встряхните, дайте слоям разделиться и слейте <b>нижний водный слой</b>: эфир (d ≈ 0,88 г/мл) — верхний слой.</li><li>Промывайте эфир порциями <b>10–15 мл 5 % NaHCO₃</b>, пока не перестанет выделяться CO₂. <b>Часто сбрасывайте давление</b>: переверните воронку и откройте кран, направив носик от себя и соседей.</li><li>Затем промойте <b>10 мл насыщенного раствора NaCl</b>.</li><li>Перелейте эфир в сухую коническую колбу.</li></ol>',
      '<ol><li>100 мл бөлгіш шұңғыма шүмегінің жабық екенін тексеріңіз. Оған <b>20 мл суық су</b> құйып, суытылған қоспаны құйыңыз. Шайқап, қабаттардың бөлінуін күтіп, <b>төменгі сулы қабатты</b> ағызыңыз: эфир (d ≈ 0,88 г/мл) — жоғарғы қабат.</li><li>Эфирді CO₂ бөлінуі тоқтағанша <b>10–15 мл 5 % NaHCO₃</b> порцияларымен жуыңыз. <b>Қысымды жиі шығарыңыз</b>: шұңғыманы аударып, ұшын өзіңізден және көршілерден алыс бағыттап, шүмекті ашыңыз.</li><li>Содан кейін <b>10 мл қаныққан NaCl ерітіндісімен</b> жуыңыз.</li><li>Эфирді құрғақ конустық колбаға құйыңыз.</li></ol>',
      '<ol><li>Check that the stopcock of the 100 mL separating funnel is closed. Put <b>20 mL of cold water</b> into it and pour in the cooled mixture. Shake, let the layers separate and run off the <b>lower aqueous layer</b>: the ester (d ≈ 0.88 g/mL) is the upper layer.</li><li>Wash the ester with <b>10–15 mL portions of 5 % NaHCO₃</b> until no more CO₂ is evolved. <b>Vent the funnel frequently</b>: invert it and open the stopcock, pointing the outlet away from people.</li><li>Then wash with <b>10 mL of saturated NaCl solution</b>.</li><li>Transfer the ester to a dry conical flask.</li></ol>'),
    need: L('Отмойте эфир и перенесите в колбу', 'Эфирді жуып, колбаға ауыстырыңыз', 'Wash the ester and transfer it'),
  };

  const sDry = {
    type: 'process', id: 'dry', speeds: [10, 30],
    title: L('Сушка эфира', 'Эфирді кептіру', 'Drying the ester'),
    instr: L('<ol><li>Высушите эфир над <b>1–2 г безводного Na₂SO₄</b> в течение <b>10–15 минут</b>, время от времени взбалтывая, до прозрачности жидкости.</li><li>Декантируйте (слейте с осадка) высушенную жидкость в сухую перегонную колбу.</li></ol><p class="note">Пока осушитель слипается в комки, воды ещё много; сухой осушитель остаётся сыпучим.</p>',
      '<ol><li>Эфирді <b>1–2 г сусыз Na₂SO₄</b> үстінде <b>10–15 минут</b> бойы, анда-санда шайқай отырып, сұйық мөлдір болғанша кептіріңіз.</li><li>Кептірілген сұйықты тұнбадан құрғақ айдау колбасына декантациялаңыз (ағызыңыз).</li></ol><p class="note">Кептіргіш кесектерге жабысып тұрса, су әлі көп; құрғақ кептіргіш үгілгіш болып қалады.</p>',
      '<ol><li>Dry the ester over <b>1–2 g of anhydrous Na₂SO₄</b> for <b>10–15 minutes</b>, swirling occasionally, until the liquid is clear.</li><li>Decant the dried liquid off the solid into a dry distillation flask.</li></ol><p class="note">While the drying agent clumps there is still a lot of water; dry drying agent stays free-flowing.</p>'),
    need: L('Высушите эфир и декантируйте', 'Эфирді кептіріп, декантациялаңыз', 'Dry the ester and decant it'),
    setup(S, lc) { ensureOrg(S, kind); if (!S.dry || S.dry.w0 == null) S.dry = { g: 0, t: 0, bound: 0, w0: S.org.water, water: S.org.water, decanted: false, withSalt: false }; lc.vol = orgVolume(S.org); },
    controls: [
      { kind: 'action', id: 'add', once: false, group: L('Осушитель', 'Кептіргіш', 'Drying agent'), label: L('Насыпать ≈ 0,5 г безводного Na₂SO₄', '≈ 0,5 г сусыз Na₂SO₄ салу', 'Add ≈ 0.5 g of anhydrous Na₂SO₄'), advance: 20, disabled: (S) => S.dry.decanted,
        do(S, lc, ctx) { S.dry.g = +(S.dry.g + 0.5).toFixed(1); ctx.log({ ru: `Добавлено 0,5 г безводного Na₂SO₄ (всего ${n(S.dry.g, 1)} г)`, kk: `0,5 г сусыз Na₂SO₄ қосылды (барлығы ${n(S.dry.g, 1)} г)`, en: `0.5 g of anhydrous Na₂SO₄ added (total ${n(S.dry.g, 1)} g)` }); } },
      { kind: 'toggle', id: 'swirl', group: L('Осушитель', 'Кептіргіш', 'Drying agent'), label: L('Время от времени взбалтывать', 'Анда-санда шайқау', 'Swirl from time to time'), labelOn: L('Взбалтываю время от времени', 'Анда-санда шайқап отырмын', 'Swirling from time to time') },
      { kind: 'action', id: 'decant', cls: 'pri', group: L('Перенос', 'Ауыстыру', 'Transfer'), label: L('Декантировать в сухую перегонную колбу, осушитель оставить', 'Кептіргішті қалдырып, құрғақ айдау колбасына декантациялау', 'Decant into the dry distillation flask, leaving the drying agent behind'), disabled: (S) => S.dry.decanted || S.dry.g <= 0, do: (S, lc, ctx) => decant(S, ctx, false) },
      { kind: 'action', id: 'all', group: L('Перенос', 'Ауыстыру', 'Transfer'), label: L('Перелить всё вместе с осушителем', 'Кептіргішпен бірге бәрін құю', 'Pour everything over, drying agent included'), disabled: (S) => S.dry.decanted || S.dry.g <= 0, do: (S, lc, ctx) => decant(S, ctx, true) },
    ],
    tick(S, lc, dt) {
      const D = S.dry;
      if (D.decanted || D.g <= 0) return;
      D.t += dt;
      const rate = (lc.c.swirl ? 1 / 2400 : 1 / 4400) * 0.3 * D.g;
      D.bound = Math.min(0.3 * D.g, D.bound + rate * dt);
      D.water = Math.max(0.012, D.w0 - D.bound);
    },
    readouts: (S, lc) => {
      cur.dry = { S, lc };
      const D = S.dry, cloudy = D.water > 0.03;
      return [
        { label: 'Na₂SO₄', value: grams(D.g, 1), st: D.g >= 1 && D.g <= 2 ? 'ok' : D.g > 2.5 ? 'warn' : '' },
        { label: L('Время сушки', 'Кептіру уақыты', 'Drying time'), value: min(D.t), st: D.t >= 600 ? 'ok' : '' },
        { label: L('Жидкость', 'Сұйық', 'Liquid'), value: cloudy ? L('мутная', 'лайлы', 'cloudy') : L('прозрачная', 'мөлдір', 'clear'), st: cloudy ? 'warn' : 'ok' },
        { label: L('Осушитель', 'Кептіргіш', 'Drying agent'), value: D.g <= 0 ? '—' : cloudy && D.bound >= 0.3 * D.g * 0.97 ? L('весь слипся', 'толық жабысып қалды', 'all clumped') : cloudy ? L('комками', 'кесек-кесек', 'clumped') : L('сыпучий', 'үгілгіш', 'free-flowing'), st: !cloudy && D.g > 0 ? 'ok' : '' },
      ];
    },
    alerts(S) {
      const D = S.dry;
      if (D.decanted || D.g <= 0) return null;
      if (D.water > 0.03 && D.bound >= 0.3 * D.g * 0.97) return { text: L('Весь осушитель слипся, а жидкость ещё мутная — добавьте осушителя.', 'Кептіргіш толық жабысып қалды, ал сұйық әлі лайлы — кептіргіш қосыңыз.', 'All of the drying agent has clumped and the liquid is still cloudy — add more drying agent.'), kind: 'warn' };
      if (D.water <= 0.03) return { text: L('Жидкость прозрачная, осушитель сыпучий — эфир сухой.', 'Сұйық мөлдір, кептіргіш үгілгіш — эфир құрғақ.', 'The liquid is clear and the drying agent free-flowing — the ester is dry.'), kind: 'good' };
      return null;
    },
    done: (S) => S.dry.decanted && { text: L('Эфир в перегонной колбе.', 'Эфир айдау колбасында.', 'The ester is in the distillation flask.') },
    scene: (S, lc) => dryScene(S, lc),
    get hints() {
      return [
        L('Осушитель связывает воду в кристаллогидрат. Признак сухой жидкости — она прозрачна, а осушитель не слипается.', 'Кептіргіш суды кристаллогидратқа байланыстырады. Құрғақ сұйықтың белгісі — ол мөлдір, ал кептіргіш жабыспайды.', 'The drying agent binds water as a crystal hydrate. A dry liquid is clear and the drying agent does not clump.'),
        L('Обычно хватает 1–2 г; лишний осушитель удерживает часть эфира. Взбалтывание ускоряет сушку; нужно 10–15 мин.', 'Әдетте 1–2 г жеткілікті; артық кептіргіш эфирдің бір бөлігін ұстап қалады. Шайқау кептіруді жылдамдатады; 10–15 мин керек.', 'Usually 1–2 g is enough; excess drying agent holds back some ester. Swirling speeds up drying; it takes 10–15 min.'),
        dryH3(),
      ];
    },
  };
  function decant(S, ctx, withSalt) {
    const D = S.dry;
    D.decanted = true; D.withSalt = withSalt;
    const hold = (withSalt ? 0.35 : 1) * 0.11 * D.g;
    const m = liquidMass(S.org) - S.org.h2so4;
    const f = Math.max(0, 1 - hold / Math.max(1, m));
    S.ledger.drying += S.org.ester * (1 - f);
    for (const k of ['ester', 'alc', 'acid', 'heavy']) S.org[k] *= f;
    S.org.water = D.water;
    if (D.g > 2.5) ctx.remark({ key: 'salt', severity: 'minor', text: T3((l) => ({ ru: `слишком много осушителя (${n(D.g, 1)} г вместо 1–2 г) — он удерживает часть эфира`, kk: `кептіргіш тым көп (1–2 г орнына ${n(D.g, 1)} г) — ол эфирдің бір бөлігін ұстап қалады`, en: `too much drying agent (${n(D.g, 1)} g instead of 1–2 g) — it holds back some of the ester` })[l]) });
    if (D.water > 0.03) ctx.remark({ key: 'wet', severity: 'minor', text: L('эфир перенесён в перегонную колбу мутным — недосушен', 'эфир айдау колбасына лайлы күйінде ауыстырылды — толық кептірілмеген', 'the ester was transferred while still cloudy — not fully dried'), whatif: L('Вода с эфиром образует азеотроп и при перегонке переходит первой: головная фракция мутная, а часть эфира уходит вместе с ней.', 'Су эфирмен азеотроп түзеді және айдағанда бірінші өтеді: бастапқы фракция лайлы, ал эфирдің бір бөлігі онымен бірге кетеді.', 'Water forms an azeotrope with the ester and comes over first on distillation: the fore-run is cloudy and part of the ester goes with it.') });
    if (withSalt) ctx.remark({ key: 'withsalt', severity: 'minor', text: L('эфир перелит в перегонную колбу вместе с осушителем', 'эфир айдау колбасына кептіргішпен бірге құйылды', 'the ester was poured into the distillation flask together with the drying agent'), whatif: L('Кристаллогидрат Na₂SO₄·10H₂O при нагревании выше 32 °C отдаёт воду обратно — она перегонится с эфиром. Высушенную жидкость всегда сливают с осушителя.', 'Na₂SO₄·10H₂O кристаллогидраты 32 °C-тан жоғары қыздырғанда суды қайта береді — ол эфирмен бірге айдалады. Кептірілген сұйықты әрқашан кептіргіштен ағызып алады.', 'The hydrate Na₂SO₄·10H₂O gives its water back above 32 °C — it will distil with the ester. A dried liquid is always decanted off the drying agent.') });
    ctx.log(T3((l) => ({ ru: `Сушка ${n(D.t / 60, 0)} мин над ${n(D.g, 1)} г Na₂SO₄; жидкость ${D.water > 0.03 ? 'мутная' : 'прозрачная'}; ${withSalt ? 'перелита вместе с осушителем' : 'декантирована'} в сухую перегонную колбу`, kk: `${n(D.g, 1)} г Na₂SO₄ үстінде ${n(D.t / 60, 0)} мин кептіру; сұйық ${D.water > 0.03 ? 'лайлы' : 'мөлдір'}; құрғақ айдау колбасына ${withSalt ? 'кептіргішпен бірге құйылды' : 'декантацияланды'}`, en: `Dried for ${n(D.t / 60, 0)} min over ${n(D.g, 1)} g of Na₂SO₄; the liquid is ${D.water > 0.03 ? 'cloudy' : 'clear'}; ${withSalt ? 'poured, drying agent included,' : 'decanted'} into the dry distillation flask` })[l]), 'obs');
  }

  const sQuiz = {
    type: 'quiz', id: 'q-wash',
    title: L('Вопросы преподавателя', 'Оқытушының сұрақтары', 'The instructor’s questions'),
    instr: L('<p>Пока эфир сохнет, ответьте на вопросы преподавателя. Каждая ошибка записывается в журнал.</p>', '<p>Эфир кебу кезінде оқытушының сұрақтарына жауап беріңіз. Әр қате журналға жазылады.</p>', '<p>While the ester dries, answer the instructor’s questions. Every wrong answer is recorded in the notebook.</p>'),
    need: L('Ответьте на все вопросы', 'Барлық сұраққа жауап беріңіз', 'Answer all the questions'),
    questions: [
      { q: L('Зачем сырой эфир промывали раствором NaHCO₃?', 'Шикі эфир не үшін NaHCO₃ ерітіндісімен жуылды?', 'Why was the crude ester washed with NaHCO₃ solution?'),
        options: [L('Чтобы нейтрализовать и удалить уксусную и серную кислоты', 'Сірке және күкірт қышқылдарын бейтараптап, жою үшін', 'To neutralise and remove the acetic and sulfuric acids'), L('Чтобы высушить эфир', 'Эфирді кептіру үшін', 'To dry the ester'), L('Чтобы омылить остаток спирта', 'Спирт қалдығын сабындандыру үшін', 'To saponify the remaining alcohol'), L('Чтобы сместить равновесие в сторону эфира', 'Тепе-теңдікті эфир жағына ығыстыру үшін', 'To shift the equilibrium towards the ester')],
        correct: 0, why: L('Кислоты переходят в водный слой в виде солей: CH₃COOH + NaHCO₃ → CH₃COONa + CO₂↑ + H₂O. Пока выделяется CO₂, кислота ещё есть.', 'Қышқылдар тұз түрінде сулы қабатқа өтеді: CH₃COOH + NaHCO₃ → CH₃COONa + CO₂↑ + H₂O. CO₂ бөлініп жатса, қышқыл әлі бар.', 'The acids pass into the aqueous layer as salts: CH₃COOH + NaHCO₃ → CH₃COONa + CO₂↑ + H₂O. As long as CO₂ is evolved, acid remains.') },
      { q: L('Для чего последняя промывка насыщенным раствором NaCl?', 'Соңғы жуу не үшін қаныққан NaCl ерітіндісімен жүргізіледі?', 'What is the final wash with saturated NaCl for?'),
        options: [L('Уменьшает растворимость эфира в воде и «вытягивает» воду из органического слоя', 'Эфирдің судағы ерігіштігін азайтып, органикалық қабаттан суды «тартып алады»', 'It lowers the solubility of the ester in water and draws water out of the organic layer'), L('Нейтрализует остатки щёлочи', 'Сілті қалдықтарын бейтараптайды', 'It neutralises the remaining alkali'), L('Окрашивает слои, чтобы их было видно', 'Қабаттар көрінуі үшін оларды бояйды', 'It colours the layers so they can be seen'), L('Хлорирует остаток спирта', 'Спирт қалдығын хлорлайды', 'It chlorinates the remaining alcohol')],
        correct: 0, why: L('Высаливание: в насыщенном растворе соли растворимость эфира в водном слое и воды в эфирном слое меньше — меньше потерь и меньше воды перед сушкой.', 'Тұздау: қаныққан тұз ерітіндісінде эфирдің сулы қабатта және судың эфир қабатында ерігіштігі азаяды — шығын аз, кептіру алдында су аз.', 'Salting out: saturated brine lowers the solubility of the ester in the aqueous layer and of water in the ester layer — fewer losses and less water before drying.') },
    ],
  };

  const sRec0 = {
    type: 'lab08-balance', id: 'rec0', mode: 'empty', saveAs: 'm0',
    title: L('Взвешивание пустого приёмника', 'Бос қабылдағышты өлшеу', 'Weighing the empty receiver'),
    instr: L('<p>Взвесьте на технических весах сухой приёмник для основной фракции — коническую колбу на 50 мл с пробкой. Масса продукта будет найдена по разности.</p>', '<p>Техникалық таразыда негізгі фракцияға арналған құрғақ қабылдағышты — тығыны бар 50 мл конустық колбаны өлшеңіз. Өнім массасы айырма бойынша табылады.</p>', '<p>Weigh the dry receiver for the main fraction — a 50 mL conical flask with a stopper — on the top-pan balance. The product mass will be found by difference.</p>'),
    need: L('Запишите массу пустого приёмника', 'Бос қабылдағыштың массасын жазыңыз', 'Record the mass of the empty receiver'),
    mass: (S) => S.recMass,
    onRecord(S, m, ctx) { ctx.log({ ru: `Масса пустого приёмника с пробкой: <b>${n(m, 2)} г</b>`, kk: `Тығыны бар бос қабылдағыштың массасы: <b>${n(m, 2)} г</b>`, en: `Mass of the empty receiver with stopper: <b>${n(m, 2)} g</b>` }, 'calc'); },
  };

  const sAsmD = {
    type: 'assemble', id: 'asm-dist',
    title: L('Сборка установки для простой перегонки', 'Қарапайым айдау қондырғысын жинау', 'Assembling the simple distillation apparatus'),
    instr: L('<p>Соберите установку для простой перегонки: перегонная колба на колбонагревателе, термометр, холодильник Либиха, приёмник. Выберите деталь и нажмите место.</p><p class="note">Шарик термометра должен омываться парами, которые уходят в холодильник.</p>',
      '<p>Қарапайым айдау қондырғысын жинаңыз: колба қыздырғыштағы айдау колбасы, термометр, Либих мұздатқышы, қабылдағыш. Бөлшекті таңдап, орынды басыңыз.</p><p class="note">Термометр шарын мұздатқышқа кететін булар шайып тұруы тиіс.</p>',
      '<p>Assemble the simple distillation apparatus: distillation flask on the heating mantle, thermometer, Liebig condenser, receiver. Choose a part and tap its place.</p><p class="note">The thermometer bulb must be bathed by the vapour going into the condenser.</p>'),
    need: L('Соберите установку для перегонки', 'Айдау қондырғысын жинаңыз', 'Assemble the distillation apparatus'),
    parts: [
      { id: 'mantle', label: L('Колбонагреватель', 'Колба қыздырғыш', 'Heating mantle') },
      { id: 'burner', label: L('Газовая горелка', 'Газ жанарғысы', 'Gas burner') },
      { id: 'dflask', label: L('Колба с высушенным эфиром', 'Кептірілген эфирі бар колба', 'Flask with the dried ester') },
      { id: 'th-ok', label: L('Шарик на уровне бокового отвода', 'Шары бүйір бұрма деңгейінде', 'Bulb level with the side arm') },
      { id: 'th-low', label: L('Шарик в жидкости', 'Шары сұйықта', 'Bulb in the liquid') },
      { id: 'th-high', label: L('Шарик выше бокового отвода', 'Шары бүйір бұрмадан жоғары', 'Bulb above the side arm') },
      { id: 'liebig', label: L('Холодильник Либиха', 'Либих мұздатқышы', 'Liebig condenser') },
      { id: 'tap', label: L('Шланг от водопроводного крана', 'Су құбыры шүмегінен шланг', 'Hose from the water tap') },
      { id: 'drain', label: L('Шланг в раковину (слив)', 'Раковинаға шланг (ағызу)', 'Hose to the sink (outlet)') },
      { id: 'recF', label: L('Колба для головной фракции', 'Бастапқы фракцияға арналған колба', 'Flask for the fore-run') },
      { id: 'recW', label: L('Взвешенная колба для продукта', 'Өнімге арналған өлшенген колба', 'Pre-weighed flask for the product') },
    ],
    slots: [
      { id: 'heat', label: L('Нагрев', 'Қыздыру', 'Heating'), accepts: 'mantle', options: ['mantle', 'burner'], x: 100, y: 214 },
      { id: 'flask', label: L('Перегонная колба', 'Айдау колбасы', 'Distillation flask'), accepts: 'dflask', options: ['dflask'], x: 100, y: 160 },
      { id: 'therm', label: L('Термометр', 'Термометр', 'Thermometer'), accepts: 'th-ok', options: ['th-ok', 'th-low', 'th-high'], x: 100, y: 40 },
      { id: 'cond', label: L('Холодильник', 'Мұздатқыш', 'Condenser'), accepts: 'liebig', options: ['liebig'], x: 214, y: 128 },
      { id: 'wout', label: L('Верхний штуцер', 'Жоғарғы штуцер', 'Upper outlet'), accepts: 'drain', options: ['drain', 'tap'], x: 206, y: 84 },
      { id: 'win', label: L('Нижний штуцер', 'Төменгі штуцер', 'Lower inlet'), accepts: 'tap', options: ['tap', 'drain'], x: 262, y: 186 },
      { id: 'rec', label: G.rec, accepts: 'recF', options: ['recF', 'recW'], x: 300, y: 222 },
    ],
    base: (S, lc) => {
      const p = lc.place;
      return distApparatus({ place: { heat: p.heat, flask: p.flask === 'dflask', therm: p.therm === 'th-ok' ? 'ok' : p.therm === 'th-low' ? 'low' : p.therm === 'th-high' ? 'high' : null, cond: p.cond === 'liebig', rec: p.rec === 'recF' || p.rec === 'recW' }, water: !!(p.win && p.wout), frac: 0.4 });
    },
    onDone(S, place) {
      S.dapp = {
        heat: place.heat === 'burner' ? 'burner' : place.heat === 'mantle' ? 'mantle' : 'none',
        pos: place.therm === 'th-low' ? 'low' : place.therm === 'th-high' ? 'high' : 'ok',
        waterTop: place.win === 'drain' && place.wout === 'tap',
        noWater: !((place.win === 'tap' && place.wout === 'drain') || (place.win === 'drain' && place.wout === 'tap')),
        recW: place.rec === 'recW', noFlask: place.flask !== 'dflask',
      };
    },
    hint1: L('Шарик термометра — точно напротив бокового отвода; вода в холодильник Либиха — в нижний штуцер (у приёмника), выход — из верхнего. Сначала собирают головную фракцию в отдельный приёмник.', 'Термометр шары — бүйір бұрманың дәл қарсысында; Либих мұздатқышына су — төменгі штуцерге (қабылдағыш жанында), шығу — жоғарғыдан. Алдымен бастапқы фракцияны бөлек қабылдағышқа жинайды.', 'The thermometer bulb exactly opposite the side arm; water into the Liebig condenser at the lower inlet (by the receiver), out at the upper one. The fore-run is collected first in a separate receiver.'),
  };

  const sDist = {
    type: 'process', id: 'dist', speeds: [5, 10, 20], speed: 5,
    title: L('Простая перегонка', 'Қарапайым айдау', 'Simple distillation'),
    instr: T3((l) => ({
      ru: `<ol><li>Добавьте в перегонную колбу кипелку, пустите воду в холодильник и нагревайте.</li><li>Первые капли (до ${lo} °C) соберите в отдельный приёмник — головная фракция.</li><li>Фракцию <b>${lo}–${hi} °C</b> соберите в предварительно взвешенный приёмник.</li><li><b>Никогда не перегоняйте досуха</b>: прекратите перегонку, пока в колбе остаётся немного жидкости.</li></ol><p class="note">Скорость отгонки — 1–2 капли в секунду. ${nm('ester', l)}: т. кип. ${C.bpLit} °C.</p>`,
      kk: `<ol><li>Айдау колбасына қайнату тасын салып, мұздатқышқа су жіберіп, қыздырыңыз.</li><li>Алғашқы тамшыларды (${lo} °C-қа дейін) бөлек қабылдағышқа жинаңыз — бастапқы фракция.</li><li><b>${lo}–${hi} °C</b> фракциясын алдын ала өлшенген қабылдағышқа жинаңыз.</li><li><b>Ешқашан құрғағанша айдамаңыз</b>: колбада аздап сұйық қалғанда айдауды тоқтатыңыз.</li></ol><p class="note">Айдау жылдамдығы — секундына 1–2 тамшы. ${nm('ester', l)}: қайнау t ${C.bpLit} °C.</p>`,
      en: `<ol><li>Add a boiling chip to the distillation flask, turn on the condenser water and heat.</li><li>Collect the first drops (below ${lo} °C) in a separate receiver — the fore-run.</li><li>Collect the fraction boiling at <b>${lo}–${hi} °C</b> in the pre-weighed receiver.</li><li><b>Never distil to dryness</b>: stop while a small residue remains in the flask.</li></ol><p class="note">Distil at 1–2 drops per second. ${nm('ester', l)}: b.p. ${C.bpLit} °C.</p>`,
    })[l]),
    need: T3((l) => ({ ru: `Соберите фракцию ${lo}–${hi} °C`, kk: `${lo}–${hi} °C фракциясын жинаңыз`, en: `Collect the ${lo}–${hi} °C fraction` })[l]),
    setup(S, lc) {
      if (S.dist && S.dist.L) return;
      ensureOrg(S, kind);
      const L0 = { water: S.org.water, alc: S.org.alc, acid: S.org.acid, ester: S.org.ester, heavy: S.org.heavy };
      if (S.dry && S.dry.withSalt) L0.water += S.dry.bound * 0.9;
      if (S.dapp.noFlask) L0.ester *= 0.97;
      S.dist = { L: L0, T: 22, Th: 22, fore: {}, main: {}, lo: null, hi: null, rec: S.dapp.recW ? 'main' : 'fore', boiling: false, started: false, stopped: false, water: false, flaskMass: liquidMass(L0), rate: 0, usedHigh: false, foreCloudy: false, cloudyNow: false, boilTime: 0, lostVap: 0, mainMass: 0, foreMass: 0, Tshow: 22 };
      lc.c.rec = S.dist.rec;
    },
    controls: [
      { kind: 'action', id: 'chip', group: G.flask, label: L('Бросить в колбу кипелку', 'Колбаға қайнату тасын салу', 'Drop a boiling chip into the flask'), disabled: (S) => S.chipD || S.dist.stopped,
        do(S, lc, ctx) {
          if (S.dist.T > 60) { ctx.remark({ key: 'dchip', severity: 'critical', text: L('кипелка брошена в горячую жидкость — выброс', 'қайнату тасы ыстық сұйыққа тасталды — атылу', 'a boiling chip dropped into hot liquid — eruption'), critical: { text: HOTCHIPS } }); return; }
          S.chipD = true; ctx.log(L('В перегонную колбу брошена кипелка', 'Айдау колбасына қайнату тасы салынды', 'A boiling chip dropped into the distillation flask'));
        } },
      { kind: 'toggle', id: 'water', group: G.cond, label: L('Пустить воду в холодильник', 'Мұздатқышқа су жіберу', 'Turn on the condenser water'), labelOn: L('Вода идёт через холодильник', 'Су мұздатқыш арқылы өтуде', 'Water is flowing through the condenser'), onChange(S, lc, on) { S.dist.water = on && !S.dapp.noWater; } },
      { kind: 'seg', id: 'pow', group: G.heat, label: G.heat, options: POWER, default: 0,
        onChange(S, lc, v, ctx) {
          if (S.dist.stopped) { if (v) { lc.c.pow = 0; ctx.rerender(); } return; }
          if (v > 0 && S.dapp.heat === 'burner') ctx.remark({ key: 'dfire', severity: 'critical', text: L('перегонка ЛВЖ на открытом пламени', 'ТТС-ты ашық жалында айдау', 'distilling a flammable liquid over an open flame'), critical: { text: FIRE_D } });
          if (v > 0 && S.dapp.heat === 'none') { lc.c.pow = 0; ctx.rerender(); ctx.feedback(L('Под колбой нет нагревателя.', 'Колбаның астында қыздырғыш жоқ.', 'There is no heater under the flask.'), 'warn'); }
        } },
      { kind: 'seg', id: 'rec', group: G.rec, label: G.rec, options: [['fore', L('головной', 'бастапқы', 'fore-run')], ['main', L('взвешенный', 'өлшенген', 'pre-weighed')]],
        onChange(S, lc, v, ctx) {
          if (S.dist.stopped || S.dist.rec === v) { if (lc.c.rec !== S.dist.rec) { lc.c.rec = S.dist.rec; ctx.rerender(); } return; }
          S.dist.rec = v;
          ctx.log(T3((l) => ({ ru: `Приёмник сменён (${v === 'main' ? 'взвешенный — основная фракция' : 'для головной фракции'}) при ${n(S.dist.Th, 0)} °C по термометру`, kk: `Қабылдағыш ауыстырылды (${v === 'main' ? 'өлшенген — негізгі фракция' : 'бастапқы фракцияға арналған'}), термометр бойынша ${n(S.dist.Th, 0)} °C`, en: `Receiver changed (${v === 'main' ? 'pre-weighed — main fraction' : 'for the fore-run'}) at ${n(S.dist.Th, 0)} °C on the thermometer` })[l]));
          ctx.save();
        } },
      { kind: 'action', id: 'stop', cls: 'pri', group: G.end, label: L('Прекратить перегонку: выключить нагрев, в колбе остаётся немного жидкости', 'Айдауды тоқтату: қыздыруды өшіру, колбада аздап сұйық қалады', 'Stop the distillation: heat off, leaving a small residue in the flask'), disabled: (S) => !S.dist.started || S.dist.stopped, do: (S, lc, ctx) => stopDist(S, lc, ctx) },
    ],
    tick(S, lc, dt, ctx) {
      const D = S.dist, p = lc.c.pow || 0;
      if (D.stopped) { D.T = relax(D.T, 22, 0.004, dt); D.Th = relax(D.Th, 22, 0.01, dt); D.rate = 0; D.boiling = false; D.Tshow = D.Th; return; }
      const eff = p === 3 ? 0.55 : 1;
      const { Tv, Tl } = vapourT(D.L, kind, eff);
      const target = [22, 140, 165, 200][p];
      if (!(p > 0 && D.T >= Tl - 0.3 && target > Tl)) D.T = Math.min(Tl, relax(D.T, target, 0.008, dt));
      D.boiling = p > 0 && D.T >= Tl - 0.3 && target > Tl;
      if (D.boiling) { D.T = Tl; D.boilTime += dt; if (!D.started) { D.started = true; ctx.timeout(0, () => ctx.rerender()); ctx.log(L('Жидкость в перегонной колбе закипела', 'Айдау колбасындағы сұйық қайнады', 'The liquid in the distillation flask is boiling'), 'obs'); } }
      const shown = D.boiling && D.boilTime > 8 ? thermoShown(D.L, kind, eff, S.dapp.pos) : S.dapp.pos === 'low' ? D.T + (D.boiling ? 3 : 0) : 22 + Math.max(0, D.T - 60) * 0.05;
      D.Th = relax(D.Th, shown, D.boiling ? 0.12 : 0.03, dt);
      D.Tshow = D.Th;
      const atHead = D.boiling && D.boilTime > 8 && (S.dapp.pos === 'low' ? D.boilTime > 20 : D.Th > shown - 8);
      D.rate = atHead ? distRate(p) : 0;
      if (D.rate > 0) {
        const part = distil(D.L, D.rate * dt, kind, eff);
        const pm = liquidMass(part);
        const keep = D.water ? 1 : 0.35;
        if (!D.water) {
          D.lostVap += pm * (1 - keep); S.ledger.residue += (part.ester || 0) * (1 - keep);
          ctx.remark({ key: 'dnowater', severity: 'safety', text: L('перегонка без воды в холодильнике — пары эфира выходили из приёмника', 'мұздатқышта сусыз айдау — эфир булары қабылдағыштан шықты', 'distilling without condenser water — ester vapour escaped from the receiver'), whatif: L('Без охлаждения пары не конденсируются и выходят из приёмника в шкаф: продукт теряется, а над горячим колбонагревателем образуется горючая смесь паров с воздухом.', 'Салқындатусыз булар конденсацияланбай, қабылдағыштан шкафқа шығады: өнім жоғалады, ал ыстық колба қыздырғыш үстінде будың ауамен жанғыш қоспасы түзіледі.', 'Without cooling the vapour does not condense and leaves the receiver: product is lost and a flammable vapour–air mixture forms above the hot mantle.') });
        }
        if (S.dapp.waterTop && D.water) { const f = 0.12; D.lostVap += pm * f; S.ledger.residue += (part.ester || 0) * f; for (const k in part) part[k] *= 1 - f; }
        const sc = {}; for (const k in part) sc[k] = part[k] * keep;
        addTo(D[D.rec], sc);
        D.cloudyNow = pm > 0 && (part.water || 0) / pm > 0.04;
        if (D.rec === 'fore' && D.cloudyNow) D.foreCloudy = true;
        if (D.rec === 'main') { D.lo = D.lo == null ? D.Th : Math.min(D.lo, D.Th); D.hi = D.hi == null ? D.Th : Math.max(D.hi, D.Th); if (p === 3) D.usedHigh = true; }
        lc.drip = Math.floor((liquidMass(D.main) + liquidMass(D.fore)) / 0.04);
      }
      D.flaskMass = liquidMass(D.L); D.mainMass = liquidMass(D.main); D.foreMass = liquidMass(D.fore);
      if (D.flaskMass < 0.3 && p > 0) ctx.remark({ key: 'dry', severity: 'critical', text: L('перегонку довели досуха', 'айдау құрғағанша жүргізілді', 'the distillation was taken to dryness'), critical: { text: DRYNESS } });
    },
    readouts: (S, lc) => {
      cur.dist = { S, lc };
      const D = S.dist, p = lc.c.pow || 0;
      const drops = D.rate / 0.04;
      return [
        { label: L('Термометр', 'Термометр', 'Thermometer'), value: n(D.Th, 0) + ' °C', st: D.boiling && D.Th >= lo && D.Th <= hi ? 'ok' : '' },
        { label: L('Скорость', 'Жылдамдық', 'Rate'), value: D.rate ? { ru: `≈ ${n(drops, 1)} кап./с`, kk: `≈ ${n(drops, 1)} тамшы/с`, en: `≈ ${n(drops, 1)} drops/s` } : '—', st: D.rate ? (p === 3 ? 'warn' : 'ok') : '' },
        { label: L('Головная фракция', 'Бастапқы фракция', 'Fore-run'), value: { ru: `${n(D.foreMass / 0.88, 1)} мл`, kk: `${n(D.foreMass / 0.88, 1)} мл`, en: `${n(D.foreMass / 0.88, 1)} mL` } },
        { label: L('Основная фракция', 'Негізгі фракция', 'Main fraction'), value: { ru: `${n(D.mainMass / 0.88, 1)} мл`, kk: `${n(D.mainMass / 0.88, 1)} мл`, en: `${n(D.mainMass / 0.88, 1)} mL` }, st: D.mainMass > 0 ? 'ok' : '' },
        { label: L('В колбе', 'Колбада', 'In the flask'), value: { ru: `${n(D.flaskMass / 0.88, 1)} мл`, kk: `${n(D.flaskMass / 0.88, 1)} мл`, en: `${n(D.flaskMass / 0.88, 1)} mL` }, st: D.flaskMass < 1.2 ? 'bad' : '' },
      ];
    },
    alerts(S, lc) {
      const D = S.dist, p = lc.c.pow || 0;
      if (D.stopped) return null;
      if (D.boiling && !D.water) return { text: L('Вода в холодильник не идёт — пары не конденсируются!', 'Мұздатқышқа су бармайды — булар конденсацияланбайды!', 'No condenser water — the vapour is not condensing!'), kind: 'bad' };
      if (D.boiling && D.flaskMass < 1.2) return { text: L('В колбе осталось совсем мало жидкости — перегонку досуха не ведут!', 'Колбада өте аз сұйық қалды — құрғағанша айдамайды!', 'Very little liquid is left in the flask — never distil to dryness!'), kind: 'bad' };
      if (D.rate && p === 3) return { text: L('Перегонка идёт слишком быстро (больше 2 капель в секунду) — фракции хуже разделяются, термометр «отстаёт».', 'Айдау тым жылдам (секундына 2 тамшыдан көп) — фракциялар нашар бөлінеді, термометр «қалып қояды».', 'Distilling too fast (more than 2 drops per second) — the fractions separate poorly and the thermometer lags.'), kind: 'warn' };
      if (D.rate && D.rec === 'main' && D.Th > hi + 0.5) return { text: T3((l) => ({ ru: `Температура выше ${hi} °C — это уже не ваша фракция.`, kk: `Температура ${hi} °C-тан жоғары — бұл енді сіздің фракцияңыз емес.`, en: `The temperature is above ${hi} °C — this is no longer your fraction.` })[l]), kind: 'warn' };
      return null;
    },
    events: [
      { id: 'dbump', when: (S) => !S.chipD && S.dist.boiling,
        title: L('Толчки в перегонной колбе', 'Айдау колбасындағы серпілу', 'Bumping in the distillation flask'),
        text: L('Жидкость в колбе перегревается и вскипает толчками, брызги долетают до бокового отвода. Кипелки в колбе нет. Что вы сделаете?', 'Колбадағы сұйық қызып кетіп, серпіліп қайнайды, шашырандылар бүйір бұрмаға дейін жетеді. Колбада қайнату тасы жоқ. Не істейсіз?', 'The liquid superheats and boils in bumps; splashes reach the side arm. There is no boiling chip. What do you do?'),
        options: [
          { ok: true, label: L('Выключить нагрев, дать остыть ниже кипения, добавить кипелку и продолжить', 'Қыздыруды өшіріп, қайнаудан төмен суытып, қайнату тасын салып, жалғастыру', 'Switch off the heat, cool below boiling, add a chip and carry on'), effect(S, lc, ctx) { lc.c.pow = 0; S.dist.T = 70; S.dist.boiling = false; S.chipD = true; ctx.advance(420); }, log: L('Нагрев выключен; после охлаждения в колбу добавлена кипелка', 'Қыздыру өшірілді; суығаннан кейін колбаға қайнату тасы салынды', 'Heat off; a boiling chip added after cooling') },
          { ok: false, severity: 'critical', label: L('Бросить кипелку прямо в кипящую жидкость', 'Қайнату тасын тікелей қайнап жатқан сұйыққа тастау', 'Drop a chip straight into the boiling liquid'), remark: L('кипелка брошена в кипящую жидкость — выброс', 'қайнату тасы қайнап жатқан сұйыққа тасталды — атылу', 'boiling chip dropped into boiling liquid — eruption'), critical: { text: HOTCHIPS } },
          { ok: false, severity: 'major', label: L('Продолжать — брызги стекут обратно', 'Жалғастыру — шашырандылар кері ағады', 'Carry on — the splashes will run back'), remark: L('перегонка с толчками — неочищенная жидкость перебрасывалась в приёмник', 'серпіліп айдау — тазартылмаған сұйық қабылдағышқа атылды', 'distillation with bumping — unpurified liquid was thrown into the receiver'), whatif: L('При толчках в холодильник летят брызги кипящей жидкости вместе с примесями — приёмник загрязняется, разделение теряет смысл.', 'Серпілгенде мұздатқышқа қайнап жатқан сұйықтың шашырандылары қоспалармен бірге ұшады — қабылдағыш ластанады, бөлудің мәні жоғалады.', 'Bumping throws splashes of boiling liquid with impurities into the condenser — the receiver is contaminated and the separation is pointless.'),
            effect(S) { const D = S.dist; const take = Math.min(0.5, liquidMass(D.L) * 0.06); const tot = liquidMass(D.L) || 1; const part = {}; for (const k in D.L) { part[k] = D.L[k] * take / tot; D.L[k] -= part[k]; } addTo(D[D.rec], part); S.chipD = true; } },
        ] },
      { id: 'cloudy', when: (S) => S.dist.rec === 'main' && S.dist.cloudyNow,
        title: L('Дистиллят в приёмнике мутнеет', 'Қабылдағыштағы дистиллят лайланады', 'The distillate in the receiver turns cloudy'),
        text: L('В основной приёмник капает мутная жидкость, на дне видны мелкие капли. Что вы сделаете?', 'Негізгі қабылдағышқа лайлы сұйық тамып жатыр, түбінде ұсақ тамшылар көрінеді. Не істейсіз?', 'Cloudy liquid is dripping into the main receiver and small droplets show at the bottom. What do you do?'),
        options: [
          { ok: true, label: L('Вернуть приёмник для головной фракции: это вода с эфиром (азеотроп)', 'Бастапқы фракция қабылдағышын қайтару: бұл эфирмен су (азеотроп)', 'Switch back to the fore-run receiver: this is water with ester (an azeotrope)'), effect(S, lc) { S.dist.rec = 'fore'; lc.c.rec = 'fore'; }, log: L('Мутный погон собран в приёмник для головной фракции', 'Лайлы фракция бастапқы фракция қабылдағышына жиналды', 'The cloudy distillate collected in the fore-run receiver') },
          { ok: false, severity: 'major', label: L('Продолжать собирать в взвешенный приёмник — потом высохнет', 'Өлшенген қабылдағышқа жинауды жалғастыру — кейін кебеді', 'Keep collecting in the pre-weighed receiver — it will dry later'), remark: L('мутный погон с водой собран в основную фракцию', 'сулы лайлы фракция негізгі фракцияға жиналды', 'the cloudy watery distillate went into the main fraction'), whatif: L('Вода в продукте завышает массу и выход и делает эфир мутным; т. кип. такой фракции ниже табличной.', 'Өнімдегі су масса мен шығымды жоғарылатып, эфирді лайлы етеді; мұндай фракцияның қайнау t кестедегіден төмен.', 'Water in the product inflates the mass and yield and makes the ester cloudy; such a fraction boils below the table value.') },
        ] },
    ],
    chart: { label: L('Температура паров во времени', 'Будың температурасы уақыт бойынша', 'Vapour temperature over time'), value: (S) => S.dist.Th, min: 20, max: 140, band: C.frac, limit: hi, every: 5, active: (S) => S.dist.started, empty: L('график начнётся, когда жидкость закипит', 'сұйық қайнағанда график басталады', 'the chart starts when the liquid boils') },
    done: (S) => S.dist.stopped && { text: L('Перегонка закончена.', 'Айдау аяқталды.', 'The distillation is finished.') },
    scene: distScene,
    get hints() {
      return [
        T3((l) => ({ ru: `Кипелка → вода → нагрев «средне» (1–2 капли/с). Следите за термометром: до ${lo} °C — головная фракция, ${lo}–${hi} °C — продукт.`, kk: `Қайнату тасы → су → «орташа» қыздыру (1–2 тамшы/с). Термометрді қадағалаңыз: ${lo} °C-қа дейін — бастапқы фракция, ${lo}–${hi} °C — өнім.`, en: `Chip → water → heat “medium” (1–2 drops/s). Watch the thermometer: below ${lo} °C is the fore-run, ${lo}–${hi} °C is the product.` })[l]),
        T3((l) => ({ ru: `Подставьте взвешенный приёмник, когда термометр покажет ${lo} °C. Если температура не доходит до ${lo} °C или сразу выше ${hi} °C — проверьте, где шарик термометра. Остановитесь, когда в колбе останется ~1 мл.`, kk: `Термометр ${lo} °C көрсеткенде өлшенген қабылдағышты қойыңыз. Температура ${lo} °C-қа жетпесе немесе бірден ${hi} °C-тан жоғары болса — термометр шарының қайда екенін тексеріңіз. Колбада ~1 мл қалғанда тоқтаңыз.`, en: `Switch to the pre-weighed receiver when the thermometer reads ${lo} °C. If it never reaches ${lo} °C or is above ${hi} °C straight away, check where the thermometer bulb is. Stop when ~1 mL is left in the flask.` })[l]),
        distH3(),
      ];
    },
  };

  function stopDist(S, lc, ctx) {
    const D = S.dist;
    if (D.mainMass < 0.5) { ctx.feedback(L('В взвешенном приёмнике ещё нет продукта — основная фракция не собрана.', 'Өлшенген қабылдағышта әлі өнім жоқ — негізгі фракция жиналмаған.', 'There is no product in the pre-weighed receiver yet — the main fraction has not been collected.'), 'warn'); delete lc.done.stop; return; }
    D.stopped = true; lc.c.pow = 0;
    const hu = Math.min(0.3, D.mainMass * 0.035), f = 1 - hu / D.mainMass;
    S.ledger.holdup += (D.main.ester || 0) * (1 - f);
    for (const k in D.main) D.main[k] *= f;
    S.ledger.fore += D.fore.ester || 0;
    S.ledger.residue += D.L.ester || 0;
    const mass = liquidMass(D.main), pur = purity(D.main);
    D.res = { mass, purity: pur, lo: D.lo, hi: D.hi, Tmid: (D.lo + D.hi) / 2, water: D.main.water || 0, acid: D.main.acid || 0, alc: D.main.alc || 0, residue: D.flaskMass, fore: D.foreMass };
    const cloudy = (D.main.water || 0) / mass > 0.01;
    D.res.cloudy = cloudy;
    const sour = D.res.acid > 0.04;
    // отложенные последствия
    if (S.dapp.pos !== 'ok') ctx.remark({ key: 'thpos', severity: 'major', text: S.dapp.pos === 'low' ? L('шарик термометра был погружён в жидкость: он показывал температуру кипящей жидкости, а не паров — границы фракции определены неверно', 'термометр шары сұйыққа батырылған: ол будың емес, қайнап жатқан сұйықтың температурасын көрсетті — фракция шектері қате анықталды', 'the thermometer bulb was in the liquid: it showed the temperature of the boiling liquid, not of the vapour — the fraction limits were wrong') : L('шарик термометра был выше бокового отвода: пары его не омывали, показания занижены — границы фракции определены неверно', 'термометр шары бүйір бұрмадан жоғары болды: булар оны шаймады, көрсеткіш төмен — фракция шектері қате анықталды', 'the thermometer bulb was above the side arm: the vapour did not reach it and it read low — the fraction limits were wrong') });
    if (D.lo < lo - 1.5) ctx.remark({ key: 'forein', severity: 'major', text: T3((l) => ({ ru: `в основную фракцию попала головная (сбор начат при ${n(D.lo, 0)} °C вместо ${lo} °C)`, kk: `негізгі фракцияға бастапқы фракция түсті (жинау ${lo} °C орнына ${n(D.lo, 0)} °C-та басталды)`, en: `the fore-run got into the main fraction (collection started at ${n(D.lo, 0)} °C instead of ${lo} °C)` })[l]) });
    if (D.hi > hi + 1.5) ctx.remark({ key: 'tailin', severity: 'minor', text: T3((l) => ({ ru: `в приёмник собраны пары выше ${hi} °C (до ${n(D.hi, 0)} °C)`, kk: `қабылдағышқа ${hi} °C-тан жоғары булар жиналды (${n(D.hi, 0)} °C-қа дейін)`, en: `vapour above ${hi} °C was collected (up to ${n(D.hi, 0)} °C)` })[l]) });
    if (D.usedHigh) ctx.remark({ key: 'dfast', severity: 'minor', text: L('основная фракция перегонялась слишком быстро — хуже разделение', 'негізгі фракция тым жылдам айдалды — бөліну нашар', 'the main fraction was distilled too fast — poorer separation') });
    if ((D.L.ester || 0) > 1.5) ctx.remark({ key: 'early', severity: 'minor', text: T3((l) => ({ ru: `перегонка прекращена слишком рано — в колбе осталось ≈ ${n(D.flaskMass / 0.88, 1)} мл эфира`, kk: `айдау тым ерте тоқтатылды — колбада ≈ ${n(D.flaskMass / 0.88, 1)} мл эфир қалды`, en: `distillation stopped too early — ≈ ${n(D.flaskMass / 0.88, 1)} mL of ester left in the flask` })[l]) });
    if (D.res.acid > 0.04 || (S.wash.acidLeft || 0) > 1) {
      ctx.remark({ key: 'acidleft', severity: 'major', text: L('в продукте осталась уксусная кислота — промывка NaHCO₃ была неполной', 'өнімде сірке қышқылы қалды — NaHCO₃-пен жуу толық болмады', 'acetic acid remained in the product — the bicarbonate wash was incomplete'), whatif: L('Уксусная кислота (т. кип. 118 °C) кипит рядом с эфиром и перегоняется вместе с ним: продукт пахнет уксусом и имеет кислую реакцию. Промывку NaHCO₃ продолжают, пока выделяется CO₂.', 'Сірке қышқылы (қайнау t 118 °C) эфирге жақын қайнайды және онымен бірге айдалады: өнімнен сірке иісі шығады, реакциясы қышқыл. NaHCO₃-пен жууды CO₂ бөлінгенше жалғастырады.', 'Acetic acid (b.p. 118 °C) boils close to the ester and distils with it: the product smells of vinegar and is acidic. The bicarbonate wash is continued while CO₂ is evolved.') });
      ctx.log(L('Продукт имеет резкий запах уксуса; влажная индикаторная бумага над приёмником краснеет', 'Өнімнен сірке қышқылының өткір иісі шығады; қабылдағыш үстіндегі ылғал индикатор қағазы қызарады', 'The product smells sharply of vinegar; moist indicator paper above the receiver turns red'), 'obs');
    }
    if (cloudy) ctx.remark({ key: 'wetprod', severity: 'minor', text: L('продукт мутный — в нём вода', 'өнім лайлы — онда су бар', 'the product is cloudy — it contains water') });
    ctx.log(T3((l) => ({
      ru: `Головная фракция ≈ ${n(D.foreMass / 0.88, 1)} мл${D.foreCloudy ? ' (мутная)' : ''}. Основная фракция собрана при ${n(D.lo, 0)}–${n(D.hi, 0)} °C: ${cloudy ? 'мутная' : 'бесцветная прозрачная'} жидкость с ${sour ? 'фруктовым запахом и резким запахом уксуса' : 'приятным фруктовым запахом'}. В колбе осталось ≈ ${n(D.flaskMass / 0.88, 1)} мл${S.char ? ' тёмного' : ''} остатка`,
      kk: `Бастапқы фракция ≈ ${n(D.foreMass / 0.88, 1)} мл${D.foreCloudy ? ' (лайлы)' : ''}. Негізгі фракция ${n(D.lo, 0)}–${n(D.hi, 0)} °C-та жиналды: жағымды жеміс иісі бар ${cloudy ? 'лайлы' : 'түссіз мөлдір'} сұйық${sour ? ', сірке иісі шығады' : ''}. Колбада ≈ ${n(D.flaskMass / 0.88, 1)} мл${S.char ? ' қара' : ''} қалдық қалды`,
      en: `Fore-run ≈ ${n(D.foreMass / 0.88, 1)} mL${D.foreCloudy ? ' (cloudy)' : ''}. Main fraction collected at ${n(D.lo, 0)}–${n(D.hi, 0)} °C: a ${cloudy ? 'cloudy' : 'clear colourless'} liquid with ${sour ? 'a fruity odour and a sharp smell of vinegar' : 'a pleasant fruity odour'}. About ${n(D.flaskMass / 0.88, 1)} mL of${S.char ? ' dark' : ''} residue left in the flask`,
    })[l]), 'obs');
  }

  const sRec1 = {
    type: 'lab08-balance', id: 'rec1', mode: 'full', saveAs: 'm1',
    title: L('Взвешивание продукта', 'Өнімді өлшеу', 'Weighing the product'),
    instr: L('<p>Остудите приёмник с основной фракцией, закройте пробкой и взвесьте на тех же весах. Масса продукта — разность масс приёмника с продуктом и пустого.</p>', '<p>Негізгі фракциясы бар қабылдағышты суытып, тығынмен жабыңыз да, сол таразыда өлшеңіз. Өнім массасы — өнімі бар және бос қабылдағыш массаларының айырмасы.</p>', '<p>Cool the receiver with the main fraction, stopper it and weigh it on the same balance. The product mass is the difference between the receiver with product and the empty receiver.</p>'),
    need: L('Запишите массу приёмника с продуктом', 'Өнімі бар қабылдағыштың массасын жазыңыз', 'Record the mass of the receiver with the product'),
    mass: (S) => (S.recMass || 0) + ((S.dist && S.dist.res && S.dist.res.mass) || 0),
    onRecord(S, m, ctx) {
      S.mProd = +(m - S.m0).toFixed(2);
      ctx.log({ ru: `Масса приёмника с продуктом ${n(m, 2)} г; масса ${tr(N.esterG, 'ru')} <b>${n(S.mProd, 2)} г</b>`, kk: `Өнімі бар қабылдағыш массасы ${n(m, 2)} г; ${tr(N.esterG, 'kk')} массасы <b>${n(S.mProd, 2)} г</b>`, en: `Receiver with product ${n(m, 2)} g; mass of ${tr(N.esterG, 'en')} <b>${n(S.mProd, 2)} g</b>` }, 'obs');
    },
  };

  // Середина собранной фракции; если перегонка не была проведена (принудительный переход) — т. кип. по литературе.
  const distTmid = (S) => (S.dist && S.dist.res ? S.dist.res.Tmid : C.bp);

  const sBp = {
    type: 'read', id: 'bp',
    title: L('Температура кипения фракции', 'Фракцияның қайнау температурасы', 'Boiling point of the fraction'),
    instr: L('<p>Во время отгонки основной фракции температура паров держалась почти постоянной. Снимите отсчёт термометра (цена деления 1 °C) и запишите его.</p>', '<p>Негізгі фракцияны айдау кезінде будың температурасы тұрақты дерлік болды. Термометр көрсеткішін (бөлік құны 1 °C) алып, жазыңыз.</p>', '<p>While the main fraction distilled, the vapour temperature stayed almost constant. Read the thermometer (1 °C divisions) and record it.</p>'),
    need: L('Запишите отсчёт термометра', 'Термометр көрсеткішін жазыңыз', 'Record the thermometer reading'),
    value: (S) => distTmid(S), div: 1, unit: '°C', decimals: 1, saveAs: 'bpRead',
    label: L('Температура паров (основная фракция)', 'Будың температурасы (негізгі фракция)', 'Vapour temperature (main fraction)'),
    scene: (S) => thermoReadScene(distTmid(S)),
  };

  const sCalc = {
    type: 'calc', id: 'yield',
    title: L('Расчёт выхода', 'Шығымды есептеу', 'Calculating the yield'),
    instr: T3((l) => ({
      ru: `<p>Рассчитайте по своим данным количество спирта (лимитирующий реагент), теоретический и практический выход ${nm('esterG', l)}.</p><p class="note">d(${nm('alc', l)}) = ${n(C.d, 3)} г/мл; M(C₄H₉OH) = 74,12; M(эфира) = 116,16 г/моль; спирт : эфир = 1 : 1. Погрешность — 1 %, три попытки.</p>`,
      kk: `<p>Өз деректеріңіз бойынша спирт мөлшерін (шектеуші реагент), ${nm('esterG', l)} теориялық және практикалық шығымын есептеңіз.</p><p class="note">d(${nm('alc', l)}) = ${n(C.d, 3)} г/мл; M(C₄H₉OH) = 74,12; M(эфир) = 116,16 г/моль; спирт : эфир = 1 : 1. Қателік — 1 %, үш әрекет.</p>`,
      en: `<p>From your own data calculate the amount of alcohol (the limiting reagent) and the theoretical and percent yield of ${nm('ester', l)}.</p><p class="note">d(${nm('alc', l)}) = ${n(C.d, 3)} g/mL; M(C₄H₉OH) = 74.12; M(ester) = 116.16 g/mol; alcohol : ester = 1 : 1. Error 1 %, three attempts.</p>`,
    })[l]),
    need: L('Рассчитайте выход', 'Шығымды есептеңіз', 'Calculate the yield'),
    fields: [
      { id: 'nA', label: L('n(спирта)', 'n(спирт)', 'n(alcohol)'), unit: L('моль', 'моль', 'mol'), decimals: 4, answer: (S) => molAlc(S.vAlc, kind), formula: (S) => ({ ru: `n = ${n(S.vAlc, 1)} мл × ${n(C.d, 3)} / 74.12`, kk: `n = ${n(S.vAlc, 1)} мл × ${n(C.d, 3)} / 74.12`, en: `n = ${n(S.vAlc, 1)} mL × ${n(C.d, 3)} / 74.12` }) },
      { id: 'th', label: L('Теоретический выход', 'Теориялық шығым', 'Theoretical yield'), unit: L('г', 'г', 'g'), decimals: 2, answer: (S) => theoretical(molAlc(S.vAlc, kind)), formula: (S) => ({ ru: `m(теор.) = ${n(molAlc(S.vAlc, kind), 4)} × 116.16`, kk: `m(теор.) = ${n(molAlc(S.vAlc, kind), 4)} × 116.16`, en: `m(theor.) = ${n(molAlc(S.vAlc, kind), 4)} × 116.16` }) },
      { id: 'eta', label: L('Выход', 'Шығым', 'Yield'), unit: '%', decimals: 1, answer: (S) => percentYield(S.mProd, molAlc(S.vAlc, kind)), formula: (S) => `η = ${n(S.mProd, 2)} / ${n(theoretical(molAlc(S.vAlc, kind)), 2)} × 100 %` },
    ],
    saveAs: 'calc',
  };

  const steps = [sPPE, sPick, sAlc, sAcid, sCat, sAsmR, sReflux, sFunnel, sDry, ...(opts.quiz ? [sQuiz] : []), sRec0, sAsmD, sDist, sRec1, sBp, sCalc];
  const cps = [0, steps.indexOf(sAlc), steps.indexOf(sFunnel), steps.indexOf(sAsmD)];

  return {
    steps, checkpoints: cps,
    initialState: () => ({
      kind, vAlc: 0, vAcid: 0, cat: 0, chips: false, char: false,
      app: { heat: 'mantle', flaskWrong: false, condWrong: false, waterTop: false, noWater: false },
      reflux: { T: 22, Tb: C.Tmix, t: 0, vap: 0, bump: 0, water: false, stopper: false, started: false, cooled: false },
      org: null, ledger: null, x: 0, ratio: 0, wash: { water: 0, bicarb: 0, brine: 0, lastCO2: null, vented: true, acidLeft: 0 },
      dry: null, recMass: null, m0: 0, m1: 0, mProd: 0, dapp: { heat: 'mantle', pos: 'ok', waterTop: false, noWater: false, recW: false, noFlask: false },
      chipD: false, dist: null, bpRead: null,
    }),
    results(S) {
      const nA = molAlc(S.vAlc, kind), res = (S.dist && S.dist.res) || {};
      return {
        kind, vAlc: S.vAlc, vAcid: S.vAcid, cat: S.cat, nA, th: theoretical(nA), x: S.x, ratio: S.ratio,
        tBoil: S.reflux ? S.reflux.t / 60 : 0, washes: S.wash, dryG: S.dry ? S.dry.g : 0,
        m0: S.m0, m1: S.m1, mProd: S.mProd, yield: percentYield(S.mProd, nA),
        lo: res.lo, hi: res.hi, bp: S.bpRead, purity: res.purity, cloudy: !!res.cloudy, acid: (res.acid || 0) > 0.04,
        losses: S.ledger ? lossBreakdown(S.ledger, (S.dist && S.dist.main && S.dist.main.ester) || 0) : [],
      };
    },
    summary: (r) => [
      { label: L('Спирт', 'Спирт', 'Alcohol'), value: { ru: n(r.vAlc, 1) + ' мл', kk: n(r.vAlc, 1) + ' мл', en: n(r.vAlc, 1) + ' mL' } },
      { label: L('Продукт', 'Өнім', 'Product'), value: { ru: n(r.mProd, 2) + ' г', kk: n(r.mProd, 2) + ' г', en: n(r.mProd, 2) + ' g' } },
      { label: L('Выход', 'Шығым', 'Yield'), value: n(r.yield, 1) + ' %', st: r.yield >= 40 ? 'ok' : 'warn' },
      { label: L('Фракция', 'Фракция', 'Fraction'), value: r.lo != null ? `${n(r.lo, 0)}–${n(r.hi, 0)} °C` : '—', st: r.lo != null && r.lo >= lo - 1.5 && r.hi <= hi + 1.5 ? 'ok' : 'warn' },
    ],
  };
}
