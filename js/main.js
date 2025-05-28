document.addEventListener('DOMContentLoaded', function() {
    // Инициализация языка
    const savedLang = localStorage.getItem('appLanguage') || 'ru';
    setLanguage(savedLang);
    
    // Инициализация темы
    const savedTheme = localStorage.getItem('appTheme') || '1';
    document.body.className = `theme-${savedTheme}`;
    
    document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram WebApp
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.enableClosingConfirmation();
        
        const user = window.Telegram.WebApp.initDataUnsafe?.user;
        if (user) {
            document.getElementById('username').textContent = user.first_name || 'TG User';
            if (user.photo_url) {
                document.getElementById('profile-photo').src = user.photo_url;
            }
        }
    }

    // Обработчики кнопок главного экрана
    document.getElementById('settings-btn').addEventListener('click', () => showScreen('settings'));
    document.getElementById('call-btn').addEventListener('click', () => showScreen('calls'));
    document.getElementById('sms-btn').addEventListener('click', () => showScreen('sms'));

    // Показываем главный экран при загрузке
    document.getElementById('main-screen').classList.remove('hidden');
    document.getElementById('darkwall-btn').addEventListener('click', () => showScreen('darkwall'));
});
