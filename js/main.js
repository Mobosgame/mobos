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
            
            // 1. Сначала загружаем данные Telegram
            this.loadTelegramData();
            
            // 2. Показываем экран загрузки
            this.showScreen('loading');
            
            // 3. Настраиваем обработчики
            this.setupEventListeners();
            
            // 4. Имитация загрузки
            setTimeout(() => {
                this.showScreen('main');
                console.log('App initialized');
            }, 2000);
        },
        
        loadTelegramData: function() {
            // Проверяем, есть ли Telegram WebApp
            if (window.Telegram && window.Telegram.WebApp) {
                const tg = window.Telegram.WebApp;
                tg.expand();
                
                // Проверяем данные пользователя
                if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                    const user = tg.initDataUnsafe.user;
                    let nickname = 'Player';
                    
                    // Формируем nickname по приоритетам:
                    if (user.username) {
                        nickname = `@${user.username}`;
                    } else if (user.first_name) {
                        nickname = user.first_name;
                        if (user.last_name) {
                            nickname += ` ${user.last_name}`;
                        }
                    }
                    
                    console.log('Setting Telegram nickname:', nickname);
                    document.getElementById('user-nickname').textContent = nickname;
                    return;
                }
            }
            
            console.log('Using default nickname');
            document.getElementById('user-nickname').textContent = 'Player';
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
