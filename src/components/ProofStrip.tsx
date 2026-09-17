import { Calendar } from "lucide-react";
import { useEvents, type MeetupEvent } from "@/hooks/useEvents";
import { proofStats } from "@/data/proofStats";

const CLUB_TIME_ZONE = "America/Chicago";

/** Calendar date in the club's timezone, as YYYY-MM-DD (en-CA yields ISO order). */
function clubCalendarDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CLUB_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * The next event worth advertising, or null.
 *
 * Filtering on the date rather than on request success is deliberate:
 * /api/events answers HTTP 200 with *stale cached* data when the upstream feed
 * is failing, and the response body carries no freshness marker, so a
 * successful request is not evidence the event is still in the future.
 *
 * Comparison is by calendar date, not by instant: the feed parser stamps
 * events at noon Central, so comparing timestamps would drop a 4pm event from
 * lunchtime onward on the very day it happens.
 */
export function selectNextEvent(
  events: MeetupEvent[] | undefined,
  now: Date = new Date(),
): MeetupEvent | null {
  if (!events?.length) return null;

  const today = clubCalendarDate(now);

  const upcoming = events
    .filter((event) => event.status === "upcoming" && event.rawDate)
    .filter((event) => {
      const parsed = new Date(event.rawDate as string);
      if (Number.isNaN(parsed.getTime())) return false;
      return clubCalendarDate(parsed) >= today;
    })
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
  const { data: events } = useEvents();
  const nextEvent = selectNextEvent(events);

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
                  <span className="font-heading text-2xl font-semibold text-foreground">
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                </span>
                <span className="sr-only">{stat.accessibleLabel}</span>
              </>
            ) : (
              <>
                <span className="font-heading text-2xl font-semibold text-foreground">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </>
            )}
          </li>
        ))}

        {/* Omitted entirely when the feed fails, is empty, lacks dates, or
            holds only past events — never a stale or placeholder claim. */}
        {nextEvent && (
          <li className="flex items-center gap-2 text-sm">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-foreground">{nextEvent.title}</span>
            <span className="text-muted-foreground">{nextEvent.date}</span>
          </li>
        )}
      </ul>

      <p className="text-xs text-muted-foreground/60">
        Meetup figures as of {formatAsOf(proofStats.asOf)}.
      </p>
    </div>
  );
};

export default ProofStrip;
