import { screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Navbar from "@/components/Navbar";
import { EXTERNAL_LINKS } from "@/config/externalLinks";
import { renderWithRouter } from "./test-utils";

describe("Navbar", () => {
    it("renders the club name link pointing to home", () => {
        renderWithRouter(<Navbar />);
        const homeLogo = screen.getByRole("link", { name: /AWS SBG at UH/i });
        expect(homeLogo).toBeInTheDocument();
    });

    it("renders the four sitemap links, and nothing for removed pages", () => {
        renderWithRouter(<Navbar />);
        expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute("href", "/events");
        expect(screen.getByRole("link", { name: "Learn" })).toHaveAttribute("href", "/learn");
        expect(screen.getByRole("link", { name: "Community" })).toHaveAttribute("href", "/community");
        expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
        for (const removed of ["About", "Learning Paths", "Resources", "News", "Team"]) {
            expect(screen.queryByRole("link", { name: removed })).not.toBeInTheDocument();
        }
    });

    it("renders the Join on Meetup CTA pointing to the Meetup URL", () => {
        renderWithRouter(<Navbar />);
        const joinLink = screen.getByRole("link", { name: /Join on Meetup/i });
        expect(joinLink).toBeInTheDocument();
        expect(joinLink).toHaveAttribute("href", EXTERNAL_LINKS.meetup);
    });

    it("mobile menu is not rendered initially", () => {
        renderWithRouter(<Navbar />);
        // Mobile menu is conditional — when closed, it is absent from the DOM
        expect(screen.queryAllByRole("link", { name: "Community" })).toHaveLength(1);
    });

    it("clicking the hamburger button opens the mobile menu", () => {
        renderWithRouter(<Navbar />);
        const toggle = screen.getByRole("button", { name: /navigation/ });
        fireEvent.click(toggle);
        // Desktop + mobile menu both render the four links
        expect(screen.getAllByRole("link", { name: "Community" })).toHaveLength(2);
    });

    it("clicking the hamburger button twice closes the mobile menu", () => {
        renderWithRouter(<Navbar />);
        const toggle = screen.getByRole("button", { name: /navigation/ });
        fireEvent.click(toggle);
        fireEvent.click(toggle);
        expect(screen.queryAllByRole("link", { name: "Community" })).toHaveLength(1);
    });

    it("the active nav link receives the text-primary class", () => {
        renderWithRouter(<Navbar />, { initialRoute: "/community" });
        const communityLink = screen.getByRole("link", { name: "Community" });
        expect(communityLink).toHaveClass("text-primary");
    });

    it("inactive nav links receive the text-muted-foreground class", () => {
        renderWithRouter(<Navbar />, { initialRoute: "/community" });
        expect(screen.getByRole("link", { name: "Events" })).toHaveClass(
            "text-muted-foreground",
        );
        expect(screen.getByRole("link", { name: "Learn" })).toHaveClass(
            "text-muted-foreground",
        );
        expect(screen.getByRole("link", { name: "Contact" })).toHaveClass(
            "text-muted-foreground",
        );
    });
});
