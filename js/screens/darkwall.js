// js/screens/darkwall.js

function initDarkwall() {
    const gameContainer = document.createElement('div');
    gameContainer.id = 'darkwall-game-container';
    document.querySelector('#darkwall-screen .app-content').appendChild(gameContainer);
    
    // Обработчик закрытия
    document.querySelector('#darkwall-screen .close-btn').addEventListener('click', () => {
          window.darkwallGame.resetGame();
          window.darkwallGame.showMainMenu();
            window.darkwallGame.destroy();
            delete window.darkwallGame;
        
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

            <div id="board" class="hidden"></div>
            <div class="game-status" id="status"></div>
            
            <div class="game-controls">
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
    boardElement.innerHTML = '';
    this.board = [];

    // Рассчитываем размер клеток динамически
    const boardWidth = boardElement.offsetWidth;
    const cellSize = Math.min(
        Math.floor((boardWidth - 32) / this.cols), // 32px - отступы и gap
        60 // Максимальный размер
    );

    for (let i = 0; i < this.rows; i++) {
        const row = document.createElement('div');
        row.className = 'game-row hidden';
        row.dataset.row = i;
        row.style.height = `${cellSize}px`; // Фиксированная высота ряда
        this.board[i] = [];

        for (let j = 0; j < this.cols; j++) {
            const cell = document.createElement('div');
            cell.className = 'game-cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.style.width = `${cellSize}px`; // Фиксированная ширина
            cell.style.height = `${cellSize}px`; // Фиксированная высота
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
            const rowElement = cell.closest('.game-row');
            rowElement.classList.add('completed');
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
                this.endGame(false);
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
                this.endGame(true);
                this.isGameOver = true;
            }
        }
    }

    setupEventListeners() {
        document.getElementById('solo-btn').addEventListener('click', () => this.startGame('solo'));
        document.getElementById('duo-btn').addEventListener('click', () => this.startGame('duo'));
        
        document.getElementById('attack-btn').addEventListener('click', () => this.setMode('attack'));
        document.getElementById('defense-btn').addEventListener('click', () => this.setMode('defense'));
        
        document.getElementById('ready-btn').addEventListener('click', this.confirmMines.bind(this));
        document.getElementById('ok-btn').addEventListener('click', this.showMainMenu.bind(this));
    }

    startGame(mode) {
        this.gameMode = mode;
        document.getElementById('main-menu').classList.add('hidden');

        if (mode === 'solo') {
            document.getElementById('solo-mode').classList.remove('hidden');
        } else {
            this.startDefensePhase();
        }
    }

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
        document.getElementById('board').classList.remove('hidden');
        document.getElementById('ready-btn').classList.remove('hidden');
        
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
        document.getElementById('ready-btn').classList.add('hidden');
        
        document.querySelectorAll('.game-row').forEach(row => {
            row.classList.remove('active', 'completed');
            row.classList.add('hidden');
        });
        
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
                    this.endGame(this.currentRow >= this.rows);
                    this.isGameOver = true;
                }
                return;
            }

            const col = Math.floor(Math.random() * this.cols);
            const cell = document.querySelector(`.game-cell[data-row='${this.currentRow}'][data-col='${col}']`);

            if (!this.board[this.currentRow][col].revealed) {
                this.board[this.currentRow][col].revealed = true;
                
                if (this.board[this.currentRow][col].isMine) {
                    cell.classList.add('mine-hit');
                    this.playerHealth -= 25;
                    this.updateStatus(getTranslation('script_mine_hit', { health: this.playerHealth }));
                    
                    if (this.playerHealth <= 0) {
                        this.endGame(false);
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
                        this.updateStatus(getTranslation('script_next_row', { row: this.currentRow + 1 }));
                    } else {
                        this.endGame(true);
                        this.isGameOver = true;
                    }
                }
            }
        }, 1000);
    }

    endGame(isWin) {
        const gameOverMenu = document.getElementById('game-over-menu');
        const gameOverTitle = document.getElementById('game-over-title');
        gameOverTitle.textContent = isWin ? getTranslation('victory') : getTranslation('defeat');
        gameOverMenu.classList.remove('hidden');
    }

    updateStatus(text) {
        document.getElementById('status').textContent = text;
    }

    showMainMenu() {
        document.getElementById('main-menu').classList.remove('hidden');
        document.getElementById('solo-mode').classList.add('hidden');
        document.getElementById('board').classList.add('hidden');
        document.getElementById('ready-btn').classList.add('hidden');
        document.getElementById('game-over-menu').classList.add('hidden');
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
        
        document.getElementById('board').innerHTML = '';
        this.createBoard();
        
        document.querySelectorAll('.game-menu').forEach(menu => {
            menu.classList.add('hidden');
        });
        document.getElementById('main-menu').classList.remove('hidden');
        document.getElementById('ready-btn').classList.add('hidden');
        document.getElementById('game-over-menu').classList.add('hidden');
        this.updateStatus("");
    }

    showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.remove('hidden');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 2000);
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
    const lang = currentSettings.language || 'ru';
    const translations = window.translations[lang] || window.translations.ru;
    let text = translations[key] || key;
    
    for (const [param, value] of Object.entries(params)) {
        text = text.replace(`{${param}}`, value);
    }
    
    return text;
}

function initGameLogic() {
    window.darkwallGame = new DarkwallGame();
    window.darkwallGame.init();
}
