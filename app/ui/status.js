/** Статус работы для карточек и страницы работы. */
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
  if (!adm) return { key: 'noadm', cls: '', text: t('stNoAdm'), waived, adm };
  if (adm.status === 'pending') return { key: 'pending', cls: 'info', text: t('stPending'), waived, adm };
  if (adm.status === 'denied') return { key: 'denied', cls: 'bad', text: t('stDenied'), waived, adm };
  const exps = (lab && lab.experiments) || [];
  for (const e of exps) {
    const r = progress.runs[e.id];
    if (r && r.status !== 'done') return { key: 'progress', cls: 'info', text: t('stProgress', { e: e.id, s: r.step + 1 }), waived, adm, exp: e.id };
  }
  return { key: 'admitted', cls: 'ok', text: entry.id === 'lab-00' ? t('stBriefingDone') : t('stAdmitted'), waived, adm };
}
