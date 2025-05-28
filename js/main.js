document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram WebApp
    function initTelegramUser() {
        if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
            const user = window.Telegram.WebApp.initDataUnsafe.user;
            const profilePhoto = document.getElementById('profile-photo');
            const username = document.getElementById('username');
            
            // Установка имени
            if (user.first_name) {
                username.textContent = user.first_name;
                if (user.last_name) {
                    username.textContent += ' ' + user.last_name;
                }
            } else if (user.username) {
                username.textContent = user.username;
            }
            
            // Установка аватарки
            if (user.photo_url) {
                // Добавляем временную метку для избежания кеширования
                profilePhoto.src = `${user.photo_url}?${Date.now()}`;
                profilePhoto.onerror = function() {
                    // Fallback если фото не загрузилось
                    profilePhoto.src = './Img/Theme_1/profile.png';
                };
            }
        }
    }

    // Проверяем, что WebApp инициализирован
    if (window.Telegram?.WebApp) {
        // Расширяем на весь экран
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.enableClosingConfirmation();
        
        // Ждем полной инициализации WebApp
        if (window.Telegram.WebApp.initDataUnsafe) {
            initTelegramUser();
        } else {
            // Если данные еще не загружены, ждем события
            window.Telegram.WebApp.onEvent('themeChanged', initTelegramUser);
            window.Telegram.WebApp.onEvent('viewportChanged', initTelegramUser);
        }
    }

    // Остальной код обработчиков...
    document.getElementById('settings-btn').addEventListener('click', () => showScreen('settings'));
    document.getElementById('call-btn').addEventListener('click', () => showScreen('calls'));
    document.getElementById('sms-btn').addEventListener('click', () => showScreen('sms'));
    document.getElementById('darkwall-btn').addEventListener('click', () => showScreen('darkwall'));

    // Показываем главный экран при загрузке
    document.getElementById('main-screen').classList.remove('hidden');
});
