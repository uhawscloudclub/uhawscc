import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProofStrip, { selectNextEvent } from "@/components/ProofStrip";
import { proofStats } from "@/data/proofStats";
import type { MeetupEvent } from "@/hooks/useEvents";
import { renderWithRouter } from "./test-utils";

function makeEvent(overrides: Partial<MeetupEvent> = {}): MeetupEvent {
  return {
    id: "evt-1",
    title: "Some Workshop",
    date: "Wednesday, September 23, 2026",
    // The feed parser stamps events at noon Central, so this is 17:00 UTC.
    rawDate: "2026-09-23T17:00:00.000Z",
    link: "https://www.meetup.com/example/events/1/",
    description: "A workshop.",
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
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("selectNextEvent", () => {
  it("keeps an event happening later today", () => {
    // 2:00pm Central on the event's own day. The event is stamped at noon
    // Central, so a naive instant comparison (rawDate < now) would wrongly
    // drop a 4pm event from lunchtime onward. Calendar-date comparison keeps it.
    const now = new Date("2026-09-23T19:00:00.000Z");
    expect(selectNextEvent([makeEvent()], now)?.id).toBe("evt-1");
  });

  it("keeps a future event when 'now' is late enough to differ in UTC", () => {
    // 11pm Central on Sep 22 is already Sep 23 in UTC — the comparison must
    // use the club's timezone, not UTC.
    const now = new Date("2026-09-23T04:00:00.000Z");
    expect(selectNextEvent([makeEvent()], now)?.id).toBe("evt-1");
  });

  it("drops an event whose day has passed", () => {
    const now = new Date("2026-09-24T15:00:00.000Z");
    expect(selectNextEvent([makeEvent()], now)).toBeNull();
  });

  it("returns null when the request failed and there is no data", () => {
    expect(selectNextEvent(undefined)).toBeNull();
  });

  it("returns null for an empty feed", () => {
    expect(selectNextEvent([])).toBeNull();
  });

  it("ignores an event with no usable date", () => {
    const now = new Date("2026-09-01T12:00:00.000Z");
    expect(selectNextEvent([makeEvent({ rawDate: null })], now)).toBeNull();
    expect(selectNextEvent([makeEvent({ rawDate: "not-a-date" })], now)).toBeNull();
  });

  it("ignores events not marked upcoming", () => {
    const now = new Date("2026-09-01T12:00:00.000Z");
    expect(selectNextEvent([makeEvent({ status: "past" })], now)).toBeNull();
  });

  it("picks the soonest qualifying event", () => {
    const now = new Date("2026-09-01T12:00:00.000Z");
    const later = makeEvent({ id: "later", rawDate: "2026-10-05T17:00:00.000Z" });
    const sooner = makeEvent({ id: "sooner", rawDate: "2026-09-23T17:00:00.000Z" });

    expect(selectNextEvent([later, sooner], now)?.id).toBe("sooner");
  });
});

describe("ProofStrip", () => {
  it("renders the verified figures with their exact labels", async () => {
    mockFetch({ ok: true, status: 200, body: [] });
    renderWithRouter(<ProofStrip />);

    const members = proofStats.stats.find((s) => s.id === "members");
    expect(await screen.findByText(members!.value)).toBeInTheDocument();
    // "members on Meetup" is not the same claim as "club members".
    expect(screen.getByText(/members on Meetup/i)).toBeInTheDocument();
    expect(screen.queryByText(/club members/i)).not.toBeInTheDocument();
  });

  it("states when the hand-maintained figures were last verified", async () => {
    mockFetch({ ok: true, status: 200, body: [] });
    renderWithRouter(<ProofStrip />);

    expect(await screen.findByText(/figures as of/i)).toBeInTheDocument();
  });

  it("shows a qualifying upcoming event without hardcoding a specific one", async () => {
    const future = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const event = makeEvent({
      title: "Placeholder Test Event",
      rawDate: future.toISOString(),
      date: "Some Future Day",
    });
    mockFetch({ ok: true, status: 200, body: [event] });

    renderWithRouter(<ProofStrip />);

    expect(await screen.findByText("Placeholder Test Event")).toBeInTheDocument();
  });

  it("omits the event item when the feed is empty", async () => {
    mockFetch({ ok: true, status: 200, body: [] });
    renderWithRouter(<ProofStrip />);

    expect(await screen.findByText(/figures as of/i)).toBeInTheDocument();
    expect(screen.queryByText(/next event/i)).not.toBeInTheDocument();
  });

  it("omits the event item when every returned event is already past", async () => {
    const past = makeEvent({ rawDate: "2020-01-01T18:00:00.000Z", title: "Old Event" });
    mockFetch({ ok: true, status: 200, body: [past] });

    renderWithRouter(<ProofStrip />);

    expect(await screen.findByText(/figures as of/i)).toBeInTheDocument();
    expect(screen.queryByText("Old Event")).not.toBeInTheDocument();
  });

  it("still renders the figures when the events request fails", async () => {
    // useEvents sets retry: 1, so a failure means two attempts.
    mockFetch(
      { ok: false, status: 503, body: [] },
      { ok: false, status: 503, body: [] },
    );

    renderWithRouter(<ProofStrip />);

    expect(await screen.findByText(/members on Meetup/i)).toBeInTheDocument();
  });
});
