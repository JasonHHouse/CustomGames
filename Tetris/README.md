# Tetris

Classic Tetris game built with Electron.

## Features

- Classic Tetris gameplay
- Score, level, and lines tracking
- Next piece preview
- Ghost piece (shows where piece will land)
- Progressive difficulty (speed increases with level)
- Keyboard controls
- Pause functionality

## Controls

- **←/→** - Move left/right
- **↓** - Soft drop (faster fall)
- **↑** - Rotate piece
- **Space** - Hard drop (instant drop)
- **P** - Pause/Resume

## Scoring

- **Single line:** 100 × level
- **Double line:** 300 × level
- **Triple line:** 500 × level
- **Tetris (4 lines):** 800 × level
- **Soft drop:** 1 point per cell
- **Hard drop:** 2 points per cell

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
npm run build:win

# Build for macOS
npm run build:mac

# Build for Linux
npm run build:linux

# Build for all platforms
npm run build
```

## Built With

- Electron
- HTML5 Canvas
- JavaScript

## License

MIT
