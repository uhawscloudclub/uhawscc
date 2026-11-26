import { test, expect, devices, type Page } from "@playwright/test";

// Events journey with a mocked /api/events and a pinned clock, so results don't
// depend on Meetup's live feed or today's date. Runs in both Playwright
// configs: dev server (playwright.config.ts) and production build
// (playwright.prod.config.ts).

// Phone emulation taken from devices["iPhone 13"] minus its defaultBrowserType
// (WebKit), which can't be changed inside a describe block; stays on Chromium.
const phone = devices["iPhone 13"];
const iPhone13 = {
    viewport: phone.viewport,
    userAgent: phone.userAgent,
    deviceScaleFactor: phone.deviceScaleFactor,
    isMobile: phone.isMobile,
    hasTouch: phone.hasTouch,
};

const MEETUP = "https://www.meetup.com/aws-sbg-at-univ-of-houston/events";

const events = [
    // Ended yesterday (Houston). A stale cache could still mark it upcoming.
    { id: "old", title: "Yesterday's Workshop", date: "Tuesday, December 1, 2026", rawDate: "2026-12-01T17:00:00.000Z", link: `${MEETUP}/100/`, description: "Already happened.", status: "upcoming" },
    // Today in Houston.
    { id: "today", title: "Today's Study Session", date: "Wednesday, December 2, 2026", rawDate: "2026-12-02T17:00:00.000Z", link: `${MEETUP}/200/`, description: "Happening today.", status: "upcoming" },
    // No date found in the description.
    { id: "undated", title: "Spring Kickoff", date: "See Meetup for date & time", rawDate: null, link: `${MEETUP}/300/`, description: "Date coming soon.", status: "upcoming" },
];

async function openEvents(page: Page, response: { status: number; body: unknown }) {
    // 10 PM Dec 2 in Houston (CST) = 04:00 UTC Dec 3.
    await page.clock.setFixedTime(new Date("2026-12-03T04:00:00Z"));
    await page.route("**/api/events", (route) =>
        route.fulfill({ status: response.status, contentType: "application/json", body: JSON.stringify(response.body) }),
    );
    await page.goto("/events");
}

for (const [label, use] of [
    ["desktop", { viewport: { width: 1280, height: 800 } }],
    ["mobile", iPhone13],
] as const) {
    test.describe(`Events (${label})`, () => {
        test.use(use);

        test("shows today's and undated events with their own RSVP links, hides expired ones", async ({ page }) => {
            await openEvents(page, { status: 200, body: events });

            const today = page.getByRole("link", { name: "RSVP on Meetup for Today's Study Session" });
            await expect(today).toBeVisible();
            await expect(today).toHaveAttribute("href", `${MEETUP}/200/`);
            await expect(page.getByRole("link", { name: "RSVP on Meetup for Spring Kickoff" })).toHaveAttribute("href", `${MEETUP}/300/`);
            await expect(page.getByText("Date and time on Meetup")).toBeVisible();
            await expect(page.getByText("Yesterday's Workshop")).toHaveCount(0);
        });

        test("feed failure shows retry, Meetup, email, and past events", async ({ page }) => {
            await openEvents(page, { status: 503, body: [] });

            await expect(page.getByText("Couldn't load events right now")).toBeVisible();
            await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
            await expect(page.getByRole("link", { name: "View on Meetup" })).toBeVisible();
            await expect(page.getByRole("link", { name: "uhawscloudclub@gmail.com" })).toHaveAttribute("href", "mailto:uhawscloudclub@gmail.com");
            await expect(page.getByRole("heading", { name: "Past events" })).toBeVisible();
        });
    });
}

test("keyboard: Tab reaches the RSVP link with a visible focus ring", async ({ page }) => {
    await openEvents(page, { status: 200, body: events });
    const rsvp = page.getByRole("link", { name: "RSVP on Meetup for Today's Study Session" });
    await expect(rsvp).toBeVisible();

    for (let i = 0; i < 30; i++) {
        await page.keyboard.press("Tab");
        if (await rsvp.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(rsvp).toBeFocused();
    const outline = await rsvp.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
});
