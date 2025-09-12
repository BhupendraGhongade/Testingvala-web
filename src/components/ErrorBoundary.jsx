import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    try {
      const payload = {
        error: (error && error.toString()) || String(error),
        stack: errorInfo?.componentStack || null,
        time: new Date().toISOString()
      };
      localStorage.setItem('last_app_error', JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to persist error to localStorage', e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            
            {this.state.error && (
              <div className="text-left mb-6">
                <div className="bg-gray-100 p-4 rounded text-xs text-gray-600 overflow-auto max-h-56">
                  <div className="font-semibold mb-1">Error:</div>
                  <div className="mb-3 whitespace-pre-wrap">{this.state.error.toString()}</div>
                  {this.state.errorInfo && (
                    <>
                      <div className="font-semibold mb-1">Stack Trace:</div>
                      <div className="whitespace-pre-wrap mb-3">{this.state.errorInfo.componentStack}</div>
                    </>
                  )}

                  <div className="font-semibold mb-1">Persisted debug payload (localStorage: last_app_error)</div>
                  <pre className="bg-white p-3 rounded text-xs text-gray-700 overflow-auto max-h-40">{(() => {
                    try {
                      const raw = localStorage.getItem('last_app_error');
                      return raw ? JSON.stringify(JSON.parse(raw), null, 2) : 'No persisted payload found.';
                    } catch {
                      return 'Failed to read last_app_error from localStorage.';
                    }
                  })()}</pre>

                  <div className="mt-3 flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        try {
                          const payload = localStorage.getItem('last_app_error') || JSON.stringify({ error: this.state.error.toString(), stack: this.state.errorInfo?.componentStack });
                          navigator.clipboard?.writeText(payload);
                          alert('Error details copied to clipboard.');
                        } catch {
                          alert('Failed to copy. Open devtools console for more details.');
                        }
                      }}
                      className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
                    >
                      Copy details
                    </button>
                    <button
                      onClick={() => {
                        try {
                          const payload = localStorage.getItem('last_app_error') || JSON.stringify({ error: this.state.error.toString(), stack: this.state.errorInfo?.componentStack });
                          const blob = new Blob([payload], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'last_app_error.json';
                          a.click();
                        } catch {
                          alert('Failed to download error details.');
                        }
                      }}
                      className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
                    >
                      Download JSON
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-[#FF6600] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#E55A00] transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
