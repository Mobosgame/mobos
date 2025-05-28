const translations = {
    en: {
        settings: "Settings",
        theme: "Theme",
        language: "Language",
        darkwall: "DarkWall",
        calls: "Calls",
        messages: "Messages",
        back: "Back"
    },
    ru: {
        settings: "Настройки",
        theme: "Тема",
        language: "Язык",
        darkwall: "ТемнаяСтена",
        calls: "Вызовы",
        messages: "Сообщения",
        back: "Назад"
    }
};

let currentLanguage = 'ru';

function updateTextElements() {
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        el.textContent = translations[currentLanguage][key] || key;
    });
}

function setLanguage(lang) {
    currentLanguage = lang;
    updateTextElements();
    localStorage.setItem('appLanguage', lang);
}
