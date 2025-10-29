/**
 * Texas Hold'em Game Logic
 * Main game controller
 */

// Game state
const gameState = {
    players: [],
    deck: [],
    communityCards: [],
    pot: 0,
    currentBet: 0,
    dealerIndex: 0,
    currentPlayerIndex: 0,
    round: 'pre-flop', // pre-flop, flop, turn, river, showdown
    smallBlind: 10,
    bigBlind: 20,
    isGameActive: false,
    isRoundActive: false
};

const NUM_PLAYERS = 8;
const STARTING_CHIPS = 1000;

/**
 * Initialize game
 */
function initGame() {
    console.log('Initializing Texas Hold\'em...');

    // Setup event listeners
    document.getElementById('start-btn').addEventListener('click', startNewGame);
    document.getElementById('new-game-btn').addEventListener('click', startNewGame);
    document.getElementById('fold-btn').addEventListener('click', () => playerAction('fold'));
    document.getElementById('check-btn').addEventListener('click', () => playerAction('check'));
    document.getElementById('call-btn').addEventListener('click', () => playerAction('call'));
    document.getElementById('raise-btn').addEventListener('click', () => playerAction('raise'));
    document.getElementById('all-in-btn').addEventListener('click', () => playerAction('all-in'));

    // Bet slider
    const betSlider = document.getElementById('bet-slider');
    betSlider.addEventListener('input', (e) => {
        document.getElementById('bet-amount').textContent = e.target.value;
    });

    console.log('Game initialized');
}

/**
 * Start new game
 */
function startNewGame() {
    console.log('Starting new game...');

    // Hide panels
    document.getElementById('start-panel').style.display = 'none';
    document.getElementById('game-over-panel').classList.add('hidden');

    // Initialize players
    gameState.players = [];
    for (let i = 0; i < NUM_PLAYERS; i++) {
        gameState.players.push({
            id: i,
            name: i === 0 ? 'You' : `Player ${i + 1}`,
            chips: STARTING_CHIPS,
            cards: [],
            bet: 0,
            folded: false,
            allIn: false,
            isHuman: i === 0
        });
    }

    // Assign AI personalities
    assignAIPersonalities(gameState.players);

    // Reset game state
    gameState.pot = 0;
    gameState.currentBet = 0;
    gameState.dealerIndex = 0;
    gameState.communityCards = [];
    gameState.isGameActive = true;

    // Start first hand
    startNewHand();
}

/**
 * Start a new hand
 */
function startNewHand() {
    console.log('Starting new hand...');

    // Check if game should end
    const playersWithChips = gameState.players.filter(p => p.chips > 0);
    if (playersWithChips.length === 1) {
        endGame(playersWithChips[0]);
        return;
    }

    // Reset for new hand
    gameState.deck = createDeck();
    gameState.communityCards = [];
    gameState.pot = 0;
    gameState.currentBet = 0;
    gameState.round = 'pre-flop';

    // Reset players
    for (let player of gameState.players) {
        player.cards = [];
        player.bet = 0;
        player.folded = player.chips === 0; // Auto-fold if no chips
        player.allIn = false;
    }

    // Clear community cards display
    updateCommunityCards();

    // Move dealer button
    do {
        gameState.dealerIndex = (gameState.dealerIndex + 1) % NUM_PLAYERS;
    } while (gameState.players[gameState.dealerIndex].chips === 0);

    // Deal cards
    dealHoleCards();

    // Post blinds
    postBlinds();

    // Update UI
    updateAllPlayers();
    updatePot();
    updateRoundName();

    // Start betting round
    gameState.isRoundActive = true;
    startBettingRound();
}

/**
 * Deal hole cards to all players
 */
function dealHoleCards() {
    for (let player of gameState.players) {
        if (player.chips > 0) {
            player.cards = dealCards(gameState.deck, 2);
        }
    }
}

/**
 * Post small and big blinds
 */
