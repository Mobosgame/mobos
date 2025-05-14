document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    const AppState = {
        currentScreen: null,
        screens: {
            loading: document.getElementById('loading-screen'),
            main: document.getElementById('main-screen'),
            call: document.getElementById('call-screen'),
            sms: document.getElementById('sms-screen')
        },
        
        init: function() {
            console.log('Initializing app...');
            
            // Сначала загружаем данные Telegram
            this.loadTelegramData();
            
            // Затем показываем экран загрузки
            this.showScreen('loading');
            
            // Настройка обработчиков
            this.setupEventListeners();
            
            // Завершение загрузки
            setTimeout(() => {
                this.showScreen('main');
                console.log('App initialized');
            }, 2000);
        },
        
        loadTelegramData: function() {
            if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
                const tg = window.Telegram.WebApp;
                const user = tg.initDataUnsafe.user;
                
                // Формируем имя пользователя
                let username = 'Player';
                if (user.username) {
                    username = `@${user.username}`;
                } else if (user.first_name) {
                    username = user.first_name;
                    if (user.last_name) {
                        username += ` ${user.last_name}`;
                    }
                }
                
                console.log('Telegram user:', username);
                document.getElementById('user-nickname').textContent = username;
                
                tg.expand();
                tg.enableClosingConfirmation();
            } else {
                console.log('Running outside Telegram');
                document.getElementById('user-nickname').textContent = 'Player';
            }
        },
        
        showScreen: function(screenName) {
            console.log(`Showing screen: ${screenName}`);
            
            if (this.currentScreen) {
                this.currentScreen.classList.remove('visible');
                this.currentScreen.classList.add('hidden');
            }
            
            const screen = this.screens[screenName];
            if (screen) {
                screen.classList.remove('hidden');
                screen.classList.add('visible');
                this.currentScreen = screen;
            }
        },
        
        setupEventListeners: function() {
            document.getElementById('call-btn').addEventListener('click', () => {
                this.showScreen('call');
            });
            
            document.getElementById('sms-btn').addEventListener('click', () => {
                this.showScreen('sms');
            });
            
            document.querySelectorAll('.close-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.showScreen('main');
                });
            });
        }
    };
    
    AppState.init();
});
