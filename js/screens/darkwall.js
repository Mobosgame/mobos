function initDarkwall() {
    // Обработчик закрытия
    document.querySelector('#darkwall-screen .close-btn').addEventListener('click', () => {
        goBack();
    });
// darkwall.js
document.addEventListener('DOMContentLoaded', function() {
    // Конфигурация игры
    const config = {
        rows: 7,
        cols: 4,
        minesPerRow: 2,
        initialHealth: 100,
        damagePerMine: 25,
        attackDelay: 1000 // Задержка атаки бота в мс
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
        screens: {
            mainMenu: document.getElementById('main-menu'),
            soloMode: document.getElementById('solo-mode'),
            gameBoard: document.getElementById('board')
        },
        buttons: {
            solo: document.getElementById('solo-btn'),
            duo: document.getElementById('duo-btn'),
            attack: document.getElementById('attack-btn'),
            defense: document.getElementById('defense-btn'),
            backToMain: document.getElementById('back-to-main'),
            ready: document.getElementById('ready-btn'),
            back: document.getElementById('back-btn'),
            ok: document.getElementById('ok-btn'),
            close: document.querySelector('.close-btn')
        },
        gameElements: {
            board: document.getElementById('board'),
            status: document.getElementById('status'),
            notification: document.getElementById('notification'),
            gameOverTitle: document.getElementById('game-over-title'),
            gameOverMenu: document.getElementById('game-over-menu')
        }
    };

    // Инициализация игры
    function init() {
        console.log("Инициализация игры Darkwall");
        createBoard();
        setupEventListeners();
        showScreen('mainMenu');
        updateStatus("Добро пожаловать в Темную Стену");
    }

    // Создание игрового поля
    function createBoard() {
        console.log("Создание игрового поля");
        elements.gameElements.board.innerHTML = '';
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
            elements.gameElements.board.appendChild(row);
        }
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
        console.log("Настройка обработчиков событий");
        
        // Кнопки меню
        elements.buttons.solo.addEventListener('click', () => startGame('solo'));
        elements.buttons.duo.addEventListener('click', () => startGame('duo'));
        elements.buttons.attack.addEventListener('click', () => setMode('attack'));
        elements.buttons.defense.addEventListener('click', () => setMode('defense'));
        elements.buttons.backToMain.addEventListener('click', () => showScreen('mainMenu'));
        elements.buttons.ready.addEventListener('click', confirmMines);
        elements.buttons.back.addEventListener('click', () => showScreen('mainMenu'));
        elements.buttons.ok.addEventListener('click', () => showScreen('mainMenu'));
        elements.buttons.close.addEventListener('click', closeGame);

        // Обработка кликов по клеткам
        elements.gameElements.board.addEventListener('click', function(e) {
            if (e.target.classList.contains('cell')) {
                handleCellClick(e);
            }
        });
    }

    // Управление отображением экранов
    function showScreen(screenName) {
        console.log(`Переключение на экран: ${screenName}`);
        
        // Скрыть все экраны
        Object.values(elements.screens).forEach(screen => {
            screen.classList.remove('active');
            screen.classList.add('hidden');
        });

        // Показать нужный экран
        switch(screenName) {
            case 'mainMenu':
                elements.screens.mainMenu.classList.add('active');
                elements.screens.mainMenu.classList.remove('hidden');
                resetGame();
                break;
            case 'soloMode':
                elements.screens.soloMode.classList.add('active');
                elements.screens.soloMode.classList.remove('hidden');
                break;
            case 'gameBoard':
                elements.screens.gameBoard.classList.add('active');
                elements.screens.gameBoard.classList.remove('hidden');
                break;
        }
    }

    // Начало игры
    function startGame(mode) {
        console.log(`Старт игры в режиме: ${mode}`);
        state.gameMode = mode;
        
        if (mode === 'solo') {
            showScreen('soloMode');
        } else {
            startDefensePhase();
        }
    }

    // Установка режима игры
    function setMode(mode) {
        console.log(`Выбран режим: ${mode}`);
        state.currentMode = mode;
        
        if (mode === 'attack') {
            createBoard();
            placeRandomMines();
            startAttackPhase();
        } else {
            startDefensePhase();
        }
    }

    // Фаза защиты
    function startDefensePhase() {
        console.log("Начало фазы защиты");
        state.isDefensePhase = true;
        showScreen('gameBoard');
        
        // Показать необходимые элементы
        elements.buttons.ready.classList.remove('hidden');
        elements.buttons.back.classList.remove('hidden');
        
        // Активировать все ряды
        document.querySelectorAll('.row').forEach(row => {
            row.classList.remove('hidden');
            row.style.pointerEvents = 'auto';
        });
        
        updateStatus("Расставьте мины (по 2 в каждом ряду)");
    }

    // Подтверждение расстановки мин
    function confirmMines() {
        console.log("Подтверждение расстановки мин");
        
        // Проверка правильности расстановки
        for (let i = 0; i < config.rows; i++) {
            const minesInRow = state.board[i].filter(cell => cell.isMine).length;
            if (minesInRow !== config.minesPerRow) {
                showNotification(`Ряд ${i+1}: нужно ${config.minesPerRow} мин!`);
                return;
            }
        }
        
        // Переход к фазе атаки
        hideMines();
        startAttackPhase();
    }

    // Фаза атаки
    function startAttackPhase() {
        console.log("Начало фазы атаки");
        state.isDefensePhase = false;
        elements.buttons.ready.classList.add('hidden');
        
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
            updateStatus("Начните с первого ряда!");
            elements.buttons.back.classList.remove('hidden');
        } else {
            updateStatus("Бот начинает атаку...");
            simulateAttacker();
        }
    }

    // Обработка кликов по клеткам
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

    // Клик в фазе защиты
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
            showNotification(`В ряду уже ${config.minesPerRow} мины!`);
            return;
        }

        state.board[row][col].isMine = true;
        cell.classList.add('mine');

        if (minesInRow + 1 === config.minesPerRow) {
            document.querySelectorAll('.row')[row].classList.add('completed');
        }
    }

    // Клик в фазе атаки
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

    // Имитация атаки бота
    function simulateAttacker() {
        console.log("Скрипт начинает атаку");
        state.isScriptAttacking = true;
        
        state.gameInterval = setInterval(() => {
            if (state.currentRow >= config.rows || state.playerHealth <= 0) {
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
                    updateStatus(`Бот наступил на мину! Здоровье: ${state.playerHealth}%`);
                } else {
                    // Бот выбрал безопасную клетку
                    cell.classList.add('revealed');
                    document.querySelectorAll('.row')[state.currentRow].classList.remove('active');
                    document.querySelectorAll('.row')[state.currentRow].classList.add('completed');
                    state.currentRow++;

                    if (state.currentRow < config.rows) {
                        document.querySelectorAll('.row')[state.currentRow].classList.remove('hidden');
                        document.querySelectorAll('.row')[state.currentRow].classList.add('active');
                        updateStatus(`Бот переходит к ряду ${state.currentRow + 1}`);
                    }
                }
            }
        }, config.attackDelay);
    }

    // Завершение игры
    function endGame(isWin) {
        console.log(`Игра завершена. Результат: ${isWin ? 'Победа' : 'Поражение'}`);
        clearGameInterval();
        
        elements.gameElements.gameOverTitle.textContent = isWin ? 'Победа!' : 'Поражение!';
        elements.gameElements.gameOverMenu.classList.remove('hidden');
    }

    // Вспомогательные функции
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

    function hideMines() {
        document.querySelectorAll('.mine').forEach(cell => {
            cell.classList.remove('mine');
        });
    }

    function clearGameInterval() {
        if (state.gameInterval) {
            clearInterval(state.gameInterval);
            state.gameInterval = null;
        }
    }

    function resetGame() {
        console.log("Сброс игры");
        clearGameInterval();
        
        state.playerHealth = config.initialHealth;
        state.currentRow = 0;
        state.isDefensePhase = true;
        state.currentMode = null;
        state.gameMode = null;
        state.isScriptAttacking = false;
        
        createBoard();
    }

    function updateStatus(text) {
        elements.gameElements.status.textContent = text;
    }

    function showNotification(message) {
        elements.gameElements.notification.textContent = message;
        elements.gameElements.notification.classList.remove('hidden');
        setTimeout(() => {
            elements.gameElements.notification.classList.add('hidden');
        }, 2000);
    }

    function closeGame() {
        console.log("Закрытие игры");
        clearGameInterval();
        // Здесь должна быть логика закрытия экрана
    }

    // Запуск игры
    init();
});
