/** Опыт 7. Бромирование фенола. Методичка, раздел 6, опыт 7. */
import { L, n } from '../../app/i18n.js';
import { bromination, bromNeed, DROP } from './model.js';
import { tubesScene } from './scene.js';

const bTubes = [{ id: 'b', label: L('Пробирка', 'Пробирка', 'Tube'), short: L('фенол + бромная вода', 'фенол + бромды су', 'phenol + bromine water') }];
function paint(t) {
  const r = bromination(t.ph ? t.br || 0 : 0);
  t.ppt = t.ph ? r.ppt : 0; t.pptColor = 'var(--solid)';
  t.color = t.ph ? r.color : (t.br ? 'rgba(236,180,60,.5)' : null);
  t.excess = t.ph && r.excess > 0.5;
  return r;
}
const brom = (k) => ({ id: 'br' + k, group: L('Бромная вода (в вытяжном шкафу)', 'Бромды су (тартпа шкафта)', 'Bromine water (in the fume hood)'), label: L(`+${k} кап.`, `+${k} тамшы`, `+${k} ${k > 1 ? 'drops' : 'drop'}`), advance: 4 * k, disabled: (t) => (t.br || 0) >= 60,
  apply(t, S, ctx) {
    const wasEx = t.excess, first = !t.br;
    t.br = (t.br || 0) + k; t.v += DROP * k;
    paint(t);
    if (!t.ph) { ctx.feedback(L('В пробирке нет фенола — бромная вода просто остаётся жёлтой.', 'Пробиркада фенол жоқ — бромды су жай ғана сары күйінде қалады.', 'There is no phenol in the tube — the bromine water simply stays yellow.'), 'warn'); return; }
    if (first) ctx.log(L('Первые капли бромной воды мгновенно обесцвечиваются, появляется белая муть', 'Бромды судың алғашқы тамшылары лезде түссізденіп, ақ лай пайда болады', 'The first drops of bromine water are decolourised instantly and a white turbidity appears'), 'obs');
    if (t.excess && !wasEx) ctx.log(L(`После ${t.br} капель бромная вода больше не обесцвечивается — фенол израсходован; над белым осадком жёлтый раствор`, `${t.br} тамшыдан кейін бромды су енді түссізденбейді — фенол жұмсалды; ақ тұнбаның үстінде сары ерітінді`, `After ${t.br} drops the bromine water is no longer decolourised — the phenol is used up; a yellow solution above the white precipitate`), 'obs');
  } });
