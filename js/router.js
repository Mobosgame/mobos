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
            // Загружаем экран если еще не загружен
            if (!this.screens[screenName]) {
                const response = await fetch(`./screens/${screenName}.html`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const html = await response.text();
                const template = document.createElement('template');
                template.innerHTML = html.trim();
                
                const screenElement = template.content.firstChild;
                if (!screenElement) throw new Error('No valid HTML content');
                
                document.getElementById('screens-container').appendChild(screenElement);
                this.screens[screenName] = screenElement;
                
                // Инициализация экрана
                const initFn = window[`init${screenName.charAt(0).toUpperCase() + screenName.slice(1)}`];
                if (initFn) initFn();
            }

            // Переключение видимости
            document.getElementById('main-screen').classList.add('hidden');
            document.querySelectorAll('.app-screen').forEach(s => s.classList.add('hidden'));
            
            this.currentScreen = this.screens[screenName];
            this.currentScreen.classList.remove('hidden');

            // Специальная обработка для игр
            if (screenName === 'darkwall' && window.showDarkwall) {
                window.showDarkwall();
            }

        } catch (error) {
            console.error(`Error loading ${screenName}:`, error);
            // Возвращаем на главный экран при ошибке
            this.backToMain();
        }
    }

    backToMain() {
        document.getElementById('main-screen').classList.remove('hidden');
        if (this.currentScreen) {
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
                    profilePhoto.src = './Img/Theme_1/profile.png';
                };
            }
        }
    }
}

// Инициализация после полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.router = new AppRouter();
});
