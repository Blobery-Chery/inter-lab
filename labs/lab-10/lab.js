/**
 * Заготовка работы — заполняет сессия L10 (docs/SESSIONS.md) по docs/SCHEMA.md.
 * Пока status: 'draft' — работа видна на главной как «В разработке».
 */
import { L } from '../../app/i18n.js';

export default {
  id: 'lab-10', number: '10', status: 'draft',
  title: L('Качественные реакции поликарбоновых (оксо- и гидрокси-) кислот и фенолов', 'Поликарбон (оксо- және гидрокси-) қышқылдары мен фенолдардың сапалық реакциялары', 'Qualitative reactions of polycarboxylic (oxo and hydroxy) acids and phenols'),
  requires: ['lab-00'],
  accent: { light: '#a16207', dark: '#fde047' },
  experiments: [],
};
