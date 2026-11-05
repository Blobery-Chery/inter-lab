/** Этап 7. Лабораторное оборудование: каталог приборов работ 6–15 и типовые установки. */
import { L, n } from '../../app/i18n.js';
import { relax } from '../../app/instruments/thermal.js';
import { ETHANOL_BP, MANTLE_T } from './model.js';
import { refluxScene, refluxAssembly, distillAssembly, distillScene, funnelScene, vacuumScene, iconScene } from './scene.js';
import { stageResults } from './common.js';

/** Каталог: по одному предмету на рисунок (одинаковые значки не путаем). */
export const CATALOG = ['conical-50', 'rbf-50', 'reflux-condenser', 'air-condenser', 'distill-flask', 'receiver', 'thermometer-100', 'dropping-pipette', 'graduated-pipette', 'cylinder-10', 'vol-flask', 'beaker-100', 'test-tube', 'tube-rack', 'glass-rod', 'buchner', 'filter-flask', 'water-pump', 'funnel', 'filter-paper', 'sep-funnel', 'watch-glass', 'weighing-boat', 'spatula', 'capillary', 'mp-apparatus', 'balance', 'polarimeter', 'polarimeter-tube', 'refractometer', 'ice-salt-bath', 'water-bath', 'sand-bath', 'heating-mantle', 'hot-plate', 'boiling-chips', 'steam-distill', 'molecular-models', 'stopwatch', 'indicator-paper', 'stand', 'fume-hood', 'dessicator'];

const sCatalog = {
  type: 'lab00-catalog', id: 'catalog',
  title: L('Узнайте прибор', 'Құралды таныңыз', 'Identify the item'),
  instr: L('<p>Посуда и приборы работ 6–15. В каждом раунде либо узнайте предмет по рисунку, либо найдите предмет по назначению. Ошибка в раунде — небольшое замечание.</p>', '<p>6–15-жұмыстардың ыдыстары мен құралдары. Әр раундта не затты суреті бойынша таныңыз, не затты мақсаты бойынша табыңыз. Раундтағы қате — шағын ескерту.</p>', '<p>Glassware and instruments from labs 6–15. In each round either identify the item from its picture or find the item for a given purpose. A mistake in a round is a small remark.</p>'),
  need: L('Пройдите 12 раундов', '12 раундтан өтіңіз', 'Complete 12 rounds'),
  pool: CATALOG, rounds: 12, useRounds: 4, points: 0.25,
};

/* ------------------------------------------------------------ обратный холодильник */
const P = (id, ru, kk, en, short) => ({ id, label: L(ru, kk, en), ...(short ? { short: L(...short) } : {}) });
const sReflux = {
  type: 'assemble', id: 'asmReflux', saveAs: 'asmR',
  title: L('Сборка: кипячение с обратным холодильником', 'Жинау: кері мұздатқышпен қайнату', 'Assembly: heating under reflux'),
  instr: L('<p>Соберите установку для кипячения 30 мл этанола с обратным холодильником: выберите деталь, затем место. Неверная сборка разрешена — последствия проявятся при пробном пуске.</p>', '<p>30 мл этанолды кері мұздатқышпен қайнатуға арналған қондырғыны жинаңыз: бөлшекті, содан кейін орынды таңдаңыз. Қате жинауға рұқсат — салдары сынақ іске қосуда білінеді.</p>', '<p>Assemble the apparatus for heating 30 mL of ethanol under reflux: choose a part, then a position. Wrong assembly is allowed — the consequences will show in the trial run.</p>'),
  need: L('Заполните все места и нажмите «Установка собрана»', 'Барлық орынды толтырып, «Қондырғы жиналды» батырмасын басыңыз', 'Fill every position and press “Set-up assembled”'),
  parts: [
    P('mantle', 'Колбонагреватель', 'Колба қыздырғыш', 'Heating mantle'), P('lamp', 'Спиртовка', 'Спирт шамы', 'Spirit lamp'),
    P('rbf', 'Круглодонная колба 50 мл', 'Түбі дөңгелек колба 50 мл', '50 mL round-bottomed flask'), P('conical', 'Коническая колба 50 мл', 'Конустық колба 50 мл', '50 mL conical flask'),
    P('chips', '2–3 кипелки', '2–3 қайнату тасы', '2–3 boiling chips'), P('nochips', 'Без кипелок', 'Қайнату тастарынсыз', 'No boiling chips'),
    P('reflux', 'Обратный холодильник', 'Кері мұздатқыш', 'Reflux condenser'), P('air', 'Воздушный холодильник', 'Ауа мұздатқышы', 'Air condenser'),
    P('low', 'Нижний штуцер', 'Төменгі штуцер', 'Lower nozzle'), P('high', 'Верхний штуцер', 'Жоғарғы штуцер', 'Upper nozzle'),
    P('open', 'Открыт', 'Ашық', 'Open'), P('stopper', 'Резиновая пробка', 'Резеңке тығын', 'Rubber stopper'),
  ],
  slots: [
    { id: 'top', label: L('Верх холодильника', 'Мұздатқыштың жоғарғы ұшы', 'Top of condenser'), accepts: 'open', options: ['open', 'stopper'], x: 180, y: 20 },
    { id: 'out', label: L('Вода — выход', 'Су — шығу', 'Water — out'), accepts: 'high', options: ['high', 'low'], x: 296, y: 50 },
    { id: 'cond', label: L('Холодильник', 'Мұздатқыш', 'Condenser'), accepts: 'reflux', options: ['reflux', 'air'], x: 180, y: 88 },
    { id: 'in', label: L('Вода — вход', 'Су — кіру', 'Water — in'), accepts: 'low', options: ['low', 'high'], x: 296, y: 126 },
    { id: 'chips', label: L('Кипелки', 'Қайнату тастары', 'Boiling chips'), accepts: 'chips', options: ['chips', 'nochips'], x: 62, y: 172 },
    { id: 'flask', label: L('Колба', 'Колба', 'Flask'), accepts: 'rbf', options: ['rbf', 'conical'], x: 180, y: 172 },
    { id: 'heat', label: L('Нагрев', 'Қыздыру', 'Heating'), accepts: 'mantle', options: ['mantle', 'lamp'], x: 180, y: 222 },
  ],
  base: (S, lc) => refluxAssembly((lc && lc.place) || {}),
  hint1: L('Вода в холодильник — снизу вверх; верх открыт (п. 7.4); ЛВЖ — без открытого пламени (п. 5.2); кипелки — до нагрева (п. 5.3).', 'Мұздатқышқа су — төменнен жоғары; жоғарғы ұшы ашық (7.4-тармақ); тез тұтанатын сұйық — ашық жалынсыз (5.2-тармақ); қайнату тастары — қыздыруға дейін (5.3-тармақ).', 'Condenser water in at the bottom, out at the top; top open (rule 7.4); no open flame for flammable liquids (rule 5.2); chips before heating (rule 5.3).'),
  onDone(S, pl) {
    S.tr = { burner: pl.heat === 'lamp', thin: pl.flask === 'conical', noChips: pl.chips === 'nochips', air: pl.cond === 'air', waterTop: pl.in === 'high' || pl.out === 'low', closed: pl.top === 'stopper', T: 22, El: 22, water: false, power: 0, reflux: 0, lost: 0 };
  },
};

