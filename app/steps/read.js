/**
 * read — снять показание прибора.
 * mode 'value' (по умолчанию): step.value(state) — истинная величина; step.div — цена деления; студент вводит отсчёт.
 *   Допуск — половина цены деления (step.tol). Неверно → замечание minor (один раз); 3 попытки, затем верное значение
 *   (засчитывается как подсказка 3). step.saveAs, step.unit, step.scene(state, local).
 * mode 'mp': прибор т. пл. (app/instruments/mp.js). step.samples: [{ id, name, range(state) → {on, end}, layer(state), required }]
 *   Студент включает нагрев, выбирает скорость, отмечает начало и конец плавления. Быстрый нагрев (> 3 °C/мин)
 *   вблизи т. пл. → замечание major (значения завышены). Результат: state[step.saveAs || 'mp'][sampleId] = {on, end}.
 *   step.onRecord(state, sampleId, on, end, ctx)
 * mode 'polarimeter': step.alpha(state) — истинный угол, step.tube (дм); вращение анализатора до равенства полей, отсчёт по нониусу.
 *   Допуск ±0,1°. Результат: state[step.saveAs] = отсчёт.
 */
import { h } from '../dom.js';
import { tr, L, n, num } from '../i18n.js';
import { btn, row, group, seg } from '../ui/controls.js';
import { scene } from '../scene/svg.js';
import { createMp, tickMp, mpSVG, sampleT } from '../instruments/mp.js';
import { polarimeterSVG, vernier } from '../instruments/polarimeter.js';
import { parseNum } from './calc.js';

function valueRender(step, ctx) {
  const { local, state } = ctx;
  const truth = step.value(state, local), div = step.div || 1, tol = step.tol ?? div / 2;
  const inp = h('input', { type: 'text', inputmode: 'decimal', class: 'num', 'aria-label': tr(step.label || L('Отсчёт', 'Есеп', 'Reading')), value: local.r != null ? num(local.r, step.decimals ?? 1) : '' });
  if (local.ok || local.shown) inp.disabled = true;
  const go = btn(L('Записать отсчёт', 'Есепті жазу', 'Record the reading'), () => {
    const x = parseNum(inp.value);
    if (!isFinite(x)) { ctx.feedback(L('Введите число.', 'Сан енгізіңіз.', 'Enter a number.'), 'warn'); return; }
    if (Math.abs(x - truth) <= tol + 1e-9) {
      local.ok = true; local.r = x;
    } else {
      local.att = (local.att || 0) + 1;
      ctx.remark({ key: 'read-' + ctx.stepIndex, severity: 'minor', points: 0.5, text: L('неверно снято показание прибора', 'құрал көрсеткіші қате алынды', 'instrument read incorrectly') });
      if (local.att >= 3) { local.shown = true; local.r = truth; ctx.forceSolutionHint(); }
      else { ctx.feedback(L(`Неверно (попытка ${local.att} из 3). Цена деления — ${n(div, 2)}.`, `Қате (3 әрекеттің ${local.att}-сі). Бөлік құны — ${n(div, 2)}.`, `Incorrect (attempt ${local.att} of 3). The scale division is ${n(div, 2)}.`), 'bad'); ctx.save(); return; }
    }
    if (step.saveAs) state[step.saveAs] = local.r;
    ctx.log({ ru: `${tr(step.label, 'ru')}: ${n(local.r, step.decimals ?? 1)} ${tr(step.unit || '', 'ru')}`, kk: `${tr(step.label, 'kk')}: ${n(local.r, step.decimals ?? 1)} ${tr(step.unit || '', 'kk')}`, en: `${tr(step.label, 'en')}: ${n(local.r, step.decimals ?? 1)} ${tr(step.unit || '', 'en')}` }, 'obs');
    if (step.onRecord) step.onRecord(state, local.r, ctx);
    ctx.solve(); ctx.rerender();
  }, 'pri');
  if (local.ok || local.shown) go.disabled = true;
  return h('div', { class: 'wfull' }, h('label', { class: 'field' }, h('span', null, tr(step.label || L('Отсчёт', 'Есеп', 'Reading'))), row(inp, h('span', { class: 'unit' }, tr(step.unit || '')), go)));
}

