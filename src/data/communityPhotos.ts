/**
 * Community photos shown on the homepage carousel.
 *
 * These are illustrative — proof that real students show up, not a dated
 * event log. Like most club sites, a photo doesn't need to be pinned to a
 * specific named event or exact date to do that job.
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
 * to anyone who already loaded it. Use date-stamped names (the date a photo
 * was added, not necessarily the date it depicts) and add a new file.
 *
 * Only organization-supplied photos the club is permitted to publish belong
 * here. Never hotlink or import from Meetup or social media. Don't identify
 * individuals in alt text unless names are explicitly supplied for that
 * purpose.
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
  /** Short line shown under the photo. */
  caption: string;
  /** Optional — only set when a specific event is confidently known. */
  event?: string;
  /** Optional ISO YYYY-MM-DD — only set alongside a confirmed `event`. */
  date?: string;
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

export const communityPhotos: CommunityPhoto[] = [
  {
    id: "community-2026-09-16-01",
    src: "/community/2026-09-16-community-01.webp",
    srcSmall: "/community/2026-09-16-community-01-600.webp",
    width: 1200,
    height: 750,
    alt: "A group of students in a classroom making hand signs together, with a thank-you message for the club's sponsor displayed on the screens behind them.",
    caption: "Wrapping up a session together",
    category: "gbm",
  },
  {
    id: "community-2026-09-16-02",
    src: "/community/2026-09-16-community-02.webp",
    srcSmall: "/community/2026-09-16-community-02-600.webp",
    width: 1200,
    height: 750,
    alt: "A large group of students posing together in a classroom, with an AWS Builder Center community tour slide displayed on the screens behind them.",
    caption: "Meeting up with the wider AWS builder community",
    category: "speaker",
  },
  {
    id: "community-2026-09-16-03",
    src: "/community/2026-09-16-community-03.webp",
    srcSmall: "/community/2026-09-16-community-03-600.webp",
    width: 1200,
    height: 750,
    alt: "A large group of students posing on a lecture hall stage, with an introductory cloud computing slide displayed on the screens behind them.",
    caption: "Learning the cloud together",
    category: "workshop",
  },
  {
    id: "community-2026-09-16-04",
    src: "/community/2026-09-16-community-04.webp",
    srcSmall: "/community/2026-09-16-community-04-600.webp",
    width: 1200,
    height: 750,
    alt: "A group of students taking a smiling group selfie together with gold balloon decorations in the background.",
    caption: "Celebrating with the club",
    category: "social",
  },
];

/** The slides actually rendered, newest first and capped. */
export function getCommunityPhotos(
  photos: CommunityPhoto[] = communityPhotos,
): CommunityPhoto[] {
  return photos.slice(0, MAX_COMMUNITY_PHOTOS);
}
