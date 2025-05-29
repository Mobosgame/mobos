// Объект переводов
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

function initSettings() {
    // Проверяем, существует ли контейнер настроек
    var settingsScreen = document.getElementById('settings-screen');
    if (!settingsScreen) return;

    // Загружаем настройки
    var savedSettings = appStorage.get('settings') || {
        theme: '1',
        language: 'ru'
    };

    // Применяем настройки
    applyTheme(savedSettings.theme);
    applyLanguage(savedSettings.language);
    markActiveOptions(savedSettings);

    // Обработчики для тем
    var themeOptions = settingsScreen.querySelectorAll('.theme-option');
    themeOptions.forEach(function(option) {
        option.addEventListener('click', function() {
            var theme = this.getAttribute('data-theme');
            savedSettings.theme = theme;
            appStorage.set('settings', savedSettings);
            applyTheme(theme);
            markActiveOptions(savedSettings);
        });
    });

    // Обработчики для языков
    var langOptions = settingsScreen.querySelectorAll('.lang-option');
    langOptions.forEach(function(option) {
        option.addEventListener('click', function() {
            var lang = this.getAttribute('data-lang');
            savedSettings.language = lang;
            appStorage.set('settings', savedSettings);
            applyLanguage(lang);
            markActiveOptions(savedSettings);
        });
    });

    // Кнопка закрытия
    var closeBtn = settingsScreen.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', goBack);
    }
}

function applyTheme(theme) {
    document.body.className = 'theme-' + theme;
    updateIconsForTheme(theme);
}

function applyLanguage(lang) {
    var langData = translations[lang] || translations['ru'];
    document.querySelectorAll('[data-lang]').forEach(function(el) {
        var key = el.getAttribute('data-lang');
        if (langData[key]) {
            el.textContent = langData[key];
        }
    });
}

function markActiveOptions(settings) {
    // Отмечаем активную тему
    document.querySelectorAll('.theme-option').forEach(function(el) {
        el.classList.remove('active');
    });
    var activeTheme = document.querySelector('.theme-option[data-theme="' + settings.theme + '"]');
    if (activeTheme) activeTheme.classList.add('active');

    // Отмечаем активный язык
    document.querySelectorAll('.lang-option').forEach(function(el) {
        el.classList.remove('active');
    });
    var activeLang = document.querySelector('.lang-option[data-lang="' + settings.language + '"]');
    if (activeLang) activeLang.classList.add('active');
}

function updateIconsForTheme(theme) {
    document.querySelectorAll('img[src*="Theme_"]').forEach(function(img) {
        var newSrc = img.src.replace(/Theme_\d+/, 'Theme_' + theme);
        // Проверяем, существует ли изображение
        var testImg = new Image();
        testImg.onerror = function() {
            console.log('Image not found:', newSrc);
        };
        testImg.src = newSrc;
        img.src = newSrc;
    });
}
