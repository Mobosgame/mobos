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
    
    // Инициализация кнопки закрытия
    const closeBtn = document.querySelector('#darkwall-screen .close-btn');
    if (closeBtn) {
        closeBtn.onclick = null; // Удаляем старый обработчик
        closeBtn.addEventListener('click', () => {
            showMainMenu();
            goBack();
        });
    }

    // Инициализация игрового поля
    createBoard();
    showMainMenu();
}

function showDarkwall() {
    console.log('Showing Darkwall screen');
    const screen = document.getElementById('darkwall-screen');
    if (screen) {
        screen.style.display = 'block';
        resetGame();
    }
}

function createBoard() {
    const boardElement = document.getElementById('board');
    if (!boardElement) return;
    
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
            cell.addEventListener('click', (e) => handleCellClick(e));
            row.appendChild(cell);
            gameState.board[i][j] = { isMine: false, revealed: false };
        }
        boardElement.appendChild(row);
    }
}

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

function handleAttackClick(row, col, cell) {
    if (row !== gameState.currentRow || gameState.board[row][col].revealed) return;

    gameState.board[row][col].revealed = true;

    if (gameState.board[row][col].isMine) {
        cell.classList.add('mine');
        gameState.playerHealth -= 25;
        updateStatus(`Мина! Здоровье: ${gameState.playerHealth}%`);
        if (gameState.playerHealth <= 0) {
            endGame(false);
        }
    } else {
        cell.classList.add('revealed');
        document.querySelectorAll('.row')[gameState.currentRow].classList.remove('active');
        document.querySelectorAll('.row')[gameState.currentRow].classList.add('completed');
        gameState.currentRow++;

        if (gameState.currentRow < gameState.rows) {
            document.querySelectorAll('.row')[gameState.currentRow].classList.remove('hidden');
            document.querySelectorAll('.row')[gameState.currentRow].classList.add('active');
            updateStatus(`Прогресс: ряд ${gameState.currentRow + 1}`);
        } else {
            endGame(true);
        }
    }
}

function startGame(mode) {
    gameState.gameMode = mode;
    document.getElementById('main-menu').classList.add('hidden');

    if (mode === 'solo') {
        document.getElementById('solo-mode').classList.remove('hidden');
    } else {
        startDefensePhase();
    }
}

function setMode(mode) {
    gameState.currentMode = mode;
    document.getElementById('solo-mode').classList.add('hidden');
    document.getElementById('board').classList.remove('hidden');

    if (mode === 'attack') {
        createBoard();
        placeRandomMines();
        startAttackPhase();
    } else {
        startDefensePhase();
    }
}

function placeRandomMines() {
    for (let i = 0; i < gameState.rows; i++) {
        let placed = 0;
        while (placed < gameState.minesPerRow) {
            const col = Math.floor(Math.random() * gameState.cols);
            if (!gameState.board[i][col].isMine) {
                gameState.board[i][col].isMine = true;
                placed++;
            }
        }
    }
}

function startDefensePhase() {
    gameState.isDefensePhase = true;
    createBoard();
    document.getElementById('board').classList.remove('hidden');
    document.getElementById('ready-btn').classList.remove('hidden');
    document.getElementById('back-btn').classList.remove('hidden');
    document.querySelectorAll('.row').forEach(row => {
        row.classList.remove('hidden');
        row.style.pointerEvents = 'auto';
    });
    updateStatus("Расставьте мины (по 2 в каждом ряду)");
}

function confirmMines() {
    for (let i = 0; i < gameState.rows; i++) {
        if (gameState.board[i].filter(c => c.isMine).length !== gameState.minesPerRow) {
            showNotification(`Ряд ${i + 1} не полностью заполнен!`);
            return;
        }
    }
    document.getElementById('back-btn').classList.add('hidden');
    hideMines();
    startAttackPhase();
}

function hideMines() {
    document.querySelectorAll('.mine').forEach(cell => {
        cell.classList.remove('mine');
    });
}

function startAttackPhase() {
    gameState.isDefensePhase = false;
    document.getElementById('ready-btn').classList.add('hidden');

    document.querySelectorAll('.row').forEach((row, index) => {
        if (index === 0) {
            row.classList.remove('hidden');
            row.classList.add('active');
        } else {
            row.classList.add('hidden');
        }
    });

    if (gameState.gameMode === 'duo' || gameState.currentMode === 'attack') {
        updateStatus("Начните с первого ряда!");
        document.getElementById('back-btn').classList.remove('hidden');
    } else if (gameState.currentMode === 'defense') {
        updateStatus("Скрипт начинает атаку...");
        simulateAttacker();
    }
}

function simulateAttacker() {
    gameState.isScriptAttacking = true;
    const interval = setInterval(() => {
        if (gameState.currentRow >= gameState.rows || gameState.playerHealth <= 0) {
            clearInterval(interval);
            gameState.isScriptAttacking = false;
            endGame(gameState.currentRow < gameState.rows);
            return;
        }

        const col = Math.floor(Math.random() * gameState.cols);
        const cell = document.querySelector(`.cell[data-row='${gameState.currentRow}'][data-col='${col}']`);

        if (!gameState.board[gameState.currentRow][col].revealed) {
            if (gameState.board[gameState.currentRow][col].isMine) {
                cell.classList.add('mine', 'revealed');
                gameState.playerHealth -= 25;
                updateStatus(`Скрипт наступил на мину! Здоровье: ${gameState.playerHealth}%`);
            } else {
                cell.classList.add('revealed');
                document.querySelectorAll('.row')[gameState.currentRow].classList.remove('active');
                document.querySelectorAll('.row')[gameState.currentRow].classList.add('completed');
                gameState.currentRow++;

                if (gameState.currentRow < gameState.rows) {
                    document.querySelectorAll('.row')[gameState.currentRow].classList.remove('hidden');
                    document.querySelectorAll('.row')[gameState.currentRow].classList.add('active');
                    updateStatus(`Скрипт переходит к ряду ${gameState.currentRow + 1}`);
                }
            }
            gameState.board[gameState.currentRow][col].revealed = true;
        }
    }, 1000);
}

function endGame(isWin) {
    const gameOverMenu = document.getElementById('game-over-menu');
    const gameOverTitle = document.getElementById('game-over-title');
    if (gameOverMenu && gameOverTitle) {
        gameOverTitle.textContent = isWin ? 'Победа!' : 'Поражение!';
        gameOverMenu.classList.remove('hidden');
    }
}

function updateStatus(text) {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = text;
    }
}

function showMainMenu() {
    const elementsToUpdate = [
        'main-menu', 'solo-mode', 'board',
        'ready-btn', 'back-btn', 'game-over-menu', 'notification'
    ];
    
    elementsToUpdate.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('hidden');
        }
    });
    
    document.getElementById('main-menu')?.classList.remove('hidden');
    resetGame();
}

function resetGame() {
    gameState.playerHealth = 100;
    gameState.currentRow = 0;
    gameState.isDefensePhase = true;
    gameState.currentMode = null;
    gameState.gameMode = null;
    gameState.isScriptAttacking = false;
    createBoard();
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.classList.remove('hidden');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 2000);
    }
}

// Экспорт функций для глобального доступа
window.initDarkwall = initDarkwall;
window.showDarkwall = showDarkwall;
window.startGame = startGame;
window.setMode = setMode;
window.confirmMines = confirmMines;
window.showMainMenu = showMainMenu;
