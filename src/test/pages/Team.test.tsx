import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TeamPage from "@/pages/Team";
import { EXTERNAL_LINKS } from "@/config/externalLinks";
import { renderWithRouter } from "../test-utils";
import { TEAM_MEMBERS } from "../fixtures";

describe("Team page", () => {
    it("renders the Leadership heading", () => {
        renderWithRouter(<TeamPage />);
        expect(
            screen.getByRole("heading", { name: /Leadership/i }),
        ).toBeInTheDocument();
    });

    it("renders all six team member names", () => {
        renderWithRouter(<TeamPage />);
        TEAM_MEMBERS.forEach(({ name }) => {
            expect(screen.getByText(name)).toBeInTheDocument();
        });
    });

    it("renders each team member headshot with alt text matching their name", () => {
        renderWithRouter(<TeamPage />);
        TEAM_MEMBERS.forEach(({ name }) => {
            expect(screen.getByRole("img", { name })).toBeInTheDocument();
        });
    });

    it("renders each LinkedIn link with the correct aria-label and href", () => {
        renderWithRouter(<TeamPage />);
        TEAM_MEMBERS.forEach(({ name, linkedinUrl }) => {
            const link = screen.getByRole("link", {
                name: `Visit ${name}'s LinkedIn profile`,
            });
            expect(link).toHaveAttribute("href", linkedinUrl);
            expect(link).toHaveAttribute("target", "_blank");
            expect(link).toHaveAttribute("rel", "noopener noreferrer");
        });
    });

    it("renders the Become a Member heading", () => {
        renderWithRouter(<TeamPage />);
        expect(
            screen.getByRole("heading", { name: /Become a Member/i }),
        ).toBeInTheDocument();
    });

    it("renders the How to Join steps", () => {
        renderWithRouter(<TeamPage />);
        expect(
            screen.getByText(/Fill out our membership interest form/i),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/RSVP to an upcoming event on Meetup/i),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Show up and start building/i),
        ).toBeInTheDocument();
    });

    it("Apply to Join CTA links to the Meetup URL", () => {
        renderWithRouter(<TeamPage />);
        const applyLinks = screen
            .getAllByRole("link", { name: /Apply to Join/i })
            .filter((l) => l.getAttribute("href") === EXTERNAL_LINKS.meetup);
        expect(applyLinks.length).toBeGreaterThan(0);
    });
});
