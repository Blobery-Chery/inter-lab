/**
 * Работа № 8. Реакции карбоновых кислот и их производных с нуклеофилами. Синтез н-бутилацетата и изобутилацетата.
 * Источник: docs/source/labs/lab-08.md (методичка). Допущения — ASSUMPTIONS.md.
 */
import { L, n } from '../../app/i18n.js';
import bank from './admission.js';
import { makeSynthesis, NAMES } from './synthesis.js';
import exp3 from './exp3.js';
import exp4 from './exp4.js';
import { eqConversion, ALC } from './model.js';

const s1 = makeSynthesis('n', { quiz: true });
const s2 = makeSynthesis('i');

const exp1 = {
  id: '1',
  title: L('Синтез н-бутилацетата', 'н-Бутилацетат синтезі', 'Synthesis of n-butyl acetate'),
  principle: L('Кислотно-катализируемая этерификация уксусной кислоты н-бутанолом; двукратный избыток уксусной кислоты смещает равновесие в сторону эфира.', 'Сірке қышқылын н-бутанолмен қышқылдық катализбен этерификациялау; сірке қышқылының екі есе артық мөлшері тепе-теңдікті эфир жағына ығыстырады.', 'Acid-catalysed esterification of acetic acid with n-butanol; a twofold excess of acetic acid shifts the equilibrium towards the ester.'),
  equation: [NAMES.n.eq],
  ...s1,
};
const exp2 = {
  id: '2', optional: true,
  title: L('Синтез изобутилацетата', 'Изобутилацетат синтезі', 'Synthesis of isobutyl acetate'),
  principle: L('Та же этерификация с разветвлённым изомерным спиртом. Продукт — структурный изомер н-бутилацетата с более низкой т. кип.: разветвлённые молекулы компактнее и слабее притягиваются (дисперсионные силы). Обычно половина группы получает н-бутилацетат, половина — изобутилацетат; результаты сравнивают в итоговой таблице.', 'Дәл сол этерификация тармақталған изомерлі спиртпен. Өнім — н-бутилацетаттың қайнау t төмен құрылымдық изомері: тармақталған молекулалар ықшамырақ және әлсіз тартылады (дисперсиялық күштер). Әдетте топтың жартысы н-бутилацетат, жартысы изобутилацетат алады; нәтижелер қорытынды кестеде салыстырылады.', 'The same esterification with the branched isomeric alcohol. The product is a structural isomer of n-butyl acetate with a lower b.p.: branched molecules are more compact and attract each other more weakly (dispersion forces). Usually half of the group prepares n-butyl acetate and half isobutyl acetate; the results are compared in the summary table.'),
  equation: [NAMES.i.eq],
  ...s2,
};

const pct = (x) => n(x * 100, 1);
const frac = (r) => (r && r.lo != null ? `${n(r.lo, 0)}–${n(r.hi, 0)}` : '—');

