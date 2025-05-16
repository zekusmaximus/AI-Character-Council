// src/main/updates/AutoUpdater.ts
import { autoUpdater } from 'electron-updater';
import { BrowserWindow, dialog } from 'electron';
import { createLogger } from '../../shared/utils/logger';
import * as isDev from 'electron-is-dev';

const logger = createLogger('AutoUpdater');

export class AutoUpdater {
  private static mainWindow: BrowserWindow | null = null;

  static initialize(mainWindow: BrowserWindow): void {
    if (isDev) {
      logger.info('Auto-updates disabled in development mode');
      return;
    }

    this.mainWindow = mainWindow;

    // Configure updater
    autoUpdater.logger = logger;
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    // Set up event handlers
    autoUpdater.on('checking-for-update', () => {
      logger.info('Checking for updates');
      this.sendStatusToWindow('checking-for-update');
    });

    autoUpdater.on('update-available', (info: { version: any; }) => {
      logger.info('Update available', info);
      this.sendStatusToWindow('update-available', info);
      
      dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: `A new version (${info.version}) of AI Character Council is available.`,
        buttons: ['Download Now', 'Later'],
        defaultId: 0,
        cancelId: 1
      }).then(({ response }) => {
        if (response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
    });

    interface UpdateInfo {
        version: string;
        [key: string]: any;
    }

    autoUpdater.on('update-not-available', (info: UpdateInfo) => {
        logger.info('Update not available', info);
        this.sendStatusToWindow('update-not-available');
    });

    interface AutoUpdaterError {
      message: string;
      stack?: string;
      [key: string]: any;
    }

    autoUpdater.on('error', (err: AutoUpdaterError) => {
      logger.error('AutoUpdater error', err);
      this.sendStatusToWindow('error', err);
    });

    interface DownloadProgress {
      bytesPerSecond: number;
      percent: number;
      transferred: number;
      total: number;
    }

    autoUpdater.on('download-progress', (progressObj: DownloadProgress) => {
      const logMessage = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
      logger.info(logMessage);
      this.sendStatusToWindow('download-progress', progressObj);
    });

    interface UpdateDownloadedInfo {
      version: string;
      [key: string]: any;
    }

    autoUpdater.on('update-downloaded', (info: UpdateDownloadedInfo) => {
      logger.info('Update downloaded', info);
      this.sendStatusToWindow('update-downloaded', info);
      
      dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: `A new version (${info.version}) has been downloaded. Restart the application to apply the updates.`,
        buttons: ['Restart Now', 'Later'],
        defaultId: 0,
        cancelId: 1
      }).then(({ response }: { response: number }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall(false, true);
        }
      });
    });

    // Check for updates after a short delay to allow the app to initialize
    setTimeout(() => this.checkForUpdates(), 3000);
  }

  static checkForUpdates(): void {
    if (isDev) {
      logger.info('Skipping update check in development mode');
      return;
    }

    try {
      logger.info('Manually checking for updates');
      autoUpdater.checkForUpdates();
    } catch (error) {
      logger.error('Error checking for updates', error);
    }
  }

  private static sendStatusToWindow(status: string, data?: any): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('update-status', { status, data });
    }
  }
}