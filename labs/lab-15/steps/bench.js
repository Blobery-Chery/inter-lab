/**
 * lab15-bench — батарея пробирок с сахарами: реактивы, водяные бани (кипящая и 50–60 °C), секундомер.
 * Состояние пробирок живёт в ctx.state.b[step.key] (переживает смену языка и перезагрузку; два шага с одним key
 * продолжают работу с теми же пробирками — например, проба Троммера «на холоду», затем «при нагревании»).
 *
 * step: {
 *   key, test: 'molisch'|'trommer'|'fehling'|'tollens'|'barfoed'|'seliwanoff',
 *   tubes: [{ id, sug, label? }]                          сахара в пробирках (label — своя подпись, например «A»)
 *   reagents: [{ id, label, group, target: 'all'|'sel', advance, log,
 *                when(tube, S, bench) → текст запрета | null, apply(tube, S, ctx, bench) }]
 *   baths: ['boil', 'warm']                              какие бани есть на столе ([] — без нагрева)
 *   single: true                                         можно ставить в баню по одной пробирке (выбранную)
 *   speeds: [1, 5, 10]                                   ход лабораторного времени
 *   events: [{ id, when(S, bench), title, text, options:[{ label, ok, severity, remark, whatif, critical, effect(S, bench, ctx), log }] }]
 *   check(S, bench, ctx)                                 после каждого действия и такта (замечания, обратная связь)
 *   done(S, bench, ctx) → false | true | текст            шаг решён
 *   reset: true                                          «Вылить и приготовить заново»
 * }
 */
import { h } from '../../../app/dom.js';
import { tr, L, n } from '../../../app/i18n.js';
import { btn, row, group, seg } from '../../../app/ui/controls.js';
import { scene, tube as tubeSVG, tubeRack, bubbles, steam, text } from '../../../app/scene/svg.js';
import * as M from '../model.js';

export const BATH_NAME = {
  boil: L('кипящая водяная баня', 'қайнап тұрған су моншасы', 'boiling water bath'),
  warm: L('водяная баня 50–60 °C', '50–60 °C су моншасы', 'water bath at 50–60 °C'),
};
const BATH_TO = {
  boil: L('в кипящую баню', 'қайнап тұрған моншаға', 'into the boiling bath'),
  warm: L('в баню 50–60 °C', '50–60 °C моншаға', 'into the 50–60 °C bath'),
};

export const envOf = (S) => ({ kin: S.kin, clean: S.clean !== false, nh3x: S.nh3x || 0 });

export function makeBench(step) {
  return { test: step.test, sw: 0, swOn: false, tubes: step.tubes.map((d) => M.newTube(d.id, d.sug, d.label ? { label: d.label } : {})) };
}
export function benchOf(S, key) { return (S.b || {})[key]; }

