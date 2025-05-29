(function() {
    // Объект переводов (если еще не объявлен)
    if (!window.translations) {
        window.translations = {
            ru: {
                settings: "Настройки",
                theme: "Тема оформления",
                theme1: "Тема 1", 
                theme2: "Тема 2",
                language: "Язык",
                russian: "Русский",
                english: "English",
                // Добавьте другие тексты приложения
            },
            en: {
                settings: "Settings",
                theme: "Color Theme", 
                theme1: "Theme 1",
                theme2: "Theme 2",
                language: "Language",
                russian: "Russian",
                english: "English",
                // Добавьте другие тексты приложения
            }
        };
    }

    // Функция для обновления всего интерфейса
    function updateEntireInterface(settings) {
        // 1. Применяем тему
        document.body.className = 'theme-' + settings.theme;
        
        // 2. Обновляем иконки темы
        document.querySelectorAll('img[src*="Theme_"]').forEach(img => {
            img.src = img.src.replace(/Theme_\d+/, 'Theme_' + settings.theme);
        });
        
        // 3. Применяем язык ко всему приложению
        const langData = window.translations[settings.language] || window.translations.ru;
        document.querySelectorAll('[data-lang]').forEach(el => {
            const key = el.getAttribute('data-lang');
            if (langData[key]) el.textContent = langData[key];
        });
        
        // 4. Обновляем нижнюю панель
        updateBottomNavigation(settings.language);
    }

    // Функция для обновления нижней панели
    function updateBottomNavigation(lang) {
        const texts = {
            calls: window.translations[lang]?.calls || "Вызовы",
            messages: window.translations[lang]?.messages || "Сообщения",
            darkwall: window.translations[lang]?.darkwall || "ТемнаяСтена"
        };
        
        document.querySelectorAll('.nav-label').forEach(label => {
            const app = label.closest('.nav-cell').querySelector('.app-btn').id.replace('-btn', '');
            if (texts[app]) label.textContent = texts[app];
        });
    }

    // Инициализация настроек
    window.initSettings = function() {
        const settingsScreen = document.getElementById('settings-screen');
        if (!settingsScreen) return;

        // Загружаем текущие настройки
        const currentSettings = window.appStorage.get('settings') || {
            theme: '1',
            language: 'ru'
        };

        // Отмечаем активные элементы
        markActiveOptions(currentSettings);

        // Обработчики для тем
        settingsScreen.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', function() {
                const newSettings = {
                    ...currentSettings,
                    theme: this.getAttribute('data-theme')
                };
                window.appStorage.set('settings', newSettings);
                updateEntireInterface(newSettings);
                markActiveOptions(newSettings);
            });
        });

        // Обработчики для языков
        settingsScreen.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', function() {
                const newSettings = {
                    ...currentSettings,
                    language: this.getAttribute('data-lang')
                };
                window.appStorage.set('settings', newSettings);
                updateEntireInterface(newSettings);
                markActiveOptions(newSettings);
            });
        });

        // Кнопка закрытия
        const closeBtn = settingsScreen.querySelector('.close-btn');
        if (closeBtn) closeBtn.addEventListener('click', window.goBack);
    };

    // Отметка активных опций в настройках
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
})();
