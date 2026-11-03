/** Этап 6. Пожар и первая помощь — разделы 11–13 правил ТБ (и п. 6.3). */
import { L, n } from '../../app/i18n.js';
import { fireScene, eyewashScene, spillScene, bench, beaker, person, scene, STYLE, flames, text } from './scene.js';
import { stageResults } from './common.js';

const WATER_FIRE = {
  ru: 'Горящий органический растворитель легче воды и не смешивается с ней: вода уходит под него, вскипает и разбрызгивает горящую жидкость — огонь растекается по столу и на пол. В реальной лаборатории это уже большой пожар: огнетушитель, эвакуация (п. 11.4). Небольшой очаг в стакане накрывают часовым стеклом, влажной тканью или противопожарным одеялом — без доступа воздуха пламя гаснет.',
  kk: 'Жанып жатқан органикалық еріткіш судан жеңіл және онымен араласпайды: су оның астына кетіп, қайнайды да, жанып жатқан сұйықты шашыратады — от үстел бойымен және еденге жайылады. Нақты зертханада бұл енді үлкен өрт: өрт сөндіргіш, эвакуация (11.4-тармақ). Стақандағы шағын ошақты сағат шынысымен, дымқыл матамен немесе өртке қарсы жамылғымен жабады — ауа кірмесе, жалын сөнеді.',
  en: 'A burning organic solvent is lighter than water and does not mix with it: the water sinks beneath it, boils and splashes the burning liquid about — the fire spreads over the bench and onto the floor. In a real lab that is now a major fire: extinguisher, evacuation (rule 11.4). A small fire in a beaker is covered with a watch glass, a damp cloth or a fire blanket — without air the flame goes out.',
};

const sBeaker = {
  type: 'decide', id: 'beakerFire',
  title: L('Загорелся стакан', 'Стақан жанып кетті', 'A beaker is on fire'),
  instr: L('<p>В стакане вспыхнул остаток спирта. Пламя только в стакане. Что делать?</p>', '<p>Стақандағы спирт қалдығы тұтанып кетті. Жалын тек стақанда. Не істеу керек?</p>', '<p>The alcohol left in a beaker has caught fire. The flame is only in the beaker. What do you do?</p>'),
  need: L('Потушите очаг', 'Ошақты сөндіріңіз', 'Put the fire out'),
  scene: (S, lc) => fireScene({ out: lc.chosen === 'cover', spread: (lc.tried || []).includes('water') }),
  options: [
    { id: 'cover', ok: true, label: L('Накрыть стакан часовым стеклом (влажной тканью, противопожарным одеялом)', 'Стақанды сағат шынысымен (дымқыл матамен, өртке қарсы жамылғымен) жабу', 'Cover the beaker with a watch glass (a damp cloth, a fire blanket)'),
      why: L('П. 11.2.', '11.2-тармақ.', 'Rule 11.2.'), obs: L('Стакан накрыт часовым стеклом — пламя погасло через несколько секунд', 'Стақан сағат шынысымен жабылды — жалын бірнеше секундтан кейін сөнді', 'Beaker covered with a watch glass — the flame went out within seconds') },
    { id: 'water', ok: false, label: L('Залить водой из-под крана', 'Шүмектегі сумен құю', 'Pour tap water on it'),
      remark: L('горящий растворитель заливали водой (п. 11.2)', 'жанып жатқан еріткішке су құйылды (11.2-тармақ)', 'water poured on a burning solvent (rule 11.2)'), critical: { text: WATER_FIRE } },
    { id: 'carry', ok: false, severity: 'safety', retry: true, label: L('Отнести горящий стакан в раковину', 'Жанып жатқан стақанды раковинаға апару', 'Carry the burning beaker to the sink'),
      remark: L('горящий сосуд переносили руками', 'жанып жатқан ыдыс қолмен тасылды', 'carried a burning vessel by hand'),
      whatif: L('Горячее стекло обжигает руки; споткнулись — и горящая жидкость на одежде и на полу.', 'Ыстық шыны қолды күйдіреді; сүрініп кетсеңіз — жанып жатқан сұйық киімге және еденге төгіледі.', 'The hot glass burns your hands; one stumble and the burning liquid is on your clothes and the floor.') },
    { id: 'blow', ok: false, severity: 'major', retry: true, label: L('Задуть пламя', 'Жалынды үрлеп сөндіру', 'Blow the flame out'),
      remark: L('пламя пытались задуть', 'жалынды үрлеп сөндіруге тырысты', 'tried to blow the flame out'),
      whatif: L('Поток воздуха раздувает пламя и брызгает горящей жидкостью в лицо.', 'Ауа ағыны жалынды өршітіп, жанып жатқан сұйықты бетке шашыратады.', 'The draught fans the flame and blows burning liquid towards your face.') },
  ],
};

