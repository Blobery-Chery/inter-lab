// Запись в журнале инструктажа (работа 0): ФИО не спрашивается, подпись — код студента и группа.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pledgeOf, answerText } from '../app/report.js';
import { setLang } from '../app/i18n.js';
import lab00 from '../labs/lab-00/lab.js';

const task = (lab00.lab || lab00).report.assignment.find((x) => x.id === 'journal');
const st = { name: '31842065', group: 'Х-31' };

test('задание журнала не просит ФИО и подписывается автоматически', () => {
  assert.equal(task.sign, true);
  for (const l of ['ru', 'kk', 'en']) assert.doesNotMatch(task.task[l], /ваши ФИО|аты-жөніңіз бен|full name and group/);
  assert.match(task.task.ru, /ФИО не пишите/);
});

test('подпись: клятва + код и группа; дописанное после клятвы отбрасывается', () => {
  setLang('ru');
  assert.equal(answerText(task, 'С правилами техники безопасности ознакомлена, обязуюсь выполнять.', st),
    'С правилами техники безопасности ознакомлена, обязуюсь выполнять. — Код студента: 3184-2065, Группа: Х-31');
  assert.equal(pledgeOf('«С правилами ТБ ознакомлен, обязуюсь выполнять» Иванов И. И., Х-31'), '«С правилами ТБ ознакомлен, обязуюсь выполнять»');
  assert.equal(pledgeOf('Қауіпсіздік техникасы ережелерімен таныстым, орындауға міндеттенемін. Асқар Б.'), 'Қауіпсіздік техникасы ережелерімен таныстым, орындауға міндеттенемін.');
  assert.equal(pledgeOf('I have read the safety rules and undertake to follow them. J. Smith'), 'I have read the safety rules and undertake to follow them.');
  assert.equal(pledgeOf('Ознакомлен'), 'Ознакомлен', 'без ключевых слов — как написано');
  assert.match(answerText(task, '', st), /^— — Код студента: 3184-2065/);
  assert.match(answerText(task, 'обязуюсь выполнять', { name: 'Старое ФИО', group: 'Х-31' }), /Код студента: —/, 'не код — не подставляется');
});
