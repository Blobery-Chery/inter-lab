/**
 * Заготовка работы — заполняет сессия L15 (docs/SESSIONS.md) по docs/SCHEMA.md.
 * Пока status: 'draft' — работа видна на главной как «В разработке».
 */
import { L } from '../../app/i18n.js';

export default {
  id: 'lab-15', number: '15', status: 'draft',
  title: L('Углеводы. Моносахариды. Качественные реакции', 'Көмірсулар. Моносахаридтер. Сапалық реакциялар', 'Carbohydrates. Monosaccharides. Qualitative reactions'),
  requires: ['lab-00'],
  accent: { light: '#0e7490', dark: '#67e8f9' },
  experiments: [],
};
