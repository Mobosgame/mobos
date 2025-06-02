// darkwall.js
function initDarkwall() {
    // Обработчик закрытия
    document.querySelector('#darkwall-screen .close-btn').addEventListener('click', () => {
        
        goBack();
    });
}
document.addEventListener('DOMContentLoaded', function() {
    // Конфигурация игры
    const config = {
        rows: 7,
        cols: 4,
        minesPerRow: 2,
        initialHealth: 100,
        damagePerMine: 25
    };

    // Состояние игры
    const state = {
        board: [],
        currentMode: null,
        playerHealth: config.initialHealth,
        currentRow: 0,
        isDefensePhase: true,
        gameMode: null,
        isScriptAttacking: false,
        gameInterval: null
    };

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
        closeBtn: document.querySelector('.close-btn'),
        gameContent: document.querySelector('.game-content')
    };

    // Инициализация игры
    function init() {
        createBoard();
        setupEventListeners();
        showMainMenu();
        console.log("Игра инициализирована");
    }

    // Создание игрового поля
    function createBoard() {
        elements.board.innerHTML = '';
        state.board = [];

        for (let i = 0; i < config.rows; i++) {
            const row = document.createElement('div');
            row.className = 'row hidden';
            state.board[i] = [];

            for (let j = 0; j < config.cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                row.appendChild(cell);
                state.board[i][j] = { isMine: false, revealed: false };
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
        elements.closeBtn.addEventListener('click', closeGame);

        // Обработка кликов по клеткам
        elements.board.addEventListener('click', function(e) {
            if (e.target.classList.contains('cell')) {
                handleCellClick(e);
            }
        });
    }

    function closeGame() {
        clearGameInterval();
        console.log('Игра закрыта');
        // Дополнительная логика закрытия экрана
    }

    function clearGameInterval() {
        if (state.gameInterval) {
            clearInterval(state.gameInterval);
            state.gameInterval = null;
        }
    }

    // Обработка клика по клетке
    function handleCellClick(e) {
        if (state.isScriptAttacking) return;

        const cell = e.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (state.isDefensePhase) {
            handleDefenseClick(row, col, cell);
        } else {
            handleAttackClick(row, col, cell);
        }
    }

    // Режим защиты: расстановка мин
    function handleDefenseClick(row, col, cell) {
        if (state.board[row][col].isMine) {
            // Удаление мины при повторном клике
            state.board[row][col].isMine = false;
            cell.classList.remove('mine');
            document.querySelectorAll('.row')[row].classList.remove('completed');
            return;
        }

        const minesInRow = state.board[row].filter(c => c.isMine).length;
        if (minesInRow >= config.minesPerRow) {
            showNotification(`В этом ряду уже ${config.minesPerRow} мины!`);
            return;
        }

        state.board[row][col].isMine = true;
        cell.classList.add('mine');

        if (minesInRow + 1 === config.minesPerRow) {
            document.querySelectorAll('.row')[row].classList.add('completed');
        }
    }

    // Режим атаки: открытие клеток
    function handleAttackClick(row, col, cell) {
        if (row !== state.currentRow || state.board[row][col].revealed) return;

        state.board[row][col].revealed = true;

        if (state.board[row][col].isMine) {
            // Наступили на мину
            cell.classList.add('mine');
            state.playerHealth -= config.damagePerMine;
            updateStatus(`Мина! Здоровье: ${state.playerHealth}%`);
            
            if (state.playerHealth <= 0) {
                endGame(false);
            }
        } else {
            // Безопасная клетка
            cell.classList.add('revealed');
            document.querySelectorAll('.row')[state.currentRow].classList.remove('active');
            document.querySelectorAll('.row')[state.currentRow].classList.add('completed');
            state.currentRow++;

            if (state.currentRow < config.rows) {
                // Переход к следующему ряду
                document.querySelectorAll('.row')[state.currentRow].classList.remove('hidden');
                document.querySelectorAll('.row')[state.currentRow].classList.add('active');
                updateStatus(`Прогресс: ряд ${state.currentRow + 1}`);
            } else {
                // Все ряды пройдены
                endGame(true);
            }
        }
    }

    // Начало игры
    function startGame(mode) {
        resetGame();
        state.gameMode = mode;
        elements.mainMenu.classList.add('hidden');

        if (mode === 'solo') {
            elements.soloMode.classList.remove('hidden');
        } else {
            startDefensePhase();
        }
    }

    // Установка режима игры
    function setMode(mode) {
        state.currentMode = mode;
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

    // Случайная расстановка мин (для режима атаки)
    function placeRandomMines() {
        for (let i = 0; i < config.rows; i++) {
            let placed = 0;
            while (placed < config.minesPerRow) {
                const col = Math.floor(Math.random() * config.cols);
                if (!state.board[i][col].isMine) {
                    state.board[i][col].isMine = true;
                    placed++;
                }
            }
        }
    }

    // Начало фазы защиты
    function startDefensePhase() {
        state.isDefensePhase = true;
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
        for (let i = 0; i < config.rows; i++) {
            if (state.board[i].filter(c => c.isMine).length !== config.minesPerRow) {
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
        state.isDefensePhase = false;
        elements.readyBtn.classList.add('hidden');

        // Настройка видимости рядов
        document.querySelectorAll('.row').forEach((row, index) => {
            if (index === 0) {
                row.classList.remove('hidden');
                row.classList.add('active');
            } else {
                row.classList.add('hidden');
            }
        });

        if (state.gameMode === 'duo' || state.currentMode === 'attack') {
            // Режим для двух игроков или атака в одиночном режиме
            updateStatus("Начните с первого ряда!");
            elements.backBtn.classList.remove('hidden');
        } else if (state.currentMode === 'defense') {
            // Защита в одиночном режиме (бот атакует)
            updateStatus("Скрипт начинает атаку...");
            simulateAttacker();
        }
    }

    // Имитация атаки бота
    function simulateAttacker() {
        state.isScriptAttacking = true;
        
        state.gameInterval = setInterval(() => {
            if (state.currentRow >= config.rows || state.playerHealth <= 0) {
                // Игра завершена
                clearGameInterval();
                state.isScriptAttacking = false;
                endGame(state.currentRow >= config.rows);
                return;
            }

            const col = Math.floor(Math.random() * config.cols);
            const cell = document.querySelector(`.cell[data-row='${state.currentRow}'][data-col='${col}']`);

            if (!state.board[state.currentRow][col].revealed) {
                state.board[state.currentRow][col].revealed = true;
                
                if (state.board[state.currentRow][col].isMine) {
                    // Бот наступил на мину
                    cell.classList.add('mine', 'revealed');
                    state.playerHealth -= config.damagePerMine;
                    updateStatus(`Скрипт наступил на мину! Здоровье: ${state.playerHealth}%`);
                } else {
                    // Бот выбрал безопасную клетку
                    cell.classList.add('revealed');
                    document.querySelectorAll('.row')[state.currentRow].classList.remove('active');
                    document.querySelectorAll('.row')[state.currentRow].classList.add('completed');
                    state.currentRow++;

                    if (state.currentRow < config.rows) {
                        // Переход к следующему ряду
                        document.querySelectorAll('.row')[state.currentRow].classList.remove('hidden');
                        document.querySelectorAll('.row')[state.currentRow].classList.add('active');
                        updateStatus(`Скрипт переходит к ряду ${state.currentRow + 1}`);
                    }
                }
            }
        }, 1000);
    }

    // Завершение игры
    function endGame(isWin) {
        clearGameInterval();
        elements.gameOverTitle.textContent = isWin ? 'Победа!' : 'Поражение!';
        elements.gameOverMenu.classList.remove('hidden');
    }

    // Обновление статуса игры
    function updateStatus(text) {
        elements.status.textContent = text;
    }

    // Показать главное меню
    function showMainMenu() {
        clearGameInterval();
        elements.mainMenu.classList.remove('hidden');
        elements.soloMode.classList.add('hidden');
        elements.backBtn.classList.add('hidden');
        elements.board.classList.add('hidden');
        elements.readyBtn.classList.add('hidden');
        elements.gameOverMenu.classList.add('hidden');
        updateStatus("Готов к игре");
        resetGame();
    }

    // Сброс состояния игры
    function resetGame() {
        state.playerHealth = config.initialHealth;
        state.currentRow = 0;
        state.isDefensePhase = true;
        state.currentMode = null;
        state.gameMode = null;
        state.isScriptAttacking = false;
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

    // Запуск игры
    init();
});
//window.initDarkwall = initDarkwall;
//window.showDarkwall = showDarkwall;
