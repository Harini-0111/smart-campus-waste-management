import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="text-red-500" size={32} />
                        </div>

                        <h1 className="text-2xl font-black text-slate-950 mb-3">Something went wrong</h1>

                        <p className="text-slate-500 text-sm mb-8">
                            The application encountered an unexpected error. This might be due to a connectivity issue or a data glitch.
                        </p>

                        <div className="p-4 bg-slate-50 rounded-xl mb-8 text-left overflow-auto max-h-32">
                            <code className="text-[10px] font-mono text-slate-600 break-all">
                                {this.state.error?.message || 'Unknown Error'}
                            </code>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-slate-950 hover:bg-slate-900 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                        >
                            <RotateCcw size={16} />
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