const BURNER = {
  ru: 'Под колбой с этанолом зажжена спиртовка: пары спирта у горла колбы и вокруг холодильника вспыхивают, огонь перекидывается на колбу и стол. В реальной лаборатории — накрыть очаг, убрать горючее, сообщить преподавателю. ЛВЖ нагревают только на бане или в колбонагревателе (п. 5.2).',
  kk: 'Этанолы бар колбаның астында спирт шамы жағылған: колба мойны мен мұздатқыш айналасындағы спирт булары тұтанып, от колба мен үстелге ауысады. Нақты зертханада — ошақты жабу, жанғыш заттарды алып тастау, оқытушыға хабарлау. Тез тұтанатын сұйықтарды тек моншада немесе колба қыздырғышта қыздырады (5.2-тармақ).',
  en: 'A spirit lamp is lit under a flask of ethanol: the alcohol vapour at the neck and around the condenser ignites and the fire spreads to the flask and bench. In a real lab: smother it, remove anything flammable, tell the instructor. Flammable liquids are heated only on a bath or in a heating mantle (rule 5.2).',
};
const CLOSED = {
  ru: 'Верх холодильника закрыт пробкой — система замкнута. Давление паров этанола растёт, пробку выбивает, горячая жидкость и пары выбрасываются из установки; колба может лопнуть. В реальной лаборатории — выключить нагрев, отойти, сообщить преподавателю. Обратный холодильник сверху всегда открыт (п. 7.4).',
  kk: 'Мұздатқыштың жоғарғы ұшы тығынмен жабылған — жүйе тұйықталған. Этанол буының қысымы өсіп, тығынды атып шығарады, ыстық сұйық пен булар қондырғыдан атылады; колба жарылуы мүмкін. Нақты зертханада — қыздыруды өшіріп, алыстап, оқытушыға хабарлау. Кері мұздатқыштың жоғарғы ұшы әрқашан ашық (7.4-тармақ).',
  en: 'The top of the condenser is stoppered — the system is closed. Ethanol vapour pressure builds up, the stopper blows out and hot liquid and vapour are thrown out of the apparatus; the flask may burst. In a real lab: switch off, step back, tell the instructor. A reflux condenser is always open at the top (rule 7.4).',
};

