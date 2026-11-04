# Схема работы и типы шагов

Документ для сессий L00 … L15. Вместе с готовой работой `labs/lab-06-07/` этого достаточно, чтобы сделать свою работу, не трогая движок.

Коротко: **работа — это данные** (`labs/lab-NN/lab.js`), **поведение — в типах шагов** (`app/steps/*.js`). Каждый шаг описывается объектом `{ type, title, instr, need, … }`; всё, что специфично для работы (модель, количества, тексты, последствия), передаётся в шаг функциями.

---

## 1. Файлы работы

```
labs/lab-NN/
  lab.js          описание работы (export default {…}) — обязателен
  admission.js    банк вопросов допуска (export default [...]) — ≥ 15 вопросов (для lab-00 — ≥ 30)
  exp1.js …       опыты (по файлу на опыт удобно, но не обязательно)
  model.js        расчёты и модель (количества, растворимость, pH, выход…) — чистые функции, тестируются в Node
  scene.js        SVG-сцены стенда
  steps/*.js      (необязательно) свои типы шагов
  ASSUMPTIONS.md  допущения (формат — docs/assumptions.md)
  GLOSSARY.md     новые термины: | Русский | Қазақша | English | Примечание |
```

Менять можно **только свою папку**. `labs/manifest.js` уже содержит все работы; поле `status` в `lab.js` имеет приоритет над манифестом — поставьте `status: 'ready'`, когда работа готова.

Импорты из движка — относительные: `import { L, n } from '../../app/i18n.js';`

## 2. Строки и числа

* Любая видимая строка — `L(ru, kk, en)` → `{ru, kk, en}`. Пустых не бывает (тест `tests/i18n-strings.test.js`).
* Числа в текстах пишите **с точкой во всех трёх языках**: `n(2.7376, 2)` → `'2.74'`. Для `ru` и `kk` движок сам покажет `2,74` (заменяет «цифра.цифра»). Поэтому `L(\`Масса ${n(m, 4)} г\`, \`Массасы ${n(m, 4)} г\`, \`Mass ${n(m, 4)} g\`)`.
* В `instr` и наблюдениях можно HTML (`<ol><li>…`, `<b>`, `<p class="note">`).
* Формулы — Юникод: H₂SO₄, NO₂⁺, CO₂↑, °C, ≈, –, −.
* Термины — из `docs/glossary.md`; новых — в свой `GLOSSARY.md`.

## 3. `lab.js`

```js
import { L, n } from '../../app/i18n.js';
import bank from './admission.js';
import exp1 from './exp1.js';

export default {
  id: 'lab-08', number: '08', display: '8', status: 'ready',      // number = сегмент маршрута #/lab/08
  title: L(…), topic: L(…), aim: L(…), relevance: L(…),             // разделы 1–2 методички
  accent: { light: '#0f766e', dark: '#5eead4' },                     // контраст AA на светлом/тёмном фоне
  requires: ['lab-00'],
  theory: [L('<b>…</b> …'), …],                                      // раздел 3 — для страницы допуска
  reagents: [{ id, name: L(…), formula: 'H₂SO₄', conc: L(…), hazard: ['corrosive'|'oxidiser'|'flammable'|'toxic'|'irritant'] }],
  equipment: ['rbf-50', 'reflux-condenser', …],                      // id из app/equipment.js (там уже есть всё из docs/labs.md)
  safety: [L(…), …],                                                 // раздел 7 — памятка рядом со стендом
  admission: { pick: 5, pass: 4, bank },                             // для lab-00: { pick: 10, pass: 8, bank }
  experiments: [exp1, exp2, …],
  report: { … },                                                     // §8
  customSteps: ['./steps/polarimeter-x.js'],                         // необязательно, пути относительно папки работы
};
```

### Банк допуска (`admission.js`)

```js
export default [
  { q: L('Какая частица атакует кольцо?', '…', '…'),
    options: ['NO₂⁺', 'NO₂', 'NO₃⁻', 'H₃O⁺'],      // строки или L(…); перемешиваются при показе
    correct: 0,                                     // индекс верного в options
    why: L('HNO₃ + 2H₂SO₄ → NO₂⁺ + …', …) },        // объяснение — показывается после проверки
];
```

