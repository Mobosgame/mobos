// darkwall.js
function initDarkwall() {
    // Закрытие окна
    document.querySelector('#darkwall-screen .close-btn').addEventListener('click', goBack);

    // Инициализация игры
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

    // Инициализация игрового поля
    function createBoard() {
        const boardElement = document.querySelector('#darkwall-screen #board');
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

    // Остальные функции игры (аналогичные вашим, но с использованием gameState)
    function handleCellClick(e) {
        if (gameState.isScriptAttacking) return;
        // ... остальная логика обработки кликов
    }

    function startGame(mode) {
        gameState.gameMode = mode;
        document.querySelector('#darkwall-screen #main-menu').classList.add('hidden');

        if (mode === 'solo') {
            document.querySelector('#darkwall-screen #solo-mode').classList.remove('hidden');
        } else {
            startDefensePhase();
        }
    }

    // ... все остальные функции игры (аналогичные вашим)

    // Экспортируем функции в глобальную область видимости
    window.startGame = startGame;
    window.setMode = setMode;
    window.confirmMines = confirmMines;
    window.showMainMenu = showMainMenu;

    // Инициализация
    createBoard();
}

// Функции для управления окном
function showDarkwall() {
    document.getElementById('darkwall-screen').style.display = 'block';
    initDarkwall();
}

function hideDarkwall() {
    document.getElementById('darkwall-screen').style.display = 'none';
}
