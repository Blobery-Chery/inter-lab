/** Опыт 5. Кето-енольная таутомерия ацетоуксусного эфира. Методичка, раздел 6, опыт 5. */
import { L, n } from '../../app/i18n.js';
import { enolRelax, enolBrom, enolColor, ENOL } from './model.js';
import { tubesScene, hoodScene } from './scene.js';

/* ---------- 1. Где работать с бромной водой ---------- */
const s0 = {
  type: 'decide', id: 'where',
  title: L('Бромная вода: где работать', 'Бромды су: қай жерде жұмыс істеу', 'Bromine water: where to work'),
  instr: L('<p>В опытах 5 и 7 используют насыщенную бромную воду. Бром летуч, его пары ядовиты и раздражают слизистые.</p>', '<p>5 және 7-тәжірибелерде қаныққан бромды су қолданылады. Бром ұшқыш, оның булары улы және сілемейлі қабықтарды тітіркендіреді.</p>', '<p>Experiments 5 and 7 use saturated bromine water. Bromine is volatile; its vapour is toxic and irritates the mucous membranes.</p>'),
  need: L('Выберите правильное место', 'Дұрыс орынды таңдаңыз', 'Choose the right place'),
  scene: (S) => hoodScene(S, { on: { hood: true } }),
  question: L('Где вы будете работать с бромной водой?', 'Бромды сумен қай жерде жұмыс істейсіз?', 'Where will you work with the bromine water?'),
  options: [
    { id: 'hood', ok: true, label: L('В вытяжном шкафу с включённой тягой и опущенным экраном', 'Тартымы қосулы, экраны түсірілген тартпа шкафта', 'In the fume hood with the airflow on and the sash lowered'),
      why: L('Раздел 7 методички: бромная вода выделяет ядовитые пары брома — работать в вытяжном шкафу.', 'Әдістеменің 7-бөлімі: бромды су бромның улы буларын бөледі — тартпа шкафта жұмыс істеу керек.', 'Manual, section 7: bromine water releases toxic bromine vapour — work in the fume hood.'),
      log: L('Работа с бромной водой — в вытяжном шкафу', 'Бромды сумен жұмыс — тартпа шкафта', 'Bromine water is handled in the fume hood') },
    { id: 'window', ok: false, severity: 'safety', retry: true, label: L('На рабочем столе у открытого окна — проветрится', 'Ашық терезе жанындағы жұмыс үстелінде — желденеді', 'On the bench by an open window — it will air out'),
      remark: L('работа с бромной водой вне вытяжного шкафа (раздел 7 методички, п. 4.4 правил ТБ)', 'бромды сумен тартпа шкафтан тыс жұмыс (әдістеменің 7-бөлімі, ҚТ ережелерінің 4.4-тармағы)', 'working with bromine water outside the fume hood (manual section 7, safety rule 4.4)'),
      whatif: L('Пары брома тяжелее воздуха и стелются по столу: у вас и соседей — резь в глазах, кашель, возможен химический ожог дыхательных путей. Окно этого не предотвращает.', 'Бром булары ауадан ауыр және үстел бетімен жайылады: сізде және көршілерде — көз ашуы, жөтел, тыныс жолдарының химиялық күйігі болуы мүмкін. Терезе мұның алдын алмайды.', 'Bromine vapour is heavier than air and spreads over the bench: you and your neighbours get stinging eyes and coughing, and a chemical burn of the airways is possible. An open window does not prevent this.') },
    { id: 'sniff', ok: false, severity: 'safety', retry: true, label: L('Сначала понюхать склянку, чтобы убедиться, что бромная вода свежая', 'Бромды судың жаңа екеніне көз жеткізу үшін алдымен склянканы иіскеу', 'First sniff the bottle to make sure the bromine water is fresh'),
      remark: L('намерение нюхать бромную воду из склянки (пп. 2.5, 4.4 правил ТБ)', 'бромды суды склянкадан иіскеу ниеті (ҚТ ережелерінің 2.5, 4.4-тармақтары)', 'intended to sniff bromine water straight from the bottle (safety rules 2.5, 4.4)'),
      whatif: L('Вдох паров брома из горла склянки — ожог слизистой носа и гортани. Свежесть видна по цвету: бромная вода жёлто-оранжевая.', 'Склянка аузынан бром буын жұту — мұрын мен көмей сілемейлі қабығының күйігі. Жаңалығы түсінен көрінеді: бромды су сары-қызғылт сары.', 'Inhaling bromine vapour from the neck of the bottle burns the mucosa of the nose and throat. Freshness is seen from the colour: bromine water is yellow-orange.') },
  ],
};

