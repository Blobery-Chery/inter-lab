/**
 * Допуск к работе (SPEC, раздел 8): краткая теория → тест (pick случайных из банка, варианты перемешаны) →
 * результат с разбором → заявка преподавателю через api.submitAdmission → ожидание решения (опрос раз в 30 с).
 */
import { h, esc } from '../dom.js';
import { tr, t, getLang, labName } from '../i18n.js';
import * as store from '../store.js';
import { createRng, hashSeed } from '../rng.js';
import { btn } from './controls.js';

export async function admissionPage(root, env, entry, lab) {
  const { api } = env;
  const cfg = lab.admission || {};
  const bank = cfg.bank || [];
  const pick = cfg.pick || 5, pass = cfg.pass || 4;
  let timer = null;
  const destroy = () => { if (timer) clearInterval(timer); };
  const progress = store.loadLab(entry.id);
  const save = () => store.saveLab(entry.id, progress);
  const back = `#/lab/${entry.number}`;
  root.append(h('a', { class: 'b sm ghost', href: back }, '← ' + t('toLab')),
    h('div', { class: 'section' }, h('div', { class: 'eyebrow' }, labName({ id: entry.id, display: entry.display }) + ' · ' + tr(lab.title)), h('h1', null, lab.admissionAfterExperiments ? t('finalTest') : t('admission'))));
  const main = h('div');
  root.append(main);

  function newSession() {
    const attempt = ((progress.admission && progress.admission.attempt) || 0) + 1;
    const rng = createRng(hashSeed(`${api.getStudent().deviceId}/${lab.id}/adm/${attempt}`));
    const qs = rng.sample(bank.map((_, i) => i), pick);
    progress.admission = { attempt, qs, orders: qs.map((qi) => rng.shuffle(bank[qi].options.map((_, j) => j))), answers: {}, checked: false, submitted: false, startedAt: Date.now(), total: qs.length };
    save();
  }

  async function show() {
    main.innerHTML = '';
    let status = null;
    try { status = await (api.refreshStatus ? api.refreshStatus(entry.id) : api.getStatus(entry.id)); } catch (e) { status = null; }
    const A = progress.admission;
    if (A && A.checked && !A.submitted) return showTest();
    if (status) {
      if (status.status === 'denied' && A && !A.submitted && A.retake) return showTest();
      return showDecision(status);
    }
    if (!A || A.submitted) newSession();
    showTest();
  }

  function theoryBlock() {
    if (!lab.theory || !lab.theory.length) return null;
    return h('details', { class: 'card section' }, h('summary', null, h('b', null, t('theory'))), h('div', { class: 'prose' }, ...lab.theory.map((p) => h('p', { html: tr(p) }))));
  }

  function showTest() {
    const A = progress.admission;
    main.append(theoryBlock() || '', h('p', { class: 'muted' }, t('admIntro', { n: A.qs.length, p: pass })));
    const form = h('div', { class: 'card section' });
    A.qs.forEach((qi, k) => {
      const q = bank[qi];
      const box = h('fieldset', { class: 'q', style: 'border:0;padding:0;margin:0 0 16px' }, h('legend', { class: 'eyebrow' }, t('question', { i: k + 1, n: A.qs.length })), h('p', { html: tr(q.q) }));
      A.orders[k].forEach((oi) => {
        const chosen = A.answers[k] === oi;
        let cls = chosen ? ' on' : '';
        if (A.checked) cls = oi === q.correct ? ' right' : chosen ? ' wrong' : '';
        const b = h('button', { class: 'b opt' + cls, type: 'button', 'aria-pressed': String(chosen), html: tr(q.options[oi]) });
        if (A.checked) b.disabled = true;
        b.onclick = () => { A.answers[k] = oi; save(); main.innerHTML = ''; showTest(); };
        box.append(b);
      });
      if (A.checked) box.append(h('div', { class: 'fb ' + (A.answers[k] === q.correct ? 'good' : 'bad') }, (A.answers[k] === q.correct ? t('correct') : t('wrong')) + '. ', h('span', { html: tr(q.why || '') })));
      form.append(box);
    });
    main.append(form);
    const msg = h('div', { role: 'status', 'aria-live': 'polite' });
    if (!A.checked) {
      main.append(h('div', { class: 'row' }, btn(t('check'), () => {
        if (Object.keys(A.answers).length < A.qs.length) { msg.className = 'fb warn'; msg.textContent = t('answerAll'); return; }
        A.checked = true; A.finishedAt = Date.now();
        A.score = A.qs.filter((qi, k) => A.answers[k] === bank[qi].correct).length;
        save(); submit();
      }, 'pri')), msg);
    } else if (!A.submitted) {
      main.append(h('div', { class: 'row' }, btn(t('resubmit'), submit, 'pri')), msg);
    }
    async function submit() {
      const payload = {
        lab: lab.id, kind: lab.id === 'lab-00' ? 'briefing' : 'admission', attempt: A.attempt,
        score: A.score, total: A.qs.length, pass,
        answers: A.qs.map((qi, k) => ({ q: strip(tr(bank[qi].q)), chosen: A.answers[k] != null ? strip(tr(bank[qi].options[A.answers[k]])) : '', correct: strip(tr(bank[qi].options[bank[qi].correct])), ok: A.answers[k] === bank[qi].correct })),
        lang: getLang(), startedAt: A.startedAt, finishedAt: A.finishedAt,
      };
      try {
        const res = await api.submitAdmission(payload);
        A.submitted = true; A.retake = false; A.result = res; save();
        main.innerHTML = '';
        showDecision({ status: res.status, score: A.score, comment: '' }, true);
      } catch (e) {
        msg.className = 'fb bad'; msg.textContent = t('sendError', { e: e.message || String(e) });
        main.innerHTML = ''; showTest();
      }
    }
  }

  function showDecision(st, fresh) {
    const A = progress.admission;
    const box = h('section', { class: 'card section' });
    if (A && A.checked) box.append(h('h2', null, t('result') + ': ' + t('admScore', { s: A.score, t: A.qs.length })));
    if (fresh) box.append(h('p', { class: 'fb info' }, t('sentToTeacher')));
    if (st.status === 'approved') {
      const after = lab.admissionAfterExperiments;
      box.append(h('p', { class: 'fb good' }, after ? t('briefingApproved') : t('admApproved')), st.comment ? h('p', null, h('b', null, t('teacherComment') + ': '), st.comment) : '',
        h('div', { class: 'row' }, h('a', { class: 'b pri', href: after ? `#/lab/${entry.number}/report` : back }, (after ? t('report') : t('toExperiments')) + ' →')));
    } else if (st.status === 'pending') {
      box.append(h('p', { class: 'fb info' }, t('waitDecision')), h('div', { class: 'row' }, btn(t('checkNow'), () => show())));
      timer = setInterval(async () => { const s = await (api.refreshStatus ? api.refreshStatus(entry.id) : api.getStatus(entry.id)); if (s && s.status !== 'pending') { clearInterval(timer); timer = null; show(); } }, 30000);
    } else {
      box.append(h('p', { class: 'fb bad' }, t('admDenied')), st.comment ? h('p', null, h('b', null, t('teacherComment') + ': '), st.comment) : h('p', null, t('admDeniedAuto', { p: pass })),
        h('div', { class: 'row' }, btn(t('admRetake'), () => { newSession(); progress.admission.retake = true; save(); main.innerHTML = ''; showTest(); }, 'pri')));
    }
    main.append(box);
    if (A && A.checked) {
      const rev = h('details', { class: 'card section' }, h('summary', null, h('b', null, t('result'))));
      A.qs.forEach((qi, k) => {
        const q = bank[qi], ok = A.answers[k] === q.correct;
        rev.append(h('div', { class: 'q' }, h('p', { html: tr(q.q) }), h('div', { class: 'fb ' + (ok ? 'good' : 'bad') }, h('div', null, t('yourAnswer') + ': ', h('span', { html: A.answers[k] != null ? tr(q.options[A.answers[k]]) : '—' })), ok ? null : h('div', null, t('rightAnswer') + ': ', h('span', { html: tr(q.options[q.correct]) })), h('div', { class: 'muted', html: tr(q.why || '') }))));
      });
      main.append(rev);
    }
  }

  await show();
  return { destroy };
}

const strip = (s) => String(s).replace(/<[^>]+>/g, '');
