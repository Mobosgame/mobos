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
                
                // Добавляем обработчик закрытия для всех окон
                const closeBtn = this.screens[screenName].querySelector('.close-btn');
                if (closeBtn) {
                    closeBtn.addEventListener('click', goBack);
                }
                
                this.screensContainer.appendChild(this.screens[screenName]);
            } catch (error) {
                console.error(`Error loading ${screenName}:`, error);
                return;
            }
            // Для экрана darkwall добавляем обработчик resize
if (screenName === 'darkwall') {
    window.addEventListener('resize', handleDarkwallResize);
    setTimeout(handleDarkwallResize, 100);
}

function handleDarkwallResize() {
    const iframeContainer = document.querySelector('.darkwall-iframe-container');
    if (!iframeContainer) return;
    
    const windowHeight = window.innerHeight;
    const headerHeight = document.querySelector('#darkwall-screen .app-header').offsetHeight;
    
    if (windowHeight < 600) {
        const scale = Math.min(0.9, (windowHeight - headerHeight) / 600);
        iframeContainer.style.transform = `scale(${scale})`;
    } else {
        iframeContainer.style.transform = 'none';
    }
}
        }

        // Скрываем главный экран и другие окна
        document.getElementById('main-screen').classList.add('hidden');
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
    router.currentScreen = null;
}