const sTrial = {
  type: 'process', id: 'trial',
  title: L('Пробный пуск установки', 'Қондырғыны сынап іске қосу', 'Trial run of the apparatus'),
  instr: L(`<p>Подайте воду в холодильник, включите нагрев и доведите этанол до спокойного кипения (т. кип. ${ETHANOL_BP} °C). Поддерживайте кипение 3 минуты. Если установка собрана неверно — это проявится сейчас.</p>`, `<p>Мұздатқышқа суды беріп, қыздыруды қосып, этанолды бір қалыпты қайнауға жеткізіңіз (қайнау t ${ETHANOL_BP} °C). Қайнауды 3 минут ұстаңыз. Қондырғы қате жиналса — бұл қазір білінеді.</p>`, `<p>Turn on the condenser water, switch on the heating and bring the ethanol to gentle boiling (b.p. ${ETHANOL_BP} °C). Keep it boiling for 3 minutes. If the apparatus was assembled wrongly, it will show now.</p>`),
  need: L('3 минуты спокойного кипения', '3 минут бір қалыпты қайнау', '3 minutes of gentle boiling'),
  speeds: [10, 20, 40],
  setup(S) { S.tr = S.tr || { T: 22, El: 22, water: false, power: 0, reflux: 0, lost: 0 }; },
  controls: [
    { kind: 'toggle', id: 'water', group: L('Холодильник', 'Мұздатқыш', 'Condenser'), label: L('Подать воду', 'Суды беру', 'Water on'), labelOn: L('Вода идёт', 'Су ағып жатыр', 'Water running'), onChange(S, lc, on) { S.tr.water = on; }, log: L('Подана вода в холодильник', 'Мұздатқышқа су берілді', 'Condenser water on') },
    { kind: 'seg', id: 'power', group: L('Нагрев', 'Қыздыру', 'Heating'), label: L('Мощность', 'Қуат', 'Power'), options: [[0, L('выкл.', 'сөнд.', 'off')], [1, '1'], [2, '2'], [3, '3']], default: 0,
      onChange(S, lc, v, ctx) {
        S.tr.power = v;
        if (v && S.tr.burner) ctx.remark({ key: 'asm-burner', severity: 'critical', text: L('ЛВЖ нагревали на открытом пламени спиртовки (п. 5.2)', 'тез тұтанатын сұйық спирт шамының ашық жалынында қыздырылды (5.2-тармақ)', 'flammable liquid heated over a spirit lamp flame (rule 5.2)'), critical: { text: BURNER } });
      } },
  ],
  tick(S, lc, dt, ctx) {
    const H = S.tr;
    if (H.burner) return;
    H.El = relax(H.El, MANTLE_T[H.power || 0], 0.012, dt);
    H.T = Math.min(H.noChips ? ETHANOL_BP + 3 : ETHANOL_BP, relax(H.T, H.El, H.thin ? 0.004 : 0.006, dt));
    H.boil = H.T >= ETHANOL_BP - 0.5 && H.El > ETHANOL_BP + 5;
    if (H.boil && H.closed) {
      H.pT = (H.pT || 0) + dt;
      if (H.pT > 12) ctx.remark({ key: 'asm-closed', severity: 'critical', text: L('нагрев закрытой системы: верх холодильника закрыт пробкой (п. 7.4)', 'жабық жүйені қыздыру: мұздатқыштың жоғарғы ұшы тығынмен жабылған (7.4-тармақ)', 'heating a closed system: condenser stoppered at the top (rule 7.4)'), critical: { text: CLOSED } });
    }
    if (H.boil && H.water && !H.waterTop && !H.air && !H.noChips && H.El < 150) H.reflux += dt;
  },
  readouts: (S) => [
    { label: L('Этанол', 'Этанол', 'Ethanol'), value: n(S.tr.T, 1) + ' °C', st: S.tr.boil ? 'ok' : '' },
    { label: L('Кипение', 'Қайнау', 'Reflux'), value: L(`${n(S.tr.reflux / 60, 1)} / 3 мин`, `${n(S.tr.reflux / 60, 1)} / 3 мин`, `${n(S.tr.reflux / 60, 1)} / 3 min`), st: S.tr.reflux >= 180 ? 'ok' : '' },
  ],
  alerts: (S) => (S.tr.boil && !S.tr.water ? { text: L('Кипит, а вода в холодильник не подана!', 'Қайнап жатыр, ал мұздатқышқа су берілмеген!', 'It is boiling and the condenser water is off!'), kind: 'bad' } : S.tr.El >= 150 && S.tr.boil ? { text: L('Слишком бурное кипение — уменьшите мощность.', 'Тым қарқынды қайнау — қуатты азайтыңыз.', 'Boiling too hard — turn the power down.'), kind: 'warn' } : null),
  events: [
    { id: 'thin', when: (S) => S.tr.thin && S.tr.power > 0 && (S.tr.El || 0) > 60,
      title: L('Колба не прилегает', 'Колба жанаспайды', 'The flask does not fit'),
      text: L('Коническая колба плоским дном стоит на краю полусферического гнезда колбонагревателя: греется только участок дна, стекло перегревается неравномерно. Что делать?', 'Конустық колба жалпақ түбімен колба қыздырғыштың жарты сфералы ұясының шетінде тұр: түбінің бір бөлігі ғана қызады, шыны біркелкі қызбайды. Не істеу керек?', 'The flat-bottomed conical flask sits on the rim of the hemispherical mantle: only part of the base is heated and the glass heats unevenly. What do you do?'),
      options: [
        { ok: true, label: L('Выключить, дать остыть и переставить смесь в круглодонную колбу', 'Өшіріп, суытып, қоспаны түбі дөңгелек колбаға ауыстыру', 'Switch off, let it cool and transfer to a round-bottomed flask'),
          effect(S, lc, ctx) { lc.c.power = 0; S.tr.power = 0; S.tr.thin = false; S.tr.T = 30; S.tr.El = 40; ctx.remark({ key: 'asm-flask', severity: 'major', text: L('для колбонагревателя выбрана коническая колба вместо круглодонной', 'колба қыздырғышқа түбі дөңгелек колбаның орнына конустық колба таңдалды', 'a conical flask was chosen for the heating mantle instead of a round-bottomed one') }); } },
        { ok: false, severity: 'major', label: L('Греть дальше на полной мощности', 'Толық қуатпен қыздыра беру', 'Keep heating on full power'), remark: L('неравномерный нагрев конической колбы в колбонагревателе', 'конустық колбаны колба қыздырғышта біркелкі емес қыздыру', 'uneven heating of a conical flask in a heating mantle'),
          whatif: L('Местный перегрев стекла — трещина в дне, этанол выливается на горячий нагреватель.', 'Шынының жергілікті қызып кетуі — түбінде сызат, этанол ыстық қыздырғышқа төгіледі.', 'Local overheating cracks the base and the ethanol pours onto the hot mantle.'), effect(S) { S.tr.thin = false; S.tr.lost += 0.2; } },
      ] },
    { id: 'bump', when: (S) => S.tr.noChips && S.tr.T >= ETHANOL_BP + 1.5,
      title: L('Толчок', 'Лықсу', 'Bumping'),
      text: L('Кипелок в колбе нет: жидкость перегрелась и вскипела толчком, часть выброшена в холодильник. Что делать?', 'Колбада қайнату тастары жоқ: сұйық қызып кетіп, лықсып қайнады, бір бөлігі мұздатқышқа атылды. Не істеу керек?', 'There are no boiling chips: the liquid superheated and bumped, throwing some into the condenser. What do you do?'),
      options: [
        { ok: true, label: L('Выключить, охладить ниже кипения, добавить кипелки, нагреть снова', 'Өшіріп, қайнау температурасынан төмен суытып, қайнату тастарын салып, қайта қыздыру', 'Switch off, cool below boiling, add chips, heat again'),
          effect(S, lc, ctx) { lc.c.power = 0; S.tr.power = 0; S.tr.noChips = false; S.tr.T = 55; S.tr.El = 60; S.tr.lost += 0.05; ctx.remark({ key: 'asm-chips', severity: 'major', text: L('установка собрана без кипелок (п. 5.3)', 'қондырғы қайнату тастарынсыз жиналды (5.3-тармақ)', 'apparatus assembled without boiling chips (rule 5.3)') }); } },
        { ok: false, severity: 'major', label: L('Бросить кипелки в кипящую жидкость', 'Қайнату тастарын қайнап жатқан сұйыққа салу', 'Drop chips into the boiling liquid'), remark: L('кипелки в горячую жидкость (п. 5.3)', 'қайнату тастары ыстық сұйыққа (5.3-тармақ)', 'chips into a hot liquid (rule 5.3)'),
          whatif: L('Жидкость вскипает вся сразу и выбрасывается через холодильник.', 'Сұйық бірден толық қайнап, мұздатқыш арқылы атылады.', 'The liquid boils all at once and erupts through the condenser.'), effect(S) { S.tr.noChips = false; S.tr.lost += 0.25; S.tr.T = ETHANOL_BP; } },
      ] },
    { id: 'jacket', when: (S) => S.tr.waterTop && S.tr.water && S.tr.boil,
      title: L('Холодильник не работает', 'Мұздатқыш жұмыс істемейді', 'The condenser is not working'),
      text: L('Вода подаётся сверху и сразу уходит через нижний штуцер: рубашка холодильника заполнена лишь наполовину, пары проходят выше и выходят наружу. Что делать?', 'Су жоғарыдан беріліп, бірден төменгі штуцер арқылы кетеді: мұздатқыш қабы жартылай ғана толған, булар жоғары өтіп, сыртқа шығады. Не істеу керек?', 'The water goes in at the top and straight out of the lower nozzle: the condenser jacket is only half full and vapour gets past and out. What do you do?'),
      options: [
        { ok: true, label: L('Выключить нагрев и переподключить шланги: вход снизу, выход сверху', 'Қыздыруды өшіріп, шлангтарды қайта жалғау: кіру төменнен, шығу жоғарыдан', 'Switch off and reconnect the hoses: in at the bottom, out at the top'),
          effect(S, lc, ctx) { lc.c.power = 0; S.tr.power = 0; S.tr.waterTop = false; S.tr.El = 70; S.tr.lost += 0.05; ctx.remark({ key: 'asm-water', severity: 'major', text: L('вода в холодильник подана сверху: рубашка не заполнялась', 'мұздатқышқа су жоғарыдан берілді: қабы толмады', 'condenser water fed in at the top: the jacket did not fill') }); } },
        { ok: false, severity: 'major', label: L('Открыть воду сильнее', 'Суды күштірек ашу', 'Turn the water up'), remark: L('неверно подключённый холодильник не исправлен', 'қате жалғанған мұздатқыш түзетілмеді', 'wrongly connected condenser not corrected'),
          whatif: L('Напор не помогает: вода всё равно стекает вниз, не заполняя рубашку; этанол теряется с парами.', 'Қысым көмектеспейді: су бәрібір қабын толтырмай төмен ағады; этанол бумен жоғалады.', 'More flow does not help: the water still drains without filling the jacket and ethanol is lost as vapour.'), effect(S) { S.tr.waterTop = false; S.tr.lost += 0.3; } },
      ] },
    { id: 'air', when: (S) => S.tr.air && S.tr.boil,
      title: L('Пары не конденсируются', 'Булар конденсацияланбайды', 'The vapour is not condensing'),
      text: L('Воздушный холодильник не успевает охлаждать пары этанола: из верхнего конца идёт пар. Что делать?', 'Ауа мұздатқышы этанол буларын суытып үлгермейді: жоғарғы ұшынан бу шығып жатыр. Не істеу керек?', 'The air condenser cannot cool the ethanol vapour fast enough: vapour is coming out of the top. What do you do?'),
      options: [
        { ok: true, label: L('Выключить, заменить на водяной обратный холодильник', 'Өшіріп, сулы кері мұздатқышпен ауыстыру', 'Switch off and replace it with a water-cooled reflux condenser'),
          effect(S, lc, ctx) { lc.c.power = 0; S.tr.power = 0; S.tr.air = false; S.tr.El = 70; S.tr.lost += 0.05; ctx.remark({ key: 'asm-air', severity: 'major', text: L('воздушный холодильник для низкокипящей жидкости (он — для т. кип. выше 150 °C)', 'төмен температурада қайнайтын сұйыққа ауа мұздатқышы (ол — қайнау t 150 °C-тан жоғары үшін)', 'air condenser used for a low-boiling liquid (it is for b.p. above 150 °C)') }); } },
        { ok: false, severity: 'major', label: L('Продолжать', 'Жалғастыру', 'Carry on'), remark: L('пары ЛВЖ выходили из установки', 'тез тұтанатын сұйық булары қондырғыдан шықты', 'flammable vapour escaped from the apparatus'),
          whatif: L('Этанол выкипает, его пары скапливаются в шкафу — пожароопасно.', 'Этанол қайнап кетеді, оның булары шкафта жиналады — өрт қаупі бар.', 'The ethanol boils away and its vapour collects in the hood — a fire hazard.'), effect(S) { S.tr.air = false; S.tr.lost += 0.4; } },
      ] },
  ],
  stop: (S) => S.tr.reflux >= 180,
  done(S, lc, ctx) {
    if (S.tr.reflux < 180) return false;
    ctx.log(L(`Установка работает: этанол спокойно кипит, пары конденсируются в нижней трети холодильника; потери ≈ ${n(S.tr.lost * 100, 0)} %`, `Қондырғы жұмыс істеп тұр: этанол бір қалыпты қайнайды, булар мұздатқыштың төменгі үштен бірінде конденсацияланады; шығын ≈ ${n(S.tr.lost * 100, 0)} %`, `The apparatus works: the ethanol refluxes gently and condenses in the lower third of the condenser; losses ≈ ${n(S.tr.lost * 100, 0)} %`), 'obs');
    return { text: L('Пробный пуск прошёл. Нагрев выключен.', 'Сынақ іске қосу өтті. Қыздыру өшірілді.', 'The trial run is complete. Heating switched off.') };
  },
  onLeave(S) { S.tr.power = 0; },
  scene: (S) => refluxScene({ ...S.tr, on: S.tr.power > 0, waterIn: S.tr.waterTop ? 'top' : 'bottom', chips: !S.tr.noChips, flame: S.tr.burner && S.tr.power > 0, vapour: S.tr.boil && (!S.tr.water || S.tr.waterTop || S.tr.air) }),
  hints: [
    L('Подайте воду, мощность 2 — и следите: неверная сборка даст о себе знать событием.', 'Суды беріп, қуат 2 — және қадағалаңыз: қате жинау оқиғамен білінеді.', 'Turn on the water, power 2 — and watch: a wrong assembly will show up as an event.'),
    L('Если возникло событие — выключите нагрев и исправьте установку, а не продолжайте.', 'Оқиға болса — қыздыруды өшіріп, қондырғыны түзетіңіз, жалғастырмаңыз.', 'If something happens, switch off and fix the apparatus rather than carrying on.'),
    L('«Подать воду» → мощность «2» → ход ×40; при событии — первый вариант «Выключить…».', '«Суды беру» → қуат «2» → уақыт ×40; оқиға болса — «Өшіру…» нұсқасы.', '“Water on” → power “2” → time ×40; on any event choose “Switch off…”.'),
  ],
};

