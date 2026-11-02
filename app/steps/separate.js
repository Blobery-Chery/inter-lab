/**
 * separate — разделение фаз.
 * mode 'filter' — фильтрование под вакуумом (Бюхнер + Бунзен), как в эталоне:
 *   фильтр → смочить → вакуум → перенести суспензию → промыть (выбор жидкости) → проверить промывные воды →
 *   что оставить (осадок/фильтрат) → отсоединить шланг, затем выключить насос.
 *   step: { keep:'cake'|'filtrate', liquids:[{ id, label, ok, severity, points, remark, whatif, effect(state, local) }],
 *           washings(state, local) → pH промывных вод | null, onTransfer, onWash(state, local, liquid), onFinish(state, local, ctx),
 *           finishCheck(state, local, ctx) — замечания по итогам (недомыто, перемыто), product: {…} подпись продукта, minWashes=1 }
 *   Вылить продукт в отходы (неверный выбор «что оставить») — critical: опыт перезапускается с контрольной точки.
 * mode 'funnel' — делительная воронка: кран закрыт → залить → пробка → встряхнуть с выпуском паров → отстоять →
 *   снять пробку → слить нижний слой → что оставить.
 *   step: { layers:[{ id, label, color, frac, product }] (снизу вверх), keep: id слоя с продуктом, onFinish(state, local, ctx) }
 */
import { h } from '../dom.js';
import { tr, L } from '../i18n.js';
import { btn, row, group, grid, whatif } from '../ui/controls.js';
import { scene, vacuumFilter, sepFunnel, beaker, text } from '../scene/svg.js';
import { stripHTML, pHread, pHcolor } from '../instruments/indicator.js';
import { T } from './_common.js';

const W = {
  noPaper: L('Без фильтра осадок уйдёт в колбу Бунзена.', 'Сүзгісіз тұнба Бунзен колбасына кетеді.', 'Without filter paper the solid goes straight into the flask.'),
  noVac: L('суспензию вылили на фильтр без вакуума — фильтр сдвинулся, часть осадка ушла в фильтрат', 'суспензия сүзгіге вакуумсыз құйылды — сүзгі жылжып, тұнбаның бір бөлігі фильтратқа кетті', 'suspension poured on without vacuum — the paper shifted and some solid went into the filtrate'),
  noWet: L('фильтр не смочен — неплотное прилегание, мелкие частицы проходят', 'сүзгі ылғалданбаған — тығыз жабыспайды, ұсақ бөлшектер өтіп кетеді', 'filter paper not wetted — it does not seal and fine particles pass through'),
  suck: L('насос выключен при подсоединённом шланге — вода засосана в колбу Бунзена', 'шланг жалғаулы тұрғанда сорғы өшірілді — су Бунзен колбасына сорылды', 'pump switched off with the hose connected — water was sucked back into the filter flask'),
};

