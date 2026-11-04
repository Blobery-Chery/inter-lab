/**
 * Сборка протокола (SPEC, раздел 10) из прогресса работы: опыты, реактивы, уравнения, наблюдения из журнала,
 * расчёты, выводы, итоговая таблица, «куда делся продукт», индивидуальное задание, замечания, подсказки, оценка.
 * buildReport() — данные (без DOM), reportText() — простой текст, reportPayload() — для api.submitReport().
 */
import { tr, t, L, num, pts, labName, expName } from './i18n.js';
import { summarize } from './grading.js';
import { clockText, dayOf } from './engine.js';
import { esc } from './dom.js';

const SEV = { minor: 'sevMinor', major: 'sevMajor', critical: 'sevCritical', safety: 'sevSafety' };

export function allRemarks(lab, progress) {
  const out = [];
  for (const e of lab.experiments) { const r = progress.runs[e.id]; if (r) out.push(...r.remarks); }
  return out;
}
export function allHints(lab, progress) {
  const out = [];
  for (const e of lab.experiments) { const r = progress.runs[e.id]; if (r) out.push(...r.hints); }
  return out;
}

export function isComplete(lab, progress) {
  return lab.experiments.filter((e) => !e.optional).every((e) => progress.runs[e.id] && progress.runs[e.id].status === 'done');
}

export function gradeOf(lab, progress) {
  const R = progress.results || {};
  const extra = lab.report && lab.report.extra ? lab.report.extra(R) : [];
  return { ...summarize(allRemarks(lab, progress), allHints(lab, progress), extra), extra };
}

export function buildReport(lab, progress, student) {
  const R = progress.results || {};
  const rep = lab.report || {};
  const g = gradeOf(lab, progress);
  const exps = lab.experiments.map((e) => {
    const run = progress.runs[e.id];
    const done = run && run.status === 'done';
    const res = R[e.id] || {};
    const cfg = (rep.experiments || {})[e.id] || {};
    return {
      id: e.id, title: e.title, principle: e.principle, done,
      reagents: done && cfg.reagents ? cfg.reagents(res) : [],
      conditions: done && cfg.conditions ? cfg.conditions(res) : null,
      equations: cfg.equations || e.equation || [],
      observations: run ? run.journal.filter((j) => j.kind === 'obs' && !j.void).map((j) => j.text) : [],
      calculations: done && cfg.calculations ? cfg.calculations(res) : [],
      conclusion: done && cfg.conclusion ? cfg.conclusion(res) : null,
    };
  });
  const journal = [];
  for (const e of lab.experiments) { const r = progress.runs[e.id]; if (r) journal.push(...r.journal); }
  journal.sort((a, b) => a.t - b.t);
  const tMax = journal.length ? journal[journal.length - 1].t : 0;
  let losses = null;
  if (rep.losses && R[rep.losses.from] && R[rep.losses.from].losses && R[rep.losses.from].losses.length) {
    losses = R[rep.losses.from].losses.map((p) => ({ ...p, label: rep.losses.labels[p.id] || p.id, color: (rep.losses.colors || {})[p.id] || 'var(--muted)' }));
  }
  const remarks = allRemarks(lab, progress), hints = allHints(lab, progress);
  return {
    lab, student, exps, journal, losses, remarks, hints, grade: g,
    table: rep.table ? { columns: rep.table.columns, rows: rep.table.rows(R) } : null,
    assignment: rep.assignment || [],
    answers: progress.assignment || {},
    complete: isComplete(lab, progress),
    days: [1, dayOf(tMax)],
    exam: Object.values(progress.runs).some((r) => r.mode === 'exam'),
  };
}

export const gradeWord = (g) => t('grade' + g);

/** Проверка ответа индивидуального задания. */
export function checkAssignment(task, answer, R) {
  if (answer == null || answer === '') return null;
  if (task.kind === 'calc') {
    const v = parseFloat(String(answer).replace(',', '.'));
    const a = task.answer(R);
    return isFinite(v) && Math.abs(v - a) <= Math.abs(a) * (task.tol ?? 0.01) + 1e-9;
  }
  if (task.kind === 'choice') return +answer === task.correct;
  if (task.kind === 'order') return Array.isArray(answer) && answer.every((id, i) => id === task.items[i].id);
  return null;
}

export function answerText(task, answer) {
  if (answer == null || answer === '') return '—';
  if (task.kind === 'choice') return tr(task.options[+answer]);
  if (task.kind === 'order') return answer.map((id, i) => `${i + 1}. ${tr(task.items.find((x) => x.id === id).label)}`).join('; ');
  return String(answer);
}

