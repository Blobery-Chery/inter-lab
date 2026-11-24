/** Главная, страница работы и экран заявки на доступ. */
import { h, esc } from '../dom.js';
import { tr, t, L, pts, labName, expName } from '../i18n.js';
import * as store from '../store.js';
import { newRun } from '../engine.js';
import { LABS } from '../../labs/manifest.js';
import { EQUIPMENT, equipmentIcon, HAZARD } from '../equipment.js';
import { labStatus, allDone } from './status.js';
import { btn } from './controls.js';
import { confirmDialog, toast } from './modal.js';
import { gradeOf, isComplete } from '../report.js';
import { isCode, formatCode } from '../code.js';

const hazardTx = HAZARD;

/** м-Нитробензойная кислота линией — знак главной страницы (нитрогруппа — акцентом). */
const MOLECULE = `<svg class="molecule" viewBox="0 0 170 180" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
<path d="M60 52 L91 70 L91 106 L60 124 L29 106 L29 70 Z"/><path d="M36 76 L36 100 M66 113 L85 102 M66 63 L85 74"/>
<path d="M91 70 L120 53 L120 22 M126 53 L126 22 M120 53 L148 70"/>
<text x="123" y="14" text-anchor="middle" fill="currentColor" stroke="none" font-family="var(--f-mono)" font-size="15">O</text>
<text x="151" y="76" fill="currentColor" stroke="none" font-family="var(--f-mono)" font-size="15">OH</text>
<path d="M148 80 L166 80" stroke-width="1.6"/>
<g class="no2"><path d="M60 124 L60 150 M60 150 L46 163 M60 150 L74 163"/>
<text x="60" y="179" text-anchor="middle" fill="currentColor" stroke="none" font-family="var(--f-mono)" font-size="14">NO₂</text></g></svg>`;

/** Полоски прогресса: d — выполнено, n — идёт сейчас, '' — впереди. */
export function segsEl(list, cls = 'segs') {
  return h('span', { class: cls, 'aria-hidden': 'true' }, ...list.map((x) => h('i', { class: x || null })));
}
/** Полоски опытов работы (на главной). */
export function expSegs(lab, progress) {
  return ((lab && lab.experiments) || []).map((e) => {
    const r = progress.runs[e.id];
    return r && r.status === 'done' ? 'd' : r ? 'n' : '';
  });
}
/** Полоски шагов одного опыта (вкладки опытов, карточки опытов). */
export function stepSegs(exp, run) {
  const n = (exp.steps || []).length;
  return Array.from({ length: n }, (_, i) => (run && run.status === 'done') || (run && i < run.step) ? 'd' : run && i === run.step ? 'n' : '');
}

/** ФИО и группа сохранены — app/main.js заберёт копию прогресса с сервера (app/sync.js). */
function profileChanged() {
  try { globalThis.dispatchEvent(new Event('vlab-profile')); } catch (e) { /* без восстановления */ }
}

/** Вход по коду студента (8 цифр, выдаёт преподаватель): проверка на сервере, группа — оттуда. ФИО не спрашиваем. */
export function profileForm(api, onSave, { label } = {}) {
  const s = api.getStudent();
  const has = isCode(s.name);
  const inp = h('input', { type: 'text', id: 'scode', class: 'num code', inputmode: 'numeric', autocomplete: 'off', placeholder: '0000-0000', maxlength: '12', value: has ? formatCode(s.name) : '' });
  const msg = h('p', { class: 'muted', role: 'status', 'aria-live': 'polite' });
  const save = btn(label || t('codeEnter'), async () => {
    save.disabled = true;
    msg.className = 'muted'; msg.textContent = t('codeChecking');
    try {
      const r = await api.verifyCode(inp.value);
      msg.className = 'fb good'; msg.textContent = t('codeOk', { code: formatCode(r.code), g: r.group || '—' });
      profileChanged();
      onSave && onSave(r);
    } catch (e) {
      msg.className = 'fb bad'; msg.textContent = e && e.text ? tr(e.text) : t('sendError', { e: (e && e.message) || e });
    } finally { save.disabled = false; }
  }, 'pri');
  inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); save.click(); } };
  return h('div', { class: 'codeform' },
    h('label', { for: 'scode' }, t('studentCode')),
    inp, save,
    has ? h('p', { class: 'now' }, t('codeNow', { code: formatCode(s.name), g: s.group || '—' })) : null,
    h('p', { class: 'hint' }, t('codeHint')),
    msg);
}

