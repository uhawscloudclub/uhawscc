import { useEffect, useRef, useState } from 'react';
import PageLayout from '@/components/PageLayout';
import Mascot from '@/components/Mascot';
import PixelIcon from '@/components/PixelIcon';
import EventDateTile from '@/components/EventDateTile';
import { EXTERNAL_LINKS } from '@/config/externalLinks';
import { useEvents } from '@/hooks/useEvents';
import { PAST_EVENTS, formatEventDay, semesterOf } from '@/data/pastEvents';
import { flyerFor } from '@/data/eventFlyers';
import { hasValidEventDate, isUpcomingEvent } from '../../server/eventDates.js';
import SkySparkles from '@/components/SkySparkles';

// ── Loading skeleton ──────────────────────────────────────────────────────────
const EventSkeleton = () => (
  <div className="px-panel p-5 flex gap-4 animate-pulse motion-reduce:animate-none" aria-hidden="true">
    <div className="w-16 h-[4.25rem] bg-muted shrink-0" />
    <div className="flex-1 space-y-3 pt-1">
      <div className="h-5 w-4/5 bg-muted" />
      <div className="h-4 w-2/5 bg-muted" />
      <div className="h-4 w-full bg-muted" />
    </div>
  </div>
);

// ── Error / fallback state ────────────────────────────────────────────────────
const EventsError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col sm:flex-row gap-6 items-start">
    <Mascot size={72} className="shrink-0" />
    <div className="flex flex-col items-start gap-4">
      <div>
        <p className="font-bold text-lg text-foreground mb-1">
          Couldn't load events right now
        </p>
        <p className="text-base text-muted-foreground max-w-[50ch]">
          Meetup didn't answer. Try again, or see every event on Meetup directly.
        </p>
      </div>
      <div className="flex items-center gap-x-6 gap-y-3 flex-wrap">
        <button type="button" onClick={onRetry} className="px-button">
          Try again
        </button>
        <a href={EXTERNAL_LINKS.meetup} target="_blank" rel="noopener noreferrer" className="px-link">
          View on Meetup
        </a>
      </div>
      <p className="text-sm text-muted-foreground">
        Still stuck? Email us at{' '}
        <a href={`mailto:${EXTERNAL_LINKS.emailContact}`} className="text-primary underline underline-offset-4">
          {EXTERNAL_LINKS.emailContact}
        </a>
        .
      </p>
    </div>
  </div>
);

// ── No upcoming events state ──────────────────────────────────────────────────
// The mascot's one job outside the homepage: making an empty list feel like
// "between missions", with a clear next step.
const NoUpcomingEvents = () => (
  <div className="flex flex-col sm:flex-row gap-6 items-start">
    <Mascot size={72} className="shrink-0" />
    <div className="flex flex-col items-start gap-4">
      <div>
        <p className="font-bold text-lg text-foreground mb-1">
          No upcoming events yet
        </p>
        <p className="text-base text-muted-foreground max-w-[50ch]">
          We're planning the next one. Follow the group on Meetup to get notified
          the moment it's posted, and look through what we've done below.
        </p>
      </div>
      <a href={EXTERNAL_LINKS.meetup} target="_blank" rel="noopener noreferrer" className="px-button">
        Follow on Meetup
      </a>
    </div>
  </div>
);

// ── Past events ───────────────────────────────────────────────────────────────
// Cards with each event's Meetup flyer, newest first. The first few show by
// default; "Show all" reveals the rest and moves focus to the first newly
// shown card. Stays visible when the live feed is empty or down, so a
// first-time visitor can still see the club is active.
const PAST_PREVIEW = 6;

