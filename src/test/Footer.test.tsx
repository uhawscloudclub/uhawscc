import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Footer from "@/components/Footer";
import { EXTERNAL_LINKS } from "@/config/externalLinks";
import { renderWithRouter } from "./test-utils";

describe("Footer", () => {
    it("renders the sitemap links", () => {
        renderWithRouter(<Footer />);
        expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute("href", "/events");
        expect(screen.getByRole("link", { name: "Learn" })).toHaveAttribute("href", "/learn");
        expect(screen.getByRole("link", { name: "Community" })).toHaveAttribute("href", "/community");
        expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
        expect(screen.queryByRole("link", { name: "News" })).not.toBeInTheDocument();
    });

    it("renders a Get in touch link pointing to /contact", () => {
        renderWithRouter(<Footer />);
        const contactLink = screen.getByRole("link", { name: /Get in touch/i });
        expect(contactLink).toHaveAttribute("href", "/contact");
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
        const currentYear = new Date().getFullYear();
        expect(
            screen.getByText(new RegExp(`© ${currentYear} AWS Student Builder Group at UH`, 'i')),
        ).toBeInTheDocument();
    });

    it("renders the AWS disclaimer text", () => {
        renderWithRouter(<Footer />);
        expect(
            screen.getByText(/Not an official AWS or Amazon employee organization/i),
        ).toBeInTheDocument();
    });
});
