import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full min-h-[50vh] w-full flex-col items-center justify-center p-6 text-center">
          <div className="mb-6 inline-flex rounded-full bg-rose-100 p-4 text-rose-600 ring-8 ring-rose-50">
            <AlertTriangle size={32} />
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-900">Something went wrong</h2>
          <p className="mb-6 max-w-md text-sm text-slate-500">
            A rendering error occurred in this module. This could be due to missing data or an unexpected API response.
          </p>
          {this.state.error && (
            <div className="mb-6 w-full max-w-2xl overflow-auto rounded-xl bg-slate-50 p-4 text-left text-xs font-mono text-rose-600 shadow-inner">
              {this.state.error.toString()}
            </div>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <RefreshCw size={16} />
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
