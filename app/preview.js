/**
 * Демонстрация статусов без сервера: ?preview=<режим>. Только оборачивает ответы app/api.js, сам api.js не меняет.
 * Режимы: pending · denied · closed · nohints · access-none · access-pending · access-denied · queued · sent
 * Пример: index.html?preview=denied#/lab/06-07
 */
import { getLang } from './i18n.js';

const COMMENT = {
  ru: 'Повторите механизм нитрования и роль серной кислоты, затем пересдайте.',
  kk: 'Нитрлеу механизмін және күкірт қышқылының рөлін қайталап, қайта тапсырыңыз.',
  en: 'Revise the nitration mechanism and the role of sulfuric acid, then retake the test.',
};

export const PREVIEW_MODES = ['pending', 'denied', 'closed', 'nohints', 'access-none', 'access-pending', 'access-denied', 'queued', 'sent'];

export function withPreview(api, mode) {
  if (!mode || !PREVIEW_MODES.includes(mode)) return api;
  const p = { ...api, preview: mode };
  if (mode === 'pending') {
    p.getStatus = async (labId) => (labId === 'lab-00' ? api.getStatus(labId) : { status: 'pending', score: 4, comment: '', decidedAt: null });
    p.submitAdmission = async (pl) => ({ ...(await api.submitAdmission(pl)), status: 'pending' });
  }
  if (mode === 'denied') {
    p.getStatus = async (labId) => (labId === 'lab-00' ? api.getStatus(labId) : { status: 'denied', score: 3, comment: COMMENT[getLang()], decidedAt: Date.now() });
  }
  if (mode === 'closed' || mode === 'nohints') {
    p.getSettings = async () => ({ labs: { 'lab-06-07': { open: mode !== 'closed', hints: mode !== 'nohints', autoAdmit: true } } });
  }
  if (mode.startsWith('access-')) {
    const st = mode.slice(7);
    p.getAccess = async () => ({ status: st, comment: '' });
    p.requestAccess = async () => ({ ok: true, status: 'pending' });
  }
  if (mode === 'queued') p.submitReport = async (pl) => ({ ...(await api.submitReport(pl)), queued: true, local: false });
  if (mode === 'sent') p.submitReport = async (pl) => ({ ...(await api.submitReport(pl)), queued: false, local: false });
  return p;
}
