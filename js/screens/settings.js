// Текущие настройки (без сохранения)
let currentSettings = {
    theme: '1',
    language: 'ru'
};

function initSettings() {
    // Применяем текущие настройки
    applySettings(currentSettings);

    // Обработчик для выбора темы
    document.getElementById('theme-selector').addEventListener('change', function() {
        currentSettings.theme = this.value;
        applySettings(currentSettings);
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
    // Устанавливаем выбранную тему в select
    document.getElementById('theme-selector').value = settings.theme;
    
    // Языки
    document.querySelectorAll('.lang-option').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-lang') === settings.language);
    });
}
