/**
 * «Кто что делает сейчас» — лёгкие отметки для панели преподавателя (вкладка «Сейчас»).
 *
 * Сайт сообщает серверу, где находится студент: главная, страница работы, тест на допуск, опыт (какой шаг),
 * протокол. Отправляется только при смене места (не чаще раза в 15 с) и раз в 2 минуты, пока вкладка открыта.
 * Отметки не ставятся в очередь и не мешают работе: нет связи или старый сервер без действия activity — молча
 * пропускаем (после ответа «неизвестное действие» до перезагрузки страницы больше не пытаемся).
 * Передаётся только то, что уже уходит преподавателю в заявках и протоколах: ФИО, группа, код устройства,
 * работа, опыт, шаг, число замечаний, штрафные баллы и подсказки.
 */
import { CONFIG } from '../config.js';

const MIN_GAP_MS = 15000;
const HEARTBEAT_MS = 120000;

export function createActivity(api, { enabled = true } = {}) {
  const on = enabled && !!CONFIG.BACKEND_URL && api && api.isConnected && api.isConnected();
  let cur = null;          // последнее место
  let sentKey = '';        // что последним ушло на сервер
  let lastSent = 0;
  let timer = null;
  let dead = !on;

  const keyOf = (a) => a ? [a.view, a.lab || '', a.exp || '', a.step || '', a.status || ''].join('|') : '';

  async function send() {
    timer = null;
    if (dead || !cur) return;
    const student = api.getStudent();
    if (!student || !student.deviceId) return;
    lastSent = Date.now();
    sentKey = keyOf(cur);
    try {
      const res = await fetch(CONFIG.BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'activity', student: { name: student.name || '', group: student.group || '', deviceId: student.deviceId }, act: cur }),
        keepalive: true,
      });
      const out = await res.json().catch(() => null);
      if (out && out.ok === false && out.error === 'bad_action') dead = true; // сервер ещё без этого действия
    } catch (e) { /* нет связи — не страшно, следующая отметка придёт позже */ }
  }

  function schedule() {
    if (dead || timer) return;
    const wait = Math.max(0, MIN_GAP_MS - (Date.now() - lastSent));
    timer = setTimeout(send, wait);
  }

  /** Сообщить, где студент сейчас. act: { view, lab?, exp?, expTitle?, step?, steps?, stepTitle?, stage?, status?, remarks?, penalty?, hints? } */
  function set(act) {
    if (dead || !act || !act.view) return;
    cur = act;
    if (keyOf(act) !== sentKey) schedule();
  }

  if (!dead && typeof setInterval === 'function') {
    setInterval(() => {
      if (!cur || (globalThis.document && document.hidden)) return;
      if (Date.now() - lastSent >= HEARTBEAT_MS - 1000) schedule();
    }, 30000);
    if (globalThis.document) document.addEventListener('visibilitychange', () => { if (!document.hidden && cur && Date.now() - lastSent > HEARTBEAT_MS / 2) schedule(); });
  }

  return { set, get enabled() { return !dead; } };
}
