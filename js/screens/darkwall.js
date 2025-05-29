function initDarkwall() {
    // Инициализация закрытия окна
    document.querySelector('#darkwall-screen .close-btn').addEventListener('click', goBack);
    
    // Игровые переменные
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

    // Создание игрового поля
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

    // Остальные функции игры (аналогичные оригинальным из game.html, но с использованием gameState)
    function handleCellClick(e) {
        if (gameState.isScriptAttacking) return;
        const cell = e.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (gameState.isDefensePhase) {
            handleDefenseClick(row, col, cell);
        } else {
            handleAttackClick(row, col, cell);
        }
    }

    function handleDefenseClick(row, col, cell) {
        if (gameState.board[row][col].isMine) return;

        const minesInRow = gameState.board[row].filter(c => c.isMine).length;
        if (minesInRow >= gameState.minesPerRow) {
            showNotification(`В этом ряду уже ${gameState.minesPerRow} мины!`);
            return;
        }

        gameState.board[row][col].isMine = true;
        cell.classList.add('mine');

        if (minesInRow + 1 === gameState.minesPerRow) {
            document.querySelectorAll('.row')[row].classList.add('completed');
        }
    }

    // ... (остальные функции игры аналогично, с заменой переменных на gameState)

    // Экспорт функций в глобальную область видимости
    window.startGame = startGame;
    window.setMode = setMode;
    window.confirmMines = confirmMines;
    window.showMainMenu = showMainMenu;

    // Первоначальное создание поля
    createBoard();
}

function showDarkwall() {
    document.getElementById('darkwall-screen').style.display = 'block';
    initDarkwall();
}

function hideDarkwall() {
    document.getElementById('darkwall-screen').style.display = 'none';
}