/* ---------- 2. Проба ---------- */
const eTubes = [{ id: 'e', label: L('Пробирка', 'Пробирка', 'Tube'), short: L('ацетоуксусный эфир', 'ацетосірке эфирі', 'ethyl acetoacetate') }];
function sync(t, ctx) {
  const now = ctx.now();
  if (t.t0 != null) enolRelax(t, now - t.t0);
  t.t0 = now;
}
function paint(t, ctx, ahead = 0) {
  t.color = enolColor(t);
  const c = t.fe ? t.E / ENOL.eq : 0;
  if (t.fe && c < 0.15 && (t.B || 0) < 0.6 && !t.dec) { t.dec = true; t.decAt = ctx.now(); ctx.log(L('Красно-фиолетовая окраска исчезла', 'Қызыл-күлгін түс жоғалды', 'The red-violet colour disappeared'), 'obs'); }
  if (t.dec && c > 0.6) {
    t.dec = false; t.cycles = (t.cycles || 0) + 1;
    const dt = Math.round(ctx.now() + ahead - (t.decAt ?? ctx.now()));
    ctx.log(L(`Окраска вернулась через ≈ ${dt} с (цикл ${t.cycles})`, `Түсі ≈ ${dt} с өткен соң қайта пайда болды (${t.cycles}-цикл)`, `The colour returned after ≈ ${dt} s (cycle ${t.cycles})`), 'obs');
  }
}
const brom = (k) => ({ id: 'br' + k, group: L('Бромная вода', 'Бромды су', 'Bromine water'), label: L(`+${k} кап.`, `+${k} тамшы`, `+${k} ${k > 1 ? 'drops' : 'drop'}`), advance: 6 * k, disabled: (t) => !t.eaa,
  apply(t, S, ctx) {
    sync(t, ctx);
    for (let i = 0; i < k; i++) enolBrom(t);
    t.br = (t.br || 0) + k; t.v += 0.05 * k;
    if ((t.B || 0) > 1) ctx.remark({ key: 'eaa_br', severity: 'minor', text: L('избыток бромной воды: окраска долго не возвращается, раствор желтеет от брома', 'бромды су артық: түсі ұзақ қайта оралмайды, ерітінді бромнан сарғаяды', 'excess bromine water: the colour takes a long time to return and the solution turns yellow from the bromine') });
    paint(t, ctx);
  } });
