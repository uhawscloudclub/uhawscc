import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi, afterAll, beforeAll } from "vitest";
import ErrorBoundary from "@/components/ErrorBoundary";

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error("Test render error");
    }
    return <div>No error here</div>;
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
});
