/**
 * lab08-funnel — обработка реакционной смеси в делительной воронке (методичка, раздел 6, опыт 1, пп. 3–4):
 * вылить смесь в воронку с 20 мл холодной воды → встряхнуть → слить нижний водный слой → промывать порциями
 * 5 % NaHCO₃, пока выделяется CO₂ (часто сбрасывать давление!) → 10 мл насыщ. NaCl → перелить эфир в сухую колбу.
 * Химия промывок — labs/lab-08/model.js (washWater, washBicarb, washBrine). Состояние шага — ctx.local (F).
 * step: { kind: 'n'|'i', ester: {ru,kk,en} } ; результат — state.org (состав органического слоя), state.wash.
 * Ошибки: кран открыт при заливке (major), встряхивание без сброса газа (safety + потери), слой с эфиром вылит (critical),
 * нет промывки NaCl (minor, больше воды), не проверено окончание выделения CO₂ (minor), эфир слит через кран (minor).
 */
import { h } from '../../../app/dom.js';
import { L, tr, n } from '../../../app/i18n.js';
import { btn, row, group } from '../../../app/ui/controls.js';
import { washWater, washBicarb, washBrine, orgVolume, acidMmol } from '../model.js';
import { funnelScene } from '../scene.js';

const LIQ = {
  water: L('холодная вода', 'суық су', 'cold water'),
  bicarb: L('5 % раствор NaHCO₃', '5 % NaHCO₃ ерітіндісі', '5 % NaHCO₃ solution'),
  brine: L('насыщенный раствор NaCl', 'қаныққан NaCl ерітіндісі', 'saturated NaCl solution'),
};

const CRIT_KEEP = L(
  'Нижний слой — водный (d ≈ 1,0–1,1 г/мл), а эфир (d ≈ 0,88 г/мл) лёгкий и всегда сверху. Вы сохранили водный слой, а слой с эфиром вылили в отходы — продукт потерян. В реальной лаборатории синтез пришлось бы повторить; органические отходы собирают в ёмкость для органических отходов, не в раковину. В тренажёре вы вернётесь к началу обработки смеси.',
  'Төменгі қабат — сулы (d ≈ 1,0–1,1 г/мл), ал эфир (d ≈ 0,88 г/мл) жеңіл және әрқашан жоғарыда. Сіз сулы қабатты сақтап, эфирі бар қабатты қалдыққа төктіңіз — өнім жоғалды. Нақты зертханада синтезді қайталауға тура келер еді; органикалық қалдықтарды раковинаға емес, органикалық қалдықтар ыдысына жинайды. Тренажерде қоспаны өңдеудің басына ораласыз.',
  'The lower layer is aqueous (d ≈ 1.0–1.1 g/mL) and the ester (d ≈ 0.88 g/mL) is light and always on top. You kept the aqueous layer and threw the ester layer away — the product is lost. In a real lab the synthesis would have to be repeated; organic waste goes into the organic waste container, never the sink. In the simulator you return to the start of the work-up.');

/*
 * Подсказка 3 — готовое решение с названиями кнопок дословно (SCHEMA.md). Число порций NaHCO₃ заранее не известно:
 * следующая порция добавляется, пока предыдущая давала CO₂; после порции без газа — NaCl и перенос эфира.
 */
