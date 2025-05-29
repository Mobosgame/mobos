// Проверяем, существует ли уже объект translations
if (!window.translations) {
    window.translations = {
        ru: {
            settings: "Настройки",
            theme: "Тема оформления",
            theme1: "Тема 1",
            theme2: "Тема 2",
            language: "Язык",
            russian: "Русский",
            english: "English"
        },
        en: {
            settings: "Settings",
            theme: "Color Theme",
            theme1: "Theme 1",
            theme2: "Theme 2",
            language: "Language",
            russian: "Russian",
            english: "English"
        }
    };
}

(function() {
    // Функция для применения темы
    function applyTheme(theme) {
        document.body.className = 'theme-' + theme;
        updateIconsForTheme(theme);
    }

    // Функция для обновления иконок темы
    function updateIconsForTheme(theme) {
        document.querySelectorAll('img[src*="Theme_"]').forEach(function(img) {
            img.src = img.src.replace(/Theme_\d+/, 'Theme_' + theme);
        });
    }

    // Функция для применения языка
    function applyLanguage(lang) {
        const langData = window.translations[lang] || window.translations['ru'];
        document.querySelectorAll('[data-lang]').forEach(function(el) {
            const key = el.getAttribute('data-lang');
            if (langData[key]) {
                el.textContent = langData[key];
            }
        });
    }

    // Функция для отметки активных опций
    function markActiveOptions(settings) {
        // Темы
        document.querySelectorAll('.theme-option').forEach(function(el) {
            el.classList.toggle('active', el.getAttribute('data-theme') === settings.theme);
        });
        
        // Языки
        document.querySelectorAll('.lang-option').forEach(function(el) {
            el.classList.toggle('active', el.getAttribute('data-lang') === settings.language);
        });
    }

    // Основная функция инициализации
    window.initSettings = function() {
        const settingsScreen = document.getElementById('settings-screen');
        if (!settingsScreen) return;

        // Загружаем настройки
        const savedSettings = window.appStorage.get('settings') || {
            theme: '1',
            language: 'ru'
        };

        // Применяем настройки
        applyTheme(savedSettings.theme);
        applyLanguage(savedSettings.language);
        markActiveOptions(savedSettings);

        // Обработчики для тем
        settingsScreen.querySelectorAll('.theme-option').forEach(function(option) {
            option.addEventListener('click', function() {
                const theme = this.getAttribute('data-theme');
                const newSettings = {...window.appStorage.get('settings'), theme};
                window.appStorage.set('settings', newSettings);
                applyTheme(theme);
                markActiveOptions(newSettings);
            });
        });

        // Обработчики для языков
        settingsScreen.querySelectorAll('.lang-option').forEach(function(option) {
            option.addEventListener('click', function() {
                const lang = this.getAttribute('data-lang');
                const newSettings = {...window.appStorage.get('settings'), language: lang};
                window.appStorage.set('settings', newSettings);
                applyLanguage(lang);
                markActiveOptions(newSettings);
            });
        });

        // Кнопка закрытия
        const closeBtn = settingsScreen.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', window.goBack);
        }
    };
})();
