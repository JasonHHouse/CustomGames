/**
 * Tetris Game
 * Classic Tetris implementation
 */

// Canvas setup
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');

// Game constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    null,
    '#00f0f0', // I - Cyan
    '#0000f0', // J - Blue
    '#f0a000', // L - Orange
    '#f0f000', // O - Yellow
    '#00f000', // S - Green
    '#a000f0', // T - Purple
    '#f00000'  // Z - Red
];

// Tetromino shapes
const SHAPES = [
    [], // Empty
    [[1,1,1,1]], // I
    [[1,0,0],[1,1,1]], // J
    [[0,0,1],[1,1,1]], // L
    [[1,1],[1,1]], // O
    [[0,1,1],[1,1,0]], // S
    [[0,1,0],[1,1,1]], // T
    [[1,1,0],[0,1,1]]  // Z
];

// Game state
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let highScore = 0;
let lines = 0;
let level = 1;
let gameRunning = false;
let gamePaused = false;
let gameLoop = null;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

// Initialize game
function init() {
    // Create empty board
    board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));

    // Load high score from localStorage
    loadHighScore();

    // Setup event listeners
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    document.getElementById('restart-btn').addEventListener('click', restartGame);

    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);

    // Draw initial empty board
    drawBoard();
    drawNext();
}

// Load high score from localStorage
function loadHighScore() {
    const saved = localStorage.getItem('tetris-high-score');
    highScore = saved ? parseInt(saved, 10) : 0;
    document.getElementById('high-score').textContent = highScore;
}

// Save high score to localStorage
function saveHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('tetris-high-score', highScore);
        document.getElementById('high-score').textContent = highScore;
        return true; // New high score!
    }
    return false;
}

// Start game
function startGame() {
    if (gameRunning) return;

    // Reset game state
    board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    score = 0;
    lines = 0;
    level = 1;
    dropInterval = 1000;
    gameRunning = true;
    gamePaused = false;

    // Update UI
    updateScore();
    document.getElementById('start-btn').disabled = true;
    document.getElementById('pause-btn').disabled = false;
    document.getElementById('game-over').classList.add('hidden');

    // Create first pieces
    nextPiece = createPiece();
    spawnPiece();

    // Start game loop
    lastTime = 0;
    requestAnimationFrame(update);
}

// Game loop
function update(time = 0) {
    if (!gameRunning || gamePaused) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        movePiece(0, 1);
        dropCounter = 0;
    }

    draw();
    requestAnimationFrame(update);
}

// Create a random piece
function createPiece() {
    const type = Math.floor(Math.random() * 7) + 1;
    return {
        type: type,
        shape: SHAPES[type],
        x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0].length / 2),
        y: 0
    };
}

// Spawn new piece
function spawnPiece() {
    currentPiece = nextPiece;
    nextPiece = createPiece();

    // Check if game over
    if (checkCollision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
        gameOver();
    }

    drawNext();
}

// Move piece
function movePiece(dx, dy) {
    if (!currentPiece) return;

    const newX = currentPiece.x + dx;
    const newY = currentPiece.y + dy;

    if (!checkCollision(newX, newY, currentPiece.shape)) {
        currentPiece.x = newX;
        currentPiece.y = newY;
        return true;
    } else if (dy > 0) {
        // Piece hit bottom or another piece
        lockPiece();
        return false;
    }

    return false;
}

// Rotate piece
function rotatePiece() {
    if (!currentPiece) return;

    const rotated = rotate(currentPiece.shape);

    // Try to rotate
    if (!checkCollision(currentPiece.x, currentPiece.y, rotated)) {
        currentPiece.shape = rotated;
    } else {
        // Try wall kicks
        const kicks = [
            [1, 0], [-1, 0], [2, 0], [-2, 0],
            [0, -1], [1, -1], [-1, -1]
        ];

        for (let [kickX, kickY] of kicks) {
            if (!checkCollision(currentPiece.x + kickX, currentPiece.y + kickY, rotated)) {
                currentPiece.x += kickX;
                currentPiece.y += kickY;
                currentPiece.shape = rotated;
                break;
            }
        }
    }
}

// Rotate matrix
function rotate(matrix) {
    const N = matrix.length;
    const M = matrix[0].length;
    const rotated = Array(M).fill(null).map(() => Array(N).fill(0));

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < M; j++) {
            rotated[j][N - 1 - i] = matrix[i][j];
        }
    }

    return rotated;
}

// Hard drop
function hardDrop() {
    if (!currentPiece) return;

    let dropped = 0;
    while (movePiece(0, 1)) {
        dropped++;
    }

    // Bonus points for hard drop
    score += dropped * 2;
    updateScore();
}

