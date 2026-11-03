/** Опыт 3. Определение температуры плавления. Методичка, раздел 6, опыт 3. */
import { L, n } from '../../app/i18n.js';
import { mpRange } from './model.js';
import { capScene } from './scene.js';

const c0 = {
  type: 'process', id: 'cap',
  title: L('Набивка капилляра', 'Капиллярды толтыру', 'Filling the capillary'),
  instr: L('<ol><li>Высушенную пробу разотрите на часовом стекле.</li><li>Наберите порошок в капилляр и уплотните, бросая капилляр запаянным концом вниз через длинную стеклянную трубку, до слоя <b>2–3 мм</b>.</li></ol>',
    '<ol><li>Кептірілген сынаманы сағат шынысында ұнтақтаңыз.</li><li>Ұнтақты капиллярға алып, капиллярды дәнекерленген ұшымен төмен қаратып ұзын шыны түтік арқылы тастай отырып, <b>2–3 мм</b> қабатқа дейін тығыздаңыз.</li></ol>',
    '<ol><li>Grind the dried sample on a watch glass.</li><li>Push the open end of the capillary into the powder and pack it by dropping the capillary, sealed end down, through a long glass tube until the layer is <b>2–3 mm</b>.</li></ol>'),
  need: L('Набейте капилляр слоем 2–3 мм', 'Капиллярды 2–3 мм қабатпен толтырыңыз', 'Pack a 2–3 mm layer'),
  speeds: null,
  setup(S) { S.cap = { ground: false, loose: 0, packed: 0 }; },
  controls: [
    { kind: 'action', id: 'grind', label: L('Растереть пробу', 'Сынаманы ұнтақтау', 'Grind the sample'), advance: 60, do(S) { S.cap.ground = true; }, log: L('Проба растёрта в тонкий порошок', 'Сынама ұсақ ұнтаққа айналдырылды', 'Sample ground to a fine powder') },
    { kind: 'action', id: 'dip', once: false, label: L('Вдавить капилляр в порошок', 'Капиллярды ұнтаққа батыру', 'Push the capillary into the powder'), advance: 15,
      do(S, lc, ctx) {
        if (!S.cap.ground) ctx.remark({ key: 'grind', severity: 'minor', text: L('проба не растёрта — неплотная набивка капилляра', 'сынама ұнтақталмаған — капилляр тығыз толтырылмайды', 'sample not ground — loose packing of the capillary') });
        S.cap.loose += ctx.rng.range(0.8, 1.3);
      } },
    { kind: 'action', id: 'tap', once: false, label: L('Бросить через трубку (уплотнить)', 'Түтік арқылы тастау (тығыздау)', 'Drop through the tube (pack)'), advance: 15,
      do(S, lc, ctx) {
        const C = S.cap;
        if (!C.loose) { ctx.feedback(L('В капилляре нет порошка.', 'Капиллярда ұнтақ жоқ.', 'There is no powder in the capillary.'), 'warn'); return; }
        C.packed += C.loose * (C.ground ? 0.72 : 0.95); C.loose = 0;
        if (C.packed > 3.6) ctx.feedback(L('Слой больше 3–4 мм — интервал плавления растянется. Возьмите новый капилляр.', 'Қабат 3–4 мм-ден асты — балқу аралығы созылады. Жаңа капилляр алыңыз.', 'The layer is over 3–4 mm — the melting range will be broad. Take a new capillary.'), 'warn');
        else ctx.feedback(null);
      } },
    { kind: 'action', id: 'new', once: false, cls: 'danger', label: L('Взять новый капилляр', 'Жаңа капилляр алу', 'Take a new capillary'), do(S, lc, ctx) { S.cap.loose = 0; S.cap.packed = 0; ctx.feedback(null); } },
  ],
  readouts: (S) => [
    { label: L('Слой', 'Қабат', 'Layer'), value: { ru: n(S.cap.packed, 1) + ' мм', kk: n(S.cap.packed, 1) + ' мм', en: n(S.cap.packed, 1) + ' mm' }, st: S.cap.packed >= 2 && S.cap.packed <= 3.2 ? 'ok' : S.cap.packed > 3.2 ? 'warn' : '' },
    { label: L('Рыхлый порошок', 'Борпылдақ ұнтақ', 'Loose powder'), value: S.cap.loose ? { ru: n(S.cap.loose, 1) + ' мм', kk: n(S.cap.loose, 1) + ' мм', en: n(S.cap.loose, 1) + ' mm' } : '—' },
  ],
  done(S, lc, ctx) {
    const C = S.cap;
    if (C.packed >= 2 && C.packed <= 3.2 && C.loose === 0) {
      ctx.log(L(`Капилляр набит, слой ${n(C.packed, 1)} мм`, `Капилляр толтырылды, қабат ${n(C.packed, 1)} мм`, `Capillary packed, layer ${n(C.packed, 1)} mm`));
      return { text: L('Капилляр готов.', 'Капилляр дайын.', 'The capillary is ready.') };
    }
    return false;
  },
  scene: capScene,
};