function filterRender(step, ctx) {
  const { local, state } = ctx;
  const F = local;
  const wrap = h('div', { class: 'wfull' });
  const upd = () => {
    const ro = [
      { label: L('Вакуум', 'Вакуум', 'Vacuum'), value: F.vac ? L('вкл.', 'қосулы', 'on') : L('выкл.', 'өшірулі', 'off'), st: F.vac ? 'ok' : '' },
      { label: L('Промывок', 'Жуу саны', 'Washes'), value: String(F.washes) },
    ];
    if (step.washings) ro.push({ label: L('Последняя проба', 'Соңғы сынама', 'Last test'), value: F.lastPH != null ? 'pH ≈ ' + pHread(F.lastPH) : '—', st: F.lastPH != null && F.lastPH >= (step.okPH ?? 2.5) ? 'ok' : '' });
    ctx.readouts(ro); ctx.update();
  };
  const a = (label, fn, on) => { const b = btn(label, () => { fn(); ctx.save(); ctx.rerender(); }, on ? 'on' : ''); if (on) b.disabled = true; return b; };
  const ended = F.end;
  const paperB = a(L('Положить фильтр', 'Сүзгіні салу', 'Insert the filter paper'), () => { F.paper = true; ctx.log(L('Бумажный фильтр уложен в воронку Бюхнера', 'Қағаз сүзгі Бюхнер шұңғымасына салынды', 'Filter paper placed in the Büchner funnel')); ctx.advance(20); }, F.paper);
  const wetB = a(L('Смочить фильтр водой', 'Сүзгіні сумен ылғалдау', 'Wet the filter paper'), () => { if (!F.paper) { ctx.feedback(L('Сначала положите фильтр.', 'Алдымен сүзгіні салыңыз.', 'Insert the filter paper first.'), 'warn'); return; } F.wet = true; ctx.advance(15); }, F.wet);
  const vacB = a(L('Включить вакуум', 'Вакуумды қосу', 'Switch on the vacuum'), () => { if (step.onVacuum && !step.onVacuum(state, F, ctx)) return; F.vac = true; ctx.log(L('Включён водоструйный насос', 'Су ағынды сорғы қосылды', 'Water aspirator switched on')); }, F.vac);
  const moveB = a(step.transferLabel || L('Перенести суспензию на фильтр', 'Суспензияны сүзгіге ауыстыру', 'Pour the suspension onto the filter'), () => {
    if (!F.paper) { ctx.feedback(W.noPaper, 'bad'); return; }
    if (!F.vac) { ctx.remark({ key: 'f-vac-' + ctx.stepIndex, severity: 'minor', points: 0.5, text: W.noVac }); F.loss += 0.03; }
    if (!F.wet) { ctx.remark({ key: 'f-wet-' + ctx.stepIndex, severity: 'minor', points: 0.5, text: W.noWet }); F.loss += 0.02; }
    F.moved = true; ctx.advance(240);
    if (step.onTransfer) step.onTransfer(state, F, ctx);
    ctx.log(step.transferObs || L('Осадок отфильтрован, остатки смыты из стакана фильтратом', 'Тұнба сүзілді, стақандағы қалдықтар фильтратпен шайылды', 'Solid filtered off, the beaker rinsed out with the filtrate'), 'obs');
  }, F.moved);
  const washBtns = (step.liquids || []).map((liq) => btn(liq.label, () => {
    if (!F.moved) { ctx.feedback(L('Сначала перенесите осадок на фильтр.', 'Алдымен тұнбаны сүзгіге ауыстырыңыз.', 'Transfer the solid onto the filter first.'), 'warn'); return; }
    if (F.end) return;
    if (!liq.ok) {
      ctx.remark({ key: 'f-liq-' + liq.id, severity: liq.severity || 'major', points: liq.points, text: liq.remark || liq.label, whatif: liq.whatif });
      F.whatif = liq.id;
    }
    F.washes++; ctx.advance(90);
    if (!F.vac) F.loss += 0.01;
    if (liq.effect) liq.effect(state, F, ctx);
    if (step.onWash) step.onWash(state, F, liq, ctx);
    ctx.log({ ru: `Промывка ${F.washes}: ${tr(liq.label, 'ru')}`, kk: `${F.washes}-жуу: ${tr(liq.label, 'kk')}`, en: `Wash ${F.washes}: ${tr(liq.label, 'en')}` });
    ctx.save(); ctx.rerender();
  }));
  const testB = btn(L('Проверить промывные воды', 'Жуынды суды тексеру', 'Test the washings'), () => {
    if (!F.moved) { ctx.feedback(L('Пока нечего проверять.', 'Әзірге тексеретін ештеңе жоқ.', 'Nothing to test yet.'), 'warn'); return; }
    const p = step.washings(state, F); F.lastPH = p; F.lastCheck = F.washes;
    const r = pHread(p);
    ctx.log({ ru: `Промывные воды после ${F.washes}-й промывки: индикаторная бумага — pH ≈ ${r}`, kk: `${F.washes}-жуудан кейінгі жуынды су: индикатор қағазы — pH ≈ ${r}`, en: `Washings after wash ${F.washes}: indicator paper — pH ≈ ${r}` }, 'obs');
    ctx.feedback(step.washFeedback ? step.washFeedback(p) : stripHTML(p, tr), r >= (step.okPH ?? 2.5) ? 'good' : 'info');
    ctx.save(); ctx.rerender();
  });
  const keepBox = grid(
    btn(step.keepCakeLabel || L('Продукт — осадок на фильтре; фильтрат — в отходы', 'Өнім — сүзгідегі тұнба; фильтрат — қалдыққа', 'Product = the solid on the filter; filtrate to waste'), () => keep('cake'), F.kept === 'cake' ? 'on' : ''),
    btn(step.keepFiltrateLabel || L('Продукт — фильтрат; осадок выбросить', 'Өнім — фильтрат; тұнбаны тастау', 'Product = the filtrate; discard the solid'), () => keep('filtrate'), F.kept === 'filtrate' ? 'on' : ''),
  );
  function keep(k) {
    if (!F.moved) { ctx.feedback(L('Сначала отфильтруйте.', 'Алдымен сүзіңіз.', 'Filter first.'), 'warn'); return; }
    if (F.kept) return;
    if (F.washes < (step.minWashes ?? 1)) { ctx.feedback(L('Промойте осадок хотя бы один раз.', 'Тұнбаны кемінде бір рет жуыңыз.', 'Wash the solid at least once.'), 'warn'); return; }
    if (k !== (step.keep || 'cake')) {
      ctx.remark({ key: 'f-keep-' + ctx.stepIndex, severity: 'critical', text: L('продукт вылит в отходы вместе с ненужной фазой', 'өнім қажетсіз фазамен бірге қалдыққа төгілді', 'the product was thrown away with the unwanted phase'), critical: step.keepCritical || { text: L('Продукт ушёл в контейнер для отходов. Вернуть его нельзя — синтез приходится повторять. В реальной лаборатории это потеря нескольких часов работы и реактивов.', 'Өнім қалдық ыдысына кетті. Оны қайтару мүмкін емес — синтезді қайталауға тура келеді. Нақты зертханада бұл бірнеше сағаттық жұмыс пен реактивтердің жоғалуы.', 'The product went into the waste container. It cannot be recovered — the synthesis has to be repeated. In a real lab that means several hours of work and reagents lost.') } });
      return;
    }
    F.kept = k;
    ctx.log(L('Фильтрат слит в ёмкость для кислотных отходов; осадок оставлен на фильтре', 'Фильтрат қышқыл қалдықтар ыдысына құйылды; тұнба сүзгіде қалдырылды', 'Filtrate poured into the acid waste; the solid is kept on the filter'));
    ctx.save(); ctx.rerender();
  }
  const endA = btn(L('Отсоединить шланг, затем выключить насос', 'Шлангты ажыратып, содан кейін сорғыны өшіру', 'Disconnect the hose, then switch off the pump'), () => finish(true));
  const endB = btn(L('Выключить насос', 'Сорғыны өшіру', 'Switch off the pump'), () => finish(false));
  function finish(right) {
    if (!F.moved || F.washes < (step.minWashes ?? 1)) { ctx.feedback(L('Промойте осадок хотя бы один раз.', 'Тұнбаны кемінде бір рет жуыңыз.', 'Wash the solid at least once.'), 'warn'); return; }
    if (!F.kept) { ctx.feedback(L('Решите, что оставить: осадок или фильтрат.', 'Не қалдыратыныңызды шешіңіз: тұнба ма, фильтрат па.', 'Decide what to keep: the solid or the filtrate.'), 'warn'); return; }
    if (F.end) return;
    if (!F.vac) { ctx.feedback(L('Насос и так выключен.', 'Сорғы онсыз да өшірулі.', 'The pump is already off.'), 'info'); }
    F.end = true; F.vac = false;
    if (!right) { F.suck = true; ctx.remark({ key: 'f-suck-' + ctx.stepIndex, severity: 'minor', points: 0.5, text: W.suck }); ctx.log(L('Вода из насоса засосана в колбу Бунзена', 'Сорғыдағы су Бунзен колбасына сорылды', 'Water from the aspirator sucked back into the filter flask'), 'obs'); }
    if (step.finishCheck) step.finishCheck(state, F, ctx);
    if (step.onFinish) step.onFinish(state, F, ctx);
    ctx.solve(step.doneText || L('Осадок отфильтрован и промыт.', 'Тұнба сүзіліп, жуылды.', 'The solid is filtered and washed.'));
    ctx.save(); ctx.rerender();
  }
  if (ended) [endA, endB, testB, ...washBtns].forEach((b) => (b.disabled = true));
  if (F.kept) keepBox.querySelectorAll('button').forEach((b) => (b.disabled = true));
  wrap.append(
    group(L('Сборка', 'Жинау', 'Set-up'), row(paperB, wetB, vacB)),
    group(L('Фильтрование', 'Сүзу', 'Filtration'), row(moveB)),
    group(L('Промывание на фильтре', 'Сүзгіде жуу', 'Washing on the filter'), row(...washBtns, step.washings ? testB : null)),
    group(L('Что оставить', 'Нені қалдыру керек', 'What to keep'), keepBox),
    group(L('Завершение', 'Аяқтау', 'Finishing'), row(endA, endB)),
  );
  const wi = (step.liquids || []).find((l) => l.id === F.whatif);
  if (wi && wi.whatif) wrap.append(whatif({ ru: tr(T.whatIf, 'ru') + ' — ' + tr(wi.label, 'ru'), kk: tr(T.whatIf, 'kk') + ' — ' + tr(wi.label, 'kk'), en: tr(T.whatIf, 'en') + ' — ' + tr(wi.label, 'en') }, wi.whatif));
  setTimeout(upd);
  return wrap;
}

