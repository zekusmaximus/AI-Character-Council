import React, { useState } from 'react';
import './App.css';

function App() {
  const [status, setStatus] = useState<string>('');

  const testConnection = async () => {
    try {
      // @ts-ignore - electron is defined in the preload script
      const response = await window.electron.ping();
      setStatus(`Connection successful: ${response}`);
    } catch (error) {
      setStatus(`Connection failed: ${error}`);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Character Council</h1>
        <p>Speculative Fiction Character Management</p>
        <button onClick={testConnection}>
          Test Electron Connection
        </button>
        <p>{status}</p>
      </header>
    </div>
  );
}

export default App;