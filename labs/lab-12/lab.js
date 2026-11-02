/**
 * Заготовка работы — заполняет сессия L12 (docs/SESSIONS.md) по docs/SCHEMA.md.
 * Пока status: 'draft' — работа видна на главной как «В разработке».
 */
import { L } from '../../app/i18n.js';

export default {
  id: 'lab-12', number: '12', status: 'draft',
  title: L('Методы дериватизации энантиомеров. Дериватизирующие реагенты', 'Энантиомерлерді дериватизациялау әдістері. Дериватизациялаушы реагенттер', 'Methods of derivatization of enantiomers. Derivatizing reagents'),
  requires: ['lab-00'],
  accent: { light: '#4338ca', dark: '#a5b4fc' },
  experiments: [],
};
