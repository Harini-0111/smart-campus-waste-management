import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Unhandled UI error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
                    <h1 className="text-2xl font-black text-slate-900 mb-3">
                        Something went wrong
                    </h1>
                    <p className="text-sm text-slate-500 mb-6">
                        The system is temporarily unable to load this view.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition"
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
