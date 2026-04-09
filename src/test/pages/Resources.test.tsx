import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ResourcesPage from "@/pages/Resources";
import { renderWithRouter } from "../test-utils";
import { RESOURCE_LINKS } from "../fixtures";

const COMPLETE_PROGRESS_KEY = "uh_aws_cc_progress_ccp_v1";
const COMPLETE_PROGRESS_VALUE = JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7]);

describe("Resources page", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    const expectedResourceOrder = [
        "AWS CCP Certification Page",
        "Official Exam Guide PDF (CLF-C02)",
        "AWS Cloud Practitioner Essentials",
        "AWS Cloud Quest: Cloud Practitioner",
        "AWS Free Tier — Create Your Account",
        "Exam Prep Plan: CLF-C02",
        "Official Practice Exam (CLF-C02)",
        "Cloud Practitioner Training Hub",
    ] as const;

    it("renders the page heading", () => {
        renderWithRouter(<ResourcesPage />);
        expect(screen.getByRole("heading", { name: /Your Cloud Path/i })).toBeInTheDocument();
    });

    it("renders the Skill Builder explainer with link", () => {
        renderWithRouter(<ResourcesPage />);
        const link = screen.getByRole("link", { name: /What is Skill Builder\?/i });
        expect(link).toHaveAttribute("href", RESOURCE_LINKS.skillBuilderHome);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("renders resources in beginner-first order", () => {
        renderWithRouter(<ResourcesPage />);

        const orderedNodes = expectedResourceOrder.map((label) => screen.getByText(label));

        for (let i = 1; i < orderedNodes.length; i++) {
            expect(
                orderedNodes[i - 1].compareDocumentPosition(orderedNodes[i]) &
                Node.DOCUMENT_POSITION_FOLLOWING,
            ).toBeTruthy();
        }
    });

    it("includes certification roadmap badges by alt text", () => {
        renderWithRouter(<ResourcesPage />);
        expect(screen.getByAltText(/Cloud Practitioner certification badge/i)).toBeInTheDocument();
        expect(screen.getByAltText(/AI Practitioner certification badge/i)).toBeInTheDocument();
        expect(screen.getByAltText(/Solutions Architect certification badge/i)).toBeInTheDocument();
    });

    it("uses updated practice exam URL", () => {
        renderWithRouter(<ResourcesPage />);

        const practiceExamOpenLink = screen
            .getAllByRole("link", { name: "Open ↗" })
            .find((link) => link.getAttribute("href") === RESOURCE_LINKS["Official Practice Exam (CLF-C02)"]);

        expect(practiceExamOpenLink).toBeDefined();
        expect(practiceExamOpenLink).toHaveAttribute("target", "_blank");
        expect(practiceExamOpenLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("links Start on Skill Builder CTA correctly", () => {
        renderWithRouter(<ResourcesPage />);
        const link = screen.getByRole("link", { name: /Start on Skill Builder/i });
        expect(link).toHaveAttribute("href", RESOURCE_LINKS["AWS Cloud Practitioner Essentials"]);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("links Schedule Exam CTA correctly", () => {
        renderWithRouter(<ResourcesPage />);
        const link = screen.getByRole("link", { name: /Schedule Exam/i });
        expect(link).toHaveAttribute("href", RESOURCE_LINKS["AWS CCP Certification Page"]);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("shows the full green completion state at 100 percent", () => {
        localStorage.setItem(COMPLETE_PROGRESS_KEY, COMPLETE_PROGRESS_VALUE);

        renderWithRouter(<ResourcesPage />);

        const progressBar = screen.getByRole("progressbar", { name: /learning path completion/i });

        expect(progressBar).toHaveAttribute("aria-valuenow", "100");
        expect(progressBar).toHaveClass("bg-emerald-950/80");
        expect(screen.getByText("100%")).toBeInTheDocument();
    });
});
