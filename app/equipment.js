/**
 * Каталог оборудования всех работ (docs/labs.md): id → { name:{ru,kk,en}, use:{ru,kk,en}, icon, labs:[…] }.
 * equipmentIcon(id) → SVG 64×64 (цвета — CSS-переменные). Используется в шаге pick, во вводном занятии и протоколе.
 */
import { L } from './i18n.js';

const G = 'class="gl"', S = 'class="gls"', M = 'class="met"', D = 'class="metd"', Q = 'class="liq"';
const ICONS = {
  conical: `<path ${G} d="M27 8 L27 24 L12 54 Q11 58 15 58 L49 58 Q53 58 52 54 L37 24 L37 8 Z"/><path ${Q} d="M16 50 L48 50 L51 55 Q51 57 48 57 L16 57 Q13 57 13 55 Z"/>`,
  rbf: `<rect ${G} x="28" y="6" width="8" height="22"/><circle ${G} cx="32" cy="42" r="17"/><path ${Q} d="M17 46 A17 17 0 0 0 47 46 Z"/>`,
  condenser: `<rect ${G} x="28" y="4" width="8" height="56"/><rect x="22" y="12" width="20" height="40" rx="5" fill="none" stroke="var(--glass)" stroke-width="1.6"/><line x1="42" y1="48" x2="54" y2="48" stroke="var(--glass)" stroke-width="3"/><line x1="22" y1="16" x2="10" y2="16" stroke="var(--glass)" stroke-width="3"/>`,
  aircond: `<rect ${G} x="29" y="4" width="6" height="56"/>`,
  distill: `<circle ${G} cx="26" cy="44" r="14"/><rect ${G} x="22" y="8" width="8" height="24"/><path ${S} d="M30 18 L56 30"/>`,
  receiver: `<path ${G} d="M27 14 L27 26 L14 54 Q13 58 17 58 L47 58 Q51 58 50 54 L37 26 L37 14 Z"/><path ${S} d="M10 6 L30 18"/>`,
  beaker: `<path ${S} d="M14 10 L14 54 Q14 58 18 58 L46 58 Q50 58 50 54 L50 10 M14 10 l-4 -3"/><rect ${Q} x="15" y="36" width="34" height="21"/>`,
  tube: `<path ${S} d="M26 4 L26 50 A6 6 0 0 0 38 50 L38 4"/><rect ${Q} x="27" y="36" width="10" height="18" rx="4"/>`,
  rack: `<rect ${M} x="6" y="24" width="52" height="6" rx="2"/><rect ${M} x="6" y="52" width="52" height="5" rx="2"/>${[14, 26, 38, 50].map((x) => `<path ${S} d="M${x - 3} 8 L${x - 3} 46 A3 3 0 0 0 ${x + 3} 46 L${x + 3} 8"/>`).join('')}`,
  rod: `<line x1="16" y1="58" x2="48" y2="6" stroke="var(--glass)" stroke-width="4" stroke-linecap="round"/>`,
  dropper: `<ellipse ${D} cx="32" cy="10" rx="6" ry="8"/><rect ${G} x="29" y="16" width="6" height="30"/><path ${G} d="M29 46 L31.5 60 L32.5 60 L35 46 Z"/>`,
  pipette: `<rect ${G} x="30" y="4" width="4" height="56"/>${[14, 22, 30, 38, 46].map((y) => `<line x1="34" x2="38" y1="${y}" y2="${y}" stroke="var(--glass)"/>`).join('')}`,
  cylinder: `<rect ${G} x="24" y="6" width="16" height="48" rx="2"/><rect ${G} x="16" y="54" width="32" height="5" rx="2"/><rect ${Q} x="25" y="30" width="14" height="24"/>${[14, 22, 30, 38, 46].map((y) => `<line x1="24" x2="29" y1="${y}" y2="${y}" stroke="var(--glass)"/>`).join('')}`,
  volflask: `<rect ${G} x="29" y="4" width="6" height="28"/><line x1="27" x2="37" y1="16" y2="16" stroke="var(--glass)"/><path ${G} d="M29 32 Q12 38 14 50 Q16 60 32 60 Q48 60 50 50 Q52 38 35 32 Z"/>`,
  buchner: `<path class="porc" d="M10 10 L54 10 L50 28 L14 28 Z"/><rect class="porc" x="28" y="28" width="8" height="26"/>`,
  filterflask: `<path ${G} d="M27 6 L27 22 L12 54 Q11 58 15 58 L49 58 Q53 58 52 54 L37 22 L37 6 Z"/><path ${S} d="M37 14 L56 10"/>`,
  pump: `<rect ${M} x="20" y="10" width="24" height="46" rx="5"/><circle cx="32" cy="22" r="4" fill="var(--good)"/><path d="M44 40 C54 40 56 30 60 24" fill="none" stroke="var(--metal-dark)" stroke-width="4"/>`,
  funnel: `<path ${G} d="M8 10 L56 10 L36 34 L36 58 L28 58 L28 34 Z"/>`,
  paper: `<circle cx="32" cy="32" r="24" fill="var(--panel)" stroke="var(--muted)"/><path d="M32 8 L32 56 M8 32 L56 32" stroke="var(--line)"/>`,
  sepfunnel: `<path ${G} d="M28 6 L28 14 Q10 30 26 48 L30 52 L34 52 L38 48 Q54 30 36 14 L36 6 Z"/><rect ${D} x="26" y="52" width="12" height="4"/><rect ${G} x="31" y="56" width="2" height="6"/>`,
  watch: `<path ${G} d="M6 34 Q32 48 58 34 Q32 40 6 34 Z"/>`,
  boat: `<path class="pnl" d="M8 28 L56 28 L50 42 L14 42 Z"/>`,
  spatula: `<rect ${M} x="8" y="30" width="38" height="4" rx="2"/><ellipse ${D} cx="50" cy="32" rx="8" ry="5"/>`,
  capillary: `<line x1="22" y1="6" x2="22" y2="58" stroke="var(--glass)" stroke-width="2"/><line x1="32" y1="6" x2="32" y2="58" stroke="var(--glass)" stroke-width="2"/><line x1="42" y1="6" x2="42" y2="58" stroke="var(--glass)" stroke-width="2"/><rect class="ppt" x="20.5" y="50" width="3" height="7"/>`,
  mp: `<rect ${M} x="8" y="18" width="48" height="40" rx="6"/><rect class="scr" x="14" y="40" width="36" height="12" rx="2"/><rect x="18" y="4" width="5" height="24" rx="2" fill="var(--panel)" stroke="var(--glass)"/><circle cx="44" cy="28" r="7" fill="var(--scene)" stroke="var(--glass)" stroke-width="2"/>`,
  balance: `<rect ${M} x="6" y="44" width="52" height="14" rx="3"/><rect class="scr" x="24" y="47" width="28" height="8" rx="2"/><rect ${G} x="10" y="8" width="44" height="36" rx="2"/><ellipse ${D} cx="32" cy="40" rx="12" ry="2"/>`,
  polarimeter: `<rect ${M} x="4" y="28" width="44" height="12" rx="3"/><rect ${G} x="12" y="30" width="26" height="8" rx="3"/><circle ${D} cx="52" cy="26" r="10"/>`,
  poltube: `<rect ${G} x="6" y="26" width="52" height="12" rx="5"/><rect ${M} x="4" y="24" width="6" height="16" rx="2"/><rect ${M} x="54" y="24" width="6" height="16" rx="2"/>`,
  refracto: `<rect ${M} x="12" y="40" width="40" height="16" rx="3"/><rect ${M} x="26" y="6" width="10" height="36" rx="3"/><circle ${D} cx="31" cy="10" r="5"/>`,
  icebath: `<rect ${G} x="6" y="20" width="52" height="38" rx="6"/>${[[12, 30], [26, 26], [40, 32], [18, 44], [34, 46]].map(([x, y]) => `<rect class="ice" x="${x}" y="${y}" width="10" height="10" rx="2"/>`).join('')}`,
  waterbath: `<rect ${M} x="6" y="22" width="52" height="36" rx="5"/><rect ${Q} x="10" y="26" width="44" height="10"/><circle cx="14" cy="50" r="3" fill="var(--hot)"/>`,
  sandbath: `<rect ${M} x="6" y="30" width="52" height="28" rx="5"/><rect x="10" y="32" width="44" height="10" fill="var(--solid-y)"/>`,
  mantle: `<path ${M} d="M10 30 Q32 66 54 30 L54 58 L10 58 Z"/><path d="M14 32 Q32 60 50 32" fill="none" stroke="var(--hot)" stroke-width="2"/>`,
  hotplate: `<rect ${M} x="6" y="36" width="52" height="20" rx="4"/><rect x="12" y="31" width="40" height="5" rx="2" fill="var(--hot)" opacity=".6"/>`,
  chips: `${[[20, 34], [32, 28], [42, 38], [26, 44], [38, 48]].map(([x, y]) => `<circle class="metd" cx="${x}" cy="${y}" r="4"/>`).join('')}`,
  thermo: `<rect x="28" y="4" width="8" height="50" rx="4" fill="var(--panel)" stroke="var(--glass)"/><rect class="redc" x="30.5" y="24" width="3" height="30"/><circle class="redc" cx="32" cy="56" r="5"/>`,
  models: `<circle cx="32" cy="32" r="8" fill="var(--ink)"/><circle cx="14" cy="18" r="6" fill="var(--panel)" stroke="var(--muted)"/><circle cx="50" cy="18" r="6" fill="var(--panel)" stroke="var(--muted)"/><circle cx="32" cy="56" r="6" fill="var(--bad)"/><path d="M32 32 L14 18 M32 32 L50 18 M32 32 L32 56" stroke="var(--muted)" stroke-width="3"/>`,
  stopwatch: `<circle cx="32" cy="36" r="20" fill="var(--panel)" stroke="var(--muted)" stroke-width="2"/><rect ${M} x="28" y="8" width="8" height="8" rx="2"/><line x1="32" y1="36" x2="40" y2="24" stroke="var(--bad)" stroke-width="2"/>`,
  strip: `<rect x="26" y="6" width="12" height="52" rx="2" fill="var(--panel)" stroke="var(--line)"/><rect x="26" y="40" width="12" height="18" fill="rgb(245,160,40)"/>`,
  stand: `<rect ${M} x="8" y="54" width="40" height="5" rx="2"/><rect ${M} x="18" y="6" width="4" height="50"/><rect ${D} x="18" y="20" width="34" height="4" rx="2"/>`,
  hood: `<rect ${M} x="6" y="6" width="52" height="52" rx="4"/><rect x="11" y="12" width="42" height="42" fill="var(--scene)"/><rect ${G} x="11" y="12" width="42" height="20"/>`,
  goggles: `<path d="M8 28 Q8 22 16 22 L48 22 Q56 22 56 28 L56 36 Q56 42 48 42 L38 42 L32 36 L26 42 L16 42 Q8 42 8 36 Z" fill="var(--glass-fill)" stroke="var(--ink)" stroke-width="2"/>`,
  gloves: `<path d="M20 58 L20 30 Q20 24 24 24 L24 12 Q24 8 27 8 Q30 8 30 12 L30 22 L30 8 Q30 4 33 4 Q36 4 36 8 L36 22 L36 10 Q36 6 39 6 Q42 6 42 10 L42 30 L46 24 Q50 22 50 26 L44 44 L44 58 Z" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.6"/>`,
  coat: `<path d="M22 6 L32 14 L42 6 L54 12 L54 58 L10 58 L10 12 Z" fill="var(--panel)" stroke="var(--muted)" stroke-width="2"/><line x1="32" y1="14" x2="32" y2="58" stroke="var(--muted)"/>`,
  steam: `<circle ${G} cx="16" cy="44" r="12"/><circle ${G} cx="44" cy="44" r="12"/><path ${S} d="M16 32 L16 16 L44 16 L44 32"/>`,
  dessicator: `<path ${G} d="M10 26 L54 26 L50 58 L14 58 Z"/><ellipse ${G} cx="32" cy="24" rx="24" ry="6"/>`,
};

