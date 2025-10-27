/**
 * Connect Four AI
 * AI opponent implementation with multiple difficulty levels
 */

/**
 * Get AI move based on difficulty level
 * @param {Array} board - Current board state
 * @param {string} difficulty - AI difficulty level ('easy', 'medium', 'hard')
 * @returns {number} Column to play (0-6) or -1 if no valid move
 */
function getAIMove(board, difficulty) {
    console.log(`AI (${difficulty}) is thinking...`);

    switch (difficulty) {
        case 'easy':
            return getRandomMove(board);
        case 'medium':
            return getMediumMove(board);
        case 'hard':
            return getHardMove(board);
        default:
            return getRandomMove(board);
    }
}

/**
 * Easy AI - Random valid move
 */
function getRandomMove(board) {
    const validColumns = getValidColumns(board);

    if (validColumns.length === 0) {
        return -1;
    }

    const randomIndex = Math.floor(Math.random() * validColumns.length);
    return validColumns[randomIndex];
}

/**
 * Medium AI - Basic strategy
 * 1. Check for winning move
 * 2. Block opponent's winning move
 * 3. Prefer center columns
 * 4. Random otherwise
 */
function getMediumMove(board) {
    const ROWS = 6;
    const COLS = 7;
    const AI_PLAYER = 2;
    const HUMAN_PLAYER = 1;

    // 1. Check if AI can win
    for (let col = 0; col < COLS; col++) {
        if (isValidColumn(board, col)) {
            const row = getLowestEmptyRowAI(board, col);
            board[row][col] = AI_PLAYER;

            if (checkWinForPlayer(board, row, col, AI_PLAYER)) {
                board[row][col] = 0; // Undo
                return col;
            }

            board[row][col] = 0; // Undo
        }
    }

    // 2. Check if need to block opponent
    for (let col = 0; col < COLS; col++) {
        if (isValidColumn(board, col)) {
            const row = getLowestEmptyRowAI(board, col);
            board[row][col] = HUMAN_PLAYER;

            if (checkWinForPlayer(board, row, col, HUMAN_PLAYER)) {
                board[row][col] = 0; // Undo
                return col;
            }

            board[row][col] = 0; // Undo
        }
    }

    // 3. Prefer center columns
    const centerColumns = [3, 2, 4, 1, 5, 0, 6];
    for (let col of centerColumns) {
        if (isValidColumn(board, col)) {
            return col;
        }
    }

    // 4. Random fallback
    return getRandomMove(board);
}

/**
 * Hard AI - Minimax algorithm with alpha-beta pruning
 */
function getHardMove(board) {
    const DEPTH = 6; // Look ahead depth
    const AI_PLAYER = 2;

    let bestScore = -Infinity;
    let bestCol = -1;
    const validColumns = getValidColumns(board);

    // Try each valid column
    for (let col of validColumns) {
        const row = getLowestEmptyRowAI(board, col);
        board[row][col] = AI_PLAYER;

        const score = minimax(board, DEPTH - 1, false, -Infinity, Infinity);

        board[row][col] = 0; // Undo move

        if (score > bestScore) {
            bestScore = score;
            bestCol = col;
        }
    }

    return bestCol !== -1 ? bestCol : getRandomMove(board);
}

/**
 * Minimax algorithm with alpha-beta pruning
 */
function minimax(board, depth, isMaximizing, alpha, beta) {
    const AI_PLAYER = 2;
    const HUMAN_PLAYER = 1;

    // Check terminal states
    const winner = checkBoardWinner(board);
    if (winner === AI_PLAYER) return 10000;
    if (winner === HUMAN_PLAYER) return -10000;
    if (isBoardFullAI(board) || depth === 0) return evaluateBoard(board);

    const validColumns = getValidColumns(board);

    if (isMaximizing) {
        let maxScore = -Infinity;

        for (let col of validColumns) {
            const row = getLowestEmptyRowAI(board, col);
            board[row][col] = AI_PLAYER;

            const score = minimax(board, depth - 1, false, alpha, beta);

            board[row][col] = 0; // Undo

            maxScore = Math.max(maxScore, score);
            alpha = Math.max(alpha, score);

            if (beta <= alpha) break; // Prune
        }

        return maxScore;
    } else {
        let minScore = Infinity;

        for (let col of validColumns) {
            const row = getLowestEmptyRowAI(board, col);
            board[row][col] = HUMAN_PLAYER;

            const score = minimax(board, depth - 1, true, alpha, beta);

            board[row][col] = 0; // Undo

            minScore = Math.min(minScore, score);
            beta = Math.min(beta, score);

            if (beta <= alpha) break; // Prune
        }

        return minScore;
    }
}

/**
 * Evaluate board position (heuristic for minimax)
 */
