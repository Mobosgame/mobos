// darkwall.js
function initDarkwall() {
    // Обработчик закрытия
    document.querySelector('#darkwall-screen .close-btn').addEventListener('click', () => {
        resetGame();
        goBack();
    });
    
    // Инициализация игры
    initGame();
}

function showDarkwall() {
    resetGame();
    // Дополнительные действия при показе
}

window.initDarkwall = initDarkwall;
window.showDarkwall = showDarkwall;