/* ------------------------------------------------------------ простая перегонка */
const sDistill = {
  type: 'assemble', id: 'asmDistill', saveAs: 'asmD',
  title: L('Сборка: простая перегонка', 'Жинау: жай айдау', 'Assembly: simple distillation'),
  instr: L('<p>Соберите установку для простой перегонки этанола (т. кип. 78 °C): колба, термометр, холодильник Либиха, приёмник, нагрев.</p>', '<p>Этанолды жай айдауға арналған қондырғыны жинаңыз (қайнау t 78 °C): колба, термометр, Либих мұздатқышы, қабылдағыш, қыздыру.</p>', '<p>Assemble a simple distillation of ethanol (b.p. 78 °C): flask, thermometer, Liebig condenser, receiver, heating.</p>'),
  need: L('Заполните все места', 'Барлық орынды толтырыңыз', 'Fill every position'),
  parts: [
    P('th-side', 'Шарик термометра — напротив отвода', 'Термометр шарикі — бұрманың тұсында', 'Thermometer bulb level with the side arm', ['Шарик у отвода', 'Шарик бұрма тұсында', 'Bulb at side arm']), P('th-liq', 'Шарик — в жидкости', 'Шарик — сұйықта', 'Bulb in the liquid', ['Шарик в жидкости', 'Шарик сұйықта', 'Bulb in liquid']), P('th-high', 'Шарик — выше отвода', 'Шарик — бұрмадан жоғары', 'Bulb above the side arm', ['Шарик выше отвода', 'Шарик бұрмадан жоғары', 'Bulb above arm']),
    P('dflask', 'Перегонная колба с отводом + кипелка', 'Бұрмасы бар айдау колбасы + қайнату тасы', 'Distillation flask with side arm + a boiling chip', ['Колба с отводом', 'Бұрмасы бар колба', 'Flask with side arm']),
    P('liebig', 'Холодильник Либиха', 'Либих мұздатқышы', 'Liebig condenser'),
    P('w-low', 'Вход воды — нижний конец (у приёмника)', 'Судың кіруі — төменгі ұшы (қабылдағыш жанында)', 'Water in at the lower end (by the receiver)', ['Вода — снизу', 'Су — төменнен', 'Water in low']), P('w-high', 'Вход воды — верхний конец (у колбы)', 'Судың кіруі — жоғарғы ұшы (колба жанында)', 'Water in at the upper end (by the flask)', ['Вода — сверху', 'Су — жоғарыдан', 'Water in high']),
    P('recv-open', 'Приёмник, открытый (сообщается с атмосферой)', 'Қабылдағыш, ашық (атмосферамен қатынасады)', 'Receiver, open to the atmosphere', ['Приёмник открыт', 'Қабылдағыш ашық', 'Receiver open']), P('recv-closed', 'Приёмник, закрытый пробкой наглухо', 'Қабылдағыш, тығынмен тұйық жабылған', 'Receiver, tightly stoppered', ['Приёмник закрыт', 'Қабылдағыш жабық', 'Receiver stoppered']),
    P('mantle', 'Колбонагреватель', 'Колба қыздырғыш', 'Heating mantle'), P('lamp', 'Спиртовка', 'Спирт шамы', 'Spirit lamp'),
  ],
  slots: [
    { id: 'thermo', label: L('Термометр', 'Термометр', 'Thermometer'), accepts: 'th-side', options: ['th-side', 'th-liq', 'th-high'], x: 96, y: 60 },
    { id: 'flask', label: L('Колба', 'Колба', 'Flask'), accepts: 'dflask', options: ['dflask'], x: 96, y: 162 },
    { id: 'heat', label: L('Нагрев', 'Қыздыру', 'Heating'), accepts: 'mantle', options: ['mantle', 'lamp'], x: 96, y: 222 },
    { id: 'cond', label: L('Холодильник', 'Мұздатқыш', 'Condenser'), accepts: 'liebig', options: ['liebig'], x: 220, y: 92 },
    { id: 'water', label: L('Подача воды', 'Су беру', 'Water supply'), accepts: 'w-low', options: ['w-low', 'w-high'], x: 196, y: 194 },
    { id: 'recv', label: L('Приёмник', 'Қабылдағыш', 'Receiver'), accepts: 'recv-open', options: ['recv-open', 'recv-closed'], x: 300, y: 222 },
  ],
  base: (S, lc) => distillAssembly((lc && lc.place) || {}),
  hint1: L('Термометр меряет температуру паров, уходящих в отвод; вода в холодильнике — навстречу парам; система не замкнута; ЛВЖ — без пламени.', 'Термометр бұрмаға кететін булардың температурасын өлшейді; мұздатқыштағы су — буларға қарсы; жүйе тұйық емес; тез тұтанатын сұйық — жалынсыз.', 'The thermometer measures the vapour going into the side arm; the condenser water flows against the vapour; the system is not closed; no flame for flammable liquids.'),
  onDone(S, pl, errors, ctx) {
    S.ds = { th: pl.thermo === 'th-liq' ? 'liq' : pl.thermo === 'th-high' ? 'high' : 'side', waterTop: pl.water === 'w-high', closed: pl.recv === 'recv-closed', burner: pl.heat === 'lamp' };
    if (S.ds.burner) ctx.remark({ key: 'ds-burner', severity: 'critical', text: L('перегонка ЛВЖ на открытом пламени (п. 5.2)', 'тез тұтанатын сұйықты ашық жалында айдау (5.2-тармақ)', 'distilling a flammable liquid over an open flame (rule 5.2)'), critical: { text: BURNER } });
    else if (S.ds.closed) ctx.remark({ key: 'ds-closed', severity: 'critical', text: L('перегонка в замкнутую систему: приёмник закрыт пробкой (п. 7.4)', 'тұйық жүйеге айдау: қабылдағыш тығынмен жабылған (7.4-тармақ)', 'distilling into a closed system: receiver stoppered (rule 7.4)'),
      critical: { text: L('Приёмник закрыт наглухо: пары этанола и воздух вытесняются некуда, давление растёт — пробку выбивает или лопается стекло, горячий спирт и его пары выбрасываются из установки. В реальной лаборатории — выключить нагрев, отойти, сообщить преподавателю. Установка для перегонки всегда сообщается с атмосферой (п. 7.4).',
        'Қабылдағыш тұйық жабылған: этанол булары мен ауаның шығатын жері жоқ, қысым өседі — тығынды атып шығарады немесе шыны жарылады, ыстық спирт пен оның булары қондырғыдан атылады. Нақты зертханада — қыздыруды өшіріп, алыстап, оқытушыға хабарлау. Айдау қондырғысы әрқашан атмосферамен қатынасады (7.4-тармақ).',
        'The receiver is sealed: the ethanol vapour and air have nowhere to go and the pressure rises — the stopper blows out or the glass bursts, throwing out hot alcohol and vapour. In a real lab: switch off, step back, tell the instructor. A distillation apparatus is always open to the atmosphere (rule 7.4).') } });
  },
};

