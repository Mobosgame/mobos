class Router {
    constructor() {
        this.screens = {};
        this.currentScreen = null;
    }

    async loadScreen(screenName) {
        if (!this.screens[screenName]) {
            const response = await fetch(`./screens/${screenName}.html`);
            const html = await response.text();
            
            const temp = document.createElement('div');
            temp.innerHTML = html;
            this.screens[screenName] = temp.firstElementChild;
            
            document.body.appendChild(this.screens[screenName]);
        }

        if (this.currentScreen) {
            this.currentScreen.classList.add('hidden');
        }
        
        this.currentScreen = this.screens[screenName];
        this.currentScreen.classList.remove('hidden');
        
        // Инициализируем скрипт экрана
        if (window[`init${screenName.charAt(0).toUpperCase() + screenName.slice(1)}`]) {
            window[`init${screenName.charAt(0).toUpperCase() + screenName.slice(1)}`]();
        }
    }
}

const router = new Router();

// Глобальные функции навигации
function showScreen(screenName) {
    router.loadScreen(screenName);
}

function goBack() {
    router.loadScreen('main');
}
