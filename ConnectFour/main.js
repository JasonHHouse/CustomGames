const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 900,
        minWidth: 800,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false
        },
        title: 'Connect Four',
        backgroundColor: '#1a1a2e'
    });

    mainWindow.loadFile('index.html');

    // Create application menu
    const template = [
        {
            label: 'Game',
            submenu: [
                {
                    label: 'New Game',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.executeJavaScript('document.getElementById("new-game-btn").click();');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'How to Play',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            alert('How to Play Connect Four:\\n\\n1. Select game mode (Player vs Player or Player vs AI)\\n2. Click on a column to drop your piece\\n3. First player to get 4 pieces in a row wins!\\n\\nShortcuts:\\nCmd/Ctrl + N: New Game\\nCmd/Ctrl + Q: Quit');
                        `);
                    }
                },
                {
                    label: 'About',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            alert('Connect Four v1.0.0\\n\\nA classic Connect Four game with AI opponent.\\n\\nCreated as part of the CustomGames project.');
                        `);
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
