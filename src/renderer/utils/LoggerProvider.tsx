import React, { createContext, useContext, ReactNode } from 'react';
import { Logger } from '../../shared/utils/logger';

// Create the context
interface LoggerContextType {
  debug: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, error?: any, additionalData?: any) => void;
  fatal: (message: string, error?: any, additionalData?: any) => void;
  createComponentLogger: (componentName: string) => LoggerContextType;
}

const LoggerContext = createContext<LoggerContextType | null>(null);

// Create a default logger
const defaultLogger = Logger.getInstance();

// Provider component
interface LoggerProviderProps {
  children: ReactNode;
}

export const LoggerProvider: React.FC<LoggerProviderProps> = ({ children }) => {
  // Create the logger functions
  const logger: LoggerContextType = {
    debug: (message: string, data?: any) => defaultLogger.debug(message, data),
    info: (message: string, data?: any) => defaultLogger.info(message, data),
    warn: (message: string, data?: any) => defaultLogger.warn(message, data),
    error: (message: string, error?: any, additionalData?: any) => 
      defaultLogger.error(message, error, additionalData),
    fatal: (message: string, error?: any, additionalData?: any) => 
      defaultLogger.fatal(message, error, additionalData),
    
    // Function to create a component-specific logger
    createComponentLogger: (componentName: string): LoggerContextType => {
      return {
        debug: (message: string, data?: any) => 
          defaultLogger.debug(`[${componentName}] ${message}`, data),
        info: (message: string, data?: any) => 
          defaultLogger.info(`[${componentName}] ${message}`, data),
        warn: (message: string, data?: any) => 
          defaultLogger.warn(`[${componentName}] ${message}`, data),
        error: (message: string, error?: any, additionalData?: any) => 
          defaultLogger.error(`[${componentName}] ${message}`, error, additionalData),
        fatal: (message: string, error?: any, additionalData?: any) => 
          defaultLogger.fatal(`[${componentName}] ${message}`, error, additionalData),
        // This is the key: we need to make this a recursive function
        createComponentLogger: (subComponentName: string) => {
          return logger.createComponentLogger(`${componentName}:${subComponentName}`);
        }
      };
    }
  };
  
  return (
    <LoggerContext.Provider value={logger}>
      {children}
    </LoggerContext.Provider>
  );
};

// Hook to use the logger in components
export const useLogger = (): LoggerContextType => {
  const logger = useContext(LoggerContext);
  
  if (!logger) {
    // Fallback to default logger if used outside provider
    const fallbackLogger: LoggerContextType = {
      debug: defaultLogger.debug.bind(defaultLogger),
      info: defaultLogger.info.bind(defaultLogger),
      warn: defaultLogger.warn.bind(defaultLogger),
      error: defaultLogger.error.bind(defaultLogger),
      fatal: defaultLogger.fatal.bind(defaultLogger),
      createComponentLogger: (componentName: string): LoggerContextType => {
        const compLogger = {
          debug: (message: string, data?: any) => 
            defaultLogger.debug(`[${componentName}] ${message}`, data),
          info: (message: string, data?: any) => 
            defaultLogger.info(`[${componentName}] ${message}`, data),
          warn: (message: string, data?: any) => 
            defaultLogger.warn(`[${componentName}] ${message}`, data),
          error: (message: string, error?: any, additionalData?: any) => 
            defaultLogger.error(`[${componentName}] ${message}`, error, additionalData),
          fatal: (message: string, error?: any, additionalData?: any) => 
            defaultLogger.fatal(`[${componentName}] ${message}`, error, additionalData),
          createComponentLogger: (subComponentName: string): LoggerContextType => {
            return fallbackLogger.createComponentLogger(`${componentName}:${subComponentName}`);
          }
        };
        return compLogger;
      }
    };
    return fallbackLogger;
  }
  
  return logger;
};

// Higher-order component to provide a component-specific logger
export function withLogger<P extends object>(
  Component: React.ComponentType<P & { logger: LoggerContextType }>,
  componentName?: string
): React.FC<P> {
  const displayName = componentName || Component.displayName || Component.name || 'Component';
  
  const ComponentWithLogger: React.FC<P> = (props) => {
    const logger = useLogger();
    const componentLogger = logger.createComponentLogger(displayName);
    
    return <Component {...props} logger={componentLogger} />;
  };
  
  ComponentWithLogger.displayName = `WithLogger(${displayName})`;
  
  return ComponentWithLogger;
}