// app/api.js в локальном режиме (контракт SPEC, раздел 19).
import { test } from 'node:test';
import assert from 'node:assert/strict';

const mem = new Map();
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), key: (i) => [...mem.keys()][i], get length() { return mem.size; } };
const { api } = await import('../app/api.js');

test('локальный режим: допуск по порогу, статус, протокол, доступ', async () => {
  assert.equal(api.isConnected(), false);
  const s = api.setStudent({ name: ' Тестов ', group: 'Х-31' });
  assert.equal(s.name, 'Тестов'); assert.ok(s.deviceId);
  const a = await api.submitAdmission({ lab: 'lab-06-07', kind: 'admission', attempt: 1, score: 4, total: 5, pass: 4, answers: [] });
  assert.equal(a.status, 'approved');
  assert.equal((await api.getStatus('lab-06-07')).status, 'approved');
  const d = await api.submitAdmission({ lab: 'lab-08', kind: 'admission', attempt: 1, score: 2, total: 5, pass: 4, answers: [] });
  assert.equal(d.status, 'denied');
  const r = await api.submitReport({ lab: 'lab-06-07', grade: 5 });
  assert.ok(r.ok && r.local);
  assert.equal((await api.getAccess()).status, 'open');
  assert.deepEqual(await api.getSettings(), { labs: {} });
});