const c1 = {
  type: 'read', mode: 'mp', id: 'mp',
  title: L('Определение температуры плавления', 'Балқу температурасын анықтау', 'Melting point determination'),
  instr: L('<ol><li>Поместите капилляр в прибор. Нагревайте быстро до ~125 °C, а вблизи ожидаемого значения — медленно, <b>1–2 °C/мин</b>.</li><li>Отметьте начало плавления (появление жидкости) и конец (вещество полностью прозрачное).</li><li>При наличии времени определите т. пл. исходной бензойной кислоты (лит. 122 °C).</li></ol>',
    '<ol><li>Капиллярды құралға салыңыз. ~125 °C-қа дейін тез, ал күтілетін мәнге жақын — баяу, <b>1–2 °C/мин</b> қыздырыңыз.</li><li>Балқудың басталуын (сұйықтықтың пайда болуы) және аяқталуын (зат толық мөлдір) белгілеңіз.</li><li>Уақыт болса, бастапқы бензой қышқылының балқу температурасын анықтаңыз (әдеб. 122 °C).</li></ol>',
    '<ol><li>Put the capillary into the apparatus. Heat quickly to ~125 °C, then near the expected value heat slowly, <b>1–2 °C/min</b>.</li><li>Mark the start of melting (first liquid) and the end (the sample is completely clear).</li><li>If time allows, determine the m.p. of the starting benzoic acid (lit. 122 °C).</li></ol>'),
  need: L('Отметьте начало и конец плавления продукта', 'Өнім балқуының басы мен соңын белгілеңіз', 'Mark the start and end of melting of the product'),
  samples: [
    { id: 'prod', required: true, name: L('продукт', 'өнім', 'product'), range: (S) => mpRange(S.purity, S.water, S.cap.packed, S.cap.ground), layer: (S) => S.cap.packed },
    { id: 'ba', required: false, name: L('бензойная кислота', 'бензой қышқылы', 'benzoic acid'), range: () => ({ on: 121.4, end: 122.4 }), layer: () => 2.5 },
  ],
  saveAs: 'mp',
  onRecord(S, id, on, end, ctx) {
    if (id === 'prod') {
      const good = on >= 138.5 && end <= 142.5;
      ctx.feedback(L(`Интервал плавления продукта: <b>${n(on, 1)}–${n(end, 1)} °C</b> (лит. 140–141 °C). ${good ? 'Узкий интервал — продукт чистый.' : 'Интервал занижен или растянут — продукт загрязнён либо нагрев был слишком быстрым.'}`,
        `Өнімнің балқу аралығы: <b>${n(on, 1)}–${n(end, 1)} °C</b> (әдеб. 140–141 °C). ${good ? 'Тар аралық — өнім таза.' : 'Аралық төмендеген немесе созылған — өнім ластанған не қыздыру тым жылдам болды.'}`,
        `Melting range of the product: <b>${n(on, 1)}–${n(end, 1)} °C</b> (lit. 140–141 °C). ${good ? 'A narrow range — the product is pure.' : 'The range is low or broad — the product is impure or the heating was too fast.'}`), good ? 'good' : 'warn');
    } else {
      ctx.feedback(L(`Бензойная кислота: ${n(on, 1)}–${n(end, 1)} °C (лит. 122 °C).`, `Бензой қышқылы: ${n(on, 1)}–${n(end, 1)} °C (әдеб. 122 °C).`, `Benzoic acid: ${n(on, 1)}–${n(end, 1)} °C (lit. 122 °C).`), 'good');
    }
  },
};

