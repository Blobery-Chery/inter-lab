/**
 * Быстрый слой поверх app/api.js (сам api.js не меняется).
 *
 * Сервер преподавателя (Google Apps Script) отвечает за 1–3 с на запрос. Без этого слоя главная страница
 * ждала ~20 запросов подряд (статус инструктажа и допуска для каждой работы), а каждый переход — проверку доступа.
 * Здесь:
 *  - одинаковые запросы объединяются, ответ помнится TTL секунд (статус инструктажа запрашивается один раз, а не 10);
 *  - доступ к сайту и настройки работ сразу берутся из последнего известного ответа (api.js хранит его на устройстве),
 *    а свежий ответ приходит в фоне; если он что-то меняет — onChange() перерисовывает страницу;
 *  - cachedStatus(labId) — последний известный статус синхронно, для мгновенной отрисовки карточек.
 * После submitAdmission / requestAccess соответствующий кэш сбрасывается.
 */

const TTL_MS = 20000;

function readLS(key, fallback) {
  try {
    const raw = globalThis.localStorage && globalThis.localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

export function withFastApi(api, { onChange } = {}) {
  if (!api.isConnected()) return { ...api, cachedStatus: (id) => (readLS('vlab_api_admissions', {}) || {})[id] || null, cachedSettings: () => null };
  const memo = new Map(); // key → { at, p }
  const fresh = (key, fn, ttl = TTL_MS) => {
    const m = memo.get(key);
    if (m && Date.now() - m.at < ttl) return m.p;
    const p = fn().catch((e) => { memo.delete(key); throw e; });
    memo.set(key, { at: Date.now(), p });
    return p;
  };
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  const lsStatus = (labId) => { const a = (readLS('vlab_api_admissions', {}) || {})[labId]; return a ? { status: a.status, score: a.score, comment: a.comment || '', decidedAt: a.decidedAt || null } : null; };
  const liveStatus = (labId) => fresh('status:' + labId, () => api.getStatus(labId));
  // Статус: последний известный на устройстве — сразу, сервер — в фоне; если ответ другой — onChange('status').
  const getStatus = (labId) => {
    const m = memo.get('status:' + labId);
    if (m && Date.now() - m.at < TTL_MS) return m.p;
    const last = lsStatus(labId);
    const live = liveStatus(labId);
    if (!last) return live;
    live.then((s) => { if (!same(s && { status: s.status, comment: s.comment || '' }, { status: last.status, comment: last.comment || '' }) && onChange) onChange('status'); }).catch(() => {});
    return Promise.resolve(last);
  };

  // Доступ к сайту: последнее известное решение — сразу, проверка — в фоне.
  const getAccess = () => {
    const last = readLS('vlab_api_access', null);
    const live = fresh('access', () => api.getAccess(), 60000);
    if (!last || last.status === 'open' || last.status === 'approved') {
      // Без сохранённого ответа не ждём сервер: по умолчанию сайт открыт всем; если окажется иначе — перерисуем.
      live.then((a) => { if (a && a.status !== (last ? last.status : 'open') && onChange) onChange('access'); }).catch(() => {});
      return Promise.resolve(last ? { status: last.status, comment: last.comment || '' } : { status: 'open', comment: '' });
    }
    return live;
  };

  // Настройки работ: последние известные — сразу, свежие — в фоне.
  const getSettings = () => {
    const last = readLS('vlab_api_settings', null);
    const live = fresh('settings', () => api.getSettings(), 60000);
    // Без сохранённых настроек — умолчания (всё открыто, подсказки есть), свежие — в фоне.
    const known = (last && last.labs) || {};
    live.then((s) => { if (s && !same(s.labs || {}, known) && onChange) onChange('settings', s); }).catch(() => {});
    return Promise.resolve({ labs: known });
  };

  return {
    ...api,
    getStatus,
    getAccess,
    getSettings,
    submitAdmission: async (payload) => {
      const res = await api.submitAdmission(payload);
      memo.delete('status:' + payload.lab);
      return res;
    },
    requestAccess: async () => {
      const res = await api.requestAccess();
      memo.delete('access');
      return res;
    },
    /** Сбросить кэш статуса (кнопка «Проверить сейчас» и т. п.). */
    refreshStatus: (labId) => { memo.delete('status:' + labId); return liveStatus(labId); },
    /** Последний известный статус допуска без запроса к серверу (или null). */
    cachedStatus: (labId) => (readLS('vlab_api_admissions', {}) || {})[labId] || null,
  };
}
