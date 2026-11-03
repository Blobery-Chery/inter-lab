/**
 * lab15-unknown — индивидуальное задание (методичка, раздел 8): четыре пробирки без этикеток (A–D) с глюкозой,
 * фруктозой, сахарозой и мальтозой. Студент сам выбирает пробы, проводит их (по методичке, время идёт) и определяет растворы.
 * Состояние: ctx.state.unk = { perm: {A: 'glu', …}, runs: [{ test, out: {A: {code, tApp, tPink}} }], assign: {A: 'glu'} }.
 * step: { tests: ['seliwanoff', 'barfoed', …], maxTests: 3 }
 */
import { h } from '../../../app/dom.js';
import { tr, L } from '../../../app/i18n.js';
import { btn, row, group, seg } from '../../../app/ui/controls.js';
import { benchScene, envOf } from './bench.js';
import * as M from '../model.js';

const IDS = ['A', 'B', 'C', 'D'];
const PREP = { molisch: 240, trommer: 240, fehling: 240, tollens: 600, barfoed: 180, seliwanoff: 180 };

export default {
  type: 'lab15-unknown',
  init(step, ctx) {
    const S = ctx.state;
    S.unk = S.unk || { perm: {}, runs: [], assign: {} };
    if (!Object.keys(S.unk.perm).length) { const p = ctx.rng.shuffle(M.SUGARS); IDS.forEach((id, i) => { S.unk.perm[id] = p[i]; }); }
    S.b = S.b || {};
    if (!S.b.unk) S.b.unk = { test: 'molisch', sw: 0, swOn: false, tubes: IDS.map((id) => M.newTube(id, S.unk.perm[id], { label: id, v: 1, sugV: 1 })) };
  },
  render(step, ctx) {
    const S = ctx.state, U = S.unk;
    const wrap = h('div', { class: 'wfull' });
    const tests = step.tests || Object.keys(M.TEST_NAME);
    const run = (test) => {
      if (U.runs.some((r) => r.test === test)) { ctx.feedback(L('Эта проба уже проведена — результаты в таблице ниже.', 'Бұл сынама жүргізілді — нәтижелер төмендегі кестеде.', 'This test has already been done — the results are in the table below.'), 'warn'); return; }
      const res = M.runIdeal(test, U.perm, envOf(S));
      res.bench.tubes.forEach((t) => { t.label = t.id; });
      S.b.unk = res.bench;
      U.runs.push({ test, out: Object.fromEntries(res.bench.tubes.map((t) => [t.id, { code: res.out[t.id].code, tApp: t.tApp, tPink: t.tPink }])) });
      ctx.advance(PREP[test] + res.sec);
      const parts = (lng) => IDS.map((id) => `${id} — ${tr(M.OBS[test][res.out[id].code].label(res.bench.tubes.find((t) => t.id === id)), lng)}`).join('; ');
      ctx.log({ ru: `${tr(M.TEST_NAME[test], 'ru')} с растворами A–D: ${parts('ru')}`, kk: `A–D ерітінділерімен ${tr(M.TEST_NAME[test], 'kk').toLowerCase()}: ${parts('kk')}`, en: `${tr(M.TEST_NAME[test], 'en')} with solutions A–D: ${parts('en')}` }, 'obs');
      ctx.feedback(null);
      ctx.save(); ctx.rerender();
    };
    wrap.append(group(L('Провести пробу со всеми четырьмя растворами (по методичке)', 'Төрт ерітіндінің бәрімен сынама жүргізу (әдістеме бойынша)', 'Run a test on all four solutions (as in the manual)'),
      row(...tests.map((t) => { const b = btn(M.TEST_NAME[t], () => run(t), U.runs.some((r) => r.test === t) ? 'on' : ''); return b; }))));
    if (U.runs.length) {
      const tbl = h('table', { class: 'mini' },
        h('thead', null, h('tr', null, h('th', null, tr(L('Проба', 'Сынама', 'Test'))), ...IDS.map((id) => h('th', null, id)))),
        h('tbody', null, ...U.runs.map((r) => h('tr', null, h('td', null, tr(M.TEST_NAME[r.test])), ...IDS.map((id) => h('td', null, tr(M.OBS[r.test][r.out[id].code].cell(r.out[id]))))))));
      wrap.append(group(L('Результаты', 'Нәтижелер', 'Results'), h('div', { class: 'tw' }, tbl)));
    }
    for (const id of IDS) {
      wrap.append(group({ ru: `Пробирка ${id}`, kk: `${id} пробиркасы`, en: `Tube ${id}` }, seg(M.SUGARS.map((s) => [s, M.NAME_CAP[s]]), () => U.assign[id], (v) => { U.assign[id] = v; ctx.save(); }, { ru: `Пробирка ${id}`, kk: `${id} пробиркасы`, en: `Tube ${id}` })));
    }
    const chk = btn(L('Проверить идентификацию', 'Сәйкестендіруді тексеру', 'Check the identification'), () => {
      if (ctx.solved()) return;
      if (IDS.some((id) => !U.assign[id])) { ctx.feedback(L('Укажите вещество для каждой из четырёх пробирок.', 'Төрт пробирканың әрқайсысы үшін затты көрсетіңіз.', 'Choose a substance for each of the four tubes.'), 'warn'); return; }
      if (new Set(IDS.map((id) => U.assign[id])).size < 4) { ctx.feedback(L('В каждой пробирке — разное вещество: одно и то же указано дважды.', 'Әр пробиркада — әртүрлі зат: бір зат екі рет көрсетілген.', 'Each tube holds a different substance: one has been chosen twice.'), 'warn'); return; }
      if (U.runs.length < 2) { ctx.feedback(L('Одной пробой четыре раствора не различить — сначала проведите пробы.', 'Бір сынамамен төрт ерітіндіні ажырату мүмкін емес — алдымен сынамаларды жүргізіңіз.', 'One test cannot tell four solutions apart — run the tests first.'), 'warn'); return; }
      const wrong = IDS.filter((id) => U.assign[id] !== U.perm[id]);
      U.tries = (U.tries || 0) + 1;
      if (wrong.length) {
        ctx.remark({ key: 'unk-wrong', severity: 'major', text: L('неверная идентификация растворов в индивидуальном задании', 'жеке тапсырмада ерітінділер қате сәйкестендірілді', 'wrong identification of the solutions in the individual assignment') });
        ctx.feedback(L('Идентификация не согласуется с наблюдениями. Сопоставьте признаки: какая проба отличает кетозу, какая — моносахарид от дисахарида, какая — восстанавливающий сахар.', 'Сәйкестендіру бақылаулармен үйлеспейді. Белгілерді салыстырыңыз: қай сынама кетозаны, қайсысы моносахаридті дисахаридтен, қайсысы тотықсыздандырғыш қантты ажыратады.', 'The identification does not match the observations. Compare the features: which test picks out a ketose, which tells a monosaccharide from a disaccharide, which detects a reducing sugar.'), 'bad');
        ctx.save(); return;
      }
      U.ok = true;
      ctx.log({ ru: 'Идентификация: ' + IDS.map((id) => `${id} — ${tr(M.NAME[U.perm[id]], 'ru')}`).join(', ') + `; проведено проб: ${U.runs.length}`, kk: 'Сәйкестендіру: ' + IDS.map((id) => `${id} — ${tr(M.NAME[U.perm[id]], 'kk')}`).join(', ') + `; жүргізілген сынамалар: ${U.runs.length}`, en: 'Identification: ' + IDS.map((id) => `${id} — ${tr(M.NAME[U.perm[id]], 'en')}`).join(', ') + `; tests used: ${U.runs.length}` }, 'obs');
      if (U.runs.length > (step.maxTests || 3)) ctx.remark({ key: 'unk-long', severity: 'minor', text: L(`последовательность проб не самая короткая (${U.runs.length} пробы)`, `сынамалар тізбегі ең қысқа емес (${U.runs.length} сынама)`, `the sequence of tests is not the shortest (${U.runs.length} tests)`) });
      ctx.solve(U.runs.length <= 2 ? L('Верно — и всего двумя пробами!', 'Дұрыс — небәрі екі сынамамен!', 'Correct — and with only two tests!') : L('Идентификация верна.', 'Сәйкестендіру дұрыс.', 'The identification is correct.'));
      ctx.save(); ctx.rerender();
    }, 'pri');
    if (ctx.solved()) chk.disabled = true;
    wrap.append(row(chk));
    ctx.readouts([{ label: L('Проведено проб', 'Жүргізілген сынамалар', 'Tests done'), value: String(U.runs.length) }]);
    setTimeout(() => ctx.update());
    return wrap;
  },
  scene(step, ctx) { return benchScene(ctx.state, 'unk', { baths: [] }); },
  hints(step, ctx) {
    return [
      L('Ищите пробы, которые делят четыре сахара на группы: кетоза / альдоза, моносахарид / дисахарид, восстанавливающий / невосстанавливающий.', 'Төрт қантты топтарға бөлетін сынамаларды іздеңіз: кетоза / альдоза, моносахарид / дисахарид, тотықсыздандырғыш / тотықсыздандырмайтын.', 'Look for tests that split the four sugars into groups: ketose / aldose, monosaccharide / disaccharide, reducing / non-reducing.'),
      L('Молиш и Троммер на холоду положительны у всех четырёх — они ничего не различают. Селиванов выделяет фруктозу и сахарозу, Барфёд — глюкозу и фруктозу.', 'Молиш пен суықтағы Троммер төртеуінде де оң — ештеңені ажыратпайды. Селиванов фруктоза мен сахарозаны, Барфёд глюкоза мен фруктозаны бөледі.', 'Molisch and cold Trommer are positive for all four — they distinguish nothing. Seliwanoff picks out fructose and sucrose, Barfoed glucose and fructose.'),
      L('Селиванов + Барфёд: «красный + осадок» — фруктоза; «красный, нет осадка» — сахароза; «нет окраски + осадок» — глюкоза; «нет окраски, нет осадка» — мальтоза.', 'Селиванов + Барфёд: «қызыл + тұнба» — фруктоза; «қызыл, тұнба жоқ» — сахароза; «түс жоқ + тұнба» — глюкоза; «түс жоқ, тұнба жоқ» — мальтоза.', 'Seliwanoff + Barfoed: “red + precipitate” — fructose; “red, no precipitate” — sucrose; “no colour + precipitate” — glucose; “no colour, no precipitate” — maltose.'),
    ];
  },
};