const c2 = {
  type: 'observe', id: 'mp-concl',
  title: L('Вывод о чистоте продукта', 'Өнімнің тазалығы туралы қорытынды', 'Conclusion on purity'),
  instr: L('<p>Сравните найденный интервал плавления с литературным значением 140–141 °C и сделайте вывод.</p>', '<p>Табылған балқу аралығын әдебиеттегі 140–141 °C мәнімен салыстырып, қорытынды жасаңыз.</p>', '<p>Compare the melting range you found with the literature value of 140–141 °C and draw a conclusion.</p>'),
  need: L('Сделайте вывод', 'Қорытынды жасаңыз', 'Draw the conclusion'),
  question: L('Что показывает интервал плавления вашего продукта?', 'Өніміңіздің балқу аралығы нені көрсетеді?', 'What does the melting range of your product show?'),
  options: [
    { id: 'pure', label: L('Узкий интервал, близкий к 140–141 °C: м-нитробензойная кислота, чистая', 'Тар аралық, 140–141 °C-қа жақын: м-нитробензой қышқылы, таза', 'A narrow range close to 140–141 °C: m-nitrobenzoic acid, pure') },
    { id: 'impure', label: L('Интервал занижен и растянут: продукт загрязнён (орто-изомер, динитропроизводные, влага) — нужна повторная перекристаллизация', 'Аралық төмендеген және созылған: өнім ластанған (орто-изомер, динитро туындылар, ылғал) — қайта кристалдау қажет', 'The range is low and broad: the product is impure (ortho isomer, dinitro compounds, moisture) — recrystallise again') },
    { id: 'ba', label: L('Т. пл. около 122 °C: получилась бензойная кислота, нитрование не прошло', 'Балқу t шамамен 122 °C: бензой қышқылы шықты, нитрлеу жүрмеді', 'M.p. about 122 °C: it is benzoic acid; the nitration did not work') },
  ],
  correct: (S) => { const m = (S.mp || {}).prod || {}; return m.on >= 138.5 && m.end <= 142.5 ? 'pure' : 'impure'; },
  why: (S) => { const m = (S.mp || {}).prod || {}; return L(`Найдено ${n(m.on, 1)}–${n(m.end, 1)} °C при лит. 140–141 °C.`, `Табылғаны ${n(m.on, 1)}–${n(m.end, 1)} °C, әдеб. 140–141 °C.`, `Found ${n(m.on, 1)}–${n(m.end, 1)} °C vs lit. 140–141 °C.`); },
};

const c3 = {
  type: 'cleanup', id: 'clean',
  title: L('Уборка рабочего места', 'Жұмыс орнын жинау', 'Cleaning up'),
  instr: L('<p>Утилизируйте отходы по контейнерам, выключите приборы, закройте склянки и вымойте руки (разделы 10 и 14.3 правил ТБ).</p><p class="note">Кислые фильтраты и промывные воды — в ёмкость для кислотных отходов (раздел 7 методички).</p>',
    '<p>Қалдықтарды ыдыстар бойынша кәдеге жаратыңыз, құралдарды өшіріңіз, склянкаларды жабыңыз және қолыңызды жуыңыз (ҚТ ережелерінің 10 және 14.3-бөлімдері).</p><p class="note">Қышқыл фильтраттар мен жуынды сулар — қышқыл қалдықтар ыдысына (әдістеменің 7-бөлімі).</p>',
    '<p>Dispose of the waste in the right containers, switch off the instruments, close the bottles and wash your hands (safety rules sections 10 and 14.3).</p><p class="note">Acidic filtrates and washings go into the acid waste container (manual, section 7).</p>'),
  need: L('Уберите рабочее место', 'Жұмыс орнын жинаңыз', 'Clean up the bench'),
  bins: ['acid', 'organic', 'solid', 'glass', 'sink', 'trash'],
  items: [
    { id: 'filtrate', bin: 'acid', label: L('Кислый фильтрат и промывные воды', 'Қышқыл фильтрат және жуынды сулар', 'Acidic filtrate and washings'),
      wrong: { sink: { severity: 'safety', text: L('кислый фильтрат вылит в раковину (п. 10.2 правил ТБ)', 'қышқыл фильтрат раковинаға төгілді (ҚТ ережелерінің 10.2-тармағы)', 'acidic filtrate poured down the sink (safety rule 10.2)'), whatif: L('Кислота разрушает трубы, а нитросоединения попадают в канализацию. Кислые водные отходы собирают в отдельную ёмкость.', 'Қышқыл құбырларды бұзады, ал нитроқосылыстар кәрізге түседі. Қышқыл сулы қалдықтарды бөлек ыдысқа жинайды.', 'Acid corrodes the drains and nitro compounds get into the sewer. Acidic aqueous waste is collected in a separate container.') } } },
    { id: 'mother', bin: 'acid', label: L('Маточный раствор после перекристаллизации', 'Қайта кристалдаудан кейінгі аналық ерітінді', 'Mother liquor from the recrystallisation') },
    { id: 'tubes', bin: 'acid', label: L('Содержимое пробирок (NaHCO₃, NaOH, HCl, FeCl₃)', 'Пробиркалардағы заттар (NaHCO₃, NaOH, HCl, FeCl₃)', 'Contents of the test tubes (NaHCO₃, NaOH, HCl, FeCl₃)') },
    { id: 'paper', bin: 'solid', label: L('Использованные фильтры и индикаторная бумага', 'Пайдаланылған сүзгілер мен индикатор қағазы', 'Used filter paper and indicator paper') },
    { id: 'caps', bin: 'glass', label: L('Использованные капилляры', 'Пайдаланылған капиллярлар', 'Used capillaries') },
  ],
  switches: [
    { id: 'hot', label: L('Выключить плитку и прибор т. пл.', 'Плита мен балқу t құралын өшіру', 'Switch off the hot plate and the m.p. apparatus') },
    { id: 'pump', label: L('Закрыть воду водоструйного насоса', 'Су ағынды сорғының суын жабу', 'Turn off the water to the aspirator') },
    { id: 'bottles', label: L('Закрыть склянки, вернуть на место', 'Склянкаларды жауып, орнына қою', 'Close the bottles and put them back') },
    { id: 'hands', label: L('Вымыть руки', 'Қолды жуу', 'Wash your hands'), log: L('Руки вымыты с мылом (нитросоединения всасываются через кожу)', 'Қол сабынмен жуылды (нитроқосылыстар тері арқылы сіңеді)', 'Hands washed with soap (nitro compounds are absorbed through the skin)') },
  ],
};

