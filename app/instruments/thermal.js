/** Простая модель теплообмена: T стремится к target со скоростью k (1/с). dt — секунды лабораторного времени. */
export function relax(T, target, k, dt) {
  return T + (target - T) * Math.min(1, k * dt);
}

/** Температуры бань (°C). Значения — общая лабораторная практика. */
export const BATH_T = {
  room: 22,
  ice: 0.5,          // лёд с водой
  'ice-salt': -8,    // лёд с NaCl (до −10…−15 °C в идеале; принято −8 °C)
  boiling: 100,
};

/** Показание стеклянного термометра: цена деления div, отсчёт до половины деления. */
export function thermoReading(T, div = 1) {
  const half = div / 2;
  return Math.round(T / half) * half;
}
