# Connect Four

A classic Connect Four game implementation with AI opponent.

## Features

- **Two Game Modes:**
  - Player vs Player (local multiplayer)
  - Player vs AI (with three difficulty levels)

- **AI Difficulty Levels:**
  - **Easy:** Random moves
  - **Medium:** Strategic blocking and center preference
  - **Hard:** Minimax algorithm with alpha-beta pruning

- **Game Features:**
  - Classic 7x6 Connect Four board
  - Smooth piece dropping animations
  - Win detection (horizontal, vertical, diagonal)
  - Score tracking
  - Responsive design for mobile and desktop

## How to Play

1. Open `index.html` in a web browser
2. Select game mode (Player vs Player or Player vs AI)
3. If playing against AI, choose difficulty level
4. Click on a column to drop your piece
5. First player to get 4 pieces in a row (horizontal, vertical, or diagonal) wins!

## Game Rules

- The game is played on a 7 columns x 6 rows grid
- Players take turns dropping colored pieces into columns
- Pieces fall to the lowest available position in the column
- The first player to connect 4 pieces in a row wins
- The game is a draw if the board fills up with no winner

## Technology Stack

- **HTML5** - Structure and layout
- **CSS3** - Styling and animations
- **Vanilla JavaScript** - Game logic and AI

## File Structure

```
ConnectFour/
├── index.html          # Main game page
├── styles.css          # Styling and animations
├── game.js             # Core game logic
├── ai.js               # AI implementation
├── README.md           # This file
└── PLAN.md             # Implementation plan
```

## AI Implementation

### Easy Difficulty
Random valid moves for casual gameplay.

### Medium Difficulty
- Checks for immediate winning moves
- Blocks opponent's winning moves
- Prefers center columns for strategic advantage

### Hard Difficulty
Uses the Minimax algorithm with alpha-beta pruning:
- Looks ahead 6 moves
- Evaluates board positions using heuristics
- Makes optimal decisions
- Challenging even for experienced players

## Credits

Created as part of the CustomGames project.

## License

See LICENSE file in the root directory.