function evaluateBoard(board) {
    const AI_PLAYER = 2;
    const HUMAN_PLAYER = 1;

    let score = 0;

    // Center column preference
    const centerColumn = 3;
    for (let row = 0; row < 6; row++) {
        if (board[row][centerColumn] === AI_PLAYER) {
            score += 3;
        } else if (board[row][centerColumn] === HUMAN_PLAYER) {
            score -= 3;
        }
    }

    // Evaluate all possible windows of 4
    score += evaluateWindows(board, AI_PLAYER, HUMAN_PLAYER);

    return score;
}

/**
 * Evaluate all windows of 4 cells
 */
function evaluateWindows(board, aiPlayer, humanPlayer) {
    let score = 0;

    // Horizontal
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 4; col++) {
            const window = [board[row][col], board[row][col+1], board[row][col+2], board[row][col+3]];
            score += scoreWindow(window, aiPlayer, humanPlayer);
        }
    }

    // Vertical
    for (let col = 0; col < 7; col++) {
        for (let row = 0; row < 3; row++) {
            const window = [board[row][col], board[row+1][col], board[row+2][col], board[row+3][col]];
            score += scoreWindow(window, aiPlayer, humanPlayer);
        }
    }

    // Diagonal (/)
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
            const window = [board[row][col], board[row+1][col+1], board[row+2][col+2], board[row+3][col+3]];
            score += scoreWindow(window, aiPlayer, humanPlayer);
        }
    }

    // Diagonal (\)
    for (let row = 3; row < 6; row++) {
        for (let col = 0; col < 4; col++) {
            const window = [board[row][col], board[row-1][col+1], board[row-2][col+2], board[row-3][col+3]];
            score += scoreWindow(window, aiPlayer, humanPlayer);
        }
    }

    return score;
}

/**
 * Score a window of 4 cells
 */
function scoreWindow(window, aiPlayer, humanPlayer) {
    let score = 0;

    const aiCount = window.filter(cell => cell === aiPlayer).length;
    const humanCount = window.filter(cell => cell === humanPlayer).length;
    const emptyCount = window.filter(cell => cell === 0).length;

    // AI scoring
    if (aiCount === 4) score += 100;
    else if (aiCount === 3 && emptyCount === 1) score += 5;
    else if (aiCount === 2 && emptyCount === 2) score += 2;

    // Human blocking
    if (humanCount === 3 && emptyCount === 1) score -= 4;

    return score;
}

/**
 * Check if board has a winner
 */
function checkBoardWinner(board) {
    // Check all positions for a win
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            if (board[row][col] !== 0) {
                if (checkWinForPlayer(board, row, col, board[row][col])) {
                    return board[row][col];
                }
            }
        }
    }
    return null;
}

/**
 * Check if a specific player has won from a position
 */
function checkWinForPlayer(board, row, col, player) {
    return checkDirectionAI(board, row, col, 0, 1, player) ||  // Horizontal
           checkDirectionAI(board, row, col, 1, 0, player) ||  // Vertical
           checkDirectionAI(board, row, col, 1, 1, player) ||  // Diagonal /
           checkDirectionAI(board, row, col, 1, -1, player);   // Diagonal \
}

/**
 * Check for 4 in a row in a specific direction
 */
function checkDirectionAI(board, row, col, deltaRow, deltaCol, player) {
    let count = 1;

    // Check positive direction
    for (let i = 1; i < 4; i++) {
        const newRow = row + (deltaRow * i);
        const newCol = col + (deltaCol * i);

        if (newRow < 0 || newRow >= 6 || newCol < 0 || newCol >= 7) break;
        if (board[newRow][newCol] === player) count++;
        else break;
    }

    // Check negative direction
    for (let i = 1; i < 4; i++) {
        const newRow = row - (deltaRow * i);
        const newCol = col - (deltaCol * i);

        if (newRow < 0 || newRow >= 6 || newCol < 0 || newCol >= 7) break;
        if (board[newRow][newCol] === player) count++;
        else break;
    }

    return count >= 4;
}

/**
 * Get list of valid columns
 */
function getValidColumns(board) {
    const validCols = [];
    for (let col = 0; col < 7; col++) {
        if (board[5][col] === 0) {
            validCols.push(col);
        }
    }
    return validCols;
}

/**
 * Check if a column is valid (not full)
 */
function isValidColumn(board, col) {
    return board[5][col] === 0;
}

/**
 * Get lowest empty row in a column (AI version)
 */
function getLowestEmptyRowAI(board, col) {
    for (let row = 0; row < 6; row++) {
        if (board[row][col] === 0) {
            return row;
        }
    }
    return -1;
}

/**
 * Check if board is full
 */
function isBoardFullAI(board) {
    return board[5].every(cell => cell !== 0);
}