const mmss = (s) => { const x = Math.max(0, Math.round(s)); return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0'); };

/** Сцена: штатив слева, баня справа (если есть). opts: { baths:[…], sel } */
export function benchScene(S, key, opts = {}) {
  const b = benchOf(S, key);
  if (!b) return scene('');
  const env = envOf(S);
  const N = b.tubes.length, hasBath = (opts.baths || []).length > 0;
  const rackX = hasBath ? [38, 78, 118, 158] : [90, 150, 210, 270];
  const off = hasBath ? (4 - N) * 20 : (4 - N) * 30;
  const bathX = [216, 250, 284, 318];
  let s = '';
  const inB = b.tubes.filter((t) => t.bath);
  const bathKind = (inB[0] && inB[0].bath) || opts.baths?.[0];
  if (hasBath) {
    const T = bathKind ? M.BATH[bathKind] : 22;
    s += `<rect class="met" x="196" y="214" width="146" height="18" rx="3"/><circle cx="330" cy="223" r="3.5" fill="var(--hot)" opacity="${inB.length || bathKind ? 1 : 0.2}"/>`;
    s += `<rect class="gl" x="198" y="122" width="142" height="92" rx="6"/><rect class="liq" x="200" y="132" width="138" height="80" rx="5" opacity=".55"/>`;
    const bn = BATH_NAME[bathKind] || BATH_NAME.boil;
    s += text(269, 56, { ru: `${bn.ru} · ${n(T, 0)} °C`, kk: `${bn.kk} · ${n(T, 0)} °C`, en: `${bn.en} · ${n(T, 0)} °C` }, 'lbl');
    if (bathKind === 'boil') s += bubbles(206, 206, 126, 7, true) + steam(269, 120, true);
  }
  let iRack = 0, iBath = 0;
  b.tubes.forEach((t, i) => {
    const lk = M.look(b.test, t, env);
    const inBath = !!t.bath;
    const cx = inBath ? bathX[iBath++] : rackX[iRack++] + off;
    const top = inBath ? 70 : 36, len = inBath ? 142 : 166, r = 11;
    const cap = 5;
    s += tubeSVG({ id: 'lt' + i, cx, top, len, r, frac: Math.min(1, (t.v || 0) / cap), color: lk.color, ppt: lk.ppt, pptColor: lk.pptColor, mirror: false });
    s += text(cx, 247, t.label || M.SHORT[t.sug], 'lblb');
    if (lk.mirror) {
      const ly = top + len + r - Math.min(1, (t.v || 0) / cap) * len * 0.85;
      s += `<g clip-path="url(#lt${i}-c)"><rect x="${cx - r - 1}" y="${ly.toFixed(1)}" width="${2 * r + 2}" height="${(top + len + r - ly + 2).toFixed(1)}" fill="var(--metal)" opacity=".85"/><rect x="${cx - 6}" y="${(ly + 4).toFixed(1)}" width="3" height="${(top + len + r - ly - 10).toFixed(1)}" fill="#fff" opacity=".7"/></g>`;
    }
    const bot = top + len, base = bot + r;
    if (lk.acid) {
      const yi = base - (lk.acid / cap) * len * 0.85;
      s += `<rect clip-path="url(#lt${i}-c)" x="${cx - r - 1}" y="${yi.toFixed(1)}" width="${2 * r + 2}" height="${(base - yi + 2).toFixed(1)}" fill="rgba(240,235,200,.35)"/>`;
      if (lk.ring > 0.02) s += `<rect clip-path="url(#lt${i}-c)" x="${cx - r - 1}" y="${(yi - 3).toFixed(1)}" width="${2 * r + 2}" height="6" fill="${M.COLORS.violet}" opacity="${(0.25 + 0.75 * lk.ring).toFixed(2)}"/>`;
    }
    if (opts.sel === t.id && N > 1) s += `<path d="M${cx - 6} ${top - 14} L${cx + 6} ${top - 14} L${cx} ${top - 6} Z" fill="var(--accent)"/>`;
  });
  s += tubeRack(hasBath ? 14 : 60, hasBath ? 182 : 300);
  if (b.swOn) s += `<rect x="8" y="8" width="70" height="22" rx="5" fill="var(--panel)" stroke="var(--line)"/>` + text(43, 23, '⏱ ' + mmss(b.sw), 'lblb mono');
  return scene(s, L('Штатив с пробирками и водяная баня', 'Пробиркалар штативі және су моншасы', 'Test-tube rack and water bath'));
}

export default {
  type: 'lab15-bench',
  init(step, ctx) {
    const S = ctx.state;
    S.b = S.b || {};
    if (!S.b[step.key]) S.b[step.key] = makeBench(step);
    ctx.local.sel = step.tubes[0].id;
    ctx.local.speed = step.speed || (step.speeds || [1, 5, 10, 20])[1];
    ctx.local.ev = {};
    ctx.local.acc = 0;
  },
  render(step, ctx) {
    const { local, state: S } = ctx;
    const b = benchOf(S, step.key);
    const env = envOf(S);
    const wrap = h('div', { class: 'wfull' });
    const refresh = () => { this.after(step, ctx); ctx.save(); ctx.rerender(); };

    if (b.tubes.length > 1 && (step.single || step.reagents.some((r) => r.target === 'sel'))) {
      wrap.append(group(L('Пробирка', 'Пробирка', 'Test tube'), seg(b.tubes.map((t) => [t.id, t.label || M.NAME_CAP[t.sug]]), () => local.sel, (v) => { local.sel = v; ctx.save(); ctx.update(); }, L('Пробирка', 'Пробирка', 'Test tube'))));
    }
    const groups = new Map();
    const put = (g, el) => { const k = g ? tr(g) : ''; if (!groups.has(k)) groups.set(k, { label: g, els: [] }); groups.get(k).els.push(el); };
    for (const r of step.reagents || []) {
      const b2 = btn(r.label, () => {
        const list = r.target === 'sel' ? b.tubes.filter((t) => t.id === local.sel) : b.tubes;
        for (const t of list) {
          const msg = r.when && r.when(t, S, b);
          if (msg) { ctx.feedback(msg, 'warn'); return; }
        }
        for (const t of list) r.apply(t, S, ctx, b);
        if (r.log) ctx.log(typeof r.log === 'function' ? r.log(S, b, list) : r.log);
        if (r.obs) ctx.log(typeof r.obs === 'function' ? r.obs(S, b, list) : r.obs, 'obs');
        if (r.advance) ctx.advance(r.advance);
        refresh();
      }, r.cls || '');
      if (r.disabled && r.disabled(S, b, local)) b2.disabled = true;
      put(r.group || L('Реактивы', 'Реактивтер', 'Reagents'), b2);
    }
    for (const kind of step.baths || []) {
      put(L('Водяная баня', 'Су моншасы', 'Water bath'), btn({ ru: 'Все пробирки → ' + tr(BATH_TO[kind], 'ru'), kk: 'Барлық пробирка → ' + tr(BATH_TO[kind], 'kk'), en: 'All tubes → ' + tr(BATH_TO[kind], 'en') }, () => {
        const moved = b.tubes.filter((t) => t.bath !== kind);
        if (!moved.length) return;
        for (const t of moved) t.bath = kind;
        b.swOn = true;
        ctx.log({ ru: `Все пробирки одновременно помещены ${tr(BATH_TO[kind], 'ru')} (${n(M.BATH[kind], 0)} °C); секундомер ${mmss(b.sw)}`, kk: `Барлық пробирка бір мезгілде ${tr(BATH_TO[kind], 'kk')} салынды (${n(M.BATH[kind], 0)} °C); секундомер ${mmss(b.sw)}`, en: `All tubes placed ${tr(BATH_TO[kind], 'en')} at the same time (${n(M.BATH[kind], 0)} °C); stopwatch ${mmss(b.sw)}` });
        if (step.onBath) step.onBath(S, b, ctx, kind, moved);
        refresh();
      }));
      if (step.single) put(L('Водяная баня', 'Су моншасы', 'Water bath'), btn({ ru: 'Выбранную → ' + tr(BATH_TO[kind], 'ru'), kk: 'Таңдалғанды → ' + tr(BATH_TO[kind], 'kk'), en: 'Selected → ' + tr(BATH_TO[kind], 'en') }, () => {
        const t = b.tubes.find((x) => x.id === local.sel);
        if (!t || t.bath === kind) return;
        t.bath = kind; b.swOn = true;
        ctx.log({ ru: `Пробирка «${tr(t.label || M.NAME[t.sug], 'ru')}» помещена ${tr(BATH_TO[kind], 'ru')}; секундомер ${mmss(b.sw)}`, kk: `«${tr(t.label || M.NAME[t.sug], 'kk')}» пробиркасы ${tr(BATH_TO[kind], 'kk')} салынды; секундомер ${mmss(b.sw)}`, en: `Tube “${tr(t.label || M.NAME[t.sug], 'en')}” placed ${tr(BATH_TO[kind], 'en')}; stopwatch ${mmss(b.sw)}` });
        if (step.onBath) step.onBath(S, b, ctx, kind, [t]);
        refresh();
      }));
    }
    if ((step.baths || []).length) {
      const any = b.tubes.some((t) => t.bath);
      const out = btn(L('Вынуть пробирки из бани', 'Пробиркаларды моншадан алу', 'Take the tubes out of the bath'), () => {
        if (!b.tubes.some((t) => t.bath)) return;
        for (const t of b.tubes) t.bath = null;
        ctx.log({ ru: `Пробирки вынуты из бани (секундомер ${mmss(b.sw)})`, kk: `Пробиркалар моншадан алынды (секундомер ${mmss(b.sw)})`, en: `Tubes taken out of the bath (stopwatch ${mmss(b.sw)})` });
        b.swOn = false;
        refresh();
      });
      if (!any) out.disabled = true;
      put(L('Водяная баня', 'Су моншасы', 'Water bath'), out);
    }
    for (const g of groups.values()) wrap.append(group(g.label, row(...g.els)));
    const extra = [];
    if (step.reset) extra.push(btn(L('Вылить и приготовить заново', 'Төгіп, қайта дайындау', 'Empty and prepare again'), () => {
      S.b[step.key] = makeBench(step);
      local.ev = {};
      ctx.log(L('Содержимое пробирок вылито в ёмкость для отходов, пробирки вымыты; проба готовится заново', 'Пробиркалардағы қоспа қалдық ыдысына төгілді, пробиркалар жуылды; сынама қайта дайындалады', 'The tubes were emptied into the waste container and washed; the test is being prepared again'));
      ctx.advance(120);
      ctx.feedback(null); ctx.unsolve && ctx.solved() && ctx.unsolve();
      ctx.save(); ctx.rerender();
    }, 'danger'));
    if (extra.length) wrap.append(row(...extra));
    const timed = (step.baths || []).length || step.timed;
    if (timed) wrap.append(group(L('Ход времени', 'Уақыт жылдамдығы', 'Time speed'), row(seg((step.speeds || [1, 5, 10, 20]).map((s) => [s, '×' + s]), () => local.speed, (v) => { local.speed = v; ctx.save(); }, L('Ход времени', 'Уақыт жылдамдығы', 'Time speed')))));

    const show = () => {
      const inB = b.tubes.filter((t) => t.bath);
      const ro = [];
      if (timed) ro.push({ label: L('Секундомер', 'Секундомер', 'Stopwatch'), value: mmss(b.sw), st: b.swOn ? 'ok' : '' });
      if ((step.baths || []).length) ro.push({ label: L('В бане', 'Моншада', 'In the bath'), value: `${inB.length} / ${b.tubes.length}` });
      const sel = b.tubes.find((t) => t.id === local.sel) || b.tubes[0];
      if (timed) ro.push({ label: { ru: 't пробирки ' + tr(sel.label || M.SHORT[sel.sug], 'ru'), kk: tr(sel.label || M.SHORT[sel.sug], 'kk') + ' пробиркасының t', en: 't of tube ' + tr(sel.label || M.SHORT[sel.sug], 'en') }, value: n(sel.T, 0) + ' °C' });
      ro.push({ label: L('Объём', 'Көлем', 'Volume'), value: { ru: n(sel.v || 0, 2) + ' мл', kk: n(sel.v || 0, 2) + ' мл', en: n(sel.v || 0, 2) + ' mL' } });
      ctx.readouts(ro);
      ctx.update();
    };
    setTimeout(() => { show(); this.after(step, ctx); this.pending(step, ctx); });
    if (timed) {
      let saveAcc = 0;
      ctx.every(100, () => {
        if (local._pause) return;
        const dt = 0.1 * local.speed;
        M.stepBench(b, env, dt);
        local.acc += dt;
        if (local.acc >= 1) { const s = Math.floor(local.acc); local.acc -= s; ctx.advance(s); }
        this.events(step, ctx);
        this.after(step, ctx);
        show();
        saveAcc += 0.1; if (saveAcc > 2) { saveAcc = 0; ctx.save(); }
      });
    } else if (step.test === 'molisch') {
      ctx.every(100, () => { M.stepBench(b, env, 0.5); this.after(step, ctx); show(); });
    }
    return wrap;
  },
  after(step, ctx) {
    const b = benchOf(ctx.state, step.key);
    if (step.check) step.check(ctx.state, b, ctx);
    if (!step.done || ctx.solved()) return;
    const d = step.done(ctx.state, b, ctx);
    if (d) ctx.solve(d === true ? null : d.text || d, d.kind || 'good');
  },
  events(step, ctx) {
    const b = benchOf(ctx.state, step.key);
    for (const ev of step.events || []) {
      if (ctx.local.ev[ev.id]) continue;
      if (ev.when(ctx.state, b)) { ctx.local.ev[ev.id] = 'open'; this.fire(step, ctx, ev); break; }
    }
  },
  pending(step, ctx) {
    const ev = (step.events || []).find((e) => ctx.local.ev[e.id] === 'open');
    if (ev) this.fire(step, ctx, ev);
  },
  fire(step, ctx, ev) {
    ctx.local._pause = true;
    ctx.save();
    ctx.event(ev).then((o) => {
      const S = ctx.state, b = benchOf(S, step.key);
      ctx.local.ev[ev.id] = 'done';
      ctx.local._pause = false;
      ctx.log({ ru: `Событие: ${tr(ev.title, 'ru')} → ${tr(o.label, 'ru')}`, kk: `Оқиға: ${tr(ev.title, 'kk')} → ${tr(o.label, 'kk')}`, en: `Event: ${tr(ev.title, 'en')} → ${tr(o.label, 'en')}` });
      if (!o.ok && (o.severity || o.remark)) ctx.remark({ key: `ev-${ev.id}`, severity: o.severity || 'major', points: o.points, text: o.remark || o.label, whatif: o.whatif, critical: o.critical });
      if (o.effect) o.effect(S, b, ctx);
      if (o.log) ctx.log(o.log, 'obs');
      this.after(step, ctx);
      ctx.save(); ctx.rerender();
    });
  },
  leave(step, ctx) {
    const b = benchOf(ctx.state, step.key);
    if (b && b.tubes.some((t) => t.bath)) {
      for (const t of b.tubes) t.bath = null;
      b.swOn = false;
      ctx.log({ ru: `Пробирки вынуты из бани (секундомер ${mmss(b.sw)})`, kk: `Пробиркалар моншадан алынды (секундомер ${mmss(b.sw)})`, en: `Tubes taken out of the bath (stopwatch ${mmss(b.sw)})` });
    }
  },
  scene(step, ctx) { return benchScene(ctx.state, step.key, { baths: step.baths, sel: (step.single || (step.reagents || []).some((r) => r.target === 'sel')) ? ctx.local.sel : null }); },
  hints(step) {
    return [
      L('Выполните пробу точно по методичке: какие реактивы, сколько и в каком порядке, нужна ли баня и какая.', 'Сынаманы әдістеме бойынша дәл орындаңыз: қандай реактивтер, қанша және қандай ретпен, монша керек пе және қандай.', 'Do the test exactly as in the manual: which reagents, how much, in what order, and whether a bath is needed and which one.'),
      L('Время нагрева и температура бани меняют картину: следите за секундомером.', 'Қыздыру уақыты мен монша температурасы көріністі өзгертеді: секундомерді қадағалаңыз.', 'The heating time and bath temperature change what you see: watch the stopwatch.'),
      L('Добавьте реактивы в порядке инструкции, затем — баня и время по методичке.', 'Реактивтерді нұсқаулық ретімен қосыңыз, содан кейін — әдістемедегі монша мен уақыт.', 'Add the reagents in the order of the instructions, then the bath and time from the manual.'),
    ];
  },
};