/** Показание термометра при перегонке этанола (т. кип. 78 °C) по положению шарика, °C (допущение, ASSUMPTIONS.md). */
export const DIST_T = { side: ETHANOL_BP, high: 66, liq: 80 };
const dsT = (S) => DIST_T[(S.ds && S.ds.th) || 'side'];
const sDistObs = {
  type: 'observe', id: 'distObs',
  title: L('Перегонка идёт', 'Айдау жүріп жатыр', 'The distillation is running'),
  instr: L('<p>Нагрев включён, в приёмник падают первые капли отгона. Посмотрите на термометр и на холодильник. Что правильно описывает картину?</p>', '<p>Қыздыру қосулы, қабылдағышқа айдалған сұйықтың алғашқы тамшылары түсуде. Термометрге және мұздатқышқа қараңыз. Көріністі қайсысы дұрыс сипаттайды?</p>', '<p>The heating is on and the first drops of distillate are falling into the receiver. Look at the thermometer and the condenser. Which describes the picture correctly?</p>'),
  need: L('Выберите верное описание', 'Дұрыс сипаттаманы таңдаңыз', 'Choose the correct description'),
  scene: (S) => distillScene({ th: S.ds ? S.ds.th : 'side', T: dsT(S), waterTop: S.ds && S.ds.waterTop, drip: 1 }),
  question: L('Термометр показывает…', 'Термометр көрсетеді…', 'The thermometer reads…'),
  options: [
    { id: 'side', label: L('≈ 78 °C — истинная температура паров, отгон идёт при т. кип. этанола', '≈ 78 °C — булардың шын температурасы, айдау этанолдың қайнау t-сында жүреді', '≈ 78 °C — the true vapour temperature; the distillate comes over at the b.p. of ethanol') },
    { id: 'high', label: L('Заметно ниже 78 °C, хотя отгон уже капает: шарик выше отвода и не омывается парами', 'Айдалған сұйық тамып тұрса да, 78 °C-тан айтарлықтай төмен: шарик бұрмадан жоғары және буларға малынбайды', 'Well below 78 °C although distillate is dripping: the bulb is above the side arm and not bathed in vapour') },
    { id: 'liq', label: L('Выше температуры паров: шарик в жидкости показывает температуру кипящей (у нагретых стенок перегретой) жидкости, а не паров', 'Бу температурасынан жоғары: сұйықтағы шарик будың емес, қайнап жатқан (қызған қабырға маңында асқын қызған) сұйықтың температурасын көрсетеді', 'Above the vapour temperature: the bulb in the liquid shows the boiling (superheated near the hot walls) liquid, not the vapour') },
  ],
  correct: (S) => (S.ds ? S.ds.th : 'side'),
  why: (S) => (S.ds && S.ds.th !== 'side' ? L('Из-за положения термометра фракцию соберут не в тех пределах температур — продукт будет загрязнён.', 'Термометрдің орналасуына байланысты фракция басқа температура аралығында жиналады — өнім ластанады.', 'Because of where the thermometer is, the fraction will be collected over the wrong temperature range — the product will be impure.') : L('Шарик напротив отвода омывается парами, уходящими в холодильник.', 'Бұрманың тұсындағы шарик мұздатқышқа кететін буларға малынады.', 'The bulb level with the side arm is bathed in the vapour going into the condenser.')),
  onRight(S, ctx) {
    if (S.ds && S.ds.th !== 'side') ctx.remark({ key: 'ds-th', severity: 'major', text: L('термометр установлен неверно: температура паров измерена неверно, фракция собрана не в тех пределах', 'термометр қате орнатылған: бу температурасы қате өлшенді, фракция басқа аралықта жиналды', 'thermometer wrongly placed: vapour temperature misread, fraction collected over the wrong range') });
    if (S.ds && S.ds.waterTop) { ctx.remark({ key: 'ds-water', severity: 'major', text: L('вода в холодильник Либиха подана по ходу паров: охлаждение слабое, часть отгона теряется', 'Либих мұздатқышына су бу бағытымен берілді: салқындату әлсіз, айдалған сұйықтың бір бөлігі жоғалады', 'Liebig condenser water fed in the same direction as the vapour: poor cooling, some distillate lost') }); ctx.log(L('Вода подана сверху: рубашка холодильника заполнена не полностью, из приёмника тянет запахом спирта', 'Су жоғарыдан берілді: мұздатқыш қабы толық толмаған, қабылдағыштан спирт иісі шығады', 'Water fed from the top: the jacket is not full and there is a smell of alcohol from the receiver'), 'obs'); }
  },
};

