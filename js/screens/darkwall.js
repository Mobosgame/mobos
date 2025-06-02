// darkwall.js
function initDarkwall() {
    // Обработчик закрытия
    document.querySelector('#darkwall-screen .close-btn').addEventListener('click', () => {
        
        goBack();
    });
}
document.addEventListener('DOMContentLoaded', function() {
    // Константы игры
    const rows = 7;
    const cols = 4;
    const minesPerRow = 2;
    
    // Состояние игры
    let board = [];
    let currentMode = null;
    let playerHealth = 100;
    let currentRow = 0;
    let isDefensePhase = true;
    let gameMode = null;
    let isScriptAttacking = false;

    // Элементы интерфейса
    const elements = {
        mainMenu: document.getElementById('main-menu'),
        soloMode: document.getElementById('solo-mode'),
        board: document.getElementById('board'),
        status: document.getElementById('status'),
        readyBtn: document.getElementById('ready-btn'),
        backBtn: document.getElementById('back-btn'),
        notification: document.getElementById('notification'),
        gameOverMenu: document.getElementById('game-over-menu'),
        gameOverTitle: document.getElementById('game-over-title'),
        soloBtn: document.getElementById('solo-btn'),
        duoBtn: document.getElementById('duo-btn'),
        attackBtn: document.getElementById('attack-btn'),
        defenseBtn: document.getElementById('defense-btn'),
        backToMain: document.getElementById('back-to-main'),
        okBtn: document.getElementById('ok-btn'),
        closeBtn: document.querySelector('.close-btn')
    };

    // Инициализация игры
    function init() {
        createBoard();
        setupEventListeners();
    }

    // Создание игрового поля
    function createBoard() {
        elements.board.innerHTML = '';
        board = [];

        for (let i = 0; i < rows; i++) {
            const row = document.createElement('div');
            row.className = 'row hidden';
            board[i] = [];

            for (let j = 0; j < cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                row.appendChild(cell);
                board[i][j] = { isMine: false, revealed: false };
            }
            elements.board.appendChild(row);
        }
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
        // Кнопки меню
        elements.soloBtn.addEventListener('click', () => startGame('solo'));
        elements.duoBtn.addEventListener('click', () => startGame('duo'));
        elements.attackBtn.addEventListener('click', () => setMode('attack'));
        elements.defenseBtn.addEventListener('click', () => setMode('defense'));
        elements.backToMain.addEventListener('click', showMainMenu);
        elements.readyBtn.addEventListener('click', confirmMines);
        elements.backBtn.addEventListener('click', showMainMenu);
        elements.okBtn.addEventListener('click', showMainMenu);
        elements.closeBtn.addEventListener('click', () => {
            // Здесь должна быть логика закрытия экрана
            console.log('Close darkwall screen');
        });

        // Обработка кликов по клеткам
        elements.board.addEventListener('click', function(e) {
            if (e.target.classList.contains('cell')) {
                handleCellClick(e);
            }
        });
    }

    // Обработка клика по клетке
    function handleCellClick(e) {
        if (isScriptAttacking) return;

        const cell = e.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (isDefensePhase) {
            handleDefenseClick(row, col, cell);
        } else {
            handleAttackClick(row, col, cell);
        }
    }

    // Обработка клика в режиме защиты
    function handleDefenseClick(row, col, cell) {
        if (board[row][col].isMine) return;

        const minesInRow = board[row].filter(c => c.isMine).length;
        if (minesInRow >= minesPerRow) {
            showNotification(`В этом ряду уже ${minesPerRow} мины!`);
            return;
        }

        board[row][col].isMine = true;
        cell.classList.add('mine');

        if (minesInRow + 1 === minesPerRow) {
            document.querySelectorAll('.row')[row].classList.add('completed');
        }
    }

    // Обработка клика в режиме атаки
    function handleAttackClick(row, col, cell) {
        if (row !== currentRow || board[row][col].revealed) return;

        board[row][col].revealed = true;

        if (board[row][col].isMine) {
            cell.classList.add('mine');
            playerHealth -= 25;
            updateStatus(`Мина! Здоровье: ${playerHealth}%`);
            if (playerHealth <= 0) {
                endGame(false);
            }
        } else {
            cell.classList.add('revealed');
            document.querySelectorAll('.row')[currentRow].classList.remove('active');
            document.querySelectorAll('.row')[currentRow].classList.add('completed');
            currentRow++;

            if (currentRow < rows) {
                document.querySelectorAll('.row')[currentRow].classList.remove('hidden');
                document.querySelectorAll('.row')[currentRow].classList.add('active');
                updateStatus(`Прогресс: ряд ${currentRow + 1}`);
            } else {
                endGame(true);
            }
        }
    }

    // Начало игры
    function startGame(mode) {
        gameMode = mode;
        elements.mainMenu.classList.add('hidden');

        if (mode === 'solo') {
            elements.soloMode.classList.remove('hidden');
        } else {
            startDefensePhase();
        }
    }

    // Установка режима игры
    function setMode(mode) {
        currentMode = mode;
        elements.soloMode.classList.add('hidden');
        elements.board.classList.remove('hidden');

        if (mode === 'attack') {
            createBoard();
            placeRandomMines();
            startAttackPhase();
        } else {
            startDefensePhase();
        }
    }

    // Размещение случайных мин
    function placeRandomMines() {
        for (let i = 0; i < rows; i++) {
            let placed = 0;
            while (placed < minesPerRow) {
                const col = Math.floor(Math.random() * cols);
                if (!board[i][col].isMine) {
                    board[i][col].isMine = true;
                    placed++;
                }
            }
        }
    }

    // Начало фазы защиты
    function startDefensePhase() {
        isDefensePhase = true;
        createBoard();
        elements.board.classList.remove('hidden');
        elements.readyBtn.classList.remove('hidden');
        elements.backBtn.classList.remove('hidden');
        document.querySelectorAll('.row').forEach(row => {
            row.classList.remove('hidden');
            row.style.pointerEvents = 'auto';
        });
        updateStatus("Расставьте мины (по 2 в каждом ряду)");
    }

    // Подтверждение расстановки мин
    function confirmMines() {
        for (let i = 0; i < rows; i++) {
            if (board[i].filter(c => c.isMine).length !== minesPerRow) {
                showNotification(`Ряд ${i + 1} не полностью заполнен!`);
                return;
            }
        }
        elements.backBtn.classList.add('hidden');
        hideMines();
        startAttackPhase();
    }

    // Скрытие мин перед фазой атаки
    function hideMines() {
        document.querySelectorAll('.mine').forEach(cell => {
            cell.classList.remove('mine');
        });
    }

    // Начало фазы атаки
    function startAttackPhase() {
        isDefensePhase = false;
        elements.readyBtn.classList.add('hidden');

        document.querySelectorAll('.row').forEach((row, index) => {
            if (index === 0) {
                row.classList.remove('hidden');
                row.classList.add('active');
            } else {
                row.classList.add('hidden');
            }
        });

        if (gameMode === 'duo' || currentMode === 'attack') {
            updateStatus("Начните с первого ряда!");
            elements.backBtn.classList.remove('hidden');
        } else if (currentMode === 'defense') {
            updateStatus("Скрипт начинает атаку...");
            simulateAttacker();
        }
    }

    // Имитация атаки бота
    function simulateAttacker() {
        isScriptAttacking = true;
        const interval = setInterval(() => {
            if (currentRow >= rows || playerHealth <= 0) {
                clearInterval(interval);
                isScriptAttacking = false;
                endGame(currentRow < rows);
                return;
            }

            const col = Math.floor(Math.random() * cols);
            const cell = document.querySelector(`.cell[data-row='${currentRow}'][data-col='${col}']`);

            if (!board[currentRow][col].revealed) {
                if (board[currentRow][col].isMine) {
                    cell.classList.add('mine', 'revealed');
                    playerHealth -= 25;
                    updateStatus(`Скрипт наступил на мину! Здоровье: ${playerHealth}%`);
                } else {
                    cell.classList.add('revealed');
                    document.querySelectorAll('.row')[currentRow].classList.remove('active');
                    document.querySelectorAll('.row')[currentRow].classList.add('completed');
                    currentRow++;

                    if (currentRow < rows) {
                        document.querySelectorAll('.row')[currentRow].classList.remove('hidden');
                        document.querySelectorAll('.row')[currentRow].classList.add('active');
                        updateStatus(`Скрипт переходит к ряду ${currentRow + 1}`);
                    }
                }
                board[currentRow][col].revealed = true;
            }
        }, 1000);
    }

    // Завершение игры
    function endGame(isWin) {
        elements.gameOverTitle.textContent = isWin ? 'Победа!' : 'Поражение!';
        elements.gameOverMenu.classList.remove('hidden');
    }

    // Обновление статуса
    function updateStatus(text) {
        elements.status.textContent = text;
    }

    // Показать главное меню
    function showMainMenu() {
        elements.mainMenu.classList.remove('hidden');
        elements.soloMode.classList.add('hidden');
        elements.backBtn.classList.add('hidden');
        elements.board.classList.add('hidden');
        elements.readyBtn.classList.add('hidden');
        elements.gameOverMenu.classList.add('hidden');
        updateStatus("");
        resetGame();
    }

    // Сброс игры
    function resetGame() {
        playerHealth = 100;
        currentRow = 0;
        isDefensePhase = true;
        currentMode = null;
        gameMode = null;
        isScriptAttacking = false;
        createBoard();
    }

    // Показать уведомление
    function showNotification(message) {
        elements.notification.textContent = message;
        elements.notification.classList.remove('hidden');
        setTimeout(() => {
            elements.notification.classList.add('hidden');
        }, 2000);
    }

    // Инициализация игры
    init();
});
//window.initDarkwall = initDarkwall;
//window.showDarkwall = showDarkwall;
