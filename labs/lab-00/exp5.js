/** Этап 5. Отходы — раздел 10 и п. 14.3 правил ТБ. */
import { L, n } from '../../app/i18n.js';
import { wastePH, bicarbonateFor, M_NAHCO3 } from './model.js';
import { neutralScene, wasteScene } from './scene.js';
import { stageResults } from './common.js';

const H0 = 50, V0 = 50; // 50 мл ≈ 1 М HCl
const SODA = 1.0 / M_NAHCO3 * 1000; // ммоль в 1 г NaHCO₃
const NAOH = 13.9; // ммоль в 5 мл 10 % NaOH

const pH = (N) => wastePH(N.h, N.b, N.oh, N.V);

const sNeutral = {
  type: 'process', id: 'neutral',
  title: L('Нейтрализация кислых отходов', 'Қышқыл қалдықтарды бейтараптау', 'Neutralising acidic waste'),
  instr: L(`<p>После занятия в стакане ${V0} мл кислых водных отходов (≈ 1 М HCl). Перед сливом в ёмкость для водных отходов их нужно нейтрализовать до pH, близкого к нейтральному (п. 10.3).</p><ol><li>Добавляйте нейтрализующее средство порциями, перемешивая.</li><li>Проверяйте pH индикаторной бумагой — каплей на стеклянной палочке.</li></ol><p class="note">Цель — pH 6–8 по последней проверке.</p>`,
    `<p>Сабақтан кейін стақанда ${V0} мл қышқыл сулы қалдық (≈ 1 М HCl) бар. Оны сулы қалдықтар ыдысына төкпес бұрын бейтарапқа жақын pH-қа дейін бейтараптау керек (10.3-тармақ).</p><ol><li>Бейтараптағыш затты араластыра отырып, порциялап қосыңыз.</li><li>pH-ты индикатор қағазымен тексеріңіз — шыны таяқшадағы тамшымен.</li></ol><p class="note">Мақсат — соңғы тексеру бойынша pH 6–8.</p>`,
    `<p>After the class there are ${V0} mL of acidic aqueous waste (≈ 1 M HCl) in a beaker. Before it goes into the aqueous waste container it must be neutralised to a pH close to neutral (rule 10.3).</p><ol><li>Add the neutralising agent in portions, with stirring.</li><li>Check the pH with indicator paper — a drop on a glass rod.</li></ol><p class="note">Target: pH 6–8 at the last check.</p>`),
  need: L('pH 6–8 по индикаторной бумаге', 'Индикатор қағазы бойынша pH 6–8', 'pH 6–8 on indicator paper'),
  speeds: [5, 10],
  setup(S) { S.neu = S.neu || { h: H0, b: 0, oh: 0, V: V0, fizz: 0, strip: null, dirty: true, checks: 0 }; },
  controls: [
    { kind: 'action', id: 'soda', once: false, group: L('Нейтрализация', 'Бейтараптау', 'Neutralisation'), label: L('NaHCO₃: порция 1 г', 'NaHCO₃: 1 г порция', 'NaHCO₃: a 1 g portion'), advance: 60,
      do(S, lc, ctx) {
        const N = S.neu, acidLeft = N.h - N.b - N.oh;
        N.b += SODA; N.dirty = true; N.strip = null; N.sodaG = (N.sodaG || 0) + 1;
        N.fizz = acidLeft > 0 ? Math.min(8, acidLeft / 3) : 0;
        ctx.log(acidLeft >= SODA ? L(`Добавлен 1 г NaHCO₃ (всего ${n(N.sodaG, 0)} г): сильное шипение, выделяется CO₂`, `1 г NaHCO₃ қосылды (барлығы ${n(N.sodaG, 0)} г): қатты ысылдап, CO₂ бөлінеді`, `1 g of NaHCO₃ added (${n(N.sodaG, 0)} g in total): strong fizzing, CO₂ evolved`)
          : acidLeft > 0 ? L(`Добавлен 1 г NaHCO₃ (всего ${n(N.sodaG, 0)} г): слабое шипение, выделение CO₂ быстро прекращается`, `1 г NaHCO₃ қосылды (барлығы ${n(N.sodaG, 0)} г): әлсіз ысыл, CO₂ бөлінуі тез тоқтайды`, `1 g of NaHCO₃ added (${n(N.sodaG, 0)} g in total): weak fizzing that soon stops`)
          : L(`Добавлен 1 г NaHCO₃ (всего ${n(N.sodaG, 0)} г): шипения нет`, `1 г NaHCO₃ қосылды (барлығы ${n(N.sodaG, 0)} г): ысыл жоқ`, `1 g of NaHCO₃ added (${n(N.sodaG, 0)} g in total): no fizzing`), 'obs');
      } },
    { kind: 'action', id: 'naoh', once: false, group: L('Нейтрализация', 'Бейтараптау', 'Neutralisation'), label: L('10 % NaOH: прилить 5 мл', '10 % NaOH: 5 мл құю', '10 % NaOH: add 5 mL'), advance: 30,
      do(S, lc, ctx) { const N = S.neu; N.oh += NAOH; N.V += 5; N.dirty = true; N.strip = null; N.naohMl = (N.naohMl || 0) + 5; ctx.log(L(`Прилито 5 мл 10 % NaOH (всего ${n(N.naohMl, 0)} мл); раствор разогрелся`, `5 мл 10 % NaOH құйылды (барлығы ${n(N.naohMl, 0)} мл); ерітінді жылыды`, `5 mL of 10 % NaOH added (${n(N.naohMl, 0)} mL in total); the solution warmed up`)); } },
    { kind: 'action', id: 'hcl', once: false, group: L('Если перещелочили', 'Сілтілеп жіберсе', 'If you overshoot'), label: L('Прилить 0,5 мл 1 М HCl', '0,5 мл 1 М HCl құю', 'Add 0.5 mL of 1 M HCl'), advance: 20,
      disabled: (S) => !S.neu.oh,
      do(S, lc, ctx) { const N = S.neu; N.h += 0.5; N.V += 0.5; N.dirty = true; N.strip = null; ctx.log(L('Прилито 0,5 мл 1 М HCl', '0,5 мл 1 М HCl құйылды', '0.5 mL of 1 M HCl added')); } },
    { kind: 'action', id: 'strip', once: false, group: L('Контроль', 'Бақылау', 'Check'), label: L('Проверить pH индикаторной бумагой', 'pH-ты индикатор қағазымен тексеру', 'Check the pH with indicator paper'), advance: 30,
      do(S, lc, ctx) {
        const N = S.neu, p = pH(N);
        N.strip = p; N.dirty = false; N.checks++;
        ctx.log(L(`Индикаторная бумага: pH ≈ ${Math.round(p)}`, `Индикатор қағазы: pH ≈ ${Math.round(p)}`, `Indicator paper: pH ≈ ${Math.round(p)}`), 'obs');
        if (p > 9) ctx.remark({ key: 'over', severity: 'minor', text: L('отходы перещелочены — снова нужна нейтрализация', 'қалдықтар сілтіленіп кетті — қайта бейтараптау қажет', 'the waste was made too alkaline — it needs neutralising again'), whatif: L('Сильнощелочной раствор тоже нельзя сливать: его снова доводят до pH ≈ 7.', 'Күшті сілтілі ерітіндіні де төгуге болмайды: оны қайтадан pH ≈ 7-ге жеткізеді.', 'A strongly alkaline solution cannot be discarded either: it has to be brought back to pH ≈ 7.') });
      } },
  ],
  tick(S, lc, dt) { const N = S.neu; if (N.fizz > 0) N.fizz = Math.max(0, N.fizz - dt * 0.05); },
  readouts: (S) => [
    { label: 'NaHCO₃', value: L(`${n(S.neu.sodaG || 0, 0)} г`, `${n(S.neu.sodaG || 0, 0)} г`, `${n(S.neu.sodaG || 0, 0)} g`) },
    { label: 'NaOH 10 %', value: L(`${n(S.neu.naohMl || 0, 0)} мл`, `${n(S.neu.naohMl || 0, 0)} мл`, `${n(S.neu.naohMl || 0, 0)} mL`) },
    { label: L('pH (бумага)', 'pH (қағаз)', 'pH (paper)'), value: S.neu.strip == null ? '—' : '≈ ' + Math.round(S.neu.strip), st: S.neu.strip == null ? '' : S.neu.strip >= 6 && S.neu.strip <= 8 ? 'ok' : 'warn' },
  ],
  alerts: (S) => (S.neu.fizz > 0.5 ? { text: L('Идёт выделение CO₂ — перемешивайте и не добавляйте следующую порцию, пока шипение не ослабнет.', 'CO₂ бөлініп жатыр — араластырып, ысыл басылғанша келесі порцияны қоспаңыз.', 'CO₂ is coming off — stir and do not add the next portion until the fizzing dies down.'), kind: 'info' } : null),
  done(S, lc, ctx) {
    const N = S.neu;
    if (!N.dirty && N.strip != null && N.strip >= 6 && N.strip <= 8) {
      S.waste = { pH: N.strip, soda: N.sodaG || 0, naoh: N.naohMl || 0, checks: N.checks };
      return { text: L(`Отходы нейтрализованы: pH ≈ ${Math.round(N.strip)}. Можно сливать в ёмкость для водных отходов.`, `Қалдықтар бейтараптанды: pH ≈ ${Math.round(N.strip)}. Сулы қалдықтар ыдысына төгуге болады.`, `Waste neutralised: pH ≈ ${Math.round(N.strip)}. It may go into the aqueous waste container.`) };
    }
    return false;
  },
  scene: (S) => neutralScene(S),
  hints: [
    L('Кислые отходы нейтрализуют порциями, контролируя pH индикаторной бумагой после каждой порции.', 'Қышқыл қалдықтарды порциялап бейтараптайды, әр порциядан кейін pH-ты индикатор қағазымен бақылайды.', 'Acidic waste is neutralised in portions, checking the pH with indicator paper after each one.'),
    L(`Нужно около ${n(bicarbonateFor(H0), 1)} г NaHCO₃: с ним трудно «перелить» — избыток гидрокарбоната даёт pH не выше ≈ 8. NaOH легко перещелачивает.`, `Шамамен ${n(bicarbonateFor(H0), 1)} г NaHCO₃ керек: онымен «асырып жіберу» қиын — гидрокарбонаттың артығы pH-ты ≈ 8-ден жоғары көтермейді. NaOH оңай сілтілеп жібереді.`, `About ${n(bicarbonateFor(H0), 1)} g of NaHCO₃ is needed: it is hard to overshoot — excess hydrogen carbonate keeps the pH at ≈ 8 or below. NaOH overshoots easily.`),
    L('5 порций NaHCO₃ по 1 г (ждать, пока стихнет шипение), затем «Проверить pH индикаторной бумагой».', '1 г-нан 5 порция NaHCO₃ (ысыл басылғанша күту), содан кейін «pH-ты индикатор қағазымен тексеру».', '5 portions of 1 g NaHCO₃ (wait for the fizzing to stop), then “Check the pH with indicator paper”.'),
  ],
};

