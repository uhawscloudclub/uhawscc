import { Component, type ErrorInfo, type ReactNode } from "react";
import { ChunkLoadError } from "@/lib/lazyWithReload";

const RELOAD_FLAG = "chunk-reload-attempted";

function hasAlreadyReloaded(): boolean {
    try {
        return sessionStorage.getItem(RELOAD_FLAG) === "1";
    } catch {
        return false;
    }
}

function markReloaded(): void {
    try {
        sessionStorage.setItem(RELOAD_FLAG, "1");
    } catch {
        // sessionStorage unavailable — recovery still runs once per
        // ErrorBoundary mount instead of once per session.
    }
}

type Props = {
    children: ReactNode;
};

type State = {
    hasError: boolean;
    // True while an automatic reload (triggered by a stale-chunk import()
    // failure) is in flight, so render() can stay quiet instead of flashing
    // the "Something went wrong" fallback right before the page navigates away.
    recovering: boolean;
};

class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, recovering: false };

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            recovering: error instanceof ChunkLoadError && !hasAlreadyReloaded(),
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        if (import.meta.env.DEV) {
            console.error("Unhandled UI error", error, errorInfo);
        }
        if (error instanceof ChunkLoadError && !hasAlreadyReloaded()) {
            markReloaded();
            window.location.reload();
        }
    }

    render() {
        if (this.state.recovering) {
            return null;
        }

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
