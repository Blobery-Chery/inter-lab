/**
 * lab13-spectrum — отнесение конфигурации по спектрам (опыт 4, письменное упражнение).
 * mode 'nmr': step.iso(state) → 'E'|'Z'; по распечатке спектра ¹H (положения линий дублетов, м. д.) студент считает
 *   ³J = Δδ × ν₀ (Гц, допуск ±0,3 Гц, 3 попытки — затем решение = подсказка 3), затем выбирает E/Z.
 * mode 'ir':  step.iso(state) → 'cis'|'trans'; курсор по ИК-спектру, «Отметить полосу» (±12 см⁻¹ от диагностической
 *   внеплоскостной δ(C–H)), затем выбор цис/транс.
 * Неверное отнесение конфигурации — замечание major. step.saveAs — { J | band, iso, ok }.
 */
import { h } from '../../../app/dom.js';
import { tr, L, n, num } from '../../../app/i18n.js';
import { btn, row, group, range } from '../../../app/ui/controls.js';
import { parseNum } from '../../../app/steps/calc.js';
import { cinnamicLines, CINNAMIC, NMR_MHZ, octeneBands, irT, IR_DIAG } from '../model.js';
import { nmrScene, irScene } from '../scene.js';

const CFG = {
  E: L('E (транс-): H и H по разные стороны', 'E (транс-): H және H екі жағында', 'E (trans): the two H on opposite sides'),
  Z: L('Z (цис-): H и H по одну сторону', 'Z (цис-): H және H бір жағында', 'Z (cis): the two H on the same side'),
  trans: L('транс-изомер (E)', 'транс-изомер (E)', 'trans isomer (E)'),
  cis: L('цис-изомер (Z)', 'цис-изомер (Z)', 'cis isomer (Z)'),
};

function chooser(step, ctx, opts, truth, logOk) {
  const { local } = ctx;
  return group(L('Отнесение конфигурации', 'Конфигурацияны анықтау', 'Assignment of configuration'), h('div', { class: 'check' }, ...opts.map((o) => {
    const b = btn(CFG[o], () => {
      if (local.cfg) return;
      if (o === truth) {
        local.cfg = o;
        ctx.state[step.saveAs] = { ...(ctx.state[step.saveAs] || {}), iso: o, ok: !local.wrongCfg };
        ctx.log(logOk(o), 'obs');
        ctx.solve(L('Конфигурация отнесена верно.', 'Конфигурация дұрыс анықталды.', 'Configuration assigned correctly.'));
      } else {
        local.wrongCfg = true;
        ctx.remark({ key: `cfg-${ctx.stepIndex}`, severity: 'major', points: 1, text: step.wrongText || L('неверно отнесена конфигурация двойной связи по спектральным данным', 'спектрлік деректер бойынша қос байланыстың конфигурациясы қате анықталды', 'configuration of the double bond assigned incorrectly from the spectral data') });
        ctx.feedback(step.wrongFb || L('Неверно. Сравните найденное значение со справочными: ³J(транс) 11–18 Гц, ³J(цис) 6–14 Гц; ИК: транс ≈ 965 см⁻¹, цис ≈ 690 см⁻¹.', 'Қате. Табылған мәнді анықтамалық мәндермен салыстырыңыз: ³J(транс) 11–18 Гц, ³J(цис) 6–14 Гц; ИҚ: транс ≈ 965 см⁻¹, цис ≈ 690 см⁻¹.', 'Wrong. Compare your value with the reference data: ³J(trans) 11–18 Hz, ³J(cis) 6–14 Hz; IR: trans ≈ 965 cm⁻¹, cis ≈ 690 cm⁻¹.'), 'bad');
      }
      ctx.save(); ctx.rerender();
    }, local.cfg === o ? 'on' : '');
    if (local.cfg) b.disabled = true;
    return b;
  })));
}

