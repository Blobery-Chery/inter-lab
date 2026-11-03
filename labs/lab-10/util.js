/**
 * Помощник для шагов test с несколькими пробирками.
 * Базовый тип test вычисляет disabled кнопок только при перерисовке панели, а при переключении пробирки
 * панель не перерисовывается — кнопка остаётся в состоянии предыдущей пробирки. Поэтому для действий
 * над выбранной пробиркой проверка переносится в apply: недоступное действие даёт подсказку и не выполняется.
 * (Предложение для финальной сессии: перерисовывать панель шага test при смене пробирки.)
 */
import { L } from '../../app/i18n.js';

const NOPE = L('Для выбранной пробирки это действие сейчас не нужно (уже выполнено или ещё рано).', 'Таңдалған пробирка үшін бұл әрекет қазір қажет емес (орындалған немесе әлі ерте).', 'This action is not needed for the selected tube right now (already done or too early).');

export function perTube(reagents) {
  return reagents.map((r) => {
    if (r.target === 'all' || !r.disabled) return r;
    const { disabled, apply, advance } = r;
    return {
      ...r, disabled: undefined, advance: 0,
      apply(t, S, ctx, id, local) {
        if (disabled(t, S, local)) { t.added.pop(); ctx.feedback(r.whyNot || NOPE, 'warn'); return; }
        apply.call(this, t, S, ctx, id, local);
        if (advance) ctx.advance(advance);
      },
    };
  });
}
