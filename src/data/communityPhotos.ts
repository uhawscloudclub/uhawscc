/**
 * Community photos shown on the homepage carousel.
 *
 * ── Adding or replacing a photo ──────────────────────────────────────────────
 * 1. Export TWO WebP variants of the same image, same aspect ratio:
 *      <name>.webp        ~1200px wide, ≤120 KB
 *      <name>-600.webp     ~600px wide, ≤70 KB
 *    The build does NOT resize. `vite-plugin-image-optimizer` only re-encodes,
 *    so an oversized file stays oversized — resize before committing.
 * 2. Drop both into `public/community/`.
 * 3. Add a record below with the image's real intrinsic width/height (of the
 *    1200px variant) so the layout can reserve space and avoid layout shift.
 *
 * NEVER overwrite an existing filename. Express serves `public/` with a
 * one-year cache lifetime, so a reused name would keep serving the old image
 * to anyone who already loaded it. Use date-stamped names and add a new file.
 *
 * Only organization-supplied photos the club is permitted to publish belong
 * here. Never hotlink or import from Meetup or social media.
 */

export interface CommunityPhoto {
  /** Stable and never reused, even if the photo is removed. */
  id: string;
  /** ~1200px-wide WebP, e.g. "/community/2026-09-08-gbm-01.webp". */
  src: string;
  /** ~600px-wide WebP of the same image. */
  srcSmall: string;
  /** Intrinsic dimensions of `src` — required to reserve layout space. */
  width: number;
  height: number;
  /** Describes what is visually meaningful. Never empty. */
  alt: string;
  /** Short line shown under the photo; identifies the activity. */
  caption: string;
  /** Human-readable event name, e.g. "First General Body Meeting". */
  event: string;
  /** ISO YYYY-MM-DD. */
  date: string;
  category:
    | "workshop"
    | "gbm"
    | "hackathon"
    | "competition"
    | "social"
    | "speaker"
    | "career";
}

/** Upper bound on slides rendered. This is proof of activity, not a gallery. */
export const MAX_COMMUNITY_PHOTOS = 8;

/**
 * Newest first. Empty until approved photos are supplied — the homepage
 * renders no photo section at all while this is empty, which is the intended
 * behaviour rather than a placeholder.
 */
export const communityPhotos: CommunityPhoto[] = [];

/** The slides actually rendered, newest first and capped. */
export function getCommunityPhotos(
  photos: CommunityPhoto[] = communityPhotos,
): CommunityPhoto[] {
  return photos.slice(0, MAX_COMMUNITY_PHOTOS);
}
