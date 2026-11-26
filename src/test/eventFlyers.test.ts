import { describe, expect, it } from "vitest";
import { PAST_EVENTS } from "@/data/pastEvents";
import { flyerFor } from "@/data/eventFlyers";

describe("event flyers", () => {
    it("has a self-hosted flyer for every past event", () => {
        for (const ev of PAST_EVENTS) expect(flyerFor(ev.meetupUrl), ev.title).toMatch(/\.webp/);
    });

    it("returns nothing for an unknown or malformed event URL", () => {
        expect(flyerFor("https://www.meetup.com/aws-sbg-at-univ-of-houston/events/1/")).toBeUndefined();
        expect(flyerFor("not a url")).toBeUndefined();
    });
});