const sClothes = {
  type: 'decide', id: 'clothes',
  title: L('Загорелась одежда', 'Киім жанып кетті', 'Clothing on fire'),
  instr: L('<p>У соседа загорелся рукав халата. Что ему делать?</p>', '<p>Көршіңіздің халатының жеңі жанып кетті. Ол не істеуі керек?</p>', '<p>Your neighbour’s coat sleeve has caught fire. What should they do?</p>'),
  need: L('Выберите действие', 'Әрекетті таңдаңыз', 'Choose the action'),
  scene: () => scene(STYLE + person(180, { hair: 'tied', gog: true, hy: 70 }) + flames(204, 140, 22, 30) + `<rect x="0" y="152" width="360" height="80" fill="var(--bench)" opacity=".5"/>`),
  options: [
    { id: 'roll', ok: true, label: L('Остановиться, упасть на пол и кататься (или встать под аварийный душ); окружающие накрывают одеялом', 'Тоқтап, еденге құлап, домалау (немесе апаттық душқа тұру); айналадағылар жамылғымен жабады', 'Stop, drop and roll (or get under the safety shower); others smother it with a blanket'),
      why: L('П. 11.3.', '11.3-тармақ.', 'Rule 11.3.'), log: L('Горящая одежда потушена: остановиться — упасть — кататься, противопожарное одеяло (п. 11.3)', 'Жанып жатқан киім сөндірілді: тоқта — құла — домала, өртке қарсы жамылғы (11.3-тармақ)', 'Burning clothing put out: stop, drop, roll and the fire blanket (rule 11.3)') },
    { id: 'run', ok: false, label: L('Бежать к выходу за помощью', 'Көмек сұрап шығуға қарай жүгіру', 'Run to the exit for help'),
      remark: L('при горящей одежде побежал (п. 11.3)', 'киім жанып жатқанда жүгірді (11.3-тармақ)', 'ran while their clothing was on fire (rule 11.3)'),
      critical: { text: L('На бегу приток воздуха раздувает пламя: огонь охватывает весь халат и волосы, ожоги становятся тяжёлыми. В реальной лаборатории человека останавливают, укладывают и накрывают противопожарным одеялом или ставят под аварийный душ, затем — первая помощь при ожоге (п. 12.5) и врач.',
        'Жүгіргенде ауа ағыны жалынды өршітеді: от бүкіл халат пен шашты қамтиды, күйіктер ауыр болады. Нақты зертханада адамды тоқтатып, жатқызып, өртке қарсы жамылғымен жабады немесе апаттық душқа тұрғызады, содан кейін — күйік кезіндегі алғашқы көмек (12.5-тармақ) және дәрігер.',
        'Running fans the flames: the fire spreads over the whole coat and the hair and the burns become severe. In a real lab the person is stopped, laid down and covered with a fire blanket or put under the safety shower, then given first aid for burns (rule 12.5) and a doctor.') } },
    { id: 'hands', ok: false, severity: 'major', retry: true, label: L('Сбивать пламя голыми руками', 'Жалынды жалаң қолмен басу', 'Beat the flames with bare hands'),
      remark: L('пламя на одежде сбивали руками', 'киімдегі жалын қолмен басылды', 'flames on clothing beaten with the hands'),
      whatif: L('Ожоги рук, а пламя продолжает гореть: без доступа воздуха — одеяло, пол, душ.', 'Қол күйеді, ал жалын жана береді: ауаны тосу керек — жамылғы, еден, душ.', 'Burnt hands and the flame keeps burning: it needs air cut off — the blanket, the floor, the shower.') },
  ],
};

