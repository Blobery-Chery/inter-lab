/**
 * lab13-rotor — шаростержневая модель: вращение вокруг одинарной связи C–C (этан, бутан) или попытка вращения вокруг C=C
 * (малеиновая → фумаровая кислота).
 * step: {
 *   mol: 'ethane' | 'butane' | 'double'
 *   start: 30                                 начальный двугранный угол φ, °
 *   targets: [{ id, label, log }]             конформации, которые надо найти и «зарисовать» (id из model.conformerOf)
 *   names: [{ id, label }]                    варианты названий для записи (могут быть лишние)
 *   question: { q, options, correct, why }    для mol 'double' — вывод после опыта с моделью
 *   onDone(state, local, ctx)
 * }
 * Состояние — только в ctx.local: phi, rec {id: φ}, theta, pi, tries, qm.
 */
import { h } from '../../../app/dom.js';
import { tr, L, n } from '../../../app/i18n.js';
import { btn, row, group, range } from '../../../app/ui/controls.js';
import { questionBlock } from '../../../app/steps/_common.js';
import { conformerOf, ethaneE, butaneE, norm360, angDiff } from '../model.js';
import { rotorScene, maleicScene } from '../scene.js';

const kJ = (e) => ({ ru: n(e, 1) + ' кДж/моль', kk: n(e, 1) + ' кДж/моль', en: n(e, 1) + ' kJ/mol' });

