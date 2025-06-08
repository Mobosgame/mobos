// js/router.js

class AppRouter {
    constructor() {
        this.screens = {};
        this.currentScreen = null;
        this.initRouter();
    }

    initRouter() {
        // Регистрируем глобальные функции навигации
        window.showScreen = (screenName) => this.loadScreen(screenName);
        window.goBack = () => this.backToMain();
        
        // Инициализация данных пользователя Telegram
        this.initTelegramUser();
    }

    async loadScreen(screenName) {
        try {
            // Если экран уже загружен, просто переключаемся
            if (this.screens[screenName]) {
                this.switchToScreen(screenName);
                return;
            }

            // Загружаем HTML-файл экрана
            const response = await fetch(`./screens/${screenName}.html`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            
            const html = await response.text();
            
            // Создаем временный контейнер для парсинга
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;
            
            // Получаем корневой элемент экрана
            const screenElement = tempContainer.firstElementChild;
            if (!screenElement) throw new Error('Screen HTML is empty');
            
            // Добавляем в DOM
            document.getElementById('screens-container').appendChild(screenElement);
            this.screens[screenName] = screenElement;
            
            // Инициализация экрана
            const initFnName = `init${screenName.charAt(0).toUpperCase() + screenName.slice(1)}`;
            if (typeof window[initFnName] === 'function') {
                window[initFnName]();
            }
            
            // Переключение на загруженный экран
            this.switchToScreen(screenName);
            
        } catch (error) {
            console.error(`Error loading screen ${screenName}:`, error);
            // Возвращаем на главный экран при ошибке
            this.backToMain();
        }
    }

    switchToScreen(screenName) {
        // Скрываем главный экран
        document.getElementById('main-screen').classList.add('hidden');
        
        // Скрываем все остальные экраны
        Object.values(this.screens).forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Показываем запрошенный экран
        this.currentScreen = this.screens[screenName];
        if (this.currentScreen) {
            this.currentScreen.classList.remove('hidden');
        }
    }

    backToMain() {
        // Показываем главный экран
        document.getElementById('main-screen').classList.remove('hidden');
        
        // Скрываем текущий экран
        if (this.currentScreen) {
            this.currentScreen.classList.add('hidden');
        }
        
        this.currentScreen = null;
    }

    initTelegramUser() {
        // Используем данные из sessionStorage как резервный вариант
        let userData = sessionStorage.getItem('telegramUser');
        let user = null;
        
        if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
            user = window.Telegram.WebApp.initDataUnsafe.user;
            // Сохраняем в sessionStorage для последующего использования
            sessionStorage.setItem('telegramUser', JSON.stringify(user));
        } else if (userData) {
            user = JSON.parse(userData);
        }
        
        if (user) {
            const profilePhoto = document.getElementById('profile-photo');
            const username = document.getElementById('username');
            
            // Обновляем имя пользователя
            if (username) {
                if (user.first_name) {
                    username.textContent = user.first_name;
                    if (user.last_name) username.textContent += ` ${user.last_name}`;
                    else if (user.username) username.textContent += ` (@${user.username})`;
                } else if (user.username) {
                    username.textContent = `@${user.username}`;
                }
            }
            
            // Обновляем фото профиля
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

// Автоматическая инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.router = new AppRouter();
});
