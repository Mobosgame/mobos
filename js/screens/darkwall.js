function initDarkwall() {
    // Обработчик закрытия
    document.querySelector('#darkwall-screen .close-btn').addEventListener('click', () => {
        goBack();
    });
}

// Константы
const ROWS = 7;
const COLS = 4;
const MINES_PER_ROW = 2;
const HEALTH_LOSS = 25;

// Состояние игры
let board = [];
let currentMode = null;
let playerHealth = 100;
let currentRow = 0;
let isDefensePhase = true;
let gameMode = null;

// Элементы
const elements = {
    mainMenu: document.getElementById('main-menu'),
    soloMode: document.getElementById('solo-mode'),
    board: document.getElementById('board'),
    status: document.getElementById('status'),
    readyBtn: document.getElementById('ready-btn'),
    backBtn: document.getElementById('back-btn'),
    attackBtn: document.getElementById('attack-btn'),
    defenseBtn: document.getElementById('defense-btn'),
    soloBtn: document.getElementById('solo-btn'),
    duoBtn: document.getElementById('duo-btn')
};

// Инициализация
function init() {
    createBoard();
    setupEventListeners();
    
    // Переключатели темы
    document.getElementById('light-theme').addEventListener('click', () => {
        document.body.className = 'theme-light';
    });
    document.getElementById('dark-theme').addEventListener('click', () => {
        document.body.className = 'theme-dark';
    });
}

// Создание поля
function createBoard() {
    elements.board.innerHTML = '';
    board = [];
    
    for (let i = 0; i < ROWS; i++) {
        const row = document.createElement('div');
        row.className = 'row hidden';
        board[i] = [];
        
        for (let j = 0; j < COLS; j++) {
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

// Обработчики событий
function setupEventListeners() {
    // Кнопки меню
    elements.soloBtn.addEventListener('click', () => startGame('solo'));
    elements.duoBtn.addEventListener('click', () => startGame('duo'));
    elements.attackBtn.addEventListener('click', () => setMode('attack'));
    elements.defenseBtn.addEventListener('click', () => setMode('defense'));
    elements.backBtn.addEventListener('click', showMainMenu);
    elements.readyBtn.addEventListener('click', confirmMines);
    
    // Клики по клеткам
    elements.board.addEventListener('click', (e) => {
        if (!e.target.classList.contains('cell')) return;
        
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        
        if (isDefensePhase) handleDefenseClick(row, col, e.target);
        else handleAttackClick(row, col, e.target);
    });
}

// Логика игры
function startGame(mode) {
    gameMode = mode;
    elements.mainMenu.classList.remove('active');
    
    if (mode === 'solo') {
        elements.soloMode.classList.add('active');
    } else {
        startDefensePhase();
    }
}

function setMode(mode) {
    currentMode = mode;
    elements.soloMode.classList.remove('active');
    
    if (mode === 'attack') {
        placeRandomMines();
        startAttackPhase();
    } else {
        startDefensePhase();
    }
}

function handleDefenseClick(row, col, cell) {
    if (board[row][col].isMine) {
        board[row][col].isMine = false;
        cell.classList.remove('mine');
        return;
    }
    
    const minesInRow = board[row].filter(c => c.isMine).length;
    if (minesInRow >= MINES_PER_ROW) return;
    
    board[row][col].isMine = true;
    cell.classList.add('mine');
}

function handleAttackClick(row, col, cell) {
    if (row !== currentRow || board[row][col].revealed) return;
    
    board[row][col].revealed = true;
    
    if (board[row][col].isMine) {
        cell.classList.add('mine');
        playerHealth -= HEALTH_LOSS;
        updateStatus(`Мина! Здоровье: ${playerHealth}%`);
        if (playerHealth <= 0) endGame(false);
    } else {
        cell.classList.add('revealed');
        document.querySelectorAll('.row')[currentRow].classList.remove('active');
        document.querySelectorAll('.row')[currentRow].classList.add('completed');
        currentRow++;
        
        if (currentRow < ROWS) {
            document.querySelectorAll('.row')[currentRow].classList.remove('hidden');
            document.querySelectorAll('.row')[currentRow].classList.add('active');
        } else {
            endGame(true);
        }
    }
}

// Вспомогательные функции
function placeRandomMines() {
    for (let i = 0; i < ROWS; i++) {
        let placed = 0;
        while (placed < MINES_PER_ROW) {
            const col = Math.floor(Math.random() * COLS);
            if (!board[i][col].isMine) {
                board[i][col].isMine = true;
                placed++;
            }
        }
    }
}

function startDefensePhase() {
    isDefensePhase = true;
    elements.board.classList.remove('hidden');
    elements.readyBtn.classList.remove('hidden');
    
    document.querySelectorAll('.row').forEach(row => {
        row.classList.remove('hidden');
    });
}

function startAttackPhase() {
    isDefensePhase = false;
    elements.readyBtn.classList.add('hidden');
    
    document.querySelectorAll('.row').forEach((row, i) => {
        row.classList.toggle('hidden', i !== 0);
        row.classList.toggle('active', i === 0);
    });
}

function confirmMines() {
    elements.readyBtn.classList.add('hidden');
    document.querySelectorAll('.mine').forEach(c => c.classList.remove('mine'));
    startAttackPhase();
}

function endGame(isWin) {
    alert(isWin ? 'Победа!' : 'Поражение!');
    showMainMenu();
}

function showMainMenu() {
    elements.mainMenu.classList.add('active');
    elements.soloMode.classList.remove('active');
    elements.board.classList.add('hidden');
    resetGame();
}

function resetGame() {
    playerHealth = 100;
    currentRow = 0;
    isDefensePhase = true;
    createBoard();
}

function updateStatus(text) {
    elements.status.textContent = text;
}

// Запуск игры
init();

window.initDarkwall = initDarkwall;
window.showDarkwall = showDarkwall;
