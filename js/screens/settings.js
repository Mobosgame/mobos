// Текущие настройки (без сохранения)
let currentSettings = {
    theme: '1',
    language: 'ru'
};

function initSettings() {
    // Применяем текущие настройки
    applySettings(currentSettings);

    // Обработчики для тем
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            currentSettings.theme = this.getAttribute('data-theme');
            applySettings(currentSettings);
        });
    });

    // Обработчики для языков
    document.querySelectorAll('.lang-option').forEach(option => {
        option.addEventListener('click', function() {
            currentSettings.language = this.getAttribute('data-lang');
            applySettings(currentSettings);
        });
    });

    // Кнопка закрытия
    document.querySelector('#settings-screen .close-btn').addEventListener('click', goBack);
}

function applySettings(settings) {
    // Применяем тему
    document.body.className = 'theme-' + settings.theme;
    updateIconsForTheme(settings.theme);
    
    // Применяем язык
    applyLanguage(settings.language);
    
    // Отмечаем активные элементы
    markActiveOptions(settings);
}

function applyLanguage(lang) {
    const langData = window.translations[lang] || window.translations.ru;
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (langData[key]) el.textContent = langData[key];
    });
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

function updateIconsForTheme(theme) {
    document.querySelectorAll('img[src*="Theme_"]').forEach(img => {
        img.src = img.src.replace(/Theme_\d+/, 'Theme_' + theme);
    });
}
