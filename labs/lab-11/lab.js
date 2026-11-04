/**
 * Работа № 11. Аминокислоты. Пептиды и белки. Качественные реакции.
 * Источник: docs/source/labs/lab-11.md (методичка, разделы 1–8). Допущения — ASSUMPTIONS.md.
 */
import { L, n } from '../../app/i18n.js';
import bank from './admission.js';
import exp1 from './exp1.js';
import exp2 from './exp2.js';
import exp3 from './exp3.js';
import exp4 from './exp4.js';
import exp5 from './exp5.js';
import exp6 from './exp6.js';

const NP = L('не проводили', 'жүргізілмеді', 'not tested');
const DASH = '—';

/** Ячейки итоговой таблицы: «+»/«–» и окраска по ключу наблюдения. */
const CELL = {
  chelate: {
    dissolved: L('+ тёмно-синий раствор', '+ қою көк ерітінді', '+ dark-blue solution'),
    partial: L('± синий раствор, осадок частично', '± көк ерітінді, тұнба ішінара', '± blue solution, some precipitate left'),
    both: L('? контроль испорчен', '? бақылау бұзылған', '? control spoilt'),
    ppt: L('– осадок не растворился', '– тұнба ерімеді', '– precipitate did not dissolve'),
  },
  ninh: {
    strong: L('+ сине-фиолетовая', '+ көкшіл-күлгін', '+ blue-violet'),
    weak: L('± бледно-сиреневая (проба недогрета)', '± бозғылт күлгін (сынама жеткіліксіз қыздырылған)', '± pale lilac (under-heated)'),
    none: L('– окраски нет', '– түс жоқ', '– no colour'),
  },
  biuret: {
    violet: L('+ фиолетовая', '+ күлгін', '+ violet'),
    redviolet: L('+ красно-фиолетовая', '+ қызыл-күлгін', '+ red-violet'),
    blue: L('– только голубая', '– тек көгілдір', '– blue only'),
    lilac: L('? сиреневый оттенок (грязная пробирка)', '? күлгін реңк (лас пробирка)', '? lilac tint (dirty tube)'),
    blueish: L('? сине-фиолетовая (избыток CuSO₄)', '? көк-күлгін (CuSO₄ артық)', '? bluish violet (excess CuSO₄)'),
    masked: L('? синяя, маскирована избытком CuSO₄', '? көк, CuSO₄ артықтығымен көмескіленген', '? blue, masked by excess CuSO₄'),
    nobase: L('? без щёлочи — бледно-голубая', '? сілтісіз — бозғылт көгілдір', '? no alkali — pale blue'),
  },
  xan: {
    orange: L('+ жёлтая → оранжевая', '+ сары → қызғылт сары', '+ yellow → orange'),
    yellow: L('+ жёлтая (щелочная среда не достигнута)', '+ сары (сілтілі орта алынбады)', '+ yellow (never made alkaline)'),
    paleOrange: L('± слабая бледно-жёлтая / оранжеватая', '± әлсіз бозғылт сары / қызғылттау', '± weak pale yellow / orange'),
    paleYellow: L('± слабая бледно-жёлтая', '± әлсіз бозғылт сары', '± weak pale yellow'),
    white: L('– белый осадок (без нагревания)', '– ақ тұнба (қыздырусыз)', '– white precipitate (not heated)'),
    colourless: L('– бесцветная', '– түссіз', '– colourless'),
  },
  fohl: {
    black: L('+ чёрный осадок PbS', '+ PbS қара тұнбасы', '+ black PbS precipitate'),
    brown: L('+ бурый осадок PbS', '+ PbS қоңыр тұнбасы', '+ brown PbS precipitate'),
    trace: L('± слабое буроватое окрашивание', '± әлсіз қоңырқай түс', '± faint brownish tint'),
    none: L('– осадка нет', '– тұнба жоқ', '– no precipitate'),
    noalk: L('? без щёлочи', '? сілтісіз', '? no alkali'),
    nopb: L('? без ацетата свинца', '? қорғасын ацетатысыз', '? no lead acetate'),
  },
};
const cell = (map, k) => (k ? map[k] || DASH : DASH);

const prepText = (p) => (p === 'nofilter' ? L('раствор белка 1 : 10 (не отфильтрован)', 'ақуыз ерітіндісі 1 : 10 (сүзілмеген)', 'egg white solution 1 : 10 (not filtered)') : p === 'conc' ? L('неразбавленный яичный белок', 'сұйылтылмаған жұмыртқа ақуызы', 'undiluted egg white') : L('раствор яичного белка 1 : 10, профильтрован', 'жұмыртқа ақуызының ерітіндісі 1 : 10, сүзілген', 'egg white solution 1 : 10, filtered'));