function postBlinds() {
    const smallBlindIndex = getNextActivePlayer(gameState.dealerIndex);
    const bigBlindIndex = getNextActivePlayer(smallBlindIndex);

    const smallBlindPlayer = gameState.players[smallBlindIndex];
    const bigBlindPlayer = gameState.players[bigBlindIndex];

    // Small blind
    const sbAmount = Math.min(gameState.smallBlind, smallBlindPlayer.chips);
    smallBlindPlayer.bet = sbAmount;
    smallBlindPlayer.chips -= sbAmount;
    gameState.pot += sbAmount;

    if (smallBlindPlayer.chips === 0) smallBlindPlayer.allIn = true;

    // Big blind
    const bbAmount = Math.min(gameState.bigBlind, bigBlindPlayer.chips);
    bigBlindPlayer.bet = bbAmount;
    bigBlindPlayer.chips -= bbAmount;
    gameState.pot += bbAmount;
    gameState.currentBet = bbAmount;

    if (bigBlindPlayer.chips === 0) bigBlindPlayer.allIn = true;

    updatePlayerDisplay(smallBlindPlayer, 'Small Blind');
    updatePlayerDisplay(bigBlindPlayer, 'Big Blind');
}

/**
 * Start betting round
 */
function startBettingRound() {
    // Determine first player to act
    if (gameState.round === 'pre-flop') {
        // After big blind
        const bigBlindIndex = getNextActivePlayer(getNextActivePlayer(gameState.dealerIndex));
        gameState.currentPlayerIndex = getNextActivePlayer(bigBlindIndex);
    } else {
        // After dealer
        gameState.currentPlayerIndex = getNextActivePlayer(gameState.dealerIndex);
    }

    // Process next player
    processNextPlayer();
}

/**
 * Process the next player's action
 */
function processNextPlayer() {
    if (!gameState.isRoundActive) return;

    const player = gameState.players[gameState.currentPlayerIndex];

    // Skip folded players or players with no chips
    if (player.folded || player.allIn) {
        moveToNextPlayer();
        return;
    }

    // Check if betting round is complete
    if (isBettingRoundComplete()) {
        endBettingRound();
        return;
    }

    // Highlight current player
    updateActivePlayer(player);

    // Human player
    if (player.isHuman) {
        enablePlayerActions(player);
    } else {
        // AI player
        disablePlayerActions();
        getAIDecisionWithDelay(player, {
            pot: gameState.pot,
            currentBet: gameState.currentBet,
            communityCards: gameState.communityCards,
            playerBet: player.bet
        }, (decision) => {
            executePlayerAction(player, decision);
        });
    }
}

/**
 * Check if betting round is complete
 */
function isBettingRoundComplete() {
    const activePlayers = gameState.players.filter(p => !p.folded && !p.allIn && p.chips > 0);

    if (activePlayers.length === 0) return true;
    if (activePlayers.length === 1 && activePlayers[0].bet >= gameState.currentBet) return true;

    // All active players have matched the current bet
    return activePlayers.every(p => p.bet === gameState.currentBet);
}

/**
 * End betting round and move to next round
 */
function endBettingRound() {
    gameState.isRoundActive = false;

    // Reset bets for next round
    for (let player of gameState.players) {
        player.bet = 0;
    }
    gameState.currentBet = 0;

    // Move to next round
    setTimeout(() => {
        advanceRound();
    }, 1000);
}

/**
 * Advance to next round (flop, turn, river, showdown)
 */
function advanceRound() {
    switch (gameState.round) {
        case 'pre-flop':
            dealFlop();
            break;
        case 'flop':
            dealTurn();
            break;
        case 'turn':
            dealRiver();
            break;
        case 'river':
            showdown();
            break;
    }
}

/**
 * Deal the flop (3 community cards)
 */
function dealFlop() {
    gameState.round = 'flop';
    gameState.deck.pop(); // Burn card
    const flopCards = dealCards(gameState.deck, 3);
    gameState.communityCards.push(...flopCards);

    updateCommunityCards();
    updateRoundName();
    gameState.isRoundActive = true;
    startBettingRound();
}

/**
 * Deal the turn (4th community card)
 */
function dealTurn() {
    gameState.round = 'turn';
    gameState.deck.pop(); // Burn card
    const turnCard = dealCards(gameState.deck, 1);
    gameState.communityCards.push(...turnCard);

    updateCommunityCards();
    updateRoundName();
    gameState.isRoundActive = true;
    startBettingRound();
}