/* ------------------------------------------------------------ фильтрование под вакуумом */
const sVacFlask = {
  type: 'decide', id: 'vacFlask',
  title: L('Колба для фильтрования под вакуумом', 'Вакуумда сүзуге арналған колба', 'A flask for vacuum filtration'),
  instr: L('<p>Колба Бунзена занята. Можно ли подключить воронку Бюхнера к обычной конической колбе и включить водоструйный насос?</p>', '<p>Бунзен колбасы бос емес. Бюхнер шұңғымасын кәдімгі конустық колбаға жалғап, су ағынды сорғыны қосуға бола ма?</p>', '<p>The filter flask is in use. May you fit the Büchner funnel to an ordinary conical flask and turn on the water aspirator?</p>'),
  need: L('Примите решение', 'Шешім қабылдаңыз', 'Make a decision'),
  scene: () => vacuumScene({ vf: {} }),
  options: [
    { id: 'wait', ok: true, label: L('Нет: под вакуумом — только толстостенная колба Бунзена; дождаться или взять другую', 'Жоқ: вакуумда — тек қалың қабырғалы Бунзен колбасы; күту немесе басқасын алу', 'No: only a thick-walled filter flask goes under vacuum; wait or get another'),
      why: L('Посуду под вакуумом/давлением используют только предназначенную для этого и целую (пп. 3.2, 9.1).', 'Вакуумда/қысымда тек соған арналған және бүтін ыдыс қолданылады (3.2, 9.1-тармақтар).', 'Only glassware made for vacuum and undamaged may be used under vacuum (rules 3.2, 9.1).'), log: L('Для вакуума взята толстостенная колба Бунзена', 'Вакуумға қалың қабырғалы Бунзен колбасы алынды', 'A thick-walled filter flask taken for the vacuum') },
    { id: 'thin', ok: false, label: L('Да, колба та же, только без отвода — шланг подвести через пробку', 'Иә, колба сол, тек бұрмасы жоқ — шлангты тығын арқылы өткізу', 'Yes, it is the same flask without a side arm — run the hose through the stopper'),
      remark: L('тонкостенная коническая колба под вакуумом', 'вакуумдағы жұқа қабырғалы конустық колба', 'a thin-walled conical flask under vacuum'),
      critical: { text: L('Тонкостенная колба не рассчитана на разрежение: внешнее давление воздуха раздавливает её — колба схлопывается внутрь и разлетается осколками (имплозия). В реальной лаборатории — защитные очки спасают глаза; насос выключают, осколки собирают в ёмкость для боя стекла. Для фильтрования под вакуумом — только толстостенная колба Бунзена.',
        'Жұқа қабырғалы колба сиреуге арналмаған: сыртқы ауа қысымы оны басып жаншиды — колба ішке қарай опырылып, сынықтарға шашырайды (имплозия). Нақты зертханада — көзді қорғаныс көзілдірігі сақтайды; сорғыны өшіріп, сынықтарды сынған шыны ыдысына жинайды. Вакуумда сүзу үшін — тек қалың қабырғалы Бунзен колбасы.',
        'A thin-walled flask is not built for vacuum: the outside air pressure crushes it — it implodes and flies apart in fragments. In a real lab, safety goggles save the eyes; the pump is switched off and the pieces go into the broken-glass bin. Vacuum filtration uses only a thick-walled filter flask.') } },
  ],
};

