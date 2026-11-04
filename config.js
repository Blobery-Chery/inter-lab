// Настройки сайта.
// BACKEND_URL — адрес веб-приложения Google Apps Script преподавателя (см. backend/README.md).
// Пока он пуст, сайт работает в локальном режиме: допуск выдаётся автоматически по баллу,
// результаты хранятся только на устройстве студента.
// AUTHOR — автор для подписи «© год, автор. Все права защищены» внизу каждой страницы, в протоколах и в панели.
export const CONFIG = {
  BACKEND_URL: 'https://script.google.com/macros/s/AKfycbwfC5PgLEhFoEK0WuGvs9a9LlO2Hv2qDvAQqOToPXV88WAMUr6zhF9SHC5aJ6L0fpMH/exec',
  AUTHOR: {
    ru: 'Калдыбаева Ару Рашидовна',
    kk: 'Калдыбаева Ару Рашидовна',
    en: 'Aru Kaldybayeva',
  },
  APP_VERSION: '1.0.4',
};
