// Связь панели с сервером преподавателя (backend/Code.gs).
// Тот же протокол, что в app/api.js: POST, text/plain, JSON {action, token, …} → {ok, …}.

const TIMEOUT_MS = 25000;

export class ServerError extends Error {
  constructor(code, message, extra = {}) {
    super(message || code);
    this.name = 'ServerError';
    this.code = code;
    Object.assign(this, extra);
  }
}

/**
 * Клиент сервера. getToken() — текущий токен (или '').
 * @returns {{call(action: string, data?: object): Promise<object>, demo: false}}
 */
export function createServerClient(url, getToken) {
  async function call(action, data = {}) {
    if (!url) throw new ServerError('setup', 'BACKEND_URL пуст');
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    let timer;
    const expire = new Promise((_, rej) => {
      timer = setTimeout(() => { if (ctrl) ctrl.abort(); rej(new ServerError('timeout')); }, TIMEOUT_MS);
    });
    let res;
    try {
      const token = getToken ? getToken() : '';
      const body = JSON.stringify({ ...data, action, ...(token && action !== 'login' ? { token } : {}) });
      res = await Promise.race([
        fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body, redirect: 'follow', signal: ctrl ? ctrl.signal : undefined }),
        expire,
      ]);
    } catch (e) {
      if (e instanceof ServerError) throw e;
      throw new ServerError(ctrl && ctrl.signal.aborted ? 'timeout' : 'network', e && e.message);
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) throw new ServerError('bad_response', 'HTTP ' + res.status);
    let out;
    try { out = await res.json(); } catch (e) { throw new ServerError('bad_response', 'not JSON'); }
    if (!out || out.ok === false) {
      throw new ServerError((out && out.error) || 'server', out && out.message, { retryAfter: out && out.retryAfter, attemptsLeft: out && out.attemptsLeft });
    }
    return out;
  }
  return { call, demo: false };
}
