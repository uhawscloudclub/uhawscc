import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
    parseRSS,
    validateFeedResponse,
    isMeetupEventUrl,
    fetchMeetupEvents,
    getEventsWithCache,
} from "../../server/meetupFeed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadFixture(name: string): string {
    return readFileSync(path.join(__dirname, "fixtures/rss", name), "utf-8");
}

const validFeed = loadFixture("valid-with-event.xml");
const validEmptyFeed = loadFixture("valid-empty.xml");
const htmlErrorPage = loadFixture("html-error-page.html");
const malformedNotRss = loadFixture("malformed-not-rss.xml");
const missingLinkFeed = loadFixture("missing-link-item.xml");
const truncatedRss = loadFixture("truncated-rss.xml");
const linkValidationFeed = loadFixture("link-validation.xml");
const invalidNestingRss = loadFixture("invalid-nesting.xml");
const cdataLiteralItemFeed = loadFixture("cdata-with-literal-item-tag.xml");

/** A minimal fake fetch Response, shaped enough for fetchMeetupEvents. */
function fakeResponse({ ok, status, contentType, body }: { ok: boolean; status: number; contentType: string | null; body: string }) {
    return {
        ok,
        status,
        headers: { get: (name: string) => (name.toLowerCase() === "content-type" ? contentType : null) },
        text: async () => body,
    };
}

/** A cache store backed by a plain in-memory value, mirroring server.js's real one. */
function makeCacheStore(initial: { data: unknown; fetchedAt: number }) {
    let state = initial;
    return {
        get: () => state,
        set: (next: { data: unknown; fetchedAt: number }) => { state = next; },
        _read: () => state, // test-only escape hatch to inspect current state
    };
}

describe("parseRSS", () => {
    it("parses the workshop title and link from a valid feed", () => {
        const events = parseRSS(validFeed);
        expect(events).toHaveLength(1);
        expect(events[0].title).toBe("Git and GitHub Foundations Workshop");
        expect(events[0].link).toBe(
            "https://www.meetup.com/aws-sbg-at-university-of-houston-sugar-land-campus/events/316558414/",
        );
    });

    it("resolves the event date from the description (Sep 23), not the pubDate (Sep 14)", () => {
        // The fixture's description doesn't state a year, so parseRSS falls back to
        // the current year — pin "now" so the assertion is deterministic regardless
        // of the date this test actually runs on.
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
        try {
            const [event] = parseRSS(validFeed);
            // The fixture's <pubDate> is Mon, 14 Sep 2026 — the publication date.
            // The event itself is described as happening "Wednesday, September 23".
            expect(event.date).toContain("September 23");
            expect(event.date).not.toContain("September 14");
            expect(event.rawDate).toBe("2026-09-23T17:00:00.000Z"); // noon CT = 17:00 UTC
        } finally {
            vi.useRealTimers();
        }
    });

    it("returns an empty array for a valid feed with zero items", () => {
        expect(parseRSS(validEmptyFeed)).toEqual([]);
    });

    it("skips an item that has neither a link nor a guid", () => {
        const events = parseRSS(missingLinkFeed);
        expect(events).toHaveLength(1);
        expect(events[0].title).toBe("Valid Event");
    });

    it("only accepts absolute HTTPS Meetup event URLs as the RSVP link, skipping the rest", () => {
        const events = parseRSS(linkValidationFeed);
        expect(events.map((e) => e.title)).toEqual(["Valid link", "Valid guid, no link"]);
        expect(events[0].link).toBe("https://www.meetup.com/example/events/1/");
        // Falls back to a valid guid when <link> is absent.
        expect(events[1].link).toBe("https://www.meetup.com/example/events/2/");
    });
});

