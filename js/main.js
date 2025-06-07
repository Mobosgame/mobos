// js/main.js

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

    // Инициализируем роутер сразу
    window.router = new AppRouter();
    
    // Даем роутеру время на инициализацию
    setTimeout(() => {
        setupNavigation();
        showMainScreen();
    }, 50);
    
    function updateUserProfile(user) {
        const username = document.getElementById('username');
        const profilePhoto = document.getElementById('profile-photo');
        
        if (username) {
            username.textContent = user.first_name || 'User';
            if (user.last_name) username.textContent += ` ${user.last_name}`;
            else if (user.username) username.textContent += ` (@${user.username})`;
        }
        
        if (profilePhoto && user.photo_url) {
            profilePhoto.src = `${user.photo_url}?t=${Date.now()}`;
            profilePhoto.onerror = () => {
                profilePhoto.src = './Img/Theme_1/profile.png';
            };
        }
    }
    
    function showMainScreen() {
        const mainScreen = document.getElementById('main-screen');
        if (mainScreen) mainScreen.classList.remove('hidden');
    }

    function setupNavigation() {
        // Функция для безопасного назначения обработчиков
        const setupButton = (buttonId, screenName) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    if (typeof showScreen === 'function') {
                        showScreen(screenName);
                    } else {
                        console.error('showScreen function not found');
                        // Попытка восстановления
                        if (window.router) {
                            window.router.initRouter();
                            showScreen(screenName);
                        }
                    }
                });
            }
        };

        // Настройка обработчиков для кнопок главного экрана
        setupButton('settings-btn', 'settings');
        setupButton('calls-btn', 'calls');
        setupButton('browser-btn', 'browser');
        setupButton('sms-btn', 'sms');
        setupButton('darkwall-btn', 'darkwall');
        setupButton('wallet-btn', 'wallet');
        setupButton('miner-btn', 'miner');
        setupButton('chat-btn', 'chat');
        
        // Обработчик для кнопки закрытия в приложениях
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (typeof goBack === 'function') {
                    goBack();
                } else if (window.router) {
                    window.router.backToMain();
                }
            });
        });
    }
    
    //
