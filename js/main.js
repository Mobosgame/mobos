document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram WebApp
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.enableClosingConfirmation();
        
        const user = window.Telegram.WebApp.initDataUnsafe?.user;
        if (user) {
            updateUserProfile(user);
        }
    }

    // Ожидаем инициализации роутера
    const routerCheckInterval = setInterval(() => {
        if (window.router) {
            clearInterval(routerCheckInterval);
            setupNavigation();
        }
    }, 50);

    function updateUserProfile(user) {
        const username = document.getElementById('username');
        const profilePhoto = document.getElementById('profile-photo');
        
        if (username) {
            username.textContent = user.first_name || 'Error login';
            if (user.last_name) username.textContent += ` ${user.last_name}`;
            else if (user.username) username.textContent += ` (@${user.username})`;
        }
        
        
    }

    function setupNavigation() {
        // Функция для безопасного назначения обработчиков
        const setupButton = (buttonId, screenName) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    if (typeof showScreen === 'function') {
                        showScreen(screenName);
                    } else {
                        console.error('Router not initialized');
                        // Попытка восстановления
                        if (window.router) {
                            window.router.initRouter();
                            showScreen(screenName);
                        } else {
                            location.reload();
                        }
                    }
                });
            }
        };

        // Настройка обработчиков для кнопок
        setupButton('settings-btn', 'settings');
        setupButton('calls-btn', 'calls');
        setupButton('browser-btn', 'browser');
        setupButton('sms-btn', 'sms');
        setupButton('darkwall-btn', 'darkwall');
        setupButton('wallet-btn', 'wallet');
        setupButton('miner-btn', 'miner');
        setupButton('chat-btn', 'chat');

        // Показываем главный экран
        const mainScreen = document.getElementById('main-screen');
        if (mainScreen) mainScreen.classList.remove('hidden');

        // Добавляем обработчик для Darkwall Game
        const darkwallBtn = document.getElementById('darkwall-btn');
    if (darkwallBtn) {
        darkwallBtn.addEventListener('click', () => {
            showScreen('darkwall');
        });
    }
});