const sVacOrder = {
  type: 'order', id: 'vacOrder',
  title: L('Фильтрование под вакуумом', 'Вакуумда сүзу', 'Vacuum filtration'),
  instr: L('<p>Расставьте операции по порядку. Особое внимание — к последним двум: при неверном порядке вода из насоса засасывается в колбу с фильтратом.</p>', '<p>Операцияларды ретімен орналастырыңыз. Соңғы екеуіне ерекше назар — рет қате болса, сорғыдағы су фильтраты бар колбаға сорылады.</p>', '<p>Put the operations in order. Pay special attention to the last two: in the wrong order, water from the pump is sucked back into the flask of filtrate.</p>'),
  need: L('Расставьте по порядку и проверьте', 'Ретімен орналастырып, тексеріңіз', 'Put them in order and check'),
  scene: () => vacuumScene({ vf: { vac: true, filtrate: 0.35, cake: 0.6 } }),
  severity: 'major',
  remarkText: L('нарушен порядок фильтрования под вакуумом (риск обратного засасывания воды в фильтрат)', 'вакуумда сүзу реті бұзылды (судың фильтратқа кері сорылу қаупі)', 'wrong order for vacuum filtration (risk of water sucking back into the filtrate)'),
  items: [
    { id: 'a', label: L('Вставить воронку Бюхнера через резиновое уплотнение в колбу Бунзена, закрепить колбу', 'Бюхнер шұңғымасын резеңке тығыздағыш арқылы Бунзен колбасына орнатып, колбаны бекіту', 'Fit the Büchner funnel into the filter flask through a rubber seal; clamp the flask') },
    { id: 'b', label: L('Положить фильтр по размеру дна воронки', 'Шұңғыма түбінің өлшеміне сай сүзгі салу', 'Lay a filter paper that fits the funnel base') },
    { id: 'c', label: L('Подключить шланг, открыть воду насоса, смочить фильтр — он прижимается', 'Шлангты жалғап, сорғы суын ашып, сүзгіні сулау — ол жабысады', 'Connect the hose, turn on the aspirator, wet the filter — it seals down') },
    { id: 'd', label: L('Перенести суспензию на фильтр, промыть осадок', 'Суспензияны сүзгіге ауыстырып, тұнбаны жуу', 'Transfer the suspension onto the filter and wash the solid') },
    { id: 'e', label: L('Отсоединить шланг от колбы Бунзена', 'Шлангты Бунзен колбасынан ажырату', 'Disconnect the hose from the filter flask') },
    { id: 'f', label: L('Закрыть воду насоса', 'Сорғы суын жабу', 'Turn off the aspirator water') },
  ],
  hint1: L('Сначала собрать и включить, в конце — сначала снять вакуум с колбы, потом выключить насос.', 'Алдымен жинап, қосу, соңында — алдымен колбадан вакуумды алу, содан кейін сорғыны өшіру.', 'Assemble and switch on first; at the end release the vacuum at the flask before turning off the pump.'),
};

const sFunnel = {
  type: 'order', id: 'funnel',
  title: L('Делительная воронка', 'Бөлгіш шұңғыма', 'Separating funnel'),
  instr: L('<p>Промывание органического слоя раствором NaHCO₃ в делительной воронке (как в работе 8). Расставьте действия по порядку. При промывании выделяется CO₂ — воронку часто «продувают».</p>', '<p>Бөлгіш шұңғымада органикалық қабатты NaHCO₃ ерітіндісімен жуу (8-жұмыстағыдай). Әрекеттерді ретімен орналастырыңыз. Жуу кезінде CO₂ бөлінеді — шұңғыманы жиі «үрлейді».</p>', '<p>Washing an organic layer with NaHCO₃ solution in a separating funnel (as in lab 8). Put the actions in order. CO₂ is released during washing — the funnel must be vented often.</p>'),
  need: L('Расставьте по порядку и проверьте', 'Ретімен орналастырып, тексеріңіз', 'Put them in order and check'),
  scene: () => funnelScene(),
  items: [
    { id: 'a', label: L('Закрыть кран; воронка в кольце штатива, под ней стакан', 'Шүмекті жабу; шұңғыма штатив сақинасында, астында стақан', 'Close the tap; funnel in the ring, a beaker beneath') },
    { id: 'b', label: L('Налить смесь и раствор NaHCO₃, закрыть пробкой', 'Қоспа мен NaHCO₃ ерітіндісін құйып, тығынмен жабу', 'Pour in the mixture and the NaHCO₃ solution; stopper it') },
    { id: 'c', label: L('Перевернуть, направив носик от людей, открыть кран — выпустить газ', 'Төңкеріп, түтігін адамдардан бұрып, шүмекті ашу — газды шығару', 'Invert it with the stem pointing away from people, open the tap — release the gas') },
    { id: 'd', label: L('Встряхивать, часто открывая кран для сброса давления', 'Қысымды шығару үшін шүмекті жиі ашып, шайқау', 'Shake, opening the tap often to release pressure') },
    { id: 'e', label: L('Поставить в кольцо, снять пробку, дать слоям разделиться', 'Сақинаға қойып, тығынды алып, қабаттардың бөлінуін күту', 'Return it to the ring, remove the stopper, let the layers separate') },
    { id: 'f', label: L('Слить нижний слой через кран', 'Төменгі қабатты шүмек арқылы ағызу', 'Run off the lower layer through the tap') },
  ],
  hint1: L('Давление CO₂ сбрасывают, перевернув воронку и направив носик от людей; перед сливом слоя снимают пробку.', 'CO₂ қысымын шұңғыманы төңкеріп, түтігін адамдардан бұрып шығарады; қабатты ағызар алдында тығынды алады.', 'CO₂ pressure is released with the funnel inverted and the stem pointing away from people; the stopper comes off before running off a layer.'),
};