function funnelRender(step, ctx) {
  const { local: F, state } = ctx;
  const wrap = h('div', { class: 'wfull' });
  const a = (label, fn, on, cls = '') => { const b = btn(label, () => { fn(); ctx.save(); ctx.rerender(); }, (on ? 'on ' : '') + cls); if (on) b.disabled = true; return b; };
  const W2 = {
    open: L('кран делительной воронки был открыт при заливке — часть смеси вытекла', 'құю кезінде бөлгіш шұңғыманың шүмегі ашық болды — қоспаның бір бөлігі ағып кетті', 'the stopcock was open while filling — some of the mixture ran out'),
    vent: L('воронку встряхивали, не выпуская пары — давление выбило пробку', 'шұңғыма буын шығармай шайқалды — қысым тығынды атып шығарды', 'the funnel was shaken without venting — the pressure blew out the stopper'),
  };
  const fillB = a(L('Залить смесь в воронку', 'Қоспаны шұңғымаға құю', 'Pour the mixture into the funnel'), () => {
    if (F.tapOpen) { ctx.remark({ key: 'sf-open', severity: 'major', text: W2.open }); F.loss += 0.15; }
    F.filled = true; ctx.advance(60); ctx.log(L('Смесь залита в делительную воронку', 'Қоспа бөлгіш шұңғымаға құйылды', 'Mixture poured into the separating funnel'));
  }, F.filled);
  const tapB = a(F.tapOpen ? L('Закрыть кран', 'Шүмекті жабу', 'Close the stopcock') : L('Открыть кран', 'Шүмекті ашу', 'Open the stopcock'), () => {
    F.tapOpen = !F.tapOpen;
    if (F.tapOpen && F.settled && !F.drained) {
      if (F.stopper) { ctx.feedback(L('Жидкость не вытекает: пробка закрыта, в воронке разрежение. Снимите пробку.', 'Сұйықтық ақпайды: тығын жабық, шұңғымада сиреу бар. Тығынды алыңыз.', 'Nothing flows: the stopper is in and there is a vacuum inside. Remove the stopper.'), 'warn'); F.tapOpen = false; return; }
      F.drained = true; ctx.advance(120);
      ctx.log({ ru: 'Нижний слой слит: ' + tr(step.layers[0].label, 'ru'), kk: 'Төменгі қабат ағызылды: ' + tr(step.layers[0].label, 'kk'), en: 'Lower layer run off: ' + tr(step.layers[0].label, 'en') }, 'obs');
      F.tapOpen = false;
    }
  });
  const stopB = a(F.stopper ? L('Снять пробку', 'Тығынды алу', 'Remove the stopper') : L('Закрыть пробкой', 'Тығынмен жабу', 'Insert the stopper'), () => { F.stopper = !F.stopper; });
  const shake = (vent) => a(vent ? L('Встряхнуть, выпуская пары через кран', 'Шүмек арқылы буды шығарып шайқау', 'Shake, venting through the stopcock') : L('Энергично встряхнуть', 'Қатты шайқау', 'Shake vigorously'), () => {
    if (!F.filled) { ctx.feedback(L('Воронка пуста.', 'Шұңғыма бос.', 'The funnel is empty.'), 'warn'); return; }
    if (!F.stopper) { ctx.feedback(L('Закройте воронку пробкой, иначе смесь выплеснется.', 'Шұңғыманы тығынмен жабыңыз, әйтпесе қоспа шашырайды.', 'Insert the stopper or the mixture will splash out.'), 'warn'); return; }
    if (!vent) { ctx.remark({ key: 'sf-vent', severity: 'safety', text: W2.vent }); F.loss += 0.05; }
    F.shaken = true; F.settled = false; ctx.advance(90);
  });
  const settleB = a(L('Закрепить в кольце и дать отстояться', 'Сақинаға бекітіп, тұндыру', 'Clamp in the ring and let it settle'), () => { if (!F.shaken) { ctx.feedback(L('Сначала встряхните смесь.', 'Алдымен қоспаны шайқаңыз.', 'Shake the mixture first.'), 'warn'); return; } F.settled = true; ctx.advance(300); ctx.log(L('Слои разделились, граница чёткая', 'Қабаттар бөлінді, шекарасы анық', 'The layers have separated with a sharp boundary'), 'obs'); }, F.settled);
  const keepBox = grid(...step.layers.map((l) => btn({ ru: 'Оставить: ' + tr(l.label, 'ru'), kk: 'Қалдыру: ' + tr(l.label, 'kk'), en: 'Keep: ' + tr(l.label, 'en') }, () => {
    if (!F.drained) { ctx.feedback(L('Сначала разделите слои.', 'Алдымен қабаттарды бөліңіз.', 'Separate the layers first.'), 'warn'); return; }
    if (F.kept) return;
    if (l.id !== step.keep) {
      ctx.remark({ key: 'sf-keep', severity: step.wrongKeepSeverity || 'critical', text: L('слой с продуктом вылит в отходы', 'өнімі бар қабат қалдыққа төгілді', 'the layer containing the product was thrown away'), critical: { text: L('Слой с продуктом ушёл в отходы — его не вернуть. Экстракцию (и синтез) приходится повторять.', 'Өнімі бар қабат қалдыққа кетті — оны қайтару мүмкін емес. Экстракцияны (және синтезді) қайталауға тура келеді.', 'The product layer went to waste and cannot be recovered. The extraction (and the synthesis) must be repeated.') } });
      return;
    }
    F.kept = l.id;
    ctx.log({ ru: 'Оставлен слой: ' + tr(l.label, 'ru'), kk: 'Қалдырылған қабат: ' + tr(l.label, 'kk'), en: 'Layer kept: ' + tr(l.label, 'en') });
    if (step.onFinish) step.onFinish(state, F, ctx);
    ctx.solve(L('Слои разделены.', 'Қабаттар бөлінді.', 'The layers are separated.'));
    ctx.save(); ctx.rerender();
  }, F.kept === l.id ? 'on' : '')));
  ctx.readouts([
    { label: L('Кран', 'Шүмек', 'Stopcock'), value: F.tapOpen ? L('открыт', 'ашық', 'open') : L('закрыт', 'жабық', 'closed') },
    { label: L('Пробка', 'Тығын', 'Stopper'), value: F.stopper ? L('закрыта', 'жабық', 'in') : L('снята', 'алынған', 'out') },
  ]);
  wrap.append(group(L('Делительная воронка', 'Бөлгіш шұңғыма', 'Separating funnel'), row(tapB, fillB, stopB)), group(L('Экстракция', 'Экстракция', 'Extraction'), row(shake(true), shake(false), settleB)), group(L('Что оставить', 'Нені қалдыру керек', 'What to keep'), keepBox));
  setTimeout(() => ctx.update());
  return wrap;
}

