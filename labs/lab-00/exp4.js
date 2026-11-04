/** Этап 4. Нагрев, перегонка, электричество, стекло — разделы 7–9 правил ТБ (и п. 5.3). */
import { L, n } from '../../app/i18n.js';
import { relax } from '../../app/instruments/thermal.js';
import { ETHANOL_BP, MANTLE_T } from './model.js';
import { refluxScene, bench, beaker, rbFlask, condenser, stand, tube, text } from './scene.js';
import { stageResults } from './common.js';

const sCheck = {
  type: 'checklist', id: 'pre',
  title: L('Перед включением нагрева', 'Қыздыруды қосар алдында', 'Before switching on the heating'),
  instr: L('<p>Нужно прокипятить 30 мл этанола с обратным холодильником в колбонагревателе. Отметьте всё, что надо сделать до включения. Лишнего не нажимайте.</p>', '<p>Колба қыздырғышта кері мұздатқышпен 30 мл этанолды қайнату керек. Қосар алдында не істеу керектің бәрін белгілеңіз. Артығын баспаңыз.</p>', '<p>You need to boil 30 mL of ethanol under reflux in a heating mantle. Tick everything to be done before switching on. Do not tap anything wrong.</p>'),
  need: L('Отметьте все нужные пункты', 'Барлық қажетті тармақтарды белгілеңіз', 'Tick every required item'),
  scene: () => refluxScene({ T: 22, water: false }),
  items: [
    { id: 'cord', label: L('Осмотреть шнур, вилку и нагревательный элемент', 'Сымды, ашаны және қыздыру элементін тексеру', 'Inspect the cord, plug and heating element'), log: L('Шнур, вилка и нагревательный элемент колбонагревателя целы (п. 7.1)', 'Колба қыздырғыштың сымы, ашасы және қыздыру элементі бүтін (7.1-тармақ)', 'Heating-mantle cord, plug and element intact (rule 7.1)') },
    { id: 'dry', label: L('Сухие руки и сухой стол у прибора', 'Құрғақ қол және құрал жанындағы құрғақ үстел', 'Dry hands and a dry bench by the device'), log: L('Руки и стол у электроприбора сухие (п. 8.1)', 'Электр құралы жанындағы қол мен үстел құрғақ (8.1-тармақ)', 'Hands and bench by the electrical device are dry (rule 8.1)') },
    { id: 'clamp', label: L('Закрепить колбу и холодильник на штативе', 'Колба мен мұздатқышты штативке бекіту', 'Clamp the flask and condenser to a stand'), log: L('Колба и холодильник закреплены на штативе (п. 7.3)', 'Колба мен мұздатқыш штативке бекітілді (7.3-тармақ)', 'Flask and condenser clamped to the stand (rule 7.3)') },
    { id: 'joint', label: L('Проверить плотность шлифов', 'Шлифтердің тығыздығын тексеру', 'Check that the ground-glass joints fit tightly'), log: L('Шлифы проверены: посадка плотная (п. 7.3)', 'Шлифтер тексерілді: тығыз отырады (7.3-тармақ)', 'Joints checked: tight fit (rule 7.3)') },
    { id: 'wet', label: L('Включить сразу после мытья посуды, не вытирая рук', 'Ыдыс жуғаннан кейін қолды сүртпей бірден қосу', 'Switch on straight after washing up, without drying your hands'),
      wrong: { severity: 'safety', text: L('попытка включить электроприбор мокрыми руками (п. 8.1)', 'электр құралын дымқыл қолмен қосу әрекеті (8.1-тармақ)', 'tried to switch on an electrical device with wet hands (rule 8.1)'),
        whatif: L('Вода проводит ток: мокрыми руками или на мокром столе можно получить удар током.', 'Су ток өткізеді: дымқыл қолмен немесе дымқыл үстелде ток соғуы мүмкін.', 'Water conducts electricity: with wet hands or on a wet bench you can get an electric shock.') } },
    { id: 'leave', label: L('Включить и сходить за реактивом на склад', 'Қосып, қоймаға реактив алуға бару', 'Switch on and go to the store for a reagent'),
      wrong: { severity: 'safety', text: L('собирался оставить нагревательный прибор без присмотра (п. 7.2)', 'қыздыру құралын қараусыз қалдырмақ болды (7.2-тармақ)', 'was going to leave a heater unattended (rule 7.2)'),
        whatif: L('Колбонагреватели, бани и сушильные шкафы без присмотра оставлять нельзя.', 'Колба қыздырғыштарды, моншаларды және кептіру шкафтарын қараусыз қалдыруға болмайды.', 'Heating mantles, baths and drying ovens must never be left unattended.') } },
  ],
};

const CLOSED = {
  ru: 'При нагревании закрытой системы давление паров растёт: пробку выбивает или колба разрывается, горячий этанол и осколки стекла разлетаются, пары могут вспыхнуть. В реальной лаборатории — немедленно выключить нагрев, отойти, сообщить преподавателю. Установка должна сообщаться с атмосферой — через открытый верхний конец обратного холодильника (п. 7.4).',
  kk: 'Жабық жүйені қыздырғанда бу қысымы өседі: тығынды атып шығарады немесе колба жарылады, ыстық этанол мен шыны сынықтары шашырайды, булар тұтануы мүмкін. Нақты зертханада — қыздыруды бірден өшіріп, алыстап, оқытушыға хабарлау. Қондырғы атмосферамен қатынасуы тиіс — кері мұздатқыштың ашық жоғарғы ұшы арқылы (7.4-тармақ).',
  en: 'Heating a closed system builds up vapour pressure: the stopper blows out or the flask bursts, hot ethanol and glass fly, and the vapour can ignite. In a real lab you switch off the heating at once, step back and tell the instructor. The apparatus must be open to the atmosphere — through the open top of the reflux condenser (rule 7.4).',
};

