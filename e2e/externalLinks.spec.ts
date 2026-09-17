import { test, expect } from "@playwright/test";
import { EXTERNAL_LINKS } from "../src/config/externalLinks";

// Events.tsx currently filters purely on the literal `status` field, not on
// `rawDate` — so a fixed past calendar date would NOT actually break this
// test today. It's still worth avoiding: `rawDate`/date-based filtering is
// exactly the pattern ProofStrip.selectNextEvent already uses on the
// homepage, so a future date-aware Events page is plausible. Computed
// relative to the test run instead of a fixed year, so this can't go stale.
const FIXTURE_EVENT_DATE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
FIXTURE_EVENT_DATE.setUTCHours(17, 0, 0, 0); // noon America/Chicago, matching the real feed's convention

const FIXTURE_EVENT = {
    id: "https://www.meetup.com/aws-sbg-at-univ-of-houston/events/999999/",
    title: "Fixture Workshop",
    date: FIXTURE_EVENT_DATE.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "America/Chicago",
    }),
    rawDate: FIXTURE_EVENT_DATE.toISOString(),
    link: "https://www.meetup.com/aws-sbg-at-univ-of-houston/events/999999/",
    description: "A deterministic fixture event.",
    status: "upcoming" as const,
};

test.describe("External link attributes", () => {
    test("all external links have rel=noopener noreferrer", async ({ page }) => {
        await page.goto("/");
        const externalLinks = await page.locator('a[target="_blank"]').all();
        expect(externalLinks.length).toBeGreaterThan(0);
        for (const link of externalLinks) {
            const rel = await link.getAttribute("rel");
            expect(rel).toContain("noopener");
            expect(rel).toContain("noreferrer");
        }
    });

    test("Join our community CTA points to the Meetup URL", async ({ page }) => {
        await page.goto("/");
        // .first() rather than a strict locator: the homepage may legitimately
        // carry more than one join affordance.
        const link = page.getByRole("link", { name: /Join our community/i }).first();
        await expect(link).toHaveAttribute("href", EXTERNAL_LINKS.meetup);
    });

    test("Join the Club nav CTA points to the Meetup URL", async ({ page }) => {
        await page.goto("/");
        const links = page.getByRole("link", { name: /Join the Club/i });
        await expect(links.first()).toHaveAttribute("href", EXTERNAL_LINKS.meetup);
    });

    test("event RSVP CTA points to that event's own Meetup URL", async ({
        page,
    }) => {
        // Served from a fixture, not the live Meetup feed: browser tests must
        // not depend on a third-party API that can be empty, slow, or stale.
        await page.route("**/api/events", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify([FIXTURE_EVENT]),
            });
        });

        await page.goto("/events");

        // Each RSVP CTA links to the specific event, not the group page.
        const rsvp = page.getByRole("link", {
            name: /View time, location, and RSVP on Meetup/i,
        });
        await expect(rsvp.first()).toHaveAttribute("href", FIXTURE_EVENT.link);
        await expect(rsvp.first()).toHaveAttribute("target", "_blank");
    });

    test("Join our community CTA on Team page points to the Meetup URL", async ({
        page,
    }) => {
        await page.goto("/team");
        const joinLinks = page.getByRole("link", { name: /Join our community/i });
        await expect(joinLinks.first()).toHaveAttribute(
            "href",
            EXTERNAL_LINKS.meetup,
        );
    });
});
