import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import EventsPage from "@/pages/Events";
import { EXTERNAL_LINKS } from "@/config/externalLinks";
import { renderWithRouter } from "../test-utils";

function mockFetchResponses(...responses: Array<{ ok: boolean; status: number; body: unknown }>) {
    const fetchMock = vi.fn();
    for (const { ok, status, body } of responses) {
        fetchMock.mockResolvedValueOnce({ ok, status, json: async () => body });
    }
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

const sampleEvent = {
    id: "https://www.meetup.com/aws-sbg-at-university-of-houston-sugar-land-campus/events/316558414/",
    title: "Git and GitHub Foundations Workshop",
    date: "Wednesday, September 23, 2026",
    rawDate: "2026-09-23T17:00:00.000Z",
    link: "https://www.meetup.com/aws-sbg-at-university-of-houston-sugar-land-campus/events/316558414/",
    description: "Build your GitHub portfolio and README profile.",
    status: "upcoming" as const,
};

describe("Events page", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

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

    it("renders the empty state — distinct from the error state — for a valid empty feed", async () => {
        mockFetchResponses({ ok: true, status: 200, body: [] });
        renderWithRouter(<EventsPage />);

        expect(await screen.findByText(/No upcoming events yet/i)).toBeInTheDocument();
        expect(screen.queryByText(/Couldn't load events right now/i)).not.toBeInTheDocument();
    });

    it("renders the error state — distinct from the empty state — when the feed is unavailable", async () => {
        // useEvents() sets retry: 1, so a real failure means the initial
        // attempt AND one automatic retry both fail before isError settles.
        // Supplying only one failed response here would let the automatic
        // retry silently consume whatever comes next in the mock queue.
        mockFetchResponses(
            { ok: false, status: 503, body: [] },
            { ok: false, status: 503, body: [] },
        );
        renderWithRouter(<EventsPage />);

        expect(await screen.findByText(/Couldn't load events right now/i)).toBeInTheDocument();
        expect(screen.queryByText(/No upcoming events yet/i)).not.toBeInTheDocument();
    });

    it("Try again invokes a real refetch and the UI reflects the new result", async () => {
        // 2 failures (initial + automatic retry) to reach the error state,
        // then a 3rd success consumed only by the manual Try Again click.
        const fetchMock = mockFetchResponses(
            { ok: false, status: 503, body: [] },
            { ok: false, status: 503, body: [] },
            { ok: true, status: 200, body: [sampleEvent] },
        );
        renderWithRouter(<EventsPage />);

        await screen.findByText(/Couldn't load events right now/i);
        expect(fetchMock).toHaveBeenCalledTimes(2);

        fireEvent.click(screen.getByRole("button", { name: /Try again/i }));

        expect(
            await screen.findByRole("link", { name: /View time, location, and RSVP on Meetup/i }),
        ).toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(screen.queryByText(/Couldn't load events right now/i)).not.toBeInTheDocument();
    });

    it("renders an RSVP link using the event's own link, with the correct accessible name", async () => {
        mockFetchResponses({ ok: true, status: 200, body: [sampleEvent] });
        renderWithRouter(<EventsPage />);

        const rsvpLink = await screen.findByRole("link", {
            name: /View time, location, and RSVP on Meetup/i,
        });
        expect(rsvpLink).toHaveAttribute("href", sampleEvent.link);
        expect(rsvpLink).toHaveAttribute("target", "_blank");
        expect(rsvpLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("announces a pending refresh, then completion — even when the refreshed data is unchanged", async () => {
        let resolveRefresh: (response: { ok: boolean; status: number; json: () => Promise<unknown> }) => void;
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => [sampleEvent] })
            .mockImplementationOnce(() => new Promise((resolve) => { resolveRefresh = resolve; }));
        vi.stubGlobal("fetch", fetchMock);

        renderWithRouter(<EventsPage />);
        await screen.findByRole("link", { name: /View time, location, and RSVP on Meetup/i });

        fireEvent.click(screen.getByRole("button", { name: /Refresh/i }));

        // While the refetch is in flight, the persistent status region
        // announces progress — this is a role="status" region OUTSIDE the
        // aria-busy content container, not something nested inside it.
        await waitFor(() => {
            expect(screen.getByRole("status")).toHaveTextContent(/Checking for updated events/i);
        });

        // Resolve with the exact SAME data — an "unchanged response" refresh.
        // The point of this test is that a status is still announced even
        // though the visible event list itself won't change at all.
        resolveRefresh!({ ok: true, status: 200, json: async () => [sampleEvent] });

        await waitFor(() => {
            expect(screen.getByRole("status")).toHaveTextContent(/Events refreshed/i);
        });
    });

    it("announces a failure when a background refresh fails", async () => {
        // 1 success (initial load) + 2 failures (refresh attempt + its
        // automatic retry) — see the retry-count note on the error-state test above.
        const fetchMock = mockFetchResponses(
            { ok: true, status: 200, body: [sampleEvent] },
            { ok: false, status: 503, body: [] },
            { ok: false, status: 503, body: [] },
        );
        renderWithRouter(<EventsPage />);
        await screen.findByRole("link", { name: /View time, location, and RSVP on Meetup/i });

        fireEvent.click(screen.getByRole("button", { name: /Refresh/i }));

        await waitFor(() => {
            expect(screen.getByRole("status")).toHaveTextContent(/Couldn't refresh events/i);
        });
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it("keeps Refresh a native, keyboard-operable button", async () => {
        // Native <button> elements get keyboard activation (Enter/Space) from
        // the browser for free — this confirms the semantic element, since
        // jsdom doesn't reliably simulate that native key-to-click behavior
        // for a deeper interaction test. Try again is covered the same way
        // by the "Try again invokes a real refetch" test above, which locates
        // it via getByRole("button", ...) — only resolvable if it's a real
        // button. Full keyboard/screen-reader verification needs a real
        // browser or manual pass.
        mockFetchResponses({ ok: true, status: 200, body: [sampleEvent] });
        renderWithRouter(<EventsPage />);

        const refreshButton = await screen.findByRole("button", { name: /Refresh/i });
        expect(refreshButton.tagName).toBe("BUTTON");
    });
});
