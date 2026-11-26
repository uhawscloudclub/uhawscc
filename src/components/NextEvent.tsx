import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, ExternalLink } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { selectNextEvent } from '@/components/ProofStrip';
import { EXTERNAL_LINKS } from '@/config/externalLinks';
import { PAST_EVENTS, formatEventDay } from '@/data/pastEvents';

/**
 * "Next up" on the homepage. Never renders an empty slot:
 *  - an upcoming dated event → title, date, RSVP on Meetup;
 *  - none scheduled, or the feed is down → the most recent past event as proof
 *    the club is active, plus a way to get notified on Meetup.
 * Uses the same Houston-day rule as the Events page (via selectNextEvent).
 */
const NextEvent = () => {
  const { data: events, isLoading, isError } = useEvents();
  const next = selectNextEvent(events);
  const lastEvent = PAST_EVENTS[0];

  return (
    <section aria-labelledby="next-event-heading" className="relative z-10 border-t border-border py-12">
      <div className="container mx-auto px-6">
        <h2 id="next-event-heading" className="font-heading font-bold text-2xl text-foreground mb-4">
          Next up
        </h2>

        {isLoading ? (
          <div className="space-y-3 animate-pulse motion-reduce:animate-none" aria-hidden="true">
            <div className="h-5 w-3/5 max-w-md bg-muted rounded" />
            <div className="h-4 w-2/5 max-w-xs bg-muted rounded" />
          </div>
        ) : next ? (
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-heading font-semibold text-lg text-foreground leading-snug">{next.title}</p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {next.date}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href={next.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`RSVP on Meetup for ${next.title}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded bg-primary text-primary-foreground font-semibold text-sm transition-opacity duration-150 hover:opacity-90"
              >
                RSVP on Meetup
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
              <Link to="/events" className="inline-flex items-center gap-1.5 text-sm text-primary py-2">
                All events
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-[60ch]">
            <p className="text-base text-muted-foreground leading-relaxed">
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
                className="inline-flex items-center gap-2 px-5 py-3 rounded bg-primary text-primary-foreground font-semibold text-sm transition-opacity duration-150 hover:opacity-90"
              >
                Get notified on Meetup
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </a>
              <Link to="/events" className="inline-flex items-center gap-1.5 text-sm text-primary py-2">
                See past events
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NextEvent;
