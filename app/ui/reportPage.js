/** Страница протокола: шапка (ФИО, группа), разделы по методичке, задание, замечания, оценка, отправка, печать. */
import { h, esc } from '../dom.js';
import { tr, t, getLang, num } from '../i18n.js';
import * as store from '../store.js';
import { buildReport, reportBodyHTML, remarksHTML, journalHTML, reportText, reportPayload, checkAssignment, gradeWord } from '../report.js';
import { btn, option } from './controls.js';
import { CONFIG } from '../../config.js';
import { parseNum } from '../steps/calc.js';

export async function reportPage(root, env, entry, lab) {
  const { api } = env;
  const progress = store.loadLab(entry.id);
  const save = () => store.saveLab(entry.id, progress);
  progress.assignment = progress.assignment || {};
  const student = api.getStudent();
  const d = buildReport(lab, progress, student);
  const author = tr(CONFIG.AUTHOR);
  const R = progress.results || {};

  root.append(h('a', { class: 'b sm ghost noprint', href: `#/lab/${entry.number}` }, '← ' + t('toLab')));
  const fio = h('input', { type: 'text', id: 'rfio', value: student.name, autocomplete: 'name' });
  const grp = h('input', { type: 'text', id: 'rgrp', value: student.group });
  const upd = () => api.setStudent({ name: fio.value, group: grp.value });
  fio.oninput = upd; grp.oninput = upd;
  const doc = h('article', { class: 'card doc' });
  doc.append(h('div', { class: 'eyebrow' }, t('reportTitle') + ' · ' + t('discipline')),
    h('div', { class: 'dochead', style: 'margin:10px 0' },
      h('label', { class: 'field', for: 'rfio' }, h('span', null, t('student')), fio),
      h('label', { class: 'field', for: 'rgrp' }, h('span', null, t('group')), grp),
      h('div', { class: 'field' }, h('span', null, t('date')), h('div', { class: 'mono' }, `${t('day')} ${d.days[0] === d.days[1] ? d.days[0] : d.days[0] + '–' + d.days[1]} (${t('labTime')}) · ${new Date().toLocaleDateString(getLang() === 'en' ? 'en-GB' : getLang() === 'kk' ? 'kk-KZ' : 'ru-RU')}`))),
    h('div', { class: 'printonly' }, `${t('student')}: ${student.name || '—'} · ${t('group')}: ${student.group || '—'}`));
  if (!d.complete) doc.append(h('p', { class: 'banner warn' }, t('reportLocked')));
  doc.append(h('div', { html: reportBodyHTML(d) }));

  /* индивидуальное задание */
  const asg = h('section', { class: 'assign' }, h('h3', null, t('assignment')));
  const sent = !!(progress.report && progress.report.sentAt);
  d.assignment.forEach((task, i) => {
    const a = progress.assignment[task.id] || {};
    const box = h('div', { class: 'q' }, h('p', { html: `${i + 1}. ${tr(task.task)}` }));
    const setA = (ans) => { const ok = checkAssignment(task, ans, R); progress.assignment[task.id] = { answer: ans, ok }; save(); env.rerender(); };
    const done = a.answer != null && a.answer !== '' && task.kind !== 'text';
    if (task.kind === 'calc') {
      const inp = h('input', { type: 'text', inputmode: 'decimal', class: 'num', value: a.answer != null ? tr(String(a.answer)) : '', 'aria-label': tr(task.task) });
      if (done || sent) inp.disabled = true;
      box.append(h('div', { class: 'row' }, inp, h('span', { class: 'unit' }, tr(task.unit || '')), done || sent ? null : btn(t('checkAnswer'), () => { const v = parseNum(inp.value); if (isFinite(v)) setA(String(v)); })));
      if (done) box.append(h('div', { class: 'fb ' + (a.ok ? 'good' : 'bad') }, a.ok ? t('correct') : `${t('wrong')}. ${t('rightAnswer')}: ${num(task.answer(R), task.decimals ?? 2)} ${tr(task.unit || '')}`));
    } else if (task.kind === 'choice') {
      task.options.forEach((o, j) => {
        const st = done ? (j === task.correct ? 'right' : +a.answer === j ? 'wrong' : '') : '';
        const b = option(o, () => setA(String(j)), st);
        if (done || sent) b.disabled = true;
        box.append(b);
      });
      if (done && task.why) box.append(h('div', { class: 'fb ' + (a.ok ? 'good' : 'bad') }, (a.ok ? t('correct') : t('wrong')) + '. ' + tr(task.why)));
    } else if (task.kind === 'order') {
      const ord = a.answer || (progress.assignment[task.id + '_o'] = progress.assignment[task.id + '_o'] || task.items.map((x) => x.id).slice().reverse());
      const list = h('ol', { class: 'order' });
      ord.forEach((id, k) => {
        const it = task.items.find((x) => x.id === id);
        const mv = (dd) => () => { const o2 = ord.slice(); const j = k + dd; if (j < 0 || j >= o2.length) return; [o2[k], o2[j]] = [o2[j], o2[k]]; progress.assignment[task.id + '_o'] = o2; save(); env.rerender(); };
        const up = btn('↑', mv(-1), 'sm', { 'aria-label': '↑' }), dn = btn('↓', mv(1), 'sm', { 'aria-label': '↓' });
        if (done || sent || k === 0) up.disabled = true;
        if (done || sent || k === ord.length - 1) dn.disabled = true;
        list.append(h('li', { class: done ? (a.ok ? 'ok' : (id === task.items[k].id ? 'ok' : 'bad')) : '' }, h('span', { class: 'n mono' }, String(k + 1)), h('span', { class: 'tx' }, tr(it.label)), up, dn));
      });
      box.append(list);
      if (!done && !sent) box.append(h('div', { class: 'row' }, btn(t('checkAnswer'), () => setA(ord.slice()))));
      if (done) box.append(h('div', { class: 'fb ' + (a.ok ? 'good' : 'bad') }, a.ok ? t('correct') : t('wrong') + '. ' + t('rightAnswer') + ': ' + task.items.map((x, k) => `${k + 1}. ${tr(x.label)}`).join(' ')));
    } else {
      const ta = h('textarea', { 'aria-label': tr(task.task), placeholder: t('freeAnswer') });
      ta.value = a.answer || '';
      if (sent) ta.disabled = true;
      ta.oninput = () => { progress.assignment[task.id] = { answer: ta.value, ok: null }; save(); };
      box.append(h('label', { class: 'field' }, h('span', null, t('freeAnswer')), ta));
    }
    asg.append(box);
  });
  const auto = d.assignment.filter((x) => x.kind !== 'text');
  const okN = auto.filter((x) => (progress.assignment[x.id] || {}).ok === true).length;
  if (auto.length) asg.append(h('p', { class: 'muted' }, t('autoCheck', { a: okN, b: auto.length })));
  doc.append(asg);
  doc.append(h('div', { html: remarksHTML(d) }));
  doc.append(h('p', { class: 'muted', style: 'margin-top:14px;font-size:12.5px' }, `© ${new Date().getFullYear()} ${author}. ${t('rights')}.`));
  root.append(doc);

  /* отправка */
  const status = h('p', { class: 'status', role: 'status', 'aria-live': 'polite' });
  const showStatus = () => {
    const r = progress.report;
    if (!r || !r.sentAt) { status.className = 'status muted'; status.textContent = d.complete ? t('reportSubmitHint') : t('reportLocked'); return; }
    status.className = 'status ' + (r.queued ? 'warn' : 'ok');
    status.textContent = r.local ? t('savedLocal') + ' ✓' : r.queued ? t('queued') : t('submitted');
  };
  const submitB = btn(sent ? t('resubmit') : t('submit'), async () => {
    const dd = buildReport(lab, progress, api.getStudent());
    const text = reportText(dd, author);
    const mode = env.mode;
    try {
      const res = await api.submitReport(reportPayload(dd, progress, mode, getLang(), text));
      progress.report = { sentAt: Date.now(), id: res.id, queued: !!res.queued, local: !!res.local, grade: dd.grade.grade, points: dd.grade.points };
      save(); env.rerender();
    } catch (e) { status.className = 'status warn'; status.textContent = t('sendError', { e: e.message || String(e) }); }
  }, 'pri');
  if (!d.complete) submitB.disabled = true;
  const copyB = btn(t('copyReport'), async () => {
    const text = reportText(buildReport(lab, progress, api.getStudent()), author);
    try { await navigator.clipboard.writeText(text); copyB.textContent = t('copied') + ' ✓'; } catch (e) {
      const ta = h('textarea', { class: 'cp', 'aria-label': t('report') }); ta.value = text; root.append(ta); ta.select();
    }
  });
  root.append(h('div', { class: 'row noprint', style: 'margin-top:12px' }, submitB, btn(t('print'), () => window.print()), copyB), status);
  root.append(h('div', { html: journalHTML(d) }));
  showStatus();
  return { destroy() {} };
}
