/**
 * Заготовка работы — заполняет сессия L08 (docs/SESSIONS.md) по docs/SCHEMA.md.
 * Пока status: 'draft' — работа видна на главной как «В разработке».
 */
import { L } from '../../app/i18n.js';

export default {
  id: 'lab-08', number: '08', status: 'draft',
  title: L('Реакции карбоновых кислот и их производных с нуклеофилами. Синтез н-бутилацетата и изобутилацетата', 'Карбон қышқылдары мен олардың туындыларының нуклеофилдермен реакциялары. н-Бутилацетат пен изобутилацетат синтезі', 'Reactions of carboxylic acids and their derivatives with nucleophiles. Synthesis of n-butyl acetate and isobutyl acetate'),
  requires: ['lab-00'],
  accent: { light: '#0f766e', dark: '#5eead4' },
  experiments: [],
};
