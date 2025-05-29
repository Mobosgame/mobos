//import appStorage from './storage.js';

//document.addEventListener('DOMContentLoaded', function() {
    // Загружаем сохраненные настройки
   // const savedSettings = appStorage.get('settings');
    
    // Применяем тему при загрузке
 //   if (savedSettings?.theme) {
 //       document.body.className = `theme-${savedSettings.theme}`;
 //   }

    // Инициализация Telegram WebApp
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.enableClosingConfirmation();
        
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram WebApp
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.enableClosingConfirmation();
    }

    // Обработчики кнопок главного экрана
    document.getElementById('settings-btn')?.addEventListener('click', () => showScreen('settings'));
    document.getElementById('call-btn')?.addEventListener('click', () => showScreen('calls'));
    document.getElementById('sms-btn')?.addEventListener('click', () => showScreen('sms'));
    document.getElementById('darkwall-btn')?.addEventListener('click', () => showScreen('darkwall'));

    // Показываем главный экран
    document.getElementById('main-screen').classList.remove('hidden');
});
