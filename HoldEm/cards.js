/**
 * Card and Deck utilities for Texas Hold'em
 */

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUIT_NAMES = { '♠': 'spades', '♥': 'hearts', '♦': 'diamonds', '♣': 'clubs' };

/**
 * Create a card object
 */
function createCard(rank, suit) {
    return {
        rank: rank,
        suit: suit,
        value: RANKS.indexOf(rank),
        color: (suit === '♥' || suit === '♦') ? 'red' : 'black',
        toString: function() {
            return `${this.rank}${this.suit}`;
        }
    };
}

/**
 * Create and shuffle a new deck
 */
function createDeck() {
    const deck = [];

    for (let suit of SUITS) {
        for (let rank of RANKS) {
            deck.push(createCard(rank, suit));
        }
    }

    return shuffleDeck(deck);
}

/**
 * Shuffle a deck using Fisher-Yates algorithm
 */
function shuffleDeck(deck) {
    const shuffled = [...deck];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

/**
 * Create card element for display
 */
function createCardElement(card, faceDown = false) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';

    if (faceDown) {
        cardEl.classList.add('card-back');
        return cardEl;
    }

    cardEl.classList.add(card.color);

    const rankTop = document.createElement('div');
    rankTop.className = 'rank';
    rankTop.textContent = card.rank;

    const suit = document.createElement('div');
    suit.className = 'suit';
    suit.textContent = card.suit;

    const rankBottom = document.createElement('div');
    rankBottom.className = 'rank';
    rankBottom.style.transform = 'rotate(180deg)';
    rankBottom.textContent = card.rank;

    cardEl.appendChild(rankTop);
    cardEl.appendChild(suit);
    cardEl.appendChild(rankBottom);

    return cardEl;
}

/**
 * Deal cards from deck
 */
function dealCards(deck, count) {
    const dealt = [];
    for (let i = 0; i < count; i++) {
        if (deck.length > 0) {
            dealt.push(deck.pop());
        }
    }
    return dealt;
}
