/**
 * lab08-balance — технические весы (d = 0,01 г) для приёмника: «предварительно взвешенный приёмник» (методичка,
 * опыт 1, п. 6). mode 'empty' — сухая колба с пробкой (масса → state[saveAs]); mode 'full' — тот же приёмник с продуктом.
 * step: { mode: 'empty'|'full', saveAs, mass(state) → истинная масса, г, onRecord(state, m, ctx) }
 * Показание устанавливается ~2 с (значок стабильности). Ошибки: запись до стабилизации (minor),
 * взвешивание тёплого приёмника (minor, масса занижена из-за конвекции и испарения).
 */
import { h } from '../../../app/dom.js';
import { L, n, num } from '../../../app/i18n.js';
import { btn, row, group } from '../../../app/ui/controls.js';
import { scene, text, conical } from '../../../app/scene/svg.js';
import { ORG } from '../scene.js';

export default {
  type: 'lab08-balance',
  init(step, ctx) {
    const lc = ctx.local;
    lc.on = false; lc.since = 0; lc.disp = 0; lc.cool = step.mode !== 'full'; lc.warmErr = 0;
    if (step.mode === 'empty' && ctx.state.recMass == null) ctx.state.recMass = +ctx.rng.range(27.8, 31.6).toFixed(2);
  },
  render(step, ctx) {
    const lc = ctx.local, S = ctx.state;
    const truth = () => step.mass(S) - (lc.cool ? 0 : 0.06);
    const stable = () => lc.on && (Date.now() - (lc.sinceReal || 0) > 2000 || ctx.now() - lc.since >= 3);
    const upd = () => {
      lc.disp = lc.done ? lc.m : lc.on ? truth() + (stable() ? 0 : ctx.rng.range(-0.05, 0.05)) : 0;
      ctx.readouts([
        { label: L('Весы', 'Таразы', 'Balance'), value: num(lc.disp, 2) + ' g', st: stable() ? 'ok' : '' },
        { label: L('Показание', 'Көрсеткіш', 'Reading'), value: !lc.on ? '—' : stable() ? L('стабильно', 'тұрақты', 'stable') : L('устанавливается…', 'орнығуда…', 'settling…'), st: stable() ? 'ok' : 'warn' },
      ]);
      ctx.update();
    };
    const putB = btn(step.mode === 'full' ? L('Поставить приёмник с продуктом на весы', 'Өнімі бар қабылдағышты таразыға қою', 'Put the receiver with the product on the balance') : L('Поставить сухой приёмник (колба 50 мл с пробкой) на весы', 'Құрғақ қабылдағышты (тығыны бар 50 мл колба) таразыға қою', 'Put the dry receiver (50 mL flask with stopper) on the balance'), () => {
      if (lc.on || lc.done) return;
      lc.on = true; lc.since = ctx.now(); lc.sinceReal = Date.now(); ctx.advance(1); ctx.save(); ctx.rerender();
    }, lc.on ? 'on' : '');
    if (lc.on || lc.done) putB.disabled = true;
    const waitB = btn(L('Подождать 2–3 с', '2–3 с күту', 'Wait 2–3 s'), () => { ctx.advance(3); upd(); ctx.save(); });
    const rows = [group(L('Технические весы, d = 0,01 г', 'Техникалық таразы, d = 0,01 г', 'Top-pan balance, d = 0.01 g'), row(putB, waitB))];
    if (step.mode === 'full') {
      const coolB = btn(L('Дать приёмнику остыть до комнатной температуры, закрыть пробкой', 'Қабылдағышты бөлме температурасына дейін суытып, тығынмен жабу', 'Let the receiver cool to room temperature and stopper it'), () => {
        if (lc.cool || lc.on) return; lc.cool = true; ctx.advance(600);
        ctx.log(L('Приёмник с дистиллятом остыл до комнатной температуры, закрыт пробкой', 'Дистилляты бар қабылдағыш бөлме температурасына дейін суыды, тығынмен жабылды', 'Receiver with the distillate cooled to room temperature and stoppered'));
        ctx.save(); ctx.rerender();
      }, lc.cool ? 'on' : '');
      if (lc.cool || lc.on) coolB.disabled = true;
      rows.unshift(group(L('Приёмник', 'Қабылдағыш', 'Receiver'), row(coolB)));
    }
    const rec = btn(L('Записать массу', 'Массаны жазу', 'Record the mass'), () => {
      if (lc.done) return;
      if (!lc.on) { ctx.feedback(L('На весах ничего нет.', 'Таразыда ештеңе жоқ.', 'There is nothing on the balance.'), 'warn'); return; }
      let m = +truth().toFixed(2);
      if (!stable()) {
        ctx.remark({ key: 'bal8-unst-' + ctx.stepIndex, severity: 'minor', text: L('масса записана до стабилизации показаний весов', 'масса таразы көрсеткіші тұрақталмай жазылды', 'mass recorded before the balance reading had settled') });
        m = +(m + ctx.rng.range(-0.04, 0.04)).toFixed(2);
      }
      if (!lc.cool) ctx.remark({ key: 'bal8-warm', severity: 'minor', text: L('приёмник взвешен тёплым — восходящий поток воздуха и испарение эфира занижают массу', 'қабылдағыш жылы күйінде өлшенді — жоғары көтерілген ауа ағыны мен эфирдің булануы массаны төмендетеді', 'the receiver was weighed warm — rising air and evaporation of the ester make the mass low') });
      lc.done = true; lc.m = m;
      if (step.saveAs) S[step.saveAs] = m;
      if (step.onRecord) step.onRecord(S, m, ctx);
      ctx.solve(L(`Записано: <b>${n(m, 2)} г</b>`, `Жазылды: <b>${n(m, 2)} г</b>`, `Recorded: <b>${n(m, 2)} g</b>`));
      ctx.rerender();
    }, 'pri');
    if (lc.done) rec.disabled = true;
    rows.push(row(rec));
    setTimeout(upd);
    ctx.every(400, () => { if (!lc.done) upd(); });
    return h('div', { class: 'wfull' }, ...rows);
  },
  scene(step, ctx) {
    const lc = ctx.local, full = step.mode === 'full';
    const fl = lc.on ? conical({ id: 'bal8', cx: 180, by: 150, s: 0.55, vol: full ? 14 : 0, cap: 50, color: ORG }) + '<rect class="metd" x="173" y="60" width="14" height="8" rx="2"/>' : '';
    return scene(`<rect class="met" x="80" y="150" width="200" height="72" rx="8"/><rect class="metd" x="110" y="144" width="140" height="8" rx="3"/>
<rect class="scr" x="128" y="172" width="104" height="30" rx="4"/><text class="scrt" x="224" y="193" text-anchor="end">${num(lc.disp || 0, 2)} g</text>${lc.on && (Date.now() - (lc.sinceReal || 0) > 2000 || ctx.now() - lc.since >= 3) ? '<circle cx="138" cy="180" r="3" fill="var(--screen-ink)"/>' : ''}
${fl}${text(180, 244, L('технические весы', 'техникалық таразы', 'top-pan balance'))}`);
  },
  hints(step) {
    return [
      L('Приёмник взвешивают сухим, с пробкой, до перегонки — и тот же приёмник с продуктом после неё.', 'Қабылдағышты айдауға дейін құрғақ, тығынымен өлшейді — және айдаудан кейін сол қабылдағышты өніммен.', 'The receiver is weighed dry, with its stopper, before the distillation — and the same receiver with the product afterwards.'),
      L('Дождитесь значка стабильности; тёплую посуду не взвешивают.', 'Тұрақтылық белгісін күтіңіз; жылы ыдысты өлшемейді.', 'Wait for the stability mark; warm glassware is never weighed.'),
      step.mode === 'full' ? L('«Дать приёмнику остыть до комнатной температуры, закрыть пробкой» → «Поставить приёмник с продуктом на весы» → «Подождать 2–3 с» → «Записать массу». Масса продукта = m(с продуктом) − m(пустого).', '«Қабылдағышты бөлме температурасына дейін суытып, тығынмен жабу» → «Өнімі бар қабылдағышты таразыға қою» → «2–3 с күту» → «Массаны жазу». Өнім массасы = m(өніммен) − m(бос).', '“Let the receiver cool to room temperature and stopper it” → “Put the receiver with the product on the balance” → “Wait 2–3 s” → “Record the mass”. Product mass = m(with product) − m(empty).')
        : L('«Поставить сухой приёмник (колба 50 мл с пробкой) на весы» → «Подождать 2–3 с» → «Записать массу».', '«Құрғақ қабылдағышты (тығыны бар 50 мл колба) таразыға қою» → «2–3 с күту» → «Массаны жазу».', '“Put the dry receiver (50 mL flask with stopper) on the balance” → “Wait 2–3 s” → “Record the mass”.'),
    ];
  },
};
