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
            window.darkwallGame.showMainMenu();
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
        this.gameMode = null; // 'solo', 'duo', 'online'
        this.isScriptAttacking = false;
        this.isGameOver = false;
        this.attackInterval = null;
       
        this.websocket = null;
        this.gameId = null;
        this.role = null; // 'attack' или 'defense'
        this.opponentName = "Opponent";
    }
    async connectToServer() {
    try {
        const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'anonymous_' + Math.random().toString(36).substr(2, 9);
        const wsUrl = `ws://localhost:8000/ws/${userId}`;
        
        console.log("Connecting to:", wsUrl); // Добавьте лог
        
        this.websocket = new WebSocket(wsUrl);
        
        this.websocket.onopen = () => {
            console.log("WebSocket connected"); // Лог подключения
            this.updateStatus("Connected to server");
            this.registerPlayer();
        };
            
            this.websocket.onmessage = (event) => {
                this.handleServerMessage(JSON.parse(event.data));
            };
            
            this.websocket.onclose = () => {
                this.updateStatus("Disconnected from server");
                this.showNotification("Connection lost");
            };
            
            this.websocket.onerror = (error) => {
                console.error("WebSocket error:", error);
                this.showNotification("Connection error");
            };
            
        } catch (error) {
        console.error("Connection error:", error);
        this.showNotification(`Connection failed: ${error.message}`);
    }
    }

     registerPlayer() {
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        const message = {
            type: 'register',
            data: {
                username: user?.username || `User${Math.floor(Math.random() * 1000)}`,
                firstName: user?.first_name,
                lastName: user?.last_name
            }
        };
        this.websocket.send(JSON.stringify(message));
    }

    handleServerMessage(message) {
        switch (message.type) {
            case 'game_start':
                this.handleGameStart(message.data);
                break;
            case 'game_update':
                this.handleGameUpdate(message.data);
                break;
            case 'game_end':
                this.handleGameEnd(message.data);
                break;
            case 'error':
                this.showNotification(message.data.message);
                break;
        }
    }

    handleGameStart(data) {
        this.role = data.role;
        this.opponentName = data.opponent;
        this.gameId = data.gameId;
        
        if (this.role === 'defense') {
            this.startDefensePhase();
            this.updateStatus(`Game started! Opponent: ${this.opponentName}`);
        } else {
            this.startAttackPhase();
            this.updateStatus(`Game started! Opponent: ${this.opponentName}`);
        }
    }

    handleGameUpdate(data) {
        // Обновляем состояние игры на основе данных с сервера
        this.board = data.board;
        this.currentRow = data.currentRow;
        this.playerHealth = data.playerHealth;
        
        // Обновляем визуальное представление доски
        this.updateBoardView();
        
        // Обновляем статус
        if (data.game_status === 'defense_setup') {
            this.updateStatus(`Defense setup - ${data.time_left}s left`);
        } else {
            this.updateStatus(`Attack phase - ${data.time_left}s left`);
        }
    }

    handleGameEnd(data) {
        const isWin = (this.role === 'attack' && data.result === 'attack_wins') || 
                     (this.role === 'defense' && data.result === 'defense_wins');
        
        this.endGame(isWin);
    }

    sendMoveToServer(move) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            const message = {
                type: 'player_move',
                data: move
            };
            this.websocket.send(JSON.stringify(message));
        }
    }

    sendReadyToServer() {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            const message = {
                type: 'ready',
                data: {}
            };
            this.websocket.send(JSON.stringify(message));
        }
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
        if (this.isGameOver || (this.isScriptAttacking && this.gameMode !== 'online')) return;
        
        const cell = e.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (this.gameMode === 'online') {
            this.sendMoveToServer({ row, col });
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
            this.updateStatus("");
            document.getElementById('ready-btn').classList.remove('hidden');
        } else {
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
        const soloBtn = document.getElementById('solo-btn');
        const duoBtn = document.getElementById('duo-btn');
        const onlineBtn = document.getElementById('online-btn');
        const attackBtn = document.getElementById('attack-btn');
        const defenseBtn = document.getElementById('defense-btn');
        const readyBtn = document.getElementById('ready-btn');
        const okBtn = document.getElementById('ok-btn');
        const backBtnMenu = document.getElementById('back-btn-menu');
        
        if (soloBtn) soloBtn.addEventListener('click', () => this.startGame('solo'));
        if (duoBtn) duoBtn.addEventListener('click', () => this.startGame('duo'));
        if (onlineBtn) onlineBtn.addEventListener('click', () => this.startOnlineGame());
        if (attackBtn) attackBtn.addEventListener('click', () => this.setMode('attack'));
        if (defenseBtn) defenseBtn.addEventListener('click', () => this.setMode('defense'));
        if (readyBtn) readyBtn.addEventListener('click', this.confirmMines.bind(this));
        if (okBtn) okBtn.addEventListener('click', this.showMainMenu.bind(this));
        if (backBtnMenu) backBtnMenu.addEventListener('click', this.showMainMenu.bind(this));
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

   startOnlineGame() {
        this.gameMode = 'online';
        this.connectToServer();
        this.showOnlineWaitingScreen();
    }

    connectToBot() {
        // Временная заглушка - в реальном приложении здесь будет подключение к WebSocket
        console.log("Connecting to bot...");
        this.updateStatus("Подключение к серверу...");
        
        // Имитация подключения
        setTimeout(() => {
            this.showOnlineModeSelection();
        }, 1500);
    }

    showOnlineWaitingScreen() {
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) mainMenu.classList.add('hidden');
        
        this.updateStatus("Поиск соперника...");
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
    
    document.getElementById('darkwall-game-container').innerHTML = onlineModeHTML;
    
    document.getElementById('online-attack-btn').addEventListener('click', () => {
        this.joinOnlineGame('attack');
    });
    
    document.getElementById('online-defense-btn').addEventListener('click', () => {
        this.joinOnlineGame('defense');
    });
    
    document.getElementById('online-back-btn').addEventListener('click', () => {
        this.showMainMenu();
    });
}

        joinOnlineGame(mode) {
        this.role = mode;
        document.getElementById('online-mode').remove();
        
        const message = {
            type: 'join_game',
            data: { mode }
        };
        this.websocket.send(JSON.stringify(message));
        
        if (mode === 'defense') {
            this.startDefensePhase();
            this.updateStatus("Waiting for attacker...");
        } else {
            this.startAttackPhase();
            this.updateStatus("Waiting for defender...");
        }
    }

    sendMoveToServer(move) {
        console.log("Sending move to server:", move);
        // В реальном приложении здесь будет отправка данных через WebSocket
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

        if (this.gameMode === 'online' && this.role === 'defense') {
            this.sendReadyToServer();
        } else {
            this.startAttackPhase();
        }
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
        
        if (this.gameMode === 'online') {
            gameOverTitle.textContent = isWin 
                ? (this.role === 'attack' 
                    ? "Система взломана! Победа атаки!" 
                    : "Взлом предотвращен! Победа защиты!")
                : (this.role === 'attack' 
                    ? "Взлом предотвращен! Поражение атаки!" 
                    : "Система взломана! Поражение защиты!");
        } else if (this.gameMode === 'duo') {
            gameOverTitle.textContent = isWin 
                ? getTranslation('system_hacked_attack_wins') 
                : getTranslation('hack_prevented_defense_wins');
        } else {
            gameOverTitle.textContent = isWin 
                ? getTranslation('victory') 
                : getTranslation('defeat');
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
        const onlineMode = document.getElementById('online-mode');
        const boardElement = document.getElementById('board');
        const readyBtn = document.getElementById('ready-btn');
        const gameOverMenu = document.getElementById('game-over-menu');
        
        if (mainMenu) mainMenu.classList.remove('hidden');
        if (soloMode) soloMode.classList.add('hidden');
        if (onlineMode) onlineMode.remove();
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
        this.role = null;
        this.gameId = null;
        
        if (this.attackInterval) {
            clearInterval(this.attackInterval);
            this.attackInterval = null;
        }
        
        const boardElement = document.getElementById('board');
        if (boardElement) {
            boardElement.innerHTML = '';
            this.createBoard();
        }
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
        if (this.websocket) {
            this.websocket.close();
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
