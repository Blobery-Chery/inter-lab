/**
 * process — управление параметром во времени: нагрев, охлаждение, перемешивание, выдержка.
 * step: {
 *   setup(state, local, ctx)          начальные значения (один раз при первом входе)
 *   speeds: [5, 10, 30]               множители хода времени (null — без «живого» времени, только действия)
 *   tick(state, local, dt, ctx)       модель: dt — секунды лабораторного времени (вызывается 10 раз в секунду)
 *   controls: [                       органы управления (значения в local.c[id]); group — подпись группы
 *     { kind:'toggle', id, label, labelOn, group, onChange(state, local, on, ctx) },
 *     { kind:'action', id, label, group, once, requires, advance, log, obs, do(state, local, ctx) },
 *     { kind:'seg', id, label, group, options:[[v, label]], default },
 *     { kind:'range', id, label, group, min, max, step, unit, default },
 *   ]
 *   readouts(state, local) → [{label, value, st:'ok'|'warn'|'bad'}]
 *   alerts(state, local) → {text, kind} | null      живая обратная связь (зоны «ниже/норма/быстро/перебор»)
 *   events: [{ id, when(state, local), title, text, options:[{ label, ok, severity, points, remark, whatif, effect(state, local, ctx), log }] }]
 *   chart: { value(state, local), min, max, band:[lo, hi], limit, every:5, active(state, local), label, empty }
 *   done(state, local) → false | true | {текст}      шаг решён
 *   stop(state, local) → bool                       остановить «живое» время (например, после завершения)
 * }
 * Событие по ходу процесса открывает окно с решением; ход времени на это время останавливается.
 */
import { h, clamp } from '../dom.js';
import { tr, L, isTri } from '../i18n.js';
import { btn, row, group, seg, range } from '../ui/controls.js';
import { runAction } from './_common.js';

export function drawChart(cv, pts, o) {
  if (!cv || !cv.getContext) return;
  const dpr = window.devicePixelRatio || 1, r = cv.getBoundingClientRect(), w = Math.max(50, r.width), hh = 110;
  if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = hh * dpr; }
  const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, hh);
  const cs = getComputedStyle(document.documentElement), col = (k) => cs.getPropertyValue(k).trim();
  const P = { l: 34, r: 10, t: 8, b: 20 }, min = o.min, max = o.max;
  const tmax = Math.max(o.span || 900, pts.length ? pts[pts.length - 1][0] + 60 : 0);
  const X = (t) => P.l + ((w - P.l - P.r) * t) / tmax, Y = (v) => P.t + (hh - P.t - P.b) * (1 - (clamp(v, min, max) - min) / (max - min));
  if (o.band) { c.fillStyle = col('--good-soft'); c.fillRect(P.l, Y(o.band[1]), w - P.l - P.r, Y(o.band[0]) - Y(o.band[1])); }
  c.font = '10px ' + col('--f-mono'); c.fillStyle = col('--muted'); c.strokeStyle = col('--line'); c.lineWidth = 1; c.textAlign = 'right';
  const stepV = (max - min) / 5;
  for (let v = min; v <= max + 1e-9; v += stepV) { c.beginPath(); c.moveTo(P.l, Y(v) + 0.5); c.lineTo(w - P.r, Y(v) + 0.5); c.stroke(); c.fillText(Math.round(v) + '°', P.l - 4, Y(v) + 3); }
  c.textAlign = 'center';
  const mn = tr(L(' мин', ' мин', ' min'));
  for (let m = 0; m * 60 <= tmax; m += 5) if (X(m * 60) < w - P.r - 22) c.fillText(m + mn, X(m * 60), hh - 5);
  if (o.limit != null) { c.strokeStyle = col('--warn'); c.setLineDash([5, 4]); c.beginPath(); c.moveTo(P.l, Y(o.limit)); c.lineTo(w - P.r, Y(o.limit)); c.stroke(); c.setLineDash([]); }
  if (pts.length) {
    c.strokeStyle = col('--accent'); c.lineWidth = 2; c.beginPath();
    pts.forEach(([t, v], i) => (i ? c.lineTo(X(t), Y(v)) : c.moveTo(X(t), Y(v)))); c.stroke();
    const [lt, lv] = pts[pts.length - 1];
    c.fillStyle = o.limit != null && lv > o.limit ? col('--bad') : col('--accent'); c.beginPath(); c.arc(X(lt), Y(lv), 3.5, 0, 7); c.fill();
  } else if (o.empty) { c.fillStyle = col('--muted'); c.textAlign = 'left'; c.fillText(tr(o.empty), P.l + 8, P.t + 14); }
}

