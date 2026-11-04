/**
 * lab12-polarimeter — измерение на круговом поляриметре с полутеневым полем (работа № 12).
 * Реализм: натриевая лампа (прогрев), выбор трубки 1 / 2 дм, ополаскивание трубки исследуемым раствором,
 * заполнение без пузырьков (выпуклый мениск, покровное стекло надвигают сбоку), осмотр трубки,
 * поворот анализатора до равенства яркости половин поля, отсчёт по нониусу (0,05°), несколько отсчётов.
 *
 * step: {
 *   liquid: 'water'|'std'|'unk'|'amine'|'sol'   что наливают (для проверки ополаскивания: S.pol.last)
 *   sample: {ru,kk,en}                           подпись
 *   color: 'var(--liquid)'                       цвет жидкости на сцене
 *   alpha(S, tube, lc) → °                       истинный угол вращения пробы (без нуля прибора)
 *   tubes: [1, 2], tube: 2                       доступные трубки и рекомендованная
 *   wrongTube: { severity, text }                замечание, если взята не рекомендованная трубка
 *   volume(S) → мл                               сколько жидкости есть (проверка вместимости трубки)
 *   readings: 3                                  сколько отсчётов нужно
 *   zero: true                                   шаг проверки нуля (дистиллированная вода)
 *   saveAs                                       S[saveAs] = { readings, mean, tube, bubble, dil }
 *   onFill(S, lc, ctx)                           последствия заполнения (например, неополоснутая трубка)
 *   onRecord(S, res, ctx)
 * }
 * Общее состояние прибора: S.pol = { zero (истинный нуль, °), lamp, last (что было в трубке), tube }.
 */
import { h } from '../../../app/dom.js';
import { L, tr, n, num } from '../../../app/i18n.js';
import { btn, row, group, seg } from '../../../app/ui/controls.js';
import { scene, text } from '../../../app/scene/svg.js';
import { fields, vernier } from '../../../app/instruments/polarimeter.js';
import { TUBE_VOL } from '../model.js';

const sg = (x, d = 2) => (x > 0.0049 ? '+' : '') + n(x, d);

const TX = {
  lamp: L('Сначала включите натриевую лампу — без неё поле зрения тёмное.', 'Алдымен натрий шамын қосыңыз — онсыз көру өрісі қараңғы.', 'Switch on the sodium lamp first — the field of view is dark without it.'),
  fill: L('Сначала заполните трубку.', 'Алдымен түтікті толтырыңыз.', 'Fill the tube first.'),
  bright: L('Обе половины поля яркие — это не та точка. Отсчёт берут при равной <b>полутени</b> (обе половины одинаково тусклые).', 'Өрістің екі жартысы да жарқын — бұл басқа нүкте. Есепті тең <b>жартылай көлеңкеде</b> алады (екі жартысы бірдей күңгірт).', 'Both halves are bright — that is the wrong position. Read at equal <b>half-shade</b> (both halves equally dim).'),
  unequal: L('Половины поля не одинаковы по яркости — доверните анализатор (точная ручка 0,05–0,1°).', 'Өріс жартылары жарықтығы бойынша бірдей емес — анализаторды бұраңыз (дәл бұрағыш 0,05–0,1°).', 'The two halves differ in brightness — keep turning the analyser (fine knob 0.05–0.1°).'),
};

function truth(step, ctx) {
  const S = ctx.state, lc = ctx.local;
  const a = step.zero ? 0 : step.alpha(S, lc.tube, lc);
  return S.pol.zero + a + (lc.bubble ? lc.bOff || 0 : 0) + (lc.jit || 0);
}