Источники вопросов: вопросы для самоконтроля (раздел 4), теория (3), ход работы (6), ТБ (7) и правила ТБ.

## 4. Опыт

```js
export default {
  id: '1',
  title: L(…), principle: L(…),
  equation: ['C₆H₅COOH + HNO₃ → …'],               // строки или L(…) — идут в протокол
  optional: false,                                  // необязательный опыт не блокирует следующий и протокол
  initialState: ({ prev, rng }) => ({ … }),         // prev — results() предыдущих опытов: prev['1'].purity
  checkpoints: [0, 2, 10],                          // индексы шагов: откуда перезапуск после аварии (critical)
  steps: [ … ],
  results(state, run) { return { mFin, yield, … } },  // числа для протокола и следующих опытов
  summary: (res) => [{ label: L(…), value: '…', st: 'ok'|'warn' }],   // плашки на экране «Опыт завершён»
};
```

**state** — всё состояние опыта: реальные количества (г, мл, ммоль), температуры, флаги ошибок (`leak`, `thin`, `mixHot` …). Сцена, показания, наблюдения и результаты считаются из него. Последствия ошибок записываются в state и проявляются позже (меньше выход, ниже т. пл., другая окраска).

**Лабораторное время** идёт сквозь все опыты работы («День 1 · 09:00» → «День 2»). Шаги двигают его через `ctx.advance(сек)` или поле `advance` действий.

**Контрольная точка.** При замечании `severity: 'critical'` движок показывает окно «Что произошло бы в реальной лаборатории» (текст из `critical.text`), опыт срывается, кнопка перезапускает его с ближайшей контрольной точки ≤ текущего шага: state восстанавливается из снимка, журнал и замечания сохраняются, часы идут дальше (+10 мин).

## 5. Общие поля шага

```js
{
  type: 'weigh',                 // один из 16 базовых или свой
  id: 'weigh',                   // необязательно, для удобства
  title: L(…),
  instr: L('<ol><li>…</li></ol><p class="note">…</p>', …),
  need: L('Запишите массу навески', …),            // подсказка в нижней полосе, пока шаг не решён
  scene: (state, local, ctx) => svgString,         // своя сцена; без неё — сцена типа (весы, цилиндр, пробирки…)
  hints: [L(…), L(…), L(…)],                       // свои подсказки уровней 1–3; без них — подсказки типа
  onLeave(state, ctx) {},                          // при переходе к следующему шагу
}
```

Подсказки: 1 — направление, 2 — конкретика (исключить неверное, порядок величины), 3 — решение с объяснением. Уровни 2 и 3 стоят 0,25 и 0,5 балла. Типы дают подсказки по умолчанию (часто динамические — по текущему состоянию); переопределяйте, где можно сказать точнее.

### ctx — что доступно функциям шагов

```
ctx.state, ctx.local (состояние шага, сохраняется), ctx.rng (по seed попытки), ctx.prev (результаты предыдущих опытов)
ctx.advance(sec), ctx.nextDay(), ctx.now()
ctx.log(text, kind)       kind: 'act' (по умолчанию) | 'obs' (наблюдение — идёт в протокол) | 'calc' | 'warn'
ctx.remark({ key, severity, points?, text, whatif?, critical?: { text } })   key — уникален в попытке (повтор не штрафуется)
ctx.feedback(text, kind)  kind: 'info' | 'good' | 'warn' | 'bad'   (null — убрать)
ctx.solve(text?), ctx.solved()
ctx.readouts([{ label, value, st }]), ctx.update() (перерисовать сцену), ctx.rerender() (перерисовать панель)
```

Тяжесть (SPEC, раздел 6; баллы по умолчанию — `app/grading.js`): `minor` 0,5 · `major` 1 · `critical` 2 (авария, перезапуск) · `safety` 1.

## 6. Базовые типы шагов

Полное описание полей — в шапке каждого файла `app/steps/<type>.js`. Ниже — минимальные примеры из работы 6–7.

### checklist — СИЗ, тяга, средства аварийной защиты
```js
{ type: 'checklist', title, instr, need, scene: hoodScene,
  items: [
    { id: 'gog', label: L('Защитные очки', …), log: L('Надеты защитные очки', …) },
    { id: 'lens', label: L('Работать в контактных линзах', …),                 // ловушка
      wrong: { severity: 'safety', text: L('…(п. 3.2 правил ТБ)', …), whatif: L('Пары скапливаются под линзой…', …) } },
  ] }
```