export default {
  id: 'lab-11', number: '11', display: '11', status: 'ready',
  title: L('Аминокислоты. Пептиды и белки. Качественные реакции', 'Аминқышқылдары. Пептидтер және ақуыздар. Сапалық реакциялар', 'Amino acids. Peptides and proteins. Qualitative reactions'),
  topic: L('Строение и свойства α-аминокислот. Пептидная связь и уровни структуры белка. Качественные реакции и реакции осаждения аминокислот и белков.', 'α-Аминқышқылдарының құрылысы мен қасиеттері. Пептидтік байланыс және ақуыз құрылымының деңгейлері. Аминқышқылдары мен ақуыздардың сапалық және тұндыру реакциялары.', 'Structure and properties of α-amino acids. The peptide bond and levels of protein structure. Qualitative and precipitation reactions of amino acids and proteins.'),
  aim: L('Обнаружить свободные α-аминокислоты и пептидные связи, ароматические и серосодержащие остатки в белках, отличить обратимое осаждение белков (высаливание) от необратимой денатурации и объяснить каждое наблюдение уравнением или строением вещества.', 'Бос α-аминқышқылдары мен пептидтік байланыстарды, ақуыздардағы ароматты және құрамында күкірт бар қалдықтарды анықтау, ақуыздардың қайтымды тұндырылуын (тұздау) қайтымсыз денатурациядан ажырату және әр бақылауды теңдеумен немесе заттың құрылысымен түсіндіру.', 'To detect free α-amino acids and peptide bonds, aromatic and sulfur-containing residues in proteins, to distinguish reversible precipitation (salting out) from irreversible denaturation, and to explain each observation with an equation or a structural argument.'),
  relevance: L('α-Аминокислоты — строительные блоки белков и предшественники нейромедиаторов, гормонов и коферментов. Сами аминокислоты применяют как лекарства (глицин, глутаминовая кислота, метионин, ацетилцистеин), а пептиды и белки — быстро растущий класс лекарств (инсулин, окситоцин, моноклональные антитела). Качественные реакции используют в фармацевтическом анализе и в клинических лабораториях для обнаружения белка в биологических жидкостях; осаждение и денатурация важны для производства и хранения белковых препаратов и объясняют, почему при отравлении солями тяжёлых металлов дают молоко и яичный белок.',
    'α-Аминқышқылдары — ақуыздардың құрылыс блоктары және нейромедиаторлардың, гормондар мен коферменттердің бастаушылары. Аминқышқылдарының өзі дәрі ретінде қолданылады (глицин, глутамин қышқылы, метионин, ацетилцистеин), ал пептидтер мен ақуыздар — дәрілердің жылдам өсіп келе жатқан класы (инсулин, окситоцин, моноклоналды антиденелер). Сапалық реакцияларды фармацевтикалық талдауда және клиникалық зертханаларда биологиялық сұйықтықтардағы ақуызды анықтау үшін пайдаланады; тұндыру мен денатурация ақуызды препараттарды өндіру мен сақтау үшін маңызды және ауыр металдар тұздарымен уланғанда неліктен сүт пен жұмыртқа ақуызын беретінін түсіндіреді.',
    'α-Amino acids are the building blocks of proteins and the precursors of neurotransmitters, hormones and coenzymes. Amino acids themselves are used as drugs (glycine, glutamic acid, methionine, acetylcysteine), and peptides and proteins are a rapidly growing class of therapeutics (insulin, oxytocin, monoclonal antibodies). Qualitative reactions are used in pharmaceutical analysis and in clinical laboratories to detect protein in biological fluids; precipitation and denaturation matter for the formulation and storage of protein drugs and explain why milk and egg white are given as first aid in poisoning with heavy-metal salts.'),
  accent: { light: '#be185d', dark: '#f9a8d4' },
  requires: ['lab-00'],
  theory: [
    L('<b>α-Аминокислоты</b> R–CH(NH₂)–COOH; двадцать протеиногенных аминокислот кодируются генетическим кодом. Все, кроме глицина, хиральны; природные аминокислоты относятся к L-ряду (по CIP в основном S, цистеин — R).',
      '<b>α-Аминқышқылдары</b> R–CH(NH₂)–COOH; жиырма протеиногенді аминқышқылы генетикалық кодпен кодталады. Глициннен басқасының бәрі хиралды; табиғи аминқышқылдары L-қатарға жатады (CIP бойынша негізінен S, цистеин — R).',
      '<b>α-Amino acids</b> R–CH(NH₂)–COOH; twenty proteinogenic amino acids are encoded by the genetic code. All except glycine are chiral; natural amino acids belong to the L-series (mostly S by CIP; cysteine is R).'),
    L('<b>Амфотерность.</b> В твёрдом виде и в нейтральном растворе аминокислоты — цвиттер-ионы H₃N⁺–CH(R)–COO⁻: отсюда высокие т. пл. и растворимость в воде. pH, при котором суммарный заряд равен нулю, — изоэлектрическая точка pI (глицин 5,97). Как бифункциональные соединения они реагируют и как амины (ацилирование, азотистая кислота, основания Шиффа), и как кислоты (соли, эфиры) и образуют хелаты с ионами металлов — например, тёмно-синий глицинат меди(II).',
      '<b>Амфотерлік.</b> Қатты күйде және бейтарап ерітіндіде аминқышқылдары — H₃N⁺–CH(R)–COO⁻ цвиттер-иондары: балқу температурасының жоғары болуы және суда еруі осыдан. Жиынтық заряд нөлге тең болатын pH — изоэлектрлік нүкте pI (глицин 5,97). Бифункционалды қосылыстар ретінде олар амин ретінде де (ацилдеу, азотты қышқыл, Шифф негіздері), қышқыл ретінде де (тұздар, эфирлер) әрекеттеседі және металл иондарымен хелаттар түзеді — мысалы, қою көк мыс(II) глицинаты.',
      '<b>Amphoteric behaviour.</b> In the solid state and in neutral solution amino acids are zwitterions H₃N⁺–CH(R)–COO⁻, hence their high melting points and solubility in water. The pH at which the net charge is zero is the isoelectric point pI (glycine 5.97). As bifunctional compounds they react both as amines (acylation, nitrous acid, Schiff bases) and as acids (salts, esters) and form chelates with metal ions, such as deep-blue copper(II) glycinate.'),
    L('<b>Нингидриновая реакция</b> — общая проба на α-аминокислоты: аминокислота окислительно дезаминируется и декарбоксилируется, выделившийся аммиак конденсируется со второй молекулой нингидрина в сине-фиолетовый пурпур Руэмана. Пролин (вторичный амин) даёт жёлтую окраску.',
      '<b>Нингидрин реакциясы</b> — α-аминқышқылдарына жалпы сынама: аминқышқылы тотығып дезаминденеді және декарбоксилденеді, бөлінген аммиак нингидриннің екінші молекуласымен конденсацияланып, көкшіл-күлгін Руэман пурпурын түзеді. Пролин (екіншілік амин) сары түс береді.',
      '<b>The ninhydrin reaction</b> is a general test for α-amino acids: the amino acid is oxidatively deaminated and decarboxylated, and the released ammonia condenses with a second ninhydrin molecule to give blue-violet Ruhemann’s purple. Proline, a secondary amine, gives a yellow colour.'),
    L('<b>Пептидная связь</b> –CO–NH– плоская и частично двойная (неподелённая пара азота сопряжена с C=O), вращение вокруг неё затруднено, обычно транс-конфигурация. Уровни структуры белка: первичная (последовательность), вторичная (α-спираль, β-слой; водородные связи), третичная (укладка цепи; дисульфидные мостики, ионные, водородные, гидрофобные взаимодействия), четвертичная (ассоциация субъединиц, как в гемоглобине).',
      '<b>Пептидтік байланыс</b> –CO–NH– жазық және ішінара қос (азоттың бөлінбеген жұбы C=O-мен түйіндескен), оның айналасында айналу қиындаған, әдетте транс-конфигурация. Ақуыз құрылымының деңгейлері: біріншілік (реттілік), екіншілік (α-спираль, β-қабат; сутектік байланыстар), үшіншілік (тізбектің жиналуы; дисульфидтік көпірлер, иондық, сутектік, гидрофобты әрекеттесулер), төртіншілік (гемоглобиндегідей суббірліктердің бірігуі).',
      '<b>The peptide bond</b> –CO–NH– is planar with partial double-bond character (the nitrogen lone pair is conjugated with C=O); rotation about it is restricted and it is usually trans. Levels of protein structure: primary (sequence), secondary (α-helix, β-sheet; hydrogen bonds), tertiary (folding of the chain; disulfide bridges, ionic, hydrogen and hydrophobic interactions), quaternary (association of subunits, as in haemoglobin).'),
    L('<b>Качественные реакции белков:</b> общая биуретовая — на пептидные связи; цветные — на отдельные остатки: ксантопротеиновая (тирозин, триптофан), Фоля (цистеин, цистин); Миллона (тирозин) и Сакагучи (аргинин) в этой работе не выполняются. <b>Осаждение:</b> обратимое — высаливание нейтральными солями; необратимое — денатурация нагреванием, солями тяжёлых металлов, концентрированными кислотами, органическими растворителями.',
      '<b>Ақуыздардың сапалық реакциялары:</b> жалпы биурет реакциясы — пептидтік байланыстарға; түсті реакциялар — жекелеген қалдықтарға: ксантопротеин (тирозин, триптофан), Фоль (цистеин, цистин); Миллон (тирозин) және Сакагучи (аргинин) реакциялары бұл жұмыста орындалмайды. <b>Тұндыру:</b> қайтымды — бейтарап тұздармен тұздау; қайтымсыз — қыздырумен, ауыр металдар тұздарымен, концентрлі қышқылдармен, органикалық еріткіштермен денатурация.',
      '<b>Qualitative reactions of proteins:</b> the general biuret reaction for peptide bonds; colour reactions for particular residues — xanthoproteic (tyrosine, tryptophan) and Fohl (cysteine, cystine); Millon’s (tyrosine) and Sakaguchi (arginine) reactions are not performed in this work. <b>Precipitation:</b> reversible — salting out with neutral salts; irreversible — denaturation by heat, heavy-metal salts, concentrated acids and organic solvents.'),
  ],
  reagents: [
    { id: 'egg', name: L('Раствор яичного белка', 'Жұмыртқа ақуызының ерітіндісі', 'Egg white solution'), formula: '—', conc: L('белок 1 : 10 водой, через марлю', 'ақуыз сумен 1 : 10, дәке арқылы', 'egg white 1 : 10 with water, through gauze'), hazard: [] },
    { id: 'gel', name: L('Желатин', 'Желатин', 'Gelatin'), formula: '—', conc: L('1 % раствор', '1 % ерітінді', '1 % solution'), hazard: [] },
    { id: 'gly', name: L('Глицин', 'Глицин', 'Glycine'), formula: 'H₂N–CH₂–COOH', conc: L('1 % раствор', '1 % ерітінді', '1 % solution'), hazard: [] },
    { id: 'cuso4', name: L('Сульфат меди(II)', 'Мыс(II) сульфаты', 'Copper(II) sulfate'), formula: 'CuSO₄', conc: L('1 % и 5 % растворы', '1 % және 5 % ерітінділер', '1 % and 5 % solutions'), hazard: ['irritant'] },
    { id: 'naoh', name: L('Гидроксид натрия', 'Натрий гидроксиді', 'Sodium hydroxide'), formula: 'NaOH', conc: L('10 % и 30 % растворы', '10 % және 30 % ерітінділер', '10 % and 30 % solutions'), hazard: ['corrosive'] },
    { id: 'ninh', name: L('Нингидрин', 'Нингидрин', 'Ninhydrin'), formula: '—', conc: L('0,1–0,2 % в воде или этаноле', 'суда немесе этанолда 0,1–0,2 %', '0.1–0.2 % in water or ethanol'), hazard: ['irritant'] },
    { id: 'hno3', name: L('Азотная кислота конц.', 'Азот қышқылы конц.', 'Nitric acid, conc.'), formula: 'HNO₃', conc: '65–68 %', hazard: ['corrosive', 'oxidiser'] },
    { id: 'pb', name: L('Ацетат свинца(II)', 'Қорғасын(II) ацетаты', 'Lead(II) acetate'), formula: 'Pb(CH₃COO)₂', conc: L('5 % раствор', '5 % ерітінді', '5 % solution'), hazard: ['toxic'] },
    { id: 'nh4', name: L('Сульфат аммония', 'Аммоний сульфаты', 'Ammonium sulfate'), formula: '(NH₄)₂SO₄', conc: L('насыщенный раствор и твёрдый', 'қаныққан ерітінді және қатты', 'saturated solution and solid'), hazard: [] },
    { id: 'ac', name: L('Уксусная кислота', 'Сірке қышқылы', 'Acetic acid'), formula: 'CH₃COOH', conc: L('1 % раствор', '1 % ерітінді', '1 % solution'), hazard: [] },
    { id: 'etoh', name: L('Этанол', 'Этанол', 'Ethanol'), formula: 'C₂H₅OH', conc: '96 %', hazard: ['flammable'] },
  ],
  equipment: ['test-tube', 'tube-rack', 'dropping-pipette', 'graduated-pipette', 'water-bath', 'hot-plate', 'funnel', 'filter-paper', 'glass-rod', 'tube-holder', 'fume-hood', 'goggles', 'gloves', 'lab-coat'],
  safety: [
    L('Конц. HNO₃ и 30 % NaOH сильно едкие. Пробирки с ними нагревают в вытяжном шкафу, направив отверстие от себя и от других.', 'Конц. HNO₃ және 30 % NaOH қатты күйдіргіш. Олар бар пробиркаларды тартпа шкафта, аузын өзіңізден және басқалардан аулақ бағыттап қыздырады.', 'Conc. HNO₃ and 30 % NaOH are highly corrosive. Heat tubes containing them in the fume hood, pointing the opening away from yourself and others.'),
    L('Ацетат свинца(II) токсичен (тяжёлый металл, репродуктивный токсикант): малые количества, перчатки, все свинецсодержащие отходы — в отдельную ёмкость.', 'Қорғасын(II) ацетаты улы (ауыр металл, репродуктивтік уытты зат): аз мөлшер, қолғап, құрамында қорғасын бар барлық қалдықтар — бөлек ыдысқа.', 'Lead(II) acetate is toxic (heavy metal, reproductive toxin): small amounts, gloves, and all lead-containing waste into the designated container.'),
    L('Нингидрин вреден и окрашивает кожу в фиолетовый цвет — избегайте контакта.', 'Нингидрин зиянды және теріні күлгін түске бояйды — жанасудан аулақ болыңыз.', 'Ninhydrin is harmful and stains skin purple — avoid contact.'),
    L('Соли меди вредны при проглатывании; этанол легко воспламеняется — держите его вдали от пламени и плиток.', 'Мыс тұздары жұтқанда зиянды; этанол тез тұтанады — оны жалын мен плиталардан алыс ұстаңыз.', 'Copper salts are harmful if swallowed; ethanol is flammable — keep it away from flames and hot plates.'),
    L('Халат, защитные очки и перчатки — всё время; еда и напитки в лаборатории запрещены.', 'Халат, қорғаныс көзілдірігі және қолғап — үнемі; зертханада тамақ пен сусынға тыйым салынған.', 'Lab coat, goggles and gloves at all times; no food or drink in the laboratory.'),
    L('До начала работы знайте, где фонтанчик для глаз, аварийный душ и огнетушитель.', 'Жұмыс басталғанға дейін көз жуатын фонтан, апаттық душ және өрт сөндіргіш қай жерде екенін біліңіз.', 'Know where the eyewash station, safety shower and fire extinguisher are before starting.'),
  ],
  admission: { pick: 5, pass: 4, bank },
  experiments: [exp1, exp2, exp3, exp4, exp5, exp6],

  report: {
    experiments: {
      1: {
        reagents: (r) => [prepText(r.egg), L(`5 % CuSO₄ — ${r.cu || 0} кап., 10 % NaOH — ${r.oh || 0} кап. (в каждую из двух пробирок)`, `5 % CuSO₄ — ${r.cu || 0} тамшы, 10 % NaOH — ${r.oh || 0} тамшы (екі пробирканың әрқайсысына)`, `5 % CuSO₄ — ${r.cu || 0} drops, 10 % NaOH — ${r.oh || 0} drops (each of two tubes)`), L(`1 % глицин — ${n(r.gly || 0, 1)} мл; вода (контроль)`, `1 % глицин — ${n(r.gly || 0, 1)} мл; су (бақылау)`, `1 % glycine — ${n(r.gly || 0, 1)} mL; water (control)`)],
        conclusion: (r) => (r.key === 'dissolved'
          ? L('Cu(OH)₂ растворяется в растворе глицина с образованием тёмно-синего хелата (H₂N–CH₂–COO)₂Cu, а в воде не растворяется: α-аминокислота — бидентатный лиганд (N аминогруппы и O карбоксилата), образующий с Cu²⁺ пятичленные хелатные циклы.', 'Cu(OH)₂ глицин ерітіндісінде қою көк (H₂N–CH₂–COO)₂Cu хелатын түзіп ериді, ал суда ерімейді: α-аминқышқылы — Cu²⁺-пен бесмүшелі хелатты циклдар түзетін бидентатты лиганд (аминотоптың N және карбоксилаттың O атомдары).', 'Cu(OH)₂ dissolves in glycine solution to form the dark-blue chelate (H₂N–CH₂–COO)₂Cu but not in water: the α-amino acid is a bidentate ligand (amino N and carboxylate O) forming five-membered chelate rings with Cu²⁺.')
          : L('Глицин образует с Cu²⁺ синий хелат, но в опыте Cu(OH)₂ растворился не полностью или контроль был испорчен: на один ион Cu²⁺ нужны две молекулы глицина, а сравнение с водой обязательно. Опыт следует повторить с 2–3 каплями CuSO₄.', 'Глицин Cu²⁺-пен көк хелат түзеді, бірақ тәжірибеде Cu(OH)₂ толық ерімеді немесе бақылау бұзылды: бір Cu²⁺ ионына екі глицин молекуласы қажет, ал сумен салыстыру міндетті. Тәжірибені 2–3 тамшы CuSO₄-пен қайталау керек.', 'Glycine forms a blue chelate with Cu²⁺, but here Cu(OH)₂ did not dissolve completely or the control was spoilt: one Cu²⁺ needs two glycine molecules and the comparison with water is essential. The experiment should be repeated with 2–3 drops of CuSO₄.')),
      },
      2: {
        reagents: (r) => [L('1 % глицин — 1 мл; раствор белка — 1 мл', '1 % глицин — 1 мл; ақуыз ерітіндісі — 1 мл', '1 % glycine — 1 mL; egg white solution — 1 mL'), L(`нингидрин 0,1–0,2 % — ${r.ninh || 0} кап. в каждую`, `нингидрин 0,1–0,2 % — әрқайсысына ${r.ninh || 0} тамшы`, `ninhydrin 0.1–0.2 % — ${r.ninh || 0} drops each`)],
        conditions: (r) => L(`Нагрев в водяной бане ${n((r.heat || 0) / 60, 0)} мин при ${r.T != null ? (r.T >= 99.5 ? 100 : n(r.T, 0)) : '—'} °C.`, `Су моншасында ${r.T != null ? (r.T >= 99.5 ? 100 : n(r.T, 0)) : '—'} °C-та ${n((r.heat || 0) / 60, 0)} мин қыздыру.`, `Heated in the water bath for ${n((r.heat || 0) / 60, 0)} min at ${r.T != null ? (r.T >= 99.5 ? 100 : n(r.T, 0)) : '—'} °C.`),
        conclusion: (r) => (r.gly === 'strong' && r.egg === 'strong'
          ? L('Глицин и белок дают с нингидрином сине-фиолетовый пурпур Руэмана: оба содержат свободные α-аминогруппы (у белка — N-концевые и боковые аминогруппы).', 'Глицин мен ақуыз нингидринмен көкшіл-күлгін Руэман пурпурын береді: екеуінде де бос α-аминотоптар бар (ақуызда — N-соңғы және бүйірлік аминотоптар).', 'Glycine and the protein give blue-violet Ruhemann’s purple with ninhydrin: both contain free α-amino groups (in the protein, N-terminal and side-chain amino groups).')
          : L('Окраска развилась слабо: реакция требует нагревания в кипящей бане и 4–5 капель нингидрина. Вывод о наличии α-аминогрупп требует повторения пробы.', 'Түс әлсіз дамыды: реакцияға қайнап тұрған моншада қыздыру және 4–5 тамшы нингидрин қажет. α-Аминотоптардың бар екені туралы қорытынды сынаманы қайталауды талап етеді.', 'The colour developed only weakly: the reaction needs a boiling bath and 4–5 drops of ninhydrin. The test must be repeated before concluding that α-amino groups are present.')),
      },
      3: {
        reagents: (r) => [L('растворы белка, желатина, глицина — по 1 мл', 'ақуыз, желатин, глицин ерітінділері — 1 мл-ден', 'egg white, gelatin, glycine solutions — 1 mL each'), L(`10 % NaOH — 1 мл в каждую; 1 % CuSO₄ — до ${r.cu || 0} кап.`, `10 % NaOH — әрқайсысына 1 мл; 1 % CuSO₄ — ${r.cu || 0} тамшыға дейін`, `10 % NaOH — 1 mL each; 1 % CuSO₄ — up to ${r.cu || 0} drops`)],
        conclusion: (r) => (r.egg === 'violet' && r.gel === 'redviolet' && r.gly === 'blue'
          ? L('Белок и желатин дают фиолетовую (красно-фиолетовую) окраску — в них есть пептидные связи; глицин даёт только голубую окраску: в свободной аминокислоте пептидных связей нет, а для реакции их нужно не меньше двух.', 'Ақуыз бен желатин күлгін (қызыл-күлгін) түс береді — оларда пептидтік байланыстар бар; глицин тек көгілдір түс береді: бос аминқышқылында пептидтік байланыс жоқ, ал реакцияға олардың кемінде екеуі қажет.', 'Egg white and gelatin give a violet (red-violet) colour — they contain peptide bonds; glycine gives only a blue colour: a free amino acid has no peptide bonds, and at least two are needed for the reaction.')
          : L('Картина искажена (грязная пробирка, избыток CuSO₄ или проба без щёлочи), поэтому вывод о пептидных связях недостоверен. В правильной пробе белок и желатин — фиолетовые, глицин — голубой.', 'Көрініс бұрмаланған (лас пробирка, CuSO₄ артық немесе сілтісіз сынама), сондықтан пептидтік байланыстар туралы қорытынды сенімсіз. Дұрыс сынамада ақуыз бен желатин — күлгін, глицин — көгілдір.', 'The picture is distorted (dirty tube, excess CuSO₄ or no alkali), so the conclusion about peptide bonds is unreliable. In a correct test egg white and gelatin are violet and glycine is blue.')),
      },
      4: {
        reagents: (r) => [L('растворы белка и желатина — по 1 мл', 'ақуыз және желатин ерітінділері — 1 мл-ден', 'egg white and gelatin solutions — 1 mL each'), L(`конц. HNO₃ — ${r.hno3 || 0} кап.; 30 % NaOH — ${r.oh || 0} кап. (pH ≈ ${r.pHe != null ? Math.round(r.pHe) : '—'})`, `конц. HNO₃ — ${r.hno3 || 0} тамшы; 30 % NaOH — ${r.oh || 0} тамшы (pH ≈ ${r.pHe != null ? Math.round(r.pHe) : '—'})`, `conc. HNO₃ — ${r.hno3 || 0} drops; 30 % NaOH — ${r.oh || 0} drops (pH ≈ ${r.pHe != null ? Math.round(r.pHe) : '—'})`)],
        conclusion: (r) => (r.egg === 'orange'
          ? L('Белок даёт жёлтое окрашивание при нагревании с HNO₃ и оранжевое в щелочной среде — в нём есть остатки тирозина и триптофана с активированными ароматическими кольцами. Желатин окрашивается слабо: в нём мало тирозина и нет триптофана.', 'Ақуыз HNO₃-пен қыздырғанда сары, сілтілі ортада қызғылт сары түс береді — онда белсендірілген ароматты сақиналары бар тирозин мен триптофан қалдықтары бар. Желатин әлсіз боялады: онда тирозин аз, триптофан жоқ.', 'Egg white turns yellow on heating with HNO₃ and orange in alkali — it contains tyrosine and tryptophan residues with activated aromatic rings. Gelatin is only weakly coloured: it contains little tyrosine and no tryptophan.')
          : L('Проба выполнена не полностью (без нагревания или без доведения до щелочной среды); в правильной пробе белок — жёлтый, затем оранжевый, желатин — бледно-жёлтый.', 'Сынама толық орындалмады (қыздырусыз немесе сілтілі ортаға жеткізілмей); дұрыс сынамада ақуыз — сары, содан кейін қызғылт сары, желатин — бозғылт сары.', 'The test was incomplete (not heated or not made alkaline); in a correct test egg white turns yellow and then orange, gelatin pale yellow.')),
      },
      5: {
        reagents: (r) => [L('растворы белка и желатина — по 1 мл', 'ақуыз және желатин ерітінділері — 1 мл-ден', 'egg white and gelatin solutions — 1 mL each'), L(`30 % NaOH — 1 мл; 5 % Pb(CH₃COO)₂ — ${r.pb || 0} кап.`, `30 % NaOH — 1 мл; 5 % Pb(CH₃COO)₂ — ${r.pb || 0} тамшы`, `30 % NaOH — 1 mL; 5 % Pb(CH₃COO)₂ — ${r.pb || 0} drops`)],
        conditions: (r) => L(`Кипячение ${n((r.boil || 0) / 60, 1)} мин, затем отстаивание.`, `${n((r.boil || 0) / 60, 1)} мин қайнату, содан кейін тұндыру.`, `Boiled for ${n((r.boil || 0) / 60, 1)} min, then left to stand.`),
        conclusion: (r) => (r.egg === 'black' || r.egg === 'brown'
          ? L('Белок даёт чёрно-бурый осадок PbS — в нём есть остатки цистеина и цистина; желатин беден цистеином и реакцию не даёт.', 'Ақуыз PbS қара-қоңыр тұнбасын береді — онда цистеин мен цистин қалдықтары бар; желатинде цистеин аз, реакция бермейді.', 'Egg white gives a black-brown PbS precipitate — it contains cysteine and cystine residues; gelatin is poor in cysteine and gives no reaction.')
          : L('Осадок PbS почти не образовался: смесь кипятили слишком мало, сера остатков цистеина не отщепилась полностью. Пробу надо повторить, кипятя 2–3 мин.', 'PbS тұнбасы іс жүзінде түзілмеді: қоспа тым аз қайнатылды, цистеин қалдықтарының күкірті толық бөлінбеді. Сынаманы 2–3 мин қайнатып қайталау керек.', 'Hardly any PbS formed: the mixture was boiled too briefly and the cysteine sulfur was not fully split off. The test should be repeated with 2–3 min of boiling.')),
      },
      6: {
        reagents: () => [L('раствор белка — 2 + 2 + 1 + 1 мл', 'ақуыз ерітіндісі — 2 + 2 + 1 + 1 мл', 'egg white solution — 2 + 2 + 1 + 1 mL'), L('насыщ. (NH₄)₂SO₄ — 2 мл, твёрдый (NH₄)₂SO₄; 1 % CH₃COOH — 1–2 кап.; 5 % CuSO₄ — по каплям и в избытке; 96 % этанол — 2 мл', 'қаныққан (NH₄)₂SO₄ — 2 мл, қатты (NH₄)₂SO₄; 1 % CH₃COOH — 1–2 тамшы; 5 % CuSO₄ — тамшылап және артық; 96 % этанол — 2 мл', 'sat. (NH₄)₂SO₄ — 2 mL, solid (NH₄)₂SO₄; 1 % CH₃COOH — 1–2 drops; 5 % CuSO₄ — dropwise and in excess; 96 % ethanol — 2 mL')],
        conclusion: () => L('Сульфат аммония осаждает глобулины (полунасыщение) и альбумины (насыщение) обратимо: осадок растворяется при разбавлении водой. Нагревание, ионы Cu²⁺ и этанол разрушают нативную структуру белка — осаждение необратимо (денатурация). Поэтому молоко и яичный белок связывают ионы тяжёлых металлов при отравлении.', 'Аммоний сульфаты глобулиндерді (жартылай қанығу) және альбуминдерді (қанығу) қайтымды тұндырады: тұнба сумен сұйылтқанда ериді. Қыздыру, Cu²⁺ иондары және этанол ақуыздың нативті құрылымын бұзады — тұндыру қайтымсыз (денатурация). Сондықтан уланғанда сүт пен жұмыртқа ақуызы ауыр металдар иондарын байланыстырады.', 'Ammonium sulfate precipitates globulins (half-saturation) and albumins (saturation) reversibly: the precipitate redissolves on dilution with water. Heat, Cu²⁺ ions and ethanol destroy the native structure of the protein — the precipitation is irreversible (denaturation). That is why milk and egg white bind heavy-metal ions in poisoning.'),
      },
    },
    table: {
      columns: [L('Проба', 'Сынама', 'Test'), L('Яичный белок', 'Жұмыртқа ақуызы', 'Egg white'), L('Желатин', 'Желатин', 'Gelatin'), L('Глицин', 'Глицин', 'Glycine'), L('Что обнаруживает', 'Нені анықтайды', 'Detected structure')],
      rows: (R) => {
        const r1 = R['1'] || {}, r2 = R['2'] || {}, r3 = R['3'] || {}, r4 = R['4'] || {}, r5 = R['5'] || {}, r6 = R['6'] || {};
        const den = r6.etoh ? L(`${r6.coag === 'opal' ? '± слабая коагуляция' : '+ белые хлопья'} / + осадок / + муть и осадок`, `${r6.coag === 'opal' ? '± әлсіз коагуляция' : '+ ақ үлпектер'} / + тұнба / + лай және тұнба`, `${r6.coag === 'opal' ? '± weak coagulation' : '+ white flakes'} / + precipitate / + turbidity and precipitate`) : DASH;
        return [
          [L('Cu(OH)₂ (хелат)', 'Cu(OH)₂ (хелат)', 'Cu(OH)₂ (chelate)'), NP, NP, cell(CELL.chelate, r1.key), L('α-аминокислота', 'α-аминқышқылы', 'α-amino acid')],
          [L('Нингидриновая', 'Нингидрин', 'Ninhydrin'), cell(CELL.ninh, r2.egg), NP, cell(CELL.ninh, r2.gly), L('свободная α-NH₂-группа', 'бос α-NH₂ тобы', 'free α-NH₂ group')],
          [L('Биуретовая', 'Биурет', 'Biuret'), cell(CELL.biuret, r3.egg), cell(CELL.biuret, r3.gel), cell(CELL.biuret, r3.gly), L('пептидные связи (≥ 2)', 'пептидтік байланыстар (≥ 2)', 'peptide bonds (≥ 2)')],
          [L('Ксантопротеиновая', 'Ксантопротеин', 'Xanthoproteic'), cell(CELL.xan, r4.egg), cell(CELL.xan, r4.gel), NP, L('ароматические остатки (Tyr, Trp)', 'ароматты қалдықтар (Tyr, Trp)', 'aromatic residues (Tyr, Trp)')],
          [L('Фоля', 'Фоль', 'Fohl'), cell(CELL.fohl, r5.egg), cell(CELL.fohl, r5.gel), NP, L('цистеин, цистин', 'цистеин, цистин', 'cysteine, cystine')],
          [L('Нагрев / CuSO₄ / этанол', 'Қыздыру / CuSO₄ / этанол', 'Heat / CuSO₄ / ethanol'), den, NP, NP, L('белок (денатурация)', 'ақуыз (денатурация)', 'protein (denaturation)')],
        ];
      },
    },
    extra: () => [],
    assignment: [
      { id: 'aa', kind: 'choice', task: L('Неизвестный раствор: нингидриновая проба — сине-фиолетовая окраска, биуретовая — только голубая. Что в растворе?', 'Белгісіз ерітінді: нингидрин сынамасы — көкшіл-күлгін түс, биурет сынамасы — тек көгілдір. Ерітіндіде не бар?', 'An unknown solution: ninhydrin test — blue-violet; biuret test — blue only. What does it contain?'),
        options: [L('Свободная α-аминокислота', 'Бос α-аминқышқылы', 'A free α-amino acid'), L('Белок', 'Ақуыз', 'A protein'), L('Ни аминокислот, ни белка', 'Аминқышқылы да, ақуыз да емес', 'Neither amino acid nor protein'), L('Белок без свободных аминогрупп', 'Бос аминотоптары жоқ ақуыз', 'A protein without free amino groups')],
        correct: 0, why: L('α-NH₂ есть (нингидрин +), пептидных связей нет (биурет –).', 'α-NH₂ бар (нингидрин +), пептидтік байланыс жоқ (биурет –).', 'α-NH₂ present (ninhydrin +), no peptide bonds (biuret –).') },
      { id: 'prot', kind: 'choice', task: L('Другой раствор: биуретовая проба — фиолетовая, ксантопротеиновая — оранжевая после щёлочи, реакция Фоля — отрицательная. Какой вывод верен?', 'Басқа ерітінді: биурет сынамасы — күлгін, ксантопротеин — сілтіден кейін қызғылт сары, Фоль реакциясы — теріс. Қай қорытынды дұрыс?', 'Another solution: biuret — violet; xanthoproteic — orange after alkali; Fohl — negative. Which conclusion is correct?'),
        options: [L('Белок, содержит Tyr/Trp, но не содержит остатков цистеина и цистина', 'Ақуыз, құрамында Tyr/Trp бар, бірақ цистеин мен цистин қалдықтары жоқ', 'A protein containing Tyr/Trp but no cysteine or cystine residues'), L('Свободная аминокислота тирозин', 'Бос аминқышқылы тирозин', 'Free tyrosine'), L('Белок, содержащий цистеин, но без ароматических остатков', 'Құрамында цистеин бар, бірақ ароматты қалдықтары жоқ ақуыз', 'A protein with cysteine but no aromatic residues'), L('Белок, в котором есть только метионин', 'Тек метионині бар ақуыз', 'A protein containing only methionine')],
        correct: 0, why: L('Биурет + → пептид/белок; ксантопротеиновая + → Tyr/Trp; Фоль – → нет Cys/цистина (метионин реакцию Фоля не даёт).', 'Биурет + → пептид/ақуыз; ксантопротеин + → Tyr/Trp; Фоль – → Cys/цистин жоқ (метионин Фоль реакциясын бермейді).', 'Biuret + → peptide/protein; xanthoproteic + → Tyr/Trp; Fohl – → no Cys/cystine (methionine gives no Fohl reaction).') },
      { id: 'pb', kind: 'calc', task: L('Сколько пептидных связей в трипептиде Gly–Tyr–Cys?', 'Gly–Tyr–Cys трипептидінде неше пептидтік байланыс бар?', 'How many peptide bonds are there in the tripeptide Gly–Tyr–Cys?'), answer: () => 2, unit: L('шт.', 'дана', 'bonds'), tol: 0.01, decimals: 0 },
      { id: 'tri', kind: 'choice', task: L('Какие пробы этой работы даст трипептид Gly–Tyr–Cys?', 'Gly–Tyr–Cys трипептиді осы жұмыстың қай сынамаларын береді?', 'Which tests of this work will the tripeptide Gly–Tyr–Cys give?'),
        options: [L('Нингидриновую, биуретовую, ксантопротеиновую и Фоля', 'Нингидрин, биурет, ксантопротеин және Фоль сынамаларын', 'Ninhydrin, biuret, xanthoproteic and Fohl'), L('Только нингидриновую', 'Тек нингидрин сынамасын', 'Ninhydrin only'), L('Нингидриновую и Фоля, но не биуретовую', 'Нингидрин мен Фоль, бірақ биурет емес', 'Ninhydrin and Fohl but not biuret'), L('Биуретовую и ксантопротеиновую, но не нингидриновую', 'Биурет пен ксантопротеин, бірақ нингидрин емес', 'Biuret and xanthoproteic but not ninhydrin')],
        correct: 0, why: L('Свободная N-концевая α-NH₂ (Gly) → нингидрин +; две пептидные связи → биурет +; Tyr → ксантопротеиновая +; Cys → Фоль +.', 'Бос N-соңғы α-NH₂ (Gly) → нингидрин +; екі пептидтік байланыс → биурет +; Tyr → ксантопротеин +; Cys → Фоль +.', 'Free N-terminal α-NH₂ (Gly) → ninhydrin +; two peptide bonds → biuret +; Tyr → xanthoproteic +; Cys → Fohl +.') },
      { id: 'lvl', kind: 'order', task: L('Расположите уровни структуры белка по порядку — от первичного к четвертичному.', 'Ақуыз құрылымының деңгейлерін ретімен орналастырыңыз — біріншіліктен төртіншілікке дейін.', 'Put the levels of protein structure in order, from primary to quaternary.'),
        items: [
          { id: 'a', label: L('Последовательность аминокислотных остатков', 'Аминқышқыл қалдықтарының реттілігі', 'Sequence of amino acid residues') },
          { id: 'b', label: L('α-Спираль и β-слой (водородные связи пептидных групп)', 'α-Спираль және β-қабат (пептидтік топтардың сутектік байланыстары)', 'α-Helix and β-sheet (hydrogen bonds between peptide groups)') },
          { id: 'c', label: L('Укладка одной цепи (дисульфидные мостики, ионные, гидрофобные взаимодействия)', 'Бір тізбектің жиналуы (дисульфидтік көпірлер, иондық, гидрофобты әрекеттесулер)', 'Folding of one chain (disulfide bridges, ionic and hydrophobic interactions)') },
          { id: 'd', label: L('Ассоциация нескольких субъединиц (гемоглобин)', 'Бірнеше суббірліктің бірігуі (гемоглобин)', 'Association of several subunits (haemoglobin)') },
        ] },
      { id: 'free', kind: 'text', task: L('Неизвестный раствор содержит либо белок, либо свободную аминокислоту. Предложите последовательность проб этой работы, которая устанавливает, что это, а для белка — есть ли в нём остатки тирозина/триптофана и цистеина. Напишите структуру трипептида Gly–Tyr–Cys и укажите, какие пробы он даст.', 'Белгісіз ерітіндіде не ақуыз, не бос аминқышқылы бар. Мұның не екенін, ал ақуыз болса — онда тирозин/триптофан және цистеин қалдықтарының бар-жоғын анықтайтын осы жұмыстың сынамалар ретін ұсыныңыз. Gly–Tyr–Cys трипептидінің құрылымын жазып, ол қандай сынамалар беретінін көрсетіңіз.', 'An unknown solution contains either a protein or a free amino acid. Propose a sequence of tests from this work that establishes which it is and, for a protein, whether it contains tyrosine/tryptophan and cysteine residues. Write the structure of the tripeptide Gly–Tyr–Cys and state which tests it would give.') },
    ],
  },
};
