// js/screens/darkwall.js

// Основная функция инициализации экрана Darkwall
function initDarkwall() {
    // Создаем контейнер для игрового интерфейса
    const gameContainer = document.createElement('div');
    gameContainer.id = 'darkwall-game-container';
    gameContainer.style.padding = '20px';
    gameContainer.style.height = '100%';
    gameContainer.style.overflowY = 'auto';
    
    // Добавляем контейнер в содержимое приложения
    const appContent = document.querySelector('#darkwall-screen .app-content');
    appContent.appendChild(gameContainer);
    
    // Инициализируем игру внутри контейнера
    initDarkwallGame();
    
    // Обработчик закрытия приложения
    document.querySelector('#darkwall-screen .close-btn').addEventListener('click', () => {
        // Восстанавливаем главный экран
        goBack();
    });
}

// Функция инициализации игрового интерфейса
function initDarkwallGame() {
    // Создаем HTML-структуру игры
    const gameHTML = `
        <div class="game-container">
            <div class="game-menu" id="main-menu">
                <h2>${getTranslation('darkwall_game')}</h2>
                <button class="game-btn" id="solo-btn">${getTranslation('solo_mode')}</button>
                <button class="game-btn" id="duo-btn">${getTranslation('duo_mode')}</button>
            </div>

            <div class="game-menu hidden" id="solo-mode">
                <h2>${getTranslation('choose_side')}</h2>
                <button class="game-btn" id="attack-btn">${getTranslation('attack')}</button>
                <button class="game-btn" id="defense-btn">${getTranslation('defense')}</button>
                <button class="game-btn" id="back-btn-menu">${getTranslation('back')}</button>
            </div>

            <div id="board"></div>
            <div class="game-status" id="status"></div>
            
            <div class="game-controls">
                <button id="ready-btn" class="game-btn hidden">${getTranslation('ready')}</button>
                <button id="back-btn" class="game-btn hidden">${getTranslation('back')}</button>
            </div>

            <div id="notification" class="game-notification hidden"></div>

            <div id="game-over-menu" class="game-over-menu hidden">
                <h2 id="game-over-title"></h2>
                <button class="game-btn" id="ok-btn">${getTranslation('ok')}</button>
            </div>
        </div>
    `;
    
    // Вставляем HTML в контейнер
    document.getElementById('darkwall-game-container').innerHTML = gameHTML;
    
    // Инициализируем игровую логику
    initGameLogic();
}

// Основной класс игры
class DarkwallGame {
    constructor() {
        this.rows = 7;
        this.cols = 4;
        this.minesPerRow = 2;
        this.board = [];
        this.currentMode = null;
        this.playerHealth = 100;
        this.currentRow = 0;
        this.isDefensePhase = true;
        this.gameMode = null;
        this.isScriptAttacking = false;
    }

    // Инициализация игры
    init() {
        this.createBoard();
        this.setupEventListeners();
    }

    // Создание игрового поля
    createBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        this.board = [];

