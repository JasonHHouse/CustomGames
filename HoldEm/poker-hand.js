/**
 * Poker Hand Evaluation for Texas Hold'em
 * Evaluates 5-card hands and determines winners
 */

const HAND_RANKS = {
    HIGH_CARD: 0,
    PAIR: 1,
    TWO_PAIR: 2,
    THREE_OF_KIND: 3,
    STRAIGHT: 4,
    FLUSH: 5,
    FULL_HOUSE: 6,
    FOUR_OF_KIND: 7,
    STRAIGHT_FLUSH: 8,
    ROYAL_FLUSH: 9
};

const HAND_NAMES = {
    0: 'High Card',
    1: 'Pair',
    2: 'Two Pair',
    3: 'Three of a Kind',
    4: 'Straight',
    5: 'Flush',
    6: 'Full House',
    7: 'Four of a Kind',
    8: 'Straight Flush',
    9: 'Royal Flush'
};

/**
 * Evaluate best 5-card hand from 7 cards (2 hole + 5 community)
 */
function evaluateBestHand(holeCards, communityCards) {
    const allCards = [...holeCards, ...communityCards];

    if (allCards.length < 5) {
        return null;
    }

    // Generate all possible 5-card combinations
    const combinations = getCombinations(allCards, 5);

    let bestHand = null;
    let bestRank = -1;

    for (let combo of combinations) {
        const hand = evaluateHand(combo);

        if (hand.rank > bestRank ||
            (hand.rank === bestRank && compareHands(hand, bestHand) > 0)) {
            bestHand = hand;
            bestRank = hand.rank;
        }
    }

    return bestHand;
}

/**
 * Evaluate a 5-card hand
 */
function evaluateHand(cards) {
    const sortedCards = [...cards].sort((a, b) => b.value - a.value);

    const isFlush = checkFlush(sortedCards);
    const isStraight = checkStraight(sortedCards);
    const counts = getValueCounts(sortedCards);

    // Royal Flush
    if (isFlush && isStraight && sortedCards[0].rank === 'A') {
        return {
            rank: HAND_RANKS.ROYAL_FLUSH,
            name: HAND_NAMES[HAND_RANKS.ROYAL_FLUSH],
            cards: sortedCards,
            values: sortedCards.map(c => c.value)
        };
    }

    // Straight Flush
    if (isFlush && isStraight) {
        return {
            rank: HAND_RANKS.STRAIGHT_FLUSH,
            name: HAND_NAMES[HAND_RANKS.STRAIGHT_FLUSH],
            cards: sortedCards,
            values: sortedCards.map(c => c.value)
        };
    }

    // Four of a Kind
    if (counts.fourKind) {
        return {
            rank: HAND_RANKS.FOUR_OF_KIND,
            name: HAND_NAMES[HAND_RANKS.FOUR_OF_KIND],
            cards: sortedCards,
            values: [counts.fourKind, ...counts.kickers]
        };
    }

    // Full House
    if (counts.threeKind && counts.pair) {
        return {
            rank: HAND_RANKS.FULL_HOUSE,
            name: HAND_NAMES[HAND_RANKS.FULL_HOUSE],
            cards: sortedCards,
            values: [counts.threeKind, counts.pair]
        };
    }

    // Flush
    if (isFlush) {
        return {
            rank: HAND_RANKS.FLUSH,
            name: HAND_NAMES[HAND_RANKS.FLUSH],
            cards: sortedCards,
            values: sortedCards.map(c => c.value)
        };
    }

    // Straight
    if (isStraight) {
        return {
            rank: HAND_RANKS.STRAIGHT,
            name: HAND_NAMES[HAND_RANKS.STRAIGHT],
            cards: sortedCards,
            values: sortedCards.map(c => c.value)
        };
    }

    // Three of a Kind
    if (counts.threeKind) {
        return {
            rank: HAND_RANKS.THREE_OF_KIND,
            name: HAND_NAMES[HAND_RANKS.THREE_OF_KIND],
            cards: sortedCards,
            values: [counts.threeKind, ...counts.kickers]
        };
    }

    // Two Pair
    if (counts.pairs && counts.pairs.length >= 2) {
        return {
            rank: HAND_RANKS.TWO_PAIR,
            name: HAND_NAMES[HAND_RANKS.TWO_PAIR],
            cards: sortedCards,
            values: [...counts.pairs, ...counts.kickers]
        };
    }

    // Pair
    if (counts.pair) {
        return {
            rank: HAND_RANKS.PAIR,
            name: HAND_NAMES[HAND_RANKS.PAIR],
            cards: sortedCards,
            values: [counts.pair, ...counts.kickers]
        };
    }

    // High Card
    return {
        rank: HAND_RANKS.HIGH_CARD,
        name: HAND_NAMES[HAND_RANKS.HIGH_CARD],
        cards: sortedCards,
        values: sortedCards.map(c => c.value)
    };
}

