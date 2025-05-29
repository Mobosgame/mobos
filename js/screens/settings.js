import appStorage from '../storage.js';

function initSettings() {
    // Загружаем сохраненные настройки
    const savedSettings = appStorage.get('settings') || {
        theme: '1',
        language: 'ru'
    };

    // Устанавливаем текущие настройки
    let currentSettings = { ...savedSettings };

    // Применяем сохраненные настройки
    applyTheme(currentSettings.theme);
    applyLanguage(currentSettings.language);

    // Переключение тем
    document.querySelectorAll('.theme-option').forEach(option => {
        if (option.dataset.theme === currentSettings.theme) {
            option.classList.add('active');
        }

        option.addEventListener('click', function() {
            const theme = this.dataset.theme;
            currentSettings.theme = theme;
            appStorage.set('settings', currentSettings);
            applyTheme(theme);
            
            document.querySelectorAll('.theme-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // Переключение языков
    document.querySelectorAll('.lang-option').forEach(option => {
        if (option.dataset.lang === currentSettings.language) {
            option.classList.add('active');
        }

        option.addEventListener('click', function() {
            const lang = this.dataset.lang;
            currentSettings.language = lang;
            appStorage.set('settings', currentSettings);
            applyLanguage(lang);
            
            document.querySelectorAll('.lang-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // Кнопка закрытия
    document.querySelector('#settings-screen .close-btn').addEventListener('click', goBack);
}

function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    updateIconsForTheme(theme);
}

function applyLanguage(lang) {
    // Здесь реализуйте смену языка
    console.log('Language changed to:', lang);
    // Пример: document.querySelectorAll('[data-lang]').forEach(el => { ... });
}

function updateIconsForTheme(theme) {
    document.querySelectorAll('img[src*="Theme_"]').forEach(img => {
        img.src = img.src.replace(/Theme_\d+/, `Theme_${theme}`);
    });
}
