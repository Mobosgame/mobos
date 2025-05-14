document.addEventListener('DOMContentLoaded', function() {
    const App = {
        // Элементы интерфейса
        elements: {
            authScreen: document.getElementById('auth-screen'),
            mainScreen: document.getElementById('main-screen'),
            callScreen: document.getElementById('call-screen'),
            smsScreen: document.getElementById('sms-screen'),
            authError: document.getElementById('auth-error'),
            retryBtn: document.getElementById('retry-btn'),
            username: document.getElementById('user-nickname'),
            callBtn: document.getElementById('call-btn'),
            smsBtn: document.getElementById('sms-btn')
        },
        
        // Инициализация приложения
        init: function() {
            console.log('Initializing app...');
            this.setupEventListeners();
            this.checkAuth();
        },
        
        // Проверка авторизации
        checkAuth: function() {
            this.showAuthScreen();
            
            setTimeout(() => {
                if (this.getTelegramUser()) {
                    this.showMainScreen();
                } else {
                    this.showAuthError();
                }
            }, 1000);
        },
        
        // Получение данных пользователя Telegram
        getTelegramUser: function() {
            try {
                // Способ 1: Через initData (новый способ)
                if (window.Telegram?.WebApp?.initData) {
                    const initData = new URLSearchParams(window.Telegram.WebApp.initData);
                    const userJson = initData.get('user');
                    if (userJson) {
                        const user = JSON.parse(userJson);
                        this.setUsername(user);
                        return true;
                    }
                }
                
                // Способ 2: Через initDataUnsafe (старый способ)
                if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
                    const user = window.Telegram.WebApp.initDataUnsafe.user;
                    this.setUsername(user);
                    return true;
                }
            } catch (e) {
                console.error('Auth error:', e);
            }
            
            return false;
        },
        
        // Установка имени пользователя
        setUsername: function(user) {
            let username = 'Player';
            
            if (user.username) {
                username = `@${user.username}`;
            } else if (user.first_name) {
                username = user.first_name;
                if (user.last_name) {
                    username += ` ${user.last_name}`;
                }
            }
            
            this.elements.username.textContent = username;
            
            // Инициализация Telegram WebApp
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.expand();
                window.Telegram.WebApp.enableClosingConfirmation();
            }
        },
        
        // Показать экран авторизации
        showAuthScreen: function() {
            this.hideAllScreens();
            this.elements.authScreen.classList.remove('hidden');
            this.elements.authError.classList.add('hidden');
        },
        
        // Показать ошибку авторизации
        showAuthError: function() {
            this.elements.authError.classList.remove('hidden');
        },
        
        // Показать главный экран
        showMainScreen: function() {
            this.hideAllScreens();
            this.elements.mainScreen.classList.remove('hidden');
        },
        
        // Показать экран вызовов
        showCallScreen: function() {
            this.hideAllScreens();
            this.elements.callScreen.classList.remove('hidden');
        },
        
        // Показать экран сообщений
        showSmsScreen: function() {
            this.hideAllScreens();
            this.elements.smsScreen.classList.remove('hidden');
        },
        
        // Скрыть все экраны
        hideAllScreens: function() {
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.add('hidden');
            });
        },
        
        // Настройка обработчиков событий
        setupEventListeners: function() {
            // Кнопка повтора авторизации
            this.elements.retryBtn.addEventListener('click', () => {
                this.checkAuth();
            });
            
            // Кнопка вызовов
            this.elements.callBtn.addEventListener('click', () => {
                this.showCallScreen();
            });
            
            // Кнопка сообщений
            this.elements.smsBtn.addEventListener('click', () => {
                this.showSmsScreen();
            });
            
            // Кнопки закрытия
            document.querySelectorAll('.close-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.showMainScreen();
                });
            });
        }
    };
    
    // Запуск приложения
    App.init();
});
