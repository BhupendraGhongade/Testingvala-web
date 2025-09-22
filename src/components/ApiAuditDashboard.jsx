import React, { useState, useEffect } from 'react';
import { getApiStats, generateApiReport, clearApiLogs, exportApiData } from '../utils/globalApiLogger';
import { AlertTriangle, CheckCircle, Activity, Download, Trash2, RefreshCw, BarChart3, Clock, Zap } from 'lucide-react';

const ApiAuditDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const updateStats = () => {
      setStats(getApiStats());
    };

    updateStats();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(updateStats, 2000);
    }

    // Show dashboard on Ctrl+Shift+D
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [autoRefresh]);

  const handleExport = () => {
    const data = exportApiData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-audit-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateReport = () => {
    generateApiReport();
  };

  const handleClear = () => {
    clearApiLogs();
    setStats(getApiStats());
  };

  if (!import.meta.env.DEV || !isVisible || !stats) return null;

  const { summary, byEndpoint, byComponent, duplicates } = stats;
  const hasIssues = summary.totalDuplicates > 0;

  return (
    <div className="fixed top-4 left-4 bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999] max-w-2xl w-full max-h-[80vh] overflow-hidden">
      {/* Header */}
      <div className={`p-4 border-b ${hasIssues ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {hasIssues ? (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-600" />
            )}
            <div>
              <h3 className="font-bold text-lg">API Audit Dashboard</h3>
              <p className={`text-sm ${hasIssues ? 'text-red-700' : 'text-green-700'}`}>
                {hasIssues ? `${summary.totalDuplicates} duplicate calls found` : 'No issues detected'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.totalCalls}</div>
            <div className="text-xs text-gray-600">Total Calls</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{summary.uniqueEndpoints}</div>
            <div className="text-xs text-gray-600">Endpoints</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${hasIssues ? 'text-red-600' : 'text-green-600'}`}>
              {summary.totalDuplicates}
            </div>
            <div className="text-xs text-gray-600">Duplicates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{summary.callsPerMinute}</div>
            <div className="text-xs text-gray-600">Calls/Min</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {/* Duplicate Issues */}
        {hasIssues && (
          <div className="p-4 border-b border-gray-200 bg-red-50">
            <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Duplicate API Calls (Issues)
            </h4>
            <div className="space-y-1">
              {Object.entries(duplicates).map(([endpoint, count]) => (
                <div key={endpoint} className="text-sm">
                  <span className="font-mono text-red-700">{endpoint}</span>
                  <span className="ml-2 bg-red-200 text-red-800 px-2 py-0.5 rounded text-xs">
                    {count} duplicates
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Component Breakdown */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Calls by Component
          </h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {Object.entries(byComponent)
              .sort(([,a], [,b]) => b.count - a.count)
              .slice(0, 10)
              .map(([component, data]) => (
                <div key={component} className="flex justify-between text-sm">
                  <span className="font-mono text-gray-700">{component}</span>
                  <span className="text-gray-600">{data.count} calls</span>
                </div>
              ))}
          </div>
        </div>

        {/* Endpoint Breakdown */}
        <div className="p-4">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Top Endpoints
          </h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {Object.entries(byEndpoint)
              .sort(([,a], [,b]) => b.count - a.count)
              .slice(0, 10)
              .map(([endpoint, data]) => (
                <div key={endpoint} className="flex justify-between text-sm">
                  <span className="font-mono text-gray-700 truncate flex-1 mr-2">
                    {endpoint}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{data.count}</span>
                    {data.duplicates > 0 && (
                      <span className="bg-red-100 text-red-800 px-1 py-0.5 rounded text-xs">
                        {data.duplicates} dups
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateReport}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              <BarChart3 className="w-3 h-3" />
              Report
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              <Download className="w-3 h-3" />
              Export
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          Press Ctrl+Shift+D to toggle • Session: {Math.round(summary.sessionDuration / 60)}m
        </div>
      </div>
    </div>
  );
};

export default ApiAuditDashboard;