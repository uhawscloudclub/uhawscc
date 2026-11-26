import { test, expect, devices, type Page } from "@playwright/test";

// Contact journey with a mocked /api/contact (no email is sent). Runs in both
// Playwright configs. The real Express endpoint is checked separately.

const phone = devices["iPhone 13"];
const iPhone13 = {
    viewport: phone.viewport,
    userAgent: phone.userAgent,
    deviceScaleFactor: phone.deviceScaleFactor,
    isMobile: phone.isMobile,
    hasTouch: phone.hasTouch,
};

async function openContact(page: Page, response: { status: number; body: unknown }) {
    const requests: unknown[] = [];
    await page.route("**/api/contact", async (route) => {
        requests.push(route.request().postDataJSON());
        await route.fulfill({ status: response.status, contentType: "application/json", body: JSON.stringify(response.body) });
    });
    await page.goto("/contact");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    return requests;
}

for (const [label, use] of [
    ["desktop", { viewport: { width: 1280, height: 800 } }],
    ["mobile", iPhone13],
] as const) {
    test.describe(`Contact (${label})`, () => {
        test.use(use);

        test("empty submit marks fields invalid and focuses the first one", async ({ page }) => {
            await openContact(page, { status: 200, body: { ok: true } });
            await page.getByRole("button", { name: /Send message/ }).click();
            const name = page.getByLabel(/^Name/);
            await expect(name).toBeFocused();
            await expect(name).toHaveAttribute("aria-invalid", "true");
            await expect(name).toHaveAccessibleDescription(/Enter your name/);
        });

        test("success: confirmation gets focus and says who replies and when", async ({ page }) => {
            const requests = await openContact(page, { status: 200, body: { ok: true } });
            await page.getByText("Events or learning", { exact: true }).click();
            await page.getByLabel(/^Name/).fill("Ada Lovelace");
            await page.getByLabel(/^Email/).fill("ada@cougarnet.uh.edu");
            await page.getByLabel(/^Message/).fill("When is the next workshop?");
            await page.getByRole("button", { name: /Send message/ }).click();

            await expect(page.getByRole("heading", { name: "Message sent" })).toBeFocused();
            await expect(page.getByText(/An officer will reply to ada@cougarnet\.uh\.edu within 24 hours/)).toBeVisible();
            // Not hidden under the fixed navbar after focus scrolls it into view.
            const clearOfNav = await page.getByRole("heading", { name: "Message sent" }).evaluate(
                (el) => el.getBoundingClientRect().top >= document.querySelector("nav")!.getBoundingClientRect().bottom,
            );
            expect(clearOfNav).toBe(true);
            expect(requests).toHaveLength(1);
            expect((requests[0] as { subject: string }).subject).toBe("Events or learning");
        });

        test("server error is announced with the club email, and input is kept", async ({ page }) => {
            await openContact(page, { status: 503, body: { error: "Contact form is temporarily unavailable. Please email us directly." } });
            await page.getByLabel(/^Name/).fill("Ada Lovelace");
            await page.getByLabel(/^Email/).fill("ada@cougarnet.uh.edu");
            await page.getByLabel(/^Message/).fill("When is the next workshop?");
            await page.getByRole("button", { name: /Send message/ }).click();

            const alert = page.getByRole("alert");
            await expect(alert).toContainText("We couldn't send your message right now. Try again, or email us at sbguh@cougarnet.uh.edu.");
            await expect(alert.getByRole("link", { name: "sbguh@cougarnet.uh.edu" })).toHaveAttribute("href", "mailto:sbguh@cougarnet.uh.edu");
            await expect(page.getByLabel(/^Message/)).toHaveValue("When is the next workshop?");
        });
    });
}

test("keyboard only: pick a reason, fill in, send", async ({ page }) => {
    const requests = await openContact(page, { status: 200, body: { ok: true } });
    const firstReason = page.getByRole("radio", { name: "Joining the club" });
    await firstReason.focus();
    await page.keyboard.press("ArrowRight"); // radios move with arrow keys
    const events = page.getByRole("radio", { name: "Events or learning" });
    await expect(events).toBeChecked();
    // The visible pill (label) shows a focus ring while its hidden radio has focus.
    const ring = await events.evaluate((el) => getComputedStyle(el.closest("label")!).boxShadow);
    expect(ring).not.toBe("none");

    await page.keyboard.press("Tab");
    await page.keyboard.type("Ada Lovelace");
    await page.keyboard.press("Tab");
    await page.keyboard.type("ada@cougarnet.uh.edu");
    await page.keyboard.press("Tab");
    await page.keyboard.type("Workshops");
    await page.keyboard.press("Tab");
    await page.keyboard.type("When is the next workshop?");
    await page.getByRole("button", { name: /Send message/ }).focus();
    await page.keyboard.press("Enter");

    await expect(page.getByRole("heading", { name: "Message sent" })).toBeFocused();
    expect((requests[0] as { subject: string }).subject).toBe("Events or learning: Workshops");
});
