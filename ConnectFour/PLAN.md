# Connect Four - Implementation Plan

## Overview
This document outlines the complete implementation plan for building a Connect Four game using HTML, CSS, and JavaScript. The game will feature local multiplayer (Player vs Player) and AI opponent modes with varying difficulty levels.

## Technology Stack
- **HTML5** - Game structure and layout
- **CSS3** - Styling, animations, and responsive design
- **Vanilla JavaScript** - Game logic, AI, and interactivity
- **No external dependencies** - Pure client-side implementation

## Project Structure
```
ConnectFour/
├── index.html          # Main game page
├── styles.css          # All styling and animations
├── game.js            # Core game logic and state management
├── ai.js              # AI opponent implementation
├── README.md          # Game documentation and instructions
└── PLAN.md            # This implementation plan
```

---

## Phase 1: Project Foundation

### Task 1.1: Set Up Project Structure
- Create all necessary files (index.html, styles.css, game.js, ai.js)
- Set up basic HTML boilerplate
- Link CSS and JavaScript files
- Add meta tags for responsive design

**Deliverables:**
- Basic file structure in place
- Files properly linked together

---

## Phase 2: HTML Structure

### Task 2.1: Create Game Board HTML
- Design semantic HTML structure for 7×6 game board
- Create container divs for each column
- Add cells for each position
- Include data attributes for row/column identification

### Task 2.2: Build UI Controls
- Game mode selector (PvP vs PvAI)
- AI difficulty selector (Easy, Medium, Hard)
- New Game / Reset button
- Current player indicator
- Winner announcement area
- Score tracker (optional)

**Deliverables:**
- Complete HTML structure
- Accessible and semantic markup

---

## Phase 3: CSS Styling & Design

### Task 3.1: Board Styling
- Classic Connect Four blue board design
- 7 columns × 6 rows grid layout
- Circular slots for pieces
- Board shadows and 3D effects

### Task 3.2: Game Pieces
- Red and yellow piece colors
- Circular piece design with gradients
- Hover effects on columns
- Drop animations

### Task 3.3: Responsive Design
- Mobile-friendly layout (viewport < 768px)
- Tablet optimization (768px - 1024px)
- Desktop layout (> 1024px)
- Touch-friendly controls for mobile

### Task 3.4: Animations
- Piece dropping animation with gravity effect
- Win condition highlighting (pulse effect on winning pieces)
- Column hover effects
- Smooth transitions for UI elements

**Deliverables:**
- Polished, professional-looking game board
- Smooth animations
- Responsive across all devices

---

## Phase 4: Core Game Logic

### Task 4.1: Initialize Game State
```javascript
- Board: 2D array (6 rows × 7 columns)
- Current player: 1 (Red) or 2 (Yellow)
- Game mode: 'pvp' or 'pva'
- Game status: 'playing', 'won', 'draw'
- Move history array
```

### Task 4.2: Player Turn Management
- Switch between Player 1 (Red) and Player 2/AI (Yellow)
- Update current player indicator
- Prevent moves during animations
- Validate player turns

### Task 4.3: Piece Dropping Mechanism
- Find lowest available row in selected column
- Validate column not full
- Place piece in board array
- Trigger drop animation
- Update visual board

### Task 4.4: Board State Management
- Initialize empty board
- Update board after each move
- Track occupied positions
- Check for full columns
- Reset board function

**Deliverables:**
- Functional game state management
- Working piece dropping mechanism
- Turn-based gameplay

---

## Phase 5: Win Detection Logic

### Task 5.1: Horizontal Win Check
- Check all rows for 4 consecutive pieces of same color
- Scan left to right across each row
- Return winning positions if found

### Task 5.2: Vertical Win Check
- Check all columns for 4 consecutive pieces
- Scan bottom to top in each column
- Return winning positions if found

### Task 5.3: Diagonal Win Check
- Check ascending diagonals (↗) for 4 in a row
- Check descending diagonals (↘) for 4 in a row
- Handle all possible diagonal starting positions
- Return winning positions if found

### Task 5.4: Draw Detection
- Check if board is completely full
- Verify no winner exists
- Trigger draw game state