const sClosed = {
  type: 'decide', id: 'closed',
  title: L('Открытая или закрытая система', 'Ашық немесе жабық жүйе', 'Open or closed system'),
  instr: L('<p>Чтобы спирт «не улетал», сосед советует плотно закрыть верх холодильника пробкой. Как собрать установку?</p>', '<p>Спирт «ұшып кетпеуі» үшін көршіңіз мұздатқыштың жоғарғы жағын тығынмен тығыз жабуға кеңес береді. Қондырғыны қалай жинау керек?</p>', '<p>To stop the ethanol “escaping”, your neighbour suggests stoppering the top of the condenser tightly. How do you set it up?</p>'),
  need: L('Примите решение', 'Шешім қабылдаңыз', 'Make a decision'),
  scene: (S, lc) => refluxScene({ T: 22, closed: lc.chosen !== 'open' && (lc.tried || []).length === 0 ? false : lc.chosen !== 'open', water: true }),
  options: [
    { id: 'open', ok: true, label: L('Верх обратного холодильника оставить открытым — пары конденсируются и стекают обратно', 'Кері мұздатқыштың жоғарғы ұшын ашық қалдыру — булар конденсацияланып, кері ағады', 'Leave the top of the reflux condenser open — the vapour condenses and runs back'),
      why: L('П. 7.4: при нагреве должна быть возможность сброса давления — открытый конец, обратный холодильник.', '7.4-тармақ: қыздыру кезінде қысымды шығаруға мүмкіндік болуы керек — ашық ұш, кері мұздатқыш.', 'Rule 7.4: when heating there must be a way to release pressure — an open end or a reflux condenser.'),
      log: L('Верх обратного холодильника открыт: система сообщается с атмосферой (п. 7.4)', 'Кері мұздатқыштың жоғарғы ұшы ашық: жүйе атмосферамен қатынасады (7.4-тармақ)', 'Top of the reflux condenser open: the system is open to the atmosphere (rule 7.4)') },
    { id: 'stopper', ok: false, label: L('Закрыть холодильник сверху резиновой пробкой', 'Мұздатқышты жоғарыдан резеңке тығынмен жабу', 'Close the condenser at the top with a rubber stopper'),
      remark: L('нагрев закрытой системы (п. 7.4)', 'жабық жүйені қыздыру (7.4-тармақ)', 'heating a closed system (rule 7.4)'), critical: { text: CLOSED } },
    { id: 'nocond', ok: false, severity: 'major', retry: true, label: L('Обойтись без холодильника — кипятить в открытой колбе', 'Мұздатқышсыз — ашық колбада қайнату', 'Do without a condenser — boil in an open flask'),
      remark: L('кипячение ЛВЖ без обратного холодильника', 'тез тұтанатын сұйықты кері мұздатқышсыз қайнату', 'boiling a flammable liquid without a reflux condenser'),
      whatif: L('Этанол быстро выкипит, а его пары заполнят шкаф и стол — пожароопасно, и опыт сорван.', 'Этанол тез қайнап кетеді, ал оның булары шкаф пен үстелді толтырады — өрт қаупі бар, тәжірибе үзіледі.', 'The ethanol boils away fast and its vapour fills the hood and bench — a fire hazard, and the experiment is ruined.') },
  ],
};

