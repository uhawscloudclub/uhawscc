import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound from "@/pages/NotFound";
import { renderWithRouter } from "./test-utils";

describe("NotFound page", () => {
    it("renders the 404 heading", () => {
        renderWithRouter(<NotFound />, { initialRoute: "/missing" });
        expect(screen.getByRole("heading", { name: /Page not/i })).toBeInTheDocument();
    });

    it("renders the page-not-found message", () => {
        renderWithRouter(<NotFound />, { initialRoute: "/missing" });
        expect(screen.getByText(/That route does not exist/i)).toBeInTheDocument();
    });

    it("renders a return-to-home link pointing to /", () => {
        renderWithRouter(<NotFound />, { initialRoute: "/missing" });
        const homeLink = screen.getByRole("link", { name: /Back to home/i });
        expect(homeLink).toBeInTheDocument();
        expect(homeLink).toHaveAttribute("href", "/");
    });

    it("offers the Star Catcher game, started only by pressing Play", () => {
        renderWithRouter(<NotFound />, { initialRoute: "/missing" });
        expect(screen.getByRole("heading", { name: "Star Catcher" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
        expect(screen.getByRole("img", { name: /Star Catcher game/ })).toHaveAttribute("tabindex", "0");
    });
});
