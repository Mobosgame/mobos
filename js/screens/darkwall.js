// js/screens/darkwall.js

function initDarkwall() {
    const gameContainer = document.createElement('div');
    gameContainer.id = 'darkwall-game-container';
    document.querySelector('#darkwall-screen .app-content').appendChild(gameContainer);
    
    // Обработчик закрытия
    document.querySelector('#darkwall-screen .close-btn').addEventListener('click', () => {
        if (window.darkwallGame) {
            window.darkwallGame.showMainMenu();
            window.darkwallGame.destroy();
            delete window.darkwallGame;
        }
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
    
    // Явно показываем главное меню
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

        // Используем CSS Grid для адаптивного размещения
        const rowsContainer = document.createElement('div');
        rowsContainer.className = 'rows-container';
        boardElement.appendChild(rowsContainer);

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
            rowsContainer.appendChild(row);
        }
    }

    // ... остальные методы без изменений ...

    startAttackPhase() {
        this.isDefensePhase = false;
        this.isGameOver = false;
        this.playerHealth = 100;
        this.currentRow = 0;
        document.getElementById('ready-btn').classList.add('hidden');
        
        // Скрыть все ряды
        document.querySelectorAll('.game-row').forEach(row => {
            row.classList.remove('active', 'completed');
            row.classList.add('hidden');
        });
        
        // Показать первый ряд как активный
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

    showMainMenu() {
        document.getElementById('main-menu').classList.remove('hidden');
        document.getElementById('solo-mode').classList.add('hidden');
        document.getElementById('board').classList.add('hidden');
        document.getElementById('ready-btn').classList.add('hidden');
        document.getElementById('game-over-menu').classList.add('hidden');
        this.updateStatus("");
        this.resetGame();
    }

    destroy() {
        if (this.attackInterval) {
            clearInterval(this.attackInterval);
            this.attackInterval = null;
        }
    }
}

    resetGame() {
        this.playerHealth = 100;
        this.currentRow = 0;
        this.isDefensePhase = true;
        this.currentMode = null;
        this.gameMode = null;
        this.isScriptAttacking = false;
        this.isGameOver = false;
        this.createBoard();
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
