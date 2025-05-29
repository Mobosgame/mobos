document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram WebApp
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.enableClosingConfirmation();
        
        const user = window.Telegram.WebApp.initDataUnsafe?.user;
        if (user) {
            updateUserProfile(user);
        }
    }

    // Назначаем обработчики после инициализации роутера
    const initInterval = setInterval(() => {
        if (window.router) {
            clearInterval(initInterval);
            setupNavigation();
        }
    }, 100);

    function updateUserProfile(user) {
        const username = document.getElementById('username');
        const profilePhoto = document.getElementById('profile-photo');
        
        if (username) {
            username.textContent = user.first_name || 'TG User';
            if (user.last_name) username.textContent += ` ${user.last_name}`;
            else if (user.username) username.textContent += ` (@${user.username})`;
        }
        
        if (profilePhoto && user.photo_url) {
            profilePhoto.src = `${user.photo_url}?${Date.now()}`;
            profilePhoto.onerror = () => {
                profilePhoto.src = './Img/Theme_1/profile.png';
            };
        }
    }

    function setupNavigation() {
        // Безопасное назначение обработчиков
        const setClickListener = (id, screen) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', () => {
                    if (typeof showScreen === 'function') {
                        showScreen(screen);
                    } else {
                        console.error('Router not initialized');
                        window.location.reload();
                    }
                });
            }
        };

        // Основные кнопки навигации
        setClickListener('settings-btn', 'settings');
        setClickListener('calls-btn', 'calls');
        setClickListener('sms-btn', 'sms');
        setClickListener('darkwall-btn', 'darkwall');

        // Показываем главный экран
        const mainScreen = document.getElementById('main-screen');
        if (mainScreen) mainScreen.classList.remove('hidden');
    }
});