const s0 = {
  type: 'test', id: 'brom',
  title: L('Фенол + бромная вода', 'Фенол + бромды су', 'Phenol + bromine water'),
  instr: L('<p>В вытяжном шкафу к <b>1 мл</b> раствора фенола (1 %) прибавляйте по каплям бромную воду, встряхивая. Наблюдайте за окраской бромной воды и появлением осадка.</p>',
    '<p>Тартпа шкафта фенол ерітіндісінің (1 %) <b>1 мл</b> мөлшеріне бромды суды сілкілей отырып тамшылатып қосыңыз. Бромды судың түсін және тұнбаның пайда болуын бақылаңыз.</p>',
    '<p>In the fume hood, add bromine water dropwise with shaking to <b>1 mL</b> of phenol solution (1 %). Watch the colour of the bromine water and the formation of a precipitate.</p>'),
  need: L('Получите белый осадок трибромфенола', 'Трибромфенолдың ақ тұнбасын алыңыз', 'Obtain the white precipitate of tribromophenol'),
  tubes: bTubes, reset: true,
  reagents: [
    { id: 'ph', group: L('Реактивы', 'Реактивтер', 'Reagents'), label: L('Фенол 1 %: 1 мл', 'Фенол 1 %: 1 мл', 'Phenol 1 %: 1 mL'), advance: 20, disabled: (t) => t.ph,
      apply(t, S, ctx) { t.ph = 1; t.v += 1; paint(t); ctx.log(L('В пробирку отмерен 1 мл 1 % раствора фенола', 'Пробиркаға 1 % фенол ерітіндісінің 1 мл өлшенді', '1 mL of 1 % phenol solution measured into the tube')); } },
    brom(1), brom(5), brom(10),
    { id: 'look', group: L('Наблюдение', 'Бақылау', 'Observation'), label: L('Встряхнуть и рассмотреть осадок', 'Сілкілеп, тұнбаны қарау', 'Shake and examine the precipitate'), advance: 30,
      apply(t, S, ctx) {
        if (!t.ph || (t.br || 0) < 10) { ctx.feedback(L('Осадка пока мало — прибавьте бромную воду (не меньше 10 капель).', 'Тұнба әзірге аз — бромды су қосыңыз (кемінде 10 тамшы).', 'There is little precipitate yet — add bromine water (at least 10 drops).'), 'warn'); return; }
        t.looked = true;
      } },
  ],
  done: (tb) => !!(tb.b.ph && tb.b.looked),
  observe: {
    question: L('Что вы наблюдали?', 'Не байқадыңыз?', 'What did you observe?'),
    options: [
      { id: 'ok', label: L('Бромная вода сразу обесцвечивается, выпадает белый осадок', 'Бромды су бірден түссізденіп, ақ тұнба түзіледі', 'The bromine water is decolourised at once and a white precipitate forms'), log: (S, tb) => L(`Бромная вода (${tb.b.br} кап.) мгновенно обесцвечивается, выпал белый осадок 2,4,6-трибромфенола`, `Бромды су (${tb.b.br} тамшы) лезде түссізденіп, 2,4,6-трибромфенолдың ақ тұнбасы түзілді`, `The bromine water (${tb.b.br} drops) was decolourised instantly and a white precipitate of 2,4,6-tribromophenol formed`) },
      { id: 'excess', label: L('Сначала обесцвечивается, выпадает белый осадок; последние капли уже не обесцвечиваются — раствор жёлтый', 'Алдымен түссізденіп, ақ тұнба түзіледі; соңғы тамшылар енді түссізденбейді — ерітінді сары', 'At first it is decolourised and a white precipitate forms; the last drops are no longer decolourised — the solution is yellow'), log: (S, tb) => L(`Бромная вода сначала мгновенно обесцвечивалась, выпал белый осадок 2,4,6-трибромфенола; после ≈ ${Math.round(bromNeed())} капель фенол израсходован, избыток брома окрасил раствор в жёлтый цвет`, `Бромды су алдымен лезде түссізденді, 2,4,6-трибромфенолдың ақ тұнбасы түзілді; ≈ ${Math.round(bromNeed())} тамшыдан кейін фенол жұмсалып, артық бром ерітіндіні сарыға бояды`, `The bromine water was at first decolourised instantly and a white precipitate of 2,4,6-tribromophenol formed; after ≈ ${Math.round(bromNeed())} drops the phenol was used up and the excess bromine coloured the solution yellow`) },
      { id: 'slow', label: L('Бромная вода обесцвечивается только при нагревании', 'Бромды су тек қыздырғанда түссізденеді', 'The bromine water is decolourised only on heating') },
      { id: 'violet', label: L('Появляется фиолетовая окраска', 'Күлгін түс пайда болады', 'A violet colour appears') },
    ],
    correct: (S, tb) => (tb.b.excess ? 'excess' : 'ok'),
    why: () => L('OH-группа (+M) сильно активирует кольцо: бром замещает водород сразу в обоих орто- и пара-положениях без катализатора. 2,4,6-Трибромфенол нерастворим в воде.', 'OH-тобы (+M) сақинаны қатты белсендіреді: бром катализаторсыз бірден екі орто- және пара-жағдайдағы сутекті орынбасады. 2,4,6-Трибромфенол суда ерімейді.', 'The OH group (+M) strongly activates the ring: bromine replaces hydrogen at both ortho positions and the para position at once, without a catalyst. 2,4,6-Tribromophenol is insoluble in water.'),
  },
  onDone(S, tb) { S.e7.res = { br: tb.b.br, excess: !!tb.b.excess }; },
  scene: (S, local) => tubesScene(bTubes, local, { cap: 4, title: L('вытяжной шкаф', 'тартпа шкаф', 'fume hood') }),
  hint1: L('Налейте фенол и прибавляйте бромную воду, пока не выпадет заметный белый осадок (не меньше 10 капель).', 'Фенолды құйып, айқын ақ тұнба түзілгенше бромды су қосыңыз (кемінде 10 тамшы).', 'Pour in the phenol and add bromine water until a clear white precipitate forms (at least 10 drops).'),
  hint2: L(`На 1 мл 1 % фенола до полного бромирования уходит около ${Math.round(bromNeed())} капель бромной воды; после этого жёлтая окраска сохраняется.`, `1 мл 1 % фенолды толық бромдауға шамамен ${Math.round(bromNeed())} тамшы бромды су кетеді; одан кейін сары түс сақталады.`, `About ${Math.round(bromNeed())} drops of bromine water fully brominate 1 mL of 1 % phenol; after that the yellow colour persists.`),
  hint3: L('Фенол 1 мл → бромная вода «+10 кап.» → «Встряхнуть и рассмотреть осадок».', 'Фенол 1 мл → бромды су «+10 тамшы» → «Сілкілеп, тұнбаны қарау».', 'Phenol 1 mL → bromine water “+10 drops” → “Shake and examine the precipitate”.'),
};