export async function homePage(root, env) {
  const { api } = env;
  root.append(h('section', { class: 'hero' },
    h('div', null,
      h('div', { class: 'eyebrow' }, t('course')),
      h('h1', null, t('discipline')),
      h('p', { class: 'lead' }, t('heroLead'))),
    h('div', { html: MOLECULE })));
  root.append(h('section', { class: 'section' }, h('h2', null, t('howTitle')), h('ol', { class: 'how' },
    ...[1, 2, 3, 4].map((i) => h('li', null, h('b', null, `${i} · ${t('how' + i)}`), h('span', null, t('how' + i + 'd')))))));
  const s = api.getStudent();
  root.append(h('section', { class: 'studentcard section', id: 'profile' },
    h('div', null,
      h('h2', null, t('profile')),
      h('p', { class: 'muted' }, t('profileSync')),
      !isCode(s.name) ? h('p', { class: 'note' }, t('profileNeeded')) : null),
    profileForm(api, () => env.rerender())));
  const list = h('ul', { class: 'labrows' });
  root.append(h('section', { class: 'section' },
    h('div', { class: 'sechead' }, h('h2', null, t('labsTitle')),
      h('div', { class: 'legend', 'aria-hidden': 'true' },
        h('span', null, h('i', { class: 'd' }), t('legendDone')), h('span', null, h('i', { class: 'n' }), t('legendNow')), h('span', null, h('i'), t('legendAhead')))),
    list));
  // Строки рисуются сразу по последнему известному статусу (без ожидания сервера),
  // затем статусы уточняются у сервера — все работы параллельно.
  const quick = api.cachedStatus ? { ...env, api: { ...api, getStatus: async (id) => api.cachedStatus(id) } } : null;
  const live = [];
  const segsFor = (lab, st) => {
    const progress = store.loadLab(lab ? lab.id : '');
    const any = Object.keys(progress.runs || {}).length;
    return lab && (any || !['draft', 'closed', 'briefing', 'noadm'].includes(st.key)) ? expSegs(lab, progress) : [];
  };
  for (const entry of [...LABS].sort((a, b) => a.order - b.order)) {
    const lab = env.labs.get(entry.id);
    const st = await labStatus(entry, lab, quick || env);
    const stEl = h('span', { class: 'st ' + st.cls }, st.text);
    let segs = segsEl(segsFor(lab, st));
    const row = h('a', { class: 'labrow' + (st.key === 'draft' ? ' draft' : ''), href: `#/lab/${entry.number}` },
      h('span', { class: 'num' }, String(entry.number).replace('-', '–')),
      h('span', { class: 't' }, tr((lab && lab.title) || entry.title)),
      segs, stEl);
    list.append(h('li', null, row));
    if (quick && st.key !== 'draft') {
      live.push(labStatus(entry, lab, env).then((s2) => {
        stEl.className = 'st ' + s2.cls; stEl.textContent = s2.text;
        row.classList.toggle('draft', s2.key === 'draft');
        const next = segsEl(segsFor(lab, s2)); segs.replaceWith(next); segs = next;
      }).catch(() => {}));
    }
  }
  if (env.footSlot) env.footSlot.append(btn(t('resetProgress'), async () => {
    if (await confirmDialog(t('resetConfirm'), t('resetProgress'))) { store.resetProgress(); toast(esc(t('resetDone')), 'info'); env.rerender(); }
  }));
}