const sFireQuiz = {
  type: 'quiz', id: 'q6a',
  title: L('Огнетушитель и эвакуация', 'Өрт сөндіргіш және эвакуация', 'Extinguishers and evacuation'),
  instr: L('<p>Раздел 11 правил ТБ.</p>', '<p>ҚТ ережелерінің 11-бөлімі.</p>', '<p>Section 11 of the safety rules.</p>'),
  scene: () => fireScene({ spread: true, label: L('крупный пожар — эвакуация', 'ірі өрт — эвакуация', 'a major fire — evacuate') }),
  need: L('Ответьте на все вопросы', 'Барлық сұраққа жауап беріңіз', 'Answer every question'),
  questions: [
    { q: L('Какие огнетушители обычно применяют для химических пожаров?', 'Химиялық өрттерге әдетте қандай өрт сөндіргіштер қолданылады?', 'Which extinguishers are usually used for chemical fires?'),
      options: [L('Углекислотные и порошковые', 'Көмірқышқыл және ұнтақ', 'Carbon dioxide and powder'), L('Только водяные', 'Тек сулы', 'Water only'), L('Любые — разницы нет', 'Кез келгені — айырмашылық жоқ', 'Any — it makes no difference')], correct: 0, why: L('П. 11.1.', '11.1-тармақ.', 'Rule 11.1.') },
    { q: L('Горит вытяжной шкаф, пламя растёт. Ваши действия?', 'Тартпа шкаф жанып жатыр, жалын өсіп келеді. Сіздің әрекетіңіз?', 'The fume hood is on fire and the flames are growing. What do you do?'),
      options: [L('Немедленно эвакуироваться по установленному маршруту и оповестить преподавателя и аварийные службы', 'Белгіленген бағытпен дереу эвакуациялану және оқытушы мен апаттық қызметтерге хабарлау', 'Evacuate at once by the set route and alert the instructor and emergency services'), L('Закончить опыт и только потом выйти', 'Тәжірибені аяқтап, содан кейін ғана шығу', 'Finish the experiment, then leave'), L('Тушить самостоятельно до последнего', 'Соңына дейін өз бетінше сөндіру', 'Keep fighting it yourself to the end')], correct: 0, why: L('П. 11.4.', '11.4-тармақ.', 'Rule 11.4.') },
  ],
};