function nmrRender(step, ctx) {
  const { local, state } = ctx;
  const iso = step.iso(state), J = CINNAMIC[iso].J;
  const wrap = h('div', { class: 'wfull' });
  const inp = h('input', { type: 'text', inputmode: 'decimal', class: 'num', autocomplete: 'off', 'aria-label': tr(L('³J, Гц', '³J, Гц', '³J, Hz')), value: local.J != null ? num(local.J, 1) : '' });
  const go = btn(L('Проверить', 'Тексеру', 'Check'), () => {
    if (local.Jok) return;
    const x = parseNum(inp.value);
    if (!isFinite(x)) { ctx.feedback(L('Введите число.', 'Сан енгізіңіз.', 'Enter a number.'), 'warn'); return; }
    if (Math.abs(x - J) <= 0.3) {
      local.Jok = true; local.J = x;
      state[step.saveAs] = { ...(state[step.saveAs] || {}), J: x };
      ctx.log({ ru: `${tr(step.name, 'ru')}: ³J = (${n(CINNAMIC[iso].b + J / NMR_MHZ / 2, 4)} − ${n(CINNAMIC[iso].b - J / NMR_MHZ / 2, 4)}) × ${NMR_MHZ} = ${n(x, 1)} Гц`, kk: `${tr(step.name, 'kk')}: ³J = (${n(CINNAMIC[iso].b + J / NMR_MHZ / 2, 4)} − ${n(CINNAMIC[iso].b - J / NMR_MHZ / 2, 4)}) × ${NMR_MHZ} = ${n(x, 1)} Гц`, en: `${tr(step.name, 'en')}: ³J = (${n(CINNAMIC[iso].b + J / NMR_MHZ / 2, 4)} − ${n(CINNAMIC[iso].b - J / NMR_MHZ / 2, 4)}) × ${NMR_MHZ} = ${n(x, 1)} Hz` }, 'calc');
      ctx.feedback(null);
    } else {
      local.att = (local.att || 0) + 1;
      if (local.att >= 3) {
        local.Jok = true; local.J = J; ctx.forceSolutionHint();
        state[step.saveAs] = { ...(state[step.saveAs] || {}), J };
        ctx.log({ ru: `${tr(step.name, 'ru')}: ³J = ${n(J, 1)} Гц (по решению)`, kk: `${tr(step.name, 'kk')}: ³J = ${n(J, 1)} Гц (шешім бойынша)`, en: `${tr(step.name, 'en')}: ³J = ${n(J, 1)} Hz (from the solution)` }, 'calc');
        ctx.feedback({ ru: `Решение: ³J = Δδ × ${NMR_MHZ} МГц = ${num(J / NMR_MHZ, 4, 'ru')} м. д. × ${NMR_MHZ} = ${num(J, 1, 'ru')} Гц.`, kk: `Шешім: ³J = Δδ × ${NMR_MHZ} МГц = ${num(J / NMR_MHZ, 4, 'kk')} м. ү. × ${NMR_MHZ} = ${num(J, 1, 'kk')} Гц.`, en: `Solution: ³J = Δδ × ${NMR_MHZ} MHz = ${num(J / NMR_MHZ, 4, 'en')} ppm × ${NMR_MHZ} = ${num(J, 1, 'en')} Hz.` }, 'warn');
      } else ctx.feedback({ ru: `Неверно (попытка ${local.att} из 3). J — расстояние между линиями одного дублета в герцах: Δδ (м. д.) × ${NMR_MHZ} (МГц).`, kk: `Қате (3 әрекеттің ${local.att}-сі). J — бір дублет сызықтарының арасындағы герцпен қашықтық: Δδ (м. ү.) × ${NMR_MHZ} (МГц).`, en: `Incorrect (attempt ${local.att} of 3). J is the spacing of the two lines of one doublet in hertz: Δδ (ppm) × ${NMR_MHZ} (MHz).` }, 'bad');
    }
    ctx.save(); ctx.rerender();
  }, 'pri');
  if (local.Jok) { inp.disabled = true; go.disabled = true; }
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go.click(); });
  wrap.append(h('label', { class: 'field' }, h('span', { html: tr(L('Константа спин-спинового взаимодействия винильных протонов ³J', 'Винил протондарының спин-спиндік әрекеттесу тұрақтысы ³J', 'Vinyl proton coupling constant ³J')) }), row(inp, h('span', { class: 'unit' }, tr(L('Гц', 'Гц', 'Hz'))), go)));
  ctx.readouts([{ label: L('Спектрометр', 'Спектрометр', 'Spectrometer'), value: { ru: `${NMR_MHZ} МГц`, kk: `${NMR_MHZ} МГц`, en: `${NMR_MHZ} MHz` } }, { label: '³J', value: local.Jok ? { ru: n(local.J, 1) + ' Гц', kk: n(local.J, 1) + ' Гц', en: n(local.J, 1) + ' Hz' } : '—', st: local.Jok ? 'ok' : '' }]);
  if (local.Jok) wrap.append(chooser(step, ctx, ['E', 'Z'], iso, (o) => ({ ru: `${tr(step.name, 'ru')}: ³J = ${n(local.J, 1)} Гц — ${o === 'E' ? 'в пределах транс-интервала 11–18 Гц' : 'заметно меньше, чем у второго изомера (16,0 Гц); попадает в область, где справочные цис- (≈ 6–14 Гц) и транс-интервалы (≈ 11–18 Гц) перекрываются, поэтому отнесение — сравнением пары изомеров'} → (${o})-3-фенилпропеновая (${o === 'E' ? 'транс' : 'цис'}-коричная) кислота`, kk: `${tr(step.name, 'kk')}: ³J = ${n(local.J, 1)} Гц — ${o === 'E' ? '11–18 Гц транс-аралығының ішінде' : 'екінші изомердікінен (16,0 Гц) айтарлықтай кіші; анықтамалық цис- (≈ 6–14 Гц) және транс-аралықтар (≈ 11–18 Гц) қабаттасатын аймаққа түседі, сондықтан изомерлер жұбын салыстыру арқылы анықталады'} → (${o})-3-фенилпропен (${o === 'E' ? 'транс' : 'цис'}-даршын) қышқылы`, en: `${tr(step.name, 'en')}: ³J = ${n(local.J, 1)} Hz — ${o === 'E' ? 'within the trans range 11–18 Hz' : 'clearly smaller than for the other isomer (16.0 Hz); it falls where the reference cis (≈ 6–14 Hz) and trans (≈ 11–18 Hz) ranges overlap, so the assignment is made by comparing the pair'} → (${o})-3-phenylpropenoic (${o === 'E' ? 'trans' : 'cis'}-cinnamic) acid` })));
  return wrap;
}