### pick — выбрать посуду/приборы с полки
```js
{ type: 'pick', shelf: ['conical-50', 'rbf-50', 'reflux-condenser', …],   // id из app/equipment.js или { id, label }
  take: ['conical-50', 'thermometer-100', …],                               // что нужно
  hint1: L('Реакционный сосуд — …', …) }
```

### assemble — собрать установку (неправильная сборка разрешена, последствие — позже)
```js
{ type: 'assemble',
  parts: [{ id: 'buchner', label }, { id: 'funnel', label }, …],
  slots: [{ id: 'top', label, accepts: 'buchner', x: 140, y: 50 }, …],     // x, y — метка места на сцене 360×250
  base: () => svgПодложки,
  onDone(state, placement, errors) { state.leak = placement.seal !== 'cone'; } }
```
Последствие проверяйте в следующем шаге (в 6–7: тонкостенная колба под вакуумом → `critical`, нет уплотнения → потери).

### weigh — аналитические весы (`app/instruments/balance.js`)
```js
{ type: 'weigh', reagent: L('C₆H₅COOH', …), mode: 'spatula', container: 'boat',
  target: 2.0, lo: 1.95, hi: 2.05, saveAs: 'mBA', onRecord(S, m, ctx) { ctx.log(…, 'calc'); } }
{ type: 'weigh', mode: 'transfer', container: 'watch', mass: (S) => S.fin.m * (1 + S.water), saveAs: 'mFin' }
```
Встроенные ошибки: на голую чашку (major), без тарирования (minor), излишек в склянку (safety); при открытых дверцах масса не записывается.

### measure — цилиндр / пипетка / бюретка (`app/instruments/glassware.js`)
```js
{ type: 'measure', measure: 'cylinder-10', reagent: L('конц. H₂SO₄', …), target: 5, tol: 0.25,
  onDeviation: 'consequence',            // или 'block'
  saveAs: 'vAcid', into: L('коническая колба', …), onTransfer(S, v) { … },
  then: [{ id: 'stir', label: L('Перемешать палочкой', …), advance: 120, do(S) { … }, obs: L('…', …) }] }
```

### process — параметр во времени (нагрев, охлаждение, выдержка), события
```js
{ type: 'process', speeds: [5, 10, 30],                         // множители времени; null — только действия
  setup(S, lc, ctx) {},                                         // один раз при первом входе
  controls: [
    { kind: 'action', id: 'ice', group: L('Баня', …), label, requires: [], once: true, advance: 60, do(S, lc, ctx) {}, log, obs },
    { kind: 'toggle', id: 'stir', label, labelOn },              // значение — lc.c.stir
    { kind: 'seg', id: 'rate', options: [[2, '2'], [5, '5']], default: 5 },
    { kind: 'range', id: 'ice', min, max, step, unit, default },
  ],
  tick(S, lc, dt, ctx) { S.T = relax(S.T, target, k, dt); },   // dt — секунды лабораторного времени
  readouts: (S, lc) => [{ label, value: n(S.T, 1) + ' °C', st: S.T <= 5 ? 'ok' : '' }],
  alerts: (S, lc) => S.T > 10 ? { text: L(…), kind: 'warn' } : null,    // зоны «норма/быстро/перебор»
  events: [{ id: 'fumes', when: (S) => S.T > 14, title, text,
    options: [{ ok: true, label, effect(S, lc) {} }, { ok: false, severity: 'major', label, remark, effect }] }],
  chart: { value: (S) => S.T, min: -10, max: 40, band: [0, 10], limit: 10 },   // термограмма
  done: (S, lc, ctx) => S.T <= 5 && { text: L('Раствор охлаждён.', …) } }
```
`relax(T, target, k, dt)` — из `app/instruments/thermal.js`. Событие останавливает время до выбора.

