/**
 * Заготовка работы — заполняет сессия L11 (docs/SESSIONS.md) по docs/SCHEMA.md.
 * Пока status: 'draft' — работа видна на главной как «В разработке».
 */
import { L } from '../../app/i18n.js';

export default {
  id: 'lab-11', number: '11', status: 'draft',
  title: L('Аминокислоты. Пептиды и белки. Качественные реакции', 'Аминқышқылдары. Пептидтер және ақуыздар. Сапалық реакциялар', 'Amino acids. Peptides and proteins. Qualitative reactions'),
  requires: ['lab-00'],
  accent: { light: '#be185d', dark: '#f9a8d4' },
  experiments: [],
};
