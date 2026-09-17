import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
    communityPhotos,
    getCommunityPhotos,
    MAX_COMMUNITY_PHOTOS,
    type CommunityPhoto,
} from "@/data/communityPhotos";

/**
 * Verifies the PRODUCTION photo data and the actual files on disk — not just
 * the shape of the type. A record with a typo'd path or an oversized asset
 * would pass every other test in this repo and still break or bloat the site.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../../public");

const LARGE_BUDGET_BYTES = 120 * 1024;
const SMALL_BUDGET_BYTES = 70 * 1024;
const LARGE_TOTAL_BUDGET_BYTES = 960 * 1024;
const SMALL_TOTAL_BUDGET_BYTES = 560 * 1024;
const VALID_CATEGORIES = new Set<CommunityPhoto["category"]>([
    "workshop",
    "gbm",
    "hackathon",
    "competition",
    "social",
    "speaker",
    "career",
]);

function assetPath(publicRelativePath: string): string {
    return path.join(publicDir, publicRelativePath);
}

describe("communityPhotos production data", () => {
    it("is nonempty and capped at MAX_COMMUNITY_PHOTOS", () => {
        expect(communityPhotos.length).toBeGreaterThan(0);
        expect(communityPhotos.length).toBeLessThanOrEqual(MAX_COMMUNITY_PHOTOS);
        expect(getCommunityPhotos()).toHaveLength(
            Math.min(communityPhotos.length, MAX_COMMUNITY_PHOTOS),
        );
    });

    it("gives every record a stable, unique id", () => {
        const ids = communityPhotos.map((p) => p.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const id of ids) expect(id.trim().length).toBeGreaterThan(0);
    });

    it("declares 1200x750 intrinsic dimensions for every record", () => {
        for (const photo of communityPhotos) {
            expect(photo.width, photo.id).toBe(1200);
            expect(photo.height, photo.id).toBe(750);
        }
    });

    it("has nonempty alt text and caption, and a valid category, for every record", () => {
        for (const photo of communityPhotos) {
            expect(photo.alt.trim().length, `${photo.id} alt`).toBeGreaterThan(0);
            expect(photo.caption.trim().length, `${photo.id} caption`).toBeGreaterThan(0);
            expect(VALID_CATEGORIES.has(photo.category), `${photo.id} category`).toBe(true);
        }
    });

    it("points both variants at files that actually exist under public/", () => {
        for (const photo of communityPhotos) {
            for (const relPath of [photo.src, photo.srcSmall]) {
                expect(existsSync(assetPath(relPath)), relPath).toBe(true);
            }
        }
    });

    it("keeps every individual asset within its byte budget", () => {
        for (const photo of communityPhotos) {
            const largeSize = statSync(assetPath(photo.src)).size;
            const smallSize = statSync(assetPath(photo.srcSmall)).size;
            expect(largeSize, `${photo.src} (${(largeSize / 1024).toFixed(1)} KB)`)
                .toBeLessThanOrEqual(LARGE_BUDGET_BYTES);
            expect(smallSize, `${photo.srcSmall} (${(smallSize / 1024).toFixed(1)} KB)`)
                .toBeLessThanOrEqual(SMALL_BUDGET_BYTES);
        }
    });

    it("keeps the curated set's combined transfer within the total byte budgets", () => {
        const curated = getCommunityPhotos();
        const largeTotal = curated.reduce(
            (sum, p) => sum + statSync(assetPath(p.src)).size,
            0,
        );
        const smallTotal = curated.reduce(
            (sum, p) => sum + statSync(assetPath(p.srcSmall)).size,
            0,
        );
        expect(largeTotal, `${(largeTotal / 1024).toFixed(1)} KB total`)
            .toBeLessThanOrEqual(LARGE_TOTAL_BUDGET_BYTES);
        expect(smallTotal, `${(smallTotal / 1024).toFixed(1)} KB total`)
            .toBeLessThanOrEqual(SMALL_TOTAL_BUDGET_BYTES);
    });

    it("never reuses a filename between records", () => {
        const paths = communityPhotos.flatMap((p) => [p.src, p.srcSmall]);
        expect(new Set(paths).size).toBe(paths.length);
    });
});
