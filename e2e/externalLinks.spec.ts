import { test, expect } from "@playwright/test";
import { EXTERNAL_LINKS } from "../src/config/externalLinks";

test.describe("External link attributes", () => {
    test("all external links have rel=noopener noreferrer", async ({ page }) => {
        await page.goto("/");
        const externalLinks = await page
            .locator('a[target="_blank"]')
            .all();
        expect(externalLinks.length).toBeGreaterThan(0);
        for (const link of externalLinks) {
            const rel = await link.getAttribute("rel");
            expect(rel).toContain("noopener");
            expect(rel).toContain("noreferrer");
        }
    });

    test("Join Our Community CTA points to the Meetup URL", async ({ page }) => {
        await page.goto("/");
        const link = page.getByRole("link", { name: /Join Our Community/i });
        await expect(link).toHaveAttribute("href", EXTERNAL_LINKS.meetup);
    });

    test("Join the Club nav CTA points to the Meetup URL", async ({ page }) => {
        await page.goto("/");
        const links = page.getByRole("link", { name: /Join the Club/i });
        await expect(links.first()).toHaveAttribute("href", EXTERNAL_LINKS.meetup);
    });

    test("RSVP on Meetup buttons on Events page point to the Meetup URL", async ({
        page,
    }) => {
        await page.goto("/events");
        const rsvpLinks = page.getByRole("link", { name: /RSVP on Meetup/i });
        const count = await rsvpLinks.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(rsvpLinks.nth(i)).toHaveAttribute(
                "href",
                EXTERNAL_LINKS.meetup,
            );
        }
    });

    test("Apply to Join CTA on Team page points to the Meetup URL", async ({
        page,
    }) => {
        await page.goto("/team");
        const applyLinks = page.getByRole("link", { name: /Apply to Join/i });
        await expect(applyLinks.first()).toHaveAttribute(
            "href",
            EXTERNAL_LINKS.meetup,
        );
    });
});
