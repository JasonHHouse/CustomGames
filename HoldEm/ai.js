/**
 * AI Logic for Texas Hold'em
 * Implements different AI personalities and strategies
 */

const AI_PERSONALITIES = {
    TIGHT: { aggression: 0.3, bluffFreq: 0.1, callThreshold: 0.6 },
    AGGRESSIVE: { aggression: 0.7, bluffFreq: 0.3, callThreshold: 0.4 },
    LOOSE: { aggression: 0.5, bluffFreq: 0.4, callThreshold: 0.3 },
    CONSERVATIVE: { aggression: 0.2, bluffFreq: 0.05, callThreshold: 0.7 }
};

/**
 * Assign random personalities to AI players
 */
function assignAIPersonalities(players) {
    const personalities = Object.keys(AI_PERSONALITIES);

    for (let player of players) {
        if (player.id !== 0) { // Skip human player
            const randomPersonality = personalities[Math.floor(Math.random() * personalities.length)];
            player.personality = AI_PERSONALITIES[randomPersonality];
        }
    }
}

/**
 * Get AI decision
 */
function getAIDecision(player, gameState) {
    const { pot, currentBet, communityCards, playerBet } = gameState;

    // Calculate hand strength
    const handStrength = evaluateHandStrength(player.cards, communityCards);

    // Get personality
    const personality = player.personality;

    // Determine action based on hand strength and personality
    const decision = makeDecision(player, handStrength, currentBet, playerBet, personality, pot);

    return decision;
}

/**
 * Evaluate hand strength (0 to 1)
 */
function evaluateHandStrength(holeCards, communityCards) {
    if (communityCards.length === 0) {
        // Pre-flop: evaluate starting hand
        return evaluateStartingHand(holeCards);
    }

    // Post-flop: evaluate actual hand
    const hand = evaluateBestHand(holeCards, communityCards);

    if (!hand) return 0;

    // Normalize hand rank (0 to 1)
    const strength = hand.rank / 9;

    // Adjust for high cards
    const highCardBonus = hand.values[0] / 12 * 0.2;

    return Math.min(1, strength + highCardBonus);
}

/**
 * Evaluate pre-flop starting hand strength
 */
function evaluateStartingHand(cards) {
    if (cards.length !== 2) return 0;

    const [card1, card2] = cards;
    const isPair = card1.value === card2.value;
    const isSuited = card1.suit === card2.suit;
    const highCard = Math.max(card1.value, card2.value);
    const gap = Math.abs(card1.value - card2.value);

    let strength = 0;

    // Pairs are strong
    if (isPair) {
        strength = 0.5 + (card1.value / 12 * 0.4); // AA = 0.9, 22 = 0.5
    } else {
        // High cards are good
        strength = (highCard / 12) * 0.5;

        // Suited is better
        if (isSuited) strength += 0.1;

        // Connected cards are better
        if (gap <= 1) strength += 0.1;
        else if (gap <= 3) strength += 0.05;

        // Both cards high
        if (card1.value >= 9 && card2.value >= 9) strength += 0.2;
    }

    return Math.min(1, strength);
}

/**
 * Make decision based on hand strength and personality
 */
function makeDecision(player, handStrength, currentBet, playerBet, personality, pot) {
    const amountToCall = currentBet - playerBet;
    const canCheck = amountToCall === 0;

    // Very weak hand - likely fold
    if (handStrength < 0.2) {
        if (canCheck) {
            return { action: 'check' };
        }

        // Sometimes bluff
        if (Math.random() < personality.bluffFreq) {
            const raiseAmount = Math.floor(pot * 0.3);
            return { action: 'raise', amount: Math.min(raiseAmount, player.chips) };
        }

        return { action: 'fold' };
    }

    // Weak hand
    if (handStrength < 0.4) {
        if (canCheck) {
            return { action: 'check' };
        }

        // Call only if cheap and personality allows
        if (amountToCall <= player.chips * 0.1 && Math.random() < personality.callThreshold) {
            return { action: 'call' };
        }

        return { action: 'fold' };
    }

    // Medium hand
    if (handStrength < 0.65) {
        if (canCheck) {
            // Sometimes bet for value
            if (Math.random() < personality.aggression) {
                const raiseAmount = Math.floor(pot * 0.4);
                return { action: 'raise', amount: Math.min(raiseAmount, player.chips) };
            }
            return { action: 'check' };
        }

        // Call moderate bets
        if (amountToCall <= player.chips * 0.2) {
            return { action: 'call' };
        }

        // Fold to large bets (unless aggressive)
        if (Math.random() > personality.aggression) {
            return { action: 'fold' };
        }

        return { action: 'call' };
    }

    // Strong hand
    if (handStrength < 0.85) {
        // Usually raise or call
        if (Math.random() < personality.aggression + 0.2) {
            const raiseAmount = Math.floor(pot * (0.5 + Math.random() * 0.5));
            return { action: 'raise', amount: Math.min(raiseAmount, player.chips) };
        }

        if (canCheck) {
            // Slow play sometimes
            if (Math.random() < 0.3) {
                return { action: 'check' };
            }
            const raiseAmount = Math.floor(pot * 0.5);
            return { action: 'raise', amount: Math.min(raiseAmount, player.chips) };
        }

        return { action: 'call' };
    }

    // Very strong hand
    // Raise aggressively
    if (Math.random() < 0.8) {
        const raiseAmount = Math.floor(pot * (0.7 + Math.random() * 0.8));
        return { action: 'raise', amount: Math.min(raiseAmount, player.chips) };
    }

    // Rarely slow play monster hands
    if (canCheck && Math.random() < 0.2) {
        return { action: 'check' };
    }

    return { action: 'call' };
}

/**
 * Add some delay for more realistic AI
 */
function getAIDecisionWithDelay(player, gameState, callback) {
    const delay = 500 + Math.random() * 1500; // 0.5 to 2 seconds

    setTimeout(() => {
        const decision = getAIDecision(player, gameState);
        callback(decision);
    }, delay);
}
