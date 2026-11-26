import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "@/App";
import { LEGACY_ROUTES, legacyRedirectTarget } from "../../server/legacyRoutes.js";

describe("legacyRedirectTarget", () => {
    it("keeps the query string and puts it before the fragment", () => {
        expect(legacyRedirectTarget("/community#team", "?utm_source=flyer")).toBe("/community?utm_source=flyer#team");
        expect(legacyRedirectTarget("/learn", "?a=1")).toBe("/learn?a=1");
        expect(legacyRedirectTarget("/learn", "")).toBe("/learn");
        expect(legacyRedirectTarget("/learn", "?")).toBe("/learn");
    });

    it("maps every old page to a page that exists", () => {
        expect(LEGACY_ROUTES).toEqual({
            "/about": "/community",
            "/team": "/community#team",
            "/learning-paths": "/learn",
            "/resources": "/learn#free-resources",
            "/news": "/learn",
        });
    });
});

// Client-side redirects through the real <App /> (BrowserRouter + lazy routes),
// which is what the Vite dev server and in-app links rely on. Express's HTTP
// 301s for the same paths are checked against the running server.
describe("old URLs in the app", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] }));
        Element.prototype.scrollIntoView = () => {};
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        window.history.pushState({}, "", "/");
    });

    const cases: [string, string, RegExp][] = [
        ["/about", "/community", /Built by students/i],
        ["/team?ref=old", "/community", /Built by students/i],
        ["/learning-paths", "/learn", /Your path to/i],
        ["/resources", "/learn", /Your path to/i],
        ["/news", "/learn", /Your path to/i],
    ];

    for (const [from, toPath, heading] of cases) {
        it(`${from} lands on ${toPath}`, async () => {
            window.history.pushState({}, "", from);
            render(<App />);
            expect(await screen.findByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
            await waitFor(() => expect(window.location.pathname).toBe(toPath));
        });
    }

    it("keeps the query string and fragment (/team?ref=old → /community?ref=old#team)", async () => {
        window.history.pushState({}, "", "/team?ref=old");
        render(<App />);
        await screen.findByRole("heading", { level: 1, name: /Built by students/i });
        expect(window.location.search).toBe("?ref=old");
        expect(window.location.hash).toBe("#team");
    });
});
