function initDarkwall() {
    // Обработчик закрытия
    document.querySelector('#darkwall-screen .close-btn').addEventListener('click', () => {
        goBack();
    });
}

// Константы игры
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

// Инициализация игры
function init() {
    createBoard();
    setupEventListeners();
    
    // Переключение тем
    document.getElementById('light-theme').addEventListener('click', () => {
        document.body.className = 'theme-light';
    });
    document.getElementById('dark-theme').addEventListener('click', () => {
        document.body.className = 'theme-dark';
    });
    
    // Активируем основной экран
    document.getElementById('darkwall-screen').classList.add('active');
}

// Создание игрового поля
function createBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
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
        boardElement.appendChild(row);
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Кнопки меню
    document.getElementById('solo-btn').addEventListener('click', () => startGame('solo'));
    document.getElementById('duo-btn').addEventListener('click', () => startGame('duo'));
    document.getElementById('attack-btn').addEventListener('click', () => setMode('attack'));
    document.getElementById('defense-btn').addEventListener('click', () => setMode('defense'));
    document.getElementById('back-btn').addEventListener('click', showMainMenu);
    document.getElementById('ready-btn').addEventListener('click', confirmMines);
    
    // Клики по клеткам
    document.getElementById('board').addEventListener('click', (e) => {
        if (!e.target.classList.contains('cell')) return;
        
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        
        if (isDefensePhase) {
            handleDefenseClick(row, col, e.target);
        } else {
            handleAttackClick(row, col, e.target);
        }
    });
}

// Основные функции игры
function startGame(mode) {
    gameMode = mode;
    document.getElementById('main-menu').classList.remove('active');
    
    if (mode === 'solo') {
        document.getElementById('solo-mode').classList.add('active');
    } else {
        startDefensePhase();
    }
}

function setMode(mode) {
    currentMode = mode;
    document.getElementById('solo-mode').classList.remove('active');
    
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
            updateStatus(`Ряд ${currentRow + 1}/${ROWS}`);
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
    document.getElementById('board').classList.remove('hidden');
    document.getElementById('ready-btn').classList.remove('hidden');
    
    document.querySelectorAll('.row').forEach(row => {
        row.classList.remove('hidden');
    });
    
    updateStatus("Расставьте мины (по 2 в ряд)");
}

function startAttackPhase() {
    isDefensePhase = false;
    document.getElementById('ready-btn').classList.add('hidden');
    
    document.querySelectorAll('.row').forEach((row, i) => {
        row.classList.toggle('hidden', i !== 0);
        row.classList.toggle('active', i === 0);
    });
    
    updateStatus("Начните с первого ряда");
}

function confirmMines() {
    document.getElementById('ready-btn').classList.add('hidden');
    document.querySelectorAll('.mine').forEach(c => c.classList.remove('mine'));
    startAttackPhase();
}

function endGame(isWin) {
    alert(isWin ? 'Победа!' : 'Поражение!');
    showMainMenu();
}

function showMainMenu() {
    document.getElementById('main-menu').classList.add('active');
    document.getElementById('solo-mode').classList.remove('active');
    document.getElementById('board').classList.add('hidden');
    resetGame();
}

function resetGame() {
    playerHealth = 100;
    currentRow = 0;
    isDefensePhase = true;
    createBoard();
}

function updateStatus(text) {
    document.getElementById('status').textContent = text;
}

// Запуск игры при загрузке
window.onload = init;

window.initDarkwall = initDarkwall;
window.showDarkwall = showDarkwall;