/** Протокол простым текстом (уходит преподавателю и копируется). */
export function reportText(d, author) {
  const L2 = [];
  L2.push(t('reportTitle').toUpperCase());
  L2.push(`${labName(d.lab)}. ${tr(d.lab.title)}`);
  L2.push(`${t('student')}: ${d.student.name || '—'}   ${t('group')}: ${d.student.group || '—'}`);
  if (d.exam) L2.push(t('examMark'));
  L2.push(`${t('aim')}: ${tr(d.lab.aim)}`);
  for (const e of d.exps) {
    L2.push('', `${expName(d.lab, e.id)}. ${tr(e.title)}${e.done ? '' : ' — ' + t('notDone')}`);
    if (e.reagents.length) L2.push(`${t('reagentsUsed')}: ${e.reagents.map((x) => tr(x)).join('; ')}`);
    for (const q of e.equations) L2.push('  ' + tr(q));
    if (e.conditions) L2.push(tr(e.conditions));
    if (e.observations.length) { L2.push(t('observations') + ':'); for (const o of e.observations) L2.push(' – ' + strip(tr(o))); }
    if (e.calculations.length) { L2.push(t('calculations') + ':'); for (const c of e.calculations) L2.push('  ' + tr(c)); }
    if (e.conclusion) L2.push(`${t('conclusion')}: ${tr(e.conclusion)}`);
  }
  if (d.table) {
    L2.push('', t('summaryTable') + ':');
    L2.push(d.table.columns.map((c) => tr(c)).join(' | '));
    for (const r of d.table.rows) L2.push(r.map((c) => tr(c)).join(' | '));
  }
  if (d.losses) { L2.push('', t('lossTitle') + ':'); for (const p of d.losses) L2.push(` – ${tr(p.label)}: ${Math.round(p.frac * 100)} %`); }
  if (d.assignment.length) {
    L2.push('', t('assignment') + ':');
    d.assignment.forEach((task, i) => { const a = d.answers[task.id] || {}; L2.push(`${i + 1}. ${tr(task.task)}`, `   → ${answerText(task, a.answer)}${a.ok === true ? ' ✓' : a.ok === false ? ' ✗' : ''}`); });
  }
  L2.push('', t('remarks') + ':');
  if (!d.remarks.length && !d.grade.extra.length) L2.push(' ' + t('noRemarks'));
  for (const r of d.remarks) L2.push(` – [${tr(r.step)}] ${tr(r.text)} (−${pts(r.points)})`);
  for (const r of d.grade.extra) L2.push(` – ${tr(r.text)} (−${pts(r.points)}, ${t('resultPenalty')})`);
  const h2 = d.hints.filter((h) => h.level === 2).length, h3 = d.hints.filter((h) => h.level === 3).length;
  L2.push(`${t('hintsUsed')}: ${t('hintsN', { n: d.hints.length, a: h2, b: h3 })}`);
  L2.push(`${t('grade')}: ${d.grade.grade} (${gradeWord(d.grade.grade)}), ${t('penalty')}: ${pts(d.grade.points)}`);
  L2.push('', t('journalFull') + ':');
  for (const j of d.journal) L2.push(`${clockText(j.t, true)}  ${j.kind === 'obs' ? t('obs') + ' ' : ''}${strip(tr(j.text))}`);
  L2.push('', `© ${new Date().getFullYear()} ${author}. ${t('rights')}.`);
  return L2.join('\n');
}

const strip = (s) => String(s).replace(/<[^>]+>/g, '');

/** payload для api.submitReport (формат — в комментариях app/api.js). */
export function reportPayload(d, progress, mode, lang, text) {
  const results = {};
  for (const [id, r] of Object.entries(progress.results || {})) {
    for (const [k, v] of Object.entries(r || {})) if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string') results[`${id}.${k}`] = typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v;
    else if (v && typeof v === 'object' && !Array.isArray(v) && Object.values(v).every((x) => typeof x === 'number')) for (const [kk, vv] of Object.entries(v)) results[`${id}.${k}.${kk}`] = Math.round(vv * 100) / 100;
  }
  return {
    lab: d.lab.id,
    attempt: Math.max(1, ...Object.values(progress.attempts || {})),
    mode: d.exam ? 'exam' : mode, lang,
    grade: d.grade.grade, points: d.grade.points,
    remarks: d.remarks.map((r) => ({ step: tr(r.step), severity: r.severity, points: r.points, text: tr(r.text) }))
      .concat(d.grade.extra.map((r) => ({ step: t('resultPenalty'), severity: 'major', points: r.points, text: tr(r.text) }))),
    hints: d.hints.map((h) => ({ step: tr(h.step), level: h.level })),
    results,
    assignment: d.assignment.map((task) => { const a = d.answers[task.id] || {}; return { task: strip(tr(task.task)), answer: answerText(task, a.answer), ok: task.kind === 'text' ? null : (a.ok ?? false) }; }),
    journal: d.journal.map((j) => ({ t: clockText(j.t, false), kind: j.kind === 'obs' ? 'obs' : j.kind === 'warn' ? 'warn' : 'act', text: strip(tr(j.text)) })),
    reportText: text,
    finishedAt: Date.now(),
  };
}

