document.addEventListener('DOMContentLoaded', function() {
    // Инициализация интерфейса
    const screens = {
        main: document.getElementById('main-screen'),
        call: document.getElementById('call-screen'),
        sms: document.getElementById('sms-screen')
    };

    // Функция переключения экранов
    function showScreen(screenName) {
        // Скрываем все экраны
        Object.values(screens).forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Показываем нужный экран
        if (screens[screenName]) {
            screens[screenName].classList.remove('hidden');
        }
    }

    // Обработчики кнопок
    document.getElementById('call-btn').addEventListener('click', function() {
        showScreen('call');
    });

    document.getElementById('sms-btn').addEventListener('click', function() {
        showScreen('sms');
    });

    // Кнопки закрытия
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showScreen('main');
        });
    });

    // Инициализация Telegram WebApp (если доступен)
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.enableClosingConfirmation();
        
        // Можно раскомментировать для отладки
        // console.log('Telegram WebApp initialized');
    }

    // Показываем главный экран
    showScreen('main');
});