### add — прибавление порциями / по каплям (process + кнопка и ритм)
```js
{ type: 'add', speeds: [5, 10, 20],
  add: { label: L('Капля', …), total: 60, big: true,
         rhythms: [[0, L('вручную', …)], [15, '15 с'], [10, '10 с'], [6, '6 с']],
         onAdd(S, lc, ctx) { lc.pend += 1.5; } },          // lc.added — сколько уже прибавлено
  tick(S, lc, dt, ctx) { … }, controls, events, chart, done: (S, lc) => lc.added >= 60 }
```
Перегрев выше предела — `ctx.remark({ severity: 'critical', critical: { text } })` прямо в `tick`.

### decide — выбор действия с последствиями
```js
{ type: 'decide', inputs: [{ id: 'ice', label, min: 10, max: 60, step: 5, value: 15, unit }],
  question: L(…),
  options: [
    { id: 'ok', ok: true, label, effect(S, inp) {}, why: L(…) },
    { id: 'fast', ok: false, severity: 'minor', label, remark: L(…), whatif: L('Что будет…', …), effect(S, inp) {} },
    { id: 'water', ok: false, label, remark: L(…), critical: { text: L('Что произошло бы…', …) } },
    { id: 'x', ok: false, severity: 'major', retry: true, … },   // можно выбрать снова
  ],
  check(S, inp, ctx) {} }      // проверка ползунков после выбора
```

### order — расставить по порядку
```js
{ type: 'order', items: [{ id: 'a', label }, …] }    // в верном порядке; перемешиваются
```

### separate — фильтрование под вакуумом / делительная воронка
```js
{ type: 'separate', mode: 'filter', keep: 'cake',
  liquids: [{ id: 'ice', ok: true, label }, { id: 'warm', ok: false, severity: 'major', label, remark, whatif, effect(S, F) {} }],
  washings: (S, F) => pH,   okPH: 2.5,
  onVacuum(S, F, ctx) { return true; },   onTransfer, onWash(S, F, liq), finishCheck, onFinish(S, F, ctx) }
{ type: 'separate', mode: 'funnel', keep: 'org',
  layers: [{ id: 'aq', label, color, frac: 0.5 }, { id: 'org', label, color: 'var(--liq-y)', frac: 0.3 }],   // снизу вверх
  onFinish(S, F, ctx) {} }
```
Вылить продукт (неверно выбрать, что оставить) — `critical`.

### test — качественная проба в пробирках
```js
{ type: 'test', tubes: [{ id: 'p', label, init: {} }], indicator: true, reset: true,
  reagents: [{ id: 'hcl', label, group, target: 'sel'|'all', advance: 10, disabled: (t) => t.used,
               apply(tube, S, ctx, tubeId, local) { tube.v += 0.05; tube.pH = …; tube.color = 'rgba(…)'; tube.ppt = 0.8; } }],
  done: (tubes, S) => tubes.p.good,
  observe: { question, options: [{ id, label, log }], correct: (S, tubes) => 'buff', why: (S) => L(…) } }
```
Вид пробирки: `v` (мл), `color`, `ppt` (0…1), `pptColor`, `solid`, `gas`, `mirror` (серебряное зеркало), `layer`, `pH`. Наблюдение считайте из state — если раньше была ошибка, картина другая.

### observe — описать наблюдение (верный ответ зависит от state)
```js
{ type: 'observe', question, options: [{ id: 'pure', label }, { id: 'impure', label }],
  correct: (S) => S.mp.prod.on >= 138.5 ? 'pure' : 'impure', why: (S) => L(…) }
```

### read — снять показание
```js
{ type: 'read', value: (S) => S.T, div: 1, unit: '°C', label, saveAs: 'Tread' }                 // ввод отсчёта
{ type: 'read', mode: 'mp', samples: [{ id: 'prod', name, range: (S) => ({ on, end }), layer: (S) => 2.5 }], saveAs: 'mp', onRecord }
{ type: 'read', mode: 'polarimeter', alpha: (S) => S.alpha, tube: 2, saveAs: 'alpha', tol: 0.1 }
```

### calc — расчёт по своим данным (1 %, 3 попытки, затем решение = подсказка 3)
```js
{ type: 'calc', fields: [{ id: 'th', label, unit: L('г', 'г', 'g'), decimals: 3,
  answer: (S) => S.mBA * 167.12 / 122.12, formula: (S) => L(`m = ${n(S.mBA, 4)} × 167.12 / 122.12`, …) }], saveAs: 'calc1' }
```