const sReflux = {
  type: 'process', id: 'reflux',
  title: L('Кипячение с обратным холодильником', 'Кері мұздатқышпен қайнату', 'Heating under reflux'),
  instr: L(`<ol><li>Добавьте в колбу 2–3 кипелки.</li><li>Подайте воду в холодильник — снизу вверх.</li><li>Включите колбонагреватель и доведите этанол до спокойного кипения (т. кип. ${ETHANOL_BP} °C); поддерживайте кипение 5 минут.</li></ol><p class="note">Кипелки добавляют до нагревания и никогда — в горячую жидкость (п. 5.3; методичка, работа 8). Следите за прибором: по ходу могут случиться события.</p>`,
    `<ol><li>Колбаға 2–3 қайнату тасын салыңыз.</li><li>Мұздатқышқа суды төменнен жоғары қарай беріңіз.</li><li>Колба қыздырғышты қосып, этанолды бір қалыпты қайнауға жеткізіңіз (қайнау t ${ETHANOL_BP} °C); қайнауды 5 минут ұстаңыз.</li></ol><p class="note">Қайнату тастарын қыздырудан бұрын салады және ешқашан ыстық сұйыққа салмайды (5.3-тармақ; әдістеме, 8-жұмыс). Құралды қадағалаңыз: барысында оқиғалар болуы мүмкін.</p>`,
    `<ol><li>Put 2–3 boiling chips into the flask.</li><li>Turn on the condenser water — in at the bottom, out at the top.</li><li>Switch on the heating mantle and bring the ethanol to gentle boiling (b.p. ${ETHANOL_BP} °C); keep it boiling for 5 minutes.</li></ol><p class="note">Boiling chips go in before heating and never into a hot liquid (rule 5.3; manual, lab 8). Watch the apparatus: things may happen along the way.</p>`),
  need: L('5 минут спокойного кипения', '5 минут бір қалыпты қайнау', '5 minutes of gentle boiling'),
  speeds: [10, 20, 40],
  setup(S) { S.H = S.H || { T: 22, El: 22, chips: false, water: false, power: 0, on: 0, reflux: 0, bumps: 0, lost: 0 }; },
  controls: [
    { kind: 'action', id: 'chips', group: L('Колба', 'Колба', 'Flask'), label: L('Добавить 2–3 кипелки', '2–3 қайнату тасын салу', 'Add 2–3 boiling chips'), advance: 20,
      do(S, lc, ctx) {
        if (S.H.T > 60) {
          ctx.remark({ key: 'chipsHot', severity: 'major', text: L('кипелки брошены в горячую жидкость (п. 5.3)', 'қайнату тастары ыстық сұйыққа салынды (5.3-тармақ)', 'boiling chips dropped into a hot liquid (rule 5.3)'),
            whatif: L('Перегретая жидкость мгновенно вскипает на кипелках и выбрасывается из колбы.', 'Қызып кеткен сұйық қайнату тастарында лезде қайнап, колбадан атылып шығады.', 'The superheated liquid boils up instantly on the chips and is thrown out of the flask.') });
          S.H.lost += 0.15; S.H.bumpKey = (S.H.bumpKey || 0) + 1;
          ctx.log(L('Жидкость бурно вскипела и частично выброшена в холодильник', 'Сұйық қатты қайнап, бір бөлігі мұздатқышқа атылды', 'The liquid boiled up violently and some was thrown into the condenser'), 'obs');
        }
        S.H.chips = true;
      }, log: L('В колбу добавлены кипелки', 'Колбаға қайнату тастары салынды', 'Boiling chips added to the flask') },
    { kind: 'toggle', id: 'water', group: L('Холодильник', 'Мұздатқыш', 'Condenser'), label: L('Подать воду (снизу вверх)', 'Суды беру (төменнен жоғары)', 'Water on (in at the bottom)'), labelOn: L('Вода идёт', 'Су ағып жатыр', 'Water running'),
      onChange(S, lc, on) { S.H.water = on; }, log: L('Подана вода в холодильник: вход снизу, выход сверху', 'Мұздатқышқа су берілді: кіру төменнен, шығу жоғарыдан', 'Condenser water on: in at the bottom, out at the top') },
    { kind: 'seg', id: 'power', group: L('Колбонагреватель', 'Колба қыздырғыш', 'Heating mantle'), label: L('Мощность', 'Қуат', 'Power'), options: [[0, L('выкл.', 'сөнд.', 'off')], [1, '1'], [2, '2'], [3, '3']], default: 0,
      onChange(S, lc, v, ctx) { S.H.power = v; if (v && !S.H.on) { S.H.on = ctx.now(); ctx.log(L(`Колбонагреватель включён, ступень ${v}`, `Колба қыздырғыш қосылды, ${v}-саты`, `Heating mantle on, setting ${v}`)); } if (!v) ctx.log(L('Колбонагреватель выключен', 'Колба қыздырғыш сөндірілді', 'Heating mantle off')); } },
  ],
  tick(S, lc, dt) {
    const H = S.H;
    if (H.dead) H.power = 0;
    H.El = relax(H.El, MANTLE_T[H.power || 0], 0.012, dt);
    const boilingAt = ETHANOL_BP;
    H.T = Math.min(H.chips ? boilingAt : boilingAt + 3, relax(H.T, H.El, 0.006, dt));
    H.boil = H.T >= boilingAt - 0.5 && H.El > boilingAt + 5;
    if (H.power) H.heatT = (H.heatT || 0) + dt;
    if (H.boil && !H.water) H.dryT = (H.dryT || 0) + dt;
    if (H.boil && H.water && H.chips && H.El < 150) H.reflux += dt;
    if (H.boil && H.El >= 150) H.hard = (H.hard || 0) + dt;
  },
  readouts: (S) => [
    { label: L('Этанол', 'Этанол', 'Ethanol'), value: n(S.H.T, 1) + ' °C', st: S.H.boil ? 'ok' : '' },
    { label: L('Нагреватель', 'Қыздырғыш', 'Mantle'), value: n(S.H.El, 0) + ' °C', st: S.H.El >= 150 ? 'warn' : '' },
    { label: L('Кипение', 'Қайнау', 'Reflux'), value: L(`${n(S.H.reflux / 60, 1)} / 5 мин`, `${n(S.H.reflux / 60, 1)} / 5 мин`, `${n(S.H.reflux / 60, 1)} / 5 min`), st: S.H.reflux >= 300 ? 'ok' : '' },
  ],
  alerts: (S) => (S.H.boil && S.H.El >= 150 ? { text: L('Кипение слишком бурное: конденсат поднимается высоко по холодильнику. Уменьшите мощность.', 'Қайнау тым қарқынды: конденсат мұздатқыш бойымен жоғары көтеріледі. Қуатты азайтыңыз.', 'Boiling too vigorously: the condensate is rising high up the condenser. Turn the power down.'), kind: 'warn' } : null),
  events: [
    { id: 'smell', when: (S) => (S.H.heatT || 0) > 150 && !S.H.dead,
      title: L('Запах горелой изоляции', 'Күйген оқшаулағыштың иісі', 'Smell of burning insulation'),
      text: L('От шнура колбонагревателя потянуло горелой изоляцией, у вилки — щелчок и искра. Ваши действия?', 'Колба қыздырғыштың сымынан күйген оқшаулағыштың иісі шықты, ашада — шырт етіп, ұшқын шықты. Сіздің әрекетіңіз?', 'There is a smell of burning insulation from the mantle cord and a click and a spark at the plug. What do you do?'),
      options: [
        { ok: true, label: L('Выключить, вынуть вилку из розетки, сообщить преподавателю и больше этим прибором не пользоваться', 'Сөндіріп, ашаны розеткадан суырып, оқытушыға хабарлау және бұл құралды енді қолданбау', 'Switch off, unplug, tell the instructor and stop using the device'),
          effect(S, lc, ctx) { S.H.dead = false; S.H.replaced = true; ctx.log(L('Неисправный колбонагреватель заменён исправным (п. 8.2); нагрев продолжен', 'Ақаулы колба қыздырғыш жарамдысымен ауыстырылды (8.2-тармақ); қыздыру жалғастырылды', 'Faulty mantle replaced with a working one (rule 8.2); heating resumed'), 'obs'); } },
        { ok: false, severity: 'safety', label: L('Продолжить — запах скоро пройдёт', 'Жалғастыру — иіс жақында кетеді', 'Carry on — the smell will go'),
          remark: L('продолжал работать с искрящим прибором (п. 8.2)', 'ұшқын шашқан құралмен жұмысты жалғастырды (8.2-тармақ)', 'kept using a sparking device (rule 8.2)'),
          whatif: L('Повреждённая изоляция — это короткое замыкание, удар током и источник искры рядом с парами спирта.', 'Зақымданған оқшаулағыш — бұл қысқа тұйықталу, ток соғу және спирт буларының жанындағы ұшқын көзі.', 'Damaged insulation means a short circuit, electric shock and a source of sparks next to ethanol vapour.'),
          effect(S, lc, ctx) { S.H.replaced = true; ctx.log(L('Преподаватель остановил работу и заменил прибор', 'Оқытушы жұмысты тоқтатып, құралды ауыстырды', 'The instructor stopped the work and replaced the device'), 'obs'); } },
        { ok: false, severity: 'safety', label: L('Обмотать шнур изолентой и работать дальше', 'Сымды оқшаулағыш таспамен орап, жұмысты жалғастыру', 'Wrap the cord in insulating tape and carry on'),
          remark: L('самостоятельный «ремонт» неисправного прибора под напряжением (пп. 8.2, 8.3)', 'кернеудегі ақаулы құралды өз бетінше «жөндеу» (8.2, 8.3-тармақтар)', 'DIY “repair” of a live faulty device (rules 8.2, 8.3)'),
          whatif: L('Прибор под напряжением трогать нельзя, а изолента не устраняет повреждение внутри шнура. О неисправности сообщают преподавателю.', 'Кернеудегі құралды ұстауға болмайды, ал оқшаулағыш таспа сым ішіндегі зақымды жоймайды. Ақаулық туралы оқытушыға хабарлайды.', 'A live device must not be touched, and tape does not fix the damage inside the cord. Faults are reported to the instructor.'),
          effect(S, lc, ctx) { S.H.replaced = true; ctx.log(L('Преподаватель остановил работу и заменил прибор', 'Оқытушы жұмысты тоқтатып, құралды ауыстырды', 'The instructor stopped the work and replaced the device'), 'obs'); } },
      ] },
    { id: 'bump', when: (S) => !S.H.chips && S.H.T >= ETHANOL_BP + 1.5,
      title: L('Толчок при кипении', 'Қайнау кезіндегі лықсу', 'Bumping'),
      text: L('Жидкость перегрелась без кипелок: резкий толчок, часть этанола выброшена в холодильник, колба вздрогнула в лапке. Ваши действия?', 'Сұйық қайнату тастарынсыз қызып кетті: күрт лықсу, этанолдың бір бөлігі мұздатқышқа атылды, колба қысқышта шайқалды. Сіздің әрекетіңіз?', 'Without boiling chips the liquid superheated: a violent bump, some ethanol was thrown into the condenser and the flask jolted in its clamp. What do you do?'),
      options: [
        { ok: true, label: L('Выключить нагрев, дать остыть ниже кипения, затем добавить кипелки и нагреть снова', 'Қыздыруды өшіріп, қайнау температурасынан төмен суытып, содан кейін қайнату тастарын салып, қайта қыздыру', 'Switch off, let it cool below boiling, then add chips and heat again'),
          effect(S, lc, ctx) { lc.c.power = 0; S.H.power = 0; S.H.T = 55; S.H.El = 60; S.H.chips = true; S.H.lost += 0.05; ctx.remark({ key: 'nochips', severity: 'major', text: L('нагрев начат без кипелок: толчок, потеря части жидкости (п. 5.3)', 'қыздыру қайнату тастарынсыз басталды: лықсу, сұйықтың бір бөлігі жоғалды (5.3-тармақ)', 'heating started without boiling chips: bumping, some liquid lost (rule 5.3)') }); ctx.log(L('Нагрев остановлен, после охлаждения добавлены кипелки', 'Қыздыру тоқтатылды, суығаннан кейін қайнату тастары салынды', 'Heating stopped; chips added after cooling'), 'obs'); } },
        { ok: false, severity: 'major', label: L('Бросить кипелки прямо сейчас', 'Қайнату тастарын дәл қазір салу', 'Drop the chips in right now'),
          remark: L('кипелки брошены в перегретую жидкость (п. 5.3)', 'қайнату тастары қызып кеткен сұйыққа салынды (5.3-тармақ)', 'boiling chips dropped into a superheated liquid (rule 5.3)'),
          whatif: L('Перегретая жидкость вскипает вся сразу и выбрасывается из колбы через холодильник.', 'Қызып кеткен сұйық бірден толық қайнап, мұздатқыш арқылы колбадан атылып шығады.', 'The superheated liquid boils all at once and erupts out of the flask through the condenser.'),
          effect(S) { S.H.chips = true; S.H.lost += 0.25; S.H.T = ETHANOL_BP; } },
        { ok: false, severity: 'major', label: L('Продолжать нагрев — само выровняется', 'Қыздыруды жалғастыру — өзі түзеледі', 'Keep heating — it will settle down'),
          remark: L('кипячение без кипелок с толчками', 'қайнату тастарынсыз лықсумен қайнату', 'boiling with bumping and no chips'),
          whatif: L('Толчки будут повторяться и усиливаться: жидкость теряется, колбу может сорвать с лапки.', 'Лықсулар қайталанып, күшейе береді: сұйық жоғалады, колба қысқыштан ажырап кетуі мүмкін.', 'The bumping repeats and gets worse: liquid is lost and the flask can be jolted out of its clamp.'),
          effect(S) { S.H.chips = true; S.H.lost += 0.2; S.H.T = ETHANOL_BP; } },
      ] },
    { id: 'vapour', when: (S) => (S.H.dryT || 0) > 8,
      title: L('Пары выходят из холодильника', 'Булар мұздатқыштан шығып жатыр', 'Vapour escaping from the condenser'),
      text: L('Этанол кипит, а вода в холодильник не подана: из верхнего конца холодильника идут пары, сильный запах спирта. Ваши действия?', 'Этанол қайнап жатыр, ал мұздатқышқа су берілмеген: мұздатқыштың жоғарғы ұшынан бу шығып, спирттің қатты иісі шығады. Сіздің әрекетіңіз?', 'The ethanol is boiling but the condenser water is off: vapour is pouring out of the top of the condenser with a strong smell of alcohol. What do you do?'),
      options: [
        { ok: true, label: L('Выключить нагрев, подать воду снизу вверх, после этого снова нагреть', 'Қыздыруды өшіріп, суды төменнен жоғары беріп, содан кейін қайта қыздыру', 'Switch off the heating, turn the water on (in at the bottom), then heat again'),
          effect(S, lc, ctx) { lc.c.power = 0; S.H.power = 0; S.H.El = 70; lc.c.water = true; S.H.water = true; S.H.lost += 0.05; ctx.remark({ key: 'nowater', severity: 'major', text: L('нагрев без воды в холодильнике: пары этанола выходили в шкаф', 'мұздатқышта сусыз қыздыру: этанол булары шкафқа шықты', 'heating with no condenser water: ethanol vapour escaped into the hood') }); } },
        { ok: false, severity: 'safety', label: L('Продолжать — пары всё равно уходят в тягу', 'Жалғастыру — булар бәрібір тартпаға кетеді', 'Carry on — the vapour goes up the extraction anyway'),
          remark: L('пары ЛВЖ выходили из установки: нагрев не прекращён', 'тез тұтанатын сұйық булары қондырғыдан шықты: қыздыру тоқтатылмады', 'flammable vapour escaping from the apparatus; heating not stopped'),
          whatif: L('Пары этанола горючи; тяга не успевает их убрать, а этанол выкипает из колбы — опыт сорван.', 'Этанол булары жанғыш; тартым оларды үлгермей кетіреді, ал этанол колбадан қайнап кетеді — тәжірибе үзіледі.', 'Ethanol vapour is flammable; the hood cannot clear it fast enough and the ethanol boils out of the flask — the experiment is ruined.'),
          effect(S, lc) { lc.c.water = true; S.H.water = true; S.H.lost += 0.3; } },
      ] },
  ],
  stop: (S) => S.H.reflux >= 300,
  done(S, lc, ctx) {
    if (S.H.reflux >= 300) {
      ctx.log(L(`Этанол спокойно кипел 5 мин; кольцо конденсата — в нижней трети холодильника; потери ≈ ${n(S.H.lost * 100, 0)} %`, `Этанол 5 мин бір қалыпты қайнады; конденсат сақинасы — мұздатқыштың төменгі үштен бірінде; шығын ≈ ${n(S.H.lost * 100, 0)} %`, `The ethanol refluxed gently for 5 min; the condensate ring was in the lower third of the condenser; losses ≈ ${n(S.H.lost * 100, 0)} %`), 'obs');
      return { text: L('Кипячение закончено. Выключите нагрев (это сделано автоматически) и дайте установке остыть.', 'Қайнату аяқталды. Қыздыруды өшіріңіз (бұл автоматты түрде жасалды) және қондырғыны суытыңыз.', 'Reflux complete. Switch off the heating (done automatically) and let the apparatus cool.') };
    }
    return false;
  },
  onLeave(S) { S.H.power = 0; },
  scene: (S) => refluxScene({ ...S.H, on: S.H.power > 0, vapour: S.H.boil && !S.H.water, bump: S.H.bumping, spark: !S.H.replaced && (S.H.heatT || 0) > 120 }),
  hints: [
    L('Порядок: кипелки → вода в холодильник → нагрев. Мощность — умеренная, чтобы кипение было спокойным.', 'Реті: қайнату тастары → мұздатқышқа су → қыздыру. Қуат — орташа, қайнау бір қалыпты болсын.', 'Order: chips → condenser water → heating. Moderate power so that the boiling is gentle.'),
    L('Ступень 3 даёт слишком бурное кипение; ступень 1 не доводит этанол до кипения. Нужна ступень 2.', '3-саты тым қарқынды қайнау береді; 1-саты этанолды қайнатпайды. 2-саты керек.', 'Setting 3 boils too hard; setting 1 never reaches the boiling point. Use setting 2.'),
    L('«Добавить кипелки» → «Подать воду» → мощность «2», ход времени ×40; при событии — выключить и устранить причину.', '«Қайнату тастарын салу» → «Суды беру» → қуат «2», уақыт ×40; оқиға болса — өшіріп, себебін жою.', '“Add chips” → “Water on” → power “2”, time ×40; if something happens — switch off and fix the cause.'),
  ],
};

