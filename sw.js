// Старый адрес сайта больше не работает как приложение: этот сервис-воркер удаляет кэш старой версии,
// снимает себя и перезагружает открытые вкладки — они попадают на страницу переезда (index.html).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) await caches.delete(k);
  await self.registration.unregister();
  for (const c of await self.clients.matchAll({ type: 'window' })) { try { c.navigate(c.url); } catch (err) { /* вкладка обновится сама */ } }
})()));
