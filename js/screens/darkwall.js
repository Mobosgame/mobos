// Глобальное состояние игры
const gameState = {
    rows: 7,
    cols: 4,
    minesPerRow: 2,
    board: [],
    currentMode: null,
    playerHealth: 100,
    currentRow: 0,
    isDefensePhase: true,
    gameMode: null,
    isScriptAttacking: false
};

function initDarkwall() {
    console.log('Initializing Darkwall game');
    
    // Отложенная инициализация после полной загрузки DOM
    const init = () => {
        const closeBtn = document.querySelector('#darkwall-screen .close-btn');
        if (!closeBtn) {
            console.error('Close button not found, retrying...');
            setTimeout(init, 100);
            return;
        }

        // Инициализация кнопки закрытия
        closeBtn.onclick = null;
        closeBtn.addEventListener('click', () => {
            console.log('Closing Darkwall game');
            resetGame();
            goBack();
        });

        // Инициализация игровых кнопок
        initGameButtons();
        createBoard();
        showMainMenu();
    };

    setTimeout(init, 0);
}

function initGameButtons() {
    // Инициализация всех кнопок игры с проверкой существования
    const initButton = (selector, handler) => {
        const btn = document.querySelector(selector);
        if (btn) {
            btn.onclick = null;
            btn.addEventListener('click', handler);
        }
    };

    initButton('#main-menu button:nth-child(1)', () => startGame('solo'));
    initButton('#main-menu button:nth-child(2)', () => startGame('duo'));
    initButton('#solo-mode button:nth-child(1)', () => setMode('attack'));
    initButton('#solo-mode button:nth-child(2)', () => setMode('defense'));
    initButton('#solo-mode button:nth-child(3)', showMainMenu);
    initButton('#ready-btn', confirmMines);
    initButton('#back-btn', showMainMenu);
    initButton('#game-over-menu button', showMainMenu);
}

function showDarkwall() {
    console.log('Showing Darkwall screen');
    const screen = document.getElementById('darkwall-screen');
    if (screen) {
        screen.style.display = 'block';
        resetGame();
    } else {
        console.error('Darkwall screen element not found');
    }
}

// ... (остальные игровые функции остаются без изменений) ...

// Экспорт функций
window.initDarkwall = initDarkwall;
window.showDarkwall = showDarkwall;
