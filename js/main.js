// js/main.js

document.addEventListener('DOMContentLoaded', function() {
    // 1. Проверка и инициализация Telegram WebApp
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.enableClosingConfirmation();
        
        const user = window.Telegram.WebApp.initDataUnsafe?.user;
        if (user) {
            updateUserProfile(user);
        }
    }

    // 2. Инициализация роутера
    window.router = new AppRouter();
    
    // 3. Настройка навигации
    setupNavigation();
    
    // 4. Показать главный экран
    document.getElementById('main-screen').classList.remove('hidden');

    // Функция обновления профиля пользователя
    function updateUserProfile(user) {
        const username = document.getElementById('username');
        const profilePhoto = document.getElementById('profile-photo');
        
        if (username) {
            username.textContent = user.first_name || 'User';
            if (user.last_name) username.textContent += ` ${user.last_name}`;
            else if (user.username) username.textContent += ` (@${user.username})`;
        }
        
        if (profilePhoto && user.photo_url) {
            profilePhoto.src = `${user.photo_url}?t=${Date.now()}`;
            profilePhoto.onerror = () => {
                profilePhoto.src = './Img/Theme_1/profile.png';
            };
        }
    }

    // Основная функция настройки навигации
    function setupNavigation() {
    const setupButton = (buttonId, screenName) => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                // Сбрасываем состояние перед загрузкой
                if (screenName === 'darkwall') {
                    const oldContainer = document.getElementById('darkwall-game-container');
                    if (oldContainer) oldContainer.remove();
                    
                    if (window.darkwallGame) {
                        window.darkwallGame.destroy();
                        delete window.darkwallGame;
                    }
                }
                
                router.loadScreen(screenName);
            });
        }
    };

        // Настройка обработчиков для всех кнопок
        setupButton('settings-btn', 'settings');
        setupButton('calls-btn', 'calls');
        setupButton('browser-btn', 'browser');
        setupButton('sms-btn', 'sms');
        setupButton('darkwall-btn', 'darkwall');
        setupButton('wallet-btn', 'wallet');
        setupButton('miner-btn', 'miner');
        setupButton('chat-btn', 'chat');

        // Глобальные функции для совместимости
        window.showScreen = (screenName) => window.router.loadScreen(screenName);
        window.goBack = () => window.router.backToMain();

        // Обработчик для всех кнопок закрытия
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('close-btn')) {
                if (typeof goBack === 'function') {
                    goBack();
                } else if (window.router && typeof window.router.backToMain === 'function') {
                    window.router.backToMain();
                }
            }
        });
    }
    
    // 5. Инициализация экранов
    initScreens();
    
    function initScreens() {
        // Инициализация экрана настроек
        if (typeof initSettings === 'function') {
            initSettings();
        }
        
        // Инициализация Darkwall
        if (typeof initDarkwall === 'function') {
            initDarkwall();
        }
        
        // Здесь можно добавить инициализацию других экранов
    }
});
