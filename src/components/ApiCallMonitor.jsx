import React, { useState, useEffect } from 'react';
import { getApiCallStats, clearApiCallLog } from '../utils/apiLogger';
import { getCacheStats } from '../utils/apiCache';

const ApiCallMonitor = () => {
  const [stats, setStats] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const updateStats = () => {
      setStats(getApiCallStats());
      setCacheStats(getCacheStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);

    // Show monitor on Ctrl+Shift+A
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!import.meta.env.DEV || !isVisible || !stats) return null;

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg z-[9999] max-w-sm text-xs font-mono">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">API Monitor</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong>Total Calls:</strong> {stats.totalCalls}
        </div>
        <div>
          <strong>Duplicates:</strong> <span className={stats.duplicates > 0 ? 'text-red-400' : 'text-green-400'}>
            {stats.duplicates}
          </span>
        </div>
        <div>
          <strong>Unique Endpoints:</strong> {stats.uniqueEndpoints}
        </div>
        
        {cacheStats && (
          <div>
            <strong>Cache Size:</strong> {cacheStats.size}
          </div>
        )}
        
        <div className="border-t border-gray-600 pt-2">
          <strong>By Component:</strong>
          {Object.entries(stats.byComponent).map(([comp, count]) => (
            <div key={comp} className="ml-2">
              {comp}: {count}
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-600 pt-2">
          <strong>By Endpoint:</strong>
          {Object.entries(stats.byEndpoint).map(([endpoint, count]) => (
            <div key={endpoint} className="ml-2">
              {endpoint}: <span className={count > 1 ? 'text-yellow-400' : 'text-green-400'}>
                {count}
              </span>
            </div>
          ))}
        </div>
        
        <button 
          onClick={clearApiCallLog}
          className="w-full mt-2 bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
        >
          Clear Log
        </button>
      </div>
      
      <div className="text-gray-400 text-xs mt-2">
        Press Ctrl+Shift+A to toggle
      </div>
    </div>
  );
};

export default ApiCallMonitor;