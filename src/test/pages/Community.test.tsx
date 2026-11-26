import { fireEvent, screen, within } from "@testing-library/react";
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
        for (const title of ["Hands-on workshops", "Industry networking", "Certification prep", "Professional development"]) {
            expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
        }
        expect(screen.queryByText(/badge progression/i)).not.toBeInTheDocument();
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

    it("flips an officer card to player stats and back", () => {
        renderWithRouter(<CommunityPage />);
        const flip = screen.getByRole("button", { name: "Perry's player stats" });
        expect(flip).toHaveAttribute("aria-expanded", "false");
        fireEvent.click(flip);

        expect(screen.getByText("Favorite AWS service")).toBeInTheDocument();
        expect(screen.getByText("CodePipeline and CodeDeploy")).toBeInTheDocument();
        // The front face (and its LinkedIn link) is gone while flipped.
        expect(screen.queryByRole("link", { name: "Visit Perry Takyi's LinkedIn profile" })).not.toBeInTheDocument();

        const back = screen.getByRole("button", { name: "Back to profile" });
        expect(back).toHaveAttribute("aria-expanded", "true");
        fireEvent.click(back);
        expect(screen.getByRole("link", { name: "Visit Perry Takyi's LinkedIn profile" })).toBeInTheDocument();
    });

    it("hides the favorite-service row when an officer has not shared one", () => {
        renderWithRouter(<CommunityPage />);
        fireEvent.click(screen.getByRole("button", { name: "Hiab's player stats" }));
        expect(screen.getByText(/comedy movies/)).toBeInTheDocument();
        expect(screen.queryByText("Favorite AWS service")).not.toBeInTheDocument();
    });

    it("lists both faculty advisors with headshot, email and phone", () => {
        renderWithRouter(<CommunityPage />);
        expect(screen.getByRole("heading", { name: "Faculty advisors" })).toBeInTheDocument();
        for (const [name, email, phone] of [
            ["Dr. Suresh Peddoju", "speddoju@central.uh.edu", "713-743-3898"],
            ["Dr. José C. Martínez", "jcmartinez34@uh.edu", "713-743-6756"],
        ]) {
            expect(screen.getByRole("img", { name })).toBeInTheDocument();
            expect(screen.getByRole("link", { name: email })).toHaveAttribute("href", `mailto:${email}`);
            expect(screen.getByRole("link", { name: phone })).toHaveAttribute("href", `tel:+1${phone.replace(/-/g, "")}`);
        }
    });

    it("lists Dr. Martínez first, then Dr. Peddoju", () => {
        renderWithRouter(<CommunityPage />);
        const martinez = screen.getByText("Dr. José C. Martínez");
        const peddoju = screen.getByText("Dr. Suresh Peddoju");
        expect(martinez.compareDocumentPosition(peddoju) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it("keeps the program note and disclaimer", () => {
        renderWithRouter(<CommunityPage />);
        expect(screen.getByText("AWS Student Builder Groups program")).toBeInTheDocument();
        expect(screen.getByText(/not an Amazon employee organization/i, { selector: "p" })).toBeInTheDocument();
    });
});
