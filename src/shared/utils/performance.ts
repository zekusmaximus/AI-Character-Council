// src/shared/utils/performance.ts
import { createLogger } from './logger';

const logger = createLogger('Performance');
const performanceThresholds = {
  database: 100, // ms
  api: 500, // ms
  llm: 5000, // ms
  ui: 50 // ms
};

export function trackPerformance<T>(
  category: keyof typeof performanceThresholds,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  
  return fn().then(result => {
    const duration = performance.now() - startTime;
    const threshold = performanceThresholds[category];
    
    if (duration > threshold) {
      logger.warn(`${category.toUpperCase()} operation "${operation}" is slow (${duration.toFixed(2)}ms)`, {
        category,
        operation,
        duration,
        threshold
      });
    } else {
      logger.debug(`${category.toUpperCase()} operation "${operation}" completed in ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }).catch(error => {
    const duration = performance.now() - startTime;
    
    logger.error(`${category.toUpperCase()} operation "${operation}" failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  });
}