const PastEvents = () => {
  const [showAll, setShowAll] = useState(false);
  const firstHiddenRef = useRef<HTMLAnchorElement>(null);
  const shown = showAll ? PAST_EVENTS : PAST_EVENTS.slice(0, PAST_PREVIEW);
  const hiddenCount = PAST_EVENTS.length - PAST_PREVIEW;

  const expand = () => {
    setShowAll(true);
    requestAnimationFrame(() => firstHiddenRef.current?.focus());
  };

  return (
    <section aria-labelledby="past-events-heading" className="relative border-t border-border py-16">
      <div className="container mx-auto px-6">
        <h2 id="past-events-heading" className="text-foreground mb-3">
          Past events
        </h2>
        <p className="text-base text-muted-foreground max-w-[55ch] mb-10">
          Workshops, career nights, and study cohorts from the last two semesters.
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shown.map((ev, i) => {
            const flyer = flyerFor(ev.meetupUrl);
            return (
              <li key={ev.meetupUrl} className="px-panel px-event-card">
                {flyer && (
                  // The flyer repeats the title and date shown below, so it is decorative.
                  <img src={flyer} alt="" width={800} height={450} loading="lazy" decoding="async" />
                )}
                <div className="flex flex-col flex-1 p-5">
                  <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                    <time dateTime={ev.date}>{formatEventDay(ev.date)}</time>
                    <span className="px-chip ml-0">{ev.format}</span>
                    <span className="sr-only">, {semesterOf(ev.date)}</span>
                  </p>
                  <h3 className="font-bold text-foreground text-lg leading-snug mt-2">{ev.title}</h3>
                  {ev.place && <p className="text-sm text-muted-foreground mt-1">{ev.place}</p>}
                  <p className="text-base text-muted-foreground leading-relaxed mt-2">{ev.summary}</p>
                  <div className="mt-auto pt-3">
                    <a
                      ref={i === PAST_PREVIEW ? firstHiddenRef : undefined}
                      href={ev.meetupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Event page on Meetup for ${ev.title}`}
                      className="px-link text-sm"
                    >
                      Event page on Meetup
                      <PixelIcon name="external" size={12} />
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {!showAll && hiddenCount > 0 && (
          <div className="mt-10 flex justify-center">
            <button type="button" onClick={expand} className="px-button">
              Show all {PAST_EVENTS.length} past events
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const EventsPage = () => {
  const { data: events, isLoading, isFetching, isError, refetch } = useEvents();

  // Drives a persistent status announcement (see the role="status" region
  // below) for every fetch — including a manual Refresh or an automatic
  // retry that happens to return data identical to what was already shown,
  // which wouldn't otherwise produce any visible DOM change to announce.
  const [statusMessage, setStatusMessage] = useState('');
  const wasFetching = useRef(false);
  // True while the very first load is in flight, so a failure there is
  // announced as "couldn't load", not "couldn't refresh" (nothing was shown yet).
  const wasInitialLoad = useRef(false);

  useEffect(() => {
    if (isFetching) {
      if (isLoading) {
        wasInitialLoad.current = true;
      } else {
        setStatusMessage('Checking for updated events…');
      }
      wasFetching.current = true;
    } else if (wasFetching.current) {
      if (wasInitialLoad.current) {
        setStatusMessage(isError ? "Couldn't load events." : 'Events loaded.');
      } else {
        setStatusMessage(isError ? "Couldn't refresh events." : 'Events refreshed.');
      }
      wasFetching.current = false;
      wasInitialLoad.current = false;
    }
  }, [isFetching, isLoading, isError]);

  // Re-check dates in the browser too: a tab left open overnight, or a
  // response cached by React Query, must not keep showing yesterday's event.
  // Same rule as the server (server/eventDates.js), Houston calendar day.
  const now = new Date();
  const upcoming = events?.filter((e) => e.status === 'upcoming' && isUpcomingEvent(e, now)) ?? [];
  const hasUpcoming = upcoming.length > 0;

  return (
    <PageLayout>

      {/* Persistent status announcer, deliberately OUTSIDE the aria-busy
          content region below: a message nested inside that region can
          vanish the moment isFetching flips back to false — before a screen
          reader gets a chance to announce it. role="status" has an implicit
          polite live region, so this survives across every fetch lifecycle
          (initial load, retry, manual refresh) regardless of whether the
          visible content actually changed. */}
      <p role="status" aria-atomic="true" className="sr-only">{statusMessage}</p>

      {/* ── Header ── */}
      <section className="relative overflow-hidden px-sky px-sky-high">
      <SkySparkles />
        <div className="container mx-auto px-6 pt-28 sm:pt-36 pb-12 relative max-w-4xl">
          <h1 className="text-foreground mb-4" style={{ fontSize: 'clamp(3rem, 9vw, 5rem)' }}>
            Events
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-[52ch]">
            Workshops, career nights, and study sessions. Free for UH students.
            RSVP on Meetup to save a seat; that's also where the time and room are.
          </p>
          <a href={EXTERNAL_LINKS.meetup} target="_blank" rel="noopener noreferrer" className="px-link mt-2">
            See all events on Meetup
          </a>
        </div>
      </section>

      {/* ── Upcoming ── */}
      <section aria-labelledby="upcoming-heading" className="relative pb-16">
        <div className="container mx-auto px-6 max-w-4xl" aria-live="polite" aria-busy={isFetching}>
          <h2 id="upcoming-heading" className="text-foreground mb-6">Upcoming</h2>

          {/* Loading */}
          {isLoading && (
            <div className="space-y-5">
              {[0, 1].map((i) => <EventSkeleton key={i} />)}
            </div>
          )}

          {/* Error */}
          {isError && <EventsError onRetry={() => refetch()} />}

          {/* Loaded — no upcoming */}
          {!isLoading && !isError && !hasUpcoming && <NoUpcomingEvents />}

          {/* Loaded — has upcoming events: the raised panels on this page */}
          {!isLoading && !isError && hasUpcoming && (
            <ul className="space-y-6">
              {upcoming.map((ev) => (
                <li key={ev.id} className="px-panel p-5 sm:p-6">
                  <div className="flex gap-4 sm:gap-5 items-start">
                    <EventDateTile rawDate={ev.rawDate} />
                    <div className="min-w-0">
                      <h3 className="text-lg text-foreground leading-snug">{ev.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {hasValidEventDate(ev.rawDate) ? ev.date : 'Date and time on Meetup'}
                      </p>
                    </div>
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-[62ch] mt-4">
                    {ev.description}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <a
                      href={ev.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`RSVP on Meetup for ${ev.title}`}
                      className="px-button"
                    >
                      RSVP on Meetup
                    </a>
                    <p className="text-sm text-muted-foreground">Time and room are on the Meetup page.</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Manual refresh — deliberately makes no freshness/liveness claim:
              a response here can be a 15-min-cached hit or a stale fallback
              served after an upstream failure, so a "last updated"/"live"
              label would misrepresent the data. Omitted while the error
              state's own Try Again is already showing, to avoid a duplicate
              control. */}
          {!isLoading && !isError && (
            <p className="mt-8 text-sm text-muted-foreground">
              <button type="button" onClick={() => refetch()} className="underline underline-offset-4 py-2">
                Refresh
              </button>
            </p>
          )}

        </div>
      </section>

      <PastEvents />

    </PageLayout>
  );
};

export default EventsPage;
