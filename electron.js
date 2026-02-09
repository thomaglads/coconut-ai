const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const mainEngine = require('./src/main/mainInsightEngine');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');

console.log(" [DEBUG] ELECTRON.JS STARTED - MAIN PROCESS");
console.log(" [DEBUG] CWD:", process.cwd());
console.log(" [DEBUG] ARGS:", process.argv);

process.on('uncaughtException', (err) => {
    console.error(" [DEBUG] UNCAUGHT EXCEPTION:", err);
});

// Initialize Sentry for crash reporting
const Sentry = require('@sentry/electron/main');

if (process.env.SENTRY_DSN && process.env.NODE_ENV === 'production') {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'production',
        release: `InsightEngine@${app.getVersion()}`,

        // IPC tracking
        ipcMode: Sentry.IPCMode.Both,

        // Performance monitoring
        tracesSampleRate: 0.1,

        // Before send filter
        beforeSend(event) {
            // Filter out PII from paths
            if (event.exception && event.exception.values) {
                event.exception.values.forEach(value => {
                    if (value.stacktrace && value.stacktrace.frames) {
                        value.stacktrace.frames.forEach(frame => {
                            if (frame.filename) {
                                frame.filename = frame.filename.replace(/\/Users\/[^/]+/g, '/Users/<user>');
                                frame.filename = frame.filename.replace(/C:\\Users\\[^\\]+/g, 'C:\\Users\\<user>');
                            }
                        });
                    }
                });
            }
            return event;
        }
    });
}

// Security: Set application name for security policies
app.name = 'Coconut AI';

// Security: Disable node integration in production
function createWindow() {
    const isDev = process.env.NODE_ENV === 'development';

    const win = new BrowserWindow({
        width: 1400,
        height: 900,
        backgroundColor: '#020617',
        autoHideMenuBar: true,
        show: true, // Force show for debugging
        webPreferences: {
            nodeIntegration: false, // Security: Disable node integration
            contextIsolation: true, // Security: Enable context isolation
            enableRemoteModule: false, // Security: Disable remote module
            webSecurity: true, // Security: Enable web security
            allowRunningInsecureContent: false, // Security: Disallow insecure content
            preload: path.join(__dirname, 'electron', 'preload.js')
        },
        icon: path.join(__dirname, 'public', 'logo.png'),
        title: "InsightEngine Enterprise"
    });

    // Load the built app
    const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, 'dist', 'index.html')}`;
    console.log(" [DEBUG] Loading URL:", startUrl);
    win.loadURL(startUrl).then(() => {
        console.log(" [DEBUG] URL Loaded Successfully");
    }).catch(e => {
        console.error(" [DEBUG] FAILED to load URL:", e);
    });

    // Show window when ready to prevent visual flash
    win.once('ready-to-show', () => {
        win.show();

        if (isDev) {
            win.webContents.openDevTools();
        }
    });

    // Security: Prevent navigation to external URLs
    win.webContents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);

        if (parsedUrl.origin !== 'http://localhost:5175' && !navigationUrl.startsWith('file://')) {
            event.preventDefault();
        }
    });

    // Security: Prevent new window creation
    win.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    return win;
}

// IPC Handlers
ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'CSV Files', extensions: ['csv'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
});

ipcMain.handle('dialog:openModel', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'GGUF Models', extensions: ['gguf'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
});

ipcMain.handle('dialog:saveFile', async (event, data, filename) => {
    const result = await dialog.showSaveDialog({
        defaultPath: filename,
        filters: [
            { name: 'CSV Files', extensions: ['csv'] },
            { name: 'PNG Files', extensions: ['png'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (!result.canceled) {
        await fs.writeFile(result.filePath, data);
        return result.filePath;
    }
    return null;
});

ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
});

// --- NEW HANDLERS to fix renderer crash ---
// --- NEW HANDLERS to fix renderer crash ---
ipcMain.handle('db:init', async () => mainEngine.initialize());

ipcMain.handle('db:executeQuery', async (event, sql) => mainEngine.executeQuery(sql));

ipcMain.handle('db:loadCSV', async (event, content, tableName) => mainEngine.loadCSV(content, tableName));

ipcMain.handle('ai:loadModel', async (event, modelPath) => {
    return mainEngine.loadModel(modelPath);
});

ipcMain.handle('ai:loadDefaultModel', async () => {
    const defaultPath = path.join(__dirname, 'models', 'Llama-3.2-1B-Instruct-Q4_K_M.gguf');
    try {
        await fs.access(defaultPath); // check if exists
        console.log(`[Main] Found default model at: ${defaultPath}`);
        return mainEngine.loadModel(defaultPath);
    } catch (e) {
        console.error(`[Main] Default model not found at ${defaultPath}`);
        return { success: false, error: "Default model file not found. Please download it or load manually." };
    }
});

ipcMain.handle('ai:runSimulation', async () => {
    return mainEngine.runSimulation(app.getPath('userData'));
});

ipcMain.handle('ai:generateQuery', async (event, schema, question) => {
    return mainEngine.generateResponse(question, schema);
});

ipcMain.handle('ai:generateSuggestions', async (event, columns) => {
    console.log("[IPC] ai:generateSuggestions called");
    return ["Show total count", "List potential issues"];
});
// ------------------------------------------

ipcMain.handle('shell:showItemInFolder', async (event, fullPath) => {
    shell.showItemInFolder(fullPath);
});

ipcMain.handle('export:toPNG', async (event, chartElement) => {
    // This will be implemented in the renderer process for now
    // due to DOM access limitations
    return { success: false, message: 'Use renderer export instead' };
});

ipcMain.handle('export:toCSV', async (event, data) => {
    const csv = convertToCSV(data);
    return csv;
});

// Helper function to convert data to CSV
function convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                const stringValue = typeof value === 'string' ? value : String(value);
                return `"${stringValue.replace(/"/g, '""')}"`;
            }).join(',')
        )
    ];

    return csvRows.join('\n');
}

app.whenReady().then(() => {
    console.log(" [DEBUG] App Ready - Creating Window");
    createWindow();

    // Security: Set Content Security Policy
    app.on('web-contents-created', (event, contents) => {
        contents.on('new-window', (event, navigationUrl) => {
            event.preventDefault();
        });
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
