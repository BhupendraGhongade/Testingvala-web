import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Wifi, WifiOff, Database, Settings, ExternalLink } from 'lucide-react';
import { testSupabaseConnection, getSupabaseStatus, quickHealthCheck } from '../lib/supabase';

const ConnectionDiagnostics = ({ onRetry }) => {
  const [diagnostics, setDiagnostics] = useState({
    loading: true,
    supabaseStatus: null,
    connectionTest: null,
    healthCheck: null,
    suggestions: []
  });

  const runDiagnostics = async () => {
    setDiagnostics(prev => ({ ...prev, loading: true }));
    
    try {
      // Get basic status
      const status = getSupabaseStatus();
      
      // Run connection test
      const connectionTest = await testSupabaseConnection();
      
      // Run health check
      const healthCheck = await quickHealthCheck();
      
      // Generate suggestions
      const suggestions = generateSuggestions(status, connectionTest, healthCheck);
      
      setDiagnostics({
        loading: false,
        supabaseStatus: status,
        connectionTest,
        healthCheck,
        suggestions
      });
    } catch (error) {
      setDiagnostics({
        loading: false,
        supabaseStatus: null,
        connectionTest: { success: false, error: error.message },
        healthCheck: { healthy: false, reason: error.message },
        suggestions: ['Check browser console for detailed error messages']
      });
    }
  };

  const generateSuggestions = (status, connectionTest, healthCheck) => {
    const suggestions = [];
    
    if (!status.client) {
      suggestions.push('Supabase client not initialized - check environment variables');
    }
    
    if (status.status === 'missing_config') {
      suggestions.push('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file');
    }
    
    if (connectionTest && !connectionTest.success) {
      if (connectionTest.error?.includes('timeout')) {
        suggestions.push('Connection timeout - check if Supabase is running locally (npx supabase start)');
      } else if (connectionTest.error?.includes('fetch')) {
        suggestions.push('Network error - check internet connection or local Supabase instance');
      } else {
        suggestions.push('Database connection failed - verify Supabase configuration');
      }
    }
    
    if (!healthCheck?.healthy) {
      suggestions.push('Health check failed - the application will use fallback mode');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('All systems operational - using database connection');
    }
    
    return suggestions;
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (success, loading = false) => {
    if (loading) return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />;
    if (success) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusColor = (success) => {
    return success ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Database className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Connection Diagnostics</h2>
          <p className="text-gray-600">Checking system connectivity and configuration</p>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg border ${getStatusColor(diagnostics.supabaseStatus?.client)}`}>
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(diagnostics.supabaseStatus?.client, diagnostics.loading)}
            <span className="font-semibold">Client Status</span>
          </div>
          <p className="text-sm">
            {diagnostics.loading ? 'Checking...' : 
             diagnostics.supabaseStatus?.client ? 'Initialized' : 'Not Available'}
          </p>
        </div>

        <div className={`p-4 rounded-lg border ${getStatusColor(diagnostics.connectionTest?.success)}`}>
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(diagnostics.connectionTest?.success, diagnostics.loading)}
            <span className="font-semibold">Connection</span>
          </div>
          <p className="text-sm">
            {diagnostics.loading ? 'Testing...' : 
             diagnostics.connectionTest?.success ? 'Connected' : 'Failed'}
          </p>
        </div>

        <div className={`p-4 rounded-lg border ${getStatusColor(diagnostics.healthCheck?.healthy)}`}>
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(diagnostics.healthCheck?.healthy, diagnostics.loading)}
            <span className="font-semibold">Health Check</span>
          </div>
          <p className="text-sm">
            {diagnostics.loading ? 'Checking...' : 
             diagnostics.healthCheck?.healthy ? 'Healthy' : 'Degraded'}
          </p>
        </div>
      </div>

      {/* Detailed Information */}
      {!diagnostics.loading && (
        <div className="space-y-4">
          {/* Environment Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Environment Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Environment:</span> {diagnostics.supabaseStatus?.environment || 'Unknown'}
              </div>
              <div>
                <span className="font-medium">Database URL:</span> {diagnostics.supabaseStatus?.url || 'Not configured'}
              </div>
              <div>
                <span className="font-medium">Connection Status:</span> {diagnostics.supabaseStatus?.status || 'Unknown'}
              </div>
              <div>
                <span className="font-medium">Fallback Mode:</span> {diagnostics.connectionTest?.fallbackMode ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          {/* Error Details */}
          {diagnostics.connectionTest && !diagnostics.connectionTest.success && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Connection Error
              </h3>
              <p className="text-red-700 text-sm mb-2">{diagnostics.connectionTest.error}</p>
              {diagnostics.connectionTest.suggestion && (
                <p className="text-red-600 text-sm font-medium">
                  💡 {diagnostics.connectionTest.suggestion}
                </p>
              )}
            </div>
          )}

          {/* Suggestions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              Recommendations
            </h3>
            <ul className="space-y-2">
              {diagnostics.suggestions.map((suggestion, index) => (
                <li key={index} className="text-blue-700 text-sm flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={runDiagnostics}
              disabled={diagnostics.loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${diagnostics.loading ? 'animate-spin' : ''}`} />
              Re-run Diagnostics
            </button>
            
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Continue Anyway
              </button>
            )}
            
            <a
              href="https://supabase.com/docs/guides/getting-started/local-development"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Setup Guide
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionDiagnostics;