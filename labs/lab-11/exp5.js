/** Опыт 5. Реакция Фоля (серосодержащие остатки). Методичка, раздел 6, опыт 5. */
import { L, n } from '../../app/i18n.js';
import { relax } from '../../app/instruments/thermal.js';
import { fohl } from './model.js';
import { scene, tube, tubeRack } from '../../app/scene/svg.js';
import { fohlScene, benchBack } from './scene.js';
import { eggInit, prepNote, cat, readyBtn } from './common.js';

const BP = 104; // °C — кипение смеси белка с равным объёмом 30 % NaOH (допущение)
const G = L('В выбранную пробирку', 'Таңдалған пробиркаға', 'Into the selected tube');

const look = (t) => {
  if (!t.v) return;
  const pre = (t.pb || 0) > 0 && !(t.oh > 0) && t.sub === 'egg';
  t.ppt = pre ? 0.45 : t.basePpt || 0; t.pptColor = pre ? '#f2f0e6' : t.basePptColor;
};

const s0 = {
  type: 'test', id: 'fohlmix',
  title: L('Смесь для реакции Фоля', 'Фоль реакциясына арналған қоспа', 'Mixture for the Fohl reaction'),
  instr: L('<ol><li>В вытяжном шкафу к <b>1 мл</b> раствора белка прибавьте <b>равный объём</b> 30 % NaOH и <b>3–4 капли</b> раствора ацетата свинца(II).</li><li>Так же приготовьте пробирку с раствором желатина.</li></ol><p class="note">Ацетат свинца токсичен: берите минимальные количества, работайте в перчатках.</p>',
    '<ol><li>Тартпа шкафта <b>1 мл</b> ақуыз ерітіндісіне 30 % NaOH-тың <b>тең көлемін</b> және қорғасын(II) ацетаты ерітіндісінің <b>3–4 тамшысын</b> қосыңыз.</li><li>Желатин ерітіндісі бар пробирканы да солай дайындаңыз.</li></ol><p class="note">Қорғасын ацетаты улы: ең аз мөлшерде алыңыз, қолғаппен жұмыс істеңіз.</p>',
    '<ol><li>In the fume hood, to <b>1 mL</b> of egg white solution add an <b>equal volume</b> of 30 % NaOH and <b>3–4 drops</b> of lead(II) acetate solution.</li><li>Prepare a tube with gelatin solution in the same way.</li></ol><p class="note">Lead acetate is toxic: use the smallest amounts and wear gloves.</p>'),
  need: L('Приготовьте две пробирки', 'Екі пробирка дайындаңыз', 'Prepare two tubes'),
  tubes: [{ id: 'e', label: L('1 · белок', '1 · ақуыз', '1 · egg white'), init: { sub: 'egg' } }, { id: 'gl', label: L('2 · желатин', '2 · желатин', '2 · gelatin'), init: { sub: 'gel' } }],
  reset: true,
  sceneBack: benchBack(['e', 'gl']),
  reagents: [
    { id: 'fill', target: 'all', group: L('Исследуемые растворы', 'Зерттелетін ерітінділер', 'Test solutions'), label: L('Налить по 1 мл (белок / желатин)', '1 мл-ден құю (ақуыз / желатин)', 'Pour 1 mL each (egg white / gelatin)'), advance: 30,
      disabled: (t) => t.v > 0,
      apply(t, S, ctx, id) {
        if (id === 'e') ctx.log(cat(L('В пробирку 1 налит 1 мл раствора белка, в пробирку 2 — 1 мл 1 % желатина', '1-пробиркаға 1 мл ақуыз ерітіндісі, 2-пробиркаға 1 мл 1 % желатин құйылды', 'Tube 1: 1 mL of egg white solution; tube 2: 1 mL of 1 % gelatin'), prepNote(S.egg)));
        if (t.v > 0) return;
        if (t.sub === 'egg') { Object.assign(t, eggInit(S.egg, 1)); t.basePpt = t.ppt; t.basePptColor = t.pptColor; } else t.v = 1;
      } },
    { id: 'naoh', group: G, label: L('NaOH 30 %: 1 мл (равный объём)', 'NaOH 30 %: 1 мл (тең көлем)', 'NaOH 30 %: 1 mL (equal volume)'), advance: 15,
      apply(t, S, ctx) {
        if (!t.v) { ctx.feedback(L('Сначала налейте исследуемый раствор.', 'Алдымен зерттелетін ерітіндіні құйыңыз.', 'Pour the test solution first.'), 'warn'); return; }
        if ((t.oh || 0) >= 1) { ctx.feedback(L('В эту пробирку щёлочь уже прилита.', 'Бұл пробиркаға сілті құйылып қойған.', 'Alkali has already been added to this tube.'), 'warn'); return; }
        t.oh = 1; t.v += 1; look(t);
        if ((t.pb || 0) > 0 && t.sub === 'egg') ctx.log(L('После прибавления щёлочи белый осадок растворился — образовался плюмбит натрия', 'Сілті қосқаннан кейін ақ тұнба еріді — натрий плюмбиті түзілді', 'On adding the alkali the white precipitate dissolved — sodium plumbite formed'), 'obs');
      } },
    { id: 'pb', group: G, label: L('Pb(CH₃COO)₂ 5 %: +1 кап.', 'Pb(CH₃COO)₂ 5 %: +1 тамшы', 'Pb(CH₃COO)₂ 5 %: +1 drop'), advance: 5,
      apply(t, S, ctx, id) {
        if (!t.v) { ctx.feedback(L('Сначала налейте исследуемый раствор.', 'Алдымен зерттелетін ерітіндіні құйыңыз.', 'Pour the test solution first.'), 'warn'); return; }
        t.pb = (t.pb || 0) + 1; t.v += 0.05; look(t);
        if (t.pb === 1 && t.oh > 0) ctx.log(L('Капля ацетата свинца в щелочном растворе даёт белую муть Pb(OH)₂, которая сразу растворяется в избытке щёлочи', 'Қорғасын ацетатының тамшысы сілтілі ерітіндіде Pb(OH)₂-нің ақ лайын береді, ол сілтінің артығында бірден ериді', 'A drop of lead acetate in the alkaline solution gives a white haze of Pb(OH)₂ that dissolves at once in the excess alkali'), 'obs');
        if (t.pb === 7) ctx.remark({ key: 'e5pb', severity: 'safety', text: L('излишний расход токсичного ацетата свинца (больше 3–4 капель)', 'улы қорғасын ацетатының артық шығыны (3–4 тамшыдан көп)', 'needless use of toxic lead acetate (more than 3–4 drops)'),
          whatif: L('Соль свинца — тяжёлый металл и репродуктивный токсикант. Лишние капли не усиливают пробу, а увеличивают количество опасных отходов.', 'Қорғасын тұзы — ауыр металл және репродуктивтік уытты зат. Артық тамшылар сынаманы күшейтпейді, қауіпті қалдықтарды көбейтеді.', 'Lead salts are heavy-metal reproductive toxins. Extra drops do not improve the test, they only add hazardous waste.') });
      } },
    readyBtn((tb) => {
      if (!tb.e.v || !tb.gl.v) return L('Налейте исследуемые растворы.', 'Зерттелетін ерітінділерді құйыңыз.', 'Pour the test solutions.');
      if (!tb.e.oh || !tb.gl.oh) return L('Прибавьте в каждую пробирку равный объём 30 % NaOH.', 'Әр пробиркаға 30 % NaOH-тың тең көлемін қосыңыз.', 'Add an equal volume of 30 % NaOH to each tube.');
      if (!tb.e.pb || !tb.gl.pb) return L('Прибавьте ацетат свинца в обе пробирки.', 'Екі пробиркаға да қорғасын ацетатын қосыңыз.', 'Add lead acetate to both tubes.');
      return null;
    }, L('Смеси готовы — к нагреванию', 'Қоспалар дайын — қыздыруға', 'Mixtures ready — go to heating')),
  ],
  done: (tubes, S, local) => !!local.ready,
  onDone(S, tb, ctx) {
    S.f5 = { e: { sub: 'egg', oh: tb.e.oh, pb: tb.e.pb }, gl: { sub: 'gel', oh: tb.gl.oh, pb: tb.gl.pb }, T: 22, boil: 0, stood: false, aimed: null };
    ctx.log(L(`Пробирки: белок / желатин + 1 мл 30 % NaOH + ацетат свинца (${tb.e.pb} / ${tb.gl.pb} кап.)`, `Пробиркалар: ақуыз / желатин + 1 мл 30 % NaOH + қорғасын ацетаты (${tb.e.pb} / ${tb.gl.pb} тамшы)`, `Tubes: egg white / gelatin + 1 mL 30 % NaOH + lead acetate (${tb.e.pb} / ${tb.gl.pb} drops)`), 'calc');
  },
  hint1: L('В каждую пробирку: 1 мл раствора, 1 мл 30 % NaOH, 3–4 капли ацетата свинца.', 'Әр пробиркаға: 1 мл ерітінді, 1 мл 30 % NaOH, 3–4 тамшы қорғасын ацетаты.', 'Each tube: 1 mL of solution, 1 mL of 30 % NaOH, 3–4 drops of lead acetate.'),
  hint2: L('Ацетата свинца нужно немного: 3–4 капли достаточно, больше — лишние токсичные отходы.', 'Қорғасын ацетаты аз қажет: 3–4 тамшы жеткілікті, артығы — улы қалдықтар.', 'Only a little lead acetate is needed: 3–4 drops are enough, more is just toxic waste.'),
  hint3: L('Налить по 1 мл → в каждую: NaOH 1 мл, Pb(CH₃COO)₂ 3 капли → «Смеси готовы».', '1 мл-ден құю → әрқайсысына: NaOH 1 мл, Pb(CH₃COO)₂ 3 тамшы → «Қоспалар дайын».', 'Pour 1 mL each → for each: NaOH 1 mL, Pb(CH₃COO)₂ 3 drops → “Mixtures ready”.'),
};

