/**
 * lab13-chair — модель циклогексана.
 * step.mode:
 *   'bonds'  — найти на модели кресла аксиальные и экваториальные связи (6 вопросов, после 3-го — инверсия цикла);
 *   'forms'  — сравнить кресло и ванну (обе формы надо посмотреть), затем step.question;
 *   'methyl' — CH₃ у C1 аксиально и экваториально, 1,3-диаксиальные взаимодействия, step.questions (по порядку).
 * Состояние — в ctx.local.
 */
import { h } from '../../../app/dom.js';
import { tr, L } from '../../../app/i18n.js';
import { btn, row, group } from '../../../app/ui/controls.js';
import { questionBlock } from '../../../app/steps/_common.js';
import { chairScene } from '../scene.js';

const KIND = { ax: L('аксиальная', 'аксиалды', 'axial'), eq: L('экваториальная', 'экваториалды', 'equatorial') };
/** Тип связи после инверсии цикла меняется: ax ↔ eq. */
const kindNow = (q, flip) => (flip ? (q.kind === 'ax' ? 'eq' : 'ax') : q.kind);

function bondsRender(step, ctx) {
  const { local } = ctx;
  const wrap = h('div', { class: 'wfull' });
  const q = local.qs[local.k];
  ctx.readouts([{ label: L('Определено связей', 'Анықталған байланыстар', 'Bonds identified'), value: `${local.k} / ${local.qs.length}`, st: local.k >= local.qs.length ? 'ok' : '' }]);
  if (q) {
    wrap.append(h('p', { class: 'qq', html: tr({ ru: `Связь у атома <b>C${q.i + 1}</b>, выделенная на модели, — аксиальная или экваториальная?`, kk: `Модельде белгіленген <b>C${q.i + 1}</b> атомындағы байланыс — аксиалды ма, экваториалды ма?`, en: `The bond at <b>C${q.i + 1}</b> highlighted on the model — axial or equatorial?` }) }));
    const ans = (k) => btn(KIND[k], () => {
      if (kindNow(q, local.flip) === k) {
        local.k++;
        ctx.feedback(L('Верно.', 'Дұрыс.', 'Correct.'), 'good');
        if (local.k === 3 && !local.flip) {
          local.flip = true; ctx.advance(60);
          ctx.log(L('Модель переведена во второе кресло (инверсия цикла): все аксиальные связи стали экваториальными и наоборот', 'Модель екінші креслоға ауыстырылды (циклдің инверсиясы): барлық аксиалды байланыстар экваториалды болды және керісінше', 'The model was flipped into the other chair (ring inversion): every axial bond became equatorial and vice versa'), 'obs');
          ctx.feedback(L('Верно. Теперь модель перевёрнута в другое кресло — проверьте, что стало с теми же связями.', 'Дұрыс. Енді модель басқа креслоға аударылды — сол байланыстарға не болғанын тексеріңіз.', 'Correct. Now the model has been flipped into the other chair — check what happened to the same bonds.'), 'info');
        }
        if (local.k >= local.qs.length) {
          ctx.advance(300);
          ctx.log(L('На модели кресла найдены аксиальные связи (параллельны оси цикла, по одной у каждого атома C, чередуются вверх–вниз) и экваториальные (направлены наружу, примерно в «плоскости» цикла); при инверсии цикла аксиальные и экваториальные положения меняются местами', 'Кресло моделінде аксиалды байланыстар (цикл осіне параллель, әр C атомында біреуден, жоғары–төмен кезектеседі) және экваториалды байланыстар (сыртқа, шамамен цикл «жазықтығында») табылды; цикл инверсиясында аксиалды және экваториалды күйлер орын ауыстырады', 'Axial bonds (parallel to the ring axis, one on each carbon, alternating up and down) and equatorial bonds (pointing outwards, roughly in the “plane” of the ring) found on the chair model; on ring inversion axial and equatorial positions interchange'), 'obs');
          ctx.solve(L('Все связи определены верно.', 'Барлық байланыс дұрыс анықталды.', 'All bonds identified correctly.'));
        }
      } else {
        ctx.remark({ key: `chair-b-${ctx.stepIndex}`, severity: 'minor', points: 0.5, text: L('перепутаны аксиальная и экваториальная связи на модели циклогексана', 'циклогексан моделінде аксиалды және экваториалды байланыстар шатастырылды', 'axial and equatorial bonds confused on the cyclohexane model') });
        ctx.feedback(L('Неверно. Аксиальные связи параллельны оси цикла (строго вверх или вниз), экваториальные — направлены наружу.', 'Қате. Аксиалды байланыстар цикл осіне параллель (тура жоғары не төмен), экваториалдылар — сыртқа бағытталған.', 'Wrong. Axial bonds are parallel to the ring axis (straight up or down); equatorial bonds point outwards.'), 'bad');
      }
      ctx.save(); ctx.rerender();
    });
    wrap.append(row(ans('ax'), ans('eq')));
  }
  return wrap;
}

