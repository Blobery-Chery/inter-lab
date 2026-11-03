/**
 * Заготовка работы — заполняет сессия L13 (docs/SESSIONS.md) по docs/SCHEMA.md.
 * Пока status: 'draft' — работа видна на главной как «В разработке».
 */
import { L } from '../../app/i18n.js';

export default {
  id: 'lab-13', number: '13', status: 'draft',
  title: L('Методы изучения пространственного строения органических молекул', 'Органикалық молекулалардың кеңістіктік құрылысын зерттеу әдістері', 'Methods for studying the spatial structure of organic molecules'),
  requires: ['lab-00'],
  accent: { light: '#15803d', dark: '#86efac' },
  experiments: [],
};