const AIM = [['away', L('от себя и соседей', 'өзіңізден және көршілерден аулақ', 'away from people')], ['me', L('к себе', 'өзіңізге қарай', 'towards yourself')], ['nb', L('в сторону соседа', 'көршіге қарай', 'towards a neighbour')]];

const s1 = {
  type: 'process', id: 'boil',
  title: L('Кипячение со щёлочью', 'Сілтімен қайнату', 'Boiling with alkali'),
  instr: L('<ol><li>Закрепите пробирку в пробиркодержателе.</li><li>Направьте отверстие пробирки <b>от себя и от соседей</b>.</li><li>Осторожно нагрейте смесь до кипения и кипятите <b>2–3 минуты</b>, покачивая пробирку, затем выключите нагрев и дайте постоять.</li></ol><p class="note">Горячая 30 % щёлочь при толчках выбрасывается из пробирки. Пробирку с желатином нагревают так же — на стенде показана пробирка с белком.</p>',
    '<ol><li>Пробирканы пробирка ұстағышқа бекітіңіз.</li><li>Пробирканың аузын <b>өзіңізден және көршілерден аулақ</b> бағыттаңыз.</li><li>Қоспаны абайлап қайнағанға дейін қыздырып, пробирканы тербете отырып <b>2–3 минут</b> қайнатыңыз, содан кейін қыздыруды сөндіріп, тұндырыңыз.</li></ol><p class="note">Ыстық 30 % сілті кенет қайнағанда пробиркадан атылып шығады. Желатин бар пробирканы да солай қыздырады — стендте ақуыз бар пробирка көрсетілген.</p>',
    '<ol><li>Clamp the tube in a test-tube holder.</li><li>Point the mouth of the tube <b>away from yourself and your neighbours</b>.</li><li>Carefully heat the mixture to boiling and boil for <b>2–3 minutes</b>, swirling the tube; then stop heating and let it stand.</li></ol><p class="note">Hot 30 % alkali is thrown out of the tube when it bumps. The gelatin tube is heated the same way — the bench shows the egg white tube.</p>'),
  need: L('Прокипятите смесь 2–3 мин', 'Қоспаны 2–3 мин қайнатыңыз', 'Boil the mixture for 2–3 min'),
  speeds: [3, 6],
  setup(S) { S.f5 = S.f5 || { e: { sub: 'egg', oh: 1, pb: 3 }, gl: { sub: 'gel', oh: 1, pb: 3 }, T: 22, boil: 0, stood: false }; S.f5.bump = S.f5.bump || 0; },
  controls: [
    { kind: 'action', id: 'holder', group: L('Пробирка', 'Пробирка', 'Tube'), label: L('Закрепить в пробиркодержателе', 'Пробирка ұстағышқа бекіту', 'Clamp in the test-tube holder'), advance: 10, log: L('Пробирка закреплена в пробиркодержателе у отверстия', 'Пробирка аузына жақын пробирка ұстағышқа бекітілді', 'The tube is clamped in a holder near its mouth') },
    { kind: 'seg', id: 'aim', group: L('Отверстие пробирки направлено', 'Пробирканың аузы бағытталған', 'Tube mouth pointing'), options: AIM,
      onChange(S, lc, v, ctx) { ctx.update(); if (lc.c.heat && v !== 'away') ctx.remark({ key: 'e5aim', severity: 'safety', text: L('при нагревании отверстие пробирки направлено на людей (раздел 7 методички)', 'қыздыру кезінде пробирканың аузы адамдарға бағытталды (әдістеменің 7-бөлімі)', 'the tube mouth was pointed at people while heating (manual, section 7)') }); } },
    { kind: 'seg', id: 'power', group: L('Нагрев', 'Қыздыру', 'Heating'), options: [['low', L('осторожно', 'абайлап', 'gently')], ['high', L('сильно', 'қатты', 'strongly')]], default: 'low' },
    { kind: 'toggle', id: 'shake', group: L('Нагрев', 'Қыздыру', 'Heating'), label: L('Покачивать пробирку', 'Пробирканы тербету', 'Swirl the tube'), labelOn: L('Покачивание: да', 'Тербету: иә', 'Swirling: yes') },
    { kind: 'toggle', id: 'heat', group: L('Нагрев', 'Қыздыру', 'Heating'), label: L('Нагревать над плиткой', 'Плита үстінде қыздыру', 'Heat over the hot plate'), labelOn: L('Нагрев: идёт', 'Қыздыру: жүріп жатыр', 'Heating: on'),
      when: (S, lc) => !!lc.done.holder && !!lc.c.aim && !lc.done.stand,
      whenText: L('Сначала закрепите пробирку в держателе и выберите, куда направлено отверстие.', 'Алдымен пробирканы ұстағышқа бекітіп, аузы қайда бағытталғанын таңдаңыз.', 'First clamp the tube in the holder and choose where its mouth points.'),
      onChange(S, lc, on, ctx) {
        ctx.log(on ? L('Начат нагрев пробирки над плиткой', 'Пробирканы плита үстінде қыздыру басталды', 'Heating of the tube over the hot plate started') : L(`Нагрев прекращён; смесь кипела ${n(S.f5.boil / 60, 1)} мин`, `Қыздыру тоқтатылды; қоспа ${n(S.f5.boil / 60, 1)} мин қайнады`, `Heating stopped; the mixture boiled for ${n(S.f5.boil / 60, 1)} min`));
        if (on && lc.c.aim !== 'away') ctx.remark({ key: 'e5aim', severity: 'safety', text: L('при нагревании отверстие пробирки направлено на людей (раздел 7 методички)', 'қыздыру кезінде пробирканың аузы адамдарға бағытталды (әдістеменің 7-бөлімі)', 'the tube mouth was pointed at people while heating (manual, section 7)'),
          whatif: L('Кипящая 30 % щёлочь при толчке вылетает из пробирки на 1–2 метра: тяжёлый химический ожог глаз и кожи. Отверстие всегда направляют к задней стенке шкафа.', 'Қайнаған 30 % сілті кенет қайнағанда пробиркадан 1–2 метрге атылады: көз бен терінің ауыр химиялық күйігі. Аузын әрқашан шкафтың артқы қабырғасына бағыттайды.', 'Boiling 30 % alkali shoots 1–2 metres out of a bumping tube: a severe chemical burn of eyes and skin. Always point the mouth at the back of the hood.') });
      } },
    { kind: 'action', id: 'stand', group: L('После кипячения', 'Қайнатқаннан кейін', 'After boiling'), label: L('Дать постоять 2 мин', '2 мин тұндыру', 'Let it stand for 2 min'), advance: 120,
      when: (S, lc) => !lc.c.heat && S.f5.boil > 0, whenText: L('Сначала прокипятите смесь и выключите нагрев.', 'Алдымен қоспаны қайнатып, қыздыруды сөндіріңіз.', 'Boil the mixture first and stop heating.'),
      do(S, lc, ctx) {
        S.f5.stood = true; S.f5.T = 40;
        ctx.advance(Math.round(S.f5.boil)); // вторая пробирка (желатин) кипятится так же
        ctx.log(L(`Пробирка с желатином прокипячена так же (${n(S.f5.boil / 60, 1)} мин); обе пробирки отстаиваются`, `Желатин бар пробирка да солай қайнатылды (${n(S.f5.boil / 60, 1)} мин); екі пробирка да тұнуда`, `The gelatin tube was boiled the same way (${n(S.f5.boil / 60, 1)} min); both tubes are left to stand`));
      } },
  ],
  tick(S, lc, dt) {
    const f = S.f5;
    if (lc.c.heat) {
      const tgt = lc.c.power === 'high' ? 150 : 118;
      f.T = Math.min(BP, relax(f.T, tgt, lc.c.power === 'high' ? 0.05 : 0.03, dt));
      if (f.T >= BP - 0.5) {
        f.boil += dt;
        if (lc.c.power === 'high' || !lc.c.shake) f.bump += dt * (lc.c.power === 'high' ? 2 : 1) * (lc.c.shake ? 0.5 : 1);
      }
    } else if (!lc.done.stand) f.T = relax(f.T, 22, 0.01, dt);
  },
  readouts: (S) => [
    { label: L('Смесь', 'Қоспа', 'Mixture'), value: `${n(S.f5.T, 0)} °C`, st: S.f5.T >= BP - 0.5 ? 'ok' : '' },
    { label: L('Кипение', 'Қайнау', 'Boiling'), value: L(`${n(S.f5.boil / 60, 1)} мин`, `${n(S.f5.boil / 60, 1)} мин`, `${n(S.f5.boil / 60, 1)} min`), st: S.f5.boil >= 120 && S.f5.boil <= 200 ? 'ok' : S.f5.boil > 200 ? 'warn' : '' },
  ],
  alerts: (S, lc) => {
    if (!lc.c.heat) return null;
    if (S.f5.boil > 200) return { text: L('Больше 3 минут кипения — пора выключать нагрев.', '3 минуттан артық қайнады — қыздыруды сөндіретін уақыт.', 'More than 3 minutes of boiling — time to stop heating.'), kind: 'warn' };
    if (S.f5.boil >= 120) return { text: L('Смесь кипит больше 2 минут — достаточно, можно выключать нагрев.', 'Қоспа 2 минуттан артық қайнады — жеткілікті, қыздыруды сөндіруге болады.', 'The mixture has boiled for more than 2 minutes — that is enough, you can stop heating.'), kind: 'good' };
    if (S.f5.T >= BP - 0.5) return { text: L('Смесь кипит.', 'Қоспа қайнап тұр.', 'The mixture is boiling.'), kind: 'info' };
    return null;
  },
  events: [{
    id: 'bump',
    when: (S) => S.f5.bump > 12,
    title: L('Толчки при кипении', 'Кенет қайнау', 'Bumping'),
    text: L('Смесь в пробирке начинает кипеть толчками — пузыри пара выбрасывают жидкость к отверстию.', 'Пробиркадағы қоспа кенет-кенет қайнай бастады — бу көпіршіктері сұйықтықты пробирка аузына лақтырады.', 'The mixture in the tube starts to bump — bursts of vapour throw liquid up towards the mouth.'),
    options: [
      { ok: true, label: L('Отвести пробирку от плитки, покачивая, затем греть осторожно с покачиванием', 'Пробирканы плитадан алып, тербетіп, содан кейін тербете отырып абайлап қыздыру', 'Move the tube off the heat while swirling, then heat gently with swirling'),
        effect(S, lc) { lc.c.power = 'low'; lc.c.shake = true; S.f5.bump = 0; }, log: L('Толчки: пробирка отведена от нагрева, далее — осторожный нагрев с покачиванием', 'Кенет қайнау: пробирка қыздырудан алынды, әрі қарай — тербете отырып абайлап қыздыру', 'Bumping: tube moved off the heat, then gentle heating with swirling') },
      { ok: false, severity: 'critical', label: L('Ничего не менять — смесь скоро успокоится', 'Ештеңе өзгертпеу — қоспа жақында басылады', 'Change nothing — it will settle down soon'),
        remark: L('кипящая 30 % щёлочь выброшена из пробирки при толчке', 'кенет қайнағанда қайнаған 30 % сілті пробиркадан атылып шықты', 'boiling 30 % alkali was thrown out of the tube by bumping'),
        critical: { text: L('Через несколько секунд пузырь перегретого пара выбрасывает горячую 30 % щёлочь вместе с солью свинца из пробирки. В реальной лаборатории это химический ожог кожи, а при попадании в глаза — тяжёлое поражение роговицы; пострадавшего немедленно промывают водой не менее 15 минут.</p><p>Правильно: при первых толчках отвести пробирку от нагрева, покачивая её, и продолжать нагрев осторожно. Отверстие пробирки — всегда от людей.', 'Бірнеше секундтан кейін асқын қызған бу көпіршігі ыстық 30 % сілтіні қорғасын тұзымен бірге пробиркадан лақтырып шығарады. Нақты зертханада бұл терінің химиялық күйігі, ал көзге тисе — қасаңқабықтың ауыр зақымдануы; зардап шегушіні кемінде 15 минут бойы дереу сумен жуады.</p><p>Дұрысы: алғашқы кенет қайнаған кезде пробирканы тербете отырып қыздырудан алып, абайлап қыздыруды жалғастыру. Пробирканың аузы — әрқашан адамдардан аулақ.', 'A few seconds later a burst of superheated vapour throws the hot 30 % alkali, with the lead salt, out of the tube. In a real laboratory this is a chemical burn of the skin, and in the eyes a severe injury to the cornea; the victim is rinsed with water at once for at least 15 minutes.</p><p>The right action: at the first bumps move the tube off the heat while swirling, and continue heating gently. The mouth of the tube always points away from people.') } },
      { ok: false, severity: 'safety', label: L('Заглянуть в пробирку сверху, чтобы понять, что происходит', 'Не болып жатқанын түсіну үшін пробиркаға жоғарыдан қарау', 'Look down into the tube to see what is happening'),
        remark: L('заглядывал в отверстие нагреваемой пробирки', 'қыздырылып жатқан пробирканың аузына үңілді', 'looked into the mouth of a tube being heated'),
        whatif: L('Над отверстием пробирки при толчке оказывается лицо — выброс щёлочи попадает прямо в глаза. В нагреваемую пробирку никогда не заглядывают.', 'Кенет қайнағанда пробирка аузының үстінде бет болады — сілті тікелей көзге түседі. Қыздырылып жатқан пробиркаға ешқашан үңілмейді.', 'When it bumps your face is over the mouth of the tube — the alkali goes straight into your eyes. Never look into a tube being heated.'),
        effect(S, lc) { lc.c.power = 'low'; lc.c.shake = true; S.f5.bump = 0; } },
    ],
  }],
  chart: { value: (S) => S.f5.T, min: 0, max: 120, band: [BP - 1, BP + 1], every: 5, span: 300, label: L('Температура смеси', 'Қоспа температурасы', 'Mixture temperature') },
  done: (S, lc) => !!lc.done.stand && { text: S.f5.boil >= 110 ? L('Смесь прокипячена и отстаивается.', 'Қоспа қайнатылып, тұнуда.', 'The mixture has been boiled and is standing.') : L('Смесь кипела меньше 2 минут.', 'Қоспа 2 минуттан аз қайнады.', 'The mixture boiled for less than 2 minutes.'), kind: S.f5.boil >= 110 ? 'good' : 'warn' },
  onLeave(S, ctx) {
    if (S.f5.boil < 110) ctx.remark({ key: 'e5short', severity: 'major', text: L(`смесь кипятили ${n(S.f5.boil / 60, 1)} мин вместо 2–3 мин — сера отщепилась не полностью`, `қоспа 2–3 мин орнына ${n(S.f5.boil / 60, 1)} мин қайнатылды — күкірт толық бөлінбеді`, `the mixture was boiled for ${n(S.f5.boil / 60, 1)} min instead of 2–3 min — the sulfur was not fully split off`) });
    else if (S.f5.boil > 300) ctx.remark({ key: 'e5long', severity: 'minor', text: L('смесь кипятили значительно дольше 3 мин — жидкость упарилась', 'қоспа 3 минуттан едәуір ұзақ қайнатылды — сұйықтық буланып кетті', 'the mixture was boiled much longer than 3 min — the liquid boiled down') });
  },
  scene: fohlScene,
  hints: [
    L('Сначала безопасность: держатель, отверстие от людей. Затем нагрев до кипения и 2–3 мин кипения.', 'Алдымен қауіпсіздік: ұстағыш, аузы адамдардан аулақ. Содан кейін қайнағанға дейін қыздыру және 2–3 мин қайнату.', 'Safety first: holder, mouth away from people. Then heat to boiling and boil for 2–3 min.'),
    L('Сильный нагрев без покачивания вызывает толчки и выброс щёлочи. Грейте осторожно и покачивайте пробирку.', 'Тербетпей қатты қыздыру кенет қайнауға және сілтінің атылуына әкеледі. Абайлап қыздырып, пробирканы тербетіңіз.', 'Strong heating without swirling causes bumping and alkali spurting out. Heat gently and swirl the tube.'),
    L('Держатель → «от себя и соседей» → «осторожно» + «покачивать» → нагрев; когда «Кипение» 2–3 мин — выключить нагрев → «Дать постоять».', 'Ұстағыш → «өзіңізден және көршілерден аулақ» → «абайлап» + «тербету» → қыздыру; «Қайнау» 2–3 мин болғанда — қыздыруды сөндіру → «Тұндыру».', 'Holder → “away from people” → “gently” + “swirl” → heat; when “Boiling” shows 2–3 min — stop heating → “Let it stand”.'),
  ],
};

