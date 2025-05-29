// Тексты для перевода
const translations = {
    ru: {
        settings: "Настройки",
        theme: "Тема оформления",
        theme1: "Тема 1",
        theme2: "Тема 2",
        language: "Язык",
        russian: "Русский",
        english: "English",
        calls: "Вызовы",
        messages: "Сообщения",
        darkwall: "ТемнаяСтена"
    },
    en: {
        settings: "Settings",
        theme: "Color Theme",
        theme1: "Theme 1",
        theme2: "Theme 2",
        language: "Language",
        russian: "Russian",
        english: "English",
        calls: "Calls",
        messages: "Messages",
        darkwall: "DarkWall"
    }
};

function initSettings() {
    // Загружаем сохраненные настройки
    const savedSettings = appStorage.get('settings') || {
        theme: '1',
        language: 'ru'
    };

    // Применяем сохраненные настройки
    applyTheme(savedSettings.theme);
    applyLanguage(savedSettings.language);

    // Переключение тем
    document.querySelectorAll('.theme-option').forEach(option => {
        if (option.dataset.theme === savedSettings.theme) {
            option.classList.add('active');
        }

        option.addEventListener('click', function() {
            const theme = this.dataset.theme;
            const newSettings = { ...savedSettings, theme };
            appStorage.set('settings', newSettings);
            applyTheme(theme);
            
            document.querySelectorAll('.theme-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // Переключение языков
    document.querySelectorAll('.lang-option').forEach(option => {
        if (option.dataset.lang === savedSettings.language) {
            option.classList.add('active');
        }

        option.addEventListener('click', function() {
            const lang = this.dataset.lang;
            const newSettings = { ...savedSettings, language: lang };
            appStorage.set('settings', newSettings);
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
    // Обновляем все элементы с data-lang
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Обновляем нижнюю панель
    updateBottomNavLanguage(lang);
}

function updateBottomNavLanguage(lang) {
    const texts = {
        calls: translations[lang]?.calls || "Вызовы",
        messages: translations[lang]?.messages || "Сообщения",
        darkwall: translations[lang]?.darkwall || "ТемнаяСтена"
    };
    
    document.querySelectorAll('.nav-label').forEach(label => {
        const app = label.closest('.nav-cell').querySelector('.app-btn').id.replace('-btn', '');
        if (texts[app]) {
            label.textContent = texts[app];
        }
    });
}

function updateIconsForTheme(theme) {
    document.querySelectorAll('img[src*="Theme_"]').forEach(img => {
        img.src = img.src.replace(/Theme_\d+/, `Theme_${theme}`);
    });
}