/** HTML разделов протокола (без задания и кнопок — их строит страница). */
export function reportBodyHTML(d) {
  const eq = (s) => `<div class="eq">${esc(tr(s))}</div>`;
  let h = '';
  h += `<h2>${esc(labName(d.lab))}. ${esc(tr(d.lab.title))}</h2>`;
  if (d.exam) h += `<p class="badge info">${esc(t('examMark'))}</p>`;
  h += `<p><b>${esc(t('aim'))}:</b> ${esc(tr(d.lab.aim))}</p>`;
  for (const e of d.exps) {
    h += `<section><h3>${esc(expName(d.lab, e.id))}. ${esc(tr(e.title))}</h3>`;
    if (!e.done) { h += `<p class="muted">${esc(t('notDone'))}</p></section>`; continue; }
    if (e.reagents.length) h += `<p><b>${esc(t('reagentsUsed'))}:</b> ${e.reagents.map((x) => esc(tr(x))).join('; ')}.</p>`;
    if (e.equations.length) h += `<p><b>${esc(t('equations'))}:</b></p>${e.equations.map(eq).join('')}`;
    if (e.conditions) h += `<p>${esc(tr(e.conditions))}</p>`;
    h += `<p><b>${esc(t('observations'))}:</b></p><ul>${e.observations.length ? e.observations.map((o) => `<li>${tr(o)}</li>`).join('') : '<li>—</li>'}</ul>`;
    if (e.calculations.length) h += `<p><b>${esc(t('calculations'))}:</b></p>${e.calculations.map((c) => `<div class="eq calc">${esc(tr(c))}</div>`).join('')}`;
    if (e.conclusion) h += `<p><b>${esc(t('conclusion'))}:</b> ${esc(tr(e.conclusion))}</p>`;
    h += '</section>';
  }
  if (d.table) {
    h += `<section><h3>${esc(t('summaryTable'))}</h3><div class="tw"><table><thead><tr>${d.table.columns.map((c) => `<th>${esc(tr(c))}</th>`).join('')}</tr></thead><tbody>${d.table.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(tr(c))}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
  }
  if (d.losses) {
    h += `<section><h3>${esc(t('lossTitle'))}</h3><div class="lossbar" aria-hidden="true">${d.losses.map((p) => (p.frac > 0.004 ? `<i style="width:${(p.frac * 100).toFixed(1)}%;background:${p.color}"></i>` : '')).join('')}</div><ul class="losslist">${d.losses.filter((p, i) => i === 0 || p.frac > 0.004).map((p) => `<li><span class="sw" style="background:${p.color}"></span><span>${esc(tr(p.label))}</span><span class="pc">${Math.round(p.frac * 100)} %</span></li>`).join('')}</ul></section>`;
  }
  return h;
}

export function remarksHTML(d) {
  const crit = d.remarks.filter((r) => r.severity === 'critical');
  let h = `<section><h3>${esc(t('remarks'))}</h3>`;
  if (!d.remarks.length && !d.grade.extra.length) h += `<p>${esc(t('noRemarks'))}</p>`;
  else {
    h += '<ul>' + d.remarks.map((r) => `<li><span class="sev ${r.severity}">${esc(t(SEV[r.severity]))}</span>${esc(tr(r.text))} <span class="muted">· ${esc(tr(r.step))}, ${esc(clockText(r.t, true))}</span> <span class="mono">(−${pts(r.points)})</span></li>`).join('');
    h += d.grade.extra.map((r) => `<li><span class="sev major">${esc(t('resultPenalty'))}</span>${esc(tr(r.text))} <span class="mono">(−${pts(r.points)})</span></li>`).join('') + '</ul>';
  }
  if (crit.length) h += `<p><b>${esc(t('emergencies'))}:</b> ${crit.map((r) => esc(tr(r.text))).join('; ')}.</p>`;
  const h2 = d.hints.filter((x) => x.level === 2).length, h3 = d.hints.filter((x) => x.level === 3).length;
  h += `<p><b>${esc(t('hintsUsed'))}:</b> ${esc(t('hintsN', { n: d.hints.length, a: h2, b: h3 }))}</p></section>`;
  h += `<div class="grade"><b>${d.grade.grade}</b><div><div class="eyebrow">${esc(t('gradeFor'))}</div><div>${esc(gradeWord(d.grade.grade))} · ${esc(t('penalty'))}: ${pts(d.grade.points)}</div></div></div>`;
  return h;
}

export function journalHTML(d) {
  return `<details class="card journal" style="margin-top:14px"><summary>${esc(t('journalFull'))} <span class="jcount">· ${d.journal.length}</span></summary><ol class="log" style="max-height:none">${d.journal.map((j) => `<li class="lg ${j.kind}"><time>${esc(clockText(j.t, true))}</time><span>${j.kind === 'obs' ? `<span class="k">${esc(t('obs'))}</span>` : ''}${tr(j.text)}</span></li>`).join('')}</ol></details>`;
}
