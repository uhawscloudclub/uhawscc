import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NextEvent from "@/components/NextEvent";
import { EXTERNAL_LINKS } from "@/config/externalLinks";
import { PAST_EVENTS } from "@/data/pastEvents";
import type { MeetupEvent } from "@/hooks/useEvents";
import { renderWithRouter } from "./test-utils";

function makeEvent(overrides: Partial<MeetupEvent> = {}): MeetupEvent {
    return {
        id: "evt",
        title: "Intro to Lambda",
        date: "Wednesday, December 9, 2026",
        rawDate: "2026-12-09T17:00:00.000Z",
        link: "https://www.meetup.com/aws-sbg-at-univ-of-houston/events/123/",
        description: "Build a function.",
        status: "upcoming",
        ...overrides,
    };
}

function mockFetch(...responses: Array<{ ok: boolean; status: number; body: unknown }>) {
    const fetchMock = vi.fn();
    for (const { ok, status, body } of responses) {
        fetchMock.mockResolvedValueOnce({ ok, status, json: async () => body });
    }
    vi.stubGlobal("fetch", fetchMock);
}

describe("NextEvent (homepage)", () => {
    beforeEach(() => {
        // Only Date is faked, so React Query and findBy* polling use real timers.
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(new Date("2026-12-02T18:00:00Z")); // Dec 2, noon Houston
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it("shows the next dated event with an RSVP link to its own Meetup page", async () => {
        const later = makeEvent({ id: "later", title: "Later Event", rawDate: "2026-12-16T17:00:00.000Z", link: "https://www.meetup.com/aws-sbg-at-univ-of-houston/events/456/" });
        mockFetch({ ok: true, status: 200, body: [later, makeEvent()] });
        renderWithRouter(<NextEvent />);

        const rsvp = await screen.findByRole("link", { name: "RSVP on Meetup for Intro to Lambda" });
        expect(rsvp).toHaveAttribute("href", "https://www.meetup.com/aws-sbg-at-univ-of-houston/events/123/");
        expect(screen.getByText("Wednesday, December 9, 2026")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /All events/i })).toHaveAttribute("href", "/events");
        expect(screen.queryByText("Later Event")).not.toBeInTheDocument();
        expect(screen.getByTestId("event-countdown")).toHaveTextContent("In 7 days");
        expect(screen.getByRole("button", { name: "Add Intro to Lambda to your calendar" })).toBeInTheDocument();
    });

    it("keeps an event that is happening today in Houston", async () => {
        vi.setSystemTime(new Date("2026-12-10T05:30:00Z")); // 11:30 PM Dec 9 in Houston
        mockFetch({ ok: true, status: 200, body: [makeEvent()] });
        renderWithRouter(<NextEvent />);

        expect(await screen.findByRole("link", { name: "RSVP on Meetup for Intro to Lambda" })).toBeInTheDocument();
        expect(screen.getByTestId("event-countdown")).toHaveTextContent("Today");
    });

    it("with nothing scheduled, points to the latest past event and Meetup notifications", async () => {
        mockFetch({ ok: true, status: 200, body: [] });
        renderWithRouter(<NextEvent />);

        expect(await screen.findByText(/Nothing is scheduled yet/i)).toBeInTheDocument();
        expect(screen.getByText(PAST_EVENTS[0].title)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Get notified on Meetup/i })).toHaveAttribute("href", EXTERNAL_LINKS.meetup);
        expect(screen.getByRole("link", { name: /See past events/i })).toHaveAttribute("href", "/events");
    });

    it("treats expired and undated events as nothing scheduled", async () => {
        const expired = makeEvent({ title: "Expired Event", rawDate: "2026-11-20T17:00:00.000Z" });
        const undated = makeEvent({ id: "u", title: "Undated Event", rawDate: null });
        mockFetch({ ok: true, status: 200, body: [expired, undated] });
        renderWithRouter(<NextEvent />);

        expect(await screen.findByText(/Nothing is scheduled yet/i)).toBeInTheDocument();
        expect(screen.queryByText("Expired Event")).not.toBeInTheDocument();
        expect(screen.queryByText("Undated Event")).not.toBeInTheDocument();
    });

    it("when the feed is down, says so and still offers Meetup", async () => {
        // useEvents retries once, so a failure is two attempts.
        mockFetch({ ok: false, status: 503, body: [] }, { ok: false, status: 503, body: [] });
        renderWithRouter(<NextEvent />);

        expect(await screen.findByText(/couldn't check Meetup/i)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Get notified on Meetup/i })).toHaveAttribute("href", EXTERNAL_LINKS.meetup);
    });
});
