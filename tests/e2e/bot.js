/**
 * Бот-студент для сквозной проверки (выполняется в браузере через page.evaluate).
 * act(mode) делает одно действие на текущем шаге опыта и возвращает, что сделал.
 * mode: 'good' — верно; 'bad' — на каждом шаге сначала одна типичная ошибка (в т. ч. critical), затем верно.
 * Для process/add/test/separate и своих типов шагов бот нажимает кнопки, названные в подсказке 3
 * (там по правилам SCHEMA.md — готовое решение с названиями кнопок), и ждёт.
 */
export async function act(mode) {
  const { tr } = await import('/app/i18n.js');
  const V = window.__vlab;
  const mem = (window.__botMem = window.__botMem || {});
  const strip = (x) => String(tr(x)).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const modal = document.querySelector('.modal');
  if (modal) {
    const btns = [...modal.querySelectorAll('.acts button')];
    if (modal.querySelector('.box.crit')) { btns[0].click(); return { k: 'restart' }; }
    if (modal.querySelector('.box.event')) {
      const title = norm(modal.querySelector('h2').textContent);
      const ev = V && (V.runner.step.events || []).find((e) => strip(e.title) === title);
      const key = 'ev:' + title;
      let idx = -1;
      if (ev) {
        if (mode === 'bad' && !mem[key]) idx = ev.options.findIndex((o) => !o.ok);
        if (idx < 0) idx = ev.options.findIndex((o) => o.ok);
      }
      mem[key] = 1;
      (btns[idx] || btns[0]).click();
      return { k: 'event', title, idx };
    }
    btns[0].click();
    return { k: 'confirm' };
  }
  if (!V) return { k: 'novlab' };
  const R = V.runner, run = V.run(), ctx = V.ctx(), step = R.step, S = run.state, local = ctx.local;
  if (run.status === 'done') return { k: 'done' };
  if (run.status === 'failed') return { k: 'failed-wait' };
  const sk = `${V.lab.id}/${V.exp.id}/${R.stepIndex}`;
  mem[sk] = mem[sk] || { n: 0, wrong: 0 };
  const M = mem[sk];
  M.n++;
  const bar = document.querySelector('.actionbar');
  const next = bar && [...bar.querySelectorAll('button')].pop();
  if (R.isSolved()) { next.click(); return { k: 'next', i: R.stepIndex, type: step.type }; }
  const ctl = document.querySelector('.panel .controls');
  const buttons = () => [...ctl.querySelectorAll('button')];
  const find = (label, root = ctl) => {
    const want = strip(label);
    const bs = [...root.querySelectorAll('button')];
    return bs.find((b) => norm(b.textContent) === want) || bs.find((b) => norm(b.textContent).startsWith(want)) || bs.find((b) => want.length > 3 && norm(b.textContent).includes(want));
  };
  const click = (label, root) => { const b = find(label, root); if (b && !b.disabled) { b.click(); return true; } return false; };
  const bad = mode === 'bad' && !M.wrong;
  const did = (x) => ({ k: x, i: R.stepIndex, type: step.type });
  const qblocks = () => [...ctl.querySelectorAll('.q')];
  const answer = (qEl, q, correctIdx, wrongFirst) => {
    const opts = q.options.map((o) => (typeof o === 'object' && !o.ru && !o.kk && o.label ? o.label : o));
    const bs = [...qEl.querySelectorAll('button.opt')];
    const pickIdx = wrongFirst ? opts.findIndex((_, i) => i !== correctIdx) : correctIdx;
    const want = strip(opts[pickIdx]);
    const b = bs.find((x) => norm(x.textContent) === want);
    if (b) b.click();
    return !!b;
  };

  switch (step.type) {
    case 'checklist': {
      if (bad) { const w = step.items.find((i) => i.wrong); M.wrong = 1; if (w && click(w.label)) return did('wrong-item'); }
      const it = step.items.find((i) => !i.wrong && !local.on[i.id]);
      if (it) { click(it.label); return did('check'); }
      break;
    }
    case 'pick': {
      const ids = step.shelf.map((x) => (typeof x === 'string' ? x : x.id));
      if (bad) {
        const extra = ids.find((id) => !step.take.includes(id));
        if (extra && !local.sel[extra] && !M.extra) { M.extra = 1; [...ctl.querySelectorAll('.tile')][local.order.indexOf(extra)].click(); }
        M.wrong = 1; click(step.checkLabel || 'Взять на рабочее место'); return did('pick-wrong');
      }
      const tiles = [...ctl.querySelectorAll('.tile')];
      for (const id of local.order) {
        const want = step.take.includes(id);
        if (!!local.sel[id] !== want) { tiles[local.order.indexOf(id)].click(); return did('tile'); }
      }
      const cb = buttons().find((b) => b.classList.contains('pri'));
      cb.click(); return did('take');
    }
    case 'decide': {
      let o = null;
      if (bad) { M.wrong = 1; o = step.options.find((x) => !x.ok && !local.tried.includes(x.id) && (M.n > 0)); }
      if (!o) o = step.options.find((x) => x.ok) || step.options.find((x) => !local.tried.includes(x.id));
      const bs = [...ctl.querySelectorAll('button.opt')];
      const b = bs.find((x) => norm(x.textContent) === strip(o.label));
      if (b && !b.disabled) { b.click(); return did(o.ok ? 'decide' : 'decide-wrong'); }
      break;
    }
    case 'quiz': {
      const qs = qblocks();
      for (let i = 0; i < step.questions.length; i++) {
        const m = local.q[i] || {};
        if (m.right != null) continue;
        const w = bad && !(m.wrong || []).length;
        if (w) M.wrong = 1;
        answer(qs[i], step.questions[i], step.questions[i].correct, w);
        return did(w ? 'quiz-wrong' : 'quiz');
      }
      break;
    }
    case 'observe': {
      const right = step.correct(S, ctx);
      const ci = step.options.findIndex((o) => o.id === right);
      if (bad) M.wrong = 1;
      answer(qblocks()[0], { options: step.options.map((o) => o.label) }, ci, bad);
      return did('observe');
    }
    case 'order': {
      if (bad) { M.wrong = 1; click('Проверить порядок'); return did('order-wrong'); }
      local.order = step.items.map((x) => x.id); ctx.rerender();
      click('Проверить порядок'); return did('order');
    }
    case 'calc': {
      const f = step.fields.find((x) => !local.ok[x.id] && !local.shown[x.id]);
      if (!f) break;
      const i = step.fields.indexOf(f);
      const inp = [...ctl.querySelectorAll('input')][i];
      const ans = f.answer(S, ctx);
      const val = bad ? ans * 1.3 + 1 : ans;
      if (bad) M.wrong = 1;
      inp.value = String(+val.toFixed(f.decimals ?? 2));
      [...ctl.querySelectorAll('.field')][i].querySelector('button').click();
      return did(bad ? 'calc-wrong' : 'calc');
    }
    case 'cleanup': {
      const BINS = (await import('/app/steps/cleanup.js')).BINS;
      const bl = { ...BINS, ...(step.binLabels || {}) };
      const it = step.items.find((x) => !local.put[x.id]);
      if (it) {
        if (local.sel !== it.id) { click(it.label); return did('sel'); }
        if (bad) { M.wrong = 1; const wb = (step.bins || Object.keys(BINS)).find((b) => b !== it.bin && b === 'sink') || (step.bins || Object.keys(BINS)).find((b) => b !== it.bin); click(bl[wb]); return did('bin-wrong'); }
        click(bl[it.bin]); return did('bin');
      }
      const s = (step.switches || []).find((x) => !local.sw[x.id]);
      if (s) { click(s.label); return did('switch'); }
      break;
    }
    case 'assemble': {
      for (const sl of step.slots) {
        const want = bad && !M.wrong ? null : sl.accepts;
        if (bad && !M.wrong) {
          // одна ошибка сборки: поменять местами два первых места
          M.wrong = 1; M.swap = true;
        }
        const target = M.swap && step.slots.length > 1 && sl === step.slots[0] ? step.slots[1].accepts : M.swap && sl === step.slots[1] ? step.slots[0].accepts : want || sl.accepts;
        const cur = (local.place || local.placement || {})[sl.id];
        if (cur === target) continue;
        const part = step.parts.find((p) => p.id === target);
        if (local.sel !== target) { const tb = [...ctl.querySelectorAll('.tile, button')].find((b) => norm(b.textContent) === strip(part.label)); if (tb) { tb.click(); return did('part'); } }
        const sb = buttons().find((b) => norm(b.textContent).startsWith(strip(sl.label) + ':'));
        if (sb) { sb.click(); return did('slot'); }
      }
      click(step.doneLabel || 'Установка собрана'); return did('assembled');
    }
    case 'weigh': {
      const b = local.b;
      const doorOpen = () => b.open;
      if (step.mode === 'transfer') {
        if (!b.cont) { if (!doorOpen()) { click('Открыть дверцы'); return did('door'); } click('Поставить'); return did('cont'); }
        if (!b.taredEmpty) { if (doorOpen()) { click('Закрыть дверцы'); return did('door'); } click('Тарировать'); return did('tare'); }
        if (!b.load) { if (!doorOpen()) { click('Открыть дверцы'); return did('door'); } click('Перенести весь продукт'); return did('transfer'); }
        if (doorOpen()) { click('Закрыть дверцы'); return did('door'); }
        if (!M.waited) { M.waited = 1; return { k: 'wait', ms: 1500 }; }
        click('Записать массу'); return did('record');
      }
      if (!b.cont) { if (bad && !M.wrong) { M.wrong = 1; if (!doorOpen()) click('Открыть дверцы'); click('Насыпать шпателем'); return did('bare-pan'); } if (!doorOpen()) { click('Открыть дверцы'); return did('door'); } click('Поставить'); return did('cont'); }
      if (!b.taredEmpty) { if (doorOpen()) { click('Закрыть дверцы'); return did('door'); } click('Тарировать'); return did('tare'); }
      const tgt = step.target, lo = step.lo ?? tgt * 0.98, hi = step.hi ?? tgt * 1.02;
      if (b.load < lo || b.load > hi) {
        if (!doorOpen()) { click('Открыть дверцы'); return did('door'); }
        if (b.load > hi) { click('Отсыпать излишек в стаканчик'); return did('less'); }
        click(tgt - b.load > 0.45 ? 'Насыпать шпателем' : 'Подсыпать чуть-чуть'); return did('add');
      }
      if (doorOpen()) { click('Закрыть дверцы'); return did('door'); }
      if ((M.rec || 0) < 1) { M.rec = 1; return { k: 'wait', ms: 1800 }; }
      click('Записать массу'); return did('record');
    }
    case 'measure': {
      if (!local.moved) {
        const { MEASURES } = await import('/app/instruments/glassware.js');
        const Mx = MEASURES[step.measure || 'cylinder-10'];
        const target = bad && !M.wrong ? step.target * 1.4 : step.target;
        if (bad && !M.wrong && step.onDeviation === 'block') M.wrong = 1;
        const diff = +(target - local.v).toFixed(2);
        if (diff > Mx.div / 2) {
          const steps = Mx.div <= 0.2 ? [1, 0.5, 0.1] : Mx.div <= 0.5 ? [5, 1, 0.5] : [10, 5, 1];
          const d = steps.find((x) => x <= diff + 1e-9) || steps[steps.length - 1];
          const lbl = `+${d.toFixed(1).replace('.', ',')} мл`;
          const bb = buttons().find((x) => norm(x.textContent) === lbl);
          if (bb) { bb.click(); return did('add'); }
        }
        if (bad && !M.wrong) M.wrong = 1;
        const pour = buttons().find((x) => x.classList.contains('pri'));
        pour.click(); return did('pour');
      }
      const a = (step.then || []).find((x) => !local.done[x.id]);
      if (a) { click(a.label); return did('then'); }
      break;
    }
    case 'separate': {
      const F = local;
      if (step.mode === 'funnel') {
        if (F.tapOpen && !F.settled) { click('Закрыть кран'); return did('tap'); }
        if (!F.filled) { click('Залить смесь в воронку'); return did('fill'); }
        if (!F.shaken || (!F.settled && !F.drained && !F.stopper && !F.shakeDone)) {
          if (!F.stopper) { click('Закрыть пробкой'); return did('stopper'); }
          if (bad) { M.wrong = 1; click('Встряхнуть'); return did('shake-novent'); }
          click('Встряхнуть, выпуская пары через кран'); return did('shake');
        }
        if (!F.settled && !F.drained) { click('Закрепить в кольце и дать отстояться'); return did('settle'); }
        if (F.stopper && !F.drained) { click('Снять пробку'); return did('unstopper'); }
        if (!F.drained) { click('Открыть кран'); return did('tap'); }
        const l = step.layers.find((x) => x.id === step.keep);
        click({ ru: 'Оставить: ' + tr(l.label, 'ru') }); return did('keep');
      }
      if (!F.paper) { click('Положить фильтр'); return did('paper'); }
      if (!F.wet) { click('Смочить фильтр водой'); return did('wet'); }
      if (!F.vac && !F.end) { click('Включить вакуум'); return did('vac'); }
      if (!F.moved) { click(step.transferLabel || 'Перенести суспензию на фильтр'); return did('move'); }
      const liqs = step.liquids || [];
      if (bad && liqs.some((x) => !x.ok)) { M.wrong = 1; click(liqs.find((x) => !x.ok).label); return did('wash-wrong'); }
      const okL = liqs.find((x) => x.ok);
      const need = step.washings ? (F.lastPH == null || F.lastCheck !== F.washes || +F.lastPH < (step.okPH ?? 2.5)) : F.washes < (step.minWashes ?? 1);
      if (okL && need && F.washes < 8 && !(step.washings && F.lastCheck !== F.washes && F.washes > 0)) { click(okL.label); return did('wash'); }
      if (step.washings && F.lastCheck !== F.washes) { click('Проверить промывные воды'); return did('test-wash'); }
      if (!F.kept) { click((step.keep || 'cake') === 'cake' ? (step.keepCakeLabel || 'Продукт — осадок на фильтре') : (step.keepFiltrateLabel || 'Продукт — фильтрат')); return did('keep'); }
      click('Отсоединить шланг, затем выключить насос'); return did('end');
    }
    case 'add': {
      const rh = (step.add.rhythms || []).filter((r) => r[0] > 0);
      for (const c of step.controls || []) if (c.kind === 'toggle' && !local.c[c.id] && /еремеш/i.test(strip(c.label))) { click(c.label); return did('stir'); }
      if (rh.length && !local.rh && local.added < step.add.total) {
        const pickR = rh[0]; const seg = [...ctl.querySelectorAll('.seg button')].find((b) => norm(b.textContent) === strip(pickR[1]));
        if (seg) { seg.click(); return did('rhythm'); }
      }
      if (!rh.length && local.added < step.add.total && M.n % 4 === 0) { click(step.add.label); return did('add-one'); }
      break;
    }
    case 'lab00-spot': {
      const T = V.types[step.type];
      if (step.mode === 'locate') { const cur = local.order[local.k]; const el = document.querySelector(`.scenebox [data-l00="${bad && !M.wrong ? step.spots.find((x) => x.id !== cur).id : cur}"]`); M.wrong = 1; if (el) { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); return did('spot'); } break; }
      const tgt = step.spots.find((x) => x.bad && !local.found[x.id]);
      const safe = step.spots.find((x) => !x.bad && !local.found['_ok_' + x.id]);
      const id = bad && !M.wrong && safe ? safe.id : tgt && tgt.id;
      M.wrong = 1;
      const el = id && document.querySelector(`.scenebox [data-l00="${id}"]`);
      if (el) { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); return did('spot'); }
      if (id) { T.hit(step, ctx, id); return did('spot-direct'); }
      break;
    }
    case 'lab00-dress': {
      const T = V.types[step.type];
      for (const g of step.groups) {
        if (T.isOk(g, local)) continue;
        const o = bad && !M.wrong ? g.options.find((x) => !x.ok) : g.options.find((x) => x.ok);
        M.wrong = 1;
        if (click(o.label)) return did('dress');
      }
      break;
    }
    case 'lab00-catalog': {
      const R0 = local.rounds[local.k];
      if (!R0) break;
      const { EQUIPMENT } = await import('/app/equipment.js');
      const id = bad && !M.wrong ? R0.opts.find((x) => x !== R0.id) : R0.id;
      M.wrong = 1;
      const want = strip(EQUIPMENT[id].name);
      const b = [...ctl.querySelectorAll('button.opt')].find((x) => norm(x.textContent) === want);
      if (b) { b.click(); return did('catalog'); }
      break;
    }
    case 'test': {
      if (local.finished && step.observe) {
        const right = step.observe.correct(S, local.tubes);
        const ci = step.observe.options.findIndex((o) => o.id === right);
        if (bad) M.wrong = 1;
        answer(qblocks()[qblocks().length - 1], { options: step.observe.options.map((o) => o.label) }, ci, bad);
        return did('test-observe');
      }
      break;
    }
    case 'read': {
      if (!step.mode || step.mode === 'value') {
        const inp = ctl.querySelector('input');
        if (inp) {
          const v = step.value(S, local), div = step.div || 1;
          const r = Math.round(v / div) * div;
          inp.value = String(+(bad && !M.wrong ? r + div * 5 : r).toFixed(3)).replace('.', ',');
          if (bad) M.wrong = 1;
          const bb = buttons().find((x) => x.classList.contains('pri')) || buttons()[0];
          bb.click(); return did('read');
        }
      }
      break;
    }
    default: break;
  }
  // Подсказки 3 уровня: «… → «Кнопка» → …». Берём названия кнопок из подсказки 3 и нажимаем первую доступную.
  const texts = R.hintTexts(ctx).map((x) => strip(x));
  const h3 = texts[2] || '';
  // условные ветки («Если…», «Перепутали…», «при событии…») не выполняем; «3 × «X»» и ««X» ×5» — повторить
  const main3 = h3.split(/(?:^|[.;]\s*)(?:Перепутали|Если|если|При событии|при событии|Резкое)[^.;]*/)[0] + ' ' + (h3.match(/Если бумага синяя[^.]*/) || [''])[0];
  const quoted = [];
  for (const m of main3.matchAll(/(?:(\d+)\s*[×x]\s*)?[«“"]([^»”"]{2,90})[»”"](?:\s*[×x]\s*(\d+))?/g)) { const k = Math.min(15, +(m[1] || m[3] || 1)); for (let j = 0; j < k; j++) quoted.push(m[2].trim()); }
  const bs = buttons().filter((b) => !b.disabled && !b.classList.contains('on'));
  // скорость времени — максимальная
  const segT = [...ctl.querySelectorAll('.grp')].find((g) => /Ход времени|Time speed|Уақыт/.test(g.textContent));
  if (segT) { const sb = [...segT.querySelectorAll('button')]; const last = sb[sb.length - 1]; if (last && !last.classList.contains('on')) { last.click(); return did('speed'); } }
  M.hq = M.hq || [];
  M.hqi = M.hqi || 0;
  for (; M.hqi < quoted.length; M.hqi++) {
    const q = quoted[M.hqi];
    if (/^Далее$/.test(q)) continue;
    const b = bs.find((x) => norm(x.textContent) === q) || bs.find((x) => norm(x.textContent).startsWith(q)) || bs.find((x) => q.length > 4 && norm(x.textContent).toLowerCase().includes(q.toLowerCase()));
    if (b) { M.hqi++; b.click(); return { ...did('hint3-click'), label: q, k: quoted[M.hqi] === q ? 'wait' : 'hint3-click', ms: 2500 }; }
    if (!M.hqw || M.hqw < 3) { M.hqw = (M.hqw || 0) + 1; return { k: 'idle', i: R.stepIndex, wait: q }; } // кнопка ещё недоступна — подождать
    M.hqw = 0;
  }
  // ничего из подсказки не подошло — подождать (процесс идёт во времени)
  M.idle = (M.idle || 0) + 1;
  if (M.idle % 40 === 0 && M.hqi >= quoted.length && !quoted.some((q, i) => quoted.indexOf(q) !== i)) M.hqi = 0; // ещё раз пройтись по подсказке (кроме порционных)
  return { k: 'idle', i: R.stepIndex, type: step.type, idle: M.idle, quoted, buttons: bs.map((b) => norm(b.textContent)).slice(0, 14) };
}
