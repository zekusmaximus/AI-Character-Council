import { useState } from 'react';

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">AI Character Council</h1>
        <p className="text-gray-600 mb-6">Speculative Fiction Character Management</p>
        
        <button 
          onClick={testConnection}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
        >
          Test Electron Connection
        </button>
        
        {status && (
          <p className="mt-4 text-sm text-gray-700 p-2 bg-gray-100 rounded">
            {status}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;