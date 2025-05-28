class Router {
    constructor() {
        this.screens = {};
        this.currentScreen = null;
        this.screensContainer = document.getElementById('screens-container');
    }

    async loadScreen(screenName) {
        if (!this.screens[screenName]) {
            try {
                const response = await fetch(`./screens/${screenName}.html`);
                if (!response.ok) throw new Error('Screen not found');
                const html = await response.text();
                
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                this.screens[screenName] = doc.body.firstElementChild;
                
                this.screensContainer.appendChild(this.screens[screenName]);
            } catch (error) {
                console.error(`Error loading ${screenName}:`, error);
                return;
            }
        }

        // Скрываем все экраны
        document.querySelectorAll('.app-screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Показываем текущий экран
        this.currentScreen = this.screens[screenName];
        this.currentScreen.classList.remove('hidden');
        
        // Инициализируем экран
        this.initScreen(screenName);
    }

    initScreen(screenName) {
        const initFunction = window[`init${screenName.charAt(0).toUpperCase() + screenName.slice(1)}`];
        if (initFunction && typeof initFunction === 'function') {
            initFunction();
        }
    }
}

const router = new Router();

// Глобальные функции навигации
function showScreen(screenName) {
    router.loadScreen(screenName);
}

function goBack() {
    document.getElementById('main-screen').classList.remove('hidden');
    if (router.currentScreen) {
        router.currentScreen.classList.add('hidden');
    }
}
