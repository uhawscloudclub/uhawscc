import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import About from "@/pages/About";
import Events from "@/pages/Events";
import HomePage from "@/pages/Index";
import LearningPaths from "@/pages/LearningPaths";
import NotFound from "@/pages/NotFound";
import Resources from "@/pages/Resources";
import Team from "@/pages/Team";

// The home and events routes both fetch /api/events (via ProofStrip and
// useEvents). Left unstubbed, jsdom falls through to Node's fetch with a
// relative URL, which rejects — noise that has nothing to do with these
// smoke assertions.
beforeEach(() => {
    vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] }),
    );
});

afterEach(() => {
    vi.unstubAllGlobals();
});

const renderRoute = (route: string) => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/learning-paths" element={<LearningPaths />} />
                    <Route path="/resources" element={<Resources />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>,
    );
};

describe("route smoke tests", () => {
    it("renders home route", () => {
        renderRoute("/");
        expect(screen.getByRole("heading", { name: /Build cloud skills/i })).toBeInTheDocument();
    });

    it("renders about route", () => {
        renderRoute("/about");
        expect(screen.getByRole("heading", { name: /Built by students/i })).toBeInTheDocument();
    });

    it("renders events route", () => {
        renderRoute("/events");
        expect(screen.getByRole("heading", { name: /Upcoming/i })).toBeInTheDocument();
    });

    it("renders resources route", () => {
        renderRoute("/resources");
        expect(screen.getByRole("heading", { name: /Everything you/i })).toBeInTheDocument();
    });

    it("renders learning paths route", () => {
        renderRoute("/learning-paths");
        expect(screen.getByRole("heading", { name: /Your path to/i })).toBeInTheDocument();
    });

    it("renders team route", () => {
        renderRoute("/team");
        expect(screen.getByRole("heading", { name: /The people/i })).toBeInTheDocument();
    });

    it("renders not found fallback", () => {
        renderRoute("/missing");
        expect(screen.getByRole("heading", { name: /Page not/i })).toBeInTheDocument();
    });
});
