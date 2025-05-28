class AppRouter {
    constructor() {
        this.screens = {};
        this.currentScreen = null;
        this.initRouter();
    }

    initRouter() {
        // Делаем функции глобально доступными
        window.showScreen = (screenName) => this.loadScreen(screenName);
        window.goBack = () => this.backToMain();
        
        // Инициализация данных пользователя Telegram
        this.initTelegramUser();
    }

    async loadScreen(screenName) {
        if (!this.screens[screenName]) {
            try {
                const response = await fetch(`./screens/${screenName}.html`);
                const html = await response.text();
                
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                this.screens[screenName] = doc.body.firstElementChild;
                
                document.body.appendChild(this.screens[screenName]);
                
                // Добавляем обработчик закрытия
                const closeBtn = this.screens[screenName].querySelector('.close-btn');
                if (closeBtn) {
                    closeBtn.addEventListener('click', window.goBack);
                }
                
                // Инициализация экрана
                const initFn = window[`init${screenName.charAt(0).toUpperCase() + screenName.slice(1)}`];
                if (initFn) initFn();
                
            } catch (error) {
                console.error(`Error loading ${screenName}:`, error);
                return;
            }
        }

        // Скрываем все экраны
        document.getElementById('main-screen').classList.add('hidden');
        document.querySelectorAll('.app-screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Показываем нужный экран
        this.currentScreen = this.screens[screenName];
        this.currentScreen.classList.remove('hidden');
    }

    backToMain() {
        document.getElementById('main-screen').classList.remove('hidden');
        if (this.currentScreen) {
            this.currentScreen.classList.add('hidden');
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

// Инициализация роутера при загрузке
document.addEventListener('DOMContentLoaded', () => {
    window.router = new AppRouter();
});
