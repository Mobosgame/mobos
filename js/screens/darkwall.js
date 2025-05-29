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
    // Инициализация кнопки закрытия
    document.querySelector('#darkwall-screen .close-btn').addEventListener('click', () => {
        resetGame();
        goBack();
    });

    // Инициализация кнопок меню
    document.querySelectorAll('#main-menu button').forEach((btn, index) => {
        btn.onclick = () => startGame(index === 0 ? 'solo' : 'duo');
    });

    // Инициализация кнопок режима
    document.querySelectorAll('#solo-mode button').forEach((btn, index) => {
        if (index < 2) {
            btn.onclick = () => setMode(index === 0 ? 'attack' : 'defense');
        } else {
            btn.onclick = showMainMenu;
        }
    });

    // Инициализация игровых кнопок
    document.getElementById('ready-btn').onclick = confirmMines;
    document.getElementById('back-btn').onclick = showMainMenu;
    document.querySelector('#game-over-menu button').onclick = showMainMenu;

    // Создаем игровое поле
    createBoard();
    showMainMenu();
}

function showDarkwall() {
    document.getElementById('darkwall-screen').classList.remove('hidden');
    resetGame();
}

function createBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    gameState.board = [];

    for (let i = 0; i < gameState.rows; i++) {
        const row = document.createElement('div');
        row.className = 'row hidden';
        gameState.board[i] = [];

        for (let j = 0; j < gameState.cols; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleCellClick);
            row.appendChild(cell);
            gameState.board[i][j] = { isMine: false, revealed: false };
        }
        boardElement.appendChild(row);
    }
}

// ... (все остальные игровые функции из оригинального game.html) ...

function resetGame() {
    gameState.playerHealth = 100;
    gameState.currentRow = 0;
    gameState.isDefensePhase = true;
    gameState.currentMode = null;
    gameState.gameMode = null;
    gameState.isScriptAttacking = false;
    
    document.getElementById('main-menu').classList.remove('hidden');
    document.getElementById('solo-mode').classList.add('hidden');
    document.getElementById('board').classList.add('hidden');
    document.getElementById('ready-btn').classList.add('hidden');
    document.getElementById('back-btn').classList.add('hidden');
    document.getElementById('game-over-menu').classList.add('hidden');
    document.getElementById('notification').classList.add('hidden');
    
    createBoard();
}

// Экспорт функций
window.initDarkwall = initDarkwall;
window.showDarkwall = showDarkwall;
