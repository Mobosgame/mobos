// js/screens/darkwall.js

function initDarkwall() {
    const gameContainer = document.getElementById('darkwall-game-container');
    if (!gameContainer) {
        const newContainer = document.createElement('div');
        newContainer.id = 'darkwall-game-container';
        document.querySelector('#darkwall-screen .app-content').appendChild(newContainer);
    }

    document.querySelector('#darkwall-screen .close-btn').addEventListener('click', () => {
        // Только сбрасываем игру без влияния на другие экраны
        if (window.darkwallGame) {
            window.darkwallGame.showMainMenu();
        }
        // Просто закрываем окно без дополнительных действий
        goBack();
    });

    initDarkwallGame();
}

function initDarkwallGame() {
    const gameHTML = `
        <div class="game-container">
            <div class="game-menu" id="main-menu">
                <h2 data-lang="darkwall_game">${getTranslation('darkwall_game')}</h2>
                <button class="game-btn" id="solo-btn" data-lang="solo_mode">${getTranslation('solo_mode')}</button>
                <button class="game-btn" id="duo-btn" data-lang="duo_mode">${getTranslation('duo_mode')}</button>
            </div>

            <div class="game-menu hidden" id="solo-mode">
                <h2 data-lang="choose_side">${getTranslation('choose_side')}</h2>
                <button class="game-btn" id="attack-btn" data-lang="attack">${getTranslation('attack')}</button>
                <button class="game-btn" id="defense-btn" data-lang="defense">${getTranslation('defense')}</button>
            </div>

            <div id="board"></div>
            
            <div class="game-info-bar">
                <div class="game-status" id="status"></div>
                <button id="ready-btn" class="game-btn hidden" data-lang="ready">${getTranslation('ready')}</button>
            </div>

            <div id="notification" class="game-notification hidden"></div>

            <div id="game-over-menu" class="game-over-menu hidden">
                <h2 id="game-over-title"></h2>
                <button class="game-btn" id="ok-btn" data-lang="ok">${getTranslation('ok')}</button>
            </div>
        </div>
    `;
    
    document.getElementById('darkwall-game-container').innerHTML = gameHTML;
    document.getElementById('main-menu').classList.remove('hidden');
    
    // Инициализируем игровую логику
    initGameLogic();
}

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
        this.isGameOver = false;
        this.attackInterval = null;
    }

    init() {
        this.createBoard();
        this.setupEventListeners();
        this.applyLanguage();
    }

    createBoard() {
        const boardElement = document.getElementById('board');
        if (!boardElement) return;
        
        boardElement.innerHTML = '';
        this.board = [];

        for (let i = 0; i < this.rows; i++) {
            const row = document.createElement('div');
            row.className = 'game-row hidden';
            row.dataset.row = i;
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

    handleCellClick(e) {
        if (this.isGameOver || this.isScriptAttacking) return;
        
        const cell = e.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (this.isDefensePhase) {
            this.handleDefenseClick(row, col, cell);
        } else {
            this.handleAttackClick(row, col, cell);
        }
    }

    // В методе handleDefenseClick класса DarkwallGame
handleDefenseClick(row, col, cell) {
    if (this.board[row][col].isMine) {
        this.board[row][col].isMine = false;
        cell.classList.remove('mine');
    } else {
        const minesInRow = this.board[row].filter(c => c.isMine).length;
        if (minesInRow >= this.minesPerRow) {
            this.showNotification(getTranslation('max_mines_reached', { count: this.minesPerRow }));
            return;
        }

        this.board[row][col].isMine = true;
        cell.classList.add('mine');
    }

    // Проверяем завершенность ряда
    const rowElement = cell.closest('.game-row');
    const minesCount = this.board[row].filter(c => c.isMine).length;
    
    if (minesCount === this.minesPerRow) {
        rowElement.classList.add('completed'); // Затемняем ряд как в атаке
    } else {
        rowElement.classList.remove('completed');
    }

    this.checkAllRowsComplete();
}
    
    checkAllRowsComplete() {
        let allComplete = true;
        for (let i = 0; i < this.rows; i++) {
            const minesCount = this.board[i].filter(cell => cell.isMine).length;
            if (minesCount < this.minesPerRow) {
                allComplete = false;
                break;
            }
        }
        
        if (allComplete) {
            // Все ряды заполнены - показываем кнопку "Готово"
            this.updateStatus("");
            document.getElementById('ready-btn').classList.remove('hidden');
        } else {
            // Не все ряды заполнены - показываем инструкцию
            this.updateStatus(getTranslation('place_mines', { count: this.minesPerRow }));
            document.getElementById('ready-btn').classList.add('hidden');
        }
    }

  handleAttackClick(row, col, cell) {
    if (row !== this.currentRow || this.board[row][col].revealed || this.isGameOver) return;

    this.board[row][col].revealed = true;

    if (this.board[row][col].isMine) {
        cell.classList.add('mine-hit');
        this.playerHealth -= 25;
        this.updateStatus(getTranslation('mine_hit', { health: this.playerHealth }));
        
        if (this.playerHealth <= 0) {
            // Для атаки - поражение, для защиты - победа
            this.endGame(this.currentMode === 'defense');
            this.isGameOver = true;
        }
    } else {
        cell.classList.add('revealed');
        const currentRowElement = document.querySelector(`.game-row[data-row="${this.currentRow}"]`);
        currentRowElement.classList.remove('active');
        currentRowElement.classList.add('completed');
        
        this.currentRow++;
        
        if (this.currentRow < this.rows) {
            const nextRowElement = document.querySelector(`.game-row[data-row="${this.currentRow}"]`);
            nextRowElement.classList.remove('hidden');
            nextRowElement.classList.add('active');
            this.updateStatus(getTranslation('progress_row', { row: this.currentRow + 1 }));
        } else {
            // Для атаки - победа, для защиты - поражение
            this.endGame(this.currentMode === 'attack');
            this.isGameOver = true;
        }
    }
}


    setupEventListeners() {
        const soloBtn = document.getElementById('solo-btn');
        const duoBtn = document.getElementById('duo-btn');
        const attackBtn = document.getElementById('attack-btn');
        const defenseBtn = document.getElementById('defense-btn');
        const readyBtn = document.getElementById('ready-btn');
        const okBtn = document.getElementById('ok-btn');
        
        if (soloBtn) soloBtn.addEventListener('click', () => this.startGame('solo'));
        if (duoBtn) duoBtn.addEventListener('click', () => this.startGame('duo'));
        if (attackBtn) attackBtn.addEventListener('click', () => this.setMode('attack'));
        if (defenseBtn) defenseBtn.addEventListener('click', () => this.setMode('defense'));
        if (readyBtn) readyBtn.addEventListener('click', this.confirmMines.bind(this));
        if (okBtn) okBtn.addEventListener('click', this.showMainMenu.bind(this));
    }

    startGame(mode) {
        this.gameMode = mode;
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) mainMenu.classList.add('hidden');

        if (mode === 'solo') {
            const soloMode = document.getElementById('solo-mode');
            if (soloMode) soloMode.classList.remove('hidden');
        } else {
            this.startDefensePhase();
        }
    }

    setMode(mode) {
        this.currentMode = mode;
        const soloMode = document.getElementById('solo-mode');
        if (soloMode) soloMode.classList.add('hidden');
        
        const boardElement = document.getElementById('board');
        if (boardElement) boardElement.classList.remove('hidden');

        if (mode === 'attack') {
            this.createBoard();
            this.placeRandomMines();
            this.startAttackPhase();
        } else {
            this.startDefensePhase();
        }
    }

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

    startDefensePhase() {
        this.isDefensePhase = true;
        this.isGameOver = false;
        this.createBoard();
        
        const boardElement = document.getElementById('board');
        if (boardElement) boardElement.classList.remove('hidden');
        
        const readyBtn = document.getElementById('ready-btn');
        if (readyBtn) readyBtn.classList.add('hidden');
        
        // Показываем все ряды для расстановки
        document.querySelectorAll('.game-row').forEach(row => {
            row.classList.remove('hidden');
        });
        
        this.updateStatus(getTranslation('place_mines', { count: this.minesPerRow }));
    }

    confirmMines() {
        for (let i = 0; i < this.rows; i++) {
            if (this.board[i].filter(c => c.isMine).length !== this.minesPerRow) {
                this.showNotification(getTranslation('row_not_complete', { row: i + 1 }));
                return;
            }
        }
        
        this.hideMines();
        this.startAttackPhase();
    }

    hideMines() {
        document.querySelectorAll('.mine').forEach(cell => {
            cell.classList.remove('mine');
        });
    }

    startAttackPhase() {
        this.isDefensePhase = false;
        this.isGameOver = false;
        this.playerHealth = 100;
        this.currentRow = 0;
        
        const readyBtn = document.getElementById('ready-btn');
        if (readyBtn) readyBtn.classList.add('hidden');
        
        // Скрываем все ряды
        document.querySelectorAll('.game-row').forEach(row => {
            row.classList.remove('active', 'completed');
            row.classList.add('hidden');
        });
        
        // Показываем только первый ряд
        const firstRow = document.querySelector('.game-row[data-row="0"]');
        if (firstRow) {
            firstRow.classList.remove('hidden');
            firstRow.classList.add('active');
        }
        
        if (this.gameMode === 'duo' || this.currentMode === 'attack') {
            this.updateStatus(getTranslation('start_first_row'));
        } else if (this.currentMode === 'defense') {
            this.updateStatus(getTranslation('script_attacking'));
            this.simulateAttacker();
        }
    }

  simulateAttacker() {
    this.isScriptAttacking = true;
    this.attackInterval = setInterval(() => {
        if (this.isGameOver || this.currentRow >= this.rows || this.playerHealth <= 0) {
            clearInterval(this.attackInterval);
            this.isScriptAttacking = false;
            if (!this.isGameOver) {
                // Для защиты: health=0 - победа, rows passed - поражение
                const result = this.currentMode === 'defense' 
                    ? this.playerHealth <= 0 
                    : this.currentRow >= this.rows;
                this.endGame(result);
                this.isGameOver = true;
            }
            return;
        }

        const col = Math.floor(Math.random() * this.cols);
        const cell = document.querySelector(`.game-cell[data-row='${this.currentRow}'][data-col='${col}']`);

        if (!this.board[this.currentRow][col].revealed) {
            this.board[this.currentRow][col].revealed = true;
            
            if (this.board[this.currentRow][col].isMine) {
                if (cell) cell.classList.add('mine-hit');
                this.playerHealth -= 25;
                this.updateStatus(getTranslation('script_mine_hit', { health: this.playerHealth }));
                
                if (this.playerHealth <= 0) {
                    this.endGame(this.currentMode === 'defense');
                    this.isGameOver = true;
                }
            } else {
                if (cell) cell.classList.add('revealed');
                const currentRowElement = document.querySelector(`.game-row[data-row="${this.currentRow}"]`);
                if (currentRowElement) {
                    currentRowElement.classList.remove('active');
                    currentRowElement.classList.add('completed');
                }
                
                this.currentRow++;
                
                if (this.currentRow < this.rows) {
                    const nextRowElement = document.querySelector(`.game-row[data-row="${this.currentRow}"]`);
                    if (nextRowElement) {
                        nextRowElement.classList.remove('hidden');
                        nextRowElement.classList.add('active');
                    }
                    this.updateStatus(getTranslation('script_next_row', { row: this.currentRow + 1 }));
                } else {
                    this.endGame(this.currentMode === 'attack');
                    this.isGameOver = true;
                }
            }
        }
    }, 1000);
}
   endGame(isWin) {
    const gameOverMenu = document.getElementById('game-over-menu');
    const gameOverTitle = document.getElementById('game-over-title');
    
    if (!gameOverMenu || !gameOverTitle) return;
    
    // Определяем сообщение в зависимости от режима
    if (this.gameMode === 'duo') {
        gameOverTitle.textContent = isWin 
            ? getTranslation('system_hacked_attack_wins') 
            : getTranslation('hack_prevented_defense_wins');
    } else {
        if (this.currentMode === 'attack') {
            gameOverTitle.textContent = isWin 
                ? getTranslation('victory') 
                : getTranslation('defeat');
        } else { // defense
            gameOverTitle.textContent = isWin 
                ? getTranslation('victory') 
                : getTranslation('defeat');
        }
    }
    
    gameOverMenu.classList.remove('hidden');
}

    updateStatus(text) {
        const statusElement = document.getElementById('status');
        if (statusElement) statusElement.textContent = text;
    }

    showMainMenu() {
        const mainMenu = document.getElementById('main-menu');
        const soloMode = document.getElementById('solo-mode');
        const boardElement = document.getElementById('board');
        const readyBtn = document.getElementById('ready-btn');
        const gameOverMenu = document.getElementById('game-over-menu');
        
        if (mainMenu) mainMenu.classList.remove('hidden');
        if (soloMode) soloMode.classList.add('hidden');
        if (boardElement) boardElement.classList.add('hidden');
        if (readyBtn) readyBtn.classList.add('hidden');
        if (gameOverMenu) gameOverMenu.classList.add('hidden');
        
        this.updateStatus("");
        this.resetGame();
    }

    resetGame() {
        this.playerHealth = 100;
        this.currentRow = 0;
        this.isDefensePhase = true;
        this.currentMode = null;
        this.gameMode = null;
        this.isScriptAttacking = false;
        this.isGameOver = false;
        
        if (this.attackInterval) {
            clearInterval(this.attackInterval);
            this.attackInterval = null;
        }
        
        const boardElement = document.getElementById('board');
        if (boardElement) {
            boardElement.innerHTML = '';
            this.createBoard();
        }
        
        const mainMenu = document.getElementById('main-menu');
        const soloMode = document.getElementById('solo-mode');
        const readyBtn = document.getElementById('ready-btn');
        const gameOverMenu = document.getElementById('game-over-menu');
        
        if (mainMenu) mainMenu.classList.remove('hidden');
        if (soloMode) soloMode.classList.add('hidden');
        if (readyBtn) readyBtn.classList.add('hidden');
        if (gameOverMenu) gameOverMenu.classList.add('hidden');
        
        this.updateStatus("");
    }

    showNotification(message) {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.classList.remove('hidden');
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 2000);
        }
    }
    
    applyLanguage() {
        document.querySelectorAll('[data-lang]').forEach(el => {
            const key = el.getAttribute('data-lang');
            el.textContent = getTranslation(key);
        });
    }

    destroy() {
        if (this.attackInterval) {
            clearInterval(this.attackInterval);
            this.attackInterval = null;
        }
    }
}

function getTranslation(key, params = {}) {
    try {
        const lang = window.currentSettings?.language || 'ru';
        const translations = window.translations[lang] || window.translations.ru || {};
        let text = translations[key] || key;

        // Заменяем плейсхолдеры
        if (params) {
            for (const [param, value] of Object.entries(params)) {
                text = text.replace(`{${param}}`, value);
            }
        }

        return text;
    } catch (e) {
        console.error(`Translation error for key "${key}":`, e);
        return key;
    }
}

function initGameLogic() {
    window.darkwallGame = new DarkwallGame();
    window.darkwallGame.init();
}
