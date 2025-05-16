import React, { useState, useEffect } from 'react';
import { useLogger } from '../utils/LoggerProvider';


// Remove duplicate Window interface extension; defined elsewhere in the project

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
}

interface LogViewerProps {
  initialLines?: number;
  minLevel?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

export const LogViewer: React.FC<LogViewerProps> = ({
  initialLines = 100,
  minLevel = 'info',
  autoRefresh = false,
  refreshInterval = 5000,
  className = '',
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>(minLevel);
  
  const logger = useLogger().createComponentLogger('LogViewer');
  
  // Fetch logs from the main process
  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      if (!window.electron?.getLogs) {
        throw new Error('Log retrieval not available');
      }
      
      const response = await window.electron.getLogs({
        limit: initialLines,
        minLevel: selectedLevel
      });
      
      if (response && Array.isArray(response)) {
        setLogs(response);
        setError(null);
      } else {
        setError('Invalid log data received');
        logger.warn('Invalid log data received', response);
      }
    } catch (err) {
      setError(`Failed to load logs: ${err instanceof Error ? err.message : String(err)}`);
      logger.error('Failed to load logs', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch and set up auto-refresh if enabled
  useEffect(() => {
    fetchLogs();
    
    let refreshTimer: NodeJS.Timeout | undefined;
    
    if (autoRefresh) {
      refreshTimer = setInterval(fetchLogs, refreshInterval);
    }
    
    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [selectedLevel, initialLines, autoRefresh, refreshInterval]);
  
  // Filter logs based on search term
  const filteredLogs = logs.filter(log => {
    if (!filter) return true;
    
    const searchTerm = filter.toLowerCase();
    return (
      log.message.toLowerCase().includes(searchTerm) ||
      (log.data && JSON.stringify(log.data).toLowerCase().includes(searchTerm))
    );
  });
  
  // Format data for display
  const formatData = (data: any): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  };
  
  // Get log level color
  const getLevelColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'debug':
        return 'text-gray-500';
      case 'info':
        return 'text-blue-600';
      case 'warn':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'fatal':
        return 'text-red-800 font-bold';
      default:
        return 'text-gray-800';
    }
  };
  
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Application Logs</h2>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Filter logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="debug">Debug & Above</option>
            <option value="info">Info & Above</option>
            <option value="warn">Warning & Above</option>
            <option value="error">Error & Above</option>
            <option value="fatal">Fatal Only</option>
          </select>
          
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading logs...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No logs found</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {log.message}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {log.data && (
                      <details className="cursor-pointer">
                        <summary className="text-blue-500 hover:text-blue-700">View Details</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40 text-xs whitespace-pre-wrap">
                          {formatData(log.data)}
                        </pre>
                      </details>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};