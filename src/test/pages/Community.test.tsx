import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CommunityPage from "@/pages/Community";
import { JOIN_CHANNELS } from "@/data/joinChannels";
import { renderWithRouter } from "../test-utils";
import { TEAM_MEMBERS } from "../fixtures";

// /community replaces /about and /team; this carries over both pages' checks.
describe("Community page", () => {
    it("renders the page heading", () => {
        renderWithRouter(<CommunityPage />);
        expect(screen.getByRole("heading", { level: 1, name: /Built by students/i })).toBeInTheDocument();
    });

    it("explains what the club does", () => {
        renderWithRouter(<CommunityPage />);
        for (const title of ["Hands-On Learning", "AWS Badge Progression", "A Global Builder Network"]) {
            expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
        }
    });

    it("includes Ways to join with every channel", () => {
        renderWithRouter(<CommunityPage />);
        const section = screen.getByRole("region", { name: "Ways to join" });
        for (const channel of JOIN_CHANNELS) {
            expect(within(section).getByRole("link", { name: new RegExp(channel.action) })).toHaveAttribute("href", channel.href);
        }
    });

    it("has a #team section with every officer, headshot and LinkedIn link", () => {
        const { container } = renderWithRouter(<CommunityPage />);
        expect(container.querySelector("#team")).not.toBeNull();
        expect(screen.getByRole("heading", { name: "The people behind the club" })).toBeInTheDocument();
        TEAM_MEMBERS.forEach(({ name, linkedinUrl }) => {
            expect(screen.getByText(name)).toBeInTheDocument();
            expect(screen.getByRole("img", { name })).toBeInTheDocument();
            const link = screen.getByRole("link", { name: `Visit ${name}'s LinkedIn profile` });
            expect(link).toHaveAttribute("href", linkedinUrl);
            expect(link).toHaveAttribute("rel", "noopener noreferrer");
        });
    });

    it("lists the faculty advisor", () => {
        renderWithRouter(<CommunityPage />);
        expect(screen.getByText("Dr. Suresh Peddoju")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "speddoju@central.uh.edu" })).toHaveAttribute("href", "mailto:speddoju@central.uh.edu");
    });

    it("keeps the program note and disclaimer", () => {
        renderWithRouter(<CommunityPage />);
        expect(screen.getByText("AWS Student Builder Groups program")).toBeInTheDocument();
        expect(screen.getByText(/not an Amazon employee organization/i, { selector: "p" })).toBeInTheDocument();
    });
});