// Check collision
function checkCollision(x, y, shape) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = x + col;
                const newY = y + row;

                // Check boundaries
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }

                // Check board collision (but not if we're above the board)
                if (newY >= 0 && board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Lock piece to board
function lockPiece() {
    if (!currentPiece) return;

    // Add piece to board
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                const boardY = currentPiece.y + row;
                const boardX = currentPiece.x + col;

                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.type;
                }
            }
        }
    }

    // Check for completed lines
    clearLines();

    // Spawn next piece
    spawnPiece();
}

// Clear completed lines
function clearLines() {
    let linesCleared = 0;

    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            // Remove completed line
            board.splice(row, 1);
            // Add empty line at top
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            row++; // Check same row again
        }
    }

    if (linesCleared > 0) {
        // Update lines
        lines += linesCleared;

        // Calculate score (Tetris scoring)
        const linePoints = [0, 100, 300, 500, 800];
        score += linePoints[linesCleared] * level;

        // Update level (every 10 lines)
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);

        updateScore();
    }
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('lines').textContent = lines;
    document.getElementById('level').textContent = level;
}

// Draw board
function drawBoard() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

            // Draw locked pieces
            if (board[row][col]) {
                drawBlock(col, row, board[row][col]);
            }
        }
    }
}

// Draw current piece
function drawPiece() {
    if (!currentPiece) return;

    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                drawBlock(
                    currentPiece.x + col,
                    currentPiece.y + row,
                    currentPiece.type
                );
            }
        }
    }
}

// Draw ghost piece (preview where piece will land)
function drawGhost() {
    if (!currentPiece) return;

    let ghostY = currentPiece.y;
    while (!checkCollision(currentPiece.x, ghostY + 1, currentPiece.shape)) {
        ghostY++;
    }

    ctx.globalAlpha = 0.3;
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                drawBlock(
                    currentPiece.x + col,
                    ghostY + row,
                    currentPiece.type
                );
            }
        }
    }
    ctx.globalAlpha = 1.0;
}

// Draw single block
function drawBlock(x, y, type) {
    const color = COLORS[type];

    // Main block
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x * BLOCK_SIZE + 2, y * BLOCK_SIZE + 2, BLOCK_SIZE - 4, BLOCK_SIZE / 3);
}

// Draw next piece preview
function drawNext() {
    // Clear canvas
    nextCtx.fillStyle = '#f8f9fa';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (!nextPiece) return;

    const shape = nextPiece.shape;
    const blockSize = 25;
    const offsetX = (nextCanvas.width - shape[0].length * blockSize) / 2;
    const offsetY = (nextCanvas.height - shape.length * blockSize) / 2;

    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const x = offsetX + col * blockSize;
                const y = offsetY + row * blockSize;

                nextCtx.fillStyle = COLORS[nextPiece.type];
                nextCtx.fillRect(x + 1, y + 1, blockSize - 2, blockSize - 2);

                // Highlight
                nextCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                nextCtx.fillRect(x + 2, y + 2, blockSize - 4, blockSize / 3);
            }
        }
    }
}

// Main draw function
function draw() {
    drawBoard();
    drawGhost();
    drawPiece();
}

// Handle keyboard input
function handleKeyPress(e) {
    if (!gameRunning || gamePaused) {
        if (e.key === 'p' || e.key === 'P') {
            togglePause();
        }
        return;
    }

    switch(e.key) {
        case 'ArrowLeft':
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
            movePiece(1, 0);
            break;
        case 'ArrowDown':
            if (movePiece(0, 1)) {
                score += 1; // Soft drop bonus
                updateScore();
            }
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case ' ':
            e.preventDefault();
            hardDrop();
            break;
        case 'p':
        case 'P':
            togglePause();
            break;
    }

    draw();
}

// Toggle pause
function togglePause() {
    if (!gameRunning) return;

    gamePaused = !gamePaused;

    if (gamePaused) {
        document.getElementById('pause-btn').textContent = 'Resume';
    } else {
        document.getElementById('pause-btn').textContent = 'Pause';
        lastTime = performance.now();
        requestAnimationFrame(update);
    }
}

// Game over
function gameOver() {
    gameRunning = false;

    // Check and save high score
    const isNewHighScore = saveHighScore();

    document.getElementById('start-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;

    // Update final score display with high score indicator
    const finalScoreText = isNewHighScore ?
        `${score} - NEW HIGH SCORE!` :
        score;
    document.getElementById('final-score').textContent = finalScoreText;

    document.getElementById('game-over').classList.remove('hidden');
}

// Restart game
function restartGame() {
    startGame();
}

// Initialize when page loads
window.addEventListener('load', init);
