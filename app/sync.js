/**
 * Копия прогресса на сервере преподавателя — чтобы он не пропадал.
 *
 * Прогресс хранится в браузере. Он теряется, если браузер очищает данные (приватный режим, встроенный браузер
 * мессенджера или сканера QR-кода, компьютер в классе со сбросом), и не виден на другом устройстве.
 * Поэтому каждая работа, пока студент в ней что-то делает, отправляется на сервер (сжатой, не чаще раза в 1,5 минуты
 * и при уходе со страницы), а при входе — с теми же ФИО и группой — забирается обратно.
 * Из двух копий (здесь и на сервере) остаётся та, где сделано больше: завершённые опыты, затем пройденные шаги.
 * Без ФИО и группы на сервер ничего не уходит. Нет связи или старый сервер — сайт работает как раньше.
 */
import { isCode } from './code.js';
import { CONFIG } from '../config.js';
import * as store from './store.js';

const FIRST_MS = 20000;   // первая отправка — через 20 с после изменения
const MIN_GAP_MS = 90000; // дальше — не чаще раза в 1,5 минуты на работу
const KEEPALIVE_MAX = 60000;

/** Сколько сделано в работе: завершённый опыт = 1000, иначе номер шага; сданный протокол — сверху. */
export function progressScore(p) {
  if (!p || !p.runs) return 0;
  let s = 0;
  for (const r of Object.values(p.runs)) s += r && r.status === 'done' ? 1000 : ((r && r.step) || 0) + 1;
  if (p.report && p.report.sentAt) s += 100000;
  return s;
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36) + ':' + str.length;
}

async function pack(obj) {
  let bytes = new TextEncoder().encode(JSON.stringify(obj));
  let kind = 'j.';
  if (globalThis.CompressionStream) {
    try {
      const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
      bytes = new Uint8Array(await new Response(stream).arrayBuffer()); kind = 'g.';
    } catch (e) { bytes = new TextEncoder().encode(JSON.stringify(obj)); kind = 'j.'; }
  }
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return kind + btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function unpack(s) {
  const kind = s.slice(0, 2);
  const b64 = s.slice(2).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '==='.slice((b64.length + 3) % 4));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  if (kind === 'g.') return JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
  if (kind === 'j.') return JSON.parse(new TextDecoder().decode(bytes));
  return null;
}

export function createSync(api, { enabled = true } = {}) {
  let dead = !(enabled && CONFIG.BACKEND_URL && api && api.isConnected && api.isConnected());
  const dirty = new Set();
  const last = store.get('sync', {}) || {}; // { labId: { h: отпечаток отправленного, t: когда } }
  let timer = null;

  // Код студента (группа — на сервере) или, пока коды не введены, ФИО с группой.
  const profileOk = () => { const s = api.getStudent(); return !!(s && s.name && (isCode(s.name) || (s.name.trim() && s.group && s.group.trim()))); };
  const remember = () => store.set('sync', last);

  async function post(action, data, keepalive) {
    const res = await fetch(CONFIG.BACKEND_URL, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...data }), keepalive: !!keepalive,
    });
    const out = await res.json();
    if (out && out.ok === false && out.error === 'bad_action') dead = true; // сервер ещё без этого действия
    return out;
  }

  function arm(delay) {
    if (dead || timer) return;
    timer = setTimeout(() => { timer = null; flush(false); }, delay);
  }

  /** Отправить изменённые работы. keepalive — при уходе со страницы (без ожидания паузы). */
  async function flush(keepalive) {
    if (dead || !dirty.size || !profileOk()) return;
    const student = api.getStudent();
    for (const lab of [...dirty]) {
      const rec = last[lab] || {};
      const wait = MIN_GAP_MS - (Date.now() - (rec.t || 0));
      if (!keepalive && wait > 0) { arm(wait); continue; }
      const progress = store.get('lab_' + lab, null);
      if (!progress) { dirty.delete(lab); continue; }
      const h = hash(JSON.stringify(progress));
      if (h === rec.h) { dirty.delete(lab); continue; }
      try {
        const data = await pack(progress);
        if (keepalive && data.length > KEEPALIVE_MAX) continue;
        const out = await post('saveProgress', { student, lab, data, at: Date.now() }, keepalive);
        if (dead) return;
        if (out && out.ok) { last[lab] = { h, t: Date.now() }; remember(); dirty.delete(lab); }
        else if (out && (out.error === 'no_profile' || out.error === 'bad_code')) return; // ждём код — изменения не теряем
        else { dirty.delete(lab); } // отказ сервера (слишком большой и т. п.) — не повторяем без нового изменения
      } catch (e) { arm(MIN_GAP_MS); return; }
    }
  }

  /**
   * Забрать копии с сервера (по ФИО и группе) и взять те, где сделано больше.
   * skipLab — работа, открытая сейчас в опыте: её не трогаем, чтобы не спорить с открытой страницей.
   * Возвращает число восстановленных работ.
   */
  async function restore({ skipLab = '' } = {}) {
    if (dead || !profileOk()) return 0;
    let out;
    try { out = await post('loadProgress', { student: api.getStudent() }); } catch (e) { return 0; }
    if (!out || out.ok === false) return 0;
    let n = 0;
    for (const it of out.items || []) {
      if (!/^lab-[\d-]+$/.test(it.lab) || it.lab === skipLab) continue;
      let data = null;
      try { data = await unpack(String(it.data || '')); } catch (e) { continue; }
      if (!data || !data.runs) continue;
      const local = store.get('lab_' + it.lab, null);
      if (!local || progressScore(data) > progressScore(local)) {
        store.restoreLab(it.lab, data);
        last[it.lab] = { h: hash(JSON.stringify(data)), t: Date.now() };
        n++;
      } else if (progressScore(local) > progressScore(data)) dirty.add(it.lab); // здесь сделано больше — отправим
    }
    if (n) remember();
    if (dirty.size) arm(1000);
    return n;
  }

  /** Работы, изменённые с последней отправки (например, пока не было ФИО или связи). */
  function scan() {
    for (const k of store.keys('lab_')) {
      const lab = k.slice(4);
      const p = store.get(k, null);
      if (p && hash(JSON.stringify(p)) !== (last[lab] || {}).h && progressScore(p) > 0) dirty.add(lab);
    }
    if (dirty.size) arm(FIRST_MS);
  }

  if (!dead) {
    store.onLabSave((lab) => { dirty.add(lab); arm(FIRST_MS); });
    if (globalThis.document) document.addEventListener('visibilitychange', () => { if (document.hidden) flush(true); });
    if (globalThis.addEventListener) globalThis.addEventListener('pagehide', () => flush(true));
  }

  return { restore, scan, flush: () => flush(false), get enabled() { return !dead; } };
}