const sEye = {
  type: 'process', id: 'eye',
  title: L('Брызги в глаз', 'Көзге шашырады', 'A splash in the eye'),
  instr: L('<p>Капля разбавленной щёлочи попала соседу в глаз. Окажите первую помощь у фонтанчика для промывания глаз (п. 12.2): включите воду, удерживайте веко открытым, промывайте <b>не менее 15 минут</b>, затем — сообщите преподавателю и обратитесь за медицинской помощью.</p>',
    '<p>Сұйылтылған сілтінің тамшысы көршіңіздің көзіне түсті. Көз жуатын фонтан жанында алғашқы көмек көрсетіңіз (12.2-тармақ): суды қосып, қабақты ашық ұстап, <b>кемінде 15 минут</b> жуыңыз, содан кейін — оқытушыға хабарлап, медициналық көмекке жүгініңіз.</p>',
    '<p>A drop of dilute alkali has gone into your neighbour’s eye. Give first aid at the eyewash station (rule 12.2): turn on the water, hold the eyelid open, rinse for <b>at least 15 minutes</b>, then tell the instructor and get medical help.</p>'),
  need: L('15 минут промывания, затем сообщить и к врачу', '15 минут жуу, содан кейін хабарлап, дәрігерге', '15 minutes of rinsing, then report and see a doctor'),
  speeds: [10, 30, 60],
  setup(S) { S.eye = S.eye || { t: 0, on: false, open: false, stopped: false }; },
  controls: [
    { kind: 'toggle', id: 'on', group: L('Фонтанчик', 'Фонтан', 'Eyewash'), label: L('Включить воду', 'Суды қосу', 'Turn on the water'), labelOn: L('Вода идёт', 'Су ағып жатыр', 'Water running'), when: (S) => !S.eye.stopped, onChange(S, lc, on) { S.eye.on = on; }, log: L('Пострадавший у фонтанчика, вода включена', 'Зардап шеккен фонтан жанында, су қосылды', 'Casualty at the eyewash, water on') },
    { kind: 'toggle', id: 'open', group: L('Фонтанчик', 'Фонтан', 'Eyewash'), label: L('Удерживать веко открытым', 'Қабақты ашық ұстау', 'Hold the eyelid open'), labelOn: L('Веко открыто', 'Қабақ ашық', 'Eyelid held open'), when: (S) => !S.eye.stopped, onChange(S, lc, on) { S.eye.open = on; } },
    { kind: 'action', id: 'rub', group: L('Другие действия', 'Басқа әрекеттер', 'Other actions'), label: L('Потереть глаз, чтобы убрать каплю', 'Тамшыны кетіру үшін көзді уқалау', 'Rub the eye to get the drop out'), cls: 'danger',
      remark: { key: 'rub', severity: 'safety', text: L('пострадавшему тёрли глаз', 'зардап шеккеннің көзі уқаланды', 'the casualty’s eye was rubbed'), whatif: L('Трение втирает щёлочь в роговицу и усиливает повреждение. Только обильное промывание водой.', 'Уқалау сілтіні қасаңқабыққа сіңдіріп, зақымды күшейтеді. Тек сумен мол жуу.', 'Rubbing works the alkali into the cornea and makes the damage worse. Only plenty of running water.') } },
    { kind: 'action', id: 'stop', group: L('Другие действия', 'Басқа әрекеттер', 'Other actions'), label: L('Закончить промывание', 'Жууды аяқтау', 'Stop rinsing'), requires: [],
      when: (S) => S.eye.t > 0, whenText: L('Промывание ещё не начато.', 'Жуу әлі басталған жоқ.', 'Rinsing has not started yet.'),
      do(S, lc, ctx) {
        S.eye.stopped = true; S.eye.on = false; lc.c.on = false; lc.c.open = false;
        const min = S.eye.t / 60;
        ctx.log(L(`Глаз промывали ${n(min, 1)} мин`, `Көз ${n(min, 1)} мин жуылды`, `The eye was rinsed for ${n(min, 1)} min`), 'obs');
        if (min < 15) ctx.remark({ key: 'short', severity: 'major', text: L(`глаз промывали только ${n(min, 1)} мин вместо не менее 15 (п. 12.2)`, `көз 15 минуттың орнына тек ${n(min, 1)} мин жуылды (12.2-тармақ)`, `the eye was rinsed for only ${n(min, 1)} min instead of at least 15 (rule 12.2)`), whatif: L('Щёлочь продолжает действовать на ткани глаза; короткое промывание её не удаляет.', 'Сілті көз тіндеріне әсер ете береді; қысқа жуу оны кетірмейді.', 'Alkali keeps acting on the eye tissue; a short rinse does not remove it.') });
      } },
    { kind: 'action', id: 'report', group: L('После промывания', 'Жуғаннан кейін', 'After rinsing'), label: L('Сообщить преподавателю', 'Оқытушыға хабарлау', 'Tell the instructor'), requires: ['stop'], log: L('О происшествии сообщено преподавателю (п. 12.6)', 'Оқиға туралы оқытушыға хабарланды (12.6-тармақ)', 'Incident reported to the instructor (rule 12.6)') },
    { kind: 'action', id: 'doctor', group: L('После промывания', 'Жуғаннан кейін', 'After rinsing'), label: L('Обратиться за медицинской помощью', 'Медициналық көмекке жүгіну', 'Get medical help'), requires: ['stop'], log: L('Пострадавший направлен за медицинской помощью (п. 12.2)', 'Зардап шеккен медициналық көмекке жіберілді (12.2-тармақ)', 'Casualty sent for medical help (rule 12.2)') },
  ],
  tick(S, lc, dt) { if (S.eye.on && S.eye.open && !S.eye.stopped) S.eye.t += dt; },
  readouts: (S) => [{ label: L('Промывание', 'Жуу', 'Rinsing'), value: L(`${n(S.eye.t / 60, 1)} / 15 мин`, `${n(S.eye.t / 60, 1)} / 15 мин`, `${n(S.eye.t / 60, 1)} / 15 min`), st: S.eye.t >= 900 ? 'ok' : '' }],
  alerts: (S) => (S.eye.on && !S.eye.open && !S.eye.stopped ? { text: L('Веко сомкнуто — вода не попадает в глаз. Удерживайте веко открытым.', 'Қабақ жабық — су көзге тимейді. Қабақты ашық ұстаңыз.', 'The eyelid is closed — the water is not reaching the eye. Hold it open.'), kind: 'warn' } : S.eye.t >= 900 && !S.eye.stopped ? { text: L('15 минут прошло. Можно заканчивать промывание.', '15 минут өтті. Жууды аяқтауға болады.', '15 minutes have passed. You may stop rinsing.'), kind: 'good' } : null),
  stop: (S) => S.eye.stopped,
  done: (S, lc) => S.eye.stopped && lc.done.report && lc.done.doctor && { text: L('Первая помощь оказана.', 'Алғашқы көмек көрсетілді.', 'First aid given.') },
  scene: (S) => eyewashScene({ eye: S.eye }),
  hints: [
    L('П. 12.2: немедленно, у фонтанчика, не менее 15 минут, веко открыто; затем врач. П. 12.6: сообщить преподавателю.', '12.2-тармақ: дереу, фонтан жанында, кемінде 15 минут, қабақ ашық; содан кейін дәрігер. 12.6-тармақ: оқытушыға хабарлау.', 'Rule 12.2: at once, at the eyewash, at least 15 minutes, eyelid open; then a doctor. Rule 12.6: tell the instructor.'),
    L('Включите обе кнопки — «Вода» и «Веко открыто»; ускорьте ход времени ×60. Тереть глаз нельзя.', 'Екі батырманы да қосыңыз — «Су» және «Қабақ ашық»; уақытты ×60 жылдамдатыңыз. Көзді уқалауға болмайды.', 'Switch on both “Water” and “Eyelid open”; speed time up to ×60. Never rub the eye.'),
    L('Вода + веко → ждать 15 мин → «Закончить промывание» → «Сообщить преподавателю» → «Обратиться за медицинской помощью».', 'Су + қабақ → 15 мин күту → «Жууды аяқтау» → «Оқытушыға хабарлау» → «Медициналық көмекке жүгіну».', 'Water + eyelid → wait 15 min → “Stop rinsing” → “Tell the instructor” → “Get medical help”.'),
  ],
};

