import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ResourcesPage from "@/pages/Resources";
import { renderWithRouter } from "../test-utils";

describe("Resources page", () => {
    it("renders the page heading", () => {
        renderWithRouter(<ResourcesPage />);
        expect(screen.getByRole("heading", { name: /Everything you/i })).toBeInTheDocument();
    });

    it("renders all four resource card titles", () => {
        renderWithRouter(<ResourcesPage />);
        expect(screen.getByText("Create Your First AWS Account")).toBeInTheDocument();
        expect(screen.getByText("AWS Skill Builder")).toBeInTheDocument();
        expect(screen.getByText("AWS Free Tier")).toBeInTheDocument();
        expect(screen.getByText("Check out our LinkTree")).toBeInTheDocument();
    });

    it("links Create AWS Account card to correct external URL", () => {
        renderWithRouter(<ResourcesPage />);
        const link = screen.getByRole("link", { name: /Create AWS Account/i });
        expect(link).toHaveAttribute("href", "https://aws.amazon.com/resources/create-account/");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("links AWS Skill Builder card to correct external URL", () => {
        renderWithRouter(<ResourcesPage />);
        const link = screen.getByRole("link", { name: /Explore AWS Skill Builder/i });
        expect(link).toHaveAttribute("href", "https://skillbuilder.aws");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("links AWS Free Tier card to correct external URL", () => {
        renderWithRouter(<ResourcesPage />);
        const link = screen.getByRole("link", { name: /Get Started/i });
        expect(link).toHaveAttribute("href", "https://aws.amazon.com/free");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("links LinkTree card to correct external URL", () => {
        renderWithRouter(<ResourcesPage />);
        const link = screen.getByRole("link", { name: /Visit LinkTree/i });
        expect(link).toHaveAttribute("href", "https://linktr.ee/uhawscc");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
});
