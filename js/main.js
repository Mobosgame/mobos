// Добавьте в начало main.js
class AppStorage {
    constructor() {
        this.prefix = 'phone_simulator_';
    }

    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('LocalStorage error:', e);
            return false;
        }
    }

    get(key) {
        try {
            const value = localStorage.getItem(this.prefix + key);
            return value ? JSON.parse(value) : null;
        } catch (e) {
            console.error('LocalStorage error:', e);
            return null;
        }
    }
}

const appStorage = new AppStorage();

    // Инициализация Telegram WebApp
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.enableClosingConfirmation();
        
document.addEventListener('DOMContentLoaded', function() {
    const savedSettings = appStorage.get('settings');
    if (savedSettings?.theme) {
        document.body.className = `theme-${savedSettings.theme}`;
    }
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
