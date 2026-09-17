import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/pages/Index";
import { EXTERNAL_LINKS } from "@/config/externalLinks";
import { communityPhotos } from "@/data/communityPhotos";
import { renderWithRouter } from "../test-utils";

describe("Home page (Index)", () => {
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

    it("omits the community photo section entirely while no photos are curated", () => {
        // Guards the zero-photo path that is live until approved photos land:
        // no heading, no empty frame, and no lazy chunk requested.
        expect(communityPhotos).toHaveLength(0);

        renderWithRouter(<HomePage />);

        expect(screen.queryByText(/our community/i)).not.toBeInTheDocument();
        expect(
            screen.queryByRole("region", { name: /photos from cloudhub uh events/i }),
        ).not.toBeInTheDocument();
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
