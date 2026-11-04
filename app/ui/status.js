/** Статус работы для карточек и страницы работы. */
/** Все обязательные опыты (этапы) работы выполнены. */
export function allDone(lab, progress) {
  return ((lab && lab.experiments) || []).every((e) => e.optional || (progress.runs[e.id] && progress.runs[e.id].status === 'done'));
}
import { t } from '../i18n.js';
import * as store from '../store.js';

/**
 * env: { api, settings, labs: Map(id → lab) }
 * → { key, cls, text, adm, briefingWaived }
 */
export async function labStatus(entry, lab, env) {
  const st = (lab && lab.status) || entry.status;
  if (st !== 'ready') return { key: 'draft', cls: '', text: t('stDraft') };
  const set = ((env.settings || {}).labs || {})[entry.id] || {};
  if (set.open === false) return { key: 'closed', cls: 'bad', text: t('stClosed') };
  let waived = false;
  for (const req of (lab && lab.requires) || entry.requires || []) {
    const rl = env.labs.get(req);
    if (!rl || rl.status !== 'ready') { waived = true; continue; }
    const rs = await env.api.getStatus(req);
    if (!rs || rs.status !== 'approved') return { key: 'briefing', cls: 'warn', text: t('stBriefing') };
  }
  const progress = store.loadLab(entry.id);
  const adm = await env.api.getStatus(entry.id);
  if (progress.report && progress.report.sentAt && adm && adm.status === 'approved') return { key: 'done', cls: 'ok', text: t('stDone', { g: progress.report.grade }), waived, adm };
  if (lab && lab.admissionAfterExperiments && (!adm || adm.status !== 'approved')) {
    // вводное занятие: этапы открыты без допуска, итоговый тест — после всех обязательных этапов
    const exps = lab.experiments || [];
    const run = exps.map((e) => progress.runs[e.id]).find((r) => r && r.status !== 'done');
    if (run) return { key: 'progress', cls: 'info', text: t(lab.expWord === 'stage' ? 'stProgressStage' : 'stProgress', { e: run.exp, s: run.step + 1 }), waived, adm, exp: run.exp, expOpen: true };
    if (!adm) return allDone(lab, progress) ? { key: 'noadm', cls: 'warn', text: t('finalTestReady'), waived, adm, expOpen: true }
      : { key: 'noadm', cls: '', text: t('stBriefingTodo'), waived, adm, expOpen: true };
  }
  if (!adm) return { key: 'noadm', cls: '', text: t('stNoAdm'), waived, adm };
  if (adm.status === 'pending') return { key: 'pending', cls: 'info', text: t('stPending'), waived, adm };
  if (adm.status === 'denied') return { key: 'denied', cls: 'bad', text: t('stDenied'), waived, adm };
  const exps = (lab && lab.experiments) || [];
  for (const e of exps) {
    const r = progress.runs[e.id];
    if (r && r.status !== 'done') return { key: 'progress', cls: 'info', text: t(lab.expWord === 'stage' ? 'stProgressStage' : 'stProgress', { e: e.id, s: r.step + 1 }), waived, adm, exp: e.id };
  }
  return { key: 'admitted', cls: 'ok', text: entry.id === 'lab-00' ? t('stBriefingDone') : t('stAdmitted'), waived, adm };
}