function synthReport(kind) {
  const N = NAMES[kind], C = ALC[kind];
  return {
    reagents: (r) => [
      L(`${N.alc.ru} — ${n(r.vAlc, 1)} мл (${n(r.nA, 4)} моль)`, `${N.alc.kk} — ${n(r.vAlc, 1)} мл (${n(r.nA, 4)} моль)`, `${N.alc.en} — ${n(r.vAlc, 1)} mL (${n(r.nA, 4)} mol)`),
      L(`ледяная уксусная кислота — ${n(r.vAcid, 1)} мл`, `мұздай сірке қышқылы — ${n(r.vAcid, 1)} мл`, `glacial acetic acid — ${n(r.vAcid, 1)} mL`),
      L(`H₂SO₄ конц. — ${n(r.cat, 1)} мл; кипелки`, `H₂SO₄ конц. — ${n(r.cat, 1)} мл; қайнату тастары`, `conc. H₂SO₄ — ${n(r.cat, 1)} mL; boiling chips`),
      L(`вода 20 мл; 5 % NaHCO₃ — ${r.washes ? r.washes.bicarb : 0} порц.; насыщ. NaCl — ${r.washes && r.washes.brine ? '10 мл' : 'нет'}; Na₂SO₄ безв. — ${n(r.dryG, 1)} г`, `су 20 мл; 5 % NaHCO₃ — ${r.washes ? r.washes.bicarb : 0} порц.; қаныққан NaCl — ${r.washes && r.washes.brine ? '10 мл' : 'жоқ'}; сусыз Na₂SO₄ — ${n(r.dryG, 1)} г`, `water 20 mL; 5 % NaHCO₃ — ${r.washes ? r.washes.bicarb : 0} portions; saturated NaCl — ${r.washes && r.washes.brine ? '10 mL' : 'none'}; anhydrous Na₂SO₄ — ${n(r.dryG, 1)} g`),
    ],
    conditions: (r) => L(`Кипячение с обратным холодильником ${n(r.tBoil, 0)} мин; отношение кислота : спирт = ${n(r.ratio, 2)} : 1; собрана фракция ${frac(r)} °C (по методичке ${C.frac[0]}–${C.frac[1]} °C).`,
      `Кері мұздатқышпен ${n(r.tBoil, 0)} мин қайнату; қышқыл : спирт = ${n(r.ratio, 2)} : 1; ${frac(r)} °C фракциясы жиналды (әдістеме бойынша ${C.frac[0]}–${C.frac[1]} °C).`,
      `Reflux for ${n(r.tBoil, 0)} min; acid : alcohol = ${n(r.ratio, 2)} : 1; fraction collected at ${frac(r)} °C (manual: ${C.frac[0]}–${C.frac[1]} °C).`),
    calculations: (r) => [
      L(`n(спирта) = ${n(r.vAlc, 1)} мл × ${n(C.d, 3)} г/мл / 74.12 г/моль = ${n(r.nA, 4)} моль`, `n(спирт) = ${n(r.vAlc, 1)} мл × ${n(C.d, 3)} г/мл / 74.12 г/моль = ${n(r.nA, 4)} моль`, `n(alcohol) = ${n(r.vAlc, 1)} mL × ${n(C.d, 3)} g/mL / 74.12 g/mol = ${n(r.nA, 4)} mol`),
      L(`m(теор.) = ${n(r.nA, 4)} моль × 116.16 г/моль = ${n(r.th, 2)} г`, `m(теор.) = ${n(r.nA, 4)} моль × 116.16 г/моль = ${n(r.th, 2)} г`, `m(theor.) = ${n(r.nA, 4)} mol × 116.16 g/mol = ${n(r.th, 2)} g`),
      L(`m(продукта) = ${n(r.m1, 2)} − ${n(r.m0, 2)} = ${n(r.mProd, 2)} г; η = ${n(r.mProd, 2)} / ${n(r.th, 2)} × 100 % = ${n(r.yield, 1)} %`, `m(өнім) = ${n(r.m1, 2)} − ${n(r.m0, 2)} = ${n(r.mProd, 2)} г; η = ${n(r.mProd, 2)} / ${n(r.th, 2)} × 100 % = ${n(r.yield, 1)} %`, `m(product) = ${n(r.m1, 2)} − ${n(r.m0, 2)} = ${n(r.mProd, 2)} g; η = ${n(r.mProd, 2)} / ${n(r.th, 2)} × 100 % = ${n(r.yield, 1)} %`),
    ],
    conclusion: (r) => {
      const okFrac = r.lo != null && r.lo >= C.frac[0] - 1.5 && r.hi <= C.frac[1] + 1.5;
      return L(`Этерификацией уксусной кислоты ${kind === 'n' ? 'н-бутанолом' : 'изобутанолом'} (катализатор H₂SO₄) получен ${N.ester.ru} — ${r.cloudy ? 'мутная' : 'бесцветная'} жидкость с фруктовым запахом, фракция ${frac(r)} °C (лит.: т. кип. ${C.bpLit} °C, d²⁰ = ${n(C.dEster, 3)} г/мл, nD²⁰ = ${n(C.nD, 4)}), выход ${n(r.yield, 1)} %. Реакция — нуклеофильное ацильное замещение: спирт атакует протонированный карбонил кислоты, через тетраэдрический интермедиат уходит вода. Равновесие (K ≈ 4) смещено избытком кислоты; ${okFrac ? 'температура кипения фракции соответствует литературной' : 'температура фракции отличается от литературной — продукт требует повторной перегонки'}${r.acid ? '; запах уксуса указывает на неполную отмывку кислоты' : ''}.`,
        `Сірке қышқылын ${kind === 'n' ? 'н-бутанолмен' : 'изобутанолмен'} этерификациялау арқылы (катализатор H₂SO₄) ${N.ester.kk} алынды — жеміс иісі бар ${r.cloudy ? 'лайлы' : 'түссіз'} сұйық, фракция ${frac(r)} °C (әдеб.: қайнау t ${C.bpLit} °C, d²⁰ = ${n(C.dEster, 3)} г/мл, nD²⁰ = ${n(C.nD, 4)}), шығым ${n(r.yield, 1)} %. Реакция — нуклеофилдік ацилдік орынбасу: спирт қышқылдың протондалған карбонилине шабуыл жасайды, тетраэдрлік аралық өнім арқылы су кетеді. Тепе-теңдік (K ≈ 4) қышқылдың артық мөлшерімен ығыстырылған; ${okFrac ? 'фракцияның қайнау температурасы әдебиеттегіге сәйкес' : 'фракция температурасы әдебиеттегіден өзгеше — өнімді қайта айдау керек'}${r.acid ? '; сірке иісі қышқылдың толық жуылмағанын көрсетеді' : ''}.`,
        `Esterification of acetic acid with ${kind === 'n' ? 'n-butanol' : 'isobutanol'} (H₂SO₄ catalyst) gave ${N.ester.en}, a ${r.cloudy ? 'cloudy' : 'colourless'} liquid with a fruity odour, fraction ${frac(r)} °C (lit.: b.p. ${C.bpLit} °C, d²⁰ = ${n(C.dEster, 3)} g/mL, nD²⁰ = ${n(C.nD, 4)}), yield ${n(r.yield, 1)} %. The reaction is nucleophilic acyl substitution: the alcohol attacks the protonated carbonyl of the acid and water leaves via a tetrahedral intermediate. The equilibrium (K ≈ 4) is shifted by the excess of acid; ${okFrac ? 'the boiling range of the fraction agrees with the literature' : 'the fraction temperature differs from the literature value — the product needs redistilling'}${r.acid ? '; the vinegar odour shows the acid was not fully washed out' : ''}.`);
    },
  };
}