function polSVG(step, ctx) {
  const S = ctx.state, lc = ctx.local;
  const lamp = S.pol.lamp, filled = lc.filled;
  const tr1 = truth(step, ctx);
  let [a, b] = filled ? fields({ theta: lc.theta, alpha: tr1, filled: true }) : fields({ theta: lc.theta, alpha: S.pol.zero, filled: true });
  if (!lamp) { a = 0; b = 0; }
  const g = (v) => Math.round(28 + 205 * v);
  const half = (v) => `rgb(${g(v)},${g(v)},${Math.max(0, g(v) - 40)})`;
  const tl = lc.tube === 1 ? 80 : 150, tx = 116;
  const liq = filled ? `<rect x="${tx + 3}" y="129" width="${tl - 6}" height="14" rx="3" style="fill:${step.color || 'var(--liquid)'}"/>` : '';
  const bub = filled && lc.bubble ? `<ellipse cx="${tx + tl * 0.55}" cy="131.5" rx="7" ry="2.6" fill="var(--scene)" stroke="var(--glass)" stroke-width=".8"/>` : '';
  const shade = lamp && filled && lc.bubble ? '<path d="M262 70 Q276 52 300 50 L300 74 Q282 74 262 70 Z" fill="rgba(0,0,0,.45)"/><circle cx="314" cy="40" r="7" fill="rgba(0,0,0,.35)"/>' : '';
  return `<rect class="met" x="10" y="118" width="300" height="36" rx="8"/>
<circle cx="30" cy="136" r="15" fill="${lamp ? '#ffcf3d' : 'var(--metal-dark)'}" opacity="${lamp ? 0.95 : 1}"/>${lamp ? '<circle cx="30" cy="136" r="22" fill="#ffcf3d" opacity=".25"/>' : ''}
<rect class="metd" x="58" y="122" width="14" height="28" rx="3"/>${text(65, 172, L('поляризатор', 'поляризатор', 'polariser'))}
<rect class="gl" x="${tx}" y="126" width="${tl}" height="20" rx="5"/>${liq}${bub}<rect class="metd" x="${tx - 6}" y="124" width="7" height="24" rx="2"/><rect class="metd" x="${tx + tl - 1}" y="124" width="7" height="24" rx="2"/>
${text(tx + tl / 2, 116, lc.tube === 1 ? L('трубка 1 дм', 'түтік 1 дм', '1 dm tube') : L('трубка 2 дм', 'түтік 2 дм', '2 dm tube'))}
<circle cx="300" cy="136" r="20" class="metd"/><line x1="300" y1="136" x2="${(300 + 18 * Math.sin((lc.theta * Math.PI) / 180)).toFixed(1)}" y2="${(136 - 18 * Math.cos((lc.theta * Math.PI) / 180)).toFixed(1)}" stroke="var(--accent)" stroke-width="2"/>
${text(300, 172, L('анализатор', 'анализатор', 'analyser'))}
<circle cx="300" cy="58" r="44" fill="var(--metal-dark)"/>
<path d="M300 18 A40 40 0 0 0 300 98 Z" fill="${half(a)}"/><path d="M300 18 A40 40 0 0 1 300 98 Z" fill="${half(b)}"/>${shade}
<line x1="300" y1="18" x2="300" y2="98" stroke="rgba(0,0,0,.35)" stroke-width="1"/><circle cx="300" cy="58" r="40" fill="none" stroke="var(--glass)" stroke-width="2"/>
${text(232, 30, L('окуляр: поле зрения', 'окуляр: көру өрісі', 'eyepiece: field of view'), 'lbl', 'end')}
<rect class="scr" x="168" y="186" width="112" height="28" rx="4"/><text class="scrt" x="272" y="206" text-anchor="end">${num(vernier(lc.theta), 2)}°</text>${text(224, 228, L('шкала с нониусом', 'нониусы бар шкала', 'scale with vernier'))}
${text(30, 106, L(lamp ? 'Na-лампа' : 'лампа выкл.', lamp ? 'Na-шамы' : 'шам өшірулі', lamp ? 'Na lamp' : 'lamp off'))}`;
}

