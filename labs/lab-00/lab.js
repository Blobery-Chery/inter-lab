/**
 * Заготовка работы — заполняет сессия L00 (docs/SESSIONS.md) по docs/SCHEMA.md.
 * Пока status: 'draft' — работа видна на главной как «В разработке».
 */
import { L } from '../../app/i18n.js';

export default {
  id: 'lab-00', number: '00', status: 'draft',
  title: L('Техника безопасности и лабораторное оборудование', 'Қауіпсіздік техникасы және зертханалық құрал-жабдықтар', 'Lab safety and laboratory equipment'),
  requires: [],
  accent: { light: '#b45309', dark: '#fbbf24' },
  experiments: [],
};