function formsRender(step, ctx) {
  const { local } = ctx;
  const wrap = h('div', { class: 'wfull' });
  const set = (f) => btn(f === 'chair' ? L('Форма «кресло»', '«Кресло» пішіні', 'Chair form') : L('Форма «ванна»', '«Ванна» пішіні', 'Boat form'), () => {
    if (local.form === f) return;
    local.form = f; local.seen[f] = true; ctx.advance(60);
    ctx.log(f === 'boat' ? L('Модель переведена в форму «ванна»: связи C2–C3 и C5–C6 заслонены, флагштоковые атомы H у C1 и C4 сближены', 'Модель «ванна» пішініне ауыстырылды: C2–C3 және C5–C6 байланыстары көмкерілген, C1 мен C4-тегі флагшток H атомдары жақындасқан', 'Model changed into the boat: the C2–C3 and C5–C6 bonds are eclipsed and the flagpole H atoms at C1 and C4 are close together')
      : L('Модель возвращена в форму «кресло»: все связи C–C заторможены', 'Модель «кресло» пішініне қайтарылды: барлық C–C байланыстары тежелген', 'Model returned to the chair: all C–C bonds are staggered'), 'obs');
    ctx.save(); ctx.rerender();
  }, local.form === f ? 'on' : '');
  wrap.append(group(L('Модель', 'Модель', 'Model'), row(set('chair'), set('boat'))));
  ctx.readouts([
    { label: L('Форма', 'Пішін', 'Form'), value: local.form === 'boat' ? L('ванна', 'ванна', 'boat') : L('кресло', 'кресло', 'chair') },
    { label: L('Энергия (мол. механика)', 'Энергия (мол. механика)', 'Energy (mol. mechanics)'), value: local.form === 'boat' ? L('≈ 29 кДж/моль', '≈ 29 кДж/моль', '≈ 29 kJ/mol') : L('0 (минимум)', '0 (минимум)', '0 (minimum)') },
  ]);
  if (local.seen.chair && local.seen.boat) {
    wrap.append(questionBlock({
      ...step.question,
      onWrong: () => { ctx.remark({ key: `chair-f-${ctx.stepIndex}`, severity: 'minor', points: 0.5, text: L('неверный вывод о сравнении кресла и ванны', 'кресло мен ваннаны салыстыру туралы қате қорытынды', 'wrong conclusion comparing the chair and the boat') }); ctx.save(); },
      onRight: () => { ctx.log(step.question.log, 'obs'); ctx.solve(); ctx.save(); },
    }, local.qm, ctx.rng));
  } else wrap.append(h('p', { class: 'note', html: tr(L('Посмотрите обе формы на модели.', 'Модельде екі пішінді де қараңыз.', 'Look at both forms on the model.')) }));
  return wrap;
}