describe("isMeetupEventUrl", () => {
    const cases: Array<[string | null, boolean]> = [
        ["https://www.meetup.com/aws-sbg-at-univ-of-houston/events/12345/", true], // valid event-detail URL
        ["https://meetup.com/aws-sbg-at-univ-of-houston/events/12345/", true], // apex domain, still valid
        ["https://www.meetup.com/aws-sbg-at-univ-of-houston/events/12345", true], // no trailing slash
        ["event-123", false], // non-URL guid
        ["https://evil.com/events/123/", false], // unexpected host
        ["https://www.meetup.com.evil.com/events/123/", false], // misleading hostname (substring trap)
        ["javascript:alert(1)", false], // unsafe scheme
        ["http://www.meetup.com/events/123/", false], // http, not https
        ["https://www.meetup.com/aws-sbg-at-univ-of-houston/events/", false], // group event-LIST URL, no event id
        ["https://www.meetup.com/aws-sbg-at-univ-of-houston/", false], // group home page, no /events/ segment at all
        ["https://www.meetup.com/some/unrelated/path/", false], // unrelated path shape
        ["", false],
        [null, false],
    ];

    it.each(cases)("isMeetupEventUrl(%s) -> %s", (input, expected) => {
        expect(isMeetupEventUrl(input)).toBe(expected);
    });
});

describe("validateFeedResponse", () => {
    it("accepts a valid RSS response", () => {
        const result = validateFeedResponse({
            ok: true,
            status: 200,
            contentType: "application/rss+xml; charset=UTF-8",
            body: validFeed,
        });
        expect(result.valid).toBe(true);
    });

    it("rejects a non-OK HTTP status", () => {
        const result = validateFeedResponse({
            ok: false,
            status: 503,
            contentType: "text/html",
            body: htmlErrorPage,
        });
        expect(result.valid).toBe(false);
    });

    it("rejects an HTML response served with HTTP 200", () => {
        const result = validateFeedResponse({
            ok: true,
            status: 200,
            contentType: "text/html; charset=utf-8",
            body: htmlErrorPage,
        });
        expect(result.valid).toBe(false);
        expect(result.reason).toMatch(/content-type|html/i);
    });

    it("rejects well-formed XML that isn't an RSS channel", () => {
        const result = validateFeedResponse({
            ok: true,
            status: 200,
            contentType: "application/xml",
            body: malformedNotRss,
        });
        expect(result.valid).toBe(false);
        expect(result.reason).toMatch(/rss|channel/i);
    });

    it("rejects a truncated RSS response that has opening tags but no closing structure", () => {
        // This would pass a naive "does it contain <rss>/<channel>" check —
        // the point of this fixture is that it must NOT pass validation.
        const result = validateFeedResponse({
            ok: true,
            status: 200,
            contentType: "application/rss+xml",
            body: truncatedRss,
        });
        expect(result.valid).toBe(false);
        expect(result.reason).toMatch(/well-formed|xml/i);
    });

    it("rejects invalid nesting — <rss><channel></rss></channel> — that a mere tag-presence check would accept", () => {
        const result = validateFeedResponse({
            ok: true,
            status: 200,
            contentType: "application/rss+xml",
            body: invalidNestingRss,
        });
        expect(result.valid).toBe(false);
        expect(result.reason).toMatch(/well-formed|xml/i);
    });

    it("accepts a valid feed whose CDATA description contains literal \"<item>\" text", () => {
        // A naive regex that counts <item>/</item> occurrences across the raw
        // text (rather than parsing) would be confused by this — the point of
        // this fixture is proving the real XML parser correctly treats CDATA
        // content as opaque text, not markup.
        const result = validateFeedResponse({
            ok: true,
            status: 200,
            contentType: "application/rss+xml",
            body: cdataLiteralItemFeed,
        });
        expect(result.valid).toBe(true);
    });
});

