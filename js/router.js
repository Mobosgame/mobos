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
            if (this.screens[screenName]) {
                this.switchToScreen(screenName);
                return;
            }

            const response = await fetch(`./screens/${screenName}.html`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            
            const html = await response.text();
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;
            const screenElement = tempContainer.firstElementChild;
            
            document.getElementById('screens-container').appendChild(screenElement);
            this.screens[screenName] = screenElement;
            
            const initFnName = `init${screenName.charAt(0).toUpperCase() + screenName.slice(1)}`;
            if (typeof window[initFnName] === 'function') {
                window[initFnName]();
            }
            
            this.switchToScreen(screenName);
            
        } catch (error) {
            console.error(`Error loading screen ${screenName}:`, error);
            this.backToMain();
        }
    }

    switchToScreen(screenName) {
        document.getElementById('main-screen').classList.add('hidden');
        Object.values(this.screens).forEach(screen => {
            screen.classList.add('hidden');
        });
        
        this.currentScreen = this.screens[screenName];
        if (this.currentScreen) {
            this.currentScreen.classList.remove('hidden');
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
        let userData = sessionStorage.getItem('telegramUser');
        let user = null;
        
        if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
            user = window.Telegram.WebApp.initDataUnsafe.user;
            sessionStorage.setItem('telegramUser', JSON.stringify(user));
        } else if (userData) {
            user = JSON.parse(userData);
        }
        
        if (user) {
            const profilePhoto = document.getElementById('profile-photo');
            const username = document.getElementById('username');
            
            if (username) {
                if (user.first_name) {
                    username.textContent = user.first_name;
                    if (user.last_name) username.textContent += ` ${user.last_name}`;
                    else if (user.username) username.textContent += ` (@${user.username})`;
                } else if (user.username) {
                    username.textContent = `@${user.username}`;
                }
            }
            
            if (profilePhoto) {
                if (user.photo_url) {
                    profilePhoto.src = `${user.photo_url}?t=${Date.now()}`;
                    profilePhoto.onerror = () => {
                        profilePhoto.src = './Img/Theme_1/profile.png';
                    };
                } else {
                    profilePhoto.src = './Img/Theme_1/profile.png';
                }
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.router = new AppRouter();
});