const FB = {
  tap: { ru: 'Кран открыт → закрыть', kk: 'Шүмек ашық → жабу', en: 'Stopcock open → close it' },
  water: { ru: 'Налить 20 мл холодной воды', kk: '20 мл суық су құю', en: 'Add 20 mL of cold water' },
  mix: { ru: 'Вылить реакционную смесь в воронку', kk: 'Реакциялық қоспаны шұңғымаға құю', en: 'Pour the reaction mixture into the funnel' },
  shake: { ru: 'Закрыть пробкой, перевернуть и встряхивать, часто открывая кран', kk: 'Тығынмен жауып, аударып шайқау, шүмекті жиі ашып отыру', en: 'Stopper, invert and shake, opening the stopcock often' },
  settle: { ru: 'Поставить в кольцо и дать слоям разделиться', kk: 'Сақинаға қойып, қабаттардың бөлінуін күту', en: 'Put it in the ring and let the layers separate' },
  unstop: { ru: 'Снять пробку', kk: 'Тығынды алу', en: 'Remove the stopper' },
  drain: { ru: 'Слить нижний (водный) слой в стакан, эфир оставить в воронке', kk: 'Төменгі (сулы) қабатты стақанға ағызу, эфирді шұңғымада қалдыру', en: 'Run the lower (aqueous) layer into the beaker; keep the ester in the funnel' },
  bic: { ru: 'NaHCO₃ 5 %: +15 мл', kk: 'NaHCO₃ 5 %: +15 мл', en: '5 % NaHCO₃: +15 mL' },
  brine: { ru: 'Насыщ. NaCl: 10 мл', kk: 'Қаныққан NaCl: 10 мл', en: 'Saturated NaCl: 10 mL' },
  neck: { ru: 'Перелить эфир через горло воронки в сухую коническую колбу', kk: 'Эфирді шұңғыма мойны арқылы құрғақ конустық колбаға құю', en: 'Pour the ester out through the neck into a dry conical flask' },
};
function funnelH3(F, S) {
  const cycle = [FB.shake, FB.settle, FB.unstop, FB.drain];
  const items = [FB.tap, FB.water, FB.mix, ...cycle];
  const busy = F.cur === 'bicarb' && F.aq > 0;
  const lastCO2 = S.wash ? S.wash.lastCO2 : null;
  const gasStopped = F.nB > 0 && !busy && lastCO2 != null && lastCO2 <= 0.5;
  const portions = F.nB + (!F.nS && !busy && !gasStopped && F.drains >= 1 ? 1 : 0);
  for (let i = 0; i < portions; i++) items.push(FB.bic, ...cycle);
  const last = F.nS || gasStopped;
  if (last) items.push(FB.brine, ...cycle, FB.neck);
  const tail = last ? null : {
    ru: '→ промывайте порциями NaHCO₃, пока при встряхивании выделяется CO₂; последняя порция газа не даёт. Затем 10 мл насыщенного NaCl и эфир через горло в сухую колбу.',
    kk: '→ шайқағанда CO₂ бөлінгенше NaHCO₃ порцияларымен жуыңыз; соңғы порция газ бермейді. Содан кейін 10 мл қаныққан NaCl және эфирді мойны арқылы құрғақ колбаға.',
    en: '→ wash with NaHCO₃ portions while shaking gives off CO₂; the last portion gives no gas. Then 10 mL of saturated NaCl, and the ester out through the neck into a dry flask.',
  };
  const f = (l) => items.map((x) => (l === 'en' ? `“${x.en}”` : `«${x[l]}»`)).join(' → ') + (tail ? ' ' + tail[l] : '');
  return { ru: f('ru'), kk: f('kk'), en: f('en') };
}