function singleRender(step, ctx) {
  const { local } = ctx;
  const E = step.mol === 'ethane' ? ethaneE : butaneE;
  const wrap = h('div', { class: 'wfull' });
  const upd = () => {
    ctx.readouts([
      { label: step.mol === 'ethane' ? L('Угол H–C–C–H', 'H–C–C–H бұрышы', 'H–C–C–H angle') : L('Угол CH₃–C–C–CH₃', 'CH₃–C–C–CH₃ бұрышы', 'CH₃–C–C–CH₃ angle'), value: Math.round(norm360(local.phi)) + '°' },
      { label: L('Энергия (мол. механика)', 'Энергия (мол. механика)', 'Energy (mol. mechanics)'), value: kJ(E(local.phi)) },
      { label: L('Зарисовано', 'Сызылды', 'Drawn'), value: `${Object.keys(local.rec).length} / ${step.targets.length}`, st: Object.keys(local.rec).length === step.targets.length ? 'ok' : '' },
    ]);
    ctx.update();
  };
  const turn = (d) => btn((d > 0 ? '+' : '−') + Math.abs(d) + '°', () => { if (ctx.solved()) return; local.phi = norm360(local.phi + d); local.turns = (local.turns || 0) + 1; ctx.advance(5); ctx.save(); ctx.rerender(); }, 'sm');
  const rg = range({ min: 0, max: 355, step: 5, value: Math.round(norm360(local.phi) / 5) * 5 % 360, unit: '°', label: L('Двугранный угол', 'Екіжақты бұрыш', 'Dihedral angle'), oninput: (v) => { if (ctx.solved()) return; local.phi = v; local.turns = (local.turns || 0) + 1; upd(); ctx.save(); } });
  wrap.append(group(L('Поворот заднего атома углерода', 'Артқы көміртек атомын бұру', 'Turn the rear carbon atom'), row(turn(-60), turn(-10), turn(-5), turn(5), turn(10), turn(60)), rg));
  const rec = (nm) => btn({ ru: 'Зарисовать как: ' + tr(nm.label, 'ru'), kk: 'Былай сызу: ' + tr(nm.label, 'kk'), en: 'Draw as: ' + tr(nm.label, 'en') }, () => {
    if (ctx.solved()) return;
    const truth = conformerOf(step.mol, local.phi);
    if (!truth) {
      ctx.feedback(L('Это промежуточное (скошенное) положение — не заслонённая и не заторможенная конформация. Поверните модель до положения, где связи точно совпадают или расположены точно между друг другом.', 'Бұл аралық (қиғаш) күй — көмкерілген де, тежелген де конформация емес. Модельді байланыстар дәл беттесетін немесе дәл арасында орналасатын күйге дейін бұраңыз.', 'This is an intermediate (skew) position — neither eclipsed nor staggered. Turn the model until the bonds exactly overlap or lie exactly between each other.'), 'warn');
      return;
    }
    if (truth !== nm.id) {
      ctx.remark({ key: `rot-${ctx.stepIndex}`, severity: 'minor', points: 0.5, text: L('неверно названа конформация на модели', 'модельдегі конформация қате аталды', 'conformation on the model named incorrectly') });
      ctx.feedback({ ru: `Неверно: при φ = ${Math.round(norm360(local.phi))}° это не «${tr(nm.label, 'ru')}». Посмотрите на проекцию Ньюмена: совпадают ли связи переднего и заднего атомов?`, kk: `Қате: φ = ${Math.round(norm360(local.phi))}° кезінде бұл «${tr(nm.label, 'kk')}» емес. Ньюмен проекциясына қараңыз: алдыңғы және артқы атомдардың байланыстары беттесе ме?`, en: `Wrong: at φ = ${Math.round(norm360(local.phi))}° this is not “${tr(nm.label, 'en')}”. Look at the Newman projection: do the front and rear bonds overlap?` }, 'bad');
      ctx.save();
      return;
    }
    if (!step.targets.some((t) => t.id === truth)) { ctx.feedback(L('Эта конформация в задании не требуется.', 'Бұл конформация тапсырмада қажет емес.', 'This conformation is not required in the task.'), 'info'); return; }
    if (local.rec[truth] != null) { ctx.feedback(L('Эта конформация уже зарисована — найдите следующую.', 'Бұл конформация сызылды — келесісін табыңыз.', 'This one is already drawn — find the next one.'), 'info'); return; }
    local.rec[truth] = Math.round(norm360(local.phi));
    const tg = step.targets.find((t) => t.id === truth);
    ctx.advance(180);
    ctx.log({ ru: `Проекция Ньюмена зарисована: ${tr(tg.label, 'ru')}, φ = ${local.rec[truth]}°, E ≈ ${n(E(local.phi), 1)} кДж/моль${tg.log ? ' — ' + tr(tg.log, 'ru') : ''}`, kk: `Ньюмен проекциясы сызылды: ${tr(tg.label, 'kk')}, φ = ${local.rec[truth]}°, E ≈ ${n(E(local.phi), 1)} кДж/моль${tg.log ? ' — ' + tr(tg.log, 'kk') : ''}`, en: `Newman projection drawn: ${tr(tg.label, 'en')}, φ = ${local.rec[truth]}°, E ≈ ${n(E(local.phi), 1)} kJ/mol${tg.log ? ' — ' + tr(tg.log, 'en') : ''}` }, 'obs');
    ctx.feedback(null);
    if (step.targets.every((t) => local.rec[t.id] != null)) {
      ctx.state[step.saveAs || ('conf_' + step.mol)] = { ...local.rec };
      if (step.onDone) step.onDone(ctx.state, local, ctx);
      ctx.solve(step.doneText || L('Все конформации найдены и зарисованы.', 'Барлық конформациялар табылып, сызылды.', 'All conformations found and drawn.'));
    }
    ctx.save(); ctx.rerender();
  });
  const recBtns = step.names.map(rec);
  if (ctx.solved()) recBtns.forEach((b) => (b.disabled = true));
  wrap.append(group(L('Зарисовать проекцию Ньюмена в журнал', 'Ньюмен проекциясын журналға сызу', 'Draw the Newman projection in the notebook'), h('div', { class: 'check' }, ...recBtns)));
  if (Object.keys(local.rec).length) wrap.append(h('p', { class: 'note', html: tr({ ru: 'Зарисовано: ', kk: 'Сызылды: ', en: 'Drawn: ' }) + step.targets.filter((t) => local.rec[t.id] != null).map((t) => `${tr(t.label)} (${local.rec[t.id]}°)`).join('; ') }));
  setTimeout(upd);
  return wrap;
}