const sThermo = {
  type: 'decide', id: 'thermo',
  title: L('Термометр в пробку', 'Термометрді тығынға орнату', 'A thermometer into a stopper'),
  instr: L('<p>Термометр нужно вставить в отверстие резиновой пробки. Как это сделать?</p>', '<p>Термометрді резеңке тығынның тесігіне орнату керек. Мұны қалай істеу керек?</p>', '<p>A thermometer has to be pushed through the hole in a rubber stopper. How do you do it?</p>'),
  need: L('Выберите способ', 'Тәсілді таңдаңыз', 'Choose the method'),
  scene: () => bench(`<rect x="70" y="150" width="200" height="6" rx="3" fill="var(--panel)" stroke="var(--glass)"/><path d="M250 140 L278 140 L274 166 L254 166 Z" class="metd"/>` + text(170, 140, L('термометр', 'термометр', 'thermometer')) + text(264, 186, L('пробка', 'тығын', 'stopper')), L('Стекло и резина', 'Шыны мен резеңке', 'Glass and rubber')),
  options: [
    { id: 'ok', ok: true, label: L('Смочить стекло (смазать), обернуть руки тканью, держать термометр близко к пробке и вводить без усилия', 'Шыныны сулау (майлау), қолды матамен орау, термометрді тығынға жақын ұстап, күш салмай енгізу', 'Wet (lubricate) the glass, protect your hands with a cloth, hold the thermometer close to the stopper and ease it in'),
      why: L('П. 9.2.', '9.2-тармақ.', 'Rule 9.2.'), log: L('Термометр вставлен в пробку: стекло смочено, руки защищены тканью, хват у пробки (п. 9.2)', 'Термометр тығынға орнатылды: шыны суланған, қол матамен қорғалған, тығынға жақын ұсталған (9.2-тармақ)', 'Thermometer fitted into the stopper: glass lubricated, hands protected by a cloth, gripped close to the stopper (rule 9.2)') },
    { id: 'far', ok: false, label: L('Взяться за дальний конец и с силой вдавить сухое стекло', 'Алыстағы ұшынан ұстап, құрғақ шыныны күшпен басу', 'Grip the far end and force the dry glass in'),
      remark: L('термометр вдавливали в пробку с силой, держа за дальний конец (п. 9.2)', 'термометр тығынға алыстағы ұшынан ұстап күшпен басылды (9.2-тармақ)', 'thermometer forced into the stopper holding the far end (rule 9.2)'),
      critical: { text: L('Длинный стеклянный стержень работает как рычаг и ломается у пробки; острый обломок входит в ладонь — глубокий порез. В реальной лаборатории — остановить кровь, аптечка, сообщить преподавателю. Стекло смазывают, руки защищают тканью, держат трубку близко к месту введения.',
        'Ұзын шыны таяқша иінтірек сияқты әрекет етіп, тығын жанында сынады; өткір сынығы алақанға кіреді — терең кесік. Нақты зертханада — қанды тоқтату, алғашқы көмек қобдишасы, оқытушыға хабарлау. Шыныны майлайды, қолды матамен қорғайды, түтікті енгізетін жерге жақын ұстайды.',
        'The long glass stem acts as a lever and snaps at the stopper; the sharp end goes into the palm — a deep cut. In a real lab: stop the bleeding, first-aid kit, tell the instructor. The glass is lubricated, the hands protected with a cloth and the tube held close to the stopper.') } },
    { id: 'bare', ok: false, severity: 'safety', retry: true, label: L('Смочить стекло и вставлять голыми руками', 'Шыныны сулап, жалаң қолмен енгізу', 'Wet the glass and push it in with bare hands'),
      remark: L('руки не защищены тканью при установке стекла в пробку (п. 9.2)', 'шыныны тығынға орнатқанда қол матамен қорғалмаған (9.2-тармақ)', 'hands not protected by a cloth when fitting glass into a stopper (rule 9.2)'),
      whatif: L('Если стекло всё-таки лопнет, ткань не даст осколку порезать ладонь.', 'Шыны бәрібір жарылса, мата сынықтың алақанды кесуіне жол бермейді.', 'If the glass does break, the cloth stops the shard from cutting your palm.') },
  ],
};

