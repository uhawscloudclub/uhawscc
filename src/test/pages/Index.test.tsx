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

    it("Join on Meetup CTA links to the Meetup group URL", () => {
        renderWithRouter(<HomePage />);
        const links = screen
            .getAllByRole("link", { name: /Join on Meetup/i })
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

    it("points to the three main places: events, learning, community", () => {
        renderWithRouter(<HomePage />);
        expect(screen.getByRole("heading", { name: "What you can do here" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "See events" })).toHaveAttribute("href", "/events");
        expect(screen.getByRole("link", { name: "Start learning" })).toHaveAttribute("href", "/learn");
        expect(screen.getByRole("link", { name: "Meet the community" })).toHaveAttribute("href", "/community");
    });

    it("shows each destination as a card with an icon tile", () => {
        renderWithRouter(<HomePage />);
        const heading = screen.getByRole("heading", { name: "What you can do here" });
        const cards = heading.parentElement!.querySelectorAll("li");
        expect(cards).toHaveLength(3);
        cards.forEach((card) => expect(card.querySelector(".px-tile svg")).not.toBeNull());
    });

    it("shows the mascot as decoration only (hidden from screen readers)", () => {
        const { container } = renderWithRouter(<HomePage />);
        const svg = container.querySelector("svg[viewBox='0 0 16 18']");
        expect(svg).not.toBeNull();
        expect(svg).toHaveAttribute("aria-hidden", "true");
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
        // The carousel is a lazy chunk: the first dynamic import of embla in a
        // cold CI worker has taken >1s (findBy's default timeout), so allow more.
        expect(
            await screen.findByRole("region", { name: /photos from AWS SBG at UH events/i }, { timeout: 5000 }),
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

    it("shows the Next up and Ways to join sections", async () => {
        renderWithRouter(<HomePage />);
        expect(screen.getByRole("heading", { name: "Next up" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Ways to join" })).toBeInTheDocument();
        // Empty feed (default stub): falls back to Meetup notifications.
        expect(await screen.findByRole("link", { name: /Get notified on Meetup/i })).toHaveAttribute(
            "href",
            EXTERNAL_LINKS.meetup,
        );
    });
});
