function initSettings() {
    // Загрузка сохраненных настроек
    const savedTheme = localStorage.getItem('appTheme') || '1';
    const savedLang = localStorage.getItem('appLanguage') || 'ru';
    
    // Установка значений в селекторы
    document.getElementById('theme-selector').value = savedTheme;
    document.getElementById('language-selector').value = savedLang;
    
    // Обработчики изменений
    document.getElementById('theme-selector').addEventListener('change', function() {
        const theme = this.value;
        document.body.className = `theme-${theme}`;
        localStorage.setItem('appTheme', theme);
        updateIconsForTheme(theme);
    });
    
    document.getElementById('language-selector').addEventListener('change', function() {
        setLanguage(this.value);
    });
    
    // Кнопка закрытия
    document.querySelector('#settings-screen .close-btn').addEventListener('click', goBack);
}

function updateIconsForTheme(theme) {
    document.querySelectorAll('img[src*="Theme_"]').forEach(img => {
        img.src = img.src.replace(/Theme_\d+/, `Theme_${theme}`);
    });
}