const sHot = {
  type: 'decide', id: 'hot',
  title: L('Горячая посуда', 'Ыстық ыдыс', 'Hot glassware'),
  instr: L('<p>Стакан с водой только что сняли с плитки (≈ 90 °C). Его нужно переставить на стол.</p>', '<p>Сулы стақан плитадан жаңа ғана алынды (≈ 90 °C). Оны үстелге қою керек.</p>', '<p>A beaker of water has just come off the hot plate (≈ 90 °C). It has to be moved to the bench.</p>'),
  need: L('Выберите способ', 'Тәсілді таңдаңыз', 'Choose the method'),
  scene: () => bench(beaker({ id: 'l0hot', x: 140, y: 120, w: 70, hh: 76, frac: 0.6 }) + `<rect class="met" x="120" y="190" width="110" height="6" rx="2"/>`, L('≈ 90 °C', '≈ 90 °C', '≈ 90 °C')),
  options: [
    { id: 'tongs', ok: true, label: L('Взять щипцами или в термостойких перчатках и поставить на термостойкую подставку', 'Қысқышпен немесе ыстыққа төзімді қолғаппен алып, ыстыққа төзімді тұғырға қою', 'Use tongs or heat-resistant gloves and put it on a heat-resistant mat'),
      why: L('П. 9.4.', '9.4-тармақ.', 'Rule 9.4.'), log: L('Горячий стакан переставлен щипцами на термостойкую подставку (п. 9.4)', 'Ыстық стақан қысқышпен ыстыққа төзімді тұғырға қойылды (9.4-тармақ)', 'Hot beaker moved with tongs onto a heat-resistant mat (rule 9.4)') },
    { id: 'hand', ok: false, severity: 'safety', retry: true, label: L('Быстро взять рукой', 'Қолмен тез алу', 'Grab it quickly by hand'),
      remark: L('горячая посуда взята голой рукой (п. 9.4)', 'ыстық ыдыс жалаң қолмен алынды (9.4-тармақ)', 'hot glassware picked up bare-handed (rule 9.4)'),
      whatif: L('Ожог пальцев, стакан выскальзывает — горячая вода на руки и колени.', 'Саусақтар күйеді, стақан сусып түседі — ыстық су қол мен тізеге төгіледі.', 'Burnt fingers, the beaker slips — hot water over hands and knees.') },
    { id: 'cold', ok: false, severity: 'major', retry: true, label: L('Сразу опустить в холодную воду, чтобы быстрее остыл', 'Тезірек суысын деп, бірден суық суға салу', 'Plunge it straight into cold water so it cools faster'),
      remark: L('горячее стекло резко охлаждено', 'ыстық шыны күрт суытылды', 'hot glass cooled abruptly'),
      whatif: L('Резкий перепад температуры — и стекло трескается; содержимое теряется.', 'Температураның күрт өзгеруі — шыны шытынайды; ішіндегісі жоғалады.', 'A sudden temperature change cracks the glass; the contents are lost.') },
  ],
};

