import { EXTERNAL_LINKS } from "@/config/externalLinks";

/**
 * Hand-maintained figures shown in the homepage proof strip.
 *
 * Every figure must be verifiable at `source` and carries the America/Chicago
 * calendar date it was last checked. Re-verify before publishing changes —
 * these drift, and `asOf` must never be a future date in the club's timezone.
 *
 * Label these precisely. "members on Meetup" is NOT the same as club members,
 * and overstating it is the fastest way to lose a reader's trust.
 */

export interface ProofStat {
  id: string;
  /** Displayed figure, e.g. "133". */
  value: string;
  /** Displayed label, e.g. "members on Meetup". */
  label: string;
  /**
   * Expanded form for screen readers, used when the visual shorthand
   * (e.g. "4.9 ★") would not read sensibly aloud.
   */
  accessibleLabel?: string;
}

export interface ProofStats {
  /** ISO YYYY-MM-DD, America/Chicago, of the last verification. */
  asOf: string;
  source: string;
  sourceNote: string;
  stats: ProofStat[];
}

export const proofStats: ProofStats = {
  asOf: "2026-09-16",
  // Reuse the single client-side Meetup URL rather than duplicating it here.
  source: EXTERNAL_LINKS.meetup,
  sourceNote: "Verified on the club's public Meetup group page.",
  stats: [
    {
      id: "members",
      value: "133",
      label: "members on Meetup",
    },
    {
      id: "rating",
      value: "4.9",
      label: "from 10 Meetup ratings",
      accessibleLabel: "Rated 4.9 out of 5 from 10 Meetup ratings",
    },
  ],
};
