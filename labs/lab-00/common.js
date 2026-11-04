/** Общие помощники этапов вводного занятия. */
import { L } from '../../app/i18n.js';

/** Итоги этапа для протокола: число замечаний, их баллы, подсказки, аварийные ситуации. */
export function stageResults(run, extra = {}) {
  const rem = (run && run.remarks) || [];
  const hints = (run && run.hints) || [];
  return {
    remarks: rem.length,
    points: Math.round(rem.reduce((a, r) => a + (r.points || 0), 0) * 100) / 100,
    safety: rem.filter((r) => r.severity === 'safety').length,
    critical: rem.filter((r) => r.severity === 'critical').length,
    hints: hints.length,
    ...extra,
  };
}

/** Короткие подписи для протокола. */
export const OK = L('без замечаний', 'ескертусіз', 'no remarks');
