/**
 * Заготовка работы — заполняет сессия L14 (docs/SESSIONS.md) по docs/SCHEMA.md.
 * Пока status: 'draft' — работа видна на главной как «В разработке».
 */
import { L } from '../../app/i18n.js';

export default {
  id: 'lab-14', number: '14', status: 'draft',
  title: L('Азосочетание. Получение метилового оранжевого', 'Азоқосылу реакциясы. Метилоранж алу', 'Azo coupling. Preparation of methyl orange'),
  requires: ['lab-00'],
  accent: { light: '#c2410c', dark: '#fdba74' },
  experiments: [],
};
