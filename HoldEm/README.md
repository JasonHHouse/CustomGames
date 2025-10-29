# Texas Hold'em Poker

Classic Texas Hold'em poker game - 1 human player vs 7 AI opponents.

## Features

- **8-Player Game:** Play against 7 AI opponents
- **Full Texas Hold'em Rules:**
  - Pre-flop, Flop, Turn, River betting rounds
  - Small and big blinds
  - All standard actions: Fold, Check, Call, Raise, All-in
- **Intelligent AI Opponents:**
  - Multiple AI personalities (Tight, Aggressive, Loose, Conservative)
  - Hand strength evaluation
  - Strategic betting and bluffing
- **Complete Hand Evaluation:**
  - All poker hands from High Card to Royal Flush
  - Automatic winner determination
  - Side pots (future enhancement)
- **Visual Poker Table:**
  - Professional poker table layout
  - 8 player positions around the table
  - Community cards display
  - Live chip counts and pot

## How to Play

### Game Objective
Win all the chips by making the best 5-card poker hand using your 2 hole cards and the 5 community cards.

### Actions
- **Fold:** Give up your hand and forfeit any chips bet
- **Check:** Pass action when no bet is required
- **Call:** Match the current bet
- **Raise:** Increase the bet (use slider to select amount)
- **All In:** Bet all remaining chips

### Betting Rounds
1. **Pre-Flop:** After receiving 2 hole cards
2. **Flop:** After 3 community cards are dealt
3. **Turn:** After the 4th community card
4. **River:** After the 5th community card
5. **Showdown:** Reveal hands and determine winner

### Poker Hand Rankings (High to Low)
1. **Royal Flush:** A-K-Q-J-10 of same suit
2. **Straight Flush:** 5 consecutive cards of same suit
3. **Four of a Kind:** 4 cards of same rank
4. **Full House:** 3 of a kind + a pair
5. **Flush:** 5 cards of same suit
6. **Straight:** 5 consecutive cards
7. **Three of a Kind:** 3 cards of same rank
8. **Two Pair:** 2 different pairs
9. **Pair:** 2 cards of same rank
10. **High Card:** Highest card wins

## Game Rules

- Starting chips: $1,000 per player
- Small blind: $10
- Big blind: $20
- Dealer button rotates clockwise each hand
- Game continues until only one player has chips

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Version
```bash
npm start
```

### Build for Distribution
```bash
# Build for Windows
npm run package:win

# Build for macOS
npm run package:mac

# Build for Linux
npm run package:linux

# Build for all platforms
npm run package
```

## AI Behavior

The AI opponents have different personalities:

- **Tight:** Plays conservatively, folds weak hands
- **Aggressive:** Bets and raises frequently, applies pressure
- **Loose:** Plays more hands, calls more often
- **Conservative:** Very cautious, rarely bluffs

Each AI evaluates hand strength and makes decisions based on:
- Current hand strength
- Community cards
- Pot odds
- Position
- Personality traits

## Built With

- Electron - Desktop application framework
- HTML5 Canvas - Card rendering
- JavaScript - Game logic and AI

## Future Enhancements

- [ ] Side pots for complex all-in scenarios
- [ ] Tournament mode with increasing blinds
- [ ] Player statistics and hand history
- [ ] Customizable starting chips and blind levels
- [ ] Save/load game state
- [ ] More AI difficulty levels
- [ ] Multiplayer online mode

## License

MIT
