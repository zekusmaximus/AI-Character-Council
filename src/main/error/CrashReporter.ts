// src/main/error/CrashReporter.ts
import pkg from 'electron';
const { app, crashReporter } = pkg;
import * as fs from 'fs';
import * as path from 'path';
import { createLogger } from '../../shared/utils/logger.js';

const logger = createLogger('CrashReporter');

export class CrashReporter {
  private static instance: CrashReporter;
  private crashesDir: string;

  private constructor() {
    const userDataPath = app.getPath('userData');
    this.crashesDir = path.join(userDataPath, 'crashes');

    // Ensure crash directory exists
    if (!fs.existsSync(this.crashesDir)) {
      fs.mkdirSync(this.crashesDir, { recursive: true });
    }

    logger.info('Crash reporter initialized');
  }

  static getInstance(): CrashReporter {
    if (!CrashReporter.instance) {
      CrashReporter.instance = new CrashReporter();
    }
    return CrashReporter.instance;
  }

  saveCrashReport(error: Error, additionalInfo: any = {}): string {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `crash-${timestamp}.json`;
      const filePath = path.join(this.crashesDir, filename);

      // Create crash report
      const report = {
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        systemInfo: {
          platform: process.platform,
          arch: process.arch,
          version: app.getVersion(),
          electronVersion: process.versions.electron,
          nodeVersion: process.versions.node
        },
        additionalInfo
      };

      // Save to file
      fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8');
      logger.info(`Crash report saved: ${filename}`);

      return filePath;
    } catch (err) {
      logger.error('Failed to save crash report', err);
      return '';
    }
  }

  getRecentCrashes(limit: number = 10): any[] {
    try {
      const files = fs.readdirSync(this.crashesDir)
        .filter(file => file.startsWith('crash-') && file.endsWith('.json'))
        .sort()
        .reverse()
        .slice(0, limit);

      return files.map(file => {
        const filePath = path.join(this.crashesDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
      });
    } catch (err) {
      logger.error('Failed to read crash reports', err);
      return [];
    }
  }
}