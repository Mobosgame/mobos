document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram WebApp
    const tg = window.Telegram.WebApp;
    if (tg) {
        tg.expand();
        tg.enableClosingConfirmation();
    }

    // Элементы интерфейса
    const screens = {
        loading: document.getElementById('loading-screen'),
        main: document.getElementById('main-screen'),
        call: document.getElementById('call-screen'),
        sms: document.getElementById('sms-screen')
    };

    // Функция переключения экранов
    function switchScreen(screenName) {
        Object.values(screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        if (screenName && screens[screenName]) {
            screens[screenName].classList.add('active');
        }
    }

    // Обработчики кнопок
    document.getElementById('call-btn').addEventListener('click', function() {
        switchScreen('call');
    });

    document.getElementById('sms-btn').addEventListener('click', function() {
        switchScreen('sms');
    });

    // Обработчики закрытия окон
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchScreen('main');
        });
    });

    // Установка имени пользователя
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        const nickname = user.username || 
                       [user.first_name, user.last_name].filter(Boolean).join(' ');
        document.getElementById('user-nickname').textContent = nickname || 'Player';
    }

    // Имитация загрузки
    setTimeout(function() {
        switchScreen('main');
    }, 2000);
});
