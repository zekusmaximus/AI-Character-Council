import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Import error handling
import { createLogger } from '../shared/utils/logger.ts';

// Configure renderer logger
const logger = createLogger('Renderer');
logger.info('Renderer process starting');

// Create root element if it doesn't exist
const rootElement = document.getElementById('root');
if (!rootElement) {
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
  logger.warn('Root element not found, created new root');
}

// Render the application
try {
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  logger.info('Application rendered successfully');
} catch (error) {
  logger.error('Failed to render application', error);
  
  // Show fallback UI for critical render errors
  const errorRoot = document.getElementById('root');
  if (errorRoot) {
    errorRoot.innerHTML = `
      <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; color: #444;">
        <h1 style="color: #e53e3e; margin-bottom: 1rem;">Application Failed to Start</h1>
        <p style="max-width: 500px; text-align: center; margin-bottom: 2rem;">
          The application encountered a critical error during startup. Please restart the application.
        </p>
        <button 
          style="background-color: #3182ce; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;"
          onclick="window.location.reload()"
        >
          Reload Application
        </button>
      </div>
    `;
  }
}