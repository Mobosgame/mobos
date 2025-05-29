async loadScreen(screenName) {
    if (!this.screens[screenName]) {
        // Загрузка HTML
        const response = await fetch(`./screens/${screenName}.html`);
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        this.screens[screenName] = doc.body.firstElementChild;
        
        // Добавляем в DOM
        document.getElementById('screens-container').appendChild(this.screens[screenName]);
        
        // Инициализация
        const initFn = window[`init${screenName.charAt(0).toUpperCase() + screenName.slice(1)}`];
        if (initFn) initFn();
    }

    // Показ экрана
    document.getElementById('main-screen').classList.add('hidden');
    this.currentScreen = this.screens[screenName];
    this.currentScreen.classList.remove('hidden');
    
    // Специальная обработка для игры
    if (screenName === 'darkwall') {
        window.showDarkwall();
    }

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
            
            document.getElementById('screens-container').appendChild(this.screens[screenName]);
            
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
    
    // Особый случай для Darkwall
    if (screenName === 'darkwall') {
        showDarkwall();
    }
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