const handScene = (label) => () => bench(`<path d="M120 196 Q120 150 150 146 L230 146 Q250 150 250 170 L250 196 Z" fill="#e6bf9a"/><ellipse cx="200" cy="164" rx="16" ry="9" fill="rgba(200,60,40,.35)"/>`, label);

const sSkin = {
  type: 'decide', id: 'skin',
  title: L('Кислота на коже', 'Теріге қышқыл тиді', 'Acid on the skin'),
  instr: L('<p>На руку выше перчатки брызнула кислота. Что делать?</p>', '<p>Қолғаптан жоғары қолға қышқыл шашырады. Не істеу керек?</p>', '<p>Acid has splashed onto your arm above the glove. What do you do?</p>'),
  need: L('Выберите действие', 'Әрекетті таңдаңыз', 'Choose the action'),
  scene: handScene(L('Брызги кислоты на коже', 'Теріде қышқыл шашырандылары', 'Acid splash on the skin')),
  options: [
    { id: 'rinse', ok: true, label: L('Сразу промыть большим количеством проточной воды не менее 15 минут, снять загрязнённую одежду, сообщить преподавателю', 'Бірден мол ағын сумен кемінде 15 минут жуу, ластанған киімді шешу, оқытушыға хабарлау', 'Rinse at once under plenty of running water for at least 15 minutes, remove contaminated clothing, tell the instructor'),
      why: L('Пп. 6.3, 12.1.', '6.3, 12.1-тармақтар.', 'Rules 6.3, 12.1.'), log: L('Кожа промыта проточной водой 15 мин, преподаватель извещён (пп. 6.3, 12.1)', 'Тері ағын сумен 15 мин жуылды, оқытушыға хабарланды (6.3, 12.1-тармақтар)', 'Skin rinsed under running water for 15 min, instructor informed (rules 6.3, 12.1)'), advance: 900 },
    { id: 'naoh', ok: false, severity: 'major', retry: true, label: L('Нейтрализовать раствором щёлочи', 'Сілті ерітіндісімен бейтараптау', 'Neutralise it with an alkali solution'),
      remark: L('кислоту на коже «нейтрализовали» щёлочью', 'терідегі қышқылды сілтімен «бейтараптады»', 'tried to “neutralise” acid on the skin with alkali'),
      whatif: L('Реакция выделяет тепло, а щёлочь сама разъедает кожу — к кислотному ожогу добавляется щелочной. Только вода.', 'Реакция жылу бөледі, ал сілтінің өзі теріні жейді — қышқыл күйігіне сілті күйігі қосылады. Тек су.', 'The reaction releases heat and alkali itself attacks the skin — an alkali burn is added to the acid burn. Only water.') },
    { id: 'wipe', ok: false, severity: 'safety', retry: true, label: L('Вытереть салфеткой и продолжить работу', 'Майлықпен сүртіп, жұмысты жалғастыру', 'Wipe it off with a tissue and carry on'),
      remark: L('кислоту с кожи только вытерли, без промывания и без сообщения преподавателю (пп. 6.3, 12.6)', 'терідегі қышқыл тек сүртілді, жуылмады және оқытушыға хабарланбады (6.3, 12.6-тармақтар)', 'acid only wiped off the skin, without rinsing or telling the instructor (rules 6.3, 12.6)'),
      whatif: L('Остатки кислоты продолжают действовать, ожог проявится позже и будет глубже.', 'Қышқыл қалдықтары әсер ете береді, күйік кейін білінеді және тереңірек болады.', 'Residual acid keeps working; the burn shows later and goes deeper.') },
  ],
};

