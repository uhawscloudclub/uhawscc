import { describe, expect, it } from "vitest";
import {
    buildEventDate,
    hasValidEventDate,
    houstonDateKey,
    isUpcomingEvent,
    withComputedStatus,
} from "../../server/eventDates.js";

describe("houstonDateKey", () => {
    it("uses the Houston calendar day, not UTC", () => {
        // 04:30 UTC Nov 26 = 10:30 PM Nov 25 in Houston (CST, UTC-6).
        expect(houstonDateKey(new Date("2026-11-26T04:30:00Z"))).toBe("2026-11-25");
        // 04:30 UTC Sep 24 = 11:30 PM Sep 23 in Houston (CDT, UTC-5).
        expect(houstonDateKey(new Date("2026-09-24T04:30:00Z"))).toBe("2026-09-23");
    });

    it("returns null for an invalid date", () => {
        expect(houstonDateKey("not-a-date")).toBeNull();
    });
});

describe("isUpcomingEvent", () => {
    const eventOn = (rawDate: string | null) => ({ rawDate });

    it("keeps an event that is today in Houston until local midnight", () => {
        const sep23 = eventOn("2026-09-23T17:00:00.000Z");
        expect(isUpcomingEvent(sep23, new Date("2026-09-23T13:00:00Z"))).toBe(true); // 8 AM
        expect(isUpcomingEvent(sep23, new Date("2026-09-24T04:59:00Z"))).toBe(true); // 11:59 PM
        expect(isUpcomingEvent(sep23, new Date("2026-09-24T05:00:00Z"))).toBe(false); // midnight
    });

    it("treats a future event as upcoming and a past one as not", () => {
        const now = new Date("2026-11-26T18:00:00Z");
        expect(isUpcomingEvent(eventOn("2026-12-03T17:00:00.000Z"), now)).toBe(true);
        expect(isUpcomingEvent(eventOn("2026-11-20T17:00:00.000Z"), now)).toBe(false);
    });

    it("keeps events with a missing or invalid date (shown as 'date on Meetup')", () => {
        const now = new Date("2026-11-26T18:00:00Z");
        expect(isUpcomingEvent(eventOn(null), now)).toBe(true);
        expect(isUpcomingEvent(eventOn(""), now)).toBe(true);
        expect(isUpcomingEvent(eventOn("not-a-date"), now)).toBe(true);
        expect(hasValidEventDate("not-a-date")).toBe(false);
        expect(hasValidEventDate(null)).toBe(false);
    });
});

describe("withComputedStatus", () => {
    it("marks expired entries past without changing the response shape or the input", () => {
        const cached = [
            { id: "a", title: "Old", date: "x", rawDate: "2026-11-20T17:00:00.000Z", link: "l", description: "d", status: "upcoming" as const },
            { id: "b", title: "Next", date: "y", rawDate: "2026-12-03T17:00:00.000Z", link: "l", description: "d", status: "upcoming" as const },
            { id: "c", title: "Undated", date: "z", rawDate: null, link: "l", description: "d", status: "upcoming" as const },
        ];
        const result = withComputedStatus(cached, new Date("2026-11-26T18:00:00Z"));

        expect(result.map((e) => e.status)).toEqual(["past", "upcoming", "upcoming"]);
        expect(Object.keys(result[0]).sort()).toEqual(Object.keys(cached[0]).sort());
        expect(cached[0].status).toBe("upcoming"); // cache entry not mutated
    });

    it("passes a non-array body (e.g. an error payload) through unchanged", () => {
        expect(withComputedStatus(null as unknown as [], new Date())).toBeNull();
    });
});

describe("buildEventDate", () => {
    const lateNov = new Date("2026-11-26T18:00:00Z");

    it("pins the date to noon Central so the Houston day never shifts", () => {
        expect(buildEventDate("September", "23", "2026", lateNov)?.toISOString()).toBe("2026-09-23T17:00:00.000Z");
    });

    it("reads a year-less January date in late November as next January", () => {
        expect(buildEventDate("January", "15", null, lateNov)?.toISOString()).toBe("2027-01-15T17:00:00.000Z");
    });

    it("keeps a year-less date from last week in the current year, so it can expire", () => {
        expect(buildEventDate("November", "20", undefined, lateNov)?.toISOString()).toBe("2026-11-20T17:00:00.000Z");
    });

    it("rejects impossible dates and unknown months", () => {
        expect(buildEventDate("February", "31", "2027", lateNov)).toBeNull();
        expect(buildEventDate("Smarch", "1", "2027", lateNov)).toBeNull();
    });
});