/**
 * Check if cards form a flush
 */
function checkFlush(cards) {
    const suit = cards[0].suit;
    return cards.every(card => card.suit === suit);
}

/**
 * Check if cards form a straight
 */
function checkStraight(cards) {
    const values = cards.map(c => c.value).sort((a, b) => b - a);

    // Check normal straight
    for (let i = 0; i < values.length - 1; i++) {
        if (values[i] - values[i + 1] !== 1) {
            // Check for A-2-3-4-5 (wheel)
            if (i === 0 && values[0] === 12 && values[values.length - 1] === 0) {
                // Check if 5-4-3-2
                const wheelCheck = [values[1], values[2], values[3], values[4]];
                if (wheelCheck[0] === 3 && wheelCheck[1] === 2 &&
                    wheelCheck[2] === 1 && wheelCheck[3] === 0) {
                    return true;
                }
            }
            return false;
        }
    }

    return true;
}

/**
 * Get value counts for pairs, trips, quads
 */
function getValueCounts(cards) {
    const counts = {};

    for (let card of cards) {
        counts[card.value] = (counts[card.value] || 0) + 1;
    }

    const result = {
        fourKind: null,
        threeKind: null,
        pairs: [],
        pair: null,
        kickers: []
    };

    const sortedValues = Object.keys(counts)
        .map(v => parseInt(v))
        .sort((a, b) => b - a);

    for (let value of sortedValues) {
        const count = counts[value];

        if (count === 4) {
            result.fourKind = value;
        } else if (count === 3) {
            result.threeKind = value;
        } else if (count === 2) {
            result.pairs.push(value);
            if (!result.pair) result.pair = value;
        } else {
            result.kickers.push(value);
        }
    }

    return result;
}

/**
 * Compare two hands (returns 1 if hand1 wins, -1 if hand2 wins, 0 if tie)
 */
function compareHands(hand1, hand2) {
    if (hand1.rank !== hand2.rank) {
        return hand1.rank > hand2.rank ? 1 : -1;
    }

    // Same rank, compare values
    for (let i = 0; i < hand1.values.length; i++) {
        if (hand1.values[i] > hand2.values[i]) return 1;
        if (hand1.values[i] < hand2.values[i]) return -1;
    }

    return 0; // Tie
}

/**
 * Get all combinations of k elements from array
 */
function getCombinations(array, k) {
    if (k === 1) return array.map(el => [el]);
    if (k === array.length) return [array];

    const combinations = [];

    for (let i = 0; i <= array.length - k; i++) {
        const head = array[i];
        const tail = array.slice(i + 1);
        const tailCombos = getCombinations(tail, k - 1);

        for (let combo of tailCombos) {
            combinations.push([head, ...combo]);
        }
    }

    return combinations;
}

/**
 * Determine winners from multiple players
 */
function determineWinners(players, communityCards) {
    const activePlayers = players.filter(p => !p.folded && p.chips > 0);

    if (activePlayers.length === 0) return [];
    if (activePlayers.length === 1) return [activePlayers[0]];

    // Evaluate all hands
    const evaluations = activePlayers.map(player => ({
        player: player,
        hand: evaluateBestHand(player.cards, communityCards)
    }));

    // Find best hand(s)
    let bestEval = evaluations[0];

    for (let i = 1; i < evaluations.length; i++) {
        const comparison = compareHands(evaluations[i].hand, bestEval.hand);
        if (comparison > 0) {
            bestEval = evaluations[i];
        }
    }

    // Find all players with the best hand (ties)
    const winners = evaluations.filter(eval =>
        compareHands(eval.hand, bestEval.hand) === 0
    );

    return winners.map(w => ({
        player: w.player,
        hand: w.hand
    }));
}
