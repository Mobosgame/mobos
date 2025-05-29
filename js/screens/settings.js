function initSettings() {
    // Загружаем сохраненные настройки
    const savedSettings = appStorage.get('settings') || {
        theme: '1',
        language: 'ru'
    };

    // Применяем сохраненные настройки
    applyTheme(savedSettings.theme);
    applyLanguage(savedSettings.language);

    // Обработчики для кнопок темы
    document.querySelectorAll('.theme-option').forEach(option => {
        if (option.dataset.theme === savedSettings.theme) {
            option.classList.add('active');
        }

        option.addEventListener('click', function() {
            const theme = this.dataset.theme;
            const newSettings = { ...appStorage.get('settings'), theme };
            appStorage.set('settings', newSettings);
            applyTheme(theme);
            
            document.querySelectorAll('.theme-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // Обработчики для кнопок языка
    document.querySelectorAll('.lang-option').forEach(option => {
        if (option.dataset.lang === savedSettings.language) {
            option.classList.add('active');
        }

        option.addEventListener('click', function() {
            const lang = this.dataset.lang;
            const newSettings = { ...appStorage.get('settings'), language: lang };
            appStorage.set('settings', newSettings);
            applyLanguage(lang);
            
            document.querySelectorAll('.lang-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
}

function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    updateIconsForTheme(theme);
}

function applyLanguage(lang) {
    console.log('Language changed to:', lang);
    // Здесь будет ваша логика смены языка
}

function updateIconsForTheme(theme) {
    document.querySelectorAll('img[src*="Theme_"]').forEach(img => {
        img.src = img.src.replace(/Theme_\d+/, `Theme_${theme}`);
    });
}

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