const s1 = {
  type: 'test', id: 'enol',
  title: L('FeCl₃ и бромная вода', 'FeCl₃ және бромды су', 'FeCl₃ and bromine water'),
  instr: L('<ol><li>Встряхните <b>2–3 капли</b> ацетоуксусного эфира с <b>2 мл</b> воды и прибавьте <b>1–2 капли</b> раствора FeCl₃.</li><li>По каплям, встряхивая, прибавляйте бромную воду, пока окраска <b>только что</b> не исчезнет. Наблюдайте пробирку 1–2 минуты.</li><li>Повторите прибавление бромной воды несколько раз.</li></ol>',
    '<ol><li>Ацетосірке эфирінің <b>2–3 тамшысын</b> <b>2 мл</b> сумен сілкілеп, FeCl₃ ерітіндісінің <b>1–2 тамшысын</b> қосыңыз.</li><li>Түсі <b>жаңа ғана</b> жоғалғанша бромды суды сілкілей отырып тамшылатып қосыңыз. Пробирканы 1–2 минут бақылаңыз.</li><li>Бромды су қосуды бірнеше рет қайталаңыз.</li></ol>',
    '<ol><li>Shake <b>2–3 drops</b> of ethyl acetoacetate with <b>2 mL</b> of water and add <b>1–2 drops</b> of FeCl₃ solution.</li><li>Add bromine water dropwise with shaking until the colour <b>just</b> disappears. Watch the tube for 1–2 minutes.</li><li>Repeat the addition of bromine water several times.</li></ol>'),
  need: L('Пронаблюдайте возвращение окраски дважды', 'Түстің қайта оралуын екі рет бақылаңыз', 'Watch the colour return twice'),
  tubes: eTubes, reset: true,
  reagents: [
    { id: 'eaa', group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('3 кап. эфира + 2 мл воды, встряхнуть', '3 тамшы эфир + 2 мл су, сілкілеу', '3 drops of ester + 2 mL water, shake'), advance: 30, disabled: (t) => t.eaa,
      apply(t, S, ctx) { t.eaa = 1; t.v += 2.15; t.E = ENOL.eq; t.B = t.B || 0; t.t0 = ctx.now(); paint(t, ctx); ctx.log(L('2–3 капли ацетоуксусного эфира встряхнуты с 2 мл воды — мутноватый раствор', 'Ацетосірке эфирінің 2–3 тамшысы 2 мл сумен сілкіленді — сәл лайлы ерітінді', '2–3 drops of ethyl acetoacetate shaken with 2 mL of water — a slightly cloudy solution')); } },
    { id: 'fe', group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('FeCl₃ 1 %: +1 капля', 'FeCl₃ 1 %: +1 тамшы', 'FeCl₃ 1 %: +1 drop'), advance: 5, disabled: (t) => (t.fe || 0) >= 4,
      apply(t, S, ctx) {
        sync(t, ctx); const first = !t.fe; t.fe = (t.fe || 0) + 1; t.v += 0.05; paint(t, ctx);
        if (first && t.eaa && t.E > 0.5) ctx.log(L('С FeCl₃ появилась красно-фиолетовая окраска (енольная форма)', 'FeCl₃-пен қызыл-күлгін түс пайда болды (енол түрі)', 'A red-violet colour appeared with FeCl₃ (the enol form)'), 'obs');
      } },
    brom(1), brom(3),
    { id: 'wait', group: L('Наблюдение', 'Бақылау', 'Observation'), label: L('Наблюдать 30 с', '30 с бақылау', 'Watch for 30 s'), advance: 30, disabled: (t) => !t.eaa,
      apply(t, S, ctx) { const now = ctx.now(); enolRelax(t, now - (t.t0 ?? now) + 30); t.t0 = now + 30; paint(t, ctx, 30); } },
  ],
  done: (tb) => (tb.e.cycles || 0) >= 2,
  observe: {
    question: L('Что происходит с окраской?', 'Түсіне не болады?', 'What happens to the colour?'),
    options: [
      { id: 'ok', label: L('Красно-фиолетовая окраска исчезает от бромной воды и через короткое время возвращается; цикл повторяется', 'Қызыл-күлгін түс бромды судан жоғалып, біраз уақыттан кейін қайта оралады; цикл қайталанады', 'The red-violet colour disappears with bromine water and returns after a short time; the cycle repeats'), log: (S, tb) => L(`С FeCl₃ — красно-фиолетовая окраска; от бромной воды она исчезает и через короткое время возвращается; цикл повторён ${tb.e.cycles} раза`, `FeCl₃-пен — қызыл-күлгін түс; бромды судан ол жоғалып, біраз уақыттан кейін қайта оралады; цикл ${tb.e.cycles} рет қайталанды`, `A red-violet colour with FeCl₃; it disappears with bromine water and returns after a short time; the cycle was repeated ${tb.e.cycles} times`) },
      { id: 'once', label: L('Окраска исчезает и больше не появляется', 'Түсі жоғалып, қайта пайда болмайды', 'The colour disappears and never returns') },
      { id: 'never', label: L('Бромная вода окраску не меняет', 'Бромды су түсті өзгертпейді', 'Bromine water does not change the colour') },
      { id: 'ppt', label: L('Выпадает белый осадок', 'Ақ тұнба түзіледі', 'A white precipitate forms') },
    ],
    correct: () => 'ok',
    why: () => L('Окраску с FeCl₃ даёт енольная форма. Бром быстро присоединяется к C=C енола — окраска исчезает; равновесие кето ⇌ енол восстанавливает енол — окраска возвращается. Это доказывает динамическое кето-енольное равновесие.', 'FeCl₃-пен түсті енол түрі береді. Бром енолдың C=C байланысына тез қосылады — түсі жоғалады; кето ⇌ енол тепе-теңдігі енолды қалпына келтіреді — түсі қайта оралады. Бұл динамикалық кето-енол тепе-теңдігін дәлелдейді.', 'The colour with FeCl₃ is due to the enol form. Bromine adds rapidly to the enol C=C — the colour disappears; the keto ⇌ enol equilibrium regenerates the enol — the colour returns. This proves a dynamic keto–enol equilibrium.'),
  },
  onDone(S, tb) { const t = tb.e; S.e5.res = { cycles: t.cycles || 0, br: t.br || 0, fe: t.fe || 0, excess: (t.B || 0) > 1 }; },
  scene: (S, local) => tubesScene(eTubes, local, { cap: 4, title: L('вытяжной шкаф', 'тартпа шкаф', 'fume hood') }),
  hint1: L('Сначала эфир с водой и FeCl₃ (красно-фиолетовый), потом бромную воду по 1 капле до исчезновения окраски, потом — наблюдать.', 'Алдымен эфир сумен және FeCl₃ (қызыл-күлгін), содан кейін түсі жоғалғанша бромды суды 1 тамшыдан, содан кейін — бақылау.', 'First the ester with water and FeCl₃ (red-violet), then bromine water one drop at a time until the colour disappears, then watch.'),
  hint2: L('Окраска исчезает от 2 капель бромной воды и возвращается примерно через минуту. Лишний бром задерживает возврат окраски.', 'Түсі 2 тамшы бромды судан жоғалады және шамамен бір минуттан кейін қайта оралады. Артық бром түстің оралуын кешіктіреді.', 'The colour disappears with 2 drops of bromine water and returns after about a minute. Excess bromine delays the return.'),
  hint3: L('Эфир → FeCl₃ +1 → бромная вода +1, +1 → «Наблюдать 30 с» ×2 → снова бромная вода +1, +1 → «Наблюдать 30 с» ×2.', 'Эфир → FeCl₃ +1 → бромды су +1, +1 → «30 с бақылау» ×2 → қайтадан бромды су +1, +1 → «30 с бақылау» ×2.', 'Ester → FeCl₃ +1 → bromine water +1, +1 → “Watch for 30 s” ×2 → bromine water +1, +1 again → “Watch for 30 s” ×2.'),
};