const sSort = {
  type: 'cleanup', id: 'sort',
  title: L('Рассортируйте отходы', 'Қалдықтарды сұрыптаңыз', 'Sort the waste'),
  instr: L('<p>Разложите отходы по промаркированным ёмкостям (пп. 9.3, 10.1–10.4), затем завершите работу, как требует п. 14.3: выбрать предмет → нажать ёмкость.</p>', '<p>Қалдықтарды таңбаланған ыдыстарға бөліп салыңыз (9.3, 10.1–10.4-тармақтар), содан кейін жұмысты 14.3-тармақ талап еткендей аяқтаңыз: затты таңдау → ыдысты басу.</p>', '<p>Put the waste into the labelled containers (rules 9.3, 10.1–10.4), then finish work as rule 14.3 requires: choose an item → tap the container.</p>'),
  need: L('Всё по местам, работа завершена', 'Бәрі орнында, жұмыс аяқталды', 'Everything sorted, work finished'),
  scene: () => wasteScene(),
  items: [
    { id: 'neut', bin: 'acid', label: L('нейтрализованные водные отходы (pH ≈ 7)', 'бейтараптанған сулы қалдықтар (pH ≈ 7)', 'neutralised aqueous waste (pH ≈ 7)') },
    { id: 'ether', bin: 'organic', label: L('остатки диэтилового эфира', 'диэтил эфирінің қалдықтары', 'diethyl ether residues'),
      wrong: { sink: { severity: 'safety', text: L('эфир вылит в раковину (пп. 5.5, 10.2)', 'эфир раковинаға төгілді (5.5, 10.2-тармақтар)', 'ether poured down the sink (rules 5.5, 10.2)'), whatif: L('Пары эфира из стока распространяются по полу и вспыхивают от удалённого источника огня.', 'Кәріздегі эфир булары еденге жайылып, алыстағы от көзінен тұтанады.', 'Ether vapour from the drain spreads over the floor and ignites from a distant source.') } } },
    { id: 'acetone', bin: 'organic', label: L('ацетон после промывки посуды', 'ыдыс жуғаннан кейінгі ацетон', 'acetone from rinsing glassware') },
    { id: 'chcl3', bin: 'halogen', label: L('хлороформ после экстракции', 'экстракциядан кейінгі хлороформ', 'chloroform from an extraction'),
      wrong: { organic: { severity: 'minor', text: L('галогенсодержащий растворитель слит к обычной органике (п. 10.1)', 'құрамында галогені бар еріткіш кәдімгі органикаға төгілді (10.1-тармақ)', 'halogenated solvent put with ordinary organics (rule 10.1)'), whatif: L('Галогенсодержащие отходы собирают и утилизируют отдельно.', 'Құрамында галогені бар қалдықтар бөлек жиналып, кәдеге жаратылады.', 'Halogenated waste is collected and disposed of separately.') } } },
    { id: 'paper', bin: 'solid', label: L('фильтровальная бумага с осадком', 'тұнбасы бар сүзгі қағаз', 'filter paper with precipitate') },
    { id: 'silica', bin: 'solid', label: L('использованный адсорбент', 'пайдаланылған адсорбент', 'used adsorbent') },
    { id: 'glass', bin: 'glass', label: L('осколки разбитого стакана', 'сынған стақанның сынықтары', 'pieces of a broken beaker') },
  ],
  switches: [
    { id: 'off', label: L('Выключить нагреватели и электроприборы', 'Қыздырғыштар мен электр құралдарын өшіру', 'Switch off heaters and electrical equipment'), log: L('Нагревательные и электроприборы выключены', 'Қыздыру және электр құралдары өшірілді', 'Heaters and electrical equipment switched off') },
    { id: 'bottles', label: L('Закрыть склянки и вернуть их на место', 'Құтыларды жауып, орнына қайтару', 'Close the reagent bottles and put them back'), log: L('Склянки закрыты и возвращены на место хранения', 'Құтылар жабылып, сақтау орнына қайтарылды', 'Bottles closed and returned to storage') },
    { id: 'bench', label: L('Убрать рабочее место', 'Жұмыс орнын жинау', 'Clean the bench'), log: L('Рабочее место убрано', 'Жұмыс орны жиналды', 'Bench cleaned') },
    { id: 'hands', label: L('Тщательно вымыть руки', 'Қолды мұқият жуу', 'Wash hands thoroughly'), log: L('Руки вымыты перед выходом из лаборатории', 'Зертханадан шығар алдында қол жуылды', 'Hands washed before leaving the lab') },
  ],
};