const s2 = {
  type: 'observe', id: 'fohlobs',
  title: L('Результат реакции Фоля', 'Фоль реакциясының нәтижесі', 'Result of the Fohl reaction'),
  instr: L('<p>Рассмотрите обе пробирки после отстаивания.</p>', '<p>Тұндырғаннан кейін екі пробирканы да қараңыз.</p>', '<p>Look at both tubes after standing.</p>'),
  need: L('Запишите наблюдение', 'Бақылауды жазыңыз', 'Record the observation'),
  scene: (S) => {
    const pick = (k) => { const a = fohl(S.f5[k], S.f5.boil); return { v: 2.2, color: a.color, ppt: a.ppt, pptColor: a.pptColor }; };
    return benchScene2([['e', L('1 · белок', '1 · ақуыз', '1 · egg white'), pick('e')], ['gl', L('2 · желатин', '2 · желатин', '2 · gelatin'), pick('gl')]]);
  },
  question: L('Что вы наблюдаете?', 'Не байқайсыз?', 'What do you observe?'),
  options: [
    { id: 'ok', label: L('Белок — бурый или чёрный осадок; желатин — без осадка (реакция отрицательная или очень слабая)', 'Ақуыз — қоңыр немесе қара тұнба; желатин — тұнбасыз (реакция теріс немесе өте әлсіз)', 'Egg white — brown to black precipitate; gelatin — no precipitate (negative or very weak)'),
      log: (S) => { const k = fohl(S.f5.e, S.f5.boil).key; return k === 'black' ? L('Белок: чёрный осадок сульфида свинца PbS; желатин: раствор слегка желтоватый, осадка нет — реакция отрицательная', 'Ақуыз: қорғасын сульфиді PbS қара тұнбасы; желатин: ерітінді сәл сарғыш, тұнба жоқ — реакция теріс', 'Egg white: black precipitate of lead sulfide PbS; gelatin: slightly yellowish solution, no precipitate — negative') : L('Белок: бурый осадок сульфида свинца PbS; желатин: осадка нет — реакция отрицательная', 'Ақуыз: қорғасын сульфиді PbS қоңыр тұнбасы; желатин: тұнба жоқ — реакция теріс', 'Egg white: brown precipitate of lead sulfide PbS; gelatin: no precipitate — negative'); } },
    { id: 'weak', label: L('Белок — лишь слабое буроватое окрашивание без осадка; желатин без изменений', 'Ақуыз — тұнбасыз тек әлсіз қоңырқай түс; желатин өзгеріссіз', 'Egg white — only a faint brownish tint, no precipitate; gelatin unchanged'),
      log: (S) => L(`Белок: лишь слабое буроватое окрашивание (кипячение ${n(S.f5.boil / 60, 1)} мин); желатин без изменений`, `Ақуыз: тек әлсіз қоңырқай түс (қайнату ${n(S.f5.boil / 60, 1)} мин); желатин өзгеріссіз`, `Egg white: only a faint brownish tint (boiled ${n(S.f5.boil / 60, 1)} min); gelatin unchanged`) },
    { id: 'none', label: L('В обеих пробирках изменений нет', 'Екі пробиркада да өзгеріс жоқ', 'No change in either tube'),
      log: L('Изменений нет ни в одной пробирке', 'Ешбір пробиркада өзгеріс жоқ', 'No change in either tube') },
    { id: 'both', label: L('В обеих пробирках одинаковый чёрный осадок', 'Екі пробиркада да бірдей қара тұнба', 'The same black precipitate in both tubes') },
  ],
  correct: (S) => { const k = fohl(S.f5.e, S.f5.boil).key; return k === 'black' || k === 'brown' ? 'ok' : k === 'trace' ? 'weak' : 'none'; },
  why: (S) => L('При кипячении с конц. щёлочью сера остатков цистеина и цистина отщепляется в виде S²⁻, который с плюмбитом даёт чёрно-бурый PbS. Желатин беден цистеином; сера метионина (тиоэфир) связана прочнее и не реагирует.', 'Концентрлі сілтімен қайнатқанда цистеин мен цистин қалдықтарының күкірті S²⁻ түрінде бөлінеді, ол плюмбитпен қара-қоңыр PbS береді. Желатинде цистеин аз; метиониннің күкірті (тиоэфир) берік байланысқан және әрекеттеспейді.', 'On boiling with conc. alkali the sulfur of cysteine and cystine residues is split off as S²⁻, which gives black-brown PbS with plumbite. Gelatin is poor in cysteine; the sulfur of methionine (a thioether) is bound more firmly and does not react.'),
};

