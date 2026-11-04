/** Опыт 4. Строение по спектральным данным (письменное упражнение). Методичка, раздел 6, опыт 4. */
import { L, n } from '../../app/i18n.js';
import { karplusScene, ringNmrScene } from './scene.js';

const s0 = {
  type: 'quiz', id: 'ref',
  title: L('Справочные данные и зависимость Карплуса', 'Анықтамалық деректер және Карплус тәуелділігі', 'Reference data and the Karplus relationship'),
  instr: L('<p>Вицинальная константа ³J(H,H) зависит от двугранного угла между связями C–H (зависимость Карплуса). Справочные значения: ³J(транс-CH=CH) 11–18 Гц, ³J(цис-CH=CH) 6–14 Гц; в циклогексанах ³J(ax,ax) 8–13 Гц, ³J(ax,eq) и ³J(eq,eq) 2–5 Гц; ИК, внеплоскостные δ(C–H): транс-CH=CH ≈ 965 см⁻¹, цис ≈ 690 см⁻¹.</p><p class="note">Кривая на стенде показывает форму зависимости (справочно).</p>',
    '<p>³J(H,H) вициналды тұрақтысы C–H байланыстары арасындағы екіжақты бұрышқа тәуелді (Карплус тәуелділігі). Анықтамалық мәндер: ³J(транс-CH=CH) 11–18 Гц, ³J(цис-CH=CH) 6–14 Гц; циклогександарда ³J(ax,ax) 8–13 Гц, ³J(ax,eq) және ³J(eq,eq) 2–5 Гц; ИҚ, жазықтықтан тыс δ(C–H): транс-CH=CH ≈ 965 см⁻¹, цис ≈ 690 см⁻¹.</p><p class="note">Стендтегі қисық тәуелділіктің пішінін көрсетеді (анықтама үшін).</p>',
    '<p>The vicinal coupling constant ³J(H,H) depends on the dihedral angle between the C–H bonds (Karplus relationship). Reference values: ³J(trans-CH=CH) 11–18 Hz, ³J(cis-CH=CH) 6–14 Hz; in cyclohexanes ³J(ax,ax) 8–13 Hz, ³J(ax,eq) and ³J(eq,eq) 2–5 Hz; IR out-of-plane δ(C–H): trans-CH=CH ≈ 965 cm⁻¹, cis ≈ 690 cm⁻¹.</p><p class="note">The curve on the bench shows the shape of the relationship (for reference).</p>'),
  need: L('Ответьте на вопросы', 'Сұрақтарға жауап беріңіз', 'Answer the questions'),
  scene: () => karplusScene(),
  questions: [
    { q: L('При каком двугранном угле H–C–C–H вицинальная константа ³J наибольшая?', 'H–C–C–H екіжақты бұрышы қандай болғанда ³J вициналды тұрақтысы ең үлкен?', 'At which H–C–C–H dihedral angle is the vicinal ³J largest?'), options: ['≈ 180°', '≈ 90°', '≈ 60°', L('не зависит от угла', 'бұрышқа тәуелді емес', 'it does not depend on the angle')], correct: 0, why: L('Максимум при 180° (антиперипланарное расположение), минимум около 90°.', 'Максимумы 180°-та (антиперипланар орналасу), минимумы шамамен 90°-та.', 'Maximum at 180° (antiperiplanar), minimum near 90°.') },
    { q: L('Почему ³J(ax,ax) в циклогексанах большая (8–13 Гц)?', 'Неге циклогександарда ³J(ax,ax) үлкен (8–13 Гц)?', 'Why is ³J(ax,ax) in cyclohexanes large (8–13 Hz)?'), options: [L('Два аксиальных H у соседних атомов расположены под углом ≈ 180°', 'Көрші атомдардағы екі аксиалды H шамамен 180° бұрышта орналасқан', 'Two axial H atoms on neighbouring carbons are at ≈ 180°'), L('Аксиальные H ближе к ядру углерода', 'Аксиалды H көміртек ядросына жақын', 'Axial H atoms are closer to the carbon nucleus'), L('Из-за 1,3-диаксиальных взаимодействий', '1,3-диаксиалды әрекеттесулерге байланысты', 'Because of 1,3-diaxial interactions'), L('Аксиальные H не взаимодействуют', 'Аксиалды H әрекеттеспейді', 'Axial H atoms do not couple')], correct: 0, why: L('ax,ax ≈ 180°; ax,eq и eq,eq ≈ 60° — поэтому 2–5 Гц.', 'ax,ax ≈ 180°; ax,eq және eq,eq ≈ 60° — сондықтан 2–5 Гц.', 'ax,ax ≈ 180°; ax,eq and eq,eq ≈ 60° — hence 2–5 Hz.') },
  ],
};