export default {
  id: '5',
  title: L('Отходы', 'Қалдықтар', 'Waste'),
  principle: L('Раздел 10 и п. 14.3 правил ТБ: нейтрализация водных отходов, сортировка по четырём видам и бой стекла, завершение работы.', 'ҚТ ережелерінің 10-бөлімі және 14.3-тармақ: сулы қалдықтарды бейтараптау, төрт түрге сұрыптау және сынған шыны, жұмысты аяқтау.', 'Safety rules, section 10 and rule 14.3: neutralising aqueous waste, sorting into four kinds plus broken glass, finishing work.'),
  equation: ['HCl + NaHCO₃ → NaCl + H₂O + CO₂↑', 'HCl + NaOH → NaCl + H₂O'],
  initialState: () => ({}),
  checkpoints: [0],
  steps: [sNeutral, sSort],
  results: (S, run) => stageResults(run, S.waste || {}),
  summary: (r) => [
    { label: L('pH отходов', 'Қалдықтардың pH-ы', 'Waste pH'), value: r.pH != null ? '≈ ' + Math.round(r.pH) : '—', st: 'ok' },
    { label: 'NaHCO₃', value: L(`${n(r.soda || 0, 0)} г`, `${n(r.soda || 0, 0)} г`, `${n(r.soda || 0, 0)} g`) },
    { label: L('Замечаний', 'Ескертулер', 'Remarks'), value: String(r.remarks), st: r.remarks ? 'warn' : 'ok' },
  ],
};
