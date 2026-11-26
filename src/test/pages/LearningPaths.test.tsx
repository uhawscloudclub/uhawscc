import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import LearningPathsPage from "@/pages/LearningPaths";
import { renderWithRouter } from "../test-utils";
import { RESOURCE_LINKS } from "../fixtures";

const COMPLETE_PROGRESS_KEY = "uh_aws_cc_progress_ccp_v1";
const COMPLETE_PROGRESS_VALUE = JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7]);

describe("Learning Paths page", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    const expectedResourceOrder = [
        "AWS CCP Certification Page",
        "Official Exam Guide PDF (CLF-C02)",
        "AWS Cloud Practitioner Essentials",
        "AWS Cloud Quest: Cloud Practitioner",
        "AWS Free Tier: Create Your Account",
        "Exam Prep Plan: CLF-C02",
        "Official Practice Exam (CLF-C02)",
        "Cloud Practitioner Training Hub",
    ] as const;

    it("renders the page heading", () => {
        renderWithRouter(<LearningPathsPage />);
        expect(screen.getByRole("heading", { name: /Your path to/i })).toBeInTheDocument();
    });

    it("renders at least one Skill Builder resource link", () => {
        renderWithRouter(<LearningPathsPage />);
        const sbLinks = screen
            .getAllByRole("link", { name: /^Open .+ \(opens in a new tab\)$/ })
            .filter((l) => l.getAttribute("href")?.includes("skillbuilder.aws"));
        expect(sbLinks.length).toBeGreaterThan(0);
    });

    it("renders resources in beginner-first order", () => {
        renderWithRouter(<LearningPathsPage />);

        const orderedNodes = expectedResourceOrder.map((label) => screen.getByText(label));

        for (let i = 1; i < orderedNodes.length; i++) {
            expect(
                orderedNodes[i - 1].compareDocumentPosition(orderedNodes[i]) &
                Node.DOCUMENT_POSITION_FOLLOWING,
            ).toBeTruthy();
        }
    });

    it("includes upcoming certifications locked section", () => {
        renderWithRouter(<LearningPathsPage />);
        expect(screen.getByText(/What's next/i)).toBeInTheDocument();
    });

    it("uses updated practice exam URL", () => {
        renderWithRouter(<LearningPathsPage />);

        const practiceExamOpenLink = screen
            .getAllByRole("link", { name: /^Open .+ \(opens in a new tab\)$/ })
            .find((link) => link.getAttribute("href") === RESOURCE_LINKS["Official Practice Exam (CLF-C02)"]);

        expect(practiceExamOpenLink).toBeDefined();
        expect(practiceExamOpenLink).toHaveAttribute("target", "_blank");
        expect(practiceExamOpenLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("links Start on Skill Builder CTA correctly", () => {
        renderWithRouter(<LearningPathsPage />);
        const link = screen.getByRole("link", { name: /Start on Skill Builder/i });
        expect(link).toHaveAttribute("href", RESOURCE_LINKS["AWS Cloud Practitioner Essentials"]);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("links Schedule Exam CTA correctly", () => {
        renderWithRouter(<LearningPathsPage />);
        const link = screen.getByRole("link", { name: /Schedule Exam/i });
        expect(link).toHaveAttribute("href", RESOURCE_LINKS["AWS CCP Certification Page"]);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("shows the full green completion state at 100 percent", () => {
        localStorage.setItem(COMPLETE_PROGRESS_KEY, COMPLETE_PROGRESS_VALUE);

        renderWithRouter(<LearningPathsPage />);

        const progressBar = screen.getByRole("progressbar", { name: /learning path completion/i });

        expect(progressBar).toHaveAttribute("aria-valuenow", "100");
        expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("uses native checkboxes named after each resource", () => {
        renderWithRouter(<LearningPathsPage />);
        const boxes = screen.getAllByRole("checkbox");
        expect(boxes).toHaveLength(expectedResourceOrder.length);
        boxes.forEach((box) => expect(box.tagName).toBe("INPUT"));
        expect(screen.getByRole("checkbox", { name: /AWS Cloud Practitioner Essentials/ })).not.toBeChecked();
        expect(screen.queryByRole("button", { pressed: false })).not.toBeInTheDocument();
    });

    it("gives every Open link a distinct accessible name", () => {
        renderWithRouter(<LearningPathsPage />);
        const names = screen
            .getAllByRole("link", { name: /^Open .+ \(opens in a new tab\)$/ })
            .map((link) => link.getAttribute("aria-label"));
        expect(new Set(names).size).toBe(names.length);
    });

    it("saves a checked item under the existing progress key", () => {
        renderWithRouter(<LearningPathsPage />);
        const box = screen.getByRole("checkbox", { name: /AWS CCP Certification Page/ });

        fireEvent.click(box);

        expect(box).toBeChecked();
        expect(JSON.parse(localStorage.getItem(COMPLETE_PROGRESS_KEY) ?? "[]")).toEqual([0]);
    });

    it("restores progress saved before this change (same key, same format)", () => {
        localStorage.setItem(COMPLETE_PROGRESS_KEY, JSON.stringify([0, 2]));
        renderWithRouter(<LearningPathsPage />);

        expect(screen.getByRole("checkbox", { name: /AWS CCP Certification Page/ })).toBeChecked();
        expect(screen.getByRole("checkbox", { name: /AWS Cloud Practitioner Essentials/ })).toBeChecked();
        expect(screen.getByRole("checkbox", { name: /Official Exam Guide/ })).not.toBeChecked();
    });
});
