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
    // Очищаем предыдущую игру если есть
    if (window.darkwallGame) {
        window.darkwallGame.destroy();
    }

    const gameHTML = `
        <div class="game-container">
            <div class="game-menu" id="main-menu">
                <h2 data-lang="darkwall_game">${getTranslation('darkwall_game')}</h2>
                <button class="game-btn" id="solo-btn" data-lang="solo_mode">${getTranslation('solo_mode')}</button>
                <button class="game-btn" id="duo-btn" data-lang="duo_mode">${getTranslation('duo_mode')}</button>
                <button class="game-btn" id="online-btn" data-lang="online_mode">Онлайн</button>
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
                <button id="ready-btn" class="game-btn hidden">${getTranslation('ready')}</button>
            </div>

            <div id="notification" class="game-notification hidden"></div>

            <div id="game-over-menu" class="game-over-menu hidden">
                <h2 id="game-over-title"></h2>
                <button class="game-btn" id="ok-btn">${getTranslation('ok')}</button>
            </div>
        </div>
    `;
    
    document.getElementById('darkwall-game-container').innerHTML = gameHTML;
    
    // Инициализируем игру сразу
    window.darkwallGame = new DarkwallGame();
    window.darkwallGame.init();
    
    // Показываем главное меню
    document.getElementById('main-menu').classList.remove('hidden');
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

    setupEventListeners() {
        // Используем делегирование событий для надежности
        document.querySelector('.game-container').addEventListener('click', (e) => {
            if (e.target.id === 'solo-btn') this.startGame('solo');
            else if (e.target.id === 'duo-btn') this.startGame('duo');
            else if (e.target.id === 'online-btn') this.startOnlineGame();
            else if (e.target.id === 'attack-btn') this.setMode('attack');
            else if (e.target.id === 'defense-btn') this.setMode('defense');
            else if (e.target.id === 'ready-btn') this.confirmMines();
            else if (e.target.id === 'ok-btn') this.showMainMenu();
            else if (e.target.id === 'back-btn-menu') this.showMainMenu();
            else if (e.target.id === 'online-attack-btn') this.joinOnlineGame('attack');
            else if (e.target.id === 'online-defense-btn') this.joinOnlineGame('defense');
            else if (e.target.id === 'online-back-btn') this.showMainMenu();
        });
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
        try {
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
                this.showNotification("Ошибка соединения. Попробуйте позже");
                this.showMainMenu();
            };
        } catch (e) {
            console.error("Connection error:", e);
            this.showNotification("Ошибка подключения");
            this.showMainMenu();
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
    }

   joinOnlineGame(mode) {
        this.role = mode;
        document.getElementById('online-mode').remove();
        
        if (mode === 'defense') {
            this.startDefensePhase();
            this.updateStatus("Ожидаем атакующего...");
        } else {
            this.startAttackPhase();
            this.updateStatus("Ожидаем защитника...");
        }
        
        // Временная заглушка - имитация начала игры
        setTimeout(() => {
            this.updateStatus("Игра началась! Соперник: Player123");
        }, 3000);
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
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

function initGameLogic() {
    window.darkwallGame = new DarkwallGame();
    window.darkwallGame.init();
}

// Инициализируем игру при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('darkwall-screen')) {
        initDarkwall();
    }
});
