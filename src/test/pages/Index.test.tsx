import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "@/pages/Index";
import { EXTERNAL_LINKS } from "@/config/externalLinks";
import { renderWithRouter } from "../test-utils";

describe("Home page (Index)", () => {
    it("renders the hero heading", () => {
        renderWithRouter(<HomePage />);
        expect(
            screen.getByRole("heading", { name: /Build in the Cloud/i }),
        ).toBeInTheDocument();
    });

    it("renders the club logo image with alt text", () => {
        renderWithRouter(<HomePage />);
        expect(
            screen.getByRole("img", { name: /AWS Cloud Club Logo/i }),
        ).toBeInTheDocument();
    });

    it("Join Our Community CTA links to the Meetup URL", () => {
        renderWithRouter(<HomePage />);
        const links = screen
            .getAllByRole("link", { name: /Join Our Community/i })
            .filter((l) => l.getAttribute("href") === EXTERNAL_LINKS.meetup);
        expect(links.length).toBeGreaterThan(0);
    });

    it("View Upcoming Events link points to /events", () => {
        renderWithRouter(<HomePage />);
        const link = screen.getByRole("link", { name: /View Upcoming Events/i });
        expect(link).toHaveAttribute("href", "/events");
    });

    it("renders the Hands-On Learning feature card", () => {
        renderWithRouter(<HomePage />);
        expect(screen.getByText("Hands-On Learning")).toBeInTheDocument();
    });

    it("renders the AWS Badge Progression feature card", () => {
        renderWithRouter(<HomePage />);
        expect(screen.getByText("AWS Badge Progression")).toBeInTheDocument();
    });

    it("renders the Community & Careers feature card", () => {
        renderWithRouter(<HomePage />);
        expect(screen.getByText("Community & Careers")).toBeInTheDocument();
    });

    it("renders the What We Do section heading", () => {
        renderWithRouter(<HomePage />);
        expect(
            screen.getByRole("heading", { name: /What We Do/i }),
        ).toBeInTheDocument();
    });
});