export default {
  type: 'lab12-polarimeter',
  init(step, ctx) {
    const S = ctx.state, lc = ctx.local;
    S.pol = S.pol || { zero: 0, lamp: false, last: null };
    lc.tube = (S.pol.tube && (step.tubes || [1, 2]).includes(S.pol.tube)) ? S.pol.tube : (step.tubes || [2])[0];
    if (step.tube && (step.tubes || []).includes(step.tube) && !S.pol.tube) lc.tube = step.tube;
    lc.theta = +(ctx.rng.range(-8, 8)).toFixed(2);
    lc.reads = []; lc.filled = false; lc.rinsed = false; lc.bubble = false; lc.seen = false; lc.jit = 0;
  },
  render(step, ctx) {
    const S = ctx.state, lc = ctx.local;
    const need = step.readings || (step.zero ? 1 : 3);
    const done = lc.reads.length >= need;
    const upd = () => {
      const ro = [{ label: L('Нониус', 'Нониус', 'Vernier'), value: num(vernier(lc.theta), 2) + '°' }];
      if (lc.reads.length) ro.push({ label: L('Отсчёты', 'Есептер', 'Readings'), value: lc.reads.map((r) => sg(r)).join('; ') + '°' });
      if (lc.reads.length > 1) ro.push({ label: L('Среднее', 'Орташа', 'Mean'), value: sg(lc.reads.reduce((a, x) => a + x, 0) / lc.reads.length) + '°', st: done ? 'ok' : '' });
      ctx.readouts(ro); ctx.update();
    };
    const act = (label, fn, on, cls = '') => { const b = btn(label, () => { if (fn() !== false) { ctx.save(); ctx.rerender(); } }, (on ? 'on ' : '') + cls); if (on) b.disabled = true; return b; };
    const out = [];
    // лампа
    out.push(group(L('Прибор', 'Құрал', 'Instrument'), row(act(L('Включить натриевую лампу (прогрев 10 мин)', 'Натрий шамын қосу (10 мин қыздыру)', 'Switch on the sodium lamp (10 min warm-up)'), () => {
      S.pol.lamp = true; ctx.advance(600);
      ctx.log(L('Включена натриевая лампа поляриметра (λ = 589 нм, D-линия), прогрев 10 мин', 'Поляриметрдің натрий шамы қосылды (λ = 589 нм, D-сызығы), 10 мин қыздыру', 'Polarimeter sodium lamp switched on (λ = 589 nm, D line), 10 min warm-up'));
    }, S.pol.lamp))));
    // трубка
    const tubes = step.tubes || [1, 2];
    if (tubes.length > 1) {
      const sb = seg(tubes.map((t) => [t, t === 1 ? L('1 дм', '1 дм', '1 dm') : L('2 дм', '2 дм', '2 dm')]), () => lc.tube, (v) => {
        if (lc.filled) { ctx.feedback(L('Трубка уже заполнена. Чтобы сменить трубку, слейте раствор.', 'Түтік толтырылған. Түтікті ауыстыру үшін ерітіндіні төгіңіз.', 'The tube is already filled. Empty it to change tubes.'), 'warn'); ctx.rerender(); return; }
        lc.tube = v; ctx.save(); ctx.update();
      }, L('Трубка', 'Түтік', 'Tube'));
      out.push(group(L('Трубка поляриметра', 'Поляриметр түтігі', 'Polarimeter tube'), sb));
    }
    // ополаскивание и заполнение
    const rinseL = step.zero ? L('Ополоснуть трубку дистиллированной водой', 'Түтікті дистилденген сумен шаю', 'Rinse the tube with distilled water') : L('Ополоснуть трубку 2–3 раза исследуемым раствором', 'Түтікті зерттелетін ерітіндімен 2–3 рет шаю', 'Rinse the tube 2–3 times with the sample');
    const fill = (careful) => () => {
      if (lc.filled) return false;
      if (step.volume) {
        const v = step.volume(S);
        if (v < TUBE_VOL[lc.tube] - 1e-9) { ctx.feedback(L(`Жидкости ${n(v, 2)} мл, а трубка ${lc.tube} дм вмещает ≈ ${n(TUBE_VOL[lc.tube], 1)} мл — её не заполнить без пузыря.`, `Сұйықтық ${n(v, 2)} мл, ал ${lc.tube} дм түтікке ≈ ${n(TUBE_VOL[lc.tube], 1)} мл сыяды — оны көпіршіксіз толтыру мүмкін емес.`, `There is ${n(v, 2)} mL of liquid but the ${lc.tube} dm tube holds ≈ ${n(TUBE_VOL[lc.tube], 1)} mL — it cannot be filled without a bubble.`), 'warn'); return false; }
      }
      if (step.tube && lc.tube !== step.tube && step.wrongTube) ctx.remark({ key: 'tube-' + ctx.stepIndex, severity: step.wrongTube.severity || 'minor', text: step.wrongTube.text });
      lc.dil = !lc.rinsed && S.pol.last != null && S.pol.last !== step.liquid;
      lc.filled = true; lc.how = careful ? 'c' : 'q'; S.pol.tube = lc.tube; S.pol.last = step.liquid;
      lc.bubble = careful ? false : ctx.rng.next() < 0.8;
      lc.bOff = (ctx.rng.next() < 0.5 ? -1 : 1) * ctx.rng.range(0.4, 0.9);
      ctx.advance(120);
      ctx.log(careful ? { ru: `Трубка ${lc.tube} дм заполнена (${tr(step.sample, 'ru')}) до выпуклого мениска, покровное стекло надвинуто сбоку, крышка завинчена без перетяжки`, kk: `${lc.tube} дм түтік (${tr(step.sample, 'kk')}) дөңес менискке дейін толтырылды, жабын шыны бүйірінен сырғытылды, қақпақ артық тартпай бұралды`, en: `${lc.tube} dm tube filled (${tr(step.sample, 'en')}) to a convex meniscus, cover glass slid on from the side, cap screwed on without overtightening` }
        : { ru: `Трубка ${lc.tube} дм заполнена (${tr(step.sample, 'ru')}) и быстро закрыта сверху`, kk: `${lc.tube} дм түтік (${tr(step.sample, 'kk')}) толтырылып, үстінен тез жабылды`, en: `${lc.tube} dm tube filled (${tr(step.sample, 'en')}) and quickly closed from the top` });
      if (step.onFill) step.onFill(S, lc, ctx);
      ctx.feedback(null);
    };
    const fillRow = row(
      act(rinseL, () => { if (lc.filled) return false; lc.rinsed = true; ctx.advance(90); ctx.log(step.zero ? L('Трубка ополоснута дистиллированной водой', 'Түтік дистилденген сумен шайылды', 'Tube rinsed with distilled water') : { ru: `Трубка ополоснута 2–3 раза пробой: ${tr(step.sample, 'ru')}`, kk: `Түтік сынамамен 2–3 рет шайылды: ${tr(step.sample, 'kk')}`, en: `Tube rinsed 2–3 times with the sample: ${tr(step.sample, 'en')}` }); }, lc.rinsed || lc.filled),
      act(L('Заполнить до выпуклого мениска, стекло надвинуть сбоку', 'Дөңес менискке дейін толтырып, шыныны бүйірінен сырғыту', 'Fill to a convex meniscus, slide the glass on from the side'), fill(true), lc.filled && lc.how !== 'q'),
      act(L('Заполнить и быстро закрыть сверху', 'Толтырып, үстінен тез жабу', 'Fill and quickly close from the top'), fill(false), lc.filled && lc.how === 'q'),
    );
    const inspect = act(L('Посмотреть вдоль трубки на свет', 'Түтікті бойлай жарыққа қарау', 'Look along the tube against the light'), () => {
      if (!lc.filled) { ctx.feedback(TX.fill, 'warn'); return false; }
      lc.seen = true; ctx.advance(20);
      if (lc.bubble) {
        ctx.log(L('В трубке виден пузырёк воздуха на пути луча', 'Түтікте сәуле жолында ауа көпіршігі көрінеді', 'An air bubble is visible in the light path'), 'obs');
        ctx.feedback(L('В трубке пузырёк воздуха: он рассеивает свет, поле зрения неравномерно затемнено, отсчёты «гуляют». Удалите пузырёк.', 'Түтікте ауа көпіршігі: ол жарықты шашыратады, көру өрісі біркелкі емес күңгірттенген, есептер «ауытқиды». Көпіршікті кетіріңіз.', 'There is an air bubble in the tube: it scatters the light, the field is unevenly darkened and the readings wander. Remove the bubble.'), 'warn');
      } else {
        ctx.log(L('Трубка заполнена без пузырьков, раствор прозрачный', 'Түтік көпіршіксіз толтырылған, ерітінді мөлдір', 'Tube filled without bubbles, the solution is clear'), 'obs');
        ctx.feedback(L('Пузырьков нет, раствор прозрачный. Поместите трубку в прибор и ищите равенство полей.', 'Көпіршік жоқ, ерітінді мөлдір. Түтікті құралға салып, өрістердің теңдігін іздеңіз.', 'No bubbles, the solution is clear. Put the tube in the instrument and look for equal fields.'), 'good');
      }
    }, false);
    const debub = lc.filled && lc.bubble && lc.seen ? act(L('Удалить пузырёк: долить раствор, закрыть заново', 'Көпіршікті кетіру: ерітінді құйып, қайта жабу', 'Remove the bubble: top up and close again'), () => {
      lc.bubble = false; ctx.advance(60);
      ctx.log(L('Пузырёк удалён: трубка долита до выпуклого мениска и закрыта заново', 'Көпіршік кетірілді: түтік дөңес менискке дейін толтырылып, қайта жабылды', 'Bubble removed: tube topped up to a convex meniscus and closed again'));
      ctx.feedback(null);
    }, false, 'pri') : null;
    out.push(group(L('Заполнение трубки', 'Түтікті толтыру', 'Filling the tube'), fillRow, row(inspect, debub)));
    // анализатор
    const rot = (d) => btn((d > 0 ? '+' : '−') + num(Math.abs(d), Math.abs(d) >= 1 ? 0 : Math.abs(d) >= 0.1 ? 1 : 2) + '°', () => { if (done) return; lc.theta = +(lc.theta + d).toFixed(2); ctx.save(); upd(); }, 'sm');
    out.push(group(L('Анализатор: грубо / точно', 'Анализатор: шамамен / дәл', 'Analyser: coarse / fine'), row(rot(-5), rot(-1), rot(-0.1), rot(-0.05), rot(0.05), rot(0.1), rot(1), rot(5))));
    const rec = btn(L('Поля равны — записать отсчёт', 'Өрістер тең — есепті жазу', 'Fields equal — record the reading'), () => {
      if (done) return;
      if (!S.pol.lamp) { ctx.feedback(TX.lamp, 'warn'); return; }
      if (!lc.filled) { ctx.feedback(TX.fill, 'warn'); return; }
      const t0 = truth(step, ctx), r = vernier(lc.theta);
      let d = ((r - t0) % 180 + 180) % 180; if (d > 90) d -= 180;
      if (Math.abs(d) > (step.tol ?? 0.1) + 1e-9) {
        ctx.remark({ key: 'pol-' + ctx.stepIndex, severity: 'minor', points: 0.5, text: L('отсчёт снят при неравных полях', 'есеп өрістер тең емес кезде алынды', 'reading taken with unequal half-fields') });
        ctx.feedback(Math.abs(d) > 45 ? TX.bright : TX.unequal, 'bad'); ctx.save(); return;
      }
      if (lc.bubble) ctx.remark({ key: 'bub-' + ctx.stepIndex, severity: 'major', text: L('отсчёты сняты с пузырьком воздуха в трубке — значения неточны', 'есептер түтікте ауа көпіршігі бар кезде алынды — мәндер дәл емес', 'readings taken with an air bubble in the tube — the values are unreliable'),
        whatif: L('Пузырёк рассеивает и частично перекрывает луч: поле неравномерно, глаз «ловит» равенство в разных местах, отсчёты расходятся на 0,5–1°. Удельное вращение получится с большой погрешностью.', 'Көпіршік сәулені шашыратып, ішінара жабады: өріс біркелкі емес, көз теңдікті әр жерде «ұстайды», есептер 0,5–1°-қа алшақтайды. Меншікті айналу үлкен қателікпен шығады.', 'The bubble scatters and partly blocks the beam: the field is uneven, the eye “finds” equality in different places and the readings differ by 0.5–1°. The specific rotation will carry a large error.') });
      lc.reads.push(r);
      ctx.advance(40);
      ctx.log({ ru: `${tr(step.sample, 'ru')}, трубка ${lc.tube} дм: отсчёт ${lc.reads.length} — ${sg(r)}°`, kk: `${tr(step.sample, 'kk')}, ${lc.tube} дм түтік: ${lc.reads.length}-есеп — ${sg(r)}°`, en: `${tr(step.sample, 'en')}, ${lc.tube} dm tube: reading ${lc.reads.length} — ${sg(r)}°` }, 'obs');
      if (lc.reads.length < need) {
        // отвести анализатор и найти равенство снова; небольшая случайная составляющая отсчёта
        lc.theta = +(lc.theta + (ctx.rng.next() < 0.5 ? -1 : 1) * ctx.rng.range(2, 6)).toFixed(2);
        lc.jit = +(ctx.rng.normal(0, 0.03)).toFixed(3);
        if (lc.bubble) lc.bOff = (ctx.rng.next() < 0.5 ? -1 : 1) * ctx.rng.range(0.3, 1.0);
        ctx.feedback(L(`Отсчёт ${lc.reads.length} из ${need} записан. Отведите анализатор и снова найдите равенство полей.`, `${need} есептің ${lc.reads.length}-сі жазылды. Анализаторды бұрып, өрістердің теңдігін қайта табыңыз.`, `Reading ${lc.reads.length} of ${need} recorded. Turn the analyser away and find equal fields again.`), 'info');
      } else {
        const m = lc.reads.reduce((a, x) => a + x, 0) / lc.reads.length;
        const res = { readings: lc.reads.slice(), mean: +m.toFixed(3), tube: lc.tube, bubble: !!lc.bubble, dil: !!lc.dil };
        if (step.saveAs) S[step.saveAs] = res;
        if (need > 1) ctx.log({ ru: `Среднее: ${sg(m, 2)}°`, kk: `Орташа: ${sg(m, 2)}°`, en: `Mean: ${sg(m, 2)}°` }, 'calc');
        if (step.onRecord) step.onRecord(S, res, ctx);
        ctx.solve(step.zero ? L(`Нуль прибора: ${sg(m, 2)}°. Эту поправку вычитают из всех отсчётов.`, `Құрал нөлі: ${sg(m, 2)}°. Бұл түзетуді барлық есептерден шегереді.`, `Instrument zero: ${sg(m, 2)}°. This correction is subtracted from every reading.`)
          : L(`Записано ${need} отсчёта, среднее ${sg(m, 2)}°.`, `${need} есеп жазылды, орташасы ${sg(m, 2)}°.`, `${need} readings recorded, mean ${sg(m, 2)}°.`));
      }
      ctx.save(); ctx.rerender();
    }, 'pri');
    if (done) rec.disabled = true;
    out.push(row(rec));
    setTimeout(upd);
    return h('div', { class: 'wfull' }, ...out);
  },
  scene(step, ctx) { return scene(polSVG(step, ctx), L('Круговой поляриметр', 'Дөңгелек поляриметр', 'Circular polarimeter')); },
  hints(step, ctx) {
    const lc = ctx.local, S = ctx.state;
    let t0 = 0; try { t0 = truth(step, ctx); } catch (e) { /* нет данных */ }
    return [
      !S.pol || !S.pol.lamp ? L('Порядок: лампа → ополоснуть трубку → заполнить без пузырьков → осмотреть → искать равенство полей.', 'Рет: шам → түтікті шаю → көпіршіксіз толтыру → тексеру → өрістер теңдігін іздеу.', 'Order: lamp → rinse the tube → fill without bubbles → inspect → find equal fields.')
        : !lc.filled ? L('Трубку сначала ополаскивают исследуемым раствором, затем заполняют до выпуклого мениска и надвигают покровное стекло сбоку — так не остаётся пузырьков.', 'Түтікті алдымен зерттелетін ерітіндімен шаяды, содан кейін дөңес менискке дейін толтырып, жабын шыныны бүйірінен сырғытады — сонда көпіршік қалмайды.', 'First rinse the tube with the sample, then fill to a convex meniscus and slide the cover glass on from the side — that leaves no bubbles.')
          : L('Ищите положение, где обе половины поля одинаково тусклые (полутень). Если одна половина темнеет, а другая светлеет — вы рядом.', 'Өрістің екі жартысы бірдей күңгірт болатын жағдайды іздеңіз (жартылай көлеңке). Бір жартысы қараңғыланып, екіншісі жарықтанса — жақынсыз.', 'Look for the position where both halves are equally dim (half-shade). If one half darkens while the other brightens, you are close.'),
      L('Грубо — шагом 1–5°, точно — 0,05–0,1°. Если поле целиком яркое, вы на 90° от нужной точки. Пузырёк в трубке — удалите до отсчёта.', 'Шамамен — 1–5° қадаммен, дәл — 0,05–0,1°. Өріс толық жарқын болса, қажетті нүктеден 90°-та тұрсыз. Түтіктегі көпіршікті есепке дейін кетіріңіз.', 'Coarse steps of 1–5°, fine steps of 0.05–0.1°. If the whole field is bright you are 90° away. Remove any bubble before reading.'),
      planHint(step, ctx, t0),
    ];
  },
};