const sBurn = {
  type: 'decide', id: 'burn',
  title: L('Термический ожог', 'Термиялық күйік', 'A thermal burn'),
  instr: L('<p>Задели горячую плитку — на пальцах покраснение и боль. Первая помощь?</p>', '<p>Ыстық плитаға тиіп кеттіңіз — саусақтар қызарып, ауырады. Алғашқы көмек?</p>', '<p>You touched the hot plate — your fingers are red and painful. First aid?</p>'),
  need: L('Выберите действие', 'Әрекетті таңдаңыз', 'Choose the action'),
  scene: handScene(L('Ожог пальцев', 'Саусақ күйігі', 'Burnt fingers')),
  options: [
    { id: 'cool', ok: true, label: L('Охладить проточной водой, не мазать и не прикладывать лёд, неплотно прикрыть чистой тканью, к врачу', 'Ағын сумен салқындату, май жақпау және мұз баспау, таза матамен еркін жабу, дәрігерге', 'Cool under running water, no ointment and no ice, cover loosely with a clean cloth, see a doctor'),
      why: L('П. 12.5.', '12.5-тармақ.', 'Rule 12.5.'), log: L('Ожог охлаждён проточной водой, прикрыт чистой тканью (п. 12.5)', 'Күйік ағын сумен салқындатылып, таза матамен жабылды (12.5-тармақ)', 'Burn cooled under running water and covered with a clean cloth (rule 12.5)') },
    { id: 'oil', ok: false, severity: 'major', retry: true, label: L('Смазать маслом или мазью', 'Маймен немесе жақпа маймен жағу', 'Put oil or ointment on it'),
      remark: L('ожог смазали мазью (п. 12.5)', 'күйікке жақпа май жағылды (12.5-тармақ)', 'ointment put on a burn (rule 12.5)'),
      whatif: L('Жирный слой удерживает тепло в коже и мешает осмотру врачом.', 'Майлы қабат жылуды теріде ұстап, дәрігердің қарауына кедергі келтіреді.', 'A greasy layer holds the heat in the skin and hinders the doctor’s examination.') },
    { id: 'ice', ok: false, severity: 'major', retry: true, label: L('Приложить лёд прямо к ожогу', 'Мұзды тікелей күйікке басу', 'Put ice directly on the burn'),
      remark: L('лёд прямо на ожог (п. 12.5)', 'мұз тікелей күйікке (12.5-тармақ)', 'ice directly on a burn (rule 12.5)'),
      whatif: L('Лёд повреждает обожжённую кожу холодом. Охлаждают проточной водой.', 'Мұз күйген теріні суықпен зақымдайды. Ағын сумен салқындатады.', 'Ice damages burnt skin with cold. Cool it under running water.') },
  ],
};

const sVapour = {
  type: 'decide', id: 'vapour',
  title: L('Надышался парами', 'Буымен тыныстап алды', 'Vapour inhaled'),
  instr: L('<p>Студент работал вне тяги, у него головокружение и слабость. Что делать?</p>', '<p>Студент тартпадан тыс жұмыс істеді, басы айналып, әлсіздік пайда болды. Не істеу керек?</p>', '<p>A student worked outside the hood and now feels dizzy and weak. What do you do?</p>'),
  need: L('Выберите действие', 'Әрекетті таңдаңыз', 'Choose the action'),
  scene: () => scene(STYLE + person(180, { hair: 'short', gog: true, hy: 80 }) + `<rect x="0" y="152" width="360" height="80" fill="var(--bench)" opacity=".5"/>` + text(180, 50, L('головокружение', 'бас айналу', 'dizziness'), 'lblb')),
  options: [
    { id: 'air', ok: true, label: L('Вывести на свежий воздух, ослабить стесняющую одежду, при затруднении дыхания — за медицинской помощью', 'Таза ауаға шығару, қысып тұрған киімді босату, тыныс алу қиындаса — медициналық көмекке', 'Take them into fresh air, loosen tight clothing, get medical help if breathing is difficult'),
      why: L('П. 12.3.', '12.3-тармақ.', 'Rule 12.3.'), log: L('Пострадавший выведен на свежий воздух, одежда ослаблена (п. 12.3)', 'Зардап шеккен таза ауаға шығарылды, киімі босатылды (12.3-тармақ)', 'Casualty taken into fresh air, clothing loosened (rule 12.3)') },
    { id: 'sit', ok: false, severity: 'major', retry: true, label: L('Посадить тут же, за рабочий стол, и дать воды', 'Сол жерде жұмыс үстеліне отырғызып, су беру', 'Sit them down right there at the bench with a glass of water'),
      remark: L('пострадавший от паров оставлен в загрязнённом помещении (п. 12.3)', 'будан зардап шеккен ластанған бөлмеде қалдырылды (12.3-тармақ)', 'vapour casualty left in the contaminated room (rule 12.3)'),
      whatif: L('Он продолжает дышать теми же парами — состояние ухудшается.', 'Ол сол буларды жұтуды жалғастырады — жағдайы нашарлайды.', 'They go on breathing the same vapour and get worse.') },
  ],
};

