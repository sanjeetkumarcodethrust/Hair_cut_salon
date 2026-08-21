import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/50 max-w-md w-full">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Oops! Something went wrong.</h2>
            <p className="text-sm text-slate-600 mb-6">
              We encountered an unexpected error while rendering this page.
            </p>
            <button
              onClick={this.handleRetry}
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 w-full"
            >
              Retry & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
