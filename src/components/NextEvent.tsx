import { Link } from 'react-router-dom';
import { useEvents } from '@/hooks/useEvents';
import { selectNextEvent } from '@/components/ProofStrip';
import EventDateTile from '@/components/EventDateTile';
import { EXTERNAL_LINKS } from '@/config/externalLinks';
import { PAST_EVENTS, formatEventDay } from '@/data/pastEvents';

/**
 * "Next up" on the homepage, the one raised pixel panel on the page. Never an
 * empty slot:
 *  - an upcoming dated event → date tile, title, date, RSVP on Meetup;
 *  - none scheduled, or the feed is down → the most recent past event as proof
 *    the club is active, plus a way to get notified on Meetup.
 * Uses the same Houston-day rule as the Events page (via selectNextEvent).
 */
const NextEvent = () => {
  const { data: events, isLoading, isError } = useEvents();
  const next = selectNextEvent(events);
  const lastEvent = PAST_EVENTS[0];

  return (
    <section aria-labelledby="next-event-heading" className="px-panel px-window max-w-2xl">
      <div className="px-titlebar">
        <h2 id="next-event-heading">Next up</h2>
        {/* Window chrome, decorative only: nothing to minimise or close. */}
        <div className="px-winmarks" aria-hidden="true"><span /><span /><span /></div>
      </div>
      <div className="px-window-body">

      {isLoading ? (
        <div className="flex gap-4 animate-pulse motion-reduce:animate-none" aria-hidden="true">
          <div className="w-16 h-[4.25rem] bg-muted" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-5 w-4/5 bg-muted" />
            <div className="h-4 w-2/5 bg-muted" />
          </div>
        </div>
      ) : next ? (
        <div className="flex flex-col gap-5">
          <div className="flex gap-4 items-start">
            <EventDateTile rawDate={next.rawDate} />
            <div>
              <p className="font-bold text-lg text-foreground leading-snug">{next.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{next.date}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={next.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`RSVP on Meetup for ${next.title}`}
              className="px-button"
            >
              RSVP on Meetup
            </a>
            <Link to="/events" className="px-link">All events</Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <p className="text-base text-muted-foreground leading-relaxed max-w-[55ch]">
            {isError
              ? "We couldn't check Meetup for the next event right now."
              : 'Nothing is scheduled yet. We post new events on Meetup first.'}{' '}
            {lastEvent && (
              <>
                Most recently: <span className="text-foreground">{lastEvent.title}</span>
                {' '}on <time dateTime={lastEvent.date}>{formatEventDay(lastEvent.date)}</time>.
              </>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={EXTERNAL_LINKS.meetup}
              target="_blank"
              rel="noopener noreferrer"
              className="px-button"
            >
              Get notified on Meetup
            </a>
            <Link to="/events" className="px-link">See past events</Link>
          </div>
        </div>
      )}
      </div>
    </section>
  );
};

export default NextEvent;