const sCrack = {
  type: 'decide', id: 'crack',
  title: L('Трещина в колбе', 'Колбадағы сызат', 'A cracked flask'),
  instr: L('<p>На дне круглодонной колбы — маленькая звёздчатая трещина. Колбу нужно нагреть.</p>', '<p>Түбі дөңгелек колбаның түбінде кішкентай жұлдыз тәрізді сызат бар. Колбаны қыздыру керек.</p>', '<p>There is a small star-shaped crack in the bottom of a round-bottomed flask. The flask is to be heated.</p>'),
  need: L('Примите решение', 'Шешім қабылдаңыз', 'Make a decision'),
  scene: () => bench(rbFlask({ id: 'l0ck', cx: 180, cy: 150, r: 40, frac: 0 }) + `<path d="M180 186 l-6 -8 m6 8 l7 -6 m-7 6 l1 -11 m-1 11 l-9 2" stroke="var(--bad)" stroke-width="1.4" fill="none"/>`, L('Звёздчатая трещина', 'Жұлдыз тәрізді сызат', 'A star crack')),
  options: [
    { id: 'replace', ok: true, label: L('Не использовать: в ёмкость для боя стекла, взять целую колбу', 'Қолданбау: сынған шыны ыдысына салып, бүтін колба алу', 'Do not use it: into the broken-glass bin, take an intact flask'), why: L('Пп. 9.1, 9.3.', '9.1, 9.3-тармақтар.', 'Rules 9.1, 9.3.'), log: L('Колба с трещиной отбракована (в ёмкость для боя стекла), взята целая (п. 9.1)', 'Сызаты бар колба жарамсыз деп танылды (сынған шыны ыдысына), бүтіні алынды (9.1-тармақ)', 'Cracked flask rejected (into the broken-glass bin), an intact one taken (rule 9.1)') },
    { id: 'use', ok: false, severity: 'safety', retry: true, label: L('Трещина крошечная — использовать', 'Сызат кішкентай — қолдану', 'The crack is tiny — use it'),
      remark: L('собирался нагревать колбу с трещиной (п. 9.1)', 'сызаты бар колбаны қыздырмақ болды (9.1-тармақ)', 'was going to heat a cracked flask (rule 9.1)'),
      whatif: L('При нагреве трещина растёт, и колба лопается — горячее содержимое на нагревателе и на столе.', 'Қыздырғанда сызат үлкейіп, колба жарылады — ыстық ішіндегісі қыздырғыш пен үстелге төгіледі.', 'On heating the crack grows and the flask bursts — hot contents over the heater and bench.') },
    { id: 'tape', ok: false, severity: 'safety', retry: true, label: L('Заклеить скотчем снаружи', 'Сыртынан скотчпен жабыстыру', 'Tape it up from outside'),
      remark: L('повреждённая посуда «отремонтирована» и пущена в работу (п. 9.1)', 'зақымданған ыдыс «жөнделіп», жұмысқа жіберілді (9.1-тармақ)', 'damaged glassware “repaired” and used (rule 9.1)'),
      whatif: L('Скотч не держит стекло при нагреве и сам плавится; повреждённую посуду использовать запрещено.', 'Скотч қыздырғанда шыныны ұстап тұрмайды және өзі балқиды; зақымданған ыдысты қолдануға тыйым салынған.', 'Tape does not hold glass when heated and melts itself; damaged glassware must not be used.') },
  ],
};

