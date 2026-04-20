'use client';

import { Component } from 'react';
import Link from 'next/link';

/**
 * Enhanced Global Error Boundary
 * Catches all React component errors and displays a user-friendly fallback UI
 */
export default class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('🚨 Error caught by Global Error Boundary:', error);
    console.error('Error Info:', errorInfo);
    
    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to backend in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToBackend(error, errorInfo);
    }

    // If too many errors, suggest page reload
    if (this.state.errorCount > 3) {
      console.warn('⚠️ Multiple errors detected. Suggest user to reload page.');
    }
  }

  logErrorToBackend = async (error, errorInfo) => {
    try {
      const errorData = {
        message: error.toString(),
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // Uncomment to send to error logging service
      // await fetch('/api/logs/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // });
    } catch (err) {
      console.warn('Failed to log error to backend:', err);
    }
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorCount: 0 });
  };

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <html>
          <body>
            <main className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center px-4">
              <div className="max-w-2xl w-full">
                {/* Error Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                  {/* Error Icon */}
                  <div className="text-6xl text-center mb-6">
                    🚨
                  </div>

                  {/* Error Title */}
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
                    Oops! Something went wrong
                  </h1>

                  {/* Error Description */}
                  <p className="text-lg text-gray-600 text-center mb-6">
                    We're sorry for the inconvenience. Our team has been notified and is working to fix the issue.
                  </p>

                  {/* Error Details (Development only) */}
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded">
                      <p className="text-sm font-mono text-red-800 break-words">
                        <span className="font-bold">Error:</span> {this.state.error.toString()}
                      </p>
                      {this.state.error.stack && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm font-semibold text-red-700 hover:text-red-900">
                            Stack Trace
                          </summary>
                          <pre className="mt-2 text-xs bg-red-100 p-3 overflow-auto rounded font-mono text-red-800">
                            {this.state.error.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={this.handleReset}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg transform hover:scale-105"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={this.handleReload}
                      className="px-8 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-all"
                    >
                      Go Home
                    </button>
                  </div>

                  {/* Help Section */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <p className="text-center text-sm text-gray-600 mb-4">
                      Need help? Try these:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <a
                        href="/dashboard"
                        className="text-center text-sm text-blue-600 hover:underline"
                      >
                        📊 Dashboard
                      </a>
                      <a
                        href="/docs"
                        className="text-center text-sm text-blue-600 hover:underline"
                      >
                        📖 Documentation
                      </a>
                      <a
                        href="/"
                        className="text-center text-sm text-blue-600 hover:underline"
                      >
                        🏠 Home
                      </a>
                    </div>
                  </div>

                  {/* Error Reference */}
                  <p className="text-xs text-gray-500 text-center mt-8">
                    Error Reference: {new Date().toISOString()}
                  </p>
                </div>
              </div>
            </main>
          </body>
        </html>
      );
    }

    return this.props.children;
  }
}
