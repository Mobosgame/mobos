document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram Web App
    const tg = window.Telegram.WebApp;
    tg.expand();
    
    // Получаем данные пользователя из Telegram
    const user = tg.initDataUnsafe.user;
    if (user) {
        document.getElementById('user-nickname').textContent = user.username || `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`;
    }
    
    // Элементы интерфейса
    const screens = {
        loading: document.getElementById('loading-screen'),
        main: document.getElementById('main-screen'),
        sms: document.getElementById('sms-screen'),
        call: document.getElementById('call-screen')
    };
    
    // Кнопки навигации
    document.querySelectorAll('.app-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const app = this.dataset.app;
            switchScreen(app);
        });
    });
    
    // Кнопки закрытия
    document.getElementById('close-sms').addEventListener('click', () => switchScreen('main'));
    document.getElementById('close-call').addEventListener('click', () => switchScreen('main'));
    
    // Имитация загрузки
    setTimeout(() => {
        switchScreen('main');
    }, 2000);
    
    // Функция переключения экранов
    function switchScreen(screenName) {
        Object.values(screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        if (screenName === 'sms') {
            screens.sms.classList.add('active');
            loadSMS();
        } else if (screenName === 'call') {
            screens.call.classList.add('active');
            loadCalls();
        } else if (screenName === 'main') {
            screens.main.classList.add('active');
        }
    }
    
    // Загрузка сообщений (заглушка)
    function loadSMS() {
        // Здесь будет реальная загрузка сообщений
        console.log('Loading SMS...');
    }
    
    // Загрузка звонков (заглушка)
    function loadCalls() {
        // Здесь будет реальная загрузка звонков
        console.log('Loading calls...');
    }
    
    // Для тестирования - добавляем несколько сообщений и звонков
    function initTestData() {
        // Тестовые данные
    }
    
    initTestData();
});