#!/bin/bash

# CustomGames Build Script
# Build all games or specific games for different platforms

set -e  # Exit on error

GAMES=("Tetris" "HoldEm" "ConnectFour")
PLATFORM=""
SPECIFIC_GAME=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -g, --game GAME      Build specific game (Tetris, HoldEm, ConnectFour)"
    echo "  -p, --platform PLAT  Target platform (mac, win, linux, all)"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                          # Build all games for current platform"
    echo "  $0 -g Tetris                # Build only Tetris for current platform"
    echo "  $0 -p win                   # Build all games for Windows"
    echo "  $0 -g HoldEm -p mac         # Build HoldEm for macOS"
    echo "  $0 -p all                   # Build all games for all platforms"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -g|--game)
            SPECIFIC_GAME="$2"
            shift 2
            ;;
        -p|--platform)
            PLATFORM="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            ;;
    esac
done

# Validate specific game if provided
if [ -n "$SPECIFIC_GAME" ]; then
    if [[ ! " ${GAMES[@]} " =~ " ${SPECIFIC_GAME} " ]]; then
        echo -e "${RED}Error: Invalid game '$SPECIFIC_GAME'${NC}"
        echo "Available games: ${GAMES[@]}"
        exit 1
    fi
    GAMES=("$SPECIFIC_GAME")
fi

# Determine build command based on platform
get_build_command() {
    case $PLATFORM in
        mac)
            echo "npm run package:mac"
            ;;
        win)
            echo "npm run package:win"
            ;;
        linux)
            echo "npm run package:linux"
            ;;
        all)
            echo "npm run package"
            ;;
        "")
            # Default to current platform
            if [[ "$OSTYPE" == "darwin"* ]]; then
                echo "npm run package:mac"
            elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
                echo "npm run package:linux"
            elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
                echo "npm run package:win"
            else
                echo "npm run package"
            fi
            ;;
        *)
            echo -e "${RED}Error: Invalid platform '$PLATFORM'${NC}"
            echo "Available platforms: mac, win, linux, all"
            exit 1
            ;;
    esac
}

BUILD_CMD=$(get_build_command)

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}CustomGames Build Script${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "Games to build: ${YELLOW}${GAMES[@]}${NC}"
echo -e "Build command: ${YELLOW}${BUILD_CMD}${NC}"
echo ""

# Install dependencies and build each game
for game in "${GAMES[@]}"; do
    echo -e "${GREEN}Building $game...${NC}"
    echo -e "${YELLOW}----------------------------------------${NC}"

    if [ ! -d "$game" ]; then
        echo -e "${RED}Error: Directory '$game' not found${NC}"
        continue
    fi

    cd "$game"

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies for $game..."
        npm install
    fi

    # Build the game
    echo "Building $game..."
    eval $BUILD_CMD

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $game built successfully${NC}"
    else
        echo -e "${RED}✗ Failed to build $game${NC}"
    fi

    cd ..
    echo ""
done

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Build Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Build artifacts are located in each game's 'dist' directory:"
for game in "${GAMES[@]}"; do
    if [ -d "$game/dist" ]; then
        echo -e "  ${YELLOW}$game/dist/${NC}"
    fi
done