/** Простая сцена из двух пробирок для шага observe. */
function benchScene2(list) {
  const xs = [140, 220];
  return scene(list.map(([id, label, a], i) => tube({ id: 'fo' + i, cx: xs[i], frac: Math.min(1, a.v / 5), color: a.color, ppt: a.ppt, pptColor: a.pptColor, label })).join('') + tubeRack(90, 270));
}

export default {
  id: '5',
  title: L('Реакция Фоля (серосодержащие остатки)', 'Фоль реакциясы (құрамында күкірт бар қалдықтар)', 'Fohl reaction (sulfur-containing amino acid residues)'),
  principle: L('При кипячении с концентрированной щёлочью сера остатков цистеина и цистина отщепляется в виде сульфид-иона, который с ионами свинца(II) даёт чёрно-бурый осадок сульфида свинца. Метионин не реагирует: его сера (тиоэфир) связана прочнее.', 'Концентрлі сілтімен қайнатқанда цистеин мен цистин қалдықтарының күкірті сульфид-ион түрінде бөлінеді, ол қорғасын(II) иондарымен қорғасын сульфидінің қара-қоңыр тұнбасын береді. Метионин әрекеттеспейді: оның күкірті (тиоэфир) берік байланысқан.', 'On boiling with concentrated alkali the sulfur of cysteine and cystine residues is split off as sulfide ion, which gives a black-brown precipitate of lead(II) sulfide with lead(II) ions. Methionine does not react because its sulfur (a thioether) is bound more firmly.'),
  equation: [L('R–CH₂–SH + 2NaOH → R–CH₂–OH + Na₂S + H₂O (схема)', 'R–CH₂–SH + 2NaOH → R–CH₂–OH + Na₂S + H₂O (сызба)', 'R–CH₂–SH + 2NaOH → R–CH₂–OH + Na₂S + H₂O (schematic)'), 'Pb(CH₃COO)₂ + 4NaOH → Na₂[Pb(OH)₄] + 2CH₃COONa', 'Na₂S + Na₂[Pb(OH)₄] → PbS↓ + 4NaOH'],
  initialState: ({ prev }) => ({ egg: (prev['1'] || {}).egg || 'ok', f5: null }),
  checkpoints: [0, 1],
  steps: [s0, s1, s2],
  results: (S) => {
    const f = S.f5 || { e: {}, gl: {}, boil: 0 };
    return { egg: fohl(f.e || {}, f.boil).key, gel: fohl(f.gl || {}, f.boil).key, boil: f.boil, pb: (f.e || {}).pb || 0, eggPrep: S.egg };
  },
  summary: (r) => [
    { label: L('Кипячение', 'Қайнату', 'Boiling'), value: L(`${n(r.boil / 60, 1)} мин`, `${n(r.boil / 60, 1)} мин`, `${n(r.boil / 60, 1)} min`), st: r.boil >= 110 ? 'ok' : 'warn' },
    { label: L('Белок', 'Ақуыз', 'Egg white'), value: r.egg === 'black' || r.egg === 'brown' ? L('осадок PbS', 'PbS тұнбасы', 'PbS precipitate') : L('слабо / нет', 'әлсіз / жоқ', 'weak / none'), st: r.egg === 'black' || r.egg === 'brown' ? 'ok' : 'warn' },
  ],
};
