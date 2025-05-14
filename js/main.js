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
            
            // 1. Сначала пробуем получить данные пользователя
            this.loadUserData();
            
            // 2. Показываем экран загрузки
            this.showScreen('loading');
            
            // 3. Настройка обработчиков
            this.setupEventListeners();
            
            // 4. Завершение загрузки
            setTimeout(() => {
                this.showScreen('main');
                console.log('App initialized');
            }, 2000);
        },
        
        loadUserData: function() {
            // Способ 1: Через WebApp.initData
            if (window.Telegram?.WebApp?.initData) {
                try {
                    const initData = new URLSearchParams(window.Telegram.WebApp.initData);
                    const userJson = initData.get('user');
                    if (userJson) {
                        const user = JSON.parse(userJson);
                        this.displayUsername(user);
                        console.log('User data loaded from initData');
                        return;
                    }
                } catch (e) {
                    console.error('Error parsing initData:', e);
                }
            }
            
            // Способ 2: Через WebApp.initDataUnsafe (старый способ)
            if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
                this.displayUsername(window.Telegram.WebApp.initDataUnsafe.user);
                console.log('User data loaded from initDataUnsafe');
                return;
            }
            
            // Если данные не получены
            console.log('No Telegram user data available');
            document.getElementById('user-nickname').textContent = 'Player';
        },
        
        displayUsername: function(user) {
            let username = 'Player';
            
            if (user.username) {
                username = `@${user.username}`;
            } else if (user.first_name) {
                username = user.first_name;
                if (user.last_name) {
                    username += ` ${user.last_name}`;
                }
            }
            
            console.log('Displaying username:', username);
            document.getElementById('user-nickname').textContent = username;
            
            // Инициализация Telegram WebApp
            window.Telegram.WebApp.expand();
            window.Telegram.WebApp.enableClosingConfirmation();
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