### Task 5.5: Win Handler
- Highlight winning pieces with animation
- Display winner message
- Update score if tracking
- Disable further moves
- Show "New Game" option

**Deliverables:**
- Complete win detection for all directions
- Visual feedback for wins
- Proper game ending states

---

## Phase 6: Player Interaction

### Task 6.1: Click Event Handlers
- Add click listeners to each column
- Add hover effects to show where piece will drop
- Validate move is legal before executing
- Prevent clicks during animations or game over

### Task 6.2: Visual Feedback
- Show preview of piece color on column hover
- Highlight available columns
- Disable full columns visually
- Show current player's turn clearly

### Task 6.3: Keyboard Support (Accessibility)
- Arrow keys to select column
- Enter/Space to drop piece
- Escape to reset game
- Tab navigation for controls

**Deliverables:**
- Intuitive click-based gameplay
- Good visual feedback
- Accessible controls

---

## Phase 7: AI Opponent Implementation

### Task 7.1: Easy AI (Random Moves)
- Generate list of valid columns
- Select random available column
- Add slight delay for natural feel

### Task 7.2: Medium AI (Basic Strategy)
- Check for immediate wins and take them
- Block opponent's immediate wins
- Otherwise choose random valid move
- Center column preference

### Task 7.3: Hard AI (Minimax Algorithm)
- Implement minimax algorithm with alpha-beta pruning
- Evaluation function for board positions
- Look-ahead depth of 6-8 moves
- Optimize performance with memoization

### Task 7.4: AI Move Execution
- Add thinking delay (500-1000ms) for realism
- Animate AI piece drop
- Handle AI turn in game flow
- Prevent player moves during AI turn

**Deliverables:**
- Three difficulty levels of AI
- Challenging hard mode
- Natural-feeling AI behavior

---

## Phase 8: Game Modes & Controls

### Task 8.1: Mode Selection
- Toggle between Player vs Player and Player vs AI
- Show/hide AI difficulty selector based on mode
- Reset game when mode changes
- Save mode preference (localStorage)

### Task 8.2: New Game / Reset
- Clear board state
- Reset scores (if tracking)
- Reset to Player 1's turn
- Clear winner message
- Maintain current mode and difficulty settings

### Task 8.3: Game Settings
- Toggle sound effects on/off
- Theme selection (optional)
- Animation speed control (optional)
- Save settings to localStorage

**Deliverables:**
- Working mode selection
- Reliable reset functionality
- Persistent settings

---

## Phase 9: Polish & Enhancement

### Task 9.1: Animation Refinement
- Smooth piece dropping with easing
- Winning piece glow/pulse effect
- Fade-in for UI messages
- Column hover animations
- Victory celebration animation

### Task 9.2: Sound Effects (Optional)
- Piece drop sound
- Win fanfare
- Invalid move sound
- Background music toggle
- Mute/unmute controls

### Task 9.3: Score Tracking
- Track wins for each player/AI
- Display current session scores
- Reset scores button
- Store scores in localStorage

### Task 9.4: Move History (Optional)
- Track all moves made
- Undo last move feature
- Replay game feature
- Export game as notation

### Task 9.5: Visual Themes (Optional)
- Classic theme (blue board, red/yellow pieces)
- Dark theme
- Neon theme
- Theme selector in settings

**Deliverables:**
- Polished, professional game feel
- Optional enhancements based on time
- Great user experience

---

## Phase 10: Testing & Quality Assurance

### Task 10.1: Game Logic Testing
- Test all win conditions (horizontal, vertical, both diagonals)
- Test draw detection
- Test invalid move rejection
- Test board state integrity
- Test edge cases (corners, edges)

### Task 10.2: AI Testing
- Verify Easy AI makes random moves
- Verify Medium AI blocks wins
- Verify Hard AI plays optimally
- Test AI performance (no lag)
- Test AI doesn't make illegal moves

### Task 10.3: UI/UX Testing
- Test on different screen sizes
- Test touch interactions on mobile
- Test keyboard navigation
- Test all buttons and controls
- Verify accessibility features

### Task 10.4: Cross-Browser Testing
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

