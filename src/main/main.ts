
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import isDev from 'electron-is-dev';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import error handling and logging
const { initDatabase } = require('./services/initDatabase');
const { Logger, LogLevel } = require('../shared/utils/logger');
const { ErrorHandler } = require('./error/ErrorHandler');
const { ErrorMonitoring } = require('./error/ErrorMonitoring');
const { initCoreIpcHandlers } = require('./ipc/ipcHandler');
const { initEntityIpcHandlers } = require('./ipc/initEntityIpcHandlers');

// Configure global logger
const logLevel = isDev ? LogLevel.DEBUG : LogLevel.INFO;
Logger.getInstance({
  minLevel: logLevel,
  logToConsole: true,
  logToFile: true
});

// Create module logger
const logger = Logger.getInstance();

// Global reference to mainWindow to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

/**
 * Initialize the application
 */
async function initApp() {
  try {
    // Initialize error handling
    ErrorHandler.init();
    ErrorMonitoring.getInstance();
    logger.info('Application starting', {
      version: app.getVersion(),
      isDev,
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.versions.node,
      electronVersion: process.versions.electron
    });
    
    // Initialize core IPC handlers
    initCoreIpcHandlers();
    // Initialize entity IPC handlers
    initEntityIpcHandlers();
    
    // Initialize database (wrapped in error handler)
    await initDatabase().catch((error: Error) => {
      logger.error('Failed to initialize database', error);
      ErrorHandler.handleError(error);
    });
    
    // Application is ready to create windows
    await createWindow();
  } catch (error) {
    logger.fatal('Failed to initialize application', error);
    ErrorHandler.handleError(error as Error);
    app.quit();
  }
}

/**
 * Create the main application window
 */
async function createWindow() {
  logger.info('Creating main window');
  
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false, // Don't show until ready-to-show
  });

  if (!mainWindow) {
    throw new Error('Failed to create browser window');
  }

  // Handle window creation errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode: number, errorDescription: string) => {
    logger.error('Window failed to load', { errorCode, errorDescription });
    if (mainWindow) {
      mainWindow.webContents.openDevTools();
      mainWindow.webContents.reload();
    }
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      logger.info('Main window ready and shown');
    }
  });

  // Load the index.html from React dev server or the built file
  const startURL = isDev 
    ? 'http://localhost:3000' 
  : `file://${path.join(__dirname, '../renderer/index.html')}`;
  
  try {
    if (mainWindow) {
      await mainWindow.loadURL(startURL);
      logger.info(`Loaded URL: ${startURL}`);
      
      // Open DevTools if in development
      if (isDev) {
        mainWindow.webContents.openDevTools();
        logger.debug('Opened DevTools in development mode');
      }
    }
  } catch (error) {
    logger.error('Failed to load application URL', error);
    ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)));
  }

  // Handle window closed event
  mainWindow.on('closed', () => {
    logger.info('Main window closed');
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
  // Wait a moment to allow logging and error handling to initialize
  setTimeout(initApp, 100);
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  logger.info('All windows closed');
  // On macOS it is common for applications to stay open until closed with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  logger.info('App activated');
  // On macOS it's common to re-create a window when the dock icon is clicked
  if (mainWindow === null) {
    createWindow();
  }
});

// Log app quit
app.on('quit', () => {
  logger.info('Application quitting');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', { reason, promise });
  ErrorHandler.handleError(reason instanceof Error ? reason : new Error(String(reason)) as Error);
});