describe("fetchMeetupEvents", () => {
    const url = "https://www.meetup.com/aws-sbg-at-univ-of-houston/events/rss/";

    it("returns parsed events for a valid feed", async () => {
        const fetchImpl = vi.fn().mockResolvedValue(
            fakeResponse({ ok: true, status: 200, contentType: "application/rss+xml", body: validFeed }),
        );
        const events = await fetchMeetupEvents({ url, fetchImpl });
        expect(events).toHaveLength(1);
        expect(events[0].title).toBe("Git and GitHub Foundations Workshop");
    });

    it("returns an empty array for a valid empty feed", async () => {
        const fetchImpl = vi.fn().mockResolvedValue(
            fakeResponse({ ok: true, status: 200, contentType: "application/rss+xml", body: validEmptyFeed }),
        );
        expect(await fetchMeetupEvents({ url, fetchImpl })).toEqual([]);
    });

    it("throws on an HTML-200 response instead of silently returning []", async () => {
        const fetchImpl = vi.fn().mockResolvedValue(
            fakeResponse({ ok: true, status: 200, contentType: "text/html", body: htmlErrorPage }),
        );
        await expect(fetchMeetupEvents({ url, fetchImpl })).rejects.toThrow(/Invalid Meetup feed response/);
    });

    it("throws on a truncated/incomplete RSS response", async () => {
        const fetchImpl = vi.fn().mockResolvedValue(
            fakeResponse({ ok: true, status: 200, contentType: "application/rss+xml", body: truncatedRss }),
        );
        await expect(fetchMeetupEvents({ url, fetchImpl })).rejects.toThrow(/Invalid Meetup feed response/);
    });

    it("throws on a non-200 upstream status", async () => {
        const fetchImpl = vi.fn().mockResolvedValue(
            fakeResponse({ ok: false, status: 503, contentType: "text/html", body: "" }),
        );
        await expect(fetchMeetupEvents({ url, fetchImpl })).rejects.toThrow(/Invalid Meetup feed response/);
    });

    it("propagates a network failure", async () => {
        const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));
        await expect(fetchMeetupEvents({ url, fetchImpl })).rejects.toThrow("network down");
    });

    it("aborts a hung request after the timeout and cleans up the timer", async () => {
        vi.useFakeTimers();
        try {
            const fetchImpl = vi.fn((_url: string, { signal }: { signal: AbortSignal }) =>
                new Promise((_resolve, reject) => {
                    signal.addEventListener("abort", () => reject(new Error("aborted")));
                }),
            );
            const promise = fetchMeetupEvents({ url, fetchImpl, timeoutMs: 50 });
            const assertion = expect(promise).rejects.toThrow("aborted");
            await vi.advanceTimersByTimeAsync(50);
            await assertion;
            // The `finally { clearTimeout(timeout) }` in fetchMeetupEvents should
            // have fired — no lingering scheduled timers left behind.
            expect(vi.getTimerCount()).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });

    it("clears its timeout when the fetch resolves well before the deadline", async () => {
        vi.useFakeTimers();
        try {
            const fetchImpl = vi.fn().mockResolvedValue(
                fakeResponse({ ok: true, status: 200, contentType: "application/rss+xml", body: validEmptyFeed }),
            );
            const events = await fetchMeetupEvents({ url, fetchImpl, timeoutMs: 8000 });
            expect(events).toEqual([]);
            // Same cleanup path as the abort case, just via the success branch —
            // the scheduled abort timer must not be left pending after a fetch
            // that succeeds long before the timeout would have fired.
            expect(vi.getTimerCount()).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });
});

