import { describe, expect, it } from "vitest";
import { buildIcs, countdownLabel, daysUntilEvent, icsFileName } from "@/lib/eventCalendar";

const noonDec9 = "2026-12-09T18:00:00.000Z"; // noon Central

describe("countdown", () => {
    it("counts Houston calendar days, not 24-hour blocks", () => {
        // 11:30 PM Dec 8 in Houston is already Dec 9 in UTC; still one day away.
        expect(daysUntilEvent(noonDec9, new Date("2026-12-09T05:30:00Z"))).toBe(1);
        expect(countdownLabel(noonDec9, new Date("2026-12-09T05:30:00Z"))).toBe("Tomorrow");
        expect(countdownLabel(noonDec9, new Date("2026-12-09T15:00:00Z"))).toBe("Today");
        expect(countdownLabel(noonDec9, new Date("2026-12-02T18:00:00Z"))).toBe("In 7 days");
    });

    it("survives a DST change in between", () => {
        // US DST ends Nov 1, 2026.
        expect(daysUntilEvent("2026-11-03T18:00:00.000Z", new Date("2026-10-30T17:00:00Z"))).toBe(4);
    });

    it("gives no label for past or invalid dates", () => {
        expect(countdownLabel(noonDec9, new Date("2026-12-11T18:00:00Z"))).toBeNull();
        expect(countdownLabel("not a date")).toBeNull();
    });
});

describe("buildIcs", () => {
    const event = {
        id: "https://www.meetup.com/aws-sbg-at-univ-of-houston/events/312345678/",
        title: "Intro to Lambda, Part 1; Hands-on",
        rawDate: noonDec9,
        link: "https://www.meetup.com/aws-sbg-at-univ-of-houston/events/312345678/",
    };

    it("is an all-day entry for the Houston day that points to Meetup", () => {
        const ics = buildIcs(event, new Date("2026-12-01T12:00:00Z"))!;
        expect(ics).toContain("BEGIN:VCALENDAR\r\n");
        expect(ics).toContain("DTSTART;VALUE=DATE:20261209\r\n");
        expect(ics).toContain("DTEND;VALUE=DATE:20261210\r\n");
        expect(ics).toContain("DTSTAMP:20261201T120000Z\r\n");
        expect(ics).toContain("SUMMARY:Intro to Lambda\\, Part 1\\; Hands-on\r\n");
        expect(ics).toMatch(/URL:https:\/\/www\.meetup\.com/);
        expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    });

    it("folds long lines to 75 octets", () => {
        const ics = buildIcs({ ...event, title: "x".repeat(200) })!;
        for (const line of ics.split("\r\n")) expect(line.length).toBeLessThanOrEqual(75);
    });

    it("returns null for an invalid date", () => {
        expect(buildIcs({ ...event, rawDate: "nope" })).toBeNull();
    });

    it("makes a safe file name", () => {
        expect(icsFileName("Intro to Lambda, Part 1!")).toBe("intro-to-lambda-part-1.ics");
        expect(icsFileName("!!!")).toBe("event.ics");
    });
});