### quiz — вопросы внутри опыта
```js
{ type: 'quiz', questions: [{ q, options: [L(…), …], correct: 0, why, points: 0.5 }] }
```

### cleanup — отходы, приборы, руки
```js
{ type: 'cleanup', bins: ['acid', 'organic', 'halogen', 'solid', 'glass', 'sink', 'trash'],
  items: [{ id: 'filtrate', bin: 'acid', label, wrong: { sink: { severity: 'safety', text, whatif } } }],
  switches: [{ id: 'hands', label, log }] }
```

## 7. Свой тип шага (`labs/lab-NN/steps/x.js`)

```js
import { h } from '../../../app/dom.js';
import { L, tr } from '../../../app/i18n.js';
import { btn, row } from '../../../app/ui/controls.js';
import { scene } from '../../../app/scene/svg.js';

export default {
  type: 'lab12-tube-fill',                         // уникальное имя с префиксом работы
  init(step, ctx) { ctx.local.v = 0; },            // один раз; всё состояние — в ctx.local / ctx.state
  render(step, ctx) {                              // → DOM-узел панели; вызывается и при смене языка
    return h('div', { class: 'wfull' }, row(btn(L('Налить', 'Құю', 'Fill'), () => { ctx.local.v++; ctx.update(); if (ctx.local.v > 3) ctx.solve(); })));
  },
  scene(step, ctx) { return scene(`…${ctx.local.v}…`); },
  hints(step, ctx) { return [L(…), L(…), L(…)]; },
};
```
Подключение: `customSteps: ['./steps/x.js']` в `lab.js`. **Правило:** никакого состояния в замыканиях — только `ctx.local`/`ctx.state`, тогда смена языка и перезагрузка страницы не сбрасывают шаг. Таймеры — только через `ctx.every(ms, fn)` / `ctx.timeout` (движок сам их останавливает).

## 8. Протокол (`lab.report`)

```js
report: {
  experiments: {                                   // раздел 8 методички, по опытам; res = results() опыта
    1: { reagents: (res) => [L(…)], conditions: (res) => L(…), calculations: (res) => [L(…)], conclusion: (res) => L(…), equations: […] },
  },
  table: { columns: [L(…)…], rows: (R) => [[…], …] },        // итоговая таблица методички; R = { '1': res1, '2': res2 }
  losses: { from: '1', labels: { product: L(…), … }, colors: { product: 'var(--good)', … } },   // results().losses = [{ id, frac }]
  extra: (R) => [{ text: L('низкий выход', …), points: 1 }],   // баллы за плохой результат, если методичка задаёт норму
  assignment: [
    { id: 'th', kind: 'calc', task: L(…), answer: (R) => 2.74, unit: L('г', …), tol: 0.01, decimals: 2 },
    { id: 'mb', kind: 'choice', task, options: [L(…)…], correct: 0, why },
    { id: 'mech', kind: 'order', task, items: [{ id, label }…] },
    { id: 'free', kind: 'text', task },                       // одно поле свободного ответа — обязательно
  ],
}
```
Наблюдения в протокол берутся из журнала (`ctx.log(…, 'obs')`) — пишите их точно: цвет, осадок, газ, запах, масса, т. пл.

## 9. Сцены (`app/scene/svg.js`, `app/instruments/*`)

Сцена — строка SVG 360 × 250: `scene(inner, label)` добавляет стол. Примитивы: `conical`, `beaker`, `tube`, `tubeRack`, `rbFlask`, `condenser`, `sepFunnel`, `vacuumFilter`, `thermometer`, `rod`, `dropper`, `bath`, `hotplate`, `bottle`, `hood`, `ring`, `bubbles`, `fumes`, `steam`, `ice`, `stand`, `text`. Приборы: `balanceSVG`, `cylinderSVG`, `mpSVG`, `polarimeterSVG`.
Цвета — только CSS-переменные (`var(--liquid)`, `var(--liq-y)`, `var(--solid)`, `var(--nox)` …) или явные `rgba(…)` для окраски растворов; классы `.gl .liq .ice .met .ppt .lbl …`. Движок обновляет сцену «бережно» (меняет только изменившиеся атрибуты), поэтому анимации пузырьков не дёргаются; одноразовую анимацию (каплю) перезапускают новым `data-key`.

## 10. Проверка своей работы