function irRender(step, ctx) {
  const { local, state } = ctx;
  const iso = step.iso(state), bands = octeneBands(iso), diag = IR_DIAG[iso];
  const wrap = h('div', { class: 'wfull' });
  const upd = () => { ctx.readouts([{ label: L('Курсор', 'Курсор', 'Cursor'), value: { ru: Math.round(local.cur) + ' см⁻¹', kk: Math.round(local.cur) + ' см⁻¹', en: Math.round(local.cur) + ' cm⁻¹' } }, { label: L('Пропускание', 'Өткізу', 'Transmittance'), value: Math.round(irT(bands, local.cur)) + ' %' }, { label: L('Отмечено', 'Белгіленді', 'Marked'), value: local.band ? { ru: local.band + ' см⁻¹', kk: local.band + ' см⁻¹', en: local.band + ' cm⁻¹' } : '—', st: local.band ? 'ok' : '' }]); ctx.update(); };
  const mv = (d) => btn((d > 0 ? '+' : '−') + Math.abs(d), () => { if (local.band) return; local.cur = Math.max(600, Math.min(4000, local.cur + d)); ctx.save(); ctx.rerender(); }, 'sm');
  const rg = range({ min: 600, max: 4000, step: 5, value: Math.round(local.cur / 5) * 5, unit: L('см⁻¹', 'см⁻¹', 'cm⁻¹'), label: L('Курсор', 'Курсор', 'Cursor'), oninput: (v) => { if (local.band) return; local.cur = v; upd(); ctx.save(); } });
  const markB = btn(L('Отметить полосу под курсором', 'Курсор астындағы жолақты белгілеу', 'Mark the band under the cursor'), () => {
    if (local.band) return;
    const c = local.cur;
    if (Math.abs(c - diag) <= 12) {
      local.band = Math.round(diag + (local.noise || 0));
      state[step.saveAs] = { ...(state[step.saveAs] || {}), band: local.band };
      ctx.log({ ru: `${tr(step.name, 'ru')}: сильная полоса внеплоскостных деформационных колебаний =C–H при ${local.band} см⁻¹`, kk: `${tr(step.name, 'kk')}: ${local.band} см⁻¹ кезінде =C–H жазықтықтан тыс деформациялық тербелістерінің күшті жолағы`, en: `${tr(step.name, 'en')}: strong out-of-plane =C–H bending band at ${local.band} cm⁻¹` }, 'obs');
      ctx.feedback(null); ctx.advance(120);
    } else if (c > 2800 && c < 3050) ctx.feedback(L('Это область валентных колебаний C–H — она есть у всех алкенов и алканов и не различает цис и транс.', 'Бұл C–H валенттік тербелістерінің аймағы — ол барлық алкендер мен алкандарда бар және цис пен трансты ажыратпайды.', 'This is the C–H stretching region — present in all alkenes and alkanes; it does not tell cis from trans.'), 'warn');
    else if (irT(bands, c) > 80) ctx.feedback(L('Под курсором нет полосы поглощения.', 'Курсор астында жұтылу жолағы жоқ.', 'There is no absorption band under the cursor.'), 'warn');
    else {
      ctx.remark({ key: `irband-${ctx.stepIndex}`, severity: 'minor', points: 0.5, text: L('выбрана недиагностическая полоса ИК-спектра', 'ИҚ спектрінің диагностикалық емес жолағы таңдалды', 'a non-diagnostic IR band was chosen') });
      ctx.feedback(L('Эта полоса не диагностическая для геометрии двойной связи. Ищите сильную внеплоскостную δ(=C–H) в области 1000–650 см⁻¹ (выделена).', 'Бұл жолақ қос байланыстың геометриясы үшін диагностикалық емес. 1000–650 см⁻¹ аймағынан (белгіленген) күшті жазықтықтан тыс δ(=C–H) іздеңіз.', 'This band is not diagnostic of the double-bond geometry. Look for the strong out-of-plane δ(=C–H) in the 1000–650 cm⁻¹ region (shaded).'), 'bad');
    }
    ctx.save(); ctx.rerender();
  }, 'pri');
  if (local.band) markB.disabled = true;
  wrap.append(group(L('Курсор по спектру', 'Спектр бойынша курсор', 'Cursor on the spectrum'), rg, row(mv(-50), mv(-10), mv(-1), mv(1), mv(10), mv(50))), row(markB));
  if (local.band) wrap.append(chooser(step, ctx, ['trans', 'cis'], iso, (o) => ({ ru: `${tr(step.name, 'ru')}: полоса ${local.band} см⁻¹ → ${o === 'trans' ? 'транс-CH=CH (≈ 965 см⁻¹) — (E)-окт-4-ен' : 'цис-CH=CH (≈ 690 см⁻¹) — (Z)-окт-4-ен'}`, kk: `${tr(step.name, 'kk')}: ${local.band} см⁻¹ жолағы → ${o === 'trans' ? 'транс-CH=CH (≈ 965 см⁻¹) — (E)-окт-4-ен' : 'цис-CH=CH (≈ 690 см⁻¹) — (Z)-окт-4-ен'}`, en: `${tr(step.name, 'en')}: band at ${local.band} cm⁻¹ → ${o === 'trans' ? 'trans-CH=CH (≈ 965 cm⁻¹) — (E)-oct-4-ene' : 'cis-CH=CH (≈ 690 cm⁻¹) — (Z)-oct-4-ene'}` })));
  setTimeout(upd);
  return wrap;
}