### Task 10.5: Performance Testing
- Check for memory leaks
- Optimize animation performance
- Test on lower-end devices
- Measure and optimize AI decision time

**Deliverables:**
- Bug-free game
- Smooth performance
- Cross-browser compatibility

---

## Phase 11: Documentation

### Task 11.1: Code Documentation
- Add JSDoc comments to functions
- Document game state structure
- Explain AI algorithm implementation
- Add inline comments for complex logic

### Task 11.2: README.md
- Game description and features
- How to play instructions
- Installation/setup (if needed)
- Technology stack used
- Credits and license

### Task 11.3: User Guide
- Game rules explanation
- Control instructions
- Tips and strategies
- AI difficulty explanations

**Deliverables:**
- Well-documented codebase
- Complete README
- User-friendly instructions

---

## Implementation Timeline

### Quick Implementation (4-6 hours)
- Phases 1-6: Basic playable game
- Single difficulty AI
- Minimal styling

### Standard Implementation (8-12 hours)
- Phases 1-8: Full-featured game
- All AI difficulties
- Polished UI/UX
- Basic testing

### Complete Implementation (15-20 hours)
- All phases including enhancements
- Sound effects and themes
- Comprehensive testing
- Full documentation

---

## Technical Specifications

### Board Representation
```javascript
// 2D Array: board[row][column]
// 0 = empty, 1 = Player 1 (Red), 2 = Player 2/AI (Yellow)
const board = [
  [0, 0, 0, 0, 0, 0, 0],  // Row 5 (top)
  [0, 0, 0, 0, 0, 0, 0],  // Row 4
  [0, 0, 0, 0, 0, 0, 0],  // Row 3
  [0, 0, 0, 0, 0, 0, 0],  // Row 2
  [0, 0, 0, 0, 0, 0, 0],  // Row 1
  [0, 0, 0, 0, 0, 0, 0]   // Row 0 (bottom)
];
```

### Win Condition Constants
- Board dimensions: 7 columns × 6 rows
- Win condition: 4 consecutive pieces
- Directions to check: horizontal, vertical, diagonal (2 types)

### AI Minimax Depth
- Easy: 0 (random)
- Medium: 2-3 levels
- Hard: 6-8 levels

---

## Success Criteria

### Minimum Viable Product (MVP)
- ✓ Playable 7×6 Connect Four board
- ✓ Two-player local multiplayer works
- ✓ Win detection for all directions
- ✓ Basic UI with reset functionality

### Full Product
- ✓ All MVP features
- ✓ AI opponent with multiple difficulties
- ✓ Polished UI with animations
- ✓ Responsive design
- ✓ Game mode selection
- ✓ Comprehensive testing
- ✓ Full documentation

### Enhanced Product
- ✓ All Full Product features
- ✓ Sound effects
- ✓ Multiple themes
- ✓ Score tracking
- ✓ Move history/undo
- ✓ Performance optimized

---

## Future Enhancements (Post-Launch)

1. **Online Multiplayer**
   - WebSocket-based real-time gameplay
   - Matchmaking system
   - Player profiles and rankings

2. **Advanced Features**
   - Tournament mode
   - Time limits per move
   - Different board sizes (custom dimensions)
   - Power-ups or special pieces (variant rules)

3. **Analytics**
   - Move heatmaps
   - Win rate statistics
   - AI learning from player patterns

4. **Social Features**
   - Share game results
   - Challenge friends
   - Leaderboards

---

## Resources & References

### Game Rules
- Standard Connect Four rules (4-in-a-row wins)
- First player advantage considerations
- Official game dimensions (7×6)

### Algorithms
- Minimax algorithm with alpha-beta pruning
- Board evaluation heuristics
- Transposition tables for optimization

### Design Inspiration
- Classic Hasbro Connect Four design
- Color accessibility guidelines
- Modern web game UI patterns

---

## Notes

- Keep code modular and maintainable
- Prioritize performance for AI calculations
- Ensure accessibility for all users
- Test thoroughly on mobile devices
- Consider future multiplayer expansion in architecture

---

**Ready to start implementing! 🎮**
