import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EventsPage from "@/pages/Events";
import { EXTERNAL_LINKS } from "@/config/externalLinks";
import { renderWithRouter } from "../test-utils";

describe("Events page", () => {
    it("renders the page heading", () => {
        renderWithRouter(<EventsPage />);
        expect(
            screen.getByRole("heading", { name: /Upcoming/i }),
        ).toBeInTheDocument();
    });

    it("renders loading skeletons while fetching", () => {
        renderWithRouter(<EventsPage />);
        // Component starts in loading state; skeletons have animate-pulse class
        const skeletons = document.querySelectorAll(".animate-pulse");
        expect(skeletons.length).toBeGreaterThan(0);
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