export default {
  type: 'lab13-spectrum',
  init(step, ctx) {
    if (step.mode === 'ir') { ctx.local.cur = 2000; ctx.local.noise = ctx.rng.int(-3, 3); }
  },
  render(step, ctx) { return step.mode === 'ir' ? irRender(step, ctx) : nmrRender(step, ctx); },
  scene(step, ctx) {
    const iso = step.iso(ctx.state);
    if (step.mode === 'ir') return irScene({ bands: octeneBands(iso), cursor: ctx.local.band ? null : ctx.local.cur, mark: ctx.local.band || null, label: step.name });
    return nmrScene({ lines: cinnamicLines(iso), label: step.name });
  },
  hints(step, ctx) {
    const iso = step.iso(ctx.state);
    if (step.mode === 'ir') return [
      L('Геометрию двойной связи CH=CH выдаёт сильная полоса внеплоскостных деформационных колебаний =C–H в области 1000–650 см⁻¹.', 'CH=CH қос байланысының геометриясын 1000–650 см⁻¹ аймағындағы =C–H жазықтықтан тыс деформациялық тербелістерінің күшті жолағы көрсетеді.', 'The geometry of CH=CH shows up as a strong out-of-plane =C–H bending band in the 1000–650 cm⁻¹ region.'),
      L('транс-CH=CH ≈ 965 см⁻¹, цис-CH=CH ≈ 690 см⁻¹. Полосы 2960–2870 см⁻¹ (валентные C–H) и 1465, 1380 см⁻¹ (CH₂, CH₃) есть у обоих изомеров.', 'транс-CH=CH ≈ 965 см⁻¹, цис-CH=CH ≈ 690 см⁻¹. 2960–2870 см⁻¹ (C–H валенттік) және 1465, 1380 см⁻¹ (CH₂, CH₃) жолақтары екі изомерде де бар.', 'trans-CH=CH ≈ 965 cm⁻¹, cis-CH=CH ≈ 690 cm⁻¹. The 2960–2870 cm⁻¹ (C–H stretch) and 1465, 1380 cm⁻¹ (CH₂, CH₃) bands occur in both isomers.'),
      { ru: `Поставьте курсор на ${IR_DIAG[iso]} см⁻¹ и отметьте полосу: это ${iso === 'trans' ? 'транс' : 'цис'}-изомер.`, kk: `Курсорды ${IR_DIAG[iso]} см⁻¹-ге қойып, жолақты белгілеңіз: бұл ${iso === 'trans' ? 'транс' : 'цис'}-изомер.`, en: `Put the cursor at ${IR_DIAG[iso]} cm⁻¹ and mark the band: it is the ${iso} isomer.` },
    ];
    const c = CINNAMIC[iso];
    return [
      L('Винильные протоны дают два дублета; J — расстояние между линиями одного дублета. Переведите разность в герцы: Δδ (м. д.) × частота спектрометра (МГц).', 'Винил протондары екі дублет береді; J — бір дублет сызықтарының арасындағы қашықтық. Айырманы герцке айналдырыңыз: Δδ (м. ү.) × спектрометр жиілігі (МГц).', 'The vinyl protons give two doublets; J is the spacing of the lines of one doublet. Convert to hertz: Δδ (ppm) × spectrometer frequency (MHz).'),
      { ru: `Линии дублета: ${num(c.b + c.J / NMR_MHZ / 2, 4, 'ru')} и ${num(c.b - c.J / NMR_MHZ / 2, 4, 'ru')} м. д. Справка: ³J(транс) 11–18 Гц, ³J(цис) 6–14 Гц; у пары изомеров транс-изомеру соответствует большая константа.`, kk: `Дублет сызықтары: ${num(c.b + c.J / NMR_MHZ / 2, 4, 'kk')} және ${num(c.b - c.J / NMR_MHZ / 2, 4, 'kk')} м. ү. Анықтама: ³J(транс) 11–18 Гц, ³J(цис) 6–14 Гц; изомерлер жұбында үлкенірек тұрақты транс-изомерге сәйкес.`, en: `Doublet lines: ${num(c.b + c.J / NMR_MHZ / 2, 4, 'en')} and ${num(c.b - c.J / NMR_MHZ / 2, 4, 'en')} ppm. Reference: ³J(trans) 11–18 Hz, ³J(cis) 6–14 Hz; within a pair of isomers the larger coupling belongs to the trans isomer.` },
      { ru: `³J = ${num(c.J, 1, 'ru')} Гц → ${iso}-изомер.`, kk: `³J = ${num(c.J, 1, 'kk')} Гц → ${iso}-изомер.`, en: `³J = ${num(c.J, 1, 'en')} Hz → the ${iso} isomer.` },
    ];
  },
};
