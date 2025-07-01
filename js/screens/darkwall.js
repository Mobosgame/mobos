// js/screens/darkwall.js

function initDarkwall() {
    const gameContainer = document.getElementById('darkwall-game-container');
    if (!gameContainer) {
        const newContainer = document.createElement('div');
        newContainer.id = 'darkwall-game-container';
        document.querySelector('#darkwall-screen .app-content').appendChild(newContainer);
    }

    document.querySelector('#darkwall-screen .close-btn').addEventListener('click', () => {
        if (window.darkwallGame) {
            window.darkwallGame.destroy();
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
                <button class="game-btn" id="online-btn">Онлайн</button>
            </div>

            <div class="game-menu hidden" id="solo-mode">
                <h2 data-lang="choose_side">${getTranslation('choose_side')}</h2>
                <button class="game-btn" id="attack-btn" data-lang="attack">${getTranslation('attack')}</button>
                <button class="game-btn" id="defense-btn" data-lang="defense">${getTranslation('defense')}</button>
                <button class="game-btn" id="back-btn-menu">${getTranslation('back')}</button>
            </div>

            <div class="game-menu hidden" id="online-mode">
                <h2>Онлайн режим</h2>
                <button class="game-btn" id="online-attack-btn">⚔️ Атака</button>
                <button class="game-btn" id="online-defense-btn">🛡️ Защита</button>
                <button class="game-btn" id="online-back-btn">Назад</button>
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
        this.socket = null;
        this.role = null;
        this.opponent = null;
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
        if (this.isGameOver) return;
        
        const cell = e.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (this.gameMode === 'online') {
            this.sendToServer('player_move', { row, col });
            return;
        }

        if (this.isDefensePhase) {
            this.handleDefenseClick(row, col, cell);
        } else {
            this.handleAttackClick(row, col, cell);
        }
    }

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

        const rowElement = cell.closest('.game-row');
        const minesCount = this.board[row].filter(c => c.isMine).length;
        
        if (minesCount === this.minesPerRow) {
            rowElement.classList.add('completed');
        } else {
            rowElement.classList.remove('completed');
        }

        this.checkAllRowsComplete();
    }

    handleAttackClick(row, col, cell) {
        if (row !== this.currentRow || this.board[row][col].revealed || this.isGameOver) return;

        this.board[row][col].revealed = true;

        if (this.board[row][col].isMine) {
            cell.classList.add('mine-hit');
            this.playerHealth -= 25;
            this.updateStatus(getTranslation('mine_hit', { health: this.playerHealth }));
            
            if (this.playerHealth <= 0) {
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
                this.endGame(this.currentMode === 'attack');
                this.isGameOver = true;
            }
        }
    }

    setupEventListeners() {
        document.getElementById('solo-btn')?.addEventListener('click', () => this.startGame('solo'));
        document.getElementById('duo-btn')?.addEventListener('click', () => this.startGame('duo'));
        document.getElementById('online-btn')?.addEventListener('click', () => this.startOnlineGame());
        document.getElementById('attack-btn')?.addEventListener('click', () => this.setMode('attack'));
        document.getElementById('defense-btn')?.addEventListener('click', () => this.setMode('defense'));
        document.getElementById('ready-btn')?.addEventListener('click', () => this.confirmMines());
        document.getElementById('ok-btn')?.addEventListener('click', () => this.showMainMenu());
        document.getElementById('back-btn-menu')?.addEventListener('click', () => this.showMainMenu());
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

    startOnlineGame() {
        this.gameMode = 'online';
        this.connectToServer();
    }

    connectToServer() {
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        const userId = user?.id || `user_${Math.random().toString(36).substr(2, 9)}`;
        const username = user?.username || user?.first_name || 'Player';

        const socketUrl = window.location.hostname === 'localhost' 
            ? 'ws://localhost:8000' 
            : `wss://${window.location.host}`;
        
        this.socket = new WebSocket(`${socketUrl}/ws/${userId}`);

        this.socket.onopen = () => {
            this.updateStatus("Подключение к серверу...");
            this.socket.send(JSON.stringify({
                type: 'register',
                data: { username }
            }));
            this.showOnlineModeSelection();
        };

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleServerMessage(message);
        };

        this.socket.onclose = () => {
            if (!this.isGameOver) {
                this.showNotification("Соединение с сервером потеряно");
                this.showMainMenu();
            }
        };

        this.socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            this.showNotification("Ошибка соединения");
        };
    }

    handleServerMessage(message) {
        switch(message.type) {
            case 'game_start':
                this.handleGameStart(message.data);
                break;
            case 'game_update':
                this.updateGameState(message.data);
                break;
            case 'game_end':
                this.handleGameEnd(message.data);
                break;
            case 'error':
                this.showNotification(message.data.message);
                break;
            case 'waiting':
                this.updateStatus("Ожидаем соперника...");
                break;
        }
    }

    handleGameStart(data) {
        this.role = data.role;
        this.opponent = data.opponent;
        
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('online-mode')?.remove();

        if (this.role === 'defense') {
            this.startDefensePhase();
            this.updateStatus(`Игра началась! Соперник: ${this.opponent}`);
        } else {
            this.startAttackPhase();
            this.updateStatus(`Игра началась! Соперник: ${this.opponent}`);
        }
    }

    updateGameState(data) {
        this.playerHealth = data.player_health;
        this.currentRow = data.current_row;
        this.board = data.board;
        this.renderBoard();
        
        if (data.game_status === 'defense_setup') {
            this.isDefensePhase = true;
            this.updateStatus(`Осталось времени: ${data.time_left} сек`);
        } else if (data.game_status === 'attack_phase') {
            this.isDefensePhase = false;
            this.updateStatus(`Осталось времени: ${data.time_left} сек`);
        }
    }

    renderBoard() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = document.querySelector(`.game-cell[data-row="${i}"][data-col="${j}"]`);
                if (!cell) continue;

                cell.className = 'game-cell';
                if (this.board[i][j].isMine && this.isDefensePhase) {
                    cell.classList.add('mine');
                }
                if (this.board[i][j].revealed) {
                    cell.classList.add(this.board[i][j].isMine ? 'mine-hit' : 'revealed');
                }
            }
        }
    }

    showOnlineModeSelection() {
        const onlineModeHTML = `
            <div class="game-menu" id="online-mode">
                <h2>Онлайн режим</h2>
                <button class="game-btn" id="online-attack-btn">⚔️ Атака</button>
                <button class="game-btn" id="online-defense-btn">🛡️ Защита</button>
                <button class="game-btn" id="online-back-btn">Назад</button>
            </div>
        `;
        
        document.querySelector('.game-container').insertAdjacentHTML('beforeend', onlineModeHTML);
        document.getElementById('main-menu').classList.add('hidden');
        
        document.getElementById('online-attack-btn').addEventListener('click', () => {
            this.joinOnlineGame('attack');
        });
        
        document.getElementById('online-defense-btn').addEventListener('click', () => {
            this.joinOnlineGame('defense');
        });
        
        document.getElementById('online-back-btn').addEventListener('click', () => {
            document.getElementById('online-mode').remove();
            this.showMainMenu();
        });
    }

    joinOnlineGame(mode) {
        this.role = mode;
        document.getElementById('online-mode').remove();
        this.sendToServer('join_game', { mode });
        
        if (mode === 'defense') {
            this.startDefensePhase();
            this.updateStatus("Ожидаем атакующего...");
        } else {
            this.startAttackPhase();
            this.updateStatus("Ожидаем защитника...");
        }
    }

    sendToServer(type, data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type, data }));
        } else {
            this.showNotification("Нет соединения с сервером");
        }
    }

    // ... остальные методы (startDefensePhase, confirmMines, endGame и т.д.) ...

    destroy() {
        if (this.attackInterval) {
            clearInterval(this.attackInterval);
        }
        if (this.socket) {
            this.socket.close();
        }
    }
}

function getTranslation(key, params = {}) {
    try {
        const lang = window.currentSettings?.language || 'ru';
        const translations = window.translations[lang] || window.translations.ru || {};
        let text = translations[key] || key;

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