export default {
  id: '5',
  title: L('Кето-енольная таутомерия ацетоуксусного эфира', 'Ацетосірке эфирінің кето-енол таутомериясы', 'Keto–enol tautomerism of ethyl acetoacetate'),
  principle: L('Енольная форма даёт с Fe³⁺ красно-фиолетовый комплекс; бром быстро присоединяется по связи C=C енола, и окраска исчезает; затем равновесие восстанавливает енольную форму, и окраска возвращается.', 'Енол түрі Fe³⁺-пен қызыл-күлгін кешен береді; бром енолдың C=C байланысы бойынша тез қосылып, түс жоғалады; содан кейін тепе-теңдік енол түрін қалпына келтіріп, түс қайта оралады.', 'The enol form gives a red-violet complex with Fe³⁺; bromine adds rapidly to the C=C bond of the enol and the colour disappears; the equilibrium then restores the enol form and the colour returns.'),
  equation: ['CH₃–CO–CH₂–COOC₂H₅ ⇌ CH₃–C(OH)=CH–COOC₂H₅', 'CH₃–C(OH)=CH–COOC₂H₅ + Br₂ → CH₃–CO–CHBr–COOC₂H₅ + HBr'],
  initialState: () => ({ e5: { res: null } }),
  checkpoints: [0],
  steps: [s0, s1],
  results: (S) => ({ ...(S.e5.res || {}) }),
  summary: (r) => [
    { label: 'FeCl₃', value: L('красно-фиолетовый', 'қызыл-күлгін', 'red-violet'), st: 'ok' },
    { label: L('Циклы Br₂', 'Br₂ циклдары', 'Br₂ cycles'), value: String(r.cycles || 0), st: (r.cycles || 0) >= 2 ? 'ok' : '' },
  ],
};
