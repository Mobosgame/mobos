document.addEventListener('DOMContentLoaded', function() {
    // Загружаем сохраненные настройки
    const savedSettings = window.appStorage.get('settings') || {
        theme: '1',
        language: 'ru'
    };
    
    // Применяем настройки ко всему приложению
    if (window.updateEntireInterface) {
        window.updateEntireInterface(savedSettings);
    } else {
        // Fallback если функция еще не загружена
        document.body.className = 'theme-' + savedSettings.theme;
    }
if (!window.appStorage) {
    class AppStorage {
        constructor() {
            this.prefix = 'phone_simulator_';
        }
    }

        set(key, value) {
            try {
                localStorage.setItem(this.prefix + key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('LocalStorage error:', e);
                return false;
            }
        }

        get(key) {
            try {
                const value = localStorage.getItem(this.prefix + key);
                return value ? JSON.parse(value) : null;
            } catch (e) {
                console.error('LocalStorage error:', e);
                return null;
            }
        }
    }

    window.appStorage = new AppStorage();
}
class AppStorage {
    constructor() {
        this.prefix = 'phone_simulator_';
    }

    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('LocalStorage error:', e);
            return false;
        }
    }

    get(key) {
        try {
            const value = localStorage.getItem(this.prefix + key);
            return value ? JSON.parse(value) : null;
        } catch (e) {
            console.error('LocalStorage error:', e);
            return null;
        }
    }
}

const appStorage = new AppStorage();

document.addEventListener('DOMContentLoaded', function() {
    // Применяем сохраненную тему при загрузке
    const savedSettings = appStorage.get('settings');
    if (savedSettings?.theme) {
        document.body.className = `theme-${savedSettings.theme}`;
    }

    // Инициализация Telegram WebApp
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.enableClosingConfirmation();
        
        const user = window.Telegram.WebApp.initDataUnsafe?.user;
        if (user) {
            document.getElementById('username').textContent = user.first_name || 'TG User';
            if (user.photo_url) {
                document.getElementById('profile-photo').src = `${user.photo_url}?${Date.now()}`;
            }
        }
    }

    // Обработчики кнопок
    document.getElementById('settings-btn').addEventListener('click', function() {
        showScreen('settings');
    });

    document.getElementById('call-btn').addEventListener('click', function() {
        showScreen('calls');
    });

    document.getElementById('sms-btn').addEventListener('click', function() {
        showScreen('sms');
    });

    document.getElementById('darkwall-btn').addEventListener('click', function() {
        showScreen('darkwall');
    });

    // Показываем главный экран
    document.getElementById('main-screen').classList.remove('hidden');
});

// Глобальные функции навигации
function showScreen(screenName) {
    // Реализация из router.js
    const screen = document.getElementById(`${screenName}-screen`);
    if (screen) {
        document.querySelectorAll('.app-screen').forEach(s => {
            s.classList.add('hidden');
        });
        screen.classList.remove('hidden');
    }
}

function goBack() {
    document.getElementById('main-screen').classList.remove('hidden');
    document.querySelectorAll('.app-screen').forEach(screen => {
        screen.classList.add('hidden');
    });
}
