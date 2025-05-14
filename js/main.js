// Упрощенная и надежная версия
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded'); // Отладочное сообщение
    
    // Простая функция переключения экранов
    function showScreen(screenId) {
        console.log('Showing screen:', screenId); // Логирование
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const screen = document.getElementById(screenId);
        if (screen) screen.classList.add('active');
    }

    // Инициализация Telegram WebApp (если доступно)
    if (window.Telegram && window.Telegram.WebApp) {
        try {
            const tg = window.Telegram.WebApp;
            tg.expand();
            console.log('Telegram WebApp initialized');
        } catch (e) {
            console.error('Telegram init error:', e);
        }
    }

    // Обработчики кнопок (упрощенная версия)
    document.getElementById('call-btn')?.addEventListener('click', () => showScreen('call-screen'));
    document.getElementById('sms-btn')?.addEventListener('click', () => showScreen('sms-screen'));
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => showScreen('main-screen'));
    });

    // Установка имени пользователя (упрощенная версия)
    const nicknameElement = document.getElementById('user-nickname');
    if (nicknameElement) {
        nicknameElement.textContent = 'Player'; // Значение по умолчанию
    }

    // Принудительное переключение через 3 секунды (гарантированно)
    setTimeout(() => {
        console.log('Force showing main screen');
        showScreen('main-screen');
    }, 3000);
});
