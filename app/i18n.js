/**
 * Языки: kk (по умолчанию), ru, en. Строки интерфейса — объекты {ru, kk, en}.
 *   tr(x)      — текст на текущем языке (x: строка | {ru,kk,en} | функция(lang) → то же)
 *   t(key, v)  — строка интерфейса из словаря UI с подстановкой {имя}
 *   num(x, d)  — число с d знаками: десятичная запятая для ru и kk, точка для en
 * Числа внутри текстов можно писать с точкой во всех языках: для ru и kk tr() заменит
 * «цифра.цифра» на «цифра,цифра» (2.74 г → 2,74 г).
 */
import * as store from './store.js';

export const LANGS = ['kk', 'ru', 'en'];
export const LANG_LABEL = { kk: 'Қаз', ru: 'Рус', en: 'Eng' };
export const DEFAULT_LANG = 'kk';

let lang = (() => {
  const l = store.get('lang', null);
  return LANGS.includes(l) ? l : DEFAULT_LANG;
})();

const listeners = new Set();
export function getLang() { return lang; }
export function setLang(l) {
  if (!LANGS.includes(l) || l === lang) return;
  lang = l;
  store.set('lang', l);
  for (const fn of listeners) try { fn(l); } catch (e) { console.error(e); }
}
export function onLang(fn) { listeners.add(fn); return () => listeners.delete(fn); }

/** Тройка строк {ru, kk, en}. */
export const L = (ru, kk, en) => ({ ru, kk, en });

/** Для ru/kk: «2.74» → «2,74» (только между цифрами). */
export function fixNums(s, l = lang) {
  if (l === 'en' || typeof s !== 'string') return s;
  return s.replace(/(\d+)\.(\d+)/g, (m, a, b, off, str) => {
    // номера пунктов правил ТБ («п. 3.2», «пп. 6.3 и 12.1», «разделы 10.1–10.4», «4.3-тармақ») не трогаем
    const before = str.slice(Math.max(0, off - 24), off), after = str.slice(off + m.length, off + m.length + 24);
    if (/(?:^|[\s(])(?:пп?\.|раздел[а-яёәғқңөұүһі]*|бөлім[а-яёәғқңөұүһі]*)\s*(?:[\d.,–\s]|и\s|және\s)*$/i.test(before)) return m;
    if (/^(?:[\d.,–\s]|и\s|және\s)*-?(?:тарма|бөлім)/i.test(after) || /^\s*правил/.test(after)) return m;
    return a + ',' + b;
  });
}

export function isTri(x) {
  return x && typeof x === 'object' && !Array.isArray(x) && ('ru' in x || 'kk' in x || 'en' in x);
}

export function tr(x, l = lang) {
  if (x == null) return '';
  if (typeof x === 'function') return tr(x(l), l);
  if (typeof x === 'string' || typeof x === 'number') return fixNums(String(x), l);
  if (Array.isArray(x)) return x.map((y) => tr(y, l)).join('');
  if (isTri(x)) return fixNums(x[l] ?? x.ru ?? x.en ?? '', l);
  return String(x);
}

/** Число с d знаками после запятой; минус — типографский. */
export function num(x, d = 2, l = lang) {
  const v = Number(x);
  if (!isFinite(v)) return '—';
  const s = v.toFixed(d).replace(/^-(?=.*[1-9])/, '−').replace(/^-/, '');
  return l === 'en' ? s : s.replace('.', ',');
}

/** Число с точкой (для текстов, которые потом пройдут через tr()). */
export const n = (x, d = 2) => {
  const v = Number(x);
  return isFinite(v) ? v.toFixed(d).replace(/^-(?=.*[1-9])/, '−').replace(/^-/, '') : '—';
};

/** Подставить {имя} в строку. */
export function fill(s, vars) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? tr(vars[k]) : m));
}

export function t(key, vars) {
  const e = UI[key];
  if (!e) return key;
  return fill(tr(e), vars);
}