function methylRender(step, ctx) {
  const { local } = ctx;
  const wrap = h('div', { class: 'wfull' });
  const put = (pos) => btn(pos === 'ax' ? L('CH₃ у C1 — аксиально', 'C1-дегі CH₃ — аксиалды', 'CH₃ at C1 — axial') : L('CH₃ у C1 — экваториально', 'C1-дегі CH₃ — экваториалды', 'CH₃ at C1 — equatorial'), () => {
    if (local.me === pos) return;
    local.me = pos; local.seen[pos] = true; ctx.advance(60);
    ctx.log(pos === 'ax' ? L('Метильная группа поставлена в аксиальное положение у C1: она сближена с аксиальными атомами H у C3 и C5 (два 1,3-диаксиальных взаимодействия)', 'Метил тобы C1-де аксиалды күйге қойылды: ол C3 және C5-тегі аксиалды H атомдарымен жақындасқан (екі 1,3-диаксиалды әрекеттесу)', 'The methyl group placed axial at C1: it is close to the axial H atoms at C3 and C5 (two 1,3-diaxial interactions)')
      : L('Метильная группа в экваториальном положении у C1: направлена наружу, 1,3-диаксиальных взаимодействий нет', 'Метил тобы C1-де экваториалды күйде: сыртқа бағытталған, 1,3-диаксиалды әрекеттесу жоқ', 'The methyl group equatorial at C1: it points outwards; no 1,3-diaxial interactions'), 'obs');
    ctx.save(); ctx.rerender();
  }, local.me === pos ? 'on' : '');
  const flipB = btn(L('Инверсия цикла (другое кресло)', 'Цикл инверсиясы (басқа кресло)', 'Ring flip (other chair)'), () => {
    if (!local.me) { ctx.feedback(L('Сначала поставьте метильную группу.', 'Алдымен метил тобын қойыңыз.', 'Place the methyl group first.'), 'warn'); return; }
    local.me = local.me === 'ax' ? 'eq' : 'ax'; local.seen[local.me] = true; local.flipped = true; ctx.advance(30);
    ctx.log({ ru: 'Инверсия цикла: CH₃ перешла в ' + (local.me === 'ax' ? 'аксиальное' : 'экваториальное') + ' положение', kk: 'Цикл инверсиясы: CH₃ ' + (local.me === 'ax' ? 'аксиалды' : 'экваториалды') + ' күйге өтті', en: 'Ring flip: CH₃ moved to the ' + (local.me === 'ax' ? 'axial' : 'equatorial') + ' position' });
    ctx.save(); ctx.rerender();
  });
  wrap.append(group(L('Метилциклогексан', 'Метилциклогексан', 'Methylcyclohexane'), row(put('ax'), put('eq'), flipB)));
  ctx.readouts([
    { label: L('CH₃', 'CH₃', 'CH₃'), value: local.me ? KIND[local.me] : '—' },
    { label: L('1,3-диакс. взаимодействий', '1,3-диакс. әрекеттесу', '1,3-diaxial contacts'), value: local.me === 'ax' ? '2 (CH₃…H)' : local.me ? '0' : '—', st: local.me === 'ax' ? 'warn' : local.me ? 'ok' : '' },
  ]);
  if (local.seen.ax && local.seen.eq && local.flipped) {
    step.questions.forEach((q, i) => {
      if (i > 0 && local.qm[i - 1].right == null) return;
      wrap.append(questionBlock({
        ...q,
        onWrong: () => { ctx.remark({ key: `chair-m-${ctx.stepIndex}-${i}`, severity: 'minor', points: 0.5, text: { ru: 'ошибка в ответе: «' + tr(q.q, 'ru') + '»', kk: 'жауаптағы қате: «' + tr(q.q, 'kk') + '»', en: 'wrong answer: “' + tr(q.q, 'en') + '”' } }); ctx.save(); },
        onRight: () => {
          if (q.log) ctx.log(q.log, 'obs');
          if (step.questions.every((_, j) => local.qm[j].right != null)) ctx.solve();
          ctx.save(); ctx.rerender();
        },
      }, local.qm[i], ctx.rng));
    });
  } else wrap.append(h('p', { class: 'note', html: tr(L('Поставьте CH₃ аксиально и экваториально и выполните инверсию цикла.', 'CH₃-ті аксиалды және экваториалды қойып, цикл инверсиясын орындаңыз.', 'Place CH₃ axial and equatorial and carry out a ring flip.')) }));
  return wrap;
}