const sQuiz = {
  type: 'quiz', id: 'q7',
  title: L('Приборы работ', 'Жұмыстардың құралдары', 'Instruments of the labs'),
  instr: L('<p>Вопросы о приборах, с которыми вы встретитесь в работах 6–15 (по методичке).</p>', '<p>6–15-жұмыстарда кездесетін құралдар туралы сұрақтар (әдістеме бойынша).</p>', '<p>Questions on instruments you will meet in labs 6–15 (from the manual).</p>'),
  need: L('Ответьте на все вопросы', 'Барлық сұраққа жауап беріңіз', 'Answer every question'),
  scene: () => iconScene('mp-apparatus', L('Прибор для определения т. пл.', 'Балқу t анықтайтын құрал', 'Melting-point apparatus')),
  questions: [
    { q: L('Т. пл.: какой высоты слой вещества в капилляре и как нагревают вблизи ожидаемой т. пл.?', 'Балқу t: капиллярдағы зат қабатының биіктігі қандай және күтілетін балқу t-сы маңында қалай қыздырады?', 'Melting point: how deep a layer in the capillary, and how fast near the expected m.p.?'),
      options: [L('2–3 мм; медленно, 1–2 °C/мин', '2–3 мм; баяу, 1–2 °C/мин', '2–3 mm; slowly, 1–2 °C/min'), L('1 см; как можно быстрее', '1 см; мүмкіндігінше тез', '1 cm; as fast as possible'), L('Полный капилляр; 10 °C/мин', 'Толық капилляр; 10 °C/мин', 'A full capillary; 10 °C/min')], correct: 0, why: L('Методичка, работа 6–7, опыт 3.', 'Әдістеме, 6–7-жұмыс, 3-тәжірибе.', 'Manual, lab 6–7, experiment 3.') },
    { q: L('Поляриметр: с чего начинают измерение?', 'Поляриметр: өлшеуді неден бастайды?', 'Polarimeter: how does a measurement start?'),
      options: [L('Проверяют нуль прибора с трубкой, заполненной дистиллированной водой; трубку заполняют без пузырьков воздуха', 'Дистилденген су толтырылған түтікпен құралдың нөлін тексереді; түтікті ауа көпіршіктерінсіз толтырады', 'Check the zero with the tube filled with distilled water; fill the tube without air bubbles'), L('Сразу наливают раствор, пузырьки не мешают', 'Бірден ерітінді құяды, көпіршіктер кедергі келтірмейді', 'Pour in the solution straight away; bubbles do not matter'), L('Нуль проверяют с пустой трубкой', 'Нөлді бос түтікпен тексереді', 'Check the zero with an empty tube')], correct: 0, why: L('Методичка, работа 12, опыт 1.', 'Әдістеме, 12-жұмыс, 1-тәжірибе.', 'Manual, lab 12, experiment 1.') },
    { q: L('Нужно охладить раствор до 0–5 °C. Какая баня быстрее и надёжнее?', 'Ерітіндіні 0–5 °C-қа дейін салқындату керек. Қай монша тезірек және сенімдірек?', 'You need to cool a solution to 0–5 °C. Which bath is faster and more reliable?'),
      options: [L('Ледяно-солевая (колотый лёд + NaCl)', 'Мұз-тұз (уатылған мұз + NaCl)', 'Ice–salt (crushed ice + NaCl)'), L('Водяная баня с водой из-под крана', 'Шүмек суы бар су моншасы', 'A water bath with tap water'), L('Песчаная баня', 'Құм моншасы', 'A sand bath')], correct: 0, why: L('Лёд с водой даёт около 0 °C, с солью — ниже; методичка, работа 6–7.', 'Мұз бен су шамамен 0 °C береді, тұзбен — төмен; әдістеме, 6–7-жұмыс.', 'Ice and water give about 0 °C, with salt lower; manual, lab 6–7.') },
  ],
};

export default {
  id: '7',
  title: L('Лабораторное оборудование', 'Зертханалық құрал-жабдықтар', 'Laboratory equipment'),
  principle: L('Каталог посуды и приборов работ 6–15; сборка типовых установок: обратный холодильник, простая перегонка, фильтрование под вакуумом, делительная воронка; приборы т. пл., поляриметр, бани.', '6–15-жұмыстардың ыдыстары мен құралдарының каталогы; типтік қондырғыларды жинау: кері мұздатқыш, жай айдау, вакуумда сүзу, бөлгіш шұңғыма; балқу t құралы, поляриметр, моншалар.', 'Catalogue of glassware and instruments of labs 6–15; assembling standard set-ups: reflux, simple distillation, vacuum filtration, separating funnel; m.p. apparatus, polarimeter, baths.'),
  equation: [],
  initialState: () => ({}),
  checkpoints: [0, 1, 3, 5],
  steps: [sCatalog, sReflux, sTrial, sDistill, sDistObs, sVacFlask, sVacOrder, sFunnel, sQuiz],
  results: (S, run) => stageResults(run, { catErrs: S.catalog ? S.catalog.errs : 0, catN: S.catalog ? S.catalog.n : 0, asmErrs: ((S.asmR || {}).errors || []).length + ((S.asmD || {}).errors || []).length }),
  summary: (r) => [
    { label: L('Каталог: верно с 1-й попытки', 'Каталог: 1-әрекеттен дұрыс', 'Catalogue: right first time'), value: `${r.catN - r.catErrs} / ${r.catN}`, st: r.catErrs ? 'warn' : 'ok' },
    { label: L('Ошибок сборки', 'Жинау қателері', 'Assembly errors'), value: String(r.asmErrs), st: r.asmErrs ? 'warn' : 'ok' },
    { label: L('Замечаний', 'Ескертулер', 'Remarks'), value: String(r.remarks), st: r.remarks ? 'warn' : 'ok' },
  ],
};
