document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    // Состояние приложения
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
            
            // Показываем экран загрузки
            this.showScreen('loading');
            
            // Настройка обработчиков событий
            this.setupEventListeners();
            
            // Имитация загрузки
            setTimeout(() => {
                this.showScreen('main');
                console.log('App initialized');
            }, 2000);
        },
        
        showScreen: function(screenName) {
            console.log(`Showing screen: ${screenName}`);
            
            // Скрываем текущий экран
            if (this.currentScreen) {
                this.currentScreen.classList.remove('visible');
                this.currentScreen.classList.add('hidden');
            }
            
            // Показываем новый экран
            const screen = this.screens[screenName];
            if (screen) {
                screen.classList.remove('hidden');
                screen.classList.add('visible');
                this.currentScreen = screen;
            } else {
                console.error(`Screen ${screenName} not found`);
            }
        },
        
        setupEventListeners: function() {
            // Кнопки навигации
            document.getElementById('call-btn').addEventListener('click', () => {
                this.showScreen('call');
            });
            
            document.getElementById('sms-btn').addEventListener('click', () => {
                this.showScreen('sms');
            });
            
            // Кнопки закрытия
            document.querySelectorAll('.close-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.showScreen('main');
                });
            });
        }
    };
    
    // Инициализация приложения
    AppState.init();
});
