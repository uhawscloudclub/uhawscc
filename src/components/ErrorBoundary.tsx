import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
    children: ReactNode;
};

type State = {
    hasError: boolean;
};

class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        if (import.meta.env.DEV) {
            console.error("Unhandled UI error", error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center px-6 bg-background text-foreground">
                    <div className="max-w-md text-center space-y-4">
                        <h1 className="font-heading text-2xl font-bold">Something went wrong</h1>
                        <p className="text-sm text-muted-foreground">
                            Please refresh the page. If this keeps happening, contact the website team.
                        </p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center justify-center rounded-full px-5 py-2 bg-primary text-primary-foreground font-semibold"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
