import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100">
            <div className="p-6 bg-red-500 flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-white" />
              <h2 className="text-xl font-bold text-white">Something went wrong</h2>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Details</h3>
              <p className="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-lg border border-red-100 font-mono overflow-auto max-h-40">
                {this.state.error?.message || 'Unknown error'}
              </p>
              
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl w-full justify-center"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Application
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