function mpRender(step, ctx) {
  const { local, state } = ctx;
  const m = local.m;
  const samp = () => step.samples.find((s) => s.id === local.key);
  const rng = () => samp().range(state, local);
  const marks = (local.marks = local.marks || {});
  const upd = () => {
    ctx.readouts([
      { label: L('Блок', 'Блок', 'Block'), value: num(m.Tb, 1) + ' °C' },
      { label: L('Нагрев', 'Қыздыру', 'Heating'), value: m.on ? { ru: m.rate + ' °C/мин', kk: m.rate + ' °C/мин', en: m.rate + ' °C/min' } : L('выкл.', 'өшірулі', 'off'), st: m.on && m.rate > 3 && m.Tb > rng().on - 15 ? 'warn' : '' },
      { label: L('В приборе', 'Құралда', 'In the apparatus'), value: m.inside ? samp().name : '—' },
    ]);
    ctx.update();
  };
  const inB = btn(L('Поместить капилляр в прибор', 'Капиллярды құралға салу', 'Put the capillary into the apparatus'), () => { m.inside = true; ctx.log({ ru: 'Капилляр помещён в прибор: ' + tr(samp().name, 'ru'), kk: 'Капилляр құралға салынды: ' + tr(samp().name, 'kk'), en: 'Capillary placed in the apparatus: ' + tr(samp().name, 'en') }); ctx.save(); ctx.rerender(); }, m.inside ? 'on' : '');
  if (m.inside) inB.disabled = true;
  const heatB = btn(m.on ? L('Нагрев: выключить', 'Қыздыру: өшіру', 'Heating: off') : L('Нагрев: включить', 'Қыздыру: қосу', 'Heating: on'), () => {
    if (!m.inside) { ctx.feedback(L('Сначала поместите капилляр в прибор.', 'Алдымен капиллярды құралға салыңыз.', 'Put the capillary into the apparatus first.'), 'warn'); return; }
    m.on = !m.on; ctx.save(); ctx.rerender();
  }, m.on ? 'on' : '');
  const mark = (k) => btn(k === 'on' ? L('Отметить начало плавления', 'Балқудың басталуын белгілеу', 'Mark the start of melting') : L('Отметить конец плавления', 'Балқудың аяқталуын белгілеу', 'Mark the end of melting'), () => {
    if (!m.inside) { ctx.feedback(L('Капилляр ещё не в приборе.', 'Капилляр әлі құралда емес.', 'The capillary is not in the apparatus yet.'), 'warn'); return; }
    const mk = (marks[local.key] = marks[local.key] || {});
    if (k === 'end' && mk.on == null) { ctx.feedback(L('Сначала отметьте начало плавления.', 'Алдымен балқудың басталуын белгілеңіз.', 'Mark the start of melting first.'), 'warn'); return; }
    if (mk[k] != null) return;
    const T = +m.Tb.toFixed(1); mk[k] = T;
    if (m.on && m.rate > 3) ctx.remark({ key: 'mpfast', severity: 'major', points: 1, text: L('нагрев вблизи т. пл. был слишком быстрым — значения завышены', 'балқу температурасына жақын қыздыру тым жылдам болды — мәндер жоғарылатылған', 'heating near the m.p. was too fast — the readings are too high') });
    if (k === 'on' && sampleT(m) < rng().on - 1.6) ctx.remark({ key: 'mpearly', severity: 'minor', points: 0.5, text: L('начало плавления отмечено раньше, чем появилась жидкость', 'балқудың басталуы сұйықтық пайда болмай тұрып белгіленді', 'start of melting marked before any liquid appeared') });
    const nm = samp().name;
    ctx.log({ ru: `${tr(nm, 'ru')}: ${k === 'on' ? 'начало плавления' : 'конец плавления'} — ${n(T, 1)} °C`, kk: `${tr(nm, 'kk')}: ${k === 'on' ? 'балқудың басталуы' : 'балқудың аяқталуы'} — ${n(T, 1)} °C`, en: `${tr(nm, 'en')}: ${k === 'on' ? 'start of melting' : 'end of melting'} — ${n(T, 1)} °C` }, 'obs');
    if (k === 'end') {
      state[step.saveAs || 'mp'] = { ...(state[step.saveAs || 'mp'] || {}), [local.key]: { on: mk.on, end: mk.end } };
      if (step.onRecord) step.onRecord(state, local.key, mk.on, mk.end, ctx);
      if (step.samples.filter((s) => s.required !== false).every((s) => marks[s.id] && marks[s.id].end != null)) ctx.solve(step.doneText && step.doneText(state));
    }
    ctx.save(); ctx.rerender();
  });
  const others = step.samples.filter((s) => s.id !== local.key && !(marks[s.id] && marks[s.id].end != null));
  const nextB = others.length ? btn({ ru: 'Охладить прибор и взять: ' + tr(others[0].name, 'ru'), kk: 'Құралды суытып, алу: ' + tr(others[0].name, 'kk'), en: 'Cool the apparatus and load: ' + tr(others[0].name, 'en') }, () => {
    const cur = marks[local.key];
    if (!cur || cur.end == null) { ctx.feedback(L('Сначала закончите измерение текущей пробы.', 'Алдымен ағымдағы сынаманы өлшеуді аяқтаңыз.', 'Finish measuring the current sample first.'), 'warn'); return; }
    local.key = others[0].id; m.on = false; m.inside = false; m.Tb = Math.min(m.Tb, (others[0].range(state, local).on || 100) - 25); ctx.advance(480);
    ctx.log({ ru: 'Прибор охлаждён; следующая проба: ' + tr(others[0].name, 'ru'), kk: 'Құрал суытылды; келесі сынама: ' + tr(others[0].name, 'kk'), en: 'Apparatus cooled; next sample: ' + tr(others[0].name, 'en') });
    ctx.save(); ctx.rerender();
  }) : null;
  ctx.every(100, () => { const dt = 0.1 * local.speed; tickMp(m, dt); local.acc = (local.acc || 0) + dt; if (local.acc >= 1) { const s = Math.floor(local.acc); local.acc -= s; ctx.advance(s); } upd(); });
  setTimeout(upd);
  return h('div', { class: 'wfull' },
    row(inB, heatB),
    group(L('Скорость нагрева, °C/мин', 'Қыздыру жылдамдығы, °C/мин', 'Heating rate, °C/min'), row(seg([[10, '10'], [5, '5'], [2, '2'], [1, '1']], () => m.rate, (v) => { m.rate = v; ctx.save(); }, L('Скорость нагрева', 'Қыздыру жылдамдығы', 'Heating rate')))),
    group(L('Отметки', 'Белгілер', 'Readings'), row(mark('on'), mark('end'))),
    group(L('Ход времени', 'Уақыт жылдамдығы', 'Time speed'), row(seg([[1, '×1'], [10, '×10'], [30, '×30']], () => local.speed, (v) => { local.speed = v; ctx.save(); }, L('Ход времени', 'Уақыт жылдамдығы', 'Time speed')))),
    nextB ? row(nextB) : null,
  );
}

