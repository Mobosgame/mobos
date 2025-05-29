// Объект для хранения функций обновления интерфейса
window.appUpdater = {
    updateTheme: function(theme) {
        document.body.className = 'theme-' + theme;
        document.querySelectorAll('img[src*="Theme_"]').forEach(img => {
            img.src = img.src.replace(/Theme_\d+/, 'Theme_' + theme);
        });
    },
    updateLanguage: function(lang) {
        const langData = window.translations[lang] || window.translations.ru;
        document.querySelectorAll('[data-lang]').forEach(el => {
            const key = el.getAttribute('data-lang');
            if (langData[key]) el.textContent = langData[key];
        });
    }
};

function initSettings() {
    // Загружаем сохраненные настройки
    const savedSettings = window.appStorage.get('settings') || {
        theme: '1',
        language: 'ru'
    };

    // Применяем текущие настройки
    applySettings(savedSettings);

    // Обработчики для тем
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const newSettings = {
                ...savedSettings,
                theme: this.getAttribute('data-theme')
            };
            window.appStorage.set('settings', newSettings);
            applySettings(newSettings);
        });
    });

    // Обработчики для языков
    document.querySelectorAll('.lang-option').forEach(option => {
        option.addEventListener('click', function() {
            const newSettings = {
                ...savedSettings,
                language: this.getAttribute('data-lang')
            };
            window.appStorage.set('settings', newSettings);
            applySettings(newSettings);
        });
    });

    // Кнопка закрытия
    document.querySelector('#settings-screen .close-btn').addEventListener('click', goBack);
}

function applySettings(settings) {
    // Обновляем тему
    window.appUpdater.updateTheme(settings.theme);
    
    // Обновляем язык
    window.appUpdater.updateLanguage(settings.language);
    
    // Отмечаем активные элементы
    markActiveOptions(settings);
}

function markActiveOptions(settings) {
    // Темы
    document.querySelectorAll('.theme-option').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-theme') === settings.theme);
    });
    
    // Языки
    document.querySelectorAll('.lang-option').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-lang') === settings.language);
    });
}