/* Подсказка 3: конкретная последовательность кнопок (её же выполняет бот tests/e2e).
 * Уже выполненные отсчёты остаются в начале списка, план поворота анализатора для текущего отсчёта
 * пересчитывается от текущего положения — так префикс списка не меняется между вызовами. */
const LBL = {
  lamp: L('Включить натриевую лампу (прогрев 10 мин)', 'Натрий шамын қосу (10 мин қыздыру)', 'Switch on the sodium lamp (10 min warm-up)'),
  rinseW: L('Ополоснуть трубку дистиллированной водой', 'Түтікті дистилденген сумен шаю', 'Rinse the tube with distilled water'),
  rinseS: L('Ополоснуть трубку 2–3 раза исследуемым раствором', 'Түтікті зерттелетін ерітіндімен 2–3 рет шаю', 'Rinse the tube 2–3 times with the sample'),
  fill: L('Заполнить до выпуклого мениска, стекло надвинуть сбоку', 'Дөңес менискке дейін толтырып, шыныны бүйірінен сырғыту', 'Fill to a convex meniscus, slide the glass on from the side'),
  look: L('Посмотреть вдоль трубки на свет', 'Түтікті бойлай жарыққа қарау', 'Look along the tube against the light'),
  debub: L('Удалить пузырёк: долить раствор, закрыть заново', 'Көпіршікті кетіру: ерітінді құйып, қайта жабу', 'Remove the bubble: top up and close again'),
  rec: L('Поля равны — записать отсчёт', 'Өрістер тең — есепті жазу', 'Fields equal — record the reading'),
};
const q = (x, l) => `«${typeof x === 'string' ? x : x[l]}»`;
function rotPlan(theta, t0) {
  let d = ((t0 - theta) % 180 + 180) % 180; if (d > 90) d -= 180;
  const s = d < 0 ? -1 : 1; let a = Math.abs(d); const out = [];
  for (const st of [5, 1, 0.1, 0.05]) {
    const k = st === 0.05 ? Math.round(a / st + 1e-9) : Math.floor(a / st + 1e-9);
    a = +(a - k * st).toFixed(4);
    if (k > 0) out.push([k, s * st]);
  }
  return out;
}
const rotLabel = (v, l) => (v > 0 ? '+' : '−') + num(Math.abs(v), Math.abs(v) >= 1 ? 0 : Math.abs(v) >= 0.1 ? 1 : 2, l) + '°';
function planHint(step, ctx, t0) {
  const lc = ctx.local;
  if (!lc.reads) return L('Равенство полей ищут поворотом анализатора.', 'Өрістер теңдігін анализаторды бұрау арқылы іздейді.', 'Equal fields are found by turning the analyser.');
  lc.hdone = lc.hdone || [];
  const key = `${lc.reads.length}|${lc.filled ? 1 : 0}|${lc.bubble ? 1 : 0}`;
  if (lc.hplan && lc.hplan.n < lc.reads.length && lc.hdone.length < lc.reads.length) lc.hdone.push(lc.hplan.rot);
  if (!lc.hplan || lc.hplan.key !== key) lc.hplan = { key, n: lc.reads.length, rot: rotPlan(lc.theta, t0) };
  const out = {};
  for (const l of ['ru', 'kk', 'en']) {
    const parts = [q(LBL.lamp, l)];
    if (step.tube && (step.tubes || []).length > 1) parts.push(q(step.tube === 1 ? L('1 дм', '1 дм', '1 dm') : L('2 дм', '2 дм', '2 dm'), l));
    parts.push(q(step.zero ? LBL.rinseW : LBL.rinseS, l), q(LBL.fill, l), q(LBL.look, l));
    if (lc.bubble) parts.push(q(LBL.debub, l));
    const segs = [...lc.hdone, ...(lc.reads.length < (step.readings || 1) ? [lc.hplan.rot] : [])];
    for (const rot of segs) { for (const [k, v] of rot) parts.push(`${k} × ${q(rotLabel(v, l), l)}`); parts.push(q(LBL.rec, l)); }
    const tail = { ru: `Равенство полей — около ${num(t0, 1, 'ru')}° по шкале.`, kk: `Өрістер теңдігі — шкала бойынша шамамен ${num(t0, 1, 'kk')}°.`, en: `The fields match at about ${num(t0, 1, 'en')}° on the scale.` }[l];
    out[l] = { ru: 'Порядок: ', kk: 'Рет: ', en: 'Sequence: ' }[l] + parts.join(' → ') + '. ' + tail;
  }
  return out;
}
