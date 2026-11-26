import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/pages/Index";
import { EXTERNAL_LINKS } from "@/config/externalLinks";
import { communityPhotos } from "@/data/communityPhotos";
import { renderWithRouter } from "../test-utils";

describe("Home page (Index)", () => {
    beforeEach(() => {
        // ProofStrip calls useEvents on every HomePage render, so every test in
        // this file issues fetch("/api/events"). Without a default stub that
        // falls through to Node's fetch with a relative URL, which rejects and
        // then retries — noisy and timing-sensitive even when assertions pass.
        // Tests that need a failing feed override this with their own stub.
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] }),
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });
    it("renders the hero heading", () => {
        renderWithRouter(<HomePage />);
        expect(
            screen.getByRole("heading", { name: /Build cloud skills/i }),
        ).toBeInTheDocument();
    });

    it("renders the hero eyebrow text", () => {
        renderWithRouter(<HomePage />);
        expect(
            screen.getAllByText(/AWS Student Builder Group.*University of Houston/i).length,
        ).toBeGreaterThan(0);
    });

    it("Join Our Community CTA links to the Meetup URL", () => {
        renderWithRouter(<HomePage />);
        const links = screen
            .getAllByRole("link", { name: /Join our community/i })
            .filter((l) => l.getAttribute("href") === EXTERNAL_LINKS.meetup);
        expect(links.length).toBeGreaterThan(0);
    });

    it("Upcoming events link points to /events", () => {
        renderWithRouter(<HomePage />);
        const links = screen
            .getAllByRole("link", { name: /Upcoming events/i })
            .filter((l) => l.getAttribute("href") === "/events");
        expect(links.length).toBeGreaterThan(0);
    });

    it("renders the Build Projects for Your Resume feature card", () => {
        renderWithRouter(<HomePage />);
        expect(screen.getByText("Build Projects for Your Resume")).toBeInTheDocument();
    });

    it("renders the Certifications + Free Exam Vouchers feature card", () => {
        renderWithRouter(<HomePage />);
        expect(screen.getByText("Certifications + Free Exam Vouchers")).toBeInTheDocument();
    });

    it("renders the Community & Careers feature card", () => {
        renderWithRouter(<HomePage />);
        expect(screen.getByText("Community & Careers")).toBeInTheDocument();
    });

    it("renders the Three things we focus on section heading", () => {
        renderWithRouter(<HomePage />);
        expect(
            screen.getByRole("heading", { name: /Three things/i }),
        ).toBeInTheDocument();
    });

    it("renders the proof strip with its verified Meetup figures", async () => {
        renderWithRouter(<HomePage />);
        expect(await screen.findByText(/members on Meetup/i)).toBeInTheDocument();
        expect(screen.getByText(/figures as of/i)).toBeInTheDocument();
    });

    it("renders the community photo section now that photos are curated", async () => {
        // The zero-photo path itself (no heading, no empty frame, no lazy
        // chunk requested) stays covered by CommunityCarousel's own test
        // suite via prop injection — this just confirms Index.tsx wires the
        // real, non-empty production data through to the page.
        expect(communityPhotos.length).toBeGreaterThan(0);
        expect(communityPhotos.length).toBeLessThanOrEqual(8);

        renderWithRouter(<HomePage />);

        expect(screen.getByText("Our community")).toBeInTheDocument();
        expect(
            await screen.findByRole("region", { name: /photos from cloudhub uh events/i }),
        ).toBeInTheDocument();
    });

    it("keeps the hero and primary CTA intact even if the events feed fails", async () => {
        // useEvents sets retry: 1, so a failure is two attempts.
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({ ok: false, status: 503, json: async () => [] })
            .mockResolvedValueOnce({ ok: false, status: 503, json: async () => [] });
        vi.stubGlobal("fetch", fetchMock);

        renderWithRouter(<HomePage />);

        expect(
            screen.getByRole("heading", { name: /Build cloud skills/i }),
        ).toBeInTheDocument();
        expect(await screen.findByText(/members on Meetup/i)).toBeInTheDocument();
    });
});