function polRender(step, ctx) {
  const { local, state } = ctx;
  const p = local.p;
  const rot = (d) => btn((d > 0 ? '+' : '−') + num(Math.abs(d), 2) + '°', () => { if (local.ok) return; p.theta = +(p.theta + d).toFixed(2); ctx.save(); ctx.update(); upd(); }, 'sm');
  const upd = () => ctx.readouts([{ label: L('Нониус', 'Нониус', 'Vernier'), value: num(vernier(p.theta), 2) + '°' }]);
  const fillB = btn(L('Заполнить трубку раствором', 'Түтікті ерітіндімен толтыру', 'Fill the tube with the solution'), () => { p.filled = true; ctx.advance(120); ctx.log(L('Трубка поляриметра заполнена раствором без пузырьков воздуха', 'Поляриметр түтігі ауа көпіршіктерінсіз ерітіндімен толтырылды', 'Polarimeter tube filled with the solution, no air bubbles')); ctx.save(); ctx.rerender(); }, p.filled ? 'on' : '');
  if (p.filled) fillB.disabled = true;
  const rec = btn(L('Поля равны — записать отсчёт', 'Өрістер тең — есепті жазу', 'Fields equal — record the reading'), () => {
    if (!p.filled) { ctx.feedback(L('Сначала заполните трубку.', 'Алдымен түтікті толтырыңыз.', 'Fill the tube first.'), 'warn'); return; }
    const r = vernier(p.theta), truth = step.alpha(state);
    if (Math.abs(r - truth) > (step.tol ?? 0.1) + 1e-9) {
      ctx.remark({ key: 'pol-' + ctx.stepIndex, severity: 'minor', points: 0.5, text: L('отсчёт снят при неравных полях', 'есеп өрістер тең емес кезде алынды', 'reading taken with unequal half-fields') });
      ctx.feedback(L('Половины поля не одинаковы по яркости — доверните анализатор.', 'Өріс жартылары жарықтығы бойынша бірдей емес — анализаторды бұраңыз.', 'The two halves of the field differ in brightness — keep turning the analyser.'), 'bad'); return;
    }
    local.ok = true;
    if (step.saveAs) state[step.saveAs] = r;
    ctx.log({ ru: `Отсчёт поляриметра: α = ${n(r, 2)}°`, kk: `Поляриметр есебі: α = ${n(r, 2)}°`, en: `Polarimeter reading: α = ${n(r, 2)}°` }, 'obs');
    if (step.onRecord) step.onRecord(state, r, ctx);
    ctx.solve(); ctx.rerender();
  }, 'pri');
  if (local.ok) rec.disabled = true;
  setTimeout(upd);
  return h('div', { class: 'wfull' }, row(fillB), group(L('Анализатор', 'Анализатор', 'Analyser'), row(rot(-5), rot(-1), rot(-0.1), rot(-0.05), rot(0.05), rot(0.1), rot(1), rot(5))), row(rec));
}