function doubleRender(step, ctx) {
  const { local } = ctx;
  const wrap = h('div', { class: 'wfull' });
  const t = norm360(local.theta);
  const upd = () => {
    ctx.readouts([
      { label: L('Поворот вокруг C=C', 'C=C бойынша бұру', 'Turn about C=C'), value: Math.round(t) + '°' },
      { label: L('π-связь', 'π-байланыс', 'π-bond'), value: local.pi ? L('замкнута', 'тұйық', 'closed') : L('разомкнута', 'ажыратылған', 'opened'), st: local.pi ? 'ok' : 'warn' },
      { label: L('Модель', 'Модель', 'Model'), value: t < 10 || t > 350 ? L('малеиновая', 'малеин', 'maleic') : angDiff(t, 180) < 10 ? L('фумаровая', 'фумар', 'fumaric') : '—' },
    ]);
    ctx.update();
  };
  const turnB = btn(L('Повернуть правый атом C на 30°', 'Оң жақ C атомын 30°-қа бұру', 'Turn the right-hand C atom by 30°'), () => {
    if (ctx.solved()) return;
    if (local.pi) {
      local.tries = (local.tries || 0) + 1; local.strain = 1;
      ctx.advance(30);
      if (local.tries === 1) ctx.log(L('Попытка повернуть модель вокруг двойной связи: обе «пружины» π-связи изгибаются, и модель возвращается в исходное положение', 'Модельді қос байланыс бойынша бұру әрекеті: π-байланыстың екі «серіппесі» де иіліп, модель бастапқы күйіне оралады', 'Attempt to turn the model about the double bond: both “springs” of the π-bond bend and the model springs back'), 'obs');
      ctx.feedback(L('Модель не поворачивается: вторая связь (π) удерживает атомы в одной плоскости. Вращение вокруг C=C без её разрыва невозможно.', 'Модель бұрылмайды: екінші (π) байланыс атомдарды бір жазықтықта ұстайды. C=C бойынша оны үзбей айналу мүмкін емес.', 'The model will not turn: the second (π) bond holds the atoms in one plane. Rotation about C=C is impossible without breaking it.'), 'warn');
      ctx.timeout(700, () => { local.strain = 0; ctx.update(); });
      ctx.save(); ctx.rerender();
      return;
    }
    local.theta = norm360(local.theta + 30); ctx.advance(20);
    if (angDiff(local.theta, 180) < 1) ctx.log(L('После поворота на 180° группы COOH оказались по разные стороны от оси связи', '180°-қа бұрғаннан кейін COOH топтары байланыс осінің екі жағында орналасты', 'After a 180° turn the COOH groups are on opposite sides of the bond axis'), 'obs');
    ctx.save(); ctx.rerender();
  });
  const piB = btn(local.pi ? L('Разомкнуть π-связь (снять одну «пружину»)', 'π-байланысты ажырату (бір «серіппені» алу)', 'Open the π-bond (remove one “spring”)') : L('Замкнуть π-связь', 'π-байланысты тұйықтау', 'Close the π-bond'), () => {
    if (ctx.solved()) return;
    if (local.pi) {
      if (!local.tries) { ctx.feedback(L('Сначала попробуйте повернуть модель, не разбирая её.', 'Алдымен модельді бөлшектемей бұрап көріңіз.', 'First try to turn the model without taking it apart.'), 'warn'); return; }
      local.pi = false; ctx.advance(30);
      ctx.log(L('Одна из «пружин» двойной связи снята — модель соответствует разрыву π-связи; теперь вращение вокруг C–C свободно', 'Қос байланыстың бір «серіппесі» алынды — модель π-байланыстың үзілуіне сәйкес; енді C–C бойынша айналу еркін', 'One “spring” of the double bond removed — the model corresponds to breaking the π-bond; rotation about C–C is now free'));
    } else {
      if (!(t < 1 || t > 359 || angDiff(t, 180) < 1)) { ctx.feedback(L('π-связь можно замкнуть, только когда p-орбитали параллельны — при 0° или 180°.', 'π-байланысты тек p-орбитальдар параллель болғанда — 0° немесе 180° кезінде тұйықтауға болады.', 'The π-bond can be closed only when the p orbitals are parallel — at 0° or 180°.'), 'warn'); return; }
      local.pi = true; ctx.advance(30);
      const fum = angDiff(t, 180) < 1;
      ctx.log(fum ? L('π-связь замкнута: получена модель фумаровой (E) кислоты — другой конфигурации', 'π-байланыс тұйықталды: фумар (E) қышқылының моделі алынды — басқа конфигурация', 'π-bond closed: the model is now fumaric (E) acid — a different configuration')
        : L('π-связь замкнута в исходном положении — снова малеиновая кислота', 'π-байланыс бастапқы күйде тұйықталды — қайтадан малеин қышқылы', 'π-bond closed in the original position — maleic acid again'), 'obs');
      if (fum) local.fum = true;
    }
    ctx.feedback(null); ctx.save(); ctx.rerender();
  }, local.pi ? '' : 'on');
  if (ctx.solved()) { turnB.disabled = true; piB.disabled = true; }
  wrap.append(group(L('Модель', 'Модель', 'Model'), row(turnB, piB)));
  if (local.fum && local.pi && step.question) {
    wrap.append(questionBlock({
      ...step.question,
      onWrong: () => { ctx.remark({ key: `rot-q-${ctx.stepIndex}`, severity: 'minor', points: 0.5, text: L('неверный вывод из опыта с моделями малеиновой и фумаровой кислот', 'малеин және фумар қышқылдары модельдерімен тәжірибеден қате қорытынды', 'wrong conclusion from the maleic/fumaric acid models') }); ctx.save(); },
      onRight: () => { ctx.log(step.question.log || step.question.options[step.question.correct], 'obs'); ctx.state.doubleDone = true; ctx.solve(); ctx.save(); ctx.rerender(); },
    }, local.qm, ctx.rng));
  }
  setTimeout(upd);
  return wrap;
}