/**
 * Deal the river (5th community card)
 */
function dealRiver() {
    gameState.round = 'river';
    gameState.deck.pop(); // Burn card
    const riverCard = dealCards(gameState.deck, 1);
    gameState.communityCards.push(...riverCard);

    updateCommunityCards();
    updateRoundName();
    gameState.isRoundActive = true;
    startBettingRound();
}

/**
 * Showdown - determine winner(s)
 */
function showdown() {
    gameState.round = 'showdown';
    updateRoundName();

    // Reveal all hands
    revealAllHands();

    // Determine winners
    setTimeout(() => {
        const winners = determineWinners(gameState.players, gameState.communityCards);

        if (winners.length > 0) {
            const winAmount = Math.floor(gameState.pot / winners.length);

            for (let winner of winners) {
                winner.player.chips += winAmount;
                updatePlayerDisplay(winner.player, `Won $${winAmount} - ${winner.hand.name}`);
            }

            updateAllPlayers();
        }

        // Start next hand after delay
        setTimeout(() => {
            startNewHand();
        }, 5000);
    }, 2000);
}

/**
 * Execute player action
 */
function executePlayerAction(player, decision) {
    const { action, amount } = decision;

    switch (action) {
        case 'fold':
            player.folded = true;
            updatePlayerDisplay(player, 'Folded');
            break;

        case 'check':
            updatePlayerDisplay(player, 'Check');
            break;

        case 'call':
            const callAmount = Math.min(gameState.currentBet - player.bet, player.chips);
            player.bet += callAmount;
            player.chips -= callAmount;
            gameState.pot += callAmount;

            if (player.chips === 0) {
                player.allIn = true;
                updatePlayerDisplay(player, 'All In');
            } else {
                updatePlayerDisplay(player, `Call $${callAmount}`);
            }
            break;

        case 'raise':
            const raiseTotal = Math.min(amount, player.chips);
            const raiseAmount = raiseTotal - (gameState.currentBet - player.bet);
            player.chips -= raiseTotal;
            player.bet += raiseTotal;
            gameState.pot += raiseTotal;
            gameState.currentBet = player.bet;

            if (player.chips === 0) {
                player.allIn = true;
                updatePlayerDisplay(player, 'All In');
            } else {
                updatePlayerDisplay(player, `Raise $${raiseAmount}`);
            }
            break;

        case 'all-in':
            const allInAmount = player.chips;
            player.bet += allInAmount;
            gameState.pot += allInAmount;
            player.chips = 0;
            player.allIn = true;

            if (player.bet > gameState.currentBet) {
                gameState.currentBet = player.bet;
            }

            updatePlayerDisplay(player, 'All In');
            break;
    }

    updatePot();
    updateAllPlayers();

    // Check if only one player remains
    const activePlayers = gameState.players.filter(p => !p.folded && p.chips > 0);
    if (activePlayers.length === 1) {
        // Winner by default
        const winner = activePlayers[0];
        winner.chips += gameState.pot;
        updatePlayerDisplay(winner, `Won $${gameState.pot}`);
        updateAllPlayers();

        setTimeout(() => {
            startNewHand();
        }, 3000);
        return;
    }

    moveToNextPlayer();
}

/**
 * Player action handler
 */
function playerAction(action) {
    const player = gameState.players[0]; // Human player

    let decision = { action };

    if (action === 'raise') {
        const betAmount = parseInt(document.getElementById('bet-slider').value);
        const minRaise = gameState.currentBet * 2;
        const actualRaise = Math.max(minRaise, betAmount);
        decision.amount = actualRaise;
    }

    disablePlayerActions();
    executePlayerAction(player, decision);
}

/**
 * Move to next player
 */
function moveToNextPlayer() {
    gameState.currentPlayerIndex = getNextActivePlayer(gameState.currentPlayerIndex);
    processNextPlayer();
}

/**
 * Get next active player index
 */
function getNextActivePlayer(startIndex) {
    let index = (startIndex + 1) % NUM_PLAYERS;
    let count = 0;

    while (count < NUM_PLAYERS) {
        const player = gameState.players[index];
        if (!player.folded && player.chips > 0) {
            return index;
        }
        index = (index + 1) % NUM_PLAYERS;
        count++;
    }

    return startIndex;
}