export default {
  type: 'read',
  init(step, ctx) {
    if (step.mode === 'mp') { ctx.local.m = createMp(step.startT ?? 25); ctx.local.key = step.samples[0].id; ctx.local.speed = 10; }
    if (step.mode === 'polarimeter') ctx.local.p = { theta: step.start ?? 0, alpha: 0, tube: step.tube || 1, filled: false };
  },
  render(step, ctx) {
    if (step.mode === 'mp') return mpRender(step, ctx);
    if (step.mode === 'polarimeter') return polRender(step, ctx);
    return valueRender(step, ctx);
  },
  scene(step, ctx) {
    if (step.mode === 'mp') {
      const s = step.samples.find((x) => x.id === ctx.local.key);
      return scene(mpSVG(ctx.local.m, s.range(ctx.state, ctx.local), s.layer ? s.layer(ctx.state) : 2.5));
    }
    if (step.mode === 'polarimeter') return scene(polarimeterSVG({ ...ctx.local.p, alpha: step.alpha(ctx.state) }));
    return '';
  },
  hints(step, ctx) {
    if (step.mode === 'mp') return [
      L('Быстро нагрейте до температуры на 10–15 °C ниже ожидаемой, затем — медленно, 1–2 °C/мин.', 'Күтілетін температурадан 10–15 °C төменге дейін тез қыздырып, содан кейін баяу — 1–2 °C/мин.', 'Heat quickly to 10–15 °C below the expected value, then slowly at 1–2 °C/min.'),
      L('Начало — первая капля жидкости в капилляре; конец — вещество полностью прозрачное.', 'Басы — капиллярдағы алғашқы сұйықтық тамшысы; соңы — зат толық мөлдір.', 'Start: the first drop of liquid in the capillary; end: the sample is completely clear.'),
      L('Переключите скорость на 1–2 °C/мин до начала плавления и отмечайте по лупе, а не по ожиданию.', 'Балқу басталмай тұрып жылдамдықты 1–2 °C/мин-ға ауыстырып, күтуге емес, лупаға қарап белгілеңіз.', 'Switch to 1–2 °C/min before melting begins and mark what you see in the magnifier, not what you expect.'),
    ];
    if (step.mode === 'polarimeter') return [
      L('Поворачивайте анализатор, пока обе половины поля не станут одинаково тёмными (полутень).', 'Өрістің екі жартысы бірдей күңгірт болғанша анализаторды бұраңыз (жартылай көлеңке).', 'Turn the analyser until both halves of the field are equally dim (half-shade).'),
      L('Грубо — шагом 1–5°, точно — 0,05–0,1°. Ярче левая половина — вращайте в другую сторону.', 'Шамамен — 1–5° қадаммен, дәл — 0,05–0,1°. Сол жартысы жарқын болса — басқа жаққа бұраңыз.', 'Coarse steps of 1–5°, fine steps of 0.05–0.1°. If one half gets brighter, turn the other way.'),
      { ru: `Равенство полей — около ${num(step.alpha(ctx.state), 1, 'ru')}°.`, kk: `Өрістердің теңдігі — шамамен ${num(step.alpha(ctx.state), 1, 'kk')}°.`, en: `The fields match at about ${num(step.alpha(ctx.state), 1, 'en')}°.` },
    ];
    return [
      L('Определите цену деления шкалы и снимайте отсчёт с точностью до половины деления.', 'Шкаланың бөлік құнын анықтап, есепті жарты бөлікке дейінгі дәлдікпен алыңыз.', 'Find the scale division and read to half a division.'),
      { ru: `Цена деления — ${n(step.div || 1, 2)} ${tr(step.unit || '', 'ru')}.`, kk: `Бөлік құны — ${n(step.div || 1, 2)} ${tr(step.unit || '', 'kk')}.`, en: `The division is ${n(step.div || 1, 2)} ${tr(step.unit || '', 'en')}.` },
      { ru: `Показание ≈ ${num(step.value(ctx.state, ctx.local), step.decimals ?? 1, 'ru')} ${tr(step.unit || '', 'ru')}.`, kk: `Көрсеткіш ≈ ${num(step.value(ctx.state, ctx.local), step.decimals ?? 1, 'kk')} ${tr(step.unit || '', 'kk')}.`, en: `The reading is ≈ ${num(step.value(ctx.state, ctx.local), step.decimals ?? 1, 'en')} ${tr(step.unit || '', 'en')}.` },
    ];
  },
};
