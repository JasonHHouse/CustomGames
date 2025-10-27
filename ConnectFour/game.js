/**
 * Connect Four Game
 * Main game logic and state management
 */

// Game state
const gameState = {
    board: [],
    currentPlayer: 1, // 1 = Player 1 (Red), 2 = Player 2/AI (Yellow)
    gameMode: 'pvp', // 'pvp' or 'pva'
    aiDifficulty: 'medium',
    isPlaying: true,
    isAnimating: false,
    scores: {
        player1: 0,
        player2: 0
    }
};

// Constants
const ROWS = 6;
const COLS = 7;
const PLAYER1 = 1;
const PLAYER2 = 2;
const EMPTY = 0;

/**
 * Initialize the game
 */
function initGame() {
    console.log('Initializing Connect Four...');

    // Initialize empty board
    gameState.board = Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY));
    gameState.currentPlayer = PLAYER1;
    gameState.isPlaying = true;
    gameState.isAnimating = false;

    // Create board UI
    createBoard();

    // Setup event listeners
    setupEventListeners();

    // Update UI
    updatePlayerIndicator();
    clearMessage();

    console.log('Game initialized successfully');
}

/**
 * Create the game board UI
 */
function createBoard() {
    const boardElement = document.getElementById('game-board');
    boardElement.innerHTML = '';

    // Create columns
    for (let col = 0; col < COLS; col++) {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'column';
        columnDiv.dataset.column = col;

        // Create cells in each column (bottom to top)
        for (let row = 0; row < ROWS; row++) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            cellDiv.dataset.row = row;
            cellDiv.dataset.col = col;
            columnDiv.appendChild(cellDiv);
        }

        boardElement.appendChild(columnDiv);
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Column click handlers
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        column.addEventListener('click', handleColumnClick);
    });

    // New game button
    document.getElementById('new-game-btn').addEventListener('click', resetGame);

    // Game mode selector
    document.getElementById('game-mode').addEventListener('change', handleModeChange);

    // AI difficulty selector
    document.getElementById('ai-difficulty').addEventListener('change', handleDifficultyChange);
}

/**
 * Handle column click
 */
function handleColumnClick(event) {
    if (!gameState.isPlaying || gameState.isAnimating) {
        return;
    }

    // Get column from event
    let column;
    if (event.currentTarget.classList.contains('column')) {
        column = parseInt(event.currentTarget.dataset.column);
    } else {
        return;
    }

    // Make move
    makeMove(column);
}

/**
 * Make a move in the specified column
 */
function makeMove(col) {
    if (!isValidMove(col)) {
        return false;
    }

    // Find the lowest available row
    const row = getLowestEmptyRow(col);

    if (row === -1) {
        return false; // Column is full
    }

    // Update board state
    gameState.board[row][col] = gameState.currentPlayer;

    // Update UI with animation
    gameState.isAnimating = true;
    updateCell(row, col, gameState.currentPlayer);

    // Check for win or draw after animation
    setTimeout(() => {
        gameState.isAnimating = false;

        if (checkWin(row, col)) {
            handleWin();
        } else if (isBoardFull()) {
            handleDraw();
        } else {
            // Switch player
            switchPlayer();

            // If AI's turn, make AI move
            if (gameState.gameMode === 'pva' && gameState.currentPlayer === PLAYER2 && gameState.isPlaying) {
                setTimeout(() => {
                    makeAIMove();
                }, 500); // Delay for natural feel
            }
        }
    }, 500); // Match drop animation duration

    return true;
}

/**
 * Check if a move is valid
 */
function isValidMove(col) {
    if (col < 0 || col >= COLS) {
        return false;
    }
    return gameState.board[ROWS - 1][col] === EMPTY;
}

/**
 * Get the lowest empty row in a column
 */
function getLowestEmptyRow(col) {
    for (let row = 0; row < ROWS; row++) {
        if (gameState.board[row][col] === EMPTY) {
            return row;
        }
    }
    return -1;
}

/**
 * Update a cell in the UI
 */
function updateCell(row, col, player) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add('piece', 'dropping');
    cell.classList.add(player === PLAYER1 ? 'red' : 'yellow');

    // Remove animation class after animation completes
    setTimeout(() => {
        cell.classList.remove('dropping');
    }, 500);
}

/**
 * Check for a win from the last move
 */
function checkWin(row, col) {
    const player = gameState.board[row][col];

    // Check all four directions
    return checkDirection(row, col, 0, 1, player) ||  // Horizontal
           checkDirection(row, col, 1, 0, player) ||  // Vertical
           checkDirection(row, col, 1, 1, player) ||  // Diagonal /
           checkDirection(row, col, 1, -1, player);   // Diagonal \
}

/**
 * Check for 4 in a row in a specific direction
 */
