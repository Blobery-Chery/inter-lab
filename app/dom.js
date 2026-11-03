/**
 * Мелкие помощники DOM. Без зависимостей; модуль можно импортировать и в Node
 * (функции, трогающие document, вызываются только в браузере).
 */

/** Экранирование текста для вставки в HTML. */
export function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * Создать элемент: h('button', {class:'b', onclick: fn}, 'Текст', child…)
 * Свойства: class, html (innerHTML), style, on<событие>, остальные — атрибуты.
 * Значения null/false пропускаются, true → пустой атрибут.
 */
export function h(tag, props, ...kids) {
  const svg = tag.startsWith('svg:');
  const el = svg ? document.createElementNS('http://www.w3.org/2000/svg', tag.slice(4)) : document.createElement(tag);
  if (props) {
    for (const k in props) {
      const v = props[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.setAttribute('class', v);
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'value') el.value = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  for (const c of kids.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}

/** Найти элемент. */
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/**
 * Обновить содержимое контейнера разметкой html, сохраняя совпадающие узлы
 * (чтобы CSS-анимации стенда не перезапускались при каждом кадре).
 * Узел с другим data-key заменяется целиком (так перезапускается разовая анимация, например капля).
 */
export function morph(container, html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const next = [...tpl.content.childNodes];
  const cur = [...container.childNodes];
  for (let i = 0; i < Math.max(next.length, cur.length); i++) {
    if (!cur[i]) container.appendChild(next[i]);
    else if (!next[i]) container.removeChild(cur[i]);
    else patch(cur[i], next[i]);
  }
}

function patch(a, b) {
  if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName ||
      (a.nodeType === 1 && a.getAttribute('data-key') !== b.getAttribute('data-key'))) {
    a.replaceWith(b);
    return;
  }
  if (a.nodeType !== 1) {
    if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue;
    return;
  }
  for (const { name } of [...a.attributes]) if (!b.hasAttribute(name)) a.removeAttribute(name);
  for (const { name, value } of [...b.attributes]) if (a.getAttribute(name) !== value) a.setAttribute(name, value);
  const ac = [...a.childNodes], bc = [...b.childNodes];
  for (let i = 0; i < Math.max(ac.length, bc.length); i++) {
    if (!ac[i]) a.appendChild(bc[i]);
    else if (!bc[i]) a.removeChild(ac[i]);
    else patch(ac[i], bc[i]);
  }
}

export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const deepClone = (o) => (o == null ? o : JSON.parse(JSON.stringify(o)));
