import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Footer from "@/components/Footer";
import { EXTERNAL_LINKS } from "@/config/externalLinks";
import { renderWithRouter } from "./test-utils";

describe("Footer", () => {
    it("renders all four internal navigation links", () => {
        renderWithRouter(<Footer />);
        expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Events" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Resources" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Team" })).toBeInTheDocument();
    });

    it("email contact link has the correct mailto href", () => {
        renderWithRouter(<Footer />);
        const emailLink = screen.getByRole("link", {
            name: EXTERNAL_LINKS.emailContact,
        });
        expect(emailLink).toHaveAttribute(
            "href",
            `mailto:${EXTERNAL_LINKS.emailContact}`,
        );
    });

    it("LinkedIn icon link points to the correct URL with target _blank", () => {
        renderWithRouter(<Footer />);
        const linkedinLink = screen.getByRole("link", { name: "LinkedIn" });
        expect(linkedinLink).toHaveAttribute("href", EXTERNAL_LINKS.linkedin);
        expect(linkedinLink).toHaveAttribute("target", "_blank");
        expect(linkedinLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("Instagram icon link points to the correct URL with target _blank", () => {
        renderWithRouter(<Footer />);
        const instagramLink = screen.getByRole("link", { name: "Instagram" });
        expect(instagramLink).toHaveAttribute("href", EXTERNAL_LINKS.instagram);
        expect(instagramLink).toHaveAttribute("target", "_blank");
        expect(instagramLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("Discord icon link points to the correct URL with target _blank", () => {
        renderWithRouter(<Footer />);
        const discordLink = screen.getByRole("link", { name: "Discord" });
        expect(discordLink).toHaveAttribute("href", EXTERNAL_LINKS.discord);
        expect(discordLink).toHaveAttribute("target", "_blank");
        expect(discordLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("renders the copyright notice", () => {
        renderWithRouter(<Footer />);
        expect(
            screen.getByText(/© 2025 AWS Cloud Club at UH/i),
        ).toBeInTheDocument();
    });

    it("renders the AWS disclaimer text", () => {
        renderWithRouter(<Footer />);
        expect(
            screen.getByText(/Not an official AWS or Amazon employee organization/i),
        ).toBeInTheDocument();
    });
});
