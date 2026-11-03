/* Офлайн-кэш виртуальной лаборатории. При каждом релизе меняйте CACHE (финальная сессия Z). */
const CACHE = 'vlab-v0.1.0';
const CORE = [
  "./",
  "index.html",
  "config.js",
  "manifest.webmanifest",
  "icon.svg",
  "icon-192.png",
  "icon-512.png",
  "labs/manifest.js",
  "app/api.js",
  "app/dom.js",
  "app/engine.js",
  "app/equipment.js",
  "app/grading.js",
  "app/i18n.js",
  "app/main.js",
  "app/preview.js",
  "app/report.js",
  "app/rng.js",
  "app/store.js",
  "app/styles.css",
  "app/ui/admission.js",
  "app/ui/controls.js",
  "app/ui/experiment.js",
  "app/ui/modal.js",
  "app/ui/pages.js",
  "app/ui/reportPage.js",
  "app/ui/status.js",
  "app/scene/svg.js",
  "app/instruments/balance.js",
  "app/instruments/glassware.js",
  "app/instruments/indicator.js",
  "app/instruments/mp.js",
  "app/instruments/polarimeter.js",
  "app/instruments/thermal.js",
  "app/steps/_common.js",
  "app/steps/add.js",
  "app/steps/assemble.js",
  "app/steps/calc.js",
  "app/steps/checklist.js",
  "app/steps/cleanup.js",
  "app/steps/decide.js",
  "app/steps/index.js",
  "app/steps/measure.js",
  "app/steps/observe.js",
  "app/steps/order.js",
  "app/steps/pick.js",
  "app/steps/process.js",
  "app/steps/quiz.js",
  "app/steps/read.js",
  "app/steps/separate.js",
  "app/steps/test.js",
  "app/steps/weigh.js",
  "labs/lab-06-07/admission.js",
  "labs/lab-06-07/exp1.js",
  "labs/lab-06-07/exp2.js",
  "labs/lab-06-07/exp3.js",
  "labs/lab-06-07/lab.js",
  "labs/lab-06-07/model.js",
  "labs/lab-06-07/scene.js",
  "labs/lab-00/lab.js",
  "labs/lab-08/lab.js",
  "labs/lab-09/lab.js",
  "labs/lab-10/lab.js",
  "labs/lab-11/lab.js",
  "labs/lab-12/lab.js",
  "labs/lab-13/lab.js",
  "labs/lab-14/lab.js",
  "labs/lab-15/lab.js"
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(CORE.map((u) => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

/* Свои файлы и шрифты: сначала кэш, параллельно обновление из сети (stale-while-revalidate).
   Запросы к серверу преподавателя (POST) не кэшируются. */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const own = url.origin === self.location.origin;
  const font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!own && !font) return;
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const hit = await c.match(req, { ignoreSearch: own });
    const net = fetch(req).then((res) => { if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()); return res; }).catch(() => null);
    return hit || (await net) || new Response('', { status: 504, statusText: 'offline' });
  }));
});
