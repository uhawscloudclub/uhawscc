import { screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Navbar from "@/components/Navbar";
import { EXTERNAL_LINKS } from "@/config/externalLinks";
import { renderWithRouter } from "./test-utils";

describe("Navbar", () => {
    it("renders the club name link pointing to home", () => {
        renderWithRouter(<Navbar />);
        const homeLogo = screen.getByRole("link", { name: /AWS Cloud Club/i });
        expect(homeLogo).toBeInTheDocument();
    });

    it("renders all four desktop nav links", () => {
        renderWithRouter(<Navbar />);
        expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Events" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Resources" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Team" })).toBeInTheDocument();
    });

    it("renders the Join the Club CTA pointing to the Meetup URL", () => {
        renderWithRouter(<Navbar />);
        const joinLink = screen.getByRole("link", { name: /Join the Club/i });
        expect(joinLink).toBeInTheDocument();
        expect(joinLink).toHaveAttribute("href", EXTERNAL_LINKS.meetup);
    });

    it("mobile menu is not rendered initially", () => {
        renderWithRouter(<Navbar />);
        // Mobile menu is conditional — when closed, it is absent from the DOM
        expect(screen.queryAllByRole("link", { name: "About" })).toHaveLength(1);
    });

    it("clicking the hamburger button opens the mobile menu", () => {
        renderWithRouter(<Navbar />);
        const toggle = screen.getByRole("button");
        fireEvent.click(toggle);
        // Desktop + mobile menu both render the four links
        expect(screen.getAllByRole("link", { name: "About" })).toHaveLength(2);
    });

    it("clicking the hamburger button twice closes the mobile menu", () => {
        renderWithRouter(<Navbar />);
        const toggle = screen.getByRole("button");
        fireEvent.click(toggle);
        fireEvent.click(toggle);
        expect(screen.queryAllByRole("link", { name: "About" })).toHaveLength(1);
    });

    it("the active nav link receives the text-primary class", () => {
        renderWithRouter(<Navbar />, { initialRoute: "/about" });
        const aboutLink = screen.getByRole("link", { name: "About" });
        expect(aboutLink).toHaveClass("text-primary");
    });

    it("inactive nav links receive the text-muted-foreground class", () => {
        renderWithRouter(<Navbar />, { initialRoute: "/about" });
        expect(screen.getByRole("link", { name: "Events" })).toHaveClass(
            "text-muted-foreground",
        );
        expect(screen.getByRole("link", { name: "Resources" })).toHaveClass(
            "text-muted-foreground",
        );
        expect(screen.getByRole("link", { name: "Team" })).toHaveClass(
            "text-muted-foreground",
        );
    });
});
