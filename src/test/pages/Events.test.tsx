import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EventsPage from "@/pages/Events";
import { EXTERNAL_LINKS } from "@/config/externalLinks";
import { renderWithRouter } from "../test-utils";

describe("Events page", () => {
    it("renders the Upcoming Events heading", () => {
        renderWithRouter(<EventsPage />);
        expect(
            screen.getByRole("heading", { name: /Upcoming Events/i }),
        ).toBeInTheDocument();
    });

    it("renders the first event card title", () => {
        renderWithRouter(<EventsPage />);
        expect(
            screen.getByText(/Launch Day: Intro To Cloud Computing/i),
        ).toBeInTheDocument();
    });

    it("renders the TBD placeholder event card", () => {
        renderWithRouter(<EventsPage />);
        expect(screen.getAllByText(/TBD — Check Meetup/i).length).toBeGreaterThan(
            0,
        );
    });

    it("RSVP links point to the Meetup URL and open in a new tab", () => {
        renderWithRouter(<EventsPage />);
        const rsvpLinks = screen.getAllByRole("link", { name: /RSVP on Meetup/i });
        expect(rsvpLinks.length).toBeGreaterThan(0);
        rsvpLinks.forEach((link) => {
            expect(link).toHaveAttribute("href", EXTERNAL_LINKS.meetup);
            expect(link).toHaveAttribute("target", "_blank");
            expect(link).toHaveAttribute("rel", "noopener noreferrer");
        });
    });

    it("renders the See all events on Meetup link", () => {
        renderWithRouter(<EventsPage />);
        const allEventsLink = screen.getByRole("link", {
            name: /See all events on Meetup/i,
        });
        expect(allEventsLink).toBeInTheDocument();
        expect(allEventsLink).toHaveAttribute("href", EXTERNAL_LINKS.meetup);
    });
});