export default {
  id: 'lab-08', number: '08', display: '8', status: 'ready',
  title: L('Реакции карбоновых кислот и их производных с нуклеофилами. Синтез н-бутилацетата и изобутилацетата', 'Карбон қышқылдары мен олардың туындыларының нуклеофилдермен реакциялары. н-Бутилацетат пен изобутилацетат синтезі', 'Reactions of carboxylic acids and their derivatives with nucleophiles. Synthesis of n-butyl acetate and isobutyl acetate'),
  topic: L('Нуклеофильное ацильное замещение. Этерификация (реакция Фишера). Синтез н-бутилацетата и изобутилацетата.', 'Нуклеофилдік ацилдік орынбасу. Этерификация (Фишер реакциясы). н-Бутилацетат пен изобутилацетат синтезі.', 'Nucleophilic acyl substitution. Esterification (Fischer reaction). Synthesis of n-butyl acetate and isobutyl acetate.'),
  aim: L('Провести этерификацию с обратным холодильником, обработать реакционную смесь (промывание, нейтрализация, сушка), очистить эфир перегонкой и идентифицировать по т. кип.; обнаружить сложноэфирную группу гидроксамовой пробой и омылением; рассчитать теоретический и практический выход по лимитирующему реагенту.', 'Кері мұздатқышпен этерификация жүргізу, реакциялық қоспаны өңдеу (жуу, бейтараптау, кептіру), эфирді айдаумен тазартып, қайнау t бойынша сәйкестендіру; күрделі эфир тобын гидроксам сынамасымен және сабындандырумен анықтау; шектеуші реагент бойынша теориялық және практикалық шығымды есептеу.', 'To carry out an esterification under reflux, work up the reaction mixture (washing, neutralisation, drying), purify the ester by distillation and identify it by its boiling point; detect the ester group by the hydroxamic acid test and by saponification; calculate the theoretical and percent yield from the limiting reagent.'),
  relevance: L('Нуклеофильное замещение у ацильного атома углерода — центральный тип реакций карбоновых кислот и их производных. На нём основаны синтез и распад многих лекарств: ацетилсалициловую кислоту и парацетамол получают ацилированием, местные анестетики прокаин и бензокаин — сложные эфиры, а гидролиз сложноэфирных и амидных связей определяет срок годности препаратов и их метаболизм (эстеразы, амидазы). Эфиры низших кислот и спиртов — растворители, экстрагенты и ароматизаторы в фармацевтической технологии.',
    'Ацил көміртек атомындағы нуклеофилдік орынбасу — карбон қышқылдары мен олардың туындыларының негізгі реакция түрі. Көптеген дәрілердің синтезі мен ыдырауы соған негізделген: ацетилсалицил қышқылы мен парацетамолды ацилдеу арқылы алады, жергілікті анестетиктер прокаин мен бензокаин — күрделі эфирлер, ал күрделі эфир және амид байланыстарының гидролизі препараттардың жарамдылық мерзімі мен метаболизмін анықтайды (эстеразалар, амидазалар). Төменгі қышқылдар мен спирттердің эфирлері фармацевтикалық технологияда еріткіш, экстрагент және хош иістендіргіш ретінде қолданылады.',
    'Nucleophilic substitution at the acyl carbon is the central reaction type of carboxylic acids and their derivatives. It underlies the synthesis and breakdown of many drugs: acetylsalicylic acid and paracetamol are made by acylation, the local anaesthetics procaine and benzocaine are esters, and hydrolysis of ester and amide bonds determines the shelf life of drugs and their metabolism (esterases, amidases). Esters of lower acids and alcohols are used as solvents, extractants and flavouring agents in pharmaceutical technology.'),
  accent: { light: '#0f766e', dark: '#5eead4' },
  requires: ['lab-00'],
  theory: [
    L('<b>Нуклеофильное ацильное замещение.</b> Кислоты и производные R–CO–X (X = Cl, OCOR, OR′, NH₂, OH) реагируют с нуклеофилами в две стадии — присоединение–отщепление: нуклеофил атакует карбонильный углерод, образуется тетраэдрический интермедиат, затем связь C=O восстанавливается и уходит группа X. Ацильная группа R–CO– сохраняется.',
      '<b>Нуклеофилдік ацилдік орынбасу.</b> Қышқылдар мен R–CO–X туындылары (X = Cl, OCOR, OR′, NH₂, OH) нуклеофилдермен екі сатыда — қосылу–бөліну арқылы әрекеттеседі: нуклеофил карбонил көміртегіне шабуыл жасап, тетраэдрлік аралық өнім түзіледі, содан кейін C=O байланысы қалпына келіп, X тобы кетеді. R–CO– ацил тобы сақталады.',
      '<b>Nucleophilic acyl substitution.</b> Acids and derivatives R–CO–X (X = Cl, OCOR, OR′, NH₂, OH) react with nucleophiles in two steps, addition–elimination: the nucleophile attacks the carbonyl carbon to form a tetrahedral intermediate, then the C=O bond is restored and X leaves. The acyl group R–CO– is kept.'),
    L('<b>Ряд активности:</b> ацилгалогениды > ангидриды > эфиры ≈ кислоты > амиды > карбоксилат-анионы. Его определяют способность X уходить (Cl⁻ — лучшая уходящая группа, NH₂⁻ — худшая) и резонансная отдача неподелённой пары X на карбонил (сильная в амидах, ничтожная в хлорангидридах). Более активное производное можно превратить в менее активное, но не наоборот. Реакции: гидролиз → кислоты; алкоголиз → эфиры; аминолиз → амиды; NH₂OH → гидроксамовые кислоты; SOCl₂ или PCl₅ → хлорангидриды.',
      '<b>Белсенділік қатары:</b> ацилгалогенидтер > ангидридтер > эфирлер ≈ қышқылдар > амидтер > карбоксилат-аниондар. Оны X-тің кету қабілеті (Cl⁻ — ең жақсы кететін топ, NH₂⁻ — ең нашары) және X бөлінбеген жұбының карбонилге резонанстық берілуі (амидтерде күшті, хлорангидридтерде болмашы) анықтайды. Белсендірек туындыны белсенділігі аз туындыға айналдыруға болады, бірақ керісінше емес. Реакциялар: гидролиз → қышқылдар; алкоголиз → эфирлер; аминолиз → амидтер; NH₂OH → гидроксам қышқылдары; SOCl₂ немесе PCl₅ → хлорангидридтер.',
      '<b>Reactivity series:</b> acyl halides > anhydrides > esters ≈ acids > amides > carboxylate anions. It is set by how well X leaves (Cl⁻ best, NH₂⁻ poorest) and by resonance donation of the X lone pair to the carbonyl (strong in amides, negligible in acyl chlorides). A more reactive derivative can be turned into a less reactive one, not the reverse. Reactions: hydrolysis → acids; alcoholysis → esters; aminolysis → amides; NH₂OH → hydroxamic acids; SOCl₂ or PCl₅ → acyl chlorides.'),
    L('<b>Этерификация (реакция Фишера).</b> Кислоты реагируют со спиртами только в присутствии сильной кислоты (H₂SO₄, п-толуолсульфокислота): она протонирует карбонильный кислород и делает карбонильный углерод достаточно электрофильным для атаки слабым нуклеофилом — спиртом; затем перенос протона, отщепление воды, депротонирование. Метка ¹⁸O в спирте переходит в эфир: рвётся связь C–OH кислоты.',
      '<b>Этерификация (Фишер реакциясы).</b> Қышқылдар спирттермен тек күшті қышқыл (H₂SO₄, п-толуолсульфоқышқыл) қатысында әрекеттеседі: ол карбонил оттегін протондап, карбонил көміртегін әлсіз нуклеофил — спирттің шабуылы үшін жеткілікті электрофилді етеді; содан кейін протонның ауысуы, судың бөлінуі, депротондану жүреді. Спирттегі ¹⁸O белгісі эфирге өтеді: қышқылдың C–OH байланысы үзіледі.',
      '<b>Esterification (Fischer reaction).</b> Acids react with alcohols only in the presence of a strong acid (H₂SO₄, p-toluenesulfonic acid): it protonates the carbonyl oxygen and makes the carbonyl carbon electrophilic enough to be attacked by the weak nucleophile, the alcohol; then proton transfer, loss of water and deprotonation follow. An ¹⁸O label in the alcohol ends up in the ester: the C–OH bond of the acid breaks.'),
    L('<b>Равновесие.</b> Этерификация обратима (K ≈ 4 для первичных спиртов): из эквимолярных количеств превращается лишь ≈ 2/3 реагентов. Выход повышают избытком более дешёвого реагента (здесь уксусной кислоты) или удалением воды (насадка Дина–Старка, осушители). Кислотный гидролиз эфиров — обратная реакция; щелочной гидролиз (омыление) необратим: образующийся карбоксилат-анион спиртом уже не атакуется.',
      '<b>Тепе-теңдік.</b> Этерификация қайтымды (біріншілік спирттер үшін K ≈ 4): эквимолярлы мөлшерден реагенттердің тек ≈ 2/3-і айналады. Шығымды арзанырақ реагенттің (мұнда сірке қышқылының) артық мөлшерімен немесе суды жою арқылы (Дин–Старк саптамасы, кептіргіштер) арттырады. Эфирлердің қышқылдық гидролизі — кері реакция; сілтілік гидролиз (сабындану) қайтымсыз: түзілген карбоксилат-анионға спирт енді шабуыл жасамайды.',
      '<b>Equilibrium.</b> Esterification is reversible (K ≈ 4 for primary alcohols): with equimolar amounts only ≈ 2/3 of the reactants are converted. The yield is raised by an excess of the cheaper reagent (here acetic acid) or by removing water (Dean–Stark trap, drying agents). Acid hydrolysis of esters is the reverse reaction; alkaline hydrolysis (saponification) is irreversible because the carboxylate anion formed is no longer attacked by the alcohol.'),
  ],
  reagents: [
    { id: 'nbuoh', name: L('н-Бутанол (бутан-1-ол)', 'н-Бутанол (бутан-1-ол)', 'n-Butanol (butan-1-ol)'), formula: 'CH₃CH₂CH₂CH₂OH', conc: L('9,2 мл (7,4 г, 0,10 моль)', '9,2 мл (7,4 г, 0,10 моль)', '9.2 mL (7.4 g, 0.10 mol)'), hazard: ['flammable', 'irritant'] },
    { id: 'ibuoh', name: L('Изобутанол (2-метилпропан-1-ол)', 'Изобутанол (2-метилпропан-1-ол)', 'Isobutanol (2-methylpropan-1-ol)'), formula: '(CH₃)₂CHCH₂OH', conc: L('9,3 мл (7,4 г, 0,10 моль) — опыт 2', '9,3 мл (7,4 г, 0,10 моль) — 2-тәжірибе', '9.3 mL (7.4 g, 0.10 mol) — exp. 2'), hazard: ['flammable', 'irritant'] },
    { id: 'acoh', name: L('Уксусная кислота ледяная', 'Сірке қышқылы мұздай', 'Glacial acetic acid'), formula: 'CH₃COOH', conc: L('11,5 мл (12,0 г, 0,20 моль)', '11,5 мл (12,0 г, 0,20 моль)', '11.5 mL (12.0 g, 0.20 mol)'), hazard: ['corrosive', 'flammable'] },
    { id: 'h2so4', name: L('Серная кислота конц.', 'Күкірт қышқылы конц.', 'Sulfuric acid, conc.'), formula: 'H₂SO₄', conc: L('96–98 %, 0,5 мл — катализатор', '96–98 %, 0,5 мл — катализатор', '96–98 %, 0.5 mL — catalyst'), hazard: ['corrosive'] },
    { id: 'nahco3', name: L('Гидрокарбонат натрия', 'Натрий гидрокарбонаты', 'Sodium hydrogen carbonate'), formula: 'NaHCO₃', conc: L('5 % раствор — нейтрализация кислот', '5 % ерітінді — қышқылдарды бейтараптау', '5 % solution — neutralising the acids'), hazard: [] },
    { id: 'nacl', name: L('Хлорид натрия, насыщенный раствор', 'Натрий хлориді, қаныққан ерітінді', 'Sodium chloride, saturated solution'), formula: 'NaCl', conc: L('уменьшает растворимость эфира в воде', 'эфирдің судағы ерігіштігін азайтады', 'reduces the solubility of the ester in water'), hazard: [] },
    { id: 'na2so4', name: L('Сульфат натрия безводный', 'Сусыз натрий сульфаты', 'Anhydrous sodium sulfate'), formula: 'Na₂SO₄', conc: L('1–2 г — осушитель', '1–2 г — кептіргіш', '1–2 g — drying agent'), hazard: [] },
    { id: 'nh2oh', name: L('Гидроксиламина гидрохлорид', 'Гидроксиламин гидрохлориді', 'Hydroxylamine hydrochloride'), formula: 'NH₂OH·HCl', conc: L('1 М раствор — опыт 3', '1 М ерітінді — 3-тәжірибе', '1 M solution — exp. 3'), hazard: ['toxic', 'irritant'] },
    { id: 'naoh', name: L('Гидроксид натрия', 'Натрий гидроксиді', 'Sodium hydroxide'), formula: 'NaOH', conc: L('10 % и 2 М растворы — опыты 3, 4', '10 % және 2 М ерітінділер — 3, 4-тәжірибелер', '10 % and 2 M solutions — exps. 3, 4'), hazard: ['corrosive'] },
    { id: 'hcl', name: L('Хлороводородная кислота', 'Хлорсутек қышқылы', 'Hydrochloric acid'), formula: 'HCl', conc: L('1 М раствор — опыт 3', '1 М ерітінді — 3-тәжірибе', '1 M solution — exp. 3'), hazard: ['corrosive'] },
    { id: 'fecl3', name: L('Хлорид железа(III)', 'Темір(III) хлориді', 'Iron(III) chloride'), formula: 'FeCl₃', conc: L('5 % раствор — опыт 3', '5 % ерітінді — 3-тәжірибе', '5 % solution — exp. 3'), hazard: ['irritant'] },
  ],
  equipment: ['rbf-50', 'reflux-condenser', 'heating-mantle', 'water-bath', 'sand-bath', 'boiling-chips', 'sep-funnel', 'conical-50', 'distill-flask', 'thermometer-250', 'liebig-condenser', 'cylinder-10', 'cylinder-25', 'graduated-pipette', 'stand', 'test-tube', 'dropping-pipette', 'indicator-paper', 'refractometer', 'fume-hood', 'goggles', 'gloves', 'lab-coat'],
  safety: [
    L('Концентрированная серная и ледяная уксусная кислоты едкие, пары уксусной кислоты раздражают. Отмеряйте их в вытяжном шкафу, H₂SO₄ прибавляйте медленно, перемешивая.', 'Концентрлі күкірт және мұздай сірке қышқылдары күйдіргіш, сірке қышқылының булары тітіркендіреді. Оларды тартпа шкафта өлшеңіз, H₂SO₄-ті араластыра отырып баяу қосыңыз.', 'Concentrated sulfuric acid and glacial acetic acid are corrosive; acetic acid vapour is irritating. Measure them in the fume hood and add H₂SO₄ slowly with swirling.'),
    L('Бутанолы и бутилацетаты — легковоспламеняющиеся жидкости с раздражающими парами. Нагревайте только колбонагревателем или на водяной/песчаной бане — никогда на открытом пламени.', 'Бутанолдар мен бутилацетаттар — булары тітіркендіретін тез тұтанатын сұйықтықтар. Тек колба қыздырғышпен немесе су/құм моншасында қыздырыңыз — ешқашан ашық жалында емес.', 'Butanols and butyl acetates are flammable liquids with irritating vapours. Heat only with a heating mantle or water/sand bath — never with an open flame.'),
    L('Кипелки добавляют всегда до нагревания; в горячую жидкость их не бросают.', 'Қайнату тастарын әрқашан қыздыруға дейін салады; ыстық сұйыққа оларды тастамайды.', 'Always add boiling chips before heating; never add them to a hot liquid.'),
    L('При промывании NaHCO₃ выделяется CO₂: переворачивайте делительную воронку и часто открывайте кран, направив носик от людей.', 'NaHCO₃-пен жуғанда CO₂ бөлінеді: бөлгіш шұңғыманы аударып, ұшын адамдардан алыс бағыттап, шүмекті жиі ашыңыз.', 'When washing with NaHCO₃, CO₂ is released: invert the separating funnel and open the tap frequently, pointing the outlet away from people.'),
    L('Никогда не перегоняйте досуха: прекращайте перегонку, пока в колбе остаётся немного жидкости.', 'Ешқашан құрғағанша айдамаңыз: колбада аздап сұйық қалғанда айдауды тоқтатыңыз.', 'Never distil to dryness; stop the distillation while a small residue remains in the flask.'),
    L('Гидроксиламина гидрохлорид вреден и вызывает аллергию кожи — избегайте контакта.', 'Гидроксиламин гидрохлориді зиянды және теріде аллергия тудырады — жанасудан аулақ болыңыз.', 'Hydroxylamine hydrochloride is harmful and a skin sensitiser — avoid contact.'),
    L('Халат, защитные очки и перчатки — всё время; еда и напитки в лаборатории запрещены. Знайте, где фонтанчик для глаз, аварийный душ и огнетушитель.', 'Халат, қорғаныс көзілдірігі және қолғап — үнемі; зертханада тамақ пен сусынға тыйым салынған. Көз жуатын фонтан, апаттық душ және өрт сөндіргіш қайда екенін біліңіз.', 'Lab coat, goggles and gloves at all times; no food or drink in the lab. Know where the eyewash station, safety shower and fire extinguisher are.'),
    L('Органические остатки собирайте в ёмкость для органических отходов.', 'Органикалық қалдықтарды органикалық қалдықтар ыдысына жинаңыз.', 'Collect organic residues in the designated organic waste container.'),
  ],
  admission: { pick: 5, pass: 4, bank },
  experiments: [exp1, exp2, exp3, exp4],

  report: {
    experiments: {
      1: synthReport('n'),
      2: synthReport('i'),
      3: {
        reagents: () => [L('2–3 капли полученного эфира; 2–3 капли н-бутанола (контроль); NH₂OH·HCl 1 М — 1 мл; NaOH 10 % — 0,5 мл; HCl 1 М — до кислой реакции; FeCl₃ 5 % — 2 капли', 'алынған эфирден 2–3 тамшы; 2–3 тамшы н-бутанол (бақылау); NH₂OH·HCl 1 М — 1 мл; NaOH 10 % — 0,5 мл; HCl 1 М — қышқыл реакцияға дейін; FeCl₃ 5 % — 2 тамшы', '2–3 drops of the ester; 2–3 drops of n-butanol (blank); 1 M NH₂OH·HCl — 1 mL; 10 % NaOH — 0.5 mL; 1 M HCl — until acidic; 5 % FeCl₃ — 2 drops')],
        conclusion: (r) => (r.pos ? L('С эфиром — красно-фиолетовое окрашивание гидроксамата железа(III), с н-бутанолом — только жёлтая окраска FeCl₃: проба подтверждает сложноэфирную группу. Гидроксиламин как нуклеофил замещает алкоксигруппу эфира (нуклеофильное ацильное замещение).', 'Эфирмен — темір(III) гидроксаматының қызыл-күлгін түсі, н-бутанолмен — FeCl₃-тің тек сары түсі: сынама күрделі эфир тобын растайды. Гидроксиламин нуклеофил ретінде эфирдің алкокси тобын орынбасады (нуклеофилдік ацилдік орынбасу).', 'The ester gives the red-violet iron(III) hydroxamate, n-butanol only the yellow of FeCl₃: the test confirms the ester group. Hydroxylamine as a nucleophile replaces the alkoxy group of the ester (nucleophilic acyl substitution).')
          : L('Окраски не получено — проба выполнена с нарушением (нет нагревания в щелочной среде) и должна быть повторена; сам эфир гидроксамовую пробу даёт.', 'Түс алынбады — сынама бұзушылықпен орындалды (сілтілі ортада қыздыру жоқ) және қайталануы тиіс; эфирдің өзі гидроксам сынамасын береді.', 'No colour was obtained — the test was done incorrectly (no heating in alkaline medium) and must be repeated; the ester itself does give the hydroxamic test.')),
      },
      4: {
        reagents: () => [L('эфир — 0,5 мл; NaOH 2 М — 5 мл; кипящая водяная баня', 'эфир — 0,5 мл; NaOH 2 М — 5 мл; қайнаған су моншасы', 'ester — 0.5 mL; 2 M NaOH — 5 mL; boiling water bath')],
        conditions: (r) => L(`Нагревание ${n(r.t, 0)} мин; прореагировало ≈ ${n(r.h * 100, 0)} % эфира.`, `Қыздыру ${n(r.t, 0)} мин; эфирдің ≈ ${n(r.h * 100, 0)} %-ы әрекеттесті.`, `Heated for ${n(r.t, 0)} min; ≈ ${n(r.h * 100, 0)} % of the ester reacted.`),
        conclusion: (r) => (r.full ? L('Верхний слой эфира исчез, фруктовый запах сменился запахом бутанола, раствор стал однородным: гидроксид-ион необратимо омыляет эфир до ацетата натрия и спирта.', 'Эфирдің жоғарғы қабаты жоғалды, жеміс иісі бутанол иісіне ауысты, ерітінді біртекті болды: гидроксид-ион эфирді натрий ацетаты мен спиртке дейін қайтымсыз сабындандырады.', 'The upper ester layer disappeared, the fruity odour gave way to butanol and the solution became homogeneous: hydroxide saponifies the ester irreversibly to sodium acetate and the alcohol.')
          : L('Слой эфира исчез не полностью: реакция идёт на границе фаз и требует частого встряхивания и 10–15 мин нагревания.', 'Эфир қабаты толық жоғалмады: реакция фазалар шекарасында жүреді, жиі шайқауды және 10–15 мин қыздыруды қажет етеді.', 'The ester layer did not disappear completely: the reaction goes at the phase boundary and needs frequent shaking and 10–15 min of heating.')),
      },
    },
    table: {
      columns: [L('Эфир', 'Эфир', 'Ester'), L('Спирт', 'Спирт', 'Alcohol used'), L('Фракция, °C', 'Фракция, °C', 'b.p. fraction, °C'), L('Т. кип. лит., °C', 'Қайнау t, әдеб., °C', 'b.p. lit., °C'), L('Масса, г', 'Массасы, г', 'Mass, g'), L('Выход, %', 'Шығым, %', 'Yield, %'), L('Гидроксамовая проба', 'Гидроксам сынамасы', 'Hydroxamic test')],
      rows: (R) => {
        const r1 = R['1'] || {}, r2 = R['2'] || {}, r3 = R['3'] || {};
        const hx = R['3'] ? (r3.pos ? L('+ красно-фиолетовая', '+ қызыл-күлгін', '+ red-violet') : L('− (повторить)', '− (қайталау)', '− (repeat)')) : '—';
        return [
          [NAMES.n.ester, NAMES.n.alc, frac(R['1']), '126', R['1'] ? n(r1.mProd, 2) : '—', R['1'] ? n(r1.yield, 1) : '—', hx],
          [NAMES.i.ester, NAMES.i.alc, frac(R['2']), '117–118', R['2'] ? n(r2.mProd, 2) : '—', R['2'] ? n(r2.yield, 1) : '—', '—'],
        ];
      },
    },
    losses: {
      from: '1',
      labels: {
        product: L('собрано в основной фракции', 'негізгі фракцияда жиналды', 'collected in the main fraction'),
        unreacted: L('не превратилось (равновесие, K ≈ 4; время кипячения)', 'айналмады (тепе-теңдік, K ≈ 4; қайнату уақыты)', 'not converted (equilibrium, K ≈ 4; reflux time)'),
        vapour: L('ушло с парами и брызгами при кипячении', 'қайнату кезінде булармен және шашырандылармен кетті', 'lost as vapour and splashes during the reflux'),
        wash: L('растворилось в промывных водах, потери в воронке', 'жуынды суда еріді, шұңғымадағы шығын', 'dissolved in the washings, lost in the funnel'),
        drying: L('осталось на осушителе', 'кептіргіште қалды', 'left on the drying agent'),
        dist: L('головная фракция, остаток в колбе, стенки установки', 'бастапқы фракция, колбадағы қалдық, қондырғы қабырғалары', 'fore-run, flask residue, apparatus walls'),
        other: L('прочие потери', 'басқа шығындар', 'other losses'),
      },
      colors: { product: 'var(--good)', unreacted: '#8a96a3', vapour: '#d9a33a', wash: '#5b8fd0', drying: '#b06ab3', dist: 'var(--bad)', other: '#6b7280' },
    },
    extra: (R) => {
      const out = [], r1 = R['1'] || {};
      if (R['1'] && r1.yield < 40) out.push({ text: L('низкий выход н-бутилацетата (менее 40 %)', 'н-бутилацетаттың төмен шығымы (40 %-дан аз)', 'low yield of n-butyl acetate (below 40 %)'), points: 1 });
      if (R['1'] && r1.purity != null && r1.purity < 0.88) out.push({ text: L('продукт загрязнён (вода, спирт или кислота в основной фракции)', 'өнім ластанған (негізгі фракцияда су, спирт немесе қышқыл)', 'impure product (water, alcohol or acid in the main fraction)'), points: 1 });
      return out;
    },
    assignment: [
      { id: 'th', kind: 'calc', task: L('Рассчитайте теоретический выход н-бутилацетата по вашему объёму н-бутанола, г.', 'н-Бутанолдың өз көлеміңіз бойынша н-бутилацетаттың теориялық шығымын есептеңіз, г.', 'Calculate the theoretical yield of n-butyl acetate from your volume of n-butanol, g.'), answer: (R) => (R['1'] || {}).th || 0, unit: L('г', 'г', 'g'), tol: 0.01, decimals: 2 },
      { id: 'eta', kind: 'calc', task: L('Рассчитайте практический выход н-бутилацетата в процентах.', 'н-Бутилацетаттың практикалық шығымын пайызбен есептеңіз.', 'Calculate the percent yield of n-butyl acetate.'), answer: (R) => (R['1'] || {}).yield || 0, unit: '%', tol: 0.01, decimals: 1 },
      { id: 'x1', kind: 'calc', task: L('K = 4. Рассчитайте максимальную степень превращения спирта при эквимолярных количествах кислоты и спирта, %.', 'K = 4. Қышқыл мен спирт эквимолярлы мөлшерде алынғанда спирттің ең жоғары айналу дәрежесін есептеңіз, %.', 'K = 4. Calculate the maximum conversion of the alcohol with equimolar amounts of acid and alcohol, %.'), answer: () => eqConversion(1) * 100, unit: '%', tol: 0.01, decimals: 1 },
      { id: 'x2', kind: 'calc', task: L('K = 4. Рассчитайте максимальную степень превращения спирта при двукратном избытке уксусной кислоты, %.', 'K = 4. Сірке қышқылы екі есе артық алынғанда спирттің ең жоғары айналу дәрежесін есептеңіз, %.', 'K = 4. Calculate the maximum conversion of the alcohol with a twofold excess of acetic acid, %.'), answer: () => eqConversion(2) * 100, unit: '%', tol: 0.01, decimals: 1 },
      { id: 'bp', kind: 'choice', task: L('Какой из изомерных эфиров кипит ниже и почему?', 'Изомерлі эфирлердің қайсысы төмен қайнайды және неліктен?', 'Which of the isomeric esters boils lower, and why?'),
        options: [L('Изобутилацетат: разветвлённые молекулы компактнее, дисперсионные силы слабее', 'Изобутилацетат: тармақталған молекулалар ықшамырақ, дисперсиялық күштер әлсіз', 'Isobutyl acetate: branched molecules are more compact with weaker dispersion forces'), L('н-Бутилацетат: у него больше молярная масса', 'н-Бутилацетат: оның молярлық массасы үлкен', 'n-Butyl acetate: its molar mass is larger'), L('Изобутилацетат: он образует водородные связи', 'Изобутилацетат: ол сутектік байланыс түзеді', 'Isobutyl acetate: it forms hydrogen bonds'), L('Оба кипят одинаково — у них одна формула', 'Екеуі бірдей қайнайды — формуласы бір', 'Both boil the same — they have the same formula')], correct: 0,
        why: L('C₆H₁₂O₂ у обоих (M = 116,16), но разветвление уменьшает площадь контакта молекул: 117–118 °C против 126 °C.', 'Екеуінде де C₆H₁₂O₂ (M = 116,16), бірақ тармақталу молекулалардың жанасу ауданын азайтады: 126 °C-қа қарсы 117–118 °C.', 'Both are C₆H₁₂O₂ (M = 116.16), but branching reduces the contact area between molecules: 117–118 °C vs 126 °C.') },
      { id: 'mech', kind: 'order', task: L('Расставьте стадии механизма кислотно-катализируемой этерификации по порядку.', 'Қышқылдық катализді этерификация механизмінің сатыларын ретімен орналастырыңыз.', 'Put the stages of the acid-catalysed esterification mechanism in order.'),
        items: [
          { id: 'a', label: L('H⁺ протонирует карбонильный кислород уксусной кислоты', 'H⁺ сірке қышқылының карбонил оттегін протондайды', 'H⁺ protonates the carbonyl oxygen of acetic acid') },
          { id: 'b', label: L('Спирт атакует карбонильный углерод — образуется тетраэдрический интермедиат', 'Спирт карбонил көміртегіне шабуыл жасайды — тетраэдрлік аралық өнім түзіледі', 'The alcohol attacks the carbonyl carbon — the tetrahedral intermediate forms') },
          { id: 'c', label: L('Перенос протона на одну из OH-групп', 'Протонның OH топтарының біріне ауысуы', 'Proton transfer to one of the OH groups') },
          { id: 'd', label: L('Отщепляется молекула воды', 'Су молекуласы бөлінеді', 'A water molecule is lost') },
          { id: 'e', label: L('Депротонирование — образуется сложный эфир, катализатор регенерируется', 'Депротондану — күрделі эфир түзіледі, катализатор қалпына келеді', 'Deprotonation gives the ester and regenerates the catalyst') },
        ] },
      { id: 'react', kind: 'choice', task: L('Какое превращение можно провести напрямую?', 'Қай айналуды тікелей жүргізуге болады?', 'Which conversion can be carried out directly?'),
        options: [L('Ацетилхлорид + этанол → этилацетат', 'Ацетилхлорид + этанол → этилацетат', 'Acetyl chloride + ethanol → ethyl acetate'), L('Ацетамид + HCl (без нагрева) → ацетилхлорид', 'Ацетамид + HCl (қыздырусыз) → ацетилхлорид', 'Acetamide + HCl (no heating) → acetyl chloride'), L('Этилацетат + NaCl → ацетилхлорид', 'Этилацетат + NaCl → ацетилхлорид', 'Ethyl acetate + NaCl → acetyl chloride'), L('Ацетат натрия + этанол → этилацетат', 'Натрий ацетаты + этанол → этилацетат', 'Sodium acetate + ethanol → ethyl acetate')], correct: 0,
        why: L('Более активное производное превращается в менее активное, но не наоборот: хлорангидрид → эфир.', 'Белсендірек туынды белсенділігі аз туындыға айналады, бірақ керісінше емес: хлорангидрид → эфир.', 'A more reactive derivative can be turned into a less reactive one, not the reverse: acyl chloride → ester.') },
      { id: 'free', kind: 'text', task: L('Сравните ваш практический выход с рассчитанной максимальной степенью превращения при двукратном избытке кислоты. Объясните, на каких стадиях (по диаграмме «куда делся продукт») теряется эфир и как можно повысить выход.', 'Практикалық шығымыңызды қышқыл екі есе артық болғандағы есептелген ең жоғары айналу дәрежесімен салыстырыңыз. Эфир қай сатыларда жоғалатынын («өнім қайда кетті» диаграммасы бойынша) және шығымды қалай арттыруға болатынын түсіндіріңіз.', 'Compare your percent yield with the calculated maximum conversion for a twofold excess of acid. Explain at which stages (see the “where did the product go” chart) the ester is lost and how the yield could be raised.') },
    ],
  },
  customSteps: ['./steps/funnel.js', './steps/balance.js'],
};
