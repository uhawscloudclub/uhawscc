import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import NotFound from "@/pages/NotFound";

const renderNotFound = () =>
    render(
        <MemoryRouter initialEntries={["/missing"]}>
            <NotFound />
        </MemoryRouter>,
    );

describe("NotFound page", () => {
    it("renders the 404 heading", () => {
        renderNotFound();
        expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
    });

    it("renders the page-not-found message", () => {
        renderNotFound();
        expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
    });

    it("renders a return-to-home link pointing to /", () => {
        renderNotFound();
        const homeLink = screen.getByRole("link", { name: /Return to Home/i });
        expect(homeLink).toBeInTheDocument();
        expect(homeLink).toHaveAttribute("href", "/");
    });
});