const sBroken = {
  type: 'decide', id: 'broken',
  title: L('Разбился стакан', 'Стақан сынды', 'A beaker has broken'),
  instr: L('<p>На пол упал и разбился пустой чистый стакан. Как убрать осколки?</p>', '<p>Еденге бос таза стақан түсіп сынды. Сынықтарды қалай жинау керек?</p>', '<p>An empty, clean beaker has fallen and smashed on the floor. How do you clear up the pieces?</p>'),
  need: L('Выберите способ', 'Тәсілді таңдаңыз', 'Choose the method'),
  scene: () => bench([[120, 214], [146, 220], [172, 212], [200, 222], [228, 214], [160, 226]].map(([x, y], i) => `<path class="gl" d="M${x} ${y} l${8 + i} -6 l4 ${8 - i} z"/>`).join(''), L('Осколки на полу', 'Еденде сынықтар', 'Shards on the floor')),
  options: [
    { id: 'bin', ok: true, label: L('Смести щёткой на совок и выбросить в ёмкость для боя стекла', 'Щеткамен қалақшаға сыпырып, сынған шыны ыдысына тастау', 'Sweep onto a dustpan with a brush and put into the broken-glass container'), why: L('П. 9.3.', '9.3-тармақ.', 'Rule 9.3.'), log: L('Осколки собраны щёткой и совком в ёмкость для боя стекла (п. 9.3)', 'Сынықтар щетка мен қалақшамен сынған шыны ыдысына жиналды (9.3-тармақ)', 'Shards collected with a brush and dustpan into the broken-glass container (rule 9.3)') },
    { id: 'trash', ok: false, severity: 'safety', retry: true, label: L('Собрать в обычную урну', 'Кәдімгі қоқыс жәшігіне жинау', 'Into the ordinary rubbish bin'),
      remark: L('бой стекла выброшен в обычный мусор (п. 9.3)', 'сынған шыны кәдімгі қоқысқа тасталды (9.3-тармақ)', 'broken glass thrown into general rubbish (rule 9.3)'),
      whatif: L('Осколки прорезают пакет — порез получит уборщик.', 'Сынықтар пакетті тесіп өтеді — тазалаушы қолын кесіп алады.', 'The shards cut through the bag — the cleaner gets cut.') },
    { id: 'hands', ok: false, severity: 'safety', retry: true, label: L('Быстро собрать руками', 'Қолмен тез жинау', 'Pick them up quickly by hand'),
      remark: L('осколки собирали руками', 'сынықтар қолмен жиналды', 'shards picked up by hand'),
      whatif: L('Мелкие осколки режут пальцы даже в перчатках.', 'Ұсақ сынықтар қолғаппен де саусақты кеседі.', 'Small shards cut fingers even through gloves.') },
  ],
};

