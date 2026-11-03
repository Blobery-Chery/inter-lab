/** Индивидуальное задание (методичка, раздел 8): четыре пробирки без этикеток. Проводится как опыт 7. */
import { L } from '../../app/i18n.js';
import { kinetics, NAME } from './model.js';

const s0 = {
  type: 'lab15-unknown', id: 'unk',
  title: L('Четыре пробирки без этикеток', 'Жапсырмасыз төрт пробирка', 'Four unlabelled tubes'),
  instr: L('<p>В пробирках <b>A, B, C, D</b> — растворы глюкозы, фруктозы, сахарозы и мальтозы (в случайном порядке). Подберите <b>самую короткую</b> последовательность проб этой работы, проведите их и определите каждый раствор.</p><p class="note">Каждая проба проводится по методичке со всеми четырьмя растворами и занимает лабораторное время. Лишние пробы — не ошибка, но засчитывается кратчайший путь.</p>',
    '<p><b>A, B, C, D</b> пробиркаларында — глюкоза, фруктоза, сахароза және мальтоза ерітінділері (кездейсоқ ретпен). Осы жұмыстың сынамаларынан <b>ең қысқа</b> тізбекті таңдап, оларды жүргізіп, әр ерітіндіні анықтаңыз.</p><p class="note">Әр сынама әдістеме бойынша төрт ерітіндінің бәрімен жүргізіледі және зертханалық уақыт алады. Артық сынамалар — қате емес, бірақ ең қысқа жол есептеледі.</p>',
    '<p>Tubes <b>A, B, C, D</b> contain solutions of glucose, fructose, sucrose and maltose (in random order). Choose the <b>shortest</b> sequence of tests from this work, carry them out and identify each solution.</p><p class="note">Each test is done as in the manual on all four solutions and takes laboratory time. Extra tests are not a mistake, but the shortest route is what counts.</p>'),
  need: L('Определите растворы A–D', 'A–D ерітінділерін анықтаңыз', 'Identify solutions A–D'),
  tests: ['molisch', 'trommer', 'fehling', 'tollens', 'barfoed', 'seliwanoff'],
  maxTests: 3,
};

export default {
  id: '7',
  title: L('Индивидуальное задание: идентификация четырёх растворов', 'Жеке тапсырма: төрт ерітіндіні сәйкестендіру', 'Individual assignment: identifying four solutions'),
  principle: L('Сочетание проб на кетозу (Селиванов), на моносахарид (Барфёд) и на восстанавливающий сахар (Фелинг, Толленс) однозначно различает глюкозу, фруктозу, сахарозу и мальтозу.', 'Кетозаға (Селиванов), моносахаридке (Барфёд) және тотықсыздандырғыш қантқа (Фелинг, Толленс) сынамалардың үйлесімі глюкозаны, фруктозаны, сахарозаны және мальтозаны бірмәнді ажыратады.', 'Combining the tests for a ketose (Seliwanoff), for a monosaccharide (Barfoed) and for a reducing sugar (Fehling, Tollens) unambiguously distinguishes glucose, fructose, sucrose and maltose.'),
  equation: [],
  optional: false,
  initialState: ({ rng }) => ({ kin: kinetics(rng), b: {}, unk: null, clean: true }),
  checkpoints: [0],
  steps: [s0],
  results: (S) => ({ perm: S.unk ? S.unk.perm : {}, tests: S.unk ? S.unk.runs.map((r) => r.test) : [], ok: !!(S.unk && S.unk.ok) }),
  summary: (r) => [
    ...Object.entries(r.perm || {}).map(([id, s]) => ({ label: { ru: `Пробирка ${id}`, kk: `${id} пробиркасы`, en: `Tube ${id}` }, value: NAME[s], st: 'ok' })),
    { label: L('Проб', 'Сынамалар', 'Tests'), value: String((r.tests || []).length), st: (r.tests || []).length <= 3 ? 'ok' : 'warn' },
  ],
};