export default {
  type: 'lab13-chair',
  init(step, ctx) {
    const lc = ctx.local;
    if (step.mode === 'bonds') {
      const idx = ctx.rng.shuffle([0, 1, 2, 3, 4, 5]);
      const kinds = ctx.rng.shuffle(['ax', 'ax', 'ax', 'eq', 'eq', 'eq']);
      lc.qs = idx.map((i, k) => ({ i, kind: kinds[k] })); lc.k = 0; lc.flip = false;
    } else if (step.mode === 'forms') { lc.form = 'chair'; lc.seen = { chair: true, boat: false }; lc.qm = {}; }
    else { lc.me = null; lc.seen = {}; lc.flipped = false; lc.qm = step.questions.map(() => ({})); }
  },
  render(step, ctx) {
    if (step.mode === 'bonds') return bondsRender(step, ctx);
    if (step.mode === 'forms') return formsRender(step, ctx);
    return methylRender(step, ctx);
  },
  scene(step, ctx) {
    const lc = ctx.local;
    if (step.mode === 'bonds') {
      const q = lc.qs[lc.k];
      return chairScene({ flip: lc.flip, hl: q ? { i: q.i, kind: q.kind } : null, labels: lc.k >= lc.qs.length });
    }
    if (step.mode === 'forms') return chairScene({ form: lc.form });
    return chairScene({ me: lc.me, diax: true, flip: false });
  },
  hints(step, ctx) {
    const lc = ctx.local;
    if (step.mode === 'bonds') {
      const q = lc.qs[lc.k];
      return [
        L('Найдите ось цикла (перпендикуляр к его средней плоскости). Аксиальная связь параллельна ей, экваториальная — почти в плоскости цикла.', 'Цикл осін табыңыз (оның орташа жазықтығына перпендикуляр). Аксиалды байланыс оған параллель, экваториалды — цикл жазықтығында дерлік.', 'Find the ring axis (perpendicular to the mean plane of the ring). An axial bond is parallel to it; an equatorial bond lies almost in the ring plane.'),
        L('Атом C, выступающий вверх, имеет аксиальную связь вверх; выступающий вниз — вниз. После инверсии цикла ax ↔ eq.', 'Жоғары шығып тұрған C атомының аксиалды байланысы жоғары; төмен шығып тұрғанының — төмен. Цикл инверсиясынан кейін ax ↔ eq.', 'A carbon that points up has its axial bond up; one that points down has it down. After a ring flip ax ↔ eq.'),
        q ? { ru: 'Выделенная связь — ' + tr(KIND[kindNow(q, lc.flip)], 'ru') + '.', kk: 'Белгіленген байланыс — ' + tr(KIND[kindNow(q, lc.flip)], 'kk') + '.', en: 'The highlighted bond is ' + tr(KIND[kindNow(q, lc.flip)], 'en') + '.' } : null,
      ];
    }
    if (step.mode === 'forms') return [
      L('Сравните, заторможены ли связи C–C в каждой форме и нет ли сближенных атомов.', 'Әр пішінде C–C байланыстары тежелген бе және жақындасқан атомдар бар ма — салыстырыңыз.', 'Compare whether the C–C bonds are staggered in each form and whether any atoms clash.'),
      L('В ванне — заслонённые связи (торсионное напряжение) и сближенные флагштоковые H.', 'Ваннада — көмкерілген байланыстар (торсиялық кернеу) және жақындасқан флагшток H.', 'The boat has eclipsed bonds (torsional strain) and clashing flagpole H atoms.'),
      L('Устойчивее кресло: оно свободно от углового и торсионного напряжения.', 'Кресло тұрақтырақ: онда бұрыштық және торсиялық кернеу жоқ.', 'The chair is more stable: it is free of angle and torsional strain.'),
    ];
    return [
      L('Посмотрите, с какими атомами H сближается аксиальная группа CH₃.', 'Аксиалды CH₃ тобы қай H атомдарымен жақындасатынына қараңыз.', 'See which H atoms the axial CH₃ group comes close to.'),
      L('Аксиальная CH₃ у C1 сближена с аксиальными H у C3 и C5 — два 1,3-диаксиальных взаимодействия.', 'C1-дегі аксиалды CH₃ C3 және C5-тегі аксиалды H-пен жақындасқан — екі 1,3-диаксиалды әрекеттесу.', 'An axial CH₃ at C1 meets the axial H atoms at C3 and C5 — two 1,3-diaxial interactions.'),
      L('Поэтому при 25 °C ≈ 95 % метилциклогексана — экваториальный конформер.', 'Сондықтан 25 °C-та метилциклогексанның ≈ 95 %-ы — экваториалды конформер.', 'So at 25 °C about 95 % of methylcyclohexane is the equatorial conformer.'),
    ];
  },
};