const sQuiz = {
  type: 'quiz', id: 'q4',
  title: L('Электричество и открытое пламя', 'Электр және ашық жалын', 'Electricity and open flames'),
  instr: L('<p>Разделы 7–8 правил ТБ. Ответьте на вопросы.</p>', '<p>ҚТ ережелерінің 7–8-бөлімдері. Сұрақтарға жауап беріңіз.</p>', '<p>Sections 7–8 of the safety rules. Answer the questions.</p>'),
  need: L('Ответьте на все вопросы', 'Барлық сұраққа жауап беріңіз', 'Answer every question'),
  scene: () => refluxScene({ T: 22, water: false, chips: true }),
  questions: [
    { q: L('Нужно протереть магнитную мешалку от пролитого раствора. Что сначала?', 'Магнитті араластырғышты төгілген ерітіндіден сүрту керек. Алдымен не істеу керек?', 'You need to wipe spilled solution off a magnetic stirrer. What comes first?'),
      options: [L('Отключить прибор от сети', 'Құралды желіден ажырату', 'Unplug it from the mains'), L('Смочить тряпку побольше', 'Шүберекті көбірек сулау', 'Wet the cloth well'), L('Выключить только нагрев, мешалку оставить', 'Тек қыздыруды өшіріп, араластырғышты қалдыру', 'Switch off only the heater, leave the stirrer on')], correct: 0,
      why: L('П. 8.3: перед настройкой или чисткой оборудование отключают от сети.', '8.3-тармақ: баптау немесе тазалау алдында жабдықты желіден ажыратады.', 'Rule 8.3: equipment is unplugged before adjusting or cleaning.') },
    { q: L('Когда можно пользоваться спиртовкой?', 'Спирт шамын қашан қолдануға болады?', 'When may a spirit lamp be used?'),
      options: [L('Только для операций, прямо разрешённых преподавателем, и когда рядом нет паров ЛВЖ', 'Тек оқытушы тікелей рұқсат еткен операциялар үшін және жанында тез тұтанатын сұйық булары жоқ кезде', 'Only for operations the instructor expressly allows, and with no flammable vapour nearby'), L('Всегда, если работа идёт в вытяжном шкафу', 'Жұмыс тартпа шкафта жүрсе, әрдайым', 'Any time the work is in a fume hood'), L('Для нагрева эфира — он быстро закипает', 'Эфирді қыздыру үшін — ол тез қайнайды', 'For heating ether — it boils quickly')], correct: 0,
      why: L('П. 7.5.', '7.5-тармақ.', 'Rule 7.5.') },
  ],
};

export default {
  id: '4',
  title: L('Нагрев, электричество, стекло', 'Қыздыру, электр, шыны', 'Heating, electricity, glassware'),
  principle: L('Разделы 7–9 и п. 5.3 правил ТБ: проверка прибора, открытая система, кипелки, шлифы, термометр в пробку, горячая и повреждённая посуда, бой стекла.', 'ҚТ ережелерінің 7–9-бөлімдері және 5.3-тармақ: құралды тексеру, ашық жүйе, қайнату тастары, шлифтер, термометрді тығынға орнату, ыстық және зақымданған ыдыс, сынған шыны.', 'Safety rules, sections 7–9 and rule 5.3: checking the device, an open system, boiling chips, joints, thermometer into a stopper, hot and damaged glassware, broken glass.'),
  equation: [],
  initialState: () => ({}),
  checkpoints: [0, 1, 2, 3],
  steps: [sCheck, sClosed, sReflux, sThermo, sHot, sCrack, sBroken, sQuiz],
  results: (S, run) => stageResults(run, { lost: S.H ? S.H.lost : 0, chipsFirst: !run.remarks.some((r) => r.key === 'nochips' || r.key === 'chipsHot' || r.key === 'ev-bump') }),
  summary: (r) => [
    { label: L('Потери этанола', 'Этанол шығыны', 'Ethanol lost'), value: `${n((r.lost || 0) * 100, 0)} %`, st: r.lost > 0.02 ? 'warn' : 'ok' },
    { label: L('Замечаний', 'Ескертулер', 'Remarks'), value: String(r.remarks), st: r.remarks ? 'warn' : 'ok' },
  ],
};