const sSwallow = {
  type: 'decide', id: 'swallow',
  title: L('Случайное проглатывание', 'Абайсызда жұтып қою', 'Accidental swallowing'),
  instr: L('<p>Студент случайно проглотил немного раствора. Что делать?</p>', '<p>Студент абайсызда аздап ерітінді жұтып қойды. Не істеу керек?</p>', '<p>A student has accidentally swallowed a little solution. What do you do?</p>'),
  need: L('Выберите действие', 'Әрекетті таңдаңыз', 'Choose the action'),
  scene: () => bench(beaker({ id: 'l0sw', x: 150, y: 140, w: 50, hh: 56, frac: 0.4 }) + `<g transform="translate(220 0)"><rect class="pnl" x="10" y="120" width="44" height="76" rx="6"/><rect x="14" y="140" width="36" height="26" fill="var(--panel)" stroke="var(--muted)"/>${text(32, 157, L('этикетка', 'этикетка', 'label'), 'lbl')}</g>`, L('Склянка с этикеткой', 'Этикеткасы бар құты', 'The labelled bottle')),
  options: [
    { id: 'doc', ok: true, label: L('Рвоту не вызывать, немедленно к врачу — с этикеткой реактива или паспортом безопасности', 'Құсуды шақырмау, дереу дәрігерге — реактив этикеткасымен немесе қауіпсіздік паспортымен', 'Do not induce vomiting; get medical help at once, taking the reagent label or safety data sheet'),
      why: L('П. 12.4.', '12.4-тармақ.', 'Rule 12.4.'), log: L('Пострадавший направлен к врачу с этикеткой реактива, рвоту не вызывали (п. 12.4)', 'Зардап шеккен реактив этикеткасымен дәрігерге жіберілді, құсу шақырылмады (12.4-тармақ)', 'Casualty sent to a doctor with the reagent label; vomiting not induced (rule 12.4)') },
    { id: 'vomit', ok: false, severity: 'major', retry: true, label: L('Сразу вызвать рвоту', 'Бірден құсуды шақыру', 'Make them vomit straight away'),
      remark: L('вызвали рвоту без указания врача (п. 12.4)', 'дәрігердің нұсқауынсыз құсу шақырылды (12.4-тармақ)', 'vomiting induced without medical advice (rule 12.4)'),
      whatif: L('Едкое вещество второй раз проходит по пищеводу и может попасть в дыхательные пути.', 'Күйдіргіш зат өңеш арқылы екінші рет өтеді және тыныс жолдарына түсуі мүмкін.', 'A corrosive substance passes up the oesophagus a second time and may get into the airway.') },
    { id: 'wait', ok: false, severity: 'major', retry: true, label: L('Выпить воды и подождать — вдруг пройдёт', 'Су ішіп, күту — мүмкін өтіп кетер', 'Drink some water and wait — it may pass'),
      remark: L('при отравлении не обратились за медицинской помощью (п. 12.4)', 'улану кезінде медициналық көмекке жүгінбеді (12.4-тармақ)', 'no medical help sought after poisoning (rule 12.4)'),
      whatif: L('Время упущено; врач не будет знать, какое вещество проглочено.', 'Уақыт өтіп кетеді; дәрігер қандай зат жұтылғанын білмейді.', 'Time is lost, and the doctor will not know what was swallowed.') },
  ],
};

const sGas = {
  type: 'decide', id: 'gas',
  title: L('Сильный посторонний запах', 'Қатты бөгде иіс', 'A strong unusual smell'),
  instr: L('<p>В лаборатории появился сильный запах газа. Ваши действия?</p>', '<p>Зертханада газдың қатты иісі пайда болды. Сіздің әрекетіңіз?</p>', '<p>A strong smell of gas has appeared in the lab. What do you do?</p>'),
  need: L('Выберите действие', 'Әрекетті таңдаңыз', 'Choose the action'),
  scene: () => scene(STYLE + `<rect x="40" y="40" width="280" height="190" rx="8" fill="none" stroke="var(--line)"/><g opacity=".45">${[80, 150, 220, 290].map((x, i) => `<path class="steam" style="animation-delay:${i * 0.5}s" d="M${x} 210 q-8 -20 0 -40 q8 -20 0 -40" fill="none" stroke="var(--muted)" stroke-width="3" stroke-linecap="round"/>`).join('')}</g>` + text(180, 30, L('запах газа', 'газ иісі', 'smell of gas'), 'lblb')),
  options: [
    { id: 'leave', ok: true, label: L('Покинуть помещение, по возможности проветрить, вернуться только с разрешения преподавателя', 'Бөлмеден шығу, мүмкін болса желдету, тек оқытушының рұқсатымен қайту', 'Leave the room, ventilate if possible, come back only when the instructor allows'),
      why: L('П. 13.2.', '13.2-тармақ.', 'Rule 13.2.'), log: L('Помещение покинуто и проветрено (п. 13.2)', 'Бөлмеден шығып, желдетілді (13.2-тармақ)', 'Room left and ventilated (rule 13.2)') },
    { id: 'match', ok: false, label: L('Найти утечку, посветив зажигалкой', 'Тұтандырғышпен жарық түсіріп, ағып жатқан жерді табу', 'Find the leak with a lighter'),
      remark: L('открытое пламя при запахе газа (пп. 7.5, 13.2)', 'газ иісі кезінде ашық жалын (7.5, 13.2-тармақтар)', 'open flame with a smell of gas (rules 7.5, 13.2)'),
      critical: { text: L('Газ, смешанный с воздухом, вспыхивает от пламени зажигалки — хлопок и пожар. В реальной лаборатории при запахе газа ничего не зажигают и не включают, а покидают помещение и проветривают.', 'Ауамен араласқан газ тұтандырғыштың жалынынан тұтанады — жарылыс және өрт. Нақты зертханада газ иісі шыққанда ештеңе тұтатпайды және қоспайды, бөлмеден шығып, желдетеді.', 'Gas mixed with air ignites from the lighter flame — a bang and a fire. In a real lab, with a smell of gas nothing is lit or switched on; you leave and ventilate.') } },
    { id: 'stay', ok: false, severity: 'safety', retry: true, label: L('Продолжить работу у вытяжного шкафа — там же тяга', 'Тартпа шкаф жанында жұмысты жалғастыру — онда тартым бар', 'Carry on working at the hood — it has extraction'),
      remark: L('при утечке газа остался в помещении (п. 13.2)', 'газ ағып жатқанда бөлмеде қалды (13.2-тармақ)', 'stayed in the room during a gas leak (rule 13.2)'),
      whatif: L('Тяга не справляется с утечкой во всём помещении; опасно и отравление, и вспышка.', 'Тартым бүкіл бөлмедегі ағуды кетіре алмайды; улану да, тұтану да қауіпті.', 'The hood cannot cope with a leak into the whole room; both poisoning and a flash fire are possible.') },
  ],
};