export default {
  type: 'lab08-funnel',
  init(step, ctx) {
    const F = ctx.local;
    Object.assign(F, { tap: true, stopper: false, aq: 0, org: 0, mixed: false, shaken: false, settled: false, cur: null, waste: 0, gas: 0, poured: false, nW: 0, nB: 0, nS: 0, lastCO2: null, lastPH: null, drains: 0, prod: 0, flow: false });
    ctx.state.wash = { water: 0, bicarb: 0, brine: 0, lastCO2: null, vented: true };
  },
  render(step, ctx) {
    const { local: F, state: S } = ctx;
    const wrap = h('div', { class: 'wfull' });
    const ml = (v) => ({ ru: n(v, 0) + ' мл', kk: n(v, 0) + ' мл', en: n(v, 0) + ' mL' });
    const done = !!F.prod;
    const act = (label, fn, cls = '', dis = false) => { const b = btn(label, () => { if (done) return; fn(); ctx.save(); ctx.rerender(); }, cls); if (dis || done) b.disabled = true; return b; };
    const need = (cond, text) => { if (!cond) ctx.feedback(text, 'warn'); return cond; };
    const syncOrg = () => { F.org = orgVolume(S.org); };

    /* ---------- кран и пробка ---------- */
    const tapB = act(F.tap ? L('Кран открыт → закрыть', 'Шүмек ашық → жабу', 'Stopcock open → close it') : L('Кран закрыт → открыть', 'Шүмек жабық → ашу', 'Stopcock closed → open it'), () => {
      F.tap = !F.tap;
      if (F.tap && (F.aq + F.org) > 0) {
        if (F.stopper) { ctx.feedback(L('Жидкость почти не вытекает: воронка закрыта пробкой, внутри разрежение. Снимите пробку.', 'Сұйық ақпайды дерлік: шұңғыма тығынмен жабық, ішінде сиреу бар. Тығынды алыңыз.', 'Hardly anything flows: the stopper is in and there is a vacuum inside. Remove the stopper.'), 'warn'); F.tap = false; return; }
        ctx.feedback(L('Кран открыт — чтобы слить нижний слой, используйте кнопку «Слить нижний слой».', 'Шүмек ашық — төменгі қабатты ағызу үшін «Төменгі қабатты ағызу» батырмасын пайдаланыңыз.', 'The stopcock is open — to run off the lower layer use “Run off the lower layer”.'), 'info');
        F.tap = false;
      }
    }, F.tap ? 'danger' : '');
    const stopB = act(F.stopper ? L('Снять пробку', 'Тығынды алу', 'Remove the stopper') : L('Закрыть пробкой', 'Тығынмен жабу', 'Insert the stopper'), () => { F.stopper = !F.stopper; });

    /* ---------- залить ---------- */
    const pourIn = (vol, kind) => {
      if (F.tap) {
        ctx.remark({ key: 'sf8-open', severity: 'major', text: L('жидкость налита в делительную воронку при открытом кране — часть смеси вытекла на стол', 'сұйық бөлгіш шұңғымаға ашық шүмекпен құйылды — қоспаның бір бөлігі үстелге ағып кетті', 'liquid poured into the separating funnel with the stopcock open — some of the mixture ran out onto the bench'), whatif: L('Через открытый кран жидкость сразу уходит вниз. Перед заливкой кран закрывают и проверяют, не подтекает ли он.', 'Ашық шүмек арқылы сұйық бірден төмен ағып кетеді. Құймас бұрын шүмекті жауып, ақпайтынын тексереді.', 'Through an open stopcock the liquid runs straight out. Close the stopcock and check that it does not leak before filling.') });
        if (kind !== 'mix') vol = Math.round(vol * 0.4);
        if (kind === 'mix' && S.org) { for (const k of ['ester', 'alc', 'acid']) S.org[k] *= 0.85; S.ledger.wash += S.org.ester * 0.15 / 0.85; }
        F.tap = false;
        ctx.log(L('Кран был открыт: часть жидкости вытекла, кран закрыт', 'Шүмек ашық болды: сұйықтың бір бөлігі ағып кетті, шүмек жабылды', 'The stopcock was open: some liquid ran out; stopcock closed'), 'obs');
      }
      F.shaken = false; F.settled = false;
      if (kind === 'mix') { F.poured = true; F.mixed = F.aq > 0; syncOrg(); ctx.advance(90); return; }
      F.aq += vol; F.cur = kind; F.mixed = false; ctx.advance(30);
    };
    const aqBusy = () => need(F.aq === 0 || !F.poured, L('В воронке ещё водный слой предыдущей промывки — сначала слейте его.', 'Шұңғымада алдыңғы жуудың сулы қабаты бар — алдымен оны ағызыңыз.', 'The aqueous layer of the previous wash is still in the funnel — run it off first.'));
    const waterB = act(L('Налить 20 мл холодной воды', '20 мл суық су құю', 'Add 20 mL of cold water'), () => {
      if (F.nW) return; pourIn(20, 'water'); F.nW = 1;
      ctx.log(L('В делительную воронку налито 20 мл холодной воды', 'Бөлгіш шұңғымаға 20 мл суық су құйылды', '20 mL of cold water put into the separating funnel'));
    }, '', !!F.nW);
    const mixB = act({ ru: 'Вылить реакционную смесь в воронку', kk: 'Реакциялық қоспаны шұңғымаға құю', en: 'Pour the reaction mixture into the funnel' }, () => {
      if (F.poured) return;
      if (!need(F.nW, L('Сначала налейте в воронку 20 мл холодной воды (п. 3 хода работы).', 'Алдымен шұңғымаға 20 мл суық су құйыңыз (жұмыс барысының 3-тармағы).', 'First put 20 mL of cold water into the funnel (procedure step 3).'))) return;
      pourIn(0, 'mix');
      ctx.log({ ru: `Охлаждённая реакционная смесь (≈ ${n(F.org, 0)} мл) вылита в воронку с водой; кипелки оставлены в колбе`, kk: `Салқындатылған реакциялық қоспа (≈ ${n(F.org, 0)} мл) сулы шұңғымаға құйылды; қайнату тастары колбада қалдырылды`, en: `The cooled reaction mixture (≈ ${n(F.org, 0)} mL) poured into the funnel with the water; the boiling chips stay in the flask` });
    }, '', F.poured);
    const bic = (v) => act({ ru: `NaHCO₃ 5 %: +${v} мл`, kk: `NaHCO₃ 5 %: +${v} мл`, en: `5 % NaHCO₃: +${v} mL` }, () => {
      if (!need(F.drains >= 1, L('Сначала отделите водный слой после промывки водой.', 'Алдымен сумен жуғаннан кейінгі сулы қабатты бөліңіз.', 'First separate the aqueous layer from the water wash.')) || !aqBusy()) return;
      if (F.nS) { ctx.feedback(L('После промывки NaCl к гидрокарбонату не возвращаются — это последняя промывка.', 'NaCl-мен жуғаннан кейін гидрокарбонатқа қайтпайды — бұл соңғы жуу.', 'After the brine wash you do not go back to bicarbonate — brine is the last wash.'), 'warn'); return; }
      pourIn(v, 'bicarb'); F.nB++;
      const pre = Math.min(acidMmol(S.org), 0.25 * v * 0.617);
      F.gas = pre > 0.3 ? 1.5 : 0;
      ctx.log({ ru: `Налито ${v} мл 5 % NaHCO₃${pre > 0.3 ? ' — на границе слоёв сразу пошли пузырьки газа' : ''}`, kk: `${v} мл 5 % NaHCO₃ құйылды${pre > 0.3 ? ' — қабаттар шекарасында бірден газ көпіршіктері пайда болды' : ''}`, en: `${v} mL of 5 % NaHCO₃ added${pre > 0.3 ? ' — gas bubbles appear at the interface at once' : ''}` }, pre > 0.3 ? 'obs' : 'act');
    });
    const brineB = act(L('Насыщ. NaCl: 10 мл', 'Қаныққан NaCl: 10 мл', 'Saturated NaCl: 10 mL'), () => {
      if (!need(F.nB >= 1 && !(F.cur === 'bicarb' && F.aq > 0), L('Сначала промойте эфир раствором NaHCO₃ и слейте водный слой.', 'Алдымен эфирді NaHCO₃ ерітіндісімен жуып, сулы қабатты ағызыңыз.', 'First wash the ester with NaHCO₃ and run off the aqueous layer.')) || !aqBusy()) return;
      pourIn(10, 'brine'); F.nS = 1;
      ctx.log(L('Налито 10 мл насыщенного раствора NaCl', '10 мл қаныққан NaCl ерітіндісі құйылды', '10 mL of saturated NaCl solution added'));
    }, '', !!F.nS);

    /* ---------- встряхнуть, отстоять ---------- */
    const shake = (vent) => act(vent ? L('Закрыть пробкой, перевернуть и встряхивать, часто открывая кран (носик — от себя и соседей)', 'Тығынмен жауып, аударып шайқау, шүмекті жиі ашып отыру (ұшы — өзіңізден және көршілерден алыс)', 'Stopper, invert and shake, opening the stopcock often (outlet pointed away from people)') : L('Закрыть пробкой и энергично встряхнуть, не открывая кран', 'Тығынмен жауып, шүмекті ашпай қатты шайқау', 'Stopper and shake vigorously without opening the stopcock'), () => {
      if (!need(F.poured && F.aq > 0, L('В воронке нет двух жидкостей для промывки.', 'Шұңғымада жууға арналған екі сұйық жоқ.', 'There are not two liquids in the funnel to wash.'))) return;
      if (!need(!F.shaken, L('Смесь уже встряхнута — дайте слоям разделиться.', 'Қоспа шайқалды — қабаттардың бөлінуін күтіңіз.', 'The mixture has been shaken — let the layers separate.'))) return;
      F.stopper = true; F.tap = false;
      let r;
      if (F.cur === 'water') r = washWater(S.org, F.aq);
      else if (F.cur === 'bicarb') r = washBicarb(S.org, F.aq);
      else r = washBrine(S.org, F.aq);
      S.ledger.wash += r.esterLost;
      F.lastCO2 = F.cur === 'bicarb' ? r.co2 : null; F.pendPH = r.pH;
      F.gas = F.cur === 'bicarb' ? Math.min(8, r.co2) : 0;
      if (F.cur === 'bicarb') S.wash.lastCO2 = r.co2;
      F.shaken = true; F.mixed = true; F.settled = false;
      ctx.advance(120);
      if (!vent && F.cur === 'bicarb' && r.co2 > 0.5) {
        ctx.remark({ key: 'sf8-vent', severity: 'safety', text: L('воронку с NaHCO₃ встряхивали, не сбрасывая давление CO₂ — пробку выбило, смесь выплеснулась', 'NaHCO₃ бар шұңғыма CO₂ қысымын шығармай шайқалды — тығын атылып, қоспа шашырады', 'the funnel with NaHCO₃ was shaken without releasing the CO₂ pressure — the stopper blew out and the mixture splashed'),
          whatif: L('При нейтрализации кислоты гидрокарбонатом выделяется CO₂: в закрытой воронке давление быстро растёт, пробку выбивает, эфир и раствор летят на руки и лицо. Воронку переворачивают краном вверх и часто открывают кран, направив носик от себя и соседей (раздел 7 методички).', 'Қышқылды гидрокарбонатпен бейтараптағанда CO₂ бөлінеді: жабық шұңғымада қысым тез өседі, тығын атылып, эфир мен ерітінді қол мен бетке шашырайды. Шұңғыманы шүмегін жоғары қаратып аударады және ұшын өзінен және көршілерден алыс бағыттап, шүмекті жиі ашады (әдістеменің 7-бөлімі).', 'Neutralising acid with bicarbonate releases CO₂: in a closed funnel the pressure rises quickly, the stopper blows out and ester and solution fly onto hands and face. Invert the funnel with the stopcock up and open it often, pointing the outlet away from yourself and others (manual, section 7).') });
        for (const k of ['ester', 'alc', 'acid']) S.org[k] *= 0.92; S.ledger.wash += S.org.ester * 0.08 / 0.92;
        S.wash.vented = false; F.stopper = false;
        ctx.log(L('Давлением CO₂ выбило пробку воронки, часть смеси выплеснулась', 'CO₂ қысымы шұңғыма тығынын атып шығарды, қоспаның бір бөлігі шашырады', 'CO₂ pressure blew the stopper out; some of the mixture splashed out'), 'obs');
        ctx.feedback(L('Пробку выбило! При промывке гидрокарбонатом давление сбрасывают после каждого встряхивания.', 'Тығын атылды! Гидрокарбонатпен жуғанда әр шайқаудан кейін қысымды шығарады.', 'The stopper blew out! When washing with bicarbonate, release the pressure after every shake.'), 'bad');
      } else if (!vent) {
        ctx.feedback(L('Давление паров небольшое, но воронку всё равно переворачивают и сбрасывают давление через кран.', 'Бу қысымы аз, бірақ шұңғыманы бәрібір аударып, қысымды шүмек арқылы шығарады.', 'The vapour pressure is small, but you still invert the funnel and vent it through the stopcock.'), 'warn');
      } else {
        const g = F.cur === 'bicarb' ? (r.co2 > 4 ? L('бурно выделяется CO₂, давление сбрасывали много раз', 'CO₂ қарқынды бөлінеді, қысым көп рет шығарылды', 'vigorous CO₂ evolution; vented many times') : r.co2 > 0.5 ? L('выделяется немного CO₂', 'аздап CO₂ бөлінеді', 'a little CO₂ is given off') : L('газ больше не выделяется', 'газ енді бөлінбейді', 'no more gas is given off')) : null;
        ctx.log({ ru: `Воронка встряхнута с периодическим сбросом давления (${tr(LIQ[F.cur], 'ru')})${g ? ': ' + tr(g, 'ru') : ''}`, kk: `Шұңғыма қысымды мезгіл-мезгіл шығара отырып шайқалды (${tr(LIQ[F.cur], 'kk')})${g ? ': ' + tr(g, 'kk') : ''}`, en: `Funnel shaken with frequent venting (${tr(LIQ[F.cur], 'en')})${g ? ': ' + tr(g, 'en') : ''}` }, g ? 'obs' : 'act');
        ctx.feedback(null);
      }
    }, vent ? 'pri' : '');
    const settleB = act(L('Поставить в кольцо и дать слоям разделиться', 'Сақинаға қойып, қабаттардың бөлінуін күту', 'Put it in the ring and let the layers separate'), () => {
      if (!need(F.shaken && !F.settled, L('Сначала встряхните смесь.', 'Алдымен қоспаны шайқаңыз.', 'Shake the mixture first.'))) return;
      F.settled = true; F.mixed = false; F.gas = 0; ctx.advance(180);
      if (F.drains === 0) ctx.log({ ru: `Слои разделились: сверху — бесцветный эфирный слой (${tr(step.ester, 'ru')}, d ≈ 0,88), снизу — водный`, kk: `Қабаттар бөлінді: үстінде — түссіз эфир қабаты (${tr(step.ester, 'kk')}, d ≈ 0,88), астында — сулы қабат`, en: `The layers have separated: the colourless ester layer (${tr(step.ester, 'en')}, d ≈ 0.88) on top, the aqueous layer below` }, 'obs');
    }, '', !F.shaken || F.settled);

    /* ---------- слить ---------- */
    const drain = (keepLower) => act(keepLower ? L('Нижний слой — это эфир: слить его в колбу для продукта, верхний — в отходы', 'Төменгі қабат — эфир: оны өнім колбасына ағызу, жоғарғысын — қалдыққа', 'The lower layer is the ester: run it into the product flask, the upper one to waste') : L('Слить нижний (водный) слой в стакан, эфир оставить в воронке', 'Төменгі (сулы) қабатты стақанға ағызу, эфирді шұңғымада қалдыру', 'Run the lower (aqueous) layer into the beaker; keep the ester in the funnel'), () => {
      if (!need(F.aq > 0 && F.shaken, L('Нечего сливать: сначала промывка (налить, встряхнуть, отстоять).', 'Ағызатын ештеңе жоқ: алдымен жуу (құю, шайқау, тұндыру).', 'Nothing to run off yet: first do the wash (add, shake, settle).'))) return;
      if (!need(F.settled, L('Слои ещё не разделились — дайте смеси отстояться.', 'Қабаттар әлі бөлінбеді — қоспаны тұндырыңыз.', 'The layers have not separated yet — let the mixture settle.'))) return;
      if (F.stopper) { ctx.feedback(L('Кран открыт, но жидкость почти не течёт: в воронке разрежение. Снимите пробку.', 'Шүмек ашық, бірақ сұйық ақпайды дерлік: шұңғымада сиреу бар. Тығынды алыңыз.', 'The stopcock is open but hardly anything flows: there is a vacuum in the funnel. Remove the stopper.'), 'warn'); return; }
      if (keepLower) {
        ctx.remark({ key: 'sf8-keep', severity: 'critical', text: L('слой с эфиром вылит в отходы — сохранён водный слой', 'эфирі бар қабат қалдыққа төгілді — сулы қабат сақталды', 'the ester layer was discarded and the aqueous layer kept'), critical: { text: CRIT_KEEP } });
        return;
      }
      F.waste += F.aq; F.lastPH = F.pendPH; F.lastKind = F.cur;
      ctx.log({ ru: `Нижний водный слой (${n(F.aq, 0)} мл, ${tr(LIQ[F.cur], 'ru')}) слит в стакан`, kk: `Төменгі сулы қабат (${n(F.aq, 0)} мл, ${tr(LIQ[F.cur], 'kk')}) стақанға ағызылды`, en: `Lower aqueous layer (${n(F.aq, 0)} mL, ${tr(LIQ[F.cur], 'en')}) run off into the beaker` });
      if (F.cur === 'water') { F.nW = 2; S.wash.water = 1; } else if (F.cur === 'bicarb') S.wash.bicarb++; else S.wash.brine = 1;
      F.aq = 0; F.drains++; F.shaken = false; F.settled = false; F.tap = false; F.paper = null; ctx.advance(90); syncOrg();
    });

    /* ---------- проверка и перенос ---------- */
    const paperB = act(L('Индикаторная бумага: последний водный слой', 'Индикатор қағазы: соңғы сулы қабат', 'Indicator paper: last aqueous layer'), () => {
      if (!need(F.lastPH != null, L('Пока нет слитого водного слоя.', 'Әзірге ағызылған сулы қабат жоқ.', 'No aqueous layer has been run off yet.'))) return;
      F.paper = F.lastPH; ctx.advance(10);
      const p = Math.round(F.lastPH);
      ctx.log({ ru: `Водный слой (${tr(LIQ[F.lastKind], 'ru')}): индикаторная бумага — pH ≈ ${p}`, kk: `Сулы қабат (${tr(LIQ[F.lastKind], 'kk')}): индикатор қағазы — pH ≈ ${p}`, en: `Aqueous layer (${tr(LIQ[F.lastKind], 'en')}): indicator paper — pH ≈ ${p}` }, 'obs');
    });
    const finish = (neck) => act(neck ? L('Перелить эфир через горло воронки в сухую коническую колбу', 'Эфирді шұңғыма мойны арқылы құрғақ конустық колбаға құю', 'Pour the ester out through the neck into a dry conical flask') : L('Слить эфир через кран в коническую колбу', 'Эфирді шүмек арқылы конустық колбаға ағызу', 'Run the ester out through the stopcock into a conical flask'), () => {
      if (!need(F.drains >= 2 && F.aq === 0 && F.nB >= 1, L('Сначала промойте эфир водой и раствором NaHCO₃ и слейте водный слой.', 'Алдымен эфирді сумен және NaHCO₃ ерітіндісімен жуып, сулы қабатты ағызыңыз.', 'First wash the ester with water and NaHCO₃ and run off the aqueous layer.'))) return;
      if (F.stopper) F.stopper = false;
      if (!F.nS) ctx.remark({ key: 'sf8-brine', severity: 'minor', text: L('не проведена промывка насыщенным NaCl — в эфире остаётся больше воды', 'қаныққан NaCl-мен жуу жүргізілмеді — эфирде су көбірек қалады', 'no wash with saturated NaCl — more water stays in the ester'), whatif: L('Насыщенный раствор NaCl уменьшает растворимость эфира в воде и «вытягивает» воду из органического слоя. Без него эфир мутнее, осушителя нужно больше, а при перегонке появится мутный головной погон.', 'Қаныққан NaCl ерітіндісі эфирдің судағы ерігіштігін азайтып, органикалық қабаттан суды «тартып алады». Онсыз эфир лайлырақ, кептіргіш көбірек керек, ал айдағанда лайлы бастапқы фракция пайда болады.', 'Saturated NaCl lowers the solubility of the ester in water and draws water out of the organic layer. Without it the ester is cloudier, needs more drying agent and gives a cloudy fore-run on distillation.') });
      if (S.wash.lastCO2 != null && S.wash.lastCO2 > 0.5) ctx.remark({ key: 'sf8-co2', severity: 'minor', text: L('не проверено, что CO₂ больше не выделяется: промывку NaHCO₃ закончили, пока шёл газ', 'CO₂ енді бөлінбейтіні тексерілмеді: NaHCO₃-пен жуу газ бөлініп жатқанда аяқталды', 'no check that CO₂ evolution had stopped: the bicarbonate wash was ended while gas was still forming') });
      if (!neck) {
        S.org.water += 0.25;
        ctx.remark({ key: 'sf8-tap', severity: 'minor', text: L('эфир слит через кран — капли водного слоя из носика попали в продукт', 'эфир шүмек арқылы ағызылды — ұшындағы сулы қабат тамшылары өнімге түсті', 'the ester was run out through the stopcock — droplets of the aqueous layer from the stem got into the product') });
      }
      S.wash.acidLeft = acidMmol(S.org);
      F.prod = F.org; F.org = 0; ctx.advance(60);
      ctx.log({ ru: `Эфирный слой (≈ ${n(F.prod, 0)} мл) перенесён в сухую коническую колбу; промывок: вода 1, NaHCO₃ ${S.wash.bicarb}, NaCl ${S.wash.brine}`, kk: `Эфир қабаты (≈ ${n(F.prod, 0)} мл) құрғақ конустық колбаға ауыстырылды; жуу: су 1, NaHCO₃ ${S.wash.bicarb}, NaCl ${S.wash.brine}`, en: `Ester layer (≈ ${n(F.prod, 0)} mL) transferred to a dry conical flask; washes: water 1, NaHCO₃ ${S.wash.bicarb}, NaCl ${S.wash.brine}` });
      ctx.log(L('Эфирный слой слегка мутный, с фруктовым запахом', 'Эфир қабаты сәл лайлы, жеміс иісі бар', 'The ester layer is slightly cloudy, with a fruity odour'), 'obs');
      ctx.solve(L('Эфир отмыт и перенесён в колбу для сушки.', 'Эфир жуылып, кептіру колбасына ауыстырылды.', 'The ester is washed and transferred for drying.'));
    });

    wrap.append(
      group(L('Воронка', 'Шұңғыма', 'Funnel'), row(tapB, stopB)),
      group(L('Залить', 'Құю', 'Add'), row(waterB, mixB), row(bic(10), bic(15), brineB)),
      group(L('Промывка', 'Жуу', 'Washing'), row(shake(true), shake(false)), row(settleB)),
      group(L('Разделение слоёв', 'Қабаттарды бөлу', 'Separating the layers'), row(drain(false)), row(drain(true)), row(paperB)),
      group(L('Готово', 'Дайын', 'Finish'), row(finish(true), finish(false))),
    );
    if (F.paper != null) {
      const p = Math.round(F.paper);
      wrap.append(h('p', { class: 'note', html: tr(p >= 8 ? L(`Бумага сине-зелёная (pH ≈ ${p}): в водном слое избыток гидрокарбоната — кислота нейтрализована.`, `Қағаз көкшіл-жасыл (pH ≈ ${p}): сулы қабатта гидрокарбонат артық — қышқыл бейтараптанды.`, `The paper is blue-green (pH ≈ ${p}): excess bicarbonate in the aqueous layer — the acid is neutralised.`)
        : p <= 2 ? L(`Бумага красная (pH ≈ ${p}): водный слой сильнокислый (H₂SO₄, CH₃COOH).`, `Қағаз қызыл (pH ≈ ${p}): сулы қабат күшті қышқыл (H₂SO₄, CH₃COOH).`, `The paper is red (pH ≈ ${p}): the aqueous layer is strongly acidic (H₂SO₄, CH₃COOH).`)
          : L(`Бумага жёлто-оранжевая (pH ≈ ${p}): гидрокарбонат весь израсходован — кислота ещё есть, нужна следующая порция NaHCO₃.`, `Қағаз сары-қызғылт (pH ≈ ${p}): гидрокарбонат толық жұмсалды — қышқыл әлі бар, келесі NaHCO₃ порциясы керек.`, `The paper is yellow-orange (pH ≈ ${p}): all the bicarbonate was used up — acid remains, add another portion of NaHCO₃.`)) }));
    }
    const co2 = F.lastCO2;
    ctx.readouts([
      { label: L('Кран', 'Шүмек', 'Stopcock'), value: F.tap ? L('открыт', 'ашық', 'open') : L('закрыт', 'жабық', 'closed'), st: F.tap ? 'warn' : '' },
      { label: L('Пробка', 'Тығын', 'Stopper'), value: F.stopper ? L('закрыта', 'жабық', 'in') : L('снята', 'алынған', 'out') },
      { label: L('Эфирный слой', 'Эфир қабаты', 'Ester layer'), value: ml(F.org || F.prod) },
      { label: L('Водный слой', 'Сулы қабат', 'Aqueous layer'), value: ml(F.aq) },
      { label: 'CO₂', value: co2 == null ? '—' : co2 > 4 ? L('бурно', 'қарқынды', 'vigorous') : co2 > 0.5 ? L('слабо', 'әлсіз', 'weak') : L('нет', 'жоқ', 'none'), st: co2 != null && co2 <= 0.5 ? 'ok' : '' },
    ]);
    setTimeout(() => ctx.update());
    return wrap;
  },
  scene(step, ctx) { return funnelScene(ctx.local); },
  hints(step, ctx) {
    const F = ctx.local;
    const next = !F.nW ? L('Закройте кран и налейте 20 мл холодной воды, затем вылейте смесь.', 'Шүмекті жауып, 20 мл суық су құйыңыз, содан кейін қоспаны құйыңыз.', 'Close the stopcock and add 20 mL of cold water, then pour in the mixture.')
      : F.aq > 0 && !F.shaken ? L('Встряхните, переворачивая воронку и сбрасывая давление через кран.', 'Шұңғыманы аударып, қысымды шүмек арқылы шығарып шайқаңыз.', 'Shake, inverting the funnel and venting through the stopcock.')
        : F.aq > 0 && !F.settled ? L('Дайте слоям разделиться в кольце.', 'Қабаттардың сақинада бөлінуін күтіңіз.', 'Let the layers separate in the ring.')
          : F.aq > 0 ? L('Снимите пробку и слейте нижний водный слой. Эфир легче воды — он сверху.', 'Тығынды алып, төменгі сулы қабатты ағызыңыз. Эфир судан жеңіл — ол жоғарыда.', 'Remove the stopper and run off the lower aqueous layer. The ester is lighter than water — it is on top.')
            : F.lastCO2 == null || F.lastCO2 > 0.5 ? L('Промывайте порциями NaHCO₃, пока при встряхивании выделяется CO₂. Последняя порция не должна давать газа.', 'CO₂ бөлінгенше NaHCO₃ порцияларымен жуыңыз. Соңғы порция газ бермеуі тиіс.', 'Wash with NaHCO₃ portions while CO₂ is given off. The last portion should give no gas.')
              : !F.nS ? L('Газа больше нет — промойте 10 мл насыщенного NaCl.', 'Газ енді жоқ — 10 мл қаныққан NaCl-мен жуыңыз.', 'No more gas — wash with 10 mL of saturated NaCl.')
                : L('Перелейте эфир через горло воронки в сухую колбу.', 'Эфирді шұңғыма мойны арқылы құрғақ колбаға құйыңыз.', 'Pour the ester out through the neck into a dry flask.');
    return [
      L('Эфир (d ≈ 0,88 г/мл) легче воды — он всегда в верхнем слое. Нижний слой сливают через кран, верхний выливают через горло.', 'Эфир (d ≈ 0,88 г/мл) судан жеңіл — ол әрқашан жоғарғы қабатта. Төменгі қабатты шүмек арқылы ағызады, жоғарғысын мойны арқылы құяды.', 'The ester (d ≈ 0.88 g/mL) is lighter than water — it is always the upper layer. The lower layer is run off through the stopcock, the upper one poured out through the neck.'),
      next,
      funnelH3(F, ctx.state),
    ];
  },
};