describe("getEventsWithCache", () => {
    const ttlMs = 15 * 60 * 1000;

    it("serves a fresh cache hit without calling fetchEvents", async () => {
        const cachedEvents = [{ id: "1", title: "Cached Event" }];
        const store = makeCacheStore({ data: cachedEvents, fetchedAt: 1000 });
        let called = false;

        const result = await getEventsWithCache({
            cacheStore: store,
            now: 1000 + ttlMs - 1,
            ttlMs,
            fetchEvents: async () => {
                called = true;
                return [];
            },
        });

        expect(called).toBe(false);
        expect(result.status).toBe(200);
        expect(result.body).toBe(cachedEvents);
    });

    it("serves a fresh cached empty array without calling fetchEvents", async () => {
        const store = makeCacheStore({ data: [], fetchedAt: 1000 });
        let called = false;

        const result = await getEventsWithCache({
            cacheStore: store,
            now: 1000 + ttlMs - 1,
            ttlMs,
            fetchEvents: async () => {
                called = true;
                return [{ id: "should-not-be-fetched" }];
            },
        });

        expect(called).toBe(false);
        expect(result.status).toBe(200);
        expect(result.body).toEqual([]);
    });

    it("returns 200 with an empty array for a valid empty feed, replacing the cache", async () => {
        const store = makeCacheStore({ data: null, fetchedAt: 0 });

        const result = await getEventsWithCache({
            cacheStore: store,
            now: 5000,
            ttlMs,
            fetchEvents: async () => [],
        });

        expect(result.status).toBe(200);
        expect(result.body).toEqual([]);
        expect(store._read()).toEqual({ data: [], fetchedAt: 5000 });
    });

    it("never writes to the cache when the fetch fails or the response is invalid", async () => {
        const originalEvents = [{ id: "1", title: "Existing Event" }];
        const store = makeCacheStore({ data: originalEvents, fetchedAt: 0 });

        const result = await getEventsWithCache({
            cacheStore: store,
            now: ttlMs + 5000, // stale by TTL, forcing a refetch attempt
            ttlMs,
            fetchEvents: async () => {
                throw new Error("Invalid Meetup feed response: response body looks like an HTML page, not RSS");
            },
        });

        expect(store._read().data).toBe(originalEvents);
        expect(store._read().fetchedAt).toBe(0); // timestamp untouched too
        expect(result.body).toBe(originalEvents); // served as stale fallback
    });

    it("serves stale data (200) when the fetch fails but a usable cache exists", async () => {
        const originalEvents = [{ id: "1", title: "Existing Event" }];
        const store = makeCacheStore({ data: originalEvents, fetchedAt: 0 });

        const result = await getEventsWithCache({
            cacheStore: store,
            now: ttlMs + 5000,
            ttlMs,
            fetchEvents: async () => {
                throw new Error("upstream returned HTTP 503");
            },
        });

        expect(result.status).toBe(200);
        expect(result.body).toBe(originalEvents);
        expect(result.stale).toBe(true);
    });

    it("returns 503 with an empty array when the fetch fails and no usable cache exists", async () => {
        const store = makeCacheStore({ data: null, fetchedAt: 0 });

        const result = await getEventsWithCache({
            cacheStore: store,
            now: 1000,
            ttlMs,
            fetchEvents: async () => {
                throw new Error("upstream returned HTTP 503");
            },
        });

        expect(result.status).toBe(503);
        expect(result.body).toEqual([]);
    });

    it("returns 503, not stale 200, when the existing cache is a previously-valid empty array", async () => {
        // Regression for the truthy-[] bug: an empty-but-valid cached result
        // must NOT be treated as "usable stale data" on a subsequent failure.
        const store = makeCacheStore({ data: [], fetchedAt: 0 });

        const result = await getEventsWithCache({
            cacheStore: store,
            now: ttlMs + 5000,
            ttlMs,
            fetchEvents: async () => {
                throw new Error("upstream returned HTTP 503");
            },
        });

        expect(result.status).toBe(503);
        expect(result.body).toEqual([]);
    });

    it("a failed concurrent request cannot restore a cache snapshot superseded by a successful one", async () => {
        const store = makeCacheStore({ data: null, fetchedAt: 0 });

        let resolveA: (events: unknown[]) => void;
        let rejectB: (err: Error) => void;
        const pendingA = new Promise<unknown[]>((resolve) => { resolveA = resolve; });
        const pendingB = new Promise<unknown[]>((_resolve, reject) => { rejectB = reject; });

        // Both requests start against the same empty/expired cache.
        const requestA = getEventsWithCache({
            cacheStore: store, now: 1000, ttlMs: 100,
            fetchEvents: () => pendingA,
        });
        const requestB = getEventsWithCache({
            cacheStore: store, now: 1000, ttlMs: 100,
            fetchEvents: () => pendingB,
        });

        // A succeeds first, updating the shared cache.
        const freshEvents = [{ id: "fresh", title: "Fresh Event" }];
        resolveA!(freshEvents);
        const resultA = await requestA;
        expect(resultA.body).toBe(freshEvents);
        expect(store._read().data).toBe(freshEvents);

        // B then fails — it must NOT restore the pre-A snapshot it started with.
        rejectB!(new Error("upstream failed"));
        const resultB = await requestB;

        expect(store._read().data).toBe(freshEvents); // still A's fresh data
        expect(resultB.status).toBe(200);
        expect(resultB.body).toBe(freshEvents); // B's fallback is the CURRENT cache, not its stale start-of-request view
        expect(resultB.stale).toBe(true);
    });
});