        for (let i = 0; i < this.rows; i++) {
            const row = document.createElement('div');
            row.className = 'game-row hidden';
            this.board[i] = [];

            for (let j = 0; j < this.cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'game-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', (e) => this.handleCellClick(e));
                row.appendChild(cell);
                this.board[i][j] = { isMine: false, revealed: false };
            }
            boardElement.appendChild(row);
        }
    }

    // Обработка кликов по клеткам
    handleCellClick(e) {
        if (this.isScriptAttacking) return;

        const cell = e.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (this.isDefensePhase) {
            this.handleDefenseClick(row, col, cell);
        } else {
            this.handleAttackClick(row, col, cell);
        }
    }

    // Логика для фазы защиты
    handleDefenseClick(row, col, cell) {
        if (this.board[row][col].isMine) return;

        const minesInRow = this.board[row].filter(c => c.isMine).length;
        if (minesInRow >= this.minesPerRow) {
            this.showNotification(getTranslation('max_mines_reached', { count: this.minesPerRow }));
            return;
        }

        this.board[row][col].isMine = true;
        cell.classList.add('mine');

        if (minesInRow + 1 === this.minesPerRow) {
            document.querySelectorAll('.game-row')[row].classList.add('completed');
        }
    }

    // Логика для фазы атаки
    handleAttackClick(row, col, cell) {
        if (row !== this.currentRow || this.board[row][col].revealed) return;

        this.board[row][col].revealed = true;

        if (this.board[row][col].isMine) {
            cell.classList.add('mine');
            this.playerHealth -= 25;
            this.updateStatus(getTranslation('mine_hit', { health: this.playerHealth }));
            
            if (this.playerHealth <= 0) {
                this.endGame(false);
            }
        } else {
            cell.classList.add('revealed');
            const currentRowElement = document.querySelectorAll('.game-row')[this.currentRow];
            currentRowElement.classList.remove('active');
            currentRowElement.classList.add('completed');
            this.currentRow++;
            
            if (this.currentRow < this.rows) {
                const nextRowElement = document.querySelectorAll('.game-row')[this.currentRow];
                nextRowElement.classList.remove('hidden');
                nextRowElement.classList.add('active');
                this.updateStatus(getTranslation('progress_row', { row: this.currentRow + 1 }));
            } else {
                this.endGame(true);
            }
        }
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Кнопки режимов игры
        document.getElementById('solo-btn').addEventListener('click', () => this.startGame('solo'));
        document.getElementById('duo-btn').addEventListener('click', () => this.startGame('duo'));
        
        // Кнопки выбора стороны
        document.getElementById('attack-btn').addEventListener('click', () => this.setMode('attack'));
        document.getElementById('defense-btn').addEventListener('click', () => this.setMode('defense'));
        document.getElementById('back-btn-menu').addEventListener('click', this.showMainMenu.bind(this));
        
        // Игровые кнопки
        document.getElementById('ready-btn').addEventListener('click', this.confirmMines.bind(this));
        document.getElementById('back-btn').addEventListener('click', this.showMainMenu.bind(this));
        document.getElementById('ok-btn').addEventListener('click', this.showMainMenu.bind(this));
    }

    // Начало игры
    startGame(mode) {
        this.gameMode = mode;
        document.getElementById('main-menu').classList.add('hidden');

        if (mode === 'solo') {
            document.getElementById('solo-mode').classList.remove('hidden');
        } else {
            this.startDefensePhase();
        }
    }

    // Выбор режима
    setMode(mode) {
        this.currentMode = mode;
        document.getElementById('solo-mode').classList.add('hidden');
        document.getElementById('board').classList.remove('hidden');

        if (mode === 'attack') {
            this.createBoard();
            this.placeRandomMines();
            this.startAttackPhase();
        } else {
            this.startDefensePhase();
        }
    }

    // Расстановка мин (для ИИ)
    placeRandomMines() {
        for (let i = 0; i < this.rows; i++) {
            let placed = 0;
            while (placed < this.minesPerRow) {
                const col = Math.floor(Math.random() * this.cols);
                if (!this.board[i][col].isMine) {
                    this.board[i][col].isMine = true;
                    placed++;
                }
            }
        }
    }

    // Запуск фазы защиты
    startDefensePhase() {
        this.isDefensePhase = true;
        this.createBoard();
        document.getElementById('board').classList.remove('hidden');
        document.getElementById('ready-btn').classList.remove('hidden');
        document.getElementById('back-btn').classList.remove('hidden');
        
        document.querySelectorAll('.game-row').forEach(row => {
            row.classList.remove('hidden');
        });
        
        this.updateStatus(getTranslation('place_mines', { count: this.minesPerRow }));
    }

    // Подтверждение расстановки мин
    confirmMines() {
        for (let i = 0; i < this.rows; i++) {
            if (this.board[i].filter(c => c.isMine).length !== this.minesPerRow) {
                this.showNotification(getTranslation('row_not_complete', { row: i + 1 }));
                return;
            }
        }
        
        document.getElementById('back-btn').classList.add('hidden');
        this.hideMines();
        this.startAttackPhase();
    }

    // Скрытие мин после расстановки
    hideMines() {
        document.querySelectorAll('.mine').forEach(cell => {
            cell.classList.remove('mine');
        });
    }

    // Запуск фазы атаки
    startAttackPhase() {
        this.isDefensePhase = false;
        document.getElementById('ready-btn').classList.add('hidden');

        document.querySelectorAll('.game-row').forEach((row, index) => {
            if (index === 0) {
                row.classList.remove('hidden');
                row.classList.add('active');
            } else {
                row.classList.add('hidden');
            }
        });

        if (this.gameMode === 'duo' || this.currentMode === 'attack') {
            this.updateStatus(getTranslation('start_first_row'));
            document.getElementById('back-btn').classList.remove('hidden');
        } else if (this.currentMode === 'defense') {
            this.updateStatus(getTranslation('script_attacking'));
            this.simulateAttacker();
        }
    }

    // Симуляция атаки ИИ
    simulateAttacker() {
        this.isScriptAttacking = true;
        const interval = setInterval(() => {
            if (this.currentRow >= this.rows || this.playerHealth <= 0) {
                clearInterval(interval);
                this.isScriptAttacking = false;
                this.endGame(this.currentRow < this.rows);
                return;
            }

            const col = Math.floor(Math.random() * this.cols);
            const cell = document.querySelector(`.game-cell[data-row='${this.currentRow}'][data-col='${col}']`);

            if (!this.board[this.currentRow][col].revealed) {
                if (this.board[this.currentRow][col].isMine) {
                    cell.classList.add('mine', 'revealed');
                    this.playerHealth -= 25;
                    this.updateStatus(getTranslation('script_mine_hit', { health: this.playerHealth }));
                } else {
                    cell.classList.add('revealed');
                    const currentRowElement = document.querySelectorAll('.game-row')[this.currentRow];
                    currentRowElement.classList.remove('active');
                    currentRowElement.classList.add('completed');
                    this.currentRow++;

                    if (this.currentRow < this.rows) {
                        const nextRowElement = document.querySelectorAll('.game-row')[this.currentRow];
                        nextRowElement.classList.remove('hidden');
                        nextRowElement.classList.add('active');
                        this.updateStatus(getTranslation('script_next_row', { row: this.currentRow + 1 }));
                    }
                }
                this.board[this.currentRow][col].revealed = true;
            }
        }, 1000);
    }

    // Завершение игры
    endGame(isWin) {
        const gameOverMenu = document.getElementById('game-over-menu');
        const gameOverTitle = document.getElementById('game-over-title');
        gameOverTitle.textContent = isWin ? getTranslation('victory') : getTranslation('defeat');
        gameOverMenu.classList.remove('hidden');
    }

    // Обновление статуса
    updateStatus(text) {
        document.getElementById('status').textContent = text;
    }

    // Показ главного меню
    showMainMenu() {
        document.getElementById('main-menu').classList.remove('hidden');
        document.getElementById('solo-mode').classList.add('hidden');
        document.getElementById('back-btn').classList.add('hidden');
        document.getElementById('board').classList.add('hidden');
        document.getElementById('ready-btn').classList.add('hidden');
        document.getElementById('game-over-menu').classList.add('hidden');
        this.updateStatus("");
        this.resetGame();
    }

    // Сброс игры
    resetGame() {
        this.playerHealth = 100;
        this.currentRow = 0;
        this.isDefensePhase = true;
        this.currentMode = null;
        this.gameMode = null;
        this.isScriptAttacking = false;
        this.createBoard();
    }

    // Показать уведомление
    showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.remove('hidden');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 2000);
    }
}

// Вспомогательная функция для получения перевода
function getTranslation(key, params = {}) {
    const lang = currentSettings.language || 'ru';
    const translations = window.translations[lang] || window.translations.ru;
    let text = translations[key] || key;
    
    // Замена плейсхолдеров
    for (const [param, value] of Object.entries(params)) {
        text = text.replace(`{${param}}`, value);
    }
    
    return text;
}

// Инициализация игровой логики
function initGameLogic() {
    window.darkwallGame = new DarkwallGame();
    window.darkwallGame.init();
}
