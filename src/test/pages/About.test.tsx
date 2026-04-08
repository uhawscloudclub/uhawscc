import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AboutPage from "@/pages/About";
import { renderWithRouter } from "../test-utils";

describe("About page", () => {
    it("renders the What We Do heading", () => {
        renderWithRouter(<AboutPage />);
        expect(
            screen.getByRole("heading", { name: /What We Do/i }),
        ).toBeInTheDocument();
    });

    it("renders the Hands-On Learning card", () => {
        renderWithRouter(<AboutPage />);
        expect(screen.getByText("Hands-On Learning")).toBeInTheDocument();
    });

    it("renders the AWS Badge Progression card", () => {
        renderWithRouter(<AboutPage />);
        expect(screen.getByText("AWS Badge Progression")).toBeInTheDocument();
    });

    it("renders the Community & Careers card", () => {
        renderWithRouter(<AboutPage />);
        expect(screen.getByText("Community & Careers")).toBeInTheDocument();
    });

    it("renders the official AWS disclaimer text", () => {
        renderWithRouter(<AboutPage />);
        // Use selector:'p' to target the About section paragraph,
        // not the footer's copyright notice which contains similar text
        expect(
            screen.getByText(/not an official AWS or Amazon employee/i, {
                selector: "p",
            }),
        ).toBeInTheDocument();
    });

    it("mentions the AWS Cloud Clubs program", () => {
        renderWithRouter(<AboutPage />);
        expect(screen.getByText("AWS Cloud Clubs program")).toBeInTheDocument();
    });
});