/** Строка интерфейса сразу на всех языках {ru,kk,en} (для записей журнала). */
export function tt(key, vars) {
  const e = UI[key];
  const out = {};
  for (const l of LANGS) {
    const v = {};
    if (vars) for (const k in vars) v[k] = tr(vars[k], l);
    out[l] = e ? (e[l] || '').replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m)) : key;
  }
  return out;
}

/** Склонение для ru: plural(5, ['шаг','шага','шагов']). Для kk и en форма одна/две. */
export function plural(nm, forms) {
  const a = Math.abs(nm) % 100, b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

/* ------------------------------------------------------------------------------------------ */
/* Строки интерфейса                                                                           */
/* ------------------------------------------------------------------------------------------ */
/** Название работы для заголовков: «Работа № 8» или «Вводное занятие». */
export function labName(lab) {
  if (!lab) return '';
  return lab.id === 'lab-00' ? t('intro') : t('labNo', { n: tr(lab.display || lab.number) });
}
/** «Опыт 2» или «Этап 2» (lab.expWord: 'stage' — у вводного занятия этапы, а не опыты). */
export function expName(lab, id) { return t(lab && lab.expWord === 'stage' ? 'stageN' : 'expN', { n: id }); }

export const UI = {
  appName: L('Виртуальная лаборатория', 'Виртуалды зертхана', 'Virtual laboratory'),
  discipline: L('Химия функциональных производных органических молекул', 'Органикалық молекулалардың функционалдық туындыларының химиясы', 'Chemistry of the Functional Derivatives of Organic Molecules'),
  course: L('3 курс · специальность «Химия»', '3-курс · «Химия» мамандығы', 'Year 3 · Chemistry degree'),
  langLabel: L('Язык', 'Тіл', 'Language'),
  theme: L('Тема', 'Тақырып түсі', 'Theme'),
  themeAuto: L('Авто', 'Авто', 'Auto'),
  themeLight: L('Светлая', 'Ашық', 'Light'),
  themeDark: L('Тёмная', 'Қараңғы', 'Dark'),
  home: L('Главная', 'Басты бет', 'Home'),
  back: L('Назад', 'Артқа', 'Back'),
  rights: L('Все права защищены', 'Барлық құқықтар қорғалған', 'All rights reserved'),
  loading: L('Загрузка…', 'Жүктелуде…', 'Loading…'),
  error: L('Ошибка', 'Қате', 'Error'),
  loadError: L('Не удалось загрузить работу. Проверьте подключение и обновите страницу.', 'Жұмысты жүктеу мүмкін болмады. Байланысты тексеріп, бетті жаңартыңыз.', 'The lab could not be loaded. Check your connection and reload the page.'),
  notFound: L('Страница не найдена', 'Бет табылмады', 'Page not found'),
  examMode: L('Контрольный режим: подсказки выключены', 'Бақылау режимі: кеңестер өшірілген', 'Exam mode: hints are off'),
  offline: L('Нет подключения к интернету — опыты работают, отправка уйдёт позже', 'Интернет жоқ — тәжірибелер жұмыс істейді, жіберу кейінірек орындалады', 'Offline — experiments still work, submissions will be sent later'),
  localMode: L('Локальный режим: сервер преподавателя не подключён, результаты хранятся на этом устройстве', 'Жергілікті режим: оқытушы сервері қосылмаған, нәтижелер осы құрылғыда сақталады', 'Local mode: the instructor’s server is not connected; results are kept on this device'),
  previewMode: L('Демонстрация статусов', 'Мәртебелерді көрсету', 'Status preview'),

  /* главная */
  howTitle: L('Как это работает', 'Бұл қалай жұмыс істейді', 'How it works'),
  how1: L('Инструктаж по технике безопасности', 'Қауіпсіздік техникасы бойынша нұсқаулық', 'Lab safety briefing'),
  how1d: L('Обязателен: без него работы закрыты', 'Міндетті: онсыз жұмыстар жабық', 'Compulsory: without it the labs stay closed'),
  how2: L('Допуск к работе', 'Жұмысқа рұқсат', 'Admission to the lab'),
  how2d: L('Тест по теории; решение принимает преподаватель', 'Теория бойынша тест; шешімді оқытушы қабылдайды', 'A theory test; the instructor decides'),
  how3: L('Опыты', 'Тәжірибелер', 'Experiments'),
  how3d: L('Ход работы по методичке; ошибки имеют последствия', 'Әдістеме бойынша жұмыс барысы; қателердің салдары бар', 'The procedure from the manual; mistakes have consequences'),
  how4: L('Протокол и оценка', 'Хаттама және баға', 'Lab report and grade'),
  how4d: L('Собирается из журнала и уходит преподавателю', 'Журналдан құрастырылып, оқытушыға жіберіледі', 'Compiled from your notebook and sent to the instructor'),
  profile: L('Студент', 'Студент', 'Student'),
  fio: L('ФИО', 'Аты-жөні', 'Full name'),
  group: L('Группа', 'Топ', 'Group'),
  fioPh: L('Фамилия Имя Отчество', 'Тегі Аты Әкесінің аты', 'Surname First name'),
  groupPh: L('Например, Х-31', 'Мысалы, Х-31', 'e.g. Ch-31'),
  save: L('Сохранить', 'Сақтау', 'Save'),
  saved: L('Сохранено', 'Сақталды', 'Saved'),
  profileNeeded: L('Укажите ФИО и группу — иначе преподаватель не поймёт, чей это результат.', 'Аты-жөніңіз бен тобыңызды көрсетіңіз — әйтпесе оқытушы нәтиженің кімдікі екенін білмейді.', 'Enter your full name and group — otherwise the instructor will not know whose result it is.'),
  labsTitle: L('Лабораторные работы', 'Зертханалық жұмыстар', 'Laboratory works'),
  labNo: L('Работа № {n}', '№ {n} жұмыс', 'Lab {n}'),
  intro: L('Вводное занятие', 'Кіріспе сабақ', 'Introductory session'),
  open: L('Открыть', 'Ашу', 'Open'),
  settingsTitle: L('Настройки', 'Баптаулар', 'Settings'),
  resetProgress: L('Сбросить прогресс', 'Прогресті тазалау', 'Reset progress'),
  resetConfirm: L('Удалить все незавершённые опыты, протоколы и ответы на этом устройстве? Решения преподавателя по допускам сохранятся.', 'Осы құрылғыдағы аяқталмаған тәжірибелерді, хаттамаларды және жауаптарды өшіру керек пе? Оқытушының рұқсат туралы шешімдері сақталады.', 'Delete all unfinished experiments, reports and answers on this device? The instructor’s admission decisions will be kept.'),
  resetDone: L('Прогресс сброшен', 'Прогресс тазаланды', 'Progress reset'),
  cancel: L('Отмена', 'Болдырмау', 'Cancel'),
  confirm: L('Подтвердить', 'Растау', 'Confirm'),
  close: L('Закрыть', 'Жабу', 'Close'),

  /* статусы работ */
  stClosed: L('Закрыта преподавателем', 'Оқытушы жапқан', 'Closed by the instructor'),
  stBriefing: L('Нужен инструктаж', 'Нұсқаулық қажет', 'Safety briefing required'),
  stNoAdm: L('Нет допуска', 'Рұқсат жоқ', 'Not admitted'),
  stPending: L('Заявка на рассмотрении', 'Өтінім қаралуда', 'Request under review'),
  stDenied: L('Не допущен — можно пересдать', 'Рұқсат берілмеді — қайта тапсыруға болады', 'Not admitted — you may retake'),
  stAdmitted: L('Допуск получен', 'Рұқсат алынды', 'Admitted'),
  stProgress: L('В процессе: опыт {e}, шаг {s}', 'Орындалуда: {e}-тәжірибе, {s}-қадам', 'In progress: experiment {e}, step {s}'),
  stProgressStage: L('В процессе: этап {e}, шаг {s}', 'Орындалуда: {e}-кезең, {s}-қадам', 'In progress: stage {e}, step {s}'),
  stDone: L('Выполнено — оценка {g}', 'Орындалды — баға {g}', 'Completed — grade {g}'),
  stDraft: L('В разработке', 'Әзірленуде', 'In development'),
  stBriefingDone: L('Инструктаж пройден', 'Нұсқаулықтан өтті', 'Briefing completed'),
  briefingDraftNote: L('Вводное занятие ещё в разработке — требование инструктажа временно не действует.', 'Кіріспе сабақ әлі әзірленуде — нұсқаулық талабы уақытша қолданылмайды.', 'The introductory session is still in development — the briefing requirement is temporarily waived.'),

  /* страница работы */
  aim: L('Цель', 'Мақсаты', 'Aim'),
  relevance: L('Актуальность', 'Өзектілігі', 'Relevance'),
  topic: L('Тема', 'Тақырыбы', 'Topic'),
  admission: L('Допуск к работе', 'Жұмысқа рұқсат', 'Admission to the lab'),
  admTake: L('Пройти допуск', 'Рұқсат тестін тапсыру', 'Take the admission test'),
  admRetake: L('Пересдать', 'Қайта тапсыру', 'Retake'),
  admScore: L('Балл: {s} из {t}', 'Балл: {t} ішінен {s}', 'Score: {s} of {t}'),
  teacherComment: L('Комментарий преподавателя', 'Оқытушының пікірі', 'Instructor’s comment'),
  experiments: L('Опыты', 'Тәжірибелер', 'Experiments'),
  expN: L('Опыт {n}', '{n}-тәжірибе', 'Experiment {n}'),
  stageN: L('Этап {n}', '{n}-кезең', 'Stage {n}'),
  stages: L('Этапы', 'Кезеңдер', 'Stages'),
  finalTest: L('Итоговый тест', 'Қорытынды тест', 'Final test'),
  finalTestTake: L('Пройти итоговый тест', 'Қорытынды тесттен өту', 'Take the final test'),
  finalTestLocked: L('Итоговый тест откроется после всех этапов инструктажа', 'Қорытынды тест нұсқаулықтың барлық кезеңдерінен кейін ашылады', 'The final test opens after all the stages of the briefing'),
  finalTestReady: L('Все этапы пройдены — остался итоговый тест', 'Барлық кезең өтті — қорытынды тест қалды', 'All stages done — the final test remains'),
  stBriefingTodo: L('Инструктаж не пройден', 'Нұсқаулықтан өтпеген', 'Briefing not completed'),
  briefingApproved: L('Инструктаж засчитан — работы 6–15 открыты. Оформите запись в журнале инструктажа (протокол).', 'Нұсқаулық есептелді — 6–15-жұмыстар ашық. Нұсқаулық журналына жазбаны (хаттаманы) толтырыңыз.', 'Briefing accepted — labs 6–15 are open. Complete the briefing log entry (the report).'),
  optional: L('необязательный', 'міндетті емес', 'optional'),
  start: L('Начать', 'Бастау', 'Start'),
  continue: L('Продолжить', 'Жалғастыру', 'Continue'),
  redo: L('Выполнить заново', 'Қайта орындау', 'Do it again'),
  redoConfirm: L('Начать опыт заново? Текущая попытка будет заменена новой (цифры будут другими).', 'Тәжірибені қайта бастау керек пе? Ағымдағы әрекет жаңасымен ауыстырылады (сандар басқа болады).', 'Start the experiment again? The current attempt will be replaced by a new one (with different numbers).'),
  expDone: L('Выполнен', 'Орындалды', 'Done'),
  expLocked: L('Сначала выполните предыдущий опыт', 'Алдымен алдыңғы тәжірибені орындаңыз', 'Complete the previous experiment first'),
  needAdmission: L('Опыты откроются после допуска', 'Тәжірибелер рұқсат алғаннан кейін ашылады', 'Experiments open after admission'),
  report: L('Протокол', 'Хаттама', 'Lab report'),
  reportLocked: L('Протокол собирается после всех обязательных опытов', 'Хаттама барлық міндетті тәжірибелерден кейін құрастырылады', 'The report is compiled after all compulsory experiments'),
  safety: L('Техника безопасности', 'Қауіпсіздік техникасы', 'Lab safety'),
  reagents: L('Реактивы', 'Реактивтер', 'Reagents'),
  equipment: L('Оборудование', 'Құрал-жабдықтар', 'Equipment'),
  attempt: L('попытка {n}', '{n}-әрекет', 'attempt {n}'),
  hintsOff: L('Подсказки выключены преподавателем', 'Кеңестерді оқытушы өшірген', 'Hints have been switched off by the instructor'),
  labClosedText: L('Преподаватель временно закрыл эту работу. Дождитесь, пока её откроют.', 'Оқытушы бұл жұмысты уақытша жапты. Ашылғанын күтіңіз.', 'The instructor has closed this lab for now. Wait until it is opened.'),
  draftText: L('Эта работа ещё в разработке. Скоро она появится.', 'Бұл жұмыс әлі әзірленуде. Жақында қолжетімді болады.', 'This lab is still being developed. It will be available soon.'),
  briefingText: L('Сначала пройдите вводное занятие по технике безопасности.', 'Алдымен қауіпсіздік техникасы бойынша кіріспе сабақтан өтіңіз.', 'Complete the introductory safety session first.'),

  /* допуск */
  theory: L('Краткая теория', 'Қысқаша теория', 'Theory in brief'),
  admIntro: L('{n} вопросов из банка, для допуска нужно {p} верных. Варианты перемешаны. После проверки — разбор каждого вопроса.', 'Банктен {n} сұрақ, рұқсат үшін {p} дұрыс жауап қажет. Нұсқалар араластырылған. Тексерілгеннен кейін әр сұрақ талданады.', '{n} questions from the bank; {p} correct answers are needed. The options are shuffled. After checking, every question is explained.'),
  question: L('Вопрос {i} из {n}', '{n} ішінен {i}-сұрақ', 'Question {i} of {n}'),
  check: L('Проверить', 'Тексеру', 'Check'),
  answerAll: L('Ответьте на все вопросы', 'Барлық сұраққа жауап беріңіз', 'Answer all the questions'),
  result: L('Результат', 'Нәтиже', 'Result'),
  correct: L('Верно', 'Дұрыс', 'Correct'),
  wrong: L('Неверно', 'Қате', 'Incorrect'),
  yourAnswer: L('Ваш ответ', 'Сіздің жауабыңыз', 'Your answer'),
  rightAnswer: L('Верный ответ', 'Дұрыс жауап', 'Correct answer'),
  sentToTeacher: L('Заявка отправлена преподавателю', 'Өтінім оқытушыға жіберілді', 'Request sent to the instructor'),
  waitDecision: L('Ожидаем решения преподавателя. Статус проверяется автоматически раз в 30 секунд.', 'Оқытушының шешімін күтеміз. Мәртебе 30 секунд сайын автоматты түрде тексеріледі.', 'Waiting for the instructor’s decision. The status is checked automatically every 30 seconds.'),
  checkNow: L('Проверить', 'Тексеру', 'Check now'),
  admApproved: L('Допуск получен — можно выполнять опыты', 'Рұқсат алынды — тәжірибелерді орындауға болады', 'Admitted — you may start the experiments'),
  admDenied: L('Допуск не получен', 'Рұқсат алынбады', 'Not admitted'),
  admDeniedAuto: L('Набрано меньше {p} — повторите теорию и пересдайте (будет новый набор вопросов).', '{p}-ден аз жинадыңыз — теорияны қайталап, қайта тапсырыңыз (сұрақтар жаңадан таңдалады).', 'Fewer than {p} — revise the theory and retake (you will get a new set of questions).'),
  toLab: L('К работе', 'Жұмысқа', 'To the lab'),
  toExperiments: L('К опытам', 'Тәжірибелерге', 'To the experiments'),
  sendError: L('Не удалось отправить: {e}', 'Жіберу мүмкін болмады: {e}', 'Could not send: {e}'),
  sendingNow: L('Отправляем преподавателю… (до 30 секунд)', 'Оқытушыға жіберіп жатырмыз… (30 секундқа дейін)', 'Sending to the instructor… (up to 30 seconds)'),
  notSentYet: L('Ответ пока не дошёл до преподавателя: сервер не ответил. Он сохранён на этом устройстве и отправится автоматически — оставьте сайт открытым или нажмите «Отправить сейчас».', 'Жауап оқытушыға әлі жеткен жоқ: сервер жауап бермеді. Ол осы құрылғыда сақталды және автоматты түрде жіберіледі — сайтты ашық қалдырыңыз немесе «Қазір жіберу» батырмасын басыңыз.', 'Your answers have not reached the instructor yet: the server did not respond. They are saved on this device and will be sent automatically — keep the site open or press “Send now”.'),
  sendNow: L('Отправить сейчас', 'Қазір жіберу', 'Send now'),
  movedOk: L('Сайт переехал на новый адрес — сохраните его в закладки. Ваши допуски и прогресс перенесены.', 'Сайт жаңа мекенжайға көшті — оны бетбелгіге сақтаңыз. Рұқсаттарыңыз бен үлгеріміңіз көшірілді.', 'The site has moved to a new address — please bookmark it. Your admissions and progress have been transferred.'),
  movedSkip: L('Сайт переехал на новый адрес. В этом браузере вы уже работали на новом адресе, поэтому данные со старого не переносились.', 'Сайт жаңа мекенжайға көшті. Бұл браузерде сіз жаңа мекенжайда жұмыс істегенсіз, сондықтан ескі мекенжайдағы деректер көшірілмеді.', 'The site has moved to a new address. You have already used the new address in this browser, so data from the old one was not transferred.'),
  stillNotSent: L('Пока не удалось — повторим автоматически через 20 секунд.', 'Әзірге болмады — 20 секундтан кейін автоматты түрде қайталаймыз.', 'Not yet — we will retry automatically in 20 seconds.'),

  /* опыт */
  step: L('Шаг {k} из {n}', '{n} ішінен {k}-қадам', 'Step {k} of {n}'),
  next: L('Далее', 'Әрі қарай', 'Next'),
  finishExp: L('Завершить опыт', 'Тәжірибені аяқтау', 'Finish the experiment'),
  hint: L('Подсказка', 'Кеңес', 'Hint'),
  hintLevel: L('Подсказка {l} из 3', '3 ішінен {l}-кеңес', 'Hint {l} of 3'),
  hintCost: L('Следующая подсказка стоит {p} балла', 'Келесі кеңес {p} балл тұрады', 'The next hint costs {p} points'),
  hintFree: L('Первая подсказка бесплатна', 'Алғашқы кеңес тегін', 'The first hint is free'),
  hintNoMore: L('Подсказки на этом шаге исчерпаны', 'Бұл қадамдағы кеңестер таусылды', 'No more hints for this step'),
  hintMore: L('Ещё подсказка', 'Тағы кеңес', 'Another hint'),
  journal: L('Лабораторный журнал', 'Зертхана журналы', 'Lab notebook'),
  journalEmpty: L('Записей пока нет', 'Әзірге жазба жоқ', 'No entries yet'),
  obs: L('Набл.', 'Бақ.', 'Obs.'),
  remarkW: L('Замечание', 'Ескерту', 'Remark'),
  hintW: L('Подсказка', 'Кеңес', 'Hint'),
  day: L('День', 'Күн', 'Day'),
  dayShort: L('д', 'к', 'd'),
  restartExp: L('Начать опыт заново', 'Тәжірибені қайта бастау', 'Restart the experiment'),
  timeSpeed: L('Ход времени', 'Уақыт жылдамдығы', 'Time speed'),
  whatIf: L('Что будет, если так сделать?', 'Былай істесе не болады?', 'What happens if you do that?'),
  realLab: L('Что произошло бы в реальной лаборатории', 'Нақты зертханада не болар еді', 'What would have happened in a real laboratory'),
  expFailed: L('Опыт сорван', 'Тәжірибе үзілді', 'The experiment has failed'),
  restartFrom: L('Перезапустить с контрольной точки: {s}', 'Бақылау нүктесінен қайта бастау: {s}', 'Restart from the checkpoint: {s}'),
  restarted: L('Опыт перезапущен с контрольной точки «{s}»', 'Тәжірибе «{s}» бақылау нүктесінен қайта басталды', 'Experiment restarted from the checkpoint “{s}”'),
  accident: L('Аварийная ситуация', 'Апаттық жағдай', 'Emergency'),
  expComplete: L('Опыт завершён', 'Тәжірибе аяқталды', 'Experiment complete'),
  stepDone: L('Шаг выполнен', 'Қадам орындалды', 'Step complete'),
  event: L('Событие', 'Оқиға', 'Event'),
  choose: L('Выберите действие', 'Әрекетті таңдаңыз', 'Choose an action'),
  remarksN: L('Замечаний: {n}', 'Ескертулер: {n}', 'Remarks: {n}'),
  penalty: L('штрафных баллов', 'айыппұл балы', 'penalty points'),
  safetyMemo: L('Памятка по ТБ', 'ҚТ жадынамасы', 'Safety reminder'),
  on: L('вкл.', 'қосулы', 'on'),
  off: L('выкл.', 'өшірулі', 'off'),
  done: L('Готово', 'Дайын', 'Done'),
  stand: L('Лабораторный стенд', 'Зертхана стенді', 'Laboratory bench'),
  pointsShort: L('балл.', 'балл', 'pts'),

  sevMinor: L('нарушение порядка', 'тәртіп бұзу', 'procedure'),
  sevMajor: L('влияет на результат', 'нәтижеге әсер етеді', 'affects the result'),
  sevCritical: L('авария', 'апат', 'emergency'),
  sevSafety: L('нарушение ТБ', 'ҚТ бұзу', 'safety violation'),

  /* протокол */
  reportTitle: L('Протокол лабораторной работы', 'Зертханалық жұмыстың хаттамасы', 'Laboratory report'),
  student: L('Студент', 'Студент', 'Student'),
  date: L('Дата', 'Күні', 'Date'),
  labTime: L('лабораторное время', 'зертхана уақыты', 'lab time'),
  observations: L('Наблюдения', 'Бақылаулар', 'Observations'),
  equations: L('Уравнения реакций', 'Реакция теңдеулері', 'Equations'),
  calculations: L('Расчёты', 'Есептеулер', 'Calculations'),
  conclusion: L('Вывод', 'Қорытынды', 'Conclusion'),
  summaryTable: L('Итоговая таблица', 'Қорытынды кесте', 'Summary table'),
  assignment: L('Индивидуальное задание', 'Жеке тапсырма', 'Individual assignment'),
  freeAnswer: L('Ответ (его прочитает преподаватель)', 'Жауап (оны оқытушы оқиды)', 'Answer (the instructor will read it)'),
  remarks: L('Замечания', 'Ескертулер', 'Remarks'),
  noRemarks: L('Замечаний нет. Работа выполнена аккуратно, с соблюдением техники безопасности.', 'Ескерту жоқ. Жұмыс ұқыпты, қауіпсіздік техникасын сақтай отырып орындалды.', 'No remarks. The work was carried out carefully and safely.'),
  hintsUsed: L('Подсказки', 'Кеңестер', 'Hints'),
  hintsN: L('использовано: {n} (уровень 2 — {a}, уровень 3 — {b})', 'пайдаланылды: {n} (2-деңгей — {a}, 3-деңгей — {b})', 'used: {n} (level 2 — {a}, level 3 — {b})'),
  grade: L('Оценка', 'Баға', 'Grade'),
  gradeFor: L('Оценка за практическую часть', 'Практикалық бөлім үшін баға', 'Grade for the practical work'),
  grade5: L('отлично', 'өте жақсы', 'excellent'),
  grade4: L('хорошо', 'жақсы', 'good'),
  grade3: L('удовлетворительно', 'қанағаттанарлық', 'satisfactory'),
  grade2: L('неудовлетворительно', 'қанағаттанарлықсыз', 'unsatisfactory'),
  resultPenalty: L('за результат', 'нәтиже үшін', 'for the result'),
  print: L('Печать / PDF', 'Басып шығару / PDF', 'Print / PDF'),
  submit: L('Сдать протокол', 'Хаттаманы тапсыру', 'Submit the report'),
  resubmit: L('Отправить ещё раз', 'Қайта жіберу', 'Send again'),
  submitted: L('Отправлено преподавателю ✓', 'Оқытушыға жіберілді ✓', 'Sent to the instructor ✓'),
  queued: L('В очереди — отправится при подключении', 'Кезекте — байланыс болғанда жіберіледі', 'Queued — will be sent when online'),
  savedLocal: L('Сохранено на устройстве (сервер преподавателя не подключён)', 'Құрылғыда сақталды (оқытушы сервері қосылмаған)', 'Saved on this device (the instructor’s server is not connected)'),
  copyReport: L('Скопировать текст', 'Мәтінді көшіру', 'Copy text'),
  copied: L('Скопировано', 'Көшірілді', 'Copied'),
  examMark: L('Контрольный режим (без подсказок)', 'Бақылау режимі (кеңессіз)', 'Exam mode (no hints)'),
  journalFull: L('Лабораторный журнал (полностью)', 'Зертхана журналы (толық)', 'Lab notebook (full)'),
  lossTitle: L('Куда делся продукт', 'Өнім қайда кетті', 'Where the product went'),
  lossOf: L('% от теоретического', 'теориялықтан %', '% of theoretical'),
  emergencies: L('Аварийные ситуации', 'Апаттық жағдайлар', 'Emergencies'),
  checkAnswer: L('Проверить ответ', 'Жауапты тексеру', 'Check the answer'),
  autoCheck: L('Автопроверка: {a} из {b} верно', 'Автотексеру: {b} ішінен {a} дұрыс', 'Auto-check: {a} of {b} correct'),
  notDone: L('не выполнен', 'орындалмады', 'not done'),
  reagentsUsed: L('Реактивы и количества', 'Реактивтер және мөлшерлері', 'Reagents and amounts'),
  reportSubmitHint: L('Ответьте на задание и нажмите «Сдать протокол» — он уйдёт преподавателю.', 'Тапсырмаға жауап беріп, «Хаттаманы тапсыру» батырмасын басыңыз — ол оқытушыға жіберіледі.', 'Answer the assignment and press “Submit the report” — it will be sent to the instructor.'),

  /* доступ к сайту */
  accessTitle: L('Заявка на доступ к сайту', 'Сайтқа кіруге өтінім', 'Request access to the site'),
  accessText: L('Преподаватель открыл сайт только для одобренных студентов. Укажите ФИО и группу и отправьте заявку.', 'Оқытушы сайтты тек мақұлданған студенттерге ашты. Аты-жөніңізді және тобыңызды көрсетіп, өтінім жіберіңіз.', 'The instructor has opened the site to approved students only. Enter your full name and group and send a request.'),
  accessSend: L('Отправить', 'Жіберу', 'Send'),
  accessPending: L('Заявка отправлена. Дождитесь одобрения преподавателя — страница обновится сама.', 'Өтінім жіберілді. Оқытушының мақұлдауын күтіңіз — бет өзі жаңарады.', 'Request sent. Wait for the instructor’s approval — the page will update by itself.'),
  accessDenied: L('Заявка отклонена', 'Өтінім қабылданбады', 'Request declined'),
  accessAgain: L('Отправить заявку снова', 'Өтінімді қайта жіберу', 'Send the request again'),
};

/** Баллы без лишних нулей: 1 → «1», 0.5 → «0,5», 0.25 → «0,25». */
export function pts(p, l = lang) {
  const c = Math.round(Math.abs(p) * 100);
  const d = c % 100 === 0 ? 0 : c % 10 === 0 ? 1 : 2;
  return num(p, d, l);
}