export default {
  type: 'lab13-rotor',
  init(step, ctx) {
    const L0 = ctx.local;
    if (step.mol === 'double') { L0.theta = 0; L0.pi = true; L0.tries = 0; L0.strain = 0; L0.qm = {}; L0.fum = false; }
    else { L0.phi = step.start ?? 30; L0.rec = {}; }
  },
  render(step, ctx) { return step.mol === 'double' ? doubleRender(step, ctx) : singleRender(step, ctx); },
  scene(step, ctx) {
    const lc = ctx.local;
    if (step.mol === 'double') return maleicScene({ theta: lc.theta, pi: lc.pi, strain: lc.strain ? 10 : 0 });
    return rotorScene({ mol: step.mol, phi: lc.phi, marks: Object.values(lc.rec || {}) });
  },
  hints(step, ctx) {
    const lc = ctx.local;
    if (step.mol === 'double') return [
      L('Двойная связь — это σ- и π-связь. В модели π-связь изображают второй (изогнутой) связью-«пружиной».', 'Қос байланыс — σ- және π-байланыс. Модельде π-байланысты екінші (иілген) «серіппе» байланысымен көрсетеді.', 'A double bond is a σ- plus a π-bond. In the model the π-bond is the second, bent “spring”.'),
      L('Попробуйте повернуть модель, затем разомкните π-связь, поверните на 180° и замкните снова.', 'Модельді бұрап көріңіз, содан кейін π-байланысты ажыратып, 180°-қа бұрап, қайта тұйықтаңыз.', 'Try to turn the model, then open the π-bond, turn by 180° and close it again.'),
      L('Малеиновая и фумаровая кислоты — цис-транс-изомеры (диастереомеры): переход одной в другую требует разрыва π-связи, поэтому это разные конфигурации, а не конформации.', 'Малеин және фумар қышқылдары — цис-транс-изомерлер (диастереомерлер): біреуінің екіншісіне өтуі π-байланыстың үзілуін талап етеді, сондықтан бұл конформация емес, әртүрлі конфигурациялар.', 'Maleic and fumaric acids are cis–trans isomers (diastereomers): converting one into the other requires breaking the π-bond, so they are different configurations, not conformations.'),
    ];
    const left = step.targets.filter((t) => !(lc.rec || {})[t.id]);
    const ang = step.mol === 'ethane' ? { staggered: 60, eclipsed: 0 } : { anti: 180, gauche: 60, eclipsed: 120, syn: 0 };
    return [
      L('Вращайте задний атом и следите за проекцией Ньюмена: связи совпадают — заслонённая конформация, расположены точно между — заторможенная.', 'Артқы атомды бұрап, Ньюмен проекциясын қадағалаңыз: байланыстар беттессе — көмкерілген конформация, дәл арасында болса — тежелген.', 'Turn the rear atom and watch the Newman projection: bonds overlapping — eclipsed; exactly in between — staggered.'),
      step.mol === 'butane' ? L('Для бутана важен угол между метильными группами: 180° — анти, 60° — гош, 120° — заслонённая (CH₃ против H), 0° — полностью заслонённая (CH₃ против CH₃).', 'Бутан үшін метил топтары арасындағы бұрыш маңызды: 180° — анти, 60° — гош, 120° — көмкерілген (CH₃ H-қа қарсы), 0° — толық көмкерілген (CH₃ CH₃-ке қарсы).', 'For butane the angle between the methyl groups matters: 180° anti, 60° gauche, 120° eclipsed (CH₃ facing H), 0° fully eclipsed (CH₃ facing CH₃).')
        : L('Заторможенные конформации этана — при 60°, 180°, 300°; заслонённые — при 0°, 120°, 240°.', 'Этанның тежелген конформациялары — 60°, 180°, 300°; көмкерілгендері — 0°, 120°, 240°.', 'Ethane is staggered at 60°, 180°, 300° and eclipsed at 0°, 120°, 240°.'),
      left.length ? { ru: `Поверните модель до φ = ${ang[left[0].id]}° и нажмите «Зарисовать как: ${tr(left[0].label, 'ru')}».`, kk: `Модельді φ = ${ang[left[0].id]}°-қа бұрап, «Былай сызу: ${tr(left[0].label, 'kk')}» басыңыз.`, en: `Turn the model to φ = ${ang[left[0].id]}° and press “Draw as: ${tr(left[0].label, 'en')}”.` } : L('Все конформации зарисованы.', 'Барлық конформациялар сызылды.', 'All conformations are drawn.'),
    ];
  },
};