/** Общая реализация process/add. extra — дополнительные органы управления (для add). */
export function makeProcess(typeName, extra = {}) {
  return {
    type: typeName,
    init(step, ctx) {
      const { local } = ctx;
      local.c = {}; local.done = {}; local.ev = {}; local.pts = []; local.acc = 0; local.ptAcc = 0;
      for (const c of step.controls || []) if (c.default !== undefined) local.c[c.id] = c.default;
      local.speed = step.speeds ? (step.speed ?? step.speeds[Math.min(1, step.speeds.length - 1)]) : 0;
      if (extra.init) extra.init(step, ctx);
      if (step.setup) step.setup(ctx.state, local, ctx);
    },
    render(step, ctx) {
      const { local, state } = ctx;
      const wrap = h('div', { class: 'wfull' });
      let cv = null;
      if (step.chart) { cv = h('canvas', { class: 'tg', 'aria-label': tr(step.chart.label || L('График', 'График', 'Chart')) }); wrap.append(cv); }
      const groups = [];
      const gmap = new Map();
      const put = (label, el) => {
        const k = label ? tr(label) : '';
        if (!gmap.has(k)) { const g = { label, els: [] }; gmap.set(k, g); groups.push(g); }
        gmap.get(k).els.push(el);
      };
      if (extra.controls) extra.controls(step, ctx, put);
      const acts = (step.controls || []).filter((c) => c.kind === 'action');
      for (const c of step.controls || []) {
        if (c.kind === 'toggle') {
          const on = !!local.c[c.id];
          const b = btn(on && c.labelOn ? c.labelOn : c.label, () => {
            if (c.when && !c.when(state, local, ctx)) { if (c.whenText) ctx.feedback(c.whenText, 'warn'); return; }
            local.c[c.id] = !local.c[c.id];
            if (c.onChange) c.onChange(state, local, local.c[c.id], ctx);
            if (local.c[c.id] && c.log) ctx.log(c.log);
            ctx.save(); ctx.rerender();
          }, on ? 'on' : '', { 'aria-pressed': String(on) });
          if (c.disabled && c.disabled(state, local)) b.disabled = true;
          put(c.group, b);
        } else if (c.kind === 'action') {
          const b = btn(c.label, () => {
            if (c.disabled && c.disabled(state, local)) return;
            if (runAction(c, ctx, local.done, acts)) { this.after(step, ctx); ctx.save(); ctx.rerender(); }
          }, c.cls || '');
          if ((c.once !== false && local.done[c.id]) || (c.disabled && c.disabled(state, local))) b.disabled = true;
          put(c.group, b);
        } else if (c.kind === 'seg') {
          put(c.group, seg(c.options, () => local.c[c.id], (v) => { local.c[c.id] = v; if (c.onChange) c.onChange(state, local, v, ctx); ctx.save(); }, c.label));
        } else if (c.kind === 'range') {
          put(c.group || c.label, range({ ...c, value: local.c[c.id], oninput: (v) => { local.c[c.id] = v; ctx.save(); ctx.update(); } }));
        }
      }
      for (const g of groups) wrap.append(group(g.label, row(...g.els)));
      if (step.speeds) wrap.append(group(L('Ход времени', 'Уақыт жылдамдығы', 'Time speed'), row(seg(step.speeds.map((s) => [s, '×' + s]), () => local.speed, (v) => { local.speed = v; ctx.save(); }, L('Ход времени', 'Уақыт жылдамдығы', 'Time speed')))));
      const show = () => {
        if (step.readouts) ctx.readouts(step.readouts(state, local));
        ctx.update();
        if (cv) drawChart(cv, local.pts, step.chart);
      };
      setTimeout(() => { show(); this.after(step, ctx); this.pendingEvent(step, ctx); });
      if (step.speeds && step.tick) {
        let saveAcc = 0;
        ctx.every(100, () => {
          if (local._pause) return;
          if (step.stop && step.stop(state, local)) { show(); return; }
          const dt = 0.1 * local.speed;
          if (extra.tick) extra.tick(step, ctx, dt);
          step.tick(state, local, dt, ctx);
          local.acc += dt;
          if (local.acc >= 1) {
            const s = Math.floor(local.acc); local.acc -= s; ctx.advance(s);
            if (step.chart && (!step.chart.active || step.chart.active(state, local))) {
              local.ptAcc += s;
              if (local.ptAcc >= (step.chart.every || 5)) { local.pts.push([local.chartT = (local.chartT || 0) + local.ptAcc, +step.chart.value(state, local).toFixed(2)]); local.ptAcc = 0; }
            }
          }
          this.alerts(step, ctx);
          this.events(step, ctx);
          this.after(step, ctx);
          show();
          saveAcc += 0.1; if (saveAcc > 2) { saveAcc = 0; ctx.save(); }
        });
      }
      return wrap;
    },
    alerts(step, ctx) {
      if (!step.alerts) return;
      const a = step.alerts(ctx.state, ctx.local);
      const key = a ? tr(a.text, 'en') + a.kind : '';
      if (key !== ctx.local._alertKey) { ctx.local._alertKey = key; ctx.feedback(a ? a.text : null, a ? a.kind : 'info'); }
    },
    events(step, ctx) {
      for (const ev of step.events || []) {
        if (ctx.local.ev[ev.id]) continue;
        if (ev.when(ctx.state, ctx.local)) { ctx.local.ev[ev.id] = 'open'; this.fire(step, ctx, ev); break; }
      }
    },
    pendingEvent(step, ctx) {
      const ev = (step.events || []).find((e) => ctx.local.ev[e.id] === 'open');
      if (ev) this.fire(step, ctx, ev);
    },
    fire(step, ctx, ev) {
      ctx.local._pause = true;
      ctx.save();
      ctx.event(ev).then((o) => {
        const { state, local } = ctx;
        local.ev[ev.id] = 'done';
        local._pause = false;
        ctx.log({ ru: `Событие: ${tr(ev.title, 'ru')} → ${tr(o.label, 'ru')}`, kk: `Оқиға: ${tr(ev.title, 'kk')} → ${tr(o.label, 'kk')}`, en: `Event: ${tr(ev.title, 'en')} → ${tr(o.label, 'en')}` });
        if (!o.ok && (o.severity || o.remark)) ctx.remark({ key: `ev-${ev.id}`, severity: o.severity || 'major', points: o.points, text: o.remark || o.label, whatif: o.whatif, critical: o.critical });
        if (o.effect) o.effect(state, local, ctx);
        if (o.log) ctx.log(o.log, 'obs');
        ctx.save(); ctx.rerender();
      });
    },
    after(step, ctx) {
      if (!step.done || ctx.solved()) return;
      const d = step.done(ctx.state, ctx.local, ctx);
      if (d) ctx.solve(d === true ? null : d.text || d, d.kind || 'good');
    },
    hints(step, ctx) { return extra.hints ? extra.hints(step, ctx) : []; },
  };
}

export default makeProcess('process', {
  hints: (step) => [
    L('Следите за показаниями прибора и зоной, в которой должен находиться параметр.', 'Құрал көрсеткіштерін және параметр болуы тиіс аймақты қадағалаңыз.', 'Watch the instrument readings and the range the parameter must stay in.'),
    L('Быстрее — не значит лучше: перебор ведёт к потерям или аварии. Используйте охлаждение/перемешивание.', 'Тезірек — жақсырақ дегенді білдірмейді: шектен шығу шығынға немесе апатқа әкеледі. Салқындату/араластыруды пайдаланыңыз.', 'Faster is not better: overshooting means losses or an accident. Use cooling and stirring.'),
    L('Выполните действия по порядку инструкции и дождитесь, пока «Далее» станет доступна.', 'Әрекеттерді нұсқаулық ретімен орындап, «Әрі қарай» белсенді болғанша күтіңіз.', 'Do the actions in the order of the instructions and wait until “Next” becomes available.'),
  ],
});