/**
 * Enable player action buttons
 */
function enablePlayerActions(player) {
    document.getElementById('action-panel').classList.add('active');

    const callAmount = gameState.currentBet - player.bet;
    const canCheck = callAmount === 0;

    document.getElementById('fold-btn').disabled = false;
    document.getElementById('check-btn').disabled = !canCheck;
    document.getElementById('call-btn').disabled = canCheck || player.chips < callAmount;
    document.getElementById('call-btn').textContent = `Call $${callAmount}`;
    document.getElementById('raise-btn').disabled = player.chips <= callAmount;
    document.getElementById('all-in-btn').disabled = false;

    // Update bet slider
    const slider = document.getElementById('bet-slider');
    slider.min = gameState.currentBet * 2;
    slider.max = player.chips;
    slider.value = Math.min(slider.max, gameState.currentBet * 2);
    document.getElementById('bet-amount').textContent = slider.value;
}

/**
 * Disable player action buttons
 */
function disablePlayerActions() {
    document.getElementById('action-panel').classList.remove('active');
}

/**
 * Update community cards display
 */
function updateCommunityCards() {
    const container = document.getElementById('community-cards');
    container.innerHTML = '';

    for (let i = 0; i < 5; i++) {
        if (i < gameState.communityCards.length) {
            container.appendChild(createCardElement(gameState.communityCards[i]));
        } else {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'card-slot empty';
            container.appendChild(emptySlot);
        }
    }
}

/**
 * Update all player displays
 */
function updateAllPlayers() {
    for (let player of gameState.players) {
        updatePlayerDisplay(player);
    }
}

/**
 * Update player display
 */
function updatePlayerDisplay(player, status = '') {
    const playerEl = document.getElementById(`player-${player.id}`);
    if (!playerEl) return;

    // Update chips
    playerEl.querySelector('.player-chips').textContent = `$${player.chips}`;

    // Update status
    playerEl.querySelector('.player-status').textContent = status;

    // Update cards
    const cardsEl = playerEl.querySelector('.player-cards');
    cardsEl.innerHTML = '';

    if (player.cards.length > 0) {
        if (player.isHuman || gameState.round === 'showdown') {
            // Show cards
            for (let card of player.cards) {
                cardsEl.appendChild(createCardElement(card));
            }
        } else {
            // Show card backs
            cardsEl.appendChild(createCardElement(null, true));
            cardsEl.appendChild(createCardElement(null, true));
        }
    }

    // Update folded state
    if (player.folded) {
        playerEl.classList.add('folded');
    } else {
        playerEl.classList.remove('folded');
    }
}

/**
 * Update active player highlight
 */
function updateActivePlayer(player) {
    // Remove active class from all
    document.querySelectorAll('.player').forEach(el => el.classList.remove('active'));

    // Add to current
    const playerEl = document.getElementById(`player-${player.id}`);
    if (playerEl) {
        playerEl.classList.add('active');
    }
}

/**
 * Reveal all hands at showdown
 */
function revealAllHands() {
    for (let player of gameState.players) {
        if (!player.folded) {
            updatePlayerDisplay(player);
        }
    }
}

/**
 * Update pot display
 */
function updatePot() {
    document.getElementById('pot').textContent = `$${gameState.pot}`;
}

/**
 * Update round name display
 */
function updateRoundName() {
    const roundNames = {
        'pre-flop': 'Pre-Flop',
        'flop': 'Flop',
        'turn': 'Turn',
        'river': 'River',
        'showdown': 'Showdown'
    };
    document.getElementById('round-name').textContent = roundNames[gameState.round];
}

/**
 * End game
 */
function endGame(winner) {
    gameState.isGameActive = false;

    document.getElementById('game-over-title').textContent = 'Game Over!';
    document.getElementById('game-over-message').textContent =
        winner.isHuman ?
        `Congratulations! You won with $${winner.chips}!` :
        `${winner.name} won the game with $${winner.chips}.`;

    document.getElementById('game-over-panel').classList.remove('hidden');
}

// Initialize when page loads
window.addEventListener('load', initGame);