const nameA = L('Изомер A', 'A изомері', 'Isomer A'), nameB = L('Изомер B', 'B изомері', 'Isomer B');
const nmr = (id, name, key) => ({
  type: 'lab13-spectrum', id, mode: 'nmr', name, saveAs: key,
  iso: (S) => S.cinn[key],
  title: L(`Коричная кислота: изомер ${key}`, `Даршын қышқылы: ${key} изомері`, `Cinnamic acid: isomer ${key}`),
  instr: L('<ol><li>Перед вами фрагмент спектра ЯМР ¹H (400 МГц) одной из изомерных коричных кислот C₆H₅–CH=CH–COOH: сигналы двух винильных протонов — два дублета. Над пиками — их положения (м. д.).</li><li>Рассчитайте ³J(H,H) = Δδ × 400 (Гц) по расстоянию между линиями одного дублета.</li><li>Отнесите конфигурацию E или Z.</li></ol>',
    '<ol><li>Алдыңызда изомерлі даршын қышқылдарының C₆H₅–CH=CH–COOH біреуінің ¹H ЯМР спектрінің (400 МГц) үзіндісі: екі винил протонының сигналдары — екі дублет. Шыңдардың үстінде — олардың орындары (м. ү.).</li><li>Бір дублет сызықтарының арасындағы қашықтық бойынша ³J(H,H) = Δδ × 400 (Гц) есептеңіз.</li><li>E немесе Z конфигурациясын анықтаңыз.</li></ol>',
    '<ol><li>This is part of the ¹H NMR spectrum (400 MHz) of one of the isomeric cinnamic acids C₆H₅–CH=CH–COOH: the two vinyl protons give two doublets. Peak positions (ppm) are printed above the peaks.</li><li>Calculate ³J(H,H) = Δδ × 400 (Hz) from the spacing of the lines of one doublet.</li><li>Assign the configuration E or Z.</li></ol>'),
  need: L('Рассчитайте ³J и отнесите конфигурацию', '³J есептеп, конфигурацияны анықтаңыз', 'Calculate ³J and assign the configuration'),
});
const s1 = nmr('nmrA', nameA, 'A');
const s2 = nmr('nmrB', nameB, 'B');

const s3 = {
  type: 'lab13-spectrum', id: 'ir', mode: 'ir', name: L('Окт-4-ен, образец C', 'Окт-4-ен, C үлгісі', 'Oct-4-ene, sample C'), saveAs: 'ir',
  iso: (S) => S.irIso,
  title: L('ИК-спектр: цис или транс?', 'ИҚ спектрі: цис пе, транс па?', 'IR spectrum: cis or trans?'),
  instr: L('<ol><li>Перед вами ИК-спектр одного из изомерных окт-4-енов CH₃(CH₂)₂–CH=CH–(CH₂)₂CH₃ (задача преподавателя).</li><li>Найдите курсором сильную полосу внеплоскостных деформационных колебаний =C–H (область 1000–650 см⁻¹ выделена) и отметьте её.</li><li>Отнесите конфигурацию двойной связи.</li></ol>',
    '<ol><li>Алдыңызда изомерлі окт-4-ендердің CH₃(CH₂)₂–CH=CH–(CH₂)₂CH₃ біреуінің ИҚ спектрі (оқытушының есебі).</li><li>Курсормен =C–H жазықтықтан тыс деформациялық тербелістерінің күшті жолағын тауып (1000–650 см⁻¹ аймағы белгіленген), оны белгілеңіз.</li><li>Қос байланыстың конфигурациясын анықтаңыз.</li></ol>',
    '<ol><li>This is the IR spectrum of one of the isomeric oct-4-enes CH₃(CH₂)₂–CH=CH–(CH₂)₂CH₃ (a problem set by the teacher).</li><li>Find with the cursor the strong out-of-plane =C–H bending band (the 1000–650 cm⁻¹ region is shaded) and mark it.</li><li>Assign the configuration of the double bond.</li></ol>'),
  need: L('Отметьте диагностическую полосу и отнесите конфигурацию', 'Диагностикалық жолақты белгілеп, конфигурацияны анықтаңыз', 'Mark the diagnostic band and assign the configuration'),
};

