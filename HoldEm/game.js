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

    // Initialize players with human names
    const playerNames = ['You', 'Sarah', 'Marcus', 'Emma', 'Jack', 'Olivia', 'Chen', 'Isabella'];
    gameState.players = [];
    for (let i = 0; i < NUM_PLAYERS; i++) {
        gameState.players.push({
            id: i,
            name: playerNames[i],
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

    // Check if human player is out
    const humanPlayer = gameState.players[0];
    if (humanPlayer.chips === 0) {
        showGameOverForHuman();
        return;
    }

    // Check if game should end (only one player with chips left)
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
        player.totalBet = 0; // Track total contribution for the hand
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
    // Track which players have acted this round
    for (let player of gameState.players) {
        player.hasActed = false;
    }

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

    // If only one active player remains, they must have acted AND matched the bet
    // (or there's no bet to match)
    if (activePlayers.length === 1) {
        const player = activePlayers[0];
        return player.hasActed && player.bet >= gameState.currentBet;
    }

    // All active players must have acted AND matched the current bet
    const allActed = activePlayers.every(p => p.hasActed);
    const allMatched = activePlayers.every(p => p.bet === gameState.currentBet);

    return allActed && allMatched;
}

/**
 * End betting round and move to next round
 */
function endBettingRound() {
    gameState.isRoundActive = false;

    // Accumulate bets into totalBet before resetting for next round
    for (let player of gameState.players) {
        player.totalBet += player.bet;
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
 * Deal remaining cards when all players are all-in
 */
function dealRemainingCards() {
    gameState.isRoundActive = false;

    // Deal remaining community cards automatically
    const dealNextCard = () => {
        if (gameState.communityCards.length < 5) {
            setTimeout(() => {
                switch (gameState.communityCards.length) {
                    case 0:
                        // Deal flop
                        gameState.round = 'flop';
                        gameState.deck.pop(); // Burn
                        const flopCards = dealCards(gameState.deck, 3);
                        gameState.communityCards.push(...flopCards);
                        updateCommunityCards();
                        updateRoundName();
                        dealNextCard();
                        break;
                    case 3:
                        // Deal turn
                        gameState.round = 'turn';
                        gameState.deck.pop(); // Burn
                        const turnCard = dealCards(gameState.deck, 1);
                        gameState.communityCards.push(...turnCard);
                        updateCommunityCards();
                        updateRoundName();
                        dealNextCard();
                        break;
                    case 4:
                        // Deal river
                        gameState.round = 'river';
                        gameState.deck.pop(); // Burn
                        const riverCard = dealCards(gameState.deck, 1);
                        gameState.communityCards.push(...riverCard);
                        updateCommunityCards();
                        updateRoundName();
                        // Go to showdown after river
                        setTimeout(() => {
                            showdown();
                        }, 1000);
                        break;
                }
            }, 1000);
        } else {
            // Already have all 5 cards, go to showdown
            setTimeout(() => {
                showdown();
            }, 1000);
        }
    };

    dealNextCard();
}

/**
 * Calculate side pots for all-in scenarios
 * Returns array of pots with eligible players
 */
function calculateSidePots() {
    const pots = [];

    // Use totalBet (accumulated across all rounds) + current bet
    const activePlayers = gameState.players.filter(p => !p.folded).map(p => ({
        ...p,
        totalContribution: p.totalBet + p.bet
    })).filter(p => p.totalContribution > 0);

    if (activePlayers.length === 0) return pots;

    // Sort players by total contribution (lowest to highest)
    const sortedPlayers = [...activePlayers].sort((a, b) => a.totalContribution - b.totalContribution);

    let remainingPlayers = [...activePlayers];
    let previousBet = 0;

    for (let i = 0; i < sortedPlayers.length; i++) {
        const currentBet = sortedPlayers[i].totalContribution;

        if (currentBet > previousBet) {
            const potAmount = (currentBet - previousBet) * remainingPlayers.length;

            pots.push({
                amount: potAmount,
                eligiblePlayers: remainingPlayers.map(p => gameState.players[p.id]) // Map back to original player objects
            });

            previousBet = currentBet;
        }

        // Remove this player from future pots (they're all-in at this level)
        remainingPlayers = remainingPlayers.filter(p => p.id !== sortedPlayers[i].id);
    }

    return pots;
}

/**
 * Showdown - determine winner(s) with side pot support
 */
function showdown() {
    gameState.round = 'showdown';
    updateRoundName();

    // Reveal all hands
    revealAllHands();

    // Determine winners
    setTimeout(() => {
        // Calculate side pots
        const sidePots = calculateSidePots();

        console.log('=== SIDE POT CALCULATION ===');
        console.log('Total pot:', gameState.pot);
        console.log('Player contributions:', gameState.players.filter(p => !p.folded).map(p => ({
            name: p.name,
            currentBet: p.bet,
            totalBet: p.totalBet,
            total: p.bet + p.totalBet,
            chips: p.chips
        })));
        console.log('Side pots:', sidePots.map(pot => ({
            amount: pot.amount,
            eligible: pot.eligiblePlayers.map(p => p.name)
        })));
        console.log('Total in side pots:', sidePots.reduce((sum, pot) => sum + pot.amount, 0));

        // Clear previous winners
        for (let player of gameState.players) {
            player.isWinner = false;
            player.winAmount = 0;
        }

        let mainWinnerInfo = null;

        // Award each pot starting from main pot (last/largest)
        for (let i = sidePots.length - 1; i >= 0; i--) {
            const pot = sidePots[i];

            console.log(`\n=== AWARDING POT ${sidePots.length - i} ===`);
            console.log(`Amount: $${pot.amount}`);
            console.log(`Eligible players: ${pot.eligiblePlayers.map(p => p.name).join(', ')}`);

            // Determine winner(s) from eligible players
            const winners = determineWinners(pot.eligiblePlayers, gameState.communityCards);

            console.log(`Winners: ${winners.map(w => w.player.name).join(', ')}`);

            if (winners.length > 0) {
                const winAmount = Math.floor(pot.amount / winners.length);

                console.log(`Each winner gets: $${winAmount}`);

                for (let winner of winners) {
                    winner.player.chips += winAmount;
                    winner.player.winAmount = (winner.player.winAmount || 0) + winAmount;
                    winner.player.isWinner = true;

                    const winnerName = winner.player.isHuman ? 'You' : winner.player.name;
                    const handName = winner.hand ? winner.hand.name : 'Best Hand';
                    console.log(`${winnerName} wins $${winAmount} (Pot ${sidePots.length - i}) with ${handName}`);

                    // Save main pot winner for display
                    if (i === sidePots.length - 1) {
                        mainWinnerInfo = { winners, handName };
                    }
                }
            }
        }

        // Update display for all winners
        for (let player of gameState.players) {
            if (player.winAmount > 0) {
                updatePlayerDisplay(player, `Won $${player.winAmount}`);
            }
        }

        // Update round name to show main pot winner
        if (mainWinnerInfo) {
            const winnerNames = mainWinnerInfo.winners.map(w => w.player.isHuman ? 'You' : w.player.name).join(' & ');
            document.getElementById('round-name').textContent = `${winnerNames} Won with ${mainWinnerInfo.handName}!`;
            document.getElementById('round-name').style.color = '#10b981';
        }

        updateAllPlayers();

        // Clear winner badges and start next hand after delay
        setTimeout(() => {
            for (let player of gameState.players) {
                player.isWinner = false;
            }
            startNewHand();
        }, 5000);
    }, 2000);
}

/**
 * Execute player action
 */
function executePlayerAction(player, decision) {
    const { action, amount } = decision;

    // Mark player as having acted
    player.hasActed = true;

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

            // Reset hasActed for all other players (they need to respond to raise)
            for (let p of gameState.players) {
                if (p.id !== player.id && !p.folded && !p.allIn) {
                    p.hasActed = false;
                }
            }

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

                // Reset hasActed for all other players if this raises the bet
                for (let p of gameState.players) {
                    if (p.id !== player.id && !p.folded && !p.allIn) {
                        p.hasActed = false;
                    }
                }
            }

            updatePlayerDisplay(player, 'All In');
            break;
    }

    updatePot();
    updateAllPlayers();

    // Check if only one player remains who hasn't folded
    const playersInHand = gameState.players.filter(p => !p.folded);
    if (playersInHand.length === 1) {
        // Winner by default (everyone else folded)
        const winner = playersInHand[0];
        winner.chips += gameState.pot;
        updatePlayerDisplay(winner, `Won $${gameState.pot}`);
        updateAllPlayers();

        setTimeout(() => {
            startNewHand();
        }, 3000);
        return;
    }

    // Check if all remaining players are all-in, skip to showdown
    const playersCanAct = gameState.players.filter(p => !p.folded && !p.allIn && p.chips > 0);
    if (playersCanAct.length === 0) {
        // Everyone is all-in or folded, deal remaining cards and go to showdown
        dealRemainingCards();
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

    // Minimum raise must be at least big blind
    // If there's a current bet, must raise by at least big blind
    // If no current bet, must bet at least big blind
    const minRaise = gameState.currentBet > 0
        ? gameState.currentBet + gameState.bigBlind
        : gameState.bigBlind;

    slider.min = minRaise;
    slider.max = player.chips;
    slider.value = Math.min(slider.max, minRaise);
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

    const playerInfo = playerEl.querySelector('.player-info');

    // Update chips
    playerEl.querySelector('.player-chips').textContent = `$${player.chips}`;

    // Update status
    playerEl.querySelector('.player-status').textContent = status;

    // Remove old badges
    playerInfo.querySelectorAll('.dealer-button, .blind-badge, .winner-badge').forEach(el => el.remove());

    // Add dealer button
    if (player.id === gameState.dealerIndex && gameState.isGameActive) {
        const dealerBtn = document.createElement('div');
        dealerBtn.className = 'dealer-button';
        dealerBtn.textContent = 'D';
        playerInfo.appendChild(dealerBtn);
    }

    // Add blind badges
    if (gameState.isGameActive && gameState.round === 'pre-flop') {
        const smallBlindIndex = getNextActivePlayer(gameState.dealerIndex);
        const bigBlindIndex = getNextActivePlayer(smallBlindIndex);

        if (player.id === smallBlindIndex) {
            const sbBadge = document.createElement('div');
            sbBadge.className = 'blind-badge small-blind';
            sbBadge.textContent = 'SB';
            playerInfo.appendChild(sbBadge);
        } else if (player.id === bigBlindIndex) {
            const bbBadge = document.createElement('div');
            bbBadge.className = 'blind-badge';
            bbBadge.textContent = 'BB';
            playerInfo.appendChild(bbBadge);
        }
    }

    // Add winner badge
    if (player.isWinner) {
        const winnerBadge = document.createElement('div');
        winnerBadge.className = 'winner-badge';
        winnerBadge.textContent = '🏆 WINNER';
        playerInfo.appendChild(winnerBadge);
    }

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
    // Remove active class and action indicators from all
    document.querySelectorAll('.player').forEach(el => {
        el.classList.remove('active');
        el.querySelectorAll('.action-indicator').forEach(ind => ind.remove());
    });

    // Add to current
    const playerEl = document.getElementById(`player-${player.id}`);
    if (playerEl) {
        playerEl.classList.add('active');

        // Add action indicator dot
        const actionIndicator = document.createElement('div');
        actionIndicator.className = 'action-indicator';
        playerEl.querySelector('.player-info').appendChild(actionIndicator);
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
/**
 * Show game over for human player (busted out)
 */
function showGameOverForHuman() {
    gameState.isGameActive = false;

    document.getElementById('game-over-title').textContent = 'You Busted Out!';
    document.getElementById('game-over-message').textContent =
        'You ran out of chips. Better luck next time!';

    document.getElementById('game-over-panel').classList.remove('hidden');
}

/**
 * End game when only one player remains
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
