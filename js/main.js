document.addEventListener('DOMContentLoaded', function() {
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.enableClosingConfirmation();
        
        const user = window.Telegram.WebApp.initDataUnsafe?.user;
        if (user) {
            updateUserProfile(user);
        }
    }

    window.router = new AppRouter();
    setupNavigation();
    document.getElementById('main-screen').classList.remove('hidden');

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

    function setupNavigation() {
        const setupButton = (buttonId, screenName) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    if (window.router && typeof window.router.loadScreen === 'function') {
                        window.router.loadScreen(screenName);
                    } else {
                        console.error('Router not initialized');
                        location.reload();
                    }
                });
            }
        };

        setupButton('settings-btn', 'settings');
        setupButton('calls-btn', 'calls');
        setupButton('browser-btn', 'browser');
        setupButton('sms-btn', 'sms');
        setupButton('darkwall-btn', 'darkwall');
        setupButton('wallet-btn', 'wallet');
        setupButton('miner-btn', 'miner');
        setupButton('chat-btn', 'chat');

        window.showScreen = (screenName) => window.router.loadScreen(screenName);
        window.goBack = () => window.router.backToMain();

        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('close-btn')) {
                if (typeof goBack === 'function') {
                    goBack();
                } else if (window.router && typeof window.router.backToMain === 'function') {
                    window.router.backToMain();
                }
            }
        });
    }
    
    function initScreens() {
        if (typeof initSettings === 'function') {
            initSettings();
        }
    }
});