const s4 = {
  type: 'quiz', id: 'ring',
  title: L('Конформация заместителя в цикле по ³J', '³J бойынша циклдегі орынбасардың конформациясы', 'Ring substituent conformation from ³J'),
  instr: L('<p>Задача преподавателя: два изомера 4-<i>трет</i>-бутилциклогексанола. Объёмная группа <i>трет</i>-C₄H₉ всегда экваториальна и «закрепляет» кресло. Сигнал протона H-1 (CH–OH) у изомеров различается (см. стенд). По константам определите положение H-1 и группы OH.</p>',
    '<p>Оқытушының есебі: 4-<i>трет</i>-бутилциклогексанолдың екі изомері. Көлемді <i>трет</i>-C₄H₉ тобы әрқашан экваториалды және креслоны «бекітеді». Изомерлерде H-1 (CH–OH) протонының сигналы әртүрлі (стендті қараңыз). Тұрақтылар бойынша H-1 мен OH тобының күйін анықтаңыз.</p>',
    '<p>A problem set by the teacher: two isomers of 4-<i>tert</i>-butylcyclohexanol. The bulky <i>tert</i>-C₄H₉ group is always equatorial and “locks” the chair. The signal of H-1 (CH–OH) differs between the isomers (see the bench). Use the coupling constants to find the position of H-1 and of the OH group.</p>'),
  need: L('Ответьте на вопросы', 'Сұрақтарға жауап беріңіз', 'Answer the questions'),
  scene: () => ringNmrScene({ X: 'ax', Y: 'eq' }),
  questions: [
    { q: L('В изомере X сигнал H-1 — триплет триплетов с J = 11,0 и 4,3 Гц. Каково положение H-1 и OH?', 'X изомерінде H-1 сигналы — J = 11,0 және 4,3 Гц триплеттер триплеті. H-1 мен OH күйі қандай?', 'In isomer X the H-1 signal is a triplet of triplets with J = 11.0 and 4.3 Hz. What are the positions of H-1 and OH?'), options: [L('H-1 аксиальный, OH экваториальная (транс-изомер)', 'H-1 аксиалды, OH экваториалды (транс-изомер)', 'H-1 axial, OH equatorial (trans isomer)'), L('H-1 экваториальный, OH аксиальная (цис-изомер)', 'H-1 экваториалды, OH аксиалды (цис-изомер)', 'H-1 equatorial, OH axial (cis isomer)'), L('по спектру определить нельзя', 'спектр бойынша анықтау мүмкін емес', 'it cannot be determined from the spectrum')], correct: 0, why: L('J = 11 Гц — ³J(ax,ax) (8–13 Гц): у H-1 есть два аксиальных соседа, значит H-1 аксиален.', 'J = 11 Гц — ³J(ax,ax) (8–13 Гц): H-1-дің екі аксиалды көршісі бар, демек H-1 аксиалды.', 'J = 11 Hz is ³J(ax,ax) (8–13 Hz): H-1 has two axial neighbours, so H-1 is axial.') },
    { q: L('В изомере Y сигнал H-1 узкий, все J ≈ 3 Гц. Каково положение H-1?', 'Y изомерінде H-1 сигналы тар, барлық J ≈ 3 Гц. H-1 күйі қандай?', 'In isomer Y the H-1 signal is narrow, all J ≈ 3 Hz. What is the position of H-1?'), options: [L('экваториальное (OH аксиальная)', 'экваториалды (OH аксиалды)', 'equatorial (OH axial)'), L('аксиальное (OH экваториальная)', 'аксиалды (OH экваториалды)', 'axial (OH equatorial)'), L('H-1 в плоскости цикла не находится', 'H-1 цикл жазықтығында орналаспайды', 'H-1 is not in the ring plane')], correct: 0, why: L('Только ³J(ax,eq) и ³J(eq,eq) по 2–5 Гц — H-1 экваториален.', 'Тек 2–5 Гц ³J(ax,eq) және ³J(eq,eq) — H-1 экваториалды.', 'Only ³J(ax,eq) and ³J(eq,eq) of 2–5 Hz — H-1 is equatorial.') },
  ],
};
s4.onLeave = (S, ctx) => { S.ring = true; ctx.log(L('4-трет-Бутилциклогексанол: изомер X — H-1 аксиальный (³J(ax,ax) = 11,0 Гц), OH экваториальная (транс); изомер Y — H-1 экваториальный (J ≈ 3 Гц), OH аксиальная (цис)', '4-трет-Бутилциклогексанол: X изомері — H-1 аксиалды (³J(ax,ax) = 11,0 Гц), OH экваториалды (транс); Y изомері — H-1 экваториалды (J ≈ 3 Гц), OH аксиалды (цис)', '4-tert-Butylcyclohexanol: isomer X — H-1 axial (³J(ax,ax) = 11.0 Hz), OH equatorial (trans); isomer Y — H-1 equatorial (J ≈ 3 Hz), OH axial (cis)'), 'obs'); };