const E = (name, icon, labs, use) => ({ name, icon, labs, use });

export const EQUIPMENT = {
  'conical-50': E(L('Коническая колба 50 мл', 'Конустық колба 50 мл', '50 mL conical flask'), 'conical', ['06-07', '08'], L('Реакционный сосуд для нитрования', 'Нитрлеуге арналған реакциялық ыдыс', 'Reaction vessel for the nitration')),
  'conical-125': E(L('Коническая колба 125 мл', 'Конустық колба 125 мл', '125 mL conical flask'), 'conical', ['12'], L('Кристаллизация диастереомерных солей', 'Диастереомерлі тұздарды кристалдау', 'Crystallising the diastereomeric salts')),
  'conical-250': E(L('Коническая колба 100–250 мл', 'Конустық колба 100–250 мл', '100–250 mL conical flask'), 'conical', ['09', '08'], L('Реакции и сбор фракций', 'Реакциялар мен фракцияларды жинау', 'Reactions and collecting fractions')),
  'rbf-25': E(L('Круглодонная колба 25 мл', 'Түбі дөңгелек колба 25 мл', '25 mL round-bottomed flask'), 'rbf', ['13'], L('Кипячение с обратным холодильником', 'Кері мұздатқышпен қайнату', 'Heating under reflux')),
  'rbf-50': E(L('Круглодонная колба 50 мл', 'Түбі дөңгелек колба 50 мл', '50 mL round-bottomed flask'), 'rbf', ['08', '13'], L('Кипячение с обратным холодильником', 'Кері мұздатқышпен қайнату', 'Heating under reflux')),
  'reflux-condenser': E(L('Обратный холодильник', 'Кері мұздатқыш', 'Reflux condenser'), 'condenser', ['08', '13'], L('Возвращает пары растворителя в колбу; вода подаётся снизу', 'Еріткіш буын колбаға қайтарады; су төменнен беріледі', 'Returns solvent vapour to the flask; water enters at the bottom')),
  'liebig-condenser': E(L('Холодильник Либиха', 'Либих мұздатқышы', 'Liebig condenser'), 'condenser', ['08'], L('Конденсирует пары при перегонке', 'Айдау кезінде буды конденсациялайды', 'Condenses the vapour during distillation')),
  'air-condenser': E(L('Воздушный холодильник', 'Ауа мұздатқышы', 'Air condenser'), 'aircond', ['09'], L('Перегонка высококипящих жидкостей (выше 150 °C)', 'Жоғары температурада қайнайтын сұйықтарды айдау (150 °C-тан жоғары)', 'Distilling high-boiling liquids (above 150 °C)')),
  'distill-flask': E(L('Перегонная колба', 'Айдау колбасы', 'Distillation flask'), 'distill', ['08', '09'], L('Колба с отводом для простой перегонки', 'Жай айдауға арналған бұрмасы бар колба', 'Flask with a side arm for simple distillation')),
  receiver: E(L('Приёмник', 'Қабылдағыш', 'Receiver'), 'receiver', ['08', '09'], L('Собирает отгон', 'Айдалған сұйықты жинайды', 'Collects the distillate')),
  'thermometer-100': E(L('Термометр 0–100 °C', 'Термометр 0–100 °C', 'Thermometer 0–100 °C'), 'thermo', ['06-07', '09', '14'], L('Контроль температуры реакционной смеси, цена деления 1 °C', 'Реакциялық қоспаның температурасын бақылау, бөлік құны 1 °C', 'Monitoring the reaction temperature, 1 °C divisions')),
  'thermometer-250': E(L('Термометр 0–250 °C', 'Термометр 0–250 °C', 'Thermometer 0–250 °C'), 'thermo', ['08', '09'], L('Температура паров при перегонке', 'Айдау кезіндегі бу температурасы', 'Vapour temperature during distillation')),
  'dropping-pipette': E(L('Капельная пипетка', 'Тамшуыр', 'Dropping pipette'), 'dropper', ['06-07', '09', '10', '11', '14', '15'], L('Прибавление по каплям', 'Тамшылатып қосу', 'Dropwise addition')),
  'graduated-pipette': E(L('Градуированная пипетка с грушей', 'Алмұрты бар бөлікті пипетка', 'Graduated pipette with a bulb'), 'pipette', ['10', '11', '15'], L('Точный объём; набирать только грушей (п. 2.5 правил ТБ)', 'Дәл көлем; тек алмұртпен алу (ҚТ ережелерінің 2.5-тармағы)', 'Accurate volume; fill only with a bulb (safety rule 2.5)')),
  'cylinder-10': E(L('Мерный цилиндр 10 мл', 'Өлшегіш цилиндр 10 мл', '10 mL measuring cylinder'), 'cylinder', ['06-07', '08'], L('Отмеривание кислот и растворителей', 'Қышқылдар мен еріткіштерді өлшеу', 'Measuring acids and solvents')),
  'cylinder-25': E(L('Мерный цилиндр 25 мл', 'Өлшегіш цилиндр 25 мл', '25 mL measuring cylinder'), 'cylinder', ['08', '12'], L('Отмеривание жидкостей', 'Сұйықтарды өлшеу', 'Measuring liquids')),
  'cylinder-50': E(L('Мерный цилиндр 50 мл', 'Өлшегіш цилиндр 50 мл', '50 mL measuring cylinder'), 'cylinder', ['08', '09'], L('Отмеривание воды и растворов', 'Су мен ерітінділерді өлшеу', 'Measuring water and solutions')),
  'vol-flask': E(L('Мерная колба 10–50 мл', 'Өлшегіш колба 10–50 мл', 'Volumetric flask 10–50 mL'), 'volflask', ['12'], L('Раствор точной концентрации для поляриметрии', 'Поляриметрияға арналған дәл концентрациялы ерітінді', 'Solution of exact concentration for polarimetry')),
  'beaker-50': E(L('Химический стакан 50 мл', 'Химиялық стақан 50 мл', '50 mL beaker'), 'beaker', ['14'], L('Растворение, реакции', 'Еріту, реакциялар', 'Dissolving, reactions')),
  'beaker-100': E(L('Химический стакан 100 мл', 'Химиялық стақан 100 мл', '100 mL beaker'), 'beaker', ['06-07', '09', '12', '14'], L('Выливание на лёд, растворение', 'Мұзға төгу, еріту', 'Pouring onto ice, dissolving')),
  'beaker-150': E(L('Химический стакан 150 мл', 'Химиялық стақан 150 мл', '150 mL beaker'), 'beaker', ['06-07'], L('Перекристаллизация из воды', 'Судан қайта кристалдау', 'Recrystallisation from water')),
  'beaker-250': E(L('Химический стакан 250 мл', 'Химиялық стақан 250 мл', '250 mL beaker'), 'beaker', ['09'], L('Бани, большие объёмы', 'Моншалар, үлкен көлемдер', 'Baths, larger volumes')),
  'test-tube': E(L('Пробирка', 'Пробирка', 'Test tube'), 'tube', ['06-07', '08', '09', '10', '11', '13', '14', '15'], L('Качественные пробы, малые количества', 'Сапалық сынамалар, аз мөлшерлер', 'Qualitative tests, small amounts')),
  'tube-rack': E(L('Штатив для пробирок', 'Пробирка штативі', 'Test-tube rack'), 'rack', ['10', '11', '15'], L('Пробирки во время проб', 'Сынама кезіндегі пробиркалар', 'Holds tubes during tests')),
  'glass-rod': E(L('Стеклянная палочка', 'Шыны таяқша', 'Glass rod'), 'rod', ['06-07', '09', '10', '11', '14'], L('Перемешивание, перенос капли на индикатор', 'Араластыру, тамшыны индикаторға тамызу', 'Stirring, spotting drops on indicator paper')),
  buchner: E(L('Воронка Бюхнера', 'Бюхнер шұңғымасы', 'Büchner funnel'), 'buchner', ['06-07', '12', '13', '14'], L('Фильтрование под вакуумом', 'Вакуумда сүзу', 'Vacuum filtration')),
  'filter-flask': E(L('Колба Бунзена', 'Бунзен колбасы', 'Filter flask (Bunsen flask)'), 'filterflask', ['06-07', '12', '13', '14'], L('Толстостенная колба с отводом для вакуума', 'Вакуумға арналған бұрмасы бар қалың қабырғалы колба', 'Thick-walled flask with a side arm for vacuum')),
  'water-pump': E(L('Водоструйный насос', 'Су ағынды сорғы', 'Water aspirator'), 'pump', ['06-07', '12', '13', '14'], L('Создаёт разрежение; перед выключением — отсоединить шланг', 'Сиреу жасайды; өшірер алдында шлангты ажырату керек', 'Creates the vacuum; disconnect the hose before switching it off')),
  funnel: E(L('Воронка лабораторная', 'Зертханалық шұңғыма', 'Laboratory funnel'), 'funnel', ['11'], L('Фильтрование через бумажный фильтр', 'Қағаз сүзгі арқылы сүзу', 'Filtering through filter paper')),
  'filter-paper': E(L('Фильтровальная бумага', 'Сүзгі қағаз', 'Filter paper'), 'paper', ['06-07', '11', '12', '13', '14'], L('Фильтр для воронки', 'Шұңғымаға арналған сүзгі', 'Filter for the funnel')),
  'sep-funnel': E(L('Делительная воронка 100 мл', 'Бөлгіш шұңғыма 100 мл', '100 mL separating funnel'), 'sepfunnel', ['08', '09', '12'], L('Разделение несмешивающихся жидкостей, экстракция', 'Араласпайтын сұйықтарды бөлу, экстракция', 'Separating immiscible liquids, extraction')),
  'watch-glass': E(L('Часовое стекло', 'Сағат шынысы', 'Watch glass'), 'watch', ['06-07', '13'], L('Сушка и взвешивание продукта', 'Өнімді кептіру және өлшеу', 'Drying and weighing the product')),
  'weighing-boat': E(L('Лодочка для взвешивания', 'Өлшеуге арналған қайықша', 'Weighing boat'), 'boat', ['06-07', '12', '13'], L('Тара для навески на весах', 'Таразыдағы өлшендіге арналған ыдыс', 'Container for weighing on the balance')),
  spatula: E(L('Шпатель', 'Шпатель', 'Spatula'), 'spatula', ['06-07', '12', '13', '14'], L('Перенос твёрдых веществ', 'Қатты заттарды ауыстыру', 'Transferring solids')),
  capillary: E(L('Капилляры для т. пл.', 'Балқу температурасына арналған капиллярлар', 'Melting-point capillaries'), 'capillary', ['06-07', '13'], L('Проба для определения т. пл., слой 2–3 мм', 'Балқу температурасын анықтауға арналған сынама, қабат 2–3 мм', 'Sample for m.p., 2–3 mm layer')),
  'mp-apparatus': E(L('Прибор для определения т. пл.', 'Балқу температурасын анықтайтын құрал', 'Melting-point apparatus'), 'mp', ['06-07', '13'], L('Нагрев капилляра с пробой и наблюдение плавления', 'Сынамасы бар капиллярды қыздыру және балқуды бақылау', 'Heats the capillary and lets you watch the melting')),
  balance: E(L('Аналитические весы', 'Аналитикалық таразы', 'Analytical balance'), 'balance', ['06-07', '12', '13'], L('Взвешивание с точностью 0,1 мг', '0,1 мг дәлдікпен өлшеу', 'Weighing to 0.1 mg')),
  polarimeter: E(L('Поляриметр', 'Поляриметр', 'Polarimeter'), 'polarimeter', ['12'], L('Измерение угла вращения плоскости поляризации', 'Поляризация жазықтығының бұрылу бұрышын өлшеу', 'Measures the angle of optical rotation')),
  'polarimeter-tube': E(L('Трубки поляриметра 1 и 2 дм', 'Поляриметр түтіктері 1 және 2 дм', 'Polarimeter tubes 1 and 2 dm'), 'poltube', ['12'], L('Кювета для раствора; длина l входит в формулу [α]', 'Ерітіндіге арналған кювета; l ұзындығы [α] формуласына кіреді', 'Cell for the solution; its length l enters the [α] formula')),
  refractometer: E(L('Рефрактометр', 'Рефрактометр', 'Refractometer'), 'refracto', ['08'], L('Показатель преломления жидкости (необязательно)', 'Сұйықтың сыну көрсеткіші (міндетті емес)', 'Refractive index of a liquid (optional)')),
  'ice-salt-bath': E(L('Ледяно-солевая баня', 'Мұз-тұз моншасы', 'Ice–salt bath'), 'icebath', ['06-07', '09'], L('Охлаждение ниже 0 °C (лёд + NaCl)', '0 °C-тан төмен салқындату (мұз + NaCl)', 'Cooling below 0 °C (ice + NaCl)')),
  'ice-bath': E(L('Ледяная баня', 'Мұз моншасы', 'Ice bath'), 'icebath', ['14'], L('Охлаждение до 0–5 °C', '0–5 °C-қа дейін салқындату', 'Cooling to 0–5 °C')),
  'water-bath': E(L('Водяная баня', 'Су моншасы', 'Water bath'), 'waterbath', ['08', '09', '10', '11', '12', '13', '14', '15'], L('Мягкий нагрев до 100 °C', '100 °C-қа дейін жұмсақ қыздыру', 'Gentle heating up to 100 °C')),
  'sand-bath': E(L('Песчаная баня', 'Құм моншасы', 'Sand bath'), 'sandbath', ['08'], L('Нагрев выше 100 °C', '100 °C-тан жоғары қыздыру', 'Heating above 100 °C')),
  'heating-mantle': E(L('Колбонагреватель', 'Колба қыздырғыш', 'Heating mantle'), 'mantle', ['08', '13'], L('Нагрев круглодонных колб без открытого пламени', 'Түбі дөңгелек колбаларды ашық жалынсыз қыздыру', 'Heats round-bottomed flasks without a flame')),
  'hot-plate': E(L('Электроплитка', 'Электр плитасы', 'Hot plate'), 'hotplate', ['06-07', '11', '14'], L('Нагрев стаканов с водными растворами', 'Сулы ерітінділері бар стақандарды қыздыру', 'Heating beakers of aqueous solutions')),
  'boiling-chips': E(L('Кипелки', 'Қайнату тастары', 'Boiling chips'), 'chips', ['08', '13'], L('Предотвращают перегрев и толчки при кипении (п. 5.3)', 'Қайнау кезінде қызып кетуді және лықсуды болдырмайды (5.3-тармақ)', 'Prevent superheating and bumping (rule 5.3)')),
  'steam-distill': E(L('Установка для перегонки с водяным паром', 'Су буымен айдау қондырғысы', 'Steam distillation set-up'), 'steam', ['09'], L('Выделение летучих с паром веществ', 'Бумен ұшатын заттарды бөліп алу', 'Isolating steam-volatile compounds')),
  'molecular-models': E(L('Набор молекулярных моделей', 'Молекулалық модельдер жиынтығы', 'Molecular model kit'), 'models', ['13'], L('Конформации и конфигурации', 'Конформациялар мен конфигурациялар', 'Conformations and configurations')),
  stopwatch: E(L('Секундомер', 'Секундомер', 'Stopwatch'), 'stopwatch', ['15'], L('Время появления окраски (проба Селиванова, Барфёда)', 'Түстің пайда болу уақыты (Селиванов, Барфёд сынамалары)', 'Time for a colour to appear (Seliwanoff, Barfoed tests)')),
  'indicator-paper': E(L('Индикаторная бумага', 'Индикатор қағазы', 'Indicator paper'), 'strip', ['06-07', '10', '14'], L('Оценка pH раствора (капля палочкой на бумагу)', 'Ерітіндінің pH мәнін бағалау (таяқшамен қағазға тамшы)', 'Estimating pH (a drop on the paper with a rod)')),
  stand: E(L('Лабораторный штатив с лапкой', 'Табанды зертханалық штатив', 'Retort stand with clamp'), 'stand', ['06-07', '08', '09', '12', '13'], L('Закрепление колб и холодильников (п. 7.3)', 'Колбалар мен мұздатқыштарды бекіту (7.3-тармақ)', 'Clamping flasks and condensers (rule 7.3)')),
  'fume-hood': E(L('Вытяжной шкаф', 'Тартпа шкаф', 'Fume hood'), 'hood', ['06-07', '08', '09', '10', '11', '12', '13', '14', '15'], L('Работа с летучими и едкими веществами, экран опущен (п. 4.4)', 'Ұшқыш және күйдіргіш заттармен жұмыс, экран түсірілген (4.4-тармақ)', 'Volatile and corrosive substances, sash lowered (rule 4.4)')),
  goggles: E(L('Защитные очки', 'Қорғаныс көзілдірігі', 'Safety goggles'), 'goggles', ['06-07', '08', '09', '10', '11', '12', '13', '14', '15'], L('Всегда при работе с реактивами (п. 3.2)', 'Реактивтермен жұмыста әрдайым (3.2-тармақ)', 'Always when handling reagents (rule 3.2)')),
  gloves: E(L('Перчатки нитриловые', 'Нитрил қолғаптар', 'Nitrile gloves'), 'gloves', ['06-07', '08', '09', '10', '11', '12', '13', '14', '15'], L('Кислоты, щёлочи, амины, галогенпроизводные (п. 3.3)', 'Қышқылдар, сілтілер, аминдер, галоген туындылары (3.3-тармақ)', 'Acids, alkalis, amines, halogen compounds (rule 3.3)')),
  'lab-coat': E(L('Халат хлопковый', 'Мақта мата халат', 'Cotton lab coat'), 'coat', ['06-07', '08', '09', '10', '11', '12', '13', '14', '15'], L('Застёгнутый, из хлопчатобумажной ткани (п. 3.1)', 'Түймеленген, мақта матадан (3.1-тармақ)', 'Buttoned, made of cotton (rule 3.1)')),
  dessicator: E(L('Эксикатор', 'Эксикатор', 'Desiccator'), 'dessicator', ['13'], L('Сушка веществ над осушителем', 'Заттарды кептіргіш үстінде кептіру', 'Drying substances over a drying agent')),
};

export function equipmentIcon(id) {
  const e = EQUIPMENT[id];
  if (!e) return '';
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${ICONS[e.icon] || ''}</svg>`;
}

/** Оборудование работы по номеру из docs/labs.md ('06-07', '08' …). */
export function equipmentOf(labNum) {
  return Object.keys(EQUIPMENT).filter((id) => EQUIPMENT[id].labs.includes(labNum));
}
