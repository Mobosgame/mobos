function initSettings() {
    // Переключение тем
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.dataset.theme;
            document.body.className = `theme-${theme}`;
            
            // Обновляем активную тему
            document.querySelectorAll('.theme-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
            
            // Обновляем иконки
            updateIconsForTheme(theme);
        });
    });

    // Кнопка закрытия
    document.querySelector('#settings-screen .close-btn').addEventListener('click', goBack);
}

function updateIconsForTheme(theme) {
    document.querySelectorAll('img[src*="Theme_"]').forEach(img => {
        img.src = img.src.replace(/Theme_\d+/, `Theme_${theme}`);
    });
}
