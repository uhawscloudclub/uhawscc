import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EventsPage from "@/pages/Events";
import { EXTERNAL_LINKS } from "@/config/externalLinks";
import { PAST_EVENTS } from "@/data/pastEvents";
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

// Only Date is faked: the page filters events by the Houston calendar day, so
// "now" must be pinned for deterministic results. Timers stay real so React
// Query and findBy* polling behave normally.
function setNow(iso: string) {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(iso));
}

describe("Events page", () => {
    beforeEach(() => {
        setNow("2026-09-01T15:00:00Z"); // before sampleEvent (Sep 23)
    });

    afterEach(() => {
        vi.useRealTimers();
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
            await screen.findByRole("link", { name: /RSVP on Meetup/i }),
        ).toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(screen.queryByText(/Couldn't load events right now/i)).not.toBeInTheDocument();
    });

    it("renders an RSVP link using the event's own link, with the correct accessible name", async () => {
        mockFetchResponses({ ok: true, status: 200, body: [sampleEvent] });
        renderWithRouter(<EventsPage />);

        const rsvpLink = await screen.findByRole("link", {
            name: /RSVP on Meetup/i,
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
        await screen.findByRole("link", { name: /RSVP on Meetup/i });

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
        await screen.findByRole("link", { name: /RSVP on Meetup/i });

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

    describe("date rules (Houston calendar day)", () => {
        const at = (rawDate: string | null, extra: Partial<typeof sampleEvent> = {}) => ({
            ...sampleEvent,
            id: `${sampleEvent.id}?${rawDate}`,
            rawDate,
            ...extra,
        });

        it("keeps an event happening today in Houston, even after UTC has rolled to tomorrow", async () => {
            // 11:30 PM Sep 23 in Houston (CDT) = 04:30 UTC Sep 24.
            setNow("2026-09-24T04:30:00Z");
            mockFetchResponses({ ok: true, status: 200, body: [sampleEvent] });
            renderWithRouter(<EventsPage />);

            expect(await screen.findByRole("link", { name: /RSVP on Meetup/i })).toHaveAttribute("href", sampleEvent.link);
        });

        it("hides an expired event still marked upcoming (e.g. from a stale cache) and shows the empty state", async () => {
            // Houston is now Sep 24 (00:30 CDT); the Sep 23 event has ended.
            setNow("2026-09-24T05:30:00Z");
            mockFetchResponses({ ok: true, status: 200, body: [sampleEvent] });
            renderWithRouter(<EventsPage />);

            expect(await screen.findByText(/No upcoming events yet/i)).toBeInTheDocument();
            expect(screen.queryByRole("link", { name: /RSVP on Meetup/i })).not.toBeInTheDocument();
        });

        it("hides an event the server already marked past", async () => {
            mockFetchResponses({ ok: true, status: 200, body: [{ ...sampleEvent, status: "past" }] });
            renderWithRouter(<EventsPage />);

            expect(await screen.findByText(/No upcoming events yet/i)).toBeInTheDocument();
        });

        it("shows an event with a missing date, with a pointer to Meetup for the date", async () => {
            const undated = at(null, { title: "Undated Workshop", date: "See Meetup for date & time" });
            mockFetchResponses({ ok: true, status: 200, body: [undated] });
            renderWithRouter(<EventsPage />);

            expect(await screen.findByText("Undated Workshop")).toBeInTheDocument();
            expect(screen.getByText("Date and time on Meetup")).toBeInTheDocument();
            expect(screen.getByRole("link", { name: /RSVP on Meetup for Undated Workshop/i })).toHaveAttribute("href", undated.link);
        });

        it("shows an event with an invalid date instead of hiding it, without the bad date text", async () => {
            const invalid = at("not-a-date", { title: "Invalid Date Workshop", date: "Invalid Date" });
            mockFetchResponses({ ok: true, status: 200, body: [invalid] });
            renderWithRouter(<EventsPage />);

            expect(await screen.findByText("Invalid Date Workshop")).toBeInTheDocument();
            expect(screen.getByText("Date and time on Meetup")).toBeInTheDocument();
            expect(screen.queryByText("Invalid Date")).not.toBeInTheDocument();
        });

        it("gives every upcoming event its own RSVP link with a distinct accessible name", async () => {
            const first = at("2026-09-10T17:00:00.000Z", { title: "First Workshop", link: "https://www.meetup.com/aws-sbg-at-univ-of-houston/events/111/" });
            const second = at("2026-09-17T17:00:00.000Z", { title: "Second Workshop", link: "https://www.meetup.com/aws-sbg-at-univ-of-houston/events/222/" });
            mockFetchResponses({ ok: true, status: 200, body: [first, second] });
            renderWithRouter(<EventsPage />);

            expect(await screen.findByRole("link", { name: /RSVP on Meetup for First Workshop/i })).toHaveAttribute("href", first.link);
            expect(screen.getByRole("link", { name: /RSVP on Meetup for Second Workshop/i })).toHaveAttribute("href", second.link);
        });
    });

    it("announces a failed first load as 'couldn't load', not 'couldn't refresh'", async () => {
        mockFetchResponses(
            { ok: false, status: 503, body: [] },
            { ok: false, status: 503, body: [] },
        );
        renderWithRouter(<EventsPage />);

        await waitFor(() => {
            expect(screen.getByRole("status")).toHaveTextContent(/Couldn't load events\./i);
        });
    });

    it("keeps past events and a way to reach the club visible when the feed is down", async () => {
        mockFetchResponses(
            { ok: false, status: 503, body: [] },
            { ok: false, status: 503, body: [] },
        );
        renderWithRouter(<EventsPage />);

        await screen.findByText(/Couldn't load events right now/i);
        expect(screen.getByRole("heading", { name: /Past events/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: EXTERNAL_LINKS.emailContact })).toHaveAttribute(
            "href",
            `mailto:${EXTERNAL_LINKS.emailContact}`,
        );
    });

    it("shows the six newest past events as flyer cards, then all of them on request", () => {
        renderWithRouter(<EventsPage />);
        const section = screen.getByRole("region", { name: "Past events" });
        expect(within(section).getAllByRole("listitem")).toHaveLength(6);
        // Every card has its self-hosted flyer (decorative: the card repeats its text).
        within(section).getAllByRole("listitem").forEach((card) => {
            const img = card.querySelector("img");
            expect(img).not.toBeNull();
            expect(img).toHaveAttribute("alt", "");
            expect(img?.getAttribute("src")).toMatch(/\.webp/);
        });

        fireEvent.click(screen.getByRole("button", { name: `Show all ${PAST_EVENTS.length} past events` }));
        expect(within(section).getAllByRole("listitem")).toHaveLength(PAST_EVENTS.length);
        expect(screen.queryByRole("button", { name: /Show all/ })).not.toBeInTheDocument();
    });

    it("lists every past event with a link to its own Meetup page", () => {
        renderWithRouter(<EventsPage />);
        fireEvent.click(screen.getByRole("button", { name: /Show all/ }));
        for (const ev of PAST_EVENTS) {
            const link = screen.getByRole("link", { name: `Event page on Meetup for ${ev.title}` });
            expect(link).toHaveAttribute("href", ev.meetupUrl);
        }
    });
});
