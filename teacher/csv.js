// Экспорт в CSV для Excel и Google Таблиц: UTF-8 с BOM, разделитель «;» (так Excel в рус./каз. локали
// сразу раскладывает по столбцам), строки с «= + - @» в начале экранируются от формул.

export const SEP = ';';

export function csvCell(v) {
  if (v == null) return '';
  let s = typeof v === 'number' ? String(v) : String(v);
  if (typeof v !== 'number' && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[";\n\r,]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}

/** rows — массив массивов; первая строка — заголовки. */
export function toCsv(rows) {
  return '﻿' + rows.map((r) => r.map(csvCell).join(SEP)).join('\r\n') + '\r\n';
}

/** Дата для таблицы: 2026-11-02 09:12. */
export function csvDate(ms) {
  if (!ms) return '';
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Число с десятичной запятой для ru/kk. */
export function csvNum(x, lang) {
  if (x == null || x === '') return '';
  const s = String(x);
  return lang === 'en' ? s : s.replace('.', ',');
}

/**
 * @param {object[]} list — заявки
 * @param {{t: function, labName: function, kindName: function, statusName: function, lang: string, tr: function}} f
 */
export function requestsCsv(list, f) {
  const head = [f.t('received'), f.t('student'), f.t('group'), f.t('colKind'), f.t('lab'), f.t('score'), f.t('colOf'), f.t('passMark'), f.t('attempt'), f.t('colStatus'), f.t('comment'), f.t('decidedAt'), f.t('langOfWork')];
  const rows = list.map((r) => [
    csvDate(r.createdAt), f.tr(r.name), r.group, f.kindName(r.kind), r.lab ? f.labName(r.lab) : '',
    r.kind === 'access' ? '' : r.score, r.kind === 'access' ? '' : r.total, r.kind === 'access' ? '' : r.pass,
    r.attempt ?? '', f.statusName(r), f.tr(r.comment || ''), csvDate(r.decidedAt), r.lang || '',
  ]);
  return toCsv([head, ...rows]);
}

export function reportsCsv(list, f) {
  const head = [f.t('finished'), f.t('student'), f.t('group'), f.t('lab'), f.t('attempt'), f.t('colMode'), f.t('autoGrade'), f.t('penalty'), f.t('teacherGrade'), f.t('gradeComment'), f.t('langOfWork')];
  const rows = list.map((r) => [
    csvDate(r.finishedAt || r.createdAt), f.tr(r.name), r.group, f.labName(r.lab), r.attempt ?? '',
    r.mode === 'exam' ? f.t('modeExam') : f.t('modeTrain'), r.grade ?? '', csvNum(r.points, f.lang),
    r.teacherGrade ?? '', f.tr(r.teacherComment || ''), r.lang || '',
  ]);
  return toCsv([head, ...rows]);
}

/** Сводка «студент × работа»: в ячейке — оценка, иначе статус допуска. */
export function studentsCsv(students, labs, f) {
  const head = [f.t('student'), f.t('group'), f.t('access'), ...labs.map((l) => f.labShort(l.id))];
  const rows = students.map((s) => [
    f.tr(s.name), s.group, f.accessName(s.access),
    ...labs.map((l) => {
      const c = s.labs && s.labs[l.id];
      if (!c) return '';
      if (c.grade != null) return c.grade;
      return c.admission ? f.statusName({ kind: l.id === 'lab-00' ? 'briefing' : 'admission', status: c.admission }) : '';
    }),
  ]);
  return toCsv([head, ...rows]);
}
