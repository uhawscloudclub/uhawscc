import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ResourcesPage from "@/pages/Resources";
import { renderWithRouter } from "../test-utils";
import { RESOURCE_LINKS } from "../fixtures";

describe("Resources page", () => {
    it("renders the Member Resources heading", () => {
        renderWithRouter(<ResourcesPage />);
        expect(
            screen.getByRole("heading", { name: /Member Resources/i }),
        ).toBeInTheDocument();
    });

    it("renders the Create Your First AWS Account card", () => {
        renderWithRouter(<ResourcesPage />);
        expect(
            screen.getByText("Create Your First AWS Account"),
        ).toBeInTheDocument();
    });

    it("renders the AWS Skill Builder card", () => {
        renderWithRouter(<ResourcesPage />);
        expect(screen.getByText("AWS Skill Builder")).toBeInTheDocument();
    });

    it("renders the AWS Free Tier card", () => {
        renderWithRouter(<ResourcesPage />);
        expect(screen.getByText("AWS Free Tier")).toBeInTheDocument();
    });

    it("renders the LinkTree card", () => {
        renderWithRouter(<ResourcesPage />);
        expect(screen.getByText("Check out our LinkTree")).toBeInTheDocument();
    });

    it("Create AWS Account CTA links to the correct URL with target _blank", () => {
        renderWithRouter(<ResourcesPage />);
        const link = screen.getByRole("link", { name: /Create AWS Account/i });
        expect(link).toHaveAttribute("href", RESOURCE_LINKS.awsAccount);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("AWS Skill Builder CTA links to the correct URL with target _blank", () => {
        renderWithRouter(<ResourcesPage />);
        const link = screen.getByRole("link", {
            name: /Explore AWS Skill Builder/i,
        });
        expect(link).toHaveAttribute("href", RESOURCE_LINKS.skillBuilder);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("AWS Free Tier CTA links to the correct URL with target _blank", () => {
        renderWithRouter(<ResourcesPage />);
        const links = screen
            .getAllByRole("link", { name: /Get Started/i })
            .filter((l) => l.getAttribute("href") === RESOURCE_LINKS.freeTier);
        expect(links.length).toBeGreaterThan(0);
        links.forEach((link) => {
            expect(link).toHaveAttribute("target", "_blank");
            expect(link).toHaveAttribute("rel", "noopener noreferrer");
        });
    });

    it("LinkTree CTA links to the correct URL with target _blank", () => {
        renderWithRouter(<ResourcesPage />);
        const link = screen.getByRole("link", { name: /Visit LinkTree/i });
        expect(link).toHaveAttribute("href", RESOURCE_LINKS.linkTree);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
});
