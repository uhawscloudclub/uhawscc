import { describe, expect, it } from "vitest";
import { EXTERNAL_LINKS } from "@/config/externalLinks";

describe("EXTERNAL_LINKS config", () => {
    it("has non-empty meetup URL", () => {
        expect(EXTERNAL_LINKS.meetup).toBeTruthy();
    });

    it("has non-empty discord URL", () => {
        expect(EXTERNAL_LINKS.discord).toBeTruthy();
    });

    it("has non-empty linkedin URL", () => {
        expect(EXTERNAL_LINKS.linkedin).toBeTruthy();
    });

    it("has non-empty instagram URL", () => {
        expect(EXTERNAL_LINKS.instagram).toBeTruthy();
    });

    it("has non-empty emailContact value", () => {
        expect(EXTERNAL_LINKS.emailContact).toBeTruthy();
    });

    it("emailContact passes basic email format validation", () => {
        expect(EXTERNAL_LINKS.emailContact).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it("all URL values start with https://", () => {
        const urlKeys = ["meetup", "discord", "linkedin", "instagram"] as const;
        urlKeys.forEach((key) => {
            expect(EXTERNAL_LINKS[key]).toMatch(/^https:\/\//);
        });
    });
});