/* Подсказки набивки капилляра (сессия Q). */
c0.hints = [
  L('Для точной т. пл. нужен плотный тонкий слой: пробу растирают, капилляр набивают уплотняя.', 'Дәл балқу температурасы үшін тығыз жұқа қабат керек: сынаманы ұнтақтап, капиллярды нығыздап толтырады.', 'An accurate m.p. needs a thin, dense layer: the sample is ground and packed down in the capillary.'),
  L('Рыхлый порошок не считается — после каждого набора бросайте капилляр через трубку. Слой больше 3 мм — возьмите новый капилляр.', 'Борпылдақ ұнтақ есептелмейді — әр толтырудан кейін капиллярды түтік арқылы тастаңыз. Қабат 3 мм-ден көп — жаңа капилляр алыңыз.', 'Loose powder does not count — drop the capillary through the tube after each loading. Layer over 3 mm — take a new capillary.'),
  L('«Растереть пробу» → «Вдавить капилляр в порошок» → «Бросить через трубку (уплотнить)», повторять до слоя 2–3 мм.', '«Сынаманы ұнтақтау» → «Капиллярды ұнтаққа батыру» → «Түтік арқылы тастау (тығыздау)», 2–3 мм қабатқа дейін қайталау.', '“Grind the sample” → “Push the capillary into the powder” → “Drop through the tube (pack)”, repeat until the layer is 2–3 mm.'),
];

export default {
  id: '3',
  title: L('Определение температуры плавления', 'Балқу температурасын анықтау', 'Melting point determination'),
  principle: L('Чистое вещество плавится в узком интервале, близком к литературному значению; примеси (орто-изомер, непрореагировавшая бензойная кислота) понижают и растягивают интервал плавления.', 'Таза зат әдебиеттегі мәнге жақын тар аралықта балқиды; қоспалар (орто-изомер, әрекеттеспеген бензой қышқылы) балқу аралығын төмендетіп, созады.', 'A pure compound melts over a narrow range close to the literature value; impurities (the ortho isomer, unreacted benzoic acid) lower and broaden the melting range.'),
  equation: [],
  initialState: ({ prev }) => ({ purity: (prev['1'] || {}).purity ?? 0.97, water: (prev['1'] || {}).water ?? 0, cap: { ground: false, loose: 0, packed: 0 }, mp: {} }),
  checkpoints: [0],
  steps: [c0, c1, c2, c3],
  results: (S) => ({ mp: (S.mp || {}).prod || null, ba: (S.mp || {}).ba || null, layer: S.cap.packed }),
  summary: (r) => [
    { label: L('Т. пл. продукта', 'Өнімнің балқу t', 'M.p. of product'), value: r.mp ? `${n(r.mp.on, 1)}–${n(r.mp.end, 1)} °C` : '—', st: r.mp && r.mp.on >= 138.5 ? 'ok' : 'warn' },
    { label: L('Т. пл. бензойной к-ты', 'Бензой қ-ның балқу t', 'M.p. of benzoic acid'), value: r.ba ? `${n(r.ba.on, 1)}–${n(r.ba.end, 1)} °C` : '—' },
  ],
};
