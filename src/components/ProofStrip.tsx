import { type MeetupEvent } from "@/hooks/useEvents";
import { proofStats } from "@/data/proofStats";
import CountUp from "@/components/CountUp";
import { hasValidEventDate, isUpcomingEvent } from "../../server/eventDates.js";

/**
 * The next event worth advertising, or null.
 *
 * Filtering on the date rather than on request success is deliberate:
 * /api/events answers HTTP 200 with *stale cached* data when the upstream feed
 * is failing, so a successful request is not evidence the event is still in
 * the future.
 *
 * Expiry uses the same Houston-calendar-day rule as the Events page
 * (server/eventDates.js), so an event stays "next" through the day it happens.
 * Unlike the Events page, an undated or invalid-dated event is never
 * advertised here: a homepage teaser without a date isn't useful.
 */
export function selectNextEvent(
  events: MeetupEvent[] | undefined,
  now: Date = new Date(),
): MeetupEvent | null {
  if (!events?.length) return null;

  const upcoming = events
    .filter((event) => event.status === "upcoming" && hasValidEventDate(event.rawDate))
    .filter((event) => isUpcomingEvent(event, now))
    .sort(
      (a, b) =>
        new Date(a.rawDate as string).getTime() -
        new Date(b.rawDate as string).getTime(),
    );

  return upcoming[0] ?? null;
}

function formatAsOf(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const ProofStrip = () => {
  // The next event itself is shown by <NextEvent /> right above this strip;
  // selectNextEvent stays exported from here for it.
  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-wrap items-baseline gap-x-10 gap-y-4">
        {proofStats.stats.map((stat) => (
          <li key={stat.id} className="flex items-baseline gap-2">
            {stat.accessibleLabel ? (
              <>
                {/* "4.9 from 10 Meetup ratings" does not read well aloud, so
                    the visual shorthand is hidden and replaced for AT. */}
                <span aria-hidden="true" className="flex items-baseline gap-2">
                  <CountUp value={stat.value} className="font-heading text-2xl font-semibold text-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                </span>
                <span className="sr-only">{stat.accessibleLabel}</span>
              </>
            ) : (
              <>
                <CountUp value={stat.value} className="font-heading text-2xl font-semibold text-foreground" />
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </>
            )}
          </li>
        ))}

      </ul>

      <p className="text-xs text-muted-foreground/60">
        Meetup figures as of {formatAsOf(proofStats.asOf)}.
      </p>
    </div>
  );
};

export default ProofStrip;
