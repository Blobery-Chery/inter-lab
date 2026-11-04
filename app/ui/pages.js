/** Главная, страница работы и экран заявки на доступ. */
import { h, esc } from '../dom.js';
import { tr, t, L, pts, labName, expName } from '../i18n.js';
import * as store from '../store.js';
import { newRun } from '../engine.js';
import { LABS } from '../../labs/manifest.js';
import { EQUIPMENT, equipmentIcon } from '../equipment.js';
import { labStatus, allDone } from './status.js';
import { btn } from './controls.js';
import { confirmDialog, toast } from './modal.js';
import { gradeOf } from '../report.js';

const hazardTx = {
  corrosive: L('едкое', 'күйдіргіш', 'corrosive'), oxidiser: L('окислитель', 'тотықтырғыш', 'oxidiser'), flammable: L('ЛВЖ', 'тез тұтанғыш', 'flammable'),
  toxic: L('токсично', 'улы', 'toxic'), irritant: L('раздражающее', 'тітіркендіргіш', 'irritant'),
};

export function profileForm(api, onSave) {
  const s = api.getStudent();
  const fio = h('input', { type: 'text', id: 'fio', autocomplete: 'name', placeholder: t('fioPh'), value: s.name });
  const grp = h('input', { type: 'text', id: 'grp', placeholder: t('groupPh'), value: s.group });
  const msg = h('span', { class: 'muted', role: 'status', 'aria-live': 'polite' });
  const save = btn(t('save'), () => {
    api.setStudent({ name: fio.value, group: grp.value });
    msg.textContent = t('saved') + ' ✓';
    onSave && onSave();
  }, 'pri');
  return h('div', { class: 'form' },
    h('label', { class: 'field', for: 'fio' }, h('span', null, t('fio')), fio),
    h('label', { class: 'field', for: 'grp' }, h('span', null, t('group')), grp),
    h('div', { class: 'row' }, save, msg));
}

export async function homePage(root, env) {
  const { api } = env;
  root.append(h('section', { class: 'section' },
    h('div', { class: 'eyebrow' }, t('course')),
    h('h1', null, t('discipline')),
    h('p', { class: 'muted' }, t('appName'))));
  root.append(h('section', { class: 'section' }, h('h2', null, t('howTitle')), h('ol', { class: 'how' },
    ...[1, 2, 3, 4].map((i) => h('li', null, h('b', null, t('how' + i)), h('span', null, t('how' + i + 'd')))))));
  const s = api.getStudent();
  const prof = h('section', { class: 'card section', id: 'profile' }, h('h2', null, t('profile')),
    !s.name || !s.group ? h('p', { class: 'banner warn' }, t('profileNeeded')) : null,
    profileForm(api, () => env.rerender()));
  root.append(prof);
  const grid = h('div', { class: 'cards' });
  root.append(h('section', { class: 'section' }, h('h2', null, t('labsTitle')), grid));
  // Карточки рисуются сразу по последнему известному статусу (без ожидания сервера),
  // затем статусы уточняются у сервера — все работы параллельно.
  const quick = api.cachedStatus ? { ...env, api: { ...api, getStatus: async (id) => api.cachedStatus(id) } } : null;
  const live = [];
  for (const entry of [...LABS].sort((a, b) => a.order - b.order)) {
    const lab = env.labs.get(entry.id);
    const st = await labStatus(entry, lab, quick || env);
    const acc = (lab && lab.accent) || entry.accent;
    const badge = h('span', { class: 'badge ' + st.cls }, st.text);
    const card = h('a', { class: 'card labcard' + (st.key === 'draft' ? ' draft' : ''), href: `#/lab/${entry.number}`, style: `--lab-accent:${env.dark ? acc.dark : acc.light}` },
      h('span', { class: 'num' }, labName({ id: entry.id, display: entry.display })),
      h('span', { class: 't' }, tr((lab && lab.title) || entry.title)),
      badge);
    grid.append(card);
    if (quick && st.key !== 'draft') {
      live.push(labStatus(entry, lab, env).then((s2) => {
        badge.className = 'badge ' + s2.cls; badge.textContent = s2.text;
        card.classList.toggle('draft', s2.key === 'draft');
      }).catch(() => {}));
    }
  }
  root.append(h('section', { class: 'section card' }, h('h2', null, t('settingsTitle')),
    h('div', { class: 'row' }, btn(t('resetProgress'), async () => {
      if (await confirmDialog(t('resetConfirm'), t('resetProgress'))) { store.resetProgress(); toast(esc(t('resetDone')), 'info'); env.rerender(); }
    }, 'danger'))));
}

export async function labPage(root, env, entry, lab) {
  const { api } = env;
  const st = await labStatus(entry, lab, env);
  const acc = lab.accent || entry.accent;
  root.style.setProperty('--accent', env.dark ? acc.dark : acc.light);
  root.append(h('a', { class: 'b sm ghost', href: '#/' }, '← ' + t('home')));
  root.append(h('section', { class: 'section' },
    h('div', { class: 'eyebrow' }, labName({ id: entry.id, display: entry.display })),
    h('h1', null, tr(lab.title)),
    h('span', { class: 'badge ' + st.cls }, st.text)));
  if (st.key === 'draft') { root.append(h('p', { class: 'banner info' }, t('draftText'))); return; }
  if (st.key === 'closed') { root.append(h('p', { class: 'banner warn' }, t('labClosedText'))); return; }
  if (st.key === 'briefing') { root.append(h('p', { class: 'banner warn' }, t('briefingText')), h('a', { class: 'b pri', href: '#/lab/00' }, t('intro') + ' →')); return; }
  if (st.waived) root.append(h('p', { class: 'banner info' }, t('briefingDraftNote')));
  if (env.hintsOff(lab)) root.append(h('p', { class: 'banner warn' }, env.mode === 'exam' ? t('examMode') : t('hintsOff')));
  root.append(h('section', { class: 'card section prose' },
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
    const card = h('div', { class: 'card' }, h('div', { class: 'eyebrow' }, expName(lab, e.id) + (e.optional ? ' · ' + t('optional') : '')), h('h3', { style: 'margin-top:4px' }, tr(e.title)), e.principle ? h('p', { class: 'muted', style: 'font-size:13.5px' }, tr(e.principle)) : null);
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
      Object.keys(progress.runs).length ? h('span', { class: 'muted' }, t('penalty') + ': ' + pts(g.points) + ' · ' + t('grade') + ' ' + g.grade) : null)));

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
    const s = api.getStudent();
    const fio = h('input', { type: 'text', id: 'afio', autocomplete: 'name', placeholder: t('fioPh'), value: s.name });
    const grp = h('input', { type: 'text', id: 'agrp', placeholder: t('groupPh'), value: s.group });
    const msg = h('p', { class: 'muted', role: 'status', 'aria-live': 'polite' });
    box.append(h('div', { class: 'form' }, h('label', { class: 'field', for: 'afio' }, h('span', null, t('fio')), fio), h('label', { class: 'field', for: 'agrp' }, h('span', null, t('group')), grp),
      h('div', { class: 'row' }, btn(access.status === 'denied' ? t('accessAgain') : t('accessSend'), async () => {
        if (!fio.value.trim() || !grp.value.trim()) { msg.textContent = t('profileNeeded'); return; }
        api.setStudent({ name: fio.value, group: grp.value });
        try { await api.requestAccess(); recheck(); } catch (e) { msg.textContent = t('sendError', { e: e.message || e }); }
      }, 'pri'))), msg);
  }
  root.append(box);
}