export default {
  type: 'separate',
  init(step, ctx) { Object.assign(ctx.local, { washes: 0, loss: 0, lastPH: null }); },
  render(step, ctx) { return step.mode === 'funnel' ? funnelRender(step, ctx) : filterRender(step, ctx); },
  scene(step, ctx) {
    const F = ctx.local;
    if (step.mode === 'funnel') {
      const layers = F.filled ? (F.settled || F.drained ? step.layers.map((l, i) => ({ frac: i === 0 && F.drained ? 0 : l.frac, color: l.color })) : [{ frac: step.layers.reduce((a, l) => a + l.frac, 0), color: 'var(--liquid)' }]) : [];
      return scene(sepFunnel({ cx: 180, top: 30, layers }) + beaker({ id: 'rcv', x: 150, y: 196, w: 60, hh: 34, frac: F.drained ? 0.6 : 0, color: step.layers[0].color }));
    }
    const cake = F.moved ? 1 : 0;
    return scene(vacuumFilter({ paper: F.paper, vac: F.vac, cake, filtrate: Math.min(1, (F.moved ? 0.45 : 0) + F.washes * 0.06 + (F.suck ? 0.25 : 0)), cakeColor: step.cakeColor ? step.cakeColor(ctx.state) : null, seal: step.seal ? step.seal(ctx.state) : true }) + (step.washings ? `<rect x="30" y="146" width="16" height="60" rx="2" fill="${F.lastPH != null ? pHcolor(F.lastPH) : 'var(--panel)'}" stroke="var(--line)"/>` : '') + (step.washings ? text(38, 220, L('инд. бумага', 'инд. қағаз', 'pH paper')) : ''));
  },
  hints(step, ctx) {
    const F = ctx.local;
    if (step.mode === 'funnel') return [
      L('Кран закрыт → залить → пробка → встряхнуть, выпуская пары → отстоять → снять пробку → слить нижний слой.', 'Шүмек жабық → құю → тығын → буды шығарып шайқау → тұндыру → тығынды алу → төменгі қабатты ағызу.', 'Stopcock closed → fill → stopper → shake with venting → settle → remove stopper → run off the lower layer.'),
      L('Какой слой нижний — решает плотность. Где находится продукт?', 'Қай қабат төменде екенін тығыздық шешеді. Өнім қайда?', 'Density decides which layer is lower. Where is the product?'),
      { ru: 'Продукт в слое: ' + tr(step.layers.find((l) => l.id === step.keep).label, 'ru'), kk: 'Өнім мына қабатта: ' + tr(step.layers.find((l) => l.id === step.keep).label, 'kk'), en: 'The product is in: ' + tr(step.layers.find((l) => l.id === step.keep).label, 'en') },
    ];
    return [
      L('Порядок: фильтр → смочить → вакуум → перенести осадок → промыть → проверить промывные воды.', 'Рет: сүзгі → ылғалдау → вакуум → тұнбаны ауыстыру → жуу → жуынды суды тексеру.', 'Order: filter paper → wet it → vacuum → transfer the solid → wash → test the washings.'),
      !F.moved ? L('Включите вакуум и смочите фильтр до переноса суспензии.', 'Суспензияны ауыстырмас бұрын вакуумды қосып, сүзгіні ылғалдаңыз.', 'Switch on the vacuum and wet the paper before pouring the suspension.')
        : L('Промывайте малыми порциями ледяной воды и проверяйте промывные воды индикаторной бумагой. Перед выключением насоса — отсоедините шланг.', 'Мұздай судың аз порцияларымен жуып, жуынды суды индикатор қағазымен тексеріңіз. Сорғыны өшірмес бұрын шлангты ажыратыңыз.', 'Wash with small portions of ice-cold water and test the washings with indicator paper. Disconnect the hose before switching off the pump.'),
      step.hint3 || ((step.keep || 'cake') === 'cake'
        ? L('Продукт — осадок на фильтре, фильтрат — в отходы. В конце: сначала отсоединить шланг, потом выключить насос.', 'Өнім — сүзгідегі тұнба, фильтрат — қалдыққа. Соңында: алдымен шлангты ажырату, содан кейін сорғыны өшіру.', 'The product is the solid on the filter; the filtrate goes to waste. At the end: disconnect the hose first, then switch off the pump.')
        : L('Продукт — в фильтрате, осадок — в отходы. В конце: сначала отсоединить шланг, потом выключить насос.', 'Өнім — фильтратта, тұнба — қалдыққа. Соңында: алдымен шлангты ажырату, содан кейін сорғыны өшіру.', 'The product is in the filtrate; the solid goes to waste. At the end: disconnect the hose first, then switch off the pump.')),
    ];
  },
};