function checkDirection(row, col, deltaRow, deltaCol, player) {
    let count = 1; // Count the current piece
    const winningCells = [[row, col]];

    // Check in positive direction
    for (let i = 1; i < 4; i++) {
        const newRow = row + (deltaRow * i);
        const newCol = col + (deltaCol * i);

        if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) {
            break;
        }

        if (gameState.board[newRow][newCol] === player) {
            count++;
            winningCells.push([newRow, newCol]);
        } else {
            break;
        }
    }

    // Check in negative direction
    for (let i = 1; i < 4; i++) {
        const newRow = row - (deltaRow * i);
        const newCol = col - (deltaCol * i);

        if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) {
            break;
        }

        if (gameState.board[newRow][newCol] === player) {
            count++;
            winningCells.push([newRow, newCol]);
        } else {
            break;
        }
    }

    // If we have 4 or more in a row, highlight them
    if (count >= 4) {
        highlightWinningCells(winningCells);
        return true;
    }

    return false;
}

/**
 * Highlight winning cells
 */
function highlightWinningCells(cells) {
    cells.forEach(([row, col]) => {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('winning');
    });
}

/**
 * Check if the board is full (draw condition)
 */
function isBoardFull() {
    return gameState.board[ROWS - 1].every(cell => cell !== EMPTY);
}

/**
 * Switch to the other player
 */
function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === PLAYER1 ? PLAYER2 : PLAYER1;
    updatePlayerIndicator();
}

/**
 * Update player turn indicator
 */
function updatePlayerIndicator() {
    const indicator = document.getElementById('player-indicator');
    const playerName = gameState.currentPlayer === PLAYER1 ? 'Player 1' :
                       (gameState.gameMode === 'pva' ? 'AI' : 'Player 2');
    indicator.textContent = `${playerName}'s Turn`;
    indicator.style.color = gameState.currentPlayer === PLAYER1 ? '#e74c3c' : '#f39c12';
}

/**
 * Handle win condition
 */
function handleWin() {
    gameState.isPlaying = false;

    // Update score
    if (gameState.currentPlayer === PLAYER1) {
        gameState.scores.player1++;
        document.getElementById('score-p1').textContent = gameState.scores.player1;
    } else {
        gameState.scores.player2++;
        document.getElementById('score-p2').textContent = gameState.scores.player2;
    }

    // Display winner message
    const playerName = gameState.currentPlayer === PLAYER1 ? 'Player 1' :
                       (gameState.gameMode === 'pva' ? 'AI' : 'Player 2');
    showMessage(`${playerName} Wins!`, 'winner');

    // Disable columns
    disableBoard();
}

/**
 * Handle draw condition
 */
function handleDraw() {
    gameState.isPlaying = false;
    showMessage("It's a Draw!", 'draw');
    disableBoard();
}

/**
 * Show game message
 */
function showMessage(text, type) {
    const messageElement = document.getElementById('game-message');
    messageElement.textContent = text;
    messageElement.className = `game-message ${type}`;
}

/**
 * Clear game message
 */
function clearMessage() {
    const messageElement = document.getElementById('game-message');
    messageElement.textContent = '';
    messageElement.className = 'game-message';
}

/**
 * Disable board (after game ends)
 */
function disableBoard() {
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        column.classList.add('disabled');
    });
}

/**
 * Enable board
 */
function enableBoard() {
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        column.classList.remove('disabled');
    });
}

/**
 * Reset the game
 */
function resetGame() {
    // Clear board state
    gameState.board = Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY));
    gameState.currentPlayer = PLAYER1;
    gameState.isPlaying = true;
    gameState.isAnimating = false;

    // Clear UI
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.className = 'cell';
    });

    // Enable board
    enableBoard();

    // Update UI
    updatePlayerIndicator();
    clearMessage();

    console.log('Game reset');
}

/**
 * Handle game mode change
 */
function handleModeChange(event) {
    gameState.gameMode = event.target.value;

    // Show/hide AI difficulty selector
    const difficultyContainer = document.getElementById('difficulty-container');
    if (gameState.gameMode === 'pva') {
        difficultyContainer.style.display = 'flex';
        document.querySelector('.score .player-label.yellow').textContent = 'AI:';
    } else {
        difficultyContainer.style.display = 'none';
        document.querySelector('.score .player-label.yellow').textContent = 'Player 2:';
    }

    // Reset game when mode changes
    resetGame();
}

/**
 * Handle AI difficulty change
 */
function handleDifficultyChange(event) {
    gameState.aiDifficulty = event.target.value;
    console.log(`AI difficulty set to: ${gameState.aiDifficulty}`);
}

/**
 * Make AI move (placeholder - will be implemented in ai.js)
 */
function makeAIMove() {
    if (typeof getAIMove === 'function') {
        const col = getAIMove(gameState.board, gameState.aiDifficulty);
        if (col !== -1) {
            makeMove(col);
        }
    } else {
        console.error('AI function not loaded');
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initGame);
