import { test, expect, devices, type Page } from "@playwright/test";

// Homepage journey: find the next event and a way to join, with a mocked
// /api/events and a pinned clock. Runs in both Playwright configs.

const phone = devices["iPhone 13"];
const iPhone13 = {
    viewport: phone.viewport,
    userAgent: phone.userAgent,
    deviceScaleFactor: phone.deviceScaleFactor,
    isMobile: phone.isMobile,
    hasTouch: phone.hasTouch,
};

const MEETUP_GROUP = "https://www.meetup.com/aws-sbg-at-univ-of-houston/";
const nextEvent = {
    id: "next",
    title: "Intro to Lambda",
    date: "Wednesday, December 9, 2026",
    rawDate: "2026-12-09T17:00:00.000Z",
    link: "https://www.meetup.com/aws-sbg-at-univ-of-houston/events/123/",
    description: "Build a function.",
    status: "upcoming",
};

async function openHome(page: Page, events: unknown[], status = 200) {
    await page.clock.setFixedTime(new Date("2026-12-02T18:00:00Z"));
    await page.route("**/api/events", (route) =>
        route.fulfill({ status, contentType: "application/json", body: JSON.stringify(events) }),
    );
    await page.goto("/");
}

for (const [label, use] of [
    ["desktop", { viewport: { width: 1280, height: 800 } }],
    ["mobile", iPhone13],
] as const) {
    test.describe(`Homepage join journey (${label})`, () => {
        test.use(use);

        test("next event and its RSVP link are within one scroll of the top", async ({ page }) => {
            await openHome(page, [nextEvent]);
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            const rsvp = page.getByRole("link", { name: "RSVP on Meetup for Intro to Lambda" });
            await expect(rsvp).toBeInViewport();
            await expect(rsvp).toHaveAttribute("href", nextEvent.link);
        });

        test("with nothing scheduled, offers Meetup notifications and past events", async ({ page }) => {
            await openHome(page, []);
            await expect(page.getByText(/Nothing is scheduled yet/)).toBeVisible();
            await expect(page.getByRole("link", { name: /Get notified on Meetup/ })).toHaveAttribute("href", MEETUP_GROUP);
            await page.getByRole("link", { name: /See past events/ }).click();
            await expect(page).toHaveURL(/\/events$/);
            await expect(page.getByRole("heading", { name: "Past events" })).toBeVisible();
        });

        test("Ways to join links each channel, including the interest form", async ({ page }) => {
            await openHome(page, []);
            const section = page.getByRole("region", { name: "Ways to join" });
            await section.scrollIntoViewIfNeeded();
            await expect(section.getByRole("link", { name: /Join on Meetup/ })).toHaveAttribute("href", MEETUP_GROUP);
            await expect(section.getByRole("link", { name: /Fill out the form/ })).toHaveAttribute(
                "href",
                "https://forms.cloud.microsoft/r/XiLmEDbKSw",
            );
            await expect(section.getByRole("link", { name: /Join the Discord/ })).toHaveAttribute("href", /discord\.gg/);
            await section.getByRole("link", { name: /Contact us/ }).click();
            await expect(page).toHaveURL(/\/contact$/);
        });
    });
}

test("keyboard: Tab reaches the next event's RSVP link with a visible focus ring", async ({ page }) => {
    await openHome(page, [nextEvent]);
    const rsvp = page.getByRole("link", { name: "RSVP on Meetup for Intro to Lambda" });
    await expect(rsvp).toBeVisible();
    for (let i = 0; i < 30; i++) {
        await page.keyboard.press("Tab");
        if (await rsvp.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(rsvp).toBeFocused();
    expect(await rsvp.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
});