const sSpill = {
  type: 'order', id: 'spillOrder',
  title: L('Пролив химического вещества', 'Химиялық заттың төгілуі', 'A chemical spill'),
  instr: L('<p>На пол пролилась склянка с растворителем. Расставьте действия по порядку (п. 13.1).</p>', '<p>Еденге еріткіш құтысы төгілді. Әрекеттерді ретімен орналастырыңыз (13.1-тармақ).</p>', '<p>A bottle of solvent has spilled on the floor. Put the actions in order (rule 13.1).</p>'),
  need: L('Расставьте по порядку и проверьте', 'Ретімен орналастырып, тексеріңіз', 'Put them in order and check'),
  scene: () => spillScene({ kind: 'solvent' }),
  items: [
    { id: 'warn', label: L('Предупредить окружающих', 'Айналадағыларға ескерту', 'Warn the people around you') },
    { id: 'air', label: L('Отойти, не вдыхать пары', 'Алыстау, буларды жұтпау', 'Step back and avoid breathing the vapour') },
    { id: 'teacher', label: L('Сообщить преподавателю и выполнять его указания', 'Оқытушыға хабарлап, оның нұсқауларын орындау', 'Tell the instructor and follow their instructions') },
    { id: 'kit', label: L('Локализовать и убрать пролив комплектом для ликвидации проливов', 'Төгілуді жоюға арналған жиынтықпен оқшаулап, жинау', 'Contain and clean up the spill with the spill kit') },
  ],
  hint1: L('Сначала люди, потом вещество.', 'Алдымен адамдар, содан кейін зат.', 'People first, then the substance.'),
};

export default {
  id: '6',
  title: L('Пожар и первая помощь', 'Өрт және алғашқы көмек', 'Fire and first aid'),
  principle: L('Разделы 11–13 и п. 6.3 правил ТБ: тушение очага, горящая одежда, огнетушители, эвакуация, первая помощь, экстренные ситуации.', 'ҚТ ережелерінің 11–13-бөлімдері және 6.3-тармақ: ошақты сөндіру, жанып жатқан киім, өрт сөндіргіштер, эвакуация, алғашқы көмек, төтенше жағдайлар.', 'Safety rules, sections 11–13 and rule 6.3: putting out a fire, burning clothing, extinguishers, evacuation, first aid, emergencies.'),
  equation: [],
  initialState: () => ({}),
  checkpoints: [0, 1, 3, 8],
  steps: [sBeaker, sClothes, sFireQuiz, sEye, sSkin, sBurn, sVapour, sSwallow, sGas, sSpill],
  results: (S, run) => stageResults(run, { eyeMin: S.eye ? S.eye.t / 60 : 0 }),
  summary: (r) => [
    { label: L('Промывание глаза', 'Көзді жуу', 'Eye rinse'), value: L(`${n(r.eyeMin || 0, 1)} мин`, `${n(r.eyeMin || 0, 1)} мин`, `${n(r.eyeMin || 0, 1)} min`), st: r.eyeMin >= 15 ? 'ok' : 'warn' },
    { label: L('Замечаний', 'Ескертулер', 'Remarks'), value: String(r.remarks), st: r.remarks ? 'warn' : 'ok' },
  ],
};