describe("fetchMeetupEvents composed with getEventsWithCache (integration)", () => {
    const url = "https://www.meetup.com/aws-sbg-at-univ-of-houston/events/rss/";
    const ttlMs = 15 * 60 * 1000;

    it("an HTML-200 upstream response is rejected before caching and does not overwrite a good cache", async () => {
        const originalEvents = [{ id: "1", title: "Existing Event" }];
        const store = makeCacheStore({ data: originalEvents, fetchedAt: 0 });
        const fetchImpl = vi.fn().mockResolvedValue(
            fakeResponse({ ok: true, status: 200, contentType: "text/html", body: htmlErrorPage }),
        );

        const result = await getEventsWithCache({
            cacheStore: store,
            now: ttlMs + 5000,
            ttlMs,
            fetchEvents: () => fetchMeetupEvents({ url, fetchImpl }),
        });

        expect(result.status).toBe(200);
        expect(result.body).toBe(originalEvents);
        expect(store._read().data).toBe(originalEvents);
        expect(store._read().fetchedAt).toBe(0);
    });

    it("a truncated upstream response preserves an expired nonempty cache and its timestamp", async () => {
        const originalEvents = [{ id: "1", title: "Existing Event" }];
        const store = makeCacheStore({ data: originalEvents, fetchedAt: 42 });
        const fetchImpl = vi.fn().mockResolvedValue(
            fakeResponse({ ok: true, status: 200, contentType: "application/rss+xml", body: truncatedRss }),
        );

        const result = await getEventsWithCache({
            cacheStore: store,
            now: ttlMs + 5000,
            ttlMs,
            fetchEvents: () => fetchMeetupEvents({ url, fetchImpl }),
        });

        expect(result.status).toBe(200);
        expect(result.stale).toBe(true);
        expect(store._read()).toEqual({ data: originalEvents, fetchedAt: 42 });
    });

    it("a valid feed replaces the cache through the real fetch+validate+parse pipeline", async () => {
        const store = makeCacheStore({ data: null, fetchedAt: 0 });
        const fetchImpl = vi.fn().mockResolvedValue(
            fakeResponse({ ok: true, status: 200, contentType: "application/rss+xml", body: validFeed }),
        );

        const result = await getEventsWithCache({
            cacheStore: store,
            now: 5000,
            ttlMs,
            fetchEvents: () => fetchMeetupEvents({ url, fetchImpl }),
        });

        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(1);
        expect(store._read()).toEqual({ data: result.body, fetchedAt: 5000 });
    });

    it("a valid empty feed replaces the cache with [] through the real pipeline", async () => {
        const store = makeCacheStore({ data: null, fetchedAt: 0 });
        const fetchImpl = vi.fn().mockResolvedValue(
            fakeResponse({ ok: true, status: 200, contentType: "application/rss+xml", body: validEmptyFeed }),
        );

        const result = await getEventsWithCache({
            cacheStore: store,
            now: 5000,
            ttlMs,
            fetchEvents: () => fetchMeetupEvents({ url, fetchImpl }),
        });

        expect(result.status).toBe(200);
        expect(result.body).toEqual([]);
        expect(store._read()).toEqual({ data: [], fetchedAt: 5000 });
    });

    it("a feed with invalid nesting is rejected before caching and does not overwrite a good cache", async () => {
        const originalEvents = [{ id: "1", title: "Existing Event" }];
        const store = makeCacheStore({ data: originalEvents, fetchedAt: 7 });
        const fetchImpl = vi.fn().mockResolvedValue(
            fakeResponse({ ok: true, status: 200, contentType: "application/rss+xml", body: invalidNestingRss }),
        );

        const result = await getEventsWithCache({
            cacheStore: store,
            now: ttlMs + 5000,
            ttlMs,
            fetchEvents: () => fetchMeetupEvents({ url, fetchImpl }),
        });

        expect(result.status).toBe(200);
        expect(result.stale).toBe(true);
        expect(store._read()).toEqual({ data: originalEvents, fetchedAt: 7 });
    });

    it("a valid feed whose CDATA contains literal \"<item>\" text is parsed correctly through the real pipeline", async () => {
        const store = makeCacheStore({ data: null, fetchedAt: 0 });
        const fetchImpl = vi.fn().mockResolvedValue(
            fakeResponse({ ok: true, status: 200, contentType: "application/rss+xml", body: cdataLiteralItemFeed }),
        );

        const result = await getEventsWithCache({
            cacheStore: store,
            now: 5000,
            ttlMs,
            fetchEvents: () => fetchMeetupEvents({ url, fetchImpl }),
        });

        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(1);
        expect((result.body as Array<{ title: string }>)[0].title).toBe("CDATA edge case");
    });
});