```bash
node --test tests/                 # схема, переводы, банк допуска, ваши расчёты (добавьте tests/labNN-*.test.js)
python3 -m http.server 8000        # http://localhost:8000/#/lab/NN
```
Демонстрация статусов без сервера: `?preview=pending|denied|closed|nohints|access-none|access-pending|access-denied|queued|sent`, контрольный режим — `?mode=exam`.
Проверьте 375 и 1280 px, светлую и тёмную тему, три языка, переключение языка посреди шага (шаг не должен сбрасываться), прохождение и правильное, и с ошибками.

## 11. Дополнения после сквозной проверки (сессия Q)

Схема и сигнатуры не менялись; ниже — уточнения поведения движка и уроки, найденные при прохождении работы 6–7.

* **Сохранение.** Движок сохраняет прогресс после каждого нажатия в панели шага и при уходе со страницы (`pagehide`). Звать `ctx.save()` после каждого действия больше не обязательно, но и не вредно. Состояние по-прежнему держите только в `ctx.local` / `ctx.state`.
* **Наблюдения после аварии.** При перезапуске с контрольной точки записи журнала сорванной попытки (шаги ≥ контрольной точки) помечаются `void: 1`: в полном журнале они остаются, а в «Наблюдения» протокола не идут. Ничего делать не нужно — просто пишите наблюдения через `ctx.log(…, 'obs')`.
* **Контрольный режим.** Попытка опыта, начатая или продолженная без подсказок (`?mode=exam` или подсказки выключены преподавателем), получает `run.mode = 'exam'`; протокол помечается «контрольный режим», в `submitReport` уходит `mode: 'exam'`.
* **Подсказки шагов `process`, `add`, `test`.** Подсказки этих типов по умолчанию — общие фразы («следите за показаниями…»). Для каждого такого шага пишите свои `hints` из трёх уровней; уровень 3 — готовое решение с названиями кнопок шага, слово в слово на каждом языке. Проверка: `tests/lab06-07-steps.test.js` (сделайте такой же для своей работы).
* **Варианты событий должны менять модель.** Если вариант события означает физическое действие («вынуть колбу из бани», «снять с плитки»), отразите его в `state` и учитывайте в `tick` и `scene`, а также дайте способ вернуть всё обратно (кнопка-действие с `disabled`). Иначе выбор не имеет последствий, кроме замечания. Пример — событие `fumes` в `labs/lab-06-07/exp1.js` и кнопка `back`.
* **Тексты кнопок в подсказках.** Цитируя кнопку («Поместить колбу в баню»), копируйте её `label` на всех трёх языках дословно.

## 12. Дополнения финальной сессии (Z)

Обратно совместимо; описанное выше не менялось.

* **`lab.admissionAfterExperiments: true`** — опыты открыты без допуска и проходятся по порядку, а тест «допуска» открывается после всех обязательных опытов (так устроено вводное занятие: этапы 1–7 → итоговый тест → протокол). Протокол по-прежнему требует одобренного теста.
* **`lab.expWord: 'stage'`** — в заголовках, статусах, журнале и протоколе «Этап N» вместо «Опыт N». Помощники `labName(lab)` и `expName(lab, id)` — в `app/i18n.js`.
* **`cleanup`**: ёмкость `heavy` («Отходы солей тяжёлых металлов») — показывается, только если указана в `step.bins`; `step.binLabels: { heavy: L('… (Pb, Cu)', …) }` — своя подпись ёмкости. Замечание за неверную ёмкость теперь несёт `whatif`.
* **`test`**: при смене пробирки панель перерисовывается — `disabled` кнопок реактивов считается для выбранной пробирки.
* **Каталог оборудования**: `tube-holder` (пробиркодержатель).
* **Стили**: токены и темы — `app/tokens.css` (общие для студента и `teacher/`); `app/styles.css` и `teacher/teacher.css` — только раскладка и компоненты.
* **Отладка**: страница опыта выставляет `window.__vlab = { runner, lab, exp, run(), ctx(), types }` — им пользуются сквозные проверки `tests/e2e/` (бот-студент `walk.mjs`, сценарий показа `demo.mjs`, панель `teacher.mjs`).
* **Офлайн**: каждый новый файл работы впишите в `CORE` в `sw.js` (тест `tests/sw.test.js`).
