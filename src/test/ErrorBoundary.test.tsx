import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi, afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ChunkLoadError } from "@/lib/lazyWithReload";

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error("Test render error");
    }
    return <div>No error here</div>;
};

const ThrowChunkError = () => {
    throw new ChunkLoadError(new Error("Failed to fetch dynamically imported module"));
};

describe("ErrorBoundary", () => {
    beforeAll(() => {
        // Suppress React's console.error output for expected boundary errors
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it("renders children normally when there is no error", () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={false} />
            </ErrorBoundary>,
        );
        expect(screen.getByText("No error here")).toBeInTheDocument();
    });

    it("renders the fallback UI when a child throws", () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>,
        );
        expect(
            screen.getByRole("heading", { name: /Something went wrong/i }),
        ).toBeInTheDocument();
    });

    it("renders the Refresh button in the error state", () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>,
        );
        expect(
            screen.getByRole("button", { name: /Refresh/i }),
        ).toBeInTheDocument();
    });

    it("does not render children when in error state", () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>,
        );
        expect(screen.queryByText("No error here")).not.toBeInTheDocument();
    });

    it("renders the helpful error description", () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>,
        );
        expect(
            screen.getByText(/Please refresh the page/i),
        ).toBeInTheDocument();
    });

    describe("stale chunk recovery", () => {
        const originalLocation = window.location;
        let reloadMock: ReturnType<typeof vi.fn>;

        beforeEach(() => {
            sessionStorage.clear();
            reloadMock = vi.fn();
            // jsdom's window.location.reload is not implemented; stub the whole
            // object so the component's window.location.reload() call is inert.
            Object.defineProperty(window, "location", {
                configurable: true,
                value: { ...originalLocation, reload: reloadMock },
            });
        });

        afterEach(() => {
            Object.defineProperty(window, "location", {
                configurable: true,
                value: originalLocation,
            });
        });

        it("reloads once and does not render the fallback for a first chunk-load failure", () => {
            render(
                <ErrorBoundary>
                    <ThrowChunkError />
                </ErrorBoundary>,
            );
            expect(reloadMock).toHaveBeenCalledTimes(1);
            expect(
                screen.queryByRole("heading", { name: /Something went wrong/i }),
            ).not.toBeInTheDocument();
        });

        it("renders the fallback instead of reloading again on a repeat chunk-load failure", () => {
            sessionStorage.setItem("chunk-reload-attempted", "1");
            render(
                <ErrorBoundary>
                    <ThrowChunkError />
                </ErrorBoundary>,
            );
            expect(reloadMock).not.toHaveBeenCalled();
            expect(
                screen.getByRole("heading", { name: /Something went wrong/i }),
            ).toBeInTheDocument();
        });

        it("still renders the fallback for a normal render error, without reloading", () => {
            render(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>,
            );
            expect(reloadMock).not.toHaveBeenCalled();
            expect(
                screen.getByRole("heading", { name: /Something went wrong/i }),
            ).toBeInTheDocument();
        });
    });
});