const s5 = {
  type: 'quiz', id: 'methods',
  title: L('Дипольный момент и другие методы', 'Дипольдік момент және басқа әдістер', 'Dipole moment and other methods'),
  instr: L('<p>Задачи преподавателя по таблице методов изучения пространственного строения (раздел 3.2 методички).</p>', '<p>Кеңістіктік құрылысты зерттеу әдістерінің кестесі бойынша оқытушының есептері (әдістеменің 3.2-бөлімі).</p>', '<p>Problems set by the teacher on the table of methods for studying spatial structure (manual, section 3.2).</p>'),
  need: L('Ответьте на вопросы', 'Сұрақтарға жауап беріңіз', 'Answer the questions'),
  questions: [
    { q: L('Два образца 1,2-дихлорэтена имеют дипольные моменты 1,9 D и 0 D. Какой из них цис-изомер?', '1,2-дихлорэтеннің екі үлгісінің дипольдік моменттері 1,9 D және 0 D. Қайсысы цис-изомер?', 'Two samples of 1,2-dichloroethene have dipole moments of 1.9 D and 0 D. Which is the cis isomer?'), options: [L('μ = 1,9 D: диполи связей C–Cl складываются', 'μ = 1,9 D: C–Cl байланыстарының дипольдері қосылады', 'μ = 1.9 D: the C–Cl bond dipoles add up'), L('μ = 0 D: диполи компенсируются', 'μ = 0 D: дипольдер теңеседі', 'μ = 0 D: the dipoles cancel'), L('оба одинаковы', 'екеуі бірдей', 'both are the same')], correct: 0, why: L('В транс-изомере полярные связи направлены противоположно и взаимно компенсируются (μ = 0).', 'Транс-изомерде полюсті байланыстар қарама-қарсы бағытталған және өзара теңеседі (μ = 0).', 'In the trans isomer the polar bonds point in opposite directions and cancel (μ = 0).') },
    { q: L('Какой метод позволяет непосредственно установить абсолютную конфигурацию? Каково его ограничение?', 'Қай әдіс абсолютті конфигурацияны тікелей анықтауға мүмкіндік береді? Оның шектеуі қандай?', 'Which method establishes the absolute configuration directly? What is its limitation?'), options: [L('Рентгеноструктурный анализ (аномальное рассеяние); нужен монокристалл', 'Рентгенқұрылымдық талдау (аномалды шашырау); монокристалл қажет', 'X-ray crystallography (anomalous dispersion); a single crystal is needed'), L('ИК-спектроскопия; только для алкенов', 'ИҚ спектроскопия; тек алкендер үшін', 'IR spectroscopy; only for alkenes'), L('Измерение дипольного момента; только для газов', 'Дипольдік моментті өлшеу; тек газдар үшін', 'Dipole moment measurement; only for gases'), L('Температура плавления; нужна чистота', 'Балқу температурасы; тазалық қажет', 'Melting point; purity is needed')], correct: 0, why: L('Bijvoet (1951) — абсолютная конфигурация (+)-винной кислоты по её натрий-рубидиевой соли.', 'Bijvoet (1951) — (+)-шарап қышқылының натрий-рубидий тұзы бойынша абсолютті конфигурациясы.', 'Bijvoet (1951) — the absolute configuration of (+)-tartaric acid from its sodium rubidium salt.') },
    { q: L('Какую информацию о белках дают спектры кругового дихроизма?', 'Дөңгелек дихроизм спектрлері ақуыздар туралы қандай ақпарат береді?', 'What information about proteins do circular dichroism spectra give?'), options: [L('Вторичную структуру: α-спираль даёт отрицательные полосы при 208 и 222 нм', 'Екіншілік құрылымды: α-спираль 208 және 222 нм-де теріс жолақтар береді', 'Secondary structure: an α-helix gives negative bands at 208 and 222 nm'), L('Молярную массу белка', 'Ақуыздың молярлық массасын', 'The molar mass of the protein'), L('Аминокислотную последовательность', 'Аминқышқылдық тізбекті', 'The amino-acid sequence'), L('Число дисульфидных мостиков', 'Дисульфидтік көпірлердің санын', 'The number of disulfide bridges')], correct: 0, why: L('Методичка, раздел 3.2 (вопрос 10 для самоконтроля).', 'Әдістеме, 3.2-бөлім (өзін-өзі бақылаудың 10-сұрағы).', 'Manual, section 3.2 (self-control question 10).') },
  ],
};

