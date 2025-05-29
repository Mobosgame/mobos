// Проверяем, не объявлена ли переменная translations
if (typeof translations === 'undefined') {
    var translations = {
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

function initSettings() {
    // Загружаем настройки или используем по умолчанию
    var savedSettings = appStorage.get('settings') || {
        theme: '1',
        language: 'ru'
    };

    // Применяем настройки при загрузке
    applySettings(savedSettings);

    // Обработчики для тем
    document.querySelectorAll('.theme-option').forEach(function(option) {
        option.addEventListener('click', function() {
            var theme = this.dataset.theme;
            savedSettings.theme = theme;
            appStorage.set('settings', savedSettings);
            applySettings(savedSettings);
        });
    });

    // Обработчики для языков
    document.querySelectorAll('.lang-option').forEach(function(option) {
        option.addEventListener('click', function() {
            var lang = this.dataset.lang;
            savedSettings.language = lang;
            appStorage.set('settings', savedSettings);
            applySettings(savedSettings);
        });
    });

    // Кнопка закрытия
    document.querySelector('#settings-screen .close-btn').addEventListener('click', goBack);
}

function applySettings(settings) {
    // Применяем тему
    document.body.className = 'theme-' + settings.theme;
    updateActiveOption('theme', settings.theme);
    
    // Применяем язык
    applyLanguage(settings.language);
    updateActiveOption('lang', settings.language);
    
    // Обновляем иконки
    updateIconsForTheme(settings.theme);
}

function updateActiveOption(type, value) {
    // Удаляем активный класс у всех элементов
    document.querySelectorAll('.' + type + '-option').forEach(function(el) {
        el.classList.remove('active');
    });
    
    // Добавляем активный класс выбранному элементу
    var activeEl = document.querySelector('[' + type + '-option][data-' + type + '="' + value + '"]');
    if (activeEl) {
        activeEl.classList.add('active');
    }
}

function applyLanguage(lang) {
    // Обновляем тексты
    document.querySelectorAll('[data-lang]').forEach(function(el) {
        var key = el.getAttribute('data-lang');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
}

function updateIconsForTheme(theme) {
    // Обновляем иконки темы
    document.querySelectorAll('img[src*="Theme_"]').forEach(function(img) {
        img.src = img.src.replace(/Theme_\d+/, 'Theme_' + theme);
    });
}
