/**
 * lab13-stereo — модели энантиомеров бутан-2-ола: собрать вторую модель, превратить её в зеркальное отражение,
 * попробовать совместить с первой (повороты), определить R/S обеих моделей. Конфигурация считается по положению групп
 * (model.rsOf), поэтому ответ зависит от того, что студент собрал.
 * step: { prio: ['OH','C2H5','CH3','H'], saveAs }
 * local: A, B (перестановки групп по позициям 0 — вверх, 1 — влево, 2 — клин, 3 — пунктир), sel (позиция для обмена),
 *        rotAfter (поворотов после отражения), overlayFail, rs {A, B}, ok {A, B}
 */
import { h } from '../../../app/dom.js';
import { tr, L } from '../../../app/i18n.js';
import { btn, row, group } from '../../../app/ui/controls.js';
import { rsOf, parity, rotV, rotH, mirror, swap, fischerOf } from '../model.js';
import { stereoScene } from '../scene.js';

const NAME = { OH: 'OH', H: 'H', CH3: 'CH₃', C2H5: 'C₂H₅' };
const POSN = [L('вверху', 'жоғарыда', 'top'), L('слева', 'сол жақта', 'left'), L('клин (к нам)', 'сына (бізге қарай)', 'wedge (towards us)'), L('пунктир (от нас)', 'пунктир (бізден)', 'dash (away from us)')];
const REF = ['OH', 'CH3', 'C2H5', 'H'];
const same = (a, b) => a && b && a.every((x, i) => x === b[i]);

