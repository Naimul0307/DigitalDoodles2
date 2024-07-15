const { app, BrowserWindow, globalShortcut } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;
let flaskProcess;

// Function to run the update_config.py script
function updateConfig() {
    return new Promise((resolve, reject) => {
        const updateProcess = spawn('python', [path.join(__dirname, 'update_config.py')]);

        updateProcess.stdout.on('data', (data) => {
            console.log(`Update Config: ${data}`);
        });

        updateProcess.stderr.on('data', (data) => {
            console.error(`Update Config Error: ${data}`);
            reject(data);
        });

        updateProcess.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(`Update process exited with code ${code}`);
            }
        });
    });
}

// Load configuration from config.json
const configPath = path.join(__dirname, 'config.json');
let config;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        fullscreen: true, // Start in full-screen mode
        autoHideMenuBar: true, // Hide the menu bar
        icon: path.join(__dirname, '4919664.ico'), // Add this line for the icon
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    const url = `http://${config.IP}:${config.PORT}`;
    mainWindow.loadURL(url);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    // Registering the F11 key to toggle fullscreen
    globalShortcut.register('F11', () => {
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
    });

    // Registering the Esc key to exit fullscreen
    globalShortcut.register('Esc', () => {
        if (mainWindow.isFullScreen()) {
            mainWindow.setFullScreen(false);
        }
    });
}

app.on('ready', () => {
    updateConfig().then(() => {
        // Read the updated configuration
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        // Start the Flask server
        flaskProcess = spawn('python', [path.join(__dirname, 'app.py')]);

        flaskProcess.stdout.on('data', (data) => {
            console.log(`Flask: ${data}`);
        });

        flaskProcess.stderr.on('data', (data) => {
            console.error(`Flask Error: ${data}`);
        });

        flaskProcess.on('close', (code) => {
            console.log(`Flask process exited with code ${code}`);
        });

        createWindow();
    }).catch((error) => {
        console.error(`Failed to update config: ${error}`);
        app.quit();
    });
});

app.on('before-quit', () => {
    if (flaskProcess) {
        console.log('Terminating Flask server...');
        flaskProcess.kill('SIGINT'); // Send SIGINT to terminate the Flask server
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
