document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram WebApp
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.enableClosingConfirmation();
        
        const user = window.Telegram.WebApp.initDataUnsafe?.user;
        if (user) {
            document.getElementById('username').textContent = user.first_name || 'TG User';
            if (user.photo_url) {
                document.getElementById('profile-photo').src = `${user.photo_url}?${Date.now()}`;
            }
        }
    }

    // Ожидаем инициализации роутера
    const waitForRouter = setInterval(() => {
        if (window.router && window.showScreen) {
            clearInterval(waitForRouter);
            setupEventListeners();
        }
    }, 100);

    function setupEventListeners() {
        // Обработчики кнопок с проверкой существования
        const addSafeListener = (id, screen) => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('click', () => {
                    if (typeof showScreen === 'function') {
                        showScreen(screen);
                    } else {
                        console.error('showScreen is not defined');
                    }
                });
            }
        };

        // Назначаем обработчики
        addSafeListener('settings-btn', 'settings');
        addSafeListener('call-btn', 'calls');
        addSafeListener('sms-btn', 'sms');
        addSafeListener('darkwall-btn', 'darkwall');
    }

    // Показываем главный экран
    document.getElementById('main-screen').classList.remove('hidden');
});
