import React from 'react';

// Catches render crashes in a page so the app shows the error instead of a blank white screen.
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-red-200 space-y-3">
        <h3 className="text-lg font-semibold text-red-700">Something went wrong on this page</h3>
        <p className="text-sm text-gray-600">Please send this message to support:</p>
        <pre className="text-xs bg-red-50 text-red-800 p-3 rounded overflow-x-auto whitespace-pre-wrap">
          {String(error?.message || error)}
          {error?.stack ? '\n\n' + error.stack.split('\n').slice(0, 6).join('\n') : ''}
        </pre>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
          Reload
        </button>
      </div>
    );
  }
}
