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

    // Обработчики главного экрана
    document.getElementById('settings-btn').addEventListener('click', () => showScreen('settings'));
    document.getElementById('call-btn').addEventListener('click', () => showScreen('calls'));
    document.getElementById('sms-btn').addEventListener('click', () => showScreen('sms'));
});
