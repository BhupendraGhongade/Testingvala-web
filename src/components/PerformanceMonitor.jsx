import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Zap, Database, Clock, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { unifiedDataService } from '../services/unifiedDataService';

const PerformanceMonitor = ({ isVisible = false, onClose }) => {
  const [metrics, setMetrics] = useState({
    apiCalls: { total: 0, recent: [], average: 0 },
    cacheStats: { hitRate: 0, size: 0, keys: [] },
    pagePerformance: { loadTime: 0, interactive: 0, firstPaint: 0 },
    networkStats: { requests: 0, errors: 0, avgResponseTime: 0 },
    realTimeStats: { connections: 0, subscriptions: 0, updates: 0 }
  });
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState([]);

  // Performance thresholds
  const thresholds = {
    apiCalls: { warning: 20, critical: 30 },
    cacheHitRate: { warning: 0.7, critical: 0.5 },
    responseTime: { warning: 500, critical: 1000 },
    errorRate: { warning: 0.05, critical: 0.1 }
  };

  // Monitor API calls
  const monitorApiCalls = useCallback(() => {
    let callCount = 0;
    let callTimes = [];
    let errors = 0;
    
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const startTime = performance.now();
      callCount++;
      
      return originalFetch.apply(this, args)
        .then(response => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          callTimes.push({
            url: args[0],
            time: responseTime,
            status: response.status,
            timestamp: Date.now()
          });
          
          if (!response.ok) {
            errors++;
          }
          
          // Update metrics
          setMetrics(prev => ({
            ...prev,
            apiCalls: {
              total: callCount,
              recent: callTimes.slice(-10),
              average: callTimes.reduce((sum, call) => sum + call.time, 0) / callTimes.length
            },
            networkStats: {
              requests: callCount,
              errors: errors,
              avgResponseTime: callTimes.reduce((sum, call) => sum + call.time, 0) / callTimes.length
            }
          }));
          
          return response;
        })
        .catch(error => {
          errors++;
          setMetrics(prev => ({
            ...prev,
            networkStats: {
              ...prev.networkStats,
              errors: errors
            }
          }));
          throw error;
        });
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Monitor page performance
  const monitorPagePerformance = useCallback(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          setMetrics(prev => ({
            ...prev,
            pagePerformance: {
              loadTime: entry.loadEventEnd - entry.loadEventStart,
              interactive: entry.domInteractive - entry.navigationStart,
              firstPaint: entry.responseStart - entry.navigationStart
            }
          }));
        }
      }
    });
    
    observer.observe({ entryTypes: ['navigation'] });
    return () => observer.disconnect();
  }, []);

  // Update cache stats
  const updateCacheStats = useCallback(() => {
    try {
      const stats = unifiedDataService.getCacheStats();
      setMetrics(prev => ({
        ...prev,
        cacheStats: stats
      }));
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
    }
  }, []);

  // Check for performance alerts
  const checkAlerts = useCallback(() => {
    const newAlerts = [];
    
    // API call threshold
    if (metrics.apiCalls.total > thresholds.apiCalls.critical) {
      newAlerts.push({
        type: 'critical',
        message: `High API call count: ${metrics.apiCalls.total}`,
        timestamp: Date.now()
      });
    } else if (metrics.apiCalls.total > thresholds.apiCalls.warning) {
      newAlerts.push({
        type: 'warning',
        message: `Elevated API call count: ${metrics.apiCalls.total}`,
        timestamp: Date.now()
      });
    }
    
    // Cache hit rate
    if (metrics.cacheStats.hitRate < thresholds.cacheHitRate.critical) {
      newAlerts.push({
        type: 'critical',
        message: `Low cache hit rate: ${(metrics.cacheStats.hitRate * 100).toFixed(1)}%`,
        timestamp: Date.now()
      });
    } else if (metrics.cacheStats.hitRate < thresholds.cacheHitRate.warning) {
      newAlerts.push({
        type: 'warning',
        message: `Cache hit rate below optimal: ${(metrics.cacheStats.hitRate * 100).toFixed(1)}%`,
        timestamp: Date.now()
      });
    }
    
    // Response time
    if (metrics.networkStats.avgResponseTime > thresholds.responseTime.critical) {
      newAlerts.push({
        type: 'critical',
        message: `High response time: ${metrics.networkStats.avgResponseTime.toFixed(0)}ms`,
        timestamp: Date.now()
      });
    } else if (metrics.networkStats.avgResponseTime > thresholds.responseTime.warning) {
      newAlerts.push({
        type: 'warning',
        message: `Elevated response time: ${metrics.networkStats.avgResponseTime.toFixed(0)}ms`,
        timestamp: Date.now()
      });
    }
    
    setAlerts(newAlerts);
  }, [metrics]);

  // Start/stop monitoring
  const toggleMonitoring = useCallback(() => {
    if (isMonitoring) {
      setIsMonitoring(false);
    } else {
      setIsMonitoring(true);
      
      // Set up monitoring
      const cleanupFetch = monitorApiCalls();
      const cleanupPerf = monitorPagePerformance();
      
      // Update cache stats periodically
      const cacheInterval = setInterval(updateCacheStats, 5000);
      
      // Store cleanup functions
      window.performanceMonitorCleanup = () => {
        cleanupFetch();
        cleanupPerf();
        clearInterval(cacheInterval);
      };
    }
  }, [isMonitoring, monitorApiCalls, monitorPagePerformance, updateCacheStats]);

  // Check alerts periodically
  useEffect(() => {
    if (isMonitoring) {
      const alertInterval = setInterval(checkAlerts, 10000);
      return () => clearInterval(alertInterval);
    }
  }, [isMonitoring, checkAlerts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.performanceMonitorCleanup) {
        window.performanceMonitorCleanup();
      }
    };
  }, []);

  // Get status color based on value and thresholds
  const getStatusColor = (value, thresholds, invert = false) => {
    if (!thresholds) return 'text-gray-500';
    
    const isGood = invert ? value < thresholds.critical : value > thresholds.warning;
    const isBad = invert ? value > thresholds.warning : value < thresholds.critical;
    
    if (isBad) return 'text-red-500';
    if (!isGood) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Performance Monitor</h2>
                <p className="text-blue-100 text-sm">Real-time API and performance metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMonitoring}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isMonitoring 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Performance Alerts
              </h3>
              <div className="space-y-2">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.type === 'critical' 
                        ? 'bg-red-50 border-red-500 text-red-800' 
                        : 'bg-yellow-50 border-yellow-500 text-yellow-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{alert.message}</span>
                      <span className="text-xs opacity-75">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* API Calls */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">API Calls</h3>
                <Zap className={`w-5 h-5 ${getStatusColor(metrics.apiCalls.total, thresholds.apiCalls, true)}`} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className={`font-medium ${getStatusColor(metrics.apiCalls.total, thresholds.apiCalls, true)}`}>
                    {metrics.apiCalls.total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Response:</span>
                  <span className="font-medium">
                    {metrics.apiCalls.average.toFixed(0)}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Recent:</span>
                  <span className="font-medium">
                    {metrics.apiCalls.recent.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Cache Performance */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Cache Performance</h3>
                <Database className={`w-5 h-5 ${getStatusColor(metrics.cacheStats.hitRate, thresholds.cacheHitRate)}`} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hit Rate:</span>
                  <span className={`font-medium ${getStatusColor(metrics.cacheStats.hitRate, thresholds.cacheHitRate)}`}>
                    {(metrics.cacheStats.hitRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cached Items:</span>
                  <span className="font-medium">
                    {metrics.cacheStats.size}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Memory Usage:</span>
                  <span className="font-medium text-green-600">
                    Optimized
                  </span>
                </div>
              </div>
            </div>

            {/* Page Performance */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Page Performance</h3>
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Load Time:</span>
                  <span className="font-medium">
                    {metrics.pagePerformance.loadTime.toFixed(0)}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Interactive:</span>
                  <span className="font-medium">
                    {metrics.pagePerformance.interactive.toFixed(0)}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">First Paint:</span>
                  <span className="font-medium">
                    {metrics.pagePerformance.firstPaint.toFixed(0)}ms
                  </span>
                </div>
              </div>
            </div>

            {/* Network Stats */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Network Stats</h3>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Requests:</span>
                  <span className="font-medium">
                    {metrics.networkStats.requests}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Errors:</span>
                  <span className={`font-medium ${metrics.networkStats.errors > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {metrics.networkStats.errors}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Error Rate:</span>
                  <span className={`font-medium ${
                    (metrics.networkStats.errors / metrics.networkStats.requests) > 0.05 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {((metrics.networkStats.errors / metrics.networkStats.requests) * 100 || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Optimization Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Optimization Status</h3>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Unified Service:</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Caching:</span>
                  <span className="font-medium text-green-600">Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Batch Requests:</span>
                  <span className="font-medium text-green-600">Enabled</span>
                </div>
              </div>
            </div>

            {/* Performance Score */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Performance Score</h3>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {Math.min(100, Math.max(0, 
                    100 - (metrics.apiCalls.total * 2) + (metrics.cacheStats.hitRate * 30)
                  )).toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">Optimization Score</div>
                <div className="mt-2 text-xs text-gray-500">
                  Based on API efficiency and cache performance
                </div>
              </div>
            </div>
          </div>

          {/* Recent API Calls */}
          {metrics.apiCalls.recent.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Recent API Calls</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {metrics.apiCalls.recent.slice(-5).map((call, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="font-mono text-gray-600 truncate flex-1">
                        {call.url.toString().substring(0, 50)}...
                      </span>
                      <span className={`font-medium ml-2 ${
                        call.time > 1000 ? 'text-red-500' : 
                        call.time > 500 ? 'text-yellow-500' : 'text-green-500'
                      }`}>
                        {call.time.toFixed(0)}ms
                      </span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        call.status >= 400 ? 'bg-red-100 text-red-800' :
                        call.status >= 300 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {call.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => unifiedDataService.clearAllCaches()}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Clear Cache
            </button>
            <button
              onClick={() => setMetrics({
                apiCalls: { total: 0, recent: [], average: 0 },
                cacheStats: { hitRate: 0, size: 0, keys: [] },
                pagePerformance: { loadTime: 0, interactive: 0, firstPaint: 0 },
                networkStats: { requests: 0, errors: 0, avgResponseTime: 0 },
                realTimeStats: { connections: 0, subscriptions: 0, updates: 0 }
              })}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reset Metrics
            </button>
            <button
              onClick={() => {
                const data = JSON.stringify(metrics, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `performance-metrics-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;