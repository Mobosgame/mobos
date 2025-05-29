class AppRouter {
    constructor() {
        this.screens = {};
        this.currentScreen = null;
        this.initRouter();
    }

    initRouter() {
        window.showScreen = (screenName) => this.loadScreen(screenName);
        window.goBack = () => this.backToMain();
        this.initTelegramUser();
    }

    async loadScreen(screenName) {
    try {
        console.log(`Loading screen: ${screenName}`);
        
        if (!this.screens[screenName]) {
            const response = await fetch(`./screens/${screenName}.html`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const html = await response.text();
            const template = document.createElement('template');
            template.innerHTML = html.trim();
            
            const screenElement = template.content.firstChild;
            if (!screenElement) throw new Error('No valid HTML content');
            
            const container = document.getElementById('screens-container');
            if (!container) throw new Error('Screens container not found');
            
            container.appendChild(screenElement);
            this.screens[screenName] = screenElement;
            
            // Инициализация экрана
            const initFn = window[`init${screenName.charAt(0).toUpperCase() + screenName.slice(1)}`];
            if (initFn) {
                console.log(`Initializing ${screenName} screen`);
                initFn();
            }
        }

        // Скрываем все экраны
        const mainScreen = document.getElementById('main-screen');
        if (mainScreen) mainScreen.classList.add('hidden');
        
        document.querySelectorAll('.app-screen').forEach(s => {
            s.classList.add('hidden');
        });
        
        // Показываем текущий экран
        this.currentScreen = this.screens[screenName];
        if (this.currentScreen) {
            this.currentScreen.classList.remove('hidden');
            
            // Специальная обработка для darkwall
            if (screenName === 'darkwall' && window.showDarkwall) {
                setTimeout(() => {
                    window.showDarkwall();
                }, 10);
            }
        }

    } catch (error) {
        console.error(`Error loading ${screenName}:`, error);
        this.backToMain();
    }
}

    backToMain() {
        document.getElementById('main-screen').classList.remove('hidden');
        if (this.currentScreen && this.currentScreen.classList) {
            this.currentScreen.classList.add('hidden');
            
            // Сброс состояния для специфичных экранов
            if (this.currentScreen.id === 'darkwall-screen' && window.showMainMenu) {
                window.showMainMenu();
            }
        }
        this.currentScreen = null;
    }

    initTelegramUser() {
        if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
            const user = window.Telegram.WebApp.initDataUnsafe.user;
            const profilePhoto = document.getElementById('profile-photo');
            const username = document.getElementById('username');
            
            if (user.first_name) {
                username.textContent = user.first_name;
                if (user.last_name) username.textContent += ` ${user.last_name}`;
                else if (user.username) username.textContent += ` (@${user.username})`;
            }
            
            if (user.photo_url) {
                profilePhoto.src = `${user.photo_url}?t=${Date.now()}`;
                profilePhoto.onerror = () => {
                    profilePhoto.src = './img/Theme_1/profile.png'; // Обратите внимание на путь (img вместо Img)
                };
            }
        }
    }
}

// Инициализация после полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.router = new AppRouter();
});
