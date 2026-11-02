/**
 * Баллы замечаний и подсказок → оценка по 5-балльной шкале (как в эталоне).
 * Пороги: 5 — сумма ≤ 1; 4 — ≤ 3; 3 — ≤ 5,5; 2 — больше 5,5.
 */

/** Баллы по умолчанию за уровень тяжести (SPEC, раздел 6). */
export const SEVERITY_POINTS = { minor: 0.5, major: 1, critical: 2, safety: 1 };

/** Стоимость подсказки по уровню (SPEC, раздел 7). */
export const HINT_POINTS = { 1: 0, 2: 0.25, 3: 0.5 };

export const GRADE_THRESHOLDS = [
  { grade: 5, max: 1 },
  { grade: 4, max: 3 },
  { grade: 3, max: 5.5 },
];

export function pointsFor(severity, points) {
  if (typeof points === 'number') return points;
  return SEVERITY_POINTS[severity] ?? 1;
}

export function gradeFor(points) {
  for (const t of GRADE_THRESHOLDS) if (points <= t.max + 1e-9) return t.grade;
  return 2;
}

/**
 * Итог: remarks — замечания [{points}], hints — подсказки [{level}], extra — баллы за результат [{points}].
 * @returns {{points:number, remarkPoints:number, hintPoints:number, extraPoints:number, grade:number}}
 */
export function summarize(remarks = [], hints = [], extra = []) {
  const remarkPoints = remarks.reduce((a, r) => a + (r.points || 0), 0);
  const hintPoints = hints.reduce((a, h) => a + (HINT_POINTS[h.level] || 0), 0);
  const extraPoints = extra.reduce((a, r) => a + (r.points || 0), 0);
  const points = Math.round((remarkPoints + hintPoints + extraPoints) * 100) / 100;
  return { points, remarkPoints, hintPoints, extraPoints, grade: gradeFor(points) };
}
