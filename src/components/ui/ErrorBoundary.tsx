import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in PaisaPilot UI:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('paisapilot_state_v1');
    } catch (err) {
      console.warn('Failed to clear stored state on reset:', err);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080d1a] text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-xs text-slate-400 mb-4">
              PaisaPilot encountered an unexpected rendering error. You can recover immediately by reloading with clean state.
            </p>
            {this.state.error && (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-rose-400 font-mono text-left mb-5 overflow-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <div className="flex justify-center gap-3">
              <Button variant="primary" size="sm" onClick={this.handleReset} className="gap-2">
                <RefreshCw className="h-3.5 w-3.5" />
                Reset & Reload
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