export async function labPage(root, env, entry, lab) {
  const { api } = env;
  const st = await labStatus(entry, lab, env);
  root.append(h('a', { class: 'backlink', href: '#/' }, '← ' + t('home')));
  root.append(h('section', { class: 'section' },
    h('div', { class: 'eyebrow' }, labName({ id: entry.id, display: entry.display })),
    h('h1', null, tr(lab.title)),
    h('span', { class: 'badge ' + st.cls }, st.text)));
  if (st.key === 'draft') { root.append(h('p', { class: 'banner info' }, t('draftText'))); return; }
  if (st.key === 'closed') { root.append(h('p', { class: 'banner warn' }, t('labClosedText'))); return; }
  if (st.key === 'briefing') { root.append(h('p', { class: 'banner warn' }, t('briefingText')), h('a', { class: 'b pri', href: '#/lab/00' }, t('intro') + ' →')); return; }
  if (st.waived) root.append(h('p', { class: 'banner info' }, t('briefingDraftNote')));
  if (env.hintsOff(lab)) root.append(h('p', { class: 'banner warn' }, env.mode === 'exam' ? t('examMode') : t('hintsOff')));
  root.append(h('section', { class: 'card soft section prose' },
    lab.topic ? h('p', null, h('b', null, t('topic') + ': '), tr(lab.topic)) : null,
    lab.aim ? h('p', null, h('b', null, t('aim') + ': '), tr(lab.aim)) : null,
    lab.relevance ? h('p', null, h('b', null, t('relevance') + ': '), tr(lab.relevance)) : null));

  /* допуск (у вводного занятия — итоговый тест после всех этапов) */
  const adm = st.adm;
  const after = !!lab.admissionAfterExperiments;
  const progress = store.loadLab(entry.id);
  const admBox = h('section', { class: 'card section', id: 'admission' }, h('h2', null, after ? t('finalTest') : t('admission')));
  if (!adm && after) {
    if (allDone(lab, progress)) admBox.append(h('p', { class: 'badge warn' }, t('finalTestReady')), h('div', { class: 'row', style: 'margin-top:8px' }, h('a', { class: 'b pri', href: `#/lab/${entry.number}/admission` }, t('finalTestTake'))));
    else admBox.append(h('p', { class: 'muted' }, t('finalTestLocked')));
  } else if (!adm) admBox.append(h('p', { class: 'badge' }, t('stNoAdm')), h('div', { class: 'row', style: 'margin-top:8px' }, h('a', { class: 'b pri', href: `#/lab/${entry.number}/admission` }, t('admTake'))));
  else {
    const cls = adm.status === 'approved' ? 'ok' : adm.status === 'pending' ? 'info' : 'bad';
    admBox.append(h('p', null, h('span', { class: 'badge ' + cls }, adm.status === 'approved' ? (after ? t('stBriefingDone') : t('stAdmitted')) : adm.status === 'pending' ? t('stPending') : t('admDenied')), ' ',
      adm.score != null ? h('span', { class: 'muted' }, t('admScore', { s: adm.score, t: (store.loadLab(entry.id).admission || {}).total || (lab.admission || {}).pick || 5 })) : null));
    if (adm.comment) admBox.append(h('p', { class: 'fb ' + (adm.status === 'denied' ? 'bad' : 'info') }, h('b', null, t('teacherComment') + ': '), adm.comment));
    if (adm.status === 'denied') admBox.append(h('a', { class: 'b pri', href: `#/lab/${entry.number}/admission` }, t('admRetake')));
    if (adm.status === 'pending') admBox.append(h('a', { class: 'b', href: `#/lab/${entry.number}/admission` }, t('checkNow')));
    if (adm.status === 'approved' && after) admBox.append(h('p', { class: 'fb good' }, t('briefingApproved')));
  }
  if (!after) root.append(admBox);

  /* опыты */
  const approved = adm && adm.status === 'approved';
  const expOpen = approved || after;
  const list = h('div', { class: 'cards' });
  lab.experiments.forEach((e, i) => {
    const run = progress.runs[e.id];
    const prevDone = i === 0 || (progress.runs[lab.experiments[i - 1].id] && progress.runs[lab.experiments[i - 1].id].status === 'done') || lab.experiments[i - 1].optional;
    const card = h('div', { class: 'card' }, h('div', { class: 'eyebrow' }, expName(lab, e.id) + (e.optional ? ' · ' + t('optional') : '')), h('h3', { style: 'margin-top:6px' }, tr(e.title)),
      run ? segsEl(stepSegs(e, run), 'segs fill') : null,
      e.principle ? h('p', { class: 'muted', style: 'font-size:15px' }, tr(e.principle)) : null);
    const row = h('div', { class: 'row' });
    if (!expOpen) row.append(h('span', { class: 'muted' }, t('needAdmission')));
    else if (!prevDone && !run) row.append(h('span', { class: 'muted' }, t('expLocked')));
    else {
      if (run && run.status === 'done') row.append(h('span', { class: 'badge ok' }, '✓ ' + t('expDone')));
      if (run && run.status !== 'done') row.append(h('span', { class: 'badge info' }, t('step', { k: run.step + 1, n: e.steps.length })));
      row.append(h('a', { class: 'b pri', href: `#/lab/${entry.number}/exp/${e.id}` }, run ? (run.status === 'done' ? t('open') : t('continue')) : t('start')));
      if (run) row.append(btn(t('redo'), async () => {
        if (!(await confirmDialog(t('redoConfirm'), t('redo')))) return;
        const p = store.loadLab(entry.id);
        newRun(lab, e, p, api.getStudent().deviceId);
        if (p.results) delete p.results[e.id];
        p.report = null;
        store.saveLab(entry.id, p);
        location.hash = `#/lab/${entry.number}/exp/${e.id}`;
      }, 'danger'));
    }
    card.append(row);
    list.append(card);
  });
  root.append(h('section', { class: 'section' }, h('h2', null, lab.expWord === 'stage' ? t('stages') : t('experiments')), list));
  if (after) root.append(admBox);
  const g = gradeOf(lab, progress);
  root.append(h('section', { class: 'section card' }, h('h2', null, t('report')),
    progress.report && progress.report.sentAt ? h('p', null, h('span', { class: 'badge ok' }, t('stDone', { g: progress.report.grade }))) : h('p', { class: 'muted' }, t('reportLocked')),
    h('div', { class: 'row' }, approved ? h('a', { class: 'b pri', href: `#/lab/${entry.number}/report` }, t('report') + ' →') : null,
      Object.keys(progress.runs).length ? h('span', { class: 'muted' }, t('penalty') + ': ' + pts(g.points) + (isComplete(lab, progress) ? ' · ' + t('grade') + ' ' + g.grade : '')) : null)));

  /* реактивы, оборудование, ТБ */
  if (lab.reagents) {
    const rows = lab.reagents.map((r) => h('tr', null, h('td', null, tr(r.name)), h('td', { class: 'mono' }, r.formula), h('td', null, tr(r.conc || '')), h('td', null, (r.hazard || []).map((z) => tr(hazardTx[z] || z)).join(', '))));
    root.append(h('details', { class: 'card section doc' }, h('summary', null, h('b', null, t('reagents'))), h('div', { class: 'tw' }, h('table', { style: 'min-width:0' }, h('tbody', null, ...rows)))));
  }
  if (lab.equipment) root.append(h('details', { class: 'card section' }, h('summary', null, h('b', null, t('equipment'))), h('div', { class: 'shelf', style: 'margin-top:8px' },
    ...lab.equipment.filter((id) => EQUIPMENT[id]).map((id) => h('div', { class: 'tile', title: tr(EQUIPMENT[id].use) }, h('span', { class: 'ico', html: equipmentIcon(id) }), h('span', null, tr(EQUIPMENT[id].name)))))));
  if (lab.safety) root.append(h('details', { class: 'card section' }, h('summary', null, h('b', null, t('safety'))), h('ul', null, ...lab.safety.map((s) => h('li', null, tr(s))))));
}

/** Экран «Заявка на доступ к сайту». */
export async function accessPage(root, env, access, recheck) {
  const { api } = env;
  root.append(h('section', { class: 'section' }, h('div', { class: 'eyebrow' }, t('discipline')), h('h1', null, t('accessTitle')), h('p', null, t('accessText'))));
  const box = h('section', { class: 'card section' });
  if (access.status === 'pending') box.append(h('p', { class: 'fb info' }, t('accessPending')), h('div', { class: 'row' }, btn(t('checkNow'), recheck)));
  else {
    if (access.status === 'denied') box.append(h('p', { class: 'fb bad' }, t('accessDenied') + (access.comment ? ': ' + access.comment : '')));
    const msg = h('p', { class: 'muted', role: 'status', 'aria-live': 'polite' });
    // Код проверяется, затем уходит заявка на доступ.
    box.append(profileForm(api, async () => {
      try { await api.requestAccess(); recheck(); } catch (e) { msg.textContent = t('sendError', { e: (e && e.message) || e }); }
    }, { label: access.status === 'denied' ? t('accessAgain') : t('accessSend') }), msg);
  }
  root.append(box);
}
