document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Инициализация переменных
    const screens = {
        loading: document.getElementById('loading-screen'),
        main: document.getElementById('main-screen'),
        sms: document.getElementById('sms-screen'),
        call: document.getElementById('call-screen')
    };
    
    // Функция переключения экранов
    function switchScreen(screenName) {
        console.log('Switching to screen:', screenName);
        
        // Скрыть все экраны
        Object.values(screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Показать нужный экран
        if (screens[screenName]) {
            screens[screenName].classList.add('active');
        } else {
            console.error('Screen not found:', screenName);
        }
    }
    
    // Инициализация Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand();
        
        // Установка имени пользователя
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            const user = tg.initDataUnsafe.user;
            const nickname = user.username || 
                           [user.first_name, user.last_name].filter(Boolean).join(' ');
            document.getElementById('user-nickname').textContent = nickname || 'Player';
        }
    }
    
    // Обработчики кнопок
    document.querySelectorAll('[data-app]').forEach(btn => {
        btn.addEventListener('click', function() {
            const app = this.getAttribute('data-app');
            switchScreen(app + '-screen');
        });
    });
    
    document.getElementById('close-sms').addEventListener('click', () => switchScreen('main'));
    document.getElementById('close-call').addEventListener('click', () => switchScreen('main'));
    
    // Имитация загрузки (3 секунды)
    setTimeout(() => {
        switchScreen('main');
        console.log('Loading complete');
        
        // Тестовые данные
        document.getElementById('user-points').textContent = '100 points';
    }, 3000);
    
    // Проверка загрузки изображений
    const checkImages = () => {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.complete) {
                img.addEventListener('load', () => console.log('Image loaded:', img.src));
                img.addEventListener('error', () => console.error('Error loading image:', img.src));
            }
        });
    };
    
    checkImages();
});
