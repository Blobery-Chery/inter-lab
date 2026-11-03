/** Модальные окна: подтверждение, авария («что произошло бы в реальной лаборатории»), событие в процессе. */
import { h } from '../dom.js';
import { tr, t } from '../i18n.js';

let open = null;

function show(box, onClose) {
  close();
  const prev = document.activeElement;
  const wrap = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, box);
  document.body.append(wrap);
  open = { wrap, prev, onClose };
  const f = box.querySelector('button, [href], input, textarea');
  if (f) f.focus();
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const els = [...box.querySelectorAll('button, [href], input, textarea')].filter((x) => !x.disabled);
      if (!els.length) return;
      const i = els.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { els[els.length - 1].focus(); e.preventDefault(); }
      else if (!e.shiftKey && i === els.length - 1) { els[0].focus(); e.preventDefault(); }
    }
  });
  return wrap;
}

export function close() {
  if (!open) return;
  const { wrap, prev } = open;
  open = null;
  wrap.remove();
  if (prev && prev.focus) try { prev.focus(); } catch (e) { /* элемент исчез */ }
}

export function isOpen() { return !!open; }

export function confirmDialog(text, okLabel, danger = true) {
  return new Promise((resolve) => {
    const yes = h('button', { class: 'b ' + (danger ? 'danger' : 'pri'), type: 'button' }, tr(okLabel || t('confirm')));
    const no = h('button', { class: 'b', type: 'button' }, t('cancel'));
    const box = h('div', { class: 'box' }, h('p', { html: tr(text) }), h('div', { class: 'acts' }, yes, no));
    show(box);
    yes.onclick = () => { close(); resolve(true); };
    no.onclick = () => { close(); resolve(false); };
  });
}

/** Авария: title, text, restartLabel → Promise (нажата кнопка перезапуска). */
export function criticalDialog({ title, text, remark, restartLabel }) {
  return new Promise((resolve) => {
    const btn = h('button', { class: 'b pri', type: 'button' }, tr(restartLabel));
    const box = h('div', { class: 'box crit', 'aria-labelledby': 'mdl-t' },
      h('div', { class: 'eyebrow' }, '⚠ ' + t('accident') + ' · ' + t('expFailed')),
      h('h2', { id: 'mdl-t' }, tr(title || t('realLab'))),
      h('div', { class: 'prose', html: '<p>' + tr(text) + '</p>' }),
      remark ? h('p', { class: 'muted' }, t('remarkW') + ': ' + tr(remark)) : null,
      h('div', { class: 'acts' }, btn));
    show(box);
    btn.onclick = () => { close(); resolve(true); };
  });
}

/** Событие по ходу процесса: ev { title, text, options:[{label}] } → Promise<option>. */
export function eventDialog(ev) {
  return new Promise((resolve) => {
    const acts = h('div', { class: 'acts' });
    const box = h('div', { class: 'box event', 'aria-labelledby': 'mdl-t' },
      h('div', { class: 'eyebrow' }, '⚠ ' + t('event')),
      h('h2', { id: 'mdl-t' }, tr(ev.title)),
      h('div', { class: 'prose', html: '<p>' + tr(ev.text) + '</p>' }),
      h('p', { class: 'lab' }, t('choose')), acts);
    for (const o of ev.options) {
      const b = h('button', { class: 'b opt', type: 'button', html: tr(o.label) });
      b.onclick = () => { close(); resolve(o); };
      acts.append(b);
    }
    show(box);
  });
}

/** Короткое уведомление (замечание). */
export function toast(html, kind = 'warn') {
  let host = document.getElementById('toasts');
  if (!host) { host = h('div', { id: 'toasts', class: 'toasts', 'aria-live': 'polite' }); document.body.append(host); }
  const el = h('div', { class: 'toast ' + kind, html });
  host.append(el);
  setTimeout(() => el.remove(), 4500);
}
