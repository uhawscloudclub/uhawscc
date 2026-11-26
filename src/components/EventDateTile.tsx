import { hasValidEventDate } from '../../server/eventDates.js';

const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'America/Chicago' });
const dayFmt = new Intl.DateTimeFormat('en-US', { day: 'numeric', timeZone: 'America/Chicago' });

/**
 * Desk-calendar date tile ("Dec" over "9") for an event, in Houston time.
 * Undated events get "TBA". Hidden from screen readers: the full date is
 * always written out next to it.
 */
const EventDateTile = ({ rawDate }: { rawDate: string | null }) => {
  const valid = hasValidEventDate(rawDate);
  const d = valid ? new Date(rawDate as string) : null;
  return (
    <div className="px-date" aria-hidden="true">
      {d ? (
        <>
          <span className="font-body text-xs font-semibold text-muted-foreground">{monthFmt.format(d)}</span>
          <span className="text-4xl text-foreground mt-0.5">{dayFmt.format(d)}</span>
        </>
      ) : (
        <span className="font-body text-sm font-semibold text-muted-foreground">TBA</span>
      )}
    </div>
  );
};

export default EventDateTile;
