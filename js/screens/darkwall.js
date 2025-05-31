// darkwall.js
function initDarkwall() {
    // Обработчик закрытия
    document.querySelector('#darkwall-screen .close-btn').addEventListener('click', () => {
        resetGame();
        goBack();
    });
}
const rows = 7;
        const cols = 4;
        const minesPerRow = 2;
        let board = [];
        let currentMode = null;
        let playerHealth = 100;
        let currentRow = 0;
        let isDefensePhase = true;
        let gameMode = null;
        let isScriptAttacking = false; // Флаг для отслеживания атаки скрипта

        function createBoard() {
            const boardElement = document.getElementById('board');
            boardElement.innerHTML = '';
            board = [];

            for (let i = 0; i < rows; i++) {
                const row = document.createElement('div');
                row.className = 'row hidden';
                board[i] = [];

                for (let j = 0; j < cols; j++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.dataset.row = i;
                    cell.dataset.col = j;
                    cell.addEventListener('click', handleCellClick);
                    row.appendChild(cell);
                    board[i][j] = { isMine: false, revealed: false };
                }
                boardElement.appendChild(row);
            }
        }

        function handleCellClick(e) {
            if (isScriptAttacking) return; // Блокировка кликов во время атаки скрипта

            const cell = e.target;
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);

            if (isDefensePhase) {
                handleDefenseClick(row, col, cell);
            } else {
                handleAttackClick(row, col, cell);
            }
        }

        function handleDefenseClick(row, col, cell) {
            if (board[row][col].isMine) return;

            const minesInRow = board[row].filter(c => c.isMine).length;
            if (minesInRow >= minesPerRow) {
                showNotification(`В этом ряду уже ${minesPerRow} мины!`);
                return;
            }

            board[row][col].isMine = true;
            cell.classList.add('mine');

            if (minesInRow + 1 === minesPerRow) {
                document.querySelectorAll('.row')[row].classList.add('completed');
            }
        }

        function handleAttackClick(row, col, cell) {
            if (row !== currentRow || board[row][col].revealed) return;

            board[row][col].revealed = true;

            if (board[row][col].isMine) {
                cell.classList.add('mine');
                playerHealth -= 25;
                updateStatus(`Мина! Здоровье: ${playerHealth}%`);
                if (playerHealth <= 0) {
                    endGame(false);
                }
            } else {
                cell.classList.add('revealed');
                document.querySelectorAll('.row')[currentRow].classList.remove('active');
                document.querySelectorAll('.row')[currentRow].classList.add('completed');
                currentRow++;

                if (currentRow < rows) {
                    document.querySelectorAll('.row')[currentRow].classList.remove('hidden');
                    document.querySelectorAll('.row')[currentRow].classList.add('active');
                    updateStatus(`Прогресс: ряд ${currentRow + 1}`);
                } else {
                    endGame(true);
                }
            }
        }

        function startGame(mode) {
            gameMode = mode;
            document.getElementById('main-menu').classList.add('hidden');

            if (mode === 'solo') {
                document.getElementById('solo-mode').classList.remove('hidden');
            } else {
                startDefensePhase();
            }
        }

        function setMode(mode) {
            currentMode = mode;
            document.getElementById('solo-mode').classList.add('hidden');
            document.getElementById('board').classList.remove('hidden');

            if (mode === 'attack') {
                createBoard();
                placeRandomMines();
                startAttackPhase();
            } else {
                startDefensePhase();
            }
        }

        function placeRandomMines() {
            for (let i = 0; i < rows; i++) {
                let placed = 0;
                while (placed < minesPerRow) {
                    const col = Math.floor(Math.random() * cols);
                    if (!board[i][col].isMine) {
                        board[i][col].isMine = true;
                        placed++;
                    }
                }
            }
        }

        function startDefensePhase() {
            isDefensePhase = true;
            createBoard();
            document.getElementById('board').classList.remove('hidden');
            document.getElementById('ready-btn').classList.remove('hidden');
            document.getElementById('back-btn').classList.remove('hidden');
            document.querySelectorAll('.row').forEach(row => {
                row.classList.remove('hidden');
                row.style.pointerEvents = 'auto';
            });
            updateStatus("Расставьте мины (по 2 в каждом ряду)");
        }

        function confirmMines() {
            for (let i = 0; i < rows; i++) {
                if (board[i].filter(c => c.isMine).length !== minesPerRow) {
                    showNotification(`Ряд ${i + 1} не полностью заполнен!`);
                    return;
                }
            }
            document.getElementById('back-btn').classList.add('hidden');
            hideMines();
            startAttackPhase();
        }

        function hideMines() {
            document.querySelectorAll('.mine').forEach(cell => {
                cell.classList.remove('mine');
            });
        }

        function startAttackPhase() {
            isDefensePhase = false;
            document.getElementById('ready-btn').classList.add('hidden');

            document.querySelectorAll('.row').forEach((row, index) => {
                if (index === 0) {
                    row.classList.remove('hidden');
                    row.classList.add('active');
                } else {
                    row.classList.add('hidden');
                }
            });

            if (gameMode === 'duo' || currentMode === 'attack') {
                updateStatus("Начните с первого ряда!");
                document.getElementById('back-btn').classList.remove('hidden');
            } else if (currentMode === 'defense') {
                updateStatus("Скрипт начинает атаку...");
                simulateAttacker();
            }
        }

        function simulateAttacker() {
            isScriptAttacking = true; // Блокировка кликов
            const interval = setInterval(() => {
                if (currentRow >= rows || playerHealth <= 0) {
                    clearInterval(interval);
                    isScriptAttacking = false; // Разблокировка кликов
                    endGame(currentRow < rows);
                    return;
                }

                const col = Math.floor(Math.random() * cols);
                const cell = document.querySelector(`.cell[data-row='${currentRow}'][data-col='${col}']`);

                if (!board[currentRow][col].revealed) {
                    if (board[currentRow][col].isMine) {
                        cell.classList.add('mine', 'revealed');
                        playerHealth -= 25;
                        updateStatus(`Скрипт наступил на мину! Здоровье: ${playerHealth}%`);
                    } else {
                        cell.classList.add('revealed');
                        document.querySelectorAll('.row')[currentRow].classList.remove('active');
                        document.querySelectorAll('.row')[currentRow].classList.add('completed');
                        currentRow++;

                        if (currentRow < rows) {
                            document.querySelectorAll('.row')[currentRow].classList.remove('hidden');
                            document.querySelectorAll('.row')[currentRow].classList.add('active');
                            updateStatus(`Скрипт переходит к ряду ${currentRow + 1}`);
                        }
                    }
                    board[currentRow][col].revealed = true;
                }
            }, 1000);
        }

        function endGame(isWin) {
            const gameOverMenu = document.getElementById('game-over-menu');
            const gameOverTitle = document.getElementById('game-over-title');
            gameOverTitle.textContent = isWin ? 'Победа!' : 'Поражение!';
            gameOverMenu.classList.remove('hidden');
        }

        function updateStatus(text) {
            document.getElementById('status').textContent = text;
        }

        function showMainMenu() {
            document.getElementById('main-menu').classList.remove('hidden');
            document.getElementById('solo-mode').classList.add('hidden');
            document.getElementById('back-btn').classList.add('hidden');
            document.getElementById('board').classList.add('hidden');
            document.getElementById('ready-btn').classList.add('hidden');
            document.getElementById('game-over-menu').classList.add('hidden');
            updateStatus("");
            resetGame();
        }

        function resetGame() {
            playerHealth = 100;
            currentRow = 0;
            isDefensePhase = true;
            currentMode = null;
            gameMode = null;
            isScriptAttacking = false; // Сброс флага
            createBoard();
        }

        function showNotification(message) {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.classList.remove('hidden');
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 2000);
        }

        createBoard();
function showDarkwall() {
    resetGame();
    // Дополнительные действия при показе
}

window.initDarkwall = initDarkwall;
window.showDarkwall = showDarkwall;