export default {
  type: 'lab13-stereo',
  init(step, ctx) {
    const lc = ctx.local;
    let A = ctx.rng.shuffle(REF.slice());
    for (let k = ctx.rng.int(0, 2); k > 0; k--) A = rotV(A);
    lc.A = A; lc.B = null; lc.sel = null; lc.rotAfter = 0; lc.overlayFail = false; lc.rs = {}; lc.ok = {};
  },
  render(step, ctx) {
    const { local: lc, state } = ctx;
    const prio = step.prio || ['OH', 'C2H5', 'CH3', 'H'];
    const wrap = h('div', { class: 'wfull' });
    const done = ctx.solved();
    const enant = lc.B && parity(lc.A, REF) !== parity(lc.B, REF);
    const act = (label, fn, cls = '') => { const b = btn(label, () => { if (done) return; fn(); ctx.save(); ctx.rerender(); }, cls); if (done) b.disabled = true; return b; };

    if (!lc.B) {
      wrap.append(group(L('Вторая модель', 'Екінші модель', 'Second model'), row(act(L('Собрать модель B — точную копию A', 'B моделін жинау — A-ның дәл көшірмесі', 'Build model B — an exact copy of A'), () => {
        lc.B = lc.A.slice(); ctx.advance(240);
        ctx.log(L('Собрана вторая модель (B), во всём совпадающая с моделью A', 'A моделімен толық сәйкес келетін екінші модель (B) жиналды', 'A second model (B) identical to model A was built'));
      }, 'pri'))));
    } else {
      const pos = POSN.map((p, i) => act({ ru: `${tr(p, 'ru')}: ${NAME[lc.B[i]]}`, kk: `${tr(p, 'kk')}: ${NAME[lc.B[i]]}`, en: `${tr(p, 'en')}: ${NAME[lc.B[i]]}` }, () => {
        if (lc.sel == null) { lc.sel = i; ctx.feedback(L('Выберите вторую группу, с которой поменять местами.', 'Орын ауыстыратын екінші топты таңдаңыз.', 'Choose the second group to swap with.'), 'info'); return; }
        if (lc.sel === i) { lc.sel = null; ctx.feedback(null); return; }
        const a = lc.B[lc.sel], b = lc.B[i];
        lc.B = swap(lc.B, lc.sel, i); lc.sel = null; lc.rotAfter = 0; lc.overlayFail = false; ctx.advance(60);
        ctx.log({ ru: `На модели B переставлены группы ${NAME[a]} и ${NAME[b]}`, kk: `B моделінде ${NAME[a]} және ${NAME[b]} топтарының орны ауыстырылды`, en: `Groups ${NAME[a]} and ${NAME[b]} swapped on model B` });
        ctx.feedback(null);
      }, lc.sel === i ? 'on' : ''));
      wrap.append(group(L('Модель B: поменять местами две группы (нажмите две позиции)', 'B моделі: екі топтың орнын ауыстыру (екі орынды басыңыз)', 'Model B: swap two groups (tap two positions)'), h('div', { class: 'check' }, ...pos)));
      wrap.append(group(L('Модель B: повороты и отражение', 'B моделі: бұру және шағылу', 'Model B: rotations and reflection'), row(
        act(L('Повернуть B на 120° вокруг верхней связи', 'B-ны жоғарғы байланыс бойынша 120°-қа бұру', 'Turn B by 120° about the top bond'), () => { lc.B = rotV(lc.B); lc.rotAfter++; ctx.advance(20); }),
        act(L('Перевернуть B на 180°', 'B-ны 180°-қа аудару', 'Flip B over by 180°'), () => { lc.B = rotH(lc.B); lc.rotAfter++; ctx.advance(20); }),
        act(L('Поставить B перед зеркалом: собрать отражение', 'B-ны айна алдына қою: шағылуын жинау', 'Hold B to a mirror: build its reflection'), () => {
          lc.B = mirror(lc.B); lc.rotAfter = 0; lc.overlayFail = false; ctx.advance(120);
          ctx.log(L('Модель B пересобрана как зеркальное отражение (группы на клине и пунктире поменялись местами)', 'B моделі айнадағы шағылу ретінде қайта жиналды (сына мен пунктирдегі топтар орын ауыстырды)', 'Model B rebuilt as the mirror image (the wedge and dash groups exchanged)'));
        }),
      )));
      wrap.append(row(act(L('Наложить B на A', 'B-ны A-ға беттестіру', 'Superimpose B on A'), () => {
        ctx.advance(30);
        if (same(lc.A, lc.B)) {
          ctx.log(L('Модели A и B совпали во всех четырёх положениях — это одна и та же молекула', 'A және B модельдері төрт күйдің бәрінде беттесті — бұл бір молекула', 'Models A and B coincide in all four positions — it is the same molecule'), 'obs');
          ctx.feedback(enant ? null : L('Модели совпадают: B пока не зеркальное отражение A.', 'Модельдер беттеседі: B әзірге A-ның айнадағы шағылуы емес.', 'The models coincide: B is not yet the mirror image of A.'), 'info');
        } else if (enant) {
          const m = lc.A.filter((x, i) => x === lc.B[i]).length;
          lc.overlayFail = true;
          ctx.log({ ru: `Наложение не удалось: совпадают ${m} из 4 групп`, kk: `Беттестіру сәтсіз: 4 топтың ${m}-і сәйкес`, en: `Superposition failed: ${m} of 4 groups coincide` }, 'obs');
          ctx.feedback(lc.rotAfter >= 2 ? L('Как ни поворачивай, модели не совмещаются: совпадают не больше двух групп.', 'Қалай бұрсаң да, модельдер беттеспейді: екі топтан артық сәйкес келмейді.', 'However you turn them, the models will not coincide: no more than two groups match.') : L('Не совпадает. Попробуйте повернуть модель B иначе.', 'Сәйкес емес. B моделін басқаша бұрап көріңіз.', 'They do not match. Try turning model B differently.'), 'warn');
        } else ctx.feedback(L('Не совпадает — но это та же молекула в другой ориентации. Поверните B.', 'Сәйкес емес — бірақ бұл басқа бағыттағы сол молекула. B-ны бұраңыз.', 'They do not match — but it is the same molecule in another orientation. Turn B.'), 'info');
      })));
    }
    const ready = enant && lc.overlayFail && lc.rotAfter >= 2;
    ctx.readouts([
      { label: L('Модель B', 'B моделі', 'Model B'), value: !lc.B ? '—' : enant ? L('зеркальное отражение A', 'A-ның айнадағы шағылуы', 'mirror image of A') : L('та же молекула, что A', 'A-мен бірдей молекула', 'the same molecule as A'), st: enant ? 'ok' : '' },
      { label: L('Поворотов B', 'B бұрылыстары', 'Turns of B'), value: String(lc.rotAfter) },
    ]);
    if (ready) {
      const truth = { A: rsOf(lc.A, prio), B: rsOf(lc.B, prio) };
      const pick = (m) => ['R', 'S'].map((c) => {
        const b = btn(`${m}: ${c}`, () => {
          if (lc.ok[m]) return;
          if (truth[m] === c) {
            lc.ok[m] = true; lc.rs[m] = c;
            ctx.log({ ru: `Модель ${m}: группа H направлена от наблюдателя, OH → C₂H₅ → CH₃ ${c === 'R' ? 'по часовой стрелке' : 'против часовой стрелки'} — (${c})-бутан-2-ол`, kk: `${m} моделі: H тобы бақылаушыдан бағытталған, OH → C₂H₅ → CH₃ ${c === 'R' ? 'сағат тілімен' : 'сағат тіліне қарсы'} — (${c})-бутан-2-ол`, en: `Model ${m}: H points away from the viewer, OH → C₂H₅ → CH₃ runs ${c === 'R' ? 'clockwise' : 'anticlockwise'} — (${c})-butan-2-ol` }, 'obs');
            if (lc.ok.A && lc.ok.B) {
              state[step.saveAs || 'enant'] = { A: truth.A, B: truth.B };
              ctx.advance(300);
              ctx.log({ ru: `(${truth.A})- и (${truth.B})-бутан-2-ол — зеркальные отражения, несовместимые в пространстве, — энантиомеры; атом C2 — стереоцентр. Проекции Фишера зарисованы в журнал`, kk: `(${truth.A})- және (${truth.B})-бутан-2-ол — кеңістікте беттеспейтін айналық шағылулар — энантиомерлер; C2 атомы — стереоорталық. Фишер проекциялары журналға сызылды`, en: `(${truth.A})- and (${truth.B})-butan-2-ol are non-superimposable mirror images — enantiomers; C2 is a stereocentre. Fischer projections drawn in the notebook` }, 'obs');
              ctx.solve(L('Конфигурации определены верно.', 'Конфигурациялар дұрыс анықталды.', 'Configurations assigned correctly.'));
            }
          } else {
            ctx.remark({ key: `rs-${ctx.stepIndex}-${m}`, severity: 'minor', points: 0.5, text: { ru: `неверно определена конфигурация модели ${m} (R/S)`, kk: `${m} моделінің конфигурациясы қате анықталды (R/S)`, en: `configuration of model ${m} assigned incorrectly (R/S)` } });
            ctx.feedback(L('Неверно. Мысленно поверните модель так, чтобы H (младшая группа) смотрела от вас, и проследите OH → C₂H₅ → CH₃.', 'Қате. Модельді H (кіші топ) сізден қарайтындай ойша бұрып, OH → C₂H₅ → CH₃ бағытын бақылаңыз.', 'Wrong. Turn the model in your mind so that H (the lowest group) points away from you and follow OH → C₂H₅ → CH₃.'), 'bad');
          }
          ctx.save(); ctx.rerender();
        }, lc.ok[m] && lc.rs[m] === c ? 'on' : '');
        if (lc.ok[m]) b.disabled = true;
        return b;
      });
      wrap.append(group(L('Конфигурация (старшинство: OH > C₂H₅ > CH₃ > H)', 'Конфигурация (үлкендігі: OH > C₂H₅ > CH₃ > H)', 'Configuration (priority: OH > C₂H₅ > CH₃ > H)'), row(...pick('A'), ...pick('B'))));
    } else if (lc.B) {
      wrap.append(h('p', { class: 'note', html: tr(L('Сделайте B зеркальным отражением A, затем несколько раз поверните B и попробуйте наложить на A.', 'B-ны A-ның айнадағы шағылуы етіп, содан кейін B-ны бірнеше рет бұрап, A-ға беттестіріп көріңіз.', 'Make B the mirror image of A, then turn B a few times and try to superimpose it on A.')) }));
    }
    return wrap;
  },
  scene(step, ctx) {
    const lc = ctx.local, prio = step.prio || ['OH', 'C2H5', 'CH3', 'H'];
    const fa = lc.ok && lc.ok.A ? { ...fischerOf(lc.rs.A, prio), conf: lc.rs.A } : null;
    const fb = lc.ok && lc.ok.B ? { ...fischerOf(lc.rs.B, prio), conf: lc.rs.B } : null;
    return stereoScene({ A: lc.A, B: lc.B || lc.A, showB: !!lc.B, fischerA: fa, fischerB: fb, hl: lc.sel != null ? [lc.sel] : [] });
  },
  hints(step, ctx) {
    const lc = ctx.local, prio = step.prio || ['OH', 'C2H5', 'CH3', 'H'];
    const enant = lc.B && parity(lc.A, REF) !== parity(lc.B, REF);
    return [
      L('Зеркальное отражение получают, поменяв местами любые две группы у стереоцентра (или клин и пунктир).', 'Айнадағы шағылуды стереоорталықтағы кез келген екі топтың (немесе сына мен пунктирдің) орнын ауыстырып алады.', 'The mirror image is obtained by swapping any two groups on the stereocentre (or the wedge and the dash).'),
      !lc.B ? L('Сначала соберите копию модели A.', 'Алдымен A моделінің көшірмесін жинаңыз.', 'First build a copy of model A.') : !enant ? L('Сейчас B совпадает с A по конфигурации — поменяйте две группы.', 'Қазір B конфигурациясы бойынша A-мен бірдей — екі топтың орнын ауыстырыңыз.', 'Right now B has the same configuration as A — swap two groups.') : L('Поверните B хотя бы дважды и попробуйте наложить на A.', 'B-ны кемінде екі рет бұрап, A-ға беттестіріп көріңіз.', 'Turn B at least twice and try to superimpose it on A.'),
      lc.B ? { ru: `Модель A — (${rsOf(lc.A, prio)}), модель B — (${rsOf(lc.B, prio)}).`, kk: `A моделі — (${rsOf(lc.A, prio)}), B моделі — (${rsOf(lc.B, prio)}).`, en: `Model A is (${rsOf(lc.A, prio)}), model B is (${rsOf(lc.B, prio)}).` } : { ru: `Модель A — (${rsOf(lc.A, prio)}).`, kk: `A моделі — (${rsOf(lc.A, prio)}).`, en: `Model A is (${rsOf(lc.A, prio)}).` },
    ];
  },
};
