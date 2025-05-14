document.addEventListener('DOMContentLoaded', function() {
    console.log('[Init] App started');
    
    // Элементы интерфейса
    const authScreen = document.getElementById('auth-screen');
    const mainScreen = document.getElementById('main-screen');
    const errorElement = document.getElementById('auth-error');
    
    // 1. Проверка среды выполнения
    function isTelegramWebApp() {
        return !!window.Telegram?.WebApp;
    }
    
    // 2. Получение данных пользователя
    function getTelegramUser() {
        try {
            const tg = window.Telegram.WebApp;
            
            // Проверяем новые и старые форматы данных
            const userData = tg.initDataUnsafe?.user || 
                           (tg.initData ? parseInitData(tg.initData) : null);
            
            if (!userData) {
                console.warn('[Auth] No user data found');
                return null;
            }
            
            console.log('[Auth] User data received:', userData);
            return userData;
        } catch (e) {
            console.error('[Auth Error]', e);
            return null;
        }
    }
    
    function parseInitData(initData) {
        const params = new URLSearchParams(initData);
        const userJson = params.get('user');
        return userJson ? JSON.parse(userJson) : null;
    }
    
    // 3. Отображение имени пользователя
    function displayUsername(user) {
        let username = 'Player';
        if (user.username) {
            username = `@${user.username}`;
        } else if (user.first_name) {
            username = user.first_name;
            if (user.last_name) username += ` ${user.last_name}`;
        }
        document.getElementById('user-nickname').textContent = username;
    }
    
    // 4. Инициализация Telegram WebApp
    function initTelegramWebApp() {
        if (!isTelegramWebApp()) return;
        
        const tg = window.Telegram.WebApp;
        tg.expand();
        tg.enableClosingConfirmation();
        
        // Важная проверка готовности
        tg.ready();
        console.log('[Telegram] WebApp initialized');
    }
    
    // 5. Основной поток авторизации
    function initApp() {
        if (isTelegramWebApp()) {
            console.log('[Mode] Running inside Telegram');
            
            const user = getTelegramUser();
            if (user) {
                displayUsername(user);
                initTelegramWebApp();
                switchToMainScreen();
                return;
            }
            
            showError('Не удалось получить данные. Обновите Telegram.');
        } else {
            console.log('[Mode] Running outside Telegram');
            showError('Откройте приложение через Telegram бота');
        }
        
        // Фолбэк: через 5 сек показываем главный экран
        setTimeout(switchToMainScreen, 5000);
    }
    
    function switchToMainScreen() {
        authScreen.classList.add('hidden');
        mainScreen.classList.remove('hidden');
        console.log('[UI] Switched to main screen');
    }
    
    function showError(message) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        console.error('[UI Error]', message);
    }
    
    // Запуск приложения
    initApp();
});