const s1 = {
  type: 'quiz', id: 'q7',
  title: L('Вопросы по опыту', 'Тәжірибе бойынша сұрақтар', 'Questions on the experiment'),
  instr: L('<p>Ответьте на вопросы преподавателя.</p>', '<p>Оқытушының сұрақтарына жауап беріңіз.</p>', '<p>Answer the instructor’s questions.</p>'),
  need: L('Ответьте на все вопросы', 'Барлық сұрақтарға жауап беріңіз', 'Answer all the questions'),
  questions: [
    { q: L('Почему фенол бромируется бромной водой без катализатора, а бензол — нет?', 'Неліктен фенол бромды сумен катализаторсыз бромданады, ал бензол — жоқ?', 'Why is phenol brominated by bromine water without a catalyst while benzene is not?'),
      options: [L('Неподелённая пара кислорода сопряжена с кольцом (+M) и сильно повышает его электронную плотность в орто- и пара-положениях', 'Оттектің бөлінбеген жұбы сақинамен түйіндесіп (+M), оның орто- және пара-жағдайлардағы электрон тығыздығын қатты арттырады', 'The oxygen lone pair is conjugated with the ring (+M) and greatly increases its electron density at the ortho and para positions'), L('Фенол — сильная кислота и сам катализирует реакцию', 'Фенол — күшті қышқыл және реакцияны өзі катализдейді', 'Phenol is a strong acid and catalyses the reaction itself'), L('Бромная вода содержит FeBr₃', 'Бромды суда FeBr₃ бар', 'Bromine water contains FeBr₃'), L('OH-группа оттягивает электроны от кольца', 'OH-тобы сақинадан электрондарды тартады', 'The OH group withdraws electrons from the ring')], correct: 0,
      why: L('+M-эффект OH-группы активирует кольцо; замещение идёт сразу в положения 2, 4 и 6.', 'OH-тобының +M-әсері сақинаны белсендіреді; орынбасу бірден 2, 4 және 6-жағдайларға жүреді.', 'The +M effect of OH activates the ring; substitution goes to positions 2, 4 and 6 at once.') },
    { q: L('Сколько моль Br₂ расходуется на 1 моль фенола?', '1 моль фенолға неше моль Br₂ жұмсалады?', 'How many moles of Br₂ are consumed per mole of phenol?'),
      options: ['3', '1', '2', '6'], correct: 0,
      why: 'C₆H₅OH + 3Br₂ → 2,4,6-Br₃C₆H₂OH↓ + 3HBr' },
  ],
};

export default {
  id: '7',
  title: L('Бромирование фенола', 'Фенолды бромдау', 'Bromination of phenol'),
  principle: L('OH-группа сильно активирует кольцо, поэтому бромная вода бромирует фенол во все три орто/пара-положения без катализатора.', 'OH-тобы сақинаны қатты белсендіреді, сондықтан бромды су фенолды катализаторсыз үш орто/пара-жағдайдың бәріне бромдайды.', 'The OH group strongly activates the ring, so bromine water brominates phenol at all three ortho/para positions without a catalyst.'),
  equation: ['C₆H₅OH + 3Br₂ → 2,4,6-Br₃C₆H₂OH↓ + 3HBr'],
  initialState: () => ({ e7: { res: null } }),
  checkpoints: [0],
  steps: [s0, s1],
  results: (S) => ({ ...(S.e7.res || {}) }),
  summary: (r) => [{ label: 'Br₂ (aq)', value: L(`обесцвечена, белый осадок (${r.br || 0} кап.)`, `түссізденді, ақ тұнба (${r.br || 0} тамшы)`, `decolourised, white ppt (${r.br || 0} drops)`), st: 'ok' }],
};