export default {
  id: '4',
  title: L('Строение по спектральным данным (письменное упражнение)', 'Спектрлік деректер бойынша құрылыс (жазбаша жаттығу)', 'Assignment of spatial structure from spectral data (desk exercise)'),
  principle: L('Вицинальные константы спин-спинового взаимодействия ¹H–¹H зависят от двугранного угла между связями C–H (зависимость Карплуса), а характеристические полосы ИК-спектра — от геометрии молекулы. Эти данные позволяют установить конфигурацию двойных связей и конформацию циклов.',
    '¹H–¹H спин-спиндік әрекеттесудің вициналды тұрақтылары C–H байланыстары арасындағы екіжақты бұрышқа (Карплус тәуелділігі), ал ИҚ спектрінің сипаттамалық жолақтары молекула геометриясына тәуелді. Бұл деректер қос байланыстардың конфигурациясын және циклдердің конформациясын анықтауға мүмкіндік береді.',
    'Vicinal ¹H–¹H coupling constants depend on the dihedral angle between the C–H bonds (Karplus relationship), and characteristic IR bands depend on the geometry of the molecule. These data allow the configuration of double bonds and the conformation of rings to be assigned.'),
  equation: [],
  initialState: ({ rng }) => {
    const aE = rng.next() < 0.5;
    return { cinn: { A: aE ? 'E' : 'Z', B: aE ? 'Z' : 'E' }, irIso: rng.next() < 0.5 ? 'trans' : 'cis', A: null, B: null, ir: null, ring: false };
  },
  checkpoints: [0],
  steps: [s0, s1, s2, s3, s4, s5],
  results(S) {
    return { isoA: S.cinn.A, isoB: S.cinn.B, JA: S.A ? S.A.J : null, JB: S.B ? S.B.J : null, okA: S.A ? !!S.A.ok : false, okB: S.B ? !!S.B.ok : false, irIso: S.irIso, band: S.ir ? S.ir.band : null, okIR: S.ir ? !!S.ir.ok : false };
  },
  summary: (r) => [
    { label: nameA, value: r.JA != null ? { ru: `${n(r.JA, 1)} Гц → ${r.isoA}`, kk: `${n(r.JA, 1)} Гц → ${r.isoA}`, en: `${n(r.JA, 1)} Hz → ${r.isoA}` } : '—', st: r.okA ? 'ok' : 'warn' },
    { label: nameB, value: r.JB != null ? { ru: `${n(r.JB, 1)} Гц → ${r.isoB}`, kk: `${n(r.JB, 1)} Гц → ${r.isoB}`, en: `${n(r.JB, 1)} Hz → ${r.isoB}` } : '—', st: r.okB ? 'ok' : 'warn' },
    { label: L('ИК', 'ИҚ', 'IR'), value: r.band ? { ru: `${r.band} см⁻¹ → ${r.irIso === 'trans' ? 'транс' : 'цис'}`, kk: `${r.band} см⁻¹ → ${r.irIso === 'trans' ? 'транс' : 'цис'}`, en: `${r.band} cm⁻¹ → ${r.irIso}` } : '—', st: r.okIR ? 'ok' : 'warn' },
  ],
};
