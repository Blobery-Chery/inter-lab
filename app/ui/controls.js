/** Элементы управления панели шага (браузер). Тексты — {ru,kk,en} или строки. */
import { h } from '../dom.js';
import { tr } from '../i18n.js';

export function btn(label, onclick, cls = '', attrs = {}) {
  return h('button', { class: 'b ' + cls, type: 'button', onclick, ...attrs }, tr(label));
}
export function row(...kids) { return h('div', { class: 'row' }, ...kids); }
export function group(label, ...kids) { return h('div', { class: 'grp' }, label ? h('div', { class: 'lab' }, tr(label)) : null, ...kids); }
export function grid(...kids) { return h('div', { class: 'check' }, ...kids); }

/** Сегментный переключатель: options [[value, label]], get() → value, set(v). */
export function seg(options, get, set, aria) {
  const w = h('div', { class: 'seg', role: 'group', 'aria-label': tr(aria || '') });
  options.forEach(([v, label]) => {
    const b = h('button', { class: 'b sm' + (get() === v ? ' on' : ''), type: 'button', 'aria-pressed': String(get() === v) }, tr(label));
    b.onclick = () => {
      set(v);
      [...w.children].forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    };
    w.append(b);
  });
  return w;
}

/** Ползунок с подписью значения. */
export function range({ min, max, step, value, unit, label, oninput }) {
  const out = h('b', { class: 'mono' });
  const inp = h('input', { type: 'range', min, max, step, value, 'aria-label': tr(label || '') });
  const show = () => { out.textContent = tr(String(inp.value)) + (unit ? ' ' + tr(unit) : ''); };
  inp.addEventListener('input', () => { show(); oninput && oninput(+inp.value); });
  show();
  return h('div', { class: 'row rng' }, inp, out);
}

/** Блок «Что будет, если так сделать?» */
export function whatif(title, text) {
  return h('div', { class: 'whatif', role: 'note' }, h('strong', null, tr(title)), h('div', { html: tr(text) }));
}

/** Кнопка-вариант для вопросов (quiz, observe, decide). */
export function option(label, onclick, state = '') {
  return h('button', { class: 'b opt ' + state, type: 'button', onclick, html: tr(label) });
}
