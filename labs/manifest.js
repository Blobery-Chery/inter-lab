/**
 * Список всех работ дисциплины (docs/labs.md). Поле status в labs/lab-NN/lab.js имеет приоритет.
 * number — сегмент маршрута (#/lab/08), display — номер для показа, order — порядок на главной.
 * Сессия работы меняет только свою папку labs/lab-NN/; этот файл не трогает.
 */
import { L } from '../app/i18n.js';

export const LABS = [
  { id: 'lab-00', number: '00', display: L('Вводное', 'Кіріспе', 'Intro'), folder: 'lab-00', order: 0, status: 'draft', requires: [], accent: { light: '#b45309', dark: '#fbbf24' },
    title: L('Техника безопасности и лабораторное оборудование', 'Қауіпсіздік техникасы және зертханалық құрал-жабдықтар', 'Lab safety and laboratory equipment') },
  { id: 'lab-06-07', number: '06-07', display: '6–7', folder: 'lab-06-07', order: 1, status: 'ready', requires: ['lab-00'], accent: { light: '#1f4fd1', dark: '#86a6ff' },
    title: L('Карбоновые кислоты. Получение м-нитробензойной кислоты', 'Карбон қышқылдары. м-Нитробензой қышқылын алу', 'Carboxylic acids. Preparation of m-nitrobenzoic acid') },
  { id: 'lab-08', number: '08', display: '8', folder: 'lab-08', order: 2, status: 'draft', requires: ['lab-00'], accent: { light: '#0f766e', dark: '#5eead4' },
    title: L('Реакции карбоновых кислот и их производных с нуклеофилами. Синтез н-бутилацетата и изобутилацетата', 'Карбон қышқылдары мен олардың туындыларының нуклеофилдермен реакциялары. н-Бутилацетат пен изобутилацетат синтезі', 'Reactions of carboxylic acids and their derivatives with nucleophiles. Synthesis of n-butyl acetate and isobutyl acetate') },
  { id: 'lab-09', number: '09', display: '9', folder: 'lab-09', order: 3, status: 'draft', requires: ['lab-00'], accent: { light: '#7c3aed', dark: '#c4b5fd' },
    title: L('Диазо- и азосоединения. Синтез иодбензола', 'Диазо- және азоқосылыстар. Иодбензол синтезі', 'Diazo and azo compounds. Synthesis of iodobenzene') },
  { id: 'lab-10', number: '10', display: '10', folder: 'lab-10', order: 4, status: 'draft', requires: ['lab-00'], accent: { light: '#a16207', dark: '#fde047' },
    title: L('Качественные реакции поликарбоновых (оксо- и гидрокси-) кислот и фенолов', 'Поликарбон (оксо- және гидрокси-) қышқылдары мен фенолдардың сапалық реакциялары', 'Qualitative reactions of polycarboxylic (oxo and hydroxy) acids and phenols') },
  { id: 'lab-11', number: '11', display: '11', folder: 'lab-11', order: 5, status: 'draft', requires: ['lab-00'], accent: { light: '#be185d', dark: '#f9a8d4' },
    title: L('Аминокислоты. Пептиды и белки. Качественные реакции', 'Аминқышқылдары. Пептидтер және ақуыздар. Сапалық реакциялар', 'Amino acids. Peptides and proteins. Qualitative reactions') },
  { id: 'lab-12', number: '12', display: '12', folder: 'lab-12', order: 6, status: 'draft', requires: ['lab-00'], accent: { light: '#4338ca', dark: '#a5b4fc' },
    title: L('Методы дериватизации энантиомеров. Дериватизирующие реагенты', 'Энантиомерлерді дериватизациялау әдістері. Дериватизациялаушы реагенттер', 'Methods of derivatization of enantiomers. Derivatizing reagents') },
  { id: 'lab-13', number: '13', display: '13', folder: 'lab-13', order: 7, status: 'draft', requires: ['lab-00'], accent: { light: '#15803d', dark: '#86efac' },
    title: L('Методы изучения пространственного строения органических молекул', 'Органикалық молекулалардың кеңістіктік құрылысын зерттеу әдістері', 'Methods for studying the spatial structure of organic molecules') },
  { id: 'lab-14', number: '14', display: '14', folder: 'lab-14', order: 8, status: 'draft', requires: ['lab-00'], accent: { light: '#c2410c', dark: '#fdba74' },
    title: L('Азосочетание. Получение метилового оранжевого', 'Азоқосылу реакциясы. Метилоранж алу', 'Azo coupling. Preparation of methyl orange') },
  { id: 'lab-15', number: '15', display: '15', folder: 'lab-15', order: 9, status: 'draft', requires: ['lab-00'], accent: { light: '#0e7490', dark: '#67e8f9' },
    title: L('Углеводы. Моносахариды. Качественные реакции', 'Көмірсулар. Моносахаридтер. Сапалық реакциялар', 'Carbohydrates. Monosaccharides. Qualitative reactions') },
];

export const byNumber = (num) => LABS.find((l) => l.number === num);
export const byId = (id) => LABS.find((l) => l.id === id);
